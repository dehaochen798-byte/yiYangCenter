import { spawn } from "node:child_process";
import { getProjectDir } from "./dev-config.mjs";

const [, , project, script] = process.argv;

if (!project || !script) {
  process.stderr.write("Usage: node tools/run-project-script.mjs <vue|node> <script>\n");
  process.exit(1);
}

let projectDir;

try {
  projectDir = getProjectDir(project);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`[run-project-script] ${message}\n`);
  process.exit(1);
}

const command = process.platform === "win32" ? "cmd.exe" : "npm";
const args =
  process.platform === "win32"
    ? ["/d", "/s", "/c", `npm run ${script}`]
    : ["run", script];

const child = spawn(command, args, {
  cwd: projectDir,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
