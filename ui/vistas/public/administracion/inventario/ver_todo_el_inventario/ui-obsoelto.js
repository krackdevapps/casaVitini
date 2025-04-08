casaVitini.view = {
    start: function () {

        const granuladorURL = casaVitini.utilidades.granuladorURL()
        const parametros = granuladorURL.parametros
        const elemento = parametros?.elemento
        const zona = parametros?.zona

        if (elemento && !zona) {
            this.elementoDelInventario.portada.arranque({
                elementoUID: elemento
            })
        } else if (parametros?.elemento && parametros?.zona === "editar") {
            this.elementoDelInventario.detallesDelElemento.arranque({
                elementoUID: elemento
            })
        } else if (parametros?.elemento && parametros?.zona === "actualizar_cantidades") {
            this.elementoDelInventario.actualizarCantidad.arranque({
                elementoUID: elemento
            })
        } else if (parametros?.elemento && parametros?.zona === "inventario") {

            this.elementoDelInventario.inventario.arranque({
                elementoUID: elemento
            })
        } else {
            this.verTodoInventario.arranque()
        }
    },
    verTodoInventario: {
        arranque: function () {
            const granuladoURL = casaVitini.utilidades.granuladorURL()
            const parametroBuscar = granuladoURL.parametros.buscar
            const main = document.querySelector("main")

            const marcoElasticoRelativo = casaVitini.view.shared.marcoElasticoRelativo()
            main.appendChild(marcoElasticoRelativo)

            const contenedor = document.createElement("div")
            contenedor.setAttribute("ui", "verTodoElInventario")
            contenedor.classList.add("flexVertical", "gap10", "ocultoInicial")
            main.appendChild(contenedor)

            const titulo = document.createElement("p")
            titulo.classList.add("colorGris", "negrita", "textoCentrado")
            titulo.textContent = "Inventario general"
            contenedor.appendChild(titulo)

            const campoBuscador = document.createElement("input")
            campoBuscador.type = "text"
            campoBuscador.setAttribute("campo", "buscador")
            campoBuscador.setAttribute("componentes", "zonaNavegacionPaginadaElementos")
            campoBuscador.placeholder = "Buscar en todo el inventario"
            campoBuscador.addEventListener("input", (e) => { casaVitini.view.verTodoInventario.buscadorPorCampo(e) })
            campoBuscador.value = decodeURI(parametroBuscar)
            contenedor.appendChild(campoBuscador)

            const lista = document.createElement("div")
            lista.setAttribute("contenedor", "lista")
            contenedor.appendChild(lista)


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


            casaVitini.view.reiniciaUI()

            const main = document.querySelector("main")

            const selectorInventarioUI = main.querySelector("[ui=verTodoElInventario]")
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
                zona: "administracion/inventario/buscador",
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
                selectorInventarioUI.querySelector("[componente=estadoBusqueda]").textContent = "No se han encontrado elementos en el iventario"
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
                const tipoLimite = e.tipoLimite
                if (tipoLimite === "sinLimite") {
                    e.tipoLimite = "Sin limite"
                } else if (tipoLimite === "conLimite") {
                    e.tipoLimite = "Con limite"
                }

            })

            const columnasGrid = [
                // {
                //     columnaUI: "UID",
                //     columnaIDV: "UID",
                // },
                {
                    columnaUI: "Nombre",
                    columnaIDV: "nombre",
                },
                {
                    columnaUI: "Descripcion",
                    columnaIDV: "descripcion",
                },
                {
                    columnaUI: "Cantidad",
                    columnaIDV: "cantidad",
                },
                {
                    columnaUI: "Tipo limite",
                    columnaIDV: "tipoLimite",
                },
                {
                    columnaUI: "Cantidad mínima",
                    columnaIDV: "cantidadMinima",
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
                metodoSalida: "view.verTodoInventario.mostrarElementosResueltos",
                configuracionGrid: {
                    filas: elementos,
                    almacen: {
                        buscar: buscar,
                    },
                    sentidoColumna: sentidoColumna,
                    nombreColumna: nombreColumna,
                    pagina: pagina,
                    destino: "[ui=verTodoElInventario] [contenedor=lista]",
                    columnasGrid: columnasGrid,
                    gridUID: "gridElementosIventario",
                    mascaraURL: {
                        mascara: "/administracion/inventario/ver_todo_el_inventario/elemento:",
                        parametro: "UID"
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
                componenteExistente: "zonaNavegacionPaginadaElementos",
                funcionPersonalizada: "view.verTodoInventario.mostrarElementosResueltos",
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

            const selectorInventarioUI = main.querySelector("[ui=verTodoElInventario]")
            const terminoBusqueda = e.target.value
            //   document.querySelector("[componente=estadoBusqueda]")?.remove()
            selectorInventarioUI.querySelector("[areaGrid=gridElementosIventario]")?.remove()
            selectorInventarioUI.querySelector("[componenteID=navegacionPaginacion]")?.remove()
            selectorInventarioUI.querySelector("[contenedor=filtrosOrden]")?.remove()


            const estadoBusqueda_r = selectorInventarioUI.querySelector("[componente=estadoBusqueda]")
            if (!estadoBusqueda_r) {
                this.constructorMarcoInfo()
            }
            const estadoBusqueda_s = selectorInventarioUI.querySelector("[componente=estadoBusqueda]")
            estadoBusqueda_s.textContent = "Buscando elementos en el iventario..."

            const campoVacio = e.target.value.length
            if (campoVacio === 0) {
                estadoBusqueda_s.textContent = "Mostrando todos los elementos en el iventario..."
                clearTimeout(casaVitini.componentes.temporizador);
                const granuladoURL = casaVitini.utilidades.granuladorURL()
                selectorInventarioUI.querySelector("[areaGrid=gridElementosIventario]")?.remove()
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
                    zona: "administracion/inventario/buscador",
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
                zona: "administracion/inventario/ver_todo_el_inventario",
                EstadoInternoZona: "estado",
                tipoCambio: "parcial",
                componenteExistente: "zonaNavegacionPaginadaElementos",
                funcionPersonalizada: "view.verTodoInventario.mostrarElementosResueltos",
                args: {}
            }
        },
        constructorMarcoInfo: function () {
            const main = document.querySelector("main")

            const selectorInventarioUI = main.querySelector("[ui=verTodoElInventario]")
            const campo = selectorInventarioUI.querySelector("[componente=zonaNavegacionPaginadaElementos]")

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
    elementoDelInventario: {
        portada: {
            arranque: async function (data) {

                const elementoUID = data.elementoUID
                const main = document.querySelector("main")
                main.classList.add("flextJustificacion_center")

                const spinner = casaVitini.ui.componentes.spinnerSimple()
                main.appendChild(spinner)

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/inventario/obtenerDetallesElemento",
                    elementoUID
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
                    const elemento = respuestaServidor.ok
                    const nombre = elemento.nombre
                    const cantidad = elemento.cantidad
                    const tipoLimite = elemento.tipoLimite
                    const cantidadMinima = elemento.cantidadMinima
                    const descripcion = elemento.descripcion

                    const selectorInventarioUI = main.querySelector("[ui=portadaElemento]")
                    selectorInventarioUI.classList.remove("ocultoInicial")

                    const marcoElasticoRelativo = casaVitini.view.shared.marcoElasticoRelativo()
                    main.appendChild(marcoElasticoRelativo)

                    const contenedor = document.createElement("div")
                    contenedor.setAttribute("ui", "portadaElemento")
                    contenedor.classList.add("flexVertical", "ocultoInicial", "gap6")
                    marcoElasticoRelativo.appendChild(contenedor)

                    const titulo = document.createElement("p")
                    titulo.setAttribute("data", "nombre")
                    titulo.classList.add("negrita", "fontSize20", "paddingLateral16")
                    titulo.textContent = "Nombre del elemento"
                    contenedor.appendChild(titulo)

                    const dUI = document.createElement("datalist")
                    dUI.setAttribute("contenedor", "descripion")
                    dUI.classList.add("padding", "ocultoInicial")
                    contenedor.appendChild(dUI)

                    const sUI = document.createElement("summary")
                    sUI.classList.add("padding")
                    sUI.textContent = "Descripción del elemento"
                    dUI.appendChild(sUI)

                    const descUI = document.createElement("pre")
                    descUI.setAttribute("data", "descripcion")
                    descUI.classList.add("padding6")




                    selectorInventarioUI.querySelector("[contenedor=tipoLimite]").classList.add("ocultoInicial")
                    const urlBase = `/administracion/inventario/ver_todo_el_inventario/elemento:${elementoUID}/`
                    const botonesURL = selectorInventarioUI.querySelectorAll("[href]")
                    botonesURL.forEach(b => {
                        const url = b.getAttribute("zona")
                        b.setAttribute("href", urlBase + "zona:" + url)

                        b.addEventListener("click", (boton) => {
                            boton.preventDefault()
                            const vista = boton.target.getAttribute("href")
                            const navegacion = {
                                vista: vista,
                                tipoOrigen: "menuNavegador"
                            }
                            casaVitini.shell.navegacion.controladorVista(navegacion)
                        })
                    })

                    const botonEliminar = selectorInventarioUI.querySelector("[accion=eliminar]")
                    botonEliminar.addEventListener("click", () => {
                        casaVitini.view.elementoDelinventario.eliminarElemento.ui({
                            elementoUID,
                            nombre
                        })
                    })


                    selectorInventarioUI.querySelector("[data=nombre]").textContent = nombre
                    selectorInventarioUI.querySelector("[data=cantidad]").textContent = cantidad

                    if (!descripcion || descripcion.length > 0) {
                        selectorInventarioUI.querySelector("[contenedor=descripcion]").classList.remove("ocultoInicial")
                        selectorInventarioUI.querySelector("[data=descripcion]").textContent = descripcion

                    }

                    const tipoLimiteSelector = selectorInventarioUI.querySelector("[data=tipoLimite]")

                    if (tipoLimite === "sinLimite") {
                        tipoLimiteSelector.textContent = "Este elemento del inventario no tiene un limite mínimo configurado"
                    } else if (tipoLimite === "conLimite") {
                        selectorInventarioUI.querySelector("[contenedor=tipoLimite]").classList.remove("ocultoInicial")

                        tipoLimiteSelector.textContent = `Se notificara si en el inventario hay menos de ${cantidadMinima}`
                    }
                }
            }
        },
        detallesDelElemento: {
            arranque: async function (data) {
                const elementoUID = data.elementoUID

                const main = document.querySelector("main")
                main.classList.add("flextJustificacion_center")

                const spinner = casaVitini.ui.componentes.spinnerSimple()
                main.appendChild(spinner)

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/inventario/obtenerDetallesElemento",
                    elementoUID
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

                    const elemento = respuestaServidor.ok
                    const elementoUID = elemento.UID
                    const nombre = elemento.nombre
                    const tipoLimite = elemento.tipoLimite
                    const cantidadMinima = elemento.cantidadMinima
                    const descripcion = elemento.descripcion

                    const selectorInventarioUI = main.querySelector("[ui=editarElemento]")

                    selectorInventarioUI.classList.remove("ocultoInicial")
                    selectorInventarioUI.querySelector("[campo=nombre]").value = nombre
                    selectorInventarioUI.querySelector("[campo=tipoLimite]").value = tipoLimite
                    selectorInventarioUI.querySelector("[campo=descripcion]").value = descripcion


                    if (tipoLimite === "conLimite") {
                        selectorInventarioUI.querySelector("[contenedor=limiteMinimo]").classList.remove("ocultoInicial")
                        selectorInventarioUI.querySelector("[campo=cantidadMinima]").value = cantidadMinima
                    }

                    const campoTipoLimite = main.querySelector("[campo=tipoLimite]")
                    campoTipoLimite.addEventListener("click", (e) => {
                        this.controladorTipoLimte(e)
                    })

                    const botonActualizar = main.querySelector("[boton=actualizar]")
                    botonActualizar.addEventListener("click", () => {
                        this.actualizarElemento({
                            elementoUID
                        })
                    })

                }

            },
            controladorTipoLimte: function (e) {
                const elemento = e.target
                const opcionSel = elemento.value
                const selectorContendorLimiteMinimo = elemento.closest("main").querySelector("[contenedor=limiteMinimo]")

                if (opcionSel === "sinLimite") {
                    selectorContendorLimiteMinimo.classList.add("ocultoInicial")

                } else if (opcionSel === "conLimite") {
                    selectorContendorLimiteMinimo.classList.remove("ocultoInicial")
                }
            },
            actualizarElemento: async function (data) {
                const elementoUID = data.elementoUID

                const main = document.querySelector("main")
                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                const contenedor = ui.querySelector("[componente=contenedor]")
                main.appendChild(ui)

                const spinner = casaVitini.ui.componentes.spinnerSimple()
                contenedor.appendChild(spinner)
                const o = this.crearObjeto()
                o.cantidad = "1"
                o.elementoUID = elementoUID

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/inventario/actualizarElemento",
                    ...o
                })
                main.classList.remove("flextJustificacion_center")

                if (respuestaServidor.error) {
                    contenedor.innerHTML = null
                    const errorUI = casaVitini.ui.componentes.errorUI_respuestaInmersiva({
                        errorUI: respuestaServidor.error
                    })
                    contenedor.appendChild(errorUI)
                }
                if (respuestaServidor.ok) {
                    casaVitini.shell.navegacion.controladorVista({
                        vista: `/administracion/inventario/ver_todo_el_inventario/elemento:${elementoUID}`,
                        tipoOrigen: "menuNavegador"
                    })

                }
            },
            crearObjeto: function () {
                const main = document.querySelector("main [ui=editarElemento]")
                const selectorCampos = main.querySelectorAll("[campo]")

                const c = {}

                selectorCampos.forEach(sC => {
                    const campo = sC.getAttribute("campo")
                    const valor = sC.value

                    c[campo] = valor
                })
                return c
            }
        },
        actualizarCantidad: {
            arranque: async function (data) {

                const elementoUID = data.elementoUID
                const main = document.querySelector("main")
                main.classList.add("flextJustificacion_center")

                const spinner = casaVitini.ui.componentes.spinnerSimple()
                main.appendChild(spinner)

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/inventario/obtenerDetallesElemento",
                    elementoUID
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
                    const elemento = respuestaServidor.ok
                    const nombre = elemento.nombre
                    const cantidad = elemento.cantidad
                    const selectorInventarioUI = main.querySelector("[ui=actualizarCantidad]")

                    const botonInsertar = selectorInventarioUI.querySelector("[boton=insertar]")
                    botonInsertar.addEventListener("click", () => {
                        this.actualizarCantidadDelElemento({
                            elementoUID,
                            cantidad: selectorInventarioUI.querySelector("[campo=cantidad]").value,
                            operacionIDV: "insertarEnInventario"
                        })

                    })
                    const botonExtraer = selectorInventarioUI.querySelector("[boton=extraer]")
                    botonExtraer.addEventListener("click", () => {
                        this.actualizarCantidadDelElemento({
                            elementoUID,
                            cantidad: selectorInventarioUI.querySelector("[campo=cantidad]").value,
                            operacionIDV: "extraerEnInventario"
                        })

                    })
                    selectorInventarioUI.classList.remove("ocultoInicial")
                    selectorInventarioUI.querySelector("[data=nombre]").textContent = nombre
                    selectorInventarioUI.querySelector("[data=cantidad]").textContent = cantidad

                }
            },
            actualizarCantidadDelElemento: async function (data) {
                const elementoUID = data.elementoUID
                const cantidad = data.cantidad
                const operacionIDV = data.operacionIDV

                const main = document.querySelector("main")
                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                const contenedor = ui.querySelector("[componente=contenedor]")
                main.appendChild(ui)

                const spinner = casaVitini.ui.componentes.spinnerSimple()
                contenedor.appendChild(spinner)




                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/inventario/actualizarCantidadDelElemento",
                    elementoUID,
                    cantidad,
                    operacionIDV
                })
                main.classList.remove("flextJustificacion_center")

                if (respuestaServidor.error) {
                    contenedor.innerHTML = null
                    const errorUI = casaVitini.ui.componentes.errorUI_respuestaInmersiva({
                        errorUI: respuestaServidor.error
                    })
                    contenedor.appendChild(errorUI)
                }
                if (respuestaServidor.ok) {
                    casaVitini.shell.navegacion.controladorVista({
                        vista: `/administracion/inventario/ver_todo_el_inventario/elemento:${elementoUID}`,
                        tipoOrigen: "menuNavegador"
                    })

                }
            },
            crearObjeto: function () {
                const main = document.querySelector("main")
                const selectorCampos = main.querySelectorAll("[campo]")

                const c = {}

                selectorCampos.forEach(sC => {
                    const campo = sC.getAttribute("campo")
                    const valor = sC.value

                    c[campo] = valor
                })
                return c
            }
        },
        eliminarElemento: {
            ui: async function (data) {

                const elementoUID = data.elementoUID
                const nobre = data.nombre

                const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

                const titulo = constructor.querySelector("[componente=titulo]")
                titulo.textContent = `Eliminar ${nobre} irreversiblemente`
                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                mensaje.textContent = `Confirmas eliminar ${nobre} con identificador universal ${elementoUID}`

                const botonAceptar = constructor.querySelector("[boton=aceptar]")
                botonAceptar.textContent = `Comfirmar y eliminar ${nobre}`
                botonAceptar.addEventListener("click", () => {
                    this.confirmar({
                        elementoUID,
                        nobre
                    })
                })
                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                botonCancelar.textContent = "Cancelar y volver"
                document.querySelector("main").appendChild(pantallaInmersiva)
            },
            confirmar: async function (data) {

                const elementoUID = data.elementoUID
                const nombre = data.nombre
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = `Eliminado ${nombre}...`
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const transaccion = {
                    zona: "administracion/inventario/eliminarElemento",
                    elementoUID
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
                        vista: `/administracion/inventario/`,
                        tipoOrigen: "menuNavegador"
                    })

                }

            },
        },
        inventario: {
            arranque: function (data) {
                const granuladoURL = casaVitini.utilidades.granuladorURL()
                const parametroBuscar = granuladoURL.parametros?.buscar || ""
                const main = document.querySelector("main")
                const selectorInventarioUI = main.querySelector("[ui=registroDelInventarioDelElemento]")


                const campoBuscador = selectorInventarioUI.querySelector("[campo=buscador]")
                campoBuscador.addEventListener("input", (e) => { casaVitini.view.elementoDelInventario.inventario.buscadorPorCampo(e) })
                campoBuscador.value = decodeURI(parametroBuscar)
                selectorInventarioUI.classList.remove("ocultoInicial")

                const parametrosFormatoURL = granuladoURL.parametros
                const elementoUID = data.elementoUID
                const parametrosFormatoIDV = {
                    elemento: elementoUID
                }
                Object.entries(parametrosFormatoURL).forEach(([nombreParametroURL, valorParametroURL]) => {
                    const nombreParametroIDV = casaVitini.utilidades.cadenas.snakeToCamel(nombreParametroURL)
                    let nombreColumnaIDV
                    if ((valorParametroURL)?.toLowerCase() === "operacion") {
                        nombreColumnaIDV = "operacionIDV"
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
                casaVitini.view.reiniciaUI()
                const main = document.querySelector("main")

                const selectorInventarioUI = main.querySelector("[ui=registroDelInventarioDelElemento]")
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
                const elemento = granuladoURL.parametros?.elemento
                transaccion.elemento = transaccion?.elemento || elemento
                // if (!busquedaInicial) {
                //     document.querySelector("[componente=estadoBusqueda]")?.remove()
                //     document.querySelector("[areaGrid=gridClientes]")?.remove()
                //     campoBusqueda.value = null
                //     return
                // }

                let nombreColumnaURL
                const nombreColumna = transaccion.nombreColumna
                if ((nombreColumna)?.toLowerCase() === "operacionidv") {
                    nombreColumnaURL = "operacion"
                } else if (nombreColumna) {
                    nombreColumnaURL = casaVitini.utilidades.cadenas.camelToSnake(nombreColumna)
                }

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/inventario/buscadorRegistroDelElemento",
                    buscar: busquedaInicial,
                    nombreColumna: transaccion.nombreColumna,
                    sentidoColumna: transaccion.sentidoColumna,
                    pagina: Number(transaccion?.pagina || 1),
                    elementoUID: transaccion.elemento
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
                    selectorInventarioUI.querySelector("[componente=estadoBusqueda]").textContent = "No se han encontrado registros del elemento en el iventario"
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
                    const sentidoMovimiento = e.sentidoMovimiento
                    if (sentidoMovimiento === "insertar") {
                        e.sentidoMovimiento = "Insertar"
                    } else if (sentidoMovimiento === "extraer") {
                        e.sentidoMovimiento = "Extraer"
                    }
                    const operacionIDV = e.operacionIDV
                    if (operacionIDV === "elementoCreado") {
                        e.operacionIDV = "Elemento creado"
                    } else if (operacionIDV === "cantidadActualizadaDesdeIventario") {
                        e.operacionIDV = "Cantidad actualizada desde el inventario"
                    }
                })

                const columnasGrid = [
                    // {
                    //     columnaUI: "UID",
                    //     columnaIDV: "uid",
                    // },
                    {
                        columnaUI: "Nombre",
                        columnaIDV: "nombre",
                    },
                    {
                        columnaUI: "Cantidad en movimeinto",
                        columnaIDV: "cantidadEnMovimiento",
                    },
                    {
                        columnaUI: "Operacion",
                        columnaIDV: "operacionIDV",
                    },

                    {
                        columnaUI: "Fecha",
                        columnaIDV: "fecha",
                    },
                    {
                        columnaUI: "Sentido",
                        columnaIDV: "sentidoMovimiento",
                    },

                ]
                const parametrosFinales = {
                    elemento: transaccion.elemento,
                    zona: "inventario",
                    buscar: buscar,
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

                    const interruptor = parametroFinal === "buscar" && valorFinal === ""
                    if (!interruptor) {
                        estructuraParametrosFinales.push(estructura)
                    }
                }

                let parametrosURLFInal = ""
                if (estructuraParametrosFinales.length > 0) {
                    parametrosURLFInal = "/" + estructuraParametrosFinales.join("/")
                }

                const constructorURLFinal = encodeURI(granuladoURL.directoriosFusion + parametrosURLFInal)
                casaVitini.view.__sharedMethods__.grid.despliegue({
                    metodoSalida: "view.elementoDelInventario.inventario.mostrarElementosResueltos",
                    configuracionGrid: {
                        filas: elementos,
                        almacen: {
                            buscar: buscar,
                        },
                        sentidoColumna: sentidoColumna,
                        nombreColumna: nombreColumna,
                        pagina: pagina,
                        destino: "[ui=registroDelInventarioDelElemento] [contenedor=lista]",
                        columnasGrid: columnasGrid,
                        gridUID: "gridElementosIventarioPorElemento",
                        mascaraURL: {
                            mascara: "/administracion/inventario/registro/registro_en_detalle:",
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
                    componenteExistente: "zonaNavegacionPaginadaRegistroDelElemento",
                    funcionPersonalizada: "view.elementoDelInventario.inventario.mostrarElementosResueltos",
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
                // const campo = document.querySelector("[componente=zonaNavegacionPaginadaClientes]")
                const terminoBusqueda = e.target.value
                const main = document.querySelector("main")

                const selectorInventarioUI = main.querySelector("[ui=registroDelInventarioDelElemento]")
                //   document.querySelector("[componente=estadoBusqueda]")?.remove()
                selectorInventarioUI.querySelector("[areaGrid=gridElementosIventarioPorElemento]")?.remove()
                selectorInventarioUI.querySelector("[componenteID=navegacionPaginacion]")?.remove()
                selectorInventarioUI.querySelector("[contenedor=filtrosOrden]")?.remove()
                const granuladorURL = casaVitini.utilidades.granuladorURL()
                const parametros = granuladorURL.parametros
                const elementoUID = parametros.elemento

                const estadoBusqueda_r = selectorInventarioUI.querySelector("[componente=estadoBusqueda]")
                if (!estadoBusqueda_r) {
                    this.constructorMarcoInfo()
                }
                const estadoBusqueda_s = selectorInventarioUI.querySelector("[componente=estadoBusqueda]")
                estadoBusqueda_s.textContent = "Buscando elementos en el iventario..."

                const campoVacio = e.target.value.length
                if (campoVacio === 0) {
                    estadoBusqueda_s.textContent = "Mostrando todos los elementos en el iventario..."
                    clearTimeout(casaVitini.componentes.temporizador);
                    const granuladoURL = casaVitini.utilidades.granuladorURL()
                    selectorInventarioUI.querySelector("[areaGrid=gridElementosIventarioPorElemento]")?.remove()
                    const titulo = "casavitini"
                    const estado = casaVitini.view.verTodoInventario.navegacion.estadoInicial
                    const url = `/administracion/inventario/ver_todo_el_inventario/elemento:${elementoUID}/zona:inventario`
                    estado.zona = `administracion/inventario/ver_todo_el_inventario/elemento:${elementoUID}/zona:inventario`

                    if (url !== granuladoURL.raw.toLocaleLowerCase()) {
                        window.history.pushState(estado, titulo, `/administracion/inventario/ver_todo_el_inventario/elemento:${elementoUID}/zona:inventario`);
                    }

                }

                clearTimeout(casaVitini.componentes.temporizador);
                casaVitini.componentes.temporizador = setTimeout(async () => {
                    const transaccion = {
                        zona: "administracion/inventario/buscadorRegistroDelElemento",
                        pagina: 1,
                        buscar: terminoBusqueda,
                        origen: "botonMostrarClientes",
                        tipoConstruccionGrid: "total",
                        instanciaUID: instanciaUID,
                        elemento: elementoUID
                    }


                    this.mostrarElementosResueltos(transaccion)
                }, 1500);
            },
            navegacion: {
                estadoInicial: {
                    zona: null,
                    EstadoInternoZona: "estado",
                    tipoCambio: "parcial",
                    componenteExistente: "zonaNavegacionPaginadaRegistroDelElemento",
                    funcionPersonalizada: "view.elementoDelInventario.inventario.mostrarElementosResueltos",
                    args: {}
                }
            },
            constructorMarcoInfo: function () {
                const main = document.querySelector("main")

                const selectorInventarioUI = main.querySelector("[ui=registroDelInventarioDelElemento]")
                const campo = selectorInventarioUI.querySelector("[componente=zonaNavegacionPaginadaRegistroDelElemento]")

                const estadoBusquedaUI = document.createElement("div")
                estadoBusquedaUI.classList.add("botonV1BlancoIzquierda_noSeleccionable", "textoCentrado")
                estadoBusquedaUI.setAttribute("componente", "estadoBusqueda")
                estadoBusquedaUI.textContent = "Buscando..."
                const comRenderizado = selectorInventarioUI.querySelector("[componente=estadoBusqueda]")
                if (!comRenderizado) {
                    campo.parentNode.insertBefore(estadoBusquedaUI, campo.nextSibling);
                }

            },
        }
    },
    reiniciaUI: function () {
        const main = document.querySelector("main")
        const todasUI = main.querySelectorAll("[ui]")
        todasUI.forEach(ui => ui.classList.add("ocultoInicial"))
    },
    shared: {
        marcoElasticoRelativo: function () {
            const ui = document.createElement("div")
            ui.classList.add("marcoElasticoRelativo")
            ui.setAttribute("contenedor", "menu")
            return ui
        }
    }

}