import { obtenerHabitacionDelApartamentoPorHabitacionUID } from "../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerHabitacionDelApartamentoPorHabitacionUID.mjs"
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../../../../../infraestructure/repository/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs"
import { obtenerComplementoPorComplementoUID } from "../../../../../infraestructure/repository/complementosDeAlojamiento/obtenerComplementoPorComplementoUID.mjs"
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { obtenerApartamentosDeLaReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs"
import { obtenerHabitacionDelApartamentoPorApartamentoUIDPorHabitacionIDV } from "../../../../../infraestructure/repository/reservas/apartamentos/obtenerHabitacionDelApartamentoPorApartamentoUIDPorHabitacionIDV.mjs"
import { obtenerHabitacionDelLaReserva } from "../../../../../infraestructure/repository/reservas/apartamentos/obtenerHabitacionDelLaReserva.mjs"
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
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })

        const complementoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.complementoUID,
            nombreCampo: "El identificador universal del complementoUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
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
        const tipoUbicacion = complemento.tipoUbicacion
        const habitacionUID = complemento.habitacionUID

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
        const apartamentoUI = controlApartamento[0].apartamentoUI
        let habitacionUID_enReserva
        if (tipoUbicacion === "habitacion") {

            const habitacionDeLaConfiguracion = await obtenerHabitacionDelApartamentoPorHabitacionUID(habitacionUID)
            const habitacionIDV = habitacionDeLaConfiguracion.habitacionIDV

            const habitacionDelApartamento = await obtenerHabitacionDelApartamentoPorApartamentoUIDPorHabitacionIDV({
                apartamentoUID,
                habitacionIDV,
                errorSi: "desactivado"
            })

            if (!habitacionDelApartamento?.componenteUID) {
                const habitacionEntidad = await obtenerHabitacionComoEntidadPorHabitacionIDV({
                    habitacionIDV,
                    errorSi: "noExiste"
                })

                const habitacionUI = habitacionEntidad.habitacionUI
                const m = `El complemento de alojamiento ${complementoUI} (UID: ${complementoUID}) forma parte del alojamiento ${apartamentoUI} (IDV: ${apartamentoIDV}), dentro de este alojamiento este complemento esta asociado a la habitación ${habitacionUI} (IDV: ${habitacionIDV}) pero esta no esta añadida en el alojamiento. Añade en alojamiento de la reserva la habitacion ${habitacionUI} (${habitacionIDV})`
                throw new Error(m)

            }
            habitacionUID_enReserva = habitacionDelApartamento.componenteUID
        }

        await campoDeTransaccion("iniciar")
        const complementoDeAlojamiento = await insertarComplementoAlojamientoPorReservaUID({
            reservaUID,
            complementoUI,
            apartamentoIDV,
            definicion,
            tipoPrecio,
            precio,
            apartamentoUID,
            tipoUbicacion,
            habitacionUID: habitacionUID_enReserva
        })

        if (complementoDeAlojamiento.tipoUbicacion === "habitacion") {

            const habitacionEnLaReserva = await obtenerHabitacionDelLaReserva({
                reservaUID: complementoDeAlojamiento.reservaUID,
                habitacionUID: complementoDeAlojamiento.habitacionUID
            })
            const habitacionUI = habitacionEnLaReserva.habitacionUI
            complementoDeAlojamiento.habitacionUI = habitacionUI
        }

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