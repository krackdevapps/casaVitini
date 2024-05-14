import { conexion } from "../../../componentes/db.mjs"

export const eliminarCalendarioSincronizadoPorCalendarioUID = async (calendarioUID) => {
    try {
        const consulta = `
        DELETE FROM "calendariosSincronizados"
        WHERE uid = $1;
        `;

        const resuelve = await conexion.query(consulta, [calendarioUID]);
        if (resuelve.rowCount === 0) {
            const error = "No se ha eliminado el calendario sincronizado";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}
