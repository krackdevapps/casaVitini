import { conexion } from "../../../componentes/db.mjs"

export const actualizaCamaPorCamaIDVPorReservaUID = async (data) => {
    try {
        const reservasUIDArray = data.reservasUIDArray
        const antiguoCamaIDV = data.antiguoCamaIDV
        const nuevoCamaIDV = data.nuevoCamaIDV
        const camaUI = data.camaUI
        const consulta = `
        UPDATE "reservaCamas"
        SET
        "camaIDV" = $1,
        "camaUI" = $2
        WHERE
        "reservaUID" = ANY($3)
        AND 
        "camaIDV" = $4;`;
        const parametros = [
            nuevoCamaIDV,
            camaUI,
            reservasUIDArray,
            antiguoCamaIDV
        ]


        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

