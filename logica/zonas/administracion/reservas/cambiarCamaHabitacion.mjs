import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerHabitacionDelLaReserva } from "../../../repositorio/reservas/apartamentos/obtenerHabitacionDelLaReserva.mjs";
import { obtenerCamaComoEntidadPorCamaIDV } from "../../../repositorio/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaIDV.mjs";
import { obtenerCamaDeLaHabitacion } from "../../../repositorio/reservas/apartamentos/obtenerCamaDeLaHabitacion.mjs";
import { actualizaCamaDeLaHabitacion } from "../../../repositorio/reservas/apartamentos/actualizaCamaDeLaHabitacion.mjs";
import { insertarCamaEnLaHabitacion } from "../../../repositorio/reservas/apartamentos/insertarCamaEnLaHabitacion.mjs";

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

        // Valida reserva
        const reserva = await obtenerReservaPorReservaUID(reservaUID)

        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar por que esta cancelada";
            throw new Error(error);
        }
        if (reserva.estadoPagoIDV === "pagado") {
            const error = "La reserva no se puede modificar por que esta pagada";
            throw new Error(error);
        }
        if (reserva.estadoPagoIDV === "reembolsado") {
            const error = "La reserva no se puede modificar por que esta reembolsada";
            throw new Error(error);
        }

        // valida que la habitacion exista dentro de la reserva
        await obtenerHabitacionDelLaReserva({
            reservaUID: reservaUID,
            habitacionUID: habitacionUID
        })
        // valida camaIDV que entra
        const validarCamaIDV = await obtenerCamaComoEntidadPorCamaIDV(nuevaCamaIDV)
        if (!validarCamaIDV.camaIDV) {
            const error = "No exist el camaIDV introducido en el campo nuevaCama";
            throw new Error(error);
        }
        const camaUI = validarCamaIDV.camaUI
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
            ok.ok = "Se ha actualizado correctamente la cama"
        } else {
            const nuevaCamaEnHabitacion = await insertarCamaEnLaHabitacion({
                reservaUID: reservaUID,
                habitacionUID: habitacionUID,
                nuevaCamaIDV: nuevaCamaIDV,
                camaUI: camaUI
            })
            ok.ok = "Se ha anadido correctamente la nueva a la habitacion"
            ok.nuevoUID = nuevaCamaEnHabitacion.componenteUID
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}