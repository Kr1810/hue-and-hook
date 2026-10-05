import { useId } from "react";

/**
 * Label + control + hint + inline error, wired up for assistive tech.
 * `children` is a render function that receives the props for the control:
 *   <FormField label="Email" error={errors.email}>
 *     {(props) => <input type="email" {...props} />}
 *   </FormField>
 */
export default function FormField({ label, hint, error, children, className = "" }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>{label}</label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {hint && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}

/** Off-screen "website" field: humans never see it, bots fill it in. */
export function Honeypot({ value, onChange }) {
  return (
    <div className="honeypot" aria-hidden="true">
      <label>
        Website
        <input name="website" tabIndex={-1} autoComplete="off" value={value} onChange={onChange} />
      </label>
    </div>
  );
}
