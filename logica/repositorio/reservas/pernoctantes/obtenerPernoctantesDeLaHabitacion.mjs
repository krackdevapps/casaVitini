import { conexion } from "../../../componentes/db.mjs"

export const obtenerPernoctantesDeLaHabitacion = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const habitacionUID = data.habitacionUID

        const consulta = `
        SELECT 
        "componenteUID",
        "reservaUID",
        "habitacionUID",
        "clienteUID",
        to_char("fechaCheckIn", 'YYYY-MM-DD'), 
        to_char("fechaCheckOutAdelantado", 'YYYY-MM-DD')
        FROM
         "reservaPernoctantes" 
        WHERE
        "reservaUID" = $1 
        AND
        "habitacionUID" = $2;`;
        const parametros = [
            reservaUID,
            habitacionUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

