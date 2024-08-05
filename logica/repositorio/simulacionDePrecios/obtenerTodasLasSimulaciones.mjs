import { conexion } from "../../componentes/db.mjs";

export const obtenerTodasLasSimulaciones = async () => {
    try {
        const consulta = `
        SELECT
        "simulacionUID",
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
        `;
        const resuelve = await conexion.query(consulta);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }

}
