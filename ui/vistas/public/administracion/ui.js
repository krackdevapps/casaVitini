casaVitini.view = {
    start: () => {

        const html = document.querySelector("html")
        html.style.height = "100%"
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion")

        const botones = main.querySelectorAll("a")
        botones.forEach((boton) => {
            boton.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
        })
    },
}