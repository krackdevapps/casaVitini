import { conexion } from "../../../../componentes/db.mjs";


export const obtenerDetalleNochePorFechaNochePorApartamentoIDV = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const fechaNoche = data.fechaNoche
        const apartamentoIDV = data.apartamentoIDV

        const consulta = `
        SELECT *
            FROM
            "reservaFinanciero"
            WHERE
            "reservaUID" = $1
            AND EXISTS (
                SELECT 1
                FROM jsonb_array_elements("instantaneaNoches") AS instantanea
                WHERE instantanea -> $2->>'ofertaUID' = $2
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

