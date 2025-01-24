casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "/micasa")
        const espacioBotones = document.querySelector("[componente=espacioBotones]")
        const espacioSessiones = document.querySelector("[componente=espacioSessiones]")
        const botonCerrarRestoSessiones = document.createElement("div")
        botonCerrarRestoSessiones.classList.add("botonV1")
        botonCerrarRestoSessiones.textContent = "Cerrar el resto de sessiones menos esta"
        botonCerrarRestoSessiones.addEventListener("click", () => { this.cerrarTodasSessioneMenosUna() })
        espacioBotones.appendChild(botonCerrarRestoSessiones)
        const transaccion = {
            zona: "miCasa/obtenerSessionesActivasDesdeMiCasa"
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        if (respuestaServidor?.error) {
            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const sessionesActivas = respuestaServidor?.sessionesActivas

            if (sessionesActivas.length === 0) {

            } else {
                const sessionIDX = respuestaServidor?.sessionIDX
                sessionesActivas.forEach((detallesSession) => {
                    const sessionIDX_detallesSession = detallesSession.sessionIDX
                    const caducidadUTC = detallesSession.caducidadUTC
                    const tiempoRestante = detallesSession.tiempoRestante
                    const ip = detallesSession.ip
                    const userAgent = detallesSession.userAgent
                    let sessionActual_UI = "(En otro equipo)"
                    if (sessionIDX_detallesSession === sessionIDX) {
                        sessionActual_UI = "(Session actual)"
                    }
                    const contenedorSession = document.createElement("div")
                    contenedorSession.classList.add("flexVertical", "gap6", "padding10", "backgroundWhite3", "borderRadius20")
                    contenedorSession.setAttribute("componente", "contenedorSession")
                    contenedorSession.setAttribute("sessionIDX", sessionIDX_detallesSession)
                    contenedorSession.setAttribute("sessionActual", sessionIDX)
                    const contenedorSessionID = document.createElement("div")
                    contenedorSessionID.classList.add("miCasa_sessiones_contenedorBloque")
                    const sessionInfo = document.createElement("div")
                    sessionInfo.classList.add("miCasa_sessiones_texto")
                    sessionInfo.classList.add("negrita")
                    sessionInfo.textContent = "Vitini IDX " + sessionActual_UI
                    contenedorSessionID.appendChild(sessionInfo)
                    const sessionIDX_UI = document.createElement("div")
                    sessionIDX_UI.classList.add("miCasa_sessiones_texto")
                    sessionIDX_UI.textContent = sessionIDX_detallesSession
                    contenedorSessionID.appendChild(sessionIDX_UI)
                    contenedorSession.appendChild(contenedorSessionID)
                    const ipSessionUI = document.createElement("div")
                    ipSessionUI.classList.add("miCasa_sessiones_textoIP")
                    ipSessionUI.textContent = ip
                    contenedorSession.appendChild(ipSessionUI)
                    const userAgentUI = document.createElement("div")
                    userAgentUI.classList.add("miCasa_sessiones_textoIP")
                    userAgentUI.textContent = userAgent
                    contenedorSession.appendChild(userAgentUI)
                    const contenedorCaducidad = document.createElement("div")
                    contenedorCaducidad.classList.add("miCasa_sessiones_contenedorBloque")
                    const caducidadInfo = document.createElement("div")
                    caducidadInfo.classList.add("miCasa_sessiones_texto")
                    caducidadInfo.textContent = "Caducidad de la información de sesión local en hora UTC si no se produce una nueva petición:"
                    contenedorCaducidad.appendChild(caducidadInfo)
                    const caducidadESP_UI = document.createElement("div")
                    caducidadESP_UI.classList.add("miCasa_sessiones_texto")
                    caducidadESP_UI.classList.add("negrita")
                    caducidadESP_UI.textContent = caducidadUTC
                    contenedorCaducidad.appendChild(caducidadESP_UI)
                    const tiempoRestante_UI = document.createElement("div")
                    tiempoRestante_UI.classList.add("miCasa_sessiones_texto")
                    tiempoRestante_UI.classList.add("negrita")
                    tiempoRestante_UI.textContent = tiempoRestante
                    contenedorCaducidad.appendChild(tiempoRestante_UI)
                    contenedorSession.appendChild(contenedorCaducidad)
                    const botonCerrarSession = document.createElement("div")
                    botonCerrarSession.classList.add("botonV1BlancoIzquierda")
                    botonCerrarSession.addEventListener("click", (e) => { this.cerraSessionUnica(e) })
                    botonCerrarSession.textContent = "Cerrar session"
                    contenedorSession.appendChild(botonCerrarSession)
                    espacioSessiones.appendChild(contenedorSession)
                })
            }
        }
    },
    cerraSessionUnica: async function (sessions) {
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = "Cerrando la session seleccionada..."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje,
            botonCancelar: "ocultar"
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
        const sessionIDX = sessions.target.closest("[sessionIDX]")
        const transaccion = {
            zona: "miCasa/cerrarSessionSelectivamenteDesdeMiCasa",
            tipoOperacion: "cerrarUna",
            sessionIDX: sessionIDX.getAttribute("sessionIDX")
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        const pantallaDeCargaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!pantallaDeCargaRenderizada) { return }
        pantallaDeCargaRenderizada.remove()
        if (respuestaServidor?.error) {
            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const sessionActual = sessionIDX.getAttribute("sessionActual")
            const sessionIDX_ = sessionIDX.getAttribute("sessionIDX")
            sessionIDX.remove()
            if (sessionActual === sessionIDX_) {
                const navegacion = {
                    "vista": "/miCasa/sessiones",
                    "tipoOrigen": "menuNavegador"
                }
                return casaVitini.shell.navegacion.controladorVista(navegacion)
            }
        }
    },
    cerrarTodasSessioneMenosUna: async function () {
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = "Cerrando todas la sessiones menos esta..."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje,
            botonCancelar: "ocultar"
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
        const transaccion = {
            zona: "miCasa/cerrarSessionSelectivamenteDesdeMiCasa",
            tipoOperacion: "todasMenosActual",
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        const pantallaDeCargaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!pantallaDeCargaRenderizada) { return }
        pantallaDeCargaRenderizada.remove()
        if (respuestaServidor?.error) {
            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const sessionActual = document.querySelectorAll("[sessionIDX]")
            sessionActual.forEach((sessionRenderizada) => {
                const sessionIDXActual = sessionRenderizada.getAttribute("sessionActual")
                const sessionIDXBloque = sessionRenderizada.getAttribute("sessionIDX")
                if (sessionIDXActual !== sessionIDXBloque) {
                    sessionRenderizada.remove()
                }
            })
        }
    }
}