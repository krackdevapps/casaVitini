casaVitini.view = {
    start: function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/comportamiento_de_precios/comportamientoUI")
        const selector = document.querySelector("[componente=espacioComportamiento]")

        casaVitini.view.__sharedMethods__.detalleUI("crearOferta")

    },
    desplegarOpcionesOferta: function (opcionOferta) {
        const tipoOferta = opcionOferta.target.closest("[tipoOferta]").getAttribute("tipoOferta")
        const selectorZonaOferta = document.querySelectorAll("[zonaOferta]")
        selectorZonaOferta.forEach((zonaOferta) => {
            zonaOferta.classList.add("estadoInicialInvisible")
        })
        document.querySelector(`[zonaOferta=${tipoOferta}]`).classList.remove("estadoInicialInvisible")
        const selectoresBotonDeplegarOpcionesOferta = document.querySelectorAll("[tipoOferta]")
        selectoresBotonDeplegarOpcionesOferta.forEach((boton) => {
            boton.removeAttribute("style")
        })
        opcionOferta.target.closest("[tipoOferta]").style.background = "blue"
        opcionOferta.target.closest("[tipoOferta]").style.color = "white"
    },
    crearComortamientoConfirmar: async function () {
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = "Creando comportamiento de precio..."

        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
            instanciaUID: instanciaUID,
            mensaje: mensaje
        })
        const contenedorComportamiento = casaVitini.view.__sharedMethods__.constructorObjeto()

        const transaccion = {
            zona: "administracion/comportamientoDePrecios/crearComportamiento",
            ...contenedorComportamiento
        }

        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!instanciaRenderizada) { return }
        instanciaRenderizada.remove()
        if (respuestaServidor?.error) {

            if (respuestaServidor.comportamientosEnConflicto) {
                const comportamientosEnConflictoUI = casaVitini.view.__sharedMethods__.compomentesUI.comportamientosEnClonfictoUI(respuestaServidor)

                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                document.querySelector("main").appendChild(ui)
                const constructor = ui.querySelector("[componente=constructor]")
                const contenedor = ui.querySelector("[componente=contenedor]")

                const titulo = constructor.querySelector("[componente=titulo]")
                titulo.textContent = `Comportamientos de precio en conflicto`
                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                mensaje.textContent = respuestaServidor?.error

                const botonAceptar = constructor.querySelector("[boton=aceptar]")
                botonAceptar.textContent = "Aceptar y volver al comportamiento"
                botonAceptar.addEventListener("click", () => {
                    return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                })
                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                botonCancelar.remove()

                contenedor.appendChild(comportamientosEnConflictoUI)
            } else {
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.error)
            }


        }
        if (respuestaServidor?.ok) {
            const comportamientoUID = respuestaServidor?.comportamientoUID
            const vista = `/administracion/comportamiento_de_precios/comportamiento:${comportamientoUID}`
            const navegacion = {
                vista: vista,

            }
            casaVitini.shell.navegacion.controladorVista(navegacion)
        }
    },
    // apartamentosDisponibles: async function (data) {


    //     const apartamento = data.e
    //     const destino = data.destino

    //     casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
    //     apartamento.stopPropagation()
    //     const selectorMenuObsoleto = document.querySelector("[comMenu=menuVolatilApartamentoDisponibles]")

    //     if (selectorMenuObsoleto) {
    //         selectorMenuObsoleto.remove()

    //     }
    //     const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
    //     const alturaDinamica = apartamento.target.getBoundingClientRect().bottom;
    //     const horizontalDinamico = apartamento.target.getBoundingClientRect().left;
    //     const anchoDinamico = apartamento.target.getBoundingClientRect().width;
    //     document.addEventListener("click", () => { this.ocultarMenusVolatiles() })
    //     const apartamentosUI = document.createElement("div")
    //     apartamentosUI.classList.add("crearOfertaMenuVolatilAnadirApartamento")
    //     apartamentosUI.setAttribute("comMenu", "menuVolatilApartamentoDisponibles")
    //     apartamentosUI.setAttribute("componente", "menuVolatil")
    //     apartamentosUI.setAttribute("instanciaUID", instanciaUID)
    //     apartamentosUI.style.top = (alturaDinamica + 6) + "px"
    //     apartamentosUI.style.left = (horizontalDinamico) + "px"
    //     apartamentosUI.style.maxWidth = 500 + "px"
    //     apartamentosUI.textContent = "Obteniendo apartamentos..."
    //     document.querySelector("main").appendChild(apartamentosUI)
    //     const transaccion = {
    //         zona: "administracion/componentes/apartamentosDisponiblesConfigurados"
    //     }
    //     const respuestaServidor = await casaVitini.shell.servidor(transaccion)
    //     const instanciaRenderizada = document.querySelector(`[componente=menuVolatil][instanciaUID="${instanciaUID}"]`)
    //     if (!instanciaRenderizada) { return }
    //     if (respuestaServidor?.error) {
    //         instanciaRenderizada.remove()
    //         casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
    //     }
    //     if (respuestaServidor?.ok) {
    //         instanciaRenderizada.innerHTML = null
    //         const apartamentosDisponibles = respuestaServidor?.ok
    //         apartamentosDisponibles.forEach((apartamentoDisponible) => {
    //             const apartamentoIDV = apartamentoDisponible.apartamentoIDV
    //             const apartamentoUI = apartamentoDisponible.apartamentoUI
    //             const estadoUI = apartamentoDisponible.estadoUI
    //             const apartamentoDetallesUI = document.createElement("div")
    //             apartamentoDetallesUI.classList.add("crearOfertaApartamentoUI")
    //             apartamentoDetallesUI.addEventListener("click", (e) => {
    //                 this.insertarApartamento({
    //                     e,
    //                     destino: destino
    //                 })
    //             })
    //             apartamentoDetallesUI.setAttribute("apartamentoIDV", apartamentoIDV)
    //             apartamentoDetallesUI.setAttribute("apartamentoUI", apartamentoUI)
    //             apartamentoDetallesUI.setAttribute("apartamentoComoOpcion", apartamentoIDV)
    //             const apartamentoTitulo = document.createElement("p")
    //             apartamentoTitulo.classList.add("crearOfertaApartamentoTItulo")
    //             apartamentoTitulo.textContent = apartamentoUI
    //             apartamentoDetallesUI.appendChild(apartamentoTitulo)
    //             const apartamentoEstadoUI = document.createElement("p")
    //             apartamentoEstadoUI.classList.add("crearOfertaApartamentoEstado")
    //             apartamentoEstadoUI.setAttribute("estadouI", estadoUI)
    //             apartamentoEstadoUI.textContent = estadoUI
    //             apartamentoDetallesUI.appendChild(apartamentoEstadoUI)
    //             instanciaRenderizada.appendChild(apartamentoDetallesUI)
    //         })
    //         const selectorApartamentoYaRenderizado = document.querySelectorAll(`[apartamentoComoOpcion]`)
    //         if (selectorApartamentoYaRenderizado.length === 0) {
    //             const info = document.createElement("p")
    //             info.classList.add("crearApartamentoInfoSinApartamento")
    //             info.setAttribute("componente", "infoSinApartamento")
    //             info.textContent = "Todos los apartamentos disponibles están insertados en la oferta."
    //             instanciaRenderizada.appendChild(info)
    //         }
    //     }
    // },
    ocultarMenusVolatiles: function (menuVolatil) {
        let componente = menuVolatil?.target.getAttribute("componente")
        if (componente === "menuDesplegable") {

        }
        if (componente !== "menuVolatil") {
            let selectorMenusVolatiles = document.querySelectorAll("[componente=menuVolatil]")
            document.removeEventListener("click", () => { this.ocultarMenusVolatiles() })
            selectorMenusVolatiles.forEach(menuVolatil => {
                menuVolatil.remove()
            })
        }
    },
    // insertarApartamento: function (data) {
    //     const apartamento = data.e
    //     const destino = data.destino
    //     const apartamentoIDV = apartamento.target.closest("[apartamentoIDV]").getAttribute("apartamentoIDV")
    //     const apartamentoUI = apartamento.target.closest("[apartamentoIDV]").getAttribute("apartamentoUI")
    //     const detallesApartamento = {
    //         apartamentoIDV: apartamentoIDV,
    //         apartamentoUI: apartamentoUI
    //     }

    //     const opciones = {
    //         apartamentoIDV: apartamentoIDV,
    //         apartamentoUI: apartamentoUI
    //     }
    //     const descuentoDedicadoUI = casaVitini.administracion.comportamientoDePrecios.crearComportamiento.insertarOpcionesApartamento(opciones)


    //     const zonaDescuentoDedicados = document.querySelector(destino)

    //     zonaDescuentoDedicados.style.display = "grid"
    //     zonaDescuentoDedicados.appendChild(descuentoDedicadoUI)
    // },
    insertarApartamentoUI: async function (detallesApartmento) {
        let apartamentoIDV = detallesApartmento.apartamentoIDV
        let apartamentoUI = detallesApartmento.apartamentoUI
        let apartamentoSeleccionadoUI = document.createElement("div")
        apartamentoSeleccionadoUI.classList.add("crearOfertaApartamentoSeleccionadoUI")
        apartamentoSeleccionadoUI.setAttribute("apartamentoSeleccionado", apartamentoIDV)
        let tituloApartamento = document.createElement("div")
        tituloApartamento.classList.add("crearOfertaApartamentoSeleccionadoUITitulo")
        tituloApartamento.textContent = apartamentoUI
        apartamentoSeleccionadoUI.appendChild(tituloApartamento)
        let botonEliminarApartamento = document.createElement("div")
        botonEliminarApartamento.classList.add("crearOfertaBoton")
        botonEliminarApartamento.textContent = "Eliminar apartamento333"
        botonEliminarApartamento.addEventListener("click", (e) => { this.eliminarApartamenro(e) })
        apartamentoSeleccionadoUI.appendChild(botonEliminarApartamento)
        return apartamentoSeleccionadoUI
    },
    contenedorTest: function () {
        const ui = document.createElement("div")
        ui.textContent = "test contenedor"
        return ui
    },
    eliminarApartamenro: function (apartamento) {
        let apartamentoIDV = apartamento.target.parentNode.getAttribute("apartamentoSeleccionado")
        apartamento.target.parentNode.remove()
        let conteoDescuentoDedicados = document.querySelector("[componente=comportamientoSuperBloque]").querySelectorAll("[descuentoDedicadoUI]")
        if (conteoDescuentoDedicados.length === 0) {
            document.querySelector("[componente=infoDescuentoDedicados]").removeAttribute("style")
            document.querySelector("[componente=comportamientoSuperBloque]").style.display = "flex"
        }
    },
    opcionesOferta: function (opcion) {
        let opciones = opcion.target.value

        let selectorOpciones = document.querySelectorAll("[controladorDesliegue]")
        selectorOpciones.forEach((opcion) => {
            opcion.classList.add("estadoInicialInvisible")
        })

        let zonaDespliegue
        if (opciones === "totalNetoApartamentoDedicado") {
            zonaDespliegue = "descuentosDedicados"
        }
        if (opciones === "totalNetoApartmento") {
            zonaDespliegue = "descuentoGlobal"
        }
        if (opciones === "totalNetoReserva") {
            zonaDespliegue = "descuentoGlobal"
        }
        document.querySelector(`[controladorDesliegue="${zonaDespliegue}"]`)?.classList.remove("estadoInicialInvisible")
    },

}