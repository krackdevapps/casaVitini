import { campoDeTransaccion } from "../../../../repositorio/globales/campoDeTransaccion.mjs"
import { obtenerOferatPorOfertaUID } from "../../../../repositorio/ofertas/obtenerOfertaPorOfertaUID.mjs"
import { obtenerOfertasPorRangoPorEstado } from "../../../../repositorio/ofertas/perfiles/obtenerOfertasPorRangoPorEstado.mjs"
import { obtenerApartamentosDeLaReservaPorReservaUID } from "../../../../repositorio/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs"
import { obtenerReservaPorReservaUID } from "../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { obtenerDesgloseFinancieroPorReservaUID } from "../../../../repositorio/reservas/transacciones/obtenerDesgloseFinancieroPorReservaUID.mjs"
import { actualizarDesgloseFinacieroPorReservaUID } from "../../../../repositorio/reservas/transacciones/totales/actualizarDesgloseFinacieroPorReservaUID.mjs"
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
                    ofertaUID: ofertaUID,
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
        await campoDeTransaccion("iniciar")        
        await actualizarDesgloseFinacieroPorReservaUID({
            desgloseFinanciero,
            reservaUID
        })
        await campoDeTransaccion("confirmar")        
        const ok = {
            ok: "Se ha actualizado el conenedorFinanciero",
            contenedorFinanciero: desgloseFinanciero
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")        
        throw errorCapturado
    }
}