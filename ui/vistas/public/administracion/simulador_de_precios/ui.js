casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        const instanciaUID = main.getAttribute("instanciaUID")
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const comandoInicial = granuladoURL.directorios[granuladoURL.directorios.length - 1]

        const parametros = granuladoURL.parametros
        if (comandoInicial === "simulador_de_precios" && !parametros.simulacion) {
            this.portada.contenedorBotones()
            const parametrosFormatoURL = granuladoURL.parametros
            const parametrosFormatoIDV = {}
            Object.entries(parametrosFormatoURL).forEach(([nombreParametroURL, valorParametroURL]) => {
                const nombreParametroIDV = casaVitini.utilidades.cadenas.snakeToCamel(nombreParametroURL)
                let nombreColumnaIDV
                if ((valorParametroURL)?.toLowerCase() === "simulacion_uid") {
                    nombreColumnaIDV = "simulacionUID"
                } else if (valorParametroURL) {
                    nombreColumnaIDV = casaVitini.utilidades.cadenas.snakeToCamel(valorParametroURL)
                }
                parametrosFormatoIDV[nombreParametroIDV] = nombreColumnaIDV
            })

            this.portada.mostrarSimulacionesResueltas(parametrosFormatoIDV)
        } else if (comandoInicial === "simulador_de_precios" && parametros.simulacion) {
            main.setAttribute("zonaCSS", "administracion/simuladorDePrecios/detalles")

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/simuladorDePrecios/detallesSimulacion",
                simulacionUID: String(parametros.simulacion)
            })
            const seccionRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
            if (!seccionRenderizada) { return }
            if (respuestaServidor.error) {
                const titulo = document.querySelector(".tituloGris")
                titulo.textContent = "No existe ningúns simulación con el identificador: " + parametros.simulacion
                main.innerHTML = null
                main.appendChild(titulo)
                return
            }
            await this.detallesSimulacion.detalleSimulacion(respuestaServidor)

            const zonaURL = parametros.zona
            if (zonaURL) {
                const categoriaGlobalIDV = casaVitini.utilidades.cadenas.snakeToCamel(zonaURL)
                this.detallesSimulacion.componentesUI.categoriasGlobalesUI.controladorMostrar({
                    origen: "url",
                    categoria: categoriaGlobalIDV
                })
            }
        }
        else {
            casaVitini.ui.componentes.urlDesconocida()
        }
    },
    portada: {
        mostrarSimulacionesResueltas: async function (data) {
            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const selectorEspacio = document.querySelector("[componente=espacio]")
            selectorEspacio.setAttribute("instanciaBusqueda", instanciaUID)

            const main = document.querySelector("main")
            main.setAttribute("zonaCSS", "administracion/simulador_de_precios")
            const granuladoURL = casaVitini.utilidades.granuladorURL()
            const transaccion = {
                origen: "url",
                ...data
            }

            transaccion.pagina = transaccion.pagina ? Number(transaccion.pagina) : 1
            const paginaTipo = transaccion.paginaTipo
            const nombreColumna = transaccion.nombreColumna

            let nombreColumnaURL
            if ((nombreColumna)?.toLowerCase() === "simulacionuid") {
                nombreColumnaURL = "simulacion_uid"
            } else if (nombreColumna) {
                nombreColumnaURL = casaVitini.utilidades.cadenas.camelToSnake(nombreColumna)
            }
            if (transaccion.sentido_columna) {
                transaccion.sentidoColumna = transaccion.sentido_columna
                delete transaccion.sentido_columna
            }
            const origen = transaccion.origen
            delete transaccion.origen
            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/simuladorDePrecios/listaSimulacionesPaginados",
                pagina: transaccion.pagina,
                nombreColumna: nombreColumna,
                sentidoColumna: transaccion.sentidoColumna
            })
            const instanciaRenderizada = document.querySelector(`[instanciaBusqueda="${instanciaUID}"]`)
            if (!instanciaRenderizada) {
                return
            }
            if (respuestaServidor?.error) {
                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }

            if (respuestaServidor?.totalSimulaciones === 0) {
                const espacioClientes = document.querySelector("[componente=espacio]")
                document.querySelector("[gridUID=gridImpuestos]")?.remove()
                document.querySelector("[componente=estadoBusqueda]")?.remove()
                const estadoBusquedaUI = document.createElement("div")
                estadoBusquedaUI.classList.add(
                    "buscadorClientesEstadoBusqueda",
                    "textoCentrado"
                )
                estadoBusquedaUI.setAttribute("componente", "estadoBusqueda")
                estadoBusquedaUI.textContent = "No hay simulaciones configurados"
                espacioClientes.appendChild(estadoBusquedaUI)
                return

            }
            const simulaciones = respuestaServidor.simulaciones
            const sentidoColumna = respuestaServidor.sentidoColumna
            const pagina = respuestaServidor.pagina
            const paginasTotales = respuestaServidor.paginasTotales
            const columnasGrid = [
                {
                    columnaUI: "UID",
                    columnaIDV: "simulacionUID",
                },
                {
                    columnaUI: "Nombre",
                    columnaIDV: "nombre",
                },
                {
                    columnaUI: "Fecah de creación",
                    columnaIDV: "fechaCreacion",
                },
                {
                    columnaUI: "Fecha de entrada",
                    columnaIDV: "fechaEntrada",
                },
                {
                    columnaUI: "Fecha de salida",
                    columnaIDV: "fechaSalida",
                }
            ]
            const parametrosFinales = {}

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

            casaVitini.ui.componentes.componentesComplejos.grid.despliegue({
                metodoSalida: "view.portada.mostrarSimulacionesResueltas",
                configuracionGrid: {
                    filas: simulaciones,
                    sentidoColumna: sentidoColumna,
                    nombreColumna: nombreColumna,
                    pagina: pagina,
                    destino: "[componente=espacio]",
                    columnasGrid: columnasGrid,
                    gridUID: "gridSimuladorDePrecios",
                    mascaraURL: {
                        mascara: "/administracion/simulador_de_precios/simulacion:",
                        parametro: "simulacionUID"
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
                componenteExistente: "contenedorBotonesSimulador",
                funcionPersonalizada: "view.portada.mostrarSimulacionesResueltas",
                args: transaccion
            }
            if (origen === "url" || origen === "botonMostrarClientes") {
                window.history.replaceState(estado, titulo, constructorURLFinal);
            } else if ((origen === "botonNumeroPagina" && paginaTipo === "otra") || origen === "tituloColumna") {
                window.history.pushState(estado, titulo, constructorURLFinal);
            } else if (origen === "botonNumeroPagina" && paginaTipo === "actual") {
                window.history.replaceState(estado, titulo, constructorURLFinal);

            }
        },
        contenedorBotones: function () {
            const espacioImpuestos = document.querySelector("[contenedor=botones]")
            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add(
                "flexHorizontal",
                "flexDerecha"
            )
            contenedorBotones.setAttribute("componente", "contenedorBotonesSimulador")
            const botonCrearImpuesto = document.createElement("a")
            botonCrearImpuesto.classList.add("botonV1")
            botonCrearImpuesto.textContent = "Nueva simulación"
            botonCrearImpuesto.setAttribute("href", "/administracion/simulador_de_precios/nueva_simulacion")
            botonCrearImpuesto.setAttribute("vista", "/administracion/simulador_de_precios/nueva_simulacion")
            botonCrearImpuesto.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            contenedorBotones.appendChild(botonCrearImpuesto)
            espacioImpuestos.appendChild(contenedorBotones)
        },
    },
    detallesSimulacion: {
        detalleSimulacion: async function (respuestaServidor) {
            if (respuestaServidor?.error) {
                const info = {
                    titulo: "No existe ninguna simulación con ese identificador",
                    descripcion: "La simulación a que hace referencia la URL no existe.Revisa el identificador.Quizás fue una simulación que tuviste hace un tiempo y que borraste"
                }
                casaVitini.ui.componentes.mensajeSimple(info)
            }
            if (respuestaServidor?.ok) {


                const simulacionData = respuestaServidor
                const nombre = simulacionData.nombre
                const zonaIDV = simulacionData.zonaIDV
                const simulacionUID = simulacionData.simulacionUID
                const fechaCreacion = simulacionData?.fechaCreacion
                const fechaEntrada = simulacionData?.fechaEntrada
                const fechaSalida = simulacionData?.fechaSalida
                const contenedorFinanciero = simulacionData.contenedorFinanciero
                const apartamentos = simulacionData.apartamentos
                const servicios = simulacionData.servicios || []
                const complementosDeAlojamiento = simulacionData.complementosDeAlojamiento
                const codigosDescuento = simulacionData.codigosDescuento || []

                const selectorEspacio = document.querySelector("[componente=espacio]")
                const contenedor = document.createElement("div")
                contenedor.classList.add("contenedorNuevaSimiulacion")
                selectorEspacio.appendChild(contenedor)
                const instanciaUID = document.querySelector("main").getAttribute("instanciaUID")

                const simulacionUI = casaVitini.view.componentes.simulacionUI({ simulacionUID })
                simulacionUI.setAttribute("componente", `simulacionUID_${simulacionUID}`)

                selectorEspacio.appendChild(simulacionUI)

                const selectorTitulo = document.querySelector(".tituloGris")
                selectorTitulo.classList.add(
                    "padding5",
                    "titulo"
                )
     

                const controladorAlturaTituloDinamico = (e) => {
                    const selectorInstanciaActual = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                    if (!selectorInstanciaActual) {
                        document.removeEventListener("scroll", controladorAlturaTituloDinamico)

                    }
                    const altura = window.scrollY;

                    if (altura > 78) {
                        selectorTitulo.classList.add("titulo_sticky")
                    } else {
                        selectorTitulo.classList.remove("titulo_sticky")
                    }
                }
                document.addEventListener("scroll", controladorAlturaTituloDinamico)

                const contenedorSimulacion = document.querySelector("[contenedor=simulacion]")
                const contenedorGlobal = simulacionUI.querySelector("[contenedor=botones]")

                const campoNombre = document.createElement("input")
                campoNombre.setAttribute("campo", "nombre")
                campoNombre.classList.add(
                    "padding6",
                    "backgroundGrey1",
                    "borderRadius8",
                    "padding10",
                    "simplificadorCampo",
                    "noSelecionable"
                )
                campoNombre.placeholder = "Escriba un nombre para la simulación"

                contenedorGlobal.appendChild(campoNombre)

                const contenedorBotones = document.createElement("div")
                contenedorBotones.classList.add(
                    "gridHorizontal2C",
                    "gap6"
                )
                contenedorGlobal.appendChild(contenedorBotones)


                const botonGuardar = document.createElement("div")
                botonGuardar.classList.add(
                    "botonV1",
                    "comportamientoBoton",
                    "padding6",
                    "textoCentrado",
                    "backgroundGrey1",
                    "borderRadius8",
                    "noSelecionable"
                )
                botonGuardar.textContent = "Guardar simulación"
                botonGuardar.addEventListener("click", () => {
                    this.actualizarNombreSimulacion()
                })

                contenedorBotones.appendChild(botonGuardar)

                const botonEliminar = document.createElement("div")
                botonEliminar.classList.add(
                    "botonV1",
                    "comportamientoBoton",
                    "padding6",
                    "textoCentrado",
                    "backgroundGrey1",
                    "borderRadius8",
                    "noSelecionable"
                )
                botonEliminar.textContent = "Eliminar simulación"
                botonEliminar.addEventListener("click", () => {
                    this.eliminarSimulacion.UI()
                })
                contenedorBotones.appendChild(botonEliminar)

                const selectorNombre = simulacionUI.querySelector("[campo=nombre]")
                const selectorFechaEntrada = simulacionUI.querySelector("[calendario=entrada]")
                const selectorFechaSalida = simulacionUI.querySelector("[calendario=salida]")
                const selectorFechaCreacion = simulacionUI.querySelector("[calendario=unico]")
                const selectorsApartamentos = simulacionUI.querySelector("[contenedor=apartamentosSeleccianados]")
                const instanciaUID_contenedorApartamentos = selectorsApartamentos.querySelector("[instanciaUID]").getAttribute("instanciaUID")

                const hubFecha = (fecha) => {
                    if (fecha) {
                        return casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fecha)
                    } else {
                        return "(Seleccionar)"
                    }
                }

                selectorEspacio.setAttribute("simulacionUID", simulacionUID)
                selectorNombre.value = nombre
                if (fechaCreacion) {
                    selectorFechaCreacion.setAttribute("memoriaVolatil", fechaCreacion)
                }
                if (fechaEntrada) {
                    selectorFechaEntrada.setAttribute("memoriaVolatil", fechaEntrada)
                }
                if (fechaSalida) {
                    selectorFechaSalida.setAttribute("memoriaVolatil", fechaSalida)
                }

                selectorFechaCreacion.querySelector("[fechaUI=unico]").textContent = hubFecha(fechaCreacion)
                selectorFechaEntrada.querySelector("[fechaUI=fechaInicio]").textContent = hubFecha(fechaEntrada)
                selectorFechaSalida.querySelector("[fechaUI=fechaFin]").textContent = hubFecha(fechaSalida)

                const selectorBotonReconstrucion = simulacionUI.querySelector("[boton=reconstruccionHubSinConfirmacion]")
                selectorBotonReconstrucion.addEventListener("click", () => {
                    this.componentesUI.reconstruirDesgloseFinanciero.desdeHub.confirmarReconstrucion({
                        simulacionUID: String(simulacionUID),
                        sobreControl: "activado"
                    })
                })

                const componenteSelectorApartamentos = simulacionUI.querySelector("[componente=selectorApartamentos]")
                const instanciaUID_sA = componenteSelectorApartamentos.getAttribute("instanciaUID")
                for (const contenedorApartamento of apartamentos) {
                    const apartamentoIDV = contenedorApartamento.apartamentoIDV
                    const apartamentoUI = contenedorApartamento.apartamentoUI
                    const infoSinApartamento = document.querySelector("[componente=infoSinApartamento]")
                    infoSinApartamento.style.display = "none"

                    const cApartamento = casaVitini.ui.componentes.componentesComplejos.selectorApartamentosEspecificosUI.apartamentoUI({
                        apartamentoIDV,
                        apartamentoUI,
                        metodoEliminarApartamento: {
                            metodo: casaVitini.view.detallesSimulacion.componentesUI.alojamiento.eliminarApartamento,
                            data: {
                                simulacionUID,
                                instanciaUID: instanciaUID_sA
                            }
                        }
                    })

                    const selectorZonaApartamentos = document.querySelector("[componente=zonaAnadirApartamento]")
                    selectorZonaApartamentos.appendChild(cApartamento)
                }

                const selectorZonaIDV = simulacionUI.querySelector("[selector=zonaIDV]")
                selectorZonaIDV.value = zonaIDV || ""

                casaVitini.view.componentes.servicios.actualizarContenedor({
                    servicios,
                    simulacionUID
                })

                casaVitini.view.detallesSimulacion.componentesUI.complementosDeAlojamiento.arranque({
                    apartamentos,
                    complementosDeAlojamiento
                })
                casaVitini.view.componentes.postProcesamientoTransaccion(simulacionData)

                // if (contenedorFinanciero?.desgloseFinanciero) {
                //     casaVitini.ui.componentes.contenedorFinanciero.constructor({
                //         destino: `[contenedor=simulacion]`,
                //         contenedorFinanciero,
                //         modoUI: "simulador"
                //     })
                // } else {
                //    casaVitini.view.componentes.infoLllavesFaltantes({
                //     simulacionUID,
                //     info: null
                //    })
                // }
            }
        },
        componentesUI: {
            alojamiento: {
                insertarAlojamiento: async function (data) {

                    const simulacionUID = document.querySelector("[simulacionUID]").getAttribute("simulacionUID")
                    const apartamentoIDV = String(data.apartamentoIDV)
                    const apartamentoUI = data.apartamentoUI
                    const instancciaUID_destinoSelectorApartamentos = data.instanciaUID

                    const instanciaPantallaCarga = casaVitini.utilidades.codigoFechaInstancia()
                    casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
                        mensaje: "Insertando apartamento en la simulación...",
                        textoBoton: "ocultar",
                        instanciaUID: instanciaPantallaCarga
                    })

                    const respuestaServidor = await casaVitini.shell.servidor({
                        zona: "administracion/simuladorDePrecios/alojamiento/insertarAlojamientoEnSimulacion",
                        simulacionUID,
                        apartamentoIDV,
                    })


                    const uiRenderizada = document.querySelector(`[simulacionUID="${simulacionUID}"] [contenedor=apartamentosSeleccianados]`)
                    if (!uiRenderizada) { return }
                    const pantallaDeCargaObsoleta = document.querySelector(`[instanciaUID="${instanciaPantallaCarga}"]`)
                    pantallaDeCargaObsoleta?.remove()

                    if (respuestaServidor?.error) {
                        casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)

                    } else if (respuestaServidor?.ok) {
                        const nuevoApartamento = respuestaServidor.nuevoApartamento

                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()

                        casaVitini.view.componentes.postProcesamientoTransaccion(respuestaServidor)

                        const contenedorComplementosAlojamiento = document.querySelector("[componente=complementosDeAlojamiento]")
                        const instanciaUID_contenedorComplementos = contenedorComplementosAlojamiento.getAttribute("instanciaUID")

                        const cComplementoDeAlojamientoUI = casaVitini.view.detallesSimulacion.componentesUI.complementosDeAlojamiento.componentesUI.apartamentoUI({
                            apartamentoIDV: nuevoApartamento.apartamentoIDV,
                            apartamentoUI: nuevoApartamento.apartamentoUI,
                            apartamentoUID: nuevoApartamento.apartamentoUID,
                            instanciaUID_contenedorComplementos: instanciaUID_contenedorComplementos
                        })
                        const contenedorLista = contenedorComplementosAlojamiento.querySelector("[componente=contenedorLista]")
                        contenedorLista.appendChild(cComplementoDeAlojamientoUI)
                        const selectorZonaApartamentos = document.querySelector(`[instanciaUID="${instancciaUID_destinoSelectorApartamentos}"][componente=selectorApartamentos] [componente=zonaAnadirApartamento]`)
                        if (selectorZonaApartamentos) {
                            const cApartamento = casaVitini.ui.componentes.componentesComplejos.selectorApartamentosEspecificosUI.apartamentoUI({
                                apartamentoIDV,
                                apartamentoUI,
                                metodoEliminarApartamento: {
                                    metodo: casaVitini.view.detallesSimulacion.componentesUI.alojamiento.eliminarApartamento,
                                    data: {
                                        simulacionUID,
                                        instanciaUID: instancciaUID_destinoSelectorApartamentos
                                    }
                                }
                            })
                            selectorZonaApartamentos.appendChild(cApartamento)
                        }
                    }
                },
                eliminarApartamento: async function (data) {

                    const simulacionUID = String(data.simulacionUID)
                    const apartamentoIDV = String(data.apartamentoIDV)
                    const e = data.e

                    const instanciaPantallaCarga = casaVitini.utilidades.codigoFechaInstancia()
                    casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
                        mensaje: "Eliminando apartamento en la simulación...",
                        textoBoton: "ocultar",
                        instanciaUID: instanciaPantallaCarga
                    })

                    const respuestaServidor = await casaVitini.shell.servidor({
                        zona: "administracion/simuladorDePrecios/alojamiento/eliminarAlojamientoEnSimulacion",
                        simulacionUID,
                        apartamentoIDV,
                    })
                    const uiRenderizada = document.querySelector(`[simulacionUID="${simulacionUID}"] [contenedor=apartamentosSeleccianados]`)
                    if (!uiRenderizada) { return }

                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    if (respuestaServidor?.error) {
                        casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                    }
                    if (respuestaServidor?.ok) {
                        const alojamiento = respuestaServidor.ok
                        casaVitini.view.componentes.postProcesamientoTransaccion(respuestaServidor)
                        casaVitini.ui.componentes.componentesComplejos.selectorApartamentosEspecificosUI.eliminarApartamentoUI({
                            e
                        })

                        const contenedorComplementosAlojamiento = document.querySelector(`[contenedor=complementosAlojamiento] [componente=contenedorLista] [apartamentoIDV="${apartamentoIDV}"]`)
                        contenedorComplementosAlojamiento?.remove()
                    }
                }
            },
            complementosDeAlojamiento: {
                arranque: async function (data) {

                    const apartamentos = data.apartamentos
                    const complementosDeAlojamiento = data.complementosDeAlojamiento
                    const constenedorGlobal = document.querySelector("[contenedor=complementosAlojamiento]")
                    const instanciaUID_contenedorComplementos = casaVitini.utilidades.codigoFechaInstancia()

                    const contenedor = document.createElement("div")
                    contenedor.classList.add(
                        "flexVertical",
                        "gap6",
                        //  "padding6"
                    )
                    contenedor.setAttribute("instanciaUID", instanciaUID_contenedorComplementos)
                    contenedor.setAttribute("componente", "complementosDeAlojamiento")
                    constenedorGlobal.appendChild(contenedor)
                    const simulacionUI = document.querySelector("[simulacionUID]")
                    const simulacionUID = simulacionUI.getAttribute("simulacionUID")

                    const contenedorLista = document.createElement("div")
                    contenedorLista.classList.add(
                        "gridHorizontal2C",
                        "gap6",
                    )
                    contenedorLista.setAttribute("componente", "contenedorLista")
                    contenedor.appendChild(contenedorLista)

                    if (apartamentos.length > 0) {
                        constenedorGlobal.querySelector("[componente=sinInfo]")?.remove()
                    }
                    apartamentos.forEach((a) => {
                        const apartamentoIDV = a.apartamentoIDV
                        const apartamentoUI_ = a.apartamentoUI
                        const apartamentoUID = a.apartamentoUID

                        contenedorLista.appendChild(this.componentesUI.apartamentoUI({
                            apartamentoIDV,
                            apartamentoUI: apartamentoUI_,
                            apartamentoUID,
                            instanciaUID_contenedorComplementos
                        }))

                    })

                    complementosDeAlojamiento.forEach((com) => {
                        const sel = contenedor.querySelector(`[apartamentoIDV="${com.apartamentoIDV}"] [contenedor=complementos]`)
                        sel.querySelector("[componente=sinInfo]")?.remove()
                        sel.appendChild(this.componentesUI.complementoUI(com))
                    })


                },
                componentesUI: {
                    insertarComplementoEnAlojamiento: {

                        ui: async function (data) {
                            const main = document.querySelector("main")
                            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                            const simulacionUID = main.querySelector("[simulacionUID]").getAttribute("simulacionUID")
                            const instanciaUID_insertarComplementoUI = ui.getAttribute("instanciaUID")
                            const instanciaUID_contenedorComplementos = data.instanciaUID_contenedorComplementos
                            const apartamentoIDV = data.apartamentoIDV
                            main.appendChild(ui)
                            const constructor = ui.querySelector("[componente=contenedor]")
                            const spinner = casaVitini.ui.componentes.spinner({
                                mensaje: "Obteniendo complementos del alojamiento...",
                                textoBoton: "Cancelar"
                            })
                            constructor.appendChild(spinner)

                            const transaccion = {
                                zona: "administracion/complementosDeAlojamiento/obtenerComplementosPorAlojamiento",
                                apartamentoIDV,
                                filtro: "soloActivos"

                            }

                            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                            const uiRenderizada = document.querySelectorAll(`[instanciaUID="${instanciaUID_contenedorComplementos}"]`)
                            if (!uiRenderizada) { return }
                            if (respuestaServidor?.error) {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                spinner.remove()


                                const complementosPorApartamentoIDV = respuestaServidor.complementosPorApartamentoIDV

                                const contenedor = document.createElement("div")
                                contenedor.classList.add(
                                    "maxWidth1280px",
                                    "width100",
                                    "flexVertical",
                                    "gap10",
                                )
                                constructor.appendChild(contenedor)
                                const estadoUI_ = (estadoIDV) => {

                                    if (estadoIDV === "activado") {
                                        return "Activada"
                                    } else if (estadoIDV === "desactivado") {
                                        return "Desactivada"
                                    }

                                }
                                if (complementosPorApartamentoIDV.length > 0) {
                                    constructor.appendChild(this.botonCancelar())

                                } else {
                                    const info = document.querySelector("p")
                                    info.classList.add("textoCentrado", "padding14")
                                    info.textContent = "Este alojamiento no tiene ningun complemento configurado."
                                    constructor.appendChild(info)
                                }
                                complementosPorApartamentoIDV.forEach((c) => {
                                    const complementoUI = c.complementoUI
                                    const complementoUID = c.complementoUID
                                    const estadoIDV = c.estadoIDV
                                    const tipoPrecio = c.tipoPrecio
                                    const precio = c.precio
                                    const definicion = c.definicion


                                    const contenedor = document.createElement("div")
                                    contenedor.setAttribute("complementoUID", complementoUID)
                                    contenedor.classList.add(
                                        "borderRadius12",
                                        "width100",
                                        "flexVertical",
                                        "backgroundGrey1",
                                        "padding6",
                                        "gap6"
                                    )

                                    const contenedorGlobal = document.createElement("div")
                                    contenedorGlobal.classList.add(
                                        "flexVertical",
                                        "padding6",
                                        "gap6"
                                    )

                                    const nombreOfertaUI = document.createElement("div")
                                    nombreOfertaUI.classList.add("negrita")
                                    nombreOfertaUI.textContent = complementoUI
                                    contenedorGlobal.appendChild(nombreOfertaUI)

                                    const estadoTitulo = document.createElement("div")
                                    estadoTitulo.textContent = "Estado del complemento"
                                    contenedorGlobal.appendChild(estadoTitulo)


                                    const estadoUI = document.createElement("div")
                                    estadoUI.classList.add("negrita")
                                    estadoUI.textContent = estadoUI_(estadoIDV)
                                    contenedorGlobal.appendChild(estadoUI)
                                    contenedor.appendChild(contenedorGlobal)

                                    const contendorBotones = document.createElement("div")
                                    contendorBotones.classList.add(
                                        "flexHorizontal",
                                        "gap6",
                                    )

                                    const botonInsertar = document.createElement("div")
                                    botonInsertar.classList.add(
                                        "borderRadius8",
                                        "backgroundGrey1",
                                        "comportamientoBoton",
                                        "padding8"
                                    )
                                    botonInsertar.textContent = "Insertar complemento en el alojamiento"
                                    botonInsertar.addEventListener("click", () => {
                                        this.confirmarInsertar({
                                            simulacionUID,
                                            complementoUID,
                                            instanciaUID_insertarComplementoUI,
                                            instanciaUID_contenedorComplementos
                                        })

                                    })
                                    contendorBotones.appendChild(botonInsertar)

                                    const botonVerOferta = document.createElement("a")
                                    botonVerOferta.classList.add(
                                        "borderRadius8",
                                        "backgroundGrey1",
                                        "comportamientoBoton",
                                        "padding8",
                                        "limpiezaBotonA"
                                    )
                                    botonVerOferta.textContent = "Ir al complemento"
                                    botonVerOferta.setAttribute("href", "/administracion/complementos_de_alojamiento/complemento:" + complementoUID)
                                    botonVerOferta.setAttribute("vista", "/administracion/complementos_de_alojamiento/complemento:" + complementoUID)
                                    botonVerOferta.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                                    contendorBotones.appendChild(botonVerOferta)

                                    contenedor.appendChild(contendorBotones)
                                    constructor.appendChild(contenedor)
                                })
                                constructor.appendChild(this.botonCancelar())

                            }

                        },
                        botonCancelar: () => {
                            const botonCancelar = document.createElement("div")
                            botonCancelar.classList.add("botonV1")
                            botonCancelar.setAttribute("boton", "cancelar")
                            botonCancelar.textContent = "Cerrar y volver a la reserva"
                            botonCancelar.addEventListener("click", () => {
                                return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            })
                            return botonCancelar
                        },
                        confirmarInsertar: async function (data) {
                            const simulacionUID = data.simulacionUID
                            const complementoUID = String(data.complementoUID)
                            const instanciaUID_insertarComplementoUI = data.instanciaUID_insertarComplementoUI
                            const instanciaUID_contenedorComplementos = data.instanciaUID_contenedorComplementos

                            const ui = document.querySelector(`[instanciaUID="${instanciaUID_insertarComplementoUI}"]`)
                            const contenedor = ui.querySelector("[componente=contenedor]")
                            contenedor.innerHTML = null

                            const spinner = casaVitini.ui.componentes.spinner({
                                mensaje: "Insertando complemento en el alojamiento..."
                            })
                            contenedor.appendChild(spinner)

                            const transaccion = {
                                zona: "administracion/simuladorDePrecios/complementosDeAlojamiento/insertarComplementoDeAlojamientoEnSimulacion",
                                simulacionUID,
                                complementoUID
                            }

                            const respuestaServidor = await casaVitini.shell.servidor(transaccion)

                            const uiRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_contenedorComplementos}"]`)


                            if (!uiRenderizada) { return }
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            if (respuestaServidor?.error) {
                                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                const complementoDeAlojamiento = respuestaServidor.complementoDeAlojamiento
                                const apartamentoIDV_destino = complementoDeAlojamiento.apartamentoIDV

                                const selectorContenedor = uiRenderizada.querySelector(`[apartamentoIDV="${apartamentoIDV_destino}"] [contenedor=complementos]`)


                                if (!selectorContenedor) {
                                    return
                                }

                                const complementoUI = casaVitini.view.detallesSimulacion.componentesUI.complementosDeAlojamiento.componentesUI.complementoUI({
                                    complementoUID: complementoDeAlojamiento.complementoUID,
                                    complementoUI: complementoDeAlojamiento.complementoUI,
                                    definicion: complementoDeAlojamiento.definicion,
                                    precio: complementoDeAlojamiento.precio,
                                    tipoPrecio: complementoDeAlojamiento.tipoPrecio,
                                    apartamentoIDV: complementoDeAlojamiento.apartamentoIDV
                                })
                                const selectorInfo = selectorContenedor.querySelector("[componente=sinInfo]")
                                selectorInfo?.remove()

                                selectorContenedor.appendChild(complementoUI)
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                casaVitini.view.componentes.postProcesamientoTransaccion(respuestaServidor)


                            }

                        },
                    },
                    eliminarComplementoDeAlojamiento: {
                        ui: async function (data) {
                            const complementoUI = data.complementoUI
                            const apartamentoIDV = data.apartamentoIDV
                            const instanciaUID_contenedorComplementosDeAlojamiento = data.instanciaUID_contenedorComplementosDeAlojamiento
                            const complementoUID_enSimulacion = data.complementoUID_enSimulacion

                            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                            const instanciaUID_eliminarServicio = ui.getAttribute("instanciaUID")
                            const constructor = ui.querySelector("[componente=constructor]")

                            const titulo = constructor.querySelector("[componente=titulo]")
                            titulo.textContent = `Confirmar eliminar el complemento de alojamiento ${complementoUI} de la reserva`
                            const mensaje = constructor.querySelector("[componente=mensajeUI]")
                            mensaje.textContent = "Var a eliminar el complemento de alojamiento de la reserva, ¿Estas de acuerdo?"

                            const botonAceptar = constructor.querySelector("[boton=aceptar]")
                            botonAceptar.textContent = "Comfirmar la eliminacion"
                            botonAceptar.addEventListener("click", () => {
                                this.confirmarEliminar({
                                    complementoUID_enSimulacion,
                                    instanciaUID_eliminarServicio,
                                    instanciaUID_contenedorComplementosDeAlojamiento,
                                    apartamentoIDV
                                })
                            })
                            const botonCancelar = constructor.querySelector("[boton=cancelar]")
                            botonCancelar.textContent = "Cancelar y volver"
                            document.querySelector("main").appendChild(ui)

                        },
                        confirmarEliminar: async function (data) {
                            const complementoUID_enSimulacion = String(data.complementoUID_enSimulacion)
                            const apartamentoIDV = data.apartamentoIDV
                            const instanciaUID_eliminarServicio = data.instanciaUID_eliminarServicio
                            const instanciaUID_contenedorComplementosDeAlojamiento = data.instanciaUID_contenedorComplementosDeAlojamiento
                            const main = document.querySelector("main")
                            const simulacionUID = main.querySelector("[simulacionUID]").getAttribute("simulacionUID")


                            const ui = document.querySelector(`[instanciaUID="${instanciaUID_eliminarServicio}"]`)
                            const contenedor = ui.querySelector("[componente=constructor]")
                            contenedor.innerHTML = null

                            const spinner = casaVitini.ui.componentes.spinner({
                                mensaje: "Eliminado complemento de alojamiento de la simulación en la reserva..."
                            })
                            contenedor.appendChild(spinner)

                            const respuestaServidor = await casaVitini.shell.servidor({
                                zona: "administracion/simuladorDePrecios/complementosDeAlojamiento/eliminarComplementoDeAlojamientoEnSimulacion",
                                complementoUID_enSimulacion
                            })
                            if (respuestaServidor?.error) {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                const selectorContenedor = document.querySelector(`[instanciaUID="${instanciaUID_contenedorComplementosDeAlojamiento}"] [apartamentoIDV="${apartamentoIDV}"] [contenedor=complementos]`)
                                if (!selectorContenedor) {
                                    return
                                }

                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                selectorContenedor.querySelector(`[complentoUID_enSimulacion="${complementoUID_enSimulacion}"]`)?.remove()

                                const selectorContenedoresComplentosRenderizados = selectorContenedor.querySelectorAll("[complentoUID_enSimulacion]")
                                if (selectorContenedoresComplentosRenderizados.length === 0) {
                                    const infoSinEnlaces = casaVitini.view.detallesSimulacion.componentesUI.complementosDeAlojamiento.componentesUI.infoSinComplemento()
                                    selectorContenedor.appendChild(infoSinEnlaces)
                                }
                                casaVitini.view.componentes.postProcesamientoTransaccion(respuestaServidor)

                            }

                        },

                    },
                    infoSinComplemento: () => {
                        const info = document.createElement("p")
                        info.classList.add("flexVertical", "textoCentrado", "padding14")
                        info.setAttribute("componente", "sinInfo")
                        info.textContent = "No hay ningún complemento en este alojamiento."
                        return info
                    },
                    complementoUI: (data) => {
                        const complementoUID = data.complementoUID
                        const complementoUI = data.complementoUI
                        const definicion = data.definicion
                        const precio = data.precio
                        const tipoPrecio = data.tipoPrecio
                        const apartamentoIDV = data.apartamentoIDV


                        const renderizaPrecio = (data) => {
                            const precio = data.precio
                            const tipoPrecio = data.tipoPrecio
                            if (tipoPrecio === "fijoPorReserva") {
                                return `${precio}$ Total`
                            } else if (tipoPrecio === "porNoche") {
                                return `${precio}$ / Por noche`
                            }
                        }


                        const ui = document.createElement("div")
                        ui.setAttribute("complentoUID_enSimulacion", complementoUID)
                        ui.setAttribute("apartamentoIDV", apartamentoIDV)
                        ui.style.alignItems = "start"
                        ui.classList.add(
                            "gridHorizontal2C-1fr-min",
                            "gap6",
                            "padding6",
                            "borderRadius12",
                            "backgroundGrey1"
                        )

                        const dataCont = document.createElement("div")
                        dataCont.classList.add(
                            "flexVertical",
                            "gap6",
                            "padding6",
                        )
                        ui.appendChild(dataCont)


                        const n = document.createElement("p")
                        n.classList.add(
                            "negrita",
                        )
                        n.textContent = complementoUI
                        dataCont.appendChild(n)


                        const p = document.createElement("p")
                        p.classList.add(
                            //   "padding14"
                        )
                        p.textContent = renderizaPrecio({
                            tipoPrecio,
                            precio
                        })
                        dataCont.appendChild(p)


                        const d = document.createElement("p")
                        d.classList.add(
                            //  "padding14"
                        )
                        d.textContent = definicion
                        dataCont.appendChild(d)

                        const b = document.createElement("div")
                        b.style.borderRadius = "10px"
                        b.classList.add("botonV1")
                        b.addEventListener("click", (e) => {
                            const instanciaUID_contenedorComplementosDeAlojamiento = e.target.closest("[componente=complementosDeAlojamiento]").getAttribute("instanciaUID")

                            casaVitini.view.detallesSimulacion.componentesUI.complementosDeAlojamiento.componentesUI.eliminarComplementoDeAlojamiento.ui({
                                complementoUI,
                                instanciaUID_contenedorComplementosDeAlojamiento,
                                complementoUID_enSimulacion: complementoUID,
                                apartamentoIDV
                            })
                        })
                        b.textContent = "Eliminar"
                        ui.appendChild(b)

                        return ui
                    },
                    apartamentoUI: function (data) {
                        const apartamentoUI = data.apartamentoUI
                        const apartamentoUID = data.apartamentoUID
                        const apartamentoIDV = data.apartamentoIDV
                        const instanciaUID_contenedorComplementos = data.instanciaUID_contenedorComplementos


                        const ui = document.createElement("div")
                        ui.setAttribute("apartamentoUID", apartamentoUID)
                        ui.setAttribute("apartamentoIDV", apartamentoIDV)
                        ui.classList.add(
                            "flexVertical",
                            "gap6",
                            "padding6",
                            "borderRadius12",
                            "backgroundGrey1"
                        )

                        const n = document.createElement("p")
                        n.classList.add(
                            "negrita",
                            "padding14"
                        )
                        n.textContent = apartamentoUI
                        ui.appendChild(n)

                        const contBo = document.createElement("div")
                        contBo.classList.add("flexHorizontal")
                        ui.appendChild(contBo)

                        const b = document.createElement("div")
                        b.classList.add("botonV3")
                        b.textContent = "Añadir complemento de alojamiento"
                        b.addEventListener("click", () => {
                            this.insertarComplementoEnAlojamiento.ui({
                                instanciaUID_contenedorComplementos,
                                apartamentoIDV,
                            })
                        })
                        contBo.appendChild(b)

                        const c = document.createElement("div")
                        c.setAttribute("contenedor", "complementos")
                        c.classList.add(
                            "flexVertical",
                            "gap6",
                        )
                        c.appendChild(this.infoSinComplemento())
                        ui.appendChild(c)
                        return ui
                    }
                },
            },
            insertarDescuentos: {
                ui: async function (data) {
                    const main = document.querySelector("main")
                    const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                    const simulacionUID = main.querySelector("[simulacionUID]").getAttribute("simulacionUID")
                    const instanciaUID_insertarDescuentosUI = ui.getAttribute("instanciaUID")
                    const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                    main.appendChild(ui)
                    const constructor = ui.querySelector("[componente=contenedor]")
                    const spinner = casaVitini.ui.componentes.spinner({
                        mensaje: "Obteniendo ofertas...",
                        textoBoton: "Cancelar"
                    })
                    constructor.appendChild(spinner)

                    const transaccion = {
                        zona: "administracion/ofertas/listasOfertasAdministracion"
                    }

                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    const uiRenderizada = document.querySelectorAll(`[instanciaUID="${instanciaUID_insertarDescuentosUI}"]`)
                    if (!uiRenderizada) { return }
                    if (respuestaServidor?.error) {
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                    }
                    if (respuestaServidor?.ok) {
                        spinner.remove()
                        constructor.appendChild(this.botonCancelar())

                        const ofertas = respuestaServidor.ok

                        const contenedorOfertas = document.createElement("div")
                        contenedorOfertas.classList.add(
                            "maxWidth1280px",
                            "width100",
                            "flexVertical",
                            "gap6",
                        )
                        constructor.appendChild(contenedorOfertas)
                        const estadoUI_ = (estadoIDV) => {

                            if (estadoIDV === "activado") {
                                return "Activada"
                            } else if (estadoIDV === "desactivado") {
                                return "Desactivada"
                            }

                        }

                        ofertas.forEach((detalles) => {
                            const nombreOferta = detalles.nombreOferta
                            const ofertaUID = detalles.ofertaUID
                            const fechaInicio = detalles.fechaInicio
                            const fechaFinal = detalles.fechaFinal
                            const estadoIDV = detalles.estadoIDV
                            const zonaIDV = detalles.zonaIDV


                            const contenedorOferta = document.createElement("div")
                            contenedorOferta.setAttribute("ofertaUID", ofertaUID)
                            contenedorOferta.classList.add(
                                "borderRadius12",
                                "width100",
                                "flexVertical",
                                "backgroundGrey1",
                                "padding6",
                                "gap6"
                            )

                            const contenedorGlobal = document.createElement("div")

                            const nombreOfertaUI = document.createElement("div")
                            nombreOfertaUI.classList.add("negrita")
                            nombreOfertaUI.textContent = nombreOferta
                            contenedorGlobal.appendChild(nombreOfertaUI)

                            const estadoTitulo = document.createElement("div")
                            estadoTitulo.textContent = "Estado de la oferta"
                            contenedorGlobal.appendChild(estadoTitulo)


                            const estadoUI = document.createElement("div")
                            estadoUI.classList.add("negrita")
                            estadoUI.textContent = estadoUI_(estadoIDV)
                            contenedorGlobal.appendChild(estadoUI)
                            contenedorOferta.appendChild(contenedorGlobal)

                            const contendorBotones = document.createElement("div")
                            contendorBotones.classList.add(
                                "flexHorizontal",
                                "gap6",
                            )

                            const botonInsertar = document.createElement("div")
                            botonInsertar.classList.add(
                                "borderRadius8",
                                "backgroundGrey1",
                                "comportamientoBoton",
                                "padding8"
                            )
                            botonInsertar.textContent = "Insertar descuento en la reserva"
                            botonInsertar.addEventListener("click", () => {
                                this.confirmarInsertar({
                                    simulacionUID,
                                    ofertaUID,
                                    instanciaUID_insertarDescuentosUI,
                                    instanciaUID_contenedorFinanciero
                                })

                            })
                            contendorBotones.appendChild(botonInsertar)

                            const botonVerOferta = document.createElement("a")
                            botonVerOferta.classList.add(
                                "borderRadius8",
                                "backgroundGrey1",
                                "comportamientoBoton",
                                "padding8",
                                "limpiezaBotonA"
                            )
                            botonVerOferta.textContent = "Ir a la oferta"
                            botonVerOferta.setAttribute("href", "/administracion/gestion_de_ofertas/oferta:" + ofertaUID)
                            botonVerOferta.setAttribute("vista", "/administracion/gestion_de_ofertas/oferta:" + ofertaUID)
                            botonVerOferta.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                            contendorBotones.appendChild(botonVerOferta)


                            contenedorOferta.appendChild(contendorBotones)

                            contenedorOfertas.appendChild(contenedorOferta)
                        })
                        constructor.appendChild(this.botonCancelar())

                    }

                },
                botonCancelar: () => {
                    const botonCancelar = document.createElement("div")
                    botonCancelar.classList.add("boton")
                    botonCancelar.setAttribute("boton", "cancelar")
                    botonCancelar.textContent = "Cerrar y volver a la reserva"
                    botonCancelar.addEventListener("click", () => {
                        return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    })
                    return botonCancelar
                },
                confirmarInsertar: async function (data) {
                    const simulacionUID = data.simulacionUID
                    const ofertaUID = String(data.ofertaUID)
                    const instanciaUID_insertarDescuentosUI = data.instanciaUID_insertarDescuentosUI
                    const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero

                    const ui = document.querySelector(`[instanciaUID="${instanciaUID_insertarDescuentosUI}"]`)
                    const contenedor = ui.querySelector("[componente=contenedor]")
                    contenedor.innerHTML = null

                    const spinner = casaVitini.ui.componentes.spinner({
                        mensaje: "Insertando oferta en la reserva..."
                    })
                    contenedor.appendChild(spinner)

                    const transaccion = {
                        zona: "administracion/simuladorDePrecios/descuentos/insertarDescuentoPorAdministrador",
                        simulacionUID,
                        ofertaUID
                    }
                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    const uiRenderizada = document.querySelector(`[simulacionUID="${simulacionUID}"]`)
                    if (!uiRenderizada) { return }

                    if (respuestaServidor?.error) {
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                    }
                    if (respuestaServidor?.ok) {
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        casaVitini.view.componentes.postProcesamientoTransaccion(respuestaServidor)

                    }

                },
            },
            insertarOfertasCompatibles: {
                ui: async function (data) {
                    const main = document.querySelector("main")
                    const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                    const simulacionUID = main.querySelector("[simulacionUID]").getAttribute("simulacionUID")
                    const instanciaUID_insertarDescuentosUI = ui.getAttribute("instanciaUID")
                    const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                    main.appendChild(ui)
                    const constructor = ui.querySelector("[componente=contenedor]")
                    const spinner = casaVitini.ui.componentes.spinner({
                        mensaje: "Obteniendo ofertas compatibles con la oferta...",
                        textoBoton: "Cancelar"
                    })
                    constructor.appendChild(spinner)

                    const transaccion = {
                        zona: "administracion/simuladorDePrecios/descuentos/obtenerDescuentosCompatiblesConLaSimulacion",
                        simulacionUID
                    }

                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    const uiRenderizada = document.querySelectorAll(`[instanciaUID="${instanciaUID_insertarDescuentosUI}"]`)
                    if (!uiRenderizada) { return }
                    if (respuestaServidor?.error) {
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                    }
                    if (respuestaServidor?.ok) {


                        const ofertas = respuestaServidor.ofertasCompatibles


                        spinner.remove()
                        if (ofertas.length > 0) {
                            constructor.appendChild(this.botonCancelar())

                        } else {
                            const info = document.createElement("p")
                            info.classList.add(
                                "textoCentrado"
                            )
                            info.textContent = "No hay ofertas compatibles con esta reserva. Si quieres insertar ofertas no compatibles de manera arbitraria, a esta reserva usa el botón de insertar descuentos."
                            constructor.appendChild(info)

                        }
                        const contenedorOfertas = document.createElement("div")
                        contenedorOfertas.classList.add(
                            "maxWidth1280px",
                            "width100",
                            "flexVertical",
                            "gap6",
                        )
                        constructor.appendChild(contenedorOfertas)

                        const estadoUI_ = (estadoIDV) => {

                            if (estadoIDV === "activado") {
                                return "Activada"
                            } else if (estadoIDV === "desactivado") {
                                return "Desactivada"
                            }
                        }

                        ofertas.forEach((contenedorOferta) => {
                            const detalles = contenedorOferta.oferta
                            const nombreOferta = detalles.nombreOferta
                            const ofertaUID = detalles.ofertaUID
                            const fechaInicio = detalles.fechaInicio
                            const fechaFinal = detalles.fechaFinal
                            const estadoIDV = detalles.estadoIDV
                            const zonaIDV = detalles.zonaIDV

                            const contenedorOfertaUI = document.createElement("div")
                            contenedorOfertaUI.setAttribute("ofertaUID", ofertaUID)
                            contenedorOfertaUI.classList.add(
                                "borderRadius12",
                                "width100",
                                "flexVertical",
                                "backgroundGrey1",
                                "padding6",
                                "gap6"
                            )

                            const contenedorGlobal = document.createElement("div")

                            const nombreOfertaUI = document.createElement("div")
                            nombreOfertaUI.classList.add("negrita")
                            nombreOfertaUI.textContent = nombreOferta
                            contenedorGlobal.appendChild(nombreOfertaUI)

                            const estadoTitulo = document.createElement("div")
                            estadoTitulo.textContent = "Estado de la oferta"
                            contenedorGlobal.appendChild(estadoTitulo)

                            const estadoUI = document.createElement("div")
                            estadoUI.classList.add("negrita")
                            estadoUI.textContent = estadoUI_(estadoIDV)
                            contenedorGlobal.appendChild(estadoUI)
                            contenedorOfertaUI.appendChild(contenedorGlobal)

                            const contendorBotones = document.createElement("div")
                            contendorBotones.classList.add(
                                "flexHorizontal",
                                "gap6",
                            )

                            const botonInsertar = document.createElement("div")
                            botonInsertar.classList.add(
                                "borderRadius8",
                                "backgroundGrey1",
                                "comportamientoBoton",
                                "padding8"
                            )

                            botonInsertar.textContent = "Insertar descuento en la reserva"
                            botonInsertar.addEventListener("click", () => {
                                this.confirmarInsertarCompatible({
                                    simulacionUID,
                                    ofertaUID,
                                    instanciaUID_insertarDescuentosUI,
                                    instanciaUID_contenedorFinanciero
                                })
                            })
                            contendorBotones.appendChild(botonInsertar)

                            const botonVerOferta = document.createElement("a")
                            botonVerOferta.classList.add(
                                "borderRadius8",
                                "backgroundGrey1",
                                "comportamientoBoton",
                                "padding8",
                                "limpiezaBotonA"
                            )
                            botonVerOferta.textContent = "Ir a la oferta"
                            botonVerOferta.setAttribute("href", "/administracion/gestion_de_ofertas/oferta:" + ofertaUID)
                            botonVerOferta.setAttribute("vista", "/administracion/gestion_de_ofertas/oferta:" + ofertaUID)
                            botonVerOferta.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                            contendorBotones.appendChild(botonVerOferta)

                            contenedorOfertaUI.appendChild(contendorBotones)

                            contenedorOfertas.appendChild(contenedorOfertaUI)
                        })
                        constructor.appendChild(this.botonCancelar())

                    }

                },
                botonCancelar: () => {
                    const botonCancelar = document.createElement("div")
                    botonCancelar.classList.add("boton")
                    botonCancelar.setAttribute("boton", "cancelar")
                    botonCancelar.textContent = "Cerrar y volver a la reserva"
                    botonCancelar.addEventListener("click", () => {
                        return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    })
                    return botonCancelar
                },
                confirmarInsertarCompatible: async function (data) {
                    const simulacionUID = data.simulacionUID
                    const ofertaUID = String(data.ofertaUID)
                    const instanciaUID_insertarDescuentosUI = data.instanciaUID_insertarDescuentosUI
                    const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero

                    const ui = document.querySelector(`[instanciaUID="${instanciaUID_insertarDescuentosUI}"]`)
                    const contenedor = ui.querySelector("[componente=contenedor]")
                    contenedor.innerHTML = null

                    const spinner = casaVitini.ui.componentes.spinner({
                        mensaje: "Insertando oferta en la reserva..."
                    })
                    contenedor.appendChild(spinner)

                    const transaccion = {
                        zona: "administracion/simuladorDePrecios/descuentos/insertarDescuentoPorCompatible",
                        simulacionUID,
                        ofertaUID
                    }

                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    const uiRenderizada = document.querySelector(`[simulacionUID="${simulacionUID}"]`)
                    if (!uiRenderizada) { return }

                    if (respuestaServidor?.error) {
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                    }
                    if (respuestaServidor?.ok) {
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        casaVitini.view.componentes.postProcesamientoTransaccion(respuestaServidor)

                    }

                },

            },
            sobreControlPrecios: {
                botonAlterarPrecio: () => {
                    const botonDeslegarOpciones = document.createElement("div")
                    botonDeslegarOpciones.classList.add(
                        "padding6",
                        "botonV1",
                        "comportamientoBoton"
                    )
                    botonDeslegarOpciones.textContent = "Alterar precio"
                    return botonDeslegarOpciones
                },
                nocheUI: async function (data) {
                    const fechaNoche = data.fechaNoche
                    const apartamentoIDV = data.apartamentoIDV
                    const main = document.querySelector("main")
                    const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                    const simulacionUID = main.querySelector("[simulacionUID]").getAttribute("simulacionUID")
                    const instanciaUID_sobreControlUI = ui.getAttribute("instanciaUID")
                    const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                    main.appendChild(ui)
                    const contenedor = ui.querySelector("[componente=contenedor]")
                    const spinner = casaVitini.ui.componentes.spinner({
                        mensaje: "Obteniendo detalles de la noche...",
                        textoBoton: "Cancelar"
                    })
                    contenedor.appendChild(spinner)

                    const transaccion = {
                        zona: "administracion/simuladorDePrecios/sobreControlPrecios/obtenerDetallesSobreControlNoche",
                        simulacionUID,
                        apartamentoIDV: apartamentoIDV,
                        fechaNoche: fechaNoche
                    }

                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    const uiRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_sobreControlUI}"]`)

                    if (!uiRenderizada) { return }
                    if (respuestaServidor?.error) {
                        uiRenderizada?.remove()
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                    }
                    if (respuestaServidor.ok) {
                        contenedor.innerHTML = null

                        const data = respuestaServidor.ok
                        const instantanea = data.instantaneaNetoApartamento
                        const apartamentoUI = instantanea.apartamentoUI
                        const precioNetoApartamento = instantanea.precioNetoApartamento

                        const sobreControl = data?.sobreControl
                        const detallesSobreControl = sobreControl.detallesSobreControl || {}
                        const operacion = detallesSobreControl?.operacion
                        const valorSobreControl = detallesSobreControl?.valor || "0.00"

                        const titulo = document.createElement("div")
                        titulo.classList.add(
                            "tituloGris",
                            "textoCentrado"
                        )
                        titulo.textContent = `Detalles del ${apartamentoUI} en la noche de ${fechaNoche}`
                        contenedor.appendChild(titulo)

                        const contenedorValorOrigen = document.createElement("div")
                        contenedorValorOrigen.classList.add(
                            "flexVertical",
                            "backgroundGrey1",
                            "padding16",
                            "borderRadius16"
                        )
                        contenedor.appendChild(contenedorValorOrigen)

                        const tituloValorOrigen = document.createElement("div")
                        tituloValorOrigen.textContent = "Valor origen"
                        contenedorValorOrigen.appendChild(tituloValorOrigen)

                        const datoValorOrigen = document.createElement("div")
                        datoValorOrigen.classList.add(
                            "negrita"
                        )
                        datoValorOrigen.textContent = precioNetoApartamento
                        contenedorValorOrigen.appendChild(datoValorOrigen)

                        const selectorTipoSobreControl = document.createElement("select")
                        selectorTipoSobreControl.classList.add(
                            "botonV1BlancoIzquierda_campo"
                        )
                        selectorTipoSobreControl.setAttribute("campo", "tipoOperacion")

                        const tituloSelector = document.createElement("option");
                        if (!operacion) {
                            tituloSelector.selected = true;
                        }
                        tituloSelector.disabled = true;
                        tituloSelector.text = "Seleccionar el tipo de sobre control";
                        selectorTipoSobreControl.appendChild(tituloSelector);

                        const opciones = [
                            { value: "aumentarPorPorcentaje", text: "Aumentar por porcentaje" },
                            { value: "reducirPorPorcentaje", text: "Reducir por porcentaje" },
                            { value: "aumentarPorCantidadFija", text: "Aumentar por cantidad fija" },
                            { value: "reducirPorCantidadFila", text: "Reducir por cantidad fila" },
                            { value: "establecerCantidad", text: "Establecer cantidad" }
                        ]
                        for (const opcionData of opciones) {
                            const value = opcionData.value
                            const text = opcionData.text
                            const opcion = document.createElement("option");
                            opcion.value = opcionData.value;
                            opcion.text = opcionData.text;
                            if (operacion === value) {
                                opcion.selected = true;
                            }
                            selectorTipoSobreControl.appendChild(opcion);
                        }
                        contenedor.appendChild(selectorTipoSobreControl)
                        const campoValor = document.createElement("input")
                        campoValor.classList.add(
                            "botonV1BlancoIzquierda_campo"
                        )
                        campoValor.setAttribute("campo", "valor")
                        campoValor.placeholder = "Escribe la cantidad con dos decimales separados por punto, por ejemplo 0.00"
                        campoValor.value = valorSobreControl

                        contenedor.appendChild(campoValor)


                        if (Object.keys(detallesSobreControl).length > 0) {
                            const boton = document.createElement("div")
                            boton.classList.add("boton")
                            boton.textContent = "Actualizar sobre control de precio"
                            boton.addEventListener("click", () => {
                                this.confirmar({
                                    instanciaUID_sobreControlUI,
                                    instanciaUID_contenedorFinanciero,
                                    simulacionUID,
                                    apartamentoIDV,
                                    tipoOperacion: selectorTipoSobreControl.value,
                                    fechaNoche,
                                    valorSobreControl: campoValor.value
                                })
                            })
                            contenedor.appendChild(boton)
                            const botonEliminar = document.createElement("div")
                            botonEliminar.classList.add("boton")
                            botonEliminar.textContent = "Eliminar sobre control de precio"
                            botonEliminar.addEventListener("click", () => {
                                this.eliminarSobreControl({
                                    instanciaUID_sobreControlUI,
                                    instanciaUID_contenedorFinanciero,
                                    simulacionUID,
                                    apartamentoIDV,
                                    fechaNoche
                                })
                            })
                            contenedor.appendChild(botonEliminar)
                        } else {
                            const boton = document.createElement("div")
                            boton.classList.add("boton")
                            boton.textContent = "Crear sobre control de precio"
                            boton.addEventListener("click", () => {
                                this.confirmar({
                                    instanciaUID_sobreControlUI,
                                    instanciaUID_contenedorFinanciero,
                                    simulacionUID,
                                    apartamentoIDV,
                                    tipoOperacion: selectorTipoSobreControl.value,
                                    fechaNoche,
                                    valorSobreControl: campoValor.value
                                })
                            })
                            contenedor.appendChild(boton)
                        }

                        const botonCancelar = document.createElement("div")
                        botonCancelar.classList.add("boton")
                        botonCancelar.textContent = "Cancelar y volver al desglose por noche."
                        botonCancelar.addEventListener("click", () => {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        })
                        contenedor.appendChild(botonCancelar)
                    }
                },
                confirmar: async function (data) {
                    const instanciaUID_sobreControlUI = data.instanciaUID_sobreControlUI
                    const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                    const simulacionUID = data.simulacionUID
                    const apartamentoIDV = data.apartamentoIDV
                    const tipoOperacion = data.tipoOperacion
                    const fechaNoche = data.fechaNoche
                    const valorSobreControl = data.valorSobreControl
                    const transaccion = {
                        zona: "administracion/simuladorDePrecios/sobreControlPrecios/actualizarSobreControlNoche",
                        simulacionUID,
                        apartamentoIDV,
                        fechaNoche,
                        tipoOperacion,
                        valorSobreControl
                    }
                    const uiRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_sobreControlUI}"]`)
                    const contenedor = uiRenderizada.querySelector("[componente=contenedor]")


                    const instanciaPantallaCarga = casaVitini.utilidades.codigoFechaInstancia()
                    casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
                        mensaje: "Aplicando sobrecontrol de precio",
                        textoBoton: "ocultar",
                        instanciaUID: instanciaPantallaCarga
                    })

                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    const instanciaPantallaCargaUI = document.querySelector(`[instanciaUID="${instanciaPantallaCarga}"]`)
                    instanciaPantallaCargaUI?.remove()

                    const uiContenedorFinanciero = document.querySelector(`[instanciaUID="${instanciaUID_contenedorFinanciero}"]`)


                    if (respuestaServidor?.error) {
                        return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                    }
                    if (respuestaServidor.ok) {

                        const sobreControlUI = document.querySelector(`[instanciaUID="${instanciaUID_sobreControlUI}"]`)
                        if (sobreControlUI) {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        }

                        const selectorDesgloseEnPantalla = document.querySelector(`[simulacionUID="${simulacionUID}"]`)

                        if (!selectorDesgloseEnPantalla) {
                            return
                        }

                        casaVitini.view.componentes.postProcesamientoTransaccion(respuestaServidor)
                    }
                },
                eliminarSobreControl: async function (data) {
                    const instanciaUID_sobreControlUI = data.instanciaUID_sobreControlUI
                    const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                    const simulacionUID = data.simulacionUID
                    const apartamentoIDV = data.apartamentoIDV
                    const fechaNoche = data.fechaNoche
                    const transaccion = {
                        zona: "administracion/simuladorDePrecios/sobreControlPrecios/eliminarSobreControlNoche",
                        simulacionUID,
                        apartamentoIDV,
                        fechaNoche
                    }
                    const uiRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_sobreControlUI}"]`)
                    const instanciaPantallaCarga = casaVitini.utilidades.codigoFechaInstancia()
                    casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
                        mensaje: "Eliminado sobrecontrol de precio",
                        textoBoton: "ocultar",
                        instanciaUID: instanciaPantallaCarga
                    })

                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    const instanciaPantallaCargaUI = document.querySelector(`[instanciaUID="${instanciaPantallaCarga}"]`)
                    instanciaPantallaCargaUI?.remove()

                    if (respuestaServidor?.error) {
                        return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                    }
                    if (respuestaServidor.ok) {
                        const sobreControlUI = document.querySelector(`[instanciaUID="${instanciaUID_sobreControlUI}"]`)
                        if (sobreControlUI) {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        }

                        const selectorDesgloseEnPantalla = document.querySelector(`[simulacionUID="${simulacionUID}"]`)
                        if (!selectorDesgloseEnPantalla) {
                            return
                        }
                        casaVitini.view.componentes.postProcesamientoTransaccion(respuestaServidor)

                    }
                }

            },
            eliminarOfertaEnSimulacion: {
                ui: async function (data) {

                    const nombreOferta = data.nombreOferta
                    const ofertaUID = data.ofertaUID
                    const posicion = data.posicion
                    const simulacionUID = document.querySelector("[simulacionUID]").getAttribute("simulacionUID")
                    const origen = data.origen

                    const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                    const instanciaUID = pantallaInmersiva.getAttribute("instanciaUID")
                    const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

                    const titulo = constructor.querySelector("[componente=titulo]")
                    titulo.classList.add(
                        "negrita"
                    )
                    titulo.textContent = nombreOferta
                    const mensaje = constructor.querySelector("[componente=mensajeUI]")
                    mensaje.textContent = `Confirmas o no la eliminación de la oferta de la reserva, ¿Estas de acuerdo?`

                    const botonAceptar = constructor.querySelector("[boton=aceptar]")
                    botonAceptar.textContent = "Confirmar la eliminación de la oferta de esta reserva"
                    botonAceptar.addEventListener("click", () => {
                        this.confirmar({
                            simulacionUID,
                            ofertaUID,
                            posicion,
                            origen,
                            instanciaUID
                        })
                    })
                    const botonCancelar = constructor.querySelector("[boton=cancelar]")
                    botonCancelar.textContent = "Cancelar y volver a la reserva"
                    document.querySelector("main").appendChild(pantallaInmersiva)

                },
                confirmar: async function (data) {

                    const ofertaUID = data.ofertaUID
                    const posicion = data.posicion
                    const simulacionUID = data.simulacionUID
                    const origen = data.origen

                    const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                    const mensaje = "Elimiando oferta de la reserva..."
                    const datosPantallaSuperpuesta = {
                        instanciaUID: instanciaUID,
                        mensaje: mensaje
                    }
                    casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                    const transaccion = {
                        zona: "administracion/simuladorDePrecios/descuentos/eliminarDescuentoEnSimulacion",
                        simulacionUID: String(simulacionUID),
                        ofertaUID: String(ofertaUID),
                        origen,
                        posicion: String(posicion)
                    }

                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                    instanciaRenderizada.remove()

                    if (respuestaServidor?.error) {
                        return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                    }
                    if (respuestaServidor?.ok) {

                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        casaVitini.view.componentes.postProcesamientoTransaccion(respuestaServidor)

                    }
                }

            },
            actualizarEstadoAutorizacion: async function (data) {

                const ofertaUID = data.ofertaUID
                const simulacionUID = document.querySelector("[simulacionUID]").getAttribute("simulacionUID")
                const e = data.e
                const area = e.target.closest("[ofertaUID][posicion]")
                const autorizacionUI = area.querySelector("[dato=autorizacion]")
                const estadoActualData = area.querySelector("[estadoActual]")
                const estadoActual = estadoActualData.getAttribute("estadoActual")

                const transaccion = {
                    zona: "administracion/simuladorDePrecios/descuentos/actualizarAutorizacionDescuentoCompatible",
                    simulacionUID: String(simulacionUID),
                    ofertaUID: String(ofertaUID),
                }

                if (estadoActual === "aceptada") {
                    autorizacionUI.textContent = "Rechazando..."
                    transaccion.nuevaAutorizacion = "rechazada"
                } else if (estadoActual === "rechazada") {
                    autorizacionUI.textContent = "Aceptando..."
                    transaccion.nuevaAutorizacion = "aceptada"
                }

                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                if (respuestaServidor?.error) {
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    const estadoAutorizado = respuestaServidor.autorizacion
                    estadoActualData.setAttribute("estadoActual", estadoAutorizado)
                    if (estadoAutorizado === "aceptada") {
                        autorizacionUI.textContent = "Aceptada"
                        estadoActualData.textContent = "Rechazar oferta"
                    } else if (estadoAutorizado === "rechazada") {
                        autorizacionUI.textContent = "Rechazada"
                        estadoActualData.textContent = "Aceptar oferta"
                    }
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    casaVitini.view.componentes.postProcesamientoTransaccion(respuestaServidor)

                }
            },
            insertarImpuesto: {
                ui: async function (data) {
                    const main = document.querySelector("main")
                    const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                    const simulacionUID = main.querySelector("[simulacionUID]").getAttribute("simulacionUID")
                    const instanciaUID_insertarImpuestoUI = ui.getAttribute("instanciaUID")
                    const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                    main.appendChild(ui)
                    const constructor = ui.querySelector("[componente=contenedor]")
                    const spinner = casaVitini.ui.componentes.spinner({
                        mensaje: "Obteniendo impuestos...",
                        textoBoton: "Cancelar"
                    })
                    constructor.appendChild(spinner)

                    const transaccion = {
                        zona: "administracion/impuestos/listarTodosLosImpuestos"
                    }

                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    const uiRenderizada = document.querySelectorAll(`[instanciaUID="${instanciaUID_insertarImpuestoUI}"]`)
                    if (!uiRenderizada) { return }
                    if (respuestaServidor?.error) {
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                    }
                    if (respuestaServidor?.ok) {
                        spinner.remove()
                        constructor.appendChild(this.botonCancelar())

                        const impuestos = respuestaServidor.impuestos

                        const contenedorOfertas = document.createElement("div")
                        contenedorOfertas.classList.add(
                            "maxWidth1280px",
                            "width100",
                            "flexVertical",
                            "gap6",
                        )
                        constructor.appendChild(contenedorOfertas)
                        const estadoUI_ = (estadoIDV) => {

                            if (estadoIDV === "activado") {
                                return "Activada"
                            } else if (estadoIDV === "desactivado") {
                                return "Desactivada"
                            }

                        }

                        impuestos.forEach((impuesto) => {
                            const impuestoUID = impuesto.impuestoUID
                            const nombre = impuesto.nombre
                            const tipoImpositivo = impuesto.tipoImpositivo
                            const tipoValorIDV = impuesto.tipoValorIDV
                            const entidadIDV = impuesto.entidadIDV
                            const estadoIDV = impuesto.estadoIDV


                            const contenedorOferta = document.createElement("div")
                            contenedorOferta.setAttribute("impuestoUID", impuestoUID)
                            contenedorOferta.classList.add(
                                "borderRadius12",
                                "width100",
                                "flexVertical",
                                "backgroundGrey1",
                                "padding6",
                                "gap6"
                            )

                            const contenedorGlobal = document.createElement("div")

                            const nombreOfertaUI = document.createElement("div")
                            nombreOfertaUI.classList.add("negrita")
                            nombreOfertaUI.textContent = nombre
                            contenedorGlobal.appendChild(nombreOfertaUI)

                            const estadoTitulo = document.createElement("div")
                            estadoTitulo.textContent = "Estado del impuesto"
                            contenedorGlobal.appendChild(estadoTitulo)


                            const estadoUI = document.createElement("div")
                            estadoUI.classList.add("negrita")
                            estadoUI.textContent = estadoUI_(estadoIDV)
                            contenedorGlobal.appendChild(estadoUI)
                            contenedorOferta.appendChild(contenedorGlobal)

                            const contendorBotones = document.createElement("div")
                            contendorBotones.classList.add(
                                "flexHorizontal",
                                "gap6",
                            )

                            const botonInsertar = document.createElement("div")
                            botonInsertar.classList.add(
                                "borderRadius8",
                                "backgroundGrey1",
                                "comportamientoBoton",
                                "padding8"
                            )
                            botonInsertar.textContent = "Insertar impuesto en la reserva"
                            botonInsertar.addEventListener("click", () => {
                                this.confirmarInsertar({
                                    simulacionUID,
                                    impuestoUID,
                                    instanciaUID_insertarImpuestoUI,
                                    instanciaUID_contenedorFinanciero
                                })
                            })
                            contendorBotones.appendChild(botonInsertar)

                            const botonVerOferta = document.createElement("a")
                            botonVerOferta.classList.add(
                                "borderRadius8",
                                "backgroundGrey1",
                                "comportamientoBoton",
                                "padding8",
                                "limpiezaBotonA"
                            )
                            botonVerOferta.textContent = "Ir al impuesto"
                            botonVerOferta.setAttribute("href", "/administracion/impuestos/" + impuestoUID)
                            botonVerOferta.setAttribute("vista", "/administracion/impuestos/" + impuestoUID)
                            botonVerOferta.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                            contendorBotones.appendChild(botonVerOferta)


                            contenedorOferta.appendChild(contendorBotones)

                            contenedorOfertas.appendChild(contenedorOferta)
                        })
                        constructor.appendChild(this.botonCancelar())

                    }

                },
                botonCancelar: () => {
                    const botonCancelar = document.createElement("div")
                    botonCancelar.classList.add("boton")
                    botonCancelar.setAttribute("boton", "cancelar")
                    botonCancelar.textContent = "Cerrar y volver a la reserva"
                    botonCancelar.addEventListener("click", () => {
                        return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    })
                    return botonCancelar
                },
                confirmarInsertar: async function (data) {
                    const simulacionUID = data.simulacionUID
                    const impuestoUID = String(data.impuestoUID)
                    const instanciaUID_insertarImpuestoUI = data.instanciaUID_insertarImpuestoUI
                    const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero

                    const ui = document.querySelector(`[instanciaUID="${instanciaUID_insertarImpuestoUI}"]`)
                    const contenedor = ui.querySelector("[componente=contenedor]")
                    contenedor.innerHTML = null

                    const spinner = casaVitini.ui.componentes.spinner({
                        mensaje: "Insertando oferta en la reserva..."
                    })
                    contenedor.appendChild(spinner)

                    const transaccion = {
                        zona: "administracion/simuladorDePrecios/impuestos/insertarImpuestoEnSimulacion",
                        impuestoUID,
                        simulacionUID
                    }
                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    const uiRenderizada = document.querySelector(`[simulacionUID="${simulacionUID}"]`)
                    if (!uiRenderizada) { return }

                    if (respuestaServidor?.error) {
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                    }
                    if (respuestaServidor?.ok) {
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        casaVitini.view.componentes.postProcesamientoTransaccion(respuestaServidor)

                    }
                },

            },
            eliminarImpuesto: {
                ui: async function (data) {
                    const nombreImpuesto = data.nombreImpuesto
                    const impuestoUID = data.impuestoUID
                    const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                    const simulacionUID = document.querySelector("main").querySelector("[simulacionUID]").getAttribute("simulacionUID")

                    const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                    pantallaInmersiva.style.justifyContent = "center"
                    const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                    const instanciaUID_eliminarImpuestoUI = pantallaInmersiva.getAttribute("instanciaUID")


                    const titulo = constructor.querySelector("[componente=titulo]")
                    titulo.textContent = `Confirmar eliminar impuesto ${nombreImpuesto} de la reserva`
                    const mensaje = constructor.querySelector("[componente=mensajeUI]")
                    mensaje.textContent = "Detalles del apartamento"

                    const botonAceptar = constructor.querySelector("[boton=aceptar]")
                    botonAceptar.textContent = "Comfirmar la eliminacion"
                    botonAceptar.addEventListener("click", () => {
                        this.confirmarEliminar({
                            impuestoUID,
                            simulacionUID,
                            instanciaUID_contenedorFinanciero,
                            instanciaUID_eliminarImpuestoUI
                        })
                    })
                    const botonCancelar = constructor.querySelector("[boton=cancelar]")
                    botonCancelar.textContent = "Cancelar y volver"

                    document.querySelector("main").appendChild(pantallaInmersiva)

                },
                confirmarEliminar: async function (data) {
                    const simulacionUID = data.simulacionUID
                    const impuestoUID = String(data.impuestoUID)
                    const instanciaUID_eliminarImpuestoUI = data.instanciaUID_eliminarImpuestoUI
                    const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero



                    const ui = document.querySelector(`[instanciaUID="${instanciaUID_eliminarImpuestoUI}"]`)
                    const contenedor = ui.querySelector("[componente=constructor]")
                    contenedor.innerHTML = null

                    const spinner = casaVitini.ui.componentes.spinner({
                        mensaje: "Eliminado impuesto en la reserva..."
                    })
                    contenedor.appendChild(spinner)

                    const transaccion = {
                        zona: "administracion/simuladorDePrecios/impuestos/eliminarImpuestoEnSimulacion",
                        simulacionUID,
                        impuestoUID
                    }

                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    const uiRenderizada = document.querySelector(`[simulacionUID="${simulacionUID}"]`)
                    if (!uiRenderizada) { return }

                    if (respuestaServidor?.error) {
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                    }
                    if (respuestaServidor?.ok) {
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        casaVitini.view.componentes.postProcesamientoTransaccion(respuestaServidor)

                    }

                },

            },
            crearImpuestoAdHoc: {
                ui: async function (data) {
                    const nombreImpuesto = data.nombreImpuesto
                    const impuestoUID = data.impuestoUID
                    const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                    const simulacionUID = document.querySelector("main").querySelector("[simulacionUID]").getAttribute("simulacionUID")

                    const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                    const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                    const instanciaUID_eliminarImpuestoUI = pantallaInmersiva.getAttribute("instanciaUID")
                    const contenedor = pantallaInmersiva.querySelector("[componente=contenedor]")

                    const titulo = constructor.querySelector("[componente=titulo]")
                    titulo.textContent = `Crear impuesto dedicado solo para esta reserva`
                    const mensaje = constructor.querySelector("[componente=mensajeUI]")
                    mensaje.textContent = "Impuesto dedicado solo para esta reserva. Este impuesto solo existirá en esta reserva. Si necesitas crear un impuesto que quieras usar para insertar en reservas, pero que no se aplique, crea un impuesto en el hub de impuestos y mantenlo desactivado."

                    const opcionesEntidad = [
                        {
                            entidadIDV: "reserva",
                            entidadUI: "Reserva"
                        },
                        {
                            entidadIDV: "servicio",
                            entidadUI: "Servicios"
                        },
                        {
                            entidadIDV: "global",
                            entidadUI: "Global"
                        },

                    ]

                    const contenedorFormulario = document.createElement("div")
                    contenedorFormulario.classList.add(
                        "flexVertical",
                        "gap10"
                    )
                    contenedor.appendChild(contenedorFormulario)


                    const campoCraerNuevoImpuesto = document.createElement("input")
                    campoCraerNuevoImpuesto.classList.add(campoCraerNuevoImpuesto.classList.add("botonV1BlancoIzquierda_campo")

                    )
                    campoCraerNuevoImpuesto.setAttribute("comNuevoImpuesto", "nombre")
                    campoCraerNuevoImpuesto.placeholder = "Escribo el nombre del nuevo impuesto"
                    contenedorFormulario.appendChild(campoCraerNuevoImpuesto)

                    const campoTipoImpositivo = document.createElement("input")
                    campoTipoImpositivo.classList.add("botonV1BlancoIzquierda_campo"
                    )
                    campoTipoImpositivo.setAttribute("comNuevoImpuesto", "tipoImpositivo")
                    campoTipoImpositivo.placeholder = "0.00"
                    contenedorFormulario.appendChild(campoTipoImpositivo)

                    const contenedorOpciones = document.createElement("select")
                    contenedorOpciones.classList.add("botonV1BlancoIzquierda_campo"
                    )
                    contenedorOpciones.setAttribute("comNuevoImpuesto", "tipoValor")
                    const tipoValorLista = [
                        {
                            tipoValorIDV: "",
                            tipoValorUI: "Selecciona el tipo de impuesto"
                        },
                        {
                            tipoValorIDV: "porcentaje",
                            tipoValorUI: "Porcentaje"
                        },
                        {
                            tipoValorIDV: "tasa",
                            tipoValorUI: "Tasa"
                        },

                    ]
                    tipoValorLista.forEach((contenedorTipoValor) => {
                        const tipoValorIDV = contenedorTipoValor.tipoValorIDV
                        const tipoValorUI = contenedorTipoValor.tipoValorUI
                        const opcion = document.createElement("option");
                        if (!tipoValorIDV) {
                            opcion.selected = true;
                            opcion.disabled = true;

                        }
                        opcion.value = tipoValorIDV;
                        opcion.text = tipoValorUI;
                        opcion.setAttribute("opcion", tipoValorIDV)
                        contenedorOpciones.add(opcion);
                    })
                    contenedorFormulario.appendChild(contenedorOpciones)


                    const selectorTipoEntidad = document.createElement("select")
                    contenedorOpciones.setAttribute("comNuevoImpuesto", "entidadIDV")

                    selectorTipoEntidad.classList.add("botonV1BlancoIzquierda_campo")
                    contenedorFormulario.appendChild(selectorTipoEntidad)


                    const tiopEntidades = document.createElement("option")
                    tiopEntidades.selected = "true"
                    tiopEntidades.disabled = "true"
                    tiopEntidades.value = ""
                    tiopEntidades.text = "Selecciona el tipo de entidad"
                    selectorTipoEntidad.appendChild(tiopEntidades)

                    opcionesEntidad.forEach((entidad) => {
                        const entidadIDV = entidad.entidadIDV
                        const entidadUI = entidad.entidadUI
                        const opcion = document.createElement("option");
                        opcion.value = entidadIDV;
                        opcion.text = entidadUI;
                        opcion.setAttribute("opcion", entidadIDV)
                        selectorTipoEntidad.add(opcion);
                    })




                    const botonAceptar = constructor.querySelector("[boton=aceptar]")
                    botonAceptar.textContent = "Crear impuesto dedicado para esta reserva"
                    botonAceptar.addEventListener("click", () => {
                        this.confirmarCrearImpuestoAdHoc({
                            simulacionUID,
                            instanciaUID_contenedorFinanciero,
                            instanciaUID_eliminarImpuestoUI,
                            nombre: campoCraerNuevoImpuesto.value,
                            tipoImpositivo: campoTipoImpositivo.value,
                            tipoValorIDV: contenedorOpciones.value,
                            entidadIDV: selectorTipoEntidad.value

                        })
                    })
                    const botonCancelar = constructor.querySelector("[boton=cancelar]")
                    botonCancelar.textContent = "Cancelar y volver"

                    document.querySelector("main").appendChild(pantallaInmersiva)

                },
                confirmarCrearImpuestoAdHoc: async function (data) {
                    const simulacionUID = data.simulacionUID
                    const nombre = data.nombre
                    const tipoImpositivo = data.tipoImpositivo
                    const tipoValorIDV = data.tipoValorIDV
                    const entidadIDV = data.entidadIDV

                    const instanciaUID_eliminarImpuestoUI = data.instanciaUID_eliminarImpuestoUI
                    const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero

                    const instanciaUID_pantallaDeCargaSuperPuesta = casaVitini.utilidades.codigoFechaInstancia()

                    const datosPantallaSuperpuesta = {
                        instanciaUID: instanciaUID_pantallaDeCargaSuperPuesta,
                        mensaje: "Creando impuesto dedicado e insertandolo en la reserva..."
                    }
                    casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                    const transaccion = {
                        zona: "administracion/simuladorDePrecios/impuestos/insertarImpuestoDedicadoEnSimulacion",
                        simulacionUID,
                        nombre,
                        tipoImpositivo,
                        tipoValorIDV,
                        entidadIDV
                    }

                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    document.querySelector(`[instanciaUID="${instanciaUID_pantallaDeCargaSuperPuesta}"]`)?.remove()

                    const uiRenderizada = document.querySelector(`[simulacionUID="${simulacionUID}"]`)
                    if (!uiRenderizada) { return }

                    if (respuestaServidor?.error) {
                        return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                    }
                    if (respuestaServidor?.ok) {
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        casaVitini.view.componentes.postProcesamientoTransaccion(respuestaServidor)

                    }
                },

            },
            reconstruirDesgloseFinanciero: {
                ui: async function (data) {
                    const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                    const simulacionUID = document.querySelector("main").querySelector("[simulacionUID]").getAttribute("simulacionUID")

                    const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                    const contenedor = pantallaInmersiva.querySelector("[componente=contenedor]")
                    const instanciaUID_reconstrucion = pantallaInmersiva.getAttribute("instanciaUID")
                    document.querySelector("main").appendChild(pantallaInmersiva)



                    const tituloUI = document.createElement("p")
                    tituloUI.classList.add("tituloGris")
                    tituloUI.setAttribute("componente", "titulo")
                    tituloUI.textContent = `Elige el origen de la reconstrucion del desglose financiero de la reserva ${simulacionUID}`
                    contenedor.appendChild(tituloUI)



                    const mensajeUI = document.createElement("div")
                    mensajeUI.classList.add("mensajeUI")
                    mensajeUI.setAttribute("componente", "mensajeUI")
                    mensajeUI.textContent = "Esta operación reconstruye el desglose financiero.Reconstruir desde la instantánea regenera el desglose financiero desde las instantáneas del contenedor financiero de la reserva.Esta operación es útil si no se ha reconstituido por alguna razón el desglose financiero correctamente tras alguna operación."
                    contenedor.appendChild(mensajeUI)


                    const botonDesdeInstantaneas = document.createElement("div")
                    botonDesdeInstantaneas.classList.add("boton")
                    botonDesdeInstantaneas.setAttribute("boton", "aceptar")
                    botonDesdeInstantaneas.textContent = "Reconstruir desde instantaneas"
                    botonDesdeInstantaneas.addEventListener("click", () => {
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        this.desdeInstantaneas.ui({
                            simulacionUID,
                            instanciaUID_contenedorFinanciero,
                            instanciaUID_reconstrucion
                        })
                    })
                    contenedor.appendChild(botonDesdeInstantaneas)


                    const mensajeUI_ = document.createElement("div")
                    mensajeUI_.classList.add("mensajeUI")
                    mensajeUI_.setAttribute("componente", "mensajeUI")
                    mensajeUI_.textContent = "Reconstruir el desglose financiero desde el hub, reconstruirá el desglose financiero actualizando las instantáneas de la reserva desde el hub de precios base, comportamiento de precios y ofertas actualmente configurados.Esta operación es irreversible y puede ser útil cuando necesito actualizar ciertos datos del contenedor financiero de la reserva desde los hubs de origen."
                    contenedor.appendChild(mensajeUI_)

                    const botonDesdeHub = document.createElement("div")
                    botonDesdeHub.classList.add("boton")
                    botonDesdeHub.setAttribute("boton", "aceptar")
                    botonDesdeHub.textContent = "Reconstruir desde el hub"
                    botonDesdeHub.addEventListener("click", () => {
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        this.desdeHub.ui({
                            simulacionUID,
                            instanciaUID_contenedorFinanciero,
                            instanciaUID_reconstrucion
                        })

                    })

                    contenedor.appendChild(botonDesdeHub)

                    const botonCancelar = document.createElement("div")
                    botonCancelar.classList.add("boton")
                    botonCancelar.setAttribute("boton", "cancelar")
                    botonCancelar.textContent = "Cancelar y volver"
                    botonCancelar.addEventListener("click", () => {
                        return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    })
                    contenedor.appendChild(botonCancelar)

                },
                desdeInstantaneas: {
                    ui: async function (data) {
                        const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                        const simulacionUID = document.querySelector("main").querySelector("[simulacionUID]").getAttribute("simulacionUID")

                        const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                        pantallaInmersiva.style.justifyContent = "center"

                        const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                        const instanciaUID_reconstrucion = pantallaInmersiva.getAttribute("instanciaUID")


                        const titulo = constructor.querySelector("[componente=titulo]")
                        titulo.textContent = `Confirmar reconstruir el desglose de la reserva ${simulacionUID} de las instantaneas`
                        const mensaje = constructor.querySelector("[componente=mensajeUI]")
                        mensaje.textContent = "Esta operación reconstruye el desglose financiero.Sí ha ocurrido un algún tipo de error en algún cálculo durante la construcción del desglose financiero, esta opción podría recuperar la interferencia del desglose financiero."

                        const botonAceptar = constructor.querySelector("[boton=aceptar]")
                        botonAceptar.textContent = "Comfirmar la reconstrucción"
                        botonAceptar.addEventListener("click", () => {
                            this.confirmarReconstrucion({
                                simulacionUID,
                                instanciaUID_contenedorFinanciero,
                                instanciaUID_reconstrucion
                            })
                        })
                        const botonCancelar = constructor.querySelector("[boton=cancelar]")
                        botonCancelar.textContent = "Cancelar y volver"

                        document.querySelector("main").appendChild(pantallaInmersiva)

                    },
                    confirmarReconstrucion: async function (data) {
                        const simulacionUID = data.simulacionUID
                        const instanciaUID_reconstrucion = data.instanciaUID_reconstrucion
                        const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero

                        const ui = document.querySelector(`[instanciaUID="${instanciaUID_reconstrucion}"]`)
                        const contenedor = ui.querySelector("[componente=constructor]")
                        contenedor.innerHTML = null

                        const spinner = casaVitini.ui.componentes.spinner({
                            mensaje: "Reconstruyendo el desglose financiero desde las instantáneas de la reserva..."
                        })
                        contenedor.appendChild(spinner)

                        const transaccion = {
                            zona: "administracion/simuladorDePrecios/contenedorFinanciero/reconstruirDesgloseDesdeInstantaneas",
                            simulacionUID
                        }

                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        const uiRenderizada = document.querySelector(`[simulacionUID="${simulacionUID}"]`)
                        if (!uiRenderizada) { return }

                        if (respuestaServidor?.error) {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                        }
                        if (respuestaServidor?.ok) {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            casaVitini.view.componentes.postProcesamientoTransaccion(respuestaServidor)

                        }

                    },
                },
                desdeHub: {
                    ui: async function (data) {
                        const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                        const simulacionUID = document.querySelector("main").querySelector("[simulacionUID]").getAttribute("simulacionUID")

                        const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                        pantallaInmersiva.style.justifyContent = "center"

                        pantallaInmersiva.style.justifyContent = "center"

                        const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                        const instanciaUID_reconstrucion = pantallaInmersiva.getAttribute("instanciaUID")
                        const contenedor = pantallaInmersiva.querySelector("[componente=contenedor]")
                        contenedor.classList.add(
                            "flexVertical"
                        )



                        const titulo = constructor.querySelector("[componente=titulo]")
                        titulo.textContent = `Confirmar reconstruir el desglose de la reserva ${simulacionUID} desde el hub (Operación irreversible)`
                        const mensaje = constructor.querySelector("[componente=mensajeUI]")
                        mensaje.textContent = "Esta operación reconstruye el desglose financiero, actualizando las instantáneas desde el hub de precios base, comportamientos de precio, ofertas e impuestos.Esta operación es irreversible porque sobrescribe los datos actuales de las instantáneas y reconstruye todo el contenedor financiero de la reserva.Para evitar falsos clics, por favor, escribe la palabra, reconstruir, en el campo de texto."

                        const campo = document.createElement("input")
                        campo.placeholder = "Escribe la palabra reconstruir"
                        campo.classList.add(
                            "botonV1BlancoIzquierda_campo"
                        )
                        contenedor.appendChild(campo)
                        const botonAceptar = constructor.querySelector("[boton=aceptar]")
                        botonAceptar.textContent = "Comfirmar la reconstrucción irreversible de todo el contenedor financiero de la reserva"
                        botonAceptar.addEventListener("click", () => {
                            this.confirmarReconstrucion({
                                simulacionUID,
                                instanciaUID_contenedorFinanciero,
                                instanciaUID_reconstrucion,
                                palabra: campo.value
                            })
                        })
                        const botonCancelar = constructor.querySelector("[boton=cancelar]")
                        botonCancelar.textContent = "Cancelar y volver"

                        document.querySelector("main").appendChild(pantallaInmersiva)

                    },
                    confirmarReconstrucion: async function (data) {
                        const simulacionUID = data.simulacionUID
                        const palabra = data.palabra
                        const sobreControl = data.sobreControl

                        const instanciaUID_pantallaDeCargaSuperPuesta = casaVitini.utilidades.codigoFechaInstancia()

                        const datosPantallaSuperpuesta = {
                            instanciaUID: instanciaUID_pantallaDeCargaSuperPuesta,
                            mensaje: "Reconstruyendo todo el contenedor financiero de la reserva desde los hubs..."
                        }
                        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)

                        const transaccion = {
                            zona: "administracion/simuladorDePrecios/contenedorFinanciero/reconstruirDesgloseDesdeHubs",
                            simulacionUID,
                            palabra,
                            sobreControl
                        }

                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        const pantallaDeCarga_renderizda = document.querySelector(`[instanciaUID="${instanciaUID_pantallaDeCargaSuperPuesta}"]`)
                        pantallaDeCarga_renderizda?.remove()

                        const uiRenderizada = document.querySelector(`[simulacionUID="${simulacionUID}"]`)
                        if (!uiRenderizada) { return }

                        if (respuestaServidor?.error) {
                            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                        }
                        if (respuestaServidor?.ok) {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            const servicios = respuestaServidor.instantaneaServicios
                            casaVitini.view.componentes.servicios.actualizarContenedor({ servicios })

                            const desgloseFinanciero = respuestaServidor.desgloseFinanciero
                            casaVitini.ui.componentes.contenedorFinanciero.constructor({
                                destino: `[simulacionUID="${simulacionUID}"] [contenedor=simulacion]`,
                                contenedorFinanciero: { desgloseFinanciero },
                                modoUI: "simulador"
                            })
                        }
                    },
                }

            },
            desplegarContenedorFinanciero: async function (data) {
                const simulacionUID = data.simulacionUID
                const transaccion = {
                    zona: "administracion/simuladorDePrecios/detallesSimulacion",
                    simulacionUID: String(simulacionUID)
                }
                const respuestaServidor = await casaVitini.shell.servidor(transaccion)

                const instanciaRenderizada = document.querySelector(`[simulacionUID="${simulacionUID}"]`)
                if (!instanciaRenderizada) {
                    return
                }
                if (respuestaServidor?.error) {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {

                    const contenedorFinanciero = respuestaServidor.contenedorFinanciero
                    casaVitini.ui.componentes.contenedorFinanciero.constructor({
                        destino: `[simulacionUID="${simulacionUID}"] [contenedor=simulacion]`,
                        contenedorFinanciero,
                        modoUI: "simulador"
                    })
                }
            },
            categoriasGlobalesUI: {
                despliege: function (data) {
                    const simulacionUID = data.simulacionUID
                    const url = "/administracion/simulador_de_precios/simulacion:" + simulacionUID + "/zona:"

                    const contenedor = document.createElement("div");
                    contenedor.classList.add(
                        "flexVertical"
                    );
                    contenedor.setAttribute("componente", "panelDetallesReserva")

                    const contenedorBotonesExpandidos = document.createElement("div")
                    contenedorBotonesExpandidos.classList.add("menuGlobalSimuiacion")
                    contenedorBotonesExpandidos.setAttribute("contenedor", "botonesExpandidos")

                    contenedor.appendChild(contenedorBotonesExpandidos)

                    const marcoMenuResponsivo = document.createElement("div");
                    marcoMenuResponsivo.setAttribute("class", "menuGlobalSimuiacion_responsivo");
                    marcoMenuResponsivo.textContent = "Menú reserva"
                    marcoMenuResponsivo.addEventListener("click", () => {
                        document.body.style.overflow = "hidden";
                        this.desplegarMenuResponsivo({
                            simulacionUID,
                        })

                    })
                    contenedor.appendChild(marcoMenuResponsivo);

                    const botonUI = (data) => {

                        const categoria = data.categoria
                        const zonaURL = casaVitini.utilidades.cadenas.camelToSnake(categoria)
                        const cateoriaUI = data.cateoriaUI

                        const ui = document.createElement("a");
                        ui.setAttribute("class", "menuCategoria");
                        ui.setAttribute("categoria", categoria);
                        ui.href = url + zonaURL;
                        ui.addEventListener("click", (e) => {
                            e.preventDefault()
                            this.controladorMostrar({
                                categoria: categoria,
                                origen: "botonCategoria",
                            })
                        })
                        ui.textContent = cateoriaUI;
                        return ui

                    }
                    const lista = [
                        {
                            categoria: "alojamiento",
                            cateoriaUI: "Alojamiento"
                        },
                        {
                            categoria: "complementosAlojamiento",
                            cateoriaUI: "Complementos del alojamiento"
                        },
                        {
                            categoria: "servicios",
                            cateoriaUI: "Servicios"
                        },
                        {
                            categoria: "codigosDescuento",
                            cateoriaUI: "Codigos de descuento"
                        },
                        {
                            categoria: "desgloseFinanciero",
                            cateoriaUI: "Deslose financiero"
                        },
                    ]

                    lista.forEach((c) => {
                        const boton = botonUI(c)
                        contenedorBotonesExpandidos.appendChild(boton)
                    })
                    return contenedor;
                },
                desplegarMenuResponsivo: function (data) {
                    const simulacionUID = data.simulacionUID

                    const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                    ui.setAttribute("controlador", "controlResponsivoVisibilidad")
                    document.querySelector("main").appendChild(ui)

                    const contenedor = ui.querySelector("[componente=contenedor]")
                    contenedor.style.paddingTop = "0px"

                    const botonCancelar = document.createElement("div")
                    botonCancelar.classList.add("botonV1")
                    botonCancelar.setAttribute("boton", "cancelar")
                    botonCancelar.textContent = "Cerrar";
                    botonCancelar.addEventListener("click", () => {
                        return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    })
                    contenedor.appendChild(botonCancelar)

                    const panelGlobal = this.despliege({
                        simulacionUID
                    })
                    const contenedorBotonesEspandidos = panelGlobal.querySelector("[contenedor=botonesExpandidos]")
                    contenedorBotonesEspandidos.classList.remove("menuGlobalSimuiacion")
                    contenedorBotonesEspandidos.style.display = 'grid'
                    contenedorBotonesEspandidos.style.gap = '6px'

                    contenedorBotonesEspandidos.querySelectorAll("[categoria]").forEach((boton) => {
                        boton.classList.add("botonV1BlancoIzquierda")
                        boton.classList.remove("menuCategoria")

                    })
                    contenedor.appendChild(contenedorBotonesEspandidos)

                    const controlResponsivoVisibilidad = () => {
                        const selectorElementoObservado = document.querySelector("[controlador=controlResponsivoVisibilidad]")
                        if (!selectorElementoObservado) {
                            window.removeEventListener("resize", controlResponsivoVisibilidad);
                            return
                        }
                        const windowWidth = window.innerWidth;
                        const threshold = "922"
                        if (windowWidth > threshold) {
                            selectorElementoObservado?.remove()
                        }
                    }
                    window.addEventListener("resize", controlResponsivoVisibilidad);

                },
                ocultaCategorias: function () {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas();
                    this.limpiarMenusCategorias()
                    document.querySelector("[componente=contenedorDinamico]").innerHTML = null
                },
                limpiarMenusCategorias: () => {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas();
                    const botonesCategoria = document.querySelectorAll(`[contenedor=botonesExpandidos] [categoria]`)
                    botonesCategoria.forEach((boton) => {
                        boton.removeAttribute("style")
                        boton.setAttribute("estadoCategoria", "otra")
                    })
                },
                controladorMostrar: function (data) {
                    const origen = data.origen
                    const categoriaIDV = data.categoria
                    const simulacionUID = document.querySelector("[simulacionUID]").getAttribute("simulacionUID")

                    const url = "/administracion/simulador_de_precios/simulacion:" + simulacionUID + "/zona:"
                    const categoriaActual = document.querySelector("[estadoCategoria=actual]")?.getAttribute("categoria")
                    const selectorBotonCategoriaRenderizado = document.querySelector(`[categoria="${categoriaIDV}"]`)
                    const estadoCategoria = selectorBotonCategoriaRenderizado?.getAttribute("estadoCategoria")
                    this.limpiarMenusCategorias()
                    selectorBotonCategoriaRenderizado.setAttribute("estadoCategoria", "actual")

                    const todosLosContenedores = document.querySelectorAll("[zonaSimulacion]")
                    todosLosContenedores.forEach(z => {
                        z.removeAttribute("style")
                        z.removeAttribute("estadoVisual")
                    })
                    const zonaSel = document.querySelector(`[zonaSimulacion=${categoriaIDV}]`)
                    zonaSel.style.display = "flex"
                    zonaSel.setAttribute("estadoVisual", "activado")
                    const funcionPersonalizada = `administracion.simuladorDePrecios.detallesSimulacion.componentesUI.categoriasGlobalesUI.controladorMostrar`

                    const botonCategoriaGlobal = document.querySelector(`[contenedor=botonesExpandidos] [categoria="${categoriaIDV}"]`)
                    botonCategoriaGlobal.style.background = "blue"
                    botonCategoriaGlobal.style.color = "white"
                    const categoriaURL = casaVitini.utilidades.cadenas.camelToSnake(categoriaIDV)
                    const directoriosFusion = url + categoriaURL
                    const componentesExistenteUID = "simulacionUID_" + simulacionUID
                    const titulo = "Casa Vitini"

                    const estado = {
                        zona: directoriosFusion,
                        EstadoInternoZona: "estado",
                        tipoCambio: "parcial",
                        componenteExistente: componentesExistenteUID,
                        funcionPersonalizada: funcionPersonalizada,
                        args: {
                            origen: "url",
                            categoria: categoriaIDV
                        }
                    }

                    if (!categoriaActual || categoriaIDV === categoriaActual) {
                        window.history.replaceState(estado, titulo, directoriosFusion)
                    } else if (categoriaIDV !== categoriaActual) {
                        if (origen === "url") {
                            window.history.replaceState(estado, titulo, directoriosFusion);
                        }
                        if (origen === "botonCategoria" && (estadoCategoria === "otra" || !estadoCategoria)) {
                            window.history.pushState(estado, titulo, directoriosFusion);
                        }
                        if (origen === "botonCategoria" && estadoCategoria === "actual") {
                            window.history.replaceState(estado, titulo, directoriosFusion);
                        }
                    }


                }

            },

        },
        eliminarSimulacion: {
            UI: function () {
                const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

                const titulo = constructor.querySelector("[componente=titulo]")
                titulo.textContent = "Confirmar la eliminación de la simulación"
                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                mensaje.textContent = "Vas a eliminar la simulacuión"

                const botonAceptar = constructor.querySelector("[boton=aceptar]")
                botonAceptar.textContent = "Comfirmar la eliminacion del impuesto"
                botonAceptar.addEventListener("click", () => {
                    this.confirmarEliminacion()
                })
                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                botonCancelar.textContent = "Cancelar la eliminación"
                document.querySelector("main").appendChild(pantallaInmersiva)
            },
            confirmarEliminacion: async function () {
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = "Eliminado simulaciuon..."
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const simulacionUID = document.querySelector("[simulacionUID]").getAttribute("simulacionUID")
                const transaccion = {
                    zona: "administracion/simuladorDePrecios/eliminarSimulacion",
                    simulacionUID: String(simulacionUID)
                }
                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }
                instanciaRenderizada.remove()
                if (respuestaServidor?.error) {
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    const entrada = {
                        vista: "/administracion/simulador_de_precios",

                    }
                    casaVitini.shell.navegacion.controladorVista(entrada)
                }
            }
        },
        actualizarNombreSimulacion: async function () {
            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const mensaje = "Actualizando el nombre de la simulación..."
            const datosPantallaSuperpuesta = {
                instanciaUID: instanciaUID,
                mensaje: mensaje,
                identificadorVisual: "pantallaDeCarga"
            }
            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)

            const nombre = document.querySelector("[campo=nombre]").value
            const simulacionUID = document.querySelector("[simulacionUID]").getAttribute("simulacionUID")

            const transaccion = {
                zona: "administracion/simuladorDePrecios/actualizarNombreSimulacion",
                simulacionUID,
                nombre

            }
            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
            if (!instanciaRenderizada) { return }
            instanciaRenderizada.remove()

            if (respuestaServidor?.error) {
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
            }
        },
    },
    componentes: {
        simulacionUI: function (data) {
            const simulacionUID = data.simulacionUID
            const contenedor = document.createElement("div")
            contenedor.classList.add(
                "flexVertical",
                "gap6"
            )

            const instanciaUID_contenedorFechas = casaVitini.utilidades.codigoFechaInstancia()

            const contenedorBotones = document.createElement("div")
            contenedorBotones.setAttribute("contenedor", "botones")
            contenedorBotones.classList.add(
                "flexVertical",
                "gap6"
            )
            contenedor.appendChild(contenedorBotones)

            const contenedorFechaCreacion = document.createElement("div");
            contenedorFechaCreacion.setAttribute("calendario", "fechaCreacion");
            contenedorFechaCreacion.setAttribute("CSS", "selectorFechas")
            contenedorFechaCreacion.classList.add(
                "flexVertical",
                "gap6"
            )
            contenedorFechaCreacion.setAttribute("paralizadorEvento", "ocultadorCalendarios");
            contenedorFechaCreacion.setAttribute("instanciaUID_contenedorFechas", instanciaUID_contenedorFechas)
            contenedor.appendChild(contenedorFechaCreacion);

            const contenedorZonaIDV = document.createElement("div")
            contenedorZonaIDV.classList.add(
                "flexVertical"
            )
            contenedorFechaCreacion.appendChild(contenedorZonaIDV)
            const opcionesEntidad = [
                {
                    zonaIDV: "",
                    zonaUI: "Zona simulada"
                },
                {
                    zonaIDV: "global",
                    zonaUI: "Global"
                },
                {
                    zonaIDV: "privada",
                    zonaUI: "Privada"
                },
                {
                    zonaIDV: "publica",
                    zonaUI: "Pública"
                },

            ]
            const selectorZonaIDV = document.createElement("select")
            selectorZonaIDV.addEventListener("change", () => {
                casaVitini.view.componentes.actualizaSimulacion()
            })

            selectorZonaIDV.classList.add(
                "selectorZonas",
                "padding10",
                "borderRadius6",
                "selectorLista"
            )
            selectorZonaIDV.setAttribute("selector", "zonaIDV")
            opcionesEntidad.forEach((e) => {
                const zonaIDV = e.zonaIDV
                const zonaUI = e.zonaUI
                const opcion = document.createElement("option");

                if (zonaIDV === "") {
                    opcion.disabled = true;
                    opcion.selected = true;

                }

                opcion.value = zonaIDV;
                opcion.text = zonaUI;
                selectorZonaIDV.add(opcion);
            })
            contenedorZonaIDV.appendChild(selectorZonaIDV)

            const selectorFechaCreacion = document.createElement("div")
            selectorFechaCreacion.classList.add("contenedorFecha");
            selectorFechaCreacion.setAttribute("calendario", "unico");
            selectorFechaCreacion.setAttribute("nombreContenedor", "rangoUnico")

            selectorFechaCreacion.addEventListener("click", async () => {
                await casaVitini.ui.componentes.calendario.configurarCalendario({
                    perfilMes: "calendario_unico_perfilSimple",
                    contenedorOrigenIDV: "[calendario=unico]",
                    instanciaUID_contenedorFechas,
                    rangoIDV: "unico",
                    metodoSelectorDia: "view.componentes.pasarelaSelectorDia",
                    tituloCalendario: "Selecciona la fecha de creación simulada de la reserva",

                })
            })

            const tituloFechaCreacion = document.createElement("p");
            tituloFechaCreacion.classList.add("negrita");
            tituloFechaCreacion.textContent = "Fecha de creación simulada"
            selectorFechaCreacion.appendChild(tituloFechaCreacion)

            const fechaCreacionUI = document.createElement("p");
            fechaCreacionUI.classList.add("fechaInicio");
            fechaCreacionUI.setAttribute("fechaUI", "unico");
            fechaCreacionUI.textContent = "(Seleccionar)";
            selectorFechaCreacion.appendChild(fechaCreacionUI)

            contenedorFechaCreacion.appendChild(selectorFechaCreacion);


            const botonResetearFechas = document.createElement("div")
            botonResetearFechas.classList.add(
                "botonV1",
                "comportamientoBoton",
                "padding6",
                "textoCentrado",
                "backgroundGrey1",
                "borderRadius8",
                "noSelecionable"
            )
            botonResetearFechas.textContent = "Borrar el rango de fechas"
            botonResetearFechas.addEventListener("click", (e) => {

                const selectorFechaEntrada = document.querySelector("[calendario=entrada]")
                const selectorFechaSalida = document.querySelector("[calendario=salida]")

                selectorFechaEntrada.classList.add("parpadeoFondoAzul")
                selectorFechaSalida.classList.add("parpadeoFondoAzul")

                selectorFechaSalida.removeAttribute("memoriaVolatil")
                selectorFechaEntrada.removeAttribute("memoriaVolatil")
                selectorFechaEntrada.querySelector("[fechaUI=fechaInicio]").textContent = "(Seleccionar)"
                selectorFechaSalida.querySelector("[fechaUI=fechaFin]").textContent = "(Seleccionar)"

            })
            contenedor.appendChild(botonResetearFechas)

            const selectorRangoSimulado = casaVitini.ui.componentes.componentesComplejos.contenedorFechasUI({
                metodoSelectorDia: "view.componentes.pasarelaSelectorDia",
                nombreContenedor: "rangoDeSimulacion",
                modo: "administracion",
                seleccionableDiaLimite: "no",
                sobreControlConfiguracion: {
                    configuracionInicio: {
                        tituloCalendario: "Seleciona una fecha de entrada simulada de la reserva",
                        seleccionableDiaLimite: "no"
                    },
                    configuracionFin: {
                        tituloCalendario: "Seleciona una fecha de salida simulada de la reserva",
                        seleccionableDiaLimite: "no"
                    }
                }
            })
            contenedor.appendChild(selectorRangoSimulado)

            const menuGlobal = casaVitini.view.detallesSimulacion.componentesUI.categoriasGlobalesUI.despliege({
                simulacionUID
            })
            contenedor.appendChild(menuGlobal)

            const botonReconstrucionHub = document.createElement("div")
            botonReconstrucionHub.setAttribute("boton", "reconstruccionHubSinConfirmacion")
            botonReconstrucionHub.classList.add("botonV1")
            botonReconstrucionHub.textContent = "Reconstruir desglose desde los hubs"
            contenedor.appendChild(botonReconstrucionHub)

            const porApartamentoDedicado = document.createElement("div");
            porApartamentoDedicado.classList.add(
                "flexVertical",
                "gap6",
                "backgroundGrey1",
                "padding6",
                "borderRadius12",
                "ocultoInicial_enContexto"
            );
            porApartamentoDedicado.setAttribute("contenedor", "apartamentosSeleccianados")
            porApartamentoDedicado.setAttribute("zonaSimulacion", "alojamiento")
            contenedor.appendChild(porApartamentoDedicado)

            const tituloApartamentos = document.createElement("p")
            tituloApartamentos.classList.add(
                "negrita",
                "padding10"
            )
            tituloApartamentos.textContent = "Apartamentos de la simulación"
            porApartamentoDedicado.appendChild(tituloApartamentos)

            const selectorApartamentosEspecificosUI = casaVitini.ui.componentes.componentesComplejos.selectorApartamentosEspecificosUI.despliegue({
                textoContenedorVacio: "Añade apartamentos a la simulación",
                contenedorMetodosPersonalizados: {
                    insertarApartamento: {
                        metodo: casaVitini.view.detallesSimulacion.componentesUI.alojamiento.insertarAlojamiento,
                        data: {
                            simulacionUID
                        }
                    },
                    eliminarApartamento: {
                        metodo: casaVitini.view.detallesSimulacion.componentesUI.alojamiento.eliminarApartamento,
                        data: {
                            simulacionUID
                        }
                    },

                }
            })
            porApartamentoDedicado.appendChild(selectorApartamentosEspecificosUI)


            const contenedorZonaCodigo = document.createElement("div")
            contenedorZonaCodigo.setAttribute("contenedor", "codigosDescuento")
            contenedorZonaCodigo.setAttribute("zonaSimulacion", "codigosDescuento")
            contenedorZonaCodigo.classList.add(
                "flexVertical",
                "gap6",
                "backgroundGrey1",
                "padding6",
                "borderRadius12",
                "ocultoInicial_enContexto"
            )

            contenedor.appendChild(contenedorZonaCodigo)

            const contendorBotonesCampoCodigoDescuento = document.createElement("div")
            contendorBotonesCampoCodigoDescuento.classList.add(
                "flexHorizontal",
                "flexApiladoI"
            )
            contenedorZonaCodigo.appendChild(contendorBotonesCampoCodigoDescuento)


            const botonAgregarCampoCodigoDescuento = document.createElement("div")
            botonAgregarCampoCodigoDescuento.classList.add(
                "botonV1"
            )
            botonAgregarCampoCodigoDescuento.textContent = "Agregar campo de descuento"
            botonAgregarCampoCodigoDescuento.addEventListener("click", () => {

                const contenedorCodigosDecuentos = document.querySelector("[contenedor=codigosDescuento]")
                const lista = contenedorCodigosDecuentos.querySelector("[contenedor=listaDescuentos]")
                lista.removeAttribute("style")
                const contenedorCampoUI = casaVitini.view.componentes.contenedorCodigosDescuento.contenedorCampo()
                lista.appendChild(contenedorCampoUI)

                const botonComprobar = casaVitini.view.componentes.contenedorCodigosDescuento.botonComprobar()
                const selectorBotonComprobar_renderizado = contenedorCodigosDecuentos.querySelector("[boton=comprobar]")
                if (!selectorBotonComprobar_renderizado) {
                    contenedorCodigosDecuentos.appendChild(botonComprobar)
                }
            })
            contendorBotonesCampoCodigoDescuento.appendChild(botonAgregarCampoCodigoDescuento)



            const contenedorCodigosDescuentosPorVerificar = document.createElement("div")
            contenedorCodigosDescuentosPorVerificar.setAttribute("contenedor", "listaDescuentos")
            contenedorCodigosDescuentosPorVerificar.style.display = "none"
            contenedorCodigosDescuentosPorVerificar
            contenedorCodigosDescuentosPorVerificar.classList.add(
                "flexVertical",
                "gap6",
                "padding6"
            )
            contenedorZonaCodigo.appendChild(contenedorCodigosDescuentosPorVerificar)


            const contenedorServicios = document.createElement("div");
            contenedorServicios.setAttribute("zonaSimulacion", "servicios")
            contenedorServicios.classList.add(
                "flexVertical",
                "gap6",
                "backgroundGrey1",
                "padding6",
                "borderRadius12",
                "ocultoInicial_enContexto"
            );
            contenedorServicios.setAttribute("contenedor", "servicios")
            contenedor.appendChild(contenedorServicios)

            const tituloServicios = document.createElement("p")
            tituloServicios.classList.add(
                "negrita",
                "padding10"
            )
            tituloServicios.textContent = "Servicios de la simulación"
            contenedorServicios.appendChild(tituloServicios)

            const serviciosUI = casaVitini.view.componentes.servicios.arranque()
            contenedorServicios.appendChild(serviciosUI)

            const contenedorComplementosDeAlojamiento = document.createElement("div");
            contenedorComplementosDeAlojamiento.setAttribute("zonaSimulacion", "complementosAlojamiento")
            contenedorComplementosDeAlojamiento.classList.add(
                "flexVertical",
                "gap6",
                "backgroundGrey1",
                "padding6",
                "borderRadius12",
                "ocultoInicial_enContexto"
            );
            contenedorComplementosDeAlojamiento.setAttribute("contenedor", "complementosAlojamiento")
            contenedor.appendChild(contenedorComplementosDeAlojamiento)

            const tituloComplementos = document.createElement("p")
            tituloComplementos.classList.add(
                "negrita",
                "padding10"
            )
            tituloComplementos.textContent = "Complementos de alojamiento"
            contenedorComplementosDeAlojamiento.appendChild(tituloComplementos)


            const infoSinAlojamiento = casaVitini.view.detallesSimulacion.componentesUI.complementosDeAlojamiento.componentesUI.infoSinComplemento()
            contenedorComplementosDeAlojamiento.appendChild(infoSinAlojamiento)


            const contenedorSimulacion = document.createElement("div")
            contenedorSimulacion.classList.add("ocultoInicial_enContexto", "flexVertical")
            contenedorSimulacion.setAttribute("zonaSimulacion", "desgloseFinanciero")
            contenedorSimulacion.setAttribute("contenedor", "simulacion")
            contenedor.appendChild(contenedorSimulacion)

            return contenedor

        },
        actualizaSimulacion: async function (data) {


            const simulacionUID = document.querySelector("[simulacionUID]")?.getAttribute("simulacionUID")
            if (!simulacionUID) {
                return
            }
            const transaccion = {
                zona: "administracion/simuladorDePrecios/actualizarSimulacionPorDataGlobal",
                simulacionUID
            }

            const fechaCreacionUI = document.querySelector("[calendario=unico]")
            const fechaCreacion = fechaCreacionUI?.getAttribute("memoriaVolatil") || null
            if (fechaCreacion) {
                transaccion.fechaCreacion = fechaCreacion
            }

            const fechaEntradaUI = document.querySelector("[calendario=entrada]")
            const fechaEntrada = fechaEntradaUI?.getAttribute("memoriaVolatil") || null
            if (fechaEntrada) {
                transaccion.fechaEntrada = fechaEntrada
            }

            const fechaSalidaUI = document.querySelector("[calendario=salida]")
            const fechaSalida = fechaSalidaUI?.getAttribute("memoriaVolatil") || null
            if (fechaSalida) {
                transaccion.fechaSalida = fechaSalida
            }

            const zonaIDVUI = document.querySelector("[selector=zonaIDV]")
            const zonaIDV = zonaIDVUI.value
            if (zonaIDV) {
                transaccion.zonaIDV = zonaIDV
            }

            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()

            if (respuestaServidor?.error) {
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                const selectorRecovery = data?.selectorRecovery

                if (selectorRecovery) {
                    const fechaRecovery_ISO = data?.fechaRecovery_ISO
                    const fechaRecovery_humana = data?.fechaRecovery_humana

                    const selectorContenedorFecha = document.querySelector(selectorRecovery)
                    selectorContenedorFecha.setAttribute("memoriaVolatil", fechaRecovery_ISO)
                    selectorContenedorFecha.querySelector("[fechaUI]").textContent = fechaRecovery_humana
                }
            }
            if (respuestaServidor?.ok) {
                this.postProcesamientoTransaccion(respuestaServidor)
            }
        },
        postProcesamientoTransaccion: function (data) {

            const llavesFaltantes = data?.llavesFaltantes || null
            const info = data?.info || null

            const desgloseFinanciero = data?.desgloseFinanciero || null
            const simulacionUID = data.simulacionUID
            const llavesIDV = [
                "[calendario=unico]",
                "[calendario=entrada]",
                "[calendario=salida]",
                "[contenedor=apartamentosSeleccianados]",
                "[selector=zonaIDV]"
            ]
            llavesIDV.forEach((llaveIDV) => {
                document.querySelector(llaveIDV).classList.remove("parpadeoFondoAzul")
            })
            if (llavesFaltantes) {



                const llavesFaltantes = data.llavesFaltantes
                const llaves = [
                    "fechaEntrada",
                    "fechaSalida",
                    "fechaCreacion",
                    "alojamiento",
                    "zonaIDV"
                ]
                const dic = {
                    fechaCreacion: llavesIDV[0],
                    fechaEntrada: llavesIDV[1],
                    fechaSalida: llavesIDV[2],
                    alojamiento: llavesIDV[3],
                    zonaIDV: llavesIDV[4]
                }
                llaves.forEach((llave) => {
                    if (llavesFaltantes.includes(llave)) {
                        const selector = dic[llave];
                        const elemento = document.querySelector(selector);
                        if (elemento) {
                            elemento.classList.add("parpadeoFondoAzul");
                        }
                    } else {
                        const selector = dic[llave];
                        const elemento = document.querySelector(selector);
                        if (elemento) {
                            elemento.classList.remove("parpadeoFondoAzul");
                        }
                    }
                })
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                const spinnnerRenderizado = document.querySelector("[componente=spinnerSimple]")
                spinnnerRenderizado?.remove()

                this.infoLllavesFaltantes({
                    simulacionUID,
                    info,
                    llavesFaltantes
                })

            } else if (desgloseFinanciero) {

                document.querySelector(`[simulacionUID="${simulacionUID}"] [contenedor=simulacion] [info=llavesFaltantes]`)?.remove()
                casaVitini.ui.componentes.contenedorFinanciero.constructor({
                    destino: `[simulacionUID="${simulacionUID}"] [contenedor=simulacion]`,
                    contenedorFinanciero: { desgloseFinanciero },
                    modoUI: "simulador"
                })
            }




        },
        servicios: {
            arranque: function () {

                const contenedor = document.createElement("div")
                contenedor.setAttribute("class", "contenedorServicios")
                contenedor.setAttribute("componente", "categoriaServicios")

                const contenedorInformacionGlobal = document.createElement("div")
                contenedorInformacionGlobal.classList.add("administracion_reservas_detallesReserva_contenedorEnlacesDePago")

                contenedor.appendChild(contenedorInformacionGlobal)
                const bloqueBotones = document.createElement("div")
                bloqueBotones.classList.add("detallesReserva_enlacesDePago_bloqueBotones")

                const botonCrearPagoManual = document.createElement("div")
                botonCrearPagoManual.classList.add("detallesReserva_transacciones_botonV1")
                botonCrearPagoManual.textContent = "Insertar un servicio"
                botonCrearPagoManual.addEventListener("click", () => {
                    casaVitini.view.componentes.servicios.componentesUI.insertarServicio.ui({})
                })
                bloqueBotones.appendChild(botonCrearPagoManual)
                contenedorInformacionGlobal.appendChild(bloqueBotones)

                const contenedorListaServicios = document.createElement("div")
                contenedorListaServicios.classList.add("listaServicios")
                contenedorListaServicios.setAttribute("componente", "contenedorListaServiciosEnReserva")
                contenedor.appendChild(contenedorListaServicios)

                return contenedor

            },
            componentesUI: {
                insertarServicio: {
                    ui: async function (data) {
                        const main = document.querySelector("main")
                        const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                        const simulacionUID = main.querySelector("[simulacionUID]").getAttribute("reservaUID")
                        const instanciaUID_UIFlotanteServicios = ui.getAttribute("instanciaUID")
                        const instanciaUID_contenedorServicios = data.instanciaUID_contenedorServicios
                        main.appendChild(ui)

                        await this.despliegeListaServicios({
                            ui,
                            instanciaUID_UIFlotanteServicios,
                            instanciaUID_contenedorServicios,
                            simulacionUID
                        })

                    },
                    despliegeListaServicios: async function (data) {

                        const ui = data.ui
                        const instanciaUID_UIFlotanteServicios = data.instanciaUID_UIFlotanteServicios
                        const instanciaUID_contenedorServicios = data.instanciaUID_contenedorServicios
                        const simulacionUID = data.simulacionUID


                        const constructor = ui.querySelector("[componente=contenedor]")
                        constructor.innerHTML = null

                        const spinner = casaVitini.ui.componentes.spinner({
                            mensaje: "Obteniendo servicios...",
                            textoBoton: "Cancelar"
                        })
                        constructor.appendChild(spinner)

                        const transaccion = {
                            zona: "administracion/servicios/obtenerServicios"
                        }

                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        const uiRenderizada = document.querySelectorAll(`[instanciaUID="${instanciaUID_UIFlotanteServicios}"]`)
                        if (!uiRenderizada) { return }
                        if (respuestaServidor?.error) {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                        }
                        if (respuestaServidor?.ok) {
                            spinner.remove()
                            constructor.appendChild(this.botonCancelar())

                            const servicios = respuestaServidor.servicios

                            const contenedor = document.createElement("div")
                            contenedor.classList.add(
                                "maxWidth1280px",
                                "width100",
                                "flexVertical",
                                "gap10",
                            )
                            constructor.appendChild(contenedor)
                            const estadoUI_ = (estadoIDV) => {

                                if (estadoIDV === "activado") {
                                    return "Activada"
                                } else if (estadoIDV === "desactivado") {
                                    return "Desactivada"
                                }

                            }

                            servicios.forEach((detalles) => {
                                const nombre = detalles.nombre
                                const servicioUID = detalles.servicioUID
                                const estadoIDV = detalles.estadoIDV
                                const zonaIDV = detalles.zonaIDV
                                const contenedorData = detalles.contenedor

                                const contenedorServicio = document.createElement("div")
                                contenedorServicio.setAttribute("servicioUID", servicioUID)
                                contenedorServicio.classList.add(
                                    "borderRadius12",
                                    "width100",
                                    "flexVertical",
                                    "backgroundGrey1",
                                    "padding6",
                                    "gap6"
                                )

                                const contenedorGlobal = document.createElement("div")
                                contenedorGlobal.classList.add(
                                    "flexVertical",
                                    "padding6",
                                    "gap6"
                                )

                                const nombreOfertaUI = document.createElement("div")
                                nombreOfertaUI.classList.add("negrita")
                                nombreOfertaUI.textContent = nombre
                                contenedorGlobal.appendChild(nombreOfertaUI)

                                const estadoTitulo = document.createElement("div")
                                estadoTitulo.textContent = "Estado del servicio"
                                contenedorGlobal.appendChild(estadoTitulo)

                                const estadoUI = document.createElement("div")
                                estadoUI.classList.add("negrita")
                                estadoUI.textContent = estadoUI_(estadoIDV)
                                contenedorGlobal.appendChild(estadoUI)
                                contenedorServicio.appendChild(contenedorGlobal)

                                const contendorBotones = document.createElement("div")
                                contendorBotones.classList.add(
                                    "flexHorizontal",
                                    "gap6",
                                )

                                const botonInsertar = document.createElement("div")
                                botonInsertar.classList.add(
                                    "borderRadius8",
                                    "backgroundGrey1",
                                    "comportamientoBoton",
                                    "padding8"
                                )
                                botonInsertar.textContent = "Insertar servicios en la simulación"
                                botonInsertar.addEventListener("click", () => {

                                    this.despliegeDeSeleccionEnServicio({
                                        servicioUID,
                                        instanciaUID_UIFlotanteServicios,
                                        ui
                                    })
                                })
                                contendorBotones.appendChild(botonInsertar)

                                const botonVerOferta = document.createElement("a")
                                botonVerOferta.classList.add(
                                    "borderRadius8",
                                    "backgroundGrey1",
                                    "comportamientoBoton",
                                    "padding8",
                                    "limpiezaBotonA"
                                )
                                botonVerOferta.textContent = "Ir al servicio"
                                botonVerOferta.setAttribute("href", "/administracion/servicios/servicio:" + servicioUID)
                                botonVerOferta.setAttribute("vista", "/administracion/servicios/servicio:" + servicioUID)
                                botonVerOferta.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                                contendorBotones.appendChild(botonVerOferta)

                                contenedorServicio.appendChild(contendorBotones)
                                contenedor.appendChild(contenedorServicio)
                            })
                            constructor.appendChild(this.botonCancelar())
                        }
                    },
                    despliegeDeSeleccionEnServicio: async function (data) {

                        const simulacionUID = data.simulacionUID
                        const servicioUID = data.servicioUID
                        const instanciaUID_UIFlotanteServicios = data.instanciaUID_UIFlotanteServicios
                        const instanciaUID_contenedorServicios = data.instanciaUID_contenedorServicios
                        const ui = data.ui
                        const constructor = ui.querySelector("[componente=contenedor]")
                        constructor.innerHTML = null

                        const botonCerrar = document.createElement("div")
                        botonCerrar.classList.add("botonV1")
                        botonCerrar.textContent = "Cerrar y volver a la simulación"
                        botonCerrar.setAttribute("boton", "cancelar")
                        botonCerrar.addEventListener("click", () => {
                            return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        })
                        constructor.appendChild(botonCerrar)

                        const spinner = casaVitini.ui.componentes.spinnerSimple()
                        constructor.appendChild(spinner)

                        const transaccion = {
                            zona: "administracion/servicios/detallesServicio",
                            servicioUID: String(servicioUID)
                        }
                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        const ui_enEspera = document.querySelector(`[instanciaUID="${instanciaUID_UIFlotanteServicios}"]`)
                        if (!ui_enEspera) { return }
                        if (respuestaServidor?.error) {
                            const info = {
                                titulo: "No existe ningúna servicio con ese identificador",
                                descripcion: "Revisa el identificador porque este servicio que buscas no existe. Quizás este identificador existió y borraste esta servicio.."
                            }
                            casaVitini.ui.componentes.mensajeSimple(info)
                        } else if (respuestaServidor?.ok) {
                            constructor.innerHTML = null

                            const botonCerrar = document.createElement("div")
                            botonCerrar.classList.add("botonV1")
                            botonCerrar.textContent = "Cerrar y volver"
                            botonCerrar.setAttribute("boton", "cancelar")
                            botonCerrar.addEventListener("click", () => {
                                return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            })
                            constructor.appendChild(botonCerrar)

                            const botonVolver = document.createElement("div")
                            botonVolver.classList.add("botonV1BlancoIzquierda")
                            botonVolver.textContent = "Volver a la lista de servicios"
                            botonVolver.setAttribute("boton", "volver")
                            botonVolver.addEventListener("click", () => {
                                return this.despliegeListaServicios({
                                    ui,
                                    instanciaUID_UIFlotanteServicios,
                                    instanciaUID_contenedorServicios,
                                    simulacionUID
                                })
                            })

                            constructor.appendChild(botonVolver)

                            const servicio = respuestaServidor.ok
                            const servicioUID = servicio.servicioUID
                            const contenedor = servicio.contenedor

                            const servicioUI = casaVitini.view.__sharedMethods__.servicioUI({
                                servicioUID,
                                contenedor

                            })
                            constructor.appendChild(servicioUI)


                            const botonInsertar = document.createElement("div")
                            botonInsertar.classList.add("botonV1BlancoIzquierda")
                            botonInsertar.textContent = "Insertar servicio en simulacion 2"
                            botonInsertar.setAttribute("boton", "volver")
                            botonInsertar.addEventListener("click", (e) => {
                                const servicioUI_selector = e.target.closest("[componente=contenedor]").querySelector("[servicioUID]")

                                const servicioUID = servicioUI_selector.getAttribute("servicioUID")
                                const grupoDeOpciones = servicioUI_selector.querySelector("[area=grupoOpciones]").querySelectorAll("[componente=grupo]")
                                const opcionesSeleccionadasDelServicio = {
                                    servicioUID,
                                    opcionesSeleccionadas: {}
                                }
                                const opcionesSeleccionadas = opcionesSeleccionadasDelServicio.opcionesSeleccionadas
                                grupoDeOpciones.forEach((grupo) => {
                                    const grupoIDV = grupo.getAttribute("grupoIDV")
                                    opcionesSeleccionadas[grupoIDV] = []

                                    const opcionesDelGrupoSeleccionadas = grupo.querySelectorAll("[selector=opcion][estado=activado]")
                                    opcionesDelGrupoSeleccionadas.forEach(opcionSel => {
                                        const opcionIDV = opcionSel.getAttribute("opcionIDV")
                                        opcionesSeleccionadas[grupoIDV].push(opcionIDV)
                                    })
                                })

                                // Poner una advertenc  ia superpuesta para al espera.
                                this.confirmarInsertar({
                                    servicioUID,
                                    instanciaUID_UIFlotanteServicios,
                                    instanciaUID_contenedorServicios,
                                    opcionesSeleccionadasDelServicio
                                })

                            })
                            constructor.appendChild(botonInsertar)
                        }
                    },
                    botonCancelar: function () {
                        const botonCancelar = document.createElement("div")
                        botonCancelar.classList.add("boton")
                        botonCancelar.setAttribute("boton", "cancelar")
                        botonCancelar.textContent = "Cerrar y volver a la reserva"
                        botonCancelar.addEventListener("click", () => {
                            return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        })
                        return botonCancelar
                    },
                    confirmarInsertar: async function (data) {
                        const simulacionUID = document.querySelector("[simulacionUID]").getAttribute("simulacionUID")
                        const servicioUID = String(data.servicioUID)
                        const instanciaUID_UIFlotanteServicios = data.instanciaUID_UIFlotanteServicios
                        const instanciaUID_contenedorServicios = data.instanciaUID_contenedorServicios
                        const opcionesSeleccionadasDelServicio = data.opcionesSeleccionadasDelServicio
                        // const ui = document.querySelector(`[instanciaUID="${instanciaUID_insertarServiciosUI}"]`)
                        // const contenedor = ui.querySelector("[componente=contenedor]")
                        // contenedor.innerHTML = null


                        const instanciaPantallaCarga = casaVitini.utilidades.codigoFechaInstancia()
                        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
                            mensaje: "Insertando servicio en la simulación...",
                            textoBoton: "ocultar",
                            instanciaUID: instanciaPantallaCarga
                        })

                        const respuestaServidor = await casaVitini.shell.servidor({
                            zona: "administracion/simuladorDePrecios/servicios/insertarServicioEnSimulacion",
                            simulacionUID,
                            servicioUID,
                            opcionesSeleccionadasDelServicio
                        })
                        const uiRenderizada = document.querySelector(`[simulacionUID="${simulacionUID}"] [contenedor=servicios]`)

                        if (!uiRenderizada) { return }
                        if (respuestaServidor?.error) {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                        }
                        if (respuestaServidor?.ok) {

                            const servicioData = respuestaServidor.servicio
                            const nombreInterno = servicioData.nombre
                            const contenedor = servicioData.contenedor
                            const servicioUID_enSimulacion = servicioData.servicioUID
                            const opcionesSel = servicioData.opcionesSel

                            const servicioUI = casaVitini.view.componentes.servicios.componentesUI.servicioUI({
                                servicioUID_enSimulacion: servicioUID_enSimulacion,
                                instanciaUID_contenedorServicios: "contenedorServicios",
                                nombreInterno: nombreInterno,
                                contenedor: contenedor,
                                opcionesSeleccionadas: opcionesSel

                            })
                            const selectorInfo = uiRenderizada.querySelector("[componente=contenedorInfoSinServicios]")
                            selectorInfo?.remove()

                            const selectorListaServicios = uiRenderizada.querySelector("[componente=contenedorListaServiciosEnReserva]")
                            selectorListaServicios.appendChild(servicioUI)

                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            casaVitini.view.componentes.postProcesamientoTransaccion(respuestaServidor)

                        }

                    },
                },
                servicioUI: function (data) {
                    const servicioUID_enSimulacion = data.servicioUID_enSimulacion
                    const instanciaUID_contenedorServicios = data.instanciaUID_contenedorServicios
                    const nombreInterno = data.nombreInterno
                    const contenedor = data.contenedor
                    const opcionesSeleccionadas = data.opcionesSeleccionadas

                    const definicion = contenedor.definicion
                    const fechaFinal = contenedor.fechaFinal
                    const duracionIDV = contenedor.duracionIDV
                    const fechaInicio = contenedor.fechaInicio
                    const tituloPublico = contenedor.tituloPublico
                    const servicioUID = contenedor.servicioUID
                    const disponibilidadIDV = contenedor.disponibilidadIDV
                    const gruposDeOpciones = contenedor.gruposDeOpciones


                    const diccionario = {
                        disponibilidad: {
                            constante: "Disponible",
                            variable: "Disponibilidad variable"
                        }
                    }

                    const servicioUI = document.createElement("div")
                    servicioUI.setAttribute("servicioUID_enSimulacion", servicioUID_enSimulacion)
                    servicioUI.classList.add(
                        "flexVertical",
                        "padding6",
                        "backgroundGrey1",
                        "borderRadius10",
                        "gap6"
                    )
                    const contenedorInterno = document.createElement("div")
                    contenedorInterno.classList.add(
                        "flexVertical",
                        "gap6"
                    )
                    servicioUI.appendChild(contenedorInterno)

                    const contenedorNombreInterno = document.createElement("div")
                    contenedorNombreInterno.classList.add(
                        "flexVertical",
                        "padding8"
                    )
                    contenedorInterno.appendChild(contenedorNombreInterno)

                    const tituluNombreInternoUI = document.createElement("p")
                    tituluNombreInternoUI.textContent = `Nombre adminitrativo`
                    contenedorNombreInterno.appendChild(tituluNombreInternoUI)

                    const nombreInternoUI = document.createElement("p")
                    nombreInternoUI.classList.add(
                        "negrita")
                    nombreInternoUI.textContent = `${nombreInterno}`
                    contenedorNombreInterno.appendChild(nombreInternoUI)

                    const contenedorGlobal = document.createElement("div")
                    contenedorGlobal.classList.add(
                        "flexVertical"
                    )
                    servicioUI.appendChild(contenedorGlobal)

                    const contenedorNombrePublico = document.createElement("div")
                    contenedorNombrePublico.classList.add(
                        "flexVertical",
                        "padding6"
                    )
                    contenedorGlobal.appendChild(contenedorNombrePublico)

                    const tituluNombrePublico = document.createElement("p")
                    tituluNombrePublico.textContent = `Nombre público`
                    contenedorNombrePublico.appendChild(tituluNombrePublico)

                    const titulo = document.createElement("p")
                    titulo.classList.add(
                        "negrita")
                    titulo.textContent = tituloPublico
                    contenedorNombrePublico.appendChild(titulo)


                    const disponibilidadUI = document.createElement("p")
                    disponibilidadUI.classList.add(
                        "padding6"
                    )
                    disponibilidadUI.textContent = diccionario.disponibilidad[disponibilidadIDV]
                    servicioUI.appendChild(disponibilidadUI)


                    if (disponibilidadIDV === "variable") {

                        const info = document.createElement("p")
                        info.classList.add(
                            "padding6"
                        )
                        info.textContent = `Este servicio tiene una disponibilidad limitada. Es por eso que si selecciona este servicio, nos pondremos en contacto con el titular de la reserva en las próximas horas para confirmarle la disponibilidad del servicio para su reserva.`
                        servicioUI.appendChild(info)
                    }

                    if (duracionIDV === "rango") {
                        const contenedorDuracion = document.createElement("div")
                        contenedorDuracion.classList.add(
                            "flexVertical",
                            "padding6"

                        )
                        servicioUI.appendChild(contenedorDuracion)

                        const info = document.createElement("p")
                        info.classList.add("negrita")
                        info.textContent = `Servicio disponible solo desde ${fechaInicio} hata ${fechaFinal}. Ambas fechas incluidas.`
                        contenedorDuracion.appendChild(info)

                    }
                    const definicionUI = document.createElement("p")
                    definicionUI.classList.add(
                        "padding6"
                    )
                    definicionUI.textContent = definicion
                    servicioUI.appendChild(definicionUI)


                    Object.entries(gruposDeOpciones).forEach(([grupoIDV, gDP]) => {
                        const nombreGrupo = gDP.nombreGrupo
                        const opcionesGrupo = gDP.opcionesGrupo

                        const contenedorGrupo = document.createElement("div")
                        contenedorGrupo.setAttribute("grupoIDV", grupoIDV)
                        contenedorGrupo.classList.add(
                            "flexVertical", "gap6", "borderGrey1", "borderRadius14", "padding6"
                        )


                        const tituloGrupo = document.createElement("p")
                        tituloGrupo.classList.add("negrita", "padding10")
                        tituloGrupo.textContent = nombreGrupo
                        contenedorGrupo.appendChild(tituloGrupo)


                        const contenedorOpcionesGrupo = document.createElement("div")
                        contenedorOpcionesGrupo.classList.add(
                            "flexVertical", "gap6"
                        )
                        contenedorGrupo.appendChild(contenedorOpcionesGrupo)

                        let interruptor = false

                        opcionesGrupo.forEach((op) => {
                            const opcionIDV = op.opcionIDV
                            const nombreOpcion = op.nombreOpcion
                            const precioOpcion = op.precioOpcion ? op.precioOpcion + "$" : "0.00$ (Sin coste añadido)"

                            const selectorOpcionesGrupo = opcionesSeleccionadas[grupoIDV] || []
                            if (selectorOpcionesGrupo.includes(opcionIDV)) {
                                interruptor = true
                                const contenedorOpcion = document.createElement("div")
                                contenedorOpcion.classList.add(
                                    "flexVertical", "gap6", "backgroundGrey1", "borderRadius10", "padding14"
                                )
                                contenedorOpcionesGrupo.appendChild(contenedorOpcion)

                                // const grupoRenderizado_selector = servicioUI.querySelector(`[grupoIDV="${grupoIDV}"]`)
                                // if (!grupoRenderizado_selector) {
                                //     servicioUI.appendChild(contenedorGrupo)
                                // }

                                const opcionUI = document.createElement("p")
                                opcionUI.setAttribute("opcionIDV", opcionIDV)

                                opcionUI.textContent = nombreOpcion
                                contenedorOpcion.appendChild(opcionUI)


                                const precioUI = document.createElement("p")
                                precioUI.setAttribute("opcionIDV", opcionIDV)
                                precioUI.classList.add(
                                    "textoNegrita"
                                )
                                precioUI.textContent = precioOpcion
                                contenedorOpcion.appendChild(precioUI)
                            }
                        })
                        if (interruptor) {
                            servicioUI.appendChild(contenedorGrupo)
                        }
                    })



                    const contenedorBotones = document.createElement("div")
                    contenedorBotones.classList.add(
                        "flexHorizontal",
                        "flexAHCentrad",
                        "gap6"
                    )
                    servicioUI.appendChild(contenedorBotones)


                    const botonModificar = document.createElement("div")
                    botonModificar.classList.add("botonV6")
                    botonModificar.textContent = "Modificar servicio en simulacón"
                    botonModificar.addEventListener("click", () => {

                        casaVitini
                            .view
                            .componentes
                            .servicios
                            .componentesUI.acutalizarServicioEnSimulacion.ui({
                                servicioUID_enSimulacion,
                                instanciaUID_contenedorServicios
                            })
                    })
                    contenedorBotones.appendChild(botonModificar)


                    const botonIr = document.createElement("a")
                    botonIr.classList.add("botonV6")
                    botonIr.textContent = "Ir al servicio"
                    botonIr.setAttribute("href", "/administracion/servicios/servicio:" + servicioUID)
                    botonIr.setAttribute("target", "_blank")
                    contenedorBotones.appendChild(botonIr)


                    const botonEliminar = document.createElement("div")
                    botonEliminar.classList.add("botonV6")
                    botonEliminar.textContent = "Eliminar servicio de la simulación 1"
                    botonEliminar.addEventListener("click", () => {
                        casaVitini
                            .view
                            .componentes
                            .servicios
                            .componentesUI.
                            eliminarServicio
                            .ui({
                                instanciaUID_contenedorServicios,
                                servicioUID_enSimulacion,
                                nombreInterno
                            })
                    })
                    contenedorBotones.appendChild(botonEliminar)




                    return servicioUI
                },
                eliminarServicio: {
                    ui: async function (data) {
                        const nombreInterno = data.nombreInterno
                        const instanciaUID_contenedorServicios = data.instanciaUID_contenedorServicios
                        const servicioUID_enSimulacion = data.servicioUID_enSimulacion

                        const simulacionUID = document.querySelector("[simulacionUID]").getAttribute("simulacionUID")


                        const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                        ui.style.justifyContent = "center"
                        const instanciaUID_eliminarServicio = ui.getAttribute("instanciaUID")
                        const constructor = ui.querySelector("[componente=constructor]")

                        const titulo = constructor.querySelector("[componente=titulo]")
                        titulo.textContent = `Confirmar eliminar el servicio ${nombreInterno} de la reserva simulada`
                        const mensaje = constructor.querySelector("[componente=mensajeUI]")
                        mensaje.textContent = "Var a eliminar el servicio de la reserva simulada, ¿Estas de acuerdo?"

                        const botonAceptar = constructor.querySelector("[boton=aceptar]")
                        botonAceptar.textContent = "Comfirmar la eliminacion"
                        botonAceptar.addEventListener("click", () => {
                            this.confirmarEliminar({
                                servicioUID_enSimulacion,
                                instanciaUID_eliminarServicio,
                                instanciaUID_contenedorServicios,
                                simulacionUID
                            })
                        })
                        const botonCancelar = constructor.querySelector("[boton=cancelar]")
                        botonCancelar.textContent = "Cancelar y volver"
                        document.querySelector("main").appendChild(ui)

                    },
                    confirmarEliminar: async function (data) {
                        const servicioUID_enSimulacion = String(data.servicioUID_enSimulacion)

                        const instanciaUID_eliminarServicio = data.instanciaUID_eliminarServicio
                        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                        const simulacionUID = data.simulacionUID
                        const instanciaUID_contenedorServicios = data.instanciaUID_contenedorServicios
                        const ui = document.querySelector(`[instanciaUID="${instanciaUID_eliminarServicio}"]`)
                        const contenedor = ui.querySelector("[componente=constructor]")
                        contenedor.innerHTML = null

                        const spinner = casaVitini.ui.componentes.spinner({
                            mensaje: "Eliminado servicio en la reserva..."
                        })
                        contenedor.appendChild(spinner)

                        const transaccion = {
                            zona: "administracion/simuladorDePrecios/servicios/eliminarServicioEnSimulacion",
                            servicioUID_enSimulacion
                        }

                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()

                        if (respuestaServidor?.error) {
                            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                        }
                        if (respuestaServidor?.ok) {
                            const simulacionUIRenderizada = document.querySelector(`[simulacionUID="${simulacionUID}"]`)
                            if (!simulacionUIRenderizada) {
                                return
                            }
                            simulacionUIRenderizada.querySelector(`[servicioUID_enSimulacion="${servicioUID_enSimulacion}"]`)?.remove()

                            const selectorContenedoresDeServiciosRenderizados = simulacionUIRenderizada.querySelectorAll("[servicioUID_enSimulacion]")
                            if (selectorContenedoresDeServiciosRenderizados.length === 0) {
                                const infoSinEnlaces = casaVitini
                                    .view
                                    .componentes
                                    .servicios
                                    .componentesUI
                                    .infoSinServiciosUI()
                                const selectorContenedorDinamico = document.querySelector("[contenedor=servicios]")
                                selectorContenedorDinamico.appendChild(infoSinEnlaces)
                            }
                            casaVitini.view.componentes.postProcesamientoTransaccion(respuestaServidor)

                        }

                    },

                },
                infoSinServiciosUI: function () {
                    const infoSinEnlaces = document.createElement("div")
                    infoSinEnlaces.classList.add("reservaDetalles_transacciones_enlacesDePago_infoSinEnlaces")
                    infoSinEnlaces.setAttribute("componente", "contenedorInfoSinServicios")
                    infoSinEnlaces.textContent = "No hay ningún servicio en la reserva simulada."
                    return infoSinEnlaces
                },
                acutalizarServicioEnSimulacion: {
                    ui: async function (data) {
                        const servicioUID_enSimulacion = data.servicioUID_enSimulacion
                        const instanciaUID_contenedorServicios = data.instanciaUID_contenedorServicios
                        const main = document.querySelector("main")
                        const simulacionUID = main.querySelector("[simulacionUID]").getAttribute("simulacionUID")

                        const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                        const instanciaUID_UIFlotanteServicios = ui.getAttribute("instanciaUID")
                        const constructor = ui.querySelector("[componente=contenedor]")
                        main.appendChild(ui)

                        const botonCerrar = document.createElement("div")
                        botonCerrar.classList.add("botonV1")
                        botonCerrar.textContent = "Cerrar y volver"
                        botonCerrar.setAttribute("boton", "cancelar")
                        botonCerrar.addEventListener("click", () => {
                            return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        })
                        constructor.appendChild(botonCerrar)

                        const spinner = casaVitini.ui.componentes.spinnerSimple()
                        constructor.appendChild(spinner)

                        const respuestaServidor = await casaVitini.shell.servidor({
                            zona: "administracion/simuladorDePrecios/servicios/obtenerDetallesDelServicioEnSimulacion",
                            servicioUID_enSimulacion: String(servicioUID_enSimulacion),
                            simulacionUID: String(simulacionUID)
                        })

                        const ui_enEspera = document.querySelector(`[instanciaUID="${instanciaUID_UIFlotanteServicios}"]`)
                        if (!ui_enEspera) { return }
                        if (respuestaServidor?.error) {
                            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.error)
                        } else if (respuestaServidor?.ok) {
                            constructor.innerHTML = null

                            const botonCerrar = document.createElement("div")
                            botonCerrar.classList.add("botonV1")
                            botonCerrar.textContent = "Cerrar y volver"
                            botonCerrar.setAttribute("boton", "cancelar")
                            botonCerrar.addEventListener("click", () => {
                                return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            })
                            constructor.appendChild(botonCerrar)

                            const servicio = respuestaServidor.servicio
                            const servicioUID = servicio.servicioUID
                            const contenedor = servicio.contenedor

                            const servicioUI = casaVitini.view.__sharedMethods__.servicioUI({
                                servicioUID,
                                contenedor
                            })
                            servicioUI.setAttribute("estadoServicio", "selCompleta")
                            servicioUI.querySelector("[componente=indicadorSelecion]").style.background = "rgb(0, 255, 0)"

                            constructor.appendChild(servicioUI)
                            const opcionesSel = servicio.opcionesSel

                            Object.entries(opcionesSel).forEach(([grupoIDV, contenedorSel]) => {
                                const selectorGrupo = servicioUI.querySelector(`[grupoIDV="${grupoIDV}"]`)
                                contenedorSel.forEach(opcionIDV => {
                                    const selectorOpcion = selectorGrupo.querySelector(`[opcionIDV="${opcionIDV}"]`)
                                    selectorOpcion.setAttribute("estado", "activado")
                                    selectorOpcion.querySelector("[componente=indicadorSelecion]").style.background = "rgb(0, 255, 0)"
                                })
                            })

                            const botonInsertar = document.createElement("div")
                            botonInsertar.classList.add("botonV1BlancoIzquierda")
                            botonInsertar.textContent = "Actualizar servicio en simulacion"
                            botonInsertar.setAttribute("boton", "volver")
                            botonInsertar.addEventListener("click", (e) => {
                                const servicioUI_selector = e.target.closest("[componente=contenedor]").querySelector("[servicioUID]")

                                const servicioUID = servicioUI_selector.getAttribute("servicioUID")
                                const grupoDeOpciones = servicioUI_selector.querySelector("[area=grupoOpciones]").querySelectorAll("[componente=grupo]")
                                const opcionesSeleccionadasDelServicio = {
                                    servicioUID,
                                    opcionesSeleccionadas: {}
                                }
                                const opcionesSeleccionadas = opcionesSeleccionadasDelServicio.opcionesSeleccionadas
                                grupoDeOpciones.forEach((grupo) => {
                                    const grupoIDV = grupo.getAttribute("grupoIDV")
                                    opcionesSeleccionadas[grupoIDV] = []

                                    const opcionesDelGrupoSeleccionadas = grupo.querySelectorAll("[selector=opcion][estado=activado]")
                                    opcionesDelGrupoSeleccionadas.forEach(opcionSel => {
                                        const opcionIDV = opcionSel.getAttribute("opcionIDV")
                                        opcionesSeleccionadas[grupoIDV].push(opcionIDV)
                                    })
                                })

                                // Poner una advertenc  ia superpuesta para al espera.
                                this.confirmarActualizar({
                                    servicioUID_enSimulacion,
                                    simulacionUID,
                                    instanciaUID_UIFlotanteServicios,
                                    instanciaUID_contenedorServicios,
                                    opcionesSeleccionadasDelServicio
                                })
                            })
                            constructor.appendChild(botonInsertar)
                        }
                    },
                    confirmarActualizar: async function (data) {
                        const simulacionUID = data.simulacionUID
                        const servicioUID_enSimulacion = String(data.servicioUID_enSimulacion)
                        const instanciaUID_UIFlotanteServicios = data.instanciaUID_UIFlotanteServicios
                        const instanciaUID_contenedorServicios = data.instanciaUID_contenedorServicios
                        const opcionesSeleccionadasDelServicio = data.opcionesSeleccionadasDelServicio

                        const instanciaPantallaCarga = casaVitini.utilidades.codigoFechaInstancia()
                        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
                            mensaje: "Actualizando el servicio en la simulación",
                            textoBoton: "ocultar",
                            instanciaUID: instanciaPantallaCarga
                        })

                        const respuestaServidor = await casaVitini.shell.servidor({
                            zona: "administracion/simuladorDePrecios/servicios/actualizarServicioEnSimulacion",
                            simulacionUID,
                            servicioUID_enSimulacion,
                            opcionesSeleccionadasDelServicio
                        })


                        document.querySelector(`[instanciaUID="${instanciaPantallaCarga}"]`).remove()
                        if (respuestaServidor?.error) {
                            return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                        }
                        if (respuestaServidor?.ok) {

                            const servicioData = respuestaServidor.servicio
                            const servicioUID_enSimulacion = servicioData.servicioUID
                            const nombreInterno = servicioData.nombre
                            const contenedor = servicioData.contenedor
                            const opcionesSel = servicioData.opcionesSel
                            const desgloseFinanciero = respuestaServidor?.desgloseFinanciero

                            const selectorContenedorServicios = document.querySelector(`[simulacionUID="${simulacionUID}"] [contenedor=servicios]`)
                            if (!selectorContenedorServicios) {
                                return
                            }

                            const servicioUI = casaVitini.view.componentes.servicios.componentesUI.servicioUI({
                                servicioUID_enSimulacion: servicioUID_enSimulacion,
                                instanciaUID_contenedorServicios: "contenedorServicios",
                                nombreInterno: nombreInterno,
                                contenedor: contenedor,
                                opcionesSeleccionadas: opcionesSel

                            })
                            const selectorInfo = selectorContenedorServicios.querySelector("[componente=contenedorInfoSinServicios]")
                            selectorInfo?.remove()

                            const selectorListaServicios = selectorContenedorServicios.querySelector("[componente=contenedorListaServiciosEnReserva]")

                            const selContenedorServicio = selectorListaServicios.querySelector(`[servicioUID_enSimulacion="${servicioUID_enSimulacion}"]`)
                            selectorListaServicios.replaceChild(servicioUI, selContenedorServicio);

                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            if (desgloseFinanciero) {
                                casaVitini.ui.componentes.contenedorFinanciero.constructor({
                                    destino: `[simulacionUID="${simulacionUID}"] [contenedor=simulacion]`,
                                    contenedorFinanciero: { desgloseFinanciero },
                                    modoUI: "simulador"
                                })
                            }
                        }

                    },
                },
            },
            actualizarContenedor: function (data) {
                const servicios = data.servicios
                const simulacionUID = data.simulacionUID
                const simulacionUI = document.querySelector("[simulacionUID]")
                const contenedorListaServicios = simulacionUI.querySelector(`[componente=contenedorListaServiciosEnReserva]`)
                contenedorListaServicios.innerHTML = null

                if (servicios.length === 0) {
                    const contenedorServicios = simulacionUI.querySelector(`[contenedor=servicios]`)
                    const infoSinEnlaces_selector = contenedorServicios.querySelector("[componente=contenedorInfoSinServicios]")
                    if (!infoSinEnlaces_selector) {
                        const infoSinEnlaces = casaVitini.view.componentes.servicios.componentesUI.infoSinServiciosUI()
                        contenedorServicios.appendChild(infoSinEnlaces)
                    }

                } else {
                    for (const servicioEnReserva of servicios) {
                        const servicioUI = casaVitini.view.componentes.servicios.componentesUI.servicioUI({
                            servicioUID_enSimulacion: servicioEnReserva.servicioUID,
                            instanciaUID_contenedorServicios: simulacionUID,
                            nombreInterno: servicioEnReserva.nombre,
                            contenedor: servicioEnReserva.contenedor,
                            opcionesSeleccionadas: servicioEnReserva.opcionesSel
                        })
                        contenedorListaServicios.appendChild(servicioUI)
                    }
                }


            },
        },
        contenedorCodigosDescuento: {
            infoInit: function () {
                const info = document.createElement("div")
                info.classList.add(
                    "flexVertical"
                )
                info.textContent = "Añada descuentos para verificarlos"
                return info
            },
            descuentoUI: function (data) {
                const descuentoBASE64 = data.descuentoBASE64

                const contenedor = document.createElement("div")
                contenedor.classList.add(
                    "flexVertical"
                )
                const info = document.createElement("p")
                info.textContent = descuentoBASE64
                contenedor.appendChild(info)

                const botonEliminar = document.createElement("p")
                botonEliminar.textContent = "Elimnar codigo descuento"
                contenedor.appendChild(botonEliminar)

                return contenedor
            },
            contenedorCampo: function (data) {

                const campoData = data?.campoData || ""

                const contenedor = document.createElement("div")
                contenedor.style.gridTemplateColumns = "1fr auto"
                contenedor.setAttribute("componente", "campoDescuento")
                contenedor.classList.add(
                    "gridHorizontal2C",
                    "gap6",
                    "padding6",
                    "borderRadius12",
                    "borderGrey1"
                )

                const campoCodigo = document.createElement("input")
                campoCodigo.setAttribute("campo", "codigoDescuento")
                campoCodigo.classList.add(
                    "padding10",
                    "borderRadius8",
                )
                campoCodigo.placeholder = "Inserta un codigo de descuento para comprobar"
                campoCodigo.value = campoData
                contenedor.appendChild(campoCodigo)

                const botonComprobar = document.createElement("div")
                botonComprobar.classList.add(
                    "padding10",
                    "borderRadius8",
                    "botonV1",
                )
                botonComprobar.textContent = "Eliminar"
                botonComprobar.addEventListener("click", (e) => {

                    const contenedorDescuentos = e.target.closest("[contenedor=codigosDescuento]")
                    const numeroCampos = contenedorDescuentos.querySelectorAll("[componente=campoDescuento]")
                    if (numeroCampos.length === 1) {
                        contenedorDescuentos.querySelector("[boton=comprobar]")?.remove()
                        const lista = contenedorDescuentos.querySelector("[contenedor=listaDescuentos]")
                        lista.style.display = "none"
                    }
                    const contenedorCampo = e.target.closest("[componente=campoDescuento]")
                    contenedorCampo?.remove()
                })
                contenedor.appendChild(botonComprobar)
                return contenedor
            },
            botonComprobar: function () {
                const boton = document.createElement("div")
                boton.setAttribute("boton", "comprobar")
                boton.classList.add(
                    "botonV1"
                )
                boton.textContent = "Comprobar codigo."
                boton.addEventListener("click", () => {
                    this.cribadoOfertas.ui()
                })
                return boton
            },
            cribadoOfertas: {
                ui: async function () {
                    const main = document.querySelector("main")
                    const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                    main.appendChild(ui)
                    const instanciaUID_cribadoOfertas = ui.getAttribute("instanciaUID")
                    const simulacionUID = main.querySelector("[simulacionUID]").getAttribute("simulacionUID")
                    const contenedorDescuentosSimulacion = main.querySelector("[contenedor=codigosDescuento]")
                    const selectorCamposCodigos = contenedorDescuentosSimulacion.querySelector("[contenedor=listaDescuentos]").querySelectorAll("[campo=codigoDescuento]")
                    const codigosDescuentosPorVerificar = []
                    selectorCamposCodigos.forEach((contenedor) => {
                        const campo = contenedor.value
                        if (campo.length > 0) {
                            codigosDescuentosPorVerificar.push(campo)
                        }
                    })

                    if (codigosDescuentosPorVerificar.length === 0) {
                        const m = "Escribe algún código en el campo de códigos, están todos vacíos."
                        return casaVitini.ui.componentes.advertenciaInmersiva(m)
                    }

                    const constructor = ui.querySelector("[componente=contenedor]")
                    const spinner = casaVitini.ui.componentes.spinner({
                        mensaje: "Obteniendo ofertas compatibles con los codigos de descuento...",
                        textoBoton: "Cancelar"
                    })
                    constructor.appendChild(spinner)

                    const respuestaServidor = await casaVitini.shell.servidor({
                        zona: "administracion/simuladorDePrecios/descuentos/comprobarCodigosEnSimulacion",
                        simulacionUID,
                        codigosDescuentos: codigosDescuentosPorVerificar
                    }
                    )


                    const uiRenderizada = document.querySelectorAll(`[instanciaUID="${instanciaUID_cribadoOfertas}"]`)
                    if (!uiRenderizada) { return }
                    spinner.remove()
                    if (respuestaServidor?.error) {
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                    }
                    if (respuestaServidor?.ok) {
                        constructor.appendChild(this.componentes.botonCancelar())
                        const ofertasCompatibles = respuestaServidor.ofertas.compatible
                        const ofertasIncompatibles = respuestaServidor.ofertas.incompatible







                        const contenedorOfertas = document.createElement("div")
                        contenedorOfertas.classList.add(
                            "maxWidth1280px",
                            "width100",
                            "flexVertical",
                            "gap6",
                        )
                        constructor.appendChild(contenedorOfertas)

                        const contenedorCompatibles = document.createElement("div")
                        contenedorCompatibles.classList.add(
                            "flexVertical",
                            "gap6"
                        )
                        if (ofertasCompatibles.length > 0) {
                            contenedorOfertas.appendChild(contenedorCompatibles)
                        }
                        const tituloCompatibles = document.createElement("p")
                        tituloCompatibles.classList.add(
                            "padding6"
                        )
                        tituloCompatibles.textContent = "Ofertas compatibles por código y el resto de condiciones. Estas ofertas son compatibles totalmente con la simulación. Puede añadirlas desde aquí."
                        contenedorCompatibles.appendChild(tituloCompatibles)

                        ofertasCompatibles.forEach((oferta) => {

                            const ofertaUI = this.componentes.ofertaUI({
                                contenedorOferta: oferta,
                                simulacionUID,
                                instanciaUID_cribadoOfertas
                            })
                            const enSimulacion = oferta?.enSimulacion
                            if (enSimulacion === "si") {
                                ofertaUI.querySelector("[boton=insertarOferta]")?.remove()
                                const info = document.createElement("p")
                                info.classList.add(
                                    "padding6"
                                )
                                info.textContent = "Esta oferta compatible ya está añadida a la simulación. Las ofertas basadas en condiciones solo se pueden añadir una vez. Si necesitas añadir esta oferta, puedes hacerlo administrativamente desde el contenedor financiero."
                                ofertaUI.appendChild(info)
                            }


                            contenedorCompatibles.appendChild(ofertaUI)
                        })

                        const contenedorIncompatibles = document.createElement("div")
                        contenedorIncompatibles.classList.add(
                            "flexVertical",
                            "gap6"
                        )
                        if (ofertasIncompatibles.length > 0) {
                            contenedorOfertas.appendChild(contenedorIncompatibles)
                        }

                        const tituloIncompatibles = document.createElement("p")
                        tituloIncompatibles.classList.add(
                            "padding6"
                        )
                        tituloIncompatibles.textContent = "Ofertas compatibles por código por no con el resto de condiciones. Las condiciones que no se cumplen están marcadas con un borde rojo."
                        contenedorIncompatibles.appendChild(tituloIncompatibles)


                        ofertasIncompatibles.forEach((oferta) => {
                            const condicionesQueNoSeCumple = oferta.condicionesQueNoSeCumple
                            const ofertaUI = this.componentes.ofertaUI({
                                contenedorOferta: oferta,
                                instanciaUID_cribadoOfertas
                            })
                            ofertaUI.querySelector("[boton=insertarOferta]")?.remove()
                            contenedorIncompatibles.appendChild(ofertaUI)

                            condicionesQueNoSeCumple.forEach((condicionIDV) => {

                                const selectorContenedorCondicion = ofertaUI.querySelector(`[tipoCondicion="${condicionIDV}"]`)
                                selectorContenedorCondicion.classList.add(
                                    "borderRadius12",
                                )
                                selectorContenedorCondicion.style.border = "1px solid red"
                            })


                        })

                        constructor.appendChild(this.componentes.botonCancelar())


                    }

                },
                componentes: {
                    condicionesUI: function (data) {
                        const condicionesArray = data.condicionesArray
                        const contenedorCondiciones = document.createElement("div")
                        contenedorCondiciones.setAttribute("contenedor", "condiciones")
                        contenedorCondiciones.classList.add(
                            "flexVertical",
                            "gap6",
                            "backgroundGrey1",
                            "padding6",
                            "borderRadius14"
                        )
                        const tituloContendor = document.createElement("div")
                        tituloContendor.classList.add(
                            "negrita",
                            "padding6",

                        )
                        tituloContendor.textContent = "Condiciones de la oferta"
                        contenedorCondiciones.appendChild(tituloContendor)

                        condicionesArray.forEach((condicion) => {
                            const tipoCondicion = condicion.tipoCondicion

                            const contenedorCondicion = document.createElement("div")
                            contenedorCondicion.classList.add("contenedorCondicion")
                            contenedorCondicion.setAttribute("tipoCondicion", tipoCondicion)
                            contenedorCondicion.classList.add(
                                "flexVertical",
                                "padding6",
                            )
                            const definicionCondicion = casaVitini
                                .ui
                                .componentes
                                .contenedorFinanciero
                                .componentesUI
                                .ofertas
                                .componentesUI
                                .definicionCondiciones({
                                    tipoCondicion,
                                    condicion
                                })
                            contenedorCondicion.appendChild(definicionCondicion)
                            contenedorCondiciones.appendChild(contenedorCondicion)
                        })
                        return contenedorCondiciones

                    },
                    ofertaUI: function (data) {

                        const contenedorOferta = data.contenedorOferta
                        const simulacionUID = data.simulacionUID
                        const instanciaUID_cribadoOfertas = data.instanciaUID_cribadoOfertas

                        const ofertaData = contenedorOferta.oferta
                        const nombreOferta = ofertaData.nombreOferta
                        const ofertaUID = ofertaData.ofertaUID
                        const fechaInicio = ofertaData.fechaInicio
                        const fechaFinal = ofertaData.fechaFinal
                        const estadoIDV = ofertaData.estadoIDV
                        const zonaIDV = ofertaData.zonaIDV
                        const condicionesArray = ofertaData.condicionesArray


                        const estadoUI_ = (estadoIDV) => {

                            if (estadoIDV === "activado") {
                                return "Activada"
                            } else if (estadoIDV === "desactivado") {
                                return "Desactivada"
                            }

                        }

                        const contenedorOfertaUI = document.createElement("div")
                        contenedorOfertaUI.setAttribute("ofertaUID", ofertaUID)
                        contenedorOfertaUI.classList.add(
                            "borderRadius12",
                            "width100",
                            "flexVertical",
                            "backgroundGrey1",
                            "padding6",
                            "gap6"
                        )

                        const contenedorGlobal = document.createElement("div")
                        contenedorGlobal.classList.add(
                            "flexVertical",
                            "padding12",
                            "gap6"
                        )

                        const nombreOfertaUI = document.createElement("div")
                        nombreOfertaUI.classList.add("negrita")
                        nombreOfertaUI.textContent = nombreOferta
                        contenedorGlobal.appendChild(nombreOfertaUI)

                        const estadoTitulo = document.createElement("div")
                        estadoTitulo.textContent = "Estado de la oferta"
                        contenedorGlobal.appendChild(estadoTitulo)


                        const estadoUI = document.createElement("div")
                        estadoUI.classList.add("negrita")
                        estadoUI.textContent = estadoUI_(estadoIDV)
                        contenedorGlobal.appendChild(estadoUI)
                        contenedorOfertaUI.appendChild(contenedorGlobal)

                        const descuentosUI = this.condicionesUI({ condicionesArray })
                        contenedorOfertaUI.appendChild(descuentosUI)

                        const contendorBotones = document.createElement("div")
                        contendorBotones.classList.add(
                            "flexHorizontal",
                            "gap6",
                        )

                        const botonInsertar = document.createElement("div")
                        botonInsertar.setAttribute("boton", "insertarOferta")
                        botonInsertar.classList.add(
                            "borderRadius8",
                            "backgroundGrey1",
                            "comportamientoBoton",
                            "padding8"
                        )
                        botonInsertar.textContent = "Insertar descuento en la reserva"
                        botonInsertar.addEventListener("click", () => {
                            this.confirmarInsertar({
                                simulacionUID,
                                ofertaUID,
                                instanciaUID_cribadoOfertas,
                            })

                        })
                        contendorBotones.appendChild(botonInsertar)

                        const botonVerOferta = document.createElement("a")
                        botonVerOferta.classList.add(
                            "borderRadius8",
                            "backgroundGrey1",
                            "comportamientoBoton",
                            "padding8",
                            "limpiezaBotonA"
                        )
                        botonVerOferta.textContent = "Ir a la oferta"
                        botonVerOferta.setAttribute("href", "/administracion/gestion_de_ofertas/oferta:" + ofertaUID)
                        botonVerOferta.setAttribute("vista", "/administracion/gestion_de_ofertas/oferta:" + ofertaUID)
                        botonVerOferta.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                        contendorBotones.appendChild(botonVerOferta)

                        contenedorOfertaUI.appendChild(contendorBotones)

                        return contenedorOfertaUI
                    },
                    botonCancelar: function () {
                        const botonCancelar = document.createElement("div")
                        botonCancelar.classList.add("boton")
                        botonCancelar.setAttribute("boton", "cancelar")
                        botonCancelar.textContent = "Cerrar y volver a la simulación"
                        botonCancelar.addEventListener("click", () => {
                            return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        })
                        return botonCancelar
                    },
                    confirmarInsertar: async function (data) {
                        const simulacionUID = data.simulacionUID
                        const ofertaUID = String(data.ofertaUID)
                        const instanciaUID_cribadoOfertas = data.instanciaUID_cribadoOfertas
                        const main = document.querySelector("main")
                        const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                        const instanciaUID = ui.getAttribute("instanciaUID")
                        main.appendChild(ui)
                        const contenedor = ui.querySelector("[componente=contenedor]")
                        contenedor.innerHTML = null

                        const spinner = casaVitini.ui.componentes.spinner({
                            mensaje: "Insertando oferta en la simulación..."
                        })
                        contenedor.appendChild(spinner)

                        const transaccion = {
                            zona: "administracion/simuladorDePrecios/descuentos/insertarDescuentoPorCompatiblePorCodigo",
                            simulacionUID: String(simulacionUID),
                            ofertaUID,
                            codigosDescuentos: [
                                "ey"
                            ]
                        }
                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        const uiRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                        uiRenderizada?.remove()


                        if (respuestaServidor?.error) {
                            return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                        }

                        if (respuestaServidor?.ok) {
                            const uiOfertaEnInstancia = document.querySelector(`[instanciaUID="${instanciaUID_cribadoOfertas}"] [ofertaUID="${ofertaUID}"]`)
                            if (uiOfertaEnInstancia) {
                                uiOfertaEnInstancia.querySelector("[boton=insertarOferta]")?.remove()
                                const info = document.createElement("p")
                                info.classList.add(
                                    "padding6"
                                )
                                info.textContent = "Oferta recién añadida correctamente a la simulación. No se puede volver a añadir una oferta basada en condiciones. Para añadir una oferta arbitrariamente, hazlo mediante el botón de añadir ofertas administrativamente en la sección ofertas del contenedor financiero de la simulación."
                                uiOfertaEnInstancia.appendChild(info)


                            }
                            const uiSimulacion = document.querySelector(`[simulacionUID="${simulacionUID}"]`)

                            if (uiSimulacion) {
                                const desgloseFinanciero = respuestaServidor?.desgloseFinanciero

                                if (desgloseFinanciero) {
                                    casaVitini.ui.componentes.contenedorFinanciero.constructor({
                                        destino: `[simulacionUID="${simulacionUID}"] [contenedor=simulacion]`,
                                        contenedorFinanciero: { desgloseFinanciero },
                                        modoUI: "simulador"
                                    })
                                }
                            }

                        }

                    },
                }
            }
        },
        pasarelaSelectorDia: function (e) {
            const d = {
                unico: "[nombreContenedor=rangoUnico][calendario=unico]",
                entrada: "[nombreContenedor=rangoDeSimulacion][calendario=entrada]",
                salida: "[nombreContenedor=rangoDeSimulacion][calendario=salida]",
            }
            const tipoCalendario = e.target.closest("[tipoCalendario]").getAttribute("tipoCalendario")
            const selectorContenedorFecha = document.querySelector(d[tipoCalendario])
            const fechaRecovery_ISO = selectorContenedorFecha?.getAttribute("memoriaVolatil")
            const fechaRecovery_humana = selectorContenedorFecha?.querySelector("[fechaUI]").textContent

            casaVitini.ui.componentes.calendario.calendarioCompartido.seleccionarDia(e)
            this.actualizaSimulacion({
                selectorRecovery: d[tipoCalendario],
                fechaRecovery_ISO,
                fechaRecovery_humana
            })
        },
        infoLllavesFaltantes: function (data) {
            const simulacionUID = data.simulacionUID
            const info = data.info
            const llavesFaltantes = data.llavesFaltantes

            const contenedorDesgloseFinancniero = document.querySelector(`[simulacionUID="${simulacionUID}"] [zonaSimulacion=desgloseFinanciero]`)
            const contenedorFinancieroRenderizado = contenedorDesgloseFinancniero.querySelector("[contenedor=financiero]")
            contenedorFinancieroRenderizado?.remove()

            const dictLlaves = {
                fechaCreacion: "Falta establecer la fecha de creación simulada",
                fechaEntrada: "Falta establecer la fecha de entrada",
                fechaSalida: "Falta establecer la fecha de salida",
                zonaIDV: "Falta establecer la zona simulada",
                alojamiento: "Falta insertar algun alojamiento en la simulación"
            }

            const infoRenderizado = contenedorDesgloseFinancniero.querySelector("[info=llavesFaltantes]")
            if (!infoRenderizado) {
                const infoLlavesFaltantes = document.createElement("div")
                infoLlavesFaltantes.setAttribute("info", "llavesFaltantes")
                infoLlavesFaltantes.classList.add("flexVertical", "padding18", "borderRadius20", "backgroundGrey1")
                infoLlavesFaltantes.textContent = info
                contenedorDesgloseFinancniero.appendChild(infoLlavesFaltantes)
            }
            const infoRenderizado_sel = contenedorDesgloseFinancniero.querySelector("[info=llavesFaltantes]")
            const llavesObsoletas = infoRenderizado_sel.querySelectorAll("[info=llaveUI]")
            llavesObsoletas.forEach(lO => lO?.remove())

            llavesFaltantes.forEach(lF => {

                const explicacionUI = document.createElement("div")
                explicacionUI.setAttribute("info", "llaveUI")
                explicacionUI.classList.add("negrita")
                explicacionUI.textContent = dictLlaves[lF]
                infoRenderizado_sel.appendChild(explicacionUI)
            })
        }
    },
}