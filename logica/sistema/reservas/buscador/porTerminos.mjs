import { conexion } from "../../../componentes/db.mjs";

export const porTerminos = async (data) => {
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

        const sentidoColumnaSQL = (sentidoColumna) => {
            if (sentidoColumna === "ascendente") {
                return "ASC"
            } else if (sentidoColumna === "descente") {
                return "DESC"
            } else {
                return null
            }
        }

        const nombreColumnaSQL = (nombreColumna) => {
            if (!nombreColumna || nombreColumna === "") {
                return null
            } else {
                return nombreColumna
            }
        }

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
        let ordenamientoFinal;
        const estructuraFinal = {
            tipoConsulta: "porTerminos",
            nombreColumna: nombreColumna,
            sentidoColumna: sentidoColumna,
        };
        if (nombreColumna || sentidoColumna) {
            estructuraFinal.nombreColumna = nombreColumna;
            estructuraFinal.sentidoColumna = sentidoColumna;
        } else {
            ordenamientoFinal = ordenamientoPorRelevancia;
        }
        const consultaConstructorV2 = `                         
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
                        ORDER BY 
                            
                            CASE WHEN $2 IS NOT NULL THEN $2 END,
                            CASE WHEN $2 IS NOT NULL THEN $3 END
                        LIMIT $4
                        OFFSET $5;                     
                        `;
        const parametrosConsulta = [
            terminosFormateados,
            nombreColumnaSQL(nombreColumna),
            sentidoColumnaSQL(sentidoColumna),
            numeroPorPagina,
            numeroPagina
        ]

        const consultaReservas = await conexion.query(consultaConstructorV2, parametrosConsulta);
        const consultaConteoTotalFilas = consultaReservas?.rows[0]?.total_filas ? consultaReservas.rows[0].total_filas : 0;
        const reservasEncontradas = consultaReservas.rows;
        for (const detallesFila of reservasEncontradas) {
            delete detallesFila.total_filas;
        }
        const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
        const corretorNumeroPagina = String(numeroPagina).replace("0", "");
        estructuraFinal.pagina = 1;
        estructuraFinal.totalReservas = Number(consultaConteoTotalFilas);
        estructuraFinal.paginasTotales = totalPaginas;
        estructuraFinal.pagina = Number(corretorNumeroPagina) + 1;
        estructuraFinal.reservas = reservasEncontradas;
        estructuraFinal.termino = termino;
        salida.json(estructuraFinal);


    } catch (error) {
        throw error
    }
}