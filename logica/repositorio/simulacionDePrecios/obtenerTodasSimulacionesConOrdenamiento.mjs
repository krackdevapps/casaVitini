import { conexion } from "../../componentes/db.mjs";

export const obtenerTodasSimulacionesConOrdenamiento = async (data) => {
    try {

        const nombreColumna = data.nombreColumna
        const sentidoColumna = data.sentidoColumna
        const numeroPagina = Number((data.numeroPagina - 1) + "0");
        const numeroPorPagina = data.numeroPorPagina

        const constructosSQL = (nombreColumna, sentidoColumna) => {
            if (nombreColumna) {
                const sentidoColumnaSQL = sentidoColumna === "descendente" ? "DESC" : "ASC"
                const ordenamientoFinal = `
                 ORDER BY 
                 "${nombreColumna}" ${sentidoColumnaSQL}
                 `;
                return ordenamientoFinal
            } else {
                return "";
            }
        }

        const consulta = `
        SELECT
        "simulacionUID",
        nombre,
        to_char("fechaCreacion", 'YYYY-MM-DD') as "fechaCreacion",
        to_char("fechaEntrada", 'YYYY-MM-DD') as "fechaEntrada",
        to_char("fechaSalida", 'YYYY-MM-DD') as "fechaSalida",
        COUNT(*) OVER() as total_filas
        FROM 
        "simulacionesDePrecio"
        ${constructosSQL(nombreColumna, sentidoColumna)}
        LIMIT $1
        OFFSET $2;  
        `;
        const parametros = [
            numeroPorPagina,
            numeroPagina
        ]
        const resuelve = await conexion.query(consulta, parametros);
        const resultados = {
            totalFilas: resuelve?.rows[0]?.total_filas ? resuelve.rows[0].total_filas : 0,
            resultados: resuelve.rows
        }
        return resultados
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}