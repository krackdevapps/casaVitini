import { conexion } from "../../../../globales/db.mjs";
export const obtenerTareaPorApartamentoIDVPorPosicion = async (data) => {
    try {
        const apartamentoIDV = data.apartamentoIDV
        const posicion = data.posicion

        const consulta = `
        SELECT
        *
        FROM
        protocolos."tareasAlojamiento"
        WHERE
        posicion = $1
        AND
        "apartamentoIDV" = $2;
        `;
        const parametros = [
            posicion,
            apartamentoIDV,
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }

}