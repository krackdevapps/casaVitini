import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerMensajes as om } from "../../../repositorio/portada/obtenerMensajes.mjs";
export const obtenerMensajes = async (entrada, salida) => {
    try {
        const mensajes = om()
        for (const detallesDelMensaje of mensajes) {
            const bufferObjPreDecode = Buffer.from(detallesDelMensaje.mensaje, "base64");
            detallesDelMensaje.mensaje = bufferObjPreDecode.toString("utf8");
        }
        mensajes.sort((a, b) => b.posicion - a.posicion);
        const ok = {
            ok: mensajes,
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }

}