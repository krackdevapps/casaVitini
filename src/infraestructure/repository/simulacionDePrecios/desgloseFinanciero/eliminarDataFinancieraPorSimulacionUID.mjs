import { conexion } from "../../globales/db.mjs";

export const eliminarDataFinancieraPorSimulacionUID = async (simulacionUID) => {
    try {
        const consulta = `
        UPDATE
            "simulacionesDePrecio"
        SET 
            "desgloseFinanciero" = null,
            "instantaneaNoches" = null,
            "instantaneaOfertasPorCondicion" = null,
            "instantaneaOfertasPorAdministrador" = null,
            "instantaneaSobreControlPrecios" = null,
            "instantaneaImpuestos" = null
        WHERE 
            "simulacionUID" = $1
        RETURNING *;
        `;
        const resuelve = await conexion.query(consulta, [simulacionUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }

}