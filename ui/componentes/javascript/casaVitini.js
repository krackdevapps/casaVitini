const casaVitini = {
    ui: {
        vistas: {
            portada: {
                arranque: () => {
                    document.body.style.backgroundImage = 'url("/componentes/imagenes/f5.jpeg")';
                    document.querySelector("[componente=botonCambiaVistaEnSection]").addEventListener("click", casaVitini.componentes.cambiarVista)

                    document.querySelector(".marcoElasticoRelativo").style.flex = "1"



                },
            },
            reservasNuevo: {
                arranque: async () => {
                    document.body.style.backgroundImage = "url(/componentes/imagenes/fotos/image00018.jpeg)"
                    const granuladoURL = casaVitini.componentes.granuladorURL()
                    const directorios = granuladoURL.directorios[granuladoURL.directorios.length - 1]

                    if (directorios === "alojamiento") {
                        return casaVitini.ui.vistas.reservasNuevo.buscarAlojamientoUI()
                    }

                    if (directorios === "reserva_confirmada") {
                        let reservaConfirmadaLocal
                        try {
                            reservaConfirmadaLocal = JSON.parse(localStorage.getItem("reservaConfirmada"))
                        } catch (error) {
                            reservaConfirmadaLocal = null
                        }

                        if (reservaConfirmadaLocal) {
                            casaVitini.ui.vistas.reservasNuevo.reservaConfirmada.UI()
                        } else {
                            const entrada = {
                                vista: "/alojamiento",
                                tipoOrigen: "menuNavegador"
                            }
                            return casaVitini.componentes.controladorVista(entrada)
                        }
                    }

                },
                buscarAlojamientoUI: async () => {
                    const reservaLocal = JSON.parse(sessionStorage.getItem("reserva"))
                    let reservaConfirmadaLocal
                    try {
                        reservaConfirmadaLocal = JSON.parse(localStorage.getItem("reservaConfirmada"))
                    } catch (error) {
                        reservaConfirmadaLocal = null
                    }
                    const main = document.querySelector("main")
                    const tituloUI = document.createElement("p")
                    tituloUI.classList.add("titulo")
                    tituloUI.innerText = "Alojamiento"
                    main.appendChild(tituloUI);

                    // Contenedor principal
                    const marcoElasticoRelativo = document.createElement('div');
                    marcoElasticoRelativo.setAttribute('class', 'marcoElasticoRelativo');
                    marcoElasticoRelativo.setAttribute('style', 'height: 100%;');

                    // Contenedor de bloques de reserva
                    const bloquePasosReservaNuevo = document.createElement('div');
                    bloquePasosReservaNuevo.setAttribute('class', 'bloquePasosReservaNuevo');
                    bloquePasosReservaNuevo.setAttribute('contenedor', 'busquedaAlojamiento');

                    if (reservaConfirmadaLocal) {
                        // Añadir banner informativo
                        const contenedorBanner = document.createElement("a")
                        contenedorBanner.classList.add("plaza_reservas_reservaConfiramda_banner")
                        contenedorBanner.innerText = "Tienes una reserva guardada en la cache de tu navegador. Esta reserva se ha guardado tras confirmar tu reserva. Para ver los detalles de la confirmación pulsa aquí. Si borras la cache de tu navegador esta información desaparecerá. Si quieres un acceso persistente puedes crear un VitiniID desde MiCasa."
                        contenedorBanner.setAttribute("href", "/alojamiento/reserva_confirmada")
                        contenedorBanner.setAttribute("vista", "/alojamiento/reserva_confirmada")
                        contenedorBanner.addEventListener("click", casaVitini.componentes.cambiarVista)
                        bloquePasosReservaNuevo.appendChild(contenedorBanner)
                    }
                    // Bloque de selección de días
                    const bloqueSelecionDias = document.createElement('div');
                    bloqueSelecionDias.setAttribute('class', 'bloqueSelecionDias');

                    // Contenedor de alojamiento
                    const plazaAlojamientoContenedor = document.createElement('div');
                    plazaAlojamientoContenedor.setAttribute('class', 'plaza_alojamiento_contenedor');
                    plazaAlojamientoContenedor.setAttribute('contenedor', 'alojamiento');

                    // Bloque de día de entrada
                    const diaEntradaNuevo = document.createElement('div');
                    diaEntradaNuevo.setAttribute('class', 'diaEntradaNuevo plaza_alojamiento_marcoFechaCompartido');
                    diaEntradaNuevo.setAttribute('calendario', 'entrada');
                    diaEntradaNuevo.setAttribute('boton', 'desplegarCalendario');
                    if (reservaLocal?.entrada) {
                        diaEntradaNuevo.setAttribute("memoriaVolatil", reservaLocal.entrada)
                    } else {
                        diaEntradaNuevo.classList.add("parpadeaFondo")
                    }
                    diaEntradaNuevo.addEventListener("click", () => {
                        casaVitini.ui.vistas.reservasNuevo.reservasNuevoEntrada("entrada")
                    })

                    const textoDiaEntrada = document.createElement('div');
                    textoDiaEntrada.setAttribute('class', 'textoDiaNuevo');
                    textoDiaEntrada.textContent = 'Fecha de entrada';
                    diaEntradaNuevo.appendChild(textoDiaEntrada);

                    const plazaAlojamientoMarcoFechaEntrada = document.createElement('div');
                    plazaAlojamientoMarcoFechaEntrada.setAttribute('class', 'plaza_alojamiento_marcoFechaCompartido_contenedorFecha');
                    plazaAlojamientoMarcoFechaEntrada.setAttribute('id', 'fechaEntrada');
                    if (reservaLocal?.entrada) {
                        plazaAlojamientoMarcoFechaEntrada.textContent = reservaLocal.entrada
                    } else {
                        plazaAlojamientoMarcoFechaEntrada.textContent = '(Seleccionar)';
                    }
                    diaEntradaNuevo.appendChild(plazaAlojamientoMarcoFechaEntrada);

                    // Bloque de día de salida
                    const diaSalidaNuevo = document.createElement('div');
                    diaSalidaNuevo.setAttribute('class', 'diaSalidaNuevo plaza_alojamiento_marcoFechaCompartido');
                    diaSalidaNuevo.setAttribute('calendario', 'salida');
                    diaSalidaNuevo.setAttribute('boton', 'desplegarCalendario');
                    if (reservaLocal?.salida) {
                        diaSalidaNuevo.setAttribute("memoriaVolatil", reservaLocal.salida)
                    } else {
                        // diaSalidaNuevo.classList.add("parpadeaFondo")
                    }
                    diaSalidaNuevo.addEventListener("click", () => {
                        casaVitini.ui.vistas.reservasNuevo.reservasNuevoEntrada("salida")
                    })

                    const textoDiaSalida = document.createElement('div');
                    textoDiaSalida.setAttribute('class', 'textoDiaNuevo');
                    textoDiaSalida.textContent = 'Fecha de Salida';
                    diaSalidaNuevo.appendChild(textoDiaSalida);

                    const plazaAlojamientoMarcoFechaSalida = document.createElement('div');
                    plazaAlojamientoMarcoFechaSalida.setAttribute('class', 'plaza_alojamiento_marcoFechaCompartido_contenedorFecha');
                    plazaAlojamientoMarcoFechaSalida.setAttribute('id', 'fechaSalida');
                    if (reservaLocal?.salida) {
                        plazaAlojamientoMarcoFechaSalida.innerText = reservaLocal.salida
                    } else {
                        plazaAlojamientoMarcoFechaSalida.textContent = '(Seleccionar)';

                    }
                    diaSalidaNuevo.appendChild(plazaAlojamientoMarcoFechaSalida);

                    // Botón de mostrar disponibilidad
                    const botonMostrarDisponibilidad = document.createElement('div');
                    botonMostrarDisponibilidad.setAttribute('class', 'botonMostrarDisponibilidad');
                    botonMostrarDisponibilidad.setAttribute('componente', 'botonDisponibilidad');
                    botonMostrarDisponibilidad.setAttribute('boton', 'mostrarDisponibilidad');
                    botonMostrarDisponibilidad.textContent = 'Mostrar disponibilidad';
                    botonMostrarDisponibilidad.addEventListener("click", () => {
                        casaVitini.ui.vistas.reservasNuevo.reservasNuevoEntrada("botonDisponibilidad")
                    })

                    // Agregar elementos al DOM
                    plazaAlojamientoContenedor.appendChild(diaEntradaNuevo);
                    plazaAlojamientoContenedor.appendChild(diaSalidaNuevo);
                    plazaAlojamientoContenedor.appendChild(botonMostrarDisponibilidad);
                    bloqueSelecionDias.appendChild(plazaAlojamientoContenedor);

                    const botonBorrarBusquedaAlojamiento = document.createElement("div")
                    botonBorrarBusquedaAlojamiento.classList.add("plaza_alojamiento_botonBorrarBusquedaAlojamiento")
                    botonBorrarBusquedaAlojamiento.setAttribute("componente", "botonBorrarBusquedaAlojamiento")
                    botonBorrarBusquedaAlojamiento.innerText = "Borrar búsqueda de alojamiento "
                    botonBorrarBusquedaAlojamiento.addEventListener("click", (e) => {
                        document.body.removeAttribute("class")
                        document.querySelector("[calendario=entrada]").classList.add("parpadeaFondo")
                        document.querySelector("[calendario=salida]").classList.remove("parpadeaFondo")
                        document.querySelector("[componente=botonDisponibilidad]").classList.remove("parpadeaFondo")

                        const selectorCalendarios = document.querySelectorAll("[calendario]")
                        selectorCalendarios.forEach((memoriaVolatil) => {
                            memoriaVolatil.removeAttribute("memoriaVolatil")
                        })
                        const fechaEntradaUI = document.querySelector("#fechaEntrada")
                        fechaEntradaUI.innerText = "(Seleccionar)"
                        const fechaSalidaUI = document.querySelector("#fechaSalida")
                        fechaSalidaUI.innerText = "(Seleccionar)"

                        sessionStorage.removeItem("reserva")
                        const selectorSuperBloque = document.querySelector("[componente=superBloque]")
                        selectorSuperBloque?.remove()

                        e.target.removeAttribute("style")
                    })
                    bloqueSelecionDias.appendChild(botonBorrarBusquedaAlojamiento);

                    bloquePasosReservaNuevo.appendChild(bloqueSelecionDias);
                    marcoElasticoRelativo.appendChild(bloquePasosReservaNuevo);
                    main.appendChild(marcoElasticoRelativo);
                    if (reservaLocal?.entrada && reservaLocal?.salida) {
                        await casaVitini.ui.vistas.reservasNuevo.reservasNuevoEntrada("botonDisponibilidad")
                    }


                    if (reservaLocal?.alojamiento) {
                        const alojamiento = reservaLocal.alojamiento
                        for (const apartamento in alojamiento) {
                            // recuperar reserva en alojamiento
                            const habitacionesPorApartamento = alojamiento[apartamento]["habitaciones"]
                            for (const habitacion in habitacionesPorApartamento) {
                                const camaIDV = habitacionesPorApartamento[habitacion]["camaIDV"]
                                const constructorSelector = `[apartamentoIDV='${apartamento}'][habitacionIDV='${habitacion}'][camaIDV='${camaIDV}']`
                                document.querySelector(constructorSelector)?.click()
                                const pernoctantes = habitacionesPorApartamento[habitacion]["pernoctantes"]
                                /*
                                  pernoctantes.map((pernoctante, ciclo) => {
                                      const selectorCampoNombre = document.querySelectorAll(`[zona=apartamentoPernoctacion][apartamentoIDV='${apartamento}'] [habitacionidv='${habitacion}'] > [bloquepernoctante=bloquePernoctante] [pernoctante=nombre]`)
                                      const selectorCampoPasaporte = document.querySelectorAll(`[zona=apartamentoPernoctacion][apartamentoIDV='${apartamento}'] [habitacionidv='${habitacion}'] > [bloquepernoctante=bloquePernoctante] [pernoctante=pasaporte]`)
  
                                      if (selectorCampoNombre[ciclo]) {
                                          selectorCampoNombre[ciclo].value = pernoctante?.nombre
  
                                      }
                                      if (selectorCampoPasaporte[ciclo]) {
                                          selectorCampoPasaporte[ciclo].value = pernoctante?.pasaporte
  
                                      }
                                  })
                                  */
                            }
                        }
                    }



                },
                reservaConfirmadaUI: async () => {

                },
                reservasNuevoEntrada: async (componente) => {
                    try {
                        const bloqueCalendario = document.querySelectorAll("[componente=bloqueCalendario]")
                        const calendario = document.querySelector("[contenedor=calendario]")
                        const instanciaUID = casaVitini.componentes.codigoFechaInstancia()
                        document.removeEventListener("click", casaVitini.componentes.ocultarElementos)
                        const fechaEntradaVolatil_Humana = document.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
                        let diaSeleccionadoEntrada
                        let mesSeleccionadoEntrada
                        let anoSeleccionadoEntrada
                        let datosFechaEntradaSeleccionada
                        if (fechaEntradaVolatil_Humana) {
                            const fechaEntradaAarray = fechaEntradaVolatil_Humana.split("/")
                            diaSeleccionadoEntrada = Number(fechaEntradaAarray[0])
                            mesSeleccionadoEntrada = Number(fechaEntradaAarray[1])
                            anoSeleccionadoEntrada = Number(fechaEntradaAarray[2])
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
                        }

                        if (componente === "entrada") {
                            if (calendario?.getAttribute("calendarioIO") === "entrada") {
                                bloqueCalendario.forEach((calendarioRenderizado) => {
                                    calendarioRenderizado.remove()
                                })
                                document.removeEventListener("click", casaVitini.componentes.ocultarElementos)
                                return
                            }
                            if (calendario?.getAttribute("calendarioIO") === "salida") {
                                bloqueCalendario.forEach((calendarioRenderizado) => {
                                    calendarioRenderizado.remove()
                                })
                                document.removeEventListener("click", casaVitini.componentes.ocultarElementos)
                                // return
                            }

                            let reservaLocal = JSON.parse(localStorage.getItem("reserva"))
                            const selectorBloqueFechaEntrada = document.querySelector("[calendario=entrada")
                            const alturaDinamicaArriba = casaVitini.componentes.medirPorJerarquiaDom.vertical.desdeAbajoDelElemento(selectorBloqueFechaEntrada) + 20

                            if (fechaEntradaVolatil_Humana && !fechaSalidaVolatil_Humana) {
                                const metadatos = {
                                    tipoFecha: "entrada",
                                    almacenamientoCalendarioID: "reserva",
                                    perfilMes: "calendario_entrada_publico_sinPasado",
                                    calendarioIO: "entrada",
                                    mensajeInfo: "Selecciona el día de entrada",
                                    alturaDinamica: alturaDinamicaArriba,
                                    instanciaUID: instanciaUID,
                                    metodoSelectorDia: "casaVitini.ui.vistas.reservasNuevo.seleccionarDia"
                                }
                                casaVitini.componentes.constructorCalendarioNuevo(metadatos)

                                const calendario = {
                                    tipo: "personalizado",
                                    comando: "construyeObjeto",
                                    tipoFecha: "entrada",
                                    //  "diaSeleccionado": diaEntradaMemoriaVolatil.Dia,
                                    mes: mesSeleccionadoEntrada,
                                    ano: anoSeleccionadoEntrada
                                }
                                const calendarioPresente = await casaVitini.componentes.resolverCalendarioNuevo(calendario)
                                calendarioPresente.instanciaUID = instanciaUID
                                casaVitini.componentes.constructorMesNuevo(calendarioPresente)

                            }
                            if (!fechaSalidaVolatil_Humana && !fechaEntradaVolatil_Humana) {

                                const tipoFecha = {
                                    tipoFecha: "entrada",
                                    almacenamientoCalendarioID: "reserva",
                                    perfilMes: "calendario_entrada_publico_sinPasado",
                                    calendarioIO: "entrada",
                                    mensajeInfo: "Selecciona el día de entrada",
                                    alturaDinamica: alturaDinamicaArriba,
                                    instanciaUID: instanciaUID,
                                    metodoSelectorDia: "casaVitini.ui.vistas.reservasNuevo.seleccionarDia"

                                }

                                casaVitini.componentes.constructorCalendarioNuevo(tipoFecha)

                                const calendario = {
                                    tipo: "actual",
                                    comando: "construyeObjeto"
                                }
                                const calendarioPresente = await casaVitini.componentes.resolverCalendarioNuevo(calendario)
                                const primeraFechaDisponible = calendarioPresente.limites.primeraFechaDisponible
                                console.log("calendarioPresetne", calendarioPresente)
                                if (calendarioPresente.mes !== primeraFechaDisponible.mes ||
                                    calendarioPresente.ano !== primeraFechaDisponible.ano) {
                                    calendarioPresente.tiempo = "futuro"
                                }
                                // calendarioPresente.dia = calendarioPresente.dia
                                //  calendarioPresente.dia = primeraFechaDisponible.dia
                                calendarioPresente.mes = primeraFechaDisponible.mes
                                calendarioPresente.ano = primeraFechaDisponible.ano



                                if (calendarioPresente.dia === calendarioPresente.numeroDiasPorMes) {
                                    calendarioPresente.ano = Number(calendarioPresente.mes) === 12 ? Number(calendarioPresente.ano) + 1 : Number(calendarioPresente.ano)
                                    calendarioPresente.mes = Number(calendarioPresente.mes) === 12 ? 1 : Number(calendarioPresente.mes) + 1
                                    // calendarioPresente.Dia = 1
                                }
                                calendarioPresente.instanciaUID = instanciaUID
                                casaVitini.componentes.constructorMesNuevo(calendarioPresente)
                            }
                            if (fechaSalidaVolatil_Humana && !fechaEntradaVolatil_Humana) {

                                const metadatos = {
                                    tipoFecha: "entrada",
                                    almacenamientoCalendarioID: "reserva",
                                    perfilMes: "calendario_entrada_publico_sinPasado",
                                    calendarioIO: "entrada",
                                    mensajeInfo: "Selecciona el día de entrada",
                                    alturaDinamica: alturaDinamicaArriba,
                                    instanciaUID: instanciaUID,
                                    metodoSelectorDia: "casaVitini.ui.vistas.reservasNuevo.seleccionarDia"

                                }
                                casaVitini.componentes.constructorCalendarioNuevo(metadatos)

                                const calendario = {
                                    tipo: "personalizado",
                                    comando: "construyeObjeto",
                                    tipoFecha: "entrada",
                                    mes: mesSeleccionadoSalida,
                                    ano: anoSeleccionadoSalida
                                }


                                calendarioPersonalizado = await casaVitini.componentes.resolverCalendarioNuevo(calendario)
                                calendarioPersonalizado.instanciaUID = instanciaUID
                                casaVitini.componentes.constructorMesNuevo(calendarioPersonalizado)
                            }

                            if (fechaSalidaVolatil_Humana && fechaEntradaVolatil_Humana) {
                                const metadatos = {
                                    tipoFecha: "entrada",
                                    almacenamientoCalendarioID: "reserva",
                                    perfilMes: "calendario_entrada_publico_sinPasado",
                                    calendarioIO: "entrada",
                                    mensajeInfo: "Selecciona el día de entrada",
                                    alturaDinamica: alturaDinamicaArriba,
                                    instanciaUID: instanciaUID,
                                    metodoSelectorDia: "casaVitini.ui.vistas.reservasNuevo.seleccionarDia"

                                }
                                casaVitini.componentes.constructorCalendarioNuevo(metadatos)


                                const calendario = {
                                    tipo: "personalizado",
                                    comando: "construyeObjeto",
                                    mes: mesSeleccionadoEntrada,
                                    ano: anoSeleccionadoEntrada
                                }

                                calendarioPersonalizado = await casaVitini.componentes.resolverCalendarioNuevo(calendario)
                                calendarioPersonalizado.instanciaUID = instanciaUID
                                await casaVitini.componentes.constructorMesNuevo(calendarioPersonalizado)
                            }
                            document.addEventListener("click", casaVitini.componentes.ocultarElementos)

                        }
                        if (componente === "salida") {

                            if (calendario?.getAttribute("calendarioIO") === "salida") {
                                bloqueCalendario.forEach((calendarioRenderizado) => {
                                    calendarioRenderizado.remove()
                                })
                                document.removeEventListener("click", casaVitini.componentes.ocultarElementos)
                                return
                            }
                            if (calendario?.getAttribute("calendarioIO") === "entrada") {
                                bloqueCalendario.forEach((calendarioRenderizado) => {
                                    calendarioRenderizado.remove()
                                })
                                document.removeEventListener("click", casaVitini.componentes.ocultarElementos)
                                //return

                            }

                            const selectorBloqueFechaEntrada = document.querySelector("[calendario=entrada")
                            const alturaDinamicaArriba = casaVitini.componentes.medirPorJerarquiaDom.vertical.desdeAbajoDelElemento(selectorBloqueFechaEntrada) + 20

                            const tipoFecha = {
                                tipoFecha: "salida",
                                almacenamientoCalendarioID: "reserva",
                                perfilMes: "calendario_salida_publico_sinPasado",
                                calendarioIO: "salida",
                                mensajeInfo: "Selecciona el día de salida",
                                alturaDinamica: alturaDinamicaArriba,
                                instanciaUID: instanciaUID,
                                metodoSelectorDia: "casaVitini.ui.vistas.reservasNuevo.seleccionarDia"


                            }
                            casaVitini.componentes.constructorCalendarioNuevo(tipoFecha)


                            let diaEntradaSelecioando
                            let calendarioPersonalizado
                            if (fechaEntradaVolatil_Humana && !fechaSalidaVolatil_Humana) {
                                const calendario = {
                                    tipo: "personalizado",
                                    comando: "construyeObjeto",
                                    tipoFecha: "entrada",
                                    mes: mesSeleccionadoEntrada,
                                    ano: anoSeleccionadoEntrada
                                }


                                diaEntradaSelecioando = diaSeleccionadoEntrada
                                calendarioPersonalizado = await casaVitini.componentes.resolverCalendarioNuevo(calendario)
                                calendarioPersonalizado.instanciaUID = instanciaUID
                                casaVitini.componentes.constructorMesNuevo(calendarioPersonalizado)

                            }
                            if (fechaSalidaVolatil_Humana && !fechaEntradaVolatil_Humana) {
                                const calendario = {
                                    tipo: "personalizado",
                                    comando: "construyeObjeto",
                                    tipoFecha: "salida",
                                    mes: mesSeleccionadoSalida,
                                    ano: anoSeleccionadoSalida
                                }


                                calendarioPersonalizado = await casaVitini.componentes.resolverCalendarioNuevo(calendario)
                                calendarioPersonalizado.instanciaUID = instanciaUID
                                casaVitini.componentes.constructorMesNuevo(calendarioPersonalizado)
                            }

                            if (!fechaSalidaVolatil_Humana && !fechaEntradaVolatil_Humana) {
                                const calendario = {
                                    tipo: "actual",
                                    comando: "construyeObjeto",
                                }

                                const calendarioPresente = await casaVitini.componentes.resolverCalendarioNuevo(calendario)

                                const primeraFechaDisponible = calendarioPresente.limites.primeraFechaDisponible


                                if (calendarioPresente.mes !== primeraFechaDisponible.mes ||
                                    calendarioPresente.ano !== primeraFechaDisponible.ano) {
                                    calendarioPresente.tiempo = "futuro"
                                }

                                // calendarioPresente.dia = primeraFechaDisponible.dia
                                calendarioPresente.mes = primeraFechaDisponible.mes
                                calendarioPresente.ano = primeraFechaDisponible.ano

                                if (calendarioPresente.dia === calendarioPresente.numeroDiasPorMes) {
                                    calendarioPresente.ano = Number(calendarioPresente.mes) === 12 ? Number(calendarioPresente.ano) + 1 : Number(calendarioPresente.ano)
                                    calendarioPresente.mes = Number(calendarioPresente.mes) === 12 ? 1 : Number(calendarioPresente.mes) + 1
                                    // calendarioPresente.Dia = 1
                                }

                                calendarioPresente.instanciaUID = instanciaUID
                                casaVitini.componentes.constructorMesNuevo(calendarioPresente)
                            }

                            if (fechaSalidaVolatil_Humana && fechaEntradaVolatil_Humana) {
                                let calendario = {
                                    tipo: "personalizado",
                                    comando: "construyeObjeto",
                                    tipoFecha: "salida",
                                    mes: mesSeleccionadoSalida,
                                    ano: anoSeleccionadoSalida
                                }

                                calendarioPersonalizado = await casaVitini.componentes.resolverCalendarioNuevo(calendario)
                                calendarioPersonalizado.instanciaUID = instanciaUID
                                await casaVitini.componentes.constructorMesNuevo(calendarioPersonalizado)
                            }
                            document.addEventListener("click", casaVitini.componentes.ocultarElementos)

                        }
                        if (componente === "botonDisponibilidad") {
                            casaVitini.componentes.ocultarElementos()
                            let reservaLocal = JSON.parse(localStorage.getItem("reserva"))
                            let seccion = document.querySelector("section:not([estado=obsoleto])")

                            const instanciaUID = casaVitini.componentes.codigoFechaInstancia()

                            const bloqueCalendario = document.createElement("div")
                            bloqueCalendario.setAttribute("class", "bloqueCalendarioNuevo")
                            // bloqueCalendario.style.top = PosicionAlto + "px"

                            const cartelInfoCalendarioEstado = document.createElement("div")
                            cartelInfoCalendarioEstado.setAttribute("class", "cartelInfoCalendarioEstado")
                            cartelInfoCalendarioEstado.setAttribute("componente", "infoCalendario")


                            if (!fechaEntradaVolatil_Humana) {
                                const error = "Selecciona una fecha de entrada pulsando en el cuadrado de fecha de entrada y seleccionando la fecha en el calendario flotante"
                                return casaVitini.ui.vistas.advertenciaInmersiva(error)
                            }
                            if (!fechaSalidaVolatil_Humana) {
                                const error = "Selecciona una fecha de salida pulsando en el cuadro de fecha de salida y seleccionando la fecha en el calendario flotante"
                                return casaVitini.ui.vistas.advertenciaInmersiva(error)
                            }
                            document.body.classList.add("difuminadoFondo")

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
                            info.innerText = "Buscando alojamiento..."
                            contenedorEstadoBusqueda.appendChild(info)

                            const boton = document.createElement("div")
                            boton.setAttribute("class", "errorBoton")
                            boton.classList.add("blur")
                            boton.innerText = "Cancelar"
                            boton.addEventListener("click", () => {
                                document.querySelector(`[instanciaUID="${instanciaUID}"]`).remove()
                                document.body.removeAttribute("class")

                            })

                            contenedorEstadoBusqueda.appendChild(boton)
                            superBloqueReserva.appendChild(contenedorEstadoBusqueda)
                            contenedorBusquedaAlojamiento.appendChild(superBloqueReserva)

                            const botonBorrarBusquedaAlojamiento = document.querySelector("[componente=botonBorrarBusquedaAlojamiento]")
                            botonBorrarBusquedaAlojamiento.style.display = "flex"


                            const fechaEntradaArray = fechaEntradaVolatil_Humana.split("/")
                            const fechaSalidaArray = fechaSalidaVolatil_Humana.split("/")

                            const diaEntrada = fechaEntradaArray[0].padStart("2", 0)
                            const mesEntrada = fechaEntradaArray[1].padStart("2", 0)
                            const anoEntrada = fechaEntradaArray[2].padStart("4", 0)

                            const diaSalida = fechaSalidaArray[0].padStart("2", 0)
                            const mesSalida = fechaSalidaArray[1].padStart("2", 0)
                            const anoSalida = fechaSalidaArray[2].padStart("4", 0)

                            const fechaEntrada = `${diaEntrada}/${mesEntrada}/${anoEntrada}`
                            const fechaSalida = `${diaSalida}/${mesSalida}/${anoSalida}`
                            document.querySelector("[componente=botonDisponibilidad]").classList.remove("parpadeaFondo")

                            const transaccion = {
                                zona: "plaza/reservas/apartamentosDisponiblesPublico",
                                entrada: fechaEntrada,
                                salida: fechaSalida
                            }

                            const respuestaServidor = await casaVitini.componentes.servidor(transaccion)

                            if (!document.querySelector(`[instanciaUID="${instanciaUID}"]`)) {
                                return
                            }
                            let apartamentosDisponibles
                            if (respuestaServidor?.error) {
                                document.querySelector(`[instanciaUID="${instanciaUID}"]`).remove()
                                return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
                            }

                            if (respuestaServidor.ok) {
                                apartamentosDisponibles = respuestaServidor?.ok.apartamentosDisponibles
                            }

                            const superBloqueReservaRenderizado = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                            superBloqueReservaRenderizado.innerHTML = null
                            if (!superBloqueReservaRenderizado) {
                                return
                            }

                            if (Object.keys(apartamentosDisponibles).length === 0) {
                                const infoSinAlojamiento = document.createElement("p")
                                infoSinAlojamiento.setAttribute("class", "plaza_alojamiento_infoSinAlojamientoDisponible")
                                infoSinAlojamiento.innerText = "No hay níngun alojamiento dispopnible para las fechas seleccionadas."
                                superBloqueReservaRenderizado.appendChild(infoSinAlojamiento);
                                return
                            }
                            document.body.classList.add("difuminadoFondo")

                            const tituloBloqueAlojamiento = document.createElement("p")
                            tituloBloqueAlojamiento.setAttribute("class", "tituloBloqueAlojamiento parpadeaFondoTransparente")
                            tituloBloqueAlojamiento.setAttribute("componente", "tituloInfoSeleccionar")

                            tituloBloqueAlojamiento.innerText = "Aquí tienes el alojamiento disponible para seleccionar."
                            superBloqueReservaRenderizado.appendChild(tituloBloqueAlojamiento);


                            const bloqueAlojamientoUI = document.createElement("div")
                            bloqueAlojamientoUI.classList.add("bloqueAlojamiento")
                            bloqueAlojamientoUI.setAttribute("contenedor", "alojamiento")
                            superBloqueReservaRenderizado.appendChild(bloqueAlojamientoUI)

                            const desgloseTotalesPorApartmentos = respuestaServidor?.ok.desgloseFinanciero.totalesPorApartamento
                            const desgloseTotalesFormateado = {}
                            desgloseTotalesPorApartmentos.map((detallesApartamento) => {
                                const apartamentoIDV = detallesApartamento.apartamentoIDV
                                desgloseTotalesFormateado[apartamentoIDV] = detallesApartamento

                            })

                            for (const apartamento of Object.entries(apartamentosDisponibles)) {

                                const apartamentoIDV = apartamento[0]
                                const apartamentoUI = apartamento[1].apartamentoUI
                                const habitaciones = apartamento[1].habitaciones
                                const caracteristicas = apartamento[1].caracteristicas

                                // let precioBrutoPorDia = apartamento[1].preciosTotales.totalBrutoPordia
                                const instanciaUID = casaVitini.componentes.codigoFechaInstancia()

                                const bloqueApartamento = document.createElement("div")
                                bloqueApartamento.setAttribute("class", "plaza_alojamiento_contenedorApartamento")
                                bloqueApartamento.setAttribute("apartamentoIDV", apartamentoIDV)
                                bloqueApartamento.setAttribute("apartamentoUI", apartamentoUI)
                                bloqueApartamento.setAttribute("instanciaUID", instanciaUID)
                                bloqueApartamento.setAttribute("habitaciones", JSON.stringify(habitaciones))

                                bloqueApartamento.addEventListener("click", (e) => {

                                    const selectorApartamento = document.querySelector(`[apartamentoIDV="${apartamentoIDV}"]`)
                                    const selectorSelectorApartamento = selectorApartamento.querySelector("[componente=selectorApartamento]")

                                    if (selectorApartamento.getAttribute("estadoApartamento") !== "seleccionado") {
                                        selectorApartamento.setAttribute("estadoApartamento", "seleccionado")
                                        selectorSelectorApartamento.style.opacity = "1"
                                    } else {
                                        selectorApartamento.removeAttribute("estadoApartamento")
                                        selectorSelectorApartamento.removeAttribute("style")
                                    }

                                    const selectorApartamentosSeleccionados = document.querySelectorAll("[estadoApartamento=seleccionado]")
                                    const marcoFlotante = document.querySelector("[componente=marcoFlotanteIrAResumen]")
                                    const selectorInfoTextoParpadeo = document.querySelector("[componente=tituloInfoSeleccionar]")
                                    if (selectorApartamentosSeleccionados.length > 0) {
                                        selectorInfoTextoParpadeo.classList.remove("parpadeaFondoTransparente")
                                        marcoFlotante.style.opacity = "1"
                                        marcoFlotante.querySelector("[componente=botonIrAResumenReserva]")
                                            .style.pointerEvents = "all"

                                    } else {
                                        selectorInfoTextoParpadeo.classList.add("parpadeaFondoTransparente")
                                        marcoFlotante.removeAttribute("style")
                                        marcoFlotante.querySelector("[componente=botonIrAResumenReserva]")
                                            .removeAttribute("style")
                                    }

                                })

                                const bloqueImagen = document.createElement("div")
                                bloqueImagen.setAttribute("class", "bloqueImagen")
                                // bloqueTituloImagen.appendChild(bloqueImagen)

                                const contenedorTitulo = document.createElement("div")
                                contenedorTitulo.classList.add("plaza_alojamiento_contenedorApartamento_contenedorTitulo")

                                const bloqueVerticalTitulo = document.createElement("div")
                                bloqueVerticalTitulo.setAttribute("class", "bloqueVerticalTitulo")

                                const elementoTituloNombre = document.createElement("div")
                                elementoTituloNombre.setAttribute("class", "elementoTituloPrincipal")
                                elementoTituloNombre.innerText = apartamentoUI
                                bloqueVerticalTitulo.appendChild(elementoTituloNombre)

                                const bloqueTituloApartamentoComponenteUI = document.createElement("div")
                                bloqueTituloApartamentoComponenteUI.setAttribute("class", "tituloApartamentoComponenteUI")
                                bloqueVerticalTitulo.appendChild(bloqueTituloApartamentoComponenteUI)

                                contenedorTitulo.appendChild(bloqueVerticalTitulo)

                                const bloqueCaracteristicas = document.createElement("div")
                                bloqueCaracteristicas.classList.add("plaza_alojamiento_contenedorApartmento_contenedorCaracteristicas")

                                for (const caracteristica of caracteristicas) {
                                    const caracteristicaUI = document.createElement("div")
                                    caracteristicaUI.classList.add("plaza_alojamiento_contenedorCaracteristicas_caracteristicas")
                                    caracteristicaUI.innerText = caracteristica.caracteristica
                                    bloqueCaracteristicas.appendChild(caracteristicaUI)
                                }


                                contenedorTitulo.appendChild(bloqueCaracteristicas)

                                bloqueApartamento.appendChild(contenedorTitulo)

                                const elementoTituloCocina = document.createElement("div")
                                elementoTituloCocina.setAttribute("class", "elementoTitulo")
                                elementoTituloCocina.innerText = `${desgloseTotalesFormateado[apartamentoIDV].totalBrutoRango}$ Total con impuestos incluidos`
                                bloqueTituloApartamentoComponenteUI.appendChild(elementoTituloCocina)

                                const bloqueHabitaciones = document.createElement("div")
                                bloqueHabitaciones.classList.add("plaza_alojamiento_contenedorApartmento_contenedorHabitaciones")
                                bloqueHabitaciones.setAttribute("componente", "bloqueHabitaciones")

                                const checkUI = document.createElement("div")
                                checkUI.classList.add("plaza_alojamiento_contenedorApartmento_check")
                                checkUI.setAttribute("componente", "selectorApartamento")
                                checkUI.innerText = "Seleccionado"
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
                                        // e.stopPropagation()
                                    })

                                    const habitacionNombre = document.createElement("div")
                                    habitacionNombre.setAttribute("class", "habitacionNombre")
                                    habitacionNombre.innerText = habitacionUI
                                    habitacionBloque.appendChild(habitacionNombre)
                                    if (numeroDeCamasPorHabitacion > 1) {
                                        const infoHabitacion = document.createElement("div")
                                        infoHabitacion.classList.add("plaza_alojamiento_contenedorHabitacion_infoSeleccionTipoCama")
                                        infoHabitacion.setAttribute("componente", "infoSeleccionCama")
                                        infoHabitacion.innerText = "Selecciona el tipo de cama para la habitación."
                                        habitacionBloque.appendChild(infoHabitacion)

                                    }

                                    if (numeroDeCamasPorHabitacion === 1) {
                                        const infoHabitacion = document.createElement("div")
                                        infoHabitacion.classList.add("plaza_alojamiento_contenedorHabitacion_infoSeleccionTipoCama")
                                        infoHabitacion.innerText = "Esta habitación solo dispone de este tipo de cama. Al seleccionar este apartamento, se selecciona esta cama para esta habitación"
                                        habitacionBloque.appendChild(infoHabitacion)

                                    }

                                    const bloqueHabitacionCamas = document.createElement("div")
                                    bloqueHabitacionCamas.setAttribute("class", "bloqueHabitacion")
                                    // 

                                    for (const configuracionHabitacion of Object.entries(configuracionesHabitacion)) {

                                        const camaIDV = configuracionHabitacion[1].camaIDV
                                        const camaUI = configuracionHabitacion[1].camaUI
                                        const capacidad = configuracionHabitacion[1].capacidad

                                        const bloqueCama = document.createElement("div")
                                        bloqueCama.setAttribute("class", "habitacionCamas")
                                        bloqueCama.setAttribute("camaIDV", camaIDV)
                                        bloqueCama.setAttribute("capacidadPernoctativa", capacidad)
                                        bloqueCama.setAttribute("componente", "botonSelectorCama")
                                        bloqueCama.innerText = camaUI
                                        if (numeroDeCamasPorHabitacion > 1) {
                                            bloqueCama.addEventListener("click", (e) => {
                                                e.stopPropagation()
                                                const datosCama = {
                                                    apartamentoIDV: apartamentoIDV,
                                                    habitacionIDV: habitacionIDV,
                                                    camaIDV: camaIDV
                                                }
                                                casaVitini.ui.vistas.reservasNuevo.seleccionarCama(datosCama)
                                            })
                                        }

                                        bloqueHabitacionCamas.appendChild(bloqueCama)

                                        habitacionBloque.appendChild(bloqueCama)
                                    }


                                    //   bloqueHabitacionCamas.appendChild(habitacionNombre)
                                    bloqueHabitaciones.appendChild(habitacionBloque)
                                }
                                // bloqueTituloImagen.appendChild(bloqueHabitaciones)
                                bloqueAlojamientoUI.appendChild(bloqueApartamento)
                                const metadatos = {
                                    apartamentoIDV: apartamentoIDV,
                                    instanciaUID: instanciaUID,
                                }

                                casaVitini.ui.vistas.reservasNuevo.obtenerImagenApartamento(metadatos)
                                // Imagen apartamento aqui
                            }




                            const marcoBotonFlotanteIrAResumenReserva = document.createElement("div")
                            marcoBotonFlotanteIrAResumenReserva.classList.add("plaza_alojamiento_marcoBotonIreAResumenReserva")
                            marcoBotonFlotanteIrAResumenReserva.setAttribute("componente", "marcoFlotanteIrAResumen")



                            const marcoIntermedio = document.createElement("div")
                            marcoIntermedio.classList.add("plaza_alojamiento_marcoIntermedioBotonIrResumenReserva")


                            const botonResumenReserva = document.createElement("div")
                            botonResumenReserva.classList.add("plaza_alojamiento_boronResumenReservaEnMarcoFlotante")
                            botonResumenReserva.classList.add("parpadeaFondoSemiBlanco")

                            botonResumenReserva.setAttribute("componente", "botonIrAResumenReserva")

                            botonResumenReserva.innerText = "Ir al resumen de mi reserva"
                            botonResumenReserva.addEventListener("click", casaVitini.ui.vistas.reservasNuevo.iraResumenReserva)


                            marcoIntermedio.append(botonResumenReserva)
                            marcoBotonFlotanteIrAResumenReserva.append(marcoIntermedio)
                            superBloqueReservaRenderizado.appendChild(marcoBotonFlotanteIrAResumenReserva)
                        }
                    } catch (errorCapturado) {
                        const mensajeError = errorCapturado.message
                        casaVitini.ui.vistas.advertenciaInmersiva(mensajeError)
                    }

                },
                resumenReserva: async () => {
                    document.body.style.backgroundImage = "url(/componentes/imagenes/fotos/image00018.jpeg)"
                    document.body.classList.add("difuminadoFondo")

                    const instanciaUID = document.querySelector("main").getAttribute("instanciaUID")

                    const reservaLocal = JSON.parse(sessionStorage.getItem("reserva"))
                    const espacioConfirmarReserva = document.querySelector("[componente=espacioConfirmarReserva]")

                    if (!reservaLocal) {
                        espacioConfirmarReserva.innerHTML = null
                        // Añadir banner informativo
                        const botonIrAReservaConfirmada = document.createElement("a")
                        botonIrAReservaConfirmada.classList.add("plaza_reservas_reservaConfiramda_banner")
                        botonIrAReservaConfirmada.innerText = "Tienes una reserva guardada en la cache de tu navegador. Esta reserva se ha guardado tras confirmar tu reserva. Para ver los detalles de la confirmación pulsa aquí. Si borras la cache de tu navegador esta información desaparecerá. Si quieres un acceso persistente puedes crear un VitiniID desde MiCasa."
                        botonIrAReservaConfirmada.setAttribute("href", "/alojamiento/reserva_confirmada")
                        botonIrAReservaConfirmada.setAttribute("vista", "/alojamiento/reserva_confirmada")
                        botonIrAReservaConfirmada.addEventListener("click", casaVitini.componentes.cambiarVista)
                        espacioConfirmarReserva.appendChild(botonIrAReservaConfirmada)

                        // Añadir banner informativo
                        const botonIrAlInicioDelProcesoDeReserva = document.createElement("a")
                        botonIrAlInicioDelProcesoDeReserva.classList.add("plaza_reservas_reservaConfiramda_banner")
                        botonIrAlInicioDelProcesoDeReserva.innerText = "Ir al incio del proceso de la reserva"
                        botonIrAlInicioDelProcesoDeReserva.setAttribute("href", "/alojamiento")
                        botonIrAlInicioDelProcesoDeReserva.setAttribute("vista", "/alojamiento")
                        botonIrAlInicioDelProcesoDeReserva.addEventListener("click", casaVitini.componentes.cambiarVista)
                        espacioConfirmarReserva.appendChild(botonIrAlInicioDelProcesoDeReserva)
                        return
                    }
                    espacioConfirmarReserva.setAttribute("pasarelaZonaDePago", "confirmarReserva")

                    const fechaEntrada = reservaLocal.entrada
                    const fechaSalida = reservaLocal.salida

                    const fechaEntrada_Array = fechaEntrada.split('/');
                    const fechaSalida_Array = fechaSalida.split('/');

                    // Eliminar ceros a la izquierda
                    const diaEntrada = parseInt(fechaEntrada_Array[0], 10);
                    const mesEntrada = parseInt(fechaEntrada_Array[1], 10);
                    const anoEntrada = parseInt(fechaEntrada_Array[2], 10);

                    const diaSalida = parseInt(fechaSalida_Array[0], 10);
                    const anoSalida = parseInt(fechaSalida_Array[1], 10);
                    const mesSalida = parseInt(fechaSalida_Array[2], 10);


                    // Formatear la fecha sin ceros a la izquierda
                    const contructorFechaEntrada_Humana = `${diaEntrada}/${mesEntrada}/${anoEntrada}`;
                    const contructorFechaSalida_Humana = `${diaSalida}/${anoSalida}/${mesSalida}`;

                    // Limpiar ceros

                    const selectorFechaEntrada = document.querySelector(`#fechaEntrada`)
                    const selectorFechaSalida = document.querySelector(`#fechaSalida`)

                    selectorFechaEntrada.innerText = contructorFechaEntrada_Humana

                    selectorFechaSalida.innerText = contructorFechaSalida_Humana
                    const alojamiento = reservaLocal.alojamiento

                    const bloqueAlojamiento = document.querySelector("[resumen=alojamiento]")

                    const bloqueConjuntoApartamentos = document.createElement("div")
                    bloqueConjuntoApartamentos.setAttribute("class", "bloqueConjuntoApartamentos")
                    bloqueAlojamiento.appendChild(bloqueConjuntoApartamentos)
                    for (const apartamento of Object.entries(alojamiento)) {
                        const apartamentoIDV = apartamento[0]
                        const apartamentoUI = apartamento[1].apartamentoUI
                        const habitaciones = apartamento[1].habitaciones

                        const bloqueApartamento = document.createElement("div")
                        bloqueApartamento.setAttribute("class", "bloqueApartamenteo")
                        bloqueApartamento.setAttribute("apartamentoIDV", apartamentoIDV)


                        const tituloApartamentoComponenteUI = document.createElement("p")
                        tituloApartamentoComponenteUI.setAttribute("class", "tituloMedia")
                        tituloApartamentoComponenteUI.setAttribute("apartamentoUI", apartamentoUI)

                        tituloApartamentoComponenteUI.innerText = apartamentoUI
                        bloqueApartamento.appendChild(tituloApartamentoComponenteUI)



                        const contenedorHabitaciones = document.createElement("div")
                        contenedorHabitaciones.classList.add("plaza_alojamiento_resumenReserva_contenedorHabitacaciones")


                        for (const habitacion of Object.entries(habitaciones)) {
                            const habitacionIDV = habitacion[0]
                            const habitacionUI = habitacion[1].habitacionUI
                            const configuracionesCama = habitacion[1].configuraciones

                            const bloqueHabitaciones = document.createElement("div")
                            bloqueHabitaciones.classList.add("plaza_alojamiento_resumenReserva_bloqueHabitaciones")


                            const bloqueHabitacion = document.createElement("div")
                            bloqueHabitacion.setAttribute("class", "plaza_alojamiento_resumenReserva_bloqueHabitacion")
                            bloqueHabitacion.setAttribute("habitacionIDV", habitacionIDV)

                            bloqueApartamento.appendChild(bloqueHabitacion)

                            const tituloHabitacion = document.createElement("p")
                            tituloHabitacion.setAttribute("class", "tituloBloqueHabitacion")
                            tituloHabitacion.setAttribute("habitacionUI", habitacionUI)
                            tituloHabitacion.innerText = habitacionUI

                            bloqueHabitacion.appendChild(tituloHabitacion)



                            if (Object.entries(configuracionesCama).length > 1) {

                                const selectorCama = document.createElement("select")
                                selectorCama.classList.add("usuariosCrearCuenta_campoUsuario")
                                selectorCama.setAttribute("componente", "selectorCama")
                                selectorCama.addEventListener("change", (e) => {

                                    const apartamentoIDV = e.target.closest("[apartamentoIDV]").getAttribute("apartamentoIDV")
                                    const habitacionIDV = e.target.closest("[habitacionIDV]").getAttribute("habitacionIDV")

                                    const camaIDV = e.target.value
                                    const camaUI = e.target.options[e.target.selectedIndex].getAttribute("camaUI");
                                    const reservaIN = JSON.parse(sessionStorage.getItem("reserva"))

                                    reservaIN.alojamiento[apartamentoIDV].habitaciones[habitacionIDV].camaSeleccionada = {
                                        camaIDV: camaIDV,
                                        camaUI: camaUI
                                    }

                                    const reservaOUT = JSON.stringify(reservaIN)
                                    sessionStorage.setItem("reserva", reservaOUT)

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
                                camaUnica.innerText = camaUI //+" (Unica cama disponible para esta habitación)"
                                bloqueHabitacion.appendChild(camaUnica)

                                const reservaIN = JSON.parse(sessionStorage.getItem("reserva"))

                                reservaIN.alojamiento[apartamentoIDV].habitaciones[habitacionIDV].camaSeleccionada = {
                                    camaIDV: camaIDV,
                                    camaUI: camaUI
                                }

                                const reservaOUT = JSON.stringify(reservaIN)
                                sessionStorage.setItem("reserva", reservaOUT)

                            }




                        }
                        bloqueApartamento.appendChild(contenedorHabitaciones)
                        bloqueConjuntoApartamentos.appendChild(bloqueApartamento)
                    }
                    const botonModificarReserva = document.querySelector("[boton=modificarReserva]")
                    botonModificarReserva.setAttribute("vista", "/alojamiento")
                    botonModificarReserva.addEventListener("click", casaVitini.componentes.cambiarVista)
                    const botonPreConfirmar = document.querySelector("[boton=preConfirmar]")
                    botonPreConfirmar.addEventListener("click", casaVitini.ui.vistas.reservasNuevo.preConfirmar)

                    const botonBaypaseo = document.querySelector("[boton=baypasearPasarela]")
                    botonBaypaseo?.addEventListener("click", async () => {
                        // Esto es el byPASS
                        const reservaLocal = JSON.parse(sessionStorage.getItem("reserva"))

                        const datosTitular = {
                            nombreTitular: "Manolo",
                            pasaporteTitular: "ESGEHRT&YGE",
                            correoTitular: "manolocalvo@gmail.com",
                            telefonoTitular: "1234567890"
                        }
                        reservaLocal.datosTitular = datosTitular

                        const transacccion = {
                            zona: "plaza/reservas/confirmarReserva",
                            reserva: reservaLocal
                        }

                        const respuestaServidor = await casaVitini.componentes.servidor(transacccion)
                        if (respuestaServidor?.error) {
                            casaVitini.componentes.limpiarAdvertenciasInmersivas()
                            casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
                        }

                    })

                    // Ojo por que parece ser que si tarda en cargarse mas el archivo square.js que lo de abajo hay un problemon
                    /*
                    try {
                        await casaVitini.componentes.square.crearSesionPago(instanciaUID);
                        await casaVitini.componentes.square.inyectorSquareJS(instanciaUID);
                        await casaVitini.componentes.square.inyectorMetodosPago(instanciaUID);
                        await casaVitini.componentes.square.inyectorFlujoPago(instanciaUID);
                    } catch (error) {
                        return casaVitini.ui.vistas.advertenciaInmersiva(error.message)
                    }
                    */
                    // Obten precio e imprimelo
                    const metadatos = {
                        tipoFormatoReserva: "objetoLocal_reservaNoConfirmada"
                    }

                    const desgloseTotalReserva = await casaVitini.componentes.obtenerPrecioReserva(metadatos)
                    console.log("desgloseTotalReserva", desgloseTotalReserva)
                    const totalesPorApartamento = desgloseTotalReserva.desgloseFinanciero.totalesPorApartamento
                    const totalesPorNoche = desgloseTotalReserva.desgloseFinanciero.totalesPorNoche
                    const ofertas = desgloseTotalReserva.desgloseFinanciero.ofertas
                    const impuestos = desgloseTotalReserva.desgloseFinanciero.impuestos
                    const totales = desgloseTotalReserva.desgloseFinanciero.totales
                    const totalConImpuestos = totales.totalConImpuestos

                    const destino = "[componente=espacioInfoTotales]"
                    const desgloseTotales = {
                        totalesPorApartamento: totalesPorApartamento,
                        totalesPorNoche: totalesPorNoche,
                        totales: totales,
                        impuestos: impuestos,
                        ofertas: ofertas,
                        destino: destino
                    }
                    // casaVitini.componentes.ui.totales(desgloseTotales)


                    const selectorTotalConImpuestos = document.querySelector("[componente=totalConImpuestos]")
                    if (selectorTotalConImpuestos) {
                        selectorTotalConImpuestos.innerText = totalConImpuestos + "$"
                    }

                    const selectorBotonDespliegaDesgloseTotal = document.querySelector("[componente=botonDespliegaDesgloseTotal]")
                    selectorBotonDespliegaDesgloseTotal.addEventListener("click", () => {

                        const instanciaUID = casaVitini.componentes.codigoFechaInstancia()
                        document.body.style.overflow = 'hidden';

                        const advertenciaInmersivaIU = document.createElement("div")
                        advertenciaInmersivaIU.setAttribute("class", "advertenciaInmersiva")
                        advertenciaInmersivaIU.setAttribute("componente", "advertenciaInmersiva")
                        advertenciaInmersivaIU.setAttribute("contenedor", "opcionesCancelacion")
                        advertenciaInmersivaIU.setAttribute("instanciaUID", instanciaUID)

                        const contenedorAdvertenciaInmersiva = document.createElement("div")
                        contenedorAdvertenciaInmersiva.classList.add("contenedorAdvertencaiInmersiva")

                        const contenidoAdvertenciaInmersiva = document.createElement("div")
                        contenidoAdvertenciaInmersiva.classList.add("contenidoAdvertenciaInmersiva")
                        contenidoAdvertenciaInmersiva.setAttribute("contenedor", "contenidoAdvertenciaInmersiva")

                        const contenedorDesgloseTotales = document.createElement("div")
                        contenedorDesgloseTotales.classList.add("administracion_reservas_detallesReservas_cancelarReserva_contenedorCancelacion")

                        const testInfo = document.createElement("div")
                        testInfo.classList.add("plaza_resumenReserva_textoInfo")
                        testInfo.innerText = "A continuación, se presentan los detalles del desglose completo del importe total de la reserva. Aquí encontrarás una explicación detallada de cada componente que contribuye al costo total. Este desglose incluye los diversos cargos, impuestos u otros conceptos asociados con tu reserva. Revisar estos detalles te proporcionará una comprensión transparente de los costos involucrados en tu elección de alojamiento. ¡Estamos comprometidos a brindarte la información necesaria para que tu experiencia de reserva sea clara y sin sorpresas!"
                        contenedorDesgloseTotales.appendChild(testInfo)

                        const contenedorTotales = document.createElement("div")
                        contenedorTotales.setAttribute("contenedor", "espacioGlobalTotales")
                        //contenedorTotales.innerHTML = codigoTotales
                        contenedorDesgloseTotales.appendChild(contenedorTotales)


                        const botonCancelarProcesoCancelacion = document.createElement("div")
                        botonCancelarProcesoCancelacion.classList.add("detallesReservaCancelarBoton")
                        botonCancelarProcesoCancelacion.innerText = "Cerrar y volver al resumen de la reserva"
                        botonCancelarProcesoCancelacion.addEventListener("click", casaVitini.componentes.limpiarAdvertenciasInmersivas)
                        contenedorDesgloseTotales.appendChild(botonCancelarProcesoCancelacion)

                        contenidoAdvertenciaInmersiva.appendChild(contenedorDesgloseTotales)
                        contenedorAdvertenciaInmersiva.appendChild(contenidoAdvertenciaInmersiva)
                        advertenciaInmersivaIU.appendChild(contenedorAdvertenciaInmersiva)

                        document.body.appendChild(advertenciaInmersivaIU)

                        const destino = `[instanciaUID="${instanciaUID}"] [contenedor=espacioGlobalTotales]`
                        const desgloseTotales = {
                            totalesPorApartamento: totalesPorApartamento,
                            totalesPorNoche: totalesPorNoche,
                            totales: totales,
                            impuestos: impuestos,
                            ofertas: ofertas,
                            destino: destino
                        }
                        casaVitini.componentes.ui.totales(desgloseTotales)
                    })

                },
                iraResumenReserva: () => {

                    const reservaLocal = {}
                    const fechaEntradaVolatil_Humana = document.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
                    const fechaSalidaVolatil_Humana = document.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")

                    const fechaEntradaArray = fechaEntradaVolatil_Humana.split("/")
                    const fechaSalidaArray = fechaSalidaVolatil_Humana.split("/")

                    const diaEntrada = fechaEntradaArray[0].padStart("2", 0)
                    const mesEntrada = fechaEntradaArray[1].padStart("2", 0)
                    const anoEntrada = fechaEntradaArray[2].padStart("4", 0)

                    const diaSalida = fechaSalidaArray[0].padStart("2", 0)
                    const mesSalida = fechaSalidaArray[1].padStart("2", 0)
                    const anoSalida = fechaSalidaArray[2].padStart("4", 0)


                    reservaLocal["entrada"] = `${diaEntrada}/${mesEntrada}/${anoEntrada}`
                    reservaLocal["salida"] = `${diaSalida}/${mesSalida}/${anoSalida}`

                    reservaLocal["alojamiento"] = {}

                    const apartamentosSeleccionados = document.querySelectorAll("[estadoApartamento=seleccionado]")
                    apartamentosSeleccionados.forEach((apartamento) => {
                        const apartamentoIDV = apartamento.getAttribute("apartamentoIDV")
                        const apartamentoUI = apartamento.getAttribute("apartamentoUI")

                        const habitaciones = JSON.parse(apartamento.getAttribute("habitaciones"))
                        reservaLocal.alojamiento[apartamentoIDV] = {
                            apartamentoUI: apartamentoUI,
                            habitaciones: habitaciones
                        }
                    })

                    sessionStorage.setItem("reserva", JSON.stringify(reservaLocal))
                    const entrada = {
                        vista: "/alojamiento/resumen",
                        tipoOrigen: "menuNavegador"
                    }
                    return casaVitini.componentes.controladorVista(entrada)
                },
                seleccionarCama: (datosCama) => {

                    const apartamentoIDV = datosCama.apartamentoIDV
                    const habitacionIDV = datosCama.habitacionIDV
                    const camaIDV = datosCama.camaIDV
                    const selectorApartamento = document.querySelector(`[apartamentoIDV="${apartamentoIDV}"]`)

                    selectorApartamento.setAttribute("estadoApartamento", "seleccionado")
                    const selectorSelectorApartamento = selectorApartamento.querySelector("[componente=selectorApartamento]")
                    selectorSelectorApartamento.innerText = "Apartamento seleccionado"


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



                    return


                    const selectorBloquePernoctacionRenderiado = document.querySelector(".bloquePernoctacion")
                    if (!selectorBloquePernoctacionRenderiado) {
                        const selectorBloquePasosReservaRenderiado = document.querySelector(".bloquePasosReservaNuevo")
                        const selectorBloqueBotonResumenReservaRenderizado = document.querySelector(".bloqueBotonResumenReserva")

                        const bloquePernoctacionUI = document.createElement("div")
                        bloquePernoctacionUI.classList.add("bloquePernoctacion")

                        selectorBloquePasosReservaRenderiado.insertBefore(bloquePernoctacionUI, selectorBloqueBotonResumenReservaRenderizado);
                    }

                    if (estadoCama !== "camaSeleccionada") {
                        const selectorHabitacion = document.querySelector(`[zona=apartamentoPernoctacion][apartamentoIDV='${apartamentoIDV}'] [habitacionIDV='${habitacionIDV}']`)
                        if (selectorHabitacion) {
                            selectorHabitacion.remove()
                        }
                        // casaVitini.ui.vistas.reservasNuevo.componenteSelectorCamas(camaApartamentoSeleccionada.target)
                    } else {
                        const selectorHabitacion = document.querySelector(`[zona=apartamentoPernoctacion][apartamentoIDV='${apartamentoIDV}'] [habitacionIDV='${habitacionIDV}']`)
                        if (selectorHabitacion) {
                            selectorHabitacion.remove()
                        }
                        const selectorHabitacionPorApartamento = document.querySelectorAll(`[zona=apartamentoPernoctacion][apartamentoIDV='${apartamentoIDV}'] [habitacionIDV]`)
                        if (selectorHabitacionPorApartamento.length === 0) {
                            const selectorApartamento = document.querySelector(`[zona=apartamentoPernoctacion][apartamentoIDV='${apartamentoIDV}']`)
                            selectorApartamento.remove()
                            const contadorApartamentos = document.querySelectorAll(`[zona=apartamentoPernoctacion][apartamentoIDV]`)
                            const selectorBotonResumenReserva = document.querySelector(".bloqueBotonResumenReserva")
                            if (contadorApartamentos.length === 0) {
                                selectorBotonResumenReserva?.remove()
                            }
                        }
                        const selectorHabitacionesRenderizadas = document.querySelectorAll("[componente=habitacionPernoctantes]")
                        if (selectorHabitacionesRenderizadas.length === 0) {
                            document.querySelector(".bloquePernoctacion")?.remove()
                        }
                    }

                },
                componenteSelectorCamas: (metadatos) => {

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

                    // Aqui hay que borrar las camas
                    let bloqueInquilino = document.createElement("div")
                    bloqueInquilino.setAttribute("class", "bloqueInquilino")
                    bloqueInquilino.setAttribute("apartamentoIDV", apartamentoIDV)
                    bloqueInquilino.setAttribute("apartamentoUI", apartamentoUI)
                    bloqueInquilino.setAttribute("componente", "habitacionPernoctantes")
                    bloqueInquilino.setAttribute("zona", "apartamentoPernoctacion")


                    let tituloInquilino = document.createElement("p")
                    tituloInquilino.setAttribute("class", "tituloInquilino")
                    tituloInquilino.innerText = "Anadir pernoctantes en " + apartamentoUI
                    bloqueInquilino.appendChild(tituloInquilino)

                    let bloqueHabitacion = document.createElement("div")
                    bloqueHabitacion.setAttribute("class", "bloqueHabitacionInquilino")
                    bloqueHabitacion.setAttribute("habitacionIDV", habitacionIDV)
                    bloqueHabitacion.setAttribute("habitacionUI", habitacionUI)

                    let bloqueTituloHabitacion = document.createElement("div")
                    bloqueTituloHabitacion.setAttribute("class", "bloqueTituloHabitacion")
                    bloqueTituloHabitacion.setAttribute("camaIDV", camaIDV)
                    bloqueTituloHabitacion.setAttribute("camaUI", camaUI)

                    bloqueTituloHabitacion.innerText = habitacionUI + " - " + camaUI
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

                        BotonResumenReserva.innerText = "Ir al resumen de la reserva"
                        BotonResumenReserva.addEventListener("click", casaVitini.ui.vistas.reservasNuevo.iraResumenReserva)
                        bloqueBotonResumenReserva.appendChild(BotonResumenReserva)
                        let bloquePasosReserva = document.querySelector(".bloquePasosReservaNuevo")

                        bloquePasosReserva.appendChild(bloqueBotonResumenReserva)
                    }

                },
                confirmarReserva: async () => {
                    const reservaLocal = JSON.parse(sessionStorage.getItem("reserva"))
                    const Peticion = {
                        zona: "plaza/reservas/confirmarReserva",
                        reserva: reservaLocal
                    };
                    const respuestaServidor = await casaVitini.componentes.servidor(Peticion)
                    if (respuestaServidor?.OK) {
                        window.location.href = respuestaServidor?.temaPago;
                    }

                },
                seleccionarDia: (dia) => {

                    const diaSeleccionadoComoElemento = dia.target;
                    const calendario = document.querySelector("[componente=bloqueCalendario] [componente=marcoCalendario]")
                    const calendarioIO = calendario.getAttribute("calendarioIO")
                    const fechaEntradaVolatil_Humana = document.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
                    let diaSeleccionadoEntrada
                    let mesSeleccionadoEntrada
                    let anoSeleccionadoEntrada
                    let datosFechaEntradaSeleccionada
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
                    const diaSeleccionado = Number(dia.target.getAttribute("dia").padStart(2, "0"))
                    const anoSeleccionado = Number(document.querySelector("[componente=mesReferencia]").getAttribute("ano").padStart(4, "0"))
                    const mesSeleccionado = Number(document.querySelector("[componente=mesReferencia]").getAttribute("mes").padStart(2, "0"))
                    const fechaSeleccionadaUX = `${String(diaSeleccionado).padStart("2", 0)}/${String(mesSeleccionado).padStart("2", 0)}/${String(anoSeleccionado).padStart("2", 0)}`
                    const fechaSeleccionadaUI = `${diaSeleccionado}/${mesSeleccionado}/${anoSeleccionado}`
                    const selectorDias = [...document.querySelectorAll("[calendarioIO] [dia]")]
                    selectorDias.map((dia) => {
                        // dia.classList.remove("calendarioDiaDisponible")
                        dia.classList.remove("calendarioDiaReserva")
                        dia.classList.remove("calendarioDiaSeleccionado")
                    })
                    if (diaSeleccionadoComoElemento.getAttribute("estadoDia") === "seleccionado") {
                        diaSeleccionadoComoElemento.classList.remove("calendarioDiaSeleccionado")
                        if (calendarioIO === "entrada") {
                            document.querySelector("[calendario=entrada]").removeAttribute("memoriaVolatil")
                            document.querySelector("#fechaEntrada").innerText = "(Seleccionar)"

                            selectorDias.map((dia) => {
                                if (mesSeleccionado === mesSeleccionadoSalida && fechaSalidaVolatil_Humana) {
                                    if (Number(dia.getAttribute("dia")) < diaSeleccionadoSalida) {
                                        dia.classList.add("calendarioDiaDisponible")
                                    }
                                } else {
                                    dia.classList.add("calendarioDiaDisponible")
                                }
                            })
                        }


                        if (calendarioIO === "salida") {
                            document.querySelector("[calendario=salida]").removeAttribute("memoriaVolatil")
                            document.querySelector("#fechaSalida").innerText = "(Seleccionar)"
                            selectorDias.map((dia) => {
                                if (mesSeleccionado === mesSeleccionadoEntrada && fechaEntradaVolatil_Humana) {
                                    if (Number(dia.getAttribute("dia")) > diaSeleccionadoEntrada) {
                                        dia.classList.add("calendarioDiaDisponible")
                                    }
                                } else {
                                    dia.classList.add("calendarioDiaDisponible")
                                }
                            })
                        }
                        diaSeleccionadoComoElemento.classList.remove("calendarioDiaSeleccionado")
                        diaSeleccionadoComoElemento.removeAttribute("estadoDia")
                        return
                    }

                    const diasSeleccionado = [...document.querySelectorAll("[estadoDia=seleccionado]")]
                    diasSeleccionado.map(diaSeleccionado => {
                        diaSeleccionado.removeAttribute("estadoDia")
                    })

                    const diasDisponibles = [...document.querySelectorAll("[estado=disponible]")]
                    diasDisponibles.map(diaDisponible => {
                        diaDisponible.style.background = ""
                        diaDisponible.style.color = ""
                    })

                    diaSeleccionadoComoElemento.setAttribute("estadoDia", "seleccionado")
                    diaSeleccionadoComoElemento.classList.remove("calendarioDiaNoSeleccionado")
                    diaSeleccionadoComoElemento.classList.add("calendarioDiaSeleccionado")


                    if (calendarioIO === "entrada") {
                        document.querySelector("[calendario=entrada]").setAttribute("memoriaVolatil", fechaSeleccionadaUX)
                        document.querySelector("[calendario=entrada]").classList.remove("parpadeaFondo")
                        document.querySelector("[componente=botonBorrarBusquedaAlojamiento]").style.display = "block"

                        if (!fechaSalidaVolatil_Humana) {
                            document.querySelector("[calendario=salida]").classList.add("parpadeaFondo")
                        }
                        if (fechaSalidaVolatil_Humana) {
                            document.querySelector("[calendario=salida]").classList.remove("parpadeaFondo")
                            document.querySelector("[componente=botonDisponibilidad]").classList.add("parpadeaFondo")
                        }

                        document.querySelector("#fechaEntrada").innerText = fechaSeleccionadaUI
                        if (fechaSalidaVolatil_Humana) {
                            if (mesSeleccionadoSalida === mesSeleccionado && anoSeleccionado === anoSeleccionadoSalida) {
                                selectorDias.map((dia) => {

                                    if (Number(dia.getAttribute("dia")) < diaSeleccionado) {
                                        dia.classList.add("calendarioDiaDisponible")
                                        dia.classList.remove("calendarioDiaReserva")
                                    }

                                    if (Number(dia.getAttribute("dia")) >= diaSeleccionado && Number(dia.getAttribute("dia")) <= diaSeleccionadoSalida) {
                                        dia.classList.remove("calendarioDiaDisponible")
                                        dia.classList.add("calendarioDiaReserva")
                                    }
                                })
                            } else {
                                selectorDias.map((dia) => {
                                    if (Number(dia.getAttribute("dia")) >= diaSeleccionado) {
                                        dia.classList.add("calendarioDiaReserva")
                                        dia.classList.remove("calendarioDiaDisponible")

                                    }
                                    if (Number(dia.getAttribute("dia")) < diaSeleccionado) {
                                        dia.classList.add("calendarioDiaDisponible")
                                        dia.classList.remove("calendarioDiaReserva")

                                    }
                                })
                            }

                        }
                        if (!fechaSalidaVolatil_Humana) {
                            return casaVitini.ui.vistas.reservasNuevo.reservasNuevoEntrada("salida")
                        }

                    }

                    if (calendarioIO === "salida") {
                        document.querySelector("[calendario=salida]").setAttribute("memoriaVolatil", fechaSeleccionadaUX)
                        document.querySelector("#fechaSalida").innerText = fechaSeleccionadaUI
                        document.querySelector("[calendario=salida]").classList.remove("parpadeaFondo")
                        document.querySelector("[componente=botonBorrarBusquedaAlojamiento]").style.display = "block"

                        if (!fechaEntradaVolatil_Humana) {
                            document.querySelector("[calendario=entrada]").classList.add("parpadeaFondo")
                        }
                        if (fechaEntradaVolatil_Humana) {
                            document.querySelector("[calendario=salida]").classList.remove("parpadeaFondo")
                            document.querySelector("[componente=botonDisponibilidad]").classList.add("parpadeaFondo")
                        }
                        if (fechaEntradaVolatil_Humana) {


                            if (mesSeleccionadoEntrada === mesSeleccionado && anoSeleccionado === anoSeleccionadoEntrada) {

                                selectorDias.map((dia) => {

                                    if (Number(dia.getAttribute("dia")) > diaSeleccionado) {
                                        dia.classList.add("calendarioDiaDisponible")
                                        dia.classList.remove("calendarioDiaReserva")

                                    }
                                    if (Number(dia.getAttribute("dia")) < diaSeleccionado && Number(dia.getAttribute("dia")) > diaSeleccionadoEntrada) {
                                        dia.classList.remove("calendarioDiaDisponible")
                                        dia.classList.add("calendarioDiaReserva")


                                    }
                                })
                            } else {

                                selectorDias.map((dia) => {
                                    if (Number(dia.getAttribute("dia")) >= diaSeleccionado) {
                                        dia.classList.remove("calendarioDiaReserva")
                                        // dia.classList.remove("calendarioDiaNoDisponible")
                                        dia.classList.add("calendarioDiaDisponible")

                                    }
                                    if (Number(dia.getAttribute("dia")) < diaSeleccionado) {
                                        dia.classList.remove("calendarioDiaDisponible")
                                        dia.classList.add("calendarioDiaReserva")
                                    }
                                })
                            }



                        }
                        if (!fechaEntradaVolatil_Humana) {
                            return casaVitini.ui.vistas.reservasNuevo.reservasNuevoEntrada("entrada")
                        }
                    }
                },
                controlPrevioEnvioDatos: () => {

                    try {
                        // Que todas las camas esten seleccionadas
                        const selectoresCamas = document.querySelectorAll("[componente=selectorCama]")
                        selectoresCamas.forEach((selectorCama) => {
                            if (!selectorCama.value) {

                                const apartamentoUI = selectorCama.closest("[apartamentoIDV]")
                                    .querySelector("[apartamentoUI]")
                                    .getAttribute("apartamentoUI")

                                const habitacionUI = selectorCama.closest("[habitacionIDV]")
                                    .querySelector("[habitacionUI]")
                                    .getAttribute("habitacionUI")

                                const errorCamas = `Atención es necesario que selecione que tipo de cama quiere para la ${habitacionUI} del ${apartamentoUI}.`
                                throw new Error(errorCamas)

                            }
                        })
                        // Que esten los datos del titular correctamente escritos
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
                            const errorTelefono = "En el campo teléfono solo pueden contener números y el simbolo + para el codigo internacional. Revisa el campo telefono por favor.";
                            throw new Error(errorTelefono);
                        }
                        else if (!correoTitular || !filtroCorreoElectronico.test(correoTitular)) {
                            const error = "el campo de correo electronico no cumple con el formato esperado, se espera un formato tal que asi: ejemplo@servidor.com"
                            throw new Error(error)
                        }

                    } catch (error) {
                        throw error
                    }

                },
                reservaConfirmada: {
                    sustitutorObjetos: (detallesReserva) => {
                        sessionStorage.removeItem("reserva");
                        localStorage.setItem("reservaConfirmada", JSON.stringify(detallesReserva))
                        document.documentElement.scrollTop = 0;
                        document.body.scrollTop = 0;
                        const url = "/alojamiento/reserva_confirmada"
                        const estado = {
                            zona: url,
                            estadoInternoZona: "estado",
                            tipoCambio: "total"
                        }
                        const titulo = "Casa Vitini | Reserva confirmada"
                        window.history.replaceState(estado, titulo, url);
                        return casaVitini.ui.vistas.reservasNuevo.reservaConfirmada.UI()
                    },
                    UI: async () => {
                        try {
                            const detallesReserva = JSON.parse(localStorage.getItem("reservaConfirmada"));


                            if (detallesReserva) {
                                document.body.style.backgroundImage = "url(/componentes/imagenes/fotos/image00018.jpeg)"
                                document.body.classList.add("difuminadoFondo")

                                const obtenerPDF = async (enlaceUID) => {

                                    const instanciaUID = casaVitini.componentes.codigoFechaInstancia()

                                    const advertenciaInmersivaIU = document.createElement("div")
                                    advertenciaInmersivaIU.setAttribute("class", "advertenciaInmersiva")
                                    advertenciaInmersivaIU.setAttribute("componente", "advertenciaInmersiva")
                                    advertenciaInmersivaIU.setAttribute("instanciaUID", instanciaUID)


                                    const contenedorAdvertenciaInmersiva = document.createElement("div")
                                    contenedorAdvertenciaInmersiva.classList.add("contenedorAdvertencaiInmersiva")

                                    const contenidoAdvertenciaInmersiva = document.createElement("div")
                                    contenidoAdvertenciaInmersiva.classList.add("contenidoAdvertenciaInmersiva")
                                    contenidoAdvertenciaInmersiva.setAttribute("espacio", "gestionPDF")

                                    const mensajeSpinner = "Generando PDF...."
                                    const spinner = casaVitini.componentes.spinner(mensajeSpinner)
                                    contenidoAdvertenciaInmersiva.appendChild(spinner)

                                    contenedorAdvertenciaInmersiva.appendChild(contenidoAdvertenciaInmersiva)
                                    advertenciaInmersivaIU.appendChild(contenedorAdvertenciaInmersiva)
                                    document.body.appendChild(advertenciaInmersivaIU)

                                    const advertenciaInmersivaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)

                                    try {
                                        const metadatospdf = {
                                            zona: "componentes/pdf",
                                            enlace: enlaceUID
                                        }
                                        const puerto = '/puerto';
                                        const peticion = {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify(metadatospdf)
                                        };
                                        const respuestaServidor = await fetch(puerto, peticion);

                                        const contentType = respuestaServidor.headers.get('content-type');

                                        if (contentType === "application/json; charset=utf-8") {
                                            const respuestaServidorJSON = await respuestaServidor.json() || {};
                                            advertenciaInmersivaRenderizada?.remove()
                                            return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidorJSON.error)
                                        }

                                        if (contentType === "application/pdf" && advertenciaInmersivaRenderizada) {
                                            const BLOB = await respuestaServidor.blob();
                                            const selectorZonaGestion = advertenciaInmersivaRenderizada.querySelector("[espacio=gestionPDF]");
                                            selectorZonaGestion.innerHTML = null;
                                            selectorZonaGestion.style.alignItems = "center"
                                            selectorZonaGestion.innerText = "Se ha generado el archivo PDF con el resumen de su reserva. Para descargar el pdf pulse en el boton desde mi reserva en PDF, el enlace de descarga estara vigente durante 48 horas";

                                            const PDFGenerado = new Blob([BLOB], { type: 'application/pdf' });

                                            const pdfGenerado = document.createElement('a');
                                            pdfGenerado.href = window.URL.createObjectURL(PDFGenerado);
                                            pdfGenerado.classList.add("plaza_alojamiento_reservaConfirmada_botoDescargaPDF")
                                            pdfGenerado.download = 'Reserva.pdf';
                                            pdfGenerado.innerText = "Descargar mi reserva en PDF";
                                            selectorZonaGestion.appendChild(pdfGenerado)


                                            const botonCancelarProcesoCancelacion = document.createElement("div")
                                            botonCancelarProcesoCancelacion.classList.add("plaza_alojamiento_reservaConfirmada_botoDescargaPDF")
                                            botonCancelarProcesoCancelacion.innerText = "Cancelar y volver al resumen de mi reserva"
                                            botonCancelarProcesoCancelacion.addEventListener("click", (e) => {
                                                return casaVitini.componentes.limpiarAdvertenciasInmersivas()

                                            })
                                            selectorZonaGestion.appendChild(botonCancelarProcesoCancelacion)

                                        }





                                    } catch (errorCapturado) {
                                        advertenciaInmersivaRenderizada?.remove()
                                        if (errorCapturado instanceof TypeError && errorCapturado.message === 'Failed to fetch') {
                                            const mensaje = "No se ha podido contactar con el servidor, revisa tu conexión y reintentalo."
                                            casaVitini.ui.vistas.advertenciaInmersiva(mensaje)

                                        } else {
                                            casaVitini.ui.vistas.advertenciaInmersiva(errorCapturado.message)
                                        }
                                    }

                                }


                                // Codigo enlaces PDF
                                const codigoEnlacePDF = detallesReserva.enlacePDF

                                // Datos globales
                                const reserva = detallesReserva.reserva.reserva
                                const entrada = detallesReserva.reserva.entrada
                                const salida = detallesReserva.reserva.salida
                                const estadoReserva = detallesReserva.reserva.estadoReserva
                                const estadoPago = detallesReserva.reserva.estadoPago
                                const creacion = detallesReserva.reserva.creacion

                                // Datos titular
                                const detallesTitular = detallesReserva.reserva.titular

                                const nombreTitular = detallesTitular.nombreTitular
                                const pasaporteTitular = detallesTitular.pasaporteTitular
                                const emailTitular = detallesTitular.emailTitular
                                const telefonoTitular = detallesTitular.telefonoTitular

                                // Datos financieros
                                const desgloseFinanciero = detallesReserva.desgloseFinanciero

                                const totalesPorApartamento = desgloseFinanciero.totalesPorApartamento
                                const totalesPorNoche = desgloseFinanciero.totalesPorNoche

                                const ofertas = desgloseFinanciero.ofertas

                                const impuestos = desgloseFinanciero.impuestos
                                const totales = desgloseFinanciero.totales


                                //Parsea los bloques de los detalles reservas

                                // Imprimir detalles reserva

                                const marcoElasticoRelatico = document.createElement("div")
                                marcoElasticoRelatico.classList.add("marcoElasticoRelativo")

                                const marcoElastico = document.createElement("div")
                                marcoElastico.classList.add("marcoElastico")
                                marcoElastico.setAttribute("contenedor", "reservaConfiramda")

                                marcoElastico.style.alignItems = "stretch"
                                marcoElastico.style.gap = "4px"


                                const titulo = document.createElement("div")
                                titulo.classList.add("titulo")
                                titulo.innerText = "Reserva confirmada"
                                marcoElastico.appendChild(titulo)

                                const infoGlobal = document.createElement("div")
                                infoGlobal.classList.add("plaza_reservas_reservaConfirmada_infoGlobal")
                                infoGlobal.innerText = "Su reserva está preconfirmada y le estamos esperando. Aquí tiene los detalles de su reserva. Puede descargar un resumen de su reserva en formato de documento PDF. Su reserva se ha registrado junto a su correo electrónico. Si desea ver con más detalle su reserva puede crear una cuenta en MiCasa para poder ver todos los detalles de su reserva. Si necesita contactar con Casa Vitini puede encontrar toda la información de contacto en la sección Contacto. Se ha enviado una copia del resumen de su reserva a su dirección de correo electrónico."
                                marcoElastico.appendChild(infoGlobal)


                                const infoIngreso = document.createElement("div")
                                infoIngreso.classList.add("plaza_reservas_reservaConfirmada_infoIngreso")
                                infoIngreso.innerHTML = "Por favor realize el ingreso del total de su reserva en la siguiente cuenta bancaria antes de 72 horas a partir de la preconfirmacion de su reserva, puede hacerlo en una transferencia o en varias. Sea tan amable de poner el numero de la reserva en el concepto de la transferencia.<br>Cuenta bancaria para realizar el ingreso:<br>000000000000000000000000"
                                marcoElastico.appendChild(infoIngreso)

                                const contenedor = document.createElement("div")
                                contenedor.classList.add("plaza_reservas_reservaConfirmada_contenedor")

                                const espacioDatosGlobalesReserva = document.createElement("div")
                                espacioDatosGlobalesReserva.classList.add("administracion_reservas_detallesReservas_contenedorTotales")
                                espacioDatosGlobalesReserva.setAttribute("contenedor", "espacioDatosGlobalesReserva")

                                const reversaUI = document.createElement("div")
                                reversaUI.classList.add("administracion_reservas_detallesReservas_contenedorReservaUID")


                                const nombreReserva = document.createElement("div")
                                nombreReserva.innerText = "Reserva"
                                reversaUI.appendChild(nombreReserva)

                                const numeroReservaUID = document.createElement("div")
                                numeroReservaUID.classList.add("administracion_reservas_detallesReservas_contenedorResevaUID_UID")
                                numeroReservaUID.classList.add("negrita")
                                numeroReservaUID.innerText = reserva
                                reversaUI.appendChild(numeroReservaUID)

                                espacioDatosGlobalesReserva.appendChild(reversaUI)


                                const botonDescargarPDF = document.createElement("div")
                                botonDescargarPDF.classList.add("plaza_reservas_reservaConfirmada_botonV1")
                                botonDescargarPDF.innerText = "Descargar un resumen de la reserva en PDF"
                                botonDescargarPDF.addEventListener("click", () => {
                                    obtenerPDF(codigoEnlacePDF)
                                })
                                espacioDatosGlobalesReserva.appendChild(botonDescargarPDF)

                                // Contenedor datos titular
                                const contenedorTitular = document.createElement("div")
                                contenedorTitular.classList.add("plaza_reservas_reservaConfirmada_contenedorTitular")

                                const infoTitular = document.createElement("div")
                                infoTitular.classList.add("plaza_reservas_reservaConfirmada_infoTitular")
                                infoTitular.innerText = "Datos del titular de la reserva"
                                //contenedorTitular.appendChild(infoTitular)

                                const contenedorDatosDelTitular = document.createElement("div")
                                contenedorDatosDelTitular.classList.add("plaza_reservas_reservaConfirmada_contenedorTitular_contenedorDatosDelTitular")


                                let bloqueDatoTitular = document.createElement("div")
                                bloqueDatoTitular.classList.add("plaza_reservas_reservaConfirmada_contenedorTitular_contenedorDatosDelTitular_bloque")

                                let bloqueTituloTitular = document.createElement("div")
                                bloqueTituloTitular.classList.add("plaza_reservas_reservaConfirmada_contenedorTitular_contenedorDatosDelTitular_bloqueTitulo")
                                bloqueTituloTitular.innerText = "Nombre y apellidos"
                                bloqueDatoTitular.appendChild(bloqueTituloTitular)

                                const nombreTitularUI = document.createElement("div")
                                nombreTitularUI.classList.add("negrita")
                                nombreTitularUI.innerText = nombreTitular
                                bloqueDatoTitular.appendChild(nombreTitularUI)
                                contenedorDatosDelTitular.appendChild(bloqueDatoTitular)


                                bloqueDatoTitular = document.createElement("div")
                                bloqueDatoTitular.classList.add("plaza_reservas_reservaConfirmada_contenedorTitular_contenedorDatosDelTitular_bloque")

                                bloqueTituloTitular = document.createElement("div")
                                bloqueTituloTitular.classList.add("plaza_reservas_reservaConfirmada_contenedorTitular_contenedorDatosDelTitular_bloqueTitulo")
                                bloqueTituloTitular.innerText = "Pasaporte"
                                bloqueDatoTitular.appendChild(bloqueTituloTitular)


                                const pasaporteTitularUI = document.createElement("div")
                                pasaporteTitularUI.classList.add("negrita")
                                pasaporteTitularUI.innerText = pasaporteTitular
                                bloqueDatoTitular.appendChild(pasaporteTitularUI)
                                contenedorDatosDelTitular.appendChild(bloqueDatoTitular)


                                bloqueDatoTitular = document.createElement("div")
                                bloqueDatoTitular.classList.add("plaza_reservas_reservaConfirmada_contenedorTitular_contenedorDatosDelTitular_bloque")

                                bloqueTituloTitular = document.createElement("div")
                                bloqueTituloTitular.classList.add("plaza_reservas_reservaConfirmada_contenedorTitular_contenedorDatosDelTitular_bloqueTitulo")
                                bloqueTituloTitular.innerText = "Correo electroníco"
                                bloqueDatoTitular.appendChild(bloqueTituloTitular)


                                const emailTitularUI = document.createElement("div")
                                emailTitularUI.classList.add("negrita")
                                emailTitularUI.innerText = emailTitular
                                bloqueDatoTitular.appendChild(emailTitularUI)
                                contenedorDatosDelTitular.appendChild(bloqueDatoTitular)


                                bloqueDatoTitular = document.createElement("div")
                                bloqueDatoTitular.classList.add("plaza_reservas_reservaConfirmada_contenedorTitular_contenedorDatosDelTitular_bloque")

                                bloqueTituloTitular = document.createElement("div")
                                bloqueTituloTitular.classList.add("plaza_reservas_reservaConfirmada_contenedorTitular_contenedorDatosDelTitular_bloqueTitulo")
                                bloqueTituloTitular.innerText = "Telefono"
                                bloqueDatoTitular.appendChild(bloqueTituloTitular)


                                const telefonoTitularUI = document.createElement("div")
                                telefonoTitularUI.classList.add("negrita")
                                telefonoTitularUI.innerText = telefonoTitular
                                bloqueDatoTitular.appendChild(telefonoTitularUI)
                                contenedorDatosDelTitular.appendChild(bloqueDatoTitular)

                                contenedorTitular.appendChild(contenedorDatosDelTitular)
                                espacioDatosGlobalesReserva.appendChild(contenedorTitular)

                                // Contenedor de las fechas
                                const contenedorFechas = document.createElement("div")
                                contenedorFechas.classList.add("plaza_reservas_reservaConfirmada_contenedorFechas")

                                // Fecha entrada
                                const contenedorFechaEntrada = document.createElement("div")
                                contenedorFechaEntrada.classList.add("plaza_reservas_reservaConfirmada_contenedorFechas_contenedorFecha")

                                const tituloFechaEntrada = document.createElement("div")
                                tituloFechaEntrada.classList.add("plaza_reservas_reservaConfirmada_contenedorFechas_contenedorFecha_titulo")
                                tituloFechaEntrada.innerText = "Fecha de entrada"
                                contenedorFechaEntrada.appendChild(tituloFechaEntrada)

                                const fechaEntrada = document.createElement("div")
                                fechaEntrada.classList.add("plaza_reservas_reservaConfirmada_contenedorFechas_contenedorFecha_fecha")
                                fechaEntrada.classList.add("negrita")
                                fechaEntrada.innerText = entrada
                                contenedorFechaEntrada.appendChild(fechaEntrada)
                                contenedorFechas.appendChild(contenedorFechaEntrada)


                                // Fecha salida
                                const contenedorFechaSalida = document.createElement("div")
                                contenedorFechaSalida.classList.add("plaza_reservas_reservaConfirmada_contenedorFechas_contenedorFecha")

                                const tituloFechaSalida = document.createElement("div")
                                tituloFechaSalida.classList.add("plaza_reservas_reservaConfirmada_contenedorFechas_contenedorFecha_titulo")
                                tituloFechaSalida.innerText = "Fecha de salida"
                                contenedorFechaSalida.appendChild(tituloFechaSalida)

                                const fechaSalida = document.createElement("div")
                                fechaSalida.classList.add("plaza_reservas_reservaConfirmada_contenedorFechas_contenedorFecha_fecha")
                                fechaSalida.classList.add("negrita")
                                fechaSalida.innerText = salida
                                contenedorFechaSalida.appendChild(fechaSalida)
                                contenedorFechas.appendChild(contenedorFechaSalida)

                                espacioDatosGlobalesReserva.appendChild(contenedorFechas)


                                const titulosTotales = {
                                    promedioNetoPorNoche: "Promedio neto por noche",
                                    totalReservaNetoSinOfertas: "Total de la reserva neto sin ofertas",
                                    totalReservaNeto: "Total reserva neto",
                                    totalDescuentos: "Total de todos los descuentos de las ofertas aplicadas",
                                    totalImpuestos: "Total de impuestos aplicados",
                                    totalConImpuestos: "Total a pagar y valor final de la reserva",
                                }
                                contenedor.appendChild(espacioDatosGlobalesReserva)
                                marcoElastico.appendChild(contenedor)

                                const infoGlobal2 = document.createElement("div")
                                infoGlobal2.classList.add("plaza_reservas_reservaConfirmada_infoGlobal")
                                infoGlobal2.innerText = `La información de esta reserva se ha almacenado en el almacenamiento local de su navegador. Mientras no borre la cache del navegador o pulse en el botón de eliminar mi reserva, la reserva se mantendrá en el navegador. Esto está hecho así para su comodidad. Así cuando entra en Casa Vitini puede acceder a su reserva confirmada fácilmente. Igualmente es posible que le interese saber que si se registra y crea una cuenta en MiCasa puedes acceder a todos los detalles de sus reservas.
                                
                                Cree su propio VitiniID y acceda a los detalles de su reserva de manera persistente y desde cualquier lugar. Recuerde registrarse con la misma cuenta de correo electrónico con la que realizo la reserva. Puedes cambiar su cuenta de correo electrónico en cualquier momento desde su cuenta con su VitiniID. Registrar su propio VitiniID es gratuito.`
                                marcoElastico.appendChild(infoGlobal2)

                                const infoGlobal3 = document.createElement("div")
                                infoGlobal3.classList.add("plaza_reservas_reservaConfirmada_infoGlobal")
                                infoGlobal3.innerText = "Cree su propio VitiniID y acceda a los detalles de su reserva de manera persistente y desde cualquier lugar. Recuerde registrarse con la misma cuenta de correo electrónico con la que realizo la reserva. Puedes cambiar su cuenta de correo electrónico en cualquier momento desde su cuenta con su VitiniID. Registrar su propio VitiniID es gratuito."
                                //  marcoElastico.appendChild(infoGlobal3)


                                const botonBorrarReserva = document.createElement("div")
                                botonBorrarReserva.classList.add("plaza_reservas_reservaConfirmada_botonV1")
                                botonBorrarReserva.innerText = "Borrar la información de esta reserva de la cache de mi navegador "
                                botonBorrarReserva.addEventListener("click", casaVitini.ui.vistas.reservasNuevo.reservaConfirmada.borrarReservaLocal)
                                marcoElastico.appendChild(botonBorrarReserva)


                                marcoElasticoRelatico.appendChild(marcoElastico)

                                const seccion = document.querySelector("main")
                                seccion.removeAttribute("instanciaUID")
                                seccion.innerHTML = null
                                seccion.appendChild(marcoElasticoRelatico)


                                const desgloseTotales = {
                                    totalesPorApartamento: totalesPorApartamento,
                                    totalesPorNoche: totalesPorNoche,
                                    totales: totales,
                                    impuestos: impuestos,
                                    ofertas: ofertas,
                                    destino: "[contenedor=espacioDatosGlobalesReserva]"
                                }

                                // casaVitini.componentes.ui.totales(desgloseTotales)


                                const contenedorTotal = document.createElement("div")
                                contenedorTotal.classList.add("contenedorTotal")


                                const tituloTotal = document.createElement("p")
                                tituloTotal.classList.add("tituloContenedor")
                                tituloTotal.innerText = "Total de la reserva"
                                contenedorTotal.appendChild(tituloTotal)


                                const totalReserva = document.createElement("p")
                                totalReserva.classList.add("totalReserva")
                                totalReserva.innerText = totales.totalConImpuestos + "$"
                                contenedorTotal.appendChild(totalReserva)


                                const masInfo = document.createElement("p")
                                masInfo.classList.add("info")
                                masInfo.innerText = "Si desea ver el detalle del total pulse aquí"
                                masInfo.addEventListener("click", () => {

                                    const instanciaUID = casaVitini.componentes.codigoFechaInstancia()
                                    document.body.style.overflow = 'hidden';

                                    const advertenciaInmersivaIU = document.createElement("div")
                                    advertenciaInmersivaIU.setAttribute("class", "advertenciaInmersiva")
                                    advertenciaInmersivaIU.setAttribute("componente", "advertenciaInmersiva")
                                    advertenciaInmersivaIU.setAttribute("contenedor", "opcionesCancelacion")
                                    advertenciaInmersivaIU.setAttribute("instanciaUID", instanciaUID)

                                    const contenedorAdvertenciaInmersiva = document.createElement("div")
                                    contenedorAdvertenciaInmersiva.classList.add("contenedorAdvertencaiInmersiva")

                                    const contenidoAdvertenciaInmersiva = document.createElement("div")
                                    contenidoAdvertenciaInmersiva.classList.add("contenidoAdvertenciaInmersiva")
                                    contenidoAdvertenciaInmersiva.setAttribute("contenedor", "contenidoAdvertenciaInmersiva")

                                    const contenedorDesgloseTotales = document.createElement("div")
                                    contenedorDesgloseTotales.classList.add("administracion_reservas_detallesReservas_cancelarReserva_contenedorCancelacion")

                                    const testInfo = document.createElement("div")
                                    testInfo.classList.add("plaza_resumenReserva_textoInfo")
                                    testInfo.innerText = "A continuación, se presentan los detalles del desglose completo del importe total de la reserva. Aquí encontrarás una explicación detallada de cada componente que contribuye al costo total. Este desglose incluye los diversos cargos, impuestos u otros conceptos asociados con tu reserva. Revisar estos detalles te proporcionará una comprensión transparente de los costos involucrados en tu elección de alojamiento. ¡Estamos comprometidos a brindarte la información necesaria para que tu experiencia de reserva sea clara y sin sorpresas!"
                                    contenedorDesgloseTotales.appendChild(testInfo)

                                    const contenedorTotales = document.createElement("div")
                                    contenedorTotales.setAttribute("contenedor", "espacioGlobalTotales")
                                    //contenedorTotales.innerHTML = codigoTotales
                                    contenedorDesgloseTotales.appendChild(contenedorTotales)

                                    const botonCancelarProcesoCancelacion = document.createElement("div")
                                    botonCancelarProcesoCancelacion.classList.add("detallesReservaCancelarBoton")
                                    botonCancelarProcesoCancelacion.innerText = "Cerrar y volver a la reserva preconfirmada"
                                    botonCancelarProcesoCancelacion.addEventListener("click", casaVitini.componentes.limpiarAdvertenciasInmersivas)
                                    contenedorDesgloseTotales.appendChild(botonCancelarProcesoCancelacion)

                                    contenidoAdvertenciaInmersiva.appendChild(contenedorDesgloseTotales)
                                    contenedorAdvertenciaInmersiva.appendChild(contenidoAdvertenciaInmersiva)
                                    advertenciaInmersivaIU.appendChild(contenedorAdvertenciaInmersiva)

                                    document.body.appendChild(advertenciaInmersivaIU)

                                    const destino = `[instanciaUID="${instanciaUID}"] [contenedor=espacioGlobalTotales]`
                                    const desgloseTotales = {
                                        totalesPorApartamento: totalesPorApartamento,
                                        totalesPorNoche: totalesPorNoche,
                                        totales: totales,
                                        impuestos: impuestos,
                                        ofertas: ofertas,
                                        destino: destino
                                    }
                                    casaVitini.componentes.ui.totales(desgloseTotales)
                                })
                                contenedorTotal.appendChild(masInfo)

                                espacioDatosGlobalesReserva.appendChild(contenedorTotal)

                            } else {

                                const marcoElasticoRelatico = document.createElement("div")
                                marcoElasticoRelatico.classList.add("marcoElasticoRelativo")

                                const marcoElastico = document.createElement("div")
                                marcoElastico.classList.add("marcoElastico")
                                marcoElastico.style.alignItems = "stretch"
                                marcoElastico.style.gap = "4px"


                                const titulo = document.createElement("div")
                                titulo.classList.add("titulo")
                                titulo.innerText = "Nínguna reserva que mostrar"
                                marcoElastico.appendChild(titulo)

                                // Añadir banner informativo
                                const contenedorBanner = document.createElement("a")
                                contenedorBanner.classList.add("plaza_reservas_reservaConfiramda_bannerV2")
                                contenedorBanner.innerText = "Esta página muestra el resumen de tu reserva confirmada pero no encuentra ninguna reserva guardada en la cache local de tu navegador. Cuando haces una reserva los datos de la reserva luego de guardarse en el servidor de Casa Vitini, el sistema guarda una copia local en tu navegador. Esto se hace para la comodida del usuario. Para que pueda acceder al resumen de su reserva confiramda comodamente. Pero si el usuario borra la cache de navegador o esta se borra por la configuracion del navegador ya no se puede acceder a la reserva por que ya no existe en la cache del navegador. Si quieres vovler a ver el resumen de tu reserva tienes varias opciones. La mas comoda e inmediata es registrar una nueva cuenta en MiCasa para obtener tu VitiniID y poder acceder a tu cuenta de usuario donde podra ver tus reservas. Otra opcion es ponerte en contacto con nosotros. Para ellos ves al apartado Contacto donde podra obtener las distintas formas de contacto con nosotros y te responderemos lo antes posible. Ten en cuenta que debido a las zonas horaria si cuando nos llamas no estamos disponibles por la diferencia horaria puedes enviarnos un email o un mensaje instantaneo. La primera opcion, registrar una cuenta es una opcion instantanea y es la que te recomendamos."
                                marcoElastico.appendChild(contenedorBanner)

                                const botonIniciarReserva = document.createElement("a")
                                botonIrARegistrarse.classList.add("plaza_reservas_reservaConfiramda_banner")
                                botonIrARegistrarse.innerText = "Iniciar una nueva reserva"
                                botonIrARegistrarse.setAttribute("href", "/alojamiento")
                                botonIrARegistrarse.setAttribute("vista", "/alojamiento")
                                botonIrARegistrarse.addEventListener("click", casaVitini.componentes.cambiarVista)
                                marcoElastico.appendChild(botonIniciarReserva)


                                const botonIrARegistrarse = document.createElement("a")
                                botonIrARegistrarse.classList.add("plaza_reservas_reservaConfiramda_banner")
                                botonIrARegistrarse.innerText = "Ir a crear una cuenta a MiCasa"
                                botonIrARegistrarse.setAttribute("href", "/micasa/crear_nueva_cuenta")
                                botonIrARegistrarse.setAttribute("vista", "/micasa/crear_nueva_cuenta")
                                botonIrARegistrarse.addEventListener("click", casaVitini.componentes.cambiarVista)
                                marcoElastico.appendChild(botonIrARegistrarse)


                                const botonInciarSession = document.createElement("a")
                                botonInciarSession.classList.add("plaza_reservas_reservaConfiramda_banner")
                                botonInciarSession.innerText = "Iniciar session con mi VitiniID en MiCasa"
                                botonInciarSession.setAttribute("href", "/micasa")
                                botonInciarSession.setAttribute("vista", "/micasa")
                                botonInciarSession.addEventListener("click", casaVitini.componentes.cambiarVista)
                                marcoElastico.appendChild(botonInciarSession)

                                marcoElasticoRelatico.appendChild(marcoElastico)
                                const seccion = document.querySelector("main")
                                seccion.innerHTML = null


                                seccion.appendChild(marcoElasticoRelatico)
                            }







                        } catch (error) {



                        }



                    },
                    borrarReservaLocal: () => {

                        document.body.style.overflow = 'hidden';

                        const advertenciaInmersivaIU = document.createElement("div")
                        advertenciaInmersivaIU.setAttribute("class", "advertenciaInmersiva")
                        advertenciaInmersivaIU.setAttribute("componente", "advertenciaInmersiva")
                        advertenciaInmersivaIU.setAttribute("contenedor", "opcionesCancelacion")


                        const contenedorAdvertenciaInmersiva = document.createElement("div")
                        contenedorAdvertenciaInmersiva.classList.add("contenedorAdvertencaiInmersiva")

                        const contenidoAdvertenciaInmersiva = document.createElement("div")
                        contenidoAdvertenciaInmersiva.classList.add("contenidoAdvertenciaInmersiva")
                        contenidoAdvertenciaInmersiva.setAttribute("contenedor", "contenidoAdvertenciaInmersiva")

                        const contenedorCancelacion = document.createElement("div")
                        contenedorCancelacion.classList.add("administracion_reservas_detallesReservas_cancelarReserva_contenedorCancelacion")


                        const tituloCancelarReserva = document.createElement("p")
                        tituloCancelarReserva.classList.add("detallesReservaTituloCancelarReserva")
                        tituloCancelarReserva.innerText = "Borrar esta copia de mi reserva"
                        contenedorCancelacion.appendChild(tituloCancelarReserva)





                        const infoEliminarReserva = document.createElement("div")
                        infoEliminarReserva.classList.add("detallesReservaCancelarReservaTituloBloquoApartamentos")
                        infoEliminarReserva.style.marginTop = "0px"

                        infoEliminarReserva.innerText = "Cuando realizar una reserva y la confirmas. Una copia de la reserva se guarda en tu navegador en el almacen de memoria local que tiene el navegador. Esta copia de la reserva esta para su comomidad. Para que pueda regresar a los datos de su reserva si visita Casa Vitini desde el mismo navegador donde realizo la reserva. Si desea borrar esta copia almacenada en la memoria local de su navegador puede hacerlo pulsando el boton de abajo para eliminar o elimiando la cach de su navegador. Recuerde que si se registrar y obtiene su VitiniID puede acceder a una copia de su reserva siempre que quiera. Para ello debe de registrarse con la misma dirección de correo electroníco con la que confírmo la reserva."
                        contenedorCancelacion.appendChild(infoEliminarReserva)

                        const botonEliminarReserva = document.createElement("div")
                        botonEliminarReserva.classList.add("administracion_reservas_detallesReserva_cancelarReserva_botonV1")
                        botonEliminarReserva.setAttribute("componente", "botonConfirmarCancelarReserva")
                        botonEliminarReserva.innerText = "Eliminar esta copia de la reserva almacenada localmente en mi navegador"
                        botonEliminarReserva.addEventListener("click", () => {
                            localStorage.removeItem("reservaConfirmada")

                            casaVitini.componentes.limpiarAdvertenciasInmersivas()
                            const navegacion = {
                                vista: "/alojamiento",
                                tipoOrigen: "menuNavegador"
                            }
                            return casaVitini.componentes.controladorVista(navegacion)

                        }
                        )
                        contenedorCancelacion.appendChild(botonEliminarReserva)

                        const botonCancelarProcesoCancelacion = document.createElement("div")
                        botonCancelarProcesoCancelacion.classList.add("detallesReservaCancelarBoton")
                        botonCancelarProcesoCancelacion.innerText = "Cancelar, no eliminar y volver atras"
                        botonCancelarProcesoCancelacion.addEventListener("click", casaVitini.componentes.limpiarAdvertenciasInmersivas)
                        contenedorCancelacion.appendChild(botonCancelarProcesoCancelacion)
                        contenidoAdvertenciaInmersiva.appendChild(contenedorCancelacion)

                        contenedorAdvertenciaInmersiva.appendChild(contenidoAdvertenciaInmersiva)
                        advertenciaInmersivaIU.appendChild(contenedorAdvertenciaInmersiva)

                        document.body.appendChild(advertenciaInmersivaIU)







                    }
                },
                obtenerImagenApartamento: async (metadatos) => {

                    const apartamentoIDV = metadatos.apartamentoIDV
                    const instanciaUIDDestino = metadatos.instanciaUID

                    const transacccion = {
                        zona: "componentes/imagenDelApartamento",
                        apartamentoIDV: apartamentoIDV
                    }
                    const respuestaServidor = await casaVitini.componentes.servidor(transacccion)

                    if (respuestaServidor?.error) {
                        return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
                    }

                    if (respuestaServidor?.ok) {
                        const contenedorApartamentoRenderizado = document.querySelector(`[apartamentoIDV=${apartamentoIDV}][instanciaUID="${instanciaUIDDestino}"]`)
                        if (contenedorApartamentoRenderizado) {
                            const imagen = respuestaServidor.imagen

                            const detectarTipoDeImagen = (base64String) => {
                                const binarioMagicoPNG = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
                                const binarioMagicoJPEG = new Uint8Array([255, 216, 255]);
                                const binarioMagicoTIFF = new Uint8Array([73, 73, 42]);

                                const arrayBuffer = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
                                const buffer = new Uint8Array(arrayBuffer);

                                if (buffer.subarray(0, 8).every((value, index) => value === binarioMagicoPNG[index])) {
                                    return "PNG";
                                } else if (buffer.subarray(0, 3).every((value, index) => value === binarioMagicoJPEG[index])) {
                                    return "JPEG";
                                } else if (buffer.subarray(0, 3).every((value, index) => value === binarioMagicoTIFF[index])) {
                                    return "TIFF";
                                } else {
                                    return "Tipo de imagen desconocido";
                                }
                            };


                            const tipoDeImagen = detectarTipoDeImagen(imagen);
                            contenedorApartamentoRenderizado.style.backgroundImage = `url(data:image/${tipoDeImagen.toLowerCase()};base64,${imagen})`;
                            contenedorApartamentoRenderizado.style.backgroundSize = "cover";
                            contenedorApartamentoRenderizado.style.backgroundPosition = "center";
                            contenedorApartamentoRenderizado.style.backgroundRepeat = "no-repeat";
                        }


                    }




                },
                preConfirmar: async () => {
                    console.log("ss")
                    casaVitini.componentes.flujoPagoUI.desplegarUI("Preconfirmando su reserva...")

                    const reservaLocal = JSON.parse(sessionStorage.getItem("reserva"))
                    const nombreTitular = document.querySelector("[campo=nombreTitular]").value || "nombre de prueba"
                    const pasaporteTitular = document.querySelector("[campo=pasaporteTitular]").value || "pasasporteTest"
                    const correoTitular = document.querySelector("[campo=correoTitular]").value || "test@test.com"
                    const telefonoTitular = document.querySelector("[campo=telefonoTitular]").value || "1234567890"

                    const datosTitular = {
                        nombreTitular: nombreTitular,
                        pasaporteTitular: pasaporteTitular,
                        correoTitular: correoTitular,
                        telefonoTitular: telefonoTitular
                    }
                    reservaLocal.datosTitular = datosTitular
                    const preconfirmarReserva = {
                        zona: "plaza/reservas/preConfirmarReserva",
                        reserva: reservaLocal
                    };
                    console.log("ss")

                    const respuestaServidor = await casaVitini.componentes.servidor(preconfirmarReserva)
                    console.log("ss")
                    console.log("respuestaServidor", respuestaServidor)

                    if (respuestaServidor?.error) {
                        return casaVitini.componentes.flujoPagoUI.errorInfo(respuestaServidor.error)
                        // return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor.error)
                    }
                    if (respuestaServidor.ok) {
                        const detalles = respuestaServidor.detalles
                        casaVitini.componentes.limpiarAdvertenciasInmersivas()
                        return casaVitini.ui.vistas.reservasNuevo.reservaConfirmada.sustitutorObjetos(detalles)
                    }
                }
            },
            errorVista: () => {

                let selectoresVistas = document.querySelectorAll("[vista")
                for (const vista of selectoresVistas) {
                    vista.style.backgroundColor = ""
                    vista.style.color = ""
                }

                let constructorSeccion = document.createElement("section")
                constructorSeccion.style.scale = "1";

                let vistaError = document.createElement("p")
                vistaError.setAttribute("id", "errorVista")
                vistaError.innerText = "Error, no se ha podido comunicar con el servidor. Reintentalo"
                vistaError.style.position = "relative"

                constructorSeccion.appendChild(vistaError);
                document.body.appendChild(constructorSeccion)
                document.getElementById("uiNavegacion").setAttribute("vistaActual", "error")
                document.getElementById("uiNavegacion").removeAttribute("arranqueVolatil")
                let espacio = document.body;

                espacio.style.background = ""
                espacio.style.backgroundSize = "cover"
                espacio.style.backgroundColor = "grey"

                let estado = {
                    zona: "Error",
                    "EstadoInternoZona": "estado"
                }
                let titulo = "Error"
                //  window.history.replaceState(Estado, Titulo, "/Error");
            },
            miCasa: {
                arranque: () => {
                    // document.body.style.backgroundImage = "url(/componentes/imagenes/loginFondo.jpg)"
                    //document.body.style.backgroundImage = 'url("/componentes/imagenes/playa.jpg")';
                    //document.body.classList.add("difuminadoFondo")
                    document.querySelector("[boton=iniciarSession]").addEventListener("click", () => {
                        casaVitini.ui.vistas.miCasa.botonIniciarSession("iniciarSession")
                    })
                    document.querySelector("[IDX=usuario]").focus();

                    const campos = [...document.querySelectorAll("[componente=campoID]")]
                    campos.map((campo) => {
                        campo.addEventListener("input", casaVitini.ui.vistas.miCasa.controladorCampos)
                        campo.addEventListener("input", casaVitini.ui.vistas.miCasa.reseteaBloqueRespuesta)
                        campo.addEventListener("keydown", (e) => {
                            if (e.key === "Enter") {
                                casaVitini.ui.vistas.miCasa.botonIniciarSession("iniciarSession")
                            }
                        });
                    })

                    const opciones = [...document.querySelectorAll("[opcion]")]
                    opciones.map((opcion) => {
                        opcion.addEventListener("click", casaVitini.componentes.cambiarVista)
                    })

                    const navegacion = {
                        tipo: "publico",
                        zona: "micasa"
                    }
                    casaVitini.componentes.controladorNavegacion(navegacion)
                    //casaVitini.ui.vistas.reservasNuevo.reservaConfirmada.UI();

                },
                reseteaBloqueRespuesta: () => {
                    const bloqueRespuesta = document.getElementById("bloqueRespuesta")
                    bloqueRespuesta.innerText = "Identificate con tu VitiniID"
                    bloqueRespuesta.removeAttribute("style")

                    document.querySelectorAll("[componente=campoID]").forEach(campo => {
                        campo.removeAttribute("style")
                    });
                },
                botonIniciarSession: (boton) => {


                    const bloqueRespuesta = document.getElementById("bloqueRespuesta")
                    bloqueRespuesta.innerText = null
                    bloqueRespuesta.removeAttribute("style")

                    if (boton === "iniciarSession") {
                        const usuario = document.querySelector("[IDX=usuario]")
                        const clave = document.querySelector("[IDX=clave]")


                        if (usuario.value.length === 0) {

                            const mensaje = "Por favor escribe tu usuario"
                            bloqueRespuesta.innerText = mensaje
                            bloqueRespuesta.style.display = "block"
                            return
                        }

                        if (clave.value.length === 0) {
                            const mensaje = "Por favor escribe tu contraseña"
                            bloqueRespuesta.innerText = mensaje
                            bloqueRespuesta.style.display = "block"
                            return
                        }

                        const transaccion = {
                            usuario: usuario.value,
                            clave: clave.value
                        }
                        return casaVitini.IDX.iniciarSession(transaccion)

                    }


                },
                cuenta: {
                    portada: {
                        arranque: async () => {
                            document.body.style.backgroundImage = 'url("/componentes/imagenes/playa.jpg")';
                            const marcoCuenta = document.querySelector("[componente=marcoCuenta]")
                            const metadatos = {
                                zona: "IDX",
                                IDX: "estado"
                            }
                            const respuestaServidor = await casaVitini.componentes.servidor(metadatos)
                            if (respuestaServidor?.error) {
                                return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
                            }


                            if (respuestaServidor?.usuario) {
                                const usuarioIDX = respuestaServidor?.usuario
                                const rol = respuestaServidor?.rol

                                const metadatosBanner = {
                                    usuarioIDX: usuarioIDX,
                                    rol: rol
                                }

                                const contenedorBanner = document.createElement("div")
                                contenedorBanner.classList.add("miCasa_marcoIDX_contenedor")

                                const bannerIDX = casaVitini.ui.vistas.miCasa.componentes.bannerIDX(metadatosBanner)
                                contenedorBanner.appendChild(bannerIDX)
                                marcoCuenta.appendChild(contenedorBanner)


                                const botonReservas = document.createElement("a")
                                botonReservas.setAttribute("class", "botonUsuario")
                                botonReservas.setAttribute("href", "/micasa/reservas")
                                botonReservas.setAttribute("vista", "/micasa/reservas")
                                botonReservas.classList.add("miCasa_marcoUsuario_opcion")
                                botonReservas.innerText = "Mis Reservas"
                                botonReservas.addEventListener("click", casaVitini.componentes.cambiarVista)


                                const botonModificarIDX = document.createElement("a")
                                botonModificarIDX.setAttribute("class", "botonUsuario")
                                botonModificarIDX.setAttribute("href", "/micasa/modificar_nombre_de_usuario")
                                botonModificarIDX.setAttribute("vista", "/micasa/modificar_nombre_de_usuario")
                                botonModificarIDX.classList.add("miCasa_marcoUsuario_opcion")
                                botonModificarIDX.innerText = "Modificar nombre de usuario"
                                botonModificarIDX.addEventListener("click", casaVitini.componentes.cambiarVista)

                                const botonDatosPersonales = document.createElement("a")
                                botonDatosPersonales.setAttribute("class", "botonUsuario")
                                botonDatosPersonales.setAttribute("href", "/micasa/mis_datos_personales")
                                botonDatosPersonales.setAttribute("vista", "/micasa/mis_datos_personales")
                                botonDatosPersonales.classList.add("miCasa_marcoUsuario_opcion")
                                botonDatosPersonales.innerText = "Mis datos personales"
                                botonDatosPersonales.addEventListener("click", casaVitini.componentes.cambiarVista)

                                const botonCambiarContrasena = document.createElement("a")
                                botonCambiarContrasena.setAttribute("class", "botonUsuario")
                                botonCambiarContrasena.setAttribute("href", "/micasa/cambiar_clave")
                                botonCambiarContrasena.setAttribute("vista", "/micasa/cambiar_clave")
                                botonCambiarContrasena.classList.add("miCasa_marcoUsuario_opcion")
                                botonCambiarContrasena.innerText = "Cambiar contrasena"
                                botonCambiarContrasena.addEventListener("click", casaVitini.componentes.cambiarVista)

                                const botonSessionesActivas = document.createElement("a")
                                botonSessionesActivas.setAttribute("class", "botonUsuario")
                                botonSessionesActivas.setAttribute("href", "/micasa/sessiones")
                                botonSessionesActivas.setAttribute("vista", "/micasa/sessiones")
                                botonSessionesActivas.classList.add("miCasa_marcoUsuario_opcion")
                                botonSessionesActivas.innerText = "Sessiones activas"
                                botonSessionesActivas.addEventListener("click", casaVitini.componentes.cambiarVista)


                                const botonZonaHoraria = document.createElement("a")
                                botonZonaHoraria.setAttribute("class", "botonUsuario")
                                botonZonaHoraria.setAttribute("href", "/micasa/zona_horaria")
                                botonZonaHoraria.setAttribute("vista", "/micasa/zona_horaria")
                                botonZonaHoraria.classList.add("miCasa_marcoUsuario_opcion")
                                botonZonaHoraria.innerText = "Configuracíon de la zona horaria"
                                botonZonaHoraria.addEventListener("click", casaVitini.componentes.cambiarVista)

                                const botonCerrarSession = document.createElement("a")
                                botonCerrarSession.setAttribute("class", "botonUsuario")
                                botonCerrarSession.setAttribute("componente", "botonCerrarSession")
                                botonCerrarSession.classList.add("miCasa_marcoUsuario_opcion")
                                botonCerrarSession.innerText = "Cerrar session"
                                botonCerrarSession.addEventListener("click", casaVitini.ui.vistas.miCasa.cerrarSession)


                                const botonEliminarCuenta = document.createElement("a")
                                botonEliminarCuenta.setAttribute("class", "botonUsuario")
                                botonEliminarCuenta.setAttribute("href", "/micasa/eliminar_cuenta")
                                botonEliminarCuenta.setAttribute("vista", "/micasa/eliminar_cuenta")
                                botonEliminarCuenta.setAttribute("componente", "botonEliminarCuenta")
                                botonEliminarCuenta.classList.add("miCasa_marcoUsuario_opcion")
                                botonEliminarCuenta.innerText = "Eliminar cuenta"
                                botonEliminarCuenta.addEventListener("click", casaVitini.componentes.cambiarVista)

                                //const marcoUsuario = document.querySelector("[componente=marcoUsuario]")
                                const marcoUsuario = document.createElement("div")
                                marcoUsuario.classList.add("miCasa_marcoUsuario")
                                marcoUsuario.setAttribute("componente", "marcoUsuario")


                                if (rol === "cliente") {
                                    marcoUsuario.appendChild(botonReservas)
                                    marcoUsuario.appendChild(botonModificarIDX)
                                    marcoUsuario.appendChild(botonDatosPersonales)
                                    marcoUsuario.appendChild(botonSessionesActivas)
                                    marcoUsuario.appendChild(botonCambiarContrasena)
                                    marcoUsuario.appendChild(botonEliminarCuenta)
                                    marcoUsuario.appendChild(botonCerrarSession)
                                }

                                if (rol === "administrador" || rol === "empleado") {
                                    marcoUsuario.appendChild(botonReservas)
                                    marcoUsuario.appendChild(botonModificarIDX)
                                    marcoUsuario.appendChild(botonDatosPersonales)
                                    marcoUsuario.appendChild(botonSessionesActivas)
                                    //marcoUsuario.appendChild(botonZonaHoraria)
                                    marcoUsuario.appendChild(botonCambiarContrasena)
                                    marcoUsuario.appendChild(botonEliminarCuenta)
                                    marcoUsuario.appendChild(botonCerrarSession)
                                }
                                marcoCuenta.appendChild(marcoUsuario)
                            }

                        },
                    },
                    datosPersonales: {
                        arranque: async () => {
                            document.body.style.backgroundImage = 'url("/componentes/imagenes/playa.jpg")';
                            const contenedorDatosPersonales = document.querySelector("[componente=marcoCuenta]")
                            const transaccion = {
                                zona: "/miCasa/datosPersonalesDesdeMiCasa"
                            }
                            const respuestaServidor = await casaVitini.componentes.servidor(transaccion)
                            if (respuestaServidor?.error) {
                                return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {

                                const detallesUsuario = respuestaServidor?.ok
                                const usuarioIDX = detallesUsuario.usuarioIDX
                                const rol = detallesUsuario.rol
                                const nombre = detallesUsuario.nombre || ""
                                const primerApellido = detallesUsuario.primerApellido || ""
                                const segundoApellido = detallesUsuario.segundoApellido || ""
                                const pasaporte = detallesUsuario.pasaporte || ""
                                const telefono = detallesUsuario.telefono || ""
                                const email = detallesUsuario.email || ""


                                const datosBanner = {
                                    usuarioIDX: usuarioIDX,
                                    rol: rol
                                }
                                const contenedorBanner = document.createElement("div")
                                contenedorBanner.classList.add("miCasa_marcoIDX_contenedor")
                                const contenedorUsuarioIDX = casaVitini.ui.vistas.miCasa.componentes.bannerIDX(datosBanner)
                                contenedorBanner.appendChild(contenedorUsuarioIDX)
                                contenedorDatosPersonales.appendChild(contenedorBanner)




                                const contenedorDatosUsuario = document.createElement("div")
                                contenedorDatosUsuario.classList.add("detallesUsuario_contenedorDatosUsuario")

                                const nombreUI = document.createElement("a")
                                nombreUI.classList.add("detallesUsuario_contenedorCampoEInfo")
                                nombreUI.innerText = "Nombre"

                                const campoNombre = document.createElement("input")
                                campoNombre.classList.add("detallesUsuario_campoDatosUsuario")
                                campoNombre.setAttribute("campo", "nombre")
                                campoNombre.placeholder = nombre
                                nombreUI.appendChild(campoNombre)
                                contenedorDatosUsuario.appendChild(nombreUI)


                                const primerApellidoUI = document.createElement("a")
                                primerApellidoUI.classList.add("detallesUsuario_contenedorCampoEInfo")
                                primerApellidoUI.innerText = "Primero apellido"

                                const campoPrimerApellido = document.createElement("input")
                                campoPrimerApellido.classList.add("detallesUsuario_campoDatosUsuario")
                                campoPrimerApellido.setAttribute("campo", "primerApellido")
                                campoPrimerApellido.placeholder = primerApellido
                                primerApellidoUI.appendChild(campoPrimerApellido)
                                contenedorDatosUsuario.appendChild(primerApellidoUI)



                                const segundoApellidoUI = document.createElement("a")
                                segundoApellidoUI.classList.add("detallesUsuario_contenedorCampoEInfo")
                                segundoApellidoUI.innerText = "Segundo apellido"

                                const campoSegundoApellido = document.createElement("input")
                                campoSegundoApellido.classList.add("detallesUsuario_campoDatosUsuario")
                                campoSegundoApellido.setAttribute("campo", "segundoApellido")
                                campoSegundoApellido.placeholder = segundoApellido
                                segundoApellidoUI.appendChild(campoSegundoApellido)
                                contenedorDatosUsuario.appendChild(segundoApellidoUI)



                                const pasaporteUI = document.createElement("a")
                                pasaporteUI.classList.add("detallesUsuario_contenedorCampoEInfo")
                                pasaporteUI.innerText = "Pasaporte"

                                const campoPasaporte = document.createElement("input")
                                campoPasaporte.classList.add("detallesUsuario_campoDatosUsuario")
                                campoPasaporte.setAttribute("campo", "pasaporte")
                                campoPasaporte.placeholder = pasaporte
                                pasaporteUI.appendChild(campoPasaporte)
                                contenedorDatosUsuario.appendChild(pasaporteUI)



                                const telefonoUI = document.createElement("a")
                                telefonoUI.classList.add("detallesUsuario_contenedorCampoEInfo")
                                telefonoUI.innerText = "Telefono"

                                const campoTelefono = document.createElement("input")
                                campoTelefono.classList.add("detallesUsuario_campoDatosUsuario")
                                campoTelefono.setAttribute("campo", "telefono")
                                campoTelefono.placeholder = telefono
                                telefonoUI.appendChild(campoTelefono)
                                contenedorDatosUsuario.appendChild(telefonoUI)




                                const emailUI = document.createElement("a")
                                emailUI.classList.add("detallesUsuario_contenedorCampoEInfo")
                                emailUI.innerText = "Correo electroníco"

                                const campoEmail = document.createElement("input")
                                campoEmail.classList.add("detallesUsuario_campoDatosUsuario")
                                campoEmail.setAttribute("campo", "email")
                                campoEmail.placeholder = email
                                emailUI.appendChild(campoEmail)
                                contenedorDatosUsuario.appendChild(emailUI)

                                contenedorDatosPersonales.appendChild(contenedorDatosUsuario)


                                const contenedorBotones = document.createElement("div")
                                contenedorBotones.classList.add("detallesUsuario_contenedorBotones")
                                contenedorBotones.setAttribute("componente", "contenedorBotones")


                                const botonGuardarCambios = document.createElement("div")
                                botonGuardarCambios.classList.add("detallesUsuario_botonV1")
                                botonGuardarCambios.addEventListener("click", casaVitini.ui.vistas.miCasa.cuenta.datosPersonales.guardarCambios)
                                botonGuardarCambios.innerText = "Guardar cambios"
                                contenedorBotones.appendChild(botonGuardarCambios)

                                const botonCancelarCambios = document.createElement("div")
                                botonCancelarCambios.classList.add("detallesUsuario_botonV1")
                                botonCancelarCambios.innerText = "Cancelar cambios"
                                botonCancelarCambios.addEventListener("click", casaVitini.ui.vistas.miCasa.cuenta.datosPersonales.cancelarCambios)
                                contenedorBotones.appendChild(botonCancelarCambios)

                                contenedorDatosPersonales.appendChild(contenedorBotones)

                                const campos = [...document.querySelectorAll("[campo]")]


                                const controladorCampos = () => {
                                    let estadoGlobalCampos = "vacios"
                                    campos.map((campo) => {
                                        if (campo.value.length > 0) {
                                            estadoGlobalCampos = "noVacios"
                                        }
                                    })


                                    const selectorContenedorBotones = document.querySelector("[componente=contenedorBotones]")
                                    if (estadoGlobalCampos === "vacios") {
                                        selectorContenedorBotones.removeAttribute("style")
                                    }
                                    if (estadoGlobalCampos === "noVacios") {
                                        selectorContenedorBotones.style.display = "flex"
                                    }

                                }


                                campos.map((campo) => {
                                    campo.addEventListener("input", controladorCampos)
                                })













                            }



                        },
                        cancelarCambios: () => {
                            const campos = [...document.querySelectorAll("[campo]")]

                            campos.map((campo) => {
                                campo.value = null
                            })
                            const selectorContenedorBotones = document.querySelector("[componente=contenedorBotones]")
                            selectorContenedorBotones.removeAttribute("style")

                        },
                        guardarCambios: async () => {
                            const campos = [...document.querySelectorAll("[campo]")]
                            const datosParaActualizar = {
                                zona: "miCasa/actualizarDatosUsuarioDesdeMiCasa",
                            }
                            campos.map((campo) => {
                                const campoID = campo.getAttribute("campo")
                                const campoDato = campo.value
                                datosParaActualizar[campoID] = campoDato

                            })

                            const respuestaServidor = await casaVitini.componentes.servidor(datosParaActualizar)
                            if (respuestaServidor?.error) {
                                return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                const detallesUsuario = respuestaServidor?.datosActualizados[0]


                                const nombre = detallesUsuario.nombre
                                const primerApellido = detallesUsuario.primerApellido
                                const segundoApellido = detallesUsuario.segundoApellido
                                const pasaporte = detallesUsuario.pasaporte
                                const telefono = detallesUsuario.telefono
                                const email = detallesUsuario.email

                                campos.map((campo) => {
                                    const campoID = campo.getAttribute("campo")

                                    campo.placeholder = detallesUsuario[campoID]
                                    campo.value = null
                                })
                                const selectorContenedorBotones = document.querySelector("[componente=contenedorBotones]")
                                selectorContenedorBotones.removeAttribute("style")
                            }
                        }
                    },
                    sessionesActivas: {
                        arranque: async () => {
                            document.body.style.backgroundImage = 'url("/componentes/imagenes/playa.jpg")';

                            const espacioBotones = document.querySelector("[componente=espacioBotones]")
                            const espacioSessiones = document.querySelector("[componente=espacioSessiones]")



                            const botonCerrarRestoSessiones = document.createElement("div")
                            botonCerrarRestoSessiones.classList.add("miCasa_sessiones_botonV2")
                            botonCerrarRestoSessiones.innerText = "Cerrar el resto de sessiones menos esta"
                            botonCerrarRestoSessiones.addEventListener("click", casaVitini.ui.vistas.miCasa.cuenta.sessionesActivas.cerrarTodasSessioneMenosUna)
                            espacioBotones.appendChild(botonCerrarRestoSessiones)



                            const transaccion = {
                                zona: "miCasa/obtenerSessionesActivasDesdeMiCasa"
                            }
                            const respuestaServidor = await casaVitini.componentes.servidor(transaccion)

                            if (respuestaServidor?.error) {
                                return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                const sessionesActivas = respuestaServidor?.sessionesActivas
                                if (sessionesActivas.length === 0) {
                                    // no hay sessiones

                                } else {
                                    const sessionIDX = respuestaServidor?.sessionIDX
                                    sessionesActivas.map((detallesSession) => {
                                        const sessionIDX_detallesSession = detallesSession.sessionIDX
                                        const caducidadUTC = detallesSession.caducidadUTC
                                        const tiempoRestante = detallesSession.tiempoRestante
                                        const ip = detallesSession.ip
                                        const userAgent = detallesSession.userAgent

                                        let sessionActual_UI = "(En otro equipo)"
                                        if (sessionIDX_detallesSession === sessionIDX) {
                                            sessionActual_UI = "(Session actual)"
                                        }

                                        const contenedorSession = document.createElement("div")
                                        contenedorSession.classList.add("miCasa_sessiones_contenedorSession")
                                        contenedorSession.setAttribute("componente", "contenedorSession")
                                        contenedorSession.setAttribute("sessionIDX", sessionIDX_detallesSession)
                                        contenedorSession.setAttribute("sessionActual", sessionIDX)

                                        const contenedorSessionID = document.createElement("div")
                                        contenedorSessionID.classList.add("miCasa_sessiones_contenedorBloque")

                                        const sessionInfo = document.createElement("div")
                                        sessionInfo.classList.add("miCasa_sessiones_texto")
                                        sessionInfo.classList.add("negrita")

                                        sessionInfo.innerText = "Session IDX " + sessionActual_UI
                                        contenedorSessionID.appendChild(sessionInfo)

                                        const sessionIDX_UI = document.createElement("div")
                                        sessionIDX_UI.classList.add("miCasa_sessiones_texto")
                                        sessionIDX_UI.innerText = sessionIDX_detallesSession
                                        contenedorSessionID.appendChild(sessionIDX_UI)

                                        contenedorSession.appendChild(contenedorSessionID)


                                        const ipSessionUI = document.createElement("div")
                                        ipSessionUI.classList.add("miCasa_sessiones_textoIP")
                                        ipSessionUI.innerText = ip
                                        contenedorSession.appendChild(ipSessionUI)

                                        const userAgentUI = document.createElement("div")
                                        userAgentUI.classList.add("miCasa_sessiones_textoIP")
                                        userAgentUI.innerText = userAgent
                                        contenedorSession.appendChild(userAgentUI)

                                        const contenedorCaducidad = document.createElement("div")
                                        contenedorCaducidad.classList.add("miCasa_sessiones_contenedorBloque")

                                        const caducidadInfo = document.createElement("div")
                                        caducidadInfo.classList.add("miCasa_sessiones_texto")
                                        caducidadInfo.innerText = "Caducida de la session en hora UTC si no se produce una nueva peticion:"
                                        contenedorCaducidad.appendChild(caducidadInfo)


                                        const caducidadESP_UI = document.createElement("div")
                                        caducidadESP_UI.classList.add("miCasa_sessiones_texto")
                                        caducidadESP_UI.classList.add("negrita")
                                        caducidadESP_UI.innerText = caducidadUTC
                                        contenedorCaducidad.appendChild(caducidadESP_UI)


                                        const tiempoRestante_UI = document.createElement("div")
                                        tiempoRestante_UI.classList.add("miCasa_sessiones_texto")
                                        tiempoRestante_UI.classList.add("negrita")
                                        tiempoRestante_UI.innerText = tiempoRestante
                                        contenedorCaducidad.appendChild(tiempoRestante_UI)

                                        contenedorSession.appendChild(contenedorCaducidad)

                                        const botonCerrarSession = document.createElement("div")
                                        botonCerrarSession.classList.add("miCasa_sessiones_botonCerrarSession")
                                        botonCerrarSession.addEventListener("click", casaVitini.ui.vistas.miCasa.cuenta.sessionesActivas.cerraSessionUnica)
                                        botonCerrarSession.innerText = "Cerrar session"
                                        contenedorSession.appendChild(botonCerrarSession)

                                        espacioSessiones.appendChild(contenedorSession)


                                    })


                                }











                            }



                        },
                        cerraSessionUnica: async (sessions) => {

                            const sessionIDX = sessions.target.closest("[sessionIDX]")
                            const transaccion = {
                                zona: "miCasa/cerrarSessionSelectivamenteDesdeMiCasa",
                                tipoOperacion: "cerrarUna",
                                sessionIDX: sessionIDX.getAttribute("sessionIDX")
                            }
                            const respuestaServidor = await casaVitini.componentes.servidor(transaccion)
                            if (respuestaServidor?.error) {
                                return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
                            }

                            if (respuestaServidor?.ok) {
                                const sessionActual = sessionIDX.getAttribute("sessionActual")
                                const sessionIDX_ = sessionIDX.getAttribute("sessionIDX")
                                sessionIDX.remove()
                                if (sessionActual === sessionIDX_) {
                                    const navegacion = {
                                        "vista": "/miCasa/sessiones",
                                        "tipoOrigen": "menuNavegador"
                                    }
                                    return casaVitini.componentes.controladorVista(navegacion)
                                }
                            }


                        },
                        cerrarTodasSessioneMenosUna: async () => {

                            const transaccion = {
                                zona: "miCasa/cerrarSessionSelectivamenteDesdeMiCasa",
                                tipoOperacion: "todasMenosActual",
                            }
                            const respuestaServidor = await casaVitini.componentes.servidor(transaccion)
                            if (respuestaServidor?.error) {
                                return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                const sessionActual = [...document.querySelectorAll("[sessionIDX]")]
                                sessionActual.map((sessionRenderizada) => {
                                    const sessionIDXActual = sessionRenderizada.getAttribute("sessionActual")
                                    const sessionIDXBloque = sessionRenderizada.getAttribute("sessionIDX")

                                    if (sessionIDXActual !== sessionIDXBloque) {
                                        sessionRenderizada.remove()
                                    }
                                })
                            }
                        }
                    },
                    cambiarClave: {
                        portada: {
                            arranque: () => {
                                document.body.removeAttribute("style")
                                const botonCambiarClave = document.querySelector("[componente=botonCambiarClave]")
                                botonCambiarClave.addEventListener("click", casaVitini.ui.vistas.miCasa.cuenta.cambiarClave.portada.cambiarClaveTransactor)
                            },
                            cambiarClaveTransactor: async () => {


                                const claveActual = document.querySelector("[campo=claveActual]").value
                                const claveNueva = document.querySelector("[campo=claveNueva]").value
                                const claveConfirmada = document.querySelector("[campo=claveConfirmada]").value

                                const transaccion = {
                                    zona: "miCasa/actualizarClaveUsuarioDesdeMicasa",
                                    claveActual: claveActual,
                                    claveNueva: claveNueva,
                                    claveConfirmada: claveConfirmada
                                }

                                const respuestaServidor = await casaVitini.componentes.servidor(transaccion)
                                if (respuestaServidor?.error) {
                                    return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
                                }
                                if (respuestaServidor?.ok) {
                                    const campos = [...document.querySelectorAll("[campo]")]
                                    campos.map((campo) => {
                                        campo.value = null
                                    })

                                }




                            }
                        }
                    },
                    eliminarCuenta: {
                        portada: {
                            arranque: () => {
                                document.body.removeAttribute("style")

                                const botonCambiarClave = document.querySelector("[componente=botonEliminarCuenta]")
                                botonCambiarClave.addEventListener("click", casaVitini.ui.vistas.miCasa.cuenta.eliminarCuenta.portada.transactor)
                            },
                            transactor: async () => {
                                const clave = document.querySelector("[campo=clave]").value

                                const transaccion = {
                                    zona: "miCasa/eliminarCuentaDesdeMiCasa",
                                    clave: clave
                                }
                                const respuestaServidor = await casaVitini.componentes.servidor(transaccion)
                                if (respuestaServidor?.error) {
                                    return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
                                }
                                if (respuestaServidor?.ok) {

                                    const vista = {
                                        "vista": "/micasa",
                                        "tipoOrigen": "menuNavegador"
                                    }
                                    await casaVitini.componentes.controladorVista(vista)

                                    const informacion = "Se ha elimiado tu cuenta correctamente. Sentimos que te vallas vuelve cuando quieras."
                                    casaVitini.ui.vistas.advertenciaInmersiva(informacion)
                                }
                            }
                        }
                    },
                    modificarIDX: {
                        arranque: async () => {
                            document.body.removeAttribute("style")

                            const botonActualizarIDX = document.querySelector("[componente=botonCambiarIDX]")
                            botonActualizarIDX.addEventListener("click", casaVitini.ui.vistas.miCasa.cuenta.modificarIDX.guardarCambios)

                        },
                        guardarCambios: async () => {

                            const nuevoIDX = document.querySelector("[campo=nuevoIDX]")
                            const datosParaActualizar = {
                                zona: "miCasa/actualizarIDX",
                                nuevoIDX: nuevoIDX.value
                            }

                            const respuestaServidor = await casaVitini.componentes.servidor(datosParaActualizar)
                            if (respuestaServidor?.error) {
                                return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
                            }

                            if (respuestaServidor?.ok) {
                                nuevoIDX.value = null
                                casaVitini.componentes.controladorEstadoIDX()

                            }

                        },


                    },
                    reservas: {
                        arranque: async () => {
                            document.body.style.backgroundImage = 'url("/componentes/imagenes/playa.jpg")';

                            const granuladoURL = casaVitini.componentes.granuladorURL()
                            const comandoInicial = granuladoURL.directorios[granuladoURL.directorios.length - 1]
                            const parametros = granuladoURL.parametros
                            const directorios = granuladoURL.directorios

                            if (comandoInicial === "reservas" && Object.keys(parametros).length === 0) {
                                const transaccion = {
                                    zona: "miCasa/misReservas/listarMisReservas",
                                    pagina: 1,
                                    origen: "url",
                                    tipoConstruccionGrid: "total"
                                }
                                return casaVitini.ui.vistas.miCasa.cuenta.reservas.mostrarReservasResueltas(transaccion)
                            }
                            if (Number.isInteger(Number(comandoInicial))) {
                                const reservaUID = comandoInicial
                                return casaVitini.ui.vistas.miCasa.cuenta.reservas.detallesReserva(reservaUID)
                            }
                            if (Object.keys(parametros).length > 0) {
                                const transaccion = {
                                    zona: "miCasa/misReservas/listarMisReservas",
                                    origen: "url",
                                    tipoConstruccionGrid: "total",
                                    ...granuladoURL.parametros,

                                }
                                transaccion.pagina = transaccion.pagina ? Number(transaccion.pagina) : 1

                                if (transaccion.nombre_columna) {
                                    transaccion.nombreColumna = transaccion.nombre_columna.replace(/_([a-z])/g, (_, group1) => group1.toUpperCase());
                                    delete transaccion.nombre_columna
                                }
                                if (transaccion.sentido_columna) {
                                    transaccion.sentidoColumna = transaccion.sentido_columna
                                    delete transaccion.sentido_columna
                                }

                                return casaVitini.ui.vistas.miCasa.cuenta.reservas.mostrarReservasResueltas(transaccion)


                            }




                        },
                        detallesReserva: async (reservaUID) => {

                            const transacccion = {
                                zona: "miCasa/misReservas/detallesReserva",
                                reservaUID: Number(reservaUID)
                            }
                            const respuestaServidor = await casaVitini.componentes.servidor(transacccion)

                            if (respuestaServidor?.error) {
                                return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor.error)
                            }

                            if (respuestaServidor.reserva) {
                                const detallesDeLaReserva = respuestaServidor.reserva
                                const desgloseFinanciero = respuestaServidor.desgloseFinanciero
                                const reservaUID = detallesDeLaReserva.reserva
                                const estadoReserva = detallesDeLaReserva.estadoReserva
                                const estadoPago = detallesDeLaReserva.estadoPago
                                const fechaCreacion = detallesDeLaReserva.creacion
                                const origenDeLaReserva = detallesDeLaReserva.origen
                                const fechaEntrada = detallesDeLaReserva.entrada
                                const fechaSalida = detallesDeLaReserva.salida
                                const totalReserva = desgloseFinanciero.totales.totalConImpuestos

                                const desgloseAlojamientosData = {
                                    alojamiento: respuestaServidor.alojamiento,
                                    pernoctantesSinHabitacion: respuestaServidor.pernoctantesSinHabitacion
                                }


                                //const totalRapidoGlobal = desgloseFinanciero.totales.totalConImpuestos

                                let estadoReservaUI
                                if (estadoReserva === "cancelada") {
                                    estadoReservaUI = "Cancelada"
                                }
                                if (estadoReserva === "confirmada") {
                                    estadoReservaUI = "Confirmada"
                                }
                                if (estadoReserva === "noConfirmada") {
                                    estadoReservaUI = "No confirmada"
                                }
                                let estadoPagoUI
                                if (estadoPago === "pagado") {
                                    estadoPagoUI = "Pagado"
                                }
                                if (estadoPago === "noPagado") {
                                    estadoPagoUI = "No pagado"
                                }
                                if (estadoPago === "sinInformacion") {
                                    estadoPagoUI = "Sin informacion"
                                }

                                /*
                                const marcoElastico = document.createElement("div")
                                marcoElastico.classList.add("marcoElasticoRelativo")
                                marcoElastico.setAttribute("componente", "marcoElastico")
                                */
                                const marcoElastico = document.querySelector("[componente=espacioMisReservas]")

                                // Crear el elemento div principal
                                const divPrincipal = document.createElement('div');
                                divPrincipal.setAttribute('componente', 'detalleReserva');
                                divPrincipal.classList.add('miCasa_reservas_detallesReservas_contenedorGeneralReserva');

                                // Crear el elemento div.reservaDetallesBloqueGeneral
                                const divBloqueGeneral = document.createElement('div');
                                divBloqueGeneral.setAttribute('class', 'reservaDetallesBloqueGeneral');

                                const divInformacionGeneral = document.createElement('div');
                                divInformacionGeneral.setAttribute('class', 'miCasa_misReservas_detallesReserva_marcoInformacionGlobal');

                                const divBloqueDual1 = document.createElement('div');
                                divBloqueDual1.setAttribute('class', 'administracionReservaBloqueDual');

                                const pTitulo1 = document.createElement('p');
                                pTitulo1.setAttribute('class', 'adminsitracionReservasTituloNombre marginCeroparaP');
                                pTitulo1.textContent = 'Reserva';

                                const pDato1 = document.createElement('p');
                                pDato1.setAttribute('class', 'marginCeroparaP');
                                pDato1.setAttribute('dataReserva', 'reservaID');
                                pDato1.setAttribute("reserva", reservaUID)
                                pDato1.textContent = reservaUID;

                                divBloqueDual1.appendChild(pTitulo1);
                                divBloqueDual1.appendChild(pDato1);

                                const divBloqueDual2 = document.createElement('div');
                                divBloqueDual2.setAttribute('class', 'administracionReservaBloqueDual');

                                const pTitulo2 = document.createElement('p');
                                pTitulo2.setAttribute('class', 'adminsitracionReservasTituloNombre marginCeroparaP');
                                pTitulo2.textContent = 'Fecha de creación';

                                const pDato2 = document.createElement('p');
                                pDato2.setAttribute('class', 'marginCeroparaP');
                                pDato2.setAttribute('dataReserva', 'nada');
                                pDato2.textContent = fechaCreacion;

                                divBloqueDual2.appendChild(pTitulo2);
                                divBloqueDual2.appendChild(pDato2);

                                const divBloqueDual3 = document.createElement('div');
                                divBloqueDual3.setAttribute('class', 'administracionReservaBloqueDual');

                                const pTitulo3 = document.createElement('p');
                                pTitulo3.setAttribute('class', 'adminsitracionReservasTituloNombre marginCeroparaP');
                                pTitulo3.textContent = 'Origen de la reserva';

                                const pDato3 = document.createElement('p');
                                pDato3.setAttribute('class', 'marginCeroparaP');
                                pDato3.setAttribute('dataReserva', 'origen');
                                pDato3.textContent = origenDeLaReserva;

                                divBloqueDual3.appendChild(pTitulo3);
                                divBloqueDual3.appendChild(pDato3);

                                const divBloqueDual4 = document.createElement('div');
                                divBloqueDual4.setAttribute('class', 'administracionReservaBloqueDual');

                                const pTitulo4 = document.createElement('p');
                                pTitulo4.setAttribute('class', 'adminsitracionReservasTituloNombre marginCeroparaP');
                                pTitulo4.textContent = 'Estado de la reserva';

                                const pDato4 = document.createElement('p');
                                pDato4.setAttribute('class', 'marginCeroparaP');
                                pDato4.setAttribute('dataReserva', 'estado');
                                pDato4.textContent = estadoReservaUI;

                                divBloqueDual4.appendChild(pTitulo4);
                                divBloqueDual4.appendChild(pDato4);

                                const divBloqueDual5 = document.createElement('div');
                                divBloqueDual5.setAttribute('class', 'administracionReservaBloqueDual');

                                const pTitulo5 = document.createElement('p');
                                pTitulo5.setAttribute('class', 'adminsitracionReservasTituloNombre marginCeroparaP');
                                pTitulo5.textContent = 'Estado del pago';

                                const pDato5 = document.createElement('p');
                                pDato5.setAttribute('class', 'marginCeroparaP');
                                pDato5.setAttribute('dataReserva', 'pago');
                                pDato5.textContent = estadoPagoUI;

                                divBloqueDual5.appendChild(pTitulo5);
                                divBloqueDual5.appendChild(pDato5);

                                const divBloqueDual6 = document.createElement('div');
                                divBloqueDual6.setAttribute('class', 'administracionReservaBloqueDual');

                                const pTitulo6 = document.createElement('p');
                                pTitulo6.setAttribute('class', 'adminsitracionReservasTituloNombre marginCeroparaP');
                                pTitulo6.textContent = 'Total';

                                const pDato6 = document.createElement('p');
                                pDato6.setAttribute('class', 'marginCeroparaP');
                                pDato6.setAttribute('dataReserva', 'totalReservaConImpuestos');
                                pDato6.textContent = totalReserva;

                                divBloqueDual6.appendChild(pTitulo6);
                                divBloqueDual6.appendChild(pDato6);

                                divInformacionGeneral.appendChild(divBloqueDual1);
                                divInformacionGeneral.appendChild(divBloqueDual2);
                                //divInformacionGeneral.appendChild(divBloqueDual3);
                                divInformacionGeneral.appendChild(divBloqueDual4);
                                divInformacionGeneral.appendChild(divBloqueDual5);
                                //divInformacionGeneral.appendChild(divBloqueDual6);


                                // Anadir divInformacionGeneral a divBloqueGeneral
                                divBloqueGeneral.appendChild(divInformacionGeneral);


                                // Anadir divBloqueGeneral al div principal
                                divPrincipal.appendChild(divBloqueGeneral);

                                // Crear el elemento div.reservaDetallesBloqueFecha
                                const divBloqueFecha = document.createElement('div');
                                divBloqueFecha.setAttribute('class', 'reservaDetallesBloqueFecha');

                                // Crear los elementos div.administracionReservaBloqueDual para las fechas de entrada y salida
                                const divFechaEntrada = document.createElement('div');
                                divFechaEntrada.setAttribute('class', 'miCasa_reservas_detallesReservas_bloqueDual  diaEntradaNuevo');
                                divFechaEntrada.setAttribute('componente', 'fechaEntrada');
                                //divFechaEntrada.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.constructorCalendario)
                                divFechaEntrada.setAttribute('calendario', 'entrada');
                                divFechaEntrada.setAttribute('fechaEntrada', fechaEntrada);

                                const pTituloEntrada = document.createElement('p');
                                pTituloEntrada.setAttribute('class', 'adminsitracionReservasTituloNombre marginCeroparaP componenteFechaEntrada desactivaEventos');
                                pTituloEntrada.textContent = 'Fecha de entrada';

                                const pFechaEntrada = document.createElement('p');
                                pFechaEntrada.setAttribute('class', 'marginCeroparaP componenteFechaEntrada desactivaEventos');
                                pFechaEntrada.setAttribute('id', 'fechaEntrada');
                                pFechaEntrada.setAttribute('dataReserva', 'fechaEntrada');
                                pFechaEntrada.textContent = fechaEntrada;

                                divFechaEntrada.appendChild(pTituloEntrada);
                                divFechaEntrada.appendChild(pFechaEntrada);
                                divBloqueFecha.appendChild(divFechaEntrada);

                                const divFechaSalida = document.createElement('div');
                                divFechaSalida.setAttribute('class', 'miCasa_reservas_detallesReservas_bloqueDual ');
                                divFechaSalida.setAttribute('componente', 'fechaSalida');
                                //divFechaSalida.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.constructorCalendario)
                                divFechaSalida.setAttribute('calendario', 'salida');
                                divFechaSalida.setAttribute('fechaSalida', fechaSalida);

                                const pTituloSalida = document.createElement('p');
                                pTituloSalida.setAttribute('class', 'adminsitracionReservasTituloNombre marginCeroparaP componenteFechaSalida desactivaEventos');
                                pTituloSalida.textContent = 'Fecha de salida';

                                const pFechaSalida = document.createElement('p');
                                pFechaSalida.setAttribute('class', 'marginCeroparaP componenteFechaSalida desactivaEventos');
                                pFechaSalida.setAttribute('id', 'fechaSalida');
                                pFechaSalida.setAttribute('dataReserva', 'fechaSalida');
                                pFechaSalida.textContent = fechaSalida;

                                divFechaSalida.appendChild(pTituloSalida);
                                divFechaSalida.appendChild(pFechaSalida);
                                divBloqueFecha.appendChild(divFechaSalida);

                                // Anadir divBloqueFecha al div principal
                                divPrincipal.appendChild(divBloqueFecha);


                                // Crear el elemento div.resertaDetallesPropuestaCambioFechaReserva
                                const divPropuestaCambioFecha = document.createElement('div');
                                divPropuestaCambioFecha.setAttribute('class', 'resertaDetallesPropuestaCambioFechaReserva');
                                divPropuestaCambioFecha.setAttribute('componente', 'espacioPropuestaCambioFechaReserva');

                                // Anadir divPropuestaCambioFecha al div principal
                                divPrincipal.appendChild(divPropuestaCambioFecha);


                                // Crear el elemento div.adminstracionReservasDetallesMarcoBotones
                                const divBotones = document.createElement('div');
                                divBotones.setAttribute('class', 'administracion_reserva_detallesReserva_marcoMenuExpandido');

                                // Crear el primer botón: p.botonSimpleV2 - Anadir apartamento
                                const botonAnadirApartamento = document.createElement('p');
                                botonAnadirApartamento.setAttribute('class', 'adminitracion_reservas_DetallesReserva_botonCategoria');
                                botonAnadirApartamento.setAttribute('categoriaReserva', 'anadirApartamento');
                                botonAnadirApartamento.setAttribute('componente', 'menuDesplegable');
                                botonAnadirApartamento.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.abrirMenuReservas)

                                botonAnadirApartamento.textContent = 'Anadir apartamento';
                                //divBotones.appendChild(botonAnadirApartamento);

                                // Crear el segundo botón: p.botonSimpleV2 - Nueva reserva con los datos de esta
                                const botonNuevaReserva = document.createElement('a');
                                botonNuevaReserva.setAttribute('class', 'adminitracion_reservas_DetallesReserva_botonCategoria');
                                botonNuevaReserva.setAttribute('categoriaReserva', 'alojamiento');
                                botonNuevaReserva.setAttribute('href', '/administracion/reservas/' + reservaUID + "/alojamiento");
                                botonNuevaReserva.addEventListener("click", (e) => {
                                    e.preventDefault()
                                    casaVitini.administracion.reservas.detallesReserva.desgloseAlojamientoUI(reservaUID)
                                })
                                botonNuevaReserva.textContent = 'Alojamiento';
                                divBotones.appendChild(botonNuevaReserva);
                                // Crear el tercer botón: p.botonSimpleV2 - Calcular precio
                                const botonCalcularPrecio = document.createElement('p');
                                botonCalcularPrecio.setAttribute('class', 'adminitracion_reservas_DetallesReserva_botonCategoria');
                                botonCalcularPrecio.setAttribute('componente', 'botonCalcularPrecioReserva');
                                botonCalcularPrecio.setAttribute('categoriaReserva', 'enlacesDePago');
                                botonCalcularPrecio.setAttribute('href', '/administracion/reservas/' + reservaUID + "/enlaces_de_pago");
                                botonCalcularPrecio.addEventListener("click", (e) => {
                                    e.preventDefault()
                                    casaVitini.administracion.reservas.detallesReserva.transacciones.UI.enlacesDePago()
                                })
                                botonCalcularPrecio.textContent = 'Enlaces de pago';
                                //  divBotones.appendChild(botonCalcularPrecio);

                                // Crear el cuarto botón: p.botonSimpleV2 - Aplicar un descuento
                                const botonAplicarDescuento = document.createElement('p');
                                botonAplicarDescuento.setAttribute('class', 'adminitracion_reservas_DetallesReserva_botonCategoria');
                                botonAplicarDescuento.setAttribute('categoriaReserva', 'aplicarDescuento');
                                botonAplicarDescuento.setAttribute('vista', '/administracion/reservas');
                                botonAplicarDescuento.textContent = 'Aplicar un descuento';

                                // divBotones.appendChild(botonAplicarDescuento);
                                const botonDetallesDelPago = document.createElement('p');
                                botonDetallesDelPago.setAttribute('class', 'adminitracion_reservas_DetallesReserva_botonCategoria');
                                botonDetallesDelPago.setAttribute('categoriaReserva', 'transacciones');
                                botonDetallesDelPago.textContent = 'Transacciones';
                                //botonDetallesDelPago.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.transacciones.desplegarUI)
                                //   divBotones.appendChild(botonDetallesDelPago);

                                // divBotones.appendChild(botonAplicarDescuento);
                                const botonEnlacePago = document.createElement('p');
                                botonEnlacePago.setAttribute('class', 'adminitracion_reservas_DetallesReserva_botonCategoria');
                                botonEnlacePago.setAttribute('categoriaReserva', 'desgloseTotal');
                                botonEnlacePago.textContent = 'Desglose del total';
                                //botonEnlacePago.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.enlaceDePago.desplegarUI)
                                divBotones.appendChild(botonEnlacePago);

                                // divBotones.appendChild(botonAplicarDescuento);
                                const botonReembolso = document.createElement('p');
                                botonReembolso.setAttribute('class', 'adminitracion_reservas_DetallesReserva_botonCategoria');
                                botonReembolso.setAttribute('categoriaReserva', 'reembolso');
                                //botonReembolso.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.desgloseFinancieroUI)
                                botonReembolso.textContent = 'Reembolsar';
                                //divBotones.appendChild(botonReembolso);

                                // Crear el quinto botón: p.botonSimpleV2 - Cancelar reserva
                                const botonCancelarReserva = document.createElement('p');
                                botonCancelarReserva.setAttribute('class', 'adminitracion_reservas_DetallesReserva_botonCategoria');
                                botonCancelarReserva.setAttribute('categoriaReserva', 'cancelarReserva');
                                //botonCancelarReserva.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.cancelarReserva.UI)
                                botonCancelarReserva.textContent = 'Cancelar reserva';
                                // divBotones.appendChild(botonCancelarReserva);

                                // Anadir divBotones al div principal
                                // divPrincipal.appendChild(divBotones);






                                // Menu categorias reserva responsiba
                                const marcoMenuResponsivo = document.createElement('div');
                                marcoMenuResponsivo.setAttribute('class', 'administracion_reserva_detallesReserva_marcoMenuResponsivo');

                                const menuResponsivo = document.createElement("div")
                                menuResponsivo.classList.add("administracion_reserva_detallesReserva_menuResponsivo_texto")
                                menuResponsivo.innerText = "Menu reserva"
                                menuResponsivo.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.despleguarMenuResponsivo)

                                marcoMenuResponsivo.appendChild(menuResponsivo)
                                //divPrincipal.appendChild(marcoMenuResponsivo);




                                const contenedorDinamico = document.createElement("div")
                                contenedorDinamico.classList.add("administracion_reservas_detallesReserva_contenedorDinamico")
                                contenedorDinamico.setAttribute("componente", "contenedorDinamico")
                                // divPrincipal.appendChild(contenedorDinamico)

                                const reservaDetallesBloqueAlojamineto = document.createElement('div');
                                reservaDetallesBloqueAlojamineto.setAttribute('class', 'reservaDetallesBloqueAlojamineto');
                                reservaDetallesBloqueAlojamineto.setAttribute('componente', 'marcoAlojamiento');

                                //divPrincipal.appendChild(reservaDetallesBloqueAlojamineto);


                                // Crear el elemento div.resertaDetallesEspacioTotales
                                const divEspacioTotales = document.createElement('div');
                                divEspacioTotales.setAttribute('class', 'resertaDetallesEspacioTotales');
                                divEspacioTotales.setAttribute('componente', 'espacioTotalesReserva');

                                // Anadir divEspacioTotales al div principal
                                // divPrincipal.appendChild(divEspacioTotales);



                                // Anadir el div principal al contenedor
                                marcoElastico.appendChild(divPrincipal);
                                //marcoElastico.style.marginTop = "100px"
                                //const seccion = document.querySelector("[componente=marcoEsastico]")
                                //seccion.appendChild(marcoElastico)

                                const marcoAlojamiento = casaVitini.ui.vistas.miCasa.cuenta.reservas.desgloseAlojamientoUI(desgloseAlojamientosData)
                                // const marcoFinanciero = casaVitini.ui.vistas.miCasa.cuenta.reservas.desgloseFinancieroUI(desgloseFinanciero)

                                marcoElastico.appendChild(marcoAlojamiento)
                                // marcoElastico.appendChild(marcoFinanciero)

                                const contenedorEspacioTotales = document.createElement("div")
                                contenedorEspacioTotales.classList.add("miCasa_reservas_detallesReservas_contenedorTotales")
                                contenedorEspacioTotales.setAttribute("contenedor", "contenedorTotales")
                                marcoElastico.appendChild(contenedorEspacioTotales)

                                const totalesPorNoche = desgloseFinanciero.totalesPorNoche
                                const totalesPorApartamento = desgloseFinanciero.totalesPorApartamento
                                const ofertas = desgloseFinanciero.ofertas
                                const impuestos = desgloseFinanciero.impuestos
                                const totales = desgloseFinanciero.totales



                                const desgloseTotales = {
                                    totalesPorApartamento: totalesPorApartamento,
                                    totalesPorNoche: totalesPorNoche,
                                    totales: totales,
                                    impuestos: impuestos,
                                    ofertas: ofertas,
                                    destino: "[contenedor=contenedorTotales]"
                                }
                                casaVitini.componentes.ui.totales(desgloseTotales)



                            }




                        },
                        desgloseAlojamientoUI: (datosAlojamiento) => {

                            const alojamiento = datosAlojamiento.alojamiento
                            const pernoctantesSinHabitacion = datosAlojamiento.pernoctantesSinHabitacion

                            const marcoAlojamiento = document.createElement('div');
                            marcoAlojamiento.setAttribute('class', 'miCasa_reservas_detallesReservas_marcoAlojamiento');
                            marcoAlojamiento.setAttribute('componente', 'marcoAlojamiento');


                            const divPernoctantesSinAlojamiento = document.createElement('div');
                            divPernoctantesSinAlojamiento.setAttribute('class', 'resertaDetallesPernoctantesSinAlojameinto elementoOcultoInicialmente');
                            divPernoctantesSinAlojamiento.setAttribute('componente', 'espacioPernoctantesSinAlojamiento');

                            const tituloPernoctantesSinHabitacion = document.createElement("div")
                            tituloPernoctantesSinHabitacion.classList.add("administracion_reservas_detallesReservas_tituloPernoctantesSinHabitacion")
                            tituloPernoctantesSinHabitacion.innerText = "Pernoctantes asociados a esta reserva sin habitacíon asignada"
                            divPernoctantesSinAlojamiento.appendChild(tituloPernoctantesSinHabitacion)

                            const contenedorPernoctantesSinHabitacion = document.createElement("div")
                            contenedorPernoctantesSinHabitacion.classList.add("administracion_reservas_detallesReserva_contenedorPernoctantesSinHabitacion")
                            contenedorPernoctantesSinHabitacion.setAttribute('componente', 'contenedorPernoctantesSinHabitacion');

                            divPernoctantesSinAlojamiento.appendChild(contenedorPernoctantesSinHabitacion)

                            marcoAlojamiento.appendChild(divPernoctantesSinAlojamiento)

                            const contenedorAlojamientoUI = document.createElement("div")
                            contenedorAlojamientoUI.classList.add("administracionReservaDetallesBloqueContendioAlojamiento")
                            contenedorAlojamientoUI.setAttribute("componente", "contenedorIntermedioAlojamiento")

                            const botonAnadirApartamento = document.createElement('p');
                            botonAnadirApartamento.setAttribute('class', 'adminitracion_reservas_DetallesReserva_botonCategoria');
                            botonAnadirApartamento.setAttribute('componenteBoton', 'anadirApartamento');
                            botonAnadirApartamento.setAttribute('componente', 'menuDesplegable');
                            //botonAnadirApartamento.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.abrirMenuReservas)
                            botonAnadirApartamento.textContent = 'Anadir apartamento';
                            contenedorAlojamientoUI.appendChild(botonAnadirApartamento)

                            const espacioAlojamiento = document.createElement("div")
                            espacioAlojamiento.classList.add("reservasDetallesBloqueAlojamiennto")
                            espacioAlojamiento.setAttribute("componente", "espacioAlojamiento")

                            //marcoAlojamiento.appendChild(contenedorAlojamientoUI)
                            marcoAlojamiento.appendChild(espacioAlojamiento)

                            for (const [apartamento, configuracionApartamento] of Object.entries(alojamiento)) {

                                let apartamentoIDV = apartamento
                                let apartamentoUID = configuracionApartamento["apartamentoUID"]

                                let apartamentoUI = configuracionApartamento["apartamentoUI"]
                                let configuracionesHabitacion = configuracionApartamento["habitaciones"]
                                let metadatos
                                metadatos = {
                                    "apartamentoIDV": apartamentoIDV,
                                    "apartamentoUID": apartamentoUID,
                                    "apartamentoUI": apartamentoUI
                                }
                                let apartamentoComponenteUI = casaVitini.ui.vistas.miCasa.cuenta.reservas.UIComponentes.apatamentoUI(metadatos)
                                metadatos = {
                                    "apartamentoUI": apartamentoUI,
                                }
                                let apartamentoTituloComponenteUI = casaVitini.ui.vistas.miCasa.cuenta.reservas.UIComponentes.apartamentoTituloUI(metadatos)
                                apartamentoComponenteUI.appendChild(apartamentoTituloComponenteUI)

                                delete configuracionApartamento["uid"]

                                for (const [habitacion, configuracionHabitacion] of Object.entries(configuracionesHabitacion)) {

                                    const habitacionIDV = habitacion
                                    const habitacionUID = configuracionHabitacion["habitacionUID"]
                                    const habitacionUI = configuracionHabitacion["habitacionUI"]
                                    const camaIDV = configuracionHabitacion["camaIDV"]
                                    const camaUID = configuracionHabitacion["camaUID"]
                                    const camaUI = configuracionHabitacion["camaUI"]

                                    const pernoctantes = configuracionHabitacion.pernoctantes.pernoctantes
                                    const pernoctantesPool = configuracionHabitacion.pernoctantes.pernoctantesPool

                                    metadatos = {
                                        "habitacionIDV": habitacionIDV,
                                        "habitacionUID": habitacionUID,
                                        "apartamentoIDV": apartamentoIDV
                                    }
                                    const habitacionComponenteUI = casaVitini.ui.vistas.miCasa.cuenta.reservas.UIComponentes.habitacionUI(metadatos)
                                    metadatos = {
                                        "habitacionUI": habitacionUI,
                                    }
                                    const habitacionTituloComponenteUI = casaVitini.ui.vistas.miCasa.cuenta.reservas.UIComponentes.habitacionTituloUI(metadatos)
                                    habitacionComponenteUI.appendChild(habitacionTituloComponenteUI)

                                    metadatos = {
                                        "camaIDV": camaIDV,
                                        "camaUID": camaUID,
                                        "camaUI": camaUI,
                                        "apartamentoIDV": apartamentoIDV,
                                        "habitacionIDV": habitacionIDV,
                                        "habitacionUID": habitacionUID
                                    }

                                    const camaComponenteUI = casaVitini.ui.vistas.miCasa.cuenta.reservas.UIComponentes.camaUI(metadatos)
                                    habitacionComponenteUI.appendChild(camaComponenteUI)

                                    for (const detallesPernoctante of pernoctantes) {

                                        const nombreCompleto = detallesPernoctante.nombrePernoctante
                                        const pasaporte = detallesPernoctante.pasaportePernoctante
                                        const clienteUID = detallesPernoctante.clienteUID
                                        const pernoctanteUID = detallesPernoctante.pernoctanteUID

                                        // cliente clientePool
                                        let metadatos = {
                                            tipoPernoctante: "cliente",
                                            clienteUID: clienteUID,
                                            pernoctanteUID: pernoctanteUID,
                                            estadoAlojamiento: "alojado"
                                        }

                                        const bloquePernoctantes = casaVitini.ui.vistas.miCasa.cuenta.reservas.UIComponentes.pernoctanteUI(metadatos)
                                        metadatos = {
                                            nombreCompleto: nombreCompleto,
                                            clienteUID: clienteUID
                                        }
                                        const nombrePernoctante = casaVitini.ui.vistas.miCasa.cuenta.reservas.UIComponentes.pernoctanteNombreUI(metadatos)
                                        bloquePernoctantes.appendChild(nombrePernoctante)

                                        metadatos = {
                                            pasaporte: pasaporte,
                                            clienteUID: clienteUID
                                        }
                                        const identificacionPernoctante = casaVitini.ui.vistas.miCasa.cuenta.reservas.UIComponentes.pernoctantePasaporteUI(metadatos)
                                        bloquePernoctantes.appendChild(identificacionPernoctante)


                                        habitacionComponenteUI.appendChild(bloquePernoctantes)
                                    }

                                    for (const detallesPernoctantePool of pernoctantesPool) {
                                        const nombreCompleto = detallesPernoctantePool.nombrePernoctante
                                        const pasaporte = detallesPernoctantePool.pasaportePernoctante
                                        const clientePoolUID = detallesPernoctantePool.clientePoolUID
                                        const pernoctanteUID = detallesPernoctantePool.pernoctanteUID

                                        // cliente clientePool
                                        let metadatos = {
                                            tipoPernoctante: "clientePool",
                                            clienteUID: clientePoolUID,
                                            pernoctanteUID: pernoctanteUID,
                                            estadoAlojamiento: "alojado"
                                        }

                                        const bloquePernoctantes = casaVitini.ui.vistas.miCasa.cuenta.reservas.UIComponentes.pernoctanteUI(metadatos)
                                        metadatos = {
                                            nombreCompleto: nombreCompleto,
                                            clienteUID: clientePoolUID
                                        }
                                        const nombrePernoctante = casaVitini.ui.vistas.miCasa.cuenta.reservas.UIComponentes.pernoctanteNombreUI(metadatos)
                                        bloquePernoctantes.appendChild(nombrePernoctante)

                                        metadatos = {
                                            pasaporte: pasaporte,
                                            clienteUID: clientePoolUID
                                        }
                                        const identificacionPernoctante = casaVitini.ui.vistas.miCasa.cuenta.reservas.UIComponentes.pernoctantePasaporteUI(metadatos)
                                        bloquePernoctantes.appendChild(identificacionPernoctante)

                                        habitacionComponenteUI.appendChild(bloquePernoctantes)
                                    }
                                    apartamentoComponenteUI.appendChild(habitacionComponenteUI)
                                }
                                espacioAlojamiento.appendChild(apartamentoComponenteUI)
                            }


                            pernoctantesSinHabitacion.pernoctantes.map((pernoctante) => {

                                const pernoctanteUID = pernoctante["pernoctanteUID"]
                                const clienteUID = pernoctante["clienteUID"]
                                const nombreCompleto = pernoctante["nombreCompleto"]
                                const pasaporte = pernoctante["pasaporte"]

                                const metadatosPernoctanteUI = {
                                    tipoPernoctante: "cliente",
                                    clienteUID: clienteUID,
                                    pernoctanteUID: pernoctanteUID,
                                    estadoAlojamiento: "noAlojado"
                                }

                                const bloquePernoctantes = casaVitini.ui.vistas.miCasa.cuenta.reservas.UIComponentes.pernoctanteUI(metadatosPernoctanteUI)
                                const metadatosNombreUI = {
                                    nombreCompleto: nombreCompleto,
                                    clienteUID: clienteUID
                                }
                                const nombrePernoctante = casaVitini.ui.vistas.miCasa.cuenta.reservas.UIComponentes.pernoctanteNombreUI(metadatosNombreUI)
                                bloquePernoctantes.appendChild(nombrePernoctante)

                                const metadatosPasaporte = {
                                    pasaporte: pasaporte,
                                    clienteUID: clienteUID
                                }
                                const identificacionPernoctante = casaVitini.ui.vistas.miCasa.cuenta.reservas.UIComponentes.pernoctantePasaporteUI(metadatosPasaporte)
                                bloquePernoctantes.appendChild(identificacionPernoctante)


                                contenedorPernoctantesSinHabitacion.appendChild(bloquePernoctantes)
                                divPernoctantesSinAlojamiento.classList.remove("elementoOcultoInicialmente")


                            })

                            pernoctantesSinHabitacion.pernoctantesPool.map((pernoctante) => {

                                const pernoctanteUID = pernoctante["pernoctanteUID"]
                                const clienteUID = pernoctante["clientePoolUID"]
                                const nombreCompleto = pernoctante["nombreCompleto"]
                                const pasaporte = pernoctante["pasaporte"]

                                const metadatosPernoctanteUI = {
                                    tipoPernoctante: "clientePool",
                                    clienteUID: clienteUID,
                                    pernoctanteUID: pernoctanteUID,
                                    estadoAlojamiento: "noAlojado"
                                }

                                const bloquePernoctantes = casaVitini.ui.vistas.miCasa.cuenta.reservas.UIComponentes.pernoctanteUI(metadatosPernoctanteUI)
                                const metadatosNombreUI = {
                                    nombreCompleto: nombreCompleto,
                                    clienteUID: clienteUID
                                }
                                const nombrePernoctante = casaVitini.ui.vistas.miCasa.cuenta.reservas.UIComponentes.pernoctanteNombreUI(metadatosNombreUI)
                                bloquePernoctantes.appendChild(nombrePernoctante)

                                const metadatosPasaporte = {
                                    pasaporte: pasaporte,
                                    clienteUID: clienteUID
                                }
                                const identificacionPernoctante = casaVitini.ui.vistas.miCasa.cuenta.reservas.UIComponentes.pernoctantePasaporteUI(metadatosPasaporte)
                                bloquePernoctantes.appendChild(identificacionPernoctante)

                                contenedorPernoctantesSinHabitacion.appendChild(bloquePernoctantes)
                                divPernoctantesSinAlojamiento.classList.remove("elementoOcultoInicialmente")

                            })
                            return marcoAlojamiento
                        },
                        UIComponentes: {
                            "apatamentoUI": (metadatos) => {
                                let apartamento = document.createElement("div")
                                apartamento.classList.add("adminitracionReservasDetallesBloqueApartamento")
                                apartamento.setAttribute("apartamento", metadatos.apartamentoIDV)
                                apartamento.setAttribute("apartamentoUID", metadatos.apartamentoUID)
                                apartamento.setAttribute("apartamentoUI", metadatos.apartamentoUI)

                                return apartamento
                            },
                            "apartamentoTituloUI": (metadatos) => {

                                let apartamentoTitulo = document.createElement("div")
                                apartamentoTitulo.classList.add("administracionReservasDetallesTituloApartamento")
                                apartamentoTitulo.setAttribute("componente", "menuDesplegable")
                                apartamentoTitulo.innerText = metadatos.apartamentoUI
                                //apartamentoTitulo.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.transactor.opcionesApartamento)

                                return apartamentoTitulo
                            },
                            "habitacionUI": (metadatos) => {
                                let habitacionUI = document.createElement("div")
                                habitacionUI.classList.add("adminitracionReservasDetallesBloqueHabitacion")
                                habitacionUI.setAttribute("habitacionIDV", metadatos.habitacionIDV)
                                habitacionUI.setAttribute("habitacionUID", metadatos.habitacionUID)
                                habitacionUI.setAttribute("apartamento", metadatos.apartamentoIDV)
                                return habitacionUI
                            },
                            "habitacionTituloUI": (metadatos) => {
                                let habitacionTituloUI = document.createElement("div")
                                habitacionTituloUI.classList.add("adminitracionReservasDetallesTituloHabitacion")
                                habitacionTituloUI.setAttribute("componente", "menuDesplegable")
                                //habitacionTituloUI.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.transactor.opcionesHabitacion)
                                habitacionTituloUI.innerText = metadatos.habitacionUI
                                return habitacionTituloUI


                            },
                            "camaUI": (metadatos) => {
                                let camaUI = document.createElement("div")
                                camaUI.classList.add("adminitracionReservasDetallesTituloTipoCama")
                                camaUI.setAttribute("camaIDV", metadatos.camaIDV)
                                camaUI.setAttribute("camaUID", metadatos.camaUID)
                                camaUI.setAttribute("componente", "menuDesplegable")
                                camaUI.innerText = metadatos.camaUI
                                /*camaUI.addEventListener("click", (elementoCama) => {
                                    let metadatos_ = {
                                        "camaIDV": metadatos.camaIDV,
                                        "apartamentoIDV": metadatos.apartamentoIDV,
                                        "habitacionIDV": metadatos.habitacionIDV,
                                        "habitacionUID": metadatos.habitacionUID
                                    }
                                    casaVitini.administracion.reservas.detallesReserva.transactor.anadirCama(elementoCama, metadatos_)
                                })*/

                                return camaUI
                            },
                            "pernoctanteUI": (metadatos) => {
                                const pernoctanteUI = document.createElement("div")

                                if (metadatos.estadoAlojamiento === "alojado") {
                                    pernoctanteUI.classList.add("adminitracionReservasDetallesBloquePernoctantes")

                                }
                                if (metadatos.estadoAlojamiento === "noAlojado") {
                                    pernoctanteUI.classList.add("adminitracionReservasDetallesBloquePernoctantesNoAlojado")

                                }

                                pernoctanteUI.setAttribute("tipoCliente", metadatos.tipoPernoctante)
                                pernoctanteUI.setAttribute("estadoAlojamiento", metadatos.estadoAlojamiento)
                                pernoctanteUI.setAttribute("componente", "contenedorPernocanteHabitacion")
                                //pernoctanteUI.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.transactor.opcionesPernoctante)
                                pernoctanteUI.setAttribute("clienteUID", metadatos.clienteUID)
                                pernoctanteUI.setAttribute("componente", "menuDesplegable")
                                pernoctanteUI.setAttribute("pernoctanteUID", metadatos.pernoctanteUID)

                                const tipoPernoctanteUI = document.createElement("div")
                                tipoPernoctanteUI.classList.add("adminitracionReservasDetallesNombrePernoctante")
                                tipoPernoctanteUI.setAttribute("componente", "clientePoolInfoUI")
                                tipoPernoctanteUI.setAttribute("clienteUID", metadatos.clienteUID)
                                tipoPernoctanteUI.innerText = "(cliente pool)"
                                if (metadatos.tipoPernoctante === "clientePool") {
                                    pernoctanteUI.appendChild(tipoPernoctanteUI)
                                }

                                return pernoctanteUI

                            },
                            "pernoctanteNombreUI": (metadatos) => {


                                const pernoctanteNombreUI = document.createElement("div")
                                pernoctanteNombreUI.classList.add("adminitracionReservasDetallesNombrePernoctante")
                                pernoctanteNombreUI.setAttribute("componente", "nombreCompleto")
                                pernoctanteNombreUI.innerText = metadatos.nombreCompleto
                                return pernoctanteNombreUI

                            },
                            "pernoctantePasaporteUI": (metadatos) => {

                                let pernoctantePasaporteUI = document.createElement("div")
                                pernoctantePasaporteUI.classList.add("adminitracionReservasDetallesIdentificacionPernoctante")
                                pernoctantePasaporteUI.setAttribute("componente", "pasaporte")
                                pernoctantePasaporteUI.innerText = metadatos.pasaporte
                                return pernoctantePasaporteUI

                            },
                            "selectorCambioHabitacionUI": (metadatos) => {

                                let selectorCambioHabitacionUI = document.createElement("div")
                                selectorCambioHabitacionUI.classList.add("reservaDetallesCambioPernoctante")
                                selectorCambioHabitacionUI.setAttribute("habitacionDestino", metadatos.habitacionID)
                                selectorCambioHabitacionUI.setAttribute("pernoctanteUID", metadatos.pernoctanteUID)
                                selectorCambioHabitacionUI.setAttribute("clienteUID", metadatos.clienteUID)
                                selectorCambioHabitacionUI.setAttribute("tipoCliente", metadatos.tipoCliente)
                                selectorCambioHabitacionUI.setAttribute("reserva", metadatos.reserva)
                                selectorCambioHabitacionUI.setAttribute("componente", "botonMoverCliente")
                                selectorCambioHabitacionUI.innerText = "Cambiar aqui al pernoctante seleccionado"
                                //selectorCambioHabitacionUI.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.transactor.cambiarPernoctanteHabitacion)
                                return selectorCambioHabitacionUI
                            },
                            "buscadorRapidoUI": (termino) => {

                                const alturaDinamica = window.scrollY + termino.target.getBoundingClientRect().bottom;
                                const horizontalDinamico = termino.target.parentNode.offsetLeft;

                                const anchoDinamico = termino.target.getBoundingClientRect().width;
                                const clientePoolID = termino.target.parentElement.getAttribute("clientePoolID")

                                const selectorBuscadorRapido = [...document.querySelectorAll("[componente=buscadorRapidoCliente]")]
                                selectorBuscadorRapido.map((buscadorRapidoRenderizado) => {
                                    buscadorRapidoRenderizado.remove()
                                })
                                const campoVacio = termino.target.value.length
                                if (campoVacio === 0) {
                                    clearTimeout(casaVitini.componentes.temporizador);
                                    return;
                                }
                                const resultadosBusqueda = document.createElement("div")
                                resultadosBusqueda.setAttribute("componente", "buscadorRapidoCliente")
                                resultadosBusqueda.classList.add("administracionReservaDetallesBuscadorRapidoCliente")
                                resultadosBusqueda.style.top = (alturaDinamica + 4) + "px"
                                resultadosBusqueda.style.marginLeft = (horizontalDinamico + 4) + "px"
                                resultadosBusqueda.style.width = anchoDinamico + "px"
                                resultadosBusqueda.innerText = null
                                resultadosBusqueda.innerText = "Buscando…"
                                /*document.addEventListener("mousedown", (e) => {
                                    if (e.target.getAttribute("componente") === "elementoResultadosBuscadorRapido") {
                                        e.preventDefault()
                                    }
                                })*/
                                const seccion = document.querySelector("section:not([estado=obsoleto])")
                                seccion.appendChild(resultadosBusqueda)
                                clearTimeout(casaVitini.componentes.temporizador);
                                casaVitini.componentes.temporizador = setTimeout(() => {
                                    casaVitini.administracion.reservas.detallesReserva.transactor.buscadorRapido(termino)
                                }, 1500);
                            },
                            "anadirPernoctanteUI": (habitacion) => {
                                let habitacionUID = habitacion.target.getAttribute("habitacionUID_")
                                let origen = habitacion.target.getAttribute("origen")

                                let pernoctanteUID = habitacion.target.parentNode.parentNode.getAttribute("pernoctanteUID")

                                if (origen === "habitacion") {
                                    let selectorAnadirPernoctaneUIRendenrizado = document.querySelector(`[habitacionUI_anadirPernoctante="${habitacionUID}"]`)
                                    if (selectorAnadirPernoctaneUIRendenrizado) {
                                        return casaVitini.administracion.reservas.detallesReserva.transactor.ocultarMenusVolatiles()

                                    }
                                }
                                if (origen === "opcionesClientePool") {
                                    let selectorAnadirPernoctaneUIRendenrizado = document.querySelector(`[pernoctanteUID_opcionesClientePool="${pernoctanteUID}"]`)
                                    if (selectorAnadirPernoctaneUIRendenrizado) {
                                        return casaVitini.administracion.reservas.detallesReserva.transactor.ocultarMenusVolatiles()

                                    }
                                }




                                casaVitini.administracion.reservas.detallesReserva.transactor.ocultarMenusVolatiles()



                                let buscadorRapidoClienteUI = document.createElement("div")
                                buscadorRapidoClienteUI.classList.add("buscadorClienteRapidoInsertar")
                                if (origen === "habitacion") {
                                    buscadorRapidoClienteUI.setAttribute("habitacionUI_anadirPernoctante", habitacionUID)
                                }
                                if (origen === "opcionesClientePool") {
                                    buscadorRapidoClienteUI.setAttribute("pernoctanteUID_opcionesClientePool", pernoctanteUID)
                                }
                                buscadorRapidoClienteUI.setAttribute("componente", "anadirPernoctanteUI")

                                let campoBuscadorClienteRapido = document.createElement("input")
                                campoBuscadorClienteRapido.classList.add("administracionReservasDetallesCampoBuscadorCliente")
                                campoBuscadorClienteRapido.setAttribute("buscadorUID", "anadirClienteExitente")
                                campoBuscadorClienteRapido.placeholder = "Buscar cliente existente para anadirlo"
                                //campoBuscadorClienteRapido.addEventListener("input", casaVitini.administracion.reservas.detallesReserva.UIComponentes.buscadorRapidoUI)
                                /*campoBuscadorClienteRapido.addEventListener("blur", () => {
                                    document.removeEventListener("mousedown", (e) => {
                                        if (e.target.getAttribute("componente") === "elementoResultadosBuscadorRapido") {
                                            e.preventDefault()
                                        }
            
                                    })
                                    clearTimeout(casaVitini.componentes.temporizador);
                                    let selectorBuscadorRapido = [...document.querySelectorAll("[componente=buscadorRapidoCliente]")]
                                    selectorBuscadorRapido.map((buscadorRapidoRenderizado) => {
                                        buscadorRapidoRenderizado.remove()
                                    })
            
                                })*/
                                //campoBuscadorClienteRapido.addEventListener("focus", casaVitini.administracion.reservas.detallesReserva.UIComponentes.buscadorRapidoUI)

                                if (origen === "habitacion") {
                                    buscadorRapidoClienteUI.appendChild(campoBuscadorClienteRapido)
                                }


                                let nuevoClienteUI = document.createElement("div")
                                nuevoClienteUI.classList.add("nuevoClienteUI")

                                let info = document.createElement("p")
                                info.classList.add("nuevoClienteUIInfo")
                                info.innerText = "Crear nuevo pernoctante"

                                let campoNombre = document.createElement("input")
                                campoNombre.classList.add("administracionReservasDetallesCampoBuscadorCliente")
                                campoNombre.setAttribute("campo", "nombre")
                                campoNombre.setAttribute("formulario", "AnadirPernoctante")
                                campoNombre.placeholder = "Nombre (obligatiorio)"
                                nuevoClienteUI.appendChild(campoNombre)

                                let primerApellido = document.createElement("input")
                                primerApellido.classList.add("administracionReservasDetallesCampoBuscadorCliente")
                                primerApellido.setAttribute("campo", "primerApelliado")
                                primerApellido.setAttribute("formulario", "AnadirPernoctante")
                                primerApellido.placeholder = "Primer apellido"
                                nuevoClienteUI.appendChild(primerApellido)

                                let segundoApellido = document.createElement("input")
                                segundoApellido.classList.add("administracionReservasDetallesCampoBuscadorCliente")
                                segundoApellido.setAttribute("campo", "segundoApellido")
                                segundoApellido.setAttribute("formulario", "AnadirPernoctante")
                                segundoApellido.placeholder = "Segundo apellido"
                                nuevoClienteUI.appendChild(segundoApellido)

                                let pasaporte = document.createElement("input")
                                pasaporte.classList.add("administracionReservasDetallesCampoBuscadorCliente")
                                pasaporte.setAttribute("campo", "pasaporte")
                                pasaporte.setAttribute("formulario", "AnadirPernoctante")
                                pasaporte.placeholder = "Pasaporte (obligatorio)"
                                nuevoClienteUI.appendChild(pasaporte)

                                let telefono = document.createElement("input")
                                telefono.classList.add("administracionReservasDetallesCampoBuscadorCliente")
                                telefono.setAttribute("campo", "telefono")
                                telefono.setAttribute("formulario", "AnadirPernoctante")
                                telefono.placeholder = "Telefono"
                                nuevoClienteUI.appendChild(telefono)

                                let correoElecotronico = document.createElement("input")
                                correoElecotronico.classList.add("administracionReservasDetallesCampoBuscadorCliente")
                                correoElecotronico.setAttribute("campo", "correoElectronico")
                                correoElecotronico.setAttribute("formulario", "AnadirPernoctante")
                                correoElecotronico.placeholder = "Correo electronico"
                                nuevoClienteUI.appendChild(correoElecotronico)

                                let botonGuardarNuevoCliente = document.createElement("div")
                                botonGuardarNuevoCliente.classList.add("botonCancelarBuscadoRapidoInsertar")
                                botonGuardarNuevoCliente.innerText = "Guardar nuevo cliente y anadirlo a esta habitacion"
                                botonGuardarNuevoCliente.setAttribute("habitacionUID_botonAsociaNueoCliente", habitacionUID)

                                if (origen === "habitacion") {
                                    //botonGuardarNuevoCliente.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.transactor.guardarNuevoClienteYAnadirloComoPernoctnante)
                                }
                                if (origen === "opcionesClientePool") {
                                    //botonGuardarNuevoCliente.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.transactor.guardarNuevoClienteYSustituirloPorElClientePoolActual)
                                }
                                nuevoClienteUI.appendChild(botonGuardarNuevoCliente)

                                buscadorRapidoClienteUI.appendChild(nuevoClienteUI)

                                let botonCancelar = document.createElement("div")
                                botonCancelar.classList.add("botonCancelarBuscadoRapidoInsertar")
                                botonCancelar.innerText = "Cancelar"
                                if (origen === "habitacion") {
                                    /*botonCancelar.addEventListener("click", (e) => {
                                        e.target.parentNode.remove()
                                    })*/
                                }
                                if (origen === "opcionesClientePool") {
                                    /*botonCancelar.addEventListener("click", (e) => {
                                        e.stopPropagation()
                                        let selectorPernoctanteUIRedenrizado = e.target.parentNode.parentNode
                                        e.target.parentNode.remove()
                                        let tarjetearElementoComoObjeto = {
                                            "target": selectorPernoctanteUIRedenrizado
                                        }
                                        casaVitini.administracion.reservas.detallesReserva.transactor.opcionesPernoctante(tarjetearElementoComoObjeto)
            
                                    })*/

                                }
                                buscadorRapidoClienteUI.appendChild(botonCancelar)

                                if (origen === "habitacion") {
                                    let selectorHabitacion = document.querySelector(`[habitacionUID="${habitacionUID}"]`)
                                    selectorHabitacion.appendChild(buscadorRapidoClienteUI)
                                }
                                if (origen === "opcionesClientePool") {
                                    let selectorOpcionesClientePoolRenderizado = document.querySelector(`[pernoctanteUID="${pernoctanteUID}"] [componente=opcionesCliente]`)

                                    selectorOpcionesClientePoolRenderizado.remove()

                                    let selectorClientePoolRenderizado = document.querySelector(`[pernoctanteUID="${pernoctanteUID}"]`)
                                    selectorClientePoolRenderizado.appendChild(buscadorRapidoClienteUI)
                                }
                            },
                            "propuestaCambioPernoctanteUI": (propuesta) => {


                                let clienteUID = propuesta.target.getAttribute("clienteUID")
                                let clientePoolUID = propuesta.target.getAttribute("clientePoolUID")
                                let nombreUI = propuesta.target.getAttribute("nombreUI")
                                let primerApellidoUI = propuesta.target.getAttribute("primerApellidoUI")
                                let segundoApellidoUI = propuesta.target.getAttribute("segundoApellidoUI")
                                let pasaporte = propuesta.target.getAttribute("pasaporte")


                                let bloquePropuestaCambio = document.createElement("div")
                                bloquePropuestaCambio.classList.add("administracionReservaDetallesPropuedaCambioClientePool")
                                bloquePropuestaCambio.setAttribute("componente", "contenedorPropuestaCliente")

                                let tituloPropuestaCambio = document.createElement("p")
                                tituloPropuestaCambio.classList.add("administracionReservaDetallesPropuedaCambioClientePoolTitulo")
                                tituloPropuestaCambio.setAttribute("componente", "tituloCambioPropuesta")
                                tituloPropuestaCambio.innerText = "¿Confirmas la propuesta seleccionada?"
                                bloquePropuestaCambio.appendChild(tituloPropuestaCambio)

                                let nombreCompletoPropuesta = document.createElement("p")
                                nombreCompletoPropuesta.classList.add("administracionReservaDetallesPropuedaCambioClientePoolnombreCompletoPropuesta")
                                nombreCompletoPropuesta.setAttribute("componente", "nombrePropuesto")
                                nombreCompletoPropuesta.innerText = `${nombreUI} ${primerApellidoUI} ${segundoApellidoUI}`
                                bloquePropuestaCambio.appendChild(nombreCompletoPropuesta)

                                let pasaportePropuesta = document.createElement("p")
                                pasaportePropuesta.classList.add("administracionReservaDetallesPropuedaCambioClientePoolpasaportePropuesta")
                                pasaportePropuesta.innerText = pasaporte
                                bloquePropuestaCambio.appendChild(pasaportePropuesta)

                                let botonOpcionesCliente = document.createElement("p")
                                botonOpcionesCliente.classList.add("administracionReservaDetallesPropuedaCambioClientePoolbotonOpcione")
                                botonOpcionesCliente.setAttribute("componente", "botonConfirmarPropuesta")
                                botonOpcionesCliente.setAttribute("clienteUID_", clienteUID)
                                botonOpcionesCliente.setAttribute("clientePoolUID", clientePoolUID)
                                botonOpcionesCliente.setAttribute("nombreUI", nombreUI)
                                botonOpcionesCliente.setAttribute("primerApellidoUI", primerApellidoUI)
                                botonOpcionesCliente.setAttribute("segundoApellidoUI", segundoApellidoUI)
                                botonOpcionesCliente.setAttribute("pasaporte", pasaporte)

                                botonOpcionesCliente.innerText = "Confirmar"
                                //botonOpcionesCliente.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.transactor.confirmarPropuestaCambioCliente)
                                bloquePropuestaCambio.appendChild(botonOpcionesCliente)

                                botonOpcionesCliente = document.createElement("p")
                                botonOpcionesCliente.classList.add("administracionReservaDetallesPropuedaCambioClientePoolbotonOpcione")
                                botonOpcionesCliente.setAttribute("componente", "botonCancelarPropuesta")
                                botonOpcionesCliente.innerText = "Cancelar"
                                /*botonOpcionesCliente.addEventListener("click", () => {
            
                                    let selectorContenedoresPropuesta = [...document.querySelectorAll("[componente=contenedorPropuestaCliente]")]
                                    selectorContenedoresPropuesta.map((contenedorPropueda) => {
                                        contenedorPropueda.remove()
                                    })
                                    document.querySelector("[componente=buscadorRapido]").style.removeProperty("display")
                                    let selectorComponentesOcultables = [...document.querySelectorAll("[componente=botonOpcionClientePool]")]
                                    selectorComponentesOcultables.map((elementoOcultable) => {
                                        elementoOcultable.style.removeProperty("display")
                                    })
                                })*/
                                bloquePropuestaCambio.appendChild(botonOpcionesCliente)


                                document.querySelector("[componente=buscadorRapido]").style.display = "none"
                                let selectorComponentesOcultables = [...document.querySelectorAll("[componente=botonOpcionClientePool]")]
                                selectorComponentesOcultables.map((elementoOcultable) => {
                                    elementoOcultable.style.display = "none"
                                })
                                let selectorPasaporte = document.querySelector("[componente=opcionesCliente]")
                                let botonCerrar = document.querySelector("[componente=botonCerrarOpciones]")
                                selectorPasaporte.insertBefore(bloquePropuestaCambio, botonCerrar);







                            },
                            "propuestaAnadirPernoctanteUI": (propuesta) => {


                                let clienteUID = propuesta.target.getAttribute("clienteUID")
                                let clientePoolUID = propuesta.target.getAttribute("clientePoolUID")
                                let nombreUI = propuesta.target.getAttribute("nombreUI")
                                let primerApellidoUI = propuesta.target.getAttribute("primerApellidoUI")
                                let segundoApellidoUI = propuesta.target.getAttribute("segundoApellidoUI")
                                let pasaporte = propuesta.target.getAttribute("pasaporte")
                                let habitacionUID = propuesta.target.getAttribute("habitacionUID_resultadoBuscador")

                                let bloquePropuestaCambio = document.createElement("div")
                                bloquePropuestaCambio.classList.add("administracionReservaDetallesPropuedaCambioClientePool")
                                bloquePropuestaCambio.setAttribute("componente", "contenedorPropuestaCliente")

                                let tituloPropuestaCambio = document.createElement("p")
                                tituloPropuestaCambio.classList.add("administracionReservaDetallesPropuedaCambioClientePoolTitulo")
                                tituloPropuestaCambio.setAttribute("componente", "tituloCambioPropuesta")
                                tituloPropuestaCambio.innerText = "¿Confirmas anadir este cliente a esta habitacion?"
                                bloquePropuestaCambio.appendChild(tituloPropuestaCambio)

                                let nombreCompletoPropuesta = document.createElement("p")
                                nombreCompletoPropuesta.classList.add("administracionReservaDetallesPropuedaCambioClientePoolnombreCompletoPropuesta")
                                nombreCompletoPropuesta.setAttribute("componente", "nombrePropuesto")
                                nombreCompletoPropuesta.innerText = `${nombreUI} ${primerApellidoUI} ${segundoApellidoUI}`
                                bloquePropuestaCambio.appendChild(nombreCompletoPropuesta)

                                let pasaportePropuesta = document.createElement("p")
                                pasaportePropuesta.classList.add("administracionReservaDetallesPropuedaCambioClientePoolpasaportePropuesta")
                                pasaportePropuesta.innerText = pasaporte
                                bloquePropuestaCambio.appendChild(pasaportePropuesta)

                                let botonOpcionesCliente = document.createElement("p")
                                botonOpcionesCliente.classList.add("administracionReservaDetallesPropuedaCambioClientePoolbotonOpcione")
                                botonOpcionesCliente.setAttribute("componente", "botonConfirmarPropuesta")
                                botonOpcionesCliente.setAttribute("clienteUID_", clienteUID)
                                botonOpcionesCliente.setAttribute("clientePoolUID", clientePoolUID)
                                botonOpcionesCliente.setAttribute("nombreUI", nombreUI)
                                botonOpcionesCliente.setAttribute("habitacionUID_preguntaConfirmacion", habitacionUID)
                                botonOpcionesCliente.setAttribute("primerApellidoUI", primerApellidoUI)
                                botonOpcionesCliente.setAttribute("segundoApellidoUI", segundoApellidoUI)
                                botonOpcionesCliente.setAttribute("pasaporte", pasaporte)

                                botonOpcionesCliente.innerText = "Confirmar2"
                                // botonOpcionesCliente.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.transactor.anadirPernoctante)
                                bloquePropuestaCambio.appendChild(botonOpcionesCliente)

                                botonOpcionesCliente = document.createElement("p")
                                botonOpcionesCliente.classList.add("administracionReservaDetallesPropuedaCambioClientePoolbotonOpcione")
                                botonOpcionesCliente.setAttribute("componente", "botonCancelarPropuesta")
                                botonOpcionesCliente.setAttribute("habitacionUID_", habitacionUID)

                                botonOpcionesCliente.innerText = "Cancelar"
                                /*botonOpcionesCliente.addEventListener("click", (e) => {
            
            
                                    let selectorComponentesOcultables = [...document.querySelectorAll("[componente=anadirPernoctanteUI]")]
                                    selectorComponentesOcultables.map((elementoOcultable) => {
                                        elementoOcultable.remove()
                                    })
            
                                    casaVitini.administracion.reservas.detallesReserva.UIComponentes.anadirPernoctanteUI(e)
                                })*/
                                bloquePropuestaCambio.appendChild(botonOpcionesCliente)


                                //document.querySelector("[componente=buscadorRapido]").style.display = "none"
                                let selectorComponentesOcultables = [...document.querySelectorAll("[componente=botonOpcionClientePool]")]
                                selectorComponentesOcultables.map((elementoOcultable) => {
                                    elementoOcultable.style.display = "none"
                                })

                                let selectorBuscadorCliente = document.querySelector(`[habitacionUI_anadirPernoctante="${habitacionUID}"]`)
                                //selectorPasaporte.insertBefore(bloquePropuestaCambio, botonCerrar);
                                selectorBuscadorCliente.innerHTML = null
                                selectorBuscadorCliente.appendChild(bloquePropuestaCambio)






                            },
                            "propuestaEliminarPernoctanteUI": (propuesta) => {

                                const nombreCompleto = propuesta.target.getAttribute("nombreCompleto_")
                                const pasaporte = propuesta.target.getAttribute("pasaporte_")
                                const tipoEliminacion = propuesta.target.getAttribute("tipoEliminacion")
                                const pernoctanteUID = propuesta.target.getAttribute("pernoctanteUID_")
                                const clienteUID = propuesta.target.getAttribute("clienteUID_")
                                const habitacionUID = propuesta.target.parentNode.parentNode.getAttribute("habitacionUID")
                                let mensajeUI
                                if (tipoEliminacion === "habitacion") {
                                    mensajeUI = "Confirmas la eliminacion de este pernoctante de la habitacion pero no de la reserva. Este pernoctante pasara a la seccion de pernoctantes asociados a la reserva pero sin alojamiento asignado"
                                }
                                if (tipoEliminacion === "reserva") {
                                    mensajeUI = "Confirmar la eliminacion de este pernoctante de la reserva"
                                }
                                document.body.style.overflow = 'hidden';


                                const advertenciaInmersivaIU = document.createElement("div")
                                advertenciaInmersivaIU.setAttribute("class", "advertenciaInmersiva")
                                advertenciaInmersivaIU.setAttribute("componente", "advertenciaInmersiva")

                                const contenedorAdvertenciaInmersiva = document.createElement("div")
                                contenedorAdvertenciaInmersiva.classList.add("contenedorAdvertencaiInmersiva")

                                const contenidoAdvertenciaInmersiva = document.createElement("div")
                                contenidoAdvertenciaInmersiva.classList.add("contenidoAdvertenciaInmersiva")



                                const bloquePropuestaCambio = document.createElement("div")
                                bloquePropuestaCambio.classList.add("administracionReservaDetallesPropuedaCambioClientePool")
                                bloquePropuestaCambio.setAttribute("componente", "contenedorPropuestaCliente")

                                const tituloPropuestaCambio = document.createElement("p")
                                tituloPropuestaCambio.classList.add("administracionReservaDetallesPropuedaCambioClientePoolTitulo")
                                tituloPropuestaCambio.setAttribute("componente", "tituloCambioPropuesta")
                                tituloPropuestaCambio.innerText = mensajeUI
                                bloquePropuestaCambio.appendChild(tituloPropuestaCambio)

                                const nombreCompletoPropuesta = document.createElement("p")
                                nombreCompletoPropuesta.classList.add("administracionReservaDetallesPropuedaCambioClientePoolnombreCompletoPropuesta")
                                nombreCompletoPropuesta.setAttribute("componente", "nombrePropuesto")
                                nombreCompletoPropuesta.innerText = nombreCompleto
                                bloquePropuestaCambio.appendChild(nombreCompletoPropuesta)

                                const pasaportePropuesta = document.createElement("p")
                                pasaportePropuesta.classList.add("administracionReservaDetallesPropuedaCambioClientePoolpasaportePropuesta")
                                pasaportePropuesta.innerText = pasaporte
                                bloquePropuestaCambio.appendChild(pasaportePropuesta)

                                let botonOpcionesCliente = document.createElement("p")
                                botonOpcionesCliente.classList.add("administracionReservaDetallesPropuedaCambioClientePoolbotonOpcione")
                                botonOpcionesCliente.setAttribute("componente", "botonConfirmarPropuesta")
                                botonOpcionesCliente.setAttribute("pernoctanteUID_", pernoctanteUID)
                                let botonMenajeUI
                                if (tipoEliminacion === "habitacion") {
                                    botonMenajeUI = "Eliminar de la habitacion"
                                }
                                if (tipoEliminacion === "reserva") {
                                    botonMenajeUI = "Eliminar de la reserva"
                                }
                                botonOpcionesCliente.innerText = botonMenajeUI
                                //botonOpcionesCliente.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.transactor.eliminarPernoctante)
                                bloquePropuestaCambio.appendChild(botonOpcionesCliente)

                                botonOpcionesCliente = document.createElement("p")
                                botonOpcionesCliente.classList.add("administracionReservaDetallesPropuedaCambioClientePoolbotonOpcione")
                                botonOpcionesCliente.setAttribute("componente", "botonCancelarPropuesta")
                                botonOpcionesCliente.setAttribute("habitacionUID_", habitacionUID)

                                botonOpcionesCliente.innerText = "Cancelar"
                                //botonOpcionesCliente.addEventListener("click", casaVitini.componentes.limpiarAdvertenciasInmersivas)
                                bloquePropuestaCambio.appendChild(botonOpcionesCliente)

                                //document.querySelector("[componente=buscadorRapido]").style.display = "none"
                                const selectorComponentesOcultables = [...document.querySelectorAll("[componente=contenedorPropuestaCliente]")]
                                selectorComponentesOcultables.map((elementoOcultable) => {
                                    elementoOcultable.style.display = "none"
                                })

                                const selectorOpcionesPernoctanteRenderizadas = document.querySelector(`[pernoctanteUID="${pernoctanteUID}"] [componente=opcionesCliente]`)
                                selectorOpcionesPernoctanteRenderizadas?.remove()

                                contenidoAdvertenciaInmersiva.appendChild(bloquePropuestaCambio)
                                contenedorAdvertenciaInmersiva.appendChild(contenidoAdvertenciaInmersiva)
                                advertenciaInmersivaIU.appendChild(contenedorAdvertenciaInmersiva)

                                document.body.appendChild(advertenciaInmersivaIU)





                            },
                            "propuestaEliminarHabitacionUI": (habitacion) => {


                                let opcionPernoctantes = habitacion.target.getAttribute("opcionPernoctantes")
                                let habitacionUID = habitacion.target.getAttribute("habitacionUID_")
                                let habitacionUI = habitacion.target.getAttribute("habitacionUI_")
                                let destino = habitacion.target.parentNode
                                let mensajeUI
                                if (opcionPernoctantes === "conservar") {
                                    mensajeUI = `¿Confirmas eliminar la ${habitacionUI} pero conservar los pernoctantes de esta habitacion en la reserva?`
                                }
                                if (opcionPernoctantes === "eliminar") {
                                    mensajeUI = `¿Confirmas eliminar la ${habitacionUI} junto con los pernoctantes que contiene de la reserva?`
                                }

                                let bloquePropuestaCambio = document.createElement("div")
                                bloquePropuestaCambio.classList.add("administracionReservaDetallesPropuedaCambioClientePool")
                                bloquePropuestaCambio.setAttribute("componente", "contenedorPropuestaCliente")

                                let tituloPropuestaCambio = document.createElement("p")
                                tituloPropuestaCambio.classList.add("administracionReservaDetallesPropuedaCambioClientePoolTitulo")
                                tituloPropuestaCambio.setAttribute("componente", "tituloCambioPropuesta")
                                tituloPropuestaCambio.innerText = mensajeUI
                                bloquePropuestaCambio.appendChild(tituloPropuestaCambio)



                                let botonOpcionesCliente = document.createElement("p")
                                botonOpcionesCliente.classList.add("administracionReservaDetallesPropuedaCambioClientePoolbotonOpcione")
                                botonOpcionesCliente.setAttribute("componente", "botonConfirmarPropuesta")
                                botonOpcionesCliente.setAttribute("habitacionUID_", habitacionUID)
                                botonOpcionesCliente.setAttribute("opcionPernoctantes", opcionPernoctantes)
                                let botonMenajeUI
                                if (opcionPernoctantes === "eliminar") {
                                    botonMenajeUI = `Eliminar la ${habitacionUI} de la reserva y sus pernoctantes`
                                }
                                if (opcionPernoctantes === "conservar") {
                                    botonMenajeUI = `Eliminar la ${habitacionUI} de la reserva pero conservar a sus pernoctantes en la reserva`
                                }
                                botonOpcionesCliente.innerText = botonMenajeUI
                                //botonOpcionesCliente.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.transactor.eliminarHabitacion)
                                bloquePropuestaCambio.appendChild(botonOpcionesCliente)

                                botonOpcionesCliente = document.createElement("p")
                                botonOpcionesCliente.classList.add("administracionReservaDetallesPropuedaCambioClientePoolbotonOpcione")
                                botonOpcionesCliente.setAttribute("componente", "botonCancelarPropuesta")
                                botonOpcionesCliente.setAttribute("habitacionUID_", habitacionUID)

                                botonOpcionesCliente.innerText = "Cancelar"
                                /*botonOpcionesCliente.addEventListener("click", (e) => {
                                    e.target.parentNode.remove()
                                })*/
                                bloquePropuestaCambio.appendChild(botonOpcionesCliente)

                                let selectorComponentesOcultables = [...document.querySelectorAll("[componente=contenedorPropuestaCliente]")]
                                selectorComponentesOcultables.map((elementoOcultable) => {
                                    elementoOcultable.style.display = "none"
                                })
                                destino.innerHTML = null
                                destino.appendChild(bloquePropuestaCambio)







                            },
                            "propuestaEliminarApartamentoUI": (apartamento) => {
                                // hacer propesta de eliminar apartamento


                                let apartamentoUID = apartamento.target.getAttribute("apartamentoUID_")
                                let apartamentoUI = apartamento.target.getAttribute("apartamentoUI_")
                                let tipoBloqueo = apartamento.target.getAttribute("tipoBloqueo")
                                let destino = apartamento.target.parentNode

                                let mensajeUI
                                if (tipoBloqueo === "sinBloqueo") {
                                    mensajeUI = `¿Confirmas eliminar el ${apartamentoUI} y liberarlo para que este disponible para reservar publicamente? Los pernoctantes de este apartamento no se eliminaran de la reserva`
                                }
                                if (tipoBloqueo === "permanente") {
                                    mensajeUI = `¿Confirmas eliminar el ${apartamentoUI} y bloquearlo indefinidamente? (Hay desbloquearlo manualmente) Los pernoctantes de este apartamento no se eliminaran de la reserva`
                                }
                                if (tipoBloqueo === "rangoTemporal") {
                                    mensajeUI = `¿Confirmas eliminar el ${apartamentoUI} y bloquearlo durante el mismo rango de fechas que esta reserva? Los pernoctantes de este apartamento no se eliminaran de la reserva`
                                }
                                let bloquePropuestaCambio = document.createElement("div")
                                bloquePropuestaCambio.classList.add("administracionReservaDetallesPropuedaCambioClientePool")
                                bloquePropuestaCambio.setAttribute("componente", "contenedorPropuestaCliente")

                                let tituloPropuestaCambio = document.createElement("p")
                                tituloPropuestaCambio.classList.add("administracionReservaDetallesPropuedaCambioClientePoolTitulo")
                                tituloPropuestaCambio.setAttribute("componente", "tituloCambioPropuesta")
                                tituloPropuestaCambio.innerText = mensajeUI
                                bloquePropuestaCambio.appendChild(tituloPropuestaCambio)


                                let botonOpcionesCliente = document.createElement("p")
                                botonOpcionesCliente.classList.add("administracionReservaDetallesPropuedaCambioClientePoolbotonOpcione")
                                botonOpcionesCliente.setAttribute("componente", "botonConfirmarPropuesta")
                                botonOpcionesCliente.setAttribute("apartamentoUID_", apartamentoUID)
                                botonOpcionesCliente.setAttribute("tipoBloqueo", tipoBloqueo)
                                let botonMenajeUI
                                if (tipoBloqueo === "permanente") {

                                    botonMenajeUI = `Eliminar el ${apartamentoUI} de la reserva y bloquearlo indefinidamente`
                                }
                                if (tipoBloqueo === "sinBloqueo") {
                                    botonMenajeUI = `Eliminar la ${apartamentoUI} de la reserva y liberarlo para que se pueda reservas`
                                }
                                if (tipoBloqueo === "rangoTemporal") {
                                    botonMenajeUI = `Eliminar la ${apartamentoUI} de la reserva y bloquearlo durante el mismo rango que la reserva`
                                }
                                botonOpcionesCliente.innerText = botonMenajeUI
                                //botonOpcionesCliente.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.transactor.eliminarApartamento)
                                bloquePropuestaCambio.appendChild(botonOpcionesCliente)

                                botonOpcionesCliente = document.createElement("p")
                                botonOpcionesCliente.classList.add("administracionReservaDetallesPropuedaCambioClientePoolbotonOpcione")
                                botonOpcionesCliente.setAttribute("componente", "botonCancelarPropuesta")
                                botonOpcionesCliente.setAttribute("apartamentoUID_", apartamentoUID)

                                botonOpcionesCliente.innerText = "Cancelar"
                                /*botonOpcionesCliente.addEventListener("click", (e) => {
                                    e.target.parentNode.remove()
                                })*/
                                bloquePropuestaCambio.appendChild(botonOpcionesCliente)

                                let selectorComponentesOcultables = [...document.querySelectorAll("[componente=contenedorPropuestaCliente]")]
                                selectorComponentesOcultables.map((elementoOcultable) => {
                                    elementoOcultable.style.display = "none"
                                })
                                destino.innerHTML = null
                                destino.appendChild(bloquePropuestaCambio)



                            }
                        },
                        desgloseFinancieroUI: (desgloseFinanciero) => {

                            const totalesPorNoche = desgloseFinanciero.totalesPorNoche
                            const totalesPorApartamento = desgloseFinanciero.totalesPorApartamento
                            const ofertas = desgloseFinanciero.ofertas
                            const impuestos = desgloseFinanciero.impuestos
                            const totales = desgloseFinanciero.totales

                            const contenedorEspacioTotales = document.createElement("div")
                            contenedorEspacioTotales.classList.add("miCasa_reservas_detallesReservas_contenedorTotales")

                            const desgloseTotales = {
                                precioNetoApartamentoDia: totalesPorApartamento,
                                detallePorNoches: totalesPorNoche,
                                totales: totales,
                                impuestos: impuestos,
                                ofertasAplicadas: ofertas,
                                destino: "[componente=contenedorDesgloseTotal]"
                            }
                            casaVitini.componentes.ui.totales(desgloseTotales)

                            return contenedorEspacioTotales



                        },
                        mostrarReservasResueltas: async (transaccion) => {
                            const origen = transaccion.origen
                            delete transaccion.origen
                            const tipoConstruccionGrid = transaccion.tipoConstruccionGrid
                            delete transaccion.tipoConstruccionGrid
                            const granuladoURL = casaVitini.componentes.granuladorURL()


                            const paginaTipo = transaccion.paginaTipo
                            delete transaccion.paginaTipo

                            const respuestaServidor = await casaVitini.componentes.servidor(transaccion)
                            if (respuestaServidor?.error) {
                                const espacioClientes = document.querySelector("[componente=espacioMisReservas]")
                                document.querySelector("[gridUID=gridMisReservas]")?.remove()
                                document.querySelector("[componente=estadoBusqueda]")?.remove()

                                const estadoBusquedaUI = document.createElement("div")
                                estadoBusquedaUI.classList.add("buscadorClientesEstadoBusqueda")
                                estadoBusquedaUI.setAttribute("componente", "estadoBusqueda")
                                estadoBusquedaUI.innerText = respuestaServidor.error
                                espacioClientes.appendChild(estadoBusquedaUI)
                                return
                                //return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
                            }

                            if (respuestaServidor.totalClientes === 0) {
                                const espacioClientes = document.querySelector("[componente=espacioMisReservas]")
                                document.querySelector("[gridUID=gridMisReservas]")?.remove()
                                document.querySelector("[componente=estadoBusqueda]")?.remove()

                                const estadoBusquedaUI = document.createElement("div")
                                estadoBusquedaUI.classList.add("buscadorClientesEstadoBusqueda")
                                estadoBusquedaUI.setAttribute("componente", "estadoBusqueda")
                                estadoBusquedaUI.innerText = "No se han encontrado clientes"
                                espacioClientes.appendChild(estadoBusquedaUI)
                                return
                            }
                            document.querySelector("[componente=estadoBusqueda]")?.remove()

                            const misReservas = respuestaServidor.reservas

                            const paginasTotales = respuestaServidor.paginasTotales
                            const paginaActual = respuestaServidor.pagina
                            const nombreColumna = respuestaServidor.nombreColumna
                            const sentidoColumna = respuestaServidor.sentidoColumna
                            /*
                        {
                        "reserva": 1048,
                        "entrada": "06/10/2023",
                        "salida": "15/02/2024",
                        "estadoReserva": "confirmada",
                        "estadoPago": "noPagado",
                        "creacion": null
                        },
                            */


                            const columnasGrid = [
                                {
                                    columnaUI: "Reserva",
                                    columnaIDV: "reserva",
                                    columnaClase: "idColumna"
                                },
                                {
                                    columnaUI: "Fecha de entrada",
                                    columnaIDV: "entrada",
                                    columnaClase: "entradaColumna"
                                },
                                {
                                    columnaUI: "Fecha de salida",
                                    columnaIDV: "salida",
                                    columnaClase: "salidaColuma"
                                },
                                {
                                    columnaUI: "Estado de la reserva",
                                    columnaIDV: "estadoReserva",
                                    columnaClase: "estadoColumna"
                                },
                                {
                                    columnaUI: "Estado del pago",
                                    columnaIDV: "estadoPago",
                                    columnaClase: "pagoColumna"
                                },
                                {
                                    columnaUI: "Fecha de la reserva",
                                    columnaIDV: "creacion",
                                    columnaClase: "pagoColumna"
                                },
                            ]


                            const parametrosFinales = {
                            }
                            if (paginaActual > 1 && paginasTotales > 1) {
                                parametrosFinales.pagina = paginaActual
                            }
                            if (nombreColumna) {
                                parametrosFinales.pagina = paginaActual
                                parametrosFinales.nombre_columna = nombreColumna.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
                                parametrosFinales.sentido_columna = sentidoColumna

                            }

                            const estructuraParametrosFinales = []
                            for (const [parametroFinal, valorFinal] of Object.entries(parametrosFinales)) {
                                const estructura = `${parametroFinal}:${valorFinal}`
                                estructuraParametrosFinales.push(estructura)
                            }
                            let parametrosURLFInal = ""
                            if (estructuraParametrosFinales.length > 0) {
                                parametrosURLFInal = "/" + estructuraParametrosFinales.join("/")
                            }
                            const constructorURLFinal = granuladoURL.directoriosFusion + parametrosURLFInal

                            const metadatosGrid = {
                                filas: misReservas,
                                sentidoColumna: sentidoColumna,
                                nombreColumna: nombreColumna,
                                tipoConstruccionGrid: tipoConstruccionGrid,
                                //buscar: buscar,
                                pagina: paginaActual,
                                destino: "[componente=espacioMisReservas]",
                                columnasGrid: columnasGrid,
                                gridUID: "gridMisReservas",
                                numeroColumnas: 6,
                                metodoColumna: "casaVitini.ui.vistas.miCasa.cuenta.reservas.ordenarPorColumna",
                                metodoFila: "casaVitini.ui.vistas.miCasa.cuenta.reservas.resolverFila",
                                mascaraHref: {
                                    urlStatica: "/micasa/reservas/",
                                    parametro: "reserva"
                                },
                                mascaraURL: constructorURLFinal
                            }

                            casaVitini.componentes.ui.grid(metadatosGrid)
                            const metadatosPaginador = {
                                paginaActual: paginaActual,
                                paginasTotales: paginasTotales,
                                destino: "[componente=espacioMisReservas]",
                                metodoBoton: "casaVitini.ui.vistas.miCasa.cuenta.reservas.cambiarPagina",
                                gridUID: "gridMisReservas",
                                granuladoURL: {
                                    parametros: parametrosFinales,
                                    directoriosFusion: granuladoURL.directoriosFusion
                                }
                            }

                            casaVitini.componentes.ui.paginador(metadatosPaginador)




                            transaccion.tipoConstruccionGrid = "soloLista"
                            const titulo = "ADminstar reservas"
                            const estado = {
                                zona: constructorURLFinal,
                                EstadoInternoZona: "estado",
                                tipoCambio: "parcial",
                                conpontenteExistente: "zonaNavegacionPaginadaClientes",
                                funcionPersonalizada: "casaVitini.ui.vistar.miCasa.reservas.mostrarReservasResuelstas",
                                datosPaginacion: transaccion
                            }
                            if (origen === "url" || origen === "botonMostrarClientes") {
                                window.history.replaceState(estado, titulo, constructorURLFinal);
                            }
                            if ((origen === "botonNumeroPagina" && paginaTipo === "otra") || origen === "tituloColumna") {
                                window.history.pushState(estado, titulo, constructorURLFinal);
                            }
                            if (origen === "botonNumeroPagina" && paginaTipo === "actual") {
                                window.history.replaceState(estado, titulo, constructorURLFinal);
                            }
                        },
                        guardarCambios: async () => {

                            const nuevoIDX = document.querySelector("[campo=nuevoIDX]")
                            const datosParaActualizar = {
                                zona: "miCasa/actualizarIDX",
                                nuevoIDX: nuevoIDX.value
                            }

                            const respuestaServidor = await casaVitini.componentes.servidor(datosParaActualizar)

                            if (respuestaServidor?.error) {
                                return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
                            }

                            if (respuestaServidor?.ok) {
                                nuevoIDX.value = null
                                casaVitini.componentes.controladorEstadoIDX()

                            }

                        },
                        ordenarPorColumna: async (columna) => {

                            const nombreColumna = columna.target.closest("[componenteGrid=celdaTituloColumna]").getAttribute("nombreColumna")

                            const selectorColumnasentido = columna.target.closest("[componenteGrid=celdaTituloColumna]").getAttribute("sentidoColumna")
                            const numeroPagina = columna.target.closest("[gridUID]").getAttribute("numeroPagina")
                            const terminoBusqueda = columna.target.closest("[gridUID]").getAttribute("terminoBusqueda")
                            let sentidoColumna

                            const transaccion = {
                                zona: "miCasa/misReservas/listarMisReservas",
                                pagina: Number(numeroPagina),
                                tipoConstruccionGrid: "soloLista",
                                origen: "tituloColumna"
                            }
                            if (selectorColumnasentido === "ascendente") {
                                transaccion.sentidoColumna = "descendente"
                                transaccion.nombreColumna = nombreColumna
                            }
                            if (!selectorColumnasentido) {
                                transaccion.sentidoColumna = "ascendente"
                                transaccion.nombreColumna = nombreColumna
                            }


                            casaVitini.ui.vistas.miCasa.cuenta.reservas.mostrarReservasResueltas(transaccion)
                        },
                        cambiarPagina: async (entradaNumeroPagina) => {

                            entradaNumeroPagina.preventDefault()
                            entradaNumeroPagina.preventDefault()

                            const gridUID = entradaNumeroPagina.target.closest("[gridUID_enlazado]").getAttribute("gridUID_enlazado")
                            const gridEnlazado = document.querySelector(`[gridUID=${gridUID}]`)

                            const tipoBoton = entradaNumeroPagina.target.getAttribute("componenteID")
                            const nombreColumna = gridEnlazado.getAttribute("nombreColumnaSeleccionada")
                            const sentidoColumna = gridEnlazado.getAttribute("sentidoColumna")
                            const terminoBusqueda = gridEnlazado.getAttribute("terminoBusqueda")
                            const paginaActual = Number(gridEnlazado.getAttribute("numeroPagina"))
                            const paginaTipo = cambiarPagina.paginaTipo


                            const transacccion = {
                                nombreColumna: nombreColumna,
                                sentidoColumna: sentidoColumna,
                                paginaTipo: paginaTipo,

                            }

                            if (tipoBoton === "numeroPagina") {
                                const numeroPagina = entradaNumeroPagina.target.getAttribute("numeroPagina")
                                transacccion.pagina = Number(numeroPagina)
                                transacccion.origen = "botonNumeroPagina"
                            }
                            if (tipoBoton === "botonAdelantePaginacion") {
                                const posicionRelativa = document.querySelector("[paginaTipo=actual]").getAttribute("posicionRelativa")
                                let mueveNavegadorHaciaAdelante = "Desactivado";
                                if (Number(posicionRelativa) === 10) {
                                    mueveNavegadorHaciaAdelante = "Activado"
                                }
                                transacccion.pagina = paginaActual + 1

                                transacccion.origen = "botonNumeroPagina"
                                transacccion.moverHaciaAdelanteNavegacion = mueveNavegadorHaciaAdelante
                                transacccion.sentidoNavegacion = "Adelante"
                            }
                            if (tipoBoton === "botonAtrasPaginacion") {
                                const posicionRelativa = document.querySelector("[paginaTipo=actual]").getAttribute("posicionRelativa")
                                let mueveNavegadorHaciaAtras = "Desactivado";
                                if (Number(posicionRelativa) === 1) {
                                    mueveNavegadorHaciaAtras = "Activado"
                                }
                                transacccion.pagina = paginaActual - 1
                                transacccion.origen = "botonNumeroPagina"
                                transacccion.mueveNavegadorHaciaAtras = mueveNavegadorHaciaAtras
                                transacccion.sentidoNavegacion = "Atras"
                            }
                            transacccion.tipoConstruccionGrid = "soloLista"
                            transacccion.zona = "miCasa/misReservas/listarMisReservas"


                            return casaVitini.ui.vistas.miCasa.cuenta.reservas.mostrarReservasResueltas(transacccion)


                        },
                        resolverFila: (transaccion) => {
                            transaccion.preventDefault()
                            transaccion.stopPropagation()
                            const href = transaccion.target.closest("[href]").getAttribute("href")
                            const navegacion = {
                                vista: href,
                                tipoOrigen: "menuNavegador"

                            }
                            return casaVitini.componentes.controladorVista(navegacion)
                        },
                    },
                    configuracionZonaHoraria: {
                        arranque: async () => { }
                    }

                },
                crearCuenta: {
                    portada: {
                        arranque: () => {
                            document.body.removeAttribute("style")
                            const boton = document.querySelector("[componente=botonCrearNuevaCuenta]")
                            boton.addEventListener("click", casaVitini.ui.vistas.miCasa.crearCuenta.portada.transactor)
                        },
                        transactor: async () => {
                            const usuarioIDX = document.querySelector("[campo=usuarioIDX]").value
                            const email = document.querySelector("[campo=email]").value
                            const claveNueva = document.querySelector("[campo=claveNueva]").value
                            const claveConfirmada = document.querySelector("[campo=claveConfirmada]").value
                            const instanciaUID = casaVitini.componentes.codigoFechaInstancia()
                            const mensaje = "Creando tu VitiniID..."
                            const datosPantallaSuperpuesta = {
                                instanciaUID: instanciaUID,
                                mensaje: mensaje
                            }
                            casaVitini.ui.vistas.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                            const transaccion = {
                                zona: "miCasa/crearCuentaDesdeMiCasa",
                                usuarioIDX: usuarioIDX,
                                email: email,
                                claveNueva: claveNueva,
                                claveConfirmada: claveConfirmada
                            }

                            const respuestaServidor = await casaVitini.componentes.servidor(transaccion)
                            const pantallaDeCargaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                            if (respuestaServidor?.error && pantallaDeCargaRenderizada) {
                                pantallaDeCargaRenderizada.remove()
                                return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok && pantallaDeCargaRenderizada) {
                                const vista = {
                                    vista: "/micasa",
                                    tipoOrigen: "menuNavegador"
                                }
                                await casaVitini.componentes.controladorVista(vista)

                                const informacion = "Se ha creado la cuenta corractamente. Bienvenido a Casa Vitini."
                                casaVitini.ui.vistas.advertenciaInmersiva(informacion)
                            }
                        },
                    }
                },
                cerrarSession: async () => {
                    const selectorBotonCerrarSession = document.querySelector("[componente=botonCerrarSession]")
                    selectorBotonCerrarSession.innerText = "Cerrando session..."
                    const IDX = await casaVitini.IDX.cerrarSession()

                    if (!IDX) {
                        selectorBotonCerrarSession.innerText = "Cerra session"
                    }
                    if (IDX?.IDX === "desconectado") {
                        const vista = {
                            vista: "/micasa",
                            tipoOrigen: "menuNavegador"
                        }
                        casaVitini.componentes.controladorVista(vista)
                    }

                },
                componentes: {
                    bannerIDX: (metadatos) => {

                        const usuarioIDX = metadatos.usuarioIDX
                        const rol = metadatos.rol
                        const rolUITexto = rol.substring(0, 1).toUpperCase() + rol.substring(1);

                        const contenedorUsuarioIDX = document.createElement("div")
                        contenedorUsuarioIDX.classList.add("detallesUsuario_contenedorUsuarioIDX")
                        contenedorUsuarioIDX.setAttribute("componente", "contenedorUsuarioUX")

                        const esferaUsuario = document.createElement("div")
                        esferaUsuario.classList.add("detallesUsuario_esferaUsuario")
                        esferaUsuario.setAttribute("componente", "esferaUsuario")
                        contenedorUsuarioIDX.appendChild(esferaUsuario)

                        const contenedorDatosGlobales = document.createElement("div")
                        contenedorDatosGlobales.classList.add("detallesUsuario_contenedorDatosGlobales")
                        contenedorDatosGlobales.setAttribute("componente", "contenedorDatosGlobales")

                        const usuarioIDXUI = document.createElement("div")
                        usuarioIDXUI.classList.add("detallesUsuario_usuarioUI")
                        usuarioIDXUI.setAttribute("usuarioIDX", usuarioIDX)
                        usuarioIDXUI.innerText = usuarioIDX
                        contenedorDatosGlobales.appendChild(usuarioIDXUI)

                        const rolUI = document.createElement("div")
                        rolUI.classList.add("detallesUsuario_rolUI")
                        rolUI.setAttribute("componente", "rolUI")
                        rolUI.innerText = rolUITexto
                        contenedorDatosGlobales.appendChild(rolUI)

                        contenedorUsuarioIDX.appendChild(contenedorDatosGlobales)
                        return contenedorUsuarioIDX
                    }

                },
                controladorCampos: () => {
                    const campoUsuario = document.querySelector("[componente=campoID][IDX=usuario]")
                    const campoClave = document.querySelector("[componente=campoID][IDX=clave]")
                    const contenedorBotones = document.querySelector("[componente=contenedorBotones]")




                    if (campoUsuario.value.length === 0 || campoClave.value.length === 0) {
                        contenedorBotones.removeAttribute("style")
                    } else {
                        contenedorBotones.style.pointerEvents = "all"
                        contenedorBotones.style.visibility = "visible"
                    }
                },
                recuperarCuenta: {
                    arranque: async () => {
                        document.body.removeAttribute("style")

                        const granuladoURL = casaVitini.componentes.granuladorURL()
                        const comandoInicial = granuladoURL.directorios[granuladoURL.directorios.length - 1]
                        if (comandoInicial === "recuperar_cuenta") {
                            return casaVitini.ui.vistas.miCasa.recuperarCuenta.ui.formularioEnviarEmail()
                        }
                        const comandoSecundario = granuladoURL.directorios[granuladoURL.directorios.length - 2]
                        if (comandoSecundario === "recuperar_cuenta") {
                            const transacccion = {
                                zona: "miCasa/recuperarCuenta/validarCodigo",
                                codigo: comandoInicial
                            }
                            const respuestaServidor = await casaVitini.componentes.servidor(transacccion)

                            if (respuestaServidor?.error) {
                                return casaVitini.ui.vistas.miCasa.recuperarCuenta.ui.codigoErroneo()
                            }
                            if (respuestaServidor?.ok) {
                                return casaVitini.ui.vistas.miCasa.recuperarCuenta.ui.restablecerClave(comandoInicial)
                            }
                        }

                    },
                    ui: {
                        formularioEnviarEmail: () => {

                            // Crear elementos
                            const titulo = document.createElement('p');
                            titulo.className = 'titulo';
                            titulo.textContent = 'Recuperar mi cuenta de Casa Vitini';

                            const marcoElasticoRelativo = document.createElement('div');
                            marcoElasticoRelativo.className = 'marcoElasticoRelativo';

                            const marcoElastico = document.createElement('div');
                            marcoElastico.className = 'marcoElastico';

                            const contenedorCrearCuenta = document.createElement('div');
                            contenedorCrearCuenta.className = 'miCasa_crearCuenta_contenedorCrearCuenta';

                            const texto = document.createElement('p');
                            texto.className = 'texto paddgin6';
                            texto.textContent = 'Si olvidaste tu contraseña o por el contrario creaste tu VitiniID pero no lo verificaste con tu cuenta de correo electrónico, escribe la dirección de correo electrónico con la que creaste tu VitniniID y te enviaremos un mensaje a tu buzón con un enlace temporal con el que podrás restablecer tu contraseña o con un enlace de verificación para que pueda verificar tu cuenta.';

                            const input = document.createElement('input');
                            input.type = 'text';
                            input.className = 'miCasa_crearCuenta_campo';
                            input.setAttribute('campo', 'email');
                            input.placeholder = 'Escribe tu direcíon de correo electroníco';

                            const contenedorBotones = document.createElement('div');
                            contenedorBotones.className = 'miCuenta_cambioClave_contenedorBotones';

                            const botonEnviar = document.createElement('div');
                            botonEnviar.className = 'miCuenta_cambiarClave_botonV1';
                            botonEnviar.setAttribute('componente', 'botonCrearNuevaCuenta');
                            botonEnviar.addEventListener("click", () => {
                                casaVitini.ui.vistas.miCasa.recuperarCuenta.transactores.enviarEnlaceRecuperacion()
                            })
                            botonEnviar.textContent = 'Enviar mensaje de recuperación a mi buzón';

                            // Adjuntar elementos al DOM
                            const secction = document.querySelector("main")
                            secction.appendChild(titulo);

                            contenedorCrearCuenta.appendChild(texto);
                            contenedorCrearCuenta.appendChild(input);
                            contenedorBotones.appendChild(botonEnviar);

                            contenedorCrearCuenta.appendChild(contenedorBotones);
                            marcoElastico.appendChild(contenedorCrearCuenta);
                            marcoElasticoRelativo.appendChild(marcoElastico);
                            secction.appendChild(marcoElasticoRelativo);

                        },
                        codigoErroneo: () => {

                            const marcoElasticoRelatico = document.createElement("div")
                            marcoElasticoRelatico.classList.add("marcoElasticoRelativo")

                            const marcoElastico = document.createElement("div")
                            marcoElastico.classList.add("marcoElastico")
                            marcoElastico.style.alignItems = "stretch"
                            marcoElastico.style.gap = "4px"


                            const titulo = document.createElement("div")
                            titulo.classList.add("titulo")
                            titulo.innerText = "El código de recuperación es erróneo"
                            marcoElastico.appendChild(titulo)

                            // Añadir banner informativo
                            const contenedorBanner = document.createElement("a")
                            contenedorBanner.classList.add("plaza_reservas_reservaConfiramda_bannerV2")
                            contenedorBanner.innerText = "El código de recuperación es erróneo. Revisa el código introducido. Recuerda que los códigos de recuperación tienen una validez de una hora desde que se generan, se usen o no. También recuerda que los códigos de recuperación son de un solo uso. Si has generado varios códigos de recuperación recuerda también solo es válido un código a la vez. Eso quiere decir que, si generaste varios códigos, el válido solo es el último código generado, el más nuevo."
                            marcoElastico.appendChild(contenedorBanner)

                            const botonIniciarReserva = document.createElement("a")
                            botonIniciarReserva.classList.add("plaza_reservas_reservaConfiramda_banner")
                            botonIniciarReserva.innerText = "Ir a generar un nuevo código"
                            botonIniciarReserva.setAttribute("href", "/micasa/recuperar_cuenta")
                            botonIniciarReserva.setAttribute("vista", "/micasa/recuperar_cuenta")
                            botonIniciarReserva.addEventListener("click", casaVitini.componentes.cambiarVista)
                            marcoElastico.appendChild(botonIniciarReserva)


                            const botonIrARegistrarse = document.createElement("a")
                            botonIrARegistrarse.classList.add("plaza_reservas_reservaConfiramda_banner")
                            botonIrARegistrarse.innerText = "Ir al portal de MiCasa"
                            botonIrARegistrarse.setAttribute("href", "/micasa")
                            botonIrARegistrarse.setAttribute("vista", "/micasa")
                            botonIrARegistrarse.addEventListener("click", casaVitini.componentes.cambiarVista)
                            marcoElastico.appendChild(botonIrARegistrarse)


                            const botonInciarSession = document.createElement("a")
                            botonInciarSession.classList.add("plaza_reservas_reservaConfiramda_banner")
                            botonInciarSession.innerText = "Ir a la página principal"
                            botonInciarSession.setAttribute("href", "/")
                            botonInciarSession.setAttribute("vista", "/")
                            botonInciarSession.addEventListener("click", casaVitini.componentes.cambiarVista)
                            marcoElastico.appendChild(botonInciarSession)

                            marcoElasticoRelatico.appendChild(marcoElastico)
                            const seccion = document.querySelector("section")
                            seccion.innerHTML = null
                            seccion.appendChild(marcoElasticoRelatico)
                        },
                        mensajeEnviado: () => {

                            const marcoElasticoRelatico = document.createElement("div")
                            marcoElasticoRelatico.classList.add("marcoElasticoRelativo")

                            const marcoElastico = document.createElement("div")
                            marcoElastico.classList.add("marcoElastico")
                            marcoElastico.style.alignItems = "stretch"
                            marcoElastico.style.gap = "4px"


                            const titulo = document.createElement("div")
                            titulo.classList.add("titulo")
                            titulo.innerText = "Mensaje enviado"
                            marcoElastico.appendChild(titulo)

                            // Añadir banner informativo
                            const contenedorBanner = document.createElement("a")
                            contenedorBanner.classList.add("plaza_miCasa_recuperarCuenta_contenedorInfo")
                            contenedorBanner.innerText = "Se ha enviado un mensaje a tu buzón con un enlace temporal de una hora de duración para que puedas restablecer tu contraseña y recuperar el acceso a tu VitiniID."
                            marcoElastico.appendChild(contenedorBanner)

                            const botonIniciarReserva = document.createElement("a")
                            botonIniciarReserva.classList.add("plaza_reservas_reservaConfiramda_banner")
                            botonIniciarReserva.innerText = "Volver a generar otro código (Acabo de olvidar la nueva clave)"
                            botonIniciarReserva.setAttribute("href", "/micasa/recuperar_cuenta")
                            botonIniciarReserva.setAttribute("vista", "/micasa/recuperar_cuenta")
                            botonIniciarReserva.addEventListener("click", casaVitini.componentes.cambiarVista)
                            //marcoElastico.appendChild(botonIniciarReserva)


                            const botonIrARegistrarse = document.createElement("a")
                            botonIrARegistrarse.classList.add("plaza_reservas_reservaConfiramda_banner")
                            botonIrARegistrarse.innerText = "Ir al portal de MiCasa"
                            botonIrARegistrarse.setAttribute("href", "/micasa")
                            botonIrARegistrarse.setAttribute("vista", "/micasa")
                            botonIrARegistrarse.addEventListener("click", casaVitini.componentes.cambiarVista)
                            //marcoElastico.appendChild(botonIrARegistrarse)


                            const botonInciarSession = document.createElement("a")
                            botonInciarSession.classList.add("plaza_reservas_reservaConfiramda_banner")
                            botonInciarSession.innerText = "Ir a la página principal"
                            botonInciarSession.setAttribute("href", "/")
                            botonInciarSession.setAttribute("vista", "/")
                            botonInciarSession.addEventListener("click", casaVitini.componentes.cambiarVista)
                            //marcoElastico.appendChild(botonInciarSession)

                            marcoElasticoRelatico.appendChild(marcoElastico)
                            const seccion = document.querySelector("section")
                            seccion.innerHTML = null
                            seccion.appendChild(marcoElasticoRelatico)
                        },
                        claveRestablecida: () => {

                            const marcoElasticoRelatico = document.createElement("div")
                            marcoElasticoRelatico.classList.add("marcoElasticoRelativo")

                            const marcoElastico = document.createElement("div")
                            marcoElastico.classList.add("marcoElastico")
                            marcoElastico.style.alignItems = "stretch"
                            marcoElastico.style.gap = "4px"


                            const titulo = document.createElement("div")
                            titulo.classList.add("titulo")
                            titulo.innerText = "Cuenta reestablecida"
                            marcoElastico.appendChild(titulo)

                            // Añadir banner informativo
                            const contenedorBanner = document.createElement("a")
                            contenedorBanner.classList.add("plaza_miCasa_recuperarCuenta_contenedorInfo")
                            contenedorBanner.innerText = "Se ha reestablecido tu contraseña. Ya puedes empezar a usarla."
                            marcoElastico.appendChild(contenedorBanner)

                            const botonIniciarReserva = document.createElement("a")
                            botonIniciarReserva.classList.add("plaza_reservas_reservaConfiramda_banner")
                            botonIniciarReserva.innerText = "Volver a generar otro código (Acabo de olvidar la nueva clave)"
                            botonIniciarReserva.setAttribute("href", "/micasa/recuperar_cuenta")
                            botonIniciarReserva.setAttribute("vista", "/micasa/recuperar_cuenta")
                            botonIniciarReserva.addEventListener("click", casaVitini.componentes.cambiarVista)
                            //marcoElastico.appendChild(botonIniciarReserva)


                            const botonIrARegistrarse = document.createElement("a")
                            botonIrARegistrarse.classList.add("plaza_reservas_reservaConfiramda_banner")
                            botonIrARegistrarse.innerText = "Ir al portal de MiCasa"
                            botonIrARegistrarse.setAttribute("href", "/micasa")
                            botonIrARegistrarse.setAttribute("vista", "/micasa")
                            botonIrARegistrarse.addEventListener("click", casaVitini.componentes.cambiarVista)
                            //marcoElastico.appendChild(botonIrARegistrarse)


                            const botonInciarSession = document.createElement("a")
                            botonInciarSession.classList.add("plaza_reservas_reservaConfiramda_banner")
                            botonInciarSession.innerText = "Ir a la página principal"
                            botonInciarSession.setAttribute("href", "/")
                            botonInciarSession.setAttribute("vista", "/")
                            botonInciarSession.addEventListener("click", casaVitini.componentes.cambiarVista)
                            //marcoElastico.appendChild(botonInciarSession)

                            marcoElasticoRelatico.appendChild(marcoElastico)
                            const seccion = document.querySelector("section")
                            seccion.innerHTML = null
                            seccion.appendChild(marcoElasticoRelatico)
                        },
                        restablecerClave: (codigo) => {


                            // Crear elementos
                            const titulo = document.createElement('p');
                            titulo.className = 'titulo';
                            titulo.textContent = 'Restablecer contaseña';

                            const marcoElasticoRelativo = document.createElement('div');
                            marcoElasticoRelativo.className = 'marcoElasticoRelativo';

                            const marcoElastico = document.createElement('div');
                            marcoElastico.className = 'marcoElastico';

                            const contenedorCrearCuenta = document.createElement('div');
                            contenedorCrearCuenta.className = 'miCasa_crearCuenta_contenedorCrearCuenta';

                            const texto = document.createElement('p');
                            texto.className = 'texto paddgin6';
                            texto.textContent = 'Restablece la contraseña de tu VitiniID. Una vez la restablezcas este enlace dejara de tener valides. Escoge una contraseña robusta y segura. Es recomendable usar un llavero de contraseñas tanto para generarlas como para gestionarlas. Este enlace te otorga una hora para restablecer tu contraseña.';

                            const clave = document.createElement('input');
                            clave.type = 'password';
                            clave.className = 'miCasa_crearCuenta_campo';
                            clave.setAttribute('campo', 'clave');
                            clave.placeholder = 'Escribe tu nueva contraseña';

                            const claveConfirmada = document.createElement('input');
                            claveConfirmada.type = 'password';
                            claveConfirmada.className = 'miCasa_crearCuenta_campo';
                            claveConfirmada.setAttribute('campo', 'claveConfirmada');
                            claveConfirmada.placeholder = 'Escribe de nuevo tu contraseña';

                            const contenedorBotones = document.createElement('div');
                            contenedorBotones.className = 'miCuenta_cambioClave_contenedorBotones';

                            const botonEnviar = document.createElement('div');
                            botonEnviar.className = 'miCuenta_cambiarClave_botonV1';
                            botonEnviar.setAttribute('componente', 'botonCrearNuevaCuenta');
                            botonEnviar.addEventListener("click", () => {
                                casaVitini.ui.vistas.miCasa.recuperarCuenta.transactores.restablecerClave(codigo)
                            })
                            botonEnviar.textContent = 'Reestablecer contraseña';

                            // Adjuntar elementos al DOM
                            const secction = document.querySelector("section")
                            secction.appendChild(titulo);

                            contenedorCrearCuenta.appendChild(texto);
                            contenedorCrearCuenta.appendChild(clave);
                            contenedorCrearCuenta.appendChild(claveConfirmada);
                            contenedorBotones.appendChild(botonEnviar);

                            contenedorCrearCuenta.appendChild(contenedorBotones);
                            marcoElastico.appendChild(contenedorCrearCuenta);
                            marcoElasticoRelativo.appendChild(marcoElastico);
                            secction.appendChild(marcoElasticoRelativo);

                        },

                    },
                    transactores: {
                        enviarEnlaceRecuperacion: async () => {

                            const email = document.querySelector("[campo=email]").value

                            const instanciaUID = casaVitini.componentes.codigoFechaInstancia()
                            const mensaje = "Enviando enlace temporal..."
                            const datosPantallaSuperpuesta = {
                                instanciaUID: instanciaUID,
                                mensaje: mensaje
                            }
                            casaVitini.ui.vistas.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                            const pantallaDeCargaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                            const transacccion = {
                                zona: "miCasa/recuperarCuenta/enviarCorreo",
                                email: email.trim()
                            }
                            const respuestaServidor = await casaVitini.componentes.servidor(transacccion)

                            if (respuestaServidor?.error && pantallaDeCargaRenderizada) {
                                casaVitini.componentes.limpiarAdvertenciasInmersivas()
                                return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok && pantallaDeCargaRenderizada) {
                                casaVitini.componentes.limpiarAdvertenciasInmersivas()
                                return casaVitini.ui.vistas.miCasa.recuperarCuenta.ui.mensajeEnviado()

                            }

                        },
                        restablecerClave: async (codigo) => {
                            const clave = document.querySelector("[campo=clave]").value
                            const claveConfirmada = document.querySelector("[campo=claveConfirmada]").value

                            const instanciaUID = casaVitini.componentes.codigoFechaInstancia()
                            const mensaje = "Reestableciendo la contraseña..."
                            const datosPantallaSuperpuesta = {
                                instanciaUID: instanciaUID,
                                mensaje: mensaje
                            }
                            casaVitini.ui.vistas.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                            const pantallaDeCargaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)

                            const transacccion = {
                                zona: "miCasa/recuperarCuenta/restablecerClave",
                                codigo: codigo,
                                clave: clave,
                                claveConfirmada: claveConfirmada
                            }
                            const respuestaServidor = await casaVitini.componentes.servidor(transacccion)

                            if (respuestaServidor?.error && pantallaDeCargaRenderizada) {
                                casaVitini.componentes.limpiarAdvertenciasInmersivas()
                                return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok && pantallaDeCargaRenderizada) {
                                casaVitini.componentes.limpiarAdvertenciasInmersivas()
                                return casaVitini.ui.vistas.miCasa.recuperarCuenta.ui.claveRestablecida()
                            }

                        },
                    },







                },
                verificarCuenta: {
                    arranque: async () => {
                        const granuladoURL = casaVitini.componentes.granuladorURL()
                        const comandoInicial = granuladoURL.directorios[granuladoURL.directorios.length - 1]
                        if (comandoInicial === "verificar_cuenta") {
                            return casaVitini.ui.vistas.miCasa.verificarCuenta.ui.portadaUI()
                        }
                        const comandoSecundario = granuladoURL.directorios[granuladoURL.directorios.length - 2]
                        if (comandoSecundario === "verificar_cuenta") {
                            const transacccion = {
                                zona: "miCasa/verificarCuenta",
                                codigo: comandoInicial
                            }
                            const respuestaServidor = await casaVitini.componentes.servidor(transacccion)

                            if (respuestaServidor?.error) {
                                return casaVitini.ui.vistas.miCasa.recuperarCuenta.ui.codigoErroneo()
                            }
                            if (respuestaServidor?.ok) {
                                return casaVitini.ui.vistas.miCasa.recuperarCuenta.ui.cuentaVerificada(comandoInicial)
                            }
                        }

                    },
                    ui: {
                        portadaUI: () => {
                            const titulo = document.createElement('p');
                            titulo.className = 'titulo';
                            titulo.textContent = 'Verifica tu cuenta con tu dirección de correo electrónico';

                            const marcoElasticoRelativo = document.createElement('div');
                            marcoElasticoRelativo.className = 'marcoElasticoRelativo';


                            const marcoElastico = document.createElement('div');
                            marcoElastico.className = 'marcoElastico';
                            marcoElastico.style.alignItems = "stretch"
                            marcoElastico.style.gap = "4px"

                            const botonRecuperarCuenta = document.createElement("a")
                            botonRecuperarCuenta.classList.add("plaza_reservas_reservaConfiramda_banner")
                            botonRecuperarCuenta.innerText = "Ir a recuperar mi cuenta para mandar un enlace de verificación a mi correo"
                            botonRecuperarCuenta.setAttribute("href", "/micasa/recuperar_cuenta")
                            botonRecuperarCuenta.setAttribute("vista", "/micasa/recuperar_cuenta")
                            botonRecuperarCuenta.addEventListener("click", casaVitini.componentes.cambiarVista)

                            const contenedorCrearCuenta = document.createElement('div');
                            contenedorCrearCuenta.className = 'miCasa_crearCuenta_contenedorCrearCuenta';

                            const texto = document.createElement('p');
                            texto.className = 'texto paddgin6';
                            texto.textContent = 'Cuando creas una cuenta en Casa Vitini, tienes que verificar tu VitiniID. Para ello tienes que acceder desde el enlace que se te envió al buzón de correo electrónico. Si ya no dispones de este enlace. Puedes volver a enviar otro enlace de verificación. Para ello ver al portal de inicio de sesión y pulsa en recuperar tu cuenta. Si tu cuenta no está verificada se te enviara un email de verificación. Cuando recivas el mensaje con el enlaces de verifiacion. Puedes hacer click en es enlaces o escribir en siguiente campo el enlaces de verificacíon.';

                            const input = document.createElement('input');
                            input.type = 'text';
                            input.className = 'miCasa_crearCuenta_campo';
                            input.setAttribute('campo', 'codigoVerificacion');
                            input.placeholder = 'Escribo aquí tu código de verificación';

                            const contenedorBotones = document.createElement('div');
                            contenedorBotones.className = 'miCuenta_cambioClave_contenedorBotones';

                            const botonEnviar = document.createElement('div');
                            botonEnviar.className = 'miCuenta_cambiarClave_botonV1';
                            botonEnviar.setAttribute('componente', 'botonVerificarCodigo');
                            botonEnviar.addEventListener("click", () => {
                                casaVitini.ui.vistas.miCasa.verificarCuenta.transactores.verificarCodigo()
                            })
                            botonEnviar.textContent = 'Verificar código';

                            // Adjuntar elementos al DOM
                            const secction = document.querySelector("main")
                            secction.appendChild(titulo);
                            marcoElastico.appendChild(botonRecuperarCuenta);

                            contenedorCrearCuenta.appendChild(texto);
                            contenedorCrearCuenta.appendChild(input);
                            contenedorBotones.appendChild(botonEnviar);

                            contenedorCrearCuenta.appendChild(contenedorBotones);
                            marcoElastico.appendChild(contenedorCrearCuenta);
                            marcoElasticoRelativo.appendChild(marcoElastico);
                            secction.appendChild(marcoElasticoRelativo);

                        },
                        codigoErroneo: () => {

                            const marcoElasticoRelatico = document.createElement("div")
                            marcoElasticoRelatico.classList.add("marcoElasticoRelativo")

                            const marcoElastico = document.createElement("div")
                            marcoElastico.classList.add("marcoElastico")
                            marcoElastico.style.alignItems = "stretch"
                            marcoElastico.style.gap = "4px"


                            const titulo = document.createElement("div")
                            titulo.classList.add("titulo")
                            titulo.innerText = "El código de recuperación es erróneo"
                            marcoElastico.appendChild(titulo)

                            // Añadir banner informativo
                            const contenedorBanner = document.createElement("a")
                            contenedorBanner.classList.add("plaza_reservas_reservaConfiramda_bannerV2")
                            contenedorBanner.innerText = "El código de recuperación es erróneo. Revisa el código introducido. Recuerda que los códigos de recuperación tienen una validez de una hora desde que se generan, se usen o no. También recuerda que los códigos de recuperación son de un solo uso. Si has generado varios códigos de recuperación recuerda también solo es válido un código a la vez. Eso quiere decir que, si generaste varios códigos, el válido solo es el último código generado, el más nuevo."
                            marcoElastico.appendChild(contenedorBanner)

                            const botonIniciarReserva = document.createElement("a")
                            botonIniciarReserva.classList.add("plaza_reservas_reservaConfiramda_banner")
                            botonIniciarReserva.innerText = "Ir a generar un nuevo código"
                            botonIniciarReserva.setAttribute("href", "/micasa/recuperar_cuenta")
                            botonIniciarReserva.setAttribute("vista", "/micasa/recuperar_cuenta")
                            botonIniciarReserva.addEventListener("click", casaVitini.componentes.cambiarVista)
                            marcoElastico.appendChild(botonIniciarReserva)


                            const botonIrARegistrarse = document.createElement("a")
                            botonIrARegistrarse.classList.add("plaza_reservas_reservaConfiramda_banner")
                            botonIrARegistrarse.innerText = "Ir al portal de MiCasa"
                            botonIrARegistrarse.setAttribute("href", "/micasa")
                            botonIrARegistrarse.setAttribute("vista", "/micasa")
                            botonIrARegistrarse.addEventListener("click", casaVitini.componentes.cambiarVista)
                            marcoElastico.appendChild(botonIrARegistrarse)


                            const botonInciarSession = document.createElement("a")
                            botonInciarSession.classList.add("plaza_reservas_reservaConfiramda_banner")
                            botonInciarSession.innerText = "Ir a la página principal"
                            botonInciarSession.setAttribute("href", "/")
                            botonInciarSession.setAttribute("vista", "/")
                            botonInciarSession.addEventListener("click", casaVitini.componentes.cambiarVista)
                            marcoElastico.appendChild(botonInciarSession)

                            marcoElasticoRelatico.appendChild(marcoElastico)
                            const seccion = document.querySelector("section")
                            seccion.innerHTML = null
                            seccion.appendChild(marcoElasticoRelatico)
                        },
                        mensajeEnviado: () => {

                            const marcoElasticoRelatico = document.createElement("div")
                            marcoElasticoRelatico.classList.add("marcoElasticoRelativo")

                            const marcoElastico = document.createElement("div")
                            marcoElastico.classList.add("marcoElastico")
                            marcoElastico.style.alignItems = "stretch"
                            marcoElastico.style.gap = "4px"


                            const titulo = document.createElement("div")
                            titulo.classList.add("titulo")
                            titulo.innerText = "Mensaje enviado"
                            marcoElastico.appendChild(titulo)

                            // Añadir banner informativo
                            const contenedorBanner = document.createElement("a")
                            contenedorBanner.classList.add("plaza_miCasa_recuperarCuenta_contenedorInfo")
                            contenedorBanner.innerText = "Se ha enviado un mensaje a tu buzón con un enlace temporal de una hora de duración para que puedas restablecer tu contraseña y recuperar el acceso a tu VitiniID."
                            marcoElastico.appendChild(contenedorBanner)

                            const botonIniciarReserva = document.createElement("a")
                            botonIniciarReserva.classList.add("plaza_reservas_reservaConfiramda_banner")
                            botonIniciarReserva.innerText = "Volver a generar otro código (Acabo de olvidar la nueva clave)"
                            botonIniciarReserva.setAttribute("href", "/micasa/recuperar_cuenta")
                            botonIniciarReserva.setAttribute("vista", "/micasa/recuperar_cuenta")
                            botonIniciarReserva.addEventListener("click", casaVitini.componentes.cambiarVista)
                            //marcoElastico.appendChild(botonIniciarReserva)


                            const botonIrARegistrarse = document.createElement("a")
                            botonIrARegistrarse.classList.add("plaza_reservas_reservaConfiramda_banner")
                            botonIrARegistrarse.innerText = "Ir al portal de MiCasa"
                            botonIrARegistrarse.setAttribute("href", "/micasa")
                            botonIrARegistrarse.setAttribute("vista", "/micasa")
                            botonIrARegistrarse.addEventListener("click", casaVitini.componentes.cambiarVista)
                            //marcoElastico.appendChild(botonIrARegistrarse)


                            const botonInciarSession = document.createElement("a")
                            botonInciarSession.classList.add("plaza_reservas_reservaConfiramda_banner")
                            botonInciarSession.innerText = "Ir a la página principal"
                            botonInciarSession.setAttribute("href", "/")
                            botonInciarSession.setAttribute("vista", "/")
                            botonInciarSession.addEventListener("click", casaVitini.componentes.cambiarVista)
                            //marcoElastico.appendChild(botonInciarSession)

                            marcoElasticoRelatico.appendChild(marcoElastico)
                            const seccion = document.querySelector("section")
                            seccion.innerHTML = null
                            seccion.appendChild(marcoElasticoRelatico)
                        },
                        claveRestablecida: () => {

                            const marcoElasticoRelatico = document.createElement("div")
                            marcoElasticoRelatico.classList.add("marcoElasticoRelativo")

                            const marcoElastico = document.createElement("div")
                            marcoElastico.classList.add("marcoElastico")
                            marcoElastico.style.alignItems = "stretch"
                            marcoElastico.style.gap = "4px"


                            const titulo = document.createElement("div")
                            titulo.classList.add("titulo")
                            titulo.innerText = "Cuenta reestablecida"
                            marcoElastico.appendChild(titulo)

                            // Añadir banner informativo
                            const contenedorBanner = document.createElement("a")
                            contenedorBanner.classList.add("plaza_miCasa_recuperarCuenta_contenedorInfo")
                            contenedorBanner.innerText = "Se ha reestablecido tu contraseña. Ya puedes empezar a usarla."
                            marcoElastico.appendChild(contenedorBanner)

                            const botonIniciarReserva = document.createElement("a")
                            botonIniciarReserva.classList.add("plaza_reservas_reservaConfiramda_banner")
                            botonIniciarReserva.innerText = "Volver a generar otro código (Acabo de olvidar la nueva clave)"
                            botonIniciarReserva.setAttribute("href", "/micasa/recuperar_cuenta")
                            botonIniciarReserva.setAttribute("vista", "/micasa/recuperar_cuenta")
                            botonIniciarReserva.addEventListener("click", casaVitini.componentes.cambiarVista)
                            //marcoElastico.appendChild(botonIniciarReserva)


                            const botonIrARegistrarse = document.createElement("a")
                            botonIrARegistrarse.classList.add("plaza_reservas_reservaConfiramda_banner")
                            botonIrARegistrarse.innerText = "Ir al portal de MiCasa"
                            botonIrARegistrarse.setAttribute("href", "/micasa")
                            botonIrARegistrarse.setAttribute("vista", "/micasa")
                            botonIrARegistrarse.addEventListener("click", casaVitini.componentes.cambiarVista)
                            //marcoElastico.appendChild(botonIrARegistrarse)


                            const botonInciarSession = document.createElement("a")
                            botonInciarSession.classList.add("plaza_reservas_reservaConfiramda_banner")
                            botonInciarSession.innerText = "Ir a la página principal"
                            botonInciarSession.setAttribute("href", "/")
                            botonInciarSession.setAttribute("vista", "/")
                            botonInciarSession.addEventListener("click", casaVitini.componentes.cambiarVista)
                            //marcoElastico.appendChild(botonInciarSession)

                            marcoElasticoRelatico.appendChild(marcoElastico)
                            const seccion = document.querySelector("section")
                            seccion.innerHTML = null
                            seccion.appendChild(marcoElasticoRelatico)
                        },
                        restablecerClave: (codigo) => {


                            // Crear elementos
                            const titulo = document.createElement('p');
                            titulo.className = 'titulo';
                            titulo.textContent = 'Restablecer contaseña';

                            const marcoElasticoRelativo = document.createElement('div');
                            marcoElasticoRelativo.className = 'marcoElasticoRelativo';

                            const marcoElastico = document.createElement('div');
                            marcoElastico.className = 'marcoElastico';

                            const contenedorCrearCuenta = document.createElement('div');
                            contenedorCrearCuenta.className = 'miCasa_crearCuenta_contenedorCrearCuenta';

                            const texto = document.createElement('p');
                            texto.className = 'texto paddgin6';
                            texto.textContent = 'Restablece la contraseña de tu VitiniID. Una vez la restablezcas este enlace dejara de tener valides. Escoge una contraseña robusta y segura. Es recomendable usar un llavero de contraseñas tanto para generarlas como para gestionarlas. Este enlace te otorga una hora para restablecer tu contraseña.';

                            const clave = document.createElement('input');
                            clave.type = 'password';
                            clave.className = 'miCasa_crearCuenta_campo';
                            clave.setAttribute('campo', 'clave');
                            clave.placeholder = 'Escribe tu nueva contraseña';

                            const claveConfirmada = document.createElement('input');
                            claveConfirmada.type = 'password';
                            claveConfirmada.className = 'miCasa_crearCuenta_campo';
                            claveConfirmada.setAttribute('campo', 'claveConfirmada');
                            claveConfirmada.placeholder = 'Escribe de nuevo tu contraseña';

                            const contenedorBotones = document.createElement('div');
                            contenedorBotones.className = 'miCuenta_cambioClave_contenedorBotones';

                            const botonEnviar = document.createElement('div');
                            botonEnviar.className = 'miCuenta_cambiarClave_botonV1';
                            botonEnviar.setAttribute('componente', 'botonCrearNuevaCuenta');
                            botonEnviar.addEventListener("click", () => {
                                casaVitini.ui.vistas.miCasa.recuperarCuenta.transactores.restablecerClave(codigo)
                            })
                            botonEnviar.textContent = 'Reestablecer contraseña';

                            // Adjuntar elementos al DOM
                            const secction = document.querySelector("main")
                            secction.appendChild(titulo);

                            contenedorCrearCuenta.appendChild(texto);
                            contenedorCrearCuenta.appendChild(clave);
                            contenedorCrearCuenta.appendChild(claveConfirmada);
                            contenedorBotones.appendChild(botonEnviar);

                            contenedorCrearCuenta.appendChild(contenedorBotones);
                            marcoElastico.appendChild(contenedorCrearCuenta);
                            marcoElasticoRelativo.appendChild(marcoElastico);
                            secction.appendChild(marcoElasticoRelativo);

                        },

                    },
                    transactores: {
                        verificarCodigo: async () => {

                            const codigo = document.querySelector("[campo=codigoVerificacion]").value

                            const instanciaUID = casaVitini.componentes.codigoFechaInstancia()
                            const mensaje = "Comprobando código de verificacion..."
                            const datosPantallaSuperpuesta = {
                                instanciaUID: instanciaUID,
                                mensaje: mensaje
                            }
                            casaVitini.ui.vistas.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                            const pantallaDeCargaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                            const transacccion = {
                                zona: "miCasa/verificarCuenta",
                                codigo: codigo.trim()
                            }
                            const respuestaServidor = await casaVitini.componentes.servidor(transacccion)

                            if (respuestaServidor?.error && pantallaDeCargaRenderizada) {
                                casaVitini.componentes.limpiarAdvertenciasInmersivas()
                                return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok && pantallaDeCargaRenderizada) {
                                casaVitini.componentes.limpiarAdvertenciasInmersivas()
                                return casaVitini.ui.vistas.miCasa.recuperarCuenta.ui.mensajeEnviado()
                            }
                        },
                        restablecerClave: async (codigo) => {
                            const clave = document.querySelector("[campo=clave]").value
                            const claveConfirmada = document.querySelector("[campo=claveConfirmada]").value

                            const instanciaUID = casaVitini.componentes.codigoFechaInstancia()
                            const mensaje = "Reestableciendo la contraseña..."
                            const datosPantallaSuperpuesta = {
                                instanciaUID: instanciaUID,
                                mensaje: mensaje
                            }
                            casaVitini.ui.vistas.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                            const pantallaDeCargaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)

                            const transacccion = {
                                zona: "miCasa/recuperarCuenta/restablecerClave",
                                codigo: codigo,
                                clave: clave,
                                claveConfirmada: claveConfirmada
                            }
                            const respuestaServidor = await casaVitini.componentes.servidor(transacccion)

                            if (respuestaServidor?.error && pantallaDeCargaRenderizada) {
                                casaVitini.componentes.limpiarAdvertenciasInmersivas()
                                return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok && pantallaDeCargaRenderizada) {
                                casaVitini.componentes.limpiarAdvertenciasInmersivas()
                                return casaVitini.ui.vistas.miCasa.recuperarCuenta.ui.claveRestablecida()
                            }

                        },
                    },







                }



            },
            contacto:
            {
                arranque: () => {
                    //document.body.style.backgroundImage = 'url("/componentes/imagenes/nicaragua.png")';
                    document.body.style.backgroundImage = 'url("/componentes/imagenes/contacto.jpg")';

                    document.querySelector("#uiLogo").style.filter = "invert(1)"
                    document.querySelector("#botonMenuResponsivo").style.filter = "invert(1)"
                    //document.body.classList.add("difuminadoFondo")


                },
            },
            advertenciaInmersiva: (advertencia) => {

                const advertenciaInmersivaUI = document.createElement("section")
                advertenciaInmersivaUI.setAttribute("class", "errorUI")
                advertenciaInmersivaUI.setAttribute("componente", "advertenciaInmersiva")

                const marcoElastico = document.createElement("div")
                marcoElastico.classList.add("marcoElasticoError")

                const info = document.createElement("div")
                info.setAttribute("class", "errorInfo")
                info.innerText = advertencia
                marcoElastico.appendChild(info)

                const boton = document.createElement("div")
                boton.setAttribute("class", "errorBoton")
                boton.innerText = "Aceptar"
                boton.addEventListener("click", casaVitini.componentes.limpiarAdvertenciasInmersivas)

                marcoElastico.appendChild(boton)
                advertenciaInmersivaUI.appendChild(marcoElastico)
                document.body.appendChild(advertenciaInmersivaUI)

                document.body.style.overflow = 'hidden';

            },
            advertenciaInmersivaSuperPuesta: (advertencia) => {
                const advertenciaInmersivaUI = document.createElement("div")
                advertenciaInmersivaUI.setAttribute("class", "advertenciaInmersivaSuperpuesta")
                advertenciaInmersivaUI.setAttribute("componente", "advertenciaInmersiva")

                const marcoElastico = document.createElement("div")
                marcoElastico.classList.add("marcoElasticoError")

                const info = document.createElement("div")
                info.setAttribute("class", "errorInfo")
                info.innerText = advertencia
                marcoElastico.appendChild(info)

                const boton = document.createElement("div")
                boton.setAttribute("class", "errorBoton")
                boton.innerText = "Aceptar"
                boton.addEventListener("click", (e) => {
                    e.target.parentNode.parentNode.remove()
                })

                marcoElastico.appendChild(boton)
                advertenciaInmersivaUI.appendChild(marcoElastico)

                document.body.appendChild(advertenciaInmersivaUI)

            },
            pantallaDeCargaSuperPuesta: (metadatos) => {

                const instanciaUID = metadatos.instanciaUID
                const mensaje = metadatos.mensaje ? metadatos.mensaje : "Espere..."

                const advertenciaInmersivaUI = document.createElement("div")
                advertenciaInmersivaUI.setAttribute("class", "advertenciaInmersivaSuperpuesta")
                advertenciaInmersivaUI.setAttribute("pantallaSuperpuesta", "pantallaCargaSuperpuesta")
                advertenciaInmersivaUI.setAttribute("componente", "advertenciaInmersiva")
                advertenciaInmersivaUI.setAttribute("instanciaUID", instanciaUID)

                const marcoElastico = document.createElement("div")
                marcoElastico.classList.add("marcoElasticoError")

                const spinnerContainer = document.createElement('div');
                spinnerContainer.setAttribute("componente", "iconoCargaEnlace");
                spinnerContainer.classList.add("lds-spinner");

                for (let i = 0; i < 12; i++) {
                    const div = document.createElement('div');
                    spinnerContainer.appendChild(div);
                }
                marcoElastico.appendChild(spinnerContainer)

                const info = document.createElement("div")
                info.setAttribute("class", "advertenciaInfoFlujoPago")
                info.setAttribute("componente", "mensajeFlujoPasarela")
                info.innerText = mensaje
                marcoElastico.appendChild(info)

                const boton = document.createElement("div")
                boton.setAttribute("class", "errorBoton")
                boton.innerText = "Cancelar"
                boton.addEventListener("click", (e) => {
                    document.body.style.removeProperty("overflow");
                    e.target.parentNode.parentNode.remove()
                })

                marcoElastico.appendChild(boton)
                advertenciaInmersivaUI.appendChild(marcoElastico)
                document.body.appendChild(advertenciaInmersivaUI)

            },
            pagos: {
                portada: {
                    arranque: async () => {
                        const granuladoURL = casaVitini.componentes.granuladorURL()
                        const comandoInicial = granuladoURL.directorios[granuladoURL.directorios.length - 1]
                        const instanciaUID = document.querySelector("main").getAttribute("instanciaUID")
                        if (comandoInicial === "pagos") {
                            return casaVitini.ui.vistas.pagos.pantallaInicial()
                        }

                        const contenedorEnlaceDePago = document.querySelector("main")
                        const transaccion = {
                            zona: "plaza/enlaceDePago/obtenerPago",
                            pagoUID: comandoInicial
                        }

                        const respuestaServidor = await casaVitini.componentes.servidor(transaccion)
                        if (respuestaServidor?.error) {
                            const tituloGlobal = document.createElement("div")
                            tituloGlobal.classList.add("titulo")
                            tituloGlobal.innerText = "Enlace de pago"
                            contenedorEnlaceDePago.appendChild(tituloGlobal)
                            const info = {
                                titulo: "Informacíon acerca de este enlace de pago",
                                descripcion: respuestaServidor?.error
                            }
                            return casaVitini.componentes.mensajeSimple(info)

                        }

                        if (respuestaServidor?.ok) {
                            const detallesDelPago = respuestaServidor?.ok

                            const pagoUID = detallesDelPago.codigo
                            const reservaUID = detallesDelPago.reserva
                            const totales = detallesDelPago.totales
                            const detallesPagoParcial = detallesDelPago.pagoParcial




                            // <p class="titulo">Realizar un pago</p>
                            // <div class="marcoElasticoRelativo">
                            // <div class="marcoElastico">
                            // <div class="marcoPago" espacio="marcoPago" componente="espacioPago">


                            const tituloGlobal = document.createElement("div")
                            tituloGlobal.classList.add("titulo")
                            tituloGlobal.innerText = "Realizar un pago"
                            contenedorEnlaceDePago.appendChild(tituloGlobal)

                            const marcoElasticoRelativo = document.createElement("div")
                            marcoElasticoRelativo.classList.add("marcoElasticoRelativo")

                            const marcoElastico = document.createElement("div")
                            marcoElastico.classList.add("marcoElastico")

                            const marcoPago = document.createElement("div")
                            marcoPago.classList.add("plaza_enlacesDePago_marcoPago")
                            marcoPago.setAttribute("espacio", "marcoPago")
                            marcoPago.setAttribute("componente", "espacioPago")


                            const info = document.createElement("p")
                            info.classList.add("pagoPorEnlace_info")
                            info.innerText = "Esto es un enlace para realizar un pago en Casa Vitini. El pago puedes ser un pago completo de una reserva o un pago parcial si la reserva se paga a partas entre los pernoctantes. Por favor revisa que los datos sean correctos y procede al pago. En esta pagina tienes dos seciones. La seccion Detalles del pago donde puedes ver el total bruto junto con el desglose de la cantidad que corresponde al neto como al la suma de impuestos aplicada. Tambien tienes los Detalles del total de la reserva a modo informativo para que tenga la visicon global"
                            marcoPago.appendChild(info)


                            const contenedorReservaUID = document.createElement("div")
                            contenedorReservaUID.classList.add("enlaceDePago_contendorReservaUID")

                            const tituloReserva = document.createElement("div")
                            tituloReserva.classList.add("enlaceDePago_tituloReserva")
                            tituloReserva.classList.add("negrita")
                            tituloReserva.innerText = "Identificador de la reserva"
                            contenedorReservaUID.appendChild(tituloReserva)

                            const identificadorReserva = document.createElement("div")
                            identificadorReserva.classList.add("enlaceDePago_identificadorReserva")
                            identificadorReserva.innerText = reservaUID
                            contenedorReservaUID.appendChild(identificadorReserva)

                            marcoPago.appendChild(contenedorReservaUID)

                            const resolutorNombresTotales = {
                                promedioNetoPorNoche: "Promedio neto por noche",
                                totalReservaNetoSinOfertas: "Total neto de la reserva sin ofertas",
                                totalReservaNeto: "Total reserva neto",
                                totalDescuentos: "Total descuentos aplicados",
                                totalImpuestos: "Total de la suma de los impuestos aplicados",
                                totalConImpuestos: "Total bruto definitivo a pagar",
                            }

                            const resolutorNombresTotalesParciales = {
                                netoParcial: "Total neto",
                                impuestosParciales: "Impuestos",
                                cantidadParcial: "Total bruto a pagar",
                            }

                            const contenedorPagoGlobal = document.createElement("div")
                            contenedorPagoGlobal.classList.add("plaza_enlacesDePago_obtenerPago_contenedorPagoGlobal")
                            contenedorPagoGlobal.setAttribute("pasarelaZonaDePago", "enlaceDePago")

                            const contenedorPago = document.createElement("div")
                            contenedorPago.classList.add("plaza_enlacesDePago_obtenerPago_contenedor")

                            const tituloPago = document.createElement("div")
                            tituloPago.classList.add("plaza_enlacesDePago_obtenerPago_informacionPago")
                            tituloPago.classList.add("negrita")
                            tituloPago.innerText = "Detalles del pago"
                            contenedorPago.appendChild(tituloPago)

                            const informacionPago = document.createElement("div")
                            informacionPago.classList.add("plaza_enlacesDePago_obtenerPago_informacionPago")
                            informacionPago.innerText = `Aquí tíenes los detalles del pago. En total el pago tiene una suma total de ${detallesPagoParcial.cantidadParcial}$. De este total, ${detallesPagoParcial.impuestosParciales}$ son impuestos y ${detallesPagoParcial.netoParcial}$ es el neto de este pago.`
                            contenedorPago.appendChild(informacionPago)

                            for (const [totalIDV, valorTotal] of Object.entries(detallesPagoParcial)) {

                                const totalUI = resolutorNombresTotalesParciales[totalIDV]

                                const contenedorTotal = document.createElement("div")
                                contenedorTotal.classList.add("enlaceDePAgo_contenedorTotal")

                                const tituloTotal = document.createElement("div")
                                tituloTotal.classList.add("enlaceDePago_tituloTotal")
                                tituloTotal.classList.add("negrita")
                                tituloTotal.innerText = totalUI
                                contenedorTotal.appendChild(tituloTotal)

                                const valorTotalUI = document.createElement("div")
                                valorTotalUI.classList.add("enlaceDePago_valorTotal")
                                valorTotalUI.innerText = valorTotal + "$"
                                contenedorTotal.appendChild(valorTotalUI)
                                contenedorPago.appendChild(contenedorTotal)

                            }

                            contenedorPagoGlobal.appendChild(contenedorPago)

                            const contenedorTotales = document.createElement("div")
                            contenedorTotales.classList.add("plaza_enlacesDePago_obtenerPago_contenedor")
                            contenedorTotales.setAttribute("pagoUID", pagoUID)

                            const tituloPagoReserva = document.createElement("div")
                            tituloPagoReserva.classList.add("plaza_enlacesDePago_obtenerPago_informacionPago")
                            tituloPagoReserva.classList.add("negrita")
                            tituloPagoReserva.innerText = "Detalles del total de la reserva"
                            contenedorTotales.appendChild(tituloPagoReserva)

                            const informacionPagoReserva = document.createElement("div")
                            informacionPagoReserva.classList.add("plaza_enlacesDePago_obtenerPago_informacionPago")
                            informacionPagoReserva.innerText = `Este apartado muestra el total del reserva a modo de informacion. Este apartado esta a modo de recordatorio. El detalle del pago esta en Detalles del pago en el apartado contiguo a este`
                            contenedorTotales.appendChild(informacionPagoReserva)

                            for (const [totalIDV, valorTotal] of Object.entries(totales)) {

                                const totalUI = resolutorNombresTotales[totalIDV]

                                const contenedorTotal = document.createElement("div")
                                contenedorTotal.classList.add("enlaceDePAgo_contenedorTotal")

                                const tituloTotal = document.createElement("div")
                                tituloTotal.classList.add("enlaceDePago_tituloTotal")
                                tituloTotal.classList.add("negrita")
                                tituloTotal.innerText = totalUI
                                contenedorTotal.appendChild(tituloTotal)

                                const valorTotalUI = document.createElement("div")
                                valorTotalUI.classList.add("enlaceDePago_tituloTotal")
                                valorTotalUI.innerText = valorTotal + "$"
                                contenedorTotal.appendChild(valorTotalUI)
                                if (valorTotal > 0) {
                                    contenedorTotales.appendChild(contenedorTotal)

                                }
                            }

                            contenedorPagoGlobal.appendChild(contenedorTotales)
                            marcoPago.appendChild(contenedorPagoGlobal)

                            marcoElastico.appendChild(marcoPago)
                            marcoElasticoRelativo.appendChild(marcoElastico)
                            contenedorEnlaceDePago.appendChild(marcoElasticoRelativo)

                            const destino = "section [componente=espacioPago]"
                            casaVitini.componentes.square.uiForm(destino)
                            try {

                                await casaVitini.componentes.square.crearSesionPago(instanciaUID);

                                await casaVitini.componentes.square.inyectorSquareJS(instanciaUID);

                                await casaVitini.componentes.square.inyectorMetodosPago(instanciaUID);

                                await casaVitini.componentes.square.inyectorFlujoPago(instanciaUID);
                            } catch (error) {
                                return casaVitini.ui.vistas.advertenciaInmersiva(error.message)
                            }
                        }
                    }
                },
                pagoConfirmado: (detalles) => {

                    const pagoUID = detalles?.pagoUID
                    const contenedorEnlaceDePago = document.querySelector("section")
                    contenedorEnlaceDePago.innerHTML = null

                    const tituloGlobal = document.createElement("div")
                    tituloGlobal.classList.add("titulo")
                    tituloGlobal.innerText = "Pago realizado correctamente"
                    contenedorEnlaceDePago.appendChild(tituloGlobal)

                    const marcoElasticoRelativo = document.createElement("div")
                    marcoElasticoRelativo.classList.add("marcoElasticoRelativo")

                    const marcoElastico = document.createElement("div")
                    marcoElastico.classList.add("marcoElastico")
                    marcoElastico.style.gap = "6px"
                    //   marcoElastico.style.alignItems = "flex-start"
                    // gap: 6px;
                    // align-items: flex-start;

                    const marcoPago = document.createElement("div")
                    marcoPago.classList.add("plaza_enlacesDePago_marcoPago")
                    marcoPago.setAttribute("espacio", "marcoPago")
                    marcoPago.setAttribute("componente", "espacioPago")

                    const info = document.createElement("p")
                    info.classList.add("pagoPorEnlace_info")
                    info.innerText = "Gracias por finalizar el proceso de pago. Si lo necesita puede ver en la parte inmediatamente inferior a este parrafo el codigo del pago por si lo necesita. El pago se ha asociado a su reserva."
                    marcoPago.appendChild(info)

                    const mensajeUI = document.createElement("p")
                    mensajeUI.classList.add("pagoPorEnlace_info")
                    mensajeUI.classList.add("negrita")
                    mensajeUI.setAttribute("componente", "mensajeError")
                    mensajeUI.innerText = "Identificador del pago: " + pagoUID
                    marcoPago.appendChild(mensajeUI)

                    marcoElastico.appendChild(marcoPago)


                    marcoElasticoRelativo.appendChild(marcoElastico)
                    contenedorEnlaceDePago.appendChild(marcoElasticoRelativo)

                },
                pantallaInicial: (metadatos) => {

                    const error = metadatos?.error
                    const codigo = metadatos?.codigo ? metadatos.codigo : ""


                    const contenedorEnlaceDePago = document.querySelector("section")


                    const tituloGlobal = document.createElement("div")
                    tituloGlobal.classList.add("titulo")
                    tituloGlobal.innerText = "Enlaces y codigos para realizar un pago"
                    contenedorEnlaceDePago.appendChild(tituloGlobal)

                    const marcoElasticoRelativo = document.createElement("div")
                    marcoElasticoRelativo.classList.add("marcoElasticoRelativo")

                    const marcoElastico = document.createElement("div")
                    marcoElastico.classList.add("marcoElastico")
                    marcoElastico.style.gap = "6px"
                    marcoElastico.style.alignItems = "flex-start"
                    // gap: 6px;
                    // align-items: flex-start;

                    const marcoPago = document.createElement("div")
                    marcoPago.classList.add("plaza_enlacesDePago_marcoPago")
                    marcoPago.setAttribute("espacio", "marcoPago")
                    marcoPago.setAttribute("componente", "espacioPago")

                    const info = document.createElement("p")
                    info.classList.add("pagoPorEnlace_info")
                    info.innerText = "En esta página puede realizar un pago con un codigo temporal asoaciado a su reserva. Si Casa Vitini le ha pasado un codigo temporal aleatorio para realizar un pago insertelo en el formulario de abajo para inicar el proceso de pago. Los enlaces caducan al cabo de un tiempo. Si tiene un enlaces de pago y tras revisar que lo ha escrito correctamente el sistema no encuentra el enlaces pueder que halla caducado"
                    marcoPago.appendChild(info)

                    if (error) {
                        const mensajeUI = document.createElement("p")
                        mensajeUI.classList.add("pagoPorEnlace_info")
                        mensajeUI.classList.add("negrita")
                        mensajeUI.setAttribute("componente", "mensajeError")
                        mensajeUI.innerText = error
                        marcoPago.appendChild(mensajeUI)

                    }

                    const campo = document.createElement("input")
                    campo.classList.add("plaza_enlacesDePago_campo")
                    campo.setAttribute("campo", "codigo")
                    campo.placeholder = "Inserte su codigo temporal"
                    campo.addEventListener("input", () => {

                        document.querySelector("[componente=mensajeError]")?.remove()
                    })
                    campo.value = codigo
                    marcoPago.appendChild(campo)

                    marcoElastico.appendChild(marcoPago)


                    const botonBuscar = document.createElement("div")
                    botonBuscar.classList.add("plaza_enlacesDePago_botonV1")
                    botonBuscar.innerText = "Comprobar codigo"
                    botonBuscar.addEventListener("click", async () => {
                        const selectorCampoCodigo = document.querySelector("[campo=codigo]")
                        const codigoEnviar = selectorCampoCodigo.value
                        if (codigoEnviar.length === 0) {
                            const error = "Escribe un codigo para empezar. No has escrito ningún codigo para comprobar."
                            return casaVitini.ui.vistas.advertenciaInmersiva(error)

                        }
                        const vista = "/pagos/" + codigoEnviar
                        const navegacion = {
                            vista: vista,
                            tipoOrigen: "menuNavegador"

                        }
                        return casaVitini.componentes.controladorVista(navegacion)
                    })
                    marcoElastico.appendChild(botonBuscar)




                    marcoElasticoRelativo.appendChild(marcoElastico)
                    contenedorEnlaceDePago.appendChild(marcoElasticoRelativo)

                }

            },
            conozcanos: {
                arranque: () => {
                    const sectionRenderizada = document.querySelector("main[instanciaUID]")
                    const instanciaUID = sectionRenderizada.getAttribute("instanciaUID")
  
                    document.querySelector("#uiLogo").style.filter = "invert(1)"
                    const header = document.querySelector("header")
                    header.style.maxWidth = "none"
                    header.style.position = "absolute"


                    const main = document.querySelector("main")
                    main.style.maxWidth = "100vw"



                    const metadatos = {
                        sectionUID: instanciaUID,
                        elementoScroll: "[contenedor=paralaje]"
                    }
                    casaVitini.componentes.controlLogoScroll(metadatos)


                }

            },
            instalaciones: {
                arranque: () => {
                    document.body.style.backgroundImage = 'url("/componentes/imagenes/transparente.png")';
                    document.body.style.paddingBottom = "20px"
                }
            },
            rol: {
                arranque: () => {
                    document.body.removeAttribute("style")
                }
            }
        },
    },
    componentes: {
        cambiarVista: (vistaMenu) => {

            if (vistaMenu.button === 0) { // 0 es el botón izquierdo, 1 es el botón central
                vistaMenu.preventDefault()
                vistaMenu.stopPropagation()
                const vista = vistaMenu.target.getAttribute("vista")
                const entrada = {
                    vista: vista,
                    tipoOrigen: "menuNavegador",
                    objetoOrigen: vistaMenu
                }
                return casaVitini.componentes.controladorVista(entrada)
            }
        },
        controladorVista: async (entrada) => {
            const objetoOrigen = entrada.objetoOrigen?.target
            if (objetoOrigen?.getAttribute("tipoMenu") === "volatil") {
                const zonaUI = objetoOrigen.getAttribute("zona")
                document.querySelectorAll("[tipoMenu=volatil]").forEach((menu) => {
                    menu.removeAttribute("style")
                })
                document
                    .querySelector("#navegadorResponsivo")
                    .querySelector(`[zona="${zonaUI}"]`)
                    .style.background = "rgba(0, 0, 0, 0.1)"

                const selectorMenuGlobalFlotanteRenderizado = document.querySelector("[componente=menuGlobalFlotante]")
                if (selectorMenuGlobalFlotanteRenderizado) {
                    selectorMenuGlobalFlotanteRenderizado.remove()
                }
            }
            // document.body.style.backgroundImage= "url(/componentes/imagenes/transparente.png)";
            //                    document.body.style.backgroundImage = 'url("/componentes/imagenes/playa.jpg")';
            

            document.querySelector("#uiLogo").removeAttribute("style")
            document.querySelector("body").removeAttribute("style")
            document.querySelector("header").removeAttribute("style")
            document.querySelector("main").removeAttribute("style")
            document.querySelector("#botonMenuResponsivo").removeAttribute("style")



            const instanciaUID = casaVitini.componentes.codigoFechaInstancia()
            casaVitini.componentes.limpiarAdvertenciasInmersivas()
            document.removeEventListener("click", casaVitini.componentes.ocultarElementos)

            const selectorAdvertenciasInmersivas = [...document.querySelectorAll("[componente=errorUI], [componente=menuVolatil]")]
            selectorAdvertenciasInmersivas.map((advertenciaInmersivaRenderizada) => {
                advertenciaInmersivaRenderizada.remove()
            })

            const selectorCalendarioRenderizados = [...document.querySelectorAll("[contenedor=calendario]")]
            selectorCalendarioRenderizados.map((calendarioRenderizado) => {
                calendarioRenderizado.remove()
            })

            let tipoEntrada = typeof entrada
            let vista

            if (tipoEntrada === "string") {
                vista = entrada
            }
            let tipoOrigen;
            let controladorHistorial;

            if (tipoEntrada === "object") {
                vista = entrada.vista === "/" ? "portada" : entrada.vista
                tipoOrigen = entrada.tipoOrigen
                controladorHistorial = entrada.controladorHistorial
                etapa = entrada.etapa
                // Zona = Entrada.Zona
            }
            let vistaActual = document.getElementById("uiNavegacion").getAttribute("vistaActual")
            let vistaAnterior = document.getElementById("uiNavegacion").getAttribute("vistaActual")
            let tipoVista = document.querySelector("section:not([estado=obsoleto])")?.getAttribute("tipoVista")
            let url = window.location.pathname;

            url = url.split("/")
            delete url[0]
            delete url[1]
            delete url[2]
            url = url.filter((url) => url)


            const main = document.querySelector('main');
            main.setAttribute("instanciaUID", instanciaUID)
            main.innerHTML = null
            main.removeAttribute("style")
            main.style.position = "absolute"
            main.style.height = "100%"
            main.style.justifyContent = "center"
            main.style.alignItems = "center"
            //seccion.classList.add("difuminadoFondo")

            const spinnerSimple = casaVitini.componentes.spinnerSimple()
            main.appendChild(spinnerSimple)

            if (vista === "portada") {
                document.querySelectorAll("[zona]").forEach(zona => {
                    zona.removeAttribute("style")
                });
            }


            const controladorResposnivo = window.matchMedia("(max-width: 720px)").matches
            if (controladorResposnivo) {
                window.removeEventListener("touchstart", casaVitini.componentes.restaurarMenu)
                window.removeEventListener("click", casaVitini.componentes.restaurarMenu)
                window.removeEventListener("scroll", casaVitini.componentes.restaurarMenu)
                document.getElementById("navegadorResponsivo").style.display = ""
            }

            const transaccion = {
                zona: "componentes/cambiarVista",
                vista: vista
            };


            const respuestaServidor = await casaVitini.componentes.servidor(transaccion)
            if (respuestaServidor?.error) {
                document.querySelector("#uiLogo").removeAttribute("style")
                document.querySelector("#botonMenuResponsivo").removeAttribute("style")
                document.body.removeAttribute("style")
                document.querySelectorAll("[zona]").forEach(zona => {
                    zona.removeAttribute("style")
                });
                const seccionDestinoRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
                if (!seccionDestinoRenderizada) {
                    return
                }

                const marcoError = document.createElement("div")
                marcoError.classList.add("plaza_marcoError_seccion")
                marcoError.innerText = respuestaServidor.error
                seccionDestinoRenderizada.innerHTML = null
                seccionDestinoRenderizada.appendChild(marcoError)
            }
            if (respuestaServidor?.ok) {
                await casaVitini.componentes.controladorEstadoIDX()
                //await new Promise(resolve => setTimeout(resolve, 2000));

                const seccionDestinoRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
                if (!seccionDestinoRenderizada) {
                    return
                }

                const vistaHtml = respuestaServidor?.ok
                //let constructorSeccion = document.createElement("section")
                //constructorSeccion.insertAdjacentHTML("afterbegin", vistaHtml);
                //constructorSeccion.style.scale = "0";

                seccionDestinoRenderizada.innerHTML = vistaHtml
                seccionDestinoRenderizada.removeAttribute("style")
                seccionDestinoRenderizada.removeAttribute("class")

                document.body.removeAttribute("style")
                document.body.removeAttribute("class")


                let arranqueVistaPublica = seccionDestinoRenderizada?.querySelector("arranque")?.getAttribute("publico")
                let arranqueVistaAdministrativa = seccionDestinoRenderizada?.querySelector("arranque")?.getAttribute("administracion")
                // document.body.appendChild(constructorSeccion)
                // let vistaDestino = document.querySelector("section:not([estado=obsoleto])")
                // vistaDestino.style.scale = "1";
                let url = window.location.pathname;
                url = url.split("/")
                url = url.filter(url => url);

                let urlVista = respuestaServidor["url"]

                let titulo
                let estado = {}

                // Vista = Vista.charAt(0).toUpperCase() + Vista.slice(1);
                urlVista = urlVista === "/portada" ? "/" : urlVista;
                urlVista = decodeURIComponent(urlVista);
                titulo = 'Casa Vitini | ' + vista;

                let controladorUrl;

                if (vistaActual?.toLowerCase() === vista?.toLowerCase()) {
                    controladorUrl = "soloActualiza"
                }
                document.getElementById("uiNavegacion").setAttribute("vistaActual", vista)
                vistaActual = vista === "portada" ? "" : vista;
                // si la vista actual, tiene un vistaTipo=paginada, entonces se guarda en el historial otra cosa
                estado = {
                    zona: vistaActual,
                    estadoInternoZona: "estado",
                    tipoCambio: "total"
                }

                let fondo
                let primeraRama = vista.split("/")
                primeraRama = primeraRama.filter(n => n)

                const zona = respuestaServidor?.zona
                const controladorZona = {
                    zona: zona
                }
                casaVitini.componentes.controladorNavegacion(controladorZona)

                if (tipoOrigen === "menuNavegador" && !controladorUrl) {
                    window.history.pushState(estado, titulo, urlVista);
                }

                if (controladorUrl === "soloActualiza") {
                    window.history.replaceState(estado, titulo, urlVista);
                }

                if (!tipoOrigen && !controladorUrl) {
                    window.history.replaceState(estado, titulo, urlVista);
                }

                if (tipoOrigen === "historial" && !controladorUrl) {
                    //  window.history.replaceState(Estado, Titulo, URLVista);
                    //  

                }

                if (arranqueVistaPublica) {
                    if (eval("typeof " + "casaVitini?.ui?.vistas?." + arranqueVistaPublica + "") === "function") {
                        arranqueVistaPublica = "casaVitini.ui.vistas." + arranqueVistaPublica + "()"
                        return eval(arranqueVistaPublica)
                    } else {
                        const info = "No existe el arranque de la vista"
                        casaVitini.ui.vistas.advertenciaInmersiva(info)
                    }
                }

                if (arranqueVistaAdministrativa) {
                    if (eval("typeof " + "casaVitini?.administracion?." + arranqueVistaAdministrativa + "") === "function") {
                        arranqueVistaAdministrativa = "casaVitini?.administracion?." + arranqueVistaAdministrativa + "()"
                        return eval(arranqueVistaAdministrativa)
                    } else {
                        const info = "No existe el arranque de la vista"
                        casaVitini.ui.vistas.advertenciaInmersiva(info)
                    }
                }
            }

        },
        controlLogoScroll: (metadatos) => {

            const sectionUID = metadatos.sectionUID
            const elementoScroll = metadatos.elementoScroll

            if (!sectionUID) {
                const mensaje = "Falta el sectionUID para determinar si el evento debe de crearse o eliminarse"
                return casaVitini.ui.vistas.advertenciaInmersiva(mensaje)
            }

            console.log("metadatos", metadatos)
            const elemento = document.querySelector(`[instanciaUID="${sectionUID}"] ${elementoScroll}`)
            console.log("elemento", elemento)

            if (!elemento) {
                document.querySelector(`[instanciaUID="${sectionUID}"] ${elementoScroll}`).removeEventListener("scroll", controladorEvento)
                return
            }
            const logo = document.querySelector("[componente=logoCasaVitini]")

            const controladorEvento = (e) => {
                e.stopPropagation()
                const alturaScroll = e.target.scrollTop
                console.log("alturaScroll", alturaScroll)
                if (alturaScroll > 10) {
                    logo.style.opacity = "0"
                    logo.style.pointerEvents = "none"

                } else {
                    logo.style.opacity = "1"
                    logo.style.pointerEvents = "all"
                }
            }
            elemento.addEventListener("scroll", controladorEvento)

        },
        navegacion: async (e) => {
            let zona = (history.state)?.zona
            const tipoCambio = (history.state)?.tipoCambio
            const urlActual = window.location.pathname;

            if (tipoCambio === "total") {
                zona = zona ? zona : "portada"
                const entrada = {
                    vista: zona,
                    tipoOrigen: "historial",
                    controladorHistorial: "origen"
                }
                return casaVitini.componentes.controladorVista(entrada)
            }
            if (tipoCambio === "parcial") {
                const conpontenteExistente = (history.state)?.conpontenteExistente
                const funcionPersonalizada = (history.state)?.funcionPersonalizada
                const datosPaginacion = (history.state)?.datosPaginacion
                const entrada = {
                    zona: zona,
                    conpontenteExistente: conpontenteExistente,
                    funcionPersonalizada: funcionPersonalizada,
                    datosPaginacion: datosPaginacion
                }
                return casaVitini.componentes.controladorCambioPersonalziado(entrada)
            }
        },
        temporizador: null,
        servidor: async (transaccion) => {
            const puerto = '/puerto';
            const peticion = {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(transaccion)
            };
            try {

                const servidor = await fetch(puerto, peticion);
                const respuestaServidor = await servidor.json();
                if (!respuestaServidor) {
                    return casaVitini.componentes.errorUI()
                }
                if (respuestaServidor.tipo === "IDX") {
                    return casaVitini.componentes.loginUI()
                }
                if (respuestaServidor.tipo === "ROL") {
                    const mensaje = "Tu VitiniID no esta autorizado a realizar esta operacíon."
                    casaVitini.ui.vistas.advertenciaInmersiva(mensaje)
                    return
                }

                if (respuestaServidor?.error === "noExisteLaVista") {
                    const seccion = document.querySelector("section")
                    if (seccion) {
                        seccion.innerHTML = null
                    }
                    casaVitini.componentes.limpiarAdvertenciasInmersivas()
                    const info = {
                        titulo: "Casa Vitini no encuentra la página que buscas",
                        descripcion: "Revista la URL en el navegador por que Casa Vitini no encuentra el recurso que solicitas"
                    }
                    return casaVitini.componentes.mensajeSimple(info)
                }
                if (respuestaServidor) {
                    document.querySelector(`[componente=contenedorError]`)?.remove()
                }
                return respuestaServidor
            } catch (error) {

                if (error.name === 'AbortError') {

                }

                if (error instanceof TypeError) {
                    return casaVitini.componentes.errorUI()
                }
            }
        },
        errorUI: () => {
            const selectorContenedorError = document.querySelector(`[componente=contenedorError]`)
            if (selectorContenedorError) {
                return
            }
            const instanciaUID = casaVitini.componentes.codigoFechaInstancia()
            const directorioDelError = window.location.pathname


            const reintento = setInterval(async () => {
                const directorioActual = window.location.pathname
                if (directorioDelError !== directorioActual) {

                    clearInterval(reintento); // Detener la ejecución
                    return
                }
                // Tu lógica aquí
                const entrada = {
                    vista: directorioDelError,
                    tipoOrigen: "menuNavegador"
                }
                await casaVitini.componentes.controladorVista(entrada)
                const selectorContenedorError = document.querySelector(`[componente=contenedorError]`)
                if (!selectorContenedorError) {
                    clearInterval(reintento); // Detener la ejecución
                }
            }, 5000);


            const advertenciaInmersivaIU = document.createElement("div")
            advertenciaInmersivaIU.setAttribute("class", "advertenciaInmersiva")
            advertenciaInmersivaIU.setAttribute("componente", "contenedorError")

            const contenedorAdvertenciaInmersiva = document.createElement("div")
            contenedorAdvertenciaInmersiva.classList.add("contenedorAdvertencaiInmersiva")

            const contenidoAdvertenciaInmersiva = document.createElement("div")
            contenidoAdvertenciaInmersiva.classList.add("contenidoAdvertenciaInmersiva")
            contenidoAdvertenciaInmersiva.setAttribute("espacio", "formularioCrearEnlaceDePago")

            const contenedorError = document.createElement("div")
            contenedorError.classList.add("casaVitini_componentes_contenedorError")
            contenedorError.setAttribute("instanciaUIDError", instanciaUID)


            const tituloError = document.createElement("div")
            tituloError.classList.add("negrita")
            tituloError.innerText = "No se puede establecer conexion con el servidor. Se reintentara cada 5 segundos..."
            contenedorError.appendChild(tituloError)

            const mensajeDelError = document.createElement("div")
            mensajeDelError.classList.add("casaVitini.componentes.menajeDelError")
            mensajeDelError.innerText = "Se ha producido un error en la red y no se ha podido comunicar con el servidor, si es por una causa circunstancial de la red reintentalo y deberia funcionar. Comprueba que tienes acceso a la red. Por ejemplo comprueba si puedes acceder a google.com o hacer un ping a google.com o a otros sitios conocidos. Si tienes acceso a sitios conocidos es probable que el problema este en el servidor de Casa Vitini"
            contenedorError.appendChild(mensajeDelError)


            contenidoAdvertenciaInmersiva.appendChild(contenedorError)
            contenedorAdvertenciaInmersiva.appendChild(contenidoAdvertenciaInmersiva)
            advertenciaInmersivaIU.appendChild(contenedorAdvertenciaInmersiva)


            const seccion = document.querySelector("section")
            seccion.removeAttribute("instanciaUID")
            seccion.style.position = "absolute"
            seccion.style.justifyContent = "center"
            seccion.style.height = "100%"
            seccion.innerHTML = null
            document.body.appendChild(advertenciaInmersivaIU)


        },
        arranque: async () => {
            document.getElementById("botonMenuResponsivo").addEventListener("click", casaVitini.componentes.menuResponsivo)
            window.addEventListener("resize", casaVitini.componentes.limpiarTodoElementoVolatil)
            //  casaVitini.componentes.controlGlobalScroll()

            const vistas = document.querySelectorAll("[vista]")
            for (const vistaMenu of vistas) {
                vistaMenu.addEventListener("click", casaVitini.componentes.cambiarVista)
            }
            await casaVitini.componentes.controladorEstadoIDX()


            document.querySelector("#navegadorResponsivo").style.opacity = "1"
            const url = window.location.pathname;
            if (url === "/") {
                return casaVitini.componentes.controladorVista("portada")
            } else {
                return casaVitini.componentes.controladorVista(url)
            }
        },
        controlGlobalScroll: () => {
            const selectorBloqueMenusGlobales = document.querySelector("[componente=marcoNavegacion]")
            const selectorLogo = document.querySelector("[componente=logoCasaVitini]")

            document.addEventListener('scroll', () => {
                const selectorStyle = selectorLogo.style.filter
                const mediaQuery = window.matchMedia('(max-width: 850px)');
                document.querySelector("#navegadorResponsivo").style.removeProperty("display")

                if (window.scrollY === 0) {
                    selectorBloqueMenusGlobales.classList.remove('globa_marcoNavegacion_desenfoque');
                    if (mediaQuery.matches && selectorStyle === "invert(0)") {
                        selectorLogo.style.filter = "invert(1)"
                    }

                } else {
                    if (mediaQuery.matches && selectorStyle === "invert(1)") {
                        selectorLogo.style.filter = "invert(0)"
                    }

                    selectorBloqueMenusGlobales.classList.add('globa_marcoNavegacion_desenfoque');
                }
            })
        },
        controladorCambioPersonalziado: (metadatos) => {
            const componenteExistente = metadatos.conpontenteExistente
            const componente = document.querySelector("[componente=" + componenteExistente + "]")
            if (componente) {
                const funcionPersonalizada = metadatos.funcionPersonalizada

                if (eval("typeof " + funcionPersonalizada) === "function") {
                    let datosPaginacion = metadatos.datosPaginacion
                    datosPaginacion = JSON.stringify(datosPaginacion);

                    return eval(funcionPersonalizada + "(" + datosPaginacion + ");")
                }
            } else {
                const zona = metadatos.zona

                const entrada = {
                    vista: zona,
                    tipoOrigen: "historial",
                    controladorHistorial: "origen"
                }
                return casaVitini.componentes.controladorVista(entrada)
            }
        },
        menuResponsivo: () => {
            const selectorMenuFlotanteRenderizado = document.querySelector("[componente=menuGlobalFlotante]")
            if (selectorMenuFlotanteRenderizado) {
                selectorMenuFlotanteRenderizado.remove()
            } else {
                const codigoMenuGlobal = document.querySelector("#navegadorResponsivo").innerHTML
                const menuGlobalFlotante = document.createElement("div")
                menuGlobalFlotante.classList.add("uiNavegacion")
                menuGlobalFlotante.setAttribute("componente", "menuGlobalFlotante")
                menuGlobalFlotante.classList.add("uiMenuGlobalResponsivo")
                menuGlobalFlotante.innerHTML = codigoMenuGlobal
                menuGlobalFlotante.querySelectorAll("[vista]").forEach((menu) => {
                    menu.addEventListener("click", casaVitini.componentes.cambiarVista)
                })
                document.body.appendChild(menuGlobalFlotante)
                document.addEventListener("click", casaVitini.componentes.ocultaMenuGlobalFlotante)
                window.addEventListener("resize", casaVitini.componentes.ocultaMenuGlobalFlotante)
                window.addEventListener("scroll", casaVitini.componentes.ocultaMenuGlobalFlotante)

            }
        },
        ocultaMenuGlobalFlotante: (e) => {
            const origen = e.target?.id

            if (origen !== "botonMenuResponsivo") {
                const selectorMenuFlotanteRenderizado = document.querySelector("[componente=menuGlobalFlotante]")
                selectorMenuFlotanteRenderizado?.remove()
                document.removeEventListener("click", casaVitini.componentes.ocultaMenuGlobalFlotante)
                window.removeEventListener("resize", casaVitini.componentes.ocultaMenuGlobalFlotante)
                window.removeEventListener("scroll", casaVitini.componentes.ocultaMenuGlobalFlotante)


            }
        },
        restaurarMenu: (componente) => {
            componente.stopPropagation()
            //componente.preventDefault();
            let componenteID = componente.target

            if (componenteID.id !== "navegadorResponsivo" && componenteID.id !== "botonMenuResponsivo" && !componenteID.getAttribute("vista") && componenteID?.getAttribute("class") !== "contenedorMenu") {
                casaVitini.componentes.menuResponsivo()
            }
        },
        controladorNavegacion: (navegacion) => {



            const panelNavegacion = document.getElementById("navegadorResponsivo")
            const menuRenderizado = panelNavegacion.getAttribute("menuID")
            const tipoBarraNavegacion = navegacion.tipo

            const limpiarMenus = () => {
                document.querySelectorAll("[tipoMenu=volatil]").forEach((menuVolatil) => {
                    menuVolatil.remove()
                })
            }



            if (tipoBarraNavegacion === "panelControl" && menuRenderizado !== tipoBarraNavegacion) {
                panelNavegacion.setAttribute("menuID", tipoBarraNavegacion)
                limpiarMenus();
                const bloqueAdministracion = document.createElement("a")
                bloqueAdministracion.setAttribute("href", "/administracion")
                bloqueAdministracion.setAttribute("class", "uiCategoria")
                bloqueAdministracion.setAttribute("tipoMenu", "volatil")
                bloqueAdministracion.setAttribute("vista", "/administracion")
                bloqueAdministracion.setAttribute("zona", "administracion")
                bloqueAdministracion.addEventListener("click", casaVitini.componentes.cambiarVista)
                bloqueAdministracion.innerText = "Administración"

                const bloqueSituacion = document.createElement("a")
                bloqueSituacion.setAttribute("href", "/administracion/situacion")
                bloqueSituacion.setAttribute("class", "uiCategoria")
                bloqueSituacion.setAttribute("tipoMenu", "volatil")
                bloqueSituacion.setAttribute("vista", "/administracion/situacion")
                bloqueSituacion.setAttribute("zona", "situacion")
                bloqueSituacion.addEventListener("click", casaVitini.componentes.cambiarVista)
                bloqueSituacion.innerText = "Situación"


                const bloqueCalendario = document.createElement("a")
                bloqueCalendario.setAttribute("href", "/administracion/calendario")
                bloqueCalendario.setAttribute("class", "uiCategoria")
                bloqueCalendario.setAttribute("tipoMenu", "volatil")
                bloqueCalendario.setAttribute("vista", "/administracion/calendario")
                bloqueCalendario.setAttribute("zona", "calendario")
                bloqueCalendario.addEventListener("click", casaVitini.componentes.cambiarVista)
                bloqueCalendario.innerText = "Calendario"


                const bloqueReservas = document.createElement("a")
                bloqueReservas.setAttribute("href", "/administracion/reservas")
                bloqueReservas.setAttribute("class", "uiCategoria")
                bloqueReservas.setAttribute("tipoMenu", "volatil")
                bloqueReservas.setAttribute("vista", "/administracion/reservas")
                bloqueReservas.setAttribute("zona", "reservas")
                bloqueReservas.addEventListener("click", casaVitini.componentes.cambiarVista)
                bloqueReservas.innerText = "Reservas"

                const bloqueClientes = document.createElement("a")
                bloqueClientes.setAttribute("href", "/administracion/clientes")
                bloqueClientes.setAttribute("class", "uiCategoria")
                bloqueClientes.setAttribute("tipoMenu", "volatil")
                bloqueClientes.setAttribute("vista", "/administracion/clientes")
                bloqueClientes.setAttribute("zona", "clientes")
                bloqueClientes.addEventListener("click", casaVitini.componentes.cambiarVista)
                bloqueClientes.innerText = "Clientes"

                const bloqueusuario = document.createElement("a")
                bloqueusuario.setAttribute("href", "/micasa")
                bloqueusuario.setAttribute("class", "uiCategoria")
                bloqueusuario.setAttribute("bloqueID", "usuario")
                bloqueusuario.setAttribute("tipoMenu", "volatil")
                bloqueusuario.setAttribute("vista", "/micasa")
                bloqueusuario.setAttribute("zona", "micasa")
                bloqueusuario.addEventListener("click", casaVitini.componentes.cambiarVista)
                bloqueusuario.innerText = "@" + navegacion.usuario

                panelNavegacion.appendChild(bloqueAdministracion);
                panelNavegacion.appendChild(bloqueSituacion);
                panelNavegacion.appendChild(bloqueCalendario);
                panelNavegacion.appendChild(bloqueReservas);
                panelNavegacion.appendChild(bloqueClientes);
                panelNavegacion.appendChild(bloqueusuario);

                panelNavegacion.style['-webkit-backdrop-filter'] = 'blur(51px)';
            }

            if (tipoBarraNavegacion === "publico" && menuRenderizado !== tipoBarraNavegacion) {
                panelNavegacion.setAttribute("menuID", tipoBarraNavegacion)
                limpiarMenus();

                const bloqueAlojamiento = document.createElement("a")
                bloqueAlojamiento.setAttribute("href", "/alojamiento")
                bloqueAlojamiento.setAttribute("class", "uiCategoria")
                bloqueAlojamiento.setAttribute("tipoMenu", "volatil")
                bloqueAlojamiento.setAttribute("vista", "/alojamiento")
                bloqueAlojamiento.setAttribute("zona", "alojamiento")
                bloqueAlojamiento.innerText = "Alojamiento"
                bloqueAlojamiento.addEventListener("click", casaVitini.componentes.cambiarVista)

                const bloqueReservas = document.createElement("a")
                bloqueReservas.setAttribute("href", "/reservas")
                bloqueReservas.setAttribute("class", "uiCategoria")
                bloqueReservas.setAttribute("tipoMenu", "volatil")
                bloqueReservas.setAttribute("vista", "/reservas")
                bloqueReservas.setAttribute("zona", "reservas")
                bloqueReservas.innerText = "Reservas"
                bloqueReservas.addEventListener("click", casaVitini.componentes.cambiarVista)

                const bloqueConozcanos = document.createElement("a")
                bloqueConozcanos.setAttribute("href", "/conozcanos")
                bloqueConozcanos.setAttribute("class", "uiCategoria")
                bloqueConozcanos.setAttribute("tipoMenu", "volatil")
                bloqueConozcanos.setAttribute("vista", "/conozcanos")
                bloqueConozcanos.setAttribute("zona", "conozcanos")
                bloqueConozcanos.addEventListener("click", casaVitini.componentes.cambiarVista)
                bloqueConozcanos.innerText = "Conózcanos"

                const bloqueInstalaciones = document.createElement("a")
                bloqueInstalaciones.setAttribute("href", "/instalaciones")
                bloqueInstalaciones.setAttribute("class", "uiCategoria")
                bloqueInstalaciones.setAttribute("tipoMenu", "volatil")
                bloqueInstalaciones.setAttribute("vista", "/instalaciones")
                bloqueInstalaciones.setAttribute("zona", "instalaciones")
                bloqueInstalaciones.addEventListener("click", casaVitini.componentes.cambiarVista)
                bloqueInstalaciones.innerText = "Instalaciones"

                const bloqueContacto = document.createElement("a")
                bloqueContacto.setAttribute("href", "/contacto")
                bloqueContacto.setAttribute("class", "uiCategoria")
                bloqueContacto.setAttribute("tipoMenu", "volatil")
                bloqueContacto.setAttribute("vista", "/contacto")
                bloqueContacto.setAttribute("zona", "contacto")
                bloqueContacto.addEventListener("click", casaVitini.componentes.cambiarVista)
                bloqueContacto.innerText = "Contacto"

                const bloqueusuario = document.createElement("a")
                bloqueusuario.setAttribute("href", "/micasa")
                bloqueusuario.setAttribute("class", "uiCategoria")
                bloqueusuario.setAttribute("bloqueID", "usuario")
                bloqueusuario.setAttribute("tipoMenu", "volatil")
                bloqueusuario.setAttribute("vista", "/micasa")
                bloqueusuario.setAttribute("zona", "micasa")
                bloqueusuario.addEventListener("click", casaVitini.componentes.cambiarVista)
                bloqueusuario.innerText = navegacion.usuario ? "@" + navegacion.usuario : "MiCasa"

                panelNavegacion.appendChild(bloqueAlojamiento);
                panelNavegacion.appendChild(bloqueConozcanos);
                panelNavegacion.appendChild(bloqueInstalaciones);
                panelNavegacion.appendChild(bloqueContacto);
                panelNavegacion.appendChild(bloqueusuario);

                panelNavegacion.style['-webkit-backdrop-filter'] = 'blur(51px)';

            }

            if (navegacion.estado === "conectado") {
                document.querySelector("[bloqueID=usuario]").innerText = "@" + navegacion.usuario

            }
            if (navegacion.estado === "desconectado") {
                document.querySelector("[bloqueID=usuario]").innerText = "MiCasa"
            }
            if (navegacion.zona && document.querySelector("[zona=" + navegacion.zona + "]")) {
                document.querySelectorAll("[zona]").forEach(zona => {
                    zona.removeAttribute("style")
                });
                document.querySelector("[zona=" + navegacion.zona + "]").style.background = "rgba(0, 0, 0, 0.6)"
                document.querySelector("[zona=" + navegacion.zona + "]").style.color = "white"

            }
        },
        controladorEstadoIDX: async () => {

            const IDX = await casaVitini.IDX.estadoSession()

            const estado = IDX?.estado || null
            const rol = IDX?.rol
            if (estado === "desconectado" || !estado) {
                const navegacion = {
                    tipo: "publico",
                    estado: "desconectado"
                }
                casaVitini.componentes.controladorNavegacion(navegacion)
                delete casaVitini.administracion
            }
            if (estado === "conectado" && (rol === "administrador" || rol === "empleado")) {
                const navegacion = {
                    tipo: "panelControl",
                    usuario: IDX.usuario,
                    rol: rol,
                    estado: estado
                }
                casaVitini.componentes.controladorNavegacion(navegacion)
                await casaVitini.componentes.controlCodigoAdministracion()
            }

            if (estado === "conectado" && rol === "cliente") {
                const navegacion = {
                    tipo: "publico",
                    usuario: IDX.usuario,
                    rol: rol,
                    estado: estado
                }
                casaVitini.componentes.controladorNavegacion(navegacion)
                delete casaVitini.administracion
            }
        },
        controlCodigoAdministracion: async () => {
            const convertirCadenasEnFunciones = (objeto) => {
                for (const clave in objeto) {
                    if (typeof objeto[clave] === "string") {
                        try {
                            const functionConstructor = new Function(`return ${objeto[clave]}`);
                            objeto[clave] = functionConstructor();
                        } catch (error) {
                            // Si no se puede analizar como una función, deja la cadena tal como está
                        }
                    } else if (typeof objeto[clave] === "object") {
                        // Si la propiedad es un objeto, llama recursivamente a la función
                        convertirCadenasEnFunciones(objeto[clave]);
                    }
                }
            }
            if (!casaVitini.administracion) {
                const transaccion = {
                    zona: "administracion/componentes/UI"
                }

                const respuestaServidor = await casaVitini.componentes.servidor(transaccion)

                if (respuestaServidor?.error) {
                    casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
                }

                if (respuestaServidor?.tipo === "IDX") {
                    delete casaVitini["administracion"]
                }
                if (respuestaServidor?.ok) {
                    const JS = JSON.parse(respuestaServidor.ok)
                    convertirCadenasEnFunciones(JS);
                    casaVitini["administracion"] = JS
                }
            }

        },
        constructorCalendarioNuevo: (metadatos) => {
            try {
                const almacenamientoVolatilUID = metadatos.almacenamientoCalendarioID
                if (!almacenamientoVolatilUID) {
                    const error = "El constructor del calendario, necesita un nombre para el almacenamiento volatil"
                    throw new Error(error)
                }
                const tipoFecha = metadatos.tipoFecha
                if (!tipoFecha) {
                    const error = "El constructor del calendario, necesita un tipoFecha, ya sea entrada o salida"
                    throw new Error(error)
                }
                const calendarioIO = metadatos.calendarioIO
                if (!calendarioIO) {
                    const error = "El constructor del calendario, necesita un calendarioIO, ya sea entrada o salida"
                    throw new Error(error)
                }
                const perfilMes = metadatos.perfilMes
                if (!perfilMes) {
                    const error = "El constructor del calendario, necesita un perfilMes, consulte los perfiles en contructorMes"
                    throw new Error(error)
                }
                const mensajeInfo = metadatos.mensajeInfo
                if (!mensajeInfo) {
                    const error = "El constructor del calendario, necesita un mensajeInfo, para informar de para que es este calendario"
                    throw new Error(error)
                }
                const alturaDinamica = metadatos.alturaDinamica
                if (!alturaDinamica) {
                    const error = "El contructor del calendario necesita una altura dinamica para colora el contenedor del calendario"
                    throw new Error(error)
                }
                const instanciaUID = metadatos.instanciaUID
                if (!instanciaUID) {
                    const error = "El contructor del calendario necesita una instanciaUID para el contenedor del calendario"
                    throw new Error(error)
                }
                const metodoSelectorDia = metadatos.metodoSelectorDia
                if (!metodoSelectorDia) {
                    const error = "El contructor del calendario necesita un metodoSelectorDia para el contenedor del calendario"
                    throw new Error(error)
                } else {
                    try {
                        eval(metodoSelectorDia)
                    } catch (errorCapturado) {
                        const error = "El metodoSelectorDia hace refencia a nada, revisa la direcion del arbol del objeto: " + errorCapturado.message
                        throw new Error(error)
                    }
                }
                const seleccionableDiaLimite = metadatos.seleccionableDiaLimite

                const calendario = document.createElement("div")
                calendario.setAttribute("class", "calendarioNuevo")
                //calendario.setAttribute("campo", "calendario")
                calendario.setAttribute("contenedor", "calendario")
                calendario.setAttribute("componente", "marcoCalendario")
                calendario.setAttribute("almacenamientoCalendarioID", almacenamientoVolatilUID)
                calendario.setAttribute("tipoCalendario", tipoFecha)
                calendario.setAttribute("calendarioIO", calendarioIO)
                calendario.setAttribute("metodoSelectorDia", metodoSelectorDia)
                if (seleccionableDiaLimite === "si") {
                    calendario.setAttribute("seleccionableDiaLimite", seleccionableDiaLimite)
                }
                calendario.setAttribute("elemento", "flotante")
                calendario.setAttribute("perfilMes", perfilMes)
                calendario.setAttribute("IO", calendarioIO)
                calendario.style.display = "none"

                const cartelInfoCalendarioEstado = document.createElement("div")
                cartelInfoCalendarioEstado.setAttribute("class", "cartelInfoCalendarioEstado")
                cartelInfoCalendarioEstado.setAttribute("componente", "infoCalendario")
                cartelInfoCalendarioEstado.setAttribute("campo", "calendario")
                cartelInfoCalendarioEstado.innerText = mensajeInfo

                const navegacionMes = document.createElement("nav")
                navegacionMes.setAttribute("class", "navegacionMes")

                calendario.appendChild(navegacionMes)
                calendario.appendChild(cartelInfoCalendarioEstado)

                const botonNavegacionMesAtras = document.createElement("div")
                botonNavegacionMesAtras.setAttribute("class", "botonNavegacionMes")
                botonNavegacionMesAtras.setAttribute("id", "botonAtras")
                botonNavegacionMesAtras.setAttribute("sentido", "atras")

                botonNavegacionMesAtras.innerText = "Atras"
                botonNavegacionMesAtras.addEventListener("click", casaVitini.componentes.navegacionCalendarioNuevo)
                navegacionMes.appendChild(botonNavegacionMesAtras)

                const navegacionMesReferencia = document.createElement("div")
                navegacionMesReferencia.setAttribute("id", "navegacionMesReferencia")
                navegacionMesReferencia.setAttribute("class", "navegacionMesReferencia")
                navegacionMesReferencia.setAttribute("componente", "mesReferencia")

                navegacionMes.appendChild(navegacionMesReferencia)

                const botonNavegacionMesAdelante = document.createElement("div")
                botonNavegacionMesAdelante.setAttribute("class", "botonNavegacionMes")
                botonNavegacionMesAdelante.setAttribute("id", "botonAdelante")

                botonNavegacionMesAdelante.innerText = "Adelante"
                botonNavegacionMesAdelante.setAttribute("sentido", "adelante")

                botonNavegacionMesAdelante.addEventListener("click", casaVitini.componentes.navegacionCalendarioNuevo)
                navegacionMes.appendChild(botonNavegacionMesAdelante)

                const marcoMes = document.createElement("ol")
                marcoMes.setAttribute("id", "marcoMes")
                marcoMes.setAttribute("class", "marcoMes")
                marcoMes.setAttribute("componente", "marcoMes")


                calendario.appendChild(marcoMes)

                const pilaDias = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"]
                for (const nombreDia of pilaDias) {
                    let diaSemana = document.createElement("li")
                    diaSemana.setAttribute("class", "nombreDia")
                    diaSemana.setAttribute("tipoNombreDia", "extendido")
                    diaSemana.innerText = nombreDia
                    marcoMes.appendChild(diaSemana)
                }

                const pilaDiasAbreviados = ["L", "M", "X", "J", "V", "S", "D"]
                for (const nombreDia of pilaDiasAbreviados) {
                    let diaSemana = document.createElement("li")
                    diaSemana.setAttribute("class", "nombreDia")
                    diaSemana.setAttribute("tipoNombreDia", "abreviado")
                    diaSemana.innerText = nombreDia
                    marcoMes.appendChild(diaSemana)
                }
                const seccion = document.querySelector("section:not([estado=obsoleto])")
                const bloqueCalendario = document.createElement("div")
                bloqueCalendario.setAttribute("class", "bloqueCalendarioNuevo")
                bloqueCalendario.setAttribute("instanciaUID", instanciaUID)
                bloqueCalendario.setAttribute("componente", "bloqueCalendario")
                bloqueCalendario.style.top = alturaDinamica + "px"

                const contenedoCalendarioIntermedio = document.createElement("div")
                contenedoCalendarioIntermedio.setAttribute("class", "componentes_calendario_contenedorCalentadioIntermedio")


                //bloqueCalendario.appendChild(cartelInfoCalendarioEstado)
                //bloqueCalendario.style.visibility = "hidden"
                const mensajeSpinner = "Construyendo calendario..."
                const spinner = casaVitini.componentes.spinner(mensajeSpinner)
                const contenedorCarga = document.createElement("div")
                contenedorCarga.classList.add("componente_calendario_contenedoCarga")
                contenedorCarga.setAttribute("contenedor", "contruyendoCalendario")
                contenedorCarga.setAttribute("elemento", "flotante")
                contenedorCarga.appendChild(spinner)

                contenedoCalendarioIntermedio.appendChild(calendario)
                contenedoCalendarioIntermedio.appendChild(contenedorCarga)
                bloqueCalendario.appendChild(contenedoCalendarioIntermedio)

                document.body.appendChild(bloqueCalendario)

            } catch (errorCapturado) {
                throw errorCapturado
            }

        },
        constructorCalendarioIncrustado: (metadatos) => {
            try {
                const almacenamientoVolatilUID = metadatos.almacenamientoCalendarioID
                if (!almacenamientoVolatilUID) {
                    const error = "El constructor del calendario, necesita un nombre para el almacenamiento volatil"
                    throw new Error(error)
                }
                const tipoFecha = metadatos.tipoFecha
                if (!tipoFecha) {
                    const error = "El constructor del calendario, necesita un tipoFecha, ya sea entrada o salida"
                    throw new Error(error)
                }
                const calendarioIO = metadatos.calendarioIO
                if (!calendarioIO) {
                    const error = "El constructor del calendario, necesita un calendarioIO, ya sea entrada o salida"
                    throw new Error(error)
                }
                const perfilMes = metadatos.perfilMes
                if (!perfilMes) {
                    const error = "El constructor del calendario, necesita un perfilMes, consulte los perfiles en contructorMes"
                    throw new Error(error)
                }
                const mensajeInfo = metadatos.mensajeInfo
                if (!mensajeInfo) {
                    const error = "El constructor del calendario, necesita un mensajeInfo, para informar de para que es este calendario"
                    throw new Error(error)
                }
                const alturaDinamica = metadatos.alturaDinamica
                if (!alturaDinamica) {
                    const error = "El contructor del calendario necesita una altura dinamica para colora el contenedor del calendario"
                    throw new Error(error)
                }
                const instanciaUID = metadatos.instanciaUID
                if (!instanciaUID) {
                    const error = "El contructor del calendario necesita una instanciaUID para el contenedor del calendario"
                    throw new Error(error)
                }
                const metodoSelectorDia = metadatos.metodoSelectorDia
                if (!metodoSelectorDia) {
                    const error = "El contructor del calendario necesita un metodoSelectorDia para el contenedor del calendario"
                    throw new Error(error)
                } else {
                    try {
                        eval(metodoSelectorDia)
                    } catch (errorCapturado) {
                        const error = "El metodoSelectorDia hace refencia a nada, revisa la direcion del arbol del objeto: " + errorCapturado.message
                        throw new Error(error)
                    }
                }

                const calendario = document.createElement("div")
                calendario.setAttribute("class", "calendarioIncrustado")
                calendario.setAttribute("campo", "calendario")
                calendario.setAttribute("contenedor", "calendario")
                calendario.setAttribute("componente", "marcoCalendario")
                calendario.setAttribute("almacenamientoCalendarioID", almacenamientoVolatilUID)
                calendario.setAttribute("tipoCalendario", tipoFecha)
                calendario.setAttribute("calendarioIO", calendarioIO)
                calendario.setAttribute("metodoSelectorDia", metodoSelectorDia)
                calendario.setAttribute("elemento", "flotante")
                calendario.setAttribute("perfilMes", perfilMes)
                calendario.setAttribute("IO", calendarioIO)
                calendario.style.display = "none"

                const cartelInfoCalendarioEstado = document.createElement("div")
                cartelInfoCalendarioEstado.setAttribute("class", "cartelInfoCalendarioEstado")
                cartelInfoCalendarioEstado.setAttribute("componente", "infoCalendario")
                cartelInfoCalendarioEstado.setAttribute("campo", "calendario")
                cartelInfoCalendarioEstado.innerText = mensajeInfo

                const navegacionMes = document.createElement("nav")
                navegacionMes.setAttribute("class", "navegacionMes")

                calendario.appendChild(navegacionMes)
                calendario.appendChild(cartelInfoCalendarioEstado)

                const botonNavegacionMesAtras = document.createElement("div")
                botonNavegacionMesAtras.setAttribute("class", "botonNavegacionMes")
                botonNavegacionMesAtras.setAttribute("id", "botonAtras")
                botonNavegacionMesAtras.setAttribute("sentido", "atras")

                botonNavegacionMesAtras.innerText = "Atras"
                botonNavegacionMesAtras.addEventListener("click", casaVitini.componentes.navegacionCalendarioNuevo)
                navegacionMes.appendChild(botonNavegacionMesAtras)

                const navegacionMesReferencia = document.createElement("div")
                navegacionMesReferencia.setAttribute("id", "navegacionMesReferencia")
                navegacionMesReferencia.setAttribute("class", "navegacionMesReferencia")
                navegacionMesReferencia.setAttribute("componente", "mesReferencia")

                navegacionMes.appendChild(navegacionMesReferencia)

                const botonNavegacionMesAdelante = document.createElement("div")
                botonNavegacionMesAdelante.setAttribute("class", "botonNavegacionMes")
                botonNavegacionMesAdelante.setAttribute("id", "botonAdelante")

                botonNavegacionMesAdelante.innerText = "Adelante"
                botonNavegacionMesAdelante.setAttribute("sentido", "adelante")

                botonNavegacionMesAdelante.addEventListener("click", casaVitini.componentes.navegacionCalendarioNuevo)
                navegacionMes.appendChild(botonNavegacionMesAdelante)

                const marcoMes = document.createElement("ol")
                marcoMes.setAttribute("id", "marcoMes")
                marcoMes.setAttribute("class", "marcoMes")
                marcoMes.setAttribute("componente", "marcoMes")


                calendario.appendChild(marcoMes)

                const pilaDias = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"]
                for (const nombreDia of pilaDias) {
                    let diaSemana = document.createElement("li")
                    diaSemana.setAttribute("class", "nombreDia")
                    diaSemana.setAttribute("tipoNombreDia", "extendido")
                    diaSemana.innerText = nombreDia
                    marcoMes.appendChild(diaSemana)
                }

                const pilaDiasAbreviados = ["L", "M", "X", "J", "V", "S", "D"]
                for (const nombreDia of pilaDiasAbreviados) {
                    let diaSemana = document.createElement("li")
                    diaSemana.setAttribute("class", "nombreDia")
                    diaSemana.setAttribute("tipoNombreDia", "abreviado")
                    diaSemana.innerText = nombreDia
                    marcoMes.appendChild(diaSemana)
                }
                const seccion = document.querySelector("section:not([estado=obsoleto])")
                const bloqueCalendario = document.createElement("div")
                bloqueCalendario.setAttribute("class", "bloqueCalendarioNuevo")
                //bloqueCalendario.setAttribute("instanciaUID", instanciaUID)
                bloqueCalendario.setAttribute("componente", "bloqueCalendario")
                bloqueCalendario.style.top = alturaDinamica + "px"

                const contenedoCalendarioIntermedio = document.createElement("div")
                contenedoCalendarioIntermedio.setAttribute("class", "componentes_calendarioIncrustado_contenedorCalentadioIntermedio")
                contenedoCalendarioIntermedio.setAttribute("instanciaUID", instanciaUID)


                //bloqueCalendario.appendChild(cartelInfoCalendarioEstado)
                //bloqueCalendario.style.visibility = "hidden"
                const mensajeSpinner = "Construyendo calendario..."
                const spinner = casaVitini.componentes.spinner(mensajeSpinner)
                const contenedorCarga = document.createElement("div")
                contenedorCarga.classList.add("componente_calendario_contenedoCarga_calendarioIncrustado")
                contenedorCarga.setAttribute("contenedor", "contruyendoCalendario")
                contenedorCarga.setAttribute("elemento", "flotante")
                contenedorCarga.appendChild(spinner)

                contenedoCalendarioIntermedio.appendChild(calendario)
                contenedoCalendarioIntermedio.appendChild(contenedorCarga)

                return contenedoCalendarioIntermedio
                //document.body.appendChild(bloqueCalendario)
            } catch (errorCapturado) {
                throw errorCapturado
            }


        },
        constructorMesNuevo: async (calendario) => {
            try {
                const instanciaUID = calendario.instanciaUID
                const selectorCalendarioRenderizado = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                const instanciaUID_procesoCambioMes = calendario.instanciaUID_procesoCambioMes
                const metodoSelectorDia = selectorCalendarioRenderizado.querySelector("[metodoSelectorDia]").getAttribute("metodoSelectorDia")
                if (!selectorCalendarioRenderizado) {
                    return
                }
                if (instanciaUID_procesoCambioMes) {
                    const selectorMarcoMesRenderizadoEnEspera = selectorCalendarioRenderizado
                        .querySelector(`[inctanciaUID_procesoCambioMes="${instanciaUID_procesoCambioMes}"]`)
                    if (!selectorMarcoMesRenderizadoEnEspera) {
                        return
                    }
                }
                const nombreMes = [
                    "Enero",
                    "Febrero",
                    "Marzo",
                    "Abrir",
                    "Mayo",
                    "Junio",
                    "Julio",
                    "Agost",
                    "Septiembre",
                    "Octubre",
                    "Noviembre",
                    "Diciembre"
                ]
                const nombreMesFinal = nombreMes[calendario.mes - 1]
                const indicadorMesAno = nombreMesFinal + " " + calendario.ano

                const navegacionMesReferencia = selectorCalendarioRenderizado.querySelector("[componente=mesReferencia]")

                navegacionMesReferencia.innerText = indicadorMesAno
                navegacionMesReferencia.setAttribute("ano", calendario.ano)
                navegacionMesReferencia.setAttribute("mes", calendario.mes)
                const infoCalendario = selectorCalendarioRenderizado.querySelector("[componente=infoCalendario]")

                const posicionDia1 = calendario.posicionDia1
                const numeroDiasPorMes = calendario.numeroDiasPorMes;
                console.log("calendario.dia", calendario.dia)
                const diaActual_decimal = parseInt(calendario.dia, 10)
                console.log("diaActual_decimal", diaActual_decimal)
                const marcoCalendario = selectorCalendarioRenderizado.querySelector("[componente=marcoCalendario]")
                const tipoCalendario = marcoCalendario?.getAttribute("IO")

                selectorCalendarioRenderizado.querySelectorAll("[dia]").forEach(diaObsoleto => {
                    diaObsoleto.remove()
                });
                const perfilMes = marcoCalendario?.getAttribute("perfilMes")

                const controlDiasCompletos = {
                    zona: "componentes/diasOcupadosTotalmentePorMes",
                    mes: Number(calendario.mes),
                    ano: Number(calendario.ano)
                }

                // const diasOcupadosResuelto = await casaVitini.componentes.servidor(controlDiasCompletos)
                // const detallesDiasOcupacion = diasOcupadosResuelto.ok.dias || {} 
                const detallesDiasOcupacion = {}

                let marcoMes
                if (instanciaUID_procesoCambioMes) {
                    marcoMes = selectorCalendarioRenderizado.querySelector(`[componente=marcoCalendario] [componente=marcoMes][inctanciaUID_procesoCambioMes="${instanciaUID_procesoCambioMes}"]`)
                    if (!marcoMes) {
                        return
                    }
                } else {
                    marcoMes = selectorCalendarioRenderizado.querySelector(`[componente=marcoCalendario] [componente=marcoMes]`)
                }

                if (perfilMes === "calendario_entrada_publico_sinPasado") {

                    const mesActual_string = String(calendario.mes).padStart(2, '0')
                    const anoActual_string = String(calendario.ano).padStart(4, '0')

                    const mesActual_decimal = parseInt(calendario.mes, 10)
                    const anoActual_decimal = parseInt(calendario.ano, 10)

                    const fechaEntradaVolatil_Humana = document.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
                    const fechaEntradaSeleccionada = {}
                    if (fechaEntradaVolatil_Humana) {
                        const fechaEntradaAarray = fechaEntradaVolatil_Humana.split("/")
                        fechaEntradaSeleccionada.dia = parseInt(fechaEntradaAarray[0], 10)
                        fechaEntradaSeleccionada.mes = parseInt(fechaEntradaAarray[1], 10)
                        fechaEntradaSeleccionada.ano = parseInt(fechaEntradaAarray[2], 10)
                    }

                    const fechaSalidaVolatil_Humana = document.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")
                    const fechaSalidaSeleccionada = {}
                    if (fechaSalidaVolatil_Humana) {
                        const fechaSaliraArray = fechaSalidaVolatil_Humana.split("/")
                        fechaSalidaSeleccionada.dia = parseInt(fechaSaliraArray[0], 10)
                        fechaSalidaSeleccionada.mes = parseInt(fechaSaliraArray[1], 10)
                        fechaSalidaSeleccionada.ano = parseInt(fechaSaliraArray[2], 10)
                    }
                    const limitesPublicos = calendario.limites
                    const diasAntelacion = limitesPublicos.diasAntelacion
                    const limiteFuturo = limitesPublicos.limiteFuturo
                    const diasMaximoReserva = limitesPublicos.diasMaximoReserva

                    marcoCalendario?.setAttribute("perfilMes", perfilMes)
                    const verificaRangoInternamente = (
                        mesActual,
                        anoActual,
                        fechaInicio,
                        fechaSalida
                    ) => {
                        const inicio = new Date(fechaInicio);
                        const fin = new Date(fechaSalida);

                        const inicioMesAno = new Date(inicio.getFullYear(), inicio.getMonth());
                        const finMesAno = new Date(fin.getFullYear(), fin.getMonth());
                        const fechaMesAno = new Date(anoActual, mesActual - 1);
                        return fechaMesAno >= inicioMesAno && fechaMesAno <= finMesAno;
                    };

                    const fechaEntrada_ISO = `${fechaEntradaSeleccionada.ano}-${String(fechaEntradaSeleccionada.mes).padStart(2, "0")}-${String(fechaEntradaSeleccionada.dia).padStart(2, "0")}`
                    const fechaSalida_ISO = `${fechaSalidaSeleccionada.ano}-${String(fechaSalidaSeleccionada.mes).padStart(2, "0")}-${String(fechaSalidaSeleccionada.dia).padStart(2, "0")}`
                    const fechaLimitePorDiasDeDuracion = (fechaSeleccionada_ISO, diasMaximos) => {

                        const ok = {
                            arbol: {},
                            fecha: {}
                        }
                        if (fechaSeleccionada_ISO) {
                            const fechaLimitePorSeleccion = new Date(fechaSeleccionada_ISO); // Asegúrate de que el formato de la fecha sea 'YYYY-MM-DD'
                            // Definir el número de días que deseas sumar
                            const numeroDeDiasASumar = Number(diasMaximos);
                            // Sumar los días a la fecha inicial
                            fechaLimitePorSeleccion.setDate(fechaLimitePorSeleccion.getDate() - numeroDeDiasASumar);
                            const fechaAdelantada = fechaLimitePorSeleccion
                            const dia = fechaLimitePorSeleccion.getDate();
                            const mes = fechaLimitePorSeleccion.getMonth() + 1; // Los meses se indexan desde 0 (enero) a 11 (diciembre)
                            const ano = fechaLimitePorSeleccion.getFullYear();
                            // Imprimir la nueva fecha
                            ok.fecha.ano = ano
                            ok.fecha.mes = mes
                            ok.fecha.dia = dia
                            ok.arbol[ano] = {
                                [mes]: {
                                    [dia]: true
                                }
                            }
                        }
                        console.log("entrada ok", ok)
                        return ok
                    }
                    const objetoFechaLimitePorDias = fechaLimitePorDiasDeDuracion(fechaSalida_ISO, diasMaximoReserva)
                    for (let numeroDia = 0; numeroDia < numeroDiasPorMes; numeroDia++) {
                        const diaFinal_decimal = parseInt(numeroDia + 1, 10);
                        const bloqueDia = document.createElement("li")
                        bloqueDia.setAttribute("class", "dia")
                        if (diaFinal_decimal === 1) {
                            bloqueDia.style.gridColumnStart = posicionDia1
                        }
                        bloqueDia.setAttribute("dia", diaFinal_decimal)
                        bloqueDia.addEventListener("click", casaVitini.ui.vistas.reservasNuevo.seleccionarDia)
                        if (calendario.tiempo === "presente") {
                            if (diaFinal_decimal < diaActual_decimal) {
                                bloqueDia.classList.add("calendarioDiaNoDisponible")
                                bloqueDia.setAttribute("estadoDia", "noDisponible")

                            }
                        }


                        if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaParcial") {
                            bloqueDia.classList.add("calendarioDiaParcial")
                        }
                        if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaCompleto") {
                            bloqueDia.classList.add("calendarioDiaCompleto")
                        }

                        if (diasAntelacion[anoActual_decimal] &&
                            diasAntelacion[anoActual_decimal][mesActual_decimal] &&
                            diasAntelacion[anoActual_decimal][mesActual_decimal][diaFinal_decimal]) {
                            bloqueDia.classList.add("calendarioDiaNoDisponiblePorAntelacion")
                            bloqueDia.setAttribute("estadoDia", "noDisponible")

                        }
                        if (anoActual_decimal === limiteFuturo.ano && mesActual_decimal === limiteFuturo.mes) {
                            if (diaFinal_decimal > limiteFuturo.dia) {
                                bloqueDia.classList.add("calendarioDiaNoDisponible")
                                bloqueDia.setAttribute("estadoDia", "noDisponible")
                            }
                        }
                        if (!Object.keys(fechaEntradaSeleccionada).length && !Object.keys(fechaSalidaSeleccionada).length) {

                            if (calendario.tiempo === "presente") {
                                if (diaActual_decimal <= diaFinal_decimal) {
                                    if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                        bloqueDia.setAttribute("estadoDia", "disponible")
                                        bloqueDia.classList.add("calendarioDiaDisponible")
                                    }
                                }
                            }
                            if (calendario.tiempo === "futuro") {
                                if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                    bloqueDia.setAttribute("estadoDia", "disponible")
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                }
                            }


                        }
                        else if (Object.keys(fechaEntradaSeleccionada).length && Object.keys(fechaSalidaSeleccionada).length) {
                            if (
                                (mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano)
                                &&
                                (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano)
                            ) {
                                // si es mes de entrada y salida
                                console.log("4")
                                if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaReservaLimite")
                                }
                                if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                }
                                if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaSeleccionado")
                                    bloqueDia.setAttribute("estadoDia", "seleccionado")
                                }
                                if (diaFinal_decimal > fechaEntradaSeleccionada.dia && diaFinal_decimal < fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaReserva")
                                }
                                if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaNoDisponible")
                                }

                            } else if ((mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano)) {
                                // Si es mes de entrada
                                console.log("1")

                                if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaSeleccionado")
                                    bloqueDia.setAttribute("estadoDia", "seleccionado")
                                }
                                if (diaFinal_decimal > fechaEntradaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaReserva")
                                }
                                if (calendario.tiempo === "futuro") {
                                    if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                        bloqueDia.classList.add("calendarioDiaDisponible")
                                    }
                                }
                            } else if (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano) {
                                console.log("2")
                                // si es mes de salida pero no de entrada
                                if (diaFinal_decimal < fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaReserva")
                                }
                                if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaNoDisponible")
                                }
                                if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaReservaLimite")
                                }
                            } else {
                                // Entonces ver si es mes intermedio
                                if (verificaRangoInternamente(mesActual_decimal, anoActual_decimal, fechaEntrada_ISO, fechaSalida_ISO)) {
                                    bloqueDia.classList.add("calendarioDiaReserva")
                                } else {
                                    if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                        bloqueDia.classList.add("calendarioDiaDisponible")
                                    }
                                }
                            }
                        }
                        else if (Object.keys(fechaEntradaSeleccionada).length && !Object.keys(fechaSalidaSeleccionada).length) {
                            console.log(">> 1")


                            if (mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano) {

                                if (
                                    (
                                        diaFinal_decimal < fechaEntradaSeleccionada.dia
                                        ||
                                        diaFinal_decimal > fechaEntradaSeleccionada.dia
                                    ) &&
                                    bloqueDia.getAttribute("estadoDia") !== "noDisponible"
                                ) {
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                    bloqueDia.removeAttribute("estadoDia", "disponible")
                                }
                                if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaSeleccionado")
                                    bloqueDia.setAttribute("estadoDia", "seleccionado")
                                }
                            } else {
                                if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                    bloqueDia.removeAttribute("estadoDia", "disponible")

                                }
                            }
                        }
                        else if (Object.keys(fechaSalidaSeleccionada).length && !Object.keys(fechaEntradaSeleccionada).length) {
                            if (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano) {
                                if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaReservaLimite")
                                }
                                if (
                                    diaFinal_decimal < fechaSalidaSeleccionada.dia
                                    &&
                                    bloqueDia.getAttribute("estadoDia") !== "noDisponible"
                                ) {
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                    bloqueDia.removeAttribute("estadoDia", "disponible")
                                }
                                if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaNoDisponible")
                                    bloqueDia.setAttribute("estadoDia", "noDisponible")
                                }


                            } else {
                                if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                    bloqueDia.removeAttribute("estadoDia", "disponible")

                                }
                            }
                        }

                        if (Object.keys(fechaSalidaSeleccionada).length) {
                            if (objetoFechaLimitePorDias.arbol[anoActual_decimal] &&
                                objetoFechaLimitePorDias.arbol[anoActual_decimal][mesActual_decimal]) {
                                const diaEntradaLimiteReserva = objetoFechaLimitePorDias.fecha.dia
                                if (diaFinal_decimal < diaEntradaLimiteReserva) {
                                    bloqueDia.classList.add("calendarioDiaNoDisponible")

                                }
                            }
                        }
                        if (calendario.tiempo === "presente" && diaActual_decimal === diaFinal_decimal) {
                            bloqueDia.style.border = "3px solid white";
                            bloqueDia.setAttribute("tipoDia", "hoy")
                        }
                        bloqueDia.innerText = diaFinal_decimal
                        marcoMes.appendChild(bloqueDia)
                    }
                    if (mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano) {
                        let patronConsulta = `[dia='${fechaEntradaSeleccionada.dia}']`
                    }
                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"
                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"
                    if (Object.keys(fechaSalidaSeleccionada).length) {
                        if (anoActual_decimal < fechaSalidaSeleccionada.ano) {
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                            console.log("1")
                        } else if (anoActual_decimal === fechaSalidaSeleccionada.ano && mesActual_decimal < fechaSalidaSeleccionada.mes) {
                            console.log("2")
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                        } else {
                            console.log("5")
                            console.log(anoActual_decimal, limiteFuturo.ano, mesActual_decimal, limiteFuturo.mes)

                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 0
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"
                        }
                    } else if (calendario.tiempo === "presente" || calendario.tiempo === "futuro") {
                        if (anoActual_decimal < limiteFuturo.ano) {
                            console.log("3")
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                        } else if (anoActual_decimal === limiteFuturo.ano && mesActual_decimal < limiteFuturo.mes) {
                            console.log("4")
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                        } else {
                            console.log("5")
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 0
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"
                        }
                    }
                    if (
                        (Object.keys(fechaSalidaSeleccionada).length)
                        &&
                        (objetoFechaLimitePorDias.arbol[anoActual_decimal][mesActual_decimal])
                    ) {
                        console.log("6")
                        console.log(objetoFechaLimitePorDias.arbol[anoActual_decimal][mesActual_decimal], "ss")

                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 0
                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"
                    } else if (calendario.tiempo === "futuro" ||
                        (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano)) {
                        console.log("7")

                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
                    } else {
                        console.log("8")

                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 0
                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"
                    }

                }
                if (perfilMes === "calendario_salida_publico_sinPasado") {

                    const mesActual_string = String(calendario.mes).padStart(2, '0')
                    const anoActual_string = String(calendario.ano).padStart(4, '0')

                    const mesActual_decimal = parseInt(calendario.mes, 10)
                    const anoActual_decimal = parseInt(calendario.ano, 10)

                    marcoCalendario.setAttribute("perfilMes", perfilMes)

                    const fechaEntradaVolatil_Humana = document.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
                    const fechaEntradaSeleccionada = {}
                    if (fechaEntradaVolatil_Humana) {
                        const fechaEntradaAarray = fechaEntradaVolatil_Humana.split("/")
                        fechaEntradaSeleccionada.dia = parseInt(fechaEntradaAarray[0], 10)
                        fechaEntradaSeleccionada.mes = parseInt(fechaEntradaAarray[1], 10)
                        fechaEntradaSeleccionada.ano = parseInt(fechaEntradaAarray[2], 10)
                    }

                    const fechaSalidaVolatil_Humana = document.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")
                    const fechaSalidaSeleccionada = {}
                    if (fechaSalidaVolatil_Humana) {
                        const fechaSaliraArray = fechaSalidaVolatil_Humana.split("/")
                        fechaSalidaSeleccionada.dia = parseInt(fechaSaliraArray[0], 10)
                        fechaSalidaSeleccionada.mes = parseInt(fechaSaliraArray[1], 10)
                        fechaSalidaSeleccionada.ano = parseInt(fechaSaliraArray[2], 10)
                    }



                    const verificaRangoInternamente = (
                        mesActual,
                        anoActual,
                        fechaInicio,
                        fechaSalida
                    ) => {
                        const inicio = new Date(fechaInicio);
                        const fin = new Date(fechaSalida);

                        const inicioMesAno = new Date(inicio.getFullYear(), inicio.getMonth());
                        const finMesAno = new Date(fin.getFullYear(), fin.getMonth());
                        const fechaMesAno = new Date(anoActual, mesActual - 1);
                        return fechaMesAno >= inicioMesAno && fechaMesAno <= finMesAno;
                    };

                    const fechaEntrada_ISO = `${fechaEntradaSeleccionada.ano}-${String(fechaEntradaSeleccionada.mes).padStart(2, "0")}-${String(fechaEntradaSeleccionada.dia).padStart(2, "0")}`
                    const fechaSalida_ISO = `${fechaSalidaSeleccionada.ano}-${String(fechaSalidaSeleccionada.mes).padStart(2, "0")}-${String(fechaSalidaSeleccionada.dia).padStart(2, "0")}`

                    const limitesPublicos = calendario.limites
                    const diasAntelacion = limitesPublicos.diasAntelacion
                    const limiteFuturo = limitesPublicos.limiteFuturo
                    const diasMaximoReserva = limitesPublicos.diasMaximoReserva
                    const fechaActualPublica = calendario.fechaActualPublica

                    const fechaLimitePorDiasDeDuracion = (fechaSeleccionada_ISO, diasMaximos) => {
                        // Definir la fecha inicial
                        const ok = {
                            arbol: {},
                            fecha: {}
                        }
                        if (fechaSeleccionada_ISO) {
                            const fechaLimitePorSeleccion = new Date(fechaSeleccionada_ISO); // Asegúrate de que el formato de la fecha sea 'YYYY-MM-DD'
                            // Definir el número de días que deseas sumar
                            const numeroDeDiasASumar = Number(diasMaximos);
                            // Sumar los días a la fecha inicial
                            fechaLimitePorSeleccion.setDate(fechaLimitePorSeleccion.getDate() + numeroDeDiasASumar);
                            const fechaAdelantada = fechaLimitePorSeleccion
                            const dia = fechaLimitePorSeleccion.getDate();
                            const mes = fechaLimitePorSeleccion.getMonth() + 1; // Los meses se indexan desde 0 (enero) a 11 (diciembre)
                            const ano = fechaLimitePorSeleccion.getFullYear();
                            // Imprimir la nueva fecha
                            ok.fecha.ano = ano
                            ok.fecha.mes = mes
                            ok.fecha.dia = dia
                            ok.arbol[ano] = {
                                [mes]: {
                                    [dia]: true
                                }
                            }
                        }
                        console.log("ok", ok)
                        return ok
                    }
                    const objetoFechaLimitePorDias = fechaLimitePorDiasDeDuracion(fechaEntrada_ISO, diasMaximoReserva)

                    for (let numeroDia = 0; numeroDia < numeroDiasPorMes; numeroDia++) {
                        const diaFinal_decimal = parseInt(numeroDia + 1, 10);
                        const bloqueDia = document.createElement("li")
                        bloqueDia.classList.add("dia")
                        if (diaFinal_decimal === 1) {
                            bloqueDia.style.gridColumnStart = posicionDia1
                        }

                        bloqueDia.setAttribute("dia", diaFinal_decimal)
                        bloqueDia.addEventListener("click", casaVitini.ui.vistas.reservasNuevo.seleccionarDia)
                        if (calendario.tiempo === "presente") {
                            if (diaFinal_decimal < diaActual_decimal) {
                                bloqueDia.classList.add("calendarioDiaNoDisponible")
                                bloqueDia.setAttribute("estadoDia", "noDisponible")

                            }
                        }
                        if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaParcial") {
                            bloqueDia.classList.add("calendarioDiaParcial")
                        }
                        if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaCompleto") {
                            bloqueDia.classList.add("calendarioDiaCompleto")
                        }
                        if (diasAntelacion[anoActual_decimal] &&
                            diasAntelacion[anoActual_decimal][mesActual_decimal] &&
                            diasAntelacion[anoActual_decimal][mesActual_decimal][diaFinal_decimal]) {
                            bloqueDia.classList.add("calendarioDiaNoDisponiblePorAntelacion")
                            bloqueDia.setAttribute("estadoDia", "noDisponible")

                        }

                        if (objetoFechaLimitePorDias.arbol[anoActual_decimal] &&
                            objetoFechaLimitePorDias.arbol[anoActual_decimal][mesActual_decimal]) {
                            const diaSalidaLimiteReserva = objetoFechaLimitePorDias.fecha.dia
                            if (diaFinal_decimal > diaSalidaLimiteReserva) {
                                bloqueDia.classList.add("calendarioDiaNoDisponible")
                                bloqueDia.setAttribute("estadoDia", "noDisponible")
                            }
                        }
                        if (anoActual_decimal === limiteFuturo.ano && mesActual_decimal === limiteFuturo.mes) {
                            if (diaFinal_decimal > limiteFuturo.dia) {
                                bloqueDia.classList.add("calendarioDiaNoDisponible")
                                bloqueDia.setAttribute("estadoDia", "noDisponible")
                            }
                        }
                        if (!Object.keys(fechaEntradaSeleccionada).length && !Object.keys(fechaSalidaSeleccionada).length) {
                            if (calendario.tiempo === "presente") {
                                if (diaActual_decimal <= diaFinal_decimal) {
                                    if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                        bloqueDia.setAttribute("estadoDia", "disponible")
                                        bloqueDia.classList.add("calendarioDiaDisponible")
                                    }
                                }
                            }
                            if (calendario.tiempo === "futuro") {
                                if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                    bloqueDia.setAttribute("estadoDia", "disponible")
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                }
                            }

                        } else if (Object.keys(fechaEntradaSeleccionada).length && Object.keys(fechaSalidaSeleccionada).length) {

                            if (
                                (mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano)
                                &&
                                (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano)
                            ) {
                                // si es mes de entrada y salida
                                console.log("41")

                                if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaSeleccionado")
                                    bloqueDia.setAttribute("estadoDia", "seleccionado")
                                }
                                if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaNoDisponible")

                                }
                                if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaReservaLimite")

                                }
                                if (diaFinal_decimal > fechaEntradaSeleccionada.dia && diaFinal_decimal < fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaReserva")



                                }
                                if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                    bloqueDia.setAttribute("destino", "1")
                                }

                            } else if ((mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano)) {
                                // Si es mes de entrada
                                console.log("1")

                                if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaReservaLimite")

                                }
                                if (diaFinal_decimal > fechaEntradaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaReserva")
                                }
                                if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                    // replicar esto
                                    if (bloqueDia.getAttribute("estadoDia") === "noDisponible") {
                                    }
                                    bloqueDia.classList.add("calendarioDiaNoDisponible")
                                }

                                if (calendario.tiempo === "futuro") {
                                    if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                        // bloqueDia.classList.add("calendarioDiaDisponible")
                                    }
                                }
                            } else if (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano) {
                                console.log("2")
                                // si es mes de salida pero no de entrada
                                if (diaFinal_decimal < fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaReserva")
                                }
                                if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                }
                                if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaSeleccionado")
                                    bloqueDia.setAttribute("estadoDia", "seleccionado")
                                }
                            } else {
                                // Entonces ver si es mes intermedio
                                if (verificaRangoInternamente(mesActual_decimal, anoActual_decimal, fechaEntrada_ISO, fechaSalida_ISO)) {
                                    bloqueDia.classList.add("calendarioDiaReserva")
                                } else {
                                    if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                        bloqueDia.classList.add("calendarioDiaDisponible")
                                    }
                                }
                            }
                        }
                        else if (Object.keys(fechaEntradaSeleccionada).length && !Object.keys(fechaSalidaSeleccionada).length) {
                            if (mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano) {
                                if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaReservaLimite")
                                    bloqueDia.setAttribute("estadoDia", "seleccionado")
                                }

                                if (diaFinal_decimal > fechaEntradaSeleccionada.dia &&
                                    bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                }
                                if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaNoDisponible")
                                    bloqueDia.setAttribute("estadoDia", "noDisponible")

                                }
                            } else {
                                if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                }
                            }



                        }
                        else if (Object.keys(fechaSalidaSeleccionada).length && !Object.keys(fechaEntradaSeleccionada).length) {
                            if (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano) {
                                if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaSeleccionado")
                                }
                                if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                }
                                if (diaFinal_decimal < fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                }
                            } else {
                                if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                }
                            }
                        }




                        if (calendario.tiempo === "presente" && diaActual_decimal === diaFinal_decimal) {
                            bloqueDia.style.border = "3px solid white";
                            bloqueDia.setAttribute("tipoDia", "hoy")
                        }
                        bloqueDia.innerText = diaFinal_decimal
                        marcoMes.appendChild(bloqueDia)
                    }

                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"
                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"

                    if (Object.keys(fechaEntradaSeleccionada).length) {
                        if (anoActual_decimal > fechaEntradaSeleccionada.ano) {
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
                        } else if (anoActual_decimal === fechaEntradaSeleccionada.ano && mesActual_decimal > fechaEntradaSeleccionada.mes) {
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
                        } else {
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 0
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"
                        }
                    } else if (calendario.tiempo === "futuro") {
                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
                    } else if (calendario.tiempo === "presente") {
                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 0
                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"
                    }

                    if (
                        (Object.keys(fechaEntradaSeleccionada).length)
                        &&
                        (objetoFechaLimitePorDias.arbol[anoActual_decimal][mesActual_decimal])
                    ) {
                        selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 0
                        selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"


                    } else if (calendario.tiempo === "presente" || calendario.tiempo === "futuro") {
                        if (anoActual_decimal < limiteFuturo.ano) {
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                        } else if (anoActual_decimal === limiteFuturo.ano && mesActual_decimal < limiteFuturo.mes) {
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                        } else {
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 0
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"
                        }
                    }



                }

                if (perfilMes === "calendario_entrada_asistido_detallesReserva_conPasado") {

                    const mesActual_string = String(calendario.mes).padStart(2, '0');
                    const anoActual_string = String(calendario.ano).padStart(4, '0');

                    const mesActual_decimal = parseInt(calendario.mes, 10)
                    const anoActual_decimal = parseInt(calendario.ano, 10)

                    const reserva = document.querySelector("[reserva]")?.getAttribute("reserva")

                    const fechaSalidaReservaArray = document.querySelector("[calendario=salida][fechaSalida]")?.getAttribute("fechaSalida").split("/")
                    const diaSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[0], 10)
                    const mesSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[1], 10)
                    const anoSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[2], 10)


                    const fechaEntradaReserva = document.querySelector("[calendario=entrada][fechaEntrada]")?.getAttribute("fechaEntrada").split("/")

                    const diaEntradaReserva_decimal = parseInt(fechaEntradaReserva[0], 10)
                    const mesEntradaReserva_decimal = parseInt(fechaEntradaReserva[1], 10)
                    const anoEntradaReserva_decimal = parseInt(fechaEntradaReserva[2], 10)

                    const fechaEntrada_ISO = `${anoEntradaReserva_decimal}-${String(mesEntradaReserva_decimal).padStart(2, "0")}-${String(diaEntradaReserva_decimal).padStart(2, "0")}`
                    const fechaSalida_ISO = `${anoSalidaReserva_decimal}-${String(mesSalidaReserva_decimal).padStart(2, "0")}-${String(diaSalidaReserva_decimal).padStart(2, "0")}`

                    const verificaRangoInternamente = (
                        mesActual,
                        anoActual,
                        fechaInicio,
                        fechaSalida
                    ) => {
                        const inicio = new Date(fechaInicio);
                        const fin = new Date(fechaSalida);

                        const inicioMesAno = new Date(inicio.getFullYear(), inicio.getMonth());
                        const finMesAno = new Date(fin.getFullYear(), fin.getMonth());
                        const fechaMesAno = new Date(anoActual, mesActual - 1);
                        return fechaMesAno >= inicioMesAno && fechaMesAno <= finMesAno;
                    };


                    const controlLimitePasado = {
                        zona: "administracion/reservas/obtenerElasticidadDelRango",
                        reserva: Number(reserva),
                        mesCalendario: mesActual_string,
                        anoCalendario: anoActual_string,
                        sentidoRango: "pasado"
                    }

                    const resolverLimitePasado = await casaVitini.componentes.servidor(controlLimitePasado)
                    if (resolverLimitePasado.error) {
                        const selectorCalendarioRenderizados = [...document.querySelectorAll("[componente=bloqueCalendario]")]
                        selectorCalendarioRenderizados.map((calendario) => {
                            calendario.remove()
                        })
                        return casaVitini.ui.vistas.advertenciaInmersiva(resolverLimitePasado.error)
                    }

                    const fechaLimitePasado = {}

                    const infoCalendario = selectorCalendarioRenderizado.querySelector("[componente=infoCalendario]")
                    if (resolverLimitePasado.ok === "rangoPasadoLibre") {
                        infoCalendario.innerText = "Todo el mes disponible para seleccionar la nueva fecha de entrada de esta reserva"
                    }
                    if (resolverLimitePasado.limitePasado) {
                        const fechaLimitePasado_Array = resolverLimitePasado.limitePasado.split("-")

                        if (resolverLimitePasado.ok === "noHayRangoPasado") {
                            infoCalendario.innerText = "La fecha de entrada de esta reserva no puede ser inferior a la actual por que no hay rango disponible"
                            fechaLimitePasado.dia = parseInt(fechaLimitePasado_Array[2], 10)
                            fechaLimitePasado.mes = parseInt(fechaLimitePasado_Array[1], 10)
                            fechaLimitePasado.ano = parseInt(fechaLimitePasado_Array[0], 10)
                        }

                        if (resolverLimitePasado.ok === "rangoPasadoLimitado") {
                            infoCalendario.innerText = "Una parte de este mes esta disponible para seleccionar la nueva fecha de entrada para esta reserva"
                            fechaLimitePasado.dia = parseInt(fechaLimitePasado_Array[2], 10)
                            fechaLimitePasado.mes = parseInt(fechaLimitePasado_Array[1], 10)
                            fechaLimitePasado.ano = parseInt(fechaLimitePasado_Array[0], 10)
                        }
                    }

                    marcoCalendario.setAttribute("perfilMes", perfilMes)
                    for (let numeroDia = 0; numeroDia < numeroDiasPorMes; numeroDia++) {
                        const diaFinal_decimal = parseInt(numeroDia + 1, 10);
                        const bloqueDia = document.createElement("li")
                        bloqueDia.setAttribute("class", "dia")
                        bloqueDia.innerText = diaFinal_decimal

                        if (diaFinal_decimal === 1) {
                            bloqueDia.style.gridColumnStart = posicionDia1
                        }
                        bloqueDia.setAttribute("dia", diaFinal_decimal)
                        if (calendario.tiempo === "presente") {
                            if (diaFinal_decimal === diaActual_decimal) {
                                bloqueDia.style.border = "3px solid ghostwhite"
                            }
                        }
                        if (
                            (mesActual_decimal === mesEntradaReserva_decimal && anoActual_decimal === anoEntradaReserva_decimal)
                            &&
                            (mesActual_decimal === mesSalidaReserva_decimal && anoActual_decimal === anoSalidaReserva_decimal)
                        ) {
                            // si es mes de entrada y salida
                            console.log("4")
                            if (diaFinal_decimal === diaSalidaReserva_decimal) {
                                bloqueDia.classList.add("calendarioDiaReservaLimite")
                                bloqueDia.innerText = "S " + diaFinal_decimal
                                bloqueDia.style.pointerEvents = "none"
                            }
                            if (diaFinal_decimal < diaEntradaReserva_decimal) {
                                bloqueDia.classList.add("calendarioDiaDisponible")
                                bloqueDia.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.seleccionarDia)

                            }
                            if (diaFinal_decimal === diaEntradaReserva_decimal) {
                                bloqueDia.classList.add("calendarioDiaSeleccionado")
                                bloqueDia.setAttribute("estadoDia", "seleccionado")
                                bloqueDia.innerText = "E " + diaFinal_decimal
                                bloqueDia.style.pointerEvents = "none"

                            }
                            if (diaFinal_decimal > diaEntradaReserva_decimal && diaFinal_decimal < diaSalidaReserva_decimal) {
                                bloqueDia.classList.add("calendarioDiaReserva")
                                bloqueDia.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.seleccionarDia)
                            }
                            if (diaFinal_decimal > diaSalidaReserva_decimal) {
                                bloqueDia.classList.add("calendarioDiaNoDisponible")
                            }

                        } else if ((mesActual_decimal === mesEntradaReserva_decimal && anoActual_decimal === anoEntradaReserva_decimal)) {
                            // Si es mes de entrada
                            console.log("1")

                            if (diaFinal_decimal === diaEntradaReserva_decimal) {
                                bloqueDia.classList.add("calendarioDiaSeleccionado")
                                bloqueDia.setAttribute("estadoDia", "seleccionado")
                                bloqueDia.innerText = "E " + diaFinal_decimal
                                bloqueDia.style.pointerEvents = "none"

                            }
                            if (diaFinal_decimal > diaEntradaReserva_decimal) {
                                bloqueDia.classList.add("calendarioDiaReserva")
                                bloqueDia.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.seleccionarDia)
                            }
                            if (diaFinal_decimal < diaEntradaReserva_decimal) {
                                bloqueDia.classList.add("calendarioDiaDisponible")
                                bloqueDia.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.seleccionarDia)
                            }

                        } else if (mesActual_decimal === mesSalidaReserva_decimal && anoActual_decimal === anoSalidaReserva_decimal) {
                            console.log("2")
                            // si es mes de salida pero no de entrada
                            if (diaFinal_decimal < diaSalidaReserva_decimal) {
                                bloqueDia.classList.add("calendarioDiaReserva")
                                bloqueDia.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.seleccionarDia)
                            }
                            if (diaFinal_decimal > diaSalidaReserva_decimal) {
                                bloqueDia.classList.add("calendarioDiaNoDisponible")
                            }
                            if (diaFinal_decimal === diaSalidaReserva_decimal) {
                                bloqueDia.classList.add("calendarioDiaReservaLimite")
                                bloqueDia.innerText = "S " + diaFinal_decimal
                                bloqueDia.style.pointerEvents = "none"
                            }
                        } else {
                            // Entonces ver si es mes intermedio
                            if (verificaRangoInternamente(mesActual_decimal, anoActual_decimal, fechaEntrada_ISO, fechaSalida_ISO)) {
                                bloqueDia.classList.add("calendarioDiaReserva")
                                bloqueDia.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.seleccionarDia)
                            } else {
                                console.log("fuera del rango")
                                bloqueDia.classList.add("calendarioDiaDisponible")
                                bloqueDia.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.seleccionarDia)
                            }
                        }

                        if (resolverLimitePasado.limitePasado) {
                            if (mesActual_decimal === fechaLimitePasado.mes && anoActual_decimal === fechaLimitePasado.ano) {
                                if (fechaLimitePasado.dia === diaFinal_decimal) {
                                    bloqueDia.classList.remove("calendarioDiaDisponible")
                                    bloqueDia.classList.remove("calendarioDiaReserva")

                                    bloqueDia.classList.add("calendarioDiaNoDisponible")
                                    bloqueDia.style.pointerEvents = "none"
                                    bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                    bloqueDia.removeEventListener("click", casaVitini.administracion.reservas.detallesReserva.seleccionarDia)
                                }
                                if (fechaLimitePasado.dia > diaFinal_decimal) {
                                    bloqueDia.classList.remove("calendarioDiaDisponible")
                                    bloqueDia.classList.remove("calendarioDiaReserva")
                                    bloqueDia.classList.add("calendarioDiaNoDisponible")
                                    bloqueDia.style.pointerEvents = "none"
                                    bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                    bloqueDia.removeEventListener("click", casaVitini.administracion.reservas.detallesReserva.seleccionarDia)
                                }
                            }

                        }
                        marcoMes.appendChild(bloqueDia)
                    }
                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
                    if (mesActual_decimal === mesSalidaReserva_decimal && anoActual_decimal === anoSalidaReserva_decimal) {
                        selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 0
                        selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"

                    }
                    if (mesActual_decimal === fechaLimitePasado.mes && anoActual_decimal === fechaLimitePasado.ano) {
                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 0
                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"

                    }


                }
                if (perfilMes === "calendario_salida_asistido_detallesReserva_conPasado") {
                    const mesActual_string = String(calendario.mes).padStart(2, '0');
                    const anoActual_string = String(calendario.ano).padStart(4, '0');

                    const mesActual_decimal = parseInt(calendario.mes, 10)
                    const anoActual_decimal = parseInt(calendario.ano, 10)

                    const reserva = document.querySelector("[reserva]")?.getAttribute("reserva")

                    const fechaSalidaReservaArray = document.querySelector("[calendario=salida][fechaSalida]")?.getAttribute("fechaSalida").split("/")
                    const diaSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[0], 10)
                    const mesSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[1], 10)
                    const anoSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[2], 10)


                    const fechaEntradaReserva = document.querySelector("[calendario=entrada][fechaEntrada]")?.getAttribute("fechaEntrada").split("/")

                    const diaEntradaReserva_decimal = parseInt(fechaEntradaReserva[0], 10)
                    const mesEntradaReserva_decimal = parseInt(fechaEntradaReserva[1], 10)
                    const anoEntradaReserva_decimal = parseInt(fechaEntradaReserva[2], 10)

                    const fechaEntrada_ISO = `${anoEntradaReserva_decimal}-${String(mesEntradaReserva_decimal).padStart(2, "0")}-${String(diaEntradaReserva_decimal).padStart(2, "0")}`
                    const fechaSalida_ISO = `${anoSalidaReserva_decimal}-${String(mesSalidaReserva_decimal).padStart(2, "0")}-${String(diaSalidaReserva_decimal).padStart(2, "0")}`

                    const verificaRangoInternamente = (
                        mesActual,
                        anoActual,
                        fechaInicio,
                        fechaSalida
                    ) => {
                        const inicio = new Date(fechaInicio);
                        const fin = new Date(fechaSalida);

                        const inicioMesAno = new Date(inicio.getFullYear(), inicio.getMonth());
                        const finMesAno = new Date(fin.getFullYear(), fin.getMonth());
                        const fechaMesAno = new Date(anoActual, mesActual - 1);
                        return fechaMesAno >= inicioMesAno && fechaMesAno <= finMesAno;
                    };

                    const controlLimiteFuturo = {
                        zona: "administracion/reservas/obtenerElasticidadDelRango",
                        reserva: Number(reserva),
                        mesCalendario: mesActual_string,
                        anoCalendario: anoActual_string,
                        sentidoRango: "futuro"
                    }
                    const resolverLimiteFuturo = await casaVitini.componentes.servidor(controlLimiteFuturo)

                    if (resolverLimiteFuturo.error) {
                        const selectorCalendarioRenderizados = [...document.querySelectorAll("[componente=bloqueCalendario]")]
                        selectorCalendarioRenderizados.map((calendario) => {
                            calendario.remove()
                        })
                        return casaVitini.ui.vistas.advertenciaInmersiva(resolverLimiteFuturo.error)

                    }

                    const fechaLimiteFuturo = {}
                    if (resolverLimiteFuturo.ok === "rangoPasadoLibre") {
                        infoCalendario.innerText = "Todo el mes disponible para seleccionar la nueva fecha de salida de esta reserva"
                    }
                    if (resolverLimiteFuturo.limiteFuturo) {
                        const fechaLimiteFuturo_Array = resolverLimiteFuturo.limiteFuturo.split("-")

                        if (resolverLimiteFuturo.ok === "noHayRangoFuturo") {
                            infoCalendario.innerText = "La fecha de salida de esta reserva no puede ser superior a la actual por que no hay rango disponible"
                            fechaLimiteFuturo.dia = parseInt(fechaLimiteFuturo_Array[2], 10)
                            fechaLimiteFuturo.mes = parseInt(fechaLimiteFuturo_Array[1], 10)
                            fechaLimiteFuturo.ano = parseInt(fechaLimiteFuturo_Array[0], 10)
                        }

                        if (resolverLimiteFuturo.ok === "rangoFuturoLimitado") {
                            infoCalendario.innerText = "Una parte de este mes esta disponible para seleccionar la nueva fecha de salida para esta reserva"
                            fechaLimiteFuturo.dia = parseInt(fechaLimiteFuturo_Array[2], 10)
                            fechaLimiteFuturo.mes = parseInt(fechaLimiteFuturo_Array[1], 10)
                            fechaLimiteFuturo.ano = parseInt(fechaLimiteFuturo_Array[0], 10)
                        }
                    }

                    marcoCalendario?.setAttribute("perfilMes", perfilMes)
                    for (let numeroDia = 0; numeroDia < numeroDiasPorMes; numeroDia++) {
                        const diaFinal_decimal = parseInt(numeroDia + 1, 10);
                        const bloqueDia = document.createElement("li")
                        bloqueDia.setAttribute("class", "dia")
                        bloqueDia.innerText = diaFinal_decimal

                        if (diaFinal_decimal === 1) {
                            bloqueDia.style.gridColumnStart = posicionDia1
                        }
                        bloqueDia.setAttribute("dia", diaFinal_decimal)

                        if (calendario.tiempo === "presente") {
                            if (diaFinal_decimal === diaActual_decimal) {
                                bloqueDia.style.border = "3px solid ghostwhite"
                            }
                        }

                        if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaParcial") {
                            bloqueDia.classList.add("calendarioDiaParcial")
                        }

                        if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaCompleto") {
                            bloqueDia.classList.add("calendarioDiaCompleto")
                        }

                        if (
                            (mesActual_decimal === mesEntradaReserva_decimal && anoActual_decimal === anoEntradaReserva_decimal)
                            &&
                            (mesActual_decimal === mesSalidaReserva_decimal && anoActual_decimal === anoSalidaReserva_decimal)
                        ) {
                            // si es mes de entrada y salida
                            console.log("41", diaFinal_decimal, diaSalidaReserva_decimal, diaFinal_decimal === diaSalidaReserva_decimal)

                            if (diaFinal_decimal === diaSalidaReserva_decimal) {
                                bloqueDia.classList.add("calendarioDiaReservaLimite")
                                //bloqueDia.setAttribute("estadoDia", "seleccionado")
                                bloqueDia.innerText = "S " + diaFinal_decimal
                                bloqueDia.style.pointerEvents = "none"


                            }
                            if (diaFinal_decimal < diaEntradaReserva_decimal) {
                                bloqueDia.classList.add("calendarioDiaNoDisponible")
                                bloqueDia.setAttribute("estadoDia", "deshabilitado")

                            }
                            if (diaFinal_decimal === diaEntradaReserva_decimal) {
                                bloqueDia.classList.add("calendarioDiaReservaLimite")
                                bloqueDia.innerText = "E " + diaFinal_decimal
                                bloqueDia.style.pointerEvents = "none"


                            }
                            if (diaFinal_decimal > diaEntradaReserva_decimal && diaFinal_decimal < diaSalidaReserva_decimal) {
                                bloqueDia.classList.add("calendarioDiaReserva")
                                bloqueDia.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.seleccionarDia)

                            }
                            if (diaFinal_decimal > diaSalidaReserva_decimal) {
                                bloqueDia.classList.add("calendarioDiaDisponible")
                                bloqueDia.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.seleccionarDia)

                            }

                        } else if ((mesActual_decimal === mesEntradaReserva_decimal && anoActual_decimal === anoEntradaReserva_decimal)) {
                            // Si es mes de entrada
                            console.log("1")

                            if (diaFinal_decimal === diaEntradaReserva_decimal) {
                                bloqueDia.classList.add("calendarioDiaReservaLimite")
                                bloqueDia.innerText = "E " + diaFinal_decimal
                                bloqueDia.style.pointerEvents = "none"


                            }
                            if (diaFinal_decimal > diaEntradaReserva_decimal) {
                                bloqueDia.classList.add("calendarioDiaReserva")
                                bloqueDia.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.seleccionarDia)

                            }
                            if (diaFinal_decimal < diaEntradaReserva_decimal) {
                                // replicar esto
                                if (bloqueDia.getAttribute("estadoDia") === "noDisponible") {
                                }
                                bloqueDia.classList.add("calendarioDiaNoDisponible")
                                bloqueDia.setAttribute("estadoDia", "deshabilitado")

                            }

                            if (calendario.tiempo === "futuro") {
                                if (diaFinal_decimal < diaEntradaReserva_decimal) {
                                    // bloqueDia.classList.add("calendarioDiaDisponible")
                                }
                            }
                        } else if (mesActual_decimal === mesSalidaReserva_decimal && anoActual_decimal === anoSalidaReserva_decimal) {
                            console.log("2")
                            // si es mes de salida pero no de entrada
                            if (diaFinal_decimal < diaSalidaReserva_decimal) {
                                bloqueDia.classList.add("calendarioDiaReserva")
                                bloqueDia.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.seleccionarDia)

                            }
                            if (diaFinal_decimal > diaSalidaReserva_decimal) {
                                bloqueDia.classList.add("calendarioDiaDisponible")
                                bloqueDia.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.seleccionarDia)
                            }
                            if (diaFinal_decimal === diaSalidaReserva_decimal) {
                                bloqueDia.classList.add("calendarioDiaReservaLimite")
                                bloqueDia.setAttribute("estadoDia", "seleccionado")
                                bloqueDia.innerText = "S " + diaFinal_decimal
                                bloqueDia.style.pointerEvents = "none"


                            }
                        } else {
                            // Entonces ver si es mes intermedio
                            if (verificaRangoInternamente(mesActual_decimal, anoActual_decimal, fechaEntrada_ISO, fechaSalida_ISO)) {
                                bloqueDia.classList.add("calendarioDiaReserva")
                                bloqueDia.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.seleccionarDia)
                                console.log("dentro del rangfo")
                            } else {
                                console.log("fuera del rango")
                                bloqueDia.classList.add("calendarioDiaDisponible")
                                bloqueDia.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.seleccionarDia)
                            }
                        }

                        if (resolverLimiteFuturo.limiteFuturo) {
                            if (mesActual_decimal === fechaLimiteFuturo.mes && anoActual_decimal === fechaLimiteFuturo.ano) {
                                if (fechaLimiteFuturo.dia === diaFinal_decimal) {
                                    bloqueDia.classList.remove("calendarioDiaDisponible")
                                    bloqueDia.classList.add("calendarioDiaNoDisponible")
                                    bloqueDia.style.pointerEvents = "none"
                                    bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                    bloqueDia.removeEventListener("click", casaVitini.administracion.reservas.detallesReserva.seleccionarDia)

                                }
                                if (fechaLimiteFuturo.dia <= diaFinal_decimal) {
                                    bloqueDia.classList.remove("calendarioDiaDisponible")
                                    bloqueDia.classList.add("calendarioDiaNoDisponible")
                                    bloqueDia.style.pointerEvents = "none"
                                    bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                    bloqueDia.removeEventListener("click", casaVitini.administracion.reservas.detallesReserva.seleccionarDia)

                                }
                            }

                        }
                        marcoMes?.appendChild(bloqueDia)
                    }
                    // calendario_salida_asistido_detallesReserva_conPasado   
                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"

                    if (mesActual_decimal === mesEntradaReserva_decimal && anoActual_decimal === anoEntradaReserva_decimal) {
                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 0
                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"
                    }

                    if (mesActual_decimal === fechaLimiteFuturo.mes && anoActual_decimal === fechaLimiteFuturo.ano) {
                        selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 0
                        selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"
                    }
                }

                if (perfilMes === "calendario_entrada_asistido_detallesReserva_checkIn_conPasado") {

                    const mesActual_string = String(calendario.mes).padStart(2, '0');
                    const anoActual_string = String(calendario.ano).padStart(4, '0');

                    const mesActual_decimal = parseInt(calendario.mes, 10)
                    const anoActual_decimal = parseInt(calendario.ano, 10)

                    const fechaCheckIN = document
                        .querySelector(`[instanciaUID="${instanciaUID}"]`)
                        .closest("[fechaCheckIn]")
                        ?.getAttribute("fechaCheckIn")

                    const fechaCheckOutAdelantado = document
                        .querySelector(`[instanciaUID="${instanciaUID}"]`)
                        .closest("[fechaCheckOut]")
                        ?.getAttribute("fechaCheckOut")



                    const fechaSalidaReservaArray = document.querySelector("[calendario=salida][fechaSalida]")?.getAttribute("fechaSalida").split("/")
                    const diaSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[0], 10)
                    const mesSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[1], 10)
                    const anoSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[2], 10)


                    const fechaEntradaReserva = document.querySelector("[calendario=entrada][fechaEntrada]")?.getAttribute("fechaEntrada").split("/")

                    const diaEntradaReserva_decimal = parseInt(fechaEntradaReserva[0], 10)
                    const mesEntradaReserva_decimal = parseInt(fechaEntradaReserva[1], 10)
                    const anoEntradaReserva_decimal = parseInt(fechaEntradaReserva[2], 10)

                    const fechaEntrada_ISO = `${anoEntradaReserva_decimal}-${String(mesEntradaReserva_decimal).padStart(2, "0")}-${String(diaEntradaReserva_decimal).padStart(2, "0")}`
                    const fechaSalida_ISO = `${anoSalidaReserva_decimal}-${String(mesSalidaReserva_decimal).padStart(2, "0")}-${String(diaSalidaReserva_decimal).padStart(2, "0")}`


                    const verificaRangoInternamente = (
                        mesActual,
                        anoActual,
                        fechaInicio,
                        fechaSalida
                    ) => {
                        const inicio = new Date(fechaInicio);
                        const fin = new Date(fechaSalida);

                        const inicioMesAno = new Date(inicio.getFullYear(), inicio.getMonth());
                        const finMesAno = new Date(fin.getFullYear(), fin.getMonth());
                        const fechaMesAno = new Date(anoActual, mesActual - 1);
                        return fechaMesAno >= inicioMesAno && fechaMesAno <= finMesAno;
                    };

                    marcoCalendario.setAttribute("perfilMes", perfilMes)

                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
                    // calendario_entrada_asistido_detallesReserva_conPasado
                    if (mesActual_decimal === mesSalidaReserva_decimal && anoActual_decimal === anoSalidaReserva_decimal) {
                        selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 0
                        selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"

                    }
                    if (mesActual_decimal === mesEntradaReserva_decimal && anoActual_decimal === anoEntradaReserva_decimal) {
                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 0
                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"
                    }

                    for (let numeroDia = 0; numeroDia < numeroDiasPorMes; numeroDia++) {
                        const diaFinal_decimal = Number(numeroDia + 1);
                        const bloqueDia = document.createElement("li")
                        bloqueDia.setAttribute("class", "dia")
                        bloqueDia.innerText = diaFinal_decimal

                        if (diaFinal_decimal === 1) {
                            bloqueDia.style.gridColumnStart = posicionDia1
                        }
                        bloqueDia.setAttribute("dia", diaFinal_decimal)
                        bloqueDia.style.pointerEvents = "none"

                        if (calendario.tiempo === "presente") {
                            if (diaFinal_decimal === diaActual_decimal) {
                                bloqueDia.style.border = "3px solid ghostwhite"
                            }
                        }

                        const mesEntradaRenderizado = (mesActual_decimal === mesEntradaReserva_decimal && anoActual_decimal === anoEntradaReserva_decimal)
                        const mesSalidaRenderzado = (mesActual_decimal === mesSalidaReserva_decimal && anoActual_decimal === anoSalidaReserva_decimal)
                        const mesInternoRango = verificaRangoInternamente(mesActual_decimal, anoActual_decimal, fechaEntrada_ISO, fechaSalida_ISO)

                        const mesEntradaSalidaRenderizado = (
                            (mesActual_decimal === mesEntradaReserva_decimal && anoActual_decimal === anoEntradaReserva_decimal) &&
                            (mesActual_decimal === mesSalidaReserva_decimal && anoActual_decimal === anoSalidaReserva_decimal)
                        )

                        if (mesEntradaSalidaRenderizado) {
                            if (diaEntradaReserva_decimal > diaFinal_decimal) {
                                bloqueDia.style.pointerEvents = "none"
                                bloqueDia.setAttribute("estadoDia", "deshabilitado")
                            }

                            if (diaEntradaReserva_decimal === diaFinal_decimal) {
                                bloqueDia.classList.add("calendarioDiaReserva")
                                bloqueDia.style.pointerEvents = "all"
                                //bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                bloqueDia.innerText = "E " + diaFinal_decimal
                                bloqueDia.addEventListener("click", eval(metodoSelectorDia))

                            }

                            if (diaEntradaReserva_decimal < diaFinal_decimal && diaSalidaReserva_decimal > diaFinal_decimal) {
                                bloqueDia.classList.add("calendarioDiaReserva")
                                bloqueDia.style.pointerEvents = "all"
                                bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                            }

                            if (diaSalidaReserva_decimal === diaFinal_decimal) {
                                bloqueDia.style.pointerEvents = "none"
                                //bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                bloqueDia.innerText = "S " + diaFinal_decimal
                                bloqueDia.classList.add("calendarioDiaReservaLimite")
                            }
                            if (diaSalidaReserva_decimal < diaFinal_decimal) {
                                bloqueDia.style.pointerEvents = "none"
                                bloqueDia.setAttribute("estadoDia", "deshabilitado")

                            }

                        }
                        else if (mesEntradaRenderizado) {

                            if (diaEntradaReserva_decimal > diaFinal_decimal) {
                                bloqueDia.style.pointerEvents = "none"
                                bloqueDia.setAttribute("estadoDia", "deshabilitado")
                            }
                            if (diaEntradaReserva_decimal === diaFinal_decimal) {
                                bloqueDia.classList.add("calendarioDiaReservaLimite")
                                //bloqueDia.style.pointerEvents = "none"
                                //bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                bloqueDia.innerText = "E " + diaFinal_decimal
                                bloqueDia.style.pointerEvents = "all"

                            }

                            if (diaEntradaReserva_decimal < diaFinal_decimal) {
                                bloqueDia.classList.add("calendarioDiaReserva")
                                bloqueDia.style.pointerEvents = "all"
                                bloqueDia.addEventListener("click", eval(metodoSelectorDia))

                            }
                        }
                        else if (mesSalidaRenderzado) {
                            if (diaSalidaReserva_decimal > diaFinal_decimal) {
                                bloqueDia.classList.add("calendarioDiaReserva")
                                bloqueDia.style.pointerEvents = "all"
                                bloqueDia.addEventListener("click", eval(metodoSelectorDia))

                            }
                            if (diaSalidaReserva_decimal === diaFinal_decimal) {
                                bloqueDia.style.pointerEvents = "none"
                                bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                bloqueDia.innerText = "S " + diaFinal_decimal
                                bloqueDia.classList.add("calendarioDiaReservaLimite")

                            }
                            if (diaSalidaReserva_decimal < diaFinal_decimal) {
                                // bloqueDia.classList.add("calendarioDiaReserva")
                                bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                bloqueDia.style.pointerEvents = "all"
                                bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                            }


                        } else if (mesInternoRango) {
                            bloqueDia.classList.add("calendarioDiaReserva")
                            bloqueDia.style.pointerEvents = "all"
                            bloqueDia.addEventListener("click", eval(metodoSelectorDia))

                        }
                        if (fechaCheckIN) {
                            const fechaCheckIN_array = fechaCheckIN.split("/")
                            const diaCheckIn = Number(fechaCheckIN_array[0])
                            const mesCheckIn = Number(fechaCheckIN_array[1])
                            const anoCheckIn = Number(fechaCheckIN_array[2])

                            if (mesActual_decimal === mesCheckIn && anoActual_decimal === anoCheckIn) {
                                if (diaCheckIn === diaFinal_decimal) {
                                    bloqueDia.classList.remove("calendarioDiaReserva")
                                    bloqueDia.classList.remove("calendarioDiaDisponible")
                                    bloqueDia.classList.add("calendarioDiaSeleccionado")
                                    bloqueDia.style.pointerEvents = "none"
                                    bloqueDia.setAttribute("estadoDia", "deshabilitado")

                                }

                            }

                        }

                        if (fechaCheckOutAdelantado) {
                            const fechaCheckOutAdelantado_array = fechaCheckOutAdelantado.split("/")
                            const diaCheckOut = Number(fechaCheckOutAdelantado_array[0])
                            const mesCheckOut = Number(fechaCheckOutAdelantado_array[1])
                            const anoCheckOut = Number(fechaCheckOutAdelantado_array[2])

                            if (mesActual_decimal === mesCheckOut && anoActual_decimal === anoCheckOut) {
                                if (diaCheckOut === diaFinal_decimal) {
                                    bloqueDia.classList.remove("calendarioDiaReserva")
                                    bloqueDia.classList.remove("calendarioDiaDisponible")
                                    bloqueDia.style.pointerEvents = "none"
                                    bloqueDia.classList.add("calendarioDiaReservaLimite")
                                    bloqueDia.innerText = "COa " + diaFinal_decimal
                                    bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                }
                                if (diaCheckOut < diaFinal_decimal && diaSalidaReserva_decimal > diaFinal_decimal) {
                                    bloqueDia.classList.remove("calendarioDiaReserva")
                                    bloqueDia.classList.remove("calendarioDiaDisponible")
                                    bloqueDia.classList.add("calendarioDiaNoDisponible")
                                    bloqueDia.style.pointerEvents = "none"
                                    bloqueDia.setAttribute("estadoDia", "deshabilitado")

                                } else if (diaCheckOut < diaFinal_decimal) {
                                    bloqueDia.classList.remove("calendarioDiaReserva")
                                    bloqueDia.classList.remove("calendarioDiaDisponible")
                                    bloqueDia.classList.add("calendarioDiaNoDisponible")
                                    bloqueDia.style.pointerEvents = "none"
                                    bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                }
                                selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 0
                                selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"
                            }
                        }
                        marcoMes.appendChild(bloqueDia)
                    }
                }
                if (perfilMes === "calendario_salida_asistido_detallesReserva_checkOut_conPasado") {

                    const mesActual_string = String(calendario.mes).padStart(2, '0');
                    const anoActual_string = String(calendario.ano).padStart(4, '0');

                    const mesActual_decimal = parseInt(calendario.mes, 10)
                    const anoActual_decimal = parseInt(calendario.ano, 10)

                    const fechaCheckOut = document
                        .querySelector(`[instanciaUID="${instanciaUID}"]`)
                        .closest("[fechaCheckOut]")
                        ?.getAttribute("fechaCheckOut")



                    const fechaCheckIN = document
                        .querySelector(`[instanciaUID="${instanciaUID}"]`)
                        .closest("[fechaCheckIn]")
                        ?.getAttribute("fechaCheckIn")


                    const fechaSalidaReservaArray = document.querySelector("[calendario=salida][fechaSalida]")?.getAttribute("fechaSalida").split("/")
                    const diaSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[0], 10)
                    const mesSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[1], 10)
                    const anoSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[2], 10)


                    const fechaEntradaReserva = document.querySelector("[calendario=entrada][fechaEntrada]")?.getAttribute("fechaEntrada").split("/")

                    const diaEntradaReserva_decimal = parseInt(fechaEntradaReserva[0], 10)
                    const mesEntradaReserva_decimal = parseInt(fechaEntradaReserva[1], 10)
                    const anoEntradaReserva_decimal = parseInt(fechaEntradaReserva[2], 10)

                    const fechaEntrada_ISO = `${anoEntradaReserva_decimal}-${String(mesEntradaReserva_decimal).padStart(2, "0")}-${String(diaEntradaReserva_decimal).padStart(2, "0")}`
                    const fechaSalida_ISO = `${anoSalidaReserva_decimal}-${String(mesSalidaReserva_decimal).padStart(2, "0")}-${String(diaSalidaReserva_decimal).padStart(2, "0")}`

                    const verificaRangoInternamente = (
                        mesActual,
                        anoActual,
                        fechaInicio,
                        fechaSalida
                    ) => {
                        const inicio = new Date(fechaInicio);
                        const fin = new Date(fechaSalida);

                        const inicioMesAno = new Date(inicio.getFullYear(), inicio.getMonth());
                        const finMesAno = new Date(fin.getFullYear(), fin.getMonth());
                        const fechaMesAno = new Date(anoActual, mesActual - 1);
                        return fechaMesAno >= inicioMesAno && fechaMesAno <= finMesAno;
                    };

                    marcoCalendario.setAttribute("perfilMes", perfilMes)

                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
                    // calendario_entrada_asistido_detallesReserva_conPasado
                    if (mesActual_decimal === mesSalidaReserva_decimal && anoActual_decimal === anoSalidaReserva_decimal) {
                        selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 0
                        selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"

                    }
                    if (mesActual_decimal === mesEntradaReserva_decimal && anoActual_decimal === anoEntradaReserva_decimal) {
                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 0
                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"

                    }


                    for (let numeroDia = 0; numeroDia < numeroDiasPorMes; numeroDia++) {
                        const diaFinal_decimal = Number(numeroDia + 1);
                        const bloqueDia = document.createElement("li")
                        bloqueDia.setAttribute("class", "dia")
                        bloqueDia.innerText = diaFinal_decimal

                        if (diaFinal_decimal === 1) {
                            bloqueDia.style.gridColumnStart = posicionDia1
                        }
                        bloqueDia.setAttribute("dia", diaFinal_decimal)
                        //bloqueDia.setAttribute("estadoDia", "disponible")
                        //bloqueDia.addEventListener("click", casaVitini.administracion.reservas.detallesReserva.UIComponentes.checkout.seleccionarDia)
                        // bloqueDia.classList.add("calendarioDiaDisponible")
                        bloqueDia.style.pointerEvents = "none"

                        if (calendario.tiempo === "presente") {
                            if (diaFinal_decimal === diaActual_decimal) {
                                bloqueDia.style.border = "3px solid ghostwhite"
                            }
                        }
                        const mesEntradaRenderizado = (mesActual_decimal === mesEntradaReserva_decimal && anoActual_decimal === anoEntradaReserva_decimal)
                        const mesSalidaRenderzado = (mesActual_decimal === mesSalidaReserva_decimal && anoActual_decimal === anoSalidaReserva_decimal)
                        const mesInternoRango = verificaRangoInternamente(mesActual_decimal, anoActual_decimal, fechaEntrada_ISO, fechaSalida_ISO)
                        const mesEntradaSalidaRenderizado = (
                            (mesActual_decimal === mesEntradaReserva_decimal && anoActual_decimal === anoEntradaReserva_decimal) &&
                            (mesActual_decimal === mesSalidaReserva_decimal && anoActual_decimal === anoSalidaReserva_decimal)
                        )

                        if (mesEntradaSalidaRenderizado) {
                            if (diaEntradaReserva_decimal > diaFinal_decimal) {
                                bloqueDia.style.pointerEvents = "none"
                                bloqueDia.setAttribute("estadoDia", "deshabilitado")

                            }


                            if (diaEntradaReserva_decimal === diaFinal_decimal) {
                                bloqueDia.classList.add("calendarioDiaReservaLimite")
                                //bloqueDia.style.pointerEvents = "none"
                                //bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                bloqueDia.innerText = "E " + diaFinal_decimal

                            }

                            if (diaEntradaReserva_decimal < diaFinal_decimal && diaSalidaReserva_decimal > diaFinal_decimal) {
                                bloqueDia.classList.add("calendarioDiaReserva")
                                bloqueDia.style.pointerEvents = "all"
                                bloqueDia.addEventListener("click", eval(metodoSelectorDia))


                            }

                            if (diaSalidaReserva_decimal === diaFinal_decimal) {
                                bloqueDia.style.pointerEvents = "none"
                                //bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                bloqueDia.innerText = "S " + diaFinal_decimal
                                bloqueDia.classList.add("calendarioDiaReservaLimite")

                            }
                            if (diaSalidaReserva_decimal < diaFinal_decimal) {
                                bloqueDia.style.pointerEvents = "none"
                                bloqueDia.setAttribute("estadoDia", "deshabilitado")

                            }

                        }
                        else if (mesEntradaRenderizado) {

                            if (diaEntradaReserva_decimal > diaFinal_decimal) {
                                bloqueDia.style.pointerEvents = "none"
                                bloqueDia.setAttribute("estadoDia", "deshabilitado")
                            }
                            if (diaEntradaReserva_decimal === diaFinal_decimal) {
                                bloqueDia.classList.add("calendarioDiaReservaLimite")
                                //bloqueDia.style.pointerEvents = "none"
                                //bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                bloqueDia.innerText = "E " + diaFinal_decimal
                                bloqueDia.style.pointerEvents = "all"

                            }

                            if (diaEntradaReserva_decimal < diaFinal_decimal) {
                                bloqueDia.classList.add("calendarioDiaReserva")
                                bloqueDia.style.pointerEvents = "all"
                                bloqueDia.addEventListener("click", eval(metodoSelectorDia))

                            }
                        }
                        else if (mesSalidaRenderzado) {
                            if (diaSalidaReserva_decimal > diaFinal_decimal) {
                                bloqueDia.classList.add("calendarioDiaReserva")
                                bloqueDia.style.pointerEvents = "all"
                                bloqueDia.addEventListener("click", eval(metodoSelectorDia))

                            }
                            if (diaSalidaReserva_decimal === diaFinal_decimal) {
                                bloqueDia.style.pointerEvents = "none"
                                bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                bloqueDia.innerText = "S " + diaFinal_decimal
                                bloqueDia.classList.add("calendarioDiaReservaLimite")

                            }
                            if (diaSalidaReserva_decimal < diaFinal_decimal) {
                                // bloqueDia.classList.add("calendarioDiaReserva")
                                bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                bloqueDia.style.pointerEvents = "all"
                                bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                            }


                        } else if (mesInternoRango) {
                            bloqueDia.classList.add("calendarioDiaReserva")
                            bloqueDia.style.pointerEvents = "all"
                            bloqueDia.addEventListener("click", eval(metodoSelectorDia))

                        }
                        if (fechaCheckOut) {
                            const fechaCheckOut_array = fechaCheckOut.split("/")
                            const diaCheckOut = Number(fechaCheckOut_array[0])
                            const mesCheckOut = Number(fechaCheckOut_array[1])
                            const anoCheckOut = Number(fechaCheckOut_array[2])
                            if (mesActual_decimal === mesCheckOut && anoActual_decimal === anoCheckOut) {
                                if (diaCheckOut === diaFinal_decimal) {
                                    bloqueDia.classList.remove("calendarioDiaDisponible")
                                    bloqueDia.classList.add("calendarioDiaSeleccionado")
                                    bloqueDia.style.pointerEvents = "none"
                                    bloqueDia.setAttribute("estadoDia", "deshabilitado")

                                }

                            }

                        }

                        if (fechaCheckIN) {
                            const fechaCheckIN_Array = fechaCheckIN.split("/")
                            const diaCheckIn = Number(fechaCheckIN_Array[0])
                            const mesCheckIn = Number(fechaCheckIN_Array[1])
                            const anoCheckIn = Number(fechaCheckIN_Array[2])

                            if (mesActual_decimal === mesCheckIn && anoActual_decimal === anoCheckIn) {
                                if (diaCheckIn === diaFinal_decimal) {
                                    bloqueDia.classList.remove("calendarioDiaReserva")
                                    bloqueDia.classList.remove("calendarioDiaDisponible")
                                    bloqueDia.style.pointerEvents = "none"
                                    bloqueDia.classList.add("calendarioDiaReservaLimite")
                                    bloqueDia.innerText = "CI " + diaFinal_decimal
                                    bloqueDia.setAttribute("estadoDia", "deshabilitado")

                                }
                                if (diaCheckIn > diaFinal_decimal && diaSalidaReserva_decimal < diaFinal_decimal) {
                                    bloqueDia.classList.remove("calendarioDiaReserva")
                                    bloqueDia.classList.remove("calendarioDiaDisponible")
                                    bloqueDia.classList.add("calendarioDiaNoDisponible")
                                    bloqueDia.style.pointerEvents = "none"
                                    bloqueDia.setAttribute("estadoDia", "deshabilitado")

                                } else if (diaCheckIn > diaFinal_decimal) {
                                    bloqueDia.classList.remove("calendarioDiaReserva")
                                    bloqueDia.classList.remove("calendarioDiaDisponible")
                                    bloqueDia.classList.add("calendarioDiaNoDisponible")
                                    bloqueDia.style.pointerEvents = "none"
                                    bloqueDia.setAttribute("estadoDia", "deshabilitado")



                                }
                                selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 0
                                selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"
                            }

                        }





                        marcoMes.appendChild(bloqueDia)
                    }


                }

                if (perfilMes === "calendario_entrada_perfilSimple") {
                    const seleccionableDiaLimite = marcoCalendario?.getAttribute("seleccionableDiaLimite")

                    // Si hay fecha de entrada, posicionar el calendario en la fecha de entrada
                    // Si hay fecha de salida, limitar el calendario de entrada por la fecha de salida
                    const mesActual_string = String(calendario.mes).padStart(2, '0')
                    const anoActual_string = String(calendario.ano).padStart(4, '0')

                    const mesActual_decimal = parseInt(calendario.mes, 10)
                    const anoActual_decimal = parseInt(calendario.ano, 10)

                    const fechaEntradaSelecionda = document.querySelector("[calendario=entrada]")?.getAttribute("memoriaVolatil")
                    const fechaEntradaSeleccionada = {}
                    if (fechaEntradaSelecionda) {
                        fechaEntradaSeleccionada.dia = parseInt(fechaEntradaSelecionda.split("/")[0], 10)
                        fechaEntradaSeleccionada.mes = parseInt(fechaEntradaSelecionda.split("/")[1], 10)
                        fechaEntradaSeleccionada.ano = parseInt(fechaEntradaSelecionda.split("/")[2], 10)
                    }

                    const fechaSalidaSelecionda = document.querySelector("[calendario=salida]")?.getAttribute("memoriaVolatil")
                    const fechaSalidaSeleccionada = {}
                    if (fechaSalidaSelecionda) {
                        fechaSalidaSeleccionada.dia = parseInt(fechaSalidaSelecionda.split("/")[0], 10)
                        fechaSalidaSeleccionada.mes = parseInt(fechaSalidaSelecionda.split("/")[1], 10)
                        fechaSalidaSeleccionada.ano = parseInt(fechaSalidaSelecionda.split("/")[2], 10)
                    }

                    marcoCalendario?.setAttribute("perfilMes", perfilMes)

                    const verificaRangoInternamente = (
                        mesActual,
                        anoActual,
                        fechaInicio,
                        fechaSalida
                    ) => {
                        const inicio = new Date(fechaInicio);
                        const fin = new Date(fechaSalida);

                        const inicioMesAno = new Date(inicio.getFullYear(), inicio.getMonth());
                        const finMesAno = new Date(fin.getFullYear(), fin.getMonth());
                        const fechaMesAno = new Date(anoActual, mesActual - 1);
                        return fechaMesAno >= inicioMesAno && fechaMesAno <= finMesAno;
                    };

                    const fechaEntrada_ISO = `${fechaEntradaSeleccionada.ano}-${String(fechaEntradaSeleccionada.mes).padStart(2, "0")}-${String(fechaEntradaSeleccionada.dia).padStart(2, "0")}`
                    const fechaSalida_ISO = `${fechaSalidaSeleccionada.ano}-${String(fechaSalidaSeleccionada.mes).padStart(2, "0")}-${String(fechaSalidaSeleccionada.dia).padStart(2, "0")}`

                    for (let numeroDia = 0; numeroDia < numeroDiasPorMes; numeroDia++) {
                        const diaFinal_decimal = parseInt(numeroDia + 1, 10);
                        const bloqueDia = document.createElement("li")
                        bloqueDia.setAttribute("class", "dia")
                        bloqueDia.innerText = diaFinal_decimal

                        if (diaFinal_decimal === 1) {
                            bloqueDia.style.gridColumnStart = posicionDia1
                        }
                        bloqueDia.setAttribute("dia", diaFinal_decimal)

                        if (calendario.tiempo === "presente") {
                            if (diaFinal_decimal === diaActual_decimal) {
                                bloqueDia.style.border = "3px solid ghostwhite"
                            }
                        }

                        if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaParcial") {
                            bloqueDia.classList.add("calendarioDiaParcial")
                        }

                        if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaCompleto") {
                            bloqueDia.classList.add("calendarioDiaCompleto")
                        }

                        if (Object.keys(fechaEntradaSeleccionada).length && Object.keys(fechaSalidaSeleccionada).length) {
                            if (
                                (mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano)
                                &&
                                (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano)
                            ) {
                                // si es mes de entrada y salida
                                console.log("4")
                                if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                    if (seleccionableDiaLimite === "si") {
                                        bloqueDia.classList.add("calendarioDiaReserva")
                                        bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                        bloqueDia.setAttribute("estadoDia", "seleccionado")
                                    } else {
                                        bloqueDia.classList.add("calendarioDiaReservaLimite")
                                    }
                                }
                                if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                    bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                    bloqueDia.setAttribute("estadoDia", "disponible")
                                }
                                if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaSeleccionado")
                                    bloqueDia.setAttribute("estadoDia", "seleccionado")
                                    bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                    bloqueDia.setAttribute("estadoDia", "disponible")
                                }
                                if (diaFinal_decimal > fechaEntradaSeleccionada.dia && diaFinal_decimal < fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaReserva")
                                    bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                    bloqueDia.setAttribute("estadoDia", "disponible")
                                }
                                if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaNoDisponible")
                                }

                            } else if ((mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano)) {
                                // Si es mes de entrada
                                console.log("1")

                                if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaSeleccionado")
                                    bloqueDia.setAttribute("estadoDia", "seleccionado")
                                }
                                if (diaFinal_decimal > fechaEntradaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaReserva")
                                    bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                    bloqueDia.setAttribute("estadoDia", "disponible")
                                }
                                if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                    bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                    bloqueDia.setAttribute("estadoDia", "disponible")
                                }

                            } else if (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano) {
                                console.log("2")
                                // si es mes de salida pero no de entrada
                                if (diaFinal_decimal < fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaReserva")
                                    bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                    bloqueDia.setAttribute("estadoDia", "disponible")
                                }
                                if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaNoDisponible")
                                }
                                if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                    if (seleccionableDiaLimite === "si") {
                                        bloqueDia.classList.add("calendarioDiaReserva")
                                        bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                        bloqueDia.setAttribute("estadoDia", "disponible")
                                    } else {
                                        bloqueDia.classList.add("calendarioDiaReservaLimite")
                                    }
                                }
                            } else {
                                // Entonces ver si es mes intermedio
                                if (verificaRangoInternamente(mesActual_decimal, anoActual_decimal, fechaEntrada_ISO, fechaSalida_ISO)) {
                                    bloqueDia.classList.add("calendarioDiaReserva")
                                    bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                    bloqueDia.setAttribute("estadoDia", "disponible")
                                } else {
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                    bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                    bloqueDia.setAttribute("estadoDia", "disponible")
                                }
                            }
                        }
                        else if (Object.keys(fechaEntradaSeleccionada).length && !Object.keys(fechaSalidaSeleccionada).length) {
                            console.log(">> 1")

                            if (mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano) {
                                if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaSeleccionado")
                                    bloqueDia.setAttribute("estadoDia", "seleccionado")
                                    bloqueDia.addEventListener("click", eval(metodoSelectorDia))

                                } else {
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                    bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                    bloqueDia.setAttribute("estadoDia", "disponible")
                                }
                            } else {
                                bloqueDia.classList.add("calendarioDiaDisponible")
                                bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                bloqueDia.setAttribute("estadoDia", "disponible")
                            }
                        }
                        else if (Object.keys(fechaSalidaSeleccionada).length && !Object.keys(fechaEntradaSeleccionada).length) {
                            if (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano) {
                                if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                    if (seleccionableDiaLimite === "si") {
                                        bloqueDia.classList.add("calendarioDiaDisponible")
                                        bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                        bloqueDia.setAttribute("estadoDia", "disponible")
                                    } else {
                                        bloqueDia.classList.add("calendarioDiaReservaLimite")
                                    }
                                }
                                if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaNoDisponible")
                                }
                                if (diaFinal_decimal < fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                    bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                    bloqueDia.setAttribute("estadoDia", "disponible")
                                }
                            } else {
                                bloqueDia.classList.add("calendarioDiaDisponible")
                                bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                bloqueDia.setAttribute("estadoDia", "disponible")

                            }
                        } else if (!Object.keys(fechaSalidaSeleccionada).length && !Object.keys(fechaEntradaSeleccionada).length) {
                            if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                bloqueDia.classList.add("calendarioDiaDisponible")
                                bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                bloqueDia.setAttribute("estadoDia", "disponible")
                            }
                        }
                        marcoMes?.appendChild(bloqueDia)
                    }

                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
                    if (Object.keys(fechaSalidaSeleccionada).length) {
                        if (anoActual_decimal < fechaSalidaSeleccionada.ano) {
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                            console.log("1")
                        } else if (anoActual_decimal === fechaSalidaSeleccionada.ano && mesActual_decimal < fechaSalidaSeleccionada.mes) {
                            console.log("2")
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                        } else {
                            console.log("5")
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 0
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"
                        }
                    } else {
                        selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                        selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                    }

                }
                if (perfilMes === "calendario_salida_perfilSimple") {
                    const seleccionableDiaLimite = marcoCalendario?.getAttribute("seleccionableDiaLimite")

                    // Si hay fecha de salida, limitar el calendario de entrada por la fecha de salida
                    const mesActual_string = String(calendario.mes).padStart(2, '0')
                    const anoActual_string = String(calendario.ano).padStart(4, '0')

                    const mesActual_decimal = parseInt(calendario.mes, 10)
                    const anoActual_decimal = parseInt(calendario.ano, 10)

                    const fechaEntradaSelecionda = document.querySelector("[calendario=entrada]")?.getAttribute("memoriaVolatil")
                    const fechaEntradaSeleccionada = {}
                    if (fechaEntradaSelecionda) {
                        fechaEntradaSeleccionada.dia = parseInt(fechaEntradaSelecionda.split("/")[0], 10)
                        fechaEntradaSeleccionada.mes = parseInt(fechaEntradaSelecionda.split("/")[1], 10)
                        fechaEntradaSeleccionada.ano = parseInt(fechaEntradaSelecionda.split("/")[2], 10)
                    }

                    const fechaSalidaSelecionda = document.querySelector("[calendario=salida]")?.getAttribute("memoriaVolatil")
                    const fechaSalidaSeleccionada = {}
                    if (fechaSalidaSelecionda) {
                        fechaSalidaSeleccionada.dia = parseInt(fechaSalidaSelecionda.split("/")[0], 10)
                        fechaSalidaSeleccionada.mes = parseInt(fechaSalidaSelecionda.split("/")[1], 10)
                        fechaSalidaSeleccionada.ano = parseInt(fechaSalidaSelecionda.split("/")[2], 10)
                    }

                    marcoCalendario.setAttribute("perfilMes", perfilMes)

                    const verificaRangoInternamente = (
                        mesActual,
                        anoActual,
                        fechaInicio,
                        fechaSalida
                    ) => {
                        const inicio = new Date(fechaInicio);
                        const fin = new Date(fechaSalida);

                        const inicioMesAno = new Date(inicio.getFullYear(), inicio.getMonth());
                        const finMesAno = new Date(fin.getFullYear(), fin.getMonth());
                        const fechaMesAno = new Date(anoActual, mesActual - 1);
                        return fechaMesAno >= inicioMesAno && fechaMesAno <= finMesAno;
                    };

                    const fechaEntrada_ISO = `${fechaEntradaSeleccionada.ano}-${String(fechaEntradaSeleccionada.mes).padStart(2, "0")}-${String(fechaEntradaSeleccionada.dia).padStart(2, "0")}`
                    const fechaSalida_ISO = `${fechaSalidaSeleccionada.ano}-${String(fechaSalidaSeleccionada.mes).padStart(2, "0")}-${String(fechaSalidaSeleccionada.dia).padStart(2, "0")}`

                    for (let numeroDia = 0; numeroDia < numeroDiasPorMes; numeroDia++) {
                        const diaFinal_decimal = parseInt(numeroDia + 1, 10);
                        const bloqueDia = document.createElement("li")
                        bloqueDia.setAttribute("class", "dia")
                        bloqueDia.innerText = diaFinal_decimal

                        if (diaFinal_decimal === 1) {
                            bloqueDia.style.gridColumnStart = posicionDia1
                        }
                        bloqueDia.setAttribute("dia", diaFinal_decimal)



                        if (calendario.tiempo === "presente") {
                            if (diaFinal_decimal === diaActual_decimal) {
                                bloqueDia.style.border = "3px solid ghostwhite"
                            }
                        }

                        if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaParcial") {
                            bloqueDia.classList.add("calendarioDiaParcial")
                        }

                        if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaCompleto") {
                            bloqueDia.classList.add("calendarioDiaCompleto")
                        }

                        if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaCompleto") {
                            //  bloqueDia.classList.remove("calendarioDiaDisponible")
                            bloqueDia.classList.add("calendarioDiaCompleto")
                        }

                        if (Object.keys(fechaEntradaSeleccionada).length && Object.keys(fechaSalidaSeleccionada).length) {

                            if (
                                (mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano)
                                &&
                                (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano)
                            ) {
                                // si es mes de entrada y salida
                                console.log("41")

                                if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaSeleccionado")
                                    bloqueDia.setAttribute("estadoDia", "seleccionado")
                                    bloqueDia.addEventListener("click", eval(metodoSelectorDia))

                                }
                                if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaNoDisponible")

                                }
                                if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                    if (seleccionableDiaLimite === "si") {
                                        bloqueDia.classList.add("calendarioDiaReserva")
                                        bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                        bloqueDia.setAttribute("estadoDia", "disponible")


                                    } else {
                                        bloqueDia.classList.add("calendarioDiaReservaLimite")
                                    }
                                }
                                if (diaFinal_decimal > fechaEntradaSeleccionada.dia && diaFinal_decimal < fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaReserva")
                                    bloqueDia.setAttribute("estadoDia", "disponible")
                                    bloqueDia.addEventListener("click", eval(metodoSelectorDia))



                                }
                                if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                    bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                    bloqueDia.setAttribute("estadoDia", "disponible")
                                }

                            } else if ((mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano)) {
                                // Si es mes de entrada
                                console.log("1")

                                if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                    if (seleccionableDiaLimite === "si") {
                                        bloqueDia.classList.add("calendarioDiaDisponible")
                                        bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                        bloqueDia.setAttribute("estadoDia", "disponible")
                                    } else {
                                        bloqueDia.classList.add("calendarioDiaReservaLimite")
                                    }
                                }
                                if (diaFinal_decimal > fechaEntradaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaReserva")
                                    bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                    bloqueDia.setAttribute("estadoDia", "disponible")

                                }
                                if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                    // replicar esto
                                    if (bloqueDia.getAttribute("estadoDia") === "noDisponible") {
                                    }
                                    bloqueDia.classList.add("calendarioDiaNoDisponible")
                                }

                                if (calendario.tiempo === "futuro") {
                                    if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                        // bloqueDia.classList.add("calendarioDiaDisponible")
                                    }
                                }
                            } else if (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano) {
                                console.log("2")
                                // si es mes de salida pero no de entrada
                                if (diaFinal_decimal < fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaReserva")
                                    bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                    bloqueDia.setAttribute("estadoDia", "disponible")

                                }
                                if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaDisponible")

                                }
                                if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaSeleccionado")
                                    bloqueDia.setAttribute("estadoDia", "seleccionado")

                                }
                            } else {
                                // Entonces ver si es mes intermedio
                                if (verificaRangoInternamente(mesActual_decimal, anoActual_decimal, fechaEntrada_ISO, fechaSalida_ISO)) {
                                    bloqueDia.classList.add("calendarioDiaReserva")
                                    bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                    bloqueDia.setAttribute("estadoDia", "disponible")

                                } else {
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                    bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                    bloqueDia.setAttribute("estadoDia", "disponible")
                                }

                            }
                        }
                        else if (Object.keys(fechaEntradaSeleccionada).length && !Object.keys(fechaSalidaSeleccionada).length) {
                            if (mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano) {
                                if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                    if (seleccionableDiaLimite === "si") {
                                        bloqueDia.classList.add("calendarioDiaDisponible")
                                        bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                        bloqueDia.setAttribute("estadoDia", "disponible")
                                    } else {
                                        bloqueDia.classList.add("calendarioDiaReservaLimite")
                                    }
                                }
                                if (diaFinal_decimal > fechaEntradaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                    bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                    bloqueDia.setAttribute("estadoDia", "disponible")
                                }
                                if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaNoDisponible")
                                }
                            } else {
                                bloqueDia.classList.add("calendarioDiaDisponible")
                                bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                bloqueDia.setAttribute("estadoDia", "disponible")

                            }



                        }
                        else if (Object.keys(fechaSalidaSeleccionada).length && !Object.keys(fechaEntradaSeleccionada).length) {
                            if (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano) {
                                if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaSeleccionado")
                                    bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                    bloqueDia.setAttribute("estadoDia", "seleccionado")

                                }
                                if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                    bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                    bloqueDia.setAttribute("estadoDia", "disponible")
                                }
                                if (diaFinal_decimal < fechaSalidaSeleccionada.dia) {
                                    bloqueDia.classList.add("calendarioDiaDisponible")
                                    bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                    bloqueDia.setAttribute("estadoDia", "disponible")
                                }
                            } else {
                                bloqueDia.classList.add("calendarioDiaDisponible")
                                bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                bloqueDia.setAttribute("estadoDia", "disponible")

                            }
                        } else if (!Object.keys(fechaSalidaSeleccionada).length && !Object.keys(fechaEntradaSeleccionada).length) {

                            if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                bloqueDia.classList.add("calendarioDiaDisponible")
                                bloqueDia.addEventListener("click", eval(metodoSelectorDia))
                                bloqueDia.setAttribute("estadoDia", "disponible")
                            }

                        }
                        marcoMes.appendChild(bloqueDia)
                    }
                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"

                    if (Object.keys(fechaEntradaSeleccionada).length) {
                        if (anoActual_decimal > fechaEntradaSeleccionada.ano) {
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
                        } else if (anoActual_decimal === fechaEntradaSeleccionada.ano && mesActual_decimal > fechaEntradaSeleccionada.mes) {
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
                        } else {
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 0
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"
                        }
                    } else {
                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
                    }




                }

                if (instanciaUID_procesoCambioMes) {
                    const selectorMarcoMesRenderizadoEnEspera = selectorCalendarioRenderizado
                        .querySelector(`[inctanciaUID_procesoCambioMes="${instanciaUID_procesoCambioMes}"]`)
                    if (!selectorMarcoMesRenderizadoEnEspera) {
                        return
                    }
                }
                if (selectorCalendarioRenderizado) {
                    selectorCalendarioRenderizado.querySelector("[contenedor=contruyendoCalendario]")?.remove()
                    selectorCalendarioRenderizado.querySelector("[contenedor=calendario]").removeAttribute("style")
                }
            } catch (errorCapturado) {
                throw errorCapturado

            }

        },
        resolverCalendarioNuevo: async (calendario) => {

            calendario.zona = "componentes/calendario"
            const respuestaServidor = await casaVitini.componentes.servidor(calendario)

            if (respuestaServidor?.error) {
                const selectorContenedorCalendario = document.querySelectorAll("[componente=bloqueCalendario]")
                selectorContenedorCalendario.forEach((bloqueCalendario) => {
                    bloqueCalendario.remove()
                })
                return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
            }

            if (respuestaServidor?.calendario) {
                return respuestaServidor;

            }
        },
        navegacionCalendarioNuevo: async (calendario) => {

            const boton = calendario.target.getAttribute("sentido")
            const selectorBotones = calendario.target.closest("[contenedor=calendario]").querySelectorAll("[sentido]")
            selectorBotones.forEach((botonRenderizado) => {
                botonRenderizado.style.pointerEvents = "none"
            })

            const instanciaUID = calendario.target.closest("[instanciaUID]").getAttribute("instanciaUID")
            let mesActual = Number(document.querySelector("[componente=mesReferencia]").getAttribute("mes"))
            let anoActual = Number(document.querySelector("[componente=mesReferencia]").getAttribute("ano"))
            const instanciaUID_procesoCambioMes = casaVitini.componentes.codigoFechaInstancia()

            if (boton === "adelante") {
                if (mesActual + 1 < 13) {
                    mesActual = mesActual + 1
                } else {
                    mesActual = 1
                    anoActual = anoActual + 1
                }
            }

            if (boton === "atras") {
                if (mesActual - 1 > 0) {
                    mesActual = mesActual - 1
                } else {
                    mesActual = 12
                    anoActual = anoActual - 1
                }
            }

            const calendarioContruir = {
                tipo: "personalizado",
                comando: "construyeObjeto",
                ano: anoActual,
                mes: mesActual
            }

            const calendarioResuelto = await casaVitini.componentes.resolverCalendarioNuevo(calendarioContruir)
            calendarioResuelto.instanciaUID = instanciaUID
            calendarioResuelto.instanciaUID_procesoCambioMes = instanciaUID_procesoCambioMes

            const calendarioRenderizado = document.querySelector(`[instanciaUID="${instanciaUID}"]`)

            const selectorDiasRenderizados = calendarioRenderizado.querySelectorAll("[dia]")
            selectorDiasRenderizados.forEach((diaRenderizado) => {
                diaRenderizado.remove()
            })
            const contenedorCalendario = calendarioRenderizado.querySelector(`[contenedor=calendario]`)
            const selectorMarcoMesRenderizado = calendarioRenderizado.querySelector(`[componente=marcoMes]`)
            selectorMarcoMesRenderizado.setAttribute("inctanciaUID_procesoCambioMes", instanciaUID_procesoCambioMes)

            const contenedorContruyendoCalendarioRenderizado = calendarioRenderizado.querySelectorAll("[contenedor=contruyendoCalendario]")
            contenedorContruyendoCalendarioRenderizado.forEach((contenedorRenderizado) => {
                contenedorRenderizado.remove()
            })

            const mensajeSpinner = "Construyendo mes..."
            const spinner = casaVitini.componentes.spinner(mensajeSpinner)
            const contenedorCarga = document.createElement("div")
            contenedorCarga.classList.add("componente_calendario_contenedoCarga_Mes")
            contenedorCarga.setAttribute("contenedor", "contruyendoCalendario")
            contenedorCarga.setAttribute("elemento", "flotante")

            contenedorCarga.appendChild(spinner)
            contenedorCalendario.appendChild(contenedorCarga)

            casaVitini.componentes.constructorMesNuevo(calendarioResuelto)

        },
        ocultarElementos: (e) => {

            if (e?.target) {
                const selectorFlotante = e.target.closest("[elemento]")?.getAttribute("elemento")
                if (selectorFlotante === "flotante") {
                    return
                }
                const selectorParalizador = e.target.closest("[paralizadorEvento]")?.getAttribute("paralizadorEvento")
                if (selectorParalizador === "ocultadorCalendarios") {
                    return
                }
            }

            const bloqueCalendario = document.querySelectorAll("[componente=bloqueCalendario]")
            bloqueCalendario.forEach(calendarioRenderizado => {
                calendarioRenderizado.remove()
            });

            document.removeEventListener("click", casaVitini.componentes.ocultarElementos)
        },
        seleccionarDiaProcesadoNuevo: (metadatosDia) => {

            let dia;
            let estadoDia;
            let diaSeleccionadoComoElemento;

            if (metadatosDia.tipo === "desdeClick") {
                dia = metadatosDia.diaSeleccionado
                estadoDia = metadatosDia.estadoDia
                diaSeleccionadoComoElemento = document.querySelector("li[dia='" + dia + "']")

            }
            if (typeof metadatosDia === "number") {
                dia = metadatosDia;
                diaSeleccionadoComoElemento = document.querySelector("li[dia='" + dia + "']")
            }

            let calendario = document.querySelector("[componente=bloqueCalendario] [componente=marcoCalendario]")

            let calendarioIO = calendario.getAttribute("calendarioIO")
            let botonAtras = document.querySelector("#botonAtras")
            let botonAdelante = document.getElementById("botonAdelante")
            let fechaEntrada = document.getElementById("fechaEntrada")
            let fechaSalida = document.getElementById("fechaSalida")
            let almacenamientoLocalID = calendario.getAttribute("almacenamientoCalendarioID")
            let perfilMes = calendario.getAttribute("perfilMes")

            // let InformacionProceso = document.getElementById("InfoProceso")
            let tiempo = document.querySelector("[componente=mesReferencia]").getAttribute("tiempo")
            let reserva = localStorage.getItem(almacenamientoLocalID) ? JSON.parse(localStorage.getItem(almacenamientoLocalID)) : {};

            if (diaSeleccionadoComoElemento.getAttribute("estadoDia") === "seleccionado") {

                if (diaSeleccionadoComoElemento.getAttribute("tipoDia") === "hoy") {
                    diaSeleccionadoComoElemento.style.background = "red"
                    diaSeleccionadoComoElemento.style.color = ""
                } else {
                    diaSeleccionadoComoElemento.style.background = ""
                    diaSeleccionadoComoElemento.style.color = ""
                }







                if (calendarioIO === "entrada") {
                    fechaEntrada.innerText = 'Seleccionar dia de entrada'

                    delete reserva.entrada
                    document.querySelector("[calendario=entrada]").removeAttribute("memoriaVolatil")
                }
                if (calendarioIO === "salida") {
                    fechaSalida.innerText = 'Seleccionar dia de salida2'
                    delete reserva.salida
                    document.querySelector("[calendario=salida]").removeAttribute("memoriaVolatil")

                }



                diaSeleccionadoComoElemento.removeAttribute("estadoDia")
                document.getElementById("botonSiguientePaso")?.remove()

                localStorage.setItem(almacenamientoLocalID, JSON.stringify(reserva))
                return
            }

            let diasDisponibles = document.querySelectorAll("[estado=disponible]")
            for (const diaDisponible of diasDisponibles) {
                if (diaDisponible.getAttribute("estado") !== "deshabilitado") {
                    diaDisponible.style.background = ""
                    diaDisponible.style.color = ""
                    diaDisponible.removeAttribute("estadoDia")
                    diaDisponible.style.pointerEvents = "all"

                }
                if (diaDisponible.getAttribute("tipoDia") === "hoy") {
                    // diaDisponible.style.background = "green"
                    // diaDisponible.style.color = ""
                    diaDisponible.removeAttribute("estadoDia")
                    diaDisponible.style.pointerEvents = "all"
                }
            }

            diaSeleccionadoComoElemento.style.background = "black"
            diaSeleccionadoComoElemento.style.color = "white"
            diaSeleccionadoComoElemento.setAttribute("estadoDia", "seleccionado")

            let anoSeleccionado = document.querySelector("[componente=mesReferencia]").getAttribute("ano")
            let mesSeleccionado = document.querySelector("[componente=mesReferencia]").getAttribute("mes")
            let diaSeleccionado = dia

            let botonSiguientePaso = document.createElement("p")
            botonSiguientePaso.setAttribute("id", "botonSiguientePaso")
            botonSiguientePaso.setAttribute("class", "reservaInformacion")
            botonSiguientePaso.addEventListener("click", casaVitini.componentes.cambiarVista)

            let contructorInformacion;
            let diaIO;
            let reserva_

            if (calendarioIO === "entrada") {
                const fechaEntrada_Humano = `${diaSeleccionado}/${mesSeleccionado}/${anoSeleccionado}`
                fechaEntrada.innerText = fechaEntrada_Humano

                contructorInformacion = "Entrada el " + diaSeleccionado + " del " + mesSeleccionado + " del " + anoSeleccionado
                botonSiguientePaso.setAttribute("vista", "/reservas/salida")
                botonSiguientePaso.innerText = "Ir a seleccionar el día de salida44"

                document.querySelector("[calendario=entrada]").setAttribute("memoriaVolatil", fechaEntrada_Humano)

            }

            if (calendarioIO === "salida") {
                const fechaSalida_humano = `${diaSeleccionado}/${mesSeleccionado}/${anoSeleccionado}`
                fechaSalida.innerText = fechaSalida_humano

                contructorInformacion = "Salida el " + diaSeleccionado + " del " + mesSeleccionado + " del " + anoSeleccionado
                botonSiguientePaso.setAttribute("vista", "/reservas/alojamiento")
                botonSiguientePaso.innerText = "Ir a seleccionar el alojamiento"

                document.querySelector("[calendario=salida]").setAttribute("memoriaVolatil", fechaSalida_humano)

            }



        },
        seleccionarDiaNuevo: (dia) => {
            let diaSeleccionado
            if (typeof dia === "number") {
                metadatosDia = dia
                casaVitini.componentes.seleccionarDiaProcesadoNuevo(metadatosDia)
            }

            if (dia?.target?.getAttribute("dia")) {
                diaSeleccionado = dia.target.getAttribute("dia")
                let estadoDia = dia.target.getAttribute("estadoDia")
                let metadatosDia = {
                    "diaSeleccionado": diaSeleccionado,
                    "estadoDia": estadoDia,
                    "tipo": "desdeClick"
                }
                casaVitini.componentes.seleccionarDiaProcesadoNuevo(metadatosDia)
            }
        },
        square: {
            crearSesionPago: async (instanciaUID) => {

                const transaccion = {
                    zona: "componentes/pasarela/squareConstruyeCliente"
                };
                const respuestaServidor = await casaVitini.componentes.servidor(transaccion)
                if (respuestaServidor?.error) {
                    return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
                }
                const selectorSesionesPago = [...document.querySelectorAll("#sessionPagoSquare")]
                selectorSesionesPago.map(session => {
                    session.remove()
                })
                const metadataClienteSquare = document.createElement("script")
                metadataClienteSquare.setAttribute("id", "sessionPagoSquare")
                metadataClienteSquare.setAttribute("type", "text/javascript")
                metadataClienteSquare.innerHTML = `
                window.applicationId="${respuestaServidor?.squareApplicationId}";
                window.locationId="${respuestaServidor?.squareLocationId}";
                window.currency="${respuestaServidor?.squareAccountCurrency}";
                window.country="${respuestaServidor?.squareAccountCountry}";
                window.idempotencyKey="${respuestaServidor?.idempotencyKey}"
                `
                const selectorSquareJS = document.querySelector("section:not([estado=obsoleto])")

                const instanciaUIDRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (instanciaUIDRenderizada) {
                    selectorSquareJS.insertAdjacentElement("afterend", metadataClienteSquare);

                }
            },
            inyectorSquareJS: async (instanciaUID) => {
                return new Promise((resolve, reject) => {
                    const selectorMotorarranque = document.querySelector("[square=motorarranque]")
                    const squareJS = document.createElement("script");
                    squareJS.setAttribute("type", "text/javascript");
                    //squareJS.setAttribute("src", "https://web.squarecdn.com/v1/square.js");
                    squareJS.setAttribute("src", "https://sandbox.web.squarecdn.com/v1/square.js");
                    squareJS.setAttribute("id", "squareJS")
                    squareJS.onload = resolve;
                    squareJS.onerror = () => {
                        reject(new Error("Error al cargar el archivo square.js"))
                    }


                    const instanciaUIDRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                    if (instanciaUIDRenderizada) {
                        selectorMotorarranque.insertAdjacentElement("afterend", squareJS);
                    }
                })
            },
            inyectorMetodosPago: async (instanciaUID) => {
                return new Promise((resolve, reject) => {
                    const seccion = document.querySelector("section:not([estado=obsoleto])")

                    let metodoPagoCargadoCorrectamente = 0;
                    const totalMetodosPago = 4;
                    const metodosPago = [
                        "/componentes/javascript/square/sq-ach.js",
                        "/componentes/javascript/square/sq-apple-pay.js",
                        "/componentes/javascript/square/sq-google-pay.js",
                        "/componentes/javascript/square/sq-card-pay.js"
                    ];
                    metodosPago.forEach(metodoPago => {
                        const metodoPagoElemento = document.createElement('script');
                        metodoPagoElemento.setAttribute("type", "text/javascript")
                        metodoPagoElemento.src = metodoPago;
                        metodoPagoElemento.onload = () => {
                            metodoPagoCargadoCorrectamente++;
                            if (metodoPagoCargadoCorrectamente === totalMetodosPago) {
                                resolve();
                            }
                        };
                        metodoPagoElemento.onerror = () => {
                            reject(new Error(`Error al cargar el metodo de pago: ${metodoPago}`));
                        };
                        const instanciaUIDRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)

                        if (instanciaUIDRenderizada) {
                            seccion.appendChild(metodoPagoElemento);
                        }
                    });
                });

            },
            inyectorFlujoPago: async (instanciaUID) => {
                return new Promise((resolve, reject) => {
                    const seccion = document.querySelector("section:not([estado=obsoleto])")
                    const flujoPago = document.createElement("script");
                    flujoPago.setAttribute("type", "text/javascript");
                    flujoPago.setAttribute("src", "/componentes/javascript/square/sq-payment-flow.js");
                    flujoPago.onload = resolve;
                    flujoPago.onerror = () => {
                        reject(new Error("Error al cargar el archivo sq-payment-flow.js"))
                    }
                    const instanciaUIDRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                    if (instanciaUIDRenderizada) {
                        seccion.appendChild(flujoPago)
                    }
                })
            },
            uiForm: (destino) => {

                const selectorDestino = document.querySelector(destino);
                if (selectorDestino === null) {
                    const error = "casaVitini.componentes.square.intectorFlujoPago no encuentra el elemento de destino"
                    return casaVitini.ui.vistas.advertenciaInmersiva(error)

                }

                // Crear el formulario
                const paymentForm = document.createElement("form");
                paymentForm.className = "payment-form";
                paymentForm.id = "fast-checkout";

                // Crear el contenedor principal
                const wrapperDiv = document.createElement("div");
                wrapperDiv.className = "wrapper";
                paymentForm.appendChild(wrapperDiv);

                // Crear el contenedor de Apple Pay
                const applePayButton = document.createElement("div");
                applePayButton.id = "apple-pay-button";
                applePayButton.alt = "apple-pay";
                applePayButton.type = "button";
                wrapperDiv.appendChild(applePayButton);

                // Crear el contenedor de Google Pay
                const googlePayButton = document.createElement("div");
                googlePayButton.id = "google-pay-button";
                googlePayButton.alt = "google-pay";
                googlePayButton.type = "button";
                wrapperDiv.appendChild(googlePayButton);

                // Crear el contenedor con borde y número
                let borderDiv = document.createElement("div");
                borderDiv.className = "border";
                wrapperDiv.appendChild(borderDiv);

                const numberSpan = document.createElement("span");
                numberSpan.textContent = "O";
                borderDiv.appendChild(numberSpan);

                // Crear el contenedor de ACH
                const achWrapperDiv = document.createElement("div");
                achWrapperDiv.id = "ach-wrapper";
                wrapperDiv.appendChild(achWrapperDiv);

                const achLabel = document.createElement("label");
                achLabel.htmlFor = "ach-account-holder-name";
                achLabel.textContent = "Full Name";
                achWrapperDiv.appendChild(achLabel);

                const achInput = document.createElement("input");
                achInput.id = "ach-account-holder-name";
                achInput.type = "text";
                achInput.placeholder = "Jane Doe";
                achInput.name = "ach-account-holder-name";
                achInput.autocomplete = "name";
                achWrapperDiv.appendChild(achInput);

                const achMessageSpan = document.createElement("span");
                achMessageSpan.id = "ach-message";
                achWrapperDiv.appendChild(achMessageSpan);

                const achButton = document.createElement("button");
                achButton.id = "ach-button";
                achButton.type = "button";
                achButton.textContent = "Pay with Bank Account";
                achWrapperDiv.appendChild(achButton);

                // Crear el segundo contenedor con borde y texto OR
                borderDiv = document.createElement("div");
                borderDiv.className = "border";
                //wrapperDiv.appendChild(borderDiv);

                const orSpan = document.createElement("span");
                orSpan.textContent = "OR";
                //borderDiv.appendChild(orSpan);

                // Crear el contenedor de tarjeta
                const cardContainerDiv = document.createElement("div");
                cardContainerDiv.id = "card-container";
                wrapperDiv.appendChild(cardContainerDiv);

                // Crear el botón de tarjeta
                const cardButton = document.createElement("button");
                cardButton.id = "card-button";
                cardButton.type = "button";
                cardButton.textContent = "Pagar reserva y confirmarla";
                wrapperDiv.appendChild(cardButton);

                // Crear el mensaje de flujo de pago
                const paymentFlowMessageSpan = document.createElement("span");
                paymentFlowMessageSpan.id = "payment-flow-message";
                wrapperDiv.appendChild(paymentFlowMessageSpan);

                selectorDestino.appendChild(paymentForm);
            }
        },
        flujoPagoUI: {
            desplegarUI: (mensaje) => {
                document.body.style.overflow = 'hidden';
                const advertenciaInmersivaUI = document.createElement("section")
                advertenciaInmersivaUI.setAttribute("class", "advertenciaInmersiva")
                advertenciaInmersivaUI.setAttribute("componente", "advertenciaInmersiva")


                const spinnerContainer = document.createElement('div');
                spinnerContainer.setAttribute("componente", "iconoFlujoPago");
                spinnerContainer.classList.add("lds-spinner");

                for (let i = 0; i < 12; i++) {
                    const div = document.createElement('div');
                    spinnerContainer.appendChild(div);
                }
                advertenciaInmersivaUI.appendChild(spinnerContainer)

                const info = document.createElement("div")
                info.setAttribute("class", "advertenciaInfoFlujoPago")
                info.setAttribute("componente", "mensajeFlujoPasarela")
                info.innerText = mensaje
                advertenciaInmersivaUI.appendChild(info)

                document.body.appendChild(advertenciaInmersivaUI)
            },

            botonAcetpar: () => {
                const boton = document.createElement("div")
                boton.setAttribute("class", "errorBoton")
                boton.innerText = "Aceptar"
                boton.addEventListener("click", casaVitini.componentes.limpiarAdvertenciasInmersivas)
                return boton
            },
            infoDuranteFlujo: (mensaje) => {

                const contenedorMensaje = document.querySelector("[componente=mensajeFlujoPasarela]")
                contenedorMensaje.innerText = "Comprodando datos para realizar el pago..."
            },
            errorInfo: (mensaje) => {
                document.querySelector("[componente=iconoFlujoPago]")?.remove()

                const contenedorMensaje = document.querySelector("[componente=mensajeFlujoPasarela]")
                contenedorMensaje.innerText = mensaje

                const advertenciaInmersivaUI = document.querySelector("[componente=advertenciaInmersiva]")
                const botonAceptar = casaVitini.componentes.flujoPagoUI.botonAcetpar()
                advertenciaInmersivaUI.appendChild(botonAceptar)

            }

        },
        obtenerPrecioReserva: async (metadatos) => {
            const tipoFormatoReserva = metadatos.tipoFormatoReserva
            if (tipoFormatoReserva !== "objetoLocal_reservaNoConfirmada" && tipoFormatoReserva !== "uid" && tipoFormatoReserva !== "objetoDedicado") {
                const error = "obenerPrecioReserva necesita un tipoFormatoReserva, este puede ser objetoLocal, uid, objetoDedicado"
                return casaVitini.ui.vistas.advertenciaInmersiva(error)

            }

            if (tipoFormatoReserva === "objetoLocal_reservaNoConfirmada") {
                const reservaObjetoLocal = sessionStorage.getItem("reserva") ? JSON.parse(sessionStorage.getItem("reserva")) : null;
                if (!reservaObjetoLocal) {
                } else {
                    const transaccion = {
                        zona: "componentes/precioReserva",
                        tipoProcesadorPrecio: "objeto",
                        reserva: reservaObjetoLocal
                    }
                    const respuestaServidor = await casaVitini.componentes.servidor(transaccion)
                    if (respuestaServidor?.error) {
                        return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
                    }
                    if (respuestaServidor?.ok) {
                        return respuestaServidor?.ok
                    }
                }
            }


        },
        ocultarMenusVolatiles: (menuVolatil) => {
            const componente = menuVolatil?.target.getAttribute("componente")

            if (componente === "menuDesplegable") {
                return
            }
            if (componente !== "menuVolatil") {
                document.removeEventListener("click", casaVitini.componentes.ocultarMenusVolatiles)
                const selectorMenusVolatiles = [...document.querySelectorAll("[componente=menuVolatil]")]

                selectorMenusVolatiles.map(menuVolatil => {
                    menuVolatil.remove()
                })
            }

            const selectoresErrorUI = [...document.querySelectorAll("[componente=errorUI]")]
            selectoresErrorUI.map((errorUI) => {
                errorUI.remove()
                document.removeEventListener("click", casaVitini.componentes.ocultarMenusVolatiles)

            })
        },
        ocultarMenusVolatilesPorRedimension: () => {
            const selectorMenusVolatiles = [...document.querySelectorAll("[componente=menuVolatil]")]

            selectorMenusVolatiles.map(menuVolatil => {
                menuVolatil.remove()
            })
        },
        limpiarAdvertenciasInmersivas: () => {
            document.body.style.removeProperty("overflow")
            document.querySelectorAll("[componente=bloqueCalendario]").forEach((calendarioRenderizado) => {
                calendarioRenderizado.remove()
            })
            document.querySelectorAll("[componente=advertenciaInmersiva]").forEach((advertenciaInmersiva) => {
                advertenciaInmersiva.remove()
            })
        },
        limpiarTodoElementoVolatil: () => {
            document.querySelectorAll("[componente=menuVolatil]").forEach((menuVolatil) => {
                menuVolatil.remove()
            })

        },
        iconoProceso: () => {
            // Crea el elemento div con la clase "iconoProceso"
            const iconoProcesoDiv = document.createElement('div');
            iconoProcesoDiv.className = 'iconoProceso';
            iconoProcesoDiv.setAttribute("componente", "iconoProceso")

            // Crea los 12 elementos div internos y los agrega al div principal
            for (let i = 0; i < 12; i++) {
                const divInterno = document.createElement('div');
                iconoProcesoDiv.appendChild(divInterno);
            }

            // Agrega el div principal al cuerpo del documento (puedes ajustar esto según tu estructura HTML)
            return iconoProcesoDiv;

        },
        codigoFechaInstancia: () => {
            const fecha = new Date();

            const año = fecha.getFullYear();
            const mes = String(fecha.getMonth() + 1).padStart(2, "0"); // El mes es de 0 a 11, así que sumamos 1.
            const dia = String(fecha.getDate()).padStart(2, "0");

            const horas = String(fecha.getHours()).padStart(2, "0");
            const minutos = String(fecha.getMinutes()).padStart(2, "0");
            const segundos = String(fecha.getSeconds()).padStart(2, "0");
            const milisegundos = String(fecha.getMilliseconds()).padStart(3, "0");

            const fechaNumerica = `${año}${mes}${dia}${horas}${minutos}${segundos}${milisegundos}`;
            return fechaNumerica;
        },
        spinner: (mensaje) => {
            const contenedorSpinner = document.createElement("div")
            contenedorSpinner.classList.add("contenedorSpinner")
            contenedorSpinner.setAttribute("componente", "spinnerListaDeEnlaces")
            contenedorSpinner.setAttribute("contenedor", "spinner")


            const spinnerContainer = document.createElement('div');
            spinnerContainer.setAttribute("componente", "iconoCargaEnlace");
            spinnerContainer.classList.add("lds-spinner");

            for (let i = 0; i < 12; i++) {
                const div = document.createElement('div');
                spinnerContainer.appendChild(div);
            }
            const info = document.createElement("div")
            info.setAttribute("class", "advertenciaInfoFlujoPago")
            info.setAttribute("componente", "mensajeFlujoPasarela")
            info.innerText = mensaje

            const botoCancelar = document.createElement("div")
            botoCancelar.setAttribute("class", "botonV1AdvertenciaInmersiva")
            botoCancelar.innerText = "Cancelar"
            botoCancelar.addEventListener("click", casaVitini.componentes.limpiarAdvertenciasInmersivas)

            contenedorSpinner.appendChild(spinnerContainer)
            contenedorSpinner.appendChild(info)
            contenedorSpinner.appendChild(botoCancelar)
            return contenedorSpinner
        },
        spinnerSimple: () => {
            const contenedorSpinner = document.createElement("div")
            contenedorSpinner.classList.add("contenedorSpinner")
            contenedorSpinner.setAttribute("componente", "spinnerSimple")
            contenedorSpinner.setAttribute("contenedor", "spinner")


            const spinnerContainer = document.createElement('div');
            spinnerContainer.setAttribute("componente", "iconoCargaEnlace");
            spinnerContainer.classList.add("lds-spinner");

            for (let i = 0; i < 12; i++) {
                const div = document.createElement('div');
                spinnerContainer.appendChild(div);
            }

            contenedorSpinner.appendChild(spinnerContainer)
            return contenedorSpinner
        },
        loginUI: async () => {
            casaVitini.componentes.limpiarAdvertenciasInmersivas()
            const url = window.location.pathname;
            const zona = {
                vista: url,
                tipoOrigen: "historial",
            }
            await casaVitini.componentes.controladorVista(zona)
        },
        ui: {
            grid: (metadatos) => {

                const filas = metadatos.filas
                const sentidoColumna = metadatos.sentidoColumna ? metadatos.sentidoColumna : ""
                const nombreColumna = metadatos.nombreColumna ? metadatos.nombreColumna : ""
                const tipoConstruccionGrid = metadatos.tipoConstruccionGrid
                const buscar = metadatos.buscar
                const pagina = metadatos.pagina

                const metodoFila = metadatos.metodoFila
                const metodoColumna = metadatos.metodoColumna

                const numeroColumnas = metadatos.numeroColumnas
                const mascaraHref = metadatos.mascaraHref
                const columnasGrid = metadatos.columnasGrid
                const gridUID = metadatos.gridUID
                const destino = metadatos.destino

                const mascaraURL = metadatos.mascaraURL
                const parametros = metadatos.parametros ? metadatos.parametros : {}

                if (!filas) {
                    const error = "no estoy recibiendo contenido para las filas, recuerda que constructorGridClientes, necesita el objeto ya proceador por el servidor, no lo envia"
                    return casaVitini.ui.vistas.advertenciaInmersiva(error)
                }

                if (tipoConstruccionGrid !== "soloLista" && tipoConstruccionGrid !== "total") {
                    const error = "El constructor de gris necesita saber el tipo de construccion, si es total o soloLista"
                    return casaVitini.ui.vistas.advertenciaInmersiva(error)
                }
                if (!metodoFila) {
                    const error = "No se esta pasando un metodo para la fila"
                    return casaVitini.ui.vistas.advertenciaInmersiva(error)
                }

                if (!Number.isInteger(numeroColumnas) || numeroColumnas <= 0) {
                    const error = "Falta especificar el numero de columnas"
                    return casaVitini.ui.vistas.advertenciaInmersiva(error)

                }

                // grid-template-columns: 100px auto auto auto auto auto;
                let valorCssGridColumnas = "";
                for (let i = 0; i < numeroColumnas; i++) {
                    if (i === 0) {
                        valorCssGridColumnas += "auto";
                    } else {
                        valorCssGridColumnas += " auto";
                    }
                }
                const metadatosBusqueda = {
                    buscar: buscar,
                    pagina: pagina,
                    sentidoColumna: sentidoColumna,
                    nombreColumna: nombreColumna,
                    numeroColumnas: numeroColumnas,
                    metodoFila: metodoFila
                }

                const gridConstruido = document.querySelector(`[gridUID=${gridUID}]`)
                const constructorGrid = document.createElement("div")
                constructorGrid.setAttribute("class", "administracionGridReservas")
                constructorGrid.style.gridTemplateColumns = valorCssGridColumnas
                constructorGrid.setAttribute("gridUID", gridUID)
                constructorGrid.setAttribute("terminoBusqueda", buscar)
                constructorGrid.setAttribute("nombreColumnaSeleccionada", nombreColumna)
                constructorGrid.setAttribute("sentidoColumna", sentidoColumna)
                constructorGrid.setAttribute("numeroPagina", pagina)
                constructorGrid.setAttribute("parametros", JSON.stringify(parametros))
                constructorGrid.setAttribute("mascaraURL", mascaraURL)
                const selectorTitulosColumnas = [...document.querySelectorAll("[componenteGrid=celdaTituloColumna]")]
                selectorTitulosColumnas.map((celdaTituloColumna) => {
                    celdaTituloColumna.style.removeProperty("background")
                    celdaTituloColumna.querySelector("[sentidoIconos]")?.remove()
                })
                let icononombreColumna
                let descripcionnombreColumna

                if (sentidoColumna) {
                    if (sentidoColumna === "ascendente") {
                        icononombreColumna = "/componentes/iconos/ascendente.svg"
                        descripcionnombreColumna = "Ordenar acendentemente esta columna"
                    }
                    if (sentidoColumna === "descendente") {
                        icononombreColumna = "/componentes/iconos/descendente.svg"
                        descripcionnombreColumna = "Ordenar descendentemente esta columna"
                    }
                }
                const selectorColumnasRenderizadas = [...document.querySelectorAll(`[gridUID=${gridUID}] [nombreColumna]`)]
                selectorColumnasRenderizadas.map((columna) => {
                    columna.setAttribute("sentidoColumna", "")
                })


                if (tipoConstruccionGrid === "soloLista") {
                    if (nombreColumna) {




                        const columnaSeleccionada = document.querySelector(`[gridUID=${gridUID}] [componenteGrid=celdaTituloColumna][nombreColumna=${nombreColumna}]`)
                        columnaSeleccionada.setAttribute("sentidoColumna", sentidoColumna)
                        columnaSeleccionada.style.background = "pink"
                        const iconoColumna = document.createElement("img");
                        iconoColumna.src = icononombreColumna;
                        iconoColumna.alt = descripcionnombreColumna;
                        iconoColumna.classList.add("icononombreColumna");
                        iconoColumna.setAttribute("sentidoIconos", sentidoColumna)
                        columnaSeleccionada.appendChild(iconoColumna)

                        gridConstruido.setAttribute("nombreColumna", nombreColumna)
                        gridConstruido.setAttribute("sentidoColumna", sentidoColumna)



                    }
                }

                columnasGrid.map((detallesColumna) => {
                    const columnaElemento = document.createElement("div")
                    columnaElemento.innerText = detallesColumna.columnaUI
                    columnaElemento.classList.add(detallesColumna.columnaClase)
                    columnaElemento.classList.add("administracionReservasColumnaTitulo")
                    columnaElemento.setAttribute("nombreColumna", detallesColumna.columnaIDV)
                    columnaElemento.setAttribute("componenteGrid", "celdaTituloColumna")
                    columnaElemento.addEventListener("click", eval(metodoColumna))
                    if (nombreColumna === detallesColumna.columnaIDV) {
                        if (nombreColumna) {
                            columnaElemento.style.background = "pink"
                            columnaElemento.setAttribute("nombreColumna", detallesColumna.columnaIDV)
                            columnaElemento.setAttribute("sentidoColumna", sentidoColumna)

                            const iconoColumna = document.createElement("img");
                            iconoColumna.src = icononombreColumna;
                            iconoColumna.alt = descripcionnombreColumna;
                            iconoColumna.classList.add("icononombreColumna");
                            iconoColumna.setAttribute("sentidoIconos", sentidoColumna)
                            columnaElemento.appendChild(iconoColumna)
                        }
                    }
                    if (tipoConstruccionGrid === "total") {
                        constructorGrid.appendChild(columnaElemento)
                    }
                })
                if (tipoConstruccionGrid === "soloLista") {
                    const selectorFilasGrid = [...document.querySelectorAll("[componenteGrid=fila]")]
                    selectorFilasGrid.map((filaGrid) => {
                        filaGrid.remove()
                    })
                }
                filas.map((detallesFila) => {

                    const fila = document.createElement("a")
                    fila.setAttribute("class", "adminitracionReservasFila")
                    fila.setAttribute("componenteGrid", "fila")
                    fila.setAttribute("href", mascaraHref?.urlStatica + detallesFila[mascaraHref?.parametro])
                    fila.addEventListener("click", eval(metodoFila))

                    for (const detallesObjeto of Object.entries(detallesFila)) {
                        const celdaIDV = detallesObjeto[0]
                        const celdaUI = detallesObjeto[1]

                        const celdaReserva = document.createElement("div")
                        celdaReserva.setAttribute("class", "administracionCeldaEstiloCompartido")
                        celdaReserva.setAttribute("celdaIDV", celdaIDV)
                        celdaReserva.innerText = celdaUI
                        fila.appendChild(celdaReserva)
                    }

                    if (tipoConstruccionGrid === "soloLista") {
                        gridConstruido.setAttribute("numeroPagina", pagina)
                        gridConstruido.setAttribute("nombreColumnaSeleccionada", nombreColumna)
                        gridConstruido.setAttribute("sentidoColumna", sentidoColumna)

                        gridConstruido.appendChild(fila)
                    } else {
                        constructorGrid.appendChild(fila)
                    }

                })
                if (tipoConstruccionGrid === "total") {


                    document.querySelector(`[gridUID=${gridUID}]`)?.remove()
                    document.querySelector(`${destino}`)?.appendChild(constructorGrid)
                }


            },
            paginador: (metadatos) => {

                const paginaActual = metadatos.paginaActual
                const moverHaciaAdelanteNavegacion = metadatos.moverHaciaAdelanteNavegacion
                const mueveNavegadorHaciaAtras = metadatos.mueveNavegadorHaciaAtras
                const sentidoNavegacion = metadatos.sentidoNavegacion
                const posicionRelativa = metadatos.posicionRelativa
                const paginasTotales = metadatos.paginasTotales
                const cambiarPagina = metadatos.cambiarPagina
                const gridUID = metadatos.gridUID
                const metodoBoton = metadatos.metodoBoton
                const destino = metadatos.destino
                const granuladoURL = metadatos.granuladoURL

                let inicioPaginacion = paginaActual

                const constructorURL = (granuladoURL, pagina) => {

                    if (!granuladoURL) {
                        const error = "El constructor URL dentro del paginador necesita el gridUID"
                        return casaVitini.ui.vistas.advertenciaInmersiva(error)
                    }

                    if (!pagina) {
                        const error = "El constructor URL dentro del paginador necesita el pagina"
                        return casaVitini.ui.vistas.advertenciaInmersiva(error)
                    }
                    const directoriosFusion = granuladoURL.directoriosFusion
                    const parametros = granuladoURL.parametros
                    parametros.pagina = pagina


                    const parametrosArray = []
                    for (const [parametro, valor] of Object.entries(parametros)) {
                        const estructura = `${parametro}:${valor}`
                        parametrosArray.push(estructura)
                    }

                    const parametrosFusion = directoriosFusion + "/" + parametrosArray.join("/")
                    return parametrosFusion

                }

                const navegacionPaginacion = document.createElement("div")
                navegacionPaginacion.classList.add("administracionNavegacionPaginacion")
                navegacionPaginacion.setAttribute("componenteID", "navegacionPaginacion")
                navegacionPaginacion.setAttribute("gridUID_enlazado", gridUID)

                if (moverHaciaAdelanteNavegacion === "Desactivado" && sentidoNavegacion === "Adelante") {
                    inicioPaginacion = Number(document.querySelector("[posicionRelativa='1']").getAttribute("navegacionPagina"))
                }
                if (mueveNavegadorHaciaAtras === "Desactivado" && sentidoNavegacion === "Atras") {
                    if (posicionRelativa === 1) {
                        inicioPaginacion = paginaActual - (9)
                    }
                    if (posicionRelativa > 1) {
                        inicioPaginacion = Number(document.querySelector("[posicionRelativa='1']").getAttribute("navegacionPagina"))
                    }
                }
                if (cambiarPagina === "porNumeroDePagina") {
                    inicioPaginacion = Number(document.querySelector("[posicionRelativa='1']").getAttribute("navegacionPagina"))
                }

                if (paginaActual > 1) {
                    const navegacionPaginacionbotonAtras = document.createElement("a")
                    navegacionPaginacionbotonAtras.classList.add("navegacionPaginacion")
                    navegacionPaginacionbotonAtras.classList.add("navegacionPaginacionbotonAtras")
                    navegacionPaginacionbotonAtras.setAttribute("href", constructorURL(granuladoURL, (paginaActual - 1)))
                    navegacionPaginacionbotonAtras.addEventListener("click", (e) => {
                        e.preventDefault()
                        const estructura = {
                            gridUID: gridUID,
                            componenteID: "botonAtrasPaginacion",
                        }
                        const x = eval(metodoBoton)
                        return x(estructura);

                    })
                    navegacionPaginacionbotonAtras.innerText = "Atras"
                    navegacionPaginacion.appendChild(navegacionPaginacionbotonAtras)
                } else {
                    document.querySelector("[componenteID=botonAtrasPaginacion]")?.remove()
                }
                let numRedondeado
                if ((Math.floor(inicioPaginacion / 10) * 10) === inicioPaginacion) {
                    numRedondeado = inicioPaginacion - 9
                } else {
                    numRedondeado = (Math.floor(inicioPaginacion / 10) * 10) + 1;
                }

                for (let ciclo = 0; ciclo < 10; ciclo++) {
                    const numeroPagina = numRedondeado + ciclo
                    const numeroPaginaElemento = document.createElement("a")
                    numeroPaginaElemento.classList.add("numeroPaginaElemento")
                    numeroPaginaElemento.setAttribute("href", constructorURL(granuladoURL, numeroPagina))
                    numeroPaginaElemento.setAttribute("posicionRelativa", ciclo + 1)
                    const estructura = {
                        gridUID: gridUID,
                        componenteID: "numeroPagina",
                        numeroPagina: numeroPagina
                    }

                    if (numeroPagina === paginaActual) {
                        numeroPaginaElemento.setAttribute("paginaTipo", "actual")
                        numeroPaginaElemento.style.background = "blue"
                        numeroPaginaElemento.style.color = "white"
                        estructura.paginaTipo = "actual"
                    } else {
                        numeroPaginaElemento.setAttribute("paginaTipo", "otra")
                        numeroPaginaElemento.style.removeProperty("color")
                        numeroPaginaElemento.style.removeProperty("background")
                        estructura.paginaTipo = "otra"
                    }

                    numeroPaginaElemento.addEventListener("click", (e) => {
                        e.preventDefault()

                        const x = eval(metodoBoton)
                        return x(estructura);

                    })





                    numeroPaginaElemento.innerText = numeroPagina
                    if (numeroPagina <= paginasTotales) {
                        navegacionPaginacion.appendChild(numeroPaginaElemento)
                    } else {
                        break
                    }
                }

                const listaPaginacionResponsiva = document.createElement("select")
                listaPaginacionResponsiva.classList.add("componentes_ui_paginador_listaResponsiva")
                listaPaginacionResponsiva.addEventListener("change", (e) => {
                    e.preventDefault()
                    const estructura = {
                        gridUID: gridUID,
                        componenteID: "numeroPagina",
                        numeroPagina: e.target.value
                    }
                    const x = eval(metodoBoton)
                    return x(estructura);

                })


                for (let ciclo = 1; ciclo < (paginasTotales + 1); ciclo++) {
                    const numeroPagina = ciclo
                    const numeroPaginaElemento = document.createElement("option")
                    //numeroPaginaElemento.classList.add("numeroPaginaElemento")
                    numeroPaginaElemento.setAttribute("numeroPagina", numeroPagina)
                    numeroPaginaElemento.value = numeroPagina

                    //  numeroPaginaElemento.setAttribute("href", constructorURL(granuladoURL, numeroPagina))
                    if (numeroPagina === paginaActual) {
                        numeroPaginaElemento.setAttribute("paginaTipo", "actual")
                        numeroPaginaElemento.style.background = "blue"
                        numeroPaginaElemento.style.color = "white"
                        numeroPaginaElemento.selected = true
                        numeroPaginaElemento.disabled = true

                    } else {
                        numeroPaginaElemento.setAttribute("paginaTipo", "otra")
                        numeroPaginaElemento.style.removeProperty("color")
                        numeroPaginaElemento.style.removeProperty("background")
                    }
                    numeroPaginaElemento.innerText = "Página: " + numeroPagina
                    listaPaginacionResponsiva.appendChild(numeroPaginaElemento)

                }
                navegacionPaginacion.appendChild(listaPaginacionResponsiva)







                if (paginasTotales > 1 && paginaActual < paginasTotales) {
                    const navegacionPaginacionbotonAdelante = document.createElement("a")
                    navegacionPaginacionbotonAdelante.classList.add("navegacionPaginacion")
                    navegacionPaginacionbotonAdelante.classList.add("navegacionPaginacionbotonAdelante")
                    navegacionPaginacionbotonAdelante.setAttribute("href", constructorURL(granuladoURL, (paginaActual + 1)))
                    navegacionPaginacionbotonAdelante.addEventListener("click", (e) => {
                        e.preventDefault()
                        e.preventDefault()
                        const estructura = {
                            gridUID: gridUID,
                            componenteID: "botonAdelantePaginacion",
                        }
                        const x = eval(metodoBoton)
                        return x(estructura);
                    })
                    navegacionPaginacionbotonAdelante.innerText = "Adelante"
                    navegacionPaginacion.appendChild(navegacionPaginacionbotonAdelante)
                } else {
                    document.querySelector("[componenteID=botonAdelantePaginacion]")?.remove()
                }
                document.querySelector("[componenteID=navegacionPaginacion]")?.remove()

                if (Number(paginasTotales) > 1) {
                    document.querySelector(`${destino}`).appendChild(navegacionPaginacion)

                }
            },
            totales: (desgloseFinanciero) => {

                const totalesPorApartamento = desgloseFinanciero.totalesPorApartamento
                const totalesPorNoche = desgloseFinanciero.totalesPorNoche

                const totales = desgloseFinanciero.totales
                const desgloseImpuestos = desgloseFinanciero.impuestos
                const ofertas = desgloseFinanciero.ofertas

                const destino = desgloseFinanciero.destino
                const selectorDestino = document.querySelector(destino)
                console.log("selectorDestino", selectorDestino)
                if (!selectorDestino) {
                    const error = "totales no encuentra el elemento de destino, revisa el identificador del elemento"
                    return casaVitini.ui.vistas.advertenciaInmersiva(error)
                }

                const simboloDescuento = {
                    porcentaje: "%",
                    cantidadFija: "$"
                }
                ////////////////////////////////////////////
                const contenedorDesgloseTotales = document.createElement("div")
                contenedorDesgloseTotales.classList.add("componentes_ui_desloseTotales_contenedor")


                const detallePorDiaUI = document.createElement("div")
                detallePorDiaUI.classList.add("reserva_resumen_desglose_pago_bloque")

                const detalleDiaUITitulo = document.createElement("div")
                detalleDiaUITitulo.classList.add("reserva_resumen_desglose_pago_titulo")
                detalleDiaUITitulo.innerText = "Detalle por noche"
                detallePorDiaUI.appendChild(detalleDiaUITitulo)

                const contenedorDesglosePorNoche = document.createElement("div")
                contenedorDesglosePorNoche.classList.add("reserva_resumen_desglose_porNoche")

                if (totalesPorNoche.length === 0) {
                    const info = document.createElement("div")
                    info.classList.add("componentes_ui_totales_mensajeInfoSinInformacion")
                    info.innerText = "No hay información financiera para desglosar por noche"
                    contenedorDesglosePorNoche.appendChild(info)
                }
                for (const detallePorNoche of totalesPorNoche) {
                    const fechaNoche = detallePorNoche.fechaDiaConNoche
                    const precioNetoNoche = detallePorNoche.precioNetoNoche

                    const apartamentosDetallesPorNoche = detallePorNoche.apartamentos


                    const apartamentoUI_ = document.createElement("div")
                    apartamentoUI_.classList.add("reserva_resumen_desglose_pago_elemento")

                    const apartamentoUITitulo = document.createElement("div")
                    apartamentoUITitulo.classList.add("reserva_resumen_apartamentoIUTitulo")
                    apartamentoUITitulo.classList.add("negrita")
                    apartamentoUITitulo.innerText = fechaNoche
                    apartamentoUI_.appendChild(apartamentoUITitulo)

                    const totalNetoNocheUI = document.createElement("div")
                    totalNetoNocheUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                    totalNetoNocheUI.classList.add("negrita")
                    totalNetoNocheUI.innerText = precioNetoNoche + "$ Total neto noche"
                    apartamentoUI_.appendChild(totalNetoNocheUI)

                    for (const detalleApartmentoPorNoche of apartamentosDetallesPorNoche) {

                        const apartamentoUI = detalleApartmentoPorNoche.apartamentoUI
                        const precioNetoPorNoche = detalleApartmentoPorNoche.precioNetoNoche

                        const detalleApartamentosUITitulo = document.createElement("div")
                        detalleApartamentosUITitulo.classList.add("reserva_resumen_apartamentoUIPrecio")
                        detalleApartamentosUITitulo.classList.add("negrita")
                        detalleApartamentosUITitulo.classList.add("colorGris")

                        detalleApartamentosUITitulo.innerText = apartamentoUI
                        apartamentoUI_.appendChild(detalleApartamentosUITitulo)

                        const detalleApartamentosUIPreciNetoNoche = document.createElement("div")
                        detalleApartamentosUIPreciNetoNoche.classList.add("reserva_resumen_apartamentoUIPrecio")
                        detalleApartamentosUIPreciNetoNoche.innerText = precioNetoPorNoche + "$ / Neto por noche"
                        apartamentoUI_.appendChild(detalleApartamentosUIPreciNetoNoche)
                    }
                    contenedorDesglosePorNoche.appendChild(apartamentoUI_)
                }

                detallePorDiaUI.appendChild(contenedorDesglosePorNoche)
                contenedorDesgloseTotales.appendChild(detallePorDiaUI)
                ////////////////////////////////////////////

                const contenedorTotalesPorApartamento = document.createElement("div")
                contenedorTotalesPorApartamento.classList.add("reserva_resumen_desglose_porNoche")

                const alojamientoUI = document.createElement("div")
                alojamientoUI.classList.add("reserva_resumen_desglose_pago_bloque")

                const alojamientoUITitulo = document.createElement("div")
                alojamientoUITitulo.classList.add("reserva_resumen_desglose_pago_titulo")
                alojamientoUITitulo.innerText = "Precio total neto por apartamento"
                alojamientoUI.appendChild(alojamientoUITitulo)

                if (totalesPorApartamento.length === 0) {
                    const info = document.createElement("div")
                    info.classList.add("componentes_ui_totales_mensajeInfoSinInformacion")
                    info.innerText = "No hay información financiera para desglosar por apartamento"
                    alojamientoUI.appendChild(info)
                }
                for (const detalleDesglosePorApartamento of totalesPorApartamento) {
                    const apartamentoUI_ = detalleDesglosePorApartamento.apartamentoUI
                    const totalNetoApartamento = detalleDesglosePorApartamento.totalNetoRango
                    const precioNetoMedioPorNoche = detalleDesglosePorApartamento.precioMedioNocheRango
                    const apartamentoUI = document.createElement("div")
                    apartamentoUI.classList.add("reserva_resumen_desglose_pago_elemento")

                    const apartamentoUITitulo = document.createElement("div")
                    apartamentoUITitulo.classList.add("reserva_resumen_apartamentoIUTitulo")
                    apartamentoUITitulo.classList.add("negrita")

                    apartamentoUITitulo.innerText = apartamentoUI_
                    apartamentoUI.appendChild(apartamentoUITitulo)

                    const apartamentoUIPrecioNetoTotal = document.createElement("div")
                    apartamentoUIPrecioNetoTotal.classList.add("reserva_resumen_apartamentoUIPrecio")
                    apartamentoUIPrecioNetoTotal.innerText = "Total neto: " + totalNetoApartamento + "$"
                    apartamentoUI.appendChild(apartamentoUIPrecioNetoTotal)


                    const apartamentoUIPrecioPromedioPorNoche = document.createElement("div")
                    apartamentoUIPrecioPromedioPorNoche.classList.add("reserva_resumen_apartamentoUIPrecio")
                    apartamentoUIPrecioPromedioPorNoche.innerText = "Precio medio neto por noche: " + precioNetoMedioPorNoche + "$"
                    apartamentoUI.appendChild(apartamentoUIPrecioPromedioPorNoche)
                    alojamientoUI.appendChild(apartamentoUI)

                }

                contenedorTotalesPorApartamento.appendChild(alojamientoUI)
                contenedorDesgloseTotales.appendChild(contenedorTotalesPorApartamento)

                ////////////////////////////////////////////


                let controlContenido = "noDesplegar"

                const ofertasUI = document.createElement("div")
                ofertasUI.classList.add("reserva_resumen_desglose_pago_bloque")

                const ofertasUITitulo = document.createElement("div")
                ofertasUITitulo.classList.add("reserva_resumen_desglose_pago_titulo")
                ofertasUITitulo.innerText = "Ofertas aplicadas"
                ofertasUI.appendChild(ofertasUITitulo)


                for (const oferta of ofertas) {



                    const porNumeroDeApartamentos = oferta.porNumeroDeApartamentos
                    const porApartamentosEspecificos = oferta.porApartamentosEspecificos
                    const porDiasDeReserva = oferta.porDiasDeReserva
                    const porRangoDeFechas = oferta.porRangoDeFechas
                    const porDiasDeAntelacion = oferta.porDiasDeAntelacion


                    if (porNumeroDeApartamentos?.length) {
                        controlContenido = "desplegar"

                        const contenedorOfertaUI = document.createElement("div")
                        contenedorOfertaUI.classList.add("compomentes_ui_totales_ofertas_contenedorConjuntoOferta")
                        for (const detallesReserva of oferta.porNumeroDeApartamentos) {

                            const contenedorIndividualOferta = document.createElement("div")
                            contenedorIndividualOferta.classList.add("compomentes_ui_totales_ofertas_contenedorOferta")

                            const cantidad = detallesReserva.cantidad
                            const tipoDescuento = detallesReserva.tipoDescuento
                            const definicion = detallesReserva.definicion
                            const nombreOferta = detallesReserva.nombreOferta
                            const descuento = detallesReserva.descuento


                            let nombreOfertaUI = document.createElement("div")
                            nombreOfertaUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                            nombreOfertaUI.classList.add("negrita")
                            nombreOfertaUI.innerText = nombreOferta
                            contenedorIndividualOferta.appendChild(nombreOfertaUI)

                            const definicionOfertaUI = document.createElement("div")
                            definicionOfertaUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                            definicionOfertaUI.innerText = definicion
                            contenedorIndividualOferta.appendChild(definicionOfertaUI)

                            if (tipoDescuento === "porcentaje") {
                                const tipoDescuentoUI = document.createElement("div")
                                tipoDescuentoUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                                tipoDescuentoUI.innerText = "Descuento del " + cantidad + simboloDescuento[tipoDescuento] + " rebajando el neto de la reserva en " + descuento + "$"
                                contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                            }
                            if (tipoDescuento === "cantidadFija") {
                                const tipoDescuentoUI = document.createElement("div")
                                tipoDescuentoUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                                tipoDescuentoUI.innerText = "Descuento del " + cantidad + simboloDescuento[tipoDescuento] + " sobre el neto de la reserva"
                                contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                            }



                            contenedorOfertaUI.appendChild(contenedorIndividualOferta)
                        }
                        ofertasUI.appendChild(contenedorOfertaUI)

                    }
                    if (porApartamentosEspecificos?.length) {
                        controlContenido = "desplegar"

                        const contenedorOfertaUI = document.createElement("div")
                        contenedorOfertaUI.classList.add("compomentes_ui_totales_ofertas_contenedorConjuntoOferta")
                        for (const detallesOferta of oferta.porApartamentosEspecificos) {

                            const nombreOferta = detallesOferta.nombreOferta
                            const cantidad = detallesOferta.cantidad
                            const tipoDescuento = detallesOferta.tipoDescuento
                            const definicion = detallesOferta.definicion
                            const descuentoOferta = detallesOferta.descuentoOferta
                            const descuentoAplicadoA = detallesOferta.descuentoAplicadoA


                            const contenedorIndividualOferta = document.createElement("div")
                            contenedorIndividualOferta.classList.add("compomentes_ui_totales_ofertas_contenedorOferta")


                            const nombreOfertaUI = document.createElement("div")
                            nombreOfertaUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                            nombreOfertaUI.classList.add("negrita")
                            nombreOfertaUI.innerText = nombreOferta
                            contenedorIndividualOferta.appendChild(nombreOfertaUI)

                            const definicionOfertaUI = document.createElement("div")
                            definicionOfertaUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                            definicionOfertaUI.innerText = definicion
                            contenedorIndividualOferta.appendChild(definicionOfertaUI)


                            if (descuentoAplicadoA === "totalNetoApartmentoDedicado") {
                                const apartamentosEspecificos = detallesOferta.apartamentosEspecificos

                                const contenedorApartamentosEspecificos = document.createElement("div")
                                contenedorApartamentosEspecificos.classList.add("componentes_ui_totales_ofertas_apartamentosEspecificos_contenedor")


                                for (const detallesApartamento of apartamentosEspecificos) {
                                    const apartamentoIDV = detallesApartamento.apartamentoIDV
                                    const apartamentoUI = detallesApartamento.apartamentoUI
                                    const tipoDescuento = detallesApartamento.tipoDescuento
                                    const cantidad = detallesApartamento.cantidad
                                    const descuento = detallesApartamento.descuento


                                    const bloqueDetalleOferta = document.createElement("div")
                                    bloqueDetalleOferta.classList.add("resumen_reserva_detalle_oferta_apartamentos_especificos")

                                    const tituloApartamentoUI = document.createElement("div")
                                    tituloApartamentoUI.classList.add("negrita")
                                    tituloApartamentoUI.innerHTML = apartamentoUI
                                    bloqueDetalleOferta.appendChild(tituloApartamentoUI)

                                    const tipoDescuentoApartamentoUI = document.createElement("div")
                                    tipoDescuentoApartamentoUI.innerText = tipoDescuento
                                    //   bloqueDetalleOferta.appendChild(tipoDescuentoApartamentoUI)


                                    const cantidadPorApartmento = document.createElement("div")
                                    cantidadPorApartmento.innerText = "Descuento: " + cantidad + simboloDescuento[tipoDescuento]
                                    bloqueDetalleOferta.appendChild(cantidadPorApartmento)

                                    contenedorApartamentosEspecificos.appendChild(bloqueDetalleOferta)

                                }
                                contenedorIndividualOferta.appendChild(contenedorApartamentosEspecificos)


                            }
                            if (descuentoAplicadoA === "totalNetoReserva") {

                                const descuentoOfertaUI = document.createElement("div")
                                descuentoOfertaUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                                descuentoOfertaUI.innerText = descuentoOferta
                                contenedorIndividualOferta.appendChild(descuentoOfertaUI)

                                if (tipoDescuento === "porcentaje") {
                                    const tipoDescuentoUI = document.createElement("div")
                                    tipoDescuentoUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                                    tipoDescuentoUI.innerText = "Descuento: " + cantidad + simboloDescuento[tipoDescuento]
                                    contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                                }

                                if (tipoDescuento === "cantidadFija") {
                                    const tipoDescuentoUI = document.createElement("div")
                                    tipoDescuentoUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                                    tipoDescuentoUI.innerText = "Descuento: " + cantidad + simboloDescuento[tipoDescuento]
                                    contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                                }

                            }
                            contenedorOfertaUI.appendChild(contenedorIndividualOferta)

                        }
                        ofertasUI.appendChild(contenedorOfertaUI)
                    }
                    if (porDiasDeReserva?.length) {
                        controlContenido = "desplegar"

                        const contenedorOfertaUI = document.createElement("div")
                        contenedorOfertaUI.classList.add("compomentes_ui_totales_ofertas_contenedorConjuntoOferta")

                        for (const detatllesReserva of oferta.porDiasDeReserva) {

                            const cantidad = detatllesReserva.cantidad
                            const tipoDescuento = detatllesReserva.tipoDescuento
                            const nombreOferta = detatllesReserva.nombreOferta
                            const numero = detatllesReserva.numero
                            const simboloNumero = detatllesReserva.simboloNumero
                            const definicion = detatllesReserva.definicion
                            const descuento = detatllesReserva.descuento

                            const contenedorIndividualOferta = document.createElement("div")
                            contenedorIndividualOferta.classList.add("compomentes_ui_totales_ofertas_contenedorOferta")

                            const nombreOfertaUI = document.createElement("div")
                            nombreOfertaUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                            nombreOfertaUI.classList.add("negrita")
                            nombreOfertaUI.innerText = nombreOferta
                            contenedorIndividualOferta.appendChild(nombreOfertaUI)

                            const definicionUI = document.createElement("div")
                            definicionUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                            definicionUI.innerText = definicion
                            contenedorIndividualOferta.appendChild(definicionUI)

                            if (tipoDescuento === "porcentaje") {
                                const tipoDescuentoUI = document.createElement("div")
                                tipoDescuentoUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                                tipoDescuentoUI.innerText = "Descuento: " + cantidad + simboloDescuento[tipoDescuento] + " rebajando el neto de la reserva en " + descuento + "$"
                                contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                            }

                            if (tipoDescuento === "cantidadFija") {
                                const tipoDescuentoUI = document.createElement("div")
                                tipoDescuentoUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                                tipoDescuentoUI.innerText = "Descuento: " + cantidad + simboloDescuento[tipoDescuento]
                                contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                            }

                            const definicionOfertaUI = document.createElement("div")
                            definicionOfertaUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                            definicionOfertaUI.innerText = definicion
                            //contenedorIndividualOferta.appendChild(definicionOfertaUI)

                            contenedorOfertaUI.appendChild(contenedorIndividualOferta)

                        }
                        ofertasUI.appendChild(contenedorOfertaUI)
                    }

                    if (porRangoDeFechas?.length) {
                        controlContenido = "desplegar"

                        const contenedorOfertaUI = document.createElement("div")
                        contenedorOfertaUI.classList.add("compomentes_ui_totales_ofertas_contenedorConjuntoOferta")


                        for (const detallesOferta of oferta.porRangoDeFechas) {

                            const cantidad = detallesOferta.cantidad
                            const tipoDescuento = detallesOferta.tipoDescuento
                            const definicion = detallesOferta.definicion
                            const nombreOferta = detallesOferta.nombreOferta
                            const diasAfectados = detallesOferta.diasAfectados
                            const descuento = detallesOferta.descuento
                            const contenedorIndividualOferta = document.createElement("div")
                            contenedorIndividualOferta.classList.add("compomentes_ui_totales_ofertas_contenedorOferta")


                            const nombreOfertaUI = document.createElement("div")
                            nombreOfertaUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                            nombreOfertaUI.classList.add("negrita")
                            nombreOfertaUI.innerText = nombreOferta
                            contenedorIndividualOferta.appendChild(nombreOfertaUI)




                            const definicionOfertaUI = document.createElement("div")
                            definicionOfertaUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                            definicionOfertaUI.innerText = definicion
                            contenedorIndividualOferta.appendChild(definicionOfertaUI)

                            const tipoDescuentoUI = document.createElement("div")
                            tipoDescuentoUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                            tipoDescuentoUI.innerText = "Descuento total de la oferta: " + descuento + "$"
                            contenedorIndividualOferta.appendChild(tipoDescuentoUI)


                            const contenedorDiasEspecificos = document.createElement("div")
                            contenedorDiasEspecificos.classList.add("componentes_ui_totales_ofertas_diasEspecificos_contenedor")


                            for (const detalleDelDia of diasAfectados) {
                                const dia = detalleDelDia.dia
                                const totaDiaNetoConOferta = detalleDelDia.totaDiaNetoConOferta
                                const descuento = detalleDelDia.descuento


                                const bloque = document.createElement("div")
                                bloque.classList.add("resumen_reserva_detalle_oferta_apartamentos_especificos")

                                const tituloUI = document.createElement("div")
                                tituloUI.classList.add("negrita")
                                tituloUI.innerHTML = dia
                                bloque.appendChild(tituloUI)

                                const totalSinOferta = document.createElement("div")
                                totalSinOferta.innerText = "Total día con oferta: " + totaDiaNetoConOferta + "$"
                                bloque.appendChild(totalSinOferta)


                                const totalConOferta = document.createElement("div")
                                totalConOferta.innerText = "Descuento: " + descuento + "$"
                                bloque.appendChild(totalConOferta)

                                contenedorDiasEspecificos.appendChild(bloque)

                            }

                            contenedorIndividualOferta.appendChild(contenedorDiasEspecificos)





                            contenedorOfertaUI.appendChild(contenedorIndividualOferta)


                        }
                        ofertasUI.appendChild(contenedorOfertaUI)

                    }
                    if (porDiasDeAntelacion?.length) {
                        controlContenido = "desplegar"

                        const contenedorOfertaUI = document.createElement("div")
                        contenedorOfertaUI.classList.add("compomentes_ui_totales_ofertas_contenedorConjuntoOferta")

                        for (const detallesOferta of oferta.porDiasDeAntelacion) {

                            const cantidad = detallesOferta.cantidad
                            const tipoDescuento = detallesOferta.tipoDescuento
                            const definicion = detallesOferta.definicion
                            const nombreOferta = detallesOferta.nombreOferta
                            const descuento = detallesOferta.descuento


                            const contenedorIndividualOferta = document.createElement("div")
                            contenedorIndividualOferta.classList.add("compomentes_ui_totales_ofertas_contenedorOferta")

                            const nombreOfertaUI = document.createElement("div")
                            nombreOfertaUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                            nombreOfertaUI.classList.add("negrita")
                            nombreOfertaUI.innerText = nombreOferta
                            contenedorIndividualOferta.appendChild(nombreOfertaUI)

                            const definicionOfertaUI = document.createElement("div")
                            definicionOfertaUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                            definicionOfertaUI.innerText = definicion
                            contenedorIndividualOferta.appendChild(definicionOfertaUI)

                            if (tipoDescuento === "porcentaje") {
                                const tipoDescuentoUI = document.createElement("div")
                                tipoDescuentoUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                                tipoDescuentoUI.innerText = "Descuento del " + cantidad + "% sobrel el neto de la reserva."
                                contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                            }
                            if (tipoDescuento === "cantidadFija") {
                                const tipoDescuentoUI = document.createElement("div")
                                tipoDescuentoUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                                tipoDescuentoUI.innerText = "Descuento de " + cantidad + "$ sobre el neto de la reserva"
                                contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                            }




                            contenedorOfertaUI.appendChild(contenedorIndividualOferta)

                        }
                        ofertasUI.appendChild(contenedorOfertaUI)

                    }

                }
                if (controlContenido === "desplegar") {
                    contenedorDesgloseTotales.appendChild(ofertasUI)
                }





                const impuestoUI = document.createElement("div")
                impuestoUI.classList.add("reserva_resumen_desglose_pago_bloque")

                const impuestoUITituloBloque = document.createElement("div")
                impuestoUITituloBloque.classList.add("reserva_resumen_desglose_pago_titulo")
                impuestoUITituloBloque.innerText = "Impuestos"
                impuestoUI.appendChild(impuestoUITituloBloque)
                if (desgloseImpuestos.length === 0) {
                    const info = document.createElement("div")
                    info.classList.add("componentes_ui_totales_mensajeInfoSinInformacion")
                    info.innerText = "No hay información financiera sobre impuestos para mostrar"
                    impuestoUI.appendChild(info)
                }
                desgloseImpuestos.map((impuesto) => {

                    const impuestoTitulo = impuesto.nombreImpuesto
                    const tipoValor = impuesto.tipoValor
                    const tipoImpositivo = impuesto.tipoImpositivo
                    const calculoImpuestoPorcentaje = impuesto.calculoImpuestoPorcentaje

                    const impuestoUITitulo = document.createElement("div")
                    impuestoUITitulo.classList.add("reserva_resumen_desglose_pago_elemento")

                    const impuestoUITitulo_ = document.createElement("div")
                    impuestoUITitulo_.classList.add("reserva_resumen_apartamentoIUTitulo")
                    impuestoUITitulo_.classList.add("negrita")
                    impuestoUITitulo_.innerText = impuestoTitulo
                    impuestoUITitulo.appendChild(impuestoUITitulo_)

                    let simboloTipoImpuesto;
                    if (tipoValor === "porcentaje") {
                        simboloTipoImpuesto = "%";
                    }
                    if (tipoValor === "tasa") {
                        simboloTipoImpuesto = "$";
                    }

                    const impuestoUITipoImpositivo = document.createElement("div")
                    impuestoUITipoImpositivo.classList.add("reserva_resumen_impuestoUITipoImpositivo")
                    impuestoUITipoImpositivo.innerText = tipoImpositivo + simboloTipoImpuesto
                    impuestoUITitulo.appendChild(impuestoUITipoImpositivo)

                    const impuestoUITipoValor = document.createElement("div")
                    impuestoUITipoValor.classList.add("resumen_reserva_impuestoUITipoValor")
                    impuestoUITipoValor.innerText = tipoValor
                    // impuestoUITitulo.appendChild(impuestoUITipoValor)

                    if (calculoImpuestoPorcentaje) {
                        const impuestoUICalculoImpuestoPorcentaje = document.createElement("div")
                        impuestoUICalculoImpuestoPorcentaje.classList.add("resumen_reserva_impuestoUICalculoImpuestoPorcentaje")
                        impuestoUICalculoImpuestoPorcentaje.innerText = calculoImpuestoPorcentaje + "$"
                        impuestoUITitulo.appendChild(impuestoUICalculoImpuestoPorcentaje)
                    }
                    impuestoUI.appendChild(impuestoUITitulo)
                })

                contenedorDesgloseTotales.appendChild(impuestoUI)

                const totalesUI = document.createElement("div")
                totalesUI.classList.add("reserva_resumen_desglose_pago_bloque")

                const totalesUITituloBloque = document.createElement("div")
                totalesUITituloBloque.classList.add("reserva_resumen_desglose_pago_titulo")
                totalesUITituloBloque.innerText = "Totales"
                totalesUI.appendChild(totalesUITituloBloque)

                const totalPromedioNetoPorNoche = totales.promedioNetoPorNoche ?
                    totales.promedioNetoPorNoche + "$" :
                    "No hay informacion del total promedio neto por noche";

                const totalReservaNeto = totales.totalReservaNeto ? totales.totalReservaNeto + "$" : "No hay información del total neto de la reserva"
                const totalImpuestos = totales.totalImpuestos ? totales.totalImpuestos + "$" : "No hay información del total de los impuestos"
                const totalDescuentos = totales.totalDescuentos ? totales.totalDescuentos + "$" : "No hay infomración del total desconectado"
                const totalReservaNetoSinDescuentos = totales.totalReservaNetoSinOfertas ? totales.totalReservaNetoSinOfertas + "$" : "No hay informacion del total de la reserva sin descuentos"

                if (totales.totalReservaNeto) {

                    const totalReservaNetoDiaUI = document.createElement("div")
                    totalReservaNetoDiaUI.classList.add("reserva_resumen_desglose_pago_elemento")
                    totalReservaNetoDiaUI.innerText = "Precio medio neto de la reserva por noche: " + totalPromedioNetoPorNoche
                    totalesUI.appendChild(totalReservaNetoDiaUI)

                    if (totales.totalDescuentos) {
                        const totalDescuentosAplicadosUI = document.createElement("div")
                        totalDescuentosAplicadosUI.classList.add("reserva_resumen_desglose_pago_elemento")
                        totalDescuentosAplicadosUI.innerText = "Descuento total por todas las ofertas aplicadas: " + totalDescuentos
                        totalesUI.appendChild(totalDescuentosAplicadosUI)

                        const totalReservaNetoSinOfertasUI = document.createElement("div")
                        totalReservaNetoSinOfertasUI.classList.add("reserva_resumen_desglose_pago_elemento")
                        totalReservaNetoSinOfertasUI.innerText = "Total neto sin ofertas aplicadas: " + totalReservaNetoSinDescuentos
                        totalesUI.appendChild(totalReservaNetoSinOfertasUI)
                    }

                    const totalReservaNetoUI = document.createElement("div")
                    totalReservaNetoUI.classList.add("reserva_resumen_desglose_pago_elemento")
                    totalReservaNetoUI.innerText = "Total reserva neto: " + totalReservaNeto
                    totalesUI.appendChild(totalReservaNetoUI)

                    const totalImpuestosUI = document.createElement("div")
                    totalImpuestosUI.classList.add("reserva_resumen_desglose_pago_elemento")
                    totalImpuestosUI.innerText = "Total impuestos aplicados: " + totalImpuestos
                    totalesUI.appendChild(totalImpuestosUI)

                    const totalConImpuestosUI = document.createElement("div")
                    totalConImpuestosUI.classList.add("reserva_resumen_desglose_pago_elemento")
                    totalConImpuestosUI.classList.add("negrita")

                    totalConImpuestosUI.innerText = "Total final bruto a pagar: " + totales.totalConImpuestos + "$"
                    totalesUI.appendChild(totalConImpuestosUI)
                } else {
                    const info = document.createElement("div")
                    info.classList.add("componentes_ui_totales_mensajeInfoSinInformacion")
                    info.innerText = "No hay información de totales"
                    totalesUI.appendChild(info)
                }



                contenedorDesgloseTotales.appendChild(totalesUI)
                selectorDestino.appendChild(contenedorDesgloseTotales)



            },
            pantallaInmersivaPersonalizada: () => {
                document.body.style.overflow = 'hidden';
                const instanciaUID = casaVitini.componentes.codigoFechaInstancia()

                const pantallaInmersivaPersonalizadaUI = document.createElement("div")
                pantallaInmersivaPersonalizadaUI.setAttribute("class", "advertenciaInmersiva")
                pantallaInmersivaPersonalizadaUI.setAttribute("componente", "advertenciaInmersiva")
                pantallaInmersivaPersonalizadaUI.setAttribute("instanciaUID", instanciaUID)


                const contenedorAdvertenciaInmersiva = document.createElement("div")
                contenedorAdvertenciaInmersiva.classList.add("contenedorAdvertencaiInmersiva")

                const contenidoAdvertenciaInmersiva = document.createElement("div")
                contenidoAdvertenciaInmersiva.classList.add("contenidoAdvertenciaInmersiva")
                contenidoAdvertenciaInmersiva.setAttribute("contenedor", "contenidoAdvertenciaInmersiva")
                contenidoAdvertenciaInmersiva.setAttribute("destino", "inyector")

                contenedorAdvertenciaInmersiva.appendChild(contenidoAdvertenciaInmersiva)
                pantallaInmersivaPersonalizadaUI.appendChild(contenedorAdvertenciaInmersiva)

                return pantallaInmersivaPersonalizadaUI
            },
        },
        granuladorURL: () => {
            const urlActual = window.location.pathname
            const directoriosURL = []
            const parametrosURL = {}
            const parametrosArray = []

            let arrayURL = urlActual.split("/")
            arrayURL = arrayURL.filter((url) => url)


            arrayURL.map((bloque) => {
                if (bloque.includes(":")) {
                    const desgloseParametro = bloque.split(":")
                    parametrosURL[desgloseParametro[0]] = desgloseParametro[1]

                    const par = {
                        parametro: desgloseParametro[0],
                        valor: desgloseParametro[1]
                    }
                    parametrosArray.push(par)
                } else {
                    directoriosURL.push(bloque)
                }
            })
            const contenedorSeguroParaParametros = []

            for (const par of parametrosArray) {
                const parametro = par.parametro
                const valor = par.valor
                const estructura = parametro + ":" + valor
                contenedorSeguroParaParametros.push(estructura)
            }

            const contenedorParametrosParaFusion = []
            for (const [parametro, valor] of Object.entries(parametrosURL)) {
                const estructura = parametro + ":" + valor
                contenedorParametrosParaFusion.push(estructura)
            }

            const estructuraFinal = {
                directorios: directoriosURL,
                parametros: parametrosURL,
                directoriosFusion: "/" + directoriosURL.join("/"),
                parametrosFusion: "/" + contenedorParametrosParaFusion.join("/"),
                contenedorSeguroParaParametros: contenedorSeguroParaParametros
            }
            return estructuraFinal
        },
        medirPorJerarquiaDom: {
            horizontal: (elemento) => {
                let distancia = 0;
                // Recorrer los elementos padres hasta llegar al cuerpo del documento
                while (elemento) {
                    distancia += elemento.offsetLeft;
                    elemento = elemento.offsetParent;
                }
                return distancia;
            },
            vertical: {
                desdeArribaDelElemento: (elemento) => {
                    let distancia = 0;
                    // Recorrer los elementos padres hasta llegar al cuerpo del documento
                    while (elemento) {
                        distancia += elemento.offsetTop;
                        elemento = elemento.offsetParent;
                    }
                    return distancia;
                },
                desdeAbajoDelElemento: (elemento) => {
                    let distancia = elemento.clientHeight;
                    // Recorrer los elementos padres hasta llegar al cuerpo del documento
                    while (elemento) {
                        distancia += (elemento.offsetTop);
                        elemento = elemento.offsetParent;
                    }
                    return distancia;
                }

            }



        },
        mensajeSimple: (mensaje) => {

            const contenedor = document.createElement("div")
            contenedor.classList.add("componentes_contenedor_mensajeSimple")

            const contenedorIntermedio = document.createElement("div")
            contenedorIntermedio.classList.add("componentes_contenedor_contenedorIntermedio")
            contenedorIntermedio.setAttribute("espacio", "formularioCrearEnlaceDePago")

            const contenedorBloque = document.createElement("div")
            contenedorBloque.classList.add("componentes_contenedor_contenido")

            const titulo = document.createElement("div")
            titulo.classList.add("componentes_contenedor_mensajeSimple_titulo")
            titulo.classList.add("negrita")

            titulo.innerText = mensaje.titulo
            contenedorBloque.appendChild(titulo)

            const descripcion = document.createElement("div")
            descripcion.classList.add("casaVitini.componentes.menajeDelError")
            descripcion.innerText = mensaje.descripcion
            contenedorBloque.appendChild(descripcion)

            contenedorIntermedio.appendChild(contenedorBloque)
            contenedor.appendChild(contenedorIntermedio)

            const seccion = document.querySelector("section")
            seccion.removeAttribute("instanciaUID")
            //seccion.style.position = "absolute"
            //seccion.style.justifyContent = "center"
            //seccion.style.height = "100%"
            seccion.appendChild(contenedor)
        },
        utilidades: {
            cadenas: {
                snakeToCamel: (snake) => {
                    return snake.replace(/_([a-z])/g, (match, group) => {
                        return group.toUpperCase();
                    });
                },
                camelToSnake: (camel) => {
                    return camel.replace(/[A-Z]/g, (match) => {
                        return '_' + match.toLowerCase();
                    });
                }

            }

        },
        diasOcupadosTotalmentePorMes: async (metadatos) => {

            const mes = metadatos.mes
            const ano = metadatos.ano
            const instanciaUID_mes = metadatos.instanciaUID_mes

            const controlDiasCompletos = {
                zona: "componentes/diasOcupadosTotalmentePorMes",
                mes: Number(mes),
                ano: Number(ano)
            }

            const respuestaServidor = await casaVitini.componentes.servidor(controlDiasCompletos)

            if (respuestaServidor?.error) {
                return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor.ok) {

                const dias = respuestaServidor.ok.dias
                const selectorMarcoMesRenderizadoEnEspera = document
                    .querySelector(`[inctanciaUID_procesoCambioMes="${instanciaUID_mes}"]`)
                if (!selectorMarcoMesRenderizadoEnEspera) {
                    return
                }

                for (const detallesDia of Object.entries(dias)) {
                    const dia = detallesDia[0]

                    const estadoDia = detallesDia[1].estadoDia


                    const selectorDia = selectorMarcoMesRenderizadoEnEspera.querySelector(`[dia="${dia}"]`)
                    if (estadoDia === "diaCompleto") {
                        selectorDia.classList.add("calendarioDiaCompleto")
                    }
                    if (estadoDia === "diaParcial") {
                        selectorDia.classList.add("calendarioDiaParcial")
                    }
                }
            }



        },
        ralentizador: async (milisegundos) => {
            await new Promise(resolve => setTimeout(resolve, Number(milisegundos)));

        },
        calendarioCompartido: {
            seleccionarDia: (dia) => {
                const diaSeleccionadoComoElemento = dia.target;
                const calendario = document.querySelector("[componente=bloqueCalendario] [componente=marcoCalendario]")
                const calendarioIO = calendario.getAttribute("calendarioIO")

                const contenedorCalendario = dia.target.closest("[contenedor=calendario]")
                const marcoMes = dia.target.closest("[componente=marcoMes]")
                const diaSeleccionado = dia.target.getAttribute("dia").padStart(2, "0")
                const anoSeleccionado = document.querySelector("[componente=mesReferencia]").getAttribute("ano").padStart(2, "0")
                const mesSeleccionado = document.querySelector("[componente=mesReferencia]").getAttribute("mes").padStart(2, "0")

                const fechaSeleccionadaUI = `${diaSeleccionado}/${mesSeleccionado}/${anoSeleccionado}`
                const diasDelCalendario = marcoMes.querySelectorAll("[dia]")
                console.log("diaSeleccionadoComoElemento.getAttribute()", diaSeleccionadoComoElemento.getAttribute("estadoDia"))

                if (diaSeleccionadoComoElemento.getAttribute("estadoDia") === "seleccionado") {
                    console.log("ss")
                    diaSeleccionadoComoElemento.setAttribute("estadoDia", "disponible")

                    if (calendarioIO === "entrada") {
                        document.querySelector("[calendario=entrada]").removeAttribute("memoriaVolatil")
                        document.querySelector("[fechaUI=fechaInicio]").innerText = "(Seleccionar)"

                    }
                    if (calendarioIO === "salida") {
                        document.querySelector("[calendario=salida]").removeAttribute("memoriaVolatil")
                        document.querySelector("[fechaUI=fechaFin]").innerText = "(Seleccionar)"

                    }

                    diasDelCalendario.forEach(dia => {
                        if (dia.getAttribute("estadoDia") === "disponible" ||
                            dia.getAttribute("estadoDia") === "seleccionado") {
                            dia.classList.remove("calendarioDiaSeleccionado")
                            dia.classList.remove("calendarioDiaReserva")
                            dia.classList.add("calendarioDiaDisponible")
                            dia.setAttribute("estadoDia", "disponible")
                        }
                    });
                    return
                }
                diasDelCalendario.forEach(dia => {

                    if (dia.getAttribute("estadoDia") === "seleccionado") {
                        dia.setAttribute("estadoDia", "disponible")
                    }

                    if (dia.getAttribute("estadoDia") === "disponible") {
                        console.log("dia dipsonbile", dia)
                        dia.classList.remove("calendarioDiaSeleccionado")
                        dia.classList.remove("calendarioDiaReserva")
                        dia.classList.add("calendarioDiaDisponible")
                    }

                });
                diaSeleccionadoComoElemento.setAttribute("estadoDia", "seleccionado")
                diaSeleccionadoComoElemento.classList.add("calendarioDiaSeleccionado")

                const fechaEntradaVolatil_Humana = document.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
                const fechaEntradaSeleccionada = {}
                if (fechaEntradaVolatil_Humana) {
                    const fechaEntradaAarray = fechaEntradaVolatil_Humana.split("/")
                    fechaEntradaSeleccionada.dia = parseInt(fechaEntradaAarray[0], 10)
                    fechaEntradaSeleccionada.mes = parseInt(fechaEntradaAarray[1], 10)
                    fechaEntradaSeleccionada.ano = parseInt(fechaEntradaAarray[2], 10)
                }

                const fechaSalidaVolatil_Humana = document.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")
                const fechaSalidaSeleccionada = {}
                if (fechaSalidaVolatil_Humana) {
                    const fechaSaliraArray = fechaSalidaVolatil_Humana.split("/")
                    fechaSalidaSeleccionada.dia = parseInt(fechaSaliraArray[0], 10)
                    fechaSalidaSeleccionada.mes = parseInt(fechaSaliraArray[1], 10)
                    fechaSalidaSeleccionada.ano = parseInt(fechaSaliraArray[2], 10)
                }

                if (calendarioIO === "entrada") {
                    document.querySelector("[calendario=entrada]").setAttribute("memoriaVolatil", fechaSeleccionadaUI)
                    document.querySelector("[fechaUI=fechaInicio]").innerText = fechaSeleccionadaUI
                    if (Object.keys(fechaSalidaSeleccionada).length) {
                        diasDelCalendario.forEach((dia) => {
                            if (dia.getAttribute("estadoDia") === "disponible") {
                                if (fechaSalidaSeleccionada.mes === mesSeleccionado && anoSeleccionado === fechaSalidaSeleccionada.ano) {
                                    if ((Number(dia.getAttribute("dia")) > diaSeleccionado &&
                                        Number(dia.getAttribute("dia")) <= fechaSalidaSeleccionada.dia)) {
                                        dia.classList.remove("calendarioDiaDisponible")
                                        dia.classList.add("calendarioDiaReserva")
                                    }
                                } else {
                                    if (Number(dia.getAttribute("dia")) > diaSeleccionado) {
                                        dia.classList.remove("calendarioDiaDisponible")
                                        dia.classList.add("calendarioDiaReserva")
                                    }
                                }
                            }
                        })

                    }
                }

                if (calendarioIO === "salida") {
                    document.querySelector("[calendario=salida]").setAttribute("memoriaVolatil", fechaSeleccionadaUI)
                    document.querySelector("[fechaUI=fechaFin]").innerText = fechaSeleccionadaUI

                    if (Object.keys(fechaEntradaSeleccionada).length) {
                        diasDelCalendario.forEach((dia) => {
                            if (dia.getAttribute("estadoDia") === "disponible") {
                                if (fechaEntradaSeleccionada.mes === mesSeleccionado && anoSeleccionado === fechaEntradaSeleccionada.ano) {
                                    if (Number(dia.getAttribute("dia")) < diaSeleccionado &&
                                        Number(dia.getAttribute("dia")) >= fechaEntradaSeleccionada.dia) {

                                        dia.classList.remove("calendarioDiaDisponible")
                                        dia.classList.add("calendarioDiaReserva")
                                    }
                                } else {
                                    if (Number(dia.getAttribute("dia")) < diaSeleccionado) {
                                        dia.classList.remove("calendarioDiaDisponible")
                                        dia.classList.add("calendarioDiaReserva")
                                    }
                                }
                            }
                        })

                    }

                }
            },
        }
    },
    IDX: {
        iniciarSession: async (IDX) => {



            const usuario = IDX.usuario
            const clave = IDX.clave
            const contenedorBotones = document.querySelector("[componente=contenedorBotones]")
            const bloqueRespuesta = document.querySelector("#bloqueRespuesta")
            const campos = document.querySelectorAll("[componente=campoID]")
            campos.forEach((campo) => {
                campo.removeAttribute("style")
            })
            const circuloAnimado = document.createElement("span")
            circuloAnimado.classList.add("circuloAnimado")
            const mensajeIniciando = document.createElement("div")
            mensajeIniciando.classList.add("miCasa_portal_mensajeIniciandoSession")
            mensajeIniciando.innerText = "Iniciando session..."
            bloqueRespuesta.appendChild(circuloAnimado)
            bloqueRespuesta.appendChild(mensajeIniciando)

            const transaccion = {
                zona: "IDX",
                IDX: "conectar",
                usuario: usuario,
                clave: clave
            };

            bloqueRespuesta.style.visibility = "visible"

            const respuestaServidor = await casaVitini.componentes.servidor(transaccion)

            if (respuestaServidor?.error) {
                bloqueRespuesta.innerText = respuestaServidor?.error
                bloqueRespuesta.style.display = "block"
                //contenedorBotones.removeAttribute("style")
                campos.forEach(campo => {
                    campo.style.background = "rgba(255, 0, 0, 0.5)"
                });
            }

            if (respuestaServidor?.ok) {

                let tipo;
                const rol = respuestaServidor?.rol;

                if (rol === "cliente") {
                    tipo = "publico"
                }
                if (rol === "administrador" ||
                    rol === "empleado") {
                    tipo = "panelControl"
                }
                const navegacion = {
                    tipo: tipo,
                    usuario: respuestaServidor?.ok,
                    rol: rol
                }

                casaVitini.componentes.controladorNavegacion(navegacion)
                await casaVitini.componentes.controlCodigoAdministracion()
                const zonaActual = document.getElementById("uiNavegacion").getAttribute("vistaActual")
                const entrada = {
                    vista: zonaActual,
                    tipoOrigen: "menuNavegador"
                }

                return casaVitini.componentes.controladorVista(entrada)
            }

        },
        cerrarSession: async () => {
            try {
                const transaccion = {
                    zona: "IDX",
                    IDX: "desconectar"
                };

                const respuestaServidor = await casaVitini.componentes.servidor(transaccion)

                if (respuestaServidor?.error) {
                    return casaVitini.ui.vistas.advertenciaInmersiva(respuestaServidor?.error)
                }

                if (respuestaServidor?.IDX === "desconectado") {
                    await casaVitini.componentes.controlCodigoAdministracion()
                    return respuestaServidor
                }
            } catch (error) {
                return casaVitini.ui.vistas.advertenciaInmersiva(error)
            }

        },
        estadoSession: async () => {
            const transaccion = {
                zona: "IDX",
                IDX: "estado"
            }

            const respuestaServidor = await casaVitini.componentes.servidor(transaccion)

            // await casaVitini.componentes.controlCodigoAdministracion()
            return respuestaServidor
        },
    },
}
window.addEventListener("load", casaVitini.componentes.arranque)
window.addEventListener("popstate", casaVitini.componentes.navegacion)