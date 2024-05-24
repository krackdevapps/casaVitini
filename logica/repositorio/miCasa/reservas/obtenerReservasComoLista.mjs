import { conexion } from "../../../componentes/db.mjs"

export const obtenerReservasComoLista = async (data) => {
    try {
        const reservasUID = data.reservasUID
        const numeroPorPagina = data.numeroPorPagina
        const paginaActualSQL = Number(numeroPorPagina - 1)
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
                "reservaUID",
                to_char("fechaEntrada", 'DD/MM/YYYY') as "fechaEntrada",
                to_char("fechaSalida", 'DD/MM/YYYY') as "fechaSalida",
                "estadoReservaIDV", 
                "estadoPagoIDV", 
                to_char("fechaCreacion", 'DD/MM/YYYY') as "fechaCreacion",
                COUNT(*) OVER() as total_filas
        FROM
                reservas
        WHERE
            ($1::int[] IS NOT NULL AND "reservaUID" = ANY($1::int[])) 
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
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

