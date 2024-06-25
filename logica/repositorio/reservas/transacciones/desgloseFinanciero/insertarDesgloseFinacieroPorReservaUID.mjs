import _ from "lodash";
import { conexion } from "../../../../componentes/db.mjs";

export const insertarDesgloseFinacieroPorReservaUID = async (data) => {
    try {
        const desgloseFinanciero = data.desgloseFinanciero
        const instantaneaNoches = _.cloneDeep(desgloseFinanciero.entidades.reserva.instantaneaNoches);
        delete desgloseFinanciero.entidades.reserva.instantaneaNoches
        const instantaneaOfertasPorCondicion = JSON.stringify(desgloseFinanciero.contenedorOfertas.entidades.reserva.ofertas.porCondicion)
        const instantaneaOfertasPorAdministrador = JSON.stringify(desgloseFinanciero.contenedorOfertas.entidades.reserva.ofertas.porAdministrador)
        const instantaneaImpuestos = JSON.stringify(desgloseFinanciero.impuestos)
        
        const reservaUID = data.reservaUID
        const consulta = `
        INSERT INTO
        "reservaFinanciero"
        (
        "desgloseFinanciero",
        "instantaneaNoches",
        "instantaneaOfertasPorCondicion",
        "instantaneaOfertasPorAdministrador",
        "instantaneaImpuestos",
        "reservaUID"
        )
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING *
        `
        const parametros = [
            desgloseFinanciero,
            instantaneaNoches,
            instantaneaOfertasPorCondicion,
            instantaneaOfertasPorAdministrador,
            instantaneaImpuestos,
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

