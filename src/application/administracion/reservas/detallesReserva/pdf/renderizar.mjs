
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { detallesReserva } from "../../../../../shared/reservas/detallesReserva.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { esquemaGlobal } from "./contenedores/esquemaGlobal.mjs";
import Joi from "joi";
import { controlEstructuraPorJoi } from "../../../../../shared/validadores/controlEstructuraPorJoi.mjs";

export const renderizar = async (entrada, salida) => {
    try {


        const commonMessages = validadoresCompartidos.herramientasExternas.joi.mensajesErrorPersonalizados
        const servicioSchema = Joi.object({
            incluirTotales: Joi.string().custom((value, helpers) => {
                try {
                    return validadoresCompartidos.tipos.cadena({
                        string: value,
                        nombreCampo: "El identificador servicioUID en configuracionPorTabla",
                        filtro: "strictoIDV",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si"
                    })
                } catch (error) {
                    const path = helpers.state.path.join('.');
                    const mensajeError = `Error en ${path}: ${error.message}`;
                    return helpers.message(mensajeError);
                }
            }).required(),
            contenedorUID: Joi.array().items(
                Joi.string().custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: "Se esperaba una cadena",
                            filtro: "cadenaConNumerosEnteros",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si",
                            devuelveUnTipoNumber: "no",
                            devuelveUnTipoBigInt: "no"
                        })

                    } catch (error) {
                        const path = helpers.state.path.join('.');
                        const mensajeError = `Error en ${path}: ${error.message}`;
                        return helpers.message(mensajeError);
                    }
                }).required()
            ).optional()
        }).required()


        const esquemaBusqueda = Joi.object({
            reservaUID: Joi.string().custom((value, helpers) => {
                try {
                    return validadoresCompartidos.tipos.cadena({
                        string: value,
                        nombreCampo: "El identificador universal de la reserva (reservaUID)",
                        filtro: "cadenaConNumerosEnteros",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si",
                        devuelveUnTipoNumber: "no",
                        devuelveUnTipoBigInt: "no"
                    })
                } catch (error) {
                    const path = helpers.state.path.join('.');
                    const mensajeError = `Error en ${path}: ${error.message}`;
                    return helpers.message(mensajeError);
                }
            }).messages(commonMessages),
            incluirTitular: Joi.string().custom((value, helpers) => {
                try {
                    return validadoresCompartidos.tipos.cadena({
                        string: value,
                        nombreCampo: "Especifica si se incluye o no el titular con incluirTItular con un si o un no",
                        filtro: "strictoIDV",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si"
                    })
                } catch (error) {
                    const path = helpers.state.path.join('.');
                    const mensajeError = `Error en ${path}: ${error.message}`;
                    return helpers.message(mensajeError);
                }
            }
            ).required().messages(commonMessages),
            tablasIDV: Joi.array().items(
                Joi.string().custom((value, helpers) => {
                    try {
                        const t = validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: "El identificador de tablas es necesario que sea una cadena",
                            filtro: "strictoIDV",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si",
                        })
                        const contenedoresID_val = [
                            "fechas",
                            "alojamiento",
                            "servicios",
                            "impuestos",
                            "totalesGlobales",
                            "pagos",
                        ]
                        if (!contenedoresID_val.includes(t)) {
                            const mensaje = `No se reconoce el tablasIDV`
                            throw new Error(mensaje)
                        }
                        return t
                    } catch (error) {
                        const path = helpers.state.path.join('.');
                        const mensajeError = `Error en ${path}: ${error.message}`;
                        return helpers.message(mensajeError);
                    }
                })).required().messages(commonMessages),
            tipoIDV: Joi.string().custom((value, helpers) => {
                try {
                    const tipoIDV = validadoresCompartidos.tipos.cadena({
                        string: value,
                        nombreCampo: "El identificador tipoIDV es necesario para saber que tipo de dato en que presentar el PDF",
                        filtro: "strictoIDV",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si",
                    })
                    const val = [
                        "buffer",
                        "base64"
                    ]
                    if (!val.includes(tipoIDV)) {
                        const mensaje = `No se reconoce el modetipoIDV solo pede ser buffer o base64`
                        throw new Error(mensaje)
                    }
                    return tipoIDV
                } catch (error) {
                    const path = helpers.state.path.join('.');
                    const mensajeError = `Error en ${path}: ${error.message}`;
                    return helpers.message(mensajeError);
                }
            }).required().messages(commonMessages),
            configuracionPorTabla: Joi.object().pattern(
                Joi.string().custom((value, helpers) => {
                    try {
                        const val = [
                            "servicios",
                            "pagos"
                        ]
                        if (!val.includes(value)) {
                            const mensaje = `En configuracionPorTabla, solo se espera la llave servicios o pagos`
                            throw new Error(mensaje)

                        }
                        return value
                    } catch (error) {
                        const path = helpers.state.path.join('.');
                        const mensajeError = `Error en ${path}: ${error.message}`;
                        return helpers.message(mensajeError);
                    }
                }).optional(),
                servicioSchema
            ).optional()
        }).required().messages(commonMessages)

        const v = controlEstructuraPorJoi({
            schema: esquemaBusqueda,
            objeto: entrada.body
        })
        const reservaUID = v.reservaUID
        const incluirTitular = v.incluirTitular
        const tipoIDV = v.tipoIDV
        const tablasIDV = v.tablasIDV
        const configuracionPorTabla = v.configuracionPorTabla


        await obtenerReservaPorReservaUID(reservaUID)
        const reserva = await detallesReserva({
            reservaUID: reservaUID,
            capas: [
                "titular",
                "alojamiento",
                "desgloseFinanciero",
                "detallesPagos"
            ]
        })
        const ok = {
            ok: "Aquí está el pdf en base64"
        }
        ok.pdf = await esquemaGlobal({
            incluirTitular,
            reserva,
            tablasIDV,
            configuracionPorTabla
        });


        if (tipoIDV === "base64") {
            return ok
        } else if (tipoIDV === "buffer") {
            const pdfBuffer = Buffer.from(ok.pdf, 'base64');
            salida.setHeader('Content-Type', 'application/pdf');
            salida.setHeader('Content-Disposition', 'inline; filename="archivo.pdf"');
            salida.send(pdfBuffer);
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}