import { conexion } from "../../../componentes/db.mjs"

export const actualizarPernoctantePoolPorClienteUID = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const pernoctanteUID = data.pernoctanteUID
        const clienteUID = data.clienteUID

        const consulta = `
        UPDATE "reservaPernoctantes"
        SET "clienteUID" = $1
        WHERE 
        "pernoctanteUID" = $2 AND
        reserva = $3
        RETURNING
        habitacion;`;
        const parametros = [
            clienteUID,
            pernoctanteUID,
            reservaUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido actualizar al pernoctante en la reserva.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

