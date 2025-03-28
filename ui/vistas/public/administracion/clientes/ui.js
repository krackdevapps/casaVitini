casaVitini.view = {
    start: async function () {
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const comandoInicial = granuladoURL.directorios[granuladoURL.directorios.length - 1]
        const main = document.querySelector("main")
        const instanciaUID = main.getAttribute("instanciaUID")
        const parametroBuscar = granuladoURL.parametros.buscar
        const parametros = granuladoURL.parametros
        const rawArray = granuladoURL.rawArray

        if (Object.keys(parametros).length === 0) {

            main.setAttribute("zonaCSS", "administracion/clientes/buscador")
            this.buscador.buscadorUI()
        } else if (parametros.buscar) {


            main.setAttribute("zonaCSS", "administracion/clientes/buscador")
            this.buscador.buscadorUI()
            if (!granuladoURL.parametros.buscar) {
                return
            }

            const campoBuscador = document.querySelector("[componenteCampo=buscadorPorId]")
            campoBuscador.value = decodeURI(parametroBuscar)

            const parametrosFormatoURL = granuladoURL.parametros
            const parametrosFormatoIDV = {}
            Object.entries(parametrosFormatoURL).forEach(([nombreParametroURL, valorParametroURL]) => {
                const nombreParametroIDV = casaVitini.utilidades.cadenas.snakeToCamel(nombreParametroURL)
                let nombreColumnaIDV
                if ((valorParametroURL)?.toLowerCase() === "cliente_uid") {
                    nombreColumnaIDV = "clienteUID"
                } else if (valorParametroURL) {
                    nombreColumnaIDV = casaVitini.utilidades.cadenas.snakeToCamel(valorParametroURL)
                } else if ((nombreParametroIDV)?.toLowerCase() === "buscar") {
                    valorParametroURL = decodeURI(valorParametroURL)
                }
                parametrosFormatoIDV[nombreParametroIDV] = nombreColumnaIDV
            })
            parametrosFormatoIDV.buscar = decodeURI(parametrosFormatoIDV.buscar)
            this.buscador.mostrarClientesResueltos(parametrosFormatoIDV)
        } else if (parametros.cliente && comandoInicial === "editar") {

            main.setAttribute("zonaCSS", "administracion/clientes/editar")
            await this.detallesCliente.editar.UI()
        } else if (parametros.cliente) {

            const clienteUID = parametros.cliente
            await this.detallesCliente.portada.UI(clienteUID)
            main.setAttribute("zonaCSS", "administracion/clientes/detalles")

            const parametrosFormatoURL = granuladoURL.parametros
            const parametrosFormatoIDV = {}
            Object.entries(parametrosFormatoURL).forEach(([nombreParametroURL, valorParametroURL]) => {
                const nombreParametroIDV = casaVitini.utilidades.cadenas.snakeToCamel(nombreParametroURL)
                let nombreColumnaIDV
                if ((valorParametroURL)?.toLowerCase() === "reserva_uid") {
                    nombreColumnaIDV = "reservaUID"
                } else if (valorParametroURL) {
                    nombreColumnaIDV = casaVitini.utilidades.cadenas.snakeToCamel(valorParametroURL)
                }
                parametrosFormatoIDV[nombreParametroIDV] = nombreColumnaIDV

            })
            parametrosFormatoIDV.clienteUID = parametros.cliente
            await this.detallesCliente.portada.mostrarReservasDelClienteResueltas(parametrosFormatoIDV)
        }
    },
    buscador: {
        buscadorUI: function () {
            const espacioClientes = document.querySelector("[componente=espacioClientes]")

            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add("clientes_contenedorBotones")
            const botonCrearCuenta = document.createElement("a")
            botonCrearCuenta.classList.add("botonV1")
            botonCrearCuenta.setAttribute("href", "/administracion/clientes/nuevo")

            botonCrearCuenta.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            botonCrearCuenta.textContent = "Crear nuevo cliente"
            contenedorBotones.appendChild(botonCrearCuenta)
            espacioClientes.appendChild(contenedorBotones)

            const campoBuscador = document.createElement("input")
            campoBuscador.classList.add("botonV1BlancoIzquierda_campo")
            campoBuscador.setAttribute("componente", "zonaNavegacionPaginadaClientes")
            campoBuscador.setAttribute("componenteCampo", "buscadorPorId")
            campoBuscador.setAttribute("placeholder", "Busque un cliente por nombre, por cualquier dato.")
            campoBuscador.addEventListener("input", (e) => { casaVitini.view.buscador.buscadorClientesPorCampo(e) })
            espacioClientes.appendChild(campoBuscador)



        },
        constructorMarcoInfo: function () {
            const campo = document.querySelector("[componente=zonaNavegacionPaginadaClientes]")

            const estadoBusquedaUI = document.createElement("div")
            estadoBusquedaUI.classList.add("botonV1BlancoIzquierda_noSeleccionable", "textoCentrado")
            estadoBusquedaUI.setAttribute("componente", "estadoBusqueda")
            estadoBusquedaUI.textContent = "Buscando..."
            const comRenderizado = document.querySelector("[componente=estadoBusqueda]")
            if (!comRenderizado) {
                campo.parentNode.insertBefore(estadoBusquedaUI, campo.nextSibling);
            }

        },
        buscadorClientesPorCampo: async function (cliente) {

            const instanciaUID = document.querySelector("main[instanciaUID]").getAttribute("instanciaUID")
            const campo = document.querySelector("[componente=zonaNavegacionPaginadaClientes]")
            const terminoBusqueda = cliente.target.value
            //   document.querySelector("[componente=estadoBusqueda]")?.remove()
            document.querySelector("[areaGrid=gridClientes]")?.remove()
            document.querySelector("[componenteID=navegacionPaginacion]")?.remove()
            document.querySelector("[contenedor=filtrosOrden]")?.remove()


            const estadoBusqueda_r = document.querySelector("[componente=estadoBusqueda]")
            if (!estadoBusqueda_r) {
                this.constructorMarcoInfo()
            }
            const estadoBusqueda_s = document.querySelector("[componente=estadoBusqueda]")
            estadoBusqueda_s.textContent = "Buscando clientes..."

            const campoVacio = cliente.target.value.length
            if (campoVacio === 0) {
                clearTimeout(casaVitini.componentes.temporizador);
                const granuladoURL = casaVitini.utilidades.granuladorURL()
                document.querySelector("[componente=estadoBusqueda]")?.remove()
                document.querySelector("[areaGrid=gridClientes]")?.remove()
                const titulo = "casavitini"
                const estado = casaVitini.view.navegacion.estadoInicial
                const url = "/administracion/clientes"



                if (url !== granuladoURL.raw.toLocaleLowerCase()) {

                    window.history.pushState(estado, titulo, "/administracion/clientes");
                }
                return;
            }
            clearTimeout(casaVitini.componentes.temporizador);
            casaVitini.componentes.temporizador = setTimeout(async () => {
                const transaccion = {
                    zona: "administracion/clientes/buscar",
                    pagina: 1,
                    buscar: terminoBusqueda,
                    origen: "botonMostrarClientes",
                    tipoConstruccionGrid: "total",
                    instanciaUID: instanciaUID
                }


                this.mostrarClientesResueltos(transaccion)
            }, 1500);
        },
        mostrarClientesResueltos: async function (transaccion) {
            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const selectorEspacio = document.querySelector("[componente=espacioComportamiento]")
            if (!selectorEspacio) { return }

            selectorEspacio.setAttribute("instanciaBusqueda", instanciaUID)

            delete transaccion.instanciaUID
            const origen = transaccion.origen
            delete transaccion.origen
            const granuladoURL = casaVitini.utilidades.granuladorURL()
            const paginaTipo = transaccion.paginaTipo

            const busquedaInicial = transaccion?.buscar //|| almacen?.buscar
            const campoBusqueda = document.querySelector("[componenteCampo=buscadorPorId]")

            if (!busquedaInicial) {
                document.querySelector("[componente=estadoBusqueda]")?.remove()
                document.querySelector("[areaGrid=gridClientes]")?.remove()
                campoBusqueda.value = null
                return
            }
            let nombreColumnaURL
            const nombreColumna = transaccion.nombreColumna
            if ((nombreColumna)?.toLowerCase() === "clienteuid") {
                nombreColumnaURL = "cliente_uid"
            } else if (nombreColumna) {
                nombreColumnaURL = casaVitini.utilidades.cadenas.camelToSnake(nombreColumna)
            }

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/clientes/buscar",
                buscar: busquedaInicial,
                nombreColumna: transaccion.nombreColumna,
                sentidoColumna: transaccion.sentidoColumna,
                pagina: Number(transaccion?.pagina || 1)
            })

            const instanciaRenderizada = document.querySelector(`[instanciaBusqueda="${instanciaUID}"]`)
            if (!instanciaRenderizada) { return }
            if (respuestaServidor?.error) {
                this.constructorMarcoInfo()
                document.querySelector("[componente=estadoBusqueda]").textContent = respuestaServidor?.error
                return
            }
            if (respuestaServidor.totalClientes === 0) {
                this.constructorMarcoInfo()
                document.querySelector("[componente=estadoBusqueda]").textContent = "No se han encontrado clientes"
                return
            }
            document.querySelector("[componente=estadoBusqueda]")?.remove()
            const clientes = respuestaServidor.clientes
            const buscar = respuestaServidor.buscar
            const paginasTotales = respuestaServidor.paginasTotales
            const pagina = respuestaServidor.pagina
            const sentidoColumna = respuestaServidor.sentidoColumna
            campoBusqueda.value = buscar

            const columnasGrid = [
                {
                    columnaUI: "UID",
                    columnaIDV: "clienteUID",
                },
                {
                    columnaUI: "Nombre",
                    columnaIDV: "nombre",
                },
                {
                    columnaUI: "Primer apellido",
                    columnaIDV: "primerApellido",
                },
                {
                    columnaUI: "Segundo Apellido",
                    columnaIDV: "segundoApellido",
                },
                {
                    columnaUI: "Pasaporte",
                    columnaIDV: "pasaporte",
                },
                {
                    columnaUI: "Teléfono",
                    columnaIDV: "telefono",
                },
                {
                    columnaUI: "Mail",
                    columnaIDV: "mail",
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
                estructuraParametrosFinales.push(estructura)
            }
            let parametrosURLFInal = ""
            if (estructuraParametrosFinales.length > 0) {
                parametrosURLFInal = "/" + estructuraParametrosFinales.join("/")
            }

            const constructorURLFinal = encodeURI(granuladoURL.directoriosFusion + parametrosURLFInal)
            casaVitini.view.__sharedMethods__.grid.despliegue({
                metodoSalida: "view.buscador.mostrarClientesResueltos",
                configuracionGrid: {
                    filas: clientes,
                    almacen: {
                        buscar: buscar,
                    },
                    sentidoColumna: sentidoColumna,
                    nombreColumna: nombreColumna,
                    pagina: pagina,
                    destino: "[componente=espacioClientes]",
                    columnasGrid: columnasGrid,
                    gridUID: "gridClientes",
                    mascaraURL: {
                        mascara: "/administracion/clientes/cliente:",
                        parametro: "clienteUID"
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
                componenteExistente: "zonaNavegacionPaginadaClientes",
                funcionPersonalizada: "view.buscador.mostrarClientesResueltos",
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
    },
    detallesCliente: {
        portada: {
            UI: async function (cliente) {

                const transaccion = {
                    zona: "administracion/clientes/detallesCliente",
                    clienteUID: cliente
                }
                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                if (respuestaServidor?.error) {
                    const info = {
                        titulo: "No existe ningún cliente con ese identificador.",
                        descripcion: "Revisa el identificador del cliente porque este no existe.Quizás borraste el cliente que buscas.Quizás te equivocaste al escribir el identificador del cliente."
                    }
                    casaVitini.ui.componentes.mensajeSimple(info)
                }
                if (respuestaServidor?.ok) {

                    const detallesCliente = respuestaServidor?.ok
                    const clienteUID = detallesCliente.clienteUID
                    const nombre = detallesCliente.nombre
                    const primerApellido = detallesCliente?.primerApellido
                    const segundoApellido = detallesCliente?.segundoApellido
                    const pasaporte = detallesCliente.pasaporte
                    const telefono = detallesCliente?.telefono
                    const mail = detallesCliente?.mail
                    const notas = detallesCliente?.notas

                    let selectorEspacioClientes = document.querySelector("[componente=espacioClientes]")

                    let deatallesClienteUI = document.createElement("div")
                    deatallesClienteUI.classList.add("detallesClienteUIBotones")

                    let boton = document.createElement("a")
                    boton.classList.add("botonV1BlancoIzquierda")
                    boton.setAttribute("boton", "editar")
                    boton.textContent = "Editar datos"
                    boton.href = `/administracion/clientes/cliente:${clienteUID}/editar`

                    boton.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)

                    deatallesClienteUI.appendChild(boton)
                    selectorEspacioClientes.appendChild(deatallesClienteUI)


                    deatallesClienteUI = document.createElement("div")
                    deatallesClienteUI.classList.add("detallesClienteUI")
                    deatallesClienteUI.setAttribute("clienteUID", clienteUID)
                    deatallesClienteUI.setAttribute("componente", "clienteUID" + clienteUID)
                    let bloqueHorizontal = document.createElement("div")
                    bloqueHorizontal.classList.add("detallesClienteBloqueHorizontal")
                    let bloqueVertical = document.createElement("div")
                    bloqueVertical.classList.add("detallesClienteBloqueVertical")

                    let bloqueDato = document.createElement("div")
                    bloqueDato.classList.add("detallesClienteBloqueDato")
                    bloqueVertical.appendChild(bloqueDato)
                    const nombreTitulo = document.createElement("p")
                    nombreTitulo.classList.add("detallesClienteTituloDato")
                    nombreTitulo.textContent = "Nombre"
                    bloqueDato.appendChild(nombreTitulo)
                    let nombreDato = document.createElement("p")
                    nombreDato.classList.add("detallesClienteDatoCampo")
                    nombreDato.setAttribute("componenteDetalle", "nombre")
                    nombreDato.textContent = nombre
                    bloqueDato.appendChild(nombreDato)

                    bloqueDato = document.createElement("div")
                    bloqueDato.classList.add("detallesClienteBloqueDato")
                    bloqueVertical.appendChild(bloqueDato)
                    const primerApellidoTitulo = document.createElement("p")
                    primerApellidoTitulo.classList.add("detallesClienteTituloDato")
                    primerApellidoTitulo.textContent = "Primer apellido"
                    bloqueDato.appendChild(primerApellidoTitulo)
                    const primerApellidoDato = document.createElement("p")
                    primerApellidoDato.classList.add("detallesClienteDatoCampo")
                    primerApellidoDato.textContent = primerApellido || "(Primer apellido no guardado)"
                    primerApellidoDato.setAttribute("componenteDetalle", "primerApellido")
                    bloqueDato.appendChild(primerApellidoDato)

                    bloqueDato = document.createElement("div")
                    bloqueDato.classList.add("detallesClienteBloqueDato")
                    bloqueVertical.appendChild(bloqueDato)
                    const segundoApellidoTitulo = document.createElement("p")
                    segundoApellidoTitulo.classList.add("detallesClienteTituloDato")
                    segundoApellidoTitulo.textContent = "Segundo apellido"
                    bloqueDato.appendChild(segundoApellidoTitulo)
                    const segundoApellidoDato = document.createElement("p")
                    segundoApellidoDato.classList.add("detallesClienteDatoCampo")
                    segundoApellidoDato.textContent = segundoApellido || "(Segundo apellido no guardado)"
                    segundoApellidoDato.setAttribute("componenteDetalle", "segundoApellido")
                    bloqueDato.appendChild(segundoApellidoDato)
                    bloqueHorizontal.appendChild(bloqueVertical)
                    bloqueVertical = document.createElement("div")
                    bloqueVertical.classList.add("detallesClienteBloqueVertical")

                    bloqueDato = document.createElement("div")
                    bloqueDato.classList.add("detallesClienteBloqueDato")
                    bloqueVertical.appendChild(bloqueDato)
                    const pasaporteTitulo = document.createElement("p")
                    pasaporteTitulo.classList.add("detallesClienteTituloDato")
                    pasaporteTitulo.textContent = "Pasaporte"

                    bloqueDato.appendChild(pasaporteTitulo)
                    const pasaporteDato = document.createElement("p")
                    pasaporteDato.classList.add("detallesClienteDatoCampo")
                    pasaporteDato.setAttribute("componenteDetalle", "pasaporte")
                    pasaporteDato.textContent = pasaporte || " "
                    bloqueDato.appendChild(pasaporteDato)

                    bloqueDato = document.createElement("div")
                    bloqueDato.classList.add("detallesClienteBloqueDato")

                    bloqueVertical.appendChild(bloqueDato)


                    const telefonoTitulo = document.createElement("p")
                    telefonoTitulo.classList.add("detallesClienteTituloDato")
                    telefonoTitulo.textContent = "Teléfono"
                    bloqueDato.appendChild(telefonoTitulo)

                    const telefonoDato = document.createElement("p")
                    telefonoDato.classList.add("detallesClienteDatoCampo")
                    telefonoDato.setAttribute("componenteDetalle", "telefono")
                    telefonoDato.textContent = telefono || "(Sin teléfono)"
                    bloqueDato.appendChild(telefonoDato)


                    bloqueDato = document.createElement("div")
                    bloqueDato.classList.add("detallesClienteBloqueDato")
                    bloqueVertical.appendChild(bloqueDato)

                    const correoElectronicoTitulo = document.createElement("p")
                    correoElectronicoTitulo.classList.add("detallesClienteTituloDato")
                    correoElectronicoTitulo.textContent = "Correo electrónico"
                    bloqueDato.appendChild(correoElectronicoTitulo)

                    const correoElectronicoDato = document.createElement("p")
                    correoElectronicoDato.classList.add("detallesClienteDatoCampo")
                    correoElectronicoDato.textContent = mail || "(Sin mail)"
                    correoElectronicoDato.setAttribute("componenteDetalle", "mail")
                    bloqueDato.appendChild(correoElectronicoDato)

                    bloqueHorizontal.appendChild(bloqueVertical)
                    deatallesClienteUI.appendChild(bloqueHorizontal)
                    bloqueHorizontal = document.createElement("div")
                    bloqueHorizontal.classList.add("detallesClienteBloqueHorizontal")

                    bloqueDato = document.createElement("div")
                    bloqueDato.classList.add("detallesClienteBloqueDato")
                    bloqueHorizontal.appendChild(bloqueDato)

                    const notasTitulo = document.createElement("p")
                    notasTitulo.classList.add("detallesClienteTituloDato")
                    notasTitulo.textContent = "Notas"
                    bloqueDato.appendChild(notasTitulo)
                    const notasDato = document.createElement("p")
                    notasDato.classList.add("detallesClienteDatoCampo")
                    notasDato.setAttribute("componenteDetalle", "notas")
                    notasDato.textContent = notas
                    bloqueDato.appendChild(notasDato)
                    if (notas) {
                        deatallesClienteUI.appendChild(bloqueHorizontal)
                    }
                    selectorEspacioClientes.appendChild(deatallesClienteUI)
                    const contenedorResultados = document.createElement("div")
                    contenedorResultados.setAttribute("contenedor", "reservasDelCliente")
                    contenedorResultados.classList.add(
                        "flexVertical"
                    )
                    selectorEspacioClientes.appendChild(contenedorResultados)
                }
            },
            mostrarReservasDelClienteResueltas: async function (transaccion) {
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const selectorEspacio = document.querySelector("[componente=espacioComportamiento]")
                selectorEspacio.setAttribute("instanciaBusqueda", instanciaUID)
                delete transaccion.instanciaUID
                const origen = transaccion.origen
                delete transaccion.origen
                const granuladoURL = casaVitini.utilidades.granuladorURL()
                delete transaccion.granuladoURL

                const paginaTipo = transaccion.paginaTipo
                let nombreColumnaURL
                const nombreColumna = transaccion.nombreColumna
                transaccion.pagina = transaccion.pagina ? Number(transaccion.pagina) : 1
                if ((nombreColumna)?.toLowerCase() === "reservauid") {
                    nombreColumnaURL = "reserva_uid"
                } else if (nombreColumna) {
                    nombreColumnaURL = casaVitini.utilidades.cadenas.camelToSnake(nombreColumna)
                }
                const selectorAlmacen = document.querySelector("[areaGrid=grisReservasDelCliente]")?.getAttribute("almacen") || "{}"
                const almacen = JSON.parse(selectorAlmacen)
                const clienteUID = transaccion.clienteUID || almacen?.clienteUID

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/clientes/reservasDelCliente",
                    pagina: transaccion.pagina,
                    nombreColumna: nombreColumna,
                    sentidoColumna: transaccion.sentidoColumna,
                    clienteUID: String(clienteUID),
                })

                const instanciaRenderizada = document.querySelector(`[instanciaBusqueda="${instanciaUID}"]`)
                if (!instanciaRenderizada) {
                    return
                }
                if (respuestaServidor?.error) {
                    return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.totalReservas === 0) {
                    const espacioClientes = document.querySelector("[componente=espacioClientes]")
                    document.querySelector("[gridUID=gridClientes]")?.remove()
                    document.querySelector("[componente=estadoBusqueda]")?.remove()
                    const estadoBusquedaUI = document.createElement("div")
                    estadoBusquedaUI.classList.add("textCentrado", "padding10")
                    estadoBusquedaUI.setAttribute("componente", "estadoBusqueda")
                    estadoBusquedaUI.textContent = "Este cliente no tiene nínguna reserva asociada a el"
                    espacioClientes.appendChild(estadoBusquedaUI)
                    return

                }
                document.querySelector("[componente=estadoBusqueda]")?.remove()
                const reservasDelCliente = respuestaServidor.reservas
                const paginasTotales = respuestaServidor.paginasTotales
                const pagina = respuestaServidor.pagina
                const sentidoColumna = respuestaServidor.sentidoColumna
                const columnasGrid = [
                    {
                        columnaUI: "Como",
                        columnaIDV: "como",
                    },
                    {
                        columnaUI: "Reserva",
                        columnaIDV: "reservaUID",
                    },
                    {
                        columnaUI: "Fecha de entrada",
                        columnaIDV: "fechaEntrada",
                    },
                    {
                        columnaUI: "Fecha de salida",
                        columnaIDV: "fechaSalida",
                    }
                ]
                const parametrosFinales = {}

                if (nombreColumna) {
                    parametrosFinales.cliente = clienteUID
                    parametrosFinales.nombre_columna = nombreColumnaURL
                    parametrosFinales.sentido_columna = sentidoColumna
                }
                if (respuestaServidor?.pagina > 1 && paginasTotales > 1) {
                    parametrosFinales.pagina = pagina
                }
                const estructuraParametrosFinales = []
                for (const [parametroFinal, valorFinal] of Object.entries(parametrosFinales)) {
                    const estructura = `${parametroFinal}:${valorFinal}`
                    estructuraParametrosFinales.push(estructura)
                }
                let parametrosURLFInal = ""
                if (estructuraParametrosFinales.length > 0) {
                    parametrosURLFInal = "/" + estructuraParametrosFinales.join("/")
                }

                const constructorURLFinal = granuladoURL.directoriosFusion + parametrosURLFInal

                casaVitini.view.__sharedMethods__.grid.despliegue({
                    metodoSalida: "view.detallesCliente.portada.mostrarReservasDelClienteResueltas",
                    configuracionGrid: {
                        filas: reservasDelCliente,
                        almacen: {
                            clienteUID: clienteUID,
                        },
                        sentidoColumna: sentidoColumna,
                        nombreColumna: nombreColumna,
                        pagina: pagina,
                        destino: "[contenedor=reservasDelCliente]",
                        columnasGrid: columnasGrid,
                        gridUID: "grisReservasDelCliente",
                        mascaraURL: {
                            mascara: "/administracion/reservas/reserva:",
                            parametro: "reservaUID"
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

                const titulo = "Administrar reservas"
                const estado = {
                    zona: constructorURLFinal,
                    EstadoInternoZona: "estado",
                    tipoCambio: "parcial",
                    componenteExistente: "clienteUID" + clienteUID,
                    funcionPersonalizada: "view.detallesCliente.portada.mostrarReservasDelClienteResueltas",
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
            editar: function () {
                let camposLectura = document.querySelectorAll("[componenteDetalle]")
                camposLectura.forEach((campo) => {
                    let datoCampo = campo.textContent
                    let idCampo = campo.getAttribute("componenteDetalle")
                    campo.style.display = "none"
                    let tipoElemento
                    if (idCampo === "notas") {
                        tipoElemento = "textarea"
                    } else {
                        tipoElemento = "input"
                    }
                    let campoEditable = document.createElement(tipoElemento)
                    campoEditable.classList.add("detallesClienteCampoEditable")
                    campoEditable.value = datoCampo
                    campoEditable.setAttribute("componenteEditable", idCampo)
                    let selectorContenedor = campo.parentNode
                    selectorContenedor.appendChild(campoEditable)
                })
                document.querySelector("[boton=editar]").classList.add("contenedorOculto")
                document.querySelector("[boton=dejarDeEditar]").classList.remove("contenedorOculto")
                document.querySelector("[boton=eliminarCliente]").classList.remove("contenedorOculto")
                document.querySelector("[boton=guardarCambios]").classList.remove("contenedorOculto")
            },
            dejarDeEditar: function () {
                let camposEditables = document.querySelectorAll("[componenteEditable]")
                camposEditables.forEach((campo) => {
                    campo.remove()
                })
                let camposLectura = document.querySelectorAll("[componenteDetalle]")
                camposLectura.forEach((campo) => {
                    campo.removeAttribute("style")
                })
                document.querySelector("[boton=editar]").classList.remove("contenedorOculto")
                document.querySelector("[boton=dejarDeEditar]").classList.add("contenedorOculto")
                document.querySelector("[boton=guardarCambios]").classList.add("contenedorOculto")
                document.querySelector("[boton=guardarCambios]").classList.add("contenedorOculto")
            },
            guardarCambios: async function () {
                const campos = document.querySelectorAll("[componenteDetalle]")
                const clienteUID = document.querySelector("[clienteUID]").getAttribute("clienteUID")
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()

                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
                    instanciaUID: instanciaUID,
                    mensaje: "Actualizando datos del cliente..."
                })

                const datosParaActualizar = {
                    zona: "administracion/clientes/modificarCliente",
                    clienteUID: String(clienteUID)
                }
                campos.forEach((campo) => {
                    const campoDato = campo.value
                    const campoNombre = campo.getAttribute("componenteDetalle")
                    datosParaActualizar[campoNombre] = campoDato

                })

                const respuestaServidor = await casaVitini.shell.servidor(datosParaActualizar)
                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }
                instanciaRenderizada.remove()

                if (respuestaServidor?.error) {
                    return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    casaVitini.shell.navegacion.controladorVista({
                        vista: "/administracion/clientes/cliente:" + clienteUID,
                        tipoOrigen: "menuNavegador"
                    })
                }
            },
            eliminarCliente: {
                UI: function () {

                    const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                    const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

                    const titulo = constructor.querySelector("[componente=titulo]")
                    titulo.textContent = "Eliminar irreversiblemente al cliente"
                    const mensaje = constructor.querySelector("[componente=mensajeUI]")
                    mensaje.textContent = "Eliminar irreversiblemente a un cliente, elimina la información de este cliente en la base de datos y en las reservas donde estuvo. Es decir, desaparecerá de las reservas donde estuvo este cliente. Si necesitas actualizar su información, puedes hacerlo y la actualización se verá reflejada en todas las reservas donde estuvo, está y estará. Sí, por el contrario, quieres eliminar este cliente porque es una ficha duplicada. Utiliza la herramienta de fusión, esta fusionará a dos clientes y luego eliminará al que selecciones como origen de fusión."

                    const botonIrAFusion = document.createElement("div")
                    botonIrAFusion.classList.add("botonV1BlancoIzquierda")
                    botonIrAFusion.textContent = "Ir a la herramienta de fusión"
                    botonIrAFusion.setAttribute("href", "/administracion/clientes/fusion")

                    botonIrAFusion.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                    constructor.appendChild(botonIrAFusion)

                    const botonAceptar = constructor.querySelector("[boton=aceptar]")
                    botonAceptar.textContent = "Comfirmar la eliminacion del cliente"
                    botonAceptar.addEventListener("click", () => { casaVitini.view.detallesCliente.portada.eliminarCliente.confirmar() })
                    const botonCancelar = constructor.querySelector("[boton=cancelar]")
                    botonCancelar.textContent = "Cancelar la eliminacion"

                    document.querySelector("main").appendChild(pantallaInmersiva)
                },
                confirmar: async function () {
                    const campoEditable = document.querySelectorAll("[componenteEditable]")
                    const clienteUID = document.querySelector("[clienteUID]").getAttribute("clienteUID")
                    const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                    const metadatosPantallaCarga = {
                        mensaje: "Esperando al servidor...",
                        instanciaUID: instanciaUID,
                    }
                    casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(metadatosPantallaCarga)
                    const selectorPantallaDeCargaSuperpuestaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                    const datosParaActualizar = {
                        zona: "administracion/clientes/eliminar",
                        clienteUID: String(clienteUID)
                    }
                    campoEditable.forEach((campo) => {
                        const campoID = campo.getAttribute("componenteEditable")
                        const campoDato = campo.value
                        const campoEditable = document.querySelector(`[componenteEditable=${campoID}]`)
                        const campoLectura = document.querySelector(`[componenteDetalle=${campoID}]`)
                        if (campoEditable.value !== campoLectura.textContent) {
                            datosParaActualizar[campoID] = campoDato
                        }
                    })
                    const respuestaServidor = await casaVitini.shell.servidor(datosParaActualizar)
                    selectorPantallaDeCargaSuperpuestaRenderizada?.remove()
                    if (respuestaServidor?.error) {
                        casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                    }
                    if (respuestaServidor?.ok) {

                        await casaVitini.shell.navegacion.controladorVista({
                            vista: "administracion/clientes",
                            tipoOrigen: "menuNavegador"
                        })
                        casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.ok)
                    }
                },
            }
        },
        editar: {
            UI: async function () {
                const granuladoURL = casaVitini.utilidades.granuladorURL()
                const parametros = granuladoURL.parametros
                const clienteUID = parametros.cliente

                const transaccion = {
                    zona: "administracion/clientes/detallesCliente",
                    clienteUID: clienteUID
                }
                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                if (respuestaServidor?.error) {
                    const info = {
                        titulo: "No existe ningun cliente con ese identificador",
                        descripcion: "Revisa el identificador del cliente porque este no existe.Quizás borraste el cliente que buscas.Quizás te equivocaste al escribir el identificador del cliente."
                    }
                    casaVitini.ui.componentes.mensajeSimple(info)
                }
                if (respuestaServidor?.ok) {
                    const detallesCliente = respuestaServidor?.ok
                    const clienteUID = detallesCliente.clienteUID
                    const nombre = detallesCliente.nombre
                    const primerApellido = detallesCliente?.primerApellido
                    const segundoApellido = detallesCliente?.segundoApellido
                    const pasaporte = detallesCliente.pasaporte
                    const telefono = detallesCliente?.telefono
                    const mail = detallesCliente?.mail
                    const notas = detallesCliente?.notas

                    let selectorEspacioClientes = document.querySelector("[componente=espacioClientes]")

                    let deatallesClienteUI = document.createElement("div")
                    deatallesClienteUI.classList.add("detallesClienteUIBotones")

                    selectorEspacioClientes.appendChild(deatallesClienteUI)
                    deatallesClienteUI = document.createElement("div")
                    deatallesClienteUI.classList.add("detallesClienteUI")
                    deatallesClienteUI.setAttribute("clienteUID", clienteUID)


                    let bloqueHorizontal = document.createElement("div")
                    bloqueHorizontal.classList.add("detallesClienteBloqueHorizontal")
                    let bloqueVertical = document.createElement("div")
                    bloqueVertical.classList.add("detallesClienteBloqueVertical")

                    let bloqueDato = document.createElement("div")
                    bloqueDato.classList.add("detallesClienteBloqueDato")
                    bloqueVertical.appendChild(bloqueDato)
                    let nombreTitulo = document.createElement("p")
                    nombreTitulo.classList.add("negrita", "padding14")
                    nombreTitulo.textContent = "Nombre"
                    bloqueDato.appendChild(nombreTitulo)
                    let nombreDato = document.createElement("input")
                    nombreDato.classList.add("botonV1BlancoIzquierda_campo")
                    nombreDato.setAttribute("componenteDetalle", "nombre")
                    nombreDato.value = nombre
                    bloqueDato.appendChild(nombreDato)

                    bloqueDato = document.createElement("div")
                    bloqueDato.classList.add("detallesClienteBloqueDato")
                    bloqueVertical.appendChild(bloqueDato)
                    let primerApellidoTitulo = document.createElement("p")
                    primerApellidoTitulo.classList.add("negrita", "padding14")
                    primerApellidoTitulo.textContent = "Primer apellido"
                    bloqueDato.appendChild(primerApellidoTitulo)
                    let primerApellidoDato = document.createElement("input")
                    primerApellidoDato.classList.add("botonV1BlancoIzquierda_campo")
                    primerApellidoDato.value = primerApellido
                    primerApellidoDato.setAttribute("componenteDetalle", "primerApellido")
                    bloqueDato.appendChild(primerApellidoDato)

                    bloqueDato = document.createElement("div")
                    bloqueDato.classList.add("detallesClienteBloqueDato")
                    bloqueVertical.appendChild(bloqueDato)
                    let segundoApellidoTitulo = document.createElement("p")
                    segundoApellidoTitulo.classList.add("negrita", "padding14")
                    segundoApellidoTitulo.textContent = "Segundo apellido"
                    bloqueDato.appendChild(segundoApellidoTitulo)
                    let segundoApellidoDato = document.createElement("input")
                    segundoApellidoDato.classList.add("botonV1BlancoIzquierda_campo")
                    segundoApellidoDato.value = segundoApellido
                    segundoApellidoDato.setAttribute("componenteDetalle", "segundoApellido")
                    bloqueDato.appendChild(segundoApellidoDato)
                    bloqueHorizontal.appendChild(bloqueVertical)
                    bloqueVertical = document.createElement("div")
                    bloqueVertical.classList.add("detallesClienteBloqueVertical")

                    bloqueDato = document.createElement("div")
                    bloqueDato.classList.add("detallesClienteBloqueDato")
                    bloqueVertical.appendChild(bloqueDato)
                    let pasaporteTitulo = document.createElement("p")
                    pasaporteTitulo.classList.add("negrita", "padding14")
                    pasaporteTitulo.textContent = "Pasaporte"
                    bloqueDato.appendChild(pasaporteTitulo)
                    let pasaporteDato = document.createElement("input")
                    pasaporteDato.classList.add("botonV1BlancoIzquierda_campo")
                    pasaporteDato.setAttribute("componenteDetalle", "pasaporte")
                    pasaporteDato.value = pasaporte
                    bloqueDato.appendChild(pasaporteDato)

                    bloqueDato = document.createElement("div")
                    bloqueDato.classList.add("detallesClienteBloqueDato")
                    bloqueVertical.appendChild(bloqueDato)
                    let telefonoTitulo = document.createElement("p")
                    telefonoTitulo.classList.add("negrita", "padding14")
                    telefonoTitulo.textContent = "Teléfono"
                    bloqueDato.appendChild(telefonoTitulo)
                    let telefonoDato = document.createElement("input")
                    telefonoDato.classList.add("botonV1BlancoIzquierda_campo")
                    telefonoDato.setAttribute("componenteDetalle", "telefono")
                    telefonoDato.value = telefono
                    bloqueDato.appendChild(telefonoDato)

                    bloqueDato = document.createElement("div")
                    bloqueDato.classList.add("detallesClienteBloqueDato")
                    bloqueVertical.appendChild(bloqueDato)
                    let correoElectronicoTitulo = document.createElement("p")
                    correoElectronicoTitulo.classList.add("negrita", "padding14")
                    correoElectronicoTitulo.textContent = "Correo electrónico"
                    bloqueDato.appendChild(correoElectronicoTitulo)

                    let correoElectronicoDato = document.createElement("input")
                    correoElectronicoDato.classList.add("botonV1BlancoIzquierda_campo")
                    correoElectronicoDato.value = mail
                    correoElectronicoDato.setAttribute("componenteDetalle", "correoElectronico")
                    bloqueDato.appendChild(correoElectronicoDato)
                    bloqueHorizontal.appendChild(bloqueVertical)
                    deatallesClienteUI.appendChild(bloqueHorizontal)

                    bloqueHorizontal = document.createElement("div")
                    bloqueHorizontal.classList.add("detallesClienteBloqueHorizontalNotas")

                    bloqueDato = document.createElement("div")
                    bloqueDato.classList.add("detallesClienteBloqueDato")
                    bloqueHorizontal.appendChild(bloqueDato)
                    let notasTitulo = document.createElement("p")
                    notasTitulo.classList.add("negrita", "padding14")
                    notasTitulo.textContent = "Notas"
                    bloqueDato.appendChild(notasTitulo)
                    let notasDato = document.createElement("textarea")
                    notasDato.classList.add("botonV1BlancoIzquierda_campo")
                    notasDato.setAttribute("componenteDetalle", "notas")
                    notasDato.rows = "4"
                    notasDato.value = notas
                    bloqueDato.appendChild(notasDato)
                    deatallesClienteUI.appendChild(bloqueHorizontal)

                    selectorEspacioClientes.appendChild(deatallesClienteUI)

                    const contenedorBotones = document.createElement("div")
                    contenedorBotones.classList.add(
                        "flexVertical",
                        "gap6",
                        "padding12"
                    )
                    deatallesClienteUI.appendChild(contenedorBotones)
                    let boton = document.createElement("div")
                    boton.classList.add("botonV1BlancoIzquierda")
                    boton.setAttribute("boton", "guardarCambios")
                    boton.addEventListener("click", casaVitini.view.detallesCliente.portada.guardarCambios)
                    boton.textContent = "Guardar cambios"
                    contenedorBotones.appendChild(boton)

                    boton = document.createElement("div")
                    boton.classList.add("botonV1BlancoIzquierda")
                    boton.setAttribute("boton", "eliminarCliente")
                    boton.addEventListener("click", casaVitini.view.detallesCliente.portada.eliminarCliente.UI)
                    boton.textContent = "Eliminar cliente"
                    contenedorBotones.appendChild(boton)
                }
            },
        },

    },
    navegacion: {
        estadoInicial: {
            zona: "administracion/clientes",
            EstadoInternoZona: "estado",
            tipoCambio: "parcial",
            componenteExistente: "zonaNavegacionPaginadaClientes",
            funcionPersonalizada: "view.buscador.mostrarClientesResueltos",
            args: {}
        }
    }
}