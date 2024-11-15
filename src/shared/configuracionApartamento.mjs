import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs"
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../infraestructure/repository/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs"
import { obtenerCamaComoEntidadPorCamaIDVPorTipoIDV } from "../infraestructure/repository/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaIDVPorTipoIDV.mjs"
import { obtenerConfiguracionPorApartamentoIDV } from "../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs"
import { obtenerHabitacionesDelApartamentoPorApartamentoIDV } from "../infraestructure/repository/arquitectura/configuraciones/obtenerHabitacionesDelApartamentoPorApartamentoIDV.mjs"
import { obtenerTodasLasCaracteristicasDelApartamento } from "../infraestructure/repository/arquitectura/entidades/apartamento/obtenerTodasLasCaracteristicasDelApartamento.mjs"
import { validadoresCompartidos } from "./validadores/validadoresCompartidos.mjs"
import { obtenerCamasDeLaHabitacionPorHabitacionUID } from "../infraestructure/repository/arquitectura/configuraciones/obtenerCamasDeLaHabitacionPorHabitacionUID.mjs"

export const configuracionApartamento = async (apartamentosIDVArray) => {

    try {
        validadoresCompartidos.tipos.array({
            array: apartamentosIDVArray,
            nombreCampo: "El sistema de configuracion",
            filtro: "soloCadenasIDV",
            sePermitenDuplicados: "no",
            sePermiteArrayVacio: "si"
        })

        const apartamentosValidados = []
        const configuracion = {}

        for (const apartamentoIDV of apartamentosIDVArray) {
            const configuracionApartamento = await obtenerConfiguracionPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "noExiste"
            })
            const estructuraApartamentoInicial = {
                apartamentoIDV: configuracionApartamento.apartamentoIDV,
            }
            apartamentosValidados.push(estructuraApartamentoInicial)
        }

        for (const detallesApartamento of apartamentosValidados) {
            const apartamentoIDV = detallesApartamento.apartamentoIDV
            configuracion[apartamentoIDV] = {}

            const apartamentoEntidad = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "noExiste"
            })
            configuracion[apartamentoIDV].apartamentoUI = apartamentoEntidad.apartamentoUI
            configuracion[apartamentoIDV].apartamentoUIPublico = apartamentoEntidad.apartamentoUIPublico
            configuracion[apartamentoIDV].definicionPublica = apartamentoEntidad.definicionPublica

            const caracteristicasDeLApartamento = await obtenerTodasLasCaracteristicasDelApartamento(apartamentoIDV)
            configuracion[apartamentoIDV].caracteristicas = caracteristicasDeLApartamento
            const configuracionHabitacionesPorApartamento = await obtenerHabitacionesDelApartamentoPorApartamentoIDV(apartamentoIDV)
            configuracion[apartamentoIDV].habitaciones = {}

            for (const habitacion of configuracionHabitacionesPorApartamento) {
                const habitacionIDV = habitacion.habitacionIDV
                const habitacionUID = habitacion.componenteUID
                const habitacionEntidad = await obtenerHabitacionComoEntidadPorHabitacionIDV({
                    habitacionIDV,
                    errorSi: "noExiste"
                })
                configuracion[apartamentoIDV].habitaciones[habitacionIDV] = {}
                configuracion[apartamentoIDV].habitaciones[habitacionIDV].habitacionUI = habitacionEntidad.habitacionUI

                const camasDeLaHabitacion = await obtenerCamasDeLaHabitacionPorHabitacionUID(habitacionUID)

                let configuracionNumero = 0
                configuracion[apartamentoIDV].habitaciones[habitacionIDV].configuraciones = {}

                for (const configuracionHabitacion of camasDeLaHabitacion) {
                    configuracionNumero += 1
                    const camaIDV = configuracionHabitacion.camaIDV
                    const cama = await obtenerCamaComoEntidadPorCamaIDVPorTipoIDV({
                        camaIDV,
                        tipoIDVArray: ["compartida"],
                        errorSi: "desactivado"
                    })
                    const camaUI = cama.camaUI
                    const capacidad = cama.capacidad
                    configuracion[apartamentoIDV].habitaciones[habitacionIDV].configuraciones["configuracion" + configuracionNumero] = {}
                    configuracion[apartamentoIDV].habitaciones[habitacionIDV].configuraciones["configuracion" + configuracionNumero] = {
                        camaIDV: camaIDV,
                        camaUI: camaUI,
                        capacidad: capacidad
                    }
                }
            }
        }
        const ok = {
            ok: "Aquí tienes las configuraciones solicitadas",
            configuracionApartamento: configuracion
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado;
    }

}
