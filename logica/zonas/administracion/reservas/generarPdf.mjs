import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { generadorPDF3 } from "../../../sistema/generadorPDF.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { detallesReserva } from "./detallesReserva.mjs";


export const generarPdf = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const reservaUID = entrada.body.reservaUID;
        await validadoresCompartidos.reservas.validarReserva(reservaUID);
        const metadatos = {
            reservaUID: reservaUID
        };
        const reserva = await detallesReserva(metadatos);
        const pdf = await generadorPDF3(reserva);
        salida.setHeader('Content-Type', 'application/pdf');
        salida.setHeader('Content-Disposition', 'attachment; filename=documento.pdf');
        salida.send(pdf);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}