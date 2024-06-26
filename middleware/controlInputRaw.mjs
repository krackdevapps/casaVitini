const MAX_TAMANO_SOLICITUD = 50 * 1024 * 1024; // 50MB en bytes
export const controlInputRaw = (req, res, next) => {

  let tamanoSolicitud = 0;
  let cuerpoDatos = [];
  req.on('data', (chunk) => {
    tamanoSolicitud += chunk.length;
    cuerpoDatos.push(chunk);

    // Validar el tamaño máximo permitido
    if (tamanoSolicitud > MAX_TAMANO_SOLICITUD) {
      // Si el tamaño excede el límite, responde con un error 413 y termina la solicitud
      res.status(413).json({ error: `Solicitud demasiado grande, máximo 50MB y ha enviado ${tamanoSolicitud} bytes` });
      req.destroy(); // Terminar la solicitud para evitar más procesamiento
    }
  });

  req.on('end', () => {
    // Reconstruir el cuerpo de la solicitud en formato Buffer
    if (cuerpoDatos.length > 0) {
      console.log("antes",typeof req, req)
      req.body = Buffer.concat(cuerpoDatos).toString()
    }
    next();
  });

  req.on('error', (err) => {
    console.error('Error al procesar la solicitud:', err);
    res.status(500).json({ error: 'Error interno al procesar la solicitud' });
  });

}