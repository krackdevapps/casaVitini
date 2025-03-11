import { constructorInstantaneaComplementosAlojamiento } from "./constructorInstantaneaComplementosAlojamiento.mjs"
import { obtenerServiciosPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/servicios/obtenerServiciosPorSimulacionUID.mjs"
import { obtenerComplementoPorComplementoUID } from "../../../../infraestructure/repository/complementosDeAlojamiento/obtenerComplementoPorComplementoUID.mjs"
import { obtenerComplementosAlojamientoPorReservaUID } from "../../../../infraestructure/repository/reservas/complementosAlojamiento/obtenerComplementosAlojamientoPorReservaUID.mjs"
import { obtenerComplementosAlojamientoPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/complementosDeAlojamiento/obtenerComplementosAlojamientoPorSimulacionUID.mjs"
import { obtenerHabitacionDelApartamentoEnReservaPorHabitacionUID } from "../../../../infraestructure/repository/reservas/apartamentos/obtenerHabitacionDelApartamentoEnReservaPorHabitacionUID.mjs"
import { obtenerHabitacionDelApartamentoPorHabitacionUID } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerHabitacionDelApartamentoPorHabitacionUID.mjs"
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../../../../infraestructure/repository/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs"

export const procesadorComplementosAlojamiento = async (data) => {
    try {
        const estructura = data.estructura
        const origen = data.origen
        const complementosUIDSolicitados = data.complementosUIDSolicitados
        const complementos = []


        if (origen === "hubComplementosAlojamiento") {
            for (const complementoUID of complementosUIDSolicitados) {
                const complemento = await obtenerComplementoPorComplementoUID(complementoUID)
                const tipoUbicacion = complemento.tipoUbicacion
                if (tipoUbicacion === "habitacion") {

                    const habitacionUID = complemento.habitacionUID
                    const habitacionDeLaConfiguracion = await obtenerHabitacionDelApartamentoPorHabitacionUID(habitacionUID)
                    const habitacionIDV = habitacionDeLaConfiguracion.habitacionIDV
                    const habitacionEntidad = await obtenerHabitacionComoEntidadPorHabitacionIDV({
                        habitacionIDV,
                        errorSi: "noExiste"
                    })

                    complemento.habitacionUI = habitacionEntidad.habitacionUI
                    complemento.habitacionIDV = habitacionIDV
                }

                complementos.push(complemento)
            }
        } else if (origen === "instantaneaComplementosAlojamientoEnReserva") {
            const reservaUID = data.reservaUID
            if (!reservaUID) {
                const m = "No llega el reseervaUID a instantaneaComplementosAlojamientoEnReserva"
                throw new Error(m)
            }
            const complementosDeLaReserva = await obtenerComplementosAlojamientoPorReservaUID(reservaUID)
            for (const c of complementosDeLaReserva) {
                const tipoUbicacion = c.tipoUbicacion
                if (tipoUbicacion === "habitacion") {
                    const habitacionUID_delComplementoEnReserva = c.habitacionUID
                    const habitacionEnReserva = await obtenerHabitacionDelApartamentoEnReservaPorHabitacionUID({
                        habitacionUID: habitacionUID_delComplementoEnReserva,
                        reservaUID
                    })

                    c.habitacionIDV = habitacionEnReserva.habitacionIDV
                    c.habitacionUI = habitacionEnReserva.habitacionUI
                }
            }
            complementos.push(...complementosDeLaReserva)
        } else if (origen === "instantaneaComplementosalojamientoEnSimulacion") {
            const simulacionUID = data.simulacionUID
            // Implementar esto:
            if (!simulacionUID) {
                const m = "No llega el simulacionUID a instantaneaComplementosalojamientoEnSimulacion"
                throw new Error(m)
            }
            // implementar hay que hacer el metodo de obtener complementos desde la instantanea de la simulacion!!!!
            const complementosDeLaSimulacion = await obtenerComplementosAlojamientoPorSimulacionUID(simulacionUID)
            // Hay que poner el habitacionIDV y el habitacionUI pero simulador no tiene habitaciones

            complementos.push(...complementosDeLaSimulacion)
        } else {
            const m = "La confguracion de complementosDeAlojamiento en el procesador esta mal configurada, necesita origen en hubComplementosAlojamiento, instantaneaComplementosAlojamientoEnReserva o instantaneaComplementosalojamientoEnSimulacion"
            throw new Error(m)
        }

        await constructorInstantaneaComplementosAlojamiento({
            estructura,
            complementos
        })
    } catch (error) {
        throw error
    }
}