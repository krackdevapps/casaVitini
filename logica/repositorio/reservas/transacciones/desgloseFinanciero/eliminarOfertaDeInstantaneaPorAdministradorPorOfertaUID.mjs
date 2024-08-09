import { conexion } from "../../../../componentes/db.mjs";

export const eliminarOfertaDeInstantaneaPorAdministradorPorOfertaUID = async (data) => {
    try {
        // Ojo por que aqui la posicion empiza a contar desde 1
        const reservaUID = data.reservaUID
        const ofertaUID = data.ofertaUID
        const posicion = data.posicion
        const consulta = `
            WITH consulta_elemento AS (
                SELECT elemento
                FROM jsonb_array_elements(
                         (SELECT "instantaneaOfertasPorAdministrador"
                          FROM "reservaFinanciero"
                          WHERE "reservaUID" = $3)
                     ) WITH ORDINALITY AS arr(elemento, i)
                WHERE elemento->'oferta'->>'ofertaUID' = $1 AND i = $2
            )
            UPDATE "reservaFinanciero"
            SET "instantaneaOfertasPorAdministrador" = (
                SELECT jsonb_agg(elem)
                FROM jsonb_array_elements("instantaneaOfertasPorAdministrador") WITH ORDINALITY AS arr(elem, i)
                WHERE NOT (elem->'oferta'->>'ofertaUID' = $1 AND i = $2)
            )
            WHERE "reservaUID" = $3
            RETURNING (SELECT elemento FROM consulta_elemento);

           `;

        const parametros = [
            ofertaUID,
            posicion,
            reservaUID,
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (!resuelve.rows[0].elemento) {
            const error = "No se encuentra la oferta que quieres eliminar dentro de la reserva. Revisa el reservaUID, ofertaUID y la posicion.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

