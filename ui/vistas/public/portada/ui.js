casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")

        const idiomaNavegador = navigator.language || navigator.languages[0];
        if (idiomaNavegador.startsWith('en')) {
            const saludo = main.querySelector("[data=saludo]")
            saludo.textContent = "Welcome"

            const botonReservas = main.querySelector("[data=botonReservas]")
            botonReservas.textContent = "Reserve"
        }

        const mmssASegundos = (tiempo) => {
            const [minutos, segundos] = tiempo.split(':').map(Number);
            return (minutos * 60) + segundos;
        }
        const tiemposVideoHD = [
            "00:00",
            "00:36",
            "00:51",
            // "01:07",
            // "01:20",
            "01:51",
            // "02:07",
            "02:41",
            "02:49",
            "02:58",
            // "03:09",
            // "03:35",
            "03:46",
            "04:03",
            "04:13",
            // "04:28",
            "04:50",
            "05:33",
            "06:03",
            // "07:03",
            // "07:48",
            // "08:05"
        ];

        const tiemposVideoPerso = [
            "00:00",
            "00:36",
            "00:51",
            "01:07",
            "01:20",
            "01:51",
            "02:07",
            "02:41",
            "02:49",
            "02:58",
            "03:09",
            "03:35",
        ];

        const video = main.querySelector("[componente=video]")
        if (video) {
            video.addEventListener('loadeddata', () => {
                const tiempos = [
                    "00:00",
                    "00:36",
                    "00:51",
                    // "01:07",
                    // "01:20",
                    "01:51",
                    // "02:07",
                    "02:41",
                    "02:49",
                    "02:58",
                    // "03:09",
                    // "03:35",
                    "03:46",
                    "04:03",
                    "04:13",
                    // "04:28",
                    "04:50",
                    "05:33",
                    "06:03",
                    // "07:03",
                    // "07:48",
                    // "08:05"
                ];
                const posicionAleatoria = Math.floor(Math.random() * tiempos.length)
                const tiempoAleatorio = tiempos[posicionAleatoria];
                video.currentTime = mmssASegundos(tiempoAleatorio);

            })
            video.addEventListener('canplaythrough', () => {
                const playProm = video.play();
                video.playbackRate = 1.00;
                if (playProm !== undefined) {
                    playProm.then(_ => {
                        setTimeout(() => {
                            if (video) {
                                video.style.opacity = "1"
                                video.style.transition = "opacity 500ms linear"
                            }
                        }, 1000);
                    })
                        .catch(error => {
                        });
                }
            })

        }

        // document.querySelector("[componente=botonCambiaVistaEnSection]")
        //     .addEventListener("click", casaVitini.shell.navegacion.cambiarVista)

        const instanciaUID = document.querySelector("main[instanciaUID]").getAttribute("instanciaUID")
        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "plaza/portada/obtenerMensajes"
        })
        const seccionRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
        if (!seccionRenderizada) { return }

        if (respuestaServidor?.ok) {
            // const mensajes = respuestaServidor.ok
            // const titulo = seccionRenderizada.querySelector("[componente=titulo]")
            // for (const detallesDelMensaje of mensajes) {
            //     const mensaje = detallesDelMensaje.mensaje
            //     const tituloUI = document.createElement("pre")
            //     tituloUI.classList.add("tituloUI")
            //     tituloUI.textContent = mensaje
            //     titulo.insertAdjacentElement("afterend", tituloUI);
            // }
        }

        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const directorios = granuladoURL.directorios[granuladoURL.directorios.length - 1]
        document.body.classList.remove("fondoConResultados")

        casaVitini.shell.controladoresUI.iconosGlobales.telefonoPublicoWhatsApp({
            zonaIcono: "alojamiento"
        })

        // Icono 

        //  return this.buscarAlojamientoUI()
    },
    // start: async function () {

    //     const granuladoURL = casaVitini.utilidades.granuladorURL()
    //     const directorios = granuladoURL.directorios[granuladoURL.directorios.length - 1]
    //     document.body.classList.remove("fondoConResultados")

    //     casaVitini.shell.controladoresUI.iconosGlobales.telefonoPublicoWhatsApp({
    //         zonaIcono: "alojamiento"
    //     })
    //     return this.buscarAlojamientoUI()

    //     // if (directorios === "alojamiento") {

    //     //     return this.buscarAlojamientoUI()
    //     // } else if (directorios === "reserva_confirmada") {
    //     //     const reservaConfirmada = JSON.parse(localStorage.getItem("reservaConfirmada")) || null
    //     //     if (reservaConfirmada) {
    //     //       this.reservaConfirmada.ui()
    //     //     } else {
    //     //         const entrada = {
    //     //             vista: "/alojamiento",
    //     //             tipoOrigen: "menuNavegador"
    //     //         }
    //     //         return casaVitini.shell.navegacion.controladorVista(entrada)
    //     //     }
    //     // }
    // },
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
                contenedorBanner.textContent = "Tienes la solicitud de reserva que hiciste anteriormente guardada en el navegador. Para ver los detalles pulsa aquí."
                contenedorBanner.setAttribute("href", "/alojamiento/reserva_confirmada")

                contenedorBanner.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                bloquePasosReservaNuevo.appendChild(contenedorBanner)
            }

            const superContenedorSeleconDias = document.createElement('div');
            superContenedorSeleconDias.classList.add("flexVertical", "flexAHCentrad")
            bloquePasosReservaNuevo.appendChild(superContenedorSeleconDias);


            const bloqueSelecionDias = document.createElement('div');
            bloqueSelecionDias.setAttribute('class', 'bloqueSelecionDias');
            superContenedorSeleconDias.appendChild(bloqueSelecionDias);


            const plazaAlojamientoContenedor = document.createElement('div');
            plazaAlojamientoContenedor.setAttribute('class', 'plaza_alojamiento_contenedor');
            plazaAlojamientoContenedor.setAttribute('contenedor', 'alojamiento');
            plazaAlojamientoContenedor.setAttribute("instanciaUID_contenedorFechas", instanciaUID_contenedorFechas)
            bloqueSelecionDias.appendChild(plazaAlojamientoContenedor);


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
            plazaAlojamientoContenedor.appendChild(diaEntradaNuevo);

            const botonMostrarDisponibilidad = document.createElement('div');
            botonMostrarDisponibilidad.setAttribute('class', 'botonMostrarDisponibilidad');
            botonMostrarDisponibilidad.setAttribute('componente', 'botonDisponibilidad');
            botonMostrarDisponibilidad.setAttribute('boton', 'mostrarDisponibilidad');
            botonMostrarDisponibilidad.textContent = 'Buscar';
            botonMostrarDisponibilidad.addEventListener("click", this.buscarApartamentosDisponibles)
            plazaAlojamientoContenedor.appendChild(botonMostrarDisponibilidad);



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
                plazaAlojamientoMarcoFechaEntrada.textContent = '';
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
            plazaAlojamientoContenedor.appendChild(diaSalidaNuevo);



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
                plazaAlojamientoMarcoFechaSalida.textContent = '';
            }
            diaSalidaNuevo.appendChild(plazaAlojamientoMarcoFechaSalida);



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
                fechaEntradaUI.textContent = ""
                const fechaSalidaUI = document.querySelector("[fechaUI=fechaFin]")
                fechaSalidaUI.textContent = ""
                sessionStorage.removeItem("preReservaLocal")
                const selectorSuperBloque = document.querySelector("[componente=superBloque]")
                selectorSuperBloque?.remove()
                e.target.removeAttribute("style")
                document.querySelector("[espacio=marcoElastico]").classList.add("fondoAlojamiento")

            })
            bloqueSelecionDias.appendChild(botonBorrarBusquedaAlojamiento);
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
}