casaVitini.view = {
    start: function () {

        const html = document.querySelector("html")
        html.style.height = "100%"
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion")

        const botones = main.querySelectorAll("a")
        botones.forEach((boton) => {
            boton.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
        })
        this.obtenerPermisosRestrictivo.arranque()
    },
    obtenerPermisosRestrictivo: {
        arranque: async function () {

            const main = document.querySelector("main")
            main.classList.add("flextJustificacion_center")
            const spinner = casaVitini.ui.componentes.spinnerSimple()
            main.appendChild(spinner)

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/usuarios/grupos/obtenerPermisosMasPermisisvosDelUsuario"
            })

            spinner.remove()
            main.classList.remove("flextJustificacion_center")

            if (respuestaServidor?.error) {
                const infoUI = document.createElement("p")
                infoUI.classList.add("flexVertical", "padding6")
                infoUI.textContent = respuestaServidor.error
                main.appendChild(infoUI)
                return
            }
            if (respuestaServidor.ok) {

                const arbolPermisos = respuestaServidor.arbolPermisos
                for (const [vistaIDV, permiso] of Object.entries(arbolPermisos)) {

                    if (permiso === "permitido") {

                        const botones = main.querySelectorAll(`[href^="${vistaIDV}"]`)
                        botones.forEach(b => {
                            if (b) {

                                b.setAttribute("permiso", "permitido")
                                b.classList.remove("ocultoInicial")
                            }
                        })
                    }
                }

                const contenedoresBotones = document.querySelectorAll("details")
                for (const cB of contenedoresBotones) {
                    const botonesActivos = cB.querySelectorAll("[permiso=permitido]")
                    if (botonesActivos.length > 0) {
                        cB.classList.remove("ocultoInicial")
                    }
                }
            }
        },
    }
}