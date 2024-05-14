import { obtenerTodosLosMensjaes } from "../../../../repositorio/configuracion/mensajesPortada/obtenerTodosLosMensajes.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";

export const obtenerMensajes = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const mensajesDePortada = await obtenerTodosLosMensjaes()
        for (const detallesDelMensaje of mensajesDePortada) {
            const bufferObjPreDecode = Buffer.from(detallesDelMensaje.mensaje, "base64");
            detallesDelMensaje.mensaje = bufferObjPreDecode.toString("utf8");
        }
        const ok = {
            ok: mensajesDePortada,
            numeroMensajes: mensajesDePortada.length
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }

}