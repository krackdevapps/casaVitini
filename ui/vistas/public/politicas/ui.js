casaVitini.view = {
    arranque: () => {
        const opciones = document.querySelectorAll("[vista]")
        opciones.forEach((opcion) => {
            opcion.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
        })
    }
}