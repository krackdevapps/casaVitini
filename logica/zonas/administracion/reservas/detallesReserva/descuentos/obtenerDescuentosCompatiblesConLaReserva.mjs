import { campoDeTransaccion } from "../../../../../repositorio/globales/campoDeTransaccion.mjs"
import { obtenerApartamentosDeLaReservaPorReservaUID } from "../../../../../repositorio/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs"
import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs"
import { selecionarOfertasPorCondicion } from "../../../../../sistema/ofertas/entidades/reserva/selecionarOfertasPorCondicion.mjs"
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs"

export const obtenerDescuentosCompatiblesConLaReserva = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoIDV
        if (estadoReserva === "cancelada") {
            const error = "La reserva esta cancelada, no se puede alterar los descuentos"
            throw new Error(error)
        }

        const fechaEntradaReserva = reserva.fechaEntrada
        const fechaSalidaReserva = reserva.fechaSalida
        const fechaCreacion_simple = reserva.fechaCreacion_simple
        const apartamentosReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)
        const apartamentosArray = apartamentosReserva.map((detallesApartamento) => {
            return detallesApartamento.apartamentoIDV
        })
        const zonasArray = ["global", "privada"]
        const ofertasSelecionadasPorCondicion = await selecionarOfertasPorCondicion({
            fechaActual: fechaCreacion_simple,
            fechaEntrada: fechaEntradaReserva,
            fechaSalida: fechaSalidaReserva,
            apartamentosArray,
            zonasArray
        })

        const ok = {
            ok: "Ofertas compatibles con la reserva",
            ofertasCompatibles: ofertasSelecionadasPorCondicion
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}