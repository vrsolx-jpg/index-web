import { ENVIO, changeQty, getTotals, removeFromCart, useCart } from './shopStore.js';
import { formatCOP } from './format.js';
import './Shop.css';

function CartDrawer({ onClose, onCheckout, onExplore }) {
  const lineas = useCart();
  const { unidades, subtotal, costoEnvio, total } = getTotals(lineas);
  const faltaParaGratis = Math.max(0, ENVIO.gratisDesde - subtotal);
  const progreso = Math.min(100, (subtotal / ENVIO.gratisDesde) * 100);

  return (
    <div
      className="auth-overlay cart-overlay"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onClose();
      }}
    >
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <header className="cart-head">
          <div>
            <h2 id="cart-title">Tu carrito</h2>
            <p>{unidades === 0 ? 'Aún no hay productos' : `${unidades} ${unidades === 1 ? 'producto' : 'productos'}`}</p>
          </div>
          <button type="button" className="auth-close" aria-label="Cerrar carrito" onClick={onClose}>
            ×
          </button>
        </header>

        {lineas.length === 0 ? (
          <div className="cart-empty">
            <p>Tu carrito está vacío. Agrega globos, piñatas y todo lo que necesites para la fiesta.</p>
            <button type="button" className="shop-primary" onClick={onExplore}>
              Explorar productos
            </button>
          </div>
        ) : (
          <>
            <ul className="cart-lines">
              {lineas.map((linea) => (
                <li className="cart-line" key={linea.id}>
                  <div className="cart-thumb">
                    {linea.image ? <img src={linea.image} alt="" /> : <span aria-hidden="true">✦</span>}
                  </div>
                  <div className="cart-line-info">
                    <h3>{linea.nombre}</h3>
                    <p className="cart-line-price">{formatCOP(linea.precioCOP)}</p>
                    <div className="cart-line-controls">
                      <div className="qty-stepper" role="group" aria-label={`Cantidad de ${linea.nombre}`}>
                        <button
                          type="button"
                          aria-label="Quitar una unidad"
                          onClick={() => changeQty(linea.id, linea.cantidad - 1)}
                        >
                          −
                        </button>
                        <span aria-live="polite">{linea.cantidad}</span>
                        <button
                          type="button"
                          aria-label="Agregar una unidad"
                          onClick={() => changeQty(linea.id, linea.cantidad + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button type="button" className="shop-link" onClick={() => removeFromCart(linea.id)}>
                        Quitar
                      </button>
                    </div>
                  </div>
                  <strong className="cart-line-total">{formatCOP(linea.precioCOP * linea.cantidad)}</strong>
                </li>
              ))}
            </ul>

            <footer className="cart-foot">
              <div className="cart-shipping">
                <p>
                  {faltaParaGratis > 0
                    ? `Agrega ${formatCOP(faltaParaGratis)} más y el envío es gratis.`
                    : '¡Tu envío es gratis!'}
                </p>
                <div className="cart-progress" aria-hidden="true">
                  <span style={{ width: `${progreso}%` }} />
                </div>
              </div>
              <dl className="cart-totals">
                <div><dt>Subtotal</dt><dd>{formatCOP(subtotal)}</dd></div>
                <div><dt>Envío</dt><dd>{costoEnvio === 0 ? 'Gratis' : formatCOP(costoEnvio)}</dd></div>
                <div className="is-total"><dt>Total</dt><dd>{formatCOP(total)}</dd></div>
              </dl>
              <button type="button" className="shop-primary cart-checkout" onClick={onCheckout}>
                Ir a pagar
              </button>
              <button type="button" className="shop-link cart-continue" onClick={onExplore}>
                Seguir explorando
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

export default CartDrawer;
