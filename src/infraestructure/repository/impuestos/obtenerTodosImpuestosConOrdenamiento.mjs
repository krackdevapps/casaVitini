import { conexion } from "../globales/db.mjs";

export const obtenerTodosImpuestosConOrdenamiento = async (data) => {
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
        "impuestoUID",
        nombre,
        "tipoImpositivo",
        "tipoValorIDV",
        "entidadIDV",
        "estadoIDV",
        COUNT(*) OVER() as total_filas
        FROM 
        impuestos
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