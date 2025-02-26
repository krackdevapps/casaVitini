casaVitini.view = {
    start: function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/arquitectura_de_alojamiento/entidades")
        const urlRaw = window.location.pathname;
        let url = urlRaw.toLowerCase()
        url = url.split("/")
        url = url.filter((url) => url)
        delete url[0]
        delete url[1]
        delete url[2]
        url = url.filter((url) => url)
        if (url.length === 0) {
            this.portadaUI()
        } else if (url.length === 1) {
        } else if (url.length === 2) {
        }
    },
    portadaUI: async function () {
        const espacioBotonesGlobales = document.querySelector("[componente=espacioBotonesGlobales]")
        const espacioConfiguracionDelAlojamiento = document.querySelector("[componente=configuracionDelAlojamiento]")
        const transaccion = {
            zona: "administracion/arquitectura/entidades/listarEntidadesAlojamiento"
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        if (respuestaServidor?.error) {
            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const apartamentos = respuestaServidor?.ok?.apartamentos || []
            const habitaciones = respuestaServidor?.ok?.habitaciones || []
            const camas = respuestaServidor?.ok?.camas || []

            const contenedorGlobal = document.createElement("div")
            contenedorGlobal.classList.add("confAlojamiento_entidades_contenedorGlobal")
            espacioConfiguracionDelAlojamiento.appendChild(contenedorGlobal)


            const contenedorApartamentos = document.createElement("div")
            contenedorApartamentos.classList.add("confAlojamiento_entidades_contenedor")
            contenedorGlobal.appendChild(contenedorApartamentos)


            const contenedorBotonSeccionEntidad = document.createElement("div")
            contenedorBotonSeccionEntidad.classList.add("confAlojamiento_entidades_contenedorBotones")
            contenedorApartamentos.appendChild(contenedorBotonSeccionEntidad)

            const botonAnadirApartamento = document.createElement("a")
            botonAnadirApartamento.classList.add("botonV1BlancoIzquierda")
            botonAnadirApartamento.textContent = "Crear un nuevo apartamento"
            botonAnadirApartamento.setAttribute("href", "/administracion/arquitectura_del_alojamiento/entidades/crear_entidad/tipo:apartamento")
            botonAnadirApartamento.setAttribute("vista", "/administracion/arquitectura_del_alojamiento/entidades/crear_entidad/tipo:apartamento")
            botonAnadirApartamento.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            contenedorBotonSeccionEntidad.appendChild(botonAnadirApartamento)
            const contenedorApartamentosExistentes = document.createElement("div")
            contenedorApartamentosExistentes.classList.add("confAlojamiento_entidades_contenedorEntidades")
            if (apartamentos.length === 0) {
                const infoNoApartamentoUI = document.createElement("div")
                infoNoApartamentoUI.classList.add("confAlojamiento_entidades_carteInfo")
                infoNoApartamentoUI.textContent = "No hay nigún apartamto"
                contenedorApartamentosExistentes.appendChild(infoNoApartamentoUI)
            }
            if (apartamentos.length > 0) {
                apartamentos.forEach((detalleApartamento) => {
                    const apartamentoIDV = detalleApartamento.apartamentoIDV
                    const apartamentoUI = detalleApartamento.apartamentoUI
                    const estado = detalleApartamento.estado
                    const contenedorDetalleApartamento = document.createElement("a")
                    contenedorDetalleApartamento.classList.add("confAlojamiento_entidades_contenedorDetalles")
                    contenedorDetalleApartamento.setAttribute("apartamentoIDV", apartamentoIDV)
                    contenedorDetalleApartamento.setAttribute("href", "/administracion/arquitectura_del_alojamiento/entidades/editar_entidad/apartamento:" + apartamentoIDV)
                    contenedorDetalleApartamento.setAttribute("vista", "/administracion/arquitectura_del_alojamiento/entidades/editar_entidad/apartamento:" + apartamentoIDV)
                    contenedorDetalleApartamento.addEventListener("click", (e) => { this.traductorCambioVista(e) })
                    const tituloApartamento = document.createElement("div")
                    tituloApartamento.classList.add("confAlojamiento_entidades_titulo")
                    tituloApartamento.classList.add("negrita")
                    tituloApartamento.textContent = apartamentoUI
                    contenedorDetalleApartamento.appendChild(tituloApartamento)
                    const tituloApartamentoIDV = document.createElement("div")
                    tituloApartamentoIDV.classList.add("confAlojamiento_entidades_tituloIDV")
                    tituloApartamentoIDV.textContent = apartamentoIDV
                    contenedorDetalleApartamento.appendChild(tituloApartamentoIDV)
                    contenedorApartamentosExistentes.appendChild(contenedorDetalleApartamento)
                })
                contenedorApartamentos.appendChild(contenedorApartamentosExistentes)
            }

            const contenedorHabitaciones = document.createElement("div")
            contenedorHabitaciones.classList.add("confAlojamiento_entidades_contenedor")
            const contenedorBotonSeccionHabitacion = document.createElement("div")
            contenedorBotonSeccionHabitacion.classList.add("confAlojamiento_entidades_contenedorBotones")
            const botonAnadirHabitacion = document.createElement("a")
            botonAnadirHabitacion.classList.add("botonV1BlancoIzquierda")
            botonAnadirHabitacion.textContent = "Crear una nueva habitación"
            botonAnadirHabitacion.setAttribute("href", "/administracion/arquitectura_del_alojamiento/entidades/crear_entidad/tipo:habitacion")
            botonAnadirHabitacion.setAttribute("vista", "/administracion/arquitectura_del_alojamiento/entidades/crear_entidad/tipo:habitacion")
            botonAnadirHabitacion.addEventListener("click", (e) => { this.traductorCambioVista(e) })
            contenedorBotonSeccionHabitacion.appendChild(botonAnadirHabitacion)
            contenedorHabitaciones.appendChild(contenedorBotonSeccionHabitacion)
            const contenedorHabitacionesExistentes = document.createElement("div")
            contenedorHabitacionesExistentes.classList.add("confAlojamiento_entidades_contenedorEntidades")
            if (habitaciones.length === 0) {
                const infoNoApartamentoUI = document.createElement("div")
                infoNoApartamentoUI.classList.add("confAlojamiento_entidades_carteInfo")
                infoNoApartamentoUI.textContent = "No hay ninguna habitacion construida"
                contenedorHabitacionesExistentes.appendChild(infoNoApartamentoUI)
            }
            if (habitaciones.length > 0) {
                habitaciones.forEach((detallesHabitacion) => {
                    const habitacionIDV = detallesHabitacion.habitacionIDV
                    const habitacionUI = detallesHabitacion.habitacionUI
                    const contenedorDetalleHabitacion = document.createElement("a")
                    contenedorDetalleHabitacion.classList.add("confAlojamiento_entidades_contenedorDetalles")
                    contenedorDetalleHabitacion.setAttribute("habitacionIDV", habitacionIDV)
                    contenedorDetalleHabitacion.setAttribute("href", "/administracion/arquitectura_del_alojamiento/entidades/editar_entidad/habitacion:" + habitacionIDV)
                    contenedorDetalleHabitacion.setAttribute("vista", "/administracion/arquitectura_del_alojamiento/entidades/editar_entidad/habitacion:" + habitacionIDV)
                    contenedorDetalleHabitacion.addEventListener("click", (e) => { this.traductorCambioVista(e) })
                    const tituloHabitacion = document.createElement("div")
                    tituloHabitacion.classList.add("confAlojamiento_entidades_titulo")
                    tituloHabitacion.classList.add("negrita")
                    tituloHabitacion.textContent = habitacionUI
                    contenedorDetalleHabitacion.appendChild(tituloHabitacion)
                    const titulohabitacionIDV = document.createElement("div")
                    titulohabitacionIDV.classList.add("confAlojamiento_entidades_tituloIDV")
                    titulohabitacionIDV.textContent = habitacionIDV
                    contenedorDetalleHabitacion.appendChild(titulohabitacionIDV)
                    contenedorHabitacionesExistentes.appendChild(contenedorDetalleHabitacion)
                })
                contenedorHabitaciones.appendChild(contenedorHabitacionesExistentes)
            }
            contenedorGlobal.appendChild(contenedorHabitaciones)

            const contenedorCamas = document.createElement("div")
            contenedorCamas.classList.add("confAlojamiento_entidades_contenedor")
            const contenedorBotonSeccionCamas = document.createElement("div")
            contenedorBotonSeccionCamas.classList.add("confAlojamiento_entidades_contenedorBotones")
            const botonAnadirCamas = document.createElement("a")
            botonAnadirCamas.classList.add("botonV1BlancoIzquierda")
            botonAnadirCamas.textContent = "Crear una nueva cama"
            botonAnadirCamas.setAttribute("href", "/administracion/arquitectura_del_alojamiento/entidades/crear_entidad/tipo:cama")
            botonAnadirCamas.setAttribute("vista", "/administracion/arquitectura_del_alojamiento/entidades/crear_entidad/tipo:cama")
            botonAnadirCamas.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            contenedorBotonSeccionCamas.appendChild(botonAnadirCamas)
            contenedorCamas.appendChild(contenedorBotonSeccionCamas)
            const contenedorCamasExistentes = document.createElement("div")
            contenedorCamasExistentes.classList.add("confAlojamiento_entidades_contenedorEntidades")
            if (camas.length === 0) {
                const infoNoApartamentoUI = document.createElement("div")
                infoNoApartamentoUI.classList.add("confAlojamiento_entidades_carteInfo")
                infoNoApartamentoUI.textContent = "No hay ninguna habitacion construida"
                contenedorCamasExistentes.appendChild(infoNoApartamentoUI)
            }
            if (camas.length > 0) {
                camas.forEach((detallesCama) => {
                    const camaIDV = detallesCama.camaIDV
                    const camaUI = detallesCama.camaUI
                    const contenedorDetalleCama = document.createElement("a")
                    contenedorDetalleCama.classList.add("confAlojamiento_entidades_contenedorDetalles")
                    contenedorDetalleCama.setAttribute("camaIDV", camaIDV)
                    contenedorDetalleCama.setAttribute("href", "/administracion/arquitectura_del_alojamiento/entidades/editar_entidad/cama:" + camaIDV)
                    contenedorDetalleCama.setAttribute("vista", "/administracion/arquitectura_del_alojamiento/entidades/editar_entidad/cama:" + camaIDV)
                    contenedorDetalleCama.addEventListener("click", (e) => { this.traductorCambioVista(e) })
                    const tituloCama = document.createElement("div")
                    tituloCama.classList.add("confAlojamiento_entidades_titulo")
                    tituloCama.classList.add("negrita")
                    tituloCama.textContent = camaUI
                    contenedorDetalleCama.appendChild(tituloCama)
                    const tituloCamaIDV = document.createElement("div")
                    tituloCamaIDV.classList.add("confAlojamiento_entidades_tituloIDV")
                    tituloCamaIDV.textContent = camaIDV
                    contenedorDetalleCama.appendChild(tituloCamaIDV)
                    contenedorCamasExistentes.appendChild(contenedorDetalleCama)
                })
                contenedorCamas.appendChild(contenedorCamasExistentes)
            }
            contenedorGlobal.appendChild(contenedorCamas)
        }
    },
    traductorCambioVista: function (entidad) {
        entidad.preventDefault()
        entidad.stopPropagation()
        const vista = entidad.target.closest("[vista]").getAttribute("vista")
        const entrada = {
            "vista": vista,
            "tipoOrigen": "menuNavegador"
        }
        casaVitini.shell.navegacion.controladorVista(entrada)
    },
  
}