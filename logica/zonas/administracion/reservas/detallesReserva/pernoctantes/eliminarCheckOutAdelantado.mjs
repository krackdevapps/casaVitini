import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerPernoctanteDeLaReservaPorPernoctaneUID } from "../../../../../repositorio/reservas/pernoctantes/obtenerPernoctanteDeLaReservaPorPernoctaneUID.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { actualizarFechaCheckOutPernoctante } from "../../../../../repositorio/reservas/pernoctantes/actualizarFechaCheckOutPernoctante.mjs";
import { campoDeTransaccion } from "../../../../../repositorio/globales/campoDeTransaccion.mjs";

export const eliminarCheckOutAdelantado = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        const pernoctanteUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.pernoctanteUID,
            nombreCampo: "El identificador universal de la pernoctanteUID (pernoctanteUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        await campoDeTransaccion("iniciar")

        // Validar pernoctanteUID
        const pernoctante = await obtenerPernoctanteDeLaReservaPorPernoctaneUID({
            reservaUID: reservaUID,
            pernoctanteUID: pernoctanteUID
        })
        // Validar que el pernoctatne sea cliente y no cliente pool
        const reserva = obtenerReservaPorReservaUID(reservaUID)
        // validar que la reserva no este cancelada
        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "No se puede alterar una fecha de checkin de una reserva cancelada";
            throw new Error(error);
        }
        await actualizarFechaCheckOutPernoctante({
            pernoctanteUID: pernoctanteUID,
            fechaCheckOut_ISO: null
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha eliminado la fecha de checkin correctamente"
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorFinal
    } finally {
    }
}