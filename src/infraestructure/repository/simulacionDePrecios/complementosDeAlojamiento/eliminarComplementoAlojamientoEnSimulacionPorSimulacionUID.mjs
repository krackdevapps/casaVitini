import { conexion } from "../../globales/db.mjs"

export const eliminarComplementoAlojamientoEnSimulacionPorSimulacionUID = async (complementoUID_enSimulacion) => {
    try {
        const consulta = `
        DELETE FROM 
        "simulacionesDePrecioComplementosAlojamiento"
        WHERE 
        "complementoUID" = $1
        RETURNING *;
        `;

        const resuelve = await conexion.query(consulta, [complementoUID_enSimulacion]);
        if (resuelve.rowCount === 0) {
            const error = "No se ha encontrado el complementoUID dentro de la simulación"
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

