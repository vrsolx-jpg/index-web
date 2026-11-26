import { ENVIO } from '../shop/shopStore.js';
import { formatCOP } from '../shop/format.js';

const normalizar = (texto) => texto.toLocaleLowerCase('es-CO').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function responderPregunta(texto) {
  const pregunta = normalizar(texto);
  const respuesta = (text, action) => ({ text, action });
  if (/\b(envios?|entregas?|domicilio|despachos?|cobertura)\b/.test(pregunta)) {
    return respuesta(`El envío cuesta ${formatCOP(ENVIO.tarifa)} y es gratis desde ${formatCOP(ENVIO.gratisDesde)}. Indica ciudad y dirección en Entrega. Para consultar cobertura o tiempos para tu evento, escríbenos a contacto@fiestacolombia.com.co.`);
  }
  if (/\b(pagos?|pagar|tarjetas?|qr|nequi|pse|debito|credito|contraentrega)\b/.test(pregunta)) {
    return respuesta('En el checkout puedes elegir tarjeta de crédito o débito, QR de Nequi, PSE o contra entrega. El flujo actual es una demostración: no realiza cobros reales.');
  }
  if (/\b(stock|unidades|disponib\w*|existencias|agotado)\b/.test(pregunta)) {
    return respuesta('Abre la ficha del producto para ver las unidades disponibles. Si aparece Agotado, no podrás agregarlo al carrito. En los productos con variantes, elige el color antes de agregarlo.', 'catalogo');
  }
  if (/\b(pedidos?|compras?|seguimiento)\b/.test(pregunta)) {
    return respuesta('Inicia sesión, abre Mi perfil y entra a Mis pedidos. Allí encontrarás el número, estado, productos, entrega y forma de pago de cada compra.');
  }
  if (/\b(horarios?|atienden|abiert[oa]|hora)\b/.test(pregunta)) {
    return respuesta('La tienda online está disponible las 24 horas, todos los días. Puedes explorar el catálogo y enviar una cotización cuando quieras.');
  }
  if (/\b(contact\w*|correo|email|telefono|ubicacion|direccion)\b/.test(pregunta)) {
    return respuesta('Estamos en Neiva, Huila. Escríbenos a contacto@fiestacolombia.com.co o completa el formulario de Cotizaciones para contarnos lo que necesitas.', 'cotizacion');
  }
  if (/\b(cotiza\w*|bodas?|matrimonios?|eventos?|graduaciones|presupuesto)\b/.test(pregunta)) {
    return respuesta('En Cotizaciones puedes indicar el evento, la fecha, los invitados, los detalles y los productos que necesitas. Al enviar el formulario recibirás un número de solicitud y la tienda revisará tu propuesta.', 'cotizacion');
  }
  if (/\b(productos?|catalogo|buscar|encuentro|colores?|decoraciones|pinatas?|globos|fiestas?)\b/.test(pregunta)) {
    return respuesta('Usa Buscar productos o abre el catálogo completo. Puedes filtrar por categoría, precio y color, y consultar el stock en cada ficha. Para una piñata o temática especial, envíanos una cotización.', 'catalogo');
  }
  if (/\b(gracias|agrade\w*|muy amable|excelente|perfecto)\b/.test(pregunta)) {
    return respuesta('¡Con mucho gusto! Aquí estoy si necesitas ayuda con productos, tu pedido o una cotización.');
  }
  if (/\b(adios|chao|chau|hasta luego|nos vemos|bye)\b/.test(pregunta)) {
    return respuesta('¡Hasta pronto! Que tu celebración esté llena de momentos especiales. Aquí te esperamos cuando quieras volver.');
  }
  if (/\b(hola|holi|buenas|buenos dias|buenas tardes|buenas noches|hey)\b/.test(pregunta)) {
    return respuesta('¡Hola! Qué gusto verte por Fiesta Colombia. Puedo ayudarte con productos, pagos, envíos o cotizaciones. Elige una pregunta frecuente o cuéntame qué estás preparando.');
  }
  return respuesta('Puedo ayudarte con el catálogo, disponibilidad, pagos, envíos, pedidos y cotizaciones. Cuéntame un poco más o escríbenos a contacto@fiestacolombia.com.co.');
}
