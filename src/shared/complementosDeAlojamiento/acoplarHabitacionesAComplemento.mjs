import { obtenerHabitacionesDelApartamentoPorApartamentoIDV } from "../../infraestructure/repository/arquitectura/configuraciones/obtenerHabitacionesDelApartamentoPorApartamentoIDV.mjs"
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../../infraestructure/repository/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs"

export const acoplarHabitacionesAComplemento = async (data) => {

    const habitacionUID = data.habitacionUID
    const apartamentoIDV = data.apartamentoIDV
    const habitacionesAlojamiento = []
    let habitacionSeleccionada = {}

    const hDA = await obtenerHabitacionesDelApartamentoPorApartamentoIDV(apartamentoIDV)
    for (const h of hDA) {

        const hUID = h.componenteUID
        const hIDV = h.habitacionIDV

        const habitacionUI = (await obtenerHabitacionComoEntidadPorHabitacionIDV({
            habitacionIDV: hIDV,
            errorSi: "noExiste"
        })).habitacionUI
        h.habitacionUI = habitacionUI

        habitacionesAlojamiento.push(h)
        
        if (habitacionUID === hUID) {
            habitacionSeleccionada = h
        }
    }
    return {
        habitacionesAlojamiento,
        habitacionSeleccionada
    }
}