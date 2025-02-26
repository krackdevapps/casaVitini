casaVitini.view = {
    start: function () {
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const comandoInicial = granuladoURL.directorios[granuladoURL.directorios.length - 1]
        const main = document.querySelector("main")
        if (granuladoURL.parametros.servicio) {
            this.detallesServicio.arranque(granuladoURL.parametros.servicio)
        } else if (comandoInicial === "servicios") {
            this.portada.arranque()
        } else {
            casaVitini.ui.componentes.urlDesconocida()
        }
    },
    portada: {
        arranque: function () {
            const granuladoURL = casaVitini.utilidades.granuladorURL()
            this.contenedorBotones()

            const parametrosFormatoURL = granuladoURL.parametros
            const parametrosFormatoIDV = {}
            Object.entries(parametrosFormatoURL).forEach(([nombreParametroURL, valorParametroURL]) => {
                const nombreParametroIDV = casaVitini.utilidades.cadenas.snakeToCamel(nombreParametroURL)
                let nombreColumnaIDV
                if ((valorParametroURL)?.toLowerCase() === "servicio") {
                    nombreColumnaIDV = "servicioUID"
                } else if ((valorParametroURL)?.toLowerCase() === "estado") {
                    nombreColumnaIDV = "estadoIDV"
                } else if ((valorParametroURL)?.toLowerCase() === "zona") {
                    nombreColumnaIDV = "zonaIDV"
                } else if (valorParametroURL) {
                    nombreColumnaIDV = casaVitini.utilidades.cadenas.snakeToCamel(valorParametroURL)
                }
                parametrosFormatoIDV[nombreParametroIDV] = nombreColumnaIDV

            })
            this.mostrarServiciosResueltos(parametrosFormatoIDV)

        },
        contenedorBotones: function () {
            const espacio = document.querySelector("[componente=espacio]")
            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add("contenedorBotonesGlobales")
            contenedorBotones.setAttribute("componente", "contenedorBotonesServicios")
            const boton = document.createElement("a")
            boton.classList.add("botonV1")
            boton.textContent = "Crear servicio"
            boton.setAttribute("href", "/administracion/servicios/nuevo")
            boton.setAttribute("vista", "/administracion/servicios/nuevo")
            boton.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            contenedorBotones.appendChild(boton)
            espacio.appendChild(contenedorBotones)
        },
        mostrarServiciosResueltos: async function (listarServicios) {

            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const selectorEspacio = document.querySelector("[componente=espacio]")
            selectorEspacio.setAttribute("instanciaBusqueda", instanciaUID)

            const granuladoURL = casaVitini.utilidades.granuladorURL()
            const transaccion = {
                zona: "administracion/servicios/listaServiciosPaginados",
                origen: "url",
                tipoConstruccionGrid: "total",
                ...listarServicios
            }

            transaccion.pagina = transaccion.pagina ? Number(transaccion.pagina) : 1
            const paginaTipo = transaccion.paginaTipo
            let nombreColumnaURL
            const nombreColumna = transaccion.nombreColumna
            if ((nombreColumna)?.toLowerCase() === "serviciouid") {
                nombreColumnaURL = "servicio"
            } else if ((nombreColumna)?.toLowerCase() === "estadoidv") {
                nombreColumnaURL = "estado"
            } else if ((nombreColumna)?.toLowerCase() === "zonaidv") {
                nombreColumnaURL = "zona"
            } else if (nombreColumna) {
                nombreColumnaURL = casaVitini.utilidades.cadenas.camelToSnake(nombreColumna)
            }

            if (transaccion.sentido_columna) {
                transaccion.sentidoColumna = transaccion.sentido_columna
                delete transaccion.sentido_columna
            }
            const origen = transaccion.origen
            delete transaccion.origen
            const tipoConstruccionGrid = transaccion.tipoConstruccionGrid
            delete transaccion.tipoConstruccionGrid
            const peticion = {
                zona: "administracion/servicios/listaServiciosPaginados",
                pagina: transaccion.pagina,
            }
            if (transaccion.nombreColumna) {
                peticion.nombreColumna = transaccion.nombreColumna
            }
            if (transaccion.sentidoColumna) {
                peticion.sentidoColumna = transaccion.sentidoColumna
            }
            const respuestaServidor = await casaVitini.shell.servidor(peticion)

            const instanciaRenderizada = document.querySelector(`[instanciaBusqueda="${instanciaUID}"]`)
            if (!instanciaRenderizada) {
                return
            }
            if (respuestaServidor?.error) {
                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }

            if (respuestaServidor?.totalServicios === 0) {
                const espacioClientes = document.querySelector("[componente=espacio]")
                document.querySelector("[gridUID=gridServicios]")?.remove()
                document.querySelector("[componente=estadoBusqueda]")?.remove()
                const estadoBusquedaUI = document.createElement("div")
                estadoBusquedaUI.classList.add("buscadorClientesEstadoBusqueda")
                estadoBusquedaUI.setAttribute("componente", "estadoBusqueda")
                estadoBusquedaUI.textContent = "No hay servicios configurados"
                espacioClientes.appendChild(estadoBusquedaUI)
                return

            }
            const servicios = respuestaServidor.servicios

            const dicccionario = {
                estados: {
                    activado: "Activado",
                    desactivado: "Desactivado"
                }
            }

            for (const detallesDelServicio of servicios) {
                const estadoIDV = detallesDelServicio.estadoIDV
                detallesDelServicio.estadoIDV = dicccionario.estados[estadoIDV]
            }
            const sentidoColumna = respuestaServidor.sentidoColumna

            const pagina = respuestaServidor.pagina
            const paginasTotales = respuestaServidor.paginasTotales
            const columnasGrid = [
                {
                    columnaUI: "UID",
                    columnaIDV: "servicioUID",
                },
                {
                    columnaUI: "Nombre",
                    columnaIDV: "nombre",
                },
                {
                    columnaUI: "Zona",
                    columnaIDV: "zonaIDV",
                },
                {
                    columnaUI: "Estado",
                    columnaIDV: "estadoIDV",
                },

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
            casaVitini.view.__sharedMethods__.grid.despliegue({
                metodoSalida: "view.portada.mostrarServiciosResueltos",
                configuracionGrid: {
                    filas: servicios,
                    sentidoColumna: sentidoColumna,
                    nombreColumna: nombreColumna,
                    pagina: pagina,
                    destino: "[componente=espacio]",
                    columnasGrid: columnasGrid,
                    gridUID: "gridServicios",
                    mascaraURL: {
                        mascara: "/administracion/servicios/servicio:",
                        parametro: "servicioUID"
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

            const titulo = "Administrar reservas"
            const estado = {
                zona: constructorURLFinal,
                EstadoInternoZona: "estado",
                tipoCambio: "parcial",
                componenteExistente: "contenedorBotonesServicios",
                funcionPersonalizada: "view.portada.mostrarServiciosResueltos",
                args: transaccion
            }

            if (origen === "url" || origen === "botonMostrarReservas") {
                window.history.replaceState(estado, titulo, constructorURLFinal);
            } else if ((origen === "botonNumeroPagina" && paginaTipo === "otra") || origen === "tituloColumna") {
                window.history.pushState(estado, titulo, constructorURLFinal);
            } else if (origen === "botonNumeroPagina" && paginaTipo === "actual") {
                window.history.replaceState(estado, titulo, constructorURLFinal);
            }
        },
    },
    detallesServicio: {
        arranque: async function (servicioUID) {
            const instanciaUID = document.querySelector("main").getAttribute("instanciaUID")
            const transaccion = {
                zona: "administracion/servicios/detallesServicio",
                servicioUID: String(servicioUID)
            }
            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            const seccionRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
            if (!seccionRenderizada) { return }
            if (respuestaServidor?.error) {
                const info = {
                    titulo: "No existe ningúna servicio con ese identificador",
                    descripcion: "Revisa el identificador porque este servicio que buscas no existe. Quizás este identificador existió y borraste esta servicio.."
                }
                casaVitini.ui.componentes.mensajeSimple(info)
            } else if (respuestaServidor?.ok) {
                const servicio = respuestaServidor.ok

                const servicioUID = servicio.servicioUID
                const espacioServicios = document.querySelector("[componente=espacio]")
                espacioServicios.setAttribute("instantanea", JSON.stringify(servicio))
                espacioServicios.innerHTML = null

                const main = document.querySelector("main")
                main.setAttribute("zonaCSS", "/administracion/servicios/servicioUI")
                const servicioUI = casaVitini.view.__sharedMethods__.detalleUI({
                    modoUI: "editar"
                })
                servicioUI.setAttribute("servicioUID", servicioUID)
                espacioServicios.appendChild(servicioUI)
                this.aplicaData({
                    servicio: servicio,
                    instanciaUID_destino: instanciaUID
                })
                const botonesModificacion = casaVitini.view.__sharedMethods__.botonesDuranteModificacion()
                servicioUI.appendChild(botonesModificacion)
            }
        },
        aplicaData: function (data) {

            const servicio = data.servicio
            const instanciaUID_destino = data.instanciaUID_destino
            const servicioUID = servicio.servicioUID
            const nombre = servicio.nombre
            const zonaIDV = servicio.zonaIDV
            const contenedor = servicio.contenedor
            const estadoIDV = servicio.estadoIDV

            const servicioUI = document.querySelector(`[instanciaUID="${instanciaUID_destino}"]`)
            if (!servicioUI) { return }

            //servicioUI.querySelector("[componente=servicioUI]").setAttribute("servicioUID", servicioUID)

            if (estadoIDV === "desactivado") {
                servicioUI.querySelector("[componente=estadoServicio]").setAttribute("estadoServicio", estadoIDV)
                servicioUI.querySelector("[componente=estadoServicio]").style.background = "#ff000091"
                servicioUI.querySelector("[componente=estadoServicio]").innerHTML = "Servicio desactivado"
            }
            if (estadoIDV === "activado") {
                servicioUI.querySelector("[componente=estadoServicio]").setAttribute("estadoServicio", estadoIDV)
                servicioUI.querySelector("[componente=estadoServicio]").style.background = "#00ff006e"
                servicioUI.querySelector("[componente=estadoServicio]").innerHTML = "Servicio activado"
            }

            const duracionIDV = contenedor.duracionIDV
            const disponibilidadIDV = contenedor.disponibilidadIDV

            const tituloPublico = contenedor.tituloPublico
            const definicion = contenedor.definicion

            const fechaInicio = contenedor?.fechaInicio
            const fechaFinal = contenedor?.fechaFinal

            const selectorContenedorFechas = servicioUI.querySelector("[contenedor=fechas]")


            if (duracionIDV === "rango") {
                servicioUI.querySelector("[calendario=entrada]").setAttribute("memoriaVolatil", fechaInicio)
                servicioUI.querySelector("[calendario=salida]").setAttribute("memoriaVolatil", fechaFinal)

                const fechaInicio_humana = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaInicio)
                const fechaFinal_humana = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaFinal)
                const fechaInicioUI = servicioUI.querySelector("[calendario=entrada]").querySelector("[fechaUI]")
                fechaInicioUI.textContent = fechaInicio_humana

                const fechaFinalUI = servicioUI.querySelector("[calendario=salida]").querySelector("[fechaUI]")
                fechaFinalUI.textContent = fechaFinal_humana
                selectorContenedorFechas.style.display = "flex"
            } else if (duracionIDV === "permanente") {
                selectorContenedorFechas.style.display = "none"
            }








            const nombreServicioCampo = servicioUI.querySelector("[campo=nombreServicio]")
            nombreServicioCampo.value = nombre

            const zonaIDVSelector = servicioUI.querySelector("[campo=zonaIDV]")
            zonaIDVSelector.value = zonaIDV

            const duracionIDVSelector = servicioUI.querySelector("[campo=duracionIDV]")
            duracionIDVSelector.value = duracionIDV

            const disponibilidadIDVSelector = servicioUI.querySelector("[campo=disponibilidadIDV]")
            disponibilidadIDVSelector.value = disponibilidadIDV




            const tituloPublicoCampo = servicioUI.querySelector("[campo=tituloPublico]")
            tituloPublicoCampo.value = tituloPublico

            const definicionCampo = servicioUI.querySelector("[campo=definicion]")
            definicionCampo.value = definicion

            const componentesUI = casaVitini.view.__sharedMethods__.grupoDeOpciones
            const selectorContenedorGrupos = servicioUI.querySelector("[contenedor=grupos]")
            selectorContenedorGrupos.innerHTML = null

            const sinInfo = componentesUI.infoSinComplemento("No hay ningun grupo de opciones")
            selectorContenedorGrupos.appendChild(sinInfo)


            const gruposDeOpciones = contenedor.gruposDeOpciones
            Object.entries(gruposDeOpciones).forEach(([grupoIDV, go]) => {

                const gpUI = componentesUI.grupoUI()
                selectorContenedorGrupos.querySelector("[componente=sinInfo]")?.remove()
                selectorContenedorGrupos.appendChild(gpUI)

                gpUI.querySelector("[campo=nombreGrupo]").value = go.nombreGrupo

                const configuracionGrupo = go.configuracionGrupo


                Object.entries(configuracionGrupo).forEach(([configuracionIDV, arrayParametros]) => {
                    const confIDV = configuracionIDV
                    const confSeleccionada = arrayParametros

                    const areaSeleecion = gpUI.querySelector(`[area=seleccion][confIDV="${confIDV}"]`)
                    confSeleccionada.forEach((cs) => {
                        const opcionSeleccionada = areaSeleecion.querySelector(`[opcionIDV="${cs}"]`)
                        opcionSeleccionada.setAttribute("estado", "activado")
                        opcionSeleccionada.querySelector("[componente=indicadorSelecion]").style.background = "blue"
                    })
                })

                const opcionesGrupo = go.opcionesGrupo
                opcionesGrupo.forEach(og => {
                    const nombreOpcion = og.nombreOpcion
                    const precioOpcion = og.precioOpcion
                    const interruptorCantidad = og.interruptorCantidad


                    const ogUI = componentesUI.opcionDelGrupo()
                    ogUI.querySelector("[campo=nombreOpcion]").value = nombreOpcion
                    ogUI.querySelector("[campo=precioOpcion]").value = precioOpcion
                    ogUI.querySelector("[campo=interruptorCantidad]").value = interruptorCantidad


                    gpUI.querySelector("[componente=sinInfo]")?.remove()
                    gpUI.querySelector("[contenedor=opciones]").appendChild(ogUI)

                })


            })

            // Inyectar grupo
            // Inyectar nombrne grupo
            // inyectar configracion grupo
            // inyectac opcion
            // inyectar datos opcion





        },
        estadoUIControlador: async function (estado) {
            const servicioUID = document.querySelector("[servicioUID]")?.getAttribute("servicioUID")
            if (!servicioUID) {
                const error = "No se puede cambiar el estado del servicio porque no tiene un identificador único de servicio (servicioUID).Esto puede deberse a que aún no has creado la servicio o que la has borrado.Si estás creando una servicio, por favor asegúrate de crearlo pulsando el botón 'Crear servicio' antes de activarla."
                casaVitini.ui.componentes.advertenciaInmersiva(error)
            }
            const selectorEstado = document.querySelector("[componente=estadoServicio]")

            const estadoActualMemoriaVolatil = selectorEstado.textContent
            selectorEstado.textContent = "Esperando al servidor...."
            const estadoActual = estado.target.getAttribute("estadoServicio")
            let estadoOfertaPropuesto
            if (estadoActual === "desactivado") {
                estadoOfertaPropuesto = "activado"
            }
            if (estadoActual === "activado") {
                estadoOfertaPropuesto = "desactivado"
            }
            const transaccion = {
                zona: "administracion/servicios/actualizarEstadoServicio",
                servicioUID: String(servicioUID),
                estadoIDV: estadoOfertaPropuesto
            }

            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            if (!respuestaServidor) {
                selectorEstado.textContent = estadoActualMemoriaVolatil
                selectorEstado.setAttribute("estadoServicio", estadoActual)
            } else if (respuestaServidor?.error) {
                document.querySelector("[estadoServicio]").textContent = estadoActualMemoriaVolatil
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                const estadoIDV = respuestaServidor?.estadoIDV
                selectorEstado.setAttribute("estadoServicio", estadoIDV)
                let estadoUI
                if (estadoIDV === "activado") {
                    selectorEstado.style.background = "#00ff006e"
                    estadoUI = "Servicio activado"
                }
                if (estadoIDV === "desactivado") {
                    selectorEstado.style.background = "#ff000091"
                    estadoUI = "Servicio desactivado"
                }
                selectorEstado.textContent = estadoUI
            }
        },
        guardarCambios: async function () {
            const instanciaUID_pantallaEspera = casaVitini.utilidades.codigoFechaInstancia()
            const main = document.querySelector("main")
            const instanciaUID = main.getAttribute("instanciaUID")
            const servicioUID = main.querySelector("[componente=servicioUI]").getAttribute("servicioUID")

            const mensaje = "Actualizando servicio..."
            const datosPantallaSuperpuesta = {
                instanciaUID: instanciaUID_pantallaEspera,
                mensaje: mensaje
            }
            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
            const servicio = casaVitini.view.__sharedMethods__.constructorObjeto()

            const transaccion = {
                zona: "administracion/servicios/actualizarServicio",
                servicioUID: String(servicioUID),
                ...servicio
            }


            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            document.querySelector(`[instanciaUID="${instanciaUID_pantallaEspera}"]`)?.remove()
            const ui_espera = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
            if (!ui_espera) { return }
            if (respuestaServidor?.error) {
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                const servicioActualizado = respuestaServidor.servicioActualizado

                const servicioUI = document.querySelector("[componente=espacio]")
                servicioUI.setAttribute("instantanea", JSON.stringify(servicioActualizado))

                this.aplicaData({
                    servicio: servicioActualizado,
                    instanciaUID_destino: instanciaUID
                })
            }
        },
        eliminarServicio: {
            ui: function () {

                const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                pantallaInmersiva.style.justifyContent = "center"

                const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

                const titulo = constructor.querySelector("[componente=titulo]")
                titulo.textContent = "Confirmar eliminar el servicio"
                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                mensaje.textContent = "Var a eliminar el servicio y su aplicacion sera inmediata, ¿Estas de acuerdo ? "

                const botonAceptar = constructor.querySelector("[boton=aceptar]")
                botonAceptar.textContent = "Comfirmar la eliminación"
                botonAceptar.addEventListener("click", () => { this.confirmar() })
                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                botonCancelar.textContent = "Cancelar la eliminación"

                document.querySelector("main").appendChild(pantallaInmersiva)

            },
            confirmar: async function () {
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = "Eliminado el servicio..."
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const servicioUID = document.querySelector("[servicioUID]").getAttribute("servicioUID")
                const transaccion = {
                    zona: "administracion/servicios/eliminarServicio",
                    servicioUID: String(servicioUID)
                }
                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }
                instanciaRenderizada.remove()
                if (respuestaServidor?.error) {
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    const vista = `/administracion/servicios`
                    const navegacion = {
                        vista: vista,
                    }
                    casaVitini.shell.navegacion.controladorVista(navegacion)
                }
            }
        }

    },
}