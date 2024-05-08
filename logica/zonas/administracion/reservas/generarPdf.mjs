import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { generadorPDF } from "../../../sistema/PDF/generadorPDF.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { detallesReserva } from "../../../sistema/reservas/detallesReserva.mjs";

export const generarPdf = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const reservaUID = validadoresCompartidos.tipos.numero({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        await validadoresCompartidos.reservas.validarReserva(reservaUID);
        const metadatos = {
            reservaUID: reservaUID
        };
        const reserva = await detallesReserva(metadatos);

        const pdf = await generadorPDF(reserva);
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