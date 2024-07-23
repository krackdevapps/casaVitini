import { obtenerTodosLosInterruptores } from "../../../../repositorio/configuracion/interruptores/obtenerTodosLosInterruptores.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";


export const obtenerInterruptores = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const interruptores = await obtenerTodosLosInterruptores()
        const ok = { ok: {} };
        for (const parConfiguracion of interruptores) {
            const interruptorIDV = parConfiguracion.interruptorIDV;
            const estado = parConfiguracion.estadoIDV || "";
            ok.ok[interruptorIDV] = estado;
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }

}