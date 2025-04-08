import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { eliminarServicioEnReservaPorServicioUID } from "../../../../../infraestructure/repository/reservas/servicios/eliminarServicioEnReservaPorServicioUID.mjs"
import { obtenerServicioEnReservaPorServicioUID } from "../../../../../infraestructure/repository/reservas/servicios/obtenerServicioEnReservaPorServicioUID.mjs"

import { actualizadorIntegradoDesdeInstantaneas } from "../../../../../shared/contenedorFinanciero/entidades/reserva/actualizadorIntegradoDesdeInstantaneas.mjs"
import { reversionDeMovimiento } from "../../../../../shared/inventario/reversionDeMovimiento.mjs"
import { sincronizarRegistros } from "../../../../../shared/reservas/detallesReserva/servicios/sincronizarRegistros.mjs"
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs"

export const eliminarServicioEnReserva = async (entrada) => {
    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })

        const servicioUID_enReserva = validadoresCompartidos.tipos.cadena({
            string: entrada.body.servicioUID_enReserva,
            nombreCampo: "El identificador universal de la servicio (servicioUID_enReserva)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })

        await campoDeTransaccion("iniciar")
        const servicioEnReserva = await obtenerServicioEnReservaPorServicioUID(servicioUID_enReserva)
        const reservaUID = servicioEnReserva.reservaUID
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoIDV
        if (estadoReserva === "cancelada") {
            const error = "La reserva está cancelada, es inmutable."
            throw new Error(error)
        }

        // const opcionesSel = servicioEnReserva.opcionesSel
        // for (const oS of Object.entries(opcionesSel)) {
        //     const contenedorGrupo = oS[1]
        //     for (const cG of contenedorGrupo) {
        //         const registroEnlazado = cG.registroEnlazado
        //         const registroUID = registroEnlazado.registroUID

        //         await reversionDeMovimiento({
        //             registroUID,
        //         })
        //     }
        // }

        await sincronizarRegistros({
            servicioExistenteAccesible: servicioEnReserva,
        })



        await eliminarServicioEnReservaPorServicioUID(servicioUID_enReserva)
        await actualizadorIntegradoDesdeInstantaneas(reservaUID)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha eliminado el servicio de la reserva"
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}