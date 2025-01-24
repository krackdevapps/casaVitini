casaVitini.view = {
    arranque: async () => {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "privacidad/zonaCompartida")
        main.style.paddingLeft = "20px"
        main.style.paddingRight = "20px"


        const botones = document.querySelectorAll("[componente=boton]")
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

    }
}