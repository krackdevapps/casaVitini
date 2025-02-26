import { conexion } from "../../globales/db.mjs"

export const actualizarServicioPorSimulacionUID = async (data) => {
    try {
        const simulacionUID = data.simulacionUID
        const servicioUID_enSimulacion = data.servicioUID_enSimulacion
        const opcionesSel = data.opcionesSel

        const consulta = `
        UPDATE "simulacionesDePrecioServicios"
        SET
        "opcionesSel" = $1
        WHERE
        "simulacionUID" = $2
        AND
        "servicioUID" = $3
        RETURNING *;        `;
        const parametros = [
            opcionesSel,
            simulacionUID,
            servicioUID_enSimulacion
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const m = "No se ha actualizar el servicio en la simulación."
            throw new Error(m)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

