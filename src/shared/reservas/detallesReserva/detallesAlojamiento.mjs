import { obtenerApartamentosDeLaReservaPorReservaUID } from "../../../infraestructure/repository/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs";
import { obtenerCamaCompartidaDeLaHabitacion } from "../../../infraestructure/repository/reservas/apartamentos/obtenerCamaCompartidaDeLaHabitacion.mjs";
import { obtenerCamasFisicasPorReservaUIDPorHabitacionUID } from "../../../infraestructure/repository/reservas/apartamentos/obtenerCamasFisicasPorReservaUIDPorHabitacionUID.mjs";
import { obtenerHabitacionesDelApartamento } from "../../../infraestructure/repository/reservas/apartamentos/obtenerHabitacionDelApartamento.mjs";
import { obtenerPernoctantesDeLaHabitacion } from "../../../infraestructure/repository/reservas/pernoctantes/obtenerPernoctantesDeLaHabitacion.mjs";
import { recuperarClientesSinHabitacionAsignada } from "./recuperarClientesSinHabitacionAsignada.mjs";

export const detallesAlojamiento = async (reservaUID) => {
    try {
        const apartamentosDeLaReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)
        const alojamiento = {
        }
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
                alojamiento[apartamentoIDV].habitaciones[habitacionIDV].habitacionUID = habitacionUID
                alojamiento[apartamentoIDV].habitaciones[habitacionIDV].camas = {
                    compartida: {},
                    fisicas: []
                }
                const contenedorCamaCompartida = alojamiento[apartamentoIDV].habitaciones[habitacionIDV].camas.compartida
                const contenedorCamasFisicas = alojamiento[apartamentoIDV].habitaciones[habitacionIDV].camas.fisicas

                const camaCommpartidaDeLaHabitacion = await obtenerCamaCompartidaDeLaHabitacion({
                    reservaUID,
                    habitacionUID
                })
                if (camaCommpartidaDeLaHabitacion) {
                    const camaIDV = camaCommpartidaDeLaHabitacion.camaIDV
                    const camaUID = camaCommpartidaDeLaHabitacion.componenteUID
                    const camaUI = camaCommpartidaDeLaHabitacion.camaUI

                    contenedorCamaCompartida.camaUI = camaUI
                    contenedorCamaCompartida.camaIDV = camaIDV
                    contenedorCamaCompartida.camaUID = camaUID

                } else {
                    contenedorCamaCompartida.camaUI = "Sin cama asignada"
                }

                const camasFisicasDeLaHabitacion = await obtenerCamasFisicasPorReservaUIDPorHabitacionUID({
                    reservaUID,
                    habitacionUID,
                    errorSi: "desactivado"
                })

                camasFisicasDeLaHabitacion.forEach((camaFisica) => {
                    contenedorCamasFisicas.push(camaFisica)
                })

                const pernoctanesEnHabitacion = await obtenerPernoctantesDeLaHabitacion({
                    reservaUID,
                    habitacionUID
                })

            }
        }
        const pernoctantesSinHabitacion = await recuperarClientesSinHabitacionAsignada(reservaUID)

        return alojamiento
    } catch (error) {
        throw error
    }

};
