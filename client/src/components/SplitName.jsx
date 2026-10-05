/**
 * The giant animated name. Each letter is its own span that rises in with a
 * staggered clip-path/translate reveal (keyframes in global.css). The <h1>
 * keeps the full name as its accessible label; letters are aria-hidden.
 * Words stay unbreakable so lines only wrap at spaces.
 */
export default function SplitName({ text, className = "" }) {
  let index = 0;
  const words = text.trim().split(/\s+/);

  return (
    <h1 className={`split-name ${className}`} aria-label={text}>
      {words.map((word, w) => (
        <span key={`${word}-${w}`}>
          <span className="split-name__word" aria-hidden="true">
            {[...word].map((char, c) => (
              <span key={c} className="split-name__char" style={{ "--i": index++ }}>
                {char}
              </span>
            ))}
          </span>
          {w < words.length - 1 && " "}
        </span>
      ))}
    </h1>
  );
}
