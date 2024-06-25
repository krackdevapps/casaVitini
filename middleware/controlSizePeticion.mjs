export const controlSizePeticion = (err, req, res, next) => {
  if (err.status === 413) {
    res.status(413).json({
      error: 'El tamaño de la solicitud correcatamente formateada excese los 50MB'
    });
  } else {
    next()
  }
};
