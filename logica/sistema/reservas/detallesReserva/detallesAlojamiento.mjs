import { obtenerApartamentosDeLaReservaPorReservaUID } from "../../../repositorio/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs";
import { obtenerCamaDeLaHabitacion } from "../../../repositorio/reservas/apartamentos/obtenerCamaDeLaHabitacion.mjs";
import { obtenerHabitacionesDelApartamento } from "../../../repositorio/reservas/apartamentos/obtenerHabitacionDelApartamento.mjs";
import { obtenerPernoctantesDeLaHabitacion } from "../../../repositorio/reservas/pernoctantes/obtenerPernoctantesDeLaHabitacion.mjs";
import { recuperarClientesSinHabitacionAsignada } from "./recuperarClientesSinHabitacionAsignada.mjs";

export const detallesAlojamiento = async (reservaUID) => {
    try {
        const apartamentosDeLaReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)
        const alojamiento = {
        }
        if (apartamentosDeLaReserva.length === 0) {
            reserva.alojamiento = {}
        }
        const habitacionObjeto = {}
        const apartamentosIndiceOrdenado = []
        apartamentosDeLaReserva.forEach((apartamento) => {
            apartamentosIndiceOrdenado.push(apartamento.apartamento)
        })
        apartamentosIndiceOrdenado.sort()
        const apartamenosOrdenados = []
        apartamentosIndiceOrdenado.forEach((apartamentoIndice) => {
            apartamentosDeLaReserva.forEach((apartamento) => {
                if (apartamento.apartamento === apartamentoIndice) {
                    apartamenosOrdenados.push(apartamento)
                }
            })
        })
        for (const apartamento of apartamenosOrdenados) {
            const apartamentoUID = apartamento.componenteUID
            const apartamentoIDV = apartamento.apartamentoIDV
            const apartamentoUI = apartamento.apartamentoUI
            alojamiento[apartamentoIDV] = {}
            alojamiento[apartamentoIDV].apartamentoUI = apartamentoUI
            const habitacionesDelApartamento = await obtenerHabitacionesDelApartamento({
                reservaUID: reservaUID,
                apartamentoUID: apartamentoUID
            })
            const habitacionObjeto = {}
            alojamiento[apartamentoIDV].apartamentoUID = apartamentoUID
            alojamiento[apartamentoIDV].habitaciones = {}
            for (const habitacion of habitacionesDelApartamento) {
                const habitacionUID = habitacion.componenteUID
                const habitacionIDV = habitacion.habitacionIDV
                const habitacionUI = habitacion.habitacionUI
                habitacionObjeto[habitacionIDV] = {}
                alojamiento[apartamentoIDV].habitaciones[habitacionIDV] = {}
                alojamiento[apartamentoIDV].habitaciones[habitacionIDV].habitacionUI = habitacionUI
                const camaDeLaHabitacion = await obtenerCamaDeLaHabitacion({
                    reservaUID: reservaUID,
                    habitacionUID: habitacionUID
                })
                if (camaDeLaHabitacion) {
                    const camaIDV = camaDeLaHabitacion.camaIDV
                    const camaUID = camaDeLaHabitacion.componenteUID
                    const camaUI = camaDeLaHabitacion.camaUI
                    alojamiento[apartamentoIDV].habitaciones[habitacionIDV].camaUI = camaUI
                    alojamiento[apartamentoIDV].habitaciones[habitacionIDV].camaIDV = camaIDV
                    alojamiento[apartamentoIDV].habitaciones[habitacionIDV].camaUID = camaUID
                } else {
                    alojamiento[apartamentoIDV].habitaciones[habitacionIDV].camaUI = "Sin cama asignada"
                }
                alojamiento[apartamentoIDV].habitaciones[habitacionIDV].habitacionUID = habitacionUID
                const pernoctanesEnHabitacion = await obtenerPernoctantesDeLaHabitacion({
                    reservaUID,
                    habitacionUID
                })
              //  alojamiento[apartamentoIDV].habitaciones[habitacionIDV].pernoctantes = pernoctanesEnHabitacion
            }
        }
        const pernoctantesSinHabitacion = await recuperarClientesSinHabitacionAsignada(reservaUID)
        //Aqui pernoctantes sin alojamiento
        return alojamiento
    } catch (error) {
        throw error
    }

};
