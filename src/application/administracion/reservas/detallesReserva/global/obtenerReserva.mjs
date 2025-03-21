import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { detallesReserva } from "../../../../../shared/reservas/detallesReserva.mjs";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";

export const obtenerReserva = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })

        const capas = validadoresCompartidos.tipos.array({
            array: entrada.body.capas,
            nombreCampo: "El campo capas",
            filtro: "strictoIDV",
            sePermitenDuplicados: "no",
            sePermiteArrayVacio: "si"
        })

        const resuelveDetallesReserva = await detallesReserva({
            reservaUID: reservaUID,
            capas
        });
        const ok = {
            ok: resuelveDetallesReserva
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}