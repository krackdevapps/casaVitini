import { conexion } from "../../componentes/db.mjs";

export const obtenerMensajes = async () => {
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
        const resuelve = await conexion.query(consulta, ["activado"]);
        return resuelve.rows;
    } catch (error) {     
        throw error
    }



}