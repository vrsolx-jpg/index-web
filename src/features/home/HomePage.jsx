
import { useEffect, useRef, useState } from 'react';
import antifazImage from '../../assets/antifaz.png';
import bateImage from '../../assets/bate.png';
import gorrosImage from '../../assets/gorros.png';
import lentesImage from '../../assets/lentes.png';
import pinataImage from '../../assets/piañata.png';
import Catalog from '../catalog/Catalog.jsx';
import ProfileModal from '../profile/ProfileModal.jsx';
import './HomePage.css';

const objetosFiesta = [
  { id: 'pinata', imagen: pinataImage, color: '#FFD4C4', textColor: '#E9884A', textOutline: '#A64E24' },
  { id: 'gorros', imagen: gorrosImage, color: '#C4D8F9', textColor: '#483b7e', textOutline: '#160842' },
  { id: 'lentes', imagen: lentesImage, color: '#e9f5af', textColor: '#86c336', textOutline: '#4C741D' },
  { id: 'bate', imagen: bateImage, color: '#E9CCF3', textColor: '#4D045D' },
  { id: 'antifaz', imagen: antifazImage, color: '#F4ADBD', textColor: '#B5185F' },
];

const decoracionesBienvenida = [
  { icono: '♡', x: 8, y: 17 }, { icono: '✦', x: 24, y: 75 },
  { icono: '★', x: 39, y: 14 }, { icono: '♡', x: 57, y: 82 },
  { icono: '✧', x: 73, y: 23 }, { icono: '♥', x: 91, y: 68 },
  { icono: '✦', x: 15, y: 48 }, { icono: '★', x: 84, y: 43 },
];

function HomePage() {
  const [chatAbierto, setChatAbierto] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [authMode, setAuthMode] = useState(null);
  const [shareMessage, setShareMessage] = useState('');
  const [catalogoAbierto, setCatalogoAbierto] = useState(false);
  const catalogoRef = useRef(null);
  const catalogoFooterRef = useRef(null);
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
    function cerrarModalConEscape(evento) {
      if (evento.key === 'Escape') setAuthMode(null);
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
          <header className="site-header welcome-site-header">
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
              <div className="header-shortcut-actions" aria-label="Accesos rápidos">
                <button
                  type="button"
                  className="header-shortcut"
                  aria-label="Carrito"
                  onClick={() => mostrarPendiente('Carrito')}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 1.9-1.4L22 8H6" />
                    <circle cx="10" cy="20" r="1" />
                    <circle cx="18" cy="20" r="1" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="header-shortcut"
                  aria-label="Mi perfil"
                  onClick={() => setAuthMode('register')}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21a8 8 0 0 1 16 0" />
                  </svg>
                </button>
              </div>
            </div>
          </header>
          <div
            className="welcome-card"
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
        <Catalog
          catalogRef={catalogoRef}
          catalogFooterRef={catalogoFooterRef}
          onPending={mostrarPendiente}
          onShare={compartirPagina}
        />
      )}

      {authMode && (
        <ProfileModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onModeChange={setAuthMode}
        />
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

export default HomePage;
