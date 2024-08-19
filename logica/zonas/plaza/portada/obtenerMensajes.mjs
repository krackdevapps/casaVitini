
import { obtenerMensajes as om } from "../../../repositorio/portada/obtenerMensajes.mjs";
export const obtenerMensajes = async () => {
    try {
        const mensajes = await om()

        for (const detallesDelMensaje of mensajes) {
            const bufferObjPreDecode = Buffer.from(detallesDelMensaje.mensaje, "base64");
            detallesDelMensaje.mensaje = bufferObjPreDecode.toString("utf8");
        }
        mensajes.sort((a, b) => b.posicion - a.posicion);
        const ok = {
            ok: mensajes,
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }

}