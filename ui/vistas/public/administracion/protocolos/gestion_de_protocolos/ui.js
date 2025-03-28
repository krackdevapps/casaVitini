casaVitini.view = {
    start: function () {
        const granuladorURL = casaVitini.utilidades.granuladorURL()
        const parametros = granuladorURL.parametros
        if (parametros?.alojamiento) {
            this.detallesDelProtocolo.arranque({
                apartamentoIDV: parametros.alojamiento
            })
        } else {
            this.mostrarAlojamientos()
        }


    },
    mostrarAlojamientos: async function (data) {

        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()

        const main = document.querySelector("main")
        main.classList.add("flextJustificacion_center")
        const spinner = casaVitini.ui.componentes.spinnerSimple()
        main.appendChild(spinner)

        main.querySelector("[ui=detallesDelProtocolo]").classList.add("ocultoInicial")
        const uiSelector = main.querySelector("[ui=portada]")
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

            const alojamientos = respuestaServidor.ok
            alojamientos.forEach(a => {
                const apartamentoIDV = a.apartamentoIDV
                const apartamentoUI = a.apartamentoUI

                const ui = document.createElement("a")
                ui.classList.add("tituloContextoAdministracion")
                ui.href = `/administracion/protocolos/gestion_de_protocolos/alojamiento:${apartamentoIDV}`

                ui.textContent = apartamentoUI
                uiSelector.querySelector("[contenedor=alojamiento]").appendChild(ui)
            });




            // uiSelector.querySelector("[data=nombre]").textContent = nombre
            // uiSelector.querySelector("[data=elementoUID]").textContent = elementoUID
            // uiSelector.querySelector("[data=operacionUI]").textContent = operacionUI
            // uiSelector.querySelector("[data=fecha]").textContent = fecha
            // uiSelector.querySelector("[data=definicion]").textContent = definicion
            // uiSelector.querySelector("[data=uid]").textContent = uid


            // botonIrAlElemento.href = `/administracion/inventario/ver_todo_el_inventario/elemento:${elementoUID}`

            // botonIrAlElemento.removeEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            // botonIrAlElemento.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            uiSelector.classList.remove("ocultoInicial")




        }

    },
    detallesDelProtocolo: {
        arranque: function (data) {
            const apartamentoIDV = data.apartamentoIDV
            const main = document.querySelector("main")
            main.querySelector("[ui=portada]").classList.add("ocultoInicial")
            const uiSelector = main.querySelector("[ui=detallesDelProtocolo]")
            uiSelector.classList.remove("ocultoInicial")

            const botonInsertarInventario = uiSelector.querySelector("[boton=insertarElementoDelInventario]")
            botonInsertarInventario.addEventListener("click", () => {
                this.insertartInventario.ui({
                    apartamentoIDV
                })
            })
            const botonInsertarTarea = uiSelector.querySelector("[boton=insertarTarea]")
            botonInsertarTarea.addEventListener("click", () => {
                const tareaUI = this.insertarTarea.ui()
                const contenedor = tareaUI.querySelector("[componente=contenedor]")
                main.appendChild(tareaUI)


                const titulo = tareaUI.querySelector("[data=titulo]")
                titulo.textContent = "Crear e insertar nueva tarea"

                const botonDinamico = tareaUI.querySelector("[boton=dinamico]")
                botonDinamico.textContent = "Insertar tarea en el protocolo del alojamiento 1"
                botonDinamico.addEventListener("click", (e) => {
                    this.insertarTarea.confirmar({
                        area: contenedor,
                        apartamentoIDV
                    })
                })


            })

            this.renderizaProtocolo()

        },
        infoSinInventario: function () {
            const ui = document.createElement("p")
            ui.classList.add("padding10", "sobreControlAnimacionGlobal")
            ui.setAttribute("info", "infoSinInventario")
            ui.textContent = "Inserta elementos del inventario general en el inventario del alojamiento para configurar el protocolo"
            return ui
        },
        infoSinTareas: function () {
            const ui = document.createElement("p")
            ui.classList.add("padding10", "sobreControlAnimacionGlobal")
            ui.setAttribute("info", "infoSinTareas")
            ui.textContent = "Este protocolo no tiene tareas de preparacón, crea tareas de preparación del alojamiento."
            return ui
        },
        insertartInventario: {
            ui: function (data) {
                const apartamentoIDV = data.apartamentoIDV
                const main = document.querySelector("main")
                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada({
                    alineacion: "arriba"
                })
                const instanciaUID = ui.getAttribute("instanciaUID")
                const contenedor = ui.querySelector("[componente=contenedor]")
                main.appendChild(ui)



                const botonCerrar = document.createElement("div")
                botonCerrar.classList.add("botonV1BlancoIzquierda")
                botonCerrar.textContent = "Cerrar y volver"
                botonCerrar.addEventListener("click", () => {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                })
                contenedor.appendChild(botonCerrar)

                const titulo = document.createElement("p")
                titulo.classList.add("colorGrisV1", "negrita", "padding10")
                titulo.textContent = "Buscar elementos del inventario para insertarlo en el protocolo"
                contenedor.appendChild(titulo)

                const contenedorBuscador = document.createElement("div")
                contenedorBuscador.setAttribute("area", "buscador")
                contenedorBuscador.classList.add("flexVertical", "gap6")
                contenedor.appendChild(contenedorBuscador)

                const buscadorUI = document.createElement("input")
                buscadorUI.placeholder = "Buscar en el inventario general"
                buscadorUI.addEventListener("input", (e) => {
                    this.buscadorPorCampo({
                        e,
                        apartamentoIDV
                    })
                })
                contenedorBuscador.appendChild(buscadorUI)

                const estadoBusqueda = document.createElement("p")
                estadoBusqueda.classList.add("padding16", "ocultoInicial")
                estadoBusqueda.textContent = "Buscando..."
                estadoBusqueda.setAttribute("contenedor", "estadoBusqueda")
                contenedorBuscador.appendChild(estadoBusqueda)


                const contenedorResultados = document.createElement("div")
                contenedorResultados.classList.add("flexVertical", "gap6")
                contenedorResultados.setAttribute("contenedor", "resultados")
                contenedorResultados.textContent = "contenedor"
                contenedorBuscador.appendChild(contenedorResultados)


            },
            buscadorPorCampo: async function (data) {
                const buscadorCampo = data.e.target
                const apartamentoIDV = data.apartamentoIDV
                const terminoBusqueda = buscadorCampo.value
                const areaBuscador = buscadorCampo.closest("[area=buscador")

                areaBuscador.querySelector("[contenedor=estadoBusqueda]").classList.remove("ocultoInicial")
                areaBuscador.querySelector("[contenedor=resultados]").textContent = ""
                clearTimeout(casaVitini.componentes.temporizador);
                const campoVacio = terminoBusqueda.length
                if (campoVacio === 0) {
                    areaBuscador.querySelector("[contenedor=estadoBusqueda]").classList.remove("ocultoInicial")
                    areaBuscador.querySelector("[contenedor=resultados]").textContent = ""
                    //crearTimeout(casaVitini.componentes.temporizador)
                    return
                }
                casaVitini.componentes.temporizador = setTimeout(async () => {
                    this.iniciarBusqueda({
                        terminoBusqueda,
                        areaBuscador,
                        apartamentoIDV
                    })
                }, 1500);
            },
            iniciarBusqueda: async function (data) {


                const terminoBusqueda = data.terminoBusqueda
                const areaBuscador = data.areaBuscador
                const apartamentoIDV = data.apartamentoIDV
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                areaBuscador.setAttribute("instanciaUID", instanciaUID)
                const contenedorResultados = areaBuscador.querySelector("[contenedor=resultados]")

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/inventario/buscador",
                    buscar: terminoBusqueda,
                    // nombreColumna: transaccion.nombreColumna,
                    // sentidoColumna: transaccion.sentidoColumna,
                    pagina: Number(1)
                })
                const instanciaRenderizada = areaBuscador.getAttribute(`instanciaUID`)
                if (instanciaRenderizada !== instanciaUID) { return }
                areaBuscador.querySelector("[contenedor=estadoBusqueda]").classList.add("ocultoInicial")



                if (respuestaServidor?.error) {
                    contenedorResultados.textContent = null
                    casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor.error)
                    return
                }
                if (respuestaServidor.totalElementos === 0) {
                    contenedorResultados.textContent = "No se ha encontrado resultados"
                    return
                }
                if (respuestaServidor.ok) {
                    const main = document.querySelector("main")

                    const elementos = respuestaServidor.elementos
                    elementos.forEach(e => {

                        const UID = e.UID
                        const nombre = e.nombre
                        const descripcion = e.descripcion

                        const resultadoUI = this.resultadoUI({
                            UID,
                            nombre,
                            descripcion
                        })
                        resultadoUI.addEventListener("click", () => {
                            const dIS = this.detallesInventarioSelecionadoUI({
                                elementoUID: UID,
                                apartamentoIDV,
                                titulo: "Añadir elemento al inventario del alojamiento",
                                nombre,
                            })

                            const botonDinamico = dIS.querySelector("[boton=dinamico]")
                            botonDinamico.textContent = "Insertar elemento en el invenario del alojamiento"
                            botonDinamico.addEventListener("click", (e) => {
                                const contenedor = e.target.closest("[componente=contenedor]")
                                const cantidad_enAlojamiento = contenedor.querySelector("[campo=cantidad_enAlojamiento]").value
                                this.insertarInventario({
                                    elementoUID: UID,
                                    apartamentoIDV,
                                    cantidad_enAlojamiento

                                })
                            })
                            main.appendChild(dIS)
                        })
                        contenedorResultados.appendChild(resultadoUI)
                    })
                }
            },
            resultadoUI: function (data) {
                const UID = data.UID
                const nombre = data.nombre
                const descripcion = data.descripcion

                const ui = document.createElement("div")
                ui.classList.add("flexVertical", "padding10", "backgroundGrey1", "borderRadius16", "gap6", "comportamientoBoton")
                ui.setAttribute("elementoUID", UID)

                const nombreUI = document.createElement("p")
                nombreUI.classList.add("negrita", "padding6")
                nombreUI.textContent = nombre
                ui.appendChild(nombreUI)

                const cD = document.createElement("details")
                cD.classList.add("padding6", "flexVertical")
                // ui.appendChild(cD)

                const s = document.createElement("summary")
                s.classList.add("padding10")
                s.textContent = "Descripción del elemento"
                cD.append(s)

                const descripcionUI = document.createElement("p")
                descripcionUI.classList.add("negrita")
                descripcionUI.textContent = descripcion
                cD.appendChild(descripcionUI)


                return ui
            },
            insertarInventario: async function (data) {
                const elementoUID = data.elementoUID
                const apartamentoIDV = data.apartamentoIDV
                const cantidad_enAlojamiento = data.cantidad_enAlojamiento


                const main = document.querySelector("main")
                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                const contenedor = ui.querySelector("[componente=contenedor]")
                main.appendChild(ui)

                const spinner = casaVitini.ui.componentes.spinnerSimple()
                contenedor.appendChild(spinner)

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/protocolos/alojamientogestion_de_protocolosinventario/insertarInventarioEnProtocolo",
                    elementoUID,
                    apartamentoIDV,
                    cantidad_enAlojamiento
                })
                spinner?.remove()
                if (respuestaServidor.error) {

                    const titulo = document.createElement("p")
                    titulo.classList.add("padding10", "textoCentrado")
                    titulo.textContent = respuestaServidor.error
                    contenedor.appendChild(titulo)

                    const botonCerrar = document.createElement("div")
                    botonCerrar.classList.add("botonV1BlancoIzquierda")
                    botonCerrar.textContent = "Cerrar y volver"
                    botonCerrar.addEventListener("click", () => {
                        ui?.remove()
                    })
                    contenedor.appendChild(botonCerrar)

                }
                if (respuestaServidor.ok) {
                    ui?.remove()
                    casaVitini.view.detallesDelProtocolo.renderizaProtocolo()
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                }

                // Advertencia inmersiva superperueta de esetap
                //setvidor

            },
            inventarioUI: function (data) {

                const cantidad_enAlojamiento = data.cantidad_enAlojamiento
                const nombre = data.nombre
                const uid = data.uid
                const totalPosiciones = Number(data.totalPosiciones)
                const posicion = Number(data.posicion)
                const main = document.querySelector("main")


                const ui = document.createElement("div")
                ui.classList.add("flexVertical", "padding6", "backgroundGrey1", "borderRadius20", "gap6", "comportamientoBoton", "sobreControlAnimacionGlobal")
                ui.setAttribute("uid", uid)



                const contenedorData = document.createElement("div")
                contenedorData.classList.add("flexVertical", "gap6", "padding16")
                ui.appendChild(contenedorData)

                const nombreUI = document.createElement("p")
                nombreUI.classList.add("negrita")
                nombreUI.textContent = nombre
                contenedorData.appendChild(nombreUI)



                const ct = document.createElement("p")
                ct.classList.add()
                ct.textContent = "Cantidad en el inventario de este alojamiento"
                contenedorData.appendChild(ct)



                const cD = document.createElement("p")
                cD.classList.add("negrita")
                cD.setAttribute("cantidad_enAlojamiento", cantidad_enAlojamiento)
                cD.textContent = cantidad_enAlojamiento
                contenedorData.appendChild(cD)

                const selectorPos = document.createElement("select")
                selectorPos.setAttribute("selector", "posicion")
                selectorPos.addEventListener("click", (e) => {
                    const nuevaPosicion = e.target.value

                    casaVitini.view.detallesDelProtocolo.actualizarPosiconElementoInvetario({
                        uid,
                        posicion: nuevaPosicion,
                        nombre
                    })

                })
                ui.appendChild(selectorPos)

                for (let index = 0; index < totalPosiciones; index++) {
                    const posicionActual = index + 1

                    const o = document.createElement("option")
                    if (posicionActual === posicion) {
                        o.selected = true
                        o.disabled = true
                        o.textContent = "Posición: " + posicionActual
                        o.value = ""
                    } else {
                        o.value = index + 1
                        o.textContent = "Mover a posición: " + posicionActual
                    }
                    selectorPos.appendChild(o)

                }

                const contenedorBotones = document.createElement("div")
                contenedorBotones.classList.add("flexHorizontal", "flexAlineacionI", "gap6")
                ui.appendChild(contenedorBotones)


                const botonAcualizarCantidad = document.createElement("div")
                botonAcualizarCantidad.classList.add("botonV1BlancoIzquierda")
                botonAcualizarCantidad.setAttribute("boton", "actualizarCantidad")
                botonAcualizarCantidad.addEventListener("click", () => {
                    const dIS = this.detallesInventarioSelecionadoUI({
                        titulo: "Modificar elemento del inventario del alojamiento",
                        nombre,
                    })
                    dIS.querySelector("[boton=volver]")?.remove()
                    dIS.querySelector("[campo=cantidad_enAlojamiento]").value = cantidad_enAlojamiento
                    const botonDinamico = dIS.querySelector("[boton=dinamico]")

                    botonDinamico.textContent = "Actualizar elemento del invetario del alojamiento"
                    botonDinamico.addEventListener("click", (e) => {
                        const contenedor = e.target.closest("[componente=contenedor]")
                        const cantidad_enAlojamiento = contenedor.querySelector("[campo=cantidad_enAlojamiento]").value
                        casaVitini.view.detallesDelProtocolo.actualizarElementoInvetario({
                            uid: uid,
                            cantidad_enAlojamiento
                        })
                    })
                    main.appendChild(dIS)


                })
                botonAcualizarCantidad.textContent = "Actualizar cantidad"

                contenedorBotones.appendChild(botonAcualizarCantidad)


                const botonEliminar = document.createElement("div")
                botonEliminar.classList.add("botonV1BlancoIzquierda")
                botonEliminar.textContent = "Eliminar"
                botonEliminar.addEventListener("click", () => {
                    casaVitini.view.detallesDelProtocolo.eliminarElementosDelInventarioDelAlojamiento.ui({
                        uid,
                        nombre
                    })
                })

                contenedorBotones.appendChild(botonEliminar)


                return ui

            },
            inventarioSelecionado: function (data) {
                const nombre = data.nombre
                const cantidad_enAlojamiento = data.cantidad_enAlojamiento
                const uid = data.uid


                const main = document.querySelector("main")
                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada({
                    alineacion: "arriba"
                })
                const contenedor = ui.querySelector("[componente=contenedor]")
                main.appendChild(ui)


                const botonCerrar = document.createElement("div")
                botonCerrar.classList.add("botonV1BlancoIzquierda")
                botonCerrar.textContent = "Cerrar y volver"
                botonCerrar.addEventListener("click", () => {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                })
                contenedor.appendChild(botonCerrar)

                const titulo = document.createElement("p")
                titulo.classList.add("colorGrisV1", "negrita", "padding10")
                titulo.textContent = "Editar elemento del inventario del alojamiento"
                contenedor.appendChild(titulo)



            },
            controladorCantidad: function (e) {
                const elemento = e.target
                const cantidad = elemento.value
                const cantidadInicial = elemento.getAttribute("cantidad_enAlojamiento")
                const areaElemento = elemento.closest("[uid]")
                const botonActualizarCantidad = areaElemento.querySelector("[boton=actualizarCantidad]")

                if (cantidad !== cantidadInicial) {
                    botonActualizarCantidad.classList.remove("ocultoInicial")
                } else {
                    botonActualizarCantidad.classList.add("ocultoInicial")
                }
            },
            detallesInventarioSelecionadoUI: function (data) {

                const titulo = data.titulo
                const nombre = data.nombre
                const cantidad = data?.cantidad || "1"

                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                const contenedor = ui.querySelector("[componente=contenedor]")

                const botonCerrar = document.createElement("div")
                botonCerrar.classList.add("botonV1BlancoIzquierda")
                botonCerrar.textContent = "Cerrar y volver al protocolo del alojamiento"
                botonCerrar.addEventListener("click", () => {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                })
                contenedor.appendChild(botonCerrar)

                const botonVolver = document.createElement("div")
                botonVolver.classList.add("botonV1BlancoIzquierda")
                botonVolver.setAttribute("boton", "volver")
                botonVolver.textContent = "Volver a la lista de resultados"
                botonVolver.addEventListener("click", (e) => {
                    const ventana = e.target.closest("[componente=advertenciaInmersiva]")
                    ventana?.remove()

                })
                contenedor.appendChild(botonVolver)

                ui.classList.remove("flextJustificacion_center")
                ui.classList.add("flextJustificacion_arriba")

                const tUI = document.createElement("p")
                tUI.classList.add("colorGrisV1", "negrita", "padding10")
                tUI.textContent = titulo
                contenedor.appendChild(tUI)


                const nombreUI = document.createElement("p")
                nombreUI.classList.add("fontSize20", "negrita", "padding10")
                nombreUI.textContent = nombre
                contenedor.appendChild(nombreUI)



                const infoUI = document.createElement("p")
                infoUI.classList.add("padding10")
                infoUI.textContent = "Establece la cantidad del inventario en el alojamiento, solo se aceptan numeros enteros"
                contenedor.appendChild(infoUI)


                const cCantidad = document.createElement("input")
                cCantidad.setAttribute("campo", "cantidad_enAlojamiento")
                cCantidad.min = "1"
                cCantidad.type = "number"
                cCantidad.placeholder = "Establece la cantidad del elemento en el inventario del alojamiento"
                cCantidad.value = cantidad
                contenedor.appendChild(cCantidad)

                const botonDinamico = document.createElement("div")
                botonDinamico.classList.add("botonV1BlancoIzquierda")
                botonDinamico.setAttribute("boton", "dinamico")
                contenedor.appendChild(botonDinamico)

                return ui

            }
        },
        actualizarElementoInvetario: async function (data) {
            const uid = data.uid
            const cantidad_enAlojamiento = data.cantidad_enAlojamiento

            const main = document.querySelector("main")
            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
            const contenedor = ui.querySelector("[componente=contenedor]")
            main.appendChild(ui)

            const spinner = casaVitini.ui.componentes.spinnerSimple()
            contenedor.appendChild(spinner)

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "gestion_de_protocolosactualizarCantidadElementoInventario",
                uid,
                cantidad_enAlojamiento
            })
            spinner?.remove()
            if (respuestaServidor.error) {
                const titulo = document.createElement("p")
                titulo.classList.add("padding10", "textoCentrado")
                titulo.textContent = respuestaServidor.error
                contenedor.appendChild(titulo)

                const botonCerrar = document.createElement("div")
                botonCerrar.classList.add("botonV1BlancoIzquierda")
                botonCerrar.textContent = "Cerrar y volver"
                botonCerrar.addEventListener("click", () => {
                    ui?.remove()
                })
                contenedor.appendChild(botonCerrar)

            }
            if (respuestaServidor.ok) {
                const elemento = respuestaServidor.elemento
                casaVitini.view.detallesDelProtocolo.renderizaProtocolo()
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
            }


        },
        actualizarPosiconElementoInvetario: async function (data) {
            const uid = data.uid
            const posicion = data.posicion
            const nombre = data.nombre

            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const mensaje = `Actualizando la posicion del ${nombre} a ${posicion}...`
            const datosPantallaSuperpuesta = {
                instanciaUID: instanciaUID,
                mensaje: mensaje
            }
            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/protocolos/alojamiento/gestion_de_protocolos/inventario/actualizarPosicionElementoInventario",
                uid,
                posicion
            })

            const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
            if (!instanciaRenderizada) { return }

            instanciaRenderizada.remove()
            if (respuestaServidor?.error) {
                const main = document.querySelector("main")
                const uiSelector = main.querySelector("[ui=detallesDelProtocolo]")
                uiSelector.querySelector(`[uid="${uid}"] [selector=posicion]`).value = ""
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                const elemento = respuestaServidor.elemento
                casaVitini.view.detallesDelProtocolo.renderizaProtocolo()
            }
        },
        eliminarElementosDelInventarioDelAlojamiento: {
            ui: function (data) {
                const nombre = data.nombre
                const uid = data.uid

                const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

                const titulo = constructor.querySelector("[componente=titulo]")
                titulo.textContent = `Confirmar eliminar ${nombre}`
                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                mensaje.textContent = `Var a eliminar ${nombre} y su aplicacion sera inmediata, ¿Estas de acuerdo?`

                const botonAceptar = constructor.querySelector("[boton=aceptar]")
                botonAceptar.textContent = "Comfirmar la eliminación"
                botonAceptar.addEventListener("click", () => {
                    return this.confirmar({
                        uid,
                        nombre
                    })
                })
                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                botonCancelar.textContent = "Cancelar la eliminación"

                document.querySelector("main").appendChild(pantallaInmersiva)

            },
            confirmar: async function (data) {
                const uid = data.uid
                const nombre = data.nombre

                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = `Eliminado el ${nombre}...`
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/protocolos/alojamiento/gestion_de_protocolos/inventario/eliminarElementoInventarioDelProtocolo",
                    uid
                })

                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }
                instanciaRenderizada.remove()
                if (respuestaServidor?.error) {
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    const elementoEliminado = respuestaServidor.elementoEliminado

                    const apartamentoIDV = elementoEliminado.apartamentoIDV
                    casaVitini.view.detallesDelProtocolo.renderizaProtocolo()
                }
            }
        },
        renderizaProtocolo: async function (data) {

            const granuladorURL = casaVitini.utilidades.granuladorURL()
            const parametros = granuladorURL.parametros
            const apartamentoIDV = parametros.alojamiento
            const posicionScroll = window.scrollY || document.documentElement.scrollTop;

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/protocolos/alojamiento/gestion_de_protocolos/obtenerProtocoloDelAlojamiento",
                apartamentoIDV
            })
            if (respuestaServidor.error) {
                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.error)
            }

            if (respuestaServidor.ok) {

                const main = document.querySelector("main")
                const uiSelector = main.querySelector("[ui=detallesDelProtocolo]")
                const contenedorInventario = uiSelector.querySelector("[contenedor=inventarioDelAlojamiento]")
                const contenedorTareas = uiSelector.querySelector("[contenedor=tareasDelAlojamiento]")

                const inventarioDelProtocolo = respuestaServidor.inventarioDelProtocolo
                const tareasDelProtocolo = respuestaServidor.tareasDelProtocolo

                const inventarioUID_grupo = inventarioDelProtocolo.map(i => i.uid)
                const preInventarioRenderizado = contenedorInventario.querySelectorAll("[uid]")
                preInventarioRenderizado.forEach(pIR => {
                    const elementoUID_renderizado = pIR.getAttribute(`uid`)
                    if (!inventarioUID_grupo.includes(elementoUID_renderizado)) {
                        pIR?.remove()
                    }
                })
                const numeroTotalProtocolo = inventarioDelProtocolo.length
                contenedorInventario.querySelector("[info=infoSinInventario]")?.remove()



                // Comprueba si hay más de 6 elementos y elimina los sobrantes
                while (contenedorInventario.children.length > numeroTotalProtocolo) {
                    contenedorInventario.removeChild(contenedorInventario.lastChild);
                }
                if (numeroTotalProtocolo === 0) {
                    const iSI = this.infoSinInventario()
                    contenedorInventario.appendChild(iSI)
                }

                while (contenedorInventario.querySelectorAll("[uid]").length < numeroTotalProtocolo) {
                    const voidUI = document.createElement("div")
                    voidUI.setAttribute("uid", "void")
                    contenedorInventario.appendChild(voidUI)
                }
                inventarioDelProtocolo.forEach(iDP => {
                    const elementoUID = iDP.elementoUID
                    const uid = iDP.uid
                    const nombre = iDP.nombre
                    const cantidad_enAlojamiento = iDP.cantidad_enAlojamiento
                    const posicion = iDP.posicion
                    const totalPosiciones = iDP.totalPosiciones
                    const posicionUID = Number(posicion - 1)

                    const inventarioUID = this.insertartInventario.inventarioUI({
                        elementoUID,
                        uid,
                        nombre,
                        cantidad_enAlojamiento,
                        posicion,
                        totalPosiciones

                    })
                    contenedorInventario.replaceChild(inventarioUID, contenedorInventario.children[posicionUID]);
                })

                // Tareas
                const tareasUID_grupo = tareasDelProtocolo.map(i => i.uid)
                const preTareasRenderizado = contenedorTareas.querySelectorAll("[uid]")
                preTareasRenderizado.forEach(pTR => {
                    const uid = pTR.getAttribute(`uid`)
                    if (!inventarioUID_grupo.includes(uid)) {
                        pTR?.remove()
                    }
                })

                const numeroTotaltareasDelProtocolo = tareasDelProtocolo.length
                contenedorTareas.querySelector("[info=infoSinTareas]")?.remove()


                // Comprueba si hay más de 6 elementos y elimina los sobrantes
                while (contenedorTareas.children.length > numeroTotaltareasDelProtocolo) {
                    contenedorTareas.removeChild(contenedorTareas.lastChild);
                }
                if (numeroTotaltareasDelProtocolo === 0) {
                    const iST = this.infoSinTareas()
                    contenedorTareas.appendChild(iST)

                }

                while (contenedorTareas.querySelectorAll("[uid]").length < numeroTotaltareasDelProtocolo) {
                    const voidUI = document.createElement("div")
                    voidUI.setAttribute("uid", "void")
                    contenedorTareas.appendChild(voidUI)
                }

                tareasDelProtocolo.forEach(tDP => {
                    const uid = tDP.uid
                    const tareaUI = tDP.tareaUI
                    const tipoDiasIDV = tDP.tipoDiasIDV
                    const posicion = tDP.posicion
                    const totalPosiciones = tDP.totalPosiciones
                    const posicionUID = Number(posicion - 1)


                    const inventarioUID = this.tareaUI({
                        uid,
                        tareaUI,
                        tipoDiasIDV,
                        posicion,
                        totalPosiciones

                    })
                    contenedorTareas.replaceChild(inventarioUID, contenedorTareas.children[posicionUID]);
                })

            }
            window.scrollTo({
                top: posicionScroll
            });
        },
        insertarTarea: {
            ui: function (data) {
                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada({
                    alineacion: "arriba"
                })
                const contenedor = ui.querySelector("[componente=contenedor]")


                const botonCerrar = document.createElement("div")
                botonCerrar.classList.add("botonV1BlancoIzquierda")
                botonCerrar.textContent = "Cerrar y volver"
                botonCerrar.addEventListener("click", () => {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                })
                contenedor.appendChild(botonCerrar)

                const titulo = document.createElement("p")
                titulo.classList.add("colorGrisV1", "negrita", "padding10")
                titulo.setAttribute("data", "titulo")
                titulo.textContent = "Crear nueva tarea"
                contenedor.appendChild(titulo)


                const nombreTarea = document.createElement("input")
                nombreTarea.setAttribute("campo", "tareaUI")
                nombreTarea.placeholder = "Escribe un nombre para la nueva tarea"
                contenedor.appendChild(nombreTarea)

                const info = document.createElement("p")
                info.classList.add("padding10")
                info.textContent = "Elige el momento en que esta tarea será visible. Puedes optar porque se muestre siempre o únicamente en días específicos en los que se lleve a cabo el protocolo de preparación del alojamiento. Por ejemplo, si seleccionas 'Mostrar en el día de entrada', la tarea aparecerá solo cuando, al realizar el protocolo de preparación, coincida con una entrada programada para ese mismo día."
                contenedor.appendChild(info)


                const contenedorTipoTarea = document.createElement("div")
                contenedorTipoTarea.classList.add("flexVertical", "gap6", "padding6", "borderRadius22", "borderGrey1")
                contenedorTipoTarea.setAttribute("contenedor", "tipoTarea")
                contenedor.appendChild(contenedorTipoTarea)

                const constructorOpcion = (data) => {
                    const titulo = data.titulo
                    const opcionIDV = data.opcionIDV

                    const ui = document.createElement("div")
                    ui.classList.add("gridHorizontal2C_minContent_auto", "gap10", "comportamientoBoton", "borderRadius16", "padding6")
                    ui.setAttribute("opcionIDV", opcionIDV)
                    ui.addEventListener("click", (e) => {
                        this.controladorSelectorOpciones(e)
                    })

                    const contenedorIcono = document.createElement("div")
                    contenedorIcono.classList.add("flexVertical")
                    ui.appendChild(contenedorIcono)

                    const icono = document.createElement("div")
                    icono.classList.add("esferaSeleccionable")
                    contenedorIcono.appendChild(icono)

                    const indicador = document.createElement("div")
                    indicador.classList.add("indicadorDeSeleccion")
                    indicador.setAttribute("com", "indicador")
                    icono.appendChild(indicador)

                    const tUI = document.createElement("div")
                    tUI.classList.add("flexVertical", "flextJustificacion_center")
                    tUI.textContent = titulo
                    ui.appendChild(tUI)
                    return ui
                }

                contenedorTipoTarea.appendChild(constructorOpcion({
                    titulo: "Mostrar siempre",
                    opcionIDV: "siempre"
                }))


                contenedorTipoTarea.appendChild(constructorOpcion({
                    titulo: "Mostrar en el dia de entrada",
                    opcionIDV: "diaEntrada"
                }))

                contenedorTipoTarea.appendChild(constructorOpcion({
                    titulo: "Mostrar en el dia de salida",
                    opcionIDV: "diaSalida"
                }))

                contenedorTipoTarea.appendChild(constructorOpcion({
                    titulo: "Mostrar en el dia sin reserva",
                    opcionIDV: "diaSinReserva"
                }))

                contenedorTipoTarea.appendChild(constructorOpcion({
                    titulo: "Mostrar en el dia durante la reserva",
                    opcionIDV: "diaDuranteReserva"
                }))


                const botonDinamico = document.createElement("div")
                botonDinamico.classList.add("botonV1BlancoIzquierda")
                botonDinamico.setAttribute("boton", "dinamico")
                contenedor.appendChild(botonDinamico)

                return ui

            },
            confirmar: async function (data) {
                const apartamentoIDV = data?.apartamentoIDV
                const area = data?.area

                const tarea = casaVitini.view.detallesDelProtocolo.objetoTarea({
                    area
                })


                const main = document.querySelector("main")
                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                const contenedor = ui.querySelector("[componente=contenedor]")
                main.appendChild(ui)

                const spinner = casaVitini.ui.componentes.spinnerSimple()
                contenedor.appendChild(spinner)

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/protocolos/alojamiento/gestion_de_protocolos/tareas/insertarTareaEnProtocolo",
                    apartamentoIDV,
                    ...tarea
                })
                spinner?.remove()
                if (respuestaServidor.error) {

                    const titulo = document.createElement("p")
                    titulo.classList.add("padding10", "textoCentrado")
                    titulo.textContent = respuestaServidor.error
                    contenedor.appendChild(titulo)

                    const botonCerrar = document.createElement("div")
                    botonCerrar.classList.add("botonV1BlancoIzquierda")
                    botonCerrar.textContent = "Cerrar y volver"
                    botonCerrar.addEventListener("click", () => {
                        ui?.remove()
                    })
                    contenedor.appendChild(botonCerrar)



                }
                if (respuestaServidor.ok) {
                    ui?.remove()
                    casaVitini.view.detallesDelProtocolo.renderizaProtocolo()
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                }

            },
            controladorSelectorOpciones: function (e) {

                const opcionUI = e.target
                const area = opcionUI.closest("[contenedor=tipoTarea]")

                const opcionIDV = opcionUI.closest("[opcionIDV]").getAttribute("opcionIDV")
                const estado = opcionUI.closest("[opcionIDV]")?.getAttribute("estado")


                const todasLasOpciones = area.querySelectorAll("[opcionIDV]")
                const controlOpcion = (data) => {
                    const area = data.area
                    const opcionIDV = data.opcionIDV
                    const estado = data.estado

                    const sel = area.querySelector(`[opcionIDV="${opcionIDV}"]`)
                    const indicador = sel.querySelector("[com=indicador]")

                    if (estado === "activar") {
                        indicador.style.background = "green"
                        sel.setAttribute("estado", "activado")
                    } else if (estado === "desactivar") {
                        indicador.removeAttribute("style")
                        sel.removeAttribute("estado")
                    } else if (estado === "activarGris") {
                        indicador.style.background = "grey"
                        sel.setAttribute("estado", "activado")
                    }
                }

                if (opcionIDV === "siempre") {

                    if (estado === "activado") {
                        todasLasOpciones.forEach(o => {
                            const oIDV = o.getAttribute("opcionIDV")
                            controlOpcion({
                                opcionIDV: oIDV,
                                area,
                                estado: "desactivar"

                            })
                        })
                    } else {
                        todasLasOpciones.forEach(o => {
                            const oIDV = o.getAttribute("opcionIDV")
                            controlOpcion({
                                opcionIDV: oIDV,
                                area,
                                estado: "activar"

                            })
                        })
                    }



                } else {


                    controlOpcion({
                        opcionIDV: "siempre",
                        area,
                        estado: "desactivar"

                    })

                    if (estado === "activado") {
                        controlOpcion({
                            opcionIDV: opcionIDV,
                            area,
                            estado: "desactivar"

                        })
                    } else {
                        controlOpcion({
                            opcionIDV: opcionIDV,
                            area,
                            estado: "activar"

                        })
                    }

                    const siempre = area.querySelectorAll("[opcionIDV]:not([estado])")
                    if (siempre.length === 1) {
                        const sel = siempre[0].getAttribute("opcionIDV") === "siempre"
                        if (sel) {
                            controlOpcion({
                                opcionIDV: "siempre",
                                area,
                                estado: "activar"

                            })
                        }
                    }
                }
            },

        },
        objetoTarea: function (data) {
            const area = data.area

            const tareaUI = area.querySelector("[campo=tareaUI]").value
            const tiposDias = area.querySelector("[contenedor=tipoTarea]").querySelectorAll("[opcionIDV][estado=activado]")
            const tipoDiasIDV = []
            tiposDias.forEach(tP => {
                const opcionIDV = tP.getAttribute("opcionIDV")
                tipoDiasIDV.push(opcionIDV)
            })

            const o = {
                tareaUI,
                tipoDiasIDV,
            }
            return o
        },
        tareaUI: function (data) {
            const uid = data.uid
            const tareaUI = data.tareaUI
            const posicion = Number(data.posicion)
            const totalPosiciones = Number(data.totalPosiciones)
            const tipoDiasIDV = data.tipoDiasIDV

            const ui = document.createElement("div")
            ui.classList.add("flexVertical", "padding6", "backgroundGrey1", "borderRadius20", "gap6", "comportamientoBoton", "sobreControlAnimacionGlobal")
            ui.setAttribute("uid", uid)

            const contenedorData = document.createElement("div")
            contenedorData.classList.add("flexVertical", "gap6", "padding16")
            ui.appendChild(contenedorData)

            const nombreUI = document.createElement("p")
            nombreUI.classList.add("negrita")
            nombreUI.textContent = tareaUI
            contenedorData.appendChild(nombreUI)


            const infoTipoDia = document.createElement("p")
            infoTipoDia.classList.add()
            infoTipoDia.textContent = "Esta tarea se mostrara:"
            contenedorData.appendChild(infoTipoDia)

            const dict = {
                siempre: "Siempre",
                diaEntrada: "En los días de entrada",
                diaSalida: "En los días de salida",
                diaSinReserva: "En los dias donde no halla reserva",
                diaDuranteReserva: "En los dias durante la reserva"
            }

            tipoDiasIDV.forEach(tD => {
                const tipoDiaUI = document.createElement("p")
                tipoDiaUI.classList.add("negrita")
                tipoDiaUI.setAttribute("tipoDiaIDV", tD)
                tipoDiaUI.textContent = dict[tD]
                contenedorData.appendChild(tipoDiaUI)
            })


            const selectorPos = document.createElement("select")
            selectorPos.setAttribute("selector", "posicion")
            selectorPos.addEventListener("click", (e) => {
                const nuevaPosicion = e.target.value

                casaVitini.view.detallesDelProtocolo.actualizarPosiconTarea({
                    uid,
                    posicion: nuevaPosicion,
                    tareaUI
                })

            })
            ui.appendChild(selectorPos)

            for (let index = 0; index < totalPosiciones; index++) {
                const posicionActual = index + 1

                const o = document.createElement("option")
                if (posicionActual === posicion) {
                    o.selected = true
                    o.disabled = true
                    o.textContent = "Posición: " + posicionActual
                    o.value = ""
                } else {
                    o.value = index + 1
                    o.textContent = "Mover a posición: " + posicionActual
                }
                selectorPos.appendChild(o)

            }

            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add("flexHorizontal", "flexAlineacionI", "gap6")
            ui.appendChild(contenedorBotones)

            const botonAcualizarNombre = document.createElement("div")
            botonAcualizarNombre.classList.add("botonV1BlancoIzquierda")
            botonAcualizarNombre.setAttribute("boton", "actualizarCantidad")
            botonAcualizarNombre.textContent = "Actualizar tarea"
            botonAcualizarNombre.addEventListener("click", () => {
                const main = document.querySelector("main")
                const tareaUI_r = this.insertarTarea.ui()
                main.appendChild(tareaUI_r)

                const titulo = tareaUI_r.querySelector("[data=titulo]")
                titulo.textContent = "Actualizar tarea"
                const area = tareaUI_r.querySelector("[componente=contenedor]")
                if (tipoDiasIDV.includes("siempre")) {

                    const sS = area.querySelectorAll(`[opcionIDV]`)
                    sS.forEach(tD => {
                        const indicador = tD.querySelector("[com=indicador]")
                        indicador.style.background = "green"
                        tD.setAttribute("estado", "activado")


                    })
                } else {
                    tipoDiasIDV.forEach(tD => {
                        const s = area.querySelector(`[opcionIDV="${tD}"]`)
                        const indicador = s.querySelector("[com=indicador]")
                        indicador.style.background = "green"
                        s.setAttribute("estado", "activado")


                    })
                }


                const campoTareaUI = tareaUI_r.querySelector("[campo=tareaUI]")
                campoTareaUI.value = tareaUI

                const botonDinamico = tareaUI_r.querySelector("[boton=dinamico]")
                botonDinamico.textContent = "Actualizar tarea"
                botonDinamico.addEventListener("click", (e) => {
                    this.actualizarTareaProtocolo({
                        uid,
                        area: area
                    })
                })

            })
            contenedorBotones.appendChild(botonAcualizarNombre)


            const botonEliminar = document.createElement("div")
            botonEliminar.classList.add("botonV1BlancoIzquierda")
            botonEliminar.textContent = "Eliminar"
            botonEliminar.addEventListener("click", () => {
                this.eliminarTareaDelProtocolo.ui({
                    uid,
                    tareaUI
                })
            })

            contenedorBotones.appendChild(botonEliminar)


            return ui

        },
        actualizarTareaProtocolo: async function (data) {
            const uid = data?.uid
            const area = data?.area

            const tarea = this.objetoTarea({
                area
            })
            const main = document.querySelector("main")
            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
            const contenedor = ui.querySelector("[componente=contenedor]")
            main.appendChild(ui)

            const spinner = casaVitini.ui.componentes.spinnerSimple()
            contenedor.appendChild(spinner)

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/protocolos/alojamiento/gestion_de_protocolos/tareas/actualizarTareaEnProtocolo",
                uid,
                ...tarea
            })
            spinner?.remove()
            if (respuestaServidor.error) {

                const titulo = document.createElement("p")
                titulo.classList.add("padding10", "textoCentrado")
                titulo.textContent = respuestaServidor.error
                contenedor.appendChild(titulo)

                const botonCerrar = document.createElement("div")
                botonCerrar.classList.add("botonV1BlancoIzquierda")
                botonCerrar.textContent = "Cerrar y volver"
                botonCerrar.addEventListener("click", () => {
                    ui?.remove()
                })
                contenedor.appendChild(botonCerrar)
            }
            if (respuestaServidor.ok) {
                ui?.remove()
                casaVitini.view.detallesDelProtocolo.renderizaProtocolo()
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
            }

        },
        eliminarTareaDelProtocolo: {
            ui: function (data) {
                const tareaUI = data.tareaUI
                const uid = data.uid

                const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

                const titulo = constructor.querySelector("[componente=titulo]")
                titulo.textContent = `Confirmar eliminar ${tareaUI}`
                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                mensaje.textContent = `Var a eliminar ${tareaUI} y su aplicacion sera inmediata, ¿Estas de acuerdo?`

                const botonAceptar = constructor.querySelector("[boton=aceptar]")
                botonAceptar.textContent = "Comfirmar la eliminación"
                botonAceptar.addEventListener("click", () => {
                    return this.confirmar({
                        uid,
                        tareaUI
                    })
                })
                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                botonCancelar.textContent = "Cancelar la eliminación"
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
                    zona: "administracion/protocolos/alojamiento/gestion_de_protocolos/tareas/eliminarTareaDelProtocolo",
                    uid
                })

                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }
                instanciaRenderizada.remove()
                if (respuestaServidor?.error) {
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    casaVitini.view.detallesDelProtocolo.renderizaProtocolo()
                }
            }
        },
        actualizarPosiconTarea: async function (data) {
            const uid = data.uid
            const posicion = data.posicion
            const tareaUI = data.tareaUI
            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const mensaje = `Actualizando la posicion del ${tareaUI} a ${posicion}...`
            const datosPantallaSuperpuesta = {
                instanciaUID: instanciaUID,
                mensaje: mensaje
            }
            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/protocolos/alojamiento/gestion_de_protocolos/tareas/actualizarPosicionTarea",
                uid,
                posicion
            })

            const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
            if (!instanciaRenderizada) { return }

            instanciaRenderizada.remove()

            if (respuestaServidor?.error) {
                const main = document.querySelector("main")
                const uiSelector = main.querySelector("[ui=detallesDelProtocolo]")
                uiSelector.querySelector(`[uid="${uid}"] [selector=posicion]`).value = ""
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                const elemento = respuestaServidor.elemento
                casaVitini.view.detallesDelProtocolo.renderizaProtocolo()
            }

        },

    }
}
