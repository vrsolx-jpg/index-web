import { useEffect, useRef, useState } from 'react';
import { formatCOP } from './format.js';
import { getTotals, placeOrder, updateUser, useCart, useCurrentUser } from './shopStore.js';
import './Shop.css';

const METODOS = [
  { id: 'tarjeta', nombre: 'Tarjeta', nota: 'Crédito o débito' },
  { id: 'pse', nombre: 'PSE', nota: 'Débito desde tu banco' },
  { id: 'nequi', nombre: 'Nequi', nota: 'Pago desde la app' },
  { id: 'contraentrega', nombre: 'Contra entrega', nota: 'Pagas al recibir' },
];

const BANCOS = [
  'Bancolombia',
  'Davivienda',
  'Banco de Bogotá',
  'BBVA Colombia',
  'Banco de Occidente',
  'Banco Caja Social',
  'Banco Popular',
];

const PASOS = ['Entrega', 'Pago', 'Listo'];

const soloDigitos = (texto) => texto.replace(/\D/g, '');

function formatearNumeroTarjeta(texto) {
  return soloDigitos(texto).slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatearVencimiento(texto) {
  const digitos = soloDigitos(texto).slice(0, 4);
  return digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos;
}

function Resumen({ lineas, totales }) {
  return (
    <aside className="checkout-summary" aria-label="Resumen del pedido">
      <h3>Resumen del pedido</h3>
      <ul>
        {lineas.map((linea) => (
          <li key={linea.id}>
            <div className="cart-thumb">
              {linea.image ? <img src={linea.image} alt="" /> : <span aria-hidden="true">✦</span>}
              <small>{linea.cantidad}</small>
            </div>
            <span className="checkout-summary-name">{linea.nombre}</span>
            <strong>{formatCOP(linea.precioCOP * linea.cantidad)}</strong>
          </li>
        ))}
      </ul>
      <dl className="cart-totals">
        <div><dt>Subtotal</dt><dd>{formatCOP(totales.subtotal)}</dd></div>
        <div><dt>Envío</dt><dd>{totales.costoEnvio === 0 ? 'Gratis' : formatCOP(totales.costoEnvio)}</dd></div>
        <div className="is-total"><dt>Total</dt><dd>{formatCOP(totales.total)}</dd></div>
      </dl>
    </aside>
  );
}

function CheckoutModal({ onClose, onViewOrders }) {
  const usuario = useCurrentUser();
  const carrito = useCart();
  const [paso, setPaso] = useState(1);
  const [fase, setFase] = useState('formulario');
  const [entrega, setEntrega] = useState(() => ({
    nombre: usuario?.name ?? '',
    telefono: usuario?.phone ?? '',
    ciudad: usuario?.city ?? '',
    direccion: usuario?.address ?? '',
    notas: '',
  }));
  const [metodo, setMetodo] = useState('tarjeta');
  const [tarjeta, setTarjeta] = useState({ numero: '', titular: '', vence: '', cvv: '' });
  const [banco, setBanco] = useState('');
  const [celular, setCelular] = useState('');
  const [guardarDatos, setGuardarDatos] = useState(true);
  const [pedido, setPedido] = useState(null);
  const [error, setError] = useState('');
  const temporizador = useRef(null);


  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  const lineas = pedido ? pedido.lineas : carrito;
  const totales = pedido ?? getTotals(carrito);
  const indicePaso = fase === 'listo' ? 2 : paso - 1;

  function cambiarEntrega(campo) {
    return (evento) => setEntrega((actual) => ({ ...actual, [campo]: evento.target.value }));
  }

  function cambiarTarjeta(campo, formatear = (valor) => valor) {
    return (evento) => setTarjeta((actual) => ({ ...actual, [campo]: formatear(evento.target.value) }));
  }

  function continuarAPago(evento) {
    evento.preventDefault();
    setPaso(2);
  }

  function describirPago() {
    if (metodo === 'tarjeta') {
      return `Tarjeta terminada en ${soloDigitos(tarjeta.numero).slice(-4) || '----'}`;
    }
    if (metodo === 'pse') return `PSE (${banco})`;
    if (metodo === 'nequi') return `Nequi ${celular}`;
    return 'Contra entrega';
  }

  function pagar(evento) {
    evento.preventDefault();
    setError('');
    setFase('procesando');

    // Simulación: espera un momento y registra el pedido. No se cobra nada.
    temporizador.current = window.setTimeout(() => {
      const nuevo = placeOrder({ entrega, pago: describirPago() });

      if (!nuevo) {
        setError('No pudimos crear el pedido porque tu carrito está vacío.');
        setFase('formulario');
        return;
      }
      if (guardarDatos) {
        updateUser({ phone: entrega.telefono, city: entrega.ciudad, address: entrega.direccion });
      }
      setPedido(nuevo);
      setFase('listo');
    }, 1800);
  }

  function contenido() {
    if (fase === 'procesando') {
      return (
        <div className="checkout-status" role="status" aria-live="polite">
          <span className="checkout-spinner" aria-hidden="true" />
          <h2>Procesando tu pago…</h2>
          <p>Esto toma solo un momento. No cierres esta ventana.</p>
        </div>
      );
    }

    if (fase === 'listo' && pedido) {
      return (
        <div className="checkout-status" role="status">
          <svg className="checkout-check" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="28" />
            <path d="m20 33 8 8 16-18" />
          </svg>
          <h2>¡Pedido confirmado!</h2>
          <p className="checkout-order-id">Pedido {pedido.id}</p>
          <p>
            Pagaste {formatCOP(pedido.total)} con {pedido.pago.toLowerCase()}.
            Lo encuentras en <strong>Mis pedidos</strong>, dentro de tu perfil.
          </p>
          <p className="checkout-demo-note">Pago simulado: no se hizo ningún cobro real.</p>
          <div className="checkout-actions is-centered">
            <button type="button" className="shop-primary" onClick={onViewOrders}>
              Ver mis pedidos
            </button>
            <button type="button" className="shop-secondary" onClick={onClose}>
              Seguir comprando
            </button>
          </div>
        </div>
      );
    }

    if (carrito.length === 0) {
      return (
        <div className="checkout-status">
          <h2>Tu carrito está vacío</h2>
          <p>Agrega productos antes de pasar al pago.</p>
          <button type="button" className="shop-primary" onClick={onClose}>Volver a la tienda</button>
        </div>
      );
    }

    if (paso === 1) {
      return (
        <form className="auth-form" onSubmit={continuarAPago}>
          <h2>¿A dónde enviamos tu pedido?</h2>
          <div className="checkout-row">
            <label>
              Nombre completo
              <input type="text" autoComplete="name" value={entrega.nombre} onChange={cambiarEntrega('nombre')} required />
            </label>
            <label>
              Teléfono
              <input type="tel" autoComplete="tel" inputMode="tel" value={entrega.telefono} onChange={cambiarEntrega('telefono')} required />
            </label>
          </div>
          <div className="checkout-row">
            <label>
              Ciudad
              <input type="text" autoComplete="address-level2" value={entrega.ciudad} onChange={cambiarEntrega('ciudad')} required />
            </label>
            <label>
              Dirección
              <input type="text" autoComplete="street-address" placeholder="Calle, número, barrio" value={entrega.direccion} onChange={cambiarEntrega('direccion')} required />
            </label>
          </div>
          <label>
            Indicaciones para la entrega (opcional)
            <input type="text" placeholder="Torre, apartamento, punto de referencia…" value={entrega.notas} onChange={cambiarEntrega('notas')} />
          </label>
          <div className="checkout-actions">
            <button type="button" className="shop-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="shop-primary">Continuar al pago</button>
          </div>
        </form>
      );
    }

    return (
      <form className="auth-form" onSubmit={pagar}>
        <h2>¿Cómo quieres pagar?</h2>
        <div className="pay-methods" role="radiogroup" aria-label="Método de pago">
          {METODOS.map((opcion) => (
            <button
              type="button"
              role="radio"
              aria-checked={metodo === opcion.id}
              className={`pay-method${metodo === opcion.id ? ' is-selected' : ''}`}
              key={opcion.id}
              onClick={() => setMetodo(opcion.id)}
            >
              <strong>{opcion.nombre}</strong>
              <small>{opcion.nota}</small>
            </button>
          ))}
        </div>

        {metodo === 'tarjeta' && (
          <>
            <label>
              Número de tarjeta
              <input type="text" inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" value={tarjeta.numero} onChange={cambiarTarjeta('numero', formatearNumeroTarjeta)} required />
            </label>
            <label>
              Nombre en la tarjeta
              <input type="text" autoComplete="cc-name" value={tarjeta.titular} onChange={cambiarTarjeta('titular')} required />
            </label>
            <div className="checkout-row">
              <label>
                Vencimiento
                <input type="text" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" value={tarjeta.vence} onChange={cambiarTarjeta('vence', formatearVencimiento)} required />
              </label>
              <label>
                CVV
                <input type="password" inputMode="numeric" autoComplete="cc-csc" placeholder="•••" value={tarjeta.cvv} onChange={cambiarTarjeta('cvv', (valor) => soloDigitos(valor).slice(0, 4))} required />
              </label>
            </div>
          </>
        )}

        {metodo === 'pse' && (
          <label>
            Banco
            <select value={banco} onChange={(evento) => setBanco(evento.target.value)} required>
              <option value="" disabled>Elige tu banco</option>
              {BANCOS.map((nombre) => <option key={nombre} value={nombre}>{nombre}</option>)}
            </select>
          </label>
        )}

        {metodo === 'nequi' && (
          <label>
            Celular con Nequi
            <input type="tel" inputMode="numeric" placeholder="300 123 4567" value={celular} onChange={(evento) => setCelular(soloDigitos(evento.target.value).slice(0, 10))} required />
          </label>
        )}

        {metodo === 'contraentrega' && (
          <p className="checkout-hint">Pagas en efectivo cuando recibas tu pedido.</p>
        )}

        <label className="auth-terms">
          <input type="checkbox" checked={guardarDatos} onChange={(evento) => setGuardarDatos(evento.target.checked)} />
          <span>Guardar mis datos de entrega en mi perfil.</span>
        </label>

        <p className="checkout-demo-note">Pago simulado: no se hace ningún cobro real.</p>
        {error && <p className="checkout-error" role="alert">{error}</p>}

        <div className="checkout-actions">
          <button type="button" className="shop-secondary" onClick={() => setPaso(1)}>Volver</button>
          <button type="submit" className="shop-primary">Pagar {formatCOP(totales.total)}</button>
        </div>
      </form>
    );
  }

  return (
    <div className="auth-overlay">
      <section className="checkout-dialog" role="dialog" aria-modal="true" aria-label="Pasarela de pago">
        {fase !== 'procesando' && (
          <button type="button" className="auth-close" aria-label="Cerrar" onClick={onClose}>×</button>
        )}
        <div className="checkout-main">
          <ol className="checkout-steps" aria-label="Progreso del pago">
            {PASOS.map((nombre, indice) => (
              <li
                key={nombre}
                className={indice < indicePaso ? 'is-done' : indice === indicePaso ? 'is-current' : ''}
                aria-current={indice === indicePaso ? 'step' : undefined}
              >
                <span>{indice < indicePaso ? '✓' : indice + 1}</span>
                {nombre}
              </li>
            ))}
          </ol>
          {contenido()}
        </div>
        {lineas.length > 0 && <Resumen lineas={lineas} totales={totales} />}
      </section>
    </div>
  );
}

export default CheckoutModal;
