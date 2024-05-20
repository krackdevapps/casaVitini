import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerPernoctanteDeLaReservaPorPernoctaneUID } from "../../../repositorio/reservas/pernoctantes/obtenerPernoctanteDeLaReservaPorPernoctaneUID.mjs";
import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { actualizarFechaCheckinPernoctante } from "../../../repositorio/reservas/pernoctantes/actualizarFechaCheckinPernoctante.mjs";
import { actualizarFechaCheckOutPernoctante } from "../../../repositorio/reservas/pernoctantes/actualizarFechaCheckOutPernoctante.mjs";

export const eliminarCheckIN = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const pernoctanteUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.pernoctanteUID,
            nombreCampo: "El identificador universal de la pernoctante (pernoctanteUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const reservaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        await obtenerReservaPorReservaUID(reservaUID);

        // Validar pernoctanteUID
        const pernoctante = obtenerPernoctanteDeLaReservaPorPernoctaneUID({
            pernoctanteUID: pernoctanteUID,
            reservaUID: reservaUID
        })
        if (!pernoctante.compoenteUID) {
            const error = "No existe el pernoctanteUID";
            throw new Error(error);
        }
        await campoDeTransaccion("iniciar")
        // Validar que el pernoctatne sea cliente y no cliente pool  
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "No se puede alterar una fecha de checkin de una reserva cancelada";
            throw new Error(error);
        }
        await actualizarFechaCheckinPernoctante({
            fechaCheckIn_ISO: null,
            pernoctanteUID: pernoctanteUID
        })
        await actualizarFechaCheckOutPernoctante({
            fechaCheckOut_ISO: null,
            pernoctanteUID: pernoctanteUID
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha eliminado la fecha de checkin correctamente"
        };
        salida.json(ok);
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}