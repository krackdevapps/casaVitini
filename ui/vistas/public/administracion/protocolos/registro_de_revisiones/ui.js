casaVitini.view = {
    start: function () {
        const granuladorURL = casaVitini.utilidades.granuladorURL()
        const parametros = granuladorURL.parametros

        if (parametros?.revision) {
            const zona = parametros?.zona
            if (!zona) {
                this.detallesRevision.arranque({
                    revisionUID: parametros.revision
                })
            }
        } else {
            this.registroRevisiones.arranque()
        }
    },
    registroRevisiones: {
        arranque: function () {
            const granuladoURL = casaVitini.utilidades.granuladorURL()
            const parametroBuscar = granuladoURL.parametros.buscar
            const main = document.querySelector("main")

            const marcoElasticoRelativo = document.createElement("div")
            marcoElasticoRelativo.classList.add("marcoElasticoRelativo")
            main.appendChild(marcoElasticoRelativo)

            const revisionesUI = document.createElement("div")
            revisionesUI.setAttribute("ui", "registroRevisiones")
            revisionesUI.classList.add("flexVertical", "gap10")
            marcoElasticoRelativo.appendChild(revisionesUI)

            const campoBuscador = document.createElement("input")
            campoBuscador.setAttribute("campo", "buscador")
            campoBuscador.placeholder = "Escribe para buscar en revisiones"
            campoBuscador.setAttribute("componente", "zonaNavegacionPaginadaRevisiones")
            campoBuscador.addEventListener("input", (e) => { casaVitini.view.registroRevisiones.buscadorPorCampo(e) })
            campoBuscador.value = decodeURI(parametroBuscar)
            revisionesUI.appendChild(campoBuscador)

            const contenedorLista = document.createElement("div")
            contenedorLista.setAttribute("contenedor", "lista")
            revisionesUI.appendChild(contenedorLista)


            const parametrosFormatoURL = granuladoURL.parametros
            const parametrosFormatoIDV = {}
            Object.entries(parametrosFormatoURL).forEach(([nombreParametroURL, valorParametroURL]) => {
                const nombreParametroIDV = casaVitini.utilidades.cadenas.snakeToCamel(nombreParametroURL)
                let nombreColumnaIDV
                if ((valorParametroURL)?.toLowerCase() === "elemento_uid") {
                    nombreColumnaIDV = "elementoUID"
                } else if (valorParametroURL) {
                    nombreColumnaIDV = casaVitini.utilidades.cadenas.snakeToCamel(valorParametroURL)
                } else if ((nombreParametroIDV)?.toLowerCase() === "buscar") {
                    valorParametroURL = decodeURI(valorParametroURL)
                }
                parametrosFormatoIDV[nombreParametroIDV] = nombreColumnaIDV
            })

            if (!parametrosFormatoIDV?.buscar || parametrosFormatoIDV.buscar.length === 0) {
                parametrosFormatoIDV.buscar = ""
            } else {
                parametrosFormatoIDV.buscar = decodeURI(parametrosFormatoIDV.buscar)
            }
            parametrosFormatoIDV.origen = "url"
            this.mostrarElementosResueltos(parametrosFormatoIDV)
        },
        mostrarElementosResueltos: async function (transaccion) {



            const main = document.querySelector("main")

            const selectorInventarioUI = main.querySelector("[ui=registroRevisiones]")
            selectorInventarioUI.classList.remove("ocultoInicial")

            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const selectorEspacio = selectorInventarioUI.querySelector("[contenedor=lista]")
            if (!selectorEspacio) { return }

            selectorEspacio.setAttribute("instanciaBusqueda", instanciaUID)

            delete transaccion.instanciaUID
            const origen = transaccion.origen
            delete transaccion.origen
            const granuladoURL = casaVitini.utilidades.granuladorURL()
            const paginaTipo = transaccion.paginaTipo

            const busquedaInicial = transaccion?.buscar //|| almacen?.buscar
            const campoBusqueda = selectorInventarioUI.querySelector("[campo=buscador]")

            // if (!busquedaInicial) {
            //     document.querySelector("[componente=estadoBusqueda]")?.remove()
            //     document.querySelector("[areaGrid=gridClientes]")?.remove()
            //     campoBusqueda.value = null
            //     return
            // }
            let nombreColumnaURL
            const nombreColumna = transaccion.nombreColumna
            if ((nombreColumna)?.toLowerCase() === "elementouid") {
                nombreColumnaURL = "elemento_uid"
            } else if (nombreColumna) {
                nombreColumnaURL = casaVitini.utilidades.cadenas.camelToSnake(nombreColumna)
            }

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/protocolos/alojamiento/registro_de_revisiones/buscadorRegistroRevisiones",
                buscar: busquedaInicial,
                nombreColumna: transaccion.nombreColumna,
                sentidoColumna: transaccion.sentidoColumna,
                pagina: Number(transaccion?.pagina || 1)
            })

            const instanciaRenderizada = selectorInventarioUI.querySelector(`[instanciaBusqueda="${instanciaUID}"]`)
            if (!instanciaRenderizada) { return }
            if (respuestaServidor?.error) {
                this.constructorMarcoInfo()
                selectorInventarioUI.querySelector("[componente=estadoBusqueda]").textContent = respuestaServidor?.error
                return
            }
            if (respuestaServidor.totalElementos === 0) {
                this.constructorMarcoInfo()
                selectorInventarioUI.querySelector("[componente=estadoBusqueda]").textContent = "No se han encontrado elementos en el registro de revisiones"
                return
            }
            selectorInventarioUI.querySelector("[componente=estadoBusqueda]")?.remove()
            const elementos = respuestaServidor.elementos
            const buscar = respuestaServidor?.buscar || ""
            const paginasTotales = respuestaServidor.paginasTotales
            const pagina = respuestaServidor.pagina
            const sentidoColumna = respuestaServidor.sentidoColumna
            campoBusqueda.value = buscar

            elementos.forEach(e => {
                const estadoRevision = e.estadoRevision
                if (estadoRevision === "enCurso") {
                    e.estadoRevision = "En curso"
                } else if (estadoRevision === "finalizada") {
                    e.estadoRevision = "Finalizada"
                }

            })

            const columnasGrid = [
                {
                    columnaUI: "Revision",
                    columnaIDV: "uid",
                },
                {
                    columnaUI: "Fecha inicio",
                    columnaIDV: "fechaInicio",
                },
                {
                    columnaUI: "Fecha fin",
                    columnaIDV: "fechaFin",
                },
                {
                    columnaUI: "Usuario",
                    columnaIDV: "usuario",
                },
                {
                    columnaUI: "Estado",
                    columnaIDV: "estadoRevision",
                }
            ]
            const parametrosFinales = {
                buscar: buscar
            }

            if (nombreColumna) {
                parametrosFinales.nombre_columna = nombreColumnaURL;
                parametrosFinales.sentido_columna = sentidoColumna
            }
            if (pagina > 1 && paginasTotales > 1) {
                parametrosFinales.pagina = pagina
            }
            const estructuraParametrosFinales = []
            for (const [parametroFinal, valorFinal] of Object.entries(parametrosFinales)) {
                const estructura = `${parametroFinal}:${valorFinal}`
                if (parametroFinal !== "buscar" && valorFinal !== "") {
                    estructuraParametrosFinales.push(estructura)
                }
            }
            let parametrosURLFInal = ""
            if (estructuraParametrosFinales.length > 0) {
                parametrosURLFInal = "/" + estructuraParametrosFinales.join("/")
            }

            const constructorURLFinal = encodeURI(granuladoURL.directoriosFusion + parametrosURLFInal)
            casaVitini.view.__sharedMethods__.grid.despliegue({
                metodoSalida: "view.registroRevisiones.mostrarElementosResueltos",
                configuracionGrid: {
                    filas: elementos,
                    almacen: {
                        buscar: buscar,
                    },
                    sentidoColumna: sentidoColumna,
                    nombreColumna: nombreColumna,
                    pagina: pagina,
                    destino: "[ui=registroRevisiones] [contenedor=lista]",
                    columnasGrid: columnasGrid,
                    gridUID: "gridListaRevisiones",
                    mascaraURL: {
                        mascara: "/administracion/protocolos/registro_de_revisiones/revision:",
                        parametro: "uid"
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

            const titulo = "Casa Vitini"
            const estado = {
                zona: constructorURLFinal,
                EstadoInternoZona: "estado",
                tipoCambio: "parcial",
                componenteExistente: "zonaNavegacionPaginadaRevisiones",
                funcionPersonalizada: "view.registroRevisiones.mostrarElementosResueltos",
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
        buscadorPorCampo: async function (e) {

            const instanciaUID = document.querySelector("main[instanciaUID]").getAttribute("instanciaUID")
            const campo = document.querySelector("[componente=zonaNavegacionPaginadaClientes]")
            const main = document.querySelector("main")

            const selectorInventarioUI = main.querySelector("[ui=registroRevisiones]")
            const terminoBusqueda = e.target.value
            //   document.querySelector("[componente=estadoBusqueda]")?.remove()
            selectorInventarioUI.querySelector("[areaGrid=gridListaRevisiones]")?.remove()
            selectorInventarioUI.querySelector("[componenteID=navegacionPaginacion]")?.remove()
            selectorInventarioUI.querySelector("[contenedor=filtrosOrden]")?.remove()


            const estadoBusqueda_r = selectorInventarioUI.querySelector("[componente=estadoBusqueda]")
            if (!estadoBusqueda_r) {
                this.constructorMarcoInfo()
            }
            const estadoBusqueda_s = selectorInventarioUI.querySelector("[componente=estadoBusqueda]")
            estadoBusqueda_s.textContent = "Buscando elementos en el registro de revisiones..."

            const campoVacio = e.target.value.length
            if (campoVacio === 0) {
                estadoBusqueda_s.textContent = "Mostrando todos los elementos en el registro de revisiones..."
                clearTimeout(casaVitini.componentes.temporizador);
                const granuladoURL = casaVitini.utilidades.granuladorURL()
                selectorInventarioUI.querySelector("[areaGrid=gridListaRevisiones]")?.remove()
                const titulo = "casavitini"
                const estado = casaVitini.view.verTodoInventario.navegacion.estadoInicial
                const url = "/administracion/inventario/ver_todo_el_inventario"
                if (url !== granuladoURL.raw.toLocaleLowerCase()) {
                    window.history.pushState(estado, titulo, "/administracion/inventario/ver_todo_el_inventario");
                }

            }
            clearTimeout(casaVitini.componentes.temporizador);
            casaVitini.componentes.temporizador = setTimeout(async () => {
                const transaccion = {
                    zona: "administracion/protocolos/alojamiento/registro_de_revisiones/buscadorRegistroRevisiones",
                    pagina: 1,
                    buscar: terminoBusqueda,
                    origen: "botonMostrarClientes",
                    tipoConstruccionGrid: "total",
                    instanciaUID: instanciaUID
                }


                this.mostrarElementosResueltos(transaccion)
            }, 1500);
        },
        navegacion: {
            estadoInicial: {
                zona: "administracion/protocolos/registro_de_revisiones",
                EstadoInternoZona: "estado",
                tipoCambio: "parcial",
                componenteExistente: "zonaNavegacionPaginadaRevisiones",
                funcionPersonalizada: "view.registroRevisiones.mostrarElementosResueltos",
                args: {}
            }
        },
        constructorMarcoInfo: function () {
            const main = document.querySelector("main")

            const selectorInventarioUI = main.querySelector("[ui=registroRevisiones]")
            const campo = selectorInventarioUI.querySelector("[componente=zonaNavegacionPaginadaRevisiones]")

            const estadoBusquedaUI = document.createElement("div")
            estadoBusquedaUI.classList.add("botonV1BlancoIzquierda_noSeleccionable", "textoCentrado")
            estadoBusquedaUI.setAttribute("componente", "estadoBusqueda")
            estadoBusquedaUI.textContent = "Buscando..."
            const comRenderizado = selectorInventarioUI.querySelector("[componente=estadoBusqueda]")
            if (!comRenderizado) {
                campo.parentNode.insertBefore(estadoBusquedaUI, campo.nextSibling);
            }

        },

    },
    detallesRevision: {
        arranque: async function (data) {
            const revisionUID = data.revisionUID


            const main = document.querySelector("main")
            main.classList.add("flextJustificacion_center")


            const spinner = casaVitini.ui.componentes.spinnerSimple()
            main.appendChild(spinner)

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/protocolos/alojamiento/registro_de_revisiones/obtenerDetallesRevision",
                revisionUID
            })
            main.classList.remove("flextJustificacion_center")
            spinner.remove()


            if (respuestaServidor.error) {
                const ui = document.createElement("p")
                ui.classList.add("padding10", "textoCentrado", "negrita")
                ui.textContent = respuestaServidor.error
                main.appendChild(ui)
            }
            if (respuestaServidor.ok) {
                console.log("r", respuestaServidor)

                const revision = respuestaServidor.revision

                const uid = revision.uid
                const fechaInicio = revision.fechaInicio
                const fechaFin = revision.fechaFin
                const usuario = revision.usuario
                const revisionInventario = revision?.revisionInventario || []
                const reposicionInventario = revision?.reposicionInventario || []
                const tareas = revision?.tareas || []

                const estadoRevision = revision.estadoRevision
                const apartamentoIDV = revision.apartamentoIDV
                const apartamentoUI = revision.apartamentoUI

                const mE = document.createElement("div")
                mE.classList.add("marcoElasticoRelativo")
                main.appendChild(mE)


                const aUI = document.createElement("p")
                aUI.classList.add("padding10", "fontSize20", "negrita")
                aUI.textContent = apartamentoUI + `(${apartamentoIDV})`
                mE.appendChild(aUI)



                const botonVolver = document.createElement("a")
                botonVolver.classList.add("botonV1BlancoIzquierda")
                botonVolver.textContent = "Volver a la lista de revisiones"
                botonVolver.href = "/administracion/protocolos/registro_de_revisiones"

                botonVolver.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                mE.appendChild(botonVolver)

                const dict = {
                    estadoRevision: {
                        finalizada: "Finalizada",
                        enCurso: "En curso"
                    },
                    color: {
                        verde: "Verde",
                        rojo: "Rojo"
                    }
                }

                const globalData = document.createElement("div")
                globalData.classList.add("flexVertical", "padding12", "gap6")
                mE.appendChild(globalData)

                const bloqueTV = (data) => {

                    const titulo = data.titulo
                    const valor = data.valor

                    const c = document.createElement("div")
                    c.classList.add("flexVertical")

                    const t = document.createElement("p")
                    t.classList.add("negrita")
                    t.textContent = titulo
                    c.appendChild(t)

                    const v = document.createElement("p")
                    v.textContent = valor
                    c.appendChild(v)
                    return c
                }
                globalData.appendChild(bloqueTV({
                    titulo: "Identificador de la revisión",
                    valor: uid
                }))

                globalData.appendChild(bloqueTV({
                    titulo: "Fecha de inicio de la revisión",
                    valor: fechaInicio
                }))
                if (fechaFin) {
                    globalData.appendChild(bloqueTV({
                        titulo: "Fecha de fin de la revisión",
                        valor: fechaFin
                    }))
                }


                globalData.appendChild(bloqueTV({
                    titulo: "Usuario",
                    valor: usuario
                }))

                globalData.appendChild(bloqueTV({
                    titulo: "Estado de la revisión",
                    valor: dict.estadoRevision[estadoRevision]
                }))



                const cRevisiones = document.createElement("details")
                cRevisiones.classList.add("flexVertical", "padding6", "borderGrey1", "borderRadius16")
                mE.appendChild(cRevisiones)

                const tR = document.createElement("summary")
                tR.classList.add("negrita", "padding10")
                tR.textContent = "Revision del inventario del alojamiento"
                cRevisiones.appendChild(tR)

                const cIR = document.createElement("div")
                cIR.classList.add("flexVertical", "paddingLateral20", "paddinVertical6", "gap6")
                cRevisiones.appendChild(cIR)

                if (revisionInventario.length === 0) {
                    const info = document.createElement("div")
                    info.classList.add("negrita", "padding10")
                    info.textContent = "Esta revisión aun no tiene informacion del inventario de alojamiento realizado"
                    cRevisiones.appendChild(info)

                }

                revisionInventario.forEach(r => {
                    const nombre = r.nombre
                    const color = r.color
                    const cantidadEncontrada = r.cantidadEncontrada

                    const revisionUI = document.createElement("div")
                    revisionUI.classList.add("flexVertical")
                    cIR.appendChild(revisionUI)

                    const nUI = document.createElement("p")
                    nUI.classList.add("negrita")
                    nUI.textContent = nombre

                    revisionUI.appendChild(nUI)
                    const infoColor = document.createElement("p")
                    infoColor.textContent = dict.color[color]
                    revisionUI.appendChild(infoColor)
                    if (color === "rojo") {
                        const cE = document.createElement("p")
                        cE.textContent = `El realizante de la revisión solo encontro ${cantidadEncontrada} en el alojamiento`
                        revisionUI.appendChild(cE)
                    }
                })


                const cReposicion = document.createElement("details")
                cReposicion.classList.add("flexVertical", "padding6", "borderGrey1", "borderRadius16")
                mE.appendChild(cReposicion)

                const tRe = document.createElement("summary")
                tRe.classList.add("negrita", "padding10")
                tRe.textContent = "Revision de la reposicion del alojamiento"
                cReposicion.appendChild(tRe)

                const cIRe = document.createElement("div")
                cIRe.classList.add("flexVertical", "paddingLateral20", "paddinVertical6", "gap6")
                cReposicion.appendChild(cIRe)


                if (reposicionInventario.length === 0) {
                    const info = document.createElement("div")
                    info.classList.add("negrita", "padding10")
                    info.textContent = "Esta revisión aun no tiene informacion de la reposición de alojamiento realizado"
                    cReposicion.appendChild(info)

                }

                reposicionInventario.forEach(r => {
                    const nombre = r.nombre
                    const color = r.color
                    const cantidadEncontrada = r.cantidadEncontrada

                    const revisionUI = document.createElement("div")
                    revisionUI.classList.add("flexVertical")
                    cIRe.appendChild(revisionUI)

                    const nUI = document.createElement("p")
                    nUI.classList.add("negrita")
                    nUI.textContent = nombre

                    revisionUI.appendChild(nUI)
                    const infoColor = document.createElement("p")
                    infoColor.textContent = dict.color[color]
                    revisionUI.appendChild(infoColor)
                    if (color === "rojo") {
                        const cE = document.createElement("p")
                        cE.textContent = `El realizante de la revisión solo encontro ${cantidadEncontrada} en el almacen para la resposición del alojamiento`
                        revisionUI.appendChild(cE)
                    }
                })


                const cTareas = document.createElement("details")
                cTareas.classList.add("flexVertical", "padding6", "borderGrey1", "borderRadius16")
                mE.appendChild(cTareas)

                const tT = document.createElement("summary")
                tT.classList.add("negrita", "padding10")
                tT.textContent = "Revision de las tareas del alojamiento"
                cTareas.appendChild(tT)


                const cIT = document.createElement("div")
                cIT.classList.add("flexVertical", "paddingLateral20", "paddinVertical6", "gap6")
                cTareas.appendChild(cIT)

                if (tareas.length === 0) {
                    const info = document.createElement("div")
                    info.classList.add("negrita", "padding10")
                    info.textContent = "Esta revisión aun no tiene informacion de las tareas realizadas en alojamiento"
                    cTareas.appendChild(info)

                }



                tareas.forEach(t => {
                    console.log("t", t)
                    const tareaUI = t.tareaUI
                    const color = t.color
                    const explicacion = t.explicacion || "El realizante no dejo ninguna nota de por que no se puedo realizar la revisión"

                    const revisionUI = document.createElement("div")
                    revisionUI.classList.add("flexVertical")
                    cIT.appendChild(revisionUI)

                    const nUI = document.createElement("p")
                    nUI.classList.add("negrita")
                    nUI.textContent = tareaUI

                    revisionUI.appendChild(nUI)
                    const infoColor = document.createElement("p")
                    infoColor.textContent = dict.color[color]
                    revisionUI.appendChild(infoColor)
                    if (color === "rojo") {
                        const cE = document.createElement("p")
                        cE.textContent = explicacion
                        revisionUI.appendChild(cE)
                    }
                })


                const botonEliminarRevision = document.createElement("div")
                botonEliminarRevision.classList.add("botonV1BlancoIzquierda")
                botonEliminarRevision.textContent = "Eliminar revision y revertir cambios en el inventario"
                botonEliminarRevision.addEventListener("click", () => {
                    this.eliminarElemento.ui({
                        revisionUID
                    })
                })
                mE.appendChild(botonEliminarRevision)

            }

        },
        eliminarElemento: {
            ui: async function (data) {

                const revisionUID = data.revisionUID
                const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

                const titulo = constructor.querySelector("[componente=titulo]")
                titulo.textContent = `Eliminar la revisión ${revisionUID} irreversiblemente`
                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                mensaje.textContent = `Confirmas eliminar la revisión con identificador universal ${revisionUID}`

                const botonAceptar = constructor.querySelector("[boton=aceptar]")
                botonAceptar.textContent = `Comfirmar y eliminar`
                botonAceptar.addEventListener("click", () => {
                    this.confirmar({
                        revisionUID
                    })
                })
                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                botonCancelar.textContent = "Cancelar y volver"
                document.querySelector("main").appendChild(pantallaInmersiva)
            },
            confirmar: async function (data) {

                const revisionUID = data.revisionUID
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = `Eliminado ${revisionUID}...`
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const transaccion = {
                    zona: "administracion/protocolos/alojamiento/registro_de_revisiones/eliminarRevision",
                    revisionUID
                }

                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }

                if (respuestaServidor?.error) {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    await casaVitini.shell.navegacion.controladorVista({
                        vista: `/administracion/protocolos/registro_de_revisiones`,
                        tipoOrigen: "menuNavegador"
                    })

                }

            },
        },
    }

}