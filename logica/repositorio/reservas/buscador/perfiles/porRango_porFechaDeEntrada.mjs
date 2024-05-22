import { conexion } from "../../../../componentes/db.mjs"
import { constructorOrderBy } from "../../../../sistema/reservas/buscador/contructorOrderBy.mjs"


export const porRango_porFechaDeEntrada = async (data) => {
    try {
        const fechaEntrada_ISO = data.fechaEntrada_ISO
        const numeroPorPagina = data.numeroPorPagina
        const numeroPagina = data.numeroPagina
        const nombreColumna = data.nombreColumna
        const sentidoColumna = data.sentidoColumna


        const sqlORderBy = await constructorOrderBy(nombreColumna, sentidoColumna)

        const consulta = `
        SELECT
            r.reserva,
            to_char(r.entrada, 'DD/MM/YYYY') as "fechaEntrada",
            to_char(r.salida, 'DD/MM/YYYY') as "fechaSalida",
            r."estadoReserva",
            CASE 
                WHEN c.uid IS NOT NULL THEN 
                    CONCAT_WS(' ', c.nombre, c."primerApellido", c."segundoApellido")
                WHEN ptr.uid IS NOT NULL THEN 
                    CONCAT_WS(' ', ptr."nombreTitular", '(pool)')
            END AS "nombreComplet                       CASE 
                WHEN c.uid IS NOT NULL THEN 
                    c.pasaporte
                WHEN ptr.uid IS NOT NULL THEN 
                    CONCAT_WS(' ', ptr."pasaporteTitular", '(pool)')
            END AS "pasaporteTitula                   CASE 
                WHEN c.uid IS NOT NULL THEN 
                    c.email
                WHEN ptr.uid IS NOT NULL THEN 
                    CONCAT_WS(' ', ptr."emailTitular", '(pool)')
            END AS "emailTitular",
            to_char(r.creacion, 'DD/MM/YYYY') as creacion,
            COUNT(*) OVER() as total_filas
                FROM 
                    reservas r
                LEFT JOIN
                    "reservaTitulares" rt ON r.reserva = rt."reservaUID"
                LEFT JOIN 
                    clientes c ON rt."titularUID" = c.uid
                LEFT JOIN
                "poolTitularesReserva" ptr ON r.reserva = ptr.reserva
                WHERE
                    entrada = $1::DATE
           ${sqlORderBy}
            LIMIT $2
            OFFSET $3; `;


        const parametros = [
            fechaEntrada_ISO,
            numeroPorPagina,
            numeroPagina
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

