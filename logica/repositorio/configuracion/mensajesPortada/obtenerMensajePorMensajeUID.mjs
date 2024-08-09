import { conexion } from "../../../componentes/db.mjs"

export const obtenerMensajePorMensajeUID = async (mensajeUID) => {
    try {
        const consulta = `
               SELECT 
                   *
               FROM 
                   "mensajesEnPortada"
               WHERE 
                   "mensajeUID" = $1;
            `;

        const resuelve = await conexion.query(consulta, [mensajeUID]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún mensaje con ese UID";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
