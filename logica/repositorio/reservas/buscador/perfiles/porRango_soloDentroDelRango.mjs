import { conexion } from "../../../../componentes/db.mjs"
import { constructorOrderBy } from "../../../../sistema/reservas/buscador/constructorOrderBy.mjs"


export const porRango_soloDentroDelRango = async (data) => {
    try {
        const fechaEntrada = data.fechaEntrada
        const fechaSalida = data.fechaSalida
        const numeroPorPagina = data.numeroPorPagina
        const numeroPagina = data.numeroPagina
        const nombreColumna = data.nombreColumna
        const sentidoColumna = data.sentidoColumna



        const sqlORderBy = await constructorOrderBy(nombreColumna, sentidoColumna)

        const consulta = `
        SELECT
            r."reservaUID",
            to_char(r."fechaEntrada", 'YYYY-MM-DD') as "fechaEntrada",
            to_char(r."fechaSalida", 'YYYY-MM-DD') as "fechaSalida",
            r."estadoReservaIDV",
            CASE 
                WHEN c."clienteUID" IS NOT NULL THEN CONCAT_WS(' ', c.nombre, c."primerApellido", c."segundoApellido")
                WHEN ptr."titularPoolUID" IS NOT NULL THEN CONCAT_WS(' ', ptr."nombreTitular", '(pool)')
            END AS "nombreCompleto",
            CASE
                WHEN c."clienteUID" IS NOT NULL THEN  c.pasaporte
                WHEN ptr."titularPoolUID" IS NOT NULL THEN CONCAT_WS(' ', ptr."pasaporteTitular", '(pool)')
            END AS "pasaporteTitular",
            CASE
                WHEN c."clienteUID" IS NOT NULL THEN c.mail
                WHEN ptr."titularPoolUID" IS NOT NULL THEN CONCAT_WS(' ', ptr."mailTitular", '(pool)')
            END AS "mailTitular",
            to_char(r."fechaCreacion", 'YYYY-MM-DD') as "fechaCreacion",
            COUNT(*) OVER() as total_filas
                FROM 
                    reservas r
                LEFT JOIN
                    "reservaTitulares" rt ON r."reservaUID" = rt."reservaUID"
                LEFT JOIN 
                    clientes c ON rt."titularUID" = c."clienteUID"
                LEFT JOIN
                "poolTitularesReserva" ptr ON r."reservaUID" = ptr."reservaUID"
                WHERE
                    (
                        -- Caso 1: Evento totalmente dentro del rango
                        "fechaEntrada" >= $1::DATE AND "fechaSalida" <= $2::DATE
                    )
                ${sqlORderBy}
                LIMIT $3
                OFFSET $4    
                ;`;


        const parametros = [
            fechaEntrada,
            fechaSalida,
            numeroPorPagina,
            numeroPagina
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

