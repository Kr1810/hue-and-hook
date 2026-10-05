import { Router } from "express";
import { readJson } from "../lib/store.js";
import { config } from "../config.js";

const router = Router();

/** GET /api/site — name, role, tagline, location, status, contact details, services, tools, "currently" line. */
router.get("/", async (req, res) => {
  const site = await readJson("site.json");
  // siteUrl comes from env so canonical URLs are right in every environment.
  res.json({ ...site, siteUrl: config.siteUrl });
});

export default router;
