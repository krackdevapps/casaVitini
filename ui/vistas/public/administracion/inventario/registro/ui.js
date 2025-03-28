casaVitini.view = {
    start: function () {
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const parametros = granuladoURL.parametros

        if (parametros?.registro_en_detalle) {
            this.registroEnDetalle.start({
                registroUID: parametros.registro_en_detalle
            })
        } else {
            this.registros.start()
        }
    },
    registros: {
        start: function () {
            const granuladoURL = casaVitini.utilidades.granuladorURL()
            const parametroBuscar = granuladoURL.parametros.buscar
            const main = document.querySelector("main")
            const selectorInventarioUI = main.querySelector("[ui=registros]")
            const campoBuscador = selectorInventarioUI.querySelector("[campo=buscador]")
            campoBuscador.addEventListener("input", (e) => { casaVitini.view.buscadorPorCampo(e) })
            campoBuscador.value = decodeURI(parametroBuscar)

            const parametrosFormatoURL = granuladoURL.parametros
            const parametrosFormatoIDV = {}
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

            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const main = document.querySelector("main")
            main.querySelector("[ui=registroEnDetalle]").classList.add("ocultoInicial")
            const selectorInventarioUI = main.querySelector("[ui=registros]")
            selectorInventarioUI.classList.remove("ocultoInicial")

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
            if ((nombreColumna)?.toLowerCase() === "operacionidv") {
                nombreColumnaURL = "operacion"
            } else if (nombreColumna) {
                nombreColumnaURL = casaVitini.utilidades.cadenas.camelToSnake(nombreColumna)
            }

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/inventario/buscadorRegistroInventario",
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
            if (respuestaServidor.totalClientes === 0) {
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
                const operacionIDV = e.operacionIDV
                if (operacionIDV === "elementoCreado") {
                    e.operacionIDV = "Elemento creado"
                } else if (operacionIDV === "cantidadActualizadaDesdeInventario") {
                    e.operacionIDV = "Cantidad actualizada desde el inventario"
                }

            })

            const columnasGrid = [
                // {
                //     columnaUI: "UID",
                //     columnaIDV: "uid",
                // },
                // {
                //     columnaUI: "Elemento UID",
                //     columnaIDV: "elementoUID",
                // },
                {
                    columnaUI: "Nombre",
                    columnaIDV: "nombre",
                },
                {
                    columnaUI: "Cantidad en movimiento",
                    columnaIDV: "cantidadEnMovimiento",
                },
                {
                    columnaUI: "Fecha",
                    columnaIDV: "fecha",
                },
                {
                    columnaUI: "Operacion",
                    columnaIDV: "operacionIDV",
                },

                // {
                //     columnaUI: "Información",
                //     columnaIDV: "mensajeUI",
                // }
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
                metodoSalida: "view.registros.mostrarElementosResueltos",
                configuracionGrid: {
                    filas: elementos,
                    almacen: {
                        buscar: buscar,
                    },
                    sentidoColumna: sentidoColumna,
                    nombreColumna: nombreColumna,
                    pagina: pagina,
                    destino: "[ui=registros] [contenedor=lista]",
                    columnasGrid: columnasGrid,
                    gridUID: "gridElementosIventario",
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
                componenteExistente: "zonaNavegacionPaginadaRegistroGeneral",
                funcionPersonalizada: "view.registros.mostrarElementosResueltos",
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
        buscadorPorCampo: async function (cliente) {

            const instanciaUID = document.querySelector("main[instanciaUID]").getAttribute("instanciaUID")
            const campo = document.querySelector("[componente=zonaNavegacionPaginadaClientes]")
            const main = document.querySelector("main")
            const selectorInventarioUI = main.querySelector("[ui=registros]")
            const terminoBusqueda = cliente.target.value
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

            const campoVacio = cliente.target.value.length
            if (campoVacio === 0) {
                estadoBusqueda_s.textContent = "Mostrando todos los elementos en el iventario..."
                clearTimeout(casaVitini.componentes.temporizador);
                const granuladoURL = casaVitini.utilidades.granuladorURL()
                selectorInventarioUI.querySelector("[areaGrid=gridElementosIventario]")?.remove()
                const titulo = "casavitini"
                const estado = casaVitini.view.navegacion.estadoInicial
                const url = "/administracion/inventario/registro"
                if (url !== granuladoURL.raw.toLocaleLowerCase()) {
                    window.history.pushState(estado, titulo, "/administracion/inventario/registro");
                }

            }
            clearTimeout(casaVitini.componentes.temporizador);
            casaVitini.componentes.temporizador = setTimeout(async () => {
                const transaccion = {
                    zona: "administracion/inventario/buscadorRegistroInventario",
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
                zona: "administracion/inventario/registro",
                EstadoInternoZona: "estado",
                tipoCambio: "parcial",
                componenteExistente: "zonaNavegacionPaginadaRegistroGeneral",
                funcionPersonalizada: "view.registros.mostrarElementosResueltos",
                args: {}
            }
        },
        constructorMarcoInfo: function () {
            const main = document.querySelector("main")
            const selectorInventarioUI = main.querySelector("[ui=registros]")

            const campo = selectorInventarioUI.querySelector("[componente=zonaNavegacionPaginadaRegistroGeneral]")

            const estadoBusquedaUI = document.createElement("div")
            estadoBusquedaUI.classList.add("botonV1BlancoIzquierda_noSeleccionable", "textoCentrado")
            estadoBusquedaUI.setAttribute("componente", "estadoBusqueda")
            estadoBusquedaUI.textContent = "Buscando..."
            const comRenderizado = selectorInventarioUI.querySelector("[componente=estadoBusqueda]")
            if (!comRenderizado) {
                campo.parentNode.insertBefore(estadoBusquedaUI, campo.nextSibling);
            }

        },
        navegacion: {
            estadoInicial: {
                zona: "administracion/inventario/registro",
                EstadoInternoZona: "estado",
                tipoCambio: "parcial",
                componenteExistente: "zonaNavegacionPaginadaRegistroGeneral",
                funcionPersonalizada: "view.registros.mostrarElementosResueltos",
                args: {}
            }
        },
    },
    registroEnDetalle: {
        start: async function (data) {

            const registroUID = data.registroUID
            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()

            const main = document.querySelector("main")
            main.classList.add("flextJustificacion_center")
            const spinner = casaVitini.ui.componentes.spinnerSimple()
            main.appendChild(spinner)

            main.querySelector("[ui=registros]").classList.add("ocultoInicial")
            const uiSelector = main.querySelector("[ui=registroEnDetalle]")

            uiSelector.setAttribute("instanciaUID", instanciaUID)

            const botonIrAlElemento = uiSelector.querySelector("[boton=irAlElemento]")
            const botonRevertir = uiSelector.querySelector("[boton=revertir]")

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/inventario/detallesDelRegistroDelInventario",
                registroUID: registroUID,
            })
            spinner.remove()
            main.classList.remove("flextJustificacion_center")

            const instanciaRenderizada = uiSelector.getAttribute(`instanciaUID`)


            if (instanciaRenderizada !== instanciaUID) { return }
            if (respuestaServidor?.error) {
                const uiSelector = main.querySelector("[ui=sinRegistro]")
                uiSelector.classList.remove("ocultoInicial")

                const infoUI = document.createElement("p")
                infoUI.classList.add("padding10")
                infoUI.textContent = respuestaServidor.error
                uiSelector.appendChild(infoUI)


                const botonVolverAlInventario = document.createElement("a")
                botonVolverAlInventario.classList.add("botonV1BlancoIzquierda")
                botonVolverAlInventario.textContent = "Volver al registro del inventario"
                botonVolverAlInventario.hred = "/administracion/inventario/registro"

                botonVolverAlInventario.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                uiSelector.appendChild(botonVolverAlInventario)

                return
            }
            if (respuestaServidor.ok) {
                const registro = respuestaServidor.registro

                const cantidadEnMovimiento = registro.cantidadEnMovimiento
                const elementoUID = registro.elementoUID
                const nombre = registro.nombre
                const fecha = registro.fecha
                const sentidoMovimiento = registro.sentidoMovimiento
                const operacionIDV = registro.operacionIDV
                const operacionUI = registro.operacionUI
                const definicion = registro.definicion

                const uid = registro.uid

                uiSelector.querySelector("[data=nombre]").textContent = nombre
                uiSelector.querySelector("[data=elementoUID]").textContent = elementoUID
                uiSelector.querySelector("[data=operacionUI]").textContent = operacionUI
                uiSelector.querySelector("[data=fecha]").textContent = fecha
                uiSelector.querySelector("[data=definicion]").textContent = definicion
                uiSelector.querySelector("[data=uid]").textContent = uid
                uiSelector.querySelector("[data=sentidoMovimiento]").textContent = sentidoMovimiento.charAt(0).toUpperCase() + sentidoMovimiento.slice(1);
                uiSelector.querySelector("[data=cantidadEnMovimiento]").textContent = cantidadEnMovimiento

                botonIrAlElemento.href = `/administracion/inventario/ver_todo_el_inventario/elemento:${elementoUID}`

                botonIrAlElemento.removeEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                botonIrAlElemento.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)

                botonRevertir.addEventListener("click", () => {

                    this.eliminarRegistroRevertir.ui({
                        uid,
                        nombre,
                        sentidoMovimiento,
                        cantidadEnMovimiento,
                        elementoUID
                    })
                })
                uiSelector.classList.remove("ocultoInicial")

            }
        },
        eliminarRegistroRevertir: {
            ui: async function (data) {

                const uid = data.uid
                const nombre = data.nombre
                const cantidadEnMovimiento = data.cantidadEnMovimiento
                const sentidoMovimiento = data.sentidoMovimiento
                const elementoUID = data.elementoUID

                const sentidoDeELiminacion = (sentido) => {
                    if (sentido === "insertar") {
                        return "extraera"
                    } else if (sentido === "extraer") {
                        return "insertara"
                    }
                }

                const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

                const titulo = constructor.querySelector("[componente=titulo]")
                titulo.textContent = `Eliminar fila del registro del elemento ${nombre} irreversiblemente`
                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                mensaje.textContent = `Confirmas eliminar el registro con identificador ${uid} del elemento en el inventario ${nombre}. Al eliminar este registro se producirá una reversión del movimiento registrado. Esta reversión ${sentidoDeELiminacion(sentidoMovimiento)} ${cantidadEnMovimiento} en el inventario`

                const botonAceptar = constructor.querySelector("[boton=aceptar]")
                botonAceptar.textContent = `Comfirmar y eliminar la fila del registro`
                botonAceptar.addEventListener("click", () => {
                    this.confirmar({
                        uid,
                        nombre,
                        elementoUID
                    })
                })
                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                botonCancelar.textContent = "Cancelar y volver"
                document.querySelector("main").appendChild(pantallaInmersiva)
            },
            confirmar: async function (data) {

                const uid = data.uid
                const nombre = data.nombre
                const elementoUID = data.elementoUID
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = `Eliminado fila del registro ${uid} del elemento ${nombre}...`
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/inventario/eliminarFilaRegistroDelElemento",
                    uid
                }
                )
                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }

                if (respuestaServidor?.error) {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    await casaVitini.shell.navegacion.controladorVista({
                        vista: `/administracion/inventario/ver_todo_el_inventario/elemento:${elementoUID}/zona:inventario`,
                        tipoOrigen: "menuNavegador"
                    })

                }

            },
        },
    }
}