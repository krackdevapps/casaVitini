import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerPernoctanteDeLaReservaPorPernoctaneUID } from "../../../../../repositorio/reservas/pernoctantes/obtenerPernoctanteDeLaReservaPorPernoctaneUID.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { actualizarFechaCheckinPernoctante } from "../../../../../repositorio/reservas/pernoctantes/actualizarFechaCheckinPernoctante.mjs";
import { actualizarFechaCheckOutPernoctante } from "../../../../../repositorio/reservas/pernoctantes/actualizarFechaCheckOutPernoctante.mjs";
import { campoDeTransaccion } from "../../../../../repositorio/globales/campoDeTransaccion.mjs";

export const eliminarCheckIN = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        console.log("e", entrada.body)

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
        await obtenerReservaPorReservaUID(reservaUID);
        // Validar que el pernoctatne sea cliente y no cliente pool  
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "No se puede alterar una fecha de checkin de una reserva cancelada";
            throw new Error(error);
        }
        // Validar pernoctanteUID
        const pernoctante = await obtenerPernoctanteDeLaReservaPorPernoctaneUID({
            pernoctanteUID,
            reservaUID
        })
        console.log(">>>",pernoctante)
        if (!pernoctante?.componenteUID) {
            const error = "No existe el pernoctanteUID";
            throw new Error(error);
        }
        await campoDeTransaccion("iniciar")

        await actualizarFechaCheckinPernoctante({
            fechaCheckIn: null,
            pernoctanteUID
        })
        await actualizarFechaCheckOutPernoctante({
            fechaCheckOut: null,
            pernoctanteUID
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha eliminado la fecha de checkin correctamente"
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}