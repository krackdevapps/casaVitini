import { conexion } from "../../globales/db.mjs";

export const insertarDescuentoPorReservaUID = async (data) => {
    try {

        const reservaUID = data.reservaUID
        const descuentoDedicado = data.descuentoDedicado

        const consulta = `
        UPDATE 
        "reservaFinanciero"
        SET 
        "instantaneaOfertasPorAdministrador" = COALESCE(
            "instantaneaOfertasPorAdministrador", '[]'::jsonb
                ) || $2
        WHERE "reservaUID" = $1;
        `
        const parametros = [
            reservaUID,
            descuentoDedicado
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

