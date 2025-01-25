casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/configuracion")
        const marcoElastico = document.querySelector("[componente=marcoElastico]")
        marcoElastico.style.gap = "4px"
        const transaccion = {
            zona: "administracion/configuracion/limitesReservaPublica/obtenerConfiguracion"
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        if (respuestaServidor?.error) {
            casaVitini.shell.controladoresUI.ocultarMenusVolatiles()
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const configuracionGlobal = respuestaServidor?.ok
            const diasMaximosReserva = configuracionGlobal.diasMaximosReserva
            const diasAntelacionReserva = configuracionGlobal.diasAntelacionReserva
            const limiteFuturoReserva = configuracionGlobal.limiteFuturoReserva
            const horaLimiteDelMismoDia = configuracionGlobal?.horaLimiteDelMismoDia || ""

            const contenedorConfiguracionGlobal = document.createElement("div")
            contenedorConfiguracionGlobal.classList.add("administracion_configuracion_contenedorConfiguracion")
            const informacion = document.createElement("div")
            informacion.classList.add("padding14")
            informacion.textContent = "Determina los límites de las reservas que pre confirman los clientes desde Casa Vitini. A diferencia de las reservas que se confirman en el panel de administración. Las reservas que preconfirman los clientes tienen unos límites. Como unos días de antelación, número de días máximos de duración o un límite futuro para aceptar reservas hasta un punto en el futuro."
            contenedorConfiguracionGlobal.appendChild(informacion)
            let bloqueConfiguracion = document.createElement("div")
            bloqueConfiguracion.classList.add("administracion_configuracion_bloqueConfiguracion")
            let tituloConfiguracion = document.createElement("div")
            tituloConfiguracion.classList.add("negrita", "padding14")
            tituloConfiguracion.textContent = "Dias de antelación"
            bloqueConfiguracion.appendChild(tituloConfiguracion)
            let descripcionConfiguracion = document.createElement("div")
            descripcionConfiguracion.classList.add("padding14")
            descripcionConfiguracion.textContent = "Determina el número de días de antelación escribiendo el número de días de antelación.Si, por ejemplo, escribes un mínimo de diez días de antelación, se aceptarán reservas a partir del día número 11 desde el día presente. El día presente cuenta como día 0. Si, por ejemplo quisieras aceptar reservas para el mismo día, entonces establece los días de antelación en 0"
            bloqueConfiguracion.appendChild(descripcionConfiguracion)
            let valorConfiguracion = document.createElement("input")
            valorConfiguracion.setAttribute("campo", "diasAntelacionReserva")
            valorConfiguracion.setAttribute("valorInicial", diasAntelacionReserva)
            valorConfiguracion.addEventListener("input", () => { this.controlCampo() })
            valorConfiguracion.classList.add("botonV1BlancoIzquierda_campo")
            valorConfiguracion.value = diasAntelacionReserva
            valorConfiguracion.placeholder = "Determina el numero de días de antelación"
            bloqueConfiguracion.appendChild(valorConfiguracion)
            const horaLimite = this.componentesUI.horaDelMismoDia(horaLimiteDelMismoDia)
            bloqueConfiguracion.appendChild(horaLimite)

            contenedorConfiguracionGlobal.appendChild(bloqueConfiguracion)
            bloqueConfiguracion = document.createElement("div")
            bloqueConfiguracion.classList.add("administracion_configuracion_bloqueConfiguracion")
            tituloConfiguracion = document.createElement("div")
            tituloConfiguracion.classList.add("negrita", "padding14")
            tituloConfiguracion.textContent = "Duración máxima de la reserva"
            bloqueConfiguracion.appendChild(tituloConfiguracion)
            descripcionConfiguracion = document.createElement("div")
            descripcionConfiguracion.classList.add("padding14")
            descripcionConfiguracion.textContent = "Determina el numero maximo de días con noche que puede tener una reserva "
            bloqueConfiguracion.appendChild(descripcionConfiguracion)
            valorConfiguracion = document.createElement("input")
            valorConfiguracion.setAttribute("campo", "diasMaximosReserva")
            valorConfiguracion.addEventListener("input", () => { this.controlCampo() })
            valorConfiguracion.setAttribute("valorInicial", diasMaximosReserva)
            valorConfiguracion.classList.add("botonV1BlancoIzquierda_campo")
            valorConfiguracion.value = diasMaximosReserva
            valorConfiguracion.placeholder = "Selecciona una hora de salida, por ejemplo 19:00 "
            bloqueConfiguracion.appendChild(valorConfiguracion)
            contenedorConfiguracionGlobal.appendChild(bloqueConfiguracion)
            bloqueConfiguracion = document.createElement("div")
            bloqueConfiguracion.classList.add("administracion_configuracion_bloqueConfiguracion")
            tituloConfiguracion = document.createElement("div")
            tituloConfiguracion.classList.add("negrita", "padding14")
            tituloConfiguracion.textContent = "Límite futuro para aceptar reservas"
            bloqueConfiguracion.appendChild(tituloConfiguracion)
            descripcionConfiguracion = document.createElement("div")
            descripcionConfiguracion.classList.add("padding14")
            descripcionConfiguracion.textContent = "Determina el número máximo de días en lo que se está dispuesto a aceptar una reserva. Por ejemplo, si no aceptas reservas más allá de un año."
            bloqueConfiguracion.appendChild(descripcionConfiguracion)
            valorConfiguracion = document.createElement("input")
            valorConfiguracion.setAttribute("campo", "limiteFuturoReserva")
            valorConfiguracion.addEventListener("input", () => { this.controlCampo() })
            valorConfiguracion.setAttribute("valorInicial", limiteFuturoReserva)
            valorConfiguracion.classList.add("botonV1BlancoIzquierda_campo")
            valorConfiguracion.value = limiteFuturoReserva
            valorConfiguracion.placeholder = "Determinal el limite futuro en numero de dias"
            bloqueConfiguracion.appendChild(valorConfiguracion)
            contenedorConfiguracionGlobal.appendChild(bloqueConfiguracion)
            marcoElastico.appendChild(contenedorConfiguracionGlobal)

            const contenedorBotones = document.createElement("div")
            contenedorBotones.setAttribute("contenedor", "botones")
            contenedorBotones.classList.add("administracion_configuracion_contenedorBotones")
            const botonGuardarCambios = document.createElement("div")
            botonGuardarCambios.classList.add("administracion_configuracion_boton")
            botonGuardarCambios.textContent = "Guardar cambios"
            botonGuardarCambios.addEventListener("click", () => { this.guardarCambios() })
            contenedorBotones.appendChild(botonGuardarCambios)
            const botonCancelarCambios = document.createElement("div")
            botonCancelarCambios.classList.add("administracion_configuracion_boton")
            botonCancelarCambios.addEventListener("click", () => { this.cancelarCambios() })
            botonCancelarCambios.textContent = "Cancelar cambios"
            contenedorBotones.appendChild(botonCancelarCambios)
            marcoElastico.appendChild(contenedorBotones)
        }
    },
    cancelarCambios: function () {
        const campos = document.querySelectorAll("[campo]")
        campos.forEach((campo) => {
            campo.value = campo.getAttribute("valorInicial")
        })
        const contenedorBotones = document.querySelector("[contenedor=botones]")
        contenedorBotones.removeAttribute("style")
    },
    controlCampo: function () {
        const campos = document.querySelectorAll("[campo]")
        let estadoFinal = null
        campos.forEach((campo) => {
            if (campo.value !== campo.getAttribute("valorInicial")) {
                estadoFinal = "visible"
            }
        })
        const contenedorBotones = document.querySelector("[contenedor=botones]")
        if (estadoFinal === "visible") {
            contenedorBotones.style.display = "flex"
        } else {
            contenedorBotones.removeAttribute("style")
        }
    },
    guardarCambios: async function () {
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = "Actualizando límites de las reservas públicas..."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
        const campos = document.querySelectorAll("[campo]")
        const transacccion = {
            zona: "administracion/configuracion/limitesReservaPublica/guardarConfiguracion"
        }
        campos.forEach((campo) => {
            const nombreCampo = campo.getAttribute("campo")
            const valorCampo = campo.value
            transacccion[nombreCampo] = String(valorCampo)
        })
        const respuestaServidor = await casaVitini.shell.servidor(transacccion)
        const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!instanciaRenderizada) { return }
        instanciaRenderizada.remove()
        if (respuestaServidor?.error) {
            this.cancelarCambios()
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const contenedorBotones = document.querySelector("[contenedor=botones]")
            contenedorBotones.removeAttribute("style")
            campos.forEach((campo) => {
                campo.setAttribute("valorInicial", campo.value)
            })
        }
    },
    componentesUI: {
        horaDelMismoDia: function (horaLimiteDelMismoDia) {
            const contenedor = document.createElement("div")
            contenedor.classList.add(
                "ocultoInicialmente",
                "flexVertical",
                "padding6",
                "gap6",
                "backgroundGrey1",
                "borderRadius20"
            )

            const descripcion = document.createElement("p")
            descripcion.classList.add(
                "padding14"
            )
            descripcion.textContent = `Cuando seleccionas 0 días de antelación, permites aceptar reservas el mismo día presente. Es necesario determinar una hora máxima para aceptar reservas el mismo día. Por ejemplo, puedes no aceptar reservas más tarde de las 11 de la mañana. Escribe la hora en formato 24 H y con los minutos. Por ejemplo, si la hora máxima para hacer una reserva en el mismo día es a las once en punto de la mañana, entonces escribe 11:00. Si es a las nueve de la mañana en punto, entonces escribe 09:00. Siempre escribe los dos dígitos tanto para la hora como para los minutos. Este campo solo es obligatorio rellenarlo cuando los días de antelación son 0, si no puedes dejarlo en blanco.`
            contenedor.appendChild(descripcion)

            const campoHora = document.createElement("input")
            campoHora.classList.add("botonV1BlancoIzquierda_campo")
            campoHora.placeholder = "Escribe la hora en formato 24H, tal que asi 00:00"
            campoHora.setAttribute("campo", "horaLimiteDelMismoDia")
            campoHora.addEventListener("input", () => { this.controlCampo() })
            campoHora.setAttribute("valorInicial", horaLimiteDelMismoDia)
            campoHora.value = horaLimiteDelMismoDia
            contenedor.appendChild(campoHora)
            return contenedor
        }

    }
}