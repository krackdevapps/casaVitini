import { conexion } from "../../globales/db.mjs"

export const obtenerPernoctantesSinHabitacion = async (reservaUID) => {
    try {

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
        "habitacionUID" = NULL;`;
        const resuelve = await conexion.query(consulta, [reservaUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

