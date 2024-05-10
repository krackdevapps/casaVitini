import { conexion } from "../../../componentes/db.mjs";
import { constructorOrderBy } from "./contructorOrderBy.mjs";

export const rango = async (data) => {
    try {
        const fechaEntrada_ISO = data.fechaEntrada_ISO;
        const fechaSalida_ISO = data.fechaSalida_ISO;
        const tipoCoincidencia = data.tipoCoincidencia;
        const nombreColumna = data.nombreColumna;
        const sentidoColumna = data.sentidoColumna;
        const numeroPagina = data.numeroPagina;
        const numeroPorPagina = data.numeroPorPagina;

        const sqlORderBy = await constructorOrderBy(nombreColumna, sentidoColumna)
        if (tipoCoincidencia === "cualquieraQueCoincida") {
            const consultaConstructor = `
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
            WHERE entrada <= $2::DATE
                AND salida >= $1::DATE
            ${sqlORderBy}
            LIMIT $3
            OFFSET $4;`

            const parametrosConsulta = [
                fechaEntrada_ISO,
                fechaSalida_ISO,
                numeroPorPagina,
                numeroPagina,
            ];
            const consultaReservas = await conexion.query(
                consultaConstructor,
                parametrosConsulta
            );
            const consultaConteoTotalFilas = consultaReservas?.rows[0]?.total_filas
                ? consultaReservas.rows[0].total_filas
                : 0;
            const reservasEncontradas = consultaReservas.rows;
            for (const detallesFila of reservasEncontradas) {
                delete detallesFila.total_filas;
            }
            const totalPaginas = Math.ceil(
                consultaConteoTotalFilas / numeroPorPagina
            );
            const corretorNumeroPagina = String(numeroPagina).replace("0", "");
            const ok = {
                tipoCoincidencia: "cualquieraQueCoincida",
                totalReservas: Number(consultaConteoTotalFilas),
                paginasTotales: totalPaginas,
                tipoConsulta: "rango",
                fechaEntrada_ISO: fechaEntrada_ISO,
                fechaSalida_ISO: fechaSalida_ISO,
                pagina: Number(corretorNumeroPagina) + 1,
                nombreColumna: nombreColumna,
                sentidoColumna: sentidoColumna,
                reservas: reservasEncontradas,
            };
            return ok;
        } else if (tipoCoincidencia === "soloDentroDelRango") {
            const consultaConstructor = `
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
                    END AS "pasaporteTitula
                    CASE 
                        WHEN c.uid IS NOT NULL THEN 
                            c.email
                        WHEN ptr.uid IS NOT NULL THEN 
                            CONCAT_WS(' ', ptr."emailTitular", '(pool)')
                    END AS "emailTitula
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
                    entrada >= $1::DATE AND salida <= $2::DATE
                ${sqlORderBy}
                LIMIT $3
                OFFSET $4    
                ;`;
            const configuracionConsulta = [
                fechaEntrada_ISO,
                fechaSalida_ISO,
                numeroPorPagina,
                numeroPagina,
            ];
            const consultaReservas = await conexion.query(
                consultaConstructor,
                configuracionConsulta
            );
            const consultaConteoTotalFilas = consultaReservas?.rows[0]?.total_filas
                ? consultaReservas.rows[0].total_filas
                : 0;
            const reservasEncontradas = consultaReservas.rows;
            for (const detallesFila of reservasEncontradas) {
                delete detallesFila.total_filas;
            }
            const totalPaginas = Math.ceil(
                consultaConteoTotalFilas / numeroPorPagina
            );
            const corretorNumeroPagina = String(numeroPagina).replace("0", "");
            const ok = {
                tipoCoincidencia: "soloDentroDelRango",
                totalReservas: Number(consultaConteoTotalFilas),
                paginasTotales: totalPaginas,
                tipoConsulta: "rango",
                fechaEntrada_ISO: fechaEntrada_ISO,
                fechaSalida_ISO: fechaSalida_ISO,
                pagina: Number(corretorNumeroPagina) + 1,
                nombreColumna: nombreColumna,
                sentidoColumna: sentidoColumna,
                reservas: reservasEncontradas,
            };
            return ok
        } else if (tipoCoincidencia === "porFechaDeEntrada") {
            const consultaConstructor = `
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
            const parametrosConsulta = [
                fechaEntrada_ISO,
                numeroPorPagina,
                numeroPagina,
            ];
            const consultaReservas = await conexion.query(
                consultaConstructor,
                parametrosConsulta
            );
            const consultaConteoTotalFilas = consultaReservas?.rows[0]?.total_filas
                ? consultaReservas.rows[0].total_filas
                : 0;
            const reservasEncontradas = consultaReservas.rows;
            for (const detallesFila of reservasEncontradas) {
                delete detallesFila.total_filas;
            }
            const totalPaginas = Math.ceil(
                consultaConteoTotalFilas / numeroPorPagina
            );
            const corretorNumeroPagina = String(numeroPagina).replace("0", "");
            const ok = {
                tipoCoincidencia: "porFechaDeEntrada",
                totalReservas: Number(consultaConteoTotalFilas),
                paginasTotales: totalPaginas,
                tipoConsulta: "rango",
                fechaEntrada_ISO: fechaEntrada_ISO,
                fechaSalida_ISO: fechaSalida_ISO,
                pagina: Number(corretorNumeroPagina) + 1,
                nombreColumna: nombreColumna,
                sentidoColumna: sentidoColumna,
                reservas: reservasEncontradas,
            };
            return ok
        } else if (tipoCoincidencia === "porFechaDeSalida") {
            const consultaConstructor = `
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
                   END AS "emailTitul                      to_char(r.creacion, 'DD/MM/YYYY') as creacion,
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
                   salida = $1::DATE
               ${sqlORderBy}  
               LIMIT $3
               OFFSET $4;`;

            const parametrosConsulta = [
                fechaSalida_ISO,
                numeroPorPagina,
                numeroPagina,
            ];
            const consultaReservas = await conexion.query(
                consultaConstructor,
                parametrosConsulta
            );
            const consultaConteoTotalFilas = consultaReservas?.rows[0]?.total_filas
                ? consultaReservas.rows[0].total_filas
                : 0;
            const reservasEncontradas = consultaReservas.rows;
            for (const detallesFila of reservasEncontradas) {
                delete detallesFila.total_filas;
            }
            const totalPaginas = Math.ceil(
                consultaConteoTotalFilas / numeroPorPagina
            );
            const corretorNumeroPagina = String(numeroPagina).replace("0", "");
            const ok = {
                tipoCoincidencia: "porFechaDeSalida",
                totalReservas: Number(consultaConteoTotalFilas),
                paginasTotales: totalPaginas,
                tipoConsulta: "rango",
                fechaEntrada_ISO: fechaEntrada_ISO,
                fechaSalida_ISO: fechaSalida_ISO,
                pagina: Number(corretorNumeroPagina) + 1,
                nombreColumna: nombreColumna,
                sentidoColumna: sentidoColumna,
                reservas: reservasEncontradas,
            };
            return ok
        } else {
            const error =
                "Falta especificar el tipo de coincidencia, por favor selecciona el tipo de coincidencia para poder realizar la busqueda";
            throw new Error(error);
        }
    } catch (error) {
        throw error;
    }
};
