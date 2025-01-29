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
                to_char("fechaEntrada", 'YYYY-MM-DD') as "fechaEntrada",
                to_char("fechaSalida", 'YYYY-MM-DD') as "fechaSalida",
                "estadoReservaIDV", 
                "estadoPagoIDV", 
                to_char("fechaCreacion", 'YYYY-MM-DD') as "fechaCreacion",
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
        console.log("raw", [
            reservasUIDArray,
            numeroPorPagina,
            paginaActualSQL
        ])

        const resuelve = await conexion.query(consulta, parametros);
        console.log("resueelve", resuelve.rows)
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

