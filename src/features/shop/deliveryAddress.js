// La dirección elegida tiene prioridad sobre los datos generales del perfil.
export function prepararEntrega(direccion, perfil) {
  return {
    campos: {
      nombre: direccion?.nombre || perfil?.name || '',
      telefono: String(direccion?.telefono || perfil?.phone || ''),
      ciudad: direccion?.ciudad || perfil?.city || '',
      direccion: direccion?.direccion || perfil?.address || '',
      notas: direccion?.indicaciones ?? perfil?.indicaciones ?? '',
    },
    etiqueta: direccion?.alias || direccion?.etiquetaDireccion || perfil?.etiquetaDireccion || 'Casa',
  };
}
