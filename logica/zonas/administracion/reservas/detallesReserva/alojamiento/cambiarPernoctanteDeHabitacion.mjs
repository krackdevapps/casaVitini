import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerPernoctanteDeLaReservaPorPernoctaneUID } from "../../../../../repositorio/reservas/pernoctantes/obtenerPernoctanteDeLaReservaPorPernoctaneUID.mjs";
import { actualizarHabitacionDelPernoctantePorComponenteUID } from "../../../../../repositorio/reservas/pernoctantes/actualizarHabitacionDelPernoctantePorComponenteUID.mjs";

export const cambiarPernoctanteDeHabitacion = async (entrada, salida) => {
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
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const habitacionDestinoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.habitacionDestinoUID,
            nombreCampo: "El identificador universal de la habitacionDestinoUID (habitacionDestinoUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        const pernoctanteUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la pernoctanteUID (pernoctanteUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

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
        const pernoctanteDeLaReserva = await obtenerPernoctanteDeLaReservaPorPernoctaneUID({
            reservaUID: reservaUID,
            pernoctanteUID: pernoctanteUID
        })
        if (!pernoctanteDeLaReserva.componenteUID) {
            const error = "No existe el pernoctante, por lo tanto no se puede mover de habitacion";
            throw new Error(error);
        }
        await actualizarHabitacionDelPernoctantePorComponenteUID({
            reservaUID: reservaUID,
            pernoctanteUID: pernoctanteUID,
            habitacionUID: habitacionDestinoUID
        })
        const ok = {
            ok: "Se ha cambiado correctamente al pernoctante de alojamiento dentro de la reserva "
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}