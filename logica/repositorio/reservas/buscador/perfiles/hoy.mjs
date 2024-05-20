import { conexion } from "../../../../componentes/db.mjs"

export const hoy = async (data) => {
    try {
        const fechaActual_ISO = data.fechaActual_ISO
        const numeroPorPagina = data.numeroPorPagina
        const numeroPagina = data.numeroPagina

        const consulta = `
        SELECT 
            r.reserva,
            to_char(r.entrada, 'DD/MM/YYYY') as "fechaEntrada",
            to_char(r.salida, 'DD/MM/YYYY') as "fechaSalida",
            r."estadoReserva",
            COALESCE(
                CONCAT_WS(' ', c.nombre, c."primerApellido", c."segundoApellido"),
                CONCAT_WS(' ', ptr."nombreTitular")
            ) AS "nombreCompleto",
            c.pasaporte AS "pasaporteTitular",
            ptr."pasaporteTitular" AS "pasaporteTitular",
            c.email AS "emailTitular",
            ptr."emailTitular" AS "emailTitular",
            ptr."nombreTitular" AS "nombreCompleto",
            to_char(r.creacion, 'DD/MM/YYYY') as creacion,
            COUNT(*) OVER() as total_filas,
        CASE
            WHEN ptr.uid IS NOT NULL THEN CONCAT_WS(' ', ptr."nombreTitular", '(pool)')
            END AS "nombreCompleto"
        FROM 
            reservas r
        LEFT JOIN
            "reservaTitulares" rt ON r.reserva = rt."reservaUID"
        LEFT JOIN 
            clientes c ON rt."titularUID" = c.uid
        LEFT JOIN
            "poolTitularesReserva" ptr ON r.reserva = ptr.reserva
        WHERE 
            entrada = $1
        ORDER BY 
            "entrada" ASC
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
    } catch (error) {
        throw error
    }
}

