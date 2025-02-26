
export const sharedMethodsTemporalLocks = {
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
                casaVitini.view.transactor()
            })
            contenedorBotones.appendChild(botonCrear)
        }
        if (configuracion === "modificar") {
            contenedorBotones.style.gridTemplateColumns = "1fr"
            const botonModificiar = document.createElement("div")
            botonModificiar.classList.add("botonV2_negrita")
            botonModificiar.textContent = "Modificiar bloqueo"
            botonModificiar.addEventListener("click", () => {
                this.controladorBotonesGlobales.guardarEliminar()
            })
            contenedorBotones.appendChild(botonModificiar)
        }
        if (configuracion === "guardarEliminar") {
            const botonGuardarCambios = document.createElement("div")
            botonGuardarCambios.classList.add("botonV2_negrita")
            botonGuardarCambios.textContent = "Guardar cambios"
            botonGuardarCambios.addEventListener("click", () => {
                casaVitini.view.detallesDelBloqueo.guardarCambios()
            })
            contenedorBotones.appendChild(botonGuardarCambios)

            const botonCancelarCambios = document.createElement("div")
            botonCancelarCambios.classList.add("botonV2_negrita")
            botonCancelarCambios.textContent = "Cancelar cambios"
            botonCancelarCambios.addEventListener("click", () => {
                this.controladorBotonesGlobales.modificar()
                casaVitini.view.detallesDelBloqueo.cancelarCambios()
            })
            contenedorBotones.appendChild(botonCancelarCambios)

            const botonEliminarBloqueo = document.createElement("div")
            botonEliminarBloqueo.classList.add("botonV2_negrita")
            botonEliminarBloqueo.textContent = "Eliminar bloqueo"
            botonEliminarBloqueo.addEventListener("click", () => {
                casaVitini.view.detallesDelBloqueo.eliminarBloqueo.UI()
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
        } else
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
            const botonesGlobalesUI = casaVitini.view.__sharedMethods__.botonesDetallesBloqueoUI("modificar")
            selectorContendorGlobal.append(botonesGlobalesUI)
            const selectorContendorBloqueo = document.querySelector("[componente=contenedorDelBloqueo]")
            selectorContendorBloqueo.style.pointerEvents = "none"
        },
        guardarEliminar: function () {
            const selectorContendorGlobal = document.querySelector("[componente=contenedorGlobal]")
            const botonesGlobalesUI = casaVitini.view.__sharedMethods__.botonesDetallesBloqueoUI("guardarEliminar")
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
        } else if (modo === "estadoInicial") {
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
    bloqueoUI: async function (data) {

        const modoUI = data.modoUI

        const selectorEspacioBloqueos = document.querySelector("[componente=bloqueosTemporales]")

        const contenedorGlobal = document.createElement("div")
        contenedorGlobal.setAttribute("componente", "contenedorGlobal")
        contenedorGlobal.classList.add("detallesBloqueos_contenedorGlobal")
        selectorEspacioBloqueos.appendChild(contenedorGlobal)

        const bloqueBloqueoUI = document.createElement("div")
        bloqueBloqueoUI.classList.add("detallesBloqueos_bloqueBloqueoUI")
        bloqueBloqueoUI.setAttribute("componente", "contenedorDelBloqueo")

        contenedorGlobal.appendChild(bloqueBloqueoUI)

        const contenedorTipoBloqueo = document.createElement("div")
        contenedorTipoBloqueo.classList.add("detallesloqueos_contenedorBloquesGlobales")
        contenedorTipoBloqueo.setAttribute("componente", "globalData")
        bloqueBloqueoUI.appendChild(contenedorTipoBloqueo)

        const contenedorApartamentosV2 = document.createElement("div")
        contenedorApartamentosV2.classList.add("detallesBloqueo_contenedorTipoBloqueoV2")
        contenedorTipoBloqueo.appendChild(contenedorApartamentosV2)

        const tipoApartamentoTituloUI = document.createElement("div")
        tipoApartamentoTituloUI.classList.add("listaBloqueos_titulo")
        tipoApartamentoTituloUI.classList.add("negrita")
        tipoApartamentoTituloUI.textContent = "Apartamento: "
        contenedorApartamentosV2.appendChild(tipoApartamentoTituloUI)

        const contenedorTipoBloqueoV2 = document.createElement("div")
        contenedorTipoBloqueoV2.classList.add("detallesBloqueo_contenedorTipoBloqueoV2")
        contenedorTipoBloqueo.appendChild(contenedorTipoBloqueoV2)

        const tipoBloqueoTituloUI = document.createElement("div")
        tipoBloqueoTituloUI.classList.add("listaBloqueos_titulo")
        tipoBloqueoTituloUI.classList.add("negrita")
        tipoBloqueoTituloUI.textContent = "Tipo bloqueo"
        contenedorTipoBloqueoV2.appendChild(tipoBloqueoTituloUI)

        const tipoBloqueoUI = document.createElement("select")
        tipoBloqueoUI.classList.add("botonV1BlancoIzquierda_campo")
        tipoBloqueoUI.setAttribute("datoBloqueo", "tipoBloqueoIDV")
        tipoBloqueoUI.addEventListener("change", (e) => { casaVitini.view.__sharedMethods__.controladorSelectorRangoTemporalUI(e) })
        contenedorTipoBloqueoV2.appendChild(tipoBloqueoUI)

        const opcion_permamente = document.createElement("option");
        opcion_permamente.value = "permanente";
        opcion_permamente.text = "Permanente";
        tipoBloqueoUI.add(opcion_permamente);

        const opcion_rangoTemporal = document.createElement("option");
        opcion_rangoTemporal.value = "rangoTemporal";
        opcion_rangoTemporal.text = "Rango temporal";
        tipoBloqueoUI.add(opcion_rangoTemporal);


        const contenedorZonaUI = document.createElement("div")
        contenedorZonaUI.classList.add("detallesBloqueo_contenedorZonaUI")
        const tituloZonaUI = document.createElement("div")
        tituloZonaUI.classList.add("listaBloqueos_titulo")
        tituloZonaUI.classList.add("negrita")
        tituloZonaUI.textContent = "Contexto de aplicación"
        contenedorZonaUI.appendChild(tituloZonaUI)

        const zonaUI = document.createElement("select")
        zonaUI.classList.add("botonV1BlancoIzquierda_campo")
        zonaUI.setAttribute("datoBloqueo", "zonaIDV")
        const opcion_publico = document.createElement("option");

        opcion_publico.value = "publica";
        opcion_publico.text = "Público - Zona pública";
        zonaUI.add(opcion_publico);
        const opcion_privado = document.createElement("option");

        opcion_privado.value = "privada";
        opcion_privado.text = "Privado - Zona administrativa";
        zonaUI.add(opcion_privado);
        const opcion_global = document.createElement("option");

        opcion_global.value = "global";
        opcion_global.text = "Global - Zona pública y administrativa";
        zonaUI.add(opcion_global);
        contenedorZonaUI.appendChild(zonaUI)
        contenedorTipoBloqueo.appendChild(contenedorZonaUI)

        const motivoUI = document.createElement("textarea")
        motivoUI.classList.add("botonV1BlancoIzquierda_campo")
        motivoUI.setAttribute("componente", "contenedorMotivo")
        motivoUI.setAttribute("datoBloqueo", "motivoUI")
        motivoUI.rows = 10

        bloqueBloqueoUI.appendChild(motivoUI)

        if (modoUI === "editar") {
            const bloqueoData = data.bloqueoData
            const apartamentoIDV = bloqueoData?.apartamentoIDV
            const apartamentoUI = bloqueoData?.apartamentoUI
            const detallesDelBloqueo = bloqueoData?.ok

            const tipoBloqueoIDV = detallesDelBloqueo.tipoBloqueoIDV
            const fechaInicio = detallesDelBloqueo.fechaInicio
            const fechaFin = detallesDelBloqueo.fechaFin
            const motivo = detallesDelBloqueo.motivo
            const zonaIDV = detallesDelBloqueo.zonaIDV
            const bloqueoUID = detallesDelBloqueo.bloqueoUID

            bloqueBloqueoUI.setAttribute("bloqueoUID", bloqueoUID)
            bloqueBloqueoUI.setAttribute("apartamentoIDV", apartamentoIDV)
            bloqueBloqueoUI.style.pointerEvents = "none"
            contenedorTipoBloqueo.style.gridTemplateColumns = "1fr 1fr"

            tipoBloqueoUI.setAttribute("datoInicial", tipoBloqueoIDV)
            zonaUI.setAttribute("datoInicial", zonaIDV)

            contenedorApartamentosV2.style.display = "none"

            let selectorData
            if (tipoBloqueoIDV === "rangoTemporal") {
                opcion_rangoTemporal.selected = true;
                selectorData = {
                    modo: "estadoConDatos",
                    fechaInicio: fechaInicio,
                    fechaFin: fechaFin
                }

            } else if (tipoBloqueoIDV === "permanente") {
                opcion_permamente.selected = true;
                selectorData = {
                    modo: "estadoInicial",
                }
            }

            const selectorRangoUI = casaVitini.view.__sharedMethods__.selectorRangoTemporalUI(selectorData)
            contenedorTipoBloqueo.insertAdjacentElement('afterend', selectorRangoUI);

            let zonaDefinicionUI
            if (zonaIDV === "privada") {
                zonaDefinicionUI = "Privado - Solo se aplica a la zona de administración"
                opcion_privado.selected = true;

            } else if (zonaIDV === "publica") {
                zonaDefinicionUI = "Público - Solo se aplica a la zona publica"
                opcion_publico.selected = true;

            } else if (zonaIDV === "global") {
                zonaDefinicionUI = "Global - Se aplica a toda la zona, tando pública como administrativa"
                opcion_global.selected = true;
            }

            if (motivo === null) {
                motivoUI.setAttribute("datoInicial", "")
            } else {
                motivoUI.setAttribute("datoInicial", motivo)
            }
            if (motivo === null) {
                motivoUI.placeholder = "Este bloqueo no tiene ningún motivo definido, sería recomendable definir un motivo para poder identificar rápidamente porque existe este bloqueo"
            }
            motivoUI.textContent = motivo
            casaVitini.view.__sharedMethods__.controladorBotonesGlobales.modificar()

        } else if (modoUI === "crear") {

            contenedorTipoBloqueo.style.gridTemplateColumns = "1fr 1fr 1fr"

            const tipoApartamentoUI = document.createElement("select")
            tipoApartamentoUI.classList.add("botonV1BlancoIzquierda_campo")
            tipoApartamentoUI.setAttribute("datoBloqueo", "apartamento")
            tipoApartamentoUI.addEventListener("change", (e) => { casaVitini.view.__sharedMethods__.controladorSelectorRangoTemporalUI(e) })
            contenedorApartamentosV2.appendChild(tipoApartamentoUI)

            const tipoApartamentoInicio = document.createElement("option");
            tipoApartamentoInicio.value = "";
            tipoApartamentoInicio.selected = true;
            tipoApartamentoInicio.disabled = true;
            tipoApartamentoInicio.text = "Seleccionar el apartamento";
            tipoApartamentoUI.add(tipoApartamentoInicio);


            const selectorRangoUI = casaVitini.view.__sharedMethods__.selectorRangoTemporalUI({
                modo: "estadoInicial"
            })
            contenedorTipoBloqueo.insertAdjacentElement('afterend', selectorRangoUI);

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/componentes/apartamentosDisponiblesConfigurados"
            })

            if (respuestaServidor?.error) {
                const info = document.createElement("div")
                info.classList.add("textoCentrado", "negrita")
                info.textContent = respuestaServidor?.error
                contenedorGlobal.appendChild(info)
                return
            } else if (respuestaServidor?.ok) {
                const apartamentos = respuestaServidor.ok
                if (apartamentos?.length === 0) {
                    const opcion = document.createElement("option");
                    opcion.value = "";
                    opcion.disabled = true;
                    opcion.text = "No hay ningun apartamento disponible";
                    tipoApartamentoUI.add(opcion);
                } else if (apartamentos?.length > 0) {
                    apartamentos.forEach((detallesApartamento) => {
                        const apartamentoIDV = detallesApartamento.apartamentoIDV
                        const aparatmentoUI = detallesApartamento.apartamentoUI
                        const opcion = document.createElement("option");
                        opcion.value = apartamentoIDV;
                        opcion.text = aparatmentoUI;
                        tipoApartamentoUI.add(opcion);
                    })
                }
            }
            casaVitini.view.__sharedMethods__.controladorBotonesGlobales.crear()
        }
    }
}