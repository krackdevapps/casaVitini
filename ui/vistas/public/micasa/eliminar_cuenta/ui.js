casaVitini.view = {
    start: function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "/micasa")
        const botonEliminarCuenta = document.querySelector("[componente=botonEliminarCuenta]")
        botonEliminarCuenta.addEventListener("click", () => { this.transactor() })
    },
    transactor: async function () {
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = "Eliminando tu VitiniID..."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje,
            botonCancelar: "ocultar"
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
        const clave = document.querySelector("[campo=clave]")?.value || ""

        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "miCasa/eliminarCuentaDesdeMiCasa",
            clave: clave
        })

        const pantallaDeCargaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        pantallaDeCargaRenderizada?.remove()
        if (respuestaServidor?.error) {
            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            await casaVitini.shell.controladoresUI.controladorEstadoIDX()
            const main = document.querySelector("main")
            main.innerHTML = null
            const informacion = "Se ha eliminado tu cuenta correctamente. Sentimos que te vayas y vuelve cuando quieras."
            const info = document.createElement("div")
            info.classList.add(
                "margin10",
                "textoCentrado",
                "negritas"
            )
            info.textContent = informacion
            main.appendChild(info)
        }
    }
}
