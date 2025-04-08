casaVitini.view = {
    start: function () {

        const main = document.querySelector("main")
        const uiSelector = document.createElement("div")
        uiSelector.classList.add("flexVertical", "padding10", "gap10", "width100")
        uiSelector.setAttribute("zona", "protocolo")
        main.appendChild(uiSelector)
        this.mostrarAlojamientos()

    },
    mostrarAlojamientos: async function () {


        const main = document.querySelector("main")
        main.classList.add("flextJustificacion_center")
        const instanciaUID = main.getAttribute("instanciaUID")

        const spinner = casaVitini.ui.componentes.spinnerSimple()
        main.appendChild(spinner)

        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "administracion/protocolos/alojamiento/estado_de_alojamiento/obtenerEstadosDeTodosLosAlojamiento"
        })
        spinner.remove()
        main.classList.remove("flextJustificacion_center")
        main.classList.add("flexInteriorExprandido")

        const mER = main.querySelector("[contenedor=marcoElasticoRelativo]")

        const instanciaRenderizada = main.getAttribute("instanciaUID")

        if (instanciaRenderizada !== instanciaUID) { return }
        if (respuestaServidor?.error) {
            const infoUI = document.createElement("div")
            infoUI.classList.add("padding16")
            infoUI.textContent = respuestaServidor.error
            mER.appendChild(infoUI)

        }
        if (respuestaServidor.ok) {
            const infoUI = document.createElement("div")
            infoUI.classList.add("padding16", "textoCentrado")
            infoUI.textContent = "Los estados de los alojamientos se basan en la última revisión disponible finalizada."
            mER.appendChild(infoUI)



            const configuracionGlobal = respuestaServidor.configuracionGlobal
            const alojamientos = respuestaServidor.estadosRevision
            const dataGlobal = respuestaServidor.dataGlobal
            const fechaActualUTC = dataGlobal.fechaActualUTC
            const fechaActualLocal = dataGlobal.fechaActualLocal

            const cPlegableConfiguracion = document.createElement("details")
            cPlegableConfiguracion.classList.add("flexVertical", "padding6", "borderRadius20")
            mER.appendChild(cPlegableConfiguracion)


            const cPlegableTitulo = document.createElement("summary")
            cPlegableTitulo.classList.add("padding10", "borderRadius14")
            cPlegableTitulo.textContent = "Detalles de la configuración global"
            cPlegableConfiguracion.appendChild(cPlegableTitulo)


            const cConfiguracionGlobal = document.createElement("div")
            cConfiguracionGlobal.classList.add("flexVertical", "gap10")
            cPlegableConfiguracion.appendChild(cConfiguracionGlobal)

            const cInfoGlobal = document.createElement("div")
            cInfoGlobal.classList.add("flexVertical", "paddingLateral24", "gap6")
            cConfiguracionGlobal.appendChild(cInfoGlobal)



            const infoDiasCaducidadRevision = document.createElement("p")
            infoDiasCaducidadRevision.classList.add("negrita")
            infoDiasCaducidadRevision.textContent = "Días de caducidad de las revisiones"
            cInfoGlobal.appendChild(infoDiasCaducidadRevision)

            const dataDiasCaducidadRevision = document.createElement("p")
            dataDiasCaducidadRevision.textContent = configuracionGlobal.diasCaducidadRevision
            cInfoGlobal.appendChild(dataDiasCaducidadRevision)

            const infoDiasAntelacionPorReserva = document.createElement("p")
            infoDiasAntelacionPorReserva.classList.add("negrita")
            infoDiasAntelacionPorReserva.textContent = "Días de antelación de aviso cuando hay reservas entrantes"
            cInfoGlobal.appendChild(infoDiasAntelacionPorReserva)

            const dataDiasAntelacionPorReserva = document.createElement("p")
            dataDiasAntelacionPorReserva.textContent = configuracionGlobal.diasAntelacionPorReserva
            cInfoGlobal.appendChild(dataDiasAntelacionPorReserva)

            const botonIrAConfiguracion = document.createElement("a")
            botonIrAConfiguracion.href = "/administracion/protocolos/gestion_de_protocolos/configuracion"
            botonIrAConfiguracion.classList.add("botonV1BlancoIzquierda")
            botonIrAConfiguracion.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            botonIrAConfiguracion.textContent = "Ir a la configuración global"
            cConfiguracionGlobal.appendChild(botonIrAConfiguracion)

            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add("contenedorBotones")
            mER.appendChild(contenedorBotones)

            for (const a of alojamientos) {

                const apartamentoIDV = a.apartamentoIDV
                const apartamentoUI = a.apartamentoUI
                const ultimaRevision = a?.ultimaRevision
                const fechaUltimaRevisionLocal = a?.fechaUltimaRevisionLocal
                const fechaDeCaducidadRevisionLocal = a?.fechaDeCaducidadRevisionLocal

                const fechaAntelacionLocal = a?.fechaAntelacionLocal
                const reservasEntrantes = a?.reservasEntrantes || []
                const vigenciaUltimaRevision = a?.vigenciaUltimaRevision
                const fechaPostPuestaLocal = a?.fechaPostPuestaLocal || ""

                const ui = document.createElement("div")
                ui.classList.add("tituloContextoAdministracion", "gap10")
                ui.setAttribute("apartamentoIDV", apartamentoIDV)
                contenedorBotones.appendChild(ui)

                const aUI = document.createElement("p")
                aUI.classList.add("negrita", "paddingLateral16")
                aUI.textContent = apartamentoUI
                ui.appendChild(aUI)

                const contenedorData = document.createElement("div")
                contenedorData.classList.add("flexVertical", "paddingLateral16", "gap6")
                ui.appendChild(contenedorData)

                if (!ultimaRevision) {
                    const m = document.createElement("p")
                    m.textContent = "Ninguna revisión finalizada en este alojamiento"
                    contenedorData.appendChild(m)

                    const botonIniciarRevision = document.createElement("a")
                    botonIniciarRevision.classList.add("botonV1BlancoIzquierda")
                    botonIniciarRevision.href = `/administracion/protocolos/revisar_alojamiento/alojamiento:${apartamentoIDV}`
                    botonIniciarRevision.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                    botonIniciarRevision.textContent = "Iniciar revisión"
                    ui.appendChild(botonIniciarRevision)

                } else {
                    const reivsionUID = ultimaRevision.uid
                    const reposicionInventario = ultimaRevision.reposicionInventario
                    const tareas = ultimaRevision.tareas

                    const fechaUltimaRevisionLocal_UI = casaVitini.utilidades.conversor.fecha_ISOCompleta_limpieza(fechaUltimaRevisionLocal)
                    const fechaPostPuestaLocal_UI = casaVitini.utilidades.conversor.fecha_ISOCompleta_limpieza(fechaPostPuestaLocal)
                    const fechaDeCaducidadRevisionLocal_UI = casaVitini.utilidades.conversor.fecha_ISOCompleta_limpieza(fechaDeCaducidadRevisionLocal)


                    const botonRevision = document.createElement("a")
                    botonRevision.classList.add("botonV1BlancoIzquierda")
                    botonRevision.href = `/administracion/protocolos/registro_de_revisiones/revision:${reivsionUID}`
                    botonRevision.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                    botonRevision.textContent = "Ir a la ultima revisión"
                    ui.appendChild(botonRevision)

                    const botonPosponerRevision = document.createElement("div")
                    botonPosponerRevision.classList.add("botonV1BlancoIzquierda")
                    botonPosponerRevision.addEventListener("click", (e) => {
                        const fechaDeCaducidad_ISO = fechaDeCaducidadRevisionLocal_UI.split(" ")[0]
                        const mesCaducidad = fechaDeCaducidad_ISO.split("-")[1]
                        const anoCaducidad = fechaDeCaducidad_ISO.split("-")[0]

                        casaVitini.ui.componentes.nuevoMotorCalendaio.arranque({
                            destino: "main",
                            tipoFechaInicial: "personalizado",
                            mesInicial: parseInt(mesCaducidad, 10),
                            anoInicial: parseInt(anoCaducidad, 10),
                            objetoPipe: {
                                apartamentoIDV,
                                apartamentoUI
                            },
                            configuracionLimites: {
                                fechaLimitePasado: fechaDeCaducidad_ISO,
                                incluirMismoDiaEnElLimitePasado: "si"
                                // fechaLimiteFuturo: "2025-05-16",
                                //primeraFechaDisponible: "activado",
                                //limiteFuturo: "activado"
                            },
                            selecion: {
                                //diaSelecionado: "2025-04-15",
                                // inicioRango: "2025-03-15",
                                // finalRango: "2025-04-15",
                                metodoSelectorDia: "view.selectorDiaFechaPostPuesta"
                            }
                        })
                        //   document.addEventListener("click", casaVitini.shell.controladoresUI.ocultarCalendario())
                    })
                    botonPosponerRevision.textContent = "Posponer revision"
                    ui.appendChild(botonPosponerRevision)


                    const reposicionFinal = reposicionInventario.find(r => r.color === "rojo")
                    const tareasFinal = tareas.find(r => r.color === "rojo")

                    if (reservasEntrantes.length > 0) {
                        const m = document.createElement("p")
                        m.textContent = `En menos de ${configuracionGlobal.diasAntelacionPorReserva} días hay reservas entrantes`
                        contenedorData.appendChild(m)

                        this.constructorUI({
                            titulo: "Fecha caduciad de la última revisión",
                            valor: fechaDeCaducidadRevisionLocal
                        })
                    }

                    if (reposicionFinal) {
                        ui.classList.add("fondoRojo")
                        const m = document.createElement("p")
                        m.textContent = "Este alojamiento no tiene el inventario repuesto"
                        contenedorData.appendChild(m)
                    }
                    if (tareasFinal) {
                        ui.classList.add("fondoRojo")
                        const m = document.createElement("p")
                        m.textContent = "Este alojamiento no ha pasado las tareas de limpieza"
                        contenedorData.appendChild(m)
                    }

                    if (!tareasFinal && !reposicionFinal) {
                        if (vigenciaUltimaRevision === "vigente") {
                            ui.classList.add("fondoVerde")
                        } else if (vigenciaUltimaRevision === "caducada") {
                            ui.classList.add("fondoRojo")
                        }

                        const m = document.createElement("p")
                        m.textContent = "Este alojamiento ha pasado la revisión y está preparado."
                        contenedorData.appendChild(m)

                        contenedorData.appendChild(this.constructorUI({
                            titulo: "Fecha local de la última revisión",
                            valor: fechaUltimaRevisionLocal_UI
                        }))
                        const fechaCaducidad = this.constructorUI({
                            titulo: `Esta revision caducará`,
                            valor: fechaDeCaducidadRevisionLocal_UI
                        })
                        fechaCaducidad.setAttribute("contenedor", "fechaCaducidad")
                        fechaCaducidad.classList.add("ocultoInicial")
                        contenedorData.appendChild(fechaCaducidad)

                        if (fechaPostPuestaLocal) {

                            const fPP = this.contenedorFechaPorPuesta({
                                fechaPosPuestaLocal: fechaPostPuestaLocal_UI,
                                apartamentoIDV,
                                apartamentoUI
                            })
                            ui.appendChild(fPP)
                        } else {
                            fechaCaducidad.classList.remove("ocultoInicial")

                        }
                    }
                }
            };
        }
    },
    selectorDiaFechaPostPuesta: function (data) {
        const main = document.querySelector("main")
        const calendarioUI = data.target.closest("[componente=bloqueCalendario]")
        const dia = data.target.closest("[dia]").getAttribute("dia")
        const mes = calendarioUI.querySelector("[mes]").getAttribute("mes")
        const ano = calendarioUI.querySelector("[ano]").getAttribute("ano")

        const objetoPipe = JSON.parse(data.target.closest("[objetoPipe]")?.getAttribute("objetoPipe") || "{}")
        const apartamentoIDV = objetoPipe.apartamentoIDV
        const apartamentoUI = objetoPipe.apartamentoUI
        const fechaPosPuesta = `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`

        this.posPonerFecha({
            apartamentoIDV,
            fechaPosPuesta,
            apartamentoUI
        })

        calendarioUI?.remove()

    },
    posPonerFecha: async function (data) {
        const apartamentoIDV = data.apartamentoIDV
        const apartamentoUI = data.apartamentoUI
        const fechaPosPuesta = data.fechaPosPuesta
        const main = document.querySelector("main")

        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = `Actualizan la fecha pospuesta de ${apartamentoUI} (${apartamentoIDV}) para el ${fechaPosPuesta}...`
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "administracion/protocolos/alojamiento/estado_de_alojamiento/actualizarFechaPosPuesta",
            apartamentoIDV,
            fechaPosPuesta
        })
        const instanciaRenderizada = main.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!instanciaRenderizada) { return }
        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()

        if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const fechaPosPuestaLocal = respuestaServidor.fechaPosPuestaLocal
            const vigenciaUltimaRevision = respuestaServidor.vigenciaUltimaRevision
            const fechaPosPuestaLocal_UI = casaVitini.utilidades.conversor.fecha_ISOCompleta_limpieza(fechaPosPuestaLocal)

            const cApartamento = main.querySelector(`[apartamentoIDV="${apartamentoIDV}"]`)
            cApartamento.classList.remove("fondoVerde")
            cApartamento.classList.remove("fondoRojo")
            if (vigenciaUltimaRevision === "caducada") {
                cApartamento.classList.add("fondoRojo")
            } else if (vigenciaUltimaRevision === "vigente") {
                cApartamento.classList.add("fondoVerde")
            }

            cApartamento.querySelector("[contenedor=fechaPosPuesta]")?.remove()
            const ui = this.contenedorFechaPorPuesta({
                fechaPosPuestaLocal: fechaPosPuestaLocal_UI,
                apartamentoIDV,
                apartamentoUI
            })
            cApartamento.appendChild(ui)
            const fechaCaducidad = cApartamento.querySelector("[contenedor=fechaCaducidad]")
            fechaCaducidad.classList.add("ocultoInicial")
        }
    },
    constructorUI: function (data) {
        const titulo = data.titulo
        const valor = data.valor

        const ui = document.createElement("div")
        ui.classList.add("flexVertical")

        const tituloUI = document.createElement("p")
        tituloUI.textContent = titulo
        tituloUI.classList.add("negrita")
        ui.appendChild(tituloUI)

        const valorUI = document.createElement("p")
        valorUI.textContent = valor
        ui.appendChild(valorUI)
        return ui
    },
    contenedorFechaPorPuesta: function (data) {

        const fechaPosPuestaLocal = data.fechaPosPuestaLocal
        const apartamentoIDV = data.apartamentoIDV
        const apartamentoUI = data.apartamentoUI


        const ui = document.createElement("div")
        ui.classList.add("flexVertical", "gap6")
        ui.setAttribute("contenedor", "fechaPosPuesta")

        const cFechaPosPuesta = this.constructorUI({
            titulo: "Fecha Pospuesta para la revisión",
            valor: fechaPosPuestaLocal
        })
        cFechaPosPuesta.classList.add("paddingLateral16")
        ui.appendChild(cFechaPosPuesta)

        const botonCancelarPosPonerRevision = document.createElement("div")
        botonCancelarPosPonerRevision.classList.add("botonV1BlancoIzquierda")
        botonCancelarPosPonerRevision.setAttribute("boton", "cancelarFechaPostPuesta")
        botonCancelarPosPonerRevision.addEventListener("click", (e) => {
            this.eliminarPosPonerFecha({
                apartamentoIDV,
                apartamentoUI
            })
        })
        botonCancelarPosPonerRevision.textContent = "Cancelar fecha pospuesta"
        ui.appendChild(botonCancelarPosPonerRevision)

        return ui

    },
    eliminarPosPonerFecha: async function (data) {
        const apartamentoIDV = data.apartamentoIDV
        const apartamentoUI = data.apartamentoUI

        const main = document.querySelector("main")

        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = `Eliminando la fecha pospuesta de ${apartamentoUI} (${apartamentoIDV})...`
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje
        }

        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "administracion/protocolos/alojamiento/estado_de_alojamiento/eliminarFechaPosPuesta",
            apartamentoIDV
        })
        const instanciaRenderizada = main.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!instanciaRenderizada) { return }
        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()

        if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const cApartamento = main.querySelector(`[apartamentoIDV="${apartamentoIDV}"]`)
            const fechaCaducidad = cApartamento.querySelector("[contenedor=fechaCaducidad]")
            fechaCaducidad.classList.remove("ocultoInicial")

            const contenedorFechaPosPuesta = cApartamento.querySelector("[contenedor=fechaPosPuesta]")
            contenedorFechaPosPuesta?.remove()

            const vigenciaUltimaRevision = respuestaServidor.vigenciaUltimaRevision

            cApartamento.classList.remove("fondoVerde")
            cApartamento.classList.remove("fondoRojo")
            if (vigenciaUltimaRevision === "caducada") {
                cApartamento.classList.add("fondoRojo")
            } else if (vigenciaUltimaRevision === "vigente") {
                cApartamento.classList.add("fondoVerde")
            }

        }
    },

}