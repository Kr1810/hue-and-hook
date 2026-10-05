import { useEffect, useRef, useState } from "react";

/**
 * Copies `value` to the clipboard with "Copied ✓" feedback. Uses the
 * Clipboard API, falls back to a hidden textarea + execCommand, and reports
 * failure politely instead of throwing.
 */
async function writeClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export default function CopyButton({ value, label, className = "" }) {
  const [state, setState] = useState("idle"); // idle | copied | failed
  const timer = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    if (!value) return;
    const ok = await writeClipboard(value);
    setState(ok ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2000);
  };

  return (
    <button type="button" className={className} onClick={copy} disabled={!value} aria-label={`Copy ${label}`}>
      <span aria-live="polite">{state === "copied" ? "Copied ✓" : state === "failed" ? "Press Ctrl+C" : "Copy"}</span>
    </button>
  );
}
