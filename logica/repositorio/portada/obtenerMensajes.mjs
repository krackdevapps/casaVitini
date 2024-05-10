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
        const resuelveMensajes = await conexion.query(consulta, ["activado"]);
        return resuelveMensajes.rows;
    } catch (errorCapturado) {
        const error = "Error en el adaptador de obtener mensajes"
        throw new Error(error)
    }



}