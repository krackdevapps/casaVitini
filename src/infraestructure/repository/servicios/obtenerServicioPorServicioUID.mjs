import { conexion } from "../globales/db.mjs";
export const obtenerServicioPorServicioUID = async (servicioUID) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM 
        servicios 
        WHERE 
        "servicioUID" = $1`;
        const resuelve = await conexion.query(consulta, [servicioUID])
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún servicio con ese servicioUID";
            throw new Error(error)
        }
        return resuelve.rows[0]

    } catch (errorCapturado) {
        throw errorCapturado
    }
}
