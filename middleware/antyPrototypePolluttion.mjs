export const antiPrototypePollutiion = (err, req, res, next) => {



    if (req.body && (req.body.__proto__ || req.body.prototype || req.body.constructor)) {
        return res.status(400).send('Formato JSON invalido');
    }
    next();
}