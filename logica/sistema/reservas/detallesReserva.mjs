import { obtenerReservaPorReservaUID } from "../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { detallesAlojamiento } from "./detallesReserva/detallesAlojamiento.mjs"
import { detallesTitular } from "./detallesReserva/detallesTitular.mjs"
import { pernoctantesDeLaReserva } from "./detallesReserva/pernoctantesDeLaReserva.mjs"
import { utilidades } from "../../componentes/utilidades.mjs"
import { obtenerDesgloseFinancieroPorReservaUID } from "../../repositorio/reservas/transacciones/desgloseFinanciero/obtenerDesgloseFinancieroPorReservaUID.mjs"
import { porcentajeTranscurrido } from "./utilidades/porcentajeTranscurrido.mjs"
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs"
import { detallesPagos } from "./detallesReserva/detallesPagos.mjs"
import { insertarApartamentoUIEnObjetoOfertas } from "../ofertas/entidades/reserva/insertarApartamentoUIEnObjetoOfertas.mjs"
import { enlacesDePagoDeLaReserva } from "./detallesReserva/enlacesDePagoDeLaReserva.mjs"
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
            "desgloseFinanciero",
            "detallesPagos",
            "enlacesDePago"
        ]
        validadoresCompartidos.tipos.array({
            array: capas,
            nombreCampo: "El array capas en detallesReserva",
            filtro: "strictoIDV"
        })
        
        const capasNoIdentificadas = capas.filter(capaIDV => !contenedorCapas.includes(capaIDV));
        if (capasNoIdentificadas.length > 0) {
            const constructoCapasNoConocidas = utilidades.constructorComasEY({
                array: capasNoIdentificadas,
                articulo: "la"
            })
            const constructoCapasConocidas = utilidades.constructorComasEY({
                array: contenedorCapas,
                articulo: ""
            })
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
        if (capas.includes(contenedorCapas[1])) {
            reserva.alojamiento = await detallesAlojamiento(reservaUID)
        }
        if (capas.includes(contenedorCapas[2])) {
            reserva.pernoctantes = await pernoctantesDeLaReserva(reservaUID)
        }
        if (capas.includes(contenedorCapas[3])) {
            reserva.contenedorFinanciero = await obtenerDesgloseFinancieroPorReservaUID(reservaUID)
            const contenedorOfertasPorAdmimnistrador = reserva.contenedorFinanciero.desgloseFinanciero.contenedorOfertas.entidades.reserva.ofertas.porAdministrador
            for (const contenedorOferta of contenedorOfertasPorAdmimnistrador) {
                await insertarApartamentoUIEnObjetoOfertas(contenedorOferta.oferta)
            }
        }
        if (capas.includes(contenedorCapas[4])) {
            reserva.detallesPagos = await detallesPagos(reservaUID)
        }
        if (capas.includes(contenedorCapas[5])) {
        reserva.enlacesDePago = await enlacesDePagoDeLaReserva(reservaUID)
        }
        return reserva
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
