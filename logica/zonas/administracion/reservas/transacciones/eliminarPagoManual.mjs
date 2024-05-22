import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { actualizarEstadoPago } from "../../../../sistema/precios/actualizarEstadoPago.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerReservaPorReservaUID } from "../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { eliminarPagoPorPagoUID } from "../../../../repositorio/reservas/transacciones/eliminarPagoPorPagoUID.mjs";
import { campoDeTransaccion } from "../../../../repositorio/globales/campoDeTransaccion.mjs";

export const eliminarPagoManual = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const palabra = validadoresCompartidos.tipos.cadena({
            string: entrada.body.palabra,
            nombreCampo: "El campo de la palabra",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        if (palabra !== "eliminar") {
            const error = "Necesario escribir la la palabra eliminar para confirmar la eliminación y evitar falsos clicks";
            throw new Error(error);
        }
        const pagoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.pagoUID,
            nombreCampo: "El campo pagoUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const reservaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        await campoDeTransaccion("inicair")
        await obtenerReservaPorReservaUID(reservaUID)
        await eliminarPagoPorPagoUID({
            pagoUID: pagoUID,
            reservaUID: reservaUID
        })
        await actualizarEstadoPago(reservaUID);
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha eliminado irreversiblemente el pago",
            pagoUID: pagoUID
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorFinal
    }
}