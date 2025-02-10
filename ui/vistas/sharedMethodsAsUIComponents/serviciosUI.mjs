
export const serviciosUI = {
    serviciosUI: {
        contenedor_gruposDeOpciones: function() {
            const contenedor = document.createElement("div")
            contenedor.setAttribute("area", "grupoOpciones")
            contenedor.classList.add(
                "flexVertical",
                "gap6",
            )
            return contenedor
        },
        grupoDeOpciones:function()  {
            const c = document.createElement("details")
            c.setAttribute("componente", "grupo")
            c.classList.add(
                "flexVertical",
                "padding6",
                "borderGrey1",
                "borderRadius14"
            )
            const titulo = document.createElement("summary")
            titulo.setAttribute("data", "titulo")
            titulo.classList.add(
                "padding10",
                "negrita",
                // "textoCentrado"
            )
            titulo.textContent = "Titulo o definición del grupo"
            c.appendChild(titulo)
            const opcionesDelContenedor = document.createElement("div")
            opcionesDelContenedor.setAttribute("area", "seleccion")
            opcionesDelContenedor.setAttribute("areaIDV", "areaIDV_destino")
            opcionesDelContenedor.classList.add(
                "flexVertical",
                "gap6",
                "padding6",
                "borderGrey1",
                "borderRadius14",
                "ratonDefault"
            )
            // c.appendChild(opcionesDelContenedor)
            return c
        },
        opcionUI: function()  {
            const contenedorGlobal = document.createElement("div")
            contenedorGlobal.classList.add("contenedorGlobal", "contenedorGlobal_hover", "padding4")
            contenedorGlobal.setAttribute("selector", "opcion")
            contenedorGlobal.setAttribute("opcionIDV", "opcionIDV_destino")
            //  contenedorGlobal.addEventListener("click", (e) => {
            // const botonesGrupo = e.target.closest("[area=seleccion]").querySelectorAll("[selector=opcion]")
            // botonesGrupo.forEach((b) => {
            //     b.removeAttribute("estado")
            //     const indicadorEsfera = b.querySelector("[componente=indicadorSelecion]")
            //     indicadorEsfera.removeAttribute("style")
            // })
            // const contenedorSelecioando = e.target.closest("[selector=opcion]")
            // contenedorSelecioando.setAttribute("estado", "activado")
            // contenedorSelecioando.querySelector("[componente=indicadorSelecion]").style.background = "blue"
            //  })
            const esferaSeleccionable = document.createElement("div")
            esferaSeleccionable.classList.add(
                "esferaSeleccionable"
            )
            contenedorGlobal.appendChild(esferaSeleccionable)
            const indicadorDeSeleccion = document.createElement("div")
            indicadorDeSeleccion.setAttribute("componente", "indicadorSelecion")
            indicadorDeSeleccion.classList.add(
                "indicadorDeSeleccion"
            )
            esferaSeleccionable.appendChild(indicadorDeSeleccion)
            const tituloConf = document.createElement("p")
            tituloConf.setAttribute("data", "opcionUI")
            tituloConf.classList.add(
                "padding6",
            )
            tituloConf.textContent = "Nombre de la opcion"
            contenedorGlobal.appendChild(tituloConf)
            return contenedorGlobal
        },
        controladorSeleccion: async function (e) {
            const opcionPulsada = e.target.closest("[selector=opcion]")
            const confGrupo = JSON.parse(e.target.closest("[conf]").getAttribute("conf"))
            const confSelNumero = confGrupo.confSelNumero
            const estadoActual = opcionPulsada.getAttribute("estado")
            const selectorGrupo = e.target.closest("[componente=grupo]")
            const opcionesDelGrupo = selectorGrupo.querySelectorAll("[selector=opcion]")
            if (confSelNumero.includes("maximoUnaOpcion")) {
                opcionesDelGrupo.forEach(opcion => {
                    opcion.removeAttribute("estado")
                    const indicadorEsfera = opcion.querySelector("[componente=indicadorSelecion]")
                    indicadorEsfera.removeAttribute("style")
                })
            }
            if (estadoActual === "activado") {
                opcionPulsada.removeAttribute("estado")
                opcionPulsada.querySelector("[componente=indicadorSelecion]").removeAttribute("style")
            } else {
                opcionPulsada.setAttribute("estado", "activado")
                opcionPulsada.querySelector("[componente=indicadorSelecion]").style.background = "blue"
            }
            const areaGrupoOpciones = e.target.closest("[area=grupoOpciones]")
            await this.controladorEstadoGrupos(areaGrupoOpciones)
        },
        controladorEstadoGrupos: async function(areaGrupoOpciones)  {
            const gruposDelServicio = areaGrupoOpciones.querySelectorAll("[componente=grupo]")
            let interruptorRevisarGrupos = null
            const servicioUI = areaGrupoOpciones.closest("[servicioUID]")
            const iconoGlobalServicio = servicioUI.querySelector("[indicador=global]")
            gruposDelServicio.forEach(grupo => {
                const configuracionDelGrupo = JSON.parse(grupo.getAttribute("conf"))
                const opcionesDelGrupo = grupo.querySelectorAll("[selector=opcion]")
                for (const o of opcionesDelGrupo) {
                    const estadoOpcionObligatoria = o.getAttribute("estado")
                    if (estadoOpcionObligatoria === "activado") {
                        interruptorRevisarGrupos = "activar"
                        continue
                    }
                }
            })
            if (interruptorRevisarGrupos === "activar") {
                gruposDelServicio.forEach(grupo => {
                    let estadoGrupoObligatorio = null
                    const configuracionDelGrupo = JSON.parse(grupo.getAttribute("conf"))
                    const confSelObligatoria = configuracionDelGrupo.confSelObligatoria
                    if (confSelObligatoria.includes("unaObligatoria")) {
                        const opcionesDelGrupo = grupo.querySelectorAll("[selector=opcion]")
                        for (const o of opcionesDelGrupo) {
                            const estadoOpcionObligatoria = o.getAttribute("estado")
                            if (estadoOpcionObligatoria === "activado") {
                                estadoGrupoObligatorio = "activar"
                                continue
                            }
                        }
                        if (estadoGrupoObligatorio === "activar") {
                            grupo.removeAttribute("style")
                            grupo.setAttribute("estadoGrupo", "sel")
                        } else {
                            grupo.style.background = "red"
                            grupo.removeAttribute("estadoGrupo")
                        }
                    }
                })
                // Si todas las opciones de un grupo estan seleccionadas, se considera el grupo completamtne selecionado
                let estadoSelServicio = "sel"
                for (const grupo of gruposDelServicio) {
                    const configuracionDelGrupo = JSON.parse(grupo.getAttribute("conf"))
                    const confSelObligatoria = configuracionDelGrupo.confSelObligatoria
                    if (confSelObligatoria.includes("unaObligatoria")) {
                        const estadoGrupoObligatorio = grupo.getAttribute("estadoGrupo")
                        if (estadoGrupoObligatorio !== "sel") {
                            estadoSelServicio = "desactivado"
                            break
                        }
                    }
                }
                if (estadoSelServicio === "sel") {
                    servicioUI.setAttribute("estadoServicio", "selCompleta")
                    iconoGlobalServicio.style.background = "green"
                } else {
                    iconoGlobalServicio.style.background = "orange"
                    servicioUI.removeAttribute("estadoServicio")
                }
            } else {
                gruposDelServicio.forEach(grupo => {
                    const configuracionDelGrupo = JSON.parse(grupo.getAttribute("conf"))
                    const confSelObligatoria = configuracionDelGrupo.confSelObligatoria
                    if (confSelObligatoria.includes("unaObligatoria")) {
                        grupo.removeAttribute("style")
                        grupo.removeAttribute("estadoGrupo")
                    }
                })
                servicioUI.removeAttribute("estadoServicio")
                iconoGlobalServicio.removeAttribute("style")
            }
        },
    }
}