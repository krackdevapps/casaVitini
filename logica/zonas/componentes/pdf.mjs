import { generadorPDF } from "../../sistema/PDF/generadorPDF.mjs";
import { controlCaducidad } from "../../sistema/PDF/controlCaducidad.mjs";
import { detallesReserva } from "../../sistema/reservas/detallesReserva.mjs";
import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../sistema/error/filtroError.mjs";
import { obtenerPDFPorEnlaceUID } from "../../repositorio/pdf/obtenerPDFPorEnlaceUID.mjs";

export const pdf = async (entrada, salida) => {
    try {
        const nombreEnlace = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombreEnlace,
            nombreCampo: "El campo del nombre del enlace",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        await controlCaducidad();
        const enlace = await obtenerPDFPorEnlaceUID(nombreEnlace)
        const reservaUID = enlace.reservaUID;
        const datosDetallesReserva = {
            reservaUID: reservaUID
        };
        const reserva = await detallesReserva(datosDetallesReserva);
        const pdf = await generadorPDF(reserva);
        salida.setHeader('Content-Type', 'application/pdf');
        salida.setHeader('Content-Disposition', 'attachment; filename=documento.pdf');
        salida.send(pdf);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}