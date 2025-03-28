casaVitini.view = {
    start: function () {
        const granuladorURL = casaVitini.utilidades.granuladorURL()
        const parametros = granuladorURL.parametros

        const main = document.querySelector("main")
        const uiSelector = document.createElement("div")
        uiSelector.classList.add("flexVertical", "padding10", "gap10", "width100")
        uiSelector.setAttribute("zona", "protocolo")
        main.appendChild(uiSelector)

        if (parametros?.alojamiento) {
            const zona = parametros?.zona
            if (!zona) {
                this.procesoPreparacion.arranque(
                    { apartamentoIDV: parametros.alojamiento }
                )
            }
            // else {
            //     const zonas = this.zonas
            //     const main = document.querySelector("main")

            //     if (!zonas.hasOwnProperty(zona)) {
            //         const uiSelector = main.querySelector("[zona=desconocida]")
            //         uiSelector.classList.remove("ocultoInicial")
            //     } else {
            //         const uiSelector = main.querySelector("[contenedor=zonas]")
            //         const zonaSelector = uiSelector.querySelector(`[zona="${zona}"]`)
            //         zonaSelector.classList.remove("ocultoInicial")

            //         zonas[zona].arranque(
            //             { apartamentoIDV: parametros.alojamiento }
            //         )
            //     }
            // }
        } else {
            this.mostrarAlojamientos()
        }
    },
    mostrarAlojamientos: async function () {

        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()

        const main = document.querySelector("main")
        main.classList.add("flextJustificacion_center")
        const spinner = casaVitini.ui.componentes.spinnerSimple()
        main.appendChild(spinner)

        const uiSelector = main.querySelector("[zona=protocolo]")
        uiSelector.setAttribute("instanciaUID", instanciaUID)

        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "administracion/arquitectura/configuraciones/listarConfiguracionApartamentos"
        })
        spinner.remove()
        main.classList.remove("flextJustificacion_center")

        const instanciaRenderizada = uiSelector.getAttribute(`instanciaUID`)
        if (instanciaRenderizada !== instanciaUID) { return }
        if (respuestaServidor?.error) {
            const infoUI = uiSelector.querySelector("[data=info]")
            infoUI.textContent = respuestaServidor.error
            infoUI.classList.remove("ocultoInicial")
            return
        }
        if (respuestaServidor.ok) {

            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add("contenedorBotones")
            uiSelector.appendChild(contenedorBotones)

            const alojamientos = respuestaServidor.ok
            alojamientos.forEach(a => {
                const apartamentoIDV = a.apartamentoIDV
                const apartamentoUI = a.apartamentoUI

                const ui = document.createElement("a")
                ui.classList.add("tituloContextoAdministracion")
                ui.href = `/administracion/protocolos/revisar_alojamiento/alojamiento:${apartamentoIDV}`

                ui.textContent = apartamentoUI
                contenedorBotones.appendChild(ui)
            });
        }
    },
    procesoPreparacion: {
        arranque: async function (data) {
            const apartamentoIDV = data.apartamentoIDV

            const main = document.querySelector("main")
            const uiSelector = main.querySelector("[zona=protocolo]")
            uiSelector.textContent = null

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/protocolos/alojamiento/revisar_alojamiento/obtenerRevision",
                apartamentoIDV
            })
            if (respuestaServidor.error) {
                const error = document.createElement("p")
                error.classList.add("padding12", "negrita")
                error.textContent = respuestaServidor.error
                uiSelector.appendChild(error)

                const botonVolver = document.createElement("a")
                botonVolver.classList.add("botonV1BlancoIzquierda")
                botonVolver.textContent = "Volver a seleciona otro alojamiento para revisar"
                botonVolver.href = `/administracion/protocolos/revisar_alojamiento`

                botonVolver.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                uiSelector.appendChild(botonVolver)
            }
            if (respuestaServidor.ok) {

                const apartamentoUI = respuestaServidor.apartamentoUI
                const revision = respuestaServidor.revision

                const uid = revision.uid
                const revisionInventario = revision.revisionInventario || []
                const reposicionInventario = revision.reposicionInventario || []
                const protocoloLimpieza = revision.protocoloLimpieza || []
                const fechaInicio = revision.fechaInicio
                const fechaFin = revision.fechaFin
                const usuario = revision.usuario
                const estadoRevision = revision.estadoRevision

                const protocolo = respuestaServidor.protocolo
                const inventarioAlojamiento = protocolo.inventarioAlojamiento
                const tareasAlojamiento = protocolo.tareasAlojamiento

                const zonaPortada = document.createElement("div")
                zonaPortada.classList.add("contenedorBotones")
                uiSelector.appendChild(zonaPortada)

                const estadoReposicon = ["noHaceFalta"]
                for (const rI of revisionInventario) {
                    const color = rI.color
                    if (color === "rojo") {
                        estadoReposicon[0] = "pendiente"
                        break
                    }
                }

                if (inventarioAlojamiento.length === 0 && tareasAlojamiento.length === 0) {
                    casaVitini.view.protocoloNoDefinido({
                        apartamentoUI
                    })
                }


                if (revisionInventario.length === 0 && inventarioAlojamiento.length > 0) {
                    casaVitini.view.zonas.inventario.arranque({
                        uid,
                        apartamentoIDV
                    })
                } else if (reposicionInventario.length === 0 && inventarioAlojamiento.length > 0) {

                    if (estadoReposicon[0] === "pendiente") {
                        casaVitini.view.zonas.resposicion.arranque({
                            apartamentoIDV,
                            uid
                        })
                    } else if (estadoReposicon[0] === "noHaceFalta") {
                        casaVitini.view.zonas.limpieza.arranque({
                            apartamentoIDV,
                            uid
                        })
                    }
                } else if (protocoloLimpieza.length === 0 && tareasAlojamiento.length > 0) {
                    casaVitini.view.zonas.limpieza.arranque({
                        uid,
                        apartamentoIDV
                    })
                }
            }
        }
    },
    zonas: {
        inventario: {
            arranque: async function (data) {
                const apartamentoIDV = data.apartamentoIDV
                const uid = data.uid
                const main = document.querySelector("main")

                const zona = main.querySelector("[zona=protocolo]")
                zona.textContent = null

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/protocolos/alojamiento/gestion_de_protocolos/obtenerProtocoloDelAlojamiento",
                    apartamentoIDV
                })
                if (respuestaServidor.error) {
                    const error = document.createElement("p")
                    error.classList.add("padding10")
                    error.textContent = respuestaServidor.error
                    zona.appendChild(error)
                    return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.error)
                }

                if (respuestaServidor.ok) {

                    const alojamiento = respuestaServidor.alojamiento
                    const inventarioDelProtocolo = respuestaServidor.inventarioDelProtocolo
                    const numeroTotalProtocolo = inventarioDelProtocolo.length

                    const apartamentoUI = alojamiento.apartamentoUI


                    const tI = document.createElement("div")
                    tI.classList.add("textoNegrita", "padding16", "negrita")
                    tI.textContent = `Inventario del ${apartamentoUI}`
                    zona.appendChild(tI)


                    const botonCancelar = document.createElement("div")
                    botonCancelar.classList.add("botonV1BlancoIzquierda")
                    botonCancelar.setAttribute("boton", "dinamico")
                    botonCancelar.textContent = "Cancelar el protocolo de preparación"
                    botonCancelar.addEventListener("click", () => {
                        casaVitini.view.cancelarRevision.ui({
                            uid
                        })
                    })
                    zona.appendChild(botonCancelar)

                    const contenedorIventario = document.createElement("div")
                    contenedorIventario.classList.add("flexVertical", "gap10")
                    zona.appendChild(contenedorIventario)


                    const info = document.createElement("div")
                    info.classList.add("textoNegrita", "padding16")
                    info.textContent = `Vamos a realizar el inventario del apartamento. Por favor, revisa si en el alojamiento están los siguientes elementos. Si están, marca la casilla verde; si no están o faltan en cantidad, marca la casilla roja del elemento.`
                    contenedorIventario.appendChild(info)

                    const cI = document.createElement("div")
                    cI.classList.add("flexVertical", "gap10")
                    cI.setAttribute("zona", "respuestas")
                    contenedorIventario.appendChild(cI)

                    while (cI.querySelectorAll("[uid]").length < numeroTotalProtocolo) {
                        const voidUI = document.createElement("div")
                        voidUI.setAttribute("uid", "void")
                        cI.appendChild(voidUI)
                    }

                    inventarioDelProtocolo.forEach(iDP => {
                        const elementoUID = iDP.elementoUID
                        const uid = iDP.uid
                        const nombre = iDP.nombre
                        const cantidad_enAlojamiento = iDP.cantidad_enAlojamiento
                        const posicion = iDP.posicion
                        const totalPosiciones = iDP.totalPosiciones
                        const posicionUID = Number(posicion - 1)

                        const inventarioUID = this.opcionInventarioUI({
                            elementoUID,
                            uid,
                            nombre,
                            cantidad_enAlojamiento,
                            posicion,
                            totalPosiciones

                        })
                        cI.replaceChild(inventarioUID, cI.children[posicionUID]);
                    })

                    const boton = document.createElement("div")
                    boton.classList.add("botonV1BlancoIzquierda")
                    boton.setAttribute("boton", "dinamico")
                    boton.textContent = "Finalizar revision del inventario del alojamiento"
                    boton.addEventListener("click", () => {
                        this.finalizarResivionIventarioAlojamiento({
                            uid,
                            apartamentoIDV
                        })
                    })
                    zona.appendChild(boton)
                }


                // tareasDelProtocolo.forEach(tDP => {
                //     const uid = tDP.uid
                //     const tareaUI = tDP.tareaUI
                //     const tipoDiasIDV = tDP.tipoDiasIDV
                //     const posicion = tDP.posicion
                //     const totalPosiciones = tDP.totalPosiciones
                //     const posicionUID = Number(posicion - 1)
                //     

                //     const inventarioUID = this.tareaUI({
                //         uid,
                //         tareaUI,
                //         tipoDiasIDV,
                //         posicion,
                //         totalPosiciones

                //     })
                //     contenedorTareas.replaceChild(inventarioUID, contenedorTareas.children[posicionUID]);
                // })

            },
            opcionInventarioUI: function (data) {
                const uid = data.uid
                const nombre = data.nombre
                const cantidad_enAlojamiento = data.cantidad_enAlojamiento

                const c = document.createElement("div")
                c.classList.add("gridHorizontal3C_minContent_auto", "gap10", "borderRadius16", "padding6", "borderGrey1")
                c.setAttribute("uid", uid)



                const esferaContenedorVerde = document.createElement("div")
                esferaContenedorVerde.setAttribute("color", "verde")
                esferaContenedorVerde.classList.add("flexVertical", "flextJustificacion_center")
                esferaContenedorVerde.addEventListener("click", (e) => {
                    this.controlSel(e)
                })
                c.appendChild(esferaContenedorVerde)


                const esferaVerde = document.createElement("div")
                esferaVerde.style.borderColor = "green"
                esferaVerde.classList.add("esferaSeleccionable")
                esferaContenedorVerde.appendChild(esferaVerde)

                const indicadorVerde = document.createElement("div")
                indicadorVerde.classList.add("indicadorDeSeleccionConFondo", "ocultoInicial")
                indicadorVerde.setAttribute("com", "indicador")
                esferaVerde.appendChild(indicadorVerde)


                const esferaContenedorRoja = document.createElement("div")
                esferaContenedorRoja.setAttribute("color", "rojo")
                esferaContenedorRoja.classList.add("flexVertical", "flextJustificacion_center")
                esferaContenedorRoja.addEventListener("click", (e) => {
                    this.controlSel(e)
                })
                c.appendChild(esferaContenedorRoja)


                const esferaRoja = document.createElement("div")
                esferaRoja.classList.add("esferaSeleccionable")
                esferaRoja.style.borderColor = "red"
                esferaContenedorRoja.appendChild(esferaRoja)

                const indicadorRojo = document.createElement("div")
                indicadorRojo.classList.add("indicadorDeSeleccionConFondo", "ocultoInicial")
                indicadorRojo.setAttribute("com", "indicador")
                esferaRoja.appendChild(indicadorRojo)



                const cD = document.createElement("div")
                cD.classList.add("flexVertical", "flextJustificacion_center")
                c.appendChild(cD)

                const titulo = document.createElement("div")
                titulo.classList.add("flexVertical")
                titulo.setAttribute("nombre", nombre)
                titulo.setAttribute("cantidad_enAlojamiento", cantidad_enAlojamiento)
                titulo.textContent = cantidad_enAlojamiento + " " + nombre
                cD.appendChild(titulo)

                const cRevision = document.createElement("div")
                cRevision.classList.add("flexVertical", "ocultoInicial", "negrita")
                cRevision.setAttribute("contenedor", "postRevision")
                cD.appendChild(cRevision)


                return c

            },
            controlSel: function (e) {

                const elementoInput = e.target
                const area = elementoInput.closest("[uid]")
                const areaOpcion = elementoInput.closest("[color]")
                const estadoInicial = areaOpcion.getAttribute("estado")
                const indicador = areaOpcion.querySelector("[com=indicador]")
                const color = areaOpcion.getAttribute("color")

                const contenedorPostRevision = area.querySelector("[contenedor=postRevision]")
                contenedorPostRevision.removeAttribute("cantidadEncontrada")
                contenedorPostRevision.textContent = null
                contenedorPostRevision.classList.add("ocultoInicial")

                if (!estadoInicial) {
                    const colores = area.querySelectorAll("[color]")
                    colores.forEach(c => {
                        const i = c.querySelector("[com=indicador]")
                        i.classList.add("ocultoInicial")
                        c.removeAttribute("estado")
                    })
                    areaOpcion.setAttribute("estado", "activado")
                    indicador.classList.remove("ocultoInicial")
                    if (color === "rojo") {
                        this.pantallaRespuestaNegativa({
                            area
                        })
                    }
                } else {
                    areaOpcion.removeAttribute("estado")
                    indicador.classList.add("ocultoInicial")
                }


            },
            pantallaRespuestaNegativa: function (data) {
                const area = data.area
                const nombre = area.querySelector("[nombre]").getAttribute("nombre")
                const cantidad_enAlojamiento = area.querySelector("[cantidad_enAlojamiento]").getAttribute("cantidad_enAlojamiento")
                const contenedorPostRevision = area.querySelector("[contenedor=postRevision]")


                const main = document.querySelector("main")
                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada({
                    alineacion: "arriba"
                })
                const contenedor = ui.querySelector("[componente=contenedor]")
                main.appendChild(ui)



                const tUI = document.createElement("p")
                tUI.classList.add("colorGrisV1", "negrita", "padding10")
                tUI.textContent = `¿Cual es la cantidad de ${nombre} que has encontrado en el alojamiento?`
                contenedor.appendChild(tUI)

                const contenedorCantidad = document.createElement("div")
                contenedorCantidad.classList.add("grid", "gap6")
                contenedorCantidad.style.gridTemplateColumns = "1fr 50px 50px"
                contenedor.appendChild(contenedorCantidad)


                const cCantidad = document.createElement("input")
                cCantidad.setAttribute("campo", "cantidad_enAlojamiento")
                cCantidad.min = "0"
                cCantidad.max = cantidad_enAlojamiento - 1
                cCantidad.type = "number"
                cCantidad.placeholder = "Pon la cantidad encontrada en el alojamiento"
                cCantidad.value = 0
                contenedorCantidad.appendChild(cCantidad)

                const botonMas = document.createElement("div")
                botonMas.classList.add("flexVertical", "padding10", "flextJustificacion_center", "flexAHCentrad", "borderRadius16", "noSelecionable")
                botonMas.style.background = "green"
                botonMas.style.color = "white"
                botonMas.textContent = "+"
                botonMas.style.fontSize = "20px"
                botonMas.addEventListener("click", () => {
                    casaVitini.view.utilidades.controladorBotones({
                        signo: "mas",
                        campo: cCantidad
                    })
                })
                contenedorCantidad.appendChild(botonMas)


                const botonMenos = document.createElement("div")
                botonMenos.classList.add("flexVertical", "padding10", "flextJustificacion_center", "flexAHCentrad", "borderRadius16", "noSelecionable")
                botonMenos.style.background = "red"
                botonMenos.style.color = "white"
                botonMenos.style.fontSize = "20px"
                botonMenos.textContent = "-"
                botonMenos.addEventListener("click", () => {
                    casaVitini.view.utilidades.controladorBotones({
                        signo: "menos",
                        campo: cCantidad
                    })
                })
                contenedorCantidad.appendChild(botonMenos)


                const boton = document.createElement("div")
                boton.classList.add("botonV1BlancoIzquierda")
                boton.setAttribute("boton", "dinamico")
                boton.textContent = "Guardar y volver"
                boton.addEventListener("click", (e) => {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    contenedorPostRevision.textContent = `${cCantidad.value} Encontrados`
                    contenedorPostRevision.setAttribute("cantidadEncontrada", cCantidad.value)
                    contenedorPostRevision.classList.remove("ocultoInicial")

                })
                contenedor.appendChild(boton)


            },
            finalizarResivionIventarioAlojamiento: async function (data) {

                const uid = data.uid
                const apartamentoIDV = data.apartamentoIDV
                const main = document.querySelector("main")
                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                const contenedor = ui.querySelector("[componente=contenedor]")
                main.appendChild(ui)

                const spinner = casaVitini.ui.componentes.spinnerSimple()
                contenedor.appendChild(spinner)

                const opciones = main.querySelectorAll("[uid]")
                const respuestas = []
                opciones.forEach(o => {
                    const uid = o.getAttribute("uid")
                    const color = o.querySelector("[estado=activado]")?.getAttribute("color")
                    const cantidad_enAlojamiento = o.querySelector("[cantidad_enAlojamiento]")?.getAttribute("cantidad_enAlojamiento")

                    if (color) {
                        const opcion = {
                            uid,
                            color
                        }
                        if (color === "rojo") {
                            const cantidadEncontrada = o.querySelector("[contenedor=postRevision]").getAttribute("cantidadEncontrada")
                            opcion.cantidadEncontrada = cantidadEncontrada
                        } else if (color === "verde") {
                            opcion.cantidadEncontrada = cantidad_enAlojamiento
                        }
                        respuestas.push(opcion)
                    }
                })

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/protocolos/alojamiento/revisar_alojamiento/actualizarRevisionInventario",
                    uid,
                    respuestas
                })
                ui?.remove()

                if (respuestaServidor.error) {
                    // const titulo = document.createElement("p")
                    // titulo.classList.add("padding10", "textoCentrado")
                    // titulo.textContent = respuestaServidor.error
                    // contenedor.appendChild(titulo)

                    // const botonCerrar = document.createElement("div")
                    // botonCerrar.classList.add("botonV1BlancoIzquierda")
                    // botonCerrar.textContent = "Cerrar y volver"
                    // botonCerrar.addEventListener("click", () => {
                    //     ui?.remove()
                    // })
                    // contenedor.appendChild(botonCerrar)
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.error)
                }
                if (respuestaServidor.ok) {
                    const revision = respuestaServidor.revision

                    const revisionInventario = revision.revisionInventario || []
                    const reposicionInventario = revision.reposicionInventario || []
                    const estadoReposicon = ["noHaceFalta"]
                    for (const rI of revisionInventario) {
                        const color = rI.color

                        if (color === "rojo") {
                            estadoReposicon[0] = "pendiente"
                            break
                        }
                    }

                    if (estadoReposicon[0] === "pendiente") {
                        await casaVitini.view.zonas.resposicion.arranque({
                            apartamentoIDV,
                            uid
                        })
                        if (reposicionInventario.length > 0) {
                            casaVitini.view.zonas.resposicion.recuperarReposicion({
                                apartamentoIDV,
                                uid
                            })
                        }
                    } else if (estadoReposicon[0] === "noHaceFalta") {
                        casaVitini.view.zonas.limpieza.arranque({
                            apartamentoIDV,
                            uid
                        })
                    }
                }
            },
            recuperarInventario: async function (data) {

                const apartamentoIDV = data.apartamentoIDV

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/protocolos/alojamiento/revisar_alojamiento/obtenerRevision",
                    apartamentoIDV
                })
                if (respuestaServidor.error) {
                    const error = document.createElement("p")
                    error.classList.add("padding12", "negrita")
                    error.textContent = respuestaServidor.error
                    uiSelector.appendChild(error)

                    const botonVolver = document.createElement("a")
                    botonVolver.classList.add("botonV1BlancoIzquierda")
                    botonVolver.textContent = "Volver a seleciona otro alojamiento para revisar"
                    botonVolver.href = `/administracion/protocolos/revisar_alojamiento`

                    botonVolver.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                    uiSelector.appendChild(botonVolver)
                }
                if (respuestaServidor.ok) {

                    const revision = respuestaServidor.revision
                    const revisionInventario = revision.revisionInventario || []
                    const reposicionInventario = revision.reposicionInventario || []
                    const uidRevision = revision.uid

                    const main = document.querySelector("main")

                    const ui = main.querySelector(`[zona=respuestas]`)

                    revisionInventario.forEach(r => {
                        const color = r.color
                        const uidRespuesta = r.uid
                        const cantidadEncontrada = r.cantidadEncontrada

                        const respuestaUI = ui.querySelector(`[uid="${uidRespuesta}"]`)
                        if (color === "rojo") {
                            const colorRojo = respuestaUI.querySelector("[color=rojo]")
                            colorRojo.setAttribute("estado", "activado")


                            const indicador = colorRojo.querySelector("[com=indicador]")
                            indicador.classList.remove("ocultoInicial")

                            const contenedorPostRevision = respuestaUI.querySelector("[contenedor=postRevision]")
                            contenedorPostRevision.textContent = `${cantidadEncontrada} Encontrados`
                            contenedorPostRevision.setAttribute("cantidadEncontrada", cantidadEncontrada)
                            contenedorPostRevision.classList.remove("ocultoInicial")
                        } if (color === "verde") {
                            const colorVerde = respuestaUI.querySelector("[color=verde]")
                            colorVerde.setAttribute("estado", "activado")

                            const indicador = colorVerde.querySelector("[com=indicador]")
                            indicador.classList.remove("ocultoInicial")

                        }






                    })

                }

            }
        },
        resposicion: {
            arranque: async function (data) {
                const apartamentoIDV = data.apartamentoIDV
                const uid = data.uid
                const main = document.querySelector("main")

                const zona = main.querySelector("[zona=protocolo]")
                zona.textContent = null

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/protocolos/alojamiento/revisar_alojamiento/obtenerReposicion",
                    uid
                })
                if (respuestaServidor.error) {
                    const error = document.createElement("p")
                    error.classList.add("padding10")
                    error.textContent = respuestaServidor.error
                    zona.appendChild(error)
                }

                if (respuestaServidor.ok) {

                    const apartamentoUI = respuestaServidor.apartamentoUI
                    const reposicionFinal = respuestaServidor.reposicionFinal || []

                    const tI = document.createElement("div")
                    tI.classList.add("textoNegrita", "padding16", "negrita")
                    tI.textContent = `Reposicion del inventario del ${apartamentoUI}`
                    zona.appendChild(tI)

                    const botonCancelar = document.createElement("div")
                    botonCancelar.classList.add("botonV1BlancoIzquierda")
                    botonCancelar.setAttribute("boton", "dinamico")
                    botonCancelar.textContent = "Cancelar el protocolo de preparación"
                    botonCancelar.addEventListener("click", () => {
                        casaVitini.view.cancelarRevision.ui({
                            uid
                        })
                    })
                    zona.appendChild(botonCancelar)

                    const botonVolverAlInventario = document.createElement("div")
                    botonVolverAlInventario.classList.add("botonV1BlancoIzquierda")
                    botonVolverAlInventario.setAttribute("boton", "dinamico")
                    botonVolverAlInventario.textContent = "Volver al inventario"
                    botonVolverAlInventario.addEventListener("click", async () => {
                        await casaVitini.view.zonas.inventario.arranque({
                            apartamentoIDV,
                            uid
                        })

                        casaVitini.view.zonas.inventario.recuperarInventario({
                            apartamentoIDV,
                            uid
                        })
                    })
                    zona.appendChild(botonVolverAlInventario)

                    const contenedorIventario = document.createElement("div")
                    contenedorIventario.classList.add("flexVertical", "gap10")
                    zona.appendChild(contenedorIventario)


                    const info = document.createElement("div")
                    info.classList.add("textoNegrita", "padding16")
                    info.textContent = `Por favor, dirígete al almacén y revisa si puedes obtener los elementos necesarios para la reposición del inventario del alojamiento`
                    contenedorIventario.appendChild(info)



                    const cI = document.createElement("div")
                    cI.classList.add("flexVertical", "gap10")
                    cI.setAttribute("zona", "respuestas")
                    contenedorIventario.appendChild(cI)

                    reposicionFinal.forEach(iDP => {
                        const elementoUID = iDP.elementoUID
                        const uid = iDP.uid
                        const nombre = iDP.nombre
                        const cantidadParaReponer = iDP.cantidadParaReponer
                        const posicion = iDP.posicion
                        const totalPosiciones = iDP.totalPosiciones
                        const posicionUID = Number(posicion - 1)

                        const inventarioUID = this.reposicionUI({
                            uid,
                            nombre,
                            cantidadParaReponer,


                        })
                        cI.appendChild(inventarioUID);
                    })

                    const boton = document.createElement("div")
                    boton.classList.add("botonV1BlancoIzquierda")
                    boton.setAttribute("boton", "dinamico")
                    boton.textContent = "Finalizar reposicion del inventario del alojamiento"
                    boton.addEventListener("click", (e) => {
                        this.finalizarReposicionAlojamiento({
                            apartamentoIDV,
                            uid
                        })
                    })
                    zona.appendChild(boton)
                }
            },
            reposicionUI: function (data) {
                const uid = data.uid
                const nombre = data.nombre
                const cantidadParaReponer = data.cantidadParaReponer

                const c = document.createElement("div")
                c.classList.add("gridHorizontal3C_minContent_auto", "gap10", "borderRadius16", "padding6", "borderGrey1")
                c.setAttribute("uid", uid)



                const esferaContenedorVerde = document.createElement("div")
                esferaContenedorVerde.setAttribute("color", "verde")
                esferaContenedorVerde.classList.add("flexVertical", "flextJustificacion_center")
                esferaContenedorVerde.addEventListener("click", (e) => {
                    this.controlSel(e)
                })
                c.appendChild(esferaContenedorVerde)


                const esferaVerde = document.createElement("div")
                esferaVerde.style.borderColor = "green"
                esferaVerde.classList.add("esferaSeleccionable")
                esferaContenedorVerde.appendChild(esferaVerde)

                const indicadorVerde = document.createElement("div")
                indicadorVerde.classList.add("indicadorDeSeleccionConFondo", "ocultoInicial")
                indicadorVerde.setAttribute("com", "indicador")
                esferaVerde.appendChild(indicadorVerde)

                const esferaContenedorRoja = document.createElement("div")
                esferaContenedorRoja.setAttribute("color", "rojo")
                esferaContenedorRoja.classList.add("flexVertical", "flextJustificacion_center")
                esferaContenedorRoja.addEventListener("click", (e) => {
                    this.controlSel(e)
                })
                c.appendChild(esferaContenedorRoja)


                const esferaRoja = document.createElement("div")
                esferaRoja.classList.add("esferaSeleccionable")
                esferaRoja.style.borderColor = "red"
                esferaContenedorRoja.appendChild(esferaRoja)

                const indicadorRojo = document.createElement("div")
                indicadorRojo.classList.add("indicadorDeSeleccionConFondo", "ocultoInicial")
                indicadorRojo.setAttribute("com", "indicador")
                esferaRoja.appendChild(indicadorRojo)


                const cD = document.createElement("div")
                cD.classList.add("flexVertical", "flextJustificacion_center")
                c.appendChild(cD)

                const titulo = document.createElement("div")
                titulo.classList.add("flexVertical")
                titulo.setAttribute("nombre", nombre)
                titulo.setAttribute("cantidadParaReponer", cantidadParaReponer)
                titulo.textContent = cantidadParaReponer + " " + nombre
                cD.appendChild(titulo)

                const cRevision = document.createElement("div")
                cRevision.classList.add("flexVertical", "ocultoInicial", "negrita")
                cRevision.setAttribute("contenedor", "postRevision")
                cD.appendChild(cRevision)


                return c

            },
            controlSel: function (e) {

                const elementoInput = e.target
                const area = elementoInput.closest("[uid]")
                const areaOpcion = elementoInput.closest("[color]")
                const estadoInicial = areaOpcion.getAttribute("estado")
                const indicador = areaOpcion.querySelector("[com=indicador]")
                const color = areaOpcion.getAttribute("color")

                const contenedorPostRevision = area.querySelector("[contenedor=postRevision]")
                contenedorPostRevision.removeAttribute("cantidadEncontrada")
                contenedorPostRevision.textContent = null
                contenedorPostRevision.classList.add("ocultoInicial")

                if (!estadoInicial) {
                    const colores = area.querySelectorAll("[color]")
                    colores.forEach(c => {
                        const i = c.querySelector("[com=indicador]")
                        i.classList.add("ocultoInicial")
                        c.removeAttribute("estado")
                    })
                    areaOpcion.setAttribute("estado", "activado")
                    indicador.classList.remove("ocultoInicial")
                    if (color === "rojo") {
                        this.pantallaRespuestaNegativa({
                            area
                        })
                    }
                } else {
                    areaOpcion.removeAttribute("estado")
                    indicador.classList.add("ocultoInicial")
                }


            },
            pantallaRespuestaNegativa: function (data) {
                const area = data.area
                const nombre = area.querySelector("[nombre]").getAttribute("nombre")
                const cantidadParaReponer = area.querySelector("[cantidadParaReponer]").getAttribute("cantidadParaReponer")
                const contenedorPostRevision = area.querySelector("[contenedor=postRevision]")

                const main = document.querySelector("main")
                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada({
                    alineacion: "arriba"
                })
                const contenedor = ui.querySelector("[componente=contenedor]")
                main.appendChild(ui)

                const tUI = document.createElement("p")
                tUI.classList.add("colorGrisV1", "negrita", "padding10")
                tUI.textContent = `¿Cual es la cantidad de ${nombre} que has encontrado en el almancen?`
                contenedor.appendChild(tUI)

                const contenedorCantidad = document.createElement("div")
                contenedorCantidad.classList.add("grid", "gap6")
                contenedorCantidad.style.gridTemplateColumns = "1fr 50px 50px"
                contenedor.appendChild(contenedorCantidad)

                const cCantidad = document.createElement("input")
                cCantidad.setAttribute("campo", "cantidadParaReponer")
                cCantidad.min = "0"
                cCantidad.max = cantidadParaReponer
                cCantidad.type = "number"
                cCantidad.placeholder = "Pon la cantidad encontrada en el almacen"
                cCantidad.value = 0
                contenedorCantidad.appendChild(cCantidad)

                const botonMas = document.createElement("div")
                botonMas.classList.add("flexVertical", "padding10", "flextJustificacion_center", "flexAHCentrad", "borderRadius16", "noSelecionable")
                botonMas.style.background = "green"
                botonMas.style.color = "white"
                botonMas.textContent = "+"
                botonMas.style.fontSize = "20px"
                botonMas.addEventListener("click", () => {
                    casaVitini.view.utilidades.controladorBotones({
                        signo: "mas",
                        campo: cCantidad
                    })
                })
                contenedorCantidad.appendChild(botonMas)


                const botonMenos = document.createElement("div")
                botonMenos.classList.add("flexVertical", "padding10", "flextJustificacion_center", "flexAHCentrad", "borderRadius16", "noSelecionable")
                botonMenos.style.background = "red"
                botonMenos.style.color = "white"
                botonMenos.style.fontSize = "20px"
                botonMenos.textContent = "-"
                botonMenos.addEventListener("click", () => {
                    casaVitini.view.utilidades.controladorBotones({
                        signo: "menos",
                        campo: cCantidad
                    })
                })
                contenedorCantidad.appendChild(botonMenos)




                const boton = document.createElement("div")
                boton.classList.add("botonV1BlancoIzquierda")
                boton.setAttribute("boton", "dinamico")
                boton.textContent = "Guardar y volver"
                boton.addEventListener("click", (e) => {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    contenedorPostRevision.textContent = `${cCantidad.value} Encontrados`
                    contenedorPostRevision.setAttribute("cantidadEncontrada", cCantidad.value)
                    contenedorPostRevision.classList.remove("ocultoInicial")

                })
                contenedor.appendChild(boton)

            },
            finalizarReposicionAlojamiento: async function (data) {

                const uid = data.uid
                const apartamentoIDV = data.apartamentoIDV
                const main = document.querySelector("main")
                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                const contenedor = ui.querySelector("[componente=contenedor]")
                main.appendChild(ui)

                const spinner = casaVitini.ui.componentes.spinnerSimple()
                contenedor.appendChild(spinner)

                const opciones = main.querySelectorAll("[uid]")
                const respuestas = []
                opciones.forEach(o => {
                    const uid = o.getAttribute("uid")
                    const color = o.querySelector("[estado=activado]")?.getAttribute("color")
                    const cantidadParaReponer = o.querySelector("[cantidadParaReponer]")?.getAttribute("cantidadParaReponer")

                    if (color) {
                        const opcion = {
                            uid,
                            color
                        }
                        if (color === "rojo") {
                            const cantidadEncontrada = o.querySelector("[contenedor=postRevision]").getAttribute("cantidadEncontrada")
                            opcion.cantidadEncontrada = cantidadEncontrada
                        } else if (color === "verde") {
                            opcion.cantidadEncontrada = cantidadParaReponer
                        }
                        respuestas.push(opcion)
                    }
                })

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/protocolos/alojamiento/revisar_alojamiento/actualizarReposicionInventario",
                    uid,
                    respuestas
                })
                ui?.remove()

                if (respuestaServidor.error) {
                    // const titulo = document.createElement("p")
                    // titulo.classList.add("padding10", "textoCentrado")
                    // titulo.textContent = respuestaServidor.error
                    // contenedor.appendChild(titulo)

                    // const botonCerrar = document.createElement("div")
                    // botonCerrar.classList.add("botonV1BlancoIzquierda")
                    // botonCerrar.textContent = "Cerrar y volver"
                    // botonCerrar.addEventListener("click", () => {
                    //     ui?.remove()
                    // })
                    // contenedor.appendChild(botonCerrar)
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.error)
                }
                if (respuestaServidor.ok) {
                    casaVitini.view.zonas.limpieza.arranque({
                        apartamentoIDV,
                        uid
                    })
                }

            },
            recuperarReposicion: async function (data) {

                const apartamentoIDV = data.apartamentoIDV

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/protocolos/alojamiento/revisar_alojamiento/obtenerRevision",
                    apartamentoIDV
                })
                if (respuestaServidor.error) {
                    const error = document.createElement("p")
                    error.classList.add("padding12", "negrita")
                    error.textContent = respuestaServidor.error
                    uiSelector.appendChild(error)

                    const botonVolver = document.createElement("a")
                    botonVolver.classList.add("botonV1BlancoIzquierda")
                    botonVolver.textContent = "Volver a seleciona otro alojamiento para revisar"
                    botonVolver.href = `/administracion/protocolos/revisar_alojamiento`

                    botonVolver.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                    uiSelector.appendChild(botonVolver)
                }
                if (respuestaServidor.ok) {

                    const revision = respuestaServidor.revision
                    const revisionInventario = revision.revisionInventario || []
                    const reposicionInventario = revision.reposicionInventario || []
                    const uidRevision = revision.uid

                    const main = document.querySelector("main")

                    const ui = main.querySelector(`[zona=respuestas]`)

                    reposicionInventario.forEach(r => {
                        const color = r.color
                        const uidRespuesta = r.uid
                        const cantidadEncontrada = r.cantidadEncontrada

                        const respuestaUI = ui.querySelector(`[uid="${uidRespuesta}"]`)
                        if (color === "rojo") {
                            const colorRojo = respuestaUI.querySelector("[color=rojo]")
                            colorRojo.setAttribute("estado", "activado")


                            const indicador = colorRojo.querySelector("[com=indicador]")
                            indicador.classList.remove("ocultoInicial")

                            const contenedorPostRevision = respuestaUI.querySelector("[contenedor=postRevision]")
                            contenedorPostRevision.textContent = `${cantidadEncontrada} Encontrados`
                            contenedorPostRevision.setAttribute("cantidadEncontrada", cantidadEncontrada)
                            contenedorPostRevision.classList.remove("ocultoInicial")
                        } if (color === "verde") {
                            const colorVerde = respuestaUI.querySelector("[color=verde]")
                            colorVerde.setAttribute("estado", "activado")

                            const indicador = colorVerde.querySelector("[com=indicador]")
                            indicador.classList.remove("ocultoInicial")
                        }

                    })

                }

            }
        },
        limpieza: {
            arranque: async function (data) {
                const apartamentoIDV = data.apartamentoIDV
                const uid = data.uid
                const main = document.querySelector("main")

                const zona = main.querySelector("[zona=protocolo]")
                zona.textContent = null

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/protocolos/alojamiento/revisar_alojamiento/obtenerTareasDelAlojamiento",
                    apartamentoIDV
                })
                if (respuestaServidor.error) {
                    const error = document.createElement("p")
                    error.classList.add("padding10")
                    error.textContent = respuestaServidor.error
                    zona.appendChild(error)
                    return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.error)
                }

                if (respuestaServidor.ok) {

                    const alojamiento = respuestaServidor.alojamiento
                    const tareasDelDia = respuestaServidor.tareasDelDia
                    const apartamentoUI = alojamiento.apartamentoUI

                    const tI = document.createElement("div")
                    tI.classList.add("textoNegrita", "padding16", "negrita")
                    tI.textContent = `Tareas del ${apartamentoUI}`
                    zona.appendChild(tI)


                    const botonCancelar = document.createElement("div")
                    botonCancelar.classList.add("botonV1BlancoIzquierda")
                    botonCancelar.setAttribute("boton", "dinamico")
                    botonCancelar.textContent = "Cancelar el protocolo de preparación"
                    botonCancelar.addEventListener("click", () => {
                        casaVitini.view.cancelarRevision.ui({
                            uid
                        })
                    })
                    zona.appendChild(botonCancelar)


                    const botonVolverALaReposicicion = document.createElement("div")
                    botonVolverALaReposicicion.classList.add("botonV1BlancoIzquierda")
                    botonVolverALaReposicicion.setAttribute("boton", "dinamico")
                    botonVolverALaReposicicion.textContent = "Volver a la reposicion del alojamiento"
                    botonVolverALaReposicicion.addEventListener("click", async () => {
                        await casaVitini.view.zonas.resposicion.arranque({
                            apartamentoIDV,
                            uid
                        })

                        casaVitini.view.zonas.resposicion.recuperarReposicion({
                            apartamentoIDV,
                            uid
                        })
                    })
                    zona.appendChild(botonVolverALaReposicicion)


                    const contenedorIventario = document.createElement("div")
                    contenedorIventario.classList.add("flexVertical", "gap10")
                    zona.appendChild(contenedorIventario)

                    const info = document.createElement("div")
                    info.classList.add("textoNegrita", "padding16")
                    info.textContent = `Tareas necesario para preparar el alojamiento`
                    contenedorIventario.appendChild(info)

                    const cI = document.createElement("div")
                    cI.classList.add("flexVertical", "gap10")
                    contenedorIventario.appendChild(cI)

                    tareasDelDia.forEach(tDP => {
                        const uid = tDP.uid
                        const tareaUI = tDP.tareaUI
                        const posicion = tDP.posicion
                        const totalPosiciones = tDP.totalPosiciones
                        const posicionUID = Number(posicion - 1)

                        const inventarioUID = this.tareaUI({
                            uid,
                            tareaUI,


                        })
                        cI.appendChild(inventarioUID);
                    })

                    const boton = document.createElement("div")
                    boton.classList.add("botonV1BlancoIzquierda")
                    boton.setAttribute("boton", "dinamico")
                    boton.textContent = "Finalizar tareas del alojamiento"
                    boton.addEventListener("click", (e) => {
                        const zona = e.target.closest("[zona=inventario]")
                        this.finalizarLimpiezaAlojamiento({
                            zona,
                            uid
                        })
                    })
                    zona.appendChild(boton)
                }
            },
            controlSel: function (e) {

                const elementoInput = e.target
                const area = elementoInput.closest("[uid]")
                const areaOpcion = elementoInput.closest("[color]")
                const estadoInicial = areaOpcion.getAttribute("estado")
                const indicador = areaOpcion.querySelector("[com=indicador]")
                const color = areaOpcion.getAttribute("color")

                const contenedorPostRevision = area.querySelector("[contenedor=postRevision]")
                contenedorPostRevision.classList.add("ocultoInicial")
                contenedorPostRevision.removeAttribute("explicacion")
                const contenedorExplicacion = contenedorPostRevision.querySelector("[contenedor=explicacion]")
                contenedorExplicacion.textContent = null

                if (!estadoInicial) {
                    const colores = area.querySelectorAll("[color]")
                    colores.forEach(c => {
                        const i = c.querySelector("[com=indicador]")
                        i.classList.add("ocultoInicial")
                        c.removeAttribute("estado")
                    })
                    areaOpcion.setAttribute("estado", "activado")
                    indicador.classList.remove("ocultoInicial")
                    if (color === "rojo") {
                        this.pantallaRespuestaNegativa({
                            area
                        })
                    }
                } else {
                    areaOpcion.removeAttribute("estado")
                    indicador.classList.add("ocultoInicial")
                }


            },
            tareaUI: function (data) {
                const uid = data.uid
                const tareaUI = data.tareaUI

                const c = document.createElement("div")
                c.classList.add("gridHorizontal3C_minContent_auto", "gap10", "borderRadius16", "padding6", "borderGrey1")
                c.setAttribute("uid", uid)

                const esferaContenedorVerde = document.createElement("div")
                esferaContenedorVerde.setAttribute("color", "verde")
                esferaContenedorVerde.classList.add("flexVertical")
                esferaContenedorVerde.addEventListener("click", (e) => {
                    this.controlSel(e)
                })
                c.appendChild(esferaContenedorVerde)


                const esferaVerde = document.createElement("div")
                esferaVerde.style.borderColor = "green"
                esferaVerde.classList.add("esferaSeleccionable")
                esferaContenedorVerde.appendChild(esferaVerde)

                const indicadorVerde = document.createElement("div")
                indicadorVerde.classList.add("indicadorDeSeleccionConFondo", "ocultoInicial")
                indicadorVerde.setAttribute("com", "indicador")
                esferaVerde.appendChild(indicadorVerde)

                const esferaContenedorRoja = document.createElement("div")
                esferaContenedorRoja.setAttribute("color", "rojo")
                esferaContenedorRoja.classList.add("flexVertical")
                esferaContenedorRoja.addEventListener("click", (e) => {
                    this.controlSel(e)
                })
                c.appendChild(esferaContenedorRoja)


                const esferaRoja = document.createElement("div")
                esferaRoja.classList.add("esferaSeleccionable")
                esferaRoja.style.borderColor = "red"
                esferaContenedorRoja.appendChild(esferaRoja)

                const indicadorRojo = document.createElement("div")
                indicadorRojo.classList.add("indicadorDeSeleccionConFondo", "ocultoInicial")
                indicadorRojo.setAttribute("com", "indicador")
                esferaRoja.appendChild(indicadorRojo)



                const cD = document.createElement("div")
                cD.classList.add("flexVertical", "flextJustificacion_center")
                c.appendChild(cD)

                const titulo = document.createElement("div")
                titulo.classList.add("flexVertical", "padding8")
                titulo.setAttribute("tareaUI", tareaUI)
                titulo.textContent = tareaUI
                cD.appendChild(titulo)

                const cRevision = document.createElement("div")
                cRevision.classList.add("flexVertical", "ocultoInicial", "negrita")
                cRevision.setAttribute("contenedor", "postRevision")
                cD.appendChild(cRevision)


                const explicacion = document.createElement("pre")
                explicacion.classList.add("flexVertical", "paddingLateral10")
                explicacion.setAttribute("contenedor", "explicacion")
                cRevision.appendChild(explicacion)


                const modificarExplicacion = document.createElement("div")
                modificarExplicacion.classList.add("botonV4")
                modificarExplicacion.setAttribute("boton", "modificarExplicacion")
                modificarExplicacion.textContent = "Modificar anotación"
                // cRevision.appendChild(modificarExplicacion)



                return c

            },
            pantallaRespuestaNegativa: function (data) {
                const area = data.area
                const tareaUI = area.querySelector("[tareaUI]").getAttribute("tareaUI")
                const contenedorPostRevision = area.querySelector("[contenedor=postRevision]")

                const main = document.querySelector("main")
                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada({
                    alineacion: "arriba"
                })
                const contenedor = ui.querySelector("[componente=contenedor]")
                main.appendChild(ui)

                const tUI = document.createElement("p")
                tUI.classList.add("colorGrisV1", "negrita", "padding10")
                tUI.textContent = `Si no puedes completar la tarea ${tareaUI} , selecciona la opción 'No puedo realizar esta tarea'. Si lo consideras oportuno, puedes dejar una nota opcional explicando el motivo por el cual no se ha podido realizar la tarea`
                contenedor.appendChild(tUI)

                const campoExplicacion = document.createElement("textarea")
                campoExplicacion.classList.add("padding10", "textAreaRedimenzionHorizontal")
                campoExplicacion.style.minHeight = "100px"
                campoExplicacion.setAttribute("campo", "explicacion")
                campoExplicacion.placeholder = `Opcional`
                contenedor.appendChild(campoExplicacion)

                const boton = document.createElement("div")
                boton.classList.add("botonV1BlancoIzquierda")
                boton.setAttribute("boton", "dinamico")
                boton.textContent = "Confirmo que no puedo realizar esta tarea"
                boton.addEventListener("click", () => {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()

                    const contenedorExplicacion = contenedorPostRevision.querySelector("[contenedor=explicacion]")



                    contenedorExplicacion.textContent = campoExplicacion.value
                    contenedorPostRevision.setAttribute("explicacion", campoExplicacion.value)
                    contenedorPostRevision.classList.remove("ocultoInicial")
                })
                contenedor.appendChild(boton)

            },
            finalizarLimpiezaAlojamiento: async function (data) {

                const uid = data.uid
                const apartamentoIDV = data.apartamentoIDV
                const main = document.querySelector("main")
                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                const contenedor = ui.querySelector("[componente=contenedor]")
                main.appendChild(ui)

                const spinner = casaVitini.ui.componentes.spinnerSimple()
                contenedor.appendChild(spinner)

                const opciones = main.querySelectorAll("[uid]")
                const respuestas = []
                opciones.forEach(o => {
                    const uid = o.getAttribute("uid")
                    const color = o.querySelector("[estado=activado]")?.getAttribute("color")
                    const cantidadParaReponer = o.querySelector("[cantidadParaReponer]")?.getAttribute("cantidadParaReponer")

                    if (color) {
                        const opcion = {
                            uid,
                            color
                        }
                        if (color === "rojo") {
                            const explicacion = o.querySelector("[contenedor=explicacion]").getAttribute("explicacion")
                            opcion.explicacion = explicacion || ""
                        } else if (color === "verde") {
                            opcion.explicacion = ""
                        }
                        respuestas.push(opcion)
                    }
                })

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/protocolos/alojamiento/revisar_alojamiento/actualizarTareasRealizadasAlojamientoFinalizaRevision",
                    uid,
                    respuestas
                })
                ui?.remove()

                if (respuestaServidor.error) {
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.error)
                }
                if (respuestaServidor.ok) {
                    casaVitini.view.zonas.revisionCompletada.arranque({
                        respuestaServidor
                    })
                }

            }
        },
        revisionCompletada: {
            arranque: async function (data) {
                const respuestaServidor = data.respuestaServidor
                const apartamentoUI = respuestaServidor.apartamentoUI
                const fechaFinLocal = respuestaServidor.fechaFinLocal
                const revisionCompletada = respuestaServidor.revisionCompletada

                const main = document.querySelector("main")
                const zona = main.querySelector("[zona=protocolo]")
                zona.textContent = null

                const tI = document.createElement("p")
                tI.classList.add("textoNegrita", "padding16", "negrita")
                tI.textContent = `Gracias por realizar el protocolo de preparación del ${apartamentoUI}, si has de realizar otra preparación, pulsa en el botón de abajo para volver a seleccionar el alojamiento`
                zona.appendChild(tI)

                const botonCancelar = document.createElement("a")
                botonCancelar.classList.add("botonV1BlancoIzquierda")
                botonCancelar.setAttribute("boton", "dinamico")
                botonCancelar.textContent = "Ir a la pantalla de seleción del alojamiento"
                botonCancelar.href = `/administracion/protocolos/revisar_alojamiento`

                botonCancelar.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)

                zona.appendChild(botonCancelar)

            },
        }
    },
    cancelarRevision: {
        ui: function (data) {
            const uid = data.uid

            const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
            const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

            const titulo = constructor.querySelector("[componente=titulo]")
            titulo.textContent = `Confirmar revisión`
            const mensaje = constructor.querySelector("[componente=mensajeUI]")
            mensaje.textContent = `Var a cancelar la revision, ¿Estas de acuerdo?`

            const botonAceptar = constructor.querySelector("[boton=aceptar]")
            botonAceptar.textContent = "Comfirmar la cancelación de la revision"
            botonAceptar.addEventListener("click", () => {
                return this.confirmar({
                    uid,
                })
            })
            const botonCancelar = constructor.querySelector("[boton=cancelar]")
            botonCancelar.textContent = "Volver a la revisión"
            document.querySelector("main").appendChild(pantallaInmersiva)

        },
        confirmar: async function (data) {
            const uid = data.uid
            const tareaUI = data.tareaUI

            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const mensaje = `Eliminado el ${tareaUI}...`
            const datosPantallaSuperpuesta = {
                instanciaUID: instanciaUID,
                mensaje: mensaje
            }
            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/protocolos/alojamiento/revisar_alojamiento/cancelarRevision",
                uid
            })

            const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
            if (!instanciaRenderizada) { return }
            instanciaRenderizada.remove()
            if (respuestaServidor?.error) {
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                // casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                casaVitini.shell.navegacion.controladorVista({
                    vista: "/administracion/protocolos/revisar_alojamiento",
                    tipoOrigen: "menuNavegador"
                })

            }
        }

    },
    utilidades: {
        controladorBotones: (data) => {
            const signo = data.signo
            const campo = data.campo

            console.log("data", data)

            const cantidaEntrada = Number(campo?.value || 0)
            let cantidaFinal
            if (signo === "mas") {
                cantidaFinal = cantidaEntrada + 1
            } else if (signo === "menos") {
                cantidaFinal = cantidaEntrada - 1
                cantidaFinal = cantidaFinal < 0 ? 0 : cantidaFinal
            }
            campo.value = cantidaFinal
        }

    },
    protocoloNoDefinido: function (data) {

        const apartmentoUI = data.apartamentoUI
        const main = document.querySelector("main [zona=protocolo]")

        const info = document.createElement("p")
        info.classList.add("padding10")
        info.textContent = `El alojamiento ${apartmentoUI} no tiene ningun protocolo de preparación definio`
        main.appendChild(info)

        const botonVolver = document.createElement("a")
        botonVolver.classList.add("botonV1BlancoIzquierda")
        botonVolver.textContent = "Volver a la seleción de alojamiento"
        botonVolver.href = "/administracion/protocolos/revisar_alojamiento"

        botonVolver.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
        main.appendChild(botonVolver)




    }
}