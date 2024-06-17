
import { aplicarImpuestos } from "./aplicarImpuestos.mjs"
import { estructuraDesgloseFinanciero } from "./estructuraDesgloseFinanciero.mjs"
import { procesadorReserva } from "./entidades/reserva/procesadorReserva.mjs"

export const procesador = async (data) => {
    try {

        const capaImpuestos = data?.capaImpuestos
        const estructura = estructuraDesgloseFinanciero()
        const entidades = data?.entidades
        if (!entidades) {
            const error = "El procesador de precios esta mal configurado, tener definida la llave entidades."
            throw new Error(error)
        }

        if (capaImpuestos !== "si" && capaImpuestos !== "no") {
            const error = "El procesador de precios esta mal configurado, necesita parametro capaImpuestos"
            throw new Error(error)
        }

        if (entidades.hasOwnProperty("reserva")) {
            const reserva = entidades.reserva
            await procesadorReserva({
                estructura,
                ...reserva
            })
        } else {
            const error = "El procesador de precios esta mal configurado, necesita dentro de la llave entidades un objeto con le nombre de la entidad."
            throw new Error(error)
        }
        if (capaImpuestos === "si") {
            await aplicarImpuestos(estructura)
        }
        return estructura
    } catch (error) {
        throw error
    }
}