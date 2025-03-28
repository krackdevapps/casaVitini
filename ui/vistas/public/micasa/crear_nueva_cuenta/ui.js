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
        const main = document.querySelector("main")

        const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
        const contenedor = ui.querySelector("[componente=contenedor]")
        main.appendChild(ui)

        const spinner = casaVitini.ui.componentes.spinnerSimple()
        contenedor.appendChild(spinner)
        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "miCasa/crearCuentaDesdeMiCasa",
            usuarioIDX: usuarioIDX,
            mail: mail,
            claveNueva: claveNueva,
            claveConfirmada: claveConfirmada
        })

        if (!ui) { return }
        if (respuestaServidor?.error) {
            contenedor.innerHTML = null
            const errorUI = casaVitini.ui.componentes.errorUI_respuestaInmersiva({
                errorUI: respuestaServidor.error
            })
            contenedor.appendChild(errorUI)
        } else if (respuestaServidor?.ok) {
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

        botonIS.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
        contenedorBotones.appendChild(botonIS)
    }
}