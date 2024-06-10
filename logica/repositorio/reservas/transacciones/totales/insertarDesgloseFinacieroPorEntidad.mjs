import { conexion } from "../../../../componentes/db.mjs";

export const insertarDesgloseFinacieroPorReservaUID = async (data) => {
    try {       
        const desgloseFinanciero = data.desgloseFinanciero
        const reservaUID = data.reservaUID
        const consulta = `
        INSERT INTO
        "reservaDesgloseFinanciero"
        (
        "desgloseFinanciero",
        "reservaUID"
        )
        VALUES ($1,$2)
        `
        const parametros = [
            
            desgloseFinanciero,
            reservaUID
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido insertar el desgloseFinaciero en la reserva.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

