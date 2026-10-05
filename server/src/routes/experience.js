import { Router } from "express";
import { readJson } from "../lib/store.js";

const router = Router();

/** GET /api/experience — { experience: [...newest first] } */
router.get("/", async (req, res) => {
  const { experience = [] } = await readJson("experience.json", {});
  res.json({ experience });
});

export default router;
