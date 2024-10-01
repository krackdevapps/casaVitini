import { conexion } from "../../globales/db.mjs"

export const obtenerMensajePorPosicion = async (posicion) => {
    try {
        const consulta = `
             SELECT 
                 *
             FROM 
                 "mensajesEnPortada"
             WHERE 
                 posicion = $1;
            `;

        const resuelve = await conexion.query(consulta, [posicion]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún mensaje con esa posición.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
