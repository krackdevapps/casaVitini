import { conexion } from "../../../globales/db.mjs";

export const obtenerDetallesImpuestoDeInstantaneaImpuestos = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const impuestoUID = data.impuestoUID

        const consulta = `
        SELECT
        instantanea
        FROM 
        "reservaFinanciero" ,
        jsonb_array_elements("instantaneaInpuestos") AS instantanea
        WHERE
        "reservaUID" = $1
        AND
        instantanea->>'impuestoUID' = $2;`
        const parametros = [
            reservaUID,
            impuestoUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún impuesto en la instantánea de impuesto de la reserva."
            throw new Error(error)
        }
        return resuelve.rows[0]

    } catch (errorCapturado) {
        throw errorCapturado
    }
}

