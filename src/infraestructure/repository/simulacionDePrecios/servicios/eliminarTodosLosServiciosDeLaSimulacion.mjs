import { conexion } from "../../globales/db.mjs"

export const eliminarTodosLosServiciosDeLaSimulacion = async (simulacionUD) => {
    try {
        const consulta = `
        DELETE FROM 
        "simulacionesDePrecioServicios"
        WHERE 
        "simulacionUID" = $1;
        `;

        const resuelve = await conexion.query(consulta, [simulacionUD]);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

