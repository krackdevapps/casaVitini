casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const comandoInicial = granuladoURL.directorios[granuladoURL.directorios.length - 1]

        if (comandoInicial === "gestion_de_bloqueos_temporales") {
            main.setAttribute("zonaCSS", "administracion/gestion_de_bloqueos")
            this.portadaUI()
            return

        }
        let interruptor = "ignorar"
        const directoriosFiltrados = []
        granuladoURL.directorios.forEach((directorio) => {
            if (interruptor === "noIgnorar") {
                directoriosFiltrados.push(directorio)
            }
            if (directorio === "gestion_de_bloqueos_temporales") {
                interruptor = "noIgnorar"
            }
        })

        if (directoriosFiltrados.length === 1) {

            main.setAttribute("zonaCSS", "administracion/gestion_de_bloqueos/por_apartamento")
            return this.bloqueosPorApartamento.UI(directoriosFiltrados[0])
        } else if (directoriosFiltrados.length === 2) {

            main.setAttribute("zonaCSS", "administracion/gestion_de_bloqueos/bloqueoUI")
            return this.detallesDelBloqueo.UI(directoriosFiltrados)
        } else {
            const info = {
                titulo: "No existe ningún bloqueo temporal con ese identificador.",
                descripcion: "El bloqueo temporal que buscas con ese identificador no existe.Comprueba el identificador de la reserva"
            }
            casaVitini.ui.componentes.mensajeSimple(info)
        }

    },
    portadaUI: async function () {
        const selectorEspacioBotonesGlobales = document.querySelector("[componente=espacioBotonesGlobales]")
        const selectorEspacioBloqueos = document.querySelector("[componente=bloqueosTemporales]")
        const selectorTitulo = document.querySelector("[componente=titulo]")
        selectorTitulo.textContent = "Bloqueos de los Apartamentos"


        const info = document.createElement("p")
        info.classList.add("padding10")
        info.textContent = "Los bloqueos temporales, cuando están definidos por rango de fecha, es decir, no son permanentes, bloquean todo el día, desde las 00:00 hasta las 23:59. Los bloqueos no tienen en cuenta la hora de entrada y salida. Los bloqueos basados en rango temporal que tengan todos sus días en el pasado se autoeliminan. Solo verás bloqueos con rango temporal con días en el presente o futuro y bloqueos permanentes. Los bloqueos permanentes deben de eliminarse manualmente, nunca caducan."
        selectorEspacioBotonesGlobales.appendChild(info)

        const contenedorBotonesPortada = document.createElement("div")
        contenedorBotonesPortada.classList.add("portadaBloqueos_espacioBotones", "gap6")
        selectorEspacioBotonesGlobales.appendChild(contenedorBotonesPortada)

        const botonIrAlCalendario = document.createElement("a")
        botonIrAlCalendario.classList.add("botonV1BlancoIzquierda")
        botonIrAlCalendario.innerHTML = "Ver todos los bloqueos en el calendario"
        botonIrAlCalendario.setAttribute("vista", "/administracion/calendario/capa:todos_los_bloqueos")
        botonIrAlCalendario.setAttribute("href", "/administracion/calendario/capa:todos_los_bloqueos")
        botonIrAlCalendario.addEventListener("click", (boton) => {
            boton.preventDefault()
            const vista = boton.target.getAttribute("vista")
            const navegacion = {
                "vista": vista,
                "tipoOrigen": "menuNavegador"
            }
            casaVitini.shell.navegacion.controladorVista(navegacion)
        })
        contenedorBotonesPortada.appendChild(botonIrAlCalendario)

        const botonCrearBloqueoUI = document.createElement("a")
        botonCrearBloqueoUI.classList.add("botonV1BlancoIzquierda")
        botonCrearBloqueoUI.innerHTML = "Crear un bloqueo"
        botonCrearBloqueoUI.setAttribute("vista", "/administracion/gestion_de_bloqueos_temporales/crear_bloqueo")
        botonCrearBloqueoUI.setAttribute("href", "/administracion/gestion_de_bloqueos_temporales/crear_bloqueo")
        botonCrearBloqueoUI.addEventListener("click", (boton) => {
            boton.preventDefault()
            const vista = boton.target.getAttribute("vista")
            const navegacion = {
                "vista": vista,
                "tipoOrigen": "menuNavegador"
            }
            casaVitini.shell.navegacion.controladorVista(navegacion)
        })
        contenedorBotonesPortada.appendChild(botonCrearBloqueoUI)
        const transaccion = {
            zona: "administracion/bloqueos/listarApartamentosConBloqueos"
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const apartamentosConBloqueos = respuestaServidor?.ok
            if (apartamentosConBloqueos.length === 0) {
                const informacionUI = document.createElement("div")
                informacionUI.textContent = "No hay ningun bloqueo configurado"
                selectorEspacioBloqueos.appendChild(informacionUI)
            }
            apartamentosConBloqueos.forEach((detalleDelApartamento) => {
                const apartamentoIDV = detalleDelApartamento.apartamentoIDV
                const apartamentoUI = detalleDelApartamento.apartamentoUI
                const numeroDeBloqueos = detalleDelApartamento.numeroDeBloqueos
                let mensajeNumeroBloqueos
                if (numeroDeBloqueos === 1) {
                    mensajeNumeroBloqueos = `Hay ${numeroDeBloqueos} bloqueo configurado para este apartamento`
                }
                if (numeroDeBloqueos > 1) {
                    mensajeNumeroBloqueos = `Hay ${numeroDeBloqueos} bloqueos configurados para este apartamento`
                }
                const bloqueApartamentoUI = document.createElement("a")
                bloqueApartamentoUI.classList.add("gestionBloqueoApartamento_bloqueApartamentoUI")
                bloqueApartamentoUI.setAttribute("apartamentoIDV", apartamentoIDV)
                bloqueApartamentoUI.setAttribute("href", "/administracion/gestion_de_bloqueos_temporales/" + apartamentoIDV)
                bloqueApartamentoUI.setAttribute("vista", "/administracion/gestion_de_bloqueos_temporales/" + apartamentoIDV)
                bloqueApartamentoUI.addEventListener("click",() => { this.traductorCambioVista()})
                selectorEspacioBloqueos.appendChild(bloqueApartamentoUI)

                const tituloApartamentoUI = document.createElement("div")
                tituloApartamentoUI.classList.add("gestionBloqueoApartamento_tituloApartamentoUI")
                tituloApartamentoUI.classList.add("negrita")
                tituloApartamentoUI.textContent = apartamentoUI
                bloqueApartamentoUI.appendChild(tituloApartamentoUI)
                const numeroBloqueosUI = document.createElement("div")
                numeroBloqueosUI.classList.add("gestionBloqueoApartamento_numeroBloqueosUI")
                numeroBloqueosUI.textContent = mensajeNumeroBloqueos
                bloqueApartamentoUI.appendChild(numeroBloqueosUI)

            })
        }
    },
    traductorCambioVista: function (apartamento) {
        apartamento.preventDefault()
        apartamento.stopPropagation()
        const vista = apartamento.target.closest("[vista]").getAttribute("vista")
        const entrada = {
            vista: vista,
            tipoOrigen: "menuNavegador"
        }
        casaVitini.shell.navegacion.controladorVista(entrada)
    },
    bloqueosPorApartamento: {
        UI: async function (apartamento) {
            const main = document.querySelector("main")
            const instanciaUID = main.getAttribute("instanciaUID")
            const selectorTitulo = document.querySelector("[componente=titulo]")
            selectorTitulo.textContent = "Bloqueos temporales"
            const selectorEspacioBloqueos = document.querySelector("[componente=bloqueosTemporales]")
            const transaccion = {
                zona: "administracion/bloqueos/listaBloquoeosDelApartamento",
                apartamentoIDV: apartamento
            }
            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            const seccionRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
            if (!seccionRenderizada)
                if (respuestaServidor?.error) {
                    const info = {
                        titulo: "No existe el identificador del apartamento",
                        descripcion: respuestaServidor.error
                    }
                    casaVitini.ui.componentes.mensajeSimple(info)
                }
            if (respuestaServidor?.ok) {
                const apartamentoIDV = respuestaServidor?.apartamentoIDV
                const apartamentoUI = respuestaServidor?.apartamentoUI
                const bloqueos = respuestaServidor?.ok
                selectorTitulo.textContent = "Bloqueos temporales del " + apartamentoUI
                if (bloqueos.length === 0) {

                    const mensaje = document.createElement("p")
                    mensaje.textContent = "El apartamento no tiene ningún bloqueo definido"
                    main.appendChild(mensaje)

                }


                bloqueos.forEach((detalleBloqueo) => {
                    const tipoBloqueoIDV = detalleBloqueo.tipoBloqueoIDV
                    const fechaInicio = detalleBloqueo.fechaInicio
                    const fechaFin = detalleBloqueo.fechaFin
                    const motivo = detalleBloqueo.motivo
                    const zonaIDV = detalleBloqueo.zonaIDV
                    const bloqueoUID = detalleBloqueo.bloqueoUID



                    const bloqueBloqueoUI = document.createElement("div")
                    bloqueBloqueoUI.classList.add("listaBloqueos_bloqueBloqueoUI")
                    bloqueBloqueoUI.setAttribute("bloqueoUID", bloqueoUID)

                    let tipoBloqueoDefinicion
                    if (tipoBloqueoIDV === "rangoTemporal") {
                        tipoBloqueoDefinicion = "Rango temporal"
                    }
                    if (tipoBloqueoIDV === "permanente") {
                        tipoBloqueoDefinicion = "Permanente"
                    }
                    if (tipoBloqueoIDV === "rangoTemporal") {

                        const fechaInicio_huamna = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaInicio)
                        const fechaFin_huamna = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaFin)


                        const contenedorFecha = document.createElement("div")
                        contenedorFecha.classList.add("listaBloqueo_contenedorFecha")
                        const contenedorFechaInicio = document.createElement("div")
                        contenedorFechaInicio.classList.add("administracion_bloqueos_detallesBloqueo_contenedorFechaIndividual")
                        const tipoEntradaUITituloUI = document.createElement("div")
                        tipoEntradaUITituloUI.classList.add("administracion_bloqueos_detallesBloqueo_contenedorFechaIndividual_titulo")
                        tipoEntradaUITituloUI.classList.add("negrita")
                        tipoEntradaUITituloUI.textContent = "Fecha de inicio del bloqueo 1"
                        contenedorFechaInicio.appendChild(tipoEntradaUITituloUI)
                        const entradaUI = document.createElement("div")
                        entradaUI.classList.add("administracion_bloqueos_detallesBloqueo_contenedorFechaIndividual_fecha")
                        entradaUI.textContent = fechaInicio_huamna
                        contenedorFechaInicio.appendChild(entradaUI)
                        contenedorFecha.appendChild(contenedorFechaInicio)
                        const contenedorFechaFin = document.createElement("div")
                        contenedorFechaFin.classList.add("administracion_bloqueos_detallesBloqueo_contenedorFechaIndividual")
                        const tipoSalidaUITituloUI = document.createElement("div")
                        tipoSalidaUITituloUI.classList.add("administracion_bloqueos_detallesBloqueo_contenedorFechaIndividual_titulo")
                        tipoSalidaUITituloUI.classList.add("negrita")
                        tipoSalidaUITituloUI.textContent = "Fecha de fin del bloqueo"
                        contenedorFechaFin.appendChild(tipoSalidaUITituloUI)
                        const salidaUI = document.createElement("div")
                        salidaUI.classList.add("administracion_bloqueos_detallesBloqueo_contenedorFechaIndividual_fecha")
                        salidaUI.textContent = fechaFin_huamna
                        contenedorFechaFin.appendChild(salidaUI)
                        contenedorFecha.appendChild(contenedorFechaFin)
                        bloqueBloqueoUI.appendChild(contenedorFecha)
                    }

                    const contenedorTipoBloqueo = document.createElement("div")
                    contenedorTipoBloqueo.classList.add("listaBloqueos_contenedorTipoBloqueo")
                    const tipoBloqueoTituloUI = document.createElement("div")
                    tipoBloqueoTituloUI.classList.add("administracion_bloqueos_listaBloqueos_titutloTipoBloqueo")
                    tipoBloqueoTituloUI.classList.add("negrita")
                    tipoBloqueoTituloUI.textContent = "Tipo bloqueo"
                    contenedorTipoBloqueo.appendChild(tipoBloqueoTituloUI)
                    const tipoBloqueoUI = document.createElement("div")
                    tipoBloqueoUI.classList.add("listaBloqueos_tipoBloqueo")
                    tipoBloqueoUI.textContent = tipoBloqueoDefinicion
                    contenedorTipoBloqueo.appendChild(tipoBloqueoUI)
                    bloqueBloqueoUI.appendChild(contenedorTipoBloqueo)

                    const contenedorZonaUI = document.createElement("div")
                    contenedorZonaUI.classList.add("listaBloqueo_contenedorZonaUI")
                    const tituloZonaUI = document.createElement("div")
                    tituloZonaUI.classList.add("litaBloqueos_tituloZona")
                    tituloZonaUI.classList.add("negrita")
                    tituloZonaUI.textContent = "Contexto de aplicación"
                    contenedorZonaUI.appendChild(tituloZonaUI)
                    let zonaDefinicionUI
                    if (zonaIDV === "privado") {
                        zonaDefinicionUI = "Privado - Solo se aplica a la zona de administración"
                    }
                    if (zonaIDV === "publica") {
                        zonaDefinicionUI = "Público - Solo se aplica a la zona publica"
                    } if (zonaIDV === "global") {
                        zonaDefinicionUI = "Global - Se aplica a toda la zona, tando pública como administrativa"
                    }
                    const zonaUI = document.createElement("div")
                    zonaUI.classList.add("listaBloqueos_zonaUI")
                    zonaUI.textContent = zonaDefinicionUI
                    contenedorZonaUI.appendChild(zonaUI)
                    bloqueBloqueoUI.appendChild(contenedorZonaUI)
                    let motivoFinal
                    if (motivo === null) {
                        motivoFinal = "Este bloqueo no tiene ningún motivo definido, sería recomendable definir un motivo para poder identificar rápidamente porque existe este bloqueo"
                    } else {
                        motivoFinal = motivo
                    }


                    const contenedorMotivoBloqueo = document.createElement("div")
                    contenedorMotivoBloqueo.classList.add("listaBloqueos_contenedorTipoBloqueo")
                    const motivoBloqueoTituloUI = document.createElement("div")
                    motivoBloqueoTituloUI.classList.add("administracion_bloqueos_listaBloqueos_titutloTipoBloqueo")
                    motivoBloqueoTituloUI.classList.add("negrita")
                    motivoBloqueoTituloUI.textContent = "Motivo del bloqueo"
                    contenedorMotivoBloqueo.appendChild(motivoBloqueoTituloUI)
                    const motivoUI = document.createElement("div")
                    motivoUI.classList.add("listaBloqueos_motivo")
                    motivoUI.textContent = motivoFinal
                    contenedorMotivoBloqueo.appendChild(motivoUI)
                    bloqueBloqueoUI.appendChild(contenedorMotivoBloqueo)
                    selectorEspacioBloqueos.appendChild(bloqueBloqueoUI)



                    const contenedorBotones = document.createElement("div")
                    contenedorBotones.classList.add("flexVertical", "gap6")
                    bloqueBloqueoUI.appendChild(contenedorBotones)

                    const botonEntrarBloqueo = document.createElement("a")
                    botonEntrarBloqueo.setAttribute("href", "/administracion/gestion_de_bloqueos_temporales/" + apartamentoIDV + "/" + bloqueoUID)
                    botonEntrarBloqueo.setAttribute("vista", "/administracion/gestion_de_bloqueos_temporales/" + apartamentoIDV + "/" + bloqueoUID)
                    botonEntrarBloqueo.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                    botonEntrarBloqueo.classList.add("botonV1BlancoIzquierda")
                    botonEntrarBloqueo.textContent = "Editar bloqueo del alojamiento"
                    contenedorBotones.appendChild(botonEntrarBloqueo)

                    let urlCalendario
                    if (tipoBloqueoIDV === "rangoTemporal") {
                        const mes = fechaInicio.split("-")[1]
                        const ano = fechaInicio.split("-")[0]
                        urlCalendario = `/administracion/calendario/fecha:${Number(mes)}-${ano}/capa:todos_los_bloqueos`
                    } else if (tipoBloqueoIDV === "permanente") {
                        urlCalendario = "/administracion/calendario/capa:todos_los_bloqueos"
                    }

                    const botonIrACalendario = document.createElement("a")
                    botonIrACalendario.setAttribute("href", urlCalendario)
                    botonIrACalendario.setAttribute("vista", urlCalendario)
                    botonIrACalendario.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                    botonIrACalendario.classList.add("botonV1BlancoIzquierda")
                    botonIrACalendario.textContent = "Ver bloqueo en el calendario"
                    contenedorBotones.appendChild(botonIrACalendario)
                })
            }
        },
        traductorCambioVista: function (uidBloqueo) {
            uidBloqueo.preventDefault()
            uidBloqueo.stopPropagation()
            const vista = uidBloqueo.target.closest("[vista]").getAttribute("vista")
            const entrada = {
                "vista": vista,
                "tipoOrigen": "menuNavegador"
            }
            casaVitini.shell.navegacion.controladorVista(entrada)
        }
    },
    detallesDelBloqueo: {
        UI: async function (url) {
            const main = document.querySelector("main")
            const instanciaUID = main.getAttribute("instanciaUID")
            const apartmentoIDV = url[0]
            const bloqueoUID = url[1]
            const selectorTitulo = document.querySelector("[componente=titulo]")
            selectorTitulo.textContent = "Detalles del bloqueo"
            const selectorEspacioBloqueos = document.querySelector("[componente=bloqueosTemporales]")
            const transaccion = {
                zona: "administracion/bloqueos/detallesDelBloqueo",
                apartamentoIDV: apartmentoIDV,
                bloqueoUID: String(bloqueoUID)
            }
            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            const seccionRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
            if (!seccionRenderizada) { return }
            if (respuestaServidor?.error) {
                const info = {
                    titulo: "No existe el bloqueo del apartamento",
                    descripcion: respuestaServidor.error
                }
                casaVitini.ui.componentes.mensajeSimple(info)
            }
            if (respuestaServidor?.ok) {
                const apartamentoIDV = respuestaServidor?.apartamentoIDV
                const apartamentoUI = respuestaServidor?.apartamentoUI
                const detallesDelBloqueo = respuestaServidor?.ok
                const tipoBloqueoIDV = detallesDelBloqueo.tipoBloqueoIDV
                const fechaInicio = detallesDelBloqueo.fechaInicio
                const fechaFin = detallesDelBloqueo.fechaFin
                const motivo = detallesDelBloqueo.motivo
                const zonaIDV = detallesDelBloqueo.zonaIDV
                const bloqueoUID = detallesDelBloqueo.bloqueoUID
                selectorTitulo.textContent = "Detalles del bloqueo " + bloqueoUID + " del " + apartamentoUI
                const contenedorGlobal = document.createElement("div")
                contenedorGlobal.classList.add("detallesBloqueos_contenedorGlobal")
                contenedorGlobal.setAttribute("componente", "contenedorGlobal")

                const bloqueBloqueoUI = document.createElement("div")
                bloqueBloqueoUI.classList.add("detallesBloqueos_bloqueBloqueoUI")
                bloqueBloqueoUI.setAttribute("componente", "contenedorDelBloqueo")
                bloqueBloqueoUI.style.pointerEvents = "none"
                bloqueBloqueoUI.setAttribute("bloqueoUID", bloqueoUID)
                bloqueBloqueoUI.setAttribute("apartamentoIDV", apartamentoIDV)
                let tipoBloqueoDefinicion
                if (tipoBloqueoIDV === "rangoTemporal") {
                    tipoBloqueoDefinicion = "Rango temporal"
                }
                if (tipoBloqueoIDV === "permanente") {
                    tipoBloqueoDefinicion = "Permanente"
                }

                const contenedorTipoBloqueo = document.createElement("div")
                contenedorTipoBloqueo.classList.add("detallesloqueos_contenedorBloquesGlobales")
                const contenedorTipoBloqueoV2 = document.createElement("div")
                contenedorTipoBloqueoV2.classList.add("detallesBloqueo_contenedorTipoBloqueoV2")
                const tipoBloqueoTituloUI = document.createElement("div")
                tipoBloqueoTituloUI.classList.add("listaBloqueos_titulo")
                tipoBloqueoTituloUI.classList.add("negrita")
                tipoBloqueoTituloUI.textContent = "Tipo bloqueo"
                contenedorTipoBloqueoV2.appendChild(tipoBloqueoTituloUI)
                const tipoBloqueoUI = document.createElement("select")
                tipoBloqueoUI.classList.add("botonV1BlancoIzquierda_campo")
                tipoBloqueoUI.setAttribute("datoBloqueo", "tipoBloqueoIDV")
                tipoBloqueoUI.setAttribute("datoInicial", tipoBloqueoIDV)
                tipoBloqueoUI.textContent = tipoBloqueoDefinicion
                tipoBloqueoUI.addEventListener("change", () => {casaVitini.view.__sharedMethods__.controladorSelectorRangoTemporalUI()})
                const opcion_permamente = document.createElement("option");
                opcion_permamente.value = "permanente";
                if (tipoBloqueoIDV === "permanente") {
                    opcion_permamente.selected = true;
                }
                opcion_permamente.text = "Permanente";
                tipoBloqueoUI.add(opcion_permamente);
                const opcion_rangoTemporal = document.createElement("option");
                if (tipoBloqueoIDV === "rangoTemporal") {
                    opcion_rangoTemporal.selected = true;
                }
                opcion_rangoTemporal.value = "rangoTemporal";
                opcion_rangoTemporal.text = "Rango temporal";
                tipoBloqueoUI.add(opcion_rangoTemporal);
                contenedorTipoBloqueoV2.appendChild(tipoBloqueoUI)
                contenedorTipoBloqueo.appendChild(contenedorTipoBloqueoV2)
                bloqueBloqueoUI.appendChild(contenedorTipoBloqueo)
                const contenedorZonaUI = document.createElement("div")
                contenedorZonaUI.classList.add("detallesBloqueo_contenedorZonaUI")
                const tituloZonaUI = document.createElement("div")
                tituloZonaUI.classList.add("listaBloqueos_titulo")
                tituloZonaUI.classList.add("negrita")
                tituloZonaUI.textContent = "Contexto de aplicación"
                contenedorZonaUI.appendChild(tituloZonaUI)
                let zonaDefinicionUI
                if (zonaIDV === "privado") {
                    zonaDefinicionUI = "Privado - Solo se aplica a la zona de administración"
                }
                if (zonaIDV === "publica") {
                    zonaDefinicionUI = "Público - Solo se aplica a la zona publica"
                } if (zonaIDV === "global") {
                    zonaDefinicionUI = "Global - Se aplica a toda la zona, tando pública como administrativa"
                }
                const zonaUI = document.createElement("select")
                zonaUI.classList.add("botonV1BlancoIzquierda_campo")
                zonaUI.setAttribute("datoBloqueo", "zonaIDV")
                zonaUI.setAttribute("datoInicial", zonaIDV)
                const opcion_publico = document.createElement("option");
                if (zonaIDV === "publica") {
                    opcion_publico.selected = true;
                }
                opcion_publico.value = "publica";
                opcion_publico.text = "Público - Zona pública";
                zonaUI.add(opcion_publico);
                const opcion_privado = document.createElement("option");
                if (zonaIDV === "privado") {
                    opcion_privado.selected = true;
                }
                opcion_privado.value = "privado";
                opcion_privado.text = "Privado - Zona administrativa";
                zonaUI.add(opcion_privado);
                const opcion_global = document.createElement("option");
                if (zonaIDV === "global") {
                    opcion_global.selected = true;
                }
                opcion_global.value = "global";
                opcion_global.text = "Global - Zona pública y administrativa";
                zonaUI.add(opcion_global);
                contenedorZonaUI.appendChild(zonaUI)
                contenedorTipoBloqueo.appendChild(contenedorZonaUI)
                if (tipoBloqueoIDV === "rangoTemporal") {

                    const selectorRangoUI = casaVitini.view.__sharedMethods__.selectorRangoTemporalUI({
                        fechaInicio,
                        fechaFin,
                        modo: "estadoConDatos"
                    })
                    bloqueBloqueoUI.appendChild(selectorRangoUI)
                }
                if (tipoBloqueoIDV === "permanente") {
                    const metadatosconstructorRangoTemporalUI = {
                        modo: "estadoInicial"
                    }
                    const selectorRangoUI =  casaVitini.view.__sharedMethods__.selectorRangoTemporalUI(metadatosconstructorRangoTemporalUI)
                    bloqueBloqueoUI.appendChild(selectorRangoUI)
                }

                const motivoUI = document.createElement("textarea")
                motivoUI.classList.add("botonV1BlancoIzquierda_campo")
                motivoUI.setAttribute("componente", "contenedorMotivo")
                motivoUI.setAttribute("datoBloqueo", "motivoUI")
                if (motivo === null) {
                    motivoUI.setAttribute("datoInicial", "")
                } else {
                    motivoUI.setAttribute("datoInicial", motivo)
                }
                motivoUI.textContent = motivo
                motivoUI.rows = 10
                if (motivo === null) {
                    motivoUI.placeholder = "Este bloqueo no tiene ningún motivo definido, sería recomendable definir un motivo para poder identificar rápidamente porque existe este bloqueo"
                }
                bloqueBloqueoUI.appendChild(motivoUI)
                contenedorGlobal.appendChild(bloqueBloqueoUI)
                selectorEspacioBloqueos.appendChild(contenedorGlobal)
                casaVitini.view.__sharedMethods__.controladorBotonesGlobales.modificar()
            }
        },
        traductorCambioVista: function (uidBloqueo) {
            uidBloqueo.preventDefault()
            uidBloqueo.stopPropagation()
            const vista = uidBloqueo.target.closest("[vista]").getAttribute("vista")
            const entrada = {
                "vista": vista,
                "tipoOrigen": "menuNavegador"
            }
            casaVitini.shell.navegacion.controladorVista(entrada)
        },
        traductorConstructorCalendario: function (calendario) {
            const componente = calendario.target.closest("[calendario]")
            this.constructorCalendario(componente)
        },
        guardarCambios: async function () {
            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const mensaje = "Actualizando bloqueo..."
            const datosPantallaSuperpuesta = {
                instanciaUID: instanciaUID,
                mensaje: mensaje
            }
            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
            const selectorBloqueUID = document.querySelector("[bloqueoUID]")
            const bloqueUID = selectorBloqueUID.getAttribute("bloqueoUID")
            const selectorTipoBloqueo = document.querySelector("[datoBloqueo=tipoBloqueoIDV]")
            const selectorZona = document.querySelector("[datoBloqueo=zonaIDV]")
            const bloqueoParaActualizar = casaVitini.view.contructorObjeto()
            bloqueoParaActualizar.zona = "administracion/bloqueos/modificarBloqueo"
            bloqueoParaActualizar.bloqueoUID = String(bloqueUID)
            const selectorMotivo = document.querySelector("[datoBloqueo=motivoUI]")

            const respuestaServidor = await casaVitini.shell.servidor(bloqueoParaActualizar)
            const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
            if (!instanciaRenderizada) { return }
            instanciaRenderizada.remove()
            if (respuestaServidor?.error) {
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {

                const bloqueoActualizado = respuestaServidor.bloqueo
                const tipoBloqueoIDV = bloqueoActualizado.tipoBloqueoIDV
                const fechaInicio = bloqueoActualizado.fechaInicio
                const fechaFin = bloqueoActualizado.fechaFin
                const motivo = bloqueoActualizado.motivo || ""
                const zonaIDV = bloqueoActualizado.zonaIDV

                if (tipoBloqueoIDV === "rangoTemporal") {
                    const fechaInicio_elemento = document.querySelector("[calendario=entrada]")
                    const fechaFin_elemento = document.querySelector("[calendario=salida]")
                    const fechaInicio_ISO = fechaInicio_elemento.getAttribute("memoriaVolatil")
                    const fechaFin_ISO = fechaFin_elemento.getAttribute("memoriaVolatil")

                    const fechaInicio_humana = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaInicio)
                    const fechaFin_humana = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaFin)

                    document.querySelector("[fechaUI=fechaInicio]").textContent = fechaInicio_humana
                    fechaInicio_elemento.setAttribute("valorInicial", fechaInicio_ISO)

                    document.querySelector("[fechaUI=fechaFin]").textContent = fechaFin_humana
                    fechaFin_elemento.setAttribute("valorInicial", fechaFin_ISO)
                } else if (tipoBloqueoIDV === "permanente") {
                    const fechaInicio_elemento = document.querySelector("[calendario=entrada]")
                    const fechaFin_elemento = document.querySelector("[calendario=salida]")
                    fechaInicio_elemento.removeAttribute("memoriaVolatil")
                    fechaFin_elemento.removeAttribute("memoriaVolatil")

                    document.querySelector("[fechaUI=fechaInicio]").textContent = "(Seleccionar)"
                    fechaInicio_elemento.removeAttribute("valorInicial")

                    document.querySelector("[fechaUI=fechaFin]").textContent = "(Seleccionar)"
                    fechaFin_elemento.removeAttribute("valorInicial")
                }
                selectorTipoBloqueo.setAttribute("datoInicial", tipoBloqueoIDV)
                selectorTipoBloqueo.value = tipoBloqueoIDV
                selectorZona.setAttribute("datoInicial", zonaIDV)
                selectorZona.value = zonaIDV
                selectorMotivo.setAttribute("datoInicial", motivo)
                selectorMotivo.value = motivo
                casaVitini.view.__sharedMethods__.controladorBotonesGlobales.modificar()
                const selectorContendorBloqueo = document.querySelector("[componente=contenedorDelBloqueo]")
                selectorContendorBloqueo.style.pointerEvents = "none"
            }
        },
        eliminarBloqueo: {
            UI: async function () {

                const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                pantallaInmersiva.style.justifyContent = "center"

                const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

                const titulo = constructor.querySelector("[componente=titulo]")
                titulo.textContent = "Confirmar eliminar el bloqueo"
                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                mensaje.textContent = "Vas a eliminar el bloqueo y sus implicaciones serán inmediatas. ¿Estás de acuerdo?"

                const botonAceptar = constructor.querySelector("[boton=aceptar]")
                botonAceptar.textContent = "Confirmar la eliminación"
                botonAceptar.addEventListener("click",() => { this.confirmar()})
                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                botonCancelar.textContent = "Cancelar la eliminación"

                document.querySelector("main").appendChild(pantallaInmersiva)

            },
            confirmar: async function () {
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = "Elimiando bloqueo..."
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const bloqueoUID = document.querySelector("[bloqueoUID]").getAttribute("bloqueoUID")
                const apartamentoIDV = document.querySelector("[apartamentoIDV]").getAttribute("apartamentoIDV")
                const transaccion = {
                    zona: "administracion/bloqueos/eliminarBloqueo",
                    bloqueoUID: String(bloqueoUID)
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
                    const tipoRetroceso = respuestaServidor?.tipoRetroceso
                    let vistaFinal
                    if (tipoRetroceso === "aPortada") {
                        vistaFinal = `/administracion/gestion_de_bloqueos_temporales`
                    }
                    if (tipoRetroceso === "aApartamento") {
                        vistaFinal = `/administracion/gestion_de_bloqueos_temporales/` + apartamentoIDV
                    }
                    const navegacion = {
                        vista: vistaFinal,

                    }
                    casaVitini.shell.navegacion.controladorVista(navegacion)
                }
            }
        },
        cancelarCambios: function () {

            const tipoBloqueo = document.querySelector("[datoBloqueo=tipoBloqueoIDV]")
            const zona = document.querySelector("[datoBloqueo=zonaIDV]")
            const motivo = document.querySelector("[datoBloqueo=motivoUI]")
            const fechaInicio = document.querySelector("[calendario=entrada]")
            const fechaFin = document.querySelector("[calendario=salida]")
            const tipoBloqueoInicial = tipoBloqueo.getAttribute("datoInicial")
            const zonaInicial = zona.getAttribute("datoInicial")
            const motivoInicial = motivo.getAttribute("datoInicial") || ""
            const fechaInicio_valorInicial = fechaInicio.getAttribute("valorInicial")
            const fechaFin_valorInicial = fechaFin.getAttribute("valorInicial")

            if (tipoBloqueoInicial === "rangoTemporal") {
                const fechaInicio_humana = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaInicio_valorInicial)
                const fechaFinal_humana = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaFin_valorInicial)

                fechaInicio.querySelector("[fechaUI=fechaInicio]").textContent = fechaInicio_humana
                fechaFin.querySelector("[fechaUI=fechaFin]").textContent = fechaFinal_humana
            }

            tipoBloqueo.value = tipoBloqueoInicial
            zona.value = zonaInicial
            motivo.value = motivoInicial
            const contenedorFechas = document.querySelector("[componente=contenedorFechas]")
            if (tipoBloqueoInicial === "rangoTemporal") {
                contenedorFechas.style.display = "flex"
            }
            if (tipoBloqueoInicial === "permanente") {
                contenedorFechas.style.display = "none"
            }

            const selectorNuevasPropuestas = document.querySelectorAll("[componente=bloqueNuevaPropuesta]")
            selectorNuevasPropuestas.forEach((nuevaPropuesta) => {
                nuevaPropuesta.remove()
            })
        }
    },


}