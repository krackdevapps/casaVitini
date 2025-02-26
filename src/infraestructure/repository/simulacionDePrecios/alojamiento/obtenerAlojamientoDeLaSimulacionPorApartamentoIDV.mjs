import { conexion } from "../../globales/db.mjs";

export const obtenerAlojamientoDeLaSimulacionPorApartamentoIDV = async (data) => {
    try {
        const apartamentoIDV = data.apartamentoIDV
        const simulacionUID = data.simulacionUID
        const consulta = `
        SELECT
        *
        FROM
        "simulacionesDePrecioAlojamiento"
        WHERE
        "simulacionUID" = $1
        AND
        "apartamentoIDV" = $2;
        `;
        const parametros = [
            simulacionUID,
            apartamentoIDV
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
