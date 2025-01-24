casaVitini.view = {
    start: function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "/micasa")
        const boton = document.querySelector("[componente=botonCrearNuevaCuenta]")
        boton.addEventListener("click", () => {
            this.transactor()
        })
    },
    transactor: async function () {
        const usuarioIDX = document.querySelector("[campo=usuarioIDX]").value
        const mail = document.querySelector("[campo=mail]").value
        const claveNueva = document.querySelector("[campo=claveNueva]").value
        const claveConfirmada = document.querySelector("[campo=claveConfirmada]").value
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = "Creando tu VitiniID..."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
        const transaccion = {
            zona: "miCasa/crearCuentaDesdeMiCasa",
            usuarioIDX: usuarioIDX,
            mail: mail,
            claveNueva: claveNueva,
            claveConfirmada: claveConfirmada
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        const pantallaDeCargaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!pantallaDeCargaRenderizada) { return }
        if (respuestaServidor?.error) {
            pantallaDeCargaRenderizada.remove()
            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            this.ui()

        }
    },
    ui: () => {
        const main = document.querySelector("main")
        main.innerHTML = null
        const info = document.createElement("div")
        info.classList.add(
            "margin10",
            "textoCentrado",
            "negritas"
        )
        info.textContent = "Se ha creado la cuenta correctamente. Bienvenido a Casa Vitini. Ya puedes iniciar sesión con tu VitiniID."
        main.appendChild(info)

        const contenedorBotones = document.createElement("div")
        contenedorBotones.classList.add("flexVertical")
        main.appendChild(contenedorBotones)

        const botonIS = document.createElement("a")
        botonIS.classList.add("botonV1")
        botonIS.textContent = "Iniciar sessión"
        botonIS.setAttribute("href", "/micasa")
        botonIS.setAttribute("vista", "/micasa")
        botonIS.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
        contenedorBotones.appendChild(botonIS)
    }
}