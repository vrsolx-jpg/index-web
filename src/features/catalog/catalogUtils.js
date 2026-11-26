export const nombresColor = {
  '#d6ae34': 'Dorado', '#c4c6c8': 'Plateado', '#e7a5b5': 'Rosa', '#e66da8': 'Rosa',
  '#ffffff': 'Blanco', '#e5e7eb': 'Transparente', '#f5d313': 'Amarillo', '#65bde0': 'Azul',
  '#2447a2': 'Azul', '#b691bd': 'Morado', '#e9df7b': 'Amarillo', '#e6a4d5': 'Rosa',
  '#64750a': 'Verde', '#f08c28': 'Naranja', '#dc3545': 'Rojo',
};

export function getProductColors(product) {
  return [...new Set((product.colores ?? []).map((color) => nombresColor[color.toLowerCase()]).filter(Boolean))];
}

export function getSalePrice(product) {
  return product.descuentoPorcentaje
    ? Math.round(product.precioCOP * (1 - product.descuentoPorcentaje / 100))
    : product.precioCOP;
}

export function normalizarTexto(texto) {
  return texto.toLocaleLowerCase('es-CO').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function colorCaption(product) {
  return product.tipoColor === 'seleccionable' ? 'Elige un color:'
    : product.tipoColor === 'surtido' ? 'Colores incluidos:' : 'Color:';
}
