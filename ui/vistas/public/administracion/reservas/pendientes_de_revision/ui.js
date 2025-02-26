casaVitini.view = {
    start: async function() {
        const sectionRenderizada = document.querySelector("main[instanciaUID]")
        const instanciaUID = sectionRenderizada.getAttribute("instanciaUID")
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/reservas/pendientes_de_revision")
        const espacioReservasPendientes = document.querySelector(`main[instanciaUID="${instanciaUID}"]`).querySelector("[componente=espacioReservasPendientesDeRevision]")
        const info = document.createElement("div")
        info.classList.add("info")
        info.textContent = "No hay reservas pendientes de revisión"
        const transaccion = {
            zona: "administracion/reservas/pendientes_de_revision/obtener_reservas"
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            if (espacioReservasPendientes) {
                const reservasPendientes = respuestaServidor.reservas
                if (reservasPendientes.length === 0) {
                    this.componentes.infoSinReservas(instanciaUID)
                } else {
                    for (const rP of reservasPendientes) {
                        const global = rP.global
                        const contenedorFinanciero = rP.contenedorFinanciero
                        const contenedorTitular = rP.titular

                        const reservaUID = global.reservaUID
                        const fechaEntrada = global.fechaEntrada
                        const fechaSalida = global.fechaSalida
                        const fechaCreacion_ISO = global.fechaCreacion
                        const totalConImpuestos = contenedorFinanciero.desgloseFinanciero.global.totales.totalFinal

                        const nombreTitular = contenedorTitular.nombreTitular
                        const pasaporteTitular = contenedorTitular.pasaporteTitular
                        const tipoTitularIDV = contenedorTitular.tipoTitularIDV

                        const contenedorReserva = document.createElement("div")
                        contenedorReserva.classList.add("contenedorReserva")
                        contenedorReserva.setAttribute("reservaUID", reservaUID)
                        const contenedorInformacion = document.createElement("div")
                        contenedorInformacion.classList.add("contenedorInformacion")
                        const contenedorDatos = document.createElement("div")
                        contenedorDatos.classList.add("contenedorDatos")
                        const tituloReserva = document.createElement("p")
                        tituloReserva.classList.add("dato")
                        tituloReserva.textContent = "Reserva:"
                        contenedorDatos.appendChild(tituloReserva)
                        const numeroReserva = document.createElement("p")
                        numeroReserva.classList.add("dato")
                        numeroReserva.classList.add("negrita")
                        numeroReserva.textContent = reservaUID
                        contenedorDatos.appendChild(numeroReserva)
                        const tituloFechaReserva = document.createElement("p")
                        tituloFechaReserva.classList.add("dato")
                        tituloFechaReserva.textContent = "Fecha de realización UTC:"
                        contenedorDatos.appendChild(tituloFechaReserva)
                        const fechaReserva = document.createElement("p")
                        fechaReserva.classList.add("dato")
                        fechaReserva.classList.add("negrita")
                        fechaReserva.textContent = fechaCreacion_ISO
                        contenedorDatos.appendChild(fechaReserva)
                        const tituloTotalReserva = document.createElement("p")
                        tituloTotalReserva.classList.add("dato")
                        tituloTotalReserva.textContent = "Total:"
                        contenedorDatos.appendChild(tituloTotalReserva)
                        const totalReserva = document.createElement("p")
                        totalReserva.classList.add("negrita")
                        totalReserva.classList.add("dato")
                        totalReserva.textContent = totalConImpuestos
                        contenedorDatos.appendChild(totalReserva)
                        contenedorInformacion.appendChild(contenedorDatos)
                        const contenedorFechas = document.createElement("div")
                        contenedorFechas.classList.add("contenedorFechas")
                        const contenedorFechaEntrada = document.createElement("div")
                        contenedorFechaEntrada.classList.add("contenedorFechaEntrada")
                        const tituloFechaEntrada = document.createElement("div")
                        tituloFechaEntrada.classList.add("tituloFecha")
                        tituloFechaEntrada.textContent = "Fecha de entrada"
                        contenedorFechaEntrada.appendChild(tituloFechaEntrada)
                        const fechaEntrada_div = document.createElement("div")
                        fechaEntrada_div.classList.add("fechaEntrada")
                        fechaEntrada_div.textContent = fechaEntrada
                        contenedorFechaEntrada.appendChild(fechaEntrada_div)
                        contenedorFechas.appendChild(contenedorFechaEntrada)
                        const contenedorFechaSalida = document.createElement("div")
                        contenedorFechaSalida.classList.add("contenedorFechaSalida")
                        const tituloFechaSalida = document.createElement("div")
                        tituloFechaSalida.classList.add("tituloFecha")
                        tituloFechaSalida.textContent = "Fecha de salida"
                        contenedorFechaSalida.appendChild(tituloFechaSalida)
                        const fechaSalida_div = document.createElement("div")
                        fechaSalida_div.classList.add("fechaSalida")
                        fechaSalida_div.textContent = fechaSalida
                        contenedorFechaSalida.appendChild(fechaSalida_div)
                        contenedorFechas.appendChild(contenedorFechaSalida)
                        contenedorInformacion.appendChild(contenedorFechas)


                        const contenedorTitularUI = document.createElement("div")
                        contenedorTitularUI.classList.add(
                            "flexVertical",
                            "padding14"
                        )
                        contenedorInformacion.appendChild(contenedorTitularUI)

                        if (Object.keys(contenedorTitular).length === 0) {
                            const info = document.createElement("div")
                            info.textContent = "Reserva sin titular asignado"
                            contenedorTitularUI.appendChild(info)
                        } else {
                            const nombreTitularUI = document.createElement("div")
                            nombreTitularUI.classList.add(
                                "negrita"
                            )
                            nombreTitularUI.textContent = nombreTitular
                            contenedorTitularUI.appendChild(nombreTitularUI)

                            const pasaporteTitularUI = document.createElement("div")
                            pasaporteTitularUI.textContent = pasaporteTitular
                            contenedorTitularUI.appendChild(pasaporteTitularUI)

                            if (tipoTitularIDV === "titularPool") {
                                const tipoTitularUI = document.createElement("div")
                                tipoTitularUI.textContent = ">>> Pendiente de verificación documental"
                                contenedorTitularUI.appendChild(tipoTitularUI)

                            }
                        }



                        contenedorReserva.appendChild(contenedorInformacion)
                        const contenedorBotones = document.createElement("div")
                        contenedorBotones.classList.add("contenedorBotones")
                        const botonInsertarPago = document.createElement("a")
                        botonInsertarPago.classList.add("botonV1")
                        botonInsertarPago.textContent = "Ir a la reserva"
                        botonInsertarPago.setAttribute("href", `/administracion/reservas/reserva:${reservaUID}`)
                        botonInsertarPago.setAttribute("vista", `/administracion/reservas/reserva:${reservaUID}`)
                        botonInsertarPago.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                        contenedorBotones.appendChild(botonInsertarPago)
                        contenedorReserva.appendChild(contenedorBotones)
                        espacioReservasPendientes.appendChild(contenedorReserva)
                    }
                }
            }
        }
    },
    componentes: {
        infoSinReservas: function(instanciaUID)  {
            const espacioReservasPendientes = document.querySelector(`main[instanciaUID="${instanciaUID}"]`).querySelector("[componente=espacioReservasPendientesDeRevision]")
            if (espacioReservasPendientes) {
                const info = document.createElement("div")
                info.classList.add("info")
                info.textContent = "No hay reservas pendientes de revisión, actualiza la página para comprobar de nuevo."
                espacioReservasPendientes.appendChild(info)
            }
        }
    }
}