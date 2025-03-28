casaVitini.view = {
    start: () => {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion")
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