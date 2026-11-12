import { useEffect, useMemo, useState } from 'react';
import {
  categoriasCatalogo,
  productosCatalogo,
  productosCatalogoCompleto,
} from './catalogProducts.js';
import logoFiesta from '../../assets/fiesta-colombia-logo.png';
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

  if (category === 'todos') {
    return (
      <svg {...props}>
        <rect x="4" y="4" width="9" height="9" rx="1.5" />
        <rect x="19" y="4" width="9" height="9" rx="1.5" />
        <rect x="4" y="19" width="9" height="9" rx="1.5" />
        <rect x="19" y="19" width="9" height="9" rx="1.5" />
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
  if (!product.colores?.length) return [];
  return [...new Set(
    product.colores
      .map((color) => nombresColor[color.toLowerCase()])
      .filter(Boolean)
  )];
}

function getPriceValue(product) {
  return product.precioCOP;
}

function getSalePrice(product) {
  return product.descuentoPorcentaje
    ? Math.round(product.precioCOP * (1 - product.descuentoPorcentaje / 100))
    : product.precioCOP;
}

function formatPriceCOP(price) {
  return `${new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price)} COP`;
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 1.9-1.4L22 8H6" />
      <circle cx="10" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

function ProductCard({ product, favorite, onFavorite, onOpen, onAdd }) {
  const outOfStock = product.stock <= 0;

  return (
    <article className="catalog-product-card">
      <button type="button" className="catalog-product-open" onClick={onOpen}>
        <span className="catalog-product-image">
          {product.image ? (
            <img src={product.image} alt="" loading="lazy" />
          ) : (
            <span className={`catalog-image-placeholder catalog-image-placeholder--${product.categoria}`}>
              <span aria-hidden="true">{iconosCategoria[product.categoria]}</span>
              <small>Imagen por agregar</small>
            </span>
          )}
          {product.descuentoPorcentaje && (
            <span className="catalog-discount-badge">-{product.descuentoPorcentaje}%</span>
          )}
          {outOfStock && <span className="catalog-stock-badge">Agotado</span>}
        </span>
        <span className="catalog-product-info">
          <span className="catalog-product-category">
            {categoriasCatalogo.find((item) => item.id === product.categoria)?.nombre}
          </span>
          {product.colores?.length > 0 && (
            <span className="catalog-product-colors" aria-label="Colores disponibles">
              {product.colores.map((color) => (
                <span key={color} style={{ '--product-swatch': color }} />
              ))}
            </span>
          )}
          <span className="catalog-product-name">{product.nombre}</span>
          <span className={`catalog-product-price${product.descuentoPorcentaje ? ' has-discount' : ''}`}>
            {product.descuentoPorcentaje && (
              <del>{formatPriceCOP(product.precioCOP)}</del>
            )}
            {product.precioDesde ? 'Desde ' : ''}{formatPriceCOP(getSalePrice(product))}
          </span>
        </span>
      </button>
      <button
        type="button"
        className={`catalog-product-favorite${favorite ? ' is-favorite' : ''}`}
        aria-label={favorite ? `Quitar ${product.nombre} de favoritos` : `Agregar ${product.nombre} a favoritos`}
        aria-pressed={favorite}
        onClick={() => onFavorite(product.id)}
      >
        {favorite ? '♥' : '♡'}
      </button>
      <button
        type="button"
        className="catalog-product-add"
        disabled={outOfStock}
        onClick={onAdd}
      >
        <CartIcon />
        {outOfStock ? 'Agotado' : 'Agregar al carrito'}
      </button>
    </article>
  );
}

function ProductModal({ product, onClose, onAdd }) {
  const [quantity, setQuantity] = useState(1);
  const outOfStock = product.stock <= 0;

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div
      className="catalog-product-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="catalog-product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <button type="button" className="catalog-product-modal-close" onClick={onClose} aria-label="Cerrar detalle">
          ×
        </button>
        <div className="catalog-product-modal-image">
          {product.image ? (
            <img src={product.image} alt={product.nombre} />
          ) : (
            <div className={`catalog-image-placeholder catalog-image-placeholder--${product.categoria}`}>
              <span aria-hidden="true">{iconosCategoria[product.categoria]}</span>
              <small>Imagen por agregar</small>
            </div>
          )}
        </div>
        <div className="catalog-product-modal-details">
          <p className="catalog-product-category">
            {categoriasCatalogo.find((item) => item.id === product.categoria)?.nombre}
          </p>
          <h2 id="product-modal-title">{product.nombre}</h2>
          <p className="catalog-product-modal-brand">Marca: <strong>{product.marca}</strong></p>
          <p className={`catalog-product-modal-stock${outOfStock ? ' is-out-of-stock' : ''}`}>
            {product.stock} {product.stock === 1 ? 'unidad disponible' : 'unidades disponibles'}
            {outOfStock && ' · Agotado'}
          </p>
          <p className={`catalog-product-modal-price${product.descuentoPorcentaje ? ' has-discount' : ''}`}>
            {product.descuentoPorcentaje && (
              <del>{formatPriceCOP(product.precioCOP)}</del>
            )}
            {formatPriceCOP(getSalePrice(product))}
          </p>
          {product.colores?.length > 0 && (
            <div className="catalog-product-modal-colors">
              <span>Colores disponibles:</span>
              {product.colores.map((color) => (
                <span key={color} style={{ '--product-swatch': color }} aria-label={nombresColor[color.toLowerCase()] ?? color} />
              ))}
            </div>
          )}
          <div className="catalog-product-modal-actions">
            <div className="catalog-quantity-picker" aria-label="Cantidad">
              <button
                type="button"
                aria-label="Disminuir cantidad"
                disabled={quantity <= 1 || outOfStock}
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              >
                −
              </button>
              <span aria-live="polite">{quantity}</span>
              <button
                type="button"
                aria-label="Aumentar cantidad"
                disabled={outOfStock || quantity >= product.stock}
                onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))}
              >
                +
              </button>
            </div>
            <button
              type="button"
              className="catalog-product-add"
              disabled={outOfStock}
              onClick={() => onAdd(quantity)}
            >
              <CartIcon />
              {outOfStock ? 'Agotado' : 'Agregar al carrito'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Catalog({ catalogRef, catalogFooterRef, onPending, onShare, onQuote, onOpenChat, onExpand, onCollapse }) {
  const [selectedCategory, setSelectedCategory] = useState(categoriasCatalogo[0].id);
  const [showAll, setShowAll] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [slideStart, setSlideStart] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(() => (
    window.matchMedia('(max-width: 760px)').matches ? 1
      : window.matchMedia('(max-width: 1050px)').matches ? 2 : 4
  ));
  const [sortOrder, setSortOrder] = useState('relevant');
  const [selectedColors, setSelectedColors] = useState([]);
  const itemsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const allCategoryProducts = selectedCategory === 'todos'
    ? productosCatalogoCompleto
    : productosCatalogo[selectedCategory];
  const categoryMaximumPrice = Math.max(...allCategoryProducts.map(getPriceValue));
  const minPrice = minPriceInput === '' ? 0 : Number(minPriceInput);
  const maxPrice = maxPriceInput === '' ? categoryMaximumPrice : Number(maxPriceInput);
  const maxSlide = Math.max(0, allCategoryProducts.length - slidesPerView);
  const visibleProducts = allCategoryProducts.slice(slideStart, slideStart + slidesPerView);

  const availableColors = useMemo(
    () => [...new Set(productosCatalogoCompleto.flatMap(getProductColors))]
      .filter((color) => color !== 'Surtido'),
    []
  );

  const filteredProducts = useMemo(() => {
    const filtered = allCategoryProducts.filter((product) => {
      const price = getSalePrice(product);
      const matchesPrice = price >= minPrice && price <= maxPrice;
      const matchesColor = selectedColors.length === 0
        || getProductColors(product).some((color) => selectedColors.includes(color));
      return matchesPrice && matchesColor;
    });

    if (sortOrder === 'relevant') {
      filtered.sort((a, b) => (
        Number(Boolean(b.descuentoPorcentaje)) - Number(Boolean(a.descuentoPorcentaje))
        || getSalePrice(a) - getSalePrice(b)
      ));
    }
    if (sortOrder === 'name-asc') filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (sortOrder === 'name-desc') filtered.sort((a, b) => b.nombre.localeCompare(a.nombre));
    if (sortOrder === 'price-asc') filtered.sort((a, b) => getSalePrice(a) - getSalePrice(b));
    if (sortOrder === 'price-desc') filtered.sort((a, b) => getSalePrice(b) - getSalePrice(a));
    return filtered;
  }, [allCategoryProducts, maxPrice, minPrice, selectedColors, sortOrder]);
  const hasColorMatches = selectedColors.length === 0
    || allCategoryProducts.some((product) => (
      getProductColors(product).some((color) => selectedColors.includes(color))
    ));

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
    setMinPriceInput('');
    setMaxPriceInput('');
  }

  function toggleFavorite(productId) {
    setFavorites((current) => (
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    ));
  }

  function toggleColor(color) {
    setSelectedColors((current) => {
      if (current.includes(color)) return current.filter((item) => item !== color);
      return [...current, color];
    });
    setCurrentPage(1);
  }

  function resetFilters() {
    setSelectedColors([]);
    setMinPriceInput('');
    setMaxPriceInput('');
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
                {[{ id: 'todos', nombre: 'Todas las categorías' }, ...categoriasCatalogo].map((category) => (
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
                    <span className="catalog-category-count">
                      {category.id === 'todos'
                        ? productosCatalogoCompleto.length
                        : productosCatalogo[category.id].length}
                    </span>
                  </button>
                ))}
              </nav>
            </aside>
            <div className="catalog-preview">
              <div className="catalog-preview-heading">
                <h3>
                  {selectedCategory === 'todos'
                    ? 'Todos los productos'
                    : categoriasCatalogo.find((category) => category.id === selectedCategory)?.nombre}
                </h3>
                <span>{allCategoryProducts.length} productos</span>
              </div>
              <div className="catalog-preview-cards" aria-live="polite">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    favorite={favorites.includes(product.id)}
                    onFavorite={toggleFavorite}
                    onOpen={() => setSelectedProduct(product)}
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
                <button
                  type="button"
                  className="catalog-view-all"
                  onClick={() => {
                    selectCategory('todos');
                    setShowAll(true);
                    onExpand();
                  }}
                >
                  Ver todo <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="catalog-all-content">
            <button
              type="button"
              className="catalog-back-button"
              onClick={() => {
                setShowAll(false);
                onCollapse();
              }}
            >
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
                  {[{ id: 'todos', nombre: 'Todas las categorías' }, ...categoriasCatalogo].map((category) => (
                    <label className="catalog-filter-option" key={category.id}>
                      <input
                        type="radio"
                        name="catalog-category"
                        checked={selectedCategory === category.id}
                        onChange={() => selectCategory(category.id)}
                      />
                      <span>{category.nombre}</span>
                      <small>
                        {category.id === 'todos'
                          ? productosCatalogoCompleto.length
                          : productosCatalogo[category.id].length}
                      </small>
                    </label>
                  ))}
                </fieldset>
                <fieldset className="catalog-filter-group">
                <legend>Precio</legend>
                <div className="catalog-price-inputs">
                    <label>
                      <span>Mínimo (COP)</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="0"
                        value={minPriceInput}
                        onChange={(event) => {
                          if (/^\d*$/.test(event.target.value)) {
                            setMinPriceInput(event.target.value);
                            setCurrentPage(1);
                          }
                        }}
                      />
                    </label>
                    <label>
                      <span>Máximo (COP)</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder={String(categoryMaximumPrice)}
                        value={maxPriceInput}
                        onChange={(event) => {
                          if (/^\d*$/.test(event.target.value)) {
                            setMaxPriceInput(event.target.value);
                            setCurrentPage(1);
                          }
                        }}
                      />
                    </label>
                  </div>
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
                {selectedColors.length > 0 && !hasColorMatches && (
                  <p className="catalog-color-unavailable" role="status">
                    Los colores seleccionados no están disponibles en esta categoría por el momento.
                  </p>
                )}
                {paginatedProducts.length > 0 ? (
                  <div className="catalog-all-grid">
                    {paginatedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        favorite={favorites.includes(product.id)}
                        onFavorite={toggleFavorite}
                        onOpen={() => setSelectedProduct(product)}
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
      {selectedProduct && (
        <ProductModal
          key={selectedProduct.id}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={() => {
            onPending('Agregar al carrito');
            setSelectedProduct(null);
          }}
        />
      )}
      <footer className="catalog-footer" ref={catalogFooterRef}>
        <div className="catalog-footer-main">
          <section className="catalog-footer-brand" aria-labelledby="footer-brand-title">
            <div className="catalog-footer-brand-lockup">
              <img src={logoFiesta} alt="Logo de Fiesta Colombia: confeti dentro de un círculo" />
              <h2 id="footer-brand-title">
                <span>Fiesta</span>
                <span>Colombia</span>
              </h2>
            </div>
          </section>
          <section className="catalog-footer-contact" aria-labelledby="footer-contact-title">
            <h2 id="footer-contact-title">Contacto</h2>
            <p className="catalog-footer-contact-item">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              Neiva, Huila, Colombia
            </p>
            <a className="catalog-footer-contact-item" href="tel:+573000000000">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 3h4l2 5-3 2a16 16 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2C10 20 4 14 3 5a2 2 0 0 1 2-2Z" />
              </svg>
              +57 300 000 0000
            </a>
            <a className="catalog-footer-contact-item" href="mailto:contacto@fiestacolombia.example">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m4 7 8 6 8-6" />
              </svg>
              contacto@fiestacolombia.example
            </a>
            <div className="catalog-footer-links">
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle className="social-icon-dot" cx="18" cy="6" r="1" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2-2h1.7V1.4C17 1.2 15.8 1 14.5 1 11.2 1 9 3 9 6.7V9H6v4h3v8z" />
                </svg>
              </a>
              <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer" aria-label="TikTok">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14 3v11.2a4.2 4.2 0 1 1-3.2-4.1M14 3c.6 3.2 2.7 5.2 6 5.5" />
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
          </section>
          <section className="catalog-footer-hours" aria-labelledby="footer-hours-title">
            <h2 id="footer-hours-title">Horario</h2>
            <p>Servicio completamente online</p>
            <strong>24 horas · todos los días</strong>
          </section>
          <section className="catalog-footer-chat" aria-labelledby="footer-chat-title">
            <h2 id="footer-chat-title">¿Necesitas ayuda?</h2>
            <button type="button" onClick={onOpenChat}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.6 8.6 0 0 1-3.5-.8L4 20l1.2-3.4A7.2 7.2 0 0 1 4 12c0-4.1 3.6-7.5 8-7.5s8 2.9 8 7Z" />
                <path d="M8 12h.01M12 12h.01M16 12h.01" />
              </svg>
              <span>Abrir chatbot</span>
            </button>
          </section>
        </div>
        <div className="catalog-footer-copyright">© 2026 Fiesta Colombia. Todos los derechos reservados.</div>
      </footer>
    </>
  );
}

export default Catalog;
