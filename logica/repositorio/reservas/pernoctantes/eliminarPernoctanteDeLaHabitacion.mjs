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
        if (resuelve.rowCount === 0) {
            const error = "No se ha elimnado el pernoctante de la habitacion por que no se encuentra.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

