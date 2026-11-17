/*
 * Generador de códigos QR (modo byte, corrección de errores M, versiones 1 a 10).
 * Sin dependencias: sirve para el QR de pago de Nequi.
 * Devuelve una matriz de booleanos (true = módulo oscuro).
 */

const ECC_POR_BLOQUE_M = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
const BLOQUES_M = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
const VERSION_MAX = 10;

function bitDe(valor, i) {
  return ((valor >>> i) & 1) !== 0;
}

function modulosTotales(version) {
  let resultado = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const alineacion = Math.floor(version / 7) + 2;
    resultado -= (25 * alineacion - 10) * alineacion - 55;
    if (version >= 7) resultado -= 36;
  }
  return resultado;
}

function codewordsDeDatos(version) {
  return Math.floor(modulosTotales(version) / 8) - ECC_POR_BLOQUE_M[version] * BLOQUES_M[version];
}

function multiplicarGF(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i -= 1) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}

function divisorRS(grado) {
  const resultado = new Array(grado).fill(0);
  resultado[grado - 1] = 1;
  let raiz = 1;
  for (let i = 0; i < grado; i += 1) {
    for (let j = 0; j < grado; j += 1) {
      resultado[j] = multiplicarGF(resultado[j], raiz);
      if (j + 1 < grado) resultado[j] ^= resultado[j + 1];
    }
    raiz = multiplicarGF(raiz, 0x02);
  }
  return resultado;
}

function restoRS(datos, divisor) {
  const resultado = divisor.map(() => 0);
  datos.forEach((byte) => {
    const factor = byte ^ resultado.shift();
    resultado.push(0);
    divisor.forEach((coef, i) => {
      resultado[i] ^= multiplicarGF(coef, factor);
    });
  });
  return resultado;
}

function posicionesAlineacion(version) {
  if (version === 1) return [];
  const cantidad = Math.floor(version / 7) + 2;
  const paso = Math.ceil((version * 4 + 4) / (cantidad * 2 - 2)) * 2;
  const tamano = version * 4 + 17;
  const posiciones = [6];
  for (let pos = tamano - 7; posiciones.length < cantidad; pos -= paso) {
    posiciones.splice(1, 0, pos);
  }
  return posiciones;
}

function armarDatos(bytes, version) {
  const bits = [];
  const agregar = (valor, largo) => {
    for (let i = largo - 1; i >= 0; i -= 1) bits.push((valor >>> i) & 1);
  };

  agregar(0b0100, 4);
  agregar(bytes.length, version >= 10 ? 16 : 8);
  bytes.forEach((byte) => agregar(byte, 8));

  const capacidadBits = codewordsDeDatos(version) * 8;
  agregar(0, Math.min(4, capacidadBits - bits.length));
  agregar(0, (8 - (bits.length % 8)) % 8);

  const codewords = [];
  for (let i = 0; i < bits.length; i += 8) {
    codewords.push(bits.slice(i, i + 8).reduce((acc, bit) => (acc << 1) | bit, 0));
  }
  for (let relleno = 0xec; codewords.length < codewordsDeDatos(version); relleno ^= 0xec ^ 0x11) {
    codewords.push(relleno);
  }
  return codewords;
}

function agregarCorreccion(datos, version) {
  const bloques = BLOQUES_M[version];
  const eccLargo = ECC_POR_BLOQUE_M[version];
  const total = Math.floor(modulosTotales(version) / 8);
  const bloquesCortos = bloques - (total % bloques);
  const largoCorto = Math.floor(total / bloques);
  const divisor = divisorRS(eccLargo);

  const resultado = [];
  const lista = [];
  for (let i = 0, k = 0; i < bloques; i += 1) {
    const dat = datos.slice(k, k + largoCorto - eccLargo + (i < bloquesCortos ? 0 : 1));
    k += dat.length;
    const ecc = restoRS(dat, divisor);
    if (i < bloquesCortos) dat.push(0);
    lista.push(dat.concat(ecc));
  }
  for (let i = 0; i < lista[0].length; i += 1) {
    lista.forEach((bloque, j) => {
      if (i !== largoCorto - eccLargo || j >= bloquesCortos) resultado.push(bloque[i]);
    });
  }
  return resultado;
}

function penalizacion(modulos) {
  const n = modulos.length;
  let puntos = 0;

  const lineas = [];
  for (let i = 0; i < n; i += 1) {
    lineas.push(modulos[i]);
    lineas.push(modulos.map((fila) => fila[i]));
  }
  lineas.forEach((linea) => {
    let racha = 1;
    for (let i = 1; i <= n; i += 1) {
      if (i < n && linea[i] === linea[i - 1]) {
        racha += 1;
      } else {
        if (racha >= 5) puntos += 3 + (racha - 5);
        racha = 1;
      }
    }
    const texto = linea.map((v) => (v ? '1' : '0')).join('');
    const patron = /(?=(10111010000|00001011101))/g;
    puntos += 40 * (texto.match(patron) ?? []).length;
  });

  for (let y = 0; y < n - 1; y += 1) {
    for (let x = 0; x < n - 1; x += 1) {
      const color = modulos[y][x];
      if (color === modulos[y][x + 1] && color === modulos[y + 1][x] && color === modulos[y + 1][x + 1]) {
        puntos += 3;
      }
    }
  }

  const oscuros = modulos.reduce((suma, fila) => suma + fila.filter(Boolean).length, 0);
  const desvio = Math.abs((oscuros * 100) / (n * n) - 50);
  puntos += Math.floor(desvio / 5) * 10;
  return puntos;
}

function construir(codewords, version, mascara) {
  const tamano = version * 4 + 17;
  const modulos = Array.from({ length: tamano }, () => new Array(tamano).fill(false));
  const reservado = Array.from({ length: tamano }, () => new Array(tamano).fill(false));

  const fijar = (x, y, oscuro) => {
    modulos[y][x] = oscuro;
    reservado[y][x] = true;
  };

  for (let i = 0; i < tamano; i += 1) {
    fijar(6, i, i % 2 === 0);
    fijar(i, 6, i % 2 === 0);
  }

  const buscador = (cx, cy) => {
    for (let dy = -4; dy <= 4; dy += 1) {
      for (let dx = -4; dx <= 4; dx += 1) {
        const distancia = Math.max(Math.abs(dx), Math.abs(dy));
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < tamano && y >= 0 && y < tamano) {
          fijar(x, y, distancia !== 2 && distancia !== 4);
        }
      }
    }
  };
  buscador(3, 3);
  buscador(tamano - 4, 3);
  buscador(3, tamano - 4);

  const posiciones = posicionesAlineacion(version);
  posiciones.forEach((py, i) => {
    posiciones.forEach((px, j) => {
      const esquina = (i === 0 && j === 0)
        || (i === 0 && j === posiciones.length - 1)
        || (i === posiciones.length - 1 && j === 0);
      if (esquina) return;
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) {
          fijar(px + dx, py + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    });
  });

  // Formato (nivel M = 0b00) y versión
  const datosFormato = (0b00 << 3) | mascara;
  let resto = datosFormato;
  for (let i = 0; i < 10; i += 1) resto = (resto << 1) ^ ((resto >>> 9) * 0x537);
  const formato = ((datosFormato << 10) | resto) ^ 0x5412;

  for (let i = 0; i <= 5; i += 1) fijar(8, i, bitDe(formato, i));
  fijar(8, 7, bitDe(formato, 6));
  fijar(8, 8, bitDe(formato, 7));
  fijar(7, 8, bitDe(formato, 8));
  for (let i = 9; i < 15; i += 1) fijar(14 - i, 8, bitDe(formato, i));
  for (let i = 0; i < 8; i += 1) fijar(tamano - 1 - i, 8, bitDe(formato, i));
  for (let i = 8; i < 15; i += 1) fijar(8, tamano - 15 + i, bitDe(formato, i));
  fijar(8, tamano - 8, true);

  if (version >= 7) {
    let restoVersion = version;
    for (let i = 0; i < 12; i += 1) restoVersion = (restoVersion << 1) ^ ((restoVersion >>> 11) * 0x1f25);
    const bitsVersion = (version << 12) | restoVersion;
    for (let i = 0; i < 18; i += 1) {
      const a = tamano - 11 + (i % 3);
      const b = Math.floor(i / 3);
      fijar(a, b, bitDe(bitsVersion, i));
      fijar(b, a, bitDe(bitsVersion, i));
    }
  }

  // Datos en zigzag
  let indice = 0;
  for (let derecha = tamano - 1; derecha >= 1; derecha -= 2) {
    if (derecha === 6) derecha = 5;
    for (let vertical = 0; vertical < tamano; vertical += 1) {
      for (let j = 0; j < 2; j += 1) {
        const x = derecha - j;
        const subiendo = ((derecha + 1) & 2) === 0;
        const y = subiendo ? tamano - 1 - vertical : vertical;
        if (!reservado[y][x] && indice < codewords.length * 8) {
          modulos[y][x] = bitDe(codewords[indice >>> 3], 7 - (indice & 7));
          indice += 1;
        }
      }
    }
  }

  // Máscara
  const condiciones = [
    (x, y) => (x + y) % 2 === 0,
    (x, y) => y % 2 === 0,
    (x) => x % 3 === 0,
    (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
    (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
    (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
    (x, y) => ((((x + y) % 2) + ((x * y) % 3)) % 2) === 0,
  ];
  for (let y = 0; y < tamano; y += 1) {
    for (let x = 0; x < tamano; x += 1) {
      if (!reservado[y][x] && condiciones[mascara](x, y)) modulos[y][x] = !modulos[y][x];
    }
  }
  return modulos;
}

export function generarQR(texto) {
  const bytes = Array.from(new TextEncoder().encode(texto));

  let version = 1;
  while (version <= VERSION_MAX) {
    const bitsNecesarios = 4 + (version >= 10 ? 16 : 8) + bytes.length * 8;
    if (bitsNecesarios <= codewordsDeDatos(version) * 8) break;
    version += 1;
  }
  if (version > VERSION_MAX) throw new RangeError('El texto es demasiado largo para el QR.');

  const codewords = agregarCorreccion(armarDatos(bytes, version), version);

  let mejor = null;
  let mejorPuntos = Infinity;
  for (let mascara = 0; mascara < 8; mascara += 1) {
    const candidato = construir(codewords, version, mascara);
    const puntos = penalizacion(candidato);
    if (puntos < mejorPuntos) {
      mejorPuntos = puntos;
      mejor = candidato;
    }
  }
  return mejor;
}
