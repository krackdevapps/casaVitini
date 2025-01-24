casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/arquitectura_de_alojamiento")
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const comandoInicial = granuladoURL.directorios[granuladoURL.directorios.length - 1]
        this.portadaUI()
    },
    portadaUI: function () {
        const espacioBotonesGlobales = document.querySelector("[componente=espacioBotonesGlobales]")
        const espacioConfiguracionDelAlojamiento = document.querySelector("[componente=configuracionDelAlojamiento]")
        const contenedorBotonesPortada = document.createElement("dv")
        contenedorBotonesPortada.classList.add("confAlojamiento_contenedor")

        const infoConf = casaVitini.ui.componentes.widgetsUI.textoSimple("Desde configuración de alojamiento, construyes configuraciones de alojamiento con las entidades de alojamiento creadas.")
        infoConf.classList.add("padding14")
        contenedorBotonesPortada.appendChild(infoConf)

        const botonalojamientoUI = document.createElement("a")
        botonalojamientoUI.classList.add("botonV1BlancoIzquierda")
        botonalojamientoUI.textContent = "Configuraciones del alojamiento"
        botonalojamientoUI.setAttribute("vista", "/administracion/arquitectura_del_alojamiento/configuraciones")
        botonalojamientoUI.setAttribute("href", "/administracion/arquitectura_del_alojamiento/configuraciones")
        botonalojamientoUI.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
        contenedorBotonesPortada.appendChild(botonalojamientoUI)


        const infoEntidades = casaVitini.ui.componentes.widgetsUI.textoSimple("Desde entidades de alojamiento, creas las entidades de alojamiento, que serán los elemento con el que puedas componer configuraciones de alojamiento.")
        infoEntidades.classList.add("padding14")
        contenedorBotonesPortada.appendChild(infoEntidades)

        const botonEntidadesAlojamientoUI = document.createElement("a")
        botonEntidadesAlojamientoUI.classList.add("botonV1BlancoIzquierda")
        botonEntidadesAlojamientoUI.textContent = "Entidades de alojamiento"
        botonEntidadesAlojamientoUI.setAttribute("vista", "/administracion/arquitectura_del_alojamiento/entidades")
        botonEntidadesAlojamientoUI.setAttribute("href", "/administracion/arquitectura_del_alojamiento/entidades")
        botonEntidadesAlojamientoUI.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
        contenedorBotonesPortada.appendChild(botonEntidadesAlojamientoUI)
        espacioConfiguracionDelAlojamiento.appendChild(contenedorBotonesPortada)
    }
}