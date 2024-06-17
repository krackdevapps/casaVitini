import { conexion } from "../../../../componentes/db.mjs";

export const actualizarDesgloseFinacieroPorReservaUID = async (data) => {
    try {

        const desgloseFinanciero = data.desgloseFinanciero
        const instantaneaNoches = desgloseFinanciero.entidades.reserva.desglosePorNoche
        const instantaneaOfertasPorCondicion = JSON.stringify(desgloseFinanciero.contenedorOfertas.entidades.reserva.ofertas.porCondicion)
        const instantaneaOfertasPorAdministrador = JSON.stringify(desgloseFinanciero.contenedorOfertas.entidades.reserva.ofertas.porAdministrador)

        const preciosAlterados = JSON.stringify([])
        const reservaUID = data.reservaUID
        const consulta = `
        UPDATE
            "reservaFinanciero"
        SET 
            "desgloseFinanciero" = COALESCE($1, "desgloseFinanciero"),
            "instantaneaNoches" = COALESCE($2, "instantaneaNoches"),
            "instantaneaOfertasPorCondicion" = COALESCE($3, "instantaneaOfertasPorCondicion"),
            "instantaneaOfertasPorAdministrador" = COALESCE($4, "instantaneaOfertasPorAdministrador"),
            "preciosAlterados" = COALESCE($5, "preciosAlterados")
        WHERE 
            "reservaUID" = $6
        RETURNING *;
           `;

        const parametros = [
            desgloseFinanciero,
            instantaneaNoches,
            instantaneaOfertasPorCondicion,
            instantaneaOfertasPorAdministrador,
            preciosAlterados,
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

