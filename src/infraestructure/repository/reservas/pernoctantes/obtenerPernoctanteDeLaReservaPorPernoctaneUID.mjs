import { conexion } from "../../globales/db.mjs"

export const obtenerPernoctanteDeLaReservaPorPernoctaneUID = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const pernoctanteUID = data.pernoctanteUID

        const consulta = `
        SELECT 
        "componenteUID",
        "reservaUID",
        "habitacionUID",
        "clienteUID",
        to_char("fechaCheckIn", 'YYYY-MM-DD') AS "fechaCheckIn", 
        to_char("fechaCheckOutAdelantado", 'YYYY-MM-DD') AS "fechaCheckOutAdelantado"
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
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

