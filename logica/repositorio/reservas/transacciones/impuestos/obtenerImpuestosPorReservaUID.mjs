import { conexion } from "../../../componentes/db.mjs"

export const obtenerImpuestosPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        SELECT
        "nombreImpuesto",
        "tipoImpositivoIDV",
        "tipoValorIDV",
        "calculoImpuestoPorcentaje"
        FROM 
        "reservaImpuestos" 
        WHERE
        "reservaUID" = $1`
        const resuelve = await conexion.query(consulta, [reservaUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

