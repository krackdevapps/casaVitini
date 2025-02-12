casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/configuracion")
        const marcoElastico = document.querySelector("[componente=marcoElastico]")
        marcoElastico.style.gap = "4px"

        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "administracion/configuracion/horaDeEntradaSalida/obtenerConfiguracion"
        })
        if (respuestaServidor?.error) {
            casaVitini.shell.controladoresUI.ocultarMenusVolatiles()
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const configuracionGlobal = respuestaServidor?.ok
            const horaEntradaTZ = configuracionGlobal.horaEntradaTZ
            const horaSalidaTZ = configuracionGlobal.horaSalidaTZ
            const contenedorConfiguracionGlobal = document.createElement("div")
            contenedorConfiguracionGlobal.classList.add("administracion_configuracion_contenedorConfiguracion")
            const informacion = document.createElement("div")
            informacion.classList.add("administracion_configuracion_informacion")
            informacion.textContent = "Determine la configuración global del sistema. Esta configuración se aplica a todo el sistema y a todos los usuarios. "
            contenedorConfiguracionGlobal.appendChild(informacion)

            let bloqueConfiguracion = document.createElement("div")
            bloqueConfiguracion.classList.add("administracion_configuracion_bloqueConfiguracion")
            let tituloConfiguracion = document.createElement("div")
            tituloConfiguracion.classList.add("negrita", "paddingLateral14")
            tituloConfiguracion.textContent = "Zona horaria de Casa Vitini"
            bloqueConfiguracion.appendChild(tituloConfiguracion)
            let descripcionConfiguracion = document.createElement("div")
            descripcionConfiguracion.classList.add("paddingLateral14")
            descripcionConfiguracion.textContent = "La zona horaria local se aplica sobre el reloj UTC para que pueda ver la hora y las fechas en la zona horaria.Por ejemplo, en el apartado de Situación, en la renderización de los calendarios y etc.La zona horaria debe de configurarse con la misma zona horaria de las instalaciones físicas de pernoctacion de Casa Vitini.Entonces, el sistema de Casa Vitini puede implantarse en cualquier ordenador sin importar su reloj en zona horaria local.Es fundamental que la zona horaria del sistema sea la misma que la zona horaria de las instalaciones físicas de pernoctación de Casa Vitini.El motivo de esto es que los pernoctante puedan obtener calendarios locales a la zona horaria de Casa Vitini y realizar las reservas en zona horaria local de Casa Vitini."
            bloqueConfiguracion.appendChild(descripcionConfiguracion)
            contenedorConfiguracionGlobal.appendChild(bloqueConfiguracion)

            bloqueConfiguracion = document.createElement("div")
            bloqueConfiguracion.classList.add("administracion_configuracion_bloqueConfiguracion")
            tituloConfiguracion = document.createElement("div")
            tituloConfiguracion.classList.add("negrita", "paddingLateral14")
            tituloConfiguracion.textContent = "Hora de entrada"
            bloqueConfiguracion.appendChild(tituloConfiguracion)
            descripcionConfiguracion = document.createElement("div")
            descripcionConfiguracion.classList.add("paddingLateral14")
            descripcionConfiguracion.textContent = "Hora de entrada en zona horaria.Esta es la hora de entrada en la zona horaria seleccionada.Sirve para determinar la hora de entrada de las reservas en el día de entrada"
            bloqueConfiguracion.appendChild(descripcionConfiguracion)
            let valorConfiguracion = document.createElement("input")
            valorConfiguracion.setAttribute("campo", "horaEntradaTZ")
            valorConfiguracion.setAttribute("valorInicial", horaEntradaTZ)
            valorConfiguracion.addEventListener("input", () => { this.controlCampo() })
            valorConfiguracion.classList.add("botonV1BlancoIzquierda_campo")
            valorConfiguracion.value = horaEntradaTZ
            valorConfiguracion.placeholder = "Selecciona una hora de entrada, por ejemplo 17:00"
            bloqueConfiguracion.appendChild(valorConfiguracion)
            contenedorConfiguracionGlobal.appendChild(bloqueConfiguracion)

            bloqueConfiguracion = document.createElement("div")
            bloqueConfiguracion.classList.add("administracion_configuracion_bloqueConfiguracion")
            tituloConfiguracion = document.createElement("div")
            tituloConfiguracion.classList.add("negrita", "paddingLateral14")
            tituloConfiguracion.textContent = "Hora de salida"
            bloqueConfiguracion.appendChild(tituloConfiguracion)
            descripcionConfiguracion = document.createElement("div")
            descripcionConfiguracion.classList.add("paddingLateral14")
            descripcionConfiguracion.textContent = "Hora de salida en zona horaria.Esta es la hora de salida en la zona horaria seleccionada.Sirve para determinar la hora de salida de las reservas en el día de salida "
            bloqueConfiguracion.appendChild(descripcionConfiguracion)
            valorConfiguracion = document.createElement("input")
            valorConfiguracion.setAttribute("campo", "horaSalidaTZ")
            valorConfiguracion.addEventListener("input", () => { this.controlCampo() })
            valorConfiguracion.setAttribute("valorInicial", horaSalidaTZ)
            valorConfiguracion.classList.add("botonV1BlancoIzquierda_campo")
            valorConfiguracion.value = horaSalidaTZ
            valorConfiguracion.placeholder = "Selecciona una hora de salida, por ejemplo 19:00 "
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
        const mensaje = "Actualizando hora de entrada y salida..."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
        const campos = document.querySelectorAll("[campo]")
        const transaccion = {
            zona: "administracion/configuracion/horaDeEntradaSalida/guardarConfiguracion"
        }
        campos.forEach((campo) => {
            const nombreCampo = campo.getAttribute("campo")
            const valorCampo = campo.value
            transaccion[nombreCampo] = valorCampo
        })

        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
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
    }
}