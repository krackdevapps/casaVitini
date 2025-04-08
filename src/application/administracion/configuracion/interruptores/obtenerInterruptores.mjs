import { obtenerTodosLosInterruptores } from "../../../../infraestructure/repository/configuracion/interruptores/obtenerTodosLosInterruptores.mjs";



export const obtenerInterruptores = async (entrada, salida) => {
    try {



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