import { conexion } from "../../globales/db.mjs"

export const obtenerTodosLosPernoctantesDeLaReserva = async (reservaUID) => {
    try {
        const consulta = `
        SELECT 
        "componenteUID",
        "reservaUID",
        "habitacionUID",
        "clienteUID",
        to_char("fechaCheckIn", 'YYYY-MM-DD') as "fechaCheckIn", 
        to_char("fechaCheckOutAdelantado", 'YYYY-MM-DD') as "fechaCheckOutAdelantado"
        FROM
         "reservaPernoctantes" 
        WHERE
        "reservaUID" = $1;`;
        const resuelve = await conexion.query(consulta, [reservaUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

