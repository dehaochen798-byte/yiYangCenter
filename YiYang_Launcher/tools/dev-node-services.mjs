import { spawn } from "node:child_process";
import { ensureRedis } from "./ensure-redis.mjs";
import { getProjectDir } from "./dev-config.mjs";
import {
  backendPorts,
  findListeningProcesses,
  formatPortConflicts,
} from "./dev-port-utils.mjs";

const nodeDir = getProjectDir("node");
const services = [
  {
    name: "gateway",
    script: "start:gateway:dev",
    color: "\x1b[36m",
  },
  {
    name: "service-auth",
    script: "start:service-auth:dev",
    color: "\x1b[33m",
  },
  {
    name: "service-care",
    script: "start:service-care:dev",
    color: "\x1b[35m",
  },
  {
    name: "message-consumer",
    script: "start:message-consumer:dev",
    color: "\x1b[32m",
  },
];

const resetColor = "\x1b[0m";
const children = new Set();
await ensureRedis();
const existingListeners = findListeningProcesses(backendPorts);

if (existingListeners.length) {
  process.stderr.write("[dev:node] Backend dev ports are already in use:\n");
  process.stderr.write(`${formatPortConflicts(existingListeners)}\n`);
  process.stderr.write(
    '[dev:node] Run "npm run dev:kill" or "npm run dev:reset" and try again.\n',
  );
  process.exit(1);
}

function stripTerminalControl(text) {
  return text.replace(/\x1Bc/g, "").replace(/\x1B\[[0-9;?]*[JKHf]/g, "");
}

function prefixOutput(serviceName, color, stream) {
  let buffer = "";

  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line) {
        continue;
      }

      process.stdout.write(
        `${color}[${serviceName}]${resetColor} ${stripTerminalControl(line)}\n`,
      );
    }
  });

  stream.on("end", () => {
    if (buffer) {
      process.stdout.write(
        `${color}[${serviceName}]${resetColor} ${stripTerminalControl(buffer)}\n`,
      );
    }
  });
}

function spawnService(service) {
  const command = process.platform === "win32" ? "cmd.exe" : "npm";
  const args =
    process.platform === "win32"
      ? ["/d", "/s", "/c", `npm run ${service.script}`]
      : ["run", service.script];

  const child = spawn(command, args, {
    cwd: nodeDir,
    stdio: ["inherit", "pipe", "pipe"],
    env: process.env,
  });

  children.add(child);
  prefixOutput(service.name, service.color, child.stdout);
  prefixOutput(service.name, service.color, child.stderr);

  child.on("exit", (code, signal) => {
    children.delete(child);

    if (signal) {
      process.stdout.write(
        `${service.color}[${service.name}]${resetColor} exited with signal ${signal}\n`,
      );
      return;
    }

    process.stdout.write(
      `${service.color}[${service.name}]${resetColor} exited with code ${code ?? 0}\n`,
    );

    if (code && code !== 0) {
      shutdown(code);
    }
  });
}

let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    child.kill("SIGINT");
  }

  setTimeout(() => {
    for (const child of children) {
      child.kill("SIGTERM");
    }

    process.exit(exitCode);
  }, 200);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

for (const service of services) {
  spawnService(service);
}
