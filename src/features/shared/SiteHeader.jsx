import fiestaColombiaLogo from '../../assets/fiesta-colombia-logo.png';

function SiteHeader({
  cartCount, currentPage, onHome, onAbout, onQuotes, onOpenCart, onProfile, onSearch, searchValue, onSearchChange,
}) {
  return (
    <header className="site-header welcome-site-header">
      <a href="#inicio" className="brand" onClick={(event) => { event.preventDefault(); onHome(); }}>
        <img src={fiestaColombiaLogo} alt="" />
        <span>FIESTA COLOMBIA</span>
      </a>
      <div className="header-actions">
        <nav className="header-quick-nav" aria-label="Enlaces principales">
          <a
            href="#nosotros"
            aria-current={currentPage === 'nosotros' ? 'page' : undefined}
            onClick={(event) => { event.preventDefault(); onAbout(); }}
          >
            Nosotros
          </a>
          <a
            href="#cotizaciones"
            aria-current={currentPage === 'cotizaciones' ? 'page' : undefined}
            onClick={(event) => { event.preventDefault(); onQuotes(); }}
          >
            Cotizaciones
          </a>
          <form className="header-search" role="search" onSubmit={(event) => { event.preventDefault(); onSearch(); }}>
            <input
              type="search"
              placeholder="Buscar productos"
              aria-label="Buscar productos"
              value={searchValue}
              onChange={onSearchChange}
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
          <button
            type="button"
            className="header-shortcut"
            aria-label={`Carrito, ${cartCount} ${cartCount === 1 ? 'producto' : 'productos'}`}
            onClick={onOpenCart}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 1.9-1.4L22 8H6" />
              <circle cx="10" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            {cartCount > 0 && <span className="cart-badge" aria-hidden="true">{cartCount}</span>}
          </button>
          <button type="button" className="header-shortcut" aria-label="Mi perfil" onClick={onProfile}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
