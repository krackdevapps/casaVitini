export const antiPrototypePollution = (req, res, next) => {
    const obj = req.body
    let toogleSec = false
    const eliminarPropiedadesPrototipo = (o) => {
        const propiedadesPrototipo = ['__proto__', 'prototype', 'constructor'];
        for (const clave in o) {
            if (o.hasOwnProperty(clave)) {
                if (typeof o[clave] === 'object' && o[clave] !== null) {
                    eliminarPropiedadesPrototipo(o[clave]);
                }
            } else {
                delete o[clave];
            }
            if (propiedadesPrototipo.includes(clave)) {
                delete o[clave];
                toogleSec = true

            }
        }
    }
    eliminarPropiedadesPrototipo(obj);
    if (toogleSec) {
        res.status(400).json({
            secAlert: "Prototype poluttion detected"
        })
    } else {
        next();
    }
}