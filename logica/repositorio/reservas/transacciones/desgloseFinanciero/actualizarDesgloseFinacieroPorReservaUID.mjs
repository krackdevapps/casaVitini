import _ from "lodash";
import { conexion } from "../../../../componentes/db.mjs";

export const actualizarDesgloseFinacieroPorReservaUID = async (data) => {
    try {

        const desgloseFinanciero = data.desgloseFinanciero
        const instantaneaNoches = _.cloneDeep(desgloseFinanciero.entidades.reserva.instantaneaNoches);
        delete desgloseFinanciero.entidades.reserva.instantaneaNoches

        const instantaneaOfertasPorCondicion = JSON.stringify(desgloseFinanciero.contenedorOfertas.entidades.reserva.ofertas.porCondicion)
        const instantaneaOfertasPorAdministrador = JSON.stringify(desgloseFinanciero.contenedorOfertas.entidades.reserva.ofertas.porAdministrador)
        const instantaneaSobreControlPrecios = desgloseFinanciero.entidades.reserva.contenedorSobreControles
        const reservaUID = data.reservaUID
        const consulta = `
        UPDATE
            "reservaFinanciero"
        SET 
            "desgloseFinanciero" = COALESCE($1, "desgloseFinanciero"),
            "instantaneaNoches" = COALESCE($2, "instantaneaNoches"),
            "instantaneaOfertasPorCondicion" = COALESCE($3, "instantaneaOfertasPorCondicion"),
            "instantaneaOfertasPorAdministrador" = COALESCE($4, "instantaneaOfertasPorAdministrador"),
            "instantaneaSobreControlPrecios" = COALESCE($5, "instantaneaSobreControlPrecios")
        WHERE 
            "reservaUID" = $6
        RETURNING *;
           `;

        const parametros = [
            desgloseFinanciero,
            instantaneaNoches,
            instantaneaOfertasPorCondicion,
            instantaneaOfertasPorAdministrador,
            instantaneaSobreControlPrecios,
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

