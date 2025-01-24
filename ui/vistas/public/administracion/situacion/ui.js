casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/situacion")

        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const parametros = granuladoURL.parametros
        const fechaHoyTZ = await this.portada.obtenerFecha()
        const dia = fechaHoyTZ.dia
        const mes = fechaHoyTZ.mes
        const ano = fechaHoyTZ.ano
        const hora = fechaHoyTZ.hora
        const minuto = String(fechaHoyTZ.minuto).padStart(2, "0")
        const fechaUI = `Hoy son las ${hora}:${minuto}, ${dia} del ${mes} del ${ano}`

        const contenedorFecha = document.createElement("div")
        contenedorFecha.classList.add("administracion_situacion_portada_contenedorFecha")
        contenedorFecha.textContent = fechaUI
        if (Object.keys(parametros).length === 0) {
            return this.portada.arranque()
        } else if (parametros.alojamiento) {
            const apartamentoIDV = parametros.alojamiento
            return this.detallesApartamento.arranque(apartamentoIDV)
        }
    },
    portada: {
        arranque: async function () {

            const marcoElastico = document.querySelector("[componente=marcoElastico]")
            const spinner = casaVitini.ui.componentes.spinnerSimple()
            marcoElastico.appendChild(spinner)
            const instanciaUID = document.querySelector("main").getAttribute("instanciaUID")
            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/situacion/obtenerSituacion"
            })
            const instanciaRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
            if (!instanciaRenderizada) { return }

            const botonIrACalendario = document.createElement("a")
            botonIrACalendario.setAttribute("href", '/administracion/calendario/capa:todas_las_reservas/capa:todas_las_reservas_por_apartamento/capa:todos_los_bloqueos/capa:todo_airbnb')
            botonIrACalendario.setAttribute("vista", '/administracion/calendario/capa:todas_las_reservas/capa:todas_las_reservas_por_apartamento/capa:todos_los_bloqueos/capa:todo_airbnb')
            botonIrACalendario.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            botonIrACalendario.classList.add("botonV1BlancoIzquierda")
            botonIrACalendario.textContent = "Ver la situación global de todos los eventos pernoctativos y la disponibilidad de alojamiento en el calendario."
            marcoElastico.appendChild(botonIrACalendario)
            spinner.remove()
            if (respuestaServidor?.error) {
                casaVitini.shell.controladoresUI.ocultarMenusVolatiles()
                const titulo = document.querySelector(".tituloGris")
                titulo.textContent = respuestaServidor.error

            }
            if (respuestaServidor?.ok) {
                const situacion = respuestaServidor?.ok

                const horaEntrada = respuestaServidor.horaEntrada
                const horaSalida = respuestaServidor.horaSalida
                const espacioSituacion = document.createElement("div")
                espacioSituacion.classList.add("espacioSituacion")
                espacioSituacion.setAttribute("componente", "espacioSituacion")
                for (const [apartamentoIDV, detallesApartamento] of Object.entries(situacion)) {
                    const reservas = detallesApartamento.reservas
                    detallesApartamento.apartamentoIDV = apartamentoIDV
                    const calendariosSincronizados = detallesApartamento?.calendariosSincronizados || {}

                    const apartamentoUI = await casaVitini.view.componentesUI.tarjetaApartamentoUI(detallesApartamento)
                    for (const detallesReservas of reservas) {
                        detallesReservas.horaEntrada = horaEntrada
                        detallesReservas.horaSalida = horaSalida
                        const contenedorReserva = this.componentesUI.tarjetaReservaUI(detallesReservas)
                        apartamentoUI.appendChild(contenedorReserva)
                    }
                    if (calendariosSincronizados.airbnb) {
                        const eventosAirbnb = calendariosSincronizados.airbnb.eventos
                        for (const detallesDelEvento of eventosAirbnb) {
                            const contenedorEvento = this.componentesUI.tarjetaEventoUI(detallesDelEvento)
                            apartamentoUI.appendChild(contenedorEvento)
                        }
                    }
                    espacioSituacion.appendChild(apartamentoUI)
                }
                marcoElastico.appendChild(espacioSituacion)
            }
        },
        obtenerFecha: async function () {
            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "componentes/fechaLocal"
            })
            if (respuestaServidor?.error) {
                casaVitini.shell.controladoresUI.ocultarMenusVolatiles()
                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor.fechaISO) {
                return respuestaServidor
            }
        },
    },
    detallesApartamento: {
        arranque: async function (apartamentoIDV) {

            const marcoElastico = document.querySelector("[componente=marcoElastico]")
            const instanciaUID = document.querySelector("main").getAttribute("instanciaUID")
            const spinner = casaVitini.ui.componentes.spinnerSimple()
            marcoElastico.appendChild(spinner)

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/situacion/detallesSituacionApartamento",
                apartamentoIDV: apartamentoIDV
            })
            const instanciaRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
            if (!instanciaRenderizada) { return }
            spinner.remove()
            if (respuestaServidor?.error) {
                const info = {
                    titulo: "No existe el identificador del apartamento",
                    descripcion: "Estás buscando la situación de un apartamento que no existe o existe y no tiene una configuración disponible."
                }
                casaVitini.ui.componentes.mensajeSimple(info)
            }
            if (respuestaServidor?.ok) {
                const detallesApartamento = respuestaServidor?.ok
                const apartamentoIDV = detallesApartamento.apartamentoIDV
                const reservas = detallesApartamento.reservas
                const horaEntrada = detallesApartamento.horaEntrada
                const horaSalida = detallesApartamento.horaSalida
                detallesApartamento.apartamentoIDV = apartamentoIDV
                const calendariosSincronizados = detallesApartamento?.calendariosSincronizados || {}
                const apartamentoUI = await casaVitini.view.componentesUI.tarjetaApartamentoUI(detallesApartamento)
                const selectorTituloApartamentoUI = apartamentoUI.querySelector("[componente=titulo]")
                selectorTituloApartamentoUI.classList.remove("comportamientoBoton")
                selectorTituloApartamentoUI.removeEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                selectorTituloApartamentoUI.removeAttribute("vista")
                selectorTituloApartamentoUI.removeAttribute("href")

                marcoElastico.appendChild(apartamentoUI)

                const espacioEventosAirbnb = document.createElement("div")
                espacioEventosAirbnb.classList.add("flexVertical", "gap6")
                espacioEventosAirbnb.setAttribute("componente", "espacioEventosAirbnb")

                for (const [reservaUID, detallesReservas] of Object.entries(reservas)) {

                    const pernoctantes = detallesReservas.pernoctantes
                    const habitaciones = detallesReservas.habitaciones
                    detallesReservas.reservaUID = reservaUID
                    detallesReservas.horaEntrada = horaEntrada
                    detallesReservas.horaSalida = horaSalida
                    const contenedorReserva = this.componentesUI.tarjetaReservaUI(detallesReservas)
                    marcoElastico.appendChild(contenedorReserva)

                    if (habitaciones.length > 0) {
                        const espacioHabitaciones = document.createElement("div")
                        espacioHabitaciones.classList.add(
                            "gridHorizontal2C",
                            "gap6"
                        )
                        for (const detallesHabitacion of habitaciones) {
                            const habitacionUI = detallesHabitacion.habitacionUI
                            const habitacionUID = detallesHabitacion.componenteUID
                            const habitacionBloque = this.componentesUI.tarjetaHabitacionUI({
                                habitacionUI,
                                habitacionUID
                            })
                            espacioHabitaciones.appendChild(habitacionBloque)
                        }
                        contenedorReserva.appendChild(espacioHabitaciones)
                    }
                    if (pernoctantes.length > 0) {
                        for (const pernoctante of pernoctantes) {

                            const habitacionUID = pernoctante.habitacionUID
                            const habitacionDestino = document.querySelector(`[habitacionUID="${habitacionUID}"]`)
                            if (!habitacionDestino) {
                                continue
                            }
                            const pernoctanteUI = this.componentesUI.tarjetaPernotanteUI(pernoctante)
                            habitacionDestino.appendChild(pernoctanteUI)
                        }
                    }
                }
                const eventosAirbnb = calendariosSincronizados.airbnb.eventos
                for (const detallesDelEvento of eventosAirbnb) {
                    const contenedorEvento = this.componentesUI.tarjetaEventoUI(detallesDelEvento)
                    espacioEventosAirbnb.appendChild(contenedorEvento)
                }
                marcoElastico.appendChild(espacioEventosAirbnb)

            }
        }
    },
    componentesUI: {
        tarjetaApartamentoUI: async function (data) {
            const apartamentoIDV = data.apartamentoIDV
            const estadoPernoctacion = data.estadoPernoctacion
            const estadoApartamento = data.estadoApartamento
            const apartamentoUI = data.apartamentoUI
            const zonaIDV = data.zonaIDV

            const dic = {
                estadoApartamento: {
                    disponible: "Disponible",
                    nodisponible: "No dispobile",

                },
                estadoPernoctacion: {
                    ocupado: "Ocupado",
                    libre: "Libre"
                },
                zona: {
                    privada: "Privada (Solo administración)",
                    global: "Global (Todo)",
                    publica: "Pública (Solo reserva pública)"
                }
            }

            const apartamentoGUI = document.createElement("div")
            apartamentoGUI.classList.add(
                "flexVertical",
                "padding6",
                "gap6",
                "backgroundWhite3",
                "borderRadius20"
            )

            const apartamentoTitulo = document.createElement("a")
            apartamentoTitulo.setAttribute("componente", "titulo")
            apartamentoTitulo.classList.add(
                "flexVertical",
                "padding",
                "borderRadius16",
                "padding14",
                "comportamientoBoton",
                "negrita",
                "ratonDefault"
            )

            apartamentoTitulo.textContent = apartamentoUI
            apartamentoTitulo.setAttribute("vista", `/administracion/situacion/alojamiento:${apartamentoIDV}`)
            apartamentoTitulo.setAttribute("href", `/administracion/situacion/alojamiento:${apartamentoIDV}`)
            apartamentoTitulo.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            apartamentoGUI.appendChild(apartamentoTitulo)

            const contenedorInfoGlobal = document.createElement("div")
            contenedorInfoGlobal.classList.add(
                "flexVertical",
                "gap10",
                "padding14",
                "backgroundGrey1",
                "borderRadius16"
            )
            apartamentoGUI.appendChild(contenedorInfoGlobal)

            const contenedorEstadoPernoctacion = casaVitini.ui.componentes.widgetsUI.contenedorTituloDescripcionSimple({
                titulo: "Estado pernoctativo",
                dato: dic.estadoPernoctacion[estadoPernoctacion]
            })
            contenedorEstadoPernoctacion.querySelector("[data=dataUI]").style.fontWeight = "bold"
            contenedorInfoGlobal.appendChild(contenedorEstadoPernoctacion)

            const contenedorEstadoConfiguracionAlojamiento = casaVitini.ui.componentes.widgetsUI.contenedorTituloDescripcionSimple({
                titulo: "Estado configuracíon de la alojamiento",
                dato: dic.estadoApartamento[estadoApartamento]
            })
            contenedorEstadoConfiguracionAlojamiento.querySelector("[data=dataUI]").style.fontWeight = "bold"

            contenedorInfoGlobal.appendChild(contenedorEstadoConfiguracionAlojamiento)

            const contenedorZonaPublicacion = casaVitini.ui.componentes.widgetsUI.contenedorTituloDescripcionSimple({
                titulo: "Zona de publicación",
                dato: dic.zona[zonaIDV]
            })
            contenedorZonaPublicacion.querySelector("[data=dataUI]").style.fontWeight = "bold"
            contenedorInfoGlobal.appendChild(contenedorZonaPublicacion)

            const calendariosListaAirnbnb = await casaVitini.administracion.calendario.obtenerCalendariosSincronizados.airbnb()

            const calendariosAirbnb = []
            calendariosListaAirnbnb.forEach(c => {
                if (apartamentoIDV === c.apartamentoIDV) {
                    calendariosAirbnb.push(c.calendarioUID)
                }
            })
            // const urlBase = `administracion/calendario/capa:por_apartamento/por_apartamento:${apartamentoIDV}/capa:comportamientos_por_apartamento/comportamientos_por_apartamento:${apartamentoIDV}`

            const urlBase = `administracion/calendario/capa:reservas_por_apartamento/reservas_por_apartamento:${apartamentoIDV}/capa:bloqueos_por_apartamento/bloqueos_por_apartamento:${apartamentoIDV}`
            let urlCalendarioAirbnb = ""
            if (calendariosAirbnb.length > 0) {
                urlCalendarioAirbnb = `/capa:calendarios_airbnb/calendarios_airbnb:${calendariosAirbnb.join("=")}`
            }
            const botonIrACalendario = document.createElement("a")
            botonIrACalendario.setAttribute("href", urlBase + urlCalendarioAirbnb)
            botonIrACalendario.setAttribute("vista", urlBase + urlCalendarioAirbnb)
            botonIrACalendario.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            botonIrACalendario.classList.add("botonV1BlancoIzquierda")
            botonIrACalendario.textContent = "Ver reservas, eventos por calendarios sincronizados y bloqueos del apartamento en el calendario"
            apartamentoGUI.appendChild(botonIrACalendario)




            return apartamentoGUI
        },
        tarjetaReservaUI: function (data) {
            const reservaUID = data.reservaUID
            const diaLimite = data.diaLimite
            const fechaEntrada = data.fechaEntrada
            const fechaSalida = data.fechaSalida
            const porcentajeTranscurrido = data.porcentajeTranscurrido
            const tiempoRestante = data.tiempoRestante
            const numeroDiasReserva = data.numeroDiasReserva
            const horaEntrada = data.horaEntrada
            const horaSalida = data.horaSalida

            const contenedorReserva = document.createElement("div")
            contenedorReserva.classList.add("administracion_situacion_portada_contenedorReserva")
            let bloqueEntidad = document.createElement("a")
            bloqueEntidad.classList.add("administracion_situacion_portada_bloqueEntidad")
            bloqueEntidad.setAttribute("vista", `/administracion/reservas/reserva:${reservaUID}/zona:alojamiento`)
            bloqueEntidad.setAttribute("href", `/administracion/reservas/reserva:${reservaUID}/zona:alojamiento`)
            bloqueEntidad.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)

            bloqueEntidad.classList.add("administracion_situacion_portada_contenedorSelecccionable")
            let tituloEntidad = document.createElement("div")
            tituloEntidad.classList.add("administracion_situacion_portada_tituloEntidad")
            tituloEntidad.textContent = "Reserva"
            bloqueEntidad.appendChild(tituloEntidad)
            let apartamentoReserva = document.createElement("a")
            apartamentoReserva.classList.add("adminsitracion_situacion_portada_datoEntidad")
            apartamentoReserva.textContent = reservaUID
            bloqueEntidad.appendChild(apartamentoReserva)
            contenedorReserva.appendChild(bloqueEntidad)
            if (diaLimite === "diaDeSalida") {
                let bloqueEntidad = document.createElement("div")
                bloqueEntidad.classList.add("administracion_situacion_portada_bloqueEntidad")
                const aviso = document.createElement("div")
                aviso.classList.add("administracion_situacion_portada_tituloEntidad")
                aviso.classList.add("negrita")
                aviso.textContent = "<<< Dia de salida"
                bloqueEntidad.appendChild(aviso)
                const tituloEntidad = document.createElement("div")
                tituloEntidad.classList.add("administracion_situacion_portada_tituloEntidad")
                tituloEntidad.textContent = "Hoy es el día final de la reserva y los pernoctantes deben de abandonar el alojamiento antes de las " + horaSalida
                bloqueEntidad.appendChild(tituloEntidad)
                const datoEntidad = document.createElement("div")
                datoEntidad.classList.add("adminsitracion_situacion_portada_datoEntidad")
                datoEntidad.textContent = tiempoRestante

                contenedorReserva.appendChild(bloqueEntidad)
            }
            if (diaLimite === "diaDeEntrada") {
                let bloqueEntidad = document.createElement("div")
                bloqueEntidad.classList.add("administracion_situacion_portada_bloqueEntidad")
                const aviso = document.createElement("div")
                aviso.classList.add("administracion_situacion_portada_tituloEntidad")
                aviso.classList.add("negrita")
                aviso.textContent = ">>> Dia de entrada"
                bloqueEntidad.appendChild(aviso)
                const tituloEntidad = document.createElement("div")
                tituloEntidad.classList.add("administracion_situacion_portada_tituloEntidad")
                tituloEntidad.textContent = "Hoy es el día de entrada de la reserva y el alojamiento debe de estar preparado antes de las " + horaEntrada + " para la llegada de los nuevos pernoctantes"
                bloqueEntidad.appendChild(tituloEntidad)
                const datoEntidad = document.createElement("div")
                datoEntidad.classList.add("adminsitracion_situacion_portada_datoEntidad")
                datoEntidad.textContent = tiempoRestante

                contenedorReserva.appendChild(bloqueEntidad)
            }
            const contenedorFechas = document.createElement("div")
            contenedorFechas.classList.add("administracion_situacion_portada_contenedorFechas")
            bloqueEntidad = document.createElement("div")
            bloqueEntidad.classList.add("administracion_situacion_portada_bloqueEntidad")
            tituloEntidad = document.createElement("div")
            tituloEntidad.classList.add("administracion_situacion_portada_tituloEntidad")
            tituloEntidad.textContent = "Fecha de entrada"
            bloqueEntidad.appendChild(tituloEntidad)
            let apartamentoFechaEntrada = document.createElement("div")
            apartamentoFechaEntrada.classList.add("adminsitracion_situacion_portada_datoEntidad")
            apartamentoFechaEntrada.textContent = fechaEntrada
            bloqueEntidad.appendChild(apartamentoFechaEntrada)
            contenedorFechas.appendChild(bloqueEntidad)
            bloqueEntidad = document.createElement("div")
            bloqueEntidad.classList.add("administracion_situacion_portada_bloqueEntidad")
            bloqueEntidad.classList.add("administracion_situacion_portada_fechaDeSalida")
            tituloEntidad = document.createElement("div")
            tituloEntidad.classList.add("administracion_situacion_portada_tituloEntidad")
            tituloEntidad.textContent = "Fecha de salida"
            bloqueEntidad.appendChild(tituloEntidad)
            let apartamentoFechaSalida = document.createElement("div")
            apartamentoFechaSalida.classList.add("adminsitracion_situacion_portada_datoEntidad")
            apartamentoFechaSalida.textContent = fechaSalida
            bloqueEntidad.appendChild(apartamentoFechaSalida)
            contenedorFechas.appendChild(bloqueEntidad)
            contenedorReserva.appendChild(contenedorFechas)
            bloqueEntidad = document.createElement("div")
            bloqueEntidad.classList.add("administracion_situacion_portada_bloqueEntidad")
            let apartamentoEstadoReserva = document.createElement("div")
            apartamentoEstadoReserva.classList.add("situacionApartamentoEstadoReserva")



            const nombreClaseDinamica = `barraProgresso-anchoDinamico-${reservaUID}`;
            if (!document.querySelector(`.${nombreClaseDinamica}`)) {

                const style = document.createElement('style');
                style.innerHTML = `
                    .${nombreClaseDinamica} {
                        width: ${porcentajeTranscurrido}
                `;
                document.querySelector("main").appendChild(style);
            }

            let barraProgresso = document.createElement("div")
            barraProgresso.classList.add(
                "situacionBarraProgressoReserva",
                nombreClaseDinamica
            )

            apartamentoEstadoReserva.appendChild(barraProgresso)
            bloqueEntidad.appendChild(apartamentoEstadoReserva)
            contenedorReserva.appendChild(bloqueEntidad)
            bloqueEntidad = document.createElement("div")
            bloqueEntidad.classList.add("administracion_situacion_portada_bloqueEntidad")
            tituloEntidad = document.createElement("div")
            tituloEntidad.classList.add("administracion_situacion_portada_tituloEntidad")
            tituloEntidad.textContent = "Duración de la reserva"
            bloqueEntidad.appendChild(tituloEntidad)
            let datoEntidad = document.createElement("div")
            datoEntidad.classList.add("adminsitracion_situacion_portada_datoEntidad")
            datoEntidad.textContent = numeroDiasReserva
            bloqueEntidad.appendChild(datoEntidad)
            contenedorReserva.appendChild(bloqueEntidad)
            bloqueEntidad = document.createElement("div")
            bloqueEntidad.classList.add("administracion_situacion_portada_bloqueEntidad")
            tituloEntidad = document.createElement("div")
            tituloEntidad.classList.add("administracion_situacion_portada_tituloEntidad")
            tituloEntidad.textContent = "Tiempo restante de la reserva"
            bloqueEntidad.appendChild(tituloEntidad)
            datoEntidad = document.createElement("div")
            datoEntidad.classList.add("adminsitracion_situacion_portada_datoEntidad")
            datoEntidad.textContent = tiempoRestante
            bloqueEntidad.appendChild(datoEntidad)
            contenedorReserva.appendChild(bloqueEntidad)
            return contenedorReserva
        },
        tarjetaEventoUI: function (data) {

            const fechaInicio_ISO = data.fechaInicio
            const fechaFinal_ISO = data.fechaFinal
            const uid = data.uid
            const descripcion = data?.descripcion || null
            const nombreEvento = data.nombreEvento
            const fechaInicioArray = fechaInicio_ISO.split("-")
            const fechaInicio_Humano = `${fechaInicioArray[2]}/${fechaInicioArray[1]}/${fechaInicioArray[0]}`
            const fechaFinalArray = fechaFinal_ISO.split("-")
            const fechaFinal_Humano = `${fechaFinalArray[2]}/${fechaFinalArray[1]}/${fechaFinalArray[0]}`
            let urlEvento
            if (descripcion) {
                const regex = /Reservation URL: (https:\/\/www\.airbnb\.com\/hosting\/reservations\/details\/[A-Za-z0-9]+)/;
                const match = descripcion.match(regex);
                urlEvento = match?.[1] ?? "No se encontró la URL en el texto proporcionado.";
            }

            const contenedorEvento = document.createElement("div")
            contenedorEvento.classList.add(
                "flexVertical",
                "padding14",
                "gap10",
                "backgroundGrey1",
                "borderRadius16"
            )


            const tituloPlataformaOrigen = document.createElement("p")

            tituloPlataformaOrigen.textContent = "Evento de Airbnb"
            contenedorEvento.appendChild(tituloPlataformaOrigen)

            const descripcionEvento = document.createElement("p")

            descripcionEvento.textContent = "Este evento proviene de un calendario sincronizado con Airbnb."
            contenedorEvento.appendChild(descripcionEvento)

            const contenedorFechas = document.createElement("div")
            contenedorFechas.classList.add(
                "gridHorizontal2C",
                "gap6",

            )
            contenedorEvento.appendChild(contenedorFechas)

            const contenedorFechaInicio = document.createElement("div")
            contenedorFechaInicio.classList.add(
                "flexVertical",
                "borderRadius16",
                "backgroundWhite3",
                "flextJustificacion_center",
                "flexAHCentrad",
                "padding10"
            )
            contenedorFechas.appendChild(contenedorFechaInicio)

            const tituloFechaInicio = document.createElement("p")
            tituloFechaInicio.classList.add("tituloFecha")
            tituloFechaInicio.textContent = "Fecha de inicio"
            contenedorFechaInicio.appendChild(tituloFechaInicio)

            const fechaInicioUI = document.createElement("p")
            fechaInicioUI.classList.add("fechaDatoUI")
            fechaInicioUI.textContent = fechaInicio_Humano
            contenedorFechaInicio.appendChild(fechaInicioUI)

            const contenedorFechaFin = document.createElement("div")
            contenedorFechaFin.classList.add(
                "flexVertical",
                "borderRadius16",
                "backgroundWhite3",
                "flextJustificacion_center",
                "flexAHCentrad",
                "padding10"
            )
            contenedorFechas.appendChild(contenedorFechaFin)

            const tituloFechaFin = document.createElement("p")
            tituloFechaFin.classList.add("tituloFecha")
            tituloFechaFin.textContent = "Fecha fin"
            contenedorFechaFin.appendChild(tituloFechaFin)

            const fechaFinUI = document.createElement("p")
            fechaFinUI.classList.add("fechaDatoUI")
            fechaFinUI.textContent = fechaFinal_Humano
            contenedorFechaFin.appendChild(fechaFinUI)


            if (descripcion) {
                const botonIrAlEvento = document.createElement("a")
                botonIrAlEvento.classList.add("botonIrAlEvento")
                botonIrAlEvento.href = urlEvento
                botonIrAlEvento.textContent = "Abrir evento. (Se ira a la web de Airbnb)"
                contenedorEvento.appendChild(botonIrAlEvento)
            } else {
                const botonIrAlEvento = document.createElement("div")

                botonIrAlEvento.textContent = "Airbnb no proporciona ninguna información sobre este evento. Probablemente, este evento sea de un calendario que Airbnb ha sincronizado con otra plataforma, un evento de Airbnbn generado cuando estableces días obligatorios de antelación o un evento generado cuando deshabilitas la disponibilidad de ciertos días en Airbnbn. Para ver más información de este evento, por favor diríjase a la web de Airbnb porque Airbnb no proporciona ninguna forma de enlazar este evento."
                contenedorEvento.appendChild(botonIrAlEvento)
            }
            return contenedorEvento
        },
        tarjetaHabitacionUI: function (data) {
            const habitacionUI = data.habitacionUI
            const habitacionUID = data.habitacionUID

            const contenedor = document.createElement("div")
            contenedor.setAttribute("habitacionUID", habitacionUID)
            contenedor.classList.add(
                "flexVertical",
                "gap6",
                "borderGrey1",
                "borderRadius12",
                "padding6"
            )
            const tituloHabitacion = document.createElement("p")
            tituloHabitacion.classList.add(
                "negrita",
                "padding10"
            )
            tituloHabitacion.textContent = habitacionUI
            contenedor.appendChild(tituloHabitacion)
            return contenedor
        },
        tarjetaPernotanteUI: function (data) {


            const nombreCompleto = data.nombreCompleto
            const tipoPernoctante = data.tipoPernoctante
            const clienteUID = data.clienteUID
            const habitacionUID = data.habitacionUID
            const fechaCheckIn = data.fechaCheckIn
            const fechaCheckOut = data.fechaCheckOut

            const dic = {
                cliente: "Cliente de Casa Vitini",
                clientePool: "Cliente por veriricar"
            }

            const marcoPernoctante = document.createElement("a")
            marcoPernoctante.classList.add(
                "flexVertical",
                "gap4",
                "padding10",
                "comportamientoBoton",
                "borderRadius8",
                "ratonDefault"
            )
            if (tipoPernoctante === "cliente") {
                marcoPernoctante.setAttribute("vista", `/administracion/clientes/cliente:${clienteUID}`)
                marcoPernoctante.setAttribute("href", `/administracion/clientes/cliente:${clienteUID}`)
                marcoPernoctante.setAttribute("clienteUID", clienteUID)
                marcoPernoctante.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            }
            if (!fechaCheckIn) {
                const tipoPernoctanteUI = document.createElement("div")
                tipoPernoctanteUI.classList.add("administracion_reservas_detallesReserva_tituloCheckIn")

                tipoPernoctanteUI.setAttribute("componente", "checkInInfo")
                tipoPernoctanteUI.textContent = "Pendiente de checkin"
                marcoPernoctante.appendChild(tipoPernoctanteUI)
            } else {
                const tipoPernoctanteUI = document.createElement("div")
                tipoPernoctanteUI.classList.add("administracion_reservas_detallesReserva_tituloCheckIn")

                tipoPernoctanteUI.setAttribute("componente", "checkInInfo")
                tipoPernoctanteUI.textContent = "> " + fechaCheckIn
                marcoPernoctante.appendChild(tipoPernoctanteUI)
            }
            if (fechaCheckOut) {
                const tipoPernoctanteUI = document.createElement("div")
                tipoPernoctanteUI.classList.add("administracion_reservas_detallesReserva_tituloCheckIn")
                tipoPernoctanteUI.classList.add("letraRoja")
                tipoPernoctanteUI.setAttribute("componente", "checkOutInfo")
                tipoPernoctanteUI.textContent = "< " + fechaCheckOut
                marcoPernoctante.appendChild(tipoPernoctanteUI)
            }
            if (tipoPernoctante === "clientePool") {
                const tipoPernoctanteUI = document.createElement("div")
                tipoPernoctanteUI.classList.add("administracion_reservas_detallesReserva_tituloPendienteComprobacion")
                tipoPernoctanteUI.classList.add("parpadea")
                tipoPernoctanteUI.setAttribute("componente", "pendienteComprobacion")
                tipoPernoctanteUI.textContent = "Pendiente de comprobación documental"
                marcoPernoctante.appendChild(tipoPernoctanteUI)
            }
            const nombreCompletoPernoctante = document.createElement("div")
            nombreCompletoPernoctante.classList.add("administracion_situacion_detallesApartamento_nombrePernoctante")
            nombreCompletoPernoctante.textContent = nombreCompleto
            marcoPernoctante.appendChild(nombreCompletoPernoctante)
            const tipoClientePernoctante = document.createElement("div")
            tipoClientePernoctante.classList.add("administracion_situacion_detallesApartamento_tipoCliente")
            tipoClientePernoctante.textContent = dic[tipoPernoctante]
            marcoPernoctante.appendChild(tipoClientePernoctante)
            return marcoPernoctante
        }
    }
}