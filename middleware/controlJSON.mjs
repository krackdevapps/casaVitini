export const controlJSON = (err, req, res, next) => {
  try {


    JSON.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ "CasaVitini": 'Formato JSON inválido' });
  }
  next()
}