import { conexion } from "../../../../componentes/db.mjs";

export const insertarEnInstantaneaOfertasPorCondicion = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const oferta = data.oferta
        const consulta = `
        UPDATE
        "reservaFinanciero"
        SET
        "instantaneaOfertasPorCondicion" = jsonb_set(
            "instantaneaOfertasPorCondicion",
            '{}',
            ("instantaneaOfertasPorCondicion" || $1::jsonb),
            true
            )
            WHERE "reservaUID" = S2
            RETURNING *;
           `;

        const parametros = [
            reservaUID,
            oferta
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido insertar la nueva oferta en la instantaneaOfertasPorCondicion";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

