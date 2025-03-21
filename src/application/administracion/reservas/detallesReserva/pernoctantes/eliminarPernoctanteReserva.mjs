import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";

import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerPernoctanteDeLaReservaPorPernoctaneUID } from "../../../../../infraestructure/repository/reservas/pernoctantes/obtenerPernoctanteDeLaReservaPorPernoctaneUID.mjs";
import { actualizarHabitacionDelPernoctantePorComponenteUID } from "../../../../../infraestructure/repository/reservas/pernoctantes/actualizarHabitacionDelPernoctantePorComponenteUID.mjs";
import { eliminarPernoctantePorPernoctanteUID } from "../../../../../infraestructure/repository/reservas/pernoctantes/eliminarPernoctantePorPernoctanteUID.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { eliminarClientePoolPorPernoctanteUID } from "../../../../../infraestructure/repository/clientes/eliminarClientePoolPorPernoctanteUID.mjs";

export const eliminarPernoctanteReserva = async (entrada, salida) => {
    const mutex = new Mutex()
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 3
        })

        await mutex.acquire();

        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })
        const pernoctanteUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.pernoctanteUID,
            nombreCampo: "El identificador universal de la pernoctanteUID (pernoctanteUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })
        const tipoEliminacion = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoEliminacion,
            nombreCampo: "El tipoEliminacion",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        if (tipoEliminacion !== "habitacion" && tipoEliminacion !== "reserva") {
            const error = "El campo 'tipoEliminacion' solo puede ser 'habitacion' o 'reserva'";
            throw new Error(error);
        }
        await campoDeTransaccion("iniciar")


        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar porque está cancelada.";
            throw new Error(error);
        }


        const pernoctante = await obtenerPernoctanteDeLaReservaPorPernoctaneUID({
            reservaUID: reservaUID,
            pernoctanteUID: pernoctanteUID
        })
        if (!pernoctante.componenteUID) {
            const error = "No existe el pernoctante en la reserva";
            throw new Error(error);
        }
        await eliminarClientePoolPorPernoctanteUID(pernoctanteUID)
        if (tipoEliminacion === "habitacion") {
            await actualizarHabitacionDelPernoctantePorComponenteUID({
                reservaUID: reservaUID,
                habitacionUID: null,
                pernoctanteUID: pernoctanteUID
            })
        }
        if (tipoEliminacion === "reserva") {
            await eliminarPernoctantePorPernoctanteUID({
                reservaUID: reservaUID,
                pernoctanteUID: pernoctanteUID
            })
        }
        await campoDeTransaccion("confirmar")
        const ok = {};
        if (tipoEliminacion === "habitacion") {
            ok.ok = "Se ha eliminado al pernoctante de la habitación"
        }
        if (tipoEliminacion === "reserva") {
            ok.ok = "Se ha eliminado al pernoctante de la reserva"
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}