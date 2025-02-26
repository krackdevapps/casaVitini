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
import { crearComplementoDeAlojamiento } from "../../src/application/administracion/complementosDeAlojamiento/crearComplementoDeAlojamiento.mjs"
import { actualizarEstado } from "../../src/application/administracion/complementosDeAlojamiento/actualizarEstado.mjs"

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


            await crearEntidadAlojamiento({
                body: {
                    tipoEntidad: "apartamento",
                    apartamentoUI: apartamentoUI,
                    apartamentoIDV: apartamentoIDV,
                    apartamentoUIPublico: "Apartamento temporal para testing",
                    definicionPublica: "Definicion del apartamento temporal para testing"
                },
                session: fakeAdminSession
            })

            await crearEntidadAlojamiento({
                body: {
                    tipoEntidad: "habitacion",
                    habitacionUI: habitacionUI,
                    habitacionIDV: habitacionIDV
                },
                session: fakeAdminSession
            })

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

            await crearConfiguracionAlojamiento({
                body: {
                    apartamentoIDV: apartamentoIDV,
                    apartamentoUI: apartamentoUI
                },
                session: fakeAdminSession
            })

            const makeEntity = {
                body: {
                    apartamentoIDV: apartamentoIDV,
                    nuevaZona: "global"
                },
                session: fakeAdminSession
            }
            await actualizarZonaDeLaConfiguracionApartamento(makeEntity)

            const habitacionAdded = await addHabitacionToConfiguracionApartamento({
                body: {
                    habitacionIDV: habitacionIDV,
                    apartamentoIDV: apartamentoIDV,
                },
                session: fakeAdminSession
            })
            habitacionUID = habitacionAdded.habitacionUID


            await addCamaToConfiguracionApartamentoHabitacion({
                body: {
                    camaIDV: camaIDV,
                    habitacionUID: habitacionUID
                },
                session: fakeAdminSession
            })


            await establecerNuevoPrecioApartamento({
                body: {
                    apartamentoIDV: apartamentoIDV,
                    nuevoPrecio: "100.00"
                },
                session: fakeAdminSession
            })

            await cambiarEstadoConfiguracionAlojamiento({
                body: {
                    apartamentoIDV: apartamentoIDV,
                    nuevoEstado: "activado"
                },
                session: fakeAdminSession
            })
            const complementoDeAlojamiento = await crearComplementoDeAlojamiento({
                body: {
                    apartamentoIDV: apartamentoIDV,
                    complementoUI: "Complemento creado para testing",
                    definicion: "Definicion temporal del complementos de alojamiento creado para testing",
                    tipoPrecio: "porNoche",
                    precio: "100.00",
                },
                session: fakeAdminSession
            })
            const complementoUID = complementoDeAlojamiento.nuevoComplementoUID
            await actualizarEstado({
                body: {
                    complementoUID,
                    estadoIDV: "activado"
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