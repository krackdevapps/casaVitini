import { obtenerComplementoPorComplementoUID } from "../../../../../infraestructure/repository/complementosDeAlojamiento/obtenerComplementoPorComplementoUID.mjs"
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { obtenerApartamentosDeLaReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs"
import { insertarComplementoAlojamientoPorReservaUID } from "../../../../../infraestructure/repository/reservas/complementosAlojamiento/insertarComplementoAlojamientoPorReservaUID.mjs"
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs"
import { actualizadorIntegradoDesdeInstantaneas } from "../../../../../shared/contenedorFinanciero/entidades/reserva/actualizadorIntegradoDesdeInstantaneas.mjs"
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs"

export const insertarComplementoAlojamientoEnReserva = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })

        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const complementoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.complementoUID,
            nombreCampo: "El identificador universal del complementoUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoIDV
        if (estadoReserva === "cancelada") {
            const error = "La reserva está cancelada, es inmutable."
            throw new Error(error)
        }

        const complemento = await obtenerComplementoPorComplementoUID(complementoUID)
        const complementoUI = complemento.complementoUI
        const apartamentoIDV = complemento.apartamentoIDV
        const definicion = complemento.definicion
        const tipoPrecio = complemento.tipoPrecio
        const precio = complemento.precio
        const estadoIDV = complemento.estadoIDV
        if (estadoIDV === "desactivado") {
            const m = `El complemento de alojamiento ${complementoUI} esta desactivado. Activalo primero para poder insertarlo en la reserva.`
            throw new Error(m)
            
        }

        const apartamentosReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)
        const controlApartamento = apartamentosReserva.filter(a => a.apartamentoIDV === apartamentoIDV)

        if (!controlApartamento) {
            const m = `El complemento de alojamiento ${complementoUI} con UID ${complementoUID} tiene el alojamiento IDV asignado ${apartamentoIDV}, pero este no esta en la reserva ${reservaUID}. Añade el alojamiento primero.`
            throw new Error(m)
        }
        const apartamentoUID = controlApartamento[0].componenteUID

        // Necesicamos el apartmentoUID dentro de la reserva para la relacion
        await campoDeTransaccion("iniciar")
        const complementoDeAlojamiento = await insertarComplementoAlojamientoPorReservaUID({
            reservaUID,
            complementoUI,
            apartamentoIDV,
            definicion,
            tipoPrecio,
            precio,
            apartamentoUID
        })

        await actualizadorIntegradoDesdeInstantaneas(reservaUID)

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha insertado el complemento de alojamiento correctamente y el contenedor financiero se ha renderizado.",
            complementoDeAlojamiento
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}