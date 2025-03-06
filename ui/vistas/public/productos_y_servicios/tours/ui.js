casaVitini.view = {
    start: () => {
        const botones = document.querySelectorAll("main [vista]")
        botones.forEach(b => {

            b.addEventListener("click", (e) => {
                e.preventDefault()
                e.stopPropagation()
                casaVitini.shell.navegacion.cambiarVista(e)
            })
        })
    }
}