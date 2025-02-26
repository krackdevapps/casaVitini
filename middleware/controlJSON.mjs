export const controlJSON = (err, req, res, next) => {
  try {
    JSON.parse(req.body);

    next();
  } catch (error) {
  
    res.status(400).json({
      error: "Formato JSON invalido"
    });
  }
}
