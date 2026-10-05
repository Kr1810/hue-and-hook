/**
 * Express app: security middleware, API routes, errors.
 * Static file serving for production is mounted by index.js through the
 * `mountClient` hook so it still sits in front of the error handler.
 */
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { config } from "./config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiNotFound } from "./middleware/notFound.js";
import siteRoutes from "./routes/site.js";
import workRoutes from "./routes/work.js";
import experienceRoutes from "./routes/experience.js";
import contactRoutes from "./routes/contact.js";

/**
 * @param {object}   [options]
 * @param {string[]} [options.scriptHashes] CSP hashes for inline <script>s in index.html
 * @param {(app: import("express").Express) => void} [options.mountClient]
 */
export function createApp({ scriptHashes = [], mountClient } = {}) {
  const app = express();

  app.disable("x-powered-by");
  if (config.trustProxy) app.set("trust proxy", config.trustProxy);

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "default-src": ["'self'"],
          "script-src": ["'self'", ...scriptHashes],
          // 'unsafe-inline' styles: framer-motion animates via inline styles.
          "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
          "img-src": ["'self'", "data:"],
          "connect-src": ["'self'"],
          "worker-src": ["'self'", "blob:"],
          "object-src": ["'none'"],
          "frame-ancestors": ["'none'"],
          "form-action": ["'self'"],
          "upgrade-insecure-requests": null, // let the host/proxy handle HTTPS
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(compression());

  /* ---- API ---- */
  const api = express.Router();
  api.use(cors({ origin: config.clientOrigin }));
  api.use(express.json({ limit: "20kb" }));
  api.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });

  api.get("/health", (req, res) => {
    res.json({ status: "ok", env: config.env, uptime: Math.round(process.uptime()) });
  });
  api.use("/site", siteRoutes);
  api.use("/work", workRoutes);
  api.use("/experience", experienceRoutes);
  api.use("/contact", contactRoutes);
  api.use(apiNotFound);

  app.use("/api", api);

  /* ---- Built client (production) ---- */
  if (mountClient) mountClient(app);

  app.use(errorHandler);
  return app;
}
