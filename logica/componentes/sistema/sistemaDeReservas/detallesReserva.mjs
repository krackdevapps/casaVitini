import { conexion } from '../../db.mjs';
const detallesReserva = async (metadatos) => {
    try {
        const reservaUID = metadatos.reservaUID
        const solo = metadatos.solo
        if (!reservaUID) {
            const error = "Se necesita un id de 'reserva'"
            throw new Error(error)
        }
        if (typeof reservaUID !== "number" || !Number.isInteger(reservaUID) || reservaUID <= 0) {
            const error = "Se ha definido correctamente la clave 'reserva' pero el valor de esta debe de ser un numero positivo, si has escrito un numero positivo, revisa que en el objeto no este numero no este envuelvo entre comillas"
            throw new Error(error)
        }
        const reserva = {}
        // Hay que pasar las fecha a TZ antes de imprimir
        const reservaConsulta = `
        SELECT
        reserva,
        to_char(entrada, 'DD/MM/YYYY') as entrada, 
        to_char(salida, 'DD/MM/YYYY') as salida, 
        "estadoReserva",
        "estadoPago",
        to_char(creacion, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "creacion_ISO_UTC",
        to_char(creacion, 'DD/MM/YYYY HH24:MI') as creacion,
        origen 
        FROM reservas
        WHERE reserva = $1;`
        const reservaRespuesta = await conexion.query(reservaConsulta, [reservaUID])
        if (reservaRespuesta.rowCount === 0) {
            const error = "No existe el ID de la reserva"
            throw new Error(error)
        }
        const informacionGlobal = async () => {
            const detallesGlobalesReserva = reservaRespuesta.rows[0]
            const consultaTitular = `
            SELECT
            "titularUID"
            FROM "reservaTitulares"
            WHERE "reservaUID" = $1`
            const resuelveTitularVitini = await conexion.query(consultaTitular, [reservaUID])
            const titularUID = resuelveTitularVitini.rows[0]?.titularUID
            if (titularUID) {
                const consultaElimintarTitularPool = `
                DELETE FROM 
                "poolTitularesReserva"
                WHERE
                reserva = $1;
                `
                await conexion.query(consultaElimintarTitularPool, [reservaUID])
                const consultaTitular = `
                SELECT
                nombre,
                "primerApellido",
                "segundoApellido",
                pasaporte,
                email,
                telefono
                FROM clientes
                WHERE uid = $1`
                const resuelveTitular = await conexion.query(consultaTitular, [titularUID])
                if (resuelveTitular.rowCount === 1) {
                    const detallesTitular = resuelveTitular.rows[0]
                    const nombre = detallesTitular.nombre
                    const primerApellido = detallesTitular.primerApellido
                    const segundoApellido = detallesTitular.segundoApellido
                    const nombreTitular = `${nombre} ${primerApellido} ${segundoApellido}`
                    const pasaporteTitular = detallesTitular.pasaporte
                    const emailTitular = detallesTitular.email
                    const telefonoTitular = detallesTitular.telefono
                    const estructuraTitular = {
                        clienteUID: titularUID,
                        nombreTitular: nombreTitular,
                        pasaporteTitular: pasaporteTitular,
                        emailTitular: emailTitular,
                        telefonoTitular: telefonoTitular,
                        tipoTitular: "titularCliente"
                    }
                    detallesGlobalesReserva.titular = estructuraTitular
                }
            } else {
                const consultaTitularPool = `
                SELECT
                "nombreTitular",
                "pasaporteTitular",
                "emailTitular",
                "telefonoTitular"
                FROM "poolTitularesReserva"
                WHERE reserva = $1`
                const resuelveTitularPool = await conexion.query(consultaTitularPool, [reservaUID])
                if (resuelveTitularPool.rowCount === 1) {
                    const detallesTitularPool = resuelveTitularPool.rows[0]
                    const nombreTitular = detallesTitularPool.nombreTitular
                    const pasaporteTitular = detallesTitularPool.pasaporteTitular
                    const emailTitular = detallesTitularPool.emailTitular
                    const telefonoTitular = detallesTitularPool.telefonoTitular
                    const estructuraTitularPool = {
                        nombreTitular: nombreTitular,
                        pasaporteTitular: pasaporteTitular,
                        emailTitular: emailTitular,
                        telefonoTitular: telefonoTitular,
                        tipoTitular: "titularPool"
                    }
                    detallesGlobalesReserva.titular = estructuraTitularPool
                }
            }
            delete detallesGlobalesReserva.titularPool
            // delete detallesGlobalesReserva.titular
            const fechaCreacion = detallesGlobalesReserva.fechaCreacion
            const fechaCreacionFormatoHumano =
                reserva.reserva = reservaRespuesta.rows[0]
        }
        const recuperarClientes = async (reservaUID, habitacionUID) => {
            const estructuraFinal = {
                pernoctantes: [],
                pernoctantesPool: []
            }
            const consultaPernoctante = `
            SELECT 
            "pernoctanteUID", 
            "clienteUID", 
            habitacion, 
            to_char("fechaCheckIn", 'DD/MM/YYYY') as "fechaCheckIn", 
            to_char("fechaCheckOutAdelantado", 'DD/MM/YYYY') as "fechaCheckOutAdelantado", 
            reserva 
            FROM 
            "reservaPernoctantes" 
            WHERE 
            reserva = $1 AND habitacion = $2;`
            const recuperarPernoctantes = await conexion.query(consultaPernoctante, [reservaUID, habitacionUID])
            const pernoctantesUIDS = []
            const pernoctantesPoolUIDS = []
            if (recuperarPernoctantes.rowCount > 0) {
                for (const detallesCliente of recuperarPernoctantes.rows) {
                    const pernoctanteUID = detallesCliente.pernoctanteUID
                    const clienteUID = detallesCliente.clienteUID
                    const fechaCheckIn = detallesCliente.fechaCheckIn
                    const fechaCheckOutAdelantado = detallesCliente.fechaCheckOutAdelantado
                    if (clienteUID) {
                        const consultaEliminarPernoctantePool = `
                        DELETE FROM
                        "poolClientes"
                        WHERE
                        "pernoctanteUID" = $1;`
                        await conexion.query(consultaEliminarPernoctantePool, [pernoctanteUID])
                        const estructura = {
                            clienteUID: clienteUID,
                            pernoctanteUID: pernoctanteUID,
                            fechaCheckIn: fechaCheckIn,
                            fechaCheckOutAdelantado: fechaCheckOutAdelantado
                        }
                        pernoctantesUIDS.push(estructura)
                    } else {
                        const consultaPernoctantePool = `
                        SELECT 
                        uid
                        FROM 
                        "poolClientes" 
                        WHERE 
                        "pernoctanteUID" = $1;`
                        const resuelvePernoctantePool = await conexion.query(consultaPernoctantePool, [pernoctanteUID])
                        if (resuelvePernoctantePool.rowCount === 1) {
                            const clientePoolUID = resuelvePernoctantePool.rows[0].uid
                            const estructura = {
                                clientePoolUID: clientePoolUID,
                                pernoctanteUID: pernoctanteUID
                            }
                            pernoctantesPoolUIDS.push(estructura)
                        }
                    }
                }
            }
            for (const detallesPernoctanteUID of pernoctantesUIDS) {
                const clienteUID = detallesPernoctanteUID.clienteUID
                const pernoctanteUID = detallesPernoctanteUID.pernoctanteUID
                const fechaCheckIn = detallesPernoctanteUID.fechaCheckIn || null
                const fechaCheckOutAdelantado = detallesPernoctanteUID.fechaCheckOutAdelantado || null
                const consultaClientes = `
                SELECT
                uid,
                nombre,
                "primerApellido",
                "segundoApellido",
                pasaporte 
                FROM 
                clientes 
                WHERE 
                uid = $1;`
                const recuperarDatosCliente = await conexion.query(consultaClientes, [clienteUID])
                if (recuperarDatosCliente.rowCount === 1) {
                    const cliente = recuperarDatosCliente.rows[0]
                    if (cliente) {
                        const primeroApellido = cliente.primerApellido ? cliente.primerApellido : ""
                        const segundoApellido = cliente.segundoApellido ? cliente.segundoApellido : ""
                        const nombreCliente = cliente.nombre + " " + primeroApellido + " " + segundoApellido
                        const pasaporteCliente = cliente.pasaporte
                        const estructuraPernoctante = {
                            clienteUID: clienteUID,
                            pernoctanteUID: pernoctanteUID,
                            nombrePernoctante: nombreCliente,
                            pasaportePernoctante: pasaporteCliente,
                            fechaCheckIn: fechaCheckIn,
                            fechaCheckOutAdelantado: fechaCheckOutAdelantado
                        }
                        estructuraFinal.pernoctantes.push(estructuraPernoctante)
                    }
                }
            }
            for (const detallesPernoctantePoolUID of pernoctantesPoolUIDS) {
                const clientePoolUID = detallesPernoctantePoolUID.clientePoolUID
                const pernoctanteUID = detallesPernoctantePoolUID.pernoctanteUID
                const consultaClientesPool = `
                SELECT
                "nombreCompleto",
                pasaporte
                FROM 
                "poolClientes"
                WHERE 
                uid = $1
                `
                const recuperarDatosClientePool = await conexion.query(consultaClientesPool, [clientePoolUID])
                if (recuperarDatosClientePool.rowCount === 1) {
                    const detallesClientePool = recuperarDatosClientePool.rows[0]
                    const nombreCompleto = detallesClientePool.nombreCompleto
                    const pasaporte = detallesClientePool.pasaporte
                    const estructuraPernoctante = {
                        clientePoolUID: clientePoolUID,
                        pernoctanteUID: pernoctanteUID,
                        nombrePernoctante: nombreCompleto,
                        pasaportePernoctante: pasaporte
                    }
                    estructuraFinal.pernoctantesPool.push(estructuraPernoctante)
                }
            }
            return estructuraFinal
        }
        const recuperarClientesSinHabitacionAsignada = async (reservaUID) => {
            const estructuraFinal = {
                pernoctantes: [],
                pernoctantesPool: []
            }
            const consultaPernoctante = `
            SELECT 
            "pernoctanteUID", 
            "clienteUID", 
            habitacion, 
            to_char("fechaCheckIn", 'DD/MM/YYYY') as "fechaCheckIn", 
            to_char("fechaCheckOutAdelantado", 'DD/MM/YYYY') as "fechaCheckOutAdelantado", 
            reserva 
            FROM 
            "reservaPernoctantes" 
            WHERE 
            reserva = $1 AND habitacion IS NULL;
            `
            const recuperarPernoctantes = await conexion.query(consultaPernoctante, [reservaUID])
            const clienteUIDS = []
            const clientePoolUIDS = []
            if (recuperarPernoctantes.rowCount > 0) {
                const clientesPorAnalizar = recuperarPernoctantes.rows
                for (const detallesCliente of clientesPorAnalizar) {
                    const pernoctanteUID = detallesCliente.pernoctanteUID
                    const clienteUID = detallesCliente.clienteUID
                    const clientePoolUID = detallesCliente.clientePoolUID
                    const fechaCheckIn = detallesCliente.fechaCheckIn
                    const fechaCheckOutAdelantado = detallesCliente.fechaCheckOutAdelantado
                    if (clienteUID) {
                        const estructura = {
                            clienteUID: clienteUID,
                            clientePoolUID: clientePoolUID,
                            pernoctanteUID: pernoctanteUID,
                            fechaCheckIn: fechaCheckIn,
                            fechaCheckOutAdelantado: fechaCheckOutAdelantado,
                        }
                        clienteUIDS.push(estructura)
                    }
                    if (clientePoolUID) {
                        const estructura = {
                            clienteUID: clienteUID,
                            clientePoolUID: clientePoolUID,
                            pernoctanteUID: pernoctanteUID
                        }
                        clientePoolUIDS.push(estructura)
                    }
                }
            }
            for (const detallesClienteUID of clienteUIDS) {
                const pernoctanteUID = detallesClienteUID.pernoctanteUID
                const clienteUID = detallesClienteUID.clienteUID
                const fechaCheckIn = detallesClienteUID.fechaCheckIn
                const fechaCheckOutAdelantado = detallesClienteUID.fechaCheckOutAdelantado
                const consultaClientes = `
                SELECT
                nombre,
                "primerApellido",
                "segundoApellido",
                pasaporte 
                FROM 
                clientes 
                WHERE 
                uid = $1
                `
                const recuperarDatosCliente = await conexion.query(consultaClientes, [clienteUID])
                if (recuperarDatosCliente.rowCount === 1) {
                    const cliente = recuperarDatosCliente.rows[0]
                    if (cliente) {
                        let primeroApellido = cliente.primerApellido ? cliente.primerApellido : ""
                        let segundoApellido = cliente.segundoApellido ? cliente.segundoApellido : ""
                        let nombreCliente = cliente.nombre + " " + primeroApellido + " " + segundoApellido
                        nombreCliente = nombreCliente.trim();
                        nombreCliente = nombreCliente.replace(/\s+/g, ' ');
                        let pasaporteCliente = cliente["pasaporte"]
                        const estructuraPernoctante = {
                            clienteUID: clienteUID,
                            pernoctanteUID: pernoctanteUID,
                            nombrePernoctante: nombreCliente,
                            pasaportePernoctante: pasaporteCliente,
                            fechaCheckIn: fechaCheckIn,
                            fechaCheckOutAdelantado: fechaCheckOutAdelantado
                        }
                        estructuraFinal.pernoctantes.push(estructuraPernoctante)
                    }
                }
            }
            for (const detallesClientePoolUID of clientePoolUIDS) {
                const pernoctanteUID = detallesClientePoolUID.pernoctanteUID
                const clientePoolUID = detallesClientePoolUID.clientePoolUID
                const consultaClientesPool = `
                SELECT
                "nombreCompleto",
                pasaporte
                FROM 
                "poolClientes"
                WHERE 
                uid = $1
                `
                const recuperarDatosClientePool = await conexion.query(consultaClientesPool, [clientePoolUID])
                if (recuperarDatosClientePool.rowCount === 1) {
                    const detallesClientePool = recuperarDatosClientePool.rows[0]
                    const nombreCompleto = detallesClientePool.nombreCompleto
                    const pasaporte = detallesClientePool.pasaporte
                    const estructuraPernoctante = {
                        clienteUID: clientePoolUID,
                        pernoctanteUID: pernoctanteUID,
                        nombrePernoctante: nombreCompleto,
                        pasaportePernoctante: pasaporte
                    }
                    estructuraFinal.pernoctantesPool.push(estructuraPernoctante)
                }
            }
            return estructuraFinal
        }
        const detallesAlojamiento = async () => {
            const recuperarApartamentos = await conexion.query(`SELECT uid, apartamento, "apartamentoUI" FROM "reservaApartamentos" WHERE reserva = $1`, [reservaUID])
            const apartamentos = recuperarApartamentos.rows
            reserva["alojamiento"] = {}
            if (apartamentos.length === 0) {
                reserva["alojamiento"] = {}
            }
            const habitacionObjeto = {}
            const apartamentosIndiceOrdenado = []
            apartamentos.map((apartamento) => {
                apartamentosIndiceOrdenado.push(apartamento.apartamento)
            })
            apartamentosIndiceOrdenado.sort()
            const apartamenosOrdenados = []
            apartamentosIndiceOrdenado.map((apartamentoIndice) => {
                apartamentos.map((apartamento) => {
                    if (apartamento.apartamento === apartamentoIndice) {
                        apartamenosOrdenados.push(apartamento)
                    }
                })
            })
            for (const apartamento of apartamenosOrdenados) {
                const apartamentoUID = apartamento["uid"]
                const apartamentoIDV = apartamento["apartamento"]
                const apartamentoUI = apartamento["apartamentoUI"]
                reserva["alojamiento"][apartamentoIDV] = {}
                reserva["alojamiento"][apartamentoIDV]["apartamentoUI"] = apartamentoUI
                const recuperarHabitaciones = await conexion.query(`SELECT uid, habitacion, "habitacionUI" FROM "reservaHabitaciones" WHERE apartamento = $1`, [apartamentoUID])
                const habitaciones = recuperarHabitaciones.rows
                const habitacionObjeto = {}
                reserva["alojamiento"][apartamentoIDV]["apartamentoUID"] = apartamentoUID
                reserva["alojamiento"][apartamentoIDV]["habitaciones"] = {}
                for (const habitacion of habitaciones) {
                    const habitacionUID = habitacion["uid"]
                    const habitacionIDV = habitacion["habitacion"]
                    const habitacionUI = habitacion["habitacionUI"]
                    habitacionObjeto[habitacionIDV] = {}
                    reserva["alojamiento"][apartamentoIDV]["habitaciones"][habitacionIDV] = {}
                    reserva["alojamiento"][apartamentoIDV]["habitaciones"][habitacionIDV]["habitacionUI"] = habitacionUI
                    const recuperarCama = await conexion.query(`SELECT uid, cama, "camaUI" FROM "reservaCamas" WHERE habitacion = $1`, [habitacionUID])
                    if (recuperarCama.rowCount > 0) {
                        const camaIDV = recuperarCama.rows[0]["cama"]
                        const camaUID = recuperarCama.rows[0]["uid"]
                        const camaUI = recuperarCama.rows[0]["camaUI"]
                        reserva["alojamiento"][apartamentoIDV]["habitaciones"][habitacionIDV]["camaUI"] = camaUI
                        reserva["alojamiento"][apartamentoIDV]["habitaciones"][habitacionIDV]["camaIDV"] = camaIDV
                        reserva["alojamiento"][apartamentoIDV]["habitaciones"][habitacionIDV]["camaUID"] = camaUID
                    }
                    if (recuperarCama.rowCount === 0) {
                        reserva["alojamiento"][apartamentoIDV]["habitaciones"][habitacionIDV]["camaUI"] = "Sin cama asignada"
                    }
                    reserva["alojamiento"][apartamentoIDV]["habitaciones"][habitacionIDV]["habitacionUID"] = habitacionUID
                    const pernoctanesEnHabitacion = await recuperarClientes(reservaUID, habitacionUID)
                    reserva["alojamiento"][apartamentoIDV]["habitaciones"][habitacionIDV]["pernoctantes"] = pernoctanesEnHabitacion
                }
            }
            const pernoctantesSinHabitacion = await recuperarClientesSinHabitacionAsignada(reservaUID)
            reserva["pernoctantesSinHabitacion"] = pernoctantesSinHabitacion
            //Aqui pernoctantes sin alojamiento
        };
        const pernoctantes = async () => {
            const consultaPernoctnates = `
            SELECT 
            uid,
            "pernoctanteUID",
            "clienteUID",
            habitacion,
            reserva 
            FROM 
            "reservaPernoctantes" 
            WHERE 
            reserva = $1;`
            const recuperarPernoctantes = await conexion.query(consultaPernoctnates, [reservaUID])
            const arrayPernoctantes = []
            for (const pernoctante of recuperarPernoctantes.rows) {
                const pernoctanteUID = pernoctante.pernoctanteUID // UID como pernoctante no como clinete
                const clienteUID = pernoctante.clienteUID
                const habitacionAsociada = pernoctante.habitacion
                const reservaPernoctante = pernoctante.reserva
                let tipoPernoctante;
                let nombreCliente;
                let pasaorteCliente;
                const datosPernoctante = {}
                if (clienteUID) {
                    const consultaEliminarPernoctantePool = `
                    DELETE FROM
                    "poolClientes"
                    WHERE
                    "pernoctanteUID" = $1;`
                    await conexion.query(consultaEliminarPernoctantePool, [pernoctanteUID])
                    tipoPernoctante = "cliente"
                    const consultaDatosCliente = [
                        `SELECT
                        nombre,
                        "primerApellido",
                        "segundoApellido",
                        pasaporte 
                        FROM 
                        clientes 
                        WHERE 
                        uid = $1;`
                    ]
                    const recuperarDatosCliente = await conexion.query(consultaDatosCliente, [clienteUID])
                    const detallesDelCliente = recuperarDatosCliente.rows[0]
                    const primeroApellido = detallesDelCliente.primerApellido ? detallesDelCliente.primerApellido : ""
                    const segundoApellido = detallesDelCliente.segundoApellido ? detallesDelCliente.segundoApellido : ""
                    nombreCliente = detallesDelCliente.nombre + " " + primeroApellido + " " + segundoApellido
                    pasaorteCliente = detallesDelCliente.pasaporte
                } else {
                    tipoPernoctante = "clientePool"
                    const consultaClientePool = `
                    SELECT
                    "nombreCompleto",
                    pasaporte
                    FROM 
                    "poolClientes" 
                    WHERE 
                    "pernoctanteUID" = $1;`
                    const recuperarDatosCliente = await conexion.query(consultaClientePool, pernoctanteUID)
                    const detallesClientePool = recuperarDatosCliente.rows[0]
                    nombreCliente = detallesClientePool.nombreCompleto
                    pasaorteCliente = detallesClientePool.pasaporte
                }
                datosPernoctante.reserva = reservaPernoctante
                datosPernoctante.pernoctanteUID = pernoctanteUID
                datosPernoctante.clienteUID = clienteUID
                datosPernoctante.habitacion = habitacionAsociada
                datosPernoctante.tipoPernoctante = tipoPernoctante
                datosPernoctante.nombreCompleto = nombreCliente
                datosPernoctante.pasaporte = pasaorteCliente
                arrayPernoctantes.push(datosPernoctante)
            }
            reserva.pernoctantes = arrayPernoctantes
        }
        const desgloseTotal = async () => {
            reserva.desgloseFinanciero = {}
            reserva.desgloseFinanciero.totalesPorNoche = []
            reserva.desgloseFinanciero.totalesPorApartamento = []
            reserva.desgloseFinanciero.ofertas = []
            reserva.desgloseFinanciero.impuestos = []
            reserva.desgloseFinanciero.totales = []
            const seleccionarTotalesPorNoche = `
        SELECT
        to_char("fechaDiaConNoche", 'FMDD/FMMM/YYYY') as "fechaDiaConNoche", 
        "precioNetoNoche",
        "apartamentos"
        FROM 
        "reservaTotalesPorNoche" 
        WHERE
        reserva = $1`
            const resuelveSeleccionarTotalesPorNoche = await conexion.query(seleccionarTotalesPorNoche, [reservaUID])
            if (resuelveSeleccionarTotalesPorNoche.rowCount === 0) {
                const error = "Esta reserva no tiene informacion sobre los totales por noche"
                reserva.desgloseFinanciero.totalesPorNoche = []
            } else {
                reserva.desgloseFinanciero.totalesPorNoche = resuelveSeleccionarTotalesPorNoche.rows
            }
            const seleccionarTotalesPorApartamento = `
        SELECT
        "apartamentoIDV",
        "apartamentoUI",
        "totalNetoRango",
        "precioMedioNocheRango"
        FROM 
        "reservaTotalesPorApartamento" 
        WHERE
        reserva = $1`
            const resuelveSeleccionarTotalesPorApartamento = await conexion.query(seleccionarTotalesPorApartamento, [reservaUID])
            if (resuelveSeleccionarTotalesPorApartamento.rowCount === 0) {
                const error = "Esta reserva no informacion sobre los totales por apartamento"
                reserva.desgloseFinanciero.totalesPorApartamento = []
            } else {
                reserva.desgloseFinanciero.totalesPorApartamento = resuelveSeleccionarTotalesPorApartamento.rows
            }
            const seleccionarOfertas = `
            SELECT
            "nombreOferta",
            "tipoOferta",
            definicion,
            descuento,
            "tipoDescuento",
            cantidad,
            "detallesOferta",
            "descuentoAplicadoA"
            FROM 
            "reservaOfertas" 
            WHERE
            reserva = $1;`
            const resuelveSeleccionarOfertas = await conexion.query(seleccionarOfertas, [reservaUID])
            if (resuelveSeleccionarOfertas.rowCount > 0) {
                const contenedorTipoOferta = {}
                for (const oferta of resuelveSeleccionarOfertas.rows) {
                    const tipoOferta = oferta.tipoOferta
                    if (!contenedorTipoOferta[tipoOferta]) {
                        contenedorTipoOferta[tipoOferta] = []
                    }
                    if (tipoOferta === "porApartamentosEspecificos") {
                        if (oferta.descuentoAplicadoA === "totalNetoApartamentoDedicado") {
                            delete oferta.tipoDescuento
                            delete oferta.cantidad
                        }
                        oferta.apartamentosEspecificos = oferta.detallesOferta
                        delete oferta.detallesOferta
                    }
                    if (tipoOferta === "porRangoDeFechas") {
                        oferta.diasAfectados = oferta.detallesOferta
                        delete oferta.detallesOferta
                    }
                    contenedorTipoOferta[tipoOferta].push(oferta)
                }
                const contenedorFinalFormateado = []
                for (const contenedor of Object.entries(contenedorTipoOferta)) {
                    const tipoOferta = contenedor[0]
                    const contenedorOfertas = contenedor[1]
                    const estructuraContenedor = {}
                    estructuraContenedor[tipoOferta] = contenedorOfertas
                    contenedorFinalFormateado.push(estructuraContenedor)
                }
                reserva.desgloseFinanciero.ofertas = contenedorFinalFormateado
            }
            const seleccionarImpuestos = `
        SELECT
        "nombreImpuesto",
        "tipoImpositivo",
        "tipoValor",
        "calculoImpuestoPorcentaje"
        FROM 
        "reservaImpuestos" 
        WHERE
        reserva = $1`
            const resuelveSeleccionarImpuestos = await conexion.query(seleccionarImpuestos, [reservaUID])
            if (resuelveSeleccionarImpuestos.rowCount === 0) {
                const error = "Esta reserva no tiene informacion sobre los impuestos"
                reserva.desgloseFinanciero.impuestos = []
            } else {
                reserva.desgloseFinanciero.impuestos = resuelveSeleccionarImpuestos.rows
            }
            /*
            promedioNetoPorNoche
            totalReservaNetoSinOfertas
            totalReservaNeto
            totalDescuentosAplicados
            totalImpuestos
            totalConImpuestos
            */
            // Extraer datos de pago de la reserva
            const seleccionarTotales = `
            SELECT
            "promedioNetoPorNoche",
            "totalReservaNetoSinOfertas",
            "totalReservaNeto",
            "totalDescuentos",
            "totalImpuestos",
            "totalConImpuestos"
            FROM 
            "reservaTotales" 
            WHERE
            reserva = $1`
            const resuelveSeleccionarTotales = await conexion.query(seleccionarTotales, [reservaUID])
            if (resuelveSeleccionarTotales.rowCount === 0) {
                const error = "Esta reserva no disponible informacion sobre los totales"
                reserva.desgloseFinanciero.totales = []
            } else {
                reserva.desgloseFinanciero.totales = resuelveSeleccionarTotales.rows[0]
            }
        };
        switch (solo) {
            case "informacionGlobal":
                await informacionGlobal();
                break;
            case "globalYFinanciera":
                await informacionGlobal();
                await desgloseTotal();
                break;
            case "detallesAlojamiento":
                await detallesAlojamiento();
                break;
            case "pernoctantes":
                await pernoctantes();
                break;
            case "desgloseTotal":
                await desgloseTotal();
                break;
            default:
                await informacionGlobal();
                await detallesAlojamiento();
                await desgloseTotal();
                break;
        }
        return reserva
    } catch (error) {
        throw error
    }
}
export {
    detallesReserva
};