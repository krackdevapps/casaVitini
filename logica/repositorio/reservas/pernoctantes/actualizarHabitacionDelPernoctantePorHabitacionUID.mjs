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
        if (resuelve.rowCount === 0) {
            const error = "No se puede cambiar la habitacion del pernoctante por que no existe la habitacion dentro de la reserva";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

