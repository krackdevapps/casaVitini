
export const grid = {
    grid: {
        despliegue: async function (data) {
            const configuracionGrid = data.configuracionGrid
            const configuracionPaginador = data.configuracionPaginador
            const metodoSalida = data.metodoSalida
            configuracionPaginador.gridUID = configuracionGrid.gridUID
            configuracionPaginador.pagina = configuracionGrid.pagina
            configuracionPaginador.metodoSalida = metodoSalida
            const filas = configuracionGrid.filas
            const sentidoColumna = configuracionGrid.sentidoColumna ? configuracionGrid.sentidoColumna : ""
            const nombreColumna = configuracionGrid.nombreColumna ? configuracionGrid.nombreColumna : ""
            const pagina = configuracionGrid.pagina
            const mascaraURL = configuracionGrid.mascaraURL
            const columnasGrid = configuracionGrid.columnasGrid
            const numeroColumnas = columnasGrid.length
            const gridUID = configuracionGrid.gridUID
            const destino = configuracionGrid.destino
            const parametros = configuracionGrid.parametros ? configuracionGrid.parametros : {}
            const almacen = configuracionGrid.almacen
            if (!filas) {
                const error = "No estoy recibiendo contenido para las filas, recuerda que constructorGridClientes, necesita el objeto ya procesador para el servidor, no lo envía"
                return casaVitini.ui.componentes.advertenciaInmersiva(error)
            }
            const contenedor_selector = document.querySelector(`[areaGrid="${gridUID}"]`)
            if (!contenedor_selector) {
                const contenedor = document.createElement("div")
                contenedor.setAttribute("areaGrid", gridUID)
                contenedor.setAttribute("almacen", JSON.stringify(almacen))
                contenedor.classList.add(
                    "flexVertical",
                )
                document.querySelector(`${destino}`)?.appendChild(contenedor)
                const css = await this.css()
                contenedor.appendChild(css)

                const contenedorSelectorFiltros = document.createElement("div")
                contenedorSelectorFiltros.setAttribute("contenedor", "filtrosOrden")
                contenedor.appendChild(contenedorSelectorFiltros)
                const contenedorResultados = document.createElement("div")
                contenedorResultados.setAttribute("contenedor", "resultados")
                contenedor.appendChild(contenedorResultados)
                const contenedorPaginador = document.createElement("div")
                contenedorPaginador.setAttribute("contenedor", "paginador")
                contenedorPaginador.style.paddingTop = "6px"
                contenedor.appendChild(contenedorPaginador)
            }
            const contenedor_renderizado = document.querySelector(`[areaGrid="${gridUID}"]`)
            const contenedorResultados = contenedor_renderizado.querySelector(`[contenedor=resultados]`)
            const valorColumnasCss = []
            for (const i in columnasGrid) {
                valorColumnasCss.push("auto")
            }
            const gridConstruido_selector = document.querySelector(`[areaGrid="${gridUID}"] [gridUID=${gridUID}]`)
            if (!gridConstruido_selector) {
                const constructorGrid = document.createElement("div")
                constructorGrid.style.gridTemplateColumns = valorColumnasCss.join(" ")
                constructorGrid.classList.add(
                    "administracionGridReservas"
                )
                constructorGrid.setAttribute("gridUID", gridUID)
                contenedorResultados.appendChild(constructorGrid)
            }
            const gridConstruido_renderizado = document.querySelector(`[areaGrid="${gridUID}"] [gridUID=${gridUID}]`)
            gridConstruido_renderizado.setAttribute("nombreColumnaSeleccionada", nombreColumna)
            gridConstruido_renderizado.setAttribute("sentidoColumna", sentidoColumna)
            gridConstruido_renderizado.setAttribute("numeroPagina", pagina)
            gridConstruido_renderizado.setAttribute("parametros", JSON.stringify(parametros))
            const selectorTitulosColumnas = document.querySelectorAll("[componenteGrid=celdaTituloColumna]")
            selectorTitulosColumnas.forEach((celdaTituloColumna) => {
                celdaTituloColumna.style.removeProperty("background")
                celdaTituloColumna.querySelector("[sentidoIconos]")?.remove()
            })
            let icononombreColumna
            let descripcionnombreColumna
            if (sentidoColumna) {
                if (sentidoColumna === "ascendente") {
                    icononombreColumna = "/activos/iconos/ascendente.svg"
                    descripcionnombreColumna = "Ordenar acendentemente esta columna"
                }
                if (sentidoColumna === "descendente") {
                    icononombreColumna = "/activos/iconos/descendente.svg"
                    descripcionnombreColumna = "Ordenar descendentemente esta columna"
                }
            }
            const selectorColumnasRenderizadas = document.querySelectorAll(`[gridUID=${gridUID}] [nombreColumna]`)
            selectorColumnasRenderizadas.forEach((columna) => {
                columna.setAttribute("sentidoColumna", "")
            })
            columnasGrid.forEach((detallesColumna) => {
                const columnaUI = detallesColumna.columnaUI
                const columnaIDV = detallesColumna.columnaIDV
                const columna_selector = gridConstruido_renderizado.querySelector(`[nombreColumna="${columnaIDV}"]`)
                if (!columna_selector) {
                    const columnaElemento = document.createElement("div")
                    columnaElemento.textContent = columnaUI
                    columnaElemento.classList.add("administracionReservasColumnaTitulo")
                    columnaElemento.setAttribute("nombreColumna", columnaIDV)
                    columnaElemento.setAttribute("componenteGrid", "celdaTituloColumna")
                    columnaElemento.addEventListener("click", (e) => {
                        const columna = e.target.closest("[nombreColumna]")
                        this.ordenarPorColumna({
                            gridUID,
                            metodoSalida,
                            columna
                        })
                    })
                    gridConstruido_renderizado.appendChild(columnaElemento)
                }
                const columna_renderizada = gridConstruido_renderizado.querySelector(`[nombreColumna="${columnaIDV}"]`)
                if (nombreColumna === columnaIDV) {
                    if (nombreColumna) {
                        columna_renderizada.style.background = "#00000047"
                        columna_renderizada.setAttribute("nombreColumna", columnaIDV)
                        columna_renderizada.setAttribute("sentidoColumna", sentidoColumna)
                        const iconoColumna = document.createElement("img");
                        iconoColumna.src = icononombreColumna;
                        iconoColumna.alt = descripcionnombreColumna;
                        iconoColumna.classList.add("icononombreColumna");
                        iconoColumna.setAttribute("sentidoIconos", sentidoColumna)
                        columna_renderizada.appendChild(iconoColumna)
                    }
                }
            })
            const selectorFilasGrid = gridConstruido_renderizado.querySelectorAll("[componenteGrid=fila]")
            selectorFilasGrid.forEach((filaGrid) => {
                filaGrid.remove()
            })
            const columnasAceptadas = columnasGrid.map((columna) => {
                return columna.columnaIDV
            })
            filas.forEach((detallesFila) => {
                const fila = document.createElement("a")
                fila.setAttribute("class", "administracionReservasFila")
                fila.setAttribute("componenteGrid", "fila")
                fila.setAttribute("href", mascaraURL?.mascara + detallesFila[mascaraURL?.parametro])
                fila.addEventListener("click", this.resolverFila)
                for (const detallesObjeto of Object.entries(detallesFila)) {
                    const celdaIDV = detallesObjeto[0]
                    const celdaUI = detallesObjeto[1]
                    if (columnasAceptadas.includes(celdaIDV)) {
                        const celda = document.createElement("div")
                        celda.setAttribute("class", "administracionCeldaEstiloCompartido")
                        celda.setAttribute("celdaIDV", celdaIDV)
                        celda.textContent = celdaUI
                        fila.appendChild(celda)
                    }
                }
                gridConstruido_renderizado.appendChild(fila)
            })
            this.tarjetas.selectorFiltro.despliegue({
                gridUID,
                columnas: columnasGrid,
                columnaSeleccionada: nombreColumna,
                sentidoSeleccionado: sentidoColumna,
                metodoSalida
            })
            this.paginador(configuracionPaginador)
            this.tarjetas.constructorTarjetas({
                columnasGrid,
                filas,
                mascaraURL,
                gridUID
            })
        },
        cambiarPagina: async (data) => {
            const gridUID = data.gridUID
            const metodoSalida = data.metodoSalida
            const gridEnlazado = document.querySelector(`[gridUID=${gridUID}]`)
            const botonOrigen = data.e.target
            const allButtons = botonOrigen.closest("[componenteID=navegacionPaginacion]").querySelectorAll("[boton]")
            allButtons.forEach(aB => aB.classList.remove("parpeoGridSel"))
            botonOrigen.classList.add("parpeoGridSel")
            if (!gridEnlazado) {
                const m = "cambiarPagina no encuentra el grid sobre el que actual"
                return casaVitini.ui.componentes.advertenciaInmersiva(m)
            }
            const main = document.querySelector("main")
            const instanciaUID = main.getAttribute("instanciaUID")
            const tipoBoton = data.componenteID
            const nombreColumna = gridEnlazado.getAttribute("nombreColumnaSeleccionada")
            const sentidoColumna = gridEnlazado.getAttribute("sentidoColumna")
            const paginaActual = Number(gridEnlazado.getAttribute("numeroPagina"))
            const paginaTipo = data.paginaTipo
            const transacccion = {
                gridUID,
                paginaTipo
            }
            if (nombreColumna) {
                transacccion.nombreColumna = nombreColumna
            }
            if (sentidoColumna) {
                transacccion.sentidoColumna = sentidoColumna
            }
            if (tipoBoton === "numeroPagina") {
                const numeroPagina = data.numeroPagina
                transacccion.pagina = Number(numeroPagina)
                transacccion.origen = "botonNumeroPagina"
            }
            if (tipoBoton === "botonAdelantePaginacion") {
                const posicionRelativa = document.querySelector("[paginaTipo=actual]").getAttribute("posicionRelativa")
                let mueveNavegadorHaciaAdelante = "Desactivado";
                if (Number(posicionRelativa) === 10) {
                    mueveNavegadorHaciaAdelante = "Activado"
                }
                transacccion.pagina = paginaActual + 1
                transacccion.origen = "botonNumeroPagina"
                transacccion.moverHaciaAdelanteNavegacion = mueveNavegadorHaciaAdelante
                transacccion.sentidoNavegacion = "Adelante"
            }
            if (tipoBoton === "botonAtrasPaginacion") {
                const posicionRelativa = document.querySelector("[paginaTipo=actual]").getAttribute("posicionRelativa")
                let mueveNavegadorHaciaAtras = "Desactivado";
                if (Number(posicionRelativa) === 1) {
                    mueveNavegadorHaciaAtras = "Activado"
                }
                transacccion.pagina = paginaActual - 1
                transacccion.origen = "botonNumeroPagina"
                transacccion.mueveNavegadorHaciaAtras = mueveNavegadorHaciaAtras
                transacccion.sentidoNavegacion = "Atras"
            }
            
            const almacen = gridEnlazado.closest("[almacen]").getAttribute("almacen")
            if (almacen) {
                const almacenParseado = JSON.parse(almacen)
                Object.assign(transacccion, almacenParseado)
            }
            await casaVitini.utilidades.ejecutarFuncionPorNombreDinamicoConContexto({
                ruta: metodoSalida,
                args: transacccion
            })
            botonOrigen.classList.remove("parpeoGridSel")
        },
        paginador: function (metadatos) {
            const paginaActual = metadatos.pagina
            const moverHaciaAdelanteNavegacion = metadatos.moverHaciaAdelanteNavegacion
            const mueveNavegadorHaciaAtras = metadatos.mueveNavegadorHaciaAtras
            const sentidoNavegacion = metadatos.sentidoNavegacion
            const posicionRelativa = metadatos.posicionRelativa
            const paginasTotales = metadatos.paginasTotales
            const cambiarPagina = metadatos.cambiarPagina
            const metodoSalida = metadatos.metodoSalida
            const gridUID = metadatos.gridUID
            const granuladoURL = metadatos.granuladoURL
            let inicioPaginacion = paginaActual
            const constructorURL = (granuladoURL, pagina) => {
                if (!granuladoURL) {
                    const error = "El constructor URL dentro del paginador necesita el gridUID"
                    return casaVitini.ui.componentes.advertenciaInmersiva(error)
                }
                if (!pagina) {
                    const error = "El constructor URL dentro del paginador necesita el pagina"
                    return casaVitini.ui.componentes.advertenciaInmersiva(error)
                }
                const directoriosFusion = granuladoURL.directoriosFusion
                const parametros = granuladoURL.parametros
                parametros.pagina = pagina
                const parametrosArray = []
                for (const [parametro, valor] of Object.entries(parametros)) {
                    const estructura = `${parametro}:${valor}`
                    parametrosArray.push(estructura)
                }
                const parametrosFusion = directoriosFusion + "/" + parametrosArray.join("/")
                return parametrosFusion
            }
            const navegacionPaginacion = document.createElement("div")
            navegacionPaginacion.classList.add("administracionNavegacionPaginacion", "sobreControlAnimacionGlobal")
            navegacionPaginacion.setAttribute("componenteID", "navegacionPaginacion")
            navegacionPaginacion.setAttribute("gridUID_enlazado", gridUID)
            if (moverHaciaAdelanteNavegacion === "Desactivado" && sentidoNavegacion === "Adelante") {
                inicioPaginacion = Number(document.querySelector("[posicionRelativa='1']").getAttribute("navegacionPagina"))
            }
            if (mueveNavegadorHaciaAtras === "Desactivado" && sentidoNavegacion === "Atras") {
                if (posicionRelativa === 1) {
                    inicioPaginacion = paginaActual - (9)
                }
                if (posicionRelativa > 1) {
                    inicioPaginacion = Number(document.querySelector("[posicionRelativa='1']").getAttribute("navegacionPagina"))
                }
            }
            if (cambiarPagina === "porNumeroDePagina") {
                inicioPaginacion = Number(document.querySelector("[posicionRelativa='1']").getAttribute("navegacionPagina"))
            }
            if (paginaActual > 1) {
                const navegacionPaginacionbotonAtras = document.createElement("a")
                navegacionPaginacionbotonAtras.classList.add("navegacionPaginacion")
                navegacionPaginacionbotonAtras.classList.add("navegacionPaginacionbotonAtras")
                navegacionPaginacionbotonAtras.setAttribute("boton", "atras")
                navegacionPaginacionbotonAtras.setAttribute("href", constructorURL(granuladoURL, (paginaActual - 1)))
                navegacionPaginacionbotonAtras.addEventListener("click", (e) => {
                    e.preventDefault()
                    return this.cambiarPagina({
                        gridUID: gridUID,
                        componenteID: "botonAtrasPaginacion",
                        paginaTipo: "otra",
                        metodoSalida,
                        e
                    });
                })
                navegacionPaginacionbotonAtras.textContent = "Atras"
                navegacionPaginacion.appendChild(navegacionPaginacionbotonAtras)
            } else {
                document.querySelector("[componenteID=botonAtrasPaginacion]")?.remove()
            }
            let numRedondeado
            if ((Math.floor(inicioPaginacion / 10) * 10) === inicioPaginacion) {
                numRedondeado = inicioPaginacion - 9
            } else {
                numRedondeado = (Math.floor(inicioPaginacion / 10) * 10) + 1;
            }
            for (let ciclo = 0; ciclo < 10; ciclo++) {
                const numeroPagina = numRedondeado + ciclo
                const numeroPaginaElemento = document.createElement("a")
                numeroPaginaElemento.classList.add("numeroPaginaElemento")
                numeroPaginaElemento.setAttribute("boton", "numero")
                numeroPaginaElemento.setAttribute("href", constructorURL(granuladoURL, numeroPagina))
                numeroPaginaElemento.setAttribute("posicionRelativa", ciclo + 1)
                const estructura = {
                    gridUID: gridUID,
                    componenteID: "numeroPagina",
                    numeroPagina: numeroPagina,
                    metodoSalida
                }
                if (numeroPagina === paginaActual) {
                    numeroPaginaElemento.style.background = "blue"
                    numeroPaginaElemento.style.color = "white"
                    estructura.paginaTipo = "actual"
                } else {
                    numeroPaginaElemento.style.removeProperty("color")
                    numeroPaginaElemento.style.removeProperty("background")
                    estructura.paginaTipo = "otra"
                }
                numeroPaginaElemento.addEventListener("click", (e) => {
                    e.preventDefault()
                    estructura.e = e
                    return this.cambiarPagina(estructura);
                })
                numeroPaginaElemento.textContent = numeroPagina
                if (numeroPagina <= paginasTotales) {
                    navegacionPaginacion.appendChild(numeroPaginaElemento)
                } else {
                    break
                }
            }
            const listaPaginacionResponsiva = document.createElement("select")
            listaPaginacionResponsiva.classList.add(
                "componentes_ui_paginador_listaResponsiva",
                "selector",
                "textoCentrado"
            )
            listaPaginacionResponsiva.addEventListener("change", (e) => {
                e.preventDefault()
                const elemento = e.target
                const selectedOption = elemento.options[elemento.selectedIndex];
                return this.cambiarPagina({
                    gridUID: gridUID,
                    componenteID: "numeroPagina",
                    numeroPagina: e.target.value,
                    paginaTipo: selectedOption.getAttribute("paginaTipo"),
                    metodoSalida,
                    e
                });
            })
            for (let ciclo = 1; ciclo < (paginasTotales + 1); ciclo++) {
                const numeroPagina = ciclo
                const numeroPaginaElemento = document.createElement("option")
                numeroPaginaElemento.setAttribute("numeroPagina", numeroPagina)
                numeroPaginaElemento.value = numeroPagina
                if (numeroPagina === paginaActual) {
                    numeroPaginaElemento.setAttribute("paginaTipo", "actual")
                    numeroPaginaElemento.style.background = "blue"
                    numeroPaginaElemento.style.color = "white"
                    numeroPaginaElemento.selected = true
                    numeroPaginaElemento.disabled = true
                } else {
                    numeroPaginaElemento.setAttribute("paginaTipo", "otra")
                    numeroPaginaElemento.style.removeProperty("color")
                    numeroPaginaElemento.style.removeProperty("background")
                }
                numeroPaginaElemento.textContent = "Página: " + numeroPagina
                listaPaginacionResponsiva.appendChild(numeroPaginaElemento)
            }
            navegacionPaginacion.appendChild(listaPaginacionResponsiva)
            if (paginasTotales > 1 && paginaActual < paginasTotales) {
                const navegacionPaginacionbotonAdelante = document.createElement("a")
                navegacionPaginacionbotonAdelante.classList.add("navegacionPaginacion")
                navegacionPaginacionbotonAdelante.setAttribute("boton", "adelante")
                navegacionPaginacionbotonAdelante.classList.add("navegacionPaginacionbotonAdelante")
                navegacionPaginacionbotonAdelante.setAttribute("href", constructorURL(granuladoURL, (paginaActual + 1)))
                navegacionPaginacionbotonAdelante.addEventListener("click", (e) => {
                    e.preventDefault()
                    return this.cambiarPagina({
                        gridUID: gridUID,
                        componenteID: "botonAdelantePaginacion",
                        paginaTipo: "otra",
                        metodoSalida,
                        e
                    })
                })
                navegacionPaginacionbotonAdelante.textContent = "Adelante"
                navegacionPaginacion.appendChild(navegacionPaginacionbotonAdelante)
            } else {
                document.querySelector("[componenteID=botonAdelantePaginacion]")?.remove()
            }
            document.querySelector("[componenteID=navegacionPaginacion]")?.remove()
            if (Number(paginasTotales) > 1) {
                document.querySelector(`[areaGrid="${gridUID}"] [contenedor=paginador]`).appendChild(navegacionPaginacion)
            }
        },
        ordenarPorColumna: async function (data, e) {
            const metodoSalida = data.metodoSalida
            const gridUID = data.gridUID
            const columna = data.columna
            const areaGrid = document.querySelector(`[areaGrid="${gridUID}"]`)
            const grid = areaGrid.querySelector(`[gridUID="${gridUID}"]`)
            const allColumns = areaGrid.querySelectorAll("[componenteGrid=celdaTituloColumna]")
            allColumns.forEach(aC => { aC.classList.remove("parpeoGridSel") })
            columna.classList.add("parpeoGridSel")
            const nombreColumna = columna.getAttribute("nombreColumna")
            const selectorColumnasentido = columna.getAttribute("sentidoColumna")
            const numeroPagina = grid.getAttribute("numeroPagina")
            const transaccion = {
                pagina: Number(numeroPagina),
                origen: "tituloColumna"
            }
            if (selectorColumnasentido === "ascendente") {
                transaccion.sentidoColumna = "descendente"
                transaccion.nombreColumna = nombreColumna
            }
            if (!selectorColumnasentido) {
                transaccion.sentidoColumna = "ascendente"
                transaccion.nombreColumna = nombreColumna
            }
            await casaVitini.utilidades.ejecutarFuncionPorNombreDinamicoConContexto({
                ruta: metodoSalida,
                args: transaccion
            })
            columna.classList.remove("parpeoGridSel")
        },
        resolverFila: function (transaccion) {
            transaccion.preventDefault()
            transaccion.stopPropagation()
            const servicioUID = transaccion.target.parentNode.getAttribute("href")
            const navegacion = {
                vista: servicioUID,
                tipoOrigen: "menuNavegador"
            }
            casaVitini.shell.navegacion.controladorVista(navegacion)
        },
        tarjetas: {
            selectorFiltro: {
                despliegue: function (data) {
                    const gridUID = data.gridUID
                    const columnas = data.columnas
                    const metodoSalida = data.metodoSalida
                    const columnaSeleccioanda = data?.columnaSeleccionada || null
                    const sentidoSeleccionado = data?.sentidoSeleccionado || null
                    const selectorFiltroOrden = document.querySelector(`[areaGrid="${gridUID}"]`).querySelector("[contenedor=filtrosOrden]")
                    const contenedo_selector = selectorFiltroOrden.querySelector("[contenedor=filtrosDesplegables]")
                    if (!contenedo_selector) {
                        const contenedorFiltrosOrden = document.createElement("div")
                        contenedorFiltrosOrden.setAttribute("contenedor", "filtrosDesplegables")
                        contenedorFiltrosOrden.classList.add(
                            "flexHorizontal",
                            "gap6"
                        )
                        const botonReseteo = document.createElement("div")
                        botonReseteo.classList.add(
                            "selector",
                            "textoCentrado",
                            "comportamientoBoton",
                            "noSelecionable",
                            "ratonDefault"
                        )
                        botonReseteo.textContent = "Resetear filtros"
                        botonReseteo.addEventListener("click", (e) => {
                            const contenedor = e.target.closest("[contenedor=filtrosOrden]")
                            const selectorColumna = contenedor.querySelector("[selector=ordenPorColumna]")
                            const selectorSentido = contenedor.querySelector("[selector=sentido]")
                            selectorColumna.selectedIndex = 0
                            selectorSentido.selectedIndex = 0
                            this.pasarela({
                                gridUID,
                                metodoSalida
                            })
                        })
                        contenedorFiltrosOrden.appendChild(botonReseteo)
                        const selectorColumna = document.createElement("select")
                        selectorColumna.setAttribute("selector", "ordenPorColumna")
                        selectorColumna.addEventListener("change", () => {
                            this.pasarela({
                                gridUID,
                                metodoSalida
                            })
                        })
                        selectorColumna.classList.add(
                            "selector",
                            "textoCentrado"
                        )
                        contenedorFiltrosOrden.appendChild(selectorColumna)
                        const opcionPreterminada = document.createElement("option");
                        opcionPreterminada.disabled = "true"
                        opcionPreterminada.value = ""
                        opcionPreterminada.text = "Ordenar por columna";
                        if (!columnaSeleccioanda) {
                            opcionPreterminada.selected = "true"
                        }
                        selectorColumna.add(opcionPreterminada)
                        columnas.forEach((columna) => {
                            const columnaUI = columna.columnaUI
                            const columnaIDV = columna.columnaIDV
                            const opcion = document.createElement("option");
                            opcion.value = columnaIDV;
                            opcion.text = columnaUI;
                            if (columnaSeleccioanda === columnaIDV) {
                                opcion.selected = "true"
                            }
                            selectorColumna.add(opcion);
                        })
                        const selectorSentido = document.createElement("select")
                        selectorSentido.setAttribute("selector", "sentido")
                        selectorSentido.addEventListener("change", () => {
                            this.pasarela({
                                gridUID,
                                metodoSalida
                            })
                        })
                        selectorSentido.classList.add(
                            "selector",
                            "textoCentrado"
                        )
                        contenedorFiltrosOrden.appendChild(selectorSentido)
                        const opcionSentido = document.createElement("option");
                        opcionSentido.disabled = "true"
                        opcionSentido.text = "Sentido";
                        opcionSentido.value = ""
                        if (!sentidoSeleccionado) {
                            opcionSentido.selected = "true"
                        }
                        selectorSentido.add(opcionSentido)
                        const sentidos = [
                            {
                                sentidoUI: "Ascendente",
                                sentidoIDV: "ascendente"
                            },
                            {
                                sentidoUI: "Descendente",
                                sentidoIDV: "descendente"
                            }
                        ]
                        sentidos.forEach((sentido) => {
                            const sentidoUI = sentido.sentidoUI
                            const sentidoIDV = sentido.sentidoIDV
                            const opcion = document.createElement("option");
                            opcion.value = sentidoIDV;
                            opcion.text = sentidoUI;
                            if (sentidoSeleccionado === sentidoIDV) {
                                opcion.selected = "true"
                            }
                            selectorSentido.add(opcion);
                        })
                        selectorFiltroOrden.appendChild(contenedorFiltrosOrden)
                    }
                    const contenedor_renderizado = selectorFiltroOrden.querySelector("[contenedor=filtrosDesplegables]")
                    const selectorOrdenPorColumna = contenedor_renderizado.querySelector("[selector=ordenPorColumna]")
                    const selectorSentido = contenedor_renderizado.querySelector("[selector=sentido]")
                    if (columnaSeleccioanda) {
                        selectorOrdenPorColumna.value = columnaSeleccioanda
                    } else {
                        selectorOrdenPorColumna.selectedIndex = 0
                    }
                    if (sentidoSeleccionado) {
                        selectorSentido.value = sentidoSeleccionado
                    } else {
                        selectorSentido.selectedIndex = 0
                    }
                },
                pasarela: function (data) {
                    const gridUID = data.gridUID
                    const metodoSalida = data.metodoSalida
                    const areaGrid = document.querySelector(`[areaGrid="${gridUID}"]`)
                    const contenedor = areaGrid.querySelector("[contenedor=filtrosOrden]")
                    const selectorColumna = contenedor.querySelector("[selector=ordenPorColumna]").value
                    const selectorSentido = contenedor.querySelector("[selector=sentido]").value
                    const numeroPagina = areaGrid.querySelector(`[gridUID="${gridUID}"]`).getAttribute("numeroPagina")
                    const transaccion = {
                        pagina: Number(numeroPagina),
                        origen: "tituloColumna",
                        granuladoURL: casaVitini.utilidades.granuladorURL()
                    }
                    if (selectorSentido) {
                        transaccion.sentidoColumna = selectorSentido
                    }
                    if (selectorColumna) {
                        transaccion.nombreColumna = selectorColumna
                    }
                    return casaVitini.utilidades.ejecutarFuncionPorNombreDinamicoConContexto({
                        ruta: metodoSalida,
                        args: transaccion
                    })
                }
            },
            constructorTarjetas: function (data) {
                const columnasGrid = data.columnasGrid
                const filas = data.filas
                const gridUID = data.gridUID
                const mascaraURL = data.mascaraURL
                const columnasAceptadas = columnasGrid.map((columna) => {
                    return columna.columnaIDV
                })
                const diccionarioColumnas = {}
                columnasGrid.forEach(c => {
                    const columnaIDV = c.columnaIDV
                    const columnaUI = c.columnaUI
                    diccionarioColumnas[columnaIDV] = columnaUI
                })
                const contenedorTarjetas = document.querySelector("[contenedor=tarjetas]")
                contenedorTarjetas?.remove()
                const contenedor = document.createElement("div")
                contenedor.setAttribute("contenedor", "tarjetas")
                contenedor.classList.add(
                    "gap6"
                )
                document.querySelector(`[areaGrid="${gridUID}"]`)
                    .querySelector(`[contenedor=resultados]`)
                    .appendChild(contenedor)
                filas.forEach(fila => {
                    const tarjeta = document.createElement("a")
                    tarjeta.setAttribute("componente", "tarjeta")
                    tarjeta.classList.add(
                        "flexVertical",
                        "gap6",
                        "tarjeta",
                        "borderRadius10",
                        "backgroundGrey1",
                        "padding10",
                        "areaSinDecoracionPredeterminada",
                        "ratonDefault",
                        "comportamientoBoton"
                    )
                    tarjeta.href = mascaraURL?.mascara + fila[mascaraURL?.parametro]
                    tarjeta.setAttribute("vista", mascaraURL?.mascara + fila[mascaraURL?.parametro])
                    tarjeta.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                    contenedor.appendChild(tarjeta)
                    Object.entries(fila).forEach(([dataIDV, data]) => {
                        if (columnasAceptadas.includes(dataIDV)) {
                            const contenedor = document.createElement("div")
                            contenedor.classList.add(
                                "flexVertical"
                            )
                            tarjeta.appendChild(contenedor)
                            const titulo = document.createElement("div")
                            titulo.innerHTML = diccionarioColumnas[dataIDV]
                            contenedor.appendChild(titulo)
                            const dataUI = document.createElement("div")
                            dataUI.classList.add(
                                "negrita",
                                "textoElipsis"
                            )
                            dataUI.textContent = data || "(Sin datos)"
                            contenedor.appendChild(dataUI)
                        }
                    })
                })
            },
        },
        css: async function () {
            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "componentes/obtenerComponente",
                componente: "/grid"
            })
            if (respuestaServidor?.error) {
                return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
            } else if (respuestaServidor?.ok) {
                const css = respuestaServidor.css
                const cssContainer = document.createElement("style")
                cssContainer.textContent = css
                return cssContainer
            }
        },
    },

}