const moneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const fechaHora = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatCOP(valor) {
  return `${moneda.format(valor)} COP`;
}

export function formatFecha(iso) {
  return fechaHora.format(new Date(iso));
}
