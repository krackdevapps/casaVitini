casaVitini.viewe = {
    start: async () => {
        const marcoElastico = document.querySelector("[componente=marcoElastico]")
        marcoElastico.style.gap = "4px"
        const botones = document.querySelectorAll("[componente=botonConfiguracion]")
        botones.forEach((boton) => {
            boton.addEventListener("click", (boton) => {
                boton.preventDefault()
                const vista = boton.target.closest("[vista]").getAttribute("vista")
                const navegacion = {
                    vista: vista,
                    tipoOrigen: "menuNavegador"
                }
                casaVitini.shell.navegacion.controladorVista(navegacion)
            })
        })
    },
}