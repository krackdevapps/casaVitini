import { conexion } from "../../../../componentes/db.mjs"
import { constructorOrderBy } from "../../../../sistema/reservas/buscador/contructorOrderBy.mjs"


export const porTerminos_ = async (data) => {
    try {
        const numeroPorPagina = data.numeroPorPagina
        const numeroPagina = data.numeroPagina
        const sentidoColumna = data.sentidoColumna
        const nombreColumna = data.nombreColumna
        const termino = data.termino
        
        const arrayTerminmos = termino.toLowerCase().split(" ");

        const terminosFormateados = [];
        arrayTerminmos.map((terminoDelArray) => {
            const terminoFinal = "%" + terminoDelArray + "%";
            terminosFormateados.push(terminoFinal);
        });

        const ordenamientoPorRelevancia = `
        (
            CASE
            WHEN
            (
                (LOWER(COALESCE(CAST(r.reserva AS TEXT), '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(to_char(r.entrada, 'DD/MM/YYYY'), '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(to_char(r.salida, 'DD/MM/YYYY'), '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(to_char(r.creacion, 'DD/MM/YYYY'), '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(ptr."nombreTitular", '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(ptr."pasaporteTitular", '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(ptr."emailTitular", '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(c.nombre, '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(c."primerApellido", '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(c."segundoApellido", '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(c.telefono, '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(c.email, '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(c.pasaporte, '')) ILIKE ANY($1))::int
            ) = 1 THEN 1
            WHEN (
                (LOWER(COALESCE(CAST(r.reserva AS TEXT), '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(to_char(r.entrada, 'DD/MM/YYYY'), '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(to_char(r.salida, 'DD/MM/YYYY'), '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(to_char(r.creacion, 'DD/MM/YYYY'), '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(ptr."nombreTitular", '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(ptr."pasaporteTitular", '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(ptr."emailTitular", '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(c.nombre, '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(c."primerApellido", '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(c."segundoApellido", '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(c.telefono, '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(c.email, '')) ILIKE ANY($1))::int + 
                (LOWER(COALESCE(c.pasaporte, '')) ILIKE ANY($1))::int
            ) = 3 THEN 3              
                ELSE 2
            END                              
         )
        `;
        const sqlORderBy = await constructorOrderBy(nombreColumna, sentidoColumna)

        const constructorOrderByPorTerminos = (sqlORderBy) => {
            if (sqlORderBy) {
                return sqlORderBy
            } else {
                const inyector = `
            ORDER BY
            ${ordenamientoPorRelevancia}`
                return inyector
            }
        }

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
            END AS "nombreCompleto",

            CASE 
                WHEN c.uid IS NOT NULL THEN 
                    c.pasaporte
                WHEN ptr.uid IS NOT NULL THEN 
                    CONCAT_WS(' ', ptr."pasaporteTitular", '(pool)')
            END AS "pasaporteTitular",

            CASE 
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
            (
            LOWER(COALESCE(CAST(r.reserva AS TEXT), '')) ILIKE ANY($1)
            OR LOWER(COALESCE(to_char(r.entrada, 'DD/MM/YYYY'), '')) ILIKE ANY($1)
            OR LOWER(COALESCE(to_char(r.salida, 'DD/MM/YYYY'), '')) ILIKE ANY($1)
            OR LOWER(COALESCE(to_char(r.creacion, 'DD/MM/YYYY'), '')) ILIKE ANY($1)
            OR LOWER(COALESCE(c.nombre, '')) ILIKE ANY($1)
            OR LOWER(COALESCE(c."primerApellido", '')) ILIKE ANY($1)
            OR LOWER(COALESCE(c."segundoApellido", '')) ILIKE ANY($1)
            OR LOWER(COALESCE(c.telefono, '')) ILIKE ANY($1)
            OR LOWER(COALESCE(c.email, '')) ILIKE ANY($1)
            OR LOWER(COALESCE(c.pasaporte, '')) ILIKE ANY($1)
            OR LOWER(COALESCE(ptr."nombreTitular", '')) ILIKE ANY($1)
            OR LOWER(COALESCE(ptr."pasaporteTitular", '')) ILIKE ANY($1)
            OR LOWER(COALESCE(ptr."emailTitular", '')) ILIKE ANY($1)
            )
        ${constructorOrderByPorTerminos(sqlORderBy)}
        LIMIT $2
        OFFSET $3;                     
        `;
        const parametros = [
            terminosFormateados,
            numeroPorPagina,
            numeroPagina
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (error) {
        throw error
    }
}

