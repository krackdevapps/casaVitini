casaVitini.view = {
    start: function () {
        const granuladorURL = casaVitini.utilidades.granuladorURL()
        const parametros = granuladorURL.parametros

        if (parametros?.registro) {
            this.detallesDelRegistro.portada.arranque({
                registroUID: parametros?.registro
            })
        } else {
            this.registroGlobal.arranque()
        }
    },
    registroGlobal: {
        arranque: function () {
            const granuladoURL = casaVitini.utilidades.granuladorURL()
            const parametroBuscar = granuladoURL.parametros.buscar || ""
            const main = document.querySelector("main")

            const marcoElasticoRelativo = casaVitini.view.shared.marcoElasticoRelativo()
            main.appendChild(marcoElasticoRelativo)

            const contenedor = casaVitini.ui.componentes.constructorElemento({
                tipoElemento: "div",
                classList: ["flexVertical", "gap10"]
            })
            marcoElasticoRelativo.appendChild(contenedor)

            const titulo = casaVitini.ui.componentes.constructorElemento({
                tipoElemento: "a",
                textContent: "Registro global",
                classList: ["colorGris", "negrita", "textoCentrado"]
            })
            contenedor.appendChild(titulo)

            const campoBuscador = casaVitini.ui.componentes.constructorElemento({
                tipoElemento: "input",
                textContent: "Registro global",
                atributos: {
                    text: "text",
                    campo: "buscador",
                    placeholder: "Buscar en todo el registro",
                    componente: "zonaNavegacionRegistroGlobal"
                }
            })

            campoBuscador.addEventListener("input", (e) => { casaVitini.view.registroGlobal.buscadorPorCampo(e) })
            campoBuscador.value = decodeURI(parametroBuscar)
            contenedor.appendChild(campoBuscador)

            const lista = casaVitini.ui.componentes.constructorElemento({
                tipoElemento: "div",
                atributos: {
                    contenedor: "lista",
                }
            })
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
                zona: "administracion/registro/buscador",
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
                {
                    columnaUI: "UID",
                    columnaIDV: "uid",
                },
                {
                    columnaUI: "Usuario",
                    columnaIDV: "usuario",
                },
                {
                    columnaUI: "Fecha",
                    columnaIDV: "fecha",
                },

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
                metodoSalida: "view.registroGlobal.mostrarElementosResueltos",
                configuracionGrid: {
                    filas: elementos,
                    almacen: {
                        buscar: buscar,
                    },
                    sentidoColumna: sentidoColumna,
                    nombreColumna: nombreColumna,
                    pagina: pagina,
                    destino: "[contenedor=lista]",
                    columnasGrid: columnasGrid,
                    gridUID: "gridRegistroGlobal",
                    mascaraURL: {
                        mascara: "/administracion/registro/registro:",
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
                componenteExistente: "zonaNavegacionRegistroGlobal",
                funcionPersonalizada: "view.verTodoInvregistroGlobalentario.mostrarElementosResueltos",
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

            const terminoBusqueda = e.target.value
            //   document.querySelector("[componente=estadoBusqueda]")?.remove()
            main.querySelector("[areaGrid=gridElementosIventario]")?.remove()
            main.querySelector("[componenteID=navegacionPaginacion]")?.remove()
            main.querySelector("[contenedor=filtrosOrden]")?.remove()


            const estadoBusqueda_r = main.querySelector("[componente=estadoBusqueda]")
            if (!estadoBusqueda_r) {
                this.constructorMarcoInfo()
            }
            const estadoBusqueda_s = main.querySelector("[componente=estadoBusqueda]")
            estadoBusqueda_s.textContent = "Buscando elementos en el regsitro global..."

            const campoVacio = e.target.value.length
            if (campoVacio === 0) {
                estadoBusqueda_s.textContent = "Mostrando todos los elementos del registro global..."
                clearTimeout(casaVitini.componentes.temporizador);
                const granuladoURL = casaVitini.utilidades.granuladorURL()
                main.querySelector("[areaGrid=gridElementosIventario]")?.remove()
                const titulo = "casavitini"
                const estado = casaVitini.view.registroGlobal.navegacion.estadoInicial
                const url = "/administracion/registro"
                if (url !== granuladoURL.raw.toLocaleLowerCase()) {
                    window.history.pushState(estado, titulo, "/administracion/registro");
                }

            }
            clearTimeout(casaVitini.componentes.temporizador);
            casaVitini.componentes.temporizador = setTimeout(async () => {
                const transaccion = {
                    zona: "administracion/registro/buscador",
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
                zona: "administracion/regsitro",
                EstadoInternoZona: "estado",
                tipoCambio: "parcial",
                componenteExistente: "zonaNavegacionRegistroGlobal",
                funcionPersonalizada: "view.registroGlobal.mostrarElementosResueltos",
                args: {}
            }
        },
        constructorMarcoInfo: function () {
            const main = document.querySelector("main")

            const campo = main.querySelector("[componente=zonaNavegacionRegistroGlobal]")

            const estadoBusquedaUI = document.createElement("div")
            estadoBusquedaUI.classList.add("botonV1BlancoIzquierda_noSeleccionable", "textoCentrado")
            estadoBusquedaUI.setAttribute("componente", "estadoBusqueda")
            estadoBusquedaUI.textContent = "Buscando..."
            const comRenderizado = main.querySelector("[componente=estadoBusqueda]")
            if (!comRenderizado) {
                campo.parentNode.insertBefore(estadoBusquedaUI, campo.nextSibling);
            }

        },
    },
    detallesDelRegistro: {
        portada: {
            arranque: async function (data) {

                const registroUID = data.registroUID
                const main = document.querySelector("main")
                main.classList.add("flextJustificacion_center")

                const spinner = casaVitini.ui.componentes.spinnerSimple()
                main.appendChild(spinner)

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/registro/obtenerDetallesDelRegistro",
                    uid: registroUID
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
                    const registro = respuestaServidor.registro
                    const uid = registro.uid
                    const usuario = registro.usuario
                    const operacionUI = registro.operacionUI
                    const fecha = registro.fecha
                    const ip = registro.ip
                    const userAgent = registro.userAgent



                    const marcoElasticoRelativo = casaVitini.view.shared.marcoElasticoRelativo()
                    main.appendChild(marcoElasticoRelativo)

                    const contenedor = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "div",
                        classList: ["flexVertical", "gap10"]
                    })
                    marcoElasticoRelativo.appendChild(contenedor)

                    const titulo = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "a",
                        textContent: "Detalles del registro",
                        classList: ["colorGris", "negrita", "textoCentrado"]
                    })
                    marcoElasticoRelativo.appendChild(titulo)

                    const contenedorUsuario = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "div",
                        classList: ["flexVertical", "gap4"]
                    })
                    marcoElasticoRelativo.appendChild(contenedorUsuario)


                    const tituloUsuario = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "p",
                        textContent: "Usuario",
                        classList: ["negrita"]
                    })
                    contenedorUsuario.appendChild(tituloUsuario)

                    const usuarioRegistro = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "p",
                        textContent: usuario,
                    })
                    contenedorUsuario.appendChild(usuarioRegistro)


                    const contenedorFecha = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "div",
                        classList: ["flexVertical", "gap4"]
                    })
                    marcoElasticoRelativo.appendChild(contenedorFecha)


                    const tituloFecha = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "p",
                        textContent: "Fecha del registro",
                        classList: ["negrita"]
                    })
                    contenedorFecha.appendChild(tituloFecha)

                    const fechaRegistro = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "p",
                        textContent: fecha,
                    })
                    contenedorFecha.appendChild(fechaRegistro)


                    const contenedorIP = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "div",
                        classList: ["flexVertical", "gap4"]
                    })
                    marcoElasticoRelativo.appendChild(contenedorIP)


                    const tituloIP = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "p",
                        textContent: "IP",
                        classList: ["negrita"]
                    })
                    contenedorIP.appendChild(tituloIP)

                    const ipRegistro = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "p",
                        textContent: ip,
                    })
                    contenedorIP.appendChild(ipRegistro)

                    const contenedorNavegador = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "div",
                        classList: ["flexVertical", "gap4"]
                    })
                    marcoElasticoRelativo.appendChild(contenedorNavegador)

                    const tituloNavegador = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "p",
                        textContent: "Navegador (Este dato puede manipularse)",
                        classList: ["negrita"]
                    })
                    contenedorNavegador.appendChild(tituloNavegador)

                    const navegadorRegistro = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "p",
                        textContent: userAgent,
                    })
                    contenedorNavegador.appendChild(navegadorRegistro)



                    const tituloPayLOad = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "p",
                        textContent: "Carga útil de la operación",
                        classList: ["negrita"]
                    })
                    marcoElasticoRelativo.appendChild(tituloPayLOad)

                    const operacion = JSON.parse(operacionUI)


                    function recorrerRegistroRecursivoNodo(registro) {
                        const fragmento = document.createDocumentFragment(); // Para mejorar el rendimiento

                        for (const clave in registro) {
                            if (registro.hasOwnProperty(clave)) {
                                const valor = registro[clave];

                                if (typeof valor === 'object' && valor !== null) {
                                    const details = casaVitini.ui.componentes.constructorElemento({
                                        tipoElemento: "details",
                                        classList: ["flexVertical", "padding6"]
                                    })
                                    fragmento.appendChild(details);

                                    const summary = casaVitini.ui.componentes.constructorElemento({
                                        tipoElemento: "summary",
                                        classList: ["flexVertical", "gap6", "padding10", "negrita"],
                                        textContent: clave
                                    })
                                    details.appendChild(summary);

                                    const contenedorAninado = casaVitini.ui.componentes.constructorElemento({
                                        tipoElemento: "div",
                                        classList: ["flexVertical", "gap6"],
                                        textContent: clave
                                    })
                                    details.appendChild(contenedorAninado);

                                    // Recursión para agregar contenido dentro del <details>
                                    const contenidoAnidado = recorrerRegistroRecursivoNodo(valor);
                                    contenedorAninado.appendChild(contenidoAnidado);

                                } else {
                                    // // Crear un <div> para valores primitivos
                                    // const div = document.createElement('div');
                                    // div.textContent = `${clave}: ${valor}`;
                                    // fragmento.appendChild(div);

                                    const cPL = casaVitini.ui.componentes.constructorElemento({
                                        tipoElemento: "div",
                                        classList: ["flexHorizontal", "gap4"]
                                    })
                                    fragmento.appendChild(cPL)


                                    const llaveUI = casaVitini.ui.componentes.constructorElemento({
                                        tipoElemento: "div",
                                        classList: ["negrita"],
                                        textContent: clave
                                    })
                                    cPL.appendChild(llaveUI)

                                    const valorUI = casaVitini.ui.componentes.constructorElemento({
                                        tipoElemento: "div",
                                        textContent: valor
                                    })
                                    cPL.appendChild(valorUI)
                                }
                            }
                        }
                        return fragmento;
                    }
                    const htmlGenerado = recorrerRegistroRecursivoNodo(operacion);
                    marcoElasticoRelativo.appendChild(htmlGenerado)

                }
            }
        },
        eliminarRegistro: {
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