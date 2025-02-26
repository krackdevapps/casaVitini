casaVitini.view = {
    start: function () {
        const selectorCampos = document.querySelectorAll("[campo]")
        selectorCampos.forEach(campo => {
            campo.addEventListener("input", (e) => {
                const terminoBusqueda = e.target.value
                const contenedor = e.target.getAttribute("campo")
                this.listaResultadosUI({
                    terminoBusqueda,
                    contenedor
                })
            })
        })
        const botonFusion = document.querySelector("[boton=fusion]")
        botonFusion.addEventListener("click", () => {

            const clienteOrigen = document.querySelector("[contenedor=origen]").querySelector("[estado=seleccionado]")
            const clienteDestino = document.querySelector("[contenedor=destino]").querySelector("[estado=seleccionado]")

            if (!clienteOrigen) {
                const m = "Por favor, primero selecciona el cliente de ORIGEN. Para ello, busca en el campo de búsqueda del campo cliente ORIGEN y selecciona el cliente ORIGEN."
                casaVitini.ui.componentes.advertenciaInmersiva(m)
            } else if (!clienteDestino) {
                const m = "Por favor, primero selecciona el cliente de DESTINO; para ello, busca en el campo de búsqueda del campo cliente DESTINO y selecciona el cliente DESTINO."
                casaVitini.ui.componentes.advertenciaInmersiva(m)
            } else {
                this.confirmarFusion.UI()
            }
        })
    },
    listaResultadosUI: async function (data) {

        const contenedor = data.contenedor
        const terminoBusqueda = data.terminoBusqueda
        const selectorContenedor = document.querySelector(`[contenedor="${contenedor}"]`)
        const selectorContenedorListaResultados = selectorContenedor.querySelector(`[componente=listaResultados]`)

        const contenedorListaResultdos = document.createElement("div")
        contenedorListaResultdos.setAttribute("componente", "listaResultados")
        if (!selectorContenedorListaResultados) {
            selectorContenedor.appendChild(contenedorListaResultdos)
        }
        const selectorContenedorListaResultados_renderizada = selectorContenedor.querySelector(`[componente=listaResultados]`)
        selectorContenedorListaResultados_renderizada.innerHTML = null

        const campoVacio = terminoBusqueda.length
        if (campoVacio === 0) {
            clearTimeout(casaVitini.componentes.temporizador);
            selectorContenedorListaResultados_renderizada?.remove()
            return
        }

        const info = document.createElement("p")
        info.classList.add(
            "infoBuscando",
            "padding6"
        )
        info.setAttribute("componente", "info")
        info.textContent = "Buscando..."

        const selectorInfoRenderizada = selectorContenedor.querySelector("[componente=info]")
        if (!selectorInfoRenderizada) {
            selectorContenedorListaResultados_renderizada.appendChild(info)
        }

        clearTimeout(casaVitini.componentes.temporizador);
        this.contenedorEventoTemporal[contenedor] = setTimeout(() => {
            const instanciaUIDBuscador = casaVitini.utilidades.codigoFechaInstancia()
            selectorContenedorListaResultados_renderizada.setAttribute("instanciaUIDBuscador", instanciaUIDBuscador)
            this.transactor({
                terminoBusqueda,
                instanciaUIDBuscador,
            })
        }, 1500);
    },
    transactor: async function (data) {
        const terminoBusqueda = data.terminoBusqueda
        const instanciaUIDBuscador = data.instanciaUIDBuscador

        const transaccion = {
            zona: "administracion/clientes/buscar",
            tipoBusqueda: "rapido",
            buscar: terminoBusqueda
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)

        const listaBuscadorRenderizada = document.querySelector(`[instanciaUIDBuscador="${instanciaUIDBuscador}"]`)
        if (!listaBuscadorRenderizada) {
            return
        }
        if (respuestaServidor?.error) {
            return listaBuscadorRenderizada.querySelector("[componente=info]").innerHTML = respuestaServidor?.error
        }

        const resultadosClientes = respuestaServidor?.clientes
        if (resultadosClientes.length === 0) {
            return listaBuscadorRenderizada.querySelector("[componente=info]").innerHTML = "Nada encontrado"
        }
        listaBuscadorRenderizada.innerHTML = null
        resultadosClientes.forEach((clienteEncontrado) => {
            const clienteUID = clienteEncontrado.clienteUID
            const nombre = clienteEncontrado.nombre
            const primerApellido = clienteEncontrado.primerApellido
            const segundoApellido = clienteEncontrado.segundoApellido
            const pasaporte = clienteEncontrado.pasaporte
            const bloqueCliente = document.createElement("div")
            bloqueCliente.classList.add(
                "administracionReservaDetallesBuscadorRapidoBloqueCliente",
                "borderRadius12"
            )
            bloqueCliente.setAttribute("clienteUID", clienteUID)
            bloqueCliente.setAttribute("componente", "elementoResultadosBuscadorRapido")
            bloqueCliente.addEventListener("click", (e) => {

                const selectorResultadosContenedor = e.target.closest("[componente=listaResultados]").querySelectorAll("[componente=elementoResultadosBuscadorRapido]")
                selectorResultadosContenedor.forEach((resultado) => {
                    resultado.removeAttribute("estado")
                    resultado.removeAttribute("style")
                })
                const resultadoSeleccionado = e.target
                resultadoSeleccionado.setAttribute("estado", "seleccionado")
                resultadoSeleccionado.style.background = "blue"
                resultadoSeleccionado.style.color = "white"
            })

            const filaNombre = document.createElement("p")
            filaNombre.classList.add("administracionReservaDetallesBuscadorRapidoBloqueClienteFilaNombre")
            filaNombre.setAttribute("dato", "nombre")
            filaNombre.textContent = `${nombre} ${primerApellido} ${segundoApellido}`
            bloqueCliente.appendChild(filaNombre)
            const filaPasaporte = document.createElement("p")
            filaPasaporte.classList.add("administracionReservaDetallesBuscadorRapidoBloqueClienteFilaPasaporte")
            filaPasaporte.setAttribute("dato", "pasaporte")
            filaPasaporte.textContent = pasaporte
            bloqueCliente.appendChild(filaPasaporte)
            listaBuscadorRenderizada.appendChild(bloqueCliente)
        })
    },
    contenedorEventoTemporal: {},
    confirmarFusion: {
        UI: function () {
            const clienteOrigen = document.querySelector("[contenedor=origen]").querySelector("[estado=seleccionado]")
            const clienteDestino = document.querySelector("[contenedor=destino]").querySelector("[estado=seleccionado]")

            const nombreOrigen = clienteOrigen.querySelector("[dato=nombre]").textContent
            const pasaporteOrigen = clienteOrigen.querySelector("[dato=pasaporte]").textContent
            const uidOrigen = clienteOrigen.getAttribute("clienteUID")

            const nombreDestino = clienteDestino.querySelector("[dato=nombre]").textContent
            const pasaporteDestino = clienteDestino.querySelector("[dato=pasaporte]").textContent
            const uidDestino = clienteDestino.getAttribute("clienteUID")

            const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
            const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
            const contenedor = pantallaInmersiva.querySelector("[componente=contenedor]")

            const titulo = constructor.querySelector("[componente=titulo]")
            titulo.textContent = "Operacion de fusión irreversible"
            const mensaje = constructor.querySelector("[componente=mensajeUI]")
            mensaje.textContent = `Se va a fusionar como cliente ORIGEN a ${nombreOrigen} (${pasaporteOrigen}) con el cliente DESTINO ${nombreDestino} (${pasaporteDestino}). Esta operación es irreversible. El cliente ORIGEN será eliminado y sustituido por el cliente destino en todas las reservas donde esté presente el cliente ORIGEN. Una vez se haya sustituido al cliente ORIGEN por el DESTINO en las reservas, el cliente ORIGEN será eliminado del hub de clientes.`

            const contenedorFusion = document.createElement("div")
            contenedorFusion.classList.add(
                "flexVertical",
                "gap6"
            )
            contenedor.appendChild(contenedorFusion)

            const origenUI = document.createElement("div")
            origenUI.classList.add(
                "flexVertical",
                "padding12",
                "backgroundGrey1",
                "borderRadius14"
            )
            contenedorFusion.appendChild(origenUI)

            const tituloOrigenUI = document.createElement("p")
            tituloOrigenUI.textContent = "<<< ORIGEN"
            origenUI.appendChild(tituloOrigenUI)


            const nombreOrigenUI = document.createElement("p")
            nombreOrigenUI.classList.add(
                "negrita"
            )
            nombreOrigenUI.textContent = nombreOrigen
            origenUI.appendChild(nombreOrigenUI)

            const pasaporteOrigenUI = document.createElement("p")
            pasaporteOrigenUI.textContent = pasaporteOrigen
            origenUI.appendChild(pasaporteOrigenUI)

            const destinoUI = document.createElement("div")
            destinoUI.classList.add(
                "flexVertical",
                "padding12",
                "backgroundGrey1",
                "borderRadius14"
            )
            contenedorFusion.appendChild(destinoUI)

            const tituloDestinoUI = document.createElement("p")
            tituloDestinoUI.textContent = ">>> DESTINO"
            destinoUI.appendChild(tituloDestinoUI)

            const nombreDestinoUI = document.createElement("p")
            nombreDestinoUI.classList.add(
                "negrita"
            )
            nombreDestinoUI.textContent = nombreDestino
            destinoUI.appendChild(nombreDestinoUI)

            const pasaporteDestinoUI = document.createElement("p")
            pasaporteDestinoUI.textContent = pasaporteDestino
            destinoUI.appendChild(pasaporteDestinoUI)


            const botonAceptar = constructor.querySelector("[boton=aceptar]")
            botonAceptar.textContent = "Comfirmar e iniciar la fusión"
            botonAceptar.addEventListener("click", () => {
                this.confirmar({
                    clienteOrigenUID: uidOrigen,
                    clienteDestinoUID: uidDestino

                })
            })
            const botonCancelar = constructor.querySelector("[boton=cancelar]")
            botonCancelar.textContent = "Cancelar la eliminacion"

            document.querySelector("main").appendChild(pantallaInmersiva)
        },
        confirmar: async function (data) {
            const clienteOrigenUID = data.clienteOrigenUID
            const clienteDestinoUID = data.clienteDestinoUID

            const instanciaUID_main = document.querySelector("main[instanciaUID]").getAttribute("instanciaUID")
            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const metadatosPantallaCarga = {
                mensaje: "Fusionando clientes...",
                instanciaUID: instanciaUID,
            }
            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(metadatosPantallaCarga)
            const selectorPantallaDeCargaSuperpuestaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
            const datosParaActualizar = {
                zona: "administracion/clientes/fusion",
                clienteUID_origen: clienteOrigenUID,
                clienteUID_destino: clienteDestinoUID
            }
            const respuestaServidor = await casaVitini.shell.servidor(datosParaActualizar)
            selectorPantallaDeCargaSuperpuestaRenderizada?.remove()
            const instanciaUI_main_renderizada = document.querySelector(`[instanciaUID="${instanciaUID_main}"]`)
            if (!instanciaUI_main_renderizada) {
                return
            }
            if (respuestaServidor?.error) {
                casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                const m = "Se ha producido la fusion"
                instanciaUI_main_renderizada.innerHTML = null
                instanciaUI_main_renderizada.textContent = m
            }
        },
    },
}