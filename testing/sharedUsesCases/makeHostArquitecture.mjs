import { eliminarApartamentoComoEntidad } from "../../src/infraestructure/repository/arquitectura/entidades/apartamento/eliminarApartamentoComoEntidad.mjs"
import { eliminarCamaComoEntidad } from "../../src/infraestructure/repository/arquitectura/entidades/cama/eliminarCamaComoEntidad.mjs"
import { eliminarHabitacionComoEntidad } from "../../src/infraestructure/repository/arquitectura/entidades/habitacion/eliminarHabitacionComoEntidad.mjs"
import { actualizarZonaDeLaConfiguracionApartamento } from "../../src/application/administracion/arquitectura/configuraciones/actualizarZonaDeLaConfiguracionApartamento.mjs"
import { addCamaToConfiguracionApartamentoHabitacion } from "../../src/application/administracion/arquitectura/configuraciones/addCamaToConfiguracionApartamentoHabitacion.mjs"
import { addHabitacionToConfiguracionApartamento } from "../../src/application/administracion/arquitectura/configuraciones/addHabitacionToConfiguracionApartamento.mjs"
import { cambiarEstadoConfiguracionAlojamiento } from "../../src/application/administracion/arquitectura/configuraciones/cambiarEstadoConfiguracionAlojamiento.mjs"
import { crearConfiguracionAlojamiento } from "../../src/application/administracion/arquitectura/configuraciones/crearConfiguracionAlojamiento.mjs"
import { crearEntidadAlojamiento } from "../../src/application/administracion/arquitectura/entidades/crearEntidadAlojamiento.mjs"
import { establecerNuevoPrecioApartamento } from "../../src/application/administracion/precios/establecerNuevoPrecioApartamento.mjs"

export const makeHostArquitecture = async (data) => {
    try {
        const apartamentoIDV = data.apartamentoIDV
        const apartamentoUI = data.apartamentoUI
        const habitacionIDV = data.habitacionIDV
        const habitacionUI = data.habitacionUI
        const camaIDV = data.camaIDV
        const camaUI = data.camaUI
        const operacion = data.operacion
        let habitacionUID
        const fakeAdminSession = {
            usuario: "test",
            rolIDV: "administrador"
        }
        await eliminarApartamentoComoEntidad(apartamentoIDV)
        await eliminarCamaComoEntidad(camaIDV)
        await eliminarHabitacionComoEntidad(habitacionIDV)
        if (operacion === "construir") {

            // Crear entidad apartamentos
            await crearEntidadAlojamiento({
                body: {
                    tipoEntidad: "apartamento",
                    apartamentoUI: apartamentoUI,
                    apartamentoIDV: apartamentoIDV
                },
                session: fakeAdminSession
            })
            // Crear entidad habitacion
            await crearEntidadAlojamiento({
                body: {
                    tipoEntidad: "habitacion",
                    habitacionUI: habitacionUI,
                    habitacionIDV: habitacionIDV
                },
                session: fakeAdminSession
            })
            // Crear entidad cama
            await crearEntidadAlojamiento({
                body: {
                    tipoEntidad: "cama",
                    camaUI: camaUI,
                    camaIDV: camaIDV,
                    capacidad: "3",
                    tipoCama: "compartida"
                },
                session: fakeAdminSession
            })
            // Crear configuracion de alojamiento
            await crearConfiguracionAlojamiento({
                body: {
                    apartamentoIDV: apartamentoIDV,
                    apartamentoUI: apartamentoUI
                },
                session: fakeAdminSession
            })
            // Actualizar zona de la configuracion de alojamiento
            const makeEntity = {
                body: {
                    apartamentoIDV: apartamentoIDV,
                    nuevaZona: "global"
                },
                session: fakeAdminSession
            }
            await actualizarZonaDeLaConfiguracionApartamento(makeEntity)
            // Añadir habitacion a la configuracion de alojamiento
            const habitacionAdded = await addHabitacionToConfiguracionApartamento({
                body: {
                    habitacionIDV: habitacionIDV,
                    apartamentoIDV: apartamentoIDV,
                },
                session: fakeAdminSession
            })
            habitacionUID = habitacionAdded.habitacionUID

            // Añadir cama a la habitacion
            await addCamaToConfiguracionApartamentoHabitacion({
                body: {
                    camaIDV: camaIDV,
                    habitacionUID: habitacionUID
                },
                session: fakeAdminSession
            })

            // Actualizar precio de la confioguracion de alojamiento
            await establecerNuevoPrecioApartamento({
                body: {
                    apartamentoIDV: apartamentoIDV,
                    nuevoPrecio: "100.00"
                },
                session: fakeAdminSession
            })
            // Actualizar el estado de la configuracion a disponible
            await cambiarEstadoConfiguracionAlojamiento({
                body: {
                    apartamentoIDV: apartamentoIDV,
                    nuevoEstado: "disponible"
                },
                session: fakeAdminSession
            })
        } else if (operacion === "eliminar") {
            await eliminarApartamentoComoEntidad(apartamentoIDV)
            await eliminarCamaComoEntidad(camaIDV)
            await eliminarHabitacionComoEntidad(habitacionIDV)
        } else {
            const m = "No se reconoce la operacion"
            throw new Error(m)
        }

    } catch (error) {
        throw error
    }
}