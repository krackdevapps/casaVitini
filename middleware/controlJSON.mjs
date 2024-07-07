export const controlJSON = (err, req, res, next) => {
  try {
    const json = JSON.parse(req.body);
    console.log("json", json);
    next();
  } catch (error) {
    console.log("error", error);
    const errorMensaje = {
      error: "Formato JSON invalido"
    }
    res.status(400).json(errorMensaje);
  }
}
