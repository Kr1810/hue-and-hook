/**
 * Tiny JSON-file repository.
 *
 * - readJson(name)            → parsed contents of data/<name>
 * - writeJson(name, data)     → atomic write (temp file + rename)
 * - updateJson(name, fn)      → read-modify-write, serialised per file so two
 *                               simultaneous requests can't clobber each other
 *
 * This is the only module that touches the data files. To move to a real
 * database later, re-implement these three functions and nothing else changes.
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { config } from "../config.js";

const DATA_DIR = config.paths.data;

/** Resolve a data file name, refusing anything that escapes the data dir. */
function resolveFile(name) {
  const file = path.resolve(DATA_DIR, name);
  if (!file.startsWith(DATA_DIR + path.sep)) {
    throw new Error(`Refusing to access file outside data dir: ${name}`);
  }
  return file;
}

export async function readJson(name, fallback = null) {
  try {
    const raw = await fs.readFile(resolveFile(name), "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT" && fallback !== null) return fallback;
    throw err;
  }
}

/** rename() can briefly fail on Windows if a virus scanner/indexer holds the file. */
async function renameWithRetry(from, to, attempts = 5) {
  for (let i = 1; ; i++) {
    try {
      return await fs.rename(from, to);
    } catch (err) {
      if (i >= attempts || !["EPERM", "EACCES", "EBUSY"].includes(err.code)) throw err;
      await new Promise((r) => setTimeout(r, 25 * i));
    }
  }
}

export async function writeJson(name, data) {
  const file = resolveFile(name);
  const tmp = `${file}.${process.pid}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  try {
    await renameWithRetry(tmp, file);
  } catch (err) {
    await fs.rm(tmp, { force: true });
    throw err;
  }
}

// One promise chain per file = writes to the same file run one at a time.
const queues = new Map();

export function updateJson(name, updater, fallback = []) {
  const previous = queues.get(name) ?? Promise.resolve();
  const next = previous
    .catch(() => {}) // a failed earlier update must not block later ones
    .then(async () => {
      const current = await readJson(name, fallback);
      const { data, result } = await updater(current);
      await writeJson(name, data);
      return result;
    });
  queues.set(name, next);
  return next;
}
