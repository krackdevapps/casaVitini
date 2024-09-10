import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { generadorPDF } from "../../../../../sistema/pdf/generadorPDF.mjs";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";
import { detallesReserva } from "../../../../../sistema/reservas/detallesReserva.mjs";

import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";

export const pdfReserva = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
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

        const reserva = await detallesReserva({
            reservaUID: reservaUID,
            capas: [
                "titular",
                "alojamiento",
                "desgloseFinanciero"
            ]
        })

        const pdf = await generadorPDF(reserva);
        const ok = {
            ok: "Aquí está el pdf en base64",
            pdf: pdf
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}