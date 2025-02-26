casaVitini.view = {
    start: function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "/micasa")
        const botonCambiarClave = document.querySelector("[componente=botonCambiarClave]")
        botonCambiarClave.addEventListener("click", () => {
            this.cambiarClaveTransactor()
        })
    },
    cambiarClaveTransactor: async () => {
        const instanciaUIDPantallaDeCarga = casaVitini.utilidades.codigoFechaInstancia()
        const instanciaUID = document.querySelector("main").getAttribute("instanciaUID")

        const mensaje = "Actualizando contraseña del usuario..."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUIDPantallaDeCarga,
            mensaje: mensaje
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)

        const claveActual = document.querySelector("[campo=claveActual]").value
        const claveNueva = document.querySelector("[campo=claveNueva]").value
        const claveConfirmada = document.querySelector("[campo=claveConfirmada]").value
        const transaccion = {
            zona: "miCasa/actualizarClaveUsuarioDesdeMicasa",
            claveActual: claveActual,
            claveNueva: claveNueva,
            claveConfirmada: claveConfirmada
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        const pantallaDeCargaRenderizada = document.querySelector(`[instanciaUID="${instanciaUIDPantallaDeCarga}"]`)
        const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!pantallaDeCargaRenderizada) { return }
        pantallaDeCargaRenderizada.remove()

        if (respuestaServidor?.error) {
            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {

            instanciaRenderizada.querySelector("[componente=formulario]").remove()
            const marcoCuenta = instanciaRenderizada.querySelector("[componente=marcoCuenta]")

            const info = document.createElement("div")
            info.classList.add("miCuenta_cambiarClave_testo")
            info.classList.add("negrita")
            info.textContent = "Se ha cambiado la clave correctamente, ya puede usarla. También se recomienda que revise las sesiones abiertas. Diríjase a Mi Casa > Sesiones"
            marcoCuenta.appendChild(info)

        }
    }

}