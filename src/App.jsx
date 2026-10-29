
import { useState } from 'react';
import './App.css';

const productos = [
  {
    nombre: 'Combo Básico Niño',
    precio: '$45.000 COP',
    imagen:
      'https://images.unsplash.com/photo-1562967005-a3c85514d3e9?auto=format&fit=crop&w=500&q=80',
  },
  {
    nombre: 'Kit Arco de Globos Pink',
    precio: '$120.000 COP',
    imagen:
      'https://images.unsplash.com/photo-1741969494307-55394e3e4071?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
  },
  {
    nombre: 'Kit Completo Repostería',
    precio: '$85.000 COP',
    imagen:
      'https://images.unsplash.com/photo-1725524144999-7e27f70fcadd?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
  },
  {
    nombre: 'Piñata Estrella Gigante',
    precio: '$60.000 COP',
    imagen:
      'https://images.unsplash.com/photo-1778472468507-335011815f7f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3Dhttps://images.unsplash.com/photo-1609829643742-19485cc841ba?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3Dhttps://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=500&q=80',
  },
  {
    nombre: 'Piñata de pony (50cm)',
    precio: '$5.000',
    imagen:
      'https://images.unsplash.com/photo-1570200194303-1a68bd7e86ee?q=80&w=1175&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3Dhttps://images.unsplash.com/photo-1528185796833-c5827a298584?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3Dhttps://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=500&q=80',
  },
  {
    nombre: 'Set 32 Antifaces Clásicos Surtidos',
    precio: '$12.000',
    imagen:
      'https://plus.unsplash.com/premium_photo-1661508688805-21a8c3275801?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3Dhttps://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=500&q=80',
  },
  {
    nombre: 'Bola de disco mediana',
    precio: '$18.500',
    imagen:
      'https://images.unsplash.com/photo-1560987617-6de57e3d0574?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3Dhttps://images.unsplash.com/photo-1464207687429-7505649dae38?auto=format&fit=crop&w=500&q=80',
  },
];

function App() {
  const [busqueda, setBusqueda] = useState('');
  const [favoritos, setFavoritos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [chatAbierto, setChatAbierto] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [paginaCarrusel, setPaginaCarrusel] = useState(0);

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );
  const paginasCarrusel = Math.ceil(productosFiltrados.length / 3);
  const productosCarrusel = productosFiltrados.slice(
    paginaCarrusel * 3,
    paginaCarrusel * 3 + 3
  );

  function alternarFavorito(nombre) {
    setFavoritos((actuales) =>
      actuales.includes(nombre)
        ? actuales.filter((item) => item !== nombre)
        : [...actuales, nombre]
    );
  }

  function agregarAlCarrito(producto) {
    setCarrito((actuales) => [...actuales, producto]);
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
      {/* ENCABEZADO */}
      <header className="site-header">
        <a href="#inicio" className="brand">
          FIESTA COLOMBIA
        </a>

        <nav className="main-nav" aria-label="Navegación principal">
          <a href="#inicio">Inicio</a>
          <a href="#productos">Eventos</a>
          <a href="#productos">Decoración</a>
          <a href="#productos">Cumpleaños</a>
        </nav>

        <div className="header-search">
          <input
            type="search"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(evento) => {
              setBusqueda(evento.target.value);
              setPaginaCarrusel(0);
              document
                .getElementById('productos')
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-label="Buscar productos"
          />
        </div>

        <div className="header-icons">
          <button
            type="button"
            aria-label="Mi cuenta"
            title="Mi cuenta"
            onClick={() => alert('Bienvenido a Fiesta Colombia')}
          >
            ♙
          </button>
          <button
            type="button"
            aria-label="Favoritos"
            title="Favoritos"
            onClick={() =>
              alert(
                favoritos.length
                  ? favoritos.join('\n')
                  : 'Todavía no tienes favoritos.'
              )
            }
          >
            ♡
            {favoritos.length > 0 && (
              <span className="icon-count">{favoritos.length}</span>
            )}
          </button>
          <button
            type="button"
            aria-label="Carrito"
            title="Carrito"
            onClick={() =>
              alert(
                carrito.length
                  ? carrito.map((p) => p.nombre).join('\n')
                  : 'Tu carrito está vacío.'
              )
            }
          >
            🛒
            {carrito.length > 0 && (
              <span className="icon-count">{carrito.length}</span>
            )}
          </button>
        </div>
      </header>

      {/* BANNER PRINCIPAL */}
      <section className="hero-banner" id="inicio">
        <div className="hero-copy">
          <p className="hero-eyebrow">LO ÚLTIMO EN</p>
          <h1>Piñatería</h1>
          <p className="hero-caption">Tenemos eso que buscas</p>
        </div>

        <div className="hero-decoration" aria-hidden="true">
          <img
            src="/src/assets/piñata.png"
            alt=""
          />
        </div>
      </section>

      {/* BOTÓN CATÁLOGO */}
      <section className="catalog-cta">
        <a className="button catalog-button" href="#productos">
          Catálogo principal
        </a>
      </section>

      {/* PRODUCTOS MÁS VENDIDOS */}
      <section className="best-sellers" id="productos">
        <div className="section-inner">
          <h2>MÁS VENDIDOS</h2>
          <p className="section-subtitle">
            Encuentra todo para celebrar momentos especiales
          </p>

          {productosFiltrados.length > 0 ? (
            <div className="products-grid">
              {productosCarrusel.map((producto) => (
                <article className="product-card" key={producto.nombre}>
                  <div className="product-image">
                    <img src={producto.imagen} alt={producto.nombre} />
                    <button
                      type="button"
                      className={`favorite-button ${
                        favoritos.includes(producto.nombre)
                          ? 'is-favorite'
                          : ''
                      }`}
                      aria-label={`${
                        favoritos.includes(producto.nombre)
                          ? 'Quitar de'
                          : 'Agregar a'
                      } favoritos: ${producto.nombre}`}
                      onClick={() => alternarFavorito(producto.nombre)}
                    >
                      {favoritos.includes(producto.nombre) ? '♥' : '♡'}
                    </button>
                  </div>

                  <div className="product-info">
                    <h3>{producto.nombre}</h3>
                    <p className="product-price">{producto.precio}</p>
                    <button
                      type="button"
                      className="add-cart"
                      onClick={() => agregarAlCarrito(producto)}
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-results">
              No encontramos productos con ese nombre.
            </p>
          )}

          {paginasCarrusel > 1 && (
            <nav className="carousel-controls" aria-label="Páginas de productos">
              <button
                type="button"
                className="carousel-arrow"
                aria-label="Productos anteriores"
                onClick={() => setPaginaCarrusel((pagina) => pagina - 1)}
                disabled={paginaCarrusel === 0}
              >
                ←
              </button>
              <div className="carousel-pages">
                {Array.from({ length: paginasCarrusel }, (_, pagina) => (
                  <button
                    type="button"
                    key={pagina}
                    className={`carousel-dot ${
                      paginaCarrusel === pagina ? 'is-active' : ''
                    }`}
                    aria-label={`Ver grupo de productos ${pagina + 1}`}
                    aria-current={paginaCarrusel === pagina ? 'page' : undefined}
                    onClick={() => setPaginaCarrusel(pagina)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="carousel-arrow"
                aria-label="Siguientes productos"
                onClick={() => setPaginaCarrusel((pagina) => pagina + 1)}
                disabled={paginaCarrusel === paginasCarrusel - 1}
              >
                →
              </button>
            </nav>
          )}
        </div>
      </section>

      {/* PIE DE PÁGINA */}
      <footer className="site-footer">
        <div className="footer-column footer-brand">
          <h3>FIESTA COLOMBIA</h3>
          <p>
            Tu aliado estratégico para
            <br />
            los momentos más
            <br />
            especiales de tu vida.
          </p>
          <span>Fiesta y repostería.</span>
        </div>

        <div className="footer-column footer-contact">
          <h3>CONTACTO</h3>
          <p className="contact-detail">+57 300 123 4567</p>
          <a href="mailto:hola@fiestacolombia.com">
            hola@fiestacolombia.com
          </a>
        </div>
      </footer>

      <div className="copyright">
        © 2026 Fiesta Colombia. Todos los derechos reservados.
      </div>

      {/* ASISTENTE FLOTANTE */}
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
          onClick={() => setChatAbierto(true)}
        >
          ✦
          <span>¿Necesitas ayuda?</span>
        </button>
      )}
    </main>
  );
}

export default App;
