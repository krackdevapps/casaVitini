casaVitini.view = {
    start: function () {
        this.obtenerConfiguracion()
    },
    obtenerConfiguracion: async function () {

        const main = document.querySelector("main")
        const diasCaducidadRevision = main.querySelector("[campo=diasCaducidadRevision]")
        const diasAntelacionPorReserva = main.querySelector("[campo=diasAntelacionPorReserva]")

        diasCaducidadRevision.value = "Obteniendo configuración..."
        diasCaducidadRevision.disabled = true
        diasAntelacionPorReserva.disabled = true

        diasAntelacionPorReserva.value = "Obteniendo configuración..."


        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "administracion/protocolos/alojamiento/configuracion/obtenerConfiguracion",
        })

        if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {


            const dCR = respuestaServidor?.configuracion?.diasCaducidadRevision || ""
            const dAPR = respuestaServidor?.configuracion?.diasAntelacionPorReserva || ""
            diasCaducidadRevision.value = dCR
            diasAntelacionPorReserva.value = dAPR
            diasCaducidadRevision.disabled = false
            diasAntelacionPorReserva.disabled = false


            const botonActualizar = main.querySelector("[boton=actualizar]")
            botonActualizar.addEventListener("click", () => {
                this.actualizarConfiguracion()
            })
        }
    },
    actualizarConfiguracion: async function () {

        const main = document.querySelector("main")
        const diasCaducidadRevision = main.querySelector("[campo=diasCaducidadRevision]").value
        const diasAntelacionPorReserva = main.querySelector("[campo=diasAntelacionPorReserva]").value

        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = `Actualizando configuración de los protocolos de alojamiento...`
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "administracion/protocolos/alojamiento/configuracion/actualizarConfiguracion",
            diasCaducidadRevision,
            diasAntelacionPorReserva
        })

        const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!instanciaRenderizada) { return }
        instanciaRenderizada.remove()
        if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
            casaVitini.ui.componentes.advertenciaInmersiva("Configuración actualizada")
        }

    },
}