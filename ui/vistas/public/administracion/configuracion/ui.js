casaVitini.viewe = {
    start: async () => {
        const marcoElastico = document.querySelector("[componente=marcoElastico]")
        marcoElastico.style.gap = "4px"
        const botones = document.querySelectorAll("[componente=botonConfiguracion]")
        botones.forEach((boton) => {
            boton.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
        })
    },
}