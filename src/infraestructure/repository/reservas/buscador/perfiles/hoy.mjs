import { conexion } from "../../../globales/db.mjs"

export const selector_hoy = async (data) => {
    try {
        const fechaActual_ISO = data.fechaActual_ISO
        const numeroPorPagina = data.numeroPorPagina
        const numeroPagina = data.numeroPagina

        const consulta = `
         SELECT r."reservaUID",
                   to_char(r."fechaEntrada", 'YYYY-MM-DD') as "fechaEntrada",
                   to_char(r."fechaSalida", 'YYYY-MM-DD') as "fechaSalida",
                   r."estadoReservaIDV",
                   CASE
                       WHEN c."clienteUID" IS NOT NULL THEN CONCAT_WS(' ', c.nombre, c."primerApellido", c."segundoApellido")
                       WHEN ptr."titularPoolUID" IS NOT NULL THEN CONCAT_WS(' ', ptr."nombreTitular", '(pool)')
                   END AS "nombreCompleto",
                   CASE
                       WHEN c."clienteUID" IS NOT NULL THEN c.pasaporte
                       WHEN ptr."titularPoolUID" IS NOT NULL THEN CONCAT_WS(' ', ptr."pasaporteTitular", '(pool)')
                   END AS "pasaporteTitular",
                   CASE
                       WHEN c."clienteUID" IS NOT NULL THEN c.mail
                       WHEN ptr."titularPoolUID" IS NOT NULL THEN CONCAT_WS(' ', ptr."mailTitular", '(pool)')
                   END AS "mailTitular",
                   to_char(r."fechaCreacion", 'YYYY-MM-DD') as "fechaCreacion",
                   COUNT(*) OVER() as total_filas
            FROM reservas r
            LEFT JOIN "reservaTitulares" rt ON r."reservaUID" = rt."reservaUID"
            LEFT JOIN clientes c ON rt."titularUID" = c."clienteUID"
            LEFT JOIN "poolTitularesReserva" ptr ON r."reservaUID" = ptr."reservaUID"
        WHERE 
            "fechaEntrada" = $1
        ORDER BY 
            "fechaEntrada" ASC
        LIMIT $2
        OFFSET $3;
        `;
        const parametros = [
            fechaActual_ISO,
            numeroPorPagina,
            numeroPagina
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

