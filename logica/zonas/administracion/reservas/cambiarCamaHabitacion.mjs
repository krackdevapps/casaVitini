import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerHabitacionDelLaReserva } from "../../../repositorio/reservas/apartamentos/obtenerHabitacionDelLaReserva.mjs";
import { obtenerCamaDeLaHabitacion } from "../../../repositorio/reservas/apartamentos/obtenerCamaDeLaHabitacion.mjs";
import { actualizaCamaDeLaHabitacion } from "../../../repositorio/reservas/apartamentos/actualizaCamaDeLaHabitacion.mjs";
import { insertarCamaEnLaHabitacion } from "../../../repositorio/reservas/apartamentos/insertarCamaEnLaHabitacion.mjs";
import { obtenerCamaComoEntidadPorCamaIDVPorTipoIDV } from "../../../repositorio/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaIDVPorTipoIDV.mjs";
import { obtenerCamasFisicasDeLaHabitacion } from "../../../repositorio/reservas/apartamentos/obtenerCamasFisicasDeLaHabitacion.mjs";

export const cambiarCamaHabitacion = async (entrada, salida) => {
    const mutex = new Mutex()
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        await mutex.acquire();

        const reservaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reservaUID (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const habitacionUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.habitacionUID,
            nombreCampo: "El identificador universal de la habitacionUID (habitacionUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const nuevaCamaIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nuevaCamaIDV,
            nombreCampo: "El nuevaCama",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
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

        // valida que la habitacion exista dentro de la reserva
        await obtenerHabitacionDelLaReserva({
            reservaUID: reservaUID,
            habitacionUID: habitacionUID
        })
        // valida camaIDV que entra
        const cama = await obtenerCamaComoEntidadPorCamaIDVPorTipoIDV({
            camaIDV: nuevaCamaIDV,
            tipoIDV: [tipoIDV],
            errorSi: "noExiste"
        })

        const camaUI = cama.camaUI

        if (tipoIDV === "compartida") {
            const camaDeLaHabitacion = await obtenerCamaDeLaHabitacion({
                reservaUID: reservaUID,
                habitacionUID: habitacionUID
            })
            const ok = {}
            if (camaDeLaHabitacion.componenteUID) {
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
                tipoIDV: [tipoIDV],
                errorSi: "noExiste"
            })
            const camaUI = cama.camaUI

           // Si ya existe al cama fisica, no hace nada
            await obtenerCamasFisicasDeLaHabitacion({
                reservaUID,
                habitacionUID,
                camaIDV,
                errorSi: "existe"
            })


            // Si no existe la cama fisica se compreuba que no exista en otra reserva al mismo tiempo




            

            // Se inserta la cama fisica en la habitacion en la nueva tabla

            const camaDeLaHabitacion = await obtenerCamaDeLaHabitacion({
                reservaUID: reservaUID,
                habitacionUID: habitacionUID
            })
            const ok = {}
            if (camaDeLaHabitacion.componenteUID) {
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
        }

    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}