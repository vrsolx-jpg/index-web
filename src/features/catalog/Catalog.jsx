import { useEffect, useMemo, useRef, useState } from 'react';
import {
  categoriasCatalogo,
  productosCatalogo,
  productosCatalogoCompleto,
} from './catalogProducts.js';
import SiteFooter from '../shared/SiteFooter.jsx';
import { colorCaption, getProductColors, getSalePrice, nombresColor, normalizarTexto } from './catalogUtils.js';
import { entrance, gsap, motionQuery } from '../shared/motion.js';
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
            <span className="catalog-product-colors" aria-label={product.tipoColor === 'seleccionable' ? 'Colores para elegir en el detalle' : colorCaption(product)}>
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
        {outOfStock ? 'Agotado' : product.tipoColor === 'seleccionable' ? 'Elegir color' : 'Agregar al carrito'}
      </button>
    </article>
  );
}

function ProductModal({ product, onClose, onAdd }) {
  const modalRef = useRef(null);
  const [quantity, setQuantity] = useState(1);
  const [variant, setVariant] = useState(null);
  const needsColor = product.tipoColor === 'seleccionable';
  const unitPrice = getSalePrice(product);
  const outOfStock = product.stock <= 0;

  useEffect(() => {
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add(motionQuery, () => {
        gsap.fromTo(modalRef.current,
          { autoAlpha: 0, scale: 0.96 },
          { ...entrance, autoAlpha: 1, scale: 1, duration: 0.5 });
      });
    }, modalRef);
    return () => { media.revert(); context.revert(); };
  }, []);

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
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <button type="button" className="catalog-product-modal-close" onClick={onClose} aria-label="Cerrar detalle">
          ×
        </button>
        <div className="catalog-product-modal-image">
          {product.image ? (
            <img src={variant?.image ?? product.image} alt={`${product.nombre}${variant ? `, ${variant.nombre}` : ''}`} />
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
          {product.descripcion && <p className="mb-4">{product.descripcion}</p>}
          <p className="catalog-product-modal-brand">Marca: <strong>{product.marca}</strong></p>
          <p className={`catalog-product-modal-stock${outOfStock ? ' is-out-of-stock' : ''}`}>
            {product.stock} {product.stock === 1 ? 'unidad disponible' : 'unidades disponibles'}
            {outOfStock && ' · Agotado'}
          </p>
          <p className={`catalog-product-modal-price${product.descuentoPorcentaje ? ' has-discount' : ''}`} aria-live="polite" aria-atomic="true">
            {product.descuentoPorcentaje && <del>{formatPriceCOP(product.precioCOP * quantity)}</del>}
            {formatPriceCOP(unitPrice * quantity)}
          </p>
          <p className="catalog-unit-price">Precio unitario: {formatPriceCOP(unitPrice)} · {quantity} {quantity === 1 ? 'unidad' : 'unidades'}</p>
          {product.colores?.length > 0 && (
            <div className="catalog-product-modal-colors">
              <span>{colorCaption(product)}</span>
              {needsColor ? (
                <div className="catalog-color-options" role="radiogroup" aria-label="Color del producto">
                  {product.variantes.map((option) => (
                    <button key={option.color} type="button" role="radio" aria-checked={variant?.color === option.color}
                      aria-label={option.nombre} title={option.nombre} className={`catalog-color-option${variant?.color === option.color ? ' is-selected' : ''}`}
                      style={{ '--product-swatch': option.color }} onClick={() => setVariant(option)}>
                      {variant?.color === option.color && <span aria-hidden="true">✓</span>}
                    </button>
                  ))}
                </div>
              ) : product.colores.map((color) => (
                <span key={color} style={{ '--product-swatch': color }} aria-label={nombresColor[color.toLowerCase()] ?? color} />
              ))}
            </div>
          )}
          {needsColor && <p className="catalog-color-selection" role="status">{variant ? `Color elegido: ${variant.nombre}` : 'Selecciona el color que quieres recibir.'}</p>}
          {product.tipoColor === 'surtido' && <p className="catalog-color-selection">El surtido se entrega como viene empacado; los colores no se eligen por separado.</p>}
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
              disabled={outOfStock || (needsColor && !variant)}
              onClick={() => onAdd(quantity, variant)}
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

function Catalog({ searchTerm = '', catalogRef, catalogFooterRef, isExpanded, onAddToCart, onShare, onQuote, onOpenChat, onExpand, onCollapse }) {
  const productsRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState(searchTerm || isExpanded ? 'todos' : categoriasCatalogo[0].id);
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
      const matchesSearch = !searchTerm || normalizarTexto(`${product.nombre} ${product.descripcion ?? ''}`).includes(normalizarTexto(searchTerm));
      return matchesPrice && matchesColor && matchesSearch;
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
  }, [allCategoryProducts, maxPrice, minPrice, selectedColors, sortOrder, searchTerm]);
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
    if (!productsRef.current) return;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add(motionQuery, () => {
        gsap.fromTo('.catalog-product-card',
          { autoAlpha: 0, y: 14 },
          { ...entrance, autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.05 });
      }, productsRef);
    }, productsRef);
    return () => { media.revert(); context.revert(); };
  }, [filteredProducts, currentPage, isExpanded, slideStart, slidesPerView]);

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
        className={`catalog-section catalog-category-${selectedCategory}${isExpanded ? ' is-expanded' : ''}`}
        id="productos"
        aria-labelledby="catalog-title"
        ref={catalogRef}
      >
        {isExpanded && (
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
        {!isExpanded ? (
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
              <div className="catalog-preview-cards" aria-live="polite" ref={productsRef}>
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    favorite={favorites.includes(product.id)}
                    onFavorite={toggleFavorite}
                    onAdd={() => product.tipoColor === 'seleccionable' ? setSelectedProduct(product) : onAddToCart(product)}
                    onOpen={() => setSelectedProduct(product)}
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
                  <p><strong>{filteredProducts.length}</strong> artículos{searchTerm && <span className="catalog-search-term"> · Resultados para “{searchTerm}”</span>}</p>
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
                  <div className="catalog-all-grid" ref={productsRef}>
                    {paginatedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        favorite={favorites.includes(product.id)}
                        onFavorite={toggleFavorite}
                        onAdd={() => product.tipoColor === 'seleccionable' ? setSelectedProduct(product) : onAddToCart(product)}
                        onOpen={() => setSelectedProduct(product)}
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
          onAdd={(quantity, variant) => {
            onAddToCart({ ...selectedProduct, image: variant?.image ?? selectedProduct.image, colorElegido: variant?.nombre, colorHex: variant?.color }, quantity);
            setSelectedProduct(null);
          }}
        />
      )}
      <SiteFooter onShare={onShare} onOpenChat={onOpenChat} footerRef={catalogFooterRef} />
    </>
  );
}

export default Catalog;
