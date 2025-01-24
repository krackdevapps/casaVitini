
export const sharedMethods = {
    contructorObjeto: () => {
        const apartamentoIDV = document.querySelector("[datoBloqueo=apartamento]")?.value
        const selectorTipoBloqueo = document.querySelector("[datoBloqueo=tipoBloqueoIDV]")
        const tipoBloqueoIDV = selectorTipoBloqueo.value
        const selectorZona = document.querySelector("[datoBloqueo=zonaIDV]")
        const zonaIDV = selectorZona.value
        const fechaInicio = document.querySelector("[calendario=entrada").getAttribute("memoriaVolatil")
        const fechaFin = document.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")
        const selectorMotivo = document.querySelector("[datoBloqueo=motivoUI]")
        const motivo = selectorMotivo.value
        const transaccion = {
            apartamentoIDV,
            tipoBloqueoIDV,
            zonaIDV,
            motivo
        }
        if (tipoBloqueoIDV === "rangoTemporal") {
            transaccion.fechaInicio = fechaInicio
            transaccion.fechaFin = fechaFin
        }
        return transaccion
    },
    componentes: {
        seleccionarDia_antiguo: (dia) => {
            let diaSeleccionadoComoElemento = dia.target;
            let calendario = document.querySelector("[componente=bloqueCalendario] [componente=marcoCalendario]")
            let calendarioIO = calendario.getAttribute("calendarioIO")
            let diaSeleccionado = dia.target.getAttribute("dia")
            const diaSeleccionadoTexto = diaSeleccionado.padStart(2, "0")
            const diaSeleccionadoNumero = Number(diaSeleccionado)
            let mesSeleccionado = document.querySelector("[componente=mesReferencia]").getAttribute("mes")
            const mesSeleccionadoTexto = mesSeleccionado.padStart(2, "0")
            const mesmesSeleccionadoNumero = Number(mesSeleccionado)
            const anoSeleccionado = Number(document.querySelector("[componente=mesReferencia]").getAttribute("ano"))
            let fechaSeleccionadaUI = `${diaSeleccionado}/${mesSeleccionado}/${anoSeleccionado}`
            const fechaSeleccionadaTexto = `${diaSeleccionadoTexto}/${mesSeleccionadoTexto}/${anoSeleccionado}`
            let selectorDias = document.querySelectorAll("[calendarioIO] [dia]")
            const memoriaVolatilInicialEntrada = document.querySelector("[calendario=entrada]").getAttribute("memoriaVolatilInicial")
            let diaInicialEntrada
            let mesInicialEntrada
            let anoInicialEntrada
            if (memoriaVolatilInicialEntrada) {
                const memoriaVolatilInicialEntradaFormateada = memoriaVolatilInicialEntrada.split("/")
                diaInicialEntrada = memoriaVolatilInicialEntradaFormateada[0]
                mesInicialEntrada = memoriaVolatilInicialEntradaFormateada[1]
                anoInicialEntrada = memoriaVolatilInicialEntradaFormateada[2]
            }
            const memoriaVolatilInicialSalida = document.querySelector("[calendario=salida]").getAttribute("memoriaVolatilInicial")
            let diaSalidaEntrada
            let mesSalidaEntrada
            let anoSalidaEntrada
            if (memoriaVolatilInicialSalida) {
                const memoriaVolatilInicialSalidaFormateada = memoriaVolatilInicialSalida.split("/")
                diaSalidaEntrada = memoriaVolatilInicialSalidaFormateada[0]
                mesSalidaEntrada = memoriaVolatilInicialSalidaFormateada[1]
                anoSalidaEntrada = memoriaVolatilInicialSalidaFormateada[2]
            }
            const fechaEntradaVolatil_Humana = document.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
            let diaSeleccionadoEntrada
            let mesSeleccionadoEntrada
            let anoSeleccionadoEntrada
            if (fechaEntradaVolatil_Humana) {
                const fechaEntradaAarray = fechaEntradaVolatil_Humana.split("/")
                diaSeleccionadoEntrada = Number(fechaEntradaAarray[0])
                mesSeleccionadoEntrada = Number(fechaEntradaAarray[1])
                anoSeleccionadoEntrada = Number(fechaEntradaAarray[2])
                datosFechaEntradaSeleccionada = "existen"
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
                datosFechaSalidaSeleccionada = "existen"
            }
            selectorDias.forEach((dia) => {

                dia.classList.remove("calendarioDiaReserva")
                dia.classList.remove("calendarioDiaSeleccionado")
            })
            if (diaSeleccionadoComoElemento.getAttribute("estadoDia") === "seleccionado") {
                diaSeleccionadoComoElemento.classList.remove("calendarioDiaSeleccionado")
                if (calendarioIO === "entrada") {
                    document.querySelector("[calendario=entrada][componente=fechaEntrada] [componente=bloqueNuevaPropuesta]")?.remove()
                    if (!memoriaVolatilInicialEntrada) {
                        document.querySelector("[calendario=entrada]").removeAttribute("memoriaVolatil")
                    }
                    if (memoriaVolatilInicialEntrada) {
                        document.querySelector("[calendario=entrada]").setAttribute("memoriaVolatil", memoriaVolatilInicialEntrada)
                        if (mesInicialEntrada === mesSeleccionado && anoSeleccionado === anoInicialEntrada) {
                            selectorDias.forEach((dia) => {
                                if (Number(dia.getAttribute("dia")) === Number(diaInicialEntrada)) {
                                    dia.classList.add("calendarioDiaSeleccionado")
                                }
                                if (Number(dia.getAttribute("dia")) > Number(diaInicialEntrada) && Number(dia.getAttribute("dia")) < diaSalidaEntrada) {
                                    dia.classList.add("calendarioDiaReserva")
                                }
                            })
                        }
                    }
                }
                if (calendarioIO === "salida") {
                    document.querySelector("[calendario=salida][componente=fechaSalida] [componente=bloqueNuevaPropuesta]")?.remove()
                    if (!memoriaVolatilInicialSalida) {
                        document.querySelector("[calendario=salida]").removeAttribute("memoriaVolatil")
                    }
                    if (memoriaVolatilInicialSalida) {
                        document.querySelector("[calendario=salida]").setAttribute("memoriaVolatil", memoriaVolatilInicialSalida)
                        if (mesSalidaEntrada === mesSeleccionado && anoSeleccionado === anoSalidaEntrada) {
                            selectorDias.forEach((dia) => {
                                if (Number(dia.getAttribute("dia")) === Number(diaSalidaEntrada)) {
                                    dia.classList.add("calendarioDiaSeleccionado")
                                }
                                if (Number(dia.getAttribute("dia")) < Number(diaSalidaEntrada) && Number(dia.getAttribute("dia")) > diaInicialEntrada) {
                                    dia.classList.add("calendarioDiaReserva")
                                }
                            })
                        }
                    }
                }
                diaSeleccionadoComoElemento.classList.remove("calendarioDiaSeleccionado")
                diaSeleccionadoComoElemento.removeAttribute("estadoDia")

            }
            let diasDisponibles = document.querySelectorAll("[estado=disponible]")
            diasDisponibles.forEach(diaDisponible => {
                diaDisponible.removeAttribute("estadoDia")
                diaDisponible.style.background = ""
                diaDisponible.style.color = ""
            })
            diaSeleccionadoComoElemento.setAttribute("estadoDia", "seleccionado")
            diaSeleccionadoComoElemento.classList.add("calendarioDiaSeleccionado")
            if (calendarioIO === "entrada") {
                document.querySelector("[calendario=entrada]").setAttribute("memoriaVolatil", fechaSeleccionadaTexto)
                if (fechaSalidaVolatil_Humana) {
                    if (mesSeleccionadoSalida === mesSeleccionado && anoSeleccionado === anoSeleccionadoSalida) {
                        selectorDias.forEach((dia) => {
                            if (Number(dia.getAttribute("dia")) > diaSeleccionado && Number(dia.getAttribute("dia")) < diaSeleccionadoSalida) {
                                dia.classList.remove("calendarioDiaDisponible")
                                dia.classList.add("calendarioDiaReserva")
                            }
                        })
                    } else {
                        selectorDias.forEach((dia) => {
                            if (Number(dia.getAttribute("dia")) > diaSeleccionado) {
                                dia.classList.remove("calendarioDiaDisponible")
                                dia.classList.add("calendarioDiaReserva")
                            }
                        })
                    }
                }
                const selectorBloqueFechaEntrada = document.querySelector("[calendario=entrada][componente=fechaEntrada]")
                document.querySelector("[calendario=entrada][componente=fechaEntrada] [componente=bloqueNuevaPropuesta]")?.remove()
                const bloqueNuevaPropuesta = document.createElement("div")
                bloqueNuevaPropuesta.classList.add("adminsitracion_bloqueos_detallesBloquoes_contenedorNuevaPropuesta")
                bloqueNuevaPropuesta.setAttribute("componente", "bloqueNuevaPropuesta")
                bloqueNuevaPropuesta.setAttribute("datoBloqueo", "fechaInicio")
                bloqueNuevaPropuesta.setAttribute("fechaInicioPropuesta", fechaSeleccionadaTexto)
                bloqueNuevaPropuesta.textContent = `Nueva fecha de inicio de bloqueo propuesta: ${fechaSeleccionadaUI}. Para guardar la propueda, guarde los cambios. Para cancelar pulse ne cancelar cambios.`
                selectorBloqueFechaEntrada.appendChild(bloqueNuevaPropuesta)
            }
            if (calendarioIO === "salida") {
                document.querySelector("[calendario=salida]").setAttribute("memoriaVolatil", fechaSeleccionadaTexto)

                if (fechaEntradaVolatil_Humana) {
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
                const selectorBloqueFechaSalida = document.querySelector("[calendario=salida][componente=fechaSalida]")
                document.querySelector("[calendario=salida][componente=fechaSalida] [componente=bloqueNuevaPropuesta]")?.remove()
                const bloqueNuevaPropuesta = document.createElement("div")
                bloqueNuevaPropuesta.classList.add("adminsitracion_bloqueos_detallesBloquoes_contenedorNuevaPropuesta")
                bloqueNuevaPropuesta.setAttribute("componente", "bloqueNuevaPropuesta")
                bloqueNuevaPropuesta.setAttribute("datoBloqueo", "fechaFin")
                bloqueNuevaPropuesta.setAttribute("fechaFinPropuesta", fechaSeleccionadaTexto)
                bloqueNuevaPropuesta.textContent = `Nueva fecha de fin de bloqueo propuesta: ${fechaSeleccionadaUI}. Para guardar la propuesta, guarde los cambios. Para cancelar, pulse en cancelar cambios.`
                selectorBloqueFechaSalida.appendChild(bloqueNuevaPropuesta)
            }
        },
        seleccionarDia: (dia) => {
            let diaSeleccionadoComoElemento = dia.target;
            let calendario = document.querySelector("[componente=bloqueCalendario] [componente=marcoCalendario]")
            let calendarioIO = calendario.getAttribute("calendarioIO")
            const diaSeleccionado = dia.target.getAttribute("dia").padStart(2, "0")
            const anoSeleccionado = document.querySelector("[componente=mesReferencia]").getAttribute("ano").padStart(4, "0")
            const mesSeleccionado = document.querySelector("[componente=mesReferencia]").getAttribute("mes").padStart(2, "0")
            let fechaSeleccionada = {
                dia: diaSeleccionado,
                mes: mesSeleccionado,
                ano: anoSeleccionado
            }
            const fechaSeleccionadaUI = `${diaSeleccionado}/${mesSeleccionado}/${anoSeleccionado}`
            const fechaSeleccionadaTexto = `${diaSeleccionado}/${mesSeleccionado}/${anoSeleccionado}`
            let selectorDias = document.querySelectorAll("[calendarioIO] [dia]")
            selectorDias.forEach((dia) => {

                dia.classList.remove("calendarioDiaReserva")
                dia.classList.remove("calendarioDiaSeleccionado")
            })
            if (diaSeleccionadoComoElemento.getAttribute("estadoDia") === "seleccionado") {
                diaSeleccionadoComoElemento.classList.remove("calendarioDiaSeleccionado")
                if (calendarioIO === "entrada") {
                    document.querySelector("[calendario=entrada]").removeAttribute("memoriaVolatil")

                }
                if (calendarioIO === "salida") {
                    document.querySelector("[calendario=salida]").removeAttribute("memoriaVolatil")

                }
                diaSeleccionadoComoElemento.classList.remove("calendarioDiaSeleccionado")
                diaSeleccionadoComoElemento.removeAttribute("estadoDia")

            }
            let diasDisponibles = document.querySelectorAll("[estado=disponible]")
            diasDisponibles.forEach(diaDisponible => {
                diaDisponible.removeAttribute("estadoDia")
                diaDisponible.style.background = ""
                diaDisponible.style.color = ""
            })
            diaSeleccionadoComoElemento.setAttribute("estadoDia", "seleccionado")
            diaSeleccionadoComoElemento.classList.add("calendarioDiaSeleccionado")
            let fechaEntradaSelecionda = document.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
            let diaSeleccionadoEntrada
            let mesSeleccionadoEntrada
            let anoSeleccionadoEntrada
            let datosFechaEntradaSeleccionada
            if (fechaEntradaSelecionda) {
                const fechaEntradaSelecionda_array = fechaEntradaSelecionda.split("/")
                diaSeleccionadoEntrada = fechaEntradaSelecionda_array[0]
                diaSeleccionadoEntrada = Number(diaSeleccionadoEntrada)
                mesSeleccionadoEntrada = fechaEntradaSelecionda_array[1]
                mesSeleccionadoEntrada = Number(mesSeleccionadoEntrada)
                anoSeleccionadoEntrada = fechaEntradaSelecionda_array[2]
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
                document.querySelector("[calendario=entrada]").setAttribute("fechaInicioFinal", fechaSeleccionadaUI)

                if (fechaSalidaSelecionda) {
                    if (mesSeleccionadoSalida === mesSeleccionado && anoSeleccionado === anoSeleccionadoSalida) {
                        selectorDias.forEachEach((dia) => {
                            if (Number(dia.getAttribute("dia")) > diaSeleccionado && Number(dia.getAttribute("dia")) <= diaSeleccionadoSalida) {

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
                const selectorBloqueFechaEntrada = document.querySelector("[calendario=entrada][componente=fechaEntrada]")
                document.querySelector("[calendario=entrada][componente=fechaEntrada] [componente=bloqueNuevaPropuesta]")?.remove()
                const bloqueNuevaPropuesta = document.createElement("div")
                bloqueNuevaPropuesta.classList.add("adminsitracion_bloqueos_detallesBloquoes_contenedorNuevaPropuesta")
                bloqueNuevaPropuesta.setAttribute("componente", "bloqueNuevaPropuesta")
                bloqueNuevaPropuesta.setAttribute("datoBloqueo", "fechaInicio")
                bloqueNuevaPropuesta.setAttribute("fechaInicioPropuesta", fechaSeleccionadaTexto)
                bloqueNuevaPropuesta.textContent = `Nueva fecha de inicio de bloqueo propuesta: ${fechaSeleccionadaUI}. Para guardar la propuesta, guarde los cambios. Para cancelar, pulse en cancelar cambios.`
                selectorBloqueFechaEntrada.appendChild(bloqueNuevaPropuesta)
            }
            if (calendarioIO === "salida") {
                document.querySelector("[calendario=salida]").setAttribute("memoriaVolatil", fechaSeleccionadaUI)
                document.querySelector("[calendario=salida]").setAttribute("fechaFinFinal", fechaSeleccionadaUI)

                if (fechaEntradaSelecionda) {
                    if (mesSeleccionadoEntrada === mesSeleccionado && anoSeleccionado === anoSeleccionadoEntrada) {
                        selectorDias.forEach((dia) => {
                            if (Number(dia.getAttribute("dia")) < diaSeleccionado && Number(dia.getAttribute("dia")) >= diaSeleccionadoEntrada) {
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
                const selectorBloqueFechaSalida = document.querySelector("[calendario=salida][componente=fechaSalida]")
                document.querySelector("[calendario=salida][componente=fechaSalida] [componente=bloqueNuevaPropuesta]")?.remove()
                const bloqueNuevaPropuesta = document.createElement("div")
                bloqueNuevaPropuesta.classList.add("adminsitracion_bloqueos_detallesBloquoes_contenedorNuevaPropuesta")
                bloqueNuevaPropuesta.setAttribute("componente", "bloqueNuevaPropuesta")
                bloqueNuevaPropuesta.setAttribute("datoBloqueo", "fechaFin")
                bloqueNuevaPropuesta.setAttribute("fechaFinPropuesta", fechaSeleccionadaTexto)
                bloqueNuevaPropuesta.textContent = `Nueva fecha de fin de bloqueo propuesta: ${fechaSeleccionadaUI}. Para guardar la propuesta, guarde los cambios. Para cancelar pulse en cancelar cambios.`
                selectorBloqueFechaSalida.appendChild(bloqueNuevaPropuesta)
            }
        },
    },
    botonesDetallesBloqueoUI: function (configuracion) {
        if (configuracion !== "crear" && configuracion !== "modificar" && configuracion !== "guardarEliminar") {
            const error = "Este componente necesita un tipo de configuración, esta puede ser, crear, modificar o guardarEliminar"
            casaVitini.ui.componentes.advertenciaInmersiva(error)
        }
        const selectorContenedorBotonesRenderizado = document.querySelector("[componente=contenedorBotones]")
        selectorContenedorBotonesRenderizado?.remove()
        const contenedorBotones = document.createElement("div")
        contenedorBotones.classList.add("detallesBloqueo_contenedorBotones")
        contenedorBotones.setAttribute("componente", "contenedorBotones")
        contenedorBotones.removeAttribute("style")
        if (configuracion === "crear") {
            contenedorBotones.style.gridTemplateColumns = "1fr"
            const botonCrear = document.createElement("div")
            botonCrear.classList.add("botonV2_negrita")
            botonCrear.textContent = "Crear bloqueo"
            botonCrear.addEventListener("click", () => {
                casaVitini.view.crearBloqueo.transactor()
            })
            contenedorBotones.appendChild(botonCrear)
        }
        if (configuracion === "modificar") {
            contenedorBotones.style.gridTemplateColumns = "1fr"
            const botonModificiar = document.createElement("div")
            botonModificiar.classList.add("botonV2_negrita")
            botonModificiar.textContent = "Modificiar bloqueo"
            botonModificiar.addEventListener("click", () => {
                casaVitini.administracion.bloqueosTemporales.detallesDelBloqueo.controladorBotonesGlobales.guardarEliminar()
            })
            contenedorBotones.appendChild(botonModificiar)
        }
        if (configuracion === "guardarEliminar") {
            const botonGuardarCambios = document.createElement("div")
            botonGuardarCambios.classList.add("botonV2_negrita")
            botonGuardarCambios.textContent = "Guardar cambios"
            botonGuardarCambios.addEventListener("click", () => {
                casaVitini.administracion.bloqueosTemporales.detallesDelBloqueo.guardarCambios()
            })
            contenedorBotones.appendChild(botonGuardarCambios)

            const botonCancelarCambios = document.createElement("div")
            botonCancelarCambios.classList.add("botonV2_negrita")
            botonCancelarCambios.textContent = "Cancelar cambios"
            botonCancelarCambios.addEventListener("click", () => {
                casaVitini.administracion.bloqueosTemporales.detallesDelBloqueo.controladorBotonesGlobales.modificar()
                casaVitini.administracion.bloqueosTemporales.detallesDelBloqueo.cancelarCambios()
            })
            contenedorBotones.appendChild(botonCancelarCambios)

            const botonEliminarBloqueo = document.createElement("div")
            botonEliminarBloqueo.classList.add("botonV2_negrita")
            botonEliminarBloqueo.textContent = "Eliminar bloqueo"
            botonEliminarBloqueo.addEventListener("click", () => {
                casaVitini.administracion.bloqueosTemporales.detallesDelBloqueo.eliminarBloqueo.UI()
            })
            contenedorBotones.appendChild(botonEliminarBloqueo)

        }
        return contenedorBotones
    },
    controladorSelectorRangoTemporalUI: function (tipoBloqueoUI) {
        const tipoBloqueo = tipoBloqueoUI.target.value
        const selectorContenedorFechas = document.querySelector("[componente=contenedorFechas]")
        if (tipoBloqueo === "permanente") {
            if (selectorContenedorFechas) {
                selectorContenedorFechas.style.display = "none"
            }
        }
        if (tipoBloqueo === "rangoTemporal") {
            if (selectorContenedorFechas) {
                selectorContenedorFechas.style.display = "flex"
            }
        }
    },
    controladorBotonesGlobales: {
        crear: function () {
            const selectorContendorGlobal = document.querySelector("[componente=contenedorGlobal]")
            const botonesGlobalesUI = casaVitini.view.__sharedMethods__.botonesDetallesBloqueoUI("crear")
            selectorContendorGlobal.append(botonesGlobalesUI)
        },
        modificar: function () {
            const selectorContendorGlobal = document.querySelector("[componente=contenedorGlobal]")
            const botonesGlobalesUI = this.botonesDetallesBloqueoUI("modificar")
            selectorContendorGlobal.append(botonesGlobalesUI)
            const selectorContendorBloqueo = document.querySelector("[componente=contenedorDelBloqueo]")
            selectorContendorBloqueo.style.pointerEvents = "none"
        },
        guardarEliminar: function () {
            const selectorContendorGlobal = document.querySelector("[componente=contenedorGlobal]")
            const botonesGlobalesUI = this.botonesDetallesBloqueoUI("guardarEliminar")
            selectorContendorGlobal.append(botonesGlobalesUI)
            const selectorContendorBloqueo = document.querySelector("[componente=contenedorDelBloqueo]")
            selectorContendorBloqueo.style.pointerEvents = "all"
        }
    },
    selectorRangoTemporalUI: function (rango) {
        const fechaInicio = rango.fechaInicio
        const fechaFin = rango.fechaFin
        const modo = rango.modo
        const instanciaUID_contenedorFechas = casaVitini.utilidades.codigoFechaInstancia()

        if (modo !== "estadoInicial" && modo !== "estadoConDatos") {
            const error = "selectorRAngoTemporalUI necesita un modo, puede ser estadoInicial o estadoConDatos"
            casaVitini.ui.componentes.advertenciaInmersiva(error)
        }

        let memoriaVolatilEntrada;
        let memoriaVolatilSalida;
        let fechaInicioUI = ""
        let fechaFinUI = ""
        if (modo === "estadoConDatos") {
            fechaInicioUI = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaInicio)
            fechaFinUI = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaFin)
        }
        if (modo === "estadoInicial") {
            fechaInicioUI = "(Seleccionar fecha de inicio)"
            fechaFinUI = "(Seleccionar fecha de fin)"
        }
        const contenedorFecha = document.createElement("div")
        contenedorFecha.classList.add("detallesDelBloqueo_contenedorFecha")
        contenedorFecha.setAttribute("componente", "contenedorFechas")
        contenedorFecha.setAttribute("instanciaUID_contenedorFechas", instanciaUID_contenedorFechas)

        if (modo === "estadoInicial") {
            contenedorFecha.style.display = "none"
        }
        const contenedorFechaEntrada = document.createElement("div")
        contenedorFechaEntrada.classList.add("detallesBloqueo_contenedorFechaEntrada")
        contenedorFechaEntrada.setAttribute("calendario", "entrada")
        contenedorFechaEntrada.setAttribute("componente", "fechaEntrada")
        contenedorFechaEntrada.setAttribute("paralizadorEvento", "ocultadorCalendarios")
        if (modo === "estadoConDatos") {
            contenedorFechaEntrada.setAttribute("memoriaVolatil", fechaInicio)
            contenedorFechaEntrada.setAttribute("valorInicial", fechaInicio)
        }

        contenedorFechaEntrada.addEventListener("click", async () => {
            await casaVitini.ui.componentes.calendario.configurarCalendario({
                perfilMes: "calendario_entrada_perfilSimple",
                contenedorOrigenIDV: "[calendario=entrada]",
                instanciaUID_contenedorFechas,
                rangoIDV: "inicioRango",
                metodoSelectorDia: null,
                tituloCalendario: "Selecciona la fecha de inicio del rango de bloqueo",
                seleccionableDiaLimite: "si"

            })
        })

        const tipoEntradaUITituloUI = document.createElement("div")
        tipoEntradaUITituloUI.classList.add("listaBloqueos_titulo")
        tipoEntradaUITituloUI.classList.add("negrita")
        tipoEntradaUITituloUI.textContent = "Fecha de inicio del bloqueo 2"
        contenedorFechaEntrada.appendChild(tipoEntradaUITituloUI)
        const entradaUI = document.createElement("div")
        entradaUI.classList.add("listaBloqueos_fecha")
        entradaUI.setAttribute("fechaUI", "fechaInicio")
        entradaUI.textContent = fechaInicioUI
        contenedorFechaEntrada.appendChild(entradaUI)
        contenedorFecha.appendChild(contenedorFechaEntrada)
        const contenedorFechaSalida = document.createElement("div")
        contenedorFechaSalida.classList.add("detallesBloqueo_contenedorFechaSalida")
        contenedorFechaSalida.setAttribute("calendario", "salida")
        contenedorFechaSalida.setAttribute("componente", "fechaSalida")
        contenedorFechaSalida.setAttribute("paralizadorEvento", "ocultadorCalendarios")
        if (modo === "estadoConDatos") {
            contenedorFechaSalida.setAttribute("memoriaVolatil", fechaFin)
            contenedorFechaSalida.setAttribute("valorInicial", fechaFin)
        }

        contenedorFechaSalida.addEventListener("click", async () => {
            await casaVitini.ui.componentes.calendario.configurarCalendario({
                perfilMes: "calendario_salida_perfilSimple",
                contenedorOrigenIDV: "[calendario=salida]",
                instanciaUID_contenedorFechas,
                rangoIDV: "finalRango",
                metodoSelectorDia: null,
                tituloCalendario: "Selecciona la fecha del fin del rango de bloqueo",
                seleccionableDiaLimite: "si"
            })
        })
        const tipoSalidaUITituloUI = document.createElement("div")
        tipoSalidaUITituloUI.classList.add("listaBloqueos_titulo")
        tipoSalidaUITituloUI.classList.add("negrita")
        tipoSalidaUITituloUI.textContent = "Fecha de fin del bloqueo"
        contenedorFechaSalida.appendChild(tipoSalidaUITituloUI)
        const salidaUI = document.createElement("div")
        salidaUI.classList.add("listaBloqueos_fecha")
        salidaUI.setAttribute("fechaUI", "fechaFin")
        salidaUI.textContent = fechaFinUI
        contenedorFechaSalida.appendChild(salidaUI)
        contenedorFecha.appendChild(contenedorFechaSalida)
        return contenedorFecha
    },     


}