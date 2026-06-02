#!/usr/bin/env node
/** One-shot fix when you see "Internal Server Error" — same as `pnpm dev` but explicit. */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
spawn("node", ["scripts/dev.mjs"], { cwd: root, stdio: "inherit", env: process.env });
