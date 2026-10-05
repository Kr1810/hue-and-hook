/**
 * Environment parsing. Everything has a default so the app runs with no .env.
 * The .env file lives at the repo root (shared by client + server).
 */
import { fileURLToPath } from "node:url";
import path from "node:path";
import dotenv from "dotenv";

const here = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(here, "..");
const repoRoot = path.resolve(serverRoot, "..");

dotenv.config({ path: path.join(repoRoot, ".env"), quiet: true });

// `npm start` passes --production so we don't need cross-env on Windows.
if (process.argv.includes("--production")) process.env.NODE_ENV = "production";

const env = process.env.NODE_ENV || "development";
const port = Number.parseInt(process.env.PORT ?? "", 10) || 5000;

const trimSlash = (url) => String(url).replace(/\/+$/, "");

export const config = Object.freeze({
  env,
  isProd: env === "production",
  port,
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  siteUrl: trimSlash(process.env.SITE_URL || `http://localhost:${port}`),
  trustProxy: Number.parseInt(process.env.TRUST_PROXY ?? "0", 10) || 0,
  paths: {
    data: path.join(serverRoot, "data"),
    clientDist: path.join(repoRoot, "client", "dist"),
  },
});
