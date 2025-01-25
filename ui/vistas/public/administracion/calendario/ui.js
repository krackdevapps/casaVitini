casaVitini.view = {
    start: async function () {
        try {
            const html = document.querySelector("html")
            html.style.height = "100%"

            const main = document.querySelector("main")
            main.setAttribute("zonaCSS", "administracion/calendario")

            const sectionRenderizada = document.querySelector("main")
            sectionRenderizada.style.maxWidth = "100%"

            const contenedorBotonesGlobales = this.contenedorBotonesGlobales()
            main.appendChild(contenedorBotonesGlobales)

            const configuracionUI = await casaVitini.view.__sharedMethods__.configuracion.obtenerConfiguracion({
                paresConfIDV: [
                    "calendario.tipoSeleccion",
                    "calendario.tipoVision"
                ]
            })

            const vision = configuracionUI.paresConfiguracion["calendario.tipoVision"]
            const tipoSeleccion = configuracionUI.paresConfiguracion["calendario.tipoSeleccion"]
            const botonSel = main.querySelector("[panel=botonesGlobales] [boton=tipoSel]")

            if (!tipoSeleccion) {
                botonSel.setAttribute("tipoSel", "porDiasIndividual")
            } else {
                botonSel.setAttribute("tipoSel", tipoSeleccion)
            }
            if (!vision || vision === "horizontal") {
                return this.vision.visionHorizontal()
            } else if (vision === "vertical") {
                return this.vision.visionVertical()
            }
        } catch (error) {
            console.error("error", error)
        }
    },
    traductorURL: function () {
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const parametros = granuladoURL.parametros
        const contenedorSeguroParaParametros = granuladoURL.contenedorSeguroParaParametros
        const fecha = parametros?.fecha || null
        const vision = parametros.vision
        const contenedor = {
            fecha,
            vision,
            capas: [],
            capasCompuestas: {}
        }
        const parametrosIgnorables = ["fecha", "vision"]
        for (const c of contenedorSeguroParaParametros) {
            const [parametroIDV, valor] = c.split(":")
            if (parametrosIgnorables.includes(parametroIDV)) { continue }
            if (parametroIDV === "capa") {
                const capaEnCamel = casaVitini.utilidades.cadenas.snakeToCamel(valor)
                contenedor.capas.push(capaEnCamel)
            } else {
                const capaCompuestaIDV = casaVitini.utilidades.cadenas.snakeToCamel(parametroIDV)
                const composicionCapa = valor.split("=")
                const parametrosEnCammel = composicionCapa.map((p) => casaVitini.utilidades.cadenas.snakeToCamel(p))
                contenedor.capasCompuestas[capaCompuestaIDV] = parametrosEnCammel
            }
        }
        return contenedor
    },
    contenedorBotonesGlobales: function () {
        const marcoBotonesGlobales = document.createElement("nav")
        marcoBotonesGlobales.setAttribute("class", "marcoBotonesGlobales")
        marcoBotonesGlobales.setAttribute("panel", "botonesGlobales")

        const botonSelectorMultiCapa = document.createElement("div")
        botonSelectorMultiCapa.classList.add("botonGlobal")
        botonSelectorMultiCapa.textContent = "Capas"
        botonSelectorMultiCapa.addEventListener("click", async () => {
            this.componentesUI.capas()
        })
        marcoBotonesGlobales.appendChild(botonSelectorMultiCapa)

        const botonHoy = document.createElement("div")
        botonHoy.classList.add("botonGlobal")
        botonHoy.textContent = "Hoy"
        botonHoy.addEventListener("click", (e) => {
            this.verHoy(e)
        })
        marcoBotonesGlobales.appendChild(botonHoy)

        // const botonPreciosDelDia = document.createElement("div")
        // botonPreciosDelDia.classList.add("administracion_calendario_selectorCapa")
        // botonPreciosDelDia.textContent = "Precio de la noche"
        // botonPreciosDelDia.addEventListener("click", (e) => {
        //     casaVitini.view.componentesUI.preciosNocheApartamentos(e)
        // })
        // marcoBotonesGlobales.appendChild(botonPreciosDelDia)


        const botonIrAFecha = document.createElement("div")
        botonIrAFecha.classList.add("botonGlobal")
        botonIrAFecha.textContent = "Ir a fecha"
        botonIrAFecha.addEventListener("click", () => {
            this.componentesUI.menuIrAFecha.arranque()
        })
        marcoBotonesGlobales.appendChild(botonIrAFecha)

        const botonVision = document.createElement("div")
        botonVision.classList.add("botonGlobal")
        botonVision.textContent = "Visión"
        botonVision.addEventListener("click", () => {
            this.vision.controladorVision()
        })
        marcoBotonesGlobales.appendChild(botonVision)

        const botonTipoSel = document.createElement("div")
        botonTipoSel.classList.add("botonGlobal")
        botonTipoSel.setAttribute("boton", "tipoSel")
        botonTipoSel.textContent = "Selección"
        botonTipoSel.addEventListener("click", () => {
            this.seleccion.controladorSeleccion()
        })
        marcoBotonesGlobales.appendChild(botonTipoSel)

        return marcoBotonesGlobales
    },
    constructorCalendarioNuevo: function (metadatos) {
        const almacenamientoVolatilUID = metadatos.almacenamientoCalendarioID
        const instanciaUID_main = metadatos.instanciaUID_main
        if (!almacenamientoVolatilUID) {
            let error = "El constructor del calendario, necesita un nombre para el almacenamiento volátil"
            casaVitini.ui.componentes.advertenciaInmersiva(error)
        }
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const calendario = document.createElement("div")
        calendario.classList.add(
            "administracion_calendario_calendarioUI",
            "sobreControlAnimacionGlobal"
        )
        calendario.setAttribute("campo", "calendario")
        calendario.setAttribute("vision", "horizontal")
        calendario.setAttribute("contenedor", "calendario")
        calendario.setAttribute("componente", "marcoCalendarioGlobal")
        calendario.setAttribute("almacenamientoCalendarioID", almacenamientoVolatilUID)
        calendario.setAttribute("elemento", "flotante")

        const cartelInfoCalendarioEstado = document.createElement("div")
        cartelInfoCalendarioEstado.setAttribute("class", "cartelInfoCalendarioEstado")
        cartelInfoCalendarioEstado.setAttribute("componente", "infoCalendario")
        cartelInfoCalendarioEstado.setAttribute("campo", "calendario")


        const navegacionMes = document.createElement("nav")
        navegacionMes.setAttribute("class", "administracion_calendario_navegacionMes")
        calendario.appendChild(navegacionMes)

        const botonNavegacionMesAtras = document.createElement("div")
        botonNavegacionMesAtras.setAttribute("class", "administracion_calendario_botonNavegacion")
        botonNavegacionMesAtras.setAttribute("id", "botonAtras")
        botonNavegacionMesAtras.setAttribute("sentido", "atras")
        botonNavegacionMesAtras.textContent = "Atras"
        botonNavegacionMesAtras.addEventListener("click", async () => {
            await this.navegacionCalendarioNuevo({
                sentido: "atras",
                instanciaUID_main
            })
        })
        navegacionMes.appendChild(botonNavegacionMesAtras)
        const contenedorCentralCalendario = document.createElement("div")
        contenedorCentralCalendario.classList.add("administracion_calendario_contenedorCentralCalendario")
        const contenedorHerramientasCalendario = document.createElement("div")
        contenedorHerramientasCalendario.classList.add("administracion_calendario_contenedorHerramientasCalendario")
        // const botonHoy = document.createElement("div")
        // botonHoy.classList.add("administracion_calendario_selectorCapa")
        // botonHoy.textContent = "Hoy"
        // botonHoy.addEventListener("click", (e) => {
        //     casaVitini.view.verHoy(e)
        // })
        // contenedorHerramientasCalendario.appendChild(botonHoy)
        contenedorCentralCalendario.appendChild(contenedorHerramientasCalendario)
        const navegacionMesReferencia = document.createElement("div")
        navegacionMesReferencia.setAttribute("id", "navegacionMesReferencia")
        navegacionMesReferencia.setAttribute("class", "navegacionMesReferencia")
        navegacionMesReferencia.setAttribute("componente", "mesReferencia")
        contenedorCentralCalendario.appendChild(navegacionMesReferencia)
        navegacionMes.appendChild(contenedorCentralCalendario)
        const botonNavegacionMesAdelante = document.createElement("div")
        botonNavegacionMesAdelante.setAttribute("class", "administracion_calendario_botonNavegacion")
        botonNavegacionMesAdelante.setAttribute("id", "botonAdelante")
        botonNavegacionMesAdelante.textContent = "Adelante"
        botonNavegacionMesAdelante.setAttribute("sentido", "adelante")
        botonNavegacionMesAdelante.addEventListener("click", async () => {
            await this.navegacionCalendarioNuevo({
                sentido: "adelante",
                instanciaUID_main
            })
        })
        navegacionMes.appendChild(botonNavegacionMesAdelante)

        const pilaDias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

        const contenedorDiasSemana = document.createElement("div")
        contenedorDiasSemana.classList.add("contenedorDiasSemana")
        calendario.appendChild(contenedorDiasSemana)

        for (const nombreDia of pilaDias) {
            let diaSemana = document.createElement("li")
            diaSemana.setAttribute("class", "nombreDia")
            diaSemana.setAttribute("tipoNombreDia", "extendido")
            diaSemana.textContent = nombreDia
            contenedorDiasSemana.appendChild(diaSemana)
        }
        const pilaDiasAbreviados = ["L", "M", "X", "J", "V", "S", "D"]
        for (const nombreDia of pilaDiasAbreviados) {
            let diaSemana = document.createElement("li")
            diaSemana.setAttribute("class", "nombreDia")
            diaSemana.setAttribute("tipoNombreDia", "abreviado")
            diaSemana.textContent = nombreDia
            contenedorDiasSemana.appendChild(diaSemana)
        }

        const marcoMes = document.createElement("ol")
        marcoMes.setAttribute("id", "marcoMes")
        marcoMes.setAttribute("class", "administracion_calendario_marcoMes")
        marcoMes.setAttribute("componente", "marcoMes")
        marcoMes.setAttribute("instanciaUID", "uidInicialMes")
        calendario.appendChild(marcoMes)

        const seccion = document.querySelector("main:not([estado=obsoleto])")
        const bloqueCalendario = document.createElement("div")
        bloqueCalendario.setAttribute("class", "adminsitracion_calendario_bloqueCalendario")
        bloqueCalendario.setAttribute("instanciaUID", instanciaUID)
        bloqueCalendario.setAttribute("componente", "calendarioGlobal")

        const contenedoCalendarioIntermedio = document.createElement("div")
        contenedoCalendarioIntermedio.setAttribute("class", "administracion_calendario_contenedorCalentadioIntermedio")


        const mensajeSpinner = "Construyendo calendario..."
        const spinner = casaVitini.ui.componentes.spinnerSimple(mensajeSpinner)
        const contenedorCarga = document.createElement("div")
        contenedorCarga.classList.add("administracion_calendario_componente_calendario_contenedoCarga")
        contenedorCarga.setAttribute("contenedor", "construyendoCalendario")

        contenedorCarga.appendChild(spinner)
        contenedoCalendarioIntermedio.appendChild(calendario)
        contenedoCalendarioIntermedio.appendChild(contenedorCarga)
        bloqueCalendario.appendChild(contenedoCalendarioIntermedio)
        contenedorCarga?.remove()
        contenedoCalendarioIntermedio.style.flex = "1"
        document.querySelector(`main[instanciaUID="${instanciaUID_main}"]`)?.appendChild(bloqueCalendario)
    },
    constructorMesNuevo: function (calendario) {
        const instanciaUIDMes = calendario.instanciaUIDMes
        const selectorMes_enEspera = document.querySelector(`[instanciaUID="${instanciaUIDMes}"]`)
        if (!selectorMes_enEspera) {
            return
        }
        const selectorCalendarioRenderizado = selectorMes_enEspera.closest("[contenedor=calendario]")
        selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
        selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
        selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
        selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
        const contenedorMes = selectorCalendarioRenderizado.querySelector(`[componente=marcoMes][instanciaUID="${instanciaUIDMes}"]`)
        if (contenedorMes) {
            // selectorCalendarioRenderizado.querySelector("[contenedor=construyendoCalendario]")?.remove()
        }
        //contenedorMes?.removeAttribute("style")
        selectorCalendarioRenderizado.removeAttribute("style")

        const nombreMes = ["Enero", "Febrero", "Marzo", "Abrir", "Mayo", "Junio", "Julio", "Agost", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
        const nombreMesFinal = nombreMes[calendario.mes - 1]
        const indicadorMesAno = nombreMesFinal + " " + calendario.ano

        const navegacionMesReferencia = selectorCalendarioRenderizado.querySelector("[componente=mesReferencia]")
        if (!navegacionMesReferencia) {
            return
        }

        navegacionMesReferencia.textContent = indicadorMesAno
        navegacionMesReferencia.setAttribute("ano", calendario.ano)
        navegacionMesReferencia.setAttribute("mes", calendario.mes)
        const posicionDia1 = calendario.posicionDia1
        const numeroDiasPorMes = calendario.numeroDiasPorMes;
        const diaActual = calendario.dia

        const perfilMes = selectorCalendarioRenderizado?.getAttribute("perfilMes")

        let mesActual = calendario.mes
        let anoActual = calendario.ano
        mesActual = String(mesActual).padStart(2, "0");
        mesActual = Number(mesActual)
        anoActual = Number(anoActual)
        const marcoMes = selectorCalendarioRenderizado.querySelector(`[componente=marcoMes][instanciaUID="${instanciaUIDMes}"]`)
        for (let index = 1; index < posicionDia1; index++) {
            const bloqueDia = document.createElement("li")
            bloqueDia.setAttribute("componente", "diaVacio")
            const numeroDiaUI = document.createElement("div")
            numeroDiaUI.classList.add("administracion_calendario_numeroDiaUI")

            bloqueDia.appendChild(numeroDiaUI)
            marcoMes?.appendChild(bloqueDia)
        }
        selectorCalendarioRenderizado?.setAttribute("perfilMes", perfilMes)
        for (let numeroDia = 0; numeroDia < numeroDiasPorMes; numeroDia++) {
            let diaFinal = numeroDia + 1;
            diaFinal = Number(diaFinal)
            const bloqueDia = document.createElement("li")
            bloqueDia.setAttribute("class", "administracion_calendario_componenteCalendario_dia")
            // bloqueDia.addEventListener("click", (e) => {
            //     //  casaVitini.view.controladorSelecionDias.selectorDia.hub(e)
            // })
            const contenedorDia = document.createElement("div")
            contenedorDia.classList.add("administracion_calendario_contenedorInformacionDia")
            contenedorDia.setAttribute("componente", "contenedorDia")
            const numeroDiaUI = document.createElement("div")
            numeroDiaUI.classList.add("administracion_calendario_numeroDiaUI")
            numeroDiaUI.textContent = diaFinal
            contenedorDia.appendChild(numeroDiaUI)

            const espacioEventosEtereo = document.createElement("div")
            contenedorDia.appendChild(espacioEventosEtereo)

            const contenedorData = document.createElement("div")
            contenedorData.classList.add("celdaDiaContenedorData")
            contenedorData.setAttribute("contenedor", "data")
            //contenedorData.textContent = "Data test"
            contenedorDia.appendChild(contenedorData)

            const contenedorCapa = document.createElement("div")
            contenedorCapa.classList.add("administracion_calendario_contenedorCapa")
            contenedorCapa.setAttribute("contenedor", "capa")

            if (diaFinal === 1) {
            }
            bloqueDia.setAttribute("dia", String(diaFinal).padStart(2, "0"))
            bloqueDia.setAttribute("estado", "disponible")

            if (calendario.tiempo === "presente") {
                if (diaFinal === diaActual) {
                    bloqueDia.classList.add("diaDeHoy")
                }
            }
            bloqueDia.appendChild(contenedorDia)
            marcoMes?.appendChild(bloqueDia)
        }

    },
    calendarioVertical: {
        arranque: async function (data) {
            const mesInicial = String(data.mes).padStart(2, "0")
            const anoInicial = data.ano
            const sectionRenderizada = document.querySelector("main")
            const instanciaUID_main = sectionRenderizada.getAttribute("instanciaUID")

            const calendarioResuelto = await casaVitini.view.resolverCalendarioNuevo({
                tipo: "rangoAnualDesdeFecha",
                ano: Number(anoInicial),
                mes: Number(mesInicial)
            })
            const main = document.querySelector("main")
            main.style.overflow = "hidden"

            const contenedor = document.createElement("div")
            contenedor.setAttribute("componente", "calendarioGlobal")
            contenedor.classList.add("flexVertical", "sobreControlAnimacionGlobal")
            contenedor.style.overflow = "hidden"
            contenedor.setAttribute("vision", "vertical")
            contenedor.style.width = "100%"

            main.appendChild(contenedor)

            const tituloMesGlobal = document.createElement("div")
            tituloMesGlobal.classList.add("flexVertical", "padding6", "textoCentrado")
            tituloMesGlobal.setAttribute("data", "fechaActual1")
            tituloMesGlobal.textContent = "Esperando al servidor..."
            contenedor.appendChild(tituloMesGlobal)

            const diasSemana = document.createElement("div")
            diasSemana.classList.add("diasSemana_calendarioVertical")
            diasSemana.style.borderBottom = "1px solid grey"
            contenedor.appendChild(diasSemana)

            const dias = [
                "L",
                "M",
                "X",
                "J",
                "V",
                "S",
                "D"
            ]
            const nombreMes = ["Enero", "Febrero", "Marzo", "Abrir", "Mayo", "Junio", "Julio", "Agost", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
            dias.forEach((d) => {
                const dia = document.createElement("p")
                dia.classList.add("textoCentrado")
                dia.textContent = d
                diasSemana.appendChild(dia)
            })

            const mesesUI = this.contructorMes(calendarioResuelto)
            contenedor.appendChild(mesesUI)
            const container = document.querySelector("[contenedor=meses]");

            let mesVisibleActual = null;
            const visibilidadMeses = new Map();
            const observer_titulo = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const mesIDV = entry.target.getAttribute('mesIDV');
                    visibilidadMeses.set(mesIDV, entry.intersectionRatio);
                    let mesConMayorVisibilidad = null;
                    let maxPorcentajeVisibilidad = 0;
                    visibilidadMeses.forEach((porcentaje, mes) => {
                        if (porcentaje > maxPorcentajeVisibilidad) {
                            maxPorcentajeVisibilidad = porcentaje;
                            mesConMayorVisibilidad = mes;
                        }
                    });
                    if (mesConMayorVisibilidad && mesConMayorVisibilidad !== mesVisibleActual) {
                        mesVisibleActual = mesConMayorVisibilidad;
                        const traductorURL = casaVitini.view.traductorURL();
                        const [mes, ano] = mesVisibleActual.split("-");
                        const fechaUI = `${nombreMes[mes - 1]} ${ano}`;
                        const tituloMesGlobal = document.querySelector("[data=fechaActual1]");
                        if (tituloMesGlobal) {
                            tituloMesGlobal.textContent = fechaUI;
                            tituloMesGlobal.setAttribute("mesVisible", mesVisibleActual);
                            traductorURL.fecha = `${Number(mes)}-${ano}`;
                        }

                        setTimeout(() => {
                            casaVitini.view.controladorRegistros({
                                tipoRegistro: "actualizar",
                                traductorURL: traductorURL,
                            });
                        }, 700);


                    }
                });
            }, {
                root: container,
                threshold: Array.from(Array(101).keys(), n => n / 100), // Umbrales del 0% al 100%
            });



            const observer_data = new IntersectionObserver((entries) => {
                entries.forEach(entry => {

                    if (entry.isIntersecting) {
                        const traductorURL = casaVitini.view.traductorURL()
                        const contenedorMes = entry.target
                        const mesIDV = contenedorMes.getAttribute('mesIDV')
                        const fecha = mesIDV.split("-")

                        const mes = fecha[0]
                        const ano = fecha[1]
                        this.renderizaDataEnMes({
                            configuracionCalendario: {
                                tipo: "personalizado",
                                ano: Number(ano),
                                mes: Number(mes),
                            },
                            instanciaUID_main,
                            traductorURL
                        })
                    }
                });
            }, {
                root: container, // El contenedor de los meses con scroll
                //  threshold: 0.1   // 60% del mes debe estar visible para considerarlo "visible"
            });

            // Observar cada mes dentro del contenedor
            const months = document.querySelectorAll('[mesIDV]');
            months.forEach(month => {
                observer_titulo.observe(month)
                observer_data.observe(month)
            });
            const fechaInicial = document.querySelector(`[mesIDV="${mesInicial}-${anoInicial}"]`).closest("[contenedor=mes]");
            if (fechaInicial) {
                fechaInicial.scrollIntoView({ behavior: "instant" });
            }
            const correctorIOS = () => {
                if (fechaInicial) {
                    fechaInicial.scrollIntoView({ behavior: "instant" });
                }
            }
            //   setTimeout(correctorIOS, 350);

        },
        renderizaDataEnMes: async function (data) {

            const configuracionCalendario = data.configuracionCalendario
            const instanciaUID_main = data.instanciaUID_main
            const traductorURL = data.traductorURL
            // traductorURL.vision = "vertical"
            const calendarioDestino = document.querySelector(`[instanciaUID="${instanciaUID_main}"] [mesIDV="${String(configuracionCalendario.mes).padStart(2, "0")}-${configuracionCalendario.ano}"]`)

            if (calendarioDestino) {
                const calendarioResuelto = await casaVitini.ui.componentes.calendario.resolverCalendarioNuevo(configuracionCalendario)

                const instanciaUIDMes = calendarioDestino.getAttribute("instanciaUID")

                const estadoActualRenderizado = calendarioDestino.getAttribute("estadoRenderizado")
                if (estadoActualRenderizado === "renderizado") {
                    return
                }
                calendarioDestino.setAttribute("estadoRenderizado", "renderizado")

                casaVitini.view.coloreoDias({
                    ano: calendarioResuelto.ano,
                    mes: calendarioResuelto.mes,
                    instanciaUIDMes: instanciaUIDMes
                })

                traductorURL.fecha = `${calendarioResuelto.mes}-${calendarioResuelto.ano}`
                const capas = traductorURL.capas || {}

                if (Object.keys(capas).length > 0) {
                    casaVitini.view.capas({
                        instanciaUID_main: instanciaUID_main,
                        origen: "historial",
                        traductorURL: traductorURL,
                        instanciaUIDMes: instanciaUIDMes,

                    })
                }
                casaVitini.view.controladorRegistros({
                    tipoRegistro: "actualizar",
                    traductorURL: traductorURL
                })
            }
        },
        contructorMes: function (data) {

            const arbolFechas = data.arbolFechas
            const fechaPresente = data.fechaPresente
            const contenedorMeses = document.createElement("div")
            //contenedorMeses.classList.add("flexVertical")
            contenedorMeses.style.overflow = "hidden"
            contenedorMeses.style.overflowY = "scroll"
            contenedorMeses.setAttribute("contenedor", "meses")

            let primerTituloMesIgnorado = false
            Object.entries(arbolFechas).forEach(af => {
                const [ano, meses] = af
                Object.entries(meses).forEach((m) => {
                    const [mes, c] = m

                    const dias = c.dias
                    const posicionDia1 = c.posicionDia1
                    const nombreMes = ["Enero", "Febrero", "Marzo", "Abrir", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

                    const nombreMesFinal = nombreMes[mes - 1]
                    const indicadorMesAno = nombreMesFinal + " " + ano

                    const tituloMesGlobal = document.createElement("div")
                    tituloMesGlobal.classList.add("flexVertical", "padding6", "textoCentrado")
                    tituloMesGlobal.textContent = indicadorMesAno
                    // contenedorMeses.appendChild(tituloMesGlobal)
                    const instanciaUIDMes = casaVitini.utilidades.codigoFechaInstancia()
                    if (primerTituloMesIgnorado) {
                        contenedorMeses.appendChild(tituloMesGlobal)
                    }
                    primerTituloMesIgnorado = true

                    const contenedorMes = document.createElement("div")
                    // contenedorMes.style.minHeight = "100%"
                    //contenedorMes.style.border = "1px solid transparent"
                    contenedorMes.setAttribute("contenedor", `mes`)
                    contenedorMes.classList.add("flexVertical", "administracion_calendario_marcoMes_verticalMinimo")
                    contenedorMeses.appendChild(contenedorMes)

                    const numeroDiasPorMes = dias.length;

                    let mesActual = mes
                    let anoActual = ano
                    mesActual = String(mesActual).padStart(2, "0");
                    mesActual = Number(mesActual)
                    anoActual = Number(anoActual)


                    const marcoMes = document.createElement("div")
                    marcoMes.classList.add("administracion_calendario_marcoMes_vertical")
                    marcoMes.style.gap = "1px"
                    marcoMes.setAttribute("mesIDV", `${String(mes).padStart(2, "0")}-${ano}`)
                    marcoMes.setAttribute("componente", "marcoMes")
                    marcoMes.setAttribute("instanciaUID", instanciaUIDMes)


                    const columnasCSS = document.createElement("style");
                    columnasCSS.setAttribute("type", "text/css")
                    contenedorMeses.appendChild(columnasCSS);

                    for (let i = 1; i < 8; i++) {  // Itera 8 veces, una para cada grupo de 7 días

                        const zonaCSS = `.calendario_columna_mes_${mes}_ano_${ano}`;
                        const cssRule = `
                            ${zonaCSS}:nth-of-type(7n + ${i}) {
                                grid-column: ${i}/${i};
                            }
                            `;

                        // Añadir la regla al bloque de estilos
                        columnasCSS.textContent += cssRule;

                    }
                    //  

                    const columnasFilas = document.createElement("style");
                    columnasFilas.setAttribute("type", "text/css")
                    contenedorMeses.appendChild(columnasFilas);
                    let start = 1;
                    let gridRow = 1;
                    for (let i = 0; i < 9; i++) {  // Itera 8 veces, una para cada grupo de 7 días
                        const end = start + 6;  // Cada grupo cubre 7 elementos
                        const zonaCSS = `.calendario_fila_mes_${mes}_ano_${ano}`;
                        const cssRule = `
                            ${zonaCSS}:nth-of-type(n + ${start}):nth-of-type(-n + ${end}) {
                            grid-row: ${gridRow};
                            }                          
                            `;

                        // Añadir la regla al bloque de estilos
                        columnasFilas.textContent += cssRule;
                        // Incrementar los valores para la siguiente iteración
                        start += 7;  // Comienza en el siguiente grupo de 7
                        gridRow += 1;  // Cambia la fila de la cuadrícula
                    }

                    for (let index = 1; index < posicionDia1; index++) {
                        const bloqueDia = document.createElement("li")
                        bloqueDia.setAttribute("componente", "diaVacio")
                        bloqueDia.classList.add(
                            `calendario_fila_mes_${mes}_ano_${ano}`,
                            `calendario_columna_mes_${mes}_ano_${ano}`
                        )
                        const numeroDiaUI = document.createElement("div")
                        numeroDiaUI.classList.add("administracion_calendario_numeroDiaUI")

                        bloqueDia.appendChild(numeroDiaUI)
                        marcoMes?.appendChild(bloqueDia)
                    }
                    //selectorCalendarioRenderizado?.setAttribute("perfilMes", perfilMes)
                    for (let numeroDia = 0; numeroDia < numeroDiasPorMes; numeroDia++) {
                        let diaFinal = numeroDia + 1;
                        diaFinal = Number(diaFinal)
                        const fechaISO = `${ano}-${mes}-${String(diaFinal).padStart(2, "0")}`
                        const tiempo = casaVitini.utilidades.calendarios.tiempoDeLaFechas({
                            fechaPresenteISO: fechaPresente,
                            fechaCompararISO: fechaISO
                        })
                        const bloqueDia = document.createElement("li")
                        //bloqueDia.style.background = "#a29f9f6e"
                        // bloqueDia.style.background = "hsl(0deg 0% 50.2% / 10%)"

                        bloqueDia.classList.add(
                            `calendario_fila_mes_${mes}_ano_${ano}`,
                            `calendario_columna_mes_${mes}_ano_${ano}`,
                            "administracion_calendario_componenteCalendario_dia_vertical"
                        )
                        const contenedorDia = document.createElement("div")
                        contenedorDia.classList.add("administracion_calendario_contenedorInformacionDia")
                        contenedorDia.setAttribute("componente", "contenedorDia")
                        const numeroDiaUI = document.createElement("div")
                        numeroDiaUI.classList.add("administracion_calendario_numeroDiaUI")
                        numeroDiaUI.textContent = diaFinal
                        contenedorDia.appendChild(numeroDiaUI)

                        const espacioEventosEtereo = document.createElement("div")
                        contenedorDia.appendChild(espacioEventosEtereo)

                        const contenedorData = document.createElement("div")
                        contenedorData.classList.add("celdaDiaContenedorData")
                        contenedorData.setAttribute("contenedor", "data")
                        //contenedorData.textContent = "Data test"
                        contenedorDia.appendChild(contenedorData)

                        const contenedorCapa = document.createElement("div")
                        contenedorCapa.classList.add("administracion_calendario_contenedorCapa")
                        contenedorCapa.setAttribute("contenedor", "capa")

                        bloqueDia.setAttribute("dia", String(diaFinal).padStart(2, "0"))
                        bloqueDia.setAttribute("estado", "disponible")
                        if (tiempo === "pasado") {
                            bloqueDia.classList.add("diaPasado")

                        }
                        if (fechaPresente === fechaISO) {
                            bloqueDia.classList.add("diaDeHoy_calendarioVertical")
                        }
                        bloqueDia.appendChild(contenedorDia)
                        marcoMes?.appendChild(bloqueDia)
                    }
                    contenedorMes.appendChild(marcoMes)
                })
            })
            return contenedorMeses
        }
    },
    navegacionCalendarioNuevo: async function (data) {
        const boton = data.sentido
        const instanciaUID_main = data.instanciaUID_main

        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const instanciaUIDMes = casaVitini.utilidades.codigoFechaInstancia()
        document.querySelector(`[instanciaUID="${instanciaUID_main}"] [componente=marcoMes]`)
            .setAttribute("instanciaUID", instanciaUIDMes)
        const mesReferencia = document.querySelector("[componente=mesReferencia]")
        let mesActual = Number(mesReferencia.getAttribute("mes"))
        let anoActual = Number(mesReferencia.getAttribute("ano"))
        if (boton === "adelante") {
            if (mesActual + 1 < 13) {
                mesActual = mesActual + 1
            } else {
                mesActual = 1
                anoActual = anoActual + 1
            }
        } else if (boton === "atras") {
            if (mesActual - 1 > 0) {
                mesActual = mesActual - 1
            } else {
                mesActual = 12
                anoActual = anoActual - 1
            }
        }
        const nombreMes = ["Enero", "Febrero", "Marzo", "Abrir", "Mayo", "Junio", "Julio", "Agost", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
        mesReferencia.setAttribute("mes", mesActual)
        mesReferencia.setAttribute("ano", anoActual)
        mesReferencia.textContent = `${nombreMes[mesActual - 1]} ${anoActual}`

        //  let parametrosURL = []

        const traductorURL = this.traductorURL()
        traductorURL.fecha = `${String(mesActual).padStart("2", 0)}-${anoActual}`

        casaVitini.view.controladorRegistros({
            tipoRegistro: "crear",
            traductorURL: traductorURL
        })

        await this.irAFecha({
            tipoRegistro: "crear",
            tipoResolucion: "personalizado",
            ano: anoActual,
            mes: mesActual,
            instanciaUID_main: instanciaUID_main,
            traductorURL: traductorURL
        })

    },
    verHoy: async function (calendarioActual) {
        const main = calendarioActual.target.closest("main")
        const instanciaUID_main = main.getAttribute("instanciaUID")
        const calendarioRenderizado = main.querySelector(`[componente=calendarioGlobal]`)
        const traductorURL = this.traductorURL()
        const vision = document.querySelector("[vision]").getAttribute("vision")
        const fecha = traductorURL.fecha.split("-")
        const mesRenderizado = fecha[0]
        const anoRenderizado = fecha[1]
        const instanciaUIDMes = casaVitini.utilidades.codigoFechaInstancia()


        if (vision === "vertical") {
            const calendarioResuelto = await casaVitini.ui.componentes.calendario.resolverCalendarioNuevo({
                tipo: "actual"
            })
            traductorURL.fecha = `${String(calendarioResuelto.mes).padStart("2", 0)}-${calendarioResuelto.ano}`
            const calendario = { traductorURL: traductorURL }
            calendario.tipoRegistro = "actualizar"
            this.controladorRegistros(calendario)
            const fechaInicial = document.querySelector(`[mesIDV="${String(calendarioResuelto.mes).padStart("2", 0)}-${calendarioResuelto.ano}"] [dia="${calendarioResuelto.dia}"]`);
            if (fechaInicial) {
                fechaInicial.scrollIntoView({ behavior: "instant" });
            }
        } else if (vision === "horizontal") {
            const marcoMes = calendarioRenderizado.querySelector(`[componente=marcoMes]`)
            marcoMes.setAttribute("instanciaUID", instanciaUIDMes)
            marcoMes.style.flex = "0"
            marcoMes.style.transition = "all 0s ease-in-out"


            const selectorDiasRenderizados = calendarioRenderizado.querySelectorAll("[dia], [componente=eventoUI], [componente=diaVacio]")
            selectorDiasRenderizados.forEach((e) => { e?.remove() })
            const contenedorCalendario = calendarioRenderizado.querySelector(`[contenedor=calendario]`)
            const contenedorCarga = document.createElement("div")
            contenedorCarga.classList.add("componente_calendario_contenedoCarga_Mes")
            contenedorCarga.setAttribute("contenedor", "construyendoCalendario")
            contenedorCarga.setAttribute("elemento", "flotante")
            contenedorCarga.appendChild(casaVitini.ui.componentes.spinnerSimple())
            const construyendoCalendarioRenderizado = calendarioRenderizado.querySelector("[contenedor=construyendoCalendario]")
            if (!construyendoCalendarioRenderizado) { contenedorCalendario.appendChild(contenedorCarga) }

            const mesRenderizado_data = await this.irAFecha({
                tipoResolucion: "actual",
                instanciaUID_main: instanciaUID_main,
                traductorURL: traductorURL,
            })
            contenedorCarga?.remove()

            const calendarioResuelto = mesRenderizado_data?.calendarioResuelto
            const anoPresente = calendarioResuelto.ano
            const mesPresente = calendarioResuelto.mes
            const calendario = { traductorURL: traductorURL }
            if ((mesRenderizado !== mesPresente && anoRenderizado === anoPresente) || (anoRenderizado !== anoPresente)) {
                calendario.tipoRegistro = "crear"
                this.controladorRegistros(calendario)
            } else {
                calendario.tipoRegistro = "actualizar"
                this.controladorRegistros(calendario)
            }

        }


    },
    configuraMes: async function (calendario) {

        const ano = calendario.ano
        const mes = calendario.mes
        const tipo = calendario.tipo

        const instanciaUID_main = calendario.instanciaUID_main
        const instanciaUIDMes = casaVitini.utilidades.codigoFechaInstancia()

        const calendarioRenderizado = document.querySelector(`[instanciaUID="${instanciaUID_main}"] [contenedor=calendario]`)

        const selectorDiasRenderizados = calendarioRenderizado.querySelectorAll("[dia], [componente=eventoUI], [componente=diaVacio]")
        selectorDiasRenderizados.forEach((e) => {
            e.remove()
        })
        const contenedorMes = calendarioRenderizado.querySelector(`[componente=marcoMes]`)
        contenedorMes.style.flex = "0"
        contenedorMes.style.transition = "all 0s ease-in-out"

        contenedorMes.setAttribute("instanciaUID", instanciaUIDMes)

        const contenedorCarga = document.createElement("div")
        contenedorCarga.classList.add("componente_calendario_contenedoCarga_Mes")
        contenedorCarga.setAttribute("contenedor", "construyendoCalendario")
        contenedorCarga.setAttribute("elemento", "flotante")
        contenedorCarga.appendChild(casaVitini.ui.componentes.spinnerSimple())

        const construyendoCalendarioRenderizado = calendarioRenderizado.querySelector("[contenedor=construyendoCalendario]")

        if (!construyendoCalendarioRenderizado) {
            calendarioRenderizado.appendChild(contenedorCarga)
        }
        const configuracionCalendario = {
            tipo: tipo
        }
        if (tipo === "personalizado") {
            configuracionCalendario.mes = Number(mes)
            configuracionCalendario.ano = Number(ano)
        }
        const calendarioResuelto = await casaVitini.ui.componentes.calendario.resolverCalendarioNuevo(configuracionCalendario)
        contenedorCarga?.remove()
        contenedorMes.removeAttribute("style")

        contenedorMes.setAttribute("mesIDV", `${String(calendarioResuelto.mes).padStart(2, "0")}-${calendarioResuelto.ano}`)

        const contenedorMes_enEspera = calendarioRenderizado.querySelector(`[componente=marcoMes][instanciaUID="${instanciaUIDMes}"]`)
        if (!contenedorMes_enEspera) { return }
        calendarioResuelto.instanciaUIDMes = instanciaUIDMes
        this.constructorMesNuevo(calendarioResuelto)
        return {
            instanciaUIDMes,
            calendarioResuelto
        }
    },
    controlVertical: function () {
        const selectorSeccion = document.querySelector("main")
        const selectorCalendarioGlobal = document.querySelector("[componente=calendarioGlobal]")
        if (!selectorCalendarioGlobal) {
            window.removeEventListener("resize", () => { this.controlVertical() });
        }
        const altoRenderizadoSection = selectorSeccion.scrollHeight;
        const alturaVentana = window.innerHeight;
        if (alturaVentana > altoRenderizadoSection) {
            selectorCalendarioGlobal.style.position = "absolute"
        } else if (alturaVentana < altoRenderizadoSection) {
            selectorCalendarioGlobal.style.position = "relative"
        } else if (alturaVentana === altoRenderizadoSection) {
            selectorCalendarioGlobal.style.position = "absolute"
        }
    },
    controladorRegistros: function (data) {
        const tipoRegistro = data.tipoRegistro
        const traductorURL = data.traductorURL
        const fecha = traductorURL.fecha.split("-")
        const ano = fecha[1]
        const mes = fecha[0]
        const capasSimples = traductorURL.capas || []
        const capasCompuestas = traductorURL.capasCompuestas || {}

        const constructoCapasSimples = capasSimples.map((capa) => {
            const capaSnake = casaVitini.utilidades.cadenas.camelToSnake(capa)
            return `capa:${capaSnake}`
        })
        const constructoFinalCS = constructoCapasSimples.length > 0 ? `/${constructoCapasSimples.join("/")}` : ""

        const constructoCapasCompuestas = Object.entries(capasCompuestas).map(capaCompuesta => {
            const [nombreCapa, arrayValoresCapaCompuesta] = capaCompuesta
            const nombreCapaSnake = casaVitini.utilidades.cadenas.camelToSnake(nombreCapa)
            const valoresSnake = arrayValoresCapaCompuesta.map((valorCapa) => {
                const valorCapaSnake = casaVitini.utilidades.cadenas.camelToSnake(valorCapa)
                return valorCapaSnake
            })
            return `${nombreCapaSnake}:${valoresSnake.join("=")}`
        })
        const constructoFinalCC = constructoCapasCompuestas.length > 0 ? `/${constructoCapasCompuestas.join("/")}` : ""


        const constructoURL = "/administracion/calendario" + `/fecha:${mes}-${ano}` + constructoFinalCS + constructoFinalCC


        const configuracion = {
            tipoResolucion: "personalizado",
            ano: ano,
            mes: mes,
            origen: "historial",
            traductorURL: traductorURL
        }
        const estado = {
            zona: constructoURL,
            EstadoInternoZona: "estado",
            tipoCambio: "parcial",
            componenteExistente: "marcoCalendarioGlobal",
            funcionPersonalizada: "administracion.calendario.irAFecha",
            args: configuracion
        }
        const titulo = "Administracion"
        if (tipoRegistro === "crear") {
            window.history.pushState(estado, titulo, constructoURL);
        } else if (tipoRegistro === "actualizar") {
            window.history.replaceState(estado, titulo, constructoURL);
        }
    },
    irAFecha: async function (data) {
        const instanciaUID_main_selector = document.querySelector("main").getAttribute("instanciaUID")
        const mes = data?.mes
        const ano = data?.ano
        const origen = data?.origen
        const instanciaUID_main = origen === "historial" ? instanciaUID_main_selector : data.instanciaUID_main
        const traductorURL = data.traductorURL
        const tipoResolucion = data.tipoResolucion

        const mesRenderizado = await this.configuraMes({
            ano: ano,
            mes: mes,
            tipo: tipoResolucion,
            instanciaUID_main: instanciaUID_main
        })
        const calendarioResuelto = mesRenderizado?.calendarioResuelto
        if (calendarioResuelto) {
            this.coloreoDias({
                ano: calendarioResuelto?.ano,
                mes: calendarioResuelto?.mes,
                instanciaUIDMes: calendarioResuelto?.instanciaUIDMes,
            })

            traductorURL.fecha = `${calendarioResuelto.mes}-${calendarioResuelto.ano}`

            const capas = traductorURL.capas || {}
            if (Object.keys(capas).length > 0) {
                this.capas({
                    instanciaUID_main: instanciaUID_main,
                    origen: "historial",
                    traductorURL: traductorURL,
                    instanciaUIDMes: calendarioResuelto?.instanciaUIDMes
                })

            }
            return mesRenderizado

        }


    },
    capas: async function (data) {
        const traductorURL = data.traductorURL
        const instanciaUID_main = data.instanciaUID_main
        const instanciaUIDMes = data.instanciaUIDMes
        const origen = data.origen
        const calendarioRenderizado = document.querySelector(`[instanciaUID="${instanciaUID_main}"]`)
        const mesRenderizado_enEspera = document.querySelector(`[instanciaUID="${instanciaUIDMes}"]`)
        const borrarEventosObsoletos = data.borrarEventosObsoletos || "si"


        if (!mesRenderizado_enEspera) { return }

        const fecha = traductorURL.fecha.split("-")
        const mesRenderizado = Number(fecha[0])
        const anoRenderizado = Number(fecha[1])

        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const parametros = granuladoURL.parametros

        const selectorCapaRenderizada = mesRenderizado_enEspera.querySelectorAll("[componente=eventoUI]")
        selectorCapaRenderizada.forEach((capaRenderizada) => {
            capaRenderizada.remove()
        })


        let tipoRegistroFinal
        if (origen === "menuDesplegable" || origen === "navegacionEntreMeses") {
            tipoRegistroFinal = "crear"
        }

        const ventanaDetallesDelEventoTruncado = (data) => {

            const urlUI = data.urlUI
            const eventoUID = data.eventoUID
            const nombreEventoFinal = data.nombreEventoFinal
            const detallesDelEventoUI = data.detallesDelEventoUI
            const main = document.querySelector("main")
            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
            main.appendChild(ui)
            const contenedor = ui.querySelector("[componente=contenedor]")

            const titulo = document.createElement("div")
            titulo.classList.add(
                "titulo"
            )
            titulo.textContent = `Detalles del evento`
            contenedor.appendChild(titulo)

            const info = document.createElement("p")
            info.classList.add(
                "textoCentrado"
            )
            info.textContent = "Se ha desplegado esta pantalla de información porque el texto del evento no cabía en la celda del evento y se mostraba truncado con elipsis."
            contenedor.appendChild(info)

            const infoDetallesDelEvento = document.createElement("p")
            infoDetallesDelEvento.classList.add(
                "textoCentrado"
            )
            infoDetallesDelEvento.textContent = detallesDelEventoUI
            if (detallesDelEventoUI) {
                contenedor.appendChild(infoDetallesDelEvento)
            }

            const nobreDelEvento = document.createElement("p")
            nobreDelEvento.classList.add(
                "textoCentrado",
                "negrita"
            )
            nobreDelEvento.textContent = nombreEventoFinal
            contenedor.appendChild(nobreDelEvento)

            const botonIrAlEvento = document.createElement("div")
            botonIrAlEvento.classList.add("boton")
            botonIrAlEvento.setAttribute("boton", "cancelar")
            botonIrAlEvento.textContent = "Ir al evento"
            botonIrAlEvento.addEventListener("click", () => {
                const navegacion = {
                    vista: urlUI,
                    tipoOrigen: "menuNavegador"
                }
                casaVitini.shell.navegacion.controladorVista(navegacion)
            })
            if (urlUI) {
                contenedor.appendChild(botonIrAlEvento)
            }

            const botonCancelar = document.createElement("div")
            botonCancelar.classList.add("boton")
            botonCancelar.setAttribute("boton", "cancelar")
            botonCancelar.textContent = "Cerrar y volver a la reserva"
            botonCancelar.addEventListener("click", () => {
                return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
            })
            contenedor.appendChild(botonCancelar)
        }
        const obtenerCoordenadasCeldaGrid = (celdaGrid) => {
            const selectorDiaRenderizado = mesRenderizado_enEspera.querySelector(`[dia="${celdaGrid}"]`);
            const gridContainer = selectorDiaRenderizado.parentElement;
            const items = Array.from(gridContainer.children);

            const index = items.indexOf(selectorDiaRenderizado);

            const columns = parseInt(getComputedStyle(gridContainer).gridTemplateColumns.split(" ").length);


            const row = Math.floor(index / columns) + 1;
            const column = (index % columns) + 1;
            const estructuraFinal = {
                fila: row,
                columna: column
            }
            return estructuraFinal
        }
        const obtenerNumeroDeCeldasEnFila = (filaDeseada) => {
            const gridContainer = mesRenderizado_enEspera
            const celdas = Array.from(gridContainer.children);
            const columnas = parseInt(getComputedStyle(gridContainer).gridTemplateColumns.split(" ").length);
            const indiceInicial = (filaDeseada - 1) * columnas;
            const indiceFinal = filaDeseada * columnas;
            const celdasEnFila = celdas.slice(indiceInicial, indiceFinal);
            return celdasEnFila.length
        }
        const obtenerNumeroDeCeldasConAtributoEnFila = (filaDeseada, atributo) => {
            const gridContainer = mesRenderizado_enEspera
            const celdas = Array.from(gridContainer.children);
            const columnas = parseInt(getComputedStyle(gridContainer).gridTemplateColumns.split(" ").length);
            const indiceInicial = (filaDeseada - 1) * columnas;
            const indiceFinal = filaDeseada * columnas;
            const celdasEnFilaConAtributo = celdas.slice(indiceInicial, indiceFinal).filter(celda => celda.getAttribute(atributo) !== null);
            return celdasEnFilaConAtributo.length;
        }
        const filaDeseada = 2; //Puedes cambiar esto según la fila que te interese
        const numeroDeFilasTotales = (gridUID) => {
            const grid = mesRenderizado_enEspera
            const gridStyles = window.getComputedStyle(grid);
            const gridRows = gridStyles.gridTemplateRows.split(" ").length;
            return gridRows
        }
        const numeroDeFilasConDia = () => {
            const grid = mesRenderizado_enEspera
            const celdasConDia = grid.querySelectorAll("[dia]");
            const filasUnicas = new Set();
            celdasConDia.forEach(celda => {
                const numeroDeFila = window.getComputedStyle(celda).gridRowStart;
                filasUnicas.add(numeroDeFila);
            });

            return filasUnicas.size;
        };
        const diferenciaDeDias = (fechaIncioMes_ISO, fechaSalidaEvento_ISO) => {
            const fecha1 = new Date(fechaIncioMes_ISO); // Primera fecha en formato ISO
            const fecha2 = new Date(fechaSalidaEvento_ISO); // Segunda fecha en formato ISO
            fecha1.setHours(0, 0, 0, 0);
            fecha2.setHours(0, 0, 0, 0);

            const diferenciaEnMilisegundos = fecha2.getTime() - fecha1.getTime();
            const diferenciaEnDiasSalida = Math.floor(diferenciaEnMilisegundos / (1000 * 60 * 60 * 24)) + 1;

            return diferenciaEnDiasSalida;
        }
        const constructorEventoUI = (metadatos) => {
            const eventoUID = metadatos.eventoUID
            const altura = metadatos.altura
            const url = metadatos.url
            const css = metadatos.css
            const inicioColumna = metadatos.inicioColumna
            const espaciadoInferior = metadatos.espaciadoInferior
            const finalColumna = metadatos.finalColumna
            const inicioFila = metadatos.inicioFila
            const tipoEvento = metadatos.tipoEvento

            const detallesDelEvento = metadatos.detallesDelEvento

            let nombreEventoFinal = "Evento sin información"
            let detallesDelEventoUI
            let urlUI
            if (tipoEvento === "reserva") {
                const reservaUID = detallesDelEvento.reservaUID
                nombreEventoFinal = "Reserva " + reservaUID
                urlUI = "/administracion/reservas/reserva:" + reservaUID
            } else if (tipoEvento === "todosLosApartamentos") {
                const reservaUID = detallesDelEvento.reservaUID
                const apartamentoUI = detallesDelEvento.apartamentoUI
                nombreEventoFinal = apartamentoUI
                urlUI = `/administracion/reservas/reserva:${reservaUID}`
            } else if (tipoEvento === "porApartamento") {
                const reservaUID = detallesDelEvento.reservaUID
                const apartamentoUI = detallesDelEvento.apartamentoUI
                nombreEventoFinal = apartamentoUI
                urlUI = `/administracion/reservas/reserva:${reservaUID}`
            } else if (tipoEvento === "comportamientosPorApartamento") {
                const comportamientoUID = detallesDelEvento.comportamientoUID
                const nombreComportamiento = detallesDelEvento.nombreComportamiento
                nombreEventoFinal = nombreComportamiento
                urlUI = `/administracion/comportamiento_de_precios/comportamiento:${comportamientoUID}`
            } else if (tipoEvento === "comportamientosPorApartamentoBasadoEnDia") {
                const comportamientoUID = detallesDelEvento.comportamientoUID
                const nombreComportamiento = detallesDelEvento.nombreComportamiento
                nombreEventoFinal = nombreComportamiento
                urlUI = `/administracion/comportamiento_de_precios/comportamiento:${comportamientoUID}`
            } else if (tipoEvento === "todosLosBloqueos") {
                const bloqueoUID = detallesDelEvento.bloqueoUID
                const apartamentoIDV = detallesDelEvento.apartamentoIDV
                const apartamentoUI = detallesDelEvento.apartamentoUI
                nombreEventoFinal = `Bloqueo ${apartamentoUI}`
                urlUI = `/administracion/gestion_de_bloqueos_temporales/${apartamentoIDV}/${bloqueoUID}`
            } else if (tipoEvento === "bloqueoPorApartamento") {
                const bloqueoUID = detallesDelEvento.bloqueoUID
                const apartamentoIDV = detallesDelEvento.apartamentoIDV
                const apartamentoUI = detallesDelEvento.apartamentoUI
                nombreEventoFinal = `Bloqueo ${apartamentoUI}`
                urlUI = `/administracion/gestion_de_bloqueos_temporales/${apartamentoIDV}/${bloqueoUID}`
            } else if (tipoEvento === "calendarioAirbnb") {
                const descripcion = detallesDelEvento.descripcion || ""
                const apartamentoUI = detallesDelEvento.apartamentoUI
                const regex = /Reservation URL: (https:\/\/www\.airbnb\.com\/hosting\/reservations\/details\/[A-Za-z0-9]+)/;
                const match = descripcion.match(regex);
                if (match) {
                    const urlEvento = match?.[1] ?? null;
                    nombreEventoFinal = `Airbnb (${apartamentoUI})`
                    urlUI = urlEvento
                } else {
                    nombreEventoFinal = `Airbnb (${apartamentoUI}), Sin información (Evento tercero en Airbnb o evento de bloqueo de día en Airnbn)`
                    detallesDelEventoUI = "Este evento proviene de Airbnb y no proporciona más información. Esto suele ser debido cuando el evento de calendario de Airbnb proviene de otra fuente como Booking o es un evento establecido en Airbnb como día de antelacion obligatorio"

                }
            }

            const nombreClaseDinamica = `evento_margin-top-${altura}`;
            if (!document.querySelector(`.${nombreClaseDinamica}`)) {

                const style = document.createElement('style');
                style.innerHTML = `
                    .${nombreClaseDinamica} {
                        margin-top: ${altura}px;
                `;
                document.querySelector("main").appendChild(style);
            }

            const eventoUI = document.createElement("a")

            const contenedorInfoEvento = document.createElement("div")
            contenedorInfoEvento.classList.add(
                "infoEvento"
            )
            contenedorInfoEvento.setAttribute("dato", "textoEvento")
            contenedorInfoEvento.textContent = nombreEventoFinal
            eventoUI.appendChild(contenedorInfoEvento)

            eventoUI.classList.add(
                nombreClaseDinamica,
                css,
                "animacion_eventoUI"
            )
            if (espaciadoInferior) {
                eventoUI.style.marginBottom = espaciadoInferior
            }
            eventoUI.setAttribute("componente", "eventoUI")
            eventoUI.setAttribute("eventoUID", eventoUID)
            eventoUI.setAttribute("tipoEvento", tipoEvento)
            eventoUI.setAttribute("detallesDelEvento", JSON.stringify(detallesDelEvento))
            if (urlUI) {
                eventoUI.setAttribute("vista", urlUI)
                eventoUI.setAttribute("href", urlUI)
            }
            eventoUI.style.gridColumn = `${inicioColumna} /${finalColumna} span `
            eventoUI.style.gridRow = `${inicioFila}`
            eventoUI.addEventListener("mouseover", () => {
                const selectorEventoUIRenderizado = mesRenderizado_enEspera.querySelectorAll(`[eventoUID="${eventoUID}"]`)
                selectorEventoUIRenderizado.forEach((eventoRenderizado) => {
                    eventoRenderizado.classList.add("administracion_calendario_eventoUI_selecionado")
                })
            })
            eventoUI.addEventListener("mouseout", () => {
                const selectorEventoUIRenderizado = mesRenderizado_enEspera.querySelectorAll(`[eventoUID="${eventoUID}"]`)
                selectorEventoUIRenderizado.forEach((eventoRenderizado) => {
                    eventoRenderizado.classList.remove("administracion_calendario_eventoUI_selecionado")
                })
            })
            eventoUI.addEventListener("click", (e) => {
                e.preventDefault()
                const contnedorTexto = e.target.querySelector("[dato=textoEvento]")
                const tieneElipsis = (elemento) => {
                    return elemento.scrollWidth > elemento.clientWidth;
                }

                if (tieneElipsis(contnedorTexto)) {
                    ventanaDetallesDelEventoTruncado({
                        urlUI,
                        eventoUID,
                        nombreEventoFinal,
                        detallesDelEventoUI
                    })
                } else if (urlUI) {
                    const navegacion = {
                        vista: urlUI,
                        tipoOrigen: "menuNavegador"
                    }
                    casaVitini.shell.navegacion.controladorVista(navegacion)
                }
            })
            return eventoUI
        }
        const siguienteLunes = (primerDiaDelMes) => {
            if (primerDiaDelMes === 1) {
                return 8;
            }
            else if (primerDiaDelMes > 1) {
                return 8 - (primerDiaDelMes - 1);
            }
            else {
                return 1 + (1 - primerDiaDelMes);
            }
        }
        const renderizadorEventos = (contenedorEventos) => {

            const eventosMes = contenedorEventos.eventosMes
            const eventosEnDetalle = contenedorEventos.eventosEnDetalle
            const instanciaUIDMes = contenedorEventos.instanciaUIDMes
            const selectorMesDestino = calendarioRenderizado.querySelector(`[instanciaUID="${instanciaUIDMes}"]`)
            if (selectorMesDestino) {

                const selectorDias = selectorMesDestino.querySelectorAll("[dia]")
                selectorDias.forEach((dia) => {
                    dia.removeAttribute("eventosContenedor")
                })
                for (const [fechaDia, contenedorDia] of Object.entries(eventosMes)) {
                    const fechaDestino = fechaDia.split("-")

                    const diaDestino = fechaDestino[2]
                    const selectorContenedorDia = selectorMesDestino.querySelector(`[dia="${diaDestino}"]`)
                    const selectorArrayRenderizado = selectorContenedorDia?.getAttribute("eventosContenedor")

                    const objetoEventos = JSON.parse(selectorArrayRenderizado) || {}
                    let posicionEvento = 0
                    const posicionColumnaDia = obtenerCoordenadasCeldaGrid(diaDestino).columna

                    const posicionesEventosReservadas = {}
                    if (!objetoEventos.eventos) {
                        objetoEventos.eventos = {}
                    }
                    if (diaDestino === 1) {
                        let posicionesIninical = posicionEvento
                        for (const eventosDiaActual of contenedorDia) {
                            const reservaUID_diaActual = eventosDiaActual.eventoUID
                            objetoEventos.eventos[reservaUID_diaActual] = posicionesIninical
                            posicionesEventosReservadas[posicionesIninical] = "posicionReservada"
                            posicionesIninical++
                        }
                    } else {
                        const numeroDiaAnterior = String(Number(diaDestino - 1)).padStart(2, "0")
                        const selectorContenedorDiaAnterior = selectorMesDestino
                            .querySelector(`[dia="${numeroDiaAnterior}"]`)
                            ?.getAttribute("eventosContenedor") || "{}"
                        const eventosDelDiaAnterior = JSON.parse(selectorContenedorDiaAnterior) || {}
                        const contenedorEventosDiaAnterior = eventosDelDiaAnterior.eventos ? eventosDelDiaAnterior.eventos : {}

                        for (const [eventoAnteriorUID, posicionEventoAnterior] of Object.entries(contenedorEventosDiaAnterior)) {
                            for (const eventosDiaActual of contenedorDia) {
                                const eventoActualUID = eventosDiaActual.eventoUID
                                if (String(eventoActualUID) === String(eventoAnteriorUID)) {
                                    const posicionDelApartamentoDelDiaAnteior = contenedorEventosDiaAnterior[eventoActualUID]
                                    objetoEventos.eventos[eventoActualUID] = posicionDelApartamentoDelDiaAnteior
                                    posicionesEventosReservadas[posicionDelApartamentoDelDiaAnteior] = "posicionReservada"
                                }
                            }
                        }

                        if (posicionColumnaDia === 1) {
                            let posicionesIninical = posicionEvento
                            objetoEventos.eventos = {}
                            Object.keys(posicionesEventosReservadas).forEach((posicion) => {
                                delete posicionesEventosReservadas[posicion]
                            })
                            for (const eventosDiaActual of contenedorDia) {
                                const evendoDiaActualUID = eventosDiaActual.eventoUID
                                objetoEventos.eventos[evendoDiaActualUID] = posicionesIninical
                                posicionesEventosReservadas[posicionesIninical] = "posicionReservada"
                                posicionesIninical++
                            }
                        }
                    }

                    for (const eventosDelDia of contenedorDia) {
                        const eventoUID = eventosDelDia.eventoUID
                        if (posicionColumnaDia === 1) {
                        }
                        if (objetoEventos.eventos[eventoUID] === undefined) {
                            while (posicionesEventosReservadas[posicionEvento] === "posicionReservada") {
                                posicionEvento++;
                            }
                            objetoEventos.eventos[eventoUID] = Number(posicionEvento)
                            posicionEvento++;
                        }
                    }
                    selectorMesDestino.querySelector(`[dia="${diaDestino}"]`)
                        .setAttribute("eventosContenedor", JSON.stringify(objetoEventos))
                }

                for (const detallesDelEvento of eventosEnDetalle) {
                    const eventoUID = detallesDelEvento.eventoUID
                    const contenedorFechasDelEvento = detallesDelEvento.contenedorFechasDelEvento
                    const tipoEvento = detallesDelEvento.tipoEvento

                    contenedorFechasDelEvento.forEach((c) => {

                        const fechaEntrada = c.fechaEntrada
                        const fechaSalida = c.fechaSalida
                        const duracion_en_dias = c.duracion_en_dias

                        let diaEntrada
                        let mesEntrada
                        let anoEntrada
                        let diaSalida
                        let mesSalida
                        let anoSalida
                        if (fechaEntrada) {
                            const fechaEntradaArray = fechaEntrada.split("-")
                            diaEntrada = Number(fechaEntradaArray[2])
                            mesEntrada = Number(fechaEntradaArray[1])
                            anoEntrada = Number(fechaEntradaArray[0])
                        }
                        if (fechaSalida) {
                            const fechaSalidaArray = fechaSalida.split("-")
                            diaSalida = Number(fechaSalidaArray[2])
                            mesSalida = Number(fechaSalidaArray[1])
                            anoSalida = Number(fechaSalidaArray[0])
                        }
                        const configuracionEventoUI = {
                            eventoUID: eventoUID,
                            tipoEvento: tipoEvento,
                            detallesDelEvento: detallesDelEvento
                        }

                        if (mesRenderizado === mesEntrada && anoRenderizado === anoEntrada) {
                        } else {
                            diaEntrada = "01"
                        }

                        const selectorContenedorDia = selectorMesDestino.querySelector(`[dia="${String(diaEntrada).padStart(2, "0")}"]`)

                        const eventosContenedor = selectorContenedorDia.getAttribute("eventosContenedor")

                        const posicionEventoUI = (JSON.parse(eventosContenedor)).eventos[eventoUID]


                        const conteoEventos = Object.keys(JSON.parse(eventosContenedor).eventos).length - 1
                        const coordenadasDiaInicio = obtenerCoordenadasCeldaGrid(String(diaEntrada).padStart(2, "0"));


                        const inicioFila = coordenadasDiaInicio.fila
                        const celdasPorFilaConAtributo = obtenerNumeroDeCeldasConAtributoEnFila(inicioFila, "dia")


                        const inicioColumna = coordenadasDiaInicio.columna
                        const celdasNoExistentes = 7 - celdasPorFilaConAtributo
                        const inicioColumnaSinPrimeraPosicion = inicioColumna - 1
                        const inicioFilaDia = inicioFila
                        let restoDeCeldas
                        let diasRestantes



                        if (inicioFilaDia === 1 || inicioFilaDia < numeroDeFilasConDia()) {

                            restoDeCeldas = celdasPorFilaConAtributo - (inicioColumnaSinPrimeraPosicion - celdasNoExistentes)

                        } else if (inicioFilaDia === numeroDeFilasConDia()) {
                            restoDeCeldas = celdasPorFilaConAtributo - inicioColumnaSinPrimeraPosicion

                        }

                        let finalColumna
                        if (mesRenderizado === mesEntrada && anoRenderizado === anoEntrada) {
                            finalColumna = (duracion_en_dias) >= restoDeCeldas ? (restoDeCeldas) : (duracion_en_dias);

                        } else {
                            const fechaIncioMes_ISO = `${anoRenderizado}-${String(mesRenderizado).padStart(2, "0")}-01`
                            diasRestantes = diferenciaDeDias(fechaIncioMes_ISO, fechaSalida);
                            finalColumna = diasRestantes >= restoDeCeldas ? (restoDeCeldas) : (diasRestantes)
                        }

                        let filaSiguiente = inicioFila
                        let alturaFinal
                        if (posicionEventoUI === 0) {
                            alturaFinal = 40
                        } else if (posicionEventoUI === 1) {
                            alturaFinal = 90
                        } else if (posicionEventoUI > 1) {
                            alturaFinal = (posicionEventoUI * 40) + ((posicionEventoUI + 1) * 10) + 30
                        }
                        let espaciadoInferior = false
                        if (posicionEventoUI === conteoEventos) {
                            espaciadoInferior = "36px"
                        }
                        const numeroFilasTotales = numeroDeFilasConDia()

                        let restoDeDiasDelEvento
                        if (mesRenderizado === mesEntrada && anoRenderizado === anoEntrada) {
                            restoDeDiasDelEvento = restoDeCeldas > duracion_en_dias ? 0 : (duracion_en_dias) - restoDeCeldas
                            if (restoDeDiasDelEvento === 0) {
                                configuracionEventoUI.css = "administracion_calendario_eventoUI_inicioFinal"
                            } else {
                                configuracionEventoUI.css = "administracion_calendario_eventoUI_inicioSolo"
                            }
                        } else {
                            restoDeDiasDelEvento = restoDeCeldas > diasRestantes ? 0 : Math.abs((diasRestantes) - restoDeCeldas)

                            if (restoDeDiasDelEvento <= 0) {
                                configuracionEventoUI.css = "administracion_calendario_eventoUI_finalSolo"
                            } else {
                                configuracionEventoUI.css = "administracion_calendario_eventoUI_transicion"
                            }
                        }
                        configuracionEventoUI.altura = alturaFinal
                        configuracionEventoUI.espaciadoInferior = espaciadoInferior
                        configuracionEventoUI.inicioColumna = inicioColumna
                        configuracionEventoUI.finalColumna = finalColumna
                        configuracionEventoUI.inicioFila = inicioFila
                        const eventoUI = constructorEventoUI(configuracionEventoUI)
                        selectorMesDestino.appendChild(eventoUI)
                        const posicionDiaUno = obtenerCoordenadasCeldaGrid("01").columna
                        const filaInicialDelEvento = (Number(obtenerCoordenadasCeldaGrid(String(diaEntrada).padStart(2, "0")).fila))

                        let sumadorDiaFila

                        if (filaInicialDelEvento === "01") {
                            sumadorDiaFila = siguienteLunes(posicionDiaUno)
                        } else {
                            let sumaDias = 7 * (Number(filaInicialDelEvento) - 1)
                            sumadorDiaFila = siguienteLunes(posicionDiaUno) + sumaDias
                        }

                        while (restoDeDiasDelEvento > 0 && numeroFilasTotales > filaSiguiente) {
                            filaSiguiente += 1
                            const selectorContenedorDia_loop = selectorMesDestino.querySelector(`[dia="${String(sumadorDiaFila).padStart(2, "0")}"]`)
                            const eventosContenedor_loop = selectorContenedorDia_loop.getAttribute("eventosContenedor")

                            sumadorDiaFila += 7
                            const posicionEventoUI_loop = (JSON.parse(eventosContenedor_loop)).eventos[eventoUID]

                            let alturaFinal
                            if (posicionEventoUI_loop === 0) {
                                alturaFinal = 40
                            } else if (posicionEventoUI_loop === 1) {
                                alturaFinal = 90
                            } else if (posicionEventoUI_loop > 1) {
                                alturaFinal = (posicionEventoUI_loop * 40) + ((posicionEventoUI_loop + 1) * 10) + 30
                            }
                            const celdasPorFilaConAtributo = obtenerNumeroDeCeldasConAtributoEnFila(filaSiguiente, "dia")
                            const finalColumna_ = restoDeDiasDelEvento >= celdasPorFilaConAtributo ? celdasPorFilaConAtributo : (restoDeDiasDelEvento);

                            restoDeDiasDelEvento = Math.abs(restoDeDiasDelEvento - finalColumna_)
                            if (restoDeDiasDelEvento <= 0) {
                                configuracionEventoUI.css = "administracion_calendario_eventoUI_finalSolo"
                            } else {
                                configuracionEventoUI.css = "administracion_calendario_eventoUI_transicion"
                            }


                            configuracionEventoUI.altura = alturaFinal
                            configuracionEventoUI.espaciadoInferior = espaciadoInferior
                            configuracionEventoUI.inicioColumna = 1
                            configuracionEventoUI.finalColumna = finalColumna_
                            configuracionEventoUI.inicioFila = filaSiguiente
                            const eventoUI = constructorEventoUI(configuracionEventoUI)
                            selectorMesDestino.appendChild(eventoUI)
                        }

                    })
                }

            }
        }
        const capasSimples = traductorURL.capas
        const capasCompuestas = traductorURL.capasCompuestas
        const contenedorCapas = {
            capas: capasSimples,
            capasCompuestas,
        }
        const primerFormatoURL = []
        for (const capaSimple of capasSimples) {
            const capaSimpleURL = casaVitini.utilidades.cadenas.camelToSnake(capaSimple)
            const composicioCapa = capasCompuestas[capaSimple]
            let final
            if (composicioCapa) {
                final = `capa:${capaSimpleURL}/${capaSimpleURL}:${composicioCapa.join("=")}`
            } else {
                final = `capa:${capaSimpleURL}`
            }
            primerFormatoURL.push(final)
        }

        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "administracion/calendario/capas/multiCapa",
            fecha: `${mesRenderizado}-${anoRenderizado}`,
            contenedorCapas: contenedorCapas
        })

        if (respuestaServidor?.error) {

            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const mesDestino = document.querySelector(`[instanciaUID="${instanciaUIDMes}"]`)
            if (mesDestino) {
                const capasIDV = respuestaServidor.capasIDV

                renderizadorEventos({
                    eventosMes: respuestaServidor.eventosMes,
                    eventosEnDetalle: respuestaServidor.eventosEnDetalle,
                    instanciaUIDMes: instanciaUIDMes
                })
                this.actualizaPrecioDia({
                    contenedorDia: respuestaServidor.contenedorDia,
                    instanciaUIDMes
                })

                if (
                    capasIDV.includes("comportamientosPorApartamento") ||
                    capasIDV.includes("global") ||
                    capasIDV.includes("todosLosComportamientosDePrecio")
                ) {
                    const apartamentos = respuestaServidor.apartamentos
                    this.controladorSelecionDias.arranque({
                        instanciaUIDMes,
                        apartamentos,
                        mesDestino: mesRenderizado,
                        anoDestino: anoRenderizado

                    })
                } else {
                    document.querySelector("[contenedorcompartidofechassel]")?.removeAttribute("contenedorcompartidofechassel")
                    document.querySelector("[componente=botonFlotanteOpcioneDiasSel]")?.remove()
                }
            }
        }
    },
    actualizaPrecioDia: function (data) {
        const contenedorDia = data.contenedorDia
        const instanciaUIDMes = data.instanciaUIDMes
        const desglosePorNoche = contenedorDia.desglosePorNoche || {}

        const selectorMesDestino = document.querySelector(`[instanciaUID="${instanciaUIDMes}"]`)
        if (selectorMesDestino) {

            const numeroDesglosesPorNoche = Object.keys(desglosePorNoche).length
            if (numeroDesglosesPorNoche === 0) {
                const selectorTodaCeldaDia = selectorMesDestino.querySelectorAll(`[dia]`)
                selectorTodaCeldaDia.forEach((dia) => {
                    const selectorDia = dia.querySelector(`[contenedor=data]`)
                    selectorDia.textContent = ""
                })
            }

            Object.entries(desglosePorNoche).forEach(d => {
                const [fecha, c] = d
                const precioNetoNoche = c.precioNetoNoche
                const apartamentosPorNoche = c.apartamentosPorNoche
                const diaDestino = fecha.split("-")[2]

                const numeroDeApartamentosNoche = Object.keys(apartamentosPorNoche).length
                const dataUI = numeroDeApartamentosNoche === 1 ? `${precioNetoNoche}$` : `M ${precioNetoNoche}$`
                const selectorCeldaDia = selectorMesDestino.querySelector(`[dia="${diaDestino}"] [contenedor=data]`)
                selectorCeldaDia.textContent = dataUI
            })
        }
    },
    coloreoDias: async function (data) {
        const mes = data.mes
        const ano = data.ano
        const instanciaUIDMes = data.instanciaUIDMes

        if (!mes || !ano) { return }

        const resuelveDiasCompletos = await casaVitini.shell.servidor({
            zona: "componentes/diasOcupadosTotalmentePorMes",
            mes: Number(mes),
            ano: Number(ano)
        })
        const marcoMes = document.querySelector(`[instanciaUID="${instanciaUIDMes}"]`)
        if (!marcoMes) { return }
        if (resuelveDiasCompletos?.error) {
            // casaVitini.shell.controladoresUI.limpiarMain()
            return casaVitini.ui.componentes.advertenciaInmersiva(resuelveDiasCompletos.error)
            // return casaVitini.ui.componentes.mensajeSimple({ titulo: resuelveDiasCompletos.error })

        }
        const detallesDiasOcupacion = resuelveDiasCompletos.ok.dias

        const diasRenderizados = marcoMes.querySelectorAll("[dia]")
        diasRenderizados.forEach((diaRenderizado) => {
            const numeroDia = diaRenderizado.getAttribute("dia")

            if (detallesDiasOcupacion[numeroDia]?.estadoDia === "diaParcial") {
                diaRenderizado.classList.add("diaParcial")
            } else if (detallesDiasOcupacion[numeroDia]?.estadoDia === "diaCompleto") {
                diaRenderizado.classList.add("diaCompleto")
            } else {
                diaRenderizado.classList.add("diaDisponible")
            }
        })
    },
    obtenerConfiguracionesApartamento: async function () {
        const transaccion = {
            zona: "administracion/arquitectura/configuraciones/listarConfiguracionApartamentos"
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)

        if (respuestaServidor?.error) {
            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const estructuraFinal = []
            const configuracionesApartamentos = respuestaServidor?.ok
            if (configuracionesApartamentos.length > 0) {
                for (const detalleApartamento of configuracionesApartamentos) {
                    const apartamentoIDV = detalleApartamento.apartamentoIDV
                    const apartamentoUI = detalleApartamento.apartamentoUI
                    const estadoConfiguracion = detalleApartamento.estadoConfiguracion
                    const detallesApartamento = {
                        apartamentoIDV: apartamentoIDV,
                        apartamentoUI: apartamentoUI,
                        estadoConfiguracion: estadoConfiguracion,
                    }
                    estructuraFinal.push(detallesApartamento)
                }
            }
            return estructuraFinal
        }
    },
    // obtenerCalendariosSincronizados: {
    //     airbnb: async function () {
    //         const transaccion = {
    //             zona: "administracion/calendario/obtenerNombresCalendarios/airbnb"
    //         }
    //         const respuestaServidor = await casaVitini.shell.servidor(transaccion)
    //         if (respuestaServidor?.error) {
    //             casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
    //         }
    //         if (respuestaServidor?.ok) {
    //             const estructuraFinal = []
    //             const calendariosSincronizados = respuestaServidor?.calendariosSincronizados
    //             if (calendariosSincronizados.length > 0) {
    //                 for (const detallesDelCalendario of calendariosSincronizados) {
    //                     const apartamentoIDV = detallesDelCalendario.apartamentoIDV
    //                     const apartamentoUI = detallesDelCalendario.apartamentoUI
    //                     const nombre = detallesDelCalendario.nombre
    //                     const calendarioUID = detallesDelCalendario.calendarioUID
    //                     const detallesApartamento = {
    //                         apartamentoIDV: apartamentoIDV,
    //                         apartamentoUI: apartamentoUI,
    //                         nombre: nombre,
    //                         calendarioUID: calendarioUID
    //                     }
    //                     estructuraFinal.push(detallesApartamento)
    //                 }
    //             }
    //             return estructuraFinal
    //         }
    //     }
    // },
    componentesUI: {
        capas: async function () {

            const granuladoURL = casaVitini.utilidades.granuladorURL()
            const contenedorSeguroParaParametros = granuladoURL.contenedorSeguroParaParametros
            const contenedorCapas = {
                capas: [],
                capasCompuestas: {}
            }
            for (const conjunto of contenedorSeguroParaParametros) {
                const par = conjunto.split(":")
                const parametro = par[0]
                const valor = par[1]
                if (parametro === "capa") {
                    const capaEnCamel = casaVitini.utilidades.cadenas.snakeToCamel(valor)
                    contenedorCapas.capas.push(capaEnCamel)
                }
                if (parametro !== "fecha" && parametro !== "capa") {
                    const parametroEnCamel = casaVitini.utilidades.cadenas.snakeToCamel(parametro)
                    const composicionCapa = valor.split("=")
                    contenedorCapas.capasCompuestas[parametroEnCamel] = composicionCapa
                }
            }


            const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
            const instanciaUID_ui = pantallaInmersiva.getAttribute("instanciaUID")
            document.querySelector("main").appendChild(pantallaInmersiva)
            const spinner = casaVitini.ui.componentes.spinner()
            pantallaInmersiva.appendChild(spinner)
            const apartamentosLista = await casaVitini.view.obtenerConfiguracionesApartamento() || []

            const uiRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_ui}"]`)
            if (!uiRenderizada) {
                return
            }
            spinner?.remove()
            pantallaInmersiva.classList.add("flextJustificacion_arriba")
            const destino = pantallaInmersiva.querySelector("[destino=inyector]")

            const contenedorMenuCapas = document.createElement("div")
            contenedorMenuCapas.classList.add("contenedorMenuCapas")
            contenedorMenuCapas.setAttribute("componente", "contenedorMenuCapas")
            destino.appendChild(contenedorMenuCapas)



            const titulo = document.createElement("div")
            titulo.classList.add("tituloGris", "padding14", "textoCentrado")
            titulo.textContent = "Capas del calendario"
            contenedorMenuCapas.appendChild(titulo)

            const botonAplicar = document.createElement("div")
            botonAplicar.classList.add("botonV1BlancoIzquierda")
            botonAplicar.textContent = "Aplicar y cerrar"
            botonAplicar.addEventListener("click", () => {
                this.aplicarCapas()
            })
            contenedorMenuCapas.appendChild(botonAplicar)


            const botonLimpiar = document.createElement("div")
            botonLimpiar.classList.add("botonV1BlancoIzquierda")
            botonLimpiar.textContent = "Quitar todos los eventos del calendario y limpiar la vista"
            botonLimpiar.addEventListener("click", () => {
                // Cambiar url a sin capas,
                casaVitini.view.limpiezaCalendario.hub({
                    limpiezaIDV: ["global"]
                })
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
            })
            contenedorMenuCapas.appendChild(botonLimpiar)

            const botonCancelar = document.createElement("div")
            botonCancelar.classList.add("botonV1")
            botonCancelar.textContent = "Cerrar"
            botonCancelar.addEventListener("click", casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas)
            contenedorMenuCapas.appendChild(botonCancelar)

            const info = (t) => {
                const i = document.createElement("p")
                i.classList.add("padding14")
                i.textContent = t
                return i
            }


            const controladorExpansionCategorias = (e) => {
                const accion = e.target.getAttribute("accion")
                const contenedoresFlexibles = destino.querySelectorAll("details")


                if (accion === "expandir") {
                    contenedoresFlexibles.forEach(c => c.open = true)
                } else if (accion === "contraer") {
                    contenedoresFlexibles.forEach(c => c.open = false)
                }
            }

            const contenedorVista = document.createElement("div")
            contenedorVista.classList.add("gridHorizontal2C", "gap6", "backgroundGrey1", "padding6", "borderRadius20")
            contenedorMenuCapas.appendChild(contenedorVista)

            const botonExpandirTodo = document.createElement("div")
            botonExpandirTodo.classList.add("botonV1")
            botonExpandirTodo.setAttribute("accion", "expandir")
            botonExpandirTodo.addEventListener("click", controladorExpansionCategorias)
            botonExpandirTodo.textContent = "Expandir todo"
            contenedorVista.appendChild(botonExpandirTodo)

            const botonContraerTodo = document.createElement("div")
            botonContraerTodo.classList.add("botonV1")
            botonContraerTodo.setAttribute("accion", "contraer")
            botonContraerTodo.addEventListener("click", controladorExpansionCategorias)
            botonContraerTodo.textContent = "Contraer todo"
            contenedorVista.appendChild(botonContraerTodo)

            contenedorMenuCapas.appendChild(info("Las capas Precio de la noche por apartamento no muestra eventos, muestra el precio de la noche final neto. Es decir, le precio base más el comportamiento de precio aplicado a esa noche. Cuando escoges varios apartamentos, se muestra el precio sumado de la noche de los apartamentos escogidos. Cuando delante del precio hay una M mayúscula, indica Múltiples apartamentos seleccionados."))

            if (apartamentosLista.length > 0) {
                const contenedorTodosLosApartamentos = document.createElement("details")
                contenedorTodosLosApartamentos.classList.add("contenedorGrupoFondo", "sobreControlAnimacionGlobal")
                contenedorTodosLosApartamentos.setAttribute("grupo", "campo")
                contenedorMenuCapas.appendChild(contenedorTodosLosApartamentos)


                const tituloDesplegable = document.createElement("summary")
                tituloDesplegable.classList.add(
                    "borderRadius14",
                    "padding10",
                    "margin0"
                )
                tituloDesplegable.textContent = "Precio de la noche por apartamento"
                contenedorTodosLosApartamentos.appendChild(tituloDesplegable)

                let filaIconoTitulo = document.createElement("div")
                filaIconoTitulo.classList.add("filaIconoTexto")
                filaIconoTitulo.setAttribute("capaUID", "todosLosPreciosSumados")
                filaIconoTitulo.setAttribute("tipo", "global")
                filaIconoTitulo.setAttribute("grupo", "cabeza")
                const iconoTodosLosApartamentos = document.createElement("div")
                iconoTodosLosApartamentos.classList.add("icono")
                let estadoSelector = document.createElement("div")
                estadoSelector.classList.add("estadoSelector")
                estadoSelector.setAttribute("componente", "icono")
                iconoTodosLosApartamentos.appendChild(estadoSelector)
                filaIconoTitulo.appendChild(iconoTodosLosApartamentos)
                const tituloTodosLosApartamentos = document.createElement("div")
                tituloTodosLosApartamentos.classList.add("tituloCapa")
                tituloTodosLosApartamentos.textContent = "Suma total de los precios por noche"
                tituloTodosLosApartamentos.classList.add("negrita")
                filaIconoTitulo.appendChild(tituloTodosLosApartamentos)
                contenedorTodosLosApartamentos.appendChild(filaIconoTitulo)
                const contenedorListaPorApartamento = document.createElement("div")
                contenedorListaPorApartamento.classList.add("contenedorListaApartamentos")
                for (const detallesApartamento of apartamentosLista) {
                    const apartamentoIDV = detallesApartamento.apartamentoIDV
                    const apartamentoUI = detallesApartamento.apartamentoUI
                    const contenedorApartamento = document.createElement("div")
                    contenedorApartamento.classList.add("contenedorCapa")
                    contenedorApartamento.setAttribute("precioNochePorApartamento", apartamentoIDV)
                    contenedorApartamento.setAttribute("capaUID", "precioNochePorApartamento")
                    contenedorApartamento.setAttribute("grupo", "elemento")
                    filaIconoTitulo = document.createElement("div")
                    filaIconoTitulo.classList.add("filaIconoTexto")
                    const iconoApartamento = document.createElement("div")
                    iconoApartamento.classList.add("icono")
                    estadoSelector = document.createElement("div")
                    estadoSelector.classList.add("estadoSelector")
                    estadoSelector.setAttribute("componente", "icono")
                    iconoApartamento.appendChild(estadoSelector)
                    filaIconoTitulo.appendChild(iconoApartamento)
                    const tituloApartamento = document.createElement("div")
                    tituloApartamento.classList.add("tituloCapa")
                    tituloApartamento.textContent = apartamentoUI
                    filaIconoTitulo.appendChild(tituloApartamento)
                    contenedorApartamento.appendChild(filaIconoTitulo)
                    contenedorListaPorApartamento.appendChild(contenedorApartamento)
                }
                contenedorTodosLosApartamentos.appendChild(contenedorListaPorApartamento)
            }

            const contenedorCapasEntrelazadas = document.createElement("div")
            contenedorCapasEntrelazadas.classList.add("flexVertical", "borderRadius26", "backgroundGrey1", "padding10", "gap10")
            contenedorMenuCapas.appendChild(contenedorCapasEntrelazadas)


            contenedorCapasEntrelazadas.appendChild(info("La capa global son todas las capas juntas en el calendario menos la capa Precio de la nochen por Apartmento. Esto le proporciona una rápida visión global de la cronologia."))

            const grupoGlobalCapas = document.createElement("div")
            grupoGlobalCapas.classList.add("contenedorGrupoSinFondo")
            contenedorCapasEntrelazadas.appendChild(grupoGlobalCapas)


            const contenedorCapaGlobal = document.createElement("div")
            contenedorCapaGlobal.classList.add("contenedorCapa")
            contenedorCapaGlobal.setAttribute("capaUID", "global")
            filaIconoTitulo = document.createElement("div")
            filaIconoTitulo.classList.add("filaIconoTexto")
            const iconoGlobal = document.createElement("div")
            iconoGlobal.classList.add("icono")
            estadoSelector = document.createElement("div")
            estadoSelector.classList.add("estadoSelector")
            estadoSelector.setAttribute("componente", "icono")
            iconoGlobal.appendChild(estadoSelector)
            filaIconoTitulo.appendChild(iconoGlobal)
            const tituloGlobal = document.createElement("div")
            tituloGlobal.classList.add("tituloCapa")
            tituloGlobal.classList.add("negrita")
            tituloGlobal.textContent = "Global"
            filaIconoTitulo.appendChild(tituloGlobal)
            contenedorCapaGlobal.appendChild(filaIconoTitulo)
            grupoGlobalCapas.appendChild(contenedorCapaGlobal)
            const contenedorCapaReservas = document.createElement("div")
            contenedorCapaReservas.classList.add("contenedorCapa")
            contenedorCapaReservas.setAttribute("capaUID", "todasLasReservas")
            contenedorCapaReservas.setAttribute("tipo", "capaSimple")
            filaIconoTitulo = document.createElement("div")
            filaIconoTitulo.classList.add("filaIconoTexto")
            const iconoReservas = document.createElement("div")
            iconoReservas.classList.add("icono")
            estadoSelector = document.createElement("div")
            estadoSelector.classList.add("estadoSelector")
            estadoSelector.setAttribute("componente", "icono")
            iconoReservas.appendChild(estadoSelector)
            filaIconoTitulo.appendChild(iconoReservas)
            const tituloReservas = document.createElement("div")
            tituloReservas.classList.add("tituloCapa")
            tituloReservas.classList.add("negrita")
            tituloReservas.textContent = "Reservas"
            filaIconoTitulo.appendChild(tituloReservas)
            contenedorCapaReservas.appendChild(filaIconoTitulo)
            grupoGlobalCapas.appendChild(contenedorCapaReservas)

            const contenedorTodosLosBloqueos = document.createElement("div")
            contenedorTodosLosBloqueos.classList.add("contenedorCapa")
            contenedorTodosLosBloqueos.setAttribute("capaUID", "todosLosBloqueos")
            contenedorTodosLosBloqueos.setAttribute("tipo", "capaSimple")
            filaIconoTitulo = document.createElement("div")
            filaIconoTitulo.classList.add("filaIconoTexto")
            const iconoTodosLosBloqueos = document.createElement("div")
            iconoTodosLosBloqueos.classList.add("icono")
            estadoSelector = document.createElement("div")
            estadoSelector.classList.add("estadoSelector")
            estadoSelector.setAttribute("componente", "icono")
            iconoTodosLosBloqueos.appendChild(estadoSelector)
            filaIconoTitulo.appendChild(iconoTodosLosBloqueos)
            const tituloTodosLosBloqueos = document.createElement("div")
            tituloTodosLosBloqueos.classList.add("tituloCapa")
            tituloTodosLosBloqueos.classList.add("negrita")
            tituloTodosLosBloqueos.textContent = "Todos los bloqueos"
            filaIconoTitulo.appendChild(tituloTodosLosBloqueos)
            contenedorTodosLosBloqueos.appendChild(filaIconoTitulo)
            //  grupoGlobalCapas.appendChild(contenedorTodosLosBloqueos)


            if (apartamentosLista.length > 0) {
                const contenedorTodosLosApartamentos = document.createElement("details")
                contenedorTodosLosApartamentos.classList.add("contenedorGrupoFondo", "sobreControlAnimacionGlobal")
                contenedorTodosLosApartamentos.setAttribute("grupo", "campo")
                contenedorCapasEntrelazadas.appendChild(contenedorTodosLosApartamentos)

                const tituloDesplegable = document.createElement("summary")
                tituloDesplegable.classList.add(
                    "borderRadius14",
                    "padding10",
                    "margin0"
                )
                tituloDesplegable.textContent = "Reservas por apartamento"
                contenedorTodosLosApartamentos.appendChild(tituloDesplegable)

                filaIconoTitulo = document.createElement("div")
                filaIconoTitulo.classList.add("filaIconoTexto")
                filaIconoTitulo.setAttribute("capaUID", "todasLasReservasPorApartamento")
                filaIconoTitulo.setAttribute("tipo", "global")
                filaIconoTitulo.setAttribute("grupo", "cabeza")
                const iconoTodosLosApartamentos = document.createElement("div")
                iconoTodosLosApartamentos.classList.add("icono")
                estadoSelector = document.createElement("div")
                estadoSelector.classList.add("estadoSelector")
                estadoSelector.setAttribute("componente", "icono")
                iconoTodosLosApartamentos.appendChild(estadoSelector)
                filaIconoTitulo.appendChild(iconoTodosLosApartamentos)
                const tituloTodosLosApartamentos = document.createElement("div")
                tituloTodosLosApartamentos.classList.add("tituloCapa")
                tituloTodosLosApartamentos.textContent = "Todos las reservas por apartamento (Solo eventos por apartamento)"
                tituloTodosLosApartamentos.classList.add("negrita")
                filaIconoTitulo.appendChild(tituloTodosLosApartamentos)
                contenedorTodosLosApartamentos.appendChild(filaIconoTitulo)
                const contenedorListaPorApartamento = document.createElement("div")
                contenedorListaPorApartamento.classList.add("contenedorListaApartamentos")
                for (const detallesApartamento of apartamentosLista) {
                    const apartamentoIDV = detallesApartamento.apartamentoIDV
                    const apartamentoUI = detallesApartamento.apartamentoUI
                    const contenedorApartamento = document.createElement("div")
                    contenedorApartamento.classList.add("contenedorCapa")
                    contenedorApartamento.setAttribute("reservasPorApartamento", apartamentoIDV)
                    contenedorApartamento.setAttribute("capaUID", "reservasPorApartamento")
                    contenedorApartamento.setAttribute("grupo", "elemento")
                    filaIconoTitulo = document.createElement("div")
                    filaIconoTitulo.classList.add("filaIconoTexto")
                    const iconoApartamento = document.createElement("div")
                    iconoApartamento.classList.add("icono")
                    estadoSelector = document.createElement("div")
                    estadoSelector.classList.add("estadoSelector")
                    estadoSelector.setAttribute("componente", "icono")
                    iconoApartamento.appendChild(estadoSelector)
                    filaIconoTitulo.appendChild(iconoApartamento)
                    const tituloApartamento = document.createElement("div")
                    tituloApartamento.classList.add("tituloCapa")
                    tituloApartamento.textContent = apartamentoUI
                    filaIconoTitulo.appendChild(tituloApartamento)
                    contenedorApartamento.appendChild(filaIconoTitulo)
                    contenedorListaPorApartamento.appendChild(contenedorApartamento)
                }
                contenedorTodosLosApartamentos.appendChild(contenedorListaPorApartamento)
            }
            contenedorCapasEntrelazadas.appendChild(info("La capa Bloqueos por apartamentos muestra los comportamientos de precio complejos y simples como eventos para tener una visual más clara de cuando se están aplicando. Esta capa también activa la posibilidad de seleccionar días por rango o por selección para gestionar los comportamientos de precio simples. Para gestionar los comportamientos de precio complejos deberá entrar en el comportamiento de precio haciendo clic en él y operar desde el menú de comportamiento de precio complejo. Un comportamiento de precio complejo es aquel que tiene más de un apartamento dentro de él."))

            if (apartamentosLista.length > 0) {
                const contenedorTodosLosApartamentos = document.createElement("details")
                contenedorTodosLosApartamentos.classList.add("contenedorGrupoFondo", "sobreControlAnimacionGlobal")
                contenedorTodosLosApartamentos.setAttribute("grupo", "campo")
                contenedorCapasEntrelazadas.appendChild(contenedorTodosLosApartamentos)


                const tituloDesplegable = document.createElement("summary")
                tituloDesplegable.classList.add(
                    "borderRadius14",
                    "padding10",
                    "margin0"
                )
                tituloDesplegable.textContent = "Comportamientos de precios por apartamento"
                contenedorTodosLosApartamentos.appendChild(tituloDesplegable)

                filaIconoTitulo = document.createElement("div")
                filaIconoTitulo.classList.add("filaIconoTexto")
                filaIconoTitulo.setAttribute("capaUID", "todosLosComportamientosDePrecio", "sobreControlAnimacionGlobal")
                filaIconoTitulo.setAttribute("tipo", "global")
                filaIconoTitulo.setAttribute("grupo", "cabeza")
                const iconoTodosLosApartamentos = document.createElement("div")
                iconoTodosLosApartamentos.classList.add("icono")
                estadoSelector = document.createElement("div")
                estadoSelector.classList.add("estadoSelector")
                estadoSelector.setAttribute("componente", "icono")
                iconoTodosLosApartamentos.appendChild(estadoSelector)
                filaIconoTitulo.appendChild(iconoTodosLosApartamentos)
                const tituloTodosLosApartamentos = document.createElement("div")
                tituloTodosLosApartamentos.classList.add("tituloCapa")
                tituloTodosLosApartamentos.textContent = "Todos los apartamentos "
                tituloTodosLosApartamentos.classList.add("negrita")
                filaIconoTitulo.appendChild(tituloTodosLosApartamentos)
                contenedorTodosLosApartamentos.appendChild(filaIconoTitulo)
                const contenedorListaPorApartamento = document.createElement("div")
                contenedorListaPorApartamento.classList.add("contenedorListaApartamentos")
                for (const detallesApartamento of apartamentosLista) {
                    const apartamentoIDV = detallesApartamento.apartamentoIDV
                    const apartamentoUI = detallesApartamento.apartamentoUI
                    const contenedorApartamento = document.createElement("div")
                    contenedorApartamento.classList.add("contenedorCapa")
                    contenedorApartamento.setAttribute("comportamientosPorApartamento", apartamentoIDV)
                    contenedorApartamento.setAttribute("capaUID", "comportamientosPorApartamento")
                    contenedorApartamento.setAttribute("grupo", "elemento")
                    filaIconoTitulo = document.createElement("div")
                    filaIconoTitulo.classList.add("filaIconoTexto")
                    const iconoApartamento = document.createElement("div")
                    iconoApartamento.classList.add("icono")
                    estadoSelector = document.createElement("div")
                    estadoSelector.classList.add("estadoSelector")
                    estadoSelector.setAttribute("componente", "icono")
                    iconoApartamento.appendChild(estadoSelector)
                    filaIconoTitulo.appendChild(iconoApartamento)
                    const tituloApartamento = document.createElement("div")
                    tituloApartamento.classList.add("tituloCapa")
                    tituloApartamento.textContent = apartamentoUI
                    filaIconoTitulo.appendChild(tituloApartamento)
                    contenedorApartamento.appendChild(filaIconoTitulo)
                    contenedorListaPorApartamento.appendChild(contenedorApartamento)
                }
                contenedorTodosLosApartamentos.appendChild(contenedorListaPorApartamento)
            }

            if (apartamentosLista.length > 0) {
                const contenedorTodosLosApartamentos = document.createElement("details")
                contenedorTodosLosApartamentos.classList.add("contenedorGrupoFondo", "sobreControlAnimacionGlobal")
                contenedorTodosLosApartamentos.setAttribute("grupo", "campo")
                contenedorCapasEntrelazadas.appendChild(contenedorTodosLosApartamentos)


                const tituloDesplegable = document.createElement("summary")
                tituloDesplegable.classList.add(
                    "borderRadius14",
                    "padding10",
                    "margin0"
                )
                tituloDesplegable.textContent = "Bloqueos por apartamento"
                contenedorTodosLosApartamentos.appendChild(tituloDesplegable)

                filaIconoTitulo = document.createElement("div")
                filaIconoTitulo.classList.add("filaIconoTexto")
                filaIconoTitulo.setAttribute("capaUID", "todosLosBloqueos")
                filaIconoTitulo.setAttribute("tipo", "global")
                filaIconoTitulo.setAttribute("grupo", "cabeza")
                const iconoTodosLosApartamentos = document.createElement("div")
                iconoTodosLosApartamentos.classList.add("icono")
                estadoSelector = document.createElement("div")
                estadoSelector.classList.add("estadoSelector")
                estadoSelector.setAttribute("componente", "icono")
                iconoTodosLosApartamentos.appendChild(estadoSelector)
                filaIconoTitulo.appendChild(iconoTodosLosApartamentos)
                const tituloTodosLosApartamentos = document.createElement("div")
                tituloTodosLosApartamentos.classList.add("tituloCapa")
                tituloTodosLosApartamentos.textContent = "Todos los apartamentos"
                tituloTodosLosApartamentos.classList.add("negrita")
                filaIconoTitulo.appendChild(tituloTodosLosApartamentos)
                contenedorTodosLosApartamentos.appendChild(filaIconoTitulo)
                const contenedorListaPorApartamento = document.createElement("div")
                contenedorListaPorApartamento.classList.add("contenedorListaApartamentos")
                for (const detallesApartamento of apartamentosLista) {
                    const apartamentoIDV = detallesApartamento.apartamentoIDV
                    const apartamentoUI = detallesApartamento.apartamentoUI
                    const contenedorApartamento = document.createElement("div")
                    contenedorApartamento.classList.add("contenedorCapa")
                    contenedorApartamento.setAttribute("bloqueosPorApartamento", apartamentoIDV)
                    contenedorApartamento.setAttribute("capaUID", "bloqueosPorApartamento")
                    contenedorApartamento.setAttribute("grupo", "elemento")
                    filaIconoTitulo = document.createElement("div")
                    filaIconoTitulo.classList.add("filaIconoTexto")
                    const iconoApartamento = document.createElement("div")
                    iconoApartamento.classList.add("icono")
                    estadoSelector = document.createElement("div")
                    estadoSelector.classList.add("estadoSelector")
                    estadoSelector.setAttribute("componente", "icono")
                    iconoApartamento.appendChild(estadoSelector)
                    filaIconoTitulo.appendChild(iconoApartamento)
                    const tituloApartamento = document.createElement("div")
                    tituloApartamento.classList.add("tituloCapa")
                    tituloApartamento.textContent = apartamentoUI
                    filaIconoTitulo.appendChild(tituloApartamento)
                    contenedorApartamento.appendChild(filaIconoTitulo)
                    contenedorListaPorApartamento.appendChild(contenedorApartamento)
                }
                contenedorTodosLosApartamentos.appendChild(contenedorListaPorApartamento)
            }
            const calendariosListaAirnbnb = await casaVitini.view.__sharedMethods__.obtenerCalendariosSincronizados.airbnb() || []
            if (calendariosListaAirnbnb.length > 0) {
                const grupoAirbnb = document.createElement("details")
                grupoAirbnb.classList.add("contenedorGrupoFondo", "sobreControlAnimacionGlobal")
                grupoAirbnb.setAttribute("grupo", "campo")
                contenedorCapasEntrelazadas.appendChild(grupoAirbnb)

                const tituloDesplegable = document.createElement("summary")
                tituloDesplegable.classList.add(
                    "borderRadius14",
                    "padding10",
                    "margin0"
                )
                tituloDesplegable.textContent = "Calendarios sincronizados"
                grupoAirbnb.appendChild(tituloDesplegable)

                filaIconoTitulo = document.createElement("div")
                filaIconoTitulo.classList.add("filaIconoTexto")
                filaIconoTitulo.setAttribute("capaUID", "todoAirbnb")
                filaIconoTitulo.setAttribute("tipo", "global")
                filaIconoTitulo.setAttribute("grupo", "cabeza")
                const iconoTodosAirbnb = document.createElement("div")
                iconoTodosAirbnb.classList.add("icono")
                estadoSelector = document.createElement("div")
                estadoSelector.classList.add("estadoSelector")
                estadoSelector.setAttribute("componente", "icono")
                iconoTodosAirbnb.appendChild(estadoSelector)
                filaIconoTitulo.appendChild(iconoTodosAirbnb)
                const tituloTodoAirbnb = document.createElement("div")
                tituloTodoAirbnb.classList.add("tituloCapa")
                tituloTodoAirbnb.classList.add("negrita")
                tituloTodoAirbnb.textContent = "Todos los calendarios de Airbnb"
                filaIconoTitulo.appendChild(tituloTodoAirbnb)
                grupoAirbnb.appendChild(filaIconoTitulo)
                const contenedorListaPorApartamento = document.createElement("div")
                contenedorListaPorApartamento.classList.add("contenedorListaApartamentos")
                for (const detallesCalendario of calendariosListaAirnbnb) {
                    const apartamentoIDV = detallesCalendario.apartamentoIDV
                    const apartamentoUI = detallesCalendario.apartamentoUI
                    const calendarioUID = detallesCalendario.calendarioUID
                    const nombre = detallesCalendario.nombre
                    const contenedorCalendarioAirbnb = document.createElement("div")
                    contenedorCalendarioAirbnb.classList.add("contenedorCapa")
                    contenedorCalendarioAirbnb.setAttribute("capaUID", "calendariosAirbnb")
                    contenedorCalendarioAirbnb.setAttribute("calendariosAirbnb", calendarioUID)
                    contenedorCalendarioAirbnb.setAttribute("grupo", "elemento")
                    filaIconoTitulo = document.createElement("div")
                    filaIconoTitulo.classList.add("filaIconoTexto")
                    const iconoCalendarioAirbnb = document.createElement("div")
                    iconoCalendarioAirbnb.classList.add("icono")
                    estadoSelector = document.createElement("div")
                    estadoSelector.classList.add("estadoSelector")
                    estadoSelector.setAttribute("componente", "icono")
                    iconoCalendarioAirbnb.appendChild(estadoSelector)
                    filaIconoTitulo.appendChild(iconoCalendarioAirbnb)
                    const tituloCalendarioAirbnb = document.createElement("div")
                    tituloCalendarioAirbnb.classList.add("tituloCapa")
                    tituloCalendarioAirbnb.textContent = `${nombre} (${apartamentoUI})`
                    filaIconoTitulo.appendChild(tituloCalendarioAirbnb)
                    contenedorCalendarioAirbnb.appendChild(filaIconoTitulo)
                    contenedorListaPorApartamento.appendChild(contenedorCalendarioAirbnb)
                }
                grupoAirbnb.appendChild(contenedorListaPorApartamento)
            }



            const controladorSelectoresCapas = (selector) => {
                const contenedorCapa = selector.target.closest("[capaUID]")
                const todasLasCapas = document.querySelectorAll("[componente=contenedorMenuCapas] [capaUID]")
                const capaUID = contenedorCapa.getAttribute("capaUID")
                const todoLosIconos = document.querySelectorAll("[componente=contenedorMenuCapas] [componente=icono]")
                const todasLasCapasGlobales = document.querySelectorAll("[componente=contenedorMenuCapas] [tipo=global]")
                const grupo = contenedorCapa.getAttribute("grupo")
                const iconoSelecionado = contenedorCapa.querySelector("[componente=icono]")
                const estadoCapa = contenedorCapa.getAttribute("estado")
                const controlBotonGlobal = () => {
                    const capasGlobales = document.querySelectorAll("[componente=contenedorMenuCapas] [tipo=global], [componente=contenedorMenuCapas] [tipo=capaSimple]")
                    const capaGlobal = document.querySelector("[componente=contenedorMenuCapas] [capaUID=global]")
                    const iconoCapa = capaGlobal.querySelector("[componente=icono]")
                    let estadoFinal = "seleccionado"
                    for (const capa of capasGlobales) {
                        const estado = capa.getAttribute("estado")
                        if (estado !== "seleccionado") {
                            estadoFinal = "noSeleccionado"
                            break
                        }
                    }
                    if (estadoFinal === "seleccionado") {
                        iconoCapa.style.background = "blue"
                        capaGlobal.setAttribute("estado", "seleccionado")
                    } else {
                        iconoCapa.removeAttribute("style")
                        capaGlobal.removeAttribute("estado")
                    }
                }
                if (estadoCapa === "seleccionado") {
                    iconoSelecionado.removeAttribute("style")
                    contenedorCapa.removeAttribute("estado")
                } else {
                    iconoSelecionado.style.background = "blue"
                    contenedorCapa.setAttribute("estado", "seleccionado")
                }
                if (capaUID === "global") {
                    if (estadoCapa === "seleccionado") {
                        todasLasCapas.forEach((capa) => {
                            capa.removeAttribute("estado")
                            capa.querySelector("[componente=icono]").removeAttribute("style")
                        })
                    } else {
                        todasLasCapas.forEach((capa) => {
                            capa.setAttribute("estado", "seleccionado")
                            capa.querySelector("[componente=icono]").style.background = "blue"
                        })
                    }
                }
                if (grupo === "cabeza") {
                    const elementosDelGrupo = contenedorCapa.closest("[grupo=campo]").querySelectorAll("[grupo=elemento]")
                    if (estadoCapa === "seleccionado") {
                        elementosDelGrupo.forEach((capa) => {
                            capa.removeAttribute("estado")
                            capa.querySelectorAll("[componente=icono]").forEach((icono) => {
                                icono.removeAttribute("style")
                            })
                        })
                    } else {
                        elementosDelGrupo.forEach((capa) => {
                            capa.setAttribute("estado", "seleccionado")
                            capa.querySelectorAll("[componente=icono]").forEach((icono) => {
                                icono.style.background = "blue"
                            })
                        })
                    }
                }
                if (grupo === "elemento") {
                    const elementosDelGrupo = contenedorCapa.closest("[grupo=campo]").querySelectorAll("[grupo=elemento]")
                    const cabezaGrupo = contenedorCapa.closest("[grupo=campo]").querySelector("[grupo=cabeza]")
                    let estadoFinal = "seleccionado"
                    for (const elemento of elementosDelGrupo) {
                        const estado = elemento.getAttribute("estado")
                        if (estado !== "seleccionado") {
                            estadoFinal = "noSeleccionado"
                            cabezaGrupo.removeAttribute("estado")
                            cabezaGrupo.querySelector("[componente=icono]").removeAttribute("style")
                            break
                        }
                    }
                    if (estadoFinal === "seleccionado") {
                        cabezaGrupo.setAttribute("estado", "seleccionado")
                        cabezaGrupo.querySelector("[componente=icono]").style.background = "blue"
                    }
                }
                controlBotonGlobal()
            }
            const capasPorVerificar = contenedorCapas.capas
            const composicionCapaCompuesta = contenedorCapas.capasCompuestas
            const contenedorMenuCapasRenderizado = document.querySelector("[componente=contenedorMenuCapas]")
            if (capasPorVerificar.includes("global")) {
                contenedorMenuCapasRenderizado.querySelectorAll("[capaUID]").forEach((capa) => {
                    capa.setAttribute("estado", "seleccionado")
                    capa.querySelector("[componente=icono]").style.background = "blue"
                })
            } else {
                for (const capaPorVeriticar of capasPorVerificar) {
                    if (composicionCapaCompuesta[capaPorVeriticar]) {
                        const capasSimplesEnCapaCompuesta = composicionCapaCompuesta[capaPorVeriticar]
                        for (const capaSimpleEnCapaCompuesta of capasSimplesEnCapaCompuesta) {
                            const capaUIDConstructor = `[capaUID="${capaPorVeriticar}"][${capaPorVeriticar}="${capaSimpleEnCapaCompuesta}"]`
                            const selectorCapaRenderizada = contenedorMenuCapasRenderizado.querySelector(capaUIDConstructor)
                            selectorCapaRenderizada.setAttribute("estado", "seleccionado")
                            selectorCapaRenderizada.querySelector("[componente=icono]").style.background = "blue"
                        }
                    } else {
                        const capaUIDConstructor = `[capaUID="${capaPorVeriticar}"]`
                        const selectorCapaRenderizada = contenedorMenuCapasRenderizado.querySelector(capaUIDConstructor)
                        selectorCapaRenderizada.setAttribute("estado", "seleccionado")
                        selectorCapaRenderizada.querySelector("[componente=icono]").style.background = "blue"
                        const tipoRolGrupo = selectorCapaRenderizada.getAttribute("grupo")
                        if (tipoRolGrupo === "cabeza") {
                            selectorCapaRenderizada.closest("[grupo=campo]").querySelectorAll("[grupo=elemento]").forEach((elemento) => {
                                elemento.setAttribute("estado", "seleccionado")
                                elemento.querySelector("[componente=icono]").style.background = "blue"
                            })
                        }
                    }
                }
            }
            const selectorCapas = document.querySelectorAll("[componente=contenedorMenuCapas] [capaUID]")
            selectorCapas.forEach((selector) => {
                selector.addEventListener("click", controladorSelectoresCapas)
            })

        },
        aplicarCapas: function () {
            const instanciaUID_main = document.querySelector("main").getAttribute("instanciaUID")
            const instanciaUIDMes = casaVitini.utilidades.codigoFechaInstancia()

            const traductorURL = casaVitini.view.traductorURL()
            const vision = document.querySelector("[vision]").getAttribute("vision")
            const mesesImplicados = []
            if (vision === "horizontal") {
                document.querySelector(`[instanciaUID="${instanciaUID_main}"] [componente=marcoMes]`)
                    .setAttribute("instanciaUID", instanciaUIDMes)
                const mesImplicado = document.querySelector(`[instanciaUID="${instanciaUID_main}"] [componente=marcoMes][instanciaUID="${instanciaUIDMes}"]`)
                mesesImplicados.push(mesImplicado)

            } else if (vision === "vertical") {

                casaVitini.view.limpiezaCalendario.hub({
                    limpiezaIDV: ["vista"]
                })

                const mesesVisibles = () => {
                    const visibleDivs = [];
                    const container = document.querySelector('[contenedor=meses]');
                    const containerTop = container.scrollTop;
                    const containerBottom = containerTop + container.offsetHeight;

                    // Recorre todos los divs dentro del contenedor
                    const divs = container.querySelectorAll('[mesIDV]');
                    divs.forEach((div) => {
                        const divTop = div.offsetTop;
                        const divBottom = divTop + div.offsetHeight;
                        // Verifica si el div está dentro de la parte visible del contenedor
                        if (divBottom > containerTop && divTop < containerBottom) {
                            visibleDivs.push(div);

                        }
                    });

                    return visibleDivs;
                }
                mesesImplicados.push(...mesesVisibles())
            } else {
                const m = "No se reconoce la visíon"
                return casaVitini.ui.componentes.advertenciaInmersiva(m)
            }

            const capasSelecionadas = []
            const estructura = {
                fecha: traductorURL.fecha,
                vision: traductorURL.vision,
                capas: [],
                capasCompuestas: {}
            }
            const elementosSeleccionados = document.querySelectorAll("[componente=contenedorMenuCapas] [estado=seleccionado]")

            for (const elementoSeleccionado of elementosSeleccionados) {
                const capaUID = elementoSeleccionado.getAttribute("capaUID")
                capasSelecionadas.push(capaUID)
            }
            if (capasSelecionadas.includes("global")) {
                estructura.capas.push("global")
            } else {
                const capasSimples = document.querySelectorAll("[componente=contenedorMenuCapas] [capaUID][tipo=capaSimple][estado=seleccionado]")
                capasSimples.forEach((capa) => {
                    const capaUID = capa.getAttribute("capaUID")
                    estructura.capas.push(capaUID)
                })

                if (!capasSelecionadas.includes("todasLasReservasPorApartamento")) {
                    const apartametnosSeleccionados = document.querySelectorAll("[componente=contenedorMenuCapas] [capaUID=reservasPorApartamento][estado=seleccionado]")
                    const reservasPorApartamento = []
                    apartametnosSeleccionados.forEach((apartamento) => {
                        const apartamentoIDV = apartamento.getAttribute("reservasPorApartamento")
                        reservasPorApartamento.push(apartamentoIDV)
                    })
                    if (apartametnosSeleccionados.length > 0) {
                        estructura.capasCompuestas.reservasPorApartamento = reservasPorApartamento
                        estructura.capas.push("reservasPorApartamento")
                    }
                } else {
                    estructura.capas.push("todasLasReservasPorApartamento")
                }

                if (!capasSelecionadas.includes("todosLosComportamientosDePrecio")) {
                    const apartametnosSeleccionados = document.querySelectorAll("[componente=contenedorMenuCapas] [capaUID=comportamientosPorApartamento][estado=seleccionado]")
                    const comportamientosPorApartamento = []
                    apartametnosSeleccionados.forEach((apartamento) => {
                        const apartamentoIDV = apartamento.getAttribute("comportamientosPorApartamento")
                        comportamientosPorApartamento.push(apartamentoIDV)
                    })
                    if (apartametnosSeleccionados.length > 0) {
                        estructura.capasCompuestas.comportamientosPorApartamento = comportamientosPorApartamento
                        estructura.capas.push("comportamientosPorApartamento")
                    }
                } else {
                    estructura.capas.push("todosLosComportamientosDePrecio")
                }
                if (!capasSelecionadas.includes("todosLosBloqueos")) {
                    const apartametnosSeleccionados = document.querySelectorAll("[componente=contenedorMenuCapas] [capaUID=bloqueosPorApartamento][estado=seleccionado]")
                    const bloqueosPorApartamento = []
                    apartametnosSeleccionados.forEach((apartamento) => {
                        const apartamentoIDV = apartamento.getAttribute("bloqueosPorApartamento")
                        bloqueosPorApartamento.push(apartamentoIDV)
                    })
                    if (apartametnosSeleccionados.length > 0) {
                        estructura.capasCompuestas.bloqueosPorApartamento = bloqueosPorApartamento
                        estructura.capas.push("bloqueosPorApartamento")
                    }
                } else {
                    estructura.capas.push("todosLosBloqueos")
                }
                if (!capasSelecionadas.includes("todoAirbnb")) {
                    const calendariosAirBnbSeleccionados = document.querySelectorAll("[componente=contenedorMenuCapas] [capaUID=calendariosAirbnb][estado=seleccionado]")
                    const calendariosAirbnb = []
                    calendariosAirBnbSeleccionados.forEach((calendario) => {
                        const calendarioUID = calendario.getAttribute("calendariosAirbnb")
                        calendariosAirbnb.push(calendarioUID)
                    })
                    if (calendariosAirBnbSeleccionados.length > 0) {
                        estructura.capasCompuestas.calendariosAirbnb = calendariosAirbnb
                        estructura.capas.push("calendariosAirbnb")
                    }
                } else {
                    estructura.capas.push("todoAirbnb")
                }
            }

            if (!capasSelecionadas.includes("todosLosPreciosSumados")) {
                const apartametnosSeleccionados = document.querySelectorAll("[componente=contenedorMenuCapas] [capaUID=precioNochePorApartamento][estado=seleccionado]")
                const precioNochePorApartamento = []
                apartametnosSeleccionados.forEach((apartamento) => {
                    const apartamentoIDV = apartamento.getAttribute("precioNochePorApartamento")
                    precioNochePorApartamento.push(apartamentoIDV)
                })
                if (apartametnosSeleccionados.length > 0) {
                    estructura.capasCompuestas.precioNochePorApartamento = precioNochePorApartamento
                    estructura.capas.push("precioNochePorApartamento")
                }
            } else {
                estructura.capas.push("todosLosPreciosSumados")
            }

            if (estructura.capas.length === 0) {
                const mensaje = "Selecciona alguna capa para aplicarla en el calendario. No has seleccionado ninguna capa. Sí, por el contrario, quieres borrar toda las capas, pulsae en el boton para limpar la vista."
                return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(mensaje)
            }

            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
            casaVitini.view.controladorSelecionDias.reseteaDiasSelecionados()
            mesesImplicados.forEach(m => {
                const mesIDV = m.getAttribute("mesIDV")
                const fecha = mesIDV.split("-")
                const mes = fecha[0]
                const ano = fecha[1]
                const instanciaUIDMes = m.getAttribute("instanciaUID")

                estructura.fecha = `${mes}-${ano}`
                m.setAttribute("estadoRenderizado", "renderizado")

                casaVitini.view.capas({
                    traductorURL: estructura,
                    instanciaUID_main: instanciaUID_main,
                    origen: "menuDesplegable",
                    instanciaUIDMes: instanciaUIDMes
                })
            })


            casaVitini.view.controladorRegistros({
                tipoRegistro: "actualizar",
                traductorURL: estructura
            })


        },
        preciosNocheApartamentos: async function () {

            const granuladoURL = casaVitini.utilidades.granuladorURL()
            const contenedorSeguroParaParametros = granuladoURL.contenedorSeguroParaParametros
            const contenedorCapas = {
                capas: [],
                capasCompuestas: {}
            }
            for (const conjunto of contenedorSeguroParaParametros) {
                const par = conjunto.split(":")
                const parametro = par[0]
                const valor = par[1]
                if (parametro === "capa") {
                    const capaEnCamel = casaVitini.utilidades.cadenas.snakeToCamel(valor)
                    contenedorCapas.capas.push(capaEnCamel)
                }
                if (parametro !== "fecha" && parametro !== "capa") {
                    const parametroEnCamel = casaVitini.utilidades.cadenas.snakeToCamel(parametro)
                    const composicionCapa = valor.split("=")
                    contenedorCapas.capasCompuestas[parametroEnCamel] = composicionCapa
                }
            }
            const contenedorMenuCapas = document.createElement("div")
            contenedorMenuCapas.classList.add("contenedorMenuCapas")
            contenedorMenuCapas.setAttribute("componente", "contenedorMenuCapas")
            const titulo = document.createElement("div")
            titulo.classList.add("tituloGris")
            titulo.textContent = "Selector de precios a mostrar en la celda día"
            contenedorMenuCapas.appendChild(titulo)


            const botonCancelar = document.createElement("div")
            botonCancelar.classList.add("botonV1")
            botonCancelar.textContent = "Cerrar"
            botonCancelar.addEventListener("click", casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas)
            contenedorMenuCapas.appendChild(botonCancelar)

            const apartamentosLista = await casaVitini.view.obtenerConfiguracionesApartamento()

            if (apartamentosLista.length > 0) {
                const contenedorTodosLosApartamentos = document.createElement("div")
                contenedorTodosLosApartamentos.classList.add("contenedorGrupoFondo")
                contenedorTodosLosApartamentos.setAttribute("grupo", "campo")
                filaIconoTitulo = document.createElement("div")
                filaIconoTitulo.classList.add("filaIconoTexto")
                filaIconoTitulo.setAttribute("capaUID", "todosLosApartamentos")
                filaIconoTitulo.setAttribute("tipo", "global")
                filaIconoTitulo.setAttribute("grupo", "cabeza")
                const iconoTodosLosApartamentos = document.createElement("div")
                iconoTodosLosApartamentos.classList.add("icono")
                estadoSelector = document.createElement("div")
                estadoSelector.classList.add("estadoSelector")
                estadoSelector.setAttribute("componente", "icono")
                iconoTodosLosApartamentos.appendChild(estadoSelector)
                filaIconoTitulo.appendChild(iconoTodosLosApartamentos)
                const tituloTodosLosApartamentos = document.createElement("div")
                tituloTodosLosApartamentos.classList.add("tituloCapa")
                tituloTodosLosApartamentos.textContent = "Ver la suma total de todos los apartamentos"
                tituloTodosLosApartamentos.classList.add("negrita")
                filaIconoTitulo.appendChild(tituloTodosLosApartamentos)
                contenedorTodosLosApartamentos.appendChild(filaIconoTitulo)
                const contenedorListaPorApartamento = document.createElement("div")
                contenedorListaPorApartamento.classList.add("contenedorListaApartamentos")
                for (const detallesApartamento of apartamentosLista) {
                    const apartamentoIDV = detallesApartamento.apartamentoIDV
                    const apartamentoUI = detallesApartamento.apartamentoUI
                    const contenedorApartamento = document.createElement("div")
                    contenedorApartamento.classList.add("contenedorCapa")
                    contenedorApartamento.setAttribute("porApartamento", apartamentoIDV)
                    contenedorApartamento.setAttribute("capaUID", "porApartamento")
                    contenedorApartamento.setAttribute("grupo", "elemento")
                    filaIconoTitulo = document.createElement("div")
                    filaIconoTitulo.classList.add("filaIconoTexto")
                    const iconoApartamento = document.createElement("div")
                    iconoApartamento.classList.add("icono")
                    estadoSelector = document.createElement("div")
                    estadoSelector.classList.add("estadoSelector")
                    estadoSelector.setAttribute("componente", "icono")
                    iconoApartamento.appendChild(estadoSelector)
                    filaIconoTitulo.appendChild(iconoApartamento)
                    const tituloApartamento = document.createElement("div")
                    tituloApartamento.classList.add("tituloCapa")
                    tituloApartamento.textContent = apartamentoUI
                    filaIconoTitulo.appendChild(tituloApartamento)
                    contenedorApartamento.appendChild(filaIconoTitulo)
                    contenedorListaPorApartamento.appendChild(contenedorApartamento)
                }
                contenedorTodosLosApartamentos.appendChild(contenedorListaPorApartamento)
                contenedorMenuCapas.appendChild(contenedorTodosLosApartamentos)
            }
            const botonAplicar = document.createElement("div")
            botonAplicar.classList.add("botonV1BlancoIzquierda")
            botonAplicar.textContent = "Aplicar y cerrar"
            botonAplicar.addEventListener("click", () => {
                const instanciaUID_main = document.querySelector("main").getAttribute("instanciaUID")
                const instanciaUIDMes = casaVitini.utilidades.codigoFechaInstancia()
                document.querySelector(`[instanciaUID="${instanciaUID_main}"] [componente=marcoMes]`)
                    .setAttribute("instanciaUID", instanciaUIDMes)
                const calendarioRenderizado = document.querySelector(`[instanciaUID="${instanciaUID_main}"]`)
                const mesActual = Number(calendarioRenderizado.querySelector("[componente=mesReferencia]").getAttribute("mes"))
                const anoActual = Number(calendarioRenderizado.querySelector("[componente=mesReferencia]").getAttribute("ano"))
                const capasSelecionadas = []
                const estructura = {
                    capas: [],
                    capasCompuestas: {}
                }
                const elementosSeleccionados = document.querySelectorAll("[componente=contenedorMenuCapas] [estado=seleccionado]")
                for (const elementoSeleccionado of elementosSeleccionados) {
                    const capaUID = elementoSeleccionado.getAttribute("capaUID")
                    capasSelecionadas.push(capaUID)
                }
                if (capasSelecionadas.includes("global")) {
                    estructura.capas.push("global")
                } else {
                    const capasSimples = document.querySelectorAll("[componente=contenedorMenuCapas] [capaUID][tipo=capaSimple][estado=seleccionado]")
                    capasSimples.forEach((capa) => {
                        const capaUID = capa.getAttribute("capaUID")
                        estructura.capas.push(capaUID)
                    })
                    if (!capasSelecionadas.includes("todosLosApartamentos")) {
                        const apartametnosSeleccionados = document.querySelectorAll("[componente=contenedorMenuCapas] [capaUID=porApartamento][estado=seleccionado]")
                        const porApartamento = []
                        apartametnosSeleccionados.forEach((apartamento) => {
                            const apartamentoIDV = apartamento.getAttribute("porApartamento")
                            porApartamento.push(apartamentoIDV)
                        })
                        if (apartametnosSeleccionados.length > 0) {
                            estructura.capasCompuestas.porApartamento = porApartamento
                            estructura.capas.push("porApartamento")
                        }
                    } else {
                        estructura.capas.push("todosLosApartamentos")
                    }

                    if (!capasSelecionadas.includes("todosLosComportamientosDePrecio")) {
                        const apartametnosSeleccionados = document.querySelectorAll("[componente=contenedorMenuCapas] [capaUID=comportamientosPorApartamento][estado=seleccionado]")
                        const comportamientosPorApartamento = []
                        apartametnosSeleccionados.forEach((apartamento) => {
                            const apartamentoIDV = apartamento.getAttribute("comportamientosPorApartamento")
                            comportamientosPorApartamento.push(apartamentoIDV)
                        })
                        if (apartametnosSeleccionados.length > 0) {
                            estructura.capasCompuestas.comportamientosPorApartamento = comportamientosPorApartamento
                            estructura.capas.push("comportamientosPorApartamento")
                        }
                    } else {
                        estructura.capas.push("todosLosComportamientosDePrecio")
                    }




                    if (!capasSelecionadas.includes("todoAirbnb")) {
                        const calendariosAirBnbSeleccionados = document.querySelectorAll("[componente=contenedorMenuCapas] [capaUID=calendariosAirbnb][estado=seleccionado]")
                        const calendariosAirbnb = []
                        calendariosAirBnbSeleccionados.forEach((calendario) => {
                            const calendarioUID = calendario.getAttribute("calendariosAirbnb")
                            calendariosAirbnb.push(calendarioUID)
                        })
                        if (calendariosAirBnbSeleccionados.length > 0) {
                            estructura.capasCompuestas.calendariosAirbnb = calendariosAirbnb
                            estructura.capas.push("calendariosAirbnb")
                        }
                    } else {
                        estructura.capas.push("todoAirbnb")
                    }
                }
                if (estructura.capas.length === 0) {
                    const mensaje = "Selecciona alguna capa para aplicarla en el calendario. No has seleccionado ninguna capa. Sí, por el contrario, lo que quieres es cerrar la pantalla de capas. Pulsa en el botón cerrar"
                    return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(mensaje)
                }
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                casaVitini.view.capas({
                    contenedorCapas: estructura,
                    instanciaUID_main: instanciaUID_main,
                    origen: "menuDesplegable",
                    instanciaUIDMes: instanciaUIDMes
                })

                casaVitini.view.controladorRegistros({
                    tipoRegistro: "crear",
                    ano: anoActual,
                    mes: mesActual,
                    contenedorCapas: estructura
                })


            })
            contenedorMenuCapas.appendChild(botonAplicar)

            const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
            const destino = pantallaInmersiva.querySelector("[destino=inyector]")
            destino.appendChild(contenedorMenuCapas)
            document.querySelector("main").appendChild(pantallaInmersiva)
            const controladorSelectoresCapas = (selector) => {
                const contenedorCapa = selector.target.closest("[capaUID]")
                const todasLasCapas = document.querySelectorAll("[componente=contenedorMenuCapas] [capaUID]")
                const capaUID = contenedorCapa.getAttribute("capaUID")
                const todoLosIconos = document.querySelectorAll("[componente=contenedorMenuCapas] [componente=icono]")
                const todasLasCapasGlobales = document.querySelectorAll("[componente=contenedorMenuCapas] [tipo=global]")
                const grupo = contenedorCapa.getAttribute("grupo")
                const iconoSelecionado = contenedorCapa.querySelector("[componente=icono]")
                const estadoCapa = contenedorCapa.getAttribute("estado")
                const controlBotonGlobal = () => {
                    const capasGlobales = document.querySelectorAll("[componente=contenedorMenuCapas] [tipo=global], [componente=contenedorMenuCapas] [tipo=capaSimple]")
                    const capaGlobal = document.querySelector("[componente=contenedorMenuCapas] [capaUID=global]")
                    const iconoCapa = capaGlobal.querySelector("[componente=icono]")
                    let estadoFinal = "seleccionado"
                    for (const capa of capasGlobales) {
                        const estado = capa.getAttribute("estado")
                        if (estado !== "seleccionado") {
                            estadoFinal = "noSeleccionado"
                            break
                        }
                    }
                    if (estadoFinal === "seleccionado") {
                        iconoCapa.style.background = "blue"
                        capaGlobal.setAttribute("estado", "seleccionado")
                    } else {
                        iconoCapa.removeAttribute("style")
                        capaGlobal.removeAttribute("estado")
                    }
                }
                if (estadoCapa === "seleccionado") {
                    iconoSelecionado.removeAttribute("style")
                    contenedorCapa.removeAttribute("estado")
                } else {
                    iconoSelecionado.style.background = "blue"
                    contenedorCapa.setAttribute("estado", "seleccionado")
                }
                if (capaUID === "global") {
                    if (estadoCapa === "seleccionado") {
                        todasLasCapas.forEach((capa) => {
                            capa.removeAttribute("estado")
                            capa.querySelector("[componente=icono]").removeAttribute("style")
                        })
                    } else {
                        todasLasCapas.forEach((capa) => {
                            capa.setAttribute("estado", "seleccionado")
                            capa.querySelector("[componente=icono]").style.background = "blue"
                        })
                    }
                }
                if (grupo === "cabeza") {
                    const elementosDelGrupo = contenedorCapa.closest("[grupo=campo]").querySelectorAll("[grupo=elemento]")
                    if (estadoCapa === "seleccionado") {
                        elementosDelGrupo.forEach((capa) => {
                            capa.removeAttribute("estado")
                            capa.querySelectorAll("[componente=icono]").forEach((icono) => {
                                icono.removeAttribute("style")
                            })
                        })
                    } else {
                        elementosDelGrupo.forEach((capa) => {
                            capa.setAttribute("estado", "seleccionado")
                            capa.querySelectorAll("[componente=icono]").forEach((icono) => {
                                icono.style.background = "blue"
                            })
                        })
                    }
                }
                if (grupo === "elemento") {
                    const elementosDelGrupo = contenedorCapa.closest("[grupo=campo]").querySelectorAll("[grupo=elemento]")
                    const cabezaGrupo = contenedorCapa.closest("[grupo=campo]").querySelector("[grupo=cabeza]")
                    let estadoFinal = "seleccionado"
                    for (const elemento of elementosDelGrupo) {
                        const estado = elemento.getAttribute("estado")
                        if (estado !== "seleccionado") {
                            estadoFinal = "noSeleccionado"
                            cabezaGrupo.removeAttribute("estado")
                            cabezaGrupo.querySelector("[componente=icono]").removeAttribute("style")
                            break
                        }
                    }
                    if (estadoFinal === "seleccionado") {
                        cabezaGrupo.setAttribute("estado", "seleccionado")
                        cabezaGrupo.querySelector("[componente=icono]").style.background = "blue"
                    }
                }
                controlBotonGlobal()
            }
            const capasPorVerificar = contenedorCapas.capas
            const composicionCapaCompuesta = contenedorCapas.capasCompuestas
            const contenedorMenuCapasRenderizado = document.querySelector("[componente=contenedorMenuCapas]")
            if (capasPorVerificar.includes("global")) {
                contenedorMenuCapasRenderizado.querySelectorAll("[capaUID]").forEach((capa) => {
                    capa.setAttribute("estado", "seleccionado")
                    capa.querySelector("[componente=icono]").style.background = "blue"
                })
            } else {
                for (const capaPorVeriticar of capasPorVerificar) {
                    if (composicionCapaCompuesta[capaPorVeriticar]) {
                        const capasSimplesEnCapaCompuesta = composicionCapaCompuesta[capaPorVeriticar]
                        for (const capaSimpleEnCapaCompuesta of capasSimplesEnCapaCompuesta) {
                            const capaUIDConstructor = `[capaUID="${capaPorVeriticar}"][${capaPorVeriticar}="${capaSimpleEnCapaCompuesta}"]`
                            const selectorCapaRenderizada = contenedorMenuCapasRenderizado.querySelector(capaUIDConstructor)
                            selectorCapaRenderizada.setAttribute("estado", "seleccionado")
                            selectorCapaRenderizada.querySelector("[componente=icono]").style.background = "blue"
                        }
                    } else {
                        const capaUIDConstructor = `[capaUID="${capaPorVeriticar}"]`
                        const selectorCapaRenderizada = contenedorMenuCapasRenderizado.querySelector(capaUIDConstructor)
                        selectorCapaRenderizada.setAttribute("estado", "seleccionado")
                        selectorCapaRenderizada.querySelector("[componente=icono]").style.background = "blue"
                        const tipoRolGrupo = selectorCapaRenderizada.getAttribute("grupo")
                        if (tipoRolGrupo === "cabeza") {
                            selectorCapaRenderizada.closest("[grupo=campo]").querySelectorAll("[grupo=elemento]").forEach((elemento) => {
                                elemento.setAttribute("estado", "seleccionado")
                                elemento.querySelector("[componente=icono]").style.background = "blue"
                            })
                        }
                    }
                }
            }
            const selectorCapas = document.querySelectorAll("[componente=contenedorMenuCapas] [capaUID]")
            selectorCapas.forEach((selector) => {
                selector.addEventListener("click", controladorSelectoresCapas)
            })

        },
        menuIrAFecha: {
            arranque: async function () {
                const traductorURL = casaVitini.view.traductorURL()
                const vision = document.querySelector("[vision]").getAttribute("vision")
                const fecha = traductorURL.fecha.split("-")
                const mesActual = fecha[0]
                const anoActual = fecha[1]
                const main = document.querySelector("main")
                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                const instanciaUID_ui = ui.getAttribute("instanciaUID")
                const contenedor = ui.querySelector("[componente=contenedor]")
                main.appendChild(ui)

                const spinnerSimple = casaVitini.ui.componentes.spinnerSimple()
                contenedor.appendChild(spinnerSimple)

                const calendarioResuelto = await casaVitini.ui.componentes.calendario.resolverCalendarioNuevo({
                    tipo: "actual"
                })
                spinnerSimple?.remove()
                if (calendarioResuelto.error) {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    return casaVitini.ui.componentes.advertenciaInmersiva(calednarioResuelto.error)
                }
                const mesPresente = calendarioResuelto.mes
                const anoPresente = calendarioResuelto.ano


                const tituloPropuesta = document.createElement("p")
                tituloPropuesta.classList.add(
                    "tituloGris",
                    "padding14",
                    "textoCentrado"
                )
                tituloPropuesta.textContent = "Ir a fecha específica"
                tituloPropuesta.style.color = "black"
                contenedor.appendChild(tituloPropuesta)

                const botonCancelar = document.createElement("div")
                botonCancelar.classList.add("botonV1")
                botonCancelar.textContent = "Cerrar";
                botonCancelar.addEventListener("click", () => {
                    return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                })
                contenedor.appendChild(botonCancelar)

                const contenedorSelectorVision = document.createElement("div")
                contenedorSelectorVision.classList.add("gridHorizontal2C", "borderRadius22", "gap6", "backgroundWhite3", "padding6")
                contenedorSelectorVision.setAttribute("contenedor", "botonesVision")

                contenedor.appendChild(contenedorSelectorVision)


                const selectorHorizontal = document.createElement("div")
                selectorHorizontal.classList.add("botonV1")
                selectorHorizontal.setAttribute("v", "horizontal")
                selectorHorizontal.addEventListener("click", () => {
                    this.controladorVision({
                        visionSel: "horizontal",
                        instanciaUID: instanciaUID_ui

                    })
                })
                selectorHorizontal.textContent = "Vision horizontal"
                contenedorSelectorVision.appendChild(selectorHorizontal)


                const selectorVertical = document.createElement("div")
                selectorVertical.classList.add("botonV1")
                selectorVertical.setAttribute("v", "vertical")
                selectorVertical.addEventListener("click", () => {
                    this.controladorVision({
                        visionSel: "vertical",
                        instanciaUID: instanciaUID_ui

                    })
                })
                selectorVertical.textContent = "Vision vertical"
                contenedorSelectorVision.appendChild(selectorVertical)



                const infoVision = document.createElement("p")
                infoVision.classList.add("padding14", "textoCentrado")
                infoVision.setAttribute("info", "vertical")
                infoVision.style.display = "none"
                infoVision.textContent = "Cuando se usa la visión vertical, los rangos de fechas disponibles son solo de un año antes y después del mes actual. Para una búsqueda de cualquier fecha, utilice la visión horizontal."
                contenedor.appendChild(infoVision)

                const contenedorSelectorFechaHorizontal = document.createElement("div")
                contenedorSelectorFechaHorizontal.classList.add("gridHorizontal2C", "gap6")
                contenedorSelectorFechaHorizontal.setAttribute("contenedorSelector", "horizontal")
                contenedorSelectorFechaHorizontal.style.display = "none"
                contenedor.appendChild(contenedorSelectorFechaHorizontal);


                const selectorMesHorizontal = document.createElement("select")
                selectorMesHorizontal.classList.add("botonV1BlancoIzquierda_campo")
                selectorMesHorizontal.setAttribute("campo", "mes")
                contenedorSelectorFechaHorizontal.appendChild(selectorMesHorizontal)

                const tituloSelector = document.createElement("option");
                tituloSelector.disabled = true;
                tituloSelector.text = "Seleccionar mes";
                selectorMesHorizontal.appendChild(tituloSelector)

                const meses = [
                    { value: "1", text: "1 Enero" },
                    { value: "2", text: "2 Febrero" },
                    { value: "3", text: "3 Marzo" },
                    { value: "4", text: "4 Abril" },
                    { value: "5", text: "5 Mayo" },
                    { value: "6", text: "6 Junio" },
                    { value: "7", text: "7 Julio" },
                    { value: "8", text: "8 Agosto" },
                    { value: "9", text: "9 Septiembre" },
                    { value: "10", text: "10 Octubre" },
                    { value: "11", text: "11 Noviembre" },
                    { value: "12", text: "12 Diciembre" }
                ]


                for (const opcionData of meses) {
                    const value = opcionData.value
                    const opcion = document.createElement("option");
                    opcion.value = opcionData.value;
                    opcion.text = opcionData.text;
                    if (mesActual === value) {
                        opcion.selected = true;
                    }
                    selectorMesHorizontal.appendChild(opcion);
                }

                selectorMesHorizontal.value = mesActual


                const selectorAnoHorizontal = document.createElement("input")
                selectorAnoHorizontal.classList.add("botonV1BlancoIzquierda_campo")
                selectorAnoHorizontal.setAttribute("campo", "ano")
                selectorAnoHorizontal.setAttribute("type", "number")
                selectorAnoHorizontal.placeholder = "Seleccionar año";
                selectorAnoHorizontal.value = anoActual


                contenedorSelectorFechaHorizontal.appendChild(selectorAnoHorizontal)

                const contenedorSelectorFechaVertical = document.createElement("div")
                contenedorSelectorFechaVertical.classList.add("flexVertical", "gap6")
                contenedorSelectorFechaVertical.setAttribute("contenedorSelector", "vertical")

                contenedorSelectorFechaVertical.style.display = "node"
                contenedor.appendChild(contenedorSelectorFechaVertical);


                const selectorListaVertical = document.createElement("select")
                selectorListaVertical.classList.add("botonV1BlancoIzquierda_campo")
                selectorListaVertical.setAttribute("campo", "listaVertical")
                contenedorSelectorFechaVertical.appendChild(selectorListaVertical)

                const tituloSelecto1 = document.createElement("option");
                tituloSelecto1.disabled = true;
                tituloSelecto1.text = "Seleccionar mes en la vision verical";
                selectorListaVertical.appendChild(tituloSelecto1)

                // Ojo por que hay que aseurarse que lo cree siempre desd el mes presente. Ahora no lo hace
                const mesesArray = this.generarMeses({
                    mes: mesPresente,
                    año: anoPresente
                });

                for (const opcionData of mesesArray) {
                    const value = opcionData.value
                    const opcion = document.createElement("option");
                    opcion.value = opcionData.value;
                    opcion.text = opcionData.text;
                    if (mesActual === value) {
                        opcion.selected = true;
                    }
                    selectorListaVertical.appendChild(opcion);
                }
                selectorListaVertical.value = `${Number(mesActual)}-${anoActual}`
                const botonIR = document.createElement("div")
                botonIR.classList.add("botonV1BlancoIzquierda")
                botonIR.setAttribute("boton", "botonIr")
                botonIR.textContent = "Ir la a fecha";
                botonIR.addEventListener("click", async () => {
                    const visionSel = contenedorSelectorVision.getAttribute("visionSel")


                    let mes
                    let ano
                    if (visionSel === "horizontal") {
                        mes = selectorMesHorizontal.value
                        ano = selectorAnoHorizontal.value
                    } else if (visionSel === "vertical") {
                        const fechaSel = selectorListaVertical.value.split("-")
                        mes = fechaSel[0]
                        ano = fechaSel[1]
                    } else {
                        const m = "Falta el identificador de vision"
                        return casaVitini.ui.componentes.advertenciaInmersiva(m)
                    }

                    await this.irAFechaSeleccionadas({
                        visionSel: visionSel,
                        mes,
                        ano
                    })
                })
                contenedor.appendChild(botonIR)
                this.controladorVision({
                    visionSel: vision,
                    instanciaUID: instanciaUID_ui

                })
            },
            generarMeses: function (rangoFecha) {
                const meses = [
                    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                ];
                const fechaInicial = new Date(rangoFecha.año, rangoFecha.mes - 1); // Meses de 0 a 11 en Date
                const resultado = [];

                // Recorrer desde un año antes hasta un año después (24 meses en total)
                for (let i = -12; i <= 12; i++) {
                    const nuevaFecha = new Date(fechaInicial);
                    nuevaFecha.setMonth(fechaInicial.getMonth() + i);

                    const mes = nuevaFecha.getMonth();
                    const año = nuevaFecha.getFullYear();

                    resultado.push({
                        value: `${mes + 1}-${año}`, // El mes está en índice 0
                        text: `${mes + 1} ${meses[mes]} ${año}`
                    });
                }

                return resultado;
            },
            controladorVision: function (data) {
                const instanciaUID = data.instanciaUID
                const visionSel = data.visionSel

                const espacio = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                const botonIr = espacio.querySelector("[boton=botonIr]")
                const infoVision = espacio.querySelector("[info=vertical]")
                const contenedorBotonesVision = espacio.querySelector("[contenedor=botonesVision]")

                const botonHorizontal = contenedorBotonesVision.querySelector("[v=horizontal]")
                const botonVertical = contenedorBotonesVision.querySelector("[v=vertical]")

                const contenedorHorizontal = espacio.querySelector("[contenedorSelector=horizontal]")
                const contenedorVertical = espacio.querySelector("[contenedorSelector=vertical]")

                botonHorizontal.removeAttribute("style")
                botonVertical.removeAttribute("style")

                contenedorHorizontal.style.display = "none"
                contenedorVertical.style.display = "none"

                if (visionSel === "vertical") {

                    botonVertical.style.background = "blue"
                    botonVertical.style.color = "white"
                    contenedorVertical.style.display = "flex"
                    botonIr.textContent = "Ir a la fecha en el calendario vertical"
                    contenedorBotonesVision.setAttribute("visionSel", "vertical")
                    infoVision.style.display = "block"


                } else if (visionSel === "horizontal") {
                    infoVision.style.display = "none"
                    botonHorizontal.style.background = "blue"
                    botonHorizontal.style.color = "white"
                    contenedorHorizontal.style.display = "grid"
                    botonIr.textContent = "Ir a la fecha en el calendario horizontal"
                    contenedorBotonesVision.setAttribute("visionSel", "horizontal")
                }
            },
            irAFechaSeleccionadas: async function (data) {
                const traductorURL = casaVitini.view.traductorURL()
                const visionSel = data.visionSel
                const mes = data.mes
                const ano = data.ano
                await casaVitini.view.vision.cambiarVision({
                    visionSel: visionSel
                })
                traductorURL.fecha = `${mes}-${ano}`
                if (visionSel === "horizontal") {
                    // traductorURL.vision = `horizontal`

                    const sectionRenderizada = document.querySelector("main")
                    const instanciaUID_main = sectionRenderizada.getAttribute("instanciaUID")

                    casaVitini.view.controladorRegistros({
                        tipoRegistro: "crear",
                        traductorURL: traductorURL
                    })

                    await casaVitini.view.irAFecha({
                        tipoRegistro: "crear",
                        tipoResolucion: "personalizado",
                        ano: Number(ano),
                        mes: Number(mes),
                        instanciaUID_main: instanciaUID_main,
                        traductorURL: traductorURL
                    })

                } else if (visionSel === "vertical") {

                    //  traductorURL.vision = `vertical`

                    casaVitini.view.controladorRegistros({
                        tipoRegistro: "crear",
                        traductorURL: traductorURL
                    })
                    const fechaDestino = document.querySelector(`[mesIDV="${String(mes).padStart("2", 0)}-${ano}"]`).closest("[contenedor=mes]");

                    if (fechaDestino) {


                        fechaDestino.scrollIntoView({ behavior: "instant" });
                    }
                }
            }
        }
    },
    limpiezaGlobal: function () {


    },
    limpiezaCalendario: {
        hub: function (data) {
            const limpiezaIDV = data.limpiezaIDV
            if (limpiezaIDV.includes("url")) {
                this.url()
            }
            if (limpiezaIDV.includes("vista")) {
                this.vista()
            }
            if (limpiezaIDV.includes("global")) {
                this.url()
                this.vista()
            }
        },
        url: function () {
            const traductorURL = casaVitini.view.traductorURL()
            traductorURL.capas = []
            traductorURL.capasCompuestas = {}
            casaVitini.view.controladorRegistros({
                tipoRegistro: "crear",
                traductorURL: traductorURL
            })
        },
        vista: function () {
            const todosLosEventosRenderizados = document.querySelectorAll("[componente=eventoUI]")
            todosLosEventosRenderizados.forEach((e) => { e.remove() })
            document.querySelector("[componente=botonFlotanteOpcioneDiasSel]")?.remove()
            document.querySelector("[contenedorCompartidoFechasSel]")?.removeAttribute("contenedorCompartidoFechasSel")
            document.querySelector("[contenedorApartamentos]")?.removeAttribute("contenedorApartamentos")

            const diasDelMes = document.querySelectorAll("[dia]")
            diasDelMes.forEach(dia => {
                dia.removeEventListener("click", casaVitini.view.controladorSelecionDias.selectorDia.hub)
                dia.removeEventListener("click", casaVitini.view.controladorSelecionDias.infoNoSel)
                dia.classList.remove("diaSelecionable")
                dia.classList.remove("diaSel")
                dia.removeAttribute("eventosContenedor")
                dia.querySelector("[contenedor=data]").textContent = null
            })
            const estadosRenderizado = document.querySelectorAll("[estadoRenderizado")
            estadosRenderizado.forEach(e => e.removeAttribute("estadoRenderizado"))

        }
    },
    controladorSelecionDias: {
        arranque: function (data) {
            const instanciaUIDMes = data.instanciaUIDMes
            const apartamentos = data.apartamentos
            const mesDestino = data.mesDestino
            const anoDestino = data.anoDestino
            const selectorMes = document.querySelector(`[instanciaUID="${instanciaUIDMes}"]`)
            if (selectorMes) {
                const mes = mesDestino
                const ano = anoDestino
                const diasDelMes = selectorMes.querySelectorAll("[dia]")
                const contenedorCompartidoFechasSel = JSON.parse(document.querySelector("[contenedorCompartidoFechasSel]")?.getAttribute("contenedorCompartidoFechasSel") || "{}")
                selectorMes.setAttribute("contenedorApartamentos", JSON.stringify(apartamentos))

                diasDelMes.forEach((dia) => {
                    const numeroDia = dia.getAttribute("dia")
                    const contenedor = JSON.parse(dia.getAttribute("eventosContenedor") || "{}")
                    const eventosDelDia = contenedor.eventos
                    const eventosUID = Object.keys(eventosDelDia)
                    const fecha = `${ano}-${String(mes).padStart(2, "0")}-${numeroDia}`

                    if (eventosUID.length === 0) {
                        dia.addEventListener("click", casaVitini.view.controladorSelecionDias.selectorDia.hub)
                        dia.classList.add("diaSelecionable")
                        if (contenedorCompartidoFechasSel.hasOwnProperty(fecha)) {
                            casaVitini.view.controladorSelecionDias.estadosDia({
                                dia: dia,
                                haciaEstado: "sel"
                            })
                        }
                    } else {
                        let decisionFinal = true
                        for (const eventoUID of eventosUID) {
                            const contenedorEvento = selectorMes.querySelector(`[eventoUID="${eventoUID}"]`)
                            const detallesDelEvento = JSON.parse(contenedorEvento.getAttribute("detallesDelEvento"))
                            const tipoEventoIDV = detallesDelEvento.tipoEvento

                            if (tipoEventoIDV === "comportamientosPorApartamento") {
                                const contenedor = detallesDelEvento.contenedor
                                const tipoEvento = contenedor.tipo
                                const apartamentos = contenedor.apartamentos
                                const fechaInicio = contenedor.fechaInicio
                                const fechaFinal = contenedor.fechaFinal
                                if (tipoEvento === "porRango" && apartamentos.length === 1 && fechaInicio === fechaFinal) {
                                    decisionFinal = true
                                    break
                                } else {
                                    decisionFinal = false
                                }
                            } else if (tipoEventoIDV === "comportamientosPorApartamentoBasadoEnDia") {
                                decisionFinal = false

                            }
                        }

                        if (decisionFinal === true) {
                            dia.addEventListener("click", casaVitini.view.controladorSelecionDias.selectorDia.hub)
                            dia.classList.add("diaSelecionable")
                            if (contenedorCompartidoFechasSel.hasOwnProperty(fecha)) {
                                casaVitini.view.controladorSelecionDias.estadosDia({
                                    dia: dia,
                                    haciaEstado: "sel"
                                })
                            }
                        } else {
                            delete contenedorCompartidoFechasSel[fecha]
                            dia.addEventListener("click", casaVitini.view.controladorSelecionDias.infoNoSel)
                        }
                    }
                })
                const destino = document.querySelector("[contenedorCompartidoFechasSel]")
                if (Object.keys(contenedorCompartidoFechasSel).length === 0) {
                    destino?.removeAttribute("contenedorCompartidoFechasSel")
                } else {
                    destino.setAttribute("contenedorCompartidoFechasSel", JSON.stringify(contenedorCompartidoFechasSel))
                }
            }
        },
        estadosDia: function (data) {
            const dia = data.dia
            const haciaEstado = data.haciaEstado

            if (haciaEstado === "sel") {
                dia.classList.add("diaSel")
                dia.setAttribute("estadoSel", "activado")

                const botonRenderizado = document.querySelector("[componente=botonFlotanteOpcioneDiasSel]")
                if (!botonRenderizado) {
                    const boton = casaVitini.view.controladorSelecionDias.botonFlotante()
                    document.querySelector("main").appendChild(boton)
                }

            } else if (haciaEstado === "noSel") {
                dia.classList.remove("diaSel")
                dia.removeAttribute("estadoSel")
                dia.removeAttribute("rango")

            }

        },
        selectorDia: {
            selectorDiaIndividual: function (e) {
                const contenedorDia = e.target.closest("[dia]")
                const diaSel = contenedorDia.getAttribute("dia")
                const fechaDelMes = contenedorDia.closest("[mesIDV]").getAttribute("mesIDV").split("-")
                const mes = fechaDelMes[0]
                const ano = fechaDelMes[1]
                const fechaSel = `${ano}-${String(mes).padStart(2, "0")}-${String(diaSel).padStart(2, "0")}`

                const estadoDia = contenedorDia.getAttribute("estadoSel")
                if (estadoDia === "activado") {
                    casaVitini.view.controladorSelecionDias.estadosDia({
                        dia: contenedorDia,
                        haciaEstado: "noSel"
                    })
                } else {
                    casaVitini.view.controladorSelecionDias.estadosDia({
                        dia: contenedorDia,
                        haciaEstado: "sel"
                    })
                }
                const contenedorCompartidoFechasSel = {}
                const obtenerContenedorDiasSel = document.querySelector("main configuracion").getAttribute("contenedorCompartidoFechasSel")
                if (obtenerContenedorDiasSel) {
                    const contenedorRen = JSON.parse(obtenerContenedorDiasSel)
                    Object.assign(contenedorCompartidoFechasSel, { ...contenedorRen });
                }

                if (estadoDia === "activado") {
                    delete contenedorCompartidoFechasSel[fechaSel]
                } else {
                    contenedorCompartidoFechasSel[fechaSel] = "diaSeleccioando"
                }
                if (Object.keys(contenedorCompartidoFechasSel).length > 0) {
                    document.querySelector("main configuracion").setAttribute("contenedorCompartidoFechasSel", JSON.stringify(contenedorCompartidoFechasSel))
                } else {
                    document.querySelector("main configuracion").removeAttribute("contenedorCompartidoFechasSel")
                }
                this.controladorUISelDia()
            },
            controladorUISelDia: function () {
                const obtenerContenedorDiasSel = JSON.parse(document.querySelector("main configuracion").getAttribute("contenedorCompartidoFechasSel") || "{}")
                if (Object.keys(obtenerContenedorDiasSel).length > 0) {
                    const botonRenderizado = document.querySelector("[componente=botonFlotanteOpcioneDiasSel]")
                    if (!botonRenderizado) {
                        const boton = casaVitini.view.controladorSelecionDias.botonFlotante()
                        document.querySelector("main").appendChild(boton)
                    }
                } else {
                    document.querySelector("[componente=botonFlotanteOpcioneDiasSel]")?.remove()
                    document.querySelector("main configuracion").removeAttribute("contenedorCompartidoFechasSel")
                }


            },
            selectorPorRango: {
                inicioRango: function (e) {
                    const contenedorDia = e.target.closest("[dia]")
                    contenedorDia.setAttribute("rango", "inicio")
                    // contenedorDia.setAttribute("estadoSel", "activado")

                    contenedorDia.classList.add("diaSel")

                    const diasRenderizados = document.querySelectorAll("[dia]")
                    diasRenderizados.forEach((d) => {
                        if (d !== contenedorDia) {
                            d.removeAttribute("rango")
                            d.classList.remove("diaSel")
                        }
                        d.addEventListener("mouseover", casaVitini.view.controladorSelecionDias.selectorDia.selectorPorRango.controlHover)
                    })
                },
                finalRango: function (e) {
                    const contenedorDia = e.target.closest("[dia]")
                    const estadoDia = contenedorDia.getAttribute("estadoSel")
                    const diasRenderizados = document.querySelectorAll("[dia]")
                    const diasDelRango = document.querySelectorAll("[dia][rango]")

                    const contenedorCompartidoFechasSel = {}
                    diasDelRango.forEach(d => {
                        d.setAttribute("estadoSel", "activado")
                        d.classList.add("diaSel")

                        const fechaDelMes = d.closest("[mesIDV]").getAttribute("mesIDV").split("-")
                        const mes = fechaDelMes[0]
                        const ano = fechaDelMes[1]
                        const diaSel = d.getAttribute("dia")
                        const fechaSel = `${ano}-${String(mes).padStart(2, "0")}-${String(diaSel).padStart(2, "0")}`
                        contenedorCompartidoFechasSel[fechaSel] = "diaSeleccioando"
                    })
                    diasRenderizados.forEach((d) => {
                        d.removeEventListener("mouseover", casaVitini.view.controladorSelecionDias.selectorDia.selectorPorRango.controlHover)
                        d.removeAttribute("rango")
                    })
                    document.querySelector("main configuracion").setAttribute("contenedorCompartidoFechasSel", JSON.stringify(contenedorCompartidoFechasSel))

                    casaVitini.view.controladorSelecionDias.selectorDia.controladorUISelDia()


                },
                controlHover: function (e) {
                    const diaInicioRango = document.querySelector("[dia][rango=inicio]");
                    const diaDebajoComoFinalRango = e.target.closest("[dia]");

                    const elementosEntre = [];

                    if (diaDebajoComoFinalRango.getAttribute("rango") !== "inicio") {
                        const todosLosDias = document.querySelectorAll("[dia]");

                        const inicioIndex = Array.from(todosLosDias).indexOf(diaInicioRango);
                        const finIndex = Array.from(todosLosDias).indexOf(diaDebajoComoFinalRango);

                        const start = Math.min(inicioIndex, finIndex);
                        const end = Math.max(inicioIndex, finIndex);

                        for (let i = start; i <= end; i++) {
                            elementosEntre.push(todosLosDias[i]);
                        }
                        elementosEntre.forEach(e => {
                            const tipoRango = e.getAttribute("rango")
                            if (tipoRango !== "inicio") {

                                const contenedor = JSON.parse(e.getAttribute("eventosContenedor") || "{}")
                                const eventosDelDia = contenedor.eventos
                                const eventosUID = Object.keys(eventosDelDia)
                                let decisionFinal = true
                                if (eventosUID.length > 0) {
                                    for (const eventoUID of eventosUID) {
                                        const mesIDV = e.closest("[mesIDV]")
                                        const contenedorEvento = mesIDV.querySelector(`[eventoUID="${eventoUID}"]`)
                                        const detallesDelEvento = JSON.parse(contenedorEvento.getAttribute("detallesDelEvento"))
                                        const tipoEventoIDV = detallesDelEvento.tipoEvento

                                        if (tipoEventoIDV === "comportamientosPorApartamento") {
                                            const contenedor = detallesDelEvento.contenedor
                                            const tipoEvento = contenedor.tipo
                                            const apartamentos = contenedor.apartamentos
                                            const fechaInicio = contenedor.fechaInicio
                                            const fechaFinal = contenedor.fechaFinal
                                            if (tipoEvento === "porRango" && apartamentos.length === 1 && fechaInicio === fechaFinal) {
                                                decisionFinal = true
                                                break
                                            } else {
                                                decisionFinal = false
                                            }
                                        } else if (tipoEventoIDV === "comportamientosPorApartamentoBasadoEnDia") {
                                            decisionFinal = false

                                        }
                                    }
                                }

                                if (decisionFinal === true) {
                                    e.classList.add("diaSel")
                                    e.setAttribute("rango", "intermedio");
                                }

                            }
                        });
                    }
                    const diasPreseleccionados = document.querySelectorAll("[dia][rango=intermedio]");
                    diasPreseleccionados.forEach(e => {
                        if (!elementosEntre.includes(e)) {
                            e.classList.remove("diaSel")
                            e.removeAttribute("rango", "intermedio");
                        }
                    });
                },
                controlHoverAntiguo: function (e) {

                    const diaInicioRango = document.querySelector("[dia][rango=inicio]")
                    const diaDebajoComoFinalRango = e.target.closest("[dia]")

                    // Recorremos hasta llegar al elementoFin
                    // Si el elemento de inicio está antes que el de fin, recorremos hacia adelante
                    const elementosEntre = [];
                    if (diaDebajoComoFinalRango.getAttribute("rango") !== "inicio") {
                        let currentElement = diaInicioRango;
                        // Determinar si elementoInicio está antes o después de elementoFin
                        if (diaInicioRango.compareDocumentPosition(diaDebajoComoFinalRango) & Node.DOCUMENT_POSITION_FOLLOWING) {
                            // Si elementoInicio está antes, recorremos hacia adelante
                            currentElement = diaInicioRango.nextElementSibling;
                            while (currentElement && currentElement !== diaDebajoComoFinalRango) {
                                elementosEntre.push(currentElement);
                                currentElement = currentElement.nextElementSibling; // Avanzamos
                            }
                        } else {
                            // Si elementoInicio está después, recorremos hacia atrás
                            currentElement = diaInicioRango.previousElementSibling;
                            while (currentElement && currentElement !== diaDebajoComoFinalRango) {
                                elementosEntre.push(currentElement);
                                currentElement = currentElement.previousElementSibling; // Retrocedemos
                            }
                        }
                        elementosEntre.forEach(e => {
                            e.classList.add("diaSel")
                            e.setAttribute("rango", "intermedio")
                        })
                    }
                    const diasPreselecioandos = document.querySelectorAll("[dia][rango=intermedio]")
                    diasPreselecioandos.forEach(e => {
                        if (!elementosEntre.includes(e)) {
                            e.removeAttribute("rango")
                            e.classList.remove("diaSel")
                        }
                    })

                }
            },

            hub: function (e) {
                const tipoSel = document.querySelector("[boton=tipoSel]").getAttribute("tipoSel")
                if (tipoSel === "porRango") {
                    const diaSelecionadoComoRangoInicio = document.querySelector("[dia][rango=inicio]")
                    if (diaSelecionadoComoRangoInicio) {
                        casaVitini.view.controladorSelecionDias.selectorDia.selectorPorRango.finalRango(e)
                    } else {
                        casaVitini.view.controladorSelecionDias.selectorDia.selectorPorRango.inicioRango(e)
                    }
                } else if (tipoSel === "porDiasIndividual") {
                    casaVitini.view.controladorSelecionDias.selectorDia.selectorDiaIndividual(e)
                }
            }
        },

        botonFlotante: function () {

            const ui = document.createElement("div")
            ui.classList.add("backgroundWhite1", "padding8", "borderRadius22", "blur50", "efectoAparicion", "sombraCompartida", "gridHorizontal2C_minContent_auto", "gap8", "botonFlotante", "botonFlotante_abajo", "sobreControlAnimacionGlobal")
            ui.setAttribute("componente", "botonFlotanteOpcioneDiasSel")
            ui.style.top = "calc(100% - 70px)";

            const icono = document.createElement("div")
            icono.classList.add("botonV1BlancoIzquierda")
            icono.setAttribute("posicion", "abajo")
            icono.textContent = "Mover"
            icono.addEventListener("click", (e) => {
                this.moverBotonFlotante(e)
            })
            ui.appendChild(icono)

            const t = document.createElement("p")
            t.classList.add("botonV1BlancoIzquierda")
            t.textContent = "Desplegar opciones de los dias seleccionados"
            t.addEventListener("click", this.menuFlotante)

            ui.appendChild(t)

            return ui
        },
        moverBotonFlotante: function (e) {
            const boton = e.target
            const posicionActual = boton.getAttribute("posicion")
            const contenedorFlotante = e.target.closest("[componente=botonFlotanteOpcioneDiasSel]")
            if (posicionActual === "abajo") {
                boton.setAttribute("posicion", "arriba");
                contenedorFlotante.style.top = "10px";
            } else if (posicionActual === "arriba") {
                boton.setAttribute("posicion", "abajo")
                contenedorFlotante.style.top = "calc(100% - 70px)";
            }
        },
        infoNoSel: function () {
            const m = "Este día no es seleccionable porque solo contiene comportamientos de precio avanzados. Para editar estos comportamientos, por favor ingresa en la sección de 'Comportamientos de precio' y realiza las modificaciones desde su menú. Ten en cuenta que desde el calendario solo se pueden modificar comportamientos de precio simples por rango. Si haces clic en el comportamiento de precio avanzado iras directo a su edición"
            casaVitini.ui.componentes.advertenciaInmersiva(m)
        },
        menuFlotante: function () {
            const apartamentos = JSON.parse(document.querySelector("[contenedorApartamentos]").getAttribute("contenedorApartamentos") || "{}")
            const contenedorCompartidoFechasSel = JSON.parse(document.querySelector("[contenedorCompartidoFechasSel]")?.getAttribute("contenedorCompartidoFechasSel") || "{}")

            const main = document.querySelector("main")
            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada({
                alineacion: "arriba"
            })
            main.appendChild(ui)
            const contenedor = ui.querySelector("[componente=contenedor]")



            const botonCancelar = document.createElement("div")
            botonCancelar.classList.add("botonV1")
            botonCancelar.setAttribute("boton", "cancelar")
            botonCancelar.textContent = "Volver al calendario"
            botonCancelar.addEventListener("click", () => {
                return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
            })
            contenedor.appendChild(botonCancelar)



            const infoDeSel = document.createElement("p")
            infoDeSel.classList.add("padding10")
            infoDeSel.textContent = "Si quiere puede borrar todos los dias selecionados y volver a comenzar con la selección"
            contenedor.appendChild(infoDeSel)

            const botonDeSel = document.createElement("div")
            botonDeSel.classList.add("botonV1")
            botonDeSel.textContent = "Deselecionar todos los dias selecionados en todos los meses y volver al calendario"
            botonDeSel.addEventListener("click", () => {
                const instanciaUIDMes = document.querySelector("[componente=marcoMes]").getAttribute("instanciaUID")
                document.querySelector("main configuracion").removeAttribute("contenedorCompartidoFechasSel")
                document.querySelector("[componente=botonFlotanteOpcioneDiasSel]")?.remove()
                const diasRenderizados = document.querySelectorAll("[dia]")
                diasRenderizados.forEach(d => {
                    casaVitini.view.controladorSelecionDias.estadosDia({
                        dia: d,
                        haciaEstado: "noSel"
                    })
                    //   d.classList.remove("diaSelecionable")
                })
                return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
            })
            contenedor.appendChild(botonDeSel)

            const info = document.createElement("p")
            info.classList.add("padding10")
            info.textContent = "La alteracion de precios se aplicara a las fechas y alojamientos seleccionados. Si los dias tiene ya un comportamiento de precio simple, este sera actualziado. Si el dia no tiene un comportamiento de precio simple se creara."
            contenedor.appendChild(info)

            const listaPlegable = () => {

                const contenedorPlegableFechas = document.createElement("details")
                contenedorPlegableFechas.classList.add("flexVertical", "padding6")

                const titulo = document.createElement("summary")
                titulo.classList.add("padding10", "margin0")
                titulo.setAttribute("componente", "titulo")
                contenedorPlegableFechas.appendChild(titulo)


                const listaFechas = document.createElement("div")
                listaFechas.classList.add("flexVertical", "gap6", "padding10")
                listaFechas.setAttribute("contenedor", "lista")
                contenedorPlegableFechas.appendChild(listaFechas)

                return contenedorPlegableFechas
            }

            const listaPlegableFechas = listaPlegable()
            listaPlegableFechas.querySelector("[componente=titulo]").textContent = "Fechas seleccionadas"

            const fechasArray = []


            Object.entries(contenedorCompartidoFechasSel).forEach((o) => {
                const [fecha, contenedor] = o

                const fechaUI = document.createElement("p")
                fechaUI.textContent = fecha
                listaPlegableFechas.querySelector("[contenedor=lista]").appendChild(fechaUI)
                fechasArray.push(fecha)
            })

            contenedor.appendChild(listaPlegableFechas)

            const listaPlegableApartamentosAfectados = listaPlegable()
            listaPlegableApartamentosAfectados.querySelector("[componente=titulo]").textContent = "Apartamentos seleccionados"

            const apartamentosIDVArray = []

            Object.entries(apartamentos).forEach((o) => {
                const [apartamentoIDV, apartamentoUI] = o

                const linea = document.createElement("p")
                linea.textContent = `${apartamentoUI} (${apartamentoIDV})`
                listaPlegableApartamentosAfectados.querySelector("[contenedor=lista]").appendChild(linea)
                apartamentosIDVArray.push(apartamentoIDV)
            })
            contenedor.appendChild(listaPlegableApartamentosAfectados)

            const infoCom = document.createElement("p")
            infoCom.classList.add("padding10")
            infoCom.textContent = "Selecione la actualización de los precios para los días y los apartamentos selecionados."
            contenedor.appendChild(infoCom)

            const tipoDescuento = document.createElement("select")
            // tipoDescuento.classList.add("crearOfertaDescuentoDedicadoListaTipoDescuento")
            tipoDescuento.setAttribute("campoApartamentoSeleccionado", "simboloIDV")
            contenedor.appendChild(tipoDescuento)

            const opcionPredeterminada = document.createElement("option")
            opcionPredeterminada.disabled = true;
            opcionPredeterminada.selected = true;
            opcionPredeterminada.value = "no"
            opcionPredeterminada.text = "Selecciona el tipo de comportamiento."
            tipoDescuento.appendChild(opcionPredeterminada);

            const opciones = [
                { value: "aumentoPorcentaje", text: "Aumentar precio por porcentaje." },
                { value: "aumentoCantidad", text: "Aumentar precio por cantidad." },
                { value: "reducirCantidad", text: "Reducir precio por cantidad" },
                { value: "reducirPorcentaje", text: "Reducir precio por porcentaje" },
                { value: "precioEstablecido", text: "Establecer el precio" }
            ];
            for (const opcionData of opciones) {
                const opcion = document.createElement("option");
                opcion.value = opcionData.value;
                opcion.text = opcionData.text;
                tipoDescuento.appendChild(opcion);
            }

            const cantidadUI = document.createElement("input")
            cantidadUI.setAttribute("campoApartamentoSeleccionado", "cantidad")
            cantidadUI.placeholder = "Inserta la cantidad"
            cantidadUI.value = "0.00"
            contenedor.appendChild(cantidadUI)

            const botonActualizar = document.createElement("div")
            botonActualizar.classList.add("botonV1BlancoIzquierda")
            botonActualizar.setAttribute("boton", "cancelar")
            botonActualizar.textContent = "Actualizar precios de los dias seleccionados"
            botonActualizar.addEventListener("click", () => {
                casaVitini.view.controladorSelecionDias.actualizarComportamientos({
                    fechasArray,
                    apartamentosIDVArray,
                    cantidad: cantidadUI.value,
                    simboloIDV: tipoDescuento.value
                })
            })
            contenedor.appendChild(botonActualizar)

            const infoDel = document.createElement("p")
            infoDel.classList.add("padding10")
            infoDel.textContent = "Si quiere puede eliminar todos los comportamientos simples para los días y los apartamentos selecionados."
            contenedor.appendChild(infoDel)

            const botonEliminarComportamientos = document.createElement("div")
            botonEliminarComportamientos.classList.add("botonV1BlancoIzquierda")
            botonEliminarComportamientos.setAttribute("boton", "cancelar")
            botonEliminarComportamientos.textContent = "Eliminar comportamientos simples de los días y apartamentos selecionados"
            botonEliminarComportamientos.addEventListener("click", () => {
                casaVitini.view.controladorSelecionDias.eliminarComportamientos({
                    fechasArray,
                    apartamentosIDVArray
                })
            })
            contenedor.appendChild(botonEliminarComportamientos)
        },
        actualizarComportamientos: async function (data) {
            const fechasArray = data.fechasArray
            const apartamentosIDVArray = data.apartamentosIDVArray
            const cantidad = data.cantidad
            const simboloIDV = data.simboloIDV
            const instanciaUID_pantallaDeCarga = casaVitini.utilidades.codigoFechaInstancia()

            const main = document.querySelector("main")
            const instanciaUID_main = main.getAttribute("instanciaUID")
            const instanciaUID_mes = main.querySelector("[componente=marcoMes]").getAttribute("instanciaUID")

            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
                instanciaUID: instanciaUID_pantallaDeCarga,
                mensaje: "Actualizando precios para los dias y apartamentos selecionados...",
                identificadorVisual: "pantallaDeCarga"
            })

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/calendario/operaciones/comportamientosDePrecio/actualizarComportamientosSimplePorDia",
                fechasSel: fechasArray,
                apartamentosIDVSel: apartamentosIDVArray,
                cantidad,
                simboloIDV
            })
            document.querySelector(`[instanciaUID="${instanciaUID_pantallaDeCarga}"]`)?.remove()
            if (respuestaServidor?.error) {
                if (respuestaServidor.comportamientosEnConflicto) {
                    const comportamientosEnConflictoUI = casaVitini.view.__sharedMethods__.compomentesUI.comportamientosEnClonfictoUI(respuestaServidor)
                    const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                    document.querySelector("main").appendChild(ui)
                    const constructor = ui.querySelector("[componente=constructor]")
                    const contenedor = ui.querySelector("[componente=contenedor]")

                    const titulo = constructor.querySelector("[componente=titulo]")
                    titulo.textContent = `Comportamientos de precio en conflicto`
                    const mensaje = constructor.querySelector("[componente=mensajeUI]")
                    mensaje.textContent = respuestaServidor?.error

                    const botonAceptar = constructor.querySelector("[boton=aceptar]")
                    botonAceptar.textContent = "Aceptar y volver al calendario"
                    botonAceptar.addEventListener("click", () => {
                        return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    })
                    const botonCancelar = constructor.querySelector("[boton=cancelar]")
                    botonCancelar.remove()
                    contenedor.appendChild(comportamientosEnConflictoUI)
                } else {
                    casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor.error)
                }
            } else if (respuestaServidor?.ok) {
                const traductorURL = casaVitini.view.traductorURL()
                const vision = document.querySelector("[vision]").getAttribute("vision")
                document.querySelector("main configuracion").removeAttribute("contenedorCompartidoFechasSel")
                document.querySelector("[componente=botonFlotanteOpcioneDiasSel]")?.remove()
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()

                if (vision === "horizontal") {
                    casaVitini.view.limpiezaCalendario.hub({
                        limpiezaIDV: ["vista"]
                    })
                    casaVitini.view.capas({
                        instanciaUID_main: instanciaUID_main,
                        origen: "historial",
                        traductorURL: traductorURL,
                        instanciaUIDMes: instanciaUID_mes
                    })
                } if (vision === "vertical") {
                    // Limpiar meses
                    casaVitini.view.limpiezaCalendario.hub({
                        limpiezaIDV: ["vista"]
                    })
                    const mesesImplicados = []
                    const mesesVisibles = () => {
                        const visibleDivs = [];
                        const container = document.querySelector('[contenedor=meses]');
                        const containerTop = container.scrollTop;
                        const containerBottom = containerTop + container.offsetHeight;

                        // Recorre todos los divs dentro del contenedor
                        const divs = container.querySelectorAll('[mesIDV]');
                        divs.forEach((div) => {
                            const divTop = div.offsetTop;
                            const divBottom = divTop + div.offsetHeight;
                            // Verifica si el div está dentro de la parte visible del contenedor
                            if (divBottom > containerTop && divTop < containerBottom) {
                                visibleDivs.push(div);

                            }
                        });

                        return visibleDivs;
                    }
                    mesesImplicados.push(...mesesVisibles())

                    mesesImplicados.forEach(m => {
                        const mesIDV = m.getAttribute("mesIDV")
                        const fecha = mesIDV.split("-")
                        const mes = fecha[0]
                        const ano = fecha[1]
                        const instanciaUIDMes = m.getAttribute("instanciaUID")

                        traductorURL.fecha = `${mes}-${ano}`
                        m.setAttribute("estadoRenderizado", "renderizado")

                        casaVitini.view.capas({
                            traductorURL: traductorURL,
                            instanciaUID_main: instanciaUID_main,
                            origen: "menuDesplegable",
                            instanciaUIDMes: instanciaUIDMes
                        })
                    })

                    // casaVitini.view.controladorRegistros({
                    //     tipoRegistro: "actualizar",
                    //     traductorURL: traductorURL
                    // })

                }



            }
        },
        eliminarComportamientos: async function (data) {
            const fechasArray = data.fechasArray
            const apartamentosIDVArray = data.apartamentosIDVArray
            const cantidad = data.cantidad
            const simboloIDV = data.simboloIDV
            const instanciaUID_pantallaDeCarga = casaVitini.utilidades.codigoFechaInstancia()

            const main = document.querySelector("main")
            const instanciaUID_main = main.getAttribute("instanciaUID")
            const instanciaUID_mes = main.querySelector("[componente=marcoMes]").getAttribute("instanciaUID")

            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
                instanciaUID: instanciaUID_pantallaDeCarga,
                mensaje: "Eliminado comportamientos de precio simples para los dias y apartamentos selecionados...",
                identificadorVisual: "pantallaDeCarga"
            })

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/calendario/operaciones/comportamientosDePrecio/eliminarComportamientosSimplePorDia",
                fechasSel: fechasArray,
                apartamentosIDVSel: apartamentosIDVArray,
            })
            document.querySelector(`[instanciaUID="${instanciaUID_pantallaDeCarga}"]`)?.remove()
            if (respuestaServidor?.error) {
                casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor.error)
            } else if (respuestaServidor?.ok) {
                const traductorURL = casaVitini.view.traductorURL()
                const vision = document.querySelector("[vision]").getAttribute("vision")
                casaVitini.view.limpiezaCalendario.hub({
                    limpiezaIDV: ["vista"]
                })
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                if (vision === "horizontal") {
                    casaVitini.view.capas({
                        instanciaUID_main: instanciaUID_main,
                        origen: "historial",
                        traductorURL: traductorURL,
                        instanciaUIDMes: instanciaUID_mes
                    })
                } if (vision === "vertical") {
                    // Limpiar meses
                    const mesesImplicados = []
                    const mesesVisibles = () => {
                        const visibleDivs = [];
                        const container = document.querySelector('[contenedor=meses]');
                        const containerTop = container.scrollTop;
                        const containerBottom = containerTop + container.offsetHeight;
                        // Recorre todos los divs dentro del contenedor
                        const divs = container.querySelectorAll('[mesIDV]');
                        divs.forEach((div) => {
                            const divTop = div.offsetTop;
                            const divBottom = divTop + div.offsetHeight;
                            // Verifica si el div está dentro de la parte visible del contenedor
                            if (divBottom > containerTop && divTop < containerBottom) {
                                visibleDivs.push(div);
                            }
                        });
                        return visibleDivs;
                    }
                    mesesImplicados.push(...mesesVisibles())
                    mesesImplicados.forEach(m => {
                        const mesIDV = m.getAttribute("mesIDV")
                        const fecha = mesIDV.split("-")
                        const mes = fecha[0]
                        const ano = fecha[1]
                        const instanciaUIDMes = m.getAttribute("instanciaUID")

                        traductorURL.fecha = `${mes}-${ano}`
                        m.setAttribute("estadoRenderizado", "renderizado")

                        casaVitini.view.capas({
                            traductorURL: traductorURL,
                            instanciaUID_main: instanciaUID_main,
                            origen: "menuDesplegable",
                            instanciaUIDMes: instanciaUIDMes
                        })
                    })

                    // casaVitini.view.controladorRegistros({
                    //     tipoRegistro: "actualizar",
                    //     traductorURL: traductorURL
                    // })

                }

            }
        },
        reseteaDiasSelecionados: function () {
            const diasRenderizados = document.querySelectorAll("[dia]") || []
            diasRenderizados.forEach(d => {
                this.estadosDia({
                    dia: d,
                    haciaEstado: "noSel"
                })
                d.classList.remove("diaSelecionable")
                d.removeEventListener("click", casaVitini.view.controladorSelecionDias.selectorDia.hub)
                d.removeEventListener("click", casaVitini.view.controladorSelecionDias.infoNoSel)
            })
        }
    },
    seleccion: {
        controladorSeleccion: function () {
            const main = document.querySelector("main")
            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
            main.appendChild(ui)
            const contenedor = ui.querySelector("[componente=contenedor]")

            const titulo = document.createElement("div")
            titulo.classList.add("titulo")
            titulo.textContent = `Tipo de selección de los días del calendario`
            contenedor.appendChild(titulo)

            const infoSel = document.createElement("p")
            infoSel.classList.add("textoCentrado")

            infoSel.textContent = "Determine el tipo de selección que se usara en los calendarios para seleccionarn dias. La visión por día individual le permite selecciona días individualmente y es más granular. La visión basada en rango  hace más cómodo seleccionar rangos de días, pero no es tan granular como la visión basada en días individuales. "
            contenedor.appendChild(infoSel)

            const botonHorizontal = document.createElement("div")
            botonHorizontal.classList.add("botonV1BlancoIzquierda")
            botonHorizontal.textContent = "Seleccionar días individualmente"
            botonHorizontal.addEventListener("click", () => {
                this.actualizarEstadoSel("porDiasIndividual")

            })

            contenedor.appendChild(botonHorizontal)

            const botonVertical = document.createElement("div")
            botonVertical.classList.add("botonV1BlancoIzquierda")
            botonVertical.textContent = "Seleccionar días por rango"
            botonVertical.addEventListener("click", () => {
                this.actualizarEstadoSel("porRango")
            })

            contenedor.appendChild(botonVertical)



            const botonCancelar = document.createElement("div")
            botonCancelar.classList.add("botonV1")
            botonCancelar.setAttribute("boton", "cancelar")
            botonCancelar.textContent = "Cerrar y volver al calendario"
            botonCancelar.addEventListener("click", () => {
                return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
            })
            contenedor.appendChild(botonCancelar)
        },
        actualizarEstadoSel: function (valor) {
            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
            const main = document.querySelector("main")
            const botonSel = main.querySelector("[panel=botonesGlobales] [boton=tipoSel]")
            const tipoSelActual = botonSel.getAttribute("tipoSel")

            if (tipoSelActual === valor) { return }
            const diasRenderizados = document.querySelectorAll("[dia]") || []
            diasRenderizados.forEach(d => {
                casaVitini.view.controladorSelecionDias.estadosDia({
                    dia: d,
                    haciaEstado: "noSel"
                })
                // d.removeAttribute("style")
                // d.removeAttribute("estadoSel")
                // d.removeAttribute("rango")
            })
            document.querySelector("[contenedorCompartidoFechasSel]")?.removeAttribute("contenedorCompartidoFechasSel")
            document.querySelector("[componente=botonFlotanteOpcioneDiasSel]")?.remove()

            if (!valor) {
                botonSel.setAttribute("tipoSel", "porDiasIndividual")
            } else {
                botonSel.setAttribute("tipoSel", valor)
            }
            casaVitini.view.__sharedMethods__.configuracion.actualizarConfiguracion({
                configuracionIDV: "calendario.tipoSeleccion",
                valor: valor
            })
        }
    },
    vision: {
        controladorVision: function () {
            const main = document.querySelector("main")
            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
            main.appendChild(ui)
            const contenedor = ui.querySelector("[componente=contenedor]")

            const titulo = document.createElement("div")
            titulo.classList.add(
                "titulo"
            )
            titulo.textContent = `Visión del calendario`
            contenedor.appendChild(titulo)

            const info = document.createElement("p")
            info.classList.add("textoCentrado", "padding14")
            info.textContent = "Seleccione el tipo de visión del calendario. Puede escoger entre la visión paginada horizontal y la visión en tira vertical. La visión en tira vertical está limitada a un año hacia delante y hace atrás del mes presente. La selección de la visión quedará almacenada en su configuración de usuario"
            contenedor.appendChild(info)


            const botonHorizontal = document.createElement("div")
            botonHorizontal.classList.add("botonV1BlancoIzquierda")
            botonHorizontal.textContent = "Visión horizontal"
            botonHorizontal.addEventListener("click", async () => {

                casaVitini.view.__sharedMethods__.configuracion.actualizarConfiguracion({
                    configuracionIDV: "calendario.tipoVision",
                    valor: "horizontal"
                })

                await this.cambiarVision({
                    visionSel: "horizontal"
                })
            })

            contenedor.appendChild(botonHorizontal)


            const botonVertical = document.createElement("div")
            botonVertical.classList.add("botonV1BlancoIzquierda")
            botonVertical.textContent = "Visión vertical"
            botonVertical.addEventListener("click", async () => {
                casaVitini.view.__sharedMethods__.configuracion.actualizarConfiguracion({
                    configuracionIDV: "calendario.tipoVision",
                    valor: "vertical"
                })
                await this.cambiarVision({
                    visionSel: "vertical"
                })
            })

            contenedor.appendChild(botonVertical)




            const botonSelPorDias = document.createElement("div")
            botonSelPorDias.classList.add("botonV1BlancoIzquierda")
            botonSelPorDias.textContent = "Visión horizontal"
            botonSelPorDias.addEventListener("click", async () => {
                await this.cambiarVision({
                    visionSel: "horizontal"
                })
            })

            contenedor.appendChild(botonHorizontal)

            const botonCancelar = document.createElement("div")
            botonCancelar.classList.add("botonV1")
            botonCancelar.setAttribute("boton", "cancelar")
            botonCancelar.textContent = "Cerrar y volver al calendario"
            botonCancelar.addEventListener("click", () => {
                return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
            })
            contenedor.appendChild(botonCancelar)

        },
        cambiarVision: async function (data) {
            const visionSel = data.visionSel
            const traductorURL = casaVitini.view.traductorURL()

            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
            const vision = document.querySelector("[vision]").getAttribute("vision")

            if (vision === visionSel) { return }
            const selectorCalendario = document.querySelector("[componente=calendarioGlobal]")
            selectorCalendario?.remove()
            const main = document.querySelector("main")
            main.removeAttribute("style")
            if (visionSel === "vertical") {
                await this.visionVertical()
            } else if (visionSel === "horizontal") {
                await this.visionHorizontal()
            }
        },
        visionVertical: async function () {
            const sectionRenderizada = document.querySelector("main")
            const traductorURL = casaVitini.view.traductorURL()
            const configuracionCalendario = {}

            if (traductorURL.fecha === null) {
                configuracionCalendario.tipo = "actual"
                // traductorURL.capas = ["global"]
            } else {
                const fecha = traductorURL.fecha.split("-")
                const mes = Number(fecha[0])
                const ano = Number(fecha[1])
                configuracionCalendario.tipo = "personalizado"

                configuracionCalendario.ano = ano
                configuracionCalendario.mes = mes
            }

            const calendarioResuelto = await casaVitini.ui.componentes.calendario.resolverCalendarioNuevo(configuracionCalendario)
            await casaVitini.view.calendarioVertical.arranque({
                ano: calendarioResuelto.ano,
                mes: calendarioResuelto.mes,

            })
            traductorURL.fecha = `${calendarioResuelto.mes}-${calendarioResuelto.ano}`

            casaVitini.view.controladorRegistros({
                tipoRegistro: "actualizar",
                traductorURL: traductorURL,
            });
        },
        visionHorizontal: async function (data) {

            const sectionRenderizada = document.querySelector("main")
            const instanciaUID_main = sectionRenderizada.getAttribute("instanciaUID")

            const configuracionCalendario = {}
            const traductorURL = casaVitini.view.traductorURL()

            //traductorURL.vision = "horizontal"
            if (traductorURL.fecha === null) {

                configuracionCalendario.tipoResolucion = "actual"
                //traductorURL.capas = ["global"]
            } else {
                const fecha = traductorURL.fecha.split("-")
                const mes = Number(fecha[0])
                const ano = Number(fecha[1])
                configuracionCalendario.tipoResolucion = "personalizado"

                configuracionCalendario.ano = ano
                configuracionCalendario.mes = mes
            }

            casaVitini.view.constructorCalendarioNuevo({
                almacenamientoCalendarioID: "calendarioGlobal",
                instanciaUID_main: instanciaUID_main
            })


            const mesRenderizado = await casaVitini.view.irAFecha({
                ...configuracionCalendario,
                instanciaUID_main: instanciaUID_main,
                traductorURL: traductorURL,

            })

            casaVitini.view.controladorRegistros({
                tipoRegistro: "actualizar",
                traductorURL: traductorURL,

            })
        }
    }
}