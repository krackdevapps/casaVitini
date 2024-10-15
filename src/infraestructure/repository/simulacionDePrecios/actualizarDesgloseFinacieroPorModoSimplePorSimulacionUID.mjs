import _ from "lodash";
import { conexion } from "../globales/db.mjs";
export const actualizarDesgloseFinacieroPorModoSimplePorSimulacionUID = async (data) => {
    try {
        const instantaneaNoches = data.instantaneaNoches
        const instantaneaOfertasPorCondicion = JSON.stringify(data.instantaneaOfertasPorCondicion)
        const instantaneaOfertasPorAdministrador = JSON.stringify(data.instantaneaOfertasPorAdministrador)
        const instantaneaSobreControlPrecios = data.instantaneaSobreControlPrecios
        const simulacionUID = data.simulacionUID
        const consulta = `
        UPDATE
            "simulacionesDePrecio"
        SET 
            "instantaneaNoches" = COALESCE($1::jsonb, "instantaneaNoches"),
            "instantaneaOfertasPorCondicion" = COALESCE($2::jsonb, "instantaneaOfertasPorCondicion"),
            "instantaneaOfertasPorAdministrador" = COALESCE($3::jsonb, "instantaneaOfertasPorAdministrador"),
            "instantaneaSobreControlPrecios" = COALESCE($4::jsonb, "instantaneaSobreControlPrecios")

        WHERE 
            "simulacionUID" = $5
        RETURNING *;
           `;

        const parametros = [
            instantaneaNoches,
            instantaneaOfertasPorCondicion,
            instantaneaOfertasPorAdministrador,
            instantaneaSobreControlPrecios,
            simulacionUID,

        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido insertar el desgloseFinaciero en la simulación.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

