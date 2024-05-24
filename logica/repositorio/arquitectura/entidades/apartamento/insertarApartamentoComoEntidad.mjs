import { conexion } from "../../../../componentes/db.mjs"

export const insertarApartamentoComoEntidad = async (data) => {
    try {

        const apartamentoIDV = data.apartamentoIDV
        const apartamentoUI = data.apartamentoUI

        const consulta =  `
        INSERT INTO 
        apartamentos
        (
       "apartamentoIDV",
        "apartamentoUI"
        )
        VALUES 
        ( $1, $2 )
        RETURNING 
        "apartamentoIDV"
        `;

        const resuelve = await conexion.query(consulta, [apartamentoIDV, apartamentoUI])
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado el apartamento como entidad"
            throw error
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}