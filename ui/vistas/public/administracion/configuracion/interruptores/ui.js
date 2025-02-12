casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/configuracion")
        const marcoElastico = document.querySelector("[componente=marcoElastico]")
        marcoElastico.style.gap = "4px"
        const transaccion = {
            zona: "administracion/configuracion/interruptores/obtenerInterruptores"
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)

        if (respuestaServidor?.error) {
            casaVitini.shell.controladoresUI.ocultarMenusVolatiles()
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const configuracionGlobal = respuestaServidor.ok
            const aceptarReservasPublicas = configuracionGlobal.aceptarReservasPublicas
            const estados = [
                {
                    estadoUI: "Activado",
                    estadoIDV: "activado"
                },
                {
                    estadoUI: "Desactivado",
                    estadoIDV: "desactivado"
                }
            ]
            const contenedorConfiguracionGlobal = document.createElement("div")
            contenedorConfiguracionGlobal.classList.add("administracion_configuracion_contenedorConfiguracion")
            const informacion = document.createElement("div")
            informacion.classList.add("padding14")
            informacion.textContent = "Los interruptores permiten activar o desactivar funciones específicas. Como, por ejemplo, permitir reservas públicas o no.Puede activar y desactivar los interruptores y tener un control más modular del sistema."
            contenedorConfiguracionGlobal.appendChild(informacion)
            bloqueConfiguracion = document.createElement("div")
            bloqueConfiguracion.classList.add("administracion_configuracion_bloqueConfiguracion")
            tituloConfiguracion = document.createElement("div")
            tituloConfiguracion.classList.add("negrita", "paddingLateral14")
            tituloConfiguracion.textContent = "Permitir reservas públicas"
            bloqueConfiguracion.appendChild(tituloConfiguracion)
            descripcionConfiguracion = document.createElement("div")
            descripcionConfiguracion.classList.add("paddingLateral14")
            descripcionConfiguracion.textContent = "Este interruptor determina si se deben permitir reservas públicas ahora mismo. Si el interruptor está activado, personas en todo el mundo podrán pre confirmar reservas desde Casa Vitini."
            bloqueConfiguracion.appendChild(descripcionConfiguracion)
            const io_aceptarReservasPublicas_UI = document.createElement("select")
            io_aceptarReservasPublicas_UI.setAttribute("interruptor", "aceptarReservasPublicas")
            io_aceptarReservasPublicas_UI.classList.add("botonV1BlancoIzquierda_campo")
            io_aceptarReservasPublicas_UI.setAttribute("valorInicial", aceptarReservasPublicas)
            io_aceptarReservasPublicas_UI.addEventListener("change", (e) => {
                const metadatos = {
                    interruptorIDV: "aceptarReservasPublicas",
                    estado: e.target.value
                }
                e.target.style.pointerEvents = "none"
                this.actualizarInterruptor(metadatos)
            })
            bloqueConfiguracion.appendChild(io_aceptarReservasPublicas_UI)
            let estadoInicial = document.createElement("option")
            estadoInicial.value = "";
            estadoInicial.disabled = true;
            if (!aceptarReservasPublicas) {
                estadoInicial.selected = true;
            }
            estadoInicial.text = "Seleccionar el estado del interruptor";
            io_aceptarReservasPublicas_UI.add(estadoInicial);
            for (const detallesDelEstado of estados) {
                const estadoIDV = detallesDelEstado.estadoIDV
                const estadoUI = detallesDelEstado.estadoUI
                const opcion = document.createElement("option");
                opcion.value = estadoIDV;
                opcion.text = estadoUI;
                if (estadoIDV === aceptarReservasPublicas) {
                    opcion.selected = true;
                }
                io_aceptarReservasPublicas_UI.add(opcion);
            }
            contenedorConfiguracionGlobal.appendChild(bloqueConfiguracion)
            marcoElastico.appendChild(contenedorConfiguracionGlobal)
        }
    },
    cancelarCambios: function () {
        const campos = document.querySelectorAll("[campo]")
        campos.forEach((campo) => {
            campo.value = campo.getAttribute("valorInicial")
        })
        const contenedorBotones = document.querySelector("[contenedor=botones]")
        contenedorBotones.removeAttribute("style")
    },
    controlCampo: function () {
        const campos = document.querySelectorAll("[campo]")
        let estadoFinal = null
        campos.forEach((campo) => {
            if (campo.value !== campo.getAttribute("valorInicial")) {
                estadoFinal = "visible"
            }
        })
        const contenedorBotones = document.querySelector("[contenedor=botones]")
        if (estadoFinal === "visible") {
            contenedorBotones.style.display = "flex"
        } else {
            contenedorBotones.removeAttribute("style")
        }
    },
    actualizarInterruptor: async function (interruptor) {
        const main = document.querySelector("main")
        const seccionUID = main.getAttribute("instanciaUID")
        const interruptorIDV = interruptor.interruptorIDV
        const estado = interruptor.estado
        const selectorListaEstadosInterruptor = main.querySelector(`[interruptor=${interruptorIDV}]`)
        const valorInicial = selectorListaEstadosInterruptor.getAttribute("valorInicial")
        const estadoSoliciado = selectorListaEstadosInterruptor.querySelector(`option[value=${estado}]`)
        let procesandoEstadoUI
        if (estado === "activado") {
            procesandoEstadoUI = "Activando..."
        }
        if (estado === "desactivado") {
            procesandoEstadoUI = "Desactivando..."
        }
        estadoSoliciado.text = procesandoEstadoUI
        const transaccion = {
            zona: "administracion/configuracion/interruptores/actualizarEstado",
            interruptorIDV: interruptorIDV,
            estado: estado
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        const seccionRenderizada = document.querySelector(`main[instanciaUID="${seccionUID}"]`)
        if (!seccionRenderizada) { return }
        selectorListaEstadosInterruptor.removeAttribute("style")
        if (!respuestaServidor) {
            let estadoInicialUI
            if (estado === "activado") {
                estadoInicialUI = "Activado"
            }
            if (estado === "desactivado") {
                estadoInicialUI = "Desactivado"
            }
            estadoSoliciado.text = estadoInicialUI
            selectorListaEstadosInterruptor.value = valorInicial
        } else if (respuestaServidor?.error) {
            let estadoInicialUI
            if (estado === "activado") {
                estadoInicialUI = "Activado"
            }
            if (estado === "desactivado") {
                estadoInicialUI = "Desactivado"
            }
            estadoSoliciado.text = estadoInicialUI
            selectorListaEstadosInterruptor.value = valorInicial
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            let estadoFinalUI
            if (estado === "activado") {
                estadoFinalUI = "Activado"
            }
            if (estado === "desactivado") {
                estadoFinalUI = "Desactivado"
            }
            estadoSoliciado.text = estadoFinalUI
            selectorListaEstadosInterruptor.setAttribute("valorInicial", estado)
        }
    }
}