import { conexion } from "../../../componentes/db.mjs"

export const obtenerReservasComoLista = async (data) => {
    try {
        const reservasUID = data.reservasUID
        const numeroPorPagina = data.numeroPorPagina
        const paginaActualSQL = data.paginaActualSQL
        const sentidoColumna = data.sentidoColumna
        const nombreColumna = data.nombreColumna

        const sentidoColumnaSQLFiltro = (sentidoColumna) => {
            if (sentidoColumna === "ascendente") {
                return "ASC"
            }
            if (sentidoColumna === "descendente") {
                return "DESC"
            }
        }


        const constructorSQL = (nombreColumna, sentidoColumna) => {
            const sentidoColumnaSQL = sentidoColumnaSQLFiltro(sentidoColumna)

            const ordenColumnaSQL = `
            ORDER BY 
            "${nombreColumna}" ${sentidoColumnaSQL}`
            if (nombreColumna) {
                return ordenColumnaSQL
            }
        }
        const consulta = `
        SELECT 
                reserva,
                to_char(entrada, 'DD/MM/YYYY') as entrada,
                to_char(salida, 'DD/MM/YYYY') as salida,
                "estadoReserva", 
                "estadoPago", 
                to_char(creacion, 'DD/MM/YYYY') as creacion,
                COUNT(*) OVER() as total_filas
        FROM
                reservas
        WHERE
            ($1::int[] IS NOT NULL AND reserva = ANY($1::int[])) 
        ${constructorSQL(nombreColumna, sentidoColumna)}
        LIMIT
            $2
        OFFSET
            $3;`;
        const parametros = [
            reservasUID,
            numeroPorPagina,
            paginaActualSQL
        ];
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (error) {
        throw error
    }
}

