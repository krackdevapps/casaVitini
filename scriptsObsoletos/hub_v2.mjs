
import { cambiarVista } from '../logica/sistema/cambiarVista.mjs';
import { clienteSquare } from "../logica/componentes/squareClient.mjs";
import { v4 as uuidv4 } from "uuid";
import { validarObjetoReserva } from '../logica/sistema/reservas/validarObjetoReserva.mjs';
import { validarObjetoReservaSoloFormato } from '../logica/sistema/reservas/validarObjetoReservaSoloFormato.mjs';
import { configuracionApartamento } from '../logica/sistema/configuracionApartamento.mjs';
import { precioReserva } from '../logica/sistema/precios/precioReserva.mjs';
import { insertarReserva } from '../logica/sistema/reservas/insertarReserva.mjs';
import { estadoHabitacionesApartamento } from '../logica/sistema/reservas/estadoHabitacionesApartamento.mjs';
import { validarModificacionRangoFechaResereva } from '../logica/sistema/validadores/validarModificacionRangoFechaResereva.mjs';
import { bloquearApartamentos } from '../logica/sistema/bloqueos/bloquearApartamentos.mjs';
import { resolverMoneda } from '../logica/sistema/resolucion/resolverMoneda.mjs';
import { precioBaseApartamento } from '../logica/sistema/precios/precioBaseApartamento.mjs';
import { precioRangoApartamento } from '../logica/sistema/precios/precioRangoApartamento.mjs';
import { insertarTotalesReserva } from '../logica/sistema/reservas/insertarTotalesReserva.mjs';
import { detallesReserva } from '../logica/sistema/reservas/detallesReserva.mjs';
import { resolverApartamentoUI } from '../logica/sistema/resolucion/resolverApartamentoUI.mjs';
import { vitiniCrypto } from '../logica/sistema/VitiniIDX/vitiniCrypto.mjs';
import { administracionUI } from '../logica/componentes/administracion.mjs';
import { controlCaducidadEnlacesDePago } from '../logica/sistema/enlacesDePago/controlCaducidadEnlacesDePago.mjs';
import { zonasHorarias } from "../logica/componentes/zonasHorarias.mjs";
import { utilidades } from '../logica/componentes/utilidades.mjs';
import Decimal from 'decimal.js';
import { insertarCliente } from '../logica/sistema/clientes/insertarCliente.mjs';
import { codigoZonaHoraria } from '../logica/sistema/configuracion/codigoZonaHoraria.mjs';
import { DateTime } from 'luxon';
import { generadorPDF } from '../logica/sistema/PDF/generadorPDF.mjs';
import { validadoresCompartidos } from '../logica/sistema/validadores/validadoresCompartidos.mjs';
import { actualizarEstadoPago } from '../logica/sistema/precios/actualizarEstadoPago.mjs';
import { obtenerTotalReembolsado } from '../logica/sistema/Precios/obtenerTotalReembolsado.mjs';
import { enviarMail } from '../logica/sistema/Mail/enviarMail.mjs';
import { enviarEmailReservaConfirmada } from '../logica/sistema/Mail/enviarEmailReservaConfirmada.mjs';
import { enviarEmailAlCrearCuentaNueva } from '../logica/sistema/Mail/enviarEmailAlCrearCuentaNueva.mjs';
import validator from 'validator';
import axios from 'axios';
import ICAL from 'ical.js';
import { apartamentosOcupadosHoy_paraSitaucion } from '../logica/sistema/calendariosSincronizados/airbnb/apartamentosOcupadosHoyAirbnb_paraSitaucion.mjs';
import { eventosDelApartamento } from '../logica/sistema/calendariosSincronizados/airbnb/eventosDelApartamento.mjs';
import { obtenerTodosLosCalendarios } from '../logica/sistema/calendariosSincronizados/airbnb/obtenerTodosLosCalendarios.mjs';
import { eventosReservas } from '../logica/sistema/calendarios/capas/eventosReservas.mjs';
import { eventosTodosLosApartamentos } from '../logica/sistema/calendarios/capas/eventosTodosLosApartamentos.mjs';
import { eventosTodosLosBloqueos } from '../logica/sistema/calendarios/capas/eventosTodosLosBloqueos.mjs';
import { eventosPorApartamneto } from '../logica/sistema/calendarios/capas/eventosPorApartamento.mjs';
import { eventosPorApartamentoAirbnb } from '../logica/sistema/calendarios/capas/calendariosSincronizados/airbnb/eventosPorApartamentoAirbnb.mjs';
import { obtenerParametroConfiguracion } from '../logica/sistema/obtenerParametroConfiguracion.mjs';
import { obtenerDetallesOferta } from '../logica/sistema/ofertas/obtenerDetallesOferta.mjs';
import { interruptor } from '../logica/sistema/configuracion/interruptor.mjs';
import { apartamentosPorRango } from '../logica/sistema/selectoresCompartidos/apartamentosPorRango.mjs';
import { evitarDuplicados } from '../logica/sistema/precios/comportamientoPrecios/evitarDuplicados.mjs';
import { componentes } from './componentes.mjs';
import { conexion } from '../logica/componentes/db.mjs';

const mensajesInterruptores = {
    aceptarReservasPublicas: "Casa Vitini en este momento no acepta confirmaciones de reservas a través de este proceso. Por favor, ponte en contacto con nosotros si deseas preconfirmar una reserva. Dirígete a la sección de contacto para obtener formas de comunicarte con nosotros. Pronto activaremos este método. Gracias y disculpa las molestias."
}

const casaVitini = {  
    administracion: {

        reservas: {
            listarReservas: async () => {
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
                    salida.json(error)
                } finally {
                }
            },
            detallesReserva: async () => {
                try {
                    const reservaUID = entrada.body.reserva;
                    const solo = entrada.body.solo;
                    if (!reservaUID) {
                        const error = "Se necesita un id de 'reserva'";
                        throw new Error(error);
                    }
                    if (typeof reservaUID !== "number" || !Number.isInteger(reservaUID) || reservaUID <= 0) {
                        const error = "Se ha definico correctamente  la clave 'reserva' pero el valor de esta debe de ser un numero positivo, si has escrito un numero positivo, revisa que en el objeto no este numero no este envuelvo entre comillas";
                        throw new Error(error);
                    }
                    if (solo) {
                        if (solo !== "detallesAlojamiento" &&
                            solo !== "desgloseTotal" &&
                            solo !== "informacionGlobal" &&
                            solo !== "globalYFinanciera" &&
                            solo !== "pernoctantes") {
                            const error = "el campo 'zona' solo puede ser detallesAlojamiento, desgloseTotal, informacionGlobal o pernoctantes.";
                            throw new Error(error);
                        }
                    }
                    const metadatos = {
                        reservaUID: reservaUID,
                        solo: solo
                    };
                    const resuelveDetallesReserva = await detallesReserva(metadatos);
                    salida.json(resuelveDetallesReserva);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                }
            },
            cambiarTipoCliente: async () => {
                const mutex = new Mutex();
                const bloqueoCambiarTipoClienteEnReserva = await mutex.acquire();
                try {
                    const reservaUID = entrada.body.reservaUID;
                    const pernoctanteUID = entrada.body.pernoctanteUID;
                    const clienteUID = entrada.body.clienteUID;
                    const reserva = await validadoresCompartidos.reservas.validarReserva(reservaUID);
                    if (typeof pernoctanteUID !== "number" || !Number.isInteger(pernoctanteUID) || pernoctanteUID <= 0) {
                        const error = "El campo 'pernoctanteUID' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (typeof clienteUID !== "number" || !Number.isInteger(clienteUID) || clienteUID <= 0) {
                        const error = "El campo 'clienteUID' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (reserva.estadoReserva === "cancelada") {
                        const error = "La reserva no se puede modificar por que esta cancelada";
                        throw new Error(error);
                    }
                    await conexion.query('BEGIN'); // Inicio de la transacción


                    // validar cliente
                    const validacionCliente = `
                          SELECT 
                          uid,
                          nombre,
                          "primerApellido",
                          "segundoApellido",
                          pasaporte
                          FROM 
                          clientes
                          WHERE 
                          uid = $1;
                          `;
                    const resuelveValidacionCliente = await conexion.query(validacionCliente, [clienteUID]);
                    if (resuelveValidacionCliente.rowCount === 0) {
                        const error = "No existe el cliente";
                        throw new Error(error);
                    }
                    const nombre = resuelveValidacionCliente.rows[0].nombre;
                    const primerApellido = resuelveValidacionCliente.rows[0].primerApellido || "";
                    const segundoApellido = resuelveValidacionCliente.rows[0].segundoApellido || "";
                    const nombreCompleto = `${nombre} ${primerApellido} ${segundoApellido}`;
                    const pasaporte = resuelveValidacionCliente.rows[0].segundoApellido;
                    // No se puede anadir un pernoctante ya existen a la reserva, proponer moverlo de habitacion
                    const validacionUnicidadPernoctante = `
                          SELECT 
                          "pernoctanteUID"
                          FROM "reservaPernoctantes"
                          WHERE "clienteUID" = $1 AND reserva = $2
                          `;
                    const resuelveValidacionUnicidadPernoctante = await conexion.query(validacionUnicidadPernoctante, [clienteUID, reservaUID]);
                    if (resuelveValidacionUnicidadPernoctante.rowCount === 1) {
                        const error = "Este cliente ya es un pernoctante dentro de esta reserva, mejor muevalo de habitacion";
                        throw new Error(error);
                    }
                    const consultaFechaFeserva = `
                        SELECT 
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO"
                        FROM reservas 
                        WHERE reserva = $1;`;
                    const resuelveFechas = await conexion.query(consultaFechaFeserva, [reservaUID]);
                    const fechaEntrada_ISO = resuelveFechas.rows[0].fechaEntrada_ISO;
                    const fechaSalida_ISO = resuelveFechas.rows[0].fechaSalida_ISO;
                    const estadoReservaCancelado = "cancelada";
                    const consultaReservasRangoInteracion = `
                        SELECT reserva 
                        FROM reservas 
                        WHERE entrada <= $1::DATE AND salida >= $2::DATE AND "estadoReserva" <> $3;`;
                    const resuelveConsultaReservasRangoInteracion = await conexion.query(consultaReservasRangoInteracion, [fechaEntrada_ISO, fechaSalida_ISO, estadoReservaCancelado]);
                    let interruptorClienteEncontrado;
                    if (resuelveConsultaReservasRangoInteracion.rowCount > 0) {
                        const reservas = resuelveConsultaReservasRangoInteracion.rows;
                        for (const reserva of reservas) {
                            const reservaUID = reserva.reserva;
                            const buscarClienteEnOtrasReservas = `
                                SELECT "clienteUID" 
                                FROM "reservaPernoctantes" 
                                WHERE "clienteUID" = $1 AND reserva = $2;`;
                            const resuelveBuscarClienteEnOtrasReservas = await conexion.query(buscarClienteEnOtrasReservas, [clienteUID, reservaUID]);
                            if (resuelveBuscarClienteEnOtrasReservas.rowCount === 1) {
                                interruptorClienteEncontrado = "encontrado";
                                break;
                            }
                        }
                    }
                    if (interruptorClienteEncontrado === "encontrado") {
                        const error = "Este cliente no se puede anadir a esta reserva por que esta en otra reserva cuyo rango de fecha coincide con esta, dicho de otra manera, si se anadiese este cliente en esta reserva, puede que en un dia o en mas de un dia este cliente estaria asignado a un apartmento distingo en fechas coincidentes";
                        throw new Error(error);
                    }
                    const cambiarClientePoolPorCliente = `
                        UPDATE "reservaPernoctantes"
                        SET "clienteUID" = $1
                        WHERE 
                        "pernoctanteUID" = $2 AND
                        reserva = $3
                        RETURNING
                        habitacion;`;
                    const clientePoolResuelto = await conexion.query(cambiarClientePoolPorCliente, [clienteUID, pernoctanteUID, reservaUID]);
                    if (clientePoolResuelto.rowCount === 0) {
                        const error = "revisa los parametros que introduces por que aunque estan escritos en el formato correcto pero no son correctos";
                        throw new Error(error);
                    }
                    const eliminarClientePool = `
                        DELETE FROM "poolClientes"
                        WHERE "pernoctanteUID" = $1;`;
                    await conexion.query(eliminarClientePool, [pernoctanteUID]);
                    await conexion.query('COMMIT'); // Confirmar la transacción
                    const ok = {
                        ok: "Se ha acualizado el pernoctante correctamente",
                        pernoctanteUID: pernoctanteUID,
                        habitacionUID: clientePoolResuelto.rows[0].habitacion,
                        nombreCompleto: nombreCompleto,
                        pasaporte: pasaporte
                    };
                    salida.json(ok);
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                    bloqueoCambiarTipoClienteEnReserva();
                }
            },
            cambiarPernoctanteDeHabitacion: async () => {
                const mutex = new Mutex();
                const bloqueoCambiarPernoctanteHabitacion = await mutex.acquire();
                try {
                    const reserva = entrada.body.reserva;
                    const habitacionDestino = entrada.body.habitacionDestino;
                    const pernoctanteUID = entrada.body.pernoctanteUID;
                    const validacionReserva = `
                        SELECT 
                        reserva, "estadoReserva", "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `;
                    const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
                    if (resuelveValidacionReserva.rowCount === 0) {
                        const error = "No existe la reserva";
                        throw new Error(error);
                    }
                    if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                        const error = "La reserva no se puede modificar por que esta cancelada";
                        throw new Error(error);
                    }
                    if (resuelveValidacionReserva.rows[0].estadoPago === "pagado") {
                        const error = "La reserva no se puede modificar por que esta pagada";
                        throw new Error(error);
                    }
                    if (resuelveValidacionReserva.rows[0].estadoPago === "reembolsado") {
                        const error = "La reserva no se puede modificar por que esta reembolsada";
                        throw new Error(error);
                    }
                    const consultaExistenciaCliente = `
                        SELECT 
                        "pernoctanteUID" 
                        FROM
                         "reservaPernoctantes" 
                        WHERE
                        reserva = $1 AND "pernoctanteUID" = $2;`;
                    const controlExistencia = await conexion.query(consultaExistenciaCliente, [reserva, pernoctanteUID]);
                    if (controlExistencia.rowCount === 0) {
                        const error = "No existe el pernoctante, por lo tanto no se puede mover de habitacion";
                        throw new Error(error);
                    }
                    const consultaControlUnicoCliente = `
                            SELECT 
                            "pernoctanteUID" 
                            FROM
                            "reservaPernoctantes" 
                            WHERE
                            reserva = $1 AND habitacion = $2 AND "pernoctanteUID" = $3;
                            `;
                    const seleccionaClienteOrigen = await conexion.query(consultaControlUnicoCliente, [reserva, habitacionDestino, pernoctanteUID]);
                    if (seleccionaClienteOrigen.rowCount > 0) {
                        const error = "Ya existe el cliente en esta habitacion";
                        throw new Error(error);
                    }
                    const actualizaNuevaPosicionClientePool = `
                            UPDATE 
                            "reservaPernoctantes"
                            SET
                            habitacion = $1
                            WHERE
                            reserva = $2 AND "pernoctanteUID" = $3;
                            `;
                    const actualizaClientePoolDestino = await conexion.query(actualizaNuevaPosicionClientePool, [habitacionDestino, reserva, pernoctanteUID]);
                    if (actualizaClientePoolDestino.rowCount === 0) {
                        const error = "Ha ocurrido un error al intentar actualiza el cliente pool en el destino";
                        throw new Error(error);
                    }
                    if (actualizaClientePoolDestino.rowCount === 1) {
                        const ok = {
                            ok: "Se ha cambiado correctamente al pernoctante de alojamiento dentro de la reserva "
                        };
                        salida.json(ok);
                    }
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                    bloqueoCambiarPernoctanteHabitacion();
                }
            },
            cambiarCamaHabitacion: async () => {
                const mutex = new Mutex();
                const bloqueoCambiarCamaHabitacion = await mutex.acquire();
                try {
                    const reserva = entrada.body.reserva;
                    const habitacion = entrada.body.habitacion;
                    const nuevaCama = entrada.body.nuevaCama;
                    if (typeof reserva !== 'number' || !Number.isInteger(reserva) || reserva <= 0) {
                        let error = "Se necesita un id de 'reserva' que sea un numero, positio y mayor a cero";
                        throw new Error(error);
                    }
                    if (typeof habitacion !== 'number' || !Number.isInteger(habitacion) || habitacion <= 0) {
                        let error = "Se necesita un id de 'habitacion' que sea un número entero, positivo y mayor a cero";
                        throw new Error(error);
                    }
                    const filtroCadena = /^[A-Za-z\s]+$/;
                    if (!nuevaCama || !filtroCadena.test(nuevaCama)) {
                        let error = "Se necesita un 'nuevaCama' que sea un string con letras y espacios, nada mas";
                        throw new Error(error);
                    }
                    // Valida reserva
                    const validacionReserva = `
                        SELECT 
                        reserva, "estadoReserva", "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `;
                    const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
                    if (resuelveValidacionReserva.rowCount === 0) {
                        const error = "No existe la reserva";
                        throw new Error(error);
                    }
                    if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                        const error = "La reserva no se puede modificar por que esta cancelada";
                        throw new Error(error);
                    }
                    if (resuelveValidacionReserva.rows[0].estadoPago === "pagado") {
                        const error = "La reserva no se puede modificar por que esta pagada";
                        throw new Error(error);
                    }
                    if (resuelveValidacionReserva.rows[0].estadoPago === "reembolsado") {
                        const error = "La reserva no se puede modificar por que esta reembolsada";
                        throw new Error(error);
                    }
                    // valida que la habitacion exista dentro de la reserva
                    const consultaValidacionHabitacion = `
                        SELECT uid 
                        FROM "reservaHabitaciones" 
                        WHERE reserva = $1 AND uid = $2;`;
                    const resuelveconsultaValidacionHabitacion = await conexion.query(consultaValidacionHabitacion, [reserva, habitacion]);
                    if (resuelveconsultaValidacionHabitacion?.rowCount === 0) {
                        const error = "No existe la habitacion dentro de la reserva";
                        throw new Error(error);
                    }
                    // valida camaIDV que entra
                    const consultaValidacionCamaIDV = `
                        SELECT "camaUI" 
                        FROM camas 
                        WHERE cama = $1;`;
                    const resuelveConsultaValidacionCamaIDV = await conexion.query(consultaValidacionCamaIDV, [nuevaCama]);
                    if (resuelveConsultaValidacionCamaIDV?.rowCount === 0) {
                        const error = "No exist el camaIDV introducido en el campo nuevaCama";
                        throw new Error(error);
                    }
                    // Valida que la cama existe dentro de la reserva
                    const resolucionNombreCama = await conexion.query(`SELECT "camaUI" FROM camas WHERE cama = $1`, [nuevaCama]);
                    if (resolucionNombreCama.rowCount === 0) {
                        const error = "No existe el identificador de la camaIDV";
                        throw new Error(error);
                    }
                    const camaUI = resolucionNombreCama.rows[0].camaUI;
                    const consultaExistenciaCama = `
                        SELECT uid 
                        FROM "reservaCamas" 
                        WHERE reserva = $1 AND habitacion = $2;`;
                    const resuelveconsultaExistenciaCama = await conexion.query(consultaExistenciaCama, [reserva, habitacion]);
                    if (resuelveconsultaExistenciaCama.rowCount === 1) {
                        const consultaActualizaCama = `
                            UPDATE "reservaCamas"
                            SET
                            cama = $3,
                            "camaUI" = $4
                            WHERE reserva = $1 AND habitacion = $2;`;
                        const resueleConsultaActualizaCama = await conexion.query(consultaActualizaCama, [reserva, habitacion, nuevaCama, camaUI]);
                        if (resueleConsultaActualizaCama?.rowCount === 1) {
                            const ok = {
                                "ok": "Se ha actualizado correctamten la cama"
                            };
                            salida.json(ok);
                        }
                    }
                    if (resuelveconsultaExistenciaCama.rowCount === 0) {
                        const insertaNuevaCama = `
                            INSERT INTO "reservaCamas"
                            (
                            reserva,
                            habitacion,
                            cama,
                            "camaUI"
                            )
                            VALUES ($1, $2, $3, $4) RETURNING uid
                            `;
                        const resuelveInsertaNuevaCama = await conexion.query(insertaNuevaCama, [reserva, habitacion, nuevaCama, camaUI]);
                        if (resuelveInsertaNuevaCama.rowCount === 1) {
                            const ok = {
                                "ok": "Se ha anadido correctamente la nueva a la habitacion",
                                "nuevoUID": resuelveInsertaNuevaCama.rows[0].uid
                            };
                            salida.json(ok);
                        }
                    }
                    salida.end();
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                    bloqueoCambiarCamaHabitacion();
                }
            },
            listarTipoCamasHabitacion: async () => {
                try {
                    const apartamento = entrada.body.apartamento;
                    const habitacion = entrada.body.habitacion;
                    const filtroCadena = /^[A-Za-z\s\d]+$/;
                    if (!apartamento || !filtroCadena.test(apartamento)) {
                        const error = "Se necesita un apartamento que sea un string con letras y espacios, nada mas";
                        throw new Error(error);
                    }
                    if (!habitacion || !filtroCadena.test(habitacion)) {
                        const error = "Se necesita un habitacion que sea un string con letras y espacios, nada mas";
                        throw new Error(error);
                    }
                    const consultaControlApartamento = `
                        SELECT uid 
                        FROM "configuracionHabitacionesDelApartamento" 
                        WHERE apartamento = $1;`;
                    const controlConfiguracionApartamento = await conexion.query(consultaControlApartamento, [apartamento]);
                    if (controlConfiguracionApartamento.rowCount === 0) {
                        const error = "Ya no existe el apartamento como una configuración del apartamento. Si deseas volver a usar este apartamento, vuelve a crear la configuración del apartamento con el identificador visual: " + apartamento;
                        throw new Error(error);
                    }

                    const consultaControlCamaDelApartamento = `
                        SELECT uid 
                        FROM "configuracionHabitacionesDelApartamento" 
                        WHERE apartamento = $1 AND habitacion = $2;`;
                    const controlConfiguracionCama = await conexion.query(consultaControlCamaDelApartamento, [apartamento, habitacion]);
                    if (controlConfiguracionCama.rowCount === 0) {
                        const error = `Dentro de la configuración de este apartamento ya no esta disponible esta habitación para seleccionar. Para recuperar esta habitación en la configuración de alojamiento, crea una habitación como entidad con el identificador visual ${habitacion} y añádela a la configuración del apartamento con el identificar visual ${apartamento}`;
                        throw new Error(error);
                    }

                    if (controlConfiguracionApartamento.rowCount === 1) {
                        const configuracionApartamento = controlConfiguracionApartamento.rows[0]["uid"];
                        const consultaControlApartamento = `
                            SELECT cama
                            FROM "configuracionCamasEnHabitacion" 
                            WHERE habitacion = $1;`;
                        const configuracionCamasHabitacion = await conexion.query(consultaControlApartamento, [configuracionApartamento]);
                        if (configuracionCamasHabitacion.rowCount === 0) {
                            const error = "No existe ningun tipo de camas configuradas para esta habitacion";
                            throw new Error(error);
                        }
                        const camasResueltas = [];
                        for (const camaPorResolver of configuracionCamasHabitacion.rows) {
                            const camaIDV = camaPorResolver.cama;
                            const consultaResolucionNombresCamas = `
                                SELECT "camaUI", cama
                                FROM camas 
                                WHERE cama = $1;`;
                            const resolucionNombresCamas = await conexion.query(consultaResolucionNombresCamas, [camaIDV]);
                            const nombresCamas = resolucionNombresCamas.rows[0];
                            const camaResuelta = {
                                cama: nombresCamas.cama,
                                camaUI: nombresCamas.camaUI
                            };
                            camasResueltas.push(camaResuelta);
                        }
                        const ok = {
                            camasDisponibles: camasResueltas,
                        };
                        salida.json(ok);
                    }
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            apartamentosDisponiblesAdministracion: async () => {
                try {
                    const fechaEntrada = entrada.body.entrada;
                    const fechaSalida = entrada.body.salida;
                    if (!fechaEntrada) {
                        const error = "falta definir el campo 'entrada'";
                        throw new Error(error);
                    }
                    if (!fechaSalida) {
                        const error = "falta definir el campo 'salida'";
                        throw new Error(error);
                    }
                    const filtroFecha = /^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/)(?:0?[1,3-9]|1[0-2]))\2|(?:(?:0?[1-9])|(?:1[0-9])|(?:2[0-8]))(\/)(?:0?[1-9]|1[0-2]))\3(?:(?:19|20)[0-9]{2})$/;
                    if (!filtroFecha.test(fechaEntrada)) {
                        const error = "el formato fecha de entrada no esta correctametne formateado";
                        throw new Error(error);
                    }
                    if (!filtroFecha.test(fechaSalida)) {
                        const error = "el formato fecha de salida no esta correctametne formateado";
                        throw new Error(error);
                    }
                    const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada)).fecha_ISO;
                    const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida)).fecha_ISO;
                    const rol = entrada.session.rol;
                    const configuracionApartamentosPorRango = {
                        fechaEntrada_ISO: fechaEntrada_ISO,
                        fechaSalida_ISO: fechaSalida_ISO,
                        rol: rol,
                        origen: "administracion"
                    };
                    const transactor = await apartamentosPorRango(configuracionApartamentosPorRango);
                    if (transactor) {
                        const ok = {
                            ok: transactor
                        };
                        salida.json(ok);
                    }
                    salida.end();
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            apartamentosDisponiblesParaAnadirAReserva: async () => {
                try {
                    const fechaEntrada = entrada.body.entrada;
                    const fechaSalida = entrada.body.salida;
                    if (!fechaEntrada) {
                        const error = "falta definir el campo 'entrada'";
                        throw new Error(error);
                    }
                    if (!fechaSalida) {
                        const error = "falta definir el campo 'salida'";
                        throw new Error(error);
                    }
                    const filtroFecha = /^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/)(?:0?[1,3-9]|1[0-2]))\2|(?:(?:0?[1-9])|(?:1[0-9])|(?:2[0-8]))(\/)(?:0?[1-9]|1[0-2]))\3(?:(?:19|20)[0-9]{2})$/;
                    if (!filtroFecha.test(fechaEntrada)) {
                        const error = "el formato fecha de entrada no esta correctametne formateado";
                        throw new Error(error);
                    }
                    if (!filtroFecha.test(fechaSalida)) {
                        const error = "el formato fecha de salida no esta correctametne formateado";
                        throw new Error(error);
                    }
                    const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada)).fecha_ISO;
                    const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida)).fecha_ISO;
                    const rol = entrada.session.rol;
                    const configuracionApartamentosPorRango = {
                        fechaEntrada_ISO: fechaEntrada_ISO,
                        fechaSalida_ISO: fechaSalida_ISO,
                        rol: rol,
                        origen: "administracion"
                    };
                    const transactor = await apartamentosPorRango(configuracionApartamentosPorRango);
                    const apartamentosDisponbilesIDV = transactor.apartamentosDisponibles;
                    const apartamentosNoDisponiblesIDV = transactor.apartamentosNoDisponibles;
                    const estructuraFinal = {
                        apartamentosDisponibles: [],
                        apartamentosNoDisponibles: []
                    };
                    for (const apartamentoIDV of apartamentosDisponbilesIDV) {
                        const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                        const detalleApartamento = {
                            apartamentoIDV: apartamentoIDV,
                            apartamentoUI: apartamentoUI
                        };
                        estructuraFinal.apartamentosDisponibles.push(detalleApartamento);
                    }
                    for (const apartamentoIDV of apartamentosNoDisponiblesIDV) {
                        const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                        const detalleApartamento = {
                            apartamentoIDV: apartamentoIDV,
                            apartamentoUI: apartamentoUI
                        };
                        estructuraFinal.apartamentosNoDisponibles.push(detalleApartamento);
                    }
                    if (transactor) {
                        const ok = {
                            ok: estructuraFinal
                        };
                        salida.json(ok);
                    }
                    salida.end();
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            configuracionApartamento: async () => {
                try {
                    let apartamentos = entrada.body.apartamentos;
                    const transactor = await configuracionApartamento(apartamentos);
                    salida.json(transactor);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            insertarDatosFinancierosReservaExistente: async () => {
                try {
                    const reserva = entrada.body.reserva;
                    if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                        const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo1";
                        throw new Error(error);
                    }
                    const transaccionPrecioReserva = {
                        tipoProcesadorPrecio: "uid",
                        reservaUID: reserva
                    };
                    const resuelvePrecioReserva = await insertarTotalesReserva(transaccionPrecioReserva);
                    const metadatosDetallesReserva = {
                        reservaUID: reserva
                    };
                    const reseuvleDetallesReserva = await detallesReserva(metadatosDetallesReserva);
                    const respuesta = {
                        "ok": resuelvePrecioReserva,
                        "desgloseFinanciero": reseuvleDetallesReserva.desgloseFinanciero
                    };
                    salida.json(respuesta);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            estadoHabitacionesApartamento: async () => {
                try {
                    const apartamento = entrada.body.apartamento;
                    const reserva = entrada.body.reserva;
                    if (typeof apartamento !== "number" || !Number.isInteger(apartamento) || apartamento <= 0) {
                        const error = "El campo 'apartamento' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                        const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    const transaccionInterna = {
                        apartamento: apartamento,
                        reserva: reserva
                    };
                    const resuelveHabitaciones = await estadoHabitacionesApartamento(transaccionInterna);
                    if (resuelveHabitaciones.info) {
                        return salida.json(resuelveHabitaciones);
                    }
                    const habitacionesResuelvas = resuelveHabitaciones.ok;
                    if (habitacionesResuelvas.length === 0) {
                        const ok = {
                            ok: []
                        };
                        salida.json(ok);
                    }
                    if (habitacionesResuelvas.length > 0) {
                        const habitacionesProcesdas = [];
                        for (const habitacionPreProcesada of habitacionesResuelvas) {
                            const consultaHabitacion = `
                                SELECT habitacion, "habitacionUI"
                                FROM habitaciones
                                WHERE habitacion = $1
                                `;
                            const resuelveHabitacion = await conexion.query(consultaHabitacion, [habitacionPreProcesada]);
                            const habitacionIDV = resuelveHabitacion.rows[0].habitacion;
                            const habitaconUI = resuelveHabitacion.rows[0].habitacionUI;
                            const habitacionResuelta = {
                                habitacionIDV: habitacionIDV,
                                habitacionUI: habitaconUI
                            };
                            habitacionesProcesdas.push(habitacionResuelta);
                        }
                        const ok = {
                            ok: habitacionesProcesdas
                        };
                        salida.json(ok);
                    }
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                }
            },
            anadirHabitacionAlApartamentoEnReserva: async () => {
                const mutex = new Mutex();
                const bloqueoaAnadirHabitacionAlApartamentoEnReserva = await mutex.acquire();
                try {
                    let apartamento = entrada.body.apartamento;
                    const reserva = entrada.body.reserva;
                    const habitacion = entrada.body.habitacion;
                    if (typeof apartamento !== "number" || !Number.isInteger(apartamento) || apartamento <= 0) {
                        const error = "El campo 'apartamento' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                        const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    const filtroCadena = /^[a-z0-9]+$/;
                    if (!filtroCadena.test(habitacion)) {
                        const error = "el campo 'habitacion' solo puede ser letras minúsculas y numeros.";
                        throw new Error(error);
                    }
                    const validacionReserva = `
                        SELECT 
                        reserva, "estadoReserva", "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `;
                    const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
                    if (resuelveValidacionReserva.rowCount === 0) {
                        const error = "No existe la reserva";
                        throw new Error(error);
                    }
                    if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                        const error = "La reserva no se puede modificar por que esta cancelada";
                        throw new Error(error);
                    }

                    // Mira las habitaciones diponbiles para anadira este apartamento
                    const transaccionInterna = {
                        "apartamento": apartamento,
                        "reserva": reserva
                    };
                    const resuelveHabitaciones = await estadoHabitacionesApartamento(transaccionInterna);
                    const habitacionesResuelvas = resuelveHabitaciones.ok;
                    if (habitacionesResuelvas.length === 0) {
                        const error = `El apartamento no tiene disponibles mas habitaciones para ser anadidas en base a su configuracion glboal`;
                        throw new Error(error);
                    }
                    if (habitacionesResuelvas.length > 0) {
                        for (const habitacionResuelta of habitacionesResuelvas) {
                            if (habitacion === habitacionResuelta) {
                                const resolucionNombreHabitacion = await conexion.query(`SELECT "habitacionUI" FROM habitaciones WHERE habitacion = $1`, [habitacion]);
                                if (resolucionNombreHabitacion.rowCount === 0) {
                                    const error = "No existe el identificador de la habitacionIDV";
                                    throw new Error(error);
                                }
                                const habitacionUI = resolucionNombreHabitacion.rows[0].habitacionUI;
                                const consultaInsertaHabitacion = `
                                    INSERT INTO "reservaHabitaciones"
                                    (
                                    apartamento,
                                    habitacion,
                                    "habitacionUI",
                                    reserva
                                    )
                                    VALUES ($1, $2, $3, $4) RETURNING uid
                                    `;
                                const resuelveInsercionHabitacion = await conexion.query(consultaInsertaHabitacion, [apartamento, habitacion, habitacionUI, reserva]);
                                if (resuelveInsercionHabitacion.rowCount === 1) {
                                    const ok = {
                                        "ok": `Se ha anadido la ${habitacionUI} al apartamento`,
                                        "nuevoUID": resuelveInsercionHabitacion.rows[0].uid
                                    };
                                    return salida.json(ok);
                                }
                            }
                        }
                        let error = {
                            "error": `No se puede anadir esta habitacion, revisa que este bien escrito los datos y que el apartamento tenga habitaciones disponibles`
                        };
                        salida.json(error)
                    }
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                    bloqueoaAnadirHabitacionAlApartamentoEnReserva();
                }
            },
            anadirApartamentoReserva: async () => {
                const mutex = new Mutex();
                const bloqueoAnadirApartamentoReserva = await mutex.acquire();
                try {
                    const reserva = entrada.body.reserva;
                    const apartamento = entrada.body.apartamento;
                    if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                        const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    const filtroCadena = /^[a-z0-9]+$/;
                    if (!filtroCadena.test(apartamento) || typeof apartamento !== "string") {
                        const error = "el campo 'apartamento' solo puede ser una cadena de letras minúsculas y numeros.";
                        throw new Error(error);
                    }
                    await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado();
                    // Validar que le nombre del apartamento existe como tal
                    const validacionNombreApartamento = `
                        SELECT *
                        FROM "configuracionApartamento"
                        WHERE "apartamentoIDV" = $1
                        `;
                    const resuelveValidacionNombreApartamento = await conexion.query(validacionNombreApartamento, [apartamento]);
                    if (resuelveValidacionNombreApartamento.rowCount === 0) {
                        const error = "No existe el nombre del apartamento, revisa el nombre escrito";
                        throw new Error(error);
                    }
                    // valida reserva y obten fechas
                    const validacionReserva = `
                        SELECT 
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO",
                        "estadoReserva", 
                        "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `;
                    const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
                    if (resuelveValidacionReserva.rowCount === 0) {
                        const error = "No existe la reserva";
                        throw new Error(error);
                    }
                    if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                        const error = "La reserva no se puede modificar por que esta cancelada";
                        throw new Error(error);
                    }
                    const fechaEntrada_ISO = resuelveValidacionReserva.rows[0].fechaEntrada_ISO;
                    const fechaSalida_ISO = resuelveValidacionReserva.rows[0].fechaSalida_ISO;
                    // ACABAR ESTA SENTENCIA DE ABAJO--
                    // validar que el apartamento no este ya en la reserva
                    const validacionHabitacionYaExisteneEnReserva = `
                        SELECT 
                        apartamento
                        FROM "reservaApartamentos"
                        WHERE reserva = $1 AND apartamento = $2
                        `;
                    const resuelvevalidacionHabitacionYaExisteneEnReserva = await conexion.query(validacionHabitacionYaExisteneEnReserva, [reserva, apartamento]);
                    if (resuelvevalidacionHabitacionYaExisteneEnReserva.rowCount === 1) {
                        const error = "El apartamento ya existe en la reserva";
                        throw new Error(error);
                    }
                    const rol = entrada.session.rol;
                    const configuracionApartamentosPorRango = {
                        fechaEntrada_ISO: fechaEntrada_ISO,
                        fechaSalida_ISO: fechaSalida_ISO,
                        rol: rol,
                        origen: "administracion"
                    };
                    const resuelveApartamentosDisponibles = await apartamentosPorRango(configuracionApartamentosPorRango);
                    const apartamentosDisponiblesResueltos = resuelveApartamentosDisponibles.apartamentosDisponibles;
                    if (apartamentosDisponiblesResueltos.length === 0) {
                        const error = "No hay ningun apartamento disponbile para las fechas de la reserva";
                        throw new Error(error);
                    }
                    if (apartamentosDisponiblesResueltos.length > 0) {
                        let resultadoValidacion = null;
                        for (const apartamentosDisponible of apartamentosDisponiblesResueltos) {
                            if (apartamento === apartamentosDisponible) {
                                resultadoValidacion = apartamento;
                            }
                        }
                        const apartamentoUI = await resolverApartamentoUI(apartamento);
                        const insertarApartamento = `
                                INSERT INTO "reservaApartamentos"
                                (
                                reserva,
                                apartamento,
                                "apartamentoUI"
                                )
                                VALUES ($1, $2, $3) RETURNING uid
                                `;
                        const resuelveInsertarApartamento = await conexion.query(insertarApartamento, [reserva, apartamento, apartamentoUI]);
                        if (resuelveInsertarApartamento.rowCount === 1) {
                            const transaccionPrecioReserva = {
                                tipoProcesadorPrecio: "uid",
                                reservaUID: reserva
                            };
                            await insertarTotalesReserva(transaccionPrecioReserva);
                            const ok = {
                                ok: "apartamento anadido correctamente",
                                apartamentoIDV: apartamento,
                                apartamentoUI: apartamentoUI,
                                nuevoUID: resuelveInsertarApartamento.rows[0].uid,
                            };
                            salida.json(ok);
                        }
                    }
                    // En el modo forzoso el apartamento entra igual
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                    bloqueoAnadirApartamentoReserva();
                }
            },
            eliminarApartamentoReserva: async () => {
                const mutex = new Mutex();
                const bloqueoEliminarApartamentoReserva = await mutex.acquire();
                try {
                    const reserva = entrada.body.reserva;
                    // apartamentoUID
                    const apartamento = entrada.body.apartamento;
                    const tipoBloqueo = entrada.body.tipoBloqueo;
                    if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                        const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (typeof apartamento !== "number" || !Number.isInteger(apartamento) || apartamento <= 0) {
                        const error = "el campo 'apartamento' solo puede un numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (tipoBloqueo !== "permanente" && tipoBloqueo !== "rangoTemporal" && tipoBloqueo !== "sinBloqueo") {
                        const error = "El campo 'tipoBloqueo' solo puede ser 'permanente', 'rangoTemporal', 'sinBloquo'";
                        throw new Error(error);
                    }

                    await conexion.query('BEGIN'); // Inicio de la transacción


                    // Comprobar que la reserva exisste
                    const validacionReserva = `
                        SELECT 
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO",
                        "estadoReserva",
                        "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `;
                    const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
                    if (resuelveValidacionReserva.rowCount === 0) {
                        const error = "No existe la reserva";
                        throw new Error(error);
                    }
                    if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                        const error = "La reserva no se puede modificar por que esta cancelada";
                        throw new Error(error);
                    }
                    // Comprobar si existen totales en esta reserva
                    const validarExistenciaTotales = `
                        SELECT 
                        *
                        FROM "reservaTotales"
                        WHERE reserva = $1
                        `;
                    const resuelveValidarExistenciaTotales = await conexion.query(validarExistenciaTotales, [reserva]);
                    let estadoInfomracionFinanciera = "actualizar";
                    const fechaEntrada_ISO = resuelveValidacionReserva.rows[0].fechaEntrada_ISO;
                    const fechaSalida_ISO = resuelveValidacionReserva.rows[0].fechaSalida_ISO;
                    const metadatos = {
                        reserva: reserva,
                        apartamentoUID: apartamento,
                        tipoBloqueo: tipoBloqueo,
                        fechaEntrada_ISO: fechaEntrada_ISO,
                        fechaSalida_ISO: fechaSalida_ISO,
                        zonaBloqueo: "publico",
                        origen: "eliminacionApartamentoDeReserva"
                    };
                    await bloquearApartamentos(metadatos);
                    const eliminaApartamentoReserva = `
                        DELETE 
                        FROM 
                            "reservaApartamentos"
                        WHERE 
                            uid = $1 
                        AND 
                            reserva = $2;
                        `;
                    const resuelveEliminaApartamentoReserva = await conexion.query(eliminaApartamentoReserva, [apartamento, reserva]);
                    if (resuelveEliminaApartamentoReserva.rowCount === 1) {
                        const consultaNumeroDeApartamentos = `
                            SELECT 
                            *
                            FROM "reservaApartamentos"
                            WHERE reserva = $1
                            `;
                        const resuelveNumeroDeApartamentosRestantesEnReserva = await conexion.query(consultaNumeroDeApartamentos, [reserva]);
                        if (resuelveNumeroDeApartamentosRestantesEnReserva.rowCount === 0) {
                            const eliminaApartamentoReservaQueries = [
                                'DELETE FROM "reservaImpuestos" WHERE reserva = $1;',
                                'DELETE FROM "reservaOfertas" WHERE reserva = $1;',
                                'DELETE FROM "reservaTotales" WHERE reserva = $1;',
                                'DELETE FROM "reservaTotalesPorApartamento" WHERE reserva = $1;',
                                'DELETE FROM "reservaTotalesPorNoche" WHERE reserva = $1;'
                            ];
                            for (const query of eliminaApartamentoReservaQueries) {
                                await conexion.query(query, [reserva]);
                            }
                        }
                        if (resuelveNumeroDeApartamentosRestantesEnReserva.rowCount > 0) {
                            const transaccionPrecioReserva = {
                                tipoProcesadorPrecio: "uid",
                                reservaUID: reserva
                            };
                            await insertarTotalesReserva(transaccionPrecioReserva);
                        }
                        await conexion.query('COMMIT'); // Confirmar la transacción
                        const ok = {};
                        ok.estadoDesgloseFinanciero = estadoInfomracionFinanciera;
                        if (tipoBloqueo === "rangoTemporal") {
                            ok.ok = "Se ha eliminado el apartamento y aplicado el bloqueo temporal";
                        }
                        if (tipoBloqueo === "permanente") {
                            ok.ok = "Se ha eliminado el apartamento y aplicado el bloqueo permanente";
                        }
                        if (tipoBloqueo === "sinBloqueo") {
                            ok.ok = "Se ha eliminado el apartamento de la reserva y se ha liberado";
                        }
                        salida.json(ok);
                    }
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                    bloqueoEliminarApartamentoReserva();
                }
            },
            eliminarHabitacionReserva: async () => {
                const mutex = new Mutex();
                const bloqueoEliminarHabitacionReserva = await mutex.acquire();
                try {
                    let reserva = entrada.body.reserva;
                    // apartamentoUID
                    let habitacion = entrada.body.habitacion;
                    let pernoctantes = entrada.body.pernoctantes;
                    if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                        const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (typeof habitacion !== "number" || !Number.isInteger(habitacion) || habitacion <= 0) {
                        const error = "el campo 'habitacion' solo puede un numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (pernoctantes !== "conservar" && pernoctantes !== "eliminar") {
                        const error = "El campo 'pernoctantes' solo puede ser 'conservar', 'mantener'";
                        throw new Error(error);
                    }
                    // Comprobar que la reserva exisste
                    const validacionReserva = `
                        SELECT 
                        reserva, "estadoReserva", "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `;
                    let resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
                    if (resuelveValidacionReserva.rowCount === 0) {
                        const error = "No existe la reserva";
                        throw new Error(error);
                    }
                    if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                        const error = "La reserva no se puede modificar por que esta cancelada";
                        throw new Error(error);
                    }
                    if (resuelveValidacionReserva.rows[0].estadoPago === "pagado") {
                        const error = "La reserva no se puede modificar por que esta pagada";
                        throw new Error(error);
                    }
                    if (resuelveValidacionReserva.rows[0].estadoPago === "reembolsado") {
                        const error = "La reserva no se puede modificar por que esta reembolsada";
                        throw new Error(error);
                    }
                    // validar habitacion
                    const validacionHabitacion = `
                        SELECT 
                        uid
                        FROM "reservaHabitaciones"
                        WHERE reserva = $1 AND uid = $2
                        `;
                    let resuelveValidacionHabitacion = await conexion.query(validacionHabitacion, [reserva, habitacion]);
                    if (resuelveValidacionHabitacion.rowCount === 0) {
                        const error = "No existe la habitacion dentro de la reserva";
                        throw new Error(error);
                    }
                    let ok;
                    if (pernoctantes === "eliminar") {
                        let eliminarPernoctantes = `
                            DELETE FROM "reservaPernoctantes"
                            WHERE habitacion = $1 AND reserva = $2;
                            `;
                        let resuelveEliminarPernoctantes = await conexion.query(eliminarPernoctantes, [habitacion, reserva]);
                        ok = {
                            "ok": "Se ha eliminado al habitacion correctamente y los pernoctanes que contenia"
                        };
                    }
                    let eliminaHabitacionReserva = `
                        DELETE FROM "reservaHabitaciones"
                        WHERE uid = $1 AND reserva = $2;
                        `;
                    let resuelveEliminaHabitacionReserva = await conexion.query(eliminaHabitacionReserva, [habitacion, reserva]);
                    if (pernoctantes === "conservar") {
                        let desasignaPernoctanteDeHabitacion = `
                            UPDATE "reservaPernoctantes"
                            SET habitacion = NULL
                            WHERE reserva = $1 AND habitacion = $2;
                            `;
                        await conexion.query(desasignaPernoctanteDeHabitacion, [reserva, habitacion]);
                        ok = {
                            "ok": "Se ha eliminado al habitacion correctamente pero los pernoctantes que contenia siguen asignados a la reserva"
                        };
                    }
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                    bloqueoEliminarHabitacionReserva();
                }
            },
            anadirPernoctanteHabitacion: async () => {
                const mutex = new Mutex();
                const bloqueoAnadirPernoctanteHabitacion = await mutex.acquire();
                try {
                    const reserva = entrada.body.reserva;
                    const habitacionUID = entrada.body.habitacionUID;
                    const clienteUID = entrada.body.clienteUID;
                    if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                        const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (typeof habitacionUID !== "number" || !Number.isInteger(habitacionUID) || habitacionUID <= 0) {
                        const error = "el campo 'habitacionUID' solo puede un numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (typeof clienteUID !== "number" || !Number.isInteger(clienteUID) || clienteUID <= 0) {
                        const error = "el campo 'clienteUID' solo puede un numero, entero y positivo";
                        throw new Error(error);
                    }
                    await conexion.query('BEGIN'); // Inicio de la transacción


                    // Comprobar que la reserva exisste
                    const validacionReserva = `
                        SELECT 
                        reserva,
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO",
                        "estadoReserva",
                        "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `;
                    const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
                    if (resuelveValidacionReserva.rowCount === 0) {
                        const error = "No existe la reserva";
                        throw new Error(error);
                    }
                    if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                        const error = "La reserva no se puede modificar por que esta cancelada";
                        throw new Error(error);
                    }
                    // validar habitacion
                    const validacionHabitacion = `
                        SELECT 
                        uid
                        FROM "reservaHabitaciones"
                        WHERE reserva = $1 AND uid = $2
                        `;
                    const resuelveValidacionHabitacion = await conexion.query(validacionHabitacion, [reserva, habitacionUID]);
                    if (resuelveValidacionHabitacion.rowCount === 0) {
                        const error = "No existe la habitacion dentro de esta reserva";
                        throw new Error(error);
                    }
                    // validar cliente
                    const validacionCliente = `
                        SELECT 
                        uid
                        FROM clientes
                        WHERE uid = $1
                        `;
                    const resuelveValidacionCliente = await conexion.query(validacionCliente, [clienteUID]);
                    if (resuelveValidacionCliente.rowCount === 0) {
                        const error = "No existe el cliente";
                        throw new Error(error);
                    }
                    // No se puede anadir un pernoctante ya existen a la reserva, proponer moverlo de habitacion
                    const validacionUnicidadPernoctante = `
                        SELECT 
                        "pernoctanteUID"
                        FROM "reservaPernoctantes"
                        WHERE "clienteUID" = $1 AND reserva = $2
                        `;
                    const resuelveValidacionUnicidadPernoctante = await conexion.query(validacionUnicidadPernoctante, [clienteUID, reserva]);
                    if (resuelveValidacionUnicidadPernoctante.rowCount === 1) {
                        const error = "Este cliente ya es un pernoctante dentro de esta reserva, mejor muevalo de habitacion";
                        throw new Error(error);
                    }
                    const insertarClienteExistenteEnReserva = `
                        INSERT INTO "reservaPernoctantes"
                        (
                        reserva,
                        habitacion,
                        "clienteUID"
                        )
                        VALUES ($1, $2,$3) RETURNING "pernoctanteUID"
                        `;
                    const resuelveInsertarClienteExistenteEnReserva = await conexion.query(insertarClienteExistenteEnReserva, [reserva, habitacionUID, clienteUID]);
                    if (resuelveInsertarClienteExistenteEnReserva.rowCount === 1) {
                        const ok = {
                            ok: "Se ha anadido correctamente el cliente en la habitacin de la reserva",
                            nuevoUID: resuelveInsertarClienteExistenteEnReserva.rows[0].pernoctanteUID
                        };
                        salida.json(ok);
                    }
                    if (resuelveInsertarClienteExistenteEnReserva.rowCount === 0) {
                        const error = "Ha ocurrido un error al final del proceso y no se ha anadido el cliente";
                        throw new Error(error);
                    }
                    await conexion.query('COMMIT'); // Confirmar la transacción
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                    bloqueoAnadirPernoctanteHabitacion();
                }
            },
            crearClienteDesdeReservaYAnadirloAreserva: async () => {
                const mutex = new Mutex();
                const bloqueoCrearClienteDesdeReservaYAnadirloAreserva = await mutex.acquire();
                try {
                    const reserva = entrada.body.reserva;
                    const habitacionUID = entrada.body.habitacionUID;
                    const nombre = entrada.body.nombre;
                    const primerApellido = entrada.body.primerApellido;
                    const segundoApellido = entrada.body.segundoApellido;
                    const pasaporte = entrada.body.pasaporte;
                    const telefono = entrada.body.telefono;
                    const correoElectronico = entrada.body.correoElectronico;
                    if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                        const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (typeof habitacionUID !== "number" || !Number.isInteger(habitacionUID) || habitacionUID <= 0) {
                        const error = "el campo 'habitacionUID' solo puede un numero, entero y positivo";
                        throw new Error(error);
                    }
                    // Comprobar que la reserva exisste
                    const validacionReserva = `
                        SELECT 
                        reserva, "estadoReserva", "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `;
                    const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
                    if (resuelveValidacionReserva.rowCount === 0) {
                        const error = "No existe la reserva";
                        throw new Error(error);
                    }
                    if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                        const error = "La reserva no se puede modificar por que esta cancelada";
                        throw new Error(error);
                    }
                    // validar habitacion
                    const validacionHabitacion = `
                        SELECT 
                        uid
                        FROM "reservaHabitaciones"
                        WHERE reserva = $1 AND uid = $2
                        `;
                    const resuelveValidacionHabitacion = await conexion.query(validacionHabitacion, [reserva, habitacionUID]);
                    if (resuelveValidacionHabitacion.rowCount === 0) {
                        const error = "No existe la habitacion dentro de esta reserva";
                        throw new Error(error);
                    }
                    const nuevoClientePorValidar = {
                        nombre: nombre,
                        primerApellido: primerApellido,
                        segundoApellido: segundoApellido,
                        pasaporte: pasaporte,
                        telefono: telefono,
                        correoElectronico: correoElectronico,
                    };
                    const datosValidados = await validadoresCompartidos.clientes.nuevoCliente(nuevoClientePorValidar);
                    const datosNuevoCliente = {
                        nombre: datosValidados.nombre,
                        primerApellido: datosValidados.primerApellido,
                        segundoApellido: datosValidados.segundoApellido,
                        pasaporte: datosValidados.pasaporte,
                        telefono: datosValidados.telefono,
                        correoElectronico: datosValidados.correoElectronico
                    };
                    const nuevoClienteInsertado = await insertarCliente(datosNuevoCliente);
                    const nuevoUIDCliente = nuevoClienteInsertado.uid;
                    const insertarPernoctante = `
                        INSERT INTO 
                        "reservaPernoctantes"
                        (
                        reserva,
                        habitacion,
                        "clienteUID"
                        )
                        VALUES ($1,$2,$3)
                        RETURNING
                        "pernoctanteUID"
                        `;
                    const resuelveInsertarPernoctante = await conexion.query(insertarPernoctante, [reserva, habitacionUID, nuevoUIDCliente]);
                    if (resuelveInsertarPernoctante.rowCount === 0) {
                        const error = "No se ha insertardo el pernoctante en al reserva";
                        throw new Error(error);
                    }
                    if (resuelveInsertarPernoctante.rowCount === 1) {
                        const ok = {
                            ok: "Se ha anadido correctamente el cliente en la habitacin de la reserva",
                            nuevoUIDPernoctante: resuelveInsertarPernoctante.rows[0].pernoctanteUID,
                            nuevoUIDCliente: nuevoUIDCliente,
                            nuevoCliente: {
                                nombre: datosValidados.nombre,
                                primerApellido: datosValidados.primerApellido,
                                segundoApellido: datosValidados.segundoApellido,
                                pasaporte: datosValidados.pasaporte,
                                telefono: datosValidados.telefono,
                                correoElectronico: datosValidados.correoElectronico
                            }
                        };
                        salida.json(ok);
                    }
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                    bloqueoCrearClienteDesdeReservaYAnadirloAreserva();
                }
            },
            guardarNuevoClienteYSustituirloPorElClientePoolActual: async () => {
                const mutex = new Mutex();
                const bloqueoGuardarNuevoClienteYSustituirloPorElClientePoolActual = await mutex.acquire();
                try {
                    const reserva = entrada.body.reserva;
                    const pernoctanteUID = entrada.body.pernoctanteUID;
                    let nombre = entrada.body.nombre;
                    let primerApellido = entrada.body.primerApellido;
                    let segundoApellido = entrada.body.segundoApellido;
                    let pasaporte = entrada.body.pasaporte;
                    let telefono = entrada.body.telefono;
                    let correoElectronico = entrada.body.correoElectronico;
                    if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                        const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (typeof pernoctanteUID !== "number" || !Number.isInteger(pernoctanteUID) || pernoctanteUID <= 0) {
                        const error = "el campo 'pernoctanteUID' solo puede un numero, entero y positivo";
                        throw new Error(error);
                    }
                    const nuevoClienteParaValidar = {
                        nombre: nombre,
                        primerApellido: primerApellido,
                        segundoApellido: segundoApellido,
                        pasaporte: pasaporte,
                        telefono: telefono,
                        correoElectronico: correoElectronico,
                        //notas: notas,
                    };
                    const datosValidados = await validadoresCompartidos.clientes.nuevoCliente(nuevoClienteParaValidar);
                    nombre = datosValidados.nombre;
                    primerApellido = datosValidados.primerApellido;
                    segundoApellido = datosValidados.segundoApellido;
                    pasaporte = datosValidados.pasaporte;
                    telefono = datosValidados.telefono;
                    correoElectronico = datosValidados.correoElectronico;
                    // Comprobar que la reserva exisste
                    const validacionReserva = `
                        SELECT 
                        reserva, "estadoReserva", "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `;
                    const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
                    if (resuelveValidacionReserva.rowCount === 0) {
                        const error = "No existe la reserva";
                        throw new Error(error);
                    }
                    if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                        const error = "La reserva no se puede modificar por que esta cancelada";
                        throw new Error(error);
                    }
                    // validar pernoctante y extraer el UID del clientePool
                    const validacionPernoctante = `
                        SELECT 
                        "clienteUID"
                        FROM 
                        "reservaPernoctantes"
                        WHERE 
                        reserva = $1 AND "pernoctanteUID" = $2
                        `;
                    const resuelveValidacionPernoctante = await conexion.query(validacionPernoctante, [reserva, pernoctanteUID]);
                    if (resuelveValidacionPernoctante.rowCount === 0) {
                        const error = "No existe el pernoctanteUID dentro de esta reserva";
                        throw new Error(error);
                    }
                    const clienteUID = resuelveValidacionPernoctante.rows[0].clienteUID;
                    if (clienteUID) {
                        const error = "El pernoctnte ya es un cliente y un clientePool";
                        throw new Error(error);
                    }
                    const ok = {};
                    const datosNuevoCliente = {
                        nombre: nombre,
                        primerApellido: primerApellido,
                        segundoApellido: segundoApellido,
                        pasaporte: pasaporte,
                        telefono: telefono,
                        correoElectronico: correoElectronico,
                        notas: null
                    };
                    const nuevoCliente = await insertarCliente(datosNuevoCliente);
                    const nuevoUIDCliente = nuevoCliente.uid;
                    // Borrar clientePool
                    const eliminarClientePool = `
                        DELETE FROM "poolClientes"
                        WHERE "pernoctanteUID" = $1;`;
                    const resuelveEliminarClientePool = await conexion.query(eliminarClientePool, [pernoctanteUID]);
                    if (resuelveEliminarClientePool.rowCount === 0) {
                        ok.informacion = "No se ha encontrado un clientePool asociado al pernoctante";
                    }
                    const actualizaPernoctanteReserva = `
                            UPDATE "reservaPernoctantes"
                            SET "clienteUID" = $3
                            WHERE reserva = $1 AND "pernoctanteUID" = $2
                            RETURNING
                            habitacion;
                            `;
                    const resuelveActualizaPernoctanteReserva = await conexion.query(actualizaPernoctanteReserva, [reserva, pernoctanteUID, nuevoUIDCliente]);
                    if (resuelveActualizaPernoctanteReserva.rowCount === 0) {
                        const error = "No se ha podido actualizar al pernoctante dentro de la reserva";
                        throw new Error(error);
                    }
                    if (resuelveActualizaPernoctanteReserva.rowCount === 1) {
                        const habitacionUID = resuelveActualizaPernoctanteReserva.rows[0].habitacion;
                        primerApellido = primerApellido ? primerApellido : "";
                        segundoApellido = segundoApellido ? segundoApellido : "";
                        ok.ok = "Se ha guardado al nuevo cliente y sustituido por el clientePool, tambien se ha eliminado al clientePool de la base de datos";
                        ok.nuevoClienteUID = nuevoUIDCliente;
                        ok.nombreCompleto = `${nombre} ${primerApellido} ${segundoApellido}`;
                        ok.pasaporte = pasaporte;
                        ok.habitacionUID = habitacionUID;
                        salida.json(ok);
                    }
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                    bloqueoGuardarNuevoClienteYSustituirloPorElClientePoolActual();
                }
            },
            eliminarPernoctanteReserva: async () => {
                const mutex = new Mutex();
                const bloqueoEliminarPernoctanteReserva = await mutex.acquire();
                try {
                    const reserva = entrada.body.reserva;
                    const pernoctanteUID = entrada.body.pernoctanteUID;
                    const tipoElinacion = entrada.body.tipoEliminacion;
                    if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                        const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (typeof pernoctanteUID !== "number" || !Number.isInteger(pernoctanteUID) || pernoctanteUID <= 0) {
                        const error = "El campo 'pernoctanteUID' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (typeof tipoElinacion !== "string" || (tipoElinacion !== "habitacion" && tipoElinacion !== "reserva")) {
                        const error = "El campo 'tipoElinacion' solo puede ser 'habitacion' o 'reserva'";
                        throw new Error(error);
                    }
                    await conexion.query('BEGIN'); // Inicio de la transacción


                    // Comprobar que la reserva exisste
                    const validacionReserva = `
                        SELECT 
                        reserva, "estadoReserva", "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `;
                    const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
                    if (resuelveValidacionReserva.rowCount === 0) {
                        const error = "No existe la reserva";
                        throw new Error(error);
                    }
                    if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                        const error = "La reserva no se puede modificar por que esta cancelada";
                        throw new Error(error);
                    }
                    // validar habitacion
                    const validarCliente = `
                            SELECT 
                            "pernoctanteUID"
                            FROM
                            "reservaPernoctantes"
                            WHERE
                            reserva = $1 AND "pernoctanteUID" = $2
                            `;
                    const resuelveValidarCliente = await conexion.query(validarCliente, [reserva, pernoctanteUID]);
                    if (resuelveValidarCliente.rowCount === 0) {
                        const error = "No existe el pernoctante en la reserva";
                        throw new Error(error);
                    }
                    const eliminaClientePool = `
                            DELETE FROM "poolClientes"
                            WHERE "pernoctanteUID" = $1;
                            `;
                    await conexion.query(eliminaClientePool, [pernoctanteUID]);
                    let sentenciaDinamica;
                    if (tipoElinacion === "habitacion") {
                        sentenciaDinamica = `
                            UPDATE "reservaPernoctantes"
                            SET habitacion = NULL
                            WHERE reserva = $1 AND "pernoctanteUID" = $2 ;
                            `;
                    }
                    if (tipoElinacion === "reserva") {
                        sentenciaDinamica = `
                            DELETE FROM "reservaPernoctantes"
                            WHERE reserva = $1 AND "pernoctanteUID" = $2;
                            `;
                    }
                    const actualicarPernoctante = await conexion.query(sentenciaDinamica, [reserva, pernoctanteUID]);
                    if (actualicarPernoctante.rowCount === 0) {
                        const error = "No existe el pernoctante en la reserva, por lo tanto no se puede actualizar";
                        throw new Error(error);
                    }
                    if (actualicarPernoctante.rowCount === 1) {
                        let ok;
                        if (tipoElinacion === "habitacion") {
                            ok = {
                                "ok": "Se ha eliminado al pernoctante de la habitacion"
                            };
                        }
                        if (tipoElinacion === "reserva") {
                            ok = {
                                "ok": "Se ha eliminar al pernoctante de la reserva"
                            };
                        }
                        salida.json(ok);
                    }
                    await conexion.query('COMMIT'); // Confirmar la transacción
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                    bloqueoEliminarPernoctanteReserva();
                }
            },
            obtenerElasticidadDelRango: async () => {
                const mutex = new Mutex();
                const bloqueoModificarFechaReserva = await mutex.acquire();
                try {
                    const reserva = entrada.body.reserva;
                    const sentidoRango = entrada.body.sentidoRango;
                    const mesCalendario = entrada.body.mesCalendario;
                    const anoCalendario = entrada.body.anoCalendario;
                    if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                        const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (sentidoRango !== "pasado" && sentidoRango !== "futuro") {
                        const error = "El campo 'sentidoRango' solo puede ser pasado o futuro";
                        throw new Error(error);
                    }
                    const regexMes = /^\d{2}$/;
                    const regexAno = /^\d{4,}$/;
                    if (!regexAno.test(anoCalendario)) {
                        const error = "El año (anoCalenadrio) debe de ser una cadena de cuatro digitos. Por ejemplo el año uno se escribiria 0001";
                        throw new Error(error);
                    }
                    if (!regexMes.test(mesCalendario)) {
                        const error = "El mes (mesCalendario) debe de ser una cadena de dos digitos, por ejemplo el mes de enero se escribe 01";
                        throw new Error(error);
                    }
                    const mesNumeroControl = parseInt(mesCalendario, 10);
                    const anoNumeroControl = parseInt(anoCalendario, 10);
                    if (mesNumeroControl < 1 && mesNumeroControl > 12 && anoNumeroControl < 2000) {
                        const error = "Revisa los datos de mes por que debe de ser un numero del 1 al 12";
                        throw new Error(error);
                    }
                    if (anoNumeroControl < 2000 || anoNumeroControl > 5000) {
                        const error = "El año no puede ser inferior a 2000 ni superior a 5000";
                        throw new Error(error);
                    }
                    const metadatos = {
                        reserva: reserva,
                        sentidoRango: sentidoRango,
                        anoCalendario: anoCalendario,
                        mesCalendario: mesCalendario
                    };
                    const validacionReserva = `
                        SELECT 
                        reserva, "estadoReserva", "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `;
                    const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
                    if (resuelveValidacionReserva.rowCount === 0) {
                        const error = "No existe la reserva";
                        throw new Error(error);
                    }
                    if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                        const error = "La reserva no se puede modificar por que esta cancelada";
                        throw new Error(error);
                    }
                    const transaccionInterna = await validarModificacionRangoFechaResereva(metadatos);
                    const ok = {
                        ok: transaccionInterna
                    };
                    salida.json(transaccionInterna);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                    bloqueoModificarFechaReserva();
                }
            },
            estadoReserva: async () => {
                try {
                    let reserva = entrada.body.reserva;
                    if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                        const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    const consultaEstadoReservas = `
                        SELECT 
                        reserva,
                        "estadoPago",
                        "estadoReserva"
                        FROM reservas 
                        WHERE reserva = $1;`;
                    const resuelveConsultaEstadoReservas = await conexion.query(consultaEstadoReservas, [reserva]);
                    if (resuelveConsultaEstadoReservas.rowCount === 0) {
                        const error = "No existe al reserva";
                        throw new Error(error);
                    }
                    if (resuelveConsultaEstadoReservas.rowCount === 1) {
                        const ok = {
                            "estadoReserva": resuelveConsultaEstadoReservas.rows[0].estadoReserva,
                            "estadoPago": resuelveConsultaEstadoReservas.rows[0].estadoPago
                        };
                        salida.json(ok);
                    }
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            confirmarModificarFechaReserva: async () => {
                const mutex = new Mutex();
                const bloqueoConfirmarModificarFechaReserva = await mutex.acquire();
                try {
                    const reserva = entrada.body.reserva;
                    const sentidoRango = entrada.body.sentidoRango;
                    const fechaSolicitada_ISO = entrada.body.fechaSolicitada_ISO;
                    if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                        const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (sentidoRango !== "pasado" && sentidoRango !== "futuro") {
                        const error = "El campo 'sentidoRango' solo puede ser pasado o futuro";
                        throw new Error(error);
                    }
                    await validadoresCompartidos.fechas.validarFecha_ISO(fechaSolicitada_ISO);
                    const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
                    const fechaSolicitada_objeto = DateTime.fromISO(fechaSolicitada_ISO, { zone: zonaHoraria });
                    const fechaSolicitada_array = fechaSolicitada_ISO.split("-");
                    await conexion.query('BEGIN'); // Inicio de la transacción
                    const mesSeleccionado = fechaSolicitada_array[1];
                    const anoSeleccionado = fechaSolicitada_array[0];
                    const validacionReserva = `
                        SELECT 
                        reserva,
                        "estadoReserva", 
                        "estadoPago",
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO"
                        FROM
                        reservas
                        WHERE
                        reserva = $1
                        `;
                    const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
                    if (resuelveValidacionReserva.rowCount === 0) {
                        const error = "No existe la reserva";
                        throw new Error(error);
                    }
                    if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                        const error = "La reserva no se puede modificar por que esta cancelada, una reserva cancelada no interfiere en los dias ocupados";
                        throw new Error(error);
                    }
                    const detallesReserva = resuelveValidacionReserva.rows[0];
                    const fechaEntrada_ISO = detallesReserva.fechaEntrada_ISO;
                    const fechaEntrada_Objeto = DateTime.fromISO(fechaEntrada_ISO, { zone: zonaHoraria });
                    const fechaSalida_ISO = detallesReserva.fechaSalida_ISO;
                    const fechaSalida_Objeto = DateTime.fromISO(fechaSalida_ISO, { zone: zonaHoraria });
                    const metadatos = {
                        reserva: reserva,
                        mesCalendario: mesSeleccionado,
                        anoCalendario: anoSeleccionado,
                        sentidoRango: sentidoRango
                    };
                    if (sentidoRango === "pasado") {



                        if (fechaSalida_Objeto <= fechaSolicitada_objeto) {
                            const mensajeSinPasado = "La fecha nueva fecha de entrada solicitada no puede ser igual o superior a la fecha de salida de la reserva.";
                            throw new Error(mensajeSinPasado);
                        }
                        const transaccionInterna = await validarModificacionRangoFechaResereva(metadatos);
                        const codigoFinal = transaccionInterna.ok;
                        const transaccionPrecioReserva = {
                            tipoProcesadorPrecio: "uid",
                            reservaUID: reserva
                        };
                        const mensajeSinPasado = "No se puede aplicar esa fecha de entrada a la reserva por que en base a los apartamentos de esa reserva no hay dias libres. Puedes ver a continuacíon lo eventos que lo impiden.";


                        if ((codigoFinal === "noHayRangoPasado")
                            &&
                            (fechaEntrada_Objeto > fechaSolicitada_objeto)) {
                            const estructura = {
                                detallesDelError: mensajeSinPasado,
                                ...transaccionInterna
                            };
                            throw new vitiniSysError(estructura);
                        }

                        if ((codigoFinal === "rangoPasadoLimitado")
                            &&
                            (fechaEntrada_Objeto > fechaSolicitada_objeto)) {
                            const fechaLimite_objeto = DateTime.fromISO(transaccionInterna.limitePasado);
                            if (fechaLimite_objeto > fechaSolicitada_objeto) {
                                const estructura = {
                                    detallesDelError: mensajeSinPasado,
                                    ...transaccionInterna
                                };
                                throw new vitiniSysError(estructura);
                            }
                        }
                        const actualizarModificacionFechaEntradaReserva = `
                            UPDATE reservas
                            SET entrada = $1
                            WHERE reserva = $2
                            RETURNING
                            to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO";
                            `;
                        const resuelveActualizarModificacionFechaEntradaReserva = await conexion.query(actualizarModificacionFechaEntradaReserva, [fechaSolicitada_ISO, reserva]);
                        if (resuelveActualizarModificacionFechaEntradaReserva.rowCount === 1) {
                            const nuevaFechaEntrada = resuelveActualizarModificacionFechaEntradaReserva.rows[0].fechaEntrada_ISO;
                            await insertarTotalesReserva(transaccionPrecioReserva);
                            const ok = {
                                ok: "Se ha actualizado correctamente la fecha de entrada en la reserva",
                                sentidoRango: "pasado",
                                fecha_ISO: nuevaFechaEntrada
                            };
                            salida.json(ok);
                        }
                    }
                    if (sentidoRango === "futuro") {
                        if (fechaSolicitada_objeto <= fechaEntrada_Objeto) {
                            const error = "La fecha de salida solicitada no puede ser igual o inferior a la fecha de entrada de la reserva.";
                            throw new Error(error);
                        }
                        const transaccionInterna = await validarModificacionRangoFechaResereva(metadatos);
                        const codigoFinal = transaccionInterna.ok;
                        const transaccionPrecioReserva = {
                            tipoProcesadorPrecio: "uid",
                            reservaUID: reserva
                        };
                        const mensajeSinFuturo = "No se puede seleccionar esa fecha de salida. Con los apartamentos existentes en la reserva no se puede por que hay otros eventos que lo impiden. Puedes ver los eventos que lo impiden detallados a continuación.";
                        if ((codigoFinal === "noHayRangoFuturo")
                            &&
                            (fechaSalida_Objeto < fechaSolicitada_objeto)) {
                            const estructura = {
                                detallesDelError: mensajeSinFuturo,
                                ...transaccionInterna
                            };
                            throw new vitiniSysError(estructura);
                        }

                        if ((codigoFinal === "rangoFuturoLimitado")
                            &&
                            (fechaSalida_Objeto < fechaSolicitada_objeto)) {
                            const fechaLimite_objeto = DateTime.fromISO(transaccionInterna.limiteFuturo);
                            if (fechaLimite_objeto <= fechaSolicitada_objeto) {
                                const estructura = {
                                    detallesDelError: mensajeSinFuturo,
                                    ...transaccionInterna
                                };
                                throw new vitiniSysError(estructura);
                            }


                        }

                        const actualizarModificacionFechaEntradaReserva = `
                            UPDATE reservas
                            SET salida = $1
                            WHERE reserva = $2
                            RETURNING
                            to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO";`;
                        const resuelveConfirmarFecha = await conexion.query(actualizarModificacionFechaEntradaReserva, [fechaSolicitada_ISO, reserva]);
                        if (resuelveConfirmarFecha.rowCount === 1) {
                            const nuevaFechaSalida = resuelveConfirmarFecha.rows[0].fechaSalida_ISO;
                            await insertarTotalesReserva(transaccionPrecioReserva);
                            const ok = {
                                ok: "Se ha actualizado correctamente la fecha de entrada en la reserva",
                                sentidoRango: "futuro",
                                fecha_ISO: nuevaFechaSalida
                            };
                            salida.json(ok);
                        }
                    }
                    await conexion.query('COMMIT'); // Confirmar la transacción
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                    const error = {};
                    if (errorCapturado instanceof vitiniSysError) {
                        error.error = errorCapturado.objeto;
                    } else {
                        error.error = errorCapturado.message;
                    }
                    salida.json(error)
                } finally {
                    bloqueoConfirmarModificarFechaReserva();
                }
            },
            cancelarReserva: async () => {
                try {
                    const reserva = entrada.body.reserva;
                    const tipoBloqueo = entrada.body.tipoBloqueo;
                    if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                        const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (tipoBloqueo !== "rangoTemporal" && tipoBloqueo !== "permanente" && tipoBloqueo !== "sinBloqueo") {
                        const error = "El campo 'tipoBloqueo' solo puede ser rangoTemporal, permanente, sinBloqueo";
                        throw new Error(error);
                    }
                    const validacionReserva = `
                        SELECT 
                        "estadoReserva",
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO"
                        FROM reservas
                        WHERE reserva = $1
                        `;
                    const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
                    if (resuelveValidacionReserva.rowCount === 0) {
                        const error = "No existe la reserva";
                        throw new Error(error);
                    }
                    const estadoActualReserva = resuelveValidacionReserva.rows[0].estadoReserva;
                    if (estadoActualReserva === "cancelada") {
                        const error = "La reserva ya esta cancelada";
                        throw new Error(error);
                    }

                    const eliminarEnlacesDePago = `
                        DELETE FROM "enlacesDePago"
                        WHERE reserva = $1;
                        `;
                    await conexion.query(eliminarEnlacesDePago, [reserva]);
                    const fechaCancelacion = new Date();
                    const fechaEntrada_ISO = resuelveValidacionReserva.rows[0].fechaEntrada_ISO;
                    const fechaSalida_ISO = resuelveValidacionReserva.rows[0].fechaSalida_ISO;
                    // extraer todos los apartamentos de la reserva
                    const seleccionarApartamentosReserva = `
                        SELECT 
                        uid
                        FROM "reservaApartamentos"
                        WHERE reserva = $1
                        `;
                    const resuelveSeleccionarApartamentosReserva = await conexion.query(seleccionarApartamentosReserva, [reserva]);
                    const estadoReserva = "cancelada";
                    if (resuelveSeleccionarApartamentosReserva.rowCount === 0) {
                        const actualizarEstadoReserva = `
                            UPDATE 
                            reservas
                            SET 
                            "estadoReserva" = $1,
                            "fechaCancelacion" = $2
                            WHERE 
                            reserva = $3;`;
                        const resuelveActualizarEstadoReserva = await conexion.query(actualizarEstadoReserva, [estadoReserva, fechaCancelacion, reserva]);
                        if (resuelveActualizarEstadoReserva.rowCount === 1) {
                            const ok = {
                                ok: "La reserva se ha cancelado"
                            };
                            salida.json(ok);
                        }
                    }
                    if (resuelveSeleccionarApartamentosReserva.rowCount > 0) {
                        const apartamentosReserva = resuelveSeleccionarApartamentosReserva.rows;
                        for (const apartamento of apartamentosReserva) {
                            const metadatos = {
                                reserva: reserva,
                                apartamentoUID: apartamento.uid,
                                tipoBloqueo: tipoBloqueo,
                                fechaEntrada_ISO: fechaEntrada_ISO,
                                fechaSalida_ISO: fechaSalida_ISO,
                                zonaBloqueo: "publico",
                                origen: "cancelacionDeReserva"
                            };
                            await bloquearApartamentos(metadatos);
                        }
                        const actualizarEstadoReserva = `
                            UPDATE 
                            reservas
                            SET 
                            "estadoReserva" = $1,
                            "fechaCancelacion" = $2
                            WHERE 
                            reserva = $3;`;
                        const resuelveActualizarEstadoReserva = await conexion.query(actualizarEstadoReserva, [estadoReserva, fechaCancelacion, reserva]);
                        if (resuelveActualizarEstadoReserva.rowCount === 1) {
                            const ok = {
                                ok: "La reserva se ha cancelado"
                            };
                            salida.json(ok);
                        }
                    }
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            eliminarIrreversiblementeReserva: async () => {
                await mutex.acquire();
                try {
                    const reserva = entrada.body.reserva;
                    const clave = entrada.body.clave;
                    if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                        const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (!clave) {
                        const error = "No has enviado la clave de tu usuario para confirmar la operacion";
                        throw new Error(error);
                    }
                    const usuarioIDX = entrada.session.usuario;
                    await conexion.query('BEGIN'); // Inicio de la transacción
                    const obtenerClaveActualHASH = `
                        SELECT 
                        clave,
                        sal, 
                        rol
                        FROM usuarios
                        WHERE usuario = $1;
                        `;
                    const resuelveVitniID = await conexion.query(obtenerClaveActualHASH, [usuarioIDX]);
                    if (resuelveVitniID.rowCount === 0) {
                        const error = "No existe el usuario";
                        throw new Error(error);
                    }
                    const claveActualHASH = resuelveVitniID.rows[0].clave;
                    const sal = resuelveVitniID.rows[0].sal;
                    const metadatos = {
                        sentido: "comparar",
                        clavePlana: clave,
                        sal: sal,
                        claveHash: claveActualHASH
                    };
                    const controlClave = vitiniCrypto(metadatos);
                    if (!controlClave) {
                        const error = "Revisa la contrasena actual que has escrito por que no es correcta por lo tanto no se puede eliminar tu cuenta";
                        throw new Error(error);
                    }
                    // Validar si es un usuario administrador
                    const rol = resuelveVitniID.rows[0].rol;
                    const rolAdministrador = "administrador";
                    if (rol !== rolAdministrador) {
                        const error = "Tu cuenta no esta autorizada para eliminar reservas. Puedes cancelar reservas pero no eliminarlas.";
                        throw new Error(error);
                    }
                    const validacionReserva = `
                        SELECT 
                        reserva
                        FROM reservas
                        WHERE reserva = $1
                        `;
                    const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
                    if (resuelveValidacionReserva.rowCount === 0) {
                        const error = "No existe la reserva, revisa el identificador de la reserva por que el que has enviado no existe";
                        throw new Error(error);
                    }
                    const consultaElimianrReserva = `
                        DELETE FROM reservas
                        WHERE reserva = $1;
                        `;
                    const resuelveEliminarReserva = await conexion.query(consultaElimianrReserva, [reserva]);
                    if (resuelveEliminarReserva.rowCount === 0) {
                        const error = "No se encuentra la reserva";
                        throw new Error(error);
                    }
                    if (resuelveEliminarReserva.rowCount === 1) {
                        const ok = {
                            ok: "Se ha eliminado la reserva y su informacion asociada de forma irreversible"
                        };
                        salida.json(ok);
                    }
                    await conexion.query('COMMIT'); // Confirmar la transacción
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                    mutex.release();
                }
            },
            crearReservaSimpleAdministrativa: async () => {
                await mutex.acquire();
                try {
                    const fechaEntrada = entrada.body.fechaEntrada;
                    const fechaSalida = entrada.body.fechaSalida;
                    const apartamentos = entrada.body.apartamentos;
                    // Control validez fecha
                    const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada)).fecha_ISO;
                    const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida)).fecha_ISO;
                    const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
                    if (!Array.isArray(apartamentos)) {
                        const error = "el campo 'apartamentos' debe de ser un array";
                        throw new Error(error);
                    }
                    const fechaControl_Entrada = DateTime.fromISO(fechaEntrada_ISO, { zone: zonaHoraria }).isValid;
                    if (!fechaControl_Entrada) {
                        const error = "LA fecha de entrada no es valida";
                        throw new Error(error);
                    }
                    const fechaControl_Salida = DateTime.fromISO(fechaSalida_ISO, { zone: zonaHoraria }).isValid;
                    if (!fechaControl_Salida) {
                        const error = "LA fecha de salida no es valida";
                        throw new Error(error);
                    }
                    await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado();
                    // validar que en el array hay un maximo de posiciones no superior al numero de filas que existen en los apartementos
                    const estadoDisonibleApartamento = "disponible";
                    const validarNumeroApartamentosMaximoArrayEntrante = `
                        SELECT
                        "apartamentoIDV"
                        FROM "configuracionApartamento"
                        WHERE "estadoConfiguracion" = $1`;
                    const resuelveValidarNumeroApartamentosMaximoArrayEntrante = await conexion.query(validarNumeroApartamentosMaximoArrayEntrante, [estadoDisonibleApartamento]);
                    if (resuelveValidarNumeroApartamentosMaximoArrayEntrante.rowCount === 0) {
                        const error = "No hay ningun apartamento disponible ahora mismo";
                        throw new Error(error);
                    }
                    if (apartamentos.length > resuelveValidarNumeroApartamentosMaximoArrayEntrante.rowCount) {
                        const error = "El tamano de posiciones del array de apartamentos es demasiado grande";
                        throw new Error(error);
                    }
                    // Formateo fecha mucho ojo que los anglosajones tiene el formato mes/dia/ano y queremos usar dia/mes/ano y el objeto date de javascript por cojones usa ese formato
                    const fechaEntradaEnArreglo = fechaEntrada.split("/");
                    const fechaSalidaEnArreglo = fechaSalida.split("/");
                    const constructorFechaEntradaFormatoMDA = `${fechaEntradaEnArreglo[1]}/${fechaEntradaEnArreglo[0]}/${fechaEntradaEnArreglo[2]}`;
                    const constructorFechaSalidaFormatoMDA = `${fechaSalidaEnArreglo[1]}/${fechaSalidaEnArreglo[0]}/${fechaSalidaEnArreglo[2]}`;
                    const controlFechaEntrada = new Date(constructorFechaEntradaFormatoMDA); // El formato es día/mes/ano
                    const controlFechaSalida = new Date(constructorFechaSalidaFormatoMDA);
                    // validacion: la fecha de entrada no puede ser superior a la fecha de salida y al mimso tiempo la fecha de salida no puede ser inferior a la fecha de entrada
                    if (controlFechaEntrada >= controlFechaSalida) {
                        const error = "La fecha de entrada no puede ser igual o superior que la fecha de salida";
                        throw new Error(error);
                    }
                    const filtroApartamentoIDV = /^[a-z0-9]+$/;
                    for (const apartamento of apartamentos) {
                        if (!filtroApartamentoIDV.test(apartamento)) {
                            const error = "Hay un apartamentoIDV dentro del array que no cumple los requisitos.";
                            throw new Error(error);
                        }
                    }
                    const rol = entrada.session.rol;
                    const configuracionApartamentosPorRango = {
                        fechaEntrada_ISO: fechaEntrada_ISO,
                        fechaSalida_ISO: fechaSalida_ISO,
                        rol: rol,
                        origen: "administracion"
                    };
                    const resuelveApartamentosDisponibles = await apartamentosPorRango(configuracionApartamentosPorRango);
                    const apartamentosDisponibles = resuelveApartamentosDisponibles.apartamentosDisponibles;
                    if (apartamentosDisponibles.length === 0) {
                        const error = "No hay ningun apartamento disponible para estas fechas";
                        throw new Error(error);
                    }
                    if (apartamentosDisponibles.length > 0) {
                        const validarApartamentosDisonbiles = (apartamentosSolicitados, apartamentosDisponibles) => {
                            return apartamentosSolicitados.every(apartamento => apartamentosDisponibles.includes(apartamento));
                        };
                        const controlApartamentosDisponibles = validarApartamentosDisonbiles(apartamentos, apartamentosDisponibles);
                        if (!controlApartamentosDisponibles) {
                            const error = "Los apartamentos solicitados para este rango de fechas no estan disponbiles.";
                            throw new Error(error);
                        }
                        const formatoFechaEntradaDMA = `${fechaEntradaEnArreglo[0]}/${fechaEntradaEnArreglo[1]}/${fechaEntradaEnArreglo[2]}`;
                        const formatoFechaSalidaDMA = `${fechaSalidaEnArreglo[0]}/${fechaSalidaEnArreglo[1]}/${fechaSalidaEnArreglo[2]}`;
                        const formatearFechaDesdeISO8601 = (cadenaISO8601) => {
                            // Importantisimo
                            // Esto se usa para poner un cero si el numero de dia o de mes es 9 o menor para evitar la interpretacion de JS que resta 1 al numero en la interpretacion de fechas
                            const fecha = new Date(cadenaISO8601);
                            const year = fecha.getFullYear();
                            const month = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Sumar 1 porque los meses van de 0 a 11
                            const day = fecha.getDate().toString().padStart(2, '0');
                            return `${year}-${month}-${day}`;
                        };
                        const fechaEntradaReservaISO8610 = new Date(formatearFechaDesdeISO8601(`${fechaEntradaEnArreglo[2]}-${fechaEntradaEnArreglo[1]}-${fechaEntradaEnArreglo[0]}`)).toISOString().split('T')[0];
                        const fechaSalidaReservaISO8610 = new Date(formatearFechaDesdeISO8601(`${fechaSalidaEnArreglo[2]}-${fechaSalidaEnArreglo[1]}-${fechaSalidaEnArreglo[0]}`)).toISOString().split('T')[0];
                        // insertar fila reserva y en la tabla reservarAartametnos insertar las correspondientes filas
                        const estadoReserva = "confirmada";
                        const origen = "administracion";
                        const creacionFechaReserva = new Date().toISOString();
                        const estadoPago = "noPagado";
                        await conexion.query('BEGIN'); // Inicio de la transacción
                        const insertarReserva = `
                            INSERT INTO
                            reservas 
                            (
                            entrada,
                            salida,
                            "estadoReserva",
                            origen,
                            creacion,
                            "estadoPago")
                            VALUES
                            ($1,$2,$3,$4,$5,$6)
                            RETURNING 
                            reserva `;
                        const resuelveInsertarReserva = await conexion.query(insertarReserva, [fechaEntradaReservaISO8610, fechaSalidaReservaISO8610, estadoReserva, origen, creacionFechaReserva, estadoPago]);
                        const reservaUIDNuevo = resuelveInsertarReserva.rows[0].reserva;
                        for (const apartamento of apartamentos) {
                            const apartamentoUI = await resolverApartamentoUI(apartamento);
                            const InsertarApartamento = `
                                INSERT INTO
                                "reservaApartamentos"
                                (
                                reserva,
                                apartamento, 
                                "apartamentoUI"
                                )
                                VALUES ($1, $2, $3)
                                `;
                            const resuelveInsertarApartamento = await conexion.query(InsertarApartamento, [reservaUIDNuevo, apartamento, apartamentoUI]);
                            if (resuelveInsertarApartamento.rowCount === 0) {
                                const error = "Ha ocurrido un error insertando el apartamento " + apartamento + " se detiene y se deshache todo el proceso";
                                throw new Error(error);
                            }
                        }
                        const transaccionPrecioReserva = {
                            tipoProcesadorPrecio: "uid",
                            reservaUID: Number(reservaUIDNuevo)
                        };
                        await insertarTotalesReserva(transaccionPrecioReserva);
                        await conexion.query('COMMIT'); // Confirmar la transacción
                        const ok = {
                            ok: "Se ha anadido al reserva vacia",
                            reservaUID: reservaUIDNuevo
                        };
                        salida.json(ok);
                    }
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                    mutex.release();
                }
            },
            transacciones: {
                IDX: {
                    ROL: ["administrador", "empleado"]
                },
                obtenerPagosDeLaReserva: async () => {
                    try {
                        const reservaUID = entrada.body.reservaUID;
                        const filtroCadena = /^[0-9]+$/;
                        if (!reservaUID || !filtroCadena.test(reservaUID)) {
                            const error = "el campo 'reservaUID' solo puede ser una cadena de letras minúsculas y numeros sin espacios.";
                            throw new Error(error);
                        }
                        const detallesPagosReserva = await componentes.administracion.reservas.transacciones.pagosDeLaReserva(reservaUID);
                        const metadatos = {
                            reservaUID: Number(reservaUID),
                            solo: "informacionGlobal"
                        };
                        const resuelveDetallesReserva = await detallesReserva(metadatos);
                        const estadoPago = resuelveDetallesReserva.reserva.estadoPago;
                        const totalReembolsado = await obtenerTotalReembolsado(reservaUID);
                        const totalReserva = detallesPagosReserva.totalReserva;
                        const totalPagado = detallesPagosReserva.totalPagado;
                        let totalCobrado = 0;
                        const pagosDeLaReserva = detallesPagosReserva.pagos;
                        for (const detallesDelPago of pagosDeLaReserva) {
                            const cantidadDelPago = detallesDelPago.cantidad;
                            const suma = new Decimal(totalCobrado).plus(cantidadDelPago);
                            totalCobrado = suma;
                        }
                        let porcentajeReembolsado = "0.00";
                        if (totalPagado > 0) {
                            porcentajeReembolsado = new Decimal(totalReembolsado).dividedBy(totalCobrado).times(100).toFixed(2);
                        }
                        const porcentajePagado = new Decimal(totalPagado).dividedBy(totalReserva).times(100).toFixed(2);
                        const porcentajePagadoUI = porcentajePagado !== "Infinity" ? porcentajePagado + "%" : "0.00%";
                        const ok = {
                            ok: "Aqui tienes los pagos de esta reserva",
                            estadoPago: estadoPago,
                            totalReembolsado: totalReembolsado.toFixed(2),
                            porcentajeReembolsado: porcentajeReembolsado + "%",
                            porcentajePagado: porcentajePagadoUI
                        };
                        const okFusionado = { ...ok, ...detallesPagosReserva };
                        salida.json(okFusionado);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    }
                },
                obtenerDetallesDelPago: async () => {
                    try {
                        const pagoUID = entrada.body.pagoUID;
                        const filtroCadena = /^[0-9]+$/;
                        if (!pagoUID || !filtroCadena.test(pagoUID)) {
                            const error = "el campo 'pagoUID' solo puede ser una cadena de letras minúsculas y numeros sin espacios.";
                            throw new Error(error);
                        }
                        const validarPago = `
                            SELECT
                                "plataformaDePago",
                                "pagoUID",
                                "pagoUIDPasarela",
                                "tarjetaDigitos",
                                to_char("fechaPago", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "fechaPagoUTC_ISO", 
                                tarjeta,
                                cantidad
                            FROM 
                                "reservaPagos"
                            WHERE 
                                "pagoUID" = $1;`;
                        const reseulveValidarPago = await conexion.query(validarPago, [pagoUID]);

                        if (reseulveValidarPago.rowCount === 0) {
                            const error = "No existe ningún pago con ese pagoUID";
                            throw new Error(error);
                        }
                        if (reseulveValidarPago.rowCount === 1) {
                            // Determinar tipo de pago
                            const detallesDelPago = reseulveValidarPago.rows[0];
                            const plataformaDePagoControl = detallesDelPago.plataformaDePago;
                            const cantidadDelPago = detallesDelPago.cantidad;
                            const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
                            const fechaPagoUTC_ISO = detallesDelPago.fechaPagoUTC_ISO;
                            const fechaPagoTZ_ISO = DateTime.fromISO(fechaPagoUTC_ISO, { zone: 'utc' })
                                .setZone(zonaHoraria)
                                .toISO();
                            detallesDelPago.fechaPagoTZ_ISO = fechaPagoTZ_ISO;


                            const ok = {
                                ok: "Aqui tienes los pagos de esta reserva",
                                detallesDelPago: detallesDelPago,
                                deglosePorReembolso: []
                            };
                            // if (plataformaDePagoControl === "pasarela") {
                            //     const pagoUIDPasarela = detallesDelPago.pagoUIDPasarela
                            //     const actualizarReembolsos = await componentes.administracion.reservas.transacciones.actualizarReembolsosDelPagoDesdeSquare(pagoUID, pagoUIDPasarela)
                            //     if (actualizarReembolsos?.error) {
                            //         ok.estadoPasarela = actualizarReembolsos.error
                            //     }
                            // }
                            const consultaReembolsos = `
                                    SELECT
                                        "reembolsoUID",
                                        cantidad,
                                        "plataformaDePago",
                                        "reembolsoUIDPasarela",
                                        estado,
                                        to_char("fechaCreacion", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "fechaCreacionUTC_ISO", 
                                        to_char("fechaActualizacion", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "fechaActualizacionUTC_ISO"
                                    FROM 
                                        "reservaReembolsos"
                                    WHERE 
                                        "pagoUID" = $1
                                    ORDER BY
                                        "reembolsoUID" DESC;`;
                            const resuelveConsultaReembolsos = await conexion.query(consultaReembolsos, [pagoUID]);
                            if (resuelveConsultaReembolsos.rowCount > 0) {
                                const reembolsosDelPago = resuelveConsultaReembolsos.rows;
                                let sumaDeLoReembolsado = 0;
                                for (const detallesDelReembolso of reembolsosDelPago) {
                                    const reembolsoUID = detallesDelReembolso.reembolsoUID;
                                    const plataformaDePagoObtenida = detallesDelReembolso.plataformaDePago;
                                    const cantidadDelReembolso = new Decimal(detallesDelReembolso.cantidad);
                                    const reembolsoUIDPasarela = detallesDelReembolso.reembolsoUIDPasarela;
                                    const estado = detallesDelReembolso.estado;
                                    sumaDeLoReembolsado = cantidadDelReembolso.plus(sumaDeLoReembolsado);

                                    const fechaCreacionUTC_ISO = detallesDelReembolso.fechaCreacionUTC_ISO;
                                    const fechaCreacionTZ_ISO = DateTime.fromISO(fechaCreacionUTC_ISO, { zone: 'utc' })
                                        .setZone(zonaHoraria)
                                        .toISO();
                                    detallesDelReembolso.fechaCreacionTZ_ISO = fechaCreacionTZ_ISO;
                                    const fechaActualizacionUTC_ISO = detallesDelReembolso.fechaActualizacionUTC_ISO;
                                    const fechaActualizacionTZ_ISO = DateTime.fromISO(fechaActualizacionUTC_ISO, { zone: 'utc' })
                                        .setZone(zonaHoraria)
                                        .toISO();
                                    detallesDelReembolso.fechaActualizacionTZ_ISO = fechaActualizacionTZ_ISO;
                                    const estructuraReembolso = {
                                        reembolsoUID: reembolsoUID,
                                        plataformaDePago: plataformaDePagoObtenida,
                                        cantidad: cantidadDelReembolso,
                                        reembolsoUIDPasarela: reembolsoUIDPasarela,
                                        estado: estado,
                                        fechaCreacionUTC_ISO: fechaCreacionUTC_ISO,
                                        fechaCreacionTZ_ISO: fechaCreacionTZ_ISO,
                                        fechaActualizacionUTC_ISO: fechaActualizacionUTC_ISO,
                                        fechaActualizacionTZ_ISO: fechaActualizacionTZ_ISO,
                                    };
                                    ok.deglosePorReembolso.push(estructuraReembolso);
                                }
                                let reembolsado;
                                if (Number(cantidadDelPago) === Number(sumaDeLoReembolsado)) {
                                    reembolsado = "totalmente";
                                }
                                if (Number(cantidadDelPago) > Number(sumaDeLoReembolsado)) {
                                    reembolsado = "parcialmente";
                                }
                                if (Number(cantidadDelPago) < Number(sumaDeLoReembolsado)) {
                                    reembolsado = "superadamente";
                                }
                                ok.detallesDelPago.sumaDeLoReembolsado = sumaDeLoReembolsado.toFixed(2);
                                ok.detallesDelPago.reembolsado = reembolsado;
                            }
                            //ok.deglosePorReembolso.push(detallesDelPago)
                            salida.json(ok);
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    }
                },
                detallesDelReembolso: async () => {
                    try {
                        const reembolsoUID = entrada.body.reembolsoUID;
                        const filtroCadena = /^[0-9]+$/;
                        if (!reembolsoUID || !filtroCadena.test(reembolsoUID)) {
                            const error = "el campo 'reembolsoUID' solo puede ser una cadena de letras minúsculas y numeros sin espacios.";
                            throw new Error(error);
                        }
                        // const actualizarReembolso = await componentes.administracion.reservas.transacciones.actualizarSOLOreembolsoDesdeSquare(reembolsoUID)
                        // if (actualizarReembolso.error) {
                        //     throw new Error(actualizarReembolso.error)
                        // }
                        const validarReembolso = `
                            SELECT
                                "pagoUID",
                                cantidad,
                                "plataformaDePago",
                                "reembolsoUIDPasarela",
                                "estado",
                                "fechaCreacion"::text AS "fechaCreacion",
                                "fechaActualizacion"::text AS "fechaActualizacion"
                            FROM 
                                "reservaReembolsos"
                            WHERE 
                                "reembolsoUID" = $1;`;
                        const reseulveValidarReembolso = await conexion.query(validarReembolso, [reembolsoUID]);
                        if (reseulveValidarReembolso.rowCount === 0) {
                            const error = "No existe ningún reembolso con ese reembolsoUID";
                            throw new Error(error);
                        }
                        if (reseulveValidarReembolso.rowCount === 1) {
                            const detallesDelReembolso = reseulveValidarReembolso.rows[0];
                            const pagoUID = detallesDelReembolso.pagoUID;
                            const cantidad = detallesDelReembolso.cantidad;
                            const plataformaDePag = detallesDelReembolso.plataformaDePag;
                            const reembolsoUIDPasarela = detallesDelReembolso.reembolsoUIDPasarela;
                            const estado = detallesDelReembolso.estado;
                            const fechaCreacion = detallesDelReembolso.fechaCreacion;
                            const fechaActualizacion = detallesDelReembolso.fechaActualizacion;
                            const ok = {
                                ok: "Aqui tienes los detalles del reembolso",
                                pagoUID: pagoUID,
                                cantidad: cantidad,
                                plataformaDePag: plataformaDePag,
                                reembolsoUIDPasarela: reembolsoUIDPasarela,
                                estado: estado,
                                fechaCreacion: fechaCreacion,
                                fechaActualizacion: fechaActualizacion,
                            };
                            salida.json(ok);
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    }
                },
                realizarReembolso: async () => {
                    try {
                        const reservaUID = entrada.body.reservaUID;
                        let cantidad = entrada.body.cantidad;
                        const pagoUID = entrada.body.pagoUID;
                        const palabra = entrada.body.palabra;
                        let tipoReembolso = entrada.body.tipoReembolso;
                        let plataformaDePagoEntrada = entrada.body.plataformaDePagoEntrada;
                        plataformaDePagoEntrada.toLowerCase();
                        if (palabra !== "reembolso") {
                            const error = "Escriba la palabra reembolso en le campo de confirmacion";
                            throw new Error(error);
                        }
                        const filtroTotal = /^\d+\.\d{2}$/;
                        const filtroNumerosEnteros = /^[0-9]+$/;
                        const filtroDecimales = /^\d+\.\d{2}$/;
                        if (!reservaUID || !filtroNumerosEnteros.test(reservaUID)) {
                            const error = "el campo 'reservaUID' solo puede ser una cadena de letras minúsculas y numeros sin espacios.";
                            throw new Error(error);
                        }
                        if (!pagoUID || !filtroNumerosEnteros.test(pagoUID)) {
                            const error = "el campo 'pagoUID' solo puede ser una cadena de numeros.";
                            throw new Error(error);
                        }
                        if (tipoReembolso !== "porPorcentaje" && tipoReembolso !== "porCantidad") {
                            const error = "el campo 'tipoReembolso' solo puede ser porPorcentaje o porCantidad.";
                            // throw new Error(error)
                        }
                        if (!cantidad || !filtroDecimales.test(cantidad)) {
                            const error = "LA cantida del reembolso solo puede ser una cadena con un numero don dos decimales separados por punto";
                            throw new Error(error);
                        }
                        const tipoDeReembolso = ["efectivo", "cheque", "pasarela", "tarjeta"];
                        if (!tipoDeReembolso.some(palabra => plataformaDePagoEntrada.includes(palabra))) {
                            const error = "Selecciona eltipo de plataforma en la que se va ha hacer el reembolso, por ejemplo, pasarela, tarjeta, efectivo o cheque";
                            throw new Error(error);
                        }
                        const detallesReserva = await validadoresCompartidos.reservas.validarReserva(reservaUID);
                        const estadoReserva = detallesReserva.estadoReserva;
                        const estadoPago = detallesReserva.estadoPago;
                        if (estadoPago === "noPagado") {
                            // const error = "No se puede hacer un reembolso de un pago asociado a una resera no pagada"
                            // throw new Error(error)
                        }
                        const validarPago = `
                            SELECT
                            "pagoUID",
                            "plataformaDePago",
                            cantidad,
                            "pagoUIDPasarela"
                            FROM "reservaPagos"
                            WHERE reserva = $1 AND "pagoUID" = $2`;
                        const resuelveValidarPago = await conexion.query(validarPago, [reservaUID, pagoUID]);
                        if (resuelveValidarPago.rowCount === 0) {
                            const error = "No existe el pago dentro de la reserva";
                            throw new Error(error);
                        }
                        if (resuelveValidarPago.rowCount === 1) {
                            const detallesDelPago = resuelveValidarPago.rows[0];
                            const plataformaDePago = detallesDelPago.plataformaDePago;
                            const pagoUID = detallesDelPago.pagoUID;
                            const pagoUIDPasarela = detallesDelPago.pagoUIDPasarela;
                            const controlTotalPago = detallesDelPago.cantidad;
                            let reembolsoUIPasarela;
                            let estadoReembolso;
                            let fechaCreacion;
                            let fechaActualizacion;
                            const moneda = "USD";
                            if (Number(controlTotalPago) < Number(cantidad)) {
                                const error = `El valor del reembolso ${cantidad} supera el valor total del pago ${controlTotalPago} que se quiere reembolsar.`;
                                throw new Error(error);
                            }
                            // controlar que el reembolso no sea superior al maximo  reembolsable teniendo en cuenta todos los reembolsos ya realizados de cualquuier tipo
                            const consultaReembolsosDelPago = `
                                SELECT
                                cantidad
                                FROM "reservaReembolsos"
                                WHERE "pagoUID" = $1`;
                            const reembolsosDelPago = await conexion.query(consultaReembolsosDelPago, [pagoUID]);
                            if (reembolsosDelPago.rowCount > 0) {
                                let totalReembolsado = 0;
                                const reembolsos = reembolsosDelPago.rows;
                                reembolsos.map((detallesDelReembolso) => {
                                    const cantidadDelReembolso = detallesDelReembolso.cantidad;
                                    totalReembolsado = new Decimal(totalReembolsado).plus(cantidadDelReembolso);
                                });
                                const totalReembolsable = new Decimal(controlTotalPago).minus(totalReembolsado);
                                if (Number(cantidad) >= Number(totalReembolsable)) {
                                    const error = `El valor del reembolso ${cantidad} supera el valor total reembolsable de este pago (${totalReembolsable}). Recuerda que no puedes realizar un reembolso que supere la cantidad reembolsable del pago. Ten encuenta el resto de reembolsos a la hora de hacer un reembolso mas de este pago`;
                                    throw new Error(error);
                                }
                            }
                            if (plataformaDePagoEntrada === "pasarela" && plataformaDePago !== "pasarela") {
                                const error = `No se puede enviar este reembolso a la pasarela por que este pago no se hizo por la pasarela. Para realizar un reembolso a atraves de la pasarela, el pago del cual forma parte el reembolso tiene que haberse producido por la pasarela.`;
                                throw new Error(error);
                            }
                            if (plataformaDePago === "pasarela" && plataformaDePagoEntrada === "pasarela") {
                                const error = `La opcionn de enviar un reembolso a la pasarela esta deshabilitada.`;
                                throw new Error(error);

                                const totalFormatoSquare = Number(cantidad.replace(".", ""));
                                const reembolsoDetalles = {
                                    idempotencyKey: uuidv4(),
                                    amountMoney: {
                                        amount: totalFormatoSquare,
                                        currency: moneda
                                    },
                                    paymentId: pagoUIDPasarela
                                };
                                const procesadorReembolso = await componentes.pasarela.crearReenbolso(reembolsoDetalles);
                                if (procesadorReembolso.error) {
                                    const errorUID = procesadorReembolso.error?.errors[0]?.code;
                                    let error;
                                    switch (errorUID) {
                                        case "REFUND_AMOUNT_INVALID":
                                            error = "La pasarela informa que el reembolso es superior a la cantidad del pago que se quiere reembolsar";
                                            throw new Error(error);
                                        case "CURRENCY_MISMATCH":
                                            error = "Revisa el codigo de la moneda introducido. Solo se aceptan dolares. Coodigo: USD";
                                            throw new Error(error);
                                        case "NOT_FOUND":
                                            error = "La pasarela informa de que el idenficador del reembolso no existe en la pasarela";
                                            throw new Error(error);
                                        default:
                                            error = "La pasarela informa de un error generico";
                                            throw new Error(error);
                                    }
                                }
                                reembolsoUIPasarela = procesadorReembolso.id;
                                cantidad = utilidades.deFormatoSquareAFormatoSQL(procesadorReembolso.amountMoney.amount);
                                estadoReembolso = procesadorReembolso.status;
                                fechaCreacion = procesadorReembolso.createdAt;
                                fechaActualizacion = procesadorReembolso.updatedAt;
                            }
                            if (plataformaDePagoEntrada !== "pasarela") {
                                fechaCreacion = DateTime.utc().toISO();
                            }
                            // Si es pago es de pasarela, enviar el reembolso a la pasarelaa y luego proseguir norma
                            const insertarReembolso = `
                                INSERT INTO
                                    "reservaReembolsos"
                                    (
                                    "pagoUID",
                                    cantidad,
                                    "plataformaDePago",
                                    "reembolsoUIDPasarela",
                                    estado,
                                    "fechaCreacion",
                                    "fechaActualizacion"
                                    )
                                VALUES 
                                    ($1,$2,$3,$4,$5,$6,$7)
                                RETURNING
                                    "reembolsoUID"
                                `;
                            const datosNuevoReembolso = [
                                pagoUID,
                                cantidad,
                                plataformaDePagoEntrada,
                                reembolsoUIPasarela,
                                estadoReembolso,
                                fechaCreacion,
                                fechaActualizacion,
                            ];
                            const resuelveInsertarReembolso = await conexion.query(insertarReembolso, datosNuevoReembolso);
                            const reembolsoUID = resuelveInsertarReembolso.rows[0].reembolsoUID;
                            const ok = {
                                reembolsoUID: reembolsoUID
                            };
                            if (plataformaDePagoEntrada === "pasarela") {
                                ok.ok = "Se ha guardado el reembolso en la base de datos y enviado con exito a la pasarela. El dinero del reembolso se esta reembolsando a traves de la pasarela";
                            } else {
                                ok.ok = "Se ha guardado el reembolso en la base de datos verifique que el reembolso sea entrago al cliente";
                            }
                            salida.json(ok);
                        }
                    } catch (errorCapturado) {
                        let errorFinal;
                        if (errorCapturado?.result?.errors[0]?.code) {
                            errorFinal = errorCapturado.result.errors[0].code;
                        } else {
                            errorFinal = errorCapturado.message;
                        }
                        const error = {
                            error: errorFinal
                        };
                        salida.json(error)
                    }
                },
                crearPagoManual: async () => {
                    try {
                        const plataformaDePago = entrada.body.plataformaDePago;
                        let cantidad = entrada.body.cantidad;
                        const reservaUID = entrada.body.reservaUID;
                        //let pagadorNombre = entrada.body.pagadorNombre
                        //let pagadorPasaporte = entrada.body.pagadorPasaporte
                        let chequeUID = entrada.body.chequeUID;
                        let transferenciaUID = entrada.body.transferenciaUID;
                        let pagoUIDPasarela = entrada.body.pagoUIDPasarela;
                        let tarjetaUltimos = entrada.body.tarjetaUltimos;
                        const filtroCadena = /^[a-zA-Z0-9\s]+$/;
                        const filtroCadenaSinEspacios = /^[a-zA-Z0-9]+$/;
                        const filtro4Numeros = /^\d{4}$/;
                        const filtroNumeros = /^[0-9]+$/;
                        const filtroDecimales = /^\d+\.\d{2}$/;
                        if (!plataformaDePago || !filtroCadena.test(plataformaDePago)) {
                            const error = "El campo plataformaDePago solo admite minúsculas y mayusculas";
                            throw new Error(error);
                        }
                        await validadoresCompartidos.reservas.validarReserva(reservaUID);
                        const validadores = {
                            cantidad: (cantidad) => {
                                if (!cantidad || !filtroDecimales.test(cantidad)) {
                                    const error = "El campo cantidad solo admite una cadena con un numero con dos decimales separados por punto";
                                    throw new Error(error);
                                }
                                return cantidad;
                            },
                            pagadorNombre: (pagadorNombre) => {
                                if (!pagadorNombre || !filtroCadena.test(pagadorNombre)) {
                                    const error = "El campo pagadorNombre solo admite una cadena con mayúsculas, minúsculas, numero y espacios";
                                    throw new Error(error);
                                }
                                pagadorNombre = pagadorNombre.toUpperCase();
                                return pagadorNombre;
                            },
                            pagadorPasaporte: (pagadorPasaporte) => {
                                if (!pagadorPasaporte || !filtroCadena.test(pagadorPasaporte)) {
                                    const error = "El campo pagadorPasaporte solo admite una cadena con mayúsculas, minúsculas, numero y espacios";
                                    throw new Error(error);
                                }
                                return pagadorPasaporte;
                            },
                            chequeUID: (chequeUID) => {
                                if (!chequeUID || !filtroCadena.test(chequeUID)) {
                                    const error = "El campo chequeUID solo admite una cadena con mayúsculas, minúsculas, numero y espacios";
                                    throw new Error(error);
                                }
                                return chequeUID;
                            },
                            transferenciaUID: (transferenciaUID) => {
                                if (!transferenciaUID || !filtroCadena.test(transferenciaUID)) {
                                    const error = "El campo transferenciaUID solo admite una cadena con mayúsculas, minúsculas, numero y espacios";
                                    throw new Error(error);
                                }
                                return transferenciaUID;
                            },
                            pagoUIDPasarela: (pagoUIDPasarela) => {
                                if (!pagoUIDPasarela || !filtroCadenaSinEspacios.test(pagoUIDPasarela)) {
                                    const error = "El campo pagoUIDPasarela solo admite una cadena con mayúsculas, minúsculas y numero";
                                    throw new Error(error);
                                }
                                return pagoUIDPasarela;
                            },
                            tarjetaUltimos: (tarjetaUltimos) => {
                                if (!tarjetaUltimos || !filtro4Numeros.test(tarjetaUltimos)) {
                                    const error = "El campo tarjetaUltimos solo admite una cadena con cuatro numeros";
                                    throw new Error(error);
                                }
                                return tarjetaUltimos;
                            },
                        };
                        const fechaActual = DateTime.utc().toISO();
                        const sql = {
                            insertarPago: async (datosDelNuevoPago) => {
                                try {
                                    const asociarPago = `
                                        INSERT INTO
                                        "reservaPagos"
                                        (
                                        "plataformaDePago",
                                        tarjeta,
                                        "tarjetaDigitos",
                                        "pagoUIDPasarela",
                                        reserva,
                                        cantidad,
                                        "fechaPago",
                                        "chequeUID",
                                        "transferenciaUID"
                                        )
                                        VALUES 
                                        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                                        RETURNING
                                        "pagoUID",
                                        "plataformaDePago",
                                        "tarjetaDigitos",
                                        "pagoUIDPasarela",
                                        cantidad,
                                        to_char("fechaPago", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "fechaPagoUTC_ISO", 
                                        "chequeUID",
                                        "transferenciaUID"
                                        `;
                                    const datosPago = [
                                        datosDelNuevoPago.plataformaDePago,
                                        datosDelNuevoPago.tarjeta,
                                        datosDelNuevoPago.tarjetaDigitos,
                                        datosDelNuevoPago.pagoUIDPasarela,
                                        datosDelNuevoPago.reservaUID,
                                        datosDelNuevoPago.cantidadConPunto,
                                        datosDelNuevoPago.fechaPago,
                                        datosDelNuevoPago.chequeUID,
                                        datosDelNuevoPago.transferenciaUID
                                    ];
                                    const consulta = await conexion.query(asociarPago, datosPago);
                                    const detallesDelPagoNuevo = consulta.rows[0];
                                    const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
                                    const fechaPagoUTC_ISO = detallesDelPagoNuevo.fechaPagoUTC_ISO;
                                    const fechaPagoTZ_ISO = DateTime.fromISO(fechaPagoUTC_ISO, { zone: 'utc' })
                                        .setZone(zonaHoraria)
                                        .toISO();
                                    detallesDelPagoNuevo.fechaPagoTZ_ISO = fechaPagoTZ_ISO;

                                    return detallesDelPagoNuevo;
                                } catch (errorCapturado) {
                                    throw errorCapturado;
                                }
                            }
                        };
                        const estructuraFinal = {};
                        let nuevoPago;
                        let pagoUID;
                        switch (plataformaDePago) {
                            case 'efectivo':
                                cantidad = validadores.cantidad(cantidad);
                                //pagadorNombre = validadores.pagadorNombre(pagadorNombre)
                                //pagadorPasaporte = validadores.pagadorPasaporte(pagadorPasaporte)
                                nuevoPago = {
                                    plataformaDePago: plataformaDePago,
                                    //tarjeta: tarjeta,
                                    //tarjetaDigitos: tarjetaDigitos,
                                    //pagoUIDPasarela: pagoUIDPasarela,
                                    reservaUID: reservaUID,
                                    cantidadConPunto: cantidad,
                                    fechaPago: fechaActual,
                                    //pagadorNombre: pagadorNombre,
                                    //pagadorPasaporte: pagadorPasaporte
                                };
                                pagoUID = await sql.insertarPago(nuevoPago);
                                estructuraFinal.ok = "Se ha insertado el nuevo pago en efectivo";
                                estructuraFinal.detallesDelPago = pagoUID;
                                break;
                            case 'cheque':
                                cantidad = validadores.cantidad(cantidad);
                                //pagadorNombre = validadores.pagadorNombre(pagadorNombre)
                                //pagadorPasaporte = validadores.pagadorPasaporte(pagadorPasaporte)
                                chequeUID = validadores.chequeUID(chequeUID);
                                nuevoPago = {
                                    plataformaDePago: plataformaDePago,
                                    //tarjeta: tarjeta,
                                    //tarjetaDigitos: tarjetaDigitos,
                                    //pagoUIDPasarela: pagoUIDPasarela,
                                    reservaUID: reservaUID,
                                    cantidadConPunto: cantidad,
                                    fechaPago: fechaActual,
                                    //pagadorNombre: pagadorNombre,
                                    //pagadorPasaporte: pagadorPasaporte,
                                    chequeUID: chequeUID
                                };
                                pagoUID = await sql.insertarPago(nuevoPago);
                                estructuraFinal.ok = "Se ha insertado el nuevo pago en cheque";
                                estructuraFinal.detallesDelPago = pagoUID;
                                break;
                            case 'transferenciaBancaria':
                                cantidad = validadores.cantidad(cantidad);
                                //pagadorNombre = validadores.pagadorNombre(pagadorNombre)
                                //pagadorPasaporte = validadores.pagadorPasaporte(pagadorPasaporte)
                                transferenciaUID = validadores.transferenciaUID(transferenciaUID);
                                nuevoPago = {
                                    plataformaDePago: plataformaDePago,
                                    //tarjeta: tarjeta,
                                    //tarjetaDigitos: tarjetaDigitos,
                                    //pagoUIDPasarela: pagoUIDPasarela,
                                    reservaUID: reservaUID,
                                    cantidadConPunto: cantidad,
                                    fechaPago: fechaActual,
                                    //pagadorNombre: pagadorNombre,
                                    //pagadorPasaporte: pagadorPasaporte,
                                    transferenciaUID: transferenciaUID
                                };
                                pagoUID = await sql.insertarPago(nuevoPago);
                                estructuraFinal.ok = "Se ha insertado el nuevo pago en cheque";
                                estructuraFinal.detallesDelPago = pagoUID;
                                break;
                            case 'pasarela':
                                const deshabilitado = "La opcion de asociar un pago a la pasarela esta temporalmente deshabilitada";
                                throw new Error(deshabilitado);
                                // Aqui solo se asocia el pago con el id de la pasarela, por que para lo otro estan los enlaces de pago
                                //pagadorNombre = validadores.pagadorNombre(pagadorNombre)
                                //pagadorPasaporte = validadores.pagadorPasaporte(pagadorPasaporte)
                                pagoUIDPasarela = validadores.pagoUIDPasarela(pagoUIDPasarela);
                                const consultaUIDUnico = `
                                    SELECT 
                                    "pagoUIDPasarela"
                                    FROM 
                                    "reservaPagos"
                                    WHERE "pagoUIDPasarela" = $1 AND reserva = $2;`;
                                const resuelveConsultaUIDUnico = await conexion.query(consultaUIDUnico, [pagoUIDPasarela, reservaUID]);
                                if (resuelveConsultaUIDUnico.rowCount > 0) {
                                    const error = "Ya existe este id del pago asociado a esta reserva";
                                    throw new Error(error);
                                }
                                const detallesDelPago = await componentes.pasarela.detallesDelPago(pagoUIDPasarela);
                                if (detallesDelPago.error) {
                                    const errorUID = detallesDelPago.error.errors[0].code;
                                    let error;
                                    switch (errorUID) {
                                        case "NOT_FOUND":
                                            error = "La pasarela informa de que el idenficador de pago que tratas de asocias con Casa Vitini no existe, por favor revisa el identificador de pago";
                                            throw new Error(error);
                                        default:
                                            error = "La pasarela informa de un error generico";
                                            throw new Error(error);
                                    }
                                }
                                // Detalles del pago
                                const pagoUIDPasarelaVerificado = detallesDelPago.id;
                                const cantidadVerificada = detallesDelPago.amountMoney.amount;
                                const cantidadFormateada = utilidades.deFormatoSquareAFormatoSQL(cantidadVerificada);
                                const tarjeta = detallesDelPago.cardDetails.card.cardBrand;
                                const tarjetaDigitos = detallesDelPago.cardDetails.card.last4;
                                const fechaPago = detallesDelPago.createdAt;
                                nuevoPago = {
                                    plataformaDePago: plataformaDePago,
                                    tarjeta: tarjeta,
                                    tarjetaDigitos: tarjetaDigitos,
                                    pagoUIDPasarela: pagoUIDPasarelaVerificado,
                                    reservaUID: reservaUID,
                                    cantidadConPunto: cantidadFormateada,
                                    fechaPago: fechaPago,
                                    //pagadorNombre: pagadorNombre,
                                    //pagadorPasaporte: pagadorPasaporte
                                };
                                pagoUID = await sql.insertarPago(nuevoPago);
                                estructuraFinal.ok = "Se ha insertado los datos importados de la pasarela";
                                estructuraFinal.detallesDelPago = pagoUID;
                                break;
                            case 'tarjeta':
                                cantidad = validadores.cantidad(cantidad);
                                //pagadorNombre = validadores.pagadorNombre(pagadorNombre)
                                //pagadorPasaporte = validadores.pagadorPasaporte(pagadorPasaporte)
                                tarjetaUltimos = validadores.tarjetaUltimos(tarjetaUltimos);
                                nuevoPago = {
                                    plataformaDePago: plataformaDePago,
                                    //tarjeta: tarjeta,
                                    //tarjetaDigitos: tarjetaDigitos,
                                    //pagoUIDPasarela: pagoUIDPasarela,
                                    reservaUID: reservaUID,
                                    cantidadConPunto: cantidad,
                                    fechaPago: fechaActual,
                                    //pagadorNombre: pagadorNombre,
                                    //pagadorPasaporte: pagadorPasaporte,
                                    tarjetaDigitos: tarjetaUltimos
                                };
                                pagoUID = await sql.insertarPago(nuevoPago);
                                estructuraFinal.ok = "Se ha insertado el nuevo pago hecho con tarjeta de manera externa como en un TPV";
                                estructuraFinal.detallesDelPago = pagoUID;
                                break;
                            default:
                                const error = "El campo plataformaDePago solo admite una cadena mayúsculas y minúsculas sin espacios. Las plataformas de pagos son tarjeta, efectivo, pasarela y tranferenciaBancaria";
                                throw new Error(error);
                        }
                        await actualizarEstadoPago(reservaUID);
                        salida.json(estructuraFinal);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    }
                },
                eliminarPagoManual: async () => {
                    try {
                        const palabra = entrada.body.palabra;
                        const pagoUID = entrada.body.pagoUID;
                        const reservaUID = entrada.body.reservaUID;
                        if (palabra !== "eliminar") {
                            const error = "Necesario escribir la la palabra eliminar para confirmar la eliminación y evitar falsos clicks";
                            throw new Error(error);
                        }
                        const filtroPagoUID = /^\d+$/;
                        if (!filtroPagoUID.test(pagoUID)) {
                            const error = "El pagoUID debe de ser una cadena con numeros";
                            throw new Error(error);
                        }
                        await conexion.query('BEGIN'); // Inicio de la transacción
                        await validadoresCompartidos.reservas.validarReserva(reservaUID);
                        const consultaEliminarPago = `
                            DELETE FROM "reservaPagos"
                            WHERE "pagoUID" = $1 AND reserva = $2;
                            `;
                        await conexion.query(consultaEliminarPago, [pagoUID, reservaUID]);
                        // Importante esto al afinal
                        await actualizarEstadoPago(reservaUID);
                        await conexion.query('COMMIT'); // Confirmar la transacción
                        const ok = {
                            ok: "Se ha eliminado irreversiblemente el pago",
                            pagoUID: pagoUID
                        };
                        salida.json(ok);
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    }
                },
                eliminarReembolsoManual: async () => {
                    try {
                        const palabra = entrada.body.palabra;
                        const reembolsoUID = entrada.body.reembolsoUID;
                        if (palabra !== "eliminar") {
                            const error = "Necesario escribir la la palabra eliminar para confirmar el reembolso y evitar falsos clicks.";
                            throw new Error(error);
                        }
                        const filtroPagoUID = /^\d+$/;
                        if (!filtroPagoUID.test(reembolsoUID)) {
                            const error = "El reembolsoUID debe de ser una cadena con numeros";
                            throw new Error(error);
                        }
                        await conexion.query('BEGIN'); // Inicio de la transacción
                        const consultaEliminarReembolso = `
                            DELETE FROM "reservaReembolsos"
                            WHERE "reembolsoUID" = $1;
                            `;
                        const resuelveEliminarReembolso = await conexion.query(consultaEliminarReembolso, [reembolsoUID]);
                        if (resuelveEliminarReembolso.rowCount === 0) {
                            const error = "No se encuentra el reembolso con ese identificador, revisa el reembolsoUID";
                            throw new Error(error);
                        }
                        if (resuelveEliminarReembolso.rowCount === 1) {
                            const ok = {
                                ok: "Se ha eliminado irreversiblemente el el reembolso",
                                reembolsoUID: reembolsoUID
                            };
                            salida.json(ok);
                        }
                        await conexion.query('COMMIT'); // Confirmar la transacción
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    }
                }
            },
            gestionTitular: {
                asociarTitular: async () => {
                    try {
                        const clienteUID = entrada.body.clienteUID;
                        const reservaUID = entrada.body.reservaUID;
                        if (typeof clienteUID !== "number" || !Number.isInteger(clienteUID) || clienteUID <= 0) {
                            const error = "el campo 'clienteUID' solo puede un numero, entero y positivo";
                            throw new Error(error);
                        }
                        if (typeof reservaUID !== "number" || !Number.isInteger(reservaUID) || reservaUID <= 0) {
                            const error = "el campo 'reservaUID' solo puede un numero, entero y positivo";
                            throw new Error(error);
                        }
                        const validarCliente = `
                            SELECT
                            uid,
                            nombre,
                            "primerApellido",
                            "segundoApellido",
                            pasaporte,
                            telefono,
                            email
                            FROM 
                            clientes
                            WHERE
                            uid = $1`;
                        const resuelveValidarCliente = await conexion.query(validarCliente, [clienteUID]);
                        if (resuelveValidarCliente.rowCount === 0) {
                            const error = "No existe el cliente";
                            throw new Error(error);
                        }
                        if (resuelveValidarCliente.rowCount === 1) {
                            const consultaElimintarTitularPool = `
                                DELETE FROM 
                                "poolTitularesReserva"
                                WHERE
                                reserva = $1;
                                `;
                            await conexion.query(consultaElimintarTitularPool, [reservaUID]);
                            const eliminaTitular = `
                                DELETE FROM 
                                "reservaTitulares"
                                WHERE
                                "reservaUID" = $1;
                                `;
                            await conexion.query(eliminaTitular, [reservaUID]);
                            const nombre = resuelveValidarCliente.rows[0].nombre;
                            const primerApellido = resuelveValidarCliente.rows[0].primerApellido ? resuelveValidarCliente.rows[0].primerApellido : "";
                            const segundoApellido = resuelveValidarCliente.rows[0].segundoApellido ? resuelveValidarCliente.rows[0].segundoApellido : "";
                            const pasaporte = resuelveValidarCliente.rows[0].pasaporte;
                            const email = resuelveValidarCliente.rows[0].email ? resuelveValidarCliente.rows[0].email : "";
                            const telefono = resuelveValidarCliente.rows[0].telefono ? resuelveValidarCliente.rows[0].telefono : "";
                            const nombreCompleto = `${nombre} ${primerApellido} ${segundoApellido}`;
                            await validadoresCompartidos.reservas.validarReserva(reservaUID);
                            const consultaActualizarTitular = `
                                INSERT INTO "reservaTitulares"
                                (
                                "titularUID",
                                "reservaUID"
                                )
                                VALUES ($1, $2);`;
                            const datosParaActualizar = [
                                clienteUID,
                                reservaUID
                            ];
                            const resuelveActualizarTitular = await conexion.query(consultaActualizarTitular, datosParaActualizar);
                            if (resuelveActualizarTitular.rowCount === 0) {
                                const error = "No se ha podido actualizar el titular de la reserva";
                                throw new Error(error);
                            }
                            const ok = {
                                ok: "Se ha actualizado correctamente el titular en la reserva",
                                clienteUID: clienteUID,
                                nombreCompleto: nombreCompleto,
                                email: email,
                                nombre: nombre,
                                telefono: telefono,
                                primerApellido: primerApellido,
                                segundoApellido: segundoApellido,
                                pasaporte: pasaporte
                            };
                            salida.json(ok);
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    }
                },
                desasociarClienteComoTitular: async () => {
                    try {
                        const reservaUID = entrada.body.reservaUID;
                        await validadoresCompartidos.reservas.validarReserva(reservaUID);
                        const consultaElimintarTitularPool = `
                                DELETE FROM 
                                    "poolTitularesReserva"
                                WHERE
                                    reserva = $1;
                            `;
                        await conexion.query(consultaElimintarTitularPool, [reservaUID]);
                        const consultaActualizarTitular = `
                                DELETE FROM
                                    "reservaTitulares"
                                WHERE 
                                    "reservaUID" = $1;`;
                        const resuelveActualizarTitular = await conexion.query(consultaActualizarTitular, [reservaUID]);
                        if (resuelveActualizarTitular.rowCount === 0) {
                            const error = "No se ha podido actualizar el titular de la reserva";
                            throw new Error(error);
                        }
                        const ok = {
                            ok: "Se ha eliminado el titular de la reserva, la reserva ahora no tiene titular"
                        };
                        salida.json(ok);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    }
                },
                crearTitular: async () => {
                    try {
                        const reservaUID = entrada.body.reservaUID;
                        let nombre = entrada.body.nombre;
                        let primerApellido = entrada.body.primerApellido;
                        let segundoApellido = entrada.body.segundoApellido;
                        let pasaporte = entrada.body.pasaporte;
                        let telefono = entrada.body.telefono;
                        let correoElectronico = entrada.body.correo;
                        let notas = entrada.body?.notas;
                        await conexion.query('BEGIN'); // Inicio de la transacción
                        const reserva = await validadoresCompartidos.reservas.validarReserva(reservaUID);
                        const consultaElimintarTitularPool = `
                            DELETE FROM 
                            "poolTitularesReserva"
                            WHERE
                            reserva = $1;`;
                        await conexion.query(consultaElimintarTitularPool, [reservaUID]);
                        const eliminaTitular = `
                            DELETE FROM 
                            "reservaTitulares"
                            WHERE
                            "reservaUID" = $1;
                            `;
                        await conexion.query(eliminaTitular, [reservaUID]);
                        const nuevoClientePorValidar = {
                            nombre: nombre,
                            primerApellido: primerApellido,
                            segundoApellido: segundoApellido,
                            pasaporte: pasaporte,
                            telefono: telefono,
                            correoElectronico: correoElectronico,
                        };
                        const datosValidados = await validadoresCompartidos.clientes.nuevoCliente(nuevoClientePorValidar);
                        const datosNuevoCliente = {
                            nombre: datosValidados.nombre,
                            primerApellido: datosValidados.primerApellido,
                            segundoApellido: datosValidados.segundoApellido,
                            pasaporte: datosValidados.pasaporte,
                            telefono: datosValidados.telefono,
                            correoElectronico: datosValidados.correoElectronico
                        };
                        const nuevoCliente = await insertarCliente(datosNuevoCliente);
                        const clienteUID = nuevoCliente.uid;
                        const nombre_ = datosValidados.nombre;
                        const primerApellido_ = datosValidados.primerApellido ? datosValidados.primerApellido : "";
                        const segundoApellido_ = datosValidados.segundoApellido ? nuevoCliente.segundoApellido : "";
                        const email_ = datosValidados.email ? datosValidados.email : "";
                        const pasaporte_ = datosValidados.pasaporte;
                        const telefono_ = datosValidados.telefono ? datosValidados.telefono : "";
                        const nombreCompleto = `${nombre_} ${primerApellido_} ${segundoApellido_}`;
                        // Asociar nuevo cliente como titular
                        const consultaInsertaTitularReserva = `
                            INSERT INTO "reservaTitulares"
                            (
                            "titularUID",
                            "reservaUID"
                            )
                            VALUES ($1, $2);`;
                        const resuelveInsertarTitular = await conexion.query(consultaInsertaTitularReserva, [clienteUID, reservaUID]);
                        if (resuelveInsertarTitular.rowCount === 0) {
                            const error = "No se ha podio insertar el titular por favor vuelve a intentarlo";
                            throw new Error(error);
                        }
                        if (resuelveInsertarTitular.rowCount === 1) {
                            const ok = {
                                ok: "Se  ha insertado el nuevo cliente en la base de datos y se ha asociado a la reserva",
                                nombreCompleto: nombreCompleto,
                                clienteUID: clienteUID,
                                nombre: nombre_,
                                primerApellido: primerApellido_,
                                segundoApellido: segundoApellido_,
                                email: email_,
                                telefono: telefono_,
                                pasaporte: pasaporte_
                            };
                            salida.json(ok);
                        }
                        await conexion.query('COMMIT'); // Confirmar la transacción
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    }
                }
            },
            generarPdf: async () => {
                try {
                    const reservaUID = entrada.body.reservaUID;
                    await validadoresCompartidos.reservas.validarReserva(reservaUID);
                    const metadatos = {
                        reservaUID: reservaUID
                    };
                    const reserva = await detallesReserva(metadatos);
                    const pdf = await generadorPDF(reserva);
                    salida.setHeader('Content-Type', 'application/pdf');
                    salida.setHeader('Content-Disposition', 'attachment; filename=documento.pdf');
                    salida.send(pdf);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                }
            },
            detallesDelPernoctantePorComprobar: async () => {
                try {
                    const reservaUID = entrada.body.reservaUID;
                    await validadoresCompartidos.reservas.validarReserva(reservaUID);
                    const pernoctanteUID = entrada.body.pernoctanteUID;
                    if (typeof pernoctanteUID !== "number" || !Number.isInteger(pernoctanteUID) || pernoctanteUID <= 0) {
                        const error = "El campo 'pernoctanteUID' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    const validarPernoctante = `
                        SELECT 
                        "clienteUID"
                        FROM 
                        "reservaPernoctantes" 
                        WHERE
                        reserva = $1 AND "pernoctanteUID" = $2;`;
                    const resulveValidarPernoctante = await conexion.query(validarPernoctante, [reservaUID, pernoctanteUID]);
                    if (resulveValidarPernoctante.rowCount === 0) {
                        const error = "No existe ningun pernoctante con ese UID dentro del la reserva";
                        throw new Error(error);
                    }
                    if (resulveValidarPernoctante.rowCount === 1) {
                        const clienteUID = resulveValidarPernoctante.rows[0].clienteUID;
                        if (clienteUID) {
                            const error = "El pernoctante ya ha pasado el proceso de comporbacion";
                            throw new Error(error);
                        } else {
                            const datosClientePool = `
                                SELECT 
                                "nombreCompleto",
                                pasaporte
                                FROM 
                                "poolClientes" 
                                WHERE
                                "pernoctanteUID" = $1;`;
                            const resuelveClientePool = await conexion.query(datosClientePool, [pernoctanteUID]);
                            const nombreCompleto = resuelveClientePool.rows[0].nombreCompleto;
                            const pasaporte = resuelveClientePool.rows[0].pasaporte;
                            const ok = {
                                pernoctanteUID: pernoctanteUID,
                                nombreCompleto: nombreCompleto,
                                pasaporte: pasaporte
                            };
                            salida.json(ok);
                        }
                    }
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            confirmarFechaCheckIn: async () => {
                try {
                    const pernoctantaUID = entrada.body.pernoctanteUID;
                    const fechaCheckIn = entrada.body.fechaCheckIn;
                    if (typeof pernoctantaUID !== "number" || !Number.isInteger(pernoctantaUID) || pernoctantaUID <= 0) {
                        const error = "El campo 'pernoctantaUID' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    const fechaCheckIn_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaCheckIn)).fecha_ISO;
                    const fechaCheckIn_Objeto = DateTime.fromISO(fechaCheckIn_ISO);
                    await conexion.query('BEGIN'); // Inicio de la transacción


                    // Validar pernoctanteUID
                    const validarPernoctante = `
                        SELECT 
                        reserva,
                        to_char("fechaCheckOutAdelantado", 'YYYY-MM-DD') as "checkoutAdelantado_ISO", 
                        "clienteUID"
                        FROM "reservaPernoctantes"
                        WHERE "pernoctanteUID" = $1
                        `;
                    const resuelvePernoctante = await conexion.query(validarPernoctante, [pernoctantaUID]);
                    if (resuelvePernoctante.rowCount === 0) {
                        const error = "No existe el pernoctanteUID";
                        throw new Error(error);
                    }
                    // Validar que el pernoctatne sea cliente y no cliente pool
                    const clienteUID = resuelvePernoctante.rows[0].clienteUID;
                    if (!clienteUID) {
                        const error = "El pernoctante esta pendiente de validacion documental. Valide primero la documentacion antes de hacer el checkin";
                        throw new Error(error);
                    }
                    const reservaUID = resuelvePernoctante.rows[0].reserva;
                    const checkoutAdelantado_ISO = resuelvePernoctante.rows[0].checkoutAdelantado_ISO;
                    const fechasReserva = `
                        SELECT 
                        "estadoReserva",
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO"
                        FROM 
                        reservas
                        WHERE 
                        reserva = $1
                        `;
                    const resuelveReserva = await conexion.query(fechasReserva, [reservaUID]);
                    if (resuelveReserva.rowCount === 0) {
                        const error = "No existe la reserva";
                        throw new Error(error);
                    }
                    // validar que la reserva no este cancelada
                    const estadoReserva = resuelveReserva.rows[0].estadoReserva;
                    if (estadoReserva === "cancelada") {
                        const error = "No se puede alterar una fecha de checkin de una reserva cancelada";
                        throw new Error(error);
                    }
                    const fechaEntrada_ISO = resuelveReserva.rows[0].fechaEntrada_ISO;
                    const fechaEntrada_Objeto = DateTime.fromISO(fechaEntrada_ISO);
                    const fechaSalida_ISO = resuelveReserva.rows[0].fechaSalida_ISO;
                    const fechaSalida_Objeto = DateTime.fromISO(fechaSalida_ISO);
                    if (fechaCheckIn_Objeto < fechaEntrada_Objeto) {
                        const error = "La fecha de Checkin no puede ser inferior a la fecha de entrada de la reserva";
                        throw new Error(error);
                    }
                    if (checkoutAdelantado_ISO) {
                        const checkoutAdelantado_Objeto = DateTime.fromISO(checkoutAdelantado_ISO);
                        if (fechaCheckIn_Objeto >= checkoutAdelantado_Objeto) {
                            const error = "La fecha de Checkin no puede ser igual o superior a la fecha de checkout adelantado";
                            throw new Error(error);
                        }
                    }
                    if (fechaCheckIn_Objeto >= fechaSalida_Objeto) {
                        const error = "La fecha de Checkin no puede ser igual o superior a la fecha de salida de la reserva";
                        throw new Error(error);
                    }
                    const actualizerFechaCheckIn = `
                        UPDATE "reservaPernoctantes"
                        SET
                          "fechaCheckIn" = $1
                        WHERE
                          "pernoctanteUID" = $2;
                        `;
                    const actualizarCheckIn = await conexion.query(actualizerFechaCheckIn, [fechaCheckIn_ISO, pernoctantaUID]);
                    if (actualizarCheckIn.rowCount === 0) {
                        const error = "No se ha podido actualziar la fecha de checkin";
                        throw new Error(error);
                    }
                    await conexion.query('COMMIT'); // Confirmar la transacción
                    const ok = {
                        ok: "Se ha actualizado la fecha de checkin correctamente",
                        fechaCheckIn: fechaCheckIn
                    };
                    salida.json(ok);
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            eliminarCheckIN: async () => {
                try {
                    const pernoctantaUID = entrada.body.pernoctanteUID;
                    if (typeof pernoctantaUID !== "number" || !Number.isInteger(pernoctantaUID) || pernoctantaUID <= 0) {
                        const error = "El campo 'pernoctantaUID' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    await conexion.query('BEGIN'); // Inicio de la transacción


                    // Validar pernoctanteUID
                    const validarPernoctante = `
                        SELECT 
                        reserva
                        FROM "reservaPernoctantes"
                        WHERE "pernoctanteUID" = $1
                        `;
                    const resuelvePernoctante = await conexion.query(validarPernoctante, [pernoctantaUID]);
                    if (resuelvePernoctante.rowCount === 0) {
                        const error = "No existe el pernoctanteUID";
                        throw new Error(error);
                    }
                    // Validar que el pernoctatne sea cliente y no cliente pool
                    const reservaUID = resuelvePernoctante.rows[0].reserva;
                    const fechasReserva = `
                        SELECT 
                        "estadoReserva"
                        FROM 
                        reservas
                        WHERE 
                        reserva = $1
                        `;
                    const resuelveReserva = await conexion.query(fechasReserva, [reservaUID]);
                    if (resuelveReserva.rowCount === 0) {
                        const error = "No existe la reserva";
                        throw new Error(error);
                    }
                    // validar que la reserva no este cancelada
                    const estadoReserva = resuelveReserva.rows[0].estadoReserva;
                    if (estadoReserva === "cancelada") {
                        const error = "No se puede alterar una fecha de checkin de una reserva cancelada";
                        throw new Error(error);
                    }
                    const actualizerFechaCheckIn = `
                        UPDATE "reservaPernoctantes"
                        SET
                          "fechaCheckIn" = NULL,
                          "fechaCheckOutAdelantado" = NULL
                        WHERE
                          "pernoctanteUID" = $1;
                        `;
                    const actualizarCheckIn = await conexion.query(actualizerFechaCheckIn, [pernoctantaUID]);
                    if (actualizarCheckIn.rowCount === 0) {
                        const error = "No se ha podido eliminar la fecha de checkin";
                        throw new Error(error);
                    }
                    await conexion.query('COMMIT'); // Confirmar la transacción
                    const ok = {
                        ok: "Se ha eliminado la fecha de checkin correctamente"
                    };
                    salida.json(ok);
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            confirmarFechaCheckOutAdelantado: async () => {
                try {
                    const pernoctantaUID = entrada.body.pernoctanteUID;
                    const fechaCheckOut = entrada.body.fechaCheckOut;
                    if (typeof pernoctantaUID !== "number" || !Number.isInteger(pernoctantaUID) || pernoctantaUID <= 0) {
                        const error = "El campo 'pernoctantaUID' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    const fechaCheckOut_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaCheckOut)).fecha_ISO;
                    const fechaCheckOut_Objeto = DateTime.fromISO(fechaCheckOut_ISO);
                    await conexion.query('BEGIN'); // Inicio de la transacción


                    // Validar pernoctanteUID
                    const validarPernoctante = `
                        SELECT 
                        reserva,
                        to_char("fechaCheckIn", 'YYYY-MM-DD') as "fechaCheckIn_ISO", 
                        "clienteUID"
                        FROM "reservaPernoctantes"
                        WHERE "pernoctanteUID" = $1
                        `;
                    const resuelvePernoctante = await conexion.query(validarPernoctante, [pernoctantaUID]);
                    if (resuelvePernoctante.rowCount === 0) {
                        const error = "No existe el pernoctanteUID";
                        throw new Error(error);
                    }
                    // Validar que el pernoctatne sea cliente y no cliente pool
                    const clienteUID = resuelvePernoctante.rows[0].clienteUID;
                    if (!clienteUID) {
                        const error = "El pernoctante esta pendiente de validacion documental. Valide primero la documentacion antes de hacer el checkin";
                        throw new Error(error);
                    }
                    const reservaUID = resuelvePernoctante.rows[0].reserva;
                    const fechaCheckIn_ISO = resuelvePernoctante.rows[0].fechaCheckIn_ISO;
                    if (!fechaCheckIn_ISO) {
                        const error = "No puedes determinar un checkout adelantado a un pernoctante que no ha reazliado el checkin. Primero realiza el checkin";
                        throw new Error(error);
                    }
                    const fechasReserva = `
                        SELECT 
                        "estadoReserva",
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO"
                        FROM 
                        reservas
                        WHERE 
                        reserva = $1
                        `;
                    const resuelveReserva = await conexion.query(fechasReserva, [reservaUID]);
                    if (resuelveReserva.rowCount === 0) {
                        const error = "No existe la reserva";
                        throw new Error(error);
                    }
                    // validar que la reserva no este cancelada
                    const estadoReserva = resuelveReserva.rows[0].estadoReserva;
                    if (estadoReserva === "cancelada") {
                        const error = "No se puede alterar una fecha de checkin de una reserva cancelada";
                        throw new Error(error);
                    }
                    const fechaEntrada_ISO = resuelveReserva.rows[0].fechaEntrada_ISO;
                    const fechaEntrada_Objeto = DateTime.fromISO(fechaEntrada_ISO);
                    const fechaSalida_ISO = resuelveReserva.rows[0].fechaSalida_ISO;
                    const fechaSalida_Objeto = DateTime.fromISO(fechaSalida_ISO);
                    if (fechaCheckOut_Objeto >= fechaSalida_Objeto) {
                        const error = "La fecha de Checkout adelantado no puede ser superior o igual a la fecha de salida de la reserva, si el checkout se hace el mismo dia que finaliza la reserva no hace falta has un checkout adelantado";
                        throw new Error(error);
                    }
                    if (fechaCheckIn_ISO) {
                        const fechaCheckIn_Objeto = DateTime.fromISO(fechaCheckIn_ISO);
                        if (fechaCheckIn_Objeto >= fechaCheckOut_Objeto) {
                            const error = "La fecha de Checkout no puede ser igual o inferior a la fecha de checkin";
                            throw new Error(error);
                        }
                    }
                    if (fechaCheckOut_Objeto <= fechaEntrada_Objeto) {
                        const error = "La fecha de Checkout no puede ser inferior o igual a la fecha de entrada de la reserva";
                        throw new Error(error);
                    }
                    const actualizerFechaCheckOut = `
                        UPDATE "reservaPernoctantes"
                        SET
                          "fechaCheckOutAdelantado" = $1
                        WHERE
                          "pernoctanteUID" = $2;
                        `;
                    const actualizarCheckOut = await conexion.query(actualizerFechaCheckOut, [fechaCheckOut_ISO, pernoctantaUID]);
                    if (actualizarCheckOut.rowCount === 0) {
                        const error = "No se ha podido actualziar la fecha de checkout";
                        throw new Error(error);
                    }
                    await conexion.query('COMMIT'); // Confirmar la transacción
                    const ok = {
                        ok: "Se ha actualizado la fecha de checkin correctamente",
                        fechaCheckOut: fechaCheckOut
                    };
                    salida.json(ok);
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            eliminarCheckOutAdelantado: async () => {
                try {
                    const pernoctantaUID = entrada.body.pernoctanteUID;
                    if (typeof pernoctantaUID !== "number" || !Number.isInteger(pernoctantaUID) || pernoctantaUID <= 0) {
                        const error = "El campo 'pernoctantaUID' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    await conexion.query('BEGIN'); // Inicio de la transacción


                    // Validar pernoctanteUID
                    const validarPernoctante = `
                        SELECT 
                        reserva
                        FROM "reservaPernoctantes"
                        WHERE "pernoctanteUID" = $1
                        `;
                    const resuelvePernoctante = await conexion.query(validarPernoctante, [pernoctantaUID]);
                    if (resuelvePernoctante.rowCount === 0) {
                        const error = "No existe el pernoctanteUID";
                        throw new Error(error);
                    }
                    // Validar que el pernoctatne sea cliente y no cliente pool
                    const reservaUID = resuelvePernoctante.rows[0].reserva;
                    const fechasReserva = `
                        SELECT 
                        "estadoReserva"
                        FROM 
                        reservas
                        WHERE 
                        reserva = $1
                        `;
                    const resuelveReserva = await conexion.query(fechasReserva, [reservaUID]);
                    if (resuelveReserva.rowCount === 0) {
                        const error = "No existe la reserva";
                        throw new Error(error);
                    }
                    // validar que la reserva no este cancelada
                    const estadoReserva = resuelveReserva.rows[0].estadoReserva;
                    if (estadoReserva === "cancelada") {
                        const error = "No se puede alterar una fecha de checkin de una reserva cancelada";
                        throw new Error(error);
                    }
                    const actualizerFechaCheckOut = `
                        UPDATE "reservaPernoctantes"
                        SET
                          "fechaCheckOutAdelantado" = NULL
                        WHERE
                          "pernoctanteUID" = $1;
                        `;
                    const actualizarCheckOut = await conexion.query(actualizerFechaCheckOut, [pernoctantaUID]);
                    if (actualizarCheckOut.rowCount === 0) {
                        const error = "No se ha podido eliminar la fecha de checkin";
                        throw new Error(error);
                    }
                    await conexion.query('COMMIT'); // Confirmar la transacción
                    const ok = {
                        ok: "Se ha eliminado la fecha de checkin correctamente"
                    };
                    salida.json(ok);
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            pendientes_de_revision: {
                obtener_reservas: async () => {
                    // Obtener todas las reservas no pagadas de origen cliente
                    const obtenerReservas = `
                        SELECT
                            r.reserva,
                            to_char(r.entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                            to_char(r.salida, 'YYYY-MM-DD') as "fechaSalida_ISO",
                            to_char(r.creacion, 'DD/MM/YYYY HH24:MI:SS') AS "fechaCreacion_ISO",
                            rt."totalConImpuestos"
                        FROM 
                            reservas r
                        JOIN
                           "reservaTotales" rt ON r.reserva = rt.reserva
                        WHERE 
                            r.origen = $1 AND
                            r."estadoPago" = $2 AND
                            r."estadoReserva" = $3
                        ORDER BY 
                            r.creacion ASC
                        ;`;
                    const parametrosDeBusqueda = [
                        "cliente",
                        "noPagado",
                        "confirmada"
                    ];
                    const resuelveReservasPendientes = await conexion.query(obtenerReservas, parametrosDeBusqueda);
                    const reservasPendientes = resuelveReservasPendientes.rows;
                    const ok = {
                        ok: "Aquí tienes las reservas de origen publico pendientes por revisar",
                        reservas: []
                    };
                    if (resuelveReservasPendientes.rowCount > 0) {
                        ok.reservas.push(...reservasPendientes);
                    }
                    salida.json(ok);
                }
            }
        },
        situacion: {
            obtenerSituacion: async () => {
                try {
                    const apartamentosObjeto = {};
                    const estadoDisonible = "disponible";
                    const consultaEstadoApartamentos = `
                        SELECT 
                        "apartamentoIDV",
                        "estadoConfiguracion"
                        FROM 
                        "configuracionApartamento"
                        -- WHERE "estadoConfiguracion" = $1
                        ORDER BY "apartamentoIDV" ASC
                        `;
                    let resuelveConsultaEstadoApartamentos = await conexion.query(consultaEstadoApartamentos);
                    if (resuelveConsultaEstadoApartamentos.rowCount === 0) {
                        const error = "No hay apartamentos configurados";
                        throw new Error(error);
                    }
                    resuelveConsultaEstadoApartamentos = resuelveConsultaEstadoApartamentos.rows;
                    for (const apartamento of resuelveConsultaEstadoApartamentos) {
                        const apartamentoIDV = apartamento.apartamentoIDV;
                        const estadoApartamento = apartamento.estadoConfiguracion;
                        const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                        apartamentosObjeto[apartamentoIDV] = {
                            apartamentoUI: apartamentoUI,
                            estadoApartamento: estadoApartamento,
                            reservas: [],
                            estadoPernoctacion: "libre"
                        };
                    }
                    const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
                    const tiempoZH = DateTime.now().setZone(zonaHoraria);
                    const fechaActualCompletaTZ = tiempoZH.toISO();
                    const fechaActualTZ = tiempoZH.toISODate();
                    const fechaActualUTC = DateTime.now().toUTC().toISODate();
                    const diaHoyTZ = tiempoZH.day;
                    const mesPresenteTZ = tiempoZH.month;
                    const anoPresenteTZ = tiempoZH.year;
                    const horaPresenteTZ = tiempoZH.hour;
                    const minutoPresenteTZ = tiempoZH.minute;
                    const consultaReservasHoy = `
                        SELECT 
                        reserva, 
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO",
                        to_char(entrada, 'DD/MM/YYYY') as "entradaHumano", 
                        to_char(salida, 'DD/MM/YYYY') as "salidaHumano"
                        FROM reservas
                        WHERE (entrada <= $1::DATE AND salida >= $1::DATE) AND "estadoReserva" <> $2; 
                        `;
                    const resuelveConsultaReservasHoy = await conexion.query(consultaReservasHoy, [fechaActualTZ, "cancelada"]);
                    const ok = {};
                    if (resuelveConsultaReservasHoy.rowCount === 0) {
                        ok.ok = apartamentosObjeto;
                    }
                    if (resuelveConsultaReservasHoy.rowCount > 0) {
                        const reservasHoy = resuelveConsultaReservasHoy.rows;
                        const horasSalidaEntrada = await componentes.administracion.reservas.horasSalidaEntrada();
                        const horaEntradaTZ = horasSalidaEntrada.horaEntradaTZ;
                        const horaSalidaTZ = horasSalidaEntrada.horaSalidaTZ;
                        //ok.fechaUTC = fechaActualUTC;
                        ok.fechaTZ = `${diaHoyTZ}/${mesPresenteTZ}/${anoPresenteTZ}`;
                        ok.horaTZ = `${horaPresenteTZ}:${minutoPresenteTZ}`;
                        ok.horaEntrada = horaEntradaTZ;
                        ok.horaSalida = horaSalidaTZ;
                        for (const reservaDetalles of reservasHoy) {
                            const reservaUID = reservaDetalles.reserva;
                            // Fecha de la base de datos
                            const fechaEntradaReservaISO = reservaDetalles.fechaEntrada_ISO;
                            const fechaSalidaReservaISO = reservaDetalles.fechaSalida_ISO;
                            const fechaEntradaReservaHumano = reservaDetalles.entradaHumano;
                            const fechaSalidaReservaHumano = reservaDetalles.salidaHumano;
                            // Formatos fecha
                            const fechaConHoraEntradaFormato_ISO_ZH = DateTime.fromISO(`${fechaEntradaReservaISO}T${horaEntradaTZ}`, { zone: zonaHoraria }).toISO();
                            const fechaConHoraSalidaFormato_ISO_ZH = DateTime.fromISO(`${fechaSalidaReservaISO}T${horaSalidaTZ}`, { zone: zonaHoraria }).toISO();
                            const consultaApartamentos = `
                                SELECT 
                                apartamento
                                FROM 
                                "reservaApartamentos"
                                WHERE 
                                reserva = $1;`;
                            const resuelveConsultaApartamentos = await conexion.query(consultaApartamentos, [reservaUID]);
                            if (resuelveConsultaApartamentos.rowCount > 0) {
                                const apartamentosResueltos = resuelveConsultaApartamentos.rows;
                                apartamentosResueltos.map((apartamento) => {
                                    if (apartamentosObjeto[apartamento.apartamento]) {
                                        apartamentosObjeto[apartamento.apartamento].estadoPernoctacion = "ocupado";
                                    }
                                    const tiempoRestante = utilidades.calcularTiempoRestanteEnFormatoISO(fechaConHoraSalidaFormato_ISO_ZH, fechaActualCompletaTZ);
                                    const cantidadDias = utilidades.calcularDiferenciaEnDias(fechaConHoraEntradaFormato_ISO_ZH, fechaConHoraSalidaFormato_ISO_ZH);
                                    const porcentajeTranscurrido = utilidades.calcularPorcentajeTranscurridoUTC(fechaConHoraEntradaFormato_ISO_ZH, fechaConHoraSalidaFormato_ISO_ZH, fechaActualCompletaTZ);
                                    let porcentajeFinal = porcentajeTranscurrido;
                                    if (porcentajeTranscurrido >= 100) {
                                        porcentajeFinal = "100";
                                    }
                                    if (porcentajeTranscurrido <= 0) {
                                        porcentajeFinal = "0";
                                    }
                                    const diaEntrada = utilidades.comparadorFechasStringDDMMAAAA(fechaEntradaReservaISO, fechaActualTZ);
                                    const diaSalida = utilidades.comparadorFechasStringDDMMAAAA(fechaSalidaReservaISO, fechaActualTZ);
                                    let identificadoDiaLimite = "diaInterno";
                                    if (diaEntrada) {
                                        identificadoDiaLimite = "diaDeEntrada";
                                    }
                                    if (diaSalida) {
                                        identificadoDiaLimite = "diaDeSalida";
                                    }
                                    let numeroDiaReservaUI;
                                    if (cantidadDias.diasDiferencia > 1) {
                                        numeroDiaReservaUI = cantidadDias.diasDiferencia.toFixed(0) + " días";
                                    }
                                    if (cantidadDias.diasDiferencia === 1) {
                                        numeroDiaReservaUI = cantidadDias.diasDiferencia.toFixed(0) + " día y " + cantidadDias.horasDiferencia.toFixed(0) + " horas";
                                    }
                                    if (cantidadDias.diasDiferencia === 0) {
                                        if (cantidadDias.horasDiferencia > 1) {
                                            numeroDiaReservaUI = cantidadDias.horasDiferencia.toFixed(0) + " horas";
                                        }
                                        if (cantidadDias.horasDiferencia === 1) {
                                            numeroDiaReservaUI = cantidadDias.horasDiferencia.toFixed(0) + " hora";
                                        }
                                        if (cantidadDias.horasDiferencia === 0) {
                                            numeroDiaReservaUI = "menos de una hora";
                                        }
                                    }
                                    const detalleReservaApartamento = {
                                        reserva: reservaUID,
                                        diaLimite: identificadoDiaLimite,
                                        fechaEntrada: fechaEntradaReservaHumano,
                                        fechaSalida: fechaSalidaReservaHumano,
                                        porcentajeTranscurrido: porcentajeFinal + '%',
                                        tiempoRestante: tiempoRestante,
                                        numeroDiasReserva: numeroDiaReservaUI
                                    };
                                    if (apartamentosObjeto[apartamento.apartamento]) {
                                        apartamentosObjeto[apartamento.apartamento].reservas.push(detalleReservaApartamento);
                                    }
                                });
                            }
                        }
                        ok.ok = apartamentosObjeto;
                    }
                    // buscar reservas en el dia actual
                    const eventosCalendarios_airbnb = await apartamentosOcupadosHoy_paraSitaucion(fechaActualTZ);


                    for (const calendariosSincronizadosAirbnb of eventosCalendarios_airbnb) {
                        /*
                        {
                              apartamentoIDV: 'apartamento3',
                              eventos: [
                                {
                                  fechaFinal: '2024-03-31',
                                  fechaInicio: '2024-03-27',
                                  uid: '6fec1092d3fa-51854b16859896e37a57944c187c806c@airbnb.com',
                                  nombreEvento: 'Airbnb (Not available)'
                                }
                              ]
                            }
                        */
                        const apartamentoIDV_destino = calendariosSincronizadosAirbnb.apartamentoIDV;
                        const eventosDelApartamento = calendariosSincronizadosAirbnb.eventos;



                        ok.ok[apartamentoIDV_destino].calendariosSincronizados = {};
                        ok.ok[apartamentoIDV_destino].calendariosSincronizados.airbnb = {};
                        ok.ok[apartamentoIDV_destino].calendariosSincronizados.airbnb.eventos = eventosDelApartamento;
                        ok.ok[apartamentoIDV_destino].estadoPernoctacion = "ocupado";

                    }
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                }
            },
            detallesSituacionApartamento: async () => {
                try {
                    const apartamentoIDV = entrada.body.apartamentoIDV;
                    const filtroCadena = /^[a-z0-9]+$/;
                    if (!apartamentoIDV || !filtroCadena.test(apartamentoIDV)) {
                        const error = "el campo 'apartmentoIDV' solo puede ser letras minúsculas y numeros. sin pesacios";
                        throw new Error(error);
                    }
                    // Validar que existe el apartamento
                    const detalleApartamento = {};
                    const estadoDisonible = "disponible";
                    const validarApartamento = `
                        SELECT 
                        "apartamentoIDV",
                        "estadoConfiguracion"
                        FROM
                        "configuracionApartamento"
                        WHERE
                        "apartamentoIDV" = $1
                        `;
                    const consultaValidarApartamento = await conexion.query(validarApartamento, [apartamentoIDV]);
                    if (consultaValidarApartamento.rowCount === 0) {
                        const error = "No existe el apartamento";
                        throw new Error(error);
                    }
                    const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                    // Ver las reservas que existen hoy
                    const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
                    const tiempoZH = DateTime.now().setZone(zonaHoraria);
                    const fechaActualCompletaTZ = tiempoZH.toISO();
                    const fechaActualTZ = tiempoZH.toISODate();
                    const fechaActualUTC = DateTime.now().toUTC().toISODate();
                    const diaHoyTZ = tiempoZH.day;
                    const mesPresenteTZ = tiempoZH.month;
                    const anoPresenteTZ = tiempoZH.year;
                    const horaPresenteTZ = tiempoZH.hour;
                    const minutoPresenteTZ = tiempoZH.minute;
                    const horasSalidaEntrada = await componentes.administracion.reservas.horasSalidaEntrada();
                    //const zonaHoraria = horasSalidaEntrada.zonaHoraria
                    const horaEntradaTZ = horasSalidaEntrada.horaEntradaTZ;
                    const horaSalidaTZ = horasSalidaEntrada.horaSalidaTZ;
                    const objetoFinal = {
                        apartamentoUI: apartamentoUI,
                        apartamentoIDV: apartamentoIDV,
                        zonaHoraria: zonaHoraria,
                        horaEntradaTZ: horaEntradaTZ,
                        horaSalidaTZ: horaSalidaTZ,
                        estadoPernoctacion: "libre",
                        reservas: []
                    };
                    const consultaReservasHoy = `
                        SELECT 
                        to_char(entrada, 'YYYY-MM-DD') as "entradaISO", 
                        to_char(salida, 'YYYY-MM-DD') as "salidaISO",
                        to_char(entrada, 'DD/MM/YYYY') as "entradaHumano", 
                        to_char(salida, 'DD//MM/YYYY') as "salidaHumano",
                        reserva
                        FROM reservas
                        WHERE entrada <= $1::DATE AND salida >= $1::DATE; 
                        `;
                    const resuelveConsultaReservasHoy = await conexion.query(consultaReservasHoy, [fechaActualTZ]);
                    if (resuelveConsultaReservasHoy.rowCount > 0) {
                        const reservasEncontradasHoy = resuelveConsultaReservasHoy.rows;
                        for (const reserva of reservasEncontradasHoy) {
                            const reservaUID = reserva.reserva;
                            // Fecha de la base de datos
                            const fechaEntradaReservaISO = reserva.entradaISO;
                            const fechaSalidaReservaISO = reserva.salidaISO;
                            const fechaEntradaReservaHumano = reserva.entradaHumano;
                            const fechaSalidaReservaHumano = reserva.salidaHumano;
                            // Formatos fecha
                            const fechaConHoraEntradaFormato_ISO_ZH = DateTime.fromISO(`${fechaEntradaReservaISO}T${horaEntradaTZ}`, { zone: zonaHoraria }).toISO();
                            const fechaConHoraSalidaFormato_ISO_ZH = DateTime.fromISO(`${fechaSalidaReservaISO}T${horaSalidaTZ}`, { zone: zonaHoraria }).toISO();
                            const consultaApartamentosReserva = `
                                SELECT 
                                uid
                                FROM "reservaApartamentos"
                                WHERE reserva = $1 AND apartamento = $2; 
                                `;
                            const resuelveConsultaApartamentosReserva = await conexion.query(consultaApartamentosReserva, [reservaUID, apartamentoIDV]);
                            if (resuelveConsultaApartamentosReserva.rowCount > 0) {
                                const tiempoRestante = utilidades.calcularTiempoRestanteEnFormatoISO(fechaConHoraSalidaFormato_ISO_ZH, fechaActualCompletaTZ);
                                const cantidadDias = utilidades.calcularDiferenciaEnDias(fechaEntradaReservaISO, fechaSalidaReservaISO);
                                const porcentajeTranscurrido = utilidades.calcularPorcentajeTranscurridoUTC(fechaConHoraEntradaFormato_ISO_ZH, fechaConHoraSalidaFormato_ISO_ZH, fechaActualCompletaTZ);
                                let porcentajeFinal = porcentajeTranscurrido;
                                if (porcentajeTranscurrido >= 100) {
                                    porcentajeFinal = "100";
                                }
                                if (porcentajeTranscurrido <= 0) {
                                    porcentajeFinal = "0";
                                }
                                const diaEntrada = utilidades.comparadorFechasStringDDMMAAAA(fechaEntradaReservaISO, fechaActualTZ);
                                const diaSalida = utilidades.comparadorFechasStringDDMMAAAA(fechaSalidaReservaISO, fechaActualTZ);
                                let identificadoDiaLimite = "diaInterno";
                                if (diaEntrada) {
                                    identificadoDiaLimite = "diaDeEntrada";
                                }
                                if (diaSalida) {
                                    identificadoDiaLimite = "diaDeSalida";
                                }
                                const estructuraReserva = {
                                    reservaUID: reservaUID,
                                    fechaEntrada: fechaEntradaReservaHumano,
                                    fechaSalida: fechaSalidaReservaHumano,
                                    diaLimite: identificadoDiaLimite,
                                    tiempoRestante: tiempoRestante,
                                    cantidadDias: cantidadDias,
                                    porcentajeTranscurrido: porcentajeFinal + '%',
                                    habitaciones: []
                                };
                                objetoFinal.estadoPernoctacion = "ocupado";
                                const apartamentoUID = resuelveConsultaApartamentosReserva.rows[0].uid;
                                // Extraer las habitaciones
                                const consultaHabitaciones = `
                                    SELECT 
                                    uid, habitacion
                                    FROM "reservaHabitaciones"
                                    WHERE reserva = $1 AND apartamento = $2 ; 
                                    `;
                                const resuelveConsultaHabitaciones = await conexion.query(consultaHabitaciones, [reservaUID, apartamentoUID]);
                                if (resuelveConsultaHabitaciones.rowCount > 0) {
                                    const habitaciones = resuelveConsultaHabitaciones.rows;
                                    for (const habitacion of habitaciones) {
                                        const habitacionUID = habitacion.uid;
                                        const habitacionIDV = habitacion.habitacion;
                                        const resolverHabitacionUI = `
                                            SELECT 
                                            "habitacionUI"
                                            FROM habitaciones
                                            WHERE habitacion = $1; 
                                            `;
                                        const resuelveResolverHabitacionUI = await conexion.query(resolverHabitacionUI, [habitacionIDV]);
                                        const habitacionUI = resuelveResolverHabitacionUI.rows[0].habitacionUI;
                                        const detalleHabitacion = {
                                            habitacionIDV: habitacionIDV,
                                            habitacionUI: habitacionUI,
                                            pernoctantes: []
                                        };
                                        const consultaPernoctanesHabitacion = `
                                            SELECT 
                                            "clienteUID",
                                            "pernoctanteUID",
                                            to_char("fechaCheckIn", 'YYYY-MM-DD') as "fechaCheckIn_ISO", 
                                            to_char("fechaCheckOutAdelantado", 'YYYY-MM-DD') as "fechaCheckOutAdelantado_ISO"
                                            FROM "reservaPernoctantes"
                                            WHERE reserva = $1 AND habitacion = $2 ; 
                                            `;
                                        const resuelveConsultaPernoctanesHabitacion = await conexion.query(consultaPernoctanesHabitacion, [reservaUID, habitacionUID]);
                                        if (resuelveConsultaPernoctanesHabitacion.rowCount > 0) {
                                            const pernoctantes = resuelveConsultaPernoctanesHabitacion.rows;
                                            const pernoctantesObjetoTemporal = [];
                                            for (const pernoctante of pernoctantes) {
                                                const clienteUID = pernoctante.clienteUID;
                                                const fechaCheckIn_ISO = pernoctante.fechaCheckIn_ISO;
                                                const fechaCheckOutAdelantado_ISO = pernoctante.fechaCheckOutAdelantado_ISO;
                                                if (clienteUID) {
                                                    const resolverDatosPernoctante = `
                                                        SELECT 
                                                        nombre,
                                                        "primerApellido",
                                                        "segundoApellido",
                                                        uid,
                                                        pasaporte
                                                        FROM clientes
                                                        WHERE uid = $1 ; 
                                                        `;
                                                    const resuelveResolverDatosPernoctante = await conexion.query(resolverDatosPernoctante, [clienteUID]);
                                                    const datosCliente = resuelveResolverDatosPernoctante.rows[0];
                                                    const nombre = datosCliente.nombre;
                                                    const primerApellido = datosCliente.primerApellido || "";
                                                    const segundoApellido = datosCliente.segundoApellido || "";
                                                    const pasaporte = datosCliente.pasaporte;
                                                    const constructorNombreCompleto = `${nombre} ${primerApellido} ${segundoApellido}`;
                                                    const uid = resuelveResolverDatosPernoctante.rows[0].uid;
                                                    const detallesPernoctante = {
                                                        nombreCompleto: constructorNombreCompleto.trim(),
                                                        tipoPernoctante: "cliente",
                                                        pasaporte: pasaporte,
                                                        uidCliente: uid
                                                    };
                                                    if (fechaCheckIn_ISO) {
                                                        const fechaCheckIn_array = fechaCheckIn_ISO.split("-");
                                                        const fechaCheckIn_humano = `${fechaCheckIn_array[2]}/${fechaCheckIn_array[1]}/${fechaCheckIn_array[0]}`;
                                                        detallesPernoctante.fechaCheckIn = fechaCheckIn_humano;
                                                    }
                                                    if (fechaCheckOutAdelantado_ISO) {
                                                        const fechaCheckOutAdelantado_array = fechaCheckOutAdelantado_ISO.split("-");
                                                        const fechaCheckOut_humano = `${fechaCheckOutAdelantado_array[2]}/${fechaCheckOutAdelantado_array[1]}/${fechaCheckOutAdelantado_array[0]}`;
                                                        detallesPernoctante.fechaCheckOut = fechaCheckOut_humano;
                                                    }
                                                    pernoctantesObjetoTemporal.push(detallesPernoctante);
                                                } else {
                                                    const pernoctanteUID = pernoctante.pernoctanteUID;
                                                    const resolverDatosPernoctante = `
                                                        SELECT 
                                                        "nombreCompleto",
                                                        uid,
                                                        pasaporte
                                                        FROM "poolClientes"
                                                        WHERE "pernoctanteUID" = $1 ; 
                                                        `;
                                                    const resuelveResolverDatosPernoctante = await conexion.query(resolverDatosPernoctante, [pernoctanteUID]);
                                                    const nombreCompleto = resuelveResolverDatosPernoctante.rows[0].nombreCompleto;
                                                    const uid = resuelveResolverDatosPernoctante.rows[0].uid;
                                                    const pasaporte = resuelveResolverDatosPernoctante.rows[0].pasaporte;
                                                    const detallesPernoctante = {
                                                        nombreCompleto: nombreCompleto,
                                                        tipoPernoctante: "clientePool",
                                                        pasaporte: pasaporte,
                                                        uidCliente: uid
                                                    };
                                                    pernoctantesObjetoTemporal.push(detallesPernoctante);
                                                }
                                            }
                                            detalleHabitacion.pernoctantes = pernoctantesObjetoTemporal;
                                        }
                                        estructuraReserva.habitaciones.push(detalleHabitacion);
                                    }
                                }
                                objetoFinal.reservas.push(estructuraReserva);
                            }
                        }
                    }
                    // Calendarios sincronizados
                    const datosAirbnb = {
                        apartamentoIDV: apartamentoIDV,
                        fechaHoy_ISO: fechaActualTZ
                    };
                    const eventosSincronizadosAirbnb = await eventosDelApartamento(datosAirbnb);
                    objetoFinal.calendariosSincronizados = {};
                    objetoFinal.calendariosSincronizados.airbnb = {
                        eventos: eventosSincronizadosAirbnb.eventos
                    };
                    if (eventosSincronizadosAirbnb.eventos.length > 0) {
                        objetoFinal.estadoPernoctacion = "ocupado";
                    }
                    const ok = {
                        ok: objetoFinal
                    };
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            }
        },
        configuracion: {
            IDX: {
                ROL: ["administrador", "empleado"]
            },
            zonaHoraria: {
                obtenerConfiguracion: {
                    IDX: {
                        ROL: [
                            "administrador",
                            "empleado"
                        ]
                    },
                    X: async () => {
                        try {
                            const consultaConfiguracionGlobal = `
                            SELECT 
                            *
                            FROM 
                            "configuracionGlobal"
                            WHERE
                            "configuracionUID" = $1
                            `;
                            const configuracionUID = [
                                "zonaHoraria"
                            ];
                            const resuelveConfiguracionGlobal = await conexion.query(consultaConfiguracionGlobal, configuracionUID);
                            if (resuelveConfiguracionGlobal.rowCount === 0) {
                                const error = "No hay configuraciones globales";
                                throw new Error(error);
                            }
                            const listaZonasHorarias = zonasHorarias();
                            const ok = {
                                ok: resuelveConfiguracionGlobal.rows[0],
                                listaZonasHorarias: listaZonasHorarias
                            };
                            salida.json(ok);
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                guardarConfiguracion: {
                    IDX: {
                        ROL: [
                            "administrador"
                        ]
                    },
                    X: async () => {
                        try {
                            const zonaHoraria = entrada.body.zonaHoraria;
                            const filtroZonaHoraria = /^[a-zA-Z0-9\/_\-+]+$/;
                            const filtroHora = /^(0\d|1\d|2[0-3]):([0-5]\d)$/;
                            if (!zonaHoraria || !filtroZonaHoraria.test(zonaHoraria)) {
                                const error = "el campo 'zonaHorarial' solo puede ser letras minúsculas, mayúsculas, guiones bajos y medios, signo mac y numeros";
                                throw new Error(error);
                            }
                            // Validar que la zona horarai exista
                            const validarZonaHoraria = (zonaHorariaAValidar) => {
                                let resultadoFinal = "no";
                                const listaZonasHorarias = zonasHorarias();
                                for (const zonaHoraria of listaZonasHorarias) {
                                    if (zonaHoraria === zonaHorariaAValidar) {
                                        resultadoFinal = "si";
                                    }
                                }
                                return resultadoFinal;
                            };
                            if (validarZonaHoraria(zonaHoraria) === "no") {
                                const error = "el campo 'zonaHorariaGlobal' no existe";
                                throw new Error(error);
                            }
                            await conexion.query('BEGIN'); // Inicio de la transacción
                            const actualizarConfiguracionGlobal = `
                                        UPDATE "configuracionGlobal"
                                        SET
                                          valor = $1
                                        WHERE
                                          "configuracionUID" = $2;
                                        `;
                            const nuevaConfiguracion = [
                                zonaHoraria,
                                "zonaHoraria"
                            ];
                            const consultaValidarApartamento = await conexion.query(actualizarConfiguracionGlobal, nuevaConfiguracion);
                            if (consultaValidarApartamento.rowCount === 0) {
                                const error = "No se ha podido actualizar la configuracion, reintentalo";
                                throw new Error(error);
                            }
                            await conexion.query('COMMIT'); // Confirmar la transacción
                            const ok = {
                                ok: "Se ha actualizado correctamente la configuracion"
                            };
                            salida.json(ok);
                        } catch (errorCapturado) {
                            await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                }
            },
            horaDeEntradaSalida: {
                obtenerConfiguracion: {
                    IDX: {
                        ROL: [
                            "administrador",
                            "empleado"
                        ]
                    },
                    X: async () => {
                        try {
                            const consultaConfiguracionGlobal = `
                                SELECT 
                                    valor,
                                    "configuracionUID"
                                FROM 
                                    "configuracionGlobal"
                                WHERE 
                                    "configuracionUID" IN ($1, $2);
                               `;
                            const configuracionUID = [
                                "horaEntradaTZ",
                                "horaSalidaTZ",
                            ];
                            const resuelveConfiguracionGlobal = await conexion.query(consultaConfiguracionGlobal, configuracionUID);
                            if (resuelveConfiguracionGlobal.rowCount === 0) {
                                const error = "No hay configuraciones globales";
                                throw new Error(error);
                            }
                            const configuraciones = resuelveConfiguracionGlobal.rows;
                            const ok = { ok: {} };
                            for (const parConfiguracion of configuraciones) {
                                const configuracionUID = parConfiguracion.configuracionUID;
                                const valor = parConfiguracion.valor;
                                ok.ok[configuracionUID] = valor;
                            }
                            salida.json(ok);
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                guardarConfiguracion: {
                    IDX: {
                        ROL: [
                            "administrador"
                        ]
                    },
                    X: async () => {
                        try {
                            const horaEntradaTZ = entrada.body.horaEntradaTZ;
                            const horaSalidaTZ = entrada.body.horaSalidaTZ;
                            const filtroHora = /^(0\d|1\d|2[0-3]):([0-5]\d)$/;
                            if (!horaEntradaTZ || !filtroHora.test(horaEntradaTZ)) {
                                const error = "La hora de entrada debe de ser 00:00 y no puede ser superior a 23:59, si quieres poner la hora por ejemplo 7:35 -> Tienes que poner el 0 delante del siete, por ejemplo 07:35";
                                throw new Error(error);
                            }
                            if (!horaSalidaTZ || !filtroHora.test(horaSalidaTZ)) {
                                const error = "el campo 'horaEntradaTZ' debe de ser 00:00 y no puede ser superior a 23:59,si quieres poner la hora por ejemplo 7:35 -> Tienes que poner el 0 delante del siete, por ejemplo 07:35";
                                throw new Error(error);
                            }
                            // Parsear las cadenas de hora a objetos DateTime de Luxon
                            const horaEntradaControl = DateTime.fromFormat(horaEntradaTZ, 'HH:mm');
                            const horaSalidaControl = DateTime.fromFormat(horaSalidaTZ, 'HH:mm');
                            // Comparar las horas
                            if (horaSalidaControl >= horaEntradaControl) {
                                const error = "La hora de entrada no puede ser anterior o igual a la hora de salida. Los pernoctantes primero salen del apartamento a su hora de salida y luego los nuevos pernoctantes entran en el apartamento a su hora de entrada. Por eso la hora de entrada tiene que ser mas tarde que al hora de salida. Por que primero salen del apartamento ocupado, el apartmento entonces pasa a estar libre y luego entran los nuevo pernoctantes al apartamento ahora libre de los anteriores pernoctantes.";
                                throw new Error(error);
                            }
                            await conexion.query('BEGIN'); // Inicio de la transacción
                            const configuracionUID_horaEntradaTZ = "horaEntradaTZ";
                            const configuracionUID_horaSalidaTZ = "horaSalidaTZ";
                            const actualizarConfiguracionGlobal = `
                                UPDATE "configuracionGlobal"
                                SET
                                    valor = CASE
                                        WHEN "configuracionUID" = $2 THEN $1
                                        WHEN "configuracionUID" = $4 THEN $3
                                        ELSE valor
                                    END
                                WHERE
                                    "configuracionUID" IN ($2, $4);
                                `;
                            const nuevaConfiguracion = [
                                horaEntradaTZ,
                                configuracionUID_horaEntradaTZ,
                                horaSalidaTZ,
                                configuracionUID_horaSalidaTZ
                            ];
                            const consultaValidarApartamento = await conexion.query(actualizarConfiguracionGlobal, nuevaConfiguracion);
                            if (consultaValidarApartamento.rowCount === 0) {
                                const error = "No se ha podido actualizar la configuracion, reintentalo";
                                throw new Error(error);
                            }
                            await conexion.query('COMMIT'); // Confirmar la transacción
                            const ok = {
                                ok: "Se ha actualizado correctamente la configuracion"
                            };
                            salida.json(ok);
                        } catch (errorCapturado) {
                            await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                }
            },
            calendariosSincronizados: {
                obtenerCalendarios: {
                    IDX: {
                        ROL: [
                            "administrador",
                            "empleado"
                        ]
                    },
                    X: async () => {
                        try {
                            const plataformaCalendarios = entrada.body.plataformaCalendarios;
                            const filtroCadena = /^[a-z0-9]+$/;
                            if (!plataformaCalendarios || !filtroCadena.test(plataformaCalendarios)) {
                                const error = "Hay que definir la plataformaCalendarios, solo se admiten minusculas y numeros sin espacios.";
                                throw new Error(error);
                            }
                            const ok = {
                                ok: []
                            };
                            const consultaConfiguracion = `
                                    SELECT 
                                    uid,
                                    nombre,
                                    url,
                                    "apartamentoIDV",
                                    "plataformaOrigen",
                                    "uidPublico"
                                    FROM 
                                    "calendariosSincronizados"
                                    WHERE
                                    "plataformaOrigen" = $1
                                    `;
                            const resuelveCalendariosSincronizados = await conexion.query(consultaConfiguracion, [plataformaCalendarios]);
                            if (resuelveCalendariosSincronizados.rowCount > 0) {
                                for (const detallesDelCalendario of resuelveCalendariosSincronizados.rows) {
                                    const apartamentoIDV = detallesDelCalendario.apartamentoIDV;
                                    const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                                    detallesDelCalendario.apartamentoUI = apartamentoUI;
                                }
                                ok.ok = resuelveCalendariosSincronizados.rows;
                            }
                            salida.json(ok);
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                detallesDelCalendario: {
                    IDX: {
                        ROL: [
                            "administrador",
                            "empleado"
                        ]
                    },
                    X: async () => {
                        try {
                            const calendarioUID = entrada.body.calendarioUID;
                            const filtroNumeros = /^[0-9]+$/;
                            if (!calendarioUID || !filtroNumeros.test(calendarioUID)) {
                                const error = "Hay que definir la calendarioUID, solo se admiten numeros sin espacios.";
                                throw new Error(error);
                            }
                            const ok = {
                                ok: []
                            };
                            const consultaConfiguracion = `
                                    SELECT 
                                    uid,
                                    nombre,
                                    url,
                                    "apartamentoIDV",
                                    "plataformaOrigen",
                                    "uidPublico"
                                    FROM 
                                    "calendariosSincronizados"
                                    WHERE
                                    uid = $1
                                    `;
                            const resuelveCalendariosSincronizados = await conexion.query(consultaConfiguracion, [calendarioUID]);
                            if (resuelveCalendariosSincronizados.rowCount > 0) {
                                for (const detallesDelCalendario of resuelveCalendariosSincronizados.rows) {
                                    const apartamentoIDV = detallesDelCalendario.apartamentoIDV;
                                    const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                                    detallesDelCalendario.apartamentoUI = apartamentoUI;
                                }
                                ok.ok = resuelveCalendariosSincronizados.rows[0];
                            } else {
                                const error = "No existe ningun calendario con ese identificador, revisa el identificador.";
                                throw new Error(error);
                            }
                            salida.json(ok);
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                airbnb: {
                    crearCalendario: {
                        IDX: {
                            ROL: [
                                "administrador"
                            ]
                        },
                        X: async () => {
                            try {
                                let nombre = entrada.body.nombre;
                                const apartamentoIDV = entrada.body.apartamentoIDV;
                                const url = entrada.body.url;
                                const filtroCadenaIDV = /^[a-z0-9]+$/;
                                const filtroCadenaUI = /^[a-zA-Z0-9\s]+$/;
                                const filtroURL = /^https:\/\/[^\s/$.?#].[^\s]*$/;
                                if (!nombre || !filtroCadenaUI.test(nombre)) {
                                    const error = "Hay que definir el nombre solo se admiten minusculas, mayusculas, numeros y espacios";
                                    throw new Error(error);
                                }
                                nombre = nombre.trim();
                                if (!apartamentoIDV || !filtroCadenaIDV.test(apartamentoIDV)) {
                                    const error = "Hay que definir el apartamentoIDV solo se admiten minusculas, numeros y espacios";
                                    throw new Error(error);
                                }
                                if (!url || !filtroURL.test(url)) {
                                    const error = "Hay que definir el url y que esta cumpla el formato de url";
                                    throw new Error(error);
                                }
                                if (!validator.isURL(url)) {
                                    const error = "La url no cumple con el formato esperado, por favor revisa la url";
                                    throw new Error(error);
                                }
                                // Tambien hay que validar que exista el apartmentoIDV, que no esta hecho
                                const validarApartamentoIDV = `
                                    SELECT
                                    "apartamentoIDV"
                                    FROM 
                                    "configuracionApartamento"
                                    WHERE
                                    "apartamentoIDV" = $1`;
                                const resuelveValidarCliente = await conexion.query(validarApartamentoIDV, [apartamentoIDV]);
                                if (resuelveValidarCliente.rowCount === 0) {
                                    const error = "No existe el identificador de apartamento, verifica el apartamentoIDV";
                                    throw new Error(error);
                                }
                                const controlDominio = new URL(url);
                                const dominiofinal = controlDominio.hostname;
                                if (dominiofinal !== "www.airbnb.com" && dominiofinal !== "airbnb.com") {
                                    const error = "La url o el dominio no son los esperados. Revisa el formato de la url y el dominio. Solo se acepta el dominio airbnb.com";
                                    throw new Error(error);
                                }
                                const errorDeFormado = "En la direccion URL que has introducido no hay un calendario iCal de Airbnb";
                                let calendarioRaw;
                                try {
                                    const maxContentLengthBytes = 10 * 1024 * 1024; // 10 MB
                                    const calendarioData = await axios.get(url, {
                                        maxContentLength: maxContentLengthBytes,
                                    }); calendarioRaw = calendarioData.data;
                                    const jcalData = ICAL.parse(calendarioRaw); // Intenta analizar el contenido como datos jCal
                                    const jcal = new ICAL.Component(jcalData); // Crea un componente jCal


                                    // Verifica si el componente es un calendario (VCALENDAR)
                                    if (jcal?.name.toLowerCase() !== 'vcalendar') {
                                        throw new Error(errorDeFormado);
                                    }
                                } catch (errorCapturado) {
                                    throw new Error(errorDeFormado);
                                }
                                const generarCadenaAleatoria = (longitud) => {
                                    const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
                                    let cadenaAleatoria = '';
                                    for (let i = 0; i < longitud; i++) {
                                        const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
                                        cadenaAleatoria += caracteres.charAt(indiceAleatorio);
                                    }
                                    return cadenaAleatoria + ".ics";
                                };
                                const validarCodigo = async (codigoAleatorio) => {
                                    const validarCodigoAleatorio = `
                                        SELECT
                                        "uidPublico"
                                        FROM "calendariosSincronizados"
                                        WHERE "uidPublico" = $1;`;
                                    const resuelveValidarCodigoAleatorio = await conexion.query(validarCodigoAleatorio, [codigoAleatorio]);
                                    if (resuelveValidarCodigoAleatorio.rowCount > 0) {
                                        return true;
                                    }
                                };
                                const controlCodigo = async () => {
                                    const longitudCodigo = 100; // Puedes ajustar la longitud según tus necesidades
                                    let codigoGenerado;
                                    let codigoExiste;
                                    do {
                                        codigoGenerado = generarCadenaAleatoria(longitudCodigo);
                                        codigoExiste = await validarCodigo(codigoGenerado);
                                    } while (codigoExiste);
                                    // En este punto, tenemos un código único que no existe en la base de datos
                                    return codigoGenerado;
                                };
                                const codigoAleatorioUnico = await controlCodigo();
                                const plataformaOrigen = "airbnb";
                                const consultaConfiguracion = `
                                    INSERT INTO "calendariosSincronizados"
                                    (
                                    nombre,
                                    url,
                                    "apartamentoIDV",
                                    "plataformaOrigen",
                                    "dataIcal", 
                                    "uidPublico"
                                    )
                                    VALUES ($1, $2, $3, $4, $5, $6)
                                    RETURNING uid
                                        `;
                                const nuevoCalendario = [
                                    nombre,
                                    url,
                                    apartamentoIDV,
                                    plataformaOrigen,
                                    calendarioRaw,
                                    codigoAleatorioUnico
                                ];
                                const resuelveCalendariosSincronizados = await conexion.query(consultaConfiguracion, nuevoCalendario);
                                const nuevoUID = resuelveCalendariosSincronizados.rows[0].uid;
                                const ok = {
                                    ok: "Se ha guardado el nuevo calendario y esta listo para ser sincronizado",
                                    nuevoUID: nuevoUID
                                };
                                salida.json(ok);
                            } catch (errorCapturado) {
                                const error = {
                                    error: errorCapturado.message
                                };
                                salida.json(error)
                            }
                        }
                    },
                    actualizarCalendario: {
                        IDX: {
                            ROL: [
                                "administrador"
                            ]
                        },
                        X: async () => {
                            try {
                                const calendarioUID = entrada.body.calendarioUID;
                                let nombre = entrada.body.nombre || null;
                                const apartamentoIDV = entrada.body.apartamentoIDV || null;
                                let url = entrada.body.url || null;
                                const filtroCadenaNumeros = /^[0-9]+$/;
                                const filtroCadena_m_ss_n = /^[a-z0-9]+$/;
                                const filtroCadena_m_M_cs_n = /^[a-zA-Z0-9\s]+$/;
                                const filtroURL = /^https:\/\/[^\s/$.?#].[^\s]*$/;
                                if (!calendarioUID || !filtroCadenaNumeros.test(calendarioUID)) {
                                    const error = "Hay que definir la calendarioUID, solo se admiten numeros sin espacios.";
                                    throw new Error(error);
                                }
                                const consultaSelecionaCalendario = `
                                    SELECT 
                                    uid
                                    FROM 
                                    "calendariosSincronizados" 
                                    WHERE 
                                    uid = $1`;
                                const resuelveSelecionarCalendario = await conexion.query(consultaSelecionaCalendario, [calendarioUID]);
                                if (resuelveSelecionarCalendario.rowCount === 0) {
                                    const error = "No existe el calendario que quieres actualizar, por favor revisa el identificado calendarioUID que has introducido.";
                                    throw new Error(error);
                                }
                                if (nombre) {
                                    nombre = nombre.trim();
                                    if (!filtroCadena_m_M_cs_n.test(nombre)) {
                                        const error = "Hay que definir la nombre, solo se admiten mayusculas, minusculas, numeros y espacios.";
                                        throw new Error(error);
                                    }
                                }
                                if (apartamentoIDV) {
                                    if (!filtroCadena_m_ss_n.test(apartamentoIDV)) {
                                        const error = "Hay que definir la nombre, solo se admiten minusculas y numeros.";
                                        throw new Error(error);
                                    }
                                    // Tambien hay que validar que exista el apartmentoIDV, que no esta hecho
                                    const validarApartamentoIDV = `
                                            SELECT
                                            "apartamentoIDV"
                                            FROM 
                                            "configuracionApartamento"
                                            WHERE
                                            "apartamentoIDV" = $1`;
                                    const resuelveValidarCliente = await conexion.query(validarApartamentoIDV, [apartamentoIDV]);
                                    if (resuelveValidarCliente.rowCount === 0) {
                                        const error = "No existe el identificador de apartamento, verifica el apartamentoIDV";
                                        throw new Error(error);
                                    }
                                }
                                let calendarioRaw = null;
                                if (url) {
                                    if (!filtroURL.test(url)) {
                                        const error = "Hay que definir el url y que esta cumpla el formato de url";
                                        throw new Error(error);
                                    }
                                    const controlDominio = new URL(url);
                                    const dominiofinal = controlDominio.hostname;
                                    if (dominiofinal !== "www.airbnb.com" && dominiofinal !== "airbnb.com") {
                                        const error = "La url o el dominio no son los esperados. Revisa el formato de la url y el dominio. Solo se acepta el dominio airbnb.com";
                                        throw new Error(error);
                                    }
                                    const errorDeFormado = "En la direccion URL que has introducido no hay un calendario iCal de Airbnb";
                                    try {
                                        const calendarioData = await axios.get(url);
                                        calendarioRaw = calendarioData.data;
                                        const jcalData = ICAL.parse(calendarioRaw); // Intenta analizar el contenido como datos jCal
                                        const jcal = new ICAL.Component(jcalData); // Crea un componente jCal


                                        // Verifica si el componente es un calendario (VCALENDAR)
                                        if (jcal?.name.toLowerCase() !== 'vcalendar') {
                                            throw new Error(errorDeFormado);
                                        }
                                    } catch (errorCapturado) {
                                        throw new Error(errorDeFormado);
                                    }
                                }
                                const actualizarCliente = `
                                    UPDATE "calendariosSincronizados"
                                    SET 
                                    nombre = COALESCE($1, nombre),
                                    url = COALESCE($2, url),
                                    "apartamentoIDV" = COALESCE($3, "apartamentoIDV"),
                                    "dataIcal" = COALESCE($4, "dataIcal")
                                    WHERE uid = $5;
                                    `;
                                const datosParaActualizar = [
                                    nombre,
                                    url,
                                    apartamentoIDV,
                                    calendarioRaw,
                                    calendarioUID
                                ];
                                const resuelveActualizarCliente = await conexion.query(actualizarCliente, datosParaActualizar);
                                if (resuelveActualizarCliente.rowCount === 0) {
                                    const error = "Los datos se han enviado a la base de datos pero el servido de base de datos infomra que no se ha actualizado el calendario vuelve a intentarlo mas tarde. Discule las molestias";
                                    throw new Error(error);
                                }
                                const ok = {
                                    ok: "Se ha actualizado correctamente el calendario"
                                };
                                salida.json(ok);
                            } catch (errorCapturado) {
                                const error = {
                                    error: errorCapturado.message
                                };
                                salida.json(error)
                            }
                        }
                    },
                    eliminarCalendario: {
                        IDX: {
                            ROL: [
                                "administrador"
                            ]
                        },
                        X: async () => {
                            try {
                                const calendarioUID = entrada.body.calendarioUID;
                                const filtroCadenaNumeros = /^[0-9]+$/;
                                if (!calendarioUID || !filtroCadenaNumeros.test(calendarioUID)) {
                                    const error = "Hay que definir la calendarioUID, solo se admiten numeros sin espacios.";
                                    throw new Error(error);
                                }
                                const consultaSelecionaCalendario = `
                                    SELECT 
                                    uid
                                    FROM 
                                    "calendariosSincronizados" 
                                    WHERE 
                                    uid = $1`;
                                const resuelveSelecionarCalendario = await conexion.query(consultaSelecionaCalendario, [calendarioUID]);
                                if (resuelveSelecionarCalendario.rowCount === 0) {
                                    const error = "No existe el calendario que quieres borrar, por favor revisa el identificado calendarioUID que has introducido.";
                                    throw new Error(error);
                                }
                                const consultaEliminar = `
                                    DELETE FROM "calendariosSincronizados"
                                    WHERE uid = $1;
                                    `;
                                const resuelveEliminarCalendario = await conexion.query(consultaEliminar, [calendarioUID]);
                                if (resuelveEliminarCalendario.rowCount === 1) {
                                    const ok = {
                                        ok: "Se ha eliminado correctamente el calendario"
                                    };
                                    salida.json(ok);
                                }
                                if (resuelveEliminarCalendario.rowCount === 0) {
                                    const error = "Se ha enviado la información a la base de datos pero esta informa que no ha eliminado el calendario.";
                                    throw new Error(error);
                                }
                            } catch (errorCapturado) {
                                const error = {
                                    error: errorCapturado.message
                                };
                                salida.json(error)
                            }
                        }
                    },
                    exportarCalendario: {
                        IDX: {
                            ROL: [
                                "administrador"
                            ]
                        },
                        X: async () => {
                            try {
                                const calendarioUID = entrada.body.calendarioUID;
                                const filtroCadenaNumeros = /^[0-9]+$/;
                                if (!calendarioUID || !filtroCadenaNumeros.test(calendarioUID)) {
                                    const error = "Hay que definir la calendarioUID, solo se admiten numeros sin espacios.";
                                    throw new Error(error);
                                }
                                const consultaSelecionaCalendario = `
                                    SELECT 
                                    uid
                                    FROM 
                                    "calendariosSincronizados" 
                                    WHERE 
                                    uid = $1`;
                                const resuelveSelecionarCalendario = await conexion.query(consultaSelecionaCalendario, [calendarioUID]);
                                if (resuelveSelecionarCalendario.rowCount === 0) {
                                    const error = "No existe el calendario que quieres borrar, por favor revisa el identificado calendarioUID que has introducido.";
                                    throw new Error(error);
                                }
                                // Obtener las las reservas
                                // Verificar que el apartmento este en esa reserva
                                // añadirlo a una array
                                // parsearlo en formato ical
                            } catch (errorCapturado) {
                                const error = {
                                    error: errorCapturado.message
                                };
                                salida.json(error)
                            }
                        }
                    }
                }
            },
            limitesReservaPublica: {
                obtenerConfiguracion: {
                    IDX: {
                        ROL: [
                            "administrador",
                            "empleado"
                        ]
                    },
                    X: async () => {
                        try {
                            const consultaConfiguracionGlobal = `
                                SELECT 
                                    valor,
                                    "configuracionUID"
                                FROM 
                                    "configuracionGlobal"
                                WHERE 
                                    "configuracionUID" IN ($1, $2, $3);
                               `;
                            const configuracionUID = [
                                "diasAntelacionReserva",
                                "limiteFuturoReserva",
                                "diasMaximosReserva"
                            ];
                            const resuelveConfiguracionGlobal = await conexion.query(consultaConfiguracionGlobal, configuracionUID);
                            if (resuelveConfiguracionGlobal.rowCount === 0) {
                                const error = "No hay configuraciones globales con estos parametros";
                                throw new Error(error);
                            }
                            const configuraciones = resuelveConfiguracionGlobal.rows;
                            const ok = { ok: {} };
                            for (const parConfiguracion of configuraciones) {
                                const configuracionUID = parConfiguracion.configuracionUID;
                                const valor = parConfiguracion.valor;
                                ok.ok[configuracionUID] = valor;
                            }
                            salida.json(ok);
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                guardarConfiguracion: {
                    IDX: {
                        ROL: [
                            "administrador"
                        ]
                    },
                    X: async () => {
                        try {
                            const diasAntelacionReserva = entrada.body.diasAntelacionReserva;
                            const limiteFuturoReserva = entrada.body.limiteFuturoReserva;
                            const diasMaximosReserva = entrada.body.diasMaximosReserva;
                            const filtroNumero = /^\d+$/;
                            if (!diasAntelacionReserva || !filtroNumero.test(diasAntelacionReserva)) {
                                const error = "El campo diasAntelacionReserva solo acepta numeros";
                                throw new Error(error);
                            }
                            if (!limiteFuturoReserva || !filtroNumero.test(limiteFuturoReserva)) {
                                const error = "El campo limiteFuturoReserva solo acepta numeros";
                                throw new Error(error);
                            }
                            if (!diasMaximosReserva || !filtroNumero.test(diasMaximosReserva)) {
                                const error = "El campo diasMaximosReserva solo acepta numeros";
                                throw new Error(error);
                            }
                            if (Number(diasAntelacionReserva) >= Number(limiteFuturoReserva)) {
                                const error = "Los dias de antelacion no pueden ser iguales o superiores a los dias del limiteFuturoReserva por que entonces no se permiten reservas de mas de 0 dias";
                                throw new Error(error);
                            }
                            if (0 === Number(limiteFuturoReserva)) {
                                const error = "El limite futuro no puede ser de 0, por que entonces no se permite reservas de mas de 0 dias.";
                                throw new Error(error);
                            }
                            if (0 === Number(diasMaximosReserva)) {
                                const error = "No puedes determinar que el numero maximo de días de las reservas públicas sea de 0.";
                                throw new Error(error);
                            }
                            const maximoDiasDuracionReserva = Number(limiteFuturoReserva) - Number(diasAntelacionReserva);
                            if (Number(diasMaximosReserva) > Number(maximoDiasDuracionReserva)) {
                                const error = `En base la configuracíon que solicitas, es decir en base a los dias minimos de antelación establecidos y el limite futuro de dias, las reservas tendrian un maximo de ${maximoDiasDuracionReserva} días de duracíon, por lo tanto no puedes establecer mas días de duracíon que eso. Es decir o escoges poner menos dias de duración maximo para una reserva o ampliar los limites anteriores.`;
                                throw new Error(error);
                            }
                            await conexion.query('BEGIN'); // Inicio de la transacción
                            const configuracionUID_diasAntelacionReserva = "diasAntelacionReserva";
                            const configuracionUID_limiteFuturoReserva = "limiteFuturoReserva";
                            const configuracionUID_diasMaximosReserva = "diasMaximosReserva";
                            const actualizarConfiguracionGlobal = `
                                UPDATE "configuracionGlobal"
                                SET
                                    valor = CASE
                                        WHEN "configuracionUID" = $2 THEN $1
                                        WHEN "configuracionUID" = $4 THEN $3
                                        WHEN "configuracionUID" = $6 THEN $5
                                        ELSE valor
                                    END
                                WHERE
                                    "configuracionUID" IN ($2, $4, $6);
                                `;
                            const nuevaConfiguracion = [
                                diasAntelacionReserva,
                                configuracionUID_diasAntelacionReserva,
                                limiteFuturoReserva,
                                configuracionUID_limiteFuturoReserva,
                                diasMaximosReserva,
                                configuracionUID_diasMaximosReserva
                            ];
                            const consultaValidarApartamento = await conexion.query(actualizarConfiguracionGlobal, nuevaConfiguracion);
                            if (consultaValidarApartamento.rowCount === 0) {
                                const error = "No se ha podido actualizar la configuracion, reintentalo";
                                throw new Error(error);
                            }
                            await conexion.query('COMMIT'); // Confirmar la transacción
                            const ok = {
                                ok: "Se ha actualizado correctamente la configuracion"
                            };
                            salida.json(ok);
                        } catch (errorCapturado) {
                            await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                }
            },
            interruptores: {
                obtenerInterruptores: {
                    IDX: {
                        ROL: [
                            "administrador",
                            "empleado"
                        ]
                    },
                    X: async () => {
                        try {
                            const consultaConfiguracionGlobal = `
                                SELECT 
                                    estado,
                                    "interruptorIDV"
                                FROM 
                                    "interruptoresGlobales";
                               `;
                            const resuelveConfiguracionGlobal = await conexion.query(consultaConfiguracionGlobal);
                            if (resuelveConfiguracionGlobal.rowCount === 0) {
                                const error = "No hay configuraciones globales con estos parametros";
                                throw new Error(error);
                            }
                            const configuraciones = resuelveConfiguracionGlobal.rows;
                            const ok = { ok: {} };
                            for (const parConfiguracion of configuraciones) {
                                const interruptorIDV = parConfiguracion.interruptorIDV;
                                const estado = parConfiguracion.estado || "";
                                ok.ok[interruptorIDV] = estado;
                            }
                            salida.json(ok);
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                actualizarEstado: {
                    IDX: {
                        ROL: [
                            "administrador"
                        ]
                    },
                    X: async () => {
                        try {
                            const interruptorIDV = entrada.body.interruptorIDV;
                            const estado = entrada.body.estado;
                            const filtroIDV = /^[a-zA-Z0-9]+$/;
                            if (!interruptorIDV || !filtroIDV.test(interruptorIDV)) {
                                const error = "El interruptorIDV solo puede ser una cadena que acepta numeros, minusculas y mayusculas";
                                throw new Error(error);
                            }
                            if (!estado ||
                                !filtroIDV.test(estado) ||
                                (estado !== "activado" && estado !== "desactivado")) {
                                const error = "El estado solo puede ser activado o desactivado";
                                throw new Error(error);
                            }
                            const validarInterruptorIDV = `
                                SELECT 
                                    "interruptorIDV"
                                FROM 
                                    "interruptoresGlobales"
                                WHERE 
                                    "interruptorIDV" = $1;
                               `;
                            const resuelveConfiguracionGlobal = await conexion.query(validarInterruptorIDV, [interruptorIDV]);
                            if (resuelveConfiguracionGlobal.rowCount === 0) {
                                const error = "No existe ningun interruptor con ese indentificador visual";
                                throw new Error(error);
                            }
                            await conexion.query('BEGIN'); // Inicio de la transacción
                            const actualizarInterruptor = `
                                UPDATE 
                                    "interruptoresGlobales"
                                SET
                                    estado = $1
                                WHERE
                                    "interruptorIDV" = $2
                                    RETURNING *;`;
                            const nuevoEstado = [
                                estado,
                                interruptorIDV
                            ];
                            const resuelveEstado = await conexion.query(actualizarInterruptor, nuevoEstado);
                            if (resuelveEstado.rowCount === 0) {
                                const error = "No se ha podido actualizar el estado del interruptor";
                                throw new Error(error);
                            }
                            const estadoNuevo = resuelveEstado.rows[0].estado;
                            await conexion.query('COMMIT'); // Confirmar la transacción
                            const ok = {
                                ok: "Se ha actualizado correctamente el interruptor",
                                interrutorIDV: interruptorIDV,
                                estado: estadoNuevo
                            };
                            salida.json(ok);
                        } catch (errorCapturado) {
                            await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                }
            },
            mensajesEnPortada: {
                obtenerMensajes: {
                    IDX: {
                        ROL: [
                            "administrador",
                            "empleado"
                        ]
                    },
                    X: async () => {
                        try {
                            const consulta = `
                                SELECT 
                                    uid,
                                    mensaje,
                                    estado,
                                    posicion
                                FROM 
                                    "mensajesEnPortada";
                               `;
                            const resuelveMensajes = await conexion.query(consulta);
                            const mensajes = resuelveMensajes.rows;
                            for (const detallesDelMensaje of mensajes) {
                                const bufferObjPreDecode = Buffer.from(detallesDelMensaje.mensaje, "base64");
                                detallesDelMensaje.mensaje = bufferObjPreDecode.toString("utf8");
                            }
                            const ok = {
                                ok: mensajes,
                                numeroMensajes: resuelveMensajes.rowCount
                            };
                            salida.json(ok);
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                detallesDelMensaje: {
                    IDX: {
                        ROL: [
                            "administrador",
                            "empleado"
                        ]
                    },
                    X: async () => {
                        try {
                            const mensajeUID = entrada.body.mensajeUID;
                            const filtroIDV = /^[0-9]+$/;
                            if (!mensajeUID || !filtroIDV.test(mensajeUID)) {
                                const error = "El mensajeUID solo puede ser una cadena que acepta numeros";
                                throw new Error(error);
                            }
                            const consulta = `
                                SELECT 
                                    uid,
                                    mensaje,
                                    estado,
                                    posicion
                                FROM 
                                    "mensajesEnPortada"
                                WHERE
                                    uid = $1;
                               `;
                            const resuelveMensajes = await conexion.query(consulta, [mensajeUID]);
                            const detallesDelMensaje = resuelveMensajes.rows[0];


                            const bufferObjPreDecode = Buffer.from(detallesDelMensaje.mensaje, "base64");
                            detallesDelMensaje.mensaje = bufferObjPreDecode.toString("utf8");
                            const ok = {
                                ok: detallesDelMensaje
                            };
                            salida.json(ok);
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                actualizarMensaje: {
                    IDX: {
                        ROL: [
                            "administrador"
                        ]
                    },
                    X: async () => {
                        try {
                            const mensajeUID = entrada.body.mensajeUID;
                            const mensaje = entrada.body.mensaje;
                            const filtroIDV = /^[0-9]+$/;
                            if (!mensajeUID || !filtroIDV.test(mensajeUID)) {
                                const error = "El mensajeUID solo puede ser una cadena que acepta numeros";
                                throw new Error(error);
                            }
                            const bufferObj = Buffer.from(mensaje, "utf8");
                            const mensajeB64 = bufferObj.toString("base64");
                            const validarUID = `
                                SELECT 
                                    "estado"
                                FROM 
                                    "mensajesEnPortada"
                                WHERE 
                                    uid = $1;
                               `;
                            const resuelveValidacion = await conexion.query(validarUID, [mensajeUID]);
                            if (resuelveValidacion.rowCount === 0) {
                                const error = "No existe ningun mensaje con ese UID";
                                throw new Error(error);
                            }
                            const estadoActual = resuelveValidacion.rows[0].estado;
                            if (estadoActual !== "desactivado") {
                                const error = "No se puede modificar un mensaje activo, primero desactiva el mensaje";
                                throw new Error(error);
                            }
                            await conexion.query('BEGIN'); // Inicio de la transacción


                            const actualizarMensaje = `
                                UPDATE 
                                    "mensajesEnPortada"
                                SET
                                    mensaje = $1
                                WHERE
                                    uid = $2;`;
                            const datosDelMensaje = [
                                mensajeB64,
                                mensajeUID
                            ];
                            const resuelveActualizacion = await conexion.query(actualizarMensaje, datosDelMensaje);
                            if (resuelveActualizacion.rowCount === 0) {
                                const error = "No se ha podido actualizar el mensaje por que no se ha encontrado";
                                throw new Error(error);
                            }
                            await conexion.query('COMMIT'); // Confirmar la transacción
                            const ok = {
                                ok: "Se ha actualizado correctamente el interruptor",
                                mensajeUID: mensajeUID
                            };
                            salida.json(ok);
                        } catch (errorCapturado) {
                            await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                actualizarEstado: {
                    IDX: {
                        ROL: [
                            "administrador"
                        ]
                    },
                    X: async () => {
                        try {
                            const mensajeUID = entrada.body.mensajeUID;
                            const estado = entrada.body.estado;
                            const filtroIDV = /^[0-9]+$/;
                            if (!mensajeUID || !filtroIDV.test(mensajeUID)) {
                                const error = "El mensajeUID solo puede ser una cadena que acepta numeros";
                                throw new Error(error);
                            }
                            if (estado !== "activado" && estado !== "desactivado") {
                                const error = "El estado solo puede ser activado o desactivado";
                                throw new Error(error);
                            }
                            const validarUID = `
                                SELECT 
                                    "estado"
                                FROM 
                                    "mensajesEnPortada"
                                WHERE 
                                    uid = $1;
                               `;
                            const resuelveValidacion = await conexion.query(validarUID, [mensajeUID]);
                            if (resuelveValidacion.rowCount === 0) {
                                const error = "No existe ningun mensaje con ese UID";
                                throw new Error(error);
                            }

                            await conexion.query('BEGIN'); // Inicio de la transacción


                            const actualizarMensaje = `
                                UPDATE 
                                    "mensajesEnPortada"
                                SET
                                    estado = $1
                                WHERE
                                    uid = $2;`;
                            const resuelveActualizacion = await conexion.query(actualizarMensaje, [estado, mensajeUID]);
                            if (resuelveActualizacion.rowCount === 0) {
                                const error = "No se ha podido actualizar el mensaje por que no se ha encontrado";
                                throw new Error(error);
                            }
                            await conexion.query('COMMIT'); // Confirmar la transacción
                            const ok = {
                                ok: "Se ha actualizado el estado correctamente",
                                mensajeUID: mensajeUID,
                                estado: estado
                            };
                            salida.json(ok);
                        } catch (errorCapturado) {
                            await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                moverPosicion: {
                    IDX: {
                        ROL: [
                            "administrador"
                        ]
                    },
                    X: async () => {
                        try {
                            const mensajeUID = entrada.body.mensajeUID;
                            const nuevaPosicion = entrada.body.nuevaPosicion;
                            const filtroIDV = /^[0-9]+$/;
                            if (!mensajeUID || !filtroIDV.test(mensajeUID)) {
                                const error = "El mensajeUID solo puede ser una cadena que acepta numeros, enteros y positivos";
                                throw new Error(error);
                            }
                            if (!nuevaPosicion || !filtroIDV.test(nuevaPosicion)) {
                                const error = "El nuevaPosicion solo puede ser una cadena que acepta numeros, enteros y positivos";
                                throw new Error(error);
                            }
                            const validarUID = `
                                SELECT 
                                    posicion,
                                    mensaje,
                                    estado
                                FROM 
                                    "mensajesEnPortada"
                                WHERE 
                                    uid = $1;
                               `;
                            const resuelveValidacion = await conexion.query(validarUID, [mensajeUID]);
                            if (resuelveValidacion.rowCount === 0) {
                                const error = "No existe ningun mensaje con ese UID";
                                throw new Error(error);
                            }


                            const posicionAntigua = resuelveValidacion.rows[0].posicion;
                            if (Number(posicionAntigua) === Number(nuevaPosicion)) {
                                const error = "El mensaje ya esta en esa posicion";
                                throw new Error(error);
                            }
                            const mensajeSeleccionado = {};
                            const detallesMensajeSeleccionado = resuelveValidacion.rows[0];
                            const mensajeSeleccionado_texto = detallesMensajeSeleccionado.mensaje;
                            const bufferObjPreDecode = Buffer.from(mensajeSeleccionado_texto, "base64");

                            mensajeSeleccionado.uid = mensajeUID;
                            mensajeSeleccionado.mensaje = bufferObjPreDecode.toString("utf8");
                            mensajeSeleccionado.estado = detallesMensajeSeleccionado.estado;
                            const validarMensajeAfectado = `
                                SELECT 
                                    uid,
                                    mensaje,
                                    estado, 
                                    posicion
                                FROM 
                                    "mensajesEnPortada"
                                WHERE 
                                    posicion = $1;
                               `;
                            const resuelveMensajeAfectado = await conexion.query(validarMensajeAfectado, [nuevaPosicion]);
                            const detallesMensajeAfectado = resuelveMensajeAfectado.rows[0];


                            const mensajeUIDAfectado = detallesMensajeAfectado.uid;
                            const mensajeUIDAfectado_mensaje = detallesMensajeAfectado.mensaje;

                            const buffer_mensajeAfectado = Buffer.from(mensajeUIDAfectado_mensaje, "base64");

                            const mensajeAfectado = {
                                uid: String(mensajeUIDAfectado),
                                mensaje: buffer_mensajeAfectado.toString("utf8"),
                                estado: detallesMensajeAfectado.estado
                            };
                            await conexion.query('BEGIN'); // Inicio de la transacción
                            if (resuelveMensajeAfectado.rowCount === 1) {
                                // Posicion de transccion
                                const ajustarPosicionTransitivaElementoAfectado = `
                                      UPDATE 
                                          "mensajesEnPortada"
                                      SET 
                                          posicion = $2
                                      WHERE 
                                          uid = $1
                                      RETURNING
                                        mensaje,
                                        estado
                                         `;
                                const resuelveMensajeSeleccionado = await conexion.query(ajustarPosicionTransitivaElementoAfectado, [mensajeUIDAfectado, 0]);


                            }

                            const actualizarMensajeActual = `
                                UPDATE 
                                    "mensajesEnPortada"
                                SET
                                    posicion = $1
                                WHERE
                                    uid = $2;`;

                            await conexion.query(actualizarMensajeActual, [nuevaPosicion, mensajeUID]);

                            if (resuelveMensajeAfectado.rowCount === 1) {
                                // Posicion de final a elementoAfectado
                                const ajustarPosicionFinalElementoAfectado = `
                                     UPDATE 
                                         "mensajesEnPortada"
                                     SET 
                                         posicion = $2
                                     WHERE 
                                         uid = $1;
                                      `;
                                await conexion.query(ajustarPosicionFinalElementoAfectado, [mensajeUIDAfectado, posicionAntigua]);
                            }


                            await conexion.query('COMMIT'); // Confirmar la transacción
                            const ok = {
                                ok: "Se ha actualizado correctamente la posicion",
                                mensajeSeleccionado: mensajeSeleccionado,
                                mensajeAfectado: mensajeAfectado
                            };
                            salida.json(ok);
                        } catch (errorCapturado) {
                            await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                cambiarPosicon: {
                    IDX: {
                        ROL: [
                            "administrador"
                        ]
                    },
                    X: async () => {
                        try {
                            const mensajeUID = entrada.body.mensajeUID;
                            const posicion = entrada.body.posicion;
                            const filtroIDV = /^[0-9]+$/;
                            if (!mensajeUID || !filtroIDV.test(mensajeUID)) {
                                const error = "El mensajeUID solo puede ser una cadena que acepta numeros";
                                throw new Error(error);
                            }
                            if (!posicion || !filtroIDV.test(posicion) || posicion) {
                                const error = "La posicion solo puede ser una cadena que acepta numeros enteros y positivos";
                                throw new Error(error);
                            }
                            const mensajeB64 = btoa(mensaje);

                            const validarUID = `
                                SELECT 
                                    "estado"
                                FROM 
                                    "mensajeEnPortada"
                                WHERE 
                                    "mensajeUID" = $1;
                               `;
                            const resuelveValidacion = await conexion.query(validarUID, [mensajeUID]);
                            if (resuelveValidacion.rowCount === 0) {
                                const error = "No existe ningun mensaje con ese UID";
                                throw new Error(error);
                            }
                            await conexion.query('BEGIN'); // Inicio de la transacción
                            const actualizarMensaje = `
                                UPDATE 
                                    "mensajeEnPortada"
                                SET
                                    mensaje = $1
                                WHERE
                                    "mensajeUID" = $2
                                    RETURNING *;`;
                            const datosDelMensaje = [
                                mensajeB64,
                                mensajeUID
                            ];
                            const resuelveActualizacion = await conexion.query(actualizarMensaje, datosDelMensaje);
                            if (resuelveActualizacion.rowCount === 0) {
                                const error = "No se ha podido actualizar el mensaje por que no se ha encontrado";
                                throw new Error(error);
                            }
                            const mensajeGuardado = resuelveEstado.rows[0].mensaje;
                            await conexion.query('COMMIT'); // Confirmar la transacción
                            const ok = {
                                ok: "Se ha actualizado correctamente la posicion del mensaje",
                                mensajeUID: mensajeUID,
                                mensaje: atob(mensajeGuardado)
                            };
                            salida.json(ok);
                        } catch (errorCapturado) {
                            await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                crearMensaje: {
                    IDX: {
                        ROL: [
                            "administrador"
                        ]
                    },
                    X: async () => {
                        try {
                            const mensaje = entrada.body.mensaje;
                            if (!mensaje || typeof mensaje !== "string" || mensaje.length === 0) {
                                const error = "Por favor escriba un mensaje para guardar, este debe de ser una cadena de texto.";
                                throw new Error(error);
                            }

                            const bufferObj = Buffer.from(mensaje, "utf8");
                            const mensajeB64 = bufferObj.toString("base64");


                            await conexion.query('BEGIN'); // Inicio de la transacción
                            const consultaPosicionInicial = `
                                SELECT 
                                    *
                                FROM 
                                    "mensajesEnPortada";
                               `;
                            const resuelvePosicionInicial = await conexion.query(consultaPosicionInicial);
                            const posicionInicial = resuelvePosicionInicial.rowCount + 1;

                            const estadoInicial = "desactivado";
                            const crearMensaje = `
                                INSERT INTO "mensajesEnPortada"
                                (
                                mensaje,
                                estado,
                                posicion
                                )
                                VALUES 
                                ($1, $2, $3)
                                RETURNING
                                uid
                                `;


                            const resuelveCreacion = await conexion.query(crearMensaje, [mensajeB64, estadoInicial, posicionInicial]);


                            if (resuelveCreacion.rowCount === 0) {
                                const error = "No se ha podido insertar el mensaje";
                                throw new Error(error);
                            }
                            const ok = {
                                ok: "Se ha creado el nuevo mensaje",
                                mensajeUID: resuelveCreacion.rows[0].mensajeUID,
                            };
                            salida.json(ok);
                            await conexion.query('COMMIT');
                        } catch (errorCapturado) {
                            await conexion.query('ROLLBACK');
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                eliminarMensaje: {
                    IDX: {
                        ROL: [
                            "administrador"
                        ]
                    },
                    X: async () => {
                        try {
                            const mensajeUID = entrada.body.mensajeUID;
                            const filtroNumeros = /^[0-9]+$/;
                            if (!mensajeUID || !filtroNumeros.test(mensajeUID)) {
                                const error = "El campo mensajeUID solo admite una cadena de numeros";
                                throw new Error(error);
                            }
                            await conexion.query('BEGIN'); // Inicio de la transacción


                            // Validar si es un usuario administrador
                            const validaMensaje = `
                                SELECT 
                                posicion
                                FROM "mensajesEnPortada"
                                WHERE uid = $1;
                                `;
                            const resuelveValidacion = await conexion.query(validaMensaje, [mensajeUID]);

                            if (resuelveValidacion.rowCount === 0) {
                                const error = "No se encuentra ningun mensaje con ese UID";
                                throw new Error(error);
                            }
                            const posicion = resuelveValidacion.rows[0].posicion;
                            const consultaEliminacion = `
                                DELETE FROM "mensajesEnPortada"
                                WHERE uid = $1;
                                `;
                            const resuelveEliminacion = await conexion.query(consultaEliminacion, [mensajeUID]);
                            // Ahora, puedes agregar la lógica para actualizar las filas restantes si es necesario
                            const consultaActualizacion = `
                                    UPDATE "mensajesEnPortada"
                                    SET posicion = posicion - 1
                                    WHERE posicion > $1; 
                                `;
                            await conexion.query(consultaActualizacion, [posicion]);

                            await conexion.query('COMMIT');
                            if (resuelveEliminacion.rowCount === 1) {
                                const ok = {
                                    ok: "Se ha eliminado correctamente el mensaje de portada",
                                    mensajeUID: mensajeUID
                                };
                                salida.json(ok);
                            }
                        } catch (errorCapturado) {
                            await conexion.query('ROLLBACK');
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        } finally {
                        }
                    },
                }
            },
        },
        clientes: {
            IDX: {
                ROL: [
                    "administrador",
                    "empleado"
                ]
            },
            buscar: async () => {
                try {
                    let buscar = entrada.body.buscar;
                    let tipoBusqueda = entrada.body.tipoBusqueda;
                    let nombreColumna = entrada.body.nombreColumna;
                    let sentidoColumna = entrada.body.sentidoColumna;
                    if (tipoBusqueda !== "rapido") {
                        tipoBusqueda = null;
                    }
                    if (!buscar || typeof buscar !== "string") {
                        let error = "se tiene que espeficiar 'buscar' y lo que se desea buscar";
                        throw new Error(error);
                    }
                    let Pagina = entrada.body["pagina"];
                    Pagina = Pagina ? Pagina : 1;
                    if (typeof Pagina !== "number" || !Number.isInteger(Pagina) || Pagina <= 0) {
                        const error = "En 'pagina' solo se aceptan numero enteros superiores a cero y positivos. Nada de decimales";
                        throw new Error(error);
                    }
                    let condicionComplejaSQLOrdenarResultadosComoSegundaCondicion = "";
                    let nombreColumnaSentidoUI;
                    let nombreColumnaUI;
                    if (nombreColumna) {
                        const filtronombreColumna = /^[a-zA-Z]+$/;
                        if (!filtronombreColumna.test(nombreColumna)) {
                            const error = "el campo 'ordenClolumna' solo puede ser letras minúsculas y mayúsculas.";
                            throw new Error(error);
                        }
                        const consultaExistenciaNombreColumna = `
                            SELECT column_name
                            FROM information_schema.columns
                            WHERE table_name = 'clientes' AND column_name = $1;
                            `;
                        const resuelveNombreColumna = await conexion.query(consultaExistenciaNombreColumna, [nombreColumna]);
                        if (resuelveNombreColumna.rowCount === 0) {
                            const error = "No existe el nombre de la columna en la tabla clientes";
                            throw new Error(error);
                        }
                        // OJO con la coma, OJO LA COMA ES IMPORTANTISMA!!!!!!!!
                        //!!!!!!!
                        if (sentidoColumna !== "descendente" && sentidoColumna !== "ascendente") {
                            sentidoColumna = "ascendente";
                        }
                        if (sentidoColumna == "ascendente") {
                            sentidoColumna = "ASC";
                            nombreColumnaSentidoUI = "ascendente";
                        }
                        if (sentidoColumna == "descendente") {
                            sentidoColumna = "DESC";
                            nombreColumnaSentidoUI = "descendente";
                        }
                        // nombreColumnaUI = nombreColumna.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
                        condicionComplejaSQLOrdenarResultadosComoSegundaCondicion = `,"${nombreColumna}" ${sentidoColumna}`;
                    }
                    const terminoBuscar = buscar.split(" ");
                    let terminosFormateados = [];
                    terminoBuscar.map((termino) => {
                        const terminoFinal = "%" + termino + "%";
                        terminosFormateados.push(terminoFinal);
                    });
                    const numeroPorPagina = 10;
                    const numeroPagina = Number((Pagina - 1) + "0");
                    const consultaConstructor = `    
                            SELECT *,
                            COUNT(*) OVER() as "totalClientes"
                        FROM clientes
                        WHERE  
                            (
                            LOWER(COALESCE(nombre, '')) ILIKE ANY($1) OR
                            LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1) OR
                            LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1) OR
                            LOWER(COALESCE("email", '')) ILIKE ANY($1) OR
                            LOWER(COALESCE("telefono", '')) ILIKE ANY($1) OR
                            LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1)
                            )
                        ORDER BY
                            (
                              CASE
                                WHEN (
                                  (LOWER(COALESCE(nombre, '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("email", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("telefono", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int
                                ) = 1 THEN 1
                                WHEN (
                                  (LOWER(COALESCE(nombre, '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("email", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("telefono", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int
                                ) = 3 THEN 3
                                ELSE 2
                              END
                            ) 
                            ${condicionComplejaSQLOrdenarResultadosComoSegundaCondicion}
                        LIMIT $2 OFFSET $3;`;
                    let consultaReservas = await conexion.query(consultaConstructor, [terminosFormateados, numeroPorPagina, numeroPagina]);
                    consultaReservas = consultaReservas.rows;
                    let consultaConteoTotalFilas = consultaReservas[0]?.totalClientes ? consultaReservas[0].totalClientes : 0;
                    if (tipoBusqueda === "rapido") {
                        consultaReservas.map((cliente) => {
                            delete cliente.Telefono;
                            delete cliente.email;
                            delete cliente.notas;
                        });
                    }
                    consultaReservas.map((cliente) => {
                        delete cliente.totalClientes;
                    });
                    const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
                    const corretorNumeroPagina = String(numeroPagina).replace("0", "");
                    const Respuesta = {
                        buscar: buscar,
                        totalClientes: consultaConteoTotalFilas,
                        paginasTotales: totalPaginas,
                        pagina: Number(corretorNumeroPagina) + 1,
                    };
                    if (nombreColumna) {
                        Respuesta["nombreColumna"] = nombreColumna;
                        Respuesta["sentidoColumna"] = nombreColumnaSentidoUI;
                    }
                    Respuesta["clientes"] = consultaReservas;
                    salida.json(Respuesta);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    return salida.json(error)
                } finally {
                }
            },
            crearCliente: async () => {
                const mutex = new Mutex();
                const bloqueoCrearCliente = await mutex.acquire();
                try {
                    let nombre = entrada.body.nombre;
                    let primerApellido = entrada.body.primerApellido;
                    let segundoApellido = entrada.body.segundoApellido;
                    let pasaporte = entrada.body.pasaporte;
                    let telefono = entrada.body.telefono;
                    let correoElectronico = entrada.body.correo;
                    let notas = entrada.body.notas;
                    const nuevoCliente = {
                        nombre: nombre,
                        primerApellido: primerApellido,
                        segundoApellido: segundoApellido,
                        pasaporte: pasaporte,
                        telefono: telefono,
                        correoElectronico: correoElectronico,
                        notas: notas,
                    };
                    const datosValidados = await validadoresCompartidos.clientes.nuevoCliente(nuevoCliente);
                    const nuevoUIDCliente = await insertarCliente(datosValidados);
                    if (nuevoUIDCliente) {
                        const ok = {
                            ok: "Se ha anadido correctamente el cliente",
                            nuevoUIDCliente: nuevoUIDCliente.uid
                        };
                        salida.json(ok);
                    } else {
                        const error = "Ha ocurrido un error interno y no se ha podido obtener el nuevo UID de cliente";
                        throw new Error(error);
                    }
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                    bloqueoCrearCliente();
                }
            },
            detallesCliente: async () => {
                try {
                    let cliente = entrada.body.cliente;
                    if (!cliente || !Number.isInteger(cliente)) {
                        const error = "El campo cliente solo puede ser un numero positivo y entero que haga referencia al UID del cliente";
                        throw new Error(error);
                    }
                    let consultaDetallesCliente = `
                        SELECT 
                        uid, 
                        nombre,
                        "primerApellido",
                        "segundoApellido",
                        pasaporte,
                        telefono,
                        email,
                        notas 
                        FROM 
                        clientes 
                        WHERE 
                        uid = $1`;
                    let resolverConsultaDetallesCliente = await conexion.query(consultaDetallesCliente, [cliente]);
                    if (resolverConsultaDetallesCliente.rowCount === 0) {
                        const error = "No existe ningun clinete con ese UID";
                        throw new Error(error);
                    }
                    let detallesCliente = resolverConsultaDetallesCliente.rows[0];
                    let ok = {
                        "ok": detallesCliente
                    };
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            modificarCliente: async () => {
                const mutex = new Mutex();
                const bloqueoModificarClinete = await mutex.acquire();
                try {
                    let cliente = entrada.body.cliente;
                    let nombre = entrada.body.nombre;
                    let primerApellido = entrada.body.primerApellido;
                    let segundoApellido = entrada.body.segundoApellido;
                    let pasaporte = entrada.body.pasaporte;
                    let telefono = entrada.body.telefono;
                    let correoElectronico = entrada.body.email;
                    let notas = entrada.body.notas;
                    if (!cliente || !Number.isInteger(cliente)) {
                        const error = "El campo cliente solo puede ser un numero positivo y entero que haga referencia al UID del cliente";
                        throw new Error(error);
                    }
                    const clienteParaValidar = {
                        nombre: nombre,
                        primerApellido: primerApellido,
                        segundoApellido: segundoApellido,
                        pasaporte: pasaporte,
                        telefono: telefono,
                        correoElectronico: correoElectronico,
                        notas: notas,
                    };
                    const datosValidados = await validadoresCompartidos.clientes.actualizarCliente(clienteParaValidar);
                    nombre = datosValidados.nombre;
                    primerApellido = datosValidados.primerApellido;
                    segundoApellido = datosValidados.segundoApellido;
                    pasaporte = datosValidados.pasaporte;
                    telefono = datosValidados.telefono;
                    correoElectronico = datosValidados.correoElectronico;
                    notas = datosValidados.notas;
                    const validarCliente = `
                        SELECT
                        uid
                        FROM 
                        clientes
                        WHERE
                        uid = $1`;
                    const resuelveValidarCliente = await conexion.query(validarCliente, [cliente]);
                    if (resuelveValidarCliente.rowCount === 0) {
                        const error = "No existe el cliente";
                        throw new Error(error);
                    }
                    const actualizarCliente = `
                        UPDATE clientes
                        SET 
                        nombre = COALESCE($1, nombre),
                        "primerApellido" = COALESCE($2, "primerApellido"),
                        "segundoApellido" = COALESCE($3, "segundoApellido"),
                        pasaporte = COALESCE($4, pasaporte),
                        telefono = COALESCE($5, telefono),
                        email = COALESCE($6, email),
                        notas = COALESCE($7, notas)
                        WHERE uid = $8
                        RETURNING
                        nombre,
                        "primerApellido",
                        "segundoApellido",
                        pasaporte,
                        telefono,
                        email,
                        notas;
                        `;
                    const resuelveActualizarCliente = await conexion.query(actualizarCliente, [nombre, primerApellido, segundoApellido, pasaporte, telefono, correoElectronico, notas, cliente]);
                    if (resuelveActualizarCliente.rowCount === 0) {
                        const error = "No se ha actualizado el cliente por que la base de datos no ha entontrado al cliente";
                        throw new Error(error);
                    }
                    const ok = {
                        ok: "Se ha anadido correctamente el cliente",
                        detallesCliente: resuelveActualizarCliente.rows
                    };
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                    bloqueoModificarClinete();
                }
            },
            reservasDelCliente: async () => {
                try {
                    const cliente = entrada.body.cliente;
                    let nombreColumna = entrada.body.nombreColumna;
                    let sentidoColumna = entrada.body.sentidoColumna;
                    if (!cliente || !Number.isInteger(cliente) || cliente <= 0) {
                        const error = "El campo cliente solo puede ser un numero positivo y entero que haga referencia al UID del cliente";
                        throw new Error(error);
                    }
                    const pagina = entrada.body.pagina;
                    if (typeof pagina !== "number" || !Number.isInteger(pagina) || pagina <= 0) {
                        const error = "En 'pagina' solo se aceptan numero enteros superiores a cero y positivos. Nada de decimales";
                        throw new Error(error);
                    }
                    const validadores = {
                        nombreColumna: async (nombreColumna) => {
                            const filtronombreColumna = /^[a-zA-Z]+$/;
                            if (!filtronombreColumna.test(nombreColumna)) {
                                const error = "el campo 'nombreColumna' solo puede ser letras minúsculas y mayúsculas.";
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
                                    'como'
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
                    const comoTitularPreProcesado = [];
                    const comoPernoctantePreProcesado = [];
                    const consultaComoTitular = `
                        SELECT 
                        "reservaUID"
                        FROM 
                        "reservaTitulares" 
                        WHERE 
                        "titularUID" = $1`;
                    const resuelveConsultaComoTitular = await conexion.query(consultaComoTitular, [cliente]);
                    if (resuelveConsultaComoTitular.rowCount > 0) {
                        const uidsComoTitular = resuelveConsultaComoTitular.rows;
                        uidsComoTitular.map((detallesReserva) => {
                            const uid = detallesReserva.reservaUID;
                            comoTitularPreProcesado.push(uid);
                        });
                    }
                    const consultaComoPernoctante = `
                        SELECT 
                        reserva
                        FROM 
                        "reservaPernoctantes" 
                        WHERE 
                        "clienteUID" = $1`;
                    const resuelveConsultaComoPernoctante = await conexion.query(consultaComoPernoctante, [cliente]);
                    if (resuelveConsultaComoPernoctante.rowCount > 0) {
                        const uidsComoPernoctante = resuelveConsultaComoPernoctante.rows;
                        uidsComoPernoctante.map((detallesReserva) => {
                            const reserva = detallesReserva.reserva;
                            comoPernoctantePreProcesado.push(reserva);
                        });
                    }
                    const encontrarRepetidosEliminar = (comoTitular, comoPernoctante) => {
                        // Crear conjuntos a partir de los arrays
                        const set1 = new Set(comoTitular);
                        const set2 = new Set(comoPernoctante);
                        // Encontrar la intersección (elementos comunes) entre los conjuntos
                        const comoAmbos = [...set1].filter((elemento) => set2.has(elemento));
                        // Eliminar los elementos repetidos de los arrays originales
                        comoTitular = comoTitular.filter((elemento) => !comoAmbos.includes(elemento));
                        comoPernoctante = comoPernoctante.filter((elemento) => !comoAmbos.includes(elemento));
                        // Concatenar los arrays originales y los elementos repetidos
                        const estructuraFinal = {
                            comoTitular: comoTitular,
                            comoPernoctante: comoPernoctante,
                            comoAmbos: comoAmbos,
                        };
                        return estructuraFinal;
                    };
                    const reservasEstructuradas = encontrarRepetidosEliminar(comoTitularPreProcesado, comoPernoctantePreProcesado);
                    const UIDSreservasComoTitular = reservasEstructuradas.comoTitular;
                    const UIDSreservasComoPernoctante = reservasEstructuradas.comoPernoctante;
                    const UIDSreservasComoAmbos = reservasEstructuradas.comoAmbos;
                    const numeroPaginaSQL = Number((pagina - 1) + "0");
                    const reservasClasificadas = [];
                    const numeroPorPagina = 10;
                    const consultaFusionada = `
                        WITH resultados AS (
                            SELECT 
                                'Titular' AS como,
                                reserva::text,
                                to_char(entrada, 'DD/MM/YYYY') as entrada, 
                                to_char(salida, 'DD/MM/YYYY') as salida
                            FROM 
                                reservas 
                            WHERE 
                                reserva = ANY($1)
                        
                            UNION ALL
                        
                            SELECT 
                                'Pernoctante' AS como,
                                reserva::text,
                                to_char(entrada, 'DD/MM/YYYY') as entrada, 
                                to_char(salida, 'DD/MM/YYYY') as salida
                            FROM 
                                reservas 
                            WHERE 
                                reserva = ANY($2)
                        
                            UNION ALL
                        
                            SELECT 
                                'Ambos' AS como,
                                reserva::text,
                                to_char(entrada, 'DD/MM/YYYY') as entrada, 
                                to_char(salida, 'DD/MM/YYYY') as salida
                            FROM 
                                reservas 
                            WHERE 
                                reserva = ANY($3)                   
                        )
                        SELECT 
                            como,
                            reserva,
                            entrada,
                            salida,
                            COUNT(*) OVER ()::text as total_filas
                            -- ROW_NUMBER() OVER (PARTITION BY reserva ORDER BY reserva) as fila_duplicada
                        FROM resultados
                        ${ordenColumnaSQL}
                        LIMIT $4 OFFSET $5;
                        
                        `;
                    const parametrosConsulta = [
                        UIDSreservasComoTitular,
                        UIDSreservasComoPernoctante,
                        UIDSreservasComoAmbos,
                        numeroPorPagina,
                        numeroPaginaSQL
                    ];
                    const resuelveConsulta = await conexion.query(consultaFusionada, parametrosConsulta);
                    if (resuelveConsulta.rowCount > 0) {
                        reservasClasificadas.push(...resuelveConsulta.rows);
                    }
                    const consultaConteoTotalFilas = resuelveConsulta.rows[0]?.total_filas ? resuelveConsulta.rows[0].total_filas : 0;
                    for (const detallesFila of reservasClasificadas) {
                        delete detallesFila.total_filas;
                    }
                    const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
                    const estructuraFinal = {
                        ok: "Reservas del cliente encontradas",
                        totalReservas: Number(consultaConteoTotalFilas),
                        paginasTotales: totalPaginas,
                        pagina: pagina,
                        nombreColumna: nombreColumna,
                        sentidoColumna: sentidoColumna,
                        reservas: reservasClasificadas
                    };
                    salida.json(estructuraFinal);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                }
            },
            eliminar: async () => {
                try {
                    const clienteUID = entrada.body.clienteUID;
                    if (!clienteUID || !Number.isInteger(clienteUID)) {
                        const error = "El campo cliente solo puede ser un numero positivo y entero que haga referencia al UID del cliente";
                        throw new Error(error);
                    }
                    const validarCliente = `
                        SELECT
                        uid
                        FROM 
                        clientes
                        WHERE
                        uid = $1`;
                    const resuelveValidarCliente = await conexion.query(validarCliente, [clienteUID]);
                    if (resuelveValidarCliente.rowCount === 0) {
                        const error = "No existe el cliente, revisa su identificador";
                        throw new Error(error);
                    }
                    if (resuelveValidarCliente.rowCount === 1) {
                        const consultaEliminarCliente = `
                            DELETE FROM clientes
                            WHERE uid = $1;
                            `;
                        const resuelveValidarYEliminarImpuesto = await conexion.query(consultaEliminarCliente, [clienteUID]);
                        if (resuelveValidarYEliminarImpuesto.rowCount === 0) {
                            const error = "No existe el cliente, revisa su identificador";
                            throw new Error(error);
                        }
                        if (resuelveValidarYEliminarImpuesto.rowCount === 1) {
                            const ok = {
                                ok: "Se ha eliminado correctamente el cliente",
                                clienteUID: clienteUID
                            };
                            salida.json(ok);
                        }
                    }
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                }
            }
        },
        impuestos: {
            IDX: {
                ROL: ["administrador", "empleado"]
            },
            listaImpuestos: async () => {
                try {
                    /*
                    "totalReservas": 16,
                    "paginasTotales": 2,
                    "pagina": 1,
                    "nombreColumna": "entrada",
                    "sentidoColumna": "descendente",
                    */
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
                                WHERE table_name = 'impuestos' AND column_name = $1;
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
                        }
                    };
                    // Si hay nombre columna que halla sentido
                    let nombreColumna = entrada.body.nombreColumna;
                    let sentidoColumna = entrada.body.sentidoColumna;
                    const pagina = entrada.body.pagina;
                    if (typeof pagina !== "number" || !Number.isInteger(pagina) || pagina <= 0) {
                        const error = "Debe de especificarse la clave 'pagina' y su valor debe de ser numerico, entero, positivo y mayor a cero.";
                        throw new Error(error);
                    }
                    const numeroPagina = Number((pagina - 1) + "0");
                    let ordenamientoFinal;
                    const ok = {};
                    if (nombreColumna || sentidoColumna) {
                        await validadores.nombreColumna(nombreColumna);
                        const sentidoColumnaSQL = (validadores.sentidoColumna(sentidoColumna)).sentidoColumnaSQL;
                        sentidoColumna = (validadores.sentidoColumna(sentidoColumna)).sentidoColumna;
                        ordenamientoFinal = `
                            ORDER BY 
                            "${nombreColumna}" ${sentidoColumnaSQL}
                            `;
                        ok.nombreColumna = nombreColumna;
                        ok.sentidoColumna = sentidoColumna;
                    } else {
                        ordenamientoFinal = "";
                    }
                    const numeroPorPagina = 10;
                    // si hay nombre columna validarlo
                    const listarImpuestos = `
                        SELECT
                        "impuestoUID",
                        nombre,
                        "tipoImpositivo",
                        "tipoValor",
                        "aplicacionSobre",
                        estado,
                        COUNT(*) OVER() as total_filas
                        FROM 
                        impuestos
                        ${ordenamientoFinal}
                        LIMIT $1
                        OFFSET $2;  
                        `;
                    const resuelvelistarImpuestos = await conexion.query(listarImpuestos, [numeroPorPagina, numeroPagina]);
                    if (resuelvelistarImpuestos.rowCount === 0) {
                        const error = "No hay ningun impuesto en sl sistema";
                        // throw new Error(error)
                    }
                    const consultaConteoTotalFilas = resuelvelistarImpuestos?.rows[0]?.total_filas ? resuelvelistarImpuestos.rows[0].total_filas : 0;
                    const impuestosEncontradoas = resuelvelistarImpuestos.rows;
                    const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
                    for (const detallesFila of impuestosEncontradoas) {
                        delete detallesFila.total_filas;
                    }
                    if (nombreColumna) {
                        ok.nombreColumna = nombreColumna;
                        ok.sentidoColumna = sentidoColumna;
                    }
                    ok.totalImpuestos = Number(consultaConteoTotalFilas);
                    ok.paginasTotales = totalPaginas;
                    ok.pagina = pagina;
                    ok.impuestos = impuestosEncontradoas;
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            detalleImpuesto: async () => {
                try {
                    const impuestoUID = entrada.body.impuestoUID;
                    if (!impuestoUID || typeof impuestoUID !== "number" || !Number.isInteger(impuestoUID) || impuestoUID <= 0) {
                        const error = "El campo 'impuestoUID' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    const validarImpuesto = `
                        SELECT
                        nombre,
                        "impuestoUID",
                        "tipoImpositivo",
                        "tipoValor",
                        "aplicacionSobre",
                        "estado"
                        FROM
                        impuestos
                        WHERE
                        "impuestoUID" = $1;
                        `;
                    const resuelveValidarImpuesto = await conexion.query(validarImpuesto, [impuestoUID]);
                    if (resuelveValidarImpuesto.rowCount === 0) {
                        const error = "No existe el perfil del impuesto";
                        throw new Error(error);
                    }
                    const perfilImpuesto = resuelveValidarImpuesto.rows[0];
                    const ok = {
                        ok: perfilImpuesto
                    };
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                }
            },
            guardarModificacionImpuesto: {
                IDX: {
                    ROL: [
                        "administrador"
                    ]
                },
                X: async () => {
                    await mutex.acquire();
                    try {
                        const impuestoUID = entrada.body.impuestoUID;
                        let nombreImpuesto = entrada.body.nombreImpuesto;
                        const tipoImpositivo = entrada.body.tipoImpositivo;
                        const tipoValor = entrada.body.tipoValor;
                        const aplicacionSobre = entrada.body.aplicacionSobre;
                        const estado = entrada.body.estado;
                        if (typeof impuestoUID !== "number" || !Number.isInteger(impuestoUID) || impuestoUID <= 0) {
                            const error = "El campo 'impuestoUID' debe ser un tipo numero, entero y positivo";
                            throw new Error(error);
                        }
                        const filtroCadena_v2 = /['"\\;\r\n<>\t\b]/g;
                        if (nombreImpuesto) {
                            if (typeof nombreImpuesto !== "string") {
                                const error = "El impuesto debe de ser una cadena";
                                throw new Error(error);
                            }
                            nombreImpuesto = nombreImpuesto.replace(filtroCadena_v2, '');
                            if (nombreImpuesto.length === 0) {
                                const error = "Revisa el nombre, ningun caracter escrito en el campo pasaporte es valido";
                                throw new Error(error);
                            }
                        }


                        const filtroTipoImpositivo = /^\d+\.\d{2}$/;
                        if (tipoImpositivo?.length > 0 && (typeof tipoImpositivo !== "string" || !filtroTipoImpositivo.test(tipoImpositivo))) {
                            const error = "El campo tipoImpositivo solo puede ser una cadena con un numero y dos decimlaes";
                            throw new Error(error);
                        }
                        const filtroCadenaSinEspacio = /^[a-z0-9]+$/;
                        if (tipoValor?.length > 0 && !filtroCadenaSinEspacio.test(tipoValor)) {
                            const error = "El campo tipoValor solo puede ser un una cadena de minúsculas y numeros sin espacios";
                            throw new Error(error);
                        }
                        const filtroCadena_mMN = /^[a-zA-Z0-9]+$/;
                        if (aplicacionSobre?.length > 0 && !filtroCadena_mMN.test(aplicacionSobre)) {
                            const error = "El campo aplicacionSobre solo puede ser un una cadena de minúsculas y numeros sin espacios";
                            throw new Error(error);
                        }
                        if (estado?.length > 0 && estado !== "desactivado" && estado !== "activado") {
                            const error = "El estado de un impuesto solo puede ser activado o desactivado";
                            throw new Error(error);
                        }
                        if (tipoValor) {
                            const validarTipoValor = `
                            SELECT 
                            "tipoValorIDV"
                            FROM "impuestoTipoValor"
                            WHERE "tipoValorIDV" = $1
                            `;
                            const resuelveValidarTipoValor = await conexion.query(validarTipoValor, [tipoValor]);
                            if (resuelveValidarTipoValor.rowCount === 0) {
                                const error = "No existe el tipo valor verifica el campor tipoValor";
                                throw new Error(error);
                            }
                        }
                        if (aplicacionSobre) {
                            const validarAplicacionSobre = `
                            SELECT 
                            "aplicacionIDV"
                            FROM "impuestosAplicacion"
                            WHERE "aplicacionIDV" = $1
                            `;
                            const resuelveValidarAplicacionSobre = await conexion.query(validarAplicacionSobre, [aplicacionSobre]);
                            if (resuelveValidarAplicacionSobre.rowCount === 0) {
                                const error = "No existe el contexto de aplicación verifica el campor resuelveValidarAplicacionSobre";
                                throw new Error(error);
                            }
                        }
                        const validarImpuestoYActualizar = `
                            UPDATE impuestos
                            SET 
                            nombre = COALESCE($1, nombre),
                            "tipoImpositivo" = COALESCE($2, "tipoImpositivo"),
                            "tipoValor" = COALESCE($3, "tipoValor"),
                            "aplicacionSobre" = COALESCE($4, "aplicacionSobre"),
                            estado = COALESCE($5, estado)
                            WHERE "impuestoUID" = $6
                            RETURNING
                            "impuestoUID",
                            "tipoImpositivo",
                            "tipoValor",
                            "aplicacionSobre",
                            estado
                            `;
                        const resuelveValidarImpuesto = await conexion.query(validarImpuestoYActualizar, [nombreImpuesto, tipoImpositivo, tipoValor, aplicacionSobre, estado, impuestoUID]);
                        if (resuelveValidarImpuesto.rowCount === 0) {
                            const error = "No existe el perfil del impuesto";
                            throw new Error(error);
                        }
                        const validarImpuesto = `
                            SELECT
                            nombre,
                            "impuestoUID",
                            "tipoImpositivo",
                            "tipoValor",
                            estado,
                            "aplicacionSobre"
                            FROM
                            impuestos
                            WHERE
                            "impuestoUID" = $1;
                            `;
                        const resuelveObtenerDetallesImpuesto = await conexion.query(validarImpuesto, [impuestoUID]);
                        if (resuelveObtenerDetallesImpuesto.rowCount === 0) {
                            const error = "No existe el perfil del impuesto";
                            throw new Error(error);
                        }
                        const perfilImpuesto = resuelveObtenerDetallesImpuesto.rows[0];
                        const ok = {
                            ok: "El impuesto se ha actualizado correctamente",
                            detallesImpuesto: perfilImpuesto
                        };
                        salida.json(ok);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    } finally {
                        mutex.release();
                    }
                }
            },
            opcionesEditarImpuesto: async () => {
                try {
                    const opcionesTipoValor = [];
                    const opcionesAplicacionSobre = [];
                    const opcionesMonedas = [];
                    const validarTipoValor = `
                        SELECT 
                        "tipoValorIDV", "tipoValorUI", simbolo
                        FROM "impuestoTipoValor"
                        `;
                    const resuelveValidarTipoValor = await conexion.query(validarTipoValor);
                    if (resuelveValidarTipoValor.rowCount > 0) {
                        opcionesTipoValor.push(...resuelveValidarTipoValor.rows);
                    }
                    const validarAplicacionSobre = `
                        SELECT 
                        "aplicacionIDV", "aplicacionUI"
                        FROM "impuestosAplicacion"
                        `;
                    const resuelveValidarAplicacionSobre = await conexion.query(validarAplicacionSobre);
                    if (resuelveValidarAplicacionSobre.rowCount > 0) {
                        opcionesAplicacionSobre.push(...resuelveValidarAplicacionSobre.rows);
                    }
                    // const validarMoneda = `
                    // SELECT 
                    // "monedaIDV", "monedaUI", simbolo
                    // FROM monedas
                    // `
                    // const resuelveValidarMoneda = await conexion.query(validarMoneda)
                    // if (resuelveValidarMoneda.rowCount > 0) {
                    //     opcionesMonedas.push(...resuelveValidarMoneda.rows);
                    // }
                    const detallesImpuesto = {
                        tipoValor: opcionesTipoValor,
                        aplicacionSobre: opcionesAplicacionSobre,
                        //moneda: opcionesMonedas
                    };
                    const ok = {
                        ok: detallesImpuesto
                    };
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            eliminarPerfilImpuesto: {
                IDX: {
                    ROL: [
                        "administrador"
                    ]
                },
                X: async () => {
                    await mutex.acquire();
                    try {
                        const impuestoUID = entrada.body.impuestoUID;
                        if (typeof impuestoUID !== "number" || !Number.isInteger(impuestoUID) || impuestoUID <= 0) {
                            const error = "El campo 'impuestoUID' debe ser un tipo numero, entero y positivo";
                            throw new Error(error);
                        }
                        const validarYEliminarImpuesto = `
                            DELETE FROM impuestos
                            WHERE "impuestoUID" = $1;
                            `;
                        const resuelveValidarYEliminarImpuesto = await conexion.query(validarYEliminarImpuesto, [impuestoUID]);
                        if (resuelveValidarYEliminarImpuesto.rowCount === 0) {
                            const error = "No existe el perfil del impuesto que deseas eliminar";
                            throw new Error(error);
                        }
                        const ok = {
                            ok: "Perfil del impuesto eliminado"
                        };
                        salida.json(ok);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    } finally {
                        mutex.release();
                    }
                }
            },
            crearNuevoImpuesto: {
                IDX: {
                    ROL: [
                        "administrador"
                    ]
                },
                X: async () => {
                    await mutex.acquire();
                    try {
                        let nombreImpuesto = entrada.body.nombreImpuesto;
                        const tipoImpositivo = entrada.body.tipoImpositivo;
                        const tipoValor = entrada.body.tipoValor;
                        const aplicacionSobre = entrada.body.aplicacionSobre;
                        const filtroCadena_v2 = /['"\\;\r\n<>\t\b]/g;

                        if (!nombreImpuesto) {
                            const error = "El campo nombreImpuesto solo puede ser un una cadena de minúsculas";
                            throw new Error(error);
                        }
                        nombreImpuesto = nombreImpuesto.replace(filtroCadena_v2, '');
                        if (nombreImpuesto.length === 0) {
                            const error = "Revisa el nombre del impuesto, ningun caracter escrito en el campo pasaporte es valido";
                            throw new Error(error);
                        }

                        const filtroTipoImpositivo = /^\d+\.\d{2}$/;
                        if (!tipoImpositivo || (typeof tipoImpositivo !== "string" || !filtroTipoImpositivo.test(tipoImpositivo))) {
                            const error = "El campo tipoImpositivo solo puede ser una cadena con un numero y dos decimlaes";
                            throw new Error(error);
                        }
                        const filtroCadenaSinEspacio = /^[a-z0-9]+$/;
                        if (!tipoValor || !filtroCadenaSinEspacio.test(tipoValor)) {
                            const error = "El campo tipoValor solo puede ser un una cadena de minúsculas y numeros sin espacios";
                            throw new Error(error);
                        }
                        const filtroCadena_mMN = /^[a-zA-Z0-9]+$/;
                        if (!aplicacionSobre || !filtroCadena_mMN.test(aplicacionSobre)) {
                            const error = "El campo aplicacionSobre solo puede ser un una cadena de minúsculas y numeros sin espacios";
                            throw new Error(error);
                        }
                        // if (!moneda || !filtroCadenaSinEspacio.test(moneda)) {
                        //     const error = "El campo moneda solo puede ser un una cadena de minúsculas y numeros sin espacios"
                        //     throw new Error(error)
                        // }
                        if (tipoValor) {
                            const validarTipoValor = `
                            SELECT 
                            "tipoValorIDV"
                            FROM "impuestoTipoValor"
                            WHERE "tipoValorIDV" = $1
                            `;
                            const resuelveValidarTipoValor = await conexion.query(validarTipoValor, [tipoValor]);
                            if (resuelveValidarTipoValor.rowCount === 0) {
                                const error = "No existe el tipo valor verifica el campor tipoValor";
                                throw new Error(error);
                            }
                        }
                        if (aplicacionSobre) {
                            const validarAplicacionSobre = `
                            SELECT 
                            "aplicacionIDV"
                            FROM "impuestosAplicacion"
                            WHERE "aplicacionIDV" = $1
                            `;
                            const resuelveValidarAplicacionSobre = await conexion.query(validarAplicacionSobre, [aplicacionSobre]);
                            if (resuelveValidarAplicacionSobre.rowCount === 0) {
                                const error = "No existe el contexto de aplicación verifica el campor resuelveValidarAplicacionSobre";
                                throw new Error(error);
                            }
                        }
                        // if (moneda) {
                        //     const validarMoneda = `
                        // SELECT 
                        // "monedaIDV"
                        // FROM monedas
                        // WHERE "monedaIDV" = $1
                        // `
                        //     const resuelveValidarMoneda = await conexion.query(validarMoneda, [moneda])
                        //     if (resuelveValidarMoneda.rowCount === 0) {
                        //         const error = "No existe la moneda, verifica el campo moneda"
                        //         throw new Error(error)
                        //     }
                        // }
                        const validarImpuestoYActualizar = `
                            INSERT INTO impuestos
                            (
                            nombre,
                            "tipoImpositivo",
                            "tipoValor",
                            "aplicacionSobre",
                            estado
                            )
                            VALUES ($1, $2, $3, $4, $5)
                            RETURNING "impuestoUID"
                            `;
                        const nuevoImpuesto = [
                            nombreImpuesto,
                            tipoImpositivo,
                            tipoValor,
                            aplicacionSobre,
                            "desactivado"
                        ];
                        const resuelveValidarImpuesto = await conexion.query(validarImpuestoYActualizar, nuevoImpuesto);
                        const nuevoUIDImpuesto = resuelveValidarImpuesto.rows[0].idv;
                        const ok = {
                            ok: "Se ha creado el nuevo impuesto",
                            nuevoImpuestoUID: nuevoUIDImpuesto
                        };
                        salida.json(ok);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    } finally {
                        mutex.release();
                    }
                }
            },
            opcionesCrearImpuesto: {
                IDX: {
                    ROL: [
                        "administrador"
                    ]
                },
                X: async () => {
                    try {
                        let opcionesTipoValor = [];
                        let opcionesAplicacionSobre = [];
                        let opcionesMonedas = [];
                        const validarTipoValor = `
                        SELECT 
                        "tipoValorIDV", "tipoValorUI", simbolo
                        FROM "impuestoTipoValor"
                        `;
                        const resuelveValidarTipoValor = await conexion.query(validarTipoValor);
                        if (resuelveValidarTipoValor.rowCount > 0) {
                            opcionesTipoValor = resuelveValidarTipoValor.rows;
                        }
                        const validarAplicacionSobre = `
                        SELECT 
                        "aplicacionIDV", "aplicacionUI"
                        FROM "impuestosAplicacion"
                        `;
                        const resuelveValidarAplicacionSobre = await conexion.query(validarAplicacionSobre);
                        if (resuelveValidarAplicacionSobre.rowCount > 0) {
                            opcionesAplicacionSobre = resuelveValidarAplicacionSobre.rows;
                        }
                        const validarMoneda = `
                        SELECT 
                        "monedaIDV", "monedaUI", simbolo
                        FROM monedas
                        `;
                        const resuelveValidarMoneda = await conexion.query(validarMoneda);
                        if (resuelveValidarMoneda.rowCount > 0) {
                            opcionesMonedas = resuelveValidarMoneda.rows;
                        }
                        const detallesImpuesto = {
                            "tipoValor": opcionesTipoValor,
                            "aplicacionSobre": opcionesAplicacionSobre,
                            "moneda": opcionesMonedas
                        };
                        const ok = {
                            "ok": detallesImpuesto
                        };
                        salida.json(ok);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    } finally {
                    }
                }
            }
        },
        precios: {
            IDX: {
                ROL: ["administrador", "empleado"]
            },
            listaPreciosApartamentos: {
                IDX: {
                    ROL: ["administrador", "empleado"]
                },
                X: async () => {
                    try {
                        const apartamentos = `
                            SELECT
                            "apartamentoIDV"
                            FROM 
                            "configuracionApartamento"
                            `;
                        const resuelveApartamentos = await conexion.query(apartamentos);
                        if (resuelveApartamentos.rowCount === 0) {
                            const error = "No hay ningun apartamento en el sistema";
                            throw new Error(error);
                        }
                        const apartamentosEncontrados = resuelveApartamentos.rows;
                        const seleccionarImpuestos = `
                            SELECT
                            nombre, "tipoImpositivo", "tipoValor"
                            FROM
                            impuestos
                            WHERE
                            ("aplicacionSobre" = $1 OR "aplicacionSobre" = $2) AND estado = $3;
                          
                            `;
                        const resuelveSeleccionarImpuestos = await conexion.query(seleccionarImpuestos, ["totalNeto", "totalReservaNeto", "activado"]);
                        const objetoFInal = [];
                        for (const apartamentoEncotrado of apartamentosEncontrados) {
                            const apartamentoIDV = apartamentoEncotrado.apartamentoIDV;
                            const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                            const apartamento = {
                                apartamento: apartamentoIDV,
                                apartamentoUI: apartamentoUI
                            };
                            const listarPreciosApartamentos = `
                                SELECT
                                uid, apartamento, precio, moneda
                                FROM 
                                "preciosApartamentos"
                                WHERE apartamento = $1
                                `;
                            const resuelveListarPreciosApartamentos = await conexion.query(listarPreciosApartamentos, [apartamentoIDV]);
                            if (resuelveListarPreciosApartamentos.rowCount === 1) {
                                const precioEncontrados = resuelveListarPreciosApartamentos.rows[0];
                                const precioApartamento = precioEncontrados.precio;
                                const moneda = precioEncontrados.moneda;
                                const uidPrecio = precioEncontrados.uid;
                                apartamento.uid = uidPrecio;
                                apartamento.precio = precioApartamento;
                                apartamento.moneda = moneda;
                                apartamento.totalImpuestos = "0.00";
                                apartamento.totalDiaBruto = precioApartamento;

                                if (resuelveSeleccionarImpuestos.rowCount > 0) {
                                    const impuestosEncontrados = resuelveSeleccionarImpuestos.rows;
                                    apartamento.totalImpuestos = 0;
                                    let sumaTotalImpuestos = 0;
                                    impuestosEncontrados.map((detalleImpuesto) => {
                                        const tipoImpositivo = detalleImpuesto.tipoImpositivo;
                                        const tipoValor = detalleImpuesto.tipoValor;
                                        if (tipoValor === "porcentaje") {
                                            const resultadoApliacado = (precioApartamento * (tipoImpositivo / 100)).toFixed(2);
                                            sumaTotalImpuestos += parseFloat(resultadoApliacado);
                                        }
                                        if (tipoValor === "tasa") {
                                            sumaTotalImpuestos += parseFloat(tipoImpositivo);
                                        }
                                    });
                                    apartamento.totalImpuestos = Number(sumaTotalImpuestos).toFixed(2);
                                    const totalDiaBruto = Number(sumaTotalImpuestos) + Number(precioApartamento);
                                    apartamento.totalDiaBruto = totalDiaBruto.toFixed(2);
                                }
                            }
                            objetoFInal.push(apartamento);
                        }
                        const ok = {
                            ok: objetoFInal
                        };
                        salida.json(ok);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    } finally {
                    }
                }
            },
            detallePrecioBaseApartamento: {
                IDX: {
                    ROL: [
                        "administrador",
                        "empleado"
                    ]
                },
                X: async () => {
                    try {
                        const apartamentoIDV = entrada.body.apartamentoIDV;
                        const filtroCadena = /^[a-z0-9]+$/;
                        if (typeof apartamentoIDV !== "string" || !filtroCadena.test(apartamentoIDV)) {
                            const error = "El campo apartamentoIDV solo puede ser un una cadena de minúsculas y numeros, ni siquera espacios";
                            throw new Error(error);
                        }
                        const transaccionInterna = await precioBaseApartamento(apartamentoIDV);

                        //  transaccionInterna.precioNetoPorDia = new Decimal(transaccionInterna.precioNetoPorDia).toFixed(2)
                        //  transaccionInterna.totalImpuestos = new Decimal(transaccionInterna.totalImpuestos).toFixed(2)
                        //  transaccionInterna.totalBrutoPordia = new Decimal(transaccionInterna.totalBrutoPordia).toFixed(2)
                        transaccionInterna.impuestos.map((impuesto) => {
                            const tipoImpositivo = impuesto.tipoImpositivo;
                            const totalImpuesto = impuesto.totalImpuesto;
                            impuesto.tipoImpositivo = new Decimal(tipoImpositivo).toFixed(2);
                            impuesto.totalImpuesto = new Decimal(totalImpuesto).toFixed(2);
                        });


                        const ok = {
                            ok: transaccionInterna
                        };
                        salida.json(ok);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    } finally {
                    }
                }
            },
            previsualizarPrecioApartamento: {
                IDX: {
                    ROL: ["administrador"]
                },
                X: async () => {
                    try {
                        const apartamentoIDV = entrada.body.apartamentoIDV;
                        const filtroCadena = /^[a-z0-9]+$/;
                        const propuestaPrecio = entrada.body.propuestaPrecio;
                        
                        if (typeof apartamentoIDV !== "string") {
                            const error = "El campo apartamentoIDV debe de ser una cadena";
                            throw new Error(error);
                        }
                        if (!filtroCadena.test(apartamentoIDV)) {
                            const error = "El campo apartamentoIDV solo puede ser un una cadena de minúsculas y numeros, ni siquera espacios";
                            throw new Error(error);
                        }
                        const filtroPropuestaPrecio = /^\d+\.\d{2}$/;
                        if (!filtroPropuestaPrecio.test(propuestaPrecio)) {
                            const error = "El campo propuestaPrecio solo puede ser un numero con dos decimales y nada mas, los decimales deben de separarse con un punto y no una coma, por ejemplo si quieres poner un precio de 10, tienes que escribir 10.00";
                            throw new Error(error);
                        }
                        const validarApartamento = `
                        SELECT
                        "apartamentoIDV"
                        FROM 
                        "configuracionApartamento"
                        WHERE "apartamentoIDV" = $1
                        `;
                        const resuelveValidarApartamento = await conexion.query(validarApartamento, [apartamentoIDV]);
                        if (resuelveValidarApartamento.rowCount === 0) {
                            const error = "No existe el apartamenro";
                            throw new Error(error);
                        }
                        const detallesApartamento = {};
                        const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                        detallesApartamento.apartamentoUI = apartamentoUI;
                        detallesApartamento.apartamentoIDV = apartamentoIDV;
                        const precioNetoApartamentoPorDia = propuestaPrecio;
                        detallesApartamento.precioNetoPorDiaPropuesto = precioNetoApartamentoPorDia;
                        detallesApartamento.totalImpuestos = "0.00";
                        detallesApartamento.totalBrutoPordia = precioNetoApartamentoPorDia;
                        detallesApartamento.impuestos = [];

                        const seleccionarImpuestos = `
                        SELECT
                        nombre, "tipoImpositivo", "tipoValor"
                        FROM
                        impuestos
                        WHERE
                        ("aplicacionSobre" = $1 OR "aplicacionSobre" = $2) AND estado = $3;
                      
                        `;
                        const resuelveSeleccionarImpuestos = await conexion.query(seleccionarImpuestos, ["totalNeto", "totalReservaNeto", "activado"]);
                        if (resuelveSeleccionarImpuestos.rowCount > 0) {
                            const impuestosEncontrados = resuelveSeleccionarImpuestos.rows;
                            let impuestosFinal;
                            let sumaTotalImpuestos = 0;
                            impuestosEncontrados.map((detalleImpuesto) => {
                                const tipoImpositivo = detalleImpuesto.tipoImpositivo;
                                const nombreImpuesto = detalleImpuesto.nombre;
                                const tipoValor = detalleImpuesto.tipoValor;
                                impuestosFinal = {
                                    "nombreImpuesto": nombreImpuesto,
                                    "tipoImpositivo": tipoImpositivo,
                                    "tipoValor": tipoValor,
                                };
                                if (tipoValor === "porcentaje") {
                                    const resultadoApliacado = (precioNetoApartamentoPorDia * (tipoImpositivo / 100)).toFixed(2);
                                    sumaTotalImpuestos += parseFloat(resultadoApliacado);
                                    impuestosFinal.totalImpuesto = resultadoApliacado;
                                }
                                if (tipoValor === "tasa") {
                                    sumaTotalImpuestos += parseFloat(tipoImpositivo);
                                    impuestosFinal.totalImpuesto = tipoImpositivo;
                                }
                                (detallesApartamento.impuestos).push(impuestosFinal);
                            });
                            let totalDiaBruto = Number(sumaTotalImpuestos) + Number(precioNetoApartamentoPorDia);
                            totalDiaBruto = totalDiaBruto.toFixed(2);
                            detallesApartamento.totalImpuestos = sumaTotalImpuestos;
                            detallesApartamento.totalBrutoPordia = totalDiaBruto;
                        }
                        const ok = {
                            ok: detallesApartamento
                        };
                        salida.json(ok);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    } finally {
                    }
                }
            },
            establecerNuevoPrecioApartamento: {
                IDX: {
                    ROL: ["administrador"]
                },
                X: async () => {
                    await mutex.acquire();
                    try {
                        const apartamentoIDV = entrada.body.apartamentoIDV;
                        const nuevoPrecio = entrada.body.nuevoPrecio;
                        if (typeof apartamentoIDV !== "string") {
                            const error = "El campo apartamentoIDV debe de ser una cadena";
                            throw new Error(error);
                        }
                        const filtroCadena = /^[a-z0-9]+$/;
                        if (!filtroCadena.test(apartamentoIDV)) {
                            const error = "El campo apartamentoIDV solo puede ser un una cadena de minúsculas y numeros, ni siquera espacios";
                            throw new Error(error);
                        }
                        const filtroPropuestaPrecio = /^\d+\.\d{2}$/;
                        if (!filtroPropuestaPrecio.test(nuevoPrecio)) {
                            const error = "El campo nuevoPrecio solo puede ser un numero con dos decimales y nada mas, los decimales deben de separarse con un punto y no una coma";
                            throw new Error(error);
                        }
                        const validarApartamento = `
                        SELECT
                        "apartamentoIDV", "estadoConfiguracion"
                        FROM 
                        "configuracionApartamento"
                        WHERE "apartamentoIDV" = $1
                        `;
                        const resuelveValidarApartamento = await conexion.query(validarApartamento, [apartamentoIDV]);
                        if (resuelveValidarApartamento.rowCount === 0) {
                            const error = "No existe el apartamenro";
                            throw new Error(error);
                        }
                        if (resuelveValidarApartamento.rows[0].estadoConfiguracion === "disponible") {
                            const error = "No se puede puede establecer un precio a este apartmento cuadno la configuracion esta en modo disponible. Primero desactive la configuracion del apartmento dejandola en estado No disponible y luego podra hacer las modificaciones que necesite";
                            throw new Error(error);
                        }
                        const detallesApartamento = {};
                        const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                        detallesApartamento.apartamentoUI = apartamentoUI;
                        detallesApartamento.apartamentoIDV = apartamentoIDV;
                        const insertarNuevoPrecioApartamento = `
                        UPDATE "preciosApartamentos"
                        SET precio = $1
                        WHERE "apartamento" = $2;
                        `;
                        const resuelveInsertarNuevoPrecioApartamento = await conexion.query(insertarNuevoPrecioApartamento, [nuevoPrecio, apartamentoIDV]);
                        if (resuelveInsertarNuevoPrecioApartamento.rowCount === 0) {
                            const error = "No existe ningun perfil de precio que actualizar para este apartamento";
                            throw new Error(error);
                        }
                        const listarPrecioApartamento = `
                        SELECT
                        uid, apartamento, precio, moneda
                        FROM 
                        "preciosApartamentos"
                        WHERE apartamento = $1
                        `;
                        const resuelveListarPrecioApartamento = await conexion.query(listarPrecioApartamento, [apartamentoIDV]);
                        if (resuelveListarPrecioApartamento.rowCount === 0) {
                            const error = "No hay ningun precio de este apartamento en el sistema";
                            throw new Error(error);
                        }
                        const precioNetoApartamentoPorDia = resuelveListarPrecioApartamento.rows[0].precio;
                        detallesApartamento.precioNetoPorDia = precioNetoApartamentoPorDia;
                        detallesApartamento.totalImpuestos = "0.00";
                        detallesApartamento.totalBrutoPordia = precioNetoApartamentoPorDia;
                        detallesApartamento.impuestos = [];

                        const seleccionarImpuestos = `
                        SELECT
                        nombre, "tipoImpositivo", "tipoValor"
                        FROM
                        impuestos
                        WHERE
                        ("aplicacionSobre" = $1 OR "aplicacionSobre" = $2) AND estado = $3;
                      
                        `;
                        const resuelveSeleccionarImpuestos = await conexion.query(seleccionarImpuestos, ["totalNeto", "totalReservaNeto", "activado"]);
                        if (resuelveSeleccionarImpuestos.rowCount > 0) {

                            const impuestosEncontrados = resuelveSeleccionarImpuestos.rows;
                            let impuestosFinal;
                            let sumaTotalImpuestos = 0;
                            impuestosEncontrados.map((detalleImpuesto) => {
                                const tipoImpositivo = detalleImpuesto.tipoImpositivo;
                                const nombreImpuesto = detalleImpuesto.nombre;
                                const tipoValor = detalleImpuesto.tipoValor;
                                impuestosFinal = {
                                    "nombreImpuesto": nombreImpuesto,
                                    "tipoImpositivo": tipoImpositivo,
                                    "tipoValor": tipoValor,
                                };
                                if (tipoValor === "porcentaje") {
                                    const resultadoApliacado = (precioNetoApartamentoPorDia * (tipoImpositivo / 100)).toFixed(2);
                                    sumaTotalImpuestos += parseFloat(resultadoApliacado);
                                    impuestosFinal.totalImpuesto = resultadoApliacado;
                                }
                                if (tipoValor === "tasa") {
                                    sumaTotalImpuestos += parseFloat(tipoImpositivo);
                                    impuestosFinal.totalImpuesto = tipoImpositivo;
                                }
                                (detallesApartamento.impuestos).push(impuestosFinal);
                            });
                            let totalDiaBruto = Number(sumaTotalImpuestos) + Number(precioNetoApartamentoPorDia);
                            totalDiaBruto = totalDiaBruto.toFixed(2);
                            detallesApartamento.totalImpuestos = sumaTotalImpuestos.toFixed(2);
                            detallesApartamento.totalBrutoPordia = totalDiaBruto;
                        }
                        const ok = {
                            "ok": detallesApartamento
                        };
                        salida.json(ok);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    } finally {
                        mutex.release();
                    }
                }
            },
            eliminarPerfilPrecioApartamento: {
                IDX: {
                    ROL: ["administrador"]
                },
                X: async () => {
                    await mutex.acquire();
                    try {
                        const apartamentoIDV = entrada.body.apartamentoIDV;
                        if (typeof apartamentoIDV !== "string") {
                            const error = "El campo apartamentoIDV debe de ser una cadena";
                            throw new Error(error);
                        }
                        const filtroCadena = /^[a-z0-9]+$/;
                        if (!filtroCadena.test(apartamentoIDV)) {
                            const error = "El campo apartamentoIDV solo puede ser un una cadena de minúsculas y numeros, ni siquera espacios";
                            throw new Error(error);
                        }
                        const validarApartamento = `
                        SELECT
                        "apartamentoIDV", 
                        "estadoConfiguracion"
                        FROM 
                        "configuracionApartamento"
                        WHERE "apartamentoIDV" = $1
                        `;
                        const resuelveValidarApartamento = await conexion.query(validarApartamento, [apartamentoIDV]);
                        if (resuelveValidarApartamento.rowCount === 0) {
                            const error = "No existe el apartamenro";
                            throw new Error(error);
                        }
                        if (resuelveValidarApartamento.rows[0].estadoConfiguracion === "disponible") {
                            const error = "No se puede eliminar un perfil de precio de una configuracion de apartamento mientras esta configuracion esta disponible para su uso. Por favor primero ponga la configuracion en no disponible y luego realiza las modificaciones pertinentes.";
                            throw new Error(error);
                        }
                        const eliminarPerfilPrecio = `
                        DELETE FROM "preciosApartamentos"
                        WHERE apartamento = $1;
                        `;
                        const resuelveEliminarPerfilPrecio = await conexion.query(eliminarPerfilPrecio, [apartamentoIDV]);
                        if (resuelveEliminarPerfilPrecio.rowCount === 0) {
                            const error = "No hay ningun perfil de precio que elimintar de este apartamento";
                            throw new Error(error);
                        }
                        const ok = {
                            "ok": "Se ha eliminado correctamnte el perfil de apartamento"
                        };
                        salida.json(ok);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    } finally {
                        mutex.release();
                    }
                }
            },
            resolverMoneda: {
                IDX: {
                    ROL: ["administrador"]
                },
                X: async () => {
                    try {
                        let monedaIDV = entrada.body.monedaIDV;
                        const filtroCadena = /^[a-z]+$/;
                        if (!monedaIDV || !filtroCadena.test(monedaIDV)) {
                            const error = "El campo monedaIDV solo puede ser un una cadena de minúsculas";
                            throw new Error(error);
                        }
                        const transaccionInterna = await resolverMoneda(monedaIDV);
                        salida.json(transaccionInterna);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    } finally {
                    }
                }
            }
        },
        ofertas: {
            IDX: {
                ROL: ["administrador", "empleado"]
            },
            crearOferta: {
                IDX: {
                    ROL: [
                        "administrador"
                    ]
                },
                X: async () => {
                    await mutex.acquire();
                    try {
                        let nombreOferta = entrada.body.nombreOferta;
                        const fechaInicio = entrada.body.fechaInicio;
                        const fechaFin = entrada.body.fechaFin;
                        const tipoOferta = entrada.body.tipoOferta;
                        const tipoDescuento = entrada.body.tipoDescuento ? entrada.body.tipoDescuento : null;
                        let cantidad = entrada.body.cantidad;
                        const contextoAplicacion = entrada.body.contextoAplicacion;
                        const apartamentosSeleccionados = entrada.body.apartamentosSeleccionados;
                        const simboloNumero = entrada.body.simboloNumero;
                        const numero = entrada.body.numero;
                        const filtroCantidad = /^\d+(\.\d{1,2})?$/;
                        const filtroNombre = /['"\\;\r\n<>\t\b]/g;
                        const filtroFecha = /^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/)(?:0?[1,3-9]|1[0-2]))\2|(?:(?:0?[1-9])|(?:1[0-9])|(?:2[0-8]))(\/)(?:0?[1-9]|1[0-2]))\3(?:(?:19|20)[0-9]{2})$/;



                        if (!nombreOferta) {
                            const error = "El campo nombreOferta no admice comillas simples o dobles";
                            throw new Error(error);
                        }
                        nombreOferta = nombreOferta.replace(filtroNombre, '');

                        const fechaInicio_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaInicio)).fecha_ISO;
                        const fechaFin_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaFin)).fecha_ISO;
                        const fechaInicio_objeto = DateTime.fromISO(fechaInicio_ISO);
                        const fechaFin_objeto = DateTime.fromISO(fechaFin_ISO);
                        if (fechaInicio_objeto > fechaFin_objeto) {
                            const error = "La fecha de inicio de la oferta no puede ser inferior a la fecha del fin de la oferta";
                            throw new Error(error);
                        }
                        if (tipoOferta !== "porNumeroDeApartamentos" &&
                            tipoOferta !== "porApartamentosEspecificos" &&
                            tipoOferta !== "porDiasDeAntelacion" &&
                            tipoOferta !== "porRangoDeFechas" &&
                            tipoOferta !== "porDiasDeReserva") {
                            const error = "No se reconoce el tipo de oferta";
                            throw new Error(error);
                        }
                        // Validar nombre unico oferta
                        const validarNombreOfertaUnico = `
                                SELECT "nombreOferta"
                                FROM ofertas
                                WHERE "nombreOferta" = $1
                                `;
                        const consultaValidarNombreOfertaUnico = await conexion.query(validarNombreOfertaUnico, [nombreOferta]);
                        if (consultaValidarNombreOfertaUnico.rowCount > 0) {
                            const error = "Ya existe un nombre de oferta exactamente igual a este, por favor elige otro nombre para esta oferta con el fin de evitar confusiones";
                            throw new Error(error);
                        }
                        if (tipoDescuento === "precioEstablecido") {
                            const controlPrecioEstablecido = `
                            SELECT 
                            *
                            FROM ofertas
                            WHERE ("fechaInicio" <= $1 AND "fechaFin" >= $2) AND "tipoDescuento" = $3;
                            `;
                            const resuelveControlPrecioEstablecido = await conexion.query(controlPrecioEstablecido, [fechaInicio_ISO, fechaFin_ISO, tipoDescuento]);
                        }
                        const validadores = {
                            numero: (numero) => {
                                numero = Number(numero);
                                if (!numero || !Number.isInteger(numero) || numero <= 0) {
                                    const error = "El campo numero debe de ser un numer entero y positivo1";
                                    throw new Error(error);
                                }
                            },
                            simboloNumero: (simboloNumero) => {
                                if (!simboloNumero || (simboloNumero !== "numeroExacto" && simboloNumero !== "aPartirDe")) {
                                    const error = "El campo simboloNumero debe de ser un numer entero y positivo";
                                    throw new Error(error);
                                }
                            },
                            tipoDescuento: (tipoDescuento) => {
                                if (!tipoDescuento || (tipoDescuento !== "cantidadFija" && tipoDescuento !== "porcentaje")) {
                                    const error = `El tipo de descuento solo puede ser cantidadFija, porcentable o precioEstablecido`;
                                    throw new Error(error);
                                }
                            },
                            contextoAplicacion: (contextoAplicacion) => {
                                if (!contextoAplicacion || (contextoAplicacion !== "totalNetoReserva" && contextoAplicacion !== "totalNetoApartamentoDedicado")) {
                                    const error = `El campo contexto de aplicación solo puede ser, totalNetoReserva, totalNetoApartamentoDedicado`;
                                    throw new Error(error);
                                }
                            },
                            cantidad: (cantidad) => {
                                if (!cantidad || !filtroCantidad.test(cantidad)) {
                                    const error = "El campo cantidad debe ser un número con un máximo de dos decimales separados por punto. Recuerda que number es sin comillas.";
                                    throw new Error(error);
                                }
                                cantidad = Number(cantidad);
                            },
                            controlLimitePorcentaje: (tipoDescuento, cantidad) => {
                                if (tipoDescuento === "porcentaje" && new Decimal(cantidad).greaterThan(100)) {
                                    const error = "Cuidado! No se puede acepatar un porcentaje superior a 100% por que sino la oferta podria generar numeros negativos.";
                                    throw new Error(error);
                                }
                            }
                        };
                        await conexion.query('BEGIN'); // Inicio de la transacción
                        const inertarOfertaValidada = async (metadatos) => {
                            try {
                                const nombreOferta = metadatos.nombreOferta;
                                const fechaInicio_ISO = metadatos.fechaInicio_ISO;
                                const fechaFin_ISO = metadatos.fechaFin_ISO;
                                const simboloNumero = metadatos.simboloNumero;
                                const numero = metadatos.numero;
                                const contextoAplicacion = metadatos.contextoAplicacion;
                                const estadoInicalDesactivado = "desactivada";
                                const tipoOferta = metadatos.tipoOferta;
                                const cantidad = metadatos.cantidad;
                                const tipoDescuento = metadatos.tipoDescuento;
                                const crearOfertaDesactivada = `
                                    INSERT INTO ofertas
                                    (
                                        "nombreOferta",
                                        "fechaInicio",
                                        "fechaFin",
                                        "simboloNumero",
                                        "numero",
                                        "descuentoAplicadoA",
                                        "estadoOferta",
                                        "tipoOferta",
                                        cantidad,
                                        "tipoDescuento"
                                    )
                                    VALUES
                                    (
                                        COALESCE($1, NULL),
                                        COALESCE($2::date, NULL),
                                        COALESCE($3::date, NULL),
                                        NULLIF($4, NULL),
                                        NULLIF($5::numeric, NULL),
                                        COALESCE($6, NULL),
                                        COALESCE($7, NULL),
                                        COALESCE($8, NULL),
                                        NULLIF($9::numeric, NULL),
                                        NULLIF($10, NULL)
                                    )
                                    RETURNING uid;
                                    `;
                                const datos = [
                                    nombreOferta,
                                    fechaInicio_ISO,
                                    fechaFin_ISO,
                                    simboloNumero,
                                    numero,
                                    contextoAplicacion,
                                    estadoInicalDesactivado,
                                    tipoOferta,
                                    cantidad,
                                    tipoDescuento
                                ];
                                const resuelveCrearOfertaDesactivada = await conexion.query(crearOfertaDesactivada, datos);
                                if (resuelveCrearOfertaDesactivada.rowCount === 1) {
                                    const estructuraFinal = {
                                        ok: "Se ha creado la oferta correctamente",
                                        nuevoUIDOferta: resuelveCrearOfertaDesactivada.rows[0].uid
                                    };
                                    return estructuraFinal;
                                }
                                if (resuelveCrearOfertaDesactivada.rowCount === 0) {
                                    const error = "Ha ocurrido un error y no se ha insertado la oferta";
                                    throw new Error(error);
                                }
                            } catch (error) {
                                throw error;
                            }
                        };
                        if (tipoOferta === "porNumeroDeApartamentos") {
                            validadores.simboloNumero(simboloNumero);
                            validadores.numero(numero);
                            validadores.cantidad(cantidad);
                            validadores.tipoDescuento(tipoDescuento);
                            validadores.controlLimitePorcentaje(tipoDescuento, cantidad);
                            const oferta = {
                                nombreOferta: nombreOferta,
                                fechaInicio_ISO: fechaInicio_ISO,
                                fechaFin_ISO: fechaFin_ISO,
                                simboloNumero: simboloNumero,
                                numero: numero,
                                tipoOferta: tipoOferta,
                                cantidad: cantidad,
                                tipoDescuento: tipoDescuento
                            };
                            const resolutor = await inertarOfertaValidada(oferta);
                            salida.json(resolutor);
                        }
                        if (tipoOferta === "porApartamentosEspecificos") {
                            const filtroCadena = /^[a-zA-Z0-9]+$/;
                            const filtroCadenaUI = /^[a-zA-Z0-9\s]+$/;
                            if (typeof apartamentosSeleccionados !== 'object' && !Array.isArray(apartamentosSeleccionados)) {
                                const error = "El campo apartamentosSeleccionados solo admite un arreglo";
                                throw new Error(error);
                            }
                            if (apartamentosSeleccionados.length === 0) {
                                const error = "Anada al menos un apartmento dedicado";
                                throw new Error(error);
                            }
                            validadores.contextoAplicacion(contextoAplicacion);
                            if (contextoAplicacion === "totalNetoReserva") {
                                validadores.cantidad(cantidad);
                                validadores.tipoDescuento(tipoDescuento);
                                validadores.controlLimitePorcentaje(tipoDescuento, cantidad);
                            }
                            for (const apartamentoSeleccionado of apartamentosSeleccionados) {
                                const apartamentoIDV = apartamentoSeleccionado.apartamentoIDV;
                                const apartamentoUI = apartamentoSeleccionado.apartamentoUI;
                                const tipoDescuentoApartamento = apartamentoSeleccionado.tipoDescuento;
                                const cantidadPorApartamento = apartamentoSeleccionado.cantidad;
                                if (!apartamentoIDV || !filtroCadena.test(apartamentoIDV)) {
                                    const error = "El campo apartamentoIDV solo admite minúsculas, mayúsculas y numeros nada mas ni espacios";
                                    throw new Error(error);
                                }
                                if (!apartamentoUI || !filtroCadenaUI.test(apartamentoUI)) {
                                    const error = "El campo apartamentoUI solo admite minúsculas, mayúsculas, numeros y espacios nada mas ni espacios";
                                    throw new Error(error);
                                }
                                if (contextoAplicacion === "totalNetoApartamentoDedicado") {
                                    if (!tipoDescuentoApartamento || (tipoDescuentoApartamento !== "cantidadFija" && tipoDescuentoApartamento !== "porcentaje") && tipoDescuentoApartamento !== "precioEstablecido") {
                                        const error = `El apartamento ${apartamentoUI} debe de tener un tipo de descuente seleccionado, revisa los apartamentos para ver si en alguno falta un tipo de descuente`;
                                        throw new Error(error);
                                    }
                                    if (!cantidadPorApartamento || typeof cantidadPorApartamento !== "string" || !filtroCantidad.test(cantidadPorApartamento)) {
                                        const error = `El campo cantidad del ${apartamentoUI} dedicado debe ser un número con un máximo de dos decimales separados por punto. Escribe los decimales igualmente, ejemplo 10.00`;
                                        throw new Error(error);
                                    }
                                    validadores.controlLimitePorcentaje(tipoDescuentoApartamento, cantidadPorApartamento);
                                }
                            }
                            // No pueden existir dos apartamentos o mas iguales
                            const apartamentosSeleccionadosPreProcesados = apartamentosSeleccionados.map((detallesApartamento) => { return detallesApartamento.apartamentoIDV; });
                            const apartamentosSeleccionadosUnicos = new Set(apartamentosSeleccionadosPreProcesados);
                            const controlApartamentosIDV = apartamentosSeleccionadosPreProcesados.length !== apartamentosSeleccionadosUnicos.size;
                            if (controlApartamentosIDV) {
                                const error = "No se permiten apartamentos repetidos en el objeto de apartamentosSeleccionados";
                                throw new Error(error);
                            }
                            // que los identificadores no existan.
                            const consultaValidarApartamentoIDV = `
                            SELECT
                            "apartamentoIDV"
                            FROM
                            "configuracionApartamento"
                            WHERE
                            "apartamentoIDV" = ANY($1)
                            `;
                            const resuelveConsultaValidarApartamentoIDV = await conexion.query(consultaValidarApartamentoIDV, [apartamentosSeleccionadosPreProcesados]);
                            // Extraer los valores encontrados en la base de datos
                            const apartamentosIDVEncontrados = resuelveConsultaValidarApartamentoIDV.rows.map(row => row.apartamentoIDV);
                            // Encontrar las cadenas que no coincidieron
                            const cadenasNoCoincidentes = apartamentosSeleccionadosPreProcesados.filter(apartamentoIDV => !apartamentosIDVEncontrados.includes(apartamentoIDV));
                            if (cadenasNoCoincidentes.length > 0) {
                                const error = `Se hace referencia a identificadores visuales de apartamentos que no existen. Por favor revisa los identificadores de los apartamentos a lo que quieres aplicar una oferta por que no existen`;
                                throw new Error(error);
                            }
                            if (contextoAplicacion === "totalNetoApartamentoDedicado") {
                                cantidad = null;
                            }
                            const oferta = {
                                nombreOferta: nombreOferta,
                                fechaInicio_ISO: fechaInicio_ISO,
                                fechaFin_ISO: fechaFin_ISO,
                                contextoAplicacion: contextoAplicacion,
                                tipoOferta: tipoOferta,
                                cantidad: cantidad,
                                tipoDescuento: tipoDescuento
                            };
                            const resolutor = await inertarOfertaValidada(oferta);
                            const nuevoUIDOferta = resolutor.nuevoUIDOferta;
                            for (const apartamentoDedicado of apartamentosSeleccionados) {
                                const apartamentoIDV = apartamentoDedicado.apartamentoIDV;
                                let tipoDescuento = null;
                                let cantidadPorApartamento = null;
                                if (contextoAplicacion === "totalNetoApartamentoDedicado") {
                                    tipoDescuento = apartamentoDedicado.tipoDescuento;
                                    cantidadPorApartamento = apartamentoDedicado.cantidad;
                                    cantidadPorApartamento = Number(cantidadPorApartamento);
                                }
                                const ofertaApartamentosDedicados = `
                                INSERT INTO "ofertasApartamentos"
                                (
                                    oferta,
                                    apartamento,
                                    "tipoDescuento",
                                    cantidad
                                )
                                VALUES
                                (
                                    NULLIF($1::numeric, NULL),
                                    NULLIF($2, NULL),
                                    NULLIF($3, NULL),
                                    NULLIF($4::numeric, NULL)
                                )
                                `;
                                const detallesApartamentoDedicado = [
                                    nuevoUIDOferta,
                                    apartamentoIDV,
                                    tipoDescuento,
                                    cantidadPorApartamento
                                ];
                                await conexion.query(ofertaApartamentosDedicados, detallesApartamentoDedicado);
                            }
                            const ok = {
                                "ok": "La oferta se ha creado bien",
                                "nuevoUIDOferta": nuevoUIDOferta
                            };
                            salida.json(ok);
                        }
                        if (tipoOferta === "porDiasDeAntelacion") {
                            validadores.simboloNumero(simboloNumero);
                            validadores.numero(numero);
                            validadores.cantidad(cantidad);
                            validadores.tipoDescuento(tipoDescuento);
                            validadores.controlLimitePorcentaje(tipoDescuento, cantidad);
                            const oferta = {
                                nombreOferta: nombreOferta,
                                fechaInicio_ISO: fechaInicio_ISO,
                                fechaFin_ISO: fechaFin_ISO,
                                simboloNumero: simboloNumero,
                                contextoAplicacion: contextoAplicacion,
                                tipoOferta: tipoOferta,
                                numero: numero,
                                cantidad: cantidad,
                                tipoDescuento: tipoDescuento
                            };
                            const resolutor = await inertarOfertaValidada(oferta);
                            salida.json(resolutor);
                        }
                        if (tipoOferta === "porDiasDeReserva") {
                            validadores.simboloNumero(simboloNumero);
                            validadores.numero(numero);
                            validadores.cantidad(cantidad);
                            validadores.tipoDescuento(tipoDescuento);
                            validadores.controlLimitePorcentaje(tipoDescuento, cantidad);
                            //    simboloNumero = entrada.body.simboloNumero
                            const oferta = {
                                nombreOferta: nombreOferta,
                                fechaInicio_ISO: fechaInicio_ISO,
                                fechaFin_ISO: fechaFin_ISO,
                                simboloNumero: simboloNumero,
                                numero: numero,
                                contextoAplicacion: contextoAplicacion,
                                tipoOferta: tipoOferta,
                                cantidad: cantidad,
                                tipoDescuento: tipoDescuento
                            };
                            const resolutor = await inertarOfertaValidada(oferta);
                            salida.json(resolutor);
                        }
                        if (tipoOferta === "porRangoDeFechas") {
                            validadores.tipoDescuento(tipoDescuento);
                            validadores.cantidad(cantidad);
                            const oferta = {
                                nombreOferta: nombreOferta,
                                fechaInicio_ISO: fechaInicio_ISO,
                                fechaFin_ISO: fechaFin_ISO,
                                tipoOferta: tipoOferta,
                                cantidad: cantidad,
                                tipoDescuento: tipoDescuento
                            };
                            const resolutor = await inertarOfertaValidada(oferta);
                            salida.json(resolutor);
                        }
                        await conexion.query('COMMIT'); // Confirmar la transacción
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    } finally {
                        mutex.release();
                    }
                }
            },
            listasOfertasAdministracion: async () => {
                try {
                    const listarOfertas = `
                        SELECT
                        "nombreOferta",
                        uid,
                        to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
                        to_char("fechaFin", 'DD/MM/YYYY') as "fechaFin",
                        "numero",
                        "simboloNumero",
                        "descuentoAplicadoA" ,
                        "estadoOferta",
                        "tipoOferta",
                        "cantidad",
                        "tipoDescuento"
                        FROM 
                        ofertas 
                        ORDER BY 
                        "fechaInicio" ASC;
                        `;
                    const resuelveListarOfertas = await conexion.query(listarOfertas);
                    if (resuelveListarOfertas.rowCount === 0) {
                        const ok = {
                            ok: "No hay ofertas configuradas"
                        };
                        salida.json(ok);
                    }
                    if (resuelveListarOfertas.rowCount > 0) {
                        const ofertas = resuelveListarOfertas.rows;
                        for (const ofertaDetalles of ofertas) {
                            const uid = ofertaDetalles.uid;
                            const tipoOferta = ofertaDetalles.tipoOferta;
                            const descuentoAplicadoA = ofertaDetalles.descuentoAplicadoA;
                            if (tipoOferta === "porApartamentosEspecificos") {
                                //Arreglar esto, esto esta bien es una resolucion en modo joint
                                const detallesApartamentosDedicados = `
                                    SELECT
                                    oa.apartamento AS "apartamentoIDV",
                                    a."apartamentoUI",
                                    oa."tipoDescuento",
                                    oa."cantidad"
                                    FROM 
                                    "ofertasApartamentos" oa
                                    LEFT JOIN
                                    "apartamentos" a ON oa.apartamento = a.apartamento
                                    WHERE oferta = $1
                                    `;
                                const resuelveDetallesApartamentosDedicados = await conexion.query(detallesApartamentosDedicados, [uid]);
                                if (resuelveDetallesApartamentosDedicados.rowCount === 0) {
                                    ofertaDetalles.apartamentosDedicados = [];
                                }
                                if (resuelveDetallesApartamentosDedicados.rowCount > 0) {
                                    const apartamentosDedicados = resuelveDetallesApartamentosDedicados.rows;
                                    ofertaDetalles.apartamentosDedicados = [];
                                    apartamentosDedicados.map((apartamento) => {
                                        const apartamentoIDV = apartamento.apartamentoIDV;
                                        const apartamentoUI = apartamento.apartamentoUI;
                                        const tipoDescuentoApartamento = apartamento.tipoDescuento;
                                        const cantidadApartamento = apartamento.cantidad;
                                        const detallesApartamentoDedicado = {
                                            apartamentoIDV: apartamentoIDV,
                                            apartamentoUI: apartamentoUI,
                                            tipoDescuento: tipoDescuentoApartamento,
                                            cantidadApartamento: cantidadApartamento
                                        };
                                        ofertaDetalles.apartamentosDedicados.push(detallesApartamentoDedicado);
                                    });
                                }
                            }
                        }
                        const ok = {
                            ok: ofertas
                        };
                        salida.json(ok);
                    }
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                }
            },
            detallesOferta: async () => {
                try {
                    const ofertaUID = entrada.body.ofertaUID;
                    if (!ofertaUID || typeof ofertaUID !== "number" || !Number.isInteger(ofertaUID) || ofertaUID <= 0) {
                        const error = "El campo 'ofertaUID' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    const detallesOferta = await obtenerDetallesOferta(ofertaUID);
                    const ok = {
                        ok: detallesOferta
                    };
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                }
            },
            opcionesCrearOferta: async () => {
                try {
                    const opcionesCrearOferta = {};
                    const listaAplicacionOferta = `
                        SELECT
                        "aplicacionIDV", "aplicacionUI"
                        FROM 
                        "ofertasAplicacion";`;
                    const resuelveListaAplicacionOferta = await conexion.query(listaAplicacionOferta);
                    opcionesCrearOferta.aplicacionSobre = resuelveListaAplicacionOferta.rows;
                    const listaTipoOfertas = `
                        SELECT
                        "tipoOfertaIDV", "tipoOfertaUI"
                        FROM 
                        "ofertasTipo";`;
                    const resuelveListaTipoOfertas = await conexion.query(listaTipoOfertas);
                    opcionesCrearOferta.tipoOfertas = resuelveListaTipoOfertas.rows;
                    const listaTipoDescuento = `
                        SELECT
                        "tipoDescuentoIDV", "tipoDescuentoUI"
                        FROM 
                        "ofertasTipoDescuento";`;
                    const resuelveListaTipoDescuento = await conexion.query(listaTipoDescuento);
                    opcionesCrearOferta.tipoDescuento = resuelveListaTipoDescuento.rows;
                    const ok = {
                        ok: opcionesCrearOferta
                    };
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            actualizarOferta: {
                IDX: {
                    ROL: [
                        "administrador"
                    ]
                },
                X: async () => {
                    await mutex.acquire();
                    try {
                        let nombreOferta = entrada.body.nombreOferta;
                        const fechaInicio = entrada.body.fechaInicio;
                        const fechaFin = entrada.body.fechaFin;
                        const tipoOferta = entrada.body.tipoOferta;
                        const ofertaUID = entrada.body.ofertaUID;
                        const tipoDescuento = entrada.body.tipoDescuento ? entrada.body.tipoDescuento : null;
                        let cantidad = entrada.body.cantidad;
                        const numero = entrada.body.numero;
                        const simboloNumero = entrada.body.simboloNumero;
                        const contextoAplicacion = entrada.body.contextoAplicacion;
                        const apartamentosSeleccionados = entrada.body.apartamentosSeleccionados;
                        const filtroCantidad = /^\d+\.\d{2}$/;
                        const filtroCadena = /['"\\;\r\n<>\t\b]/g;
                        if (!ofertaUID || !Number.isInteger(ofertaUID) || ofertaUID <= 0) {
                            const error = "El campo ofertaUID tiene que ser un numero, positivo y entero";
                            throw new Error(error);
                        }
                        if (!nombreOferta) {
                            const error = "El campo nombreOferta no admice comillas simples o dobles";
                            throw new Error(error);
                        }
                        nombreOferta = nombreOferta.replace(filtroCadena, '');
                        const fechaInicio_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaInicio)).fecha_ISO;
                        const fechaFin_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaFin)).fecha_ISO;
                        const fechaInicio_objeto = DateTime.fromISO(fechaInicio_ISO);
                        const fechaFin_objeto = DateTime.fromISO(fechaFin_ISO);
                        if (fechaInicio_objeto > fechaFin_objeto) {
                            const error = "La fecha de inicio de la oferta no puede ser inferior a la fecha del fin de la oferta";
                            throw new Error(error);
                        }
                        if (tipoOferta !== "porNumeroDeApartamentos" &&
                            tipoOferta !== "porApartamentosEspecificos" &&
                            tipoOferta !== "porDiasDeAntelacion" &&
                            tipoOferta !== "porRangoDeFechas" &&
                            tipoOferta !== "porDiasDeReserva") {
                            const error = "No se reconoce el tipo de oferta";
                            throw new Error(error);
                        }
                        const validadoresLocales = {
                            numero: (numero) => {
                                numero = Number(numero);
                                if (!numero || !Number.isInteger(numero) || numero <= 0) {
                                    const error = "El campo numero debe de ser un numer entero y positivo1";
                                    throw new Error(error);
                                }
                            },
                            simboloNumero: (simboloNumero) => {
                                if (!simboloNumero || (simboloNumero !== "numeroExacto" && simboloNumero !== "aPartirDe")) {
                                    const error = "El campo simboloNumero debe de ser un numer entero y positivo";
                                    throw new Error(error);
                                }
                            },
                            tipoDescuento: (tipoDescuento) => {
                                if (!tipoDescuento || (tipoDescuento !== "cantidadFija" && tipoDescuento !== "porcentaje")) {
                                    const error = `El tipo de descuento solo puede ser cantidadFija, porcentable o precioEstablecido`;
                                    throw new Error(error);
                                }
                            },
                            contextoAplicacion: (contextoAplicacion) => {
                                if (!contextoAplicacion || (contextoAplicacion !== "totalNetoReserva" && contextoAplicacion !== "totalNetoApartamentoDedicado")) {
                                    const error = `El campo contexto de aplicación solo puede ser, totalNetoReserva, totalNetoApartamentoDedicado`;
                                    throw new Error(error);
                                }
                            },
                            cantidad: (cantidad) => {
                                if (!cantidad || !filtroCantidad.test(cantidad)) {
                                    const error = "El campo cantidad debe ser un número con un máximo de dos decimales separados por punto. Recuerda que number es sin comillas.";
                                    throw new Error(error);
                                }
                            },
                            controlLimitePorcentaje: (tipoDescuento, cantidad) => {
                                if (tipoDescuento === "porcentaje" && new Decimal(cantidad).greaterThan(100)) {
                                    const error = "Cuidado! No se puede acepatar un porcentaje superior a 100% por que sino la oferta podria generar numeros negativos.";
                                    throw new Error(error);
                                }
                            }
                        };
                        // Validar existencia de la oferta y estado
                        const validarNombreOfertaUnico = `
                                SELECT 
                                "estadoOferta"
                                FROM ofertas
                                WHERE uid = $1;`;
                        const consultaValidarNombreOfertaUnico = await conexion.query(validarNombreOfertaUnico, [ofertaUID]);
                        if (consultaValidarNombreOfertaUnico.rowCount === 0) {
                            const error = "No existe ninguna oferta con este identificador. Por lo tanto no se puede actualizar.";
                            throw new Error(error);
                        }
                        const estadoOferta = consultaValidarNombreOfertaUnico.rows[0].estadoOferta;
                        if (estadoOferta === "activada") {
                            const error = "No se puede modificar una oferta activa. Primero desactiva con el boton de estado.";
                            throw new Error(error);
                        }
                        const consultaActualizarCompartido = async (metadatos) => {
                            const nombreOferta = metadatos.nombreOferta;
                            const fechaInicio_ISO = metadatos.fechaInicio_ISO;
                            const fechaFin_ISO = metadatos.fechaFin_ISO;
                            const numero = metadatos.numero;
                            const simboloNumero = metadatos.simboloNumero;
                            const contextoAplicacion = metadatos.contextoAplicacion;
                            const tipoOferta = metadatos.tipoOferta;
                            const cantidad = metadatos.cantidad ? metadatos.cantidad : null;
                            const tipoDescuento = metadatos.tipoDescuento;
                            const ofertaUID = metadatos.ofertaUID;
                            const actualizarOferta = `
                                   UPDATE ofertas
                                   SET
                                   "nombreOferta" = COALESCE($1, NULL),
                                   "fechaInicio" = COALESCE($2::date, NULL),
                                   "fechaFin" = COALESCE($3::date, NULL),
                                   "numero" = COALESCE($4::numeric, NULL),
                                   "simboloNumero" = COALESCE($5, NULL),
                                   "descuentoAplicadoA" = COALESCE($6, NULL),
                                   "tipoOferta" = COALESCE($7, NULL),
                                   cantidad = COALESCE($8::numeric, NULL),
                                   "tipoDescuento" = COALESCE($9, NULL)
                                   WHERE uid = $10;`;
                            const datos = [
                                nombreOferta,
                                fechaInicio_ISO,
                                fechaFin_ISO,
                                numero,
                                simboloNumero,
                                contextoAplicacion,
                                tipoOferta,
                                cantidad,
                                tipoDescuento,
                                ofertaUID
                            ];
                            const resuelve = await conexion.query(actualizarOferta, datos);
                            return resuelve.rows[0];
                        };
                        const eliminaPerfilApartamentoEspecificos = async (ofertaUID) => {
                            const eliminarApartamentosDedicados = `
                            DELETE FROM "ofertasApartamentos"
                            WHERE oferta = $1;`;
                            await conexion.query(eliminarApartamentosDedicados, [ofertaUID]);
                        };
                        await conexion.query('BEGIN'); // Inicio de la transacción


                        // validadoresCompartidos.contextoAplicacion(contextoAplicacion)
                        if (tipoOferta === "porNumeroDeApartamentos" ||
                            tipoOferta === "porDiasDeAntelacion" ||
                            tipoOferta === "porDiasDeReserva") {
                            validadoresLocales.cantidad(cantidad);
                            cantidad = Number(cantidad);
                            validadoresLocales.tipoDescuento(tipoDescuento);
                            validadoresLocales.numero(numero);
                            validadoresLocales.simboloNumero(simboloNumero);
                            validadoresLocales.controlLimitePorcentaje(tipoDescuento, cantidad);
                            eliminaPerfilApartamentoEspecificos(ofertaUID);
                            const metadatos = {
                                nombreOferta: nombreOferta,
                                fechaInicio_ISO: fechaInicio_ISO,
                                fechaFin_ISO: fechaFin_ISO,
                                numero: numero,
                                simboloNumero: simboloNumero,
                                // contextoAplicacion: contextoAplicacion,
                                tipoOferta: tipoOferta,
                                cantidad: cantidad,
                                tipoDescuento: tipoDescuento,
                                ofertaUID: ofertaUID,
                            };
                            await consultaActualizarCompartido(metadatos);
                            await conexion.query('COMMIT');
                            const ok = {
                                ok: "Se ha acualizado correctamente la oferta",
                                detallesOferta: await obtenerDetallesOferta(ofertaUID)
                            };
                            salida.json(ok);
                        }
                        if (tipoOferta === "porRangoDeFechas") {
                            validadoresLocales.cantidad(cantidad);
                            cantidad = Number(cantidad);
                            validadoresLocales.tipoDescuento(tipoDescuento);
                            validadoresLocales.controlLimitePorcentaje(tipoDescuento, cantidad);
                            await eliminaPerfilApartamentoEspecificos(ofertaUID);
                            const metadatos = {
                                nombreOferta: nombreOferta,
                                fechaInicio_ISO: fechaInicio_ISO,
                                fechaFin_ISO: fechaFin_ISO,
                                numero: numero,
                                simboloNumero: simboloNumero,
                                // contextoAplicacion: contextoAplicacion,
                                tipoOferta: tipoOferta,
                                cantidad: cantidad,
                                tipoDescuento: tipoDescuento,
                                ofertaUID: ofertaUID,
                            };
                            await consultaActualizarCompartido(metadatos);
                            await conexion.query('COMMIT');
                            const ok = {
                                ok: "Se ha acualizado correctamente la oferta",
                                detallesOferta: await obtenerDetallesOferta(ofertaUID)
                            };
                            salida.json(ok);
                        }
                        if (tipoOferta === "porApartamentosEspecificos") {
                            validadoresLocales.contextoAplicacion(contextoAplicacion);
                            const filtroCadena = /^[a-zA-Z0-9]+$/;
                            const filtroCadenaUI = /^[a-zA-Z0-9\s]+$/;
                            if (contextoAplicacion === "totalNetoReserva") {
                                validadoresLocales.cantidad(cantidad);
                                cantidad = Number(cantidad);
                                validadoresLocales.tipoDescuento(tipoDescuento);
                                validadoresLocales.controlLimitePorcentaje(tipoDescuento, cantidad);
                            }
                            if (contextoAplicacion === "totalNetoApartamentoDedicado") {
                            }
                            await eliminaPerfilApartamentoEspecificos(ofertaUID);
                            const metadatos = {
                                nombreOferta: nombreOferta,
                                fechaInicio_ISO: fechaInicio_ISO,
                                fechaFin_ISO: fechaFin_ISO,
                                contextoAplicacion: contextoAplicacion,
                                tipoOferta: tipoOferta,
                                cantidad: cantidad,
                                tipoDescuento: tipoDescuento,
                                ofertaUID: ofertaUID,
                            };
                            await consultaActualizarCompartido(metadatos);
                            if (typeof apartamentosSeleccionados !== 'object' && !Array.isArray(apartamentosSeleccionados)) {
                                const error = "El campo apartamentosSeleccionados solo admite un arreglo";
                                throw new Error(error);
                            }
                            if (apartamentosSeleccionados.length === 0) {
                                const error = "Anada al menos un apartmento dedicado";
                                throw new Error(error);
                            }
                            for (const apartamentoSeleccionado of apartamentosSeleccionados) {
                                const apartamentoIDV = apartamentoSeleccionado.apartamentoIDV;
                                const apartamentoUI = apartamentoSeleccionado.apartamentoUI;
                                const tipoDescuentoApartamento = apartamentoSeleccionado.tipoDescuento;
                                const cantidadPorApartamento = apartamentoSeleccionado.cantidad;
                                if (!apartamentoIDV || !filtroCadena.test(apartamentoIDV)) {
                                    const error = "El campo apartamentoIDV solo admite minúsculas, mayúsculas y numeros nada mas ni espacios";
                                    throw new Error(error);
                                }
                                if (!apartamentoUI || !filtroCadenaUI.test(apartamentoUI)) {
                                    const error = "El campo apartamentoUI solo admite minúsculas, mayúsculas, numeros y espacios nada mas ni espacios";
                                    throw new Error(error);
                                }
                                if (contextoAplicacion === "totalNetoApartamentoDedicado") {
                                    if (!tipoDescuentoApartamento || (tipoDescuentoApartamento !== "cantidadFija" && tipoDescuentoApartamento !== "porcentaje") && tipoDescuentoApartamento !== "precioEstablecido") {
                                        const error = `El apartamento ${apartamentoUI} debe de tener un tipo de descuente seleccionado, revisa los apartamentos para ver si en alguno falta un tipo de descuente`;
                                        throw new Error(error);
                                    }
                                    if (!cantidadPorApartamento || typeof cantidadPorApartamento !== "string" || !filtroCantidad.test(cantidadPorApartamento)) {
                                        const error = `El campo cantidad del ${apartamentoUI} dedicado debe ser un número con un máximo de dos decimales separados por punto. Escribe los decimales igualmente, ejemplo 10.00`;
                                        throw new Error(error);
                                    }
                                    validadoresLocales.controlLimitePorcentaje(tipoDescuentoApartamento, cantidadPorApartamento);
                                }
                            }
                            for (const apartamentoDedicado of apartamentosSeleccionados) {
                                const apartamentoIDV = apartamentoDedicado.apartamentoIDV;
                                let tipoDescuento = null;
                                let cantidadPorApartamento = null;
                                if (contextoAplicacion === "totalNetoApartamentoDedicado") {
                                    tipoDescuento = apartamentoDedicado.tipoDescuento;
                                    cantidadPorApartamento = apartamentoDedicado.cantidad;
                                }
                                const ofertaApartamentosDedicados = `
                                        INSERT INTO "ofertasApartamentos"
                                        (
                                        oferta,
                                        apartamento,
                                        "tipoDescuento",
                                        cantidad
                                        )
                                        VALUES
                                        (
                                        NULLIF($1::numeric, NULL),
                                        COALESCE($2, NULL),
                                        COALESCE($3, NULL),
                                        NULLIF($4::numeric, NULL)
                                        )
                                        RETURNING uid;`;
                                const detallesApartamentoDedicado = [
                                    Number(ofertaUID),
                                    apartamentoIDV,
                                    tipoDescuento,
                                    Number(cantidadPorApartamento)
                                ];
                                await conexion.query(ofertaApartamentosDedicados, detallesApartamentoDedicado);
                            }
                            await conexion.query('COMMIT');
                            const ok = {
                                ok: "La oferta  se ha actualizado bien junto con los apartamentos dedicados",
                                detallesOferta: await obtenerDetallesOferta(ofertaUID)
                            };
                            salida.json(ok);
                        }
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK');
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    } finally {
                        mutex.release();
                    }
                }
            },
            actualizarEstadoOferta: {
                IDX: {
                    ROL: [
                        "administrador"
                    ]
                },
                X: async () => {
                    await mutex.acquire();
                    try {
                        const ofertaUID = entrada.body.ofertaUID;
                        const estadoOferta = entrada.body.estadoOferta;
                        const filtroCadena = /^[a-z]+$/;
                        if (!ofertaUID || !Number.isInteger(ofertaUID) || ofertaUID <= 0) {
                            const error = "El campo ofertaUID tiene que ser un numero, positivo y entero";
                            throw new Error(error);
                        }
                        if (!estadoOferta || !filtroCadena.test(estadoOferta) || (estadoOferta !== "activada" && estadoOferta !== "desactivada")) {
                            const error = "El campo estadoOferta solo admite minúsculas y nada mas, debe de ser un estado activada o desactivada";
                            throw new Error(error);
                        }
                        // Validar nombre unico oferta
                        const validarOferta = `
                        SELECT uid
                        FROM ofertas
                        WHERE uid = $1;
                        `;
                        const resuelveValidarOferta = await conexion.query(validarOferta, [ofertaUID]);
                        if (resuelveValidarOferta.rowCount === 0) {
                            const error = "No existe al oferta, revisa el UID introducie en el campo ofertaUID, recuerda que debe de ser un number";
                            throw new Error(error);
                        }
                        await conexion.query('BEGIN'); // Inicio de la transacción
                        const actualizarEstadoOferta = `
                        UPDATE ofertas
                        SET "estadoOferta" = $2
                        WHERE uid = $1
                        RETURNING "estadoOferta";
                        `;
                        const datos = [
                            ofertaUID,
                            estadoOferta,
                        ];
                        const resuelveEstadoOferta = await conexion.query(actualizarEstadoOferta, datos);
                        const ok = {
                            "ok": "El estado de la oferta se ha actualziado correctamente",
                            "estadoOferta": resuelveEstadoOferta.rows[0].estadoOferta
                        };
                        salida.json(ok);
                        await conexion.query('COMMIT'); // Confirmar la transacción
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    } finally {
                        mutex.release();
                    }
                }
            },
            eliminarOferta: {
                IDX: {
                    ROL: [
                        "administrador"
                    ]
                },
                X: async () => {
                    await mutex.acquire();
                    try {
                        const ofertaUID = entrada.body.ofertaUID;
                        if (!ofertaUID || !Number.isInteger(ofertaUID) || ofertaUID <= 0) {
                            const error = "El campo ofertaUID tiene que ser un numero, positivo y entero";
                            throw new Error(error);
                        }
                        // Validar nombre unico oferta
                        const validarOferta = `
                        SELECT uid
                        FROM ofertas
                        WHERE uid = $1;
                        `;
                        let resuelveValidarOferta = await conexion.query(validarOferta, [ofertaUID]);
                        if (resuelveValidarOferta.rowCount === 0) {
                            const error = "No existe al oferta, revisa el UID introducie en el campo ofertaUID, recuerda que debe de ser un number";
                            throw new Error(error);
                        }
                        await conexion.query('BEGIN'); // Inicio de la transacción
                        let eliminarEstadoOferta = `
                        DELETE FROM ofertas
                        WHERE uid = $1;
                        `;
                        let resuelveEliminarEstadoOferta = await conexion.query(eliminarEstadoOferta, [ofertaUID]);
                        const ok = {
                            "ok": "Se ha eliminado la oferta correctamente",
                        };
                        salida.json(ok);
                        await conexion.query('COMMIT'); // Confirmar la transacción
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    } finally {
                        mutex.release();
                    }
                }
            }
        },
        comportamientoDePrecios: {
            IDX: {
                ROL: ["administrador"]
            },
            listaComportamientosPrecios: async () => {
                try {
                    const listaComportamientoPrecios = `
                        SELECT
                        "nombreComportamiento",
                        uid,
                        to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
                        to_char("fechaFinal", 'DD/MM/YYYY') as "fechaFinal",
                        explicacion,
                        estado,
                        tipo,
                        "diasArray"
                        FROM 
                        "comportamientoPrecios"
                        ORDER BY 
                        "fechaInicio" ASC;
                        `;
                    const resuelveListaComportamientoPrecios = await conexion.query(listaComportamientoPrecios);
                    const ok = {};
                    if (resuelveListaComportamientoPrecios.rowCount === 0) {
                        ok.ok = "No hay comportamiento de precios configurados";
                        salida.json(ok);
                    }
                    if (resuelveListaComportamientoPrecios.rowCount > 0) {

                        const listaComportamientos = resuelveListaComportamientoPrecios.rows;
                        ok.ok = listaComportamientos;
                        salida.json(ok);
                    }
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                }
            },
            crearComportamiento: async () => {
                await mutex.acquire();
                try {
                    let nombreComportamiento = entrada.body.nombreComportamiento;

                    const apartamentos = entrada.body.apartamentos;
                    const filtroCantidad = /^\d+\.\d{2}$/;
                    const filtroCadenaSinEspacui = /^[a-z0-9]+$/;
                    const filtroNombre = /['"\\;\r\n<>\t\b]/g;
                    const tipo = entrada.body.tipo;

                    if (!nombreComportamiento) {
                        const error = "El campo nombreComportamiento solo admite minúsculas, mayúsculas, numeros y espacios";
                        throw new Error(error);
                    }
                    nombreComportamiento = nombreComportamiento.replace(filtroNombre, '');
                    if (tipo !== "porDias" && tipo !== "porRango") {
                        const error = "Por favor determine si el tipo de bloqueo es porRango o porDias.";
                        throw new Error(error);
                    }
                    let fechaInicio_ISO;
                    let fechaFinal_ISO;
                    let diasArray;

                    await conexion.query('BEGIN'); // Inicio de la transacción
                    if (tipo === "porRango") {
                        const fechaInicio = entrada.body.fechaInicio;
                        const fechaFinal = entrada.body.fechaFinal;

                        const filtroFecha = /^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/)(?:0?[1,3-9]|1[0-2]))\2|(?:(?:0?[1-9])|(?:1[0-9])|(?:2[0-8]))(\/)(?:0?[1-9]|1[0-2]))\3(?:(?:19|20)[0-9]{2})$/;
                        if (!filtroFecha.test(fechaInicio)) {
                            const error = "el formato fecha de inicio no esta correctametne formateado debe ser una cadena asi 00/00/0000";
                            throw new Error(error);
                        }
                        if (!filtroFecha.test(fechaFinal)) {
                            const error = "el formato fecha de fin no esta correctametne formateado debe ser una cadena asi 00/00/0000";
                            throw new Error(error);
                        }
                        const fechaInicioArreglo = fechaInicio.split("/");
                        const diaEntrada = fechaInicioArreglo[0];
                        const mesEntrada = fechaInicioArreglo[1];
                        const anoEntrada = fechaInicioArreglo[2];
                        const fechaFinArreglo = fechaFin.split("/");
                        const diaSalida = fechaFinArreglo[0];
                        const mesSalida = fechaFinArreglo[1];
                        const anoSalida = fechaFinArreglo[2];
                        fechaInicio_ISO = `${anoEntrada}-${mesEntrada}-${diaEntrada}`;
                        fechaFinal_ISO = `${anoSalida}-${mesSalida}-${diaSalida}`;
                        await validadoresCompartidos.fechas.validarFecha_ISO(fechaInicio_ISO);
                        await validadoresCompartidos.fechas.validarFecha_ISO(fechaFinal_ISO);


                        const fechaInicio_Objeto = new Date(fechaInicio_ISO); // El formato es día/mes/ano
                        const fechaFinal_Objeto = new Date(fechaFinal_ISO);
                        // validacion: la fecha de entrada no puede ser superior a la fecha de salida y al mimso tiempo la fecha de salida no puede ser inferior a la fecha de entrada
                        if (fechaInicio_Objeto > fechaFinal_Objeto) {
                            const error = "La fecha de entrada no puede ser superior que la fecha de salida, si pueden ser iguales para hacer un comportamiento de un solo dia";
                            throw new Error(error);
                        }

                    }
                    //let diasCSV
                    if (tipo === "porDias") {
                        diasArray = entrada.body.diasArray;

                        if (typeof diasArray !== 'object' && !Array.isArray(diasArray)) {
                            const error = "El campo diasArray solo admite un arreglo";
                            throw new Error(error);
                        }
                        if (diasArray.length === 0) {
                            const error = "Seleccione al menos un dia por favor.";
                            throw new Error(error);
                        }

                        // Control elemento repetidos
                        const contador = {};
                        for (const elemento of diasArray) {
                            if (typeof elemento !== "string") {
                                const error = "En el array solo se esperan strings, revisa el array por que hay elemento que no son cadenas.";
                                throw new Error(error);
                            }
                            const filtroElemento = String(elemento).toLocaleLowerCase();
                            if (contador[filtroElemento]) {
                                const error = "En el array de diasSeleccionados no puede haber dos elementos repetidos";
                                throw new Error(error);
                            } else {
                                contador[filtroElemento] = 1;
                            }
                        }

                        const diasIDV = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
                        const elementosNoEnArray = (diasArray, diasIDV) => {
                            return diasArray.filter(elemento => !diasIDV.includes(elemento));
                        };

                        const elementosNoEnArreglo2 = elementosNoEnArray(diasArray, diasIDV);
                        if (elementosNoEnArreglo2.length > 0) {
                            const error = "En el array de diasArray no se reconoce: " + elementosNoEnArreglo2;
                            throw new Error(error);
                        }
                        //diasCSV = diasArray.join(",")
                    }


                    if (typeof apartamentos !== 'object' && !Array.isArray(apartamentos)) {
                        const error = "El campo apartamentos solo admite un arreglo";
                        throw new Error(error);
                    }
                    if (apartamentos.length === 0) {
                        const error = "Anada al menos un apartmento dedicado";
                        throw new Error(error);
                    } else {
                        const identificadoresVisualesEnArray = [];
                        apartamentos.forEach((apart) => {
                            if (typeof apart !== "object" || Array.isArray(apart) || apart === null) {
                                const error = "Dentro del array de apartamentos se esperaba un objeto";
                                throw new Error(error);
                            }
                            const apartamentoIDV_preProcesado = apart.apartamentoIDV;
                            identificadoresVisualesEnArray.push(apartamentoIDV_preProcesado);
                        });
                        const identificadoresVisualesRepetidos = identificadoresVisualesEnArray.filter((elem, index) => identificadoresVisualesEnArray.indexOf(elem) !== index);
                        if (identificadoresVisualesRepetidos.length > 0) {
                            const error = "Existen identificadores visuales repetidos en el array de apartamentos";
                            throw new Error(error);
                        }
                    }
                    const apartamentosArreglo = [];
                    for (const comportamiento of apartamentos) {
                        const apartamentoIDV = comportamiento.apartamentoIDV;
                        const cantidad = comportamiento.cantidad;
                        const simbolo = comportamiento.simbolo;
                        if (!apartamentoIDV || typeof apartamentoIDV !== "string" || !filtroCadenaSinEspacui.test(apartamentoIDV)) {
                            const error = "El campo apartamentoIDV solo admite minúsculas, numeros y espacios";
                            throw new Error(error);
                        }
                        const validarApartamentoIDV = `
                                  SELECT 
                                  "apartamentoIDV"
                                  FROM 
                                  "configuracionApartamento"
                                  WHERE "apartamentoIDV" = $1
                                  `;
                        const resuelveApartamentoIDV = await conexion.query(validarApartamentoIDV, [apartamentoIDV]);
                        if (resuelveApartamentoIDV.rowCount === 0) {
                            const error = "No existe ningún apartamento con ese identificador visual";
                            throw new Error(error);
                        }
                        const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                        if (!simbolo || typeof simbolo !== "string" ||
                            (
                                simbolo !== "aumentoPorcentaje" &&
                                simbolo !== "aumentoCantidad" &&
                                simbolo !== "reducirCantidad" &&
                                simbolo !== "reducirPorcentaje" &&
                                simbolo !== "precioEstablecido"
                            )) {
                            const error = `El campo simbolo de ${apartamentoUI} solo admite aumentoPorcentaje,aumentoCantidad,reducirCantidad,reducirPorcentaje y precioEstablecido`;
                            throw new Error(error);
                        }
                        if (!cantidad || typeof cantidad !== "string" || !filtroCantidad.test(cantidad)) {
                            const error = `El campo cantidad del ${apartamentoUI} solo admite una cadena con un numero con dos decimales separados por punto, es decir 00.00`;
                            throw new Error(error);
                        }
                        if (cantidad === "00.00") {
                            const error = "No se puede asignar una cantidad de cero";
                            throw new Error(error);
                        }
                        apartamentosArreglo.push(apartamentoIDV);
                    }
                    // Validar nombre unico oferta
                    const validarNombreComportamiento = `
                        SELECT "nombreComportamiento"
                        FROM "comportamientoPrecios"
                        WHERE "nombreComportamiento" = $1
                        `;
                    const consultaValidarNombreComportamiento = await conexion.query(validarNombreComportamiento, [nombreComportamiento]);
                    if (consultaValidarNombreComportamiento.rowCount > 0) {
                        const error = "Ya existe un nombre exactamente igual a este comportamiento de precio, por favor elige otro nombre con el fin de evitar confusiones";
                        throw new Error(error);
                    }
                    // Validacion de unicidad por tipo
                    const dataEvitarDuplicados = {
                        tipo: tipo,
                        transaccion: "crear",
                        apartamentos: apartamentos,
                        fechaInicio_ISO: fechaInicio_ISO,
                        fechaFinal_ISO: fechaFinal_ISO,
                        diasArray: diasArray
                    };

                    await evitarDuplicados(dataEvitarDuplicados);


                    const estadoInicalDesactivado = "desactivado";
                    const crearComportamiento = `
                        INSERT INTO "comportamientoPrecios"
                        (
                            "nombreComportamiento",
                            "fechaInicio",
                            "fechaFinal",
                             estado,
                             tipo,
                             "diasArray"
                        )
                        VALUES
                        (
                            COALESCE($1, NULL),
                            COALESCE($2::date, NULL),
                            COALESCE($3::date, NULL),
                            COALESCE($4, NULL),
                            COALESCE($5, NULL),
                            COALESCE($6::text[], NULL)
                        )
                        RETURNING uid;
                        `;
                    const datos = [
                        nombreComportamiento,
                        fechaInicio_ISO,
                        fechaFinal_ISO,
                        estadoInicalDesactivado,
                        tipo,
                        diasArray
                    ];
                    
                    const resuelveCrearComportamiento = await conexion.query(crearComportamiento, datos);
                    if (resuelveCrearComportamiento.rowCount === 1) {
                        const nuevoUIDComportamiento = resuelveCrearComportamiento.rows[0].uid;
                        for (const comportamiento of apartamentos) {
                            const apartamentoIDV = comportamiento.apartamentoIDV;
                            let cantidad = comportamiento.cantidad;
                            const simbolo = comportamiento.simbolo;
                            const insertarComportamiento = `
                                INSERT INTO "comportamientoPreciosApartamentos"
                                (
                                    "comportamientoUID",
                                    "apartamentoIDV",
                                     cantidad,
                                     simbolo
                                )
                                VALUES
                                (
                                    NULLIF($1::numeric, NULL),
                                    NULLIF($2, NULL),
                                    NULLIF($3::numeric, NULL),
                                    NULLIF($4, NULL)
                                )
                                `;
                            const detalleComportamiento = [
                                nuevoUIDComportamiento,
                                apartamentoIDV,
                                cantidad,
                                simbolo
                            ];
                            const resuelveInsertarComportamiento = await conexion.query(insertarComportamiento, detalleComportamiento);
                            if (resuelveInsertarComportamiento.rowCount === 0) {
                                const error = `Ha ocurrido un error y no se ha podido insertar el apartamento ${apartamentoIDV} en el comportamiento`;
                                throw new Error(error);
                            }
                        }
                        await conexion.query('COMMIT');
                        const ok = {
                            ok: "Se ha creado correctamente el comportamiento",
                            nuevoUIDComportamiento: nuevoUIDComportamiento
                        };
                        salida.json(ok);
                    }
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK');
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                    mutex.release();
                }
            },
            detallesComportamiento: async () => {
                try {
                    const comportamientoUID = entrada.body.comportamientoUID;
                    if (!comportamientoUID || typeof comportamientoUID !== "number" || !Number.isInteger(comportamientoUID) || comportamientoUID <= 0) {
                        const error = "El campo 'comportamientoUID' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    const consultaDetallesComportamiento = `
                        SELECT
                        uid,
                        to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
                        to_char("fechaFinal", 'DD/MM/YYYY') as "fechaFinal", 
                        "nombreComportamiento",
                        estado,
                        tipo,
                        "diasArray"
                        FROM
                        "comportamientoPrecios" 
                        WHERE
                        uid = $1;
                        `;
                    const resuelveConsultaDetallesComportamiento = await conexion.query(consultaDetallesComportamiento, [comportamientoUID]);
                    const detallesComportamiento = resuelveConsultaDetallesComportamiento.rows[0];


                    if (resuelveConsultaDetallesComportamiento.rowCount === 0) {
                        const error = "No existe ninguna comportamiento de precio con ese UID";
                        throw new Error(error);
                    }
                    if (resuelveConsultaDetallesComportamiento.rowCount === 1) {
                        detallesComportamiento["apartamentos"] = [];
                        const detallesApartamentosDedicados = `
                                SELECT
                                cpa.uid,
                                cpa."apartamentoIDV",
                                cpa."cantidad",
                                cpa."comportamientoUID",
                                a."apartamentoUI",
                                cpa."simbolo"
                                FROM 
                                "comportamientoPreciosApartamentos" cpa
                                JOIN
                                apartamentos a ON cpa."apartamentoIDV" = a.apartamento
                                WHERE "comportamientoUID" = $1;
                                `;
                        const resuelveDetallesApartamentosDedicados = await conexion.query(detallesApartamentosDedicados, [comportamientoUID]);
                        if (resuelveDetallesApartamentosDedicados.rowCount > 0) {
                            const apartamentosDedicados = resuelveDetallesApartamentosDedicados.rows;
                            apartamentosDedicados.map((apartamento) => {
                                const cantidad = apartamento.cantidad;
                                const apartamentoIDV = apartamento.apartamentoIDV;
                                const comportamientoUID = apartamento.comportamientoUID;
                                const simbolo = apartamento.simbolo;
                                const apartamentoUI = apartamento.apartamentoUI;
                                const detallesApartamentoDedicado = {
                                    apartamentoIDV: apartamentoIDV,
                                    apartamentoUI: apartamentoUI,
                                    cantidad: cantidad,
                                    comportamientoUID: comportamientoUID,
                                    simbolo: simbolo
                                };
                                detallesComportamiento["apartamentos"].push(detallesApartamentoDedicado);
                            });
                        }
                        const ok = {
                            ok: detallesComportamiento
                        };
                        salida.json(ok);
                    }
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                }
            },
            actualizarComportamiento: async () => {
                await mutex.acquire();
                try {
                    let nombreComportamiento = entrada.body.nombreComportamiento;

                    const comportamientoUID = entrada.body.comportamientoUID;
                    const apartamentos = entrada.body.apartamentos;
                    const tipo = entrada.body.tipo;

                    const filtroCantidad = /^\d+\.\d{2}$/;
                    const filtroNombre = /['"\\;\r\n<>\t\b]/g;
                    const filtroCadenaSinEspacio = /^[a-z0-9]+$/;
                    if (!comportamientoUID || !Number.isInteger(comportamientoUID) || comportamientoUID <= 0) {
                        const error = "El campo comportamientoUID tiene que ser un numero, positivo y entero";
                        throw new Error(error);
                    }
                    if (!nombreComportamiento) {
                        const error = "El campo nombreComportamiento solo admite minúsculas, mayúsculas, numeros y espacios";
                        throw new Error(error);
                    }
                    nombreComportamiento = nombreComportamiento.replace(filtroNombre, '');
                    if (tipo !== "porDias" && tipo !== "porRango") {
                        const error = "Por favor determine si el tipo de bloqueo es porRango o porDias.";
                        throw new Error(error);
                    }
                    let fechaInicio_ISO;
                    let fechaFinal_ISO;
                    let diasArray;
                    await conexion.query('BEGIN'); // Inicio de la transacción

                    if (tipo === "porRango") {
                        const fechaInicio = entrada.body.fechaInicio;
                        const fechaFinal = entrada.body.fechaFinal;

                        const filtroFecha = /^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/)(?:0?[1,3-9]|1[0-2]))\2|(?:(?:0?[1-9])|(?:1[0-9])|(?:2[0-8]))(\/)(?:0?[1-9]|1[0-2]))\3(?:(?:19|20)[0-9]{2})$/;
                        if (!filtroFecha.test(fechaInicio)) {
                            const error = "el formato fecha de inicio no esta correctametne formateado debe ser una cadena asi 00/00/0000";
                            throw new Error(error);
                        }
                        if (!filtroFecha.test(fechaFinal)) {
                            const error = "el formato fecha de fin no esta correctametne formateado debe ser una cadena asi 00/00/0000";
                            throw new Error(error);
                        }


                        const fechaInicioArreglo = fechaInicio.split("/");
                        const diaEntrada = fechaInicioArreglo[0];
                        const mesEntrada = fechaInicioArreglo[1];
                        const anoEntrada = fechaInicioArreglo[2];
                        const fechaFinArreglo = fechaFinal.split("/");
                        const diaSalida = fechaFinArreglo[0];
                        const mesSalida = fechaFinArreglo[1];
                        const anoSalida = fechaFinArreglo[2];
                        fechaInicio_ISO = `${anoEntrada}-${mesEntrada}-${diaEntrada}`;
                        fechaFinal_ISO = `${anoSalida}-${mesSalida}-${diaSalida}`;
                        await validadoresCompartidos.fechas.validarFecha_ISO(fechaInicio_ISO);
                        await validadoresCompartidos.fechas.validarFecha_ISO(fechaFinal_ISO);
                        const fechaInicio_Objeto = new Date(fechaInicio_ISO); // El formato es día/mes/ano
                        const fechaFinal_Objeto = new Date(fechaFinal_ISO);
                        if (fechaInicio_Objeto > fechaFinal_Objeto) {
                            const error = "La fecha de entrada no puede ser superior que la fecha de salida";
                            throw new Error(error);
                        }
                    }
                    if (tipo === "porDias") {
                        diasArray = entrada.body.diasArray;

                        if (typeof diasArray !== 'object' && !Array.isArray(diasArray)) {
                            const error = "El campo diasArray solo admite un arreglo";
                            throw new Error(error);
                        }
                        if (diasArray.length === 0) {
                            const error = "Seleccione al menos un dia por favor.";
                            throw new Error(error);
                        }

                        // Control elemento repetidos
                        const contador = {};
                        for (const elemento of diasArray) {
                            if (typeof elemento !== "string") {
                                const error = "En el array solo se esperan strings, revisa el array por que hay elemento que no son cadenas.";
                                throw new Error(error);
                            }
                            const filtroElemento = String(elemento).toLocaleLowerCase();
                            if (contador[filtroElemento]) {
                                const error = "En el array de diasArray no puede haber dos elementos repetidos";
                                throw new Error(error);
                            } else {
                                contador[filtroElemento] = 1;
                            }
                        }

                        const diasIDV = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
                        const elementosNoEnArray = (diasArray, diasIDV) => {
                            return diasArray.filter(elemento => !diasIDV.includes(elemento));
                        };

                        const elementosNoEnArreglo2 = elementosNoEnArray(diasArray, diasIDV);
                        if (elementosNoEnArreglo2.length > 0) {
                            const error = "En el array de diasSeleccionados no se reconoce: " + elementosNoEnArreglo2;
                            throw new Error(error);
                        }
                    }
                    if (typeof apartamentos !== 'object' && !Array.isArray(apartamentos)) {
                        const error = "El campo apartamentos solo admite un arreglo";
                        throw new Error(error);
                    }
                    if (apartamentos.length === 0) {
                        const error = "Anada al menos un apartmento dedicado";
                        throw new Error(error);
                    } else {
                        const identificadoresVisualesEnArray = [];
                        apartamentos.forEach((apart) => {
                            if (typeof apart !== "object" || Array.isArray(apart) || apart === null) {
                                const error = "Dentro del array de apartamentos se esperaba un objeto";
                                throw new Error(error);
                            }
                            const apartamentoIDV_preProcesado = apart.apartamentoIDV;
                            identificadoresVisualesEnArray.push(apartamentoIDV_preProcesado);
                        });
                        const identificadoresVisualesRepetidos = identificadoresVisualesEnArray.filter((elem, index) => identificadoresVisualesEnArray.indexOf(elem) !== index);
                        if (identificadoresVisualesRepetidos.length > 0) {
                            const error = "Existen identificadores visuales repetidos en el array de apartamentos";
                            throw new Error(error);
                        }
                    }

                    if (typeof apartamentos !== 'object' && !Array.isArray(apartamentos)) {
                        const error = "El campo apartamentos solo admite un arreglo";
                        throw new Error(error);
                    }
                    if (apartamentos.length === 0) {
                        const error = "Anada al menos un apartmento dedicado";
                        throw new Error(error);
                    }
                    const apartamentosArreglo = [];
                    for (const comportamiento of apartamentos) {
                        const apartamentoIDV = comportamiento.apartamentoIDV;
                        const cantidad = comportamiento.cantidad;
                        const simbolo = comportamiento.simbolo;
                        if (!apartamentoIDV || typeof apartamentoIDV !== "string" || !filtroCadenaSinEspacio.test(apartamentoIDV)) {
                            const error = "El campo apartamentoIDV solo admite minúsculas, numeros y espacios";
                            throw new Error(error);
                        }
                        //Validar existencia del apartamento
                        // Validar nombre unico oferta
                        const validarApartamentoIDV = `
                                  SELECT 
                                  "apartamentoIDV"
                                  FROM 
                                  "configuracionApartamento"
                                  WHERE "apartamentoIDV" = $1
                                  `;
                        const resuelveApartamentoIDV = await conexion.query(validarApartamentoIDV, [apartamentoIDV]);
                        if (resuelveApartamentoIDV.rowCount === 0) {
                            const error = "No existe ningún apartamento con ese identificador visual";
                            throw new Error(error);
                        }
                        const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                        if (!simbolo || typeof simbolo !== "string" ||
                            (
                                simbolo !== "aumentoPorcentaje" &&
                                simbolo !== "aumentoCantidad" &&
                                simbolo !== "reducirCantidad" &&
                                simbolo !== "reducirPorcentaje" &&
                                simbolo !== "precioEstablecido"
                            )) {
                            const error = `El campo simbolo de ${apartamentoUI} solo admite aumentoPorcentaje,aumentoCantidad,reducirCantidad,reducirPorcentaje y precioEstablecido`;
                            throw new Error(error);
                        }
                        if (!cantidad || typeof cantidad !== "string" || !filtroCantidad.test(cantidad)) {
                            const error = `El campo cantidad del ${apartamentoUI} solo admite una cadena con un numero con dos decimales separados por punto, es decir 00.00`;
                            throw new Error(error);
                        }
                        if (cantidad === "00.00") {
                            const error = "No se puede asignar una cantidad de cero";
                            throw new Error(error);
                        }
                        apartamentosArreglo.push(apartamentoIDV);
                    }
                    // Validar nombre unico oferta
                    const validarComportamiento = `
                        SELECT 
                        estado
                        FROM 
                        "comportamientoPrecios"
                        WHERE uid = $1
                        `;
                    const resuelveValidarComportamiento = await conexion.query(validarComportamiento, [comportamientoUID]);
                    if (resuelveValidarComportamiento.rowCount === 0) {
                        const error = "No existe ningún comportamiento de precios con ese identificador";
                        throw new Error(error);
                    }
                    const estadoComportamiento = resuelveValidarComportamiento.rows[0].estado;
                    if (estadoComportamiento === "activado") {
                        const error = "No se puede modificar un comportamiento de precio que esta activo. Primero desativalo con el boton de estado de color rojo en la parte superior izquierda, al lado del nombre.";
                        throw new Error(error);
                    }
                    const dataEvitarDuplicados = {
                        comportamientoUID: comportamientoUID,
                        tipo: tipo,
                        transaccion: "actualizar",
                        apartamentos: apartamentos,
                        fechaInicio_ISO: fechaInicio_ISO,
                        fechaFinal_ISO: fechaFinal_ISO,
                        diasArray: diasArray
                    };

                    await evitarDuplicados(dataEvitarDuplicados);

                    const actualizarComportamiento = `
                        UPDATE "comportamientoPrecios"
                        SET 
                        "nombreComportamiento" = $1,
                        "fechaInicio" = $2,
                        "fechaFinal" = $3,
                        tipo = $4,
                        "diasArray" = $5
                        WHERE uid = $6
                        RETURNING *;
                        `;
                    const datos = [
                        nombreComportamiento,
                        fechaInicio_ISO,
                        fechaFinal_ISO,
                        tipo,
                        diasArray,
                        comportamientoUID
                    ];
                    const resuelveActualizarComportamiento = await conexion.query(actualizarComportamiento, datos);
                    if (resuelveActualizarComportamiento.rowCount === 1) {
                        const eliminarComportamiento = `
                            DELETE FROM "comportamientoPreciosApartamentos"
                            WHERE "comportamientoUID" = $1 ;
                            `;
                        await conexion.query(eliminarComportamiento, [comportamientoUID]);
                        const filtroCadenaSinEspacui = /^[a-z0-9]+$/;
                        for (const comportamiento of apartamentos) {
                            const apartamentoIDV = comportamiento.apartamentoIDV;
                            const simbolo = comportamiento.simbolo;
                            let cantidadPorApartamento = comportamiento.cantidad;
                            if (!apartamentoIDV || !filtroCadenaSinEspacui.test(apartamentoIDV)) {
                                const error = "El campo apartamentoIDV solo admite minúsculas, numeros y espacios";
                                throw new Error(error);
                            }
                            if (!simbolo ||
                                (
                                    simbolo !== "aumentoPorcentaje" &&
                                    simbolo !== "aumentoCantidad" &&
                                    simbolo !== "reducirCantidad" &&
                                    simbolo !== "reducirPorcentaje" &&
                                    simbolo !== "precioEstablecido"
                                )) {
                                const error = "El campo simbolo solo admite aumentoPorcentaje,aumentoCantidad,reducirCantidad,reducirPorcentaje y precioEstablecido";
                                throw new Error(error);
                            }
                            if (!cantidadPorApartamento || !filtroCantidad.test(cantidadPorApartamento)) {
                                const error = "El campo cantidad solo admite una cadena con un numero con dos decimales separados por punto. Asegurate de escribir los decimales";
                                throw new Error(error);
                            }
                            cantidadPorApartamento = Number(cantidadPorApartamento);
                            if (cantidadPorApartamento === 0) {
                                const error = "No se puede asignar una cantidad de cero por seguridad";
                                throw new Error(error);
                            }
                            const actualizarComportamientoDedicado = `
                                    INSERT INTO "comportamientoPreciosApartamentos"
                                (
                                    "apartamentoIDV",
                                    simbolo,
                                    cantidad,
                                    "comportamientoUID"
                                )
                                    VALUES
                                (
                                    NULLIF($1, NULL),
                                    COALESCE($2, NULL),
                                    COALESCE($3::numeric, NULL),
                                    NULLIF($4::numeric, NULL)
                                )
                                    RETURNING *;
                            
                                    `;
                            const comportamientoDedicado = [
                                apartamentoIDV,
                                simbolo,
                                cantidadPorApartamento,
                                comportamientoUID
                            ];
                            await conexion.query(actualizarComportamientoDedicado, comportamientoDedicado);
                        }
                        await conexion.query('COMMIT'); // Confirmar la transacción
                        const ok = {
                            ok: "El comportamiento se ha actualizado bien junto con los apartamentos dedicados",
                        };
                        salida.json(ok);
                    }
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                    mutex.release();
                }
            },
            eliminarComportamiento: async () => {
                await mutex.acquire();
                try {
                    const comportamientoUID = entrada.body.comportamientoUID;
                    if (!comportamientoUID || !Number.isInteger(comportamientoUID) || comportamientoUID <= 0) {
                        const error = "El campo ofertaUID tiene que ser un numero, positivo y entero";
                        throw new Error(error);
                    }
                    // Validar nombre unico oferta
                    const validarComportamiento = `
                        SELECT uid
                        FROM "comportamientoPrecios"
                        WHERE uid = $1;
                        `;
                    const resuelveValidarComportamiento = await conexion.query(validarComportamiento, [comportamientoUID]);
                    if (resuelveValidarComportamiento.rowCount === 0) {
                        const error = "No existe el comportamiento, revisa el UID introducie en el campo comportamientoUID, recuerda que debe de ser un numero";
                        throw new Error(error);
                    }
                    await conexion.query('BEGIN'); // Inicio de la transacción
                    const eliminarComportamiento = `
                        DELETE FROM "comportamientoPrecios"
                        WHERE uid = $1;
                        `;
                    const resuelveEliminarComportamiento = await conexion.query(eliminarComportamiento, [comportamientoUID]);
                    if (resuelveEliminarComportamiento.rowCount === 1) {
                        const ok = {
                            ok: "Se ha eliminado el comportamiento correctamente",
                        };
                        salida.json(ok);
                    }
                    await conexion.query('COMMIT'); // Confirmar la transacción
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                    mutex.release();
                }
            },
            actualizarEstadoComportamiento: async () => {
                await mutex.acquire();
                try {
                    const comportamientoUID = entrada.body.comportamientoUID;
                    const estadoPropuesto = entrada.body.estadoPropuesto;
                    const filtroCadena = /^[a-z]+$/;
                    if (!comportamientoUID || !Number.isInteger(comportamientoUID) || comportamientoUID <= 0) {
                        const error = "El campo comportamientoUID tiene que ser un numero, positivo y entero";
                        throw new Error(error);
                    }
                    if (!estadoPropuesto || !filtroCadena.test(estadoPropuesto) || (estadoPropuesto !== "activado" && estadoPropuesto !== "desactivado")) {
                        const error = "El campo estadoPropuesto solo admite minúsculas y nada mas, debe de ser un estado activado o desactivado";
                        throw new Error(error);
                    }
                    // Validar nombre unico oferta
                    const validarOferta = `
                        SELECT uid
                        FROM "comportamientoPrecios"
                        WHERE uid = $1;
                        `;
                    const resuelveValidarOferta = await conexion.query(validarOferta, [comportamientoUID]);
                    if (resuelveValidarOferta.rowCount === 0) {
                        const error = "No existe al oferta, revisa el UID introducie en el campo comportamientoUID, recuerda que debe de ser un number";
                        throw new Error(error);
                    }
                    await conexion.query('BEGIN'); // Inicio de la transacción
                    const actualizarEstadoOferta = `
                        UPDATE "comportamientoPrecios"
                        SET estado = $1
                        WHERE uid = $2
                        RETURNING estado;
                        `;
                    const datos = [
                        estadoPropuesto,
                        comportamientoUID
                    ];
                    const resuelveEstadoOferta = await conexion.query(actualizarEstadoOferta, datos);
                    const ok = {
                        ok: "El estado del comportamiento se ha actualziado correctamente",
                        estadoComportamiento: resuelveEstadoOferta.rows[0].estado
                    };
                    salida.json(ok);
                    await conexion.query('COMMIT'); // Confirmar la transacción
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                    mutex.release();
                }
            },
            precioRangoApartamentos: async () => {
                try {
                    const fechaEntrada = entrada.body.fechaEntrada;
                    const fechaSalida = entrada.body.fechaSalida;
                    const apartamentosIDVArreglo = entrada.body.apartamentosIDVArreglo;
                    const filtroCadenaSinEspacio = /^[a-z0-9]+$/;
                    const filtroFecha = /^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/)(?:0?[1,3-9]|1[0-2]))\2|(?:(?:0?[1-9])|(?:1[0-9])|(?:2[0-8]))(\/)(?:0?[1-9]|1[0-2]))\3(?:(?:19|20)[0-9]{2})$/;
                    if (!filtroFecha.test(fechaEntrada)) {
                        const error = "el formato fecha de inicio no esta correctametne formateado debe ser una cadena asi 00/00/0000";
                        throw new Error(error);
                    }
                    if (!filtroFecha.test(fechaSalida)) {
                        const error = "el formato fecha de fin no esta correctametne formateado debe ser una cadena asi 00/00/0000";
                        throw new Error(error);
                    }
                    if (typeof apartamentosIDVArreglo !== 'object' && !Array.isArray(apartamentosIDVArreglo)) {
                        const error = "El campo apartamentosIDVArreglo solo admite un arreglo";
                        throw new Error(error);
                    }
                    if (apartamentosIDVArreglo.length === 0) {
                        const error = "Anada al menos un apartmentoIDV en el arreglo";
                        throw new Error(error);
                    }
                    for (const apartamentoIDV of apartamentosIDVArreglo) {
                        if (!filtroCadenaSinEspacio.test(apartamentoIDV)) {
                            const error = "El identificador visual del apartmento, el apartmentoIDV solo puede estar hecho de minuscuals y numeros y nada mas, ni espacios";
                            throw new Error(error);
                        }
                    }
                    const metadatos = {
                        fechaEntrada: fechaEntrada,
                        fechaSalida: fechaSalida,
                        apartamentosIDVArreglo: apartamentosIDVArreglo
                    };
                    const preciosApartamentosResuelos = await precioRangoApartamento(metadatos);
                    const ok = {
                        ok: preciosApartamentosResuelos
                    };
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                }
            }
        },
        bloqueos: {
            IDX: {
                ROL: ["administrador", "empleado"]
            },
            listarApartamentosConBloqueos: {
                IDX: {
                    ROL: [
                        "administrador",
                        "empleado"
                    ]
                },
                X: async () => {
                    try {
                        await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado();
                        const consultaApartamentosConBloqueo = `
                        SELECT
                        uid,
                        to_char(entrada, 'DD/MM/YYYY') as entrada, 
                        to_char(salida, 'DD/MM/YYYY') as salida, 
                        apartamento,
                        "tipoBloqueo"
                        FROM "bloqueosApartamentos";`;
                        const resuelveApartamentosBloqueados = await conexion.query(consultaApartamentosConBloqueo);
                        const ok = {};
                        if (resuelveApartamentosBloqueados.rowCount === 0) {
                            ok.ok = [];
                        }
                        if (resuelveApartamentosBloqueados.rowCount > 0) {
                            const bloqueosEncontrados = resuelveApartamentosBloqueados.rows;
                            const apartamentosEncontradosConDuplicados = [];
                            bloqueosEncontrados.map((detalleBloqueo) => {
                                const apartamento = detalleBloqueo.apartamento;
                                apartamentosEncontradosConDuplicados.push(apartamento);
                            });
                            const apartamentosEncontrados = [...new Set(apartamentosEncontradosConDuplicados)];
                            const estructuraSalidaFinal = [];
                            for (const apartamento of apartamentosEncontrados) {
                                const apartamentoUI = await resolverApartamentoUI(apartamento);
                                const conteoDeBloqueosPorApartamento = `
                                SELECT
                                apartamento
                                FROM "bloqueosApartamentos"
                                WHERE apartamento = $1;`;
                                const resuelveConteoDeBloqueosPorApartamento = await conexion.query(conteoDeBloqueosPorApartamento, [apartamento]);
                                const numeroDeBloqueosPorApartamento = resuelveConteoDeBloqueosPorApartamento.rowCount;
                                const estructuraFinal = {
                                    apartamentoIDV: apartamento,
                                    apartamentoUI: apartamentoUI,
                                    numeroDeBloqueos: numeroDeBloqueosPorApartamento,
                                };
                                estructuraSalidaFinal.push(estructuraFinal);
                            }
                            ok.ok = estructuraSalidaFinal;
                        }
                        salida.json(ok);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    }
                }
            },
            listaBloquoeosDelApartamento: {
                IDX: {
                    ROL: [
                        "administrador",
                        "empleado"
                    ]
                },
                X: async () => {
                    try {
                        const apartamentoIDV = entrada.body.apartamentoIDV;
                        const filtroCadena = /^[a-z0-9]+$/;
                        if (!filtroCadena.test(apartamentoIDV) || typeof apartamentoIDV !== "string") {
                            const error = "el campo 'apartmentoIDV' solo puede ser una cadena de letras minúsculas y numeros sin espacios.";
                            throw new Error(error);
                        }
                        await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado();

                        const validarApartmento = `
                            SELECT
                            uid
                            FROM "configuracionApartamento"
                            WHERE "apartamentoIDV" = $1;`;
                        const resuelveValidarApartamentoIDV = await conexion.query(validarApartmento, [apartamentoIDV]);
                        if (resuelveValidarApartamentoIDV.rowCount === 0) {
                            const error = "No existe ningún apartamento con el identicados visual apartmentoIDV que has pasado.";
                            throw new Error(error);
                        }

                        const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                        const consultaDetallesBloqueoApartamento = `
                                SELECT
                                uid,
                                to_char(entrada, 'DD/MM/YYYY') as entrada, 
                                to_char(salida, 'DD/MM/YYYY') as salida, 
                                apartamento,
                                "tipoBloqueo",
                                motivo,
                                zona
                                FROM "bloqueosApartamentos"
                                WHERE apartamento = $1;`;
                        const resuelveBloqueosPorApartmento = await conexion.query(consultaDetallesBloqueoApartamento, [apartamentoIDV]);
                        const ok = {};
                        if (resuelveBloqueosPorApartmento.rowCount === 0) {
                            ok.apartamentoIDV = apartamentoIDV;
                            ok.apartamentoUI = apartamentoUI;
                            ok.ok = [];
                        }
                        if (resuelveBloqueosPorApartmento.rowCount > 0) {
                            const bloqueosEncontradosDelApartamento = resuelveBloqueosPorApartmento.rows;
                            const bloqueosDelApartamentoEntonctrado = [];
                            bloqueosEncontradosDelApartamento.map((bloqueoDelApartamento) => {
                                const uidBloqueo = bloqueoDelApartamento.uid;
                                const tipoBloqueo = bloqueoDelApartamento.tipoBloqueo;
                                const entrada = bloqueoDelApartamento.entrada;
                                const salida = bloqueoDelApartamento.salida;
                                const motivo = bloqueoDelApartamento.motivo;
                                const zona = bloqueoDelApartamento.zona;
                                const estructuraBloqueo = {
                                    uidBloqueo: uidBloqueo,
                                    tipoBloqueo: tipoBloqueo,
                                    entrada: entrada,
                                    salida: salida,
                                    motivo: motivo,
                                    zona: zona
                                };
                                bloqueosDelApartamentoEntonctrado.push(estructuraBloqueo);
                            });
                            ok.apartamentoIDV = apartamentoIDV;
                            ok.apartamentoUI = apartamentoUI;
                            ok.ok = bloqueosDelApartamentoEntonctrado;
                        }
                        salida.json(ok);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    }
                }
            },
            detallesDelBloqueo: {
                IDX: {
                    ROL: [
                        "administrador",
                        "empleado"
                    ]
                },
                X: async () => {
                    try {
                        const apartamentoIDV = entrada.body.apartamentoIDV;
                        const bloqueoUID = entrada.body.bloqueoUID;
                        const filtroCadena = /^[a-z0-9]+$/;
                        if (!filtroCadena.test(apartamentoIDV) || typeof apartamentoIDV !== "string") {
                            const error = "el campo 'apartmentoIDV' solo puede ser una cadena de letras minúsculas y numeros sin espacios.";
                            throw new Error(error);
                        }
                        if (typeof bloqueoUID !== "number" || !Number.isInteger(bloqueoUID) && bloqueoUID <= 0) {
                            const error = "la clave 'bloqueoUID' debe de tener un dato tipo 'number', positivo y entero";
                            throw new Error(error);
                        }
                        await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado();
                        const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                        const consultaDetallesBloqueo = `
                        SELECT
                        uid,
                        to_char(entrada, 'DD/MM/YYYY') as entrada, 
                        to_char(salida, 'DD/MM/YYYY') as salida, 
                        apartamento,
                        "tipoBloqueo",
                        motivo,
                        zona
                        FROM "bloqueosApartamentos"
                        WHERE apartamento = $1 AND uid = $2;`;
                        const resuelveConsultaDetallesBloqueo = await conexion.query(consultaDetallesBloqueo, [apartamentoIDV, bloqueoUID]);
                        if (resuelveConsultaDetallesBloqueo.rowCount === 0) {
                            const error = "No existe el bloqueo, comprueba el apartamentoIDV y el bloqueoUID";
                            throw new Error(error);
                        }
                        if (resuelveConsultaDetallesBloqueo.rowCount === 1) {
                            const bloqueosEncontradosDelApartamento = resuelveConsultaDetallesBloqueo.rows[0];
                            const uidBloqueo = bloqueosEncontradosDelApartamento.uid;
                            const tipoBloqueo = bloqueosEncontradosDelApartamento.tipoBloqueo;
                            const entrada = bloqueosEncontradosDelApartamento.entrada;
                            const salida_ = bloqueosEncontradosDelApartamento.salida;
                            const motivo = bloqueosEncontradosDelApartamento.motivo;
                            const zona = bloqueosEncontradosDelApartamento.zona;
                            const estructuraBloqueo = {
                                uidBloqueo: uidBloqueo,
                                tipoBloqueo: tipoBloqueo,
                                entrada: entrada,
                                salida: salida_,
                                motivo: motivo,
                                zona: zona
                            };
                            const ok = {};
                            ok.apartamentoIDV = apartamentoIDV;
                            ok.apartamentoUI = apartamentoUI;
                            ok.ok = estructuraBloqueo;
                            salida.json(ok);
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    }
                }
            },
            eliminarBloqueo: {
                IDX: {
                    ROL: [
                        "administrador"
                    ]
                },
                X: async () => {
                    try {
                        const bloqueoUID = entrada.body.bloqueoUID;
                        if (typeof bloqueoUID !== "number" || !Number.isInteger(bloqueoUID) && bloqueoUID <= 0) {
                            const error = "la clave 'bloqueoUID' debe de tener un dato tipo 'number', positivo y entero";
                            throw new Error(error);
                        }
                        const seleccionarBloqueo = await conexion.query(`SELECT uid, apartamento FROM "bloqueosApartamentos" WHERE uid = $1`, [bloqueoUID]);
                        if (seleccionarBloqueo.rowCount === 0) {
                            const error = "No existe el bloqueo que se quiere eliminar.";
                            throw new Error(error);
                        }
                        const apartmamentoIDV = seleccionarBloqueo.rows[0].apartamento;
                        const ContarBloqueosPorApartamento = await conexion.query(`SELECT apartamento FROM "bloqueosApartamentos" WHERE apartamento = $1`, [apartmamentoIDV]);
                        let tipoDeRetroceso;
                        if (ContarBloqueosPorApartamento.rowCount === 1) {
                            tipoDeRetroceso = "aPortada";
                        }
                        if (ContarBloqueosPorApartamento.rowCount > 1) {
                            tipoDeRetroceso = "aApartamento";
                        }
                        const eliminarBloqueo = `
                                DELETE FROM "bloqueosApartamentos"
                                WHERE uid = $1;
                                `;
                        const resuelveEliminarBloqueo = await conexion.query(eliminarBloqueo, [bloqueoUID]);
                        if (resuelveEliminarBloqueo.rowCount === 0) {
                            const error = "No se ha eliminado el bloqueo";
                            throw new Error(error);
                        }
                        if (resuelveEliminarBloqueo.rowCount === 1) {
                            const ok = {
                                ok: "Se ha eliminado el bloqueo correctamente",
                                tipoRetroceso: tipoDeRetroceso
                            };
                            salida.json(ok);
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    }
                }
            },
            eliminarBloqueoCaducado: async () => {
                try {
                    const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
                    const tiempoZH = DateTime.now().setZone(zonaHoraria);
                    const fechaActual_ISO = tiempoZH.toISODate();
                    const eliminarBloqueo = `
                        DELETE FROM "bloqueosApartamentos"
                        WHERE salida < $1;
                        `;
                    await conexion.query(eliminarBloqueo, [fechaActual_ISO]);
                } catch (errorCapturado) {
                    throw errorCapturado;
                }
            },
            modificarBloqueo: {
                IDX: {
                    ROL: [
                        "administrador"
                    ]
                },
                X: async () => {
                    try {
                        const bloqueoUID = entrada.body.bloqueoUID;
                        const tipoBloqueo = entrada.body.tipoBloqueo;
                        const motivo = entrada.body.motivo;
                        const zona = entrada.body.zonaBloqueo;
                        if (typeof bloqueoUID !== "number" || !Number.isInteger(bloqueoUID) && bloqueoUID <= 0) {
                            const error = "la clave 'bloqueoUID' debe de tener un dato tipo 'number', positivo y entero";
                            throw new Error(error);
                        }
                        if (tipoBloqueo !== "permanente" && tipoBloqueo !== "rangoTemporal") {
                            const error = "tipoBloqueo solo puede ser permanente o rangoTemporal";
                            throw new Error(error);
                        }
                        if (zona !== "global" && zona !== "publico" && zona !== "privado") {
                            const error = "zona solo puede ser global, publico o privado";
                            throw new Error(error);
                        }
                        const filtroTextoSimple = /^[^'"]+$/;
                        const validarFechaInicioSuperiorFechaFinal = async (fechaInicio_ISO, fechaFin_ISO) => {
                            const fechaInicio_Objeto = DateTime.fromISO(fechaInicio_ISO);
                            const fechaFin_Objeto = DateTime.fromISO(fechaFin_ISO);
                            if (fechaInicio_Objeto > fechaFin_Objeto) {
                                const error = "La fecha de inicio del bloqueo no puede ser inferior a la fecha de fin del bloqueo, si puede ser igual para determinar un solo dia";
                                throw new Error(error);
                            }
                            const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
                            const tiempoZH = DateTime.now().setZone(zonaHoraria).startOf('day');
                            const fechaFin_TZ_Objeto = DateTime.fromISO(fechaFin_ISO, { zone: zonaHoraria });
                            if (tiempoZH > fechaFin_TZ_Objeto) {
                                const error = "La fecha de fin del bloqueo no puede ser inferior a la fecha actual porque estarías creando un bloqueo enteramente en el pasado. Puedes crear un bloqueo que empieza en el pasado, pero debe que acabar en el futuro o en hoy. Los bloqueo que acaban en el pasado son automaticamente borrados por ser bloqueos caducos.";
                                throw new Error(error);
                            }
                        };
                        await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado();
                        let fechaInicio_ISO = null;
                        let fechaFin_ISO = null;
                        const seleccionarBloqueo = await conexion.query(`SELECT uid FROM "bloqueosApartamentos" WHERE uid = $1`, [bloqueoUID]);
                        if (seleccionarBloqueo.rowCount === 0) {
                            const error = "No existe el bloqueo, revisa el bloqueoUID";
                            throw new Error(error);
                        }
                        if (tipoBloqueo === "rangoTemporal") {
                            const fechaInicio_Humano = entrada.body.fechaInicio;
                            const fechaFin_Humano = entrada.body.fechaFin;
                            const consultaFechasBloqueoActual = `
                            SELECT
                            to_char(entrada, 'DD/MM/YYYY') as "fechaInicioBloqueo_ISO", 
                            to_char(salida, 'DD/MM/YYYY') as "fechaFinBloqueo_ISO"
                            FROM 
                            "bloqueosApartamentos"
                            WHERE
                            uid = $1`;
                            const validarFechaInicioExistente = await conexion.query(consultaFechasBloqueoActual, [bloqueoUID]);
                            const fechaInicioBloqueo_ISO = validarFechaInicioExistente.rows[0].fechaInicioBloqueo_ISO;
                            const fechaFinBloqueo_ISO = validarFechaInicioExistente.rows[0].fechaFinBloqueo_ISO;
                            if (fechaInicio_Humano !== null) {
                                fechaInicio_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaInicio_Humano)).fecha_ISO;
                                await validarFechaInicioSuperiorFechaFinal(fechaInicio_ISO, fechaFinBloqueo_ISO);
                            }
                            if (fechaFin_Humano !== null) {
                                fechaFin_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaFin_Humano)).fecha_ISO;
                                await validarFechaInicioSuperiorFechaFinal(fechaInicioBloqueo_ISO, fechaFin_ISO);
                            }
                        }
                        if (motivo && !filtroTextoSimple.test(motivo)) {
                            const error = "Por temas de seguridad ahora mismo en el campo motivo, solo pueden aceptarse minúsculas, mayúsculas, espacio y numeros. Mas adelante se aceptaran todos los caracteres";
                            throw new Error(error);
                        }

                        const modificarBloqueo = `
                        UPDATE "bloqueosApartamentos"
                        SET 
                        "tipoBloqueo" = COALESCE($1, "tipoBloqueo"),
                        entrada = COALESCE($2, entrada),
                        salida = COALESCE($3, salida),
                        motivo = COALESCE($4, motivo),
                        zona = COALESCE($5, zona)
                        WHERE uid = $6;
                        `;
                        const datosParaActualizar = [
                            tipoBloqueo,
                            fechaInicio_ISO,
                            fechaFin_ISO,
                            motivo,
                            zona,
                            bloqueoUID
                        ];
                        const resuelveModificarBloqueo = await conexion.query(modificarBloqueo, datosParaActualizar);
                        if (resuelveModificarBloqueo.rowCount === 0) {
                            const error = "No se ha podido actualizar el bloqueo con los nuevo datos.";
                            throw new Error(error);
                        }
                        if (resuelveModificarBloqueo.rowCount === 1) {
                            const ok = {
                                ok: "Se ha actualizado el bloqueo correctamente"
                            };
                            salida.json(ok);
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    }
                }
            },
            crearNuevoBloqueo: {
                IDX: {
                    ROL: [
                        "administrador"
                    ]
                },
                X: async () => {
                    try {
                        const apartamentoIDV = entrada.body.apartamentoIDV;
                        let tipoBloqueo = entrada.body.tipoBloqueo;
                        let motivo = entrada.body.motivo;
                        let zonaUI = entrada.body.zonaUI;
                        const filtroApartamentoIDV = /^[a-z0-9]+$/;
                        if (!apartamentoIDV || typeof apartamentoIDV !== "string" || !filtroApartamentoIDV.test(apartamentoIDV)) {
                            const error = "el campo 'apartmentoIDV' solo puede ser letras minúsculas y numeros. Sin pesacios en formato cadena";
                            throw new Error(error);
                        }
                        await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado();
                        const validarApartamenotIDV = `
                        SELECT
                        *
                        FROM "configuracionApartamento"
                        WHERE "apartamentoIDV" = $1;`;
                        const resuelveValidarApartmento = await conexion.query(validarApartamenotIDV, [apartamentoIDV]);
                        if (resuelveValidarApartmento.rowCount === 0) {
                            const error = "No existe el identificador del apartamento";
                            throw new Error(error);
                        }
                        if (tipoBloqueo !== "permanente" && tipoBloqueo !== "rangoTemporal") {
                            const error = "tipoBloqueo solo puede ser permanente o rangoTemporal";
                            throw new Error(error);
                        }
                        if (zonaUI !== "global" && zonaUI !== "publico" && zonaUI !== "privado") {
                            const error = "zona solo puede ser global, publico o privado";
                            throw new Error(error);
                        }
                        const filtroTextoSimple = /^[a-zA-Z0-9\s]+$/;
                        let fechaInicio_ISO = null;
                        let fechaFin_ISO = null;
                        if (tipoBloqueo === "rangoTemporal") {
                            const fechaInicio = entrada.body.fechaInicio;
                            const fechaFin = entrada.body.fechaFin;
                            fechaInicio_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaInicio)).fecha_ISO;
                            fechaFin_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaFin)).fecha_ISO;
                            const fechaInicio_Objeto = DateTime.fromISO(fechaInicio_ISO);
                            const fechaFin_Objeto = DateTime.fromISO(fechaFin_ISO);
                            if (fechaInicio_Objeto > fechaFin_Objeto) {
                                const error = "La fecha de inicio del bloqueo no puede ser inferior a la fecha de fin del bloqueo, si puede ser igual para determinar un solo día.";
                                throw new Error(error);
                            }
                            const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
                            const tiempoZH = DateTime.now().setZone(zonaHoraria).startOf('day');
                            const fechaFin_TZ_Objeto = DateTime.fromISO(fechaFin_ISO, { zone: zonaHoraria });
                            if (tiempoZH > fechaFin_TZ_Objeto) {
                                const error = "La fecha de fin del bloqueo no puede ser inferior a la fecha actual porque estarías creando un bloqueo enteramente en el pasado. Puedes crear un bloqueo que empieza en el pasado, pero debe que acabar en el futuro o en hoy. Los bloqueo que acaban en el pasado son automaticamente borrados por ser bloqueos caducos.";
                                throw new Error(error);
                            }
                        }
                        if (motivo) {
                            if (!filtroTextoSimple.test(motivo)) {
                                const error = "Por temas de seguridad ahora mismo en el campo motivo, solo pueden aceptarse minúsculas, mayúsculas, espacio y números. Mas adelante se aceptarán todos los caracteres.";
                                throw new Error(error);
                            }
                        } else {
                            motivo = null;
                        }
                        const insertarNuevoBloqueo = `
                            INSERT INTO "bloqueosApartamentos"
                            (
                            apartamento,
                            "tipoBloqueo",
                            entrada,
                            salida,
                            motivo,
                            zona
                            )
                            VALUES ($1, $2, $3, $4, $5, $6) RETURNING uid
                            `;
                        const datosNuevoBloqueo = [
                            apartamentoIDV,
                            tipoBloqueo,
                            fechaInicio_ISO,
                            fechaFin_ISO,
                            motivo,
                            zonaUI
                        ];
                        const resuelveInsertarNuevoBloqueo = await conexion.query(insertarNuevoBloqueo, datosNuevoBloqueo);
                        if (resuelveInsertarNuevoBloqueo.rowCount === 0) {
                            const error = "No se ha podido insertar el nuevo bloqueo";
                            throw new Error(error);
                        }
                        if (resuelveInsertarNuevoBloqueo.rowCount === 1) {
                            const nuevoUIDBloqueo = resuelveInsertarNuevoBloqueo.rows[0].uid;
                            const ok = {
                                ok: "Se ha creado el bloqueo correctamente",
                                nuevoBloqueoUID: nuevoUIDBloqueo,
                                apartamentoIDV: apartamentoIDV
                            };
                            salida.json(ok);
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    }
                }
            }
        },
        enlacesDePago: {
            obtenerEnlaces: async () => {
                try {
                    await controlCaducidadEnlacesDePago();
                    const consultaEnlaces = `
                        SELECT
                        "nombreEnlace", 
                        reserva,
                        codigo,
                        "enlaceUID",
                        caducidad,
                        cantidad,
                        "estadoPago",
                        descripcion
                        FROM "enlacesDePago"
                        ORDER BY 
                        "enlaceUID" DESC;`;
                    const resuelveConsultaEnlaces = await conexion.query(consultaEnlaces);
                    const ok = {
                        ok: []
                    };
                    if (resuelveConsultaEnlaces.rowCount > 0) {
                        const enlacesGenerados = resuelveConsultaEnlaces.rows;
                        for (const detallesEnlace of enlacesGenerados) {
                            const nombreEnlace = detallesEnlace.nombreEnlace;
                            const enlaceUID = detallesEnlace.enlaceUID;
                            const reservaUID = detallesEnlace.reserva;
                            const codigo = detallesEnlace.codigo;
                            const estadoPago = detallesEnlace.estadoPago;
                            const cantidad = detallesEnlace.cantidad;
                            const descripcion = detallesEnlace.descripcion;
                            const totalIDV = "totalConImpuestos";
                            const consultaPrecioCentralizado = `
                                SELECT
                                "totalConImpuestos"
                                FROM "reservaTotales"
                                WHERE 
                                    reserva = $1;`;
                            const resuelveConsultaPrecioCentralizado = await conexion.query(consultaPrecioCentralizado, [reservaUID]);
                            let precio;
                            if (resuelveConsultaPrecioCentralizado.rowCount === 0) {
                                precio = "Reserva sin total";
                            }
                            if (resuelveConsultaPrecioCentralizado.rowCount === 1) {
                                precio = resuelveConsultaPrecioCentralizado.rows[0].totalConImpuestos;
                            }
                            const estructuraFinal = {
                                enlaceUID: enlaceUID,
                                nombreEnlace: nombreEnlace,
                                reservaUID: reservaUID,
                                estadoPago: estadoPago,
                                descripcion: descripcion,
                                enlace: codigo,
                                cantidad: cantidad,
                                totalReserva: precio,
                            };
                            ok.ok.push(estructuraFinal);
                        }
                    }
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                }
            },
            detallesDelEnlace: async () => {
                try {
                    const enlaceUID = entrada.body.enlaceUID;
                    const filtroCadena = /^[0-9]+$/;
                    if (!enlaceUID || !filtroCadena.test(enlaceUID)) {
                        const error = "el campo 'enlaceUID' solo puede ser una cadena de letras minúsculas y numeros sin espacios.";
                        throw new Error(error);
                    }
                    await controlCaducidadEnlacesDePago();
                    const consultaDetallesEnlace = `
                        SELECT
                        "nombreEnlace", 
                        codigo, 
                        reserva,
                        cantidad,
                        "estadoPago",
                        TO_CHAR(caducidad AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS caducidad
                        FROM "enlacesDePago"
                        WHERE "enlaceUID" = $1;`;
                    const resuelveConsultaDetallesEnlace = await conexion.query(consultaDetallesEnlace, [enlaceUID]);
                    if (resuelveConsultaDetallesEnlace.rowCount === 0) {
                        const error = "noExisteElEnlace";
                        throw new Error(error);
                    }
                    if (resuelveConsultaDetallesEnlace.rowCount === 1) {
                        const detallesEnlace = resuelveConsultaDetallesEnlace.rows[0];
                        const nombreEnlace = detallesEnlace.nombreEnlace;
                        const codigo = detallesEnlace.codigo;
                        const descripcion = detallesEnlace.descripcion;
                        const reserva = detallesEnlace.reserva;
                        const cantidad = detallesEnlace.cantidad;
                        const caducidad = detallesEnlace.caducidad;
                        const caducidadUTC = utilidades.convertirFechaUTCaHumano(caducidad);
                        const caducidadMadrid = utilidades.deUTCaZonaHoraria(caducidad, "Europe/Madrid");
                        const caducidadNicaragua = utilidades.deUTCaZonaHoraria(caducidad, "America/Managua");
                        const consultaEstadoPago = `
                            SELECT
                            "estadoPago"
                            FROM reservas
                            WHERE reserva = $1;`;
                        const resuelveConsultaEstadoPago = await conexion.query(consultaEstadoPago, [reserva]);
                        const estadoPago = resuelveConsultaEstadoPago.rows[0].estadoPago;
                        const ok = {
                            ok: {
                                enlaceUID: enlaceUID,
                                nombreEnlace: nombreEnlace,
                                codigo: codigo,
                                reserva: reserva,
                                cantidad: cantidad,
                                estadoPago: estadoPago,
                                caducidadUTC: caducidadUTC,
                                caducidadMadrid: caducidadMadrid,
                                caducidadNicaragua: caducidadNicaragua
                            }
                        };
                        salida.json(ok);
                    }
                } catch (errorCapturado) {
                    const error = {};
                    if (errorCapturado.message === "noExisteElEnlace") {
                        error.error = errorCapturado.message;
                        error.noExisteElEnlace = "reservaSinEnlace";
                    } else {
                        error.error = errorCapturado.message;
                    }
                    salida.json(error)
                }
            },
            eliminarEnlace: async () => {
                try {
                    const enlaceUID = entrada.body.enlaceUID;
                    const filtroCadena = /^[0-9]+$/;
                    if (!enlaceUID || !filtroCadena.test(enlaceUID)) {
                        const error = "el campo 'enlaceUID' solo puede ser una cadena de letras minúsculas y numeros sin espacios.";
                        throw new Error(error);
                    }
                    const seleccionarEnlace = await conexion.query(`SELECT reserva FROM "enlacesDePago" WHERE "enlaceUID" = $1`, [enlaceUID]);
                    if (seleccionarEnlace.rowCount === 0) {
                        const error = "No existe el enlace de pago";
                        throw new Error(error);
                    }
                    const eliminarEnlace = `
                        DELETE FROM "enlacesDePago"
                        WHERE "enlaceUID" = $1;
                        `;
                    const resuelveEliminarEnlace = await conexion.query(eliminarEnlace, [enlaceUID]);
                    if (resuelveEliminarEnlace.rowCount === 0) {
                        const error = "No existe el enlace";
                        throw new Error(error);
                    }
                    if (resuelveEliminarEnlace.rowCount === 1) {
                        const ok = {
                            ok: "Se ha eliminado el enlace correctamente"
                        };
                        salida.json(ok);
                    }
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                }
            },
            modificarEnlace: async () => {
                try {
                    const enlaceUID = entrada.body.enlaceUID;
                    const nombreEnlace = entrada.body.nombreEnlace;
                    const cantidad = entrada.body.cantidad;
                    let horasCaducidad = entrada.body.horasCaducidad;
                    const descripcion = entrada.body.descripcion;
                    const filtroCadena = /^[0-9]+$/;
                    if (!enlaceUID || !filtroCadena.test(enlaceUID)) {
                        const error = "el campo 'enlaceUID' solo puede ser una cadena de numeros.";
                        throw new Error(error);
                    }
                    const filtroTextoSimple = /^[a-zA-Z0-9\s]+$/;
                    if (!nombreEnlace || !filtroTextoSimple.test(nombreEnlace)) {
                        const error = "el campo 'nombreEnlace' solo puede ser una cadena de letras minúsculas y numeros sin espacios.";
                        throw new Error(error);
                    }
                    if (descripcion) {
                        if (!filtroTextoSimple.test(descripcion)) {
                            const error = "el campo 'descripcion' solo puede ser una cadena de letras, numeros y espacios.";
                            throw new Error(error);
                        }
                    }
                    if (horasCaducidad) {
                        if (!filtroCadena.test(horasCaducidad)) {
                            const error = "el campo cantidad solo puede ser una cadena de numeros con dos decimales separados por punto, ejemplo 10.00.";
                            throw new Error(error);
                        }
                    } else {
                        horasCaducidad = 72;
                    }
                    if (!cantidad || !filtroDecimales.test(cantidad)) {
                        const error = "el campo cantidad solo puede ser una cadena de numeros con dos decimales separados por punto, ejemplo 10.00.";
                        throw new Error(error);
                    }
                    await controlCaducidadEnlacesDePago();
                    const validarEnlaceUID = await conexion.query(`SELECT reserva FROM "enlacesDePago" WHERE "enlaceUID" = $1`, [enlaceUID]);
                    if (validarEnlaceUID.rowCount === 0) {
                        const error = "No existe el enlace de pago verifica el enlaceUID";
                        throw new Error(error);
                    }
                    const fechaDeCaducidad = new Date(fechaActual.getTime() + (horasCaducidad * 60 * 60 * 1000));
                    const actualizarEnlace = `
                        UPDATE "enlacesDePago"
                        SET 
                        "nombreEnlace" = $1,
                        descripcion = $2,
                        cantidad = $3,
                        caducidad = $4
                        WHERE reserva = $5;
                        `;
                    const datosParaActualizar = [
                        nombreEnlace,
                        descripcion,
                        cantidad,
                        fechaDeCaducidad
                    ];
                    const resuelveActualizarEnlace = await conexion.query(actualizarEnlace, datosParaActualizar);
                    if (resuelveActualizarEnlace.rowCount === 0) {
                        const error = "No se ha podido actualizar los datos del enlace, reintentalo.";
                        throw new Error(error);
                    }
                    if (resuelveActualizarEnlace.rowCount === 1) {
                        const ok = {
                            "ok": "Se ha actualizado corratmente los datos del enlace"
                        };
                        salida.json(ok);
                    }
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                }
            },
            crearNuevoEnlace: async () => {
                try {
                    const error = "Hasta que no se pueda habilitar una pasarela de pago, esta opcion esta deshabilitada.";
                    throw new Error(error);
                    let nombreEnlace = entrada.body.nombreEnlace;
                    const reservaUID = entrada.body.reservaUID;
                    const cantidad = entrada.body.cantidad;
                    let horasCaducidad = entrada.body.horasCaducidad;
                    const filtroCadena = /^[0-9]+$/;
                    const filtroDecimales = /^\d+\.\d{2}$/;
                    const filtroTextoSimple = /^[a-zA-Z0-9\s]+$/;
                    if (horasCaducidad) {
                        if (!filtroCadena.test(horasCaducidad)) {
                            const error = "el campo cantidad solo puede ser una cadena de numeros con dos decimales separados por punto, ejemplo 10.00.";
                            throw new Error(error);
                        }
                    } else {
                        horasCaducidad = 72;
                    }
                    if (!cantidad || !filtroDecimales.test(cantidad)) {
                        const error = "el campo cantidad solo puede ser una cadena de numeros con dos decimales separados por punto, ejemplo 10.00.";
                        throw new Error(error);
                    }
                    if (nombreEnlace) {
                        if (!filtroTextoSimple.test(nombreEnlace)) {
                            const error = "el campo 'nombreEnlace' solo puede ser una cadena de letras minúsculas y numeros sin espacios.";
                            throw new Error(error);
                        }
                    } else {
                        nombreEnlace = `Enlace de pago de la reserva ${reservaUID}`;
                    }
                    const descripcion = entrada.body.descripcion;
                    if (descripcion) {
                        if (!filtroTextoSimple.test(descripcion)) {
                            const error = "el campo 'descripcion' solo puede ser una cadena de letras, numeros y espacios.";
                            throw new Error(error);
                        }
                    }
                    await controlCaducidadEnlacesDePago();
                    const resuelveValidarReserva = await validadoresCompartidos.reservas.validarReserva(reservaUID);
                    const estadoReserva = resuelveValidarReserva.estadoReserva;
                    const estadoPago = resuelveValidarReserva.estadoPago;
                    if (estadoReserva === "cancelada") {
                        const error = "No se puede generar un enlace de pago una reserva cancelada";
                        throw new Error(error);
                    }
                    if (estadoReserva !== "confirmada") {
                        const error = "No se puede generar un enlace de pago una reserva que no esta confirmada por que entonces el cliente podria pagar una reserva cuyo alojamiento no esta garantizado, reservado sin pagar vamos";
                        throw new Error(error);
                    }
                    const generarCadenaAleatoria = (longitud) => {
                        const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
                        let cadenaAleatoria = '';
                        for (let i = 0; i < longitud; i++) {
                            const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
                            cadenaAleatoria += caracteres.charAt(indiceAleatorio);
                        }
                        return cadenaAleatoria;
                    };
                    const validarCodigo = async (codigoAleatorio) => {
                        const validarCodigoAleatorio = `
                            SELECT
                            codigo
                            FROM "enlacesDePago"
                            WHERE codigo = $1;`;
                        const resuelveValidarCodigoAleatorio = await conexion.query(validarCodigoAleatorio, [codigoAleatorio]);
                        if (resuelveValidarCodigoAleatorio.rowCount === 1) {
                            return true;
                        }
                    };
                    const controlCodigo = async () => {
                        const longitudCodigo = 100; // Puedes ajustar la longitud según tus necesidades
                        let codigoGenerado;
                        let codigoExiste;
                        do {
                            codigoGenerado = generarCadenaAleatoria(longitudCodigo);
                            codigoExiste = await validarCodigo(codigoGenerado);
                        } while (codigoExiste);
                        // En este punto, tenemos un código único que no existe en la base de datos
                        return codigoGenerado;
                    };
                    const codigoAleatorioUnico = await controlCodigo();
                    const fechaActual = new Date();
                    const fechaDeCaducidad = new Date(fechaActual.getTime() + (horasCaducidad * 60 * 60 * 1000));
                    const estadoPagoInicial = "noPagado";
                    const insertarEnlace = `
                            INSERT INTO "enlacesDePago"
                            (
                            "nombreEnlace",
                            reserva,
                            descripcion,
                            caducidad,
                            cantidad,
                            codigo,
                            "estadoPago"
                            )
                            VALUES ($1, $2, $3, $4, $5, $6, $7) 
                            RETURNING
                            "enlaceUID",
                            "nombreEnlace",
                            cantidad,
                            codigo
                            `;
                    const datosEnlace = [
                        nombreEnlace,
                        reservaUID,
                        descripcion,
                        fechaDeCaducidad,
                        cantidad,
                        codigoAleatorioUnico,
                        estadoPagoInicial
                    ];
                    const resuelveInsertarEnlace = await conexion.query(insertarEnlace, datosEnlace);
                    if (resuelveInsertarEnlace.rowCount === 0) {
                        const error = "No se ha podido insertar el nuevo enlace, reintentalo";
                        throw new Error(error);
                    }
                    if (resuelveInsertarEnlace.rowCount === 1) {
                        const enlaceUID = resuelveInsertarEnlace.rows[0].enlaceUID;
                        const nombreEnlace = resuelveInsertarEnlace.rows[0].nombreEnlace;
                        const cantidad = resuelveInsertarEnlace.rows[0].cantidad;
                        const enlace = resuelveInsertarEnlace.rows[0].codigo;
                        const ok = {
                            ok: "Se ha creado el enlace correctamente",
                            enlaceUID: enlaceUID,
                            nombreEnlace: nombreEnlace,
                            cantidad: cantidad,
                            enlace: enlace
                        };
                        salida.json(ok);
                    }
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                }
            }
        },
        arquitectura: {
            entidades: {
                IDX: {
                    ROL: ["administrador"]
                },
                listarEntidadesAlojamiento: async () => {
                    try {
                        const estructuraFinal = {};
                        const consultaApartamento = `
                            SELECT
                            apartamento,
                            "apartamentoUI"
                            FROM apartamentos
                            ;`;
                        const resuleveConsultaApartamento = await conexion.query(consultaApartamento);
                        if (resuleveConsultaApartamento.rowCount > 0) {
                            const apartamentoEntidad = resuleveConsultaApartamento.rows;
                            estructuraFinal.apartamentos = apartamentoEntidad;
                        }
                        const consultaHabitaciones = `
                            SELECT
                            habitacion,
                            "habitacionUI"
                            FROM habitaciones
                            ;`;
                        const resuelveConsultaHabitaciones = await conexion.query(consultaHabitaciones);
                        if (resuelveConsultaHabitaciones.rowCount > 0) {
                            const habitacionEntidad = resuelveConsultaHabitaciones.rows;
                            estructuraFinal.habitaciones = habitacionEntidad;
                        }
                        const consultaCamas = `
                            SELECT
                            cama,
                            "camaUI"
                            FROM camas
                            ;`;
                        const resuelveConsultaCamas = await conexion.query(consultaCamas);
                        if (resuelveConsultaCamas.rowCount > 0) {
                            const camaEntidades = resuelveConsultaCamas.rows;
                            estructuraFinal.camas = camaEntidades;
                        }
                        const ok = {
                            "ok": estructuraFinal
                        };
                        salida.json(ok);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    }
                },
                listarApartamentosComoEntidades: async () => {
                    try {
                        const estructuraApartamentosObjeto = {};
                        const consultaApartamento = `
                            SELECT
                            apartamento,
                            "apartamentoUI"
                            FROM apartamentos;`;
                        const resuleveConsultaApartamento = await conexion.query(consultaApartamento);
                        if (resuleveConsultaApartamento.rowCount === 0) {
                            const ok = {
                                ok: "No existe ningun apartamento como entidad, por favor crea uno para poder construir una configuracion de alojamiento sobre el",
                                "apartamentosComoEntidadesDisponibles": []
                            };
                            salida.json(ok);
                        }
                        if (resuleveConsultaApartamento.rowCount > 0) {
                            const apartamentoEntidades = resuleveConsultaApartamento.rows;
                            apartamentoEntidades.map((detallesApartamento) => {
                                const apartamentoIDV = detallesApartamento.apartamento;
                                const apartamentoUI = detallesApartamento.apartamentoUI;
                                estructuraApartamentosObjeto[apartamentoIDV] = apartamentoUI;
                            });
                            const apartamentosComoEntidades_formatoArrayString = [];
                            apartamentoEntidades.map((detallesDelApartamento) => {
                                const apartamentoIDV = detallesDelApartamento.apartamento;
                                apartamentosComoEntidades_formatoArrayString.push(apartamentoIDV);
                            });
                            const consultaConfiguraciones = `
                                SELECT
                                "apartamentoIDV"
                                FROM "configuracionApartamento"
                                ;`;
                            const resuelveConsultaApartamento = await conexion.query(consultaConfiguraciones);
                            const apartamentoConfiguraciones = resuelveConsultaApartamento.rows;
                            const apartamentosIDVConfiguraciones_formatoArrayString = [];
                            apartamentoConfiguraciones.map((detallesapartamento) => {
                                const apartamentoIDV = detallesapartamento.apartamentoIDV;
                                apartamentosIDVConfiguraciones_formatoArrayString.push(apartamentoIDV);
                            });
                            const apartamentosDisponiblesParaConfigurar = apartamentosComoEntidades_formatoArrayString.filter(entidad => !apartamentosIDVConfiguraciones_formatoArrayString.includes(entidad));
                            const estructuraFinal = [];
                            for (const apartamentoDisponible of apartamentosDisponiblesParaConfigurar) {
                                if (estructuraApartamentosObjeto[apartamentoDisponible]) {
                                    const estructuraFinalObjeto = {
                                        apartamentoIDV: apartamentoDisponible,
                                        apartamentoUI: estructuraApartamentosObjeto[apartamentoDisponible]
                                    };
                                    estructuraFinal.push(estructuraFinalObjeto);
                                }
                            }
                            const ok = {
                                ok: "Apartamento especificos disponibles",
                                apartamentosComoEntidadesDisponibles: estructuraFinal
                            };
                            salida.json(ok);
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    }
                },
                detallesDeEntidadDeAlojamiento: async () => {
                    try {
                        const tipoEntidad = entrada.body.tipoEntidad;
                        const entidadIDV = entrada.body.entidadIDV;
                        const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                        const filtroCadenaMinusculasMayusculasSinEspacios = /^[a-zA-Z0-9]+$/;
                        const filtroCadenaMinusculasConEspacios = /^[a-z0-9\s]+$/i;
                        const filtroCadenaMinusculasMayusculasYEspacios = /^[a-zA-Z0-9\s]+$/;
                        if (!tipoEntidad || !filtroCadenaMinusculasSinEspacios.test(tipoEntidad)) {
                            const error = "el campo 'tipoEntidad' solo puede ser letras minúsculas y numeros. sin pesacios";
                            throw new Error(error);
                        }
                        if (!entidadIDV || !filtroCadenaMinusculasSinEspacios.test(entidadIDV)) {
                            const error = "el campo 'entidadIDV' solo puede ser letras minúsculas, numeros y sin espacios";
                            throw new Error(error);
                        }
                        if (tipoEntidad === "apartamento") {
                            const consultaDetalles = `
                                SELECT 
                                apartamento,
                                "apartamentoUI"
                                FROM apartamentos 
                                WHERE apartamento = $1;`;
                            const resuelveConsultaDetalles = await conexion.query(consultaDetalles, [entidadIDV]);
                            if (resuelveConsultaDetalles.rowCount === 0) {
                                const error = "No existe el apartamento";
                                throw new Error(error);
                            }
                            if (resuelveConsultaDetalles.rowCount === 1) {
                                const consultaCaracteristicas = `
                                    SELECT 
                                    caracteristica
                                    FROM "apartamentosCaracteristicas" 
                                    WHERE "apartamentoIDV" = $1;`;
                                const resuelveCaracteristicas = await conexion.query(consultaCaracteristicas, [entidadIDV]);
                                const ok = {
                                    ok: resuelveConsultaDetalles.rows,
                                    caracteristicas: resuelveCaracteristicas.rows
                                };
                                salida.json(ok);
                            }
                        }
                        if (tipoEntidad === "habitacion") {
                            const consultaDetalles = `
                                SELECT 
                                habitacion,
                                "habitacionUI"
                                FROM habitaciones 
                                WHERE habitacion = $1;`;
                            const resuelveConsultaDetalles = await conexion.query(consultaDetalles, [entidadIDV]);
                            if (resuelveConsultaDetalles.rowCount === 0) {
                                const error = "No existe la habitacion";
                                throw new Error(error);
                            }
                            if (resuelveConsultaDetalles.rowCount === 1) {
                                const ok = {
                                    ok: resuelveConsultaDetalles.rows
                                };
                                salida.json(ok);
                            }
                        }
                        if (tipoEntidad === "cama") {
                            const consultaDetalles = `
                                SELECT 
                                cama,
                                "camaUI",
                                capacidad
                                FROM camas
                                WHERE cama = $1;`;
                            const resuelveConsultaDetalles = await conexion.query(consultaDetalles, [entidadIDV]);
                            if (resuelveConsultaDetalles.rowCount === 0) {
                                const error = "No existe la cama";
                                throw new Error(error);
                            }
                            if (resuelveConsultaDetalles.rowCount === 1) {
                                const ok = {
                                    ok: resuelveConsultaDetalles.rows
                                };
                                salida.json(ok);
                            }
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    }
                },
                crearEntidadAlojamiento: async () => {
                    try {
                        const tipoEntidad = entrada.body.tipoEntidad;
                        const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                        const filtroCadenaMinusculasMayusculasSinEspacios = /^[a-zA-Z0-9]+$/;
                        const filtroCadenaMinusculasConEspacios = /^[a-zA-Z0-9\s]+$/;
                        if (!tipoEntidad || !filtroCadenaMinusculasSinEspacios.test(tipoEntidad)) {
                            const error = "el campo 'tipoEntidad' solo puede ser letras minúsculas y numeros. sin pesacios";
                            throw new Error(error);
                        }
                        if (tipoEntidad === "apartamento") {
                            let apartamentoIDV = entrada.body.apartamentoIDV;
                            let apartamentoUI = entrada.body.apartamentoUI;
                            apartamentoUI = apartamentoUI.replace(/['"]/g, '');
                            if (!apartamentoUI || !filtroCadenaMinusculasConEspacios.test(apartamentoUI) || apartamentoUI.length > 50) {
                                const error = "el campo 'apartamentoUI' solo puede ser letras minúsculas, numeros y sin pesacios. No puede tener mas de 50 caracteres";
                                throw new Error(error);
                            }
                            if (!apartamentoIDV) {
                                apartamentoIDV = apartamentoUI.toLowerCase().replace(/[^a-z0-9]/g, '');
                            } else {
                                apartamentoIDV = apartamentoIDV.toLowerCase().replace(/[^a-z0-9]/g, '');
                            }
                            const validarCodigo = async (apartamentoIDV) => {
                                const validarCodigoAleatorio = `
                                    SELECT
                                    apartamento
                                    FROM apartamentos
                                    WHERE apartamento = $1;`;
                                const resuelveValidarCodigoAleatorio = await conexion.query(validarCodigoAleatorio, [apartamentoIDV]);
                                if (resuelveValidarCodigoAleatorio.rowCount === 1) {
                                    return true;
                                }
                            };
                            const controlApartamentoIDV = async (apartamentoIDV) => {
                                let codigoGenerado = apartamentoIDV;
                                let codigoExiste;
                                do {
                                    codigoExiste = await validarCodigo(codigoGenerado);
                                    if (codigoExiste) {
                                        // Si el código ya existe, agrega un cero al final y vuelve a verificar
                                        codigoGenerado = codigoGenerado + "0";
                                    }
                                } while (codigoExiste);
                                return codigoGenerado;
                            };
                            apartamentoIDV = await controlApartamentoIDV(apartamentoIDV);
                            const validarIDV = `
                                SELECT 
                                *
                                FROM apartamentos
                                WHERE apartamento = $1
                                `;
                            const resuelveValidarIDV = await conexion.query(validarIDV, [apartamentoIDV]);
                            if (resuelveValidarIDV.rowCount === 1) {
                                const error = "Ya existe un identificador visual igual que el apartamento que propones, escoge otro";
                                throw new Error(error);
                            }
                            const validarUI = `
                                SELECT 
                                *
                                FROM apartamentos
                                WHERE "apartamentoUI" = $1
                                `;
                            const resuelveValidarUI = await conexion.query(validarUI, [apartamentoUI]);
                            if (resuelveValidarUI.rowCount === 1) {
                                const error = "Ya existe un apartamento con ese nombre, por tema de legibilidad escoge otro";
                                throw new Error(error);
                            }
                            const crearEntidad = `
                                INSERT INTO apartamentos
                                (
                                apartamento,
                                "apartamentoUI"
                                )
                                VALUES 
                                (
                                $1,
                                $2
                                )
                                RETURNING apartamento
                                `;
                            const matriozDatosNuevaEntidad = [
                                apartamentoIDV,
                                apartamentoUI
                            ];
                            const resuelveCrearEntidad = await conexion.query(crearEntidad, matriozDatosNuevaEntidad);
                            if (resuelveCrearEntidad.rowCount === 0) {
                                const error = "No se ha podido crear la nueva entidad";
                                throw new Error(error);
                            }
                            if (resuelveCrearEntidad.rowCount === 1) {
                                const ok = {
                                    ok: "Se ha creado correctament la nuevo entidad como apartamento",
                                    nuevoUID: resuelveCrearEntidad.rows[0].apartamento
                                };
                                salida.json(ok);
                            }
                        }
                        if (tipoEntidad === "habitacion") {
                            let habitacionIDV = entrada.body.habitacionIDV;
                            let habitacionUI = entrada.body.habitacionUI;
                            habitacionUI = habitacionUI.replace(/['"]/g, '');
                            if (!habitacionUI || !filtroCadenaMinusculasConEspacios.test(habitacionUI) || habitacionUI.length > 50) {
                                const error = "el campo 'habitacionUI' solo puede ser letras minúsculas, numeros y sin pesacios. No puede tener mas de 50 caracteres";
                                throw new Error(error);
                            }
                            if (!habitacionIDV) {
                                habitacionIDV = habitacionUI.replace(/[^a-z0-9]/g, '');
                            } else {
                                habitacionIDV = habitacionIDV.replace(/[^a-z0-9]/g, '');
                            }
                            const validarCodigo = async (habitacionIDV) => {
                                const validarCodigoAleatorio = `
                                    SELECT
                                    *
                                    FROM habitaciones
                                    WHERE habitacion = $1;`;
                                const resuelveValidarCodigoAleatorio = await conexion.query(validarCodigoAleatorio, [habitacionIDV]);
                                if (resuelveValidarCodigoAleatorio.rowCount === 1) {
                                    return true;
                                }
                            };
                            const controlHabitacionIDV = async (habitacionIDV) => {
                                let codigoGenerado = habitacionIDV;
                                let codigoExiste;
                                do {
                                    codigoExiste = await validarCodigo(codigoGenerado);
                                    if (codigoExiste) {
                                        // Si el código ya existe, agrega un cero al final y vuelve a verificar
                                        codigoGenerado = codigoGenerado + "0";
                                    }
                                } while (codigoExiste);
                                return codigoGenerado;
                            };
                            habitacionIDV = await controlHabitacionIDV(habitacionIDV);
                            const validarIDV = `
                                SELECT 
                                *
                                FROM habitaciones
                                WHERE habitacion = $1
                                `;
                            const resuelveValidarIDV = await conexion.query(validarIDV, [habitacionIDV]);
                            if (resuelveValidarIDV.rowCount === 1) {
                                const error = "Ya existe un identificador visual igual que el que propones, escoge otro";
                                throw new Error(error);
                            }
                            const validarUI = `
                                SELECT 
                                *
                                FROM habitaciones
                                WHERE "habitacionUI" = $1
                                `;
                            const resuelveValidarUI = await conexion.query(validarUI, [habitacionUI]);
                            if (resuelveValidarUI.rowCount === 1) {
                                const error = "Ya existe un nombre de la habitacion exactamente igual, por tema de legibilidad escoge otro";
                                throw new Error(error);
                            }
                            const crearEntidad = `
                                INSERT INTO habitaciones
                                (
                                habitacion,
                                "habitacionUI"
                                )
                                VALUES 
                                (
                                $1,
                                $2
                                )
                                RETURNING habitacion
                                `;
                            const matriozDatosNuevaEntidad = [
                                habitacionIDV,
                                habitacionUI,
                            ];
                            let resuelveCrearEntidad = await conexion.query(crearEntidad, matriozDatosNuevaEntidad);
                            if (resuelveCrearEntidad.rowCount === 0) {
                                const error = "No se ha podido crear la nueva entidad";
                                throw new Error(error);
                            }
                            if (resuelveCrearEntidad.rowCount === 1) {
                                const ok = {
                                    ok: "Se ha creado correctament la nuevo entidad como habitacion",
                                    nuevoUID: resuelveCrearEntidad.rows[0].habitacion
                                };
                                salida.json(ok);
                            }
                        }
                        if (tipoEntidad === "cama") {
                            let camaIDV = entrada.body.camaIDV;
                            let camaUI = entrada.body.camaUI;
                            let capacidad = entrada.body.capacidad;
                            camaUI = camaUI.replace(/['"]/g, '');
                            if (!camaUI || !filtroCadenaMinusculasConEspacios.test(camaUI) || camaUI.length > 50) {
                                const error = "el campo 'camaUI' solo puede ser letras minúsculas, numeros y sin espacios. No puede tener mas de 50 caracteres.";
                                throw new Error(error);
                            }
                            if (!camaIDV) {
                                camaIDV = camaUI.replace(/[^a-z0-9]/g, '');
                            } else {
                                camaIDV = camaIDV.replace(/[^a-z0-9]/g, '');
                            }
                            const validarCodigo = async (camaIDV) => {
                                const validarCodigoAleatorio = `
                                    SELECT
                                    *
                                    FROM camas
                                    WHERE cama = $1;`;
                                const resuelveValidarCodigoAleatorio = await conexion.query(validarCodigoAleatorio, [camaIDV]);
                                if (resuelveValidarCodigoAleatorio.rowCount === 1) {
                                    return true;
                                }
                            };
                            const controlCamaIDV = async (camaIDV) => {
                                let codigoGenerado = camaIDV;
                                let codigoExiste;
                                do {
                                    codigoExiste = await validarCodigo(codigoGenerado);
                                    if (codigoExiste) {
                                        // Si el código ya existe, agrega un cero al final y vuelve a verificar
                                        codigoGenerado = codigoGenerado + "0";
                                    }
                                } while (codigoExiste);
                                return codigoGenerado;
                            };
                            camaIDV = await controlCamaIDV(camaIDV);
                            const filtroSoloNumeros = /^\d+$/;
                            if (filtroSoloNumeros.test(capacidad)) {
                                capacidad = parseInt(capacidad);
                            }
                            if (!capacidad || !Number.isInteger(capacidad) || capacidad < 0) {
                                const error = "el campo 'capacidad' solo puede ser numeros, entero y positivo";
                                throw new Error(error);
                            }
                            const validarIDV = `
                                SELECT 
                                *
                                FROM camas
                                WHERE cama = $1
                                `;
                            const resuelveValidarIDV = await conexion.query(validarIDV, [camaIDV]);
                            if (resuelveValidarIDV.rowCount === 1) {
                                const error = "Ya existe un identificador visual igual que la cama que propones, escoge otro";
                                throw new Error(error);
                            }
                            const validarUI = `
                                SELECT 
                                *
                                FROM camas
                                WHERE "camaUI" = $1
                                `;
                            const resuelveValidarUI = await conexion.query(validarUI, [camaUI]);
                            if (resuelveValidarUI.rowCount === 1) {
                                const error = "Ya existe una cama con ese nombre, por tema de legibilidad escoge otro";
                                throw new Error(error);
                            }
                            const crearEntidad = `
                                INSERT INTO camas
                                (
                                cama,
                                "camaUI",
                                capacidad
                                )
                                VALUES 
                                (
                                $1,
                                $2,
                                $3
                                )
                                RETURNING cama
                                `;
                            const matriozDatosNuevaEntidad = [
                                camaIDV,
                                camaUI,
                                capacidad
                            ];
                            const resuelveCrearEntidad = await conexion.query(crearEntidad, matriozDatosNuevaEntidad);
                            if (resuelveCrearEntidad.rowCount === 0) {
                                const error = "No se ha podido crear la nueva entidad";
                                throw new Error(error);
                            }
                            if (resuelveCrearEntidad.rowCount === 1) {
                                const ok = {
                                    ok: "Se ha creado correctament la nuevo entidad como cama",
                                    nuevoUID: resuelveCrearEntidad.rows[0].cama
                                };
                                salida.json(ok);
                            }
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    }
                },
                modificarEntidadAlojamiento: async () => {
                    try {
                        const tipoEntidad = entrada.body.tipoEntidad;
                        const entidadIDV = entrada.body.entidadIDV;
                        const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                        const filtroCadenaMinusculasMayusculasSinEspacios = /^[a-zA-Z0-9]+$/;
                        const filtroCadenaMinusculasConEspacios = /^[a-z0-9\s]+$/i;
                        if (!tipoEntidad || !filtroCadenaMinusculasSinEspacios.test(tipoEntidad)) {
                            const error = "el campo 'tipoEntidad' solo puede ser letras minúsculas y numeros. sin pesacios";
                            throw new Error(error);
                        }
                        if (!entidadIDV || !filtroCadenaMinusculasSinEspacios.test(entidadIDV)) {
                            const error = "el campo 'entidadIDV' solo puede ser letras minúsculas, numeros y sin espacios";
                            throw new Error(error);
                        }
                        if (tipoEntidad === "apartamento") {
                            const apartamentoIDV = entrada.body.apartamentoIDV;
                            let apartamentoUI = entrada.body.apartamentoUI;
                            const caracteristicas = entrada.body.caracteristicas;
                            if (!apartamentoIDV || !filtroCadenaMinusculasMayusculasSinEspacios.test(apartamentoIDV) || apartamentoIDV.length > 50) {
                                const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin espacios. No puede tener mas de 50 caracteres.";
                                throw new Error(error);
                            }
                            apartamentoUI = apartamentoUI.replace(/['"]/g, '');
                            /*
                            if (!apartamentoUI || !filtroCadenaMinusculasMayusculasYEspacios.test(apartamentoUI)) {
                                const error = "el campo 'apartamentoUI' solo puede ser letras minúsculas, mayúsculas, numeros y espacios"
                                throw new Error(error)
                            }
                            */
                            if (!Array.isArray(caracteristicas)) {
                                const error = "el campo 'caractaristicas' solo puede ser un array";
                                throw new Error(error);
                            }
                            const filtroCaracteristica = /^[a-zA-Z0-9\s.,:_\-\u00F1ñ]+$/u;
                            for (const caractaristica of caracteristicas) {
                                if (!filtroCaracteristica.test(caractaristica)) {
                                    const error = "Revisa las caracteristicas por que hay una que no cumple con el formato esperado. Recuerda que los campo de caracteristicas solo aceptan mayusculas, minusculas, numeros, espacios, puntos, comas, guion bajo y medio y nada mas";
                                    throw new Error(error);
                                }
                            }
                            const validarIDV = `
                                SELECT 
                                *
                                FROM apartamentos
                                WHERE apartamento = $1
                                `;
                            const resuelveValidarIDV = await conexion.query(validarIDV, [entidadIDV]);
                            if (resuelveValidarIDV.rowCount === 0) {
                                const error = "No existe el apartamento, revisa el apartamentopIDV";
                                throw new Error(error);
                            }
                            // Comprobar que no existe el nuevo IDV
                            if (entidadIDV !== apartamentoIDV) {
                                const validarNuevoIDV = `
                                    SELECT 
                                    *
                                    FROM apartamentos
                                    WHERE apartamento = $1
                                    `;
                                const resuelveValidarNuevoIDV = await conexion.query(validarNuevoIDV, [apartamentoIDV]);
                                if (resuelveValidarNuevoIDV.rowCount === 1) {
                                    const error = "El nuevo identificador de la entidad ya existe, escoge otro por favor";
                                    throw new Error(error);
                                }
                            }
                            const guardarCambios = `
                                UPDATE apartamentos
                                SET 
                                apartamento= COALESCE($1, apartamento),
                                "apartamentoUI" = COALESCE($2, "apartamentoUI")
                                WHERE apartamento = $3
                                `;
                            const matrizCambios = [
                                apartamentoIDV,
                                apartamentoUI,
                                entidadIDV
                            ];
                            const resuelveGuardarCambios = await conexion.query(guardarCambios, matrizCambios);
                            if (resuelveGuardarCambios.rowCount === 0) {
                                const error = "No se ha podido guardar los datos por que no se han encontrado el apartamento";
                                throw new Error(error);
                            }
                            if (resuelveGuardarCambios.rowCount === 1) {
                                const eliminarEntidad = `
                                    DELETE FROM "apartamentosCaracteristicas"
                                    WHERE "apartamentoIDV" = $1;
                                    `;
                                await conexion.query(eliminarEntidad, [apartamentoIDV]);
                                if (caracteristicas.length > 0) {
                                    const insertarCaracteristicas = `
                                        INSERT INTO "apartamentosCaracteristicas" (caracteristica, "apartamentoIDV")
                                        SELECT unnest($1::text[]), $2
                                        `;
                                    await conexion.query(insertarCaracteristicas, [caracteristicas, apartamentoIDV]);
                                }
                                const ok = {
                                    ok: "Se ha actualizado correctamente el apartamento"
                                };
                                salida.json(ok);
                            }
                        }
                        if (tipoEntidad === "habitacion") {
                            const habitacionIDV = entrada.body.habitacionIDV;
                            let habitacionUI = entrada.body.habitacionUI;
                            if (!habitacionIDV || !filtroCadenaMinusculasMayusculasSinEspacios.test(habitacionIDV) || habitacionIDV.length > 50) {
                                const error = "el campo 'habitacionIDV' solo puede ser letras minúsculas, numeros y sin espacios. No puede tener mas de 50 caracteres";
                                throw new Error(error);
                            }
                            habitacionUI = habitacionUI.replace(/['"]/g, '');
                            /*
                            if (!habitacionUI || !filtroCadenaMinusculasMayusculasYEspacios.test(habitacionUI)) {
                                const error = "el campo 'habitacionUI' solo puede ser letras mayúsculas, minúsculas, numeros y espacios"
                                throw new Error(error)
                            }
                            */
                            const validarIDV = `
                                SELECT 
                                *
                                FROM habitaciones
                                WHERE habitacion = $1
                                `;
                            const resuelveValidarIDV = await conexion.query(validarIDV, [entidadIDV]);
                            if (resuelveValidarIDV.rowCount === 0) {
                                const error = "No existe la habitacion, revisa el habitacionIDV";
                                throw new Error(error);
                            }
                            // Comprobar que no existe el nuevo IDV
                            if (entidadIDV !== habitacionIDV) {
                                const validarNuevoIDV = `
                                    SELECT 
                                    *
                                    FROM habitaciones
                                    WHERE habitacion = $1
                                    `;
                                const resuelveValidarNuevoIDV = await conexion.query(validarNuevoIDV, [habitacionIDV]);
                                if (resuelveValidarNuevoIDV.rowCount === 1) {
                                    const error = "El nuevo identificador de la entidad ya existe, escoge otro por favor";
                                    throw new Error(error);
                                }
                            }
                            const guardarCambios = `
                                UPDATE habitaciones
                                SET 
                                habitacion = COALESCE($1, habitacion),
                                "habitacionUI" = COALESCE($2, "habitacionUI")
                                WHERE habitacion = $3
                                `;
                            const matrizCambios = [
                                habitacionIDV,
                                habitacionUI,
                                entidadIDV
                            ];
                            const resuelveGuardarCambios = await conexion.query(guardarCambios, matrizCambios);
                            if (resuelveGuardarCambios.rowCount === 0) {
                                const error = "No se ha podido guardar los datosd por que no se han encontrado la habitacion";
                                throw new Error(error);
                            }
                            if (resuelveGuardarCambios.rowCount === 1) {
                                const ok = {
                                    ok: "Se ha actualizado correctamente la habitacion"
                                };
                                salida.json(ok);
                            }
                        }
                        if (tipoEntidad === "cama") {
                            const camaIDV = entrada.body.camaIDV;
                            let camaUI = entrada.body.camaUI;
                            let capacidad = entrada.body.capacidad;
                            if (!camaIDV || !filtroCadenaMinusculasMayusculasSinEspacios.test(camaIDV) || camaIDV.length > 50) {
                                const error = "el campo 'camaIDV' solo puede ser letras minúsculas, numeros y sin espacios. No puede tener mas de 50 caracteres";
                                throw new Error(error);
                            }
                            camaUI = camaUI.replace(/['"]/g, '');
                            /*
                            if (!camaUI || !filtroCadenaMinusculasMayusculasYEspacios.test(camaUI)) {
                                const error = "el campo 'camaUI' solo puede ser letras minúsculas, mayúsculas, numeros y espacios"
                                throw new Error(error)
                            }
                            */
                            const filtroSoloNumeros = /^\d+$/;
                            if (filtroSoloNumeros.test(capacidad)) {
                                capacidad = parseInt(capacidad);
                            }
                            if (!capacidad || !Number.isInteger(capacidad) || capacidad < 0) {
                                const error = "el campo 'capacidad' solo puede ser numeros, entero y positivo";
                                throw new Error(error);
                            }
                            const validarIDV = `
                                SELECT 
                                *
                                FROM camas
                                WHERE cama = $1
                                `;
                            const resuelveValidarIDV = await conexion.query(validarIDV, [entidadIDV]);
                            if (resuelveValidarIDV.rowCount === 0) {
                                const error = "No existe la habitacion, revisa el habitacionIDV";
                                throw new Error(error);
                            }
                            // Comprobar que no existe el nuevo IDV
                            if (entidadIDV !== camaIDV) {
                                const validarNuevoIDV = `
                                    SELECT 
                                    *
                                    FROM camas
                                    WHERE cama = $1
                                    `;
                                const resuelveValidarNuevoIDV = await conexion.query(validarNuevoIDV, [camaIDV]);
                                if (resuelveValidarNuevoIDV.rowCount === 1) {
                                    const error = "El nuevo identificador de la entidad ya existe, escoge otro por favor";
                                    throw new Error(error);
                                }
                            }
                            const guardarCambios = `
                                UPDATE camas
                                SET 
                                cama = COALESCE($1, cama),
                                "camaUI" = COALESCE($2, "camaUI"),
                                capacidad = COALESCE($3, "capacidad")
                                WHERE cama = $4
                                `;
                            const matrizCambios = [
                                camaIDV,
                                camaUI,
                                capacidad,
                                entidadIDV,
                            ];
                            const resuelveGuardarCambios = await conexion.query(guardarCambios, matrizCambios);
                            if (resuelveGuardarCambios.rowCount === 0) {
                                const error = "No se ha podido guardar los datosd por que no se han encontrado la cama";
                                throw new Error(error);
                            }
                            if (resuelveGuardarCambios.rowCount === 1) {
                                const ok = {
                                    ok: "Se ha actualizado correctamente la cama"
                                };
                                salida.json(ok);
                            }
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    }
                },
                eliminarEntidadAlojamiento: async () => {
                    try {
                        const tipoEntidad = entrada.body.tipoEntidad;
                        const entidadIDV = entrada.body.entidadIDV;
                        const filtroCadenaSinEspacios = /^[a-z0-9]+$/;
                        const filtroCadenaConEspacios = /^[a-z0-9\s]+$/i;
                        if (!tipoEntidad || !filtroCadenaSinEspacios.test(tipoEntidad)) {
                            const error = "el campo 'tipoEntidad' solo puede ser letras minúsculas y numeros. sin pesacios";
                            throw new Error(error);
                        }
                        if (!entidadIDV || !filtroCadenaSinEspacios.test(entidadIDV)) {
                            const error = "el campo 'entidadIDV' solo puede ser letras minúsculas y numeros. sin pesacios";
                            throw new Error(error);
                        }
                        if (tipoEntidad === "apartamento") {
                            const validarIDV = `
                                SELECT 
                                *
                                FROM apartamentos
                                WHERE apartamento = $1
                                `;
                            const resuelveValidarIDV = await conexion.query(validarIDV, [entidadIDV]);
                            if (resuelveValidarIDV.rowCount === 0) {
                                const error = "No existe el apartamento que desea borrar, revisa el apartamentoIDV";
                                throw new Error(error);
                            }
                            const eliminarEntidad = `
                                DELETE FROM apartamentos
                                WHERE apartamento = $1;
                                `;
                            const resuelveEliminarBloqueo = await conexion.query(eliminarEntidad, [entidadIDV]);
                            if (resuelveEliminarBloqueo.rowCount === 0) {
                                const error = "No se ha eliminado el apartamento por que no se ha encontrado el registo en la base de datos";
                                throw new Error(error);
                            }
                            if (resuelveEliminarBloqueo.rowCount === 1) {
                                const ok = {
                                    "ok": "Se ha eliminado correctamente el apartamento como entidad",
                                };
                                salida.json(ok);
                            }
                        }
                        if (tipoEntidad === "habitacion") {
                            const validarIDV = `
                                SELECT 
                                *
                                FROM habitaciones
                                WHERE habitacion = $1
                                `;
                            const resuelveValidarIDV = await conexion.query(validarIDV, [entidadIDV]);
                            if (resuelveValidarIDV.rowCount === 0) {
                                const error = "No existe la habitacion, revisa el habitacionIDV";
                                throw new Error(error);
                            }
                            const eliminarEntidad = `
                                DELETE FROM habitaciones
                                WHERE habitacion = $1;
                                `;
                            const resuelveEliminarBloqueo = await conexion.query(eliminarEntidad, [entidadIDV]);
                            if (resuelveEliminarBloqueo.rowCount === 0) {
                                const error = "No se ha eliminado la habitacion por que no se ha entonctrado el registo en la base de datos";
                                throw new Error(error);
                            }
                            if (resuelveEliminarBloqueo.rowCount === 1) {
                                const ok = {
                                    "ok": "Se ha eliminado correctamente la habitacion como entidad",
                                };
                                salida.json(ok);
                            }
                        }
                        if (tipoEntidad === "cama") {
                            const validarIDV = `
                                SELECT 
                                *
                                FROM camas
                                WHERE cama = $1
                                `;
                            const resuelveValidarIDV = await conexion.query(validarIDV, [entidadIDV]);
                            if (resuelveValidarIDV.rowCount === 0) {
                                const error = "No existe la cama, revisa el camaIDV";
                                throw new Error(error);
                            }
                            const eliminarEntidad = `
                                DELETE FROM camas
                                WHERE cama = $1;
                                `;
                            const resuelveEliminarBloqueo = await conexion.query(eliminarEntidad, [entidadIDV]);
                            if (resuelveEliminarBloqueo.rowCount === 0) {
                                const error = "No se ha eliminado la cama por que no se ha entonctrado el registo en la base de datos";
                                throw new Error(error);
                            }
                            if (resuelveEliminarBloqueo.rowCount === 1) {
                                const ok = {
                                    "ok": "Se ha eliminado correctamente la cama como entidad",
                                };
                                salida.json(ok);
                            }
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error)
                    }
                }
            },
            configuraciones: {
                listarConfiguracionApartamentos: {
                    IDX: {
                        ROL: [
                            "administrador",
                            "empleado"
                        ]
                    },
                    X: async () => {
                        try {
                            const seleccionaApartamentos = `
                                SELECT 
                                uid,
                                "apartamentoIDV",
                                "estadoConfiguracion"
                                FROM "configuracionApartamento"
                                `;
                            const resuelveSeleccionaApartamentos = await conexion.query(seleccionaApartamentos);
                            const apartamentosConConfiguracion = [];
                            if (resuelveSeleccionaApartamentos.rowCount > 0) {
                                const apartamentoEntidad = resuelveSeleccionaApartamentos.rows;
                                for (const detallesDelApartamento of apartamentoEntidad) {
                                    const apartamentoIDV = detallesDelApartamento.apartamentoIDV;
                                    const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                                    const estadoConfiguracion = detallesDelApartamento.estadoConfiguracion;
                                    const estructuraFinal = {
                                        apartamentoIDV: apartamentoIDV,
                                        apartamentoUI: apartamentoUI,
                                        estadoConfiguracion: estadoConfiguracion
                                    };
                                    apartamentosConConfiguracion.push(estructuraFinal);
                                }
                            }
                            const ok = {
                                ok: apartamentosConConfiguracion
                            };
                            salida.json(ok);
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                detalleConfiguracionAlojamiento: {
                    IDX: {
                        ROL: ["administrador"]
                    },
                    X: async () => {
                        try {
                            const apartamentoIDV = entrada.body.apartamentoIDV;
                            const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                            if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
                                const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin espacios";
                                throw new Error(error);
                            }
                            const consultaPerfilConfiguracion = `
                            SELECT 
                            uid,
                            "apartamentoIDV",
                            "estadoConfiguracion",
                            imagen
                            FROM "configuracionApartamento"
                            WHERE "apartamentoIDV" = $1;
                            `;
                            const resuelveConsultaPerfilConfiguracion = await conexion.query(consultaPerfilConfiguracion, [apartamentoIDV]);
                            if (resuelveConsultaPerfilConfiguracion.rowCount === 0) {
                                const error = "No hay ninguna configuracion disponible para este apartamento";
                                throw new Error(error);
                            }
                            if (resuelveConsultaPerfilConfiguracion.rowCount > 0) {
                                const estadoConfiguracion = resuelveConsultaPerfilConfiguracion.rows[0].estadoConfiguracion;
                                const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                                const consultaHabitaciones = `
                                SELECT 
                                uid,
                                apartamento,
                                habitacion
                                FROM "configuracionHabitacionesDelApartamento"
                                WHERE apartamento = $1;
                                `;
                                const resuelveConsultaHabitaciones = await conexion.query(consultaHabitaciones, [apartamentoIDV]);
                                const habitacionesEncontradas = resuelveConsultaHabitaciones.rows;
                                for (const detalleHabitacion of habitacionesEncontradas) {
                                    const uidHabitacion = detalleHabitacion.uid;
                                    const apartamentoIDV = detalleHabitacion.apartamento;
                                    const habitacionIDV = detalleHabitacion.habitacion;
                                    const resolucionNombreHabitacion = await conexion.query(`SELECT "habitacionUI" FROM habitaciones WHERE habitacion = $1`, [habitacionIDV]);
                                    if (resolucionNombreHabitacion.rowCount === 0) {
                                        const error = "No existe el identificador de la habitacionIDV";
                                        throw new Error(error);
                                    }
                                    const habitacionUI = resolucionNombreHabitacion.rows[0].habitacionUI;
                                    detalleHabitacion.habitacionUI = habitacionUI;
                                    const consultaCamas = `
                                    SELECT
                                    uid,
                                    habitacion, 
                                    cama
                                    FROM
                                    "configuracionCamasEnHabitacion"
                                    WHERE
                                    habitacion = $1
                                    `;
                                    const resolverConsultaCamas = await conexion.query(consultaCamas, [uidHabitacion]);
                                    detalleHabitacion.camas = [];
                                    if (resolverConsultaCamas.rowCount > 0) {
                                        const camasEntontradas = resolverConsultaCamas.rows;
                                        for (const detallesCama of camasEntontradas) {
                                            const uidCama = detallesCama.uid;
                                            const camaIDV = detallesCama.cama;
                                            const resolucionNombreCama = await conexion.query(`SELECT "camaUI", capacidad FROM camas WHERE cama = $1`, [camaIDV]);
                                            if (resolucionNombreCama.rowCount === 0) {
                                                const error = "No existe el identificador de la camaIDV";
                                                throw new Error(error);
                                            }
                                            const camaUI = resolucionNombreCama.rows[0].camaUI;
                                            const capacidad = resolucionNombreCama.rows[0].capacidad;
                                            const estructuraCama = {
                                                uid: uidCama,
                                                camaIDV: camaIDV,
                                                camaUI: camaUI,
                                                capacidad: capacidad
                                            };
                                            detalleHabitacion.camas.push(estructuraCama);
                                        }
                                    }
                                }
                                const ok = {
                                    ok: habitacionesEncontradas,
                                    apartamentoIDV: apartamentoIDV,
                                    apartamentoUI: apartamentoUI,
                                    estadoConfiguracion: estadoConfiguracion,
                                };
                                salida.json(ok);
                            }
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                obtenerImagenConfiguracionAdministracion: {
                    IDX: {
                        ROL: ["administrador"]
                    },
                    X: async () => {
                        try {
                            const apartamentoIDV = entrada.body.apartamentoIDV;
                            const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                            if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
                                const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin espacios";
                                throw new Error(error);
                            }
                            const consultaPerfilConfiguracion = `
                            SELECT 
                            imagen
                            imagen
                            FROM "configuracionApartamento"
                            WHERE "apartamentoIDV" = $1;
                            `;
                            const resuelveConsultaPerfilConfiguracion = await conexion.query(consultaPerfilConfiguracion, [apartamentoIDV]);
                            if (resuelveConsultaPerfilConfiguracion.rowCount === 0) {
                                const error = "No hay ninguna configuracion disponible para este apartamento";
                                throw new Error(error);
                            }
                            if (resuelveConsultaPerfilConfiguracion.rowCount === 1) {
                                const imagen = resuelveConsultaPerfilConfiguracion.rows[0].imagen;
                                const ok = {
                                    ok: "Imagen de la configuracion adminsitrativa del apartamento, png codificado en base64",
                                    imagen: imagen
                                };
                                salida.json(ok);
                            }
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                listarHabitacionesDisponbilesApartamentoConfiguracion: {
                    IDX: {
                        ROL: ["administrador"]
                    },
                    X: async () => {
                        try {
                            const apartamentoIDV = entrada.body.apartamentoIDV;
                            const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                            if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
                                const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin espacios";
                                throw new Error(error);
                            }
                            const consultaDetallesConfiguracion = `
                            SELECT 
                            *
                            FROM "configuracionApartamento"
                            WHERE "apartamentoIDV" = $1;
                            `;
                            const metadatos = [
                                apartamentoIDV
                            ];
                            const resuelveConsultaDetallesConfiguracion = await conexion.query(consultaDetallesConfiguracion, metadatos);
                            if (resuelveConsultaDetallesConfiguracion.rowCount === 0) {
                                const error = "No hay ninguna configuracion disponible para este apartamento";
                                throw new Error(error);
                            }
                            if (resuelveConsultaDetallesConfiguracion.rowCount > 0) {
                                const consultaHabitacionesEnConfiguracion = await conexion.query(`SELECT habitacion FROM "configuracionHabitacionesDelApartamento" WHERE apartamento = $1`, [apartamentoIDV]);
                                const habitacionesEnConfiguracionArrayLimpio = [];
                                const habitacionesEnConfiguracion = consultaHabitacionesEnConfiguracion.rows;
                                for (const detalleHabitacion of habitacionesEnConfiguracion) {
                                    const habitacionIDV = detalleHabitacion.habitacion;
                                    habitacionesEnConfiguracionArrayLimpio.push(habitacionIDV);
                                }
                                const resuelveHabitacionesComoEntidad = await conexion.query(`SELECT habitacion, "habitacionUI" FROM habitaciones`);
                                const habitacionesComoEntidad = resuelveHabitacionesComoEntidad.rows;
                                const habitacionComoEntidadArrayLimpio = [];
                                const habitacionesComoEntidadEstructuraFinal = {};
                                for (const detalleHabitacion of habitacionesComoEntidad) {
                                    const habitacionUI = detalleHabitacion.habitacionUI;
                                    const habitacionIDV = detalleHabitacion.habitacion;
                                    habitacionComoEntidadArrayLimpio.push(habitacionIDV);
                                    habitacionesComoEntidadEstructuraFinal[habitacionIDV] = habitacionUI;
                                }
                                const habitacionesDisponiblesNoInsertadas = habitacionComoEntidadArrayLimpio.filter(entidad => !habitacionesEnConfiguracionArrayLimpio.includes(entidad));
                                const estructuraFinal = [];
                                for (const habitacionDisponible of habitacionesDisponiblesNoInsertadas) {
                                    if (habitacionesComoEntidadEstructuraFinal[habitacionDisponible]) {
                                        const estructuraFinalObjeto = {
                                            habitacionIDV: habitacionDisponible,
                                            habitacionUI: habitacionesComoEntidadEstructuraFinal[habitacionDisponible]
                                        };
                                        estructuraFinal.push(estructuraFinalObjeto);
                                    }
                                }
                                const ok = {
                                    ok: estructuraFinal
                                };
                                salida.json(ok);
                            }
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                addHabitacionToConfiguracionApartamento: {
                    IDX: {
                        ROL: ["administrador"]
                    },
                    X: async () => {
                        try {
                            const apartamentoIDV = entrada.body.apartamentoIDV;
                            const habitacionIDV = entrada.body.habitacionIDV;
                            const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                            if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
                                const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin espacios";
                                throw new Error(error);
                            }
                            if (!habitacionIDV || !filtroCadenaMinusculasSinEspacios.test(habitacionIDV)) {
                                const error = "el campo 'habitacionIDV' solo puede ser letras minúsculas, numeros y sin espacios";
                                throw new Error(error);
                            }
                            const consultaApartamento = `
                            SELECT 
                            "estadoConfiguracion"
                            FROM "configuracionApartamento"
                            WHERE "apartamentoIDV" = $1;
                            `;
                            const resuelveConsultaApartamento = await conexion.query(consultaApartamento, [apartamentoIDV]);
                            if (resuelveConsultaApartamento.rowCount === 0) {
                                const error = "No hay ningun apartamento con ese identificador visual";
                                throw new Error(error);
                            }
                            if (resuelveConsultaApartamento.rows[0].estadoConfiguracion === "disponible") {
                                const error = "No se puede anadir una habitacion cuando el estado de la configuracion es Disponible, cambie el estado a no disponible para realizar anadir una cama";
                                throw new Error(error);
                            }
                            if (resuelveConsultaApartamento.rowCount === 1) {
                                const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                                const resolucionNombreHabitacion = await conexion.query(`SELECT "habitacionUI" FROM habitaciones WHERE habitacion = $1`, [habitacionIDV]);
                                if (resolucionNombreHabitacion.rowCount === 0) {
                                    const error = "No existe el identificador visual de la habitacion";
                                    throw new Error(error);
                                }
                                const habitacionUI = resolucionNombreHabitacion.rows[0].habitacionUI;
                                const validarInexistenciaHabitacionEnConfiguracionDeApartamento = await conexion.query(`SELECT * FROM "configuracionHabitacionesDelApartamento" WHERE apartamento = $1 AND habitacion = $2 `, [apartamentoIDV, habitacionIDV]);
                                if (validarInexistenciaHabitacionEnConfiguracionDeApartamento.rowCount === 1) {
                                    const error = `Ya existe la ${habitacionUI} en esta configuracion del ${apartamentoUI}`;
                                    throw new Error(error);
                                }
                                const insertarHabitacion = `
                                INSERT INTO "configuracionHabitacionesDelApartamento"
                                (
                                apartamento,
                                habitacion
                                )
                                VALUES ($1, $2) RETURNING uid
                                `;
                                const resuelveInsertarHabitacion = await conexion.query(insertarHabitacion, [apartamentoIDV, habitacionIDV]);
                                if (resuelveInsertarHabitacion.rowCount === 0) {
                                    const error = `Se han pasado las validaciones pero la base de datos no ha insertado el registro`;
                                    throw new Error(error);
                                }
                                if (resuelveInsertarHabitacion.rowCount === 1) {
                                    const ok = {
                                        ok: "Se ha insertado correctament la nueva habitacion",
                                        habitacionUID: resuelveInsertarHabitacion.rows[0].uid,
                                        habitacionIDV: habitacionIDV,
                                        habitacionUI: habitacionUI
                                    };
                                    salida.json(ok);
                                }
                            }
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                listarCamasDisponbilesApartamentoConfiguracion: {
                    IDX: {
                        ROL: ["administrador"]
                    },
                    X: async () => {
                        try {
                            const habitacionUID = entrada.body.habitacionUID;
                            const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                            if (!habitacionUID || !Number.isInteger(habitacionUID) || habitacionUID < 0) {
                                const error = "el campo 'habitacionUID' solo puede ser numeros";
                                throw new Error(error);
                            }
                            const validarHabitacionUID = `
                            SELECT 
                            habitacion
                            FROM "configuracionHabitacionesDelApartamento"
                            WHERE uid = $1;
                            `;
                            const metadatos = [
                                habitacionUID
                            ];
                            const resuelveConsultaDetallesConfiguracion = await conexion.query(validarHabitacionUID, metadatos);
                            if (resuelveConsultaDetallesConfiguracion.rowCount === 0) {
                                const ok = {
                                    ok: "No hay ninguna habitacion con ese identificador disponible para este apartamento"
                                };
                                salida.json(ok);
                            }
                            if (resuelveConsultaDetallesConfiguracion.rowCount > 0) {
                                const consultaCamasEnHabitacion = await conexion.query(`SELECT cama FROM "configuracionCamasEnHabitacion" WHERE habitacion = $1`, [habitacionUID]);
                                const camasArrayLimpioEnHabitacion = [];
                                const camasEncontradasEnHabitacion = consultaCamasEnHabitacion.rows;
                                for (const detalleHabitacion of camasEncontradasEnHabitacion) {
                                    const camaIDV = detalleHabitacion.cama;
                                    camasArrayLimpioEnHabitacion.push(camaIDV);
                                }
                                const resuelveCamasComoEntidad = await conexion.query(`SELECT cama, "camaUI" FROM camas`);
                                const camasComoEntidad = resuelveCamasComoEntidad.rows;
                                const camasComoEntidadArrayLimpio = [];
                                const camasComoEntidadEstructuraFinal = {};
                                for (const detalleHabitacion of camasComoEntidad) {
                                    const camaUI = detalleHabitacion.camaUI;
                                    const camaIDV = detalleHabitacion.cama;
                                    camasComoEntidadArrayLimpio.push(camaIDV);
                                    camasComoEntidadEstructuraFinal[camaIDV] = camaUI;
                                }
                                const camasDisponiblesNoInsertadas = camasComoEntidadArrayLimpio.filter(entidad => !camasArrayLimpioEnHabitacion.includes(entidad));
                                const estructuraFinal = [];
                                for (const camaDisponible of camasDisponiblesNoInsertadas) {
                                    if (camasComoEntidadEstructuraFinal[camaDisponible]) {
                                        const estructuraFinalObjeto = {
                                            camaIDV: camaDisponible,
                                            camaUI: camasComoEntidadEstructuraFinal[camaDisponible]
                                        };
                                        estructuraFinal.push(estructuraFinalObjeto);
                                    }
                                }
                                const ok = {
                                    ok: estructuraFinal
                                };
                                salida.json(ok);
                            }
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                addCamaToConfiguracionApartamentoHabitacion: {
                    IDX: {
                        ROL: ["administrador"]
                    },
                    X: async () => {
                        try {
                            const camaIDV = entrada.body.camaIDV;
                            const habitacionUID = entrada.body.habitacionUID;
                            const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                            if (!camaIDV || !filtroCadenaMinusculasSinEspacios.test(camaIDV)) {
                                const error = "el campo 'camaIDV' solo puede ser letras minúsculas, numeros y sin espacios";
                                throw new Error(error);
                            }
                            if (!habitacionUID || !Number.isInteger(habitacionUID) || habitacionUID < 0) {
                                const error = "el campo 'habitacionUID' solo puede ser numeros";
                                throw new Error(error);
                            }
                            // validar la cama
                            const consultaCamaIDV = `
                            SELECT
                            capacidad,
                            "camaUI", 
                            cama
                            FROM camas
                            WHERE cama = $1;
                            `;
                            const resuelveConsultaCamaIDV = await conexion.query(consultaCamaIDV, [camaIDV]);
                            if (resuelveConsultaCamaIDV.rowCount === 0) {
                                const error = "No existe ninguna cama con ese identificador visual";
                                throw new Error(error);
                            }
                            const camaUI = resuelveConsultaCamaIDV.rows[0].camaUI;
                            const capacidad = resuelveConsultaCamaIDV.rows[0].capacidad;
                            const consultaHabitacion = `
                            SELECT 
                            habitacion, apartamento
                            FROM "configuracionHabitacionesDelApartamento"
                            WHERE uid = $1;
                            `;
                            const resuelveConsultaHabitacion = await conexion.query(consultaHabitacion, [habitacionUID]);
                            if (resuelveConsultaHabitacion.rowCount === 0) {
                                const error = "No hay ninguna habitacíon con ese UID";
                                throw new Error(error);
                            }
                            if (resuelveConsultaHabitacion.rowCount === 1) {
                                const apartamentoIDV = resuelveConsultaHabitacion.rows[0].apartamento;
                                const consultaApartamento = `
                                SELECT 
                                "estadoConfiguracion"
                                FROM "configuracionApartamento"
                                WHERE "apartamentoIDV" = $1;
                                `;
                                const resuelveConsultaApartamento = await conexion.query(consultaApartamento, [apartamentoIDV]);
                                if (resuelveConsultaApartamento.rows[0].estadoConfiguracion === "disponible") {
                                    const error = "No se puede anadir una habitacion cuando el estado de la configuracion es Disponible, cambie el estado a no disponible para realizar anadir una cama";
                                    throw new Error(error);
                                }
                                const habitacionIDV = resuelveConsultaHabitacion.rows[0].habitacion;
                                const resuelveCamasEnHabitacion = await conexion.query(`SELECT cama FROM "configuracionCamasEnHabitacion" WHERE habitacion = $1 AND cama = $2 `, [habitacionUID, camaIDV]);
                                if (resuelveCamasEnHabitacion.rowCount > 0) {
                                    const error = "Esta cama ya existe";
                                    throw new Error(error);
                                }
                                if (resuelveCamasEnHabitacion.rowCount === 0) {
                                    const insertarCamaEnHabitacion = `
                                    INSERT INTO "configuracionCamasEnHabitacion"
                                    (
                                    habitacion,
                                    cama
                                    )
                                    VALUES ($1, $2) RETURNING uid
                                    `;
                                    const resuelveInsertarHabitacion = await conexion.query(insertarCamaEnHabitacion, [habitacionUID, camaIDV]);
                                    if (resuelveInsertarHabitacion.rowCount === 0) {
                                        const error = `Se han pasado las validaciones pero la base de datos no ha insertado el registro`;
                                        throw new Error(error);
                                    }
                                    if (resuelveInsertarHabitacion.rowCount === 1) {
                                        const nuevoUID = resuelveInsertarHabitacion.rows[0].uid;
                                        const ok = {
                                            ok: "Se ha insertardo la cama correctamente en la habitacion",
                                            nuevoUID: nuevoUID,
                                            camaUI: camaUI,
                                            camaIDV: camaIDV,
                                            capaciad: capacidad
                                        };
                                        salida.json(ok);
                                    }
                                }
                            }
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                eliminarHabitacionDeConfiguracionDeAlojamiento: {
                    IDX: {
                        ROL: ["administrador"]
                    },
                    X: async () => {
                        try {
                            const habitacionUID = entrada.body.habitacionUID;
                            if (!habitacionUID || !Number.isInteger(habitacionUID) || habitacionUID < 0) {
                                const error = "el campo 'habitacionUID' solo puede ser numeros";
                                throw new Error(error);
                            }
                            const validarHabitacionUID = `
                                SELECT 
                                apartamento
                                FROM "configuracionHabitacionesDelApartamento"
                                WHERE uid = $1
                                `;
                            const resuelveValidarHabitacionUID = await conexion.query(validarHabitacionUID, [habitacionUID]);
                            if (resuelveValidarHabitacionUID.rowCount === 0) {
                                const error = "No existe la habitacion, revisa el habitacionUID";
                                throw new Error(error);
                            }
                            const apartamentoIDV = resuelveValidarHabitacionUID.rows[0].apartamento;
                            const consultaApartamento = `
                            SELECT 
                            "estadoConfiguracion"
                            FROM "configuracionApartamento"
                            WHERE "apartamentoIDV" = $1;
                            `;
                            const resuelveConsultaApartamento = await conexion.query(consultaApartamento, [apartamentoIDV]);
                            if (resuelveConsultaApartamento.rows[0].estadoConfiguracion === "disponible") {
                                const error = "No se puede eliminar una habitacion cuando el estado de la configuracion es Disponible, cambie el estado a no disponible para realizar anadir una cama";
                                throw new Error(error);
                            }
                            const eliminarHabitacion = `
                                DELETE FROM "configuracionHabitacionesDelApartamento"
                                WHERE uid = $1;
                                `;
                            const resuelveEliminarHabitacion = await conexion.query(eliminarHabitacion, [habitacionUID]);
                            if (resuelveEliminarHabitacion.rowCount === 0) {
                                const error = "No se ha eliminado la habitacion por que no se ha entonctrado el registo en la base de datos";
                                throw new Error(error);
                            }
                            if (resuelveEliminarHabitacion.rowCount === 1) {
                                const ok = {
                                    "ok": "Se ha eliminado correctamente la habitacion como entidad",
                                };
                                salida.json(ok);
                            }
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                eliminarCamaDeConfiguracionDeAlojamiento: {
                    IDX: {
                        ROL: ["administrador"]
                    },
                    X: async () => {
                        try {
                            const camaUID = entrada.body.camaUID;
                            if (!camaUID || !Number.isInteger(camaUID) || camaUID < 0) {
                                const error = "el campo 'camaUID' solo puede ser numeros";
                                throw new Error(error);
                            }
                            const validarHabitacionUID = `
                                SELECT 
                                habitacion
                                FROM "configuracionCamasEnHabitacion"
                                WHERE uid = $1
                                `;
                            const resuelveValidarHabitacionUID = await conexion.query(validarHabitacionUID, [camaUID]);
                            if (resuelveValidarHabitacionUID.rowCount === 0) {
                                const error = "No existe la cama, revisa el camaUID";
                                throw new Error(error);
                            }
                            const habitacionUID = resuelveValidarHabitacionUID.rows[0].habitacion;
                            const consultaIntermediaEscaleraHaciaArriba = `
                            SELECT 
                            apartamento
                            FROM "configuracionHabitacionesDelApartamento"
                            WHERE uid = $1;
                            `;
                            const resuelveConsultaIntermediaEscaleraHaciaArriba = await conexion.query(consultaIntermediaEscaleraHaciaArriba, [habitacionUID]);
                            const apartamentoIDV = resuelveConsultaIntermediaEscaleraHaciaArriba.rows[0].apartamento;
                            const consultaApartamento = `
                            SELECT 
                            "estadoConfiguracion"
                            FROM "configuracionApartamento"
                            WHERE "apartamentoIDV" = $1;
                            `;
                            const resuelveConsultaApartamento = await conexion.query(consultaApartamento, [apartamentoIDV]);
                            if (resuelveConsultaApartamento.rows[0].estadoConfiguracion === "disponible") {
                                const error = "No se puede eliminar una habitacion cuando el estado de la configuracion es Disponible, cambie el estado a no disponible para realizar anadir una cama";
                                throw new Error(error);
                            }
                            const eliminarCama = `
                                DELETE FROM "configuracionCamasEnHabitacion"
                                WHERE uid = $1;
                                `;
                            const resuelveEliminarCama = await conexion.query(eliminarCama, [camaUID]);
                            if (resuelveEliminarCama.rowCount === 0) {
                                const error = "No se ha eliminado la cama por que no se ha entcontrado el registro en la base de datos";
                                throw new Error(error);
                            }
                            if (resuelveEliminarCama.rowCount === 1) {
                                const ok = {
                                    "ok": "Se ha eliminado correctamente la cama de la habitacion",
                                };
                                salida.json(ok);
                            }
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                eliminarConfiguracionDeAlojamiento: {
                    IDX: {
                        ROL: ["administrador"]
                    },
                    X: async () => {
                        try {
                            const apartamentoIDV = entrada.body.apartamentoIDV;
                            const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                            if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
                                const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin espacios";
                                throw new Error(error);
                            }
                            const validarApartamentoUID = `
                                SELECT 
                                *
                                FROM "configuracionApartamento"
                                WHERE "apartamentoIDV" = $1
                                `;
                            const resuelveValidarApartamentoUID = await conexion.query(validarApartamentoUID, [apartamentoIDV]);
                            if (resuelveValidarApartamentoUID.rowCount === 0) {
                                const error = "No existe el perfil de configuracion del apartamento";
                                throw new Error(error);
                            }
                            const eliminarConfiguracionDeApartamento = `
                                DELETE FROM "configuracionApartamento"
                                WHERE "apartamentoIDV" = $1
                                `;
                            const resuelveEliminarApartamento = await conexion.query(eliminarConfiguracionDeApartamento, [apartamentoIDV]);
                            if (resuelveEliminarApartamento.rowCount === 0) {
                                const error = "No se ha eliminado la configuracion del apartamenro por que no se ha encontrado el registro en la base de datos";
                                throw new Error(error);
                            }
                            if (resuelveEliminarApartamento.rowCount > 0) {
                                const ok = {
                                    "ok": "Se ha eliminado correctamente la configuracion de apartamento",
                                };
                                salida.json(ok);
                            }
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                crearConfiguracionAlojamiento: {
                    IDX: {
                        ROL: ["administrador"]
                    },
                    X: async () => {
                        try {
                            const apartamentoIDV = entrada.body.apartamentoIDV;
                            const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                            if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV) || apartamentoIDV.length > 50) {
                                const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin pesacios. No puede tener mas de 50 caracteres";
                                throw new Error(error);
                            }
                            const validarIDV = `
                                SELECT 
                                "apartamentoUI"
                                FROM apartamentos
                                WHERE apartamento = $1
                                `;
                            const resuelveValidarIDV = await conexion.query(validarIDV, [apartamentoIDV]);
                            if (resuelveValidarIDV.rowCount === 0) {
                                const error = "No existe el apartamento como entidad. Primero crea la entidad y luego podras crear la configuiracíon";
                                throw new Error(error);
                            }
                            const validarUnicidadConfigurativa = `
                                SELECT 
                                *
                                FROM "configuracionApartamento"
                                WHERE "apartamentoIDV" = $1
                                `;
                            const resuelveValidarUnicidadConfigurativa = await conexion.query(validarUnicidadConfigurativa, [apartamentoIDV]);
                            if (resuelveValidarUnicidadConfigurativa.rowCount > 0) {
                                const error = "Ya existe una configuracion para la entidad del apartamento por favor selecciona otro apartamento como entidad";
                                throw new Error(error);
                            }
                            const estadoInicial = "nodisponible";
                            const crearConfiguracion = `
                                INSERT INTO "configuracionApartamento"
                                (
                                "apartamentoIDV",
                                "estadoConfiguracion"
                                )
                                VALUES 
                                (
                                $1,
                                $2
                                )
                                RETURNING "apartamentoIDV"
                                `;
                            const resuelveCrearConfiguracion = await conexion.query(crearConfiguracion, [apartamentoIDV, estadoInicial]);
                            if (resuelveCrearConfiguracion.rowCount === 0) {
                                const error = "No se ha podido crear la nueva configuracion";
                                throw new Error(error);
                            }
                            if (resuelveCrearConfiguracion.rowCount === 1) {
                                const ok = {
                                    ok: "Se ha creado correctament la nuevo configuracion del apartamento",
                                    apartamentoIDV: resuelveCrearConfiguracion.rows[0].apartamentoIDV
                                };
                                salida.json(ok);
                            }
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                cambiarEstadoConfiguracionAlojamiento: {
                    IDX: {
                        ROL: ["administrador"]
                    },
                    X: async () => {
                        try {
                            const apartamentoIDV = entrada.body.apartamentoIDV;
                            const nuevoEstado = entrada.body.nuevoEstado;
                            const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                            if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
                                const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin pesacios";
                                throw new Error(error);
                            }
                            if (!nuevoEstado || !filtroCadenaMinusculasSinEspacios.test(nuevoEstado)) {
                                const error = "el campo 'nuevoEstado' solo puede ser letras minúsculas, numeros y sin pesacios";
                                throw new Error(error);
                            }
                            const validarIDV = `
                                SELECT 
                                "estadoConfiguracion"
                                FROM "configuracionApartamento"
                                WHERE "apartamentoIDV" = $1
                                `;
                            const resuelveValidarIDV = await conexion.query(validarIDV, [apartamentoIDV]);
                            if (resuelveValidarIDV.rowCount === 0) {
                                const error = "No existe el apartamento como entidad. Primero crea la entidad y luego podras crear la configuiracíon";
                                throw new Error(error);
                            }
                            const estadoConfiguracionActual = resuelveValidarIDV.rows[0].estadoConfiguracion;
                            const validarEstadoIDV = `
                                SELECT 
                                *
                                FROM "estadoApartamentos"
                                WHERE estado = $1
                                `;
                            const resuelveValidarEstadoIDV = await conexion.query(validarEstadoIDV, [nuevoEstado]);
                            if (resuelveValidarEstadoIDV.rowCount === 0) {
                                const error = "Revisa el estado que has introducido por que no se conoce este estado para la configuracion del apartamento";
                                throw new Error(error);
                            }
                            if (nuevoEstado === "disponible") {
                                // Mirar que el apartamento tenga al menos una habitacion
                                const consultaHabitaciones = `
                                SELECT 
                                habitacion,
                                uid
                                FROM "configuracionHabitacionesDelApartamento"
                                WHERE apartamento = $1
                                `;
                                const resuelveConsultaHabitaciones = await conexion.query(consultaHabitaciones, [apartamentoIDV]);
                                if (resuelveConsultaHabitaciones.rowCount === 0) {
                                    const error = "No se puede poner en disponible esta configuracíon por que no es valida. Necesitas al menos una habitacíon en esta configuracíon y este apartamento no la tiene";
                                    throw new Error(error);
                                }
                                // Mirar que todas las habitaciones tengan una cama asignada
                                if (resuelveConsultaHabitaciones.rowCount > 0) {
                                    const habitacionesSinCama = [];
                                    const habitacionesEnConfiguracion = resuelveConsultaHabitaciones.rows;
                                    for (const detalleHabitacion of habitacionesEnConfiguracion) {
                                        const habitacionUID = detalleHabitacion.uid;
                                        const habitacionIDV = detalleHabitacion.habitacion;
                                        const resolucionHabitacionUI = await conexion.query(`SELECT "habitacionUI" FROM habitaciones WHERE habitacion = $1`, [habitacionIDV]);
                                        if (resolucionHabitacionUI.rowCount === 0) {
                                            const error = "No existe el identificador de la habitacionIDV";
                                            throw new Error(error);
                                        }
                                        const habitacionUI = resolucionHabitacionUI.rows[0].habitacionUI;
                                        const selectorHabitacionAsignada = await conexion.query(`SELECT "cama" FROM "configuracionCamasEnHabitacion" WHERE habitacion = $1`, [habitacionUID]);
                                        if (selectorHabitacionAsignada.rowCount === 0) {
                                            habitacionesSinCama.push(habitacionUI);
                                        }
                                    }
                                    if (habitacionesSinCama.length > 0) {
                                        let funsionArray = habitacionesSinCama.join(", "); // Fusiona los elementos con comas
                                        funsionArray = funsionArray.replace(/,([^,]*)$/, ' y $1');
                                        const error = `No se puede establecer el estado disponible por que la configuracion no es valida. Por favor revisa las camas asignadas ne las habitaciones. En las habitaciones ${funsionArray} no hay una sola cama signada como opcion. Por favor asigna la camas`;
                                        throw new Error(error);
                                    }
                                }
                                // Mira que tenga un perfil de precio creado y superiro 0
                                const consultaPerfilPrecio = await conexion.query(`SELECT precio FROM "preciosApartamentos" WHERE apartamento = $1`, [apartamentoIDV]);
                                if (consultaPerfilPrecio.rowCount === 0) {
                                    const error = "La configuración no es válida. No se puede establecer en disponible por que esta configuración no tiene asignado un perfil de precio para poder calcular los impuestos. Por favor establece un perfil de precio para esta configuración.";
                                    throw new Error(error);
                                }
                                if (consultaPerfilPrecio.rows[0].precio <= 0) {
                                    const error = "El apartamento tiene una configuracion correcta y tambien tiene un perfil de precio pero en el perfil de precio hay establecido 0.00 como precio base y no esta permitido.";
                                    throw new Error(error);
                                }
                                // No puede haber un estado disponible con precio base en 0.00
                            }
                            const actualizarEstadoConfiguracion = `
                            UPDATE "configuracionApartamento"
                            SET "estadoConfiguracion" = $1
                            WHERE "apartamentoIDV" = $2;
                            `;
                            const clienteActualizarEstadoConfiguracion = await conexion.query(actualizarEstadoConfiguracion, [nuevoEstado, apartamentoIDV]);
                            if (clienteActualizarEstadoConfiguracion.rowCount === 0) {
                                const error = "No se ha podido actualizar el estado de la configuracion del apartamento";
                                throw new Error(error);
                            }
                            if (clienteActualizarEstadoConfiguracion.rowCount === 1) {
                                const ok = {
                                    ok: "Se ha actualizado el estado correctamente",
                                    nuevoEstado: nuevoEstado
                                };
                                salida.json(ok);
                            }
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                gestionImagenConfiguracionApartamento: {
                    IDX: {
                        ROL: ["administrador"]
                    },
                    X: async () => {
                        try {
                            const apartamentoIDV = entrada.body.apartamentoIDV;
                            const contenidoArchivo = entrada.body.contenidoArchivo;
                            const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                            if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
                                const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin pesacios";
                                throw new Error(error);
                            }
                            const filtroBase64 = /^[A-Za-z0-9+/=]+$/;
                            if (typeof contenidoArchivo !== "string" || !filtroBase64.test(contenidoArchivo)) {
                                const error = "El campo contenido archivo solo acepta archivos codificados en base64";
                                throw new Error(error);
                            }
                            const esImagenPNG = (contenidoArchivo) => {
                                const binarioMagicoPNG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
                                // Decodifica la cadena base64 a un buffer
                                const buffer = Buffer.from(contenidoArchivo, 'base64');
                                // Compara los primeros 8 bytes del buffer con el binario mágico
                                return buffer.subarray(0, 8).compare(binarioMagicoPNG) === 0;
                            };
                            const esImagenTIFF = (contenidoArchivo) => {
                                const binarioMagicoTIFF = Buffer.from([73, 73, 42, 0]); // Puedes ajustar estos valores según el formato TIFF que estés buscando
                                const buffer = Buffer.from(contenidoArchivo, 'base64');
                                return buffer.subarray(0, 4).compare(binarioMagicoTIFF) === 0 || buffer.subarray(0, 4).compare(Buffer.from([77, 77, 0, 42])) === 0; // Otro formato posible
                            };
                            const esImagenJPEG = (contenidoArchivo) => {
                                const binarioMagicoJPEG = Buffer.from([255, 216, 255]);
                                const buffer = Buffer.from(contenidoArchivo, 'base64');
                                return buffer.subarray(0, 3).compare(binarioMagicoJPEG) === 0;
                            };
                            if (esImagenPNG(contenidoArchivo)) {
                            } else if (esImagenTIFF(contenidoArchivo)) {
                            } else if (esImagenJPEG(contenidoArchivo)) {
                            } else {
                                const error = "Solo se acetan imagenes PNG, TIFF, JPEG y JPG.";
                                throw new Error(error);
                            }
                            await conexion.query('BEGIN'); // Inicio de la transacción
                            const validarIDV = `
                                SELECT 
                                "estadoConfiguracion"
                                FROM "configuracionApartamento"
                                WHERE "apartamentoIDV" = $1
                                `;
                            const resuelveValidarIDV = await conexion.query(validarIDV, [apartamentoIDV]);
                            if (resuelveValidarIDV.rowCount === 0) {
                                const error = "No existe el apartamento como entidad. Primero crea la entidad y luego podras crear la configuiracíon";
                                throw new Error(error);
                            }
                            if (resuelveValidarIDV.rows[0].estadoConfiguracion === "disponible") {
                                const error = "No se puede actualizar la imagen de una configuracion de apartamento cuando esta disponbile,cambie el estado primero";
                                throw new Error(error);
                            }
                            const actualizarImagenConfiguracion = `
                            UPDATE "configuracionApartamento"
                            SET imagen = $1
                            WHERE "apartamentoIDV" = $2;
                            `;
                            const resuelveActualizarImagenConfiguracion = await conexion.query(actualizarImagenConfiguracion, [contenidoArchivo, apartamentoIDV]);
                            if (resuelveActualizarImagenConfiguracion.rowCount === 0) {
                                const error = "No se ha podido actualizar la imagen del apartmento reintentalo";
                                throw new Error(error);
                            }
                            if (resuelveActualizarImagenConfiguracion.rowCount === 1) {
                                const ok = {
                                    ok: "Se ha actualizado imagen correctamnte",
                                    imagen: String(contenidoArchivo)
                                };
                                salida.json(ok);
                            }
                            await conexion.query('COMMIT'); // Confirmar la transacción
                        } catch (errorCapturado) {
                            await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                },
                eliminarImagenConfiguracionApartamento: {
                    IDX: {
                        ROL: ["administrador"]
                    },
                    X: async () => {
                        try {
                            const apartamentoIDV = entrada.body.apartamentoIDV;
                            const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                            if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
                                const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin pesacios";
                                throw new Error(error);
                            }
                            const validarIDV = `
                                SELECT 
                                "estadoConfiguracion"
                                FROM "configuracionApartamento"
                                WHERE "apartamentoIDV" = $1
                                `;
                            const resuelveValidarIDV = await conexion.query(validarIDV, [apartamentoIDV]);
                            if (resuelveValidarIDV.rowCount === 0) {
                                const error = "No existe el apartamento como entidad. Primero crea la entidad y luego podras crear la configuiracíon";
                                throw new Error(error);
                            }
                            if (resuelveValidarIDV.rows[0].estadoConfiguracion === "disponible") {
                                const error = "No se puede actualizar la imagen de una configuracion de apartamento cuando esta disponbile,cambie el estado primero";
                                throw new Error(error);
                            }
                            const actualizarImagenConfiguracion = `
                            UPDATE "configuracionApartamento"
                            SET imagen = NULL
                            WHERE "apartamentoIDV" = $1;
                            `;
                            const resuelveActualizarImagenConfiguracion = await conexion.query(actualizarImagenConfiguracion, [apartamentoIDV]);
                            if (resuelveActualizarImagenConfiguracion.rowCount === 0) {
                                const error = "No se ha podido borrar la imagen del apartmento reintentalo";
                                throw new Error(error);
                            }
                            if (resuelveActualizarImagenConfiguracion.rowCount === 1) {
                                const ok = {
                                    ok: "Se ha borrado imagen correctamnte"
                                };
                                salida.json(ok);
                            }
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error)
                        }
                    }
                }
            },
        },
        usuarios: {
            IDX: {
                ROL: ["administrador"]
            },
            buscarUsuarios: async () => {
                try {
                    const buscar = entrada.body.buscar;
                    const nombreColumna = entrada.body.nombreColumna;
                    let sentidoColumna = entrada.body.sentidoColumna;
                    if (!buscar) {
                        let error = "se tiene que espeficiar 'buscar' y lo que se desea buscar";
                        throw new Error(error);
                    }
                    let Pagina = entrada.body.pagina;
                    Pagina = Pagina ? Pagina : 1;
                    if (typeof Pagina !== "number" || !Number.isInteger(Pagina) || Pagina <= 0) {
                        const error = "En 'pagina' solo se aceptan numero enteros superiores a cero y positivos. Nada de decimales";
                        throw new Error(error);
                    }
                    let condicionComplejaSQLOrdenarResultadosComoSegundaCondicion = "";
                    let nombreColumnaSentidoUI;
                    let nombreColumnaUI;
                    if (nombreColumna) {
                        const filtronombreColumna = /^[a-zA-Z]+$/;
                        if (!filtronombreColumna.test(nombreColumna)) {
                            const error = "el campo 'ordenClolumna' solo puede ser letras minúsculas y mayúsculas.";
                            throw new Error(error);
                        }
                        const consultaExistenciaNombreColumna = `
                                SELECT column_name
                                FROM information_schema.columns
                                WHERE table_name = 'datosDeUsuario' AND column_name = $1;
                                `;
                        const resuelveNombreColumna = await conexion.query(consultaExistenciaNombreColumna, [nombreColumna]);
                        if (resuelveNombreColumna.rowCount === 0) {
                            const error = "No existe el nombre de la columna que quieres ordenar";
                            throw new Error(error);
                        }
                        // OJO con la coma, OJO LA COMA ES IMPORTANTISMA!!!!!!!!
                        //!!!!!!!
                        if (sentidoColumna !== "descendente" && sentidoColumna !== "ascendente") {
                            sentidoColumna = "ascendente";
                        }
                        if (sentidoColumna == "ascendente") {
                            sentidoColumna = "ASC";
                            nombreColumnaSentidoUI = "ascendente";
                        }
                        if (sentidoColumna == "descendente") {
                            sentidoColumna = "DESC";
                            nombreColumnaSentidoUI = "descendente";
                        }
                        nombreColumnaUI = nombreColumna;
                        condicionComplejaSQLOrdenarResultadosComoSegundaCondicion = `,"${nombreColumna}" ${sentidoColumna}`;
                    }
                    const terminoBuscar = buscar.split(" ");
                    const terminosFormateados = [];
                    terminoBuscar.map((termino) => {
                        const terminoFinal = "%" + termino + "%";
                        terminosFormateados.push(terminoFinal);
                    });
                    const numeroPorPagina = 10;
                    const numeroPagina = Number((Pagina - 1) + "0");
                    const consultaConstructor = `    
                            SELECT "usuarioIDX", email, nombre, "primerApellido", "segundoApellido", pasaporte, telefono,
                            COUNT(*) OVER() as "totalUsuarios"
                            FROM "datosDeUsuario"
                            WHERE  
                            (
                                
                            LOWER(COALESCE("usuarioIDX", '')) ILIKE ANY($1) OR
                            LOWER(COALESCE(email, '')) ILIKE ANY($1) OR
                            LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1) OR
                            LOWER(COALESCE(telefono, '')) ILIKE ANY($1) OR
            
            
                            LOWER(COALESCE(nombre, '')) ILIKE ANY($1) OR
                            LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1) OR
                            LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1) OR
                            LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1)
                            )
                            ORDER BY
                            (
                              CASE
                                WHEN (
            
                                  (LOWER(COALESCE("usuarioIDX", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE(email, '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE(telefono, '')) ILIKE ANY($1))::int +
            
                                  (LOWER(COALESCE(nombre, '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int
                                ) = 1 THEN 1
                                WHEN (
            
            
                                  (LOWER(COALESCE("usuarioIDX", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE(email, '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE(telefono, '')) ILIKE ANY($1))::int +
            
                                  (LOWER(COALESCE(nombre, '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int
                                ) = 3 THEN 3
                                ELSE 2
                              END
                            ) DESC
                            ${condicionComplejaSQLOrdenarResultadosComoSegundaCondicion}
                        LIMIT $2 OFFSET $3;`;
                    const consultaUsuarios = await conexion.query(consultaConstructor, [terminosFormateados, numeroPorPagina, numeroPagina]);
                    const usuariosEncontrados = consultaUsuarios.rows;
                    const consultaConteoTotalFilas = usuariosEncontrados[0]?.totalUsuarios ? usuariosEncontrados[0].totalUsuarios : 0;
                    const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
                    const corretorNumeroPagina = String(numeroPagina).replace("0", "");
                    const Respuesta = {
                        buscar: buscar,
                        totalUsuarios: consultaConteoTotalFilas,
                        nombreColumna: nombreColumna,
                        paginasTotales: totalPaginas,
                        pagina: Number(corretorNumeroPagina) + 1,
                    };
                    if (nombreColumna) {
                        Respuesta.nombreColumna;
                        Respuesta.sentidoColumna = nombreColumnaSentidoUI;
                    }
                    usuariosEncontrados.map((detallesUsuario) => {
                        delete detallesUsuario.totalUsuarios;
                    });
                    Respuesta.usuarios = usuariosEncontrados;
                    salida.json(Respuesta);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    return salida.json(error)
                } finally {
                }
            },
            datosCuentaIDX: async () => {
                try {
                    const usuarioIDX = entrada.body.usuarioIDX;
                    const filtroCadena = /^[a-z0-9]+$/;
                    if (!usuarioIDX || !filtroCadena.test(usuarioIDX)) {
                        const error = "el campo 'usuarioIDX' solo puede ser letras minúsculas, numeros y sin pesacios";
                        throw new Error(error);
                    }
                    const consultaDetallesUsuario = `
                        SELECT 
                        usuario, 
                        rol,
                        "estadoCuenta"
                        FROM 
                        usuarios
                        WHERE 
                        usuario = $1;`;
                    const resolverConsultaDetallesUsuario = await conexion.query(consultaDetallesUsuario, [usuarioIDX]);
                    if (resolverConsultaDetallesUsuario.rowCount === 0) {
                        const error = "No existe ningun usuario con ese IDX";
                        throw new Error(error);
                    }
                    const detallesCliente = resolverConsultaDetallesUsuario.rows[0];
                    const ok = {
                        ok: detallesCliente
                    };
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            detallesUsuario: async () => {
                try {
                    const usuarioIDX = entrada.body.usuarioIDX;
                    const filtroCadena = /^[a-z0-9]+$/;
                    if (!usuarioIDX || !filtroCadena.test(usuarioIDX)) {
                        const error = "el campo 'usuarioIDX' solo puede ser letras minúsculas, numeros y sin pesacios";
                        throw new Error(error);
                    }

                    const ok = {
                        ok: {}
                    };
                    const consultaRol = `
                        SELECT 
                        rol,
                        "estadoCuenta"
                        FROM 
                        usuarios
                        WHERE 
                        usuario = $1;`;
                    const resolverUsuarioYRol = await conexion.query(consultaRol, [usuarioIDX]);
                    const rol = resolverUsuarioYRol.rows[0].rol;
                    const estadoCuenta = resolverUsuarioYRol.rows[0].estadoCuenta;
                    ok.ok.usuarioIDX = usuarioIDX;
                    ok.ok.rol = rol;
                    ok.ok.estadoCuenta = estadoCuenta;

                    const consultaDetallesUsuario = `
                        SELECT 
                        nombre,
                        "primerApellido",
                        "segundoApellido",
                        pasaporte,
                        telefono,
                        email
                        FROM 
                        "datosDeUsuario"
                        WHERE 
                        "usuarioIDX" = $1;`;
                    const resolverConsultaDetallesUsuario = await conexion.query(consultaDetallesUsuario, [usuarioIDX]);
                    let detallesCliente = resolverConsultaDetallesUsuario.rows[0];
                    if (resolverConsultaDetallesUsuario.rowCount === 0) {
                        const crearDatosUsuario = `
                            INSERT INTO "datosDeUsuario"
                            (
                            "usuarioIDX"
                            )
                            VALUES ($1) 
                            RETURNING
                            *
                            `;
                        const resuelveCrearFicha = await conexion.query(crearDatosUsuario, [usuarioIDX]);
                        detallesCliente = resuelveCrearFicha.rows[0];
                    }
                    for (const [dato, valor] of Object.entries(detallesCliente)) {
                        ok.ok[dato] = valor;
                    }

                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            actualizarDatosUsuarioDesdeAdministracion: async () => {
                try {
                    let usuarioIDX = entrada.body.usuarioIDX;
                    let nombre = entrada.body.nombre;
                    let primerApellido = entrada.body.primerApellido;
                    let segundoApellido = entrada.body.segundoApellido;
                    let pasaporte = entrada.body.pasaporte;
                    let telefono = entrada.body.telefono;
                    let email = entrada.body.email;
                    const validarDatosUsuario = {
                        usuarioIDX: usuarioIDX,
                        nombre: nombre,
                        primerApellido: primerApellido,
                        segundoApellido: segundoApellido,
                        pasaporte: pasaporte,
                        telefono: telefono,
                        email: email
                    };
                    const datosValidados = await validadoresCompartidos.usuarios.actualizarDatos(validarDatosUsuario);
                    usuarioIDX = datosValidados.usuarioIDX;
                    nombre = datosValidados.nombre;
                    primerApellido = datosValidados.primerApellido;
                    segundoApellido = datosValidados.segundoApellido;
                    pasaporte = datosValidados.pasaporte;
                    telefono = datosValidados.telefono;
                    email = datosValidados.email;
                    await conexion.query('BEGIN'); // Inicio de la transacción


                    // validar existencia de contrasena
                    const validarUsuario = `
                         SELECT 
                         usuario
                         FROM usuarios
                         WHERE usuario = $1;
                         `;
                    const resuelveValidarUsuario = await conexion.query(validarUsuario, [usuarioIDX]);
                    if (!resuelveValidarUsuario.rowCount === 0) {
                        const error = "No existe el usuario";
                        throw new Error(error);
                    }
                    const actualizarDatosUsuario2 = `
                        UPDATE "datosDeUsuario"
                        SET 
                          nombre = COALESCE(NULLIF($1, ''), nombre),
                          "primerApellido" = COALESCE(NULLIF($2, ''), "primerApellido"),
                          "segundoApellido" = COALESCE(NULLIF($3, ''), "segundoApellido"),
                          pasaporte = COALESCE(NULLIF($4, ''), pasaporte),
                          telefono = COALESCE(NULLIF($5, ''), telefono),
                          email = COALESCE(NULLIF($6, ''), email)
                        WHERE "usuarioIDX" = $7
                        RETURNING 
                          nombre,
                          "primerApellido",
                          "segundoApellido",
                          pasaporte,
                          telefono,
                          email;                       
                        `;
                    const datos = [
                        nombre,
                        primerApellido,
                        segundoApellido,
                        pasaporte,
                        telefono,
                        email,
                        usuarioIDX,
                    ];
                    const resuelveActualizarDatosUsuario2 = await conexion.query(actualizarDatosUsuario2, datos);
                    if (resuelveActualizarDatosUsuario2.rowCount === 1) {
                        const datosActualizados = resuelveActualizarDatosUsuario2.rows;
                        const ok = {
                            ok: "El comportamiento se ha actualizado bien junto con los apartamentos dedicados",
                            datosActualizados: datosActualizados
                        };
                        salida.json(ok);
                    }
                    await conexion.query('COMMIT'); // Confirmar la transacción
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            actualizarIDXAdministracion: async () => {
                try {
                    const usuarioIDX = entrada.body.usuarioIDX;
                    let nuevoIDX = entrada.body.nuevoIDX;
                    const filtroCantidad = /^\d+\.\d{2}$/;
                    const filtro_minúsculas_Mayusculas_numeros_espacios = /^[a-zA-Z0-9\s]+$/;
                    const filtro_minúsculas_numeros = /^[a-z0-9]+$/;
                    const filtroNumeros = /^[0-9]+$/;
                    const filtroCadenaSinEspacio = /^[a-z0-9]+$/;
                    if (!usuarioIDX || !filtro_minúsculas_numeros.test(usuarioIDX)) {
                        const error = "El campo usuarioIDX solo admite minúsculas y numeros";
                        throw new Error(error);
                    }
                    nuevoIDX = nuevoIDX.toLowerCase();
                    if (!nuevoIDX || !filtro_minúsculas_numeros.test(nuevoIDX)) {
                        const error = "El campo nuevoIDX solo admite minúsculas y numeros";
                        throw new Error(error);
                    }
                    await componentes.eliminarCuentasNoVerificadas();
                    await conexion.query('BEGIN'); // Inicio de la transacción
                    const actualizarIDX = `
                        UPDATE usuarios
                        SET 
                            usuario = $2
                        WHERE 
                            usuario = $1
                        RETURNING 
                            usuario           
                        `;
                    const datos = [
                        usuarioIDX,
                        nuevoIDX
                    ];
                    nuevoIDX = `"${nuevoIDX}"`;
                    const resuelveActualizarIDX = await conexion.query(actualizarIDX, datos);
                    if (resuelveActualizarIDX.rowCount === 0) {
                        const error = "No existe el nombre de usuario";
                        throw new Error(error);
                    }
                    if (resuelveActualizarIDX.rowCount === 1) {
                        const actualizarSessionesActivas = `
                            UPDATE sessiones
                            SET sess = jsonb_set(sess::jsonb, '{usuario}', $1::jsonb)::json
                            WHERE sess->>'usuario' = $2;
                                                   
                            `;
                        await conexion.query(actualizarSessionesActivas, [nuevoIDX, usuarioIDX]);
                        const IDXEstablecido = resuelveActualizarIDX.rows[0].usuario;
                        const ok = {
                            "ok": "Se ha actualizado el IDX correctamente",
                            usuarioIDX: IDXEstablecido
                        };
                        salida.json(ok);
                    }
                    await conexion.query('COMMIT'); // Confirmar la transacción
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            actualizarClaveUsuarioAdministracion: async () => {
                try {
                    const usuarioIDX = entrada.body.usuarioIDX;
                    const claveNueva = entrada.body.claveNueva;
                    const claveNuevaDos = entrada.body.claveNuevaDos;
                    const filtro_minúsculas_numeros = /^[a-z0-9]+$/;
                    if (!usuarioIDX || !filtro_minúsculas_numeros.test(usuarioIDX)) {
                        const error = "El campo usuarioIDX solo admite minúsculas y numeros";
                        throw new Error(error);
                    }
                    if (claveNueva !== claveNuevaDos) {
                        const error = "No has escrito dos veces la misma nueva contrasena";
                        throw new Error(error);
                    } else {
                        validadoresCompartidos.claves.minimoRequisitos(claveNueva);
                    }
                    const cryptoData = {
                        sentido: "cifrar",
                        clavePlana: claveNueva
                    };
                    const retorno = vitiniCrypto(cryptoData);
                    const nuevaSal = retorno.nuevaSal;
                    const hashCreado = retorno.hashCreado;
                    await conexion.query('BEGIN'); // Inicio de la transacción
                    const actualizarClave = `
                        UPDATE usuarios
                        SET 
                            clave = $1,
                            sal = $2
                        WHERE 
                            usuario = $3
                        `;
                    const datos = [
                        hashCreado,
                        nuevaSal,
                        usuarioIDX
                    ];
                    const resuelveActualizarClave = await conexion.query(actualizarClave, datos);
                    if (resuelveActualizarClave.rowCount === 1) {
                        const ok = {
                            "ok": "Se ha actualizado la nueva clave"
                        };
                        salida.json(ok);
                    }
                    await conexion.query('COMMIT'); // Confirmar la transacción
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            actualizarEstadoCuentaDesdeAdministracion: async () => {
                try {
                    const usuarioIDX = entrada.body.usuarioIDX;
                    const nuevoEstado = entrada.body.nuevoEstado;
                    const filtro_minúsculas_numeros = /^[a-z0-9]+$/;
                    if (!usuarioIDX || !filtro_minúsculas_numeros.test(usuarioIDX)) {
                        const error = "El campo usuarioIDX solo admite minúsculas y numeros";
                        throw new Error(error);
                    }
                    if (nuevoEstado !== "activado" && nuevoEstado !== "desactivado") {
                        const error = "El campo nuevoEstado solo puede ser activado o desactivado";
                        throw new Error(error);
                    }
                    // validar existencia de contrasena
                    const validarClave = `
                        SELECT 
                        clave
                        FROM usuarios
                        WHERE usuario = $1;
                        `;
                    const resuelveValidarClave = await conexion.query(validarClave, [usuarioIDX]);
                    if (!resuelveValidarClave.rows[0].clave) {
                        const error = "No se puede activar una cuenta que carece de contrasena, por favor establece una contrasena primero";
                        throw new Error(error);
                    }
                    await conexion.query('BEGIN'); // Inicio de la transacción
                    const actualizarEstadoCuenta = `
                        UPDATE usuarios
                        SET 
                            "estadoCuenta" = $1
                        WHERE 
                            usuario = $2
                        `;
                    const datos = [
                        nuevoEstado,
                        usuarioIDX
                    ];
                    const resuelveEstadoCuenta = await conexion.query(actualizarEstadoCuenta, datos);
                    if (resuelveEstadoCuenta.rowCount === 0) {
                        const error = "No se encuentra el usuario";
                        throw new Error(error);
                    }
                    if (resuelveEstadoCuenta.rowCount === 1) {
                        if (nuevoEstado !== "desactivado") {
                            const cerrarSessiones = `
                                DELETE FROM sessiones
                                WHERE sess->> 'usuario' = $1;
                                `;
                            await conexion.query(cerrarSessiones, [usuarioIDX]);
                        }
                        const ok = {
                            ok: "Se ha actualizado el estado de la cuenta",
                            estadoCuenta: nuevoEstado
                        };
                        salida.json(ok);
                    }
                    await conexion.query('COMMIT'); // Confirmar la transacción
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            eliminarCuentaDesdeAdministracion: async () => {
                try {
                    const usuarioIDX = entrada.body.usuarioIDX;
                    const filtro_minúsculas_numeros = /^[a-z0-9]+$/;
                    if (!usuarioIDX || !filtro_minúsculas_numeros.test(usuarioIDX)) {
                        const error = "El campo usuarioIDX solo admite minúsculas y numeros";
                        throw new Error(error);
                    }
                    await conexion.query('BEGIN'); // Inicio de la transacción


                    // Validar si es un usuario administrador
                    const validarTipoCuenta = `
                        SELECT 
                        rol
                        FROM usuarios
                        WHERE usuario = $1;
                        `;
                    const resuelveValidarTipoCuenta = await conexion.query(validarTipoCuenta, [usuarioIDX]);
                    const rol = resuelveValidarTipoCuenta.rows[0].rol;
                    const rolAdministrador = "administrador";
                    if (rol === rolAdministrador) {
                        const validarUltimoAdministrador = `
                            SELECT 
                            rol
                            FROM usuarios
                            WHERE rol = $1;
                            `;
                        const resuelValidarUltimoAdministrador = await conexion.query(validarUltimoAdministrador, [rolAdministrador]);
                        if (resuelValidarUltimoAdministrador.rowCount === 1) {
                            const error = "No se puede eliminar esta cuenta por que es la unica cuenta adminsitradora existente. Si quieres eliminar esta cuenta tienes que crear otra cuenta administradora. Por que en el sistema debe de existir al menos una cuenta adminitrador";
                            throw new Error(error);
                        }
                    }
                    const cerrarSessiones = `
                        DELETE FROM sessiones
                        WHERE sess->> 'usuario' = $1;
                        `;
                    await conexion.query(cerrarSessiones, [usuarioIDX]);
                    const eliminarCuenta = `
                        DELETE FROM usuarios
                        WHERE usuario = $1;
                        `;
                    const resuelveEliminarCuenta = await conexion.query(eliminarCuenta, [usuarioIDX]);
                    if (resuelveEliminarCuenta.rowCount === 0) {
                        const error = "No se encuentra el usuario";
                        throw new Error(error);
                    }
                    if (resuelveEliminarCuenta.rowCount === 1) {
                        const ok = {
                            ok: "Se ha eliminado correctamente la cuenta de usuario",
                        };
                        salida.json(ok);
                    }
                    await conexion.query('COMMIT');
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK');
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            crearCuentaDesdeAdministracion: async () => {
                try {
                    const usuarioIDX = entrada.body.usuarioIDX;
                    const clave = entrada.body.clave;
                    const rol = entrada.body.rol;
                    const filtro_minúsculas_numeros = /^[a-z0-9]+$/;
                    if (!usuarioIDX || !filtro_minúsculas_numeros.test(usuarioIDX)) {
                        const error = "El campo usuarioIDX solo admite minúsculas y numeros y nada mas";
                        throw new Error(error);
                    }
                    if (usuarioIDX === "crear" || usuarioIDX === "buscador") {
                        const error = "El nombre de usuario no esta disponbile, escoge otro";
                        throw new Error(error);
                    }
                    if (!rol) {
                        const error = "Selecciona un rol para la nueva cuenta de usuario";
                        throw new Error(error);
                    }
                    if (!filtro_minúsculas_numeros.test(rol)) {
                        const error = "El campo rol solo admite minúsculas y numeros y nada mas";
                        throw new Error(error);
                    }
                    // validar rol
                    const validarRol = `
                        SELECT 
                        rol
                        FROM "usuariosRoles"
                        WHERE rol = $1
                        `;
                    const resuelveValidarRol = await conexion.query(validarRol, [rol]);
                    if (resuelveValidarRol.rowCount === 0) {
                        const error = "No existe el rol, revisa el rol introducido";
                        throw new Error(error);
                    }
                    // comporbar que no exista la el usuario
                    const validarNuevoUsuario = `
                        SELECT 
                        usuario
                        FROM usuarios
                        WHERE usuario = $1
                        `;
                    const resuelveValidarNuevoUsaurio = await conexion.query(validarNuevoUsuario, [usuarioIDX]);
                    if (resuelveValidarNuevoUsaurio.rowCount > 0) {
                        const error = "El nombre de usuario no esta disponbile, escoge otro";
                        throw new Error(error);
                    }
                    await componentes.eliminarCuentasNoVerificadas();
                    const estadoCuenta = "desactivado";
                    await conexion.query('BEGIN'); // Inicio de la transacción
                    const cryptoData = {
                        sentido: "cifrar",
                        clavePlana: clave
                    };
                    const retorno = vitiniCrypto(cryptoData);
                    const nuevaSal = retorno.nuevaSal;
                    const hashCreado = retorno.hashCreado;
                    const cuentaVerificada = "no";
                    const crearNuevoUsuario = `
                        INSERT INTO usuarios
                        (
                        usuario,
                        rol,
                        "estadoCuenta",
                        sal,
                        clave,
                        "cuentaVerificada"
                        )
                        VALUES 
                        ($1, $2, $3, $4, $5, $6)
                        RETURNING
                        usuario
                        `;
                    const datosNuevoUsuario = [
                        usuarioIDX,
                        rol,
                        estadoCuenta,
                        nuevaSal,
                        hashCreado,
                        cuentaVerificada
                    ];
                    const resuelveCrearNuevoUsuario = await conexion.query(crearNuevoUsuario, datosNuevoUsuario);
                    if (resuelveCrearNuevoUsuario.rowCount === 0) {
                        const error = "No se ha insertado el nuevo usuario en la base de datos";
                        throw new Error(error);
                    }
                    const crearNuevosDatosUsuario = `
                        INSERT INTO "datosDeUsuario"
                        (
                        "usuarioIDX"
                        )
                        VALUES 
                        ($1)
                        `;
                    const resuelveCrearNuevosDatosUsuario = await conexion.query(crearNuevosDatosUsuario, [usuarioIDX]);
                    if (resuelveCrearNuevosDatosUsuario.rowCount === 0) {
                        const error = "No se ha insertado los datos del nuevo usuario";
                        throw new Error(error);
                    }
                    const ok = {
                        ok: "Se ha creado el nuevo usuario",
                        usuarioIDX: resuelveCrearNuevoUsuario.rows[0].usuario
                    };
                    salida.json(ok);
                    await conexion.query('COMMIT');
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK');
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            obtenerRoles: async () => {
                try {
                    const consultaRoles = `
                        SELECT 
                        rol, 
                        "rolUI"
                        FROM 
                        "usuariosRoles";`;
                    const resolverConsultaRoles = await conexion.query(consultaRoles);
                    if (resolverConsultaRoles.rowCount === 0) {
                        const error = "No existe ningún rol";
                        throw new Error(error);
                    }
                    const roles = resolverConsultaRoles.rows;
                    const ok = {
                        ok: roles
                    };
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            actualizarRolCuenta: async () => {
                try {
                    const usuarioIDX = entrada.body.usuarioIDX;
                    const nuevoRol = entrada.body.nuevoRol;
                    const filtro_minúsculas_numeros = /^[a-z0-9]+$/;
                    if (!usuarioIDX || !filtro_minúsculas_numeros.test(usuarioIDX)) {
                        const error = "El campo usuarioIDX solo admite minúsculas y numeros";
                        throw new Error(error);
                    }
                    if (!nuevoRol || !filtro_minúsculas_numeros.test(nuevoRol)) {
                        const error = "El rolIDX solo admine minúsculas y numeros y nada mas";
                        throw new Error(error);
                    }
                    await conexion.query('BEGIN'); // Inicio de la transacción


                    // Validas usaurios
                    const validarUsuario = `
                        SELECT 
                        usuario
                        FROM usuarios
                        WHERE usuario = $1;
                        `;
                    const resuelveValidarUsuario = await conexion.query(validarUsuario, [usuarioIDX]);
                    if (resuelveValidarUsuario.rowCount === 0) {
                        const error = "No existe el usuarios";
                        throw new Error(error);
                    }
                    // Validar rol
                    const validarRol = `
                        SELECT 
                        "rolUI",
                        rol
                        FROM "usuariosRoles"
                        WHERE rol = $1;
                        `;
                    const resuelveValidarRol = await conexion.query(validarRol, [nuevoRol]);
                    if (resuelveValidarRol.rowCount === 0) {
                        const error = "No existe el rol";
                        throw new Error(error);
                    }
                    const rolUI = resuelveValidarRol.rows[0].rolUI;
                    const rolIDV = resuelveValidarRol.rows[0].rol;
                    // Validar que el usuario que hace el cambio sea administrador
                    const IDXActor = entrada.session.usuario;
                    const validarIDXActor = `
                        SELECT 
                        rol
                        FROM usuarios
                        WHERE usuario = $1;
                        `;
                    const resuelveValidarIDXActor = await conexion.query(validarIDXActor, [IDXActor]);
                    if (resuelveValidarIDXActor.rowCount === 0) {
                        const error = "No existe el usuario de origen que intenta realizar esta operacion.";
                        throw new Error(error);
                    }
                    const rolActor = resuelveValidarIDXActor.rows[0].rol;
                    if (rolActor !== "administrador") {
                        const error = "No estas autorizado a realizar un cambio de rol. Solo los Administradores pueden realizar cambios de rol";
                        throw new Error(error);
                    }
                    const actualizarRol = `
                        UPDATE
                        usuarios
                        SET
                        rol = $1
                        WHERE
                        usuario = $2;
                        `;
                    const resuelveActualizarRol = await conexion.query(actualizarRol, [nuevoRol, usuarioIDX]);
                    if (resuelveActualizarRol.rowCount === 0) {
                        const error = "No se ha podido actualizar el rol de este usuario";
                        throw new Error(error);
                    }
                    // Actualizar la fila sessiones
                    const consultaActualizarSessionesActuales = `
                        UPDATE sessiones
                        SET sess = jsonb_set(sess::jsonb, '{rol}', to_jsonb($2::text))
                        WHERE sess->>'usuario' = $1;`;
                    await conexion.query(consultaActualizarSessionesActuales, [usuarioIDX, nuevoRol]);
                    const ok = {
                        ok: "Se ha actualizado el rol en esta cuenta",
                        rolIDV: rolIDV,
                        rolUI: rolUI
                    };
                    salida.json(ok);
                    await conexion.query('COMMIT'); // Confirmar la transacción
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                } finally {
                }
            }
        },
        componentes: {
            apartamentosDisponiblesConfigurados: async () => {
                try {
                    const apartamentosDisponiblesParaCrearOfertas = `
                        SELECT 
                        ca."apartamentoIDV",
                        ea."estadoUI",
                        a."apartamentoUI"
                        FROM "configuracionApartamento" ca
                        JOIN "estadoApartamentos" ea ON ca."estadoConfiguracion" = ea.estado
                        JOIN apartamentos a ON ca."apartamentoIDV" = a.apartamento;            
          
                        `;
                    const resulveApartamentosDisponiblesParaCrearOfertas = await conexion.query(apartamentosDisponiblesParaCrearOfertas);
                    if (resulveApartamentosDisponiblesParaCrearOfertas.rowCount === 0) {
                        const error = "No hay ningun apartamento disponible configurado";
                        throw new Error(error);
                    }
                    const apartamenosDisponiblesEcontrados = resulveApartamentosDisponiblesParaCrearOfertas.rows;
                    const ok = {
                        ok: apartamenosDisponiblesEcontrados
                    };
                    salida.json(ok);
                } catch (errorCatpurado) {
                    const error = {
                        error: errorCapurado.message
                    };
                    salida.json(error)
                } finally {
                }
            },
            UI: async (entrada, salida) => {
                try {
                    
                    const administracionJS = administracionUI();
                    const ok = {
                        ok: administracionJS
                    };
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                }
            },
            calculadora: () => {
                try {
                    const numero1 = entrada.body.numero1;
                    const numero2 = entrada.body.numero2;
                    const operador = entrada.body.operador;
                    const validarNumero = (numero) => {
                        const regex = /^-?\d+(\.\d{1,2})?$/;
                        return regex.test(numero);
                    };
                    const validarOperador = (operador) => {
                        const operadoresValidos = ['+', '-', '*', '/', '%'];
                        return operadoresValidos.includes(operador);
                    };
                    if (!validarNumero(numero1) || !validarNumero(numero2)) {
                        const error = 'Entrada no válida. Por favor, ingrese números enteros o con hasta dos decimales.';
                        throw new Error(error);
                    }
                    if (!validarOperador(operador)) {
                        const error = 'Operador no válido. Los operadores válidos son +, -, *, /.';
                        throw new Error(error);
                    }
                    const resultado = utilidades.calculadora(numero1, numero2, operador);
                    const ok = {
                        ok: resultado
                    };
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                }
            },
            crearEnlacesPDF: async () => {
                try {
                    const reserva = entrada.body.reserva;
                    const enlaces = await componentes.gestionEnlacesPDF.crearEnlacePDF(reserva);
                    const ok = {
                        ok: "ok",
                        enlaces: enlaces
                    };
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error)
                }
            }
        },
        calendario: {
            capas: {
                reservas: async () => {
                    try {
                        const fecha = entrada.body.fecha;
                        const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;
                        if (!filtroFecha.test(fecha)) {
                            const error = "La fecha no cumple el formato especifico para el calendario. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante.";
                            throw new Error(error);
                        }
                        const eventos = await eventosReservas(fecha);
                        const ok = {
                            ok: "Aqui tienes las reservas de este mes",
                            ...eventos
                        };
                        salida.json(ok);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        return salida.json(error)
                    }
                },
                todosLosApartamentos: async () => {
                    try {
                        const fecha = entrada.body.fecha;
                        const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;
                        if (!filtroFecha.test(fecha)) {
                            const error = "La fecha no cumple el formato especifico para el calendario. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante.";
                            throw new Error(error);
                        }
                        const eventos = await eventosTodosLosApartamentos(fecha);
                        const ok = {
                            ok: "Aqui tienes todos los apartamentos de este mes",
                            ...eventos
                        };
                        salida.json(ok);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        return salida.json(error)
                    }
                },
                todosLosBloqueos: async () => {
                    try {
                        const fecha = entrada.body.fecha;
                        const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;
                        if (!filtroFecha.test(fecha)) {
                            const error = "La fecha no cumple el formato especifico para el calendario. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante.";
                            throw new Error(error);
                        }
                        await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado();
                        const eventos = await eventosTodosLosBloqueos(fecha);
                        const ok = {
                            ok: "Aqui tienes todos los apartamentos de este mes",
                            ...eventos
                        };
                        salida.json(ok);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        return salida.json(error)
                    }
                },
                porApartamento: async () => {
                    try {
                        const fecha = entrada.body.fecha;
                        const apartamentoIDV = entrada.body.apartamentoIDV;
                        const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;
                        if (!filtroFecha.test(fecha)) {
                            const error = "La fecha no cumple el formato especifico para el calendario. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante.";
                            throw new Error(error);
                        }
                        const filtroCadena = /^[a-z0-9]+$/;
                        if (!filtroCadena.test(apartamentoIDV) || typeof apartamentoIDV !== "string") {
                            const error = "el campo 'apartamentoIDV' solo puede ser una cadena de letras minúsculas y numeros.";
                            throw new Error(error);
                        }
                        await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado();
                        const metadatosEventos = {
                            fecha: fecha,
                            apartamentoIDV: apartamentoIDV
                        };
                        const eventos = await eventosPorApartamneto(metadatosEventos);
                        const ok = {
                            ok: "Aqui tienes las reservas de este mes",
                            ...eventos
                        };
                        salida.json(ok);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        return salida.json(error)
                    }
                },
                global: async () => {
                    try {
                        const fecha = entrada.body.fecha;
                        const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;
                        if (!filtroFecha.test(fecha)) {
                            const error = "La fecha no cumple el formato especifico para el calendario. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante.";
                            throw new Error(error);
                        }
                        const constructorObjetoPorDias = (fecha) => {
                            const fechaArray = fecha.split("-");
                            const mes = fechaArray[0];
                            const ano = fechaArray[1];
                            const fechaObjeto = DateTime.fromObject({ year: ano, month: mes, day: 1 });
                            const numeroDeDiasDelMes = fechaObjeto.daysInMonth;
                            const calendarioObjeto = {};
                            for (let numeroDia = 1; numeroDia <= numeroDeDiasDelMes; numeroDia++) {
                                const llaveCalendarioObjeto = `${ano}-${mes}-${numeroDia}`;
                                calendarioObjeto[llaveCalendarioObjeto] = [];
                            }
                            return calendarioObjeto;
                        };
                        const mesPorDias = constructorObjetoPorDias(fecha);
                        const estructuraGlobal = {
                            eventosMes: mesPorDias,
                            eventosEnDetalles: []
                        };
                        const eventosReservas_ = await eventosReservas(fecha);
                        for (const [fechaDia, contenedorEventos] of Object.entries(eventosReservas_.eventosMes)) {
                            const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                            selectorDia.push(...contenedorEventos);
                        }
                        estructuraGlobal.eventosEnDetalles.push(...eventosReservas_.eventosEnDetalle);
                        const eventosTodosLosApartamentos_ = await eventosTodosLosApartamentos(fecha);
                        for (const [fechaDia, contenedorEventos] of Object.entries(eventosTodosLosApartamentos_.eventosMes)) {
                            const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                            selectorDia.push(...contenedorEventos);
                        }
                        estructuraGlobal.eventosEnDetalles.push(...eventosTodosLosApartamentos_.eventosEnDetalle);
                        const eventosTodosLosBloqueos_ = await eventosTodosLosBloqueos(fecha);
                        for (const [fechaDia, contenedorEventos] of Object.entries(eventosTodosLosBloqueos_.eventosMes)) {
                            const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                            selectorDia.push(...contenedorEventos);
                        }
                        estructuraGlobal.eventosEnDetalles.push(...eventosTodosLosBloqueos_.eventosEnDetalle);
                        // Obtengo todo los uids de los calendarios sincronizados en un objeto y lo itero
                        const plataformaAibnb = "airbnb";
                        const obtenerUIDCalendriosSincronizadosAirbnb = `
                            SELECT uid
                            FROM "calendariosSincronizados"
                            WHERE "plataformaOrigen" = $1
                            `;
                        const calendariosSincronizadosAirbnbUIDS = await conexion.query(obtenerUIDCalendriosSincronizadosAirbnb, [plataformaAibnb]);
                        if (calendariosSincronizadosAirbnbUIDS.rowCount > 0) {
                            const calendariosUIDS = calendariosSincronizadosAirbnbUIDS.rows.map((calendario) => {
                                return calendario.uid;
                            });
                            for (const calendarioUID of calendariosUIDS) {
                                const metadatosEventos = {
                                    fecha: fecha,
                                    calendarioUID: String(calendarioUID)
                                };
                                const eventosPorApartamentoAirbnb_ = await eventosPorApartamentoAirbnb(metadatosEventos);
                                for (const [fechaDia, contenedorEventos] of Object.entries(eventosPorApartamentoAirbnb_.eventosMes)) {
                                    const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                                    selectorDia.push(...contenedorEventos);
                                }
                                estructuraGlobal.eventosEnDetalles.push(...eventosPorApartamentoAirbnb_.eventosEnDetalle);
                            }
                        }
                        salida.json(estructuraGlobal);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        return salida.json(error)
                    }
                },
                multiCapa: async () => {
                    try {
                        const fecha = entrada.body.fecha;
                        const contenedorCapas = entrada.body.contenedorCapas;
                        const capas = contenedorCapas?.capas;
                        const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;
                        if (!filtroFecha.test(fecha)) {
                            const error = "La fecha no cumple el formato especifico para el calendario. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante.";
                            throw new Error(error);
                        }
                        if (!capas) {
                            const error = "Falta determinar capas, debe de ser un array con las cadenas de las capasIDV";
                            throw new Error(error);
                        }
                        if (!Array.isArray(capas) || capas == null || capas === undefined) {
                            const error = "El campo capaIDV debe de ser un array con cadenas";
                            throw new Error(error);
                        }
                        const filtroCapa = /^[a-zA-Z0-9]+$/;
                        const controlCapaIDV = capas.every(cadena => {
                            if (typeof cadena !== "string") {
                                return false;
                            }
                            return filtroCapa.test(cadena);
                        });
                        if (!controlCapaIDV) {
                            const error = "Los identificadores visuales de las capas solo pueden contener, minusculas, mayusculas y numeros";
                            throw new Error(error);
                        }
                        const constructorObjetoPorDias = (fecha) => {
                            const fechaArray = fecha.split("-");
                            const mes = fechaArray[0];
                            const ano = fechaArray[1];
                            const fechaObjeto = DateTime.fromObject({ year: ano, month: mes, day: 1 });
                            const numeroDeDiasDelMes = fechaObjeto.daysInMonth;
                            const calendarioObjeto = {};
                            for (let numeroDia = 1; numeroDia <= numeroDeDiasDelMes; numeroDia++) {
                                const llaveCalendarioObjeto = `${ano}-${mes}-${numeroDia}`;
                                calendarioObjeto[llaveCalendarioObjeto] = [];
                            }
                            return calendarioObjeto;
                        };
                        const mesPorDias = constructorObjetoPorDias(fecha);
                        const estructuraGlobal = {
                            eventosMes: mesPorDias,
                            eventosEnDetalle: []
                        };
                        const capasComoComponentes = {
                            reservas: async () => {
                                const eventosReservas_ = await eventosReservas(fecha);
                                for (const [fechaDia, contenedorEventos] of Object.entries(eventosReservas_.eventosMes)) {
                                    const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                                    selectorDia.push(...contenedorEventos);
                                }
                                estructuraGlobal.eventosEnDetalle.push(...eventosReservas_.eventosEnDetalle);
                            },
                            todosLosApartamentos: async () => {
                                const eventosTodosLosApartamentos_ = await eventosTodosLosApartamentos(fecha);
                                for (const [fechaDia, contenedorEventos] of Object.entries(eventosTodosLosApartamentos_.eventosMes)) {
                                    const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                                    selectorDia.push(...contenedorEventos);
                                }
                                estructuraGlobal.eventosEnDetalle.push(...eventosTodosLosApartamentos_.eventosEnDetalle);
                            },
                            todosLosBloqueos: async () => {
                                await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado();
                                const eventosTodosLosBloqueos_ = await eventosTodosLosBloqueos(fecha);
                                for (const [fechaDia, contenedorEventos] of Object.entries(eventosTodosLosBloqueos_.eventosMes)) {
                                    const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                                    selectorDia.push(...contenedorEventos);
                                }
                                estructuraGlobal.eventosEnDetalle.push(...eventosTodosLosBloqueos_.eventosEnDetalle);
                            },
                            porApartamento: async () => {
                                const apartamentosIDV = contenedorCapas.capasCompuestas.porApartamento;
                                if (!Array.isArray(apartamentosIDV) || apartamentosIDV == null || apartamentosIDV === undefined) {
                                    const error = "El campo apartamentosIDV debe de ser un array con cadenas";
                                    throw new Error(error);
                                }
                                const filtroCapa = /^[a-zA-Z0-9]+$/;
                                const controlApartamentoIDV = apartamentosIDV.every(cadena => {
                                    if (typeof cadena !== "string") {
                                        return false;
                                    }
                                    return filtroCapa.test(cadena);
                                });
                                if (!controlApartamentoIDV) {
                                    const error = "Los identificadores visuales de los apartamentos solo pueden contener, minusculas, mayusculas y numeros";
                                    throw new Error(error);
                                }
                                // Validar que le nombre del apartamento existe como tal
                                const obtenerApartamentosIDV = `
                                        SELECT "apartamentoIDV"
                                        FROM "configuracionApartamento"
                                        `;
                                const resuelveApartamentosIDV = await conexion.query(obtenerApartamentosIDV);
                                if (resuelveApartamentosIDV.rowCount > 0) {
                                    const apartamentosIDVValidos = resuelveApartamentosIDV.rows.map((apartamentoIDV) => {
                                        return apartamentoIDV.apartamentoIDV;
                                    });
                                    const controlApartamentosF2 = apartamentosIDV.every(apartamentosIDV => apartamentosIDVValidos.includes(apartamentosIDV));
                                    if (!controlApartamentosF2) {
                                        const elementosFaltantes = apartamentosIDV.filter(apartamentosIDV => !apartamentosIDVValidos.includes(apartamentosIDV));
                                        let error;
                                        if (elementosFaltantes.length === 1) {
                                            error = "En el array de apartamentosIDV hay un identificador que no existe: " + elementosFaltantes[0];
                                        } if (elementosFaltantes.length === 2) {
                                            error = "En el array de apartamentosIDV hay identifcadores que no existen: " + elementosFaltantes.join("y");
                                        }
                                        if (elementosFaltantes.length > 2) {
                                            const conComa = elementosFaltantes;
                                            const ultima = elementosFaltantes.pop();
                                            error = "En el array de apartamentosIDV hay identifcadores que no existen: " + conComa.join(", ") + " y " + ultima;
                                        }
                                        throw new Error(error);
                                    }
                                    for (const apartamentoIDV of apartamentosIDV) {
                                        const metadatosEventos = {
                                            fecha: fecha,
                                            apartamentoIDV: apartamentoIDV
                                        };
                                        const eventos = await eventosPorApartamneto(metadatosEventos);
                                        for (const [fechaDia, contenedorEventos] of Object.entries(eventos.eventosMes)) {
                                            const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                                            selectorDia.push(...contenedorEventos);
                                        }
                                        estructuraGlobal.eventosEnDetalle.push(...eventos.eventosEnDetalle);
                                    }
                                }
                            },
                            todoAirbnb: async () => {
                                // Obtengo todo los uids de los calendarios sincronizados en un objeto y lo itero
                                const plataformaAibnb = "airbnb";
                                const obtenerUIDCalendriosSincronizadosAirbnb = `
                                       SELECT uid
                                       FROM "calendariosSincronizados"
                                       WHERE "plataformaOrigen" = $1
                                       `;
                                const calendariosSincronizadosAirbnbUIDS = await conexion.query(obtenerUIDCalendriosSincronizadosAirbnb, [plataformaAibnb]);
                                if (calendariosSincronizadosAirbnbUIDS.rowCount > 0) {
                                    const calendariosUIDS = calendariosSincronizadosAirbnbUIDS.rows.map((calendario) => {
                                        return calendario.uid;
                                    });
                                    for (const calendarioUID of calendariosUIDS) {
                                        const metadatosEventos = {
                                            fecha: fecha,
                                            calendarioUID: String(calendarioUID)
                                        };
                                        const eventosPorApartamentoAirbnb_ = await eventosPorApartamentoAirbnb(metadatosEventos);
                                        for (const [fechaDia, contenedorEventos] of Object.entries(eventosPorApartamentoAirbnb_.eventosMes)) {
                                            const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                                            selectorDia.push(...contenedorEventos);
                                        }
                                        estructuraGlobal.eventosEnDetalle.push(...eventosPorApartamentoAirbnb_.eventosEnDetalle);
                                    }
                                }
                            },
                            calendariosAirbnb: async () => {
                                const calendariosUID = contenedorCapas.capasCompuestas.calendariosAirbnb;
                                const filtroCadena = /^[0-9]+$/;
                                if (!calendariosUID) {
                                    const error = "Falta determinar calendariosUID, debe de ser un array con las cadenas de los calendariosUID de airbnb";
                                    throw new Error(error);
                                }
                                if (!Array.isArray(capas) || capas == null || capas === undefined) {
                                    const error = "El campo calendariosUID debe de ser un array con cadenas";
                                    throw new Error(error);
                                }
                                const controlCalendariosUID = calendariosUID.every(cadena => {
                                    if (typeof cadena !== "string") {
                                        return false;
                                    }
                                    return filtroCapa.test(cadena);
                                });
                                if (!controlCalendariosUID) {
                                    const error = "Los identificadores visuales de los calendariod de airbnb solo pueden ser cadenas que contengan contener numeros";
                                    throw new Error(error);
                                }
                                // Validar que le nombre del apartamento existe como tal
                                const plataformaOrigen = "airbnb";
                                const obtenerCalendariosUID = `
                                        SELECT uid
                                        FROM "calendariosSincronizados"
                                        WHERE "plataformaOrigen" = $1
                                        `;
                                const resuelveCalendariosUID = await conexion.query(obtenerCalendariosUID, [plataformaOrigen]);
                                if (resuelveCalendariosUID.rowCount > 0) {
                                    const calendariosUIDValidos = resuelveCalendariosUID.rows.map((calendarioUID) => {
                                        return String(calendarioUID.uid);
                                    });
                                    const controlCalendariosF2 = calendariosUID.every(calendariosUID => calendariosUIDValidos.includes(calendariosUID));
                                    if (!controlCalendariosF2) {
                                        const elementosFaltantes = calendariosUID.filter(calendariosUID => !calendariosUIDValidos.includes(calendariosUID));
                                        let error;
                                        if (elementosFaltantes.length === 1) {
                                            error = "En el array de calendariosUIDS hay un identificador que no existe: " + elementosFaltantes[0];
                                        } if (elementosFaltantes.length === 2) {
                                            error = "En el array de calendariosUIDS hay identifcadores que no existen: " + elementosFaltantes.join("y");
                                        }
                                        if (elementosFaltantes.length > 2) {
                                            const conComa = elementosFaltantes;
                                            const ultima = elementosFaltantes.pop();
                                            error = "En el array de calendariosUIDS hay identifcadores que no existen: " + conComa.join(", ") + " y " + ultima;
                                        }
                                        throw new Error(error);
                                    }
                                    for (const calendarioUID of calendariosUID) {
                                        const metadatosEventos = {
                                            fecha: fecha,
                                            calendarioUID: calendarioUID
                                        };
                                        const eventos = await eventosPorApartamentoAirbnb(metadatosEventos);
                                        for (const [fechaDia, contenedorEventos] of Object.entries(eventos.eventosMes)) {
                                            const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                                            selectorDia.push(...contenedorEventos);
                                        }
                                        estructuraGlobal.eventosEnDetalle.push(...eventos.eventosEnDetalle);
                                    }
                                }
                            },
                            global: async () => {
                                await capasComoComponentes.reservas();
                                await capasComoComponentes.todosLosApartamentos();
                                await capasComoComponentes.todosLosBloqueos();
                                await capasComoComponentes.todoAirbnb();
                            }
                        };
                        const capasDisponibles = Object.keys(capasComoComponentes);
                        const todosPresentes = capas.every(capa => capasDisponibles.includes(capa));
                        if (!todosPresentes) {
                            const elementosFaltantes = capas.filter(capa => !capasDisponibles.includes(capa));
                            let error;
                            if (elementosFaltantes.length === 1) {
                                error = "En el array de capasIDV hay un identificador que no existe: " + elementosFaltantes[0];
                            } if (elementosFaltantes.length === 2) {
                                error = "En el array de capasIDV hay identifcadores que no existen: " + elementosFaltantes.join("y");
                            }
                            if (elementosFaltantes.length > 2) {
                                const conComa = elementosFaltantes;
                                const ultima = elementosFaltantes.pop();
                                error = "En el array de capasIDV hay identifcadores que no existen: " + conComa.join(", ") + " y " + ultima;
                            }
                            throw new Error(error);
                        }
                        for (const capa of capas) {
                            await capasComoComponentes[capa]();
                        }
                        const ok = {
                            ok: "Eventos del calendario",
                            ...estructuraGlobal
                        };
                        salida.json(ok);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        return salida.json(error)
                    }
                },
                calendariosSincronizados: {
                    airbnb: async () => {
                        try {
                            const fecha = entrada.body.fecha;
                            const calendarioUID = entrada.body.calendarioUID;
                            const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;
                            if (!filtroFecha.test(fecha)) {
                                const error = "La fecha no cumple el formato especifico para el calendario. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante.";
                                throw new Error(error);
                            }
                            const filtroCadena = /^[0-9]+$/;
                            if (!filtroCadena.test(calendarioUID) || typeof calendarioUID !== "string") {
                                const error = "el campo 'calendarioUID' solo puede ser una cadena de letras minúsculas y numeros.";
                                throw new Error(error);
                            }
                            const metadatosEventos = {
                                fecha: fecha,
                                calendarioUID: calendarioUID
                            };
                            const eventos = await eventosPorApartamentoAirbnb(metadatosEventos);
                            const ok = {
                                ok: "Aqui tienes las reservas de este mes",
                                ...eventos
                            };
                            salida.json(ok);
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            return salida.json(error)
                        }
                    }
                }
            },
            obtenerNombresCalendarios: {
                airbnb: async () => {
                    try {
                        const ok = {
                            ok: "Lista con metadtos de los calendarios sincronizados de airbnb",
                            calendariosSincronizados: []
                        };
                        const plataformaOrigen = "airbnb";
                        const consultaCalendarios = `
                            SELECT
                                uid,
                                nombre,
                                "apartamentoIDV"
                            FROM 
                                "calendariosSincronizados"
                            WHERE 
                                "plataformaOrigen" = $1;`;
                        const resuelveCalendarios = await conexion.query(consultaCalendarios, [plataformaOrigen]);
                        for (const detallesDelCalendario of resuelveCalendarios.rows) {
                            const apartamentoIDV = detallesDelCalendario.apartamentoIDV;
                            detallesDelCalendario.apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                        }
                        ok.calendariosSincronizados = [...resuelveCalendarios.rows];
                        salida.json(ok);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        return salida.json(error)
                    }
                }
            }
        }
    }
}

export {
    mensajesInterruptores, casaVitini
}