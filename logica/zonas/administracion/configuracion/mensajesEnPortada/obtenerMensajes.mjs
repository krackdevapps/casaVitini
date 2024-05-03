import { conexion } from "../../../../componentes/db.mjs";

export const obtenerMensajes = async (entrada, salida) => {
    try {
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
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }

}