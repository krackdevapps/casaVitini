export const reservaComponentes = {
    detallesReservaUI: {
        reservaUI: {
            despliege: async function (data) {
                const reservaUID = data.reservaUID
                const configuracionVista = data.configuracionVista
                const reserva = await this.global.obtenerReserva({
                    reservaUID,
                    configuracionVista
                })
                const reservaUI = await this.ui.despliege({
                    reserva,
                    configuracionVista
                })
                const titularUI = reservaUI.querySelector("[contenedor=panelGlobal] [contenedor=titular]")
                const estadoReservaUI = reservaUI.querySelector("[contenedor=panelGlobal] [contenedor=estadoReserva]")
                reservaUI.setAttribute("configuracionVista", configuracionVista)
                if (configuracionVista === "publica") {
                    reservaUI.querySelector("[contenedor=pendiente]")?.remove()
                    titularUI.style.pointerEvents = "none"
                    estadoReservaUI.style.pointerEvents = "none"
                    const contenedorFechas = reservaUI.querySelector("[nombreContenedor=rangoReserva]")
                    contenedorFechas.style.pointerEvents = "none"
                } else {
                    titularUI.addEventListener("click", () => {
                        this.titular.desplegarUI(reservaUID)
                    })
                    estadoReservaUI.addEventListener("click", () => {
                        this.estado.panelExpandidoUI(reservaUID)
                    })
                }
                return reservaUI
            },
            ui: {
                despliege: async function (data) {
                    const configuracionVista = data.configuracionVista
                    const reserva = data.reserva.ok
                    const global = reserva.global
                    const fechaEntrada = global.fechaEntrada
                    const fechaSalida = global.fechaSalida
                    const porcentajeTranscurrido = global.porcentajeTranscurrido
                    const reservaUID = global.reservaUID
                    const estadoReservaIDV = global.estadoReservaIDV
                    const contenedor = this.componentesUI.contenedor(reservaUID)
                    const css = await this.css()

                    contenedor.appendChild(css)
                    const estadoPendienteUI = this.componentesUI.estadoPendienteUI.despliege({
                        estadoReservaIDV,
                        reservaUID
                    })
                    contenedor.appendChild(estadoPendienteUI)
                    const panelGlobal = this.componentesUI.bloqueGlobal.despliege(reserva)
                    contenedor.appendChild(panelGlobal)
                    const barraProgress = this.componentesUI.barraProgreso({
                        reservaUID,
                        porcentajeTranscurrido
                    })
                    contenedor.appendChild(barraProgress)
                    const contenedorFechasUI = casaVitini.view.__sharedMethods__.contenedorFechasUI({
                        nombreContenedor: "rangoReserva",
                        modo: "administracion",
                        nombreFechaEntrada: "Fecha entrada",
                        nombreSalidaEntrada: "Fecha salida",
                        configuracionCalendarioInicio: {
                            rangoIDV: "inicioRango",
                            contenedorOrigenIDV: "[calendario=entrada]",
                            perfilMes: "calendario_entrada_asistido_detallesReserva_conPasado",
                            mensajeInfo: "Selecciona la fecha de entrada que quieras actualizar en esta reserva",
                            metodoSelectorDia: "view.__sharedMethods__.detallesReservaUI.reservaUI.fechas.seleccionarDia",
                            seleccionableDiaLimite: "no"
                        },
                        configuracionCalendarioFinal: {
                            rangoIDV: "finalRango",
                            contenedorOrigenIDV: "[calendario=salida]",
                            perfilMes: "calendario_salida_asistido_detallesReserva_conPasado",
                            metodoSelectorDia: "view.__sharedMethods__.detallesReservaUI.reservaUI.fechas.seleccionarDia",
                            mensajeInfo: "Selecciona la fecha de salida que quieras actualizar en esta reserva.",
                            seleccionableDiaLimite: "no"
                        }
                    })
                    contenedor.appendChild(contenedorFechasUI);
                    const calendarioEntrada = contenedorFechasUI.querySelector("[calendario=entrada]")
                    const calendarioSalida = contenedorFechasUI.querySelector("[calendario=salida]")
                    calendarioEntrada.setAttribute("memoriaVolatil", fechaEntrada)
                    calendarioSalida.setAttribute("memoriaVolatil", fechaSalida)
                    calendarioEntrada.querySelector("[fechaUI=fechaInicio]").textContent = fechaEntrada
                    calendarioSalida.querySelector("[fechaUI=fechaFin]").textContent = fechaSalida
                    const contenedorBotones = this.componentesUI.categoriasGlobalesUI.despliege({
                        rectangularidad: "horizontal",
                        reservaUID: reservaUID,
                        configuracionVista
                    })
                    contenedor.appendChild(contenedorBotones);
                    const contenedorDinamico = this.componentesUI.contenedorDinamico()
                    contenedor.appendChild(contenedorDinamico);
                    return contenedor
                },
                css: async function () {
                    const respuestaServidor = await casaVitini.shell.servidor({
                        zona: "componentes/obtenerComponente",
                        componente: "/reservas/reservaUI"
                    })
                    if (respuestaServidor?.error) {
                        return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                    } else if (respuestaServidor?.ok) {
                        const css = respuestaServidor.css
                        const cssContainer = document.createElement("style")
                        cssContainer.textContent = css
                        return cssContainer
                    }
                },
                componentesUI: {
                    contenedor: (reservaUID) => {
                        const contenedor = document.createElement("div");
                        contenedor.setAttribute("ui", "reservaUI")
                        contenedor.setAttribute("reservaUID", reservaUID)
                        contenedor.setAttribute("componente", "detalleReserva");
                        contenedor.classList.add(
                            "flexVertical",
                            "gap6"
                        )
                        return contenedor
                    },
                    estadoPendienteUI: {
                        despliege: function (data) {
                            const estadoReservaIDV = data.estadoReservaIDV
                            const reservaUID = data.reservaUID
                            const contenedor = document.createElement("div")
                            if (estadoReservaIDV !== "pendiente") {
                                contenedor.style.display = "none"
                            }
                            contenedor.setAttribute("contenedor", "pendiente")
                            contenedor.classList.add(
                                "gap6",
                                "borderRadius8",
                                "contenedorPendiente"
                            )
                            const botonAceptar = document.createElement("div")
                            botonAceptar.classList.add(
                                "botonV1",
                                "comportamientoBoton"
                            )
                            botonAceptar.textContent = "Aceptar reserva"
                            botonAceptar.addEventListener("click", () => {
                                this.com.aceptarReserva({
                                    reservaUID
                                })
                            })
                            contenedor.appendChild(botonAceptar);
                            const botonRechazar = document.createElement("div")
                            botonRechazar.classList.add(
                                "botonV1",
                                "comportamientoBoton"
                            )
                            botonRechazar.textContent = "Rechazar reserva"
                            botonRechazar.addEventListener("click", () => {
                                this.com.rechazarReserva({
                                    reservaUID
                                })
                            })
                            contenedor.appendChild(botonRechazar);
                            return contenedor
                        },
                        com: {
                            aceptarReserva: async function (data) {
                                const reservaUID = data.reservaUID
                                const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                                pantallaInmersiva.style.justifyContent = "center"
                                const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                                const instanciaUID_aceptarReserva = pantallaInmersiva.getAttribute("instanciaUID")
                                const titulo = constructor.querySelector("[componente=titulo]")
                                titulo.textContent = `Confirmas que aceptas la reserva ${reservaUID}`
                                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                                mensaje.textContent = "Al confirmar una reserva pendiente, cambiarás el estado de pendiente ha confirmado. La reserva dejará de ser visible desde la sección de reservas confirmadas. Si necesitas volver a poner la reserva en estado pendiente, pulsa en el estado de la reserva para poder cambiarla."
                                const botonAceptar = constructor.querySelector("[boton=aceptar]")
                                botonAceptar.textContent = "Comfirmar y aceptar reserva"
                                botonAceptar.addEventListener("click", () => {
                                    this.confirmarNuevoEstado({
                                        reservaUID,
                                        instanciaUID_aceptarReserva,
                                        nuevoEstado: "confirmada"
                                    })
                                })
                                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                                botonCancelar.textContent = "Cancelar y volver"
                                document.querySelector("main").appendChild(pantallaInmersiva)
                            },
                            rechazarReserva: async function (data) {
                                const reservaUID = data.reservaUID
                                const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                                pantallaInmersiva.style.justifyContent = "center"
                                const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                                const instanciaUID_aceptarReserva = pantallaInmersiva.getAttribute("instanciaUID")
                                const titulo = constructor.querySelector("[componente=titulo]")
                                titulo.textContent = `Confirmas que rechazas la reserva ${reservaUID}`
                                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                                mensaje.textContent = "Rechazar una reserva implica cancelar la reserva."
                                const botonRechazar = constructor.querySelector("[boton=aceptar]")
                                botonRechazar.textContent = "Rechazar reserva"
                                botonRechazar.addEventListener("click", (e) => {
                                    casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.cancelarReserva.confirmaCancelacion({
                                        tipoBloqueoIDV: "sinBloqueo"
                                    })
                                })
                                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                                botonCancelar.textContent = "Cerrar y volver"
                                document.querySelector("main").appendChild(pantallaInmersiva)
                            },
                            ponerReservaEnPendiente: async function (data) {
                                const reservaUID = data.reservaUID
                                const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                                const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                                const instanciaUID_aceptarReserva = pantallaInmersiva.getAttribute("instanciaUID")
                                const titulo = constructor.querySelector("[componente=titulo]")
                                titulo.textContent = `Confirmas que aceptas la reserva ${reservaUID}`
                                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                                mensaje.textContent = "Al confirmar una reserva pendiente, cambiarás el estado de pendiente.Ha confirmado.La reserva dejará de ser visible desde la sección de reservas confirmadas. Si necesitas volver a poner la reserva en estado pendiente, pulsa en el estado de la reserva para poder cambiarla"
                                const botonAceptar = constructor.querySelector("[boton=aceptar]")
                                botonAceptar.textContent = "Comfirmar y aceptar reserva"
                                botonAceptar.addEventListener("click", () => {
                                    this.confirmarNuevoEstado({
                                        reservaUID,
                                        instanciaUID_aceptarReserva,
                                        nuevoEstado: "pendiente"
                                    })
                                })
                                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                                botonCancelar.textContent = "Cancelar y volver"
                                document.querySelector("main").appendChild(pantallaInmersiva)
                            },
                            confirmarNuevoEstado: async function (data) {
                                const reservaUID = data.reservaUID
                                const nuevoEstado = data.nuevoEstado
                                const instanciaUID_aceptarReserva = data.instanciaUID_aceptarReserva
                                const ui = document.querySelector(`[instanciaUID="${instanciaUID_aceptarReserva}"]`)
                                const contenedor = ui.querySelector("[componente=constructor]")
                                contenedor.innerHTML = null
                                const spinner = casaVitini.ui.componentes.spinner({
                                    mensaje: "Aceptando reserva un momento por favor..."
                                })
                                contenedor.appendChild(spinner)
                                const transaccion = {
                                    zona: "administracion/reservas/detallesReserva/global/actualizarEstadoReserva",
                                    reservaUID: String(reservaUID),
                                    nuevoEstado
                                }
                                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                                const uiRenderizada = document.querySelector(`[reservaUID="${reservaUID}"]`)
                                if (!uiRenderizada) { return }
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas();
                                if (respuestaServidor?.error) {
                                    return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                                }
                                if (respuestaServidor?.ok) {
                                    const estadoUI = uiRenderizada.querySelector("[dataReserva=estado]")
                                    const contenedorPendienteUI = uiRenderizada.querySelector("[contenedor=pendiente]")
                                    const estadoActual = respuestaServidor.estadoActual
                                    if (estadoActual === "pendiente") {
                                        estadoUI.textContent = "Pendiente"
                                        estadoUI.setAttribute("estadoReservaIDV", "pendiente")
                                        contenedorPendienteUI.style.display = "grid"
                                    }
                                    if (estadoActual === "confirmada") {
                                        estadoUI.textContent = "Confirmada"
                                        estadoUI.setAttribute("estadoReservaIDV", "confirmada")
                                        contenedorPendienteUI.style.display = "none"
                                    }
                                }
                            },
                            panelExpandidoUI: async function (data) {
                                const reservaUID = data.reservaUID
                                const estadoActual = data.estadoActual
                                const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                                pantallaInmersiva.style.justifyContent = "center"
                                const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                                const instanciaUID_aceptarReserva = pantallaInmersiva.getAttribute("instanciaUID")
                                const titulo = constructor.querySelector("[componente=titulo]")
                                titulo.textContent = `Estado de la reserva ${reservaUID}`
                                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                                if (estadoActual === "confirmada") {
                                    mensaje.textContent = "El estado actual de la reserva es confirmado.Si se necesita, puedes cambiar el estado de esta reserva a pendiente.Esto permitirá insertar la reserva en reservas pendientes de revisión"
                                    const botonAceptar = constructor.querySelector("[boton=aceptar]")
                                    botonAceptar.textContent = "Pasar el estado de esta reserva a pendiente de revisión"
                                    botonAceptar.addEventListener("click", () => {
                                        this.confirmarNuevoEstado({
                                            reservaUID,
                                            instanciaUID_aceptarReserva,
                                            nuevoEstado: "pendiente"
                                        })
                                    })
                                } else
                                    if (estadoActual === "pendiente") {
                                        mensaje.textContent = "El estado de esta reserva es pendiente, en este estado es recomendable revisar la reserva para tomar la decisión de aceptarla o rechazarla.Es recomendable revisar las reservas pendientes y aceptar o rechazarlas para mantener la lista de reservas pendientes sin saturar."
                                        const botonAceptar = constructor.querySelector("[boton=aceptar]")
                                        botonAceptar.textContent = "Aceptar reserva"
                                        botonAceptar.addEventListener("click", () => {
                                            this.confirmarNuevoEstado({
                                                reservaUID,
                                                instanciaUID_aceptarReserva,
                                                nuevoEstado: "confirmada"
                                            })
                                        })
                                    } else if (estadoActual === "cancelada") {
                                        titulo.textContent = `La reserva ${reservaUID} esta cancelada`
                                        mensaje.textContent = "Esta reserva está cancelada.Las reservas canceladas no pueden revertir su estado.Puede eliminar definitivamente la reserva de la base de datos para que no esté almacenada desde el apartado de cancelar reserva dentro de la reserva."
                                        const botonAceptar = constructor.querySelector("[boton=aceptar]")
                                        botonAceptar.remove()
                                    }
                                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                                botonCancelar.textContent = "Cancelar y volver"
                                document.querySelector("main").appendChild(pantallaInmersiva)
                            }
                        }
                    },
                    bloqueGlobal: {
                        despliege: function (data) {
                            const global = data.global
                            const detallesTitular = data?.titular
                            const contenedorFinanciero = data.contenedorFinanciero
                            const reservaUID = global.reservaUID
                            const estadoReservaIDV = global.estadoReservaIDV
                            const estadoPagoIDV = global.estadoPagoIDV
                            const fechaCreacion = global.fechaCreacion
                            const origenIDV = global.origenIDV
                            const nombreCompletoTitular = detallesTitular.nombreTitular
                            const tipoTitularIDV = detallesTitular.tipoTitularIDV
                            const totalReserva = contenedorFinanciero?.desgloseFinanciero?.global?.totales?.totalFinal ?? "Sin información"
                            const contenedor = document.createElement("div");
                            contenedor.setAttribute("class", "administracionReservasDetalesMarcoEnvolventeInformacionGeneral");
                            contenedor.setAttribute("contenedor", "panelGlobal")
                            const contenedor_reservaUI = document.createElement("div");
                            contenedor_reservaUI.setAttribute("class", "administracion_reservas_detallesReserva_contenedorReservaUID");
                            contenedor.appendChild(contenedor_reservaUI);
                            const contenedor_restoGlobal = document.createElement("div")
                            contenedor_restoGlobal.classList.add("administracion_reservas_detallesReserva_contenedorRestoGlobal")
                            contenedor.appendChild(contenedor_restoGlobal);
                            const reservaUI = this.com.reservaUI(reservaUID)
                            contenedor_reservaUI.appendChild(reservaUI)
                            const tipoTitular = () => {
                                if (tipoTitularIDV === "titularCliente") {
                                    return detallesTitular.clienteUID
                                }
                            }
                            const configuracionGlobal = [{
                                titulo: "Titular de la reserva",
                                valor: nombreCompletoTitular || "Reserva sin titular",
                                selecionable: "si",
                                atributos: {
                                    contenedor: {
                                        titularUID: tipoTitular(),
                                        contenedor: "titular"
                                    },
                                    data: {
                                        dataReserva: "nombreTitular"
                                    }
                                }
                            }, {
                                titulo: "Fecha de creación UTC",
                                valor: fechaCreacion,
                            }, {
                                titulo: "Origen de la reserva",
                                valor: casaVitini.componentes.diccionarios.reserva.origenIDV(origenIDV),
                                atributos: {
                                    data: {
                                        dataReserva: "origen"
                                    }
                                }
                            }, {
                                titulo: "Estado de la reserva",
                                valor: casaVitini.componentes.diccionarios.reserva.estadoReservaIDV(estadoReservaIDV),
                                selecionable: "si",
                                atributos: {
                                    contenedor: {
                                        contenedor: "estadoReserva"
                                    },
                                    data: {
                                        dataReserva: "estado",
                                        estadoReservaIDV: estadoReservaIDV
                                    }
                                }
                            }, {
                                titulo: "Estado del pago",
                                valor: casaVitini.componentes.diccionarios.reserva.estadoPagoIDV(estadoPagoIDV),
                                atributos: {
                                    data: {
                                        dataReserva: "estadoPago",
                                        estadoReservaIDV: estadoReservaIDV
                                    }
                                }
                            }, {
                                titulo: "Total",
                                valor: totalReserva,
                                atributos: {
                                    data: {
                                        dataReserva: "totalReservaConImpuestos",
                                        estadoReservaIDV: estadoReservaIDV
                                    }
                                }
                            }]
                            configuracionGlobal.forEach((c) => {
                                const menuGlobalUI = this.com.infoGlobalUI(c)
                                contenedor_restoGlobal.appendChild(menuGlobalUI)
                            })
                            return contenedor
                        },
                        com: {
                            reservaUI: (reservaUID) => {
                                const contenedor = document.createElement("div");
                                contenedor.style.overflow = "hidden"
                                contenedor.classList.add(
                                    "flexVertical",
                                    "padding4",
                                    "flextJustificacion_center",
                                    "borderRadius12"
                                );
                                const titulo = document.createElement("p");
                                titulo.setAttribute("class", "adminsitracionReservasTituloNombre marginCeroparaP");
                                titulo.textContent = "Reserva";
                                contenedor.appendChild(titulo);
                                const data = document.createElement("p");
                                data.classList.add("contenedroTextoEspansivo");
                                data.setAttribute("dataReserva", "reservaID");
                                data.setAttribute("componente", "reservaUID_" + reservaUID)
                                data.textContent = reservaUID;
                                contenedor.appendChild(data);
                                return contenedor
                            },
                            infoGlobalUI: (d) => {
                                const titulo = d.titulo
                                const valor = d.valor
                                const atributos = d.atributos || {}
                                const atributosContenedor = atributos.contenedor || {}
                                const atributosData = atributos.data || {}
                                const selecionable = d.selecionable
                                const contenedor = document.createElement("div");
                                contenedor.style.overflow = "hidden"
                                contenedor.classList.add(
                                    "flexVertical",
                                    "padding8",
                                    "noSelecionable",
                                    "flextJustificacion_center",
                                    "borderRadius12"
                                );
                                Object.entries(atributosContenedor).forEach(([nombreAtributo, valorAtributo]) => {
                                    contenedor.setAttribute(nombreAtributo, valorAtributo)
                                });
                                if (selecionable === "si") {
                                    contenedor.classList.add("comportamientoBoton");
                                }
                                const tituloUI = document.createElement("p");
                                tituloUI.classList.add(
                                    "negrita",
                                    "textoCentrado"
                                );
                                tituloUI.textContent = titulo;
                                contenedor.appendChild(tituloUI);
                                const data = document.createElement("p");
                                data.classList.add("contenedroTextoEspansivo");
                                Object.entries(atributosData).forEach(([nombreAtributo, valorAtributo]) => {
                                    data.setAttribute(nombreAtributo, valorAtributo)
                                });
                                data.textContent = valor;
                                contenedor.appendChild(data);
                                return contenedor
                            }
                        }
                    },
                    barraProgreso: (data) => {
                        const reservaUID = data.reservaUID
                        const porcentajeTranscurrido = data.porcentajeTranscurrido
                        const claseUID = `barraProgresso-anchoDinamico-${reservaUID}`
                        const contenedor = document.createElement("div")
                        contenedor.classList.add(
                            "backgroundGrey1",
                            "borderRadius8",
                        )
                        contenedor.style.height = "20px"
                        contenedor.style.overflow = "hidden"
                        const style = document.createElement('style');
                        style.innerHTML = `
                            .${claseUID} {
                                width: ${porcentajeTranscurrido}%;
                        `;
                        contenedor.appendChild(style);
                        const barraProgresso = document.createElement("div")
                        barraProgresso.setAttribute("componente", "progreso")
                        barraProgresso.classList.add(
                            "barraProgresso",
                            claseUID
                        )
                        contenedor.appendChild(barraProgresso);
                        return contenedor
                    },
                    categoriasGlobalesUI: {
                        despliege: function (metadatos) {
                            const reservaUID = metadatos.reservaUID
                            const configuracionVista = metadatos.configuracionVista
                            let url
                            if (configuracionVista === "publica") {
                                url = "/micasa/reservas/reserva:" + reservaUID + "/zona:"
                            } else {
                                url = "/administracion/reservas/reserva:" + reservaUID + "/zona:"
                            }
                            const contenedor = document.createElement("div");
                            contenedor.classList.add(
                                "flexVertical"
                            );
                            contenedor.setAttribute("componente", "panelDetallesReserva")
                            const contenedorBotonesExpandidos = document.createElement("div")
                            contenedorBotonesExpandidos.classList.add("administracion_reservas_detallesReserva_contenedorMenuExpandido")
                            contenedorBotonesExpandidos.setAttribute("contenedor", "botonesExpandidos")
                            if (configuracionVista === "publica") {
                                contenedorBotonesExpandidos.style.gridTemplateColumns = "auto auto auto auto 50px"
                            } else {
                            }
                            contenedor.appendChild(contenedorBotonesExpandidos)
                            const marcoMenuResponsivo = document.createElement("div");
                            marcoMenuResponsivo.setAttribute("class", "administracion_reserva_detallesReserva_marcoMenuResponsivo");
                            marcoMenuResponsivo.textContent = "Menú reserva"
                            marcoMenuResponsivo.addEventListener("click", () => {
                                document.body.style.overflow = "hidden";
                                this.desplegarMenuResponsivo({
                                    reservaUID,
                                    configuracionVista
                                })
                            })
                            contenedor.appendChild(marcoMenuResponsivo);
                            const botonNuevaReserva = document.createElement("a");
                            botonNuevaReserva.setAttribute("class", "administracion_reservas_DetallesReserva_botonCategoria");
                            botonNuevaReserva.setAttribute("categoriaReserva", "alojamiento");
                            botonNuevaReserva.setAttribute("href", url + "alojamiento");
                            botonNuevaReserva.addEventListener("click", (e) => {
                                e.preventDefault()
                                this.controladorCategorias({
                                    categoria: "alojamiento",
                                    origen: "botonCategoria",
                                    reservaUID: reservaUID
                                })
                            })
                            botonNuevaReserva.textContent = "Alojamiento";
                            contenedorBotonesExpandidos.appendChild(botonNuevaReserva);
                            const botonCompAlo = document.createElement("a");
                            botonCompAlo.setAttribute("class", "administracion_reservas_DetallesReserva_botonCategoria");
                            botonCompAlo.setAttribute("categoriaReserva", "complementosDeAlojamiento");
                            botonCompAlo.setAttribute("href", url + "complementos_de_alojamiento");
                            botonCompAlo.addEventListener("click", (e) => {
                                e.preventDefault()
                                const metadatos = {
                                    categoria: "complementosDeAlojamiento",
                                    origen: "botonCategoria",
                                    reservaUID: reservaUID
                                }
                                this.controladorCategorias(metadatos)
                            })
                            botonCompAlo.textContent = "Complementos de alojamiento";
                            contenedorBotonesExpandidos.appendChild(botonCompAlo);
                            const botonCalcularPrecio = document.createElement("a");
                            botonCalcularPrecio.setAttribute("class", "administracion_reservas_DetallesReserva_botonCategoria");
                            botonCalcularPrecio.setAttribute("componente", "botonCalcularPrecioReserva");
                            botonCalcularPrecio.setAttribute("categoriaReserva", "enlacesDePago");
                            botonCalcularPrecio.setAttribute("href", url + "enlaces_de_pago");
                            botonCalcularPrecio.addEventListener("click", (e) => {
                                e.preventDefault()
                                const metadatos = {
                                    categoria: "enlacesDePago",
                                    origen: "botonCategoria",
                                    reservaUID: reservaUID
                                }
                                this.controladorCategorias(metadatos)
                            })
                            botonCalcularPrecio.textContent = "Enlaces de pago";
                            if (configuracionVista === "publica") {
                            } else {
                                contenedorBotonesExpandidos.appendChild(botonCalcularPrecio);
                            }
                            const botonDetallesDelPago = document.createElement("a");
                            botonDetallesDelPago.setAttribute("class", "administracion_reservas_DetallesReserva_botonCategoria");
                            botonDetallesDelPago.setAttribute("categoriaReserva", "transacciones");
                            botonDetallesDelPago.setAttribute("href", url + "transacciones");
                            botonDetallesDelPago.textContent = "Transacciones";
                            botonDetallesDelPago.addEventListener("click", (e) => {
                                e.preventDefault()
                                const metadatos = {
                                    categoria: "transacciones",
                                    origen: "botonCategoria",
                                    reservaUID: reservaUID
                                }
                                this.controladorCategorias(metadatos)
                            })
                            if (configuracionVista === "publica") {
                            } else {
                                contenedorBotonesExpandidos.appendChild(botonDetallesDelPago);
                            }
                            const botonEnlacePago = document.createElement("a");
                            botonEnlacePago.setAttribute("class", "administracion_reservas_DetallesReserva_botonCategoria");
                            botonEnlacePago.setAttribute("categoriaReserva", "desgloseTotal");
                            botonEnlacePago.setAttribute("href", url + "desglose_total");
                            botonEnlacePago.textContent = "Desglose del total";
                            botonEnlacePago.addEventListener("click", (e) => {
                                e.preventDefault()
                                const metadatos = {
                                    categoria: "desgloseTotal",
                                    origen: "botonCategoria",
                                    reservaUID: reservaUID
                                }
                                this.controladorCategorias(metadatos)
                            })
                            contenedorBotonesExpandidos.appendChild(botonEnlacePago);
                            const botonServicios = document.createElement("a");
                            botonServicios.setAttribute("class", "administracion_reservas_DetallesReserva_botonCategoria");
                            botonServicios.setAttribute("categoriaReserva", "servicios");
                            botonServicios.setAttribute("href", url + "servicios");
                            botonServicios.textContent = "Servicios";
                            botonServicios.addEventListener("click", (e) => {
                                e.preventDefault()
                                const metadatos = {
                                    categoria: "servicios",
                                    origen: "botonCategoria",
                                    reservaUID: reservaUID
                                }
                                this.controladorCategorias(metadatos)
                            })
                            contenedorBotonesExpandidos.appendChild(botonServicios);
                            const botonCancelarReserva = document.createElement("a");
                            botonCancelarReserva.setAttribute("class", "administracion_reservas_DetallesReserva_botonCategoria");
                            botonCancelarReserva.setAttribute("categoriaReserva", "cancelarReserva");
                            botonCancelarReserva.setAttribute("href", url + "cancelar_reserva");
                            botonCancelarReserva.addEventListener("click", (e) => {
                                e.preventDefault()
                                const metadatos = {
                                    categoria: "cancelarReserva",
                                    origen: "botonCategoria",
                                    reservaUID: reservaUID
                                }
                                this.controladorCategorias(metadatos)
                            })
                            botonCancelarReserva.textContent = "Cancelar reserva";
                            if (configuracionVista === "publica") {
                            } else {
                                contenedorBotonesExpandidos.appendChild(botonCancelarReserva);
                            }
                            const botonMiscelanea = document.createElement("a");
                            botonMiscelanea.setAttribute("class", "administracion_reservas_DetallesReserva_botonCategoria");
                            botonMiscelanea.setAttribute("categoriaReserva", "miscelanea");
                            botonMiscelanea.setAttribute("href", url + "miscelanea");
                            botonMiscelanea.addEventListener("click", (e) => {
                                e.preventDefault()
                                const metadatos = {
                                    categoria: "miscelanea",
                                    origen: "botonCategoria",
                                    reservaUID: reservaUID
                                }
                                this.controladorCategorias(metadatos)
                            })
                            const lineaMiscelanea = document.createElement("div")
                            lineaMiscelanea.setAttribute("componente", "iconoLineaMiscelanea")
                            lineaMiscelanea.classList.add("administracion_reservas_detallesReseerva_iconoMiscelanea")
                            botonMiscelanea.appendChild(lineaMiscelanea);
                            contenedorBotonesExpandidos.appendChild(botonMiscelanea);
                            return contenedor;
                        },
                        desplegarMenuResponsivo: function (data) {
                            const reservaUID = data.reservaUID
                            const configuracionVista = data.configuracionVista
                            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                            ui.setAttribute("controlador", "controlResponsivoVisibilidad")
                            document.querySelector("main").appendChild(ui)
                            const contenedor = ui.querySelector("[componente=contenedor]")
                            contenedor.style.paddingTop = "0px"
                            const botonCancelar = document.createElement("div")
                            botonCancelar.classList.add("botonV1")
                            botonCancelar.setAttribute("boton", "cancelar")
                            botonCancelar.textContent = "Cerrar";
                            botonCancelar.addEventListener("click", () => {
                                return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            })
                            contenedor.appendChild(botonCancelar)
                            const metadatosMenuResponsivo = {
                                reservaUID: reservaUID,
                                configuracionVista
                            }
                            const panelGlobal = this.despliege(metadatosMenuResponsivo)
                            const contenedorBotonesEspandidos = panelGlobal.querySelector("[contenedor=botonesExpandidos]")
                            contenedorBotonesEspandidos.style.display = 'grid'
                            contenedorBotonesEspandidos.style.gap = '6px'
                            if (configuracionVista === "publica") {
                            } else {
                            }
                            contenedorBotonesEspandidos.querySelectorAll("[categoriaReserva]").forEach((boton) => {
                                boton.classList.add("botonV1BlancoIzquierda")
                            })
                            contenedor.appendChild(contenedorBotonesEspandidos)
                            const selectorBotonMiscelaniea = contenedorBotonesEspandidos.querySelector("[categoriareserva=miscelanea]")
                            selectorBotonMiscelaniea.innerHTML = null
                            selectorBotonMiscelaniea.textContent = "Miscelanea"
                            const controlResponsivoVisibilidad = () => {
                                const selectorElementoObservado = document.querySelector("[controlador=controlResponsivoVisibilidad]")
                                if (!selectorElementoObservado) {
                                    window.removeEventListener("resize", controlResponsivoVisibilidad);
                                    return
                                }
                                const windowWidth = window.innerWidth;
                                const threshold = "922"
                                if (windowWidth > threshold) {
                                    selectorElementoObservado?.remove()
                                }
                            }
                            window.addEventListener("resize", controlResponsivoVisibilidad);
                        },
                        ocultaCategorias: function () {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas();
                            this.limpiarMenusCategorias()
                            document.querySelector("[componente=contenedorDinamico]").innerHTML = null
                        },
                        limpiarMenusCategorias: function () {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas();
                            document.querySelector("[componente=iconoLineaMiscelanea]").removeAttribute("style")
                            const botonesCategoria = document.querySelectorAll("[categoriaReserva]")
                            botonesCategoria.forEach((boton) => {
                                boton.removeAttribute("style")
                                boton.setAttribute("estadoCategoria", "otra")
                            })
                            document.querySelector("[componente=contenedorDinamico]").innerHTML = null
                            const contenedorDinamico = document.querySelector("[componente=contenedorDinamico]")
                            contenedorDinamico.removeAttribute("style")
                        },
                        controladorCategorias: async function (metadatos) {
                            const origen = metadatos.origen
                            const categoriaIDV = metadatos.categoria
                            const reservaUI = document.querySelector("[reservaUID]")
                            const reservaUID = reservaUI.getAttribute("reservaUID")
                            const configuracionVista = reservaUI.getAttribute("configuracionVista")
                            const selectorBotonCategoriaRenderizado = document.querySelector(`[categoriaReserva="${categoriaIDV}"]`)
                            const estadoCategoria = selectorBotonCategoriaRenderizado?.getAttribute("estadoCategoria")
                            const categoriaActual = document.querySelector("[estadoCategoria=actual]")?.getAttribute("categoriaReserva")
                            this.limpiarMenusCategorias()
                            selectorBotonCategoriaRenderizado.setAttribute("estadoCategoria", "actual")
                            const funcionPersonalizada = `view.__sharedMethods__.detallesReservaUI.reservaUI.ui.componentesUI.categoriasGlobalesUI.controladorCategorias`
                            let url
                            if (configuracionVista === "publica") {
                                url = "/micasa/reservas/reserva:" + reservaUID + "/zona:"
                            } else {
                                url = "/administracion/reservas/reserva:" + reservaUID + "/zona:"
                            }
                            const constructorDireccionFuncion = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales[categoriaIDV]?.arranque
                            if (typeof constructorDireccionFuncion === "function") {
                                const botonCategoriaGlobal = document.querySelector(`[categoriaReserva=${categoriaIDV}]`)
                                botonCategoriaGlobal.style.background = "blue"
                                botonCategoriaGlobal.style.color = "white"
                                await casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales[categoriaIDV]?.arranque();
                                const categoriaURL = casaVitini.utilidades.cadenas.camelToSnake(categoriaIDV)
                                const directoriosFusion = url + categoriaURL
                                const componentesExistenteUID = "reservaUID_" + reservaUID
                                const titulo = "Casa Vitini"
                                const estado = {
                                    zona: directoriosFusion,
                                    EstadoInternoZona: "estado",
                                    tipoCambio: "parcial",
                                    componenteExistente: componentesExistenteUID,
                                    funcionPersonalizada: funcionPersonalizada,
                                    args: {
                                        origen: "url",
                                        categoria: categoriaIDV
                                    }
                                }
                                if (!categoriaActual || categoriaIDV === categoriaActual) {
                                    window.history.replaceState(estado, titulo, directoriosFusion)
                                } else if (categoriaIDV !== categoriaActual) {
                                    if (origen === "url") {
                                        window.history.replaceState(estado, titulo, directoriosFusion);
                                    }
                                    if (origen === "botonCategoria" && (estadoCategoria === "otra" || !estadoCategoria)) {
                                        window.history.pushState(estado, titulo, directoriosFusion);
                                    }
                                    if (origen === "botonCategoria" && estadoCategoria === "actual") {
                                        window.history.replaceState(estado, titulo, directoriosFusion);
                                    }
                                }
                            } else {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                const mensaje = "El controlador de categorías no encuentra la función"
                                casaVitini.ui.componentes.advertenciaInmersiva(mensaje)
                            }
                        },
                    },
                    contenedorDinamico: function () {
                        const contenedor = document.createElement("div");
                        contenedor.setAttribute("componente", "contenedorDinamico");
                        contenedor.classList.add(
                            "flexVertical",
                            "gap6",
                            "borderRadius16",
                            "backgroundWhite3"
                        )
                        return contenedor
                    },
                }
            },
            global: {
                obtenerReserva: async function (data) {
                    const reservaUID = data.reservaUID
                    const configuracionVista = data.configuracionVista
                    const transaccion = {
                        reservaUID: reservaUID
                    }
                    if (configuracionVista === "publica") {
                        transaccion.zona = "miCasa/misReservas/detallesReserva"
                    } else {
                        transaccion.zona = "administracion/reservas/detallesReserva/global/obtenerReserva"
                        transaccion.capas = [
                            "titular",
                            "desgloseFinanciero"
                        ]
                    }
                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    if (respuestaServidor?.error) {
                        return casaVitini.ui.componentes.mensajeSimple({
                            titulo: respuestaServidor?.error,
                        })
                    }
                    if (respuestaServidor?.ok) {
                        return respuestaServidor
                    }
                }
            },
            fechas: {
                seleccionarDia: function (dia_) {

                    const diaSeleccionado = dia_.target.getAttribute("dia").padStart(2, "0")
                    const diaSeleccionadoComoElemento = dia_.target;
                    const calendario = diaSeleccionadoComoElemento.closest("[componente=marcoCalendario]")
                    const calendarioIO = calendario.getAttribute("calendarioIO")
                    if (diaSeleccionadoComoElemento.getAttribute("estadoDia") === "seleccionado") {
                        diaSeleccionadoComoElemento.classList.remove("calendarioDiaSeleccionado")
                        if (calendarioIO === "entrada") {
                            document.querySelector("[componente=bloquePropuestaNuevaFechaEntrada]")?.remove()
                            diaSeleccionadoComoElemento.style.background = ""
                            diaSeleccionadoComoElemento.style.color = ""
                        }
                        if (calendarioIO === "salida") {
                            document.querySelector("[componente=bloquePropuestaNuevaFechaSalida]")?.remove()
                            diaSeleccionadoComoElemento.style.background = ""
                            diaSeleccionadoComoElemento.style.color = ""
                        }
                        diaSeleccionadoComoElemento.removeAttribute("estadoDia")
                        casaVitini.view.__sharedMethods__.detallesReservaUI.reservaUI.fechas.controladorZonaPropuestasCambioFechas()
                    }
                    document.querySelectorAll("[estado=disponible]").forEach(diaDisponible => {
                        diaDisponible.removeAttribute("estadoDia")
                        diaDisponible.style.background = ""
                        diaDisponible.style.color = ""
                    });
                    diaSeleccionadoComoElemento.style.background = "red"
                    diaSeleccionadoComoElemento.style.color = "white"
                    diaSeleccionadoComoElemento.setAttribute("estadoDia", "seleccionado")
                    const anoSeleccionado = document.querySelector("[componente=mesReferencia]").getAttribute("ano").padStart(4, "0")
                    const mesSeleccionado = document.querySelector("[componente=mesReferencia]").getAttribute("mes").padStart(2, "0")
                    const selectorPropuestaCambioFecha = document.querySelector("[componente=espacioPropuestaCambioFechaReserva]")
                    const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")

                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()

                    const propuestaUI = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                    const instanciaUID = propuestaUI.getAttribute("instanciaUID")
                    const contenedor = propuestaUI.querySelector("[componente=contenedor]")

                    document.querySelector("main").appendChild(propuestaUI)

                    if (calendarioIO === "entrada") {

                        const contenedorPropuesta = document.createElement("div")
                        contenedorPropuesta.classList.add(
                            "contenedorPropuesta",
                            "flexVertical",
                            "gap6"
                        )
                        contenedor.appendChild(contenedorPropuesta)

                        const tituloPropuesta = document.createElement("p")
                        tituloPropuesta.classList.add(
                            "tituloGris",
                            "padding14"
                        )
                        tituloPropuesta.textContent = "Propuesta de cambio de la fecha de entrada de la reserva " + reservaUID
                        tituloPropuesta.style.color = "black"
                        contenedorPropuesta.appendChild(tituloPropuesta)
                        const botonCancelar = document.createElement("div")
                        botonCancelar.classList.add("botonV1")
                        botonCancelar.textContent = "Cerrar propuesta y volver atrás"
                        botonCancelar.addEventListener("click", casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas)
                        contenedorPropuesta.appendChild(botonCancelar)
                        const infoPropuesta = document.createElement("div")
                        infoPropuesta.classList.add("padding14")
                        infoPropuesta.textContent = `Has propuesto cambiar la fecha de entrada de esta reserva a ${diaSeleccionado}/${mesSeleccionado}/${anoSeleccionado}. Si quieres confirmar la propuesta y cambiar la reserva, pulsa en el botón de confirmar de abajo. Si deseas cancelar, pulsa en el botón cancelar de arriba. Cuando pulses el botón confirmar, se realizará una última verificación para comprobar que los días siguen disponibles.`
                        contenedorPropuesta.appendChild(infoPropuesta)
                        const informacionImplicacion = document.createElement("div")
                        informacionImplicacion.classList.add("padding14")
                        informacionImplicacion.textContent = `Cuando se quitan días a una reserva, si luego se vuelven a añadir esos días, los precios se insertan al precio actual del mercado establecido en el hub de precios base y de comportamientos. Siempre puede alterar los precios de la reserva mediante el sistema de sobre control. Si hay pernoctantes con fechas de checkin que queden fuera del nuevo rango de fechas de la reserva, se eliminarán las fechas de checkin y checkout de los pernoctantes.`
                        contenedorPropuesta.appendChild(informacionImplicacion)
                        const botonAceptarPropuesta = document.createElement("div")
                        botonAceptarPropuesta.classList.add("botonV1BlancoIzquierda")
                        botonAceptarPropuesta.setAttribute("componente", "botonConfirmarCancelarReserva")
                        botonAceptarPropuesta.textContent = "Confirmar propuesta y aplicar nueva fecha de entrada a la reserva"
                        botonAceptarPropuesta.addEventListener("click", () => {
                            casaVitini.view.__sharedMethods__.detallesReservaUI.reservaUI.fechas.confirmarCambioFecha({
                                fechaSolicitada_ISO: `${anoSeleccionado}-${mesSeleccionado}-${diaSeleccionado}`,
                                reservaUID: reservaUID,
                                sentidoRango: "pasado",
                                contenedor: contenedor
                            })
                        })
                        contenedorPropuesta.appendChild(botonAceptarPropuesta)

                    }
                    if (calendarioIO === "salida") {
                        const contenedorPropuesta = document.createElement("div")
                        contenedorPropuesta.classList.add(
                            "contenedorPropuesta",
                            "flexVertical",
                            "gap6"
                        )
                        contenedor.appendChild(contenedorPropuesta)

                        const tituloPropuesta = document.createElement("p")
                        tituloPropuesta.classList.add(
                            "tituloGris",
                            "padding14"
                        )
                        tituloPropuesta.textContent = "Propuesta de cambio de la fecha de salida de la reserva " + reservaUID
                        tituloPropuesta.style.color = "black"
                        contenedorPropuesta.appendChild(tituloPropuesta)
                        const botonCancelar = document.createElement("div")
                        botonCancelar.classList.add("botonV1")
                        botonCancelar.textContent = "Cerrar propuesta y volver atrás"
                        botonCancelar.addEventListener("click", casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas)
                        contenedorPropuesta.appendChild(botonCancelar)
                        const infoPropuesta = document.createElement("div")
                        infoPropuesta.classList.add("padding14")
                        infoPropuesta.textContent = `Has propuesto cambiar la fecha de salida de la reserva a ${diaSeleccionado}/${mesSeleccionado}/${anoSeleccionado}. Si quieres confirmar la propuesta y cambiar la reserva, pulsa en el botón de confirmar de abajo. Si deseas cancelar, pulsa en el botón cancelar de arriba. Cuando pulses el botón confirmar, se realizará una última verificación para comprobar que los días siguen disponibles.`
                        contenedorPropuesta.appendChild(infoPropuesta)
                        const informacionImplicacion = document.createElement("div")
                        informacionImplicacion.classList.add("padding14")
                        informacionImplicacion.textContent = `Cuando se quitan días a una reserva, si luego se vuelven a añadir esos días, los precios se insertan al precio actual del mercado establecido en el hub de precios base y de comportamientos. Siempre puede alterar los precios de la reserva mediante el sistema de sobre control. Si hay pernoctantes con fechas de checkin que queden fuera del nuevo rango de fechas de la reserva, se eliminarán las fechas de checkin y checkout de los pernoctantes.`
                        contenedorPropuesta.appendChild(informacionImplicacion)
                        const botonAceptarPropuesta = document.createElement("div")
                        botonAceptarPropuesta.classList.add("botonV1BlancoIzquierda")
                        botonAceptarPropuesta.setAttribute("componente", "botonConfirmarCancelarReserva")
                        botonAceptarPropuesta.textContent = "Confirmar propuesta y aplicar nueva fecha de salida a la reserva"
                        botonAceptarPropuesta.addEventListener("click", () => {
                            casaVitini.view.__sharedMethods__.detallesReservaUI.reservaUI.fechas.confirmarCambioFecha({
                                fechaSolicitada_ISO: `${anoSeleccionado}-${mesSeleccionado}-${diaSeleccionado}`,
                                reservaUID: reservaUID,
                                sentidoRango: "futuro",
                                contenedor: contenedor
                            })
                        })
                        contenedorPropuesta.appendChild(botonAceptarPropuesta)
                    }
                },
                confirmarCambioFecha: async function (propuesta) {
                    const sentidoRango = propuesta.sentidoRango
                    const reservaUID = propuesta.reservaUID
                    const fechaSolicitada_ISO = propuesta.fechaSolicitada_ISO
                    const contenedor = propuesta.contenedor

                    const mensajes = {
                        pasado: [
                            "Confirmando la nueva fecha de entrada, por favor espere...",
                            "No se puede establecer la fecha de entrada porque los apartamentos de esta reserva están en otro evento que ocurre al mismo tiempo. A continuación tienes una lista de los eventos que entran en conflicto.",
                        ],
                        futuro: [
                            "Confirmando la nueva fecha de salida, por favor espere...",
                            "No se puede establecer la fecha de salida porque los apartamentos de esta reserva están en otro evento que ocurre al mismo tiempo. A continuación tienes una lista de los eventos que entran en conflicto."
                        ]
                    }

                    const spinner = casaVitini.ui.componentes.spinner({
                        mensaje: mensajes[sentidoRango][0],
                        visibilidadBoton: "no"
                    })
                    contenedor.innerHTML = null
                    contenedor.appendChild(spinner)

                    const respuestaServidor = await casaVitini.shell.servidor({
                        zona: "administracion/reservas/detallesReserva/global/confirmarModificarFechaReserva",
                        reservaUID: String(reservaUID),
                        sentidoRango: sentidoRango,
                        fechaSolicitada_ISO: fechaSolicitada_ISO
                    })

                    if (!contenedor) { return }
                    if (respuestaServidor?.error) {
                        const eventos = respuestaServidor.eventos
                        if (eventos) {
                            const contenedorError = document.createElement("div")
                            contenedorError.classList.add("contenedorErrorPropuesta")
                            const tituloPropuesta = document.createElement("p")
                            tituloPropuesta.classList.add(
                                "tituloGris",
                                "padding14",
                                "textoCentrado"
                            )
                            tituloPropuesta.textContent = "No se puede cambiar la fecha debido a otros eventos ya existentes."
                            tituloPropuesta.style.color = "black"
                            contenedorError.appendChild(tituloPropuesta)
                            const botonCancelar = document.createElement("div")
                            botonCancelar.classList.add("botonV1")
                            botonCancelar.textContent = "Cerrar y volver a la reserva"
                            botonCancelar.addEventListener("click", casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas)
                            contenedorError.appendChild(botonCancelar)
                            const infoPropuesta = document.createElement("div")
                            infoPropuesta.classList.add("padding14")
                            infoPropuesta.textContent = mensajes[sentidoRango][1]
                            contenedorError.appendChild(infoPropuesta)
                            for (const detallesDelEvento of eventos) {
                                const fechaEntrada = detallesDelEvento.fechaEntrada
                                const fechaSalida = detallesDelEvento.fechaSalida
                                const fechaEntrada_array = fechaEntrada.split("-")
                                const fechaSalida_array = fechaSalida.split("-")
                                const fechaEntrada_Humana = `${fechaEntrada_array[2]}/${fechaEntrada_array[1]}/${fechaEntrada_array[0]}`
                                const fechaSalida_Humana = `${fechaSalida_array[2]}/${fechaSalida_array[1]}/${fechaSalida_array[0]}`
                                const eventoUID = detallesDelEvento.uid
                                const tipoElemento = detallesDelEvento.tipoElemento
                                const descripcion = detallesDelEvento.descripcion
                                const contenedorEvento = document.createElement("div")
                                contenedorEvento.classList.add(
                                    "flexVertical",
                                    "borderRadius20",
                                    "backgroundWhite3",
                                    "padding6",
                                    "gap6"
                                )
                                contenedorError.appendChild(contenedorEvento)
                                const contenedorData = document.createElement("div")
                                contenedorData.classList.add(
                                    "flexVertcial",
                                    "gap6",
                                    "padding14"
                                )
                                contenedorEvento.appendChild(contenedorData)
                                const tipoEvento = document.createElement("div")
                                tipoEvento.classList.add("negrita")
                                tipoEvento.textContent = tipoElemento.toUpperCase()
                                contenedorData.appendChild(tipoEvento)
                                const nombreDato = document.createElement("div")
                                nombreDato.textContent = "Rango del evento"
                                contenedorData.appendChild(nombreDato)
                                const fechaEvento = document.createElement("div")
                                fechaEvento.textContent = `${fechaEntrada_Humana} >>> ${fechaSalida_Humana}`
                                contenedorData.appendChild(fechaEvento)
                                if (tipoElemento === "reserva") {
                                    const botonIrAlEvento = document.createElement("a")
                                    botonIrAlEvento.classList.add("botonV1BlancoIzquierda")
                                    botonIrAlEvento.textContent = "Ir a los detalles de la reserva"
                                    botonIrAlEvento.setAttribute("href", "/administracion/reservas/reserva:" + eventoUID)
                                    botonIrAlEvento.setAttribute("vista", "/administracion/reservas/reserva:" + eventoUID)
                                    botonIrAlEvento.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                                    contenedorEvento.appendChild(botonIrAlEvento)
                                }
                                if (tipoElemento === "bloqueo") {
                                    const apartamentoIDV = detallesDelEvento.apartamentoIDV
                                    const botonIrAlEvento = document.createElement("a")
                                    botonIrAlEvento.classList.add("botonV1BlancoIzquierda")
                                    botonIrAlEvento.textContent = "Ir a los detalles del bloqueo"
                                    botonIrAlEvento.setAttribute("href", "/administracion/gestion_de_bloqueos_temporales/" + apartamentoIDV + "/" + eventoUID)
                                    botonIrAlEvento.setAttribute("vista", "/administracion/gestion_de_bloqueos_temporales/" + apartamentoIDV + "/" + eventoUID)
                                    botonIrAlEvento.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                                    contenedorEvento.appendChild(botonIrAlEvento)
                                }
                                if (tipoElemento === "eventoCalendarioSincronizado" && descripcion) {
                                    const regex = /Reservation URL: (https:\/\/www\.airbnb\.com\/hosting\/reservations\/details\/[A-Za-z0-9]+)/;
                                    const match = descripcion.match(regex);
                                    const urlEvento = match?.[1] ?? "No se encontró la URL en el texto proporcionado.";
                                    const botonIrAlEvento = document.createElement("a")
                                    botonIrAlEvento.classList.add("botonV1BlancoIzquierda")
                                    botonIrAlEvento.textContent = "Ir a los detalles del calendario sincronizado"
                                    botonIrAlEvento.setAttribute("href", urlEvento)
                                    botonIrAlEvento.setAttribute("vista", urlEvento)
                                    contenedorEvento.appendChild(botonIrAlEvento)
                                }
                                if (tipoElemento === "eventoCalendarioSincronizado" && !descripcion) {
                                    const botonIrAlEvento = document.createElement("a")
                                    botonIrAlEvento.classList.add("infoEventoSinDetalles")
                                    botonIrAlEvento.textContent = "Este evento es de un calendario externo sincronizado y no ofrece detalles del mismo"
                                    contenedorEvento.appendChild(botonIrAlEvento)
                                }
                            }

                            contenedor.innerHTML = null
                            contenedor.appendChild(contenedorError)

                        } else {
                            contenedor.innerHTML = null
                            const errorUI = casaVitini.ui.componentes.errorUI_respuestaInmersiva({
                                errorUI: respuestaServidor.error
                            })
                            contenedor.appendChild(errorUI)
                        }
                    } else if (respuestaServidor?.ok) {
                        const sentidoRangoRespueata = respuestaServidor.sentidoRango
                        const fecha_ISO = respuestaServidor.fecha_ISO
                        const fechaArray_ISO = fecha_ISO.split("-")
                        const fecha_Humano = `${fechaArray_ISO[2]}/${fechaArray_ISO[1]}/${fechaArray_ISO[0]}`
                        casaVitini.view.__sharedMethods__.detallesReservaUI.reservaUI.actualizarReservaRenderizada()
                        if (sentidoRangoRespueata === "pasado" && pantallaDeCargaRenderizada) {
                            const selectorFechaEntrada = document.querySelector("[calendario=entrada]")
                            const selectorFechaEntradaUI = document.querySelector("[fechaUI=fechaInicio]")
                            selectorFechaEntrada.setAttribute("memoriaVolatil", fecha_ISO)
                            selectorFechaEntradaUI.textContent = fecha_Humano
                        }
                        if (sentidoRangoRespueata === "futuro" && pantallaDeCargaRenderizada) {
                            const selectorFechaSalida = document.querySelector("[calendario=salida]")
                            const selectorFechaSalidaUI = document.querySelector("[fechaUI=fechaFin]")
                            selectorFechaSalida.setAttribute("memoriaVolatil", fecha_ISO)
                            selectorFechaSalidaUI.textContent = fecha_Humano
                        }
                        const selectorMarcoAlojamiento = document.querySelector(`[reservaUID="${reservaUID}"] [componente=marcoAlojamiento]`)
                        if (selectorMarcoAlojamiento) {
                            //  casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.arranque()
                        }
                    }
                },
                controladorZonaPropuestasCambioFechas: function () {
                    const selectorZonaPropuestas = document.querySelector("[componente=espacioPropuestaCambioFechaReserva]").childElementCount
                    if (selectorZonaPropuestas > 0) {
                        document.querySelector("[componente=espacioPropuestaCambioFechaReserva]").style.display = "grid"
                    } else {
                        document.querySelector("[componente=espacioPropuestaCambioFechaReserva]").style.display = "none"
                    }
                },
                cancelarPropuestaCambioFecha: function (propuesta) {
                    propuesta.target.parentNode.remove()
                    casaVitini.view.__sharedMethods__.detallesReservaUI.reservaUI.fechas.controladorZonaPropuestasCambioFechas()
                },
            },
            titular: {
                desplegarUI: async function (reservaUID) {
                    document.body.style.overflow = "hidden";
                    const main = document.querySelector("main")
                    const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                    const instanciaUID = ui.getAttribute("instanciaUID")
                    main.appendChild(ui)
                    const contenedor = ui.querySelector("[componente=contenedor]")
                    const spinner = casaVitini.ui.componentes.spinner({
                        mensase: "Esperando al servidor...."
                    })
                    contenedor.appendChild(spinner)
                    const respuestaServidor = await casaVitini.shell.servidor({
                        zona: "administracion/reservas/detallesReserva/global/obtenerReserva",
                        reservaUID: reservaUID,
                        capas: [
                            "titular"
                        ]
                    })
                    const ui_renderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                    if (!ui_renderizada) { return }
                    if (respuestaServidor?.error) {
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                    }
                    if (respuestaServidor?.ok) {
                        contenedor.innerHTML = null
                        const detallesTitular = respuestaServidor.ok.titular
                        const tipoTitularIDV = detallesTitular?.tipoTitularIDV
                        const clienteUID = detallesTitular?.clienteUID
                        const nombreTitular = detallesTitular?.nombreTitular
                        const pasaporteTitular = detallesTitular?.pasaporteTitular
                        const tipoTitular = detallesTitular?.tipoTitular
                        const mailTitular = detallesTitular?.mailTitular
                        const telefonoTitular = detallesTitular?.telefonoTitular
                        const tituloUI = (titulo) => {
                            return this.componentes.titulo(titulo)
                        }
                        const infoUI = (info) => {
                            return this.componentes.infoUI(info)
                        }
                        const detallesDelTitularUI = (data) => {
                            return this.componentes.detallesDelTitularUI(data)
                        }
                        const botonIrALaFichaDelClinete = (clienteUID) => {
                            return this.componentes.botonIrALaFichaDelClinete(clienteUID)
                        }
                        const botonCambiarTitular = (instanciaUID) => {
                            return this.componentes.botonCambiarTitular(instanciaUID)
                        }
                        const botonDesasociar = (data) => {
                            return this.componentes.botonDesasociar(data)
                        }
                        const botonCerrarFormularioExpandidoCambiarTitular = (instanciaUID) => {
                            return this.componentes.botonCerrarFormularioExpandidoCambiarTitular(instanciaUID)
                        }
                        const buscadorUI = (reservaUID) => {
                            return casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.gestionPernoctante.componentes.buscadorRapido.UI({
                                reservaUID: reservaUID,
                                metodoFinal: "view.__sharedMethods__.detallesReservaUI.reservaUI.titular.componentes.transacciones.asociarTitularConLaReserva"
                            })
                        }
                        const formularioNuevoTitular = (reservaUID) => {
                            return casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.gestionPernoctante.componentes.nuevoClienteOTitular.UI({
                                metodoFinal: "view.__sharedMethods__.detallesReservaUI.reservaUI.titular.componentes.transacciones.transactorCrearClienteComoTitular",
                                tituloUI: "Crear nuevo cliente e insertarlo en la reserva como titular",
                                tituloBoton: "Crear cliente y insertarlo como titular de la reserva",
                                reservaUID: reservaUID
                            })
                        }
                        if (!tipoTitularIDV) {
                            const titulo = "Añadir titular a la reserva"
                            const info = "Esta reserva ahora mismo no tiene ningún titular asignado.Para añadir un titular a la reserva, puedes buscar con el campo de búsqueda inferior un cliente existente para asociarlo como titular.También puedes crear un cliente nuevo rellenando el formulario para crear un cliente y añadirlo como titular a esta reserva."
                            contenedor.appendChild(tituloUI(titulo))
                            contenedor.appendChild(infoUI(info))
                            contenedor.appendChild(buscadorUI(reservaUID))
                            contenedor.appendChild(formularioNuevoTitular(reservaUID))
                        } else if (tipoTitularIDV === "titularCliente") {
                            const titulo = "Detalles del titular"
                            const info = "Vista rápida de los detalles del titular de la reserva.Puedes cambiar el titular de la reserva si lo necesitas o desasociar el titular.También puedes cambiar el titular, esto te permite rellenar los datos mientras ves los datos del actual titular por si fuera necesario."
                            contenedor.appendChild(tituloUI(titulo))
                            contenedor.appendChild(infoUI(info))
                            contenedor.appendChild(detallesDelTitularUI({
                                clienteUID: clienteUID,
                                nombreTitular: nombreTitular,
                                pasaporteTitular: pasaporteTitular,
                                tipoTitular: "titularCliente",
                                mailTitular: mailTitular,
                                telefonoTitular: telefonoTitular,
                            }))
                            contenedor.appendChild(botonIrALaFichaDelClinete(clienteUID))
                            contenedor.appendChild(botonCambiarTitular(instanciaUID))
                            const botonCerrarFormularioExpandidoCambiarTitular_ = botonCerrarFormularioExpandidoCambiarTitular(instanciaUID)
                            botonCerrarFormularioExpandidoCambiarTitular_.style.display = "none"
                            contenedor.appendChild(botonCerrarFormularioExpandidoCambiarTitular_)
                            contenedor.appendChild(botonDesasociar({
                                instanciaUID: instanciaUID,
                                reservaUID: reservaUID
                            }))
                            const buscadorUI_ = buscadorUI(reservaUID)
                            buscadorUI_.style.display = "none"
                            contenedor.appendChild(buscadorUI_)
                            const formularioNuevoTitular_ = formularioNuevoTitular(reservaUID)
                            formularioNuevoTitular_.style.display = "none"
                            contenedor.appendChild(formularioNuevoTitular_)
                        } else if (tipoTitularIDV === "titularPool") {
                            const titulo = "Datos del titular no verificado (POOL)"
                            const info = `Los datos proporcionados provienen directamente del cliente, por que esta reservas ha sido hecha por el, lo que implica que su exactitud depende de la información suministrada por el propio cliente. Dado que la fuente de estos datos es el propio cliente, es crucial proceder a una verificación exhaustiva cruzando dicha información con la base de datos de clientes. 
                            Este proceso es fundamental para garantizar la coherencia y precisión de los datos antes de su utilización o procesamiento posterior.
                            Para ello, puedes utilizar el buscador ubicado más abajo. Si al realizar la búsqueda no encuentras coincidencias, puedes optar por completar el formulario disponible más abajo para crear un nuevo titular de la reserva. 
                            Este nuevo titular podrá ser insertado directamente en la reserva, asegurando que la información sea correcta y esté actualizada en el sistema.
                            En caso de que los datos sean similares a los de otro cliente existente, no te preocupes por crear una ficha duplicada o parecida, ya que más adelante podrás utilizar la herramienta de fusión para combinar los registros y evitar duplicidades.
                            `
                            contenedor.appendChild(tituloUI(titulo))
                            contenedor.appendChild(infoUI(info))
                            contenedor.appendChild(detallesDelTitularUI({
                                nombreTitular: nombreTitular,
                                pasaporteTitular: pasaporteTitular,
                                tipoTitular: "titularCliente",
                                mailTitular: mailTitular,
                                telefonoTitular: telefonoTitular,
                            }))
                            contenedor.appendChild(buscadorUI(reservaUID))
                            contenedor.appendChild(formularioNuevoTitular(reservaUID))
                        }
                        contenedor.appendChild(this.componentes.botonCerrar())
                    }
                },
                componentes: {
                    transacciones: {
                        asociarTitularConLaReserva: async function (data) {
                            const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                            const clienteUID = data.clienteUID
                            const instanciaUID = data.instanciaUID
                            const instanciaUIDPantallaDeCarga = casaVitini.utilidades.codigoFechaInstancia()
                            const opcionesPantallaDeCarga = {
                                instanciaUID: instanciaUIDPantallaDeCarga,
                                mensaje: "Asociando cliente a la titularidad de esta reserva"
                            }
                            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(opcionesPantallaDeCarga)
                            const pantallaDeCargaRenderizada = document.querySelector(`[pantallaSuperpuesta=pantallaCargaSuperpuesta][instanciaUID="${instanciaUIDPantallaDeCarga}"]`)
                            const respuestaServidor = await casaVitini.shell.servidor({
                                zona: "administracion/reservas/detallesReserva/gestionTitular/asociarTitular",
                                clienteUID: String(clienteUID),
                                reservaUID: reservaUID
                            })
                            pantallaDeCargaRenderizada?.remove()
                            if (respuestaServidor?.error) {
                                casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                const nuevoClienteUID = respuestaServidor.clienteUID
                                const nombreCompleto = respuestaServidor.nombreCompleto
                                const selectorNombreTitularRenderizado = document.querySelector(`[reservaUID="${reservaUID}"]`)
                                const selectorNombreTitular = document.querySelector(`[dataReserva=nombreTitular]`)
                                if (selectorNombreTitularRenderizado && selectorNombreTitular) {
                                    selectorNombreTitular.textContent = nombreCompleto
                                    const selectorBloqueTitular = document.querySelector(`[contenedor=titular]`)
                                    selectorBloqueTitular.setAttribute("tipoTitular", "titularCliente")
                                    selectorBloqueTitular.setAttribute("titularUID", nuevoClienteUID)
                                }
                                const instanciaUID_renderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                                if (instanciaUID_renderizada) {
                                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                    casaVitini.view.__sharedMethods__.detallesReservaUI.reservaUI.titular.desplegarUI(reservaUID)
                                }
                            }
                        },
                        transactorCrearClienteComoTitular: async function (data) {
                            const instanciaUIDPantallaDeCarga = casaVitini.utilidades.codigoFechaInstancia()
                            const opcionesPantallaDeCarga = {
                                instanciaUID: instanciaUIDPantallaDeCarga,
                                mensaje: "Asociando cliente a la titularidad de esta reserva"
                            }
                            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(opcionesPantallaDeCarga)
                            const pantallaDeCargaRenderizada = document.querySelector(`[pantallaSuperpuesta=pantallaCargaSuperpuesta][instanciaUID="${instanciaUIDPantallaDeCarga}"]`)
                            const reservaUID = data.reservaUID
                            const instanciaUID = data.instanciaUID
                            const datos = data.datos
                            const respuestaServidor = await casaVitini.shell.servidor({
                                zona: "administracion/reservas/detallesReserva/gestionTitular/crearTitular",
                                reservaUID: String(reservaUID),
                                ...datos
                            })
                            pantallaDeCargaRenderizada?.remove()
                            if (respuestaServidor?.error) {
                                casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                pantallaDeCargaRenderizada?.remove()
                                const nuevoClienteUID = respuestaServidor.clienteUID
                                const nombreCompleto = respuestaServidor.nombreCompleto
                                const selectorNombreTitularRenderizado = document.querySelector(`[reservaUID="${reservaUID}"]`)
                                const selectorNombreTitular = selectorNombreTitularRenderizado.querySelector(`[dataReserva=nombreTitular]`)
                                if (selectorNombreTitular) {
                                    selectorNombreTitular.textContent = nombreCompleto
                                    const selectorBloqueTitular = document.querySelector(`[contenedor=titular]`)
                                    selectorBloqueTitular.setAttribute("tipoTitular", "titularCliente")
                                    selectorBloqueTitular.setAttribute("titularUID", nuevoClienteUID)
                                }
                                const instanciaUID_renderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                                if (instanciaUID_renderizada) {
                                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                    casaVitini.view.__sharedMethods__.detallesReservaUI.reservaUI.titular.desplegarUI(reservaUID)
                                }
                            }
                        },
                        desasociarClienteComoTitular: async function (metadatos) {
                            const instanciaUID = metadatos.instanciaUID
                            const reservaUID = metadatos.reservaUID
                            const instanciaUIDPantallaDeCarga = casaVitini.utilidades.codigoFechaInstancia()
                            const opcionesPantallaDeCarga = {
                                instanciaUID: instanciaUIDPantallaDeCarga,
                                mensaje: "Desasociando cliente como titular de la reserva"
                            }
                            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(opcionesPantallaDeCarga)
                            const pantallaDeCargaRenderizada = document.querySelector(`[pantallaSuperpuesta=pantallaCargaSuperpuesta][instanciaUID="${instanciaUIDPantallaDeCarga}"]`)
                            const metadatosPantallaDeCarga = {
                                zona: "administracion/reservas/detallesReserva/gestionTitular/desasociarClienteComoTitular",
                                reservaUID: String(reservaUID)
                            }
                            const respuestaServidor = await casaVitini.shell.servidor(metadatosPantallaDeCarga)
                            if (respuestaServidor?.error) {
                                pantallaDeCargaRenderizada?.remove()
                                casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                pantallaDeCargaRenderizada?.remove()
                                const selectorNombreTitularRenderizado = document.querySelector(`[reservaUID="${reservaUID}"]`).querySelector(`[dataReserva=nombreTitular]`)
                                if (selectorNombreTitularRenderizado) {
                                    selectorNombreTitularRenderizado.textContent = "(Níngun titular asignado)"
                                    const selectorBloqueTitular = document.querySelector(`[contenedor=titular]`)
                                    selectorBloqueTitular.removeAttribute("tipoTitular")
                                    selectorBloqueTitular.removeAttribute("titularUID")
                                }
                                const selectorDestinoRenderizado = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                                if (selectorDestinoRenderizado) {
                                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                }
                            }
                        },
                    },
                    detallesDelTitularUI: function (detallesDelTitular) {
                        const clienteUID = detallesDelTitular.clienteUID
                        const nombreTitular = detallesDelTitular.nombreTitular
                        const pasaporteTitular = detallesDelTitular.pasaporteTitular
                        const tipoTitular = detallesDelTitular.tipoTitular
                        const mailTitular = detallesDelTitular.mailTitular ? detallesDelTitular.mailTitular : "(Sin mail)"
                        const telefonoTitular = detallesDelTitular.telefonoTitular ? detallesDelTitular.telefonoTitular : "(Sin Teléfono)"
                        const detallesRapidosDelTitular = document.createElement("div")
                        detallesRapidosDelTitular.classList.add(
                            "flexVertical",
                            "backgroundWhite3",
                            "borderRadius14",
                            "padding14",
                            "gap6"
                        )
                        let contenedorDato = document.createElement("div")
                        contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                        let nombreDato = document.createElement("div")
                        nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                        nombreDato.textContent = "Nombre completo del titular"
                        contenedorDato.appendChild(nombreDato)
                        let valorDato = document.createElement("div")
                        valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                        valorDato.classList.add("negrita")
                        valorDato.textContent = nombreTitular
                        contenedorDato.appendChild(valorDato)
                        detallesRapidosDelTitular.appendChild(contenedorDato)
                        contenedorDato = document.createElement("div")
                        contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                        nombreDato = document.createElement("div")
                        nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                        nombreDato.textContent = "Pasaporte"
                        contenedorDato.appendChild(nombreDato)
                        valorDato = document.createElement("div")
                        valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                        valorDato.classList.add("negrita")
                        valorDato.textContent = pasaporteTitular
                        contenedorDato.appendChild(valorDato)
                        detallesRapidosDelTitular.appendChild(contenedorDato)
                        contenedorDato = document.createElement("div")
                        contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                        nombreDato = document.createElement("div")
                        nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                        nombreDato.textContent = "Teléfono"
                        contenedorDato.appendChild(nombreDato)
                        valorDato = document.createElement("div")
                        valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                        valorDato.classList.add("negrita")
                        valorDato.textContent = telefonoTitular
                        contenedorDato.appendChild(valorDato)
                        detallesRapidosDelTitular.appendChild(contenedorDato)
                        contenedorDato = document.createElement("div")
                        contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                        nombreDato = document.createElement("div")
                        nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                        nombreDato.textContent = "e - Mail"
                        contenedorDato.appendChild(nombreDato)
                        valorDato = document.createElement("div")
                        valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                        valorDato.classList.add("negrita")
                        valorDato.textContent = mailTitular
                        contenedorDato.appendChild(valorDato)
                        detallesRapidosDelTitular.appendChild(contenedorDato)
                        return detallesRapidosDelTitular
                    },
                    detallesDelTitularPoolUI: function (detallesDelTitular) {
                        const nombreTitular = detallesDelTitular.nombreTitular
                        const pasaporteTitular = detallesDelTitular.pasaporteTitular
                        const tipoTitular = "Titular pool"
                        const mailtular = detallesDelTitular.mailTitular ? detallesDelTitular.mailTitular : "(Sin mail)"
                        const telefonoTitular = detallesDelTitular.telefonoTitular ? detallesDelTitular.telefonoTitular : "(Sin Teléfono)"
                        const detallesRapidosDelTitular = document.createElement("div")
                        detallesRapidosDelTitular.classList.add("tarjetaGris")
                        let contenedorDato = document.createElement("div")
                        contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                        let nombreDato = document.createElement("div")
                        nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                        nombreDato.textContent = "Nombre completo del titular"
                        contenedorDato.appendChild(nombreDato)
                        let valorDato = document.createElement("div")
                        valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                        valorDato.classList.add("negrita")
                        valorDato.textContent = nombreTitular
                        contenedorDato.appendChild(valorDato)
                        detallesRapidosDelTitular.appendChild(contenedorDato)
                        contenedorDato = document.createElement("div")
                        contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                        nombreDato = document.createElement("div")
                        nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                        nombreDato.textContent = "Pasaporte"
                        contenedorDato.appendChild(nombreDato)
                        valorDato = document.createElement("div")
                        valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                        valorDato.classList.add("negrita")
                        valorDato.textContent = pasaporteTitular
                        contenedorDato.appendChild(valorDato)
                        detallesRapidosDelTitular.appendChild(contenedorDato)
                        contenedorDato = document.createElement("div")
                        contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                        nombreDato = document.createElement("div")
                        nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                        nombreDato.textContent = "Teléfono"
                        contenedorDato.appendChild(nombreDato)
                        valorDato = document.createElement("div")
                        valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                        valorDato.classList.add("negrita")
                        valorDato.textContent = telefonoTitular
                        contenedorDato.appendChild(valorDato)
                        detallesRapidosDelTitular.appendChild(contenedorDato)
                        contenedorDato = document.createElement("div")
                        contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                        nombreDato = document.createElement("div")
                        nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                        nombreDato.textContent = "e - Mail"
                        contenedorDato.appendChild(nombreDato)
                        valorDato = document.createElement("div")
                        valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                        valorDato.classList.add("negrita")
                        valorDato.textContent = mailtular
                        contenedorDato.appendChild(valorDato)
                        detallesRapidosDelTitular.appendChild(contenedorDato)
                        return detallesRapidosDelTitular
                    },
                    botonCerrar: function () {
                        const boton = document.createElement("div")
                        boton.classList.add("botonV1")
                        boton.innerHTML = "Cerrar gestión del titular de la reserva"
                        boton.addEventListener("click", casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas)
                        return boton
                    },
                    botonDesasociar: function (metadatos) {
                        const boton = document.createElement("div")
                        boton.classList.add("botonV1BlancoIzquierda")
                        boton.innerHTML = "Desasociar cliente como titular"
                        boton.setAttribute("boton", "desasociarTitular")
                        boton.addEventListener("click", () => {
                            this.transacciones.desasociarClienteComoTitular(metadatos)
                        })
                        return boton
                    },
                    botonCambiarTitular: function (instanciaUID) {
                        const boton = document.createElement("div")
                        boton.classList.add("botonV1BlancoIzquierda")
                        boton.innerHTML = "Cambiar titular"
                        boton.setAttribute("boton", "cambiarTitular")
                        boton.addEventListener("click", () => {
                            this.cambiarTitular(instanciaUID)
                        })
                        return boton
                    },
                    botonIrALaFichaDelClinete: function (clienteUID) {
                        const boton = document.createElement("a")
                        boton.classList.add("botonV1BlancoIzquierda")
                        boton.innerHTML = "Ir a la ficha del cliente"
                        boton.setAttribute("href", "/administracion/clientes/cliente:" + clienteUID)
                        boton.setAttribute("vista", "/administracion/clientes/cliente:" + clienteUID)
                        boton.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                        return boton
                    },
                    titulo: function (titulo) {
                        const tituloUI = document.createElement("p")
                        tituloUI.classList.add(
                            "tituloGris",
                            "padding18",
                        )
                        tituloUI.textContent = titulo
                        return tituloUI
                    },
                    infoUI: function (info) {
                        const infoUI = document.createElement("p")
                        infoUI.classList.add(
                            "padding18"
                        )
                        infoUI.textContent = info
                        return infoUI
                    },
                    botonCerrarFormularioExpandidoCambiarTitular: function (instanciaUID) {
                        const boton = document.createElement("div")
                        boton.classList.add("botonV1BlancoIzquierda")
                        boton.innerHTML = "Cerrar formulario expandido para cambiar de titular"
                        boton.setAttribute("boton", "cerrarCambiarTitular")
                        boton.addEventListener("click", () => {
                            this.cancelarCambiarTitular(instanciaUID)
                        })
                        return boton
                    },
                    cambiarTitular: function (instanciaUID) {
                        const selectorBotonCambiarTitular = document.querySelector(`[instanciaUID="${instanciaUID}"] [boton=cambiarTitular]`)
                        const selectorBotonDesasociar = document.querySelector(`[instanciaUID="${instanciaUID}"] [boton=desasociarTitular]`)
                        selectorBotonCambiarTitular.style.display = "none"
                        selectorBotonDesasociar.style.display = "none"
                        const selectorNuevoClienteUI = document.querySelector(`[instanciaUID="${instanciaUID}"] [formulario=nuevoCliente]`)
                        selectorNuevoClienteUI.removeAttribute("style")
                        const selectorBuscadorRapidoClienteUI = document.querySelector(`[instanciaUID="${instanciaUID}"] [contenedor=buscador]`)
                        selectorBuscadorRapidoClienteUI.removeAttribute("style")
                        const selectorbotonCerrarCambiarTitular = document.querySelector(`[instanciaUID="${instanciaUID}"] [boton=cerrarCambiarTitular]`)
                        selectorbotonCerrarCambiarTitular.removeAttribute("style")
                    },
                    cancelarCambiarTitular: function (instanciaUID) {
                        const selectorBotonCambiarTitular = document.querySelector(`[instanciaUID="${instanciaUID}"] [boton=cambiarTitular]`)
                        const selectorBotonDesasociar = document.querySelector(`[instanciaUID="${instanciaUID}"] [boton=desasociarTitular]`)
                        selectorBotonCambiarTitular.removeAttribute("style")
                        selectorBotonDesasociar.removeAttribute("style")
                        const selectorNuevoClienteUI = document.querySelector(`[instanciaUID="${instanciaUID}"] [formulario=nuevoCliente]`)
                        selectorNuevoClienteUI.style.display = "none"
                        const selectorBuscadorRapidoClienteUI = document.querySelector(`[instanciaUID="${instanciaUID}"] [contenedor=buscador]`)
                        selectorBuscadorRapidoClienteUI.style.display = "none"
                        const selectorbotonCerrarCambiarTitular = document.querySelector(`[instanciaUID="${instanciaUID}"] [boton=cerrarCambiarTitular]`)
                        selectorbotonCerrarCambiarTitular.style.display = "none"
                    },
                }
            },
            estado: {
                aceptarReserva: async function (data) {
                    const reservaUID = data.reservaUID
                    const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                    const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                    const instanciaUID_aceptarReserva = pantallaInmersiva.getAttribute("instanciaUID")
                    const titulo = constructor.querySelector("[componente=titulo]")
                    titulo.textContent = `Confirmas que aceptas la reserva ${reservaUID}`
                    const mensaje = constructor.querySelector("[componente=mensajeUI]")
                    mensaje.textContent = "AAl confirmar una reserva pendiente, cambiarás el estado de pendiente.Ha confirmado.La reserva dejará de ser visible desde la sección de reservas confirmadas.Si necesitas volver a poner la reserva en estado pendiente, pulsa en el estado de la reserva para poder cambiarla."
                    const botonAceptar = constructor.querySelector("[boton=aceptar]")
                    botonAceptar.textContent = "Comfirmar y aceptar reserva"
                    botonAceptar.addEventListener("click", () => {
                        this.confirmarNuevoEstado({
                            reservaUID,
                            instanciaUID_aceptarReserva,
                            nuevoEstado: "confirmada"
                        })
                    })
                    const botonCancelar = constructor.querySelector("[boton=cancelar]")
                    botonCancelar.textContent = "Cancelar y volver"
                    document.querySelector("main").appendChild(pantallaInmersiva)
                },
                rechazarReserva: async function (data) {
                    const reservaUID = data.reservaUID
                    const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                    const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                    const instanciaUID_aceptarReserva = pantallaInmersiva.getAttribute("instanciaUID")
                    const titulo = constructor.querySelector("[componente=titulo]")
                    titulo.textContent = `Confirmas que rechazas la reserva ${reservaUID}`
                    const mensaje = constructor.querySelector("[componente=mensajeUI]")
                    mensaje.textContent = "Rechazar una reserva implica cancelar la reserva."
                    const botonRechazar = constructor.querySelector("[boton=aceptar]")
                    botonRechazar.textContent = "Rechazar reserva"
                    botonRechazar.addEventListener("click", (e) => {
                        casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.cancelarReserva.confirmaCancelacion({
                            tipoBloqueoIDV: "sinBloqueo"
                        })
                    })
                    const botonCancelar = constructor.querySelector("[boton=cancelar]")
                    botonCancelar.textContent = "Cerrar y volver"
                    document.querySelector("main").appendChild(pantallaInmersiva)
                },
                ponerReservaEnPendiente: async function (data) {
                    const reservaUID = data.reservaUID
                    const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                    const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                    const instanciaUID_aceptarReserva = pantallaInmersiva.getAttribute("instanciaUID")
                    const titulo = constructor.querySelector("[componente=titulo]")
                    titulo.textContent = `Confirmas que aceptas la reserva ${reservaUID}`
                    const mensaje = constructor.querySelector("[componente=mensajeUI]")
                    mensaje.textContent = "Al confirmar una reserva pendiente, cambiarás el estado de pendiente.Ha confirmado.La reserva dejará de ser visible desde la sección de reservas confirmadas.Si necesitas volver a poner la reserva en estado pendiente, pulsa en el estado de la reserva para poder cambiarla"
                    const botonAceptar = constructor.querySelector("[boton=aceptar]")
                    botonAceptar.textContent = "Comfirmar y aceptar reserva"
                    botonAceptar.addEventListener("click", () => {
                        this.confirmarNuevoEstado({
                            reservaUID,
                            instanciaUID_aceptarReserva,
                            nuevoEstado: "pendiente"
                        })
                    })
                    const botonCancelar = constructor.querySelector("[boton=cancelar]")
                    botonCancelar.textContent = "Cancelar y volver"
                    document.querySelector("main").appendChild(pantallaInmersiva)
                },
                confirmarNuevoEstado: async function (data) {
                    const reservaUID = data.reservaUID
                    const nuevoEstado = data.nuevoEstado
                    const instanciaUID_aceptarReserva = data.instanciaUID_aceptarReserva
                    const ui = document.querySelector(`[instanciaUID="${instanciaUID_aceptarReserva}"]`)
                    const contenedor = ui.querySelector("[componente=constructor]")
                    contenedor.innerHTML = null
                    const spinner = casaVitini.ui.componentes.spinner({
                        mensaje: "Aceptando reserva un momento por favor..."
                    })
                    contenedor.appendChild(spinner)
                    const transaccion = {
                        zona: "administracion/reservas/detallesReserva/global/actualizarEstadoReserva",
                        reservaUID: String(reservaUID),
                        nuevoEstado
                    }
                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    const uiRenderizada = document.querySelector(`[reservaUID="${reservaUID}"]`)
                    if (!uiRenderizada) { return }
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas();
                    if (respuestaServidor?.error) {
                        return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                    }
                    if (respuestaServidor?.ok) {
                        const estadoUI = uiRenderizada.querySelector("[dataReserva=estado]")
                        const contenedorPendienteUI = uiRenderizada.querySelector("[contenedor=pendiente]")
                        const estadoActual = respuestaServidor.estadoActual
                        if (estadoActual === "pendiente") {
                            estadoUI.textContent = "Pendiente"
                            estadoUI.setAttribute("estadoReservaIDV", "pendiente")
                            contenedorPendienteUI.style.display = "grid"
                        }
                        if (estadoActual === "confirmada") {
                            estadoUI.textContent = "Confirmada"
                            estadoUI.setAttribute("estadoReservaIDV", "confirmada")
                            contenedorPendienteUI.style.display = "none"
                        }
                    }
                },
                panelExpandidoUI: async function (reservaUID) {
                    const estadoActual = document.querySelector("[contenedor=panelGlobal] [contenedor=estadoReserva] [estadoReservaIDV]").getAttribute("estadoReservaIDV")
                    const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                    pantallaInmersiva.style.justifyContent = "center"
                    const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                    const instanciaUID_aceptarReserva = pantallaInmersiva.getAttribute("instanciaUID")
                    const titulo = constructor.querySelector("[componente=titulo]")
                    titulo.textContent = `Estado de la reserva ${reservaUID}`
                    const mensaje = constructor.querySelector("[componente=mensajeUI]")
                    if (estadoActual === "confirmada") {
                        mensaje.textContent = "El estado actual de la reserva es confirmado.Si se necesita, puedes cambiar el estado de esta reserva a pendiente.Esto permitirá insertar la reserva en reservas pendientes de revisión"
                        const botonAceptar = constructor.querySelector("[boton=aceptar]")
                        botonAceptar.textContent = "Pasar el estado de esta reserva a pendiente de revisión"
                        botonAceptar.addEventListener("click", () => {
                            this.confirmarNuevoEstado({
                                reservaUID,
                                instanciaUID_aceptarReserva,
                                nuevoEstado: "pendiente"
                            })
                        })
                    } else
                        if (estadoActual === "pendiente") {
                            mensaje.textContent = "El estado de esta reserva es pendiente, en este estado es recomendable revisar la reserva para tomar la decisión de aceptarla o rechazarla.Es recomendable revisar las reservas pendientes y aceptar o rechazarlas para mantener la lista de reservas pendientes sin saturar."
                            const botonAceptar = constructor.querySelector("[boton=aceptar]")
                            botonAceptar.textContent = "Aceptar reserva"
                            botonAceptar.addEventListener("click", () => {
                                this.confirmarNuevoEstado({
                                    reservaUID,
                                    instanciaUID_aceptarReserva,
                                    nuevoEstado: "confirmada"
                                })
                            })
                        } else if (estadoActual === "cancelada") {
                            titulo.textContent = `La reserva ${reservaUID} esta cancelada`
                            mensaje.textContent = "Esta reserva está cancelada.Las reservas canceladas no pueden revertir su estado.Puede eliminar definitivamente la reserva de la base de datos para que no esté almacenada desde el apartado de cancelar reserva dentro de la reserva."
                            const botonAceptar = constructor.querySelector("[boton=aceptar]")
                            botonAceptar.remove()
                        }
                    const botonCancelar = constructor.querySelector("[boton=cancelar]")
                    botonCancelar.textContent = "Cancelar y volver"
                    document.querySelector("main").appendChild(pantallaInmersiva)
                }
            },
            actualizarReservaRenderizada: async function () {
                const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                const instanciaUID = document.querySelector("main").getAttribute("instanciaUID")
                const selectorEstadoPago = document.querySelector("[dataReserva=estadoPago]")
                const selectorTotalConImpuestos = document.querySelector("[dataReserva=totalReservaConImpuestos]")
                selectorEstadoPago.textContent = "Obteniendo..."
                selectorTotalConImpuestos.textContent = "Recalculando..."
                const instanciaUID_paraSelectores = casaVitini.utilidades.codigoFechaInstancia()
                selectorTotalConImpuestos.setAttribute("instanciaUID", instanciaUID_paraSelectores)
                const transaccion = {
                    zona: "administracion/reservas/detallesReserva/global/obtenerReserva",
                    reservaUID: String(reservaUID),
                    capas: [
                        "titular",
                        "desgloseFinanciero"
                    ]
                }
                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                const selectorUIRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_paraSelectores}"]`)
                if (!selectorUIRenderizada) {
                    return
                }
                if (respuestaServidor?.error) {
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    const porcentajeTranscurrido = respuestaServidor.ok.global.porcentajeTranscurrido
                    const estadoPago = respuestaServidor.ok.global.estadoPagoIDV
                    const estadoPagoUI = {
                        pagado: "Pagado",
                        noPagado: "No pagado",
                        pagadoSuperadamente: "Pagado superadamente",
                        pagadoParcialmente: "Pagado parcialmente"
                    }
                    const totalConImpuestos = respuestaServidor.ok.contenedorFinanciero.desgloseFinanciero?.global?.totales?.totalFinal ?
                        respuestaServidor.ok.contenedorFinanciero.desgloseFinanciero?.global?.totales?.totalFinal + "$" :
                        "Sin información"
                    selectorEstadoPago.textContent = estadoPagoUI[estadoPago]
                    selectorTotalConImpuestos.textContent = totalConImpuestos
                    const section = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                    const selectorListaDePagosRenderizada = section.querySelector("[contenedorID=transacciones]")
                    const selectorDesgloseFinancieroUIRenderizado = section.querySelector("[componente=contenedorDesgloseTotal]")
                    const selectorProgreso = section.querySelector("[componente=progreso]")
                    selectorProgreso.style.width = porcentajeTranscurrido + "%"
                    if (selectorListaDePagosRenderizada) {
                        casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.actualizarDatosGlobalesPago({
                            reservaUID
                        })
                    }
                    if (selectorDesgloseFinancieroUIRenderizado) {
                        casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.desgloseTotal.controladores.desplegarContenedorFinanciero({
                            reservaUID
                        })
                    }
                }
            },
            rechazarReserva: {
                UI: function (metadatos) {
                    const reservaUID = metadatos.reservaUID
                    const origen = metadatos.origen
                    const e = metadatos.e
                    const uiRenderizada = e.target.closest("[componente=advertenciaInmersiva]")
                    const contenedor = uiRenderizada.querySelector("[componente=constructor]")
                    contenedor.innerHTML = null
                    const instanciaUID_listaReservasPendientes = metadatos.instanciaUID_listaReservasPendientes
                    uiRenderizada.style.transition = "background 500ms"
                    uiRenderizada.style.background = "rgba(0, 0, 0, 0.3)"
                    const instanciaUID_opcionesReserva = uiRenderizada.getAttribute("instanciaUID")
                    const contenedorCancelacion = document.createElement("div")
                    contenedorCancelacion.classList.add("administracion_reservas_detallesReservas_cancelarReserva_contenedorCancelacion")
                    const tituloCancelarReserva = document.createElement("p")
                    tituloCancelarReserva.classList.add("tituloGris")
                    tituloCancelarReserva.textContent = "Rechazar y eliminar la reserva " + reservaUID
                    tituloCancelarReserva.style.color = "red"
                    contenedorCancelacion.appendChild(tituloCancelarReserva)
                    const botonCancelarProcesoCancelacion = document.createElement("div")
                    botonCancelarProcesoCancelacion.classList.add("detallesReservaCancelarBoton")
                    botonCancelarProcesoCancelacion.textContent = "Cerrar y volver atras"
                    botonCancelarProcesoCancelacion.addEventListener("click", casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas)
                    contenedorCancelacion.appendChild(botonCancelarProcesoCancelacion)
                    const bloqueBloqueoApartamentos = document.createElement("div")
                    bloqueBloqueoApartamentos.classList.add(
                        "flexVertical",
                        "gap6"
                    )
                    const tituloBloquoApartamentos = document.createElement("div")
                    tituloBloquoApartamentos.classList.add(
                        "padding10"
                    )
                    tituloBloquoApartamentos.textContent = "Rechazar la reserva elimina la reserva del sistema y libera los apartamentos, haciéndolos de nuevo disponibles para reservas.Para rechazar la reserva y eliminarla irreversiblemente junto con toda su información relacionada, debe escribir su contraseña de usuario y su cuenta debe tener autorización administrativa."
                    bloqueBloqueoApartamentos.appendChild(tituloBloquoApartamentos)
                    const campo = document.createElement("input")
                    campo.classList.add("administracion_reserva_detallesReserva_cancelarReserva_eliminarReserva_campo")
                    campo.setAttribute("campo", "clave")
                    campo.type = "password"
                    campo.placeholder = "Escriba la contraseña de su VitiniID"
                    bloqueBloqueoApartamentos.appendChild(campo)
                    contenedorCancelacion.appendChild(bloqueBloqueoApartamentos)
                    const bloqueBotones = document.createElement("div")
                    bloqueBotones.classList.add("detallesReservaCancelarReservabloqueBotones")
                    const botonCancelar = document.createElement("div")
                    botonCancelar.classList.add("administracion_reserva_detallesReserva_cancelarReserva_eliminarReserva_botonV1")
                    botonCancelar.setAttribute("componente", "botonConfirmarCancelarReserva")
                    botonCancelar.textContent = "Eliminar la reserva irreversiblemente."
                    botonCancelar.addEventListener("click", () => {
                        casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.cancelarReserva.eliminarReservaIrreversiblemente.confirmar({
                            reservaUID,
                            instanciaUID: instanciaUID_opcionesReserva,
                            origen
                        })
                    })
                    bloqueBloqueoApartamentos.appendChild(botonCancelar)
                    contenedorCancelacion.appendChild(bloqueBotones)
                    contenedor.appendChild(contenedorCancelacion)
                },
            },
        },
        categoriasGlobales: {
            alojamiento: {
                arranque: async function () {
                    const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                    const reservaUI = document.querySelector("[reservaUID]")
                    const reservaUID = reservaUI.getAttribute("reservaUID")
                    const configuracionVista = reservaUI.getAttribute("configuracionVista")
                    const contenedorDinamico = document.querySelector("[componente=contenedorDinamico]")
                    const marcoAlojamiento = document.createElement("div");
                    marcoAlojamiento.setAttribute("class", "reservaDetallesBloqueAlojamineto");
                    marcoAlojamiento.setAttribute("componente", "marcoAlojamiento");
                    marcoAlojamiento.setAttribute("instanciaUID", instanciaUID)
                    const mensajeSpinner = "Esperando a Casa Vitini..."
                    const spinnerPorRenderizar = casaVitini.ui.componentes.spinnerSimple(mensajeSpinner)
                    marcoAlojamiento.appendChild(spinnerPorRenderizar)
                    contenedorDinamico.appendChild(marcoAlojamiento)
                    const transaccion = {
                        reservaUID
                    }
                    if (configuracionVista === "publica") {
                        transaccion.zona = "miCasa/misReservas/detallesReserva"
                    } else {
                        transaccion.zona = "administracion/reservas/detallesReserva/global/obtenerReserva"
                        transaccion.capas = [
                            "alojamiento",
                            "pernoctantes",
                        ]
                    }
                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    const instanciaDestino = document.querySelector(`[componente=marcoAlojamiento][instanciaUID="${instanciaUID}"]`)
                    if (!instanciaDestino) { return }
                    instanciaDestino.innerHTML = null
                    if (respuestaServidor?.error) {
                        const errorUI = document.createElement("p")
                        errorUI.classList.add("errorCategorialGlobal")
                        errorUI.textContent = respuestaServidor?.error
                        instanciaDestino.appendChild(errorUI)
                    }
                    if (respuestaServidor?.ok) {
                        const detallesReserva = respuestaServidor.ok
                        const alojamiento = detallesReserva.alojamiento
                        const pernoctantes = detallesReserva.pernoctantes
                        const divPernoctantesSinAlojamiento = document.createElement("div");
                        divPernoctantesSinAlojamiento.setAttribute("class", "resertaDetallesPernoctantesSinalojamiento elementoOcultoInicialmente");
                        divPernoctantesSinAlojamiento.setAttribute("componente", "espacioPernoctantesSinAlojamiento");
                        const tituloPernoctantesSinHabitacion = document.createElement("div")
                        tituloPernoctantesSinHabitacion.classList.add("flexVertical", "padding10", "textoCentrado")
                        tituloPernoctantesSinHabitacion.textContent = "Pernoctantes en esta reserva sin alojamiento ni habitación asignados"
                        divPernoctantesSinAlojamiento.appendChild(tituloPernoctantesSinHabitacion)
                        const contenedorPernoctantesSinHabitacion = document.createElement("div")
                        contenedorPernoctantesSinHabitacion.classList.add("administracion_reservas_detallesReserva_contenedorPernoctantesSinHabitacion")
                        contenedorPernoctantesSinHabitacion.setAttribute("componente", "contenedorPernoctantesSinHabitacion");
                        divPernoctantesSinAlojamiento.appendChild(contenedorPernoctantesSinHabitacion)
                        instanciaDestino.appendChild(divPernoctantesSinAlojamiento)
                        const contenedorAlojamientoUI = document.createElement("div")
                        contenedorAlojamientoUI.classList.add("administracionReservaDetallesBloqueContendioAlojamiento")
                        contenedorAlojamientoUI.setAttribute("componente", "contenedorIntermedioAlojamiento")
                        if (configuracionVista === "publica") {
                        } else {
                            instanciaDestino.appendChild(contenedorAlojamientoUI)
                        }
                        const botonAnadirApartamento = document.createElement("p");
                        botonAnadirApartamento.setAttribute("class", "administracion_reservas_DetallesReserva_botonCategoria");
                        botonAnadirApartamento.setAttribute("componenteBoton", "anadirApartamento");
                        botonAnadirApartamento.setAttribute("componente", "menuDesplegable");
                        botonAnadirApartamento.addEventListener("click", this.apartamentos.abrirMenuReservas)
                        botonAnadirApartamento.textContent = "Añadir apartamento";
                        contenedorAlojamientoUI.appendChild(botonAnadirApartamento)
                        const espacioAlojamiento = document.createElement("div")
                        espacioAlojamiento.classList.add("reservasDetallesBloqueAlojamiennto")
                        espacioAlojamiento.setAttribute("componente", "espacioAlojamiento")
                        instanciaDestino.appendChild(espacioAlojamiento)
                        for (const [apartamentoIDV, configuracionApartamento] of Object.entries(alojamiento)) {
                            const apartamentoUID = configuracionApartamento.apartamentoUID
                            const apartamentoUI = configuracionApartamento.apartamentoUI
                            const configuracionesHabitacion = configuracionApartamento.habitaciones
                            const apartamentoComponenteUI = this.apartamentos.apatamentoUI({
                                apartamentoIDV: apartamentoIDV,
                                apartamentoUID: apartamentoUID,
                                apartamentoUI: apartamentoUI
                            })
                            const apartamentoTituloComponenteUI = this.apartamentos.apartamentoTituloUI({
                                apartamentoIDV: apartamentoIDV,
                                apartamentoUID: apartamentoUID,
                                apartamentoUI: apartamentoUI
                            })
                            apartamentoComponenteUI.appendChild(apartamentoTituloComponenteUI)
                            delete configuracionApartamento.uid
                            for (const [habitacionIDV, configuracionHabitacion] of Object.entries(configuracionesHabitacion)) {
                                const habitacionUID = configuracionHabitacion.habitacionUID
                                const habitacionUI = configuracionHabitacion.habitacionUI
                                const camas = configuracionHabitacion.camas
                                const habitacionComponenteUI = this.habitaciones.habitacionUI({
                                    habitacionIDV: habitacionIDV,
                                    habitacionUID: habitacionUID,
                                    apartamentoIDV: apartamentoIDV,
                                    habitacionUI: habitacionUI,
                                })
                                const habitacionTituloComponenteUI = this.habitaciones.habitacionTituloUI({
                                    habitacionIDV: habitacionIDV,
                                    habitacionUID: habitacionUID,
                                    apartamentoIDV: apartamentoIDV,
                                    habitacionUI: habitacionUI,
                                })
                                habitacionComponenteUI.appendChild(habitacionTituloComponenteUI)
                                const camaComponenteUI = this.camas.contenedorCamasUI({
                                    habitacionIDV: habitacionIDV,
                                    habitacionUI: habitacionUI,
                                    apartamentoUI: apartamentoUI,
                                    apartamentoIDV: apartamentoIDV,
                                    habitacionUID: habitacionUID,
                                    camas: camas,
                                    reservaUID: reservaUID
                                })
                                habitacionComponenteUI.appendChild(camaComponenteUI)
                                apartamentoComponenteUI.appendChild(habitacionComponenteUI)
                            }
                            espacioAlojamiento.appendChild(apartamentoComponenteUI)
                        }
                        for (const detallesPernoctante of pernoctantes) {
                            const tipoPernoctante = detallesPernoctante.tipoPernoctante
                            const nombreCompleto = detallesPernoctante.nombreCompleto
                            const pasaporte = detallesPernoctante.pasaporte
                            const clienteUID = detallesPernoctante?.clienteUID
                            const habitacionUID = detallesPernoctante?.habitacionUID
                            const pernoctanteUID = detallesPernoctante.pernoctanteUID
                            const fechaCheckIn = detallesPernoctante.fechaCheckIn
                            const fechaCheckOutAdelantado = detallesPernoctante.fechaCheckOutAdelantado
                            const metadatos = {
                                tipoPernoctante,
                                clienteUID,
                                pernoctanteUID,
                                fechaCheckIn,
                                fechaCheckOutAdelantado,
                                nombreCompleto,
                                pasaporte
                            }
                            if (habitacionUID) {
                                metadatos.estadoAlojamiento = "alojado"
                            } else {
                                metadatos.estadoAlojamiento = "noAlojado"
                            }
                            const bloquePernoctantes = this.pernoctantes.pernoctanteUI(metadatos)
                            const nombrePernoctante = this.pernoctantes.pernoctanteNombreUI(metadatos)
                            bloquePernoctantes.appendChild(nombrePernoctante)
                            const identificacionPernoctante = this.pernoctantes.pernoctantePasaporteUI(metadatos)
                            bloquePernoctantes.appendChild(identificacionPernoctante)
                            if (habitacionUID) {
                                const selectorHabitacionUID = document.querySelector(`[habitacionUID="${habitacionUID}"]`)
                                selectorHabitacionUID.appendChild(bloquePernoctantes)
                            } else {
                                contenedorPernoctantesSinHabitacion.appendChild(bloquePernoctantes)
                                divPernoctantesSinAlojamiento.classList.remove("elementoOcultoInicialmente")
                            }
                        }
                        contenedorDinamico.appendChild(instanciaDestino)
                        this.componentesUI.controlEspacioAlojamiento()
                    }
                },
                componentesUI: {
                    controlEspacioAlojamiento: function () {
                        const selectorMarcoalojamiento = document.querySelector("[componente=marcoAlojamiento]")
                        const selectorApartamentos = document.querySelectorAll("[componente=marcoAlojamiento] [apartamentoIDV]")
                        if (selectorApartamentos.length > 0) {
                            document.querySelector("[componente=infoSinAlojamiento]")?.remove()
                        } else {
                            const infoNoAlojamiento = document.createElement("div")
                            infoNoAlojamiento.classList.add("reservas_detalles_infoDesgloseNo")
                            infoNoAlojamiento.setAttribute("componente", "infoSinAlojamiento")
                            infoNoAlojamiento.textContent = "Esta reserva no contiene ningún apartamento."
                            selectorMarcoalojamiento.appendChild(infoNoAlojamiento)
                        }
                    },
                    bannerReservaMenus: function () {
                        const main = document.querySelector("main")
                        const reservaUID = main.querySelector("[reservaUID]").getAttribute("reservaUID")
                        const banner = document.createElement("div")
                        banner.classList.add(
                            "flexVertical",
                        )
                        const titulo = document.createElement("p")
                        titulo.textContent = "Reserva"
                        banner.appendChild(titulo)
                        const reservaUID_UI = document.createElement("p")
                        reservaUID_UI.classList.add(
                            "negrita"
                        )
                        reservaUID_UI.textContent = reservaUID
                        banner.appendChild(reservaUID_UI)
                        return banner
                    },
                    bannerAlojamiento: function (data) {
                        const apartamentoUI = data.apartamentoUI
                        const apartamentoIDV = data.apartamentoIDV
                        const banner = document.createElement("div")
                        banner.classList.add(
                            "flexVertical",
                        )
                        const titulo = document.createElement("p")
                        titulo.textContent = "Alojamiento"
                        banner.appendChild(titulo)
                        const alojamientoUI = document.createElement("p")
                        alojamientoUI.classList.add(
                            "negrita"
                        )
                        if (apartamentoIDV) {
                            alojamientoUI.textContent = `${apartamentoUI} (${apartamentoIDV})`
                        } else {
                            alojamientoUI.textContent = `${apartamentoUI}`
                            alojamientoUI.style.color = "red"
                        }
                        banner.appendChild(alojamientoUI)
                        return banner
                    },
                    bannerHabitacion: function (data) {
                        const habitacionUI = data.habitacionUI
                        const habitacionIDV = data.habitacionIDV
                        const banner = document.createElement("div")
                        banner.classList.add(
                            "flexVertical",
                        )
                        const titulo = document.createElement("p")
                        titulo.textContent = "Habitación del alojamiento"
                        banner.appendChild(titulo)
                        const habitacionUI_UI = document.createElement("p")
                        habitacionUI_UI.classList.add(
                            "negrita"
                        )
                        if (habitacionIDV) {
                            habitacionUI_UI.textContent = `${habitacionUI} (${habitacionIDV})`
                        } else {
                            habitacionUI_UI.textContent = `${habitacionUI}`
                            habitacionUI_UI.style.color = "red"
                        }
                        banner.appendChild(habitacionUI_UI)
                        return banner
                    }
                },
                habitaciones: {
                    habitacionUI: function (metadatos) {
                        const habitacionUI = document.createElement("div")
                        habitacionUI.classList.add("administracionReservasDetallesBloqueHabitacion")
                        habitacionUI.setAttribute("habitacionIDV", metadatos.habitacionIDV)
                        habitacionUI.setAttribute("habitacionUID", metadatos.habitacionUID)
                        return habitacionUI
                    },
                    habitacionTituloUI: function (metadatos) {
                        const habitacionUI = metadatos.habitacionUI
                        const habitacionIDV = metadatos.habitacionIDV
                        const habitacionTituloUI = document.createElement("div")
                        habitacionTituloUI.setAttribute("componente", "menuDesplegable")
                        habitacionTituloUI.setAttribute("habitacionUI", habitacionUI)
                        const reservaUI = document.querySelector("[reservaUID]")
                        const configuracionVista = reservaUI.getAttribute("configuracionVista")
                        if (configuracionVista === "publica") {
                            habitacionTituloUI.classList.add("tituloHabitacion_noSel")
                        } else {
                            habitacionTituloUI.classList.add("tituloHabitacion")
                            habitacionTituloUI.addEventListener("click", (e) => {
                                const habitacionUID = e.target.closest("[habitacionUID]").getAttribute("habitacionUID")
                                const apartamentoUI = e.target.closest("[apartamentoUI]").getAttribute("apartamentoUI")
                                const apartamentoIDV = e.target.closest("[apartamentoIDV]").getAttribute("apartamentoIDV")
                                this.opcionesHabitacion({
                                    habitacionUID,
                                    habitacionUI,
                                    apartamentoUI,
                                    habitacionIDV,
                                    apartamentoIDV
                                })
                            })
                        }
                        habitacionTituloUI.textContent = metadatos.habitacionUI
                        return habitacionTituloUI
                    },
                    selectorCambioHabitacionUI: function (pernoctanteUID) {
                        const selectorCambioHabitacionUI = document.createElement("div")
                        selectorCambioHabitacionUI.classList.add("reservaDetallesCambioPernoctante")
                        selectorCambioHabitacionUI.classList.add("parpadea")
                        selectorCambioHabitacionUI.setAttribute("componente", "botonMoverCliente")
                        selectorCambioHabitacionUI.textContent = "Cambiar aquí al pernoctante seleccionado"
                        selectorCambioHabitacionUI.addEventListener("click", (e) => {
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.cambiarDeHabitacion.cambiarPernoctanteHabitacion(pernoctanteUID, e)
                        })
                        return selectorCambioHabitacionUI
                        casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales
                    },
                    propuestaEliminarHabitacionUI: function (datosEliminacion) {
                        const opcionPernoctantes = datosEliminacion.opcionesPernoctantes
                        const habitacionUID = datosEliminacion.habitacionUID
                        const habitacionUI = document
                            .querySelector(`[habitacionUID="${habitacionUID}"]`)
                            .querySelector("[habitacionUI]")
                            .getAttribute("habitacionUI")
                        let mensajeUI
                        if (opcionPernoctantes === "conservar") {
                            mensajeUI = `¿Confirmas eliminar la ${habitacionUI} del apartamento pero conservar los pernoctantes de esta habitación en la reserva, en la zona de pernoctantes en la reserva sin alojamiento?`
                        }
                        if (opcionPernoctantes === "eliminar") {
                            mensajeUI = `¿Confirmas eliminar la ${habitacionUI} del apartamento junto con los pernoctantes que contiene de la reserva?`
                        }
                        let botonMenajeUI
                        if (opcionPernoctantes === "eliminar") {
                            botonMenajeUI = `Eliminar la ${habitacionUI} del apartamento y los pernoctantes que contiene de la reserva`
                        }
                        if (opcionPernoctantes === "conservar") {
                            botonMenajeUI = `Eliminar la ${habitacionUI} del apartamento pero conservar a sus pernoctantes en la reserva`
                        }
                        const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                        pantallaInmersiva.style.justifyContent = "center"
                        const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                        const titulo = constructor.querySelector("[componente=titulo]")
                        titulo.textContent = "Confirmar la eliminación"
                        const mensaje = constructor.querySelector("[componente=mensajeUI]")
                        mensaje.textContent = mensajeUI
                        const contenedorEspacio = constructor.querySelector("[componente=contenedor]")
                        const botonAceptar = constructor.querySelector("[boton=aceptar]")
                        botonAceptar.textContent = botonMenajeUI
                        botonAceptar.addEventListener("click", () => {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            const datosEliminacion = {
                                habitacionUID: habitacionUID,
                                opcionPernoctantes: opcionPernoctantes,
                            }
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.habitaciones.eliminarHabitacion(datosEliminacion)
                        })
                        const botonCancelar = constructor.querySelector("[boton=cancelar]")
                        botonCancelar.textContent = "Cancelar la eliminación"
                        document.querySelector("main").appendChild(pantallaInmersiva)
                    },
                    opcionesHabitacion: async function (data) {
                        const main = document.querySelector("main")
                        const habitacionUID = data.habitacionUID
                        const habitacionUI = data.habitacionUI
                        const apartamentoUI = data.apartamentoUI
                        const apartamentoIDV = data.apartamentoIDV
                        const habitacionIDV = data.habitacionIDV
                        const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                        main.appendChild(ui)
                        const contenedor = ui.querySelector("[componente=contenedor]")
                        const titulo = document.createElement("div")
                        titulo.classList.add(
                            "tituloGris",
                            "padding14"
                        )
                        titulo.textContent = `Opciones de la ${habitacionUI} en ${apartamentoUI}`
                        contenedor.appendChild(titulo)
                        const banner = document.createElement("div")
                        banner.classList.add(
                            "flexVertical",
                            "borderRadius12",
                            "backgroundGrey1",
                            "padding14",
                            "gap6"
                        )
                        contenedor.appendChild(banner)
                        const bannerReserva = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.
                            alojamiento.
                            componentesUI.
                            bannerReservaMenus()
                        banner.appendChild(bannerReserva)
                        const bannerAlojamiento = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.
                            alojamiento.
                            componentesUI.
                            bannerAlojamiento({
                                apartamentoUI: apartamentoUI,
                                apartamentoIDV: apartamentoIDV
                            })
                        banner.appendChild(bannerAlojamiento)
                        const bannerHabitacion = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.
                            alojamiento.
                            componentesUI.
                            bannerHabitacion({
                                habitacionUI: habitacionUI,
                                habitacionIDV: habitacionIDV
                            })
                        banner.appendChild(bannerHabitacion)
                        const opcionAddPernoctante = document.createElement("p")
                        opcionAddPernoctante.classList.add("botonV1BlancoIzquierda")
                        opcionAddPernoctante.textContent = `Añadir pernoctante en la ${habitacionUI}`
                        opcionAddPernoctante.addEventListener("click", () => {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.gestionPernoctante.formularioNuevoPernoctanteEnHabitacionUI({
                                habitacionUID,
                                habitacionUI,
                                apartamentoUI,
                                habitacionIDV,
                                apartamentoIDV
                            })
                        })
                        contenedor.appendChild(opcionAddPernoctante)
                        const infoElimiacion = document.createElement("p")
                        infoElimiacion.classList.add(
                            "padding12"
                        )
                        infoElimiacion.textContent = "Opciones de eliminación de la habitación"
                        contenedor.append(infoElimiacion)
                        const opcionEliminarHabSinPernoc = document.createElement("p")
                        opcionEliminarHabSinPernoc.classList.add("botonV1BlancoIzquierda")
                        opcionEliminarHabSinPernoc.textContent = `Eliminar la ${habitacionUI} pero mantener los pernoctantes que contiene asignados a esta reserva`
                        opcionEliminarHabSinPernoc.addEventListener("click", () => {
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.habitaciones.propuestaEliminarHabitacionUI({
                                opcionesPernoctantes: "conservar",
                                habitacionUID: habitacionUID
                            })
                        })
                        contenedor.appendChild(opcionEliminarHabSinPernoc)
                        const eliminarHabYPernoc = document.createElement("p")
                        eliminarHabYPernoc.classList.add("botonV1BlancoIzquierda")
                        eliminarHabYPernoc.textContent = `Eliminar la ${habitacionUI} y tambien los pernoctantes que contiene de la reserva`
                        eliminarHabYPernoc.addEventListener("click", () => {
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.habitaciones.propuestaEliminarHabitacionUI({
                                opcionesPernoctantes: "eliminar",
                                habitacionUID: habitacionUID
                            })
                        })
                        contenedor.appendChild(eliminarHabYPernoc)
                        const botonCancelar = document.createElement("div")
                        botonCancelar.classList.add("botonV1")
                        botonCancelar.setAttribute("boton", "cancelar")
                        botonCancelar.textContent = "Cerrar y volver a la reserva"
                        botonCancelar.addEventListener("click", () => {
                            return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        })
                        contenedor.appendChild(botonCancelar)
                    },
                    eliminarHabitacion: async function (datosElimiacion) {
                        const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                        const habitacionUID = datosElimiacion.habitacionUID
                        const opcionPernoctantes = datosElimiacion.opcionPernoctantes
                        const instanciaUIDPantallaDeCarga = casaVitini.utilidades.codigoFechaInstancia()
                        const opcionesPantallaDeCarga = {
                            instanciaUID: instanciaUIDPantallaDeCarga,
                            mensaje: "Eliminando habitación..."
                        }
                        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(opcionesPantallaDeCarga)
                        const pantallaDeCargaRenderizada = document
                            .querySelector(`[pantallaSuperpuesta=pantallaCargaSuperpuesta][instanciaUID="${instanciaUIDPantallaDeCarga}"]`)
                        const transaccion = {
                            zona: "administracion/reservas/detallesReserva/alojamiento/eliminarHabitacionReserva",
                            reservaUID: String(reservaUID),
                            habitacionUID: String(habitacionUID),
                            pernoctantes: opcionPernoctantes
                        }
                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        pantallaDeCargaRenderizada?.remove()
                        if (respuestaServidor?.error) {
                            if (!pantallaDeCargaRenderizada) {
                            }
                            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                        }
                        if (respuestaServidor?.ok) {
                            if (opcionPernoctantes === "eliminar") {
                                document.querySelector(`[habitacionUID="${habitacionUID}"]`)?.remove()
                            }
                            if (opcionPernoctantes === "conservar") {
                                const selectorPernoctantesHabitacion = document
                                    .querySelectorAll(`[habitacionUID="${habitacionUID}"] [tipoCliente]`)
                                selectorPernoctantesHabitacion.forEach((pernoctanteSeleccionado) => {
                                    const nombreCompleto = pernoctanteSeleccionado.querySelector("[componente=nombreCompleto]").textContent
                                    const pasaporte = pernoctanteSeleccionado.querySelector("[componente=pasaporte]").textContent
                                    const tipoCliente = pernoctanteSeleccionado.getAttribute("tipoCliente")
                                    const pernoctanteUID = pernoctanteSeleccionado.getAttribute("pernoctanteUID")
                                    const clienteUID = pernoctanteSeleccionado.getAttribute("clienteUID")
                                    const fechaCheckIn = pernoctanteSeleccionado.getAttribute("fechaCheckIn")
                                    const fechaCheckOut = pernoctanteSeleccionado.getAttribute("fechaCheckOut")
                                    const datosPernoctante = {
                                        tipoPernoctante: tipoCliente,
                                        clienteUID: clienteUID,
                                        pernoctanteUID: pernoctanteUID,
                                        estadoAlojamiento: "noAlojado",
                                        fechaCheckIn: fechaCheckIn,
                                        fechaCheckOutAdelantado: fechaCheckOut
                                    }
                                    const bloquePernoctantes = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctanteUI(datosPernoctante)
                                    const datosNombre = {
                                        nombreCompleto: nombreCompleto,
                                    }
                                    const nombrePernoctante = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctanteNombreUI(datosNombre)
                                    bloquePernoctantes.appendChild(nombrePernoctante)
                                    const datosPasaporte = {
                                        pasaporte: pasaporte,
                                    }
                                    const identificacionPernoctante = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctantePasaporteUI(datosPasaporte)
                                    bloquePernoctantes.appendChild(identificacionPernoctante)
                                    if (document.querySelector("[reservaUID]").getAttribute("reservaUID") === reservaUID) {
                                        const zonaDestino = document.querySelector(`[componente=contenedorPernoctantesSinHabitacion]`)
                                        zonaDestino.appendChild(bloquePernoctantes)
                                    }
                                })
                                document.querySelector(`[habitacionUID="${habitacionUID}"]`)?.remove()
                            }
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.controlEspacioPernoctantesSinAlojamiento()
                        }
                    },
                },
                apartamentos: {
                    apatamentoUI: function (metadatos) {
                        const apartamento = document.createElement("div")
                        apartamento.classList.add("administracionReservasDetallesBloqueApartamento")
                        apartamento.setAttribute("apartamentoIDV", metadatos.apartamentoIDV)
                        apartamento.setAttribute("apartamentoUID", metadatos.apartamentoUID)
                        apartamento.setAttribute("apartamentoUI", metadatos.apartamentoUI)
                        return apartamento
                    },
                    apartamentoTituloUI: function (metadatos) {
                        const reservaUI = document.querySelector("[reservaUID]")
                        const configuracionVista = reservaUI.getAttribute("configuracionVista")
                        const apartamentoTitulo = document.createElement("div")
                        apartamentoTitulo.setAttribute("componente", "menuDesplegable")
                        apartamentoTitulo.textContent = metadatos.apartamentoUI
                        if (configuracionVista === "publica") {
                            apartamentoTitulo.classList.add("tituloApartamento_noSel")
                        } else {
                            apartamentoTitulo.classList.add("tituloApartamento")
                            apartamentoTitulo.addEventListener("click", this.opcionesApartamento)
                        }
                        return apartamentoTitulo
                    },
                    propuestaEliminarApartamentoUI: function (datosElimiacion) {
                        const apartamentoUID = datosElimiacion.apartamentoUID
                        const apartamentoUI = datosElimiacion.apartamentoUI
                        const tipoBloqueo = datosElimiacion.tipoBloqueo
                        let mensajeUI
                        if (tipoBloqueo === "sinBloqueo") {
                            mensajeUI = `¿Confirmas eliminar el ${apartamentoUI} y liberarlo para que esté disponible para reservar públicamente? Los pernoctantes de este apartamento no se eliminarán de la reserva`
                        }
                        if (tipoBloqueo === "permanente") {
                            mensajeUI = `¿Confirmas eliminar el ${apartamentoUI} y bloquearlo indefinidamente? (Hay que desbloquearlo manualmente) Los pernoctantes de este apartamento no se eliminarán de la reserva`
                        }
                        if (tipoBloqueo === "rangoTemporal") {
                            mensajeUI = `¿Confirmas eliminar el ${apartamentoUI} y bloquearlo durante el mismo rango de fechas que esta reserva? Los pernoctantes de este apartamento no se eliminarán de la reserva`
                        }
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
                        const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                        pantallaInmersiva.style.justifyContent = "center"
                        const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                        const titulo = constructor.querySelector("[componente=titulo]")
                        titulo.textContent = "Confirmar la eliminación"
                        const mensaje = constructor.querySelector("[componente=mensajeUI]")
                        mensaje.textContent = mensajeUI
                        const contenedorEspacio = constructor.querySelector("[componente=contenedor]")
                        const botonAceptar = constructor.querySelector("[boton=aceptar]")
                        botonAceptar.textContent = botonMenajeUI
                        botonAceptar.addEventListener("click", () => {
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.apartamentos.eliminarApartamento({
                                apartamentoUID: apartamentoUID,
                                tipoBloqueo: tipoBloqueo,
                            })
                        })
                        const botonCancelar = constructor.querySelector("[boton=cancelar]")
                        botonCancelar.textContent = "Cancelar la eliminación"
                        document.querySelector("main").appendChild(pantallaInmersiva)
                    },
                    abrirMenuReservas: async function () {
                        const main = document.querySelector("main")
                        const reservaUID = main.querySelector("[reservaUID]").getAttribute("reservaUID")
                        const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                        const instanciaUID = ui.getAttribute("instanciaUID")
                        const contenedor = ui.querySelector("[componente=contenedor]")
                        main.appendChild(ui)
                        const spinner = casaVitini.ui.componentes.spinnerSimple()
                        contenedor.appendChild(spinner)
                        const botonCerrar = document.createElement("div")
                        botonCerrar.classList.add(
                            "botonV1",
                            "comportamientoBoton"
                        )
                        botonCerrar.textContent = "Cerrar y volver"
                        botonCerrar.addEventListener("click", () => {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        })
                        contenedor.appendChild(botonCerrar)
                        const fechaEntrada = document.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
                        const fechaSalida = document.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")
                        const transaccion = {
                            zona: "administracion/reservas/detallesReserva/alojamiento/apartamentosDisponiblesParaAnadirAReserva",
                            reservaUID: String(reservaUID),
                        }
                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        contenedor.innerHTML = null
                        const botonCerrar1 = document.createElement("div")
                        botonCerrar1.classList.add(
                            "botonV1",
                            "comportamientoBoton"
                        )
                        botonCerrar1.textContent = "Cerrar y volver"
                        botonCerrar1.addEventListener("click", () => {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        })
                        contenedor.appendChild(botonCerrar1)
                        if (respuestaServidor?.error) {
                            casaVitini.shell.controladoresUI.ocultarMenusVolatiles()
                            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                        }
                        if (respuestaServidor?.ok) {
                            const apartamentosDisponibles = respuestaServidor?.ok.apartamentosDisponibles
                            const apartamentosNoDisponibles = respuestaServidor?.ok.apartamentosNoDisponibles
                            if (apartamentosDisponibles.length > 0) {
                                const bloqueApartamentos = document.createElement("div")
                                bloqueApartamentos.classList.add(
                                    "flexVertical",
                                    "gap10"
                                )
                                const tituloApartamentoComponenteUIs = document.createElement("div")
                                tituloApartamentoComponenteUIs.classList.add(
                                    "padding14",
                                    "negrita"
                                )
                                tituloApartamentoComponenteUIs.textContent = "Apartamentos disponibles"
                                bloqueApartamentos.appendChild(tituloApartamentoComponenteUIs)
                                for (const detallesApartamento of apartamentosDisponibles) {
                                    const apartamentoUI = document.createElement("div")
                                    apartamentoUI.classList.add("botonV1BlancoIzquierda")
                                    apartamentoUI.textContent = detallesApartamento.apartamentoUI
                                    apartamentoUI.addEventListener("click", (e) => {
                                        casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.apartamentos.anadirApartamento({
                                            instanciaUID_contenedorUI: instanciaUID,
                                            apartamentoIDV: detallesApartamento.apartamentoIDV
                                        })
                                    })
                                    bloqueApartamentos.appendChild(apartamentoUI)
                                }
                                contenedor.appendChild(bloqueApartamentos)
                            }
                            if (apartamentosNoDisponibles.length > 0) {
                                const bloqueApartamentos = document.createElement("div")
                                bloqueApartamentos.classList.add(
                                    "flexVertical",
                                    "gap10"
                                )
                                const tituloApartamentoComponenteUIs = document.createElement("div")
                                tituloApartamentoComponenteUIs.classList.add(
                                    "padding14",
                                    "negrita"
                                )
                                tituloApartamentoComponenteUIs.textContent = "Apartamentos no disponibles"
                                bloqueApartamentos.appendChild(tituloApartamentoComponenteUIs)
                                for (const detallesApartamento of apartamentosNoDisponibles) {
                                    const apartamentoUI = document.createElement("div")
                                    apartamentoUI.classList.add("botonV1BlancoIzquierda_noSeleccionable")
                                    apartamentoUI.textContent = detallesApartamento.apartamentoUI
                                    bloqueApartamentos.appendChild(apartamentoUI)
                                }
                                contenedor.appendChild(bloqueApartamentos)
                            }
                        }
                    },
                    opcionesApartamento: async function (apartamento) {
                        const main = document.querySelector("main")
                        const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                        const reservaUID = main.querySelector("[reservaUID]").getAttribute("reservaUID")
                        const instanciaUID = ui.getAttribute("instanciaUID")
                        main.appendChild(ui)
                        const contenedor = ui.querySelector("[componente=contenedor]")
                        const spinner = casaVitini.ui.componentes.spinner({
                            mensaje: "Obteniendo las opciones del apartamento..."
                        })
                        contenedor.appendChild(spinner)
                        const contenedorApartmeanto = apartamento.target.closest("[apartamentoIDV]")
                        const apartamentoIDV = contenedorApartmeanto.getAttribute("apartamentoIDV")
                        const apartamentoUID = contenedorApartmeanto.getAttribute("apartamentoUID")
                        const apartamentoUI = apartamento.target.textContent
                        const respuestaServidor = await casaVitini.shell.servidor({
                            zona: "administracion/reservas/detallesReserva/alojamiento/estadoHabitacionesApartamento",
                            reservaUID: reservaUID,
                            apartamentoUID: apartamentoUID
                        })
                        contenedor.innerHTML = null
                        const titulo = document.createElement("div")
                        titulo.classList.add(
                            "tituloGris",
                            "padding14"
                        )
                        titulo.textContent = `Opciones del ${apartamentoUI}`
                        contenedor.appendChild(titulo)
                        const banner = document.createElement("div")
                        banner.classList.add(
                            "flexVertical",
                            "borderRadius12",
                            "backgroundGrey1",
                            "padding14",
                            "gap6"
                        )
                        contenedor.appendChild(banner)
                        const bannerReserva = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.componentesUI.bannerReservaMenus()
                        banner.appendChild(bannerReserva)
                        const bannerAlojamiento = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.
                            alojamiento.
                            componentesUI.
                            bannerAlojamiento({
                                apartamentoUI: apartamentoUI,
                                apartamentoIDV: apartamentoIDV
                            })
                        banner.appendChild(bannerAlojamiento)
                        if (respuestaServidor?.error) {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.error)
                        }
                        const opcionesEliminacion = function (selector) {
                            if (selector === "sinBloqueo") {
                                const opcion = document.createElement("p")
                                opcion.classList.add("botonV1BlancoIzquierda")
                                opcion.setAttribute("componente", "menuVolatil")
                                opcion.textContent = `Eliminar ${apartamentoUI} y liberarlo para que este disponible para reservar`
                                opcion.addEventListener("click", () => {
                                    casaVitini.shell.controladoresUI.limpiarTodoElementoFlotante()
                                    casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.apartamentos.propuestaEliminarApartamentoUI({
                                        apartamentoUID: apartamentoUID,
                                        apartamentoUI: apartamentoUI,
                                        tipoBloqueo: "sinBloqueo"
                                    })
                                })
                                return opcion
                            }
                            if (selector === "bloqueoPermanente") {
                                const opcion = document.createElement("p")
                                opcion.classList.add("botonV1BlancoIzquierda")
                                opcion.textContent = `Eliminar ${apartamentoUI} bloquearlo permanentemente. (Deberá desbloquearlo manualmente el bloqueo permanente)`
                                opcion.setAttribute("componente", "menuVolatil")
                                opcion.addEventListener("click", () => {
                                    casaVitini.shell.controladoresUI.limpiarTodoElementoFlotante()
                                    const datosPropuestaElimiacion = {
                                        apartamentoUID: apartamentoUID,
                                        apartamentoUI: apartamentoUI,
                                        tipoBloqueo: "permanente"
                                    }
                                    casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.apartamentos.propuestaEliminarApartamentoUI(datosPropuestaElimiacion)
                                })
                                return opcion
                            }
                            if (selector === "bloqueoTemporal") {
                                const opcion = document.createElement("p")
                                opcion.classList.add("botonV1BlancoIzquierda")
                                opcion.setAttribute("componente", "menuVolatil")
                                opcion.textContent = `Eliminar ${apartamentoUI} y mantenerlo bloqueado en el rango de fechas de esta reserva`
                                opcion.addEventListener("click", () => {
                                    casaVitini.shell.controladoresUI.limpiarTodoElementoFlotante()
                                    const datosPropuestaElimiacion = {
                                        apartamentoUID: apartamentoUID,
                                        apartamentoUI: apartamentoUI,
                                        tipoBloqueo: "rangoTemporal"
                                    }
                                    casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.apartamentos.propuestaEliminarApartamentoUI(datosPropuestaElimiacion)
                                })
                                return opcion
                            }
                        }
                        if (respuestaServidor?.info) {
                            const opcionApartamento = document.createElement("p")
                            opcionApartamento.classList.add("opcionDeInformacion")
                            opcionApartamento.setAttribute("componente", "menuVolatil")
                            opcionApartamento.textContent = respuestaServidor?.info
                            contenedor.appendChild(opcionApartamento)
                            const opcionSinBloqueo = opcionesEliminacion("sinBloqueo")
                            contenedor.appendChild(opcionSinBloqueo)
                        }
                        if (respuestaServidor?.ok) {
                            const habitacionesApartamento = respuestaServidor?.ok
                            if (habitacionesApartamento.length === 0) {
                                const opcionApartamento = document.createElement("p")
                                opcionApartamento.classList.add(
                                    "padding14",
                                    "negrita"
                                )
                                opcionApartamento.textContent = `Este apartamento tiene ya todas las habitaciones implementadas en la reserva, según su configuración de alojamiento.`
                                contenedor.appendChild(opcionApartamento)
                            } else if (habitacionesApartamento.length > 0) {
                                const infoHabitaciones = document.createElement("p")
                                infoHabitaciones.classList.add(
                                    "padding14"
                                )
                                infoHabitaciones.textContent = `Lista de habitaciones disponibles`
                                contenedor.appendChild(infoHabitaciones)
                                habitacionesApartamento.forEach((habitacion) => {
                                    const opcionApartamento = document.createElement("p")
                                    opcionApartamento.classList.add("botonV1BlancoIzquierda")
                                    opcionApartamento.setAttribute("componente", "menuVolatil")
                                    opcionApartamento.textContent = `Anadir ${habitacion.habitacionUI}`
                                    opcionApartamento.addEventListener("click", async () => {
                                        const instanciaUID_pantallaDeCarga = casaVitini.utilidades.codigoFechaInstancia()
                                        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
                                            instanciaUID: instanciaUID_pantallaDeCarga,
                                            mensaje: "Obteniendo habitaciónes..."
                                        })
                                        const transaccion = {
                                            zona: "administracion/reservas/detallesReserva/alojamiento/anadirHabitacionAlApartamentoEnReserva",
                                            reservaUID: String(reservaUID),
                                            apartamentoUID: String(apartamentoUID),
                                            habitacionIDV: habitacion.habitacionIDV
                                        }
                                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                                        const pantallaDeCargaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_pantallaDeCarga}"]`)
                                        if (!pantallaDeCargaRenderizada) {
                                            return
                                        }
                                        pantallaDeCargaRenderizada?.remove()
                                        if (respuestaServidor?.error) {
                                            return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                                        }
                                        if (respuestaServidor?.ok) {
                                            const uiContenedor = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                                            if (!uiContenedor) {
                                                return
                                            }
                                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                            const bloqueHabitacionUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.habitaciones.habitacionUI({
                                                habitacionIDV: habitacion.habitacionIDV,
                                                habitacionUID: respuestaServidor?.nuevoUID,
                                                apartamentoIDV: apartamentoIDV
                                            })
                                            const nombreHabitacionUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.habitaciones.habitacionTituloUI({
                                                habitacionIDV: habitacion.habitacionIDV,
                                                habitacionUID: respuestaServidor?.nuevoUID,
                                                apartamentoIDV: apartamentoIDV,
                                                habitacionUI: habitacion.habitacionUI,
                                            })
                                            bloqueHabitacionUI.appendChild(nombreHabitacionUI)
                                            const camaComponenteUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.camas.contenedorCamasUI({
                                                habitacionIDV: habitacion.habitacionIDV,
                                                apartamentoIDV: apartamentoIDV,
                                                habitacionUID: respuestaServidor?.nuevoUID,
                                                habitacionUI: habitacion.habitacionUI,
                                                apartamentoUI: apartamentoUI,
                                                camas: {
                                                    compartida: {
                                                        camaUI: "Sin cama asignada"
                                                    },
                                                    fisicas: []
                                                },
                                                reservaUID: reservaUID
                                            })
                                            bloqueHabitacionUI.appendChild(camaComponenteUI)
                                            document.querySelector(`[apartamentoUID="${apartamentoUID}"]`).appendChild(bloqueHabitacionUI)
                                        }
                                    })
                                    contenedor.appendChild(opcionApartamento)
                                })
                            }
                            const infoEliminacion = document.createElement("p")
                            infoEliminacion.classList.add(
                                "padding14"
                            )
                            infoEliminacion.textContent = `Opciones de eliminación del ${apartamentoUI}`
                            contenedor.appendChild(infoEliminacion)
                            const opcionSinBloqueo = opcionesEliminacion("sinBloqueo")
                            contenedor.appendChild(opcionSinBloqueo)
                            const infoEliminacionConBloqueo = document.createElement("p")
                            infoEliminacionConBloqueo.classList.add(
                                "padding14"
                            )
                            infoEliminacionConBloqueo.textContent = `Eliminar el ${apartamentoUI} aplicando un bloqueo`
                            contenedor.appendChild(infoEliminacionConBloqueo)
                            const opcionbloqueoTemporal = opcionesEliminacion("bloqueoTemporal")
                            contenedor.appendChild(opcionbloqueoTemporal)
                            const opcionbloqueoPermanente = opcionesEliminacion("bloqueoPermanente")
                            contenedor.appendChild(opcionbloqueoPermanente)
                        }
                        const botonCancelar = document.createElement("div")
                        botonCancelar.classList.add("botonV1")
                        botonCancelar.setAttribute("boton", "cancelar")
                        botonCancelar.textContent = "Cerrar y volver a la reserva"
                        botonCancelar.addEventListener("click", () => {
                            return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        })
                        contenedor.appendChild(botonCancelar)
                    },
                    anadirApartamento: async function (data) {
                        const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                        const apartamentoIDV = data.apartamentoIDV
                        const instanciaUI_conteneodrUI = data.instanciaUID_contenedorUI
                        const instanciaUID_pantallaDeCarga = casaVitini.utilidades.codigoFechaInstancia()
                        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
                            instanciaUID: instanciaUID_pantallaDeCarga,
                            mensaje: "Añadiendo alojamiento a la reserva..."
                        })
                        const respuestaServidor = await casaVitini.shell.servidor({
                            zona: "administracion/reservas/detallesReserva/alojamiento/anadirApartamentoReserva",
                            reservaUID: String(reservaUID),
                            apartamentoIDV: apartamentoIDV
                        })
                        const pantallaDeCargaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_pantallaDeCarga}"]`)
                        if (!pantallaDeCargaRenderizada) {
                            return
                        }
                        pantallaDeCargaRenderizada?.remove()
                        if (respuestaServidor?.error) {
                            return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                        }
                        if (respuestaServidor?.ok) {
                            const uiContenedor = document.querySelector(`[instanciaUID="${instanciaUI_conteneodrUI}"]`)
                            if (!uiContenedor) {
                                return
                            }
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            const apartamentoComponenteUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.apartamentos.apatamentoUI({
                                apartamentoIDV: apartamentoIDV,
                                apartamentoUID: respuestaServidor?.nuevoUID,
                                apartamentoUI: respuestaServidor?.apartamentoUI
                            })
                            const tituloApartamentoComponenteUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.apartamentos.apartamentoTituloUI({
                                apartamentoUI: respuestaServidor?.apartamentoUI
                            })
                            apartamentoComponenteUI.appendChild(tituloApartamentoComponenteUI)
                            document.querySelector("[componente=espacioAlojamiento]").appendChild(apartamentoComponenteUI)
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.componentesUI.controlEspacioAlojamiento()
                            casaVitini.view.__sharedMethods__.detallesReservaUI.reservaUI.actualizarReservaRenderizada()
                        }
                    },
                    eliminarApartamento: async function (metadatos) {
                        const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                        const tipoBloqueo = metadatos.tipoBloqueo
                        const apartamentoUID = metadatos.apartamentoUID
                        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                        const opcionesPantallaDeCarga = {
                            instanciaUID: instanciaUID,
                            mensaje: "Eliminando habitación..."
                        }
                        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(opcionesPantallaDeCarga)
                        const transaccion = {
                            zona: "administracion/reservas/detallesReserva/alojamiento/eliminarApartamentoReserva",
                            reservaUID: reservaUID,
                            apartamentoUID: apartamentoUID,
                            tipoBloqueo: tipoBloqueo
                        }
                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        const pantallaDeCargaRenderizada = document
                            .querySelector(`[pantallaSuperpuesta=pantallaCargaSuperpuesta][instanciaUID="${instanciaUID}"]`)
                        pantallaDeCargaRenderizada?.remove()
                        if (!pantallaDeCargaRenderizada) {
                            return
                        }
                        if (respuestaServidor?.error) {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                        }
                        if (respuestaServidor?.ok) {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            const selectorPernoctantesHabitacion = document.querySelectorAll(`[apartamentoUID="${apartamentoUID}"] [pernoctanteUID]`)
                            selectorPernoctantesHabitacion.forEach((pernoctanteSeleccionado) => {
                                const nombreCompleto = pernoctanteSeleccionado.querySelector("[componente=nombreCompleto]").textContent
                                const pasaporte = pernoctanteSeleccionado.querySelector("[componente=pasaporte]").textContent
                                const tipoCliente = pernoctanteSeleccionado.getAttribute("tipoCliente")
                                const pernoctanteUID = pernoctanteSeleccionado.getAttribute("pernoctanteUID")
                                const clienteUID = pernoctanteSeleccionado.getAttribute("clienteUID")
                                const fechaCheckIn = pernoctanteSeleccionado.getAttribute("fechaCheckIn")
                                const fechaCheckOut = pernoctanteSeleccionado.getAttribute("fechaCheckOut")
                                const bloquePernoctantes = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctanteUI({
                                    tipoPernoctante: tipoCliente,
                                    clienteUID: clienteUID,
                                    pernoctanteUID: pernoctanteUID,
                                    estadoAlojamiento: "noAlojado",
                                    fechaCheckIn: fechaCheckIn,
                                    fechaCheckOutAdelantado: fechaCheckOut
                                })
                                const nombrePernoctante = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctanteNombreUI({
                                    nombreCompleto: nombreCompleto,
                                })
                                bloquePernoctantes.appendChild(nombrePernoctante)
                                const identificacionPernoctante = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctantePasaporteUI({
                                    pasaporte: pasaporte,
                                })
                                bloquePernoctantes.appendChild(identificacionPernoctante)
                                const zonaDestino = document.querySelector(`[componente=contenedorPernoctantesSinHabitacion]`)
                                zonaDestino.appendChild(bloquePernoctantes)
                                zonaDestino.classList.remove("elementoOcultoInicialmente")
                            })
                            casaVitini.shell.controladoresUI.ocultarMenusVolatiles()
                            document.querySelector(`[apartamentoUID="${apartamentoUID}"]`).remove()
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.componentesUI.controlEspacioAlojamiento()
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.controlEspacioPernoctantesSinAlojamiento()
                        }
                        if (respuestaServidor?.estadoDesgloseFinanciero === "actualizar") {
                            casaVitini.view.__sharedMethods__.detallesReservaUI.reservaUI.actualizarReservaRenderizada()
                        }
                    },
                },
                camas: {
                    contenedorCamasUI: function (data) {
                        const reservaUI = document.querySelector("[reservaUID]")
                        const configuracionVista = reservaUI.getAttribute("configuracionVista")
                        const camas = data.camas
                        const habitacionIDV = data.habitacionIDV
                        const apartamentoIDV = data.apartamentoIDV
                        const apartamentoUI = data.apartamentoUI
                        const habitacionUID = data.habitacionUID
                        const habitacionUI = data.habitacionUI
                        const reservaUID = data.reservaUID
                        const camaCompartida = camas.compartida
                        const contenedorCamasFisicas = camas.fisicas
                        const contenedorCamasUI = document.createElement("div")
                        contenedorCamasUI.classList.add(
                            "flexVertical",
                            "gap6",
                            "padding2",
                            "ratonDefault"
                        )
                        contenedorCamasUI.setAttribute("contenedor", "camas")
                        const camaCompartidaUI = document.createElement("div")
                        camaCompartidaUI.classList.add(
                            "padding10",
                            "borderRadius6",
                            "backgroundGrey1"
                        )
                        camaCompartidaUI.setAttribute("contenedor", "camaCompartida")
                        camaCompartidaUI.setAttribute("componente", "menuDesplegable")
                        camaCompartidaUI.textContent = camaCompartida.camaUI
                        if (configuracionVista === "publica") {
                        } else {
                            camaCompartidaUI.classList.add("comportamientoBoton")
                            camaCompartidaUI.addEventListener("click", (e) => {
                                this.anadirCama(e, {
                                    apartamentoIDV,
                                    apartamentoUI,
                                    habitacionIDV,
                                    habitacionUID,
                                    habitacionUI
                                })
                            })
                        }
                        contenedorCamasUI.appendChild(camaCompartidaUI)
                        if (contenedorCamasFisicas.length > 0) {
                            const contenedorCamasFisicasUI = this.contenedorCamasFisicas()
                            contenedorCamasUI.appendChild(contenedorCamasFisicasUI)
                            contenedorCamasFisicas.forEach((camaFisica) => {
                                const componenteUID = camaFisica.componenteUID
                                const camaIDV = camaFisica.camaIDV
                                const camaUI = camaFisica.camaUI
                                const camaFisicaUI = this.camaFisicaUI({
                                    componenteUID,
                                    camaIDV,
                                    reservaUID,
                                    habitacionUID,
                                    habitacionUI,
                                    camaUI,
                                })
                                contenedorCamasFisicasUI.appendChild(camaFisicaUI)
                            })
                        }
                        return contenedorCamasUI
                    },
                    camaFisicaUI: function (data) {
                        const reservaUI = document.querySelector("[reservaUID]")
                        const configuracionVista = reservaUI.getAttribute("configuracionVista")
                        const componenteUID = data.componenteUID
                        const camaIDV = data.camaIDV
                        const reservaUID = data.reservaUID
                        const camaUI = data.camaUI
                        const habitacionUI = data.habitacionUI
                        const habitacionUID = data.habitacionUID
                        const camaFisicaUI = document.createElement("div")
                        camaFisicaUI.classList.add(
                            "padding10",
                            "borderRadius6",
                            "backgroundGrey1"
                        )
                        camaFisicaUI.setAttribute("componente", "menuDesplegable")
                        camaFisicaUI.setAttribute("camaIDV", camaIDV)
                        camaFisicaUI.setAttribute("componenteUID", componenteUID)
                        camaFisicaUI.textContent = camaUI
                        if (configuracionVista === "publica") {
                        } else {
                            camaFisicaUI.classList.add("comportamientoBoton")
                            camaFisicaUI.addEventListener("click", () => {
                                this.eliminarCamaFisica.ui({
                                    camaUI,
                                    componenteUID,
                                    habitacionUI,
                                    reservaUID,
                                    camaIDV,
                                    habitacionUID
                                })
                            })
                        }
                        return camaFisicaUI
                    },
                    contenedorCamasFisicas: function () {
                        const contenedorCamasFisicasUI = document.createElement("div")
                        contenedorCamasFisicasUI.setAttribute("contenedor", "camasFisicas")
                        contenedorCamasFisicasUI.classList.add(
                            "flexVertical",
                            "gap6",
                        )
                        const titulo = document.createElement("div")
                        titulo.classList.add(
                            "padding10"
                        )
                        titulo.textContent = "Camas extra"
                        contenedorCamasFisicasUI.appendChild(titulo)
                        return contenedorCamasFisicasUI
                    },
                    eliminarCamaFisica: {
                        ui: function (data) {
                            const camaUI = data.camaUI
                            const componenteUID = data.componenteUID
                            const habitacionUI = data.habitacionUI
                            const reservaUID = data.reservaUID
                            const camaIDV = data.camaIDV
                            const habitacionUID = data.habitacionUID
                            const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                            pantallaInmersiva.style.justifyContent = "center"
                            const instanciaUID_pantallaInmersia = pantallaInmersiva.getAttribute("instanciaUID")
                            const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                            const titulo = constructor.querySelector("[componente=titulo]")
                            titulo.textContent = `Eliminar ${camaUI}`
                            const mensaje = constructor.querySelector("[componente=mensajeUI]")
                            mensaje.textContent = `Confirmar eliminar la cama física ${camaUI} de la habitación ${habitacionUI} de la reserva ${reservaUID}, ¿Estás de acuerdo?`
                            const botonAceptar = constructor.querySelector("[boton=aceptar]")
                            botonAceptar.textContent = "Eliminar cama física"
                            botonAceptar.addEventListener("click", () => {
                                this.confirmar({
                                    componenteUID,
                                    habitacionUI,
                                    reservaUID,
                                    camaIDV,
                                    habitacionUID,
                                    instanciaUID_pantallaInmersia
                                })
                            })
                            const botonCancelar = constructor.querySelector("[boton=cancelar]")
                            botonCancelar.textContent = "Cancelar y volver"
                            document.querySelector("main").appendChild(pantallaInmersiva)
                        },
                        confirmar: async function (data) {
                            const componenteUID = data.componenteUID
                            const habitacionUI = data.habitacionUI
                            const reservaUID = data.reservaUID
                            const camaIDV = data.camaIDV
                            const habitacionUID = data.habitacionUID
                            const instanciaUID_pantallaInmersia = data.instanciaUID_pantallaInmersia
                            const instanciaUID_pantallaCarga = casaVitini.utilidades.codigoFechaInstancia()
                            const mensaje = "Eliminado cama..."
                            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
                                instanciaUID: instanciaUID_pantallaCarga,
                                mensaje: mensaje
                            })
                            await casaVitini.utilidades.ralentizador(2000)
                            const respuestaServidor = await casaVitini.shell.servidor({
                                zona: "administracion/reservas/detallesReserva/alojamiento/eliminarCamaFisicaDeHabitacion",
                                componenteUID: String(componenteUID),
                                habitacionUI: String(habitacionUI),
                                reservaUID: String(reservaUID)
                            })
                            document.querySelector(`[instanciaUID="${instanciaUID_pantallaCarga}"]`)?.remove()
                            const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_pantallaInmersia}"]`)
                            if (!instanciaRenderizada) { return }
                            instanciaRenderizada.remove()
                            if (respuestaServidor?.error) {
                                casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                const contenedorSelectorCamas = document
                                    .querySelector(`[reservaUID="${reservaUID}"]`)
                                    .querySelector(`[habitacionUID="${habitacionUID}"]`)
                                    .querySelector(`[contenedor=camasFisicas]`)
                                const selectorCamaObsoleta = contenedorSelectorCamas
                                    .querySelector(`[componenteUID="${componenteUID}"]`)
                                selectorCamaObsoleta?.remove()
                                const selectorCamasFisicasRestantes = contenedorSelectorCamas
                                    .querySelectorAll(`[componenteUID]`)
                                if (selectorCamasFisicasRestantes.length === 0) {
                                    contenedorSelectorCamas?.remove()
                                }
                            }
                        }
                    },
                    anadirCama: async function (elementoCama, data) {
                        const apartamentoUI = data.apartamentoUI
                        const apartamentoIDV = data.apartamentoIDV
                        const habitacionIDV = data.habitacionIDV
                        const habitacionUID = data.habitacionUID
                        const habitacionUI = data.habitacionUI
                        const main = document.querySelector("main")
                        const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                        const reservaUID = main.querySelector("[reservaUID]").getAttribute("reservaUID")
                        const instanciaUID = ui.getAttribute("instanciaUID")
                        main.appendChild(ui)
                        const contenedor = ui.querySelector("[componente=contenedor]")
                        const spinner = casaVitini.ui.componentes.spinner({
                            mensaje: "Obteniendo camas del apartamento..."
                        })
                        contenedor.appendChild(spinner)
                        const respuestaServidor = await casaVitini.shell.servidor({
                            zona: "administracion/reservas/detallesReserva/alojamiento/listarTipoCamasHabitacion",
                            apartamentoIDV: apartamentoIDV,
                            habitacionIDV: habitacionIDV
                        })
                        contenedor.innerHTML = null
                        if (respuestaServidor?.error) {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                        }
                        if (respuestaServidor.ok) {
                            const titulo = document.createElement("div")
                            titulo.classList.add(
                                "titulo"
                            )
                            titulo.textContent = `Camas disponibles para ${habitacionUI} en ${apartamentoUI}`
                            contenedor.appendChild(titulo)
                            const banner = document.createElement("div")
                            banner.classList.add(
                                "flexVertical",
                                "borderRadius12",
                                "backgroundGrey1",
                                "padding14",
                                "gap6"
                            )
                            contenedor.appendChild(banner)
                            const bannerReserva = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.
                                alojamiento.
                                componentesUI.
                                bannerReservaMenus()
                            banner.appendChild(bannerReserva)
                            const bannerAlojamiento = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.
                                alojamiento.
                                componentesUI.
                                bannerAlojamiento({
                                    apartamentoUI: apartamentoUI,
                                    apartamentoIDV: apartamentoIDV
                                })
                            banner.appendChild(bannerAlojamiento)
                            const bannerHabitacion = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.
                                alojamiento.
                                componentesUI.
                                bannerHabitacion({
                                    habitacionUI: habitacionUI,
                                    habitacionIDV: habitacionIDV
                                })
                            banner.appendChild(bannerHabitacion)
                            const contenedorCamasCompartidas = document.createElement("div")
                            contenedorCamasCompartidas.classList.add(
                                "flexVertical",
                                "gap10",
                            )
                            contenedor.appendChild(contenedorCamasCompartidas)
                            const tituloCamasCompartidas = document.createElement("div")
                            tituloCamasCompartidas.classList.add(
                                "padding12"
                            )
                            tituloCamasCompartidas.textContent = "Camas compartidas"
                            contenedorCamasCompartidas.appendChild(tituloCamasCompartidas)
                            respuestaServidor.listaCamasDisponiblesPorHabitacion.forEach(cama => {
                                const camaIDV = cama.camaIDV
                                const camaUI = cama.camaUI
                                const tipoCama = document.createElement("p")
                                tipoCama.classList.add("botonV1BlancoIzquierda")
                                tipoCama.setAttribute("componente", "opcionesCama")
                                tipoCama.setAttribute("camaIDV", camaIDV)
                                tipoCama.textContent = camaUI
                                tipoCama.addEventListener("click", async () => {
                                    const instanciaUID_localProceso = casaVitini.utilidades.codigoFechaInstancia()
                                    casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
                                        mensaje: `Estableciendo ${camaUI} en la habitacion...`,
                                        instanciaUID: instanciaUID_localProceso,
                                    })
                                    await casaVitini.utilidades.ralentizador(2000)
                                    const respuestaServidor = await casaVitini.shell.servidor({
                                        zona: "administracion/reservas/detallesReserva/alojamiento/gestionarCamasDeHabitacion",
                                        reservaUID,
                                        habitacionUID: String(habitacionUID),
                                        nuevaCamaIDV: camaIDV,
                                        tipoIDV: "compartida"
                                    })
                                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                    document.querySelector(`[instanciaUID="${instanciaUID_localProceso}"]`)?.remove()
                                    if (respuestaServidor?.error) {
                                        casaVitini.shell.controladoresUI.limpiarTodoElementoFlotante()
                                        casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                                    }
                                    if (respuestaServidor?.ok) {
                                        const nuevoUID = respuestaServidor?.nuevoUID
                                        const selectorTituloCama = document.querySelector(`[habitacionUID="${habitacionUID}"] [contenedor=camas] [contenedor=camaCompartida]`)
                                        selectorTituloCama.textContent = camaUI
                                        selectorTituloCama.setAttribute("camaIDV", camaIDV)
                                        if (nuevoUID) {
                                            selectorTituloCama.setAttribute("camaUID", nuevoUID)
                                        }
                                    }
                                })
                                contenedorCamasCompartidas.appendChild(tipoCama)
                            })
                            if (respuestaServidor.listaCamasFisicas.length > 0) {
                                const contenedorCamasFisicas = document.createElement("div")
                                contenedorCamasFisicas.classList.add(
                                    "flexVertical",
                                    "gap10",
                                )
                                contenedor.appendChild(contenedorCamasFisicas)
                                const tituloCamasFisicas = document.createElement("div")
                                tituloCamasFisicas.classList.add(
                                    "padding12"
                                )
                                tituloCamasFisicas.textContent = "Camas físicas"
                                contenedorCamasFisicas.appendChild(tituloCamasFisicas)
                                respuestaServidor.listaCamasFisicas.forEach(cama => {
                                    const camaIDV = cama.camaIDV
                                    const camaUI = cama.camaUI
                                    const tipoCama = document.createElement("p")
                                    tipoCama.classList.add("botonV1BlancoIzquierda")
                                    tipoCama.setAttribute("componente", "opcionesCama")
                                    tipoCama.setAttribute("camaIDV", camaIDV)
                                    tipoCama.textContent = camaUI
                                    tipoCama.addEventListener("click", async () => {
                                        const instanciaUID_localProceso = casaVitini.utilidades.codigoFechaInstancia()
                                        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
                                            mensaje: `Estableciendo ${camaUI} en la habitacion...`,
                                            instanciaUID: instanciaUID_localProceso,
                                        })
                                        await casaVitini.utilidades.ralentizador(2000)
                                        const respuestaServidor = await casaVitini.shell.servidor({
                                            zona: "administracion/reservas/detallesReserva/alojamiento/gestionarCamasDeHabitacion",
                                            reservaUID,
                                            habitacionUID: String(habitacionUID),
                                            nuevaCamaIDV: String(camaIDV),
                                            tipoIDV: "fisica"
                                        })
                                        document.querySelector(`[instanciaUID="${instanciaUID_localProceso}"]`)?.remove()
                                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                        if (respuestaServidor?.error) {
                                            casaVitini.shell.controladoresUI.ocultarMenusVolatiles()
                                            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                                        }
                                        if (respuestaServidor?.ok) {
                                            const camaIDV = respuestaServidor.camaIDV
                                            const componenteUID = respuestaServidor.componenteUID
                                            const camaUI = respuestaServidor.camaUI
                                            const selectorContenedorCamas = document.querySelector(`[habitacionUID="${habitacionUID}"] [contenedor=camas]`)
                                            if (!selectorContenedorCamas) {
                                                return
                                            }
                                            const selectorContenedorCamasFisicasRenderizados = selectorContenedorCamas.querySelector("[contenedor=camasFisicas]")
                                            if (!selectorContenedorCamasFisicasRenderizados) {
                                                const contenedorCamasFisicasUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.camas.contenedorCamasFisicas()
                                                selectorContenedorCamas.appendChild(contenedorCamasFisicasUI)
                                            }
                                            const contenedorCamasFisicas_renderizado = selectorContenedorCamas.querySelector("[contenedor=camasFisicas]")
                                            const camaFisicaUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.camas.camaFisicaUI({
                                                componenteUID: componenteUID,
                                                camaIDV: camaIDV,
                                                reservaUID: reservaUID,
                                                camaUI: camaUI,
                                                habitacionUI: habitacionUI,
                                                habitacionUID: habitacionUID
                                            })
                                            contenedorCamasFisicas_renderizado.appendChild(camaFisicaUI)
                                        }
                                    })
                                    contenedorCamasFisicas.appendChild(tipoCama)
                                })
                            }
                            const botonCancelar = document.createElement("div")
                            botonCancelar.classList.add("botonV1")
                            botonCancelar.setAttribute("boton", "cancelar")
                            botonCancelar.textContent = "Cerrar y volver a la reserva"
                            botonCancelar.addEventListener("click", () => {
                                return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            })
                            contenedor.appendChild(botonCancelar)
                        }
                    },
                },
                pernoctantes: {
                    pernoctanteUI: function (metadatos) {
                        const reservaUI = document.querySelector("[reservaUID]")
                        const configuracionVista = reservaUI.getAttribute("configuracionVista")
                        const estadoAlojamiento = metadatos.estadoAlojamiento
                        const tipoPernoctante = metadatos.tipoPernoctante
                        const fechaCheckIn = metadatos.fechaCheckIn
                        const fechaCheckOutAdelantado = metadatos.fechaCheckOutAdelantado
                        const clienteUID = metadatos.clienteUID
                        const pernoctanteUID = metadatos.pernoctanteUID
                        const pernoctanteUI = document.createElement("div")
                        pernoctanteUI.classList.add(
                            "flexVertical",
                            "borderRadius8",
                            "gap6",
                            "padding10",
                            "ratonDefault"
                        )
                        if (estadoAlojamiento === "alojado") {
                        }
                        pernoctanteUI.setAttribute("tipoCliente", tipoPernoctante)
                        pernoctanteUI.setAttribute("estadoAlojamiento", estadoAlojamiento)
                        pernoctanteUI.setAttribute("componente", "contenedorPernocanteHabitacion")
                        if (estadoAlojamiento === "noAlojado") {
                            pernoctanteUI.style.borderRadius = "8px"
                            pernoctanteUI.classList.add("tarjetaGris")
                        }
                        if (configuracionVista === "publica") {
                        } else {
                            pernoctanteUI.classList.add("comportamientoBoton")
                            pernoctanteUI.addEventListener("click", () => {
                                this.detallesPernoctante.ui({
                                    pernoctanteUID
                                })
                            })
                        }
                        pernoctanteUI.setAttribute("clienteUID", clienteUID)
                        pernoctanteUI.setAttribute("contenedor", "pernoctante")
                        pernoctanteUI.setAttribute("componente", "menuDesplegable")
                        pernoctanteUI.setAttribute("pernoctanteUID", pernoctanteUID)
                        if (tipoPernoctante === "clientePool") {
                            const tipoPernoctanteUI = document.createElement("div")
                            tipoPernoctanteUI.classList.add("administracion_reservas_detallesReserva_tituloPendienteComprobacion")
                            tipoPernoctanteUI.classList.add("parpadea")
                            tipoPernoctanteUI.setAttribute("componente", "pendienteComprobacion")
                            tipoPernoctanteUI.textContent = "Pendiente de comprobación documental"
                            pernoctanteUI.appendChild(tipoPernoctanteUI)
                        }
                        if (tipoPernoctante === "cliente") {
                            if (!fechaCheckIn) {
                                const tipoPernoctanteUI = document.createElement("div")
                                tipoPernoctanteUI.classList.add("administracion_reservas_detallesReserva_tituloCheckIn")
                                tipoPernoctanteUI.setAttribute("componente", "checkInInfo")
                                tipoPernoctanteUI.textContent = "Pendiente de checkin"
                                pernoctanteUI.appendChild(tipoPernoctanteUI)
                            } else {
                                pernoctanteUI.setAttribute("fechaCheckIn", fechaCheckIn)
                                const tipoPernoctanteUI = document.createElement("div")
                                tipoPernoctanteUI.classList.add("administracion_reservas_detallesReserva_tituloCheckIn")
                                tipoPernoctanteUI.setAttribute("componente", "checkInInfo")
                                tipoPernoctanteUI.textContent = "> " + fechaCheckIn
                                pernoctanteUI.appendChild(tipoPernoctanteUI)
                            }
                            if (fechaCheckOutAdelantado) {
                                pernoctanteUI.setAttribute("fechaCheckOut", fechaCheckOutAdelantado)
                                const tipoPernoctanteUI = document.createElement("div")
                                tipoPernoctanteUI.classList.add("administracion_reservas_detallesReserva_tituloCheckIn")
                                tipoPernoctanteUI.classList.add("letraRoja")
                                tipoPernoctanteUI.setAttribute("componente", "checkOutInfo")
                                tipoPernoctanteUI.textContent = "< " + fechaCheckOutAdelantado
                                pernoctanteUI.appendChild(tipoPernoctanteUI)
                            } else {
                                const tipoPernoctanteUI = document.createElement("div")
                                tipoPernoctanteUI.classList.add("administracion_reservas_detallesReserva_tituloCheckIn")
                                tipoPernoctanteUI.classList.add("letraRoja")
                                tipoPernoctanteUI.style.display = "none"
                                tipoPernoctanteUI.setAttribute("componente", "checkOutInfo")
                                pernoctanteUI.appendChild(tipoPernoctanteUI)
                            }
                        }
                        return pernoctanteUI
                    },
                    pernoctanteNombreUI: function (metadatos) {
                        const pernoctanteNombreUI = document.createElement("div")
                        pernoctanteNombreUI.classList.add("administracionReservasDetallesNombrePernoctante")
                        pernoctanteNombreUI.setAttribute("componente", "nombreCompleto")
                        pernoctanteNombreUI.textContent = metadatos.nombreCompleto
                        return pernoctanteNombreUI
                    },
                    pernoctantePasaporteUI: function (metadatos) {
                        const pernoctantePasaporteUI = document.createElement("div")
                        pernoctantePasaporteUI.classList.add("administracionReservasDetallesIdentificacionPernoctante")
                        pernoctantePasaporteUI.setAttribute("componente", "pasaporte")
                        pernoctantePasaporteUI.textContent = metadatos.pasaporte
                        return pernoctantePasaporteUI
                    },
                    propuestaEliminarPernoctanteUI: function (datosEliminacion) {
                        const tipoEliminacion = datosEliminacion.tipoEliminacion
                        const pernoctanteUID = datosEliminacion.pernoctanteUID
                        const nombreCompleto = document
                            .querySelector(`[pernoctanteUID="${pernoctanteUID}"]`)
                            .querySelector("[componente=nombreCompleto]")
                            .textContent
                        const pasaporte = document
                            .querySelector(`[pernoctanteUID="${pernoctanteUID}"]`)
                            .querySelector("[componente=pasaporte]")
                            .textContent
                        let mensajeUI
                        if (tipoEliminacion === "habitacion") {
                            mensajeUI = "Confirmas la eliminación de este pernoctante de la habitación pero no de la reserva.Este pernoctante pasará a la sección de pernoctantes asociados a la reserva pero sin alojamiento asignado"
                        }
                        if (tipoEliminacion === "reserva") {
                            mensajeUI = "¿Confirmas la eliminación de este pernoctante de la reserva? Si confirmas la eliminación el pernoctante será eliminado de esta reserva."
                        }
                        const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                        pantallaInmersiva.style.justifyContent = "center"
                        const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                        const titulo = constructor.querySelector("[componente=titulo]")
                        titulo.textContent = "Confirmar la elimiación del pernoctante"
                        const mensaje = constructor.querySelector("[componente=mensajeUI]")
                        mensaje.textContent = mensajeUI
                        const contenedorEspacio = constructor.querySelector("[componente=contenedor]")
                        contenedorEspacio.classList.add(
                            "padding14",
                            "borderRadius14",
                            "backgroundGrey1"
                        )
                        const nombreCompletoPropuesta = document.createElement("p")
                        nombreCompletoPropuesta.classList.add("administracionReservaDetallesPropuedaCambioClientePoolnombreCompletoPropuesta")
                        nombreCompletoPropuesta.setAttribute("componente", "nombrePropuesto")
                        nombreCompletoPropuesta.textContent = nombreCompleto
                        contenedorEspacio.appendChild(nombreCompletoPropuesta)
                        const pasaportePropuesta = document.createElement("p")
                        pasaportePropuesta.classList.add("administracionReservaDetallesPropuedaCambioClientePoolpasaportePropuesta")
                        pasaportePropuesta.textContent = pasaporte
                        contenedorEspacio.appendChild(pasaportePropuesta)
                        let botonMenajeUI
                        if (tipoEliminacion === "habitacion") {
                            botonMenajeUI = "Eliminar de la habitación"
                        }
                        if (tipoEliminacion === "reserva") {
                            botonMenajeUI = "Eliminar de la reserva"
                        }
                        const botonAceptar = constructor.querySelector("[boton=aceptar]")
                        botonAceptar.textContent = botonMenajeUI
                        botonAceptar.addEventListener("click", () => {
                            const metadatosTipoEliminacion = {
                                pernoctanteUID: pernoctanteUID,
                                tipoEliminacion: tipoEliminacion
                            }
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.eliminarPernoctante(metadatosTipoEliminacion)
                        })
                        const botonCancelar = constructor.querySelector("[boton=cancelar]")
                        botonCancelar.textContent = "Cancelar la eliminación"
                        document.querySelector("main").appendChild(pantallaInmersiva)
                    },
                    checkin: {
                        UI: async function (pernoctanteUID) {
                            const main = document.querySelector("main")
                            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada({
                                alineacion: "arriba"
                            })
                            const instanciaUID = ui.getAttribute("instanciaUID")
                            ui.setAttribute("contenedor", "checkin")
                            main.appendChild(ui)
                            const contenedor = ui.querySelector("[componente=contenedor]")
                            const pernoctanteElemento = document.querySelector(`[pernoctanteUID="${pernoctanteUID}"]`)
                            const nombreCompleto = pernoctanteElemento.querySelector("[componente=nombreCompleto]").textContent
                            const pasaporte = pernoctanteElemento.querySelector("[componente=pasaporte]").textContent
                            const tituloCancelarReserva = document.createElement("p")
                            tituloCancelarReserva.classList.add(
                                "tituloGris",
                                "padding14"
                            )
                            tituloCancelarReserva.textContent = "Realizar checkin"
                            contenedor.appendChild(tituloCancelarReserva)
                            const datosTitular = {
                                nombreCompleto: nombreCompleto,
                                pasaporte: pasaporte
                            }
                            const pernoctanteUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.checkin.detallesDelTitularUI(datosTitular)
                            contenedor.appendChild(pernoctanteUI)
                            const instanciaUID_Calendario = casaVitini.utilidades.codigoFechaInstancia()
                            const metadatosCalendario = {
                                tipoFecha: "entrada",
                                almacenamientoCalendarioID: "administracionCalendario",
                                perfilMes: "calendario_entrada_asistido_detallesReserva_checkIn_conPasado",
                                calendarioIO: "entrada",
                                mensajeInfo: "Selecciona el día de checkin",
                                alturaDinamica: "10",
                                instanciaUID: instanciaUID_Calendario,
                                metodoSelectorDia: "view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.checkin.seleccionarDia"
                            }
                            const calendarioIncrustado = casaVitini.ui.componentes.calendario.constructorCalendarioIncrustado(metadatosCalendario)
                            contenedor.appendChild(calendarioIncrustado)
                            const botonCancelar = document.createElement("div")
                            botonCancelar.classList.add("botonV1BlancoIzquierda")
                            botonCancelar.setAttribute("componente", "botonConfirmarCancelarReserva")
                            botonCancelar.textContent = "Seleccionar una fecha del checkin"
                            botonCancelar.addEventListener("click", (e) => {
                                const datosCheckIn = {
                                    fechaCheckIn: e.target.getAttribute("fechaCheckIn"),
                                    pernoctanteUID: pernoctanteUID,
                                    instanciaUID: instanciaUID
                                }
                                casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.checkin.confirmar(datosCheckIn)
                            }
                            )
                            contenedor.appendChild(botonCancelar)
                            const infoEliminarReserva = document.createElement("div")
                            infoEliminarReserva.classList.add("detallesReservaCancelarReservaTituloBloquoApartamentos")
                            infoEliminarReserva.style.marginTop = "50px"
                            infoEliminarReserva.textContent = "También puedes eliminar irreversiblemente una reserva.La eliminación irreversible de una reserva borra la información de la reserva, así como los pagos asociados a la reserva y toda la información relacionada con la reserva.A diferencia de la cancelación, los datos dejarán de estar disponibles."
                            const selectorCheckIn = document
                                .querySelector(`[pernoctanteUID="${pernoctanteUID}"]`)
                                .getAttribute("fechaCheckIn")
                            if (selectorCheckIn) {
                                contenedor.setAttribute("fechaCheckIn", selectorCheckIn)
                                const botonEliminarCheckIn = document.createElement("div")
                                botonEliminarCheckIn.classList.add("botonV1BlancoIzquierda")
                                botonEliminarCheckIn.setAttribute("componente", "botonConfirmarCancelarReserva")
                                botonEliminarCheckIn.textContent = "Eliminar checkin"
                                botonEliminarCheckIn.addEventListener("click", () => {
                                    const eliminarCheckIN = {
                                        pernoctanteUID,
                                        instanciaUID
                                    }
                                    casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.checkin.eliminar(eliminarCheckIN)
                                })
                                contenedor.appendChild(botonEliminarCheckIn)
                            }
                            const selectorCheckOutAdelantado = document
                                .querySelector(`[pernoctanteUID="${pernoctanteUID}"]`)
                                .getAttribute("fechaCheckOut")
                            if (selectorCheckOutAdelantado) {
                                contenedor.setAttribute("fechaCheckOut", selectorCheckOutAdelantado)
                            }
                            const botonCancelarCheckin = document.createElement("div")
                            botonCancelarCheckin.classList.add("botonV1")
                            botonCancelarCheckin.setAttribute("componente", "botonConfirmarCancelarReserva")
                            botonCancelarCheckin.textContent = "Cancelar checkin y volver a la reserva"
                            botonCancelarCheckin.addEventListener("click", () => {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            })
                            contenedor.appendChild(botonCancelarCheckin)
                            const fechaEntrada = document.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
                            const fechaEntradaArray = fechaEntrada.split("-")
                            const mesEntrada = fechaEntradaArray[1]
                            const anoEntrada = fechaEntradaArray[0]
                            const resolucionCalendario = {
                                tipo: "personalizado",
                                ano: Number(anoEntrada),
                                mes: Number(mesEntrada)
                            }
                            if (selectorCheckIn) {
                                const fechaCheckInArray = selectorCheckIn.split("-")
                                const mesCheckIn = Number(fechaCheckInArray[1])
                                const anoCheckIn = Number(fechaCheckInArray[0])
                                resolucionCalendario.mes = mesCheckIn
                                resolucionCalendario.ano = anoCheckIn
                            }
                            const calendarioResuelto = await casaVitini.ui.componentes.calendario.resolverCalendarioNuevo(resolucionCalendario)
                            calendarioResuelto.instanciaUID = instanciaUID_Calendario
                            calendarioResuelto.pernoctanteUID = pernoctanteUID
                            await casaVitini.ui.componentes.calendario.constructorMesNuevo(calendarioResuelto)
                        },
                        detallesDelTitularUI: function (detallesDelTitular) {
                            const nombreCompleto = detallesDelTitular.nombreCompleto
                            const pasaporte = detallesDelTitular.pasaporte
                            const detallesRapidosDelTitular = document.createElement("div")
                            detallesRapidosDelTitular.classList.add("tarjetaGris")
                            let contenedorDato = document.createElement("div")
                            contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                            let nombreDato = document.createElement("div")
                            nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                            nombreDato.textContent = "Nombre del pernoctante"
                            contenedorDato.appendChild(nombreDato)
                            let valorDato = document.createElement("div")
                            valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                            valorDato.classList.add("negrita")
                            valorDato.setAttribute("componente", "nombreCompleto")
                            valorDato.textContent = nombreCompleto
                            contenedorDato.appendChild(valorDato)
                            detallesRapidosDelTitular.appendChild(contenedorDato)
                            contenedorDato = document.createElement("div")
                            contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                            nombreDato = document.createElement("div")
                            nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                            nombreDato.textContent = "Pasaporte del pernoctante"
                            contenedorDato.appendChild(nombreDato)
                            valorDato = document.createElement("div")
                            valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                            valorDato.classList.add("negrita")
                            valorDato.setAttribute("componente", "pasaporte")
                            valorDato.textContent = pasaporte
                            contenedorDato.appendChild(valorDato)
                            detallesRapidosDelTitular.appendChild(contenedorDato)
                            return detallesRapidosDelTitular
                        },
                        seleccionarDia: function (dia) {
                            const diaSeleccionado = dia.target.getAttribute("dia").padStart(2, "0")
                            const diaSeleccionadoComoElemento = dia.target;
                            const instanciaUID_contenedorCheckIn = dia.target.closest("[contenedor=checkin][instanciaUID]")?.getAttribute("instanciaUID")
                            const calendario = diaSeleccionadoComoElemento.closest("[componente=marcoCalendario]")
                            const calendarioIO = calendario.getAttribute("calendarioIO")
                            if (diaSeleccionadoComoElemento.getAttribute("estadoDia") === "seleccionado") {
                                diaSeleccionadoComoElemento.classList.remove("calendarioDiaSeleccionado")
                                if (calendarioIO === "entrada") {
                                    const selectorBotonConfirmar = document
                                        .querySelector(`[instanciaUID="${instanciaUID_contenedorCheckIn}"]`)
                                        .querySelector("[componente=botonConfirmarCancelarReserva]")
                                    selectorBotonConfirmar.textContent = "Seleccionar una fecha del checkin"
                                    selectorBotonConfirmar.removeAttribute("style")
                                    diaSeleccionadoComoElemento.style.background = ""
                                    diaSeleccionadoComoElemento.style.color = ""
                                    selectorBotonConfirmar.removeAttribute("fechaCheckIn")
                                } else if (calendarioIO === "salida") {
                                    document.querySelector("[componente=bloquePropuestaNuevaFechaSalida]")?.remove()
                                    diaSeleccionadoComoElemento.style.background = ""
                                    diaSeleccionadoComoElemento.style.color = ""
                                }
                                diaSeleccionadoComoElemento.removeAttribute("estadoDia")
                                return
                            }
                            calendario.querySelectorAll("[estadoDia=seleccionado]").forEach(diasDelCalendario => {
                                diasDelCalendario.removeAttribute("estadoDia")
                                diasDelCalendario.style.background = ""
                                diasDelCalendario.style.color = ""
                            });
                            diaSeleccionadoComoElemento.style.background = "green"
                            diaSeleccionadoComoElemento.style.color = "white"
                            diaSeleccionadoComoElemento.setAttribute("estadoDia", "seleccionado")
                            const anoSeleccionado = document.querySelector("[componente=mesReferencia]").getAttribute("ano").padStart(4, "0")
                            const mesSeleccionado = document.querySelector("[componente=mesReferencia]").getAttribute("mes").padStart(2, "0")
                            if (calendarioIO === "entrada") {
                                const selectorBotonConfirmar = document
                                    .querySelector(`[instanciaUID="${instanciaUID_contenedorCheckIn}"]`)
                                    .querySelector("[componente=botonConfirmarCancelarReserva]")
                                selectorBotonConfirmar.textContent = `Confirmar checkin para el ${diaSeleccionado}/${mesSeleccionado}/${anoSeleccionado}`
                                selectorBotonConfirmar.style.pointerEvents = "all"
                                selectorBotonConfirmar.setAttribute("fechaCheckIn", `${anoSeleccionado}-${mesSeleccionado}-${diaSeleccionado}`)
                                selectorBotonConfirmar.style.fontWeight = "bold"
                            }
                        },
                        confirmar: async function (checkIn) {
                            const pernoctanteUID = checkIn.pernoctanteUID
                            const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                            const fechaCheckIn = checkIn.fechaCheckIn
                            const instanciaUID = checkIn.instanciaUID
                            const instanciaUID_localProceso = casaVitini.utilidades.codigoFechaInstancia()
                            const metadatosPantallaCarga = {
                                mensaje: "Esperando al servidor...",
                                instanciaUID: instanciaUID_localProceso,
                            }
                            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(metadatosPantallaCarga)
                            const estadoReserva = {
                                zona: "administracion/reservas/detallesReserva/pernoctantes/confirmarFechaCheckIn",
                                pernoctanteUID: String(pernoctanteUID),
                                fechaCheckIn: fechaCheckIn,
                                reservaUID: String(reservaUID)
                            }
                            const respuestaServidor = await casaVitini.shell.servidor(estadoReserva)
                            const selectorPantallaDeCarga = document.querySelectorAll(`[instanciaUID="${instanciaUID_localProceso}"][pantallaSuperpuesta=pantallaCargaSuperpuesta]`)
                            selectorPantallaDeCarga.forEach((pantalla) => {
                                pantalla.remove()
                            })
                            const selectorInstanciaRaiz = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                            if (!selectorInstanciaRaiz) {
                            }
                            if (respuestaServidor?.error) {
                                casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                const selectorPernoctante = document.querySelector(`[pernoctanteUID="${pernoctanteUID}"]`)
                                selectorPernoctante.setAttribute("fechaCheckIn", fechaCheckIn)
                                const selectorCheckInInfo = selectorPernoctante.querySelector(`[componente=checkInInfo]`)
                                selectorCheckInInfo.textContent = "> " + fechaCheckIn
                            }
                        },
                        eliminar: async function (data) {
                            const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                            const pernoctanteUID = data.pernoctanteUID
                            const instanciaUID = data.instanciaUID
                            const instanciaUID_localProceso = casaVitini.utilidades.codigoFechaInstancia()
                            const metadatosPantallaCarga = {
                                mensaje: "Esperando al servidor...",
                                instanciaUID: instanciaUID_localProceso,
                            }
                            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(metadatosPantallaCarga)
                            const estadoReserva = {
                                zona: "administracion/reservas/detallesReserva/pernoctantes/eliminarCheckIN",
                                pernoctanteUID: String(pernoctanteUID),
                                reservaUID: String(reservaUID)
                            }
                            const respuestaServidor = await casaVitini.shell.servidor(estadoReserva)
                            const selectorPantallaDeCarga = document.querySelectorAll(`[instanciaUID="${instanciaUID_localProceso}"][pantallaSuperpuesta=pantallaCargaSuperpuesta]`)
                            selectorPantallaDeCarga.forEach((pantalla) => {
                                pantalla.remove()
                            })
                            const selectorInstanciaRaiz = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                            if (!selectorInstanciaRaiz) {
                            }
                            if (respuestaServidor?.error) {
                                casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                const selectorPernoctante = document.querySelector(`[pernoctanteUID="${pernoctanteUID}"]`)
                                selectorPernoctante.removeAttribute("fechaCheckIn")
                                const selectorCheckInInfo = selectorPernoctante.querySelector(`[componente=checkInInfo]`)
                                selectorCheckInInfo.textContent = "Pendiente de checkin"
                                selectorPernoctante.removeAttribute("fechaCheckOut")
                                const selectorCheckOutInfo = selectorPernoctante.querySelector(`[componente=checkOutInfo]`)
                                selectorCheckOutInfo.style.display = "none"
                                selectorCheckOutInfo.textContent = null
                            }
                        }
                    },
                    checkout: {
                        UI: async function (pernoctanteUID) {
                            const main = document.querySelector("main")
                            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada({
                                alineacion: "arriba"
                            })
                            const instanciaUID = ui.getAttribute("instanciaUID")
                            ui.setAttribute("contenedor", "checkout")
                            main.appendChild(ui)
                            const contenedor = ui.querySelector("[componente=contenedor]")
                            const pernoctanteElemento = document.querySelector(`[pernoctanteUID="${pernoctanteUID}"]`)
                            const nombreCompleto = pernoctanteElemento.querySelector("[componente=nombreCompleto]").textContent
                            const pasaporte = pernoctanteElemento.querySelector("[componente=pasaporte]").textContent
                            const tituloCancelarReserva = document.createElement("p")
                            tituloCancelarReserva.classList.add(
                                "tituloGris",
                                "padding14"
                            )
                            tituloCancelarReserva.textContent = "Checkout adelantado"
                            contenedor.appendChild(tituloCancelarReserva)
                            const datosTitular = {
                                nombreCompleto: nombreCompleto,
                                pasaporte: pasaporte
                            }
                            const pernoctanteUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.checkout.detallesDelTitularUI(datosTitular)
                            contenedor.appendChild(pernoctanteUI)
                            const instanciaUID_Calendario = casaVitini.utilidades.codigoFechaInstancia()
                            const metadatosCalendario = {
                                tipoFecha: "salida",
                                almacenamientoCalendarioID: "administracionCalendario",
                                perfilMes: "calendario_salida_asistido_detallesReserva_checkOut_conPasado",
                                calendarioIO: "salida",
                                mensajeInfo: "Selecciona el día de checkout adelantado",
                                alturaDinamica: "10",
                                instanciaUID: instanciaUID_Calendario,
                                metodoSelectorDia: "view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.checkout.seleccionarDia"
                            }
                            const calendarioIncrustado = casaVitini.ui.componentes.calendario.constructorCalendarioIncrustado(metadatosCalendario)
                            contenedor.appendChild(calendarioIncrustado)
                            const botonCancelar = document.createElement("div")
                            botonCancelar.classList.add("botonV1BlancoIzquierda")
                            botonCancelar.setAttribute("componente", "botonConfirmarCancelarReserva")
                            botonCancelar.textContent = "Seleccionar una fecha del checkout adelantado"
                            botonCancelar.addEventListener("click", (e) => {
                                const datosCheckIn = {
                                    fechaCheckOut: e.target.getAttribute("fechaCheckOut"),
                                    pernoctanteUID: pernoctanteUID,
                                    instanciaUID: instanciaUID
                                }
                                casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.checkout.confirmar(datosCheckIn)
                            }
                            )
                            contenedor.appendChild(botonCancelar)
                            const infoEliminarReserva = document.createElement("div")
                            infoEliminarReserva.classList.add("detallesReservaCancelarReservaTituloBloquoApartamentos")
                            infoEliminarReserva.style.marginTop = "50px"
                            infoEliminarReserva.textContent = "También puedes eliminar irreversiblemente una reserva.La eliminación irreversible de una reserva borra la información de la reserva, así como los pagos asociados a la reserva y toda la información relacionada con la reserva.A diferencia de la cancelación, los datos dejarán de estar disponibles."
                            const selectorCheckOut = document
                                .querySelector(`[pernoctanteUID="${pernoctanteUID}"]`)
                                .getAttribute("fechaCheckOut")
                            if (selectorCheckOut) {
                                contenedor.setAttribute("fechaCheckOut", selectorCheckOut)
                                const botonEliminar = document.createElement("div")
                                botonEliminar.classList.add("botonV1BlancoIzquierda")
                                botonEliminar.setAttribute("componente", "botonConfirmarCancelarReserva")
                                botonEliminar.textContent = "Eliminar checkout adelantado"
                                botonEliminar.addEventListener("click", () => {
                                    const eliminarCheckOut = {
                                        pernoctanteUID: pernoctanteUID,
                                        instanciaUID: instanciaUID
                                    }
                                    casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.checkout.eliminar(eliminarCheckOut)
                                })
                                contenedor.appendChild(botonEliminar)
                            }
                            const selectorCheckIn = document
                                .querySelector(`[pernoctanteUID="${pernoctanteUID}"]`)
                                .getAttribute("fechaCheckIn")
                            if (selectorCheckIn) {
                                contenedor.setAttribute("fechaCheckIn", selectorCheckIn)
                            }
                            const botonCancelarCheckin = document.createElement("div")
                            botonCancelarCheckin.classList.add("botonV1")
                            botonCancelarCheckin.setAttribute("componente", "botonConfirmarCancelarReserva")
                            botonCancelarCheckin.textContent = "Cancelar checkout adelantado y volver a la reserva"
                            botonCancelarCheckin.addEventListener("click", () => {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            })
                            contenedor.appendChild(botonCancelarCheckin)
                            const fechaSalida = document.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")
                            const fechaSalidaArray = fechaSalida.split("-")
                            const mesSalida = fechaSalidaArray[1]
                            const anoSalida = fechaSalidaArray[0]
                            const resolucionCalendario = {
                                tipo: "personalizado",
                                mes: Number(mesSalida),
                                ano: Number(anoSalida),
                            }
                            if (selectorCheckOut) {
                                const fechaCheckOutArray = selectorCheckOut.split("-")
                                const mesCheckOut = Number(fechaCheckOutArray[1])
                                const anoCheckOut = Number(fechaCheckOutArray[0])
                                resolucionCalendario.mes = mesCheckOut
                                resolucionCalendario.ano = anoCheckOut
                            }
                            const calendarioResuelto = await casaVitini.ui.componentes.calendario.resolverCalendarioNuevo(resolucionCalendario)
                            calendarioResuelto.instanciaUID = instanciaUID_Calendario
                            calendarioResuelto.pernoctanteUID = pernoctanteUID
                            await casaVitini.ui.componentes.calendario.constructorMesNuevo(calendarioResuelto)
                        },
                        detallesDelTitularUI: function (detallesDelTitular) {
                            const nombreCompleto = detallesDelTitular.nombreCompleto
                            const pasaporte = detallesDelTitular.pasaporte
                            const detallesRapidosDelTitular = document.createElement("div")
                            detallesRapidosDelTitular.classList.add("tarjetaGris")
                            let contenedorDato = document.createElement("div")
                            contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                            let nombreDato = document.createElement("div")
                            nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                            nombreDato.textContent = "Nombre del pernoctante"
                            contenedorDato.appendChild(nombreDato)
                            let valorDato = document.createElement("div")
                            valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                            valorDato.classList.add("negrita")
                            valorDato.setAttribute("componente", "nombreCompleto")
                            valorDato.textContent = nombreCompleto
                            contenedorDato.appendChild(valorDato)
                            detallesRapidosDelTitular.appendChild(contenedorDato)
                            contenedorDato = document.createElement("div")
                            contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                            nombreDato = document.createElement("div")
                            nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                            nombreDato.textContent = "Pasaporte del pernoctante"
                            contenedorDato.appendChild(nombreDato)
                            valorDato = document.createElement("div")
                            valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                            valorDato.classList.add("negrita")
                            valorDato.setAttribute("componente", "pasaporte")
                            valorDato.textContent = pasaporte
                            contenedorDato.appendChild(valorDato)
                            detallesRapidosDelTitular.appendChild(contenedorDato)
                            return detallesRapidosDelTitular
                        },
                        seleccionarDia: function (dia) {
                            const diaSeleccionado = dia.target.getAttribute("dia").padStart(2, "0")
                            const diaSeleccionadoComoElemento = dia.target;
                            const instanciaUID_contenedorCheckOut = dia.target.closest("[contenedor=checkout][instanciaUID]")?.getAttribute("instanciaUID")
                            const calendario = diaSeleccionadoComoElemento.closest("[componente=marcoCalendario]")
                            const calendarioIO = calendario.getAttribute("calendarioIO")
                            if (diaSeleccionadoComoElemento.getAttribute("estadoDia") === "seleccionado") {
                                diaSeleccionadoComoElemento.classList.remove("calendarioDiaSeleccionado")
                                if (calendarioIO === "salida") {
                                    const selectorBotonConfirmar = document
                                        .querySelector(`[instanciaUID="${instanciaUID_contenedorCheckOut}"]`)
                                        .querySelector("[componente=botonConfirmarCancelarReserva]")
                                    selectorBotonConfirmar.textContent = "Seleccionar una fecha del checkout adelantado"
                                    selectorBotonConfirmar.removeAttribute("style")
                                    diaSeleccionadoComoElemento.style.background = ""
                                    diaSeleccionadoComoElemento.style.color = ""
                                    selectorBotonConfirmar.removeAttribute("fechaCheckOut")
                                }
                                diaSeleccionadoComoElemento.removeAttribute("estadoDia")
                                return
                            }
                            calendario.querySelectorAll("[estadoDia=seleccionado]").forEach(diasDelCalendario => {
                                diasDelCalendario.removeAttribute("estadoDia")
                                diasDelCalendario.style.background = ""
                                diasDelCalendario.style.color = ""
                            });
                            diaSeleccionadoComoElemento.style.background = "green"
                            diaSeleccionadoComoElemento.style.color = "white"
                            diaSeleccionadoComoElemento.setAttribute("estadoDia", "seleccionado")
                            const anoSeleccionado = document.querySelector("[componente=mesReferencia]").getAttribute("ano").padStart(4, "0")
                            const mesSeleccionado = document.querySelector("[componente=mesReferencia]").getAttribute("mes").padStart(2, "0")
                            const selectorPropuestaCambioFecha = document.querySelector("[componente=espacioPropuestaCambioFechaReserva]")
                            if (calendarioIO === "salida") {
                                const selectorBotonConfirmar = document
                                    .querySelector(`[instanciaUID="${instanciaUID_contenedorCheckOut}"]`)
                                    .querySelector("[componente=botonConfirmarCancelarReserva]")
                                selectorBotonConfirmar.textContent = `Confirmar checkout adelantador para el ${diaSeleccionado}/${mesSeleccionado}/${anoSeleccionado}`
                                selectorBotonConfirmar.style.pointerEvents = "all"
                                selectorBotonConfirmar.setAttribute("fechaCheckOut", `${anoSeleccionado}-${mesSeleccionado}-${diaSeleccionado}`)
                                selectorBotonConfirmar.style.fontWeight = "bold"
                            }
                        },
                        confirmar: async function (checkOut) {
                            const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                            const pernoctanteUID = checkOut.pernoctanteUID
                            const fechaCheckOut = checkOut.fechaCheckOut
                            const instanciaUID = checkOut.instanciaUID
                            const instanciaUID_localProceso = casaVitini.utilidades.codigoFechaInstancia()
                            const metadatosPantallaCarga = {
                                mensaje: "Esperando al servidor...",
                                instanciaUID: instanciaUID_localProceso,
                            }
                            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(metadatosPantallaCarga)
                            const estadoReserva = {
                                zona: "administracion/reservas/detallesReserva/pernoctantes/confirmarFechaCheckOutAdelantado",
                                reservaUID: String(reservaUID),
                                pernoctanteUID: String(pernoctanteUID),
                                fechaCheckOut: fechaCheckOut
                            }
                            const respuestaServidor = await casaVitini.shell.servidor(estadoReserva)
                            const selectorPantallaDeCarga = document.querySelectorAll(`[instanciaUID="${instanciaUID_localProceso}"][pantallaSuperpuesta=pantallaCargaSuperpuesta]`)
                            selectorPantallaDeCarga.forEach((pantalla) => {
                                pantalla.remove()
                            })
                            const selectorInstanciaRaiz = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                            if (!selectorInstanciaRaiz) {
                            }
                            if (respuestaServidor?.error) {
                                casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                const selectorPernoctante = document.querySelector(`[pernoctanteUID="${pernoctanteUID}"]`)
                                selectorPernoctante.setAttribute("fechaCheckOut", fechaCheckOut)
                                const selectorCheckInInfo = selectorPernoctante.querySelector(`[componente=checkOutInfo]`)
                                selectorCheckInInfo.textContent = "< " + fechaCheckOut
                                selectorCheckInInfo.removeAttribute("style")
                            }
                        },
                        eliminar: async function (checkOut) {
                            const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                            const pernoctanteUID = checkOut.pernoctanteUID
                            const instanciaUID = checkOut.instanciaUID
                            const instanciaUID_localProceso = casaVitini.utilidades.codigoFechaInstancia()
                            const metadatosPantallaCarga = {
                                mensaje: "Esperando al servidor...",
                                instanciaUID: instanciaUID_localProceso,
                            }
                            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(metadatosPantallaCarga)
                            const estadoReserva = {
                                zona: "administracion/reservas/detallesReserva/pernoctantes/eliminarCheckOutAdelantado",
                                pernoctanteUID: String(pernoctanteUID),
                                reservaUID: String(reservaUID)
                            }
                            const respuestaServidor = await casaVitini.shell.servidor(estadoReserva)
                            const selectorPantallaDeCarga = document.querySelectorAll(`[instanciaUID="${instanciaUID_localProceso}"][pantallaSuperpuesta=pantallaCargaSuperpuesta]`)
                            selectorPantallaDeCarga.forEach((pantalla) => {
                                pantalla.remove()
                            })
                            const selectorInstanciaRaiz = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                            if (!selectorInstanciaRaiz) {
                            }
                            if (respuestaServidor?.error) {
                                casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                const selectorPernoctante = document.querySelector(`[pernoctanteUID="${pernoctanteUID}"]`)
                                selectorPernoctante.removeAttribute("fechacheckout")
                                const selectorCheckInInfo = selectorPernoctante.querySelector(`[componente=checkOutInfo]`)
                                selectorCheckInInfo.style.display = "none"
                                selectorCheckInInfo.textContent = null
                            }
                        }
                    },
                    detallesPernoctante: {
                        ui: async function (data) {
                            const pernoctanteUID = data.pernoctanteUID
                            const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                            const main = document.querySelector("main")
                            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                            main.appendChild(ui)
                            const instanciaUID = ui.getAttribute("instanciaUID")
                            const contenedor = ui.querySelector("[componente=contenedor]")
                            const spinner = casaVitini.ui.componentes.spinner({
                                mensaje: "Esperando al servidor...."
                            })
                            contenedor.appendChild(spinner)
                            const respuestaServidor = await casaVitini.shell.servidor({
                                zona: "administracion/reservas/detallesReserva/pernoctantes/detallesDelPernoctantePorPernoctaneUID",
                                reservaUID,
                                pernoctanteUID: String(pernoctanteUID)
                            })
                            const uiRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                            if (!uiRenderizada) { return }
                            contenedor.innerHTML = null
                            contenedor.style.justifyContent = "flex - start";
                            if (respuestaServidor?.error) {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                const data = respuestaServidor.ok
                                const datosCliente = data.cliente
                                const datosPernoctante = data.pernoctante
                                const pernoctanteUID = datosPernoctante.componenteUID
                                const habitacionUID = datosPernoctante.habitacionUID
                                const nombreCompleto = datosCliente.nombreCompleto
                                const pasaporte = datosCliente.pasaporte
                                const tipoPernoctante = datosCliente.tipoPernoctante
                                const fechaCheckIn = datosPernoctante.fechaCheckIn
                                const fechaCheckOutAdelantado = datosPernoctante.fechaCheckOutAdelantado
                                if (tipoPernoctante === "cliente") {
                                    const clienteUID = datosCliente.clienteUID
                                    const mail = datosCliente.mail
                                    const telefono = datosCliente.telefono
                                    this.componentes.respuestaUnificadaUI({
                                        clienteUID,
                                        nombreCompleto,
                                        pernoctanteUID,
                                        telefono,
                                        pasaporte,
                                        mail,
                                        instanciaUID,
                                        fechaCheckIn,
                                        fechaCheckOutAdelantado,
                                        reservaUID,
                                        habitacionUID
                                    })
                                }
                                if (tipoPernoctante === "clientePool") {
                                    const metadatosTitualPool = {
                                        nombreTitular: detallesTitular.nombreTitular,
                                        pasaporteTitular: detallesTitular.pasaporteTitular,
                                        mailTitular: detallesTitular.mailTitular,
                                        telefonoTitular: detallesTitular.telefonoTitular,
                                        instanciaUID: instanciaUID
                                    }
                                    this.componentes.titularPool.UI(metadatosTitualPool)
                                }
                            }
                        },
                        componentes: {
                            desasociarClienteComoTitular: async function (metadatos) {
                                const instanciaUID = metadatos.instanciaUID
                                const reservaUID = metadatos.reservaUID
                                const instanciaUIDPantallaDeCarga = casaVitini.utilidades.codigoFechaInstancia()
                                const opcionesPantallaDeCarga = {
                                    instanciaUID: instanciaUIDPantallaDeCarga,
                                    mensaje: "Desasociando cliente como titular de la reserva"
                                }
                                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(opcionesPantallaDeCarga)
                                const pantallaDeCargaRenderizada = document.querySelector(`[pantallaSuperpuesta=pantallaCargaSuperpuesta][instanciaUID="${instanciaUIDPantallaDeCarga}"]`)
                                const metadatosPantallaDeCarga = {
                                    zona: "administracion/reservas/gestionTitular/desasociarClienteComoTitular",
                                    reservaUID: reservaUID
                                }
                                const respuestaServidor = await casaVitini.shell.servidor(metadatosPantallaDeCarga)
                                if (respuestaServidor?.error) {
                                    pantallaDeCargaRenderizada?.remove()
                                    casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                                }
                                if (respuestaServidor?.ok) {
                                    pantallaDeCargaRenderizada?.remove()
                                    const selectorNombreTitularRenderizado = document.querySelector(`[reservaUID="${reservaUID}"]`)
                                    const selectorNombreTitular = document.querySelector(`[dataReserva=nombreTitular]`)
                                    if (selectorNombreTitularRenderizado && selectorNombreTitular) {
                                        selectorNombreTitular.textContent = "(Ningún titular asignado)"
                                        const selectorBloqueTitular = document.querySelector(`[contenedor=titular]`)
                                        selectorBloqueTitular.removeAttribute("tipoTitular")
                                        selectorBloqueTitular.removeAttribute("titularUID")
                                    }
                                    const selectorDestinoRenderizado = document.querySelector(`[instanciaUID="${instanciaUID}"] [espacio=gestionTitular]`)
                                    if (selectorDestinoRenderizado) {
                                    }
                                }
                            },
                            detallesDelTitularUI: function (detallesDelTitular) {
                                const clienteUID = detallesDelTitular.clienteUID
                                const nombreTitular = detallesDelTitular.nombreTitular
                                const pasaporteTitular = detallesDelTitular.pasaporte
                                const tipoTitular = detallesDelTitular.tipoTitular
                                const mailTitular = detallesDelTitular.mail ? detallesDelTitular.mail : "(Sin mail)"
                                const telefonoTitular = detallesDelTitular.telefono ? detallesDelTitular.telefono : "(Sin teléfono)"
                                const detallesRapidosDelTitular = document.createElement("div")
                                detallesRapidosDelTitular.classList.add("tarjetaGris")
                                let contenedorDato = document.createElement("div")
                                contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                                let nombreDato = document.createElement("div")
                                nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                                nombreDato.textContent = "Nombre completo del titular"
                                contenedorDato.appendChild(nombreDato)
                                let valorDato = document.createElement("div")
                                valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                                valorDato.classList.add("negrita")
                                valorDato.textContent = nombreTitular
                                contenedorDato.appendChild(valorDato)
                                detallesRapidosDelTitular.appendChild(contenedorDato)
                                contenedorDato = document.createElement("div")
                                contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                                nombreDato = document.createElement("div")
                                nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                                nombreDato.textContent = "Pasaporte"
                                contenedorDato.appendChild(nombreDato)
                                valorDato = document.createElement("div")
                                valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                                valorDato.classList.add("negrita")
                                valorDato.textContent = pasaporteTitular
                                contenedorDato.appendChild(valorDato)
                                detallesRapidosDelTitular.appendChild(contenedorDato)
                                contenedorDato = document.createElement("div")
                                contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                                nombreDato = document.createElement("div")
                                nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                                nombreDato.textContent = "Teléfono"
                                contenedorDato.appendChild(nombreDato)
                                valorDato = document.createElement("div")
                                valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                                valorDato.classList.add("negrita")
                                valorDato.textContent = telefonoTitular
                                contenedorDato.appendChild(valorDato)
                                detallesRapidosDelTitular.appendChild(contenedorDato)
                                contenedorDato = document.createElement("div")
                                contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                                nombreDato = document.createElement("div")
                                nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                                nombreDato.textContent = "e - Mail"
                                contenedorDato.appendChild(nombreDato)
                                valorDato = document.createElement("div")
                                valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                                valorDato.classList.add("negrita")
                                valorDato.textContent = mailTitular
                                contenedorDato.appendChild(valorDato)
                                detallesRapidosDelTitular.appendChild(contenedorDato)
                                return detallesRapidosDelTitular
                            },
                            detallesDelTitularPoolUI: function (detallesDelTitular) {
                                const nombreTitular = detallesDelTitular.nombreTitular
                                const pasaporteTitular = detallesDelTitular.pasaporteTitular
                                const tipoTitular = "Titular pool"
                                const mailTitular = detallesDelTitular.mailTitular ? detallesDelTitular.mailTitular : "(Sin mail)"
                                const telefonoTitular = detallesDelTitular.telefonoTitular ? detallesDelTitular.telefonoTitular : "(Sin teléfono)"
                                const detallesRapidosDelTitular = document.createElement("div")
                                detallesRapidosDelTitular.classList.add("tarjetaGris")
                                let contenedorDato = document.createElement("div")
                                contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                                let nombreDato = document.createElement("div")
                                nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                                nombreDato.textContent = "Nombre completo del titular"
                                contenedorDato.appendChild(nombreDato)
                                let valorDato = document.createElement("div")
                                valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                                valorDato.classList.add("negrita")
                                valorDato.textContent = nombreTitular
                                contenedorDato.appendChild(valorDato)
                                detallesRapidosDelTitular.appendChild(contenedorDato)
                                contenedorDato = document.createElement("div")
                                contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                                nombreDato = document.createElement("div")
                                nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                                nombreDato.textContent = "Pasaporte"
                                contenedorDato.appendChild(nombreDato)
                                valorDato = document.createElement("div")
                                valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                                valorDato.classList.add("negrita")
                                valorDato.textContent = pasaporteTitular
                                contenedorDato.appendChild(valorDato)
                                detallesRapidosDelTitular.appendChild(contenedorDato)
                                contenedorDato = document.createElement("div")
                                contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                                nombreDato = document.createElement("div")
                                nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                                nombreDato.textContent = "Teléfono"
                                contenedorDato.appendChild(nombreDato)
                                valorDato = document.createElement("div")
                                valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                                valorDato.classList.add("negrita")
                                valorDato.textContent = telefonoTitular
                                contenedorDato.appendChild(valorDato)
                                detallesRapidosDelTitular.appendChild(contenedorDato)
                                contenedorDato = document.createElement("div")
                                contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                                nombreDato = document.createElement("div")
                                nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                                nombreDato.textContent = "e - Mail"
                                contenedorDato.appendChild(nombreDato)
                                valorDato = document.createElement("div")
                                valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                                valorDato.classList.add("negrita")
                                valorDato.textContent = mailTitular
                                contenedorDato.appendChild(valorDato)
                                detallesRapidosDelTitular.appendChild(contenedorDato)
                                return detallesRapidosDelTitular
                            },
                            botonCerrarFormularioNuevoCliente: function () {
                                const boton = document.createElement("div")
                                boton.classList.add("botonV1BlancoIzquierda")
                                boton.innerHTML = "Cerrar gestión del pernoctante"
                                boton.addEventListener("click", casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas)
                                boton
                            },
                            botonCerrar: function () {
                                const boton = document.createElement("div")
                                boton.classList.add("botonV1")
                                boton.innerHTML = "Cerrar gestión del pernoctante"
                                boton.addEventListener("click", casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas)
                                return boton
                            },
                            botonIrALaFichaDelClinete: function (clienteUID) {
                                const boton = document.createElement("a")
                                boton.classList.add("botonV1BlancoIzquierda")
                                boton.innerHTML = "Ir a la ficha del cliente"
                                boton.setAttribute("href", "/administracion/clientes/cliente:" + clienteUID)
                                boton.setAttribute("vista", "/administracion/clientes/cliente:" + clienteUID)
                                boton.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                                return boton
                            },
                            botonCambiarDeHabitacion: function (pernoctanteUID) {
                                const boton = document.createElement("div")
                                boton.classList.add("botonV1BlancoIzquierda")
                                boton.textContent = "Cambiar de habitación"
                                boton.setAttribute("componente", "botonOpcionClientePool")
                                boton.addEventListener("click", () => {
                                    document.addEventListener("click", casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.cambiarDeHabitacion.ocultarSelectoresCambioHabitacion)
                                    casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.cambiarDeHabitacion.mostrasSelectorCambioPernoctanteHabitacion(pernoctanteUID)
                                })
                                return boton
                            },
                            botonAsignarAHabitacion: function (pernoctanteUID) {
                                const boton = document.createElement("div")
                                boton.classList.add("botonV1BlancoIzquierda")
                                boton.textContent = "Asignar a una habitación"
                                boton.setAttribute("componente", "botonOpcionClientePool")
                                boton.addEventListener("click", () => {
                                    document.addEventListener("click", casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.cambiarDeHabitacion.ocultarSelectoresCambioHabitacion)
                                    casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.cambiarDeHabitacion.mostrasSelectorCambioPernoctanteHabitacion(pernoctanteUID)
                                })
                                return boton
                            },
                            botonEliminarPernoctanteDeLaReserva: function (pernoctanteUID) {
                                const boton = document.createElement("div")
                                boton.classList.add("botonV1BlancoIzquierda")
                                boton.setAttribute("componente", "botonOpcionClientePool")
                                boton.textContent = "Eliminar pernoctante de la reserva"
                                boton.addEventListener("click", () => {
                                    const datosEliminacion = {
                                        tipoEliminacion: "reserva",
                                        pernoctanteUID: pernoctanteUID
                                    }
                                    casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.propuestaEliminarPernoctanteUI(datosEliminacion)
                                })
                                return boton
                            },
                            botonModificarCheckIn: function (pernoctanteUID) {
                                const boton = document.createElement("div")
                                boton.classList.add(
                                    "botonV1BlancoIzquierda",
                                    "negrita"
                                )
                                boton.setAttribute("componente", "botonOpcionClientePool")
                                boton.setAttribute("tipoEliminacion", "habitacion")
                                boton.textContent = "Modificar checkin"
                                boton.addEventListener("click", () => {
                                    casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.checkin.UI(pernoctanteUID)
                                })
                                return boton
                            },
                            botonCheckOutAdelantado: function (pernoctanteUID) {
                                const boton = document.createElement("div")
                                boton.classList.add(
                                    "botonV1BlancoIzquierda",
                                    "negrita"
                                )
                                boton.setAttribute("componente", "botonOpcionClientePool")
                                boton.setAttribute("tipoEliminacion", "habitacion")
                                boton.textContent = "Checkout Adelantado"
                                boton.addEventListener("click", () => {
                                    casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.checkout.UI(pernoctanteUID)
                                })
                                return boton
                            },
                            botonCheckIn: function (pernoctanteUID) {
                                const boton = document.createElement("div")
                                boton.classList.add(
                                    "botonV1BlancoIzquierda",
                                    "negrita"
                                )
                                boton.setAttribute("componente", "botonOpcionClientePool")
                                boton.textContent = ">>> Realizar checkin"
                                boton.addEventListener("click", () => {
                                    casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.checkin.UI(pernoctanteUID)
                                })
                                return boton
                            },
                            botonEliminarPernoctaneDeLaHabitacion: function (pernoctanteUID) {
                                const boton = document.createElement("div")
                                boton.classList.add("botonV1BlancoIzquierda")
                                boton.setAttribute("componente", "botonOpcionClientePool")
                                boton.textContent = "Eliminar pernoctante solo de la habitación y mantenerlo en la reserva"
                                boton.addEventListener("click", () => {
                                    const datosEliminacion = {
                                        tipoEliminacion: "habitacion",
                                        pernoctanteUID: pernoctanteUID
                                    }
                                    casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.propuestaEliminarPernoctanteUI(datosEliminacion)
                                })
                                return boton
                            },
                            titulo: function (titulo) {
                                const tituloUI = document.createElement("p")
                                tituloUI.classList.add(
                                    "tituloGris",
                                    "padding14"
                                )
                                tituloUI.textContent = titulo
                                return tituloUI
                            },
                            infoUI: function (info) {
                                const infoUI = document.createElement("p")
                                infoUI.classList.add("padding14")
                                infoUI.textContent = info
                                return infoUI
                            },
                            botonCerrarCambiarTitular: function (instanciaUID) {
                                const boton = document.createElement("div")
                                boton.classList.add("botonV1BlancoIzquierda")
                                boton.innerHTML = "Cerrar formulario para cambiar de titular"
                                boton.setAttribute("boton", "cerrarCambiarTitular")
                                boton.addEventListener("click", () => {
                                    casaVitini.view.__sharedMethods__.detallesReservaUI.reservaUI.titular.componentes.cancelarCambiarTitular(instanciaUID)
                                })
                                return boton
                            },
                            cambiarTitular: function (instanciaUID) {
                                const selectorBotonCambiarTitular = document.querySelector(`[instanciaUID="${instanciaUID}"] [boton=cambiarTitular]`)
                                const selectorBotonDesasociar = document.querySelector(`[instanciaUID="${instanciaUID}"] [boton=desasociarTitular]`)
                                selectorBotonCambiarTitular.style.display = "none"
                                selectorBotonDesasociar.style.display = "none"
                                const selectorNuevoClienteUI = document.querySelector(`[instanciaUID="${instanciaUID}"] [formulario=nuevoCliente]`)
                                selectorNuevoClienteUI.removeAttribute("style")
                                const selectorbotonCerrarCambiarTitular = document.querySelector(`[instanciaUID="${instanciaUID}"] [boton=cerrarCambiarTitular]`)
                                selectorbotonCerrarCambiarTitular.removeAttribute("style")
                            },
                            respuestaUnificadaUI: function (data) {
                                const clienteUID = data.clienteUID
                                const nombreCompleto = data.nombreCompleto
                                const pasaporte = data.pasaporte
                                const mail = data.mail
                                const pernoctanteUID = data.pernoctanteUID
                                const telefono = data.telefono
                                const instanciaUID = data.instanciaUID
                                const fechaCheckIn = data.fechaCheckIn
                                const fechaCheckOutAdelantado = data.fechaCheckOutAdelantado
                                const habitacionUID = data.habitacionUID
                                const ui = document.querySelector(`[instanciaUID="${instanciaUID}"]`).querySelector("[componente=contenedor]")
                                if (ui) {
                                    const selectorPernoctante = document.querySelector(`[pernoctanteUID="${pernoctanteUID}"]`)
                                    const apartamentoUI = selectorPernoctante.closest("[apartamentoUI]")?.getAttribute("apartamentoUI") || "Pernoctante sin alojamiento asignado"
                                    const apartamentoIDV = selectorPernoctante.closest("[apartamentoIDV]")?.getAttribute("apartamentoIDV") || ""
                                    const habitacionUI = selectorPernoctante.closest("[habitacionIDV]")?.querySelector("[habitacionUI]")?.getAttribute("habitacionUI") || "Pernoctante sin habbitación asignada"
                                    const habitacionIDV = selectorPernoctante.closest("[habitacionIDV]")?.getAttribute("habitacionIDV") || ""
                                    const titulo = "Detalles del pernoctante"
                                    const tituloUI = this.titulo(titulo)
                                    ui.appendChild(tituloUI)
                                    const info = "Vista rápida de los detalles del pernoctante"
                                    const infoUI = this.infoUI(info)
                                    const banner = document.createElement("div")
                                    banner.classList.add(
                                        "flexVertical",
                                        "borderRadius12",
                                        "backgroundGrey1",
                                        "padding14",
                                        "gap6"
                                    )
                                    ui.appendChild(banner)
                                    const bannerReserva = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.componentesUI.
                                        bannerReservaMenus()
                                    banner.appendChild(bannerReserva)
                                    const bannerAlojamiento = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.
                                        alojamiento.
                                        componentesUI.
                                        bannerAlojamiento({
                                            apartamentoUI: apartamentoUI,
                                            apartamentoIDV: apartamentoIDV
                                        })
                                    banner.appendChild(bannerAlojamiento)
                                    const bannerHabitacion = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.
                                        alojamiento.
                                        componentesUI.
                                        bannerHabitacion({
                                            habitacionUI: habitacionUI,
                                            habitacionIDV: habitacionIDV
                                        })
                                    banner.appendChild(bannerHabitacion)
                                    const detallesDelTitularUI = this.detallesDelTitularUI({
                                        clienteUID: clienteUID,
                                        nombreTitular: nombreCompleto,
                                        pasaporte: pasaporte,
                                        tipoTitular: "titularCliente",
                                        mail: mail,
                                        telefono: telefono,
                                    })
                                    ui.appendChild(detallesDelTitularUI)
                                    const infoCheck = document.createElement("p")
                                    infoCheck.classList.add(
                                        "padding14"
                                    )
                                    infoCheck.textContent = "Operaciones de CheckIn CheckOut"
                                    ui.appendChild(infoCheck)
                                    if (!fechaCheckIn) {
                                        const botonCheckIn = this.botonCheckIn(pernoctanteUID)
                                        ui.appendChild(botonCheckIn)
                                    } else {
                                        const botonModificarCheckIn = this.botonModificarCheckIn(pernoctanteUID)
                                        ui.appendChild(botonModificarCheckIn)
                                        const botonCheckOutAdelantado = this.botonCheckOutAdelantado(pernoctanteUID)
                                        ui.appendChild(botonCheckOutAdelantado)
                                    }
                                    const infoGlobalCambioHab = document.createElement("p")
                                    infoGlobalCambioHab.classList.add(
                                        "padding14"
                                    )
                                    infoGlobalCambioHab.textContent = "Informacion y cambio de habitación"
                                    ui.appendChild(infoGlobalCambioHab)
                                    const botonIrALaFichaDelClinete = this.botonIrALaFichaDelClinete(clienteUID)
                                    ui.appendChild(botonIrALaFichaDelClinete)
                                    if (habitacionUID) {
                                        const botonCambiarDeHabitacion = this.botonCambiarDeHabitacion(pernoctanteUID)
                                        ui.appendChild(botonCambiarDeHabitacion)
                                    } else {
                                        const botonAsignarAHabitacion = this.botonAsignarAHabitacion(pernoctanteUID)
                                        ui.appendChild(botonAsignarAHabitacion)
                                    }
                                    const infoElim = document.createElement("p")
                                    infoElim.classList.add(
                                        "padding14"
                                    )
                                    infoElim.textContent = "Operaciones de eliminación del pernoctante"
                                    ui.appendChild(infoElim)
                                    const botonEliminarPernoctanteDeLaReserva = this.botonEliminarPernoctanteDeLaReserva(pernoctanteUID)
                                    ui.appendChild(botonEliminarPernoctanteDeLaReserva)
                                    if (habitacionUID) {
                                        const botonEliminarPernoctaneDeLaHabitacion = this.botonEliminarPernoctaneDeLaHabitacion(pernoctanteUID)
                                        ui.appendChild(botonEliminarPernoctaneDeLaHabitacion)
                                    }
                                    const botonCerrar = this.botonCerrar()
                                    ui.appendChild(botonCerrar)
                                }
                            },
                            cancelarCambiarTitular: function (instanciaUID) {
                                const selectorBotonCambiarTitular = document.querySelector(`[instanciaUID="${instanciaUID}"] [boton=cambiarTitular]`)
                                const selectorBotonDesasociar = document.querySelector(`[instanciaUID="${instanciaUID}"] [boton=desasociarTitular]`)
                                selectorBotonCambiarTitular.removeAttribute("style")
                                selectorBotonDesasociar.removeAttribute("style")
                                const selectorNuevoClienteUI = document.querySelector(`[instanciaUID="${instanciaUID}"] [formulario=nuevoCliente]`)
                                selectorNuevoClienteUI.style.display = "none"
                                const selectorbotonCerrarCambiarTitular = document.querySelector(`[instanciaUID="${instanciaUID}"] [boton=cerrarCambiarTitular]`)
                                selectorbotonCerrarCambiarTitular.style.display = "none"
                            },
                        },
                    },
                    cambiarDeHabitacion: {
                        mostrasSelectorCambioPernoctanteHabitacion: function (pernoctanteUID) {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            const habitacionActual = document.querySelector(`[pernoctanteUID="${pernoctanteUID}"]`)?.closest("[habitacionUID]")?.getAttribute("habitacionUID")
                            const selectorHabitaciones = document.querySelectorAll("[habitacionIDV]")
                            const selectorBotonAsignarAHabitacionRenderizado = document.querySelectorAll("[componente=botonMoverCliente]")
                            selectorBotonAsignarAHabitacionRenderizado.forEach(botonRenderizado => {
                                botonRenderizado.remove()
                            });
                            selectorHabitaciones.forEach((habitacion) => {
                                const habitacionUID = habitacion.getAttribute("habitacionUID")
                                if (habitacionUID !== habitacionActual) {
                                    const bloqueSelectorCambio = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.habitaciones.selectorCambioHabitacionUI(pernoctanteUID)
                                    habitacion.appendChild(bloqueSelectorCambio)
                                }
                            })
                        },
                        ocultarSelectoresCambioHabitacion: function (e) {
                            const componente = e.target?.getAttribute("componente")
                            if (componente === "botonOpcionClientePool") {
                                return
                            }
                            const selectorBotonMoverCliente = document.querySelectorAll("[componente=botonMoverCliente]")
                            selectorBotonMoverCliente.forEach(selectorBotonMoverCliente => {
                                selectorBotonMoverCliente.remove()
                            })
                            document.removeEventListener("click", casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.cambiarDeHabitacion.ocultarSelectoresCambioHabitacion)
                        },
                        cambiarPernoctanteHabitacion: async function (pernoctanteUID, e) {
                            const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                            const habitacionUID = e.target.closest("[habitacionUID]").getAttribute("habitacionUID")
                            const pernoctante = document.querySelector(`[pernoctanteUID="${pernoctanteUID}"]`)
                            const clienteUID = pernoctante.getAttribute("clienteUID")
                            const tipoCliente = pernoctante.getAttribute("tipoCliente")
                            const nombrePernoctante = pernoctante.querySelector("[componente=nombreCompleto]").textContent
                            const pasaportePernoctante = pernoctante.querySelector(`[componente=pasaporte]`).textContent
                            const fechaCheckIn = pernoctante.getAttribute("fechaCheckIn")
                            const fechaCheckOutAdelantado = pernoctante.getAttribute("fechaCheckOut")
                            document.querySelectorAll("[componente=botonMoverCliente]").forEach(botonMover => {
                                botonMover.remove()
                            })
                            document.querySelectorAll("[componente=opcionesCliente]").forEach(opcionesCliente => {
                                opcionesCliente.remove()
                            })
                            const transaccion = {
                                zona: "administracion/reservas/detallesReserva/alojamiento/cambiarPernoctanteDeHabitacion",
                                reservaUID: String(reservaUID),
                                habitacionDestinoUID: String(habitacionUID),
                                pernoctanteUID: String(pernoctanteUID)
                            }
                            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                            if (respuestaServidor?.error) {
                                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                document.querySelector(`[pernoctanteUID="${pernoctanteUID}"]`)
                                    .remove()
                                const datoPernoctante = {
                                    tipoPernoctante: tipoCliente,
                                    clienteUID: clienteUID,
                                    pernoctanteUID: pernoctanteUID,
                                    estadoAlojamiento: "alojado",
                                    fechaCheckIn: fechaCheckIn,
                                    fechaCheckOutAdelantado: fechaCheckOutAdelantado,
                                }
                                const bloqueClienteMover = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctanteUI(datoPernoctante)
                                const datosNombre = {
                                    nombreCompleto: nombrePernoctante
                                }
                                const pernoctanteNombreUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctanteNombreUI(datosNombre)
                                bloqueClienteMover.appendChild(pernoctanteNombreUI)
                                const datosPasaporte = {
                                    pasaporte: pasaportePernoctante
                                }
                                const pernoctantePasaporteUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctantePasaporteUI(datosPasaporte)
                                bloqueClienteMover.appendChild(pernoctantePasaporteUI)
                                const selectorHabitacionDestino = document.querySelector(`[habitacionUID="${habitacionUID}"]`)
                                selectorHabitacionDestino?.appendChild(bloqueClienteMover)
                                casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.controlEspacioPernoctantesSinAlojamiento()
                            }
                        },
                    },
                    eliminarPernoctante: async function (metadatos) {
                        const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                        const pernoctanteUID = metadatos.pernoctanteUID
                        const pernoctante = document
                            .querySelector(`[pernoctanteUID="${pernoctanteUID}"]`)
                        const tipoPernoctante = pernoctante.getAttribute("tipoCliente")
                        const tipoEliminacion = metadatos.tipoEliminacion
                        const clienteUID = pernoctante.getAttribute("clienteUID")
                        const nombreCompleto = pernoctante.querySelector("[componente=nombreCompleto]").textContent
                        const pasaporte = pernoctante.querySelector("[componente=pasaporte]").innerHTML
                        const fechaCheckIn = pernoctante.getAttribute("fechaCheckIn")
                        const fechaCheckOut = pernoctante.getAttribute("fechaCheckOut")
                        const instanciaUIDPantallaDeCarga = casaVitini.utilidades.codigoFechaInstancia()
                        const transaccion = {
                            zona: "administracion/reservas/detallesReserva/pernoctantes/eliminarPernoctanteReserva",
                            reservaUID: String(reservaUID),
                            pernoctanteUID: String(pernoctanteUID),
                            tipoEliminacion: tipoEliminacion
                        }
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        const metadatosPantallaCarga = {
                            mensaje: "Esperando al servidor...",
                            instanciaUID: instanciaUIDPantallaDeCarga,
                        }
                        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(metadatosPantallaCarga)
                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        const selectorPantallaDeCarga = document.querySelectorAll(`[instanciaUID="${instanciaUIDPantallaDeCarga}"][pantallaSuperpuesta=pantallaCargaSuperpuesta]`)
                        selectorPantallaDeCarga.forEach((pantalla) => {
                            pantalla.remove()
                        })
                        if (respuestaServidor?.error) {
                            casaVitini.shell.controladoresUI.ocultarMenusVolatiles()
                            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                        }
                        if (respuestaServidor?.ok) {
                            if (tipoEliminacion === "habitacion") {
                                const metadatosPernoctante = {
                                    tipoPernoctante: "cliente",
                                    clienteUID: clienteUID,
                                    pernoctanteUID: pernoctanteUID,
                                    tipoPernoctante: tipoPernoctante,
                                    estadoAlojamiento: "noAlojado",
                                    fechaCheckIn: fechaCheckIn,
                                    fechaCheckOutAdelantado: fechaCheckOut
                                }
                                const bloquePernoctantes = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctanteUI(metadatosPernoctante)
                                const metadatosNombre = {
                                    nombreCompleto: nombreCompleto,
                                    clienteUID: clienteUID,
                                }
                                const nombrePernoctante = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctanteNombreUI(metadatosNombre)
                                bloquePernoctantes.appendChild(nombrePernoctante)
                                const metadatosPasaporte = {
                                    pasaporte: pasaporte,
                                    clienteUID: clienteUID
                                }
                                const selectorPernoctanteRenderizado = document.querySelector(`[pernoctanteUID="${pernoctanteUID}"]`)
                                selectorPernoctanteRenderizado.remove()
                                const identificacionPernoctante = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctantePasaporteUI(metadatosPasaporte)
                                bloquePernoctantes.appendChild(identificacionPernoctante)
                                const zonaDestino = document.querySelector(`[componente=contenedorPernoctantesSinHabitacion]`)
                                zonaDestino.appendChild(bloquePernoctantes)
                                zonaDestino.classList.remove("elementoOcultoInicialmente")
                            }
                            if (tipoEliminacion === "reserva") {
                                const selectorPernoctanteRenderizado = document.querySelector(`[pernoctanteUID="${pernoctanteUID}"]`)
                                selectorPernoctanteRenderizado.remove()
                            }
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.controlEspacioPernoctantesSinAlojamiento()
                        }
                    },
                    controlEspacioPernoctantesSinAlojamiento: function () {
                        const selectorMarcoPernoctantesSinAlojamiento = document.querySelector("[componente=espacioPernoctantesSinAlojamiento]")
                        const selectorPernoctantes = selectorMarcoPernoctantesSinAlojamiento.querySelectorAll("[contenedor=pernoctante]")
                        if (selectorPernoctantes.length > 0) {
                            selectorMarcoPernoctantesSinAlojamiento.classList.remove("elementoOcultoInicialmente")
                        } else {
                            selectorMarcoPernoctantesSinAlojamiento.classList.add("elementoOcultoInicialmente")
                        }
                    },
                    gestionPernoctante: {
                        formularioNuevoPernoctanteEnHabitacionUI: async function (data) {
                            const habitacionIDV = data.habitacionIDV
                            const apartamentoIDV = data.apartamentoIDV
                            const habitacionUID = data.habitacionUID
                            const habitacionUI = data.habitacionUI
                            const apartamentoUI = data.apartamentoUI
                            const main = document.querySelector("main")
                            const reservaUID = main.querySelector("[reservaUID]").getAttribute("reservaUID")
                            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                            ui.setAttribute("operacion", "crearCliente")
                            ui.setAttribute("habitacionUID", habitacionUID)
                            const instanciaUID_ui = ui.getAttribute("instanciaUID")
                            main.appendChild(ui)
                            const contenedor = ui.querySelector("[componente=contenedor]")
                            const titulo = `Añadir pernoctante en la ${habitacionUI} del ${apartamentoUI}`
                            const tituloUI = this.componentes.titulo(titulo)
                            contenedor.appendChild(tituloUI)
                            const banner = document.createElement("div")
                            banner.classList.add(
                                "flexVertical",
                                "borderRadius12",
                                "backgroundGrey1",
                                "padding14",
                                "gap6"
                            )
                            contenedor.appendChild(banner)
                            const bannerReserva = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.
                                alojamiento.
                                componentesUI.
                                bannerReservaMenus()
                            banner.appendChild(bannerReserva)
                            const bannerAlojamiento = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.
                                alojamiento.
                                componentesUI.
                                bannerAlojamiento({
                                    apartamentoUI: apartamentoUI,
                                    apartamentoIDV: apartamentoIDV
                                })
                            banner.appendChild(bannerAlojamiento)
                            const bannerHabitacion = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.
                                alojamiento.
                                componentesUI.
                                bannerHabitacion({
                                    habitacionUI: habitacionUI,
                                    habitacionIDV: habitacionIDV
                                })
                            banner.appendChild(bannerHabitacion)
                            const info = "Añade un pernoctante en la habitación, en el buscador rápido puedes buscar si ya existe el cliente a añadir como pernoctante o puedes crear uno directamente aquí y añadirlo a la habitación"
                            const infoUI = this.componentes.infoUI(info)
                            contenedor.appendChild(infoUI)
                            const buscadorUI = this.componentes.buscadorRapido.UI({
                                reservaUID: reservaUID,
                                habitacionUID: habitacionUID,
                                metodoFinal: "view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.gestionPernoctante.componentes.buscadorRapido.anadirPernoctanteTransaccionDesdeBuscadorRapido"
                            })
                            contenedor.appendChild(buscadorUI)
                            const nuevoClienteUI = this.componentes.nuevoClienteOTitular.UI({
                                metodoFinal: "view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.gestionPernoctante.componentes.guardarNuevoClienteYAnadirloComoPernoctnante",
                                habitacionUID: habitacionUID,
                                reservaUID: reservaUID,
                                tituloBoton: "Crear nuevo cliente e insertarlo en la habitación",
                                tituloUI: "Crear nuevo cliente e insertarlo como pernoctante de la habiación"
                            })
                            contenedor.appendChild(nuevoClienteUI)
                            const botonCerrar = this.componentes.botonCerrar()
                            contenedor.appendChild(botonCerrar)
                        },
                        componentes: {
                            buscadorRapido: {
                                UI: function (data) {
                                    const metodoFinal = data.metodoFinal
                                    const reservaUID = data.reservaUID
                                    const habitacionUID = data?.habitacionUID
                                    const contenedor = document.createElement("div")
                                    contenedor.classList.add(
                                        "flexVertical",
                                        "padding6",
                                        "borderRadius20",
                                        "borderGrey1",
                                        "gap6"
                                    )
                                    contenedor.setAttribute("contenedor", "buscador")
                                    const info = document.createElement("div")
                                    info.classList.add("adminsitracion_reservas_detallesReservas_gestionTitular_infoBuscador")
                                    const campoBuscador = document.createElement("input")
                                    campoBuscador.classList.add("botonV1BlancoIzquierda_noSeleccionable")
                                    campoBuscador.placeholder = "Buscar un cliente existente"
                                    campoBuscador.setAttribute("campo", "buscador")
                                    campoBuscador.addEventListener("input", (e) => {
                                        this.listaResultadosUI({
                                            e,
                                            metodoFinal,
                                            reservaUID,
                                            habitacionUID
                                        })
                                    })
                                    contenedor.appendChild(campoBuscador)
                                    return contenedor
                                },
                                listaResultadosUI: async function (data) {
                                    const evento = data.e
                                    const elemento = evento.target
                                    const terminoBusqueda = elemento.value
                                    const metodoFinal = data.metodoFinal
                                    const reservaUID = data.reservaUID
                                    const habitacionUID = data?.habitacionUID
                                    const instanciaUIDBuscador = casaVitini.utilidades.codigoFechaInstancia()
                                    const buscadorUI = elemento.closest(`[contenedor=buscador]`)
                                    const instanciaUID = elemento.closest(`[componente=advertenciaInmersiva]`).getAttribute("instanciaUID")
                                    const campoVacio = elemento.value.length
                                    if (campoVacio === 0) {
                                        clearTimeout(casaVitini.componentes.temporizador);
                                        elemento.closest(`[contenedor=buscador]`).querySelector(`[instanciaUIDBuscador]`)?.remove()
                                        return
                                    }
                                    const listaResultados_r = document.querySelector("[componente=buscadorRapidoCliente]")
                                    if (!listaResultados_r) {
                                        const listaResultados = document.createElement("div")
                                        listaResultados.setAttribute("componente", "buscadorRapidoCliente")
                                        listaResultados.style.alignItems = "stretch"
                                        listaResultados.classList.add(
                                            "flexVertical",
                                            "gap6",
                                            "borderRadius14"
                                        )
                                        buscadorUI.appendChild(listaResultados)
                                    }
                                    const listaResultados_s = buscadorUI.querySelector("[componente=buscadorRapidoCliente]")
                                    listaResultados_s.setAttribute("instanciaUIDBuscador", instanciaUIDBuscador)
                                    const conntenedorInfo_r = buscadorUI.querySelector("[componente=info]")
                                    if (!conntenedorInfo_r) {
                                        listaResultados_s.innerHTML = null
                                        const conntenedorInfo = document.createElement("div")
                                        conntenedorInfo.setAttribute("componente", "info")
                                        conntenedorInfo.classList.add("efectoAparicion", "sobreControlAnimacionGlobal", "padding10")
                                        listaResultados_s.appendChild(conntenedorInfo)
                                        const info = document.createElement("div")
                                        info.setAttribute("data", "info")
                                        conntenedorInfo.appendChild(info)
                                    }
                                    const conntenedorInfo_s = buscadorUI.querySelector("[componente=info] [data=info]")
                                    conntenedorInfo_s.textContent = "Buscando..."
                                    clearTimeout(casaVitini.componentes.temporizador);
                                    casaVitini.componentes.temporizador = setTimeout(() => {
                                        this.transactor({
                                            terminoBusqueda: terminoBusqueda,
                                            instanciaUIDBuscador: instanciaUIDBuscador,
                                            instanciaUID,
                                            metodoFinal,
                                            reservaUID,
                                            habitacionUID
                                        })
                                    }, 1500);
                                },
                                transactor: async function (data) {
                                    const terminoBusqueda = data.terminoBusqueda
                                    const instanciaUIDBuscador = data.instanciaUIDBuscador
                                    const metodoFinal = data.metodoFinal
                                    const reservaUID = data.reservaUID
                                    const instanciaUID = data.instanciaUID
                                    const habitacionUID = data.habitacionUID
                                    const transaccion = {
                                        zona: "administracion/clientes/buscar",
                                        tipoBusqueda: "rapido",
                                        buscar: terminoBusqueda
                                    }
                                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                                    const listaBuscadorRenderizada = document.querySelector(`[instanciaUIDBuscador="${instanciaUIDBuscador}"]`)
                                    if (!listaBuscadorRenderizada) {
                                        return
                                    }
                                    if (respuestaServidor?.error) {
                                        return listaBuscadorRenderizada.querySelector("[data=info]").innerHTML = respuestaServidor?.error
                                    } else if (respuestaServidor?.tipo === "ROL") {
                                        return
                                    }
                                    const resultadosClientes = respuestaServidor?.clientes
                                    if (resultadosClientes.length === 0) {
                                        return listaBuscadorRenderizada.querySelector("[data=info]").innerHTML = "Nada encontrado"
                                    }
                                    listaBuscadorRenderizada.innerHTML = null
                                    resultadosClientes.forEach((clienteEncontrado) => {
                                        const clienteUID = clienteEncontrado.clienteUID
                                        const nombre = clienteEncontrado.nombre
                                        const primerApellido = clienteEncontrado.primerApellido
                                        const segundoApellido = clienteEncontrado.segundoApellido
                                        const pasaporte = clienteEncontrado.pasaporte
                                        const bloqueCliente = document.createElement("div")
                                        bloqueCliente.classList.add(
                                            "flexVertical",
                                            "comportamientoBoton",
                                            "padding6",
                                            "borderRadius14"
                                        )
                                        bloqueCliente.setAttribute("componente", "elementoResultadosBuscadorRapido")
                                        bloqueCliente.addEventListener("click", (e) => {
                                            return casaVitini.utilidades.ejecutarFuncionPorNombreDinamicoConContexto({
                                                ruta: metodoFinal,
                                                args: {
                                                    clienteUID,
                                                    reservaUID,
                                                    instanciaUID,
                                                    habitacionUID
                                                }
                                            })
                                        })
                                        const filaNombre = document.createElement("p")
                                        filaNombre.classList.add("administracionReservaDetallesBuscadorRapidoBloqueClienteFilaNombre")
                                        filaNombre.textContent = `${nombre} ${primerApellido} ${segundoApellido}`
                                        filaNombre.setAttribute("componente", "elementoResultadosBuscadorRapido")
                                        bloqueCliente.appendChild(filaNombre)
                                        const filaPasaporte = document.createElement("p")
                                        filaPasaporte.classList.add("administracionReservaDetallesBuscadorRapidoBloqueClienteFilaPasaporte")
                                        filaPasaporte.textContent = pasaporte
                                        filaPasaporte.setAttribute("componente", "elementoResultadosBuscadorRapido")
                                        bloqueCliente.appendChild(filaPasaporte)
                                        listaBuscadorRenderizada.appendChild(bloqueCliente)
                                    })
                                },
                                anadirPernoctanteTransaccionDesdeBuscadorRapido: async function (data) {
                                    const reservaUID = data.reservaUID
                                    const clienteUID = data.clienteUID
                                    const habitacionUID = data.habitacionUID
                                    const instanciaUIDPantallaDeCarga = casaVitini.utilidades.codigoFechaInstancia()
                                    const instanciaUID = data.instanciaUID
                                    casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
                                        mensaje: "Añadiento al cliente como pernoctante de la habitacion...",
                                        instanciaUID: instanciaUIDPantallaDeCarga,
                                    })
                                    const respuestaServidor = await casaVitini.shell.servidor({
                                        zona: "administracion/reservas/detallesReserva/alojamiento/anadirPernoctanteHabitacion",
                                        reservaUID,
                                        clienteUID: String(clienteUID),
                                        habitacionUID
                                    })
                                    const selectorPantallaDeCarga = document.querySelector(`[instanciaUID="${instanciaUIDPantallaDeCarga}"]`)
                                    selectorPantallaDeCarga?.remove()
                                    const selectorBloqueAnadirPernoctante = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                                    if (!selectorBloqueAnadirPernoctante) { return }
                                    if (respuestaServidor?.error) {
                                        return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                                    }
                                    if (respuestaServidor?.ok) {
                                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                        const pernoctante = respuestaServidor.pernoctante
                                        const cliente = respuestaServidor.cliente
                                        const clienteUID = cliente.clienteUID
                                        const pernoctanteUID = pernoctante.componenteUID
                                        const nombre = cliente.nombre
                                        const primerApellido = cliente.primerApellido
                                        const segundoApellido = cliente.segundoApellido
                                        const pasaporte = cliente.pasaporte
                                        const bloquePernoctantes = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctanteUI({
                                            tipoPernoctante: "cliente",
                                            clienteUID: clienteUID,
                                            pernoctanteUID: pernoctanteUID,
                                            estadoAlojamiento: "alojado"
                                        })
                                        const nombrePernoctante = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctanteNombreUI({
                                            nombreCompleto: `${nombre} ${primerApellido} ${segundoApellido}`,
                                            clienteUID: clienteUID,
                                        })
                                        bloquePernoctantes.appendChild(nombrePernoctante)
                                        const identificacionPernoctante = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctantePasaporteUI({
                                            pasaporte: pasaporte,
                                            clienteUID: clienteUID
                                        })
                                        bloquePernoctantes.appendChild(identificacionPernoctante)
                                        const habitacionDestino = document.querySelector(`[habitacionUID="${habitacionUID}"]`)
                                        habitacionDestino.appendChild(bloquePernoctantes)
                                    }
                                },
                            },
                            nuevoClienteOTitular: {
                                UI: function (data) {
                                    const metodoFinal = data.metodoFinal
                                    const tituloUI = data.tituloUI
                                    const tituloBoton = data.tituloBoton
                                    const reservaUID = data.reservaUID
                                    const habitacionUID = data?.habitacionUID
                                    const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                                    const nuevoClienteUI = document.createElement("details")
                                    nuevoClienteUI.classList.add(
                                        "flexVertical",
                                        "padding6",
                                        "borderRadius20",
                                    )
                                    nuevoClienteUI.setAttribute("instanciaUID", instanciaUID)
                                    nuevoClienteUI.setAttribute("formulario", "nuevoCliente")
                                    const info = document.createElement("summary")
                                    info.classList.add(
                                        "negrita",
                                        "textoCentrado",
                                        "padding14",
                                        "borderRadius14"
                                    )
                                    info.textContent = tituloUI
                                    nuevoClienteUI.appendChild(info)
                                    const form = document.createElement("div")
                                    form.classList.add(
                                        "flexVertical",
                                        "gap10"
                                    )
                                    nuevoClienteUI.appendChild(form)
                                    const nombreUI = document.createElement("div")
                                    nombreUI.classList.add(
                                        "flexVertical",
                                        "paddingLateral14"
                                    )
                                    nombreUI.textContent = "Nombre (Obligatorio)"
                                    form.appendChild(nombreUI)
                                    const campoNombre = document.createElement("input")
                                    campoNombre.classList.add("botonV1BlancoIzquierda_campo")
                                    campoNombre.setAttribute("campo", "nombre")
                                    campoNombre.setAttribute("formulario", "AnadirPernoctante")
                                    campoNombre.placeholder = "Nombre (obligatiorio)"
                                    form.appendChild(campoNombre)
                                    const primerApellidoUI = document.createElement("div")
                                    primerApellidoUI.classList.add(
                                        "flexVertical",
                                        "paddingLateral14"
                                    )
                                    primerApellidoUI.textContent = "Primer apellido"
                                    form.appendChild(primerApellidoUI)
                                    const primerApellido = document.createElement("input")
                                    primerApellido.classList.add("botonV1BlancoIzquierda_campo")
                                    primerApellido.setAttribute("campo", "primerApellido")
                                    primerApellido.setAttribute("formulario", "AnadirPernoctante")
                                    primerApellido.placeholder = "Primer apellido"
                                    form.appendChild(primerApellido)
                                    const segundoApellidoUI = document.createElement("div")
                                    segundoApellidoUI.classList.add(
                                        "flexVertical",
                                        "paddingLateral14"
                                    )
                                    segundoApellidoUI.textContent = "Segundo apellido"
                                    form.appendChild(segundoApellidoUI)
                                    const segundoApellido = document.createElement("input")
                                    segundoApellido.classList.add("botonV1BlancoIzquierda_campo")
                                    segundoApellido.setAttribute("campo", "segundoApellido")
                                    segundoApellido.setAttribute("formulario", "AnadirPernoctante")
                                    segundoApellido.placeholder = "Segundo apellido"
                                    form.appendChild(segundoApellido)
                                    const pasaporteUI = document.createElement("div")
                                    pasaporteUI.classList.add(
                                        "flexVertical",
                                        "paddingLateral14"
                                    )
                                    pasaporteUI.textContent = "Pasaporte (Obligatorio)"
                                    form.appendChild(pasaporteUI)
                                    const pasaporte = document.createElement("input")
                                    pasaporte.classList.add("botonV1BlancoIzquierda_campo")
                                    pasaporte.setAttribute("campo", "pasaporte")
                                    pasaporte.setAttribute("formulario", "AnadirPernoctante")
                                    pasaporte.placeholder = "Pasaporte (obligatorio)"
                                    form.appendChild(pasaporte)
                                    const telefonoUI = document.createElement("div")
                                    telefonoUI.classList.add(
                                        "flexVertical",
                                        "paddingLateral14"
                                    )
                                    telefonoUI.textContent = "Telefono"
                                    form.appendChild(telefonoUI)
                                    const telefono = document.createElement("input")
                                    telefono.classList.add("botonV1BlancoIzquierda_campo")
                                    telefono.setAttribute("campo", "telefono")
                                    telefono.setAttribute("formulario", "AnadirPernoctante")
                                    telefono.placeholder = "Teléfono"
                                    form.appendChild(telefono)
                                    const correoUI = document.createElement("div")
                                    correoUI.classList.add(
                                        "flexVertical",
                                        "paddingLateral14"
                                    )
                                    correoUI.textContent = "Mail"
                                    form.appendChild(correoUI)
                                    const correoElecotronico = document.createElement("input")
                                    correoElecotronico.classList.add("botonV1BlancoIzquierda_campo")
                                    correoElecotronico.setAttribute("campo", "correoElectronico")
                                    correoElecotronico.setAttribute("formulario", "AnadirPernoctante")
                                    correoElecotronico.placeholder = "Correo electrónico"
                                    form.appendChild(correoElecotronico)
                                    const botonGuardarNuevoCliente = document.createElement("div")
                                    botonGuardarNuevoCliente.setAttribute("boton", "crearCliente")
                                    botonGuardarNuevoCliente.classList.add("botonV1BlancoIzquierda")
                                    botonGuardarNuevoCliente.textContent = tituloBoton
                                    botonGuardarNuevoCliente.addEventListener("click", (e) => {
                                        const campos = e.target.closest("[formulario=nuevoCliente]").querySelectorAll("[campo]")
                                        const datos = {}
                                        campos.forEach((e) => {
                                            const nombreCampo = e.getAttribute("campo")
                                            const valorCampo = e.value
                                            datos[nombreCampo] = valorCampo
                                        })
                                        return casaVitini.utilidades.ejecutarFuncionPorNombreDinamicoConContexto({
                                            ruta: metodoFinal,
                                            args: {
                                                reservaUID,
                                                instanciaUID,
                                                habitacionUID,
                                                datos
                                            }
                                        })
                                    })
                                    form.appendChild(botonGuardarNuevoCliente)
                                    return nuevoClienteUI
                                },
                            },
                            guardarNuevoClienteYSustituirloPorElClientePoolActual: async function (instanciaUID) {
                                const pernoctanteUID_DesdeInstancia = document.querySelector(`[instanciaUID="${instanciaUID}"]`).getAttribute("pernoctanteUID")
                                const instanciaUID_pantallaPropuestaConfirmada = casaVitini.utilidades.codigoFechaInstancia()
                                const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                                const campos = document.querySelector(`[instanciaUID="${instanciaUID}"] [formulario=nuevoCliente]`).querySelectorAll("[campo]")
                                const metadatosPantallaCarga = {
                                    mensaje: "Esperando al servidor...",
                                    instanciaUID: instanciaUID_pantallaPropuestaConfirmada,
                                }
                                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(metadatosPantallaCarga)
                                const selectorPantallaDeCarga = document.querySelectorAll(`[instanciaUID="${instanciaUID_pantallaPropuestaConfirmada}"]`)
                                const transaccion = {
                                    zona: "administracion/reservas/guardarNuevoClienteYSustituirloPorElClientePoolActual",
                                    reserva: Number(reservaUID),
                                    pernoctanteUID: Number(pernoctanteUID_DesdeInstancia)
                                }
                                campos.forEach((campo) => {
                                    const nombreCampo = campo.getAttribute("campo")
                                    const valorCampo = campo.value
                                    transaccion[nombreCampo] = valorCampo
                                })
                                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                                if (!selectorPantallaDeCarga) {
                                }
                                selectorPantallaDeCarga.forEach((pantalla) => {
                                    pantalla.remove()
                                })
                                if (respuestaServidor?.error) {
                                    casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                                }
                                if (respuestaServidor?.ok) {
                                    const nuevoClienteUID = respuestaServidor.nuevoClienteUID
                                    const nombreCompleto = respuestaServidor.nombreCompleto
                                    const pasaporte = respuestaServidor.pasaporte
                                    const habitacionUID = respuestaServidor.habitacionUID
                                    const selectorInstanciaRaiz = document.querySelectorAll(`[instanciaUID="${instanciaUID}"]`)
                                    selectorInstanciaRaiz.forEach((pantalla) => {
                                        pantalla.remove()
                                    })
                                    const selectorContenedorPernoctanteAntiguo = document.querySelector(`[contenedor=pernoctante][pernoctanteUID="${pernoctanteUID_DesdeInstancia}"]`)
                                    selectorContenedorPernoctanteAntiguo.remove()
                                    if (habitacionUID) {
                                        const selectorHabitacion = document.querySelector(`[habitacionUID="${habitacionUID}"]`)
                                        let metadatos = {
                                            tipoPernoctante: "cliente",
                                            clienteUID: nuevoClienteUID,
                                            pernoctanteUID: pernoctanteUID_DesdeInstancia,
                                            estadoAlojamiento: "alojado",
                                        }
                                        const bloquePernoctantes = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctanteUI(metadatos)
                                        metadatos = {
                                            nombreCompleto: nombreCompleto,
                                        }
                                        const nombrePernoctante = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctanteNombreUI(metadatos)
                                        bloquePernoctantes.appendChild(nombrePernoctante)
                                        metadatos = {
                                            pasaporte: pasaporte,
                                        }
                                        const identificacionPernoctante = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctantePasaporteUI(metadatos)
                                        bloquePernoctantes.appendChild(identificacionPernoctante)
                                        selectorHabitacion.appendChild(bloquePernoctantes)
                                    } else {
                                        const metadatosBloquePernoctantes = {
                                            tipoPernoctante: "cliente",
                                            clienteUID: nuevoClienteUID,
                                            pernoctanteUID: pernoctanteUID_DesdeInstancia,
                                            estadoAlojamiento: "noAlojado"
                                        }
                                        const bloquePernoctantes = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctanteUI(metadatosBloquePernoctantes)
                                        const metadatosNombreUi = {
                                            nombreCompleto: nombreCompleto,
                                        }
                                        const nombrePernoctante = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctanteNombreUI(metadatosNombreUi)
                                        bloquePernoctantes.appendChild(nombrePernoctante)
                                        const metadatosPasaporte = {
                                            pasaporte: pasaporte,
                                        }
                                        const identificacionPernoctante = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctantePasaporteUI(metadatosPasaporte)
                                        bloquePernoctantes.appendChild(identificacionPernoctante)
                                        const zonaDestino = document.querySelector(`[componente=contenedorPernoctantesSinHabitacion]`)
                                        zonaDestino.appendChild(bloquePernoctantes)
                                        casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.controlEspacioPernoctantesSinAlojamiento()
                                    }
                                }
                            },
                            guardarNuevoClienteYAnadirloComoPernoctnante: async function (data) {
                                const instanciaUID_contenedorNuevoPernoctanteUI = data.instanciaUID
                                const habitacionUID = data.habitacionUID
                                const reservaUID = data.reservaUID
                                const instanciaUIDPantallaDeCarga = casaVitini.utilidades.codigoFechaInstancia()
                                const datos = data.datos
                                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
                                    mensaje: "Creando cliente y asignándolo a la habitación...",
                                    instanciaUID: instanciaUIDPantallaDeCarga,
                                })
                                await casaVitini.utilidades.ralentizador(2000)
                                const respuestaServidor = await casaVitini.shell.servidor({
                                    zona: "administracion/reservas/detallesReserva/pernoctantes/crearClienteDesdeReservaYAnadirloAreserva",
                                    reservaUID: reservaUID,
                                    habitacionUID: habitacionUID,
                                    ...datos
                                }
                                )
                                const selectorPantallaDeCarga = document.querySelector(`[instanciaUID="${instanciaUIDPantallaDeCarga}"]`)
                                if (!selectorPantallaDeCarga) {
                                    return
                                }
                                selectorPantallaDeCarga.remove()
                                if (respuestaServidor?.error) {
                                    return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor.error)
                                }
                                if (respuestaServidor?.ok) {
                                    const selectorAnadirPernoctanteRedenrizada = document.querySelector(`[instanciaUID="${instanciaUID_contenedorNuevoPernoctanteUI}"]`)
                                    if (selectorAnadirPernoctanteRedenrizada) {
                                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                    }
                                    const datosNuevoCliente = respuestaServidor.nuevoCliente
                                    const nombre = datosNuevoCliente.nombre
                                    const primerApellido = datosNuevoCliente.primerApellido ? datosNuevoCliente.primerApellido : ""
                                    const segundoApellido = datosNuevoCliente.segundoApellido ? datosNuevoCliente.segundoApellido : ""
                                    const pasaporte = datosNuevoCliente.pasaporte
                                    const telefono = datosNuevoCliente.telefono
                                    const correoElectronico = datosNuevoCliente.correoElectronico
                                    const pernoctanteUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctanteUI({
                                        tipoPernoctante: "cliente",
                                        clienteUID: respuestaServidor?.nuevoUIDCliente,
                                        pernoctanteUID: respuestaServidor?.nuevoUIDPernoctante,
                                        estadoAlojamiento: "alojado"
                                    })
                                    const pernoctanteNombreUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctanteNombreUI({
                                        clienteUID: respuestaServidor?.nuevoUIDCliente,
                                        nombreCompleto: `${nombre} ${primerApellido} ${segundoApellido}`
                                    })
                                    const pernoctantePasaporteUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.alojamiento.pernoctantes.pernoctantePasaporteUI({
                                        clienteUID: respuestaServidor?.nuevoUIDCliente,
                                        pasaporte: datos.pasaporte
                                    })
                                    pernoctanteUI.appendChild(pernoctanteNombreUI)
                                    pernoctanteUI.appendChild(pernoctantePasaporteUI)
                                    const selectorHabitacionDestino = document.querySelector(`[habitacionUID="${habitacionUID}"]`)
                                    selectorHabitacionDestino.appendChild(pernoctanteUI)
                                }
                            },
                            bannerPernoctanteUI: function (detallesDelTitular) {
                                const clienteUID = detallesDelTitular.clienteUID
                                const nombreTitular = detallesDelTitular.nombreTitular
                                const pasaporteTitular = detallesDelTitular.pasaporteTitular
                                const tipoTitular = detallesDelTitular.tipoTitular
                                const mailTitular = detallesDelTitular.mailTitular ? detallesDelTitular.mailTitular : "(Sin mail)"
                                const telefonoTitular = detallesDelTitular.telefonoTitular ? detallesDelTitular.telefonoTitular : "(Sin teléfono)"
                                const detallesRapidosDelTitular = document.createElement("div")
                                detallesRapidosDelTitular.classList.add("tarjetaGris")
                                let contenedorDato = document.createElement("div")
                                contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                                let nombreDato = document.createElement("div")
                                nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                                nombreDato.textContent = "Nombre completo del titular"
                                contenedorDato.appendChild(nombreDato)
                                let valorDato = document.createElement("div")
                                valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                                valorDato.classList.add("negrita")
                                valorDato.textContent = nombreTitular
                                contenedorDato.appendChild(valorDato)
                                detallesRapidosDelTitular.appendChild(contenedorDato)
                                contenedorDato = document.createElement("div")
                                contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                                nombreDato = document.createElement("div")
                                nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                                nombreDato.textContent = "Pasaporte"
                                contenedorDato.appendChild(nombreDato)
                                valorDato = document.createElement("div")
                                valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                                valorDato.classList.add("negrita")
                                valorDato.textContent = pasaporteTitular
                                contenedorDato.appendChild(valorDato)
                                detallesRapidosDelTitular.appendChild(contenedorDato)
                                contenedorDato = document.createElement("div")
                                contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                                nombreDato = document.createElement("div")
                                nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                                nombreDato.textContent = "Teléfono"
                                contenedorDato.appendChild(nombreDato)
                                valorDato = document.createElement("div")
                                valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                                valorDato.classList.add("negrita")
                                valorDato.textContent = telefonoTitular
                                contenedorDato.appendChild(valorDato)
                                detallesRapidosDelTitular.appendChild(contenedorDato)
                                contenedorDato = document.createElement("div")
                                contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                                nombreDato = document.createElement("div")
                                nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                                nombreDato.textContent = "e - Mail"
                                contenedorDato.appendChild(nombreDato)
                                valorDato = document.createElement("div")
                                valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                                valorDato.classList.add("negrita")
                                valorDato.textContent = mailTitular
                                contenedorDato.appendChild(valorDato)
                                detallesRapidosDelTitular.appendChild(contenedorDato)
                                return detallesRapidosDelTitular
                            },
                            detallesDelTitularPoolUI: function (detallesDelTitular) {
                                const nombreTitular = detallesDelTitular.nombreTitular
                                const pasaporteTitular = detallesDelTitular.pasaporteTitular
                                const tipoTitular = "Titular pool"
                                const mailTitular = detallesDelTitular.mailTitular ? detallesDelTitular.mailTitular : "(Sin mail)"
                                const telefonoTitular = detallesDelTitular.telefonoTitular ? detallesDelTitular.telefonoTitular : "(Sin teléfono)"
                                const detallesRapidosDelTitular = document.createElement("div")
                                detallesRapidosDelTitular.classList.add("tarjetaGris")
                                let contenedorDato = document.createElement("div")
                                contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                                let nombreDato = document.createElement("div")
                                nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                                nombreDato.textContent = "Nombre completo del titular"
                                contenedorDato.appendChild(nombreDato)
                                let valorDato = document.createElement("div")
                                valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                                valorDato.classList.add("negrita")
                                valorDato.textContent = nombreTitular
                                contenedorDato.appendChild(valorDato)
                                detallesRapidosDelTitular.appendChild(contenedorDato)
                                contenedorDato = document.createElement("div")
                                contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                                nombreDato = document.createElement("div")
                                nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                                nombreDato.textContent = "Pasaporte"
                                contenedorDato.appendChild(nombreDato)
                                valorDato = document.createElement("div")
                                valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                                valorDato.classList.add("negrita")
                                valorDato.textContent = pasaporteTitular
                                contenedorDato.appendChild(valorDato)
                                detallesRapidosDelTitular.appendChild(contenedorDato)
                                contenedorDato = document.createElement("div")
                                contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                                nombreDato = document.createElement("div")
                                nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                                nombreDato.textContent = "Teléfono"
                                contenedorDato.appendChild(nombreDato)
                                valorDato = document.createElement("div")
                                valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                                valorDato.classList.add("negrita")
                                valorDato.textContent = telefonoTitular
                                contenedorDato.appendChild(valorDato)
                                detallesRapidosDelTitular.appendChild(contenedorDato)
                                contenedorDato = document.createElement("div")
                                contenedorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_contenedor")
                                nombreDato = document.createElement("div")
                                nombreDato.classList.add("administracion_reservas_detallesReserva_infoTitular_nombreDato")
                                nombreDato.textContent = "e - Mail"
                                contenedorDato.appendChild(nombreDato)
                                valorDato = document.createElement("div")
                                valorDato.classList.add("administracion_reservas_detallesReserva_infoTitular_dato")
                                valorDato.classList.add("negrita")
                                valorDato.textContent = mailTitular
                                contenedorDato.appendChild(valorDato)
                                detallesRapidosDelTitular.appendChild(contenedorDato)
                                return detallesRapidosDelTitular
                            },
                            botonCerrarFormularioNuevoCliente: function () {
                                const boton = document.createElement("div")
                                boton.classList.add("botonV1BlancoIzquierda")
                                boton.innerHTML = "Cerrar gestión del titular de la reserva"
                                boton.addEventListener("click", casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas)
                                boton
                            },
                            botonCerrar: function () {
                                const boton = document.createElement("div")
                                boton.classList.add("botonV1")
                                boton.innerHTML = "Cerrar y volver a la reserva"
                                boton.addEventListener("click", casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas)
                                return boton
                            },
                            botonIrALaFichaDelClinete: function (clienteUID) {
                                const boton = document.createElement("a")
                                boton.classList.add("botonV1BlancoIzquierda")
                                boton.innerHTML = "Ir a la ficha del cliente"
                                boton.setAttribute("href", "/administracion/clientes/cliente:" + clienteUID)
                                boton.setAttribute("vista", "/administracion/clientes/cliente:" + clienteUID)
                                boton.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                                return boton
                            },
                            titulo: function (titulo) {
                                const tituloUI = document.createElement("p")
                                tituloUI.classList.add(
                                    "tituloGris",
                                    "padding14"
                                )
                                tituloUI.textContent = titulo
                                return tituloUI
                            },
                            infoUI: function (info) {
                                const infoUI = document.createElement("p")
                                infoUI.classList.add("padding14")
                                infoUI.textContent = info
                                return infoUI
                            },
                        }
                    },
                },
            },
            complementosDeAlojamiento: {
                arranque: async function () {
                    const contenedorDinamico = document.querySelector("[componente=contenedorDinamico]")
                    const instanciaUID_contenedorComplementos = casaVitini.utilidades.codigoFechaInstancia()
                    const spinnerPorRenderizar = casaVitini.ui.componentes.spinnerSimple()
                    const contenedor = document.createElement("div")
                    contenedor.classList.add(
                        "flexVertical",
                        "gap6",
                        "padding6"
                    )
                    contenedor.setAttribute("instanciaUID", instanciaUID_contenedorComplementos)
                    contenedor.setAttribute("componente", "complementosDeAlojamiento")
                    contenedor.appendChild(spinnerPorRenderizar)
                    contenedorDinamico.appendChild(contenedor)
                    const reservaUI = document.querySelector("[reservaUID]")
                    const configuracionVista = reservaUI.getAttribute("configuracionVista")
                    const reservaUID = reservaUI.getAttribute("reservaUID")
                    const transaccion = {
                        reservaUID
                    }
                    if (configuracionVista === "publica") {
                        transaccion.zona = "miCasa/misReservas/detallesReserva"
                    } else {
                        transaccion.zona = "administracion/reservas/detallesReserva/global/obtenerReserva"
                        transaccion.capas = [
                            "complementosDeAlojamiento",
                            "alojamiento"
                        ]
                    }
                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    const instanciaDestino = document.querySelector(`[componente=complementosDeAlojamiento][instanciaUID="${instanciaUID_contenedorComplementos}"]`)
                    if (!instanciaDestino) { return }
                    instanciaDestino.innerHTML = null
                    if (respuestaServidor?.error) {
                        const errorUI = document.createElement("p")
                        errorUI.classList.add("errorCategorialGlobal")
                        errorUI.textContent = respuestaServidor?.error
                        instanciaDestino.appendChild(errorUI)
                    }
                    if (respuestaServidor?.ok) {
                        const bloqueBotones = document.createElement("div")
                        bloqueBotones.classList.add("detallesReserva_enlacesDePago_bloqueBotones")
                        const boton = document.createElement("div")
                        boton.classList.add("detallesReserva_transacciones_botonV1")
                        boton.textContent = "Insertar complemento de alojamiento"
                        boton.addEventListener("click", () => {
                            this.componentesUI.insertarServicio.ui({
                                instanciaUID_contenedorComplementos: instanciaUID_contenedorComplementos
                            })
                        })
                        // bloqueBotones.appendChild(boton)
                        const alojamiento = respuestaServidor.ok.alojamiento
                        const complementosDeAlojamiento = respuestaServidor.ok.complementosDeAlojamiento
                        if (configuracionVista === "publica") {
                        } else {
                            // instanciaDestino.appendChild(bloqueBotones)
                        }
                        const contenedorLista = document.createElement("div")
                        contenedorLista.classList.add(
                            "gridHorizontal2C",
                            "gap6",
                        )
                        contenedorLista.setAttribute("componente", "contenedorLista")
                        instanciaDestino.appendChild(contenedorLista)
                        const apartamentoUI = (data) => {
                            const apartamentoUI = data.apartamentoUI
                            const apartamentoUID = data.apartamentoUID
                            const apartamentoIDV = data.apartamentoIDV
                            const ui = document.createElement("div")
                            ui.setAttribute("apartamentoUID", apartamentoUID)
                            ui.setAttribute("apartamentoIDV", apartamentoIDV)
                            ui.classList.add(
                                "flexVertical",
                                "gap6",
                                "padding6",
                                "borderRadius12",
                                "backgroundGrey1"
                            )
                            const n = document.createElement("p")
                            n.classList.add(
                                "negrita",
                                "padding14"
                            )
                            n.textContent = apartamentoUI
                            ui.appendChild(n)
                            const contBo = document.createElement("div")
                            contBo.classList.add("flexHorizontal")
                            ui.appendChild(contBo)
                            if (configuracionVista === "administrativa") {
                                const b = document.createElement("div")
                                b.classList.add("botonV3")
                                b.textContent = "Añadir complemento de alojamiento"
                                b.addEventListener("click", () => {
                                    this.componentesUI.insertarComplementoEnAlojamiento.ui({
                                        instanciaUID_contenedorComplementos,
                                        apartamentoIDV,
                                    })
                                })
                                contBo.appendChild(b)
                            }
                            const c = document.createElement("div")
                            c.setAttribute("contenedor", "complementos")
                            c.classList.add(
                                "flexVertical",
                                "gap6",
                            )
                            c.appendChild(this.componentesUI.infoSinComplemento())
                            ui.appendChild(c)
                            return ui
                        }
                        Object.entries(alojamiento).forEach(([apartamentoIDV, contenedor]) => {
                            contenedorLista.appendChild(apartamentoUI({
                                apartamentoIDV,
                                apartamentoUI: contenedor.apartamentoUI,
                                apartamentoUID: contenedor.apartamentoUID
                            }))
                        })
                        complementosDeAlojamiento.forEach((com) => {
                            const contenedor = instanciaDestino.querySelector(`[apartamentoIDV="${com.apartamentoIDV}"] [contenedor=complementos]`)
                            contenedor.querySelector("[componente=sinInfo]")?.remove()
                            contenedor.appendChild(this.componentesUI.complementoUI(com))
                        })
                        return
                        instanciaDestino.style.justifyContent = "flex-start";
                        const serviciosEnReserva = respuestaServidor.ok.servicios
                        if (serviciosEnReserva.length === 0) {
                            contenedorLista.style.display = "none"
                            const infoSinEnlaces = this.componentesUI.infoSinServiciosUI()
                            instanciaDestino.appendChild(infoSinEnlaces)
                        }
                        if (serviciosEnReserva.length > 0) {
                            const contenedorListaServicios = instanciaDestino.querySelector(`[componente=contenedorLista]`)
                            for (const servicioEnReserva of serviciosEnReserva) {
                                const servicioUI = this.componentesUI.servicioUI({
                                    servicioUID_enReserva: servicioEnReserva.servicioUID,
                                    instanciaUID_contenedorServicios,
                                    nombreInterno: servicioEnReserva.nombre,
                                    contenedor: servicioEnReserva.contenedor
                                })
                                contenedorListaServicios.appendChild(servicioUI)
                            }
                        }
                    }
                },
                componentesUI: {
                    insertarComplementoEnAlojamiento: {
                        ui: async function (data) {
                            const main = document.querySelector("main")
                            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                            const reservaUID = main.querySelector("[reservaUID]").getAttribute("reservaUID")
                            const instanciaUID_insertarComplementoUI = ui.getAttribute("instanciaUID")
                            const instanciaUID_contenedorComplementos = data.instanciaUID_contenedorComplementos
                            const apartamentoIDV = data.apartamentoIDV
                            main.appendChild(ui)
                            const constructor = ui.querySelector("[componente=contenedor]")
                            const spinner = casaVitini.ui.componentes.spinner({
                                mensaje: "Obteniendo complementos del alojamiento...",
                                textoBoton: "Cancelar"
                            })
                            constructor.appendChild(spinner)
                            const respuestaServidor = await casaVitini.shell.servidor({
                                zona: "administracion/complementosDeAlojamiento/obtenerComplementosPorAlojamiento",
                                apartamentoIDV,
                                filtro: "soloActivos"
                            }
                            )
                            const uiRenderizada = document.querySelectorAll(`[instanciaUID="${instanciaUID_contenedorComplementos}"]`)
                            if (!uiRenderizada) { return }
                            if (respuestaServidor?.error) {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                spinner.remove()
                                const complementosPorApartamentoIDV = respuestaServidor.complementosPorApartamentoIDV
                                const contenedor = document.createElement("div")
                                contenedor.classList.add(
                                    "maxWidth1280px",
                                    "width100",
                                    "flexVertical",
                                    "gap10",
                                )
                                constructor.appendChild(contenedor)
                                const estadoUI_ = (estadoIDV) => {
                                    if (estadoIDV === "activado") {
                                        return "Activada"
                                    } else if (estadoIDV === "desactivado") {
                                        return "Desactivada"
                                    }
                                }
                                if (complementosPorApartamentoIDV.length > 0) {
                                    constructor.appendChild(this.botonCancelar())
                                } else {
                                    const info = document.querySelector("p")
                                    info.classList.add("textoCentrado", "padding14")
                                    info.textContent = "Este alojamiento no tiene ningun complemento configurado."
                                    constructor.appendChild(info)
                                }
                                complementosPorApartamentoIDV.forEach((c) => {
                                    const complementoUI = c.complementoUI
                                    const complementoUID = c.complementoUID
                                    const estadoIDV = c.estadoIDV
                                    const tipoPrecio = c.tipoPrecio
                                    const precio = c.precio
                                    const definicion = c.definicion
                                    const contenedor = document.createElement("div")
                                    contenedor.setAttribute("complementoUID", complementoUID)
                                    contenedor.classList.add(
                                        "borderRadius12",
                                        "width100",
                                        "flexVertical",
                                        "backgroundGrey1",
                                        "padding6",
                                        "gap6"
                                    )
                                    const contenedorGlobal = document.createElement("div")
                                    contenedorGlobal.classList.add(
                                        "flexVertical",
                                        "padding6",
                                        "gap6"
                                    )
                                    const nombreOfertaUI = document.createElement("div")
                                    nombreOfertaUI.classList.add("negrita")
                                    nombreOfertaUI.textContent = complementoUI
                                    contenedorGlobal.appendChild(nombreOfertaUI)
                                    const precioUI = document.createElement("div")
                                    precioUI.classList.add("negrita")
                                    if (tipoPrecio === "porNoche") {
                                        precioUI.textContent = precio + "$ Por noche"
                                    } else if (tipoPrecio === "fijoPorReserva") {
                                        precioUI.textContent = precio + "$ Precio final"
                                    }
                                    contenedorGlobal.appendChild(precioUI)
                                    const definicionUI = document.createElement("div")
                                    definicionUI.textContent = definicion
                                    contenedorGlobal.appendChild(definicionUI)
                                    const estadoTitulo = document.createElement("div")
                                    estadoTitulo.textContent = "Estado del complemento"
                                    contenedorGlobal.appendChild(estadoTitulo)
                                    const estadoUI = document.createElement("div")
                                    estadoUI.classList.add("negrita")
                                    estadoUI.textContent = estadoUI_(estadoIDV)
                                    contenedorGlobal.appendChild(estadoUI)
                                    contenedor.appendChild(contenedorGlobal)
                                    const contendorBotones = document.createElement("div")
                                    contendorBotones.classList.add(
                                        "flexHorizontal",
                                        "gap6",
                                    )
                                    const botonInsertar = document.createElement("div")
                                    botonInsertar.classList.add(
                                        "borderRadius8",
                                        "backgroundGrey1",
                                        "comportamientoBoton",
                                        "padding8"
                                    )
                                    botonInsertar.textContent = "Insertar complemento en el alojamiento"
                                    botonInsertar.addEventListener("click", () => {
                                        this.confirmarInsertar({
                                            reservaUID,
                                            complementoUID,
                                            instanciaUID_insertarComplementoUI,
                                            instanciaUID_contenedorComplementos
                                        })
                                    })
                                    contendorBotones.appendChild(botonInsertar)
                                    const botonVerOferta = document.createElement("a")
                                    botonVerOferta.classList.add(
                                        "borderRadius8",
                                        "backgroundGrey1",
                                        "comportamientoBoton",
                                        "padding8",
                                        "limpiezaBotonA"
                                    )
                                    botonVerOferta.textContent = "Ir al complemento"
                                    botonVerOferta.setAttribute("href", "/administracion/complementos_de_alojamiento/complemento:" + complementoUID)
                                    botonVerOferta.setAttribute("vista", "/administracion/complementos_de_alojamiento/complemento:" + complementoUID)
                                    botonVerOferta.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                                    contendorBotones.appendChild(botonVerOferta)
                                    contenedor.appendChild(contendorBotones)
                                    constructor.appendChild(contenedor)
                                })
                                constructor.appendChild(this.botonCancelar())
                            }
                        },
                        botonCancelar: function () {
                            const botonCancelar = document.createElement("div")
                            botonCancelar.classList.add("botonV1")
                            botonCancelar.setAttribute("boton", "cancelar")
                            botonCancelar.textContent = "Cerrar y volver a la reserva"
                            botonCancelar.addEventListener("click", () => {
                                return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            })
                            return botonCancelar
                        },
                        confirmarInsertar: async function (data) {
                            const reservaUID = data.reservaUID
                            const complementoUID = String(data.complementoUID)
                            const instanciaUID_insertarComplementoUI = data.instanciaUID_insertarComplementoUI
                            const instanciaUID_contenedorComplementos = data.instanciaUID_contenedorComplementos
                            const ui = document.querySelector(`[instanciaUID="${instanciaUID_insertarComplementoUI}"]`)
                            const contenedor = ui.querySelector("[componente=contenedor]")
                            contenedor.innerHTML = null
                            const spinner = casaVitini.ui.componentes.spinner({
                                mensaje: "Insertando complemento en el alojamiento..."
                            })
                            contenedor.appendChild(spinner)
                            const transaccion = {
                                zona: "administracion/reservas/detallesReserva/complementosDeAlojamiento/insertarComplementoAlojamientoEnReserva",
                                reservaUID,
                                complementoUID
                            }
                            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                            const uiRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_contenedorComplementos}"]`)
                            if (!uiRenderizada) { return }
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            if (respuestaServidor?.error) {
                                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                const complementoDeAlojamiento = respuestaServidor.complementoDeAlojamiento
                                const apartamentoIDV_destino = complementoDeAlojamiento.apartamentoIDV
                                casaVitini.view.__sharedMethods__.detallesReservaUI.reservaUI.actualizarReservaRenderizada()
                                const selectorContenedor = uiRenderizada.querySelector(`[apartamentoIDV="${apartamentoIDV_destino}"] [contenedor=complementos]`)
                                if (!selectorContenedor) {
                                    return
                                }
                                const complementoUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.complementosDeAlojamiento.componentesUI.complementoUI({
                                    complementoUID: complementoDeAlojamiento.complementoUID,
                                    complementoUI: complementoDeAlojamiento.complementoUI,
                                    definicion: complementoDeAlojamiento.definicion,
                                    precio: complementoDeAlojamiento.precio,
                                    tipoPrecio: complementoDeAlojamiento.tipoPrecio,
                                    apartamentoIDV: complementoDeAlojamiento.apartamentoIDV
                                })
                                const selectorInfo = selectorContenedor.querySelector("[componente=sinInfo]")
                                selectorInfo?.remove()
                                selectorContenedor.appendChild(complementoUI)
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            }
                        },
                    },
                    servicioUI: function (data) {
                        const reservaUI = document.querySelector("[reservaUID]")
                        const configuracionVista = reservaUI.getAttribute("configuracionVista")
                        const servicioUID_enReserva = data.servicioUID_enReserva
                        const instanciaUID_contenedorServicios = data.instanciaUID_contenedorServicios
                        const nombreInterno = data.nombreInterno
                        const contenedor = data.contenedor
                        const precio = contenedor.precio
                        const definicion = contenedor.definicion
                        const fechaFinal = contenedor.fechaFinal
                        const duracionIDV = contenedor.duracionIDV
                        const fechaInicio = contenedor.fechaInicio
                        const tituloPublico = contenedor.tituloPublico
                        const servicioUID = contenedor.servicioUID
                        const disponibilidadIDV = contenedor.disponibilidadIDV
                        const diccionario = {
                            disponibilidad: {
                                constante: "Disponible",
                                variable: "Disponibilidad variable"
                            }
                        }
                        const servicioUI = document.createElement("div")
                        servicioUI.setAttribute("servicioUID_enReserva", servicioUID_enReserva)
                        servicioUI.classList.add(
                            "flexVertical",
                            "padding6",
                            "backgroundGrey1",
                            "borderRadius14",
                            "flexAlineacionI"
                        )
                        const contenedorData = document.createElement("div")
                        contenedorData.classList.add(
                            "flexVertical",
                            "gap6",
                            "padding10"
                        )
                        servicioUI.appendChild(contenedorData)
                        const contenedorNombreInterno = document.createElement("div")
                        contenedorNombreInterno.classList.add(
                            "flexVertical",
                        )
                        if (configuracionVista === "publica") {
                        } else {
                            contenedorData.appendChild(contenedorNombreInterno)
                        }
                        const tituluNombreInternoUI = document.createElement("p")
                        tituluNombreInternoUI.textContent = `Nombre administrativo`
                        contenedorNombreInterno.appendChild(tituluNombreInternoUI)
                        const nombreInternoUI = document.createElement("p")
                        nombreInternoUI.classList.add(
                            "negrita")
                        nombreInternoUI.textContent = `${nombreInterno}`
                        contenedorNombreInterno.appendChild(nombreInternoUI)
                        const contenedorNombrePublico = document.createElement("div")
                        contenedorNombrePublico.classList.add(
                            "flexVertical",
                        )
                        contenedorData.appendChild(contenedorNombrePublico)
                        const tituluNombrePublico = document.createElement("p")
                        tituluNombrePublico.textContent = `Nombre público`
                        contenedorNombrePublico.appendChild(tituluNombrePublico)
                        const titulo = document.createElement("p")
                        titulo.classList.add(
                            "negrita")
                        titulo.textContent = tituloPublico
                        contenedorNombrePublico.appendChild(titulo)
                        const disponibilidadUI = document.createElement("p")
                        disponibilidadUI.classList.add(
                        )
                        disponibilidadUI.textContent = diccionario.disponibilidad[disponibilidadIDV]
                        contenedorData.appendChild(disponibilidadUI)
                        if (disponibilidadIDV === "variable") {
                            const info = document.createElement("p")
                            info.classList.add(
                            )
                            info.textContent = `Este servicio tiene una disponibilidad limitada. Es por eso que si selecciona este servicio, nos pondremos en contacto con el titular de la reserva en las próximas horas para confirmarle la disponibilidad del servicio para su reserva.`
                            contenedorData.appendChild(info)
                        }
                        const precioUI = document.createElement("p")
                        precioUI.classList.add(
                            "negrita"
                        )
                        precioUI.textContent = precio + "$"
                        contenedorData.appendChild(precioUI)
                        if (duracionIDV === "rango") {
                            const contenedorDuracion = document.createElement("div")
                            contenedorDuracion.classList.add(
                                "flexVertical",
                            )
                            contenedorData.appendChild(contenedorDuracion)
                            const info = document.createElement("p")
                            info.classList.add("negrita")
                            info.textContent = `Servicio disponible solo desde ${fechaInicio} hata ${fechaFinal}. Ambas fechas incluidas.`
                            contenedorDuracion.appendChild(info)
                        }
                        const definicionUI = document.createElement("p")
                        definicionUI.classList.add(
                        )
                        definicionUI.textContent = definicion
                        contenedorData.appendChild(definicionUI)
                        const contenedorBotones = document.createElement("div")
                        contenedorBotones.classList.add(
                            "flexHorizontal",
                            "gap6"
                        )
                        const botonIr = document.createElement("a")
                        botonIr.classList.add("administracion_reservas_detallesReservas_enlacesDePago_botonV1")
                        botonIr.textContent = "Ir al servicio"
                        botonIr.setAttribute("href", "/administracion/servicios/servicio:" + servicioUID)
                        botonIr.setAttribute("target", "_blank")
                        contenedorBotones.appendChild(botonIr)
                        const botonEliminar = document.createElement("div")
                        botonEliminar.classList.add("administracion_reservas_detallesReservas_enlacesDePago_botonV1")
                        botonEliminar.textContent = "Eliminar servicio de la reserva 111"
                        botonEliminar.addEventListener("click", () => {
                            this.
                                eliminarServicio
                                .ui({
                                    instanciaUID_contenedorServicios,
                                    servicioUID_enReserva,
                                    nombreInterno
                                })
                        })
                        contenedorBotones.appendChild(botonEliminar)
                        if (configuracionVista === "publica") {
                        } else {
                            servicioUI.appendChild(contenedorBotones)
                        }
                        return servicioUI
                    },
                    eliminarComplementoDeAlojamiento: {
                        ui: async function (data) {
                            const complementoUI = data.complementoUI
                            const apartamentoIDV = data.apartamentoIDV
                            const instanciaUID_contenedorComplementosDeAlojamiento = data.instanciaUID_contenedorComplementosDeAlojamiento
                            const complementoUID_enReserva = data.complementoUID_enReserva
                            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                            ui.style.justifyContent = "center"
                            const instanciaUID_eliminarServicio = ui.getAttribute("instanciaUID")
                            const constructor = ui.querySelector("[componente=constructor]")
                            const titulo = constructor.querySelector("[componente=titulo]")
                            titulo.textContent = `Confirmar eliminar el complemento de alojamiento ${complementoUI} de la reserva`
                            const mensaje = constructor.querySelector("[componente=mensajeUI]")
                            mensaje.textContent = "Var a eliminar el complemento de alojamiento de la reserva, ¿Estas de acuerdo?"
                            const botonAceptar = constructor.querySelector("[boton=aceptar]")
                            botonAceptar.textContent = "Comfirmar la eliminacion"
                            botonAceptar.addEventListener("click", () => {
                                this.confirmarEliminar({
                                    complementoUID_enReserva,
                                    instanciaUID_eliminarServicio,
                                    instanciaUID_contenedorComplementosDeAlojamiento,
                                    apartamentoIDV
                                })
                            })
                            const botonCancelar = constructor.querySelector("[boton=cancelar]")
                            botonCancelar.textContent = "Cancelar y volver"
                            document.querySelector("main").appendChild(ui)
                        },
                        confirmarEliminar: async function (data) {
                            const complementoUID_enReserva = String(data.complementoUID_enReserva)
                            const apartamentoIDV = data.apartamentoIDV
                            const instanciaUID_eliminarServicio = data.instanciaUID_eliminarServicio
                            const instanciaUID_contenedorComplementosDeAlojamiento = data.instanciaUID_contenedorComplementosDeAlojamiento
                            const ui = document.querySelector(`[instanciaUID="${instanciaUID_eliminarServicio}"]`)
                            const contenedor = ui.querySelector("[componente=constructor]")
                            contenedor.innerHTML = null
                            const spinner = casaVitini.ui.componentes.spinner({
                                mensaje: "Eliminado servicio en la reserva..."
                            })
                            contenedor.appendChild(spinner)
                            const transaccion = {
                                zona: "administracion/reservas/detallesReserva/complementosDeAlojamiento/eliminarComplementoDeAlojamientoEnReserva",
                                complementoUID_enReserva
                            }
                            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                            if (respuestaServidor?.error) {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                casaVitini.view.__sharedMethods__.detallesReservaUI.reservaUI.actualizarReservaRenderizada()
                                const selectorContenedor = document.querySelector(`[instanciaUID="${instanciaUID_contenedorComplementosDeAlojamiento}"] [apartamentoIDV="${apartamentoIDV}"] [contenedor=complementos]`)
                                if (!selectorContenedor) {
                                    return
                                }
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                selectorContenedor.querySelector(`[complentoUID_enReserva="${complementoUID_enReserva}"]`)?.remove()
                                const selectorContenedoresDeServiciosRenderizados = selectorContenedor.querySelectorAll("[complentoUID_enReserva]")
                                if (selectorContenedoresDeServiciosRenderizados.length === 0) {
                                    const infoSinEnlaces = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.complementosDeAlojamiento.componentesUI.infoSinComplemento()
                                    selectorContenedor.appendChild(infoSinEnlaces)
                                }
                            }
                        },
                    },
                    infoSinComplemento: function () {
                        const info = document.createElement("p")
                        info.classList.add("flexVertical", "textoCentrado", "padding14")
                        info.setAttribute("componente", "sinInfo")
                        info.textContent = "No hay ningún complemento en este alojamiento."
                        return info
                    },
                    complementoUI: function (data) {
                        const complementoUID = data.complementoUID
                        const complementoUI = data.complementoUI
                        const definicion = data.definicion
                        const precio = data.precio
                        const tipoPrecio = data.tipoPrecio
                        const apartamentoIDV = data.apartamentoIDV
                        const reservaUI = document.querySelector("[reservaUID]")
                        const configuracionVista = reservaUI.getAttribute("configuracionVista")
                        const renderizaPrecio = (data) => {
                            const precio = data.precio
                            const tipoPrecio = data.tipoPrecio
                            if (tipoPrecio === "fijoPorReserva") {
                                return `${precio}$ Total`
                            } else if (tipoPrecio === "porNoche") {
                                return `${precio}$ / Por noche`
                            }
                        }
                        const ui = document.createElement("div")
                        ui.setAttribute("complentoUID_enReserva", complementoUID)
                        ui.setAttribute("apartamentoIDV", apartamentoIDV)
                        ui.style.alignItems = "start"
                        ui.classList.add(
                            "gridHorizontal2C-1fr-min",
                            "gap6",
                            "padding6",
                            "borderRadius12",
                            "backgroundGrey1"
                        )
                        const dataCont = document.createElement("div")
                        dataCont.classList.add(
                            "flexVertical",
                            "gap6",
                            "padding6",
                        )
                        ui.appendChild(dataCont)
                        const n = document.createElement("p")
                        n.classList.add(
                            "negrita",
                        )
                        n.textContent = complementoUI
                        dataCont.appendChild(n)
                        const p = document.createElement("p")
                        p.classList.add(
                            //   "padding14"
                        )
                        p.textContent = renderizaPrecio({
                            tipoPrecio,
                            precio
                        })
                        dataCont.appendChild(p)
                        const d = document.createElement("p")
                        d.classList.add(
                            //  "padding14"
                        )
                        d.textContent = definicion
                        dataCont.appendChild(d)
                        if (configuracionVista === "administrativa") {
                            const b = document.createElement("div")
                            b.style.borderRadius = "10px"
                            b.classList.add("botonV1")
                            b.addEventListener("click", (e) => {
                                const instanciaUID_contenedorComplementosDeAlojamiento = e.target.closest("[componente=contenedorDinamico]").querySelector("[componente=complementosDeAlojamiento]").getAttribute("instanciaUID")
                                casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.complementosDeAlojamiento.componentesUI.eliminarComplementoDeAlojamiento.ui({
                                    complementoUI,
                                    instanciaUID_contenedorComplementosDeAlojamiento,
                                    complementoUID_enReserva: complementoUID,
                                    apartamentoIDV
                                })
                            })
                            b.textContent = "Eliminar"
                            ui.appendChild(b)
                        }
                        return ui
                    }
                },
            },
            enlacesDePago: {
                arranque: async function (e) {
                    const contenedorDinamico = document.querySelector("[componente=contenedorDinamico]")
                    const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                    const contenedorEnlacesDePago = document.createElement("div")
                    const spinnerPorRenderizar = casaVitini.ui.componentes.spinnerSimple()
                    contenedorEnlacesDePago.classList.add(
                        "padding6",
                        "flexVertical",
                        "gap6"
                    )
                    contenedorEnlacesDePago.setAttribute("instanciaUID", instanciaUID)
                    contenedorEnlacesDePago.setAttribute("componente", "categoriaEnlacesDePago")
                    contenedorEnlacesDePago.appendChild(spinnerPorRenderizar)
                    contenedorDinamico.appendChild(contenedorEnlacesDePago)
                    const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                    const transaccion = {
                        zona: "administracion/reservas/detallesReserva/global/obtenerReserva",
                        reservaUID: String(reservaUID),
                        capas: [
                            "enlacesDePago"
                        ]
                    }
                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    const instanciaDestino = document.querySelector(`[componente=categoriaEnlacesDePago][instanciaUID="${instanciaUID}"]`)
                    if (!instanciaDestino) { return }
                    instanciaDestino.innerHTML = null
                    if (respuestaServidor?.error) {
                        const errorUI = document.createElement("p")
                        errorUI.classList.add("errorCategorialGlobal")
                        errorUI.textContent = respuestaServidor?.error
                        instanciaDestino.appendChild(errorUI)
                    }
                    if (respuestaServidor?.ok) {
                        const contenedorInformacionGlobal = document.createElement("div")
                        contenedorInformacionGlobal.classList.add("administracion_reservas_detallesReserva_contenedorEnlacesDePago")
                        const infoGlobal = document.createElement("div")
                        infoGlobal.classList.add("detallesReserva_reembolso_infoGlobal")
                        infoGlobal.textContent = `Aquí tienes los enlaces de pago generados para realizar pagos para esta reserva a través de la pasarela.`
                        contenedorEnlacesDePago.appendChild(contenedorInformacionGlobal)
                        const bloqueBotones = document.createElement("div")
                        bloqueBotones.classList.add("detallesReserva_enlacesDePago_bloqueBotones")
                        const botonCrearPagoManual = document.createElement("div")
                        botonCrearPagoManual.classList.add("detallesReserva_transacciones_botonV1")
                        botonCrearPagoManual.textContent = "Crear un enlace de pago"
                        botonCrearPagoManual.addEventListener("click", () => {
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.enlacesDePago.crearEnlace.UI(instanciaUID)
                        })
                        bloqueBotones.appendChild(botonCrearPagoManual)
                        contenedorInformacionGlobal.appendChild(bloqueBotones)
                        const contenedorListaEnlacesDePagos = document.createElement("div")
                        contenedorListaEnlacesDePagos.classList.add("administracion_reservas_detallesReserva_contenedorListaEnlacesDePago")
                        contenedorListaEnlacesDePagos.setAttribute("componente", "contenedorListaEnlacesDePago")
                        contenedorEnlacesDePago.appendChild(contenedorListaEnlacesDePagos)
                        instanciaDestino.style.justifyContent = "flex-start";
                        const enlacesDePagoGenerados = respuestaServidor?.ok.enlacesDePago
                        if (enlacesDePagoGenerados.length === 0) {
                            const infoSinEnlaces = document.createElement("div")
                            infoSinEnlaces.classList.add("reservaDetalles_transacciones_enlacesDePago_infoSinEnlaces")
                            infoSinEnlaces.setAttribute("componente", "contenedorInfoSinEnlaces")
                            infoSinEnlaces.textContent = "No hay ningún enlace de pago generado"
                            contenedorDinamico.appendChild(infoSinEnlaces)
                        } else if (enlacesDePagoGenerados.length > 0) {
                            const contenedorEnlacesDePago = instanciaDestino.querySelector(`[componente=contenedorListaEnlacesDePago]`)
                            for (const detallesDelEnlace of enlacesDePagoGenerados) {
                                const enlaceUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.enlacesDePago.enlaceUI({
                                    enlaceUID: detallesDelEnlace.enlaceUID,
                                    nombreEnlace: detallesDelEnlace.nombreEnlace,
                                    enlace: detallesDelEnlace.enlace,
                                    cantidad: detallesDelEnlace.cantidad,
                                    estadoPago: detallesDelEnlace.estadoPagoIDV,
                                    instanciaUID: instanciaUID
                                })
                                contenedorEnlacesDePago.appendChild(enlaceUI)
                            }
                        }
                    }
                },
                eliminarEnlace: {
                    UI: async function (datosElimiacion) {
                        document.body.style.overflow = "hidden";
                        const enlaceUID = datosElimiacion.enlaceUID
                        const instanciaUID = datosElimiacion.instanciaUID
                        const advertenciaInmersivaIU = document.createElement("div")
                        advertenciaInmersivaIU.setAttribute("class", "advertenciaInmersiva")
                        advertenciaInmersivaIU.setAttribute("componente", "advertenciaInmersiva")
                        const contenedorAdvertenciaInmersiva = document.createElement("div")
                        contenedorAdvertenciaInmersiva.classList.add("contenedorAdvertencaiInmersiva")
                        const contenidoAdvertenciaInmersiva = document.createElement("div")
                        contenidoAdvertenciaInmersiva.classList.add("contenidoAdvertenciaInmersiva")
                        const tituloCancelarReserva = document.createElement("p")
                        tituloCancelarReserva.classList.add("tituloGris", "padding6")
                        tituloCancelarReserva.textContent = "Eliminar enlace de pago"
                        contenidoAdvertenciaInmersiva.appendChild(tituloCancelarReserva)
                        const bloqueBloqueoApartamentos = document.createElement("div")
                        bloqueBloqueoApartamentos.classList.add("flexVertical", "gap6")
                        const tituloBloquoApartamentos = document.createElement("div")
                        tituloBloquoApartamentos.classList.add("padding6", "textoCentrado")
                        tituloBloquoApartamentos.textContent = "¿Quieres confirmar la eliminación de este enlace de pago? Sus implicaciones serán inmediatas y el enlace de acceso temporal pasará a ser obsoleto."
                        bloqueBloqueoApartamentos.appendChild(tituloBloquoApartamentos)
                        contenidoAdvertenciaInmersiva.appendChild(bloqueBloqueoApartamentos)
                        const bloqueBotones = document.createElement("div")
                        bloqueBotones.classList.add(
                            "flexVertical",
                            "gap6"
                        )
                        const botonCancelar = document.createElement("div")
                        botonCancelar.classList.add("botonV1")
                        botonCancelar.setAttribute("componente", "botonConfirmarCancelarReserva")
                        botonCancelar.textContent = "Confirmar y eliminar enlace"
                        botonCancelar.addEventListener("click", () => {
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.enlacesDePago.eliminarEnlace.confirmar({
                                enlaceUID,
                                instanciaUID
                            })
                        })
                        bloqueBotones.appendChild(botonCancelar)
                        const botonVolverAlEnlace = document.createElement("div")
                        botonVolverAlEnlace.classList.add("detallesReservaCancelarBoton")
                        botonVolverAlEnlace.setAttribute("componente", "botonConfirmarCancelarReserva")
                        botonVolverAlEnlace.textContent = "Volver a los detalles del enlace"
                        botonVolverAlEnlace.addEventListener("click", casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.enlacesDePago.desplegarUI)
                        const botonCancelarProcesoCancelacion = document.createElement("div")
                        botonCancelarProcesoCancelacion.classList.add("botonV1")
                        botonCancelarProcesoCancelacion.textContent = "Cancelar la eliminación del enlace"
                        botonCancelarProcesoCancelacion.addEventListener("click", casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas)
                        bloqueBotones.appendChild(botonCancelarProcesoCancelacion)
                        contenidoAdvertenciaInmersiva.appendChild(bloqueBotones)
                        contenedorAdvertenciaInmersiva.appendChild(contenidoAdvertenciaInmersiva)
                        advertenciaInmersivaIU.appendChild(contenedorAdvertenciaInmersiva)
                        document.querySelector("main").appendChild(advertenciaInmersivaIU)
                    },
                    confirmar: async function (datosElimiacion) {
                        const instanciaUID_pantallaCarga = casaVitini.utilidades.codigoFechaInstancia()
                        const mensaje = "Elimiando enlace de pago..."
                        const datosPantallaSuperpuesta = {
                            instanciaUID: instanciaUID_pantallaCarga,
                            mensaje: mensaje
                        }
                        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                        const enlaceUID = datosElimiacion.enlaceUID
                        const instanciaUID = datosElimiacion.instanciaUID
                        const transaccion = {
                            zona: "administracion/enlacesDePago/eliminarEnlace",
                            enlaceUID: String(enlaceUID)
                        }
                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_pantallaCarga}"]`)
                        if (!instanciaRenderizada) { return }
                        instanciaRenderizada.remove()
                        if (respuestaServidor?.error) {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                        }
                        if (respuestaServidor?.ok) {
                            const contenedorEspacioEnlacesDePago = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                            document.querySelector(`[enlacePagoUID="${enlaceUID}"]`)?.remove()
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            const contenedorEnlacesDePago = contenedorEspacioEnlacesDePago.querySelector("[componente=contenedorListaEnlacesDePago]")
                            const selectorEnlaces = contenedorEspacioEnlacesDePago.querySelectorAll("[enlacePagoUID]")
                            if (selectorEnlaces.length === 0) {
                                if (contenedorEspacioEnlacesDePago) {
                                    const contenedorDinamico = document.querySelector("[componente=contenedorDinamico]")
                                    const infoSinEnlaces = document.createElement("div")
                                    infoSinEnlaces.classList.add("reservaDetalles_transacciones_enlacesDePago_infoSinEnlaces")
                                    infoSinEnlaces.setAttribute("componente", "contenedorInfoSinEnlaces")
                                    infoSinEnlaces.textContent = "No hay ningún enlace de pago generado"
                                    contenedorDinamico.appendChild(infoSinEnlaces)
                                }
                            }
                        }
                    }
                },
                crearEnlace: {
                    UI: async function (instanciaUID) {
                        const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                        const advertenciaInmersivaIU = document.createElement("div")
                        advertenciaInmersivaIU.setAttribute("class", "advertenciaInmersiva")
                        advertenciaInmersivaIU.setAttribute("componente", "advertenciaInmersiva")
                        const contenedorAdvertenciaInmersiva = document.createElement("div")
                        contenedorAdvertenciaInmersiva.classList.add("contenedorAdvertencaiInmersiva")
                        const contenidoAdvertenciaInmersiva = document.createElement("div")
                        contenidoAdvertenciaInmersiva.classList.add("contenidoAdvertenciaInmersiva")
                        contenidoAdvertenciaInmersiva.setAttribute("espacio", "formularioCrearEnlaceDePago")
                        const titulo = document.createElement("p")
                        titulo.classList.add("tituloGris", "padding14")
                        titulo.textContent = "Generar enlace de pago"
                        contenidoAdvertenciaInmersiva.appendChild(titulo)
                        const bloque = document.createElement("div")
                        bloque.classList.add(
                            "flexVertical",
                            "gap6"
                        )
                        let info = document.createElement("div")
                        info.classList.add("padding14")
                        info.textContent = `
                Genera un enlace de pago para poder enviarlo a un cliente y que realice el pago de la reserva. No es obligatorio escribir un nombre, pero sí recomendable, por si necesita acordarse de por qué genera este enlace. Si no define ningún nombre, este se llamará "Enlace de pago de la reserva ${reservaUID}". Este es el nombre automático que tendrá este enlace si no define un nombre en específico. Recuerde que todos los enlaces generados y su gestión centralizada la puede encontrar en el panel de administración, en el botón de Enlaces de pago desde el menú administración o en su reserva correspondiente dentro del apartado enlaces de pago.`
                        bloque.appendChild(info)
                        let campo = document.createElement("input")
                        campo.classList.add("botonV1BlancoIzquierda_noSeleccionable")
                        campo.setAttribute("campo", "nombreEnlace")
                        campo.placeholder = "Escribe un nombre para el nuevo enlace si quiere"
                        bloque.appendChild(campo)
                        info = document.createElement("div")
                        info.classList.add("padding14")
                        info.textContent = `Determina la cantidad de pago del enlace, recuerda que los precios de cobro deben de escribirse con dos decimales separados por punto. Por ejemplo, para crear un enlace de pago de 35 dólares escribe 35.00`
                        bloque.appendChild(info)
                        campo = document.createElement("input")
                        campo.classList.add("botonV1BlancoIzquierda_noSeleccionable")
                        campo.classList.add("negrita")
                        campo.setAttribute("campo", "cantidad")
                        campo.placeholder = "Cantidad(Obligatorio)"
                        bloque.appendChild(campo)
                        info = document.createElement("div")
                        info.classList.add("padding14")
                        info.textContent = `Determina el tiempo de vigencia del enlace. Por defecto, el sistema aplica 72h si no especificas una vigencia concreta. Pasada la vigencia, el enlace ya no puede realizar el cobro y desaparece.`
                        bloque.appendChild(info)
                        campo = document.createElement("input")
                        campo.classList.add("botonV1BlancoIzquierda_noSeleccionable")
                        campo.setAttribute("campo", "horasCaducidad")
                        campo.placeholder = "Caducidad en horas, por defecto, 72h."
                        bloque.appendChild(campo)
                        const campoDescripcion = document.createElement("textarea")
                        campoDescripcion.classList.add("botonV1BlancoIzquierda_noSeleccionable")
                        campoDescripcion.setAttribute("campo", "descripcion")
                        campoDescripcion.placeholder = "No es obligatorio, pero escriba una descripción si quieres para definir aún más a este enlace si lo necesitas."
                        contenidoAdvertenciaInmersiva.appendChild(bloque)
                        const bloqueBotones = document.createElement("div")
                        bloqueBotones.classList.add(
                            "flexVertical",
                            "gap10"
                        )
                        const botonConfirmar = document.createElement("div")
                        botonConfirmar.classList.add("botonV1BlancoIzquierda")
                        botonConfirmar.setAttribute("componente", "botonConfirmarCancelarReserva")
                        botonConfirmar.textContent = "Confirmar y crear enlace"
                        botonConfirmar.addEventListener("click", () => {
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.enlacesDePago.crearEnlace.confirmar(instanciaUID)
                        })
                        bloqueBotones.appendChild(botonConfirmar)
                        const botonCancelar = document.createElement("div")
                        botonCancelar.classList.add("botonV1")
                        botonCancelar.textContent = "Cancelar la creación del enlace"
                        botonCancelar.addEventListener("click", casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas)
                        bloqueBotones.appendChild(botonCancelar)
                        contenidoAdvertenciaInmersiva.appendChild(bloqueBotones)
                        const contenedorGlobal = document.createElement("div")
                        contenedorGlobal.classList.add("detallesReserva_enlaceDePago_contenedorGlobal")
                        contenedorAdvertenciaInmersiva.appendChild(contenidoAdvertenciaInmersiva)
                        advertenciaInmersivaIU.appendChild(contenedorAdvertenciaInmersiva)
                        document.querySelector("main").appendChild(advertenciaInmersivaIU)
                    },
                    confirmar: async function (instanciaUID) {
                        const instanciaUID_pantallaCarga = casaVitini.utilidades.codigoFechaInstancia()
                        const mensaje = "Creando enlace..."
                        const datosPantallaSuperpuesta = {
                            instanciaUID: instanciaUID_pantallaCarga,
                            mensaje: mensaje
                        }
                        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                        const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                        const nombreEnlace = document.querySelector("[espacio=formularioCrearEnlaceDePago] [campo=nombreEnlace]")
                        const cantidad = document.querySelector("[espacio=formularioCrearEnlaceDePago] [campo=cantidad]")
                        const horasCaducidad = document.querySelector("[espacio=formularioCrearEnlaceDePago] [campo=horasCaducidad]")
                        const transaccion = {
                            zona: "administracion/enlacesDePago/crearNuevoEnlace",
                            reservaUID: reservaUID,
                            nombreEnlace: nombreEnlace.value,
                            cantidad: cantidad.value,
                            horasCaducidad: horasCaducidad.value,
                        }
                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_pantallaCarga}"]`)
                        if (!instanciaRenderizada) { return }
                        instanciaRenderizada.remove()
                        if (respuestaServidor?.error) {
                            casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                        }
                        if (respuestaServidor?.ok) {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            const seleccionarInstancia = document.querySelector(`[componente=categoriaEnlacesDePago][instanciaUID="${instanciaUID}"] [componente=contenedorListaEnlacesDePago]`)
                            if (seleccionarInstancia) {
                                const metadatos = {
                                    enlaceUID: respuestaServidor.enlaceUID,
                                    nombreEnlace: respuestaServidor.nombreEnlace,
                                    enlace: respuestaServidor.enlace,
                                    cantidad: respuestaServidor.cantidad,
                                    estadoPago: "noPagado",
                                    instanciaUID: instanciaUID
                                }
                                const enlaceUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.enlacesDePago.enlaceUI(metadatos)
                                const primerElemento = seleccionarInstancia.firstChild;
                                seleccionarInstancia.insertBefore(enlaceUI, primerElemento);
                                document.querySelector("[componente=contenedorInfoSinEnlaces]")?.remove()
                            }
                        }
                    }
                },
                acutalizarEnlace: async function () {
                    const botonActualizar = document.querySelector("[componente=botonActualizarEnlace]")
                    const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                    const nombreEnlace = document.querySelector("[campo=nombreEnlace]")
                    const descripcion = document.querySelector("[campo=descripcion]")
                    botonActualizar.textContent = "Actualizando, espera..."
                    botonActualizar.style.pointerEvents = "none"
                    const transaccion = {
                        zona: "administracion/enlacesDePago/modificarEnlace",
                        enlaceUID: Number(reservaUID),
                        nombreEnlace: nombreEnlace.value,
                        descripcion: descripcion.value
                    }
                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    if (respuestaServidor?.error) {
                        const advertenciasInmersivasRenderizadas = document.querySelectorAll("[componente=advertenciaInmersiva]")
                        advertenciasInmersivasRenderizadas.forEach((advertencia) =>
                            advertencia.remove()
                        )
                        casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                    }
                    if (respuestaServidor?.ok) {
                        botonActualizar.textContent = "Actualizar enlace de pago"
                        botonActualizar.removeAttribute("style")
                    }
                },
                enlaceUI: function (metadatos) {
                    const enlaceUID = metadatos.enlaceUID
                    const nombreEnlace = metadatos.nombreEnlace
                    const enlace = metadatos.enlace
                    const cantidad = metadatos.cantidad
                    const estadoPago = metadatos.estadoPago
                    const instanciaUID = metadatos.instanciaUID
                    const bloqueDatosGenerales = document.createElement("div")
                    bloqueDatosGenerales.classList.add("detallesReserva_enlacesDePago_bloqueDatosGenerales")
                    bloqueDatosGenerales.setAttribute("enlacePagoUID", enlaceUID)
                    const contenedorDatosEnlace = document.createElement("div")
                    contenedorDatosEnlace.classList.add("administracion_reservas_detallesReservas_enlacesDePago_contenedorDatosEnlace")
                    const dict = {
                        enlacesDePago: {
                            estados: {
                                noPagado: "No pagado",
                                pagado: "Pagado"
                            }
                        }
                    }
                    let bloqueInfoDato = document.createElement("div")
                    bloqueInfoDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                    let bloqueInfo = document.createElement("div")
                    bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                    bloqueInfo.classList.add("negrita")
                    bloqueInfo.textContent = "Enlace UID"
                    bloqueInfoDato.appendChild(bloqueInfo)
                    let bloqueDato = document.createElement("div")
                    bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                    bloqueDato.textContent = enlaceUID
                    bloqueInfoDato.appendChild(bloqueDato)
                    contenedorDatosEnlace.appendChild(bloqueInfoDato)
                    bloqueInfoDato = document.createElement("div")
                    bloqueInfoDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                    bloqueInfo = document.createElement("div")
                    bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                    bloqueInfo.classList.add("negrita")
                    bloqueInfo.textContent = "Cantidad"
                    bloqueInfoDato.appendChild(bloqueInfo)
                    bloqueDato = document.createElement("div")
                    bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                    bloqueDato.textContent = cantidad + "$"
                    bloqueInfoDato.appendChild(bloqueDato)
                    contenedorDatosEnlace.appendChild(bloqueInfoDato)
                    bloqueInfoDato = document.createElement("div")
                    bloqueInfoDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                    bloqueInfo = document.createElement("div")
                    bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                    bloqueInfo.classList.add("negrita")
                    bloqueInfo.textContent = "Nombre del enlace"
                    bloqueInfoDato.appendChild(bloqueInfo)
                    bloqueDato = document.createElement("div")
                    bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                    bloqueDato.textContent = nombreEnlace
                    bloqueInfoDato.appendChild(bloqueDato)
                    contenedorDatosEnlace.appendChild(bloqueInfoDato)
                    bloqueInfoDato = document.createElement("div")
                    bloqueInfoDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                    bloqueInfo = document.createElement("div")
                    bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                    bloqueInfo.classList.add("negrita")
                    bloqueInfo.textContent = "Estado del pago"
                    bloqueInfoDato.appendChild(bloqueInfo)
                    bloqueDato = document.createElement("div")
                    bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                    bloqueDato.textContent = dict.enlacesDePago.estados[estadoPago]
                    bloqueInfoDato.appendChild(bloqueDato)
                    contenedorDatosEnlace.appendChild(bloqueInfoDato)
                    bloqueDatosGenerales.appendChild(contenedorDatosEnlace)
                    const contenedorBotones = document.createElement("div")
                    contenedorBotones.classList.add("administracion_reservas_detallesReservas_enlacesDePago_contenedorBotones")
                    const botonIrAlEnlace = document.createElement("a")
                    botonIrAlEnlace.classList.add("administracion_reservas_detallesReservas_enlacesDePago_botonV1")
                    botonIrAlEnlace.textContent = "Ir al enlace"
                    botonIrAlEnlace.setAttribute("href", "/pagos/" + enlace)
                    botonIrAlEnlace.setAttribute("target", "_blank")
                    contenedorBotones.appendChild(botonIrAlEnlace)
                    const botonCopiarEnlace = document.createElement("div")
                    botonCopiarEnlace.classList.add("administracion_reservas_detallesReservas_enlacesDePago_botonV1")
                    botonCopiarEnlace.classList.add("administracion_reservas_detallesReservas_enlacesDePago_botonCopiarPulsacion")
                    botonCopiarEnlace.textContent = "Copiar URL al portapapeles"
                    botonCopiarEnlace.addEventListener("click", () => {
                        const enlaceURL = window.location.hostname + "/pagos/" + enlace
                        navigator.clipboard.writeText(enlaceURL)
                            .then(() => {
                            })
                            .catch((err) => {
                            });
                    })
                    contenedorBotones.appendChild(botonCopiarEnlace)
                    const botonEliminar = document.createElement("div")
                    botonEliminar.classList.add("administracion_reservas_detallesReservas_enlacesDePago_botonV1")
                    botonEliminar.textContent = "Eliminar enlaces"
                    botonEliminar.addEventListener("click", () => {
                        const datosElimiacion = {
                            enlaceUID: enlaceUID,
                            instanciaUID: instanciaUID,
                        }
                        casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.enlacesDePago.eliminarEnlace.UI(datosElimiacion)
                    })
                    contenedorBotones.appendChild(botonEliminar)
                    bloqueDatosGenerales.appendChild(contenedorBotones)
                    return bloqueDatosGenerales
                }
            },
            transacciones: {
                arranque: async function () {
                    const contenedorDinamico = document.querySelector("[componente=contenedorDinamico]")
                    const advertenciasInmersivasRenderizadas = document.querySelectorAll("[componente=advertenciaInmersiva]")
                    advertenciasInmersivasRenderizadas.forEach((advertencia) =>
                        advertencia.remove()
                    )
                    const instanciaUID_contenedorDinamicoTransacciones = casaVitini.utilidades.codigoFechaInstancia()
                    const contenedorListaDePagos = document.createElement("div")
                    contenedorListaDePagos.setAttribute("class", "administracion_reservas_detallesReservas_transacciones_contenedorListaDePagos")
                    contenedorListaDePagos.setAttribute("instanciaUID", instanciaUID_contenedorDinamicoTransacciones)
                    contenedorListaDePagos.setAttribute("contenedorID", "transacciones")
                    const spinnerSimple = casaVitini.ui.componentes.spinnerSimple()
                    contenedorListaDePagos.appendChild(spinnerSimple)
                    contenedorDinamico.appendChild(contenedorListaDePagos)
                    const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                    const transaccion = {
                        zona: "administracion/reservas/detallesReserva/global/obtenerReserva",
                        reservaUID: reservaUID,
                        capas: [
                            "detallesPagos",
                        ]
                    }
                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    const instanciaDestino = document.querySelector(`[contenedorID=transacciones][instanciaUID="${instanciaUID_contenedorDinamicoTransacciones}"]`)
                    if (!instanciaDestino) { return }
                    instanciaDestino.innerHTML = null
                    if (respuestaServidor?.error) {
                        const errorUI = document.createElement("p")
                        errorUI.classList.add("errorCategorialGlobal")
                        errorUI.textContent = respuestaServidor?.error
                        instanciaDestino.appendChild(errorUI)
                    }
                    if (respuestaServidor?.ok) {
                        instanciaDestino.style.justifyContent = "flex - start";
                        casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.UI.listaDePagos({
                            detallesPagos: respuestaServidor,
                            instanciaUID_contenedorDinamicoTransacciones
                        })
                    }
                },
                UI: {
                    listaDePagos: async function (data) {
                        const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                        const listaDePagos = data.detallesPagos.ok.detallesPagos
                        const totalReserva = listaDePagos.totalReserva
                        const totalPagado = listaDePagos.totalPagado
                        const faltantePorPagar = listaDePagos.faltantePorPagar
                        const instanciaUID_contenedorDinamicoTransacciones = data.instanciaUID_contenedorDinamicoTransacciones
                        const totalReembolsado = listaDePagos.totalReembolsado
                        const porcentajeReembolsado = listaDePagos.porcentajeReembolsado
                        const porcentajePagado = listaDePagos.porcentajePagado
                        const pagos = listaDePagos.pagos //array
                        const contenedorAdvertenciaInmersiva = document.createElement("div")
                        contenedorAdvertenciaInmersiva.classList.add("administracion_reservas_detallesReserva_contenedorListaDePagos")
                        const titulo = document.createElement("p")
                        titulo.classList.add("detallesReserva_reembolso_tituloGlobal")
                        titulo.textContent = "Transacciones"
                        contenedorAdvertenciaInmersiva.appendChild(titulo)
                        const infoGlobal = document.createElement("div")
                        infoGlobal.classList.add("detallesReserva_reembolso_infoGlobal")
                        infoGlobal.textContent = `Estos son los de pagos de esta reserva. Los pagos pueden realizarse por la pasarela o, si realiza un pago en efectivo, deberá añadir un pago manual desde el botón correspondiente. Para ver los detalles de un pago y sus reembolsos si los hubiera pulsado en un pago. Para realizar un reembolso, entra en los detalles de un pago y desde ahí podrás realizar el reembolso.`
                        contenedorAdvertenciaInmersiva.appendChild(infoGlobal)
                        const bloqueTransacciones = document.createElement("div")
                        bloqueTransacciones.classList.add("detallesReserva_transacciones_bloqueGlobal")
                        bloqueTransacciones.setAttribute("contenedor", "transaccionesUI")
                        const bloqueBotones = document.createElement("div")
                        bloqueBotones.classList.add("detallesReserva_transacciones_bloqueBotones")
                        const botonEnlacesDePago = document.createElement("div")
                        botonEnlacesDePago.classList.add("detallesReserva_transacciones_botonV1")
                        botonEnlacesDePago.addEventListener("click", casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.UI.enlacesDePago)
                        botonEnlacesDePago.textContent = "Crear un enlace de pago"
                        const botonCrearPagoManual = document.createElement("div")
                        botonCrearPagoManual.classList.add("botonV1BlancoIzquierda")
                        botonCrearPagoManual.addEventListener("click", () => {
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.crearPagoManual.UI()
                        })
                        botonCrearPagoManual.textContent = "Crear pago"
                        bloqueBotones.appendChild(botonCrearPagoManual)
                        const botonCerrar = document.createElement("div")
                        botonCerrar.classList.add("detallesReserva_transacciones_botonV1")
                        botonCerrar.addEventListener("click", casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas)
                        botonCerrar.textContent = "Cerrar"
                        bloqueTransacciones.appendChild(bloqueBotones)
                        const bloqueDatosGenerales = document.createElement("div")
                        bloqueDatosGenerales.classList.add("detallesReserva_transacciones_bloqueDatosGenerales")
                        let bloqueInfoDato = document.createElement("div")
                        bloqueInfoDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                        let bloqueInfo = document.createElement("div")
                        bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                        bloqueInfo.classList.add("negrita")
                        bloqueInfo.textContent = "Total de la reserva"
                        bloqueInfoDato.appendChild(bloqueInfo)
                        let bloqueDato = document.createElement("div")
                        bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                        bloqueDato.setAttribute("componentePago", "totalReserva")
                        bloqueDato.textContent = totalReserva + "$"
                        bloqueInfoDato.appendChild(bloqueDato)
                        bloqueDatosGenerales.appendChild(bloqueInfoDato)
                        bloqueInfoDato = document.createElement("div")
                        bloqueInfoDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                        bloqueInfo = document.createElement("div")
                        bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                        bloqueInfo.classList.add("negrita")
                        bloqueInfo.setAttribute("componentePago", "porcentajePagado")
                        bloqueInfo.textContent = `Total pagado (${porcentajePagado})`
                        bloqueInfoDato.appendChild(bloqueInfo)
                        bloqueDato = document.createElement("div")
                        bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                        bloqueDato.setAttribute("componentePago", "totalPagado")
                        bloqueDato.textContent = totalPagado + "$"
                        bloqueInfoDato.appendChild(bloqueDato)
                        bloqueDatosGenerales.appendChild(bloqueInfoDato)
                        bloqueInfoDato = document.createElement("div")
                        bloqueInfoDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                        bloqueInfo = document.createElement("div")
                        bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                        bloqueInfo.classList.add("negrita")
                        bloqueInfo.setAttribute("componentePago", "porcentajeReembolsado")
                        bloqueInfo.textContent = `Total reembolsado (${porcentajeReembolsado})`
                        bloqueInfoDato.appendChild(bloqueInfo)
                        bloqueDato = document.createElement("div")
                        bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                        bloqueDato.setAttribute("componentePago", "totalReembolsado")
                        bloqueDato.textContent = totalReembolsado + "$"
                        bloqueInfoDato.appendChild(bloqueDato)
                        bloqueDatosGenerales.appendChild(bloqueInfoDato)
                        bloqueInfoDato = document.createElement("div")
                        bloqueInfoDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                        bloqueInfo = document.createElement("div")
                        bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                        bloqueInfo.classList.add("negrita")
                        bloqueInfo.textContent = "Faltante por pagar"
                        bloqueInfoDato.appendChild(bloqueInfo)
                        bloqueDato = document.createElement("div")
                        bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                        bloqueDato.setAttribute("componentePago", "faltantePorPagar")
                        bloqueDato.textContent = faltantePorPagar + "$"
                        bloqueInfoDato.appendChild(bloqueDato)
                        bloqueDatosGenerales.appendChild(bloqueInfoDato)
                        bloqueTransacciones.appendChild(bloqueDatosGenerales)
                        if (pagos.length === 0) {
                            const infoNoPagoUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.UI.infoNoPagos()
                            bloqueTransacciones.appendChild(infoNoPagoUI)
                        }
                        if (pagos.length > 0) {
                            const bloqueListaDePagos = document.createElement("div")
                            bloqueListaDePagos.classList.add("reservaDetalles_transacciones_bloqueListaDePagos")
                            bloqueListaDePagos.setAttribute("contenedor", "listaDePagos")
                            for (const detallesDelPago of pagos) {
                                const pagoUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.UI.pagoUI(detallesDelPago)
                                bloqueListaDePagos.appendChild(pagoUI)
                            }
                            bloqueTransacciones.appendChild(bloqueListaDePagos)
                        }
                        const enlacePagoUIRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_contenedorDinamicoTransacciones}"]`)
                        enlacePagoUIRenderizada.innerHTML = null
                        contenedorAdvertenciaInmersiva.appendChild(bloqueTransacciones)
                        enlacePagoUIRenderizada.appendChild(contenedorAdvertenciaInmersiva)
                    },
                    pagoUI: function (metadatos) {
                        const pagoUID = metadatos.pagoUID
                        const plataformaDePagoIDV = metadatos.plataformaDePagoIDV
                        const pagoUIDPasarela = metadatos.pagoUIDPasarela
                        const tarjetaDigitos = metadatos.tarjetaDigitos
                        const fechaPago = metadatos.fechaPago
                        const fechaPagoTZ_ISO = metadatos.fechaPagoTZ_ISO
                        const tarjeta = metadatos.tarjeta
                        const cantidad = metadatos.cantidad
                        const sumaDeLoReembolsado = metadatos.sumaDeLoReembolsado
                        const reembolsado = metadatos.reembolsado
                        const chequeUID = metadatos.chequeUID
                        const instanciaUID_contenedorDinamicoTransacciones = metadatos.instanciaUID_contenedorDinamicoTransacciones
                        const fechaPagoUTC_objeto = fechaPago.split("T")
                        const fechaUTC_array = fechaPagoUTC_objeto[0].split("-")
                        const horaUTC_array = fechaPagoUTC_objeto[1].split("-")[0]
                        const fechaPagoUTC_humana = `${fechaUTC_array[2]}/${fechaUTC_array[1]}/${fechaUTC_array[0]} ${horaUTC_array}`
                        const fechaPagoTZ_objeto = fechaPagoTZ_ISO.split("T")
                        const fechaTZ_array = fechaPagoTZ_objeto[0].split("-")
                        const horaTZ_array = fechaPagoTZ_objeto[1].split("-")[0]
                        const fechaPagoTZ_humana = `${fechaTZ_array[2]}/${fechaTZ_array[1]}/${fechaTZ_array[0]} ${horaTZ_array}`
                        const plataformaDePagoUI = {
                            efectivo: "Efectivo",
                            transferenciaBancaria: "Transferencia bancaria",
                            tarjeta: "Tarteja TPV",
                            pasarela: "Pasarela de pago",
                            cheque: "Cheque"
                        }
                        const bloqueDetallesDelPago = document.createElement("div")
                        bloqueDetallesDelPago.classList.add("flexVertical", "gap10", "borderRadius10", "backgroundGrey1", "padding10", "comportamientoBoton")
                        bloqueDetallesDelPago.setAttribute("pagoUID", pagoUID)
                        bloqueDetallesDelPago.addEventListener("click", () => {
                            const metadatos = {
                                pagoUID: pagoUID,
                                instanciaUID_contenedorDinamicoTransacciones: instanciaUID_contenedorDinamicoTransacciones
                            }
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.detallesDelPago.UI(metadatos)
                        })
                        let bloqueInfoDato = document.createElement("div")
                        bloqueInfoDato.classList.add("reservaDetalles_transacciones_bloqueInfoDato")
                        let bloqueInfo = document.createElement("div")
                        bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                        bloqueInfo.classList.add("negrita")
                        bloqueInfo.textContent = "Identificador del pago (pagoUID)"
                        bloqueInfoDato.appendChild(bloqueInfo)
                        let bloqueDato = document.createElement("div")
                        bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                        bloqueDato.textContent = pagoUID
                        bloqueInfoDato.appendChild(bloqueDato)
                        bloqueDetallesDelPago.appendChild(bloqueInfoDato)
                        bloqueInfoDato = document.createElement("div")
                        bloqueInfoDato.classList.add("reservaDetalles_transacciones_bloqueInfoDato")
                        bloqueInfo = document.createElement("div")
                        bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                        bloqueInfo.classList.add("negrita")
                        bloqueInfo.textContent = "Plataforma de pago"
                        bloqueInfoDato.appendChild(bloqueInfo)
                        bloqueDato = document.createElement("div")
                        bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                        bloqueDato.textContent = plataformaDePagoUI[plataformaDePagoIDV]
                        bloqueInfoDato.appendChild(bloqueDato)
                        bloqueDetallesDelPago.appendChild(bloqueInfoDato)
                        bloqueInfoDato = document.createElement("div")
                        bloqueInfoDato.classList.add("reservaDetalles_transacciones_bloqueInfoDato")
                        bloqueInfo = document.createElement("div")
                        bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                        bloqueInfo.textContent = "Identificador del pago dentro de la pasarela"
                        bloqueInfo.classList.add("negrita")
                        bloqueInfoDato.appendChild(bloqueInfo)
                        bloqueDato = document.createElement("div")
                        bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                        bloqueDato.textContent = pagoUIDPasarela
                        bloqueInfoDato.appendChild(bloqueDato)
                        if (plataformaDePagoIDV === "pasarela") {
                            bloqueDetallesDelPago.appendChild(bloqueInfoDato)
                        }
                        bloqueInfoDato = document.createElement("div")
                        bloqueInfoDato.classList.add("reservaDetalles_transacciones_bloqueInfoDato")
                        bloqueInfo = document.createElement("div")
                        bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                        bloqueInfo.classList.add("negrita")
                        bloqueInfo.textContent = "Tarjeta de crédito"
                        bloqueInfoDato.appendChild(bloqueInfo)
                        bloqueDato = document.createElement("div")
                        bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                        bloqueDato.textContent = `**** **** **** ${tarjetaDigitos} (${tarjeta})`
                        bloqueInfoDato.appendChild(bloqueDato)
                        if (plataformaDePagoIDV === "pasarela") {
                            bloqueDetallesDelPago.appendChild(bloqueInfoDato)
                        }
                        bloqueInfoDato = document.createElement("div")
                        bloqueInfoDato.classList.add("reservaDetalles_transacciones_bloqueInfoDato")
                        bloqueInfo = document.createElement("div")
                        bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                        bloqueInfo.classList.add("negrita")
                        bloqueInfo.textContent = "Fecha del pago en UTC"
                        bloqueInfoDato.appendChild(bloqueInfo)
                        bloqueDato = document.createElement("div")
                        bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                        bloqueDato.textContent = fechaPagoUTC_humana
                        bloqueInfoDato.appendChild(bloqueDato)
                        bloqueDetallesDelPago.appendChild(bloqueInfoDato)
                        bloqueInfoDato = document.createElement("div")
                        bloqueInfoDato.classList.add("reservaDetalles_transacciones_bloqueInfoDato")
                        bloqueInfo = document.createElement("div")
                        bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                        bloqueInfo.classList.add("negrita")
                        bloqueInfo.textContent = "Fecha del pago en hora local"
                        bloqueInfoDato.appendChild(bloqueInfo)
                        bloqueDato = document.createElement("div")
                        bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                        bloqueDato.textContent = fechaPagoTZ_humana
                        bloqueInfoDato.appendChild(bloqueDato)
                        bloqueDetallesDelPago.appendChild(bloqueInfoDato)
                        bloqueInfoDato = document.createElement("div")
                        bloqueInfoDato.classList.add("reservaDetalles_transacciones_bloqueInfoDato")
                        bloqueInfo = document.createElement("div")
                        bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                        bloqueInfo.classList.add("negrita")
                        bloqueInfo.textContent = "Cantidad del pago"
                        bloqueInfoDato.appendChild(bloqueInfo)
                        bloqueDato = document.createElement("div")
                        bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                        bloqueDato.textContent = cantidad + "$"
                        bloqueInfoDato.appendChild(bloqueDato)
                        bloqueDetallesDelPago.appendChild(bloqueInfoDato)
                        const bloqueSumaDeLoReembolsado = document.createElement("div")
                        bloqueSumaDeLoReembolsado.classList.add("reservaDetalles_transacciones_bloqueInfoDato")
                        bloqueInfo = document.createElement("div")
                        bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                        bloqueInfo.classList.add("negrita")
                        bloqueInfo.textContent = "Resumen de reembolsos"
                        bloqueSumaDeLoReembolsado.appendChild(bloqueInfo)
                        bloqueDato = document.createElement("div")
                        bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                        bloqueDato.textContent = `${sumaDeLoReembolsado}$, reembolsado ${reembolsado}`
                        bloqueSumaDeLoReembolsado.appendChild(bloqueDato)
                        if (sumaDeLoReembolsado) {
                            bloqueDetallesDelPago.appendChild(bloqueSumaDeLoReembolsado)
                        }
                        const bloqueChequeUID = document.createElement("div")
                        bloqueChequeUID.classList.add("reservaDetalles_transacciones_bloqueInfoDato")
                        bloqueInfo = document.createElement("div")
                        bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                        bloqueInfo.classList.add("negrita")
                        bloqueInfo.textContent = "Identificador del cheque"
                        bloqueChequeUID.appendChild(bloqueInfo)
                        bloqueDato = document.createElement("div")
                        bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                        bloqueDato.textContent = chequeUID
                        bloqueChequeUID.appendChild(bloqueDato)
                        if (chequeUID) {
                            bloqueDetallesDelPago.appendChild(bloqueChequeUID)
                        }
                        return bloqueDetallesDelPago
                    },
                    infoNoPagos: function () {
                        const infoNoPagos = document.createElement("div")
                        infoNoPagos.classList.add("reservaDetalles_transacciones_textoV1")
                        infoNoPagos.setAttribute("contenedor", "infoNoPagos")
                        infoNoPagos.textContent = "Esta reserva no tiene ningún pago. Los pagos que se realicen por la pasarela de pagos se mostrarán automáticamente aquí. Sin embargo, si ha cobrado esta reserva, por ejemplo, en efectivo o con un TPV, debería de añadir un pago manual. No es obligatorio añadir un pago manual, pero si quiere tener un seguimiento centralizado de todos los pagos en esta reserva, tiene esa opción."
                        return infoNoPagos
                    }
                },
                detallesDelPago: {
                    UI: async function (metadatos) {
                        const pagoUID = metadatos.pagoUID
                        const instanciaUID_contenedorDinamicoTransacciones = metadatos.instanciaUID_contenedorDinamicoTransacciones
                        document.body.style.overflow = "hidden";
                        const instanciaUIDDetalleDelPago = casaVitini.utilidades.codigoFechaInstancia()
                        const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                        const spinnerPorRenderizar = casaVitini.ui.componentes.spinner({
                            mensaje: "Esperando al servidor..."
                        })
                        const advertenciaInmersivaIU = document.createElement("div")
                        advertenciaInmersivaIU.setAttribute("class", "advertenciaInmersiva")
                        advertenciaInmersivaIU.setAttribute("componente", "advertenciaInmersiva")
                        advertenciaInmersivaIU.setAttribute("instanciaUID", instanciaUIDDetalleDelPago)
                        const contenedorAdvertenciaInmersiva = document.createElement("div")
                        contenedorAdvertenciaInmersiva.classList.add("contenedorAdvertencaiInmersiva")
                        const contenidoAdvertenciaInmersiva = document.createElement("div")
                        contenidoAdvertenciaInmersiva.classList.add("contenidoAdvertenciaInmersiva")
                        contenidoAdvertenciaInmersiva.setAttribute("espacio", "detallesDelPago")
                        contenidoAdvertenciaInmersiva.appendChild(spinnerPorRenderizar)
                        contenedorAdvertenciaInmersiva.appendChild(contenidoAdvertenciaInmersiva)
                        advertenciaInmersivaIU.appendChild(contenedorAdvertenciaInmersiva)
                        document.querySelector("main").appendChild(advertenciaInmersivaIU)
                        const ocultaPanales = () => {
                            const selectorContenedores = document.querySelector(`[instanciaUID="${instanciaUIDDetalleDelPago}"]`)
                            const contenedorNuevoReembolso = selectorContenedores.querySelector("[contenedor=nuevoReembolso]")
                            const contenedorEliminarPago = selectorContenedores.querySelector("[contenedor=eliminarPago]")
                            contenedorNuevoReembolso.innerHTML = null
                            contenedorNuevoReembolso.removeAttribute("style")
                            contenedorEliminarPago.innerHTML = null
                            contenedorEliminarPago.removeAttribute("style")
                        }
                        const transaccion = {
                            zona: "administracion/reservas/detallesReserva/transacciones/obtenerDetallesDelPago",
                            pagoUID: String(pagoUID)
                        }
                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        if (respuestaServidor?.error) {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                        }
                        if (respuestaServidor?.ok) {
                            const detallesDelPago = respuestaServidor.detallesDelPago
                            const plataformaDePagoIDV = detallesDelPago.plataformaDePagoIDV
                            const pagoUID = detallesDelPago.pagoUID
                            const pagoUIDPasarela = detallesDelPago.pagoUIDPasarela
                            const tarjetaDigitos = detallesDelPago.tarjetaDigitos
                            const fechaPagoUTC_ISO = detallesDelPago.fechaPagoUTC_ISO
                            const fechaPagoTZ_ISO = detallesDelPago.fechaPagoTZ_ISO
                            const fechaPagoUTC_objeto = fechaPagoUTC_ISO.split("T")
                            const fechaUTC_array = fechaPagoUTC_objeto[0].split("-")
                            const horaUTC_array = fechaPagoUTC_objeto[1].split("-")[0]
                            const fechaPagoUTC_humana = `${fechaUTC_array[2]}/${fechaUTC_array[1]}/${fechaUTC_array[0]} ${horaUTC_array}`
                            const fechaPagoTZ_objeto = fechaPagoTZ_ISO.split("T")
                            const fechaTZ_array = fechaPagoTZ_objeto[0].split("-")
                            const horaTZ_array = fechaPagoTZ_objeto[1].split("-")[0]
                            const fechaPagoTZ_humana = `${fechaTZ_array[2]}/${fechaTZ_array[1]}/${fechaTZ_array[0]} ${horaTZ_array}`
                            const tarjeta = detallesDelPago.tarjeta
                            const cantidad = detallesDelPago.cantidad
                            const sumaDeLoReembolsado = detallesDelPago.sumaDeLoReembolsado
                            const reembolsado = detallesDelPago.reembolsado
                            const deglosePorReembolso = respuestaServidor.deglosePorReembolso
                            const plataformaDePagoUI = {
                                efectivo: "Efectivo",
                                transferenciaBancaria: "Transferencia bancaria",
                                tarjeta: "Tarteja TPV",
                                pasarela: "Pasarela de pago",
                                cheque: "Cheque"
                            }
                            const selectorInstanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUIDDetalleDelPago}"]`)?.querySelector("[espacio=detallesDelPago]")
                            if (!selectorInstanciaRenderizada) {
                                return
                            }
                            selectorInstanciaRenderizada.innerHTML = null
                            const bloque = document.createElement("div")
                            bloque.classList.add("flexVertical", "gap6")
                            const info = document.createElement("div")
                            info.classList.add("padding14")
                            info.textContent = `Detalles del pago ${pagoUID} de la reserva ${reservaUID} junto con sus reembolsos. Desde aquí puedes ver los detalles de este pago y gestionar los reembolsos. Puedes crear reembolsos. Tanto los pagos hechos por la pasarela como los reembolsos enviados a la pasarela no se pueden eliminar. Solo se pueden eliminar los pagos manuales.`
                            bloque.appendChild(info)
                            selectorInstanciaRenderizada.appendChild(bloque)
                            const bloqueDetallesDelPago = document.createElement("div")
                            bloqueDetallesDelPago.classList.add("flexVertical", "gap6", "padding14", "borderRadius20", "backgroundGrey1")
                            bloqueDetallesDelPago.setAttribute("pagoUID", pagoUID)
                            let bloqueInfoDato = document.createElement("div")
                            bloqueInfoDato.classList.add("reservaDetalles_transacciones_bloqueInfoDato")
                            let bloqueInfo = document.createElement("div")
                            bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                            bloqueInfo.classList.add("negrita")
                            bloqueInfo.textContent = "Identificador del pago (pagoUID)"
                            bloqueInfoDato.appendChild(bloqueInfo)
                            let bloqueDato = document.createElement("div")
                            bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                            bloqueDato.textContent = pagoUID
                            bloqueInfoDato.appendChild(bloqueDato)
                            bloqueDetallesDelPago.appendChild(bloqueInfoDato)
                            bloqueInfoDato = document.createElement("div")
                            bloqueInfoDato.classList.add("reservaDetalles_transacciones_bloqueInfoDato")
                            bloqueInfo = document.createElement("div")
                            bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                            bloqueInfo.classList.add("negrita")
                            bloqueInfo.textContent = "Plataforma de pago"
                            bloqueInfoDato.appendChild(bloqueInfo)
                            bloqueDato = document.createElement("div")
                            bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                            bloqueDato.textContent = plataformaDePagoUI[plataformaDePagoIDV]
                            bloqueInfoDato.appendChild(bloqueDato)
                            bloqueDetallesDelPago.appendChild(bloqueInfoDato)
                            bloqueInfoDato = document.createElement("div")
                            bloqueInfoDato.classList.add("reservaDetalles_transacciones_bloqueInfoDato")
                            bloqueInfo = document.createElement("div")
                            bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                            bloqueInfo.textContent = "Identificador del pago dentro de la pasarela"
                            bloqueInfo.classList.add("negrita")
                            bloqueInfoDato.appendChild(bloqueInfo)
                            bloqueDato = document.createElement("div")
                            bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                            bloqueDato.textContent = pagoUIDPasarela
                            bloqueInfoDato.appendChild(bloqueDato)
                            if (plataformaDePagoIDV === "pasarela") {
                                bloqueDetallesDelPago.appendChild(bloqueInfoDato)
                            }
                            bloqueInfoDato = document.createElement("div")
                            bloqueInfoDato.classList.add("reservaDetalles_transacciones_bloqueInfoDato")
                            bloqueInfo = document.createElement("div")
                            bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                            bloqueInfo.classList.add("negrita")
                            bloqueInfo.textContent = "Tarjeta de crédito"
                            bloqueInfoDato.appendChild(bloqueInfo)
                            bloqueDato = document.createElement("div")
                            bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                            bloqueDato.textContent = `**** **** **** ${tarjetaDigitos} (${tarjeta})`
                            bloqueInfoDato.appendChild(bloqueDato)
                            if (plataformaDePagoIDV === "pasarela") {
                                bloqueDetallesDelPago.appendChild(bloqueInfoDato)
                            }
                            bloqueInfoDato = document.createElement("div")
                            bloqueInfoDato.classList.add("reservaDetalles_transacciones_bloqueInfoDato")
                            bloqueInfo = document.createElement("div")
                            bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                            bloqueInfo.classList.add("negrita")
                            bloqueInfo.textContent = "Fecha del pago UTC"
                            bloqueInfoDato.appendChild(bloqueInfo)
                            bloqueDato = document.createElement("div")
                            bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                            bloqueDato.textContent = fechaPagoUTC_humana
                            bloqueInfoDato.appendChild(bloqueDato)
                            bloqueDetallesDelPago.appendChild(bloqueInfoDato)
                            bloqueInfoDato = document.createElement("div")
                            bloqueInfoDato.classList.add("reservaDetalles_transacciones_bloqueInfoDato")
                            bloqueInfo = document.createElement("div")
                            bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                            bloqueInfo.classList.add("negrita")
                            bloqueInfo.textContent = "Fecha del pago hora local"
                            bloqueInfoDato.appendChild(bloqueInfo)
                            bloqueDato = document.createElement("div")
                            bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                            bloqueDato.textContent = fechaPagoTZ_humana
                            bloqueInfoDato.appendChild(bloqueDato)
                            bloqueDetallesDelPago.appendChild(bloqueInfoDato)
                            bloqueInfoDato = document.createElement("div")
                            bloqueInfoDato.classList.add("reservaDetalles_transacciones_bloqueInfoDato")
                            bloqueInfo = document.createElement("div")
                            bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                            bloqueInfo.classList.add("negrita")
                            bloqueInfo.textContent = "Cantidad del pago"
                            bloqueInfoDato.appendChild(bloqueInfo)
                            bloqueDato = document.createElement("div")
                            bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                            bloqueDato.setAttribute("cantidadPago", cantidad)
                            bloqueDato.textContent = cantidad + "$"
                            bloqueInfoDato.appendChild(bloqueDato)
                            bloqueDetallesDelPago.appendChild(bloqueInfoDato)
                            bloqueInfoDato = document.createElement("div")
                            bloqueInfoDato.classList.add("reservaDetalles_transacciones_bloqueInfoDato")
                            bloqueInfo = document.createElement("div")
                            bloqueInfo.classList.add("reservaDetalles_transacciones_bloqueInfo")
                            bloqueInfo.classList.add("negrita")
                            bloqueInfo.textContent = "Resumen de reembolsos"
                            bloqueInfoDato.appendChild(bloqueInfo)
                            bloqueDato = document.createElement("div")
                            bloqueDato.classList.add("reservaDetalles_transacciones_bloqueDato")
                            bloqueDato.setAttribute("sumaDeLoReembolsado", sumaDeLoReembolsado)
                            bloqueDato.textContent = `${sumaDeLoReembolsado}$, reembolsado ${reembolsado}`
                            bloqueInfoDato.appendChild(bloqueDato)
                            if (sumaDeLoReembolsado) {
                                bloqueDetallesDelPago.appendChild(bloqueInfoDato)
                            }
                            selectorInstanciaRenderizada.appendChild(bloqueDetallesDelPago)
                            const contenedorBotones = document.createElement("div")
                            contenedorBotones.classList.add("flexVertical", "gap10")
                            const botonCrearReembolso = document.createElement("div")
                            botonCrearReembolso.classList.add("botonV1BlancoIzquierda")
                            botonCrearReembolso.textContent = "Crear un reembolso"
                            botonCrearReembolso.addEventListener("click", () => {
                                ocultaPanales()
                                const selectorContenedorReembolso = document.querySelector("[contenedor=nuevoReembolso]")
                                selectorContenedorReembolso.textContent = null
                                const metadatos = {
                                    pagoUID: pagoUID,
                                    instanciaUID_contenedorDinamicoTransacciones: instanciaUID_contenedorDinamicoTransacciones,
                                    instanciaUIDDetalleDelPago: instanciaUIDDetalleDelPago
                                }
                                casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.reembolsos.reembolsoUI(metadatos)
                            })
                            contenedorBotones.appendChild(botonCrearReembolso)
                            const botonEliminarPago = document.createElement("div")
                            botonEliminarPago.classList.add("botonV1BlancoIzquierda")
                            botonEliminarPago.textContent = "Eliminar pago"
                            if (plataformaDePagoIDV !== "pasarela") {
                                contenedorBotones.appendChild(botonEliminarPago)
                            }
                            botonEliminarPago.addEventListener("click", () => {
                                ocultaPanales()
                                const selectorContenedorEliminarPago = document.querySelector("[contenedor=eliminarPago]")
                                selectorContenedorEliminarPago.innerHTML = null
                                const metadatos = {
                                    instanciaUIDDetalleDelPago: instanciaUIDDetalleDelPago
                                }
                                const eliminarPagoUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.eliminarPagoManual.UI(metadatos)
                                selectorContenedorEliminarPago.appendChild(eliminarPagoUI)
                                selectorContenedorEliminarPago.style.display = "flex"
                            })
                            const botonCerrar = document.createElement("div")
                            botonCerrar.classList.add("botonV1")
                            botonCerrar.textContent = "Cerrar detalles del pago"
                            botonCerrar.addEventListener("click", casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas)
                            contenedorBotones.appendChild(botonCerrar)
                            selectorInstanciaRenderizada.appendChild(contenedorBotones)
                            const contenedorEliminarPago = document.createElement("div")
                            contenedorEliminarPago.classList.add("flexVertical", "gap6", "ocultoInicial")
                            contenedorEliminarPago.setAttribute("contenedor", "eliminarPago")
                            selectorInstanciaRenderizada.appendChild(contenedorEliminarPago)
                            const contenedorCrearReembolso = document.createElement("div")
                            contenedorCrearReembolso.classList.add("flexVertical", "gap6", "ocultoInicial")
                            contenedorCrearReembolso.setAttribute("contenedor", "nuevoReembolso")
                            selectorInstanciaRenderizada.appendChild(contenedorCrearReembolso)
                            const contenedorReembolsos = document.createElement("div")
                            contenedorReembolsos.classList.add("flexVertical", "gap6", "padding6", "borderRadius20", "borderGrey1")
                            if (deglosePorReembolso.length === 0) {
                                const info = document.createElement("div")
                                info.classList.add("padding10", "textoCentrado")
                                info.textContent = "Este pago no tiene ningún reembolso"
                                contenedorReembolsos.appendChild(info)
                            }
                            const botonOpcionesReembolsoUI = (metadatos) => {
                                const botonEliminarReembolso = document.createElement("div")
                                botonEliminarReembolso.classList.add("botonV1BlancoIzquierda_sinRadius", "borderRadius12")
                                botonEliminarReembolso.textContent = "Opciones del reembolso"
                                botonEliminarReembolso.addEventListener("click", () => {
                                    opcionesReembolsoUI(metadatos)
                                })
                                return botonEliminarReembolso
                            }
                            const restaurarTodasLasOpcionesDeTodosLosReembolsos = (pagoUID, instanciaUIDDetalleDelPago) => {
                                const reembolsosOpcionesDesplegadas = document.querySelector(`[instanciaUID="${instanciaUIDDetalleDelPago}"]`)?.querySelectorAll("[contenedor=opcionesDelReembolso][estado=opcionesDesplegadas]")
                                reembolsosOpcionesDesplegadas.forEach(contenedorOpcionesReembolso => {
                                    contenedorOpcionesReembolso.innerHTML = null
                                    const reembolsoUID = contenedorOpcionesReembolso.closest("[reembolsoUID]").getAttribute("reembolsoUID")
                                    const metadatosOpcionesReembolso = {
                                        instanciaUIDDetalleDelPago: instanciaUIDDetalleDelPago,
                                        reembolsoUID: reembolsoUID,
                                        pagoIUD: pagoUID
                                    }
                                    contenedorOpcionesReembolso.appendChild(botonOpcionesReembolsoUI(metadatosOpcionesReembolso))
                                });
                            }
                            const opcionesReembolsoUI = (metadatos) => {
                                const reembolsoUID = metadatos.reembolsoUID
                                const instanciaUIDDetalleDelPago = metadatos.instanciaUIDDetalleDelPago
                                const pagoUID = metadatos.pagoUID
                                const instanciaUID_contenedorDinamicoTransacciones = metadatos.instanciaUID_contenedorDinamicoTransacciones
                                restaurarTodasLasOpcionesDeTodosLosReembolsos(pagoUID, instanciaUIDDetalleDelPago)
                                const selectorReembolso = document.querySelector(`[reembolsoUID="${reembolsoUID}"]`).querySelector("[contenedor=opcionesDelReembolso]")
                                selectorReembolso.setAttribute("estado", "opcionesDesplegadas")
                                selectorReembolso.innerHTML = null
                                const contenedor = document.createElement("div")
                                contenedor.classList.add("administracion_reservas_detallesReserva_transacciones_opcionesReembolso")
                                const campoPalabra = document.createElement("input")
                                campoPalabra.classList.add("botonV1BlancoIzquierda_noSeleccionable_sinRadius")
                                campoPalabra.style.borderRadius = "12px"
                                campoPalabra.setAttribute("campo", "palabra")
                                campoPalabra.placeholder = "Escribe la palabra eliminar"
                                selectorReembolso.appendChild(campoPalabra)
                                const botonEliminarReembolso = document.createElement("div")
                                botonEliminarReembolso.classList.add("botonV1BlancoIzquierda_sinRadius", "borderRadius12")
                                botonEliminarReembolso.textContent = "Confirmar la eliminación irreversible del reembolso"
                                botonEliminarReembolso.addEventListener("click", () => {
                                    const metadatosEliminarReembolso = {
                                        instanciaUIDDetalleDelPago: instanciaUIDDetalleDelPago,
                                        reembolsoUID: reembolsoUID,
                                        instanciaUID_contenedorDinamicoTransacciones: instanciaUID_contenedorDinamicoTransacciones
                                    }
                                    casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.reembolsos.eliminarReembolso(metadatosEliminarReembolso)
                                })
                                selectorReembolso.appendChild(botonEliminarReembolso)
                                const botonCerrarOpcionesDeReembolso = document.createElement("div")
                                botonCerrarOpcionesDeReembolso.classList.add("botonV1BlancoIzquierda_sinRadius", "borderRadius12")
                                botonCerrarOpcionesDeReembolso.textContent = "Cerrar opciones del reembolso"
                                botonCerrarOpcionesDeReembolso.addEventListener("click", () => {
                                    restaurarTodasLasOpcionesDeTodosLosReembolsos(pagoUID, instanciaUIDDetalleDelPago)
                                })
                                selectorReembolso.appendChild(botonCerrarOpcionesDeReembolso)
                            }
                            deglosePorReembolso.forEach((detallesDelReembolso) => {
                                const reembolsoUID = detallesDelReembolso.reembolsoUID
                                const plataformaDePagoIDV = detallesDelReembolso.plataformaDePagoIDV
                                const cantidad = detallesDelReembolso.cantidad
                                const reembolsoUIDPasarela = detallesDelReembolso.reembolsoUIDPasarela
                                const fechaCreacionUTC_ISO = detallesDelReembolso.fechaCreacionUTC_ISO
                                const fechaCreacionTZ_ISO = detallesDelReembolso.fechaCreacionTZ_ISO
                                const fechaActualizacionUTC_ISO = detallesDelReembolso.fechaActualizacionUTC_ISO
                                const fechaActualizacionTZ_ISO = detallesDelReembolso.fechaActualizacionTZ_ISO
                                const fechaCreacionUTC_objeto = fechaCreacionUTC_ISO.split("T")
                                const fechaCreacionUTC_array = fechaCreacionUTC_objeto[0].split("-")
                                const horaCreacionUTC_array = fechaCreacionUTC_objeto[1].split("-")[0]
                                const fechaCreacionUTC_humana = `${fechaCreacionUTC_array[2]}/${fechaCreacionUTC_array[1]}/${fechaCreacionUTC_array[0]} ${horaCreacionUTC_array}`
                                const fechaCreacionTZ_objeto = fechaCreacionTZ_ISO.split("T")
                                const fechaCreacionTZ_array = fechaCreacionTZ_objeto[0].split("-")
                                const horaCreacionTZ_array = fechaCreacionTZ_objeto[1].split("-")[0]
                                const fechaCreacionTZ_humana = `${fechaCreacionTZ_array[2]}/${fechaCreacionTZ_array[1]}/${fechaCreacionTZ_array[0]} ${horaCreacionTZ_array}`
                                const fechaActualizacionUTC_objeto = fechaActualizacionUTC_ISO?.split("T") || []
                                const fechaActualizacionUTC_array = fechaActualizacionUTC_objeto[0]?.split("-") || []
                                const horaActualizacionUTC_array = fechaActualizacionUTC_objeto[1]?.split("-")[0] || []
                                const fechaActualizacionUTC_humana = `${fechaActualizacionUTC_array[2]}/${fechaActualizacionUTC_array[1]}/${fechaActualizacionUTC_array[0]} ${horaActualizacionUTC_array}`
                                const fechaActualizacionTZ_objeto = fechaActualizacionTZ_ISO?.split("T") || []
                                const fechaActualizacionTZ_array = fechaActualizacionTZ_objeto[0]?.split("-") || []
                                const horaActualizacionTZ_array = fechaActualizacionTZ_objeto[1]?.split("-")[0] || []
                                const fechaActualizacionTZ_humana = `${fechaActualizacionTZ_array[2]}/${fechaActualizacionTZ_array[1]}/${fechaActualizacionTZ_array[0]} ${horaActualizacionTZ_array}`
                                const plataformaDePagoUI = {
                                    efectivo: "Efectivo",
                                    transferenciaBancaria: "Transferencia bancaria",
                                    tarjeta: "Tarteja TPV",
                                    pasarela: "Pasarela de pago",
                                    cheque: "Cheque"
                                }
                                const contenedorRembolsoEnDetalle = document.createElement("div")
                                contenedorRembolsoEnDetalle.classList.add("flexVertical", "gap6", "padding6", "borderRadius16", "backgroundGrey1")
                                contenedorRembolsoEnDetalle.setAttribute("reembolsoUID", reembolsoUID)
                                const contenedorData = document.createElement("div")
                                contenedorData.classList.add(
                                    "flexVertical", "gap10", "padding14"
                                )
                                contenedorRembolsoEnDetalle.appendChild(contenedorData)
                                const tituloReembolso = document.createElement("div")
                                tituloReembolso.classList.add("administracion_reservas_detallesReservas_transacciones_reembolsos_contenedorReembolsoEnDetalle_tituloReembolso")
                                tituloReembolso.classList.add("negrita")
                                tituloReembolso.textContent = "Reembolso " + reembolsoUID
                                contenedorData.appendChild(tituloReembolso)
                                let bloque = document.createElement("div")
                                bloque.classList.add("administracion_reservas_detallesReservas_transacciones_reembolsos_contenedorReembolsoEnDetalle_bloque")
                                let bloqueTitulo = document.createElement("div")
                                bloqueTitulo.classList.add("administracion_reservas_detallesReservas_transacciones_reembolsos_contenedorReembolsoEnDetalle_bloqueTitulo")
                                bloqueTitulo.textContent = "Plataforma de reembolso"
                                bloque.appendChild(bloqueTitulo)
                                let bloqueDato = document.createElement("div")
                                bloqueDato.classList.add("administracion_reservas_detallesReservas_transacciones_reembolsos_contenedorReembolsoEnDetalle_bloqueDato");
                                bloqueDato.classList.add("negrita")
                                bloqueDato.textContent = plataformaDePagoUI[plataformaDePagoIDV]
                                bloque.appendChild(bloqueDato)
                                contenedorData.appendChild(bloque)
                                bloque = document.createElement("div")
                                bloque.classList.add("administracion_reservas_detallesReservas_transacciones_reembolsos_contenedorReembolsoEnDetalle_bloque")
                                bloqueTitulo = document.createElement("div")
                                bloqueTitulo.classList.add("administracion_reservas_detallesReservas_transacciones_reembolsos_contenedorReembolsoEnDetalle_bloqueTitulo")
                                bloqueTitulo.textContent = "Cantidad del reembolso"
                                bloque.appendChild(bloqueTitulo)
                                bloqueDato = document.createElement("div")
                                bloqueDato.classList.add("administracion_reservas_detallesReservas_transacciones_reembolsos_contenedorReembolsoEnDetalle_bloqueDato");
                                bloqueDato.classList.add("negrita")
                                bloqueDato.textContent = cantidad + "$"
                                bloque.appendChild(bloqueDato)
                                contenedorData.appendChild(bloque)
                                const bloqueReembolsoUIDPasarela = document.createElement("div")
                                bloqueReembolsoUIDPasarela.classList.add("administracion_reservas_detallesReservas_transacciones_reembolsos_contenedorReembolsoEnDetalle_bloque")
                                bloqueTitulo = document.createElement("div")
                                bloqueTitulo.classList.add("administracion_reservas_detallesReservas_transacciones_reembolsos_contenedorReembolsoEnDetalle_bloqueTitulo")
                                bloqueTitulo.textContent = "Reembolso UID en pasarela"
                                bloqueReembolsoUIDPasarela.appendChild(bloqueTitulo)
                                bloqueDato = document.createElement("div")
                                bloqueDato.classList.add("administracion_reservas_detallesReservas_transacciones_reembolsos_contenedorReembolsoEnDetalle_bloqueDato")
                                bloqueDato.classList.add("negrita")
                                bloqueDato.textContent = reembolsoUIDPasarela
                                bloqueReembolsoUIDPasarela.appendChild(bloqueDato)
                                if (plataformaDePagoIDV === "pasarela") {
                                    contenedorData.appendChild(bloqueReembolsoUIDPasarela)
                                }
                                bloque = document.createElement("div")
                                bloque.classList.add("administracion_reservas_detallesReservas_transacciones_reembolsos_contenedorReembolsoEnDetalle_bloque")
                                bloqueTitulo = document.createElement("div")
                                bloqueTitulo.classList.add("administracion_reservas_detallesReservas_transacciones_reembolsos_contenedorReembolsoEnDetalle_bloqueTitulo")
                                bloqueTitulo.textContent = "Fecha de creación UTC"
                                bloque.appendChild(bloqueTitulo)
                                bloqueDato = document.createElement("div")
                                bloqueDato.classList.add("administracion_reservas_detallesReservas_transacciones_reembolsos_contenedorReembolsoEnDetalle_bloqueDato")
                                bloqueDato.classList.add("negrita")
                                bloqueDato.textContent = fechaCreacionUTC_humana
                                bloque.appendChild(bloqueDato)
                                contenedorData.appendChild(bloque)
                                bloque = document.createElement("div")
                                bloque.classList.add("administracion_reservas_detallesReservas_transacciones_reembolsos_contenedorReembolsoEnDetalle_bloque")
                                bloqueTitulo = document.createElement("div")
                                bloqueTitulo.classList.add("administracion_reservas_detallesReservas_transacciones_reembolsos_contenedorReembolsoEnDetalle_bloqueTitulo")
                                bloqueTitulo.textContent = "Fecha de creación hora local"
                                bloque.appendChild(bloqueTitulo)
                                bloqueDato = document.createElement("div")
                                bloqueDato.classList.add("administracion_reservas_detallesReservas_transacciones_reembolsos_contenedorReembolsoEnDetalle_bloqueDato")
                                bloqueDato.classList.add("negrita")
                                bloqueDato.textContent = fechaCreacionTZ_humana
                                bloque.appendChild(bloqueDato)
                                contenedorData.appendChild(bloque)
                                bloque = document.createElement("div")
                                bloque.classList.add("administracion_reservas_detallesReservas_transacciones_reembolsos_contenedorReembolsoEnDetalle_bloque")
                                bloqueTitulo = document.createElement("div")
                                bloqueTitulo.classList.add("administracion_reservas_detallesReservas_transacciones_reembolsos_contenedorReembolsoEnDetalle_bloqueTitulo")
                                bloqueTitulo.textContent = "Fecha de actualización UTC"
                                bloque.appendChild(bloqueTitulo)
                                bloqueDato = document.createElement("div")
                                bloqueDato.classList.add("administracion_reservas_detallesReservas_transacciones_reembolsos_contenedorReembolsoEnDetalle_bloqueDato")
                                bloqueDato.classList.add("negrita")
                                bloqueDato.textContent = fechaActualizacionUTC_humana
                                bloque.appendChild(bloqueDato)
                                if (plataformaDePagoIDV === "pasarela") {
                                    contenedorData.appendChild(bloque)
                                }
                                bloque = document.createElement("div")
                                bloque.classList.add("administracion_reservas_detallesReservas_transacciones_reembolsos_contenedorReembolsoEnDetalle_bloque")
                                bloqueTitulo = document.createElement("div")
                                bloqueTitulo.classList.add("administracion_reservas_detallesReservas_transacciones_reembolsos_contenedorReembolsoEnDetalle_bloqueTitulo")
                                bloqueTitulo.textContent = "Fecha de actualización UTC"
                                bloque.appendChild(bloqueTitulo)
                                bloqueDato = document.createElement("div")
                                bloqueDato.classList.add("administracion_reservas_detallesReservas_transacciones_reembolsos_contenedorReembolsoEnDetalle_bloqueDato")
                                bloqueDato.classList.add("negrita")
                                bloqueDato.textContent = fechaActualizacionTZ_humana
                                bloque.appendChild(bloqueDato)
                                if (plataformaDePagoIDV === "pasarela") {
                                    contenedorData.appendChild(bloque)
                                }
                                const contenedorBotones = document.createElement("div")
                                contenedorBotones.classList.add("flexVertical", "gap6")
                                contenedorBotones.setAttribute("contenedor", "opcionesDelReembolso")
                                const metadatosOpcionesReembolso = {
                                    instanciaUID_contenedorDinamicoTransacciones: instanciaUID_contenedorDinamicoTransacciones,
                                    instanciaUIDDetalleDelPago: instanciaUIDDetalleDelPago,
                                    reembolsoUID: reembolsoUID,
                                    pagoIUD: pagoUID
                                }
                                contenedorBotones.appendChild(botonOpcionesReembolsoUI(metadatosOpcionesReembolso))
                                if (plataformaDePagoIDV !== "pasarela") {
                                    contenedorRembolsoEnDetalle.appendChild(contenedorBotones)
                                }
                                contenedorReembolsos.appendChild(contenedorRembolsoEnDetalle)
                            })
                            selectorInstanciaRenderizada.appendChild(contenedorReembolsos)
                        }
                    },
                    confirmar: async function () {
                        const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                        const nombreEnlace = document.querySelector("[espacio=formularioCrearEnlaceDePago] [campo=nombreEnlace]")
                        const cantidad = document.querySelector("[espacio=formularioCrearEnlaceDePago] [campo=cantidad]")
                        const horasCaducidad = document.querySelector("[espacio=formularioCrearEnlaceDePago] [campo=horasCaducidad]")
                        const transaccion = {
                            zona: "administracion/enlacesDePago/crearNuevoEnlace",
                            reservaUID: reservaUID,
                            nombreEnlace: nombreEnlace.value,
                            cantidad: cantidad.value,
                            horasCaducidad: horasCaducidad.value,
                        }
                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        if (respuestaServidor?.error) {
                            casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                        }
                        if (respuestaServidor?.ok) {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.UI.enlacesDePago()
                        }
                    }
                },
                reembolsos: {
                    reembolsoUI: async function (metadatos) {
                        const pagoUID = metadatos.pagoUID
                        const instanciaUID_contenedorDinamicoTransacciones = metadatos.instanciaUID_contenedorDinamicoTransacciones
                        const instanciaUIDDetalleDelPago = metadatos.instanciaUIDDetalleDelPago
                        const selectorContenedorCrearReembolso = document.querySelector(`[instanciaUID="${instanciaUIDDetalleDelPago}"] [contenedor=nuevoReembolso]`)
                        selectorContenedorCrearReembolso.style.display = "flex"
                        const mostrarContenedorPorTipo = (tipoReembolso) => {
                            const selectorTipoContenedores = selectorContenedorCrearReembolso.querySelectorAll("[contenedorTipoReembolso]")
                            selectorTipoContenedores.forEach((contenedor) => {
                                contenedor.style.display = "none"
                            })
                            selectorContenedorCrearReembolso.querySelector(`[contenedorTipoReembolso="${tipoReembolso}"]`).removeAttribute("style")
                        }
                        const reseteaBotonesTipoReembolso = () => {
                            const selectorBotonesTipoReembolso = selectorContenedorCrearReembolso.querySelectorAll("[botonTipoReembolso]")
                            selectorBotonesTipoReembolso.forEach((botonTipoReembolso) => {
                                botonTipoReembolso.removeAttribute("style")
                                botonTipoReembolso.removeAttribute("tipoReembolsoSeleccionado")
                            })
                        }
                        const maximoReembolsable = async () => {
                            const totalPagado = document.querySelector(`[instanciaUID="${instanciaUIDDetalleDelPago}"] [cantidadPago]`).getAttribute("cantidadPago")
                            const totalReembolsado = document.querySelector(`[instanciaUID="${instanciaUIDDetalleDelPago}"] [sumaDeLoReembolsado]`)?.getAttribute("sumaDeLoReembolsado")
                            const selectorUI = document.querySelector(`[instanciaUID="${instanciaUIDDetalleDelPago}"] [componente=totalReembolsable]`)
                            selectorUI.textContent = "Esperando resultado del calculo..."
                            if (!totalReembolsado) {
                                selectorUI.textContent = `Total reembolsable ${totalPagado}$`
                                selectorUI.setAttribute("totalReembolsable", totalPagado)
                            }
                            try {
                                const transaccion = {
                                    zona: "administracion/componentes/calculadora",
                                    numero1: totalPagado,
                                    numero2: totalReembolsado || "0.00",
                                    operador: "-"
                                }
                                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                                if (respuestaServidor?.error) {
                                    casaVitini.shell.controladoresUI.ocultarMenusVolatiles()
                                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                                }
                                if (respuestaServidor?.ok) {
                                    const resultado = Number(respuestaServidor?.ok).toFixed(2)
                                    selectorUI.textContent = `Total reembolsable ${resultado}$`
                                    selectorUI.setAttribute("totalReembolsable", resultado)
                                }
                            } catch (errorCapturado) {
                                const error = errorCapturado.message
                                casaVitini.ui.componentes.advertenciaInmersiva(error)
                            }
                        }
                        const reglaDeTresPorcentaje = async (porcentaje) => {
                            let totalReembolsable
                            const selectorTotalReembolsableConReeembolsos = document.querySelector(`[instanciaUID="${instanciaUIDDetalleDelPago}"] [totalReembolsable]`)
                            if (selectorTotalReembolsableConReeembolsos) {
                                totalReembolsable = selectorTotalReembolsableConReeembolsos.getAttribute("totalReembolsable")
                            } else {
                                const selectorTotalReembolsableSinReembolsos = document.querySelector(`[instanciaUID="${instanciaUIDDetalleDelPago}"] [cantidadPago]`).getAttribute("cantidadPago")
                                totalReembolsable = selectorTotalReembolsableSinReembolsos
                            }
                            const selectorUI = document.querySelector(`[instanciaUID="${instanciaUIDDetalleDelPago}"] [informacionPorcentaje=informacionPorcentaje]`)
                            selectorUI.innerHTML = "Calculando..."
                            try {
                                const transaccion = {
                                    zona: "administracion/componentes/calculadora",
                                    numero1: totalReembolsable,
                                    numero2: porcentaje,
                                    operador: "%"
                                }
                                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                                if (respuestaServidor?.error) {
                                    casaVitini.shell.controladoresUI.ocultarMenusVolatiles()
                                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                                }
                                if (respuestaServidor?.ok) {
                                    const resultado = Number(respuestaServidor?.ok).toFixed(2)
                                    selectorUI.textContent = `El reembolso sería de ${resultado}$ (El ${porcentaje}% de ${totalReembolsable}$ es ${resultado}$)`
                                    selectorUI.setAttribute("totalReembolso", resultado)
                                }
                            } catch (errorCapturado) {
                                const error = errorCapturado.message
                                casaVitini.ui.componentes.advertenciaInmersiva(error)
                            }
                        };
                        const contenedorEmitirReembolso = document.createElement("div")
                        contenedorEmitirReembolso.classList.add("flexVertical", "padding6", "gap6", "borderGrey1", "borderRadius20")
                        contenedorEmitirReembolso.setAttribute("contenedor", "emitirReembolso")
                        const titulo = document.createElement("p")
                        titulo.classList.add("tituloGris", "padding14")
                        titulo.textContent = "Realizar un reembolso"
                        contenedorEmitirReembolso.appendChild(titulo)
                        const bloqueReembolso = document.createElement("div")
                        bloqueReembolso.classList.add("flexVertical", "gap6")
                        let bloqueInterno = document.createElement("div")
                        bloqueInterno.classList.add("flexVertical", "gap6", "padding14")
                        const info = document.createElement("div")
                        info.textContent = `Para realizar el reembolso, por favor, escribe reembolso en minúsculas en el campo de texto y, pulse realizar reembolso. Se exige escribir reembolso como medida para evitar un falso clic en el botón de confirmación al querer hacer clic en el botón de cerrar opciones de emisión de reembolso.`
                        bloqueInterno.appendChild(info)
                        bloqueReembolso.appendChild(bloqueInterno)
                        const infoTotalReembolsable = document.createElement("div")
                        infoTotalReembolsable.classList.add("negrita")
                        infoTotalReembolsable.setAttribute("componente", "totalReembolsable")
                        bloqueInterno.appendChild(infoTotalReembolsable)
                        bloqueReembolso.appendChild(bloqueInterno)
                        const contenedorTipoReembolsos = document.createElement("div")
                        contenedorTipoReembolsos.classList.add("gridHorizontal2C", "borderRadius18", "backgroundGrey1", "padding6", "gap6")
                        const reembolsoPorCantidad = document.createElement("div")
                        reembolsoPorCantidad.classList.add("flexVertical", "borderRadius12", "backgroundGrey1", "padding10", "textoCentrado")
                        reembolsoPorCantidad.textContent = "Por cantidad"
                        reembolsoPorCantidad.setAttribute("botonTipoReembolso", "porCantidad")
                        reembolsoPorCantidad.setAttribute("tipoReembolso", "porCantidad")
                        reembolsoPorCantidad.addEventListener("click", (e) => {
                            reseteaBotonesTipoReembolso()
                            e.target.setAttribute("tipoReembolsoSeleccionado", "porCantidad")
                            e.target.style.background = "blue"
                            e.target.style.color = "white"
                            const tipoReembolso = e.target.getAttribute("tipoReembolso")
                            mostrarContenedorPorTipo(tipoReembolso)
                        })
                        contenedorTipoReembolsos.appendChild(reembolsoPorCantidad)
                        const reembolsoPorPorcentaje = document.createElement("div")
                        reembolsoPorPorcentaje.classList.add("flexVertical", "borderRadius12", "backgroundGrey1", "padding10", "textoCentrado")
                        reembolsoPorPorcentaje.textContent = "Por porcentaje"
                        reembolsoPorPorcentaje.setAttribute("botonTipoReembolso", "porPorcentaje")
                        reembolsoPorPorcentaje.setAttribute("tipoReembolso", "porPorcentaje")
                        reembolsoPorPorcentaje.addEventListener("click", (e) => {
                            reseteaBotonesTipoReembolso()
                            e.target.setAttribute("tipoReembolsoSeleccionado", "porPorcentaje")
                            e.target.style.background = "blue"
                            e.target.style.color = "white"
                            const tipoReembolso = e.target.getAttribute("tipoReembolso")
                            mostrarContenedorPorTipo(tipoReembolso)
                        })
                        contenedorTipoReembolsos.appendChild(reembolsoPorPorcentaje)
                        bloqueReembolso.appendChild(contenedorTipoReembolsos)
                        const contenedorDinamicoTipo = document.createElement("div")
                        contenedorDinamicoTipo.classList.add("flexVertical", "gap6")
                        const contenedorPorCantidad = document.createElement("div")
                        contenedorPorCantidad.classList.add("flexVertical", "gap6")
                        contenedorPorCantidad.style.display = "none"
                        contenedorPorCantidad.setAttribute("contenedorTipoReembolso", "porCantidad")
                        const infoPorCantidad = document.createElement("div")
                        infoPorCantidad.classList.add("padding14")
                        infoPorCantidad.textContent = `Determina la cantidad total del reembolso. Si quieres emitir, por ejemplo, un reembolso de 100, entonces debes de escribir también los dos decimales separados por punto, por ejemplo, 100.00. Luego establece la moneda.`
                        contenedorPorCantidad.appendChild(infoPorCantidad)
                        const campoCantidadReembolso = document.createElement("input")
                        campoCantidadReembolso.classList.add("detallesReserva_reembolso_campo")
                        campoCantidadReembolso.setAttribute("campo", "porCantidad")
                        campoCantidadReembolso.placeholder = "0.00"
                        contenedorPorCantidad.appendChild(campoCantidadReembolso)
                        const campoMonedaReembolso = document.createElement("input")
                        campoMonedaReembolso.classList.add("detallesReserva_reembolso_campo")
                        campoMonedaReembolso.setAttribute("campo", "moneda")
                        campoMonedaReembolso.placeholder = "EUR"
                        contenedorDinamicoTipo.appendChild(contenedorPorCantidad)
                        const contenedorPorPorcentaje = document.createElement("div")
                        contenedorPorPorcentaje.classList.add("flexVertical", "gap6")
                        contenedorPorPorcentaje.style.display = "none"
                        contenedorPorPorcentaje.setAttribute("contenedorTipoReembolso", "porPorcentaje")
                        const contenedorInfo = document.createElement("div")
                        contenedorInfo.classList.add("flexVertical", "gap6", "padding14")
                        contenedorPorPorcentaje.appendChild(contenedorInfo)
                        const infoPorPorcentaje = document.createElement("div")
                        infoPorPorcentaje.textContent = `Determina el porcentaje del reembolso.`
                        contenedorInfo.appendChild(infoPorPorcentaje)
                        const resultadoPorcentaje = document.createElement("div")
                        resultadoPorcentaje.classList.add("negrita")
                        resultadoPorcentaje.setAttribute("informacionPorcentaje", "informacionPorcentaje")
                        resultadoPorcentaje.textContent = `Escribe un porcentaje para ver su cálculo`
                        contenedorInfo.appendChild(resultadoPorcentaje)
                        const campoPorcentajeReembolso = document.createElement("input")
                        campoPorcentajeReembolso.classList.add("detallesReserva_reembolso_campo")
                        campoPorcentajeReembolso.placeholder = "0%"
                        campoPorcentajeReembolso.addEventListener("input", (e) => {
                            const entrada = e.target.value
                            const selectorInformacionResultadoPorcentaje = document.querySelector("[informacionPorcentaje=informacionPorcentaje]")
                            const controlFormato = /^\d+%$/.test(entrada);
                            if (entrada.length === 0) {
                                selectorInformacionResultadoPorcentaje.textContent = "Escribe un porcentaje para ver su cálculo"
                                e.target.removeAttribute("totalReembolso")
                            } else {
                                if (!controlFormato) {
                                    selectorInformacionResultadoPorcentaje.textContent = "No te olvides del signo de porcentaje %, solo números enteros sin decimales."
                                    e.target.removeAttribute("totalReembolso")
                                } else {
                                    const numeroLimpio = entrada.replace("%", "")
                                    reglaDeTresPorcentaje(numeroLimpio)
                                }
                            }
                        })
                        contenedorPorPorcentaje.appendChild(campoPorcentajeReembolso)
                        contenedorDinamicoTipo.appendChild(contenedorPorPorcentaje)
                        const campoMoneda = document.createElement("input")
                        campoMoneda.classList.add("detallesReserva_reembolso_campo")
                        campoMoneda.setAttribute("campo", "moneda")
                        campoMoneda.placeholder = "Moneda, por ejemplo EUR o USD"
                        contenedorDinamicoTipo.appendChild(contenedorPorPorcentaje)
                        const selectorTipoReembolso = document.createElement("select")
                        selectorTipoReembolso.addEventListener("change", (e) => {
                            const tipoReembolso = e.target.value
                            const contenedorEmitirReembolso = e.target.closest("[contenedor=emitirReembolso]")
                            const contenedorPalabra = contenedorEmitirReembolso.querySelector("[contenedor=palabraReembolso]")
                            if (tipoReembolso === "pasarela") {
                                contenedorPalabra.classList.remove("ocultoInicial")
                            } else {
                                contenedorPalabra.classList.add("ocultoInicial")
                            }
                        })
                        selectorTipoReembolso.setAttribute("campo", "plataformaDePagoEntrada")
                        const opcionPreterminada = document.createElement("option");
                        opcionPreterminada.value = "";
                        opcionPreterminada.selected = "true"
                        opcionPreterminada.disabled = "true"
                        opcionPreterminada.text = "Selecciona como realizar este reeembolso";
                        selectorTipoReembolso.add(opcionPreterminada);
                        let opcion = document.createElement("option");
                        opcion.value = "efectivo";
                        opcion.text = "Efectivo";
                        selectorTipoReembolso.add(opcion);
                        opcion = document.createElement("option");
                        opcion.value = "tarjeta";
                        opcion.text = "Tarjeta TPV";
                        selectorTipoReembolso.add(opcion);
                        opcion = document.createElement("option");
                        opcion.value = "cheque";
                        opcion.text = "Cheque";
                        selectorTipoReembolso.add(opcion);
                        opcion = document.createElement("option");
                        opcion.value = "pasarela";
                        opcion.text = "Pasarela";
                        selectorTipoReembolso.add(opcion);
                        contenedorDinamicoTipo.appendChild(selectorTipoReembolso)
                        bloqueReembolso.appendChild(contenedorDinamicoTipo)
                        bloqueInterno = document.createElement("div")
                        bloqueInterno.classList.add("flexVertical", "gap6", "ocultoInicial")
                        bloqueInterno.setAttribute("contenedor", "palabraReembolso")
                        const infoCampoConfirmacion = document.createElement("div")
                        infoCampoConfirmacion.classList.add("padding14")
                        infoCampoConfirmacion.textContent = `Los reembolsos emitidos por la pasarela de pago son irreversibles, no se pueden deshacer, si bien se puede eliminar la copia de este de la base de datos de Casa Vitini no se puede deshacer de la pasarela. Por esta circunstancia, para emitir un reembolso por la pasarela de pago tienes que escribir la palabra "reembolso" en el campo de texto de abajo. Esto es así para evitar falsos clics.`
                        bloqueInterno.appendChild(infoCampoConfirmacion)
                        const campoConfirmacion = document.createElement("input")
                        campoConfirmacion.classList.add("detallesReserva_reembolso_campoConfirmacion")
                        campoConfirmacion.setAttribute("campo", "palabra")
                        campoConfirmacion.placeholder = "Escribe la palabra reembolso"
                        bloqueInterno.appendChild(campoConfirmacion)
                        bloqueReembolso.appendChild(bloqueInterno)
                        contenedorEmitirReembolso.appendChild(bloqueReembolso)
                        const bloqueBotones = document.createElement("div")
                        bloqueBotones.classList.add("flexVertical", "gap6")
                        const botonConfirmar = document.createElement("div")
                        botonConfirmar.classList.add("botonV1BlancoIzquierda")
                        botonConfirmar.setAttribute("componente", "botonActualizarEnlace")
                        botonConfirmar.textContent = "Realizar reembolso"
                        botonConfirmar.addEventListener("click", () => {
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.reembolsos.confirmarReembolso({
                                pagoUID: pagoUID,
                                instanciaUID_contenedorDinamicoTransacciones: instanciaUID_contenedorDinamicoTransacciones,
                                instanciaUIDDetalleDelPago: instanciaUIDDetalleDelPago
                            })
                        })
                        bloqueBotones.appendChild(botonConfirmar)
                        const botonCancelar = document.createElement("div")
                        botonCancelar.classList.add("botonV1")
                        botonCancelar.textContent = "Cerrar opciones de emitir reembolso"
                        botonCancelar.addEventListener("click", () => {
                            selectorContenedorCrearReembolso.innerHTML = null
                            selectorContenedorCrearReembolso.removeAttribute("style")
                        })
                        bloqueBotones.appendChild(botonCancelar)
                        contenedorEmitirReembolso.appendChild(bloqueBotones)
                        selectorContenedorCrearReembolso.appendChild(contenedorEmitirReembolso)
                        maximoReembolsable();
                    },
                    eliminarReembolso: async function (metadatos) {
                        const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                        const instanciaUIDDetalleDelPago = metadatos.instanciaUIDDetalleDelPago
                        const reembolsoUID = metadatos.reembolsoUID
                        const instanciaUID = metadatos.instanciaUID
                        const metadatosPantallaCarga = {
                            mensaje: "Eliminando reembolso...",
                            instanciaUID: instanciaUIDDetalleDelPago,
                        }
                        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(metadatosPantallaCarga)
                        const pagoUID = document.querySelector(`[instanciaUID="${instanciaUIDDetalleDelPago}"]`).querySelector("[pagoUID]").getAttribute("pagoUID")
                        const palabra = document.querySelector(`[instanciaUID="${instanciaUIDDetalleDelPago}"]`).querySelector(`[reembolsoUID="${reembolsoUID}"] [campo=palabra]`).value
                        const transaccion = {
                            zona: "administracion/reservas/detallesReserva/transacciones/eliminarReembolsoManual",
                            reembolsoUID: String(reembolsoUID),
                            palabra: palabra
                        }
                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        const selectorPantallaDeCarga = document.querySelectorAll(`[instanciaUID="${instanciaUIDDetalleDelPago}"][pantallaSuperpuesta=pantallaCargaSuperpuesta]`)
                        selectorPantallaDeCarga.forEach((pantalla) => {
                            pantalla.remove()
                        })
                        if (respuestaServidor?.error) {
                            casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                        }
                        if (respuestaServidor?.ok) {
                            const selectorDetallesDelPagoRenderizado = document.querySelector(`[instanciaUID="${instanciaUIDDetalleDelPago}"]`)
                            if (selectorDetallesDelPagoRenderizado) {
                                //  casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.arranque()
                                casaVitini.view.__sharedMethods__.detallesReservaUI.reservaUI.ui.componentesUI.categoriasGlobalesUI.controladorCategorias({
                                    categoria: "transacciones",
                                    origen: "url",
                                    reservaUID: reservaUID
                                })
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                const metadatos = {
                                    pagoUID: pagoUID,
                                    instanciaUID: instanciaUID
                                }
                                casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.detallesDelPago.UI(metadatos)
                            }
                        }
                    },
                    confirmarReembolso: async function (metadatos) {
                        const pagoUID = String(metadatos.pagoUID)
                        const instanciaUID_contenedorDinamicoTransacciones = metadatos.instanciaUID_contenedorDinamicoTransacciones
                        const instanciaUIDDetalleDelPago = metadatos.instanciaUIDDetalleDelPago
                        const instanciaUID_pantallaDeCarga = casaVitini.utilidades.codigoFechaInstancia()
                        const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                        const tipoReembolso = document.querySelector(`[instanciaUID="${instanciaUIDDetalleDelPago}"] [tipoReembolsoSeleccionado]`)?.getAttribute("tipoReembolsoSeleccionado")
                        const metadatosPantallaCarga = {
                            mensaje: "Esperando al servidor...",
                            instanciaUID: instanciaUID_pantallaDeCarga,
                        }
                        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(metadatosPantallaCarga)
                        const transaccion = {
                            zona: "administracion/reservas/detallesReserva/transacciones/realizarReembolso",
                            reservaUID: reservaUID,
                            pagoUID: pagoUID
                        }
                        if (tipoReembolso === "porPorcentaje") {
                            const cantidad = document.querySelector(`[instanciaUID="${instanciaUIDDetalleDelPago}"] [contenedortiporeembolso=porPorcentaje] [totalReembolso]`)?.getAttribute("totalReembolso")
                            transaccion.cantidad = cantidad
                        }
                        if (tipoReembolso === "porCantidad") {
                            const cantidad = document.querySelector(`[instanciaUID="${instanciaUIDDetalleDelPago}"] [contenedortiporeembolso=porCantidad] [campo=porCantidad]`)?.value
                            transaccion.cantidad = cantidad
                        }
                        transaccion.tipoReembolso = tipoReembolso
                        const plataformaDePagoEntrada = document.querySelector(`[instanciaUID="${instanciaUIDDetalleDelPago}"] [contenedor=nuevoReembolso] [campo=plataformaDePagoEntrada]`).value
                        transaccion.plataformaDePagoEntrada = plataformaDePagoEntrada
                        if (tipoReembolso === "pasarela") {
                            const palabra = document.querySelector(`[instanciaUID="${instanciaUIDDetalleDelPago}"] [campo=palabra]`)?.value
                            transaccion.palabra = palabra
                        }
                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        const selectorPantallaDeCarga = document.querySelectorAll(`[instanciaUID="${instanciaUID_pantallaDeCarga}"][pantallaSuperpuesta=pantallaCargaSuperpuesta]`)
                        selectorPantallaDeCarga.forEach((pantalla) => {
                            pantalla.remove()
                        })
                        if (respuestaServidor?.error) {
                            casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                        }
                        if (respuestaServidor?.ok) {
                            //casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.arranque()
                            casaVitini.view.__sharedMethods__.detallesReservaUI.reservaUI.ui.componentesUI.categoriasGlobalesUI.controladorCategorias({
                                categoria: "transacciones",
                                origen: "url",
                                reservaUID: reservaUID
                            })
                            const mensaje = respuestaServidor?.ok
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.detallesDelPago.UI({
                                pagoUID: pagoUID,
                                instanciaUID_contenedorDinamicoTransacciones: instanciaUID_contenedorDinamicoTransacciones
                            })
                        }
                    }
                },
                crearPagoManual: {
                    UI: function () {
                        const mostrarContenedorTipoPago = (opcion) => {
                            const selectorInfo = document.querySelector("[componente=advertenciaInmersiva] [componente=infoDesplegable]")
                            selectorInfo?.remove()
                            const selectorTodosLosContenedorTipoPago = document.querySelectorAll(`[componente=advertenciaInmersiva] [contenedorTipoPago]`)
                            selectorTodosLosContenedorTipoPago.forEach((contenedorTipoPago) => {
                                contenedorTipoPago.removeAttribute("style")
                                contenedorTipoPago.removeAttribute("estado")
                            })
                            const tipoPago = opcion.target.value
                            const selectorContenedorTipoPago = document.querySelector(`[componente=advertenciaInmersiva] [contenedorTipoPago=${tipoPago}]`)
                            if (selectorContenedorTipoPago) {
                                selectorContenedorTipoPago.style.display = "flex"
                                selectorContenedorTipoPago.setAttribute("estado", "activa")
                            }
                        }
                        const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                        const advertenciaInmersivaIU = document.createElement("div")
                        advertenciaInmersivaIU.setAttribute("class", "advertenciaInmersiva")
                        advertenciaInmersivaIU.setAttribute("componente", "advertenciaInmersiva")
                        const contenedorAdvertenciaInmersiva = document.createElement("div")
                        contenedorAdvertenciaInmersiva.classList.add("contenedorAdvertencaiInmersiva")
                        const contenidoAdvertenciaInmersiva = document.createElement("div")
                        contenidoAdvertenciaInmersiva.classList.add("contenidoAdvertenciaInmersiva")
                        contenidoAdvertenciaInmersiva.setAttribute("espacio", "formularioCrearPagoManual")
                        const titulo = document.createElement("p")
                        titulo.classList.add("tituloGris", "padding14")
                        titulo.textContent = "Crear un pago manual"
                        contenidoAdvertenciaInmersiva.appendChild(titulo)
                        const bloque = document.createElement("div")
                        bloque.classList.add("flexVertical", "gap10")
                        let info = document.createElement("div")
                        info.classList.add("padding14")
                        info.textContent = `Crea un pago manual cuando necesites crear un pago por fuera de la pasarela. Escoge el tipo de pago, si es efectivo o si es por TPV por ejemplo. Luego rellena los datos y el pago se añadirá a la lista de pagos de la reserva. Los pagos manuales requieren una acción manual.`
                        bloque.appendChild(info)
                        const selectorTipoDePago = document.createElement("select")
                        selectorTipoDePago.classList.add("botonV1BlancoIzquierda_noSeleccionable")
                        selectorTipoDePago.setAttribute("campo", "selectorRol")
                        selectorTipoDePago.addEventListener("change", mostrarContenedorTipoPago)
                        const opcionPreterminada = document.createElement("option");
                        opcionPreterminada.value = "";
                        opcionPreterminada.selected = "true"
                        opcionPreterminada.disabled = "true"
                        opcionPreterminada.text = "Selecciona la plataforma pago";
                        selectorTipoDePago.add(opcionPreterminada);
                        let opcion = document.createElement("option");
                        opcion.value = "efectivo";
                        opcion.text = "Efectivo";
                        selectorTipoDePago.add(opcion);
                        opcion = document.createElement("option");
                        opcion.value = "transferenciaBancaria";
                        opcion.text = "Transferencia bancaria";
                        selectorTipoDePago.add(opcion);
                        opcion = document.createElement("option");
                        opcion.value = "tarjeta";
                        opcion.text = "Tarjeta TPV";
                        selectorTipoDePago.add(opcion);
                        opcion = document.createElement("option");
                        opcion.value = "cheque";
                        opcion.text = "Cheque";
                        selectorTipoDePago.add(opcion);
                        opcion = document.createElement("option");
                        opcion.value = "pasarela";
                        opcion.text = "Pasarela(Asociar pago)";
                        selectorTipoDePago.add(opcion);
                        bloque.appendChild(selectorTipoDePago)
                        const contenedorTipoPago = document.createElement("div")
                        contenedorTipoPago.classList.add("flexVertical", "gap6")
                        const infoDesplegable = document.createElement("p")
                        infoDesplegable.classList.add("padding14")
                        infoDesplegable.setAttribute("componente", "infoDesplegable")
                        infoDesplegable.textContent = "Selecciona el tipo de plataforma de pago en el desplegable"
                        contenedorTipoPago.appendChild(infoDesplegable)
                        const contenedorEfectivo = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.crearPagoManual.contenedoresTipoPago.efectivo()
                        contenedorTipoPago.appendChild(contenedorEfectivo)
                        const contenedorCheque = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.crearPagoManual.contenedoresTipoPago.cheque()
                        contenedorTipoPago.appendChild(contenedorCheque)
                        const contenedorTransferenciaBancaria = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.crearPagoManual.contenedoresTipoPago.transferenciaBancaria()
                        contenedorTipoPago.appendChild(contenedorTransferenciaBancaria)
                        const contenedorTarjeta = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.crearPagoManual.contenedoresTipoPago.tarjeta()
                        contenedorTipoPago.appendChild(contenedorTarjeta)
                        const contenedorPasarela = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.crearPagoManual.contenedoresTipoPago.pasarela()
                        contenedorTipoPago.appendChild(contenedorPasarela)
                        bloque.appendChild(contenedorTipoPago)
                        contenidoAdvertenciaInmersiva.appendChild(bloque)
                        const bloqueBotones = document.createElement("div")
                        bloqueBotones.classList.add("flexVertical", "gap10")
                        const botonConfirmar = document.createElement("div")
                        botonConfirmar.classList.add("botonV1BlancoIzquierda")
                        botonConfirmar.setAttribute("componente", "botonConfirmarCancelarReserva")
                        botonConfirmar.textContent = "Crear pago y guardarlo en la reserva"
                        botonConfirmar.addEventListener("click", () => {
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.crearPagoManual.confirmar()
                        })
                        bloqueBotones.appendChild(botonConfirmar)
                        const botonCancelar = document.createElement("div")
                        botonCancelar.classList.add("botonV1")
                        botonCancelar.textContent = "Cancelar y volver"
                        botonCancelar.addEventListener("click", casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas)
                        bloqueBotones.appendChild(botonCancelar)
                        contenidoAdvertenciaInmersiva.appendChild(bloqueBotones)
                        const contenedorGlobal = document.createElement("div")
                        contenedorGlobal.classList.add("detallesReserva_enlaceDePago_contenedorGlobal")
                        contenedorAdvertenciaInmersiva.appendChild(contenidoAdvertenciaInmersiva)
                        advertenciaInmersivaIU.appendChild(contenedorAdvertenciaInmersiva)
                        document.querySelector("main").appendChild(advertenciaInmersivaIU)
                    },
                    confirmar: async function () {
                        const instanciaUID_contenedorDinamicoTransacciones = document.querySelector("[contenedorID=transacciones]").getAttribute("instanciaUID")
                        const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                        const contenedorActivo = document.querySelector("[estado=activa][contenedorTipoPago]")
                        const plataformaDePago = document.querySelector("[campo=selectorRol]").value
                        const instanciaUID_pantallaEspera = casaVitini.utilidades.codigoFechaInstancia()
                        const metadatosPantallaCarga = {
                            mensaje: "Esperando al servidor...",
                            instanciaUID: instanciaUID_pantallaEspera,
                        }
                        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(metadatosPantallaCarga)
                        const transaccion = {
                            zona: "administracion/reservas/detallesReserva/transacciones/crearPagoManual",
                            plataformaDePago: plataformaDePago,
                            reservaUID: reservaUID
                        }
                        if (contenedorActivo) {
                            contenedorActivo.querySelectorAll("[campo]").forEach((campo) => {
                                const nombreCampo = campo.getAttribute("campo")
                                const valorCampo = campo.value
                                transaccion[nombreCampo] = valorCampo
                            })
                        }
                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        const selectorPantallaDeCarga = document.querySelectorAll(`[instanciaUID="${instanciaUID_pantallaEspera}"][pantallaSuperpuesta=pantallaCargaSuperpuesta]`)
                        selectorPantallaDeCarga.forEach((pantalla) => {
                            pantalla.remove()
                        })
                        if (respuestaServidor?.error) {
                            casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                        }
                        if (respuestaServidor?.ok) {
                            const seleccionarInstancia = document.querySelector(`[instanciaUID="${instanciaUID_contenedorDinamicoTransacciones}"]`)
                            if (seleccionarInstancia) {
                                const datosPagosGlobal = {
                                    reservaUID: reservaUID,
                                    instanciaUID_contenedorDinamicoTransacciones: instanciaUID_contenedorDinamicoTransacciones
                                }
                                casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.actualizarDatosGlobalesPago(datosPagosGlobal)
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                const selectorInfoNoPago = seleccionarInstancia.querySelector(`[contenedor=infoNoPagos]`)
                                if (selectorInfoNoPago) {
                                    selectorInfoNoPago.remove()
                                }
                                const selectorContenedorListaDePagos = seleccionarInstancia.querySelector(`[contenedor=listaDePagos]`)
                                const selectorTransaccionesUI = seleccionarInstancia.querySelector("[contenedor=transaccionesUI]")
                                if (!selectorContenedorListaDePagos) {
                                    const bloqueListaDePagos = document.createElement("div")
                                    bloqueListaDePagos.classList.add("reservaDetalles_transacciones_bloqueListaDePagos")
                                    bloqueListaDePagos.setAttribute("contenedor", "listaDePagos")
                                    selectorTransaccionesUI.appendChild(bloqueListaDePagos)
                                }
                                const detallesDelPago = respuestaServidor.detallesDelPago
                                const enlaceUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.UI.pagoUI(detallesDelPago)
                                const listaDePagosRenderizada = seleccionarInstancia.querySelector(`[contenedor=listaDePagos]`)
                                if (listaDePagosRenderizada.childElementCount === 0) {
                                    listaDePagosRenderizada.appendChild(enlaceUI);
                                } else if (listaDePagosRenderizada.childElementCount > 0) {
                                    const primerElemento = listaDePagosRenderizada.firstChild;
                                    listaDePagosRenderizada.insertBefore(enlaceUI, primerElemento);
                                }
                            }
                        }
                    },
                    contenedoresTipoPago: {
                        efectivo: function () {
                            const contenedor = document.createElement("div")
                            contenedor.classList.add("flexVertical", "gap6", "ocultoInicial")
                            contenedor.setAttribute("contenedorTipoPago", "efectivo")
                            info = document.createElement("div")
                            info.classList.add("padding6")
                            info.textContent = `Determina la cantidad del pago, recuerda que debe tener dos decimales siempre, por ejemplo, 10.00.`
                            contenedor.appendChild(info)
                            let campo = document.createElement("input")
                            campo.setAttribute("campo", "cantidad")
                            campo.placeholder = "Cantidad del pago, ejemplo 12.95"
                            contenedor.appendChild(campo)
                            return contenedor
                        },
                        transferenciaBancaria: function () {
                            const contenedor = document.createElement("div")
                            contenedor.classList.add("flexVertical", "gap6", "ocultoInicial")
                            contenedor.setAttribute("contenedorTipoPago", "transferenciaBancaria")
                            info = document.createElement("div")
                            info.classList.add("padding6")
                            info.textContent = `Determina la cantidad de la transferencia bancaria. Recuerda que la cantidad debe tener dos decimales siempre, por ejemplo, 10.00.`
                            contenedor.appendChild(info)
                            let campo = document.createElement("input")
                            campo.setAttribute("campo", "transferenciaUID")
                            campo.placeholder = "Código identificador de la transferencia bancaria."
                            contenedor.appendChild(campo)
                            campo = document.createElement("input")
                            campo.setAttribute("campo", "cantidad")
                            campo.placeholder = "Cantidad especificada en la transferencia bancaria, ejemplo: 12.95."
                            contenedor.appendChild(campo)
                            return contenedor
                        },
                        cheque: function () {
                            const contenedor = document.createElement("div")
                            contenedor.classList.add("flexVertical", "gap6", "ocultoInicial")
                            contenedor.setAttribute("contenedorTipoPago", "cheque")
                            info = document.createElement("div")
                            info.classList.add("padding6")
                            info.textContent = `Determina la cantidad del pago en modalidad cheque bancario. Recuerda que la cantidad especificada debe tener dos decimales siempre, por ejemplo, 10.00.`
                            contenedor.appendChild(info)
                            let campo = document.createElement("input")
                            campo.setAttribute("campo", "chequeUID")
                            campo.placeholder = "Código identificador del cheque."
                            contenedor.appendChild(campo)
                            campo = document.createElement("input")
                            campo.setAttribute("campo", "cantidad")
                            campo.placeholder = "Cantidad especificada en el cheque, ejemplo: 12.95."
                            contenedor.appendChild(campo)
                            return contenedor
                        },
                        tarjeta: function () {
                            const contenedor = document.createElement("div")
                            contenedor.classList.add("flexVertical", "gap6", "ocultoInicial")
                            contenedor.setAttribute("contenedorTipoPago", "tarjeta")
                            info = document.createElement("div")
                            info.classList.add("padding6")
                            info.textContent = `Determina la cantidad del pago en tarjeta, inserte los datos del pago realizado con el TPV.`
                            contenedor.appendChild(info)
                            let campo = document.createElement("input")
                            campo.setAttribute("campo", "tarjetaUltimos")
                            campo.placeholder = "Cuatro últimos dígitos de la tarjeta."
                            contenedor.appendChild(campo)
                            campo = document.createElement("input")
                            campo.setAttribute("campo", "cantidad")
                            campo.placeholder = "Cantidad especificada en el pago por TPV, ejemplo: 12.95."
                            contenedor.appendChild(campo)
                            return contenedor
                        },
                        pasarela: function () {
                            const contenedor = document.createElement("div")
                            contenedor.classList.add("flexVertical", "gap6", "ocultoInicial")
                            contenedor.setAttribute("contenedorTipoPago", "pasarela")
                            info = document.createElement("div")
                            info.classList.add("padding6")
                            info.textContent = `Si algún pago no se ha sincronizado o si quieres sincronizar un pago, inserta el código identificador del pago de la pasarela.`
                            contenedor.appendChild(info)
                            let campo = document.createElement("input")
                            campo.setAttribute("campo", "pagoUIDPasarela")
                            campo.placeholder = "Código identificador de pago, por ejemplo: h8qikEKdMiyPEtm5pKgjwv1fMSeZY"
                            contenedor.appendChild(campo)
                            return contenedor
                        }
                    }
                },
                eliminarPagoManual: {
                    UI: function (metadatos) {
                        const instanciaUIDDetalleDelPago = metadatos.instanciaUIDDetalleDelPago
                        const contenedor = document.createElement("div")
                        contenedor.classList.add("flexVertical", "gap6", "padding6", "borderRadius20", "borderGrey1")
                        const infoGlobal = document.createElement("div")
                        infoGlobal.classList.add("padding14")
                        infoGlobal.textContent = `Para eliminar este pago, escriba la palabra eliminar en el campo de texto y pulse el botón eliminar. Recuerda que esto es una operación irreversible porque estás eliminado el pago de la base de datos. Los reembolsos de este pago también se eliminarán.`
                        contenedor.appendChild(infoGlobal)
                        const campoEliminar = document.createElement("input")
                        campoEliminar.classList.add("detallesReserva_reembolso_campo")
                        campoEliminar.setAttribute("campo", "palabra")
                        campoEliminar.placeholder = "Escriba la palabra eliminar"
                        contenedor.appendChild(campoEliminar)
                        const botonConfirmar = document.createElement("div")
                        botonConfirmar.classList.add("botonV1BlancoIzquierda")
                        botonConfirmar.setAttribute("componente", "botonActualizarEnlace")
                        botonConfirmar.textContent = "Eliminar irreversiblemente el pago"
                        botonConfirmar.addEventListener("click", () => {
                            const metadatos = {
                                instanciaUIDDetalleDelPago: instanciaUIDDetalleDelPago
                            }
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.eliminarPagoManual.confirmar(metadatos)
                        })
                        contenedor.appendChild(botonConfirmar)
                        const botonCancelar = document.createElement("div")
                        botonCancelar.classList.add("botonV1")
                        botonCancelar.setAttribute("componente", "botonActualizarEnlace")
                        botonCancelar.textContent = "Cerrar opciones de eliminación del pago"
                        botonCancelar.addEventListener("click", (e) => {
                            const selectorContenedorEliminar = e.target.closest("[contenedor=eliminarPago]")
                            selectorContenedorEliminar.innerHTML = null
                            selectorContenedorEliminar.removeAttribute("style")
                        })
                        contenedor.appendChild(botonCancelar)
                        return contenedor
                    },
                    confirmar: async function (metadatos) {
                        const instanciaUIDDetalleDelPago = metadatos.instanciaUIDDetalleDelPago
                        const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                        const instanciaUID_pantallaDeCarga = casaVitini.utilidades.codigoFechaInstancia()
                        const metadatosPantallaCarga = {
                            mensaje: "Esperando al servidor...",
                            instanciaUID: instanciaUID_pantallaDeCarga,
                        }
                        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(metadatosPantallaCarga)
                        const pagoUID = document.querySelector(`[instanciaUID="${instanciaUIDDetalleDelPago}"]`).querySelector("[pagoUID]").getAttribute("pagoUID")
                        const palabra = document.querySelector(`[instanciaUID="${instanciaUIDDetalleDelPago}"]`).querySelector("[contenedor=eliminarPago] [campo=palabra]").value
                        const instanciaUID_contenedorDinamicoTransacciones = document.querySelector(`[reservaUID="${reservaUID}"] [contenedorID=transacciones]`).getAttribute("instanciaUID")
                        const transaccion = {
                            zona: "administracion/reservas/detallesReserva/transacciones/eliminarPagoManual",
                            pagoUID: String(pagoUID),
                            palabra: palabra,
                            reservaUID: String(reservaUID)
                        }
                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        const selectorPantallaDeCarga = document.querySelectorAll(`[instanciaUID="${instanciaUID_pantallaDeCarga}"][pantallaSuperpuesta=pantallaCargaSuperpuesta]`)
                        selectorPantallaDeCarga.forEach((pantalla) => {
                            pantalla.remove()
                        })
                        if (respuestaServidor?.error) {
                            casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                        }
                        if (respuestaServidor?.ok) {
                            const datosActualizar = {
                                reservaUID: reservaUID,
                            }
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.actualizarDatosGlobalesPago(datosActualizar)
                            document.body.removeAttribute("style")
                            document.querySelector(`[instanciaUID="${instanciaUIDDetalleDelPago}"]`)?.remove()
                            const contenedorTransacciones = document.querySelector(`[contenedorID=transacciones][instanciaUID="${instanciaUID_contenedorDinamicoTransacciones}"]`)
                            const listaDePagos = contenedorTransacciones.querySelector(`[contenedor=listaDePagos]`)
                            listaDePagos.querySelector(`[pagoUID="${pagoUID}"]`)?.remove()
                            const pagosRestantes = listaDePagos.querySelectorAll(`[pagoUID]`)
                            if (pagosRestantes.length === 0) {
                                listaDePagos?.remove()
                                const infoNoPagoUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.transacciones.UI.infoNoPagos()
                                contenedorTransacciones.querySelector("[contenedor=transaccionesUI]").appendChild(infoNoPagoUI)
                            }
                        }
                    }
                },
                actualizarDatosGlobalesPago: async function (metadatos) {
                    const reservaUID = metadatos.reservaUID
                    const instanciaUID_contenedorDinamicoTransacciones = document.querySelector("[contenedorID=transacciones]").getAttribute("instanciaUID")
                    const selectorTotalReservaEnPanelGlobal = document.querySelector(`[dataReserva=totalReservaConImpuestos]`)
                    const selectorTotalReserva = document.querySelector(`[componentePago=totalReserva]`)
                    const selectorTotalPagado = document.querySelector(`[componentePago=totalPagado]`)
                    const selectorFaltantePorPagar = document.querySelector(`[componentePago=faltantePorPagar]`)
                    const selectorEstadoPago = document.querySelector(`[dataReserva=estadoPago]`)
                    const selectorPorecentajeReembolsado = document.querySelector(`[componentePago=porcentajeReembolsado]`)
                    const selectorPorecentajePagado = document.querySelector(`[componentePago=porcentajePagado]`)
                    const selectorTotalReembolsado = document.querySelector(`[componentePago=totalReembolsado]`)
                    const reservaAcutalRenderizada = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                    if (reservaAcutalRenderizada === reservaUID) {
                        selectorTotalReservaEnPanelGlobal.innerHTML = "Recalculando..."
                    }
                    selectorTotalReserva.innerHTML = "Recalculando..."
                    selectorTotalPagado.innerHTML = "Recalculando..."
                    selectorFaltantePorPagar.innerHTML = "Recalculando..."
                    selectorEstadoPago.innerHTML = "Recalculando..."
                    selectorPorecentajeReembolsado.innerHTML = "Total reembolsado"
                    selectorPorecentajePagado.innerHTML = "Total pagado"
                    selectorTotalReembolsado.innerHTML = "Recalculando..."
                    const obtenerPagoaActualizados = {
                        zona: "administracion/reservas/detallesReserva/global/obtenerReserva",
                        reservaUID: reservaUID,
                        capas: [
                            "detallesPagos",
                        ]
                    }
                    const respuestaServidor = await casaVitini.shell.servidor(obtenerPagoaActualizados)
                    const seleccionarInstancia = document.querySelector(`[instanciaUID="${instanciaUID_contenedorDinamicoTransacciones}"]`)
                    if (respuestaServidor?.error) {
                        if (seleccionarInstancia) {
                            casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                        }
                    }
                    if (respuestaServidor?.ok) {
                        const data = respuestaServidor.ok
                        const estadoPago = respuestaServidor.ok.global.estadoPagoIDV
                        const detallesPagos = data.detallesPagos
                        const totalReserva = detallesPagos.totalReserva
                        const totalPagado = detallesPagos.totalPagado
                        const faltantePorPagar = detallesPagos.faltantePorPagar
                        const totalReembolsado = detallesPagos.totalReembolsado
                        const porcentajeReembolsado = detallesPagos.porcentajeReembolsado
                        const porcentajePagado = detallesPagos.porcentajePagado
                        if (reservaAcutalRenderizada === reservaUID) {
                            selectorTotalReservaEnPanelGlobal.innerHTML = totalReserva + "$"
                        }
                        if (!seleccionarInstancia) {
                        }
                        selectorTotalReserva.innerHTML = totalReserva + "$"
                        selectorTotalPagado.innerHTML = totalPagado + "$"
                        selectorFaltantePorPagar.innerHTML = faltantePorPagar + "$"
                        selectorPorecentajeReembolsado.innerHTML = `Total reembolsado (${porcentajeReembolsado})`
                        selectorPorecentajePagado.innerHTML = `Total pagado (${porcentajePagado})`
                        selectorTotalReembolsado.innerHTML = totalReembolsado + "$"
                        let estadoPagoUI
                        if (estadoPago === "pagado") {
                            estadoPagoUI = "Pagado"
                        }
                        if (estadoPago === "noPagado") {
                            estadoPagoUI = "No pagado"
                        }
                        if (estadoPago === "pagadoParcialmente") {
                            estadoPagoUI = "Pagado parcialmente"
                        }
                        if (estadoPago === "pagadoSuperadamente") {
                            estadoPagoUI = "Pagado superadamente"
                        }
                        selectorEstadoPago.innerHTML = estadoPagoUI
                    }
                },
            },
            servicios: {
                arranque: async function (e) {
                    const contenedorDinamico = document.querySelector("[componente=contenedorDinamico]")
                    const instanciaUID_contenedorServicios = casaVitini.utilidades.codigoFechaInstancia()
                    const spinnerPorRenderizar = casaVitini.ui.componentes.spinnerSimple()
                    const contenedor = document.createElement("div")
                    contenedor.classList.add(
                        "flexVertical",
                        "gap6",
                        "padding6"
                    )
                    contenedor.setAttribute("instanciaUID", instanciaUID_contenedorServicios)
                    contenedor.setAttribute("componente", "categoriaServicios")
                    contenedor.appendChild(spinnerPorRenderizar)
                    contenedorDinamico.appendChild(contenedor)
                    const reservaUI = document.querySelector("[reservaUID]")
                    const configuracionVista = reservaUI.getAttribute("configuracionVista")
                    const reservaUID = reservaUI.getAttribute("reservaUID")
                    const transaccion = {
                        reservaUID
                    }
                    if (configuracionVista === "publica") {
                        transaccion.zona = "miCasa/misReservas/detallesReserva"
                    } else {
                        transaccion.zona = "administracion/reservas/detallesReserva/global/obtenerReserva"
                        transaccion.capas = [
                            "servicios",
                        ]
                    }
                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    const instanciaDestino = document.querySelector(`[componente=categoriaServicios][instanciaUID="${instanciaUID_contenedorServicios}"]`)
                    if (!instanciaDestino) { return }
                    instanciaDestino.innerHTML = null
                    if (respuestaServidor?.error) {
                        const errorUI = document.createElement("p")
                        errorUI.classList.add("errorCategorialGlobal")
                        errorUI.textContent = respuestaServidor?.error
                        instanciaDestino.appendChild(errorUI)
                    }
                    if (respuestaServidor?.ok) {
                        const bloqueBotones = document.createElement("div")
                        bloqueBotones.classList.add("detallesReserva_enlacesDePago_bloqueBotones")
                        const boton = document.createElement("div")
                        boton.classList.add("detallesReserva_transacciones_botonV1")
                        boton.textContent = "Insertar servicio"
                        boton.addEventListener("click", () => {
                            this.componentesUI.insertarServicio.ui({
                                instanciaUID_contenedorServicios: instanciaUID_contenedorServicios
                            })
                        })
                        bloqueBotones.appendChild(boton)
                        if (configuracionVista === "publica") {
                        } else {
                            instanciaDestino.appendChild(bloqueBotones)
                        }
                        const contenedorListaServicios = document.createElement("div")
                        contenedorListaServicios.classList.add(
                            "flexVertical",
                            "gap6",
                        )
                        contenedorListaServicios.setAttribute("componente", "contenedorListaServiciosEnReserva")
                        instanciaDestino.appendChild(contenedorListaServicios)
                        instanciaDestino.style.justifyContent = "flex-start";
                        const serviciosEnReserva = respuestaServidor.ok.servicios
                        if (serviciosEnReserva.length === 0) {
                            contenedorListaServicios.style.display = "none"
                            const infoSinEnlaces = this.componentesUI.infoSinServiciosUI()
                            instanciaDestino.appendChild(infoSinEnlaces)
                        }
                        if (serviciosEnReserva.length > 0) {
                            const contenedorListaServicios = instanciaDestino.querySelector(`[componente=contenedorListaServiciosEnReserva]`)
                            for (const servicioEnReserva of serviciosEnReserva) {
                                const servicioUI = this.componentesUI.servicioUI({
                                    servicioUID_enReserva: servicioEnReserva.servicioUID,
                                    instanciaUID_contenedorServicios,
                                    nombreInterno: servicioEnReserva.nombre,
                                    contenedor: servicioEnReserva.contenedor,
                                    opcionesSeleccionadas: servicioEnReserva.opcionesSel
                                })
                                contenedorListaServicios.appendChild(servicioUI)
                            }
                        }
                    }
                },
                componentesUI: {
                    acutalizarServicioEnReserva: {
                        ui: async function (data) {
                            const servicioUID_enReserva = data.servicioUID_enReserva
                            const instanciaUID_contenedorServicios = data.instanciaUID_contenedorServicios
                            const main = document.querySelector("main")
                            const reservaUID = main.querySelector("[reservaUID]").getAttribute("reservaUID")
                            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                            const instanciaUID_UIFlotanteServicios = ui.getAttribute("instanciaUID")
                            const constructor = ui.querySelector("[componente=contenedor]")
                            main.appendChild(ui)
                            const botonCerrar = document.createElement("div")
                            botonCerrar.classList.add("botonV1")
                            botonCerrar.textContent = "Cerrar y volver"
                            botonCerrar.setAttribute("boton", "cancelar")
                            botonCerrar.addEventListener("click", () => {
                                return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            })
                            constructor.appendChild(botonCerrar)
                            const spinner = casaVitini.ui.componentes.spinnerSimple()
                            constructor.appendChild(spinner)
                            const respuestaServidor = await casaVitini.shell.servidor({
                                zona: "administracion/reservas/detallesReserva/servicios/obtenerDetallesDelServicioEnReserva",
                                servicioUID_enReserva: String(servicioUID_enReserva),
                                reservaUID: String(reservaUID)
                            })
                            const ui_enEspera = document.querySelector(`[instanciaUID="${instanciaUID_UIFlotanteServicios}"]`)
                            if (!ui_enEspera) { return }
                            if (respuestaServidor?.error) {
                                const info = {
                                    titulo: "No existe ningúna servicio con ese identificador",
                                    descripcion: "Revisa el identificador porque este servicio que buscas no existe. Quizás este identificador existió y borraste esta servicio.."
                                }
                                casaVitini.ui.componentes.mensajeSimple(info)
                            } else if (respuestaServidor?.ok) {
                                constructor.innerHTML = null
                                const botonCerrar = document.createElement("div")
                                botonCerrar.classList.add("botonV1")
                                botonCerrar.textContent = "Cerrar y volver"
                                botonCerrar.setAttribute("boton", "cancelar")
                                botonCerrar.addEventListener("click", () => {
                                    return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                })
                                constructor.appendChild(botonCerrar)
                                const servicio = respuestaServidor.servicio
                                const servicioUID = servicio.servicioUID
                                const contenedor = servicio.contenedor
                                const servicioUI = casaVitini.view.__sharedMethods__.servicioUI({
                                    servicioUID,
                                    contenedor
                                })
                                servicioUI.setAttribute("estadoServicio", "selCompleta")
                                servicioUI.querySelector("[componente=indicadorSelecion]").style.background = "rgb(0, 255, 0)"
                                constructor.appendChild(servicioUI)
                                const opcionesSel = servicio.opcionesSel
                                Object.entries(opcionesSel).forEach(([grupoIDV, contenedorSel]) => {
                                    const selectorGrupo = servicioUI.querySelector(`[grupoIDV="${grupoIDV}"]`)
                                    contenedorSel.forEach(opcionIDV => {
                                        const selectorOpcion = selectorGrupo.querySelector(`[opcionIDV="${opcionIDV}"]`)
                                        selectorOpcion.setAttribute("estado", "activado")
                                        selectorOpcion.querySelector("[componente=indicadorSelecion]").style.background = "rgb(0, 255, 0)"
                                    })
                                })
                                const botonInsertar = document.createElement("div")
                                botonInsertar.classList.add("botonV1BlancoIzquierda")
                                botonInsertar.textContent = "Actualizar servicio en reserva"
                                botonInsertar.setAttribute("boton", "volver")
                                botonInsertar.addEventListener("click", (e) => {
                                    const servicioUI_selector = e.target.closest("[componente=contenedor]").querySelector("[servicioUID]")
                                    const servicioUID = servicioUI_selector.getAttribute("servicioUID")
                                    const grupoDeOpciones = servicioUI_selector.querySelector("[area=grupoOpciones]").querySelectorAll("[componente=grupo]")
                                    const opcionesSeleccionadasDelServicio = {
                                        servicioUID,
                                        opcionesSeleccionadas: {}
                                    }
                                    const opcionesSeleccionadas = opcionesSeleccionadasDelServicio.opcionesSeleccionadas
                                    grupoDeOpciones.forEach((grupo) => {
                                        const grupoIDV = grupo.getAttribute("grupoIDV")
                                        opcionesSeleccionadas[grupoIDV] = []
                                        const opcionesDelGrupoSeleccionadas = grupo.querySelectorAll("[selector=opcion][estado=activado]")
                                        opcionesDelGrupoSeleccionadas.forEach(opcionSel => {
                                            const opcionIDV = opcionSel.getAttribute("opcionIDV")
                                            opcionesSeleccionadas[grupoIDV].push(opcionIDV)
                                        })
                                    })
                                    // Poner una advertenc  ia superpuesta para al espera.
                                    this.confirmarActualizar({
                                        servicioUID_enReserva,
                                        reservaUID,
                                        instanciaUID_UIFlotanteServicios,
                                        instanciaUID_contenedorServicios,
                                        opcionesSeleccionadasDelServicio
                                    })
                                })
                                constructor.appendChild(botonInsertar)
                            }
                        },
                        confirmarActualizar: async function (data) {
                            const reservaUID = data.reservaUID
                            const servicioUID_enReserva = String(data.servicioUID_enReserva)
                            const instanciaUID_UIFlotanteServicios = data.instanciaUID_UIFlotanteServicios
                            const instanciaUID_contenedorServicios = data.instanciaUID_contenedorServicios
                            const opcionesSeleccionadasDelServicio = data.opcionesSeleccionadasDelServicio
                            const instanciaPantallaCarga = casaVitini.utilidades.codigoFechaInstancia()
                            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
                                mensaje: "Actualizando el servicio en la reserva",
                                textoBoton: "ocultar",
                                instanciaUID: instanciaPantallaCarga
                            })
                            const respuestaServidor = await casaVitini.shell.servidor({
                                zona: "administracion/reservas/detallesReserva/servicios/actualizarServicioEnReserva",
                                reservaUID,
                                servicioUID_enReserva,
                                opcionesSeleccionadasDelServicio
                            })
                            document.querySelector(`[instanciaUID="${instanciaPantallaCarga}"]`).remove()
                            if (respuestaServidor?.error) {
                                return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                const servicioData = respuestaServidor.servicio
                                const servicioUID_enReserva = servicioData.servicioUID
                                const nombreInterno = servicioData.nombre
                                const contenedor = servicioData.contenedor
                                const opcionesSel = servicioData.opcionesSel
                                casaVitini.view.__sharedMethods__.detallesReservaUI.reservaUI.actualizarReservaRenderizada()
                                const selectorContenedorServicios = document.querySelector(`[instanciaUID="${instanciaUID_contenedorServicios}"]`)
                                if (!selectorContenedorServicios) {
                                    return
                                }
                                const servicioUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.servicios.componentesUI.servicioUI({
                                    servicioUID_enReserva: servicioUID_enReserva,
                                    instanciaUID_contenedorServicios,
                                    nombreInterno: nombreInterno,
                                    contenedor: contenedor,
                                    opcionesSeleccionadas: opcionesSel
                                })
                                const selectorInfo = selectorContenedorServicios.querySelector("[componente=contenedorInfoSinServicios]")
                                selectorInfo?.remove()
                                const selectorListaServicios = selectorContenedorServicios.querySelector("[componente=contenedorListaServiciosEnReserva]")
                                selectorListaServicios.removeAttribute("style")
                                const selContenedorServicio = selectorListaServicios.querySelector(`[servicioUID_enReserva="${servicioUID_enReserva}"]`)
                                selectorListaServicios.replaceChild(servicioUI, selContenedorServicio);
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            }
                        },
                    },
                    insertarServicio: {
                        ui: async function (data) {
                            const main = document.querySelector("main")
                            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                            const reservaUID = main.querySelector("[reservaUID]").getAttribute("reservaUID")
                            const instanciaUID_UIFlotanteServicios = ui.getAttribute("instanciaUID")
                            const instanciaUID_contenedorServicios = data.instanciaUID_contenedorServicios
                            main.appendChild(ui)
                            await this.despliegeListaServicios({
                                ui,
                                instanciaUID_UIFlotanteServicios,
                                instanciaUID_contenedorServicios,
                                reservaUID
                            })
                        },
                        despliegeListaServicios: async function (data) {
                            const ui = data.ui
                            const instanciaUID_UIFlotanteServicios = data.instanciaUID_UIFlotanteServicios
                            const instanciaUID_contenedorServicios = data.instanciaUID_contenedorServicios
                            const reservaUID = data.reservaUID
                            const constructor = ui.querySelector("[componente=contenedor]")
                            constructor.innerHTML = null
                            const spinner = casaVitini.ui.componentes.spinner({
                                mensaje: "Obteniendo servicios...",
                                textoBoton: "Cancelar"
                            })
                            constructor.appendChild(spinner)
                            const respuestaServidor = await casaVitini.shell.servidor({
                                zona: "administracion/reservas/detallesReserva/servicios/obtenerServiciosDisponibles"
                            })
                            const uiRenderizada = document.querySelectorAll(`[instanciaUID="${instanciaUID_UIFlotanteServicios}"]`)
                            if (!uiRenderizada) { return }
                            if (respuestaServidor?.error) {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                spinner.remove()
                                constructor.appendChild(this.botonCancelar())
                                const servicios = respuestaServidor.servicios
                                const contenedor = document.createElement("div")
                                contenedor.classList.add(
                                    "maxWidth1280px",
                                    "width100",
                                    "flexVertical",
                                    "gap10",
                                )
                                constructor.appendChild(contenedor)
                                const estadoUI_ = (estadoIDV) => {
                                    if (estadoIDV === "activado") {
                                        return "Activado"
                                    } else if (estadoIDV === "desactivado") {
                                        return "Desactivado"
                                    }
                                }
                                servicios.forEach((detalles) => {
                                    const nombre = detalles.nombre
                                    const servicioUID = detalles.servicioUID
                                    const estadoIDV = detalles.estadoIDV
                                    const zonaIDV = detalles.zonaIDV
                                    const contenedorData = detalles.contenedor
                                    const contenedorServicio = document.createElement("div")
                                    contenedorServicio.setAttribute("servicioUID", servicioUID)
                                    contenedorServicio.classList.add(
                                        "borderRadius12",
                                        "width100",
                                        "flexVertical",
                                        "backgroundGrey1",
                                        "padding6",
                                        "gap6"
                                    )
                                    const contenedorGlobal = document.createElement("div")
                                    contenedorGlobal.classList.add(
                                        "flexVertical",
                                        "padding6",
                                        "gap6"
                                    )
                                    const nombreOfertaUI = document.createElement("div")
                                    nombreOfertaUI.classList.add("negrita")
                                    nombreOfertaUI.textContent = nombre
                                    contenedorGlobal.appendChild(nombreOfertaUI)
                                    const estadoTitulo = document.createElement("div")
                                    estadoTitulo.textContent = "Estado del servicio"
                                    contenedorGlobal.appendChild(estadoTitulo)
                                    const estadoUI = document.createElement("div")
                                    estadoUI.classList.add("negrita")
                                    estadoUI.textContent = estadoUI_(estadoIDV)
                                    contenedorGlobal.appendChild(estadoUI)
                                    contenedorServicio.appendChild(contenedorGlobal)
                                    const contendorBotones = document.createElement("div")
                                    contendorBotones.classList.add(
                                        "flexHorizontal",
                                        "gap6",
                                    )
                                    const botonInsertar = document.createElement("div")
                                    botonInsertar.classList.add(
                                        "borderRadius8",
                                        "backgroundGrey1",
                                        "comportamientoBoton",
                                        "padding8"
                                    )
                                    botonInsertar.textContent = "Seleccionar servicio"
                                    botonInsertar.addEventListener("click", () => {
                                        this.despliegeDeSeleccionEnServicio({
                                            reservaUID,
                                            servicioUID,
                                            instanciaUID_UIFlotanteServicios,
                                            instanciaUID_contenedorServicios,
                                            ui,
                                            constructor
                                        })
                                    })
                                    contendorBotones.appendChild(botonInsertar)
                                    const botonVerOferta = document.createElement("a")
                                    botonVerOferta.classList.add(
                                        "borderRadius8",
                                        "backgroundGrey1",
                                        "comportamientoBoton",
                                        "padding8",
                                        "limpiezaBotonA"
                                    )
                                    botonVerOferta.textContent = "Ir al servicio"
                                    botonVerOferta.setAttribute("href", "/administracion/servicios/servicio:" + servicioUID)
                                    botonVerOferta.setAttribute("vista", "/administracion/servicios/servicio:" + servicioUID)
                                    botonVerOferta.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                                    contendorBotones.appendChild(botonVerOferta)
                                    contenedorServicio.appendChild(contendorBotones)
                                    contenedor.appendChild(contenedorServicio)
                                })
                                constructor.appendChild(this.botonCancelar())
                            }
                        },
                        despliegeDeSeleccionEnServicio: async function (data) {
                            const reservaUID = data.reservaUID
                            const servicioUID = data.servicioUID
                            const instanciaUID_UIFlotanteServicios = data.instanciaUID_UIFlotanteServicios
                            const instanciaUID_contenedorServicios = data.instanciaUID_contenedorServicios
                            const ui = data.ui
                            const constructor = data.constructor
                            constructor.innerHTML = null
                            const botonCerrar = document.createElement("div")
                            botonCerrar.classList.add("botonV1")
                            botonCerrar.textContent = "Cerrar y volver"
                            botonCerrar.setAttribute("boton", "cancelar")
                            botonCerrar.addEventListener("click", () => {
                                return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            })
                            constructor.appendChild(botonCerrar)
                            const spinner = casaVitini.ui.componentes.spinnerSimple()
                            constructor.appendChild(spinner)
                            const transaccion = {
                                zona: "administracion/servicios/detallesServicio",
                                servicioUID: String(servicioUID)
                            }
                            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                            const ui_enEspera = document.querySelector(`[instanciaUID="${instanciaUID_UIFlotanteServicios}"]`)
                            if (!ui_enEspera) { return }
                            if (respuestaServidor?.error) {
                                const info = {
                                    titulo: "No existe ningúna servicio con ese identificador",
                                    descripcion: "Revisa el identificador porque este servicio que buscas no existe. Quizás este identificador existió y borraste esta servicio.."
                                }
                                casaVitini.ui.componentes.mensajeSimple(info)
                            } else if (respuestaServidor?.ok) {
                                constructor.innerHTML = null
                                const botonCerrar = document.createElement("div")
                                botonCerrar.classList.add("botonV1")
                                botonCerrar.textContent = "Cerrar y volver"
                                botonCerrar.setAttribute("boton", "cancelar")
                                botonCerrar.addEventListener("click", () => {
                                    return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                })
                                constructor.appendChild(botonCerrar)
                                const botonVolver = document.createElement("div")
                                botonVolver.classList.add("botonV1BlancoIzquierda")
                                botonVolver.textContent = "Volver a la lista de servicios"
                                botonVolver.setAttribute("boton", "volver")
                                botonVolver.addEventListener("click", () => {
                                    return this.despliegeListaServicios({
                                        ui,
                                        instanciaUID_UIFlotanteServicios,
                                        instanciaUID_contenedorServicios,
                                        reservaUID
                                    })
                                })
                                constructor.appendChild(botonVolver)
                                const servicio = respuestaServidor.ok
                                const servicioUID = servicio.servicioUID
                                const contenedor = servicio.contenedor
                                const servicioUI = casaVitini.view.__sharedMethods__.servicioUI({
                                    servicioUID,
                                    contenedor
                                })
                                constructor.appendChild(servicioUI)
                                const botonInsertar = document.createElement("div")
                                botonInsertar.classList.add("botonV1BlancoIzquierda")
                                botonInsertar.textContent = "Insertar servicio en reserva"
                                botonInsertar.setAttribute("boton", "volver")
                                botonInsertar.addEventListener("click", (e) => {
                                    const servicioUI_selector = e.target.closest("[componente=contenedor]").querySelector("[servicioUID]")
                                    const servicioUID = servicioUI_selector.getAttribute("servicioUID")
                                    const grupoDeOpciones = servicioUI_selector.querySelector("[area=grupoOpciones]").querySelectorAll("[componente=grupo]")
                                    const opcionesSeleccionadasDelServicio = {
                                        servicioUID,
                                        opcionesSeleccionadas: {}
                                    }
                                    const opcionesSeleccionadas = opcionesSeleccionadasDelServicio.opcionesSeleccionadas
                                    grupoDeOpciones.forEach((grupo) => {
                                        const grupoIDV = grupo.getAttribute("grupoIDV")
                                        opcionesSeleccionadas[grupoIDV] = []
                                        const opcionesDelGrupoSeleccionadas = grupo.querySelectorAll("[selector=opcion][estado=activado]")
                                        opcionesDelGrupoSeleccionadas.forEach(opcionSel => {
                                            const opcionIDV = opcionSel.getAttribute("opcionIDV")
                                            opcionesSeleccionadas[grupoIDV].push(opcionIDV)
                                        })
                                    })
                                    // Poner una advertenc  ia superpuesta para al espera.
                                    this.confirmarInsertar({
                                        servicioUID,
                                        reservaUID,
                                        instanciaUID_UIFlotanteServicios,
                                        instanciaUID_contenedorServicios,
                                        opcionesSeleccionadasDelServicio
                                    })
                                })
                                constructor.appendChild(botonInsertar)
                            }
                        },
                        botonCancelar: function () {
                            const botonCancelar = document.createElement("div")
                            botonCancelar.classList.add("botonV1")
                            botonCancelar.setAttribute("boton", "cancelar")
                            botonCancelar.textContent = "Cerrar y volver a la reserva"
                            botonCancelar.addEventListener("click", () => {
                                return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            })
                            return botonCancelar
                        },
                        confirmarInsertar: async function (data) {
                            const reservaUID = data.reservaUID
                            const servicioUID = String(data.servicioUID)
                            const instanciaUID_UIFlotanteServicios = data.instanciaUID_UIFlotanteServicios
                            const instanciaUID_contenedorServicios = data.instanciaUID_contenedorServicios
                            const opcionesSeleccionadasDelServicio = data.opcionesSeleccionadasDelServicio
                            const instanciaPantallaCarga = casaVitini.utilidades.codigoFechaInstancia()
                            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
                                mensaje: "Insertando el servicio en la reserva",
                                textoBoton: "ocultar",
                                instanciaUID: instanciaPantallaCarga
                            })
                            const respuestaServidor = await casaVitini.shell.servidor({
                                zona: "administracion/reservas/detallesReserva/servicios/insertarServicioEnReserva",
                                reservaUID,
                                servicioUID,
                                opcionesSeleccionadasDelServicio
                            })
                            document.querySelector(`[instanciaUID="${instanciaPantallaCarga}"]`).remove()
                            if (respuestaServidor?.error) {
                                return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                const servicioData = respuestaServidor.servicio
                                const servicioUID_enReserva = servicioData.servicioUID
                                const nombreInterno = servicioData.nombre
                                const contenedor = servicioData.contenedor
                                const opcionesSel = servicioData.opcionesSel
                                casaVitini.view.__sharedMethods__.detallesReservaUI.reservaUI.actualizarReservaRenderizada()
                                const selectorContenedorServicios = document.querySelector(`[instanciaUID="${instanciaUID_contenedorServicios}"]`)
                                if (!selectorContenedorServicios) {
                                    return
                                }
                                const servicioUI = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.servicios.componentesUI.servicioUI({
                                    servicioUID_enReserva: servicioUID_enReserva,
                                    instanciaUID_contenedorServicios: instanciaUID_contenedorServicios,
                                    nombreInterno: nombreInterno,
                                    contenedor: contenedor,
                                    opcionesSeleccionadas: opcionesSel
                                })
                                const selectorInfo = selectorContenedorServicios.querySelector("[componente=contenedorInfoSinServicios]")
                                selectorInfo?.remove()
                                const selectorListaServicios = selectorContenedorServicios.querySelector("[componente=contenedorListaServiciosEnReserva]")
                                selectorListaServicios.removeAttribute("style")
                                selectorListaServicios.appendChild(servicioUI)
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            }
                        },
                    },
                    servicioUI: function (data) {
                        const reservaUI = document.querySelector("[reservaUID]")
                        const configuracionVista = reservaUI.getAttribute("configuracionVista")
                        const servicioUID_enReserva = data.servicioUID_enReserva
                        const instanciaUID_contenedorServicios = data.instanciaUID_contenedorServicios
                        const nombreInterno = data.nombreInterno
                        const opcionesSeleccionadas = data.opcionesSeleccionadas
                        const contenedor = data.contenedor
                        const definicion = contenedor.definicion
                        const fechaFinal = contenedor.fechaFinal
                        const duracionIDV = contenedor.duracionIDV
                        const fechaInicio = contenedor.fechaInicio
                        const tituloPublico = contenedor.tituloPublico
                        const servicioUID = contenedor.servicioUID
                        const disponibilidadIDV = contenedor.disponibilidadIDV
                        const gruposDeOpciones = contenedor.gruposDeOpciones
                        const diccionario = {
                            disponibilidad: {
                                constante: "Disponible",
                                variable: "Disponibilidad variable"
                            }
                        }
                        const servicioUI = document.createElement("div")
                        servicioUI.setAttribute("servicioUID_enReserva", servicioUID_enReserva)
                        servicioUI.classList.add(
                            "flexVertical",
                            "padding6",
                            "gap6",
                            "backgroundGrey1",
                            "borderRadius14"
                        )
                        const contenedorData = document.createElement("div")
                        contenedorData.classList.add(
                            "flexVertical",
                            "gap6",
                            "padding10"
                        )
                        servicioUI.appendChild(contenedorData)
                        const contenedorNombreInterno = document.createElement("div")
                        contenedorNombreInterno.classList.add(
                            "flexVertical",
                        )
                        if (configuracionVista === "publica") {
                        } else {
                            contenedorData.appendChild(contenedorNombreInterno)
                        }
                        const tituluNombreInternoUI = document.createElement("p")
                        tituluNombreInternoUI.textContent = `Nombre administrativo`
                        contenedorNombreInterno.appendChild(tituluNombreInternoUI)
                        const nombreInternoUI = document.createElement("p")
                        nombreInternoUI.classList.add(
                            "negrita")
                        nombreInternoUI.textContent = `${nombreInterno}`
                        contenedorNombreInterno.appendChild(nombreInternoUI)
                        const contenedorNombrePublico = document.createElement("div")
                        contenedorNombrePublico.classList.add(
                            "flexVertical",
                        )
                        contenedorData.appendChild(contenedorNombrePublico)
                        const tituluNombrePublico = document.createElement("p")
                        tituluNombrePublico.textContent = `Nombre público`
                        contenedorNombrePublico.appendChild(tituluNombrePublico)
                        const titulo = document.createElement("p")
                        titulo.classList.add(
                            "negrita")
                        titulo.textContent = tituloPublico
                        contenedorNombrePublico.appendChild(titulo)
                        const disponibilidadUI = document.createElement("p")
                        disponibilidadUI.classList.add(
                        )
                        disponibilidadUI.textContent = diccionario.disponibilidad[disponibilidadIDV]
                        contenedorData.appendChild(disponibilidadUI)
                        if (disponibilidadIDV === "variable") {
                            const info = document.createElement("p")
                            info.classList.add(
                            )
                            info.textContent = `Este servicio tiene una disponibilidad limitada. Es por eso que si selecciona este servicio, nos pondremos en contacto con el titular de la reserva en las próximas horas para confirmarle la disponibilidad del servicio para su reserva.`
                            contenedorData.appendChild(info)
                        }
                        if (duracionIDV === "rango") {
                            const contenedorDuracion = document.createElement("div")
                            contenedorDuracion.classList.add(
                                "flexVertical",
                            )
                            contenedorData.appendChild(contenedorDuracion)
                            const info = document.createElement("p")
                            info.classList.add("negrita")
                            info.textContent = `Servicio disponible solo desde ${fechaInicio} hata ${fechaFinal}. Ambas fechas incluidas.`
                            contenedorDuracion.appendChild(info)
                        }
                        const definicionUI = document.createElement("p")
                        definicionUI.classList.add(
                        )
                        definicionUI.textContent = definicion
                        contenedorData.appendChild(definicionUI)
                        Object.entries(gruposDeOpciones).forEach(([grupoIDV, gDP]) => {
                            const nombreGrupo = gDP.nombreGrupo
                            const opcionesGrupo = gDP.opcionesGrupo
                            const contenedorGrupo = document.createElement("div")
                            contenedorGrupo.setAttribute("grupoIDV", grupoIDV)
                            contenedorGrupo.classList.add(
                                "flexVertical", "gap6", "borderGrey1", "borderRadius14", "padding6"
                            )
                            const tituloGrupo = document.createElement("p")
                            tituloGrupo.classList.add("negrita", "padding10")
                            tituloGrupo.textContent = nombreGrupo
                            contenedorGrupo.appendChild(tituloGrupo)
                            const contenedorOpcionesGrupo = document.createElement("div")
                            contenedorOpcionesGrupo.classList.add(
                                "flexVertical", "gap6"
                            )
                            contenedorGrupo.appendChild(contenedorOpcionesGrupo)
                            let interruptor = false
                            opcionesGrupo.forEach((op) => {
                                const opcionIDV = op.opcionIDV
                                const nombreOpcion = op.nombreOpcion
                                const precioOpcion = op.precioOpcion ? op.precioOpcion + "$" : "0.00$ (Sin coste añadido)"
                                const selectorOpcionesGrupo = opcionesSeleccionadas[grupoIDV] || []
                                if (selectorOpcionesGrupo.includes(opcionIDV)) {
                                    interruptor = true
                                    const contenedorOpcion = document.createElement("div")
                                    contenedorOpcion.classList.add(
                                        "flexVertical", "gap6", "backgroundGrey1", "borderRadius10", "padding14"
                                    )
                                    contenedorOpcionesGrupo.appendChild(contenedorOpcion)
                                    // const grupoRenderizado_selector = servicioUI.querySelector(`[grupoIDV="${grupoIDV}"]`)
                                    // if (!grupoRenderizado_selector) {
                                    //     servicioUI.appendChild(contenedorGrupo)
                                    // }
                                    const opcionUI = document.createElement("p")
                                    opcionUI.setAttribute("opcionIDV", opcionIDV)
                                    opcionUI.textContent = nombreOpcion
                                    contenedorOpcion.appendChild(opcionUI)
                                    const precioUI = document.createElement("p")
                                    precioUI.setAttribute("opcionIDV", opcionIDV)
                                    precioUI.classList.add(
                                        "textoNegrita"
                                    )
                                    precioUI.textContent = precioOpcion
                                    contenedorOpcion.appendChild(precioUI)
                                }
                            })
                            if (interruptor) {
                                servicioUI.appendChild(contenedorGrupo)
                            }
                        })
                        const contenedorBotones = document.createElement("div")
                        contenedorBotones.classList.add(
                            "flexHorizontal",
                            "gap6"
                        )
                        if (configuracionVista === "publica") {
                        } else {
                            servicioUI.appendChild(contenedorBotones)
                        }
                        const botonModificar = document.createElement("div")
                        botonModificar.classList.add("administracion_reservas_detallesReservas_enlacesDePago_botonV1")
                        botonModificar.textContent = "Modificar servicio en reserva"
                        botonModificar.addEventListener("click", () => {
                            this.acutalizarServicioEnReserva.ui({
                                servicioUID_enReserva,
                                instanciaUID_contenedorServicios
                            })
                        })
                        contenedorBotones.appendChild(botonModificar)
                        const botonIr = document.createElement("a")
                        botonIr.classList.add("administracion_reservas_detallesReservas_enlacesDePago_botonV1")
                        botonIr.textContent = "Ir al servicio"
                        botonIr.setAttribute("href", "/administracion/servicios/servicio:" + servicioUID)
                        botonIr.setAttribute("target", "_blank")
                        contenedorBotones.appendChild(botonIr)
                        const botonEliminar = document.createElement("div")
                        botonEliminar.classList.add("administracion_reservas_detallesReservas_enlacesDePago_botonV1")
                        botonEliminar.textContent = "Eliminar servicio de la reserva"
                        botonEliminar.addEventListener("click", () => {
                            this.
                                eliminarServicio
                                .ui({
                                    instanciaUID_contenedorServicios,
                                    servicioUID_enReserva,
                                    nombreInterno
                                })
                        })
                        contenedorBotones.appendChild(botonEliminar)
                        return servicioUI
                    },
                    eliminarServicio: {
                        ui: async function (data) {
                            const nombreInterno = data.nombreInterno
                            const instanciaUID_contenedorServicios = data.instanciaUID_contenedorServicios
                            const servicioUID_enReserva = data.servicioUID_enReserva
                            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                            ui.style.justifyContent = "center"
                            const instanciaUID_eliminarServicio = ui.getAttribute("instanciaUID")
                            const constructor = ui.querySelector("[componente=constructor]")
                            const titulo = constructor.querySelector("[componente=titulo]")
                            titulo.textContent = `Confirmar eliminar el servicio ${nombreInterno} de la reserva`
                            const mensaje = constructor.querySelector("[componente=mensajeUI]")
                            mensaje.textContent = "Var a eliminar el servicio de la reserva, ¿Estas de acuerdo?"
                            const botonAceptar = constructor.querySelector("[boton=aceptar]")
                            botonAceptar.textContent = "Comfirmar la eliminacion"
                            botonAceptar.addEventListener("click", () => {
                                this.confirmarEliminar({
                                    servicioUID_enReserva,
                                    instanciaUID_eliminarServicio,
                                    instanciaUID_contenedorServicios
                                })
                            })
                            const botonCancelar = constructor.querySelector("[boton=cancelar]")
                            botonCancelar.textContent = "Cancelar y volver"
                            document.querySelector("main").appendChild(ui)
                        },
                        confirmarEliminar: async function (data) {
                            const servicioUID_enReserva = String(data.servicioUID_enReserva)
                            const instanciaUID_eliminarServicio = data.instanciaUID_eliminarServicio
                            const instanciaUID_contenedorServicios = data.instanciaUID_contenedorServicios
                            const ui = document.querySelector(`[instanciaUID="${instanciaUID_eliminarServicio}"]`)
                            const contenedor = ui.querySelector("[componente=constructor]")
                            contenedor.innerHTML = null
                            const spinner = casaVitini.ui.componentes.spinner({
                                mensaje: "Eliminado servicio en la reserva..."
                            })
                            contenedor.appendChild(spinner)
                            const transaccion = {
                                zona: "administracion/reservas/detallesReserva/servicios/eliminarServicioEnReserva",
                                servicioUID_enReserva
                            }
                            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                            if (respuestaServidor?.error) {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                casaVitini.view.__sharedMethods__.detallesReservaUI.reservaUI.actualizarReservaRenderizada()
                                const selectorContenedorServicios = document.querySelector(`[instanciaUID="${instanciaUID_contenedorServicios}"]`)
                                if (!selectorContenedorServicios) {
                                    return
                                }
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                selectorContenedorServicios.querySelector(`[servicioUID_enReserva="${servicioUID_enReserva}"]`)?.remove()
                                const selectorContenedoresDeServiciosRenderizados = selectorContenedorServicios.querySelectorAll("[servicioUID_enReserva]")
                                if (selectorContenedoresDeServiciosRenderizados.length === 0) {
                                    selectorContenedorServicios.querySelector("[componente=contenedorListaServiciosEnReserva]").style.display = "none"
                                    const infoSinEnlaces = casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.servicios.componentesUI.infoSinServiciosUI()
                                    selectorContenedorServicios.appendChild(infoSinEnlaces)
                                }
                            }
                        },
                    },
                    infoSinServiciosUI: function () {
                        const infoSinEnlaces = document.createElement("div")
                        infoSinEnlaces.classList.add("reservaDetalles_transacciones_enlacesDePago_infoSinEnlaces")
                        infoSinEnlaces.setAttribute("componente", "contenedorInfoSinServicios")
                        infoSinEnlaces.textContent = "No hay ningún servicio en la reserva."
                        return infoSinEnlaces
                    }
                },
            },
            desgloseTotal: {
                arranque: async function () {
                    const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                    document.querySelector(`[categoriaReserva=desgloseTotal]`).setAttribute("estadoCategoria", "actual")
                    const reservaUI = document.querySelector("[reservaUID]")
                    const configuracionVista = reservaUI.getAttribute("configuracionVista")
                    const reservaUID = reservaUI.getAttribute("reservaUID")
                    const contenedorDinamico = document.querySelector("[componente=contenedorDinamico]")
                    contenedorDinamico.style.background = "transparent"
                    const spinnerPorRenderizar = casaVitini.ui.componentes.spinnerSimple()
                    const contenedorDesgloseDelTotal = document.createElement("div")
                    contenedorDesgloseDelTotal.classList.add("administracion_reserver_detallesReserva_contenedorDesgloseTotal")
                    contenedorDesgloseDelTotal.setAttribute("instanciaUID", instanciaUID)
                    contenedorDesgloseDelTotal.setAttribute("componente", "contenedorDesgloseTotal")
                    contenedorDesgloseDelTotal.appendChild(spinnerPorRenderizar)
                    contenedorDinamico.appendChild(contenedorDesgloseDelTotal)
                    const transaccion = {
                        reservaUID
                    }
                    if (configuracionVista === "publica") {
                        transaccion.zona = "miCasa/misReservas/detallesReserva"
                    } else {
                        transaccion.zona = "administracion/reservas/detallesReserva/global/obtenerReserva"
                        transaccion.capas = [
                            "desgloseFinanciero",
                        ]
                    }
                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    const instanciaDestino = document.querySelector(`[componente=contenedorDesgloseTotal][instanciaUID="${instanciaUID}"]`)
                    if (!instanciaDestino) { return }
                    instanciaDestino.innerHTML = null
                    if (respuestaServidor?.error) {
                        const errorUI = document.createElement("p")
                        errorUI.classList.add("errorCategorialGlobal")
                        errorUI.textContent = respuestaServidor?.error
                        instanciaDestino.appendChild(errorUI)
                    }
                    if (respuestaServidor?.ok) {
                        const panelBotones = document.createElement("nav")
                        panelBotones.classList.add(
                            "borderRadius10",
                            "flexHorizontal",
                            "gap6",
                            "paddinHorizontal6",
                            "paddinTop6",
                            "elementosExpandidos",
                        )
                        const botonInsertarDescuento = document.createElement("div")
                        botonInsertarDescuento.classList.add(
                            "comportamientoBoton",
                            "botonV3",
                            "width100"
                        )
                        botonInsertarDescuento.textContent = "Insertar descuento"
                        botonInsertarDescuento.addEventListener("click", () => {
                            this.componentesUI.insertarDescuentos.ui({
                                instanciaUID_contenedorFinanciero: instanciaUID
                            })
                        })
                        panelBotones.appendChild(botonInsertarDescuento)
                        const botonDescuentosCompatibles = document.createElement("div")
                        botonDescuentosCompatibles.classList.add(
                            "comportamientoBoton",
                            "botonV3",
                            "width100"
                        )
                        botonDescuentosCompatibles.textContent = "Descuentos compatibles"
                        panelBotones.appendChild(botonDescuentosCompatibles)
                        const botonSobreControlDePrecios = document.createElement("div")
                        botonSobreControlDePrecios.classList.add(
                            "comportamientoBoton",
                            "botonV1",
                            "width100"
                        )
                        botonSobreControlDePrecios.textContent = "Sobre control de precios"
                        botonSobreControlDePrecios.addEventListener("click", () => {
                            this.componentesUI.sobreControlPrecios.arranque()
                        })
                        panelBotones.appendChild(botonSobreControlDePrecios)
                        const botonReconstruirTotal = document.createElement("div")
                        botonReconstruirTotal.classList.add(
                            "comportamientoBoton",
                            "botonV1",
                            "width100"
                        )
                        botonReconstruirTotal.textContent = "Reconstruir total"
                        panelBotones.appendChild(botonReconstruirTotal)
                        let modoUI_contenedorFinanciero
                        if (configuracionVista === "publica") {
                            modoUI_contenedorFinanciero = "plaza"
                        } else {
                            modoUI_contenedorFinanciero = "administracion"
                        }
                        const contenedorFinanciero = respuestaServidor.ok.contenedorFinanciero
                        casaVitini.view.__sharedMethods__.contenedorFinanciero.constructor({
                            destino: `[instanciaUID="${instanciaUID}"][componente=contenedorDesgloseTotal]`,
                            contenedorFinanciero,
                            modoUI: modoUI_contenedorFinanciero
                        })
                    }
                },
                componentesUI: {
                    insertarDescuentos: {
                        ui: async function (data) {
                            const main = document.querySelector("main")
                            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                            const reservaUID = main.querySelector("[reservaUID]").getAttribute("reservaUID")
                            const instanciaUID_insertarDescuentosUI = ui.getAttribute("instanciaUID")
                            const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                            main.appendChild(ui)
                            const constructor = ui.querySelector("[componente=contenedor]")
                            const spinner = casaVitini.ui.componentes.spinner({
                                mensaje: "Obteniendo ofertas...",
                                textoBoton: "Cancelar"
                            })
                            constructor.appendChild(spinner)
                            const transaccion = {
                                zona: "administracion/ofertas/listasOfertasAdministracion"
                            }
                            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                            const uiRenderizada = document.querySelectorAll(`[instanciaUID="${instanciaUID_insertarDescuentosUI}"]`)
                            if (!uiRenderizada) { return }
                            if (respuestaServidor?.error) {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                spinner.remove()
                                constructor.appendChild(this.botonCancelar())
                                const ofertas = respuestaServidor.ok
                                const contenedorOfertas = document.createElement("div")
                                contenedorOfertas.classList.add(
                                    "maxWidth1280px",
                                    "width100",
                                    "flexVertical",
                                    "gap10",
                                )
                                constructor.appendChild(contenedorOfertas)
                                const estadoUI_ = (estadoIDV) => {
                                    if (estadoIDV === "activado") {
                                        return "Activada"
                                    } else if (estadoIDV === "desactivado") {
                                        return "Desactivada"
                                    }
                                }
                                ofertas.forEach((detalles) => {
                                    const nombreOferta = detalles.nombreOferta
                                    const ofertaUID = detalles.ofertaUID
                                    const fechaInicio = detalles.fechaInicio
                                    const fechaFinal = detalles.fechaFinal
                                    const estadoIDV = detalles.estadoIDV
                                    const zonaIDV = detalles.zonaIDV
                                    const contenedorOferta = document.createElement("div")
                                    contenedorOferta.setAttribute("ofertaUID", ofertaUID)
                                    contenedorOferta.classList.add(
                                        "borderRadius12",
                                        "width100",
                                        "flexVertical",
                                        "backgroundGrey1",
                                        "padding6",
                                        "gap6"
                                    )
                                    const contenedorGlobal = document.createElement("div")
                                    contenedorGlobal.classList.add(
                                        "flexVertical",
                                        "padding6",
                                        "gap6"
                                    )
                                    const nombreOfertaUI = document.createElement("div")
                                    nombreOfertaUI.classList.add("negrita")
                                    nombreOfertaUI.textContent = nombreOferta
                                    contenedorGlobal.appendChild(nombreOfertaUI)
                                    const estadoTitulo = document.createElement("div")
                                    estadoTitulo.textContent = "Estado de la oferta"
                                    contenedorGlobal.appendChild(estadoTitulo)
                                    const estadoUI = document.createElement("div")
                                    estadoUI.classList.add("negrita")
                                    estadoUI.textContent = estadoUI_(estadoIDV)
                                    contenedorGlobal.appendChild(estadoUI)
                                    contenedorOferta.appendChild(contenedorGlobal)
                                    const contendorBotones = document.createElement("div")
                                    contendorBotones.classList.add(
                                        "flexHorizontal",
                                        "gap6",
                                    )
                                    const botonInsertar = document.createElement("div")
                                    botonInsertar.classList.add(
                                        "borderRadius8",
                                        "backgroundGrey1",
                                        "comportamientoBoton",
                                        "padding8"
                                    )
                                    botonInsertar.textContent = "Insertar descuento en la reserva"
                                    botonInsertar.addEventListener("click", () => {
                                        this.confirmarInsertar({
                                            reservaUID,
                                            ofertaUID,
                                            instanciaUID_insertarDescuentosUI,
                                            instanciaUID_contenedorFinanciero
                                        })
                                    })
                                    contendorBotones.appendChild(botonInsertar)
                                    const botonVerOferta = document.createElement("a")
                                    botonVerOferta.classList.add(
                                        "borderRadius8",
                                        "backgroundGrey1",
                                        "comportamientoBoton",
                                        "padding8",
                                        "limpiezaBotonA"
                                    )
                                    botonVerOferta.textContent = "Ir a la oferta"
                                    botonVerOferta.setAttribute("href", "/administracion/gestion_de_ofertas/oferta:" + ofertaUID)
                                    botonVerOferta.setAttribute("vista", "/administracion/gestion_de_ofertas/oferta:" + ofertaUID)
                                    botonVerOferta.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                                    contendorBotones.appendChild(botonVerOferta)
                                    contenedorOferta.appendChild(contendorBotones)
                                    contenedorOfertas.appendChild(contenedorOferta)
                                })
                                constructor.appendChild(this.botonCancelar())
                            }
                        },
                        botonCancelar: function () {
                            const botonCancelar = document.createElement("div")
                            botonCancelar.classList.add("botonV1")
                            botonCancelar.setAttribute("boton", "cancelar")
                            botonCancelar.textContent = "Cerrar y volver a la reserva"
                            botonCancelar.addEventListener("click", () => {
                                return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            })
                            return botonCancelar
                        },
                        confirmarInsertar: async function (data) {
                            const reservaUID = data.reservaUID
                            const ofertaUID = String(data.ofertaUID)
                            const instanciaUID_insertarDescuentosUI = data.instanciaUID_insertarDescuentosUI
                            const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                            const ui = document.querySelector(`[instanciaUID="${instanciaUID_insertarDescuentosUI}"]`)
                            const contenedor = ui.querySelector("[componente=contenedor]")
                            contenedor.innerHTML = null
                            const spinner = casaVitini.ui.componentes.spinner({
                                mensaje: "Insertando oferta en la reserva..."
                            })
                            contenedor.appendChild(spinner)
                            const transaccion = {
                                zona: "administracion/reservas/detallesReserva/descuentos/insertarDescuentoPorAdministrador",
                                reservaUID,
                                ofertaUID
                            }
                            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                            const uiRenderizada = document.querySelector(`[reservaUID="${reservaUID}"]`)
                            if (!uiRenderizada) { return }
                            if (respuestaServidor?.error) {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.desgloseTotal.controladores.desplegarContenedorFinanciero({
                                    instanciaUID_contenedorFinanciero,
                                    reservaUID
                                })
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            }
                        },
                    },
                    insertarOfertasCompatibles: {
                        ui: async function (data) {
                            const main = document.querySelector("main")
                            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                            const reservaUID = main.querySelector("[reservaUID]").getAttribute("reservaUID")
                            const instanciaUID_insertarDescuentosUI = ui.getAttribute("instanciaUID")
                            const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                            main.appendChild(ui)
                            const constructor = ui.querySelector("[componente=contenedor]")
                            const spinner = casaVitini.ui.componentes.spinner({
                                mensaje: "Obteniendo ofertas compatibles con la oferta...",
                                textoBoton: "Cancelar"
                            })
                            constructor.appendChild(spinner)
                            const transaccion = {
                                zona: "administracion/reservas/detallesReserva/descuentos/obtenerDescuentosCompatiblesConLaReserva",
                                reservaUID
                            }
                            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                            const uiRenderizada = document.querySelectorAll(`[instanciaUID="${instanciaUID_insertarDescuentosUI}"]`)
                            if (!uiRenderizada) { return }
                            if (respuestaServidor?.error) {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                spinner.remove()
                                const ofertas = respuestaServidor.ofertasCompatibles
                                if (ofertas.length > 0) {
                                    constructor.appendChild(this.botonCancelar())
                                } else {
                                    const info = document.createElement("p")
                                    info.classList.add("textoCentrado")
                                    info.textContent = "No hay ofertas compatibles con esta reserva. Si quieres insertar ofertas no compatibles de manera arbitraria, a esta reserva usa el botón de insertar descuentos."
                                    constructor.appendChild(info)
                                }
                                const estadoUI_ = (estadoIDV) => {
                                    if (estadoIDV === "activado") {
                                        return "Activada"
                                    } else if (estadoIDV === "desactivado") {
                                        return "Desactivada"
                                    }
                                }
                                const contenedorOfertas = document.createElement("div")
                                contenedorOfertas.classList.add(
                                    "maxWidth1280px",
                                    "width100",
                                    "flexVertical",
                                    "gap10",
                                )
                                constructor.appendChild(contenedorOfertas)
                                ofertas.forEach((contenedorOferta) => {
                                    const detalles = contenedorOferta.oferta
                                    const nombreOferta = detalles.nombreOferta
                                    const ofertaUID = detalles.ofertaUID
                                    const fechaInicio = detalles.fechaInicio
                                    const fechaFinal = detalles.fechaFinal
                                    const estadoIDV = detalles.estadoIDV
                                    const zonaIDV = detalles.zonaIDV
                                    const contenedorOfertaUI = document.createElement("div")
                                    contenedorOfertaUI.setAttribute("ofertaUID", ofertaUID)
                                    contenedorOfertaUI.classList.add(
                                        "borderRadius12",
                                        "width100",
                                        "flexVertical",
                                        "backgroundGrey1",
                                        "padding6",
                                        "gap6"
                                    )
                                    const contenedorGlobal = document.createElement("div")
                                    contenedorGlobal.classList.add(
                                        "flexVertical",
                                        "padding6",
                                        "gap6"
                                    )
                                    const nombreOfertaUI = document.createElement("div")
                                    nombreOfertaUI.classList.add("negrita")
                                    nombreOfertaUI.textContent = nombreOferta
                                    contenedorGlobal.appendChild(nombreOfertaUI)
                                    const estadoTitulo = document.createElement("div")
                                    estadoTitulo.textContent = "Estado de la oferta"
                                    contenedorGlobal.appendChild(estadoTitulo)
                                    const estadoUI = document.createElement("div")
                                    estadoUI.classList.add("negrita")
                                    estadoUI.textContent = estadoUI_(estadoIDV)
                                    contenedorGlobal.appendChild(estadoUI)
                                    contenedorOfertaUI.appendChild(contenedorGlobal)
                                    const contendorBotones = document.createElement("div")
                                    contendorBotones.classList.add(
                                        "flexHorizontal",
                                        "gap6",
                                    )
                                    const botonInsertar = document.createElement("div")
                                    botonInsertar.classList.add(
                                        "borderRadius8",
                                        "backgroundGrey1",
                                        "comportamientoBoton",
                                        "padding8"
                                    )
                                    botonInsertar.textContent = "Insertar descuento en la reserva"
                                    botonInsertar.addEventListener("click", () => {
                                        this.confirmarInsertarCompatible({
                                            reservaUID,
                                            ofertaUID,
                                            instanciaUID_insertarDescuentosUI,
                                            instanciaUID_contenedorFinanciero
                                        })
                                    })
                                    contendorBotones.appendChild(botonInsertar)
                                    const botonVerOferta = document.createElement("a")
                                    botonVerOferta.classList.add(
                                        "borderRadius8",
                                        "backgroundGrey1",
                                        "comportamientoBoton",
                                        "padding8",
                                        "limpiezaBotonA"
                                    )
                                    botonVerOferta.textContent = "Ir a la oferta"
                                    botonVerOferta.setAttribute("href", "/administracion/gestion_de_ofertas/oferta:" + ofertaUID)
                                    botonVerOferta.setAttribute("vista", "/administracion/gestion_de_ofertas/oferta:" + ofertaUID)
                                    botonVerOferta.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                                    contendorBotones.appendChild(botonVerOferta)
                                    contenedorOfertaUI.appendChild(contendorBotones)
                                    contenedorOfertas.appendChild(contenedorOfertaUI)
                                })
                                constructor.appendChild(this.botonCancelar())
                            }
                        },
                        botonCancelar: function () {
                            const botonCancelar = document.createElement("div")
                            botonCancelar.classList.add("botonV1")
                            botonCancelar.setAttribute("boton", "cancelar")
                            botonCancelar.textContent = "Cerrar y volver a la reserva"
                            botonCancelar.addEventListener("click", () => {
                                return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            })
                            return botonCancelar
                        },
                        confirmarInsertarCompatible: async function (data) {
                            const reservaUID = data.reservaUID
                            const ofertaUID = String(data.ofertaUID)
                            const instanciaUID_insertarDescuentosUI = data.instanciaUID_insertarDescuentosUI
                            const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                            const ui = document.querySelector(`[instanciaUID="${instanciaUID_insertarDescuentosUI}"]`)
                            const contenedor = ui.querySelector("[componente=contenedor]")
                            contenedor.innerHTML = null
                            const spinner = casaVitini.ui.componentes.spinner({
                                mensaje: "Insertando oferta en la reserva..."
                            })
                            contenedor.appendChild(spinner)
                            const transaccion = {
                                zona: "administracion/reservas/detallesReserva/descuentos/insertarDescuentoPorCompatible",
                                reservaUID,
                                ofertaUID
                            }
                            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                            const uiRenderizada = document.querySelector(`[reservaUID="${reservaUID}"]`)
                            if (!uiRenderizada) { return }
                            if (respuestaServidor?.error) {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.desgloseTotal.controladores.desplegarContenedorFinanciero({
                                    instanciaUID_contenedorFinanciero,
                                    reservaUID
                                })
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            }
                        },
                    },
                    sobreControlPrecios: {
                        componentesUI: {
                            botonAlterarPrecio: function () {
                                const botonDeslegarOpciones = document.createElement("div")
                                botonDeslegarOpciones.classList.add(
                                    "padding6",
                                    "botonV1",
                                    "comportamientoBoton"
                                )
                                botonDeslegarOpciones.textContent = "Alterar precio"
                                return botonDeslegarOpciones
                            },
                            nocheUI: async function (data) {
                                const fechaNoche = data.fechaNoche
                                const apartamentoIDV = data.apartamentoIDV
                                const main = document.querySelector("main")
                                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                                const reservaUID = main.querySelector("[reservaUID]").getAttribute("reservaUID")
                                const instanciaUID_sobreControlUI = ui.getAttribute("instanciaUID")
                                const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                                main.appendChild(ui)
                                const contenedor = ui.querySelector("[componente=contenedor]")
                                const spinner = casaVitini.ui.componentes.spinner({
                                    mensaje: "Obteniendo detalles de la noche...",
                                    textoBoton: "Cancelar"
                                })
                                contenedor.appendChild(spinner)
                                const transaccion = {
                                    zona: "administracion/reservas/detallesReserva/sobreControlPrecios/obtenerDetallesSobreControlNoche",
                                    reservaUID,
                                    apartamentoIDV: apartamentoIDV,
                                    fechaNoche: fechaNoche
                                }
                                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                                const uiRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_sobreControlUI}"]`)
                                if (!uiRenderizada) { return }
                                if (respuestaServidor?.error) {
                                    uiRenderizada?.remove()
                                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                    return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                                }
                                if (respuestaServidor.ok) {
                                    contenedor.innerHTML = null
                                    const data = respuestaServidor.ok
                                    const instantanea = data.instantaneaNetoApartamento
                                    const apartamentoUI = instantanea.apartamentoUI
                                    const precioNetoApartamento = instantanea.precioNetoApartamento
                                    const sobreControl = data?.sobreControl
                                    const detallesSobreControl = sobreControl.detallesSobreControl || {}
                                    const operacion = detallesSobreControl?.operacion
                                    const valorSobreControl = detallesSobreControl?.valor || "0.00"
                                    const titulo = document.createElement("div")
                                    titulo.classList.add(
                                        "tituloGris",
                                        "textoCentrado"
                                    )
                                    titulo.textContent = `Detalles del ${apartamentoUI} en la noche de ${fechaNoche}`
                                    contenedor.appendChild(titulo)
                                    const contenedorValorOrigen = document.createElement("div")
                                    contenedorValorOrigen.classList.add(
                                        "flexVertical",
                                        "backgroundGrey1",
                                        "padding16",
                                        "borderRadius16"
                                    )
                                    contenedor.appendChild(contenedorValorOrigen)
                                    const tituloValorOrigen = document.createElement("div")
                                    tituloValorOrigen.textContent = "Valor origen"
                                    contenedorValorOrigen.appendChild(tituloValorOrigen)
                                    const datoValorOrigen = document.createElement("div")
                                    datoValorOrigen.classList.add(
                                        "negrita"
                                    )
                                    datoValorOrigen.textContent = precioNetoApartamento
                                    contenedorValorOrigen.appendChild(datoValorOrigen)
                                    const selectorTipoSobreControl = document.createElement("select")
                                    selectorTipoSobreControl.classList.add(
                                        "botonV1BlancoIzquierda_campo"
                                    )
                                    selectorTipoSobreControl.setAttribute("campo", "tipoOperacion")
                                    const tituloSelector = document.createElement("option");
                                    if (!operacion) {
                                        tituloSelector.selected = true;
                                    }
                                    tituloSelector.disabled = true;
                                    tituloSelector.text = "Seleccionar el tipo de sobre control";
                                    selectorTipoSobreControl.appendChild(tituloSelector);
                                    const opciones = [
                                        { value: "aumentarPorPorcentaje", text: "Aumentar por porcentaje" },
                                        { value: "reducirPorPorcentaje", text: "Reducir por porcentaje" },
                                        { value: "aumentarPorCantidadFija", text: "Aumentar por cantidad fija" },
                                        { value: "reducirPorCantidadFila", text: "Reducir por cantidad fila" },
                                        { value: "establecerCantidad", text: "Establecer cantidad" }
                                    ]
                                    for (const opcionData of opciones) {
                                        const value = opcionData.value
                                        const opcion = document.createElement("option");
                                        opcion.value = opcionData.value;
                                        opcion.text = opcionData.text;
                                        if (operacion === value) {
                                            opcion.selected = true;
                                        }
                                        selectorTipoSobreControl.appendChild(opcion);
                                    }
                                    contenedor.appendChild(selectorTipoSobreControl)
                                    const campoValor = document.createElement("input")
                                    campoValor.classList.add(
                                        "botonV1BlancoIzquierda_campo"
                                    )
                                    campoValor.setAttribute("campo", "valor")
                                    campoValor.placeholder = "Escribe la cantidad con dos decimales separados por punto, por ejemplo 0.00"
                                    campoValor.value = valorSobreControl
                                    contenedor.appendChild(campoValor)
                                    if (Object.keys(detallesSobreControl).length > 0) {
                                        const boton = document.createElement("div")
                                        boton.classList.add("botonV1")
                                        boton.textContent = "Actualizar sobre control de precio"
                                        boton.addEventListener("click", () => {
                                            this.confirmar({
                                                instanciaUID_sobreControlUI,
                                                instanciaUID_contenedorFinanciero,
                                                reservaUID,
                                                apartamentoIDV,
                                                tipoOperacion: selectorTipoSobreControl.value,
                                                fechaNoche,
                                                valorSobreControl: campoValor.value
                                            })
                                        })
                                        contenedor.appendChild(boton)
                                        const botonEliminar = document.createElement("div")
                                        botonEliminar.classList.add("botonV1")
                                        botonEliminar.textContent = "Eliminar sobre control de precio"
                                        botonEliminar.addEventListener("click", () => {
                                            this.eliminarSobreControl({
                                                instanciaUID_sobreControlUI,
                                                instanciaUID_contenedorFinanciero,
                                                reservaUID,
                                                apartamentoIDV,
                                                fechaNoche
                                            })
                                        })
                                        contenedor.appendChild(botonEliminar)
                                    } else {
                                        const boton = document.createElement("div")
                                        boton.classList.add("botonV1")
                                        boton.textContent = "Crear sobre control de precio"
                                        boton.addEventListener("click", () => {
                                            this.confirmar({
                                                instanciaUID_sobreControlUI,
                                                instanciaUID_contenedorFinanciero,
                                                reservaUID,
                                                apartamentoIDV,
                                                tipoOperacion: selectorTipoSobreControl.value,
                                                fechaNoche,
                                                valorSobreControl: campoValor.value
                                            })
                                        })
                                        contenedor.appendChild(boton)
                                    }
                                    const botonCancelar = document.createElement("div")
                                    botonCancelar.classList.add("botonV1")
                                    botonCancelar.textContent = "Cancelar y volver al desglose por noche."
                                    botonCancelar.addEventListener("click", () => {
                                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                    })
                                    contenedor.appendChild(botonCancelar)
                                }
                            },
                            confirmar: async function (data) {
                                const instanciaUID_sobreControlUI = data.instanciaUID_sobreControlUI
                                const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                                const reservaUID = data.reservaUID
                                const apartamentoIDV = data.apartamentoIDV
                                const tipoOperacion = data.tipoOperacion
                                const fechaNoche = data.fechaNoche
                                const valorSobreControl = data.valorSobreControl
                                const transaccion = {
                                    zona: "administracion/reservas/detallesReserva/sobreControlPrecios/actualizarSobreControlNoche",
                                    reservaUID,
                                    apartamentoIDV,
                                    fechaNoche,
                                    tipoOperacion,
                                    valorSobreControl
                                }
                                const uiRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_sobreControlUI}"]`)
                                const contenedor = uiRenderizada.querySelector("[componente=contenedor]")
                                const instanciaPantallaCarga = casaVitini.utilidades.codigoFechaInstancia()
                                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
                                    mensaje: "Aplicando sobrecontrol de precio",
                                    textoBoton: "ocultar",
                                    instanciaUID: instanciaPantallaCarga
                                })
                                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                                const instanciaPantallaCargaUI = document.querySelector(`[instanciaUID="${instanciaPantallaCarga}"]`)
                                instanciaPantallaCargaUI?.remove()
                                const uiContenedorFinanciero = document.querySelector(`[instanciaUID="${instanciaUID_contenedorFinanciero}"]`)
                                if (respuestaServidor?.error) {
                                    return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                                }
                                if (respuestaServidor.ok) {
                                    const sobreControlUI = document.querySelector(`[instanciaUID="${instanciaUID_sobreControlUI}"]`)
                                    if (sobreControlUI) {
                                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                    }
                                    const selectorDesgloseEnPantalla = document.querySelector(`[reservaUID="${reservaUID}"] [componente=contenedorDesgloseTotal]`)
                                    if (!selectorDesgloseEnPantalla) {
                                        return
                                    }
                                    return casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.desgloseTotal.controladores.desplegarContenedorFinanciero({
                                        instanciaUID_contenedorFinanciero,
                                        reservaUID
                                    })
                                }
                            },
                            eliminarSobreControl: async function (data) {
                                const instanciaUID_sobreControlUI = data.instanciaUID_sobreControlUI
                                const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                                const reservaUID = data.reservaUID
                                const apartamentoIDV = data.apartamentoIDV
                                const fechaNoche = data.fechaNoche
                                const transaccion = {
                                    zona: "administracion/reservas/detallesReserva/sobreControlPrecios/eliminarSobreControlNoche",
                                    reservaUID,
                                    apartamentoIDV,
                                    fechaNoche
                                }
                                const uiRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_sobreControlUI}"]`)
                                const contenedor = uiRenderizada.querySelector("[componente=contenedor]")
                                const instanciaPantallaCarga = casaVitini.utilidades.codigoFechaInstancia()
                                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
                                    mensaje: "Eliminado sobrecontrol de precio",
                                    textoBoton: "ocultar",
                                    instanciaUID: instanciaPantallaCarga
                                })
                                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                                const instanciaPantallaCargaUI = document.querySelector(`[instanciaUID="${instanciaPantallaCarga}"]`)
                                instanciaPantallaCargaUI?.remove()
                                if (respuestaServidor?.error) {
                                    return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                                }
                                if (respuestaServidor.ok) {
                                    const sobreControlUI = document.querySelector(`[instanciaUID="${instanciaUID_sobreControlUI}"]`)
                                    if (sobreControlUI) {
                                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                    }
                                    const selectorDesgloseEnPantalla = document.querySelector(`[reservaUID="${reservaUID}"] [componente=contenedorDesgloseTotal]`)
                                    if (!selectorDesgloseEnPantalla) {
                                        return
                                    }
                                    return casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.desgloseTotal.controladores.desplegarContenedorFinanciero({
                                        instanciaUID_contenedorFinanciero,
                                        reservaUID
                                    })
                                }
                            }
                        },
                    },
                    eliminarOfertaEnReserva: {
                        ui: async function (data) {
                            const nombreOferta = data.nombreOferta
                            const ofertaUID = data.ofertaUID
                            const posicion = data.posicion
                            const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                            const origen = data.origen
                            const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                            pantallaInmersiva.style.justifyContent = "center"
                            const instanciaUID = pantallaInmersiva.getAttribute("instanciaUID")
                            const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                            const titulo = constructor.querySelector("[componente=titulo]")
                            titulo.classList.add(
                                "negrita"
                            )
                            titulo.textContent = nombreOferta
                            const mensaje = constructor.querySelector("[componente=mensajeUI]")
                            mensaje.textContent = `Confirmas o no la eliminación de la oferta de la reserva, ¿Estás de acuerdo?`
                            const botonAceptar = constructor.querySelector("[boton=aceptar]")
                            botonAceptar.textContent = "Confirmar la eliminación de la oferta de esta reserva"
                            botonAceptar.addEventListener("click", () => {
                                this.confirmar({
                                    reservaUID,
                                    ofertaUID,
                                    posicion,
                                    origen,
                                    instanciaUID
                                })
                            })
                            const botonCancelar = constructor.querySelector("[boton=cancelar]")
                            botonCancelar.textContent = "Cancelar y volver a la reserva"
                            document.querySelector("main").appendChild(pantallaInmersiva)
                        },
                        confirmar: async function (data) {
                            const ofertaUID = data.ofertaUID
                            const posicion = data.posicion
                            const reservaUID = data.reservaUID
                            const origen = data.origen
                            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                            const mensaje = "Elimiando oferta de la reserva..."
                            const datosPantallaSuperpuesta = {
                                instanciaUID: instanciaUID,
                                mensaje: mensaje
                            }
                            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                            const transaccion = {
                                zona: "administracion/reservas/detallesReserva/descuentos/eliminarDescuentoEnReserva",
                                reservaUID: String(reservaUID),
                                ofertaUID: String(ofertaUID),
                                origen,
                                posicion: String(posicion)
                            }
                            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                            const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                            instanciaRenderizada.remove()
                            if (respuestaServidor?.error) {
                                return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                return casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.desgloseTotal.controladores.desplegarContenedorFinanciero({
                                    reservaUID
                                })
                            }
                        }
                    },
                    actualizarEstadoAutorizacion: async (data) => {
                        const ofertaUID = data.ofertaUID
                        const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                        const e = data.e
                        const area = e.target.closest("[ofertaUID][posicion]")
                        const autorizacionUI = area.querySelector("[dato=autorizacion]")
                        const estadoActualData = area.querySelector("[estadoActual]")
                        const estadoActual = estadoActualData.getAttribute("estadoActual")
                        const transaccion = {
                            zona: "administracion/reservas/detallesReserva/descuentos/actualizarAutorizacionDescuentoCompatible",
                            reservaUID: String(reservaUID),
                            ofertaUID: String(ofertaUID),
                        }
                        if (estadoActual === "aceptada") {
                            autorizacionUI.textContent = "Rechazando..."
                            transaccion.nuevaAutorizacion = "rechazada"
                        } else if (estadoActual === "rechazada") {
                            autorizacionUI.textContent = "Aceptando..."
                            transaccion.nuevaAutorizacion = "aceptada"
                        }
                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        if (respuestaServidor?.error) {
                            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                        }
                        if (respuestaServidor?.ok) {
                            const estadoAutorizado = respuestaServidor.autorizacion
                            estadoActualData.setAttribute("estadoActual", estadoAutorizado)
                            if (estadoAutorizado === "aceptada") {
                                autorizacionUI.textContent = "Aceptada"
                                estadoActualData.textContent = "Rechazar oferta"
                            } else if (estadoAutorizado === "rechazada") {
                                autorizacionUI.textContent = "Rechazada"
                                estadoActualData.textContent = "Aceptar oferta"
                            }
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.desgloseTotal.controladores.desplegarContenedorFinanciero({
                                reservaUID
                            })
                        }
                    },
                    insertarImpuesto: {
                        ui: async function (data) {
                            const main = document.querySelector("main")
                            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                            const reservaUID = main.querySelector("[reservaUID]").getAttribute("reservaUID")
                            const instanciaUID_insertarImpuestoUI = ui.getAttribute("instanciaUID")
                            const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                            main.appendChild(ui)
                            const constructor = ui.querySelector("[componente=contenedor]")
                            const spinner = casaVitini.ui.componentes.spinner({
                                mensaje: "Obteniendo impuestos...",
                                textoBoton: "Cancelar"
                            })
                            constructor.appendChild(spinner)
                            const transaccion = {
                                zona: "administracion/impuestos/listarTodosLosImpuestos"
                            }
                            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                            const uiRenderizada = document.querySelectorAll(`[instanciaUID="${instanciaUID_insertarImpuestoUI}"]`)
                            if (!uiRenderizada) { return }
                            if (respuestaServidor?.error) {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                spinner.remove()
                                constructor.appendChild(this.botonCancelar())
                                const impuestos = respuestaServidor.impuestos
                                const contenedorOfertas = document.createElement("div")
                                contenedorOfertas.classList.add(
                                    "maxWidth1280px",
                                    "width100",
                                    "flexVertical",
                                    "gap6",
                                )
                                constructor.appendChild(contenedorOfertas)
                                const estadoUI_ = (estadoIDV) => {
                                    if (estadoIDV === "activado") {
                                        return "Activada"
                                    } else if (estadoIDV === "desactivado") {
                                        return "Desactivada"
                                    }
                                }
                                impuestos.forEach((impuesto) => {
                                    const impuestoUID = impuesto.impuestoUID
                                    const nombre = impuesto.nombre
                                    const tipoImpositivo = impuesto.tipoImpositivo
                                    const tipoValorIDV = impuesto.tipoValorIDV
                                    const entidadIDV = impuesto.entidadIDV
                                    const estadoIDV = impuesto.estadoIDV
                                    const contenedorOferta = document.createElement("div")
                                    contenedorOferta.setAttribute("impuestoUID", impuestoUID)
                                    contenedorOferta.classList.add(
                                        "borderRadius12",
                                        "width100",
                                        "flexVertical",
                                        "backgroundGrey1",
                                        "padding6",
                                        "gap10",
                                    )
                                    const contenedorGlobal = document.createElement("div")
                                    contenedorGlobal.classList.add(
                                        "flexVertical",
                                        "padding6",
                                        "gap6"
                                    )
                                    const nombreOfertaUI = document.createElement("div")
                                    nombreOfertaUI.classList.add("negrita")
                                    nombreOfertaUI.textContent = nombre
                                    contenedorGlobal.appendChild(nombreOfertaUI)
                                    const estadoTitulo = document.createElement("div")
                                    estadoTitulo.textContent = "Estado del impuesto"
                                    contenedorGlobal.appendChild(estadoTitulo)
                                    const estadoUI = document.createElement("div")
                                    estadoUI.classList.add("negrita")
                                    estadoUI.textContent = estadoUI_(estadoIDV)
                                    contenedorGlobal.appendChild(estadoUI)
                                    contenedorOferta.appendChild(contenedorGlobal)
                                    const contendorBotones = document.createElement("div")
                                    contendorBotones.classList.add(
                                        "flexHorizontal",
                                        "gap6",
                                    )
                                    const botonInsertar = document.createElement("div")
                                    botonInsertar.classList.add(
                                        "borderRadius8",
                                        "backgroundGrey1",
                                        "comportamientoBoton",
                                        "padding8"
                                    )
                                    botonInsertar.textContent = "Insertar impuesto en la reserva"
                                    botonInsertar.addEventListener("click", () => {
                                        this.confirmarInsertar({
                                            reservaUID,
                                            impuestoUID,
                                            instanciaUID_insertarImpuestoUI,
                                            instanciaUID_contenedorFinanciero
                                        })
                                    })
                                    contendorBotones.appendChild(botonInsertar)
                                    const botonVerOferta = document.createElement("a")
                                    botonVerOferta.classList.add(
                                        "borderRadius8",
                                        "backgroundGrey1",
                                        "comportamientoBoton",
                                        "padding8",
                                        "limpiezaBotonA"
                                    )
                                    botonVerOferta.textContent = "Ir al impuesto"
                                    botonVerOferta.setAttribute("href", "/administracion/impuestos/" + impuestoUID)
                                    botonVerOferta.setAttribute("vista", "/administracion/impuestos/" + impuestoUID)
                                    botonVerOferta.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                                    contendorBotones.appendChild(botonVerOferta)
                                    contenedorOferta.appendChild(contendorBotones)
                                    contenedorOfertas.appendChild(contenedorOferta)
                                })
                                constructor.appendChild(this.botonCancelar())
                            }
                        },
                        botonCancelar: function () {
                            const botonCancelar = document.createElement("div")
                            botonCancelar.classList.add("botonV1")
                            botonCancelar.setAttribute("boton", "cancelar")
                            botonCancelar.textContent = "Cerrar y volver a la reserva"
                            botonCancelar.addEventListener("click", () => {
                                return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            })
                            return botonCancelar
                        },
                        confirmarInsertar: async function (data) {
                            const reservaUID = data.reservaUID
                            const impuestoUID = String(data.impuestoUID)
                            const instanciaUID_insertarImpuestoUI = data.instanciaUID_insertarImpuestoUI
                            const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                            const ui = document.querySelector(`[instanciaUID="${instanciaUID_insertarImpuestoUI}"]`)
                            const contenedor = ui.querySelector("[componente=contenedor]")
                            contenedor.innerHTML = null
                            const spinner = casaVitini.ui.componentes.spinner({
                                mensaje: "Insertando oferta en la reserva..."
                            })
                            contenedor.appendChild(spinner)
                            const transaccion = {
                                zona: "administracion/reservas/detallesReserva/impuestos/insertarImpuestoEnReserva",
                                reservaUID,
                                impuestoUID
                            }
                            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                            const uiRenderizada = document.querySelector(`[reservaUID="${reservaUID}"]`)
                            if (!uiRenderizada) { return }
                            if (respuestaServidor?.error) {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.desgloseTotal.controladores.desplegarContenedorFinanciero({
                                    instanciaUID_contenedorFinanciero,
                                    reservaUID
                                })
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            }
                        },
                    },
                    eliminarImpuesto: {
                        ui: async function (data) {
                            const nombreImpuesto = data.nombreImpuesto
                            const impuestoUID = data.impuestoUID
                            const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                            const reservaUID = document.querySelector("main").querySelector("[reservaUID]").getAttribute("reservaUID")
                            const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                            pantallaInmersiva.style.justifyContent = "center"
                            const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                            const instanciaUID_eliminarImpuestoUI = pantallaInmersiva.getAttribute("instanciaUID")
                            const titulo = constructor.querySelector("[componente=titulo]")
                            titulo.textContent = `Confirmar eliminar impuesto ${nombreImpuesto} de la reserva`
                            const mensaje = constructor.querySelector("[componente=mensajeUI]")
                            mensaje.textContent = "Var a eliminar el impuesto de la reserva, ¿Estas de acuerdo ? "
                            const botonAceptar = constructor.querySelector("[boton=aceptar]")
                            botonAceptar.textContent = "Comfirmar la eliminacion"
                            botonAceptar.addEventListener("click", () => {
                                this.confirmarEliminar({
                                    impuestoUID,
                                    reservaUID,
                                    instanciaUID_contenedorFinanciero,
                                    instanciaUID_eliminarImpuestoUI
                                })
                            })
                            const botonCancelar = constructor.querySelector("[boton=cancelar]")
                            botonCancelar.textContent = "Cancelar y volver"
                            document.querySelector("main").appendChild(pantallaInmersiva)
                        },
                        confirmarEliminar: async function (data) {
                            const reservaUID = data.reservaUID
                            const impuestoUID = String(data.impuestoUID)
                            const instanciaUID_eliminarImpuestoUI = data.instanciaUID_eliminarImpuestoUI
                            const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                            const ui = document.querySelector(`[instanciaUID="${instanciaUID_eliminarImpuestoUI}"]`)
                            const contenedor = ui.querySelector("[componente=constructor]")
                            contenedor.innerHTML = null
                            const spinner = casaVitini.ui.componentes.spinner({
                                mensaje: "Eliminado impuesto en la reserva..."
                            })
                            contenedor.appendChild(spinner)
                            const transaccion = {
                                zona: "administracion/reservas/detallesReserva/impuestos/eliminarImpuestoEnReserva",
                                reservaUID,
                                impuestoUID
                            }
                            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                            const uiRenderizada = document.querySelector(`[reservaUID="${reservaUID}"]`)
                            if (!uiRenderizada) { return }
                            if (respuestaServidor?.error) {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.desgloseTotal.controladores.desplegarContenedorFinanciero({
                                    instanciaUID_contenedorFinanciero,
                                    reservaUID
                                })
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            }
                        },
                    },
                    crearImpuestoAdHoc: {
                        ui: async function (data) {
                            const nombreImpuesto = data.nombreImpuesto
                            const impuestoUID = data.impuestoUID
                            const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                            const reservaUID = document.querySelector("main").querySelector("[reservaUID]").getAttribute("reservaUID")
                            const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                            const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                            const instanciaUID_eliminarImpuestoUI = pantallaInmersiva.getAttribute("instanciaUID")
                            const contenedor = pantallaInmersiva.querySelector("[componente=contenedor]")
                            const opcionesEntidad = [
                                {
                                    entidadIDV: "reserva",
                                    entidadUI: "Reserva"
                                },
                                {
                                    entidadIDV: "servicio",
                                    entidadUI: "Servicios"
                                },
                                {
                                    entidadIDV: "global",
                                    entidadUI: "Global"
                                },
                            ]
                            const titulo = constructor.querySelector("[componente=titulo]")
                            titulo.textContent = `Crear impuesto dedicado solo para esta reserva`
                            const mensaje = constructor.querySelector("[componente=mensajeUI]")
                            mensaje.textContent = "Impuesto dedicado solo para esta reserva. Este impuesto solo existirá en esta reserva. Si necesitas crear un impuesto que quieras usar para insertar en reservas, pero que no se aplique, crea un impuesto en el hub de impuestos y mantenlo desactivado."
                            const contenedorFormulario = document.createElement("div")
                            contenedorFormulario.classList.add(
                                "flexVertical",
                                "gap10"
                            )
                            contenedor.appendChild(contenedorFormulario)
                            const campoCraerNuevoImpuesto = document.createElement("input")
                            campoCraerNuevoImpuesto.classList.add("botonV1BlancoIzquierda_campo")
                            campoCraerNuevoImpuesto.setAttribute("comNuevoImpuesto", "nombre")
                            campoCraerNuevoImpuesto.placeholder = "Escribo el nombre del nuevo impuesto"
                            contenedorFormulario.appendChild(campoCraerNuevoImpuesto)
                            const campoTipoImpositivo = document.createElement("input")
                            campoTipoImpositivo.classList.add("botonV1BlancoIzquierda_campo"
                            )
                            campoTipoImpositivo.setAttribute("comNuevoImpuesto", "tipoImpositivo")
                            campoTipoImpositivo.placeholder = "0.00"
                            contenedorFormulario.appendChild(campoTipoImpositivo)
                            const contenedorOpciones = document.createElement("select")
                            contenedorOpciones.classList.add("botonV1BlancoIzquierda_campo"
                            )
                            contenedorOpciones.setAttribute("comNuevoImpuesto", "tipoValor")
                            const tipoValorLista = [
                                {
                                    tipoValorIDV: "",
                                    tipoValorUI: "Selecciona el tipo de impuesto"
                                },
                                {
                                    tipoValorIDV: "porcentaje",
                                    tipoValorUI: "Porcentaje"
                                },
                                {
                                    tipoValorIDV: "tasa",
                                    tipoValorUI: "Tasa"
                                },
                            ]
                            tipoValorLista.forEach((contenedorTipoValor) => {
                                const tipoValorIDV = contenedorTipoValor.tipoValorIDV
                                const tipoValorUI = contenedorTipoValor.tipoValorUI
                                const opcion = document.createElement("option");
                                if (!tipoValorIDV) {
                                    opcion.selected = true;
                                    opcion.disabled = true;
                                }
                                opcion.value = tipoValorIDV;
                                opcion.text = tipoValorUI;
                                opcion.setAttribute("opcion", tipoValorIDV)
                                contenedorOpciones.add(opcion);
                            })
                            contenedorFormulario.appendChild(contenedorOpciones)
                            const selectorTipoEntidad = document.createElement("select")
                            contenedorOpciones.setAttribute("comNuevoImpuesto", "entidadIDV")
                            selectorTipoEntidad.classList.add("botonV1BlancoIzquierda_campo")
                            contenedorFormulario.appendChild(selectorTipoEntidad)
                            const tiopEntidades = document.createElement("option")
                            tiopEntidades.selected = "true"
                            tiopEntidades.disabled = "true"
                            tiopEntidades.value = ""
                            tiopEntidades.text = "Selecciona el tipo de entidad"
                            selectorTipoEntidad.appendChild(tiopEntidades)
                            opcionesEntidad.forEach((entidad) => {
                                const entidadIDV = entidad.entidadIDV
                                const entidadUI = entidad.entidadUI
                                const opcion = document.createElement("option");
                                opcion.value = entidadIDV;
                                opcion.text = entidadUI;
                                opcion.setAttribute("opcion", entidadIDV)
                                selectorTipoEntidad.add(opcion);
                            })
                            const botonAceptar = constructor.querySelector("[boton=aceptar]")
                            botonAceptar.textContent = "Crear impuesto dedicado para esta reserva"
                            botonAceptar.addEventListener("click", () => {
                                this.confirmarCrearImpuestoAdHoc({
                                    reservaUID,
                                    instanciaUID_contenedorFinanciero,
                                    instanciaUID_eliminarImpuestoUI,
                                    nombre: campoCraerNuevoImpuesto.value,
                                    tipoImpositivo: campoTipoImpositivo.value,
                                    tipoValorIDV: contenedorOpciones.value,
                                    entidadIDV: selectorTipoEntidad.value
                                })
                            })
                            const botonCancelar = constructor.querySelector("[boton=cancelar]")
                            botonCancelar.textContent = "Cancelar y volver"
                            document.querySelector("main").appendChild(pantallaInmersiva)
                        },
                        confirmarCrearImpuestoAdHoc: async function (data) {
                            const reservaUID = data.reservaUID
                            const nombre = data.nombre
                            const tipoImpositivo = data.tipoImpositivo
                            const tipoValorIDV = data.tipoValorIDV
                            const entidadIDV = data.entidadIDV
                            const instanciaUID_eliminarImpuestoUI = data.instanciaUID_eliminarImpuestoUI
                            const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                            const instanciaUID_pantallaDeCargaSuperPuesta = casaVitini.utilidades.codigoFechaInstancia()
                            const datosPantallaSuperpuesta = {
                                instanciaUID: instanciaUID_pantallaDeCargaSuperPuesta,
                                mensaje: "Creando impuesto dedicado e insertando en la reserva..."
                            }
                            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                            const transaccion = {
                                zona: "administracion/reservas/detallesReserva/impuestos/insertarImpuestoDedicadoEnReserva",
                                reservaUID,
                                nombre,
                                tipoImpositivo,
                                tipoValorIDV,
                                entidadIDV
                            }
                            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                            document.querySelector(`[instanciaUID="${instanciaUID_pantallaDeCargaSuperPuesta}"]`)?.remove()
                            const uiRenderizada = document.querySelector(`[reservaUID="${reservaUID}"]`)
                            if (!uiRenderizada) { return }
                            if (respuestaServidor?.error) {
                                return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                            }
                            if (respuestaServidor?.ok) {
                                casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.desgloseTotal.controladores.desplegarContenedorFinanciero({
                                    instanciaUID_contenedorFinanciero,
                                    reservaUID
                                })
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            }
                        },
                    },
                    reconstruirDesgloseFinanciero: {
                        ui: async function (data) {
                            const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                            const reservaUID = document.querySelector("main").querySelector("[reservaUID]").getAttribute("reservaUID")
                            const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                            const contenedor = pantallaInmersiva.querySelector("[componente=contenedor]")
                            const instanciaUID_reconstrucion = pantallaInmersiva.getAttribute("instanciaUID")
                            document.querySelector("main").appendChild(pantallaInmersiva)
                            const tituloUI = document.createElement("p")
                            tituloUI.classList.add("tituloGris")
                            tituloUI.setAttribute("componente", "titulo")
                            tituloUI.textContent = `Elige el origen de la reconstrucion del desglose financiero de la reserva ${reservaUID}`
                            contenedor.appendChild(tituloUI)
                            const mensajeUI = document.createElement("div")
                            mensajeUI.classList.add("mensajeUI")
                            mensajeUI.setAttribute("componente", "mensajeUI")
                            mensajeUI.textContent = "Esta operación reconstruye el desglose financiero.Reconstruir desde la instantánea, regenera el desglose financiero desde las instantáneas del contenedor financiero de la reserva.Esta operación es útil si no se ha reconstituido por alguna razón el desglose financiero correctamente tras alguna operación."
                            contenedor.appendChild(mensajeUI)
                            const botonDesdeInstantaneas = document.createElement("div")
                            botonDesdeInstantaneas.classList.add("botonV1")
                            botonDesdeInstantaneas.setAttribute("boton", "aceptar")
                            botonDesdeInstantaneas.textContent = "Reconstruir desde instantaneas"
                            botonDesdeInstantaneas.addEventListener("click", () => {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                this.desdeInstantaneas.ui({
                                    reservaUID,
                                    instanciaUID_contenedorFinanciero,
                                    instanciaUID_reconstrucion
                                })
                            })
                            contenedor.appendChild(botonDesdeInstantaneas)
                            const mensajeUI_ = document.createElement("div")
                            mensajeUI_.classList.add("mensajeUI")
                            mensajeUI_.setAttribute("componente", "mensajeUI")
                            mensajeUI_.textContent = "Reconstruir el desglose financiero desde el hub, reconstruirá el desglose financiero actualizando las instantáneas de la reserva desde el hub de precios base, comportamiento de precios y ofertas actualmente configurados.Esta operación es irreversible y puede ser útil cuando necesito actualizar ciertos datos del contenedor financiero de la reserva desde los hubs de origen."
                            contenedor.appendChild(mensajeUI_)
                            const botonDesdeHub = document.createElement("div")
                            botonDesdeHub.classList.add("botonV1")
                            botonDesdeHub.setAttribute("boton", "aceptar")
                            botonDesdeHub.textContent = "Reconstruir desde el hub"
                            botonDesdeHub.addEventListener("click", () => {
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                this.desdeHub.ui({
                                    reservaUID,
                                    instanciaUID_contenedorFinanciero,
                                    instanciaUID_reconstrucion
                                })
                            })
                            contenedor.appendChild(botonDesdeHub)
                            const botonCancelar = document.createElement("div")
                            botonCancelar.classList.add("botonV1")
                            botonCancelar.setAttribute("boton", "cancelar")
                            botonCancelar.textContent = "Cancelar y volver"
                            botonCancelar.addEventListener("click", () => {
                                return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            })
                            contenedor.appendChild(botonCancelar)
                        },
                        desdeInstantaneas: {
                            ui: async function (data) {
                                const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                                const reservaUID = document.querySelector("main").querySelector("[reservaUID]").getAttribute("reservaUID")
                                const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                                pantallaInmersiva.style.justifyContent = "center"
                                const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                                const instanciaUID_reconstrucion = pantallaInmersiva.getAttribute("instanciaUID")
                                const titulo = constructor.querySelector("[componente=titulo]")
                                titulo.textContent = `Confirmar reconstruir el desglose de la reserva ${reservaUID} de las instantaneas`
                                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                                mensaje.textContent = "Esta operacion reconstruye el desglose financiero.Si ha ocurrido un algun tipo de error en algun calculo drante la construcion del deshlose financiero, esta opcion podrai recuperar la intergrdiad del desglose financiero."
                                const botonAceptar = constructor.querySelector("[boton=aceptar]")
                                botonAceptar.textContent = "Comfirmar la reconstrucción"
                                botonAceptar.addEventListener("click", () => {
                                    this.confirmarReconstrucion({
                                        reservaUID,
                                        instanciaUID_contenedorFinanciero,
                                        instanciaUID_reconstrucion
                                    })
                                })
                                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                                botonCancelar.textContent = "Cancelar y volver"
                                document.querySelector("main").appendChild(pantallaInmersiva)
                            },
                            confirmarReconstrucion: async function (data) {
                                const reservaUID = data.reservaUID
                                const instanciaUID_reconstrucion = data.instanciaUID_reconstrucion
                                const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                                const ui = document.querySelector(`[instanciaUID="${instanciaUID_reconstrucion}"]`)
                                const contenedor = ui.querySelector("[componente=constructor]")
                                contenedor.innerHTML = null
                                const spinner = casaVitini.ui.componentes.spinner({
                                    mensaje: "Reconstruyendo el desglose financiero desde las instantaneas de la reserva..."
                                })
                                contenedor.appendChild(spinner)
                                const transaccion = {
                                    zona: "administracion/reservas/detallesReserva/contenedorFinanciero/reconstruirDesgloseDesdeInstantaneas",
                                    reservaUID
                                }
                                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                                const uiRenderizada = document.querySelector(`[reservaUID="${reservaUID}"]`)
                                if (!uiRenderizada) { return }
                                if (respuestaServidor?.error) {
                                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                    return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                                }
                                if (respuestaServidor?.ok) {
                                    casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.desgloseTotal.controladores.desplegarContenedorFinanciero({
                                        instanciaUID_contenedorFinanciero,
                                        reservaUID
                                    })
                                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                }
                            },
                        },
                        desdeHub: {
                            ui: async function (data) {
                                const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                                const reservaUID = document.querySelector("main").querySelector("[reservaUID]").getAttribute("reservaUID")
                                const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                                const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                                const instanciaUID_reconstrucion = pantallaInmersiva.getAttribute("instanciaUID")
                                const contenedor = pantallaInmersiva.querySelector("[componente=contenedor]")
                                contenedor.classList.add(
                                    "flexVertical"
                                )
                                const titulo = constructor.querySelector("[componente=titulo]")
                                titulo.textContent = `Confirmar reconstruir el desglose de la reserva ${reservaUID} desde el hub (Operación irreversible)`
                                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                                mensaje.textContent = "Esta operación reconstruye el desglose financiero.Sí ha ocurrido un algún tipo de error en algún cálculo durante la construcción del desglose financiero, esta opción podría recuperar la integridad del desglose financiero."
                                const campo = document.createElement("input")
                                campo.placeholder = "Escribe la palabra reconstruir"
                                campo.classList.add(
                                    "botonV1BlancoIzquierda_campo"
                                )
                                contenedor.appendChild(campo)
                                const botonAceptar = constructor.querySelector("[boton=aceptar]")
                                botonAceptar.textContent = "Confirmar la reconstrucción irreversible de todo el contenedor financiero de la reserva."
                                botonAceptar.addEventListener("click", () => {
                                    this.confirmarReconstrucion({
                                        reservaUID,
                                        instanciaUID_contenedorFinanciero,
                                        instanciaUID_reconstrucion,
                                        palabra: campo.value
                                    })
                                })
                                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                                botonCancelar.textContent = "Cancelar y volver"
                                document.querySelector("main").appendChild(pantallaInmersiva)
                            },
                            confirmarReconstrucion: async function (data) {
                                const reservaUID = data.reservaUID
                                const palabra = data.palabra
                                const instanciaUID_contenedorFinanciero = data.instanciaUID_contenedorFinanciero
                                const instanciaUID_pantallaDeCargaSuperPuesta = casaVitini.utilidades.codigoFechaInstancia()
                                const datosPantallaSuperpuesta = {
                                    instanciaUID: instanciaUID_pantallaDeCargaSuperPuesta,
                                    mensaje: "Reconstruyendo todo el contenedor financiero de la reserva desde los hubs..."
                                }
                                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                                const transaccion = {
                                    zona: "administracion/reservas/detallesReserva/contenedorFinanciero/reconstruirDesgloseDesdeHubs",
                                    reservaUID,
                                    palabra,
                                }
                                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                                const pantallaDeCarga_renderizda = document.querySelector(`[instanciaUID="${instanciaUID_pantallaDeCargaSuperPuesta}"]`)
                                pantallaDeCarga_renderizda?.remove()
                                const uiRenderizada = document.querySelector(`[reservaUID="${reservaUID}"]`)
                                if (!uiRenderizada) { return }
                                if (respuestaServidor?.error) {
                                    if (pantallaDeCarga_renderizda) {
                                        return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                                    }
                                }
                                if (respuestaServidor?.ok) {
                                    casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.desgloseTotal.controladores.desplegarContenedorFinanciero({
                                        instanciaUID_contenedorFinanciero,
                                        reservaUID
                                    })
                                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                }
                            },
                        }
                    },
                },
                controladores: {
                    desplegarContenedorFinanciero: async (data) => {
                        const reservaUID = data.reservaUID
                        const transaccion = {
                            zona: "administracion/reservas/detallesReserva/global/obtenerReserva",
                            reservaUID: reservaUID,
                            capas: [
                                "desgloseFinanciero",
                            ]
                        }
                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        const instanciaRenderizada = document.querySelector(`[reservaUID="${reservaUID}"] [componente=contenedorDesgloseTotal]`)
                        if (!instanciaRenderizada) {
                            return
                        }
                        if (respuestaServidor?.error) {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                        }
                        if (respuestaServidor?.ok) {
                            const totalGlobal = document.querySelector("[dataReserva=totalReservaConImpuestos]")
                            const contenedorFinanciero = respuestaServidor.ok.contenedorFinanciero
                            const totalFinal = contenedorFinanciero.desgloseFinanciero.global.totales.totalFinal
                            totalGlobal.textContent = totalFinal
                            casaVitini.view.__sharedMethods__.contenedorFinanciero.constructor({
                                destino: `[reservaUID="${reservaUID}"] [componente=contenedorDesgloseTotal]`,
                                contenedorFinanciero,
                                modoUI: "administracion"
                            })
                        }
                    }
                }
            },
            cancelarReserva: {
                arranque: async function () {
                    document.body.style.overflow = "hidden";
                    const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                    const main = document.querySelector("main")
                    const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                    const instanciaUID = ui.getAttribute("instanciaUID")
                    main.appendChild(ui)
                    const contenedor = ui.querySelector("[componente=contenedor]")
                    const spinner = casaVitini.ui.componentes.spinner({
                        mensaje: "Obtenido estado de la reserva...",
                        textoBoton: "Cancelar"
                    })
                    contenedor.appendChild(spinner)
                    const respuestaServidor = await casaVitini.shell.servidor({
                        zona: "administracion/reservas/detallesReserva/global/obtenerReserva",
                        reservaUID: reservaUID,
                        capas: []
                    })
                    const ui_renderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                    if (!ui_renderizada) { return }
                    spinner?.remove()
                    if (respuestaServidor?.error) {
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                    }
                    if (respuestaServidor?.ok) {
                        const estadoReservaIDV = respuestaServidor.ok.global.estadoReservaIDV
                        const tituloCancelarReserva = document.createElement("p")
                        tituloCancelarReserva.classList.add("tituloGris", "padding12", "textoCentrado")
                        contenedor.appendChild(tituloCancelarReserva)
                        const botonCerrar = () => {
                            const ui = document.createElement("div")
                            ui.classList.add("botonV1")
                            ui.textContent = "Cerrar y volver atras"
                            ui.addEventListener("click", () => {
                                casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.cancelarReserva.salirDelProceso(reservaUID)
                            })
                            return ui
                        }
                        contenedor.appendChild(botonCerrar())
                        if (estadoReservaIDV === "cancelada") {
                            tituloCancelarReserva.textContent = `La reserva ${reservaUID} ya esta cancelada`
                        } else {
                            tituloCancelarReserva.textContent = `Opciones de cancelación y eliminación de la reserva ${reservaUID}`
                            const bloqueBloqueoApartamentos = document.createElement("div")
                            bloqueBloqueoApartamentos.classList.add(
                                "flexVertical",
                                "borderRadius22",
                                "borderGrey1",
                                "padding6",
                                "gap6"
                            )
                            contenedor.appendChild(bloqueBloqueoApartamentos)
                            const tituloBloquoApartamentos = document.createElement("div")
                            tituloBloquoApartamentos.classList.add("padding12")
                            tituloBloquoApartamentos.textContent = "Selecciona qué tipo de bloqueo quieres aplicar a los apartamentos de esta reserva tras la cancelación."
                            bloqueBloqueoApartamentos.appendChild(tituloBloquoApartamentos)
                            const opcionBloqueoTemporalPorRango = document.createElement("p")
                            opcionBloqueoTemporalPorRango.classList.add("botonV1BlancoIzquierda")
                            opcionBloqueoTemporalPorRango.setAttribute("componente", "cancelarReservaOpcionBloqueo")
                            opcionBloqueoTemporalPorRango.setAttribute("cancelarReservatipoBloqueo", "rangoTemporal")
                            opcionBloqueoTemporalPorRango.addEventListener("click", casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.cancelarReserva.seleccionarOpcionBloqueoApartametos)
                            opcionBloqueoTemporalPorRango.textContent = "Bloquear los apartamentos de esta reserva tras la cancelación durante el mismo rango que tiene esta reserva."
                            bloqueBloqueoApartamentos.appendChild(opcionBloqueoTemporalPorRango)
                            const opcionBloqueoPermanente = document.createElement("p")
                            opcionBloqueoPermanente.classList.add("botonV1BlancoIzquierda")
                            opcionBloqueoPermanente.setAttribute("componente", "cancelarReservaOpcionBloqueo")
                            opcionBloqueoPermanente.setAttribute("cancelarReservatipoBloqueo", "permanente")
                            opcionBloqueoPermanente.addEventListener("click", casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.cancelarReserva.seleccionarOpcionBloqueoApartametos)
                            opcionBloqueoPermanente.textContent = "Bloquear los apartamentos de esta reserva tras la cancelación con un bloqueo permanente. Deberá liberarlos manualmente."
                            bloqueBloqueoApartamentos.appendChild(opcionBloqueoPermanente)
                            const tituloSinBloquoApartamentos = document.createElement("div")
                            tituloSinBloquoApartamentos.classList.add("padding12")
                            tituloSinBloquoApartamentos.textContent = "Cancela la reserva sin bloquear los apartamentos y liberarlos para que esten disponibles inmediatament despues de cancelar la reserva."
                            bloqueBloqueoApartamentos.appendChild(tituloSinBloquoApartamentos)
                            const opcionBloqueoPorLiberacion = document.createElement("p")
                            opcionBloqueoPorLiberacion.classList.add("botonV1BlancoIzquierda")
                            opcionBloqueoPorLiberacion.setAttribute("componente", "cancelarReservaOpcionBloqueo")
                            opcionBloqueoPorLiberacion.setAttribute("cancelarReservatipoBloqueo", "sinBloqueo")
                            opcionBloqueoPorLiberacion.addEventListener("click", casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.cancelarReserva.seleccionarOpcionBloqueoApartametos)
                            opcionBloqueoPorLiberacion.textContent = "Liberar los apartamentos de esta reserva tras la cancelación para que pasen a estar disponibles para su reserva."

                            bloqueBloqueoApartamentos.appendChild(opcionBloqueoPorLiberacion)
                            const bloqueBotones = document.createElement("div")
                            bloqueBotones.classList.add("detallesReservaCancelarReservabloqueBotones")
                            const entradaPalabraCancelar = document.createElement("input")
                            entradaPalabraCancelar.classList.add("detallesReservaCancelarEntradaTextoCancelar")
                            entradaPalabraCancelar.placeholder = "Escriba la palabra cancelar"
                            const infoBotonCancelar = document.createElement("div")
                            infoBotonCancelar.classList.add("padding12")
                            infoBotonCancelar.setAttribute("com", "infoBoton")
                            infoBotonCancelar.textContent = "Para que se habilite el botón, tienes que seleccionar una de las tres opciones de arriba. Confirmar y cancelar la reserva."
                            bloqueBloqueoApartamentos.appendChild(infoBotonCancelar)
                            const botonCancelar = document.createElement("div")
                            botonCancelar.classList.add("botonV1BlancoIzquierda")
                            botonCancelar.setAttribute("componente", "botonConfirmarCancelarReserva")
                            botonCancelar.style.pointerEvents = "none"
                            botonCancelar.style.color = "#313131"
                            botonCancelar.textContent = "Confirmar y cancelar reserva"
                            botonCancelar.addEventListener("click", () => {
                                const tipoBloqueoIDV = document.querySelector("[componente=cancelarReservaOpcionBloqueo][estado=activo]").getAttribute("cancelarReservatipoBloqueo")
                                casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.cancelarReserva.confirmaCancelacion({
                                    tipoBloqueoIDV
                                })
                            })
                            bloqueBloqueoApartamentos.appendChild(botonCancelar)
                        }
                        const infoEliminarReserva = document.createElement("div")
                        infoEliminarReserva.classList.add("padding12")
                        contenedor.appendChild(infoEliminarReserva)
                        if (estadoReservaIDV === "cancelada") {
                            infoEliminarReserva.textContent = "La reserva está cancelada. Por lo tanto, ya no tiene vigencia pernoctaría. Si lo prefieres puedes eliminar la reserva completamente. Esta operación borra toda la información dentro de la reserva, como el alojamiento, complementos de alojamiento, ofertas y servicios. Esta información solo se borra de dentro de la reserva."
                        } else {
                            infoEliminarReserva.textContent = "También puedes eliminar irreversiblemente una reserva. La eliminación irreversible de una reserva borra la información de la reserva, así como los pagos asociados a la reserva y toda la información relacionada con la reserva, menos los datos de los clientes y titulares que permanecen disponibles para otras reservas. A diferencia de la cancelación, los datos de la reserva dejarán de estar disponibles."
                        }
                        const botonEliminarReserva = document.createElement("div")
                        botonEliminarReserva.classList.add("botonV1BlancoIzquierda")
                        botonEliminarReserva.setAttribute("componente", "botonConfirmarCancelarReserva")
                        botonEliminarReserva.textContent = "Eliminar irreversiblemente la reserva"
                        botonEliminarReserva.addEventListener("click", casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.cancelarReserva.eliminarReservaIrreversiblemente.UI)
                        contenedor.appendChild(botonEliminarReserva)
                        //contenedor.appendChild(bloqueBotones)
                    }
                },
                seleccionarOpcionBloqueoApartametos: function (opcion) {
                    const selectorOpciones = document.querySelectorAll("[componente=cancelarReservaOpcionBloqueo]")
                    const opcionBloqueo = opcion.target
                    const botonCancelar = document.querySelector("[componente=botonConfirmarCancelarReserva]")
                    const contenedor = opcionBloqueo.closest("[componente=contenedor]")
                    const info = contenedor.querySelector("[com=infoBoton]")

                    if (opcionBloqueo.getAttribute("estado") === "activo") {
                        opcionBloqueo.removeAttribute("estado")
                        botonCancelar.style.pointerEvents = "none"
                        botonCancelar.style.color = "#313131"
                        opcionBloqueo.removeAttribute("style")
                        info.textContent = "Para que se habilite el botón, tienes que seleccionar una de las tres opciones de arriba. Confirmar y cancelar la reserva."

                        return
                    }
                    selectorOpciones.forEach((opcionBloqueo) => {
                        opcionBloqueo.removeAttribute("style")
                        opcionBloqueo.removeAttribute("estado")
                    })
                    opcionBloqueo.style.background = "blue"
                    opcionBloqueo.style.color = "white"
                    opcionBloqueo.setAttribute("estado", "activo")
                    botonCancelar.removeAttribute("style")
                    info.textContent = "Opcion de selecionada, confirma operación"
                },
                confirmaCancelacion: async function (data) {
                    const instanciaUID_pantallaEspera = casaVitini.utilidades.codigoFechaInstancia()
                    const metadatosPantallaCarga = {
                        mensaje: "Cancelando reserva...",
                        instanciaUID: instanciaUID_pantallaEspera,
                    }
                    casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(metadatosPantallaCarga)
                    const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                    const tipoBloqueoIDV = data.tipoBloqueoIDV
                    const transaccion = {
                        zona: "administracion/reservas/detallesReserva/global/cancelarReserva",
                        reservaUID: String(reservaUID),
                        tipoBloqueoIDV: tipoBloqueoIDV
                    }
                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    const selectorPantallaDeCarga = document.querySelector(`[instanciaUID="${instanciaUID_pantallaEspera}"]`)
                    selectorPantallaDeCarga?.remove()
                    const reservaUI = document.querySelector(`[reservaUID="${reservaUID}"]`)
                    if (!reservaUI) { return }
                    if (respuestaServidor?.error) {
                        casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                    } else if (respuestaServidor?.ok) {
                        const m = "Reserva cancelada"
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        casaVitini.ui.componentes.advertenciaInmersiva(m)
                        document.querySelector(`[reservaUID="${reservaUID}"] [dataReserva=estado]`).textContent = "Cancelada"
                        document.querySelector(`[reservaUID="${reservaUID}"] [contenedor=pendiente]`).style.display = "none"
                        document.querySelector(`[reservaUID="${reservaUID}"] [estadoReservaIDV]`).setAttribute("estadoReservaIDV", "cancelada")
                        this.salirDelProceso(reservaUID)
                    }
                },
                eliminarReservaIrreversiblemente: {
                    UI: function (e) {
                        const reservaUID = document.querySelector("[reservaUID]").getAttribute("reservaUID")
                        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                        const contenedor = e.target.closest("[componente=advertenciaInmersiva]")
                        contenedor.style.transition = "background 500ms"
                        contenedor.style.background = "rgba(255, 0, 0, 0.3)"
                        contenedor.setAttribute("instanciaUID", instanciaUID)
                        const selectorContenido = contenedor.querySelector("[componente=contenedor]")
                        selectorContenido.innerHTML = null
                        const contenedorCancelacion = document.createElement("div")
                        contenedorCancelacion.classList.add(
                            "flexVertical",
                            "padding6",
                            "gap6"
                        )
                        const tituloCancelarReserva = document.createElement("p")
                        tituloCancelarReserva.classList.add("tituloGris", "padding12", "textoCentrado")
                        tituloCancelarReserva.textContent = "Eliminar irreversiblemente una reserva"
                        tituloCancelarReserva.style.color = "red"
                        contenedorCancelacion.appendChild(tituloCancelarReserva)
                        const botonCancelarProcesoCancelacion = document.createElement("div")
                        botonCancelarProcesoCancelacion.classList.add("botonV1")
                        botonCancelarProcesoCancelacion.textContent = "Cerrar y volver atras"
                        botonCancelarProcesoCancelacion.addEventListener("click", () => {
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.cancelarReserva.salirDelProceso(reservaUID)
                        })
                        contenedorCancelacion.appendChild(botonCancelarProcesoCancelacion)
                        const bloqueBloqueoApartamentos = document.createElement("div")
                        bloqueBloqueoApartamentos.classList.add("flexVertical", "gap6")
                        const tituloBloquoApartamentos = document.createElement("div")
                        tituloBloquoApartamentos.classList.add("padding12")
                        tituloBloquoApartamentos.textContent = "Eliminar irreversiblemente una reserva, elimina de la base de datos la información de la reserva, los alojamientos asociados, los pernoctantes y el titular de la reserva (pero no sus datos como cliente), los pagos y los reembolsos.Esta eliminación es irreversible.Los datos desaparecerán de la base de datos y si no existen en una copia de seguridad, no serán recuperables.Si solo desea cancelar una reserva para liberar los apartamentos y hacer que deje de tener vigencia, cancélela y podrá seguir teniendo acceso a los datos de esta sin que tenga vigencia pernoctativa y ocupacional."
                        bloqueBloqueoApartamentos.appendChild(tituloBloquoApartamentos)
                        const infoSeguridad = document.createElement("div")
                        infoSeguridad.classList.add("padding12")
                        infoSeguridad.textContent = "Para eliminar una reserva irreversiblemente junto con toda su información relacionada, debe escribir su contraseña de usuario y su cuenta debe tener autorización administrativa."
                        bloqueBloqueoApartamentos.appendChild(infoSeguridad)
                        const campo = document.createElement("input")
                        campo.classList.add("botonV1BlancoIzquierda_noSeleccionable")
                        campo.setAttribute("campo", "clave")
                        campo.type = "password"
                        campo.placeholder = "Escriba la contraseña de su VitiniID"
                        bloqueBloqueoApartamentos.appendChild(campo)
                        contenedorCancelacion.appendChild(bloqueBloqueoApartamentos)
                        const bloqueBotones = document.createElement("div")
                        bloqueBotones.classList.add("detallesReservaCancelarReservabloqueBotones")
                        const botonCancelar = document.createElement("div")
                        botonCancelar.classList.add("botonV1BlancoIzquierda")
                        botonCancelar.setAttribute("componente", "botonConfirmarCancelarReserva")
                        botonCancelar.textContent = "Eliminar reseva irreversiblemente"
                        botonCancelar.addEventListener("click", () => {
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.cancelarReserva.eliminarReservaIrreversiblemente.confirmar({
                                instanciaUID,
                                reservaUID
                            })
                        })
                        bloqueBloqueoApartamentos.appendChild(botonCancelar)
                        contenedorCancelacion.appendChild(bloqueBotones)
                        selectorContenido.appendChild(contenedorCancelacion)
                    },
                    confirmar: async function (data) {
                        const reservaUID = data.reservaUID
                        const instanciaUID = data.instanciaUID
                        const clave = document.querySelector(`[instanciaUID="${instanciaUID}"] [campo=clave]`)
                        const instanciaUID_pantallDeCarga = casaVitini.utilidades.codigoFechaInstancia()
                        const metadatosPantallaCarga = {
                            mensaje: "Eliminado reserva...",
                            instanciaUID: instanciaUID_pantallDeCarga,
                        }
                        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(metadatosPantallaCarga)
                        const transaccion = {
                            zona: "administracion/reservas/detallesReserva/global/eliminarIrreversiblementeReserva",
                            reservaUID: String(reservaUID),
                            clave: clave?.value
                        }
                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        const selectorPantallaDeCarga = document.querySelector(`[instanciaUID="${instanciaUID_pantallDeCarga}"]`)
                        selectorPantallaDeCarga?.remove()
                        const reservaUI = document.querySelector(`[reservaUID="${reservaUID}"]`)
                        if (!reservaUI) { return }
                        if (respuestaServidor?.error) {
                            document.querySelector(`[instanciaUID="${instanciaUID}"] [campo=clave]`).value = ""
                            return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                        }
                        if (respuestaServidor?.ok) {
                            const granuladoURL = casaVitini.utilidades.granuladorURL()
                            granuladoURL.rawArray.pop()
                            const rawArray = granuladoURL.rawArray
                            const main = document.querySelector("main")
                            main.innerHTML = null
                            const directoriosFusion = "/administracion/reservas"
                            const componentesExistenteUID = "reservaUID_" + reservaUID
                            const titulo = "Casa Vitini"
                            const estado = {
                                zona: directoriosFusion,
                                EstadoInternoZona: "estado",
                                tipoCambio: "parcial",
                                componenteExistente: componentesExistenteUID,
                                funcionPersonalizada: "administracion.reservas.detallesReserva.reservaUI.categorias.limpiarMenusCategorias"
                            }
                            window.history.pushState(estado, titulo, directoriosFusion);
                            const info = document.createElement("div")
                            info.classList.add(
                                "margin10",
                                "textoCentrado",
                                "negritas"
                            )
                            info.textContent = `Se ha eliminado la reserva ${reservaUID}`
                            main.appendChild(info)
                        }
                    }
                },
                salirDelProceso: function (reservaUID) {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas();
                    const granuladoURL = casaVitini.utilidades.granuladorURL()
                    casaVitini.view.__sharedMethods__.detallesReservaUI.reservaUI.ui.componentesUI.categoriasGlobalesUI.limpiarMenusCategorias()
                    granuladoURL.rawArray.pop()
                    const rawArray = granuladoURL.rawArray
                    const directoriosFusion = "/" + rawArray.join("/")
                    const componentesExistenteUID = "reservaUID_" + reservaUID
                    const titulo = "Casa Vitini"
                    const estado = {
                        zona: directoriosFusion,
                        EstadoInternoZona: "estado",
                        tipoCambio: "parcial",
                        componenteExistente: componentesExistenteUID,
                        funcionPersonalizada: "casaVitini.view.__sharedMethods__.detallesReservaUI.reservaUI.categorias.limpiarMenusCategorias"
                    }
                    window.history.pushState(estado, titulo, directoriosFusion);
                },
            },
            miscelanea: {
                arranque: async function () {
                    const reservaUI = document.querySelector("[reservaUID]")
                    const configuracionVista = reservaUI.getAttribute("configuracionVista")
                    const reservaUID = reservaUI.getAttribute("reservaUID")
                    const obtenerPDF = async () => {
                        const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                        pantallaInmersiva.style.justifyContent = "center"
                        const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
                        const instanciaUID = pantallaInmersiva.closest("[instanciaUID]").getAttribute("instanciaUID")
                        const titulo = constructor.querySelector("[componente=titulo]")
                        titulo.textContent = "Reserva en pdf"
                        const mensaje = constructor.querySelector("[componente=mensajeUI]")
                        mensaje.textContent = "Generando el pdf..."
                        const contenedorEspacio = constructor.querySelector("[componente=contenedor]")
                        const spinnerPorRenderizar = casaVitini.ui.componentes.spinnerSimple()
                        contenedorEspacio.appendChild(spinnerPorRenderizar)
                        const botonDescargar = constructor.querySelector("[boton=aceptar]")
                        botonDescargar.style.display = "none"
                        const botonCancelar = constructor.querySelector("[boton=cancelar]")
                        botonCancelar.textContent = "Cancelar generacion del pdf..."
                        document.querySelector("main").appendChild(pantallaInmersiva)
                        const advertenciaInmersivaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                        const transaccion = {
                            reservaUID
                        }
                        if (configuracionVista === "publica") {
                            transaccion.zona = "miCasa/misReservas/obtenerPDF"
                        } else {
                            transaccion.zona = "administracion/reservas/detallesReserva/miscelanea/pdfReserva"
                        }
                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        const pantallaInmersivaRenderizda = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                        if (!pantallaInmersivaRenderizda) {
                            return
                        }
                        if (respuestaServidor?.error) {
                            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.error)
                        }
                        if (respuestaServidor.ok) {
                            const pdfBase64 = respuestaServidor.pdf
                            const selectorZonaGestion = advertenciaInmersivaRenderizada.querySelector("[componente=contenedor]");
                            selectorZonaGestion.innerHTML = null;
                            mensaje.textContent = "Se ha generado el archivo PDF con el resumen de esta reserva.Para descargar el PDF, pulsa en el botón inferior.";
                            const botonDescargarPDF = document.createElement("a")
                            botonDescargarPDF.classList.add(
                                "botonV1"
                            )
                            botonDescargarPDF.textContent = "Descargar un resumen de la reserva en PDF"
                            botonDescargarPDF.download = "Reserva.pdf"
                            botonDescargarPDF.title = "Descargar PDF"
                            botonDescargarPDF.href = `data:application/pdf;base64,${pdfBase64}`
                            botonDescargar.parentNode.replaceChild(botonDescargarPDF, botonDescargar);
                            botonCancelar.textContent = "Cancelar y volver"
                        }
                    }
                    const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                    const contenedorDinamico = document.querySelector("[componente=contenedorDinamico]")
                    const contenedorDesgloseDelTotal = document.createElement("div")
                    contenedorDesgloseDelTotal.classList.add("administracion_reserver_detallesReserva_contenedorDesgloseTotal")
                    contenedorDesgloseDelTotal.setAttribute("instanciaUID", instanciaUID)
                    contenedorDesgloseDelTotal.setAttribute("componente", "contenedorDesgloseTotal")
                    contenedorDinamico.appendChild(contenedorDesgloseDelTotal)
                    const contenedorAdvertenciaInmersiva = document.createElement("div")
                    contenedorAdvertenciaInmersiva.classList.add("administracion_reservas_detallesReserva_contenedorMisleanea")
                    const titulo = document.createElement("p")
                    titulo.classList.add("detallesReserva_reembolso_tituloGlobal")
                    titulo.textContent = "Miscelánea"
                    contenedorAdvertenciaInmersiva.appendChild(titulo)
                    const infoGlobal = document.createElement("div")
                    infoGlobal.classList.add("detallesReserva_reembolso_infoGlobal")
                    infoGlobal.textContent = `En la miscelánea de la reserva encontrará operaciones y demás propósitos u opciones que, por su idiosincrasia específica, no requieren de un contexto dedicado.`
                    contenedorAdvertenciaInmersiva.appendChild(infoGlobal)
                    let boton = document.createElement("div")
                    boton.classList.add("botonV1BlancoIzquierda_sinRadius", "borderRadius12")
                    boton.addEventListener("click", obtenerPDF)
                    boton.textContent = "Generar un PDF del resumen de la reserva"
                    contenedorAdvertenciaInmersiva.appendChild(boton)
                    boton = document.createElement("div")
                    boton.classList.add("administracion_reservas_detallesReserfa_miscelanea_botonOpcion")
                    boton.textContent = "Generar un PDF del resumen de la reserva y enviar por mail(implementandose)"
                    const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                    instanciaRenderizada.innerHTML = null
                    instanciaRenderizada.appendChild(contenedorAdvertenciaInmersiva)
                }
            },
        },
    },
}