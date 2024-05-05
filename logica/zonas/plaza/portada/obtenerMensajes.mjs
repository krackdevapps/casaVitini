import { conexion } from "../../../componentes/db.mjs";
export const obtenerMensajes = async (entrada, salida) => {
    try {
        const consulta = `
                SELECT 
                    mensaje,
                    posicion
                FROM 
                    "mensajesEnPortada"
                WHERE
                    estado = $1;
               `;
        const resuelveMensajes = await conexion.query(consulta, ["activado"]);
        const mensajes = resuelveMensajes.rows;
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
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }

}