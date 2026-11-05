
import { useEffect, useRef, useState } from 'react';
import antifazImage from './assets/antifaz.png';
import bateImage from './assets/bate.png';
import gorrosImage from './assets/gorros.png';
import lentesImage from './assets/lentes.png';
import pinataImage from './assets/piañata.png';
import discoImage from './assets/disco.avif';
import './App.css';

const objetosFiesta = [
  { id: 'pinata', imagen: pinataImage, color: '#FFD4C4', textColor: '#E9884A', textOutline: '#A64E24' },
  { id: 'gorros', imagen: gorrosImage, color: '#C4D8F9', textColor: '#483b7e', textOutline: '#160842' },
  { id: 'lentes', imagen: lentesImage, color: '#e9f5af', textColor: '#86c336', textOutline: '#4C741D' },
  { id: 'bate', imagen: bateImage, color: '#E9CCF3', textColor: '#4D045D' },
  { id: 'antifaz', imagen: antifazImage, color: '#F4ADBD', textColor: '#B5185F' },
];

const productosDestacados = [
  {
    nombre: 'Combo Básico Niño',
    precio: '$45.000 COP',
    imagen: 'https://images.unsplash.com/photo-1562967005-a3c85514d3e9?auto=format&fit=crop&w=500&q=80',
  },
  {
    nombre: 'Kit Arco de Globos Pink',
    precio: '$120.000 COP',
    imagen: 'https://images.unsplash.com/photo-1741969494307-55394e3e4071?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
  },
  {
    nombre: 'Kit Completo Repostería',
    precio: '$85.000 COP',
    imagen: 'https://images.unsplash.com/photo-1725524144999-7e27f70fcadd?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
  },
  {
    nombre: 'Piñata Estrella Gigante',
    precio: '$60.000 COP',
    imagen: 'https://images.unsplash.com/photo-1778472468507-335011815f7f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
  },
  {
    nombre: 'Piñata de pony (50cm)',
    precio: '$5.000 COP',
    imagen: 'https://images.unsplash.com/photo-1609829643742-19485cc841ba?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
  },
  {
    nombre: 'Set 32 Antifaces Clásicos Surtidos',
    precio: '$12.000 COP',
    imagen: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=500&q=80',
  },
  {
    nombre: 'Bola de disco mediana',
    precio: '$18.500 COP',
    imagen: 'https://images.unsplash.com/photo-1570200194303-1a68bd7e86ee?q=80&w=1175&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
  },
];

function App() {
  const [chatAbierto, setChatAbierto] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [authMessage, setAuthMessage] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [catalogoAbierto, setCatalogoAbierto] = useState(false);
  const [favoritos, setFavoritos] = useState([]);
  const catalogoRef = useRef(null);
  const catalogoFooterRef = useRef(null);
  const [productosPorPagina, setProductosPorPagina] = useState(() => (
    window.matchMedia('(max-width: 760px)').matches ? 1 : 3
  ));
  const [paginaProductos, setPaginaProductos] = useState(0);
  const [animacion, setAnimacion] = useState({
    fila: objetosFiesta,
    saliendo: null,
    colores: objetosFiesta[0],
  });

  useEffect(() => {
    document.documentElement.classList.toggle('catalog-open', catalogoAbierto);
    document.body.classList.toggle('catalog-open', catalogoAbierto);

    return () => {
      document.documentElement.classList.remove('catalog-open');
      document.body.classList.remove('catalog-open');
    };
  }, [catalogoAbierto]);

  useEffect(() => {
    if (!catalogoAbierto) return;

    catalogoRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }, [catalogoAbierto]);

  useEffect(() => {
    if (!catalogoAbierto || !catalogoFooterRef.current) return undefined;

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
  }, [catalogoAbierto]);

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
    const consultaMovil = window.matchMedia('(max-width: 760px)');
    const actualizarProductosPorPagina = () => {
      setProductosPorPagina(consultaMovil.matches ? 1 : 3);
      setPaginaProductos(0);
    };

    consultaMovil.addEventListener('change', actualizarProductosPorPagina);
    return () => consultaMovil.removeEventListener('change', actualizarProductosPorPagina);
  }, []);

  useEffect(() => {
    function cerrarConEscape(evento) {
      if (evento.key === 'Escape') {
        setMenuAbierto(false);
        setAuthMode(null);
      }
    }

    window.addEventListener('keydown', cerrarConEscape);
    return () => window.removeEventListener('keydown', cerrarConEscape);
  }, []);

  useEffect(() => {
    if (!shareMessage) return undefined;

    const timeout = window.setTimeout(() => setShareMessage(''), 2800);
    return () => window.clearTimeout(timeout);
  }, [shareMessage]);

  function mostrarPendiente(seccion) {
    setMenuAbierto(false);
    setShareMessage(`${seccion} estará disponible próximamente.`);
  }

  function alternarFavorito(nombreProducto) {
    setFavoritos((actuales) => (
      actuales.includes(nombreProducto)
        ? actuales.filter((nombre) => nombre !== nombreProducto)
        : [...actuales, nombreProducto]
    ));
  }

  const paginasProductos = Math.ceil(productosDestacados.length / productosPorPagina);
  const productosVisibles = productosDestacados.slice(
    paginaProductos * productosPorPagina,
    (paginaProductos + 1) * productosPorPagina
  );

  function enviarAcceso(evento) {
    evento.preventDefault();

    if (
      authMode === 'register' &&
      evento.currentTarget.elements.password.value !==
        evento.currentTarget.elements.confirmPassword.value
    ) {
      setAuthMessage('Las contraseñas no coinciden.');
      return;
    }

    setAuthMessage('El acceso de cuentas aún no está conectado.');
  }

  function simularGoogle() {
    setAuthMessage('El registro con Google es una demostración y aún no está conectado.');
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

  function enviarMensaje(evento) {
    evento.preventDefault();

    if (!mensaje.trim()) return;

    alert(
      `¡Gracias por escribir a Fiesta Colombia!\nTu mensaje: ${mensaje}`
    );
    setMensaje('');
  }

  return (
    <main>
      <section className="welcome-stage" id="inicio">
        <div className="welcome-frame">
          <div
            className="welcome-card"
            style={{
              '--scene-color': animacion.colores.color,
              '--scene-text-color': animacion.colores.textColor,
              '--scene-text-outline': animacion.colores.textOutline ?? 'transparent',
            }}
          >
            <header className="site-header">
              <a href="#inicio" className="brand">
                FIESTA COLOMBIA
              </a>

              <div className="header-actions">
                <nav className="header-quick-nav" aria-label="Enlaces principales">
                  <a href="#nosotros" onClick={(evento) => {
                    evento.preventDefault();
                    mostrarPendiente('Nosotros');
                  }}>Nosotros</a>
                  <form
                    className="header-search"
                    role="search"
                    onSubmit={(evento) => {
                      evento.preventDefault();
                      mostrarPendiente('La búsqueda de productos');
                    }}
                  >
                    <input type="search" placeholder="Buscar productos" aria-label="Buscar productos" />
                    <button type="submit" aria-label="Buscar">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="10.8" cy="10.8" r="6.8" />
                        <path d="m16 16 5 5" />
                      </svg>
                    </button>
                  </form>
                </nav>
                <div className="header-menu-wrap">
                <button
                  type="button"
                  className="menu-toggle"
                  aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
                  aria-expanded={menuAbierto}
                  aria-controls="header-menu"
                  onClick={() => setMenuAbierto((abierto) => !abierto)}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 6h18M3 12h18M3 18h18" />
                  </svg>
                </button>
                {menuAbierto && (
                  <nav className="header-menu" id="header-menu" aria-label="Menú de tienda">
                    <button type="button" onClick={() => mostrarPendiente('Carrito')}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 1.9-1.4L22 8H6" />
                        <circle cx="10" cy="20" r="1" />
                        <circle cx="18" cy="20" r="1" />
                      </svg>
                      <span>Carrito</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuAbierto(false);
                        setAuthMessage('');
                        setAuthMode('register');
                      }}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 21a8 8 0 0 1 16 0" />
                      </svg>
                      <span>Mi perfil</span>
                    </button>
                  </nav>
                )}
                </div>
              </div>
            </header>

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
                    onClick={(evento) => {
                      evento.preventDefault();
                      setCatalogoAbierto(true);
                    }}
                  >
                    Explorar productos
                  </a>
                </div>
              </div>
            </section>

            {!catalogoAbierto && (
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
            )}
          </div>
        </div>
      </section>

      {catalogoAbierto && (
      <>
      <section className="product-slider" id="productos" aria-labelledby="products-title" ref={catalogoRef}>
        <div className="product-slider-content">
          <header className="product-slider-heading">
            <h2 id="products-title">Catálogo</h2>
            <p>Encuentra todo para celebrar momentos especiales</p>
          </header>

          <div className="product-slider-cards" aria-live="polite">
            {productosVisibles.map((producto) => (
              <article className="slider-product-card" key={producto.imagen}>
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  loading="lazy"
                />
                <button
                  type="button"
                  className={`slider-product-favorite${favoritos.includes(producto.nombre) ? ' is-favorite' : ''}`}
                  aria-label={favoritos.includes(producto.nombre) ? `Quitar ${producto.nombre} de favoritos` : `Agregar ${producto.nombre} a favoritos`}
                  aria-pressed={favoritos.includes(producto.nombre)}
                  onClick={() => alternarFavorito(producto.nombre)}
                >
                  {favoritos.includes(producto.nombre) ? '♥' : '♡'}
                </button>
                <div className="slider-product-info">
                  <h3>{producto.nombre}</h3>
                  <p>{producto.precio}</p>
                  <button
                    type="button"
                    className="slider-product-add"
                    onClick={() => mostrarPendiente('Agregar al carrito')}
                  >
                    Agregar al carrito
                  </button>
                </div>
              </article>
            ))}
          </div>

          <nav className="product-slider-controls" aria-label="Navegación de productos">
            <button
              type="button"
              className="product-slider-arrow"
              aria-label="Productos anteriores"
              disabled={paginaProductos === 0}
              onClick={() => setPaginaProductos((pagina) => Math.max(0, pagina - 1))}
            >
              ←
            </button>
            <div className="product-slider-dots">
              {Array.from({ length: paginasProductos }, (_, pagina) => (
                <button
                  type="button"
                  key={pagina}
                  className={pagina === paginaProductos ? 'is-active' : ''}
                  aria-label={`Ver grupo de productos ${pagina + 1}`}
                  aria-current={pagina === paginaProductos ? 'true' : undefined}
                  onClick={() => setPaginaProductos(pagina)}
                />
              ))}
            </div>
            <button
              type="button"
              className="product-slider-arrow"
              aria-label="Productos siguientes"
              disabled={paginaProductos === paginasProductos - 1}
              onClick={() => setPaginaProductos((pagina) => Math.min(paginasProductos - 1, pagina + 1))}
            >
              →
            </button>
          </nav>
        </div>
      </section>
      <footer className="catalog-footer" ref={catalogoFooterRef}>
        <div className="catalog-footer-main">
          <section className="catalog-footer-brand" aria-labelledby="footer-brand-title">
            <h2 id="footer-brand-title">Fiesta Colombia</h2>
            <p>
              Tu aliado estratégico para los momentos más especiales de tu vida.
              Fiesta y repostería.
            </p>
          </section>
          <section className="catalog-footer-contact" aria-labelledby="footer-contact-title">
            <h2 id="footer-contact-title">Contacto</h2>
            <div className="catalog-footer-links">
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
            <a className="catalog-footer-email" href="mailto:hola@fiestacolombia.com">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m4 7 8 6 8-6" />
              </svg>
              hola@fiestacolombia.com
            </a>
          </section>
        </div>
        <div className="catalog-footer-copyright">© 2026 Fiesta Colombia. Todos los derechos reservados.</div>
      </footer>
      </>
      )}

      {authMode && (
        <div className="auth-overlay">
          <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
            <div className="auth-art">
              <img src={discoImage} alt="" />
              <div className="auth-art-copy">
                <strong>¡Celebremos juntos!</strong>
                <small>Todo para hacer especial tu próxima fiesta.</small>
              </div>
            </div>
            <div className="auth-content">
            <button
              type="button"
              className="auth-close"
              aria-label="Cerrar"
              onClick={() => setAuthMode(null)}
            >
              ×
            </button>
            <p className="auth-kicker">FIESTA COLOMBIA</p>
            <h2 id="auth-title">
              {authMode === 'login' ? '¡Qué bueno verte!' : 'Crea tu cuenta'}
            </h2>
            <p className="auth-welcome">
              {authMode === 'login'
                ? 'Inicia sesión para continuar.'
                : 'Regístrate y empieza a planear momentos inolvidables.'}
            </p>
            <button type="button" className="google-signup" onClick={simularGoogle}>
              <span className="google-mark" aria-hidden="true">G</span>
              {authMode === 'login' ? 'Continuar con Google' : 'Registrarte con Google'}
            </button>
            <div className="auth-divider"><span>o con tu correo</span></div>
            <form className="auth-form" onSubmit={enviarAcceso}>
              {authMode === 'register' && (
                <label>
                  Nombre
                  <input type="text" name="name" autoComplete="name" placeholder="Tu nombre" required />
                </label>
              )}
              <label>
                Correo electrónico
                <input type="email" name="email" autoComplete="email" placeholder="tu@correo.com" required />
              </label>
              <div className="auth-password-row">
                <label>
                  Contraseña
                  <input
                    type="password"
                    name="password"
                    autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                    placeholder="••••••••"
                    required
                  />
                </label>
                {authMode === 'register' && (
                  <label>
                    Repetir contraseña
                    <input
                      type="password"
                      name="confirmPassword"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      required
                    />
                  </label>
                )}
              </div>
              {authMode === 'register' && (
                <label className="auth-terms">
                  <input type="checkbox" name="terms" required />
                  <span>Acepto los <a href="#terms">Términos del servicio</a> y la <a href="#privacy">Política de privacidad</a>.</span>
                </label>
              )}
              {authMode === 'login' && (
                <button type="button" className="auth-forgot" onClick={() => setAuthMessage('La recuperación de contraseña aún no está conectada.')}>
                  ¿Olvidaste tu contraseña?
                </button>
              )}
              <button type="submit" className="auth-submit">
                {authMode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
              {authMessage && <p className="auth-message" role="status">{authMessage}</p>}
            </form>
            <p className="auth-switch">
              {authMode === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya tienes una cuenta?'}
              <button type="button" onClick={() => {
                setAuthMessage('');
                setAuthMode(authMode === 'login' ? 'register' : 'login');
              }}>
                {authMode === 'login' ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>
            </div>
          </section>
        </div>
      )}

      {shareMessage && (
        <div className="share-status" role="status">
          {shareMessage}
        </div>
      )}

      {chatAbierto && (
        <aside className="chat-widget">
          <div className="chat-heading">
            <div>
              <strong>Asistente de Fiesta</strong>
              <small>¡Estamos aquí para ayudarte!</small>
            </div>
            <button
              type="button"
              onClick={() => setChatAbierto(false)}
              aria-label="Cerrar asistente"
            >
              ×
            </button>
          </div>

          <div className="chat-options">
            <button type="button" onClick={() => setMensaje('Catálogo')}>
              ▫️ Catálogo
            </button>
            <button type="button" onClick={() => setMensaje('Mis pedidos')}>
              ▫️ Mis pedidos
            </button>
            <button
              type="button"
              onClick={() => setMensaje('Ideas para fiestas')}
            >
              ▫️ Ideas para fiestas
            </button>
            <button type="button" onClick={() => setMensaje('Ubicación')}>
              ▫️ Ubicación
            </button>
            <button type="button" onClick={() => setMensaje('Asesoría')}>
              ▫️ Asesoría
            </button>
          </div>

          <form className="chat-form" onSubmit={enviarMensaje}>
            <input
              type="text"
              placeholder="Escribe tu mensaje..."
              value={mensaje}
              onChange={(evento) => setMensaje(evento.target.value)}
              aria-label="Escribe tu mensaje"
            />
            <button type="submit" aria-label="Enviar mensaje">
              ↑
            </button>
          </form>

          <div className="chat-powered">Fiesta Colombia · Atención virtual</div>
        </aside>
      )}

      {!chatAbierto && (
        <button
          type="button"
          className="chat-launcher"
          aria-label="Abrir asistente"
          onClick={() => setChatAbierto(true)}
        >
          ✦
          <span aria-hidden="true">¿Necesitas ayuda?</span>
        </button>
      )}
    </main>
  );
}

export default App;
