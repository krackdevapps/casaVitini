import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { generadorPDF } from "../../../../../shared/pdf/generadorPDF.mjs";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { detallesReserva } from "../../../../../shared/reservas/detallesReserva.mjs";

import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";

export const pdfReservaBuffer = async (entrada, salida) => {
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
                "desgloseFinanciero",
                "servicios"
            ]
        })

        const pdf = await generadorPDF(reserva);
        const pdfBuffer = Buffer.from(pdf, 'base64');

        salida.setHeader('Content-Type', 'application/pdf');
        salida.setHeader('Content-Disposition', 'inline; filename="reserva.pdf"'); // inline para mostrar el PDF en el navegador, si quieres que lo descargue usa 'attachment'
        salida.send(pdfBuffer);

    } catch (errorCapturado) {
        throw errorCapturado
    }
}