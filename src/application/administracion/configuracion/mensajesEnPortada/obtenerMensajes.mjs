import { obtenerTodosLosMensjaes } from "../../../../infraestructure/repository/configuracion/mensajesPortada/obtenerTodosLosMensajes.mjs";
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";


export const obtenerMensajes = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
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
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }

}