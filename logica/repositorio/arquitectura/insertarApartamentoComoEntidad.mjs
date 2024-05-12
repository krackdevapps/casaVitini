import { conexion } from "../../componentes/db.mjs";

export const insertarApartamentoComoEntidad = async (data) => {
    try {

        const apartamentoIDV = data.apartamentoIDV
        const apartamentoUI = data.apartamentoUI

        const consulta =  `
        INSERT INTO apartamentos
        (

        apartamento,
        "apartamentoUI"
        )
        VALUES 
        (
        $1,
        $2
        )
        RETURNING apartamento
        `;

        const resuelve = await conexion.query(consulta, [apartamentoIDV, apartamentoUI])
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}