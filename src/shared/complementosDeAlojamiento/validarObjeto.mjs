import Joi from "joi"
import { controlEstructuraPorJoi } from "../validadores/controlEstructuraPorJoi.mjs"
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs"

export const validarObjeto = async (data) => {
    try {

        const o = data.o
        const modo = data.modo

        const commonMessages = validadoresCompartidos.herramientasExternas.joi.mensajesErrorPersonalizados

        let schema = Joi.object({
            apartamentoIDV: Joi.string().required().custom((value, helpers) => {
                try {
                    return validadoresCompartidos.tipos.cadena({
                        string: value,
                        nombreCampo: "El apartamentoIDV",
                        filtro: "strictoIDV",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si",
                    })
                } catch (error) {
                    const path = helpers.state.path.join('.');
                    const mensajeError = `Error en ${path}: ${error.message}`;
                    return helpers.message(mensajeError);
                }
            }),
            complementoUI: Joi.string().required().custom((value, helpers) => {
                try {

                    return validadoresCompartidos.tipos.cadena({
                        string: value,
                        nombreCampo: "El nombre",
                        filtro: "strictoConEspacios",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si",
                        limpiezaEspaciosInternos: "no",
                    })
                } catch (error) {
                    const path = helpers.state.path.join('.');
                    const mensajeError = `Error en ${path}: ${error.message}`;
                    return helpers.message(mensajeError);
                }
            }),
            definicion: Joi.string().allow('').custom((value, helpers) => {
                try {
                    return validadoresCompartidos.tipos.cadena({
                        string: value,
                        nombreCampo: "El definicion",
                        filtro: "cadenaBase64",
                        sePermiteVacio: "si",
                        limpiezaEspaciosAlrededor: "si",
                        limpiezaEspaciosInternos: "si",
                    })

                } catch (error) {
                    const path = helpers.state.path.join('.');
                    const mensajeError = `Error en ${path}: ${error.message}`;
                    return helpers.message(mensajeError);
                }
            }),
            tipoPrecio: Joi.string().required().custom((value, helpers) => {
                try {

                    const tipoPrecio = validadoresCompartidos.tipos.cadena({
                        string: value,
                        nombreCampo: "El campo de tipoPrecio",
                        filtro: "strictoIDV",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si",
                    })


                    const tiposPrecio = [
                        "fijoPorReserva",
                        "porNoche"
                    ]
                    if (!tiposPrecio.includes(tipoPrecio)) {
                        const m = "El selector de tipoPrecio solo fijoPorReserva o porNoche"
                        throw new Error(m)
                    }

                    return tipoPrecio
                } catch (error) {
                    const path = helpers.state.path.join('.');
                    const mensajeError = `Error en ${path}: ${error.message}`;
                    return helpers.message(mensajeError);
                }
            }),
            precio: Joi.string().required().custom((value, helpers) => {
                try {
                    return validadoresCompartidos.tipos.cadena({
                        string: value,
                        nombreCampo: "El campo de precio",
                        filtro: "cadenaConNumerosConDosDecimales",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si",
                        devuelveUnTipoNumber: "no",
                        impedirCero: "no"
                    })

                } catch (error) {
                    const path = helpers.state.path.join('.');
                    const mensajeError = `Error en ${path}: ${error.message}`;
                    return helpers.message(mensajeError);
                }
            }),
            tipoUbicacion: Joi.string().required().custom((value, helpers) => {
                try {
                    const tipoUbicacion = validadoresCompartidos.tipos.cadena({
                        string: value,
                        nombreCampo: "El campo de tipoUbicacion",
                        filtro: "strictoIDV",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si",
                    })

                    const tiposUbicaciones = [
                        "alojamiento",
                        "habitacion"
                    ]
                    if (!tiposUbicaciones.includes(tipoUbicacion)) {
                        const m = "El selector de ubiacion del complemento solo acepta alojamiento o habitación"
                        throw new Error(m)
                    }
                    return tipoUbicacion

                } catch (error) {
                    const path = helpers.state.path.join('.');
                    const mensajeError = `Error en ${path}: ${error.message}`;
                    return helpers.message(mensajeError);
                }
            }),
            habitacion: Joi.string().custom((value, helpers) => {
                try {
                    return validadoresCompartidos.tipos.cadena({
                        string: value,
                        nombreCampo: "El campo de habitacion",
                        filtro: "cadenaConNumerosEnteros",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si",
                        devuelveUnTipoNumber: "no",
                        impedirCero: "no"
                    })
                } catch (error) {
                    const path = helpers.state.path.join('.');
                    const mensajeError = `Error en ${path}: ${error.message}`;
                    return helpers.message(mensajeError);
                }
            }).when('tipoUbicacion', {
                is: 'habitacion',
                then: Joi.required(),
                otherwise: Joi.optional()
            })
        }).required().messages(commonMessages)

        const modos = [
            "actualizar",
            "crear"
        ]
        if (!modos.includes(modo)) {
            throw new Error("El validador de complementos de alojamiento tiene el modo mal configurado")

        }


        if (modo === "actualizar") {

            schema = schema.keys({
                complementoUID: Joi.string().required().custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: "El complementoUID",
                            filtro: "cadenaConNumerosEnteros",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si",
                            limpiezaEspaciosInternos: "si",
                            devuelveUnTipoNumber: "no",
                            devuelveUnTipoBigInt: "no"
                        })
                    } catch (error) {
                        const path = helpers.state.path.join('.');
                        const mensajeError = `Error en ${path}: ${error.message}`;
                        return helpers.message(mensajeError);
                    }
                })
            })
        }

        const oV = controlEstructuraPorJoi({
            schema: schema,
            objeto: o
        })
        return oV
    } catch (error) {
        throw error
    }
}