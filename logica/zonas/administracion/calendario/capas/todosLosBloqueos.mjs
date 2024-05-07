import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { eventosTodosLosBloqueos } from "../../../../sistema/calendarios/capas/eventosTodosLosBloqueos.mjs";
import { eliminarBloqueoCaducado } from "../../../../sistema/sistemaDeBloqueos/eliminarBloqueoCaducado.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

export const todosLosBloqueos = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const fecha = entrada.body.fecha;
        validadoresCompartidos.fechas.fechaMesAno(fecha)

        await eliminarBloqueoCaducado();
        const eventos = await eventosTodosLosBloqueos(fecha);
        const ok = {
            ok: "Aqui tienes todos los apartamentos de este mes",
            ...eventos
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        return salida.json(error);
    }
}