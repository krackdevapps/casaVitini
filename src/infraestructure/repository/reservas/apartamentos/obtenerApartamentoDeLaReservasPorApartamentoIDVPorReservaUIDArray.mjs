import { conexion } from "../../globales/db.mjs"

export const obtenerApartamentoDeLaReservasPorApartamentoIDVPorReservaUIDArray = async (data) => {
    try {
        const reservaUIDArray = data.reservaUIDArray
        const apartamentoIDV = data.apartamentoIDV

        const consulta = `
        SELECT 
        *
        FROM "reservaApartamentos"
        WHERE 
        "reservaUID" = ANY($1)
        AND 
        "apartamentoIDV" = $2
        `;
        const parametros = [
            reservaUIDArray,
            apartamentoIDV
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

