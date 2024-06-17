import { conexion } from "../../../../componentes/db.mjs";

export const insertarDesgloseFinacieroPorReservaUID = async (data) => {
    try {
        const desgloseFinanciero = data.desgloseFinanciero
        const instantaneaNoches = desgloseFinanciero.entidades.reserva.desglosePorNoche
        const instantaneaOfertasPorCondicion = JSON.stringify(desgloseFinanciero.contenedorOfertas.entidades.reserva.ofertas.porCondicion)
        const instantaneaOfertasPorAdministrador = JSON.stringify(desgloseFinanciero.contenedorOfertas.entidades.reserva.ofertas.porAdministrador)
        const reservaUID = data.reservaUID
        const consulta = `
        INSERT INTO
        "reservaFinanciero"
        (
        "desgloseFinanciero",
        "instantaneaNoches",
        "instantaneaOfertasPorCondicion",
        "instantaneaOfertasPorAdministrador",
        "reservaUID"
        )
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *
        `
        const parametros = [
            desgloseFinanciero,
            instantaneaNoches,
            instantaneaOfertasPorCondicion,
            instantaneaOfertasPorAdministrador,
            reservaUID,
        ]
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

