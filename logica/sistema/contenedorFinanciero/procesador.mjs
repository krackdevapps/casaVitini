

import { estructuraDesgloseFinanciero } from "./estructuraDesgloseFinanciero.mjs"
import { procesadorSimulacion } from "./entidades/simulacion/procesadorSimulacion.mjs"
import { procesadorReserva } from "./entidades/reserva/procesadorReserva.mjs"

export const procesador = async (data) => {
    // El procesador, solo construye el objeto contenedor del desglose financiero y lo devuelve, luego para guardar el objeto usar otro contexto.
    try {
        const estructura = estructuraDesgloseFinanciero()
        const entidades = data?.entidades || {}
        if (!entidades) {
            const error = "El procesador de precios está mal configurado, debe tener definida la llave de entidades."
            throw new Error(error)
        }

        if (entidades.hasOwnProperty("reserva")) {
            const reserva = entidades.reserva
            await procesadorReserva({
                estructura,
                ...reserva
            })
        } else if (entidades.hasOwnProperty("simulacion")) {
            const simulacion = entidades.simulacion
            await procesadorSimulacion({
                estructura,
                ...simulacion
            })
        }else {
            const error = "El procesador de precios está mal configurado, necesita dentro de la llave de entidades un objeto con le nombre de la entidad."
            throw new Error(error)
        }

        return estructura
    } catch (error) {
        throw error
    }
}