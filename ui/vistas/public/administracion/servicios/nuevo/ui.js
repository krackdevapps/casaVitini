casaVitini.view = {
    start: function () {

        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "/administracion/servicios/servicioUI")

        const ui = this.__sharedMethods__.detalleUI({
            modoUI: "crear"
        })
        main.appendChild(ui)

        const contenedorBotones = document.createElement("div")
        contenedorBotones.classList.add(
            "flexVertical",
        )
        ui.appendChild(contenedorBotones)

        const botonCrearServicio = this.__sharedMethods__.botonesCrearServicio()
        contenedorBotones.appendChild(botonCrearServicio)
    },
    crearServicio: async () => {

        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const metadatosPantallaCarga = {
            mensaje: "Creando servicio...",
            instanciaUID: instanciaUID,
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(metadatosPantallaCarga)
        const transaccion = casaVitini.view.__sharedMethods__.constructorObjeto()
        transaccion.zona = "administracion/servicios/crearServicio"

        console.log("transaccion", transaccion)
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        const pantallaDeCargaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!pantallaDeCargaRenderizada) {
            return
        }
        if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const nuevoServicio = respuestaServidor?.nuevoServicioUID
            const vista = `/administracion/servicios/servicio:${nuevoServicio}`
            const navegacion = {
                vista: vista,
                tipoOrigen: "menuNavegador"
            }
            casaVitini.shell.navegacion.controladorVista(navegacion)
        }
    },
}