import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs"
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../repositorio/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs"
import { obtenerCamaComoEntidadPorCamaIDV } from "../repositorio/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaIDV.mjs"
import { obtenerConfiguracionPorApartamentoIDV } from "../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs"
import { obtenerHabitacionesDelApartamentoPorApartamentoIDV } from "../repositorio/arquitectura/configuraciones/obtenerHabitacionesDelApartamentoPorApartamentoIDV.mjs"
import { obtenerTodasLasCaracteristicasDelApartamento } from "../repositorio/arquitectura/entidades/apartamento/obtenerTodasLasCaracteristicasDelApartamento.mjs"
import { validadoresCompartidos } from "./validadores/validadoresCompartidos.mjs"

export const configuracionApartamento = async (apartamentosIDVArray) => {

    try {
        validadoresCompartidos.tipos.array({
            array: apartamentosIDVArray,
            nombreCampo: "El sistema de configuracion",
            filtro: "soloCadenasIDV",
            noSePermitenDuplicados: "si"
        })

        const apartamentosValidados = []
        const configuracion = {}

        for (const apartamentoIDV of apartamentosIDVArray) {
            const configuracionApartamento = obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)
            const estructuraApartamentoInicial = {
                apartamentoIDV: configuracionApartamento.apartamentoIDV,
            }
            apartamentosValidados.push(estructuraApartamentoInicial)

        }

        for (const detallesApartamento of apartamentosValidados) {
            const apartamentoIDV = detallesApartamento.apartamentoIDV
            configuracion[apartamentoIDV] = {}

            const apartamentoUI = obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV)
            configuracion[apartamentoIDV].apartamentoUI = apartamentoUI
            const caracteristicasDeLApartamento = await obtenerTodasLasCaracteristicasDelApartamento(apartamentoIDV)
            configuracion[apartamentoIDV].caracteristicas = caracteristicasDeLApartamento
            const configuracionHabitacionesPorApartamento = await obtenerHabitacionesDelApartamentoPorApartamentoIDV(apartamentoIDV)
            configuracion[apartamentoIDV].habitaciones = {}

            for (const habitacion of configuracionHabitacionesPorApartamento) {
                const habiacionIDV = habitacion.habitacionIDV
                const habitacionUID = habitacion.habitacionUID
                configuracion[apartamentoIDV].habitaciones[habiacionIDV] = {}
                configuracion[apartamentoIDV].habitaciones[habiacionIDV].habitacionUI = obtenerHabitacionComoEntidadPorHabitacionIDV(habiacionIDV)

                const camasDeLaHabitacion = await obtenerCamasDeLaHabitacionPorHabitacionUID(habitacionUID)
                let configuracionNumero = 0
                configuracion[apartamentoIDV].habitaciones[habiacionIDV].configuraciones = {}

                for (const configuracionHabitacion of camasDeLaHabitacion) {
                    configuracionNumero += 1
                    const camaIDV = configuracionHabitacion.camaIDV
                    const cama = await obtenerCamaComoEntidadPorCamaIDV(camaIDV)
                    const camaUI = cama.camaUI
                    const capacidad = cama.capacidad
                    configuracion[apartamentoIDV].habitaciones[habiacionIDV].configuraciones["configuracion" + configuracionNumero] = {}
                    configuracion[apartamentoIDV].habitaciones[habiacionIDV].configuraciones["configuracion" + configuracionNumero] = {
                        camaIDV: camaIDV,
                        camaUI: camaUI,
                        capacidad: capacidad
                    }
                }
            }
        }
    } catch (errorCapturado) {
        throw error;
    }
    const ok = {
        configuracionApartamento: configuracion
    }
    return ok
}
