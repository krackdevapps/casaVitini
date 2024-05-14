import { conexion } from "../../../componentes/db.mjs"

export const eliminarMensajeEnPortada = async (mensajeUID) => {
    try {
        const consulta = `
        DELETE FROM "mensajesEnPortada"
        WHERE uid = $1;
        `;

        const resuelve = await conexion.query(consulta, [mensajeUID]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningun mensaje con ese UID que eliminar";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}
