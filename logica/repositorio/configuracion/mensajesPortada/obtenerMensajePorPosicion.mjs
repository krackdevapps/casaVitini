import { conexion } from "../../../componentes/db.mjs"

export const obtenerMensajePorPosicion = async (posicion) => {
    try {
        const consulta =  `
             SELECT 
                 *
             FROM 
                 "mensajesEnPortada"
             WHERE 
                 posicion = $1;
            `;

        const resuelve = await conexion.query(consulta, [posicion]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningun mensaje con esa posicion";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
