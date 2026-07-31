import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const preload = fileURLToPath(new URL("./preview-network-fallback.cjs", import.meta.url));
const viteCli = fileURLToPath(new URL("../node_modules/vite/bin/vite.js", import.meta.url));

const child = spawn(
  process.execPath,
  ["--require", preload, viteCli, "preview", "--host", "0.0.0.0"],
  {
    stdio: "inherit",
    env: process.env,
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
