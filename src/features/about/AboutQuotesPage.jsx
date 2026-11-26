import { useEffect, useState } from 'react';
import { categoriasCatalogo, productosCatalogo, productosCatalogoCompleto } from '../catalog/catalogProducts.js';
import FloatingDecorations from '../shared/FloatingDecorations.jsx';
import SiteFooter from '../shared/SiteFooter.jsx';
import SiteHeader from '../shared/SiteHeader.jsx';
import { formatCOP } from '../shop/format.js';
import { getTotals } from '../shop/shopStore.js';
import './AboutQuotesPage.css';
import '../catalog/Catalog.css';

const nombresCategorias = Object.fromEntries(categoriasCatalogo.map(({ id, nombre }) => [id, nombre]));

const nombresPorTipoMesa = {
  platos: /\bplatos?\b/,
  vasos: /\bvasos?\b/,
  cubiertos: /\b(?:cubiertos?|cucharas?|tenedor(?:es)?|cuchillos?)\b/,
};

const tiposMesa = Object.keys(nombresPorTipoMesa);
const opcionesMesa = tiposMesa.map((id) => ({
  id,
  productos: productosCatalogo.desechables.filter((producto) => tipoDeMesa(producto) === id),
}));
const CANTIDAD_RECOMENDADA = 'recomendada';

const palabrasPorEvento = {
  Cumpleaños: ['cumple', 'birthday', 'felicidades'],
  Boda: ['boda', 'wedding'],
  Graduación: ['graduacion', 'graduation'],
};

function normalizarTexto(texto) {
  return texto.toLocaleLowerCase('es-CO').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function tipoDeMesa(producto) {
  if (producto.categoria !== 'desechables') return undefined;
  if (producto.tipoDesechable) return producto.tipoDesechable;
  const nombre = normalizarTexto(producto.nombre);
  return tiposMesa.find((tipo) => nombresPorTipoMesa[tipo].test(nombre));
}

function coincideEvento(producto, tipoEvento, otroEvento) {
  if (producto.eventosSugeridos?.includes(tipoEvento)) return true;
  if (tipoEvento === 'Otro') {
    const descripcion = normalizarTexto(otroEvento.trim());
    return Boolean(descripcion) && normalizarTexto(producto.nombre).includes(descripcion);
  }
  const palabras = palabrasPorEvento[tipoEvento];
  if (!palabras) return false;
  const nombre = normalizarTexto(producto.nombre);
  return palabras.some((palabra) => nombre.includes(palabra));
}

function nombrePaquetes(cantidad) {
  return `${cantidad} ${cantidad === 1 ? 'paquete' : 'paquetes'}`;
}

function seleccionarProducto(actuales, producto, cantidad) {
  const siguientes = { ...actuales };
  const grupo = opcionesMesa.find(({ id }) => id === tipoDeMesa(producto));
  for (const opcion of grupo?.productos ?? []) {
    delete siguientes[opcion.id];
  }
  siguientes[producto.id] = cantidad;
  return siguientes;
}

function AboutQuotesPage({ headerProps, footerRef, onShare, onOpenChat, onCheckout }) {
  const [evento, setEvento] = useState('');
  const [otroEvento, setOtroEvento] = useState('');
  const [deseaDesechables, setDeseaDesechables] = useState({});
  const [personas, setPersonas] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos');
  const [filtroMesa, setFiltroMesa] = useState(null);
  const [vistaInicial, setVistaInicial] = useState(true);
  const [productosSeleccionados, setProductosSeleccionados] = useState({});
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    document.documentElement.classList.add('catalog-open');
    document.body.classList.add('catalog-open');
    return () => {
      document.documentElement.classList.remove('catalog-open');
      document.body.classList.remove('catalog-open');
    };
  }, []);

  useEffect(() => {
    if (!mensaje) return undefined;
    const timeout = window.setTimeout(() => setMensaje(''), 3500);
    return () => window.clearTimeout(timeout);
  }, [mensaje]);

  const cantidadPersonas = Number(personas);
  const hayCantidadPersonas = Number.isSafeInteger(cantidadPersonas) && cantidadPersonas > 0;
  const grupoMesaActivo = opcionesMesa.find(({ id }) => id === filtroMesa);
  const categoriaActiva = grupoMesaActivo ? 'desechables' : categoriaSeleccionada;

  function prioridadProducto(producto) {
    if (coincideEvento(producto, evento, otroEvento)) return 2;
    return Number(Boolean(deseaDesechables[tipoDeMesa(producto)]));
  }

  function paquetesRecomendados(producto) {
    if (!hayCantidadPersonas || !producto.unidadesPorPaquete) return 0;
    return Math.ceil(cantidadPersonas / producto.unidadesPorPaquete);
  }

  function cantidadEnCotizacion(producto, seleccion) {
    if (seleccion === CANTIDAD_RECOMENDADA) return paquetesRecomendados(producto) || 1;
    return seleccion ?? 0;
  }

  const terminosBusqueda = normalizarTexto(busqueda.trim()).split(/\s+/).filter(Boolean);
  const productosFiltrados = productosCatalogoCompleto
    .filter((producto) => {
      if (categoriaActiva !== 'todos' && producto.categoria !== categoriaActiva) return false;
      if (filtroMesa && tipoDeMesa(producto) !== filtroMesa) return false;
      const alias = producto.categoria === 'desechables' ? ' insumos' : '';
      const texto = normalizarTexto(`${producto.nombre} ${nombresCategorias[producto.categoria]}${alias}`);
      return terminosBusqueda.every((termino) => texto.includes(termino));
    })
    .sort((primero, segundo) => prioridadProducto(segundo) - prioridadProducto(primero));

  const lineasResumen = productosCatalogoCompleto
    .filter(({ id }) => id in productosSeleccionados)
    .map((producto) => ({ ...producto, cantidad: cantidadEnCotizacion(producto, productosSeleccionados[producto.id]) }));
  const { unidades: cantidadProductos, subtotal, costoEnvio, total } = getTotals(lineasResumen);

  function cambiarBusqueda(valor) {
    setVistaInicial(false);
    setBusqueda(valor);
  }

  function cambiarCategoria(categoria) {
    setVistaInicial(false);
    setFiltroMesa(null);
    setCategoriaSeleccionada(categoria);
  }

  function cambiarFiltroMesa(tipo) {
    setFiltroMesa(tipo);
    if (tipo) {
      setCategoriaSeleccionada('todos');
      setBusqueda('');
    }
  }

  function cambiarDesechable(tipo, desea) {
    setDeseaDesechables((actuales) => ({ ...actuales, [tipo]: desea }));
    cambiarFiltroMesa(desea ? tipo : null);
  }

  function cambiarCantidad(producto, cambio) {
    setVistaInicial(false);
    setProductosSeleccionados((actuales) => {
      const cantidad = cantidadEnCotizacion(producto, actuales[producto.id]) + cambio;
      if (cantidad > 0) return seleccionarProducto(actuales, producto, cantidad);
      const siguientes = { ...actuales };
      delete siguientes[producto.id];
      return siguientes;
    });
    if (cambio > 0) setMensaje('Producto agregado a tu cotización.');
  }

  function quitarProducto(productoId) {
    setProductosSeleccionados((actuales) => {
      const siguientes = { ...actuales };
      delete siguientes[productoId];
      return siguientes;
    });
  }

  function elegirProductoRecomendado(producto, seleccionado) {
    if (!seleccionado) {
      quitarProducto(producto.id);
      return;
    }
    setProductosSeleccionados((actuales) => seleccionarProducto(actuales, producto, CANTIDAD_RECOMENDADA));
    setMensaje('Producto agregado a tu cotización.');
  }

  function irACatalogo() {
    const sinAnimacion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('catalogo-cotizacion')?.scrollIntoView({ behavior: sinAnimacion ? 'instant' : 'smooth' });
  }

  function procesarPago(event) {
    event.preventDefault();
    if (lineasResumen.length === 0) {
      setMensaje('Agrega al menos un producto antes de continuar.');
      irACatalogo();
      return;
    }

    onCheckout({
      lineas: lineasResumen.map(({ id, nombre, precioCOP, image, cantidad }) => ({
        id, nombre, precioCOP, image, cantidad,
      })),
      onOrderPlaced: () => setProductosSeleccionados({}),
    });
  }

  return (
    <div className="quotes-page">
      <FloatingDecorations />
      <SiteHeader
        {...headerProps}
        searchValue={busqueda}
        onSearchChange={(event) => cambiarBusqueda(event.target.value)}
        onSearch={irACatalogo}
      />

      <main className="quotes-main">
        <div className="quotes-heading">
          <p className="quotes-eyebrow">Celebra a tu manera</p>
          <h1>Cotiza tu evento</h1>
          <p>Cuéntanos qué estás organizando, elige tus productos y arma tu cotización.</p>
        </div>

        <form
          className={`quotes-content${vistaInicial ? ' quotes-content--initial' : ''}`}
          onChange={() => setVistaInicial(false)}
          onSubmit={procesarPago}
        >
          <section className="card quotes-panel quotes-event-form" aria-labelledby="event-details-title">
            <div className="quotes-section-heading">
              <span className="quotes-step">01</span>
              <div>
                <h2 id="event-details-title">Cuéntanos de tu evento</h2>
                <p>Estos datos nos ayudan a preparar tu pedido.</p>
              </div>
            </div>

            <div className="quotes-fields">
              <label className="quotes-field">
                <span>Tipo de evento</span>
                <span className="select is-fullwidth">
                  <select value={evento} onChange={(event) => setEvento(event.target.value)}>
                    <option value="">Selecciona una opción</option>
                    <option value="Cumpleaños">Cumpleaños</option>
                    <option value="Boda">Boda</option>
                    <option value="Graduación">Graduación</option>
                    <option value="Otro">Otro</option>
                  </select>
                </span>
              </label>
              {evento === 'Otro' && (
                <label className="quotes-field">
                  <span>¿Qué evento vas a celebrar?</span>
                  <input
                    className="input"
                    type="text"
                    value={otroEvento}
                    onChange={(event) => setOtroEvento(event.target.value)}
                    placeholder="Describe tu evento"
                  />
                </label>
              )}
              <label className="quotes-field">
                <span>Cantidad de personas</span>
                <input
                  className="input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*[1-9][0-9]*"
                  value={personas}
                  onChange={(event) => setPersonas(event.target.value.replace(/\D/g, ''))}
                  placeholder="Ej. 25"
                />
              </label>
            </div>

            <div className="quotes-supplies">
              <h3>¿Qué necesitas para tu mesa?</h3>
              <div className="quotes-supply-grid">
                {opcionesMesa.map((opcion) => (
                  <fieldset className="quotes-supply" key={opcion.id}>
                    <legend>¿Deseas {opcion.id}?</legend>
                    <div className="quotes-choice-row">
                      {['Sí', 'No'].map((respuesta) => (
                        <label className="radio quotes-choice" key={respuesta}>
                          <input
                            type="radio"
                            name={`desechable-${opcion.id}`}
                            value={respuesta}
                            checked={deseaDesechables[opcion.id] === (respuesta === 'Sí')}
                            onChange={() => cambiarDesechable(opcion.id, respuesta === 'Sí')}
                            onClick={() => {
                              if (respuesta === 'Sí' && deseaDesechables[opcion.id] && filtroMesa !== opcion.id) {
                                cambiarFiltroMesa(opcion.id);
                              }
                            }}
                          />
                          {respuesta}
                        </label>
                      ))}
                    </div>
                    {deseaDesechables[opcion.id] && (
                      <div className="quotes-supply-options">
                        {opcion.productos.map((producto) => {
                          const paquetes = paquetesRecomendados(producto);
                          return (
                            <label className="checkbox quotes-supply-option" key={producto.id}>
                              <input
                                type="checkbox"
                                checked={Boolean(productosSeleccionados[producto.id])}
                                onChange={(event) => elegirProductoRecomendado(producto, event.target.checked)}
                              />
                              <span>
                                {producto.nombre}
                                <strong>
                                  {formatCOP(producto.precioCOP)}
                                  {paquetes > 0 && ` · ${nombrePaquetes(paquetes)} ${paquetes === 1 ? 'recomendado' : 'recomendados'}`}
                                </strong>
                              </span>
                            </label>
                          );
                        })}
                        {opcion.productos.length === 0 && (
                          <p className="quotes-unavailable">Aún no tenemos opciones de {opcion.id} en el catálogo.</p>
                        )}
                      </div>
                    )}
                  </fieldset>
                ))}
              </div>
            </div>
          </section>

          <section className="card quotes-panel quotes-catalog" id="catalogo-cotizacion" aria-labelledby="quote-catalog-title">
            <div className="quotes-section-heading">
              <span className="quotes-step">02</span>
              <div>
                <h2 id="quote-catalog-title">Agrega productos</h2>
                <p>Explora nuestro catálogo y agrega tus favoritos.</p>
              </div>
            </div>
            <label className="quotes-search">
              <span className="visually-hidden">Buscar producto</span>
              <input
                className="input"
                type="search"
                placeholder="Buscar producto"
                value={busqueda}
                onChange={(event) => cambiarBusqueda(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') event.preventDefault();
                }}
              />
              <span aria-hidden="true">⌕</span>
            </label>
            <div className="quotes-category-filters" role="group" aria-label="Filtrar por categoría">
              <button
                type="button"
                className={`button${categoriaActiva === 'todos' ? ' is-selected' : ''}`}
                aria-pressed={categoriaActiva === 'todos'}
                onClick={() => cambiarCategoria('todos')}
              >
                Todos
              </button>
              {categoriasCatalogo.map((categoria) => (
                <button
                  type="button"
                  key={categoria.id}
                  className={`button${categoriaActiva === categoria.id ? ' is-selected' : ''}`}
                  aria-pressed={categoriaActiva === categoria.id}
                  onClick={() => cambiarCategoria(categoria.id)}
                >
                  {categoria.nombre}
                </button>
              ))}
            </div>
            <p className="quotes-result-count" aria-live="polite">
              {productosFiltrados.length} {productosFiltrados.length === 1 ? 'producto' : 'productos'}
            </p>

            <div className="quotes-product-results">
              {productosFiltrados.length > 0 ? (
                <div className="quotes-product-grid">
                  {productosFiltrados.map((producto) => {
                    const paquetes = deseaDesechables[tipoDeMesa(producto)] ? paquetesRecomendados(producto) : 0;
                    return (
                      <article className="quotes-product-card" key={producto.id}>
                        <div className="quotes-product-image">
                          {producto.image ? (
                            <img src={producto.image} alt={producto.nombre} loading="lazy" />
                          ) : (
                            <span aria-hidden="true">✦</span>
                          )}
                        </div>
                        <div className="quotes-product-info">
                          <span className="quotes-product-category">{nombresCategorias[producto.categoria]}</span>
                          <h3>{producto.nombre}</h3>
                          <p className="quotes-product-price">
                            {producto.precioDesde ? 'Desde ' : ''}{formatCOP(producto.precioCOP)}
                          </p>
                          {paquetes > 0 && (
                            <p className="quotes-product-recommendation">
                              {nombrePaquetes(paquetes)} de {producto.unidadesPorPaquete} para {cantidadPersonas}{' '}
                              {cantidadPersonas === 1 ? 'persona' : 'personas'}.
                            </p>
                          )}
                          <button type="button" className="button" onClick={() => cambiarCantidad(producto, 1)}>
                            Agregar
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="quotes-empty-catalog">
                  {grupoMesaActivo?.productos.length === 0
                    ? `Aún no tenemos ${grupoMesaActivo.id} en el catálogo.`
                    : 'No encontramos productos. Prueba otra búsqueda o categoría.'}
                </p>
              )}
            </div>
          </section>

          <section className="card quotes-panel quotes-summary" id="resumen-cotizacion" aria-labelledby="quote-summary-title">
            <div className="quotes-section-heading">
              <span className="quotes-step">03</span>
              <div>
                <h2 id="quote-summary-title">Tu cotización</h2>
                <p>Revisa los productos seleccionados antes de continuar.</p>
              </div>
            </div>
            <div className="quotes-event-summary">
              <span>Evento: <strong>{evento === 'Otro' ? otroEvento || 'Otro' : evento || 'Por definir'}</strong></span>
              <span>Personas: <strong>{personas || 'Por definir'}</strong></span>
            </div>
            {lineasResumen.length > 0 ? (
              <ul className="quotes-summary-list">
                {lineasResumen.map((producto) => (
                  <li className="quotes-summary-item" key={producto.id}>
                    <img src={producto.image} alt="" loading="lazy" />
                    <div className="quotes-summary-product">
                      <strong>{producto.nombre}</strong>
                      <span>
                        {producto.precioDesde ? 'Desde ' : ''}
                        {formatCOP(producto.precioCOP)} c/u
                      </span>
                    </div>
                    <div className="quotes-quantity-control" aria-label={`Cantidad de ${producto.nombre}`}>
                      <button
                        type="button"
                        aria-label={`Quitar una unidad de ${producto.nombre}`}
                        onClick={() => cambiarCantidad(producto, -1)}
                      >
                        −
                      </button>
                      <span>{producto.cantidad}</span>
                      <button
                        type="button"
                        aria-label={`Agregar una unidad de ${producto.nombre}`}
                        onClick={() => cambiarCantidad(producto, 1)}
                      >
                        +
                      </button>
                    </div>
                    <strong className="quotes-line-total">{formatCOP(producto.precioCOP * producto.cantidad)}</strong>
                    <button
                      type="button"
                      className="quotes-remove"
                      aria-label={`Quitar ${producto.nombre} de la cotización`}
                      onClick={() => quitarProducto(producto.id)}
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="quotes-empty-summary">Aún no agregas productos. Explora el catálogo para comenzar.</p>
            )}
            <dl className="quotes-totals">
              <div><dt>Subtotal</dt><dd>{formatCOP(subtotal)}</dd></div>
              <div>
                <dt>Envío</dt>
                <dd className={cantidadProductos > 0 && costoEnvio === 0 ? 'has-text-success-dark' : ''}>
                  {cantidadProductos === 0 ? '—' : costoEnvio === 0 ? 'Gratis' : formatCOP(costoEnvio)}
                </dd>
              </div>
              <div className="quotes-total"><dt>Total</dt><dd>{formatCOP(total)}</dd></div>
            </dl>
            <button type="submit" className="button quotes-checkout">
              Ir a pagar <span aria-hidden="true">→</span>
            </button>
            <p className="quotes-payment-note">Pasarela de demostración. No se realiza ningún cobro real.</p>
          </section>
          {mensaje && <p className="quotes-status" role="status">{mensaje}</p>}
        </form>
      </main>

      <SiteFooter onShare={onShare} onOpenChat={onOpenChat} footerRef={footerRef} />
    </div>
  );
}

export default AboutQuotesPage;
