import { conexion } from "../../../componentes/db.mjs";


export const obtenerImpuestoPorImpuestoUIDPorSimulacionUID = async (data) => {
    try {
        const simulacionUID = data.simulacionUID
        const impuestoUID = data.impuestoUID
        const errorSi = data.errorSi
        const consulta = `
        SELECT *
            FROM
            "simulacionesDePrecio"
            WHERE
            "simulacionUID" = $1
            AND EXISTS (
                SELECT 1
                FROM jsonb_array_elements("instantaneaImpuestos") AS impuesto_control
                WHERE impuesto_control ->>'impuestoUID' = $2
            );`
        const parametros = [
            simulacionUID,
            impuestoUID
            
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = "No existe el impuesto en la instantanea de impuestos de la simulacion"
                throw new Error(error)
            }
        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe el impuesto en la simulacion."
                throw new Error(error)
            }
        } else {
            const error = "Se necesita definir errorSi en obtenerImpuestoPorImpuestoUIDPorSimulacionUID"
            throw new Error(error)
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

