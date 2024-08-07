export const controlJSON = (err, req, res, next) => {
  try {
 JSON.parse(req.body);
    next();
  } catch (error) {
    const errorMensaje = {
      error: "Formato JSON invalido"
    }
    res.status(400).json(errorMensaje);
  }
}
