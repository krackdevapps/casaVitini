import { conexion } from "../../../../componentes/db.mjs";


export const obtenerDesgloseFinancieroPorReservaUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion = async (data) => {
    try {
        const ofertaUID = data.ofertaUID
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
                FROM jsonb_array_elements("instantaneaOfertasPorCondicion") AS oferta_control
                WHERE oferta_control ->'oferta'->>'ofertaUID' = $2
            );`
        const parametros = [
            reservaUID,
            ofertaUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = "No existe la oferta en la instantanea de ofertas por condicion de la reserva"
                throw new Error(error)
            }
        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe esta oferta en la seccion de ofertas por condicion dentro de esta reserva. Si quieres volver a aplicar esta oferta por favor usa el boton Insertar descuentos, para insertarla libremente."
                throw new Error(error)
            }
        } else {
            const error = "Se necesita definir errorSi en obtenerDesgloseFinancieroPorReservaUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion"
            throw new Error(error)
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

