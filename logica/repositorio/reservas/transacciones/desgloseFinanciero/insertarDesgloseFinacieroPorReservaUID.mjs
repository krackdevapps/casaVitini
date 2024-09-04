import _ from "lodash";
import { conexion } from "../../../../componentes/db.mjs";

export const insertarDesgloseFinacieroPorReservaUID = async (data) => {
    try {
        const desgloseFinanciero = data.desgloseFinanciero
        const instantaneaNoches = _.cloneDeep(desgloseFinanciero.entidades.reserva.instantaneaNoches);
        delete desgloseFinanciero.entidades.reserva.instantaneaNoches

        const instantaneaImpuestos = JSON.stringify(_.cloneDeep(desgloseFinanciero.impuestos));
        //delete desgloseFinanciero.impuestos

        const instantaneaOfertasPorCondicion = JSON.stringify(desgloseFinanciero.contenedorOfertas.ofertas.porCondicion)
        const instantaneaOfertasPorAdministrador = JSON.stringify(desgloseFinanciero.contenedorOfertas.ofertas.porAdministrador)

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

