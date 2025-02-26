casaVitini.view = {
    start: function ()  {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/clientes/nuevo")
        const selectorBotonCrearCliente = document.querySelector("[componente=botonCrearCliente]")
        selectorBotonCrearCliente.addEventListener("click", () => { this.crearCliente() })
    },
    crearCliente: async function ()  {
        const selectorCampos = document.querySelectorAll("[campo]")
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = "Creando nuevo cliente..."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
        const transaccion = {
            zona: "administracion/clientes/crearCliente"
        }
        selectorCampos.forEach((campo) => {
            const nombreCampo = campo.getAttribute("campo")
            const datosCampo = campo.value
            transaccion[nombreCampo] = datosCampo
        })
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!instanciaRenderizada) { return }
        instanciaRenderizada.remove()
        if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const nuevoUIDCliente = respuestaServidor?.nuevoUIDCliente
            const vista = `/administracion/clientes/cliente:${nuevoUIDCliente}`
            const navegacion = {
                vista: vista,
                tipoOrigen: "menuNavegador"
            }
            casaVitini.shell.navegacion.controladorVista(navegacion)
        }
    }
}