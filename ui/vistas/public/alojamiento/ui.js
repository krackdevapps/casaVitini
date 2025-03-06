casaVitini.view = {
    start: async function () {

        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const directorios = granuladoURL.directorios[granuladoURL.directorios.length - 1]

        casaVitini.shell.controladoresUI.iconosGlobales.telefonoPublicoWhatsApp({
            zonaIcono: "alojamiento"
        })
        return this.buscarAlojamientoUI()

        // if (directorios === "alojamiento") {

        //     return this.buscarAlojamientoUI()
        // } else if (directorios === "reserva_confirmada") {
        //     const reservaConfirmada = JSON.parse(localStorage.getItem("reservaConfirmada")) || null
        //     if (reservaConfirmada) {
        //       this.reservaConfirmada.ui()
        //     } else {
        //         const entrada = {
        //             vista: "/alojamiento",
        //             tipoOrigen: "menuNavegador"
        //         }
        //         return casaVitini.shell.navegacion.controladorVista(entrada)
        //     }
        // }
    },
    buscarAlojamientoUI: async function () {
        try {

            //document.querySelector("html").style.height = "100%"
            const instanciaUID_contenedorFechas = casaVitini.utilidades.codigoFechaInstancia()
            const reservaLocal = JSON.parse(sessionStorage.getItem("preReservaLocal"))
            const reservaEnCache = localStorage.getItem("reservaConfirmada");
            const reservaConfirmadaLocal = reservaEnCache ? JSON.parse(reservaEnCache) : null;
            const main = document.querySelector("main")

            const metodoSelectorPasarela = "view.metodoSelectorPasarela"
            const tituloUI = document.createElement("p")
            tituloUI.classList.add("tituloGris")
            tituloUI.textContent = "Alojamiento"

            const marcoElasticoRelativo = document.createElement('div');
            marcoElasticoRelativo.classList.add('marcoElasticoRelativo');
            marcoElasticoRelativo.setAttribute("espacio", "marcoElastico")
            marcoElasticoRelativo.classList.add("fondoAlojamiento")
            main.appendChild(marcoElasticoRelativo);

            const bloquePasosReservaNuevo = document.createElement('div');
            bloquePasosReservaNuevo.setAttribute('class', 'bloquePasosReservaNuevo');
            bloquePasosReservaNuevo.setAttribute('contenedor', 'busquedaAlojamiento');
            marcoElasticoRelativo.appendChild(bloquePasosReservaNuevo);

            const mensajeErrorCompartido = "Ha ocurrido un error y no se han podido obtener ciertos datos. Por favor, actualiza la página."

            const transaccion = {
                zona: "componentes/horaLimiteDelMismoDia",
            }
            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            if (respuestaServidor?.error) {

                const contenedorBanner = document.createElement("div")
                contenedorBanner.classList.add("plaza_reservas_reservaConfirmada_banner")
                contenedorBanner.textContent = mensajeErrorCompartido
                bloquePasosReservaNuevo.appendChild(contenedorBanner)
            } else if (respuestaServidor.ok) {

                const mismoDiaAceptable = respuestaServidor.mismoDiaAceptable
                const estadoAceptacion = respuestaServidor.estadoAceptacion
                const horaLimiteDelMismoDia = respuestaServidor.horaLimiteDelMismoDia
                const zonaHoraria = respuestaServidor.zonaHoraria

                if (mismoDiaAceptable === "si" && estadoAceptacion === "no") {

                    const contenedorBanner = document.createElement("div")
                    contenedorBanner.classList.add("bannerTiempoRestante")
                    contenedorBanner.textContent = this.__sharedMethods__.mensajeNoAceptacion({
                        horaLimite: horaLimiteDelMismoDia,
                        zonaHoraria: zonaHoraria
                    })
                    bloquePasosReservaNuevo.appendChild(contenedorBanner)

                } else if (mismoDiaAceptable === "si" && estadoAceptacion === "si") {
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
                    info.textContent = `Si quieres hacer una reserva con fecha de entrada para hoy mismo, tienes que hacerlo antes de la ${horaLimiteDelMismoDia}. Esta hora límite para hacer la reserva con fecha de entrada para hoy está en formato 24 H en hora local de ${zonaHoraria}. Pasada esta hora, para realizar una reserva con fecha de entrada para el día de hoy, por favor, ponte en contacto con nuestro equipo. Dirígete a la sección de Contacto donde encontrarás distintas formas de comunicarte con nosotros.`
                    //  contenedorBanner.appendChild(info)

                    const cuentaAtrasUI = document.createElement("p")
                    cuentaAtrasUI.setAttribute("contenedor", "cuentaAtras")
                    cuentaAtrasUI.classList.add(
                        "negrita"
                    )
                    contenedorBanner.appendChild(cuentaAtrasUI)

                    //  bloquePasosReservaNuevo.appendChild(contenedorBanner)

                    // casaVitini.ui.vistas.alojamiento.componentes.controladorCuentaAtras({
                    //     instanciaUID: instanciaUID_cuentaAttras,
                    //     segundosDeLaCuentaAtras: totalCuentaAtrasEnReseugnos,
                    //     zonaHoraria,
                    //     horaLimiteDelMismoDia
                    // })
                }
            }

            if (reservaConfirmadaLocal) {

                const contenedorBanner = document.createElement("a")
                contenedorBanner.classList.add("plaza_reservas_reservaConfirmada_banner")
                contenedorBanner.textContent = "Tienes una reserva guardada en la cache de tu navegador. Esta reserva se ha guardado tras confirmar tu reserva. Para ver los detalles de la confirmación, pulsa aquí. Si borras la cache de tu navegador esta información desaparecerá. Si quieres un acceso persistente puedes crear un VitiniID desde MiCasa."
                contenedorBanner.setAttribute("href", "/alojamiento/reserva_confirmada")
                contenedorBanner.setAttribute("vista", "/alojamiento/reserva_confirmada")
                contenedorBanner.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                bloquePasosReservaNuevo.appendChild(contenedorBanner)
            }

            const bloqueSelecionDias = document.createElement('div');
            bloqueSelecionDias.setAttribute('class', 'bloqueSelecionDias');

            const plazaAlojamientoContenedor = document.createElement('div');
            plazaAlojamientoContenedor.setAttribute('class', 'plaza_alojamiento_contenedor');
            plazaAlojamientoContenedor.setAttribute('contenedor', 'alojamiento');
            plazaAlojamientoContenedor.setAttribute("instanciaUID_contenedorFechas", instanciaUID_contenedorFechas)

            const diaEntradaNuevo = document.createElement('div');
            diaEntradaNuevo.setAttribute('class', 'diaEntradaNuevo plaza_alojamiento_marcoFechaCompartido');
            diaEntradaNuevo.setAttribute('calendario', 'entrada');
            diaEntradaNuevo.setAttribute('boton', 'desplegarCalendario');
            if (reservaLocal?.fechaEntrada) {
                diaEntradaNuevo.setAttribute("memoriaVolatil", reservaLocal.fechaEntrada)
            } else {
                diaEntradaNuevo.classList.add("parpadeaFondo")
            }
            diaEntradaNuevo.addEventListener("click", async () => {
                await casaVitini.ui.componentes.calendario.configurarCalendario({
                    perfilMes: "calendario_entrada_publico_sinPasado",
                    contenedorOrigenIDV: "[calendario=entrada]",
                    instanciaUID_contenedorFechas,
                    rangoIDV: "inicioRango",
                    metodoSelectorDia: metodoSelectorPasarela,
                    tituloCalendario: "Selecciona una fecha de entrada por favor",
                    seleccionableDiaLimite: "no"
                })
            })
            const textoDiaEntrada = document.createElement('div');
            textoDiaEntrada.setAttribute('class', 'textoDiaNuevo');
            textoDiaEntrada.textContent = 'Fecha de entrada';
            diaEntradaNuevo.appendChild(textoDiaEntrada);
            const plazaAlojamientoMarcoFechaEntrada = document.createElement('div');
            plazaAlojamientoMarcoFechaEntrada.setAttribute('class', 'plaza_alojamiento_marcoFechaCompartido_contenedorFecha');
            plazaAlojamientoMarcoFechaEntrada.setAttribute('fechaUI', 'fechaInicio');
            if (reservaLocal?.fechaEntrada) {
                plazaAlojamientoMarcoFechaEntrada.textContent = reservaLocal.fechaEntrada
            } else {
                plazaAlojamientoMarcoFechaEntrada.textContent = '(Seleccionar)';
            }
            diaEntradaNuevo.appendChild(plazaAlojamientoMarcoFechaEntrada);

            const diaSalidaNuevo = document.createElement('div');
            diaSalidaNuevo.setAttribute('class', 'diaSalidaNuevo plaza_alojamiento_marcoFechaCompartido');
            diaSalidaNuevo.setAttribute('calendario', 'salida');
            diaSalidaNuevo.setAttribute('boton', 'desplegarCalendario');
            if (reservaLocal?.fechaSalida) {
                diaSalidaNuevo.setAttribute("memoriaVolatil", reservaLocal.fechaSalida)
            }
            diaSalidaNuevo.addEventListener("click", async () => {

                await casaVitini.ui.componentes.calendario.configurarCalendario({
                    perfilMes: "calendario_salida_publico_sinPasado",
                    contenedorOrigenIDV: "[calendario=salida]",
                    instanciaUID_contenedorFechas,
                    rangoIDV: "finalRango",
                    metodoSelectorDia: metodoSelectorPasarela,
                    tituloCalendario: "Selecciona una fecha de salida por favor",
                    seleccionableDiaLimite: "no"
                })
            })
            const textoDiaSalida = document.createElement('div');
            textoDiaSalida.setAttribute('class', 'textoDiaNuevo');
            textoDiaSalida.textContent = 'Fecha de Salida';
            diaSalidaNuevo.appendChild(textoDiaSalida);



            const plazaAlojamientoMarcoFechaSalida = document.createElement('div');
            plazaAlojamientoMarcoFechaSalida.setAttribute('class', 'plaza_alojamiento_marcoFechaCompartido_contenedorFecha');
            plazaAlojamientoMarcoFechaSalida.setAttribute('fechaUI', 'fechaFin');
            if (reservaLocal?.fechaSalida) {
                plazaAlojamientoMarcoFechaSalida.textContent = reservaLocal.fechaSalida
            } else {
                plazaAlojamientoMarcoFechaSalida.textContent = '(Seleccionar)';
            }
            diaSalidaNuevo.appendChild(plazaAlojamientoMarcoFechaSalida);

            const botonMostrarDisponibilidad = document.createElement('div');
            botonMostrarDisponibilidad.setAttribute('class', 'botonMostrarDisponibilidad');
            botonMostrarDisponibilidad.setAttribute('componente', 'botonDisponibilidad');
            botonMostrarDisponibilidad.setAttribute('boton', 'mostrarDisponibilidad');
            botonMostrarDisponibilidad.textContent = 'Buscar';
            botonMostrarDisponibilidad.addEventListener("click", this.buscarApartamentosDisponibles)

            plazaAlojamientoContenedor.appendChild(diaEntradaNuevo);
            plazaAlojamientoContenedor.appendChild(botonMostrarDisponibilidad);

            plazaAlojamientoContenedor.appendChild(diaSalidaNuevo);
            bloqueSelecionDias.appendChild(plazaAlojamientoContenedor);
            const botonBorrarBusquedaAlojamiento = document.createElement("div")
            botonBorrarBusquedaAlojamiento.classList.add("plaza_alojamiento_botonBorrarBusquedaAlojamiento")
            botonBorrarBusquedaAlojamiento.setAttribute("componente", "botonBorrarBusquedaAlojamiento")
            botonBorrarBusquedaAlojamiento.textContent = "Borrar fechas seleccionadas "
            botonBorrarBusquedaAlojamiento.addEventListener("click", (e) => {
                document.body.removeAttribute("class")
                document.querySelector("[calendario=entrada]").classList.add("parpadeaFondo")
                document.querySelector("[calendario=salida]").classList.remove("parpadeaFondo")
                document.querySelector("[espacio=marcoElastico]").classList.remove("fondoTransparente")
                document.querySelector("[componente=botonDisponibilidad]").classList.remove("parpadeaFondo")
                const selectorCalendarios = document.querySelectorAll("[calendario]")
                selectorCalendarios.forEach((memoriaVolatil) => {
                    memoriaVolatil.removeAttribute("memoriaVolatil")
                    memoriaVolatil.removeAttribute("posicionDia")

                })
                const fechaEntradaUI = document.querySelector("[fechaUI=fechaInicio]")
                fechaEntradaUI.textContent = "(Seleccionar)"
                const fechaSalidaUI = document.querySelector("[fechaUI=fechaFin]")
                fechaSalidaUI.textContent = "(Seleccionar)"
                sessionStorage.removeItem("preReservaLocal")
                const selectorSuperBloque = document.querySelector("[componente=superBloque]")
                selectorSuperBloque?.remove()
                e.target.removeAttribute("style")
                document.querySelector("[espacio=marcoElastico]").classList.add("fondoAlojamiento")

            })
            bloqueSelecionDias.appendChild(botonBorrarBusquedaAlojamiento);
            bloquePasosReservaNuevo.appendChild(bloqueSelecionDias);
            if (reservaLocal?.alojamiento) {
                reservaLocal.alojamiento = {}
                sessionStorage.setItem("preReservaLocal", JSON.stringify(reservaLocal))
            }
            if (reservaLocal?.fechaEntrada && reservaLocal?.fechaSalida) {
                await this.buscarApartamentosDisponibles("botonDisponibilidad")
            }


            const img = document.createElement("div")
            img.style.backgroundImage = 'url("/activos/imagenes/test/image00061.jpeg")';
            img.style.flex = "1"
            img.style.padding = "12px"
            img.style.borderRadius = "15px"

            img.style.backgroundSize = "cover";
            img.style.backgroundRepeat = "no-repeat";
            img.style.backgroundAttachment = "fixed";
            img.style.backgroundPosition = "center center";


        } catch (error) {

            casaVitini.ui.componentes.errorRenderizacionVista()
        }

    },
    metodoSelectorPasarela: async function (e) {
        const estadoDia = e.target.getAttribute("estadoDia")
        casaVitini.ui.componentes.calendario.calendarioCompartido.seleccionarDia(e)
        if (estadoDia !== "seleccionado") {
            this.asistenteCalendarios()
        }
    },
    asistenteCalendarios: async function () {
        const contenedorAlojamiento = document.querySelector("[contenedor=alojamiento]")
        const contenedorEntrada = contenedorAlojamiento.querySelector("[calendario=entrada]")
        const contenedorSalida = contenedorAlojamiento.querySelector("[calendario=salida]")
        const fechaEntrada = contenedorEntrada.getAttribute("memoriaVolatil")
        const fechaSalida = contenedorSalida.getAttribute("memoriaVolatil")
        const botonDisponibilidad = contenedorAlojamiento.querySelector("[boton=mostrarDisponibilidad]")
        const metodoSelectorPasarela = "view.metodoSelectorPasarela"
        const instanciaUID_contenedorFechas = contenedorAlojamiento.getAttribute("instanciaUID_contenedorFechas")

        const contenedores = contenedorAlojamiento.querySelectorAll("[boton]")
        contenedores.forEach((contenedor) => {
            contenedor.classList.remove("parpadeaFondo")
        })
        casaVitini.shell.controladoresUI.ocultarElementos()
        if (fechaEntrada && fechaSalida) {
            return this.buscarApartamentosDisponibles()
        } else if (fechaEntrada) {
            const botonBorrarBusquedaAlojamiento = document.querySelector("[componente=botonBorrarBusquedaAlojamiento]")
            botonBorrarBusquedaAlojamiento.style.display = "flex"

            contenedorSalida.classList.add("parpadeaFondo")
            await casaVitini.ui.componentes.calendario.configurarCalendario({
                perfilMes: "calendario_salida_publico_sinPasado",
                contenedorOrigenIDV: "[calendario=salida]",
                instanciaUID_contenedorFechas,
                rangoIDV: "finalRango",
                metodoSelectorDia: metodoSelectorPasarela,
                tituloCalendario: "Selecciona una fecha de salida por favor",
                seleccionableDiaLimite: "no"

            })
        } else if (fechaSalida) {
            const botonBorrarBusquedaAlojamiento = document.querySelector("[componente=botonBorrarBusquedaAlojamiento]")
            botonBorrarBusquedaAlojamiento.style.display = "flex"

            contenedorEntrada.classList.add("parpadeaFondo")
            await casaVitini.ui.componentes.calendario.configurarCalendario({
                perfilMes: "calendario_entrada_publico_sinPasado",
                contenedorOrigenIDV: "[calendario=entrada]",
                instanciaUID_contenedorFechas,
                rangoIDV: "inicioRango",
                metodoSelectorDia: metodoSelectorPasarela,
                tituloCalendario: "Selecciona una fecha de entrada por favor",
                seleccionableDiaLimite: "no"

            })
        }
    },
    buscarApartamentosDisponibles: async function () {

        document.removeEventListener("click", casaVitini.shell.controladoresUI.ocultarElementos)
        const fechaEntradaVolatil_Humana = document.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
        const fechaSalidaVolatil_Humana = document.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")
        casaVitini.shell.controladoresUI.ocultarElementos()

        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const bloqueCalendario = document.createElement("div")
        bloqueCalendario.setAttribute("class", "bloqueCalendarioNuevo")
        const cartelInfoCalendarioEstado = document.createElement("div")
        cartelInfoCalendarioEstado.setAttribute("class", "cartelInfoCalendarioEstado")
        cartelInfoCalendarioEstado.setAttribute("componente", "infoCalendario")
        if (!fechaEntradaVolatil_Humana) {
            const error = "Por favor, selecciona la fecha de entrada."
            return casaVitini.ui.componentes.advertenciaInmersiva(error)
        }
        if (!fechaSalidaVolatil_Humana) {
            const error = "Selecciona una fecha de salida"
            return casaVitini.ui.componentes.advertenciaInmersiva(error)
        }
        document.querySelector("[espacio=marcoElastico]").classList.remove("fondoAlojamiento")
        document.querySelector("[espacio=marcoElastico]").classList.add("fondoTransparente")

        document.body.classList.add("fondoConResultados")
        document.querySelector(".bloquePernoctacion")?.remove()
        document.querySelector(".bloqueBotonResumenReserva")?.remove()
        document.querySelectorAll("[componente=superBloque]").forEach((contenedorAlojamientoRenderizado) => {
            contenedorAlojamientoRenderizado.remove()
        })
        const contenedorBusquedaAlojamiento = document.querySelector("[contenedor=busquedaAlojamiento]")
        const superBloqueReserva = document.createElement("div")
        superBloqueReserva.classList.add("plaza_alojamiento_superBloque")
        superBloqueReserva.setAttribute("componente", "superBloque")
        superBloqueReserva.setAttribute("instanciaUID", instanciaUID)
        const contenedorEstadoBusqueda = document.createElement("div")
        contenedorEstadoBusqueda.classList.add("plaza_alojamiento_contenedorEsperaAlojamiento")
        const spinnerContainer = document.createElement('div');
        spinnerContainer.setAttribute("componente", "iconoCargaEnlace");
        spinnerContainer.classList.add("lds-spinner");
        for (let i = 0; i < 12; i++) {
            const div = document.createElement('div');
            spinnerContainer.appendChild(div);
        }
        contenedorEstadoBusqueda.appendChild(spinnerContainer)
        const info = document.createElement("div")
        info.setAttribute("class", "advertenciaInfoFlujoPago")
        info.setAttribute("componente", "mensajeFlujoPasarela")
        info.textContent = "Buscando alojamiento..."
        contenedorEstadoBusqueda.appendChild(info)
        const boton = document.createElement("div")
        boton.setAttribute("class", "botonV1")
        boton.classList.add("blur")
        boton.textContent = "Cancelar"
        boton.addEventListener("click", () => {
            document.querySelector(`[instanciaUID="${instanciaUID}"]`).remove()
            document.body.removeAttribute("class")
            document.querySelector("[espacio=marcoElastico]").classList.remove("fondoAlojamiento")

        })
        contenedorEstadoBusqueda.appendChild(boton)
        superBloqueReserva.appendChild(contenedorEstadoBusqueda)
        contenedorBusquedaAlojamiento.appendChild(superBloqueReserva)
        const botonBorrarBusquedaAlojamiento = document.querySelector("[componente=botonBorrarBusquedaAlojamiento]")
        botonBorrarBusquedaAlojamiento.style.display = "flex"




        document.querySelector("[componente=botonDisponibilidad]").classList.remove("parpadeaFondo")
        const transaccion = {
            zona: "plaza/reservas/apartamentosDisponiblesPublico",
            fechaEntrada: fechaEntradaVolatil_Humana,
            fechaSalida: fechaSalidaVolatil_Humana
        }

        const respuestaServidor = await casaVitini.shell.servidor(transaccion)

        if (!document.querySelector(`[instanciaUID="${instanciaUID}"]`)) {
            return
        }
        if (respuestaServidor?.error) {
            document.querySelector(`[instanciaUID="${instanciaUID}"]`).remove()
            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor.ok) {
            const apartamentosDisponibles = respuestaServidor?.ok.apartamentosDisponibles
            const contenedorFinanciero = respuestaServidor?.ok.contenedorFinanciero
            const complementosAlojamiento = respuestaServidor?.ok.complementosAlojamiento

            const superBloqueReservaRenderizado = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
            superBloqueReservaRenderizado.innerHTML = null
            if (!superBloqueReservaRenderizado) {
                return
            }
            if (Object.keys(apartamentosDisponibles).length === 0) {
                const infoSinAlojamiento = document.createElement("p")
                infoSinAlojamiento.setAttribute("class", "plaza_alojamiento_infoSinAlojamientoDisponible")
                infoSinAlojamiento.textContent = "No hay níngun alojamiento dispopnible para las fechas seleccionadas."
                superBloqueReservaRenderizado.appendChild(infoSinAlojamiento);
                return
            }

            const tituloBloqueAlojamiento = document.createElement("p")
            tituloBloqueAlojamiento.setAttribute("class", "tituloBloqueAlojamiento parpadeaFondoTransparente")
            tituloBloqueAlojamiento.setAttribute("componente", "tituloInfoSeleccionar")
            tituloBloqueAlojamiento.textContent = "Selecciona los apartamentos que quieres reservas. Se aplicaran las ofertas automáticamente."
            superBloqueReservaRenderizado.appendChild(tituloBloqueAlojamiento);
            const bloqueAlojamientoUI = document.createElement("div")
            bloqueAlojamientoUI.classList.add("bloqueAlojamiento")
            bloqueAlojamientoUI.setAttribute("contenedor", "alojamiento")
            superBloqueReservaRenderizado.appendChild(bloqueAlojamientoUI)

            for (const [apartamentoIDV, contenedor] of Object.entries(apartamentosDisponibles)) {
                const apartamentoUI = contenedor.apartamentoUI
                const apartamentoUIPublico = contenedor.apartamentoUIPublico
                const definicionPublica = contenedor.definicionPublica
                const habitaciones = contenedor.habitaciones
                const caracteristicas = contenedor.caracteristicas
                const totalInicial = contenedorFinanciero[apartamentoIDV].global.totales.totalFinal
                const contenedorOFertasPorCondicion = contenedorFinanciero[apartamentoIDV].contenedorOfertas.ofertas.porCondicion
                // const complementosAlojamiento = complementosAlojamiento[apartamentoIDV]

                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const bloqueApartamento = document.createElement("div")
                bloqueApartamento.setAttribute("class", "plaza_alojamiento_contenedorApartamento")
                bloqueApartamento.setAttribute("apartamentoIDV", apartamentoIDV)
                bloqueApartamento.setAttribute("apartamentoUI", apartamentoUI)
                bloqueApartamento.setAttribute("instanciaUID", instanciaUID)
                bloqueApartamento.setAttribute("habitaciones", JSON.stringify(habitaciones))
                //bloqueApartamento.setAttribute("complementosAlojamiento", JSON.stringify(complementosAlojamiento))

                bloqueApartamento.addEventListener("click", () => {


                    const selectorApartamento = document.querySelector(`[apartamentoIDV="${apartamentoIDV}"]`)
                    const selectorSelectorApartamento = selectorApartamento.querySelector("[componente=selectorApartamento]")

                    if (selectorApartamento.getAttribute("estadoApartamento") !== "seleccionado") {
                        selectorApartamento.setAttribute("estadoApartamento", "seleccionado")
                        selectorSelectorApartamento.style.opacity = "1"
                    } else {
                        selectorApartamento.removeAttribute("estadoApartamento")
                        selectorSelectorApartamento.removeAttribute("style")
                    }
                    const numeroApartamentosSeleccionado = document.querySelectorAll("[apartamentoIDV][estadoApartamento=seleccionado]").length
                    const selectorApartamentosSeleccionados = document.querySelectorAll("[estadoApartamento=seleccionado]")
                    const marcoFlotante = document.querySelector("[componente=marcoFlotanteIrAResumen]")
                    const selectorInfoTextoParpadeo = document.querySelector("[componente=tituloInfoSeleccionar]")
                    const selectorBotonIrAlResumen = marcoFlotante.querySelector("[componente=botonIrAResumenReserva]")
                    const selectorEstadoSeleccion = selectorBotonIrAlResumen.querySelector("[contenedor=estadoSeleccion]")
                    selectorEstadoSeleccion.innerHTML = "Selecciona tu alojamiento"
                    if (selectorApartamentosSeleccionados.length > 0) {
                        selectorInfoTextoParpadeo.classList.remove("parpadeaFondoTransparente")
                        marcoFlotante.style.opacity = "1"
                        marcoFlotante.querySelector("[componente=botonIrAResumenReserva]")
                            .style.pointerEvents = "all"

                        if (numeroApartamentosSeleccionado === 1) {
                            selectorEstadoSeleccion.textContent = `1 Apartamento seleccionado`
                        } else if (numeroApartamentosSeleccionado > 1) {
                            selectorEstadoSeleccion.textContent = `${numeroApartamentosSeleccionado} Apartamentos seleccionados`
                        }

                    } else {
                        selectorInfoTextoParpadeo.classList.add("parpadeaFondoTransparente")
                        marcoFlotante.removeAttribute("style")





                    }

                    this.actualizarPreciosPorSeleccion()
                })
                bloqueAlojamientoUI.appendChild(bloqueApartamento)
                const bloqueImagen = document.createElement("div")
                bloqueImagen.setAttribute("class", "bloqueImagen")

                const contenedorValdosasFlotantes = document.createElement("div")
                contenedorValdosasFlotantes.setAttribute("contenedor", "valdosaFlotante")
                contenedorValdosasFlotantes.classList.add("flexHorizontal", "flexAlineacionI")
                bloqueApartamento.appendChild(contenedorValdosasFlotantes)


                const contenedorTitulo = document.createElement("div")
                contenedorTitulo.classList.add("plaza_alojamiento_contenedorApartamento_contenedorTitulo")
                contenedorValdosasFlotantes.appendChild(contenedorTitulo)


                const contnedorBotonesEnValdosa = document.createElement("div")
                contnedorBotonesEnValdosa.classList.add("flexVertical")
                contenedorValdosasFlotantes.appendChild(contnedorBotonesEnValdosa)

                const botonVerImagenes = document.createElement("div")
                botonVerImagenes.setAttribute("boton", "verImagenes")
                botonVerImagenes.classList.add("flexVertical", "padding12", "borderRadius16", "backgroundWhite5", "blur50", "ocultoInicial")
                botonVerImagenes.addEventListener("click", (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    this.gestionImagenes.ui.arranque({
                        apartamentoUI,
                        apartamentoIDV
                    })
                })
                botonVerImagenes.textContent = "Ver fotos del apartamento"
                contnedorBotonesEnValdosa.appendChild(botonVerImagenes)



                const bloqueVerticalTitulo = document.createElement("div")
                bloqueVerticalTitulo.setAttribute("class", "bloqueVerticalTitulo")
                contenedorTitulo.appendChild(bloqueVerticalTitulo)

                const contenedorNombres = document.createElement("div")
                contenedorNombres.classList.add("flexVertical")
                bloqueVerticalTitulo.appendChild(contenedorNombres)


                const elementoTituloNombre = document.createElement("div")
                elementoTituloNombre.setAttribute("class", "elementoTituloPrincipal")
                elementoTituloNombre.textContent = apartamentoUIPublico
                contenedorNombres.appendChild(elementoTituloNombre)


                const definicionPublicaUI = document.createElement("div")
                definicionPublicaUI.setAttribute("class", "elementoTituloPrincipal")
                definicionPublicaUI.textContent = definicionPublica
                contenedorNombres.appendChild(definicionPublicaUI)

                const bloqueTituloApartamentoComponenteUI = document.createElement("div")
                bloqueTituloApartamentoComponenteUI.setAttribute("class", "tituloApartamentoComponenteUI")
                bloqueVerticalTitulo.appendChild(bloqueTituloApartamentoComponenteUI)
                const bloqueCaracteristicas = document.createElement("div")
                bloqueCaracteristicas.classList.add("plaza_alojamiento_contenedorApartmento_contenedorCaracteristicas")
                for (const caracteristica of caracteristicas) {
                    const caracteristicaUI = document.createElement("div")
                    caracteristicaUI.classList.add("plaza_alojamiento_contenedorCaracteristicas_caracteristicas")
                    caracteristicaUI.textContent = caracteristica.caracteristicaUI
                    bloqueCaracteristicas.appendChild(caracteristicaUI)
                }
                if (caracteristicas.length > 0) {
                    contenedorTitulo.appendChild(bloqueCaracteristicas)
                }

                const contenedorTotalYOfertas = document.createElement("div")
                contenedorTotalYOfertas.classList.add("flexVertical")
                contenedorTotalYOfertas.setAttribute("contenedor", "totalYOfertas")
                bloqueTituloApartamentoComponenteUI.appendChild(contenedorTotalYOfertas)

                const totaUI = document.createElement("div")
                totaUI.setAttribute("class", "elementoTitulo")
                totaUI.setAttribute("totalInicial", totalInicial)
                totaUI.setAttribute("contenedorOfertasInicial", JSON.stringify(contenedorOFertasPorCondicion))
                totaUI.setAttribute("componente", "valorTotal")
                contenedorTotalYOfertas.appendChild(totaUI)

                const contenedorOfertasUI = document.createElement("div")
                contenedorOfertasUI.classList.add(
                    "flexVertical",
                    "gap10",
                    "efectoAparicion",
                    "ocultoInicial"
                )
                contenedorOfertasUI.setAttribute("contenedor", "ofertas")
                contenedorTotalYOfertas.appendChild(contenedorOfertasUI)


                this.aplicaPrecioAlApartamento({
                    apartamentoIDV: apartamentoIDV,
                    contenedorOfertas: contenedorOFertasPorCondicion,
                    total: totalInicial
                })

                const bloqueHabitaciones = document.createElement("div")
                bloqueHabitaciones.classList.add("plaza_alojamiento_contenedorApartmento_contenedorHabitaciones")
                bloqueHabitaciones.setAttribute("componente", "bloqueHabitaciones")
                const checkUI = document.createElement("div")
                checkUI.classList.add("plaza_alojamiento_contenedorApartmento_check")
                checkUI.setAttribute("componente", "selectorApartamento")
                checkUI.textContent = "Seleccionado"
                bloqueApartamento.appendChild(checkUI)
                for (const habitacion of Object.entries(habitaciones)) {
                    const habitacionIDV = habitacion[0]
                    const habitacionUI = habitacion[1].habitacionUI
                    const configuracionesHabitacion = habitacion[1].configuraciones
                    const numeroDeCamasPorHabitacion = Object.keys(configuracionesHabitacion).length
                    const habitacionBloque = document.createElement("div")
                    habitacionBloque.setAttribute("class", "habitacion")
                    habitacionBloque.setAttribute("componente", "habitacacionContenedor")
                    habitacionBloque.setAttribute("habitacionIDV", habitacionIDV)
                    habitacionBloque.addEventListener("click", (e) => {

                    })
                    const habitacionNombre = document.createElement("div")
                    habitacionNombre.setAttribute("class", "habitacionNombre")
                    habitacionNombre.textContent = habitacionUI
                    habitacionBloque.appendChild(habitacionNombre)
                    if (numeroDeCamasPorHabitacion > 1) {
                        const infoHabitacion = document.createElement("div")
                        infoHabitacion.classList.add("plaza_alojamiento_contenedorHabitacion_infoSeleccionTipoCama")
                        infoHabitacion.setAttribute("componente", "infoSeleccionCama")
                        infoHabitacion.textContent = "Selecciona el tipo de cama para la habitación."
                        habitacionBloque.appendChild(infoHabitacion)
                    }
                    if (numeroDeCamasPorHabitacion === 1) {
                        const infoHabitacion = document.createElement("div")
                        infoHabitacion.classList.add("plaza_alojamiento_contenedorHabitacion_infoSeleccionTipoCama")
                        infoHabitacion.textContent = "Esta habitación solo dispone de este tipo de cama. Al seleccionar este apartamento, se selecciona esta cama para esta habitación"
                        habitacionBloque.appendChild(infoHabitacion)
                    }
                    const bloqueHabitacionCamas = document.createElement("div")
                    bloqueHabitacionCamas.setAttribute("class", "bloqueHabitacion")
                    for (const configuracionHabitacion of Object.entries(configuracionesHabitacion)) {
                        const camaIDV = configuracionHabitacion[1].camaIDV
                        const camaUI = configuracionHabitacion[1].camaUI
                        const capacidad = configuracionHabitacion[1].capacidad
                        const bloqueCama = document.createElement("div")
                        bloqueCama.setAttribute("class", "habitacionCamas")
                        bloqueCama.setAttribute("camaIDV", camaIDV)
                        bloqueCama.setAttribute("capacidadPernoctativa", capacidad)
                        bloqueCama.setAttribute("componente", "botonSelectorCama")
                        bloqueCama.textContent = camaUI
                        if (numeroDeCamasPorHabitacion > 1) {
                            bloqueCama.addEventListener("click", (e) => {
                                e.stopPropagation()
                                const datosCama = {
                                    apartamentoIDV: apartamentoIDV,
                                    habitacionIDV: habitacionIDV,
                                    camaIDV: camaIDV
                                }
                                this.seleccionarCama(datosCama)
                            })
                        }
                        bloqueHabitacionCamas.appendChild(bloqueCama)
                        habitacionBloque.appendChild(bloqueCama)
                    }

                    bloqueHabitaciones.appendChild(habitacionBloque)
                }

                const metadatos = {
                    apartamentoIDV: apartamentoIDV,
                    instanciaUID: instanciaUID,
                }
                this.obtenerImagenApartamento(metadatos)

            }

            const marcoBotonFlotanteIrAResumenReserva = document.createElement("div")
            marcoBotonFlotanteIrAResumenReserva.classList.add("plaza_alojamiento_marcoBotonIreAResumenReserva")
            marcoBotonFlotanteIrAResumenReserva.setAttribute("componente", "marcoFlotanteIrAResumen")
            const marcoIntermedio = document.createElement("div")
            marcoIntermedio.classList.add("plaza_alojamiento_marcoIntermedioBotonIrResumenReserva")
            //marcoBotonFlotanteIrAResumenReserva.append(marcoIntermedio)


            const botonResumenReserva = document.createElement("div")
            botonResumenReserva.classList.add(
                "plaza_alojamiento_boronResumenReservaEnMarcoFlotante",
                "parpadeaFondoSemiBlanco"
            )

            botonResumenReserva.setAttribute("componente", "botonIrAResumenReserva")

            botonResumenReserva.addEventListener("click", () => {
                this.iraResumenReserva()
            })
            marcoBotonFlotanteIrAResumenReserva.append(botonResumenReserva)

            const contenedorEstadoSeleccion = document.createElement("div")
            contenedorEstadoSeleccion.setAttribute("contenedor", "estadoSeleccion")
            botonResumenReserva.appendChild(contenedorEstadoSeleccion)

            const info = document.createElement("div")
            info.classList.add(
                "negrita"
            )
            info.textContent = "Ir al resumen de mi reserva"
            botonResumenReserva.appendChild(info)

            superBloqueReservaRenderizado.appendChild(marcoBotonFlotanteIrAResumenReserva)
        }

    },
    obtenerImagenApartamento: async function (metadatos) {
        const apartamentoIDV = metadatos.apartamentoIDV
        const instanciaUIDDestino = metadatos.instanciaUID

        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "componentes/imagenDelApartamento",
            apartamentoIDV: apartamentoIDV
        })
        if (respuestaServidor?.error) {
            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const contenedorApartamentoRenderizado = document.querySelector(`[apartamentoIDV=${apartamentoIDV}][instanciaUID="${instanciaUIDDestino}"]`)
            if (contenedorApartamentoRenderizado) {
                const numeroImagenesGaleria = respuestaServidor.numeroImagenesGaleria
                if (numeroImagenesGaleria !== "0") {
                    const selectorBoton = contenedorApartamentoRenderizado.querySelector("[boton=verImagenes]")
                    selectorBoton.classList.remove("ocultoInicial")
                    contenedorApartamentoRenderizado.querySelector("[contenedor=valdosaFlotante]").style.gap = "6px"
                }

                const imagen = respuestaServidor.imagen
                if (imagen) {
                    const tipoDeImagen = casaVitini.utilidades.formatos.imagenes.base64(imagen);
                    contenedorApartamentoRenderizado.style.backgroundImage = `url(data:image/${tipoDeImagen.toLowerCase()};base64,${imagen})`;
                }
                contenedorApartamentoRenderizado.style.backgroundSize = "cover";
                contenedorApartamentoRenderizado.style.backgroundPosition = "center";
                contenedorApartamentoRenderizado.style.backgroundRepeat = "no-repeat";
            }
        }
    },
    iraResumenReserva: function () {
        const reservaLocal = {}
        const fechaEntradaVolatil_ISO = document.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
        const fechaSalidaVolatil_ISO = document.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")

        reservaLocal.fechaEntrada = fechaEntradaVolatil_ISO
        reservaLocal.fechaSalida = fechaSalidaVolatil_ISO

        reservaLocal.alojamiento = {}

        const apartamentosSeleccionados = document.querySelectorAll("[estadoApartamento=seleccionado]")
        apartamentosSeleccionados.forEach((apartamento) => {
            const apartamentoIDV = apartamento.getAttribute("apartamentoIDV")
            const apartamentoUI = apartamento.getAttribute("apartamentoUI")
            const habitaciones = JSON.parse(apartamento.getAttribute("habitaciones"))
            reservaLocal.alojamiento[apartamentoIDV] = {
                // apartamentoUI: apartamentoUI,
                // habitaciones: habitaciones
            }

        })
        const reservaLocalJSON = JSON.stringify(reservaLocal)
        sessionStorage.setItem("preReservaLocal", reservaLocalJSON)
        return casaVitini.shell.navegacion.controladorVista({
            vista: "/alojamiento/resumen",
            tipoOrigen: "menuNavegador"
        })
    },
    componenteSelectorCamas: async function (metadatos) {
        let capacidadPernoctativa = metadatos.getAttribute("capacidadPernoctativa")
        let habitacionIDV = metadatos.getAttribute("habitacionIDV")
        let habitacionUI = metadatos.getAttribute("habitacionUI")
        let camaNombre = metadatos.getAttribute("camaUI")
        let camaIDV = metadatos.getAttribute("camaIDV")
        let camaUI = metadatos.getAttribute("camaUI")
        let camaSeleccionada = metadatos
        let apartamentoIDV = metadatos.getAttribute("apartamentoIDV")
        let apartamentoUI = metadatos.getAttribute("apartamentoUI")
        let selectorHabitacion = document.querySelector(`.bloquePernoctacion .bloqueInquilino[apartamentoIDV='${apartamentoIDV}']  .bloqueHabitacionInquilino[bloqueHabitacionID_Compartido='${habitacionIDV}']`)
        let bloqueInquilinoSelector = document.querySelector(`.bloquePernoctacion .bloqueInquilino[apartamentoIDV='${apartamentoIDV}']`)
        let selectorBotonResumenReserva = document.querySelector(".bloquePasosReservaNuevo .bloqueBotonResumenReserva")
        if (selectorHabitacion) {
            selectorHabitacion.remove()
        }
        camaSeleccionada.style.background = "red"
        camaSeleccionada.style.color = "white"
        camaSeleccionada.setAttribute("estadoCama", "camaSeleccionada")

        let bloqueInquilino = document.createElement("div")
        bloqueInquilino.setAttribute("class", "bloqueInquilino")
        bloqueInquilino.setAttribute("apartamentoIDV", apartamentoIDV)
        bloqueInquilino.setAttribute("apartamentoUI", apartamentoUI)
        bloqueInquilino.setAttribute("componente", "habitacionPernoctantes")
        bloqueInquilino.setAttribute("zona", "apartamentoPernoctacion")
        let tituloInquilino = document.createElement("p")
        tituloInquilino.setAttribute("class", "tituloInquilino")
        tituloInquilino.textContent = "Anadir pernoctantes en " + apartamentoUI
        bloqueInquilino.appendChild(tituloInquilino)
        let bloqueHabitacion = document.createElement("div")
        bloqueHabitacion.setAttribute("class", "bloqueHabitacionInquilino")
        bloqueHabitacion.setAttribute("habitacionIDV", habitacionIDV)
        bloqueHabitacion.setAttribute("habitacionUI", habitacionUI)
        let bloqueTituloHabitacion = document.createElement("div")
        bloqueTituloHabitacion.setAttribute("class", "bloqueTituloHabitacion")
        bloqueTituloHabitacion.setAttribute("camaIDV", camaIDV)
        bloqueTituloHabitacion.setAttribute("camaUI", camaUI)
        bloqueTituloHabitacion.textContent = habitacionUI + " - " + camaUI
        bloqueHabitacion.appendChild(bloqueTituloHabitacion)
        if (!bloqueInquilinoSelector) {
            bloqueInquilino.appendChild(bloqueHabitacion)
        } else {
            bloqueInquilinoSelector.appendChild(bloqueHabitacion)
        }
        for (let ciclo = 0; ciclo < capacidadPernoctativa; ciclo++) {
            let bloqueNombrePasaporte = document.createElement("div")
            bloqueNombrePasaporte.setAttribute("class", "bloqueNombrePasaporte")
            bloqueNombrePasaporte.setAttribute("bloquePernoctante", "bloquePernoctante")
            let campoNombreInquilino = document.createElement("input")
            campoNombreInquilino.setAttribute("class", "campoNombreInquilino campoSuperior")
            campoNombreInquilino.setAttribute("pernoctante", "nombre")
            campoNombreInquilino.setAttribute("placeholder", "Nombre y apellidos")
            bloqueNombrePasaporte.appendChild(campoNombreInquilino)
            let campoPasaporte = document.createElement("input")
            campoPasaporte.setAttribute("class", "campoNombreInquilino campoInferior")
            campoPasaporte.setAttribute("pernoctante", "pasaporte")
            campoPasaporte.setAttribute("placeholder", "Documento de identificación")
            bloqueNombrePasaporte.appendChild(campoPasaporte)
            bloqueHabitacion.appendChild(bloqueNombrePasaporte)
        }
        let bloquePernoctacion = document.querySelector(".bloquePernoctacion")
        if (!bloqueInquilinoSelector) {
            bloquePernoctacion.appendChild(bloqueInquilino)
        }
        if (!selectorBotonResumenReserva) {
            let bloqueBotonResumenReserva = document.createElement("div")
            bloqueBotonResumenReserva.setAttribute("class", "bloqueBotonResumenReserva")
            let BotonResumenReserva = document.createElement("div")
            BotonResumenReserva.setAttribute("class", "botonResumenReserva")
            BotonResumenReserva.textContent = "Ir al resumen de la reserva"
            BotonResumenReserva.addEventListener("click", () => {
                this.iraResumenReserva()
            })
            bloqueBotonResumenReserva.appendChild(BotonResumenReserva)
            let bloquePasosReserva = document.querySelector(".bloquePasosReservaNuevo")
            bloquePasosReserva.appendChild(bloqueBotonResumenReserva)
        }
    },
    actualizarPreciosPorSeleccion: async function () {
        const fechaEntrada = document.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
        const fechaSalida = document.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")

        const contenedorSobreBloque = document.querySelector("[componente=superBloque]")
        const selectorTodosApartamentos = contenedorSobreBloque.querySelectorAll("[apartamentoIDV]")
        const selectorApartamentosSiSeleccionados = contenedorSobreBloque.querySelectorAll("[estadoApartamento=seleccionado]")
        const selectorApartamentosNoSeleccionados = contenedorSobreBloque.querySelectorAll("[apartamentoIDV]:not([estadoApartamento=seleccionado])")

        const apartamentosSeleccionados = []
        selectorApartamentosSiSeleccionados.forEach((apartamento) => {
            const apartamentoIDV = apartamento.getAttribute("apartamentoIDV")
            apartamentosSeleccionados.push(apartamentoIDV)
        })
        if (apartamentosSeleccionados.length === 1) {
            selectorTodosApartamentos.forEach((apartamento) => {
                const apartamentoIDV = apartamento.getAttribute("apartamentoIDV")
                const totalInicial = apartamento.querySelector("[componente=valorTotal]").getAttribute("totalInicial")
                const contenedorOfertasInicial = JSON.parse(apartamento.querySelector("[componente=valorTotal]").getAttribute("contenedorOfertasInicial")) || []
                this.aplicaPrecioAlApartamento({
                    apartamentoIDV: apartamentoIDV,
                    contenedorOfertas: contenedorOfertasInicial,
                    total: totalInicial
                })
            })

        } else if (apartamentosSeleccionados.length > 1) {
            selectorApartamentosNoSeleccionados.forEach((apartamento) => {
                const apartamentoIDV = apartamento.getAttribute("apartamentoIDV")
                const totalInicial = apartamento.querySelector("[componente=valorTotal]").getAttribute("totalInicial")
                const contenedorOfertasInicial = JSON.parse(apartamento.querySelector("[componente=valorTotal]").getAttribute("contenedorOfertasInicial")) || []
                this.aplicaPrecioAlApartamento({
                    apartamentoIDV: apartamentoIDV,
                    contenedorOfertas: contenedorOfertasInicial,
                    total: totalInicial
                })
            })

            const contenedorInstanciasUID = {}
            apartamentosSeleccionados.forEach((apartamentoIDV) => {
                const contenedorApartamento = contenedorSobreBloque.querySelector(`[apartamentoIDV="${apartamentoIDV}"]`)
                const instanciaUID_proceso = casaVitini.utilidades.codigoFechaInstancia()
                contenedorInstanciasUID[apartamentoIDV] = instanciaUID_proceso
                contenedorApartamento.setAttribute("instanciaUID", instanciaUID_proceso)
                const selectorTotalUI = contenedorApartamento.querySelector(`[componente=valorTotal]`)
                selectorTotalUI.textContent = "Calculando precio..."
                const selectorContenedorOfertas = contenedorApartamento.querySelector("[contenedor=ofertas]")
                selectorContenedorOfertas.innerHTML = null

            })

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "plaza/reservas/preciosPorSeleccion",
                fechaEntrada: fechaEntrada,
                fechaSalida: fechaSalida,
                apartamentosIDVARRAY: apartamentosSeleccionados
            })


            if (respuestaServidor?.error) {
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.error)
            }
            if (respuestaServidor.ok) {
                const preciosPorSeleccion = respuestaServidor.preciosPorSeleccion
                const desgloseFinanciero = respuestaServidor.desgloseFinanciero
                const contenedorOFertasPorCondicion = desgloseFinanciero.contenedorOfertas.ofertas.porCondicion



                const contenedorSimplificadoOfertas = []
                contenedorOFertasPorCondicion.forEach((contenedorOferta, i) => {
                    if (i < 2) {
                        const nombreOferta = contenedorOferta.oferta.nombreOferta
                        const estructura = {
                            nombreOferta,
                            contenedorOferta
                        }
                        contenedorSimplificadoOfertas.push(estructura)
                    }
                })


                apartamentosSeleccionados.forEach((apartamentoIDV) => {
                    const instanciaUID = contenedorInstanciasUID[apartamentoIDV]
                    const selectorContenedorApartamento = document.querySelector(`[apartamentoIDV="${apartamentoIDV}"][instanciaUID="${instanciaUID}"]`)
                    if (selectorContenedorApartamento) {
                        const valorFinalUI = preciosPorSeleccion[apartamentoIDV].precioEnBaseASeleccion
                        this.aplicaPrecioAlApartamento({
                            apartamentoIDV,
                            contenedorOfertas: contenedorOFertasPorCondicion,
                            total: valorFinalUI
                        })
                    }
                })
            }
        }
    },
    aplicaPrecioAlApartamento: async function (data) {
        const apartamentoIDV = data.apartamentoIDV
        const total = data.total
        const contenedorOfertas = data.contenedorOfertas


        const selectorApartamento = document.querySelector(`[apartamentoIDV="${apartamentoIDV}"]`)
        const selectorTotalUI = selectorApartamento.querySelector(`[componente=valorTotal]`)
        const selectortotalYOfertas = selectorApartamento.querySelector(`[contenedor=totalYOfertas]`)

        const selectorContenedorOfertas = selectorApartamento.querySelector(`[contenedor=ofertas]`)
        selectorContenedorOfertas.innerHTML = null
        selectorContenedorOfertas.classList.add("ocultoInicial")

        selectortotalYOfertas.style.gap = "0px"

        selectorTotalUI.textContent = `${total}$ Total`

        const contenedorSimplificadoOfertas = []
        contenedorOfertas.forEach((contenedorOferta, i) => {

            const nombreOferta = contenedorOferta.oferta.nombreOferta
            const estructura = {
                nombreOferta,
                contenedorOferta
            }
            contenedorSimplificadoOfertas.push(estructura)

        })
        if (contenedorSimplificadoOfertas.length > 0) {
            selectorContenedorOfertas.classList.remove("ocultoInicial")
            selectortotalYOfertas.style.gap = "10px"


        }
        contenedorSimplificadoOfertas.forEach((contenedorOferta) => {
            const nombreOferta = contenedorOferta.nombreOferta
            const contenedorOfertaIndividual = document.createElement("a")
            contenedorOfertaIndividual.setAttribute("contenedor", "ofertaIndividual")
            contenedorOfertaIndividual.classList.add(
                "botonOfertaEnApartamento",
            )
            contenedorOfertaIndividual.textContent = nombreOferta
            contenedorOfertaIndividual.addEventListener("click", (e) => {
                e.preventDefault()
                e.stopPropagation()
                e.stopImmediatePropagation()
                const main = document.querySelector("main")
                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                ui.style.zIndex = "300"
                const contenedor = ui.querySelector("[componente=contenedor]")
                main.appendChild(ui)


                const tituloUI = document.createElement("p")
                tituloUI.classList.add("tituloGris", "padding6", "textoCentrado")
                tituloUI.setAttribute("componente", "titulo")
                tituloUI.textContent = "Detalles de la oferta seleccionada"
                contenedor.appendChild(tituloUI)

                const botonCancelar1 = document.createElement("div")
                botonCancelar1.classList.add("botonV1")
                botonCancelar1.setAttribute("boton", "cancelar")
                botonCancelar1.textContent = "Volver a la selección de apartamentos"
                botonCancelar1.addEventListener("click", () => {
                    return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                })
                contenedor.appendChild(botonCancelar1)

                const ofertaUI = this.ofertas.ofertaUI({
                    contenedorOferta: contenedorOferta.contenedorOferta.oferta
                })
                contenedor.appendChild(ofertaUI)

                const botonCancelar = document.createElement("div")
                botonCancelar.classList.add("botonV1")
                botonCancelar.setAttribute("boton", "cancelar")
                botonCancelar.textContent = "Volver a la selección de apartamentos"
                botonCancelar.addEventListener("click", () => {
                    return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                })
                contenedor.appendChild(botonCancelar)

            })
            selectorContenedorOfertas.appendChild(contenedorOfertaIndividual)
        })









    },
    ofertas: {
        ofertaUI: function (data) {

            const contenedorOferta = data.contenedorOferta
            const nombreOferta = contenedorOferta.nombreOferta
            const fechaInicio = contenedorOferta.fechaInicio
            const fechaFinal = contenedorOferta.fechaFinal
            const entidadIDV = contenedorOferta.entidadIDV
            const estadoIDV = contenedorOferta.estadoIDV
            const zonaIDV = contenedorOferta.zonaIDV
            const condicionesArray = contenedorOferta.condicionesArray
            const descuentosJSON = contenedorOferta.descuentosJSON
            const estadoUI = {
                activado: "Activada",
                desactivado: "Desactivada"
            }
            const entidadUI = {
                reserva: "Reserva"
            }
            const zonaUI = {
                global: "Global",
                privado: "privado",
                publico: "publica"
            }
            const ofertaUI = document.createElement("a")
            ofertaUI.classList.add("ofertaUI")
            const tituloOferta = document.createElement("p")
            tituloOferta.classList.add(
                "ofertaUITituloOferta",
                "negrita"
            )
            tituloOferta.textContent = nombreOferta
            ofertaUI.appendChild(tituloOferta)
            const contenedorGlobalOferta = document.createElement("div")
            contenedorGlobalOferta.classList.add("ofertaUIContenedorGlobalOferta")

            const contenedorDetalleOferta = document.createElement("div")
            contenedorDetalleOferta.classList.add("ofertaUIContenedorDetalles")

            const fechaInicioContenedor = document.createElement("div")
            fechaInicioContenedor.classList.add("ofertaUIFechaContenedor")
            const tituloFechaInicio = document.createElement("div")
            tituloFechaInicio.classList.add("ofertaUITituloFecha")
            tituloFechaInicio.textContent = "Fecha de inicio"
            fechaInicioContenedor.appendChild(tituloFechaInicio)
            const datoFechaInicio = document.createElement("div")
            datoFechaInicio.classList.add("ofertaUIDatoFecha")
            datoFechaInicio.textContent = fechaInicio
            fechaInicioContenedor.appendChild(datoFechaInicio)
            contenedorDetalleOferta.appendChild(fechaInicioContenedor)
            const fechaFinContenedor = document.createElement("div")
            fechaFinContenedor.classList.add("ofertaUIFechaContenedor")
            const tituloFechaFin = document.createElement("div")
            tituloFechaFin.classList.add("ofertaUITituloFecha")
            tituloFechaFin.textContent = "Fecha de fin"
            fechaFinContenedor.appendChild(tituloFechaFin)
            const datoFechaFin = document.createElement("div")
            datoFechaFin.classList.add("ofertaUIDatoFecha")
            datoFechaFin.textContent = fechaFinal
            fechaFinContenedor.appendChild(datoFechaFin)
            contenedorDetalleOferta.appendChild(fechaFinContenedor)
            contenedorGlobalOferta.appendChild(contenedorDetalleOferta)
            ofertaUI.appendChild(contenedorGlobalOferta)

            const contenedorCYD = document.createElement("div")
            contenedorCYD.classList.add(
                "flexVertical",
                "gap6"
            )
            contenedorCYD.setAttribute("contenedor", "condicionesDescuentos")

            const condicionesUI = this.condicionesUI({
                condicionesArray
            })
            contenedorCYD.appendChild(condicionesUI)

            const descuentoUI = this.descuentosUI({
                descuentosJSON
            })
            contenedorCYD.appendChild(descuentoUI)

            contenedorGlobalOferta.appendChild(contenedorCYD)
            return ofertaUI
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
                "borderRadius14",
                "gap6"
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
    },
    gestionImagenes: {
        ui: {
            arranque: async function (data) {
                const apartamentoIDV = data.apartamentoIDV
                const apartamentoUI = data.apartamentoUI

                const main = document.querySelector("main")
                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                ui.setAttribute("contenedor", "galeriaFlotante")
                ui.style.zIndex = "300"
                const instanciaUID_ui = ui.getAttribute("instanciaUID")
                const contenedor = ui.querySelector("[componente=contenedor]")
                main.appendChild(ui)


                const spinner = casaVitini.ui.componentes.spinner({
                    mensaje: `Obteniendo fotos de ${apartamentoUI}...`
                })
                contenedor.appendChild(spinner)

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "componentes/obtenerTodoImagenUIDPorApartamentoIDVPublico",
                    apartamentoIDV
                })
                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_ui}"]`)
                if (!instanciaRenderizada) { return }
                if (respuestaServidor?.error) {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    contenedor.innerHTML = null
                    ui.classList.add("flextJustificacion_arriba")

                    const botonCancelar = document.createElement("div")
                    botonCancelar.classList.add("botonV1")
                    botonCancelar.setAttribute("boton", "cancelar")
                    botonCancelar.textContent = "Cerrar y volver"
                    botonCancelar.addEventListener("click", () => {

                        return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    })
                    contenedor.appendChild(botonCancelar)

                    const gridImagenes = document.createElement("div")
                    gridImagenes.setAttribute("contenedor", "gridImagenes")
                    gridImagenes.setAttribute("grupoIDV", apartamentoIDV)
                    gridImagenes.classList.add("gridImagenes")
                    contenedor.appendChild(gridImagenes)

                    return this.redenderizaContenedorImagen({
                        respuestaServidor,
                        instanciaUID: instanciaUID_ui
                    })

                }

            },
            redenderizaContenedorImagen: async function (data) {

                const rS = data.respuestaServidor
                const apartamentoIDV = rS.apartamentoIDV
                const imagenes = rS.imagenes
                imagenes.sort((a, b) => a.posicion - b.posicion);
                imagenes.forEach(imagen => {
                    const imagenUID = imagen?.imagenUID
                    const imagenBase64 = imagen.imagenBase64
                    const posicion = imagen?.posicion
                    const titulo = imagen.titulo
                    const descripcion = imagen.descripcion
                    const contenedor = this.contenedorImagen({
                        imagenBase64: "",
                        apartamentoIDV,
                        imagenUID,
                        posicion,
                        titulo,
                        descripcion,
                        estadoInicial: "cargando"
                    })
                    document.querySelector("[contenedor=gridImagenes]").appendChild(contenedor)
                    this.obtenerImagen({
                        instanciaUID_destino: contenedor.getAttribute("instanciaUID"),
                        imagenUID,
                        apartamentoIDV
                    })
                })


            },
            obtenerImagen: async function (data) {

                const instanciaUID_destino = data.instanciaUID_destino
                const imagenUID = data.imagenUID
                const apartamentoIDV = data.apartamentoIDV
                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "componentes/obtenerImagenPorApartamentoIDVPublico",
                    apartamentoIDV,
                    imagenUID
                })

                const uiRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_destino}"]`)
                if (uiRenderizada) {
                    if (respuestaServidor?.error) {
                        return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.error)
                    }
                    if (respuestaServidor?.ok) {
                        const imagenBase64 = respuestaServidor.imagen.imagenBase64
                        const tipoDeImagen = casaVitini.utilidades.formatos.imagenes.base64(imagenBase64);
                        uiRenderizada.querySelector("[contenedor=imagenBase64]").style.backgroundImage = `url(data:image/${tipoDeImagen.toLowerCase()};base64,${imagenBase64})`;
                        uiRenderizada.querySelector("[contenedor=imagenBase64] [contenedor=spinner]")?.remove()
                        uiRenderizada.removeAttribute("estadoActual")
                        const imagenAmpliadaEnEspera = document.querySelector(`[imagenUID_ampliada="${imagenUID}"]`)
                        if (imagenAmpliadaEnEspera) {
                            imagenAmpliadaEnEspera.querySelector("[contenedor=imagenVolatil]").style.backgroundImage = `url(data:image/${tipoDeImagen.toLowerCase()};base64,${imagenBase64})`;
                            imagenAmpliadaEnEspera.querySelector("[contenedor=imagenVolatil] [contenedor=spinner]")?.remove()
                        }
                    }
                }

            },
            contenedorImagen: function (data) {
                const imagenBase64 = data.imagenBase64
                const apartamentoIDV = data.apartamentoIDV
                const imagenUID = data.imagenUID
                const posicion = data?.posicion
                const estadoInicial = data.estadoInicial
                const titulo = data.titulo || ""
                const descripcion = data.descripcion || ""
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const imagenResponsiva = `${apartamentoIDV}_imagen${posicion}`
                const contenedor = document.createElement("div")
                contenedor.classList.add("flexVertical", "contenedorImagen")
                contenedor.setAttribute("instanciauID", instanciaUID)
                contenedor.setAttribute("imagenUID", imagenUID)
                contenedor.setAttribute("imagenResponsiva", imagenResponsiva)
                contenedor.setAttribute("componente", "fotoAmpliable")
                contenedor.setAttribute("apartamentoIDV", apartamentoIDV)
                contenedor.addEventListener("click", (e) => {
                    casaVitini.view.__sharedMethods__.ampliadorDeImagen.ampliarImagen(e)
                })

                const cImagen = document.createElement("div")
                cImagen.classList.add("flexVertical", "contenedorImagenFondo")
                cImagen.setAttribute("contenedor", "imagenBase64")
                cImagen.setAttribute("titulo", titulo)
                cImagen.setAttribute("descripcion", descripcion)
                if (imagenBase64.length > 0) {
                    const tipoDeImagen = casaVitini.utilidades.formatos.imagenes.base64(imagenBase64);
                    cImagen.style.backgroundImage = `url(data:image/${tipoDeImagen.toLowerCase()};base64,${imagenBase64})`;
                }
                contenedor.appendChild(cImagen)

                const spinner = casaVitini.ui.componentes.spinnerSimple()
                spinner.classList.add("blur50")

                if (estadoInicial === "cargando") {
                    cImagen.appendChild(spinner)
                    contenedor.setAttribute("estadoActual", "cargando")

                }
                return contenedor
            }
        },

    }
}