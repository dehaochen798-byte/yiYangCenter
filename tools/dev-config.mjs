import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const localConfigPath = path.join(rootDir, "tools", "dev-projects.local.json");

function readLocalConfig() {
  if (!existsSync(localConfigPath)) {
    return {};
  }

  try {
    return JSON.parse(readFileSync(localConfigPath, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read tools/dev-projects.local.json: ${message}`);
  }
}

function resolveProjectDir(value, fallback) {
  const rawPath = value || fallback;
  return path.isAbsolute(rawPath) ? rawPath : path.resolve(rootDir, rawPath);
}

const localConfig = readLocalConfig();

export const projectDirs = {
  root: rootDir,
  vue: resolveProjectDir(
    process.env.YIYANG_VUE_DIR || process.env.YIYANG_FRONTEND_DIR || localConfig.vueDir,
    "YiYang_Vue",
  ),
  node: resolveProjectDir(
    process.env.YIYANG_NODE_DIR || process.env.YIYANG_BACKEND_DIR || localConfig.nodeDir,
    "YiYang_Node",
  ),
};

export function getProjectDir(project) {
  const projectDir = projectDirs[project];

  if (!projectDir) {
    throw new Error(`Unknown project "${project}"`);
  }

  if (!existsSync(path.join(projectDir, "package.json"))) {
    throw new Error(`Cannot find ${project} package.json at ${projectDir}`);
  }

  return projectDir;
}

export function printProjectDirs() {
  process.stdout.write(`[dev:config] Vue project: ${projectDirs.vue}\n`);
  process.stdout.write(`[dev:config] Node project: ${projectDirs.node}\n`);
}
