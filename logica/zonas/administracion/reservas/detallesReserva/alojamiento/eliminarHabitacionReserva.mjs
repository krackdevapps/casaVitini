import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerHabitacionDelLaReserva } from "../../../../../repositorio/reservas/apartamentos/obtenerHabitacionDelLaReserva.mjs";
import { eliminarPernoctanteDeLaHabitacion } from "../../../../../repositorio/reservas/pernoctantes/eliminarPernoctanteDeLaHabitacion.mjs";
import { eliminarHabitacionDelApartamento } from "../../../../../repositorio/reservas/apartamentos/eliminarHabitacionDelApartamento.mjs";
import { actualizarHabitacionDelPernoctantePorHabitacionUID } from "../../../../../repositorio/reservas/pernoctantes/actualizarHabitacionDelPernoctantePorHabitacionUID.mjs";

export const eliminarHabitacionReserva = async (entrada) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
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

        const habitacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.habitacionUID,
            nombreCampo: "El identificador universal de la habitacionUID (habitacionUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const pernoctantes = validadoresCompartidos.tipos.cadena({
            string: entrada.body.pernoctantes,
            nombreCampo: "El pernoctantes",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        if (pernoctantes !== "conservar" && pernoctantes !== "eliminar") {
            const error = "El campo 'pernoctantes' solo puede ser 'conservar', 'mantener'";
            throw new Error(error);
        }
        // Comprobar que la reserva exisste
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar porque está cancelada.";
            throw new Error(error);
        }
        if (reserva.estadoPagoIDV === "pagado") {
            const error = "La reserva no se puede modificar porque está pagada.";
            throw new Error(error);
        }
        if (reserva.estadoPagoIDV === "reembolsado") {
            const error = "La reserva no se puede modificar porque está reembolsada.";
            throw new Error(error);
        }
        // validar habitacion
        await obtenerHabitacionDelLaReserva({
            reservaUID: reservaUID,
            habitacionUID: habitacionUID
        })
        const ok = {};
        if (pernoctantes === "eliminar") {
            await eliminarPernoctanteDeLaHabitacion({
                reservaUID: reservaUID,
                habitacionUID: habitacionUID
            })
            ok.ok = "Se ha eliminado la habitación correctamente y los pernoctanes que contenía"

        } else if (pernoctantes === "conservar") {
            await actualizarHabitacionDelPernoctantePorHabitacionUID({
                reservaUID: reservaUID,
                habitacionUID: habitacionUID
            })
            ok.ok = "Se ha eliminado la habitación correctamente, pero los pernoctantes que contenía siguen asignados a la reserva"
        }
        await eliminarHabitacionDelApartamento({
            reservaUID: reservaUID,
            habitacionUID: habitacionUID
        })
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}