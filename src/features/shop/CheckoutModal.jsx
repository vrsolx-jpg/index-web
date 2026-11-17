import { useEffect, useRef, useState } from 'react';
import CardVisual from './CardVisual.jsx';
import QRCode from './QRCode.jsx';
import { formatCOP } from './format.js';
import {
  BANCOS,
  CUOTAS,
  MARCAS,
  TIPOS_DOCUMENTO,
  ahoraMs,
  datosQrNequi,
  detectarMarca,
  enmascarar,
  enmascararCelular,
  formatearCelular,
  formatearNumeroTarjeta,
  formatearVencimiento,
  generarAprobacion,
  generarCus,
  generarReferenciaNequi,
  soloDigitos,
  validarCelular,
  validarCvv,
  validarDocumento,
  validarNumeroTarjeta,
  validarVencimiento,
} from './pagos.js';
import {
  addCard,
  getTotals,
  placeOrder,
  saveAddress,
  updateUser,
  useAddresses,
  useCards,
  useCart,
  useCurrentUser,
} from './shopStore.js';
import './Shop.css';

const METODOS = [
  { id: 'tarjeta', nombre: 'Tarjeta', nota: 'Crédito o débito' },
  { id: 'pse', nombre: 'PSE', nota: 'Débito desde tu banco' },
  { id: 'nequi', nombre: 'Nequi', nota: 'Pago con QR desde la app' },
  { id: 'contraentrega', nombre: 'Contra entrega', nota: 'Pagas al recibir' },
];

const PASOS = ['Entrega', 'Pago', 'Listo'];
const SEGUNDOS_QR = 5 * 60;
const MS_POR_ETAPA = 900;

const textoTipo = (tipo) => (tipo === 'credito' ? 'crédito' : 'débito');

function formatearTiempo(segundos) {
  const minutos = String(Math.floor(segundos / 60)).padStart(2, '0');
  const resto = String(segundos % 60).padStart(2, '0');
  return `${minutos}:${resto}`;
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
  const direcciones = useAddresses();
  const tarjetasGuardadas = useCards();

  const [paso, setPaso] = useState(1);
  const [fase, setFase] = useState('formulario');

  const [direccionId, setDireccionId] = useState(() => (
    (direcciones.find((direccion) => direccion.predeterminada) ?? direcciones[0])?.id ?? 'nueva'
  ));
  const [entrega, setEntrega] = useState(() => ({
    nombre: usuario?.name ?? '',
    telefono: usuario?.phone ?? '',
    ciudad: usuario?.city ?? '',
    direccion: usuario?.address ?? '',
    notas: '',
  }));
  const [guardarDireccion, setGuardarDireccion] = useState(true);
  const [aliasDireccion, setAliasDireccion] = useState('Casa');

  const [metodo, setMetodo] = useState('tarjeta');
  const [tarjetaId, setTarjetaId] = useState(() => (
    (tarjetasGuardadas.find((tarjeta) => tarjeta.predeterminada) ?? tarjetasGuardadas[0])?.id ?? 'nueva'
  ));
  const [tarjeta, setTarjeta] = useState({
    numero: '', titular: '', vence: '', cvv: '', tipo: 'credito', cuotas: '1',
  });
  const [guardarTarjeta, setGuardarTarjeta] = useState(false);
  const [documento, setDocumento] = useState(() => ({
    tipo: usuario?.documentType || 'CC',
    numero: usuario?.documentNumber ?? '',
  }));
  const [pse, setPse] = useState({ persona: 'natural', banco: '' });
  const [nequi, setNequi] = useState(() => ({
    nombre: usuario?.name ?? '',
    celular: formatearCelular(usuario?.phone ?? ''),
  }));

  const [mensajeProceso, setMensajeProceso] = useState('');
  const [nequiSesion, setNequiSesion] = useState(null);
  const [ahora, setAhora] = useState(0);
  const [pedido, setPedido] = useState(null);
  const [error, setError] = useState('');
  const temporizadores = useRef([]);

  useEffect(() => {
    const lista = temporizadores.current;
    return () => lista.forEach((id) => window.clearTimeout(id));
  }, []);

  useEffect(() => {
    if (fase !== 'nequi') return undefined;
    const intervalo = window.setInterval(() => setAhora(ahoraMs()), 1000);
    return () => window.clearInterval(intervalo);
  }, [fase]);

  const direccionGuardada = direcciones.find((direccion) => direccion.id === direccionId) ?? null;
  const usandoDireccionNueva = !direccionGuardada;
  const entregaActual = direccionGuardada
    ? {
      nombre: direccionGuardada.nombre,
      telefono: direccionGuardada.telefono,
      ciudad: direccionGuardada.ciudad,
      direccion: direccionGuardada.direccion,
      notas: direccionGuardada.indicaciones,
    }
    : entrega;

  const tarjetaGuardada = tarjetasGuardadas.find((item) => item.id === tarjetaId) ?? null;
  const marcaNueva = detectarMarca(tarjeta.numero);
  const esCredito = (tarjetaGuardada?.tipo ?? tarjeta.tipo) === 'credito';

  const lineas = pedido ? pedido.lineas : carrito;
  const totales = pedido ?? getTotals(carrito);
  const indicePaso = fase === 'listo' ? 2 : paso - 1;
  const restante = nequiSesion ? Math.max(0, Math.ceil((nequiSesion.expira - ahora) / 1000)) : 0;
  const codigoVencido = nequiSesion !== null && restante === 0;

  function cambiarEntrega(campo) {
    return (evento) => setEntrega((actual) => ({ ...actual, [campo]: evento.target.value }));
  }

  function cambiarTarjeta(campo, formatear = (valor) => valor) {
    return (evento) => {
      setTarjeta((actual) => ({ ...actual, [campo]: formatear(evento.target.value) }));
      setError('');
    };
  }

  function elegirTarjeta(id) {
    setTarjetaId(id);
    setTarjeta((actual) => ({ ...actual, cvv: '' }));
    setError('');
  }

  function continuarAPago(evento) {
    evento.preventDefault();
    setError('');
    setPaso(2);
  }

  function programar(retardo, accion) {
    temporizadores.current.push(window.setTimeout(accion, retardo));
  }

  /* Muestra los mensajes uno tras otro (como una pasarela real) y luego ejecuta alTerminar. */
  function procesar(mensajes, alTerminar) {
    setFase('procesando');
    setMensajeProceso(mensajes[0]);
    mensajes.slice(1).forEach((mensaje, indice) => {
      programar((indice + 1) * MS_POR_ETAPA, () => setMensajeProceso(mensaje));
    });
    programar(mensajes.length * MS_POR_ETAPA, alTerminar);
  }

  function validarFormularioPago() {
    if (metodo === 'tarjeta') {
      if (tarjetaGuardada) {
        return validarCvv(tarjeta.cvv, tarjetaGuardada.marca) || validarDocumento(documento.numero);
      }
      return validarNumeroTarjeta(tarjeta.numero)
        || (tarjeta.titular.trim().length < 3 ? 'Escribe el nombre como aparece en la tarjeta.' : '')
        || validarVencimiento(tarjeta.vence)
        || validarCvv(tarjeta.cvv, marcaNueva)
        || validarDocumento(documento.numero);
    }
    if (metodo === 'pse') {
      return (pse.banco ? '' : 'Elige el banco desde el que vas a pagar.')
        || validarDocumento(documento.numero);
    }
    if (metodo === 'nequi') {
      return (nequi.nombre.trim().length < 3 ? 'Escribe el nombre del titular de la cuenta Nequi.' : '')
        || validarCelular(nequi.celular);
    }
    return '';
  }

  function finalizar({ pago, referencia = '', estado = 'Pago aprobado' }) {
    const nuevo = placeOrder({ entrega: entregaActual, pago, referencia, estado });

    if (!nuevo) {
      setError('No pudimos crear el pedido porque tu carrito está vacío.');
      setFase('formulario');
      return;
    }

    if (usandoDireccionNueva && guardarDireccion) {
      saveAddress({
        alias: aliasDireccion,
        nombre: entregaActual.nombre,
        telefono: entregaActual.telefono,
        ciudad: entregaActual.ciudad,
        direccion: entregaActual.direccion,
        indicaciones: entregaActual.notas,
      });
    }

    if (metodo === 'tarjeta' && !tarjetaGuardada && guardarTarjeta) {
      addCard({
        marca: marcaNueva,
        ultimos4: soloDigitos(tarjeta.numero).slice(-4),
        titular: tarjeta.titular,
        vence: tarjeta.vence,
        tipo: tarjeta.tipo,
      });
    }

    const datosCuenta = {};
    if (!usuario?.phone && entregaActual.telefono) datosCuenta.phone = entregaActual.telefono;
    if (!usuario?.documentNumber && documento.numero && (metodo === 'tarjeta' || metodo === 'pse')) {
      datosCuenta.documentType = documento.tipo;
      datosCuenta.documentNumber = documento.numero;
    }
    if (Object.keys(datosCuenta).length > 0) updateUser(datosCuenta);

    setPedido(nuevo);
    setFase('listo');
  }

  function generarCodigoNequi() {
    const referencia = generarReferenciaNequi();
    const inicio = ahoraMs();
    setNequiSesion({
      referencia,
      expira: inicio + SEGUNDOS_QR * 1000,
      qr: datosQrNequi({
        referencia,
        total: totales.total,
        celular: nequi.celular,
        nombre: nequi.nombre,
      }),
    });
    setAhora(inicio);
    setFase('nequi');
  }

  function confirmarNequi() {
    procesar(['Confirmando el pago con Nequi…'], () => {
      finalizar({
        pago: `Nequi · ${nequi.celular}`,
        referencia: `Nequi ${nequiSesion.referencia}`,
      });
    });
  }

  function volverDeNequi() {
    setNequiSesion(null);
    setFase('formulario');
  }

  function pagar(evento) {
    evento.preventDefault();

    const problema = validarFormularioPago();
    if (problema) {
      setError(problema);
      return;
    }
    setError('');

    if (metodo === 'nequi') {
      generarCodigoNequi();
      return;
    }

    if (metodo === 'tarjeta') {
      const marca = tarjetaGuardada?.marca ?? marcaNueva;
      const tipo = tarjetaGuardada?.tipo ?? tarjeta.tipo;
      const ultimos4 = tarjetaGuardada?.ultimos4 ?? soloDigitos(tarjeta.numero).slice(-4);
      const cuotas = tipo === 'credito' ? Number(tarjeta.cuotas) : 1;
      const descripcion = `${MARCAS[marca].nombre} ${textoTipo(tipo)} •••• ${ultimos4}${cuotas > 1 ? ` · ${cuotas} cuotas` : ''}`;

      procesar(
        ['Validando los datos de tu tarjeta…', 'Consultando con tu banco…', 'Confirmando el pago…'],
        () => {
          // Tarjeta de prueba que termina en 0002: simula un rechazo del banco.
          if (ultimos4 === '0002') {
            setError('Tu banco rechazó la transacción. Prueba con otra tarjeta u otro método de pago.');
            setFase('formulario');
            return;
          }
          finalizar({ pago: descripcion, referencia: `Aprobación ${generarAprobacion()}` });
        },
      );
      return;
    }

    if (metodo === 'pse') {
      procesar(
        ['Conectando con PSE…', `Redirigiendo al portal de ${pse.banco}…`, 'Esperando la confirmación de tu banco…'],
        () => finalizar({ pago: `PSE · ${pse.banco}`, referencia: `CUS ${generarCus()}` }),
      );
      return;
    }

    procesar(['Registrando tu pedido…'], () => {
      finalizar({ pago: 'Contra entrega', estado: 'Pendiente de pago' });
    });
  }

  const bloqueDocumento = (
    <div className="checkout-row is-document">
      <label>
        Tipo de documento
        <select
          value={documento.tipo}
          onChange={(evento) => setDocumento((actual) => ({ ...actual, tipo: evento.target.value }))}
        >
          {TIPOS_DOCUMENTO.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
          ))}
        </select>
      </label>
      <label>
        Número de documento
        <input
          type="text"
          inputMode="numeric"
          value={documento.numero}
          onChange={(evento) => {
            setDocumento((actual) => ({ ...actual, numero: evento.target.value }));
            setError('');
          }}
          required
        />
      </label>
    </div>
  );

  function contenido() {
    if (fase === 'procesando') {
      return (
        <div className="checkout-status" role="status" aria-live="polite">
          <span className="checkout-spinner" aria-hidden="true" />
          <h2>{mensajeProceso}</h2>
          <p>Esto toma solo un momento. No cierres esta ventana.</p>
        </div>
      );
    }

    if (fase === 'listo' && pedido) {
      const contraEntrega = pedido.pago === 'Contra entrega';
      return (
        <div className="checkout-status" role="status">
          <svg className="checkout-check" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="28" />
            <path d="m20 33 8 8 16-18" />
          </svg>
          <h2>¡Pedido confirmado!</h2>
          <p className="checkout-order-id">Pedido {pedido.id}</p>
          <p>
            {contraEntrega
              ? <>Pagarás {formatCOP(pedido.total)} en efectivo cuando recibas tu pedido.</>
              : <>Pagaste {formatCOP(pedido.total)} con {pedido.pago}.</>}
            {' '}Lo encuentras en <strong>Mis pedidos</strong>, dentro de tu perfil.
          </p>
          {pedido.referencia && <p className="checkout-reference">{pedido.referencia}</p>}
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

    if (fase === 'nequi' && nequiSesion) {
      return (
        <div className="nequi-pay">
          <p className="nequi-logo" aria-hidden="true">nequi</p>
          <h2>Paga desde tu app Nequi</h2>
          <p className="nequi-intro">
            Escanea el código desde la app o aprueba la notificación que enviamos
            al <strong>{enmascararCelular(nequi.celular)}</strong>.
          </p>

          <div className="nequi-layout">
            <div className={`nequi-qr${codigoVencido ? ' is-expired' : ''}`}>
              <QRCode value={nequiSesion.qr} size={188} label="Código QR para pagar con Nequi" />
              {codigoVencido && <span className="nequi-qr-expired">Código vencido</span>}
            </div>
            <ol className="nequi-steps">
              <li>Abre la app <strong>Nequi</strong> en tu celular.</li>
              <li>Entra a <strong>Pagar</strong> y elige <strong>Escanear QR</strong>.</li>
              <li>Verifica el comercio y el valor.</li>
              <li>Confirma con tu clave y aquí verás el pago al instante.</li>
            </ol>
          </div>

          <dl className="nequi-data">
            <div><dt>Comercio</dt><dd>Fiesta Colombia</dd></div>
            <div><dt>Titular</dt><dd>{nequi.nombre}</dd></div>
            <div><dt>Referencia</dt><dd>{nequiSesion.referencia}</dd></div>
            <div><dt>Valor</dt><dd>{formatCOP(totales.total)}</dd></div>
          </dl>

          <p className={`nequi-timer${codigoVencido ? ' is-expired' : ''}`} role="timer">
            {codigoVencido
              ? 'El código venció. Genera uno nuevo para continuar.'
              : <>Esperando tu pago · el código vence en <strong>{formatearTiempo(restante)}</strong></>}
          </p>
          <p className="checkout-demo-note">
            Demostración: este QR no funciona en la app real de Nequi.
            Usa el botón para simular que pagaste.
          </p>

          <div className="checkout-actions">
            <button type="button" className="shop-secondary" onClick={volverDeNequi}>
              Cambiar método
            </button>
            {codigoVencido
              ? <button type="button" className="shop-primary" onClick={generarCodigoNequi}>Generar nuevo código</button>
              : <button type="button" className="shop-primary" onClick={confirmarNequi}>Simular pago en Nequi</button>}
          </div>
        </div>
      );
    }

    if (paso === 1) {
      return (
        <form className="auth-form" onSubmit={continuarAPago}>
          <h2>¿A dónde enviamos tu pedido?</h2>

          {direcciones.length > 0 && (
            <div className="saved-options" role="radiogroup" aria-label="Direcciones guardadas">
              {direcciones.map((direccion) => (
                <button
                  type="button"
                  role="radio"
                  aria-checked={direccionId === direccion.id}
                  className={`saved-option${direccionId === direccion.id ? ' is-selected' : ''}`}
                  key={direccion.id}
                  onClick={() => setDireccionId(direccion.id)}
                >
                  <strong>
                    {direccion.alias || 'Dirección'}
                    {direccion.predeterminada && <span className="saved-tag">Predeterminada</span>}
                  </strong>
                  <span>{direccion.nombre} · {direccion.telefono}</span>
                  <span>{direccion.direccion}, {direccion.ciudad}</span>
                </button>
              ))}
              <button
                type="button"
                role="radio"
                aria-checked={usandoDireccionNueva}
                className={`saved-option is-new${usandoDireccionNueva ? ' is-selected' : ''}`}
                onClick={() => setDireccionId('nueva')}
              >
                <strong>+ Usar otra dirección</strong>
              </button>
            </div>
          )}

          {usandoDireccionNueva && (
            <>
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
              <label className="auth-terms">
                <input type="checkbox" checked={guardarDireccion} onChange={(evento) => setGuardarDireccion(evento.target.checked)} />
                <span>Guardar esta dirección en mi perfil.</span>
              </label>
              {guardarDireccion && (
                <label>
                  Nombre de la dirección
                  <select value={aliasDireccion} onChange={(evento) => setAliasDireccion(evento.target.value)}>
                    <option value="Casa">Casa</option>
                    <option value="Trabajo">Trabajo</option>
                    <option value="Otra">Otra</option>
                  </select>
                </label>
              )}
            </>
          )}

          <div className="checkout-actions">
            <button type="button" className="shop-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="shop-primary">Continuar al pago</button>
          </div>
        </form>
      );
    }

    const etiquetaPagar = {
      nequi: 'Generar código QR',
      contraentrega: 'Confirmar pedido',
    }[metodo] ?? `Pagar ${formatCOP(totales.total)}`;

    return (
      <form className="auth-form" onSubmit={pagar} noValidate>
        <h2>¿Cómo quieres pagar?</h2>
        <div className="pay-methods" role="radiogroup" aria-label="Método de pago">
          {METODOS.map((opcion) => (
            <button
              type="button"
              role="radio"
              aria-checked={metodo === opcion.id}
              className={`pay-method${metodo === opcion.id ? ' is-selected' : ''}`}
              key={opcion.id}
              onClick={() => {
                setMetodo(opcion.id);
                setError('');
              }}
            >
              <strong>{opcion.nombre}</strong>
              <small>{opcion.nota}</small>
            </button>
          ))}
        </div>

        {metodo === 'tarjeta' && (
          <>
            {tarjetasGuardadas.length > 0 && (
              <div className="saved-options" role="radiogroup" aria-label="Tarjetas guardadas">
                {tarjetasGuardadas.map((guardada) => (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={tarjetaId === guardada.id}
                    className={`saved-option${tarjetaId === guardada.id ? ' is-selected' : ''}`}
                    key={guardada.id}
                    onClick={() => elegirTarjeta(guardada.id)}
                  >
                    <strong>
                      {MARCAS[guardada.marca].nombre} {textoTipo(guardada.tipo)}
                      {guardada.predeterminada && <span className="saved-tag">Predeterminada</span>}
                    </strong>
                    <span>{enmascarar(guardada.marca, guardada.ultimos4)}</span>
                    <span>{guardada.titular} · vence {guardada.vence}</span>
                  </button>
                ))}
                <button
                  type="button"
                  role="radio"
                  aria-checked={!tarjetaGuardada}
                  className={`saved-option is-new${!tarjetaGuardada ? ' is-selected' : ''}`}
                  onClick={() => elegirTarjeta('nueva')}
                >
                  <strong>+ Usar otra tarjeta</strong>
                </button>
              </div>
            )}

            {tarjetaGuardada ? (
              <>
                <CardVisual
                  compacta
                  marca={tarjetaGuardada.marca}
                  numero={enmascarar(tarjetaGuardada.marca, tarjetaGuardada.ultimos4)}
                  titular={tarjetaGuardada.titular.toUpperCase()}
                  vence={tarjetaGuardada.vence}
                />
                <label>
                  Código de seguridad (CVV)
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder={'•'.repeat(MARCAS[tarjetaGuardada.marca].cvv)}
                    value={tarjeta.cvv}
                    onChange={cambiarTarjeta('cvv', (valor) => soloDigitos(valor).slice(0, 4))}
                  />
                </label>
              </>
            ) : (
              <>
                <CardVisual
                  marca={marcaNueva}
                  numero={tarjeta.numero}
                  titular={tarjeta.titular.toUpperCase()}
                  vence={tarjeta.vence}
                />
                <label>
                  Número de tarjeta
                  <input type="text" inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" value={tarjeta.numero} onChange={cambiarTarjeta('numero', formatearNumeroTarjeta)} />
                </label>
                <label>
                  Nombre en la tarjeta
                  <input type="text" autoComplete="cc-name" placeholder="Como aparece en la tarjeta" value={tarjeta.titular} onChange={cambiarTarjeta('titular')} />
                </label>
                <div className="checkout-row">
                  <label>
                    Vencimiento
                    <input type="text" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" value={tarjeta.vence} onChange={cambiarTarjeta('vence', formatearVencimiento)} />
                  </label>
                  <label>
                    CVV
                    <input type="password" inputMode="numeric" autoComplete="cc-csc" placeholder={'•'.repeat(MARCAS[marcaNueva].cvv)} value={tarjeta.cvv} onChange={cambiarTarjeta('cvv', (valor) => soloDigitos(valor).slice(0, 4))} />
                  </label>
                </div>
                <div className="pay-segment" role="radiogroup" aria-label="Tipo de tarjeta">
                  {['credito', 'debito'].map((tipo) => (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={tarjeta.tipo === tipo}
                      className={tarjeta.tipo === tipo ? 'is-selected' : ''}
                      key={tipo}
                      onClick={() => setTarjeta((actual) => ({ ...actual, tipo }))}
                    >
                      {tipo === 'credito' ? 'Crédito' : 'Débito'}
                    </button>
                  ))}
                </div>
              </>
            )}

            {esCredito && (
              <label>
                Número de cuotas
                <select value={tarjeta.cuotas} onChange={cambiarTarjeta('cuotas')}>
                  {CUOTAS.map((cantidad) => (
                    <option key={cantidad} value={cantidad}>
                      {cantidad === 1
                        ? `Pago de contado · ${formatCOP(totales.total)}`
                        : `${cantidad} cuotas de ${formatCOP(Math.ceil(totales.total / cantidad))}`}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {bloqueDocumento}

            {!tarjetaGuardada && (
              <label className="auth-terms">
                <input type="checkbox" checked={guardarTarjeta} onChange={(evento) => setGuardarTarjeta(evento.target.checked)} />
                <span>Guardar esta tarjeta en mi perfil. Solo guardamos la marca y los últimos 4 dígitos, nunca el número completo ni el CVV.</span>
              </label>
            )}
            <p className="checkout-hint">
              Para probar: 4242 4242 4242 4242, cualquier fecha futura y cualquier CVV.
              Una tarjeta que termine en 0002 simula un rechazo.
            </p>
          </>
        )}

        {metodo === 'pse' && (
          <>
            <div className="pay-segment" role="radiogroup" aria-label="Tipo de persona">
              {[['natural', 'Persona natural'], ['juridica', 'Persona jurídica']].map(([id, nombre]) => (
                <button
                  type="button"
                  role="radio"
                  aria-checked={pse.persona === id}
                  className={pse.persona === id ? 'is-selected' : ''}
                  key={id}
                  onClick={() => setPse((actual) => ({ ...actual, persona: id }))}
                >
                  {nombre}
                </button>
              ))}
            </div>
            <label>
              Banco
              <select
                value={pse.banco}
                onChange={(evento) => {
                  setPse((actual) => ({ ...actual, banco: evento.target.value }));
                  setError('');
                }}
              >
                <option value="" disabled>Elige tu banco</option>
                {BANCOS.map((nombre) => <option key={nombre} value={nombre}>{nombre}</option>)}
              </select>
            </label>
            {bloqueDocumento}
            <p className="checkout-hint">Al continuar te llevamos al portal de tu banco para autorizar el pago.</p>
          </>
        )}

        {metodo === 'nequi' && (
          <>
            <label>
              Nombre del titular de la cuenta Nequi
              <input
                type="text"
                autoComplete="name"
                placeholder="Como aparece en tu Nequi"
                value={nequi.nombre}
                onChange={(evento) => {
                  setNequi((actual) => ({ ...actual, nombre: evento.target.value }));
                  setError('');
                }}
              />
            </label>
            <label>
              Celular con Nequi
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="300 123 4567"
                value={nequi.celular}
                onChange={(evento) => {
                  setNequi((actual) => ({ ...actual, celular: formatearCelular(evento.target.value) }));
                  setError('');
                }}
              />
            </label>
            <p className="checkout-hint">
              Te mostraremos un código QR para pagar desde la app y enviaremos
              una notificación a tu celular.
            </p>
          </>
        )}

        {metodo === 'contraentrega' && (
          <p className="checkout-hint">
            Pagas en efectivo cuando recibas tu pedido. Ten el valor exacto a la mano
            para agilizar la entrega.
          </p>
        )}

        <p className="checkout-demo-note">Pago simulado: no se hace ningún cobro real.</p>
        {error && <p className="checkout-error" role="alert">{error}</p>}

        <div className="checkout-actions">
          <button type="button" className="shop-secondary" onClick={() => { setPaso(1); setError(''); }}>Volver</button>
          <button type="submit" className="shop-primary">{etiquetaPagar}</button>
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
