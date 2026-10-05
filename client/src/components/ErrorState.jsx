/** Friendly error box for failed fetches, with an optional retry. */
export default function ErrorState({ title = "That didn't load.", error, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <p className="error-state__title">{title}</p>
      <p>{error?.message || "Something went wrong on my end. Give it another go?"}</p>
      {onRetry && (
        <p>
          <button type="button" className="button button--ghost" onClick={onRetry}>
            Try again
          </button>
        </p>
      )}
    </div>
  );
}
