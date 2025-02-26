casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        const urlRaw = window.location.pathname;
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const parametros = granuladoURL.parametros

        let url = urlRaw.toLowerCase()
        url = url.split("/")
        url = url.filter((url) => url)
        delete url[0]
        delete url[1]
        delete url[2]
        url = url.filter((url) => url)
        if (Object.keys(parametros).length === 0) {
            main.setAttribute("zonaCSS", "administracion/arquitectura_de_alojamiento/configuraciones")
            this.portadaUI()
        } else if (parametros.alojamiento) {
            this.detallesConfiguracion.arranque({
                parametros
            })
        }
    },
    portadaUI: async function () {
        const selectorEspacioConfiguracionDelALojamiento = document.querySelector(" [componente=espacioConfiguracionDelAlojamiento]")
        const espacioBotonesGlobales = document.createElement("div")
        espacioBotonesGlobales.classList.add("espacioBotonesGlobales")
        espacioBotonesGlobales.setAttribute("componente", "espacioBotonesGlobales")
        const botonCrearConfiguracion = document.createElement("a")
        botonCrearConfiguracion.classList.add("arquitecturaConfApartamento_portada_boton")
        botonCrearConfiguracion.textContent = "Crear nueva configuración de alojamiento"
        botonCrearConfiguracion.setAttribute("vista", "/administracion/arquitectura_del_alojamiento/configuraciones/crear")
        botonCrearConfiguracion.setAttribute("href", "/administracion/arquitectura_del_alojamiento/configuraciones/crear")
        botonCrearConfiguracion.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
        espacioBotonesGlobales.appendChild(botonCrearConfiguracion)
        selectorEspacioConfiguracionDelALojamiento.appendChild(espacioBotonesGlobales)
        const contenedorConfiguracionesPortada = document.createElement("div")
        contenedorConfiguracionesPortada.classList.add("adminsitracion_arquitectura_configruaciones_portada_contenedorCongfiguraciones")

        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "administracion/arquitectura/configuraciones/listarConfiguracionApartamentos"
        })
        if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const configuracionesApartamentos = respuestaServidor?.ok
            if (configuracionesApartamentos.length === 0) {
            }
            if (configuracionesApartamentos.length > 0) {
                for (const detalleApartamento of configuracionesApartamentos) {
                    const apartamentoIDV = detalleApartamento.apartamentoIDV
                    const apartamentoUI = detalleApartamento.apartamentoUI
                    const zonaIDV = detalleApartamento.zonaIDV
                    const estadoConfiguracion = detalleApartamento.estadoConfiguracion
                    let estadoConfiguracionUI
                    if (estadoConfiguracion === "activado") {
                        estadoConfiguracionUI = "Activado"
                    }
                    if (estadoConfiguracion === "desactivado") {
                        estadoConfiguracionUI = "Desactivado"
                    }
                    const zonaUI = {
                        privada: "Zona privada",
                        global: "Zona global",
                        publica: "Zona pública"
                    }
                    const contenedorApartamento = document.createElement("a")
                    contenedorApartamento.classList.add("arquitecturaConfiguracionesAlojamiento_contenedorConfiguracion")
                    contenedorApartamento.setAttribute("apartamentoIDV", apartamentoIDV)
                    contenedorApartamento.setAttribute("href", "/administracion/arquitectura_del_alojamiento/configuraciones/alojamiento:" + apartamentoIDV)
                    contenedorApartamento.setAttribute("vista", "/administracion/arquitectura_del_alojamiento/configuraciones/alojamiento:" + apartamentoIDV)
                    contenedorApartamento.addEventListener("click", (e) => { this.traductorCambioVista(e) })
                    const contenedorTitulo = document.createElement("div")
                    contenedorTitulo.classList.add("arquitecturaConfAlojamiento_configuracionesTitulo")
                    contenedorTitulo.classList.add("negrita")
                    contenedorTitulo.textContent = apartamentoUI
                    contenedorApartamento.appendChild(contenedorTitulo)
                    const contenedorExplicacion = document.createElement("div")
                    contenedorExplicacion.classList.add("arquitecturaConfAlojamiento_configuracionesTitulo")
                    contenedorExplicacion.textContent = estadoConfiguracionUI
                    contenedorApartamento.appendChild(contenedorExplicacion)
                    const zona = document.createElement("div")
                    zona.classList.add("arquitecturaConfAlojamiento_configuracionesTitulo")
                    zona.textContent = zonaUI[zonaIDV]
                    contenedorApartamento.appendChild(zona)
                    contenedorConfiguracionesPortada.appendChild(contenedorApartamento)
                }
                selectorEspacioConfiguracionDelALojamiento.appendChild(contenedorConfiguracionesPortada)
            }
        }
    },
    traductorCambioVista: function (configuracion) {
        configuracion.preventDefault()
        configuracion.stopPropagation()
        const vista = configuracion.target.closest("[vista]").getAttribute("vista")
        const entrada = {
            "vista": vista,
            "tipoOrigen": "menuNavegador"
        }
        casaVitini.shell.navegacion.controladorVista(entrada)
    },
    detallesConfiguracion: {
        arranque: function (data) {
            const main = document.querySelector("main")

            const parametros = data.parametros
            const alojamiento = parametros.alojamiento
            const zona = parametros.zona

            if (alojamiento && zona) {

                if (zona === "gestion_de_imagenes") {
                    this.zonas.gestionDeImagenes.galeriaImagenesApartamentos.arranque({
                        apartamentoIDV: alojamiento
                    })
                } else {
                    return casaVitini.ui.componentes.urlDesconocida()
                }
            } else if (alojamiento) {

                main.setAttribute("zonaCSS", "administracion/arquitectura_de_alojamiento/configuraciones/detalles")
                this.portadaUI({
                    apartamentoIDV: parametros.alojamiento
                })
            } else {
                return casaVitini.ui.componentes.urlDesconocida()
            }

        },
        portadaUI: async function (data) {
            const main = document.querySelector("main")
            const instanciaUID = main.getAttribute("instanciaUID")
            const apartamentoIDV = data.apartamentoIDV
            const selectorTitulo = document.querySelector(" [componente=titulo]")
            selectorTitulo.textContent = "Configuración del apartamento"
            document.querySelector("[componente=espacioConfiguracionDelAlojamiento]").style.gap = "0"
            const selectorEspacioConfiguracion = document.querySelector("[componente=espacioConfiguracionDelAlojamiento]")

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/arquitectura/configuraciones/detalleConfiguracionAlojamiento",
                apartamentoIDV: apartamentoIDV
            })

            const seccionRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
            if (!seccionRenderizada) { return }
            if (respuestaServidor?.error) {

                casaVitini.ui.componentes.mensajeSimple({
                    titulo: "No existe la configuración de alojamiento",
                    descripcion: respuestaServidor.error
                })
            }
            if (respuestaServidor?.ok) {


                const apartamentoIDV = respuestaServidor?.apartamentoIDV
                const apartamentoUI = respuestaServidor?.apartamentoUI
                const zonaIDV = respuestaServidor.zonaIDV
                const estadoConfiguracion = respuestaServidor?.estadoConfiguracion
                const habitaciones = respuestaServidor?.habitaciones

                let estadoConfiguracionUI
                if (estadoConfiguracion === "desactivado") {
                    estadoConfiguracionUI = "Desactivado"
                }
                if (estadoConfiguracion === "activado") {
                    estadoConfiguracionUI = "Activado"
                }
                let zonaUI
                if (zonaIDV === "publica") {
                    zonaUI = "Publica"
                }
                if (zonaIDV === "global") {
                    zonaUI = "Global"
                }
                if (zonaIDV === "privada") {
                    zonaUI = "Privada"
                }

                const contenedorApartamento = document.createElement("div")
                contenedorApartamento.classList.add("arquitecturaConfApartamento_contenedor")
                contenedorApartamento.setAttribute("apartamentoIDV", apartamentoIDV)
                contenedorApartamento.setAttribute("contenedor", "configuracionAlojamiento")

                const contenedorTituloYBoton = document.createElement("div")
                contenedorTituloYBoton.classList.add("arquitecturaConfApartamento_contenedorTituloYBotones")
                const tituloApartamento = document.createElement("div")
                tituloApartamento.classList.add("arquitecturaConfApartamento_titulo")
                tituloApartamento.classList.add("negrita")
                tituloApartamento.textContent = apartamentoUI
                contenedorTituloYBoton.appendChild(tituloApartamento)
                const contenedorBotonesGlobalesApartamento = document.createElement("div")
                contenedorBotonesGlobalesApartamento.classList.add("arquitecturaConfApartamento_contenedorBotonesGlobales")
                contenedorTituloYBoton.appendChild(contenedorBotonesGlobalesApartamento)

                const botonIrPerfilPrecio = document.createElement("a")
                botonIrPerfilPrecio.classList.add("arquitecturaConfApartamento_boton")
                botonIrPerfilPrecio.textContent = "Ir al perfil del precio"
                botonIrPerfilPrecio.setAttribute("vista", "/administracion/precios/apartamentos:" + apartamentoIDV)
                botonIrPerfilPrecio.setAttribute("href", "/administracion/precios/apartamentos:" + apartamentoIDV)
                botonIrPerfilPrecio.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                contenedorBotonesGlobalesApartamento.appendChild(botonIrPerfilPrecio)


                const botonIrALaEntidad = document.createElement("a")
                botonIrALaEntidad.classList.add("arquitecturaConfApartamento_boton")
                botonIrALaEntidad.textContent = "Ir a la entidad de alojamiento"
                botonIrALaEntidad.setAttribute("vista", "/administracion/arquitectura_del_alojamiento/entidades/editar_entidad/apartamento:" + apartamentoIDV)
                botonIrALaEntidad.setAttribute("href", "/administracion/arquitectura_del_alojamiento/entidades/editar_entidad/apartamento:" + apartamentoIDV)
                botonIrALaEntidad.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                contenedorBotonesGlobalesApartamento.appendChild(botonIrALaEntidad)


                const botonAddHabitacion = document.createElement("div")
                botonAddHabitacion.classList.add("arquitecturaConfApartamento_boton")
                botonAddHabitacion.textContent = "Añadir habitación"
                botonAddHabitacion.addEventListener("click", () => { this.addHabitacion.UI() })
                contenedorBotonesGlobalesApartamento.appendChild(botonAddHabitacion)
                const botonEstadoApartamento = document.createElement("div")
                botonEstadoApartamento.classList.add("arquitecturaConfApartamento_boton")
                botonEstadoApartamento.setAttribute("estadoActual", estadoConfiguracion)
                botonEstadoApartamento.addEventListener("click", (e) => {
                    const estadoActual = e.target.closest("[estadoActual]").getAttribute("estadoActual")

                    this.actualizarEstadoConfiguracion.UI({
                        estadoActual
                    })
                })
                const tituloEstado = document.createElement("p")
                tituloEstado.classList.add("arquitecturaConfApartamento_infoEstadoV")
                tituloEstado.classList.add("negrita")
                tituloEstado.textContent = "Estado"
                const infoEstado = document.createElement("p")
                infoEstado.classList.add("arquitecturaConfApartamento_infoEstado")
                infoEstado.classList.add("negrita")
                infoEstado.setAttribute("componente", "estadoActualUI")
                infoEstado.textContent = estadoConfiguracionUI
                botonEstadoApartamento.appendChild(infoEstado)
                contenedorBotonesGlobalesApartamento.appendChild(botonEstadoApartamento)

                const botonZonaPublicacion = document.createElement("div")
                botonZonaPublicacion.classList.add("arquitecturaConfApartamento_boton")
                botonZonaPublicacion.setAttribute("data", "zonaPublicacion")
                botonZonaPublicacion.textContent = zonaUI
                botonZonaPublicacion.addEventListener("click", () => {
                    this.gestionZona.ui({
                        apartamentoIDV
                    })
                })
                contenedorBotonesGlobalesApartamento.appendChild(botonZonaPublicacion)


                const botonEliminar = document.createElement("div")
                botonEliminar.classList.add("arquitecturaConfApartamento_boton")
                botonEliminar.textContent = "Eliminar configuración"
                botonEliminar.addEventListener("click", () => { this.eliminarConfiguracion.UI() })
                contenedorBotonesGlobalesApartamento.appendChild(botonEliminar)



                const botonIrPerfilPrecio1 = document.createElement("a")
                botonIrPerfilPrecio1.classList.add("arquitecturaConfApartamento_boton")
                botonIrPerfilPrecio1.textContent = "Gestión de imagenes del apartamento"
                botonIrPerfilPrecio1.setAttribute("vista", "/administracion/arquitectura_del_alojamiento/configuraciones/alojamiento:" + apartamentoIDV + "/zona:gestion_de_imagenes")
                botonIrPerfilPrecio1.setAttribute("href", "/administracion/arquitectura_del_alojamiento/configuraciones/alojamiento:" + apartamentoIDV + "/zona:gestion_de_imagenes")
                botonIrPerfilPrecio1.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                contenedorTituloYBoton.appendChild(botonIrPerfilPrecio1)


                contenedorApartamento.appendChild(contenedorTituloYBoton)
                const contenedorImg = document.createElement("div")
                contenedorImg.classList.add("arquitecturaConfApartamento_contenedorImg")
                contenedorImg.setAttribute("componente", "contenedorImagenConfiguracion")
                contenedorApartamento.appendChild(contenedorImg)
                const contenedorHabitaciones = document.createElement("div")
                contenedorHabitaciones.classList.add("arquitecturaConfApartamento_contenedorHabitaciones")
                contenedorHabitaciones.setAttribute("componente", "contenedorHabitaciones")
                for (const habitacion of habitaciones) {
                    const habitacionUID = habitacion.componenteUID
                    const habitacionIDV = habitacion.habitacionIDV
                    const habitacionUI = habitacion.habitacionUI
                    const camas = habitacion.camas
                    const metadatosHabitacion = {
                        habitacionUI: habitacionUI,
                        habitacionIDV: habitacionIDV,
                        habitacionUID: habitacionUID,
                    }

                    const contenedorHabitacionUI = this.componentesUI.habitacionUI(metadatosHabitacion)
                    const contenedorCamas = document.createElement("div")
                    contenedorCamas.classList.add("arquitecturaConfApartamento_contenedorCamas")
                    if (camas.length === 0) {

                        const infoNoCamas = this.componentesUI.noCamaInfoUI()
                        contenedorHabitacionUI.appendChild(infoNoCamas)
                    }
                    if (camas.length > 0) {
                        for (const detallesCama of camas) {
                            const tipoIDV = detallesCama.tipoIDV
                            const camaIDV = detallesCama.camaIDV
                            const camaUI = detallesCama.camaUI
                            const capacidad = detallesCama.capacidad
                            const camaUID = detallesCama.camaUID


                            const metadatosCama = {
                                tipoIDV: tipoIDV,
                                camaIDV: camaIDV,
                                camaUI: camaUI,
                                capacidad: capacidad,
                                camaUID: camaUID,
                            }
                            const contenedorCama = casaVitini.view.detallesConfiguracion.componentesUI.camaUI(metadatosCama)
                            contenedorHabitacionUI.appendChild(contenedorCama)
                        }
                    }

                    contenedorHabitaciones.appendChild(contenedorHabitacionUI)
                }
                contenedorApartamento.appendChild(contenedorHabitaciones)
                selectorEspacioConfiguracion.appendChild(contenedorApartamento)
                const contenedorBotonesGlobalesInferiores = document.createElement("div")
                contenedorBotonesGlobalesInferiores.classList.add("arquitecturaConfApartamento_espacioEliminarConfiguracionApartamento")
                const botonEliminarConfiguracion = document.createElement("div")
                botonEliminarConfiguracion.classList.add("botonV1")
                botonEliminarConfiguracion.textContent = "Eliminar configuración del apartamento"
                botonEliminarConfiguracion.addEventListener("click", () => { this.eliminarConfiguracion.UI() })
                contenedorBotonesGlobalesInferiores.appendChild(botonEliminarConfiguracion)
                const selectorEspacioGlobalConfiguracion = document.querySelector("[componente=espacioConfiguracionDelAlojamiento]")
                //    selectorEspacioGlobalConfiguracion.appendChild(contenedorBotonesGlobalesInferiores)


                this.zonas.gestionDeImagenes.gestionImagenPrinpicialDelAlojamiento.obtenerImgen({
                    apartamentoIDV,
                    instanciaUID
                })

            }
        },
        addHabitacion: {
            UI: async function () {
                const main = document.querySelector("main")
                const apartamentoIDV = document.querySelector("[apartamentoIDV]").getAttribute("apartamentoIDV")
                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                const instanciaUID = ui.getAttribute("instanciaUID")
                const contenedor = ui.querySelector("[componente=contenedor]")
                main.appendChild(ui)

                const spinner = casaVitini.ui.componentes.spinner({
                    mensaje: "Obteniendo habitaciones...",
                    textoBoton: "Cancelar"
                })
                contenedor.appendChild(spinner)
                // listarHabitacionesDisponiblesApartamentoConfiguracion
                const transaccion = {
                    zona: "administracion/arquitectura/configuraciones/listarHabitacionesDisponiblesApartamentoConfiguracion",
                    apartamentoIDV: apartamentoIDV
                }
                const respuestaServidor = await casaVitini.shell.servidor(transaccion)

                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }
                if (respuestaServidor?.error) {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    contenedor.innerHTML = null
                    const habitacionesDisponibles = respuestaServidor?.ok

                    if (habitacionesDisponibles.length === 0) {
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        const error = "Ya están todas las habitaciones insertadas en esta configuración de apartamento."
                        casaVitini.ui.componentes.advertenciaInmersiva(error)
                    }
                    if (habitacionesDisponibles.length > 0) {
                        for (const detallesHabitacion of habitacionesDisponibles) {
                            const habitacionIDV = detallesHabitacion.habitacionIDV
                            const habitacionUI = detallesHabitacion.habitacionUI
                            const tituloHabitacion = document.createElement("div")
                            tituloHabitacion.classList.add("botonV1BlancoIzquierda")
                            tituloHabitacion.setAttribute("habitacionIDV", habitacionIDV)
                            tituloHabitacion.addEventListener("click", (e) => { this.transactor(e) })
                            tituloHabitacion.textContent = habitacionUI
                            contenedor.appendChild(tituloHabitacion)
                        }
                    }

                    const botonCancelar = document.createElement("div")
                    botonCancelar.classList.add("boton")
                    botonCancelar.setAttribute("boton", "cancelar")
                    botonCancelar.textContent = "Cancelar y volver a tras"
                    botonCancelar.addEventListener("click", () => {
                        return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    })
                    contenedor.appendChild(botonCancelar)
                }
            },
            transactor: async function (habitacion) {
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = "Añadiendo cama ..."
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const apartamentoIDV = document.querySelector("[apartamentoIDV]").getAttribute("apartamentoIDV")
                const habitacionIDV = habitacion.target.getAttribute("habitacionIDV")
                const transaccion = {
                    zona: "administracion/arquitectura/configuraciones/addHabitacionToConfiguracionApartamento",
                    apartamentoIDV: apartamentoIDV,
                    habitacionIDV: habitacionIDV
                }
                const respuestaServidor = await casaVitini.shell.servidor(transaccion)

                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }
                instanciaRenderizada.remove()
                if (respuestaServidor?.error) {
                    return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()

                    const contenedorHabitacion = casaVitini.view.detallesConfiguracion.componentesUI.habitacionUI({
                        habitacionUID: respuestaServidor?.habitacionUID,
                        habitacionIDV: respuestaServidor?.habitacionIDV,
                        habitacionUI: respuestaServidor?.habitacionUI
                    })
                    const infoNoCamas = casaVitini.view.detallesConfiguracion.componentesUI.noCamaInfoUI()
                    contenedorHabitacion.appendChild(infoNoCamas)
                    const selectorContenedorHabitaciones = document.querySelector("[componente=contenedorHabitaciones]")
                    selectorContenedorHabitaciones.appendChild(contenedorHabitacion)
                }
            }
        },
        addCama: {
            UI: async function (data) {
                const habitacionUID = data.habitacionUID
                const main = document.querySelector("main")
                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                const instanciaUID = ui.getAttribute("instanciaUID")
                const contenedor = ui.querySelector("[componente=contenedor]")
                main.appendChild(ui)

                const spinner = casaVitini.ui.componentes.spinner({
                    mensaje: "Obteniendo camas...",
                    textoBoton: "Cancelar"
                })
                contenedor.appendChild(spinner)

                const transaccion = {
                    zona: "administracion/arquitectura/configuraciones/listarCamasDisponiblesApartamentoConfiguracion",
                    habitacionUID: String(habitacionUID)
                }

                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }

                if (respuestaServidor?.error) {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    contenedor.innerHTML = null
                    const camasDisponibles = respuestaServidor?.ok
                    if (camasDisponibles.length === 0) {
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        const error = "Ya están todas las camas insertadas en esta habitación"
                        casaVitini.ui.componentes.advertenciaInmersiva(error)
                    }
                    if (camasDisponibles.length > 0) {
                        contenedor.textContent = null
                        for (const detallesCama of camasDisponibles) {
                            const camaIDV = detallesCama.camaIDV
                            const camaUI = detallesCama.camaUI
                            const tituloHabitacion = document.createElement("div")
                            tituloHabitacion.classList.add("confApartamento_contenedorMenu_tituloApartamento")
                            tituloHabitacion.addEventListener("click", () => {
                                this.transactor({
                                    habitacionUID,
                                    camaIDV
                                })
                            })
                            tituloHabitacion.textContent = camaUI
                            contenedor.appendChild(tituloHabitacion)
                        }

                    }

                    const botonCancelar = document.createElement("div")
                    botonCancelar.classList.add("boton")
                    botonCancelar.setAttribute("boton", "cancelar")
                    botonCancelar.textContent = "Cancelar y volver a tras"
                    botonCancelar.addEventListener("click", () => {
                        return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    })
                    contenedor.appendChild(botonCancelar)
                }
            },
            transactor: async function (data) {

                const habitacionUID = data.habitacionUID
                const camaIDV = data.camaIDV
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = "Añadiendo cama..."
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const transaccion = {
                    zona: "administracion/arquitectura/configuraciones/addCamaToConfiguracionApartamentoHabitacion",
                    camaIDV: camaIDV,
                    habitacionUID: String(habitacionUID)
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
                    const metadatos = {
                        camaUID: respuestaServidor?.nuevoUID,
                        camaIDV: respuestaServidor?.camaIDV,
                        camaUI: respuestaServidor?.camaUI,
                        capacidad: respuestaServidor?.capaciad
                    }
                    const componenteCama = casaVitini.view.detallesConfiguracion.componentesUI.camaUI(metadatos)
                    const selectorContenedorHabitacion = document.querySelector(`[habitacionUID="${habitacionUID}"]`)
                    selectorContenedorHabitacion.querySelector("[componente=infoVolatilCamasHabitacion]")?.remove()
                    selectorContenedorHabitacion.appendChild(componenteCama)
                }
            }
        },
        eliminarConfiguracion: {
            UI: async function () {

                const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                pantallaInmersiva.style.justifyContent = "center"

                const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

                const titulo = constructor.querySelector("[componente=titulo]")
                titulo.textContent = "Eliminar configuración de alojamiento"
                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                mensaje.textContent = "Confirmar la eliminación de toda la configuración del apartamento. Esto implica la configuración del apartamento, el perfil de precios y los bloqueos vigentes. Si este apartamento aparece en un comportamiento de precios, será eliminado el apartamento del comportamiento de precios, pero el resto del comportamiento seguirá vigente a no ser que sea el único apartamento en algún comportamiento de precios. Sus implicaciones serán inmediatas. Si esta configuración de alojamiento aparece en alguna reserva activa, no se podrá eliminar por temas de integridad. Si necesita editar la configuración de alojamiento, puede hacerlo libremente. Si esta configuración de alojamiento aparece en alguna simulación u oferta, no se eliminará de estas. Tendrá que revisar las ofertas. Si elimina este apartamento y aparece en alguna oferta, no podrá insertar esa oferta en ninguna simulación o reserva hasta que no elimine la referencia en esa oferta. Si esta configuración de alojamiento aparece en alguna reserva no activa, como son las reservas canceladas o reservas del pasado, esta referencia no se eliminara porque las reservas mantiene su información en instantáneas propias."
                const botonAceptar = constructor.querySelector("[boton=aceptar]")
                botonAceptar.textContent = "Comfirmar la eliminación"
                botonAceptar.addEventListener("click", () => { this.confirmar() })
                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                botonCancelar.textContent = "Cancelar la eliminación"
                document.querySelector("main").appendChild(pantallaInmersiva)

            },
            confirmar: async function () {

                const apartamentoIDV = document.querySelector("[apartamentoIDV]").getAttribute("apartamentoIDV")
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = "Eliminado configuración de alojamiento..."

                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                })

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/arquitectura/configuraciones/eliminarConfiguracionDeAlojamiento",
                    apartamentoIDV: apartamentoIDV
                })

                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }
                instanciaRenderizada.remove()

                if (respuestaServidor?.error) {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    const reservasActivas = respuestaServidor.reservasActivas
                    const ofertas = respuestaServidor.ofertas


                    const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                    pantallaInmersiva.style.justifyContent = "center"

                    const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                    const contenedor = constructor.querySelector("[componente=contenedor]")

                    const titulo = constructor.querySelector("[componente=titulo]")
                    titulo.textContent = `No se puede borrar esta configuración de alojamiento`
                    const mensaje = constructor.querySelector("[componente=mensajeUI]")
                    mensaje.textContent = respuestaServidor?.error

                    const contenedorLista = document.createElement("div")
                    contenedorLista.classList.add(
                        "flexVertical",
                        "gap10",
                        "ratonDefault"
                    )

                    if (reservasActivas.length > 0 || ofertas.length > 0) {
                        contenedor.appendChild(contenedorLista)

                    }


                    const tituloUI = (data) => {

                        const titulo = document.createElement("div")
                        titulo.classList.add("textoCentrado", "padding10", "negrita")
                        titulo.textContent = data
                        return titulo

                    }

                    if (reservasActivas.length > 0) {
                        contenedorLista.appendChild(tituloUI("Reservas donde se encuentra al configuración de alojamiento"))
                    }

                    reservasActivas.forEach(reservaActiva => {
                        const reservaUID = reservaActiva.reservaUID
                        const apartamentoUI = reservaActiva.apartamentoUI

                        const reservaActivaContenedorUI = document.createElement("a")
                        reservaActivaContenedorUI.classList.add(
                            "borderRadius10",
                            "areaSinDecoracionPredeterminada",
                            "backgroundGrey1",
                            "padding12",
                            "comportamientoBoton",
                            "ratonDefault"
                        )
                        reservaActivaContenedorUI.setAttribute("href", `/administracion/reservas/reserva:${reservaUID}/alojamiento`)
                        reservaActivaContenedorUI.setAttribute("vista", `/administracion/reservas/reserva:${reservaUID}/alojamiento`)
                        reservaActivaContenedorUI.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                        contenedorLista.appendChild(reservaActivaContenedorUI)

                        const titulo = document.createElement("div")
                        titulo.textContent = "Reserva UID"
                        reservaActivaContenedorUI.appendChild(titulo)

                        const reservaIdentificador = document.createElement("div")
                        reservaIdentificador.classList.add(
                            "negrita"
                        )
                        reservaIdentificador.textContent = reservaUID
                        reservaActivaContenedorUI.appendChild(reservaIdentificador)
                    })

                    if (reservasActivas.length > 0) {
                        contenedorLista.appendChild(tituloUI("Ofertas donde se encuentra al configuración de alojamiento"))
                    }

                    ofertas.forEach(oferta => {
                        const ofertaUID = oferta.ofertaUID
                        const nombreOferta = oferta.nombreOferta

                        const reservaActivaContenedorUI = document.createElement("a")
                        reservaActivaContenedorUI.classList.add(
                            "borderRadius10",
                            "areaSinDecoracionPredeterminada",
                            "backgroundGrey1",
                            "padding12",
                            "comportamientoBoton",
                            "ratonDefault"
                        )
                        reservaActivaContenedorUI.setAttribute("href", `/administracion/gestion_de_ofertas/oferta:${ofertaUID}`)
                        reservaActivaContenedorUI.setAttribute("vista", `/administracion/gestion_de_ofertas/oferta:${ofertaUID}`)
                        reservaActivaContenedorUI.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                        contenedorLista.appendChild(reservaActivaContenedorUI)

                        const tituloUID = document.createElement("div")
                        tituloUID.textContent = "Oferta UID"
                        reservaActivaContenedorUI.appendChild(tituloUID)

                        const reservaIdentificador = document.createElement("div")
                        reservaIdentificador.classList.add(
                            "negrita"
                        )
                        reservaIdentificador.textContent = ofertaUID
                        reservaActivaContenedorUI.appendChild(reservaIdentificador)

                        const nombreOfertaUI = document.createElement("div")
                        nombreOfertaUI.classList.add(
                            "negrita"
                        )
                        nombreOfertaUI.textContent = nombreOferta
                        reservaActivaContenedorUI.appendChild(nombreOfertaUI)
                    })
                    const botonAceptar = constructor.querySelector("[boton=aceptar]")
                    botonAceptar.remove()


                    const botonCancelar = constructor.querySelector("[boton=cancelar]")
                    botonCancelar.textContent = "Volver"
                    document.querySelector("main").appendChild(pantallaInmersiva)

                }
                if (respuestaServidor?.ok) {
                    const selectorAdvertenciaInmersiva = document.querySelectorAll("[componente=advertenciaInmersiva]")
                    selectorAdvertenciaInmersiva.forEach((advertenciaInmersiva) => {
                        advertenciaInmersiva.remove()
                    })
                    const navegacion = {
                        "vista": "/administracion/arquitectura_del_alojamiento/configuraciones",
                        "tipoOrigen": "menuNavegador"
                    }
                    casaVitini.shell.navegacion.controladorVista(navegacion)
                }
            }
        },
        eliminarHabitacion: {
            UI: async function (data) {

                const habitacionUID = data.habitacionUID
                const habitacionUI = data.habitacionUI

                const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                pantallaInmersiva.style.justifyContent = "center"

                const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                const instanciaUID = pantallaInmersiva.getAttribute("instanciaUID")

                const titulo = constructor.querySelector("[componente=titulo]")
                titulo.textContent = `Eliminar ${habitacionUI}`
                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                mensaje.textContent = `Confirmas eliminar ${habitacionUI} con identificador universal ${habitacionUID}`

                const botonAceptar = constructor.querySelector("[boton=aceptar]")
                botonAceptar.textContent = `Comfirmar y eliminar ${habitacionUI}`
                botonAceptar.addEventListener("click", () => {
                    this.confirmar({
                        habitacionUID,
                        instanciaUID
                    })
                })
                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                botonCancelar.textContent = "Cancelar y volver"
                document.querySelector("main").appendChild(pantallaInmersiva)
            },
            confirmar: async function (data) {
                const habitacionUID = data.habitacionUID
                const instanciaUID_pro = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = "Eliminando habitación..."
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID_pro,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const transaccion = {
                    zona: "administracion/arquitectura/configuraciones/eliminarHabitacionDeConfiguracionDeAlojamiento",
                    habitacionUID: String(habitacionUID)
                }
                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_pro}"]`)
                if (!instanciaRenderizada) { return }
                instanciaRenderizada.remove()
                if (respuestaServidor?.error) {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    document.querySelector(`[habitacionUID="${habitacionUID}"]`)?.remove()
                }
            }
        },
        eliminarCama: {
            UI: async function (data) {

                const camaUID = data.camaUID
                const camaUI = data.camaUI
                const camaIDV = data.camaIDV

                const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                const instanciaUID = pantallaInmersiva.getAttribute("instanciaUID")

                const titulo = constructor.querySelector("[componente=titulo]")
                titulo.textContent = `Eliminar ${camaUI}`
                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                mensaje.textContent = `Confirmas eliminar ${camaUI} con identificador universal ${camaIDV}`

                const botonAceptar = constructor.querySelector("[boton=aceptar]")
                botonAceptar.textContent = `Comfirmar y eliminar ${camaUI}`
                botonAceptar.addEventListener("click", () => {
                    this.confirmar({
                        camaUID,
                        camaIDV,
                    })
                })
                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                botonCancelar.textContent = "Cancelar y volver"
                document.querySelector("main").appendChild(pantallaInmersiva)
            },
            confirmar: async function (data) {

                const camaUID = data.camaUID
                const habitacionUID = data.habitacionUID
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = "Eliminado cama..."
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const transaccion = {
                    zona: "administracion/arquitectura/configuraciones/eliminarCamaDeConfiguracionDeAlojamiento",
                    camaUID: String(camaUID)
                }

                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }

                if (respuestaServidor?.error) {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    document.querySelector(`[camaUID="${camaUID}"]`)?.remove()
                    const selectorContenedoresHabitacion = document.querySelectorAll(`[habitacionUID]`)
                    selectorContenedoresHabitacion.forEach((habitacion) => {

                        const camasDeLaHabitacion = habitacion.querySelectorAll("[camaUID]")
                        const selectorInfoRenderizada = habitacion.querySelector("[componente=infoVolatilCamasHabitacion]")
                        if (camasDeLaHabitacion.length === 0 && !selectorInfoRenderizada) {
                            const infoNoCamas = casaVitini.view.detallesConfiguracion.componentesUI.noCamaInfoUI()
                            habitacion.appendChild(infoNoCamas)
                        }


                    })
                }
            }
        },
        actualizarEstadoConfiguracion: {
            UI: async function (data) {
                const estadoActual = data.estadoActual
                let tituloBoton
                let nuevoEstado
                if (estadoActual === "activado") {
                    tituloBoton = "Cambiar estado a Desactivado"
                    nuevoEstado = "desactivado"
                }
                if (estadoActual === "desactivado") {
                    tituloBoton = "Cambiar estado a Activado"
                    nuevoEstado = "activado"
                }

                const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                pantallaInmersiva.style.justifyContent = "center"

                const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

                const titulo = constructor.querySelector("[componente=titulo]")
                titulo.textContent = `Actualizar el estado de la configuración`
                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                mensaje.textContent = `Seleccione el nuevo estado de la configuración. Su aplicación será inmediata. Es recomendable que cambie al estado disponible cuando se asegure de que tiene la configuración del apartamento correctamente configurada.`

                const botonAceptar = constructor.querySelector("[boton=aceptar]")
                botonAceptar.textContent = tituloBoton
                botonAceptar.addEventListener("click", () => {
                    this.transactor({
                        nuevoEstado
                    })
                })
                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                botonCancelar.textContent = "Cancelar el cambio de estado y volver"
                document.querySelector("main").appendChild(pantallaInmersiva)
            },
            transactor: async function (data) {
                const nuevoEstado = data.nuevoEstado
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = "Actualizando estado..."
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const apartamentoIDV = document.querySelector(`[apartamentoIDV]`).getAttribute("apartamentoIDV")
                const transaccion = {
                    zona: "administracion/arquitectura/configuraciones/cambiarEstadoConfiguracionAlojamiento",
                    apartamentoIDV,
                    nuevoEstado
                }

                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }
                instanciaRenderizada.remove()
                if (respuestaServidor?.error) {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    const selectorEstadoActualIDV = document.querySelector("[estadoActual]")
                    selectorEstadoActualIDV.setAttribute("estadoActual", nuevoEstado)
                    let estadoConfiguracionUI
                    if (nuevoEstado === "desactivado") {
                        estadoConfiguracionUI = "Desactivado"
                    }
                    if (nuevoEstado === "activado") {
                        estadoConfiguracionUI = "Activado"
                    }
                    const selectorEstadoActualUI = document.querySelector("[componente=estadoActualUI]")
                    selectorEstadoActualUI.textContent = estadoConfiguracionUI
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                }
            }
        },
        gestionZona: {
            ui: async function (data) {
                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                const instanciaUID_gestionZonaUI = ui.getAttribute("instanciaUID")
                const contenedor = ui.querySelector("[componente=contenedor]")
                const apartamentoIDV = data.apartamentoIDV


                const t1 = document.createElement("div")
                t1.classList.add("tituloGris", "padding10", "textoCentrado")
                t1.textContent = "Cambiar zona de publicación"
                contenedor.appendChild(t1)

                const botonCancelar = document.createElement("div")
                botonCancelar.classList.add("boton")
                botonCancelar.setAttribute("boton", "cancelar")
                botonCancelar.textContent = "Cancelar y volver a tras"
                botonCancelar.addEventListener("click", () => {
                    return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                })
                contenedor.appendChild(botonCancelar)


                const t2 = document.createElement("div")
                t2.classList.add("padding18")
                t2.textContent = "La zona de publicación determina dónde se mostrará esta configuración de alojamiento. Existen tres zonas. La zona pública que determina que esta configuración se anuncie solo desde la plaza, para los clientes y fuera de la zona administrativa. La zona privada que establece que esta configuración solo se anuncie dentro de la zona administrativa y, por última, está la zona global, que anuncia esta configuración en toda Casa Vitini"
                contenedor.appendChild(t2)


                const botonZonaPublica = document.createElement("div")
                botonZonaPublica.classList.add("botonV1BlancoIzquierda")
                botonZonaPublica.setAttribute("zona", "publica")
                botonZonaPublica.textContent = "Cambiar a Zona Pública"
                botonZonaPublica.addEventListener("click", () => {
                    this.cambiarZona({
                        apartamentoIDV,
                        nuevaZona: "publica",
                        instanciaUID_gestionZonaUI
                    })
                })
                contenedor.appendChild(botonZonaPublica)

                const botonZonaPrivada = document.createElement("div")
                botonZonaPrivada.classList.add("botonV1BlancoIzquierda")
                botonZonaPrivada.setAttribute("zona", "privada")
                botonZonaPrivada.textContent = "Cambiar a Zona Privada"
                botonZonaPrivada.addEventListener("click", () => {
                    this.cambiarZona({
                        apartamentoIDV,
                        nuevaZona: "privada",
                        instanciaUID_gestionZonaUI
                    })
                })
                contenedor.appendChild(botonZonaPrivada)

                const botonZonaGlobal = document.createElement("div")
                botonZonaGlobal.classList.add("botonV1BlancoIzquierda")
                botonZonaGlobal.setAttribute("zona", "global")
                botonZonaGlobal.textContent = "Cambiar a Zona Global"
                botonZonaGlobal.addEventListener("click", () => {
                    this.cambiarZona({
                        apartamentoIDV,
                        nuevaZona: "global",
                        instanciaUID_gestionZonaUI
                    })
                })
                contenedor.appendChild(botonZonaGlobal)


                document.querySelector("main").appendChild(ui)
            },
            cambiarZona: async function (data) {

                const nuevaZona = data.nuevaZona
                const apartamentoIDV = data.apartamentoIDV
                const instanciaUID_gestionZonaUI = data.instanciaUID_gestionZonaUI


                const instanciaUID_pantallaCargaSuperPuesta = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = "Actualizando zona de la configuración de alojamiento..."
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID_pantallaCargaSuperPuesta,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const transaccion = {
                    zona: "administracion/arquitectura/configuraciones/actualizarZonaDeLaConfiguracionApartamento",
                    nuevaZona,
                    apartamentoIDV
                }
                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_gestionZonaUI}"]`)
                if (!instanciaRenderizada) { return }

                if (respuestaServidor?.error) {
                    document.querySelector(`[instanciaUID="${instanciaUID_pantallaCargaSuperPuesta}"]`)?.remove()
                    return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    const nuevaZona = respuestaServidor.nuevaZona
                    const selectorZonaUI_renderizada = document.querySelector(`[instanciaUID="${instanciaUID_gestionZonaUI}"]`)
                    if (!selectorZonaUI_renderizada) {
                        return
                    }
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    const selectorZonaUI = document.querySelector(`[contenedor=configuracionAlojamiento][apartamentoIDV="${apartamentoIDV}"]`).querySelector("[data=zonaPublicacion]")

                    let zonaUI
                    if (nuevaZona === "publica") {
                        zonaUI = "Publica"
                    }
                    if (nuevaZona === "global") {
                        zonaUI = "Global"
                    }
                    if (nuevaZona === "privada") {
                        zonaUI = "Privada"
                    }
                    selectorZonaUI.textContent = zonaUI
                }
            }
        },
        componentesUI: {
            habitacionUI: function (metadatos) {
                const habitacionUI = metadatos.habitacionUI
                const habitacionIDV = metadatos.habitacionIDV
                const habitacionUID = metadatos.habitacionUID
                const contenedor = document.createElement("div")
                contenedor.classList.add("arquitecturaConfApartamento_contenedorHabitacion")
                contenedor.setAttribute("habitacionUID", habitacionUID)
                contenedor.setAttribute("habitacionIDV", habitacionIDV)
                const barraHerramientas = document.createElement("div")
                barraHerramientas.classList.add("aquitecturaConfApartamento_barraHerrameintas")
                const tituloHabitacion = document.createElement("div")
                tituloHabitacion.classList.add("arquitecturaConfApartamento_tituloHabitacion")
                tituloHabitacion.textContent = habitacionUI
                barraHerramientas.appendChild(tituloHabitacion)
                const contenedorBotones = document.createElement("div")
                contenedorBotones.classList.add("arquitecturaConfApartamento_barraHerramientas_contenedorBotones")
                const botonEliminarHabitacion = document.createElement("div")
                botonEliminarHabitacion.classList.add("arquitecturaConfApartamento_botonV2")
                botonEliminarHabitacion.textContent = "Eliminar habitación"
                botonEliminarHabitacion.addEventListener("click", () => {
                    casaVitini.view.detallesConfiguracion.eliminarHabitacion.UI({
                        habitacionUI,
                        habitacionUID
                    })
                })
                contenedorBotones.appendChild(botonEliminarHabitacion)
                const botonAddCama = document.createElement("div")
                botonAddCama.classList.add("arquitecturaConfApartamento_botonV2")
                botonAddCama.addEventListener("click", () => {
                    casaVitini.view.detallesConfiguracion.addCama.UI({
                        habitacionUID
                    })
                })
                botonAddCama.textContent = "Anadir cama"
                contenedorBotones.appendChild(botonAddCama)
                barraHerramientas.appendChild(contenedorBotones)
                contenedor.appendChild(barraHerramientas)
                return contenedor
            },
            camaUI: function (metadatos) {
                const camaIDV = metadatos.camaIDV
                const camaUID = metadatos.camaUID
                const camaUI = metadatos.camaUI
                const capacidad = metadatos.capacidad
                const contenedorCama = document.createElement("div")
                contenedorCama.classList.add("arquitecturaConfApartamento_contenedorCama")
                contenedorCama.setAttribute("camaIDV", camaIDV)
                contenedorCama.setAttribute("camaUID", camaUID)
                const contenedorInfo = document.createElement("div")
                contenedorInfo.classList.add("arquitecturaConfApartamento_contenedorCamaInfo")
                const tituloCama = document.createElement("div")
                tituloCama.classList.add("arquitecturaConfApartamento_tituloCama")
                tituloCama.classList.add("negrita")
                tituloCama.textContent = camaUI
                contenedorInfo.appendChild(tituloCama)
                const tituloCapacidadCama = document.createElement("div")
                tituloCapacidadCama.classList.add("arquitecturaConfApartamento_tituloCama")
                tituloCapacidadCama.textContent = `Capacidad pernoctativa: ${capacidad}`
                contenedorInfo.appendChild(tituloCapacidadCama)
                contenedorCama.appendChild(contenedorInfo)
                const contenedorOpciones = document.createElement("div")
                contenedorOpciones.classList.add("arquitecturaConfApartamento_contenedorCamaOpciones")
                const botonEliminar = document.createElement("div")
                botonEliminar.classList.add("arquitecturaConfApartamento_botonV3")
                botonEliminar.textContent = "Eliminar cama"
                botonEliminar.addEventListener("click", () => {
                    casaVitini.view.detallesConfiguracion.eliminarCama.UI({
                        camaUID,
                        camaUI,
                        camaIDV
                    })
                })
                contenedorOpciones.appendChild(botonEliminar)
                contenedorCama.appendChild(contenedorOpciones)
                return contenedorCama
            },
            noCamaInfoUI: function () {
                const infoNoCamas = document.createElement("div")
                infoNoCamas.classList.add("arquitecturaConfApartamento_infoNoCama")
                infoNoCamas.setAttribute("componente", "infoVolatilCamasHabitacion")
                infoNoCamas.textContent = "Esta habitación no tiene ninguna cama configurada, añade una cama para hacer seleccionable esta habitación."
                return infoNoCamas
            }
        },
        zonas: {
            gestionDeImagenes: {
                galeriaImagenesApartamentos: {
                    arranque: async function (data) {
                        const apartamentoIDV = data.apartamentoIDV
                        const main = document.querySelector("main")
                        const instanciaUID = main.getAttribute("instanciaUID")

                        const titulo = main.querySelector("[componente=titulo]")
                        titulo.textContent = `Cargando imagenes...`

                        const espacio = document.querySelector("[componente=espacioConfiguracionDelAlojamiento]")


                        const contenedorBotones = document.createElement("div")
                        contenedorBotones.classList.add("flexHorizontal")
                        contenedorBotones.setAttribute("apartamentoIDV", apartamentoIDV)
                        espacio.appendChild(contenedorBotones)


                        const botonAnadir = document.createElement("a")
                        botonAnadir.classList.add("botonV1BlancoIzquierda")
                        botonAnadir.textContent = "Insertar nueva imagen"
                        botonAnadir.addEventListener("click", () => {
                            this.subirImagen()
                        })
                        contenedorBotones.appendChild(botonAnadir)


                        const gridImagenes = document.createElement("div")
                        gridImagenes.setAttribute("contenedor", "gridImagenes")
                        gridImagenes.setAttribute("grupoIDV", apartamentoIDV)
                        gridImagenes.classList.add("gridImagenes")
                        main.appendChild(gridImagenes)


                        const respuestaServidor = await casaVitini.shell.servidor({
                            zona: "administracion/arquitectura/configuraciones/gestionImagenes/obtenerTodoImagenUIDPorApartamentoIDV",
                            apartamentoIDV: apartamentoIDV
                        })
                        const seccionRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
                        if (!seccionRenderizada) { return }

                        if (respuestaServidor?.error) {
                            casaVitini.ui.componentes.mensajeSimple({
                                titulo: "No existe la configuración de alojamiento",
                                descripcion: respuestaServidor.error
                            })
                        }

                        if (respuestaServidor?.ok) {
                            const apartamentoUI = respuestaServidor.apartamentoUI
                            titulo.textContent = `Gestión de imagenes del alojamiento ${apartamentoUI} (${apartamentoIDV})`

                            return this.redenderizaContenedorImagen({
                                respuestaServidor,
                                instanciaUID
                            })
                        }
                    },
                    redenderizaContenedorImagen: async function (data) {

                        const rS = data.respuestaServidor
                        const apartamentoIDV = rS.apartamentoIDV
                        const imagenes = rS.imagenes
                        const instanciaUID = data.instanciaUID
                        imagenes.sort((a, b) => a.posicion - b.posicion);
                        imagenes.forEach(imagen => {

                            const imagenUID = imagen?.imagenUID
                            const posicion = imagen?.posicion
                            const titulo = imagen.titulo
                            const descripcion = imagen.descripcion
                            const contenedor = this.contenedorImagen.ui({
                                imagenBase64: "",
                                apartamentoIDV,
                                imagenUID,
                                posicion,
                                titulo,
                                descripcion,
                                estadoInicial: "cargando"

                            })
                            const uiRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                            if (uiRenderizada) {
                                const gridImagenes = uiRenderizada.querySelector("[contenedor=gridImagenes]")
                                gridImagenes.appendChild(contenedor)
                                this.obtenerImagen({
                                    instanciaUID_destino: contenedor.getAttribute("instanciaUID"),
                                    imagenUID,
                                    apartamentoIDV
                                })
                            }
                        })
                    },
                    obtenerImagen: async function (data) {
                        const instanciaUID_destino = data.instanciaUID_destino
                        const imagenUID = data.imagenUID
                        const apartamentoIDV = data.apartamentoIDV

                        const respuestaServidor = await casaVitini.shell.servidor({
                            zona: "administracion/arquitectura/configuraciones/gestionImagenes/obtenerImagenPorImagenUIDPorApartamentoIDVAdministracion",
                            apartamentoIDV,
                            imagenUID
                        })
                        const uiRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_destino}"]`)
                        if (uiRenderizada) {
                            if (respuestaServidor?.error) {
                                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.error)
                            }
                            if (respuestaServidor?.ok) {
                                const imagenBase64 = respuestaServidor.imagen.imagenBase64
                                const tipoDeImagen = casaVitini.utilidades.formatos.imagenes.base64(imagenBase64);
                                uiRenderizada.querySelector("[contenedor=imagenBase64]").style.backgroundImage = `url(data:image/${tipoDeImagen.toLowerCase()};base64,${imagenBase64})`;
                                uiRenderizada.removeAttribute("estadoActual")
                                this.contenedorImagen.activarContenedor(uiRenderizada)
                                const imagenAmpliadaEnEspera = document.querySelector(`[imagenUID_ampliada="${imagenUID}"]`)
                                if (imagenAmpliadaEnEspera) {
                                    imagenAmpliadaEnEspera.querySelector("[contenedor=imagenVolatil]").style.backgroundImage = `url(data:image/${tipoDeImagen.toLowerCase()};base64,${imagenBase64})`;
                                    imagenAmpliadaEnEspera.querySelector("[contenedor=imagenVolatil] [contenedor=spinner]")?.remove()
                                }
                            }
                        }

                    },
                    subirImagen: function () {
                        const selectorEspacio = document.querySelector("[componente=espacioConfiguracionDelAlojamiento]")
                        const apartamentoIDV = selectorEspacio.querySelector("[apartamentoIDV]").getAttribute("apartamentoIDV")
                        const main = document.querySelector("main")
                        const gridImagenes = main.querySelector("[contenedor=gridImagenes]")

                        const campoEntrada = document.createElement("input")
                        const selectorCampoRederizado = document.getElementById("campoEntrada")

                        if (!selectorCampoRederizado) {
                            selectorEspacio.appendChild(campoEntrada)
                        } else {
                            selectorCampoRederizado?.remove()
                        }
                        campoEntrada.id = "campoEntrada"
                        campoEntrada.type = "file"
                        campoEntrada.style.display = "none"
                        campoEntrada.addEventListener("change", (event) => {
                            const archivoSeleccionado = event.target.files[0];
                            if (archivoSeleccionado) {

                                const lector = new FileReader();
                                lector.onload = async (eventoCarga) => {
                                    const contenidoBuffer = eventoCarga.target.result;

                                    const contenidoBase64 = btoa(new Uint8Array(contenidoBuffer).reduce((datos, byte) => datos + String.fromCharCode(byte), ""));
                                    const contenedorImagen = this.contenedorImagen.ui({
                                        imagenBase64: contenidoBase64,
                                        estadoInicial: "cargando"
                                    })
                                    gridImagenes.appendChild(contenedorImagen)

                                    const respuestaServidor = await casaVitini.shell.servidor({
                                        zona: "administracion/arquitectura/configuraciones/gestionImagenes/subirNuevaImagen",
                                        apartamentoIDV: apartamentoIDV,
                                        contenidoArchivo: contenidoBase64
                                    })
                                    if (!contenedorImagen) {
                                        return
                                    }
                                    if (respuestaServidor?.error) {
                                        contenedorImagen?.remove()
                                        casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                                    }
                                    if (respuestaServidor?.ok) {
                                        const imagenUID = respuestaServidor.imagenUID
                                        contenedorImagen.setAttribute("imagenUID", imagenUID)
                                        contenedorImagen.setAttribute("apartamentoIDV", apartamentoIDV)
                                        this.contenedorImagen.activarContenedor(contenedorImagen)
                                    }
                                    campoEntrada.remove()

                                }
                                lector.readAsArrayBuffer(archivoSeleccionado);
                            };
                        })

                        campoEntrada.click()
                    },
                    contenedorImagen: {
                        ui: function (data) {
                            const imagenBase64 = data.imagenBase64
                            const apartamentoIDV = data.apartamentoIDV
                            const imagenUID = data.imagenUID
                            const estadoInicial = data.estadoInicial
                            const titulo = data.titulo || ""
                            const descripcion = data.descripcion || ""
                            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()



                            const contenedor = document.createElement("div")
                            contenedor.classList.add("flexVertical", "contenedorImagen")
                            contenedor.setAttribute("instanciaUID", instanciaUID)
                            contenedor.setAttribute("componente", "fotoAmpliable")
                            contenedor.setAttribute("imagenUID", imagenUID)
                            contenedor.setAttribute("apartamentoIDV", apartamentoIDV)


                            const cImagen = document.createElement("div")
                            cImagen.classList.add("flexVertical", "contenedorImagenFondo")
                            cImagen.setAttribute("titulo", titulo)
                            cImagen.setAttribute("descripcion", descripcion)
                            cImagen.setAttribute("contenedor", "imagenBase64")
                            cImagen.addEventListener("click", (e) => {
                                casaVitini.view.__sharedMethods__.ampliadorDeImagen.ampliarImagen(e)
                            })
                            if (imagenBase64.length > 0) {
                                const tipoDeImagen = casaVitini.utilidades.formatos.imagenes.base64(imagenBase64);
                                cImagen.style.backgroundImage = `url(data:image/${tipoDeImagen.toLowerCase()};base64,${imagenBase64})`;
                            }

                            contenedor.appendChild(cImagen)

                            const spinner = casaVitini.ui.componentes.spinnerSimple()
                            spinner.classList.add("blur50")


                            if (estadoInicial === "cargando") {
                                cImagen.appendChild(spinner)
                            }

                            const opciones = document.createElement("div")
                            opciones.classList.add("botonV1BlancoIzquierda")
                            opciones.setAttribute("boton", "opciones")
                            contenedor.appendChild(opciones)

                            if (estadoInicial === "cargando") {
                                opciones.textContent = "Cargando..."
                                opciones.style.pointerEvents = "none"
                                contenedor.setAttribute("estadoActual", "cargando")
                            } else {
                                this.activarContenedor(contenedor)
                            }

                            return contenedor
                        },
                        activarContenedor: function (contenedor) {
                            const apartamentoIDV = contenedor.getAttribute("apartamentoIDV")
                            const imagenUID = contenedor.getAttribute("imagenUID")
                            const posicion = contenedor.getAttribute("posicion")
                            const instanciaUID = contenedor.getAttribute("instanciaUID")
                            const imagenFondo = contenedor.querySelector("[contenedor=imagenBase64]").style.backgroundImage
                            contenedor.querySelector("[contenedor=spinner]")?.remove()

                            const opciones = contenedor.querySelector("[boton=opciones]")
                            opciones.removeAttribute("style")
                            opciones.textContent = "Opciones"
                            opciones.addEventListener("click", (e) => {
                                this.opcionesImagen.ui({
                                    apartamentoIDV,
                                    imagenUID,
                                    posicion,
                                    instanciaUID,
                                    imagenFondo,
                                    e
                                })
                            })
                        },

                        opcionesImagen: {
                            ui: function (data) {
                                const contenedorImagenOrigen = data.e.target.closest("[imagenUID]")
                                const apartamentoIDV = data.apartamentoIDV
                                const imagenUID = data.imagenUID
                                const instanciaUID = data.instanciaUID
                                const imagenFondo = data.imagenFondo
                                const totalImagenes = document.querySelector("[contenedor=gridImagenes]").querySelectorAll("[imagenUID]").length
                                const main = document.querySelector("main")
                                const gridImagenes = main.querySelector("[contenedor=gridImagenes]");
                                const contenedorImg = Array.from(gridImagenes.querySelectorAll("[imagenUID]"));
                                const posicionActual = contenedorImg.indexOf(contenedorImagenOrigen) + 1;
                                const titulo = contenedorImagenOrigen.querySelector("[titulo]").getAttribute("titulo")
                                const descripcion = contenedorImagenOrigen.querySelector("[descripcion]").getAttribute("descripcion")

                                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                                const instanciaUID_flotante = ui.getAttribute("instanciaUID")
                                main.appendChild(ui)
                                const contenedor = ui.querySelector("[componente=contenedor]")


                                const botonCancelar = document.createElement("div")
                                botonCancelar.classList.add("botonV1")
                                botonCancelar.textContent = "Cerrar y volver"
                                botonCancelar.addEventListener("click", () => {
                                    return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                })
                                contenedor.appendChild(botonCancelar)


                                const cImagen = document.createElement("div")
                                cImagen.classList.add("flexVertical", "contenedorImagenFondoFlotante")
                                cImagen.setAttribute("contenedor", "imagenBase64")
                                cImagen.style.backgroundImage = imagenFondo
                                contenedor.appendChild(cImagen)


                                const contenedorInfo = document.createElement("div")
                                contenedorInfo.classList.add("flexVertical", "backgroundGrey1", "borderRadius20", "gap6", "padding6")
                                contenedor.appendChild(contenedorInfo)

                                const info = document.createElement("p")
                                info.classList.add("padding14")
                                info.textContent = "Opcionalmente puedes incluir un titulo, una descripcion o ambos. Puedes dejar ambos campos o solo uno de ellos en blanco o con informacion. Si solo escribes un titulo, solo se mostrara el titulo en negrita, si solo poner una descripcion esa se mostrara."
                                contenedorInfo.appendChild(info)


                                const campoTitulo = document.createElement("input")
                                campoTitulo.setAttribute("campo", "titulo")
                                campoTitulo.classList.add("botonV1BlancoIzquierda_campo")
                                campoTitulo.placeholder = "Titulo de la imagen (Opcional)"
                                campoTitulo.value = titulo
                                contenedorInfo.appendChild(campoTitulo)

                                const campoDescripcion = document.createElement("input")
                                campoDescripcion.setAttribute("campo", "descripcion")
                                campoDescripcion.classList.add("botonV1BlancoIzquierda_campo")
                                campoDescripcion.placeholder = "Descripcion de la imagen (Opcional)"
                                campoDescripcion.value = descripcion
                                contenedorInfo.appendChild(campoDescripcion)

                                const infoBoton = document.createElement("p")
                                infoBoton.classList.add("padding14")
                                infoBoton.textContent = "Pulsa en el boton Actualizar información de la imagen para actualizar la nueva informacion de los campos. Si quieres borrar la información simplemente borra los campos que quieras y pulsa en el boton de Actualizar información"
                                contenedorInfo.appendChild(infoBoton)


                                const botonActualizarInfoImagen = document.createElement("div")
                                botonActualizarInfoImagen.classList.add("botonV1BlancoIzquierda")
                                botonActualizarInfoImagen.setAttribute("boton", "actualizar")
                                botonActualizarInfoImagen.textContent = "Actualizar información de la imagen"
                                botonActualizarInfoImagen.addEventListener("click", (e) => {
                                    this.actualizarInformacionImagen({
                                        e,
                                        imagenUID,
                                        apartamentoIDV,
                                        titulo: campoTitulo.value,
                                        descripcion: campoDescripcion.value,
                                    })
                                })
                                contenedorInfo.appendChild(botonActualizarInfoImagen)

                                const infoOp = document.createElement("p")
                                infoOp.classList.add("padding14", "textoCentrado")
                                infoOp.textContent = "Opciones de la imagen"
                                contenedor.appendChild(infoOp)


                                const botonActualizarImagen = document.createElement("div")
                                botonActualizarImagen.classList.add("botonV1BlancoIzquierda")
                                botonActualizarImagen.setAttribute("boton", "actualizar")
                                botonActualizarImagen.textContent = "Actualizar imagen"
                                botonActualizarImagen.addEventListener("click", (e) => {
                                    this.actualizarImagen({
                                        e,
                                        imagenUID,
                                        apartamentoIDV

                                    })
                                })
                                contenedor.appendChild(botonActualizarImagen)


                                const contenedorOpciones = document.createElement("select")
                                contenedorOpciones.setAttribute("boton", "listaPosiciones")
                                contenedorOpciones.classList.add("botonV1BlancoIzquierda")
                                contenedorOpciones.addEventListener("change", (e) => {
                                    const coordenadasSel = e.target.selectedIndex

                                    this.cambiarPosicion({
                                        imagenUID,
                                        apartamentoIDV,
                                        nuevaPosicion: e.target.value,
                                        listaSelectora: e.target,
                                        coordenadasSel,
                                        instanciaUID_flotante,
                                        posicionActual
                                    })
                                })

                                const opcion = document.createElement("option");
                                opcion.value = "";
                                opcion.disabled = true;
                                opcion.text = "Seleciona la posición de destino";
                                contenedorOpciones.add(opcion);
                                for (let index = 0; index < totalImagenes; index++) {
                                    const opcion = document.createElement("option");
                                    const posicionUI = index + 1
                                    opcion.value = posicionUI;

                                    if (posicionUI === Number(posicionActual)) {
                                        opcion.text = `Posicion actual de la imagen: ${posicionUI}`;
                                        opcion.disabled = true;
                                        opcion.selected = true;
                                        opcion.setAttribute("estado", "inicial")
                                    } else {
                                        opcion.text = `Mover a la posición ${posicionUI}`;
                                    }
                                    contenedorOpciones.add(opcion);
                                }

                                contenedor.appendChild(contenedorOpciones)


                                const botonEliminar = document.createElement("div")
                                botonEliminar.classList.add("botonV1BlancoIzquierda")
                                botonEliminar.setAttribute("boton", "elimnar")
                                botonEliminar.textContent = "Eliminar imagen"
                                botonEliminar.addEventListener("click", (e) => {
                                    this.eliminarImagen({
                                        imagenUID,
                                        apartamentoIDV,
                                        e
                                    })
                                })
                                contenedor.appendChild(botonEliminar)

                            },
                            cambiarPosicion: async function (data) {
                                const imagenUID = data.imagenUID
                                const nuevaPosicion = data.nuevaPosicion
                                const apartamentoIDV = data.apartamentoIDV
                                const instanciaUID_flotante = data.instanciaUID_flotante
                                const listaSelectora = data.listaSelectora
                                const coordenadasSel = data.coordenadasSel
                                const posicionActual = data.posicionActual
                                const opcionesListaComo = listaSelectora.options
                                listaSelectora.style.pointerEvents = "none"
                                const main = document.querySelector("main")

                                const opcionSel = opcionesListaComo[coordenadasSel]
                                const cacheTexto = opcionSel.text
                                opcionSel.text = `Moviendo a posicion ${nuevaPosicion}...`;
                                const gridImagenes = main.querySelector("[contenedor=gridImagenes]")


                                const respuestaServidor = await casaVitini.shell.servidor({
                                    zona: "/administracion/arquitectura/configuraciones/gestionImagenes/actualizarPosicionImagen",
                                    apartamentoIDV: apartamentoIDV,
                                    imagenUID: imagenUID,
                                    nuevaPosicion: String(nuevaPosicion)
                                })

                                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_flotante}"]`)
                                if (!instanciaRenderizada) {
                                    return
                                }
                                if (respuestaServidor.error) {
                                    opcionSel.text = cacheTexto
                                    listaSelectora.removeAttribute("style")
                                    return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor.error)
                                }
                                if (respuestaServidor.ok) {
                                    const opcionesDeInicioDelProceso = listaSelectora.querySelector("[estado=inicial]")
                                    opcionesDeInicioDelProceso.disabled = false
                                    opcionesDeInicioDelProceso.selected = false
                                    opcionesDeInicioDelProceso.removeAttribute("estado")

                                    opcionSel.text = `Posicion actual de la imagen: ${nuevaPosicion}`;
                                    opcionSel.disabled = true
                                    opcionSel.selected = true
                                    opcionSel.setAttribute("estado", "inicial")
                                    const valorDeInicioDelProceso = opcionesDeInicioDelProceso.value
                                    opcionesDeInicioDelProceso.text = `Mover a la posición ${valorDeInicioDelProceso}`
                                    listaSelectora.removeAttribute("style")

                                    let posiccionFinalDOM
                                    if (Number(nuevaPosicion) < Number(valorDeInicioDelProceso)) {
                                        posiccionFinalDOM = Number(nuevaPosicion) - 1
                                    } else {
                                        posiccionFinalDOM = Number(nuevaPosicion)
                                    }

                                    const posiccionInicialDOM = Number(valorDeInicioDelProceso) - 1

                                    const contenedoresImg = Array.from(gridImagenes.querySelectorAll("[imagenUID]"));
                                    const elementoParaMover = contenedoresImg[posiccionInicialDOM];


                                    gridImagenes.removeChild(elementoParaMover);
                                    gridImagenes.insertBefore(elementoParaMover, contenedoresImg[posiccionFinalDOM]);
                                }



                            },
                            eliminarImagen: async function (data) {
                                const apartamentoIDV = data.apartamentoIDV
                                const imagenUID = data.imagenUID
                                const e = data.e.target
                                const cacheBoton = e.textContent
                                const botones = e.closest("[componente=contenedor]").querySelectorAll("[boton]")
                                botones.forEach(c => c.style.pointerEvents = "none")
                                e.textContent = "Eliminando..."

                                const respuestaServidor = await casaVitini.shell.servidor({
                                    zona: "/administracion/arquitectura/configuraciones/gestionImagenes/eliminarImagen",
                                    apartamentoIDV: apartamentoIDV,
                                    imagenUID: imagenUID,
                                })

                                if (respuestaServidor.error) {
                                    e.textContent = cacheBoton
                                    botones.forEach(c => c.removeAttribute("style"))
                                    return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor.error)
                                }
                                if (respuestaServidor.ok) {
                                    document.querySelector("[contenedor=gridImagenes]").querySelector(`[imagenUID="${imagenUID}"]`)?.remove()
                                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                }
                            },
                            actualizarInformacionImagen: async function (data) {
                                const e = data.e
                                const imagenUID = data.imagenUID
                                const apartamentoIDV = data.apartamentoIDV
                                const titulo = data.titulo
                                const descripcion = data.descripcion
                                const boton = e.target

                                const cacheTextoBoton = boton.textContent
                                boton.textContent = "Actualizando..."


                                const respuestaServidor = await casaVitini.shell.servidor({
                                    zona: "administracion/arquitectura/configuraciones/gestionImagenes/actualizarInformacionImagen",
                                    apartamentoIDV: apartamentoIDV,
                                    imagenUID: imagenUID,
                                    titulo,
                                    descripcion
                                })
                                boton.textContent = cacheTextoBoton
                                if (respuestaServidor?.error) {
                                    casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                                }
                                if (respuestaServidor?.ok) {
                                    document.querySelector(`[imagenUID="${imagenUID}"] [titulo]`)?.setAttribute("titulo", titulo)
                                    document.querySelector(`[imagenUID="${imagenUID}"] [descripcion]`)?.setAttribute("descripcion", descripcion)
                                }



                            },
                            actualizarImagen: function (data) {
                                const imagenUID = data.imagenUID
                                const apartamentoIDV = data.apartamentoIDV
                                const e = data.e.target
                                const contenedor = e.closest("[componente=contenedor]")
                                const imagenBase64Flotante = contenedor.querySelector("[contenedor=imagenBase64]")
                                const contenedorImagen = document.querySelector(`[contenedor=gridImagenes] [imagenUID="${imagenUID}"] [contenedor=imagenBase64]`)
                                const cacheImagen = contenedorImagen.style.backgroundImage
                                const main = document.querySelector("main")
                                const campoEntrada = document.createElement("input")
                                const selectorCampoRederizado = document.getElementById("campoEntrada")

                                if (!selectorCampoRederizado) {
                                    main.appendChild(campoEntrada)
                                } else {
                                    selectorCampoRederizado?.remove()
                                }
                                campoEntrada.id = "campoEntrada"
                                campoEntrada.type = "file"
                                campoEntrada.style.display = "none"
                                campoEntrada.addEventListener("change", (event) => {
                                    const archivoSeleccionado = event.target.files[0];
                                    if (archivoSeleccionado) {
                                        const spinner = casaVitini.ui.componentes.spinnerSimple()
                                        spinner.classList.add("blur50")
                                        contenedorImagen.appendChild(spinner)

                                        const spinner_imagenFLotante = casaVitini.ui.componentes.spinnerSimple()
                                        spinner_imagenFLotante.classList.add("blur50")
                                        imagenBase64Flotante.appendChild(spinner_imagenFLotante)

                                        const lector = new FileReader();
                                        lector.onload = async (eventoCarga) => {
                                            const contenidoBuffer = eventoCarga.target.result;
                                            const contenidoBase64 = btoa(new Uint8Array(contenidoBuffer).reduce((datos, byte) => datos + String.fromCharCode(byte), ""));
                                            const tipoDeImagen = casaVitini.utilidades.formatos.imagenes.base64(contenidoBase64);
                                            contenedorImagen.style.backgroundImage = `url(data:image/${tipoDeImagen.toLowerCase()};base64,${contenidoBase64})`
                                            imagenBase64Flotante.style.backgroundImage = `url(data:image/${tipoDeImagen.toLowerCase()};base64,${contenidoBase64})`
                                            const respuestaServidor = await casaVitini.shell.servidor({
                                                zona: "administracion/arquitectura/configuraciones/gestionImagenes/actualizarImagen",
                                                apartamentoIDV: apartamentoIDV,
                                                imagenUID: imagenUID,
                                                contenidoArchivo: contenidoBase64
                                            })
                                            if (!contenedorImagen) {
                                                return
                                            }
                                            if (respuestaServidor?.error) {
                                                contenedorImagen.style.backgroundImage = cacheImagen
                                                imagenBase64Flotante.style.backgroundImage = cacheImagen
                                                spinner_imagenFLotante?.remove()
                                                spinner?.remove()
                                                casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                                            }
                                            if (respuestaServidor?.ok) {
                                                spinner_imagenFLotante?.remove()
                                                spinner?.remove()
                                            }
                                            campoEntrada.remove()
                                        }
                                        lector.readAsArrayBuffer(archivoSeleccionado);
                                    };
                                })
                                campoEntrada.click()
                            },
                        }
                    },
                },
                gestionImagenPrinpicialDelAlojamiento: {
                    subirImagen: function () {
                        const contenedorImagen = document.querySelector("[componente=contenedorImagenConfiguracion]")
                        const apartamentoIDV = document.querySelector("[apartamentoIDV]").getAttribute("apartamentoIDV")
                        const selectorEspacio = document.querySelector("[componente=espacioConfiguracionDelAlojamiento]")
                        const campoEntrada = document.createElement("input")
                        campoEntrada.id = "campoEntrada"
                        campoEntrada.type = "file"
                        campoEntrada.style.display = "none"
                        campoEntrada.addEventListener("change", (event) => {
                            const archivoSeleccionado = event.target.files[0];
                            if (archivoSeleccionado) {
                                contenedorImagen.innerHTML = null
                                const iconoProceso = casaVitini.ui.componentes.spinnerSimple()
                                iconoProceso.style.background = "white"
                                iconoProceso.style.paddingLeft = "4px"
                                iconoProceso.style.background = "#ffffff7d"
                                iconoProceso.style.borderRadius = "18px"
                                iconoProceso.style.webkitBackdropFilter = "blur(20px)"
                                iconoProceso.style.backdropFilter = "blur(20px)"
                                contenedorImagen.appendChild(iconoProceso)

                                const iconoProcesoRenderizado = document.querySelector("[componente=iconoProceso]")
                                const lector = new FileReader();
                                lector.onload = async (eventoCarga) => {
                                    const contenidoBuffer = eventoCarga.target.result;

                                    const contenidoBase64 = btoa(new Uint8Array(contenidoBuffer).reduce((datos, byte) => datos + String.fromCharCode(byte), ""));

                                    const transaccion = {
                                        zona: "administracion/arquitectura/configuraciones/gestionImagenConfiguracionApartamento",
                                        apartamentoIDV: apartamentoIDV,
                                        contenidoArchivo: contenidoBase64
                                    };
                                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                                    if (respuestaServidor?.error) {
                                        iconoProceso.remove()
                                        document.getElementById("campoEntrada").remove()
                                        casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                                        await casaVitini.view.detallesConfiguracion.gestionImagenPrinpicialDelAlojamiento.obtenerImgen()
                                    }
                                    if (respuestaServidor?.ok) {
                                        iconoProceso.remove()
                                        contenedorImagen.style.backgroundImage = `url(data:image/png;base64,${contenidoBase64})`;
                                        document.getElementById("campoEntrada").remove()
                                        casaVitini.view.detallesConfiguracion.zonas.gestionDeImagenes.gestionImagenPrinpicialDelAlojamiento.opcionesImagen()

                                        contenedorImagen.removeEventListener("click", casaVitini.view.detallesConfiguracion.zonas.gestionDeImagenes.gestionImagenPrinpicialDelAlojamiento.subirImagen)

                                        contenedorImagen.addEventListener("click", casaVitini.view.detallesConfiguracion.zonas.gestionDeImagenes.gestionImagenPrinpicialDelAlojamiento.mostrarOpciones)
                                    }
                                }
                                lector.readAsArrayBuffer(archivoSeleccionado);
                            };
                        })
                        const selectorCampoRederizado = document.getElementById("campoEntrada")
                        if (!selectorCampoRederizado) {
                            selectorEspacio.appendChild(campoEntrada)
                        }
                        document.getElementById("campoEntrada").click()
                    },
                    obtenerImgen: async function (data) {

                        const apartamentoIDV = data.apartamentoIDV
                        const instanciaUID = data.instanciaUID
                        const contenedorImagen = document.querySelector("[componente=contenedorImagenConfiguracion]")
                        contenedorImagen.innerHTML = null
                        const transaccion = {
                            zona: "administracion/arquitectura/configuraciones/obtenerImagenConfiguracionAdministracion",
                            apartamentoIDV: apartamentoIDV
                        }

                        const iconoProceso = casaVitini.ui.componentes.spinnerSimple()
                        iconoProceso.style.background = "white"
                        iconoProceso.style.background = "#ffffff7d"
                        iconoProceso.style.borderRadius = "18px"
                        iconoProceso.style.webkitBackdropFilter = "blur(20px)"
                        iconoProceso.style.backdropFilter = "blur(20px)"
                        contenedorImagen.appendChild(iconoProceso)
                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        const mainSel = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                        if (mainSel) {
                            iconoProceso?.remove()
                            if (respuestaServidor?.error) {
                                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {

                                const imagenBase64 = respuestaServidor?.imagen
                                if (!imagenBase64) {
                                    contenedorImagen.textContent = "Haz click para añadir una imagen del apartamento"
                                    contenedorImagen.addEventListener("click", casaVitini.view.detallesConfiguracion.zonas.gestionDeImagenes.gestionImagenPrinpicialDelAlojamiento.subirImagen)
                                    contenedorImagen.removeEventListener("click", casaVitini.view.detallesConfiguracion.zonas.gestionDeImagenes.gestionImagenPrinpicialDelAlojamiento.mostrarOpciones)
                                } else {
                                    casaVitini.view.detallesConfiguracion.zonas.gestionDeImagenes.gestionImagenPrinpicialDelAlojamiento.opcionesImagen()

                                    contenedorImagen.removeEventListener("click", casaVitini.view.detallesConfiguracion.zonas.gestionDeImagenes.gestionImagenPrinpicialDelAlojamiento.subirImagen)
                                    contenedorImagen.addEventListener("click", casaVitini.view.detallesConfiguracion.zonas.gestionDeImagenes.gestionImagenPrinpicialDelAlojamiento.mostrarOpciones)

                                    const tipoDeImagen = casaVitini.utilidades.formatos.imagenes.base64(imagenBase64);
                                    contenedorImagen.style.backgroundImage = `url(data:image/${tipoDeImagen};base64,${imagenBase64})`;
                                }
                            }
                        }
                    },
                    mostrarOpciones: function (e) {
                        const contenedorOpcionesImagen = document.querySelector("[componente=contenedorOpcionesImagen]")
                        const estadoVision = contenedorOpcionesImagen.style?.display
                        const componente = e.target.getAttribute("componente")
                        if (estadoVision === "none" || !estadoVision) {
                            contenedorOpcionesImagen.style.display = "flex"
                        } else {
                            contenedorOpcionesImagen.style.display = "none"
                        }
                    },
                    eliminarImagen: {
                        UI: async function () {
                            const main = document.querySelector("main")
                            const instanciaUID = main.getAttribute("instanciaUID")

                            const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                            pantallaInmersiva.classList.add("flextJustificacion_center")

                            const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

                            const titulo = constructor.querySelector("[componente=titulo]")
                            titulo.textContent = `Eliminar imagen de la configuración del apartamento.`
                            const mensaje = constructor.querySelector("[componente=mensajeUI]")
                            mensaje.textContent = `¿Confirmas eliminar la imagen actual de la configuración de alojamiento?`

                            const botonAceptar = constructor.querySelector("[boton=aceptar]")
                            botonAceptar.textContent = `Confirmar y eliminar la imagen`
                            botonAceptar.addEventListener("click", () => { this.confirmar({ instanciaUID }) })
                            const botonCancelar = constructor.querySelector("[boton=cancelar]")
                            botonCancelar.textContent = "Cancelar y volver"
                            document.querySelector("main").appendChild(pantallaInmersiva)
                        },
                        confirmar: async function (data) {
                            const instanciaUID = data.instanciaUID

                            const apartamentoIDV = document.querySelector("[apartamentoIDV]").getAttribute("apartamentoIDV")
                            const contenedorImagen = document.querySelector("[componente=contenedorImagenConfiguracion]")
                            const iconoProceso = casaVitini.ui.componentes.spinnerSimple()
                            iconoProceso.style.background = "white"
                            iconoProceso.style.paddingLeft = "4px"
                            iconoProceso.style.background = "#ffffff7d"
                            iconoProceso.style.borderRadius = "18px"
                            iconoProceso.style.webkitBackdropFilter = "blur(20px)"
                            iconoProceso.style.backdropFilter = "blur(20px)"
                            contenedorImagen.appendChild(iconoProceso)

                            const selectorAdvertenciaInmersiva = document.querySelectorAll("[componente=advertenciaInmersiva]")
                            selectorAdvertenciaInmersiva.forEach((advertenciaInmersiva) => {
                                advertenciaInmersiva.remove()
                            })
                            const transaccion = {
                                zona: "administracion/arquitectura/configuraciones/eliminarImagenConfiguracionApartamento",
                                apartamentoIDV: apartamentoIDV
                            }

                            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                            const mainSel = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                            if (mainSel) {
                                if (respuestaServidor?.error) {
                                    iconoProceso?.remove()
                                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                                } else if (respuestaServidor?.ok) {
                                    contenedorImagen.removeEventListener("click", casaVitini.view.detallesConfiguracion.zonas.gestionDeImagenes.gestionImagenPrinpicialDelAlojamiento.mostrarOpciones)
                                    contenedorImagen.innerHTML = null
                                    iconoProceso.remove()
                                    contenedorImagen.removeAttribute("style")
                                    document.querySelector("[componente=contenedorOpcionesImagen]")?.remove()
                                    casaVitini.view.detallesConfiguracion.zonas.gestionDeImagenes.gestionImagenPrinpicialDelAlojamiento.obtenerImgen({
                                        apartamentoIDV,
                                        instanciaUID
                                    })
                                }
                            }
                        }
                    },
                    opcionesImagen: function () {

                        const contenedorImagen = document.querySelector("[componente=contenedorImagenConfiguracion]")
                        // contenedorImagen.removeEventListener("click", (e) => { casaVitini.view.detallesConfiguracion.zonas.gestionDeImagenes.gestionImagenPrinpicialDelAlojamiento.subirImagen(e) })
                        // contenedorImagen.addEventListener("click", (e) => { casaVitini.view.detallesConfiguracion.zonas.gestionDeImagenes.gestionImagenPrinpicialDelAlojamiento.mostrarOpciones(e) })
                        const contenedorOpciones = document.createElement("div")
                        contenedorOpciones.classList.add("arquitecturaConfApartamento_contenedorImg_opciones")
                        contenedorOpciones.setAttribute("componente", "contenedorOpcionesImagen")
                        const actualizarImagen = document.createElement("div")
                        actualizarImagen.classList.add("botonV1BlancoIzquierda", "blur")
                        actualizarImagen.setAttribute("componente", "opcionImagen")
                        actualizarImagen.textContent = "Actualizar imagen"
                        actualizarImagen.addEventListener("click", () => { casaVitini.view.detallesConfiguracion.zonas.gestionDeImagenes.gestionImagenPrinpicialDelAlojamiento.subirImagen() })
                        contenedorOpciones.appendChild(actualizarImagen)
                        const eliminarImagen = document.createElement("div")
                        eliminarImagen.classList.add("botonV1BlancoIzquierda", "blur")
                        eliminarImagen.setAttribute("componente", "opcionImagen")
                        eliminarImagen.textContent = "Eliminar imagen"
                        eliminarImagen.addEventListener("click", () => {
                            casaVitini.view.detallesConfiguracion.zonas.gestionDeImagenes.gestionImagenPrinpicialDelAlojamiento.eliminarImagen.UI()
                        })
                        contenedorOpciones.appendChild(eliminarImagen)
                        const contenedorOpcionesRenderizado = document.querySelector("[componente=contenedorOpcionesImagen]")
                        if (!contenedorOpcionesRenderizado) {
                            contenedorImagen.appendChild(contenedorOpciones)
                        }
                    },
                },
            }
        }
    },
}