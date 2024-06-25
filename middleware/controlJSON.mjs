export const controlJSON = (err, req, res, next) => {
  try {
    console.log("req", req.body)
    JSON.parse(req.body); 
    next();
  } catch (error) {
    res.status(400).json({ "CasaVitini": 'Formato JSON inválido' });
  }
  next()
}