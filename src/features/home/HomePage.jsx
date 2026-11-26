
import { useEffect, useRef, useState } from 'react';
import antifazImage from '../../assets/antifaz.png';
import bateImage from '../../assets/bate.png';
import gorrosImage from '../../assets/gorros.png';
import lentesImage from '../../assets/lentes.png';
import pinataImage from '../../assets/piañata.png';
import AboutQuotesPage from '../about/AboutQuotesPage.jsx';
import Catalog from '../catalog/Catalog.jsx';
import Chatbot from '../chatbot/Chatbot.jsx';
import ProfileModal from '../profile/ProfileModal.jsx';
import ProfilePage from '../profile/ProfilePage.jsx';
import SiteHeader from '../shared/SiteHeader.jsx';
import { entrance, gsap, motionQuery } from '../shared/motion.js';
import CartDrawer from '../shop/CartDrawer.jsx';
import CheckoutModal from '../shop/CheckoutModal.jsx';
import { addToCart, getTotals, useCart, useCurrentUser } from '../shop/shopStore.js';
import './HomePage.css';

const objetosFiesta = [
  { id: 'pinata', imagen: pinataImage, color: '#FFD4C4', textColor: '#E9884A', textOutline: '#A64E24' },
  { id: 'gorros', imagen: gorrosImage, color: '#C4D8F9', textColor: '#2f4a8f', textOutline: '#0f2150' },
  { id: 'lentes', imagen: lentesImage, color: '#e9f5af', textColor: '#86c336', textOutline: '#4C741D' },
  { id: 'bate', imagen: bateImage, color: '#f7c9d9', textColor: '#8a1646', textOutline: '#4d0a26' },
  { id: 'antifaz', imagen: antifazImage, color: '#F4ADBD', textColor: '#B5185F' },
];

const SECCIONES_PERFIL = ['cuenta', 'pedidos', 'tarjetas', 'direcciones'];

/* Rutas con hash: #cotizaciones, #perfil, #perfil/pedidos, #perfil/tarjetas, #perfil/direcciones */
function leerHash() {
  const hash = window.location.hash;
  if (hash === '#cotizaciones') return { pagina: 'cotizaciones', seccion: 'cuenta' };
  if (hash === '#perfil' || hash.startsWith('#perfil/')) {
    const seccion = hash.split('/')[1];
    return { pagina: 'perfil', seccion: SECCIONES_PERFIL.includes(seccion) ? seccion : 'cuenta' };
  }
  return { pagina: 'inicio', seccion: 'cuenta', catalogo: hash === '#catalogo' };
}

const decoracionesBienvenida = [
  { icono: '♡', x: 8, y: 17 }, { icono: '✦', x: 24, y: 75 },
  { icono: '★', x: 39, y: 14 }, { icono: '♡', x: 57, y: 82 },
  { icono: '✧', x: 73, y: 23 }, { icono: '♥', x: 91, y: 68 },
  { icono: '✦', x: 15, y: 48 }, { icono: '★', x: 84, y: 43 },
];

function HomePage() {
  const [paginaActual, setPaginaActual] = useState(() => leerHash().pagina);
  const [seccionPerfil, setSeccionPerfil] = useState(() => leerHash().seccion);
  const [chatAbierto, setChatAbierto] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [catalogoAbierto, setCatalogoAbierto] = useState(false);
  const [pagoAbierto, setPagoAbierto] = useState(false);
  const [volverAPagar, setVolverAPagar] = useState(false);
  const carrito = useCart();
  const usuario = useCurrentUser();
  const unidadesCarrito = getTotals(carrito).unidades;
  const [shareMessage, setShareMessage] = useState('');
  const [catalogoCompleto, setCatalogoCompleto] = useState(() => Boolean(leerHash().catalogo));
  const [busquedaCatalogo, setBusquedaCatalogo] = useState('');
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [catalogoVersion, setCatalogoVersion] = useState(0);
  const catalogoRef = useRef(null);
  const homeRef = useRef(null);
  const catalogoFooterRef = useRef(null);
  const scrollAProductos = useRef(false);
  const [animacion, setAnimacion] = useState({
    fila: objetosFiesta,
    saliendo: null,
    colores: objetosFiesta[0],
  });

  useEffect(() => {
    if (paginaActual !== 'inicio' || catalogoCompleto || !homeRef.current) return;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add(motionQuery, () => {
        gsap.fromTo('.hero-eyebrow, .hero-copy h1, .hero-caption, .hero-actions',
          { autoAlpha: 0, y: 22 },
          { ...entrance, autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1 });
        gsap.fromTo('.catalog-categories button',
          { autoAlpha: 0, y: 18 },
          {
            ...entrance, autoAlpha: 1, y: 0, stagger: 0.08,
            scrollTrigger: { trigger: '.catalog-categories', start: 'top 90%', once: true },
          });
      }, homeRef);
    }, homeRef);
    return () => { media.revert(); context.revert(); };
  }, [paginaActual, catalogoCompleto, catalogoVersion]);

  useEffect(() => {
    function sincronizarPagina() {
      const { pagina, seccion, catalogo } = leerHash();
      setCatalogoCompleto(Boolean(catalogo));
      setPaginaActual(pagina);
      setSeccionPerfil(seccion);
    }

    window.addEventListener('popstate', sincronizarPagina);
    window.addEventListener('hashchange', sincronizarPagina);
    return () => {
      window.removeEventListener('popstate', sincronizarPagina);
      window.removeEventListener('hashchange', sincronizarPagina);
    };
  }, []);

  useEffect(() => {
    if (paginaActual !== 'inicio' || !scrollAProductos.current) return;
    scrollAProductos.current = false;
    catalogoRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }, [paginaActual, catalogoCompleto]);

  useEffect(() => {
    if (!catalogoCompleto) return;

    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }, [catalogoCompleto]);

  useEffect(() => {
    if (paginaActual !== 'inicio' || !catalogoFooterRef.current) return undefined;

    const observador = new IntersectionObserver(([entrada]) => {
      document.documentElement.classList.toggle('catalog-footer-visible', entrada.isIntersecting);
      document.body.classList.toggle('catalog-footer-visible', entrada.isIntersecting);
    }, { threshold: 0.1 });

    observador.observe(catalogoFooterRef.current);
    return () => {
      observador.disconnect();
      document.documentElement.classList.remove('catalog-footer-visible');
      document.body.classList.remove('catalog-footer-visible');
    };
  }, [paginaActual, catalogoVersion]);

  useEffect(() => {
    function cerrarModalConEscape(evento) {
      if (evento.key !== 'Escape') return;
      setAuthMode(null);
      setVolverAPagar(false);
      setCarritoAbierto(false);
      setPagoAbierto(false);
    }

    window.addEventListener('keydown', cerrarModalConEscape);
    return () => window.removeEventListener('keydown', cerrarModalConEscape);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let salidaTimeout;
    const intervalo = window.setInterval(() => {
      setAnimacion((actual) => ({
        ...actual,
        saliendo: actual.fila[0].id,
        colores: actual.fila[1],
      }));
      salidaTimeout = window.setTimeout(() => {
        setAnimacion((actual) => ({
          fila: [...actual.fila.slice(1), actual.fila[0]],
          saliendo: null,
          colores: actual.fila[1],
        }));
      }, 900);
    }, 1600);

    return () => {
      window.clearInterval(intervalo);
      window.clearTimeout(salidaTimeout);
    };
  }, []);

  useEffect(() => {
    if (!shareMessage) return undefined;

    const timeout = window.setTimeout(() => setShareMessage(''), 2800);
    return () => window.clearTimeout(timeout);
  }, [shareMessage]);

  function mostrarPendiente(seccion) {
    setShareMessage(`${seccion} estará disponible próximamente.`);
  }

  function agregarAlCarrito(producto, cantidad = 1) {
      addToCart(producto, cantidad);
      setShareMessage(`${cantidad} × ${producto.nombre}${producto.colorElegido ? ` (${producto.colorElegido})` : ''} se agregó al carrito.`);
    }
  
    function iniciarPago() {
      setCarritoAbierto(false);
  
      if (!usuario) {
        setVolverAPagar(true);
        setAuthMode('login');
        return;
      }
      setPagoAbierto(true);
    }
  
    function alAutenticar(modo, aviso = '') {
      setAuthMode(null);
  
      if (volverAPagar) {
        setVolverAPagar(false);
        setPagoAbierto(true);
        return;
      }
      setShareMessage(aviso || (modo === 'register' ? '¡Tu cuenta está lista!' : 'Sesión iniciada.'));
    }
  
    function abrirCatalogo(termino = '') {
      setCarritoAbierto(false);
      setPagoAbierto(false);
      setChatAbierto(false);
      setCatalogoAbierto(true);
      setCatalogoCompleto(true);
      setBusquedaCatalogo(termino);
      setTextoBusqueda(termino);
      setCatalogoVersion((version) => version + 1);
      window.history.pushState({ pagina: 'inicio' }, '', '#catalogo');
      setPaginaActual('inicio');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    function seguirExplorando() {
      abrirCatalogo();
    }

    function irAInicio(aProductos = false) {
      setCatalogoCompleto(false);
      setBusquedaCatalogo('');
      setTextoBusqueda('');
      scrollAProductos.current = aProductos;
      window.history.pushState({ pagina: 'inicio' }, '', aProductos ? '#productos' : '#inicio');
      setPaginaActual('inicio');
      if (!aProductos) window.scrollTo({ top: 0, behavior: 'instant' });
    }

    function irAPerfil(seccion = 'cuenta') {
      const destino = seccion === 'cuenta' ? '#perfil' : `#perfil/${seccion}`;
      if (window.location.hash !== destino) window.history.pushState({ pagina: 'perfil' }, '', destino);
      setSeccionPerfil(seccion);
      setPaginaActual('perfil');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    function irAPedidos() {
      setPagoAbierto(false);
      irAPerfil('pedidos');
    }

  function irACotizaciones() {
    window.history.pushState({ pagina: 'cotizaciones' }, '', '#cotizaciones');
    setPaginaActual('cotizaciones');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  async function compartirPagina() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
        setShareMessage('Página compartida.');
      } catch (error) {
        if (error.name !== 'AbortError') {
          setShareMessage('No se pudo compartir la página.');
        }
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareMessage('Enlace copiado al portapapeles.');
    } catch {
      setShareMessage('No se pudo copiar el enlace en este navegador.');
    }
  }

  const cabecera = (
    <SiteHeader
      cartCount={unidadesCarrito}
      searchValue={textoBusqueda}
      onSearchChange={setTextoBusqueda}
      onHome={() => irAInicio(false)}
      onAbout={() => mostrarPendiente('Nosotros')}
      onQuotes={irACotizaciones}
      onSearch={abrirCatalogo}
      onCart={() => setCarritoAbierto(true)}
      onProfile={() => (usuario ? irAPerfil('cuenta') : setAuthMode('login'))}
    />
  );
  const asistente = (
    <Chatbot isOpen={chatAbierto} onOpen={() => setChatAbierto(true)} onClose={() => setChatAbierto(false)}
      onBrowseCatalog={seguirExplorando} onQuote={() => { setChatAbierto(false); irACotizaciones(); }} />
  );

  const capasCompartidas = (
    <>
      {authMode && (
        <ProfileModal
          mode={authMode}
          notice={volverAPagar ? 'Inicia sesión o crea tu cuenta para pagar.' : ''}
          onClose={() => {
            setAuthMode(null);
            setVolverAPagar(false);
          }}
          onModeChange={setAuthMode}
          onSuccess={alAutenticar}
        />
      )}

      {carritoAbierto && (
        <CartDrawer
          onClose={() => setCarritoAbierto(false)}
          onCheckout={iniciarPago}
          onExplore={seguirExplorando}
        />
      )}

      {pagoAbierto && (
        <CheckoutModal
          onClose={() => setPagoAbierto(false)}
          onExplore={seguirExplorando}
          onViewOrders={irAPedidos}
        />
      )}

      {shareMessage && (
        <div className="share-status" role="status">
          {shareMessage}
        </div>
      )}
    </>
  );

  if (paginaActual === 'cotizaciones') {
    return <><AboutQuotesPage header={cabecera} />{capasCompartidas}{asistente}</>;
  }

  if (paginaActual === 'perfil') {
    return (
      <>
        <ProfilePage
          key={usuario?.email ?? 'sin-sesion'}
          header={cabecera}
          seccion={seccionPerfil}
          onSeccion={irAPerfil}
          onExplore={seguirExplorando}
          onLogin={() => setAuthMode('login')}
          onLogout={() => {
            irAInicio(false);
            setShareMessage('Cerraste sesión.');
          }}
        />
        {capasCompartidas}
        {asistente}
      </>
    );
  }

  return (
    <main ref={homeRef}>
      <section
        className={`welcome-stage${catalogoCompleto ? ' is-catalog-expanded' : ''}`}
        id="inicio"
      >
        <div className="welcome-frame">
          {cabecera}
          <div
            className="welcome-card"
            hidden={catalogoCompleto}
            style={{
              '--scene-color': animacion.colores.color,
              '--scene-text-color': animacion.colores.textColor,
              '--scene-text-outline': animacion.colores.textOutline ?? 'transparent',
            }}
          >
            <div className="welcome-floating-decorations" aria-hidden="true">
              {decoracionesBienvenida.map((decoration, index) => (
                <span
                  className="welcome-floating-decoration"
                  key={`${decoration.icono}-${decoration.x}`}
                  style={{
                    left: `${decoration.x}%`,
                    top: `${decoration.y}%`,
                    '--decoration-delay': `${-index * 0.6}s`,
                    '--decoration-duration': `${4.8 + (index % 4) * 0.7}s`,
                  }}
                >
                  {decoration.icono}
                </span>
              ))}
            </div>
            <section className="hero-banner" aria-labelledby="welcome-title">
              <div className="hero-decoration" aria-hidden="true">
                {animacion.fila.map((objeto, posicion) => {
                  const estaSaliendo = animacion.saliendo === objeto.id;
                  const posicionVisual = animacion.saliendo && !estaSaliendo
                    ? posicion - 1
                    : posicion;

                  return (
                    <span
                      className={`hero-object hero-object--${objeto.id} hero-object--slot-${posicionVisual}${
                        estaSaliendo ? ' is-exiting' : ''
                      }`}
                      key={objeto.id}
                    >
                      <img src={objeto.imagen} alt="" />
                    </span>
                  );
                })}
              </div>

              <div className="hero-copy">
                <p className="hero-eyebrow">TODO PARA TU PRÓXIMA FIESTA</p>
                <h1 id="welcome-title">Celebra con magia</h1>
                <p className="hero-caption">
                  Piñatas, decoración y detalles para crear momentos
                  inolvidables.
                </p>
                <div className="hero-actions">
                  <a
                    className="button catalog-button"
                    href="#productos"
                  >
                    <span className="catalog-button-decoration" aria-hidden="true">
                      <span>♡</span><span>✦</span>
                    </span>
                    Explorar productos
                    <span className="catalog-button-decoration" aria-hidden="true">
                      <span>★</span><span>♡</span>
                    </span>
                  </a>
                </div>
              </div>
            </section>

            <div className="welcome-footer">
              <span>© 2026 Fiesta Colombia</span>
              <div className="social-links" aria-label="Redes sociales y compartir">
                <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle className="social-icon-dot" cx="18" cy="6" r="1" />
                  </svg>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Compartir en Facebook"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2-2h1.7V1.4C17 1.2 15.8 1 14.5 1 11.2 1 9 3 9 6.7V9H6v4h3v8z" />
                  </svg>
                </a>
                <button type="button" onClick={compartirPagina} aria-label="Compartir página">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <path d="m8.7 10.6 6.6-4.2m-6.6 7 6.6 4.1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>


      <Catalog
        key={catalogoVersion}
        searchTerm={busquedaCatalogo}
        catalogRef={catalogoRef}
        catalogFooterRef={catalogoFooterRef}
        isExpanded={catalogoCompleto}
        onAddToCart={agregarAlCarrito}
        onShare={compartirPagina}
        onQuote={irACotizaciones}
        onOpenChat={() => setChatAbierto(true)}
        onExpand={seguirExplorando}
        onCollapse={() => irAInicio(true)}
      />

      {capasCompartidas}

      {catalogoAbierto && unidadesCarrito > 0 && !carritoAbierto && (
              <button type="button" className="cart-fab" onClick={() => setCarritoAbierto(true)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 1.9-1.4L22 8H6" />
                  <circle cx="10" cy="20" r="1" />
                  <circle cx="18" cy="20" r="1" />
                </svg>
                Ver carrito
                <span aria-hidden="true">{unidadesCarrito}</span>
              </button>
            )}

      {asistente}
    </main>
  );
}

export default HomePage;
