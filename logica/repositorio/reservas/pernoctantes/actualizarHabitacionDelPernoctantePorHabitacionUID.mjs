import { conexion } from "../../../componentes/db.mjs"

export const actualizarHabitacionDelPernoctantePorHabitacionUID = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const habitacionUID = data.habitacionUID

        const consulta = `
        UPDATE
         "reservaPernoctantes"
        SET 
        "habitacionUID" = NULL
        WHERE 
        "reservaUID" = $1 
        AND 
        "habitacionUID" = $2;
        `;
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

