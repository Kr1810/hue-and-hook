/**
 * Server bootstrap.
 * - Development: API only (Vite serves the client and proxies to us).
 * - Production:  also serves client/dist with long-lived caching for hashed
 *   assets and an SPA fallback to index.html. Unknown routes still get the
 *   SPA (which renders the 404 page) but with a real 404 status code.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import express from "express";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { loadCollection } from "./lib/markdown.js";

const { clientDist } = config.paths;
const indexFile = path.join(clientDist, "index.html");

/* ---- SPA route awareness (for correct 404 status codes) ---- */
const STATIC_ROUTES = new Set(["/", "/about", "/work", "/experience", "/contact"]);

async function routeExists(pathname) {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (STATIC_ROUTES.has(clean)) return true;
  const match = clean.match(/^\/work\/([\w-]+)$/);
  if (!match) return false;
  const items = await loadCollection("work");
  return items.some((item) => item.slug === match[1]);
}

/** sha256 hashes of inline scripts in index.html, for the CSP header. */
function inlineScriptHashes(html) {
  return [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(
    ([, body]) => `'sha256-${crypto.createHash("sha256").update(body).digest("base64")}'`
  );
}

function mountClient(app) {
  app.use(
    express.static(clientDist, {
      index: false,
      setHeaders(res, filePath) {
        // Vite fingerprints everything in /assets — cache it for a year.
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );

  const html = fs.readFileSync(indexFile, "utf8");

  app.use(async (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (req.path.startsWith("/api/")) return next();
    try {
      const exists = await routeExists(req.path);
      res
        .status(exists ? 200 : 404)
        .set("Cache-Control", "no-cache")
        .type("html")
        .send(html);
    } catch (err) {
      next(err);
    }
  });
}

/* ---- start ---- */
let scriptHashes = [];
let serveClient = false;

if (config.isProd) {
  if (fs.existsSync(indexFile)) {
    serveClient = true;
    scriptHashes = inlineScriptHashes(fs.readFileSync(indexFile, "utf8"));
  } else {
    console.warn("[server] client/dist not found. Run `npm run build` first. Serving the API only.");
  }
}

const app = createApp({ scriptHashes, mountClient: serveClient ? mountClient : undefined });

// Express 5 calls the listen callback with an error if the server can't start.
const server = app.listen(config.port, (err) => {
  if (err) {
    if (err.code === "EADDRINUSE") {
      console.error(`[server] Port ${config.port} is already in use. Set PORT in .env to use another.`);
    } else {
      console.error("[server] Failed to start:", err);
    }
    process.exit(1);
  }
  const mode = config.isProd ? "production" : "development";
  console.log(`[server] ${mode} → http://localhost:${config.port}${serveClient ? "" : " (API only)"}`);
});

function shutdown(signal) {
  console.log(`[server] ${signal} received, closing…`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
