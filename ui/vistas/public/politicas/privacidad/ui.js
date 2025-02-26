casaVitini.view = {
    start: async () => {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "privacidad")

        const contenedorBotones = casaVitini.componentes.privacidad.ui.contenedorSecciones()
        main.appendChild(contenedorBotones)
        const espacio = main.querySelector("[espacio=politicas]")
        const privacidad = casaVitini.componentes.privacidad.arranque()
        if (privacidad) {
            const contenedorDecision = casaVitini.componentes.privacidad.ui.contenedorDecision()
            espacio.appendChild(contenedorDecision)
        } else {
            const revocarDecision = casaVitini.componentes.privacidad.ui.revocarDecision()
            espacio.appendChild(revocarDecision)
        }
    },
}