import { useEffect, useMemo, useState } from 'react';
import { categoriasCatalogo, productosCatalogo } from '../catalog/catalogProducts.js';
import SiteFooter from '../shared/SiteFooter.jsx';
import './AboutQuotesPage.css';
import '../catalog/Catalog.css';

const productos = Object.entries(productosCatalogo).flatMap(([categoriaId, items]) => (
  items.map((producto) => ({ ...producto, categoriaId }))
));

const opcionesInsumos = [
  {
    id: 'platos',
    nombre: 'Platos',
    opciones: productos.filter((producto) => (
      producto.id === 'platos-biodegradables-redondos'
      || producto.id === 'platos-biodegradables-cuadrados'
    )),
  },
  { id: 'vasos', nombre: 'Vasos', opciones: [] },
  { id: 'cubiertos', nombre: 'Cubiertos', opciones: [] },
];

const palabrasPorEvento = {
  Cumpleaños: ['cumple', 'birthday', 'felicidades'],
  Boda: ['boda', 'wedding'],
  Graduación: ['graduacion', 'graduation'],
};

const precioCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

function normalizarTexto(texto) {
  return texto.toLocaleLowerCase('es-CO').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function coincideEvento(producto, tipoEvento) {
  const palabras = palabrasPorEvento[tipoEvento];
  if (!palabras) return true;
  const nombre = normalizarTexto(producto.nombre);
  return palabras.some((palabra) => nombre.includes(palabra));
}

function cantidadPaquetesRecomendada(producto, personas) {
  const unidades = producto.unidadesPorPaquete;
  const cantidadPersonas = Number(personas);
  if (!unidades || !Number.isSafeInteger(cantidadPersonas) || cantidadPersonas < 1) return 0;
  return Math.ceil(cantidadPersonas / unidades);
}

function AboutQuotesPage() {
  const [evento, setEvento] = useState('');
  const [otroEvento, setOtroEvento] = useState('');
  const [tamanoLugar, setTamanoLugar] = useState('');
  const [deseaInsumos, setDeseaInsumos] = useState({});
  const [personas, setPersonas] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos');
  const [filtroInsumo, setFiltroInsumo] = useState('todos');
  const [mostrarTodoCatalogo, setMostrarTodoCatalogo] = useState(false);
  const [productosSeleccionados, setProductosSeleccionados] = useState({});
  const [mensaje, setMensaje] = useState('');
  const hayBusqueda = Boolean(busqueda.trim());

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

  const productosFiltrados = useMemo(() => {
    const termino = normalizarTexto(busqueda.trim());
    return productos.filter((producto) => {
      const coincideCategoria = Boolean(termino) || categoriaSeleccionada === 'todos'
        || producto.categoriaId === categoriaSeleccionada;
      const coincideBusqueda = !termino
        || normalizarTexto(producto.nombre).includes(termino);
      const coincideEventoSeleccionado = Boolean(termino)
        || mostrarTodoCatalogo
        || coincideEvento(producto, evento);
      const coincideInsumo = Boolean(termino) || filtroInsumo === 'todos'
        || opcionesInsumos.find((insumo) => insumo.id === filtroInsumo)
          ?.opciones.some((opcion) => opcion.id === producto.id);
      return coincideCategoria && coincideBusqueda && coincideInsumo && coincideEventoSeleccionado;
    });
  }, [busqueda, categoriaSeleccionada, evento, filtroInsumo, mostrarTodoCatalogo]);

  const lineasResumen = useMemo(() => (
    productos
      .filter((producto) => productosSeleccionados[producto.id] > 0)
      .map((producto) => ({
        ...producto,
        cantidad: productosSeleccionados[producto.id],
        subtotal: producto.precioCOP * productosSeleccionados[producto.id],
        cantidadRecomendada: cantidadPaquetesRecomendada(producto, personas),
        unidadesPorPaquete: producto.unidadesPorPaquete,
      }))
  ), [personas, productosSeleccionados]);

  const cantidadProductos = lineasResumen.reduce((total, producto) => total + producto.cantidad, 0);
  const total = lineasResumen.reduce((suma, producto) => suma + producto.subtotal, 0);
  const totalDesde = lineasResumen.some((producto) => producto.precioDesde);

  function agregarProducto(productoId, cantidad = 1) {
    setProductosSeleccionados((actuales) => ({
      ...actuales,
      [productoId]: (actuales[productoId] ?? 0) + cantidad,
    }));
    setMensaje('Producto agregado a tu cotización.');
  }

  function ajustarCantidadProducto(productoId, cantidad) {
    setProductosSeleccionados((actuales) => ({ ...actuales, [productoId]: cantidad }));
    setMensaje(`Cantidad actualizada a ${cantidad} ${cantidad === 1 ? 'paquete' : 'paquetes'}.`);
  }

  function quitarProducto(productoId) {
    setProductosSeleccionados((actuales) => {
      const cantidad = actuales[productoId] ?? 0;
      if (cantidad <= 1) {
        const siguientes = { ...actuales };
        delete siguientes[productoId];
        return siguientes;
      }
      return { ...actuales, [productoId]: cantidad - 1 };
    });
  }

  function cambiarInsumo(insumo, producto, seleccionado) {
    setDeseaInsumos((actuales) => ({ ...actuales, [insumo]: seleccionado }));
    if (seleccionado) {
      agregarProducto(producto.id, cantidadPaquetesRecomendada(producto, personas) || 1);
    }
    else {
      setProductosSeleccionados((actuales) => {
        const siguientes = { ...actuales };
        delete siguientes[producto.id];
        return siguientes;
      });
    }
  }

  async function compartirPagina() {
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url: window.location.href });
      } catch (error) {
        if (error.name !== 'AbortError') setMensaje('No se pudo compartir la página.');
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMensaje('Enlace copiado al portapapeles.');
    } catch {
      setMensaje('No se pudo copiar el enlace en este navegador.');
    }
  }

  function procesarPago(event) {
    event.preventDefault();
    if (lineasResumen.length === 0) {
      setMensaje('Agrega al menos un producto antes de continuar.');
      document.getElementById('catalogo-cotizacion')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const paymentUrl = import.meta.env.VITE_PAYMENT_URL;
    if (!paymentUrl) {
      setMensaje('La pasarela de pago aún no está configurada. Tu cotización se conserva en esta página.');
      return;
    }

    window.location.assign(paymentUrl);
  }

  return (
    <div className="quotes-page">
      <header className="site-header welcome-site-header quotes-site-header">
        <a href="#inicio" className="brand" aria-label="Volver a la página principal de Fiesta Colombia">
          FIESTA COLOMBIA
        </a>
        <div className="header-actions">
          <nav className="header-quick-nav" aria-label="Enlaces principales">
            <a href="#inicio">Inicio</a>
            <a href="#resumen-cotizacion">Mi cotización</a>
            <form
              className="header-search"
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                document.getElementById('catalogo-cotizacion')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <input
                type="search"
                placeholder="Buscar productos"
                aria-label="Buscar productos"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
              />
              <button type="submit" aria-label="Buscar">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="10.8" cy="10.8" r="6.8" />
                  <path d="m16 16 5 5" />
                </svg>
              </button>
            </form>
          </nav>
          <div className="header-shortcut-actions" aria-label="Accesos rápidos">
            <a className="header-shortcut" href="#resumen-cotizacion" aria-label={`Resumen, ${cantidadProductos} productos`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 1.9-1.4L22 8H6" />
                <circle cx="10" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <main className="quotes-main">
        <div className="quotes-heading">
          <p className="quotes-eyebrow">Celebra a tu manera</p>
          <h1>Cotiza tu evento</h1>
          <p>Cuéntanos qué estás organizando, elige tus productos y arma tu cotización.</p>
        </div>

        <form className="quotes-content" onSubmit={procesarPago}>
          <section className="quotes-panel quotes-event-form" aria-labelledby="event-details-title">
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
                <select
                  value={evento}
                  onChange={(event) => {
                    setEvento(event.target.value);
                    setMostrarTodoCatalogo(false);
                    setCategoriaSeleccionada('todos');
                    setFiltroInsumo('todos');
                  }}
                  required
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Cumpleaños">Cumpleaños</option>
                  <option value="Boda">Boda</option>
                  <option value="Graduación">Graduación</option>
                  <option value="Otro">Otro</option>
                </select>
              </label>
              {evento === 'Otro' && (
                <label className="quotes-field">
                  <span>¿Qué evento vas a celebrar?</span>
                  <input
                    type="text"
                    value={otroEvento}
                    onChange={(event) => setOtroEvento(event.target.value)}
                    placeholder="Describe tu evento"
                    required
                  />
                </label>
              )}
              <label className="quotes-field">
                <span>Tamaño del lugar</span>
                <select value={tamanoLugar} onChange={(event) => setTamanoLugar(event.target.value)} required>
                  <option value="">Selecciona una opción</option>
                  <option value="Pequeño (un cuarto)">Pequeño (un cuarto)</option>
                  <option value="Mediano">Mediano</option>
                  <option value="Grande">Grande</option>
                </select>
              </label>
              <label className="quotes-field">
                <span>Cantidad de personas</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={personas}
                  onChange={(event) => setPersonas(event.target.value)}
                  placeholder="Ej. 25"
                  required
                />
              </label>
            </div>

            <div className="quotes-supplies">
              <h3>¿Qué necesitas para tu mesa?</h3>
              <div className="quotes-supply-grid">
                {opcionesInsumos.map((insumo) => (
                  <fieldset className="quotes-supply" key={insumo.id}>
                    <legend>¿Deseas {insumo.nombre.toLocaleLowerCase('es-CO')}?</legend>
                    <div className="quotes-choice-row">
                      {['Sí', 'No'].map((respuesta) => (
                        <label className="quotes-choice" key={respuesta}>
                          <input
                            type="radio"
                            name={`insumo-${insumo.id}`}
                            value={respuesta}
                            checked={deseaInsumos[insumo.id] !== undefined
                              && deseaInsumos[insumo.id] === (respuesta === 'Sí')}
                            required={respuesta === 'Sí'}
                            onChange={() => {
                              const desea = respuesta === 'Sí';
                              setDeseaInsumos((actuales) => ({ ...actuales, [insumo.id]: desea }));
                              if (!desea && filtroInsumo === insumo.id) setFiltroInsumo('todos');
                            }}
                          />
                          {respuesta}
                        </label>
                      ))}
                    </div>
                    {deseaInsumos[insumo.id] && (
                      <div className="quotes-supply-options">
                        {insumo.opciones.length > 0 ? insumo.opciones.map((producto) => (
                          <label className="quotes-supply-option" key={producto.id}>
                            <input
                              type="checkbox"
                              checked={Boolean(productosSeleccionados[producto.id])}
                              onChange={(event) => cambiarInsumo(insumo.id, producto, event.target.checked)}
                            />
                            <span>{producto.nombre}</span>
                            <strong>
                              {precioCOP.format(producto.precioCOP)} COP
                              {producto.unidadesPorPaquete && personas
                                ? ` · ${cantidadPaquetesRecomendada(producto, personas)} paquetes recomendados`
                                : ''}
                            </strong>
                          </label>
                        )) : (
                          <p className="quotes-unavailable">
                            Aún no tenemos opciones de {insumo.nombre.toLocaleLowerCase('es-CO')} en el catálogo.
                          </p>
                        )}
                      </div>
                    )}
                  </fieldset>
                ))}
              </div>
            </div>
          </section>

          <section className="quotes-panel quotes-catalog" id="catalogo-cotizacion" aria-labelledby="quote-catalog-title">
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
                type="search"
                placeholder="Buscar producto"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
              />
              <span aria-hidden="true">⌕</span>
            </label>
            <div className="quotes-category-filters" aria-label="Filtrar por categoría">
              <button
                type="button"
                disabled={hayBusqueda}
                className={categoriaSeleccionada === 'todos' ? 'is-selected' : ''}
                aria-pressed={categoriaSeleccionada === 'todos'}
                onClick={() => setCategoriaSeleccionada('todos')}
              >
                Todos
              </button>
              {categoriasCatalogo.map((categoria) => (
                <button
                  type="button"
                  disabled={hayBusqueda}
                  key={categoria.id}
                  className={categoriaSeleccionada === categoria.id ? 'is-selected' : ''}
                  aria-pressed={categoriaSeleccionada === categoria.id}
                  onClick={() => setCategoriaSeleccionada(categoria.id)}
                >
                  {categoria.nombre}
                </button>
              ))}
            </div>
            {opcionesInsumos.some((insumo) => deseaInsumos[insumo.id] && insumo.opciones.length > 0) && (
              <div className="quotes-category-filters quotes-supply-filters" aria-label="Filtrar por insumos solicitados">
                <span>Insumos:</span>
                <button
                  type="button"
                  disabled={hayBusqueda}
                  className={filtroInsumo === 'todos' ? 'is-selected' : ''}
                  aria-pressed={filtroInsumo === 'todos'}
                  onClick={() => setFiltroInsumo('todos')}
                >
                  Todos
                </button>
                {opcionesInsumos
                  .filter((insumo) => deseaInsumos[insumo.id] && insumo.opciones.length > 0)
                  .map((insumo) => (
                    <button
                      type="button"
                      disabled={hayBusqueda}
                      key={insumo.id}
                      className={filtroInsumo === insumo.id ? 'is-selected' : ''}
                      aria-pressed={filtroInsumo === insumo.id}
                      onClick={() => setFiltroInsumo(insumo.id)}
                    >
                      {insumo.nombre}
                    </button>
                  ))}
              </div>
            )}
            {evento && evento !== 'Otro' && !hayBusqueda && (
              <button
                type="button"
                className="quotes-browse-all"
                onClick={() => {
                  setMostrarTodoCatalogo((actual) => !actual);
                  setCategoriaSeleccionada('todos');
                  setFiltroInsumo('todos');
                }}
              >
                {mostrarTodoCatalogo
                  ? `Volver a productos para ${evento.toLocaleLowerCase('es-CO')}`
                  : 'Ver todo el catálogo'}
              </button>
            )}
            {hayBusqueda && (
              <p className="quotes-search-scope">
                La búsqueda revisa todo el catálogo, sin aplicar filtros de evento, categoría o insumos.
              </p>
            )}
            {!hayBusqueda && evento && evento !== 'Otro' && (
              <p className="quotes-search-scope">
                {mostrarTodoCatalogo
                  ? 'Mostrando todo el catálogo.'
                  : `Mostrando primero productos relacionados con ${evento.toLocaleLowerCase('es-CO')}.`}
              </p>
            )}
            <p className="quotes-result-count">{productosFiltrados.length} productos</p>

            {productosFiltrados.length > 0 ? (
              <div className="quotes-product-grid">
                {productosFiltrados.map((producto) => (
                  <article className="quotes-product-card" key={producto.id}>
                    <div className="quotes-product-image">
                      {producto.image ? (
                        <img src={producto.image} alt={producto.nombre} loading="lazy" />
                      ) : (
                        <span aria-hidden="true">✦</span>
                      )}
                    </div>
                    <div className="quotes-product-info">
                      <span className="quotes-product-category">
                        {categoriasCatalogo.find((categoria) => categoria.id === producto.categoriaId)?.nombre}
                      </span>
                      <h3>{producto.nombre}</h3>
                      <p className="quotes-product-price">
                        {producto.precioDesde ? 'Desde ' : ''}{precioCOP.format(producto.precioCOP)} COP
                      </p>
                      {cantidadPaquetesRecomendada(producto, personas) > 0 && (
                        <p className="quotes-product-recommendation">
                          Para {personas} personas:
                          {' '}{cantidadPaquetesRecomendada(producto, personas)} paquetes de {producto.unidadesPorPaquete}.
                          {tamanoLugar && ` Lugar: ${tamanoLugar.toLocaleLowerCase('es-CO')}.`}
                        </p>
                      )}
                      <button
                        type="button"
                        disabled={cantidadPaquetesRecomendada(producto, personas) > 0
                          && productosSeleccionados[producto.id] === cantidadPaquetesRecomendada(producto, personas)}
                        onClick={() => {
                          const recomendada = cantidadPaquetesRecomendada(producto, personas);
                          if (recomendada > 0) ajustarCantidadProducto(producto.id, recomendada);
                          else agregarProducto(producto.id);
                        }}
                      >
                        {cantidadPaquetesRecomendada(producto, personas) > 0
                          ? productosSeleccionados[producto.id] === cantidadPaquetesRecomendada(producto, personas)
                            ? 'Recomendación aplicada'
                            : productosSeleccionados[producto.id]
                            ? `Ajustar a ${cantidadPaquetesRecomendada(producto, personas)} paquetes`
                            : `Agregar ${cantidadPaquetesRecomendada(producto, personas)} paquetes`
                          : 'Agregar'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="quotes-empty-catalog">
                {evento && !mostrarTodoCatalogo && !hayBusqueda
                  ? `Aún no tenemos productos clasificados para ${evento.toLocaleLowerCase('es-CO')}. Puedes buscar en todo el catálogo.`
                  : 'No encontramos productos. Prueba otra búsqueda o categoría.'}
              </p>
            )}
          </section>

          <section className="quotes-panel quotes-summary" id="resumen-cotizacion" aria-labelledby="quote-summary-title">
            <div className="quotes-section-heading">
              <span className="quotes-step">03</span>
              <div>
                <h2 id="quote-summary-title">Tu cotización</h2>
                <p>Revisa los productos seleccionados antes de continuar.</p>
              </div>
            </div>
            <div className="quotes-event-summary">
              <span>Evento: <strong>{evento === 'Otro' ? otroEvento || 'Otro' : evento || 'Por definir'}</strong></span>
              <span>Lugar: <strong>{tamanoLugar || 'Por definir'}</strong></span>
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
                        {precioCOP.format(producto.precioCOP)} COP c/u
                      </span>
                      {producto.cantidadRecomendada > 0 && (
                        <span className="quotes-summary-recommendation">
                          Recomendación: {producto.cantidadRecomendada} paquetes de {producto.unidadesPorPaquete}
                          {' '}para {personas} personas{tamanoLugar ? ` (lugar ${tamanoLugar.toLocaleLowerCase('es-CO')})` : ''}.
                        </span>
                      )}
                      {producto.cantidadRecomendada > 0 && producto.cantidad !== producto.cantidadRecomendada && (
                        <button
                          type="button"
                          className="quotes-adjust-recommendation"
                          onClick={() => ajustarCantidadProducto(producto.id, producto.cantidadRecomendada)}
                        >
                          Usar recomendación
                        </button>
                      )}
                    </div>
                    <div className="quotes-quantity-control" aria-label={`Cantidad de ${producto.nombre}`}>
                      <button
                        type="button"
                        aria-label={`Quitar una unidad de ${producto.nombre}`}
                        onClick={() => quitarProducto(producto.id)}
                      >
                        −
                      </button>
                      <span>{producto.cantidad}</span>
                      <button
                        type="button"
                        aria-label={`Agregar una unidad de ${producto.nombre}`}
                        onClick={() => agregarProducto(producto.id)}
                      >
                        +
                      </button>
                    </div>
                    <strong className="quotes-line-total">{precioCOP.format(producto.subtotal)} COP</strong>
                    <button
                      type="button"
                      className="quotes-remove"
                      aria-label={`Quitar ${producto.nombre} de la cotización`}
                      onClick={() => {
                        setProductosSeleccionados((actuales) => {
                          const siguientes = { ...actuales };
                          delete siguientes[producto.id];
                          return siguientes;
                        });
                      }}
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="quotes-empty-summary">Aún no agregas productos. Explora el catálogo para comenzar.</p>
            )}
            <div className="quotes-total">
              <span>{cantidadProductos} {cantidadProductos === 1 ? 'producto' : 'productos'}</span>
              <strong>
                {totalDesde ? 'Total estimado desde: ' : 'Total: '}
                {precioCOP.format(total)} COP
              </strong>
            </div>
            <button type="submit" className="quotes-checkout">
              Ir a pagar <span aria-hidden="true">→</span>
            </button>
            <p className="quotes-payment-note">El pago se procesará de forma segura al conectar la pasarela.</p>
          </section>
          {mensaje && <p className="quotes-status" role="status">{mensaje}</p>}
        </form>
      </main>

      <SiteFooter onShare={compartirPagina} />
    </div>
  );
}

export default AboutQuotesPage;
