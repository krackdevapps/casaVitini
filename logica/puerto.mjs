import { conexion } from './componentes/db.mjs';
import fs from 'fs'
import path from 'path';

const arranque = async (entrada, salida) => {
    salida.render('constructorV1', {
        'vistaGlobal': '../global/navegacion.ejs'
    });
}

const calendarios_compartidos = async (entrada, salida) => {
    try {
        const url = entrada.url.toLowerCase()
        const filtroUrl = /^[a-zA-Z0-9/_./]+$/;
        if (!filtroUrl.test(url)) {
            const error = "La url no es valida"
            throw new Error(error)
        }
        const urlArray = url.toLowerCase()
            .split("/")
            .filter(url => url.trim() !== "calendarios_compartidos")
            .filter(url => url.trim() !== "")
        const calendarioUID = urlArray[0];
        //Verificara que existe el calendarios
        // ENFOQUE ERRONEO ->> Hay que mostrar los eventos de CASAVITINI por apartmento durante un año a partir de hoy!!!!!! por que este calendario es para sincronizar con las otras plataformas
        const consultaConfiguracion = `
            SELECT 
            uid,
            nombre,
            url,
            "apartamentoIDV",
            "dataIcal",
            "plataformaOrigen"
            FROM 
            "calendariosSincronizados"
            WHERE
            "uidPublico" = $1
            `
        const resuelveCalendariosSincronizados = await conexion.query(consultaConfiguracion, [calendarioUID])
        if (resuelveCalendariosSincronizados.rowCount === 0) {
            salida.status(404).end();
        }
        if (resuelveCalendariosSincronizados.rowCount === 1) {
            const detallesDelCalendario = resuelveCalendariosSincronizados.rows[0]
            const apartamentoIDV = detallesDelCalendario.apartamentoIDV
            const apartamentoUI = await resolverApartamentoUI(apartamentoIDV)
            detallesDelCalendario.apartamentoUI = apartamentoUI
            const datosCalendario = resuelveCalendariosSincronizados.rows
            const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
            const tiempoZH = DateTime.now().setZone(zonaHoraria);
            const fechaActual_ISO = tiempoZH.toISODate()
            const fechaLimite = tiempoZH.plus({ days: 360 }).toISODate();
            const fechaInicio = DateTime.fromISO(fechaActual_ISO);
            const fechaFin = DateTime.fromISO(fechaLimite);
            const matrizHoraEntradaSalida = await horaEntradaSalida()
            const generarFechasEnRango = (fechaInicio, fechaFin) => {
                const fechasEnRango = [];
                let fechaActual = fechaInicio;
                while (fechaActual <= fechaFin) {
                    fechasEnRango.push(fechaActual.toISODate());
                    fechaActual = fechaActual.plus({ days: 1 });
                }
                return fechasEnRango;
            }
            const arrayFechas = generarFechasEnRango(fechaInicio, fechaFin)
            const objetoFechas = {}
            for (const fecha of arrayFechas) {
                objetoFechas[fecha] = {}
            }
            // Primero buscamso si hay bloqueos permanentes
            // si no hay procedemos a buscar bloquoeos temporales y reservas
            const bloqueoPermanente = "permanente"
            const consultaBloqueosPermanentes = `
            SELECT apartamento, uid
            FROM "bloqueosApartamentos" 
            WHERE 
            "tipoBloqueo" = $1 AND
            apartamento = $2;`
            const resuelveBloqueosPermanentes = await conexion.query(consultaBloqueosPermanentes, [bloqueoPermanente, apartamentoIDV])
            const bloqueosPermamentes = resuelveBloqueosPermanentes.rows
            const eventos = []
            if (bloqueosPermamentes.length > 0) {
                for (const detallesdelBloqueo of bloqueosPermamentes) {
                    const bloqueoUID = detallesdelBloqueo.uid
                    const estructuraEVENTO = {
                        start: fechaInicio,
                        end: fechaFin,
                        summary: 'Bloqueo permanente en casavitini.com',
                        description: `Detalles del bloqueo: https://casavitini.com/administracion/gestion_de_bloqueos_temporales/${apartamentoIDV}/${bloqueoUID}`
                    }
                    eventos.push(estructuraEVENTO)
                }
            } else {
                const bloqueoTemporal = "rangoTemporal"
                const apartamenosBloqueadosTemporalmente = `
                SELECT 
                uid,
                apartamento,
                to_char(entrada, 'YYYY-MM-DD') as "entrada", 
                to_char(salida, 'YYYY-MM-DD') as "salida" 
                FROM "bloqueosApartamentos" 
                WHERE 
                "tipoBloqueo" = $1 AND
                entrada <= $3::DATE AND
                salida >= $2::DATE;`
                const datosConsultaBloqueos = [
                    bloqueoTemporal,
                    fechaActual_ISO,
                    fechaLimite
                ]
                const resuelveBloqueosTemporales = await conexion
                    .query(apartamenosBloqueadosTemporalmente, datosConsultaBloqueos)
                const bloqueosTemporales = resuelveBloqueosTemporales.rows
                for (const detalleDelBloqueo of bloqueosTemporales) {
                    const fechaEntradaBloqueo_ISO = detalleDelBloqueo.entrada
                    const fechaSalidaBloqueo_ISO = detalleDelBloqueo.salida
                    const bloqueoUID = detalleDelBloqueo.uid
                    // Aqui hay que hacer que no muestre la hora
                    const fechaEntrada_objeto = (DateTime.fromObject({
                        year: fechaEntradaBloqueo_ISO.split("-")[0],
                        month: fechaEntradaBloqueo_ISO.split("-")[1],
                        day: fechaEntradaBloqueo_ISO.split("-")[2],
                        hour: "00",
                        minute: "00"
                    }, {
                        zone: zonaHoraria
                    }))
                    const fechaSalida_objeto = (DateTime.fromObject({
                        year: fechaSalidaBloqueo_ISO.split("-")[0],
                        month: fechaSalidaBloqueo_ISO.split("-")[1],
                        day: fechaSalidaBloqueo_ISO.split("-")[2],
                        hour: "23",
                        minute: "59",
                        second: "59"
                    }, {
                        zone: zonaHoraria
                    }))
                    const estructuraEVENTO = {
                        start: fechaEntrada_objeto.toISO(),
                        end: fechaSalida_objeto.toISO(),
                        summary: `Bloqueo temporal del ${apartamentoUI} en casavitini.com`,
                        description: `Detalles del bloqueo: https://casavitini.com/administracion/gestion_de_bloqueos_temporales/${apartamentoIDV}/${bloqueoUID}`
                    }
                    eventos.push(estructuraEVENTO)
                }
                const consultaReservas = `
                SELECT 
                reserva,
                to_char(entrada, 'YYYY-MM-DD') as "entrada", 
                to_char(salida, 'YYYY-MM-DD') as "salida"
                FROM reservas 
                WHERE 
                entrada < $2::DATE AND
                salida > $1::DATE    
                AND "estadoReserva" <> 'cancelada';`
                const resuelveReservas = await conexion.query(consultaReservas, [fechaActual_ISO, fechaLimite])
                for (const detallesReserva of resuelveReservas.rows) {
                    const reservaUID = detallesReserva.reserva
                    const fechaEntrada_ISO = detallesReserva.entrada
                    const fechaSalida_ISO = detallesReserva.salida
                    const fechaEntrada_objeto = (DateTime.fromObject({
                        year: fechaEntrada_ISO.split("-")[0],
                        month: fechaEntrada_ISO.split("-")[1],
                        day: fechaEntrada_ISO.split("-")[2],
                        hour: matrizHoraEntradaSalida.horaEntrada_objeto.hora,
                        minute: matrizHoraEntradaSalida.horaEntrada_objeto.minuto
                    }, {
                        zone: zonaHoraria
                    }))
                    const fechaSalida_objeto = (DateTime.fromObject({
                        year: fechaSalida_ISO.split("-")[0],
                        month: fechaSalida_ISO.split("-")[1],
                        day: fechaSalida_ISO.split("-")[2],
                        hour: matrizHoraEntradaSalida.horaSalida_objeto.hora,
                        minute: matrizHoraEntradaSalida.horaSalida_objeto.minuto
                    }, {
                        zone: zonaHoraria
                    }))
                    const consultaApartamentoEnReserva = `
                    SELECT apartamento 
                    FROM "reservaApartamentos" 
                    WHERE reserva = $1 AND apartamento = $2;`
                    const resuelveApartamento = await conexion.query(consultaApartamentoEnReserva, [reservaUID, apartamentoIDV])
                    // 
                    // Aqui esta el error
                    const apartamentosDeLaReserva = resuelveApartamento.rows
                    for (const apartamentos of apartamentosDeLaReserva) {
                        if (apartamentos.apartamento === apartamentoIDV) {
                            const estructuraEVENTO = {
                                //start: DateTime.fromISO(fechaEntrada_ISO+"T000000Z").toISODate(),
                                start: fechaEntrada_objeto.toISO(),
                                end: fechaSalida_objeto.toISO(),
                                summary: `${apartamentoUI} de la reserva ${reservaUID} en casavitini.com`,
                                description: "Detalles de la reserva: https://casavitini.com/administracion/reservas/" + reservaUID
                            }
                            eventos.push(estructuraEVENTO)
                        }
                    }
                    if (resuelveApartamento.rows === 1) {
                        // Esto esta mal por que y no se añade con le push por que si hay uno se va a iterar el loop de arriba y luego esto.
                        const evento = {
                            start: DateTime.fromISO(fechaEntrada_ISO),
                            end: DateTime.fromISO(fechaSalida_ISO),
                            sumario: "Reserva " + reservaUID,
                            descripcion: "Reserva en CasaVitini del " + apartamentoUI
                        }
                        // eventos.push(evento)
                    }
                }
            }
            const exportarCalendario_ = await exportarClendario(eventos)
            const icalData = exportarCalendario_
            salida.attachment('eventos.ics');
            salida.send(icalData);
        }
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        }
        salida.json(error)
    }
}

const puerto = async (entrada, salida) => {
    try {
        const zonaRaw = entrada.body.zona;
        if (!zonaRaw) {
            const error = "zonaIndefinida";
            throw new Error(error);
        }
        const filtroZona = /^[a-zA-Z\/\-_]+$/;
        if (!filtroZona.test(zonaRaw)) {
            const error = "Las rutas de la zonas solo admiten minusculas y mayusculas junto con barras, nada mas ni siqueira espacios";
            throw new Error(error);
        }
        const arbol = zonaRaw
            .split("/")
            .filter(rama => rama.trim() !== "")

        if (!arbol) {
            const error = "arbolNoDefinido";
            throw new Error(error);
        }


        const ruta = arbol.join(".")

        const contructorArbol = async (zonaBusqueda) => {
            try {
                const arbol = {}
                const cargarModulosDesdeDirectorio = async (rutaActual, arbol) => {
                    const arbolDeLaRuta = await fs.promises.readdir(rutaActual, { withFileTypes: true })
                    for (const ramaDeLaRuta of arbolDeLaRuta) {
                        const rutaEntrada = path.join(ramaDeLaRuta.path, ramaDeLaRuta.name)

                        if (ramaDeLaRuta.isDirectory()) {

                            arbol[ramaDeLaRuta.name] = {}
                            await cargarModulosDesdeDirectorio(rutaEntrada, arbol[ramaDeLaRuta.name])
                        } else if (ramaDeLaRuta.isFile() && ramaDeLaRuta.name.endsWith('.mjs')) {
                            console.log("rtu", rutaEntrada)
                            const nombreModulo = ramaDeLaRuta.name.replace('.mjs', '')
                            const rutaDeImportacion = path.relative('./zonas/', rutaEntrada)
                            arbol[nombreModulo] = await import(rutaDeImportacion)
                        }
                    }
                }
                await cargarModulosDesdeDirectorio(zonaBusqueda, arbol)
                return arbol
            } catch (error) {
                console.log(error)
            }
        }

        const directorioZonas = './logica/zonas'
        console.log("test 0")

        const zonas = await contructorArbol(directorioZonas)
        console.log("test")
        const exploradorArbol = (zonas, ruta) => {
            const partes = ruta.split('.')
            let rama = zonas;
            for (const part of partes) {
                if (rama && typeof rama === 'object' && rama.hasOwnProperty(part)) {
                    rama = rama[part]
                } else {
                    const error = "zonaInexistente"
                    throw new Error(error)
                }
            }
            return rama
        }
        console.log("test1")
        const estructura = exploradorArbol(zonas, ruta)
        const X = estructura[arbol.pop()]
        if (typeof X !== "function") {
            const error = "zonaInexistente"
            throw new Error(error)
        }
        return X(entrada, salida)
    } catch (errorCapturado) {
        const error = {
            details: errorCapturado,
            error: errorCapturado.message
        }
        salida.json(error);
    }
}

export default {
    arranque,
    calendarios_compartidos,
    puerto
}
