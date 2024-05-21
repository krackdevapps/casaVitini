export const controlSizePeticion = (err, entrada, salida, next) => {
  if (err instanceof SyntaxError && err.status === 413 && 'body' in err) {
    salida.status(413).json({ error: 'Solicitud demasiado grande, Casa Vitini solo acepta peticiones de un maximo de 50MB' });
  }
}