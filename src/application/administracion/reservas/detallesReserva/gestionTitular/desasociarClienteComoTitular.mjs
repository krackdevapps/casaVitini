import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { eliminarTitularPorReservaUID } from "../../../../../infraestructure/repository/reservas/titulares/eliminarTitularPorReservaUID.mjs";
import { eliminarTitularPoolPorReservaUID } from "../../../../../infraestructure/repository/reservas/titulares/eliminarTitularPoolPorReservaUID.mjs";

export const desasociarClienteComoTitular = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        await obtenerReservaPorReservaUID(reservaUID)
        await eliminarTitularPoolPorReservaUID(reservaUID)
        await eliminarTitularPorReservaUID(reservaUID)
        const ok = {
            ok: "Se ha eliminado el titular de la reserva, ahora no tiene titular"
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}