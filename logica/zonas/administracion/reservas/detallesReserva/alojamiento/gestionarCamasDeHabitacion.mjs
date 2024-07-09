import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerHabitacionDelLaReserva } from "../../../../../repositorio/reservas/apartamentos/obtenerHabitacionDelLaReserva.mjs";
import { actualizaCamaDeLaHabitacion } from "../../../../../repositorio/reservas/apartamentos/actualizaCamaDeLaHabitacion.mjs";
import { insertarCamaEnLaHabitacion } from "../../../../../repositorio/reservas/apartamentos/insertarCamaEnLaHabitacion.mjs";
import { obtenerCamaComoEntidadPorCamaIDVPorTipoIDV } from "../../../../../repositorio/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaIDVPorTipoIDV.mjs";
import { obtenerReservasPorRango } from "../../../../../repositorio/reservas/selectoresDeReservas/obtenerReservasPorRango.mjs";
import { obtenerCamasFisicasPorReservaUID } from "../../../../../repositorio/reservas/apartamentos/obtenerCamasFisicasPorReservaUID.mjs";
import { insertarCamaFisicaEnLaHabitacion } from "../../../../../repositorio/reservas/apartamentos/insertarCamaFisicaEnLaHabitacion.mjs";
import { obtenerCamaCompartidaDeLaHabitacion } from "../../../../../repositorio/reservas/apartamentos/obtenerCamaCompartidaDeLaHabitacion.mjs";
import { obtenerCamaFisicaPorReservaUIDPorHabitacionUIDPorCamaIDV } from "../../../../../repositorio/reservas/apartamentos/obtenerCamaFisicaPorReservaUIDPorHabitacionUIDPorCamaIDV.mjs";

export const gestionarCamasDeHabitacion = async (entrada, salida) => {
    const mutex = new Mutex()
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        await mutex.acquire();

        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reservaUID (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            impedirCero: "si",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "si"
        })
        const habitacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.habitacionUID,
            nombreCampo: "El identificador universal de la habitacion (habitacionUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            impedirCero: "si",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "si"
        })
        const nuevaCamaIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nuevaCamaIDV,
            nombreCampo: "El nuevaCamaIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            soloMinusculas: "si",
            limpiezaEspaciosAlrededor: "si",
        })
        const tipoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoIDV,
            nombreCampo: "El campo tipoIDV de la cama",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        if (tipoIDV === "fisica" && tipoIDV === "compartida") {
            const m = "El campo tipoIDV solo espera fisica o compartida"
            throw new Error(m)

        }
        // Valida reserva
        const reserva = await obtenerReservaPorReservaUID(reservaUID)

        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar por que esta cancelada";
            throw new Error(error);
        }
        const fechaInicio = reserva.fechaInicio
        const fechaSalida = reserva.fechaSalida

        // valida que la habitacion exista dentro de la reserva
        await obtenerHabitacionDelLaReserva({
            reservaUID: reservaUID,
            habitacionUID: habitacionUID
        })
        // valida camaIDV que entra
        const cama = await obtenerCamaComoEntidadPorCamaIDVPorTipoIDV({
            camaIDV: nuevaCamaIDV,
            tipoIDVArray: [tipoIDV],
            errorSi: "noExiste"
        })

        const camaUI = cama.camaUI
        if (tipoIDV === "compartida") {
            const camaDeLaHabitacion = await obtenerCamaCompartidaDeLaHabitacion({
                reservaUID: reservaUID,
                habitacionUID: habitacionUID
            })
            const ok = {}
            if (camaDeLaHabitacion?.componenteUID) {
                await actualizaCamaDeLaHabitacion({
                    reservaUID: reservaUID,
                    habitacionUID: habitacionUID,
                    nuevaCamaIDV: nuevaCamaIDV,
                    camaUI: camaUI
                })
                ok.ok = "Se ha actualizado correctamente la cama compartida"
            } else {
                const nuevaCamaEnHabitacion = await insertarCamaEnLaHabitacion({
                    reservaUID: reservaUID,
                    habitacionUID: habitacionUID,
                    nuevaCamaIDV: nuevaCamaIDV,
                    camaUI: camaUI
                })
                ok.ok = "Se ha anadido correctamente la nueva cama compartida a la habitacion"
                ok.nuevoUID = nuevaCamaEnHabitacion.componenteUID
            }
            return ok
        } else if (tipoIDV === "fisica") {

            // valida camaIDV que entra
            const cama = await obtenerCamaComoEntidadPorCamaIDVPorTipoIDV({
                camaIDV: nuevaCamaIDV,
                tipoIDVArray: [tipoIDV],
                errorSi: "noExiste"
            })
            const camaUI = cama.camaUI

            // Si ya existe al cama fisica, no hace nada
            await obtenerCamaFisicaPorReservaUIDPorHabitacionUIDPorCamaIDV({
                reservaUID,
                habitacionUID,
                camaIDV: nuevaCamaIDV,
                errorSi: "existe"
            })

            // Si no existe la cama fisica se compreuba que no exista en otra reserva al mismo tiempo
            const reservasConflicto = await obtenerReservasPorRango({
                fechaIncioRango_ISO: fechaInicio,
                fechaFinRango_ISO: fechaSalida
            })
            const reservaUID_Array = reservasConflicto.map((reserva) => {
                return reserva.reservaUID
            })
            const camaFisicaEnOTrasReservas = await obtenerCamasFisicasPorReservaUID({
                reservaUID_Array,
                camaIDV: nuevaCamaIDV,
                errorSi: "desactivado"
            })
            const estructura = {
                ok: "Resultado de la operacion"
            }
            if (camaFisicaEnOTrasReservas.length > 0) {
                estructura.estadoCamaFisica = "ocupada"
                estructura.descripcion = "La cama fisica no se ha insertado en la habitacion por que esta ocupada en otra habitacion, a continuacion se detalle el lugar de la cama fisica"
                estructura.reservas = camaFisicaEnOTrasReservas
            } else if (camaFisicaEnOTrasReservas.length === 0) {

                const camaFisicaInsertada = await insertarCamaFisicaEnLaHabitacion({
                    reservaUID,
                    habitacionUID,
                    nuevaCamaIDV,
                    camaUI
                })
                const componenteUID = camaFisicaInsertada.componenteUID
                estructura.estadoCamaFisica = "aceptada"
                estructura.descripcion = "La cama fisica se ha insertaado en la habitacion por que estaba disponible"
                estructura.camaIDV = nuevaCamaIDV
                estructura.componenteUID = componenteUID
                estructura.camaUI = camaUI
            }
            return estructura
        }
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}