const BASE_URL = 'https://6b0845e758419b87a4396e26.mockapi.io/api/V1';

async function request(resource, { method = 'GET', body, signal, emptyOn404 = false } = {}) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) controller.abort();
  const timeout = setTimeout(abort, 15000);
  try {
    const response = await fetch(`${BASE_URL}/${resource}`, {
      method,
      signal: controller.signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (response.status === 404 && emptyOn404) return [];
    if (!response.ok) throw new Error('No pudimos guardar o consultar tus datos. Intenta de nuevo.');
    return await response.json();
  } catch (error) {
    if (signal?.aborted) throw error;
    if (controller.signal.aborted) throw new Error('La conexión tardó demasiado. Intenta de nuevo.', { cause: error });
    if (error instanceof TypeError) throw new Error('No hay conexión con la tienda. Revisa tu conexión e intenta de nuevo.', { cause: error });
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}

export async function consultarUsuarios(correo, signal) {
  const normalizado = correo.trim().toLowerCase();
  const records = await request(`usuarios?${new URLSearchParams({ correo: normalizado })}`, { signal, emptyOn404: true });
  if (!Array.isArray(records)) throw new Error('La tienda devolvió una respuesta inesperada. Intenta de nuevo.');
  return records.filter((record) => String(record.correo).trim().toLowerCase() === normalizado);
}

// Solo estos siete campos viajan a MockAPI. La autenticación y las tarjetas permanecen separadas.
export async function guardarUsuario(datos, id) {
  const campos = ['nombre', 'correo', 'telefono', 'ciudad', 'direccion', 'indicaciones', 'etiquetaDireccion'];
  const payload = Object.fromEntries(campos.map((campo) => [campo, String(datos[campo] ?? '').trim()]));
  payload.correo = payload.correo.toLowerCase();
  const record = await request(id ? `usuarios/${encodeURIComponent(id)}` : 'usuarios', {
    method: id ? 'PUT' : 'POST',
    body: payload,
  });
  if (!record?.id) throw new Error('No recibimos el número de registro. Consulta tu perfil antes de volver a guardar.');
  return { ...payload, id: String(record.id) };
}

export function eliminarUsuario(id) {
  return request(`usuarios/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
