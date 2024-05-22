import { conexion } from "../../componentes/db.mjs";
export const obtenerReservasDelCliente = async (data) => {
    try {

        const UIDSreservasComoTitular = data.UIDSreservasComoTitular
        const UIDSreservasComoPernoctante = data.UIDSreservasComoPernoctante
        const UIDSreservasComoAmbos = data.UIDSreservasComoAmbos
        const numeroPorPagina = data.numeroPorPagina
        const sentidoColumna = data.sentidoColumna
        const numeroPagina = data.numeroPagina
        const nombreColumna = data.nombreColumna
        const numeroPaginaSQL = Number((numeroPagina - 1) + "0");

        const constructorSQL = (nombreColumna, sentidoColumna) => {
            if (nombreColumna) {
                if (sentidoColumna == "ascendente") {
                    sentidoColumna = "ASC";
                }
                if (sentidoColumna == "descendente") {
                    sentidoColumna = "DESC";
                }

                const ordenColumnaSQL = `
                   ORDER BY 
                   "${nombreColumna}" ${sentidoColumna} 
                   `;
                return ordenColumnaSQL
            } else {
                return ""
            }
        }

        const consulta = `
        WITH resultados AS (
            SELECT 
                'Titular' AS como,
                reserva::text,
                to_char(entrada, 'DD/MM/YYYY') as entrada, 
                to_char(salida, 'DD/MM/YYYY') as salida
            FROM 
                reservas 
            WHERE 
                reserva = ANY($1)

            UNION ALL

            SELECT 
                'Pernoctante' AS como,
                reserva::text,
                to_char(entrada, 'DD/MM/YYYY') as entrada, 
                to_char(salida, 'DD/MM/YYYY') as salida
            FROM 
                reservas 
            WHERE 
                reserva = ANY($2)

            UNION ALL

            SELECT 
                'Ambos' AS como,
                reserva::text,
                to_char(entrada, 'DD/MM/YYYY') as entrada, 
                to_char(salida, 'DD/MM/YYYY') as salida
            FROM 
                reservas 
            WHERE 
                reserva = ANY($3)                   
        )
        SELECT 
            como,
            reserva,
            entrada,
            salida,
            COUNT(*) OVER ()::text as total_filas
            -- ROW_NUMBER() OVER (PARTITION BY reserva ORDER BY reserva) as fila_duplicada
        FROM resultados
        ${constructorSQL(nombreColumna, sentidoColumna)}
        LIMIT $4 OFFSET $5;
        `;
        const parametrosConsulta = [
            UIDSreservasComoTitular,
            UIDSreservasComoPernoctante,
            UIDSreservasComoAmbos,
            numeroPorPagina,
            numeroPaginaSQL
        ];
        const resuelve = await conexion.query(consulta, parametrosConsulta);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
