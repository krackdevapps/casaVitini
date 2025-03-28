casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const comandoInicial = granuladoURL.directorios[granuladoURL.directorios.length - 1]
        if (comandoInicial === "comportamiento_de_precios" && Object.keys(granuladoURL.parametros).length === 0) {

            main.setAttribute("zonaCSS", "administracion/comportamiento_de_precios")
            this.portadaUI()
        } else if (granuladoURL.parametros.comportamiento) {

            main.setAttribute("zonaCSS", "administracion/comportamiento_de_precios/comportamientoUI")
            this.detallesComportamiento.UI(granuladoURL.parametros.comportamiento)
        } else {

            casaVitini.ui.componentes.mensajeSimple({
                titulo: "No existe ninguna reserva con ese identificador",
                descripcion: "No existe ningún comportamiento de precio con este identificador."
            })
        }

    },
    portadaUI: async function () {
        const espacioOfertas = document.querySelector("[componente=espacioComportamiento]")
        const contenedor = document.createElement("div")
        contenedor.classList.add("gestionDeOfertasContenedor")
        const contenedorBotones = document.createElement("div")
        contenedorBotones.classList.add("gestionDeOfertasContenedorBotones", "gap6")

        const botonIrAlCalendario = document.createElement("a")
        botonIrAlCalendario.classList.add("botonV1Blanco")
        botonIrAlCalendario.textContent = "Ver comportamientos en el calendario"
        botonIrAlCalendario.setAttribute("href", "/administracion/calendario/capa:todos_los_comportamientos_de_precio/capa:todos_los_precios_sumados")

        botonIrAlCalendario.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
        contenedorBotones.appendChild(botonIrAlCalendario)


        const botonCrearOfertas = document.createElement("a")
        botonCrearOfertas.classList.add("botonV1Blanco")
        botonCrearOfertas.textContent = "Crear un comportamiento de precios"
        botonCrearOfertas.setAttribute("href", "/administracion/comportamiento_de_precios/crear_comportamiento")

        botonCrearOfertas.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
        contenedorBotones.appendChild(botonCrearOfertas)



        contenedor.appendChild(contenedorBotones)
        const contenedorOfertas = document.createElement("div")
        contenedorOfertas.classList.add("comportamintoDePreciosSuperBloque")
        contenedorOfertas.setAttribute("componente", "espacioListaOfertas")
        contenedor.appendChild(contenedorOfertas)
        espacioOfertas.appendChild(contenedor)
        const transaccion = {
            zona: "administracion/comportamientoDePrecios/listaComportamientosPrecios"
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const espacioListaOfertas = document.querySelector("[componente=espacioListaOfertas]")
            const comportamientosCondigurados = respuestaServidor?.comportamientosDePrecio
            if (comportamientosCondigurados.length === 0) {
                const ofertaUI = document.createElement("a")
                ofertaUI.classList.add("ofertaUINoHay")
                const tituloOferta = document.createElement("p")
                tituloOferta.classList.add("ofertaUITituloOferta")
                tituloOferta.textContent = "No hay ningún comportamiento de precios configurado.Pulsa en el botón para crear un nuevo comportamiento de precio para crear uno."
                ofertaUI.appendChild(tituloOferta)
                espacioListaOfertas.appendChild(ofertaUI)
                return
            } else if (comportamientosCondigurados.length > 0) {
                comportamientosCondigurados.forEach((detallesComportamiento) => {
                    const comportamientoUI = this.comportamientosUI(detallesComportamiento)
                    espacioListaOfertas.appendChild(comportamientoUI)
                })
            }
        }
    },
    comportamientosUI: function (data) {
        const contenedor = data.contenedor
        const tipo = contenedor.tipo
        const comportamientoUID = data.comportamientoUID
        const nombreComportamiento = data.nombreComportamiento
        const estadoIDV = data.estadoIDV

        const objetoEstado = {
            activado: "Comportamiento activado",
            desactivado: "Comportamiento desactivado"
        }

        const definicionTipo = {
            porRango: "Basado en el rango de vigencia del comportamiento.",
            porDias: "Basado en días de la semana.",
            porCreacion: "Basado en el rango de vigencia del comportamiento y el rango de creación."

        }

        const descripcionObjeto = {
            porRango: "Este comportamiento solo se aplica a los días con noche que estén dentro del rango especificado.",
            porDias: "Este comportamiento se aplica a los días con noche de la semana específicos.Este comportamiento se aplicará repetidamente hasta que se desactive o elimine.",
            porCreacion: "Este comportamiento solo se aplica a los días con noche que estén dentro del rango especificado.Siempre que la reserva se halla hecha entre los rangos de creación especificados."

        }

        const comportamientoUI = document.createElement("div")
        comportamientoUI.classList.add("comportamientoUI")

        const contenedorTituloEstado = document.createElement("div")
        contenedorTituloEstado.classList.add("contenedorTituloEstado")

        const tituloComportamiento = document.createElement("p")
        tituloComportamiento.classList.add("ofertaUITituloOferta")
        tituloComportamiento.classList.add("negrita")
        tituloComportamiento.textContent = nombreComportamiento
        contenedorTituloEstado.appendChild(tituloComportamiento)

        const estadoComportamiento = document.createElement("p")
        estadoComportamiento.classList.add("ofertaUITituloOferta")
        estadoComportamiento.textContent = objetoEstado[estadoIDV]
        contenedorTituloEstado.appendChild(estadoComportamiento)


        const definicionTipoUI = document.createElement("p")
        definicionTipoUI.classList.add("ofertaUITituloOferta")
        definicionTipoUI.textContent = definicionTipo[tipo]
        contenedorTituloEstado.appendChild(definicionTipoUI)

        comportamientoUI.appendChild(contenedorTituloEstado)

        const descripcion = document.createElement("p")
        descripcion.classList.add("contenedorTituloEstado")
        descripcion.textContent = descripcionObjeto[tipo]
        comportamientoUI.appendChild(descripcion)


        if (tipo === "porRango") {
            const fechaInicio = contenedor.fechaInicio
            const fechaFinal = contenedor.fechaFinal

            const contenedorGlobalOferta = document.createElement("div")
            contenedorGlobalOferta.classList.add("ofertaUIContenedorComportamiento")

            const contenedorDetalleOferta = document.createElement("div")
            contenedorDetalleOferta.classList.add("ofertaUIContenedorDetalles")

            const fechaInicioContenedor = document.createElement("div")
            fechaInicioContenedor.classList.add("comportamientoUIFechaContenedor")
            const tituloFechaInicio = document.createElement("div")
            tituloFechaInicio.classList.add("ofertaUITituloFecha")
            tituloFechaInicio.textContent = "Fecha de inicio del comportamiento"
            fechaInicioContenedor.appendChild(tituloFechaInicio)
            const datoFechaInicio = document.createElement("div")
            datoFechaInicio.classList.add("ofertaUIDatoFecha")
            datoFechaInicio.textContent = fechaInicio
            fechaInicioContenedor.appendChild(datoFechaInicio)
            contenedorGlobalOferta.appendChild(fechaInicioContenedor)
            const fechaFinContenedor = document.createElement("div")
            fechaFinContenedor.classList.add("comportamientoUIFechaContenedor")
            const tituloFechaFin = document.createElement("div")
            tituloFechaFin.classList.add("ofertaUITituloFecha")
            tituloFechaFin.textContent = "Fecha de fin  del comportamiento"
            fechaFinContenedor.appendChild(tituloFechaFin)
            const datoFechaFin = document.createElement("div")
            datoFechaFin.classList.add("ofertaUIDatoFecha")
            datoFechaFin.textContent = fechaFinal
            fechaFinContenedor.appendChild(datoFechaFin)
            contenedorGlobalOferta.appendChild(fechaFinContenedor)
            comportamientoUI.appendChild(contenedorGlobalOferta)


        } else if (tipo === "porDias") {
            const diasArray = contenedor.dias
            const numeroDedias = diasArray.length

            const contenedorGlobalOferta = document.createElement("div")
            contenedorGlobalOferta.classList.add("contenedorDiasSelecionados")
            contenedorGlobalOferta.style.gridTemplateColumns = `repeat(${numeroDedias}, 1fr)`


            const contenedorDetalleOferta = document.createElement("div")
            contenedorDetalleOferta.classList.add("ofertaUIContenedorDetalles")


            const diasObjeto = {
                lunes: "Lunes",
                martes: "Martes",
                miercoles: "Miércoles",
                jueves: "Jueves",
                viernes: "Viernes",
                sabado: "Sábado",
                domingo: "Domingo"
            }

            for (const dia of diasArray) {
                const contenedorDia = document.createElement("div")
                contenedorDia.classList.add("diaSeleciconadoCelda")
                contenedorDia.textContent = diasObjeto[dia]
                contenedorGlobalOferta.appendChild(contenedorDia)

            }
            comportamientoUI.appendChild(contenedorGlobalOferta)


        } else if (tipo === "porCreacion") {
            const fechaFinal_creacionReserva = contenedor.fechaFinal_creacionReserva
            const fechaInicio_creacionReserva = contenedor.fechaInicio_creacionReserva

            const fechaInicio = contenedor.fechaInicio
            const fechaFinal = contenedor.fechaFinal

            const contenedorGlobalOferta = document.createElement("div")
            contenedorGlobalOferta.classList.add("ofertaUIContenedorComportamiento")

            const fechaInicioContenedor = document.createElement("div")
            fechaInicioContenedor.classList.add("comportamientoUIFechaContenedor")
            const tituloFechaInicio = document.createElement("div")
            tituloFechaInicio.classList.add("ofertaUITituloFecha")
            tituloFechaInicio.textContent = "Fecha de inicio del comportamiento"
            fechaInicioContenedor.appendChild(tituloFechaInicio)
            const datoFechaInicio = document.createElement("div")
            datoFechaInicio.classList.add("ofertaUIDatoFecha")
            datoFechaInicio.textContent = fechaInicio
            fechaInicioContenedor.appendChild(datoFechaInicio)
            contenedorGlobalOferta.appendChild(fechaInicioContenedor)
            const fechaFinContenedor = document.createElement("div")
            fechaFinContenedor.classList.add("comportamientoUIFechaContenedor")
            const tituloFechaFin = document.createElement("div")
            tituloFechaFin.classList.add("ofertaUITituloFecha")
            tituloFechaFin.textContent = "Fecha de fin del comportamiento"
            fechaFinContenedor.appendChild(tituloFechaFin)
            const datoFechaFin = document.createElement("div")
            datoFechaFin.classList.add("ofertaUIDatoFecha")
            datoFechaFin.textContent = fechaFinal
            fechaFinContenedor.appendChild(datoFechaFin)
            contenedorGlobalOferta.appendChild(fechaFinContenedor)
            comportamientoUI.appendChild(contenedorGlobalOferta)


            const infoCreacion = document.createElement("div")
            infoCreacion.classList.add("padding6")
            infoCreacion.textContent = "El rango de creacion determina que la fecah de creacion de una reserva, debe de estar dentro de este rango para que se aplique el comportamiento de precio."
            comportamientoUI.appendChild(infoCreacion)


            const contenedorRangoCreacion = document.createElement("div")
            contenedorRangoCreacion.classList.add("ofertaUIContenedorComportamiento")
            comportamientoUI.appendChild(contenedorRangoCreacion)

            const fechaInicioCreacionContenedor = document.createElement("div")
            fechaInicioCreacionContenedor.classList.add("comportamientoUIFechaContenedor")
            contenedorRangoCreacion.appendChild(fechaInicioCreacionContenedor)


            const tituloFechaInicioCreacion = document.createElement("div")
            tituloFechaInicioCreacion.classList.add("ofertaUITituloFecha")
            tituloFechaInicioCreacion.textContent = "Fecha de inicio del rango de creación"
            fechaInicioCreacionContenedor.appendChild(tituloFechaInicioCreacion)

            const datoFechaInicioCreacion = document.createElement("div")
            datoFechaInicioCreacion.classList.add("ofertaUIDatoFecha")
            datoFechaInicioCreacion.textContent = fechaFinal_creacionReserva
            fechaInicioCreacionContenedor.appendChild(datoFechaInicioCreacion)

            const fechaFinContenedorCreacion = document.createElement("div")
            fechaFinContenedorCreacion.classList.add("comportamientoUIFechaContenedor")
            contenedorRangoCreacion.appendChild(fechaFinContenedorCreacion)


            const tituloFechaFinCreacion = document.createElement("div")
            tituloFechaFinCreacion.classList.add("ofertaUITituloFecha")
            tituloFechaFinCreacion.textContent = "Fecha de fin del rango de creación"
            fechaFinContenedorCreacion.appendChild(tituloFechaFinCreacion)

            const datoFechaFinCreacion = document.createElement("div")
            datoFechaFinCreacion.classList.add("ofertaUIDatoFecha")
            datoFechaFinCreacion.textContent = fechaInicio_creacionReserva
            fechaFinContenedorCreacion.appendChild(datoFechaFinCreacion)

        }

        const contenedorBotones = document.createElement("div")
        contenedorBotones.classList.add("flexVertical", "gap10")
        comportamientoUI.appendChild(contenedorBotones)

        const botonEntrar = document.createElement("a")
        botonEntrar.setAttribute("href", "/administracion/comportamiento_de_precios/comportamiento:" + comportamientoUID)

        botonEntrar.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
        botonEntrar.classList.add("botonV1BlancoIzquierda")
        botonEntrar.textContent = "Editar el comportamiento de precio"
        contenedorBotones.appendChild(botonEntrar)
        const apartamentosIDV = []
        contenedor.apartamentos.forEach(c => {
            apartamentosIDV.push(c.apartamentoIDV)
        })
        let urlFinal
        if (tipo === "porDias") {
            urlFinal = `/administracion/calendario/capa:comportamientos_por_apartamento/comportamientos_por_apartamento:${apartamentosIDV.join("=")}/capa:precio_noche_por_apartamento/precio_noche_por_apartamento:${apartamentosIDV.join("=")}`
        } else {
            const fechaInicio = contenedor.fechaInicio
            const mes = fechaInicio.split("-")[1]
            const ano = fechaInicio.split("-")[0]
            urlFinal = `/administracion/calendario/fecha:${Number(mes)}-${ano}/capa:comportamientos_por_apartamento/comportamientos_por_apartamento:${apartamentosIDV.join("=")}/capa:precio_noche_por_apartamento/precio_noche_por_apartamento:${apartamentosIDV.join("=")}`
        }

        const botonIrACalendario = document.createElement("a")
        botonIrACalendario.setAttribute("href", urlFinal)

        botonIrACalendario.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
        botonIrACalendario.classList.add("botonV1BlancoIzquierda")
        botonIrACalendario.textContent = "Ver el el comportamiento de precio en el calendario"
        contenedorBotones.appendChild(botonIrACalendario)
        return comportamientoUI
    },
    detallesComportamiento: {
        UI: async function (comportamientoUID) {
            const main = document.querySelector("main")
            const instanciaUID = main.getAttribute("instanciaUID")

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/comportamientoDePrecios/detallesComportamiento",
                comportamientoUID: String(comportamientoUID)
            })
            const seccionRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
            if (!seccionRenderizada) { return }
            if (respuestaServidor?.error) {
                const titulo = document.querySelector(".tituloGris")
                titulo.textContent = "No existe ningún comportamiento de precio con el identificador: " + comportamientoUID
                return
            }
            if (respuestaServidor?.ok) {
                const detalles = respuestaServidor?.detallesComportamiento
                const comportamientoUID = detalles.comportamientoUID
                const estadoIDV = detalles.estadoIDV
                const espacioOfertas = document.querySelector("[componente=espacioComportamiento]")
                espacioOfertas.setAttribute("comportamientoUID", comportamientoUID)
                espacioOfertas.setAttribute("valoresIniciales", JSON.stringify(detalles))
                const soloLecturaUI = document.createElement("div")
                soloLecturaUI.classList.add("editarOfertaSoloLecturaUI")
                const soloLecturaInfo = document.createElement("p")
                soloLecturaInfo.classList.add("editarOfertaSoloLecutraInfo")
                soloLecturaInfo.setAttribute("componente", "soloLecturaInfo")
                soloLecturaInfo.textContent = "Modo solo lectura"
                soloLecturaUI.appendChild(soloLecturaInfo)
                espacioOfertas.appendChild(soloLecturaUI)
                const ofertaUI = await casaVitini.view.__sharedMethods__.detalleUI("editarOferta")

                espacioOfertas.appendChild(ofertaUI)

                const selectorEstadoComportamiento = document.querySelector("[componente=estadoComportamiento]")
                if (estadoIDV === "desactivado") {
                    selectorEstadoComportamiento.setAttribute("estado", estadoIDV)
                    selectorEstadoComportamiento.innerHTML = "Comportamiento desactivado"
                    selectorEstadoComportamiento.style.background = "#ff000091"
                }
                if (estadoIDV === "activado") {
                    selectorEstadoComportamiento.setAttribute("estado", estadoIDV)
                    selectorEstadoComportamiento.style.background = "#00ff006e"
                    selectorEstadoComportamiento.innerHTML = "Comportamiento activado"
                }
                this.imprimirDatosEnUI()
            }
        },
        guardarCambiosComportamiento: async function () {
            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const mensaje = "Actualizando comportamiento de precio..."
            const datosPantallaSuperpuesta = {
                instanciaUID: instanciaUID,
                mensaje: mensaje
            }
            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
            const main = document.querySelector("main")
            const comportamientoUID = document.querySelector("[comportamientoUID]").getAttribute("comportamientoUID")
            const contenedorComportamiento = casaVitini.view.__sharedMethods__.constructorObjeto()

            const transaccion = {
                zona: "administracion/comportamientoDePrecios/actualizarComportamiento",
                comportamientoUID: String(comportamientoUID),
                ...contenedorComportamiento

            }

            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
            if (!instanciaRenderizada) { return }
            instanciaRenderizada.remove()
            if (respuestaServidor?.error) {

                if (respuestaServidor.comportamientosEnConflicto) {
                    const comportamientosEnConflictoUI = casaVitini.view.__sharedMethods__.compomentesUI.comportamientosEnClonfictoUI(respuestaServidor)

                    const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                    document.querySelector("main").appendChild(ui)
                    const constructor = ui.querySelector("[componente=constructor]")
                    const contenedor = ui.querySelector("[componente=contenedor]")

                    const titulo = constructor.querySelector("[componente=titulo]")
                    titulo.textContent = `Comportamientos de precio en conflicto`
                    const mensaje = constructor.querySelector("[componente=mensajeUI]")
                    mensaje.textContent = respuestaServidor?.error

                    const botonAceptar = constructor.querySelector("[boton=aceptar]")
                    botonAceptar.textContent = "Aceptar y volver al comportamiento"
                    botonAceptar.addEventListener("click", () => {
                        return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    })
                    const botonCancelar = constructor.querySelector("[boton=cancelar]")
                    botonCancelar.remove()

                    contenedor.appendChild(comportamientosEnConflictoUI)
                } else {
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.error)
                }


            }
            if (respuestaServidor?.ok) {

                const comportamientoActualizado = respuestaServidor.comportamientoActualizado
                const espacioOfertas = document.querySelector("[componente=espacioComportamiento]")
                espacioOfertas.setAttribute("valoresIniciales", JSON.stringify(comportamientoActualizado))
                const modo = {
                    modo: "botonCancelarCambios"
                }
                casaVitini.view.detallesComportamiento.comportamientoModos(modo)

            }
        },
        comportamientoModos: function (modo) {
            let botonModo
            if (modo.target) {
                botonModo = modo.target.getAttribute("componente")
            }
            if (modo.modo) {
                botonModo = modo.modo
            }
            if (botonModo === "botonEditarOferta") {
                let selectorBotonesEditar = document.querySelectorAll("[componente=botonEditarOferta]")
                selectorBotonesEditar.forEach((boton) => {
                    boton.classList.add("elementoOcultoInicialmente")
                })
                let selectorBotonesGuardarCambios = document.querySelectorAll("[componente=botonGuardarCambios]")
                selectorBotonesGuardarCambios.forEach((boton) => {
                    boton.classList.remove("elementoOcultoInicialmente")
                })
                let selectorBotonesCancelarCambios = document.querySelectorAll("[componente=botonCancelarCambios]")
                selectorBotonesCancelarCambios.forEach((boton) => {
                    boton.classList.remove("elementoOcultoInicialmente")
                })
                let selectorBotonesEliminarOferta = document.querySelectorAll("[componente=botonEliminarOferta]")
                selectorBotonesEliminarOferta.forEach((boton) => {
                    boton.classList.remove("elementoOcultoInicialmente")
                })
                document.querySelector("[componente=espacioCrearOferta]").classList.remove("eventosDesactivadosInicialmente")
                document.querySelector("[componente=soloLecturaInfo]").textContent = "Modo edición"
            }
            if (botonModo === "botonCancelarCambios") {
                document.querySelector("[componente=soloLecturaInfo]").textContent = "Modo solo lectura"

                const selectorBotonesEditar = document.querySelectorAll("[componente=botonEditarOferta]")
                selectorBotonesEditar.forEach((boton) => {
                    boton.classList.remove("elementoOcultoInicialmente")
                })
                const selectorBotonesGuardarCambios = document.querySelectorAll("[componente=botonGuardarCambios]")
                selectorBotonesGuardarCambios.forEach((boton) => {
                    boton.classList.add("elementoOcultoInicialmente")
                })
                const selectorBotonesCancelarCambios = document.querySelectorAll("[componente=botonCancelarCambios]")
                selectorBotonesCancelarCambios.forEach((boton) => {
                    boton.classList.add("elementoOcultoInicialmente")
                })
                const selectorBotonesEliminarOferta = document.querySelectorAll("[componente=botonEliminarOferta]")
                selectorBotonesEliminarOferta.forEach((boton) => {
                    boton.classList.add("elementoOcultoInicialmente")
                })
                document.querySelector("[componente=espacioCrearOferta]").classList.add("eventosDesactivadosInicialmente")
                document.querySelector("[componente=soloLecturaInfo]").classList.remove("elementoOcultoInicialmente")

                casaVitini.view.detallesComportamiento.imprimirDatosEnUI()
            }
        },
        estadoComportamiento: async function (estadoOferta) {
            let comportamientoUID = document.querySelector("[comportamientoUID]").getAttribute("comportamientoUID")
            let selectorEstadoComportamientoUI = document.querySelector("[componente=estadoComportamiento]")
            let estadoActualMemoriaVolatil = selectorEstadoComportamientoUI.textContent
            selectorEstadoComportamientoUI.textContent = "Esperando al servidor...."
            let estadoOfertaActual = estadoOferta.target.getAttribute("estado")
            let estadoComportamientoPropuesto
            if (estadoOfertaActual === "desactivado") {
                estadoComportamientoPropuesto = "activado"
            }
            if (estadoOfertaActual === "activado") {
                estadoComportamientoPropuesto = "desactivado"
            }

            let respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/comportamientoDePrecios/actualizarEstadoComportamiento",
                comportamientoUID: String(comportamientoUID),
                estadoPropuesto: estadoComportamientoPropuesto
            })
            if (!respuestaServidor) {
                selectorEstadoComportamientoUI.textContent = estadoActualMemoriaVolatil
                selectorEstadoComportamientoUI.setAttribute("estadoOferta", estadoOfertaActual)
            } else if (respuestaServidor?.error) {
                selectorEstadoComportamientoUI.textContent = estadoActualMemoriaVolatil
                selectorEstadoComportamientoUI.setAttribute("estadoOferta", estadoOfertaActual)
                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            } else if (respuestaServidor?.ok) {
                let estadoComportamientoConfirmado = respuestaServidor?.estadoComportamiento
                selectorEstadoComportamientoUI.setAttribute("estado", estadoComportamientoConfirmado)
                let estadoComportamientoUI
                if (estadoComportamientoConfirmado === "activado") {
                    selectorEstadoComportamientoUI.style.background = "#00ff006e"
                    estadoComportamientoUI = "Comportamiento activado"
                }
                if (estadoComportamientoConfirmado === "desactivado") {
                    selectorEstadoComportamientoUI.style.background = "#ff000091"
                    estadoComportamientoUI = "Comportamiento desactivado"
                }
                selectorEstadoComportamientoUI.textContent = estadoComportamientoUI
            }
        },
        eliminarComportamiento: {
            UI: async function () {
                const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                pantallaInmersiva.style.justifyContent = "center"

                const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

                const titulo = constructor.querySelector("[componente=titulo]")
                titulo.textContent = "Confirmar la eliminación del comportamiento de precio"
                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                mensaje.textContent = "Var a eliminar un comportamiento de precios configurado, ¿Estas de acuerdo ? "

                const botonAceptar = constructor.querySelector("[boton=aceptar]")
                botonAceptar.textContent = "Comfirmar la eliminacion"
                botonAceptar.addEventListener("click", () => {
                    casaVitini.view.detallesComportamiento.eliminarComportamiento.confirmar()
                })
                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                botonCancelar.textContent = "Cancelar la eliminacion"

                document.querySelector("main").appendChild(pantallaInmersiva)

            },
            confirmar: async function () {
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = "Eliminado el comportamiento del precio..."
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const comportamientoUID = document.querySelector("[comportamientoUID]").getAttribute("comportamientoUID")
                const transaccion = {
                    zona: "administracion/comportamientoDePrecios/eliminarComportamiento",
                    comportamientoUID: String(comportamientoUID)
                }
                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }
                instanciaRenderizada.remove()
                if (respuestaServidor?.error) {
                    const selectorAdvertenciaInmersiva = document.querySelectorAll("[componente=advertenciaInmersiva]")
                    selectorAdvertenciaInmersiva.forEach((advertenciaInmersiva) => {
                        advertenciaInmersiva.remove()
                    })
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    const vista = `/administracion/comportamiento_de_precios`
                    const navegacion = {
                        vista: vista,

                    }
                    casaVitini.shell.navegacion.controladorVista(navegacion)
                }
            }
        },
        // controladoresUI: {
        //     opcionesTipo: function(tipo)  {
        //         const selectorBotones = document.querySelectorAll("[botonTipo]")
        //         selectorBotones.forEach((boton) => {
        //             boton.removeAttribute("style")
        //             boton.removeAttribute("estado")

        //         })
        //         const botonSeleccionado = document.querySelector(`[botonTipo="${tipo}"]`)
        //         if (botonSeleccionado) {
        //             botonSeleccionado.style.background = "blue"
        //             botonSeleccionado.style.color = "white"
        //             botonSeleccionado.setAttribute("estado", "activado")

        //         }

        //         const selectoresContenedoresTipo = document.querySelectorAll(`[contenedor_tipobloqueo]`)
        //         selectoresContenedoresTipo.forEach((contenedor) => {
        //             contenedor.removeAttribute("style")
        //         })

        //         const contenedorSeleccionado = document.querySelector(`[contenedor_tipobloqueo="${tipo}"]`)
        //         if (contenedorSeleccionado) {
        //             document.querySelector("[contenedor=tipoComportamientos]").classList.remove("ocultoInicial")

        //             contenedorSeleccionado.style.display = "flex"
        //         }
        //     },
        //     selectorDiasSemana: function (diasArray)  {
        //         const selectorDias = document.querySelectorAll("[componente=diaUI]")
        //         selectorDias.forEach((dia) => {
        //             dia.removeAttribute("style")
        //             dia.removeAttribute("estado")
        //         })

        //         for (const diaIDV of diasArray) {
        //             const selectorDia = document.querySelector(`[componente=diaUI][diaIDV="${diaIDV}"]`)
        //             selectorDia.setAttribute("estado", "activado")
        //             selectorDia.style.background = "blue"
        //             selectorDia.style.color = "white"
        //         }
        //     }
        // },
        imprimirDatosEnUI: function () {
            const datos = JSON.parse(document.querySelector("[valoresIniciales]").getAttribute("valoresIniciales"))
            const nombreComportamiento = datos.nombreComportamiento
            const contenedor = datos.contenedor
            const tipo = contenedor.tipo
            const apartamentos = contenedor.apartamentos

            const campoNombre = document.querySelector("[campoOferta=nombreOferta]")
            campoNombre.value = nombreComportamiento

            casaVitini.view.__sharedMethods__.controladoresUI.opcionesTipo(tipo)
            const areaContenedor = document.querySelector(`[contenedor_tipobloqueo="${tipo}"]`)

            if (tipo === "porRango") {
                const contenedorFechasRango = areaContenedor.querySelector("[nombreContenedor=rangoComportamiento]")
                const selectorFechaInicio = contenedorFechasRango.querySelector("[calendario=entrada]")
                const selectorFechaFin = contenedorFechasRango.querySelector("[calendario=salida]")
                const selectorFechaInicioUI = contenedorFechasRango.querySelector("[fechaUI=fechaInicio]")
                const selectorFechaFinUI = contenedorFechasRango.querySelector("[fechaUI=fechaFin]")

                const selectorDias = document.querySelectorAll("[componente=diaUI]")
                selectorDias.forEach((dia) => {
                    dia.removeAttribute("style")
                    dia.removeAttribute("estado")
                })

                const fechaInicio = contenedor.fechaInicio
                const fechaFinal = contenedor.fechaFinal
                selectorFechaInicio.setAttribute("memoriaVolatil", fechaInicio)
                selectorFechaFin.setAttribute("memoriaVolatil", fechaFinal)
                selectorFechaInicioUI.textContent = fechaInicio
                selectorFechaFinUI.textContent = fechaFinal
            } else if (tipo === "porDias") {
                const diasArray = contenedor.dias
                casaVitini.view.__sharedMethods__.controladoresUI.selectorDiasSemana(diasArray)
            } else if (tipo === "porCreacion") {
                const selectorFechaInicio = areaContenedor.querySelector("[calendario=entrada]")
                const selectorFechaFin = areaContenedor.querySelector("[calendario=salida]")
                const selectorFechaInicioUI = areaContenedor.querySelector("[fechaUI=fechaInicio]")
                const selectorFechaFinUI = areaContenedor.querySelector("[fechaUI=fechaFin]")

                const fechaInicio = contenedor.fechaInicio
                const fechaFinal = contenedor.fechaFinal
                selectorFechaInicio.setAttribute("memoriaVolatil", fechaInicio)
                selectorFechaFin.setAttribute("memoriaVolatil", fechaFinal)
                selectorFechaInicioUI.textContent = fechaInicio
                selectorFechaFinUI.textContent = fechaFinal

                const contenedorFechasCreacion = areaContenedor.querySelector("[nombreContenedor=rangoReservaCreacion]")

                const selectorFechaInicioCreacion = contenedorFechasCreacion.querySelector("[calendario=entrada]")
                const selectorFechaFinCreacion = contenedorFechasCreacion.querySelector("[calendario=salida]")
                const selectorFechaInicioUICreacion = contenedorFechasCreacion.querySelector("[fechaUI=fechaInicio]")
                const selectorFechaFinUICreacion = contenedorFechasCreacion.querySelector("[fechaUI=fechaFin]")

                const fechaInicio_creacionReserva = contenedor.fechaInicio_creacionReserva
                const fechaFinal_creacionReserva = contenedor.fechaFinal_creacionReserva
                selectorFechaInicioCreacion.setAttribute("memoriaVolatil", fechaInicio_creacionReserva)
                selectorFechaFinCreacion.setAttribute("memoriaVolatil", fechaFinal_creacionReserva)
                selectorFechaInicioUICreacion.textContent = fechaInicio_creacionReserva
                selectorFechaFinUICreacion.textContent = fechaFinal_creacionReserva
            }

            const contenedorApartamentos = areaContenedor.querySelector(`[componente=zonaAnadirApartamento]`)
            contenedorApartamentos.querySelector(`[componente=infoSinApartamento]`).style.display = "none"
            const apartamentosObsoletos = contenedorApartamentos.querySelectorAll("[apartamentoIDV]")
            apartamentosObsoletos.forEach(apartamento => apartamento.remove())
            for (const detalleApartamento of apartamentos) {
                const apartamentoIDV = detalleApartamento.apartamentoIDV
                const apartamentoUI = detalleApartamento.apartamentoUI
                const cantidad = detalleApartamento.cantidad
                const simboloIDV = detalleApartamento.simboloIDV

                const cApartamento = casaVitini.view.__sharedMethods__.selectorApartamentosEspecificosUI.apartamentoUI({
                    apartamentoIDV,
                    apartamentoUI,
                    opcionesUI: {
                        ui: casaVitini.view.__sharedMethods__.compomentesUI.opcionesApartamentoUI,
                        data: {
                            simboloIDV: simboloIDV,
                            cantidad: cantidad
                        }
                    }
                })

                contenedorApartamentos.appendChild(cApartamento)

            }
        }
    },
}