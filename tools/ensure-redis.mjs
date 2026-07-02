import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Socket } from "node:net";

const redisPort = Number(process.env.REDIS_PORT || 6379);
const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisContainerName = process.env.REDIS_CONTAINER_NAME || "yiyang-redis";

export async function ensureRedis() {
  if (await canConnect(redisHost, redisPort)) {
    process.stdout.write(
      `[redis] Redis is already listening on ${redisHost}:${redisPort}\n`,
    );
    return true;
  }

  if (!hasDocker()) {
    printManualHint("Docker is not available");
    return false;
  }

  try {
    const containerExists = docker([
      "ps",
      "-a",
      "--filter",
      `name=^/${redisContainerName}$`,
      "--format",
      "{{.Names}}",
    ])
      .split(/\r?\n/)
      .some((name) => name.trim() === redisContainerName);

    if (containerExists) {
      docker(["start", redisContainerName]);
    } else {
      docker([
        "run",
        "-d",
        "--name",
        redisContainerName,
        "-p",
        `${redisPort}:6379`,
        "redis:7-alpine",
      ]);
    }
  } catch (error) {
    printManualHint(`Docker Redis startup failed: ${getErrorSummary(error)}`);
    return false;
  }

  if (await waitForRedis(redisHost, redisPort)) {
    process.stdout.write(
      `[redis] Redis container "${redisContainerName}" is ready on ${redisHost}:${redisPort}\n`,
    );
    return true;
  }

  printManualHint("Redis container did not become ready in time");
  return false;
}

function canConnect(host, port) {
  return new Promise((resolve) => {
    const socket = new Socket();

    socket.setTimeout(800);
    socket.once("connect", () => {
      socket.end();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function waitForRedis(host, port) {
  for (let index = 0; index < 20; index += 1) {
    if (await canConnect(host, port)) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  return false;
}

function hasDocker() {
  const result = spawnSync("docker", ["--version"], {
    stdio: "ignore",
  });

  return result.status === 0;
}

function docker(args) {
  return execFileSync("docker", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function printManualHint(reason) {
  process.stderr.write(
    `[redis] ${reason}. Message broker events will fail until Redis is started.\n`,
  );
  process.stderr.write(
    `[redis] Start it manually: docker run -d --name ${redisContainerName} -p ${redisPort}:6379 redis:7-alpine\n`,
  );
}

function getErrorSummary(error) {
  if (!error || typeof error !== "object") {
    return String(error);
  }

  const execError = error;
  const stderr =
    typeof execError.stderr === "string"
      ? execError.stderr
      : Buffer.isBuffer(execError.stderr)
        ? execError.stderr.toString("utf8")
        : "";
  const message = stderr.trim() || (error instanceof Error ? error.message : String(error));

  return message.split(/\r?\n/)[0];
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await ensureRedis();
}
