import { conexion } from "../../globales/db.mjs"
export const obtenerReservasComoLista = async (data) => {
    try {
        const reservasUIDArray = data.reservasUIDArray
        const numeroPorPagina = data.numeroPorPagina
        const paginaActualSQL = data.paginaActualSQL

        const sentidoColumna = data.sentidoColumna
        const nombreColumna = data?.nombreColumna

        const sentidoColumnaSQLFiltro = (sentidoColumna) => {
            if (sentidoColumna === "ascendente") {
                return "ASC"
            } else if (sentidoColumna === "descendente") {
                return "DESC"
            } else {
                return "ASC"
            }
        }

        const constructorSQL = (nombreColumna, sentidoColumna) => {
            const sentidoColumnaSQL = sentidoColumnaSQLFiltro(sentidoColumna)

            const ordenColumnaSQL = `
            ORDER BY 
            "${nombreColumna}" ${sentidoColumnaSQL}`
            if (nombreColumna) {
                return ordenColumnaSQL
            } else {
                return ""
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
        "reservaUID" = ANY($1::int[])
        ${constructorSQL(nombreColumna, sentidoColumna)}
        LIMIT
           $2
        OFFSET
            $3;`;
        const parametros = [
            reservasUIDArray,
            numeroPorPagina,
            paginaActualSQL
        ];

        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

