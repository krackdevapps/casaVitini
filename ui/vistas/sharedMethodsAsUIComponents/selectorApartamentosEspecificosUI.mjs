
export const selectorApartamentosEspecificosUI = {
    selectorApartamentosEspecificosUI: {
        despliegue: function (data) {
            const textoContenedorVacio = data.textoContenedorVacio || 'Añade apartamentos'
            const contenedorMetodosPersonalizados = data?.contenedorMetodosPersonalizados
            const opcionesUI = data.opcionesUI
            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const contenedor = document.createElement('div')
            contenedor.setAttribute("instanciaUID", instanciaUID)
            contenedor.setAttribute("componente", "selectorApartamentos")
            contenedor.classList.add(
                'flexVertical',
                "gap6"
            )
            const contenedorSelectorApartamentos = document.createElement('div');
            contenedorSelectorApartamentos.classList.add('crearOfertaConentenedor');
            const boton = document.createElement('p');
            boton.classList.add('crearOFertaBotonAnadirApartamento');
            boton.setAttribute('componente', 'botonAnadirApartamentoOferta');
            boton.textContent = 'Añadir apartamento';
            boton.addEventListener("click", (e) => {
                this.apartamentosDisponibles({
                    e,
                    instanciaUID,
                    contenedorMetodosPersonalizados,
                    opcionesUI
                })
            })
            contenedorSelectorApartamentos.appendChild(boton);
            const contenedorApartamentos = document.createElement('div');
            contenedorApartamentos.classList.add('crearOfertaZonaAnadirApartamento');
            contenedorApartamentos.setAttribute('componente', 'zonaAnadirApartamento');
            const info = document.createElement('p');
            info.classList.add('crearApartamentoInfoSinApartamento');
            info.setAttribute('componente', 'infoSinApartamento');
            info.textContent = textoContenedorVacio
            contenedorApartamentos.appendChild(info);
            contenedorSelectorApartamentos.appendChild(contenedorApartamentos);
            contenedor.appendChild(contenedorSelectorApartamentos);
            return contenedor
        },
        apartamentosDisponibles: async function (data) {
            const contenedorMetodosPersonalizados = data.contenedorMetodosPersonalizados
            const opcionesUI = data.opcionesUI
            const main = document.querySelector("main")
            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
            const instanciaUID_ui = ui.getAttribute("instanciaUID")
            const contenedor = ui.querySelector("[componente=contenedor]")
            main.appendChild(ui)
            const instanciaUID = data.instanciaUID
            const tipoDespliegue = data.tipoDespliegue
            const spinner = casaVitini.ui.componentes.spinner({
                mensaje: "Obteniendo apartamentos..."
            })
            contenedor.appendChild(spinner)
            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/componentes/apartamentosDisponiblesConfigurados"
            })
            const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_ui}"]`)
            if (!instanciaRenderizada) { return }
            spinner.remove()
            if (respuestaServidor?.error) {
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                contenedor.innerHTML = null
                const apartamentosDisponibles = respuestaServidor?.ok
                apartamentosDisponibles.forEach((apartamentoDisponible) => {
                    const apartamentoIDV = apartamentoDisponible.apartamentoIDV
                    const apartamentoUI = apartamentoDisponible.apartamentoUI
                    const estadoConfiguracionIDV = apartamentoDisponible.estadoConfiguracionIDV
                    let estadoUI
                    if (estadoConfiguracionIDV === "activado") {
                        estadoUI = "Activado"
                    }
                    if (estadoConfiguracionIDV === "desactivado") {
                        estadoUI = "Desactivado"
                    }
                    const apartamentoDetallesUI = document.createElement("div")
                    apartamentoDetallesUI.classList.add("flexVertical", "flexAlineacionI", "botonV1BlancoIzquierda")
                    apartamentoDetallesUI.style.alignItems = "flex-Start"
                    apartamentoDetallesUI.setAttribute("apartamentoIDV", apartamentoIDV)
                    apartamentoDetallesUI.setAttribute("apartamentoUI", apartamentoUI)
                    apartamentoDetallesUI.setAttribute("apartamentoComoOpcion", apartamentoIDV)
                    apartamentoDetallesUI.addEventListener("click", () => {
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        this.insertarApartamento({
                            instanciaUID,
                            apartamentoIDV,
                            apartamentoUI,
                            tipoDespliegue,
                            contenedorMetodosPersonalizados,
                            opcionesUI
                        })
                    })
                    const apartamentoTitulo = document.createElement("p")
                    apartamentoTitulo.classList.add("crearOfertaApartamentoTItulo")
                    apartamentoTitulo.textContent = apartamentoUI
                    apartamentoDetallesUI.appendChild(apartamentoTitulo)
                    const apartamentoEstadoUI = document.createElement("p")
                    apartamentoEstadoUI.classList.add("crearOfertaApartamentoEstado")
                    apartamentoEstadoUI.setAttribute("estadouI", estadoUI)
                    apartamentoEstadoUI.textContent = estadoUI
                    apartamentoDetallesUI.appendChild(apartamentoEstadoUI)
                    const selectorApartamentoYaRenderizado = document.querySelector(`[instanciaUID="${instanciaUID}"] [apartamentoIDV=${apartamentoIDV}]`)
                    if (!selectorApartamentoYaRenderizado) {
                        contenedor.appendChild(apartamentoDetallesUI)
                    }
                })
                const selectorApartamentoYaRenderizado = document.querySelectorAll(`[instanciaUID="${instanciaUID_ui}"] [apartamentoComoOpcion]`)
                if (selectorApartamentoYaRenderizado?.length === 0) {
                    const info = document.createElement("p")
                    info.classList.add("crearApartamentoInfoSinApartamento")
                    info.setAttribute("componente", "infoSinApartamento")
                    info.textContent = "Todos los apartamentos estan insertados en este contenedor de apartamentos"
                    contenedor.appendChild(info)
                }
                const botonCancelar = document.createElement("div")
                botonCancelar.classList.add("botonV1")
                botonCancelar.setAttribute("boton", "cancelar")
                botonCancelar.textContent = "Cerrar y volver"
                botonCancelar.addEventListener("click", () => {
                    return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                })
                contenedor.appendChild(botonCancelar)
            }
        },
        insertarApartamento: async function (data) {
            const apartamentoIDV = data.apartamentoIDV
            const apartamentoUI = data.apartamentoUI
            const instanciaUID = data.instanciaUID
            const metodoInsertarApartamento = data?.contenedorMetodosPersonalizados?.insertarApartamento || {}
            const metodoEliminarApartamento = data?.contenedorMetodosPersonalizados?.eliminarApartamento || {}
            const opcionesUI = data.opcionesUI
            if (metodoInsertarApartamento.hasOwnProperty("metodo")) {
                const metodo = metodoInsertarApartamento.metodo
                const data = metodoInsertarApartamento?.data || {}
                await metodo({
                    apartamentoIDV,
                    apartamentoUI,
                    instanciaUID,
                    opcionesUI,
                    ...data
                })
            } else {
                document.querySelector(`[instanciaUID="${instanciaUID}"] [componente=infoSinApartamento]`).style.display = "none"
                const apartamentoSeleccionadoUI = this.apartamentoUI({
                    apartamentoIDV,
                    apartamentoUI,
                    instanciaUID,
                    opcionesUI,
                    metodoEliminarApartamento
                })
                const zonaApartamentos = document.querySelector(`[instanciaUID="${instanciaUID}"] [componente=zonaAnadirApartamento]`)
                zonaApartamentos.appendChild(apartamentoSeleccionadoUI)
            }
        },
        apartamentoUI: function (data) {
            const apartamentoIDV = data.apartamentoIDV
            const apartamentoUI = data.apartamentoUI
            const metodoEliminarApartamento = data?.metodoEliminarApartamento || {}
            const opcionesUI = data.opcionesUI || {}
            const apartamentoSeleccionadoUI = document.createElement("div")
            apartamentoSeleccionadoUI.classList.add("crearOfertaApartamentoSeleccionadoUI")
            apartamentoSeleccionadoUI.setAttribute("apartamentoIDV", apartamentoIDV)
            const tituloApartamento = document.createElement("div")
            tituloApartamento.classList.add("crearOfertaApartamentoSeleccionadoUITitulo")
            tituloApartamento.textContent = apartamentoUI
            apartamentoSeleccionadoUI.appendChild(tituloApartamento)
            if (opcionesUI.hasOwnProperty("ui")) {
                const contenedorPersonalizado = document.createElement("div")
                contenedorPersonalizado.appendChild(opcionesUI.ui(opcionesUI?.data))
                apartamentoSeleccionadoUI.appendChild(contenedorPersonalizado)
            }
            const botonEliminarApartamento = document.createElement("div")
            botonEliminarApartamento.classList.add("botonV1BlancoIzquierda")
            botonEliminarApartamento.style.borderRadius = "4px"
            botonEliminarApartamento.textContent = "Eliminar apartamento"
            botonEliminarApartamento.addEventListener("click", async (e) => {
                if (metodoEliminarApartamento.hasOwnProperty("metodo")) {
                    const metodo = metodoEliminarApartamento.metodo
                    const data = metodoEliminarApartamento?.data || {}
                    const instanciaUID = data.instanciaUID
                    await metodo({
                        apartamentoIDV,
                        apartamentoUI,
                        instanciaUID,
                        opcionesUI,
                        e,
                        ...data
                    })
                } else {
                    this.eliminarApartamentoUI({
                        e
                    })
                }
            })
            apartamentoSeleccionadoUI.appendChild(botonEliminarApartamento)
            return apartamentoSeleccionadoUI
        },
        eliminarApartamentoUI: function (data) {
            const e = data.e
            const area = e.target.closest("[componente=selectorApartamentos]")
            const apartamentoRenderizado = e.target.closest("[apartamentoIDV]")
            apartamentoRenderizado.remove()
            const conteoApartamentos = area.querySelectorAll(`[apartamentoIDV]`)
            if (conteoApartamentos.length === 0) {
                area.querySelector("[componente=infoSinApartamento]").removeAttribute("style")
            }
        }
    },
}