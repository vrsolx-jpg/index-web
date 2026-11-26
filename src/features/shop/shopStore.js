
import { useMemo, useSyncExternalStore } from 'react';
import { consultarUsuarios, eliminarUsuario, guardarUsuario } from '../shared/mockApi.js';

const CLAVES = {
  carrito: 'fc_carrito',
  usuarios: 'fc_usuarios',
  sesion: 'fc_sesion',
  pedidos: 'fc_pedidos',
  tarjetas: 'fc_tarjetas',
  direcciones: 'fc_direcciones',
  leidas: 'fc_perfil_leidas',
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
  const id = producto.colorElegido ? `${producto.id}::${producto.colorHex}` : producto.id;
  const unidades = Math.max(1, Math.min(99, Number(cantidad) || 1, producto.stock ?? 99));
  const precioCOP = producto.descuentoPorcentaje
    ? Math.round(producto.precioCOP * (1 - producto.descuentoPorcentaje / 100))
    : producto.precioCOP;
  const existe = carrito.some((linea) => linea.id === id);

  const siguiente = existe
    ? carrito.map((linea) => (
      linea.id === id
        ? { ...linea, cantidad: Math.min(99, producto.stock ?? 99, linea.cantidad + unidades) }
        : linea
    ))
    : [...carrito, {
      id,
      productoId: producto.id,
      nombre: producto.nombre,
      precioCOP,
      image: producto.image ?? null,
      colorElegido: producto.colorElegido ?? '',
      stock: producto.stock,
      cantidad: unidades,
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
      linea.id === id ? { ...linea, cantidad: Math.min(99, linea.stock ?? 99, cantidad) } : linea
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
    documentType: 'CC',
    documentNumber: '',
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

  const permitidos = ['name', 'phone', 'city', 'address', 'documentType', 'documentNumber'];
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
export function placeOrder({ entrega, pago, referencia = '', estado = 'Pago aprobado' }) {
  const correo = leer(CLAVES.sesion, null);
  const lineas = leer(CLAVES.carrito, VACIO);
  if (!correo || lineas.length === 0) return null;

  const pedido = {
    id: generarNumeroPedido(),
    email: correo,
    createdAt: new Date().toISOString(),
    estado,
    lineas,
    ...getTotals(lineas),
    entrega,
    pago,
    referencia,
  };

  escribir(CLAVES.pedidos, [pedido, ...leer(CLAVES.pedidos, VACIO)]);
  clearCart();
  return pedido;
}

/* ---------- Datos guardados por usuario (tarjetas y direcciones) ---------- */

function generarId(prefijo) {
  return `${prefijo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function useUserList(clave) {
  const correo = useSyncExternalStore(suscribir, () => leer(CLAVES.sesion, null));
  const todos = useSyncExternalStore(suscribir, () => leer(clave, VACIO));
  return useMemo(() => todos.filter((item) => item.email === correo), [todos, correo]);
}

/* Reemplaza la lista del usuario actual sin tocar la de otros usuarios. */
function guardarListaDelUsuario(clave, siguientes) {
  const correo = leer(CLAVES.sesion, null);
  if (!correo) return;
  const deOtros = leer(clave, VACIO).filter((item) => item.email !== correo);
  escribir(clave, [...siguientes, ...deOtros]);
}

function listaDelUsuario(clave) {
  const correo = leer(CLAVES.sesion, null);
  return leer(clave, VACIO).filter((item) => item.email === correo);
}

function marcarPredeterminado(lista, id) {
  return lista.map((item) => ({ ...item, predeterminada: item.id === id }));
}

/* Tarjetas: solo se guardan marca, últimos 4 dígitos, titular y vencimiento.
   El número completo y el CVV nunca se almacenan. */
export function useCards() {
  return useUserList(CLAVES.tarjetas);
}

export function addCard({ marca, ultimos4, titular, vence, tipo }) {
  const correo = leer(CLAVES.sesion, null);
  if (!correo) return null;

  const actuales = listaDelUsuario(CLAVES.tarjetas);
  const repetida = actuales.find((tarjeta) => (
    tarjeta.marca === marca && tarjeta.ultimos4 === ultimos4 && tarjeta.vence === vence
  ));
  if (repetida) return repetida;

  const tarjeta = {
    id: generarId('tj'),
    email: correo,
    marca,
    ultimos4,
    titular: titular.trim(),
    vence,
    tipo,
    predeterminada: actuales.length === 0,
    creadaEn: new Date().toISOString(),
  };
  guardarListaDelUsuario(CLAVES.tarjetas, [...actuales, tarjeta]);
  return tarjeta;
}

export function removeCard(id) {
  const restantes = listaDelUsuario(CLAVES.tarjetas).filter((tarjeta) => tarjeta.id !== id);
  if (restantes.length > 0 && !restantes.some((tarjeta) => tarjeta.predeterminada)) {
    restantes[0] = { ...restantes[0], predeterminada: true };
  }
  guardarListaDelUsuario(CLAVES.tarjetas, restantes);
}

export function setDefaultCard(id) {
  guardarListaDelUsuario(CLAVES.tarjetas, marcarPredeterminado(listaDelUsuario(CLAVES.tarjetas), id));
}

export function useAddresses() {
  return useUserList(CLAVES.direcciones);
}

export function getAddresses() {
  return listaDelUsuario(CLAVES.direcciones);
}

const CAMPOS_DIRECCION = ['alias', 'nombre', 'telefono', 'ciudad', 'direccion', 'indicaciones'];

/* Crea la dirección o, si trae id, la actualiza. Devuelve la dirección guardada. */
function guardarDireccionLocal(datos) {
  const correo = leer(CLAVES.sesion, null);
  if (!correo) return null;

  const actuales = listaDelUsuario(CLAVES.direcciones);
  const limpios = Object.fromEntries(
    CAMPOS_DIRECCION.map((campo) => [campo, String(datos[campo] ?? '').trim()]),
  );

  let guardada;
  let siguientes;
  if (datos.id && actuales.some((direccion) => direccion.id === datos.id)) {
    siguientes = actuales.map((direccion) => (
      direccion.id === datos.id ? { ...direccion, ...limpios, mockApiId: datos.mockApiId ?? direccion.mockApiId } : direccion
    ));
    guardada = siguientes.find((direccion) => direccion.id === datos.id);
  } else {
    guardada = {
      id: generarId('dir'),
      email: correo,
      ...limpios,
      mockApiId: datos.mockApiId,
      predeterminada: actuales.length === 0,
      creadaEn: new Date().toISOString(),
    };
    siguientes = [...actuales, guardada];
  }

  if (datos.predeterminada) siguientes = marcarPredeterminado(siguientes, guardada.id);
  guardarListaDelUsuario(CLAVES.direcciones, siguientes);
  return guardada;
}

function eliminarDireccionLocal(id) {
  const restantes = listaDelUsuario(CLAVES.direcciones).filter((direccion) => direccion.id !== id);
  if (restantes.length > 0 && !restantes.some((direccion) => direccion.predeterminada)) {
    restantes[0] = { ...restantes[0], predeterminada: true };
  }
  guardarListaDelUsuario(CLAVES.direcciones, restantes);
}

export function setDefaultAddress(id) {
  guardarListaDelUsuario(
    CLAVES.direcciones,
    marcarPredeterminado(listaDelUsuario(CLAVES.direcciones), id),
  );
}

/* ---------- Perfil y direcciones en MockAPI ---------- */

const perfilesRemotos = new Map();
const cargasPerfil = new Map();
const escriturasPerfil = new Map();
const revisionesPerfil = new Map();
const SIN_LEER = {};

function usuarioPorCorreo(correo) {
  return leer(CLAVES.usuarios, VACIO).find((usuario) => usuario.email === correo);
}

function comprobarSesion(correo) {
  if (!correo || leer(CLAVES.sesion, null) !== correo) {
    throw new Error('Tu sesión cambió. Abre tu perfil e intenta de nuevo.');
  }
}

export function cargarPerfil({ force = false } = {}) {
  const correo = leer(CLAVES.sesion, null);
  if (!correo) return Promise.resolve(null);
  if (cargasPerfil.has(correo)) return cargasPerfil.get(correo);
  if (!force && perfilesRemotos.has(correo)) return Promise.resolve(usuarioPorCorreo(correo));
  const revision = revisionesPerfil.get(correo) ?? 0;
  const carga = consultarUsuarios(correo).then((records) => {
    if (leer(CLAVES.sesion, null) !== correo || revision !== (revisionesPerfil.get(correo) ?? 0)) return null;
    perfilesRemotos.set(correo, records);
    const perfil = records.find((record) => !record.etiquetaDireccion) ?? records[0];
    const actuales = listaDelUsuario(CLAVES.direcciones);
    const remotas = records.filter((record) => record.direccion).map((record) => {
      const existente = actuales.find((direccion) => String(direccion.mockApiId) === String(record.id)
        || (!direccion.mockApiId && direccion.direccion === record.direccion && direccion.ciudad === record.ciudad));
      return {
        id: existente?.id ?? `dir-api-${record.id}`,
        mockApiId: String(record.id),
        email: correo,
        alias: record.etiquetaDireccion || 'Casa',
        nombre: record.nombre || '',
        telefono: record.telefono || '',
        ciudad: record.ciudad || '',
        direccion: record.direccion || '',
        indicaciones: record.indicaciones || '',
        predeterminada: existente?.predeterminada ?? false,
        creadaEn: existente?.creadaEn ?? new Date().toISOString(),
      };
    });
    const siguientes = [...remotas, ...actuales.filter((direccion) => !direccion.mockApiId
      && !remotas.some((remota) => remota.id === direccion.id))];
    if (siguientes.length && !siguientes.some((direccion) => direccion.predeterminada)) siguientes[0].predeterminada = true;
    guardarListaDelUsuario(CLAVES.direcciones, siguientes);
    if (perfil) {
      const principal = siguientes.find((direccion) => direccion.predeterminada);
      updateUser({
        name: perfil.nombre || usuarioPorCorreo(correo).name,
        phone: perfil.telefono || '',
        city: principal?.ciudad || perfil.ciudad || '',
        address: principal?.direccion || perfil.direccion || '',
      });
    }
    return usuarioPorCorreo(correo);
  }).finally(() => cargasPerfil.delete(correo));
  cargasPerfil.set(correo, carga);
  return carga;
}

function serializarPerfil(operacion) {
  const correo = leer(CLAVES.sesion, null);
  const anterior = escriturasPerfil.get(correo) ?? Promise.resolve();
  const siguiente = anterior.catch(() => {}).then(async () => {
    comprobarSesion(correo);
    await cargarPerfil();
    comprobarSesion(correo);
    revisionesPerfil.set(correo, (revisionesPerfil.get(correo) ?? 0) + 1);
    try {
      return await operacion(correo);
    } finally {
      revisionesPerfil.set(correo, (revisionesPerfil.get(correo) ?? 0) + 1);
    }
  });
  escriturasPerfil.set(correo, siguiente);
  return siguiente.finally(() => {
    if (escriturasPerfil.get(correo) === siguiente) escriturasPerfil.delete(correo);
  });
}

function actualizarRegistroRemoto(correo, record) {
  const actuales = perfilesRemotos.get(correo) ?? [];
  perfilesRemotos.set(correo, [...actuales.filter((item) => String(item.id) !== String(record.id)), record]);
}

async function guardarCuentaRemota(correo, cambios = {}) {
  const usuario = { ...usuarioPorCorreo(correo), ...cambios };
  const perfil = perfilesRemotos.get(correo)?.find((record) => !record.etiquetaDireccion);
  const record = await guardarUsuario({
    nombre: usuario.name, correo, telefono: usuario.phone,
    ciudad: '', direccion: '', indicaciones: '', etiquetaDireccion: '',
  }, perfil?.id);
  comprobarSesion(correo);
  actualizarRegistroRemoto(correo, record);
  return record;
}

export function guardarPerfil(cambios) {
  return serializarPerfil(async (correo) => {
    await guardarCuentaRemota(correo, cambios);
    updateUser(cambios);
    return usuarioPorCorreo(correo);
  });
}

export function saveAddress(datos) {
  if (['nombre', 'telefono', 'ciudad', 'direccion'].some((campo) => !String(datos[campo] ?? '').trim())) {
    return Promise.reject(new Error('Completa el nombre, teléfono, ciudad y dirección de entrega.'));
  }
  return serializarPerfil(async (correo) => {
    const actuales = listaDelUsuario(CLAVES.direcciones);
    const existente = actuales.find((direccion) => direccion.id === datos.id)
      ?? actuales.find((direccion) => direccion.direccion.trim() === datos.direccion.trim()
        && direccion.ciudad.trim() === datos.ciudad.trim() && direccion.alias === datos.alias);
    if (!perfilesRemotos.get(correo)?.some((record) => !record.etiquetaDireccion)) await guardarCuentaRemota(correo);
    const record = await guardarUsuario({
      nombre: datos.nombre, correo, telefono: datos.telefono,
      ciudad: datos.ciudad, direccion: datos.direccion,
      indicaciones: datos.indicaciones, etiquetaDireccion: datos.alias || 'Casa',
    }, existente?.mockApiId);
    comprobarSesion(correo);
    actualizarRegistroRemoto(correo, record);
    const direccion = guardarDireccionLocal({ ...datos, id: existente?.id, mockApiId: record.id });
    if (direccion.predeterminada || datos.predeterminada) updateUser({ city: datos.ciudad, address: datos.direccion });
    return direccion;
  });
}

export function removeAddress(id) {
  return serializarPerfil(async (correo) => {
    const direccion = listaDelUsuario(CLAVES.direcciones).find((item) => item.id === id);
    if (direccion?.mockApiId) {
      await eliminarUsuario(direccion.mockApiId);
      comprobarSesion(correo);
      perfilesRemotos.set(correo, perfilesRemotos.get(correo).filter((record) => String(record.id) !== direccion.mockApiId));
    }
    eliminarDireccionLocal(id);
    const principal = listaDelUsuario(CLAVES.direcciones).find((item) => item.predeterminada);
    updateUser({ city: principal?.ciudad ?? '', address: principal?.direccion ?? '' });
  });
}

/* Las insignias indican novedades; los totales de Mi cuenta conservan el historial completo. */
export function useProfileRead() {
  const correo = useSyncExternalStore(suscribir, () => leer(CLAVES.sesion, null));
  const registros = useSyncExternalStore(suscribir, () => leer(CLAVES.leidas, SIN_LEER));
  return registros[correo] ?? SIN_LEER;
}

export function marcarSeccionLeida(seccion, ids) {
  const correo = leer(CLAVES.sesion, null);
  if (!correo) return;
  const registros = leer(CLAVES.leidas, SIN_LEER);
  const anteriores = registros[correo]?.[seccion] ?? [];
  if (ids.every((id) => anteriores.includes(id))) return;
  escribir(CLAVES.leidas, { ...registros, [correo]: { ...registros[correo], [seccion]: [...new Set([...anteriores, ...ids])] } });
}
