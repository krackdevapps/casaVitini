import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerPernoctanteDeLaReservaPorPernoctaneUID } from "../../../repositorio/reservas/pernoctantes/obtenerPernoctanteDeLaReservaPorPernoctaneUID.mjs";
import { obtenerClientePoolPorPernoctanteUID } from "../../../repositorio/clientes/obtenerClientePoolPorPernoctanteUID.mjs";
import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";

export const detallesDelPernoctantePorComprobar = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const reservaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        await obtenerReservaPorReservaUID(reservaUID);

        const pernoctanteUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.pernoctanteUID,
            nombreCampo: "El identificador universal de la pernoctante (pernoctanteUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const pernoctante = await obtenerPernoctanteDeLaReservaPorPernoctaneUID({
            reservaUID: reservaUID,
            pernoctanteUID: pernoctanteUID
        })
        if (!pernoctante.componenteUID) {
            const error = "No existe ningun pernoctante con ese UID dentro del la reserva";
            throw new Error(error);
        }
        const clienteUID = pernoctante.clienteUID;
        if (clienteUID) {
            const error = "El pernoctante ya ha pasado el proceso de comporbacion";
            throw new Error(error);
        } else {
            const clientePool = await obtenerClientePoolPorPernoctanteUID(pernoctanteUID)
            const nombreCompleto = clientePool.nombreCompleto;
            const pasaporte = clientePool.pasaporte;
            const ok = {
                pernoctanteUID: pernoctanteUID,
                nombreCompleto: nombreCompleto,
                pasaporte: pasaporte
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}