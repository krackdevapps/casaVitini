import { obtenerOferatPorOfertaUID } from "../../../../repositorio/ofertas/obtenerOfertaPorOfertaUID.mjs"
import { obtenerOfertasPorRangoPorEstado } from "../../../../repositorio/ofertas/perfiles/obtenerOfertasPorRangoPorEstado.mjs"
import { obtenerApartamentosDeLaReservaPorReservaUID } from "../../../../repositorio/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs"
import { obtenerReservaPorReservaUID } from "../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { obtenerDesgloseFinancieroPorReservaUID } from "../../../../repositorio/reservas/transacciones/obtenerDesgloseFinancieroPorReservaUID.mjs"
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs"
import { selectorPorCondicion } from "../../../../sistema/ofertas/entidades/reserva/selectorPorCondicion.mjs"
import { procesador } from "../../../../sistema/precios/procesador.mjs"
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs"

export const insertarDescuentoEnReserva = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        const reservaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const ofertaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.ofertaUID,
            nombreCampo: "El identificador universal de la oferta (ofertaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoIDV
        if (estadoReserva === "cancelada") {
            const error = "La reserva esta cancelada, no se puede alterar los descuentos"
            throw new Error(error)
        }

        await obtenerOferatPorOfertaUID(ofertaUID)
        const fechaEntradaReserva = reserva.fechaEntrada
        const fechaSalidaReserva = reserva.fechaSalida
        const fechaCreacion_simple = reserva.fechaCreacion_simple
        const apartamentosReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)
        const apartamentosArray = apartamentosReserva.map((detallesApartamento) => {
            return detallesApartamento.apartamentoIDV
        })

        const desgloseFinanciero = await procesador({
            entidades: {
                reserva: {
                    tipoOperacion: "actualizarDesglose",
                    reservaUID: reservaUID,
                    fechaEntrada: fechaEntradaReserva,
                    fechaSalida: fechaSalidaReserva,
                    fechaActual: fechaCreacion_simple,
                    apartamentosArray: apartamentosArray,
                    capaOfertas: "si",
                    zonasArray: ["global", "publica", "privada"],
                    descuentosParaRechazar: [],
                    capaDescuentosPersonalizados: "no",
                    descuentosArray: ["50", "50"]
                }
            },
            capaImpuestos: "no",
        })


        return desgloseFinanciero
        // const zonasArray = ["global", "publica", "privada"]
        // const ofertasSeleccionadasPorRango = await obtenerOfertasPorRangoPorEstado({
        //     fechaEntradaReserva_ISO: fechaEntradaReserva,
        //     fechaSalidaReserva_ISO: fechaSalidaReserva,
        //     estadoIDV: "activado",
        //     zonasArray,
        //     entidadIDV: "reserva"
        // })
        // const ofertaAnalizadasPorCondiciones = []
        // for (const oferta of ofertasSeleccionadasPorRango) {
        //     const resultadoSelector = await selectorPorCondicion({
        //         oferta,
        //         apartamentosArray,
        //         fechaActual_reserva: fechaCreacionReserva,
        //         fechaEntrada_reserva: fechaEntradaReserva,
        //         fechaSalida_reserva: fechaSalidaReserva,
        //     })
        //     resultadoSelector.autorizacion = "aceptada"
        //     ofertaAnalizadasPorCondiciones.push(resultadoSelector)
        // }

        // const desgloseFinanciero = await obtenerDesgloseFinancieroPorReservaUID(reservaUID)
        // const instantaneaOfertas = desgloseFinanciero.instantaneaOfertas.porCondicion
        // const ofertaUIDArray = Object.keys(instantaneaOfertas)
        // // const ofertaUIDArray = ["33"]

        // const ofertasCompatiblesNoSelecciondas = []
        // ofertaAnalizadasPorCondiciones.forEach((detallesOferta) => {
        //     const ofertaUID = String(detallesOferta.oferta.ofertaUID)
        //     if (!ofertaUIDArray.includes(ofertaUID)) {
        //         ofertasCompatiblesNoSelecciondas.push(detallesOferta)
        //     }
        // })
        // const ok = {
        //     ok: ofertasCompatiblesNoSelecciondas
        // }
        // return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}