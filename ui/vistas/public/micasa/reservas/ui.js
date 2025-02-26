casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "/micasa/reservas")
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const comandoInicial = granuladoURL.directorios[granuladoURL.directorios.length - 1]
        const parametros = granuladoURL.parametros
        const directorios = granuladoURL.directorios

        if (parametros.reserva) {
            const reservaUID = parametros.reserva
            return this.detallesReserva(reservaUID)

        } else {
            this.marcoUI()
            const parametrosFormatoURL = granuladoURL.parametros
            const parametrosFormatoIDV = {}
            Object.entries(parametrosFormatoURL).forEach(([nombreParametroURL, valorParametroURL]) => {
                const nombreParametroIDV = casaVitini.utilidades.cadenas.snakeToCamel(nombreParametroURL)
                let nombreColumnaIDV
                if ((valorParametroURL)?.toLowerCase() === "reserva") {
                    nombreColumnaIDV = "reservaUID"
                } else if ((valorParametroURL)?.toLowerCase() === "estado_pago") {
                    nombreColumnaIDV = "estadoPagoIDV"
                } else if ((valorParametroURL)?.toLowerCase() === "estado_reserva") {
                    nombreColumnaIDV = "estadoReservaIDV"
                } else if (valorParametroURL) {
                    nombreColumnaIDV = casaVitini.utilidades.cadenas.snakeToCamel(valorParametroURL)
                }
                parametrosFormatoIDV[nombreParametroIDV] = nombreColumnaIDV
            })
            return this.listaReservas.mostrarReservasResueltas(parametrosFormatoIDV)
        }



    },
    marcoUI: function () {
        const main = document.querySelector("main")

        const marcoElasticoRelatico = document.createElement("div")
        marcoElasticoRelatico.classList.add(
            "marcoElasticoRelativo"
        )

        const espacioMisReservas = document.createElement("div")
        espacioMisReservas.classList.add("marocCuenta")
        espacioMisReservas.setAttribute("componente", "espacioMisReservas")
        marcoElasticoRelatico.appendChild(espacioMisReservas)
        const contenedorResultados = document.createElement("div")
        contenedorResultados.classList.add(
            "flexVertical"
        )
        contenedorResultados.setAttribute("contenedor", "misReservas")
        marcoElasticoRelatico.appendChild(contenedorResultados)
        main.appendChild(marcoElasticoRelatico)
    },
    listaReservas: {
        mostrarReservasResueltas: async function (transaccion) {
            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const selectorEspacio = document.querySelector("[componente=espacioMisReservas]")
            selectorEspacio.setAttribute("instanciaBusqueda", instanciaUID)

            const main = document.querySelector("main")

            const origen = transaccion.origen
            delete transaccion.origen
            delete transaccion.tipoConstruccionGrid
            const granuladoURL = casaVitini.utilidades.granuladorURL()

            const paginaTipo = transaccion.paginaTipo
            let nombreColumnaURL
            const nombreColumna = transaccion.nombreColumna
            transaccion.pagina = transaccion.pagina ? Number(transaccion.pagina) : 1
            if ((nombreColumna)?.toLowerCase() === "estadoreservaidv") {
                nombreColumnaURL = "estado_reserva"
            } else
                if ((nombreColumna)?.toLowerCase() === "estadopagoidv") {
                    nombreColumnaURL = "estado_pago"
                } else
                    if ((nombreColumna)?.toLowerCase() === "reservauid") {
                        nombreColumnaURL = "reserva"
                    } else if (nombreColumna) {
                        nombreColumnaURL = casaVitini.utilidades.cadenas.camelToSnake(nombreColumna)
                    }

            const selectorAlmacen = document.querySelector("[areaGrid=grisReservasDelCliente]")?.getAttribute("almacen") || "{}"
            const almacen = JSON.parse(selectorAlmacen)
            const clienteUID = transaccion.clienteUID || almacen?.clienteUID


            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "miCasa/misReservas/listarMisReservas",
                pagina: transaccion.pagina,
                nombreColumna: nombreColumna,
                sentidoColumna: transaccion.sentidoColumna,
            })


            const instanciaRenderizada = document.querySelector(`[instanciaBusqueda="${instanciaUID}"]`)
            if (!instanciaRenderizada) {
                return
            }


            if (respuestaServidor?.error) {
                const espacioClientes = document.querySelector("[componente=espacioMisReservas]")
                document.querySelector("[gridUID=gridMisReservas]")?.remove()
                document.querySelector("[componente=estadoBusqueda]")?.remove()
                const estadoBusquedaUI = document.createElement("div")
                estadoBusquedaUI.classList.add("textoCentrado")
                estadoBusquedaUI.setAttribute("componente", "estadoBusqueda")
                estadoBusquedaUI.textContent = respuestaServidor.error
                espacioClientes.appendChild(estadoBusquedaUI)
                return

            }
            if (respuestaServidor.totalReservas === 0) {
                const espacioClientes = document.querySelector("[componente=espacioMisReservas]")
                document.querySelector("[gridUID=gridMisReservas]")?.remove()
                document.querySelector("[componente=estadoBusqueda]")?.remove()
                const estadoBusquedaUI = document.createElement("div")
                estadoBusquedaUI.classList.add("infoCuenta")
                estadoBusquedaUI.setAttribute("componente", "estadoBusqueda")
                estadoBusquedaUI.textContent = "No se han encontrado reservas"
                espacioClientes.appendChild(estadoBusquedaUI)
                return
            } else if (respuestaServidor.totalReservas === 1) {
                const reservaUID = respuestaServidor.reservas[0].reservaUID
                return casaVitini.shell.navegacion.controladorVista({
                    vista: "/micasa/reservas/reserva:" + reservaUID,

                })
            }
            document.querySelector("[componente=estadoBusqueda]")?.remove()
            const misReservas = respuestaServidor.reservas
            const paginasTotales = respuestaServidor.paginasTotales
            const pagina = respuestaServidor.pagina
            const sentidoColumna = respuestaServidor.sentidoColumna

            const columnasGrid = [
                {
                    columnaUI: "Reserva",
                    columnaIDV: "reservaUID",
                },
                {
                    columnaUI: "Fecha de entrada",
                    columnaIDV: "fechaEntrada",
                },
                {
                    columnaUI: "Fecha de salida",
                    columnaIDV: "fechaSalida",
                },
                {
                    columnaUI: "Estado de la reserva",
                    columnaIDV: "estadoReservaIDV",
                },
                {
                    columnaUI: "Estado del pago",
                    columnaIDV: "estadoPagoIDV",
                },
                {
                    columnaUI: "Fecha de la reserva",
                    columnaIDV: "fechaCreacion",
                },
            ]
            const parametrosFinales = {
            }

            if (nombreColumna) {
                parametrosFinales.nombre_columna = nombreColumnaURL
                parametrosFinales.sentido_columna = sentidoColumna
            }
            if (pagina > 1 && paginasTotales > 1) {
                parametrosFinales.pagina = pagina
            }
            const estructuraParametrosFinales = []
            for (const [parametroFinal, valorFinal] of Object.entries(parametrosFinales)) {
                const estructura = `${parametroFinal}:${valorFinal}`
                estructuraParametrosFinales.push(estructura)
            }
            let parametrosURLFInal = ""
            if (estructuraParametrosFinales.length > 0) {
                parametrosURLFInal = "/" + estructuraParametrosFinales.join("/")
            }


            const constructorURLFinal = granuladoURL.directoriosFusion + parametrosURLFInal
            casaVitini.view.__sharedMethods__.grid.despliegue({
                metodoSalida: "view.listaReservas.mostrarReservasResueltas",
                configuracionGrid: {
                    filas: misReservas,
                    almacen: {
                        clienteUID: clienteUID,
                    },
                    sentidoColumna: sentidoColumna,
                    nombreColumna: nombreColumna,
                    pagina: pagina,
                    destino: "[contenedor=misReservas]",
                    columnasGrid: columnasGrid,
                    gridUID: "miCasas_reservasDelCliente",
                    mascaraURL: {
                        mascara: "/micasa/reservas/reserva:",
                        parametro: "reservaUID"
                    },
                },
                configuracionPaginador: {
                    paginasTotales: paginasTotales,
                    granuladoURL: {
                        parametros: parametrosFinales,
                        directoriosFusion: granuladoURL.directoriosFusion
                    },
                }
            })

            const titulo = "ADminstar reservas"
            const estado = {
                zona: constructorURLFinal,
                EstadoInternoZona: "estado",
                tipoCambio: "parcial",
                componenteExistente: "espacioMisReservas",
                funcionPersonalizada: "view.listaReservas.mostrarReservasResueltas",
                args: transaccion
            }

            if (origen === "url" || origen === "botonMostrarClientes") {
                window.history.replaceState(estado, titulo, constructorURLFinal);
            }
            if ((origen === "botonNumeroPagina" && paginaTipo === "otra") || origen === "tituloColumna") {
                window.history.pushState(estado, titulo, constructorURLFinal);
            }
            if (origen === "botonNumeroPagina" && paginaTipo === "actual") {
                window.history.replaceState(estado, titulo, constructorURLFinal);
            }
        },
        guardarCambios: async () => {
            const nuevoIDX = document.querySelector("[campo=nuevoIDX]")
            const datosParaActualizar = {
                zona: "miCasa/actualizarIDX",
                nuevoIDX: nuevoIDX.value
            }
            const respuestaServidor = await casaVitini.shell.servidor(datosParaActualizar)
            if (respuestaServidor?.error) {
                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                nuevoIDX.value = null


                casaVitini.shell.controladoresUI.controladorEstadoIDX()
            }
        },
    },
    detallesReserva: async function (reservaUID) {

        const main = document.querySelector("main")
        const instanciaUID = main.getAttribute("instanciaUID")
        const granuladoURL = casaVitini.utilidades.granuladorURL()

        const spinner = casaVitini.ui.componentes.spinnerSimple()
        main.appendChild(spinner)
        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "miCasa/misReservas/detallesReserva",
            reservaUID: reservaUID
        })
        const ui_renderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!ui_renderizada) { return }
        ui_renderizada.innerHTML = null

        if (respuestaServidor?.error) {
            ui_renderizada.textContent = respuestaServidor?.error
        }
        if (respuestaServidor?.ok) {

            const marcoElastico = document.createElement("div")
            marcoElastico.classList.add(
                "marcoElasticoRelativo"
            )
            main.appendChild(marcoElastico)
            const reservaUI = await casaVitini.view.__sharedMethods__.detallesReservaUI.reservaUI.despliege({
                reservaUID,
                configuracionVista: "publica"
            })
            marcoElastico.appendChild(reservaUI)


            const parametros = granuladoURL.parametros
            const zonaURL = parametros.zona

            if (zonaURL) {
                const categoriaGlobalIDV = casaVitini.utilidades.cadenas.snakeToCamel(zonaURL)
                casaVitini.view.__sharedMethods__.detallesReservaUI.reservaUI.ui.componentesUI.categoriasGlobalesUI.controladorCategorias({
                    origen: "url",
                    categoria: categoriaGlobalIDV
                })
            }
        }
    },
}