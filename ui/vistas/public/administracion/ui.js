casaVitini.view = {
    start: () => {

        const html = document.querySelector("html")
        html.style.height = "100%"
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion")

        const menu = main.querySelector("[contenedor=menu]")
        menu.style.flex = "1"
        const botones = document.querySelectorAll("[componente=botonAdministracion]")
        botones.forEach((boton) => {
            boton.addEventListener("click", (boton) => {
                boton.preventDefault()
                const vista = boton.target.getAttribute("vista")
                const navegacion = {
                    vista: vista,
                    tipoOrigen: "menuNavegador"
                }
                casaVitini.shell.navegacion.controladorVista(navegacion)
            })
        })
    },
}