import { conexion } from "../../../globales/db.mjs"
import { constructorOrderBy } from "../../../../../shared/reservas/buscador/constructorOrderBy.mjs"

export const todo_ = async (data) => {
    try {
        const numeroPorPagina = data.numeroPorPagina
        const numeroPagina = data.numeroPagina
        const sentidoColumna = data.sentidoColumna
        const nombreColumna = data.nombreColumna

       
        const sqlORderBy = await constructorOrderBy(nombreColumna, sentidoColumna)


        const consulta = `                         
        SELECT 
            r."reservaUID",
            to_char(r."fechaEntrada", 'DD/MM/YYYY') as "fechaEntrada",
            to_char(r."fechaSalida", 'DD/MM/YYYY') as "fechaSalida",
            r."estadoReservaIDV",
            CASE 
                WHEN c."clienteUID" IS NOT NULL THEN 
                    CONCAT_WS(' ', c.nombre, c."primerApellido", c."segundoApellido")
                WHEN ptr."titularPoolUID" IS NOT NULL THEN 
                    CONCAT_WS(' ', ptr."nombreTitular", '(pool)')
            END AS "nombreCompleto",

            CASE 
                WHEN c."clienteUID" IS NOT NULL THEN 
                    c.pasaporte
                WHEN ptr."titularPoolUID" IS NOT NULL THEN 
                    CONCAT_WS(' ', ptr."pasaporteTitular", '(pool)')
            END AS "pasaporteTitular",

            CASE 
                WHEN c."clienteUID" IS NOT NULL THEN 
                    c.mail
                WHEN ptr."titularPoolUID" IS NOT NULL THEN 
                    CONCAT_WS(' ', ptr."mailTitular", '(pool)')
            END AS "mailTitular",
            to_char(r."fechaCreacion", 'DD/MM/YYYY') as "fechaCreacion",
            COUNT(*) OVER() as total_filas
        FROM 
            reservas r
        LEFT JOIN
            "reservaTitulares" rt ON r."reservaUID" = rt."reservaUID"
        LEFT JOIN 
            clientes c ON rt."clienteUID" = c."clienteUID"
        LEFT JOIN
            "poolTitularesReserva" ptr ON r."reservaUID" = ptr."reservaUID"
        ${sqlORderBy}
        LIMIT $1
        OFFSET $2;                     
        `;
        const parametros = [
            numeroPorPagina,
            numeroPagina
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

