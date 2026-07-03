import { spawn } from "node:child_process";
import { ensureRedis } from "./ensure-redis.mjs";
import { getProjectDir, printProjectDirs } from "./dev-config.mjs";

const services = [
  {
    name: "vue",
    command: "npm",
    args: ["run", "dev"],
    cwd: getProjectDir("vue"),
    color: "\x1b[32m",
  },
  {
    name: "node",
    command: "node",
    args: ["tools/dev-node-services.mjs"],
    cwd: process.cwd(),
    color: "\x1b[36m",
  },
];

const resetColor = "\x1b[0m";
const children = new Set();
let shuttingDown = false;
let hasPrintedVueUrl = false;

await ensureRedis();
printProjectDirs();

function stripAnsi(text) {
  return text.replace(/\x1B\[[0-9;]*m/g, "");
}

function stripTerminalControl(text) {
  return text.replace(/\x1Bc/g, "").replace(/\x1B\[[0-9;?]*[JKHf]/g, "");
}

function printVueAccessHint(line) {
  if (hasPrintedVueUrl) {
    return;
  }

  const normalizedLine = stripAnsi(line);
  const match = normalizedLine.match(/Local:\s+(http:\/\/[^\s]+)/);

  if (!match) {
    return;
  }

  hasPrintedVueUrl = true;
  process.stdout.write(
    `\n${services[0].color}[tip]${resetColor} Frontend ready: ${match[1]}\n\n`,
  );
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

      const normalizedLine = stripTerminalControl(line);

      if (serviceName === "vue") {
        printVueAccessHint(normalizedLine);
      }

      process.stdout.write(
        `${color}[${serviceName}]${resetColor} ${normalizedLine}\n`,
      );
    }
  });

  stream.on("end", () => {
    if (buffer) {
      const normalizedBuffer = stripTerminalControl(buffer);

      if (serviceName === "vue") {
        printVueAccessHint(normalizedBuffer);
      }

      process.stdout.write(
        `${color}[${serviceName}]${resetColor} ${normalizedBuffer}\n`,
      );
    }
  });
}

function spawnService(service) {
  const command = process.platform === "win32" ? "cmd.exe" : service.command;
  const args =
    process.platform === "win32"
      ? ["/d", "/s", "/c", `${service.command} ${service.args.join(" ")}`]
      : service.args;

  const child = spawn(command, args, {
    cwd: service.cwd,
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
