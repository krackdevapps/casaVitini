import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerPernoctanteDeLaReservaPorPernoctaneUID } from "../../../../../repositorio/reservas/pernoctantes/obtenerPernoctanteDeLaReservaPorPernoctaneUID.mjs";
import { obtenerClientePoolPorPernoctanteUID } from "../../../../../repositorio/pool/obtenerClientePoolPorPernoctanteUID.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";

export const detallesDelPernoctantePorComprobar = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        await obtenerReservaPorReservaUID(reservaUID);

        const pernoctanteUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.pernoctanteUID,
            nombreCampo: "El identificador universal de la pernoctanteUID (pernoctanteUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
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
            return ok
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}