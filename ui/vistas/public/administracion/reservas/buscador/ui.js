casaVitini.view = {
    start: function () {
        const main = document.querySelector("main")
        const instanciaUID = main.getAttribute("instanciaUID")

        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const comandoInicial = granuladoURL.directorios[granuladoURL.directorios.length - 1]
        const directorios = granuladoURL.directorios

        if (Object.keys(granuladoURL.parametros).length === 0) {

            main.setAttribute("zonaCSS", "administracion/reservas/buscador")
            this.buscadorUI()
        } else if (Object.keys(granuladoURL.parametros).length > 0) {

            main.setAttribute("zonaCSS", "administracion/reservas/buscador")
           this.buscadorUI()


            const parametrosFormatoURL = granuladoURL.parametros
            const parametrosFormatoIDV = {}
            Object.entries(parametrosFormatoURL).forEach(([nombreParametroURL, valorParametroURL]) => {
                const nombreParametroIDV = casaVitini.utilidades.cadenas.snakeToCamel(nombreParametroURL)
                let nombreColumnaIDV
                if ((valorParametroURL)?.toLowerCase() === "reserva") {
                    nombreColumnaIDV = "reservaUID"
                } else if ((valorParametroURL)?.toLowerCase() === "estado_reserva") {
                    nombreColumnaIDV = "estadoReservaIDV"
                } else if (valorParametroURL) {
                    nombreColumnaIDV = casaVitini.utilidades.cadenas.snakeToCamel(valorParametroURL)
                }
                parametrosFormatoIDV[nombreParametroIDV] = nombreColumnaIDV
                parametrosFormatoIDV.instanciaUID = instanciaUID
            })
            this.contructorMarcoInfo()
            parametrosFormatoIDV.termino = decodeURI(parametrosFormatoIDV.termino)
           this.mostrarReservasResueltas(parametrosFormatoIDV)
        } else {
            casaVitini.ui.componentes.urlDesconocida()
        }
    },
    contructorMarcoInfo: function () {
        const buscadorUI = document.querySelector("[componente=navegacionZonaAdministracion]")

        const estadoBusquedaUI = document.createElement("div")
        estadoBusquedaUI.classList.add("buscadorClientesEstadoBusqueda")
        estadoBusquedaUI.setAttribute("componente", "estadoBusqueda")
        estadoBusquedaUI.textContent = "Buscando..."

        const comRenderizado = document.querySelector("[componente=estadoBusqueda]")
        if (!comRenderizado) {
            buscadorUI.parentNode.insertBefore(estadoBusquedaUI, buscadorUI.nextSibling);

        }
    },
    buscadorUI: function (url) {
        const instanciaUID_contenedorFechas = casaVitini.utilidades.codigoFechaInstancia()

        const marcoElastico = document.createElement("div")
        marcoElastico.classList.add("marcoElasticoRelativo")
        marcoElastico.setAttribute("componente", "marcoElastico")
        const espacioReservas = document.createElement("div")
        espacioReservas.setAttribute("componente", "espacioReservas")
        espacioReservas.classList.add("administracion_reservas_espacioReservas")
        const contenedorBotonesGlobales = document.createElement("div")
        contenedorBotonesGlobales.classList.add(
            "grid",
            "grid3Columnas",
            "borderRadius16",
            "gap6"
        )
        const botonVerHoy = document.createElement("a")
        botonVerHoy.classList.add("administracion_reservas_contenedorBotonesGlobales")
        botonVerHoy.setAttribute("boton", "botonVerHoy")
        botonVerHoy.addEventListener("click", () =>{this.verReservasHoy()})
        botonVerHoy.textContent = "Ver entradas hoy"
        contenedorBotonesGlobales.appendChild(botonVerHoy)
        const botonReservasPendientes = document.createElement("a")
        botonReservasPendientes.classList.add("administracion_reservas_contenedorBotonesGlobales")
        botonReservasPendientes.textContent = "Reservas pendientes de revisión"
        botonReservasPendientes.setAttribute("vista", "/administracion/reservas/pendientes_de_revision")
        botonReservasPendientes.setAttribute("href", "/administracion/reservas/pendientes_de_revision")
        botonReservasPendientes.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
        contenedorBotonesGlobales.appendChild(botonReservasPendientes)
        const botonCrearReserva = document.createElement("a")
        botonCrearReserva.classList.add("administracion_reservas_contenedorBotonesGlobales")
        botonCrearReserva.textContent = "Crear una nueva reserva"
        botonCrearReserva.setAttribute("vista", "/administracion/reservas/nueva")
        botonCrearReserva.setAttribute("href", "/administracion/reservas/nueva")
        botonCrearReserva.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
        contenedorBotonesGlobales.appendChild(botonCrearReserva)
        espacioReservas.appendChild(contenedorBotonesGlobales)

        let buscadorUI = document.createElement("nav")
        buscadorUI.classList.add("navegacionZonaAdministracion")
        buscadorUI.setAttribute("componente", "navegacionZonaAdministracion")
        let bloqueContenedor = document.createElement("div")
        bloqueContenedor.classList.add("reservasBloqueContenedor")
        const buscadorPorPalaba = document.createElement("input")
        buscadorPorPalaba.classList.add("campoBuscadorIdReservas")
        buscadorPorPalaba.setAttribute("componenteCampo", "buscadorPorId")
        buscadorPorPalaba.setAttribute("origenBusqueda", "porTerminos")
        buscadorPorPalaba.setAttribute("step", "any")
        buscadorPorPalaba.setAttribute("placeholder", "Escribe para buscar reservas")
        buscadorPorPalaba.addEventListener("input", (e) => { this.buscadorReservas(e) })
        espacioReservas.appendChild(buscadorPorPalaba)
        let buscadorReservasPorFecha = document.createElement("div")
        buscadorReservasPorFecha.classList.add("adminsitracionReservasBuscador")
        bloqueContenedor.appendChild(buscadorReservasPorFecha)
        let bloqueFechas = document.createElement("div")
        bloqueFechas.classList.add("adminsitracionBloqueSelecionDias")
        bloqueFechas.setAttribute("instanciaUID_contenedorFechas", instanciaUID_contenedorFechas)

        buscadorReservasPorFecha.appendChild(bloqueFechas)
        let bloqueFechaEntrada = document.createElement("div")
        bloqueFechaEntrada.classList.add("diaEntradaNuevoAdministracion")
        bloqueFechaEntrada.classList.add("administracionFormatoBloqueDiaNuevo")
        bloqueFechaEntrada.setAttribute("calendario", "entrada")
        bloqueFechaEntrada.setAttribute("paralizadorevento", "ocultadorCalendarios")

        bloqueFechaEntrada.addEventListener("click", async () => {
            await casaVitini.ui.componentes.calendario.configurarCalendario({
                perfilMes: "calendario_entrada_perfilSimple",
                contenedorOrigenIDV: "[calendario=entrada]",
                instanciaUID_contenedorFechas,
                rangoIDV: "inicioRango",
                metodoSelectorDia: null,
                tituloCalendario: "Seleciona una fecha de inicio de rango para la búsqueda",
                seleccionableDiaLimite: "si"


            })
        })

        bloqueFechaEntrada.setAttribute("componenteBuscador", "compartidoID")
        bloqueFechas.appendChild(bloqueFechaEntrada)
        let textoFechaEntrada = document.createElement("div")
        textoFechaEntrada.classList.add("textoDiaNuevoAdministracion")
        textoFechaEntrada.textContent = "Fecha de entrada"
        bloqueFechaEntrada.appendChild(textoFechaEntrada)
        let fechaEntradaElemento = document.createElement("div")
        fechaEntradaElemento.classList.add("fechaNuevo")
        fechaEntradaElemento.setAttribute("fechaUI", "fechaInicio")
        fechaEntradaElemento.textContent = "(Seleccionar)"
        bloqueFechaEntrada.appendChild(fechaEntradaElemento)
        let bloqueFechaSalida = document.createElement("div")
        bloqueFechaSalida.classList.add("diaEntradaNuevoAdministracion")
        bloqueFechaSalida.classList.add("administracionFormatoBloqueDiaNuevo")
        bloqueFechaSalida.setAttribute("calendario", "salida")
        bloqueFechaSalida.setAttribute("componenteBuscador", "compartidoID")

        bloqueFechaSalida.addEventListener("click", async () => {
            await casaVitini.ui.componentes.calendario.configurarCalendario({
                perfilMes: "calendario_salida_perfilSimple",
                contenedorOrigenIDV: "[calendario=salida]",
                instanciaUID_contenedorFechas,
                rangoIDV: "finalRango",
                metodoSelectorDia: null,
                tituloCalendario: "Seleciona una fecha de fin de rango para la búsqueda",
                seleccionableDiaLimite: "si"
            })
        })
        bloqueFechaSalida.setAttribute("paralizadorevento", "ocultadorCalendarios")
        bloqueFechas.appendChild(bloqueFechaSalida)
        let textoFechaSalida = document.createElement("div")
        textoFechaSalida.classList.add("textoDiaNuevoAdministracion")
        textoFechaSalida.textContent = "Fecha de salida"
        bloqueFechaSalida.appendChild(textoFechaSalida)
        let fechaSalidaElemento = document.createElement("div")
        fechaSalidaElemento.classList.add("fechaNuevo")
        fechaSalidaElemento.setAttribute("fechaUI", "fechaFin")
        fechaSalidaElemento.textContent = "(Seleccionar)"
        bloqueFechaSalida.appendChild(fechaSalidaElemento)
        let selectorRango = document.createElement("div")
        selectorRango.classList.add("selectorRango", "backgroundGrey1")
        let opcionRango = document.createElement("p")
        opcionRango.classList.add("selectorRangoOpcion")
        opcionRango.setAttribute("selectorRango", "cualquieraQueCoincida")
        opcionRango.textContent = "Cualquiera que coincida"
        opcionRango.addEventListener("click", () => {
           this.seleccionarRango("cualquieraQueCoincida")
        })
        selectorRango.appendChild(opcionRango)
        opcionRango = document.createElement("p")
        opcionRango.classList.add("selectorRangoOpcion")
        opcionRango.setAttribute("selectorRango", "soloDentroDelRango")
        opcionRango.textContent = "Solo dentro del rango"
        opcionRango.addEventListener("click", () => {
           this.seleccionarRango("soloDentroDelRango")
        })
        selectorRango.appendChild(opcionRango)
        opcionRango = document.createElement("p")
        opcionRango.classList.add("selectorRangoOpcion")
        opcionRango.setAttribute("selectorRango", "porFechaDeEntrada")
        opcionRango.textContent = "Por fecha de entradas"
        opcionRango.addEventListener("click", () => {
           this.seleccionarRango("porFechaDeEntrada")
        })
        selectorRango.appendChild(opcionRango)
        opcionRango = document.createElement("p")
        opcionRango.classList.add("selectorRangoOpcion")
        opcionRango.setAttribute("selectorRango", "porFechaDeSalida")
        opcionRango.textContent = "Por fecha de salida"
        opcionRango.addEventListener("click", () => {
           this.seleccionarRango("porFechaDeSalida")
        })
        selectorRango.appendChild(opcionRango)
        buscadorReservasPorFecha.appendChild(selectorRango)
        let botonMostrarReservas = document.createElement(("div"))
        botonMostrarReservas.classList.add("botonMostrarDisponibilidad")
        botonMostrarReservas.setAttribute("boton", "mostrarReservas")
        botonMostrarReservas.setAttribute("origenBusqueda", "porFecha")
        botonMostrarReservas.addEventListener("click", () =>{this.mostrarReservasPorRango()})
        buscadorUI.appendChild(bloqueContenedor)
        botonMostrarReservas.textContent = "Buscar"
        buscadorReservasPorFecha.appendChild(botonMostrarReservas)
        espacioReservas.appendChild(buscadorUI)


        const contenedorResultados = document.createElement("div")
        contenedorResultados.setAttribute("contenedor", "reservasEncontradas")
        contenedorResultados.classList.add(
            "flexVertical",
        )
        espacioReservas.appendChild(contenedorResultados)




        marcoElastico.appendChild(espacioReservas)
        const seccion = document.querySelector("main")
        seccion.appendChild(marcoElastico)
    },
    seleccionarDia: function (dia) {
        let diaSeleccionadoComoElemento = dia.target;
        let calendario = document.querySelector("[componente=bloqueCalendario] [componente=marcoCalendario]")
        let calendarioIO = calendario.getAttribute("calendarioIO")
        let diaSeleccionado = dia.target.getAttribute("dia")
        diaSeleccionado = diaSeleccionado.padStart(2, "0")
        diaSeleccionado = Number(diaSeleccionado)
        let anoSeleccionado = document.querySelector("[componente=mesReferencia]").getAttribute("ano")
        anoSeleccionado = anoSeleccionado.padStart(4, "0")
        anoSeleccionado = Number(anoSeleccionado)
        let mesSeleccionado = document.querySelector("[componente=mesReferencia]").getAttribute("mes")
        mesSeleccionado = mesSeleccionado.padStart(2, "0")
        mesSeleccionado = Number(mesSeleccionado)
        const fechaSeleccionadaUI = `${diaSeleccionado}/${mesSeleccionado}/${anoSeleccionado}`
        const selectorDias = document.querySelectorAll("[calendarioIO] [dia]")
        selectorDias.forEach((dia) => {

            dia.classList.remove("calendarioDiaReserva")
            dia.classList.remove("calendarioDiaSeleccionado")
        })
        if (diaSeleccionadoComoElemento.getAttribute("estadoDia") === "seleccionado") {
            diaSeleccionadoComoElemento.classList.remove("calendarioDiaSeleccionado")
            if (calendarioIO === "entrada") {
                document.querySelector("[calendario=entrada]").removeAttribute("memoriaVolatil")
                document.querySelector("#fechaEntrada").textContent = "Seleccionar"
            }
            if (calendarioIO === "salida") {
                document.querySelector("[calendario=salida]").removeAttribute("memoriaVolatil")
                document.querySelector("#fechaSalida").textContent = "Seleccionar"
            }
            diaSeleccionadoComoElemento.classList.remove("calendarioDiaSeleccionado")
            diaSeleccionadoComoElemento.removeAttribute("estadoDia")

        }
        const diasDisponibles = document.querySelectorAll("[estado=disponible]")
        diasDisponibles.forEach(diaDisponible => {
            diaDisponible.removeAttribute("estadoDia")
            diaDisponible.style.background = ""
            diaDisponible.style.color = ""
        })
        diaSeleccionadoComoElemento.setAttribute("estadoDia", "seleccionado")
        diaSeleccionadoComoElemento.classList.add("calendarioDiaSeleccionado")
        let fechaEntradaSeleccionada = document.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
        let diaSeleccionadoEntrada
        let mesSeleccionadoEntrada
        let anoSeleccionadoEntrada
        let datosFechaEntradaSeleccionada
        if (fechaEntradaSeleccionada) {
            const fechaEntradaSeleccionada_array = fechaEntradaSeleccionada.split("/")
            diaSeleccionadoEntrada = fechaEntradaSeleccionada_array[0]
            diaSeleccionadoEntrada = Number(diaSeleccionadoEntrada)
            mesSeleccionadoEntrada = fechaEntradaSeleccionada_array[1]
            mesSeleccionadoEntrada = Number(mesSeleccionadoEntrada)
            anoSeleccionadoEntrada = fechaEntradaSeleccionada_array[2]
            anoSeleccionadoEntrada = Number(anoSeleccionadoEntrada)
            datosFechaEntradaSeleccionada = "existen"
        }
        let fechaSalidaSelecionda = document.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")
        let diaSeleccionadoSalida
        let mesSeleccionadoSalida
        let anoSeleccionadoSalida
        let datosFechaSalidaSeleccionada
        if (fechaSalidaSelecionda) {
            const fechaSalidaSelecionda_array = fechaSalidaSelecionda.split("/")
            diaSeleccionadoSalida = fechaSalidaSelecionda_array[0]
            diaSeleccionadoSalida = Number(diaSeleccionadoSalida)
            mesSeleccionadoSalida = fechaSalidaSelecionda_array[1]
            mesSeleccionadoSalida = Number(mesSeleccionadoSalida)
            anoSeleccionadoSalida = fechaSalidaSelecionda_array[2]
            anoSeleccionadoSalida = Number(anoSeleccionadoSalida)
            datosFechaSalidaSeleccionada = "existen"
        }
        if (calendarioIO === "entrada") {
            document.querySelector("[calendario=entrada]").setAttribute("memoriaVolatil", fechaSeleccionadaUI)
            document.querySelector("#fechaEntrada").textContent = fechaSeleccionadaUI
            if (fechaSalidaSelecionda) {
                if (mesSeleccionadoSalida === mesSeleccionado && anoSeleccionado === anoSeleccionadoSalida) {
                    selectorDias.forEach((dia) => {
                        if (Number(dia.getAttribute("dia")) > diaSeleccionado && Number(dia.getAttribute("dia")) < diaSeleccionadoSalida) {

                            dia.classList.add("calendarioDiaReserva")
                        }
                    })
                } else {
                    selectorDias.forEach((dia) => {
                        if (Number(dia.getAttribute("dia")) > diaSeleccionado) {
                            dia.classList.add("calendarioDiaReserva")
                        }
                    })
                }
            }
        }
        if (calendarioIO === "salida") {
            document.querySelector("[calendario=salida]").setAttribute("memoriaVolatil", fechaSeleccionadaUI)
            document.querySelector("#fechaSalida").textContent = fechaSeleccionadaUI
            if (fechaEntradaSeleccionada) {
                if (mesSeleccionadoEntrada === mesSeleccionado && anoSeleccionado === anoSeleccionadoEntrada) {
                    selectorDias.forEach((dia) => {
                        if (Number(dia.getAttribute("dia")) < diaSeleccionado && Number(dia.getAttribute("dia")) > diaSeleccionadoEntrada) {
                            dia.classList.add("calendarioDiaReserva")
                        }
                    })
                } else {
                    selectorDias.forEach((dia) => {
                        if (Number(dia.getAttribute("dia")) < diaSeleccionado) {
                            dia.classList.add("calendarioDiaReserva")
                        }
                    })
                }
            }
        }
    },
    mostrarDetallesReserva: function (transaccion) {
        transaccion.preventDefault()
        transaccion.stopPropagation()
        const reserva = transaccion.target.parentNode.getAttribute("reserva")
        const vista = "/administracion/reservas/" + reserva
        const navegacion = {
            vista: vista,
            tipoOrigen: "menuNavegador"
        }
        casaVitini.shell.navegacion.controladorVista(navegacion)
    },
    constructorCalendario: async function (boton) {
        const botonID = boton.target.getAttribute("calendario")
        const alturaDinamicaArriba = casaVitini.utilidades.observador.medirPorJerarquiaDom.vertical.desdeAbajoDelElemento(boton.target.closest("[calendario]")) + 20
        const bloqueCalendario = document.querySelector("[componente=bloqueCalendario]")
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const selectorCalendario = document.querySelector("[contenedor=calendario]")
        const fechaEntradaVolatil_Humana = document.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
        let diaSeleccionadoEntrada
        let mesSeleccionadoEntrada
        let anoSeleccionadoEntrada
        let datosFechaEntradaSeleccionada
        if (fechaEntradaVolatil_Humana) {
            const fechaEntradaAarray = fechaEntradaVolatil_Humana.split("/")
            diaSeleccionadoEntrada = Number(fechaEntradaAarray[0])
            mesSeleccionadoEntrada = Number(fechaEntradaAarray[1])
            anoSeleccionadoEntrada = Number(fechaEntradaAarray[2])
        }
        const fechaSalidaVolatil_Humana = document.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")
        let diaSeleccionadoSalida
        let mesSeleccionadoSalida
        let anoSeleccionadoSalida
        let datosFechaSalidaSeleccionada
        if (fechaSalidaVolatil_Humana) {
            const fechaSaliraArray = fechaSalidaVolatil_Humana.split("/")
            diaSeleccionadoSalida = Number(fechaSaliraArray[0])
            mesSeleccionadoSalida = Number(fechaSaliraArray[1])
            anoSeleccionadoSalida = Number(fechaSaliraArray[2])
        }
        if (botonID === "entrada") {
            if (selectorCalendario?.getAttribute("calendarioIO") === "salida") {
                bloqueCalendario.remove()
                document.removeEventListener("click", casaVitini.shell.controladoresUI.ocultarElementos)
            }
            if (selectorCalendario?.getAttribute("calendarioIO") === "entrada") {
                bloqueCalendario.remove()
                document.removeEventListener("click", casaVitini.shell.controladoresUI.ocultarElementos)

            }
            if (fechaEntradaVolatil_Humana) {
                const calendario = {
                    tipo: "personalizado",
                    tipoFecha: "entrada",
                    diaSeleccionado: diaSeleccionadoEntrada,
                    mes: Number(mesSeleccionadoEntrada),
                    ano: Number(anoSeleccionadoEntrada)
                }
                const tipoFecha = {
                    tipoFecha: "entrada",
                    almacenamientoCalendarioID: "AdministracionCalendario",
                    perfilMes: "calendario_entrada_perfilSimple",
                    calendarioIO: "entrada",
                    mensajeInfo: "Selecciona una fecha de entrada para buscar reservas por un rango",
                    alturaDinamica: alturaDinamicaArriba,
                    instanciaUID: instanciaUID,
                    metodoSelectorDia: "ui.componentes.calendario.calendarioCompartido.seleccionarDia"
                }
                casaVitini.ui.componentes.calendario.constructorCalendarioNuevo(tipoFecha)
                document.addEventListener("click", casaVitini.shell.controladoresUI.ocultarElementos)
                const calendarioResuelto = await casaVitini.ui.componentes.calendario.resolverCalendarioNuevo(calendario)
                calendarioResuelto.instanciaUID = instanciaUID
                casaVitini.ui.componentes.calendario.constructorMesNuevo(calendarioResuelto)
            } else {
                const calendario = {
                    tipo: "actual",
                    tipoFecha: "entrada",
                }
                const tipoFecha = {
                    tipoFecha: "entrada",
                    almacenamientoCalendarioID: "administracionCalendario",
                    perfilMes: "calendario_entrada_perfilSimple",
                    calendarioIO: "entrada",
                    mensajeInfo: "Selecciona una fecha de entrada para buscar reservas por un rango",
                    alturaDinamica: alturaDinamicaArriba,
                    instanciaUID: instanciaUID,
                    metodoSelectorDia: "ui.componentes.calendario.calendarioCompartido.seleccionarDia"
                }
                casaVitini.ui.componentes.calendario.constructorCalendarioNuevo(tipoFecha)
                document.addEventListener("click", casaVitini.shell.controladoresUI.ocultarElementos)
                const calendarioResuelto = await casaVitini.ui.componentes.calendario.resolverCalendarioNuevo(calendario)
                calendarioResuelto.instanciaUID = instanciaUID
                casaVitini.ui.componentes.calendario.constructorMesNuevo(calendarioResuelto)
            }
        }
        if (botonID === "salida") {
            if (selectorCalendario?.getAttribute("calendarioIO") === "salida") {
                bloqueCalendario.remove()
                document.removeEventListener("click", casaVitini.shell.controladoresUI.ocultarElementos)

            }
            if (selectorCalendario?.getAttribute("calendarioIO") === "entrada") {
                bloqueCalendario.remove()
                document.removeEventListener("click", casaVitini.shell.controladoresUI.ocultarElementos)
            }
            if (!fechaEntradaVolatil_Humana && !fechaSalidaVolatil_Humana) {
                const calendario = {
                    tipo: "actual",
                    tipoFecha: "salida",
                }
                const tipoFecha = {
                    tipoFecha: "salida",
                    almacenamientoCalendarioID: "administracionCalendario",
                    perfilMes: "calendario_salida_perfilSimple",
                    calendarioIO: "salida",
                    mensajeInfo: "Selecciona una fecha de salida para buscar reservas por un rango",
                    alturaDinamica: alturaDinamicaArriba,
                    instanciaUID: instanciaUID,
                    metodoSelectorDia: "ui.componentes.calendario.calendarioCompartido.seleccionarDia"
                }
                casaVitini.ui.componentes.calendario.constructorCalendarioNuevo(tipoFecha)
                document.addEventListener("click", casaVitini.shell.controladoresUI.ocultarElementos)
                const calendarioResuelto = await casaVitini.ui.componentes.calendario.resolverCalendarioNuevo(calendario)
                calendarioResuelto.instanciaUID = instanciaUID

                casaVitini.ui.componentes.calendario.constructorMesNuevo(calendarioResuelto)
            }
            if (fechaEntradaVolatil_Humana && !fechaSalidaVolatil_Humana) {
                const calendario = {
                    tipo: "personalizado",

                    tipoFecha: "salida",
                    diaSeleccionado: diaSeleccionadoEntrada,
                    mes: Number(mesSeleccionadoEntrada),
                    ano: Number(anoSeleccionadoEntrada)
                }

                const tipoFecha = {
                    tipoFecha: "salida",
                    almacenamientoCalendarioID: "administracionCalendario",
                    perfilMes: "calendario_salida_perfilSimple",
                    calendarioIO: "salida",
                    mensajeInfo: "Selecciona una fecha de salida para buscar reservas por un rango",
                    alturaDinamica: alturaDinamicaArriba,
                    instanciaUID: instanciaUID,
                    metodoSelectorDia: "ui.componentes.calendario.calendarioCompartido.seleccionarDia"
                }
                casaVitini.ui.componentes.calendario.constructorCalendarioNuevo(tipoFecha)
                document.addEventListener("click", casaVitini.shell.controladoresUI.ocultarElementos)
                const calendarioResuelto = await casaVitini.ui.componentes.calendario.resolverCalendarioNuevo(calendario)
                calendarioResuelto.tiempo = "presente"
                calendarioResuelto.instanciaUID = instanciaUID
                casaVitini.ui.componentes.calendario.constructorMesNuevo(calendarioResuelto)
            }
            if (fechaSalidaVolatil_Humana) {
                const calendario = {
                    tipo: "personalizado",

                    tipoFecha: "salida",
                    diaSeleccionado: diaSeleccionadoSalida,
                    mes: Number(mesSeleccionadoSalida),
                    ano: Number(anoSeleccionadoSalida)
                }

                const tipoFecha = {
                    tipoFecha: "salida",
                    almacenamientoCalendarioID: "administracionCalendario",
                    perfilMes: "calendario_salida_perfilSimple",
                    calendarioIO: "salida",
                    mensajeInfo: "Selecciona una fecha de salida para buscar reservas por un rango",
                    alturaDinamica: alturaDinamicaArriba,
                    instanciaUID: instanciaUID,
                    metodoSelectorDia: "ui.componentes.calendario.calendarioCompartido.seleccionarDia"
                }
                casaVitini.ui.componentes.calendario.constructorCalendarioNuevo(tipoFecha)
                document.addEventListener("click", casaVitini.shell.controladoresUI.ocultarElementos)
                const calendarioResuelto = await casaVitini.ui.componentes.calendario.resolverCalendarioNuevo(calendario)
                calendarioResuelto.instanciaUID = instanciaUID
                casaVitini.ui.componentes.calendario.constructorMesNuevo(calendarioResuelto)
            }
        }
    },
    seleccionarRango: function (rangoIDV) {
        let rangos = document.querySelectorAll("[selectorRango]")
        rangos.forEach((rango) => {
            let rangoPorCiclo = rango.getAttribute("selectorRango")
            if (rangoPorCiclo === rangoIDV) {
                rango.style.background = "#0800ff"
                rango.style.color = "white"
                rango.setAttribute("estadoSelecion", "activado")
            } else {
                rango.style.removeProperty("background")
                rango.style.removeProperty("color")
                rango.removeAttribute("estadoSelecion")
            }
        })
    },
    mostrarReservasResueltas: async function (transaccion) {

        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const selectorEspacio = document.querySelector("[componente=espacioReservas]")
        if (!selectorEspacio) {
            return
        }
        selectorEspacio.setAttribute("instanciaBusqueda", instanciaUID)
        delete transaccion.instanciaUID
        const origen = transaccion.origen
        delete transaccion.origen
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const paginaTipo = transaccion.paginaTipo
        delete transaccion.paginaTipo

        const selectorAlmacen = document.querySelector("[areaGrid=gridBuscadorReservas]")?.getAttribute("almacen") || "{}"
        const almacen = JSON.parse(selectorAlmacen)

        let nombreColumnaURL
        const nombreColumna = transaccion.nombreColumna
        if ((nombreColumna)?.toLowerCase() === "reservauid") {
            nombreColumnaURL = "reserva"
        } else
            if ((nombreColumna)?.toLowerCase() === "estadoreservaidv") {
                nombreColumnaURL = "estado_reserva"
            } else if (nombreColumna) {
                nombreColumnaURL = casaVitini.utilidades.cadenas.camelToSnake(nombreColumna)
            }
        transaccion.pagina = Number(transaccion?.pagina || 1)
        const tipoConsulta_entrada = transaccion.tipoConsulta || almacen?.tipoConsulta
        const peticion = {
            zona: "administracion/reservas/buscador/listarReservas",
            tipoConsulta: tipoConsulta_entrada
        }
        if (tipoConsulta_entrada === "porTerminos") {
            peticion.termino = transaccion.termino || almacen?.termino
            peticion.nombreColumna = transaccion.nombreColumna
            peticion.sentidoColumna = transaccion.sentidoColumna
            peticion.pagina = transaccion.pagina

        }

        if (tipoConsulta_entrada === "hoy") {
            peticion.tipoCoincidencia = transaccion.tipoCoincidencia
            peticion.pagina = transaccion.pagina

        }

        if (tipoConsulta_entrada === "rango") {
            peticion.tipoCoincidencia = transaccion.tipoCoincidencia || almacen?.tipoCoincidencia
            peticion.fechaEntrada = transaccion.fechaEntrada || almacen?.fechaEntrada
            peticion.fechaSalida = transaccion.fechaSalida || almacen?.fechaSalida

            peticion.nombreColumna = transaccion.nombreColumna
            peticion.sentidoColumna = transaccion.sentidoColumna

            peticion.pagina = transaccion.pagina
        }
        const respuestaServidor = await casaVitini.shell.servidor(peticion)

        const instanciaRenderizada = document.querySelector(`[instanciaBusqueda="${instanciaUID}"]`)
        if (!instanciaRenderizada) {
            return
        }

        if (respuestaServidor?.error) {
            this.contructorMarcoInfo()
            document.querySelector("[componente=estadoBusqueda]").textContent = respuestaServidor?.error
            return
        }
        if (respuestaServidor?.totalReservas === 0) {
            this.contructorMarcoInfo()
            document.querySelector("[gridUID=gridReservas]")?.remove()
            document.querySelector("[componenteID=navegacionPaginacion]")?.remove()
            document.querySelector("[componente=estadoBusqueda]").textContent = "No se han encontrado reservas"
            return
        }
        document.querySelector("[componente=estadoBusqueda]")?.remove()
        const reservas = respuestaServidor.reservas
        const paginasTotales = respuestaServidor.paginasTotales
        const pagina = respuestaServidor.pagina

        const sentidoColumna = respuestaServidor.sentidoColumna
        const tipoConsulta = respuestaServidor.tipoConsulta
        const tipoCoincidencia = respuestaServidor.tipoCoincidencia
        const termino = respuestaServidor.termino
        const fechaEntrada = respuestaServidor.fechaEntrada
        const fechaSalida = respuestaServidor.fechaSalida


        reservas.forEach(r => {
            const estadoReservaIDV = r.estadoReservaIDV
            r.estadoReservaIDV = estadoReservaIDV.charAt(0).toUpperCase() + estadoReservaIDV.slice(1);
        })
        console.log("reservas", reservas)

        const columnasGrid = [
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
            },
            {
                columnaUI: "Estado de la reserva",
                columnaIDV: "estadoReservaIDV",
            },
            {
                columnaUI: "Titular de la reserva",
                columnaIDV: "nombreCompleto",
            },
            {
                columnaUI: "Pasaporte del titular",
                columnaIDV: "pasaporteTitular",
            },
            {
                columnaUI: "Correo del titular",
                columnaIDV: "mailTitular",
            },
            {
                columnaUI: "Fecha de la reserva",
                columnaIDV: "fechaCreacion",
            },
        ]

        const parametrosFinales = {}

        if (tipoConsulta === "porTerminos") {
            parametrosFinales.tipo_consulta = "por_terminos"
            parametrosFinales.termino = termino
        }
        if (tipoConsulta === "rango") {
            parametrosFinales.tipo_consulta = "rango"
            parametrosFinales.tipo_coincidencia = casaVitini.utilidades.cadenas.camelToSnake(tipoCoincidencia)

            if (tipoCoincidencia === "cualquieraQueCoincida") {
                parametrosFinales.fecha_entrada = fechaEntrada
                parametrosFinales.fecha_salida = fechaSalida
            } else if (tipoCoincidencia === "soloDentroDelRango") {
                parametrosFinales.fecha_entrada = fechaEntrada
                parametrosFinales.fecha_salida = fechaSalida
            } else if (tipoCoincidencia === "porFechaDeEntrada") {
                parametrosFinales.fecha_entrada = fechaEntrada
            } else if (tipoCoincidencia === "porFechaDeSalida") {
                parametrosFinales.fecha_salida = fechaSalida
            }
        }

        if (nombreColumna) {
            parametrosFinales.nombre_columna = nombreColumnaURL
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
        const constructorAlmacen = {
            tipoConsulta
        }
        if (tipoConsulta === "porTerminos") {
            constructorAlmacen.termino = termino
        }
        if (tipoConsulta === "rango") {
            constructorAlmacen.tipoCoincidencia = tipoCoincidencia
            constructorAlmacen.fechaEntrada = fechaEntrada
            constructorAlmacen.fechaSalida = fechaSalida
        }

        casaVitini.ui.componentes.componentesComplejos.grid.despliegue({
            metodoSalida: "administracion.reservas.buscador.mostrarReservasResueltas",
            configuracionGrid: {
                filas: reservas,
                almacen: constructorAlmacen,
                sentidoColumna: sentidoColumna,
                nombreColumna: nombreColumna,
                pagina: pagina,
                destino: "[contenedor=reservasEncontradas]",
                columnasGrid: columnasGrid,
                gridUID: "gridBuscadorReservas",
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

        const titulo = ""
        const estado = {
            zona: constructorURLFinal,
            EstadoInternoZona: "estado",
            tipoCambio: "parcial",
            componenteExistente: "navegacionZonaAdministracion",
            funcionPersonalizada: "administracion.reservas.buscador.mostrarReservasResueltas",
            args: transaccion
        }


        if (origen === "url" || origen === "botonMostrarReservas") {
            window.history.replaceState(estado, titulo, constructorURLFinal);
        } else if ((origen === "botonNumeroPagina" && paginaTipo === "otra") || origen === "tituloColumna") {
            window.history.pushState(estado, titulo, constructorURLFinal);
        } else if (origen === "botonNumeroPagina" && paginaTipo === "actual") {
            window.history.replaceState(estado, titulo, constructorURLFinal);
        }

        this.aplicadaDataBuscadorUI({
            tipoConsulta: tipoConsulta,
            termino: termino,
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            tipoCoincidencia: tipoCoincidencia

        })
    },
    verReservasHoy: function () {
        const instanciaUID = document.querySelector("main[instanciaUID]").getAttribute("instanciaUID")

        const espacioReservas = document.querySelector("[contenedor=reservasEncontradas]")
        const buscadorUI = document.querySelector("[componente=navegacionZonaAdministracion]")
        document.querySelector("[componente=estadoBusqueda]")?.remove()
        document.querySelector("[gridUID=gridReservas]")?.remove()
        document.querySelector("[componenteID=navegacionPaginacion]")?.remove()
        document.querySelector("[contenedor=filtrosOrden]")?.remove()
        espacioReservas.innerHTML = null
       this.limpiarFormularioBusqueda()
        const estadoBusquedaUI = document.createElement("div")
        estadoBusquedaUI.classList.add("buscadorClientesEstadoBusqueda")
        estadoBusquedaUI.setAttribute("componente", "estadoBusqueda")
        estadoBusquedaUI.textContent = "Buscando..."
        buscadorUI.parentNode.insertBefore(estadoBusquedaUI, buscadorUI.nextSibling);

        const peticion = {
            pagina: 1,
            tipoConsulta: "hoy",
            origen: "url",
            instanciaUID: instanciaUID,
            tipoCoincidencia: "porFechaEntrada"
        }
       this.mostrarReservasResueltas(peticion)
    },
    mostrarReservasPorRango: function () {
        const fechaEntrada = document.querySelector("[calendario=entrada]")?.getAttribute("memoriaVolatil")
        const fechaSalida = document.querySelector("[calendario=salida]")?.getAttribute("memoriaVolatil")
        const buscadorUI = document.querySelector("[componente=navegacionZonaAdministracion]")

        const tipoRango = document.querySelector("[estadoSelecion=activado]")?.getAttribute("selectorRango")
        document.querySelector("[gridUID=gridReservas]")?.remove()
        document.querySelector("[componente=estadoBusqueda]")?.remove()
        document.querySelector("[componenteID=navegacionPaginacion]")?.remove()
        document.querySelector("[contenedor=filtrosOrden]")?.remove()

        const espacioReservas = document.querySelector("[contenedor=reservasEncontradas]")
        espacioReservas.innerHTML = null

        const estadoBusquedaUI = document.createElement("div")
        estadoBusquedaUI.classList.add("buscadorClientesEstadoBusqueda")
        estadoBusquedaUI.setAttribute("componente", "estadoBusqueda")
        estadoBusquedaUI.textContent = "Buscando..."
        buscadorUI.parentNode.insertBefore(estadoBusquedaUI, buscadorUI.nextSibling);

        const selectorCampoBuscador = document.querySelector("[componenteCampo=buscadorPorId]")
        selectorCampoBuscador.value = null
        const peticion = {
            pagina: 1,
            tipoConsulta: "rango",
            tipoCoincidencia: tipoRango,
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            origen: "botonMostrarReservas",
        }

       this.mostrarReservasResueltas(peticion)
    },
    buscadorReservas: function (reserva) {

        const espacioReservas = document.querySelector("[contenedor=reservasEncontradas]")
        const buscadorUI = document.querySelector("[componente=navegacionZonaAdministracion]")
        clearTimeout(casaVitini.componentes.temporizador);
        document.querySelector("[componente=resultadosSinReservas]")?.remove()
        document.querySelector("[gridUID=gridReservas")?.remove()
        document.querySelector("[componenteID=navegacionPaginacion]")?.remove()
        espacioReservas.innerHTML = null

        const estadoBusqueda_r = document.querySelector("[componente=estadoBusqueda]")
        if (!estadoBusqueda_r) {
            this.constructorMarcoInfo()
        }
        const estadoBusqueda_s = document.querySelector("[componente=estadoBusqueda]")
        estadoBusqueda_s.textContent = "Buscando reservas..."



       this.limpiarFormularioBusqueda()
        const terminoBusqueda = reserva.target.value
        if (terminoBusqueda.length === 0) {
            clearTimeout(casaVitini.componentes.temporizador);
            document.querySelector("[gridUID=gridReservas")?.remove()
            document.querySelector("[componenteID=navegacionPaginacion]")?.remove()
            document.querySelector("[componente=estadoBusqueda]")?.remove()
            const vistaActual = document.querySelector("[componente=uiNavegacion]").getAttribute("vistaActual")
            const resetUrl = "/administracion/reservas"
            const titulo = "casavitini"
            const estado = {
                zona: vistaActual,
                estadoInternoZona: "estado",
                tipoCambio: "total"
            }
            window.history.replaceState(estado, titulo, resetUrl);
            return
        }
        casaVitini.componentes.temporizador = setTimeout(() => {
            const peticion = {
                pagina: Number("1"),
                tipoConsulta: "porTerminos",
                termino: terminoBusqueda,
                origen: "botonMostrarReservas",
            }
           this.mostrarReservasResueltas(peticion);
        }, 1500);
    },
    constructorMarcoInfo: function () {
        const campo = document.querySelector("[componente=navegacionZonaAdministracion]")

        const estadoBusquedaUI = document.createElement("div")
        estadoBusquedaUI.classList.add("botonV1BlancoIzquierda_noSeleccionable")
        estadoBusquedaUI.setAttribute("componente", "estadoBusqueda")
        estadoBusquedaUI.textContent = "Buscando reservas..."

        const comRenderizado = document.querySelector("[componente=estadoBusqueda]")
        if (!comRenderizado) {
            campo.parentNode.insertBefore(estadoBusquedaUI, campo.nextSibling);
        }
    },
    limpiarFormularioBusqueda: function () {
        const selectorCuadradoFechaEntrada = document.querySelector("[calendario=entrada]")
        const selectorFechaEntradaUI = selectorCuadradoFechaEntrada.querySelector("[fechaUI=fechaInicio]")
        const selectorCuadradoFechaSalida = document.querySelector("[calendario=salida]")
        const selectorFechaSalidaUI = selectorCuadradoFechaSalida.querySelector("[fechaUI=fechaFin]")
        selectorCuadradoFechaEntrada.removeAttribute("memoriaVolatil")
        selectorFechaEntradaUI.textContent = "(Seleccionar)"
        selectorCuadradoFechaSalida.removeAttribute("memoriaVolatil")
        selectorFechaSalidaUI.textContent = "(Seleccionar)"
        const selectorRangos = document.querySelectorAll(`[selectorRango]`)
        selectorRangos.forEach((selectorRango) => {
            selectorRango.removeAttribute("style")
        })
    },
    aplicadaDataBuscadorUI: function (data) {

        const campoBuscador = document.querySelector("[componenteCampo=buscadorPorId]")
        const selectorRangos = document.querySelectorAll(`[selectorRango]`)

        const selectorCuadradoFechaEntrada = document.querySelector("[calendario=entrada]")
        const selectorFechaEntradaUI = selectorCuadradoFechaEntrada?.querySelector("[fechaUI=fechaInicio]")
        const selectorCuadradoFechaSalida = document.querySelector("[calendario=salida]")
        const selectorFechaSalidaUI = selectorCuadradoFechaSalida?.querySelector("[fechaUI=fechaFin]")

        const tipoConsulta = data.tipoConsulta

        if (tipoConsulta === "porTerminos") {
            const selectorRangos = document.querySelectorAll(`[selectorRango]`)
            selectorRangos.forEach((selectorRango) => {
                selectorRango.removeAttribute("style")
            })
            selectorCuadradoFechaEntrada.removeAttribute("memoriaVolatil")
            selectorFechaEntradaUI.textContent = "Seleccionar"
            selectorCuadradoFechaSalida.removeAttribute("memoriaVolatil")
            selectorFechaSalidaUI.textContent = "Seleccionar"

            const termino = data.termino
            campoBuscador.value = termino
        } else if (tipoConsulta === "rango") {

            const fechaEntrada = data.fechaEntrada
            const fechaSalida = data.fechaSalida
            const tipoCoincidencia = data.tipoCoincidencia

            campoBuscador.value = ""
            selectorRangos.forEach((selectorRango) => {
                selectorRango.removeAttribute("style")
            })


            if (fechaEntrada) {


                selectorCuadradoFechaEntrada.setAttribute("memoriaVolatil", fechaEntrada)
                selectorFechaEntradaUI.textContent = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaEntrada)
            }
            if (fechaSalida) {
                selectorCuadradoFechaSalida.setAttribute("memoriaVolatil", fechaSalida)
                selectorFechaSalidaUI.textContent = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaSalida)
            }


            const selectorRango = document.querySelector(`[selectorRango=${tipoCoincidencia}]`)
            selectorRango.style.background = "rgb(8, 0, 255)"
            selectorRango.style.color = "white"
            selectorRango.setAttribute("estadoSelecion", "activado")

        }

    }
}