import { useRef, useState } from "react";
import FormField, { Honeypot } from "./FormField.jsx";
import { api } from "../lib/api.js";
import { BUDGETS, PROJECT_TYPES, fieldErrorsFrom, focusFirstError, validateContact } from "../lib/validate.js";

/** Project inquiry form → POST /api/contact. */
const EMPTY = { name: "", email: "", projectType: "", budget: "", timeline: "", message: "", website: "" };

export default function ContactForm() {
  const formRef = useRef(null);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [message, setMessage] = useState("");

  const update = (field) => (event) => {
    const { value } = event.target;
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  async function submit(event) {
    event.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    if (Object.keys(found).length) {
      focusFirstError(formRef.current);
      return;
    }

    setStatus("sending");
    setMessage("");
    try {
      await api.sendInquiry(values);
      setStatus("sent");
      setValues(EMPTY);
    } catch (err) {
      setStatus("error");
      setMessage(err.message);
      const fieldErrors = fieldErrorsFrom(err.details);
      if (Object.keys(fieldErrors).length) {
        setErrors(fieldErrors);
        focusFirstError(formRef.current);
      }
    }
  }

  if (status === "sent") {
    return (
      <div className="form__status form__status--success" role="status">
        <p>Thank you! Your message is in. I read every one myself and reply within two working days.</p>
        <p style={{ marginTop: "0.75rem" }}>
          <button type="button" className="button" onClick={() => setStatus("idle")}>
            Send another
          </button>
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} className="form" onSubmit={submit} noValidate aria-label="Project inquiry">
      <div className="form__grid">
        <FormField label="Your name" error={errors.name}>
          {(props) => <input {...props} name="name" autoComplete="name" value={values.name} onChange={update("name")} />}
        </FormField>
        <FormField label="Email" error={errors.email}>
          {(props) => (
            <input {...props} type="email" name="email" autoComplete="email" value={values.email} onChange={update("email")} />
          )}
        </FormField>
        <FormField label="Project type" error={errors.projectType}>
          {(props) => (
            <select {...props} name="projectType" value={values.projectType} onChange={update("projectType")}>
              <option value="">Choose one…</option>
              {PROJECT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField label="Budget" error={errors.budget}>
          {(props) => (
            <select {...props} name="budget" value={values.budget} onChange={update("budget")}>
              <option value="">Choose a range…</option>
              {BUDGETS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          )}
        </FormField>
      </div>

      <FormField label="Timeline (optional)" hint="e.g. “launching in March” or “flexible”" error={errors.timeline}>
        {(props) => <input {...props} name="timeline" value={values.timeline} onChange={update("timeline")} />}
      </FormField>

      <FormField
        label="Tell me about it"
        hint="What you're making, who it's for, and what success looks like."
        error={errors.message}
      >
        {(props) => <textarea {...props} name="message" value={values.message} onChange={update("message")} />}
      </FormField>

      <Honeypot value={values.website} onChange={update("website")} />

      {status === "error" && message && (
        <p className="form__status" role="alert">
          {message}
        </p>
      )}

      <p>
        <button className="button" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send message"} <span aria-hidden="true">→</span>
        </button>
      </p>
    </form>
  );
}
