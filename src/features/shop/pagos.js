/* Utilidades de la pasarela de pago: tarjetas, documentos, Nequi y referencias. */

export const soloDigitos = (texto) => String(texto ?? '').replace(/\D/g, '');

/* ---------- Tarjetas ---------- */

export const MARCAS = {
  visa: { nombre: 'Visa', corto: 'VISA', largo: 16, cvv: 3, grupos: [4, 4, 4, 4] },
  mastercard: { nombre: 'Mastercard', corto: 'Mastercard', largo: 16, cvv: 3, grupos: [4, 4, 4, 4] },
  amex: { nombre: 'American Express', corto: 'AMEX', largo: 15, cvv: 4, grupos: [4, 6, 5] },
  diners: { nombre: 'Diners Club', corto: 'Diners', largo: 14, cvv: 3, grupos: [4, 6, 4] },
  desconocida: { nombre: 'Tarjeta', corto: '', largo: 16, cvv: 3, grupos: [4, 4, 4, 4] },
};

export function detectarMarca(numero) {
  const digitos = soloDigitos(numero);
  if (/^4/.test(digitos)) return 'visa';
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d\d|27[01]\d|2720)/.test(digitos)) return 'mastercard';
  if (/^3[47]/.test(digitos)) return 'amex';
  if (/^3(0[0-5]|[68])/.test(digitos)) return 'diners';
  return 'desconocida';
}

export function formatearNumeroTarjeta(texto) {
  const marca = MARCAS[detectarMarca(texto)];
  const digitos = soloDigitos(texto).slice(0, marca.largo);
  const partes = [];
  let inicio = 0;
  marca.grupos.forEach((largo) => {
    if (inicio < digitos.length) partes.push(digitos.slice(inicio, inicio + largo));
    inicio += largo;
  });
  return partes.join(' ');
}

export function formatearVencimiento(texto) {
  const digitos = soloDigitos(texto).slice(0, 4);
  return digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos;
}

function pasaLuhn(numero) {
  let suma = 0;
  let doble = false;
  for (let i = numero.length - 1; i >= 0; i -= 1) {
    let digito = Number(numero[i]);
    if (doble) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }
    suma += digito;
    doble = !doble;
  }
  return suma % 10 === 0;
}

/* Devuelve un mensaje de error o '' si el número es válido. */
export function validarNumeroTarjeta(numero) {
  const digitos = soloDigitos(numero);
  const marca = MARCAS[detectarMarca(digitos)];
  if (digitos.length < marca.largo || !pasaLuhn(digitos)) {
    return 'El número de la tarjeta no es válido. Revísalo e inténtalo de nuevo.';
  }
  return '';
}

export function validarVencimiento(texto, ahora = new Date()) {
  const [mes, anio] = texto.split('/').map(Number);
  if (!mes || !anio || mes < 1 || mes > 12 || texto.length !== 5) {
    return 'La fecha de vencimiento debe tener el formato MM/AA.';
  }
  const anioCompleto = 2000 + anio;
  const mesActual = ahora.getFullYear() * 12 + ahora.getMonth();
  if (anioCompleto * 12 + (mes - 1) < mesActual) return 'La tarjeta está vencida.';
  if (anioCompleto > ahora.getFullYear() + 20) return 'La fecha de vencimiento no es válida.';
  return '';
}

export function validarCvv(cvv, marca) {
  const largo = (MARCAS[marca] ?? MARCAS.desconocida).cvv;
  return soloDigitos(cvv).length === largo
    ? ''
    : `El código de seguridad debe tener ${largo} dígitos.`;
}

export function enmascarar(marca, ultimos4) {
  return marca === 'amex' ? `•••• •••••• •${ultimos4}` : `•••• •••• •••• ${ultimos4}`;
}

export const CUOTAS = [1, 2, 3, 6, 12, 24, 36];

/* ---------- Documentos y datos del pagador ---------- */

export const TIPOS_DOCUMENTO = [
  { id: 'CC', nombre: 'Cédula de ciudadanía' },
  { id: 'CE', nombre: 'Cédula de extranjería' },
  { id: 'NIT', nombre: 'NIT' },
  { id: 'PP', nombre: 'Pasaporte' },
];

export function validarDocumento(numero) {
  const digitos = String(numero ?? '').replace(/[^0-9A-Za-z]/g, '');
  return digitos.length >= 5 && digitos.length <= 15
    ? ''
    : 'Escribe un número de documento válido.';
}

export const BANCOS = [
  'Bancolombia',
  'Davivienda',
  'Banco de Bogotá',
  'BBVA Colombia',
  'Banco de Occidente',
  'Banco Caja Social',
  'Banco Popular',
  'Banco AV Villas',
  'Banco Falabella',
  'Banco Agrario',
  'Itaú',
  'Scotiabank Colpatria',
];

/* ---------- Nequi ---------- */

export function formatearCelular(texto) {
  const digitos = soloDigitos(texto).slice(0, 10);
  return [digitos.slice(0, 3), digitos.slice(3, 6), digitos.slice(6)].filter(Boolean).join(' ');
}

export function validarCelular(texto) {
  return /^3\d{9}$/.test(soloDigitos(texto))
    ? ''
    : 'Escribe un celular colombiano de 10 dígitos que empiece por 3.';
}

export function enmascararCelular(texto) {
  const digitos = soloDigitos(texto);
  return `${digitos.slice(0, 3)} ••• ${digitos.slice(-4)}`;
}

/* Texto que lleva el QR. Es una demostración: la app real de Nequi no lo reconoce. */
export function datosQrNequi({ referencia, total, celular, nombre }) {
  return [
    'NEQUI-DEMO',
    'COMERCIO=FIESTA COLOMBIA',
    `REF=${referencia}`,
    `VALOR=${total}`,
    `CEL=${soloDigitos(celular)}`,
    `TITULAR=${nombre.trim().toUpperCase()}`,
  ].join('|');
}

/* ---------- Referencias de transacción (simuladas) ---------- */

function numeroAleatorio(digitos) {
  let resultado = String(1 + Math.floor(Math.random() * 9));
  while (resultado.length < digitos) resultado += Math.floor(Math.random() * 10);
  return resultado;
}

export const generarCus = () => numeroAleatorio(10);
export const generarAprobacion = () => numeroAleatorio(6);
export const generarReferenciaNequi = () => `NQ${numeroAleatorio(9)}`;

/* Hora actual en milisegundos (aislada aquí para usarla solo desde manejadores de eventos). */
export const ahoraMs = () => Date.now();
