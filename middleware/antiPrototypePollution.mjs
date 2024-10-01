export const antiPrototypePollution = (req, res, next) => {
    const obj = req.body;
    let toggleSec = false;

    const eliminarPropiedadesPrototipo = (o) => {
        const propiedadesPrototipo = ['__proto__', 'prototype', 'constructor'];
        for (const clave in o) {
            if (o.hasOwnProperty(clave)) {
                if (propiedadesPrototipo.includes(clave)) {
                    delete o[clave];
                    toggleSec = true;
                } else if (typeof o[clave] === 'object' && o[clave] !== null) {
                    eliminarPropiedadesPrototipo(o[clave]);
                }
            }
        }
    };
    eliminarPropiedadesPrototipo(obj);
    if (toggleSec) {
        const secAlert = {
            code: "prototypePollution",
            dataReq: req
        }
        console.error("secAlert", secAlert)
        return res.status(400).json({
            error: "Formato JSON inválido",
            details: "0"
        });
    } else {
        next();
    }
}
