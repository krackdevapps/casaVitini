import { crearEnlacePDF } from "../../../sistema/sistemaDePDF/crearEnlacePDF.mjs";

export const crearEnlacesPDF = async (entrada, salida) => {
    try {
        const reserva = entrada.body.reserva;
        const enlaces = await crearEnlacePDF(reserva);
        const ok = {
            ok: "ok",
            enlaces: enlaces
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}