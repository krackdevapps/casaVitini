casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/enlacesDePago")
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const directorioUltimo = granuladoURL.directorios[granuladoURL.directorios.length - 1]
        const parametros = granuladoURL.parametros
        if (directorioUltimo === "enlaces_de_pago") {
            return this.portadaUI()
        } else {
            if (parametros.enlace) {
                casaVitini.administracion.enlacesDePago.detallesEnlace.UI(parametros.enlace)
            }
        }
        const info = {
            titulo: "No existe ningún enlace de pago con ese identificador.",
            descripcion: "El enlace de pago que buscas con ese identificador no existe.Comprueba el identificador de la reserva"
        }
        casaVitini.ui.componentes.mensajeSimple(info)
    },
    portadaUI: async function () {
        const espacio = document.querySelector("[componente=enlacesDePago]")
        const contenedor = document.createElement("div")
        contenedor.classList.add("enlacesDePago_contenedor")
        const contenedorBotones = document.createElement("div")
        contenedorBotones.classList.add("enlacesDePago_contenedorBotones")
        const botonCrearEnlace = document.createElement("a")
        botonCrearEnlace.classList.add("gestionDeOfertasBotonCrearOferta")
        botonCrearEnlace.textContent = "Crear un enlace de pago"
        botonCrearEnlace.setAttribute("href", "/administracion/enlaces_de_pago/crear_enlace")
        botonCrearEnlace.setAttribute("vista", "/administracion/enlaces_de_pago/crear_enlace")
        botonCrearEnlace.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)

        contenedor.appendChild(contenedorBotones)
        const contenedorOfertas = document.createElement("div")
        contenedorOfertas.classList.add("comportamintoDePreciosSuperBloque")
        contenedorOfertas.setAttribute("componente", "espacioEnlacesRenderizados")
        contenedor.appendChild(contenedorOfertas)
        espacio.appendChild(contenedor)
        const transaccion = {
            zona: "administracion/enlacesDePago/obtenerEnlaces"
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const espacioEnlacesRenderizados = document.querySelector("[componente=espacioEnlacesRenderizados]")
            const enlacesCreados = respuestaServidor?.ok
            if (enlacesCreados.length === 0) {
                const enlaceUI = document.createElement("a")
                enlaceUI.classList.add("ofertaUINoHay")
                const tituloOferta = document.createElement("p")
                tituloOferta.classList.add("ofertaUITituloOferta")
                tituloOferta.textContent = "No hay ningún enlace creado. Desde aquí puedes ver todos los enlaces de pago generados desde las reservas de una forma centralizada. Puedes generar un enlace de pago desde la reserva en la pestaña enlaces de pago."
                enlaceUI.appendChild(tituloOferta)
                espacioEnlacesRenderizados.appendChild(enlaceUI)
                return
            }
            if (Array.isArray(enlacesCreados) && enlacesCreados.length > 0) {
                enlacesCreados.forEach((detalleOferta) => {
                    const enlaceUID = detalleOferta.enlace
                    const nombreEnlace = detalleOferta.nombreEnlace
                    const reservaUID = detalleOferta.reservaUID
                    const totalReserva = detalleOferta.totalReserva
                    const cantidad = detalleOferta.cantidad
                    const descripcion = detalleOferta.descripcion
                    const estadoPagoIDV = detalleOferta.estadoPagoIDV
                    const estadoPagoUI = {
                        pagaodo: "Enlace pagado",
                        noPagado: "Enlace no pagado"
                    }
                    const descripcionFinalUI = descripcion ? descripcion : "Este enlace no tiene descripción"
                    const enlaceUI = document.createElement("a")
                    enlaceUI.classList.add("enlaceUI")
                    enlaceUI.setAttribute("enlaceUID", enlaceUID)

                    const tituloEnlace = document.createElement("p")
                    tituloEnlace.classList.add("ofertaUITituloOferta")
                    tituloEnlace.setAttribute("valorInicial", nombreEnlace)
                    tituloEnlace.textContent = nombreEnlace
                    enlaceUI.appendChild(tituloEnlace)
                    const precioUI = document.createElement("p")
                    precioUI.classList.add("ofertaUITituloOferta")
                    precioUI.textContent = totalReserva + "$ " + estadoPagoUI[estadoPagoIDV]
                    enlaceUI.appendChild(precioUI)
                    const tituloReserva = document.createElement("a")
                    tituloReserva.classList.add("enlaceUIContenedor_vinculo")
                    tituloReserva.setAttribute("href", "/administracion/reservas/reserva:" + reservaUID + "/enlaces_de_pago")
                    tituloReserva.setAttribute("vista", "/administracion/reservas/reserva:" + reservaUID + "/enlaces_de_pago")
                    tituloReserva.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                    tituloReserva.textContent = `Reserva ${reservaUID} (Ir a la reserva)`
                    enlaceUI.appendChild(tituloReserva)
                    const irAlEnlace = document.createElement("a")
                    irAlEnlace.classList.add("enlaceUIContenedor_vinculo")
                    irAlEnlace.setAttribute("href", "/pagos/" + enlaceUID)
                    irAlEnlace.setAttribute("vista", "/pagos/" + enlaceUID)
                    irAlEnlace.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                    irAlEnlace.textContent = "Ir al enlace"
                    enlaceUI.appendChild(irAlEnlace)
                    const enlaceUIContenedor = document.createElement("div")
                    enlaceUIContenedor.classList.add("enlaceUIContenedor")
                    const descripcionUI = document.createElement("div")
                    descripcionUI.classList.add("ofertaUITituloFecha")
                    descripcionUI.textContent = "Descripción del enlace"
                    enlaceUIContenedor.appendChild(descripcionUI)
                    const datoFechaFin = document.createElement("div")
                    datoFechaFin.classList.add("ofertaUIDatoFecha")
                    datoFechaFin.setAttribute("valorInicial", descripcion)
                    datoFechaFin.textContent = descripcionFinalUI
                    enlaceUIContenedor.appendChild(datoFechaFin)
                    enlaceUI.appendChild(enlaceUIContenedor)
                    espacioEnlacesRenderizados.appendChild(enlaceUI)
                })
            }
        }
    },
    detallesEnlace: {
        UI: async function (uid) {
            const transaccion = {
                zona: "administracion/enlacesDePago/detallesDelEnlace",
                enlaceUID: Number(uid)
            }
            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            if (respuestaServidor?.error) {
                const info = {
                    titulo: "No existe ningun enlace de pago con ese identificador",
                    descripcion: "El enlace de pago que buscas con ese identificador no existe.Comprueba el identificador de la reserva"
                }
                casaVitini.ui.componentes.mensajeSimple(info)
            }
            if (respuestaServidor?.ok) {
                const detallesEnlace = respuestaServidor?.ok
                const uidEnlace = detallesEnlace.reserva
                const nombreEnlace = detallesEnlace.nombreEnlace
                const codigo = detallesEnlace.codigo
                const reserva = detallesEnlace.reserva
                const precio = detallesEnlace.precio
                const descripcion = detallesEnlace.descripcion
                const estadoPago = detallesEnlace.estadoPago
                let estadoUIFinal
                if (estadoPago === "sinInformacion") {
                    estadoUIFinal = "Estado del pago sin informacion."
                }
                if (estadoPago === "pagado") {
                    estadoUIFinal = "Pago realizado"
                }
                if (estadoPago === "noPagado") {
                    estadoUIFinal = "No pagado"
                }
                const espacioDetallesEnlace = document.querySelector("[componente=enlacesDePago]")
                espacioDetallesEnlace.setAttribute("comportamientoUID", uid)
                const contenedorDetallesEnlace = document.createElement("div")
                contenedorDetallesEnlace.classList.add("detallesEnlace_contenedor")
                contenedorDetallesEnlace.setAttribute("enlaceUID", uidEnlace)
                const nombreEnlaceUI = document.createElement("input")
                nombreEnlaceUI.classList.add("detallesEnlace_nombreEnlace")
                nombreEnlaceUI.setAttribute("campo", "nombreEnlace")
                nombreEnlaceUI.setAttribute("valorInicial", nombreEnlace)
                nombreEnlaceUI.addEventListener("input", () => { casaVitini.view.controladorBotones() })
                nombreEnlaceUI.placeholder = "Escribe un nombre para este enlace y poder identificarlo rápidamente"
                nombreEnlaceUI.value = nombreEnlace
                contenedorDetallesEnlace.appendChild(nombreEnlaceUI)
                const precioUI = document.createElement("div")
                precioUI.classList.add("detallesEnlace_precio")
                precioUI.textContent = precio + "$"
                contenedorDetallesEnlace.appendChild(precioUI)
                const estadoPagoUI = document.createElement("div")
                estadoPagoUI.classList.add("detallesEnlace_estadoPago")
                estadoPagoUI.textContent = estadoUIFinal
                contenedorDetallesEnlace.appendChild(estadoPagoUI)
                const codigoUI = document.createElement("a")
                codigoUI.classList.add("detallesEnlace_codigo")
                codigoUI.setAttribute("href", "/pago: " + codigo)
                codigoUI.setAttribute("vista", "/pago: " + codigo)
                codigoUI.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                codigoUI.textContent = "Ir al enlace del pago"
                contenedorDetallesEnlace.appendChild(codigoUI)
                const reservaUI = document.createElement("a")
                reservaUI.classList.add("detallesEnlace_codigo")
                reservaUI.setAttribute("href", "/administracion/reservas/" + reserva)
                reservaUI.setAttribute("vista", "/administracion/reservas/" + reserva)
                reservaUI.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                reservaUI.textContent = `Ir a la reserva (${reserva})`
                contenedorDetallesEnlace.appendChild(reservaUI)
                const descripcionUI = document.createElement("textarea")
                descripcionUI.classList.add("detallesEnlace_descripcion")
                descripcionUI.setAttribute("campo", "descripcion")
                descripcionUI.setAttribute("valorInicial", descripcion)
                descripcionUI.addEventListener("input", () => { casaVitini.view.controladorBotones() })
                descripcionUI.placeholder = "No es obligatorio escribir una descripción, pero si lo necesitas, puedes definir un poco más a este enlace aparte de por su nombre."
                descripcionUI.value = descripcion
                contenedorDetallesEnlace.appendChild(descripcionUI)
                espacioDetallesEnlace.appendChild(contenedorDetallesEnlace)
                const contenedorBotones = document.createElement("div")
                contenedorBotones.classList.add("detalesEnlace_contenedorBotones")
                const botonGuardar = document.createElement("div")
                botonGuardar.classList.add("detallesEnlace_botonV1")
                botonGuardar.classList.add("ocultoInicial")
                botonGuardar.setAttribute("boton", "guardarCambios")
                botonGuardar.addEventListener("click", () => { casaVitini.view.guardarCambios() })
                botonGuardar.textContent = "Guardar cambios"
                contenedorBotones.appendChild(botonGuardar)
                const botonCancelarCambios = document.createElement("div")
                botonCancelarCambios.classList.add("detallesEnlace_botonV1")
                botonCancelarCambios.classList.add("ocultoInicial")
                botonCancelarCambios.setAttribute("boton", "cancelarCambios")
                botonCancelarCambios.textContent = "Cancelar cambios"
                botonCancelarCambios.addEventListener("click", () => { casaVitini.view.cancelarCambios() })
                contenedorBotones.appendChild(botonCancelarCambios)
                const botonEliminarEnlace = document.createElement("div")
                botonEliminarEnlace.classList.add("detallesEnlace_botonV1")
                botonEliminarEnlace.setAttribute("boton", "eliminarEnlace")
                botonEliminarEnlace.addEventListener("click", () => { casaVitini.view.eliminarEnlace.UI() })
                botonEliminarEnlace.textContent = "Eliminar enlace"
                contenedorBotones.appendChild(botonEliminarEnlace)
                espacioDetallesEnlace.appendChild(contenedorBotones)
            }

        }
    },
    eliminarEnlace: {
        UI: async function () {
            const advertenciaInmersivaIU = document.createElement("div")
            advertenciaInmersivaIU.setAttribute("class", "advertenciaInmersiva")
            advertenciaInmersivaIU.setAttribute("componente", "advertenciaInmersiva")
            const contenedorAdvertenciaInmersiva = document.createElement("div")
            contenedorAdvertenciaInmersiva.classList.add("contenedorAdvertencaiInmersiva")
            const tituloCancelarReserva = document.createElement("p")
            tituloCancelarReserva.classList.add("detallesReservaTituloCancelarReserva")
            tituloCancelarReserva.textContent = "Eliminar enlae de pago"
            contenedorAdvertenciaInmersiva.appendChild(tituloCancelarReserva)
            const bloqueBloqueoApartamentos = document.createElement("div")
            bloqueBloqueoApartamentos.classList.add("detallesReservaCancelarReservaBloqueBloqueoApartamentos")
            const tituloBloquoApartamentos = document.createElement("div")
            tituloBloquoApartamentos.classList.add("detallesReservaCancelarReservaTituloBloquoApartamentos")
            tituloBloquoApartamentos.textContent = "¿Quieres confirmar la eliminación de este enlace de pago? Sus implicaciones serán inmediatas y el enlace de acceso temporal pasará a ser obsoleto."
            bloqueBloqueoApartamentos.appendChild(tituloBloquoApartamentos)
            contenedorAdvertenciaInmersiva.appendChild(bloqueBloqueoApartamentos)
            const bloqueBotones = document.createElement("div")
            bloqueBotones.classList.add("detallesReservaCancelarReservabloqueBotones")
            const botonCancelar = document.createElement("div")
            botonCancelar.classList.add("detallesReservaCancelarBoton")
            botonCancelar.setAttribute("componente", "botonConfirmarCancelarReserva")
            botonCancelar.textContent = "Confirmar y eliminar enlace"
            botonCancelar.addEventListener("click", () => { this.confirmar() })
            bloqueBotones.appendChild(botonCancelar)
            const botonCancelarProcesoCancelacion = document.createElement("div")
            botonCancelarProcesoCancelacion.classList.add("detallesReservaCancelarBoton")
            botonCancelarProcesoCancelacion.textContent = "Cancelar la eliminacion del enlace"
            botonCancelarProcesoCancelacion.addEventListener("click", () => {
                let selectorAdvertenciaInmersiva = document.querySelectorAll("[componente=advertenciaInmersiva]")
                selectorAdvertenciaInmersiva.forEach((advertenciaInmersiva) => {
                    advertenciaInmersiva.remove()
                })
            })
            bloqueBotones.appendChild(botonCancelarProcesoCancelacion)
            contenedorAdvertenciaInmersiva.appendChild(bloqueBotones)
            advertenciaInmersivaIU.appendChild(contenedorAdvertenciaInmersiva)
            document.body.appendChild(advertenciaInmersivaIU)
        },
        confirmar: async function () {
            let comportamientoUID = document.querySelector("[comportamientoUID]").getAttribute("comportamientoUID")
            const transaccion = {
                zona: "administracion/comportamientoDePrecios/eliminarComportamiento",
                "comportamientoUID": Number(comportamientoUID)
            }
            let respuestaServidor = await casaVitini.shell.servidor(transaccion)
            if (respuestaServidor?.error) {
                let selectorAdvertenciaInmersiva = document.querySelectorAll("[componente=advertenciaInmersiva]")
                selectorAdvertenciaInmersiva.forEach((advertenciaInmersiva) => {
                    advertenciaInmersiva.remove()
                })
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                let vista = `/administracion/comportamientoDePrecios`
                let navegacion = {
                    "vista": vista,
                    "tipoOrigen": "menuNavegador"
                }
                casaVitini.shell.navegacion.controladorVista(navegacion)
            }
        }
    },
}