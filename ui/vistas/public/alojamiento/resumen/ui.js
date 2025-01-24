casaVitini.view = {
    start: async function () {
        document.body.style.background = "rgb(214 192 157)"
        const main = document.querySelector("main")
        const instanciaUID = main.getAttribute("instanciaUID")
        main.setAttribute("zonaCSS", "/alojamiento/resumen")
        const reservaLocal = JSON.parse(sessionStorage.getItem("preReservaLocal")) || {}

        casaVitini.shell.controladoresUI.iconosGlobales.telefonoPublicoWhatsApp({
            zonaIcono: "alojamiento"
        })
        if (Object.keys(reservaLocal).length === 0) {
            const ui = this.uiConReserva()
            main.appendChild(ui)
        } else {
            const fechaEntrada = reservaLocal.fechaEntrada
            const fechaSalida = reservaLocal.fechaSalida
            const alojamiento = reservaLocal.alojamiento
            const codigoDescuentoPorComprobar = reservaLocal?.codigosDescuento || []

            const fechaEntrada_Humana = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaEntrada)
            const fechaSalida_Humana = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaSalida)

            const ui = await this.ui()
            main.appendChild(ui)

            const selectorFechaEntrada = ui.querySelector("[data=fechaEntrada]")
            const selectorFechaSalida = ui.querySelector("[data=fechaSalida]")
            selectorFechaEntrada.textContent = fechaEntrada_Humana
            selectorFechaSalida.textContent = fechaSalida_Humana

            await this.bloqueAlojamientoUI({
                instanciaUID,
                reservaLocal
            })
            await this.tiempoRestanteUI({
                selectorDestino: "[contenedor=tiempoRestante]",
                fechaEntrada
            })
            await this.servicios.renderizarServiciosPublicos()
            if (codigoDescuentoPorComprobar.length > 0) {
                const selectorOfertasComprobadas = document.querySelector("[contenedor=ofertasComprobadas]")
                const spinner = casaVitini.ui.componentes.spinnerSimple()
                selectorOfertasComprobadas.appendChild(spinner)
                await this.descuentos.contenedorCodigoDescuentos.recuperarOfertasPorArrayDeCodigos()
            }
            await this.actualizarPrecioEnUI({
                aplicarUIData: "no"
            })
        }

    },
    uiConReserva: async function () {
        const reservaConfirmada = JSON.parse(sessionStorage.getItem("reservaConfirmada"))

        const contenedor = document.createElement("div")
        contenedor.classList.add(
            "flexVertical",
            "gap14",
            "padding14"
        )
        contenedor.setAttribute("componente", "espacioConfirmarReserva")
        if (reservaConfirmada) {
            const botonIrAReservaConfirmada = document.createElement("a")
            botonIrAReservaConfirmada.classList.add("plaza_reservas_reservaConfirmada_banner")
            botonIrAReservaConfirmada.textContent = "Tienes una reserva guardada en la cache de tu navegador. Esta reserva se ha guardado tras confirmar tu reserva. Para ver los detalles de la confirmación pulsa aquí. Si borras la cache de tu navegador esta información desaparecerá. Si quieres un acceso persistente puedes crear un VitiniID desde MiCasa."
            botonIrAReservaConfirmada.setAttribute("href", "/alojamiento/reserva_confirmada")
            botonIrAReservaConfirmada.setAttribute("vista", "/alojamiento/reserva_confirmada")
            botonIrAReservaConfirmada.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            contenedor.appendChild(botonIrAReservaConfirmada)
        }


        const botonIrAlInicioDelProcesoDeReserva = document.createElement("a")
        botonIrAlInicioDelProcesoDeReserva.classList.add("plaza_reservas_reservaConfirmada_banner")
        botonIrAlInicioDelProcesoDeReserva.textContent = "Ir al incio del proceso de la reserva"
        botonIrAlInicioDelProcesoDeReserva.setAttribute("href", "/alojamiento")
        botonIrAlInicioDelProcesoDeReserva.setAttribute("vista", "/alojamiento")
        botonIrAlInicioDelProcesoDeReserva.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
        contenedor.appendChild(botonIrAlInicioDelProcesoDeReserva)
        return contenedor
    },
    tiempoRestanteUI: async (data) => {

        const selectorDestino = data.selectorDestino
        const fechaEntrada = data.fechaEntrada
        const selectorContenedor = document.querySelector(selectorDestino)
        const mensajeErrorCompartido = "Ha ocurrido un error y no se han podido obtener ciertos datos. Por favor, actualiza la página."

        const transaccion = {
            zona: "componentes/horaLimiteDelMismoDia",
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)

        if (respuestaServidor?.error) {
            selectorContenedor.removeAttribute("style")

            const contenedorBanner = document.createElement("div")
            contenedorBanner.classList.add("plaza_reservas_reservaConfirmada_banner")
            contenedorBanner.textContent = mensajeErrorCompartido
            selectorContenedor.appendChild(contenedorBanner)
        } else if (respuestaServidor.ok) {

            const mismoDiaAceptable = respuestaServidor.mismoDiaAceptable
            const estadoAceptacion = respuestaServidor.estadoAceptacion
            const horaLimiteDelMismoDia = respuestaServidor.horaLimiteDelMismoDia
            const zonaHoraria = respuestaServidor.zonaHoraria
            const fechaActual = respuestaServidor.fechaActual

            const mismoDia = fechaActual === fechaEntrada

            if (mismoDia && estadoAceptacion === "no") {
                selectorContenedor.removeAttribute("style")

                const contenedorBanner = document.createElement("div")
                contenedorBanner.classList.add("bannerTiempoRestante")

                const info = document.createElement("p")
                info.textContent = casaVitini.ui.vistas.alojamiento.componentes.mensajeNoAceptacion({
                    horaLimite: horaLimiteDelMismoDia,
                    zonaHoraria: zonaHoraria
                });
                contenedorBanner.appendChild(info)


                selectorContenedor.appendChild(contenedorBanner)
            } else if (mismoDia && estadoAceptacion === "si") {
                selectorContenedor.removeAttribute("style")

                const cuentaAtras = respuestaServidor.cuentaAtras
                const dias = cuentaAtras.dias
                const horas = cuentaAtras.horas
                const minutos = cuentaAtras.minutos
                const segundos = cuentaAtras.segundos

                const totalCuentaAtrasEnReseugnos =
                    (dias * 24 * 60 * 60) +  // Convertir días a segundos
                    (horas * 60 * 60) +      // Convertir horas a segundos
                    (minutos * 60) +         // Convertir minutos a segundos
                    segundos;                // Segundos ya en segundos
                const instanciaUID_cuentaAttras = casaVitini.utilidades.codigoFechaInstancia()


                const contenedorBanner = document.createElement("div")
                contenedorBanner.classList.add("bannerTiempoRestante")
                contenedorBanner.setAttribute("instanciaUID", instanciaUID_cuentaAttras)

                const info = document.createElement("p")

                // La fecha limite para reservar con fecha de entrada pra hoy, es a las ${horaLimiteDelMismoDia} hora local Nicaragua. 
                info.textContent = `
                La fecha limite para reservar con fecha de entrada para hoy, es a las ${horaLimiteDelMismoDia} hora local ${zonaHoraria}.`
                contenedorBanner.appendChild(info)

                const cuentaAtrasUI = document.createElement("p")
                cuentaAtrasUI.setAttribute("contenedor", "cuentaAtras")
                cuentaAtrasUI.classList.add(
                    "negrita"
                )
                contenedorBanner.appendChild(cuentaAtrasUI)
                selectorContenedor.appendChild(contenedorBanner)

                casaVitini.ui.vistas.alojamiento.componentes.controladorCuentaAtras({
                    instanciaUID: instanciaUID_cuentaAttras,
                    segundosDeLaCuentaAtras: totalCuentaAtrasEnReseugnos,
                    zonaHoraria,
                    horaLimiteDelMismoDia
                })
            }
        }
    },
    ui: async function () {
        const contenedor = document.createElement("div")
        contenedor.classList.add(
            "flexVertical",
            "gap14",
            "padding14"
        )
        contenedor.setAttribute("componente", "espacioConfirmarReserva")

        const titulo = document.createElement("p")
        titulo.classList.add(
            "tituloBloque"
        )
        titulo.textContent = "Resumen de la reserva"
        contenedor.appendChild(titulo)


        const infoTiempoRestante = document.createElement("div")
        infoTiempoRestante.setAttribute("contenedor", "tiempoRestante")
        infoTiempoRestante.style.display = "none"
        contenedor.appendChild(infoTiempoRestante)

        const infoResumenReserva = document.createElement("p")
        infoResumenReserva.classList.add(
            "padding6",
            "textoCentrado"
        )
        infoResumenReserva.textContent = "Por favor, verifique que las fechas y los detalles del alojamiento son los que usted desea."
        contenedor.appendChild(infoResumenReserva)

        const contenedorFechas = document.createElement("div")
        contenedorFechas.classList.add(
            "blackgroundWhite30O",
            "flexHorizontal",
            "borderRadius14",
            "padding14",
            "flexJustificacion_spacearound"
        )
        contenedorFechas.setAttribute("contenedor", "fechas")
        contenedor.appendChild(contenedorFechas)

        const fechaEntradaContenedor = document.createElement("div")
        fechaEntradaContenedor.classList.add(
            "bloqueResumenDia",
        )
        contenedorFechas.appendChild(fechaEntradaContenedor)

        const fechaEntradaTitulo = document.createElement("p")
        fechaEntradaTitulo.classList.add(
            "negrita",
            "textoCentrado"
        )
        fechaEntradaTitulo.textContent = "Fecha de entrada"
        fechaEntradaContenedor.appendChild(fechaEntradaTitulo)

        const fechaEntradaUI = document.createElement("p")
        fechaEntradaUI.setAttribute("data", "fechaEntrada")
        fechaEntradaUI.classList.add(
            "negrita",
            "textoCentrado"
        )
        fechaEntradaUI.textContent = "data"
        fechaEntradaContenedor.appendChild(fechaEntradaUI)

        const fechaSalidaContenedor = document.createElement("div")
        fechaSalidaContenedor.classList.add(
            "bloqueResumenDia",
        )
        contenedorFechas.appendChild(fechaSalidaContenedor)

        const fechaSalidaTitulo = document.createElement("p")
        fechaSalidaTitulo.classList.add(
            "negrita",
            "textoCentrado"
        )
        fechaSalidaTitulo.textContent = "Fecha de salida"
        fechaSalidaContenedor.appendChild(fechaSalidaTitulo)

        const fechaSalidaUI = document.createElement("p")
        fechaSalidaUI.setAttribute("data", "fechaSalida")
        fechaSalidaUI.classList.add(
            "negrita",
            "textoCentrado"
        )
        fechaSalidaUI.textContent = "data"
        fechaSalidaContenedor.appendChild(fechaSalidaUI)


        const contenedorAlojamiento = document.createElement("div")
        contenedorAlojamiento.setAttribute("data", "alojamiento")

        contenedor.appendChild(contenedorAlojamiento)

        const tituloAlojamiento = document.createElement("p")
        tituloAlojamiento.classList.add("tituloBloqueSeccion")
        tituloAlojamiento.textContent = "Alojamiento"
        contenedor.appendChild(contenedorAlojamiento)


        const contenedorServicios = () => {
            const contenedor = document.createElement("details")
            contenedor.setAttribute("contenedor", "serviciosUI")
            contenedor.classList.add(
                "flexVertical",
                "ocultoInicial",
                "sobreControlAnimacionGlobal",
                "padding6",
                "borderRadius20"
            )

            const titulo = document.createElement("summary")
            titulo.classList.add(
                "negrita",
                "padding10",
                "textoCentrado",
                "margin0",
                "borderRadius16"
            )
            titulo.textContent = "Servicios adicionales"
            contenedor.appendChild(titulo)

            const info = document.createElement("p")
            info.classList.add(
                "padding14"
            )
            info.textContent = "Le invitamos también a conocer nuestra oferta de eventos privados, reservando el complejo completo para realizar eventos privados como cumpleaños, bodas o eventos de negocios..y poder así disfrutar de una privacidad máxima y mucha mas flexibilidad en las normas de funcionamiento, adaptándonos debidamente al motivo de su evento. Estos eventos pueden incluir servicios de comida, dj, actuaciones, personal de asistencia personalizada y equipamiento externo para el evento."
            // contenedor.appendChild(info)


            const contenedorServicios = document.createElement("div")
            contenedorServicios.setAttribute("contenedor", "servicios")
            contenedorServicios.classList.add(
                "flexVertical",
                "gap6",
            )
            contenedor.appendChild(contenedorServicios)

            return contenedor
        }

        contenedor.appendChild(contenedorServicios())

        const contenedorTitular = document.createElement("div")
        contenedorTitular.classList.add(
            "flexVertical",
            "gap14",

        )
        contenedor.appendChild(contenedorTitular)

        const tituloTitular = document.createElement("p")
        tituloTitular.classList.add(
            "textoCentrado",
            "negrita"
        )
        contenedorTitular.appendChild(tituloTitular)

        const infoTitular = document.createElement("p")
        infoTitular.classList.add(
            "padding6",
            "textoCentrado"
        )
        infoTitular.textContent = "Indiquenos por favor sus datos, para ponernos en contacto con usted y comunicarle la disponibilidad de las fechas."
        contenedorTitular.appendChild(infoTitular)

        const tituloTitularInfo = document.createElement("p")
        tituloTitularInfo.textContent = "Nombre completo del titular de la reserva"
        tituloTitularInfo.classList.add(
            "paddinHorizontal6"
        )
        contenedorTitular.appendChild(tituloTitularInfo)

        const campoNombreTitular = document.createElement("input")
        campoNombreTitular.classList.add(
            "campoTitular"
        )
        campoNombreTitular.placeholder = "Nombre del titular de la reserva"
        campoNombreTitular.setAttribute("campo", "nombreTitular")
        campoNombreTitular.value = "test"
        contenedorTitular.appendChild(campoNombreTitular)

        const tituloPasaporteInfo = document.createElement("p")
        tituloPasaporteInfo.textContent = "Pasaporte o documento nacional de identificación del titular de la reserva"
        tituloPasaporteInfo.classList.add(
            "paddinHorizontal6"
        )
        //contenedorTitular.appendChild(tituloPasaporteInfo)


        const campoPasaporteTitular = document.createElement("input")
        campoPasaporteTitular.classList.add(
            "campoTitular"
        )
        campoPasaporteTitular.placeholder = "Pasaporte del titular de la reserva"
        campoPasaporteTitular.setAttribute("campo", "pasaporteTitular")
        //campoPasaporteTitular.value = ""
        //contenedorTitular.appendChild(campoPasaporteTitular)

        const tituloTelefonoInfo = document.createElement("p")
        tituloTelefonoInfo.textContent = "Telefono del titular de la reserva"
        tituloTelefonoInfo.classList.add(
            "paddinHorizontal6"
        )
        contenedorTitular.appendChild(tituloTelefonoInfo)

        const contenedorNumero = document.createElement("div")
        contenedorNumero.classList.add(
            "gridHorizontal2C_personalizado",
        )
        contenedorTitular.appendChild(contenedorNumero)


        const listaCodigosInternacionales = await this.listaCodigosInternacionalUI()
        console.log("listaCodigosInternacionales", listaCodigosInternacionales)
        listaCodigosInternacionales.value = "+1"
        contenedorNumero.appendChild(listaCodigosInternacionales)

        const campoTelefonoTitular = document.createElement("input")
        campoTelefonoTitular.style.borderBottomLeftRadius = "0px"
        campoTelefonoTitular.style.borderTopLeftRadius = "0px"
        campoTelefonoTitular.style.borderBottomRightRadius = "14px"
        campoTelefonoTitular.style.borderTopRightRadius = "14px"
        campoTelefonoTitular.classList.add(
            "campoTitular"
        )
        campoTelefonoTitular.placeholder = "Teléfono del titular de la reserva"
        campoTelefonoTitular.setAttribute("campo", "telefonoTitular")
        campoTelefonoTitular.value = "3333"
        contenedorNumero.appendChild(campoTelefonoTitular)

        const tituloMailInfo = document.createElement("p")
        tituloMailInfo.textContent = "Correo electrónico titular de la reserva"
        tituloMailInfo.classList.add(
            "paddinHorizontal6"
        )
        contenedorTitular.appendChild(tituloMailInfo)

        const campoMailTitular = document.createElement("input")
        campoMailTitular.classList.add(
            "campoTitular"
        )
        campoMailTitular.placeholder = "Correo del titular de la reserva"
        campoMailTitular.setAttribute("campo", "correoTitular")
        campoMailTitular.value = "test@test.com"
        contenedorTitular.appendChild(campoMailTitular)

        contenedor.appendChild(this.descuentos.contenedorCodigoDescuentos.ui())


        const contenedorTotal = document.createElement("div")
        contenedorTotal.classList.add(
            "flexVertical",
            "gap14"
        )
        contenedor.appendChild(contenedorTotal)


        const infoTotal = document.createElement("p")
        infoTotal.classList.add(
            "textoCentrado"
        )
        infoTotal.textContent = "Total a pagar:"
        contenedorTotal.appendChild(infoTotal)


        const totalData = document.createElement("p")
        totalData.setAttribute("data", "totalFinal")
        totalData.classList.add(
            "textoCentrado",
            "negrita",
            "textSize16"
        )
        totalData.textContent = "Calculando..."
        contenedorTotal.appendChild(totalData)

        const botonDesplegarDesglose = document.createElement("p")
        botonDesplegarDesglose.setAttribute("boton", "desplegarDesglose")
        botonDesplegarDesglose.style.display = "none"
        botonDesplegarDesglose.classList.add(
            "textoCentrado",
            "botonV1",
            "comportamientoBoton"
        )

        botonDesplegarDesglose.textContent = "Ver el desglose detallado del total"
        botonDesplegarDesglose.addEventListener("click", this.desplegarDesgloseFinancieroBajoDemanda)
        contenedorTotal.appendChild(botonDesplegarDesglose)

        const infoPreConfirmar = document.createElement("p")
        infoPreConfirmar.classList.add(
            "padding14"
        )
        //infoPreConfirmar.textContent = "Para continuar con el proceso de reserva, haz clic en el botón de abajo. Una vez verifiquemos las fechas solicitadas. Nos pondremos en contacto con usted, por mail o por teléfono para comunicarle el estado de su reserva. Posteriormente, abriremos un plazo de 48 horas para queda realizar el depósito. Si pasado este plazo no se ha realizado el depósito no podemos garantizar su reserva. Si tiene algún problema o duda, póngase en contacto con nosotros."
        contenedor.appendChild(infoPreConfirmar)

        const infoAceptacion = document.createElement("p")
        infoAceptacion.classList.add(
            "padding14"
        )
        infoAceptacion.textContent = "Preconfirmar esta reserva implica la aceptación de nuestras políticas de privacidad y el consentimiento para su aplicación, así como nuestras políticas de cancelación de la reserva. Por favor, lea detenidamente toda la información sobre nuestras políticas de privacidad, el uso de cookies y las condiciones de uso haciendo clic aquí."
        contenedor.appendChild(infoAceptacion)

        const portilicasCancelacion = document.createElement("details")
        portilicasCancelacion.classList.add(
            "areaSinDecoracionPredeterminada",
            "padding6",
            "backgroundGrey1",
            "borderRadius14",
        )

        contenedor.appendChild(portilicasCancelacion)

        const tituloPoliticasCancelacion = document.createElement("summary")
        tituloPoliticasCancelacion.classList.add("margin0", "padding10", "sobreControlAnimacionGlobal")
        tituloPoliticasCancelacion.textContent = "Ver politícas de cancelación y normas de funcionamiento"
        portilicasCancelacion.appendChild(tituloPoliticasCancelacion)

        const infoPolCan = document.createElement("p")
        infoPolCan.classList.add("padding10")
        infoPolCan.textContent = `Para recibir un reembolso completo deberás cancelar al menos 30 días antes de la llegada.
        Sí, entre siete y 30 días antes de que empieza la estancia deberás pagar un importe correspondiente al 50% de las noches reservadas.
        Si cancelas cuando faltan menos de 7 días para que comience la estancia, deberás pagar el 100% de todas las noches.`
        portilicasCancelacion.appendChild(infoPolCan)

        const portilicasPrivacida = document.createElement("a")
        portilicasPrivacida.classList.add(
            "areaSinDecoracionPredeterminada",
            "padding14"
        )
        portilicasPrivacida.href = "/politicas/privacidad"
        portilicasPrivacida.target = "_blank"
        portilicasPrivacida.textContent = "Ver políticas de privacidad, condiciones de uso y gestión de cookies. (Se abrirá otra ventana del navegador.)"
        contenedor.appendChild(portilicasPrivacida)

        const botonConfirmar = document.createElement("div")
        botonConfirmar.classList.add(
            "blackgroundWhite30O",
            "textoCentrado",
            "borderRadius14",
            "padding14",
            "comportamientoBoton",
            "negrita",
            "noSelecionable",
            "retonDefault"
        )
        botonConfirmar.setAttribute("boton", "preConfirmar")
        botonConfirmar.textContent = "Enviar mensaje de solicitud de la fechas para comprobar la disponibilidad"
        botonConfirmar.addEventListener("click", (e) => {
            this.preConfirmar(e)
        })
        contenedor.appendChild(botonConfirmar)
        return contenedor

    },
    bloqueAlojamientoUI: async function (data) {
        const instanciaUID = data.instanciaUID
        const reservaLocal = data.reservaLocal
        const fechaEntrada = reservaLocal.fechaEntrada
        const fechaSalida = reservaLocal.fechaSalida
        const alojamiento = reservaLocal.alojamiento
        const uiDestinno = document.querySelector(`[instanciaUID="${instanciaUID}"] [data=alojamiento]`)

        const spinnerSimple = casaVitini.ui.componentes.spinnerSimple()
        uiDestinno.appendChild(spinnerSimple)

        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "plaza/reservas/apartamentosDisponiblesPublico",
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida
        })

        if (!document.querySelector(`[instanciaUID="${instanciaUID}"]`)) {
            return
        }

        if (respuestaServidor?.error) {
            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor.ok) {
            const apartamentosDisponibles = respuestaServidor?.ok.apartamentosDisponibles
            const contenedorFinanciero = respuestaServidor?.ok.contenedorFinanciero
            const complementosAlojamiento = respuestaServidor?.ok.complementosAlojamiento

            uiDestinno.innerHTML = null
            const contenedorUI = document.createElement("div")
            contenedorUI.classList.add(
                "gridHorizontal2C_resp",
                "gap14",
            )
            uiDestinno.appendChild(contenedorUI)
            for (const [apartamentoIDV, contenedor] of Object.entries(alojamiento)) {
                if (!apartamentosDisponibles.hasOwnProperty(apartamentoIDV)) {
                    delete alojamiento[apartamentoIDV]
                    continue
                }

                const apartamentoUI = apartamentosDisponibles[apartamentoIDV].apartamentoUI
                const apartamentoUIPublico = apartamentosDisponibles[apartamentoIDV].apartamentoUIPublico
                const definicionPublica = apartamentosDisponibles[apartamentoIDV].definicionPublica
                const complementosAlojamientoArray = complementosAlojamiento[apartamentoIDV]
                const habitaciones = apartamentosDisponibles[apartamentoIDV].habitaciones




                const bloqueApartamento = document.createElement("div")
                bloqueApartamento.setAttribute("class", "bloqueApartamenteo")
                bloqueApartamento.setAttribute("apartamentoIDV", apartamentoIDV)

                const nombreContenedor = document.createElement("div")
                nombreContenedor.classList.add("flexVertical", "padding14")
                bloqueApartamento.appendChild(nombreContenedor)


                const tituloApartamentoComponenteUI = document.createElement("p")
                tituloApartamentoComponenteUI.setAttribute("class", "negrita")
                tituloApartamentoComponenteUI.setAttribute("apartamentoUI", apartamentoUI)
                tituloApartamentoComponenteUI.textContent = apartamentoUIPublico
                nombreContenedor.appendChild(tituloApartamentoComponenteUI)


                const definicionPublicaUI = document.createElement("p")
                definicionPublicaUI.setAttribute("class", "negrita")
                definicionPublicaUI.textContent = definicionPublica
                nombreContenedor.appendChild(definicionPublicaUI)


                const contenedorComplementos = document.createElement("div")
                contenedorComplementos.classList.add(
                    "flexVertical", "gap6", "padding6", "borderRadius18", "backgroundGrey1"
                )

                const tituloComplementos = document.createElement("p")
                tituloComplementos.classList.add("padding6", "textoCentrado")
                tituloComplementos.textContent = "Complementos del alojamiento"
                contenedorComplementos.appendChild(tituloComplementos)

                complementosAlojamientoArray.forEach((comp) => {
                    const complementoUI = this.componentesAlojamiento.componentesUI(comp)
                    contenedorComplementos.appendChild(complementoUI)
                })

                if (complementosAlojamientoArray.length > 0) {
                    bloqueApartamento.appendChild(contenedorComplementos)
                }








                const contenedorHabitaciones = document.createElement("div")
                contenedorHabitaciones.classList.add("flexVertical")
                bloqueApartamento.appendChild(contenedorHabitaciones)

                const habitacionesArray = Object.entries(habitaciones);
                const ultimaIteracion = habitacionesArray.length - 1;

                for (let i = 0; i < habitacionesArray.length; i++) {
                    const [habitacionIDV, contenedor] = habitacionesArray[i];
                    const habitacionUI = contenedor.habitacionUI
                    const configuracionesCama = contenedor.configuraciones
                    const bloqueHabitaciones = document.createElement("div")
                    bloqueHabitaciones.classList.add("plaza_alojamiento_resumenReserva_bloqueHabitaciones")
                    const bloqueHabitacion = document.createElement("div")
                    bloqueHabitacion.setAttribute("class", "plaza_alojamiento_resumenReserva_bloqueHabitacion")
                    bloqueHabitacion.setAttribute("habitacionIDV", habitacionIDV)
                    contenedorHabitaciones.appendChild(bloqueHabitacion)
                    const tituloHabitacion = document.createElement("p")
                    tituloHabitacion.setAttribute("class", "tituloBloqueHabitacion")
                    tituloHabitacion.setAttribute("habitacionUI", habitacionUI)
                    tituloHabitacion.textContent = habitacionUI
                    bloqueHabitacion.appendChild(tituloHabitacion)
                    if (Object.entries(configuracionesCama).length > 1) {
                        const selectorCama = document.createElement("select")
                        selectorCama.classList.add("selectorCama")
                        selectorCama.setAttribute("componente", "selectorCama")
                        selectorCama.addEventListener("change", (e) => {
                            const apartamentoIDV = e.target.closest("[apartamentoIDV]").getAttribute("apartamentoIDV")
                            const habitacionIDV = e.target.closest("[habitacionIDV]").getAttribute("habitacionIDV")
                            const camaIDV = e.target.value
                            const camaUI = e.target.options[e.target.selectedIndex].getAttribute("camaUI");

                            const reservaIN = JSON.parse(sessionStorage.getItem("preReservaLocal"))
                            const apartamentoObjeto = reservaIN.alojamiento[apartamentoIDV]
                            if (!apartamentoObjeto.hasOwnProperty("habitaciones")) {
                                apartamentoObjeto.habitaciones = {}
                            }
                            const habitaciones = apartamentoObjeto.habitaciones
                            if (!habitaciones.hasOwnProperty(habitacionIDV)) {
                                habitaciones[habitacionIDV] = {}
                            }
                            const habitacion = habitaciones[habitacionIDV]
                            habitacion.camaSeleccionada = {
                                camaIDV: camaIDV,
                                //camaUI: camaUI
                            }
                            const reservaOUT = JSON.stringify(reservaIN)
                            sessionStorage.setItem("preReservaLocal", reservaOUT)
                        })
                        const opcionPreterminada = document.createElement("option");
                        opcionPreterminada.value = "";
                        opcionPreterminada.selected = "true"
                        opcionPreterminada.disabled = "true"
                        opcionPreterminada.text = "Seleccionar tipo de cama";
                        selectorCama.add(opcionPreterminada);
                        for (const configuracionCama of Object.entries(configuracionesCama)) {
                            const camaIDV = configuracionCama[1].camaIDV
                            const camaUI = configuracionCama[1].camaUI
                            const capacidad = configuracionCama[1].capacidad
                            const opcion = document.createElement("option");
                            opcion.value = camaIDV;
                            opcion.setAttribute("camaUI", camaUI)
                            opcion.text = camaUI + ` (Capacidad: ${capacidad})`;
                            selectorCama.add(opcion);
                        }
                        bloqueHabitacion.appendChild(selectorCama)
                    } else {
                        const configuracionUnica = Object.entries(configuracionesCama)
                        const camaUI = configuracionUnica[0][1].camaUI
                        const camaIDV = configuracionUnica[0][1].camaIDV

                        const camaUnica = document.createElement("div")
                        camaUnica.classList.add("plaza_alojamiento_resumenReserva_camaUnicaInfo")
                        if (i === ultimaIteracion) {
                            camaUnica.style.paddingBottom = "4px"
                        }
                        camaUnica.textContent = camaUI
                        bloqueHabitacion.appendChild(camaUnica)
                        const reservaIN = JSON.parse(sessionStorage.getItem("preReservaLocal"))
                        const alojamiento = reservaIN.alojamiento[apartamentoIDV]
                        if (!alojamiento.hasOwnProperty("habitaciones")) {
                            alojamiento.habitaciones = {}
                        }
                        const habitaciones = alojamiento.habitaciones
                        if (!habitaciones.hasOwnProperty(habitacionIDV)) {
                            habitaciones[habitacionIDV] = {}
                        }
                        const habitacion = habitaciones[habitacionIDV]
                        habitacion.camaSeleccionada = {
                            camaIDV: camaIDV,
                            camaUI: camaUI
                        }
                        const reservaOUT = JSON.stringify(reservaIN)
                        //  sessionStorage.setItem("preReservaLocal", reservaOUT)
                    }
                }
                contenedorUI.appendChild(bloqueApartamento)
            }
        }
    },
    preConfirmar: async function (e) {
        const botonOrigen = e.target
        const estadoBoton = botonOrigen.getAttribute("estado")
        if (estadoBoton === "proc") {

            return
        }
        botonOrigen.setAttribute("estado", "proc")
        const main = document.querySelector("main")
        const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()

        const contenedor = ui.querySelector("[componente=contenedor]")
        main.appendChild(ui)

        const spinner = casaVitini.ui.componentes.spinnerSimple()
        contenedor.appendChild(spinner)

        const reservaPublica = sessionStorage.getItem("preReservaLocal") ? JSON.parse(sessionStorage.getItem("preReservaLocal")) : {};
        const nombreTitular = document.querySelector("[campo=nombreTitular]").value
        //const pasaporteTitular = document.querySelector("[campo=pasaporteTitular]").value
        const correoTitular = document.querySelector("[campo=correoTitular]").value
        const codigoInternacional = document.querySelector("[campo=codigoInternacional]").value
        const telefonoTitular = document.querySelector("[campo=telefonoTitular]").value
        reservaPublica.titular = {
            nombreTitular: nombreTitular,
            //   pasaporteTitular: pasaporteTitular,
            correoTitular: correoTitular,
            telefonoTitular: telefonoTitular,
            codigoInternacional: codigoInternacional
        }


        const codigosRenderizados = []
        document.querySelectorAll("[contenedor=ofertasComprobadas] [codigosUID]").forEach((ofertaRenderizada) => {
            const codigosUID = JSON.parse(ofertaRenderizada.getAttribute("codigosUID"))
            const descuentoUI = ofertaRenderizada.querySelector("[data=descuentoUI]").textContent
            const ofertaUID = ofertaRenderizada.getAttribute("ofertaUID")

            codigosRenderizados.push({
                codigosUID,
                descuentoUI,
                ofertaUID
            })
        })

        if (codigosRenderizados.length === 0) {
            delete reservaPublica.codigosDescuento
        } else {
            reservaPublica.codigosDescuento = codigosRenderizados
        }

        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "plaza/reservas/preConfirmarReserva",
            reserva: reservaPublica
        })
        botonOrigen.removeAttribute("estado")
        if (respuestaServidor?.error) {

            contenedor.innerHTML = null
            if (respuestaServidor?.contenedorErrorInfoObsoleta) {

                const errorUI = this.errorUI(respuestaServidor?.contenedorErrorInfoObsoleta)
                contenedor.appendChild(errorUI)
                this.actualizarPrecioEnUI({
                    aplicarUIData: "si"
                })
            } else {
                const info = document.createElement("p")
                info.classList.add("padding10", "textoCentrado")
                info.textContent = respuestaServidor.error
                contenedor.appendChild(info)
            }

            const botonCancelar = document.createElement("div")
            botonCancelar.classList.add("botonV1")
            botonCancelar.textContent = "Aceptar y volver"
            botonCancelar.addEventListener("click", () => {
                return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
            })
            contenedor.appendChild(botonCancelar)

        } else if (respuestaServidor.ok) {
            const reservaConfirmada = respuestaServidor.detalles
            reservaConfirmada.pdf = respuestaServidor.pdf
            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
            sessionStorage.removeItem("preReservaLocal");
            localStorage.setItem("reservaConfirmada", JSON.stringify(reservaConfirmada))

            return casaVitini.shell.navegacion.controladorVista({
                vista: "/alojamiento/reserva_confirmada",
            })
        }
    },
    seleccionarCama: function (datosCama) {
        const apartamentoIDV = datosCama.apartamentoIDV
        const habitacionIDV = datosCama.habitacionIDV
        const camaIDV = datosCama.camaIDV
        const selectorApartamento = document.querySelector(`[apartamentoIDV="${apartamentoIDV}"]`)
        selectorApartamento.setAttribute("estadoApartamento", "seleccionado")
        const selectorSelectorApartamento = selectorApartamento.querySelector("[componente=selectorApartamento]")
        selectorSelectorApartamento.textContent = "Apartamento seleccionado"
        const selectorInfoHabitacion = selectorApartamento
            .querySelector(`[habitacionIDV='${habitacionIDV}']`)
            .querySelector("[componente=infoSeleccionCama]")
        const botonesCamasPorHabitacion = selectorApartamento
            .querySelector(`[habitacionIDV='${habitacionIDV}']`)
            .querySelectorAll("[componente=botonSelectorCama]")
        const botonCama = selectorApartamento
            .querySelector(`[habitacionIDV="${habitacionIDV}"]`)
            .querySelector(`[camaIDV="${camaIDV}"]`)
        const estadoCama = selectorApartamento
            .querySelector(`[habitacionIDV="${habitacionIDV}"]`)
            .querySelector(`[camaIDV="${camaIDV}"]`)
            ?.getAttribute("estadoCama")
        if (estadoCama === "camaSeleccionada") {
            botonCama.removeAttribute("style")
            botonCama.removeAttribute("estadoCama")
            selectorInfoHabitacion.classList.add("parpadea")
        } else {
            botonesCamasPorHabitacion.forEach((botonCamaEnHabitacion) => {
                botonCamaEnHabitacion.removeAttribute("style")
                botonCamaEnHabitacion.removeAttribute("estadoCAma")
            })
            botonCama.style.background = "green"
            botonCama.setAttribute("estadoCama", "camaSeleccionada")
            selectorInfoHabitacion.classList.remove("parpadea")
        }
    },
    obtenerContenedorFinanciero: async function (data) {
        const reservaNoConfirmada = sessionStorage.getItem("preReservaLocal") ? JSON.parse(sessionStorage.getItem("preReservaLocal")) : null;

        const aplicarUIData = data?.aplicarUIData
        if (aplicarUIData === "si") {
            const complementosAlojamientoSeleccionados = []
            document.querySelectorAll(`[complementoUID][estado="activado"]`).forEach((e) => {
                const complementoUID = e.getAttribute("complementoUID")
                const complementoUI = e.querySelector("[data=complementoUI]").textContent
                complementosAlojamientoSeleccionados.push({
                    complementoUID,
                    complementoUI
                })
            })
            if (complementosAlojamientoSeleccionados.length === 0) {
                delete reservaNoConfirmada.complementosAlojamiento
            } else {
                reservaNoConfirmada.complementosAlojamiento = complementosAlojamientoSeleccionados
            }


            const serviciosSelecionados = []
            document.querySelectorAll(`[servicioUID][estadoServicio=selCompleta]`).forEach((servicioUISelecionado) => {
                const servicioUID = servicioUISelecionado.getAttribute("servicioUID")
                const grupoDeOpciones = servicioUISelecionado.querySelector("[area=grupoOpciones]").querySelectorAll("[componente=grupo]")
                const servicioSeleccionado = {
                    servicioUID,
                    opcionesSeleccionadas: {}
                }
                const opcionesSeleccionadas = servicioSeleccionado.opcionesSeleccionadas
                grupoDeOpciones.forEach((grupo) => {
                    const grupoIDV = grupo.getAttribute("grupoIDV")
                    opcionesSeleccionadas[grupoIDV] = []
                    const opcionesDelGrupoSeleccionadas = grupo.querySelectorAll("[selector=opcion][estado=activado]")
                    opcionesDelGrupoSeleccionadas.forEach(opcionSel => {
                        const opcionIDV = opcionSel.getAttribute("opcionIDV")
                        opcionesSeleccionadas[grupoIDV].push(opcionIDV)
                    })
                })
                serviciosSelecionados.push(servicioSeleccionado)
            })

            if (serviciosSelecionados.length === 0) {
                delete reservaNoConfirmada.servicios
            } else {
                reservaNoConfirmada.servicios = serviciosSelecionados
            }

            const codigosRenderizados = []
            document.querySelectorAll("[contenedor=ofertasComprobadas] [ofertaUID]").forEach((ofertaRenderizada) => {
                const ofertaUID = ofertaRenderizada.getAttribute("ofertaUID")
                const codigosUID = JSON.parse(ofertaRenderizada.getAttribute("codigosUID")) || []
                const descuentoUI = ofertaRenderizada.querySelector("[data=descuentoUI]").textContent

                codigosRenderizados.push({
                    ofertaUID,
                    codigosUID,
                    descuentoUI
                })
            })
            if (codigosRenderizados.length === 0) {
                delete reservaNoConfirmada.codigosDescuento
            } else {
                reservaNoConfirmada.codigosDescuento = codigosRenderizados
            }
        }

        if (reservaNoConfirmada) {
            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "componentes/precioReservaPublica",
                reserva: reservaNoConfirmada
            })

            return respuestaServidor
        }

    },
    actualizarPrecioEnUI: async function (data) {
        const aplicarUIData = data?.aplicarUIData
        if (aplicarUIData !== "no" && aplicarUIData !== "si") {
            const m = "aplicarUIData tiene que estar ne si o no"
            return casaVitini.ui.componentes.advertenciaInmersiva(m)
        }
        const selectorBotonDesplegarDesglose = document.querySelector("[boton=desplegarDesglose]")
        if (selectorBotonDesplegarDesglose) {
            selectorBotonDesplegarDesglose.style.transition = "all 0ms linear"
            selectorBotonDesplegarDesglose.style.opacity = "0"
            selectorBotonDesplegarDesglose.style.pointerEvents = "none"
        }

        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const selectorTotalFinal = document.querySelector("[data=totalFinal]")
        if (selectorTotalFinal) {
            selectorTotalFinal.setAttribute("instanciaUID", instanciaUID)
            selectorTotalFinal.textContent = "Actualizando el total..."
        }

        const contenedorFinanciero = await this.obtenerContenedorFinanciero({
            aplicarUIData: aplicarUIData
        })

        const selectorTotalDestino = document.querySelector(`[data=totalFinal][instanciaUID="${instanciaUID}"]`)
        if (selectorTotalDestino) {
            if (contenedorFinanciero?.error) {
                return casaVitini.ui.componentes.advertenciaInmersiva(contenedorFinanciero?.error)
            }

            const reservaNoConfirmada = sessionStorage.getItem("preReservaLocal") ? JSON.parse(sessionStorage.getItem("preReservaLocal")) : null;
            const control = contenedorFinanciero?.control

            const serviciosSiReconocidos = control?.servicios?.serviciosSiReconocidos || []
            const serviciosNoReconocidos = control?.servicios?.serviciosNoReconocidos || []
            const codigosDescuentosSiReconocidos = control?.codigosDescuentos?.codigosDescuentosSiReconocidos || []
            const codigosDescuentosNoReconocidos = control?.codigosDescuentos?.codigosDescuentosNoReconocidos || []

            const complementosSiReconocidos = control?.complementosAlojamiento?.complementosSiReconocidos || []
            const complementosNoReconocidos = control?.complementosAlojamiento?.complementosNoReconocidos || []

            codigosDescuentosSiReconocidos.forEach((contenedor) => {

                const codigosUID = contenedor.codigosUID
                codigosUID.forEach((codigoUID, i) => {
                    codigosUID[i] = codigoUID
                })
            })


            // codigosDescuentosNoReconocidos.forEach((contenedor) => {

            //     const codigosUID = contenedor.codigosUID
            //     codigosUID.forEach((codigoUID, i) => {
            //         codigosUID[i] = codigoUID
            //     })
            // })


            if (serviciosSiReconocidos.length > 0) {
                reservaNoConfirmada.servicios = serviciosSiReconocidos
            } else {
                delete reservaNoConfirmada?.servicios
            }
            if (codigosDescuentosSiReconocidos.length > 0) {
                reservaNoConfirmada.codigosDescuento = codigosDescuentosSiReconocidos
            } else {
                delete reservaNoConfirmada.codigosDescuento
            }

            if (complementosSiReconocidos.length > 0) {
                reservaNoConfirmada.complementosAlojamiento = complementosSiReconocidos.map(c => {
                    return {
                        complementoUI: c.complementoUI,
                        complementoUID: c.complementoUID
                    }
                })
            } else {
                delete reservaNoConfirmada?.complementosAlojamiento
            }

            complementosNoReconocidos.forEach((contenedor) => {
                const complementoUID = contenedor.complementoUID
                document.querySelector(`[complementoUID="${complementoUID}"]`)?.remove()
            })
            complementosSiReconocidos.forEach((contenedor) => {
                const complementoUID = contenedor.complementoUID
                const complementoUI = document.querySelector(`[complementoUID="${complementoUID}"]`)
                complementoUI.setAttribute("estado", "activado")
                complementoUI.querySelector("[componente=indicadorSelecion]").style.background = "rgb(0, 255, 0)"

            })

            const serviciosObsoletos = []
            serviciosNoReconocidos.forEach((contenedor) => {
                const servicioUID = contenedor.servicioUID
                const servicioUI = document.querySelector(`[contenedor=servicios] [servicioUID="${servicioUID}"]`)
                if (servicioUI) {
                    const tituloServicioObsoleto = servicioUI.querySelector("[data=servicioUI]").textContent
                    serviciosObsoletos.push(tituloServicioObsoleto)
                }
                servicioUI?.remove()
            })

            if (serviciosObsoletos.length > 0) {
                // Mirar de controlar cuando salte eso
                // this.servicios.infoServiciosObsoletos(serviciosObsoletos)
            }

            serviciosSiReconocidos.forEach((contenedor) => {
                const servicioUID = contenedor.servicioUID
                const opcionesSeleccionadas = contenedor.opcionesSeleccionadas
                const servicioUI = document.querySelector(`[contenedor=servicios] [servicioUID="${servicioUID}"]`)
                servicioUI.setAttribute("estadoServicio", "selCompleta")
                servicioUI.querySelector("[componente=indicadorSelecion]").style.background = "rgb(0, 255, 0)"

                Object.entries(opcionesSeleccionadas).forEach(([grupoIDV, contenedorSel]) => {
                    const selectorGrupo = servicioUI.querySelector(`[grupoIDV="${grupoIDV}"]`)
                    contenedorSel.forEach(opcionIDV => {
                        const selectorOpcion = selectorGrupo.querySelector(`[opcionIDV="${opcionIDV}"]`)
                        selectorOpcion.setAttribute("estado", "activado")
                        selectorOpcion.querySelector("[componente=indicadorSelecion]").style.background = "rgb(0, 255, 0)"
                    })
                })
            })
            const selectorServicioUI = document.querySelector("[componente=espacioConfirmarReserva] [contenedor=serviciosUI]")
            const serviciosUI = selectorServicioUI.querySelectorAll(`[servicioUID]`)

            if (serviciosUI.length === 0) {
                selectorServicioUI.classList.add("ocultoInicial")
            }

            codigosDescuentosNoReconocidos.forEach((contenedor) => {
                const codigosUID = contenedor.codigosUID
                const ofertaObsoleta = document.querySelector(`[contenedor=ofertasComprobadas] [codigosUID='${JSON.stringify(codigosUID)}']`)
                ofertaObsoleta?.remove()

            })
            sessionStorage.setItem("preReservaLocal", JSON.stringify(reservaNoConfirmada))

            const totalFinal = contenedorFinanciero.desgloseFinanciero.global.totales.totalFinal
            selectorTotalDestino.textContent = totalFinal + "$"
            selectorTotalDestino.setAttribute("contenedorFinanciero", JSON.stringify(contenedorFinanciero.desgloseFinanciero))
            selectorBotonDesplegarDesglose.removeAttribute("style")
        }
    },
    limpiezaObjetoLocalPreEnvio: async function () {
        const reservaNoConfirmada = sessionStorage.getItem("preReservaLocal") ? JSON.parse(sessionStorage.getItem("preReservaLocal")) : {};
        if (reservaNoConfirmada.hasOwnProperty("alojamiento")) {
            for (const alojamiento of Object.values(reservaNoConfirmada.alojamiento)) {
                const habitaciones = alojamiento.habitaciones
                if (habitaciones) {
                    for (const habitacion of Object.values(habitaciones)) {
                        delete habitacion.configuraciones
                    }
                }

            }
        }
        return reservaNoConfirmada

    },
    controlPrevioEnvioDatos: async function () {
        try {

            const selectoresCamas = document.querySelectorAll("[componente=selectorCama]")
            selectoresCamas.forEach((selectorCama) => {
                if (!selectorCama.value) {
                    const apartamentoUI = selectorCama.closest("[apartamentoIDV]")
                        .querySelector("[apartamentoUI]")
                        .getAttribute("apartamentoUI")
                    const habitacionUI = selectorCama.closest("[habitacionIDV]")
                        .querySelector("[habitacionUI]")
                        .getAttribute("habitacionUI")
                    const errorCamas = `Atención, es necesario que seleccione qué tipo de cama quiere para la ${habitacionUI} del ${apartamentoUI}.`
                    throw new Error(errorCamas)
                }
            })

            const nombreTitular = document.querySelector("[campo=nombreTitular]").value
            const pasaporteTitular = document.querySelector("[campo=pasaporteTitular]").value
            const telefonoTitular = document.querySelector("[campo=telefonoTitular]").value
            let correoTitular = document.querySelector("[campo=correoTitular]").value
            const filtroCorreoElectronico = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;
            correoTitular = correoTitular
                .trim()
                .toLowerCase()
            const filtroTelefono = /[^0-9+\s]/
            if (!nombreTitular) {
                const errorCamas = `Por favor escriba el nombre completo del titular de la reserva`
                throw new Error(errorCamas)
            } else if (!pasaporteTitular) {
                const errorCamas = `Por favor escriba el pasaporte completo del titular de la reserva`
                throw new Error(errorCamas)
            }
            else if (!telefonoTitular || filtroTelefono.test(telefonoTitular)) {
                const errorTelefono = "En el campo teléfono solo pueden contener números y el símbolo + para el código internacional. Revisa el campo teléfono por favor.";
                throw new Error(errorTelefono);
            }
            else if (!correoTitular || !filtroCorreoElectronico.test(correoTitular)) {
                const error = "El campo de correo electrónico no cumple con el formato esperado, se espera un formato tal que así: ejemplo@servidor.com"
                throw new Error(error)
            }
        } catch (errorCapturado) {
            throw errorCapturado
        }
    },
    desplegarDesgloseFinancieroBajoDemanda: async function () {
        const main = document.querySelector("main")
        const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada({
            alineacion: "arriba"
        })
        const instanciaUID = ui.getAttribute("instanciaUID")
        const contenedor = ui.querySelector("[componente=contenedor]")
        main.appendChild(ui)

        const spinner = casaVitini.ui.componentes.spinnerSimple()
        contenedor.appendChild(spinner)




        contenedor.innerHTML = null

        const titulo = document.createElement("div")
        titulo.classList.add(
            "tituloGris",
            "padding10",
            "textoCentrado"
        )
        titulo.textContent = "Desglose del resumen su reserva (Su reserva aun no esta confirmada)"
        contenedor.appendChild(titulo)


        const testInfo = document.createElement("div")
        testInfo.classList.add(
            "textoCentrado", "padding10"
        )
        testInfo.textContent = "Aquí tienes el desglose de importe total de la reserva, detallando los cargos, impuestos y conceptos asociados."
        contenedor.appendChild(testInfo)

        const botonCerrar = document.createElement("div")
        botonCerrar.classList.add("botonV1")
        botonCerrar.textContent = "Cerrar y volver"
        botonCerrar.setAttribute("boton", "cancelar")
        botonCerrar.addEventListener("click", () => {
            return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
        })
        contenedor.appendChild(botonCerrar)
        const desgloseFinanciero = JSON.parse(document.querySelector("[contenedorFinanciero]").getAttribute("contenedorFinanciero"))

        casaVitini.ui.componentes.contenedorFinanciero.constructor({
            destino: `[instanciaUID="${instanciaUID}"] [componente=contenedor]`,
            contenedorFinanciero: { desgloseFinanciero },
            modoUI: "plaza"
        })
        const contenedorFinancieroUI = ui.querySelector("[contenedor=financiero]")
        contenedorFinancieroUI.classList.add(
            "borderRadius10"
        )

        const botonCerrarInferior = document.createElement("div")
        botonCerrarInferior.classList.add("botonV1")
        botonCerrarInferior.textContent = "Cerrar y volver"
        botonCerrarInferior.setAttribute("boton", "cancelar")
        botonCerrarInferior.addEventListener("click", () => {
            return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
        })
        contenedor.appendChild(botonCerrarInferior)
    },
    errorUI: function (data) {

        const arrayInfoObsoleta = data

        const ui = document.createElement("div")
        ui.classList.add("flexVertical")


        const titulo = document.createElement("p")
        titulo.classList.add("negrita", "textoCentrado", "padding10")
        titulo.textContent = "No se ha confirmado la reserva"
        ui.appendChild(titulo)


        const mensaje = document.createElement("p")
        mensaje.classList.add("negrita", "textoCentrado", "padding10")
        mensaje.textContent = "Durante la realización de su reserva, algunos elementos han dejado de estar disponibles. A continuación, se detallan los elementos afectados. Asimismo, se ha actualizado su resumen, eliminando los elementos que ya no están disponibles, y se ha ajustado el precio en consecuencia."
        ui.appendChild(mensaje)


        const dic = {
            servicios: "servicioUI",
            codigosDescuento: "descuentoUI"
        }
        const contenedorDesgloses = document.createElement("div")
        contenedorDesgloses.classList.add(
            "flexVertical",
            "gap6"
        )
        ui.appendChild(contenedorDesgloses)

        const selectorTituloUI = (data) => {
            const uid = data.uid
            const tipoIDV = data.tipoIDV

            if (tipoIDV === "servicios") {
                return document.querySelector(`[servicioUID="${uid}"] [data=servicioUI]`).textContent

            } else if (tipoIDV === "codigosDescuento") {
                return document.querySelector(`[ofertaUID="${uid}"] [data=descuentoUI]`).textContent

            }
        }

        arrayInfoObsoleta.forEach((c) => {
            const infoError = c.error
            const lista = c.lista
            const tipo = c.tipo

            const contenedorUI = document.createElement("div")
            contenedorUI.classList.add(
                "padding14",
                "borderGrey1",
                "borderRadius16"
            )
            contenedorDesgloses.appendChild(contenedorUI)

            const infoUI = document.createElement("p")
            infoUI.textContent = infoError
            contenedorUI.appendChild(infoUI)

            const contenedorLista = document.createElement("div")
            contenedorLista.classList.add(
                "flexVertical"
            )
            contenedorUI.appendChild(contenedorLista)


            lista.forEach((detalleLista) => {

                let uid
                if (tipo === "servicios") {
                    uid = detalleLista.servicioUID

                } else if (tipo === "codigosDescuento") {
                    uid = detalleLista.ofertaUID

                }


                const elementoUI = document.createElement("p")
                elementoUI.classList.add(
                    "negrita"
                )
                elementoUI.textContent = selectorTituloUI({
                    tipoIDV: tipo,
                    uid: uid
                })
                contenedorLista.appendChild(elementoUI)
            })


        })
        return ui
    },
    descuentos: {
        contenedorCodigoDescuentos: {
            ui: function () {
                const contenedor = document.createElement("div")
                contenedor.setAttribute("area", "codigosDescuentos")
                contenedor.classList.add(
                    "flexVertical",
                    "gap6",
                    "borderGrey1",
                    "padding6",
                    "borderRadius24"
                )
                const ofertasComprobadas = document.createElement("div")
                ofertasComprobadas.setAttribute("contenedor", "ofertasComprobadas")
                ofertasComprobadas.classList.add(
                    "flexVertical",
                    "gap6"

                )
                contenedor.appendChild(ofertasComprobadas)
                const campos = document.createElement("div")
                campos.setAttribute("contenedor", "camposDescuentos")
                campos.classList.add(
                    "flexVertical",
                    "gap6"
                )
                campos.appendChild(this.estadoInicial())
                contenedor.appendChild(campos)
                return contenedor
            },
            estadoInicial: function () {
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()

                const contenedor = document.createElement("div")
                contenedor.setAttribute("instanciaUID", instanciaUID)
                contenedor.classList.add(
                    "flexVertical",
                    "gap6"
                )

                const info = document.createElement("div")
                info.classList.add(
                    "padding6",
                    "textoCentrado"
                )
                info.textContent = "Si tienes un código de descuento, insértalo aquí para agregar el descuento a tu reserva. Una vez comprobado el código, confirma tu reserva."
                contenedor.appendChild(info)

                const campoUI = document.createElement("input")
                campoUI.setAttribute("campo", "codigoDescuento")
                campoUI.classList.add(
                    "padding12",
                    "borderRadius10",
                )
                campoUI.placeholder = "Inserta tu código de descuento"


                const botonUsar = document.createElement("div")
                botonUsar.classList.add(
                    "botonV1",
                    "comportamientoBoton"
                )
                botonUsar.textContent = "Usar código de descuento"
                botonUsar.addEventListener("click", (e) => {
                    const instanciaUID = e.target.closest("[instanciaUID]").getAttribute("instanciaUID")





                })

                contenedor.appendChild(this.uiCodigosMultiples({
                    instanciaUID: instanciaUID
                }))

                return contenedor
            },
            compobrobarCodigo: async function (data) {
                const main = document.querySelector("main")
                const areaCamposDescuentos = document.querySelector("[area=codigosDescuentos]")
                const contenedorListaDescuentos = areaCamposDescuentos.querySelector("[contenedor=listaDescuentos]")
                const camposRenderizados = contenedorListaDescuentos.querySelectorAll("[campo=codigoDescuento]")
                const codigosArray = []
                camposRenderizados.forEach((campo) => {
                    const codigo = campo.value
                    if (codigo.length > 0) {
                        codigosArray.push(codigo)
                    }
                })

                const instanciaUID_vistaOrigen = document.querySelector("main").getAttribute("instanciaUID")
                const reservaLocal = JSON.parse(sessionStorage.getItem("preReservaLocal"))

                const contendedorCodigosActuales = reservaLocal?.codigosDescuento || []


                const codidosActuales = []
                contendedorCodigosActuales.forEach((contenedor) => {
                    const codigosUID = contenedor.codigosUID
                    codigosUID.forEach((codigoUID) => {
                        codidosActuales.push(codigoUID)
                    })
                })

                const codigosRepeditos = []
                codidosActuales.map((codigoActual) => {
                    if (codigosArray.includes(codigoActual)) {
                        codigosRepeditos.push(codigoActual)
                    }
                })


                if (codigosRepeditos.length === 1) {
                    const m = `El código ${codigosRepeditos[0]} insertado ya esta aderido a la reserva`
                    return casaVitini.ui.componentes.advertenciaInmersiva(m)
                } else if (codigosRepeditos.length > 1) {
                    const codigosUI = casaVitini.utilidades.cadenas.constructorComasEY({
                        array: codigosRepeditos
                    })
                    const m = `Los códigos ${codigosUI} ya estan insertados aderidos al la reserva`
                    return casaVitini.ui.componentes.advertenciaInmersiva(m)
                }

                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                ui.style.justifyContent = "center"
                ui.querySelector("[componente=titulo]")?.remove()
                ui.querySelector("[componente=mensajeUI]").style.alignItems = "center"
                ui.querySelector("[componente=mensajeUI]").textc = "center"
                ui.querySelector("[boton=aceptar]").style.display = "none"
                ui.querySelector("[boton=cancelar]").style.display = "none"
                main.appendChild(ui)
                const contenedor = ui.querySelector("[componente=contenedor]")
                const spinner = casaVitini.ui.componentes.spinner({
                    textoBoton: "",
                    mensaje: "Comprobando código...",
                    visibilidadBoton: "no"
                })
                contenedor.appendChild(spinner)

                const instanciaUID_formularioOrigen = casaVitini.utilidades.codigoFechaInstancia()
                areaCamposDescuentos.setAttribute("instanciaUID", instanciaUID_formularioOrigen)

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "plaza/reservas/preComprobarCodigoDescuento",
                    reserva: reservaLocal,
                    codigoDescuento: codigosArray
                })



                if (!ui) { return }
                spinner?.remove()

                if (respuestaServidor?.error) {
                    ui.querySelector("[boton=cancelar]").removeAttribute("style")
                    ui.querySelector("[boton=cancelar]").textContent = "Aceptar y volver al resumen de la reserva"


                    if (respuestaServidor.hasOwnProperty("ofertas")) {
                        return this.errorUICondiciones(respuestaServidor)
                    } else {
                        ui.querySelector("[componente=mensajeUI]").textContent = respuestaServidor.error
                    }
                }
                if (respuestaServidor.ok) {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    const ofertas = respuestaServidor.ofertas
                    const formularioOrigen = document.querySelector(`[instanciaUID="${instanciaUID_formularioOrigen}"`)

                    if (!reservaLocal.hasOwnProperty("codigosDescuento")) {
                        reservaLocal.codigosDescuento = []
                    }
                    const selectorContenedorOfertas = document.querySelector(`[contenedor=ofertasComprobadas]`)

                    ofertas.forEach((oferta) => {
                        const ofertaUID = oferta.oferta.ofertaUID
                        const nombreOferta = oferta.oferta.nombreOferta
                        const descuentosJSON = oferta.oferta.descuentosJSON
                        const condicionesArray = oferta.oferta.condicionesArray

                        const codgosDeLaOferta = []
                        condicionesArray.forEach((condicion) => {
                            const tipoCondicion = condicion.tipoCondicion
                            if (tipoCondicion === "porCodigoDescuento") {
                                const codigoDescuento = condicion.codigoDescuento
                                const decodedBytes = Uint8Array.from(atob(codigoDescuento), c => c.charCodeAt(0))
                                const codigoDescuentoUTF = new TextDecoder().decode(decodedBytes)

                                codgosDeLaOferta.push(codigoDescuentoUTF)
                            }
                        })

                        const contenedorDescuentoComprobnado = {
                            ofertaUID: ofertaUID,
                            codigosUID: codgosDeLaOferta,
                            descuentoUI: nombreOferta
                        }
                        reservaLocal.codigosDescuento.push(contenedorDescuentoComprobnado)
                        const ofertaUI = this.ofertaUI({
                            ofertaUID,
                            nombreOferta,
                            descuentosJSON,
                            condicionesArray,
                            codigos: codgosDeLaOferta,
                            botonEliminar: "activado"

                        })
                        selectorContenedorOfertas.appendChild(ofertaUI)
                    })
                    sessionStorage.setItem("preReservaLocal", JSON.stringify(reservaLocal))
                }
                await this.actualizarPrecioEnUI({
                    aplicarUIData: "si"
                })
            },
            recuperarOfertasPorArrayDeCodigos: async function () {
                const reservaLocal = JSON.parse(sessionStorage.getItem("preReservaLocal"))
                const codigosArray = []
                reservaLocal.codigosDescuento.map((contenedor) => {
                    const codigosUID = contenedor.codigosUID
                    codigosUID.forEach((codigo) => {
                        codigosArray.push(codigo)
                    })
                })
                const c = {
                    zona: "plaza/reservas/preComprobarCodigoDescuento",
                    reserva: reservaLocal,
                    codigoDescuento: codigosArray
                }

                const respuestaServidor = await casaVitini.shell.servidor(c)
                const selectorContenedorOfertas = document.querySelector(`[contenedor=ofertasComprobadas]`)
                selectorContenedorOfertas.innerHTML = null
                if (respuestaServidor?.error) {
                    if (respuestaServidor?.code === "badCodeOffer") {
                        const m = "Algunos códigos de descuento han sido actualizados y eliminados, por lo que ahora están obsoletos para tu reserva."
                        casaVitini.ui.componentes.advertenciaInmersiva(m)
                    } else {
                        casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.error)
                    }
                }
                if (respuestaServidor.ok) {
                    const ofertas = respuestaServidor.ofertas


                    let contenedorCodigoParaObjeto = []
                    ofertas.forEach((oferta) => {
                        const ofertaUID = oferta.oferta.ofertaUID
                        const nombreOferta = oferta.oferta.nombreOferta
                        const descuentosJSON = oferta.oferta.descuentosJSON
                        const condicionesArray = oferta.oferta.condicionesArray

                        const codigosValidados = []
                        for (const condicion of condicionesArray) {
                            const tipoCondicion = condicion.tipoCondicion
                            if (tipoCondicion === "porCodigoDescuento") {
                                const codigoDescuentoB64 = condicion.codigoDescuento
                                const decodedBytes = Uint8Array.from(atob(codigoDescuentoB64), c => c.charCodeAt(0))
                                const codigoDescuentoUTF = new TextDecoder().decode(decodedBytes)

                                if (codigosArray.includes(codigoDescuentoUTF)) {
                                    codigosValidados.push(codigoDescuentoUTF)
                                }
                            }
                        }
                        const ofertaUI = this.ofertaUI({
                            ofertaUID,
                            nombreOferta,
                            descuentosJSON,
                            condicionesArray,
                            codigos: codigosValidados,
                            botonEliminar: "activado"
                        })
                        selectorContenedorOfertas.appendChild(ofertaUI)

                        const estructuraCodigoObjeto = {
                            ofertaUID,
                            descuentoUI: nombreOferta,
                            codigosUID: codigosValidados
                        }
                        contenedorCodigoParaObjeto.push(estructuraCodigoObjeto)
                    })
                    reservaLocal.codigosDescuento = contenedorCodigoParaObjeto
                    sessionStorage.setItem("preReservaLocal", JSON.stringify(reservaLocal))
                }


            },
            borrarCodigo: async (ofertaUID_paraBorrar) => {
                const reservaLocal = JSON.parse(sessionStorage.getItem("preReservaLocal"))
                const codigosActuales = reservaLocal?.codigosDescuento || []

                codigosActuales.forEach((contendor) => {
                    const ofertaUID = contendor.ofertaUID
                    if (ofertaUID === ofertaUID_paraBorrar) {
                        delete contendor
                    }
                })
                if (codigosActuales.length === 0) {
                    delete reservaLocal?.codigosDescuento
                }
                sessionStorage.setItem("preReservaLocal", JSON.stringify(reservaLocal))
                await this.actualizarPrecioEnUI({
                    aplicarUIData: "si"
                })
            },
            ofertaUI: function (data) {
                const ofertaUID = data.ofertaUID
                const nombreOferta = data.nombreOferta
                const descuentosJSON = data.descuentosJSON
                const condicionesArray = data.condicionesArray
                const codigos = data.codigos
                const botonEliminar = data.botonEliminar


                const contenedorOfertaComprobada = document.createElement("div")
                contenedorOfertaComprobada.setAttribute("ofertaUID", ofertaUID)
                contenedorOfertaComprobada.setAttribute("codigosUID", JSON.stringify(codigos))

                contenedorOfertaComprobada.classList.add(
                    "flexVertical",
                    "gap6",
                    "borderGrey1",
                    "padding6",
                    "borderRadius20"

                )

                const tituloOferta = document.createElement("div")
                tituloOferta.setAttribute("data", "descuentoUI")
                tituloOferta.classList.add(
                    "padding14",
                    "negrita"
                )
                tituloOferta.innerHTML = nombreOferta
                contenedorOfertaComprobada.appendChild(tituloOferta)

                const info = document.createElement("div")
                info.classList.add(
                    "padding6"
                )
                info.innerHTML = "Oferta adherida a tu reserva. Ahora puedes confirmar la reserva y la oferta ser adherida"





                const contenedorCondiciones = document.createElement("div")
                contenedorCondiciones.classList.add(
                    "flexVertical"
                )
                contenedorCondiciones.appendChild(this.condicionesUI({ condicionesArray }))
                contenedorOfertaComprobada.appendChild(contenedorCondiciones)

                const contenedorDescuentos = document.createElement("div")
                contenedorDescuentos.classList.add(
                    "flexVertical"
                )
                contenedorDescuentos.appendChild(this.descuentosUI({
                    descuentosJSON
                }))
                contenedorOfertaComprobada.appendChild(contenedorDescuentos)



                if (botonEliminar === "activado") {
                    const botonDesaderir = document.createElement("div")
                    botonDesaderir.classList.add(
                        "botonV1",
                        "comportameintoBoton"
                    )
                    botonDesaderir.textContent = "Eliminar codigo de descuento"
                    botonDesaderir.addEventListener("click", async (e) => {
                        e.target.closest("[ofertaUID]").remove()
                        await this.borrarCodigo(ofertaUID)
                    })
                    contenedorOfertaComprobada.appendChild(botonDesaderir)
                }

                return contenedorOfertaComprobada
            },
            descuentosUI: (data) => {
                const descuentosJSON = data.descuentosJSON
                const tipoDescuento = descuentosJSON?.tipoDescuento
                const subTipoDescuento = descuentosJSON?.subTipoDescuento

                const contenedorDescuentos = document.createElement("div")
                contenedorDescuentos.setAttribute("contenedor", "descuentos")
                contenedorDescuentos.classList.add(
                    "flexVertical",
                    "backgroundGrey1",
                    "padding6",
                    "borderRadius14"
                )
                const tituloContendor = document.createElement("div")
                tituloContendor.classList.add(
                    "negrita",
                    "padding6",
                )
                tituloContendor.textContent = "Descuentos de la oferta"
                contenedorDescuentos.appendChild(tituloContendor)

                const desfinicionDescuento = casaVitini
                    .ui
                    .componentes
                    .contenedorFinanciero
                    .componentesUI
                    .ofertas
                    .componentesUI.definicionDescuentos({
                        tipoDescuento,
                        subTipoDescuento,
                        descuentosJSON
                    })
                contenedorDescuentos.appendChild(desfinicionDescuento)

                return contenedorDescuentos
            },
            condicionesUI: (data) => {
                const condicionesArray = data.condicionesArray

                const contenedorCondiciones = document.createElement("div")
                contenedorCondiciones.setAttribute("contenedor", "condiciones")
                contenedorCondiciones.classList.add(
                    "flexVertical",
                    "gap6",
                    "backgroundGrey1",
                    "padding6",
                    "borderRadius14"
                )

                const tituloContendor = document.createElement("div")
                tituloContendor.classList.add(
                    "negrita",
                    "padding6",

                )
                tituloContendor.textContent = "Condiciones de la oferta"
                contenedorCondiciones.appendChild(tituloContendor)

                contenedorCondiciones.querySelectorAll("[tipoCondicion]").forEach((contenedorTipoCondicion) => {
                    contenedorTipoCondicion.remove()
                })

                condicionesArray.forEach((condicion) => {
                    const tipoCondicion = condicion.tipoCondicion

                    const contenedorCondicion = document.createElement("div")
                    contenedorCondicion.classList.add("contenedorCondicion")
                    contenedorCondicion.setAttribute("tipoCondicion", tipoCondicion)
                    contenedorCondicion.classList.add(
                        "flexVertical",
                        "padding6",
                    )
                    const definicionCondicion = casaVitini
                        .ui
                        .componentes
                        .contenedorFinanciero
                        .componentesUI
                        .ofertas
                        .componentesUI
                        .definicionCondiciones({
                            tipoCondicion,
                            condicion
                        })
                    contenedorCondicion.appendChild(definicionCondicion)
                    contenedorCondiciones.appendChild(contenedorCondicion)
                })
                return contenedorCondiciones
            },
            errorUICondiciones: function (data) {

                const mensajeError = data.error
                const ofertas = data.ofertas

                const main = document.querySelector("main")
                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                const instanciaUID = ui.getAttribute("instanciaUID")
                const contenedor = ui.querySelector("[componente=contenedor]")
                main.appendChild(ui)


                const info = document.createElement("div")
                info.classList.add(
                    "textoCentrado"
                )
                info.textContent = mensajeError
                contenedor.appendChild(info)

                const botonCerrarInferior = document.createElement("div")
                botonCerrarInferior.classList.add("botonV1")
                botonCerrarInferior.textContent = "Cerrar y volver"
                botonCerrarInferior.setAttribute("boton", "cancelar")
                botonCerrarInferior.addEventListener("click", () => {
                    return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                })
                contenedor.appendChild(botonCerrarInferior)

                ofertas.forEach((oferta) => {
                    const nombreOferta = oferta.oferta.nombreOferta
                    const descuentosJSON = oferta.oferta.descuentosJSON
                    const condicionesArray = oferta.oferta.condicionesArray












                    const ofertaUI = this.ofertaUI({
                        nombreOferta,
                        descuentosJSON,
                        condicionesArray,
                        codigo: null,
                    })
                    contenedor.appendChild(ofertaUI)
                })

            },
            uiCodigosMultiples: function (data) {
                const contenedorZonaCodigo = document.createElement("div")
                contenedorZonaCodigo.setAttribute("contenedor", "codigosDescuento")
                contenedorZonaCodigo.classList.add(
                    "flexVertical",
                    "gap6",
                    "backgroundGrey1",
                    "padding6",
                    "borderRadius20"
                )


                const contendorBotonesCampoCodigoDescuento = document.createElement("div")
                contendorBotonesCampoCodigoDescuento.classList.add(
                    "flexHorizontal",
                    "flexApiladoI",
                )
                contenedorZonaCodigo.appendChild(contendorBotonesCampoCodigoDescuento)


                const botonAgregarCampoCodigoDescuento = document.createElement("div")
                botonAgregarCampoCodigoDescuento.classList.add(
                    "botonV1"
                )
                botonAgregarCampoCodigoDescuento.textContent = "Agregar codigo de descuento"
                botonAgregarCampoCodigoDescuento.addEventListener("click", () => {

                    const contenedorCodigosDecuentos = document.querySelector("[contenedor=codigosDescuento]")
                    const lista = contenedorCodigosDecuentos.querySelector("[contenedor=listaDescuentos]")
                    lista.removeAttribute("style")
                    const contenedorCampoUI = this.contenedorCampo()
                    lista.appendChild(contenedorCampoUI)

                    const botonComprobar = this.botonComprobar()
                    const selectorBotonComprobar_renderizado = contenedorCodigosDecuentos.querySelector("[boton=comprobar]")
                    if (!selectorBotonComprobar_renderizado) {
                        contenedorCodigosDecuentos.appendChild(botonComprobar)
                    }
                })
                contendorBotonesCampoCodigoDescuento.appendChild(botonAgregarCampoCodigoDescuento)



                const contenedorCodigosDescuentosPorVerificar = document.createElement("div")
                contenedorCodigosDescuentosPorVerificar.setAttribute("contenedor", "listaDescuentos")
                contenedorCodigosDescuentosPorVerificar.style.display = "none"
                contenedorCodigosDescuentosPorVerificar
                contenedorCodigosDescuentosPorVerificar.classList.add(
                    "flexVertical",
                    "gap6",
                )
                contenedorZonaCodigo.appendChild(contenedorCodigosDescuentosPorVerificar)
                return contenedorZonaCodigo

            },
            infoInit: () => {
                const info = document.createElement("div")
                info.classList.add(
                    "flexVertical"
                )
                info.textContent = "Añada descuentos para verificarlos"
                return info
            },
            descuentoUI: (data) => {
                const descuentoBASE64 = data.descuentoBASE64

                const contenedor = document.createElement("div")
                contenedor.classList.add(
                    "flexVertical"
                )
                const info = document.createElement("p")
                info.textContent = descuentoBASE64
                contenedor.appendChild(info)

                const botonEliminar = document.createElement("p")
                botonEliminar.textContent = "Elimnar codigo descuento"
                contenedor.appendChild(botonEliminar)

                return contenedor
            },
            contenedorCampo: (data) => {

                const campoData = data?.campoData || ""

                const contenedor = document.createElement("div")
                contenedor.style.gridTemplateColumns = "1fr auto"
                contenedor.setAttribute("componente", "campoDescuento")
                contenedor.classList.add(
                    "gridHorizontal2C",
                    "gap6",
                    "padding6",
                    "borderRadius20",
                    "borderGrey1"
                )

                const campoCodigo = document.createElement("input")
                campoCodigo.setAttribute("campo", "codigoDescuento")
                campoCodigo.classList.add(
                    "padding10",
                    "borderRadius16",
                )
                campoCodigo.placeholder = "Inserta un codigo de descuento para comprobar"
                campoCodigo.value = campoData
                contenedor.appendChild(campoCodigo)

                const botonComprobar = document.createElement("div")
                botonComprobar.classList.add(
                    "padding10",
                    "borderRadius8",
                    "botonV1",
                )
                botonComprobar.textContent = "Eliminar"
                botonComprobar.addEventListener("click", (e) => {

                    const contenedorDescuentos = e.target.closest("[contenedor=codigosDescuento]")
                    const numeroCampos = contenedorDescuentos.querySelectorAll("[componente=campoDescuento]")
                    if (numeroCampos.length === 1) {
                        contenedorDescuentos.querySelector("[boton=comprobar]")?.remove()
                        const lista = contenedorDescuentos.querySelector("[contenedor=listaDescuentos]")
                        lista.style.display = "none"
                    }
                    const contenedorCampo = e.target.closest("[componente=campoDescuento]")
                    contenedorCampo?.remove()
                })
                contenedor.appendChild(botonComprobar)
                return contenedor
            },
            botonComprobar: function () {
                const boton = document.createElement("div")
                boton.setAttribute("boton", "comprobar")
                boton.classList.add(
                    "botonV1"
                )
                boton.textContent = "Comprobar codigo."
                boton.addEventListener("click", () => {
                    this.compobrobarCodigo()
                })
                return boton
            },
        }
    },
    servicios: {
        controladorSelectorServicios: (e) => {
            const servicioUI = e.target.closest("[servicioUID]")
            const selectorIndicador = servicioUI.querySelector("[componente=indicadorSelecion]")
            const estadoActual = servicioUI.getAttribute("estado")

            if (estadoActual === "activado") {
                servicioUI.removeAttribute("estado")
                selectorIndicador.removeAttribute("style")

            } else {
                servicioUI.setAttribute("estado", "activado")
                selectorIndicador.style.background = "#00ff00"
            }
            this.actualizarPrecioEnUI({
                aplicarUIData: "si"
            })

        },
        renderizarServiciosPublicos: async function () {
            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const selectorContenedorServicios = document.querySelector("[contenedor=servicios]")
            if (selectorContenedorServicios) {
                selectorContenedorServicios.setAttribute("instanciaUID", instanciaUID)
                selectorContenedorServicios.innerHTML = null
                selectorContenedorServicios.textContent = "Obteniendo servicios..."
            }

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "plaza/reservas/obtenerServiciosPublicos",
            })
            if (respuestaServidor?.error) {
                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                const selector_UI_enEspera = document.querySelector(`[contenedor=servicios][instanciaUID="${instanciaUID}"]`)
                if (selector_UI_enEspera) {


                    const listaServiciosPublicos = respuestaServidor.servicios
                    selectorContenedorServicios.innerHTML = null
                    listaServiciosPublicos.forEach(servicio => {

                        const servicioUID = servicio.servicioUID
                        const contenedor = servicio.contenedor

                        const servicioUI = casaVitini.view.__sharedMethods__.servicioUI({
                            servicioUID,
                            contenedor
                        })

                        const opciones = servicioUI.querySelectorAll("[opcionIDV]")
                        opciones.forEach((o) => {
                            o.addEventListener("click", () => {
                                return casaVitini.view.actualizarPrecioEnUI({
                                    aplicarUIData: "si"
                                })
                            })
                        })
                        selectorContenedorServicios.appendChild(servicioUI)

                        const selectorServicioUI = document.querySelector("[componente=espacioConfirmarReserva] [contenedor=serviciosUI]")

                        if (listaServiciosPublicos.length > 0) {
                            selectorServicioUI.classList.remove("ocultoInicial")
                        } else {
                            selectorServicioUI.classList.add("ocultoInicial")

                        }
                    })

                }
            }
        },
        // servicioUI: function (data) {

        //     const servicioUID = data.servicioUID
        //     const contenedor = data.contenedor
        //     const gruposDeOpciones = contenedor.gruposDeOpciones
        //     const definicion = contenedor.definicion
        //     const fechaFinal = contenedor.fechaFinal
        //     const duracionIDV = contenedor.duracionIDV
        //     const fechaInicio = contenedor.fechaInicio
        //     const tituloPublico = contenedor.tituloPublico
        //     const disponibilidadIDV = contenedor.disponibilidadIDV

        //     const diccionario = {
        //         disponibilidad: {
        //             constante: "Disponible",
        //             variable: "Disponibilidad variable"
        //         }
        //     }

        //     const servicioUI = document.createElement("details")
        //     servicioUI.setAttribute("servicioUID", servicioUID)
        //     servicioUI.classList.add(
        //         "flexVertical",
        //         "padding6",
        //         "backgroundGrey1",
        //         "sobreControlAnimacionGlobal",
        //         "borderRadius18",

        //     )

        //     const contenedorGlobal = document.createElement("summary")
        //     contenedorGlobal.classList.add(
        //         "contenedorGlobal",
        //         "margin0",
        //         "borderRadius14",
        //         "padding6",
        //     )
        //     servicioUI.appendChild(contenedorGlobal)

        //     const iconoDetails = document.createElement("div")
        //     iconoDetails.style.display = "list-item"
        //     iconoDetails.style.padding = "0px"
        //     iconoDetails.style.marginTop = "0px"
        //     iconoDetails.style.marginBottom = "0px"
        //     iconoDetails.style.marginLeft = "6px"
        //     iconoDetails.style.marginRight = "0px"
        //     iconoDetails.textContent = ""
        //     iconoDetails.classList.add(
        //         "padding6",
        //     )
        //     contenedorGlobal.appendChild(iconoDetails)

        //     const esferaSeleccionable = document.createElement("div")
        //     esferaSeleccionable.classList.add(
        //         "esferaSeleccionable"
        //     )
        //     contenedorGlobal.appendChild(esferaSeleccionable)

        //     const indicadorDeSeleccion = document.createElement("div")
        //     indicadorDeSeleccion.setAttribute("componente", "indicadorSelecion")
        //     indicadorDeSeleccion.setAttribute("indicador", "global")
        //     indicadorDeSeleccion.classList.add(
        //         "indicadorDeSeleccion"
        //     )
        //     esferaSeleccionable.appendChild(indicadorDeSeleccion)

        //     const titulo = document.createElement("p")
        //     titulo.setAttribute("data", "servicioUI")
        //     titulo.classList.add(
        //         "padding6",
        //         "negrita"
        //     )
        //     titulo.textContent = tituloPublico
        //     contenedorGlobal.appendChild(titulo)

        //     const disponibilidadUI = document.createElement("p")
        //     disponibilidadUI.classList.add(
        //         "padding6"
        //     )
        //     disponibilidadUI.textContent = diccionario.disponibilidad[disponibilidadIDV]
        //     servicioUI.appendChild(disponibilidadUI)

        //     if (disponibilidadIDV === "variable") {

        //         const info = document.createElement("p")
        //         info.classList.add(
        //             "padding6"
        //         )
        //         info.textContent = `Este servicio tiene una disponibilidad limitada. Es por eso que si selecciona este servicio, nos pondremos en contacto con el titular de la reserva en las próximas horas para confirmarle la disponibilidad del servicio para su reserva.`
        //         servicioUI.appendChild(info)
        //     }

        //     if (duracionIDV === "rango") {
        //         const contenedorDuracion = document.createElement("div")
        //         contenedorDuracion.classList.add(
        //             "flexVertical",
        //             "padding6"

        //         )
        //         servicioUI.appendChild(contenedorDuracion)

        //         const info = document.createElement("p")
        //         info.classList.add("negrita")
        //         info.textContent = `Servicio disponible solo desde ${fechaInicio} hata ${fechaFinal}. Ambas fechas incluidas.`
        //         contenedorDuracion.appendChild(info)

        //     }
        //     const definicionUI = document.createElement("pre")
        //     definicionUI.classList.add(
        //         "padding6",
        //         "whiteSpace"
        //     )
        //     definicionUI.textContent = definicion
        //     servicioUI.appendChild(definicionUI)

        //     const componentesUI = casaVitini.ui.componentes.serviciosUI
        //     const cgdoUI = componentesUI.contenedor_gruposDeOpciones()
        //     servicioUI.appendChild(cgdoUI)

        //     Object.entries(gruposDeOpciones).forEach(([grupoIDV, go]) => {
        //         const nombreGrupo = go.nombreGrupo


        //         const configuracionGrupo = go.configuracionGrupo
        //         const grupoDeOpciones = componentesUI.grupoDeOpciones()
        //         grupoDeOpciones.querySelector("[data=titulo]").textContent = nombreGrupo
        //         grupoDeOpciones.setAttribute("grupoIDV", grupoIDV)
        //         grupoDeOpciones.setAttribute("conf", JSON.stringify(configuracionGrupo))
        //         cgdoUI.appendChild(grupoDeOpciones)

        //         const opcionesGrupo = go.opcionesGrupo
        //         opcionesGrupo.forEach((og) => {
        //             const nombreOpcion = og.nombreOpcion
        //             const precioOpcion = og.precioOpcion
        //             const opcionIDV = og.opcionIDV


        //             const opcionUI = componentesUI.opcionUI()
        //             opcionUI.addEventListener("click", (e) => {
        //                 componentesUI.controladorSeleccion(e)
        //             })
        //             opcionUI.setAttribute("opcionIDV", opcionIDV)
        //             opcionUI.querySelector("[data=opcionUI]").textContent = nombreOpcion
        //             grupoDeOpciones.appendChild(opcionUI)
        //         })
        //     })
        //     return servicioUI
        // },
        infoServiciosObsoletos: (serviciosObsoletos) => {
            const main = document.querySelector("main")
            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
            const instanciaUID = ui.getAttribute("instanciaUID")
            const contenedor = ui.querySelector("[componente=contenedor]")
            main.appendChild(ui)

            const titulo = document.createElement("div")
            titulo.classList.add(
                "tituloGris",
                "padding10",
                "textoCentrado"
            )
            titulo.textContent = "Hay servicios que usted ha seleccionado que se han actualizado."
            contenedor.appendChild(titulo)

            const info = document.createElement("div")
            info.classList.add(
                "padding10",
                //   "textoCentrado"
            )
            info.textContent = `Estimado/a visitante,
Durante el proceso de selección de servicios, algunos de ellos han sido actualizados. Para asegurarnos de que el proceso cumpla con sus expectativas, hemos actualizado la interfaz con la nueva información disponible, y hemos deseleccionado los servicios que han cambiado. Le pedimos amablemente que revise nuevamente su selección para confirmar que todo esté acorde a sus preferencias.
Este ajuste se ha realizado porque, mientras realizaba su selección, algunos servicios experimentaron modificaciones en su oferta. Queremos garantizarle que dispone de la información más actualizada para tomar su decisión.
Gracias por su comprensión y disculpe las molestias ocasionadas.
Servicios que usted habia seleccionado y que han experimentado una actualización:`
            contenedor.appendChild(info)


            const contenedorTitulosObsoletos = document.createElement("div")
            contenedorTitulosObsoletos.classList.add(
                "flexVertical",
                "gap6",

            )
            contenedor.appendChild(contenedorTitulosObsoletos)

            serviciosObsoletos.forEach((tituloObsoleto) => {

                const tituloObsoletoUI = document.createElement("div")
                tituloObsoletoUI.classList.add(
                    "padding14",
                    "borderGrey1",
                    "borderRadius16"
                )
                tituloObsoletoUI.textContent = tituloObsoleto
                contenedorTitulosObsoletos.appendChild(tituloObsoletoUI)
            })

            const botonCerrar = document.createElement("div")
            botonCerrar.classList.add("botonV1")
            botonCerrar.textContent = "Cerrar y volver"
            botonCerrar.setAttribute("boton", "cancelar")
            botonCerrar.addEventListener("click", () => {
                return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
            })
            contenedor.appendChild(botonCerrar)
        }
    },
    listaCodigosInternacionalUI: async function () {

        const codigosInternacionales = [
            { pais: "Afganistán", codigo: "+93" },
            { pais: "Albania", codigo: "+355" },
            { pais: "Alemania", codigo: "+49" },
            { pais: "Andorra", codigo: "+376" },
            { pais: "Angola", codigo: "+244" },
            { pais: "Argentina", codigo: "+54" },
            { pais: "Armenia", codigo: "+374" },
            { pais: "Australia", codigo: "+61" },
            { pais: "Austria", codigo: "+43" },
            { pais: "Azerbaiyán", codigo: "+994" },
            { pais: "Bahamas", codigo: "+1-242" },
            { pais: "Bahréin", codigo: "+973" },
            { pais: "Bangladés", codigo: "+880" },
            { pais: "Barbados", codigo: "+1-246" },
            { pais: "Bélgica", codigo: "+32" },
            { pais: "Bielorrusia", codigo: "+375" },
            { pais: "Bolivia", codigo: "+591" },
            { pais: "Bosnia y Herzegovina", codigo: "+387" },
            { pais: "Botsuana", codigo: "+267" },
            { pais: "Brasil", codigo: "+55" },
            { pais: "Brunéi", codigo: "+673" },
            { pais: "Bulgaria", codigo: "+359" },
            { pais: "Cabo Verde", codigo: "+238" },
            { pais: "Camboya", codigo: "+855" },
            { pais: "Canadá", codigo: "+1" },
            { pais: "Chile", codigo: "+56" },
            { pais: "China", codigo: "+86" },
            { pais: "Colombia", codigo: "+57" },
            { pais: "Comoras", codigo: "+269" },
            { pais: "Corea del Norte", codigo: "+850" },
            { pais: "Corea del Sur", codigo: "+82" },
            { pais: "Costa Rica", codigo: "+506" },
            { pais: "Croacia", codigo: "+385" },
            { pais: "Cuba", codigo: "+53" },
            { pais: "Dinamarca", codigo: "+45" },
            { pais: "Dominica", codigo: "+1-767" },
            { pais: "Ecuador", codigo: "+593" },
            { pais: "Egipto", codigo: "+20" },
            { pais: "El Salvador", codigo: "+503" },
            { pais: "Emiratos Árabes Unidos", codigo: "+971" },
            { pais: "Eslovaquia", codigo: "+421" },
            { pais: "Eslovenia", codigo: "+386" },
            { pais: "España", codigo: "+34" },
            { pais: "Estados Unidos", codigo: "+1" },
            { pais: "Estonia", codigo: "+372" },
            { pais: "Eswatini", codigo: "+268" },
            { pais: "Etiopía", codigo: "+251" },
            { pais: "Filipinas", codigo: "+63" },
            { pais: "Finlandia", codigo: "+358" },
            { pais: "Francia", codigo: "+33" },
            { pais: "Gabón", codigo: "+241" },
            { pais: "Gambia", codigo: "+220" },
            { pais: "Georgia", codigo: "+995" },
            { pais: "Ghana", codigo: "+233" },
            { pais: "Grecia", codigo: "+30" },
            { pais: "Guatemala", codigo: "+502" },
            { pais: "Guinea", codigo: "+224" },
            { pais: "Guinea Ecuatorial", codigo: "+240" },
            { pais: "Guyana", codigo: "+592" },
            { pais: "Haití", codigo: "+509" },
            { pais: "Honduras", codigo: "+504" },
            { pais: "Hungría", codigo: "+36" },
            { pais: "India", codigo: "+91" },
            { pais: "Indonesia", codigo: "+62" },
            { pais: "Irán", codigo: "+98" },
            { pais: "Irak", codigo: "+964" },
            { pais: "Irlanda", codigo: "+353" },
            { pais: "Islandia", codigo: "+354" },
            { pais: "Islas Caimán", codigo: "+1-345" },
            { pais: "Islas Malvinas", codigo: "+500" },
            { pais: "Islas Marshall", codigo: "+692" },
            { pais: "Islas Salomón", codigo: "+677" },
            { pais: "Italia", codigo: "+39" },
            { pais: "Jamaica", codigo: "+1-876" },
            { pais: "Japón", codigo: "+81" },
            { pais: "Jordania", codigo: "+962" },
            { pais: "Kazajistán", codigo: "+7" },
            { pais: "Kenia", codigo: "+254" },
            { pais: "Kirguistán", codigo: "+996" },
            { pais: "Kiribati", codigo: "+686" },
            { pais: "Kuwait", codigo: "+965" },
            { pais: "Laos", codigo: "+856" },
            { pais: "Letonia", codigo: "+371" },
            { pais: "Líbano", codigo: "+961" },
            { pais: "Liberia", codigo: "+231" },
            { pais: "Libia", codigo: "+218" },
            { pais: "Liechtenstein", codigo: "+423" },
            { pais: "Lituania", codigo: "+370" },
            { pais: "Luxemburgo", codigo: "+352" },
            { pais: "Malasia", codigo: "+60" },
            { pais: "Malawi", codigo: "+265" },
            { pais: "Maldivas", codigo: "+960" },
            { pais: "Mali", codigo: "+223" },
            { pais: "Malta", codigo: "+356" },
            { pais: "Marruecos", codigo: "+212" },
            { pais: "Mauricio", codigo: "+230" },
            { pais: "Mauritania", codigo: "+222" },
            { pais: "México", codigo: "+52" },
            { pais: "Moldavia", codigo: "+373" },
            { pais: "Mónaco", codigo: "+377" },
            { pais: "Mongolia", codigo: "+976" },
            { pais: "Mozambique", codigo: "+258" },
            { pais: "Namibia", codigo: "+264" },
            { pais: "Nepal", codigo: "+977" },
            { pais: "Nicaragua", codigo: "+505" },
            { pais: "Nigeria", codigo: "+234" },
            { pais: "Noruega", codigo: "+47" },
            { pais: "Nueva Zelanda", codigo: "+64" },
            { pais: "Omán", codigo: "+968" },
            { pais: "Pakistán", codigo: "+92" },
            { pais: "Palaos", codigo: "+680" },
            { pais: "Panamá", codigo: "+507" },
            { pais: "Papúa Nueva Guinea", codigo: "+675" },
            { pais: "Paraguay", codigo: "+595" },
            { pais: "Países Bajos", codigo: "+31" },
            { pais: "Perú", codigo: "+51" },
            { pais: "Polonia", codigo: "+48" },
            { pais: "Portugal", codigo: "+351" },
            { pais: "Reino Unido", codigo: "+44" },
            { pais: "República Centroafricana", codigo: "+236" },
            { pais: "República Checa", codigo: "+420" },
            { pais: "República del Congo", codigo: "+242" },
            { pais: "República Dominicana", codigo: "+1-809" },
            { pais: "Rumania", codigo: "+40" },
            { pais: "Rusia", codigo: "+7" },
            { pais: "Rwanda", codigo: "+250" },
            { pais: "Samoa", codigo: "+685" },
            { pais: "San Cristóbal y Nieves", codigo: "+1-869" },
            { pais: "San Marino", codigo: "+378" },
            { pais: "Santa Lucía", codigo: "+1-758" },
            { pais: "Santo Tomé y Príncipe", codigo: "+239" },
            { pais: "Senegal", codigo: "+221" },
            { pais: "Serbia", codigo: "+381" },
            { pais: "Seychelles", codigo: "+248" },
            { pais: "Singapur", codigo: "+65" },
            { pais: "Siria", codigo: "+963" },
            { pais: "Somalia", codigo: "+252" },
            { pais: "Sudáfrica", codigo: "+27" },
            { pais: "Sudán", codigo: "+249" },
            { pais: "Sudán del Sur", codigo: "+211" },
            { pais: "Suecia", codigo: "+46" },
            { pais: "Suiza", codigo: "+41" },
            { pais: "Tailandia", codigo: "+66" },
            { pais: "Taiwán", codigo: "+886" },
            { pais: "Tanzania", codigo: "+255" },
            { pais: "Tayikistán", codigo: "+992" },
            { pais: "Togo", codigo: "+228" },
            { pais: "Tonga", codigo: "+676" },
            { pais: "Trinidad y Tobago", codigo: "+1-868" },
            { pais: "Túnez", codigo: "+216" },
            { pais: "Turkmenistán", codigo: "+993" },
            { pais: "Turquía", codigo: "+90" },
            { pais: "Tuvalu", codigo: "+688" },
            { pais: "Uganda", codigo: "+256" },
            { pais: "Ucrania", codigo: "+380" },
            { pais: "Emiratos Árabes Unidos", codigo: "+971" },
            { pais: "Repub. de Macedonia del Norte", codigo: "+389" },
            { pais: "Vanuatu", codigo: "+678" },
            { pais: "Vaticano", codigo: "+39" },
            { pais: "Venezuela", codigo: "+58" },
            { pais: "Vietnam", codigo: "+84" },
            { pais: "Zambia", codigo: "+260" },
            { pais: "Zimbabue", codigo: "+263" },
        ]

        const s = document.createElement("select")
        //s.classList.add("claseapraahroa")
        s.style.borderBottomLeftRadius = "14px"
        s.style.borderTopLeftRadius = "14px"
        s.style.borderBottomRightRadius = "0px"
        s.style.borderTopRightRadius = "0px"

        s.setAttribute("campo", "codigoInternacional")
        const titulo = document.createElement("option");
        titulo.value = "";
        titulo.selected = true
        titulo.disabled = true
        titulo.text = `Selecciona el código internacional`;
        s.add(titulo);

        for (const c of codigosInternacionales) {
            const pais = c.pais
            const codigo = c.codigo
            const opcion = document.createElement("option");
            opcion.value = codigo;
            opcion.text = `${pais} ${codigo}`;
            s.add(opcion);
        }
        return s

    },
    componentesAlojamiento: {
        componentesUI: function (data) {
            const complementoUID = data.complementoUID
            const definicion = data.definicion
            const estadoIDV = data.estadoIDV
            const complementoUI = data.complementoUI
            const precio = data.precio
            const tipoPrecio = data.tipoPrecio


            const contenedor = document.createElement("div")
            contenedor.setAttribute("complementoUID", complementoUID)
            contenedor.classList.add(
                "flexVertical",
                "padding14",
                "backgroundGrey1",
                "borderRadius14"

            )
            contenedor.addEventListener("click", (e) => {
                this.controladorSelectorServicios(e)
            })
            const renderizaPrecio = (data) => {
                const precio = data.precio
                const tipoPrecio = data.tipoPrecio
                if (tipoPrecio === "fijoPorReserva") {
                    return `${precio}$ Total`
                } else if (tipoPrecio === "porNoche") {
                    return `${precio}$ / Por noche`
                }
            }

            const contenedorGlobal = document.createElement("div")
            contenedorGlobal.classList.add("contenedorGlobal")
            contenedor.appendChild(contenedorGlobal)


            const esferaSeleccionable = document.createElement("div")
            esferaSeleccionable.classList.add(
                "esferaSeleccionable"
            )
            contenedorGlobal.appendChild(esferaSeleccionable)

            const indicadorDeSeleccion = document.createElement("div")
            indicadorDeSeleccion.setAttribute("componente", "indicadorSelecion")
            indicadorDeSeleccion.classList.add(
                "indicadorDeSeleccion"
            )
            esferaSeleccionable.appendChild(indicadorDeSeleccion)

            const titulo = document.createElement("p")
            titulo.setAttribute("data", "complementoUI")
            titulo.classList.add(
                "padding6",
                "negrita"
            )
            titulo.textContent = complementoUI
            contenedorGlobal.appendChild(titulo)

            const precioUI = document.createElement("p")
            precioUI.classList.add(
                "textoNegrita",
                "padding6",
            )
            precioUI.textContent = renderizaPrecio({
                tipoPrecio,
                precio
            })
            contenedor.appendChild(precioUI)

            const definicionUI = document.createElement("pre")
            definicionUI.classList.add(
                "padding6",
                "whiteSpace"
            )
            definicionUI.textContent = definicion
            contenedor.appendChild(definicionUI)

            return contenedor
        },
        controladorSelectorServicios: (e) => {
            const servicioUI = e.target.closest("[complementoUID]")
            const selectorIndicador = servicioUI.querySelector("[componente=indicadorSelecion]")
            const estadoActual = servicioUI.getAttribute("estado")

            if (estadoActual === "activado") {
                servicioUI.removeAttribute("estado")
                selectorIndicador.removeAttribute("style")

            } else {
                servicioUI.setAttribute("estado", "activado")
                selectorIndicador.style.background = "#00ff00"
            }
            casaVitini.view.actualizarPrecioEnUI({
                aplicarUIData: "si"
            })

        },
    }
}