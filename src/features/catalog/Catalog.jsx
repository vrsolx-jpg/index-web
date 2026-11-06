import { useEffect, useMemo, useState } from 'react';
import { categoriasCatalogo, productosCatalogo } from './catalogProducts.js';
import './Catalog.css';

const iconosCategoria = {
  decoraciones: '✦',
  eventos: '▧',
  'hora-loca': '✹',
  desechables: '◉',
};

function CategoryIcon({ category }) {
  const props = {
    viewBox: '0 0 32 32',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  if (category === 'decoraciones') {
    return (
      <svg {...props}>
        <path d="M10 4.5c-3 0-5.5 2.4-5.5 5.4 0 4 5.5 9.3 5.5 9.3s5.5-5.3 5.5-9.3c0-3-2.5-5.4-5.5-5.4Z" />
        <path d="M10 19.2 12.5 28M22 7c-2.8 0-5 2.2-5 5 0 3.6 5 8.3 5 8.3s5-4.7 5-8.3c0-2.8-2.2-5-5-5Z" />
        <path d="m22 20.3-2 7.7" />
      </svg>
    );
  }

  if (category === 'eventos') {
    return (
      <svg {...props}>
        <rect x="4.5" y="7" width="23" height="20" rx="2.5" />
        <path d="M10 4.5v5M22 4.5v5M4.5 12.5h23M10 17h3M18 17h4M10 22h3" />
      </svg>
    );
  }

  if (category === 'hora-loca') {
    return (
      <svg {...props}>
        <path d="m6 22 12-12 5 5L11 27l-5-5Z" />
        <path d="m18 10 3-3M22 5l2-2M25 10h4M14 7l-2-4M25 17l3 2M8 16l-4-1" />
        <path d="m9 24 2 2" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <ellipse cx="16" cy="12" rx="11" ry="5.5" />
      <path d="M5 12c.5 7 4.3 11 11 11s10.5-4 11-11M9 12c.5 3.5 2.8 5.5 7 5.5s6.5-2 7-5.5" />
    </svg>
  );
}

const nombresColor = {
  '#d6ae34': 'Dorado',
  '#c4c6c8': 'Plateado',
  '#e7a5b5': 'Rosa',
  '#e66da8': 'Rosa',
  '#ffffff': 'Blanco',
  '#f5d313': 'Amarillo',
  '#65bde0': 'Azul',
  '#2447a2': 'Azul',
  '#b691bd': 'Morado',
  '#e9df7b': 'Amarillo',
  '#e6a4d5': 'Rosa',
  '#64750a': 'Verde',
};

const decoracionesFondo = [
  { icono: '✦', x: 7, y: 18 }, { icono: '♡', x: 18, y: 72 },
  { icono: '★', x: 31, y: 28 }, { icono: '✧', x: 42, y: 84 },
  { icono: '♡', x: 55, y: 16 }, { icono: '✦', x: 67, y: 63 },
  { icono: '★', x: 79, y: 31 }, { icono: '♡', x: 92, y: 76 },
  { icono: '✧', x: 13, y: 48 }, { icono: '★', x: 25, y: 91 },
  { icono: '♡', x: 38, y: 58 }, { icono: '✦', x: 49, y: 38 },
  { icono: '★', x: 61, y: 92 }, { icono: '♡', x: 73, y: 12 },
  { icono: '✧', x: 85, y: 55 }, { icono: '✦', x: 96, y: 22 },
];

function getProductColors(product) {
  if (!product.colores?.length) return ['Surtido'];
  return [...new Set(product.colores.map((color) => nombresColor[color.toLowerCase()] ?? 'Surtido'))];
}

function getPriceValue(product) {
  return product.precioCOP;
}

function formatPriceCOP(price) {
  return `${new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price)} COP`;
}

function ProductCard({ category, product, favorite, onFavorite, onAdd }) {
  return (
    <article className="catalog-product-card">
      <div className="catalog-product-image">
        {product.image ? (
          <img src={product.image} alt={product.nombre} loading="lazy" />
        ) : (
          <div className={`catalog-image-placeholder catalog-image-placeholder--${category}`} aria-label={`Imagen pendiente: ${product.nombre}`}>
            <span aria-hidden="true">{iconosCategoria[category]}</span>
            <small>Imagen por agregar</small>
          </div>
        )}
        <button
          type="button"
          className={`catalog-product-favorite${favorite ? ' is-favorite' : ''}`}
          aria-label={favorite ? `Quitar ${product.nombre} de favoritos` : `Agregar ${product.nombre} a favoritos`}
          aria-pressed={favorite}
          onClick={() => onFavorite(product.id)}
        >
          {favorite ? '♥' : '♡'}
        </button>
      </div>
      <div className="catalog-product-info">
        <p className="catalog-product-category">
          {categoriasCatalogo.find((item) => item.id === category)?.nombre}
        </p>
        {product.colores?.length > 0 && (
          <div className="catalog-product-colors" aria-label="Colores disponibles">
            {product.colores.map((color) => (
              <span key={color} style={{ '--product-swatch': color }} />
            ))}
          </div>
        )}
        <h3>{product.nombre}</h3>
        <p className="catalog-product-price">
          {product.precioDesde ? 'Desde ' : ''}{formatPriceCOP(product.precioCOP)}
        </p>
        <button type="button" className="catalog-product-add" onClick={onAdd}>
          Agregar al carrito
        </button>
      </div>
    </article>
  );
}

function Catalog({ catalogRef, catalogFooterRef, onPending, onShare, onQuote }) {
  const [selectedCategory, setSelectedCategory] = useState(categoriasCatalogo[0].id);
  const [showAll, setShowAll] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [slideStart, setSlideStart] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(() => (
    window.matchMedia('(max-width: 760px)').matches ? 1
      : window.matchMedia('(max-width: 1050px)').matches ? 2 : 4
  ));
  const [sortOrder, setSortOrder] = useState('relevant');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);
  const itemsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const allCategoryProducts = productosCatalogo[selectedCategory];
  const categoryMaximumPrice = Math.max(...allCategoryProducts.map(getPriceValue));
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(categoryMaximumPrice);
  const maxSlide = Math.max(0, allCategoryProducts.length - slidesPerView);
  const visibleProducts = allCategoryProducts.slice(slideStart, slideStart + slidesPerView);

  const availableColors = useMemo(
    () => [...new Set(allCategoryProducts.flatMap(getProductColors))],
    [allCategoryProducts]
  );

  const filteredProducts = useMemo(() => {
    const filtered = allCategoryProducts.filter((product) => {
      const price = getPriceValue(product);
      const matchesAvailability = !availableOnly || product.disponible !== false;
      const matchesPrice = price >= minPrice && price <= maxPrice;
      const matchesColor = selectedColors.length === 0
        || getProductColors(product).some((color) => selectedColors.includes(color));
      return matchesAvailability && matchesPrice && matchesColor;
    });

    if (sortOrder === 'name-asc') filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (sortOrder === 'name-desc') filtered.sort((a, b) => b.nombre.localeCompare(a.nombre));
    if (sortOrder === 'price-asc') filtered.sort((a, b) => getPriceValue(a) - getPriceValue(b));
    if (sortOrder === 'price-desc') filtered.sort((a, b) => getPriceValue(b) - getPriceValue(a));
    return filtered;
  }, [allCategoryProducts, availableOnly, maxPrice, minPrice, selectedColors, sortOrder]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 760px)');
    const tabletQuery = window.matchMedia('(max-width: 1050px)');
    const updateSlidesPerView = () => {
      setSlidesPerView(mobileQuery.matches ? 1 : tabletQuery.matches ? 2 : 4);
      setSlideStart(0);
    };

    mobileQuery.addEventListener('change', updateSlidesPerView);
    tabletQuery.addEventListener('change', updateSlidesPerView);
    return () => {
      mobileQuery.removeEventListener('change', updateSlidesPerView);
      tabletQuery.removeEventListener('change', updateSlidesPerView);
    };
  }, []);

  function selectCategory(categoryId) {
    setSelectedCategory(categoryId);
    setSlideStart(0);
    setCurrentPage(1);
    setSelectedColors([]);
    setAvailableOnly(false);
    setMinPrice(0);
    setMaxPrice(Math.max(...productosCatalogo[categoryId].map(getPriceValue)));
  }

  function toggleFavorite(productId) {
    setFavorites((current) => (
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    ));
  }

  function toggleColor(color) {
    setSelectedColors((current) => (
      current.includes(color)
        ? current.filter((item) => item !== color)
        : [...current, color]
    ));
    setCurrentPage(1);
  }

  function resetFilters() {
    setAvailableOnly(false);
    setSelectedColors([]);
    setMinPrice(0);
    setMaxPrice(categoryMaximumPrice);
    setSortOrder('relevant');
    setCurrentPage(1);
  }

  return (
    <>
      <section
        className={`catalog-section catalog-category-${selectedCategory}${showAll ? ' is-expanded' : ''}`}
        id="productos"
        aria-labelledby="catalog-title"
        ref={catalogRef}
      >
        {showAll && (
          <div className="catalog-floating-decorations" aria-hidden="true">
            {decoracionesFondo.map((decoration, index) => (
              <span
                className="catalog-floating-decoration"
                key={`${decoration.icono}-${decoration.x}`}
                style={{
                  left: `${decoration.x}%`,
                  top: `${decoration.y}%`,
                  '--decoration-delay': `${-index * 0.53}s`,
                  '--decoration-duration': `${7 + (index % 5)}s`,
                }}
              >
                {decoration.icono}
              </span>
            ))}
          </div>
        )}
        {!showAll ? (
          <div className="catalog-showcase">
            <aside className="catalog-category-panel">
              <div className="catalog-heading">
                <p className="catalog-eyebrow">Todo para celebrar</p>
                <h2 id="catalog-title">Categorías destacadas</h2>
              </div>
              <nav className="catalog-categories" aria-label="Categorías de productos">
                {categoriasCatalogo.map((category) => (
                  <button
                    type="button"
                    key={category.id}
                    className={selectedCategory === category.id ? 'is-selected' : ''}
                    aria-pressed={selectedCategory === category.id}
                    onClick={() => selectCategory(category.id)}
                  >
                    <span className="catalog-category-icon">
                      <CategoryIcon category={category.id} />
                    </span>
                    <span>{category.nombre}</span>
                    <span className="catalog-category-count">{productosCatalogo[category.id].length}</span>
                  </button>
                ))}
              </nav>
            </aside>
            <div className="catalog-preview">
              <div className="catalog-preview-heading">
                <h3>{categoriasCatalogo.find((category) => category.id === selectedCategory)?.nombre}</h3>
                <span>{allCategoryProducts.length} productos</span>
              </div>
              <div className="catalog-preview-cards" aria-live="polite">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    category={selectedCategory}
                    product={product}
                    favorite={favorites.includes(product.id)}
                    onFavorite={toggleFavorite}
                    onAdd={() => onPending('Agregar al carrito')}
                  />
                ))}
              </div>
              <div className="catalog-preview-actions">
                <div className="catalog-slider-controls" aria-label="Navegación de productos">
                  <button
                    type="button"
                    aria-label="Productos anteriores"
                    disabled={slideStart === 0}
                    onClick={() => setSlideStart((current) => Math.max(0, current - slidesPerView))}
                  >
                    ←
                  </button>
                  <span>{Math.min(slideStart + slidesPerView, allCategoryProducts.length)} / {allCategoryProducts.length}</span>
                  <button
                    type="button"
                    aria-label="Productos siguientes"
                    disabled={slideStart >= maxSlide}
                    onClick={() => setSlideStart((current) => Math.min(maxSlide, current + slidesPerView))}
                  >
                    →
                  </button>
                </div>
                <button type="button" className="catalog-view-all" onClick={() => setShowAll(true)}>
                  Ver todo <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="catalog-all-content">
            <button type="button" className="catalog-back-button" onClick={() => setShowAll(false)}>
              <span aria-hidden="true">←</span> Volver a categorías
            </button>
            <div className="catalog-all-layout">
              <aside className="catalog-filters" aria-label="Filtros del catálogo">
                <div className="catalog-filter-title">
                  <h3>Filtros</h3>
                  <button type="button" onClick={resetFilters}>Limpiar</button>
                </div>
                <fieldset className="catalog-filter-group">
                  <legend>Categorías</legend>
                  {categoriasCatalogo.map((category) => (
                    <label className="catalog-filter-option" key={category.id}>
                      <input
                        type="radio"
                        name="catalog-category"
                        checked={selectedCategory === category.id}
                        onChange={() => selectCategory(category.id)}
                      />
                      <span>{category.nombre}</span>
                      <small>{productosCatalogo[category.id].length}</small>
                    </label>
                  ))}
                </fieldset>
                <fieldset className="catalog-filter-group">
                  <legend>Disponibilidad</legend>
                  <label className="catalog-filter-option">
                    <input
                      type="checkbox"
                      checked={availableOnly}
                      onChange={(event) => {
                        setAvailableOnly(event.target.checked);
                        setCurrentPage(1);
                      }}
                    />
                    <span>En existencia</span>
                  </label>
                </fieldset>
                <fieldset className="catalog-filter-group">
                  <legend>Precio</legend>
                  <div className="catalog-price-inputs">
                    <label>
                      <span>Mínimo (COP)</span>
                      <input
                        type="number"
                        min="0"
                        max={maxPrice}
                        value={minPrice}
                        onChange={(event) => {
                          setMinPrice(Math.min(maxPrice, Math.max(0, Number(event.target.value))));
                          setCurrentPage(1);
                        }}
                      />
                    </label>
                    <label>
                      <span>Máximo (COP)</span>
                      <input
                        type="number"
                        min={minPrice}
                        max={categoryMaximumPrice}
                        value={maxPrice}
                        onChange={(event) => {
                          setMaxPrice(Math.max(minPrice, Number(event.target.value)));
                          setCurrentPage(1);
                        }}
                      />
                    </label>
                  </div>
                  <input
                    className="catalog-price-range"
                    type="range"
                    min="0"
                    max={categoryMaximumPrice || 1}
                    value={maxPrice}
                    aria-label="Precio máximo"
                    onChange={(event) => {
                      setMaxPrice(Number(event.target.value));
                      setCurrentPage(1);
                    }}
                  />
                  <p className="catalog-filter-hint">Precio máximo: {formatPriceCOP(categoryMaximumPrice)}</p>
                </fieldset>
                {availableColors.length > 0 && (
                  <fieldset className="catalog-filter-group">
                    <legend>Colores</legend>
                    {availableColors.map((color) => (
                      <label className="catalog-filter-option" key={color}>
                        <input
                          type="checkbox"
                          checked={selectedColors.includes(color)}
                          onChange={() => toggleColor(color)}
                        />
                        <span>{color}</span>
                      </label>
                    ))}
                  </fieldset>
                )}
              </aside>
              <div className="catalog-results">
                <header className="catalog-results-toolbar">
                  <p><strong>{filteredProducts.length}</strong> artículos</p>
                  <label className="catalog-sort">
                    <span>Ordenar:</span>
                    <select
                      value={sortOrder}
                      onChange={(event) => {
                        setSortOrder(event.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="relevant">Más relevantes</option>
                      <option value="name-asc">Alfabéticamente, A-Z</option>
                      <option value="name-desc">Alfabéticamente, Z-A</option>
                      <option value="price-asc">Precio, menor a mayor</option>
                      <option value="price-desc">Precio, mayor a menor</option>
                    </select>
                  </label>
                </header>
                {paginatedProducts.length > 0 ? (
                  <div className="catalog-all-grid">
                    {paginatedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        category={selectedCategory}
                        product={product}
                        favorite={favorites.includes(product.id)}
                        onFavorite={toggleFavorite}
                        onAdd={() => onPending('Agregar al carrito')}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="catalog-no-results">No hay productos con esos filtros. Prueba otros criterios.</p>
                )}
                {pageCount > 1 && (
                  <nav className="catalog-pagination" aria-label="Paginación del catálogo">
                    <button
                      type="button"
                      aria-label="Página anterior"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((page) => page - 1)}
                    >
                      ←
                    </button>
                    <span>Página {currentPage} de {pageCount}</span>
                    <button
                      type="button"
                      aria-label="Página siguiente"
                      disabled={currentPage === pageCount}
                      onClick={() => setCurrentPage((page) => page + 1)}
                    >
                      →
                    </button>
                  </nav>
                )}
                {selectedCategory === 'eventos' && (
                  <div className="catalog-quote-action">
                    <button type="button" onClick={onQuote}>
                      Cotizar <span aria-hidden="true">→</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
      <footer className="catalog-footer" ref={catalogFooterRef}>
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
              <button type="button" onClick={onShare} aria-label="Compartir página">
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
  );
}

export default Catalog;
