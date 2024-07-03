import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { detallesReserva as detallesReserva_ } from "../../../../../sistema/reservas/detallesReserva.mjs";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";

export const obtenerReserva = async (entrada, salida) => {
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

        const capas = validadoresCompartidos.tipos.array({
            array: entrada.body.capas,
            nombreCampo: "El campo capas",
            filtro: "soloCadenasIDV",
            sePermitenDuplicados: "no",
            sePermiteArrayVacio: "si"
        })
        const metadatos = {
            reservaUID: reservaUID,
            capas
        };
        const resuelveDetallesReserva = await detallesReserva_(metadatos);
        const ok = {
            ok: resuelveDetallesReserva
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}