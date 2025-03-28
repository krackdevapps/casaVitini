import { conexion } from "../../../../globales/db.mjs";

export const actualizarOrdenDePosicionesTareas = async (data) => {

    try {
        const posicion = data.posicion
        const apartamentoIDV = data.apartamentoIDV

        const consulta = `
        UPDATE protocolos."tareasAlojamiento"
        SET posicion = posicion - 1
        WHERE
        posicion > $1
        AND
        "apartamentoIDV" = $2;
        `;
        const p = [
            posicion,
            apartamentoIDV
        ]
        const resuelve = await conexion.query(consulta, p);

        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
