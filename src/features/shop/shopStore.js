
import { useMemo, useSyncExternalStore } from 'react';

const CLAVES = {
  carrito: 'fc_carrito',
  usuarios: 'fc_usuarios',
  sesion: 'fc_sesion',
  pedidos: 'fc_pedidos',
};

export const ENVIO = { tarifa: 6000, gratisDesde: 50000 };

const VACIO = [];
const oyentes = new Set();
const cache = new Map();
const memoria = {};

function leerCrudo(clave) {
  try {
    const valor = window.localStorage.getItem(clave);
    if (valor !== null) return valor;
  } catch {
    /* localStorage no disponible: se usa la memoria */
  }
  return memoria[clave] ?? null;
}

function leer(clave, porDefecto) {
  const crudo = leerCrudo(clave);
  const guardado = cache.get(clave);
  if (guardado && guardado.crudo === crudo) return guardado.valor;

  let valor = porDefecto;
  if (crudo !== null) {
    try {
      valor = JSON.parse(crudo);
    } catch {
      valor = porDefecto;
    }
  }
  cache.set(clave, { crudo, valor });
  return valor;
}

function escribir(clave, valor) {
  const crudo = JSON.stringify(valor);
  memoria[clave] = crudo;
  try {
    window.localStorage.setItem(clave, crudo);
  } catch {
    /* sin espacio o modo privado: queda solo en memoria */
  }
  oyentes.forEach((avisar) => avisar());
}

function suscribir(avisar) {
  oyentes.add(avisar);
  const alCambiarStorage = (evento) => {
    if (!evento.key || evento.key.startsWith('fc_')) avisar();
  };
  window.addEventListener('storage', alCambiarStorage);
  return () => {
    oyentes.delete(avisar);
    window.removeEventListener('storage', alCambiarStorage);
  };
}

/* ---------- Carrito ---------- */

export function useCart() {
  return useSyncExternalStore(suscribir, () => leer(CLAVES.carrito, VACIO));
}

export function addToCart(producto, cantidad = 1) {
  const carrito = leer(CLAVES.carrito, VACIO);
  const existe = carrito.some((linea) => linea.id === producto.id);

  const siguiente = existe
    ? carrito.map((linea) => (
      linea.id === producto.id
        ? { ...linea, cantidad: Math.min(99, linea.cantidad + cantidad) }
        : linea
    ))
    : [...carrito, {
      id: producto.id,
      nombre: producto.nombre,
      precioCOP: producto.precioCOP,
      image: producto.image ?? null,
      cantidad,
    }];

  escribir(CLAVES.carrito, siguiente);
}

export function changeQty(id, cantidad) {
  const carrito = leer(CLAVES.carrito, VACIO);
  if (cantidad <= 0) {
    escribir(CLAVES.carrito, carrito.filter((linea) => linea.id !== id));
    return;
  }
  escribir(
    CLAVES.carrito,
    carrito.map((linea) => (
      linea.id === id ? { ...linea, cantidad: Math.min(99, cantidad) } : linea
    )),
  );
}

export function removeFromCart(id) {
  changeQty(id, 0);
}

export function clearCart() {
  escribir(CLAVES.carrito, VACIO);
}

export function getTotals(lineas) {
  const unidades = lineas.reduce((suma, linea) => suma + linea.cantidad, 0);
  const subtotal = lineas.reduce((suma, linea) => suma + linea.precioCOP * linea.cantidad, 0);
  const costoEnvio = lineas.length === 0 || subtotal >= ENVIO.gratisDesde ? 0 : ENVIO.tarifa;
  return { unidades, subtotal, costoEnvio, total: subtotal + costoEnvio };
}

/* ---------- Cuentas y sesión ---------- */

const normalizarCorreo = (correo) => correo.trim().toLowerCase();

export function useCurrentUser() {
  const correo = useSyncExternalStore(suscribir, () => leer(CLAVES.sesion, null));
  const usuarios = useSyncExternalStore(suscribir, () => leer(CLAVES.usuarios, VACIO));
  return usuarios.find((usuario) => usuario.email === correo) ?? null;
}

export function registerUser({ name, email, password }) {
  const usuarios = leer(CLAVES.usuarios, VACIO);
  const correo = normalizarCorreo(email);

  if (usuarios.some((usuario) => usuario.email === correo)) {
    return { ok: false, error: 'Ya existe una cuenta con ese correo.' };
  }

  const usuario = {
    name: name.trim(),
    email: correo,
    password,
    phone: '',
    city: '',
    address: '',
    createdAt: new Date().toISOString(),
  };
  escribir(CLAVES.usuarios, [...usuarios, usuario]);
  escribir(CLAVES.sesion, correo);
  return { ok: true };
}

export function loginUser(email, password) {
  const correo = normalizarCorreo(email);
  const usuario = leer(CLAVES.usuarios, VACIO).find((item) => item.email === correo);

  if (!usuario || usuario.password !== password) {
    return { ok: false, error: 'Correo o contraseña incorrectos.' };
  }
  escribir(CLAVES.sesion, correo);
  return { ok: true };
}

export function logoutUser() {
  escribir(CLAVES.sesion, null);
}

export function updateUser(cambios) {
  const correo = leer(CLAVES.sesion, null);
  if (!correo) return;

  const permitidos = ['name', 'phone', 'city', 'address'];
  const limpios = Object.fromEntries(
    permitidos
      .filter((campo) => campo in cambios)
      .map((campo) => [campo, String(cambios[campo]).trim()]),
  );

  escribir(
    CLAVES.usuarios,
    leer(CLAVES.usuarios, VACIO).map((usuario) => (
      usuario.email === correo ? { ...usuario, ...limpios } : usuario
    )),
  );
}

/* ---------- Pedidos ---------- */

export function useOrders() {
  const correo = useSyncExternalStore(suscribir, () => leer(CLAVES.sesion, null));
  const pedidos = useSyncExternalStore(suscribir, () => leer(CLAVES.pedidos, VACIO));
  return useMemo(() => pedidos.filter((pedido) => pedido.email === correo), [pedidos, correo]);
}

function generarNumeroPedido() {
  const tiempo = Date.now().toString(36).toUpperCase().slice(-5);
  const azar = Math.random().toString(36).toUpperCase().slice(2, 4);
  return `FC-${tiempo}${azar}`;
}

/* Crea el pedido con lo que hay en el carrito y lo vacía. Devuelve el pedido. */
export function placeOrder({ entrega, pago }) {
  const correo = leer(CLAVES.sesion, null);
  const lineas = leer(CLAVES.carrito, VACIO);
  if (!correo || lineas.length === 0) return null;

  const pedido = {
    id: generarNumeroPedido(),
    email: correo,
    createdAt: new Date().toISOString(),
    estado: 'Pago aprobado',
    lineas,
    ...getTotals(lineas),
    entrega,
    pago,
  };

  escribir(CLAVES.pedidos, [pedido, ...leer(CLAVES.pedidos, VACIO)]);
  clearCart();
  return pedido;
}
