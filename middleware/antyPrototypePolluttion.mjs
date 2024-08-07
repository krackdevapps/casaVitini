export const antiPrototypePollutiion = (err, req, res, next) => {
    console.log("req.body", req.body)
    console.log("obejot", {}.__proto__)

    if (req.body && (req.body.__proto__ || req.body.prototype || req.body.constructor)) {
        return res.status(400).send('Formato JSON invalido');
    }
    next();
}