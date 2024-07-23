import { conexion } from "../../../componentes/db.mjs"

export const actualizaApartamentoPorApartamentoIDVPorReservaUID = async (data) => {
    try {
        const reservasUIDArray = data.reservasUIDArray
        const antiguoApartamentoIDV = data.antiguoApartamentoIDV
        const nuevoApartamentoIDV = data.nuevoApartamentoIDV
        const apartamentoUI = data.apartamentoUI
        const consulta = `
        UPDATE "reservaApartamentos"
        SET
        "apartamentoIDV" = $1,
        "apartamentoUI" = $2
        WHERE
        "reservaUID" = ANY($3)
        AND 
        "apartamentoIDV" = $4
        RETURNING *;`;
        const parametros = [
            nuevoApartamentoIDV,
            apartamentoUI,
            reservasUIDArray,
            antiguoApartamentoIDV
        ]
        const resuelve = await conexion.query(consulta, parametros);

        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

