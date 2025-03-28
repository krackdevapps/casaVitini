import { DateTime } from "luxon"
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs"
import { codigoZonaHoraria } from "../../../configuracion/codigoZonaHoraria.mjs"
import { controlEstructuraPorJoi } from "../../../validadores/controlEstructuraPorJoi.mjs"
import Joi from "joi"

export const validarDataGlobalSimulacion = async (data) => {
    try {
        const commonMessages = validadoresCompartidos.herramientasExternas.joi.mensajesErrorPersonalizados

        const esquemaBusqueda = Joi.object({
            simulacionUID: Joi.string().custom((value, helpers) => {
                try {
                    return validadoresCompartidos.tipos.cadena({
                        string: value,
                        nombreCampo: "El simulacionUID",
                        filtro: "cadenaConNumerosEnteros",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si",
                        devuelveUnTipoNumber: "no",
                        devuelveUnTipoBigInt: "si"
                    })

                } catch (error) {
                    const path = helpers.state.path.join('.');
                    const mensajeError = `Error en ${path}: ${error.message}`;
                    return helpers.message(mensajeError);
                }
            }).required().messages(commonMessages),
            fechaCreacion: Joi.string().optional().messages(commonMessages),
            fechaEntrada: Joi.string().optional().messages(commonMessages),
            fechaSalida: Joi.string().optional().messages(commonMessages),
            zonaIDV: Joi.string().custom((value, helpers) => {
                try {
                    const zonasIDV = ["global", "privada", "publica"]
                    if (!zonasIDV.includes(value)
                    ) {
                        const m = "zonaIDV solo espera global, privada o publica"
                        throw new Error(m)
                    }
                    return value
                } catch (error) {
                    const path = helpers.state.path.join('.');
                    const mensajeError = `Error en ${path}: ${error.message}`;
                    return helpers.message(mensajeError);
                }
            }).optional().messages(commonMessages),
        }).required().messages(commonMessages)

        const objectoValidado = controlEstructuraPorJoi({
            schema: esquemaBusqueda,
            objeto: data
        })

        const validaFecha = async (data) => {
            const dataFecha = data.dataFecha
            const nombreCampo = data.nombreCampo

            return await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: dataFecha,
                nombreCampo: nombreCampo
            })
        }

        const fechaCreacionVal = objectoValidado?.fechaCreacion
        if (fechaCreacionVal) {
            await validaFecha({
                dataFecha: fechaCreacionVal,
                nombreCampo: "El cammpo de fecha de creación"
            })
    
        }
    

        const fechaEntradaVal = objectoValidado?.fechaEntrada
        if (fechaEntradaVal) {
            await validaFecha({
                dataFecha: fechaEntradaVal,
                nombreCampo: "El cammpo de fecha de entrad"
            })
       
        }
   

        const fechaSalidaVal = objectoValidado.fechaSalida
        if (fechaSalidaVal) {
            await validaFecha({
                dataFecha: fechaSalidaVal,
                nombreCampo: "El cammpo de fecha de salida"
            })
    
        }

        const simulacionUID = objectoValidado.simulacionUID
        const simulacion = await obtenerSimulacionPorSimulacionUID(simulacionUID)

        const fechaCreacion = objectoValidado?.fechaCreacion || simulacion.fechaCreacion
        const fechaEntrada = objectoValidado?.fechaEntrada || simulacion.fechaEntrada
        const fechaSalida = objectoValidado?.fechaSalida || simulacion.fechaSalida
        if (fechaEntrada && fechaSalida) {
            await validadoresCompartidos.fechas.validacionVectorial({
                fechaEntrada: fechaEntrada,
                fechaSalida: fechaSalida,
                tipoVector: "diferente"
            })
        }
        if (fechaEntrada && fechaCreacion) {
            const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
            const fechaEntrada_objeto = DateTime.fromISO(fechaEntrada, { zone: zonaHoraria });
            const fechaCreacion_objeto = DateTime.fromISO(fechaCreacion, { zone: zonaHoraria });

            if (fechaEntrada_objeto < fechaCreacion_objeto) {
                const error = "La fecha de creación simulada no puede ser superior a la fecha de entrada simulada.";
                throw new Error(error);
            }
        }
        return objectoValidado
    } catch (error) {
        throw error
    }
}