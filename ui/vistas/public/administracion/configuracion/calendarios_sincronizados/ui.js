casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/configuracion")
        const marcoElastico = document.querySelector("[componente=marcoElastico]")
        marcoElastico.style.gap = "4px"
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const comandoInicial = granuladoURL.directorios[granuladoURL.directorios.length - 1]
        if (comandoInicial === "calendarios_sincronizados" && !granuladoURL.parametros.calendario) {

            const divContenedorAirBnb = document.createElement("div");
            divContenedorAirBnb.classList.add("contenedorAirBnb");
            const divBarraHerramientas = document.createElement("div");
            divBarraHerramientas.classList.add("barraHerramientas");
            const pTituloContenedor = document.createElement("p");
            pTituloContenedor.classList.add("tituloContenedor");
            pTituloContenedor.textContent = "Calendarios sincronizados con Airbnb";
            const aBotonMas = document.createElement("a");
            aBotonMas.classList.add("botonV1");

            aBotonMas.setAttribute("href", "/administracion/configuracion/calendarios_sincronizados/crear_calendario");
            aBotonMas.setAttribute("componente", "botonGlobal");
            aBotonMas.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)

            aBotonMas.textContent = "Añadir calendario";
            const divContenedorCalendarios = document.createElement("div");
            divContenedorCalendarios.classList.add("contenedorCalendarios");
            divContenedorCalendarios.setAttribute("componente", "contendorCalendariosAirbnb");
            const pTituloInfo = document.createElement("p");
            pTituloInfo.classList.add("tituloInfo");
            pTituloInfo.textContent = "Esperando información...";

            divBarraHerramientas.appendChild(pTituloContenedor);
            divBarraHerramientas.appendChild(aBotonMas);
            divContenedorAirBnb.appendChild(divBarraHerramientas);
            divContenedorAirBnb.appendChild(divContenedorCalendarios);
            divContenedorCalendarios.appendChild(pTituloInfo);
            const selectorEspacioCalendarios = document.querySelector("[componente=calendariosSincronizados]")
            selectorEspacioCalendarios.appendChild(divContenedorAirBnb);
            const transaccion = {
                zona: "/administracion/configuracion/calendariosSincronizados/obtenerCalendarios",
                plataformaCalendarios: "airbnb"
            }
            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            if (respuestaServidor?.error) {
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                const calendariosEncontrados = respuestaServidor.ok
                const selectorContenedor = document.querySelector("[componente=contendorCalendariosAirbnb]")
                selectorContenedor.innerHTML = null
                if (calendariosEncontrados.length === 0) {
                    const infoNoCalendarios = document.createElement("p")
                    infoNoCalendarios.classList.add("tituloInfo")
                    infoNoCalendarios.textContent = "No hay ningun calendario sincronizado"
                    selectorContenedor.appendChild(infoNoCalendarios)
                } else {
                    for (const detallesDelCalendario of calendariosEncontrados) {
                        const calendarioUID = detallesDelCalendario.calendarioUID
                        const url = detallesDelCalendario.url
                        const nombre = detallesDelCalendario.nombre
                        const apartamentoIDV = detallesDelCalendario.apartamentoIDV
                        const apartamentoUI = detallesDelCalendario.apartamentoUI
                        const publicoUID = detallesDelCalendario.publicoUID
                        const plataformaOrigen = detallesDelCalendario.plataformaOrigen
                        const dataIcal = detallesDelCalendario.dataIcal
                        const dominioActual = window.location.hostname
                        const contenedorCalendarioIndiviudal = document.createElement("div")
                        contenedorCalendarioIndiviudal.classList.add("contenedorCalendarioIndividual")
                        contenedorCalendarioIndiviudal.setAttribute("calendarioUID", calendarioUID)
                        const datosCalendario = document.createElement("div")
                        datosCalendario.classList.add("contenedorDatosCalendario")
                        const nombreCalendario = document.createElement("div")
                        nombreCalendario.classList.add("negrita", "paddingVertical14")
                        nombreCalendario.textContent = nombre
                        datosCalendario.appendChild(nombreCalendario)
                        titulo = document.createElement("p")
                        titulo.classList.add("tituloDatoCalendario")
                        titulo.textContent = "Apartamento sincronizado"
                        datosCalendario.appendChild(titulo)
                        const apartamentoEnlazado = document.createElement("div")
                        apartamentoEnlazado.classList.add("apartamentoEnlazado")
                        apartamentoEnlazado.textContent = apartamentoUI + ` (${apartamentoIDV})`
                        datosCalendario.appendChild(apartamentoEnlazado)
                        titulo = document.createElement("p")
                        titulo.classList.add("tituloDatoCalendario")
                        titulo.textContent = "URL del calendario"
                        datosCalendario.appendChild(titulo)
                        const urlCalendarioImportado = document.createElement("div")
                        urlCalendarioImportado.classList.add("urlCalendario")
                        urlCalendarioImportado.textContent = url
                        datosCalendario.appendChild(urlCalendarioImportado)
                        titulo = document.createElement("p")
                        titulo.classList.add("tituloDatoCalendario")
                        titulo.textContent = "URL del calendario para exportar formato ICS"
                        datosCalendario.appendChild(titulo)
                        const urlCalendarioExportarICS = document.createElement("div")
                        urlCalendarioExportarICS.classList.add("urlCalendario")
                        urlCalendarioExportarICS.textContent = "https://" + dominioActual + "/calendarios_compartidos/formato:ics_v2/" + publicoUID
                        datosCalendario.appendChild(urlCalendarioExportarICS)
                        contenedorCalendarioIndiviudal.appendChild(datosCalendario)

                        titulo = document.createElement("p")
                        titulo.classList.add("tituloDatoCalendario")
                        titulo.textContent = "URL del calendario para exportar formato ICS Airbnb"
                        datosCalendario.appendChild(titulo)
                        const urlCalendarioExportarICSAirbnbn = document.createElement("div")
                        urlCalendarioExportarICSAirbnbn.classList.add("urlCalendario")
                        urlCalendarioExportarICSAirbnbn.textContent = "https://" + dominioActual + "/calendarios_compartidos/formato:ics_v2_airbnb/" + publicoUID
                        datosCalendario.appendChild(urlCalendarioExportarICSAirbnbn)
                        contenedorCalendarioIndiviudal.appendChild(datosCalendario)


                        const contenedorBotonesCalendario = document.createElement("div")
                        contenedorBotonesCalendario.classList.add("contenedorBotonesCalendario")
                        const botonEliminar = document.createElement("div")
                        botonEliminar.classList.add("botonCalendario")
                        botonEliminar.textContent = "Eliminar calendario"
                        botonEliminar.addEventListener("click", () => {
                            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                            const contenedorElimianr = document.createElement("div")
                            contenedorElimianr.classList.add("contenedorEliminar")
                            const titulo = document.createElement("div")
                            titulo.classList.add("tituloGris", "textoCentrado", "padding6")
                            titulo.textContent = `Eliminar el calendario sincronizado de Airbnb`
                            contenedorElimianr.appendChild(titulo)
                            const mensaje = document.createElement("div")
                            mensaje.classList.add("textoCentrado", "padding6")
                            mensaje.textContent = `¿Estas de acuerdo en eliminar el calendario con nombre ${nombre} enlazado al ${apartamentoUI}?`
                            contenedorElimianr.appendChild(mensaje)
                            const botonEliminar = document.createElement("div")
                            botonEliminar.classList.add("botonV1BlancoIzquierda")
                            botonEliminar.textContent = "Eliminar calendario definitivamente"
                            botonEliminar.addEventListener("click", async () => {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                const metadatosPantallaCarga = {
                                    mensaje: "Actualizando calendario...",
                                    instanciaUID: instanciaUID,
                                }
                                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(metadatosPantallaCarga)
                                const transaccion = {
                                    zona: "administracion/configuracion/calendariosSincronizados/airbnb/eliminarCalendario",
                                    calendarioUID: calendarioUID
                                }
                                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                                document.querySelectorAll(`[instanciaUID="${instanciaUID}"][pantallaSuperpuesta=pantallaCargaSuperpuesta]`).forEach((pantalla) => {
                                    document.body.style.removeProperty("overflow")
                                    pantalla.remove()
                                })
                                const selectorCalendariosSincronizados = document.querySelector(`[componente=calendariosSincronizados]`)
                                if (respuestaServidor?.error) {
                                    if (selectorCalendariosSincronizados) {
                                        casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.error)
                                    }
                                }
                                if (respuestaServidor?.ok) {
                                    if (selectorCalendariosSincronizados) {
                                        selectorCalendariosSincronizados.querySelector(`[calendarioUID="${calendarioUID}"]`).remove()
                                    }
                                }
                            })
                            contenedorElimianr.appendChild(botonEliminar)
                            const botonCancelar = document.createElement("div")
                            botonCancelar.classList.add("botonV1")
                            botonCancelar.textContent = "Cancelar y volver a la lista de calendarios"
                            botonCancelar.addEventListener("click", () => {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            })
                            contenedorElimianr.appendChild(botonCancelar)
                            const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                            pantallaInmersiva.querySelector("[contenedor=contenidoAdvertenciaInmersiva]").appendChild(contenedorElimianr)
                            document.body.appendChild(pantallaInmersiva)
                        })
                        contenedorBotonesCalendario.appendChild(botonEliminar)
                        const botonModificar = document.createElement("a")
                        botonModificar.classList.add("botonCalendario")
                        botonModificar.textContent = "Modificar calendario"
                        botonModificar.href = `/administracion/configuracion/calendarios_sincronizados/calendario:${calendarioUID}`
                        botonModificar.addEventListener("click", (boton) => {
                            boton.preventDefault()
                            const vista = `/administracion/configuracion/calendarios_sincronizados/calendario:${calendarioUID}`
                            const navegacion = {
                                vista: vista,
                                tipoOrigen: "menuNavegador"
                            }
                            casaVitini.shell.navegacion.controladorVista(navegacion)
                        })
                        contenedorBotonesCalendario.appendChild(botonModificar)
                        contenedorCalendarioIndiviudal.appendChild(contenedorBotonesCalendario)
                        selectorContenedor.appendChild(contenedorCalendarioIndiviudal)
                    }
                }
            }
        } else if (granuladoURL.parametros.calendario) {
            const calenadrioUID = granuladoURL.parametros.calendario

            const transaccion = {
                zona: "/administracion/configuracion/calendariosSincronizados/detallesDelCalendario",
                calendarioUID: calenadrioUID
            }

            const respuestaServidor = await casaVitini.shell.servidor(transaccion)

            if (respuestaServidor?.error) {
                const selectorEspacioCalendarios = document.querySelector("[componente=calendariosSincronizados]")
                const marcoError = document.createElement("div")
                marcoError.classList.add("marcoError")
                const errorInfo = document.createElement("div")
                errorInfo.classList.add("errorInfoCalendarios")
                errorInfo.textContent = "No existe ningún calendario con este identificador, por favor revisa el identificador."
                marcoError.appendChild(errorInfo)
                selectorEspacioCalendarios.appendChild(marcoError)
            }
            if (respuestaServidor?.ok) {
                const detallesDelCalendario = respuestaServidor.ok
                const plataformaOrigen = detallesDelCalendario.plataformaOrigenIDV
                if (plataformaOrigen === "airbnb") {
                    this.editarCalendarioUI(detallesDelCalendario)
                }
            }
        }
    },
    editarCalendarioUI: async function (detallesDelCalendario) {

        const calendarioUID = detallesDelCalendario.calendarioUID
        const nombre = detallesDelCalendario.nombre
        const url = detallesDelCalendario.url
        const apartamentoIDV = detallesDelCalendario.apartamentoIDV
        const plataformaOrigen = detallesDelCalendario.plataformaOrigenIDV
        const apartamentoUI = detallesDelCalendario.apartamentoUI
        const publicoUID = detallesDelCalendario.publicoUID
        const dominioActual = window.location.hostname

        const urlExportacion = "https://" + dominioActual + "/calendarios_compartidos/formato:ics_v2/" + publicoUID
        const urlExportacionAirbnb = "https://" + dominioActual + "/calendarios_compartidos/formato:ics_v2_airbnb/" + publicoUID


        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const plataformaOrigenUI = plataformaOrigen.charAt(0).toUpperCase() + plataformaOrigen.slice(1);
        const selectorTitulo = document.querySelector("[componente=titutoGlobal]")
        selectorTitulo.textContent = `Detalles del calendario de ${plataformaOrigenUI}`
        const selectorEspacioCalendarios = document.querySelector("[componente=calendariosSincronizados]")
        const formularioUI = await this.__sharedMethods__.formularioCalendario({
            modo: "editar"
        });
        formularioUI.setAttribute("instanciaUID", instanciaUID)
        formularioUI.setAttribute("calendarioUID", calendarioUID)
        const nombreInput = formularioUI.querySelector("[campo=nombre]");
        nombreInput.value = nombre;
        nombreInput.setAttribute("valorInicial", nombre);
        const apartamentoIDVSelect = formularioUI.querySelector("[campo=apartamentoIDV]");
        apartamentoIDVSelect.value = apartamentoIDV;
        apartamentoIDVSelect.setAttribute("valorInicial", apartamentoIDV);
        const urlExportacionUI = formularioUI.querySelector("[data=urlExportacion]");
        urlExportacionUI.textContent = urlExportacion;
        const urlExportacionAirbnbUI = formularioUI.querySelector("[data=urlExportacionAirbnbn]");
        urlExportacionAirbnbUI.textContent = urlExportacionAirbnb;
        const urlInput = formularioUI.querySelector("[campo=url]");
        urlInput.value = url;
        urlInput.setAttribute("valorInicial", url);
        selectorEspacioCalendarios.appendChild(formularioUI);
        const marcoBotones = document.createElement("div")
        marcoBotones.classList.add("marcoBotones")
        const botonCrearCalendario = document.createElement("div")
        botonCrearCalendario.classList.add("botonV1BlancoIzquierda_campo")
        botonCrearCalendario.textContent = "Guardar cambios"
        botonCrearCalendario.addEventListener("click", async () => {
            const transaccion = {
                zona: "administracion/configuracion/calendariosSincronizados/airbnb/actualizarCalendario",
                calendarioUID: calendarioUID
            }
            document.querySelectorAll("[campo]").forEach((campo) => {
                const nombreCampo = campo.getAttribute("campo")
                const valorCampo = campo.value
                transaccion[nombreCampo] = valorCampo

            })
            const metadatosPantallaCarga = {
                mensaje: "Actualizando calendario...",
                instanciaUID: instanciaUID,
            }
            document.body.style.overflow = "hidden";
            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(metadatosPantallaCarga)

            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            document.querySelectorAll(`[instanciaUID="${instanciaUID}"][pantallaSuperpuesta=pantallaCargaSuperpuesta]`).forEach((pantalla) => {
                document.body.style.removeProperty("overflow")
                pantalla.remove()
            })
            const selectorInstanciaFormularioUI = document.querySelector(`[componente=formularioUI][instanciaUID="${instanciaUID}"]`)
            if (respuestaServidor?.error) {
                if (selectorInstanciaFormularioUI) {
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.error)
                }
            }
            if (respuestaServidor?.ok) {
                if (selectorInstanciaFormularioUI) {
                    document.querySelectorAll("[campo]").forEach((campo) => {
                        const valorCampo = campo.value
                        const valorInicial = campo.getAttribute("valorInicial")
                        if (valorCampo !== valorInicial) {
                            campo.setAttribute("valorInicial", valorCampo)
                        }
                    })
                }
            }
        })
        marcoBotones.appendChild(botonCrearCalendario)
        const botonCancelar = document.createElement("div")
        botonCancelar.classList.add("botonV1BlancoIzquierda_campo")
        botonCancelar.textContent = "Restablecer cambios"
        botonCancelar.addEventListener("click", async () => {
            document.querySelectorAll("[campo]").forEach((campo) => {
                const valorInicial = campo.getAttribute("valorInicial")
                campo.value = valorInicial
            })
        })
        marcoBotones.appendChild(botonCancelar)
        selectorEspacioCalendarios.appendChild(marcoBotones)
    },
}