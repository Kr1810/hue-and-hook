/** First focusable element: jumps keyboard users past the header. */
export default function SkipLink() {
  const skip = (event) => {
    const main = document.getElementById("main");
    if (!main) return;
    event.preventDefault(); // keep the URL clean (no #main)
    main.focus();
    main.scrollIntoView();
  };

  return (
    <a className="skip-link" href="#main" onClick={skip}>
      Skip to content
    </a>
  );
}
