casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/configuracion")
        const marcoElastico = document.querySelector("[componente=marcoElastico]")
        marcoElastico.style.gap = "4px"
        const transaccion = {
            zona: "administracion/configuracion/zonaHoraria/obtenerConfiguracion"
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        if (respuestaServidor?.error) {
            casaVitini.shell.controladoresUI.ocultarMenusVolatiles()
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const configuracionGlobal = respuestaServidor?.ok
            const zonaHoraria = configuracionGlobal.zonaHoraria
            const listaZonasHorarias = configuracionGlobal.listaZonasHorarias
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
            tituloConfiguracion.classList.add("administracion_configuracion_tituloConfiguracion")
            tituloConfiguracion.textContent = "Zona horaria de Casa Vitini"
            bloqueConfiguracion.appendChild(tituloConfiguracion)
            let descripcionConfiguracion = document.createElement("div")
            descripcionConfiguracion.classList.add("administracion_configuracion_descripcion")
            descripcionConfiguracion.textContent = "La zona horaria local se aplica sobre el reloj UTC para que pueda ver la hora y las fechas en la zona horaria.Por ejemplo, en el apartado de Situación, en la renderización de los calendarios y etc.La zona horaria debe de configurarse con la misma zona horaria de las instalaciones físicas de pernoctación de Casa Vitini.Entonces, el sistema de Casa Vitini puede implantarse en cualquier ordenador sin importar su reloj en zona horaria local.Es fundamental que la zona horaria del sistema sea la misma que la zona horaria de las instalaciones físicas de pernoctación de Casa Vitini.El motivo de esto es que los pernoctante puedan obtener calendarios locales a la zona horaria de Casa Vitini y realizar las reservas en zona horaria local de Casa Vitini."
            bloqueConfiguracion.appendChild(descripcionConfiguracion)
            const listaZonaHoraria = document.createElement("select")
            listaZonaHoraria.classList.add("botonV1BlancoIzquierda_campo")
            listaZonaHoraria.setAttribute("campo", "zonaHoraria")
            listaZonaHoraria.setAttribute("valorInicial", zonaHoraria)
            listaZonaHoraria.addEventListener("input", () => {this.controlCampo()})
            for (const zonaHorariaIterada of listaZonasHorarias) {
                const zonaHorariaUI = zonaHorariaIterada.replaceAll("/", "/").replaceAll("_", " ")
                const zonaHorariaOpcion = document.createElement("option");
                zonaHorariaOpcion.text = zonaHorariaUI;
                zonaHorariaOpcion.value = zonaHorariaIterada;
                if (zonaHoraria === zonaHorariaIterada) {
                    zonaHorariaOpcion.selected = true;
                }
                listaZonaHoraria.add(zonaHorariaOpcion);
            }
            bloqueConfiguracion.appendChild(listaZonaHoraria)
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
        const mensaje = "Actualizando zona horaria del reloj..."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
        const campos = document.querySelectorAll("[campo]")
        const transacccion = {
            zona: "administracion/configuracion/zonaHoraria/guardarConfiguracion"
        }
        campos.forEach((campo) => {
            const nombreCampo = campo.getAttribute("campo")
            const valorCampo = campo.value
            transacccion[nombreCampo] = valorCampo
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
    controlCampo: () => {
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
}