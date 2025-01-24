casaVitini.view = {
    start: async function () {
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const comandoInicial = granuladoURL.directorios[granuladoURL.directorios.length - 1]
        const main = document.querySelector("main")
        if (comandoInicial === "gestion_de_ofertas" && Object.keys(granuladoURL.parametros).length === 0) {
            main.setAttribute("zonaCSS", "administracion/ofertas")
            this.portada.portadaUI()
        } else if (granuladoURL.parametros.oferta) {
            main.setAttribute("zonaCSS", "administracion/ofertas/ofertaUI")
            this.detallesOferta.obtenerDetallesOferta(granuladoURL.parametros.oferta)
        } else {
            const info = {
                titulo: "No existe ninguna oferta con ese identificador",
                descripcion: "La oferta que buscas con ese identificador no existe. Comprueba el identificador de la reserva"
            }
            casaVitini.ui.componentes.mensajeSimple(info)
        }
    },
    portada: {
        portadaUI: async function () {
            const espacioOfertas = document.querySelector("[componente=espacioOfertas]")
            const contenedor = document.createElement("div")
            contenedor.classList.add("gestionDeOfertasContenedor")
            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add("gestionDeOfertasContenedorBotones")
            const botonCrearOfertas = document.createElement("a")
            botonCrearOfertas.classList.add("gestionDeOfertasBotonCrearOferta")
            botonCrearOfertas.textContent = "Crear una nueva oferta"
            botonCrearOfertas.setAttribute("href", "/administracion/gestion_de_ofertas/crear_oferta")
            botonCrearOfertas.setAttribute("vista", "/administracion/gestion_de_ofertas/crear_oferta")
            botonCrearOfertas.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            contenedorBotones.appendChild(botonCrearOfertas)
            contenedor.appendChild(contenedorBotones)
            const contenedorOfertas = document.createElement("div")
            contenedorOfertas.classList.add("gestionDeOfertasContedorOfertas")
            contenedorOfertas.setAttribute("componente", "espacioListaOfertas")
            contenedor.appendChild(contenedorOfertas)
            espacioOfertas.appendChild(contenedor)
            const transaccion = {
                zona: "administracion/ofertas/listasOfertasAdministracion"
            }
            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            if (respuestaServidor?.error) {
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                const espacioListaOfertas = document.querySelector("[componente=espacioListaOfertas]")

                const ofertasEncontradas = respuestaServidor?.ok
                if (typeof ofertasEncontradas === "string") {
                    const ofertaUI = document.createElement("a")
                    ofertaUI.classList.add("ofertaUINoHay")
                    const tituloOferta = document.createElement("p")
                    tituloOferta.classList.add("ofertaUITituloOferta")
                    tituloOferta.textContent = "No hay ofertas configuradas"
                    ofertaUI.appendChild(tituloOferta)
                    espacioListaOfertas.appendChild(ofertaUI)

                }
                if (Array.isArray(ofertasEncontradas) && ofertasEncontradas.length > 0) {
                    ofertasEncontradas.forEach((detalleOferta) => {

                        const ofertaUID = detalleOferta.ofertaUID
                        const nombreOferta = detalleOferta.nombreOferta
                        const fechaInicio = detalleOferta.fechaInicio
                        const fechaFinal = detalleOferta.fechaFinal
                        const entidadIDV = detalleOferta.entidadIDV
                        const estadoIDV = detalleOferta.estadoIDV
                        const zonaIDV = detalleOferta.zonaIDV
                        const condicionesArray = detalleOferta.condicionesArray
                        const descuentosJSON = detalleOferta.descuentosJSON

                        const estadoUI = {
                            activado: "Activada",
                            desactivado: "Desactivada"
                        }
                        const entidadUI = {
                            reserva: "Reserva"
                        }
                        const zonaUI = {
                            global: "Global",
                            privada: "Privada",
                            publica: "Pública"
                        }
                        const ofertaUI = document.createElement("a")
                        ofertaUI.classList.add("ofertaUI")
                        ofertaUI.setAttribute("ofertaUID", ofertaUID)
                        ofertaUI.setAttribute("href", "/administracion/gestion_de_ofertas/oferta:" + ofertaUID)
                        ofertaUI.setAttribute("vista", "/administracion/gestion_de_ofertas/oferta:" + ofertaUID)
                        ofertaUI.addEventListener("click", (e) => { casaVitini.view.traductorCambioVista(e) })
                        const tituloOferta = document.createElement("p")
                        tituloOferta.classList.add("ofertaUITituloOferta")
                        tituloOferta.textContent = nombreOferta
                        ofertaUI.appendChild(tituloOferta)
                        const contenedorGlobalOferta = document.createElement("div")
                        contenedorGlobalOferta.classList.add("ofertaUIContenedorGlobalOferta")

                        const contenedorDetalleOferta = document.createElement("div")
                        contenedorDetalleOferta.classList.add("ofertaUIContenedorDetalles")

                        const fechaInicioContenedor = document.createElement("div")
                        fechaInicioContenedor.classList.add("ofertaUIFechaContenedor")
                        const tituloFechaInicio = document.createElement("div")
                        tituloFechaInicio.classList.add("ofertaUITituloFecha")
                        tituloFechaInicio.textContent = "Fecha de inicio"
                        fechaInicioContenedor.appendChild(tituloFechaInicio)
                        const datoFechaInicio = document.createElement("div")
                        datoFechaInicio.classList.add("ofertaUIDatoFecha")
                        datoFechaInicio.textContent = fechaInicio
                        fechaInicioContenedor.appendChild(datoFechaInicio)
                        contenedorDetalleOferta.appendChild(fechaInicioContenedor)
                        const fechaFinContenedor = document.createElement("div")
                        fechaFinContenedor.classList.add("ofertaUIFechaContenedor")
                        const tituloFechaFin = document.createElement("div")
                        tituloFechaFin.classList.add("ofertaUITituloFecha")
                        tituloFechaFin.textContent = "Fecha de fin"
                        fechaFinContenedor.appendChild(tituloFechaFin)
                        const datoFechaFin = document.createElement("div")
                        datoFechaFin.classList.add("ofertaUIDatoFecha")
                        datoFechaFin.textContent = fechaFinal
                        fechaFinContenedor.appendChild(datoFechaFin)
                        contenedorDetalleOferta.appendChild(fechaFinContenedor)
                        contenedorGlobalOferta.appendChild(contenedorDetalleOferta)
                        ofertaUI.appendChild(contenedorGlobalOferta)
                        let contenedorPropiedadesOferta = document.createElement("div")
                        contenedorPropiedadesOferta.classList.add("ofertaUIContenedorPropiedades")

                        const bloqueEstado = document.createElement("div")
                        bloqueEstado.classList.add("ofertaUIBloqueOpcion")
                        const tituloEstado = document.createElement("p")
                        tituloEstado.classList.add("ofertaUITituloOpcion")
                        tituloEstado.textContent = "Estado de la oferta"
                        bloqueEstado.appendChild(tituloEstado)
                        const estadoUIX = document.createElement("p")
                        estadoUIX.classList.add("ofertaUIDatoOpcion")
                        estadoUIX.textContent = estadoUI[estadoIDV]
                        bloqueEstado.appendChild(estadoUIX)
                        contenedorPropiedadesOferta.appendChild(bloqueEstado)



                        let bloqueOpcion = document.createElement("div")
                        bloqueOpcion.classList.add("ofertaUIBloqueOpcion")
                        let tituloOpcion = document.createElement("p")
                        tituloOpcion.classList.add("ofertaUITituloOpcion")
                        tituloOpcion.textContent = "Entidad"
                        bloqueOpcion.appendChild(tituloOpcion)
                        let datoOpcion = document.createElement("p")
                        datoOpcion.classList.add("ofertaUIDatoOpcion")
                        datoOpcion.textContent = entidadUI[entidadIDV]
                        bloqueOpcion.appendChild(datoOpcion)
                        contenedorPropiedadesOferta.appendChild(bloqueOpcion)


                        tituloOpcion = document.createElement("p")
                        tituloOpcion.classList.add("ofertaUITituloOpcion")
                        tituloOpcion.textContent = "Zona de publicación"
                        bloqueOpcion.appendChild(tituloOpcion)
                        datoOpcion = document.createElement("p")
                        datoOpcion.classList.add("ofertaUIDatoOpcion")
                        datoOpcion.textContent = zonaUI[zonaIDV]
                        bloqueOpcion.appendChild(datoOpcion)

                        contenedorPropiedadesOferta.appendChild(bloqueOpcion)
                        contenedorGlobalOferta.appendChild(contenedorPropiedadesOferta)

                        const contenedorCYD = document.createElement("div")
                        contenedorCYD.classList.add(
                            "flexVertical",
                            "gap6"
                        )
                        contenedorCYD.setAttribute("contenedor", "condicionesDescuentos")

                        const condicionesUI = this.condicionesUI({
                            condicionesArray
                        })
                        contenedorCYD.appendChild(condicionesUI)

                        const descuentoUI = this.descuentosUI({
                            descuentosJSON
                        })
                        contenedorCYD.appendChild(descuentoUI)

                        contenedorGlobalOferta.appendChild(contenedorCYD)
                        espacioListaOfertas.appendChild(ofertaUI)
                    })
                }
            }
        },
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
        descuentosUI: function (data) {
            const descuentosJSON = data.descuentosJSON
            const tipoDescuento = descuentosJSON?.tipoDescuento
            const subTipoDescuento = descuentosJSON?.subTipoDescuento

            const contenedorDescuentos = document.createElement("div")
            contenedorDescuentos.setAttribute("contenedor", "descuentos")
            contenedorDescuentos.classList.add(
                "flexVertical",
                "backgroundGrey1",
                "padding12",
                "borderRadius14",
                "gap6"
            )
            const tituloContendor = document.createElement("div")
            tituloContendor.classList.add(
                "negrita",

            )
            tituloContendor.textContent = "Descuentos de la oferta"
            contenedorDescuentos.appendChild(tituloContendor)

            const desfinicionDescuento = casaVitini
                .ui
                .componentes
                .contenedorFinanciero
                .componentesUI
                .ofertas
                .componentesUI.definicionDescuentos({
                    tipoDescuento,
                    subTipoDescuento,
                    descuentosJSON
                })
            contenedorDescuentos.appendChild(desfinicionDescuento)

            return contenedorDescuentos
        },
    },
    detallesOferta: {
        obtenerDetallesOferta: async function (ofertaUID) {
            const instanciaUID = document.querySelector("main").getAttribute("instanciaUID")
            const transaccion = {
                zona: "administracion/ofertas/detallesOferta",
                ofertaUID: ofertaUID
            }
            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            const seccionRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
            if (!seccionRenderizada) { return }
            if (respuestaServidor?.error) {
                const info = {
                    titulo: "No existe ningúna oferta con ese identificador",
                    descripcion: "Revisa el identificador porque esta oferta que buscas no existe.Quizás este identificador existió y borraste esta oferta.."
                }
                casaVitini.ui.componentes.mensajeSimple(info)
            } else if (respuestaServidor?.ok) {
                const oferta = respuestaServidor.ok
                const ofertaUID = oferta.ofertaUID
                const espacioOfertasGlobal = document.querySelector("[componente=espacioOfertas]")
                espacioOfertasGlobal.setAttribute("instantanea", JSON.stringify(oferta))
                espacioOfertasGlobal.setAttribute("ofertaUID", ofertaUID)

                espacioOfertasGlobal.innerHTML = null
                const ofertaUI = casaVitini.view.__sharedMethods__.componenteUI.detalleUI("editarOferta")
                espacioOfertasGlobal.appendChild(ofertaUI)
                await this.aplicaData({
                    oferta: oferta,
                    instanciaUID_destino: instanciaUID
                })
                const selectorBoton = seccionRenderizada.querySelector("[boton=anadirCondicion]")
                selectorBoton.removeAttribute("style")
                const botonesModificacion = casaVitini.view.__sharedMethods__.componenteUI.botonesDuranteModificacionOferta()
                espacioOfertasGlobal.appendChild(botonesModificacion)
            }
        },
        aplicaData: async function (data) {

            const oferta = data.oferta
            const instanciaUID_destino = data.instanciaUID_destino
            const ofertaUI = document.querySelector(`[instanciaUID="${instanciaUID_destino}"]`)

            const nombreOferta = oferta.nombreOferta
            const ofertaUID = oferta.ofertaUID
            const fechaInicio_ISO = oferta.fechaInicio
            const fechaFinal_ISO = oferta.fechaFinal
            const condicionesArray = oferta.condicionesArray
            const descuentosJSON = oferta.descuentosJSON
            const estadoIDV = oferta.estadoIDV
            const zonaIDV = oferta.zonaIDV
            const modo = data.modo || null

            const fechaInicio_humana = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaInicio_ISO)
            const fechaFinal_humana = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaFinal_ISO)

            const espacioOfertasGlobal = ofertaUI.querySelector("[componente=espacioOfertas]")
            espacioOfertasGlobal.setAttribute("ofertaUID", String(ofertaUID))
            espacioOfertasGlobal.setAttribute("modo", "editarOferta")


            if (modo !== "resversion") {
                const selectorEstadoOfertaUI = ofertaUI.querySelector("[componente=estadoOferta]")
                if (estadoIDV === "desactivado") {
                    selectorEstadoOfertaUI.setAttribute("estadoOferta", estadoIDV)
                    selectorEstadoOfertaUI.style.background = "#ff000091"
                    selectorEstadoOfertaUI.innerHTML = "Oferta desactivada"
                }
                if (estadoIDV === "activado") {
                    selectorEstadoOfertaUI.setAttribute("estadoOferta", estadoIDV)
                    selectorEstadoOfertaUI.style.background = "#00ff006e"
                    selectorEstadoOfertaUI.innerHTML = "Oferta activada"
                }
            }


            const campoNombreOferta = ofertaUI.querySelector("[campoOferta=nombreOferta]")
            campoNombreOferta.value = nombreOferta

            const selectorFechaInicio = ofertaUI.querySelector("[calendario=entrada]")
            selectorFechaInicio.setAttribute("memoriaVolatil", fechaInicio_ISO)
            const selectorFechaInicioUI = ofertaUI.querySelector("[fechaUI=fechaInicio]")
            selectorFechaInicioUI.textContent = fechaInicio_humana

            const selectorZonaIDV = ofertaUI.querySelector("[campo=zonaIDV]")
            selectorZonaIDV.value = zonaIDV

            const selectorFechaFin = ofertaUI.querySelector("[calendario=salida]")
            selectorFechaFin.setAttribute("memoriaVolatil", fechaFinal_ISO)
            const selectorFechaFinUI = ofertaUI.querySelector("[fechaUI=fechaFin]")
            selectorFechaFinUI.textContent = fechaFinal_humana

            const contenedorSuperBloque = ofertaUI.querySelector("[contenedor=superBloque]")
            const spinner = casaVitini.ui.componentes.spinnerSimple()
            contenedorSuperBloque.appendChild(spinner)


            const contenedorCondiciones = ofertaUI.querySelector("[contenedor=condiciones]")
            contenedorCondiciones.style.display = "none"
            const selectorOfertasRenderizdas = contenedorCondiciones.querySelectorAll("[zonaOferta]")
            selectorOfertasRenderizdas.forEach((ofertaObsoleta) => ofertaObsoleta.remove())
            const contenedorDescuentosUI = casaVitini.view.__sharedMethods__.componenteUI.condicionesUI

            for (const condicion of condicionesArray) {
                const tipoCondicion = condicion.tipoCondicion
                const descuentoUI = contenedorDescuentosUI[tipoCondicion]()

                if (tipoCondicion === "porNumeroDeApartamentos") {
                    const tipoConteo = condicion.tipoConteo
                    const numeroDeApartamentos = condicion.numeroDeApartamentos

                    const selectorTipoConteo = descuentoUI.querySelector("[campoOferta=tipoConteo]")
                    selectorTipoConteo.value = tipoConteo
                    const selectorNumeroApartamentos = descuentoUI.querySelector("[campoOferta=numeroDeApartamentos]")
                    selectorNumeroApartamentos.value = numeroDeApartamentos
                } else if (tipoCondicion === "porCodigoDescuento") {
                    const codigoDescuento = condicion.codigoDescuento


                    const selectorCampoCodigo = descuentoUI.querySelector("[campo=codigoDescuento]")
                    selectorCampoCodigo.value = codigoDescuento
                } else if (tipoCondicion === "porDiasDeAntelacion") {
                    const tipoConteo = condicion.tipoConteo
                    const numeroDeDias = condicion.numeroDeDias

                    const selectorTipoConteo = descuentoUI.querySelector("[campoOferta=tipoConteo]")
                    selectorTipoConteo.value = tipoConteo
                    const selectorNumeroDeDias = descuentoUI.querySelector("[campoOferta=numeroDeDias]")
                    selectorNumeroDeDias.value = numeroDeDias

                } else if (tipoCondicion === "porDiasDeReserva") {
                    const tipoConteo = condicion.tipoConteo
                    const numeroDeDias = condicion.numeroDeDias

                    const selectorTipoConteo = descuentoUI.querySelector("[campoOferta=tipoConteo]")
                    selectorTipoConteo.value = tipoConteo
                    const selectorNumeroDeDias = descuentoUI.querySelector("[campoOferta=numeroDeDias]")
                    selectorNumeroDeDias.value = numeroDeDias
                } else if (tipoCondicion === "conFechaCreacionEntreRango") {

                } else if (tipoCondicion === "conFechaEntradaEntreRango") {
                    const fechaInicioRango_ISO = condicion.fechaInicioRango_ISO
                    const fechaFinalRango_ISO = condicion.fechaFinalRango_ISO

                    const fechaInicioRango_humana = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaInicioRango_ISO)
                    const fechaFinalRango_humana = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaFinalRango_ISO)

                    const selectorEntrada = descuentoUI.querySelector("[calendario=entrada]")
                    const entradaUI = selectorEntrada.querySelector("[fechaUI]")

                    const selectorSalida = descuentoUI.querySelector("[calendario=salida]")
                    const salidaUI = selectorSalida.querySelector("[fechaUI]")

                    selectorEntrada.setAttribute("memoriaVolatil", fechaInicioRango_ISO)
                    selectorSalida.setAttribute("memoriaVolatil", fechaFinalRango_ISO)

                    entradaUI.textContent = fechaInicioRango_humana
                    salidaUI.textContent = fechaFinalRango_humana
                } else if (tipoCondicion === "conFechaSalidaEntreRango") {
                    const fechaInicioRango_ISO = condicion.fechaInicioRango_ISO
                    const fechaFinalRango_ISO = condicion.fechaFinalRango_ISO

                    const fechaInicioRango_humana = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaInicioRango_ISO)
                    const fechaFinalRango_humana = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaFinalRango_ISO)

                    const selectorEntrada = descuentoUI.querySelector("[calendario=entrada]")
                    const entradaUI = selectorEntrada.querySelector("[fechaUI]")

                    const selectorSalida = descuentoUI.querySelector("[calendario=salida]")
                    const salidaUI = selectorSalida.querySelector("[fechaUI]")

                    selectorEntrada.setAttribute("memoriaVolatil", fechaInicioRango_ISO)
                    selectorSalida.setAttribute("memoriaVolatil", fechaFinalRango_ISO)

                    entradaUI.textContent = fechaInicioRango_humana
                    salidaUI.textContent = fechaFinalRango_humana
                } else if (tipoCondicion === "porRangoDeFechas") {
                    const fechaInicioRango_ISO = condicion.fechaInicioRango_ISO
                    const fechaFinalRango_ISO = condicion.fechaFinalRango_ISO

                    const fechaInicioRango_humana = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaInicioRango_ISO)
                    const fechaFinalRango_humana = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaFinalRango_ISO)

                    const selectorEntrada = descuentoUI.querySelector("[calendario=entrada]")
                    const entradaUI = selectorEntrada.querySelector("[fechaUI]")

                    const selectorSalida = descuentoUI.querySelector("[calendario=salida]")
                    const salidaUI = selectorSalida.querySelector("[fechaUI]")

                    selectorEntrada.setAttribute("memoriaVolatil", fechaInicioRango_ISO)
                    selectorSalida.setAttribute("memoriaVolatil", fechaFinalRango_ISO)

                    entradaUI.textContent = fechaInicioRango_humana
                    salidaUI.textContent = fechaFinalRango_humana
                } else if (tipoCondicion === "porApartamentosEspecificos") {
                    const tipoDeEspecificidad = condicion.tipoDeEspecificidad
                    const apartamentos = condicion.apartamentos
                    const instanciaUID = descuentoUI.querySelector("[instanciaUID]").getAttribute("instanciaUID")
                    const selectorTipoEspeficidad = descuentoUI.querySelector("[campo=tipoDeEspecificidad]")
                    selectorTipoEspeficidad.value = tipoDeEspecificidad

                    for (const contenedorApartamento of apartamentos) {
                        const apartamentoIDV = contenedorApartamento.apartamentoIDV
                        const apartamentoUI = contenedorApartamento.apartamentoUI

                        const infoSinApartamento = descuentoUI.querySelector("[componente=infoSinApartamento]")
                        infoSinApartamento.style.display = "none"
                        const selectorZonaApartamentos = descuentoUI.querySelector("[componente=zonaAnadirApartamento]")


                        const cApartamento = casaVitini.ui.componentes.componentesComplejos.selectorApartamentosEspecificosUI.apartamentoUI({
                            apartamentoIDV,
                            apartamentoUI,
                        })
                        selectorZonaApartamentos.appendChild(cApartamento)
                    }
                }
                contenedorCondiciones.appendChild(descuentoUI)

            }
            casaVitini.view.__sharedMethods__.componenteUI.controlDespliegeContenedorDescuento()

            const contenedorDescuentos = ofertaUI.querySelector("[contenedor=descuentos]")
            contenedorDescuentos.style.display = "none"
            contenedorDescuentos.innerHTML = null

            const descuentosUI = casaVitini.view.__sharedMethods__.componenteUI.contenedorDescuento()
            contenedorDescuentos.appendChild(descuentosUI)


            const tipoDescuento = descuentosJSON.tipoDescuento

            const selectorTipoDescuentos = contenedorDescuentos.querySelector("[componente=tipoDescuento]")
            selectorTipoDescuentos.value = tipoDescuento

            casaVitini.view.__sharedMethods__.componenteUI.controladorDescuentos({
                descuentoIDV: tipoDescuento
            })

            if (tipoDescuento === "totalNeto") {
                const contenedor = contenedorDescuentos.querySelector("[descuentoIDV=totalNeto]")
                const descuentoTotal = descuentosJSON.descuentoTotal
                const tipoAplicacion = descuentosJSON.tipoAplicacion

                const campoTipoDesceunto = contenedor.querySelector("[campoOferta=tipoDescuento]")
                campoTipoDesceunto.value = tipoAplicacion

                const campoDescuentoGlobal = contenedor.querySelector("[campoOferta=descuentoGlobal]")
                campoDescuentoGlobal.value = descuentoTotal

            } else if (tipoDescuento === "mismoDescuentoParaCadaApartamento") {
                const contenedor = contenedorDescuentos.querySelector("[descuentoIDV=mismoDescuentoParaCadaApartamento]")
                const descuentoTotal = descuentosJSON.descuentoTotal
                const tipoAplicacion = descuentosJSON.tipoAplicacion

                const campoTipoDesceunto = contenedor.querySelector("[campoOferta=tipoDescuento]")
                campoTipoDesceunto.value = tipoAplicacion

                const campoDescuentoGlobal = contenedor.querySelector("[campoOferta=descuentoGlobal]")
                campoDescuentoGlobal.value = descuentoTotal

            } else if (tipoDescuento === "individualPorApartamento") {
                const apartamentos = descuentosJSON.apartamentos

                const contenedorApartamentos = contenedorDescuentos.querySelector("[descuentoIDV=individualPorApartamento]")
                const instanciaUID = contenedorApartamentos.getAttribute("instanciaUID")

                for (const apartamento of apartamentos) {

                    const apartamentoIDV = apartamento.apartamentoIDV
                    const descuentoTotal = apartamento.descuentoTotal
                    const tipoAplicacion = apartamento.tipoAplicacion
                    const apartamentoUI = apartamento.apartamentoUI

                    const infoSinApartamento = contenedorApartamentos.querySelector("[componente=infoSinApartamento]")
                    infoSinApartamento.style.display = "none"


                    const cApartamento = casaVitini.ui.componentes.componentesComplejos.selectorApartamentosEspecificosUI.apartamentoUI({
                        apartamentoIDV,
                        apartamentoUI,
                        opcionesUI: {
                            ui: casaVitini.view.__sharedMethods__.componenteUI.compartidos.opcionesContenedorApartamentoUI,
                            data: {
                                descuentoTotal: descuentoTotal,
                                seleccionadoInicial: tipoAplicacion
                            }
                        }
                    })



                    const selectorZonaApartamentos = contenedorApartamentos.querySelector("[componente=zonaAnadirApartamento]")
                    selectorZonaApartamentos.appendChild(cApartamento)
                }
            } else if (tipoDescuento === "porRango") {

                const contenedorPorRango = contenedorDescuentos.querySelector("[descuentoIDV=porRango]")
                const selectorSubTipo = contenedorPorRango.querySelector("[componente=subTipoDescuento]")

                const selectorEntrada = contenedorPorRango.querySelector("[calendario=entrada]")
                const selectorSalida = contenedorPorRango.querySelector("[calendario=salida]")

                const fechaInicioRango_ISO = descuentosJSON.fechaInicioRango_ISO
                const fechaFinalRango_ISO = descuentosJSON.fechaFinalRango_ISO

                const fechaInicioRango_humana = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaInicioRango_ISO)
                const fechaFinalRango_humana = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaFinalRango_ISO)

                const entradaUI = selectorEntrada.querySelector("[fechaUI]")
                const salidaUI = selectorSalida.querySelector("[fechaUI]")

                selectorEntrada.setAttribute("memoriaVolatil", fechaInicioRango_ISO)
                selectorSalida.setAttribute("memoriaVolatil", fechaFinalRango_ISO)

                entradaUI.textContent = fechaInicioRango_humana
                salidaUI.textContent = fechaFinalRango_humana

                const subTipoDescuento = descuentosJSON.subTipoDescuento

                if (subTipoDescuento === "totalNetoPorRango") {
                    const tipoAplicacion = descuentosJSON.tipoAplicacion
                    const descuentoTotal = descuentosJSON.descuentoTotal

                    selectorSubTipo.value = subTipoDescuento
                    casaVitini.view.__sharedMethods__.componenteUI.descuentosUI.porRango.componentes.controladorUI({
                        contenedorIDV: subTipoDescuento
                    })

                    const contenedorTotalNetoPorRango = contenedorPorRango.querySelector("[contenedorPorRango=totalNetoPorRango]")
                    const selectorTipoDescuento = contenedorTotalNetoPorRango.querySelector("[campoOferta=tipoDescuento]")
                    selectorTipoDescuento.value = tipoAplicacion

                    const selectorDescuentoGlobal = contenedorTotalNetoPorRango.querySelector("[campoOferta=descuentoGlobal]")
                    selectorDescuentoGlobal.value = descuentoTotal
                } else if (subTipoDescuento === "porDiasDelRango") {

                    const descuentoPorDias = descuentosJSON.descuentoPorDias
                    const contenedorDias = contenedorPorRango.querySelector("[contenedorPorRango=porDiasDelRango]")
                    contenedorDias.classList.remove("estadoInicialInvisible")
                    contenedorDias.innerHTML = null

                    selectorSubTipo.value = subTipoDescuento

                    for (const detallesDelDia of descuentoPorDias) {
                        const tipoDescuentoDelDia = detallesDelDia.tipoDescuento
                        const fecha = detallesDelDia.fecha

                        const contenedorDia = casaVitini.view.__sharedMethods__.componenteUI.descuentosUI.porRango.componentes.constructorDiaUI({
                            fecha: fecha
                        })
                        contenedorDias.appendChild(contenedorDia)

                        const selectorContextoAplicacion = contenedorDia.querySelector("[campoOferta=contextoAplicacion]")
                        selectorContextoAplicacion.value = tipoDescuentoDelDia


                        if (tipoDescuentoDelDia === "netoPorDia") {
                            const descuentoTotal = detallesDelDia.descuentoTotal
                            const tipoAplicacion = detallesDelDia.tipoAplicacion

                            const contenedorNetoDelDia = contenedorDia.querySelector("[contenedorDelDia=netoPorDia]")
                            contenedorNetoDelDia.classList.remove("estadoInicialInvisible")

                            const campoDescuentoTotal = contenedorNetoDelDia.querySelector("[campoOferta=descuentoGlobal]")
                            campoDescuentoTotal.value = descuentoTotal

                            const selectorTipoDescuento = contenedorNetoDelDia.querySelector("[campoOferta=tipoDescuento]")
                            selectorTipoDescuento.value = tipoAplicacion

                        } else if (tipoDescuentoDelDia === "netoPorApartamentoDelDia") {
                            const apartamentos = detallesDelDia.apartamentos

                            const contenedorNetoPorApartamentoDelDia = contenedorDia.querySelector("[contenedorDelDia=netoPorApartamentoDelDia]")
                            contenedorNetoPorApartamentoDelDia.classList.remove("estadoInicialInvisible")

                            for (const apartamento of apartamentos) {


                                const apartamentoIDV = apartamento.apartamentoIDV
                                const descuentoTotal = apartamento.descuentoTotal
                                const tipoAplicacion = apartamento.tipoAplicacion
                                const apartamentoUI = apartamento.apartamentoUI
                                const infoSinApartamento = contenedorDia.querySelector("[componente=infoSinApartamento]")
                                infoSinApartamento.style.display = "none"

                                // const selectorApartamentoUI = casaVitini.ui.componentes.componentesComplejos.selectorApartamentosEspecificosUI.apartamentoUI({
                                //     apartamentoIDV,
                                //     apartamentoUI,
                                //     instanciaUID: fecha,
                                //     tipoDespliegue: "total",
                                //     seleccionadoInicial: tipoAplicacion,
                                //     descuentoTotal: descuentoTotal
                                // })


                                const cApartamento = casaVitini.ui.componentes.componentesComplejos.selectorApartamentosEspecificosUI.apartamentoUI({
                                    apartamentoIDV,
                                    apartamentoUI,
                                    opcionesUI: {
                                        ui: casaVitini.view.__sharedMethods__.componenteUI.compartidos.opcionesContenedorApartamentoUI,
                                        data: {
                                            descuentoTotal: descuentoTotal,
                                            seleccionadoInicial: tipoAplicacion
                                        }
                                    }
                                })


                                const selectorZonaApartamentos = contenedorDia.querySelector("[componente=zonaAnadirApartamento]")
                                selectorZonaApartamentos.appendChild(cApartamento)
                            }
                        }
                    }
                }

                const area = document.querySelector("[contenedor=descuentos] [area=descuentosPorRango]")
                const contenedorPorDiasDentro = area.querySelector("[contenedorPorRango=porDiasDelRango]")
                const fechas = casaVitini.utilidades.conversor.extraerFechasInternas(fechaInicioRango_ISO, fechaFinalRango_ISO)

                for (const fecha of fechas) {
                    const selectorDiaRenderizado = contenedorPorDiasDentro.querySelector(`[instanciaUID="${fecha}"]`)
                    if (!selectorDiaRenderizado) {
                        const contenedorDia = casaVitini.view.__sharedMethods__.componenteUI.descuentosUI.porRango.componentes.constructorDiaUI({
                            fecha: fecha
                        })
                        contenedorPorDiasDentro.appendChild(contenedorDia)
                    }
                }

            }

            const selectorSpinnerRenderizado = ofertaUI.querySelector("[contenedor=spinner]")
            selectorSpinnerRenderizado.remove()

            const selectorCondicionesRenderizado = ofertaUI.querySelector("[contenedor=condiciones]")
            selectorCondicionesRenderizado.removeAttribute("style")


            const selectorDescuentosRenderizado = ofertaUI.querySelector("[contenedor=descuentos]")
            selectorDescuentosRenderizado.removeAttribute("style")

        },

        ofertaModos: async function (modo) {
            const contenedorBotones = document.querySelector("[componente=espacioCrearOferta] [contenedor=botones]")

            if (modo === "modoEditar") {
                contenedorBotones.innerHTML = null
                const botones = casaVitini.view.__sharedMethods__.componenteUI.botonesDuranteModificacionOferta()
                contenedorBotones.appendChild(botones)
                document.querySelector("[componente=soloLecturaInfo]")?.classList.remove("elementoOcultoInicialmente")

            }
            if (modo === "modoCancelar") {
                contenedorBotones.innerHTML = null
                const botones = casaVitini.view.__sharedMethods__.componenteUI.botonesModificarOferta()
                contenedorBotones.appendChild(botones)

                document.querySelector("[componente=soloLecturaInfo]")?.classList.remove("elementoOcultoInicialmente")
            }
        },
        estadoOferta: async function (estadoOferta) {
            const ofertaUID = document.querySelector("[ofertaUID]")?.getAttribute("ofertaUID")
            if (!ofertaUID) {
                const error = "No se puede cambiar el estado de esta oferta porque no tiene un identificador único de oferta (ofertaUID).Esto puede deberse a que aún no has creado la oferta o que la has borrado.Si estás creando una oferta, por favor asegúrate de crearla pulsando el botón 'Crear oferta' antes de activarla."
                casaVitini.ui.componentes.advertenciaInmersiva(error)
            }
            const selectorEstadoOfertaUI = document.querySelector("[estadoOferta]")


            const estadoActualMemoriaVolatil = selectorEstadoOfertaUI.textContent
            selectorEstadoOfertaUI.textContent = "Esperando al servidor...."
            const estadoOfertaActual = estadoOferta.target.getAttribute("estadoOferta")
            let estadoOfertaPropuesto
            if (estadoOfertaActual === "desactivado") {
                estadoOfertaPropuesto = "activado"
            }
            if (estadoOfertaActual === "activado") {
                estadoOfertaPropuesto = "desactivado"
            }
            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/ofertas/actualizarEstadoOferta",
                ofertaUID: String(ofertaUID),
                estadoIDV: estadoOfertaPropuesto
            })

            if (!respuestaServidor) {
                selectorEstadoOfertaUI.textContent = estadoActualMemoriaVolatil
                selectorEstadoOfertaUI.setAttribute("estadoOferta", estadoOfertaActual)
            } else if (respuestaServidor?.error) {
                selectorEstadoOfertaUI.textContent = estadoActualMemoriaVolatil
                selectorEstadoOfertaUI.setAttribute("estadoOferta", estadoOfertaActual)
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            } else if (respuestaServidor?.ok) {
                const estadoIDV = respuestaServidor?.estadoIDV
                selectorEstadoOfertaUI.setAttribute("estadoOferta", estadoIDV)
                let estadoOfertaUI
                if (estadoIDV === "activado") {
                    selectorEstadoOfertaUI.style.background = "#00ff006e"
                    estadoOfertaUI = "Oferta activada"
                }
                if (estadoIDV === "desactivado") {
                    selectorEstadoOfertaUI.style.background = "#ff000091"
                    estadoOfertaUI = "Oferta desactivada"
                }
                selectorEstadoOfertaUI.textContent = estadoOfertaUI
            }
        },
        guardarCambiosOferta: async function () {
            const instanciaUID_pantallaEspera = casaVitini.utilidades.codigoFechaInstancia()
            const main = document.querySelector("main")
            const instanciaUID = main.getAttribute("instanciaUID")
            const ofertaUID = main.querySelector("[componente=espacioOfertas]").getAttribute("ofertaUID")

            const mensaje = "Actualizando oferta..."
            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
                instanciaUID: instanciaUID_pantallaEspera,
                mensaje: mensaje
            })
            const oferta = casaVitini.view.__sharedMethods__.utilidades.constructorObjeto()
            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/ofertas/actualizarOferta",
                ofertaUID: String(ofertaUID),
                ...oferta
            })
            document.querySelector(`[instanciaUID="${instanciaUID_pantallaEspera}"]`)?.remove()

            if (respuestaServidor.ofertasConElMismoCodigo) {
                return casaVitini.view.__sharedMethods__.componenteUI.infoCodigosRepeditos(respuestaServidor)
            } else if (respuestaServidor?.error) {
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }

            if (respuestaServidor?.ok) {
                const ofertaActualizada = respuestaServidor.ofertaActualizada

                const espacioOfertasGlobal = document.querySelector("[componente=espacioOfertas]")
                espacioOfertasGlobal.setAttribute("instantanea", JSON.stringify(ofertaActualizada))

                await casaVitini.view.__sharedMethods__.detallesOferta.aplicaData({
                    oferta: ofertaActualizada,
                    instanciaUID_destino: instanciaUID
                })
            }
        },
        eliminarOferta: {
            UI: async function () {

                const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                pantallaInmersiva.style.justifyContent = "center"
                const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

                const titulo = constructor.querySelector("[componente=titulo]")
                titulo.textContent = "Confirmar eliminar oferta"
                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                mensaje.textContent = "Var a eliminar la oferta y su aplicacion sera inmediata en los precios, ¿Estas de acuerdo ? "

                const botonAceptar = constructor.querySelector("[boton=aceptar]")
                botonAceptar.textContent = "Comfirmar la eliminacion"
                botonAceptar.addEventListener("click", casaVitini.view.__sharedMethods__.detallesOferta.eliminarOferta.confirmar)
                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                botonCancelar.textContent = "Cancelar la eliminacion"

                document.querySelector("main").appendChild(pantallaInmersiva)

            },
            confirmar: async function () {
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = "Eliminado el oferta..."
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const ofertaUID = document.querySelector("[ofertaUID]").getAttribute("ofertaUID")
                const transaccion = {
                    zona: "administracion/ofertas/eliminarOferta",
                    ofertaUID: String(ofertaUID)
                }
                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }
                instanciaRenderizada.remove()
                if (respuestaServidor?.error) {
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    const vista = `/administracion/gestion_de_ofertas`
                    const navegacion = {
                        vista: vista,
                        tipoOrigen: "menuNavegador"
                    }
                    casaVitini.shell.navegacion.controladorVista(navegacion)
                }
            }
        }
    },
    traductorCambioVista: function (oferta) {
        oferta.preventDefault()
        oferta.stopPropagation()
        const vista = oferta.target.closest("[vista]").getAttribute("vista")
        const entrada = {
            vista: vista,
            tipoOrigen: "menuNavegador"
        }
        casaVitini.shell.navegacion.controladorVista(entrada)
    },
    // detalleUI: function (modoUI) {
    //     const instanciaUID_contenedorFechas = casaVitini.utilidades.codigoFechaInstancia()
    //     const divPrincipal = document.createElement("div");
    //     divPrincipal.setAttribute("componente", "espacioCrearOferta");
    //     divPrincipal.classList.add("espacioClientes");

    //     const divContenedorNombreYEstado = document.createElement("div");

    //     if (modoUI === "editarOferta") {
    //         divContenedorNombreYEstado.classList.add("crearOfertaContenedorHorizontalV2");

    //         const botonEstadoOferta = document.createElement("div")
    //         botonEstadoOferta.classList.add("creatOfertaBotonEstado")
    //         botonEstadoOferta.setAttribute("componente", "estadoOferta")
    //         botonEstadoOferta.addEventListener("click", (e) => {this.detallesOferta.estadoOferta(e)})
    //         botonEstadoOferta.textContent = "Oferta desactivada"
    //         divContenedorNombreYEstado.appendChild(botonEstadoOferta)

    //     }
    //     if (modoUI === "crearOferta") {
    //         divContenedorNombreYEstado.classList.add("crearOfertaContenedorHorizontalModoCrear");
    //     }

    //     const input = document.createElement("input");
    //     input.setAttribute("type", "text");
    //     input.classList.add("preciosEImpuestosbotonOpcionCrearNuevoImpuesto");
    //     input.setAttribute("campoOferta", "nombreOferta");
    //     input.setAttribute("placeholder", "Escriba un nombre a esta oferta, el nombre sera publico");
    //     divContenedorNombreYEstado.appendChild(input)
    //     divPrincipal.appendChild(divContenedorNombreYEstado)


    //     const titulo = document.createElement("p");
    //     titulo.classList.add("crearOfertaTituloOpcion");
    //     titulo.textContent = "Selecciona el rango de fechas de vigencia de la oferta.Este rango determina el inicio y el final de la vigencia de la oferta.Cuando se realiza una reserva, se determina si, en el momento de hacer una reserva, con la fecha de creación, esta, la reserva, puede acceder a la oferta.";
    //     divPrincipal.appendChild(titulo);

    //     const divContenedor = document.createElement("div");
    //     divContenedor.classList.add("administracion_ofertas_crearOfertas_contenedorFecha");
    //     divContenedor.setAttribute("instanciaUID_contenedorFechas", instanciaUID_contenedorFechas)

    //     const divContenedorHorizontal = document.createElement("div");
    //     divContenedorHorizontal.classList.add("crearOfertaContenedorHorizontal");

    //     const divContenedorFechaInicio = document.createElement("div");
    //     divContenedorFechaInicio.classList.add("contenedorFecha");
    //     divContenedorFechaInicio.setAttribute("calendario", "entrada");
    //     divContenedorFechaInicio.setAttribute("componente", "inicioOferta");
    //     divContenedorFechaInicio.setAttribute("paralizadorEvento", "ocultadorCalendarios");
    //     divContenedorFechaInicio.addEventListener("click", async () => {
    //         await casaVitini.ui.componentes.calendario.configurarCalendario({
    //             perfilMes: "calendario_entrada_perfilSimple",
    //             contenedorOrigenIDV: "[calendario=entrada]",
    //             instanciaUID_contenedorFechas,
    //             rangoIDV: "inicioRango",
    //             metodoSelectorDia: null,
    //             tituloCalendario: "Selecciona la fecha de inicio del rango de vigencia de la oferta",
    //             seleccionableDiaLimite: "si"
    //         })
    //     })


    //     const pFechaInicio = document.createElement("p");
    //     pFechaInicio.classList.add("tituloFecha");
    //     pFechaInicio.textContent = "Fecha de inicio";

    //     const pFechaInicioSeleccionada = document.createElement("p");
    //     pFechaInicioSeleccionada.classList.add("fechaInicio");
    //     pFechaInicioSeleccionada.setAttribute("fechaUI", "fechaInicio");
    //     pFechaInicioSeleccionada.textContent = "(Seleccionar)";

    //     divContenedorFechaInicio.appendChild(pFechaInicio);
    //     divContenedorFechaInicio.appendChild(pFechaInicioSeleccionada);

    //     const divContenedorFechaFin = document.createElement("div");
    //     divContenedorFechaFin.classList.add("contenedorFecha");
    //     divContenedorFechaFin.setAttribute("calendario", "salida");
    //     divContenedorFechaFin.setAttribute("paralizadorEvento", "ocultadorCalendarios");
    //     divContenedorFechaFin.setAttribute("componente", "finOferta");

    //     divContenedorFechaFin.addEventListener("click", async () => {
    //         await casaVitini.ui.componentes.calendario.configurarCalendario({
    //             perfilMes: "calendario_salida_perfilSimple",
    //             contenedorOrigenIDV: "[calendario=salida]",
    //             instanciaUID_contenedorFechas,
    //             rangoIDV: "finalRango",
    //             metodoSelectorDia: null,
    //             tituloCalendario: "Selecciona la fecha del fin del rango de vigencia de la oferta",
    //             seleccionableDiaLimite: "si"

    //         })
    //     })
    //     const contenedorZonaOferta = document.createElement("div")
    //     contenedorZonaOferta.classList.add("contenedorZonaOferta")

    //     const selectorZonaOferta = document.createElement("select")
    //     selectorZonaOferta.classList.add(
    //         "selector",
    //         "textCentrado"
    //     )
    //     selectorZonaOferta.setAttribute("campo", "zonaIDV")
    //     const opcionPredeterminada = document.createElement("option")
    //     opcionPredeterminada.selected = true
    //     opcionPredeterminada.disabled = true;
    //     opcionPredeterminada.value = "no"
    //     opcionPredeterminada.text = "Zona de la oferta"
    //     selectorZonaOferta.appendChild(opcionPredeterminada)
    //     const opciones = [
    //         { value: "publica", text: "Zona publica" },
    //         { value: "global", text: "Zona global" },
    //         { value: "privada", text: "Zona privada" }
    //     ]
    //     for (const opcionData of opciones) {
    //         const opcion = document.createElement("option");
    //         opcion.value = opcionData.value;
    //         opcion.text = opcionData.text;
    //         selectorZonaOferta.appendChild(opcion);
    //     }
    //     contenedorZonaOferta.appendChild(selectorZonaOferta)


    //     const pFechaFin = document.createElement("p");
    //     pFechaFin.classList.add("tituloFecha");
    //     pFechaFin.textContent = "Fecha fin";

    //     const pFechaFinSeleccionada = document.createElement("p");
    //     pFechaFinSeleccionada.classList.add("fechaFin");
    //     pFechaFinSeleccionada.setAttribute("fechaUI", "fechaFin");
    //     pFechaFinSeleccionada.textContent = "(Seleccionar)";

    //     divContenedorFechaFin.appendChild(pFechaFin);
    //     divContenedorFechaFin.appendChild(pFechaFinSeleccionada);

    //     divContenedorHorizontal.appendChild(divContenedorFechaInicio);
    //     divContenedorHorizontal.appendChild(contenedorZonaOferta);
    //     divContenedorHorizontal.appendChild(divContenedorFechaFin);

    //     divContenedor.appendChild(divContenedorHorizontal);

    //     divPrincipal.appendChild(divContenedor);


    //     const botonAnadirCondicion = document.createElement("div")
    //     botonAnadirCondicion.classList.add("botonV1")
    //     botonAnadirCondicion.setAttribute("boton", "anadirCondicion")
    //     if (modoUI === "editarOferta") {
    //         botonAnadirCondicion.style.display = "none"
    //     }
    //     botonAnadirCondicion.textContent = "Añadir condición"
    //     botonAnadirCondicion.addEventListener("click", casaVitini.view.__sharedMethods__.componenteUI.selectorTipoOferta)
    //     divPrincipal.appendChild(botonAnadirCondicion)

    //     const contonenedorPropiedades = document.createElement("div")
    //     contonenedorPropiedades.setAttribute("contenedor", "superBloque")
    //     contonenedorPropiedades.classList.add(
    //         "flexVertical",
    //         "gap6"
    //     )
    //     divPrincipal.appendChild(contonenedorPropiedades)

    //     const contenedorCondiciones = document.createElement("div")
    //     contenedorCondiciones.setAttribute("contenedor", "condiciones")
    //     contenedorCondiciones.classList.add("contenedorCondiciones")
    //     contonenedorPropiedades.appendChild(contenedorCondiciones)

    //     const infoCondiciones = document.createElement("div")
    //     infoCondiciones.setAttribute("info", "condiciones")
    //     infoCondiciones.classList.add(
    //         "textoCentrado",
    //         "padding10"
    //     )
    //     infoCondiciones.textContent = "Inserta condiciones a esta oferta."
    //     contenedorCondiciones.appendChild(infoCondiciones)

    //     const contenedorDescuentos = document.createElement("div")
    //     contenedorDescuentos.setAttribute("contenedor", "descuentos")
    //     contonenedorPropiedades.appendChild(contenedorDescuentos)

    //     const descuentosUI = casaVitini.view.__sharedMethods__.componenteUI.contenedorDescuento()
    //     contenedorDescuentos.appendChild(descuentosUI)

    //     return divPrincipal
    // }
}