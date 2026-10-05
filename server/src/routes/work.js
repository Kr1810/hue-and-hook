import { Router } from "express";
import { loadCollection, findWithNeighbours } from "../lib/markdown.js";
import { HttpError } from "../middleware/errorHandler.js";

const router = Router();

/** GET /api/work — case-study summaries, newest first. */
router.get("/", async (req, res) => {
  const items = await loadCollection("work");
  res.json(
    items.map(({ slug, title, client, category, year, cover, coverAlt, summary, colors = [], results = [] }) => ({
      slug,
      title,
      client,
      category,
      year,
      cover,
      coverAlt,
      summary,
      colors,
      headline: results[0] ?? null,
    }))
  );
});

/** GET /api/work/:slug — full case study + prev/next. */
router.get("/:slug", async (req, res) => {
  const found = await findWithNeighbours("work", req.params.slug);
  if (!found) throw new HttpError(404, "That case study doesn't exist.");
  res.json({ ...found.item, prev: found.prev, next: found.next });
});

export default router;
