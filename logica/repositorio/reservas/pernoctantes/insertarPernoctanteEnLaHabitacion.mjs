import { conexion } from "../../../componentes/db.mjs"

export const insertarPernoctanteEnLaHabitacion = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const clienteUID = data.clienteUID
        const habitacionUID = data.habitacionUID

        const consulta = `
        INSERT INTO "reservaPernoctantes"
        (
        "reservaUID",
        "habitacionUID",
        "clienteUID"
        )
        VALUES ($1, $2,$3) 
        RETURNING *
        `;
        const parametros = [
            reservaUID,
            habitacionUID,
            clienteUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado el pernoctante en la habitacion.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

