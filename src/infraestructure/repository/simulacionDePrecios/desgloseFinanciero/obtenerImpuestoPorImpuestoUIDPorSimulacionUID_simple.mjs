import { conexion } from "../../globales/db.mjs";
export const obtenerImpuestoPorImpuestoUIDPorSimulacionUID_simple = async (data) => {
    try {
        const simulacionUID = data.simulacionUID
        const reservaUID = data.reservaUID

        const consulta = `
        SELECT *
            FROM
            "simulacionesDePrecio"
            WHERE
            "reservaUID" = $1
            AND EXISTS (
                SELECT 1
                FROM jsonb_array_elements("instantaneaImpuestos") AS impuesto_control
                WHERE impuesto_control ->'simulacionUID' = $2
            );`
        const parametros = [
            reservaUID,
            simulacionUID
        ]

        const resuelve = await conexion.query(consulta, parametros);

        if (resuelve.rowCount === 0) {
            return false
        } else if (resuelve.rowCount > 0) {
            return true
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

