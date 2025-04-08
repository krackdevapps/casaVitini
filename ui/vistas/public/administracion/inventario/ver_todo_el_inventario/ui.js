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
            contenedor.classList.add("flexVertical", "gap10")
            marcoElasticoRelativo.appendChild(contenedor)

            const titulo = document.createElement("p")
            titulo.classList.add("colorGris", "negrita", "textoCentrado")
            titulo.textContent = "Inventario general"
            contenedor.appendChild(titulo)

            const campoBuscador = document.createElement("input")
            campoBuscador.type = "text"
            campoBuscador.setAttribute("campo", "buscador")
            campoBuscador.setAttribute("componente", "zonaNavegacionPaginadaElementos")
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
            const main = document.querySelector("main")

            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const selectorEspacio = main.querySelector("[contenedor=lista]")
            if (!selectorEspacio) { return }

            selectorEspacio.setAttribute("instanciaBusqueda", instanciaUID)

            delete transaccion.instanciaUID
            const origen = transaccion.origen
            delete transaccion.origen
            const granuladoURL = casaVitini.utilidades.granuladorURL()
            const paginaTipo = transaccion.paginaTipo

            const busquedaInicial = transaccion?.buscar //|| almacen?.buscar
            const campoBusqueda = main.querySelector("[campo=buscador]")

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

            const instanciaRenderizada = main.querySelector(`[instanciaBusqueda="${instanciaUID}"]`)
            if (!instanciaRenderizada) { return }
            if (respuestaServidor?.error) {
                this.constructorMarcoInfo()
                main.querySelector("[componente=estadoBusqueda]").textContent = respuestaServidor?.error
                return
            }
            if (respuestaServidor.totalElementos === 0) {
                this.constructorMarcoInfo()
                main.querySelector("[componente=estadoBusqueda]").textContent = "No se han encontrado elementos en el iventario"
                return
            }
            main.querySelector("[componente=estadoBusqueda]")?.remove()
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
                if (valorFinal !== "") {
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
                    const categoriasDelEmento = respuestaServidor.categoriasDelEmento


                    const marcoElasticoRelativo = casaVitini.view.shared.marcoElasticoRelativo()
                    main.appendChild(marcoElasticoRelativo)

                    const contenedor = document.createElement("div")
                    contenedor.setAttribute("ui", "portadaElemento")
                    contenedor.classList.add("flexVertical", "gap6")
                    marcoElasticoRelativo.appendChild(contenedor)

                    const titulo = document.createElement("p")
                    titulo.setAttribute("data", "nombre")
                    titulo.classList.add("negrita", "fontSize20", "paddingLateral16")
                    titulo.textContent = "Nombre del elemento"
                    contenedor.appendChild(titulo)

                    const dUI = document.createElement("datalist")
                    dUI.setAttribute("contenedor", "descripcion")
                    dUI.classList.add("padding", "ocultoInicial")
                    contenedor.appendChild(dUI)

                    const sUI = document.createElement("summary")
                    sUI.classList.add("padding")
                    sUI.textContent = "Descripción del elemento"
                    dUI.appendChild(sUI)

                    const descUI = document.createElement("pre")
                    descUI.setAttribute("data", "descripcion")
                    descUI.classList.add("padding6")
                    dUI.appendChild(descUI)

                    const contenedorGlobal = document.createElement("div")
                    contenedorGlobal.classList.add("flexVertical", "padding16", "gap10", "borderGrey1", "borderRadius16")
                    contenedor.appendChild(contenedorGlobal)

                    const cCantidades = document.createElement("div")
                    cCantidades.classList.add("flexVertical")
                    contenedorGlobal.appendChild(cCantidades)

                    const cCantidadTitulo = document.createElement("p")
                    cCantidadTitulo.classList.add("negrita")
                    cCantidadTitulo.textContent = "Cantidades actuales en el inventario general"
                    cCantidades.appendChild(cCantidadTitulo)

                    const cCantidadData = document.createElement("p")
                    cCantidadData.setAttribute("data", "cantidad")
                    cCantidades.appendChild(cCantidadData)


                    const cTipoLimite = document.createElement("div")
                    cTipoLimite.classList.add("flexVertical", "ocultoInicial")
                    cTipoLimite.setAttribute("contenedor", "tipoLimite")
                    contenedorGlobal.appendChild(cTipoLimite)

                    const cTipoLimiteTitulo = document.createElement("p")
                    cTipoLimiteTitulo.classList.add("negrita")
                    cTipoLimiteTitulo.textContent = "Configuración miníma"
                    cCantidades.appendChild(cTipoLimiteTitulo)

                    const cTipoLimiteData = document.createElement("p")
                    cTipoLimiteData.setAttribute("data", "tipoLimite")
                    cCantidades.appendChild(cTipoLimiteData)


                    const categoriasDetails = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "details",
                        classList: ["padding6"],

                    })
                    contenedor.appendChild(categoriasDetails)

                    const categoriasSummary = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "summary",
                        classList: ["padding10"],
                        textContent: "Categorias del elemento"
                    })
                    categoriasDetails.appendChild(categoriasSummary)

                    const categoriasContenedor = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "div",
                        classList: ["gap6", "flexVertical"],
                        atributos: {
                            contenedor: "categorias"
                        }
                    })
                    categoriasDetails.appendChild(categoriasContenedor)

                    const botonInsertarCategoria = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "div",
                        classList: [
                            "botonV1BlancoIzquierda"
                        ],
                        textContent: "Insertar el elemento en una categoria"
                    })
                    botonInsertarCategoria.addEventListener("click", () => {
                        casaVitini.view.elementoDelInventario.insertartCategoria.ui({
                            elementoUID
                        })
                    })
                    categoriasContenedor.appendChild(botonInsertarCategoria)



                    categoriasDelEmento.forEach(c => {
                        const categoriaUI = c.categoriaUI
                        const categoriaUID = c.categoriaUID

                        const categoriaE = this.categoriasDelElemento.categoriaUI({
                            categoriaUI,
                            categoriaUID,
                            elementoUID
                        })
                        categoriasContenedor.appendChild(categoriaE)
                    })

                    const contenedorBotones = document.createElement("div")
                    contenedorBotones.classList.add("contenedor", "sobreControlAnimacion")
                    contenedor.appendChild(contenedorBotones)

                    const botonContructor = (data) => {
                        const href = data.href
                        const nombre = data.nombre

                        const b = document.createElement("a")
                        b.classList.add("textoBoton")
                        b.setAttribute("href", href)
                        b.textContent = nombre
                        b.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                        return b

                    }

                    contenedor.querySelector("[contenedor=tipoLimite]").classList.add("ocultoInicial")
                    const urlBase = `/administracion/inventario/ver_todo_el_inventario/elemento:${elementoUID}/zona:`


                    contenedorBotones.appendChild(botonContructor({
                        href: urlBase + "actualizar_cantidades",
                        nombre: "Modificar cantidades"
                    }))

                    contenedorBotones.appendChild(botonContructor({
                        href: urlBase + "editar",
                        nombre: "Editar elemento"
                    }))

                    contenedorBotones.appendChild(botonContructor({
                        href: urlBase + "inventario",
                        nombre: "Registro del inventario del elemento"
                    }))

                    const botonEliminar = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "div",
                        textContent: "Eliminar elemento del inventario",
                        classList: ["textoBoton"]
                    })

                    botonEliminar.addEventListener("click", () => {
                        casaVitini.view.elementoDelInventario.eliminarElemento.ui({
                            elementoUID,
                            nombre,
                        })
                    })
                    contenedorBotones.appendChild(botonEliminar)

                    contenedor.querySelector("[data=nombre]").textContent = nombre
                    contenedor.querySelector("[data=cantidad]").textContent = cantidad

                    if (!descripcion || descripcion.length > 0) {
                        contenedor.querySelector("[contenedor=descripcion]").classList.remove("ocultoInicial")
                        contenedor.querySelector("[data=descripcion]").textContent = descripcion

                    }

                    const tipoLimiteSelector = contenedor.querySelector("[data=tipoLimite]")

                    if (tipoLimite === "sinLimite") {
                        tipoLimiteSelector.textContent = "Este elemento del inventario no tiene un limite mínimo configurado"
                    } else if (tipoLimite === "conLimite") {
                        contenedor.querySelector("[contenedor=tipoLimite]").classList.remove("ocultoInicial")

                        tipoLimiteSelector.textContent = `Se notificara si en el inventario hay menos de ${cantidadMinima}`
                    }
                }
            },
            categoriasDelElemento: {
                categoriaUI: function (data) {
                    const categoriaUID = data.categoriaUID
                    const categoriaUI = data.categoriaUI
                    const elementoUID = data.elementoUID

                    const categoriaE = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "div",
                        classList: [
                            "backgroundGrey1",
                            "flexVertical",
                            "borderRadius16",
                            "padding6",
                            "gap6"
                        ],
                        atributos: {
                            categoriaUID: categoriaUID
                        }

                    })

                    const tituloCategoria = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "p",
                        classList: ["padding10"],
                        textContent: categoriaUI,
                    })
                    categoriaE.appendChild(tituloCategoria)

                    const categoriaEnlace = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "a",
                        classList: ["botonV1BlancoIzquierda"],
                        textContent: "Ir al a categoria",
                        atributos: {
                            href: `/administracion/inventario/categorias/categoria:${categoriaUID}`
                        }
                    })
                    categoriaE.appendChild(categoriaEnlace)

                    const botonEliminar = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "div",
                        classList: ["botonV1BlancoIzquierda"],
                        textContent: "Eliminar elemento de la categoria",
                        atributos: {}
                    })
                    botonEliminar.addEventListener("click", () => {
                        casaVitini.view.elementoDelInventario.eliminarCategoriaDelElemento.ui({
                            elementoUID,
                            categoriaUID,
                            categoriaUI
                        })
                    })
                    categoriaE.appendChild(botonEliminar)

                    return categoriaE
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

                    const marcoElasticoRelativo = casaVitini.view.shared.marcoElasticoRelativo()
                    main.appendChild(marcoElasticoRelativo)


                    const contenedor = document.createElement("div")
                    contenedor.setAttribute("ui", "editarElemento")
                    contenedor.classList.add("flexVertical", "gap6")
                    marcoElasticoRelativo.appendChild(contenedor)

                    const titulo = document.createElement("p")
                    titulo.classList.add("padding10", "colorGrisV1", "negrita", "textoCentrado")
                    titulo.textContent = "Editar elemento en el inventario general"
                    contenedor.appendChild(titulo)

                    const campoNombre = document.createElement("input")
                    campoNombre.type = "text"
                    campoNombre.setAttribute("campo", "nombre")
                    campoNombre.placeholder = "Nombre del nuevo elemento del inventario"
                    contenedor.appendChild(campoNombre)

                    const selectorTipoLimite = document.createElement("select")
                    selectorTipoLimite.setAttribute("campo", "tipoLimite")
                    contenedor.appendChild(selectorTipoLimite)


                    const contructorOpcion = (data) => {
                        const value = data.value
                        const text = data.text
                        const disabled = data?.disabled || false
                        const selected = data?.selected || false

                        const o = document.createElement("option")
                        o.value = value
                        o.disabled = disabled
                        o.selected = selected
                        o.text = text
                        return o
                    }


                    selectorTipoLimite.appendChild(contructorOpcion({
                        value: "",
                        text: "Seleciona el tipo de límite",
                        selected: "true",
                        disables: "true"
                    }))

                    selectorTipoLimite.appendChild(contructorOpcion({
                        value: "sinLimite",
                        text: "El elemento no tiene un limite mínimo",
                    }))

                    selectorTipoLimite.appendChild(contructorOpcion({
                        value: "conLimite",
                        text: "El elemento tiene un limite mínimo",
                    }))


                    const cLimiteMinimo = document.createElement("div")
                    cLimiteMinimo.classList.add("flexVertical", "gap10", "borderGrey1", "borderRadius20", "padding6", "ocultoInicial")
                    cLimiteMinimo.setAttribute("contenedor", "limiteMinimo")
                    contenedor.appendChild(cLimiteMinimo)

                    const tituloLimiteMinimo = document.createElement("p")
                    tituloLimiteMinimo.classList.add("padding16")
                    tituloLimiteMinimo.textContent = "Seleciona el límite mínimo que se usará para da la notificación de aviso"
                    cLimiteMinimo.appendChild(tituloLimiteMinimo)

                    const campoLimiteMinimo = document.createElement("input")
                    campoLimiteMinimo.type = "number"
                    campoLimiteMinimo.setAttribute("campo", "cantidadMinima")
                    campoLimiteMinimo.placeholder = "Cantidad mínima"
                    cLimiteMinimo.appendChild(campoLimiteMinimo)

                    const campoDescripcion = document.createElement("textarea")
                    campoDescripcion.placeholder = "Descripción del elemento"
                    campoDescripcion.setAttribute("campo", "descripcion")
                    contenedor.appendChild(campoDescripcion)

                    const botonActualizarElemento = document.createElement("div")
                    botonActualizarElemento.classList.add("botonV1BlancoIzquierda")
                    botonActualizarElemento.setAttribute("boton", "actualizar")
                    botonActualizarElemento.textContent = "Actualizar elemento"
                    contenedor.appendChild(botonActualizarElemento)



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

                    const marcoElasticoRelativo = casaVitini.view.shared.marcoElasticoRelativo()
                    main.appendChild(marcoElasticoRelativo)

                    const contenedor = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "div",
                        classList: [
                            "flexVertical",
                            "gap6"
                        ]
                    })
                    marcoElasticoRelativo.appendChild(contenedor)


                    const titulo = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "p",
                        classList: [
                            "padding16",
                            "negrita",
                            "fontSize20",
                            "gap6"
                        ],
                        textContent: nombre
                    })
                    contenedor.appendChild(titulo)


                    const c1 = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "div",
                        classList: [
                            "flexVertical",
                            "gap10"
                        ]
                    })
                    contenedor.appendChild(c1)

                    const c1_titulo = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "p",
                        classList: [
                            "paddingLateral16",
                        ],
                        textContent: "Cantidad actual de elemento en el inventario general."
                    })
                    c1.appendChild(c1_titulo)

                    const c1_data = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "p",
                        classList: [
                            "paddingLateral16",
                        ],
                        atributos: {
                            data: "cantidad"
                        }
                    })
                    c1.appendChild(c1_data)



                    const c1_cantidadCampo = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "input",
                        classList: [
                            "paddingLateral16",
                        ],
                        atributos: {
                            campo: "cantidad",
                            min: "0",
                            placeholder: "Inserta la cantidad para actualizar la cantidad",
                            value: cantidad
                        },
                    })
                    c1.appendChild(c1_cantidadCampo)

                    const c1_botonInsertar = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "div",
                        classList: [
                            "botonV1BlancoIzquierda",
                        ],
                        atributos: {
                            boton: "insertar",

                        },
                        textContent: "Insertar en el inventario"
                    })

                    c1_botonInsertar.addEventListener("click", () => {
                        this.actualizarCantidadDelElemento({
                            elementoUID,
                            cantidad: c1_cantidadCampo.value,
                            operacionIDV: "insertarEnInventario"
                        })

                    })
                    c1.appendChild(c1_botonInsertar)

                    const c1_botonExtraer = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "div",
                        classList: [
                            "botonV1BlancoIzquierda",
                        ],
                        atributos: {
                            boton: "extraer",

                        },
                        textContent: "Extraer en el inventario"
                    })
                    c1_botonExtraer.addEventListener("click", () => {
                        this.actualizarCantidadDelElemento({
                            elementoUID,
                            cantidad: c1_cantidadCampo.value,
                            operacionIDV: "extraerEnInventario"
                        })
                    })
                    c1.appendChild(c1_botonExtraer)

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

                const marcoElasticoRelativo = casaVitini.view.shared.marcoElasticoRelativo()
                main.appendChild(marcoElasticoRelativo)

                const contenedor = casaVitini.ui.componentes.constructorElemento({
                    tipoElemento: "div",
                    classList: [
                        "flexVertical",
                        "gap10"
                    ],
                    atributos: {
                        ui: "registroDelInventarioDelElemento"
                    },
                })
                marcoElasticoRelativo.appendChild(contenedor)


                const titulo = casaVitini.ui.componentes.constructorElemento({
                    tipoElemento: "p",
                    classList: [
                        "colorGrisV1",
                        "negrita",
                        "textoCentrado"
                    ],
                    textContent: "Registro del inventario del elemento"
                })
                contenedor.appendChild(titulo)

                const campoBuscador = casaVitini.ui.componentes.constructorElemento({
                    tipoElemento: "input",
                    atributos: {
                        type: "text",
                        campo: "buscador",
                        componente: "zonaNavegacionPaginadaRegistroDelElemento",
                        placeholder: "Buscar en todod le registro del elemento"
                    },
                    textContent: "Registro del inventario del elemento"
                })
                campoBuscador.addEventListener("input", (e) => {
                    casaVitini.view.elementoDelInventario.inventario.buscadorPorCampo(e)
                })
                campoBuscador.value = decodeURI(parametroBuscar)
                contenedor.appendChild(campoBuscador)


                const lista = casaVitini.ui.componentes.constructorElemento({
                    tipoElemento: "div",
                    atributos: {
                        contenedor: "lista",
                    },
                })
                contenedor.appendChild(lista)

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
                const main = document.querySelector("main")


                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const selectorEspacio = main.querySelector("[contenedor=lista]")
                if (!selectorEspacio) { return }

                selectorEspacio.setAttribute("instanciaBusqueda", instanciaUID)

                delete transaccion.instanciaUID
                const origen = transaccion.origen
                delete transaccion.origen
                const granuladoURL = casaVitini.utilidades.granuladorURL()
                const paginaTipo = transaccion.paginaTipo
                const busquedaInicial = transaccion?.buscar //|| almacen?.buscar
                const campoBusqueda = main.querySelector("[campo=buscador]")
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

                const instanciaRenderizada = main.querySelector(`[instanciaBusqueda="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }
                if (respuestaServidor?.error) {
                    this.constructorMarcoInfo()
                    main.querySelector("[componente=estadoBusqueda]").textContent = respuestaServidor?.error
                    return
                }
                if (respuestaServidor.totalElementos === 0) {
                    this.constructorMarcoInfo()
                    main.querySelector("[componente=estadoBusqueda]").textContent = "No se han encontrado registros del elemento en el iventario"
                    return
                }
                main.querySelector("[componente=estadoBusqueda]")?.remove()
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
        },
        eliminarCategoriaDelElemento: {
            ui: async function (data) {

                const elementoUID = data.elementoUID
                const categoriaUID = data.categoriaUID
                const categoriaUI = data.categoriaUI


                const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

                const titulo = constructor.querySelector("[componente=titulo]")
                titulo.textContent = `Eliminar categoria ${categoriaUI} del elemento`
                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                mensaje.textContent = `Confirmar la eliminación`

                const botonAceptar = constructor.querySelector("[boton=aceptar]")
                botonAceptar.textContent = `Comfirmar y eliminar ${categoriaUI}`
                botonAceptar.addEventListener("click", () => {
                    this.confirmar({
                        elementoUID,
                        categoriaUID,
                        categoriaUI
                    })
                })
                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                botonCancelar.textContent = "Cancelar y volver"
                document.querySelector("main").appendChild(pantallaInmersiva)
            },
            confirmar: async function (data) {

                const elementoUID = data.elementoUID
                const categoriaUID = data.categoriaUID
                const categoriaUI = data.categoriaUI

                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = `Eliminado ${categoriaUI} del elemento...`
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/inventario/categorias/eliminarInventarioEnCategoria",
                    elementoUID,
                    categoriaUID
                })

                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }

                if (respuestaServidor?.error) {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    const categoriaRenderizada = document.querySelector(`[contenedor=categorias] [categoriaUID="${categoriaUID}"]`)
                    categoriaRenderizada?.remove()

                }

            },
        },
        insertartCategoria: {
            ui: function (data) {
                const elementoUID = data.elementoUID
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
                titulo.textContent = "Buscar elementos del inventario para insertarlo en la categoria"
                contenedor.appendChild(titulo)

                const contenedorBuscador = document.createElement("div")
                contenedorBuscador.setAttribute("area", "buscador")
                contenedorBuscador.classList.add("flexVertical", "gap6")
                contenedor.appendChild(contenedorBuscador)

                const buscadorUI = document.createElement("input")
                buscadorUI.placeholder = "Buscar categorias"
                buscadorUI.addEventListener("input", (e) => {
                    this.buscadorPorCampo({
                        e,
                        elementoUID
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
                const elementoUID = data.elementoUID
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
                        elementoUID
                    })
                }, 1500);
            },
            iniciarBusqueda: async function (data) {

                const terminoBusqueda = data.terminoBusqueda
                const areaBuscador = data.areaBuscador
                const elementoUID = data.elementoUID
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                areaBuscador.setAttribute("instanciaUID", instanciaUID)
                const contenedorResultados = areaBuscador.querySelector("[contenedor=resultados]")

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/inventario/categorias/buscadorCategorias",
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

                        const categoriaUID = e.categoriaUID
                        const nombre = e.categoriaUI
                        const descripcion = e.descripcion

                        const resultadoUI = this.resultadoUI({
                            UID: categoriaUID,
                            nombre,
                            descripcion
                        })
                        resultadoUI.addEventListener("click", () => {
                            this.insertarCategoriaEnElemento({
                                elementoUID,
                                categoriaUID,
                                categoriaUI: e.categoriaUI
                            })
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
            insertarCategoriaEnElemento: async function (data) {
                const elementoUID = data.elementoUID
                const categoriaUID = data.categoriaUID
                const categoriaUI = data.categoriaUI

                const main = document.querySelector("main")
                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                const contenedor = ui.querySelector("[componente=contenedor]")
                main.appendChild(ui)

                const spinner = casaVitini.ui.componentes.spinnerSimple()
                contenedor.appendChild(spinner)

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/inventario/categorias/insertarInventarioEnCategoria",
                    elementoUID,
                    categoriaUID,
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
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    const categoria = casaVitini.view.elementoDelInventario.portada.categoriasDelElemento.categoriaUI({
                        categoriaUID,
                        categoriaUI,
                        elementoUID
                    })

                    const contenedorCategorias = main.querySelector("[contenedor=categorias]")
                    contenedorCategorias.appendChild(categoria)
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


        },
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