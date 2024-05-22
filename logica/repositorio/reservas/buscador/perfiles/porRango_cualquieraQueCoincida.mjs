import { conexion } from "../../../../componentes/db.mjs"
import { constructorOrderBy } from "../../../../sistema/reservas/buscador/contructorOrderBy.mjs"

export const porRango_cualquieraQueCoincida = async (data) => {
    try {
        const fechaEntrada_ISO = data.fechaEntrada_ISO
        const fechaSalida_ISO = data.fechaSalida_ISO
        const numeroPorPagina = data.numeroPorPagina
        const numeroPagina = data.numeroPagina
        const nombreColumna = data.nombreColumna
        const sentidoColumna = data.sentidoColumna

        const sqlORderBy = await constructorOrderBy(nombreColumna, sentidoColumna)

        const consulta = `
            SELECT r.reserva,
                   to_char(r.entrada, 'DD/MM/YYYY') as "fechaEntrada",
                   to_char(r.salida, 'DD/MM/YYYY') as "fechaSalida",
                   r."estadoReserva",
                   CASE
                       WHEN c.uid IS NOT NULL THEN CONCAT_WS(' ', c.nombre, c."primerApellido", c."segundoApellido")
                       WHEN ptr.uid IS NOT NULL THEN CONCAT_WS(' ', ptr."nombreTitular", '(pool)')
                   END AS "nombreCompleto",
                   CASE
                       WHEN c.uid IS NOT NULL THEN c.pasaporte
                       WHEN ptr.uid IS NOT NULL THEN CONCAT_WS(' ', ptr."pasaporteTitular", '(pool)')
                   END AS "pasaporteTitular",
                   CASE
                       WHEN c.uid IS NOT NULL THEN c.email
                       WHEN ptr.uid IS NOT NULL THEN CONCAT_WS(' ', ptr."emailTitular", '(pool)')
                   END AS "emailTitular",
                   to_char(r.creacion, 'DD/MM/YYYY') as creacion,
                   COUNT(*) OVER() as total_filas
            FROM reservas r
            LEFT JOIN "reservaTitulares" rt ON r.reserva = rt."reservaUID"
            LEFT JOIN clientes c ON rt."titularUID" = c.uid
            LEFT JOIN "poolTitularesReserva" ptr ON r.reserva = ptr.reserva
            WHERE  
            (
                (
                    -- Caso 1: Evento totalmente dentro del rango
                    "fechaEntrada" >= $1::DATE AND "fechaSalida" <= $2::DATE
                )
                OR
                (
                    -- Caso 2: Evento parcialmente dentro del rango
                    ("fechaEntrada" < $1::DATE AND "fechaSalida" > $1::DATE)
                    OR ("fechaEntrada" < $2::DATE AND "fechaSalida" > $2::DATE)
                )
                OR
                (
                    -- Caso 3: Evento atraviesa el rango
                    "fechaEntrada" < $1::DATE AND "fechaSalida" > $2::DATE
                )
            )
            ${sqlORderBy}
            LIMIT $3
            OFFSET $4;`

        const parametros = [
            fechaEntrada_ISO,
            fechaSalida_ISO,
            numeroPorPagina,
            numeroPagina
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

