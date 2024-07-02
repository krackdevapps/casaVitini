import { conexion } from "../../../../componentes/db.mjs";
export const obtenerImpuestoPorImpuestoUIDPorReservaUID_simple = async (data) => {
    try {
        const impuestoUID = data.impuestoUID
        const reservaUID = data.reservaUID

        const consulta = `
        SELECT *
            FROM
            "reservaFinanciero"
            WHERE
            "reservaUID" = $1
            AND EXISTS (
                SELECT 1
                FROM jsonb_array_elements("instantaneaImpuestos") AS impuesto_control
                WHERE impuesto_control ->'impuestoUID' = $2
            );`
        const parametros = [
            reservaUID,
            impuestoUID
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

