import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";

export const obtenerMensajes = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const consulta = `
                                SELECT 
                                    uid,
                                    mensaje,
                                    estado,
                                    posicion
                                FROM 
                                    "mensajesEnPortada";
                               `;
        const resuelveMensajes = await conexion.query(consulta);
        const mensajes = resuelveMensajes.rows;
        for (const detallesDelMensaje of mensajes) {
            const bufferObjPreDecode = Buffer.from(detallesDelMensaje.mensaje, "base64");
            detallesDelMensaje.mensaje = bufferObjPreDecode.toString("utf8");
        }
        const ok = {
            ok: mensajes,
            numeroMensajes: resuelveMensajes.rowCount
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }

}