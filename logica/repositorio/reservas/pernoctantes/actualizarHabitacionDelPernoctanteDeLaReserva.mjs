import { conexion } from "../../../componentes/db.mjs"

export const actualizarHabitacionDelPernoctanteDeLaReserva = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const pernoctanteUID = data.pernoctanteUID
        const habitacionUID = data.habitacionUID

        const consulta = `
        UPDATE 
        "reservaPernoctantes"
        SET
        "habitacionUID" = $1
        WHERE
        "reservaUID" = $2 AND "componenteUID" = $3;
        `;
        const parametros = [
            habitacionUID,
            reservaUID,
            pernoctanteUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha cambiado al pernoctane de habitacion";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}

