import { conexion } from "../../componentes/db.mjs";

export const obtenerSimulacionPorSimulacionUID = async (simulacionUID) => {
    try {
        const consulta = `
        SELECT
        uid,
        "desgloseFinanciero",
        "instantaneaNoches",
        "instantaneaSobreControlPrecios",
        "instantaneaOfertasPorCondicion",
        "instantaneaOfertasPorAdministrador",
        "instantaneaImpuestos",
        "nombre",
        to_char("fechaCreacion", 'YYYY-MM-DD') as "fechaCreacion", 
        to_char("fechaEntrada", 'YYYY-MM-DD') as "fechaEntrada", 
        to_char("fechaSalida", 'YYYY-MM-DD') as "fechaSalida",
        "apartamentosIDVARRAY"
        FROM
        "simulacionesDePrecio"
        WHERE
        uid = $1;
        `;
        const resuelve = await conexion.query(consulta, [simulacionUID]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ninguna simulacion con ese simulacionUID";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }

}
