import { conexion } from "../../componentes/db.mjs";
import { generadorPDF } from "../../sistema/PDF/generadorPDF.mjs";
import { controlCaducidad } from "../../sistema/PDF/controlCaducidad.mjs";
import { detallesReserva } from "../../sistema/reservas/detallesReserva.mjs";
import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";

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
        const consultaValidarEnlace = `
            SELECT
            "reservaUID"
            FROM 
            "enlacesPdf" 
            WHERE 
            enlace = $1
            `;
        const resuelveValidarEnlace = await conexion.query(consultaValidarEnlace, [nombreEnlace]);
        if (resuelveValidarEnlace.rowCount === 0) {
            const error = "No existe el enlace para generar el PDF";
            throw new Error(error);
        }
        const reservaUID = resuelveValidarEnlace.rows[0].reservaUID;
        const datosDetallesReserva = {
            reservaUID: reservaUID
        };
        const reserva = await detallesReserva(datosDetallesReserva);
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