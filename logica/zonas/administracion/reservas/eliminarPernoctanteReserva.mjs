import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerPernoctanteDeLaReservaPorPernoctaneUID } from "../../../repositorio/reservas/pernoctantes/obtenerPernoctanteDeLaReservaPorPernoctaneUID.mjs";
import { actualizarHabitacionDelPernoctantePorComponenteUID } from "../../../repositorio/reservas/pernoctantes/actualizarHabitacionDelPernoctantePorComponenteUID.mjs";
import { eliminarPernoctantePorPernoctanteUID } from "../../../repositorio/reservas/pernoctantes/eliminarPernoctantePorPernoctanteUID.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";

export const eliminarPernoctanteReserva = async (entrada, salida) => {
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
        const pernoctanteUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.pernoctanteUID,
            nombreCampo: "El identificador universal de la pernoctante (pernoctanteUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const tipoElinacion = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoElinacion,
            nombreCampo: "El tipoElinacion",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        if (tipoElinacion !== "habitacion" && tipoElinacion !== "reserva") {
            const error = "El campo 'tipoElinacion' solo puede ser 'habitacion' o 'reserva'";
            throw new Error(error);
        }
        await campoDeTransaccion("iniciar")

        // Comprobar que la reserva exisste
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar por que esta cancelada";
            throw new Error(error);
        }
        // validar habitacion

        const pernoctante = await obtenerPernoctanteDeLaReservaPorPernoctaneUID({
            reservaUID: reservaUID,
            pernoctanteUID: pernoctanteUID
        })
        if (!pernoctante.componenteUID) {
            const error = "No existe el pernoctante en la reserva";
            throw new Error(error);
        }
        await eliminaClientePool(pernoctanteUID)
        if (tipoElinacion === "habitacion") {
            await actualizarHabitacionDelPernoctantePorComponenteUID({
                reservaUID: reservaUID,
                habitacionUID: null,
                pernoctanteUID: pernoctanteUID
            })
        }
        if (tipoElinacion === "reserva") {
            await eliminarPernoctantePorPernoctanteUID({
                reservaUID: reservaUID,
                pernoctanteUID: pernoctanteUID
            })
        }
        await campoDeTransaccion("confirmar")
        const ok = {};
        if (tipoElinacion === "habitacion") {
            ok.ok = "Se ha eliminado al pernoctante de la habitacion"
        }
        if (tipoElinacion === "reserva") {
            ok.ok = "Se ha eliminar al pernoctante de la reserva"
        }
        return ok

    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorFinal
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}