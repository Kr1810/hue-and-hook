import { Router } from "express";
import crypto from "node:crypto";
import { updateJson } from "../lib/store.js";
import { contactSchema, isSpam } from "../validation/schemas.js";
import { formLimiter } from "../middleware/rateLimits.js";

const router = Router();

/** POST /api/contact — { name, email, projectType, budget, timeline?, message } */
router.post("/", formLimiter, async (req, res) => {
  const input = contactSchema.parse(req.body ?? {});

  if (isSpam(input)) return res.status(201).json({ status: "received" });

  const { website: _honeypot, ...fields } = input;
  const inquiry = {
    id: crypto.randomUUID(),
    ...fields,
    receivedAt: new Date().toISOString(),
  };

  await updateJson("inquiries.json", (inquiries) => ({ data: [...inquiries, inquiry] }));

  console.info(
    `[contact] New ${inquiry.projectType} inquiry from ${inquiry.name} <${inquiry.email}> (${inquiry.budget})`
  );

  // TODO(email): send a notification email here. Plug in a provider such as
  // Resend, Postmark or SES, e.g. `await mailer.send({ to: site.email, ... })`.
  // Keep it after the write above so an email outage never loses an inquiry.

  res.status(201).json({ status: "received" });
});

export default router;
