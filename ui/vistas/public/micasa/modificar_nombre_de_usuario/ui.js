casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "/micasa")
        const botonActualizarIDX = document.querySelector("[componente=botonCambiarIDX]")
        botonActualizarIDX.addEventListener("click", () => { this.guardarCambios() })
    },
    guardarCambios: async function () {
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = "Actualizando tu VitiniID..."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje,
            botonCancelar: "ocultar"
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
        const nuevoIDX = document.querySelector("[campo=nuevoIDX]")
        const datosParaActualizar = {
            zona: "miCasa/actualizarIDX",
            nuevoIDX: nuevoIDX.value
        }
        const respuestaServidor = await casaVitini.shell.servidor(datosParaActualizar)
        const pantallaDeCargaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!pantallaDeCargaRenderizada) { return }
        pantallaDeCargaRenderizada.remove()
        if (respuestaServidor?.error) {
            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            nuevoIDX.value = null
            casaVitini.shell.controladoresUI.controladorEstadoIDX()
        }
    },
}