import { obtenerTodosLosMensjaes } from "../../../../infraestructure/repository/configuracion/mensajesPortada/obtenerTodosLosMensajes.mjs";



export const obtenerMensajes = async (entrada, salida) => {
    try {


        const mensajesDePortada = await obtenerTodosLosMensjaes()
        for (const detallesDelMensaje of mensajesDePortada) {
            const bufferObjPreDecode = Buffer.from(detallesDelMensaje.mensaje, "base64");
            detallesDelMensaje.mensaje = bufferObjPreDecode.toString("utf8");
        }
        const ok = {
            ok: mensajesDePortada,
            numeroMensajes: mensajesDePortada.length
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }

}