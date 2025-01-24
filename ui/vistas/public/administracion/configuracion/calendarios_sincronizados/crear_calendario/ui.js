casaVitini.view = {
    start: async function()  {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/configuracion")
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const selectorEspacioFormulario = document.querySelector("[componente=espacioFormulario_Airbnb]")
        selectorEspacioFormulario.innerHTML = null
        const formularioUI = await this.__sharedMethods__.formularioCalendario({
            modo: "crear"
        })
        formularioUI.setAttribute("instanciaUID", instanciaUID)
        selectorEspacioFormulario.appendChild(formularioUI)
        const botonCrearCalendario = document.createElement("div")
        botonCrearCalendario.classList.add("botonCrearCalendario")
        botonCrearCalendario.textContent = "Crear perfil del calenadrio sincronizado"
        botonCrearCalendario.addEventListener("click", async () => {
            const transaccion = {
                zona: "administracion/configuracion/calendariosSincronizados/airbnb/crearCalendario"
            }
            document.querySelectorAll("[campo]").forEach((campo) => {
                const nombreCampo = campo.getAttribute("campo")
                const valorCampo = campo.value
                transaccion[nombreCampo] = valorCampo
            })
            const metadatosPantallaCarga = {
                mensaje: "Creando calendario...",
                instanciaUID: instanciaUID,
            }
            document.body.style.overflow = "hidden";
            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(metadatosPantallaCarga)
            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            document.querySelectorAll(`[instanciaUID="${instanciaUID}"][pantallaSuperpuesta=pantallaCargaSuperpuesta]`).forEach((pantalla) => {
                document.body.style.removeProperty("overflow")
                pantalla.remove()
            })
            const selectorInstanciaFormularioUI = document.querySelector(`[componente=formularioUI][instanciaUID="${instanciaUID}"]`)
            if (respuestaServidor?.error) {
                if (selectorInstanciaFormularioUI) {
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.error)
                }
            }
            if (respuestaServidor?.ok) {
                if (selectorInstanciaFormularioUI) {
                    const nuevoUID = respuestaServidor.nuevoUID
                    const vista = `/administracion/configuracion/calendarios_sincronizados/calendario:${nuevoUID}`
                    const navegacion = {
                        vista: vista,

                    }
                    casaVitini.shell.navegacion.controladorVista(navegacion)
                }
            }
        })
        selectorEspacioFormulario.appendChild(botonCrearCalendario)
    }
}