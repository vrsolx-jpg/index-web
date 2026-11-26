import './FloatingDecorations.css';

const decoraciones = [
  { icono: '♡', x: 8, y: 17 }, { icono: '✦', x: 24, y: 75 },
  { icono: '★', x: 39, y: 14 }, { icono: '♡', x: 57, y: 82 },
  { icono: '✧', x: 73, y: 23 }, { icono: '♥', x: 91, y: 68 },
  { icono: '✦', x: 15, y: 48 }, { icono: '★', x: 84, y: 43 },
];

function FloatingDecorations() {
  return (
    <div className="welcome-floating-decorations" aria-hidden="true">
      {decoraciones.map(({ icono, x, y }, index) => (
        <span
          className="welcome-floating-decoration"
          key={`${icono}-${x}`}
          style={{
            left: `${x}%`,
            top: `${y}%`,
            '--decoration-delay': `${-index * 0.6}s`,
            '--decoration-duration': `${4.8 + (index % 4) * 0.7}s`,
          }}
        >
          {icono}
        </span>
      ))}
    </div>
  );
}

export default FloatingDecorations;
