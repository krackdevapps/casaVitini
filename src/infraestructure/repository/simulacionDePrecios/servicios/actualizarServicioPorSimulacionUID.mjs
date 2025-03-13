import { conexion } from "../../globales/db.mjs"

export const actualizarServicioPorSimulacionUID = async (data) => {
    try {
        const simulacionUID = data.simulacionUID
        const servicioUID_enSimulacion = data.servicioUID_enSimulacion
        const opcionesSel = data.opcionesSel
        const descuentoTotalServicio = data.descuentoTotalServicio

        const consulta = `
        UPDATE "simulacionesDePrecioServicios"
        SET
        "opcionesSel" = $1,
        "descuentoTotalServicio" = $2
        WHERE
        "simulacionUID" = $3
        AND
        "servicioUID" = $4
        RETURNING *;        `;
        const parametros = [
            opcionesSel,
            descuentoTotalServicio,
            simulacionUID,
            servicioUID_enSimulacion
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const m = "No se ha actualizdo el servicio en la simulación."
            throw new Error(m)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

