import { obtenerReservaPorReservaUID } from "../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { detallesAlojamiento } from "./detallesReserva/detallesAlojamiento.mjs"
import { detallesTitular } from "./detallesReserva/detallesTitular.mjs"
import { pernoctantesDeLaReserva } from "./detallesReserva/pernoctantesDeLaReserva.mjs"
import { utilidades } from "../../componentes/utilidades.mjs"
import { obtenerDesgloseFinancieroPorReservaUID } from "../../repositorio/reservas/transacciones/desgloseFinanciero/obtenerDesgloseFinancieroPorReservaUID.mjs"
import { porcentajeTranscurrido } from "./utilidades/porcentajeTranscurrido.mjs"
export const detallesReserva = async (data) => {
    try {
        const capas = data.capas
        const reservaUID = data.reservaUID

        const reserva = {
            global: await obtenerReservaPorReservaUID(reservaUID)
        }
        reserva.global.porcentajeTranscurrido = await porcentajeTranscurrido(reservaUID)
        const contenedorCapas = [
            "titular",
            "alojamiento",
            "pernoctantes",
            "desgloseFinanciero"
        ]

        const capasNoIdentificadas = capas.filter(capaIDV => !contenedorCapas.includes(capaIDV));
        if (capasNoIdentificadas.length > 0) {
            const constructoCapasNoConocidas = utilidades.contructorComasEY(capasNoIdentificadas)
            const constructoCapasConocidas = utilidades.contructorComasEY(contenedorCapas)
            const capasConocidasUI = `Las capas disponibles son ${constructoCapasConocidas}`
            let error
            if (capasNoIdentificadas.length === 1) {
                error = `No se reconoce la capa ${constructoCapasNoConocidas}. ${capasConocidasUI}`
            } else {
                error = `No se reconocem las capas ${constructoCapasNoConocidas}. ${capasConocidasUI}`
            }
            throw new Error(error)
        }
        if (capas.includes(contenedorCapas[0])) {
            reserva.titular = await detallesTitular(reservaUID)
        }
        // 
        // if (capas.includes(contenedorCapas[1])) {
        //     reserva.clientes = await clientesReserva({
        //         reservaUID: reservaUID,
        //        // habitacionUID: habitacionUID
        //     })
        // }
        // 

        // if (capas.includes(contenedorCapas[2])) {
        //     reserva.pernoctantesSinHabitacion = await recuperarClientesSinHabitacionAsignada(reservaUID)
        // }
        if (capas.includes(contenedorCapas[1])) {
            reserva.alojamiento = await detallesAlojamiento(reservaUID)
        }
        if (capas.includes(contenedorCapas[2])) {
            reserva.pernoctantes = await pernoctantesDeLaReserva(reservaUID)
        }
        if (capas.includes(contenedorCapas[3])) {
            reserva.contenedorFinanciero = await obtenerDesgloseFinancieroPorReservaUID(reservaUID)
        }
        return reserva
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
