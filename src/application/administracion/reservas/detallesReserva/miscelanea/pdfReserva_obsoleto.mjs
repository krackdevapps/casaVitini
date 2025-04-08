
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { detallesReserva } from "../../../../../shared/reservas/detallesReserva.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { esquemaGlobal } from "../pdf/contenedores/esquemaGlobal.mjs";

export const pdfReserva = async (entrada) => {
    try {

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
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
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
        const pdf = await esquemaGlobal({
            incluirTitular: "si",
            reserva: reserva,
            tablasIDV: [
                "fechas",
                "alojamiento",
                "servicios",
                "totalesGlobales"
            ],
            configuracionPorTabla: {}
        });
        const ok = {
            ok: "Aquí está el pdf en base64",
            pdf: pdf
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}