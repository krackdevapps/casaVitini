import { obtenerApartamentosDeLaReservaPorReservaUID } from "../../../repositorio/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs";
import { obtenerCamaDeLaHabitacion } from "../../../repositorio/reservas/apartamentos/obtenerCamaDeLaHabitacion.mjs";
import { obtenerHabitacionesDelApartamento } from "../../../repositorio/reservas/apartamentos/obtenerHabitacionDelApartamento.mjs";
import { conexion } from "../../componentes/db.mjs"

export const detallesAlojamiento = async (reservaUID) => {

    const apartamentosDeLaReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)
    const alojamiento = {
    }
    if (apartamentosDeLaReserva.length === 0) {
        reserva.alojamiento = {}
    }
    const habitacionObjeto = {}
    const apartamentosIndiceOrdenado = []
    apartamentosDeLaReserva.map((apartamento) => {
        apartamentosIndiceOrdenado.push(apartamento.apartamento)
    })
    apartamentosIndiceOrdenado.sort()
    const apartamenosOrdenados = []
    apartamentosIndiceOrdenado.map((apartamentoIndice) => {
        apartamentosDeLaReserva.map((apartamento) => {
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

        const habitacionesDelApartamento = await obtenerHabitacionesDelApartamento(apartamentoUID)
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
                reservaUID:reservaUID,
                habitacionUID:habitacionUID
            })
            if (camaDeLaHabitacion) {
                const camaIDV = camaDeLaHabitacion.camaIDV
                const camaUID = camaDeLaHabitacion.componenteUID
                const camaUI = camaDeLaHabitacion.camaUI
                alojamiento[apartamentoIDV].habitaciones[habitacionIDV].camaUI = camaUI
                alojamiento[apartamentoIDV].habitaciones[habitacionIDV].camaID = camaIDV
                alojamiento[apartamentoIDV].habitaciones[habitacionIDV].camaUI = camaUID
            }else {
                alojamiento[apartamentoIDV].habitaciones[habitacionIDV].camaUI = "Sin cama asignada"
            }
            alojamiento[apartamentoIDV].habitaciones[habitacionIDV].habitacionUID = habitacionUID
            const pernoctanesEnHabitacion = await recuperarClientes(reservaUID, habitacionUID)
            alojamiento[apartamentoIDV].habitaciones[habitacionIDV].pernoctantes = pernoctanesEnHabitacion
        }
    }
    const pernoctantesSinHabitacion = await recuperarClientesSinHabitacionAsignada(reservaUID)
    pernoctantesSinHabitacion = pernoctantesSinHabitacion
    //Aqui pernoctantes sin alojamiento
    return alojamiento
};
