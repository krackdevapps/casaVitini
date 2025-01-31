casaVitini.view = {
    start: function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/reservas/nueva")
        const instanciaUID_contenedorFechas = casaVitini.utilidades.codigoFechaInstancia()
        this.controladorOfertasInicial()
        const selectorRangoUI = main.querySelector("[contenedor=selectorRango]")
        selectorRangoUI.setAttribute("instanciaUID_contenedorFechas", instanciaUID_contenedorFechas)
        const selectorBotonEntrada = document.querySelector("[calendario=entrada]")
        selectorBotonEntrada.addEventListener("click", async () => {
            await casaVitini.ui.componentes.calendario.configurarCalendario({
                perfilMes: "calendario_entrada_perfilSimple",
                contenedorOrigenIDV: "[calendario=entrada]",
                instanciaUID_contenedorFechas,
                rangoIDV: "inicioRango",
                metodoSelectorDia: null,
                seleccionableDiaLimite: "no"
            })
        })

        const selectorBotonSalida = document.querySelector("[calendario=salida]")
        selectorBotonSalida.addEventListener("click", async () => {
            await casaVitini.ui.componentes.calendario.configurarCalendario({
                perfilMes: "calendario_salida_perfilSimple",
                contenedorOrigenIDV: "[calendario=salida]",
                instanciaUID_contenedorFechas,
                rangoIDV: "finalRango",
                metodoSelectorDia: null,
                seleccionableDiaLimite: "no"
            })
        })

        document.querySelector("[componente=botonBuscarAlojamiento]").addEventListener("click", () => { this.buscarAlojamiento() })
        document.querySelector("[componente=botonConfirmarReserva]").addEventListener("click", () => { this.confirmarReservaNueva() })
    },
    buscarAlojamiento: async function () {
        try {
            const fechaEntrada = document.querySelector("[calendario=entrada]")?.getAttribute("memoriaVolatil")
            const fechaSalida = document.querySelector("[calendario=salida]")?.getAttribute("memoriaVolatil")

            document.querySelectorAll("[componente=advertenciaIntegrada]").forEach((advertenciaRenderizada) => {
                advertenciaRenderizada.remove()
            })

            const selectorContenedorBoton = document.querySelector("[componente=espacioBotonConfirmarReserva]")
            selectorContenedorBoton.classList.add("elementoOcultoInicialmente")
            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const selectorBloqueEspacioApartamentos = document.querySelector("[componente=espacioApartamento]")
            selectorBloqueEspacioApartamentos.classList.remove("elementoOcultoInicialmente")
            selectorBloqueEspacioApartamentos.setAttribute("instanciaUID", instanciaUID)
            selectorBloqueEspacioApartamentos.innerHTML = null
            const advertenciaInmersivaUI = document.createElement("div")
            advertenciaInmersivaUI.setAttribute("class", "advertenciaIntegrada")
            advertenciaInmersivaUI.setAttribute("componente", "advertenciaIntegrada")
            const marcoElastico = document.createElement("div")
            marcoElastico.classList.add("marcoElasticoError")
 
            const spinnerSimple = casaVitini.ui.componentes.spinnerSimple()

            marcoElastico.appendChild(spinnerSimple)
            const info = document.createElement("div")
            info.setAttribute("class", "advertenciaInfoFlujoPago")
            info.setAttribute("componente", "mensajeFlujoPasarela")
            info.textContent = "Buscando alojamiento..."
            marcoElastico.appendChild(info)
            const boton = document.createElement("div")
            boton.setAttribute("class", "botonV1Blanco")
            boton.textContent = "Cancelar"
            boton.addEventListener("click", (e) => {
                selectorBloqueEspacioApartamentos.classList.add("elementoOcultoInicialmente")
                selectorBloqueEspacioApartamentos.removeAttribute("instanciaUID")
                e.target.closest("[componente=advertenciaIntegrada]").remove()
            })
            marcoElastico.appendChild(boton)
            advertenciaInmersivaUI.appendChild(marcoElastico)
            selectorBloqueEspacioApartamentos.appendChild(advertenciaInmersivaUI)
            
            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/reservas/nuevaReserva/apartamentosDisponiblesAdministracion",
                fechaEntrada: fechaEntrada,
                fechaSalida: fechaSalida
            })
            const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
            if (!instanciaRenderizada) {
                return
            }
            if (respuestaServidor?.error) {
                instanciaRenderizada.querySelector("[componente=advertenciaIntegrada]").remove()
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                const apartamenosDisponiblesArray = respuestaServidor?.ok.apartamentosDisponibles
                const configuracionesAlojamiento = respuestaServidor.configuracionesAlojamiento

                if (apartamenosDisponiblesArray.length === 0) {
                    const infoNoDisponibilidad = document.createElement("div")
                    infoNoDisponibilidad.classList.add("administracion_reservas_crearReserva_infoSinAlojamiento")
                    infoNoDisponibilidad.textContent = "No hay ningún alojamiento disponible para las fechas seleccionadas.Eso es debido a reservas donde están estos apartamentos, bloqueos en estas fechas o configuraciones no disponibles.Para tener una visión sobre esta situación, puede ir al calendario, donde podrá ver lo que ocurre.Para ver todos los eventos, selecciona la capa Global del calendario.Inicialmente, el calendario tiene esta capa predeterminadamente seleccionada."
                    document.querySelector(`[instanciaUID="${instanciaUID}"]`).innerHTML = null
                    document.querySelector(`[instanciaUID="${instanciaUID}"]`).appendChild(infoNoDisponibilidad)
                    return
                }
                const apartamentosDisponiblesUI = document.createElement("apartamentosDisponibles")
                apartamentosDisponiblesUI.classList.add("espacioApartamentosDipsoniblesCrearReserva")
                apartamentosDisponiblesUI.setAttribute("componente", "apartamentosDisponibles")
                for (const [apartamentoIDV, configuracion] of Object.entries(configuracionesAlojamiento)) {

                    const apartamentoUI = configuracion.apartamentoUI
                    const habitaciones = configuracion.habitaciones
                    const apartamentoUIPublico = configuracion.apartamentoUIPublico
                    const caracteristicas = configuracion.caracteristicas
                    const definicionPublica = configuracion.definicionPublica

                    const bloqueApartamentoUI = document.createElement("div")
                    bloqueApartamentoUI.classList.add("bloqueApartamentoUI")
                    bloqueApartamentoUI.setAttribute("apartamentoIDV", apartamentoIDV)

                    const tituloApartamentoUI = document.createElement("p")
                    tituloApartamentoUI.classList.add("negrita", "padding10")
                    tituloApartamentoUI.textContent = apartamentoUI
                    bloqueApartamentoUI.appendChild(tituloApartamentoUI)




                    const bloqueHabiaciones = document.createElement("details")
                    bloqueHabiaciones.classList.add("flexVertical")
                    bloqueHabiaciones.style.background = "transparent"
                    bloqueApartamentoUI.appendChild(bloqueHabiaciones)

                    const tituloHabitaciones = document.createElement("summary")
                    tituloHabitaciones.classList.add("padding10", "margin0")
                    tituloHabitaciones.textContent = "Habitaciones"
                    bloqueHabiaciones.appendChild(tituloHabitaciones)

                    const contenedorHabitacionesExpandido = document.createElement("div")
                    contenedorHabitacionesExpandido.classList.add("flexVertical", "gap6", "paddingLateral24")
                    bloqueHabiaciones.appendChild(contenedorHabitacionesExpandido)


                    for (const [habitacionIDV, detallesHabitacion] of Object.entries(habitaciones)) {
                        const tituloHabitacion = document.createElement("div")
                        //tituloHabitacion.classList.add("tituloHabitacion")
                        tituloHabitacion.textContent = detallesHabitacion.habitacionUI
                        contenedorHabitacionesExpandido.appendChild(tituloHabitacion)
                    }


                    const contenedorDetalles = document.createElement("details")
                    contenedorDetalles.classList.add("flexVertical")
                    contenedorDetalles.style.background = "transparent"
                    bloqueApartamentoUI.appendChild(contenedorDetalles)

                    const tituloDetalles = document.createElement("summary")
                    tituloDetalles.classList.add("padding10", "margin0")
                    tituloDetalles.textContent = "Detalles del apartamento"
                    contenedorDetalles.appendChild(tituloDetalles)

                    const contenedorDetallesExpandido = document.createElement("div")
                    contenedorDetallesExpandido.classList.add("flexVertical", "gap6", "paddingLateral24")
                    contenedorDetalles.appendChild(contenedorDetallesExpandido)

                    const tituloPublico = document.createElement("p")
                    //tituloPublico.classList.add("padding6")
                    tituloPublico.textContent = apartamentoUIPublico
                    contenedorDetallesExpandido.appendChild(tituloPublico)

                    const tituloDefinicion = document.createElement("p")
                    //tituloDefinicion.classList.add("padding6")
                    tituloDefinicion.textContent = definicionPublica
                    contenedorDetallesExpandido.appendChild(tituloDefinicion)

                    const botonSeleccionarApartamento = document.createElement("div")
                    botonSeleccionarApartamento.classList.add("botonV1BlancoIzquierda")
                    botonSeleccionarApartamento.setAttribute("apartamentoIDV", apartamentoIDV)
                    botonSeleccionarApartamento.textContent = "Seleccionar " + apartamentoUI
                    botonSeleccionarApartamento.addEventListener("click", (e) => { this.seleccionarApartamento(e) })
                    bloqueApartamentoUI.appendChild(botonSeleccionarApartamento)
                    apartamentosDisponiblesUI.appendChild(bloqueApartamentoUI)
                }
                document.querySelector(`[instanciaUID="${instanciaUID}"]`).innerHTML = null
                document.querySelector(`[instanciaUID="${instanciaUID}"]`).appendChild(apartamentosDisponiblesUI)

            }
        } catch (errorCapturado) {
            throw errorCapturado
        }
    },
    controladorOfertasInicial: function () {

        const controlEstados = (e) => {
            const opcion = document.querySelectorAll("[configuracionOfertaIDV]")
            const sel = e.target
            const estadoActual = sel.getAttribute("estado")

            opcion.forEach((o) => {
                o.removeAttribute("style")
                o.removeAttribute("estado")
            })
            if (estadoActual !== "s") {
                sel.setAttribute("estado", "s")
                sel.style.background = "blue"
                sel.style.color = "white"
            }

        }
        const selectorOpcion = document.querySelectorAll("[configuracionOfertaIDV]")
        selectorOpcion.forEach((opcion) => {
            opcion.addEventListener("click", controlEstados)
        })


    },
    seleccionarApartamento: function (apartamento) {
        const selectorEspacioBotonConfimrar = document.querySelector("[componente=espacioBotonConfirmarReserva]")
        if (apartamento.target.getAttribute("estado")) {
            apartamento.target.removeAttribute("style")
            apartamento.target.removeAttribute("estado")
            const contadorApartamentosSeleccionados = document.querySelectorAll("[estado=seleccionado]")
            if (contadorApartamentosSeleccionados.length > 0) {
                selectorEspacioBotonConfimrar.classList.remove("elementoOcultoInicialmente")
            } else {
                selectorEspacioBotonConfimrar.classList.add("elementoOcultoInicialmente")
            }
            return
        }
        apartamento.target.style.background = "blue"
        apartamento.target.style.color = "white"
        apartamento.target.setAttribute("estado", "seleccionado")
        const contadorApartamentosSeleccionados = document.querySelectorAll("[estado=seleccionado]")
        if (contadorApartamentosSeleccionados.length > 0) {
            selectorEspacioBotonConfimrar.classList.remove("elementoOcultoInicialmente")
        } else {
            selectorEspacioBotonConfimrar.classList.add("elementoOcultoInicialmente")
        }
    },
    confirmarReservaNueva: async function () {
        const fechaEntrada = document.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
        const fechaSalida = document.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")
        const estadoInicialIDV = document.querySelector("[selector=estadoInicialReserva]").value
        const estadoInicialOfertasIDV = document.querySelector("[configuracionOfertaIDV][estado=s]").getAttribute("configuracionOfertaIDV")


        const apartamentos = []
        document.querySelectorAll("[estado=seleccionado]").forEach((apartamentoSeleccionado) => {
            const apartamentoIDV = apartamentoSeleccionado.getAttribute("apartamentoIDV")
            apartamentos.push(apartamentoIDV)
        })
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const metadatosPantallaCarga = {
            mensaje: "Creando reserva...",
            instanciaUID,
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(metadatosPantallaCarga)
        const transaccion = {
            zona: "administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa",
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            estadoInicialIDV: estadoInicialIDV,
            estadoInicialOfertasIDV: estadoInicialOfertasIDV,
            apartamentos: apartamentos
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        const pantallaDeCargaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (pantallaDeCargaRenderizada) {
            if (respuestaServidor?.error) {
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas();
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                const vista = `/administracion/reservas/reserva:${respuestaServidor?.reservaUID}`
                const navegacion = {
                    vista: vista,
                    tipoOrigen: "menuNavegador"
                }
                casaVitini.shell.navegacion.controladorVista(navegacion)
            }
        }
    }
}