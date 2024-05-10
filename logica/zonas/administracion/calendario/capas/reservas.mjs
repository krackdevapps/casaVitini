import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { eventosReservas } from "../../../../sistema/calendarios/capas/eventosReservas.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";

export const reservas = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const fecha = entrada.body.fecha;
        validadoresCompartidos.fechas.fechaMesAno(fecha)

        const eventos = await eventosReservas(fecha);
        const ok = {
            ok: "Aqui tienes las reservas de este mes",
            ...eventos
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}