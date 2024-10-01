import { conexion } from "../../globales/db.mjs"

export const obtenerServicioEnSimulacionPorServicioUID = async (servicioUID_enSimulacion) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM 
        "simulacionesDePrecioServicios" 
        WHERE 
        "servicioUID" = $1`;

        const resuelve = await conexion.query(consulta, [servicioUID_enSimulacion]);
        if (resuelve.rowCount === 0) {
            const error = "No se ha encontrado el servicioUID dentro de la simulacion"
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

