import { conexion } from "../../../componentes/db.mjs"

export const eliminarPernoctanteDeLaHabitacion = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const habitacionUID = data.habitacionUID

        const consulta =  `
        DELETE FROM 
        "reservaPernoctantes"
        WHERE 
        "habitacionUID" = $1 
        AND 
        "reservaUID" = $2;
        `;
        const parametros = [
            habitacionUID,
            reservaUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

