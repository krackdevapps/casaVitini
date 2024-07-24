import { conexion } from "../../../../componentes/db.mjs";


export const obtenerImpuestoPorImpuestoUIDPorReservaUID = async (data) => {
    try {
        const impuestoUID = data.impuestoUID
        const reservaUID = data.reservaUID
        const errorSi = data.errorSi
        const consulta = `
        SELECT *
            FROM
            "reservaFinanciero"
            WHERE
            "reservaUID" = $1
            AND EXISTS (
                SELECT 1
                FROM jsonb_array_elements("instantaneaImpuestos") AS impuesto_control
                WHERE impuesto_control ->>'impuestoUID' = $2
            );`
        const parametros = [
            reservaUID,
            impuestoUID
        ]


        const resuelve = await conexion.query(consulta, parametros);
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = "No existe el impuesto en la instantanea de impuestos de la reserva"
                throw new Error(error)
            }
        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe el impuesto en la reserva."
                throw new Error(error)
            }
        } else {
            const error = "Se necesita definir errorSi en obtenerImpuestoPorImpuestoUIDPorReservaUID"
            throw new Error(error)
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

