import { conexion } from "../../../../componentes/db.mjs";

export const insertarImpuestoPorReservaUID = async (data) => {
    try {

        const reservaUID = data.reservaUID
        const impuesto = data.impuesto

        const consulta = `
        UPDATE 
        "reservaFinanciero"
        SET 
        "instantaneaImpuestos" = COALESCE(
            "instantaneaImpuestos", '[]'::jsonb
                ) || $2
        WHERE "reservaUID" = $1;
        `
        const parametros = [
            reservaUID,
            impuesto
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido insertar el impuesto en la reserva.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

