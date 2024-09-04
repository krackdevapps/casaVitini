

import { estructuraDesgloseFinanciero } from "./estructuraDesgloseFinanciero.mjs"
import { procesadorSimulacion } from "./entidades/simulacion/procesadorSimulacion.mjs"
import { procesadorReserva } from "./entidades/reserva/procesadorReserva.mjs"
import { procesadorServicios } from "./entidades/servicios/procesadorServicios.mjs"
import { aplicarImpuestos } from "./entidades/reserva/aplicarImpuestos.mjs"
import { aplicarOfertas } from "./ofertas/aplicarOfertas.mjs"
import { sumarTotales } from "./global/sumarTotales.mjs"

export const procesador = async (data) => {
    try {
        const estructura = estructuraDesgloseFinanciero()
        const entidades = data?.entidades || {}
        const capas = data?.capas || []
        const pipe = {}
        let controlError = true
        if (!entidades) {
            const error = "El procesador de precios está mal configurado, debe tener definida la llave de entidades."
            throw new Error(error)
        }

        if (entidades.hasOwnProperty("reserva")) {
            controlError = false
            const reserva = entidades.reserva
            await procesadorReserva({
                estructura,
                ...reserva,
                pipe
            })
        }
        // Refactorizar
        if (entidades.hasOwnProperty("simulacion")) {
            controlError = false
            const simulacion = entidades.simulacion
            await procesadorSimulacion({
                estructura,
                ...simulacion,
                pipe
            })
        }

        if (entidades.hasOwnProperty("servicios")) {
            controlError = false
            const servicios = entidades.servicios

            await procesadorServicios({
                estructura,
                ...servicios,
                pipe
            })
        }

        if (controlError) {
            const error = "El procesador de precios está mal configurado, necesita dentro de la llave de entidades un objeto con le nombre de la entidad."
            throw new Error(error)
        }

        await aplicarOfertas({
            estructura,
            zonasArray: capas.ofertas?.zonasArray,
            configuracion: capas.ofertas?.configuracion,
            operacion: capas.ofertas?.operacion,
            ofertaUID: capas.ofertas?.ofertaUID,
            pipe
            //descuentosArray: capas.ofertas.descuentosArray
        })
        await aplicarImpuestos({
            estructura,
            origen: capas.impuestos.origen,
            reservaUID: capas.impuestos.reservaUID,

        })
        sumarTotales({
            estructura,
        })
        return estructura
    } catch (error) {
        throw error
    }
}