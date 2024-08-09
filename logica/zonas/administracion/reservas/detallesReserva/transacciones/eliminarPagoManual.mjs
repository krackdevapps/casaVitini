import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { actualizarEstadoPago } from "../../../../../sistema/contenedorFinanciero/entidades/reserva/actualizarEstadoPago.mjs";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { eliminarPagoPorPagoUID } from "../../../../../repositorio/reservas/transacciones/pagos/eliminarPagoPorPagoUID.mjs";
import { campoDeTransaccion } from "../../../../../repositorio/globales/campoDeTransaccion.mjs";

export const eliminarPagoManual = async (entrada) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session)
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
            const error = "Necesario escribir la palabra, eliminar para confirmar la eliminación y evitar falsos clics";
            throw new Error(error);
        }
        const pagoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.pagoUID,
            nombreCampo: "El campo pagoUID",
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
        throw errorCapturado
    }
}