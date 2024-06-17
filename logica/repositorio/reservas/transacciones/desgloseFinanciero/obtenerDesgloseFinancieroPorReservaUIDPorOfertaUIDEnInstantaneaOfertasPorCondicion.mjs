import { conexion } from "../../../../componentes/db.mjs";


export const obtenerDesgloseFinancieroPorReservaUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion = async (data) => {
    try {
        const ofertaUID = data.ofertaUID
        const reservaUID = data.reservaUID
        const consulta = `
        SELECT *
            FROM
            "reservaFinanciero"
            WHERE
            "reservaUID" = $1
            AND EXISTS (
                SELECT 1
                FROM jsonb_array_elements("instantaneaOfertasPorCondicion") AS oferta_control
                WHERE oferta_control ->'oferta'->>'ofertaUID' = $2
            );`
        const parametros = [
            reservaUID,
            ofertaUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount > 0) {
            const error = "Ya existe esta oferta en la seccion de ofertas por condicion dentro de esta reserva. Si quieres volver a aplicar esta oferta por favor usa el boton Insertar descuentos, para insertarla libremente."
            throw new Error(error)
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

