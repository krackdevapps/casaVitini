import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { crearEnlacePDF } from "../../../sistema/pdf/crearEnlacePDF.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const crearEnlacesPDF = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const reserva = entrada.body.reserva;
        await validadoresCompartidos.reservas.validarReserva(reserva);
        
        const enlaces = await crearEnlacePDF(reserva);
        const ok = {
            ok: "ok",
            enlaces: enlaces
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}