import { DateTime } from "luxon";
import { conexion } from "../../../componentes/db.mjs";
import { codigoZonaHoraria } from "../../../sistema/codigoZonaHoraria.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { IDX } from "../../../sistema/VitiniIDX/control.mjs";




export const listarReservas = async (entrada, salida) => {
    try {
        let pagina = entrada.body.pagina;
        let nombreColumna = entrada.body.nombreColumna;
        let sentidoColumna = entrada.body.sentidoColumna;
        const validadores = {
            nombreColumna: async (nombreColumna) => {
                const filtronombreColumna = /^[a-zA-Z]+$/;
                if (!filtronombreColumna.test(nombreColumna)) {
                    const error = "el campo 'ordenClolumna' solo puede ser letras minúsculas y mayúsculas.";
                    throw new Error(error);
                }
                const consultaExistenciaNombreColumna = `
                                SELECT column_name
                                FROM information_schema.columns
                                WHERE table_name = 'reservas' AND column_name = $1;
                                `;
                const resuelveNombreColumna = await conexion.query(consultaExistenciaNombreColumna, [nombreColumna]);
                if (resuelveNombreColumna.rowCount === 0) {
                    const miArray = [
                        'nombreCompleto',
                        'pasaporteTitular',
                        'emailTitular'
                    ];
                    if (!miArray.includes(nombreColumna)) {
                        const error = "No existe el nombre de la columna que quieres ordenar";
                        throw new Error(error);
                    }
                }
            },
            sentidoColumna: (sentidoColumna) => {
                let sentidoColumnaSQL;
                const sentidoColumnaPreVal = sentidoColumna;
                if (sentidoColumnaPreVal !== "descendente" && sentidoColumnaPreVal !== "ascendente") {
                    const error = "El sentido del ordenamiento de la columna es ascendente o descendente";
                    throw new Error(error);
                }
                if (sentidoColumnaPreVal === "ascendente") {
                    sentidoColumnaSQL = "ASC";
                }
                if (sentidoColumnaPreVal === "descendente") {
                    sentidoColumnaSQL = "DESC";
                }
                const estructuraFinal = {
                    sentidoColumna: sentidoColumnaPreVal,
                    sentidoColumnaSQL: sentidoColumnaSQL
                };
                return estructuraFinal;
            },
            validarFechaEntrada: (fecha) => {
                const filtroFecha = /^(0?[1-9]|[1-2][0-9]|3[0-1])\/(0?[1-9]|1[0-2])\/\d{4}$/;
                if (!filtroFecha.test(fecha)) {
                    const error = "La fecha de entrada no cumple el criterio de formato";
                    throw new Error(error);
                }
            },
            validarFechaSalida: (fecha) => {
                const filtroFecha = /^(0?[1-9]|[1-2][0-9]|3[0-1])\/(0?[1-9]|1[0-2])\/\d{4}$/;
                if (!filtroFecha.test(fecha)) {
                    const error = "La fecha de salida no cumple el criterio de formato";
                    throw new Error(error);
                }
            }
        };
        if (typeof pagina !== "number" || !Number.isInteger(pagina) || pagina <= 0) {
            const error = "Debe de especificarse la clave 'pagina' y su valor debe de ser numerico, entero, positivo y mayor a cero.";
            throw new Error(error);
        }
        const tipoConsulta = entrada.body.tipoConsulta;
        let numeroPagina = Number((pagina - 1) + "0");
        let numeroPorPagina = 10;
        if (tipoConsulta !== "hoy" && tipoConsulta !== "rango" && tipoConsulta !== "porTerminos") {
            const error = "Hay que especificar el tipo de consulta, si es hoy, rango o porTerminos, revisa los parametros de tu busqueda";
            throw new Error(error);
        }
        if (tipoConsulta === "hoy") {
            const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
            const tiempoZH = DateTime.now().setZone(zonaHoraria);
            const fechaActualTZ = tiempoZH.toISODate();
            const dia = String(tiempoZH.day).padStart("2", "0");
            const mes = String(tiempoZH.month).padStart("2", "0");
            const ano = tiempoZH.year;
            //const numeroPagina = pagina - 1
            const numeroPorPagina = 10;
            const fechaFormato_Humano = dia + "/" + mes + "/" + ano;
            const consultaHoy = `
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
            const consultaReservasHoy = await conexion.query(consultaHoy, [fechaActualTZ, numeroPorPagina, numeroPagina]);
            const consultaConteoTotalFilas = consultaReservasHoy?.rows[0]?.total_filas ? consultaReservasHoy.rows[0].total_filas : 0;
            const reservasEncontradas = consultaReservasHoy.rows;
            for (const detallesFila of reservasEncontradas) {
                delete detallesFila.total_filas;
            }
            const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
            const corretorNumeroPagina = String(numeroPagina).replace("0", "");
            const Respuesta = {
                tipoConsulta: "rango",
                tipoCoincidencia: "porFechaDeEntrada",
                pagina: Number(1),
                fechaEntrada: fechaFormato_Humano,
                paginasTotales: totalPaginas,
                totalReservas: Number(consultaConteoTotalFilas),
                nombreColumna: "entrada",
                sentidoColumna: "ascendente",
                reservas: reservasEncontradas
            };
            salida.json(Respuesta);
        }
        if (tipoConsulta === "rango") {
            let fechaEntrada = entrada.body.fechaEntrada;
            let fechaSalida = entrada.body.fechaSalida;
            let tipoCoincidencia = entrada.body.tipoCoincidencia;
            if (tipoCoincidencia !== "cualquieraQueCoincida" &&
                tipoCoincidencia !== "soloDentroDelRango" &&
                tipoCoincidencia !== "porFechaDeEntrada" &&
                tipoCoincidencia !== "porFechaDeSalida") {
                const error = "Falta especificar el tipo de coincidencia, por favor selecciona el tipo de coincidencia para poder realizar la busqueda";
                throw new Error(error);
            }
            let sentidoColumnaSQL;
            if (nombreColumna) {
                await validadores.nombreColumna(nombreColumna);
                sentidoColumnaSQL = (validadores.sentidoColumna(sentidoColumna)).sentidoColumnaSQL;
                sentidoColumna = (validadores.sentidoColumna(sentidoColumna)).sentidoColumna;
            }
            let ordenColumnaSQL = "";
            if (nombreColumna) {
                ordenColumnaSQL = `
                                    ORDER BY 
                                    "${nombreColumna}" ${sentidoColumnaSQL} 
                                    `;
            }
            if (tipoCoincidencia === "cualquieraQueCoincida") {
                if (!fechaEntrada) {
                    const error = "Falta determinar la 'fechaEntrada'";
                    throw new Error(error);
                }
                if (!fechaSalida) {
                    const error = "Falta determinar la 'fechaSalida'";
                    throw new Error(error);
                }
                validadores.validarFechaEntrada(fechaEntrada);
                validadores.validarFechaSalida(fechaSalida);
                const convertirFechaISO8601 = (fechaStr) => {
                    const [dia, mes, anio] = fechaStr.split('/');
                    const fechaISO8601 = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
                    return fechaISO8601;
                };
                const fechaEntradaReservaControl = new Date(convertirFechaISO8601(fechaEntrada));
                const fechaSalidaReservaControl = new Date(convertirFechaISO8601(fechaSalida));
                if (fechaSalidaReservaControl <= fechaEntradaReservaControl) {
                    const error = "La fecha de entrada seleccionada es igual o superior a la fecha de salida de la reserva";
                    throw new Error(error);
                }
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
                                    entrada <= $2::DATE AND salida >= $1::DATE
                                    ${ordenColumnaSQL}
                                    LIMIT $3 
                                    OFFSET $4    
                                    ;`;
                const consultaReservas = await conexion.query(consultaConstructor, [fechaEntradaReservaControl, fechaSalidaReservaControl, numeroPorPagina, numeroPagina]);
                const consultaConteoTotalFilas = consultaReservas?.rows[0]?.total_filas ? consultaReservas.rows[0].total_filas : 0;
                const reservasEncontradas = consultaReservas.rows;
                for (const detallesFila of reservasEncontradas) {
                    delete detallesFila.total_filas;
                }
                const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
                const corretorNumeroPagina = String(numeroPagina).replace("0", "");
                const ok = {
                    tipoCoincidencia: "cualquieraQueCoincida",
                    totalReservas: Number(consultaConteoTotalFilas),
                    paginasTotales: totalPaginas,
                    tipoConsulta: "rango",
                    fechaEntrada: fechaEntrada,
                    fechaSalida: fechaSalida,
                    pagina: Number(corretorNumeroPagina) + 1,
                    nombreColumna: nombreColumna,
                    sentidoColumna: sentidoColumna,
                    reservas: reservasEncontradas
                };
                salida.json(ok);
            }
            if (tipoCoincidencia === "soloDentroDelRango") {
                if (!fechaEntrada) {
                    const error = "Falta determinar la 'fechaEntrada'";
                    throw new Error(error);
                }
                if (!fechaSalida) {
                    const error = "Falta determinar la 'fechaSalida'";
                    throw new Error(error);
                }
                const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada)).fecha_ISO;
                const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida)).fecha_ISO;
                const fechaEntradaReservaControl = DateTime.fromISO(fechaEntrada_ISO);
                const fechaSalidaReservaControl = DateTime.fromISO(fechaSalida_ISO);
                if (fechaSalidaReservaControl <= fechaEntradaReservaControl) {
                    const error = "La fecha de entrada seleccionada es igual o superior a la fecha de salida de la reserva";
                    throw new Error(error);
                }
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
                                        entrada >= $1::DATE AND salida <= $2::DATE
                                    ${ordenColumnaSQL}
                                    LIMIT $3
                                    OFFSET $4    
                                    ;`;
                const consultaReservas = await conexion.query(consultaConstructor, [fechaEntrada_ISO, fechaSalida_ISO, numeroPorPagina, numeroPagina]);
                const consultaConteoTotalFilas = consultaReservas?.rows[0]?.total_filas ? consultaReservas.rows[0].total_filas : 0;
                const reservasEncontradas = consultaReservas.rows;
                for (const detallesFila of reservasEncontradas) {
                    delete detallesFila.total_filas;
                }
                const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
                const corretorNumeroPagina = String(numeroPagina).replace("0", "");
                const ok = {
                    tipoCoincidencia: "soloDentroDelRango",
                    totalReservas: Number(consultaConteoTotalFilas),
                    paginasTotales: totalPaginas,
                    tipoConsulta: "rango",
                    fechaEntrada: fechaEntrada,
                    fechaSalida: fechaSalida,
                    pagina: Number(corretorNumeroPagina) + 1,
                    nombreColumna: nombreColumna,
                    sentidoColumna: sentidoColumna,
                    reservas: reservasEncontradas
                };
                salida.json(ok);
            }
            if (tipoCoincidencia === "porFechaDeEntrada") {
                if (!fechaEntrada) {
                    const error = "Falta determinar la 'fechaEntrada'";
                    throw new Error(error);
                }
                const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada)).fecha_ISO;
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
                                    ${ordenColumnaSQL}
                                    LIMIT $2
                                    OFFSET $3; `;
                const consultaReservas = await conexion.query(consultaConstructor, [fechaEntrada_ISO, numeroPorPagina, numeroPagina]);
                const consultaConteoTotalFilas = consultaReservas?.rows[0]?.total_filas ? consultaReservas.rows[0].total_filas : 0;
                const reservasEncontradas = consultaReservas.rows;
                for (const detallesFila of reservasEncontradas) {
                    delete detallesFila.total_filas;
                }
                const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
                const corretorNumeroPagina = String(numeroPagina).replace("0", "");
                const ok = {
                    tipoCoincidencia: "porFechaDeEntrada",
                    totalReservas: Number(consultaConteoTotalFilas),
                    paginasTotales: totalPaginas,
                    tipoConsulta: "rango",
                    fechaEntrada: fechaEntrada,
                    fechaSalida: fechaSalida,
                    pagina: Number(corretorNumeroPagina) + 1,
                    nombreColumna: nombreColumna,
                    sentidoColumna: sentidoColumna,
                    reservas: reservasEncontradas
                };
                salida.json(ok);
            }
            if (tipoCoincidencia === "porFechaDeSalida") {
                if (!fechaSalida) {
                    const error = "Falta determinar la 'fechaSalida'";
                    throw new Error(error);
                }
                const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida)).fecha_ISO;
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
                                        salida = $1::DATE
                                    ${ordenColumnaSQL}
                                    LIMIT $2
                                    OFFSET $3`;
                const consultaReservas = await conexion.query(consultaConstructor, [fechaSalida_ISO, numeroPorPagina, numeroPagina]);
                const consultaConteoTotalFilas = consultaReservas?.rows[0]?.total_filas ? consultaReservas.rows[0].total_filas : 0;
                const reservasEncontradas = consultaReservas.rows;
                for (const detallesFila of reservasEncontradas) {
                    delete detallesFila.total_filas;
                }
                const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
                const corretorNumeroPagina = String(numeroPagina).replace("0", "");
                const ok = {
                    tipoCoincidencia: "porFechaDeSalida",
                    totalReservas: Number(consultaConteoTotalFilas),
                    paginasTotales: totalPaginas,
                    tipoConsulta: "rango",
                    fechaEntrada: fechaEntrada,
                    fechaSalida: fechaSalida,
                    pagina: Number(corretorNumeroPagina) + 1,
                    nombreColumna: nombreColumna,
                    sentidoColumna: sentidoColumna,
                    reservas: reservasEncontradas
                };
                salida.json(ok);
            }
        }
        if (tipoConsulta === "porTerminos") {
            let termino = entrada.body.termino;
            if (!termino) {
                const error = "Nada que buscar, escribe un termino de busqueda";
                throw new Error(error);
            }
            const filtroCadena = /^[a-zA-Z0-9@.\-_/^\s&?!]*$/;
            if (!filtroCadena.test(termino)) {
                const error = "Los terminos de busqueda solo aceptan letras, numeros y espacios y caracteres de uso comun como por ejemplo arroba y otros. Lo que se no se aceptan ";
                throw new Error(error);
            }
            termino = termino.trim();
            termino = termino.toLowerCase();
            const arrayTerminmos = termino.split(" ");
            const terminosFormateados = [];
            arrayTerminmos.map((terminoDelArray) => {
                const terminoFinal = "%" + terminoDelArray + "%";
                terminosFormateados.push(terminoFinal);
            });
            const estructuraFinal = {
                tipoConsulta: "porTerminos"
            };
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
            if (nombreColumna || sentidoColumna) {
                await validadores.nombreColumna(nombreColumna);
                const sentidoColumnaSQL = (validadores.sentidoColumna(sentidoColumna)).sentidoColumnaSQL;
                sentidoColumna = (validadores.sentidoColumna(sentidoColumna)).sentidoColumna;
                ordenamientoFinal = `"${nombreColumna}" ${sentidoColumnaSQL}`;
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
                                ${ordenamientoFinal}
                            LIMIT $2
                            OFFSET $3;                     
                            `;
            const consultaReservas = await conexion.query(consultaConstructorV2, [terminosFormateados, numeroPorPagina, numeroPagina]);
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
        }
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
    }
}