const decorations = [
  ['♡', 8, 17], ['✦', 24, 75], ['★', 39, 14], ['♡', 57, 82],
  ['✧', 73, 23], ['♥', 91, 68], ['✦', 15, 48], ['★', 84, 43],
];

function FloatingDecorations() {
  return (
    <div className="fiesta-floating-decorations" aria-hidden="true">
      {decorations.map(([icon, x, y], index) => (
        <span className="welcome-floating-decoration" key={`${icon}-${x}`} style={{
          left: `${x}%`, top: `${y}%`, '--decoration-delay': `${-index * 0.6}s`, '--decoration-duration': `${5 + index % 4}s`,
        }}>{icon}</span>
      ))}
    </div>
  );
}

export default FloatingDecorations;
