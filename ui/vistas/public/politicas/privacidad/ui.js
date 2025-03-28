casaVitini.view = {
    start: async () => {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "privacidad")

        const contenedorBotones = casaVitini.componentes.privacidad.ui.contenedorSecciones()
        main.appendChild(contenedorBotones)
        const espacio = main.querySelector("[espacio=politicas]")

        const cookies = casaVitini.componentes.privacidad.obtenerCookies()

        if (
            cookies.privacidad === "consentimientoAceptado" ||
            cookies.privacidad === "consentimientoRechazado"
        ) {
            const revocarDecision = casaVitini.componentes.privacidad.ui.revocarDecision()
            espacio.appendChild(revocarDecision)
        }

    },
}