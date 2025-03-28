casaVitini.view = {
    start: function () {

        const main = document.querySelector("main")
        const uiSelector = document.createElement("div")
        uiSelector.classList.add("flexVertical", "padding10", "gap10", "width100")
        uiSelector.setAttribute("zona", "protocolo")
        main.appendChild(uiSelector)
        this.mostrarAlojamientos()

    },
    mostrarAlojamientos: async function () {


        const main = document.querySelector("main")
        main.classList.add("flextJustificacion_center")
        const instanciaUID = main.querySelector("[instanciaUID]")

        const spinner = casaVitini.ui.componentes.spinnerSimple()
        main.appendChild(spinner)

        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "administracion/protocolos/alojamiento/estado_de_alojamiento/obtenerEstadosDeTodosLosAlojamiento"
        })
        spinner.remove()
        main.classList.remove("flextJustificacion_center")
        main.classList.add("flexInteriorExprandido")

        const instanciaRenderizada = main.querySelector(`[instanciaUID]`)
        console.log("rt", respuestaServidor)
        if (instanciaRenderizada !== instanciaUID) { return }
        if (respuestaServidor?.error) {
            const infoUI = document.createElement("div")
            infoUI.classList.add("padding16")
            infoUI.textContent = respuestaServidor.error
            main.appendChild(infoUI)

        }
        if (respuestaServidor.ok) {
            console.log("r", respuestaServidor)
            const infoUI = document.createElement("div")
            infoUI.classList.add("padding16", "textoCentrado")
            infoUI.textContent = "Los estados de los alojamientos se basan en la última revisión disponible finalizada."
            main.appendChild(infoUI)

            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add("contenedorBotones")
            main.appendChild(contenedorBotones)



            const alojamientos = respuestaServidor.ok
            alojamientos.forEach(a => {
                const apartamentoIDV = a.apartamentoIDV
                const apartamentoUI = a.apartamentoUI
                const ultimaRevision = a?.ultimaRevision


                const ui = document.createElement("a")
                ui.classList.add("tituloContextoAdministracion")
                contenedorBotones.appendChild(ui)

                const contenedorData = document.createElement("div")
                contenedorData.classList.add("flexVertical")
                ui.appendChild(contenedorData)

                const aUI = document.createElement("p")
                aUI.classList.add("negrita")
                aUI.textContent = apartamentoUI
                ui.appendChild(aUI)


                if (!ultimaRevision) {
                    const m = document.createElement("p")
                    m.textContent = "Ninguna revision finalizada en este alojamiento"
                    contenedorData.appendChild(m)
                } else {
                    const reivsionUID = ultimaRevision.uid
                    const reposicionInventario = ultimaRevision.reposicionInventario
                    const tareas = ultimaRevision.tareas

                    console.log("reposicionInventario", reposicionInventario)
                    ui.classList.add("botonActivado")
                    ui.href = `/administracion/protocolos/registro_de_revisiones/revision:${reivsionUID}`


                    const reposicionFinal = reposicionInventario.find(r => r.color === "rojo")
                    const tareasFinal = tareas.find(r => r.color === "rojo")

                    if (reposicionFinal) {
                        ui.classList.add("fondoRojo")
                        const m = document.createElement("p")
                        m.textContent = "Este alojamiento no tiene el inventario repuesto"
                        contenedorData.appendChild(m)
                    }
                    if (tareasFinal) {
                        ui.classList.add("fondoRojo")
                        const m = document.createElement("p")
                        m.textContent = "Este alojamiento no ha pasado las tareas de limpieza"
                        contenedorData.appendChild(m)
                    }

                    if (!tareasFinal && !reposicionFinal) {
                        ui.classList.add("fondoVerde")
                        const m = document.createElement("p")
                        m.textContent = "Este alojamiento ha pasado la revisión y está preparado."
                        contenedorData.appendChild(m)
                    }
                }



            });
        }
    },

}