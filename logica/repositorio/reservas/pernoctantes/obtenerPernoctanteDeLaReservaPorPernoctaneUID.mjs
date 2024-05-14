import { conexion } from "../../../componentes/db.mjs"

export const obtenerPernoctanteDeLaReservaPorPernoctaneUID = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const pernoctanteUID = data.pernoctanteUID

        const consulta =  `
        SELECT 
        * 
        FROM
         "reservaPernoctantes" 
        WHERE
        "reservaUID" = $1 
        AND
        "componenteUID" = $2;`;
        const parametros = [
            reservaUID,
            pernoctanteUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}

