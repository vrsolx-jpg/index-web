import { useMemo } from 'react';
import { generarQR } from './qr.js';

const MARGEN = 4;

function QRCode({ value, size = 220, label = 'Código QR' }) {
  const { lado, ruta } = useMemo(() => {
    const matriz = generarQR(value);
    const trazos = [];
    matriz.forEach((fila, y) => {
      let x = 0;
      while (x < fila.length) {
        if (!fila[x]) {
          x += 1;
        } else {
          const inicio = x;
          while (x < fila.length && fila[x]) x += 1;
          trazos.push(`M${inicio + MARGEN} ${y + MARGEN}h${x - inicio}v1h-${x - inicio}z`);
        }
      }
    });
    return { lado: matriz.length + MARGEN * 2, ruta: trazos.join('') };
  }, [value]);

  return (
    <svg
      className="qr-code"
      viewBox={`0 0 ${lado} ${lado}`}
      width={size}
      height={size}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
    >
      <rect width={lado} height={lado} fill="#fff" />
      <path d={ruta} fill="#200020" />
    </svg>
  );
}

export default QRCode;
