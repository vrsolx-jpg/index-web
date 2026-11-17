import { MARCAS } from './pagos.js';

function CardVisual({ marca = 'desconocida', numero = '', titular = '', vence = '', compacta = false }) {
  const info = MARCAS[marca] ?? MARCAS.desconocida;

  return (
    <div className={`card-art card-art--${marca}${compacta ? ' is-compact' : ''}`} aria-hidden="true">
      <div className="card-art-top">
        <span className="card-art-chip" />
        {marca === 'mastercard'
          ? <span className="card-art-mc"><i /><i /></span>
          : <span className="card-art-brand">{info.corto}</span>}
      </div>
      <div className="card-art-number">{numero || '•••• •••• •••• ••••'}</div>
      <div className="card-art-bottom">
        <span><small>Titular</small>{titular || 'NOMBRE APELLIDO'}</span>
        <span><small>Vence</small>{vence || 'MM/AA'}</span>
      </div>
    </div>
  );
}

export default CardVisual;
