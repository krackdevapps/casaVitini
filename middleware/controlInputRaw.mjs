const MAX_TAMANO_SOLICITUD = 50 * 1024 * 1024; // 50MB en bytes
export const controlInputRaw = (req, res, next) => {

  let tamanoSolicitud = 0;
  let cuerpoDatos = [];
  req.on('data', (chunk) => {
    tamanoSolicitud += chunk.length;
    cuerpoDatos.push(chunk);


    if (tamanoSolicitud > MAX_TAMANO_SOLICITUD) {

      res.status(413).json({ error: `Solicitud demasiado grande, máximo 50MB y ha enviado ${tamanoSolicitud} bytes` });
      req.destroy(); // Terminar la solicitud para evitar más procesamiento
    }
  });

  req.on('end', () => {

    if (cuerpoDatos.length > 0) {

      req.body = Buffer.concat(cuerpoDatos).toString()
    }
    next();
  });

  req.on('error', (err) => {
    console.error('Error al procesar la solicitud:', err);
    res.status(500).json({ error: 'Error interno al procesar la solicitud' });
  });

}