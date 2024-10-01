import { conexion } from "../globales/db.mjs";

export const obtenerMensajes = async () => {
    try {
        const consulta = `
    SELECT 
        mensaje,
        posicion
    FROM 
        "mensajesEnPortada"
    WHERE
        "estadoIDV" = $1;
   `;
        const resuelve = await conexion.query(consulta, ["activado"]);
        return resuelve.rows;
    } catch (errorCapturado) {
        throw errorCapturado
    }



}