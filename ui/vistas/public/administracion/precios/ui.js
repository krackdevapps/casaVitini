casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        main.style.wordBreak = "break-word"
        const instanciaUID = main.getAttribute("instanciaUID")
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const comandoInicial = granuladoURL.directorios[granuladoURL.directorios.length - 1]
        if (comandoInicial === "precios" && Object.keys(granuladoURL.parametros).length === 0) {
            main.setAttribute("zonaCSS", "administracion/precios")
            this.portadaUI()
        } else if (granuladoURL.parametros && comandoInicial !== "precios") {
            main.setAttribute("zonaCSS", "administracion/precios")
            const info = {
                titulo: "No existe ningún perfil de precio base con ese identificador.",
                descripcion: "Revisa el identificado porque no existe el perfil de precio que solicitas."
            }
            casaVitini.ui.componentes.mensajeSimple(info)
        } else if (granuladoURL.parametros.apartamentos) {
            main.setAttribute("zonaCSS", "administracion/precios/detalles")

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/precios/detallePrecioBaseApartamento",
                apartamentoIDV: granuladoURL.parametros.apartamentos
            })
            const seccionRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
            if (!seccionRenderizada)
                if (respuestaServidor.error) {
                    const titulo = document.querySelector(".tituloGris")
                    titulo.textContent = "No existe ningún precio con el identificador: " + granuladoURL.parametros.apartamentos
                }
            this.detallesApartamento(respuestaServidor)
        } else if (granuladoURL.parametros.impuestos) {

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/impuestos/detalleImpuesto",
                impuestoUID: Number(granuladoURL.parametros.impuestos)
            })
            const seccionRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
            if (!seccionRenderizada)
                if (respuestaServidor.error) {
                    const titulo = document.querySelector(".tituloGris")
                    titulo.textContent = "No existe ningún impuesto con el identificador: " + granuladoURL.parametros.apartamentos

                }
            this.detalleImpuesto(respuestaServidor)
        }
    },
    portadaUI: async function () {
        const selectorEspacioPreciosEImpuestos = document.querySelector("[componente=precios]")
        const transaccion = {
            zona: "administracion/precios/listaPreciosApartamentos"
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const preciosApartmentos = respuestaServidor?.ok
            const bloqueGlobalApartamentos = document.createElement("div")
            bloqueGlobalApartamentos.classList.add("preciosEImpuestosBloqueGlobal")
            const contenedorTituloYOpciones = document.createElement("div")
            contenedorTituloYOpciones.classList.add("preciosEImpuestosTituloYOpciones")
            const tituloBloque = document.createElement("p")
            tituloBloque.classList.add("preciosEImpuestosBloqueTitulo")
            tituloBloque.textContent = "Precios de los apartmentos"
            contenedorTituloYOpciones.appendChild(tituloBloque)
            bloqueGlobalApartamentos.appendChild(contenedorTituloYOpciones)
            const bloqueHorizontal = document.createElement("div")
            bloqueHorizontal.classList.add("precioEImpuestosBloqueHorizotnal")
            preciosApartmentos.forEach((detalleApartamento) => {
                const uidPrecioApartamento = detalleApartamento.uid
                const apartamentoIDV = detalleApartamento.apartamento
                const precio = detalleApartamento.precio
                const moneda = detalleApartamento.moneda
                const apartamentoUI = detalleApartamento.apartamentoUI
                const totalImpuestos = detalleApartamento.totalImpuestos
                const totalNocheBruto = detalleApartamento.totalNocheBruto
                const bloqueApartamento = document.createElement("div")
                bloqueApartamento.classList.add("flexVertical", "gap6", "padding6", "borderRadius20", "backgroundGrey1", "elementosExpandidos")

                const tituloApartamento = document.createElement("p")
                tituloApartamento.classList.add("padding16", "negrita")
                tituloApartamento.textContent = apartamentoUI
                bloqueApartamento.appendChild(tituloApartamento)
                if (precio) {

                    let bloqueDato = document.createElement("div")
                    bloqueDato.classList.add("padding14", "negrita")
                    let tituloDato = document.createElement("p")
                    tituloDato.classList.add("precioEImpuestosOpcionApartamentoTitulo")
                    tituloDato.textContent = "Total neto por noche"
                    bloqueDato.appendChild(tituloDato)
                    let datoUI = document.createElement("p")
                    datoUI.classList.add("precioEImpuestosOpcionApartamentoDato")
                    datoUI.textContent = precio
                    bloqueDato.appendChild(datoUI)
                    bloqueApartamento.appendChild(bloqueDato)

                    bloqueDato = document.createElement("div")
                    bloqueDato.classList.add("padding14", "negrita")
                    tituloDato = document.createElement("p")
                    tituloDato.classList.add("precioEImpuestosOpcionApartamentoTitulo")
                    tituloDato.textContent = "Total impuestos aplicados por noche"
                    bloqueDato.appendChild(tituloDato)
                    datoUI = document.createElement("p")
                    datoUI.classList.add("precioEImpuestosOpcionApartamentoDato")
                    datoUI.textContent = totalImpuestos
                    bloqueDato.appendChild(datoUI)
                    bloqueApartamento.appendChild(bloqueDato)

                    bloqueDato = document.createElement("div")
                    bloqueDato.classList.add("padding14", "negrita")
                    tituloDato = document.createElement("p")
                    tituloDato.classList.add("precioEImpuestosOpcionApartamentoTitulo")
                    tituloDato.textContent = "Total bruto por noche"
                    bloqueDato.appendChild(tituloDato)
                    datoUI = document.createElement("p")
                    datoUI.classList.add("precioEImpuestosOpcionApartamentoDato")
                    datoUI.textContent = totalNocheBruto
                    bloqueDato.appendChild(datoUI)
                    bloqueApartamento.appendChild(bloqueDato)
                } else {

                    let bloqueDato = document.createElement("div")
                    tituloApartamento.classList.add("padding14", "negrita")
                    datoUI = document.createElement("p")
                    datoUI.textContent = "Este apartamento tiene una configuración de apartamento, pero no tiene ningún perfil de precio creado, por lo tanto, no está disponible para reservar al ser un requisito para construir una configuración válida."
                    bloqueDato.appendChild(datoUI)
                    bloqueApartamento.appendChild(bloqueDato)
                }


                const contenedorBotones = document.createElement("div")
                contenedorBotones.classList.add("flexVertical", "gap6")
                bloqueApartamento.appendChild(contenedorBotones)

                const botonEntrarPerfil = document.createElement("a")
                botonEntrarPerfil.setAttribute("href", "/administracion/precios/apartamentos:" + apartamentoIDV)
                botonEntrarPerfil.setAttribute("vista", "/administracion/precios/apartamentos:" + apartamentoIDV)
                botonEntrarPerfil.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                botonEntrarPerfil.classList.add("botonV1BlancoIzquierda")
                botonEntrarPerfil.textContent = "Editar perfil del precio"
                contenedorBotones.appendChild(botonEntrarPerfil)


                const botonIrACalendario = document.createElement("a")
                botonIrACalendario.setAttribute("href", `/administracion/calendario/capa:comportamientos_por_apartamento/capa:precio_noche_por_apartamento/comportamientos_por_apartamento:${apartamentoIDV}/precio_noche_por_apartamento:${apartamentoIDV}`)
                botonIrACalendario.setAttribute("vista", `/administracion/calendario/capa:comportamientos_por_apartamento/capa:precio_noche_por_apartamento/comportamientos_por_apartamento:${apartamentoIDV}/precio_noche_por_apartamento:${apartamentoIDV}`)
                botonIrACalendario.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                botonIrACalendario.classList.add("botonV1BlancoIzquierda")
                botonIrACalendario.textContent = "Ver precio y oscilaciones por comportamientos de precio en el calendario"
                contenedorBotones.appendChild(botonIrACalendario)



                bloqueHorizontal.appendChild(bloqueApartamento)
            })
            bloqueGlobalApartamentos.appendChild(bloqueHorizontal)
            selectorEspacioPreciosEImpuestos.appendChild(bloqueGlobalApartamentos)
        }
    },
    gridPrecios: async function (entrada) {
    },
    detallesApartamento: async function (respuestaServidor) {
        if (respuestaServidor?.error) {
            const info = {
                titulo: "No existe ningún perfil de precio base con ese identificador.",
                descripcion: "Revisa el identificado porque no existe el perfil de precio que solicitas."
            }
            casaVitini.ui.componentes.mensajeSimple(info)
        } else if (respuestaServidor?.ok) {

            const detallesApartamento = respuestaServidor?.ok
            const apartamentoUI = detallesApartamento.apartamentoUI
            const apartamentoIDV = detallesApartamento.apartamentoIDV
            const precioNetoPorNoche = detallesApartamento.precioNetoPorNoche
            const totalImpuestos = detallesApartamento.totalImpuestos
            const totalBrutoPorNoche = detallesApartamento.totalBrutoPorNoche
            const impuestos = detallesApartamento.impuestos

            const selectorTitulo = document.querySelector("[componente=titulo]")
            selectorTitulo.textContent = "Perfil de precio del " + apartamentoUI

            const selectorEspacioPreciosEImpuestos = document.querySelector("[componente=precios]")
            const bloqueContenedorHorizontal = document.createElement("div")
            bloqueContenedorHorizontal.classList.add("flexVertical", "gap6")
            selectorEspacioPreciosEImpuestos.appendChild(bloqueContenedorHorizontal)

            const bloqueDetallesApartamento = document.createElement("div")
            bloqueDetallesApartamento.classList.add("flexVertical", "gap6")
            bloqueDetallesApartamento.setAttribute("componente", "contenedorDetallesApartamento")
            bloqueDetallesApartamento.setAttribute("apartamentoIDV", apartamentoIDV)
            bloqueContenedorHorizontal.appendChild(bloqueDetallesApartamento)


            const contenedorGlobal = () => {
                const ui = document.createElement("div")
                ui.classList.add("preciosEImpuestosDetalleApartamentoDetallesBloqueDato")
                return ui
            }

            const titulo = (titulo) => {
                const ui = document.createElement("div")
                ui.classList.add("preciosEImpuestosDetalleApartamentoDetallesTituloDato")
                ui.textContent = titulo
                return ui
            }
            const dato = (dato) => {
                const ui = document.createElement("div")
                ui.classList.add("preciosEImpuestosDetalleApartamentoDatoNumero")
                ui.textContent = dato
                return ui
            }

            const cPreccioNetoPorNoche = contenedorGlobal()
            bloqueDetallesApartamento.appendChild(cPreccioNetoPorNoche)

            const tituloPrenoNetoPorNoche = titulo("Precio neto por noche")
            cPreccioNetoPorNoche.appendChild(tituloPrenoNetoPorNoche)

            const datoPrenoNetoPorNoche = dato(precioNetoPorNoche)
            datoPrenoNetoPorNoche.setAttribute("precioNetoPorNoche", precioNetoPorNoche)
            cPreccioNetoPorNoche.appendChild(datoPrenoNetoPorNoche)


            const ctotalImpuestosPorNoche = contenedorGlobal()
            bloqueDetallesApartamento.appendChild(ctotalImpuestosPorNoche)

            const tituloTotalImpuestosPorNoche = titulo("Total impuestos por noche")
            ctotalImpuestosPorNoche.appendChild(tituloTotalImpuestosPorNoche)

            const datoTotalImpuestosPorNoche = dato(totalImpuestos)
            datoTotalImpuestosPorNoche.setAttribute("totalImpuestos", totalImpuestos)
            ctotalImpuestosPorNoche.appendChild(datoTotalImpuestosPorNoche)

            const desgloseImpuestos = document.createElement("details")
            desgloseImpuestos.classList.add("padding6", "backgroundGrey1", "borderRadius14", "sobreControlAnimacionGlobal")
            bloqueDetallesApartamento.appendChild(desgloseImpuestos)

            const tituloDesgloseImpeustos = document.createElement("summary")
            tituloDesgloseImpeustos.classList.add("padding10")
            tituloDesgloseImpeustos.textContent = "Desglose impuestos "
            desgloseImpuestos.appendChild(tituloDesgloseImpeustos)

            const bloqueDetallesImpuestos = document.createElement("div")
            bloqueDetallesImpuestos.classList.add("flexVertical", "gap6")
            bloqueDetallesImpuestos.setAttribute("componente", "bloqueDetallesImpuestos")
            desgloseImpuestos.appendChild(bloqueDetallesImpuestos)

            const tituloImpuesto = document.createElement("div")
            tituloImpuesto.classList.add("padding12")
            tituloImpuesto.textContent = "Impuestos aplicados al precio neto del apartamento. Solo se aplican los impuestos cuya entidad sea Reserva y/o Global. Todos los impuestos cuya entidad sea Reserva y/o Global se están aplicando a este precio neto. En una reserva con varios apartamentos, descuentos y comportamientos de precios, el precio puede ser diferente a este."
            bloqueDetallesImpuestos.appendChild(tituloImpuesto)

            impuestos.forEach((detalleImpuesto) => {

                const nombreImpuesto = detalleImpuesto.nombreImpuesto
                const entidadIDV = detalleImpuesto.entidadIDV
                const tipoImpositivo = detalleImpuesto.tipoImpositivo
                const tipoValorIDV = detalleImpuesto.tipoValorIDV
                const totalImpuesto = detalleImpuesto.totalImpuesto
                const impuestoUID = detalleImpuesto.impuestoUID

                const tipoValorUI = {
                    tasa: "Tasa",
                    porcentaje: "Porcentaje"
                }

                const entidadUI = {
                    reserva: "Reserva",
                    global: "Global",
                    servicios: "Servicios"
                }


                const bloqueImpuesto = document.createElement("div")
                bloqueImpuesto.classList.add("flexVertical", "backgroundGrey1", "padding6", "borderRadius10")
                bloqueImpuesto.setAttribute("impuestoUID", impuestoUID)
                bloqueDetallesImpuestos.appendChild(bloqueImpuesto)


                const tituloDato = document.createElement("div")
                tituloDato.classList.add("padding6", "negrita")
                tituloDato.textContent = nombreImpuesto
                bloqueImpuesto.appendChild(tituloDato)

                const bloqueDato = () => {
                    const ui = document.createElement("div")
                    ui.classList.add("flexVertical", "padding6")
                    return ui
                }


                const cEntidad = bloqueDato()
                bloqueImpuesto.appendChild(cEntidad)

                const tituloEntidad = document.createElement("p")
                tituloEntidad.classList.add("negrita")
                tituloEntidad.textContent = "Entidad"
                cEntidad.appendChild(tituloEntidad)

                const datoEntidad = document.createElement("p")
                datoEntidad.textContent = entidadUI[entidadIDV]
                cEntidad.appendChild(datoEntidad)

                const cTipoImpositivo = bloqueDato()
                bloqueImpuesto.appendChild(cTipoImpositivo)

                const tituloBloque = document.createElement("p")
                tituloBloque.classList.add("negrita")
                tituloBloque.textContent = "Tipo impositivo"
                cTipoImpositivo.appendChild(tituloBloque)

                const datoTipoImpositivo = document.createElement("p")
                datoTipoImpositivo.textContent = tipoImpositivo
                cTipoImpositivo.appendChild(datoTipoImpositivo)

                const cTipoValor = bloqueDato()
                bloqueImpuesto.appendChild(cTipoValor)

                const titulotTpoValor = document.createElement("p")
                titulotTpoValor.classList.add("preciosEImpuestosDetalleApartamentoDetallesTituloBloque")
                titulotTpoValor.textContent = "Tipo valor"
                cTipoValor.appendChild(titulotTpoValor)

                const datoTipoValor = document.createElement("p")
                datoTipoValor.classList.add("preciosEImpuestosDetalleApartamentoDatoNumeroImpuesto")
                datoTipoValor.textContent = tipoValorUI[tipoValorIDV]
                cTipoValor.appendChild(datoTipoValor)

                const cTotalImpuesto = bloqueDato()
                bloqueImpuesto.appendChild(cTotalImpuesto)

                const tituloTotal = document.createElement("p")
                tituloTotal.classList.add("preciosEImpuestosDetalleApartamentoDetallesTituloBloque")
                tituloTotal.textContent = "Total impuesto"
                cTotalImpuesto.appendChild(tituloTotal)

                const datoTotalImpuesto = document.createElement("p")
                datoTotalImpuesto.classList.add("preciosEImpuestosDetalleApartamentoDatoNumeroImpuesto")
                datoTotalImpuesto.setAttribute("totalImpuesto", totalImpuesto)
                datoTotalImpuesto.textContent = totalImpuesto
                cTotalImpuesto.appendChild(datoTotalImpuesto)

            })


            const cTotalBrutoPorNoche = contenedorGlobal()
            bloqueDetallesApartamento.appendChild(cTotalBrutoPorNoche)

            const tituloTotalBrutoPorNoche = titulo("Total bruto por noche")
            cTotalBrutoPorNoche.appendChild(tituloTotalBrutoPorNoche)

            const datoTotalBrutoPorNoche = dato(totalBrutoPorNoche)
            datoTotalBrutoPorNoche.setAttribute("totalBrutoPorNoche", totalBrutoPorNoche)
            cTotalBrutoPorNoche.appendChild(datoTotalBrutoPorNoche)


            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add("preciosEImpuestosDetalleApartamentoDetallesBloqueBotones")
            contenedorBotones.setAttribute("componente", "bloqueBotones")
            bloqueDetallesApartamento.appendChild(contenedorBotones)


            const botonModificar = document.createElement("div")
            botonModificar.classList.add("botonV1BlancoIzquierda")
            botonModificar.textContent = "Modificar precio"
            botonModificar.setAttribute("componente", "botonModificar")
            botonModificar.addEventListener("click", () => { this.nuevoPrecioApartamentoUI() })
            contenedorBotones.appendChild(botonModificar)

            const botonCancelar = document.createElement("div")
            botonCancelar.classList.add("botonV1BlancoIzquierda")
            botonCancelar.classList.add("elementoOcultoInicialmente")
            botonCancelar.setAttribute("componente", "botonCancelar")
            botonCancelar.addEventListener("click", () => { this.cancelarModificarPrecio() })
            botonCancelar.textContent = "Cancelar"
            contenedorBotones.appendChild(botonCancelar)

            const botonSimularPrecio = document.createElement("div")
            botonSimularPrecio.classList.add("botonV1BlancoIzquierda")
            botonSimularPrecio.classList.add("elementoOcultoInicialmente")
            botonSimularPrecio.setAttribute("componente", "botonPrevisualizar")
            botonSimularPrecio.textContent = "Simular nuevo precio"
            botonSimularPrecio.addEventListener("click", () => { this.previsualizarPrecioApartamento() })
            contenedorBotones.appendChild(botonSimularPrecio)


            const botonCancelarSimulacion = document.createElement("div")
            botonCancelarSimulacion.classList.add("botonV1BlancoIzquierda")
            botonCancelarSimulacion.classList.add("elementoOcultoInicialmente")
            botonCancelarSimulacion.setAttribute("componente", "botonCancelarSimulacion")
            botonCancelarSimulacion.textContent = "Dejar de simular precio"
            botonCancelarSimulacion.addEventListener("click", () => { this.cancelarModificarPrecio() })
            contenedorBotones.appendChild(botonCancelarSimulacion)


            const botonNuevoPrecio = document.createElement("div")
            botonNuevoPrecio.classList.add("botonV1BlancoIzquierda")
            botonNuevoPrecio.classList.add("elementoOcultoInicialmente")
            botonNuevoPrecio.textContent = "Establecer nuevo precio neto"
            botonNuevoPrecio.addEventListener("click", () => { this.establecerNuevoPrecioNetoApartamento() })
            botonNuevoPrecio.setAttribute("componente", "botonGuardar")
            contenedorBotones.appendChild(botonNuevoPrecio)

            const botonIrALaConfiguracion = document.createElement("a")
            botonIrALaConfiguracion.classList.add("botonV1BlancoIzquierda")
            botonIrALaConfiguracion.textContent = "Ir a la configuración del apartamento"
            botonIrALaConfiguracion.setAttribute("href", "/administracion/arquitectura_del_alojamiento/configuraciones/alojamiento:" + apartamentoIDV)
            botonIrALaConfiguracion.setAttribute("vista", "/administracion/arquitectura_del_alojamiento/configuraciones/alojamiento:" + apartamentoIDV)
            botonIrALaConfiguracion.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            contenedorBotones.appendChild(botonIrALaConfiguracion)
        }
    },
    nuevoPrecioApartamentoUI: function () {
        let selectorBloqueBotones = document.querySelector("[componente=bloqueBotones]")
        let selectorcontenedorDetallesApartamento = document.querySelector("[componente=contenedorDetallesApartamento]")
        document.querySelector("[componente=botonModificar]").classList.add("elementoOcultoInicialmente")

        document.querySelector("[componente=botonCancelar]").classList.remove("elementoOcultoInicialmente")
        document.querySelector("[componente=botonGuardar]").classList.remove("elementoOcultoInicialmente")
        document.querySelector("[componente=botonPrevisualizar]").classList.remove("elementoOcultoInicialmente")
        let contenedorNuevoPrecioUI = document.createElement("div")
        contenedorNuevoPrecioUI.classList.add("flexVertical", "backgroundGrey1", "borderRadius20", "padding6")
        contenedorNuevoPrecioUI.setAttribute("componente", "contenedorNuevoPrecio")
        let info = document.createElement("div")
        info.classList.add("padding14")
        info.textContent = "Escriba el nuevo precio en el campo de precio.Puedes previsualizar el precio antes de aplicarlo."
        contenedorNuevoPrecioUI.appendChild(info)
        let entradaNuevoPrecio = document.createElement("input")
        entradaNuevoPrecio.classList.add("botonV1BlancoIzquierda_campo")
        entradaNuevoPrecio.setAttribute("componente", "campoNuevoPrecio")
        entradaNuevoPrecio.placeholder = "00.00"
        contenedorNuevoPrecioUI.appendChild(entradaNuevoPrecio)
        selectorcontenedorDetallesApartamento.insertBefore(contenedorNuevoPrecioUI, selectorBloqueBotones);
    },
    previsualizarPrecioApartamento: async function () {
        const selectorCampoNuevoPrecio = document.querySelector("[componente=campoNuevoPrecio]")
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = "Calculando previsualizacion del precio..."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
        const apartamentoIDV = document.querySelector("[apartamentoIDV]").getAttribute("apartamentoIDV")
        const transaccion = {
            zona: "administracion/precios/previsualizarPrecioApartamento",
            apartamentoIDV: apartamentoIDV,
            propuestaPrecio: selectorCampoNuevoPrecio.value
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!instanciaRenderizada) { return }
        instanciaRenderizada.remove()

        if (respuestaServidor?.error) {
            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            document.querySelector("[componente=botonCancelarSimulacion]").classList.remove("elementoOcultoInicialmente")
            document.querySelector("[componente=botonPrevisualizar]").style.background = "green"
            document.querySelector("[componente=botonPrevisualizar]").style.color = "white"
            const propuestaDetalles = respuestaServidor?.ok
            const precioNetoPorNochePropuesto = propuestaDetalles.precioNetoPorNochePropuesto
            const totalImpuestos = propuestaDetalles.totalImpuestos
            const totalBrutoPorNoche = propuestaDetalles.totalBrutoPorNoche
            const selectorAreaApartamento = document.querySelector(`[apartamentoIDV="${apartamentoIDV}"]`)
            const selectorPrecioNetoPorDia = selectorAreaApartamento.querySelector("[precioNetoPorNoche]")
            selectorPrecioNetoPorDia.style.color = "green"
            selectorPrecioNetoPorDia.textContent = precioNetoPorNochePropuesto + " (Simulación)"

            const selectorTotalImpuestos = selectorAreaApartamento.querySelector("[totalImpuestos]")
            selectorTotalImpuestos.style.color = "green"
            selectorTotalImpuestos.textContent = totalImpuestos + " (Simulación)"

            const selectorTotalBrutoPorDia = selectorAreaApartamento.querySelector("[totalBrutoPorNoche]")
            selectorTotalBrutoPorDia.style.color = "green"
            selectorTotalBrutoPorDia.textContent = totalBrutoPorNoche + " (Simulación)"

            const impuestosPorPropuesta = propuestaDetalles.impuestos
            impuestosPorPropuesta.forEach((impuestoPropuesta) => {
                const impuestoUID = impuestoPropuesta.impuestoUID
                const totalImpuesto = impuestoPropuesta.totalImpuesto
                const selectorTotalImpuesto = document.querySelector(`[impuestoUID="${impuestoUID}"] [totalImpuesto]`)
                selectorTotalImpuesto.style.color = "green"
                selectorTotalImpuesto.textContent = totalImpuesto + " (Simulación)"
            })
        }
    },
    establecerNuevoPrecioNetoApartamento: async function () {
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = "Actualizando el precio del apartamento...."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
        const selectorCampoNuevoPrecio = document.querySelector("[componente=campoNuevoPrecio]")
        const selectorApartamentoIDV = document.querySelector("[apartamentoIDV]").getAttribute("apartamentoIDV")
        const transaccion = {
            zona: "administracion/precios/establecerNuevoPrecioApartamento",
            apartamentoIDV: selectorApartamentoIDV,
            nuevoPrecio: String(selectorCampoNuevoPrecio.value)
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!instanciaRenderizada) { return }
        instanciaRenderizada.remove()
        if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            this.cancelarSimulacion()
            this.cancelarModificarPrecio()
            const propuestaDetalles = respuestaServidor?.ok
            const precioNetoPorNoche = propuestaDetalles.precioNetoPorNoche
            const totalImpuestos = propuestaDetalles.totalImpuestos
            const totalBrutoPorNoche = propuestaDetalles.totalBrutoPorNoche

            console.log("respuestaServidor", respuestaServidor)

            const areaApartamento = document.querySelector(`[apartamentoIDV="${selectorApartamentoIDV}"]`)

            const selectorPrecioNetoPorNoche = areaApartamento.querySelector("[precioNetoPorNoche]")
            selectorPrecioNetoPorNoche.removeAttribute("style")
            selectorPrecioNetoPorNoche.textContent = precioNetoPorNoche

            const selectorTotalImpuestos = areaApartamento.querySelector("[totalImpuestos]")
            selectorTotalImpuestos.removeAttribute("style")
            selectorTotalImpuestos.textContent = totalImpuestos

            const selectorTotalBrutoPorNoche = areaApartamento.querySelector("[totalBrutoPorNoche]")
            selectorTotalBrutoPorNoche.removeAttribute("style")
            selectorTotalBrutoPorNoche.textContent = totalBrutoPorNoche

            const impuestosPorPropuesta = propuestaDetalles.impuestos
            impuestosPorPropuesta.forEach((impuestoPropuesta) => {
                const impuestoUID = impuestoPropuesta.impuestoUID
                const totalImpuesto = impuestoPropuesta.totalImpuesto
                const selectorTotalImpuesto = document.querySelector(`[impuestoUID="${impuestoUID}"] [totalImpuesto]`)
                selectorTotalImpuesto.textContent = totalImpuesto
            })
        }
    },
    cancelarSimulacion: function () {
        const apartamentoIDV = document.querySelector("[apartamentoIDV]").getAttribute("apartamentoIDV")
        const selectorAreaApartamento = document.querySelector(`[apartamentoIDV="${apartamentoIDV}"]`)
        const selectorPrecioNetoPorDia = selectorAreaApartamento.querySelector("[precioNetoPorNoche]")
        selectorPrecioNetoPorDia.removeAttribute("style")
        selectorPrecioNetoPorDia.textContent = selectorPrecioNetoPorDia.getAttribute("precioNetoPorNoche")

        const selectorTotalImpuestos = selectorAreaApartamento.querySelector("[totalImpuestos]")
        selectorTotalImpuestos.removeAttribute("style")
        selectorTotalImpuestos.textContent = selectorTotalImpuestos.getAttribute("totalImpuestos")

        const selectorTotalBrutoPorDia = selectorAreaApartamento.querySelector("[totalBrutoPorNoche]")
        selectorTotalBrutoPorDia.removeAttribute("style")
        selectorTotalBrutoPorDia.textContent = selectorTotalBrutoPorDia.getAttribute("totalBrutoPorNoche")

        const selectorImpuestosRenderizados = document.querySelectorAll(`[impuestoUID]`)
        selectorImpuestosRenderizados.forEach((impuestoRenderizado) => {
            const selectorTotalImpuesto = impuestoRenderizado.querySelector("[totalImpuesto]")
            selectorTotalImpuesto.removeAttribute("style")
            selectorTotalImpuesto.textContent = selectorTotalImpuesto.getAttribute(`totalImpuesto`)
        })
        document.querySelector("[componente=botonCancelarSimulacion]").classList.add("elementoOcultoInicialmente")
        document.querySelector("[componente=botonPrevisualizar]").removeAttribute("style")
        const selectorCampoPrecio = document.querySelector("[componente=campoNuevoPrecio]")
        if (selectorCampoPrecio) {
            selectorCampoPrecio.value = ""

        }
    },
    cancelarModificarPrecio: async function () {
        document.querySelector("[componente=botonCancelarSimulacion]").classList.add("elementoOcultoInicialmente")
        document.querySelector("[componente=botonPrevisualizar]").removeAttribute("style")
        document.querySelector("[componente=botonModificar]").classList.remove("elementoOcultoInicialmente")

        document.querySelector("[componente=botonCancelar]").classList.add("elementoOcultoInicialmente")
        document.querySelector("[componente=botonGuardar]").classList.add("elementoOcultoInicialmente")
        document.querySelector("[componente=botonPrevisualizar]").classList.add("elementoOcultoInicialmente")
        document.querySelector("[componente=contenedorNuevoPrecio]")?.remove()
        this.cancelarSimulacion()
    },
    eliminarPerfilPrecio: {
        UI: function () {
            const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
            const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

            const titulo = constructor.querySelector("[componente=titulo]")
            titulo.textContent = "Confirmar la eliminación del perfil del precio del apartamento"
            const mensaje = constructor.querySelector("[componente=mensajeUI]")
            mensaje.textContent = "Vas a eliminar el perfil de precio de un apartamento.Esta acción será inmediata e impedirá reservar el apartamento, ya que no se pueden hacer reservas sin un precio asignado.Si estás de acuerdo con esta operación, confirma cuando desees; de lo contrario, cancela el proceso."
            const botonAceptar = constructor.querySelector("[boton=aceptar]")
            botonAceptar.textContent = "Comfirmar la eliminacion"
            botonAceptar.addEventListener("click", () => { casaVitini.view.eliminarPerfilPrecio.confirmarEliminarPrecio() })
            const botonCancelar = constructor.querySelector("[boton=cancelar]")
            botonCancelar.textContent = "Cancelar la eliminacion"

            document.querySelector("main").appendChild(pantallaInmersiva)
        },
        confirmarEliminarPrecio: async function () {
            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const mensaje = "Eliminado el perfil de precio..."
            const datosPantallaSuperpuesta = {
                instanciaUID: instanciaUID,
                mensaje: mensaje
            }
            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
            const apartamentoIDV = document.querySelector("[apartamentoIDV]").getAttribute("apartamentoIDV")
            const transaccion = {
                zona: "administracion/precios/eliminarPerfilPrecioApartamento",
                apartamentoIDV: apartamentoIDV
            }
            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
            if (!instanciaRenderizada) { return }
            instanciaRenderizada.remove()
            if (respuestaServidor?.error) {
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                const entrada = {
                    vista: "/administracion/precios",
                    tipoOrigen: "menuNavegador"
                }
                casaVitini.shell.navegacion.controladorVista(entrada)
            }
        }
    },
}