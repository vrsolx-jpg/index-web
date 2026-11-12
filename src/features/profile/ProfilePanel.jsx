import { useState } from 'react';
import { formatCOP, formatFecha } from '../shop/format.js';
import { logoutUser, updateUser, useCurrentUser, useOrders } from '../shop/shopStore.js';
import '../shop/Shop.css';
import './ProfilePanel.css';

const CAMPOS = ['name', 'phone', 'city', 'address'];

function TabDatos({ usuario, onLogout }) {
  const [form, setForm] = useState(() => (
    Object.fromEntries(CAMPOS.map((campo) => [campo, usuario[campo] ?? '']))
  ));
  const [estado, setEstado] = useState('');
  const hayCambios = CAMPOS.some((campo) => form[campo].trim() !== (usuario[campo] ?? ''));

  function cambiar(campo) {
    return (evento) => {
      setForm((actual) => ({ ...actual, [campo]: evento.target.value }));
      setEstado('');
    };
  }

  function guardar(evento) {
    evento.preventDefault();
    updateUser(form);
    setEstado('Cambios guardados.');
  }

  return (
    <form className="auth-form" onSubmit={guardar}>
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
        <label>
          Ciudad
          <input type="text" autoComplete="address-level2" value={form.city} onChange={cambiar('city')} />
        </label>
      </div>
      <label>
        Dirección de entrega
        <input type="text" autoComplete="street-address" placeholder="Calle, número, barrio" value={form.address} onChange={cambiar('address')} />
      </label>
      <p className="profile-hint">Usamos estos datos para llenar tu pedido más rápido.</p>
      <div className="checkout-actions">
        <button type="button" className="shop-secondary" onClick={onLogout}>Cerrar sesión</button>
        <button type="submit" className="shop-primary" disabled={!hayCambios}>Guardar cambios</button>
      </div>
      {estado && <p className="profile-saved" role="status">{estado}</p>}
    </form>
  );
}

function TabPedidos({ pedidos, onExplore }) {
  if (pedidos.length === 0) {
    return (
      <div className="profile-empty">
        <p>Todavía no has hecho pedidos. Cuando compres, aparecerán aquí.</p>
        <button type="button" className="shop-primary" onClick={onExplore}>Explorar productos</button>
      </div>
    );
  }

  return (
    <ul className="order-list">
      {pedidos.map((pedido) => {
        const unidades = pedido.lineas.reduce((suma, linea) => suma + linea.cantidad, 0);
        return (
          <li key={pedido.id}>
            <details className="order-card">
              <summary>
                <span className="order-main">
                  <strong>Pedido {pedido.id}</strong>
                  <small>{formatFecha(pedido.createdAt)} · {unidades} {unidades === 1 ? 'producto' : 'productos'}</small>
                </span>
                <span className="order-chip">{pedido.estado}</span>
                <strong className="order-total">{formatCOP(pedido.total)}</strong>
              </summary>
              <div className="order-detail">
                <ul className="order-lines">
                  {pedido.lineas.map((linea) => (
                    <li key={linea.id}>
                      <div className="cart-thumb">
                        {linea.image ? <img src={linea.image} alt="" /> : <span aria-hidden="true">✦</span>}
                      </div>
                      <span>{linea.cantidad} × {linea.nombre}</span>
                      <strong>{formatCOP(linea.precioCOP * linea.cantidad)}</strong>
                    </li>
                  ))}
                </ul>
                <dl className="order-meta">
                  <div><dt>Entrega</dt><dd>{pedido.entrega.nombre}, {pedido.entrega.direccion}, {pedido.entrega.ciudad}</dd></div>
                  <div><dt>Pago</dt><dd>{pedido.pago}</dd></div>
                  <div><dt>Subtotal</dt><dd>{formatCOP(pedido.subtotal)}</dd></div>
                  <div><dt>Envío</dt><dd>{pedido.costoEnvio === 0 ? 'Gratis' : formatCOP(pedido.costoEnvio)}</dd></div>
                </dl>
              </div>
            </details>
          </li>
        );
      })}
    </ul>
  );
}

function ProfilePanel({ initialTab = 'datos', onClose, onExplore, onLogout }) {
  const usuario = useCurrentUser();
  const pedidos = useOrders();
  const [pestana, setPestana] = useState(initialTab);

  if (!usuario) return null;

  function cerrarSesion() {
    logoutUser();
    onLogout();
  }

  return (
    <div
      className="auth-overlay"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onClose();
      }}
    >
      <section className="profile-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <button type="button" className="auth-close" aria-label="Cerrar" onClick={onClose}>×</button>
        <header className="profile-head">
          <span className="profile-avatar" aria-hidden="true">{usuario.name.charAt(0).toUpperCase()}</span>
          <div>
            <h2 id="profile-title">Hola, {usuario.name.split(' ')[0]}</h2>
            <p>{usuario.email}</p>
          </div>
        </header>
        <div className="profile-tabs" role="tablist" aria-label="Secciones del perfil">
          <button type="button" role="tab" aria-selected={pestana === 'datos'} className={pestana === 'datos' ? 'is-selected' : ''} onClick={() => setPestana('datos')}>
            Mis datos
          </button>
          <button type="button" role="tab" aria-selected={pestana === 'pedidos'} className={pestana === 'pedidos' ? 'is-selected' : ''} onClick={() => setPestana('pedidos')}>
            Mis pedidos{pedidos.length > 0 && <span className="profile-tab-count">{pedidos.length}</span>}
          </button>
        </div>
        <div className="profile-body" role="tabpanel">
          {pestana === 'datos'
            ? <TabDatos usuario={usuario} onLogout={cerrarSesion} />
            : <TabPedidos pedidos={pedidos} onExplore={onExplore} />}
        </div>
      </section>
    </div>
  );
}

export default ProfilePanel;
