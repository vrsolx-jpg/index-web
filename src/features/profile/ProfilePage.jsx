import { useEffect, useState } from 'react';
import CardVisual from '../shop/CardVisual.jsx';
import FloatingDecorations from '../shared/FloatingDecorations.jsx';
import { formatCOP, formatFecha } from '../shop/format.js';
import {
  MARCAS,
  TIPOS_DOCUMENTO,
  detectarMarca,
  enmascarar,
  formatearNumeroTarjeta,
  formatearVencimiento,
  soloDigitos,
  validarNumeroTarjeta,
  validarVencimiento,
} from '../shop/pagos.js';
import {
  addCard,
  logoutUser,
  removeAddress,
  removeCard,
  saveAddress,
  setDefaultAddress,
  setDefaultCard,
  guardarPerfil,
  cargarPerfil,
  marcarSeccionLeida,
  useProfileRead,
  useAddresses,
  useCards,
  useCurrentUser,
  useOrders,
} from '../shop/shopStore.js';
import '../shop/Shop.css';
import './ProfileModal.css';
import './ProfilePage.css';

const mesAnio = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' });

const iconos = {
  cuenta: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  pedidos: <><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></>,
  tarjetas: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 10h18M7 15h4" /></>,
  direcciones: <><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
};

const SECCIONES = [
  { id: 'cuenta', nombre: 'Mi cuenta' },
  { id: 'pedidos', nombre: 'Mis pedidos' },
  { id: 'tarjetas', nombre: 'Mis tarjetas' },
  { id: 'direcciones', nombre: 'Mis direcciones' },
];

function Icono({ nombre }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">{iconos[nombre]}</svg>
  );
}

function Cabecera({ titulo, texto, accion }) {
  return (
    <header className="pf-section-head">
      <div>
        <h2>{titulo}</h2>
        {texto && <p>{texto}</p>}
      </div>
      {accion}
    </header>
  );
}

/* ---------- Mi cuenta ---------- */

function SeccionCuenta({ usuario, cantidades, onSeccion }) {
  const [form, setForm] = useState(() => ({
    name: usuario.name,
    phone: usuario.phone ?? '',
    documentType: usuario.documentType || 'CC',
    documentNumber: usuario.documentNumber ?? '',
  }));
  const [estado, setEstado] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const hayCambios = form.name.trim() !== usuario.name
    || form.phone.trim() !== (usuario.phone ?? '')
    || form.documentType !== (usuario.documentType || 'CC')
    || form.documentNumber.trim() !== (usuario.documentNumber ?? '');

  function cambiar(campo) {
    return (evento) => {
      setForm((actual) => ({ ...actual, [campo]: evento.target.value }));
      setEstado('');
      setError('');
    };
  }

  async function guardar(evento) {
    evento.preventDefault();
    if (guardando) return;
    if (form.name.trim().length < 2) { setError('Escribe tu nombre completo.'); return; }
    setGuardando(true);
    setError('');
    setEstado('');
    try {
      await guardarPerfil(form);
      setEstado('Tu información se guardó correctamente.');
    } catch (error) { setError(error.message); }
    finally { setGuardando(false); }
  }

  return (
    <>
      <Cabecera
        titulo="Mi cuenta"
        texto={`Cliente desde ${mesAnio.format(new Date(usuario.createdAt))}.`}
      />

      <ul className="pf-stats">
        {SECCIONES.slice(1).map((seccion) => (
          <li key={seccion.id}>
            <button type="button" onClick={() => onSeccion(seccion.id)}>
              <Icono nombre={seccion.id} />
              <strong>{cantidades[seccion.id]}</strong>
              <span>{seccion.nombre.replace('Mis ', '')}</span>
            </button>
          </li>
        ))}
      </ul>

      <form className="auth-form pf-form" onSubmit={guardar}>
        <div className="checkout-row">
          <label>
            Nombre
            <input type="text" autoComplete="name" value={form.name} onChange={cambiar('name')} required />
          </label>
          <label>
            Correo electrónico
            <input type="email" value={usuario.email} disabled />
          </label>
        </div>
        <div className="checkout-row">
          <label>
            Teléfono
            <input type="tel" autoComplete="tel" inputMode="tel" placeholder="300 123 4567" value={form.phone} onChange={cambiar('phone')} />
          </label>
          <div className="checkout-row is-document">
            <label>
              Documento
              <select value={form.documentType} onChange={cambiar('documentType')}>
                {TIPOS_DOCUMENTO.map((tipo) => <option key={tipo.id} value={tipo.id}>{tipo.id}</option>)}
              </select>
            </label>
            <label>
              Número
              <input type="text" inputMode="numeric" value={form.documentNumber} onChange={cambiar('documentNumber')} />
            </label>
          </div>
        </div>
        <p className="profile-hint">Usamos estos datos para completar tus pedidos y pagos más rápido.</p>
        <div className="pf-form-actions">
          {estado && <p className="profile-saved" role="status">{estado}</p>}
          {error && <p className="checkout-error" role="alert">{error}</p>}
          <button type="submit" className="shop-primary" disabled={!hayCambios || guardando}>{guardando ? 'Guardando…' : 'Guardar cambios'}</button>
        </div>
      </form>
    </>
  );
}

/* ---------- Mis pedidos ---------- */

function SeccionPedidos({ pedidos, onExplore }) {
  return (
    <>
      <Cabecera titulo="Mis pedidos" texto="Aquí ves el historial de tus compras y el estado de cada una." />
      {pedidos.length === 0 ? (
        <div className="profile-empty">
          <p>Todavía no has hecho pedidos. Cuando compres, aparecerán aquí.</p>
          <button type="button" className="shop-primary" onClick={onExplore}>Explorar productos</button>
        </div>
      ) : (
        <ul className="order-list">
          {pedidos.map((pedido) => {
            const unidades = pedido.lineas.reduce((suma, linea) => suma + linea.cantidad, 0);
            const pendiente = pedido.estado === 'Pendiente de pago';
            return (
              <li key={pedido.id}>
                <details className="order-card">
                  <summary>
                    <span className="order-main">
                      <strong>Pedido {pedido.id}</strong>
                      <small>{formatFecha(pedido.createdAt)} · {unidades} {unidades === 1 ? 'producto' : 'productos'}</small>
                    </span>
                    <span className={`order-chip${pendiente ? ' is-pending' : ''}`}>{pedido.estado}</span>
                    <strong className="order-total">{formatCOP(pedido.total)}</strong>
                  </summary>
                  <div className="order-detail">
                    <ul className="order-lines">
                      {pedido.lineas.map((linea) => (
                        <li key={linea.id}>
                          <div className="cart-thumb">
                            {linea.image ? <img src={linea.image} alt="" /> : <span aria-hidden="true">✦</span>}
                          </div>
                          <span>{linea.cantidad} × {linea.nombre}{linea.colorElegido && <small className="cart-line-color">Color: {linea.colorElegido}</small>}</span>
                          <strong>{formatCOP(linea.precioCOP * linea.cantidad)}</strong>
                        </li>
                      ))}
                    </ul>
                    <dl className="order-meta">
                      <div><dt>Entrega</dt><dd>{pedido.entrega.nombre}, {pedido.entrega.direccion}, {pedido.entrega.ciudad}</dd></div>
                      <div><dt>Pago</dt><dd>{pedido.pago}</dd></div>
                      {pedido.referencia && <div><dt>Referencia</dt><dd>{pedido.referencia}</dd></div>}
                      <div><dt>Subtotal</dt><dd>{formatCOP(pedido.subtotal)}</dd></div>
                      <div><dt>Envío</dt><dd>{pedido.costoEnvio === 0 ? 'Gratis' : formatCOP(pedido.costoEnvio)}</dd></div>
                    </dl>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

/* ---------- Mis tarjetas ---------- */

const TARJETA_VACIA = { numero: '', titular: '', vence: '', tipo: 'credito' };

function SeccionTarjetas() {
  const tarjetas = useCards();
  const [agregando, setAgregando] = useState(false);
  const [confirmarId, setConfirmarId] = useState(null);
  const [form, setForm] = useState(TARJETA_VACIA);
  const [error, setError] = useState('');
  const marca = detectarMarca(form.numero);

  function cambiar(campo, formatear = (valor) => valor) {
    return (evento) => {
      setForm((actual) => ({ ...actual, [campo]: formatear(evento.target.value) }));
      setError('');
    };
  }

  function cerrarFormulario() {
    setAgregando(false);
    setForm(TARJETA_VACIA);
    setError('');
  }

  function guardar(evento) {
    evento.preventDefault();
    const problema = validarNumeroTarjeta(form.numero)
      || (form.titular.trim().length < 3 ? 'Escribe el nombre como aparece en la tarjeta.' : '')
      || validarVencimiento(form.vence);
    if (problema) {
      setError(problema);
      return;
    }
    // Solo se conservan marca, últimos 4 dígitos, titular y vencimiento.
    addCard({
      marca,
      ultimos4: soloDigitos(form.numero).slice(-4),
      titular: form.titular,
      vence: form.vence,
      tipo: form.tipo,
    });
    cerrarFormulario();
  }

  return (
    <>
      <Cabecera
        titulo="Mis tarjetas"
        texto="Guarda tus tarjetas para pagar más rápido. Solo almacenamos la marca y los últimos 4 dígitos: nunca el número completo ni el CVV."
        accion={!agregando && (
          <button type="button" className="shop-primary" onClick={() => setAgregando(true)}>Agregar tarjeta</button>
        )}
      />

      {agregando && (
        <form className="auth-form pf-card-form" onSubmit={guardar} noValidate>
          <h3>Nueva tarjeta</h3>
          <div className="pf-card-form-grid">
            <CardVisual
              marca={marca}
              numero={form.numero}
              titular={form.titular.toUpperCase()}
              vence={form.vence}
            />
            <div className="pf-card-form-fields">
              <label>
                Número de tarjeta
                <input type="text" inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" value={form.numero} onChange={cambiar('numero', formatearNumeroTarjeta)} />
              </label>
              <label>
                Nombre en la tarjeta
                <input type="text" autoComplete="cc-name" placeholder="Como aparece en la tarjeta" value={form.titular} onChange={cambiar('titular')} />
              </label>
              <div className="checkout-row">
                <label>
                  Vencimiento
                  <input type="text" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" value={form.vence} onChange={cambiar('vence', formatearVencimiento)} />
                </label>
                <div className="pay-segment" role="radiogroup" aria-label="Tipo de tarjeta">
                  {['credito', 'debito'].map((tipo) => (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={form.tipo === tipo}
                      className={form.tipo === tipo ? 'is-selected' : ''}
                      key={tipo}
                      onClick={() => setForm((actual) => ({ ...actual, tipo }))}
                    >
                      {tipo === 'credito' ? 'Crédito' : 'Débito'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <p className="profile-hint">Para probar: 4242 4242 4242 4242 y cualquier fecha futura.</p>
          {error && <p className="checkout-error" role="alert">{error}</p>}
          <div className="pf-form-actions">
            <button type="button" className="shop-secondary" onClick={cerrarFormulario}>Cancelar</button>
            <button type="submit" className="shop-primary">Guardar tarjeta</button>
          </div>
        </form>
      )}

      {tarjetas.length === 0 && !agregando && (
        <div className="profile-empty">
          <p>Aún no tienes tarjetas guardadas. Agrega una o guárdala cuando pagues un pedido.</p>
        </div>
      )}

      <ul className="pf-card-list">
        {tarjetas.map((tarjeta) => (
          <li className="pf-saved-card" key={tarjeta.id}>
            <CardVisual
              marca={tarjeta.marca}
              numero={enmascarar(tarjeta.marca, tarjeta.ultimos4)}
              titular={tarjeta.titular.toUpperCase()}
              vence={tarjeta.vence}
            />
            <div className="pf-saved-card-info">
              <p>
                <strong>{MARCAS[tarjeta.marca].nombre} {tarjeta.tipo === 'credito' ? 'crédito' : 'débito'}</strong>
                {tarjeta.predeterminada && <span className="saved-tag">Predeterminada</span>}
              </p>
              <p className="pf-muted">Termina en {tarjeta.ultimos4} · vence {tarjeta.vence}</p>
              <div className="pf-actions">
                {!tarjeta.predeterminada && (
                  <button type="button" className="shop-link" onClick={() => setDefaultCard(tarjeta.id)}>Usar como predeterminada</button>
                )}
                {confirmarId === tarjeta.id ? (
                  <span className="pf-confirm">
                    ¿Eliminar?
                    <button type="button" className="shop-link is-danger" onClick={() => { removeCard(tarjeta.id); setConfirmarId(null); }}>Sí, eliminar</button>
                    <button type="button" className="shop-link" onClick={() => setConfirmarId(null)}>No</button>
                  </span>
                ) : (
                  <button type="button" className="shop-link is-danger" onClick={() => setConfirmarId(tarjeta.id)}>Eliminar</button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ---------- Mis direcciones ---------- */

const DIRECCION_VACIA = {
  alias: 'Casa', nombre: '', telefono: '', ciudad: '', direccion: '', indicaciones: '', predeterminada: false,
};

function SeccionDirecciones({ usuario }) {
  const direcciones = useAddresses();
  const [editando, setEditando] = useState(null); // null | 'nueva' | id
  const [confirmarId, setConfirmarId] = useState(null);
  const [form, setForm] = useState(DIRECCION_VACIA);
  const [guardando, setGuardando] = useState(false);
  const [estado, setEstado] = useState('');
  const [error, setError] = useState('');

  function abrirNueva() {
    setError('');
    setEstado('');
    setForm({
      ...DIRECCION_VACIA,
      nombre: usuario.name,
      telefono: usuario.phone ?? '',
      predeterminada: direcciones.length === 0,
    });
    setEditando('nueva');
  }

  function abrirEdicion(direccion) {
    setError('');
    setEstado('');
    setForm({
      alias: direccion.alias || 'Otra',
      nombre: direccion.nombre,
      telefono: direccion.telefono,
      ciudad: direccion.ciudad,
      direccion: direccion.direccion,
      indicaciones: direccion.indicaciones ?? '',
      predeterminada: direccion.predeterminada,
    });
    setEditando(direccion.id);
  }

  function cambiar(campo) {
    return (evento) => setForm((actual) => ({ ...actual, [campo]: evento.target.value }));
  }

  async function guardar(evento) {
    evento.preventDefault();
    if (guardando) return;
    setGuardando(true); setError(''); setEstado('');
    try {
      await saveAddress({ ...form, id: editando === 'nueva' ? undefined : editando });
      setEditando(null);
      setEstado('Dirección guardada correctamente. Ya puedes usarla al pagar.');
    } catch (error) { setError(error.message); }
    finally { setGuardando(false); }
  }

  async function eliminar(id) {
    setGuardando(true); setError(''); setEstado('');
    try {
      await removeAddress(id);
      setConfirmarId(null);
      setEstado('Dirección eliminada.');
    } catch (error) { setError(error.message); }
    finally { setGuardando(false); }
  }

  return (
    <>
      <Cabecera
        titulo="Mis direcciones"
        texto="Guarda los lugares donde recibes tus pedidos y elígelos al pagar."
        accion={!editando && (
          <button type="button" className="shop-primary" onClick={abrirNueva}>Agregar dirección</button>
        )}
      />

      {estado && <p className="notification is-success is-light" role="status">{estado}</p>}
      {error && <p className="notification is-danger is-light" role="alert">{error}</p>}
      {editando && (
        <form className="auth-form pf-address-form" onSubmit={guardar}>
          <h3>{editando === 'nueva' ? 'Nueva dirección' : 'Editar dirección'}</h3>
          <div className="checkout-row">
            <label>
              Nombre de la dirección
              <select value={form.alias} onChange={cambiar('alias')}>
                <option value="Casa">Casa</option>
                <option value="Oficina">Oficina</option>
                <option value="Trabajo">Trabajo</option>
                <option value="Otra">Otra</option>
              </select>
            </label>
            <label>
              Ciudad
              <input type="text" autoComplete="address-level2" value={form.ciudad} onChange={cambiar('ciudad')} required />
            </label>
          </div>
          <div className="checkout-row">
            <label>
              Nombre de quien recibe
              <input type="text" autoComplete="name" value={form.nombre} onChange={cambiar('nombre')} required />
            </label>
            <label>
              Teléfono de contacto
              <input type="tel" autoComplete="tel" inputMode="tel" value={form.telefono} onChange={cambiar('telefono')} required />
            </label>
          </div>
          <label>
            Dirección
            <input type="text" autoComplete="street-address" placeholder="Calle, número, barrio" value={form.direccion} onChange={cambiar('direccion')} required />
          </label>
          <label>
            Indicaciones para la entrega (opcional)
            <input type="text" placeholder="Torre, apartamento, punto de referencia…" value={form.indicaciones} onChange={cambiar('indicaciones')} />
          </label>
          <label className="auth-terms">
            <input
              type="checkbox"
              checked={form.predeterminada}
              onChange={(evento) => setForm((actual) => ({ ...actual, predeterminada: evento.target.checked }))}
            />
            <span>Usar como dirección predeterminada.</span>
          </label>
          <div className="pf-form-actions">
            <button type="button" className="shop-secondary" onClick={() => setEditando(null)} disabled={guardando}>Cancelar</button>
            <button type="submit" className="shop-primary" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar dirección'}</button>
          </div>
        </form>
      )}

      {direcciones.length === 0 && !editando && (
        <div className="profile-empty">
          <p>Aún no tienes direcciones guardadas.</p>
        </div>
      )}

      <ul className="pf-address-list">
        {direcciones.map((direccion) => (
          <li className="pf-address" key={direccion.id}>
            <p className="pf-address-title">
              <strong>{direccion.alias || 'Dirección'}</strong>
              {direccion.predeterminada && <span className="saved-tag">Predeterminada</span>}
            </p>
            <p>{direccion.nombre} · {direccion.telefono}</p>
            <p>{direccion.direccion}, {direccion.ciudad}</p>
            {direccion.indicaciones && <p className="pf-muted">{direccion.indicaciones}</p>}
            <div className="pf-actions">
              <button type="button" className="shop-link" onClick={() => abrirEdicion(direccion)}>Editar</button>
              {!direccion.predeterminada && (
                <button type="button" className="shop-link" onClick={() => setDefaultAddress(direccion.id)}>Usar como predeterminada</button>
              )}
              {confirmarId === direccion.id ? (
                <span className="pf-confirm">
                  ¿Eliminar?
                  <button type="button" className="shop-link is-danger" disabled={guardando} onClick={() => eliminar(direccion.id)}>Sí, eliminar</button>
                  <button type="button" className="shop-link" onClick={() => setConfirmarId(null)}>No</button>
                </span>
              ) : (
                <button type="button" className="shop-link is-danger" onClick={() => setConfirmarId(direccion.id)}>Eliminar</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ---------- Página ---------- */

function ProfilePage({
  seccion = 'cuenta',
  header,
  onSeccion,
  onExplore,
  onLogin,
  onLogout,
}) {
  const usuario = useCurrentUser();
  const pedidos = useOrders();
  const tarjetas = useCards();
  const direcciones = useAddresses();
  const leidas = useProfileRead();
  const [sync, setSync] = useState({ loading: true, error: '' });

  const cantidades = { pedidos: pedidos.length, tarjetas: tarjetas.length, direcciones: direcciones.length };
  const seccionActual = SECCIONES.some((item) => item.id === seccion) ? seccion : 'cuenta';

  function cerrarSesion() {
    logoutUser();
    onLogout();
  }

  useEffect(() => {
    let activa = true;
    cargarPerfil({ force: true })
      .then(() => { if (activa) setSync({ loading: false, error: '' }); })
      .catch((error) => { if (activa) setSync({ loading: false, error: error.message }); });
    return () => { activa = false; };
  }, [usuario?.email]);

  useEffect(() => {
    const listas = { pedidos, tarjetas, direcciones };
    if (listas[seccionActual]) marcarSeccionLeida(seccionActual, listas[seccionActual].map((item) => item.id));
  }, [seccionActual, pedidos, tarjetas, direcciones]);

  async function reintentar() {
    setSync({ loading: true, error: '' });
    try { await cargarPerfil({ force: true }); setSync({ loading: false, error: '' }); }
    catch (error) { setSync({ loading: false, error: error.message }); }
  }

  const novedades = Object.fromEntries(Object.entries({ pedidos, tarjetas, direcciones }).map(([tipo, lista]) => [
    tipo, lista.filter((item) => !(leidas[tipo] ?? []).includes(item.id)).length,
  ]));

  if (!usuario) {
    return (
      <div className="profile-page">
        {header}
        <FloatingDecorations />
        <main className="pf-gate">
          <h1>Mi perfil</h1>
          <p>Inicia sesión para ver tus datos, tus pedidos, tus tarjetas y tus direcciones.</p>
          <button type="button" className="shop-primary" onClick={onLogin}>Iniciar sesión</button>
        </main>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {header}
        <FloatingDecorations />
      <main className="pf-main">
        <header className="pf-hero">
          <span className="profile-avatar" aria-hidden="true">{usuario.name.charAt(0).toUpperCase()}</span>
          <div>
            <h1>Hola, {usuario.name.split(' ')[0]}</h1>
            <p>{usuario.email}</p>
          </div>
        </header>

        <button type="button" className="shop-link pf-explore" onClick={onExplore}>Seguir comprando →</button>
        <div className="pf-layout">
          <nav className="pf-nav" aria-label="Secciones del perfil">
            {SECCIONES.map((item) => (
              <button
                type="button"
                key={item.id}
                className={seccionActual === item.id ? 'is-selected' : ''}
                aria-current={seccionActual === item.id ? 'page' : undefined}
                onClick={() => onSeccion(item.id)}
              >
                <Icono nombre={item.id} />
                {item.nombre}
                {novedades[item.id] > 0 && <span className="profile-tab-count" aria-label={`${novedades[item.id]} novedades`}>{novedades[item.id]}</span>}
              </button>
            ))}
            <button type="button" className="pf-logout" onClick={cerrarSesion}>Cerrar sesión</button>
          </nav>

          <section className="pf-panel" aria-live="polite" aria-busy={sync.loading}>
            {sync.loading && <p role="status">Cargando tu perfil…</p>}
            {sync.error && <div className="notification is-danger is-light" role="alert">{sync.error} <button type="button" className="shop-link" onClick={reintentar}>Reintentar</button></div>}
            {!sync.loading && seccionActual === 'cuenta' && (
              <SeccionCuenta key={usuario.email} usuario={usuario} cantidades={cantidades} onSeccion={onSeccion} />
            )}
            {!sync.loading && seccionActual === 'pedidos' && <SeccionPedidos pedidos={pedidos} onExplore={onExplore} />}
            {!sync.loading && seccionActual === 'tarjetas' && <SeccionTarjetas />}
            {!sync.loading && seccionActual === 'direcciones' && <SeccionDirecciones usuario={usuario} />}
          </section>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
