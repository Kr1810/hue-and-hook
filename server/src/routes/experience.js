import { Router } from "express";
import { readJson } from "../lib/store.js";

const router = Router();

/** GET /api/experience — { experience: [...newest first], education: [...] } */
router.get("/", async (req, res) => {
  const { experience = [], education = [] } = await readJson("experience.json", {});
  res.json({ experience, education });
});

export default router;
