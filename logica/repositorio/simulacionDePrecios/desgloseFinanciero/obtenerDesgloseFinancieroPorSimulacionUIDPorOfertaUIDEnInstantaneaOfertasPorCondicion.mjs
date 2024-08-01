import { conexion } from "../../../componentes/db.mjs";


export const obtenerDesgloseFinancieroPorSimulacionUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion = async (data) => {
    try {
        const ofertaUID = data.ofertaUID
        const simulacionUID = data.simulacionUID
        const errorSi = data.errorSi

        const consulta = `
        SELECT *
            FROM
            "simulacionesDePrecio"
            WHERE
            "simulacionUID" = $1
            AND EXISTS (
                SELECT 1
                FROM jsonb_array_elements("instantaneaOfertasPorCondicion") AS oferta_control
                WHERE oferta_control ->'oferta'->>'ofertaUID' = $2
            );`
        const parametros = [
            simulacionUID,
            ofertaUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = "No existe la oferta en la instantanea de ofertas por condicion de la simulacionesDePrecio"
                throw new Error(error)
            }
        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe esta oferta en la seccion de ofertas por condicion dentro de esta simulacionesDePrecio. Si quieres volver a aplicar esta oferta por favor usa el boton Insertar descuentos, para insertarla libremente."
                throw new Error(error)
            }
        } else {
            const error = "Se necesita definir errorSi en obtenerDesgloseFinancieroPorsimulacionUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion"
            throw new Error(error)
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

