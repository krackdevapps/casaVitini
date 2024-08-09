const MAX_SIZE = 50 * 1024 * 1024;
export const controlSizePeticion = (req, res, next) => {
  const contentLength = req.headers['content-length'];

  if (contentLength && parseInt(contentLength) > MAX_SIZE) {

    res.status(413).send('Solicitud demasiado grande, máximo 50MB');
  } else {
    next();
  }
};
