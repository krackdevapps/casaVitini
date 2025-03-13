
export const contenedorFinanciero = {
    contenedorFinanciero: {
        constructor: function (data) {
            //   try {
            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const destino = data.destino
            const modoUI = data.modoUI
            const contenedorFinanciero = data.contenedorFinanciero
            const global = contenedorFinanciero.desgloseFinanciero.global
            const entidades = contenedorFinanciero.desgloseFinanciero.entidades
            const contenedorOfertas = contenedorFinanciero.desgloseFinanciero.contenedorOfertas
            const impuestos = contenedorFinanciero.desgloseFinanciero.impuestos
            const totales = global.totales
            this.control({
                destino,
                modoUI
            })
            this.componentesUI.contenedor({
                destino,
                modoUI,
                instanciaUID
            })
            this.componentesUI.panelGlobal.botonesControlFlexbile({
                destino,
                modoUI,
                instanciaUID
            })
            this.componentesUI.entidades.hub({
                destino,
                entidades,
                instanciaUID,
                modoUI
            })
            this.componentesUI.ofertas.hub({
                destino,
                contenedorOfertas,
                instanciaUID
            })
            this.componentesUI.impuestos({
                destino,
                impuestos,
                instanciaUID
            })
            this.componentesUI.totalesGlobales({
                destino,
                totales,
                instanciaUID
            })
            // } catch (error) {
            //     console.error(error)
            //      throw error
            //  }
        },
        control: function (data) {
            try {
                const destino = data.destino
                const modoUI = data.modoUI
                if (!document.querySelector(destino)) {
                    throw new Error("El constructor del contenedor financiero no encuentra el elemento del destino")
                }
                if (modoUI !== "plaza" && modoUI !== "administracion" && modoUI !== "simulador") {
                    throw new Error("El constructor del contenedor financiero necesita modoUI en plaza, administracion o simulador")
                }
            } catch (error) {
                throw error
            }
        },
        componentesUI: {
            contenedor: function (data) {
                const destino = data.destino
                const modoUI = data.modoUI
                const instanciaUID = data.instanciaUID
                const selector = document.querySelector(destino).querySelector("[contenedor=financiero]")
                if (!selector) {
                    const contenedor = document.createElement("div")
                    contenedor.classList.add("componentes_ui_desloseTotales_contenedor")
                    contenedor.setAttribute("contenedor", "financiero")
                    contenedor.setAttribute("modoUI", modoUI)
                    contenedor.setAttribute("instanciaUID", instanciaUID)
                    document.querySelector(destino).appendChild(contenedor)
                } else {
                    selector.setAttribute("instanciaUID", instanciaUID)
                }
            },
            panelGlobal: {
                botonesControlFlexbile: function (data) {
                    const destino = data.destino
                    const modoUI = data.modoUI
                    const instanciaUID = data.instanciaUID
                    const selector = document.querySelector(destino).querySelector("[contenedor=financiero]")
                    const selector_contenedorBotones = selector.querySelector("[contenedor=botonesGlobalesExpansionContracccion]")
                    if (!selector_contenedorBotones) {
                        const controladorExpansionCategorias = (e) => {
                            const areaContenedorFinanciero = e.target.closest("[contenedor=financiero]")
                            const accion = e.target.getAttribute("accion")
                            const contenedoresFlexibles = areaContenedorFinanciero.querySelectorAll("details")
                            if (accion === "expandir") {
                                contenedoresFlexibles.forEach(c => c.open = true)
                            } else if (accion === "contraer") {
                                contenedoresFlexibles.forEach(c => c.open = false)
                            }
                        }
                        const contenedorBotones = document.createElement("div")
                        contenedorBotones.setAttribute("contenedor", "botonesGlobalesExpansionContracccion")
                        contenedorBotones.classList.add("gridHorizontal2C", "gap6", "borderRadius20")
                        selector.appendChild(contenedorBotones)
                        const botonExpandirTodo = document.createElement("div")
                        botonExpandirTodo.classList.add("botonV1")
                        botonExpandirTodo.style.borderRadius = "14px"
                        botonExpandirTodo.setAttribute("accion", "expandir")
                        botonExpandirTodo.addEventListener("click", controladorExpansionCategorias)
                        botonExpandirTodo.textContent = "Expandir todo"
                        contenedorBotones.appendChild(botonExpandirTodo)
                        const botonContraerTodo = document.createElement("div")
                        botonContraerTodo.classList.add("botonV1")
                        botonContraerTodo.style.borderRadius = "14px"
                        botonContraerTodo.setAttribute("accion", "contraer")
                        botonContraerTodo.addEventListener("click", controladorExpansionCategorias)
                        botonContraerTodo.textContent = "Contraer todo"
                        contenedorBotones.appendChild(botonContraerTodo)
                    }
                }
            },
            navegacion: {
                ui: function (data) {
                    const destino = data.destino
                    const contenedor_selector = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[componente=navegador]")
                    if (contenedor_selector) {
                        return
                    }
                    const contenedor = document.createElement("div")
                    contenedor.setAttribute("componente", "navegador")
                    contenedor.classList.add(
                        "padding6",
                        "flexVertical",
                        "gap6"
                    )
                    const ui = document.createElement("div")
                    ui.classList.add(
                        "navegador",
                        "backgroundWhite5"
                    )
                    contenedor.appendChild(ui)
                    const botonTodo = document.createElement("div")
                    botonTodo.setAttribute("comando", "todo")
                    botonTodo.classList.add(
                        "botonV2",
                        "comportamientoBoton",
                    )
                    botonTodo.textContent = "Ver todo"
                    botonTodo.addEventListener("click", this.controlador)
                    const botonPorNoche = document.createElement("div")
                    botonPorNoche.setAttribute("comando", "porNoche")
                    botonPorNoche.classList.add(
                        "botonV2",
                        "comportamientoBoton",
                    )
                    botonPorNoche.textContent = "Desglose por noche"
                    botonPorNoche.addEventListener("click", this.controlador)
                    ui.appendChild(botonPorNoche)
                    const botonPorApartamento = document.createElement("div")
                    botonPorApartamento.setAttribute("comando", "porApartamento")
                    botonPorApartamento.classList.add(
                        "botonV2",
                        "comportamientoBoton",
                    )
                    botonPorApartamento.textContent = "Desglose por apartamento"
                    botonPorApartamento.addEventListener("click", this.controlador)
                    ui.appendChild(botonPorApartamento)
                    const botonServicios = document.createElement("div")
                    botonServicios.setAttribute("comando", "porServicio")
                    botonServicios.classList.add(
                        "botonV2",
                        "comportamientoBoton",
                    )
                    botonServicios.textContent = "Servicios"
                    botonServicios.addEventListener("click", this.controlador)
                    ui.appendChild(botonServicios)
                    const botonOfertas = document.createElement("div")
                    botonOfertas.setAttribute("comando", "ofertas")
                    botonOfertas.classList.add(
                        "botonV2",
                        "comportamientoBoton",
                    )
                    botonOfertas.textContent = "Ofertas aplicadas"
                    botonOfertas.addEventListener("click", this.controlador)
                    ui.appendChild(botonOfertas)
                    const botonImpuestos = document.createElement("div")
                    botonImpuestos.setAttribute("comando", "impuestos")
                    botonImpuestos.classList.add(
                        "botonV2",
                        "comportamientoBoton",
                    )
                    botonImpuestos.textContent = "Impuestos"
                    botonImpuestos.addEventListener("click", this.controlador)
                    ui.appendChild(botonImpuestos)
                    const botonTotales = document.createElement("div")
                    botonTotales.setAttribute("comando", "totales")
                    botonTotales.classList.add(
                        "botonV2",
                        "comportamientoBoton",
                    )
                    botonTotales.textContent = "Totales"
                    botonTotales.addEventListener("click", this.controlador)
                    ui.appendChild(botonTotales)
                    document.querySelector(destino).querySelector("[contenedor=financiero]").appendChild(contenedor)
                },
                controlador: function (data) {
                    const boton = data.target
                    const comando = boton.getAttribute("comando")
                    const estadoActual = boton.getAttribute("estado")
                    const contenedorFinancieroArea = boton.closest("[contenedor=financiero]")
                    const selectorContenedores = contenedorFinancieroArea.querySelectorAll("[componente=plegable]")
                    const navegadorArea = contenedorFinancieroArea.querySelector("[componente=navegador]")
                    const selectorBotones = navegadorArea.querySelectorAll("[comando]")
                    const estadoInicial = () => {
                        selectorContenedores.forEach((contenedorPlegable) => {
                            contenedorPlegable.removeAttribute("style")
                        })
                        selectorBotones.forEach((boton) => {
                            boton.classList.remove("selecionAzul")
                            boton.removeAttribute("estado")
                        })
                    }
                    if (comando === "todo") {
                        estadoInicial()
                        return
                    }
                    if (estadoActual === "activo") {
                        boton.classList.remove("selecionAzul")
                        boton.removeAttribute("estado")
                    } else {
                        boton.classList.add("selecionAzul")
                        boton.setAttribute("estado", "activo")
                    }
                    const botonesActivos = []
                    contenedorFinancieroArea.querySelector("[componente=navegador]").querySelectorAll("[estado=activo]").forEach((botonActivo) => {
                        botonesActivos.push(botonActivo.getAttribute("comando"))
                    })
                    if (botonesActivos.length === 0) {
                        return estadoInicial()
                    }
                    selectorContenedores.forEach((contenedorPlegable) => {
                        const contenedorIDV = contenedorPlegable.getAttribute("contenedor")
                        if (botonesActivos.includes(contenedorIDV)) {
                            contenedorPlegable.removeAttribute("style")
                        } else {
                            contenedorPlegable.style.display = "none"
                        }
                    })
                }
            },
            entidades: {
                hub: function (data) {
                    const destino = data.destino
                    const entidades = data.entidades
                    const instanciaUID = data.instanciaUID
                    const modoUI = data.modoUI
                    for (const [entidadIDV, entidad] of Object.entries(entidades)) {
                        if (entidadIDV === "reserva") {
                            const desglosePorNoche = entidad.desglosePorNoche
                            const desglosePorApartamento = entidad.desglosePorApartamento
                            const contenedorSobreControles = entidad.contenedorSobreControles
                            const totales = entidad.global.totales
                            this.reserva.contenedor({
                                destino
                            })
                            this.reserva.porNoche({
                                destino,
                                instanciaUID,
                                desglosePorNoche,
                                contenedorSobreControles
                            })
                            this.reserva.porApartamento({
                                destino,
                                desglosePorApartamento
                            })
                            this.reserva.totales({
                                destino,
                                totales
                            })
                        }
                        if (entidadIDV === "servicios") {
                            const desglosePorServicios = entidad.desglosePorServicios
                            const totales = entidad.global.totales
                            // if ((modoUI === "administracion" || modoUI === "plaza" || modoUI === "simulador") && desglosePorServicios.length > 0) {
                            this.servicios.contenedor({
                                destino,
                                desglosePorServicios,
                                modoUI
                            })
                            this.servicios.porServicio({
                                destino,
                                desglosePorServicios
                            })
                            this.servicios.totales({
                                destino,
                                totales
                            })
                            // }
                        }
                        if (entidadIDV === "complementosAlojamiento") {
                            const desglosePorComplementoDeAlojamiento = entidad.desglosePorComplementoDeAlojamiento
                            const desglosePorAlojamiento = entidad.desglosePorAlojamiento
                            const totales = entidad.global.totales
                            //if ((modoUI === "administracion" || modoUI === "plaza" || modoUI === "simulador") && desglosePorComplementoDeAlojamiento.length > 0) {
                            this.complementosDelAlojamientos.contenedor({
                                destino,
                                desglosePorComplementoDeAlojamiento,
                                modoUI
                            })
                            this.complementosDelAlojamientos.porComplemento({
                                destino,
                                desglosePorComplementoDeAlojamiento,
                                desglosePorAlojamiento
                            })
                            this.complementosDelAlojamientos.totales({
                                destino,
                                totales
                            })
                            // }
                        }
                    }
                },
                reserva: {
                    contenedor: function (data) {
                        const destino = data.destino
                        const selector = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[entidad=reserva]")
                        if (!selector) {
                            const contenedorPlegable = document.createElement('details');
                            contenedorPlegable.classList.add("contenedorEntidad", "sobreControlAnimacionGlobal")
                            contenedorPlegable.setAttribute("entidad", "reserva")
                            const tituloContenedorPlegable = document.createElement('summary');
                            tituloContenedorPlegable.classList.add(
                                "padding12",
                            )
                            tituloContenedorPlegable.textContent = 'Alojamiento';
                            contenedorPlegable.appendChild(tituloContenedorPlegable)
                            const contenedor = document.createElement("div")
                            contenedor.setAttribute("contenedor", "data")
                            contenedorPlegable.appendChild(contenedor)
                            document.querySelector(destino).querySelector("[contenedor=financiero]").appendChild(contenedorPlegable)
                        }
                    },
                    porNoche: function (data) {
                        const destino = data.destino
                        const desglosePorNoche = data.desglosePorNoche
                        const contenedorSobreControles = data.contenedorSobreControles
                        const instanciaUID = data.instanciaUID
                        const contenedorFinanciero = document.querySelector(destino).querySelector("[contenedor=financiero]")
                        const contenedorEntidadReserva = contenedorFinanciero.querySelector("[entidad=reserva] [contenedor=data]")
                        const conntenedorPorNoche_selector = contenedorEntidadReserva.querySelector("[contenedor=porNoche]")
                        const modoUI = contenedorFinanciero.getAttribute("modoUI")
                        if (!conntenedorPorNoche_selector) {
                            const contenedorPorNoche = document.createElement("div")
                            contenedorPorNoche.classList.add("reserva_resumen_desglose_pago_bloque")
                            contenedorPorNoche.setAttribute("contenedor", "porNoche")
                            contenedorPorNoche.setAttribute("componente", "plegable")
                            contenedorEntidadReserva.appendChild(contenedorPorNoche)
                            const detalleDiaUITitulo = document.createElement("div")
                            detalleDiaUITitulo.classList.add("reserva_resumen_desglose_pago_titulo")
                            detalleDiaUITitulo.textContent = "Desglose por noche"
                            contenedorPorNoche.appendChild(detalleDiaUITitulo)
                            if (modoUI === "administracion") {
                                const contenedorBotones = document.createElement("div")
                                contenedorBotones.classList.add(
                                    "flexHorizontal",
                                    "gap6",
                                )
                                const botonSobreControlDePrecios = document.createElement("div")
                                botonSobreControlDePrecios.classList.add(
                                    "botonV1",
                                    "comportamientoBoton"
                                )
                                botonSobreControlDePrecios.textContent = "Alterar precios neto de la reserva"
                                botonSobreControlDePrecios.addEventListener("click", casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.desgloseTotal.componentesUI.sobreControlPrecios.arranque)
                                contenedorPorNoche.appendChild(contenedorBotones)
                            }
                            if (modoUI === "simulador") {
                                const contenedorBotones = document.createElement("div")
                                contenedorBotones.classList.add(
                                    "flexHorizontal",
                                    "gap6",
                                )
                                const botonSobreControlDePrecios = document.createElement("div")
                                botonSobreControlDePrecios.classList.add(
                                    "botonV1",
                                    "comportamientoBoton"
                                )
                                botonSobreControlDePrecios.textContent = "Alterar precios neto de la simulación"
                                botonSobreControlDePrecios.addEventListener("click", casaVitini.view.detallesSimulacion.componentesUI.sobreControlPrecios.arranque)
                                contenedorPorNoche.appendChild(contenedorBotones)
                            }
                            const contenedorDesglosePorNoche = document.createElement("div")
                            contenedorDesglosePorNoche.classList.add("reserva_resumen_desglose_porNoche")
                            contenedorDesglosePorNoche.setAttribute("contenedor", "deslosePorNoche")
                            contenedorPorNoche.appendChild(contenedorDesglosePorNoche)
                        }
                        const contenedorDesglosePorNoche_renderizado = contenedorEntidadReserva.querySelector("[contenedor=deslosePorNoche]")
                        const fechasDelDesgloseArray = Object.keys(desglosePorNoche)
                        const selectorNochesRenderizados = contenedorDesglosePorNoche_renderizado.querySelectorAll(`[noche]`)
                        selectorNochesRenderizados.forEach((nocheRenderizada) => {
                            const fechaNocheRenderizada = nocheRenderizada.getAttribute("noche")
                            if (!fechasDelDesgloseArray.includes(fechaNocheRenderizada)) {
                                nocheRenderizada?.remove()
                            }
                        })
                        let posicion = 0
                        for (const [fechaNoche, desglose] of Object.entries(desglosePorNoche)) {
                            const precioNetoNoche = desglose.precioNetoNoche
                            const apartamentosPorNoche = desglose.apartamentosPorNoche
                            const precioNetoNocheConComplementos = desglose.precioNetoNocheConComplementos
                            const nochesRenderizdas = contenedorDesglosePorNoche_renderizado.querySelectorAll("[noche]")
                            const contenedorNoche = document.createElement("div")
                            contenedorNoche.setAttribute("noche", fechaNoche)
                            contenedorNoche.classList.add(
                                "contenedorDiaConNoche",
                            )
                            const titulo = document.createElement("div")
                            titulo.classList.add(
                                "reserva_resumen_apartamentoIUTitulo",
                                "textoCentrado"
                            )
                            titulo.classList.add("negrita")
                            titulo.textContent = fechaNoche
                            contenedorNoche.appendChild(titulo)

                            const existe = contenedorDesglosePorNoche_renderizado.querySelector(`[noche="${fechaNoche}"]`)
                            if (!existe) {
                                const elementosArray = Array.from(nochesRenderizdas);
                                contenedorDesglosePorNoche_renderizado.insertBefore(contenedorNoche, elementosArray[posicion]);
                            }

                            const totalesNoche = document.createElement("div")
                            totalesNoche.classList.add("padding6")
                            totalesNoche.setAttribute("contenedor", "totalesNoche")
                            contenedorNoche.appendChild(totalesNoche)

                            const totalNetoNocheUI = document.createElement("div")
                            totalNetoNocheUI.setAttribute("componente", "totalNetoNoche")
                            totalNetoNocheUI.classList.add("negrita")
                            totalesNoche.appendChild(totalNetoNocheUI)

                            const totalNetoNocheConComplementosUI = document.createElement("div")
                            totalNetoNocheConComplementosUI.setAttribute("componente", "totalNetoNocheConComplementos")
                            totalNetoNocheConComplementosUI.classList.add("negrita")
                            totalesNoche.appendChild(totalNetoNocheConComplementosUI)

                            posicion++
                            const contenedorNoche_renderizado = contenedorDesglosePorNoche_renderizado.querySelector(`[noche="${fechaNoche}"]`)

                            const totalNetoNoche_sel = contenedorNoche_renderizado.querySelector(`[componente=totalNetoNoche]`)
                            totalNetoNoche_sel.textContent = precioNetoNoche + "$ Total neto noche"
                            if (precioNetoNocheConComplementos === "0.00") {
                                contenedorNoche_renderizado.querySelector(`[componente=totalNetoNocheConComplementos]`).style.display = "none"
                            } else {
                                contenedorNoche_renderizado.querySelector(`[componente=totalNetoNocheConComplementos]`).removeAttribute("style")

                            }
                            const precioNetoNocheConComplementos_sel = contenedorNoche_renderizado.querySelector(`[componente=totalNetoNocheConComplementos]`)
                            precioNetoNocheConComplementos_sel.textContent = precioNetoNocheConComplementos + "$ Total neto noche con complementos"

                            const apartamentosIDVArray = Object.keys(apartamentosPorNoche)
                            const selectorApartamentosRenderizados = contenedorNoche_renderizado.querySelectorAll(`[apartamentoIDV]`)
                            selectorApartamentosRenderizados.forEach((apartamentoRenderizado) => {
                                const apartamentoIDVRenderizado = apartamentoRenderizado.getAttribute("apartamentoIDV")
                                if (!apartamentosIDVArray.includes(apartamentoIDVRenderizado)) {
                                    apartamentoRenderizado?.remove()
                                }
                            })
                            for (const [apartamentoIDV, desglosePorApartamento] of Object.entries(apartamentosPorNoche)) {
                                const apartamentoUI = desglosePorApartamento.apartamentoUI
                                const precioNetoApartamento = desglosePorApartamento.precioNetoApartamento
                                const precioNetoApartamentoComplementos = desglosePorApartamento.precioNetoApartamentoComplementos
                                const contenedorApartamento_selector = contenedorNoche_renderizado.querySelector(`[apartamentoIDV="${apartamentoIDV}"]`)
                                if (!contenedorApartamento_selector) {
                                    const contenedorApartamento = document.createElement("div")
                                    contenedorApartamento.classList.add(
                                        "contenedorApartamento",
                                    )
                                    contenedorApartamento.setAttribute("apartamentoIDV", apartamentoIDV)
                                    contenedorNoche_renderizado.appendChild(contenedorApartamento)
                                    if (modoUI === "administracion") {
                                        contenedorApartamento.classList.add("comportamientoBotonApartamento")
                                        contenedorApartamento.addEventListener("click", () => {
                                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.desgloseTotal.componentesUI.sobreControlPrecios.componentesUI.nocheUI({
                                                fechaNoche,
                                                apartamentoIDV,
                                                instanciaUID_contenedorFinanciero: instanciaUID
                                            })
                                        })
                                    }
                                    if (modoUI === "simulador") {
                                        contenedorApartamento.classList.add("comportamientoBotonApartamento")
                                        contenedorApartamento.addEventListener("click", () => {
                                            casaVitini.view.detallesSimulacion.componentesUI.sobreControlPrecios.nocheUI({
                                                fechaNoche,
                                                apartamentoIDV,
                                                instanciaUID_contenedorFinanciero: instanciaUID
                                            })
                                        })
                                    }
                                    const contenedorApartamentoYTotal = document.createElement("div")
                                    contenedorApartamentoYTotal.classList.add("padding6")
                                    contenedorApartamentoYTotal.setAttribute("contenedor", "tituloApartamentoYTotales")
                                    contenedorApartamento.appendChild(contenedorApartamentoYTotal)

                                    const tituloApartamento = document.createElement("div")
                                    tituloApartamento.setAttribute("apartamentoIDV", apartamentoIDV)
                                    tituloApartamento.classList.add(
                                        "reserva_resumen_apartamentoUIPrecio",
                                    )
                                    tituloApartamento.classList.add("negrita")
                                    tituloApartamento.classList.add("colorGris")
                                    tituloApartamento.textContent = apartamentoUI
                                    contenedorApartamentoYTotal.appendChild(tituloApartamento)
                                    const precioNetoApartamentoUI = document.createElement("div")
                                    precioNetoApartamentoUI.setAttribute("contenedor", "precioNetoApartamento")
                                    contenedorApartamentoYTotal.appendChild(precioNetoApartamentoUI)

                                    const precioNetoApartamentoComplementosUI = document.createElement("div")
                                    precioNetoApartamentoComplementosUI.setAttribute("contenedor", "precioNetoApartamentoComplementos")
                                    contenedorApartamentoYTotal.appendChild(precioNetoApartamentoComplementosUI)

                                }
                                const contenedorApartamento_renderizado = contenedorNoche_renderizado.querySelector(`[apartamentoIDV="${apartamentoIDV}"]`)
                                const contenedorTotalApartamentoYTotales_renderizado = contenedorApartamento_renderizado.querySelector("[contenedor=tituloApartamentoYTotales]")
                                if (modoUI === "administracion") {
                                    if (contenedorSobreControles
                                        &&
                                        contenedorSobreControles.hasOwnProperty(fechaNoche)
                                        &&
                                        contenedorSobreControles[fechaNoche].hasOwnProperty(apartamentoIDV)) {
                                        const sobreControlUI_selector = contenedorTotalApartamentoYTotales_renderizado.querySelector("[contenedor=sobreControl]")
                                        if (!sobreControlUI_selector) {
                                            const contenedorSobreControlUI = document.createElement("div")
                                            contenedorSobreControlUI.setAttribute("contenedor", "sobreControl")
                                            contenedorSobreControlUI.classList.add(
                                                "negrita"
                                            )
                                            contenedorSobreControlUI.textContent = "Sobre control aplicado."
                                            contenedorTotalApartamentoYTotales_renderizado.appendChild(contenedorSobreControlUI)
                                        }
                                    } else {
                                        contenedorTotalApartamentoYTotales_renderizado.querySelector("[contenedor=sobreControl]")?.remove()
                                    }
                                }
                                if (modoUI === "simulador") {
                                    if (contenedorSobreControles
                                        &&
                                        contenedorSobreControles.hasOwnProperty(fechaNoche)
                                        &&
                                        contenedorSobreControles[fechaNoche].hasOwnProperty(apartamentoIDV)) {
                                        const sobreControlUI_selector = contenedorTotalApartamentoYTotales_renderizado.querySelector("[contenedor=sobreControl]")
                                        if (!sobreControlUI_selector) {
                                            const contenedorSobreControlUI = document.createElement("div")
                                            contenedorSobreControlUI.setAttribute("contenedor", "sobreControl")
                                            contenedorSobreControlUI.classList.add(
                                                "negrita"
                                            )
                                            contenedorSobreControlUI.textContent = "Sobre control aplicado."
                                            contenedorTotalApartamentoYTotales_renderizado.appendChild(contenedorSobreControlUI)
                                        }
                                    } else {
                                        contenedorTotalApartamentoYTotales_renderizado.querySelector("[contenedor=sobreControl]")?.remove()
                                    }
                                }
                                const precioNetoApartamentoSelector = contenedorApartamento_renderizado.querySelector("[contenedor=precioNetoApartamento]")
                                precioNetoApartamentoSelector.textContent = precioNetoApartamento + "$ Neto del apartamento"
                                if (precioNetoApartamentoComplementos === "0.00") {
                                    contenedorApartamento_renderizado.querySelector("[contenedor=precioNetoApartamentoComplementos]").style.display = "none"
                                } else {
                                    contenedorApartamento_renderizado.querySelector("[contenedor=precioNetoApartamentoComplementos]").removeAttribute("style")
                                }
                                const precioNetoApartamentoComplementosSelector = contenedorApartamento_renderizado.querySelector("[contenedor=precioNetoApartamentoComplementos]")
                                precioNetoApartamentoComplementosSelector.textContent = precioNetoApartamentoComplementos + "$ Neto del apartamento con complementos"
                            }
                        }
                    },
                    porApartamento: function (data) {
                        const destino = data.destino
                        const desglosePorApartamento = data.desglosePorApartamento
                        const porApartamento_selector = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[entidad=reserva] [contenedor=data]").querySelector("[contenedor=porApartamento]")
                        if (!porApartamento_selector) {
                            const contenedor = document.createElement("div")
                            contenedor.classList.add("contenedorPorApartamento",
                                "flexVertical",
                                "gap6"
                            )
                            contenedor.setAttribute("contenedor", "porApartamento")
                            contenedor.setAttribute("componente", "plegable")
                            const tituloContendor = document.createElement("div")
                            tituloContendor.classList.add(
                                "negrita",
                                "textoCentrado",
                                "padding6"
                            )
                            tituloContendor.textContent = "Desglose por apartamento"
                            contenedor.appendChild(tituloContendor)
                            document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[entidad=reserva] [contenedor=data]").appendChild(contenedor)
                        }
                        const porApartamento_renderizado = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[entidad=reserva] [contenedor=data]").querySelector("[contenedor=porApartamento]")
                        const selectorPorApartamentosRenderizados = porApartamento_renderizado.querySelectorAll(`[apartamentoIDV]`)
                        const apartamentosIDV_porRenderizar = Object.keys(desglosePorApartamento)
                        selectorPorApartamentosRenderizados.forEach((apartamento) => {
                            const porApartamentoRenderizado = apartamento.getAttribute("apartamentoIDV")
                            if (!apartamentosIDV_porRenderizar.includes(porApartamentoRenderizado)) {
                                apartamento?.remove()
                            }
                        })
                        for (const [apartamentoIDV, detalles] of Object.entries(desglosePorApartamento)) {
                            const apartamentoUI = detalles.apartamentoUI
                            const totalNeto = detalles.totalNeto
                            const precioMedioNetoNoche = detalles.precioMedioNetoNoche
                            const totalNetoConComplementos = detalles.totalNetoConComplementos
                            const contenedorApartamento_selector = porApartamento_renderizado.querySelector(`[apartamentoIDV=${apartamentoIDV}]`)
                            if (!contenedorApartamento_selector) {
                                const contenedorApartamento = document.createElement("div")
                                contenedorApartamento.classList.add("contenedorApartamento")
                                contenedorApartamento.setAttribute("apartamentoIDV", apartamentoIDV)
                                porApartamento_renderizado.appendChild(contenedorApartamento)

                                const contenedorTituloYtotal = document.createElement("div")
                                contenedorTituloYtotal.setAttribute("contenedor", "tituloYTotal")
                                contenedorTituloYtotal.classList.add(
                                    "padding6"
                                )
                                contenedorApartamento.appendChild(contenedorTituloYtotal)


                                const apartamentoUITitulo = document.createElement("div")
                                apartamentoUITitulo.classList.add("contenedorTextoOferta")
                                apartamentoUITitulo.classList.add("negrita")
                                apartamentoUITitulo.textContent = apartamentoUI
                                contenedorTituloYtotal.appendChild(apartamentoUITitulo)

                                const apartamentoUIPrecioNetoTotal = document.createElement("div")
                                apartamentoUIPrecioNetoTotal.classList.add("textoDetallesPorApartamento")
                                apartamentoUIPrecioNetoTotal.setAttribute("dato", "totalNeto")
                                contenedorTituloYtotal.appendChild(apartamentoUIPrecioNetoTotal)


                                const apartamentoUIPrecioPromedioPorNoche = document.createElement("div")
                                apartamentoUIPrecioPromedioPorNoche.classList.add("textoDetallesPorApartamento")
                                apartamentoUIPrecioPromedioPorNoche.setAttribute("dato", "precioMedioNetoNoche")
                                contenedorTituloYtotal.appendChild(apartamentoUIPrecioPromedioPorNoche)


                                const apartamentoUITotalNetoConComplementos = document.createElement("div")
                                apartamentoUITotalNetoConComplementos.classList.add("textoDetallesPorApartamento")
                                apartamentoUITotalNetoConComplementos.setAttribute("dato", "totalNetoConComplementos")
                                contenedorTituloYtotal.appendChild(apartamentoUITotalNetoConComplementos)
                            }
                            const contenedorApartamento_renderizado = porApartamento_renderizado.querySelector(`[apartamentoIDV=${apartamentoIDV}]`)
                            const precioNetoApartamentoUI = contenedorApartamento_renderizado.querySelector("[dato=totalNeto]")
                            precioNetoApartamentoUI.textContent = totalNeto + "$ Total neto"
                            const precioMedioNetoNocheApartamentoUI = contenedorApartamento_renderizado.querySelector("[dato=precioMedioNetoNoche]")
                            precioMedioNetoNocheApartamentoUI.textContent = precioMedioNetoNoche + "$ Precio medio neto por noche"

                            if (totalNetoConComplementos === "0.00") {
                                contenedorApartamento_renderizado.querySelector("[dato=totalNetoConComplementos]").style.display = "none"
                            } else {
                                contenedorApartamento_renderizado.querySelector("[dato=totalNetoConComplementos]").removeAttribute("style")
                            }
                            const totalNetoConComplementosUI = contenedorApartamento_renderizado.querySelector("[dato=totalNetoConComplementos]")
                            totalNetoConComplementosUI.textContent = totalNetoConComplementos + "$ Total neto con complementos"
                        }
                    },
                    totales: function (data) {
                        const destino = data.destino
                        const totales = data.totales
                        const instanciaUID = data.instanciaUID
                        const totalNeto = totales?.totalNeto
                        const totalNetoConComplementos = totales?.totalNetoConComplementos
                        const totalFinal = totales?.totalFinal
                        const totalDescuento = totales?.totalDescuento
                        const impuestosAplicados = totales?.impuestosAplicados
                        const promedioNocheNeto = totales?.promedioNocheNeto
                        const promedioNocheNetoConDescuentos = totales?.promedioNocheNetoConDescuentos
                        const totalNetoConDescuentos = totales?.totalNetoConDescuentos
                        const contenedorFinanciero = document.querySelector(destino).querySelector("[contenedor=financiero]")
                        const modoUI = contenedorFinanciero.getAttribute("modoUI")
                        const contenedorTotales_selector = document.querySelector(destino).querySelector("[contenedor=financiero] [entidad=reserva] [contenedor=data]").querySelector("[contenedor=totales]")
                        if (!contenedorTotales_selector) {
                            const totalesUI = document.createElement("div")
                            totalesUI.classList.add("reserva_resumen_desglose_pago_bloque")
                            totalesUI.setAttribute("contenedor", "totales")
                            totalesUI.setAttribute("componente", "plegable")
                            document.querySelector(destino).querySelector("[contenedor=financiero] [entidad=reserva] [contenedor=data]").appendChild(totalesUI)
                            const totalesUITituloBloque = document.createElement("div")
                            totalesUITituloBloque.classList.add("textoCentrado", "negrita", "padding6")
                            totalesUITituloBloque.textContent = "Totales del alojamiento de la reserva (Solo alojamiento)"
                            totalesUI.appendChild(totalesUITituloBloque)
                        }
                        const contenedorTotales_renderizado = document.querySelector(destino).querySelector("[contenedor=financiero] [entidad=reserva] [contenedor=data]").querySelector("[contenedor=totales]")
                        const contenedorTotalesNeto_selector = contenedorTotales_renderizado.querySelector("[contenedor=totalesNeto]")
                        if (!contenedorTotalesNeto_selector) {
                            const contenedorTotalesNeto = document.createElement("div")
                            contenedorTotalesNeto.setAttribute("contenedor", "totalesNeto")
                            contenedorTotalesNeto.classList.add(
                                "backgroundGrey1",
                                "borderRadius8",
                                "flexVertical",
                                "padding6",
                                "gap6"
                            )
                            const contenedorTotalNetoUI = document.createElement("div")
                            contenedorTotalNetoUI.classList.add(
                                "flexVertical",
                                "padding6"
                            )
                            contenedorTotalesNeto.appendChild(contenedorTotalNetoUI)

                            const totalReservaNetoUI = document.createElement("div")
                            totalReservaNetoUI.textContent = "Total neto alojamientos"
                            contenedorTotalNetoUI.appendChild(totalReservaNetoUI)

                            const totalReservaNetoUI_ = document.createElement("div")
                            totalReservaNetoUI_.setAttribute("dato", "totalNeto")
                            totalReservaNetoUI_.classList.add("negrita")
                            contenedorTotalNetoUI.appendChild(totalReservaNetoUI_)

                            const contenedorTotalNetoConComplementos = document.createElement("div")
                            contenedorTotalNetoConComplementos.classList.add("flexVertical")
                            contenedorTotalNetoConComplementos.setAttribute("com", "contenedorTotalNetoConComplementos")
                            contenedorTotalNetoUI.appendChild(contenedorTotalNetoConComplementos)


                            const tituloTotalAlojamentoConComplementosUI = document.createElement("div")
                            tituloTotalAlojamentoConComplementosUI.textContent = "Total neto alojamientos con complementos"
                            contenedorTotalNetoConComplementos.appendChild(tituloTotalAlojamentoConComplementosUI)

                            const totalAlojamentoConComplementosUI = document.createElement("div")
                            totalAlojamentoConComplementosUI.setAttribute("dato", "totalNetoConComplementos")
                            totalAlojamentoConComplementosUI.classList.add("negrita")
                            contenedorTotalNetoConComplementos.appendChild(totalAlojamentoConComplementosUI)

                            const contenedorPromedioNoche = document.createElement("div")
                            contenedorPromedioNoche.classList.add(
                                "flexVertical",
                                "padding6"
                            )
                            contenedorTotalesNeto.appendChild(contenedorPromedioNoche)

                            const totalReservaNetoDiaUI = document.createElement("div")
                            totalReservaNetoDiaUI.textContent = "total neto medio de alojamientos por noche"
                            contenedorPromedioNoche.appendChild(totalReservaNetoDiaUI)

                            const totalReservaNetoDiaUI_ = document.createElement("div")
                            totalReservaNetoDiaUI_.classList.add("negrita")
                            totalReservaNetoDiaUI_.setAttribute("dato", "totalNetoNocheMedio")
                            contenedorPromedioNoche.appendChild(totalReservaNetoDiaUI_)

                            contenedorTotales_renderizado.appendChild(contenedorTotalesNeto)
                        }
                        const contenedorTotalesNeto_renderizado = contenedorTotales_renderizado.querySelector("[contenedor=totalesNeto]")
                        const totalNetoUI = contenedorTotalesNeto_renderizado.querySelector("[dato=totalNeto]")
                        totalNetoUI.textContent = totalNeto

                        const contenedorTotalNetoConComplementos = contenedorTotalesNeto_renderizado.querySelector("[com=contenedorTotalNetoConComplementos]")
                        if (totalNetoConComplementos === "0.00") {
                            contenedorTotalNetoConComplementos.style.display = "none"
                        } else {
                            contenedorTotalNetoConComplementos.removeAttribute("style")
                        }
                        const totalNetoConComplementosUI = contenedorTotalesNeto_renderizado.querySelector("[dato=totalNetoConComplementos]")
                        totalNetoConComplementosUI.textContent = totalNetoConComplementos

                        const promedioNocheNetoUI = contenedorTotalesNeto_renderizado.querySelector("[dato=totalNetoNocheMedio]")
                        promedioNocheNetoUI.textContent = promedioNocheNeto
                        const totalesDescuentos_selector = contenedorTotales_renderizado.querySelector("[contenedor=totalDescuentos]")
                        if (!totalesDescuentos_selector && totalDescuento) {
                            const contenedorTotalesDescuentos = document.createElement("div")
                            contenedorTotalesDescuentos.setAttribute("contenedor", "totalDescuentos")
                            contenedorTotalesDescuentos.classList.add(
                                "backgroundGrey1",
                                "borderRadius8",
                                "flexVertical",
                                "padding6",
                                "gap6"
                            )
                            contenedorTotales_renderizado.appendChild(contenedorTotalesDescuentos)
                            const contenedorTotalDescuentosAplicados = document.createElement("div")
                            contenedorTotalDescuentosAplicados.classList.add(
                                "flexVertical",
                                "padding6"
                            )
                            const totalDescuentosAplicadosUI = document.createElement("div")
                            totalDescuentosAplicadosUI.textContent = "Descuento total por todas las ofertas aplicadas"
                            contenedorTotalDescuentosAplicados.appendChild(totalDescuentosAplicadosUI)
                            const totalDescuentosAplicadosUI_ = document.createElement("div")
                            totalDescuentosAplicadosUI_.classList.add("negrita")
                            totalDescuentosAplicadosUI_.setAttribute("dato", "totalConDescuentoAplicado")
                            contenedorTotalDescuentosAplicados.appendChild(totalDescuentosAplicadosUI_)
                            contenedorTotalesDescuentos.appendChild(contenedorTotalDescuentosAplicados)
                            const contenedorTotalNetoConDescuentos = document.createElement("div")
                            contenedorTotalNetoConDescuentos.classList.add(
                                "flexVertical",
                                "padding6"
                            )
                            const totalNetoConDescuentosUI = document.createElement("div")
                            totalNetoConDescuentosUI.textContent = "Total neto con descuentos aplicados"
                            contenedorTotalNetoConDescuentos.appendChild(totalNetoConDescuentosUI)
                            const totalNetoConDescuentosUI_ = document.createElement("div")
                            totalNetoConDescuentosUI_.classList.add("negrita")
                            totalNetoConDescuentosUI_.setAttribute("dato", "totalNetoConDescuentos")
                            contenedorTotalNetoConDescuentos.appendChild(totalNetoConDescuentosUI_)
                            contenedorTotalesDescuentos.appendChild(contenedorTotalNetoConDescuentos)
                            const contenedorPromedio = document.createElement("div")
                            contenedorPromedio.classList.add(
                                "flexVertical",
                                "padding6"
                            )
                            const precioMedioConDescuentos = document.createElement("div")
                            precioMedioConDescuentos.textContent = "Precio medio neto de alojamientos por noche con descuentos aplicados"
                            contenedorPromedio.appendChild(precioMedioConDescuentos)
                            const precioMedioConDescuentos_ = document.createElement("div")
                            precioMedioConDescuentos_.classList.add("negrita")
                            precioMedioConDescuentos_.setAttribute("dato", "precioMedioConDescuentos")
                            contenedorPromedio.appendChild(precioMedioConDescuentos_)
                            contenedorTotalesDescuentos.appendChild(contenedorPromedio)
                        }
                        const totalesDescuentos_renderizado = contenedorTotales_renderizado.querySelector("[contenedor=totalDescuentos]")
                        if (!totalDescuento) {
                            totalesDescuentos_renderizado?.remove()
                        } else {
                            const totalConDescuentosAplicadosUI = totalesDescuentos_renderizado.querySelector("[dato=totalConDescuentoAplicado]")
                            totalConDescuentosAplicadosUI.textContent = totalDescuento
                            const totalConDescuentosUI = totalesDescuentos_renderizado.querySelector("[dato=totalNetoConDescuentos]")
                            totalConDescuentosUI.textContent = totalNetoConDescuentos
                            const promedioNocheNetoConDescuentosUI = totalesDescuentos_renderizado.querySelector("[dato=precioMedioConDescuentos]")
                            promedioNocheNetoConDescuentosUI.textContent = promedioNocheNetoConDescuentos
                        }
                        const contenedorTotalesFinal_selector = contenedorTotales_renderizado.querySelector("[contenedor=totalesFinal]")
                        if (!contenedorTotalesFinal_selector) {
                            const contenedorTotalesFinal = document.createElement("div")
                            contenedorTotalesFinal.setAttribute("contenedor", "totalesFinal")
                            contenedorTotalesFinal.classList.add(
                                "backgroundGrey1",
                                "borderRadius8",
                                "flexVertical",
                                "padding6",
                                "gap6"
                            )
                            contenedorTotales_renderizado.appendChild(contenedorTotalesFinal)
                            const contenedorTotalImpuestosAplicados = document.createElement("div")
                            contenedorTotalImpuestosAplicados.classList.add(
                                "flexVertical",
                                "padding6"
                            )
                            const totalImpuestosUI = document.createElement("div")
                            totalImpuestosUI.textContent = "Total impuestos aplicados"
                            contenedorTotalImpuestosAplicados.appendChild(totalImpuestosUI)
                            const totalImpuestosUI_ = document.createElement("div")
                            totalImpuestosUI_.classList.add("negrita")
                            totalImpuestosUI_.setAttribute("dato", "impuestosAplicados")
                            contenedorTotalImpuestosAplicados.appendChild(totalImpuestosUI_)
                            contenedorTotalesFinal.appendChild(contenedorTotalImpuestosAplicados)
                            const contenedorTotalFinal = document.createElement("div")
                            contenedorTotalFinal.classList.add(
                                "flexVertical",
                                "padding6"
                            )
                            const totalConImpuestosUI = document.createElement("div")
                            totalConImpuestosUI.textContent = "Total final"
                            contenedorTotalFinal.appendChild(totalConImpuestosUI)
                            const totalConImpuestosUI_ = document.createElement("div")
                            totalConImpuestosUI_.classList.add("negrita")
                            totalConImpuestosUI_.setAttribute("dato", "totalFinal")
                            contenedorTotalFinal.appendChild(totalConImpuestosUI_)
                            contenedorTotalesFinal.appendChild(contenedorTotalFinal)
                        }
                        const contenedorTotalesFinal_renderizado = contenedorTotales_renderizado.querySelector("[contenedor=totalesFinal]")
                        const impuestosAplicadosUI = contenedorTotalesFinal_renderizado.querySelector("[dato=impuestosAplicados]")
                        impuestosAplicadosUI.textContent = impuestosAplicados
                        const totalFinalUI = contenedorTotalesFinal_renderizado.querySelector("[dato=totalFinal]")
                        totalFinalUI.textContent = totalFinal
                    },
                },
                complementosDelAlojamientos: {
                    contenedor: function (data) {
                        const destino = data.destino
                        const desglosePorComplementoDeAlojamiento = data.desglosePorComplementoDeAlojamiento
                        const modoUI = data.modoUI
                        if (desglosePorComplementoDeAlojamiento.length === 0 && modoUI === "plaza") {
                            document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[entidad=complementosDelAlojamientos]")?.remove()
                            return
                        }
                        const selector = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[entidad=complementosDelAlojamientos]")
                        if (!selector) {
                            const contenedorPlegable = document.createElement('details');
                            contenedorPlegable.classList.add("contenedorEntidad", "sobreControlAnimacionGlobal")
                            contenedorPlegable.setAttribute("entidad", "complementosDelAlojamientos")

                            const tituloContenedorPlegable = document.createElement('summary');
                            tituloContenedorPlegable.classList.add(
                                "padding12",
                            )
                            tituloContenedorPlegable.textContent = 'Complementos del alojamiento';
                            contenedorPlegable.appendChild(tituloContenedorPlegable)

                            const contenedor = document.createElement("div")
                            contenedor.setAttribute("contenedor", "data")
                            contenedor.classList.add("flexVertical", "gap6")
                            contenedorPlegable.appendChild(contenedor)
                            document.querySelector(destino).querySelector("[contenedor=financiero]").appendChild(contenedorPlegable)
                        }
                    },
                    porComplemento: function (data) {
                        const destino = data.destino
                        const desglosePorComplementoDeAlojamiento = data.desglosePorComplementoDeAlojamiento
                        const selector = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[entidad=complementosDelAlojamientos]")
                        if (!selector) { return }

                        const complementosAlojamientoPorTipo = this.componentesUI.utilidades.organizarComplementosPorTipo(desglosePorComplementoDeAlojamiento)
                        const apartamentosIDV_porRenderizar = Object.keys(complementosAlojamientoPorTipo)

                        const contenedorData = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[entidad=complementosDelAlojamientos] [contenedor=data]")

                        const cCR_selector = contenedorData.querySelector("[contenedor=complementosRenderizados]")
                        if (!cCR_selector) {
                            const contenedorComplementosRenderizados = document.createElement("div")
                            contenedorComplementosRenderizados.setAttribute("contenedor", "complementosRenderizados")
                            contenedorComplementosRenderizados.classList.add("flexVertical", "gap6")
                            contenedorData.appendChild(contenedorComplementosRenderizados)
                        }
                        const cCR_renderizado = contenedorData.querySelector("[contenedor=complementosRenderizados]")


                        this.componentesUI.utilidades.borrarContenedoresApartamentosObsoletos({
                            cCR_renderizado,
                            apartamentosIDV_porRenderizar,
                        })

                        let posicionCA = 0

                        const contenedoresAlojamientoRenderizados = cCR_renderizado.querySelectorAll(`[contenedor=porAlojamiento]`)
                        Object.entries(complementosAlojamientoPorTipo).forEach(contenedorComplementos => {
                            const [apartamentoIDV, contenedor] = contenedorComplementos


                            const complemenstosPorAlojamiento = contenedor.tipoUbicacion.porAlojamiento
                            const apartamentoUI = contenedor.apartamentoUI

                            const contenedorGlobal_porAlojamiento_selector = cCR_renderizado.querySelector(`[contenedor=porAlojamiento] [apartamentoIDV="${apartamentoIDV}"]`)
                            const contenedorAlojamiento = this.componentesUI.contenedorAlojamiento({
                                apartamentoIDV,
                                apartamentoUI
                            })

                            const existe = contenedorGlobal_porAlojamiento_selector
                            if (!existe) {
                                const elementosArray = Array.from(contenedoresAlojamientoRenderizados);
                                cCR_renderizado.insertBefore(contenedorAlojamiento, elementosArray[posicionCA]);
                            }
                            posicionCA++

                            const complementoUID_porRenderizar = complemenstosPorAlojamiento.map(c => c.complementoUID)
                            this.componentesUI.utilidades.borrarContenedoresComplementosEnAlojamientoObsoletoa({
                                contenedorAlojamiento: contenedorAlojamiento,
                                complementoUID_porRenderizar,
                                tipoUbicacion: "alojamiento"
                            })


                            this.componentesUI.intertorComplemento({
                                contenedorAlojamiento: contenedorAlojamiento,
                                titulo: "Complementos Alojamiento",
                                tipoUbicacion: "alojamiento",
                                complementos: complemenstosPorAlojamiento,
                                contenedorGlobal_porAlojamiento_selector
                            })

                            const complementosPorHabitacion = contenedor.tipoUbicacion.porHabitacion

                            Object.entries(complementosPorHabitacion).forEach(h => {

                                const [habitacionIDV, complementos] = h
                                const habitacionUI = complementos[0].habitacionUI

                                this.componentesUI.intertorComplemento({
                                    contenedorAlojamiento: contenedorAlojamiento,
                                    titulo: `Complmentos ${habitacionUI}`,
                                    tipoUbicacion: "habitacion",
                                    habitacionIDV,
                                    complementos: complementos,
                                })
                            })
                        })
                    },
                    componentesUI: {
                        contenedorAlojamiento: function (data) {

                            const apartamentoIDV = data.apartamentoIDV
                            const apartamentoUI = data.apartamentoUI
                            const contenedor = document.createElement("div")
                            contenedor.classList.add(
                                "flexVertical",
                                "gap6",
                                "padding6",
                                "borderRadius20",
                                "borderGrey1"
                            )
                            contenedor.setAttribute("contenedor", "porAlojamiento")
                            contenedor.setAttribute("apartamentoIDV", apartamentoIDV)
                            contenedor.setAttribute("componente", "plegable")

                            const tituloContendor = document.createElement("div")
                            tituloContendor.classList.add(
                                "negrita",
                                "textoCentrado",
                                "padding6"
                            )
                            tituloContendor.textContent = `Complementos de ${apartamentoUI}`
                            contenedor.appendChild(tituloContendor)

                            const contenedorTipoComplementos = document.createElement("div")
                            contenedorTipoComplementos.classList.add("flexVertical", "gap6")
                            contenedorTipoComplementos.style.background = "pink"
                            contenedor.appendChild(contenedorTipoComplementos)
                            return contenedor
                        },
                        contenedorComplementos: function (data) {

                            const titulo = data.titulo
                            const tipoUbicacion = data.tipoUbicacion
                            const habitacionIDV = data?.habitacionIDV

                            const ui = document.createElement("details")
                            ui.setAttribute("com", "complementosDeAlojamiento")
                            ui.setAttribute("tipoUbicacion", tipoUbicacion)
                            if (tipoUbicacion === "habitacion") {
                                ui.setAttribute("habitacionIDV", habitacionIDV)
                            }
                            ui.classList.add(
                                "flexVertical",
                                "padding6",
                                "borderRadius18",
                                "backgroundGrey1"
                            )

                            const t = document.createElement("summary")
                            t.classList.add("padding10", "borderRadius12")
                            t.textContent = titulo
                            ui.appendChild(t)


                            const c = document.createElement("div")
                            c.classList.add("flexVertical", "gap6")
                            c.setAttribute("com", "contenedor")
                            ui.appendChild(c)
                            return ui
                        },
                        complementoUI: function (data) {
                            const complementoUID_enReserva = data.complementoUID
                            const complementoUI = data.complementoUI
                            const precio = data.precio
                            const tipoPrecio = data.tipoPrecio
                            const total = data.total
                            const noches = data.noches
                            const definiconB64 = data.definicion

                            const precioContructor = (data) => {
                                const precio = data.precio
                                const tipoPrecio = data.tipoPrecio
                                const noches = data.noches
                                const total = data.total
                                const nochesUI = noches === "1" ? "noche" : "noches"
                                if (tipoPrecio === "porNoche") {
                                    return `Total: ${total}$ (${noches} ${nochesUI}, precio por noche ${precio}$)`
                                } else if (tipoPrecio === "fijoPorReserva") {
                                    return `Total: ${precio}$`
                                }
                            }

                            const def = (d) => {
                                const def = d.length === 0 ? "" : d
                                return casaVitini.utilidades.conversor.base64HaciaConTextDecoder(def)
                            }

                            const ui = document.createElement("div")
                            ui.setAttribute("complementoUID_enReserva", complementoUID_enReserva)
                            ui.classList.add(
                                "flexVertical",
                                "padding14",
                                "borderGrey1",
                                "borderRadius14"
                            )

                            const contenedorData = document.createElement("div")
                            contenedorData.classList.add(
                                "flexVertical",
                                "gap6",
                                // "padding10"
                            )
                            ui.appendChild(contenedorData)
                            const contenedorNombrePublico = document.createElement("div")
                            contenedorNombrePublico.classList.add(
                                "flexVertical",
                            )
                            contenedorData.appendChild(contenedorNombrePublico)
                            const tituluNombrePublico = document.createElement("p")
                            tituluNombrePublico.textContent = `Nombre del complemento de alojamiento`
                            // contenedorNombrePublico.appendChild(tituluNombrePublico)
                            const titulo = document.createElement("p")
                            titulo.classList.add(
                                "negrita")
                            titulo.textContent = complementoUI
                            contenedorNombrePublico.appendChild(titulo)

                            const precioUI = document.createElement("p")
                            precioUI.classList.add(
                                "negrita"
                            )
                            precioUI.textContent = precioContructor({
                                precio, tipoPrecio, noches, total
                            })
                            contenedorData.appendChild(precioUI)
                            const definicionUI = document.createElement("p")
                            definicionUI.classList.add(
                            )
                            definicionUI.textContent = def(definiconB64)
                            contenedorData.appendChild(definicionUI)
                            return ui

                        },
                        intertorComplemento: function (data) {

                            const contenedorAlojamiento = data.contenedorAlojamiento
                            const titulo = data.titulo
                            const tipoUbicacion = data.tipoUbicacion
                            const complementos = data.complementos
                            const habitacionIDV = data.habitacionIDV

                            const selector = (data) => {
                                const tipoUbicacion = data.tipoUbicacion
                                const habitacionIDV = data?.habitacionIDV

                                if (tipoUbicacion === "alojamiento") {
                                    return `[com=complementosDeAlojamiento][tipoUbicacion="${tipoUbicacion}"] [com=contenedor]`
                                } else if (tipoUbicacion === "habitacion") {
                                    return `[com=complementosDeAlojamiento][tipoUbicacion="${tipoUbicacion}"][habitacionIDV="${habitacionIDV}"] [com=contenedor]`
                                }

                            }
                            const selectorUI = selector({
                                tipoUbicacion,
                                habitacionIDV
                            })
                            if (complementos.length > 0) {
                                const c = this.contenedorComplementos({
                                    titulo,
                                    tipoUbicacion,
                                    habitacionIDV
                                })
                                contenedorAlojamiento.appendChild(c)
                            } else {
                                contenedorAlojamiento.querySelector(selectorUI)?.remove()
                                return
                            }

                            const contenedorComplementoTipoUbicacion = contenedorAlojamiento.querySelector(selectorUI)
                            const complementosPorAlojamientoRenderizados = contenedorComplementoTipoUbicacion.querySelectorAll("[complementoUID_enReserva]")

                            let posicionComplemento = 0
                            complementos.forEach(c => {
                                const complementoUI = this.complementoUI(c)

                                const existe = contenedorComplementoTipoUbicacion.querySelector(`[complementoUID_enReserva="${c.complementoUID}"]`)

                                if (!existe) {
                                    const elementosArray = Array.from(complementosPorAlojamientoRenderizados);

                                    contenedorComplementoTipoUbicacion.insertBefore(complementoUI, elementosArray[posicionComplemento]);
                                }

                                posicionComplemento++
                            })

                        },
                        utilidades: {
                            organizarComplementosPorTipo: function (complementos) {
                                const complementosAlojamientoPorTipo = {}

                                complementos.forEach((comp) => {
                                    const tipoUbicacion = comp.tipoUbicacion
                                    const apartamentoIDVDelComplemento = comp.apartamentoIDV

                                    if (!complementosAlojamientoPorTipo.hasOwnProperty(apartamentoIDVDelComplemento)) {
                                        complementosAlojamientoPorTipo[apartamentoIDVDelComplemento] = {
                                            tipoUbicacion: {
                                                porAlojamiento: [],
                                                porHabitacion: {}
                                            }
                                        }
                                    }

                                    const contenedorCom = complementosAlojamientoPorTipo[apartamentoIDVDelComplemento]
                                    const apartamentoUI = comp.apartamentoUI
                                    contenedorCom.apartamentoUI = apartamentoUI
                                    if (tipoUbicacion === "alojamiento") {
                                        contenedorCom.tipoUbicacion.porAlojamiento.push(comp)
                                    } else if (tipoUbicacion === "habitacion") {
                                        const habitacionIDV = comp.habitacionIDV
                                        const porHabitacion = contenedorCom.tipoUbicacion.porHabitacion
                                        if (!porHabitacion.hasOwnProperty(habitacionIDV)) {
                                            porHabitacion[habitacionIDV] = []
                                        }
                                        porHabitacion[habitacionIDV].push(comp)
                                    }
                                })

                                return complementosAlojamientoPorTipo

                            },
                            borrarContenedoresApartamentosObsoletos: function (data) {
                                const areaContendoresPorAlojamiento = data.cCR_renderizado
                                const apartamentosIDV_porRenderizar = data.apartamentosIDV_porRenderizar


                                const complementosUI_Renderizados = areaContendoresPorAlojamiento.querySelectorAll(`[contenedor=porAlojamiento]`)
                                complementosUI_Renderizados.forEach(c => {
                                    const apartamentoIDV = c.apartamentoIDV
                                    if (!apartamentosIDV_porRenderizar.includes(apartamentoIDV)) {
                                        c?.remove()
                                    }
                                });
                            },
                            borrarContenedoresComplementosEnAlojamientoObsoletoa: function (data) {
                                const contenedorAlojamiento = data.contenedorAlojamiento
                                const complementoUID_porRenderizar = data?.complementoUID_porRenderizar
                                const tipoUbicacion = data.tipoUbicacion


                                const areaContendoresPorAlojamiento = contenedorAlojamiento.querySelector(`[com=complementosDeAlojamiento][tipoUbicacion=${tipoUbicacion}] [com=contenedor]`)
                                if (areaContendoresPorAlojamiento) {
                                    const complementosUI_Renderizados = areaContendoresPorAlojamiento.querySelectorAll(`[complementouid_enreserva]`)
                                    complementosUI_Renderizados.forEach(c => {
                                        const complementouid_enreserva = c.complementouid_enreserva
                                        if (!complementoUID_porRenderizar.includes(complementouid_enreserva)) {
                                            c?.remove()
                                        }
                                    });
                                }

                            }
                        },
                    },
                    totales: function (data) {
                        const destino = data.destino
                        const totales = data.totales
                        const instanciaUID = data.instanciaUID
                        const totalNeto = totales?.totalNeto
                        const totalFinal = totales?.totalFinal
                        const totalDescuento = totales?.totalDescuento
                        const impuestosAplicados = totales?.impuestosAplicados
                        const totalNetoConDescuentos = totales?.totalNetoConDescuentos || totalNeto
                        const selector = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[entidad=complementosDelAlojamientos]")
                        if (!selector) { return }
                        const contenedorTotales_selector = document.querySelector(destino).querySelector("[contenedor=financiero] [entidad=complementosDelAlojamientos] [contenedor=data]").querySelector("[contenedor=totales]")
                        if (!contenedorTotales_selector) {
                            const totalesUI = document.createElement("div")
                            totalesUI.classList.add("reserva_resumen_desglose_pago_bloque")
                            totalesUI.setAttribute("contenedor", "totales")
                            totalesUI.setAttribute("componente", "plegable")
                            document.querySelector(destino).querySelector("[contenedor=financiero] [entidad=complementosDelAlojamientos] [contenedor=data]").appendChild(totalesUI)
                            const totalesUITituloBloque = document.createElement("div")
                            totalesUITituloBloque.classList.add("textoCentrado", "negrita", "padding6")
                            totalesUITituloBloque.textContent = "Totales de los complementos de alojamiento en la reserva (Solo complementos de alojamiento)"
                            totalesUI.appendChild(totalesUITituloBloque)
                        }
                        const contenedorTotales_renderizado = document.querySelector(destino).querySelector("[contenedor=financiero] [entidad=complementosDelAlojamientos] [contenedor=data]").querySelector("[contenedor=totales]")
                        const contenedorTotalesNeto_selector = contenedorTotales_renderizado.querySelector("[contenedor=totalesNeto]")
                        if (!contenedorTotalesNeto_selector) {
                            const contenedorTotalesNeto = document.createElement("div")
                            contenedorTotalesNeto.setAttribute("contenedor", "totalesNeto")
                            contenedorTotalesNeto.classList.add(
                                "backgroundGrey1",
                                "borderRadius8",
                                "flexVertical",
                                "padding6",
                                "gap6"
                            )
                            const contenedorTotalNetoUI = document.createElement("div")
                            contenedorTotalNetoUI.classList.add(
                                "flexVertical",
                                "padding6"
                            )
                            const totalReservaNetoUI = document.createElement("div")
                            totalReservaNetoUI.textContent = "Total complementos de alojamiento neto"
                            contenedorTotalNetoUI.appendChild(totalReservaNetoUI)
                            const totalReservaNetoUI_ = document.createElement("div")
                            totalReservaNetoUI_.setAttribute("dato", "totalNeto")
                            totalReservaNetoUI_.classList.add(
                                "negrita"
                            )
                            contenedorTotalNetoUI.appendChild(totalReservaNetoUI_)
                            contenedorTotalesNeto.appendChild(contenedorTotalNetoUI)
                            contenedorTotales_renderizado.appendChild(contenedorTotalesNeto)
                        }
                        const contenedorTotalesNeto_renderizado = contenedorTotales_renderizado.querySelector("[contenedor=totalesNeto]")
                        const totalNetoUI = contenedorTotalesNeto_renderizado.querySelector("[dato=totalNeto]")
                        totalNetoUI.textContent = totalNeto
                        const totalesDescuentos_selector = contenedorTotales_renderizado.querySelector("[contenedor=totalDescuentos]")
                        if (!totalesDescuentos_selector && totalDescuento) {
                            const contenedorTotalesDescuentos = document.createElement("div")
                            contenedorTotalesDescuentos.setAttribute("contenedor", "totalDescuentos")
                            contenedorTotalesDescuentos.classList.add(
                                "backgroundGrey1",
                                "borderRadius8",
                                "flexVertical",
                                "padding6",
                                "gap6"
                            )
                            contenedorTotales_renderizado.appendChild(contenedorTotalesDescuentos)
                            const contenedorTotalDescuentosAplicados = document.createElement("div")
                            contenedorTotalDescuentosAplicados.classList.add(
                                "flexVertical",
                                "padding6"
                            )
                            const totalDescuentosAplicadosUI = document.createElement("div")
                            totalDescuentosAplicadosUI.textContent = "Descuento total por todas las ofertas aplicadas exclusivamente a los complementos de alojamiento"
                            contenedorTotalDescuentosAplicados.appendChild(totalDescuentosAplicadosUI)
                            const totalDescuentosAplicadosUI_ = document.createElement("div")
                            totalDescuentosAplicadosUI_.classList.add("negrita")
                            totalDescuentosAplicadosUI_.setAttribute("dato", "totalConDescuentoAplicado")
                            contenedorTotalDescuentosAplicados.appendChild(totalDescuentosAplicadosUI_)
                            contenedorTotalesDescuentos.appendChild(contenedorTotalDescuentosAplicados)
                            const contenedorTotalNetoConDescuentos = document.createElement("div")
                            contenedorTotalNetoConDescuentos.classList.add(
                                "flexVertical",
                                "padding6"
                            )
                            const totalNetoConDescuentosUI = document.createElement("div")
                            totalNetoConDescuentosUI.textContent = "Total neto con descuentos aplicados"
                            contenedorTotalNetoConDescuentos.appendChild(totalNetoConDescuentosUI)
                            const totalNetoConDescuentosUI_ = document.createElement("div")
                            totalNetoConDescuentosUI_.classList.add("negrita")
                            totalNetoConDescuentosUI_.setAttribute("dato", "totalNetoConDescuentos")
                            contenedorTotalNetoConDescuentos.appendChild(totalNetoConDescuentosUI_)
                            contenedorTotalesDescuentos.appendChild(contenedorTotalNetoConDescuentos)
                        }
                        const totalesDescuentos_renderizado = contenedorTotales_renderizado.querySelector("[contenedor=totalDescuentos]")
                        if (!totalDescuento) {
                            totalesDescuentos_renderizado?.remove()
                        } else {
                            const totalConDescuentosAplicadosUI = totalesDescuentos_renderizado.querySelector("[dato=totalConDescuentoAplicado]")
                            totalConDescuentosAplicadosUI.textContent = totalDescuento
                            const totalConDescuentosUI = totalesDescuentos_renderizado.querySelector("[dato=totalNetoConDescuentos]")
                            totalConDescuentosUI.textContent = totalNetoConDescuentos
                        }
                        const contenedorTotalesFinal_selector = contenedorTotales_renderizado.querySelector("[contenedor=totalesFinal]")
                        if (!contenedorTotalesFinal_selector) {
                            const contenedorTotalesFinal = document.createElement("div")
                            contenedorTotalesFinal.setAttribute("contenedor", "totalesFinal")
                            contenedorTotalesFinal.classList.add(
                                "backgroundGrey1",
                                "borderRadius8",
                                "flexVertical",
                                "padding6",
                                "gap6"
                            )
                            contenedorTotales_renderizado.appendChild(contenedorTotalesFinal)
                            const contenedorTotalImpuestosAplicados = document.createElement("div")
                            contenedorTotalImpuestosAplicados.classList.add(
                                "flexVertical",
                                "padding6"
                            )
                            const totalImpuestosUI = document.createElement("div")
                            totalImpuestosUI.textContent = "Total impuestos aplicados exclusivamente a los complementos de alojamiento"
                            contenedorTotalImpuestosAplicados.appendChild(totalImpuestosUI)
                            const totalImpuestosUI_ = document.createElement("div")
                            totalImpuestosUI_.classList.add("negrita")
                            totalImpuestosUI_.setAttribute("dato", "impuestosAplicados")
                            contenedorTotalImpuestosAplicados.appendChild(totalImpuestosUI_)
                            contenedorTotalesFinal.appendChild(contenedorTotalImpuestosAplicados)
                            const contenedorTotalFinal = document.createElement("div")
                            contenedorTotalFinal.classList.add(
                                "flexVertical",
                                "padding6"
                            )
                            const totalConImpuestosUI = document.createElement("div")
                            totalConImpuestosUI.textContent = "Total final de los complementos de alojamiento"
                            contenedorTotalFinal.appendChild(totalConImpuestosUI)
                            const totalConImpuestosUI_ = document.createElement("div")
                            totalConImpuestosUI_.classList.add("negrita")
                            totalConImpuestosUI_.setAttribute("dato", "totalFinal")
                            contenedorTotalFinal.appendChild(totalConImpuestosUI_)
                            contenedorTotalesFinal.appendChild(contenedorTotalFinal)
                        }
                        const contenedorTotalesFinal_renderizado = contenedorTotales_renderizado.querySelector("[contenedor=totalesFinal]")
                        const impuestosAplicadosUI = contenedorTotalesFinal_renderizado.querySelector("[dato=impuestosAplicados]")
                        impuestosAplicadosUI.textContent = impuestosAplicados
                        const totalFinalUI = contenedorTotalesFinal_renderizado.querySelector("[dato=totalFinal]")
                        totalFinalUI.textContent = totalFinal
                    },
                },
                servicios: {
                    contenedor: function (data) {
                        const destino = data.destino
                        const desglosePorServicios = data.desglosePorServicios
                        const modoUI = data.modoUI
                        if (desglosePorServicios.length === 0 && modoUI === "plaza") {
                            document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[entidad=servicio]")?.remove()
                            return
                        }
                        const selector = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[entidad=servicio]")
                        if (!selector) {
                            const contenedorPlegable = document.createElement('details');
                            contenedorPlegable.classList.add("contenedorEntidad", "sobreControlAnimacionGlobal")
                            contenedorPlegable.setAttribute("entidad", "servicio")
                            const tituloContenedorPlegable = document.createElement('summary');
                            tituloContenedorPlegable.classList.add(
                                "padding12",
                            )
                            tituloContenedorPlegable.textContent = 'Servicios';
                            contenedorPlegable.appendChild(tituloContenedorPlegable)
                            const contenedor = document.createElement("div")
                            contenedor.setAttribute("contenedor", "data")
                            contenedorPlegable.appendChild(contenedor)
                            document.querySelector(destino).querySelector("[contenedor=financiero]").appendChild(contenedorPlegable)
                        }
                    },
                    porServicio: function (data) {
                        const destino = data.destino
                        const desglosePorServicios = data.desglosePorServicios
                        const selector = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[entidad=servicio]")
                        if (!selector) { return }
                        const porServicio_selector = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[entidad=servicio] [contenedor=data]").querySelector("[contenedor=porServicio]")
                        if (!porServicio_selector) {
                            const contenedor = document.createElement("div")
                            contenedor.classList.add(
                                "padding6",
                                "flexVertical",
                                "gap6"
                            )
                            contenedor.setAttribute("contenedor", "porServicio")
                            contenedor.setAttribute("componente", "plegable")
                            const tituloContendor = document.createElement("div")
                            tituloContendor.classList.add(
                                "negrita",
                                "textoCentrado",
                                "padding6"
                            )
                            tituloContendor.textContent = "Desglose por servicio"
                            contenedor.appendChild(tituloContendor)
                            document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[entidad=servicio] [contenedor=data]").appendChild(contenedor)
                        }
                        const porServicio_renderizado = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[entidad=servicio] [contenedor=data]").querySelector("[contenedor=porServicio]")

                        const servicioUIDControl = desglosePorServicios.map(s => s.servicio.servicioUID)

                        const serviciosUI_Renderizados = porServicio_renderizado.querySelectorAll("[servicioUID]")
                        serviciosUI_Renderizados.forEach((servicioUI) => {
                            const servicioUID = servicioUI.getAttribute("servicioUID")
                            if (!servicioUIDControl.includes(servicioUID)) {
                                servicioUI?.remove()
                            }
                        })
                        const numeroServiciosPorRenderizad = desglosePorServicios.length
                        if (numeroServiciosPorRenderizad === 0) {
                            const info_selector = porServicio_renderizado.querySelector("[componente=titulo]")
                            if (!info_selector) {
                                const info = document.createElement("p")
                                info.setAttribute("componente", "titulo")
                                info.textContent = "No hay servicios seleccionados"
                                info.classList.add("textoCentrado")
                                porServicio_renderizado.appendChild(info)
                            }
                        }
                        const serviciosRenderizados = porServicio_renderizado.querySelectorAll("[servicioUID]")
                        let posicion = 0
                        for (const contenedorServicio of desglosePorServicios) {
                            const servicio = contenedorServicio.servicio
                            const opcionesSolicitadasDelservicio = contenedorServicio.opcionesSolicitadasDelservicio
                            const totalesDelServicio = contenedorServicio.totalesDelServicio
                            const servicioUID_enReserva = servicio.servicioUID
                            const nombreInterno = servicio.nombre
                            const contenedor = servicio.contenedor
                            const definicionBase64 = contenedor.definicion
                            const definicion = casaVitini.utilidades.conversor.base64HaciaConTextDecoder(definicionBase64)
                            const fechaFinal = contenedor.fechaFinal
                            const duracionIDV = contenedor.duracionIDV
                            const fechaInicio = contenedor.fechaInicio
                            const tituloPublico = contenedor.tituloPublico
                            const disponibilidadIDV = contenedor.disponibilidadIDV
                            const gruposDeOpciones = contenedor.gruposDeOpciones
                            const fechaAdquisicionLocal = contenedor.fechaAdquisicionLocal

                            const contenedorServicioUI = document.createElement("div")
                            contenedorServicioUI.setAttribute("servicioUID", servicioUID_enReserva)

                            const diccionario = {
                                disponibilidad: {
                                    constante: "Disponible",
                                    variable: "Disponibilidad variable"
                                }
                            }
                            const existe = porServicio_renderizado.querySelector(`[servicioUID="${servicioUID_enReserva}"]`)
                            if (!existe) {
                                const elementosArray = Array.from(serviciosRenderizados);
                                porServicio_renderizado.insertBefore(contenedorServicioUI, elementosArray[posicion]);
                            }


                            const servicioUI = document.createElement("div")
                            servicioUI.setAttribute("servicioUID_enReserva", servicioUID_enReserva)
                            servicioUI.classList.add(
                                "flexVertical",
                                "backgroundGrey1",
                                "borderRadius18",
                                "gap6", "padding6"
                            )
                            const contenedorData = document.createElement("details")
                            contenedorData.classList.add(
                                "flexVertical",
                                "padding6"
                            )
                            servicioUI.appendChild(contenedorData)


                            const tituloPublicoData = document.createElement("summary")
                            tituloPublicoData.classList.add("negrita", "padding10")
                            tituloPublicoData.textContent = `${tituloPublico}`
                            contenedorData.appendChild(tituloPublicoData)

                            const contenedorInterno = document.createElement("div")
                            contenedorInterno.style.paddingLeft = "24px"
                            contenedorInterno.classList.add(
                                "flexVertical",
                                "padding6",
                                "gap6"
                            )
                            contenedorData.appendChild(contenedorInterno)



                            if (nombreInterno) {
                                const contenedorNombreInterno = document.createElement("div")
                                contenedorNombreInterno.classList.add("flexVertical")
                                contenedorInterno.appendChild(contenedorNombreInterno)

                                const nombreInternoTitulo = document.createElement("p")
                                nombreInternoTitulo.textContent = `Nombre interno`
                                nombreInternoTitulo.classList.add("negrita")
                                contenedorNombreInterno.appendChild(nombreInternoTitulo)

                                const nombreInternoData = document.createElement("p")
                                nombreInternoData.textContent = nombreInterno
                                contenedorNombreInterno.appendChild(nombreInternoData)
                            }



                            const contenedorNombrePublico = document.createElement("div")
                            contenedorNombrePublico.classList.add("flexVertical")
                            contenedorInterno.appendChild(contenedorNombrePublico)


                            const tituluNombrePublico = document.createElement("p")
                            tituluNombrePublico.classList.add("negrita")

                            tituluNombrePublico.textContent = `Nombre público`
                            contenedorNombrePublico.appendChild(tituluNombrePublico)
                            const titulo = document.createElement("p")
                            titulo.textContent = tituloPublico
                            contenedorNombrePublico.appendChild(titulo)




                            const contenedorEstadoDisponibilidad = document.createElement("div")
                            contenedorEstadoDisponibilidad.classList.add("flexVertical")
                            contenedorInterno.appendChild(contenedorEstadoDisponibilidad)


                            const tituloEstadoDisponibilidad = document.createElement("p")
                            tituloEstadoDisponibilidad.textContent = `Estado de la disponibilidad2`
                            tituloEstadoDisponibilidad.classList.add("negrita")
                            contenedorEstadoDisponibilidad.appendChild(tituloEstadoDisponibilidad)

                            const disponibilidadUI = document.createElement("p")
                            disponibilidadUI.textContent = diccionario.disponibilidad[disponibilidadIDV]
                            contenedorEstadoDisponibilidad.appendChild(disponibilidadUI)


                            if (disponibilidadIDV === "variable") {
                                const info = document.createElement("p")
                                info.classList.add()
                                info.textContent = `Este servicio tiene una disponibilidad limitada. Es por eso que si selecciona este servicio, nos pondremos en contacto con el titular de la reserva en las próximas horas para confirmarle la disponibilidad del servicio para su reserva.`
                                contenedorEstadoDisponibilidad.appendChild(info)
                            }
                            // const precioUI = document.createElement("p")
                            // precioUI.classList.add(
                            //     "negrita"
                            // )
                            // precioUI.textContent = precio + "$"
                            // contenedorData.appendChild(precioUI)
                            if (duracionIDV === "rango") {
                                const contenedorDuracion = document.createElement("div")
                                contenedorDuracion.classList.add(
                                    "flexVertical",
                                )
                                contenedorInterno.appendChild(contenedorDuracion)
                                const info = document.createElement("p")
                                info.classList.add("negrita")
                                info.textContent = `Servicio disponible solo desde ${fechaInicio} hata ${fechaFinal}. Ambas fechas incluidas.`
                                contenedorDuracion.appendChild(info)
                            }

                            const fechaContenedor = document.createElement("div")
                            fechaContenedor.classList.add("flexVertical")
                            contenedorInterno.appendChild(fechaContenedor)

                            const fechaInfo = document.createElement("p")
                            fechaInfo.classList.add("negrita")
                            fechaInfo.textContent = "Fecha del adquisición"
                            fechaContenedor.appendChild(fechaInfo)

                            const fechaData = document.createElement("p")
                            fechaData.classList.add()
                            fechaData.textContent = fechaAdquisicionLocal
                            fechaContenedor.appendChild(fechaData)


                            const contenedorTotalServicio = document.createElement("div")
                            contenedorTotalServicio.classList.add("flexVertical")
                            contenedorInterno.appendChild(contenedorTotalServicio)


                            const totaleDelServicioUIInfo = document.createElement("p")
                            totaleDelServicioUIInfo.textContent = `Total del servicio`
                            totaleDelServicioUIInfo.classList.add("negrita")
                            contenedorTotalServicio.appendChild(totaleDelServicioUIInfo)

                            const totaleDelServicioUI = document.createElement("p")
                            totaleDelServicioUI.textContent = totalesDelServicio.global.totalServicio
                            contenedorTotalServicio.appendChild(totaleDelServicioUI)


                            const contenedorDefinicion = document.createElement("details")
                            contenedorDefinicion.classList.add("flexVertical", "padding6")
                            servicioUI.appendChild(contenedorDefinicion)

                            const tituloDefinicion = document.createElement("summary")
                            tituloDefinicion.classList.add("padding10")
                            tituloDefinicion.textContent = "Descripción del servicio"
                            contenedorDefinicion.appendChild(tituloDefinicion)

                            const definicionUI = document.createElement("pre")
                            definicionUI.classList.add(
                                "padding10",
                                "whiteSpace"
                            )
                            definicionUI.textContent = definicion + "--"
                            contenedorDefinicion.appendChild(definicionUI)




                            const superContenedorOSUI = document.createElement("details")
                            superContenedorOSUI.classList.add("padding6")
                            servicioUI.appendChild(superContenedorOSUI)


                            const tituloOSUI = document.createElement("summary")
                            tituloOSUI.classList.add("padding10")
                            tituloOSUI.textContent = "Opciones selecionadas"
                            superContenedorOSUI.appendChild(tituloOSUI)

                            const contenedorOSUI = document.createElement("div")
                            contenedorOSUI.classList.add("flexVertical", "gap6")
                            superContenedorOSUI.appendChild(contenedorOSUI)



                            Object.entries(gruposDeOpciones).forEach(([grupoIDV, gDP]) => {
                                const nombreGrupo = gDP.nombreGrupo
                                const opcionesGrupo = gDP.opcionesGrupo

                                const selectorOpcionesGrupo = opcionesSolicitadasDelservicio.opcionesSeleccionadas[grupoIDV] || []

                                const contenedorGrupo = document.createElement("div")
                                contenedorGrupo.setAttribute("grupoIDV", grupoIDV)
                                contenedorGrupo.classList.add(
                                    "flexVertical", "gap6", "borderGrey1", "borderRadius14", "padding6"
                                )
                                const tituloGrupo = document.createElement("p")
                                tituloGrupo.classList.add("negrita", "padding10")
                                tituloGrupo.textContent = nombreGrupo
                                contenedorGrupo.appendChild(tituloGrupo)
                                const contenedorOpcionesGrupo = document.createElement("div")
                                contenedorOpcionesGrupo.classList.add(
                                    "flexVertical", "gap6"
                                )
                                contenedorGrupo.appendChild(contenedorOpcionesGrupo)
                                opcionesGrupo.forEach((op) => {
                                    const opcionIDV = op.opcionIDV
                                    const nombreOpcion = op.nombreOpcion
                                    const precioOpcion = op?.precioOpcion ? op?.precioOpcion + "$" : "0.00$ (Sin coste añadido)"
                                    const controlSelctorOpcionesGrupo = selectorOpcionesGrupo.find(g => g.opcionIDV === opcionIDV);

                                    if (controlSelctorOpcionesGrupo) {
                                        const cantidad = controlSelctorOpcionesGrupo.cantidad
                                        const tipoDescuento = controlSelctorOpcionesGrupo.tipoDescuento
                                        const cantidadDescuento = controlSelctorOpcionesGrupo.cantidadDescuento

                                        const contenedorOpcion = document.createElement("div")
                                        contenedorOpcion.classList.add(
                                            "flexVertical", "gap6", "backgroundGrey1", "borderRadius10", "padding14"
                                        )
                                        contenedorOpcionesGrupo.appendChild(contenedorOpcion)
                                        const grupoRenderizado_selector = contenedorData.querySelector(`[grupoIDV="${grupoIDV}"]`)
                                        if (!grupoRenderizado_selector) {
                                            contenedorOSUI.appendChild(contenedorGrupo)
                                        }
                                        const opcionUI = document.createElement("p")
                                        opcionUI.setAttribute("opcionIDV", opcionIDV)
                                        opcionUI.textContent = `${nombreOpcion}`
                                        contenedorOpcion.appendChild(opcionUI)

                                        const contenedorPrecioUnidad = document.createElement("div")
                                        contenedorPrecioUnidad.classList.add("flexVertical")
                                        contenedorOpcion.appendChild(contenedorPrecioUnidad)

                                        const tituloPrecioUnidad = document.createElement("p")
                                        tituloPrecioUnidad.textContent = `Precio de la opción`
                                        contenedorPrecioUnidad.appendChild(tituloPrecioUnidad)


                                        const precioUI = document.createElement("p")
                                        precioUI.setAttribute("opcionIDV", opcionIDV)
                                        precioUI.classList.add("negrita")
                                        precioUI.textContent = precioOpcion
                                        contenedorPrecioUnidad.appendChild(precioUI)


                                        const contenedorCantidad = document.createElement("div")
                                        contenedorCantidad.classList.add("flexVertical")
                                        contenedorOpcion.appendChild(contenedorCantidad)


                                        const tituloCantidad = document.createElement("p")
                                        tituloCantidad.textContent = `Cantidad`
                                        contenedorCantidad.appendChild(tituloCantidad)


                                        const cantidadUI = document.createElement("p")
                                        cantidadUI.setAttribute("opcionIDV", opcionIDV)
                                        cantidadUI.classList.add("negrita")
                                        cantidadUI.textContent = `${cantidad}`
                                        contenedorCantidad.appendChild(cantidadUI)


                                        const tiposDescuentos = [
                                            "porcentaje",
                                            "cantidad"
                                        ]

                                        if (tiposDescuentos.includes(tipoDescuento)) {

                                            const contenedorDescuento = document.createElement("div")
                                            contenedorDescuento.classList.add("flexVertical")
                                            contenedorOpcion.appendChild(contenedorDescuento)


                                            const tituloDescuento = document.createElement("p")
                                            tituloDescuento.textContent = `Descuento aplicado por ${tipoDescuento}`
                                            contenedorDescuento.appendChild(tituloDescuento)


                                            const cantidaDescuentodUI = document.createElement("p")
                                            cantidaDescuentodUI.classList.add("negrita")
                                            cantidaDescuentodUI.textContent = `${cantidadDescuento}`
                                            contenedorDescuento.appendChild(cantidaDescuentodUI)

                                        }




                                        const contenedorPrecioOpcionTotal = document.createElement("div")
                                        contenedorPrecioOpcionTotal.classList.add("flexVertical")
                                        contenedorOpcion.appendChild(contenedorPrecioOpcionTotal)


                                        const tituloPrecioOpcionTotal = document.createElement("p")
                                        tituloPrecioOpcionTotal.textContent = `Precio de la opción total con cantidades`
                                        contenedorPrecioOpcionTotal.appendChild(tituloPrecioOpcionTotal)

                                        const totalOpcion = totalesDelServicio.porGruposDeOpciones[grupoIDV][opcionIDV].total

                                        const precioTotalOpcionUI = document.createElement("p")
                                        precioTotalOpcionUI.setAttribute("opcionIDV", opcionIDV)
                                        precioTotalOpcionUI.classList.add("negrita")
                                        precioTotalOpcionUI.textContent = totalOpcion
                                        contenedorPrecioOpcionTotal.appendChild(precioTotalOpcionUI)

                                    }
                                })
                            })
                            contenedorServicioUI.appendChild(servicioUI)

                            posicion++
                        }
                    },
                    totales: function (data) {
                        const destino = data.destino
                        const totales = data.totales
                        const instanciaUID = data.instanciaUID
                        const totalNeto = totales?.totalNeto
                        const totalFinal = totales?.totalFinal
                        const totalDescuento = totales?.totalDescuento
                        const impuestosAplicados = totales?.impuestosAplicados
                        const totalNetoConDescuentos = totales?.totalNetoConDescuentos || totalNeto
                        const selector = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[entidad=servicio]")
                        if (!selector) { return }
                        const contenedorTotales_selector = document.querySelector(destino).querySelector("[contenedor=financiero] [entidad=servicio] [contenedor=data]").querySelector("[contenedor=totales]")
                        if (!contenedorTotales_selector) {
                            const totalesUI = document.createElement("div")
                            totalesUI.classList.add("reserva_resumen_desglose_pago_bloque")
                            totalesUI.setAttribute("contenedor", "totales")
                            totalesUI.setAttribute("componente", "plegable")
                            document.querySelector(destino).querySelector("[contenedor=financiero] [entidad=servicio] [contenedor=data]").appendChild(totalesUI)
                            const totalesUITituloBloque = document.createElement("div")
                            totalesUITituloBloque.classList.add("reserva_resumen_desglose_pago_titulo")
                            totalesUITituloBloque.textContent = "Totales de los servicios en la reserva (Solo servicios)"
                            totalesUI.appendChild(totalesUITituloBloque)
                        }
                        const contenedorTotales_renderizado = document.querySelector(destino).querySelector("[contenedor=financiero] [entidad=servicio] [contenedor=data]").querySelector("[contenedor=totales]")
                        const contenedorTotalesNeto_selector = contenedorTotales_renderizado.querySelector("[contenedor=totalesNeto]")
                        if (!contenedorTotalesNeto_selector) {
                            const contenedorTotalesNeto = document.createElement("div")
                            contenedorTotalesNeto.setAttribute("contenedor", "totalesNeto")
                            contenedorTotalesNeto.classList.add(
                                "backgroundGrey1",
                                "borderRadius8",
                                "flexVertical",
                                "padding6",
                                "gap6"
                            )
                            const contenedorTotalNetoUI = document.createElement("div")
                            contenedorTotalNetoUI.classList.add(
                                "flexVertical",
                                "padding6"
                            )
                            const totalReservaNetoUI = document.createElement("div")
                            totalReservaNetoUI.textContent = "Total servicios neto"
                            contenedorTotalNetoUI.appendChild(totalReservaNetoUI)
                            const totalReservaNetoUI_ = document.createElement("div")
                            totalReservaNetoUI_.setAttribute("dato", "totalNeto")
                            totalReservaNetoUI_.classList.add(
                                "negrita"
                            )
                            contenedorTotalNetoUI.appendChild(totalReservaNetoUI_)
                            contenedorTotalesNeto.appendChild(contenedorTotalNetoUI)
                            contenedorTotales_renderizado.appendChild(contenedorTotalesNeto)
                        }
                        const contenedorTotalesNeto_renderizado = contenedorTotales_renderizado.querySelector("[contenedor=totalesNeto]")
                        const totalNetoUI = contenedorTotalesNeto_renderizado.querySelector("[dato=totalNeto]")
                        totalNetoUI.textContent = totalNeto
                        const totalesDescuentos_selector = contenedorTotales_renderizado.querySelector("[contenedor=totalDescuentos]")
                        if (!totalesDescuentos_selector && totalDescuento) {
                            const contenedorTotalesDescuentos = document.createElement("div")
                            contenedorTotalesDescuentos.setAttribute("contenedor", "totalDescuentos")
                            contenedorTotalesDescuentos.classList.add(
                                "backgroundGrey1",
                                "borderRadius8",
                                "flexVertical",
                                "padding6",
                                "gap6"
                            )
                            contenedorTotales_renderizado.appendChild(contenedorTotalesDescuentos)
                            const contenedorTotalDescuentosAplicados = document.createElement("div")
                            contenedorTotalDescuentosAplicados.classList.add(
                                "flexVertical",
                                "padding6"
                            )
                            const totalDescuentosAplicadosUI = document.createElement("div")
                            totalDescuentosAplicadosUI.textContent = "Descuento total por todas las ofertas aplicadas exclusivamente a los servicios"
                            contenedorTotalDescuentosAplicados.appendChild(totalDescuentosAplicadosUI)
                            const totalDescuentosAplicadosUI_ = document.createElement("div")
                            totalDescuentosAplicadosUI_.classList.add("negrita")
                            totalDescuentosAplicadosUI_.setAttribute("dato", "totalConDescuentoAplicado")
                            contenedorTotalDescuentosAplicados.appendChild(totalDescuentosAplicadosUI_)
                            contenedorTotalesDescuentos.appendChild(contenedorTotalDescuentosAplicados)
                            const contenedorTotalNetoConDescuentos = document.createElement("div")
                            contenedorTotalNetoConDescuentos.classList.add(
                                "flexVertical",
                                "padding6"
                            )
                            const totalNetoConDescuentosUI = document.createElement("div")
                            totalNetoConDescuentosUI.textContent = "Total neto con descuentos aplicados"
                            contenedorTotalNetoConDescuentos.appendChild(totalNetoConDescuentosUI)
                            const totalNetoConDescuentosUI_ = document.createElement("div")
                            totalNetoConDescuentosUI_.classList.add("negrita")
                            totalNetoConDescuentosUI_.setAttribute("dato", "totalNetoConDescuentos")
                            contenedorTotalNetoConDescuentos.appendChild(totalNetoConDescuentosUI_)
                            contenedorTotalesDescuentos.appendChild(contenedorTotalNetoConDescuentos)
                        }
                        const totalesDescuentos_renderizado = contenedorTotales_renderizado.querySelector("[contenedor=totalDescuentos]")
                        if (!totalDescuento) {
                            totalesDescuentos_renderizado?.remove()
                        } else {
                            const totalConDescuentosAplicadosUI = totalesDescuentos_renderizado.querySelector("[dato=totalConDescuentoAplicado]")
                            totalConDescuentosAplicadosUI.textContent = totalDescuento
                            const totalConDescuentosUI = totalesDescuentos_renderizado.querySelector("[dato=totalNetoConDescuentos]")
                            totalConDescuentosUI.textContent = totalNetoConDescuentos
                        }
                        const contenedorTotalesFinal_selector = contenedorTotales_renderizado.querySelector("[contenedor=totalesFinal]")
                        if (!contenedorTotalesFinal_selector) {
                            const contenedorTotalesFinal = document.createElement("div")
                            contenedorTotalesFinal.setAttribute("contenedor", "totalesFinal")
                            contenedorTotalesFinal.classList.add(
                                "backgroundGrey1",
                                "borderRadius8",
                                "flexVertical",
                                "padding6",
                                "gap6"
                            )
                            contenedorTotales_renderizado.appendChild(contenedorTotalesFinal)
                            const contenedorTotalImpuestosAplicados = document.createElement("div")
                            contenedorTotalImpuestosAplicados.classList.add(
                                "flexVertical",
                                "padding6"
                            )
                            const totalImpuestosUI = document.createElement("div")
                            totalImpuestosUI.textContent = "Total impuestos aplicados exclusivamente a los servicios"
                            contenedorTotalImpuestosAplicados.appendChild(totalImpuestosUI)
                            const totalImpuestosUI_ = document.createElement("div")
                            totalImpuestosUI_.classList.add("negrita")
                            totalImpuestosUI_.setAttribute("dato", "impuestosAplicados")
                            contenedorTotalImpuestosAplicados.appendChild(totalImpuestosUI_)
                            contenedorTotalesFinal.appendChild(contenedorTotalImpuestosAplicados)
                            const contenedorTotalFinal = document.createElement("div")
                            contenedorTotalFinal.classList.add(
                                "flexVertical",
                                "padding6"
                            )
                            const totalConImpuestosUI = document.createElement("div")
                            totalConImpuestosUI.textContent = "Total final de los servicios"
                            contenedorTotalFinal.appendChild(totalConImpuestosUI)
                            const totalConImpuestosUI_ = document.createElement("div")
                            totalConImpuestosUI_.classList.add("negrita")
                            totalConImpuestosUI_.setAttribute("dato", "totalFinal")
                            contenedorTotalFinal.appendChild(totalConImpuestosUI_)
                            contenedorTotalesFinal.appendChild(contenedorTotalFinal)
                        }
                        const contenedorTotalesFinal_renderizado = contenedorTotales_renderizado.querySelector("[contenedor=totalesFinal]")
                        const impuestosAplicadosUI = contenedorTotalesFinal_renderizado.querySelector("[dato=impuestosAplicados]")
                        impuestosAplicadosUI.textContent = impuestosAplicados
                        const totalFinalUI = contenedorTotalesFinal_renderizado.querySelector("[dato=totalFinal]")
                        totalFinalUI.textContent = totalFinal
                    },
                }
            },
            ofertas: {
                hub: function (data) {
                    const destino = data.destino
                    const instanciaUID = data.instanciaUID
                    const contenedorOfertas = data.contenedorOfertas
                    const ofertas = contenedorOfertas.ofertas
                    const porTotal = contenedorOfertas.entidades.reserva.desgloses.porTotal
                    const entidades = contenedorOfertas.entidades
                    this.ofertaUI({
                        destino,
                        ofertas,
                        porTotal,
                        entidades,
                        instanciaUID
                    })
                },
                ofertaUI: function (data) {
                    const destino = data.destino
                    const ofertas = data.ofertas
                    const ofertasPorCondicion = ofertas.porCondicion
                    const ofertasPorAdministrador = ofertas.porAdministrador
                    const porTotal = data.porTotal
                    const entidades = data.entidades
                    const ofertasPorCondicionArray = Object.keys(ofertasPorCondicion)
                    const ofertasPorAdministradorArray = Object.keys(ofertasPorAdministrador)
                    const contenedorFinanciero = document.querySelector(destino).querySelector("[contenedor=financiero]")
                    const modoUI = contenedorFinanciero.getAttribute("modoUI")
                    const instanciaUID = data.instanciaUID
                    if (ofertasPorCondicionArray.length === 0
                        &&
                        ofertasPorAdministradorArray.length === 0
                        && modoUI === "plaza") {
                        document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[contenedor=ofertas]")?.remove()
                        return
                    }
                    const contenedorOfertas_selector = contenedorFinanciero.querySelector("[contenedor=ofertas]")
                    if (!contenedorOfertas_selector) {
                        const contenedorPlegable = document.createElement("details")
                        contenedorPlegable.classList.add("contenedorEntidad", "sobreControlAnimacionGlobal")
                        contenedorPlegable.setAttribute("contenedor", "ofertas")
                        contenedorPlegable.setAttribute("componente", "plegable")
                        // contenedorPlegable.classList.add(
                        //     "flexVertical",
                        //     "gap6",
                        // )
                        contenedorFinanciero.appendChild(contenedorPlegable)
                        const tituloContendor = document.createElement("summary")
                        tituloContendor.classList.add(
                            "padding12",
                        )
                        tituloContendor.textContent = "Ofertas aplicadas"
                        contenedorPlegable.appendChild(tituloContendor)
                        const contenedor = document.createElement("div")
                        contenedor.setAttribute("contenedor", "data")
                        contenedor.classList.add(
                            "flexVertical",
                            "gap6",
                        )
                        contenedorPlegable.appendChild(contenedor)
                        if (modoUI === "administracion") {
                            const contenedorBotones = document.createElement("div")
                            contenedorBotones.classList.add(
                                "flexHorizontal",
                                "gap6"
                            )
                            contenedor.appendChild(contenedorBotones)

                            const botonInsertarDescuento = document.createElement("div")
                            botonInsertarDescuento.classList.add(
                                "botonV3",
                                "comportamientoBoton"
                            )
                            botonInsertarDescuento.textContent = "Insertar descuento arbitrario"
                            botonInsertarDescuento.addEventListener("click", () => {
                                casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.desgloseTotal.componentesUI.insertarDescuentos.ui({
                                    instanciaUID_contenedorFinanciero: instanciaUID
                                })
                            })
                            contenedorBotones.appendChild(botonInsertarDescuento)

                            const botonDescuentosCompatibles = document.createElement("div")
                            botonDescuentosCompatibles.classList.add(
                                "botonV3",
                                "comportamientoBoton"
                            )
                            botonDescuentosCompatibles.textContent = "Descuentos compatibles"
                            botonDescuentosCompatibles.addEventListener("click", () => {
                                casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.desgloseTotal.componentesUI.insertarOfertasCompatibles.ui({
                                    instanciaUID_contenedorFinanciero: instanciaUID
                                })
                            })
                            contenedorBotones.appendChild(botonDescuentosCompatibles)

                            const botonDescuentoDedicado = document.createElement("div")
                            botonDescuentoDedicado.classList.add(
                                "botonV3",
                                "comportamientoBoton"
                            )
                            botonDescuentoDedicado.textContent = "Crear e insertar descuento dedicado"
                            botonDescuentoDedicado.addEventListener("click", (e) => {
                                casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.desgloseTotal.componentesUI.insertarDescuentoDedicado.ui({
                                    e
                                })

                            })
                            contenedorBotones.appendChild(botonDescuentoDedicado)

                        }
                        if (modoUI === "simulador") {
                            const contenedorBotones = document.createElement("div")
                            contenedorBotones.classList.add(
                                "flexHorizontal",
                                "gap6",
                            )
                            contenedor.appendChild(contenedorBotones)


                            const botonInsertarDescuento = document.createElement("div")
                            botonInsertarDescuento.classList.add(
                                "botonV3",
                                "comportamientoBoton"
                            )
                            botonInsertarDescuento.textContent = "Insertar descuento"
                            botonInsertarDescuento.addEventListener("click", () => {
                                casaVitini.view.detallesSimulacion.componentesUI.insertarDescuentos.ui({
                                    instanciaUID_contenedorFinanciero: instanciaUID
                                })
                            })
                            contenedorBotones.appendChild(botonInsertarDescuento)
                            const botonDescuentosCompatibles = document.createElement("div")
                            botonDescuentosCompatibles.classList.add(
                                "botonV3",
                                "comportamientoBoton"
                            )
                            botonDescuentosCompatibles.textContent = "Descuentos compatibles"
                            botonDescuentosCompatibles.addEventListener("click", () => {
                                casaVitini.view.detallesSimulacion.componentesUI.insertarOfertasCompatibles.ui({
                                    instanciaUID_contenedorFinanciero: instanciaUID
                                })
                            })
                            contenedorBotones.appendChild(botonDescuentosCompatibles)

                            const botonDescuentoDedicado = document.createElement("div")
                            botonDescuentoDedicado.classList.add(
                                "botonV3",
                                "comportamientoBoton"
                            )
                            botonDescuentoDedicado.textContent = "Crear e insertar descuento dedicado"
                            botonDescuentoDedicado.addEventListener("click", (e) => {
                                casaVitini.view.detallesSimulacion.componentesUI.insertarDescuentoDedicado.ui({
                                    e
                                })

                            })
                            contenedorBotones.appendChild(botonDescuentoDedicado)
                        }
                    }
                    const contenedorListaOfertas_selector = document.querySelector(destino).querySelector("[contenedor=financiero]")
                        .querySelector("[contenedor=ofertas]")
                        .querySelector("[contenedor=data]")
                        .querySelector("[contenedor=listaOfertas]")
                    if (!contenedorListaOfertas_selector) {
                        const contenedorOfertasRenderizado = document.querySelector(destino).querySelector("[contenedor=financiero]")
                            .querySelector("[contenedor=ofertas]")
                            .querySelector("[contenedor=data]")
                        const contenedorListaOfertas = document.createElement("div")
                        contenedorListaOfertas.setAttribute("contenedor", "listaOfertas")
                        contenedorListaOfertas.classList.add(
                            "flexVertical",
                            "gap6"
                        )
                        contenedorOfertasRenderizado.appendChild(contenedorListaOfertas)
                    }
                    const contenedorListaOfertas_renderizado = document.querySelector(destino).querySelector("[contenedor=financiero]")
                        .querySelector("[contenedor=ofertas]")
                        .querySelector("[contenedor=data]")
                        .querySelector("[contenedor=listaOfertas]")
                    this.componentesUI.utilidades.limpiarOfertasObsoletas({
                        contenedores: ofertasPorCondicion,
                        origen: "porCondicion",
                        destino
                    })
                    this.componentesUI.utilidades.limpiarOfertasObsoletas({
                        contenedores: ofertasPorAdministrador,
                        origen: "porAdministrador",
                        destino
                    })
                    if (ofertasPorAdministradorArray.length === 0) {
                        contenedorListaOfertas_renderizado?.querySelector(`[contenedor=porAdministrador]`)?.remove()
                    }
                    if (ofertasPorCondicionArray.length === 0) {
                        contenedorListaOfertas_renderizado?.querySelector(`[contenedor=porCondicion]`)?.remove()
                    }
                    if (ofertasPorAdministradorArray.length === 0
                        &&
                        ofertasPorCondicionArray.length === 0
                    ) {
                        document.querySelector(destino).querySelector("[contenedor=financiero]")
                            .querySelector("[contenedor=ofertas]")
                            .querySelector("[contenedor=data]")
                            ?.querySelector("[contenedor=listaOfertas]")?.remove()
                    }
                    ofertasPorCondicion.forEach((contenedorOferta, posicion) => {
                        const selectorContenedorPorCondicion = contenedorListaOfertas_renderizado.querySelector(`[contenedor=porCondicion]`)
                        if (!selectorContenedorPorCondicion) {
                            const contenedorPorCondicion = document.createElement("div")
                            contenedorPorCondicion.setAttribute("contenedor", "porCondicion")
                            contenedorPorCondicion.classList.add(
                                "flexVertical",
                                "padding6",
                                "gap6",
                                "borderGrey1",
                                "borderRadius12"
                            )
                            const tituloContendor = document.createElement("div")
                            tituloContendor.classList.add(
                                "negrita",
                                "textoCentrado",
                            )
                            tituloContendor.textContent = "Ofertas aplicadas por condición"
                            contenedorPorCondicion.appendChild(tituloContendor)
                            contenedorListaOfertas_renderizado.appendChild(contenedorPorCondicion)
                        }
                        this.componentesUI.globalUI({
                            destino,
                            destinoOrigenOferta: "porCondicion",
                            contenedorOferta,
                            posicion
                        })
                        this.componentesUI.condicionesUI({
                            destino,
                            contenedorOferta,
                            destinoOrigenOferta: "porCondicion"
                        })
                        this.componentesUI.descuentosUI({
                            destino,
                            destinoOrigenOferta: "porCondicion",
                            contenedorOferta
                        })
                    })
                    ofertasPorAdministrador.forEach((contenedorOferta, posicion) => {
                        const selectorContenedorPorAdministrador = contenedorListaOfertas_renderizado?.querySelector(`[contenedor=porAdministrador]`)
                        if (!selectorContenedorPorAdministrador) {
                            const contenedorPorAdministrador = document.createElement("div")
                            contenedorPorAdministrador.setAttribute("contenedor", "porAdministrador")
                            contenedorPorAdministrador.classList.add(
                                "flexVertical",
                                "padding6",
                                "gap6",
                                "borderGrey1",
                                "borderRadius12"
                            )
                            const tituloContendor = document.createElement("div")
                            tituloContendor.classList.add(
                                "negrita",
                                "textoCentrado",
                            )
                            tituloContendor.textContent = "Ofertas aplicadas por administrador"
                            contenedorPorAdministrador.appendChild(tituloContendor)
                            contenedorListaOfertas_renderizado.appendChild(contenedorPorAdministrador)
                        }
                        this.componentesUI.globalUI({
                            destino,
                            destinoOrigenOferta: "porAdministrador",
                            contenedorOferta,
                            posicion
                        })
                        this.componentesUI.condicionesUI({
                            destino,
                            contenedorOferta,
                            destinoOrigenOferta: "porAdministrador"
                        })
                        this.componentesUI.descuentosUI({
                            destino,
                            destinoOrigenOferta: "porAdministrador",
                            contenedorOferta
                        })
                    })
                    this.porTotal({
                        destino,
                        porTotal
                    })
                    this.entidades.hub({
                        destino,
                        entidades
                    })
                },
                componentesUI: {
                    globalUI: function (data) {
                        const destino = data.destino
                        const destinoOrigenOferta = data.destinoOrigenOferta
                        const posicion = data?.posicion + 1
                        const contenedorOferta = data.contenedorOferta
                        const oferta = contenedorOferta.oferta
                        const contenedorFinanciero = document.querySelector(destino).querySelector("[contenedor=financiero]")
                        const modoUI = contenedorFinanciero.getAttribute("modoUI")
                        const autorizacion = contenedorOferta?.autorizacion
                        const ofertaUID = oferta.ofertaUID
                        const entidadIDV = oferta.entidadIDV
                        const fechaFinal = oferta.fechaFinal
                        const fechaInicio = oferta.fechaInicio
                        const nombreOferta = oferta.nombreOferta
                        const autorizacionUI = (autorizacion) => {
                            if (autorizacion === "aceptada") {
                                return "Aceptada"
                            } else if (autorizacion === "rechazada") {
                                return "Rechazada"
                            }
                        }
                        const entidadUI_ = (entidadIDV) => {
                            if (entidadIDV === "reserva") {
                                return "Reserva"
                            }
                        }
                        const contenedorOfertaUI_selector = document.querySelector(destino)
                            .querySelector("[contenedor=financiero]")
                            .querySelector("[contenedor=ofertas]")
                            .querySelector("[contenedor=data]")
                            .querySelector(`[contenedor=${destinoOrigenOferta}]`)
                            .querySelector(`[ofertaUID="${ofertaUID}"][posicion="${posicion}"]`)
                        if (!contenedorOfertaUI_selector) {
                            const contenedorOfertaUI = document.createElement("div")
                            contenedorOfertaUI.classList.add("contenedorOfertaUI")
                            contenedorOfertaUI.setAttribute("ofertaUID", ofertaUID)
                            contenedorOfertaUI.setAttribute("posicion", posicion)
                            contenedorOfertaUI.classList.add(
                                "flexVertical",
                                "padding6",
                                "gap6",
                                "borderGrey1",
                                "borderRadius10"
                            )
                            document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[contenedor=ofertas] [contenedor=data]")
                                .querySelector(`[contenedor=${destinoOrigenOferta}]`)
                                .appendChild(contenedorOfertaUI)
                            const contenedorGlobalOferta = document.createElement("div")
                            contenedorGlobalOferta.classList.add(
                                "flexVertical",
                                "gap6"
                            )
                            contenedorOfertaUI.appendChild(contenedorGlobalOferta)
                            const nombreOfertaUI = document.createElement("div")
                            nombreOfertaUI.setAttribute("dato", "nombre")
                            nombreOfertaUI.classList.add(
                                "negrita",
                                "padding6"
                            )
                            contenedorGlobalOferta.appendChild(nombreOfertaUI)
                            const contenedorUID = document.createElement("div")
                            contenedorUID.classList.add(
                                "padding6"
                            )
                            const tituloUID = document.createElement("div")
                            tituloUID.textContent = "UID"
                            contenedorUID.appendChild(tituloUID)
                            const ofertaUID_UI = document.createElement("div")
                            ofertaUID_UI.classList.add("negrita")
                            ofertaUID_UI.setAttribute("dato", "ofertaUID")
                            contenedorUID.appendChild(ofertaUID_UI)
                            contenedorGlobalOferta.appendChild(contenedorUID)
                            const contenedorEntidad = document.createElement("div")
                            contenedorEntidad.classList.add(
                                "padding6"
                            )
                            const tituloEntidad = document.createElement("div")
                            tituloEntidad.textContent = "Entidad"
                            contenedorEntidad.appendChild(tituloEntidad)
                            const entidadUI = document.createElement("div")
                            entidadUI.classList.add("negrita")
                            entidadUI.setAttribute("dato", "entidad")
                            contenedorEntidad.appendChild(entidadUI)
                            contenedorGlobalOferta.appendChild(contenedorEntidad)
                            if (destinoOrigenOferta === "porCondicion") {
                                const contenedorAutorizacion = document.createElement("div")
                                contenedorAutorizacion.classList.add(
                                    "padding6"
                                )
                                contenedorAutorizacion.setAttribute("contenedor", "autorizacion")
                                const textoAutorizacion = document.createElement("div")
                                textoAutorizacion.textContent = "Estado de la autorizacíón"
                                contenedorAutorizacion.appendChild(textoAutorizacion)
                                const estadoAutorizacionUI = document.createElement("div")
                                estadoAutorizacionUI.classList.add("negrita")
                                estadoAutorizacionUI.setAttribute("dato", "autorizacion")
                                contenedorAutorizacion.appendChild(estadoAutorizacionUI)
                                contenedorGlobalOferta.appendChild(contenedorAutorizacion)
                            }
                            if (modoUI === "administracion") {
                                const contenedorBotones = document.createElement("div")
                                contenedorBotones.classList.add(
                                    "flexHorizontal",
                                    "gap6"
                                )
                                contenedorGlobalOferta.appendChild(contenedorBotones)
                                if (destinoOrigenOferta === "porCondicion") {
                                    const botonRechazar = document.createElement("div")
                                    botonRechazar.setAttribute("boton", "autorizacionOferta")
                                    botonRechazar.setAttribute("estadoActual", autorizacion)
                                    botonRechazar.classList.add(
                                        "botonV3",
                                        "comportamientoBoton"
                                    )
                                    if (autorizacion === "aceptada") {
                                        botonRechazar.textContent = "Rechazar oferta"
                                    } else if (autorizacion === "rechazada") {
                                        botonRechazar.textContent = "Aceptar oferta"
                                    }
                                    botonRechazar.addEventListener("click", (e) => {
                                        casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.desgloseTotal.componentesUI.actualizarEstadoAutorizacion({
                                            e,
                                            ofertaUID
                                        })
                                    })
                                    contenedorBotones.appendChild(botonRechazar)
                                    contenedorGlobalOferta.appendChild(contenedorBotones)
                                }
                                const botonEliminar = document.createElement("div")
                                botonEliminar.classList.add(
                                    "botonV3",
                                    "comportamientoBoton"
                                )
                                botonEliminar.textContent = "Eliminar oferta de la reserva " + posicion
                                botonEliminar.addEventListener("click", () => {
                                    casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.desgloseTotal.componentesUI.eliminarOfertaEnReserva.ui({
                                        origen: destinoOrigenOferta,
                                        ofertaUID,
                                        posicion,
                                        nombreOferta
                                    })
                                })
                                contenedorBotones.appendChild(botonEliminar)
                            }
                            if (modoUI === "simulador") {
                                const contenedorBotones = document.createElement("div")
                                contenedorBotones.classList.add(
                                    "flexHorizontal",
                                    "gap6"
                                )
                                contenedorGlobalOferta.appendChild(contenedorBotones)
                                if (destinoOrigenOferta === "porCondicion") {
                                    const botonRechazar = document.createElement("div")
                                    botonRechazar.setAttribute("boton", "autorizacionOferta")
                                    botonRechazar.setAttribute("estadoActual", autorizacion)
                                    botonRechazar.classList.add(
                                        "botonV3",
                                        "comportamientoBoton"
                                    )
                                    if (autorizacion === "aceptada") {
                                        botonRechazar.textContent = "Rechazar oferta"
                                    } else if (autorizacion === "rechazada") {
                                        botonRechazar.textContent = "Aceptar oferta"
                                    }
                                    botonRechazar.addEventListener("click", (e) => {
                                        casaVitini.view.detallesSimulacion.componentesUI.actualizarEstadoAutorizacion({
                                            e,
                                            ofertaUID
                                        })
                                    })
                                    contenedorBotones.appendChild(botonRechazar)
                                    contenedorGlobalOferta.appendChild(contenedorBotones)
                                }
                                const botonEliminar = document.createElement("div")
                                botonEliminar.classList.add(
                                    "botonV3",
                                    "comportamientoBoton"
                                )
                                botonEliminar.textContent = "Eliminar oferta de la reserva " + posicion
                                botonEliminar.addEventListener("click", () => {
                                    casaVitini.view.detallesSimulacion.componentesUI.eliminarOfertaEnSimulacion.ui({
                                        origen: destinoOrigenOferta,
                                        ofertaUID,
                                        posicion,
                                        nombreOferta
                                    })
                                })
                                contenedorBotones.appendChild(botonEliminar)
                            }
                            const contenedorFechas = document.createElement("div")
                            contenedorFechas.classList.add(
                                "flexHorizontal",
                                "flexJustificacion_spacearound",
                                "borderGrey1",
                                "padding6",
                                "borderRadius10"
                            )
                            const fechaInicioUI = document.createElement("div")
                            fechaInicioUI.setAttribute("dato", "fechaInicio")
                            fechaInicioUI.textContent = fechaInicio
                            contenedorFechas.appendChild(fechaInicioUI)
                            const fechaFinalUI = document.createElement("div")
                            fechaFinalUI.setAttribute("dato", "fechaFinal")
                            fechaFinalUI.textContent = fechaFinal
                            contenedorFechas.appendChild(fechaFinalUI)
                            contenedorGlobalOferta.appendChild(contenedorFechas)
                            const contenedorDestino = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[contenedor=ofertas] [contenedor=data]").querySelector(`[contenedor=${destinoOrigenOferta}]`)
                            this.utilidades.posicionador({
                                contenedorDestino,
                                consultaContenedorInternos: "[ofertaUID][posicion]",
                                nuevoContenedor: contenedorOfertaUI,
                                posicionDestino: Number(posicion) + 1
                            })
                        }
                        const contenedorOfertaUI_renderizador = document.querySelector(destino)
                            .querySelector("[contenedor=financiero]")
                            .querySelector("[contenedor=ofertas]")
                            .querySelector("[contenedor=data]")
                            .querySelector(`[contenedor=${destinoOrigenOferta}]`)
                            .querySelector(`[ofertaUID="${ofertaUID}"][posicion="${posicion}"]`)
                        const nombreOfertaUI = contenedorOfertaUI_renderizador.querySelector("[dato=nombre]")
                        nombreOfertaUI.textContent = nombreOferta
                        const entidadUI = contenedorOfertaUI_renderizador.querySelector("[dato=entidad]")
                        entidadUI.textContent = entidadUI_(entidadIDV)
                        const ofertaUIDUI = contenedorOfertaUI_renderizador.querySelector("[dato=ofertaUID]")
                        ofertaUIDUI.textContent = ofertaUID
                        if (destinoOrigenOferta === "porCondicion") {
                            const autorizacionUI_ = contenedorOfertaUI_renderizador.querySelector("[dato=autorizacion]")
                            autorizacionUI_.textContent = autorizacionUI(autorizacion)
                        }
                        const fechaInicioUI = contenedorOfertaUI_renderizador.querySelector("[dato=fechaInicio]")
                        fechaInicioUI.textContent = fechaInicio
                        const fechaFinalUI = contenedorOfertaUI_renderizador.querySelector("[dato=fechaFinal]")
                        fechaFinalUI.textContent = fechaFinal
                    },
                    condicionesUI: function (data) {
                        const contenedorOferta = data.contenedorOferta
                        const oferta = contenedorOferta.oferta
                        const condicionesArray = oferta.condicionesArray
                        const destino = data.destino
                        const ofertaUID = oferta.ofertaUID
                        const destinoOrigenOferta = data.destinoOrigenOferta
                        const contenedorCondiciones_selector = document.querySelector(destino)
                            .querySelector("[contenedor=financiero]")
                            .querySelector("[contenedor=ofertas]")
                            .querySelector("[contenedor=data]")
                            .querySelector(`[contenedor=${destinoOrigenOferta}]`)
                            .querySelector(`[ofertaUID="${ofertaUID}"]`)
                            .querySelector("[contenedor=condiciones]")
                        if (!contenedorCondiciones_selector) {
                            const contenedorCondiciones = document.createElement("div")
                            contenedorCondiciones.setAttribute("contenedor", "condiciones")
                            contenedorCondiciones.classList.add(
                                "flexVertical",
                                "gap6",
                                "backgroundGrey1",
                                "padding6",
                                "borderRadius8"
                            )
                            const tituloContendor = document.createElement("div")
                            tituloContendor.classList.add(
                                "negrita",
                                "padding6",
                            )
                            tituloContendor.textContent = "Condiciones de la oferta"
                            contenedorCondiciones.appendChild(tituloContendor)
                            document.querySelector(destino)
                                .querySelector("[contenedor=financiero]")
                                .querySelector("[contenedor=ofertas]")
                                .querySelector("[contenedor=data]")
                                .querySelector(`[contenedor=${destinoOrigenOferta}]`)
                                .querySelector(`[ofertaUID="${ofertaUID}"]`)
                                .appendChild(contenedorCondiciones)
                        }
                        const contenedorCondiciones_renderizado = document.querySelector(destino)
                            .querySelector("[contenedor=financiero]")
                            .querySelector("[contenedor=ofertas]")
                            .querySelector("[contenedor=data]")
                            .querySelector(`[contenedor=${destinoOrigenOferta}]`)
                            .querySelector(`[ofertaUID="${ofertaUID}"]`)
                            .querySelector("[contenedor=condiciones]")
                        contenedorCondiciones_renderizado.querySelectorAll("[tipoCondicion]").forEach((contenedorTipoCondicion) => {
                            contenedorTipoCondicion.remove()
                        })
                        condicionesArray.forEach((condicion) => {
                            const tipoCondicion = condicion.tipoCondicion
                            const contenedorCondicion = document.createElement("div")
                            contenedorCondicion.classList.add("contenedorCondicion")
                            contenedorCondicion.setAttribute("tipoCondicion", tipoCondicion)
                            contenedorCondicion.classList.add(
                                "flexVertical",
                                "padding6",
                            )
                            document.querySelector(destino)
                                .querySelector("[contenedor=financiero]")
                                .querySelector("[contenedor=ofertas]")
                                .querySelector("[contenedor=data]")
                                .querySelector(`[contenedor=${destinoOrigenOferta}]`)
                                .querySelector(`[ofertaUID="${ofertaUID}"]`)
                                .querySelector("[contenedor=condiciones]")
                                .appendChild(contenedorCondicion)
                            const definicionCondicion = this.definicionCondiciones({
                                tipoCondicion,
                                condicion
                            })
                            contenedorCondicion.appendChild(definicionCondicion)
                            contenedorCondiciones_renderizado.appendChild(contenedorCondicion)
                        })
                    },
                    definicionCondiciones: function (data) {
                        const condicion = data.condicion
                        const tipoCondicion = data.tipoCondicion
                        const contenedorCondicion = document.createElement("div")
                        if (tipoCondicion === "conFechaEntradaEntreRango") {
                            const fechaFinalRango_ISO = condicion.fechaFinalRango_ISO
                            const fechaInicioRango_ISO = condicion.fechaInicioRango_ISO
                            const tituloCondicion = document.createElement("div")
                            tituloCondicion.textContent = "Por fecha de entrada"
                            tituloCondicion.classList.add(
                                "negrita",
                            )
                            contenedorCondicion.appendChild(tituloCondicion)
                            const descripcionCondicion = document.createElement("div")
                            descripcionCondicion.textContent = "Esta condición determina que la oferta se aplica cuando la fecha de entrada de la reserva está entre el rango de vigencia de la oferta."
                            contenedorCondicion.appendChild(descripcionCondicion)
                            const rangoVigencia = document.createElement("div")
                            rangoVigencia.textContent = `${fechaInicioRango_ISO} >>> ${fechaFinalRango_ISO}`
                            contenedorCondicion.appendChild(rangoVigencia)
                        } else if (tipoCondicion === "conFechaSalidaEntreRango") {
                            const fechaFinalRango_ISO = condicion.fechaFinalRango_ISO
                            const fechaInicioRango_ISO = condicion.fechaInicioRango_ISO
                            const tituloCondicion = document.createElement("div")
                            tituloCondicion.textContent = "Por fecha de salida"
                            tituloCondicion.classList.add(
                                "negrita",
                            )
                            contenedorCondicion.appendChild(tituloCondicion)
                            const descripcionCondicion = document.createElement("div")
                            descripcionCondicion.textContent = "Esta condición determina que la oferta se aplica cuando la fecha de salida de la reserva está entre el rango de especificado en la oferta."
                            contenedorCondicion.appendChild(descripcionCondicion)
                            const rangoVigencia = document.createElement("div")
                            rangoVigencia.textContent = `${fechaInicioRango_ISO} >>> ${fechaFinalRango_ISO}`
                            contenedorCondicion.appendChild(rangoVigencia)
                        } else if (tipoCondicion === "conFechaCreacionEntreRango") {
                            const tituloCondicion = document.createElement("div")
                            tituloCondicion.textContent = "Por fecha de creación entre el rango."
                            tituloCondicion.classList.add(
                                "negrita",
                            )
                            contenedorCondicion.appendChild(tituloCondicion)
                            const descripcionCondicion = document.createElement("div")
                            descripcionCondicion.textContent = "Esta condición determina que la oferta se aplica cuando la fecha de creación de la reserva está entre el rango de vigencia de la oferta."
                            contenedorCondicion.appendChild(descripcionCondicion)
                        } else if (tipoCondicion === "porNumeroDeApartamentos") {
                            const tipoConteo = condicion.tipoConteo
                            const numeroDeApartamentos = condicion.numeroDeApartamentos
                            const tituloCondicion = document.createElement("div")
                            tituloCondicion.textContent = "Por número de apartamentos."
                            tituloCondicion.classList.add(
                                "negrita",
                            )
                            contenedorCondicion.appendChild(tituloCondicion)
                            if (tipoConteo === "aPartirDe") {
                                const descripcionCondicion = document.createElement("div")
                                descripcionCondicion.textContent = `Esta condición determina que la oferta se aplica cuando la reserva tiene ${numeroDeApartamentos} o más apartamentos`
                                contenedorCondicion.appendChild(descripcionCondicion)
                            } else if (tipoConteo === "numeroExacto") {
                                const descripcionCondicion = document.createElement("div")
                                if (numeroDeApartamentos === "1") {
                                    descripcionCondicion.textContent = `Esta condición determina que la oferta se aplica cuando la reserva tiene ${numeroDeApartamentos} apartamento exactamente. Ni más ni menos.`
                                    contenedorCondicion.appendChild(descripcionCondicion)
                                } else {
                                    descripcionCondicion.textContent = `Esta condición determina que la oferta se aplica cuando la reserva tiene ${numeroDeApartamentos} apartamentos exactamente. Ni más ni menos.`
                                    contenedorCondicion.appendChild(descripcionCondicion)
                                }
                            } else if (tipoConteo === "hastaUnNumeroExacto") {
                                const descripcionCondicion = document.createElement("div")
                                descripcionCondicion.textContent = `Esta condición determina que la oferta se aplica cuando la reserva tiene hasta ${numeroDeApartamentos} o menos apartamentos`
                                contenedorCondicion.appendChild(descripcionCondicion)
                            }
                        } else if (tipoCondicion === "porApartamentosEspecificos") {
                            const apartamentos = condicion.apartamentos
                            const tipoDeEspecificidad = condicion.tipoDeEspecificidad
                            const apartamentosUI = apartamentos.map(cA => `${cA.apartamentoUI}`)
                            const apartametnosFormateados = casaVitini.utilidades.cadenas.constructorComasEY({
                                array: apartamentosUI,
                                articulo: ""
                            })
                            const tituloCondicion = document.createElement("div")
                            tituloCondicion.textContent = "Por apartamentos específicos."
                            tituloCondicion.classList.add(
                                "negrita",
                            )
                            contenedorCondicion.appendChild(tituloCondicion)
                            const descripcionCondicion = document.createElement("div")
                            if (tipoDeEspecificidad === "exactamente") {
                                descripcionCondicion.textContent = `Esta condición determina que la oferta se aplica cuando la reserva contiene los apartamentos en específico: ${apartametnosFormateados}`
                            } else if (tipoDeEspecificidad === "alguno") {
                                descripcionCondicion.textContent = `Esta condición determina que la oferta se aplica cuando la reserva contiene algunos de los apartamentos en específico: ${apartametnosFormateados}`
                            } else if (tipoDeEspecificidad === "exactamenteEntreOtros") {
                                descripcionCondicion.textContent = `Esta condición determina que la oferta se aplica cuando la reserva contiene exactamente los apartamentos en específico, entre otros: ${apartametnosFormateados}`
                            } else if (tipoDeEspecificidad === "noDebeContenedorExactamente") {
                                descripcionCondicion.textContent = `Esta condición determina que la oferta se aplica cuando la reserva NO contiene exactamente los apartamentos en específico: ${apartametnosFormateados}`
                            } else if (tipoDeEspecificidad === "noDebeContenedorAlguno") {
                                descripcionCondicion.textContent = `Esta condición determina que la oferta se aplica cuando la reserva NO contiene alguno de los apartamentos en específico: ${apartametnosFormateados}`
                            }
                            contenedorCondicion.appendChild(descripcionCondicion)
                        } else if (tipoCondicion === "porDiasDeAntelacion") {
                            const numeroDeDias = condicion.numeroDeDias
                            const tipoConteo = condicion.tipoConteo
                            const tituloCondicion = document.createElement("div")
                            tituloCondicion.textContent = "Por días de antelación."
                            tituloCondicion.classList.add(
                                "negrita",
                            )
                            contenedorCondicion.appendChild(tituloCondicion)
                            const descripcionCondicion = document.createElement("div")
                            if (tipoConteo === "aPartirDe") {
                                if (numeroDeDias === "1") {
                                    descripcionCondicion.textContent = `Esta condición determina que la oferta se aplica cuando la reserva tiene ${numeroDeDias} día de antelación o más.`
                                    contenedorCondicion.appendChild(descripcionCondicion)
                                } else {
                                    descripcionCondicion.textContent = `Esta condición determina que la oferta se aplica cuando la reserva tiene ${numeroDeDias} días de antelación o más.`
                                    contenedorCondicion.appendChild(descripcionCondicion)
                                }
                            } else if (tipoConteo === "numeroExacto") {
                                if (numeroDeDias === "1") {
                                    descripcionCondicion.textContent = `Esta condición determina que la oferta se aplica cuando la reserva tiene ${numeroDeDias} día de antelación exactamente`
                                    contenedorCondicion.appendChild(descripcionCondicion)
                                } else {
                                    descripcionCondicion.textContent = `Esta condición determina que la oferta se aplica cuando la reserva tiene ${numeroDeDias} días de antelación exactamente`
                                    contenedorCondicion.appendChild(descripcionCondicion)
                                }
                            } else if (tipoConteo === "hastaUnNumeroExacto") {
                                if (numeroDeDias === "1") {
                                    descripcionCondicion.textContent = `Esta condición determina que la oferta se aplica cuando la reserva tiene hasta ${numeroDeDias} día de antelación o más`
                                    contenedorCondicion.appendChild(descripcionCondicion)
                                } else {
                                    descripcionCondicion.textContent = `Esta condición determina que la oferta se aplica cuando la reserva tiene hasra ${numeroDeDias} días de antelación o más`
                                    contenedorCondicion.appendChild(descripcionCondicion)
                                }
                            }
                        } else if (tipoCondicion === "porDiasDeReserva") {
                            const diasDeReserva = condicion.diasDeReserva
                            const tipoConteo = condicion.tipoConteo
                            const tituloCondicion = document.createElement("div")
                            tituloCondicion.textContent = "Por días de duración."
                            tituloCondicion.classList.add(
                                "negrita",
                            )
                            contenedorCondicion.appendChild(tituloCondicion)
                            const descripcionCondicion = document.createElement("div")
                            if (tipoConteo === "aPartirDe") {
                                if (diasDeReserva === "1") {
                                    descripcionCondicion.textContent = `Esta condición determina que la oferta se aplica cuando la reserva tiene ${diasDeReserva} día de duración o más`
                                    contenedorCondicion.appendChild(descripcionCondicion)
                                } else {
                                    descripcionCondicion.textContent = `Esta condición determina que la oferta se aplica cuando la reserva tiene ${diasDeReserva} días de duración o más`
                                    contenedorCondicion.appendChild(descripcionCondicion)
                                }
                            } else if (tipoConteo === "numeroExacto") {
                                if (diasDeReserva === "1") {
                                    descripcionCondicion.textContent = `Esta condición determina que la oferta se aplica cuando la reserva tiene ${diasDeReserva} día de duración exactamente`
                                    contenedorCondicion.appendChild(descripcionCondicion)
                                } else {
                                    descripcionCondicion.textContent = `Esta condición determina que la oferta se aplica cuando la reserva tiene ${diasDeReserva} días de duración exactamente`
                                    contenedorCondicion.appendChild(descripcionCondicion)
                                }
                            } else if (tipoConteo === "hastaUnNumeroExacto") {
                                if (diasDeReserva === "1") {
                                    descripcionCondicion.textContent = `Esta condición determina que la oferta se aplica cuando la reserva tiene hasta ${diasDeReserva} día de duración o más`
                                    contenedorCondicion.appendChild(descripcionCondicion)
                                } else {
                                    descripcionCondicion.textContent = `Esta condición determina que la oferta se aplica cuando la reserva tiene hasta ${diasDeReserva} días de duración o más`
                                    contenedorCondicion.appendChild(descripcionCondicion)
                                }
                            }
                        } else if (tipoCondicion === "porRangoDeFechas") {
                            const fechaFinalRango_ISO = condicion.fechaFinalRango_ISO
                            const fechaInicioRango_ISO = condicion.fechaInicioRango_ISO
                            const tituloCondicion = document.createElement("div")
                            tituloCondicion.textContent = "Por rango de fechas."
                            tituloCondicion.classList.add(
                                "negrita",
                            )
                            contenedorCondicion.appendChild(tituloCondicion)
                            const descripcionCondicion = document.createElement("div")
                            descripcionCondicion.textContent = `Esta condición determina que la oferta se aplica cuando el rango de la reserva se cruza con el rango determinado en esta condición. Del ${fechaInicioRango_ISO} al ${fechaFinalRango_ISO}`
                            contenedorCondicion.appendChild(descripcionCondicion)
                        } else if (tipoCondicion === "porCodigoDescuento") {
                            const codigoDescuento = condicion.codigoDescuento
                            const tituloCondicion = document.createElement("div")
                            tituloCondicion.textContent = "Por código de descuento."
                            tituloCondicion.classList.add(
                                "negrita",
                            )
                            contenedorCondicion.appendChild(tituloCondicion)
                            const codigoUI = document.createElement("div")
                            codigoUI.textContent = atob(codigoDescuento)
                            contenedorCondicion.appendChild(codigoUI)
                        } else {
                            const error = "El renderizado de condiciones de oferta ha recibido un identificador no reconocido: " + tipoCondicion
                            return casaVitini.ui.componentes.advertenciaInmersiva(error)
                        }
                        return contenedorCondicion
                    },
                    descuentosUI: function (data) {
                        const destino = data.destino
                        const contenedorOferta = data.contenedorOferta
                        const ofertaUID = contenedorOferta.oferta.ofertaUID
                        const destinoOrigenOferta = data.destinoOrigenOferta
                        const descuentosJSON = contenedorOferta.oferta.descuentosJSON
                        const tipoDescuento = descuentosJSON?.tipoDescuento
                        const subTipoDescuento = descuentosJSON?.subTipoDescuento
                        const contenedorDescuentos_selector = document.querySelector(destino)
                            .querySelector("[contenedor=financiero]")
                            .querySelector("[contenedor=ofertas]")
                            .querySelector("[contenedor=data]")
                            .querySelector(`[contenedor=${destinoOrigenOferta}]`)
                            .querySelector(`[ofertaUID="${ofertaUID}"]`)
                            .querySelector("[contenedor=descuentos]")
                        if (!contenedorDescuentos_selector) {
                            const contenedorDescuentos = document.createElement("div")
                            contenedorDescuentos.setAttribute("contenedor", "descuentos")
                            contenedorDescuentos.classList.add(
                                "flexVertical",
                                "backgroundGrey1",
                                "padding6",
                                "padding12",
                                "borderRadius8",
                                "gap6"
                            )
                            document.querySelector(destino)
                                .querySelector("[contenedor=financiero]")
                                .querySelector("[contenedor=ofertas]")
                                .querySelector("[contenedor=data]")
                                .querySelector(`[contenedor=${destinoOrigenOferta}]`)
                                .querySelector(`[ofertaUID="${ofertaUID}"]`)
                                .appendChild(contenedorDescuentos)
                        }
                        const contenedorDescuentos_renderizado = document.querySelector(destino)
                            .querySelector("[contenedor=financiero]")
                            .querySelector("[contenedor=ofertas]")
                            .querySelector("[contenedor=data]")
                            .querySelector(`[contenedor=${destinoOrigenOferta}]`)
                            .querySelector(`[ofertaUID="${ofertaUID}"]`)
                            .querySelector("[contenedor=descuentos]")



                        contenedorDescuentos_renderizado.innerHTML = null
                        const tituloContendor = document.createElement("div")
                        tituloContendor.classList.add(
                            "negrita",
                        )
                        tituloContendor.textContent = "Descuentos de la oferta"
                        contenedorDescuentos_renderizado.appendChild(tituloContendor)
                        const desfinicionDescuento = this.definicionDescuentos({
                            tipoDescuento,
                            subTipoDescuento,
                            descuentosJSON
                        })
                        contenedorDescuentos_renderizado.appendChild(desfinicionDescuento)
                    },
                    definicionDescuentos: function (data) {
                        const tipoDescuento = data.tipoDescuento
                        const subTipoDescuento = data.subTipoDescuento
                        const descuentosJSON = data.descuentosJSON
                        const contenedorDescuento = document.createElement("div")
                        const descripcionDescuento = document.createElement("p")
                        descripcionDescuento.classList.add(
                            // "padding6"
                        )
                        contenedorDescuento.appendChild(descripcionDescuento)
                        if (tipoDescuento === "porRango" && subTipoDescuento === "porDiasDelRango") {
                            const fechaInicioRango_ISO = descuentosJSON.fechaInicioRango_ISO
                            const fechaFinalRango_ISO = descuentosJSON.fechaFinalRango_ISO
                            const descuentoPorDias = descuentosJSON.descuentoPorDias
                            descripcionDescuento.textContent = `Esta oferta aplica un descuento a los días de la reserva. A continuación se detallan los días donde la oferta aplica descuentos y qué tipo de descuentos aplica en cada día.`
                            contenedorDescuento.appendChild(descripcionDescuento)
                            for (const descuentoPorDia of descuentoPorDias) {
                                const tipoDescuentoPorDia = descuentoPorDia.tipoDescuento
                                const descuentoTotal = descuentoPorDia.descuentoTotal
                                const fechaNoche = descuentoPorDia.fecha
                                const contenedorDia = document.createElement("div")
                                contenedorDia.classList.add(
                                    "flexVertical"
                                )
                                const tituloContenedorDia = document.createElement("div")
                                tituloContenedorDia.classList.add(
                                    "negrita",
                                    "padding6"
                                )
                                tituloContenedorDia.textContent = fechaNoche
                                contenedorDia.appendChild(tituloContenedorDia)
                                if (tipoDescuentoPorDia === "netoPorDia") {
                                    const tipoAplicacion = descuentoPorDia.tipoAplicacion
                                    const descripcionDescuentoTotalNeto = document.createElement("div")
                                    descripcionDescuentoTotalNeto.classList.add(
                                        "padding6"
                                    )
                                    if (tipoAplicacion === "porcentaje") {
                                        descripcionDescuentoTotalNeto.textContent = `Esta oferta aplica un descuento del ${descuentoTotal}% a los netos de los días de la reserva que están dentro del rango establecido entre en el ${fechaInicioRango_ISO} y el ${fechaFinalRango_ISO}.`
                                    } else if (tipoAplicacion === "cantidadFija") {
                                        descripcionDescuentoTotalNeto.textContent = `Esta oferta aplica un descuento del ${descuentoTotal} a los netos de los días de la reserva que están dentro del rango establecido entre en el ${fechaInicioRango_ISO} y el ${fechaFinalRango_ISO}.`
                                    }
                                    contenedorDia.appendChild(descripcionDescuentoTotalNeto)
                                } else if (tipoDescuentoPorDia === "netoPorApartamentoDelDia") {
                                    const contenedorApartamentosDelDia = document.createElement("div")
                                    contenedorApartamentosDelDia.classList.add(
                                        "flexVertical",
                                        "gap6"
                                    )
                                    const apartamentos = descuentoPorDia.apartamentos
                                    for (const apartamento of apartamentos) {
                                        const apartamentoUI = apartamento.apartamentoUI
                                        const apartamentoIDV = apartamento.apartamentoIDV
                                        const descuentoTotal = apartamento.descuentoTotal
                                        const tipoAplicacion = apartamento.tipoAplicacion
                                        const contenedorApartamento = document.createElement("div")
                                        contenedorApartamento.classList.add(
                                            "padding10",
                                            "borderGrey1",
                                            "borderRadius6"
                                        )
                                        contenedorApartamento.setAttribute("apartamentoIDV", apartamentoIDV)
                                        const tituloApartamento = document.createElement("div")
                                        tituloApartamento.classList.add("negrita")
                                        tituloApartamento.textContent = apartamentoUI
                                        contenedorApartamento.appendChild(tituloApartamento)
                                        const descuentoApartamento = document.createElement("div")
                                        if (tipoAplicacion === "porcentaje") {
                                            descuentoApartamento.textContent = `Esta oferta aplica un descuento del ${descuentoTotal}% al ${apartamentoUI}`
                                        } else if (tipoAplicacion === "cantidadFija") {
                                            descuentoApartamento.textContent = `Esta oferta aplica un descuento de ${descuentoTotal} al ${apartamentoUI}`
                                        }
                                        contenedorApartamento.appendChild(descuentoApartamento)
                                        contenedorApartamentosDelDia.appendChild(contenedorApartamento)
                                    }
                                    contenedorDia.appendChild(contenedorApartamentosDelDia)
                                }
                                contenedorDescuento.appendChild(contenedorDia)
                            }
                        } else if (tipoDescuento === "porRango" && subTipoDescuento === "totalNetoPorRango") {
                            const fechaInicioRango_ISO = descuentosJSON.fechaInicioRango_ISO
                            const fechaFinalRango_ISO = descuentosJSON.fechaFinalRango_ISO
                            const descuentoTotal = descuentosJSON.descuentoTotal
                            const tipoAplicacion = descuentosJSON.tipoAplicacion
                            if (tipoAplicacion === "porcentaje") {
                                descripcionDescuento.textContent = `Esta oferta aplica un descuento del ${descuentoTotal}% a los días de la reserva que están dentro del rango establecido entre en el ${fechaInicioRango_ISO} y el ${fechaFinalRango_ISO}.`
                            } else if (tipoAplicacion === "cantidadFija") {
                                descripcionDescuento.textContent = `Esta oferta aplica un descuento del ${descuentoTotal}$ a los días de la reserva que están dentro del rango establecido entre en el ${fechaInicioRango_ISO} y el ${fechaFinalRango_ISO}.`
                            }
                            contenedorDescuento.appendChild(descripcionDescuento)
                        } else if (tipoDescuento === "totalNeto") {
                            const descuentoTotal = descuentosJSON.descuentoTotal
                            const tipoAplicacion = descuentosJSON.tipoAplicacion
                            if (tipoAplicacion === "porcentaje") {
                                descripcionDescuento.textContent = `Esta oferta aplica un descuento del ${descuentoTotal}% al total neto de la reserva.`
                            } else if (tipoAplicacion === "cantidadFija") {
                                descripcionDescuento.textContent = `Esta oferta aplica un descuento del ${descuentoTotal} al total neto de la reserva.`
                            }
                            contenedorDescuento.appendChild(descripcionDescuento)
                        } else if (tipoDescuento === "individualPorApartamento") {
                            descripcionDescuento.textContent = `Esta oferta aplica un descuento al total de los apartamentos especificados. A continuación se detallan los apartamentos en los que esta oferta aplica descuentos. Si la reserva no tiene todos los apartamentos especificados en esta oferta, entonces solo aplicará el Descuento en los apartamentos que coincidan con la oferta en la reserva.`
                            contenedorDescuento.appendChild(descripcionDescuento)
                            const contenedorApartamentos = document.createElement("div")
                            contenedorApartamentos.classList.add(
                                "gap6",
                                "flexVertical"
                            )
                            const apartamentos = descuentosJSON.apartamentos
                            for (const apartamento of apartamentos) {
                                const apartamentoIDV = apartamento.apartamentoIDV
                                const apartamentoUI = apartamento.apartamentoUI
                                const descuentoTotal = apartamento.descuentoTotal
                                const tipoAplicacion = apartamento.tipoAplicacion
                                const contenedorApartamento = document.createElement("div")
                                contenedorApartamento.classList.add(
                                    "padding10",
                                    "borderGrey1",
                                    "borderRadius8"
                                )
                                contenedorApartamento.setAttribute("apartamentoIDV", apartamentoIDV)
                                const apartamentoTitulo = document.createElement("div")
                                apartamentoTitulo.classList.add("negrita")
                                apartamentoTitulo.innerHTML = apartamentoUI
                                contenedorApartamento.appendChild(apartamentoTitulo)
                                const tipoAplicacionUI = document.createElement("div")
                                tipoAplicacionUI.classList.add("tipoAplicacionUI")
                                if (tipoAplicacion === "cantidadFija") {
                                    tipoAplicacionUI.textContent = `Descuento de ${descuentoTotal}$ sobre el neto del apartamento`
                                } else if (tipoAplicacion === "porcentaje") {
                                    tipoAplicacionUI.textContent = `Descuento del ${descuentoTotal}% sobre el neto del apartamento`
                                }
                                contenedorApartamento.appendChild(tipoAplicacionUI)
                                contenedorApartamentos.appendChild(contenedorApartamento)
                            }
                            contenedorDescuento.appendChild(contenedorApartamentos)
                        } else if (tipoDescuento === "mismoDescuentoParaCadaApartamento") {
                            const descuentoTotal = descuentosJSON.descuentoTotal
                            const tipoAplicacion = descuentosJSON.tipoAplicacion
                            if (tipoAplicacion === "porcentaje") {
                                descripcionDescuento.textContent = `Esta oferta aplica un descuento del ${descuentoTotal}% al total neto de cada apartamento de la reserva.`
                            } else if (tipoAplicacion === "cantidadFija") {
                                descripcionDescuento.textContent = `Esta oferta aplica un descuento del ${descuentoTotal} al total neto de cada apartamento individualmente de la reserva.`
                            }
                            contenedorDescuento.appendChild(descripcionDescuento)
                        } else {
                            const mensaje = "No se reconoce el tipo de descuento recibido."
                            return casaVitini.ui.componentes.advertenciaInmersiva(mensaje)
                        }
                        return contenedorDescuento
                    },
                    utilidades: {
                        limpiarOfertasObsoletas: function (data) {
                            const contenedores = data.contenedores
                            const origen = data.origen
                            const destino = data.destino
                            const paresActuales = []
                            contenedores.forEach((contenedorOferta, posicion) => {
                                paresActuales.push({
                                    oferta: String(contenedorOferta.oferta.ofertaUID),
                                    posicion: String(posicion)
                                })
                            })
                            const selectorContenedorOfertas = document.querySelector(destino).querySelectorAll(`[contenedor="${origen}"] [ofertaUID][posicion]`);
                            const elementosFiltrados = Array.from(selectorContenedorOfertas).filter(elemento => {
                                const ofertaUID = elemento.getAttribute('ofertaUID');
                                const posicion = elemento.getAttribute('posicion');
                                return !paresActuales.some(par => par.ofertaUID === ofertaUID && par.posicion === posicion);
                            })
                            elementosFiltrados.forEach((ofertaObsoleta) => { ofertaObsoleta.remove() })
                        },
                        posicionador: function (data) {
                            const contenedorDestino = data.contenedorDestino
                            const consultaContenedorInternos = data.consultaContenedorInternos
                            const selectorContenedorInternos = contenedorDestino.querySelectorAll(consultaContenedorInternos);
                            const posicionDestino = data.posicionDestino
                            const nuevoContenedor = data.nuevoContenedor
                            if (posicionDestino < selectorContenedorInternos.length) {
                                contenedorDestino.insertBefore(nuevoContenedor, selectorContenedorInternos[posicionDestino]);
                            } else {
                                contenedorDestino.appendChild(nuevoContenedor);
                            }
                        }
                    },
                },
                porTotal: function (data) {
                    const destino = data.destino
                    const porTotal = data.porTotal
                    if (porTotal.length === 0) {
                        document.querySelector(destino)
                            .querySelector("[contenedor=financiero]")
                            .querySelector("[contenedor=ofertas]")
                            .querySelector("[contenedor=data]")
                            ?.querySelector("[contenedor=listadescuentosAplicadosAlTotalNetoOfertas]")
                            ?.remove()
                        return
                    }
                    const contenedorPorTotalOfertas_selector = document.querySelector(destino).querySelector("[contenedor=financiero]")
                        .querySelector("[contenedor=ofertas]")
                        .querySelector("[contenedor=data]")
                        .querySelector("[contenedor=listadescuentosAplicadosAlTotalNetoOfertas]")
                    if (!contenedorPorTotalOfertas_selector) {
                        const contenedorOfertas = document.querySelector(destino)
                            .querySelector("[contenedor=financiero]")
                            .querySelector("[contenedor=ofertas]")
                            .querySelector("[contenedor=data]")
                        const contenedorDescuentosPorTotal = document.createElement("div")
                        contenedorDescuentosPorTotal.setAttribute("contenedor", "listadescuentosAplicadosAlTotalNetoOfertas")
                        contenedorDescuentosPorTotal.classList.add(
                            "flexVertical",
                            "gap6"
                        )
                        contenedorOfertas.appendChild(contenedorDescuentosPorTotal)
                    }
                    const contenedorPorTotal_selector = document.querySelector(destino)
                        .querySelector("[contenedor=financiero]")
                        .querySelector("[contenedor=ofertas]")
                        .querySelector("[contenedor=data]")
                        .querySelector("[contenedor=listadescuentosAplicadosAlTotalNetoOfertas]")
                        .querySelector("[contenedor=porTotal]")
                    if (!contenedorPorTotal_selector) {
                        const contenedor = document.createElement("div")
                        contenedor.classList.add("contenedorPorTotal")
                        contenedor.setAttribute("contenedor", "porTotal")
                        contenedor.classList.add(
                            "flexVertical",
                            "gap6"
                        )
                        document.querySelector(destino)
                            .querySelector("[contenedor=financiero]")
                            .querySelector("[contenedor=ofertas]")
                            .querySelector("[contenedor=data]")
                            .querySelector("[contenedor=listadescuentosAplicadosAlTotalNetoOfertas]")
                            .appendChild(contenedor)
                        const tituloContendor = document.createElement("div")
                        tituloContendor.classList.add(
                            "negrita",
                            "textoCentrado",
                        )
                        tituloContendor.textContent = "Descuentos aplicados a total neto de la reserva"
                        contenedor.appendChild(tituloContendor)
                        const contenedorPorTotal = document.createElement("div")
                        contenedorPorTotal.setAttribute("contenedor", "descuentos")
                        contenedorPorTotal.classList.add(
                            "flexVertical",
                            "gap6"
                        )
                        contenedor.appendChild(contenedorPorTotal)
                    }
                    const contenedorPorTotal_renderizado = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[contenedor=ofertas] [contenedor=data]").querySelector("[contenedor=porTotal]")
                    const contenedorDeDescuentos = contenedorPorTotal_renderizado.querySelector("[contenedor=descuentos]")
                    contenedorDeDescuentos.innerHTML = null
                    porTotal.forEach((detallesDelTotal) => {
                        const ofertaUID = detallesDelTotal.ofertaUID
                        const nombreOferta = detallesDelTotal.nombreOferta
                        const porcentaje = detallesDelTotal.porcentaje
                        const tipoAplicacion = detallesDelTotal.tipoAplicacion
                        const descuentoAplicado = detallesDelTotal.descuentoAplicado
                        const totalConDescuento = detallesDelTotal.totalConDescuento
                        const contenedorDescuentoTotal = document.createElement("div")
                        contenedorDescuentoTotal.classList.add("contenedorDelDescuentoDelTotal")
                        contenedorDescuentoTotal.classList.add(
                            "borderRadius10",
                            "padding10",
                            "borderGrey1",
                            "flexVertical",
                            "gap6"
                        )
                        contenedorDescuentoTotal.setAttribute("ofertaUID", ofertaUID)
                        const tituloOferta = document.createElement("div")
                        tituloOferta.classList.add(
                            "negrita",
                        )
                        tituloOferta.textContent = nombreOferta
                        contenedorDescuentoTotal.appendChild(tituloOferta)
                        if (tipoAplicacion === "porcentaje") {
                            const porcentajeUI = document.createElement("div")
                            porcentajeUI.textContent = `${porcentaje}%`
                            contenedorDescuentoTotal.appendChild(porcentajeUI)
                        }
                        const descuentoAplicadoUI = document.createElement("div")
                        descuentoAplicadoUI.textContent = `Descuento aplicado: ${descuentoAplicado}`
                        contenedorDescuentoTotal.appendChild(descuentoAplicadoUI)
                        const totalConDescuentoUI = document.createElement("div")
                        totalConDescuentoUI.textContent = `Este descuento aplicado deja el total en ${totalConDescuento}`
                        contenedorDescuentoTotal.appendChild(totalConDescuentoUI)
                        contenedorDeDescuentos.appendChild(contenedorDescuentoTotal)
                    })
                },
                entidades: {
                    hub: function (data) {
                        const destino = data.destino
                        const entidades = data.entidades
                        Object.entries(entidades).forEach(([entidadIDV, detalleEntidad]) => {
                            if (entidadIDV === "reserva") {
                                this.reserva({
                                    destino,
                                    detalleEntidad
                                })
                            }
                        })
                    },
                    reserva: function (data) {
                        const destino = data.destino
                        const detalleEntidad = data.detalleEntidad.desgloses
                        const porDia = detalleEntidad.porDia
                        const porApartamento = detalleEntidad.porApartamento
                        const apartamentosIDVArray = Object.keys(porApartamento)
                        const selectorApartamentos = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[contenedor=porNoche]").querySelectorAll(`[apartamentoIDV]`)
                        selectorApartamentos.forEach((apartamentoRenderizado) => {
                            const apartamentoObosoleto = apartamentoRenderizado.getAttribute("apartamentoIDV")
                            if (!apartamentosIDVArray.includes(apartamentoObosoleto)) {
                                apartamentoRenderizado.querySelector("[contenedor=descuentosDelApartamento]")?.remove()
                            }
                        })
                        if (Object.entries(porApartamento).length === 0) {
                            const contenedorApartamento_obosoletos = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[contenedor=porApartamento]").querySelectorAll("[apartamentoIDV]")
                            contenedorApartamento_obosoletos.forEach((contenedorObsoleto) =>
                                contenedorObsoleto.querySelector("[contenedor=descuentosDelApartamento]")?.remove()
                            )
                        }
                        Object.entries(porApartamento).forEach(([apartamentoIDV, descuentosDelApartamento]) => {
                            const contenedorApartamento = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[contenedor=porApartamento]").querySelector(`[apartamentoIDV="${apartamentoIDV}"]`)
                            const descuentosAplicados = descuentosDelApartamento.descuentosAplicados
                            const totalNetoConDescuentos = descuentosDelApartamento.totalNetoConDescuentos
                            const totalNetoSinDescuentos = descuentosDelApartamento.totalNetoSinDescuentos
                            const totalDescuentosAplicados = descuentosDelApartamento.totalDescuentosAplicados
                            const contenedorDescuentosPorApartamento_selector = contenedorApartamento.querySelector("[contenedor=descuentosDelApartamento]")
                            if (!contenedorDescuentosPorApartamento_selector) {
                                const contenedorDescuentosPorApartamento = document.createElement("div")
                                contenedorDescuentosPorApartamento.setAttribute("contenedor", "descuentosDelApartamento")
                                contenedorDescuentosPorApartamento.classList.add(
                                    "padding6",
                                    "flexVertical",
                                    "gap6"
                                )
                                const totalesDescuentos = document.createElement("div")
                                const totalDescuentosAplicadosUI = document.createElement("div")
                                totalDescuentosAplicadosUI.setAttribute("dato", "totalConDescuentosAplicados")
                                totalesDescuentos.appendChild(totalDescuentosAplicadosUI)
                                const totalNetoConDescuentosUI = document.createElement("div")
                                totalNetoConDescuentosUI.setAttribute("dato", "totalNetoConDescuentos")
                                totalesDescuentos.appendChild(totalNetoConDescuentosUI)
                                contenedorDescuentosPorApartamento.appendChild(totalesDescuentos)
                                contenedorApartamento.appendChild(contenedorDescuentosPorApartamento)
                                const contenedorDescuentosDelApartamento = document.createElement("div")
                                contenedorDescuentosDelApartamento.setAttribute("contenedor", "descuentos")
                                contenedorDescuentosDelApartamento.classList.add(
                                    "padding6",
                                    "flexVertical",
                                    "gap6",
                                    "borderRadius8",
                                    "borderGrey1"
                                )
                                const tituloContenedorDescuentos = document.createElement("div")
                                tituloContenedorDescuentos.classList.add("negrita")
                                tituloContenedorDescuentos.textContent = "Descuentos aplicados al total del apartamento"
                                contenedorDescuentosDelApartamento.appendChild(tituloContenedorDescuentos)
                                contenedorDescuentosPorApartamento.appendChild(contenedorDescuentosDelApartamento)
                            }
                            const contenedorDescuentosPorApartamento_renderizado = contenedorApartamento.querySelector("[contenedor=descuentosDelApartamento]")
                            const totalConDescuentosAplicados = contenedorDescuentosPorApartamento_renderizado.querySelector("[dato=totalConDescuentosAplicados]")
                            totalConDescuentosAplicados.textContent = `${totalDescuentosAplicados}$ Suma total de descuentos aplicados al apartamento`
                            const totalNetoConDescuentosUI = contenedorDescuentosPorApartamento_renderizado.querySelector("[dato=totalNetoConDescuentos]")
                            totalNetoConDescuentosUI.textContent = `${totalNetoConDescuentos}$ Neto del apartamento con descuentos aplicados`
                            const contenedorDesgloseDescuentos = contenedorDescuentosPorApartamento_renderizado.querySelector("[contenedor=descuentos]")
                            contenedorDesgloseDescuentos.innerHTML = null
                            descuentosAplicados.forEach((detallesDelDescuento) => {
                                const ofertaUID = detallesDelDescuento.ofertaUID
                                const nombreOferta = detallesDelDescuento.nombreOferta
                                const apartamentoIDV = detallesDelDescuento.apartamentoIDV
                                const tipoAplicacion = detallesDelDescuento.tipoAplicacion
                                const porcentaje = detallesDelDescuento.porcentaje
                                const descuentoAplicado = detallesDelDescuento.descuentoAplicado
                                const totalConDescuento = detallesDelDescuento.totalConDescuento
                                const contenedor = document.createElement("div")
                                contenedor.classList.add("porApartamento")
                                contenedor.setAttribute("ofertaUID", ofertaUID)
                                contenedor.classList.add(
                                    "padding10",
                                    "flexVertical",
                                    "borderRadius6",
                                    "backgroundGrey1"
                                )
                                const nombreOfertaUI = document.createElement("div")
                                nombreOfertaUI.classList.add("negrita")
                                nombreOfertaUI.textContent = nombreOferta
                                contenedor.appendChild(nombreOfertaUI)
                                const descripcionDescuento = document.createElement("div")
                                if (tipoAplicacion === "porcentaje") {
                                    descripcionDescuento.textContent = `Esta oferta aplica un descuento del ${porcentaje}% y generando un descuento del ${descuentoAplicado}.`
                                } else if (tipoAplicacion === "cantidadFija") {
                                    descripcionDescuento.textContent = `Esta oferta aplica un descuento del ${descuentoAplicado} sobre el total neto del apartamento.`
                                }
                                contenedor.appendChild(descripcionDescuento)
                                contenedorDesgloseDescuentos.appendChild(contenedor)
                            })
                        })
                        const fechasNocheObsoletas = Object.keys(porDia)
                        const selectorNochesRenderizadas = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[contenedor=porNoche]").querySelectorAll(`[noche]`)
                        selectorNochesRenderizadas.forEach((nocheRenderizada) => {
                            const fechaNocheRenderizada = nocheRenderizada.getAttribute("noche")
                            if (!fechasNocheObsoletas.includes(fechaNocheRenderizada)) {
                                nocheRenderizada.querySelector("[contenedor=descuentosGlobales]")?.remove()
                                nocheRenderizada.querySelector("[contenedor=descuentosNoche]")?.remove()
                                const selectorContenedorDescuentosEnApartamenos = nocheRenderizada.querySelectorAll("[contenedor=descuentosAlNetoApartamento]")
                                selectorContenedorDescuentosEnApartamenos.forEach((s) => s?.remove())
                            }
                        })
                        Object.entries(porDia).forEach(([fechaNoche, detallesDelDia]) => {
                            const totalConDescuentos = detallesDelDia.totalConDescuentos
                            const totalDescuentosAplicados = detallesDelDia.totalDescuentosAplicados
                            const totalSinDescuentos = detallesDelDia.totalSinDescuentos
                            const porApartamento = detallesDelDia.porApartamento ?? []
                            const porTotalNetoDia = detallesDelDia.porTotalNetoDia ?? []
                            const contendorNoche = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[contenedor=porNoche]").querySelector(`[noche="${fechaNoche}"]`)
                            const contendorTotalesNoche = contendorNoche.querySelector("[contenedor=totalesNoche]")
                            const descuentosGlobales_selector = contendorNoche.querySelector("[contenedor=descuentosGlobales]")
                            if (!descuentosGlobales_selector) {
                                const descuentosGlobales = document.createElement("div")
                                descuentosGlobales.setAttribute("contenedor", "descuentosGlobales")
                                descuentosGlobales.classList.add("flexVertical",)
                                const contenedorGlobal = document.createElement("div")
                                contenedorGlobal.classList.add("padding6")
                                const totalDescuentosAplicados = document.createElement("p")
                                totalDescuentosAplicados.setAttribute("dato", "totalDescuentosAplicados")
                                contenedorGlobal.appendChild(totalDescuentosAplicados)
                                const totalConDescuentosUI = document.createElement("p")
                                totalConDescuentosUI.setAttribute("dato", "totalConDescuentos")
                                contenedorGlobal.appendChild(totalConDescuentosUI)
                                descuentosGlobales.appendChild(contenedorGlobal)
                                contendorNoche.insertBefore(descuentosGlobales, contendorTotalesNoche.nextSibling);
                            }
                            const descuentosGlobales_renderizado = contendorNoche.querySelector("[contenedor=descuentosGlobales]")
                            const totalDescuentosAplicadosUI = descuentosGlobales_renderizado.querySelector("[dato=totalDescuentosAplicados]")
                            totalDescuentosAplicadosUI.textContent = totalDescuentosAplicados + "$ Suma total de los descuentos aplicados al total neto de la noache"
                            const totalConDescuentosUI = descuentosGlobales_renderizado.querySelector("[dato=totalConDescuentos]")
                            totalConDescuentosUI.textContent = totalConDescuentos + "$ Total neto noche con descuentos aplicados"
                            if (porTotalNetoDia.length > 0) {
                                const descuentosDelTotalNetoNoche_selector = contendorNoche.querySelector("[contenedor=descuentosNoche]")
                                if (!descuentosDelTotalNetoNoche_selector) {
                                    const contenedorDescuentosDelTotalNetoNoche = document.createElement("div")
                                    contenedorDescuentosDelTotalNetoNoche.setAttribute("contenedor", "descuentosNoche")
                                    contenedorDescuentosDelTotalNetoNoche.classList.add("contenedorTotalesNocheDescuentos")
                                    contendorNoche.insertBefore(contenedorDescuentosDelTotalNetoNoche, descuentosGlobales_renderizado.nextSibling);
                                    const titulo = document.createElement("div")
                                    titulo.classList.add(
                                        "negrita",
                                        "padding6"
                                    )
                                    titulo.textContent = "Descuentos aplicados al total neto de la noche."
                                    contenedorDescuentosDelTotalNetoNoche.appendChild(titulo)
                                }
                                const descuentosDelTotalNetoNoche_renderizado = contendorNoche.querySelector("[contenedor=descuentosNoche]")
                                const selectorDescuentosObsoletos = descuentosDelTotalNetoNoche_renderizado.querySelectorAll("[contenedor=descuento]")
                                selectorDescuentosObsoletos.forEach((descuentoObosoleto) => {
                                    descuentoObosoleto?.remove()
                                })
                            } else {
                                contendorNoche.querySelector("[contenedor=descuentosNoche]")?.remove()
                            }
                            porTotalNetoDia.forEach((detallesDelNetoPorDia) => {
                                const fecha = detallesDelNetoPorDia.fecha
                                const ofertaUID = detallesDelNetoPorDia.ofertaUID
                                const porcentaje = detallesDelNetoPorDia.porcentaje
                                const nombreOferta = detallesDelNetoPorDia.nombreOferta
                                const tipoAplicacion = detallesDelNetoPorDia.tipoAplicacion
                                const descuentoAplicado = detallesDelNetoPorDia.descuentoAplicado
                                const totalConDescuento = detallesDelNetoPorDia.totalConDescuento
                                const contenedorDescuentos_renderizado = contendorNoche.querySelector("[contenedor=descuentosNoche]")
                                const contenedorDescuentosAlTotalNetoNoche = document.createElement("div")
                                contenedorDescuentosAlTotalNetoNoche.setAttribute("contenedor", "descuento")
                                contenedorDescuentosAlTotalNetoNoche.classList.add("contenedorDescuentosAlTotalNetoNoche")
                                contenedorDescuentosAlTotalNetoNoche.setAttribute("ofertaUID", ofertaUID)
                                const nombreOfertaUI = document.createElement("div")
                                nombreOfertaUI.classList.add("negrita")
                                nombreOfertaUI.textContent = nombreOferta
                                contenedorDescuentosAlTotalNetoNoche.appendChild(nombreOfertaUI)
                                const descripcionDescuento = document.createElement("div")
                                if (tipoAplicacion === "porcentaje") {
                                    descripcionDescuento.textContent = `Esta oferta aplica un descuento del ${porcentaje}% al total neto de la noche generando un descuento del ${descuentoAplicado}.`
                                } else if (tipoAplicacion === "cantidadFija") {
                                    descripcionDescuento.textContent = `Esta oferta aplica un descuento del ${descuentoAplicado} al total neto de la noche.`
                                }
                                contenedorDescuentosAlTotalNetoNoche.appendChild(descripcionDescuento)
                                contenedorDescuentos_renderizado.appendChild(contenedorDescuentosAlTotalNetoNoche)
                            })
                            const apartamentosIDVArray = Object.keys(porApartamento)
                            const selectorApartamentosRenderizados = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[contenedor=porNoche]").querySelector(`[noche="${fechaNoche}"]`).querySelectorAll(`[apartamentoIDV]`)
                            selectorApartamentosRenderizados.forEach((apartamentoRenderizado) => {
                                const apartamentoIDVRenderizado = apartamentoRenderizado.getAttribute("apartamentoIDV")
                                if (!apartamentosIDVArray.includes(apartamentoIDVRenderizado)) {
                                    apartamentoRenderizado.querySelector("[contenedor=descuentosAlNetoApartamento]")?.remove()
                                }
                            })
                            Object.entries(porApartamento).forEach(([apartamentoIDV, desgloseDelApartamento]) => {
                                const selectorApartamentoDelaNoche = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[contenedor=porNoche]").querySelector(`[noche="${fechaNoche}"]`).querySelector(`[apartamentoIDV="${apartamentoIDV}"]`)
                                const totalConDescuentos = desgloseDelApartamento.totalConDescuentos
                                const totalSinDescuentos = desgloseDelApartamento.totalSinDescuentos
                                const descuentosAplicados = desgloseDelApartamento.descuentosAplicados
                                const totalDescuentosAplicados = desgloseDelApartamento.totalDescuentosAplicados
                                const contenedorDescuentosGlobal_selector = selectorApartamentoDelaNoche.querySelector("[contenedor=descuentosAlNetoApartamento]")
                                if (!contenedorDescuentosGlobal_selector) {
                                    const contenedorDescuentosGlobal = document.createElement("div")
                                    contenedorDescuentosGlobal.setAttribute("contenedor", "descuentosAlNetoApartamento")
                                    selectorApartamentoDelaNoche.appendChild(contenedorDescuentosGlobal)
                                    const contendorGlobal = document.createElement("div")
                                    contendorGlobal.classList.add("padding6")
                                    contendorGlobal.setAttribute("contenedor", "descuentosGlobal")
                                    const totalDescuentosAplicadosUI = document.createElement("p")
                                    totalDescuentosAplicadosUI.setAttribute("dato", "totalDescuentosAplicados")
                                    contendorGlobal.appendChild(totalDescuentosAplicadosUI)
                                    const totalConDescuentosUI = document.createElement("p")
                                    totalConDescuentosUI.setAttribute("dato", "totalConDescuentos")
                                    contendorGlobal.appendChild(totalConDescuentosUI)
                                    contenedorDescuentosGlobal.appendChild(contendorGlobal)
                                    const contenedorDescuentos = document.createElement("div")
                                    contenedorDescuentos.setAttribute("contenedor", "descuentosPorApartamento")
                                    contenedorDescuentos.classList.add("contenedorDescuentosPorApartamento")
                                    contenedorDescuentosGlobal.appendChild(contenedorDescuentos)
                                    const titulo = document.createElement("div")
                                    titulo.classList.add("padding6", "negrita")
                                    titulo.textContent = "Descuentos aplicados al total neto del alojamiento"
                                    contenedorDescuentos.appendChild(titulo)
                                }
                                const contenedorDescuentosGlobal_renderizado = selectorApartamentoDelaNoche.querySelector("[contenedor=descuentosAlNetoApartamento]")
                                const totalDescuentosAplicadosUI = contenedorDescuentosGlobal_renderizado.querySelector("[dato=totalDescuentosAplicados]")
                                totalDescuentosAplicadosUI.textContent = totalDescuentosAplicados + "$ Descuentos aplicados al neto del apartamento"
                                const totalConDescuentos_ = contenedorDescuentosGlobal_renderizado.querySelector("[dato=totalConDescuentos]")
                                totalConDescuentos_.textContent = totalConDescuentos + "$ Neto del apartamento con descuentos aplicados"
                                const selectorDescuentosObsoletos = contenedorDescuentosGlobal_renderizado.querySelector("[contenedor=descuentosPorApartamento]").querySelectorAll("[contenedor=descuento]")
                                selectorDescuentosObsoletos.forEach((descuentoObsoleto) => {
                                    descuentoObsoleto?.remove()
                                })
                                descuentosAplicados.forEach((detallesDelDescuento) => {
                                    const fecha = detallesDelDescuento.fecha
                                    const ofertaUID = detallesDelDescuento.ofertaUID
                                    const porcentaje = detallesDelDescuento.porcentaje
                                    const nombreOferta = detallesDelDescuento.nombreOferta
                                    const apartamentoIDV = detallesDelDescuento.apartamentoIDV
                                    const tipoAplicacion = detallesDelDescuento.tipoAplicacion
                                    const descuentoAplicado = detallesDelDescuento.descuentoAplicado
                                    const totalConDescuento = detallesDelDescuento.totalConDescuento
                                    const contenedor = document.createElement("div")
                                    contenedor.classList.add("contenedorDescuentoPorApartamento")
                                    contenedor.setAttribute("contenedor", "descuento")
                                    contenedor.setAttribute("ofertaUID", ofertaUID)
                                    const nombreOfertaUI = document.createElement("div")
                                    nombreOfertaUI.classList.add("negrita")
                                    nombreOfertaUI.textContent = nombreOferta
                                    contenedor.appendChild(nombreOfertaUI)
                                    const descripcionDescuento = document.createElement("div")
                                    if (tipoAplicacion === "porcentaje") {
                                        descripcionDescuento.textContent = `Esta oferta aplica un descuento del ${porcentaje}% al total neto del apartamento, generando un descuento del ${descuentoAplicado}.`
                                    } else if (tipoAplicacion === "cantidadFija") {
                                        descripcionDescuento.textContent = `Esta oferta aplica un descuento del ${descuentoAplicado}, al total neto del apartamento`
                                    }
                                    contenedor.appendChild(descripcionDescuento)
                                    contenedorDescuentosGlobal_renderizado.querySelector("[contenedor=descuentosPorApartamento]").appendChild(contenedor)
                                })
                            })
                        })
                    }
                }
            },
            sobreControlPrecios: function () { },
            impuestos: function (data) {
                const destino = data.destino
                const impuestos = data.impuestos
                const instanciaUID = data.instanciaUID
                const contenedorFinanciero = document.querySelector(destino).querySelector("[contenedor=financiero]")
                const modoUI = contenedorFinanciero.getAttribute("modoUI")
                if (modoUI === "plaza" && impuestos.length === 0) {
                    return
                }
                const contenedorImpuestos_selector = contenedorFinanciero.querySelector("[contenedor=impuestos]")
                if (!contenedorImpuestos_selector) {
                    const contenedorPlegable = document.createElement('details');
                    contenedorPlegable.classList.add("contenedorEntidad", "sobreControlAnimacionGlobal")
                    contenedorPlegable.setAttribute("contenedor", "impuestos")
                    const tituloContenedorPlegable = document.createElement('summary');
                    tituloContenedorPlegable.setAttribute("elemento", "impuestos")
                    tituloContenedorPlegable.classList.add(
                        "padding12",
                    )
                    tituloContenedorPlegable.textContent = 'Impuestos aplicados';
                    contenedorPlegable.appendChild(tituloContenedorPlegable)
                    const contenedor = document.createElement("div")
                    contenedor.setAttribute("contenedor", "data")
                    contenedor.classList.add(
                        "contenedorImpuestos",
                        "flexVertical",
                        "gap6",
                    )
                    contenedorPlegable.appendChild(contenedor)
                    contenedorFinanciero.appendChild(contenedorPlegable)
                    if (modoUI === "administracion") {
                        const contenedorBotones = document.createElement("div")
                        contenedorBotones.classList.add(
                            "flexHorizontal",
                            "gap6",
                        )
                        const botonInsertarImpuesto = document.createElement("div")
                        botonInsertarImpuesto.classList.add(
                            "botonV3",
                            "comportamientoBoton"
                        )
                        botonInsertarImpuesto.textContent = "Insertar impuesto"
                        botonInsertarImpuesto.addEventListener("click", () => {
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.desgloseTotal.componentesUI.insertarImpuesto.ui({
                                instanciaUID_contenedorFinanciero: instanciaUID
                            })
                        })
                        contenedorBotones.appendChild(botonInsertarImpuesto)
                        contenedor.appendChild(contenedorBotones)
                        const botonInsertarImpuestoAdHoc = document.createElement("div")
                        botonInsertarImpuestoAdHoc.classList.add(
                            "botonV3",
                            "comportamientoBoton"
                        )
                        botonInsertarImpuestoAdHoc.textContent = "Crear e insertar impuesto dedicado"
                        botonInsertarImpuestoAdHoc.addEventListener("click", () => {
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.desgloseTotal.componentesUI.crearImpuestoAdHoc.ui({
                                instanciaUID_contenedorFinanciero: instanciaUID
                            })
                        })
                        contenedorBotones.appendChild(botonInsertarImpuestoAdHoc)
                        contenedor.appendChild(contenedorBotones)
                    }
                    if (modoUI === "simulador") {
                        const contenedorBotones = document.createElement("div")
                        contenedorBotones.classList.add(
                            "flexHorizontal",
                            "gap6",
                        )
                        const botonInsertarImpuesto = document.createElement("div")
                        botonInsertarImpuesto.classList.add(
                            "botonV3",
                            "comportamientoBoton"
                        )
                        botonInsertarImpuesto.textContent = "Insertar impuesto"
                        botonInsertarImpuesto.addEventListener("click", () => {
                            casaVitini.view.detallesSimulacion.componentesUI.insertarImpuesto.ui({
                                instanciaUID_contenedorFinanciero: instanciaUID
                            })
                        })
                        contenedorBotones.appendChild(botonInsertarImpuesto)
                        contenedor.appendChild(contenedorBotones)
                        const botonInsertarImpuestoAdHoc = document.createElement("div")
                        botonInsertarImpuestoAdHoc.classList.add(
                            "botonV3",
                            "comportamientoBoton"
                        )
                        botonInsertarImpuestoAdHoc.textContent = "Crear e insertar impuesto dedicado"
                        botonInsertarImpuestoAdHoc.addEventListener("click", () => {
                            casaVitini.view.detallesSimulacion.componentesUI.crearImpuestoAdHoc.ui({
                                instanciaUID_contenedorFinanciero: instanciaUID
                            })
                        })
                        contenedorBotones.appendChild(botonInsertarImpuestoAdHoc)
                        contenedor.appendChild(contenedorBotones)
                    }
                }
                const contenedorImpuestos_renderizado = contenedorFinanciero.querySelector("[contenedor=impuestos] [contenedor=data]")
                if (impuestos.length === 0) {
                    const impuestosRenderizadosObsoletos = contenedorImpuestos_renderizado.querySelectorAll("[contenedor=impuesto]")
                    impuestosRenderizadosObsoletos.forEach(impuestoRenderizado => { impuestoRenderizado.remove() })
                    const info = document.createElement("div")
                    info.setAttribute("elemento", "info")
                    info.classList.add(
                        "negrita",
                        "padding6",
                        "textoCentrado"
                    )
                    info.textContent = "No hay impuestos en este contenedor financiero."
                    const info_rederizado = contenedorImpuestos_renderizado.querySelector("[elemento=info]")
                    if (!info_rederizado) {
                        contenedorImpuestos_renderizado.appendChild(info)
                    }
                } else {
                    contenedorImpuestos_renderizado.querySelector("[elemento=info]")?.remove()
                }
                const tasaUI = (tasaIDV) => {
                    if (tasaIDV === "porcentaje") {
                        return "Porcentaje"
                    } else if (tasaIDV === "tasa") {
                        return "Tasa"
                    }
                }
                const impuestosIDV = impuestos.map((impuesto) => {
                    return String(impuesto.impuestoUID)
                })
                const selectorImpuestosRenderizadosObsoletos = contenedorImpuestos_renderizado.querySelectorAll("[contenedor=impuesto]")
                selectorImpuestosRenderizadosObsoletos.forEach((impuestoRenderizado) => {
                    const impuestoUID_renderizado = impuestoRenderizado.getAttribute("impuestoUID")
                    if (!impuestosIDV.includes(impuestoUID_renderizado)) {
                        impuestoRenderizado?.remove()
                    }
                })
                for (const impuesto of impuestos) {
                    const impuestoUID = impuesto.impuestoUID
                    const impuestoRenderizado = contenedorImpuestos_renderizado.querySelector(`[impuestoUID="${impuestoUID}"]`)
                    if (impuestoRenderizado) {
                        continue
                    }
                    const impuestoTitulo = impuesto.nombre
                    const entidadIDV = impuesto.entidadIDV
                    const tipoValor = impuesto.tipoValorIDV
                    const tipoImpositivo = impuesto.tipoImpositivo
                    const porcentaje = impuesto.porcentaje
                    const entidadDiccionadio = {
                        reserva: "Reserva",
                        servicio: "Servicios",
                        global: "Global"
                    }
                    const impuestoUI = document.createElement("div")
                    impuestoUI.classList.add(
                        "flexVertical",
                        "padding6",
                        "backgroundWhite5",
                        "borderRadius8",
                        "gap6"
                    )
                    impuestoUI.setAttribute("contenedor", "impuesto")
                    impuestoUI.setAttribute("impuestoUID", impuestoUID)
                    const nombreImpuestoUI = document.createElement("div")
                    nombreImpuestoUI.classList.add(
                        "padding6"
                    )
                    nombreImpuestoUI.classList.add("negrita")
                    nombreImpuestoUI.textContent = impuestoTitulo
                    impuestoUI.appendChild(nombreImpuestoUI)
                    const contenedorEntidad = document.createElement("div")
                    contenedorEntidad.classList.add(
                        "flexVertical",
                        "padding6"
                    )
                    impuestoUI.appendChild(contenedorEntidad)
                    const tituloEntidad = document.createElement("p")
                    tituloEntidad.textContent = "Entidad de aplicacíon"
                    contenedorEntidad.appendChild(tituloEntidad)
                    const entidadUI = document.createElement("p")
                    entidadUI.classList.add(
                        "negrita"
                    )
                    entidadUI.textContent = entidadDiccionadio[entidadIDV]
                    contenedorEntidad.appendChild(entidadUI)
                    let simboloTipoImpuesto;
                    if (tipoValor === "porcentaje") {
                        simboloTipoImpuesto = "%";
                    }
                    if (tipoValor === "tasa") {
                        simboloTipoImpuesto = "$";
                    }
                    const contendorValor = document.createElement("div")
                    contendorValor.classList.add(
                        "padding6",
                        "flexVertical"
                    )
                    const valorUI = document.createElement("div")
                    valorUI.classList.add("resumen_reserva_impuestoUITipoValor")
                    valorUI.textContent = tasaUI(tipoValor)
                    contendorValor.appendChild(valorUI)
                    if (tipoValor === "porcentaje") {
                        const porcentajeCalculado = document.createElement("div")
                        porcentajeCalculado.classList.add("resumen_reserva_impuestoUICalculoImpuestoPorcentaje")
                        porcentajeCalculado.textContent = porcentaje + "%"
                        contendorValor.appendChild(porcentajeCalculado)
                    }
                    const tipoImpositivoUI = document.createElement("div")
                    tipoImpositivoUI.classList.add("reserva_resumen_impuestoUITipoImpositivo")
                    tipoImpositivoUI.textContent = tipoImpositivo + "$"
                    contendorValor.appendChild(tipoImpositivoUI)
                    impuestoUI.appendChild(contendorValor)
                    if (modoUI === "administracion") {
                        const contenedorBotones = document.createElement("div")
                        contenedorBotones.classList.add(
                            "flexHorizontal",
                            "gap6",
                        )
                        const botonEliminarImpuesto = document.createElement("div")
                        botonEliminarImpuesto.classList.add(
                            "botonV3",
                            "comportamientoBoton"
                        )
                        botonEliminarImpuesto.textContent = "Eliminar impuesto de la reserva"
                        botonEliminarImpuesto.addEventListener("click", () => {
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.desgloseTotal.componentesUI.eliminarImpuesto.ui({
                                instanciaUID_contenedorFinanciero: instanciaUID,
                                nombreImpuesto: impuestoTitulo,
                                impuestoUID
                            })
                        })
                        contenedorBotones.appendChild(botonEliminarImpuesto)
                        impuestoUI.appendChild(contenedorBotones)
                    }
                    if (modoUI === "simulador") {
                        const contenedorBotones = document.createElement("div")
                        contenedorBotones.classList.add(
                            "flexHorizontal",
                            "gap6",
                        )
                        const botonEliminarImpuesto = document.createElement("div")
                        botonEliminarImpuesto.classList.add(
                            "botonV3",
                            "comportamientoBoton"
                        )
                        botonEliminarImpuesto.textContent = "Eliminar impuesto de la reserva"
                        botonEliminarImpuesto.addEventListener("click", () => {
                            casaVitini.view.detallesSimulacion.componentesUI.eliminarImpuesto.ui({
                                instanciaUID_contenedorFinanciero: instanciaUID,
                                nombreImpuesto: impuestoTitulo,
                                impuestoUID
                            })
                        })
                        contenedorBotones.appendChild(botonEliminarImpuesto)
                        impuestoUI.appendChild(contenedorBotones)
                    }
                    contenedorImpuestos_renderizado.appendChild(impuestoUI)
                }
            },
            totalesGlobales: function (data) {
                const destino = data.destino
                const totales = data.totales
                const instanciaUID = data.instanciaUID
                const totalNeto = totales?.totalNeto
                const totalFinal = totales?.totalFinal
                const totalDescuentos = totales?.totalDescuentos
                const impuestosAplicados = totales?.impuestosAplicados
                const totalNetoConDescuentos = totales?.totalNetoConDescuentos
                const contenedorFinanciero = document.querySelector(destino).querySelector("[contenedor=financiero]")
                const modoUI = contenedorFinanciero.getAttribute("modoUI")
                const contenedorTotales_selector = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[contenedor=totalesGlobales]")
                if (!contenedorTotales_selector) {
                    const contenedorPlegable = document.createElement("details")
                    contenedorPlegable.classList.add("contenedorEntidad", "sobreControlAnimacionGlobal")
                    contenedorPlegable.setAttribute("contenedor", "totalesGlobales")
                    contenedorPlegable.setAttribute("componente", "plegable")
                    document.querySelector(destino).querySelector("[contenedor=financiero]").appendChild(contenedorPlegable)
                    const totalesUITituloBloque = document.createElement("summary")
                    totalesUITituloBloque.classList.add(
                        "padding12",
                    )
                    totalesUITituloBloque.textContent = "Totales globales"
                    contenedorPlegable.appendChild(totalesUITituloBloque)
                    const contenedor = document.createElement("div")
                    contenedor.setAttribute("contenedor", "data")
                    contenedor.classList.add(
                        "contenedorImpuestos",
                        "flexVertical",
                        "gap6",
                    )
                    contenedorPlegable.appendChild(contenedor)
                    if (modoUI === "administracion") {
                        const contenedorBotones = document.createElement("div")
                        contenedorBotones.classList.add(
                            "flexHorizontal",
                            "gap6",
                        )
                        const botonInsertarDescuento = document.createElement("div")
                        botonInsertarDescuento.classList.add(
                            "botonV3",
                            "comportamientoBoton"
                        )
                        botonInsertarDescuento.textContent = "Reconstruir desglose financerio"
                        botonInsertarDescuento.addEventListener("click", () => {
                            casaVitini.view.__sharedMethods__.detallesReservaUI.categoriasGlobales.desgloseTotal.componentesUI.reconstruirDesgloseFinanciero.ui({
                                instanciaUID_contenedorFinanciero: instanciaUID,
                            })
                        })
                        contenedorBotones.appendChild(botonInsertarDescuento)
                        contenedor.appendChild(contenedorBotones)
                    }
                    if (modoUI === "simulador") {
                        const contenedorBotones = document.createElement("div")
                        contenedorBotones.classList.add(
                            "flexHorizontal",
                            "gap6",
                        )
                        const botonInsertarDescuento = document.createElement("div")
                        botonInsertarDescuento.classList.add(
                            "botonV3",
                            "comportamientoBoton"
                        )
                        botonInsertarDescuento.textContent = "Reconstruir desglose financerio"
                        botonInsertarDescuento.addEventListener("click", () => {
                            casaVitini.view.detallesSimulacion.componentesUI.reconstruirDesgloseFinanciero.ui({
                                instanciaUID_contenedorFinanciero: instanciaUID,
                            })
                        })
                        contenedorBotones.appendChild(botonInsertarDescuento)
                        contenedor.appendChild(contenedorBotones)
                    }
                }
                const contenedorTotales_renderizado = document.querySelector(destino).querySelector("[contenedor=financiero]").querySelector("[contenedor=totalesGlobales] [contenedor=data]")
                const contenedorTotalesNeto_selector = contenedorTotales_renderizado.querySelector("[contenedor=totalesNeto]")
                if (!contenedorTotalesNeto_selector) {
                    const contenedorTotalesNeto = document.createElement("div")
                    contenedorTotalesNeto.setAttribute("contenedor", "totalesNeto")
                    contenedorTotalesNeto.classList.add(
                        "backgroundGrey1",
                        "borderRadius8",
                        "flexVertical",
                        "padding6",
                        "gap6"
                    )
                    const contenedorTotalNetoUI = document.createElement("div")
                    contenedorTotalNetoUI.classList.add(
                        "flexVertical",
                        "padding6"
                    )
                    const totalReservaNetoUI = document.createElement("div")
                    totalReservaNetoUI.textContent = "Total neto"
                    contenedorTotalNetoUI.appendChild(totalReservaNetoUI)
                    const totalReservaNetoUI_ = document.createElement("div")
                    totalReservaNetoUI_.setAttribute("dato", "totalNeto")
                    totalReservaNetoUI_.classList.add(
                        "negrita"
                    )
                    contenedorTotalNetoUI.appendChild(totalReservaNetoUI_)
                    contenedorTotalesNeto.appendChild(contenedorTotalNetoUI)
                    const contenedorPromedioNoche = document.createElement("div")
                    contenedorPromedioNoche.classList.add(
                        "flexVertical",
                        "padding6"
                    )
                    const totalReservaNetoDiaUI = document.createElement("div")
                    totalReservaNetoDiaUI.textContent = "Precio medio neto de la reserva por noche"
                    const totalReservaNetoDiaUI_ = document.createElement("div")
                    totalReservaNetoDiaUI_.classList.add("negrita")
                    totalReservaNetoDiaUI_.setAttribute("dato", "totalNetoNocheMedio")
                    contenedorPromedioNoche.appendChild(totalReservaNetoDiaUI_)
                    contenedorTotales_renderizado.appendChild(contenedorTotalesNeto)
                }
                const contenedorTotalesNeto_renderizado = contenedorTotales_renderizado.querySelector("[contenedor=totalesNeto]")
                const totalNetoUI = contenedorTotalesNeto_renderizado.querySelector("[dato=totalNeto]")
                totalNetoUI.textContent = totalNeto
                const totalesDescuentos_selector = contenedorTotales_renderizado.querySelector("[contenedor=totalDescuentos]")
                if (!totalesDescuentos_selector && totalDescuentos) {
                    const contenedorTotalesDescuentos = document.createElement("div")
                    contenedorTotalesDescuentos.setAttribute("contenedor", "totalDescuentos")
                    contenedorTotalesDescuentos.classList.add(
                        "backgroundGrey1",
                        "borderRadius8",
                        "flexVertical",
                        "padding6",
                        "gap6"
                    )
                    contenedorTotales_renderizado.appendChild(contenedorTotalesDescuentos)
                    const contenedorTotalDescuentosAplicados = document.createElement("div")
                    contenedorTotalDescuentosAplicados.classList.add(
                        "flexVertical",
                        "padding6"
                    )
                    const totalDescuentosAplicadosUI = document.createElement("div")
                    totalDescuentosAplicadosUI.textContent = "Descuento total por todas las ofertas aplicadas"
                    contenedorTotalDescuentosAplicados.appendChild(totalDescuentosAplicadosUI)
                    const totalDescuentosAplicadosUI_ = document.createElement("div")
                    totalDescuentosAplicadosUI_.classList.add("negrita")
                    totalDescuentosAplicadosUI_.setAttribute("dato", "totalConDescuentoAplicado")
                    contenedorTotalDescuentosAplicados.appendChild(totalDescuentosAplicadosUI_)
                    contenedorTotalesDescuentos.appendChild(contenedorTotalDescuentosAplicados)
                    const contenedorTotalNetoConDescuentos = document.createElement("div")
                    contenedorTotalNetoConDescuentos.classList.add(
                        "flexVertical",
                        "padding6"
                    )
                    const totalNetoConDescuentosUI = document.createElement("div")
                    totalNetoConDescuentosUI.textContent = "Total neto con descuentos aplicados"
                    contenedorTotalNetoConDescuentos.appendChild(totalNetoConDescuentosUI)
                    const totalNetoConDescuentosUI_ = document.createElement("div")
                    totalNetoConDescuentosUI_.classList.add("negrita")
                    totalNetoConDescuentosUI_.setAttribute("dato", "totalNetoConDescuentos")
                    contenedorTotalNetoConDescuentos.appendChild(totalNetoConDescuentosUI_)
                    contenedorTotalesDescuentos.appendChild(contenedorTotalNetoConDescuentos)
                    const contenedorPromedio = document.createElement("div")
                    contenedorPromedio.classList.add(
                        "flexVertical",
                        "padding6"
                    )
                    const precioMedioConDescuentos = document.createElement("div")
                    precioMedioConDescuentos.textContent = "Precio medio neto de la reserva por noche con descuentos aplicados"
                    const precioMedioConDescuentos_ = document.createElement("div")
                    precioMedioConDescuentos_.classList.add("negrita")
                    precioMedioConDescuentos_.setAttribute("dato", "precioMedioConDescuentos")
                }
                const totalesDescuentos_renderizado = contenedorTotales_renderizado.querySelector("[contenedor=totalDescuentos]")
                if (!totalDescuentos) {
                    totalesDescuentos_renderizado?.remove()
                } else {
                    const totalConDescuentosAplicadosUI = totalesDescuentos_renderizado.querySelector("[dato=totalConDescuentoAplicado]")
                    totalConDescuentosAplicadosUI.textContent = totalDescuentos
                    const totalConDescuentosUI = totalesDescuentos_renderizado.querySelector("[dato=totalNetoConDescuentos]")
                    totalConDescuentosUI.textContent = totalNetoConDescuentos
                }
                const contenedorTotalesFinal_selector = contenedorTotales_renderizado.querySelector("[contenedor=totalesFinal]")
                if (!contenedorTotalesFinal_selector) {
                    const contenedorTotalesFinal = document.createElement("div")
                    contenedorTotalesFinal.setAttribute("contenedor", "totalesFinal")
                    contenedorTotalesFinal.classList.add(
                        "backgroundGrey1",
                        "borderRadius8",
                        "flexVertical",
                        "padding6",
                        "gap6"
                    )
                    contenedorTotales_renderizado.appendChild(contenedorTotalesFinal)
                    const contenedorTotalImpuestosAplicados = document.createElement("div")
                    contenedorTotalImpuestosAplicados.classList.add(
                        "flexVertical",
                        "padding6"
                    )
                    const totalImpuestosUI = document.createElement("div")
                    totalImpuestosUI.textContent = "Total impuestos aplicados"
                    contenedorTotalImpuestosAplicados.appendChild(totalImpuestosUI)
                    const totalImpuestosUI_ = document.createElement("div")
                    totalImpuestosUI_.classList.add("negrita")
                    totalImpuestosUI_.setAttribute("dato", "impuestosAplicados")
                    contenedorTotalImpuestosAplicados.appendChild(totalImpuestosUI_)
                    contenedorTotalesFinal.appendChild(contenedorTotalImpuestosAplicados)
                    const contenedorTotalFinal = document.createElement("div")
                    contenedorTotalFinal.classList.add(
                        "flexVertical",
                        "padding6"
                    )
                    const totalConImpuestosUI = document.createElement("div")
                    totalConImpuestosUI.textContent = "Total final"
                    contenedorTotalFinal.appendChild(totalConImpuestosUI)
                    const totalConImpuestosUI_ = document.createElement("div")
                    totalConImpuestosUI_.classList.add("negrita")
                    totalConImpuestosUI_.setAttribute("dato", "totalFinal")
                    contenedorTotalFinal.appendChild(totalConImpuestosUI_)
                    contenedorTotalesFinal.appendChild(contenedorTotalFinal)
                }
                const contenedorTotalesFinal_renderizado = contenedorTotales_renderizado.querySelector("[contenedor=totalesFinal]")
                const impuestosAplicadosUI = contenedorTotalesFinal_renderizado.querySelector("[dato=impuestosAplicados]")
                impuestosAplicadosUI.textContent = impuestosAplicados
                const totalFinalUI = contenedorTotalesFinal_renderizado.querySelector("[dato=totalFinal]")
                totalFinalUI.textContent = totalFinal
            },
        },
        constructorContenedor: function (contenedorFinanciero) {
            const desgloseFinanciero = contenedorFinanciero.desgloseFinanciero
            const instantaneaNoches = contenedorFinanciero.instantaneaNoches
            const instanneaOfertas = contenedorFinanciero.instantaneaOfertas
            const preciosAlterados = contenedorFinanciero.preciosAlterados
            const global = desgloseFinanciero.global
            const entidades = desgloseFinanciero.entidades
            const impuestos = desgloseFinanciero.impuestos
            const ofertasAplicadas = desgloseFinanciero.ofertasAplicadas
            const totalesPorApartamento = desgloseFinanciero.totalesPorApartamento
            const totalesPorNoche = desgloseFinanciero.totalesPorNoche
            const totales = desgloseFinanciero.totales
            const desgloseImpuestos = desgloseFinanciero.impuestos
            const ofertas = desgloseFinanciero.ofertas
            const destino = desgloseFinanciero.destino
            const selectorDestino = document.querySelector(destino).querySelector("[contenedor=financiero]")
            if (!selectorDestino) {
                const error = "totales no encuentra el elemento de destino, revisa el identificador del elemento"
                return casaVitini.ui.componentes.advertenciaInmersiva(error)
            }
            const simboloDescuento = {
                porcentaje: "%",
                cantidadFija: "$"
            }
            const contenedorDesgloseTotales = document.createElement("div")
            contenedorDesgloseTotales.classList.add("componentes_ui_desloseTotales_contenedor")
            const detallePorDiaUI = document.createElement("div")
            detallePorDiaUI.classList.add("reserva_resumen_desglose_pago_bloque")
            const detalleDiaUITitulo = document.createElement("div")
            detalleDiaUITitulo.classList.add("reserva_resumen_desglose_pago_titulo")
            detalleDiaUITitulo.textContent = "Detalle por noche"
            detallePorDiaUI.appendChild(detalleDiaUITitulo)
            const contenedorDesglosePorNoche = document.createElement("div")
            contenedorDesglosePorNoche.classList.add("reserva_resumen_desglose_porNoche")
            if (totalesPorNoche.length === 0) {
                const info = document.createElement("div")
                info.classList.add("componentes_ui_totales_mensajeInfoSinInformacion")
                info.textContent = "No hay información financiera para desglosar por noche"
                contenedorDesglosePorNoche.appendChild(info)
            }
            for (const detallePorNoche of totalesPorNoche) {
                const fechaNoche = detallePorNoche.fechaDiaConNoche
                const precioNetoNoche = detallePorNoche.precioNetoNoche
                const apartamentosDetallesPorNoche = detallePorNoche.apartamentos
                const apartamentoUI_ = document.createElement("div")
                apartamentoUI_.classList.add("contenedorDiaConNoche")
                const apartamentoUITitulo = document.createElement("div")
                apartamentoUITitulo.classList.add("reserva_resumen_apartamentoIUTitulo")
                apartamentoUITitulo.classList.add("negrita")
                apartamentoUITitulo.textContent = fechaNoche
                apartamentoUI_.appendChild(apartamentoUITitulo)
                const totalNetoNocheUI = document.createElement("div")
                totalNetoNocheUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                totalNetoNocheUI.classList.add("negrita")
                totalNetoNocheUI.textContent = precioNetoNoche + "$ Total neto noche"
                apartamentoUI_.appendChild(totalNetoNocheUI)
                for (const detalleApartmentoPorNoche of apartamentosDetallesPorNoche) {
                    const apartamentoUI = detalleApartmentoPorNoche.apartamentoUI
                    const precioNetoPorNoche = detalleApartmentoPorNoche.precioNetoNoche
                    const detalleApartamentosUITitulo = document.createElement("div")
                    detalleApartamentosUITitulo.classList.add("reserva_resumen_apartamentoUIPrecio")
                    detalleApartamentosUITitulo.classList.add("negrita")
                    detalleApartamentosUITitulo.classList.add("colorGris")
                    detalleApartamentosUITitulo.textContent = apartamentoUI
                    apartamentoUI_.appendChild(detalleApartamentosUITitulo)
                    const detalleApartamentosUIPreciNetoNoche = document.createElement("div")
                    detalleApartamentosUIPreciNetoNoche.classList.add("reserva_resumen_apartamentoUIPrecio")
                    detalleApartamentosUIPreciNetoNoche.textContent = precioNetoPorNoche + "$ / Neto por noche"
                    apartamentoUI_.appendChild(detalleApartamentosUIPreciNetoNoche)
                }
                contenedorDesglosePorNoche.appendChild(apartamentoUI_)
            }
            detallePorDiaUI.appendChild(contenedorDesglosePorNoche)
            contenedorDesgloseTotales.appendChild(detallePorDiaUI)
            const contenedorTotalesPorApartamento = document.createElement("div")
            contenedorTotalesPorApartamento.classList.add("reserva_resumen_desglose_porNoche")
            const alojamientoUI = document.createElement("div")
            alojamientoUI.classList.add("reserva_resumen_desglose_pago_bloque")
            const alojamientoUITitulo = document.createElement("div")
            alojamientoUITitulo.classList.add("reserva_resumen_desglose_pago_titulo")
            alojamientoUITitulo.textContent = "Precio total neto por apartamento"
            alojamientoUI.appendChild(alojamientoUITitulo)
            if (totalesPorApartamento.length === 0) {
                const info = document.createElement("div")
                info.classList.add("componentes_ui_totales_mensajeInfoSinInformacion")
                info.textContent = "No hay información financiera para desglosar por apartamento"
                alojamientoUI.appendChild(info)
            }
            for (const detalleDesglosePorApartamento of totalesPorApartamento) {
                const apartamentoUI_ = detalleDesglosePorApartamento.apartamentoUI
                const totalNetoApartamento = detalleDesglosePorApartamento.totalNetoRango
                const precioNetoMedioPorNoche = detalleDesglosePorApartamento.precioMedioNocheRango
                const apartamentoUI = document.createElement("div")
                apartamentoUI.classList.add("contenedorApartamento")
                const apartamentoUITitulo = document.createElement("div")
                apartamentoUITitulo.classList.add("contenedorTextoOferta")
                apartamentoUITitulo.classList.add("negrita")
                apartamentoUITitulo.textContent = apartamentoUI_
                apartamentoUI.appendChild(apartamentoUITitulo)
                const apartamentoUIPrecioNetoTotal = document.createElement("div")
                apartamentoUIPrecioNetoTotal.classList.add("textoDetallesPorApartamento")
                apartamentoUIPrecioNetoTotal.textContent = "Total neto: " + totalNetoApartamento + "$"
                apartamentoUI.appendChild(apartamentoUIPrecioNetoTotal)
                const apartamentoUIPrecioPromedioPorNoche = document.createElement("div")
                apartamentoUIPrecioPromedioPorNoche.classList.add("textoDetallesPorApartamento")
                apartamentoUIPrecioPromedioPorNoche.textContent = "Precio medio neto por noche: " + precioNetoMedioPorNoche + "$"
                apartamentoUI.appendChild(apartamentoUIPrecioPromedioPorNoche)
                alojamientoUI.appendChild(apartamentoUI)
            }
            contenedorTotalesPorApartamento.appendChild(alojamientoUI)
            contenedorDesgloseTotales.appendChild(contenedorTotalesPorApartamento)
            let controlContenido = "noDesplegar"
            const ofertasUI = document.createElement("div")
            ofertasUI.classList.add("reserva_resumen_desglose_pago_bloque")
            const ofertasUITitulo = document.createElement("div")
            ofertasUITitulo.classList.add("reserva_resumen_desglose_pago_titulo")
            ofertasUITitulo.textContent = "Ofertas aplicadas"
            ofertasUI.appendChild(ofertasUITitulo)
            for (const oferta of ofertas) {
                const porNumeroDeApartamentos = oferta.porNumeroDeApartamentos
                const porApartamentosEspecificos = oferta.porApartamentosEspecificos
                const porDiasDeReserva = oferta.porDiasDeReserva
                const porRangoDeFechas = oferta.porRangoDeFechas
                const porDiasDeAntelacion = oferta.porDiasDeAntelacion
                if (porNumeroDeApartamentos?.length) {
                    controlContenido = "desplegar"
                    const contenedorOfertaUI = document.createElement("div")
                    contenedorOfertaUI.classList.add("compomentes_ui_totales_ofertas_contenedorConjuntoOferta")
                    for (const detallesReserva of oferta.porNumeroDeApartamentos) {
                        const contenedorIndividualOferta = document.createElement("div")
                        contenedorIndividualOferta.classList.add("compomentes_ui_totales_ofertas_contenedorOferta")
                        const cantidad = detallesReserva.cantidad
                        const tipoDescuento = detallesReserva.tipoDescuento
                        const definicion = detallesReserva.definicion
                        const nombreOferta = detallesReserva.nombreOferta
                        const descuento = detallesReserva.descuento
                        let nombreOfertaUI = document.createElement("div")
                        nombreOfertaUI.classList.add("contenedorTextoOferta")
                        nombreOfertaUI.classList.add("negrita")
                        nombreOfertaUI.textContent = nombreOferta
                        contenedorIndividualOferta.appendChild(nombreOfertaUI)
                        const definicionOfertaUI = document.createElement("div")
                        definicionOfertaUI.classList.add("contenedorTextoOferta")
                        definicionOfertaUI.textContent = definicion
                        contenedorIndividualOferta.appendChild(definicionOfertaUI)
                        if (tipoDescuento === "porcentaje") {
                            const tipoDescuentoUI = document.createElement("div")
                            tipoDescuentoUI.classList.add("contenedorTextoOferta")
                            tipoDescuentoUI.textContent = "Descuento del " + cantidad + simboloDescuento[tipoDescuento] + " rebajando el neto de la reserva en " + descuento + "$"
                            contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                        }
                        if (tipoDescuento === "cantidadFija") {
                            const tipoDescuentoUI = document.createElement("div")
                            tipoDescuentoUI.classList.add("contenedorTextoOferta")
                            tipoDescuentoUI.textContent = "Descuento del " + cantidad + simboloDescuento[tipoDescuento] + " sobre el neto de la reserva"
                            contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                        }
                        contenedorOfertaUI.appendChild(contenedorIndividualOferta)
                    }
                    ofertasUI.appendChild(contenedorOfertaUI)
                }
                if (porApartamentosEspecificos?.length) {
                    controlContenido = "desplegar"
                    const contenedorOfertaUI = document.createElement("div")
                    contenedorOfertaUI.classList.add("compomentes_ui_totales_ofertas_contenedorConjuntoOferta")
                    for (const detallesOferta of oferta.porApartamentosEspecificos) {
                        const nombreOferta = detallesOferta.nombreOferta
                        const cantidad = detallesOferta.cantidad
                        const tipoDescuento = detallesOferta.tipoDescuento
                        const definicion = detallesOferta.definicion
                        const descuentoOferta = detallesOferta.descuentoOferta
                        const descuentoAplicadoA = detallesOferta.descuentoAplicadoA
                        const contenedorIndividualOferta = document.createElement("div")
                        contenedorIndividualOferta.classList.add("compomentes_ui_totales_ofertas_contenedorOferta")
                        const nombreOfertaUI = document.createElement("div")
                        nombreOfertaUI.classList.add("contenedorTextoOferta")
                        nombreOfertaUI.classList.add("negrita")
                        nombreOfertaUI.textContent = nombreOferta
                        contenedorIndividualOferta.appendChild(nombreOfertaUI)
                        const definicionOfertaUI = document.createElement("div")
                        definicionOfertaUI.classList.add("contenedorTextoOferta")
                        definicionOfertaUI.textContent = definicion
                        contenedorIndividualOferta.appendChild(definicionOfertaUI)
                        if (descuentoAplicadoA === "totalNetoApartamentoDedicado") {
                            const apartamentosEspecificos = detallesOferta.apartamentosEspecificos
                            const contenedorApartamentosEspecificos = document.createElement("div")
                            contenedorApartamentosEspecificos.classList.add("componentes_ui_totales_ofertas_apartamentosEspecificos_contenedor")
                            for (const detallesApartamento of apartamentosEspecificos) {
                                const apartamentoIDV = detallesApartamento.apartamentoIDV
                                const apartamentoUI = detallesApartamento.apartamentoUI
                                const tipoDescuento = detallesApartamento.tipoDescuento
                                const cantidad = detallesApartamento.cantidad
                                const descuento = detallesApartamento.descuento
                                const bloqueDetalleOferta = document.createElement("div")
                                bloqueDetalleOferta.classList.add("resumen_reserva_detalle_oferta_apartamentos_especificos")
                                const tituloApartamentoUI = document.createElement("div")
                                tituloApartamentoUI.classList.add("negrita")
                                tituloApartamentoUI.innerHTML = apartamentoUI
                                bloqueDetalleOferta.appendChild(tituloApartamentoUI)
                                const tipoDescuentoApartamentoUI = document.createElement("div")
                                tipoDescuentoApartamentoUI.textContent = tipoDescuento
                                const cantidadPorApartmento = document.createElement("div")
                                cantidadPorApartmento.textContent = "Descuento: " + cantidad + simboloDescuento[tipoDescuento]
                                bloqueDetalleOferta.appendChild(cantidadPorApartmento)
                                contenedorApartamentosEspecificos.appendChild(bloqueDetalleOferta)
                            }
                            contenedorIndividualOferta.appendChild(contenedorApartamentosEspecificos)
                        }
                        if (descuentoAplicadoA === "totalNetoReserva") {
                            const descuentoOfertaUI = document.createElement("div")
                            descuentoOfertaUI.classList.add("contenedorTextoOferta")
                            descuentoOfertaUI.textContent = descuentoOferta
                            contenedorIndividualOferta.appendChild(descuentoOfertaUI)
                            if (tipoDescuento === "porcentaje") {
                                const tipoDescuentoUI = document.createElement("div")
                                tipoDescuentoUI.classList.add("contenedorTextoOferta")
                                tipoDescuentoUI.textContent = "Descuento: " + cantidad + simboloDescuento[tipoDescuento]
                                contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                            }
                            if (tipoDescuento === "cantidadFija") {
                                const tipoDescuentoUI = document.createElement("div")
                                tipoDescuentoUI.classList.add("contenedorTextoOferta")
                                tipoDescuentoUI.textContent = "Descuento: " + cantidad + simboloDescuento[tipoDescuento]
                                contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                            }
                        }
                        contenedorOfertaUI.appendChild(contenedorIndividualOferta)
                    }
                    ofertasUI.appendChild(contenedorOfertaUI)
                }
                if (porDiasDeReserva?.length) {
                    controlContenido = "desplegar"
                    const contenedorOfertaUI = document.createElement("div")
                    contenedorOfertaUI.classList.add("compomentes_ui_totales_ofertas_contenedorConjuntoOferta")
                    for (const detatllesReserva of oferta.porDiasDeReserva) {
                        const cantidad = detatllesReserva.cantidad
                        const tipoDescuento = detatllesReserva.tipoDescuento
                        const nombreOferta = detatllesReserva.nombreOferta
                        const numero = detatllesReserva.numero
                        const simboloNumero = detatllesReserva.simboloNumero
                        const definicion = detatllesReserva.definicion
                        const descuento = detatllesReserva.descuento
                        const contenedorIndividualOferta = document.createElement("div")
                        contenedorIndividualOferta.classList.add("compomentes_ui_totales_ofertas_contenedorOferta")
                        const nombreOfertaUI = document.createElement("div")
                        nombreOfertaUI.classList.add("contenedorTextoOferta")
                        nombreOfertaUI.classList.add("negrita")
                        nombreOfertaUI.textContent = nombreOferta
                        contenedorIndividualOferta.appendChild(nombreOfertaUI)
                        const definicionUI = document.createElement("div")
                        definicionUI.classList.add("contenedorTextoOferta")
                        definicionUI.textContent = definicion
                        contenedorIndividualOferta.appendChild(definicionUI)
                        if (tipoDescuento === "porcentaje") {
                            const tipoDescuentoUI = document.createElement("div")
                            tipoDescuentoUI.classList.add("contenedorTextoOferta")
                            tipoDescuentoUI.textContent = "Descuento: " + cantidad + simboloDescuento[tipoDescuento] + " rebajando el neto de la reserva en " + descuento + "$"
                            contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                        }
                        if (tipoDescuento === "cantidadFija") {
                            const tipoDescuentoUI = document.createElement("div")
                            tipoDescuentoUI.classList.add("contenedorTextoOferta")
                            tipoDescuentoUI.textContent = "Descuento: " + cantidad + simboloDescuento[tipoDescuento]
                            contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                        }
                        const definicionOfertaUI = document.createElement("div")
                        definicionOfertaUI.classList.add("contenedorTextoOferta")
                        definicionOfertaUI.textContent = definicion
                        contenedorOfertaUI.appendChild(contenedorIndividualOferta)
                    }
                    ofertasUI.appendChild(contenedorOfertaUI)
                }
                if (porRangoDeFechas?.length) {
                    controlContenido = "desplegar"
                    const contenedorOfertaUI = document.createElement("div")
                    contenedorOfertaUI.classList.add("compomentes_ui_totales_ofertas_contenedorConjuntoOferta")
                    for (const detallesOferta of oferta.porRangoDeFechas) {
                        const cantidad = detallesOferta.cantidad
                        const tipoDescuento = detallesOferta.tipoDescuento
                        const definicion = detallesOferta.definicion
                        const nombreOferta = detallesOferta.nombreOferta
                        const diasAfectados = detallesOferta.diasAfectados
                        const descuento = detallesOferta.descuento
                        const contenedorIndividualOferta = document.createElement("div")
                        contenedorIndividualOferta.classList.add("compomentes_ui_totales_ofertas_contenedorOferta")
                        const nombreOfertaUI = document.createElement("div")
                        nombreOfertaUI.classList.add("contenedorTextoOferta")
                        nombreOfertaUI.classList.add("negrita")
                        nombreOfertaUI.textContent = nombreOferta
                        contenedorIndividualOferta.appendChild(nombreOfertaUI)
                        const definicionOfertaUI = document.createElement("div")
                        definicionOfertaUI.classList.add("contenedorTextoOferta")
                        definicionOfertaUI.textContent = definicion
                        contenedorIndividualOferta.appendChild(definicionOfertaUI)
                        const tipoDescuentoUI = document.createElement("div")
                        tipoDescuentoUI.classList.add("contenedorTextoOferta")
                        tipoDescuentoUI.textContent = "Descuento total de la oferta: " + descuento + "$"
                        contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                        const contenedorDiasEspecificos = document.createElement("div")
                        contenedorDiasEspecificos.classList.add("componentes_ui_totales_ofertas_diasEspecificos_contenedor")
                        for (const detalleDelDia of diasAfectados) {
                            const dia = detalleDelDia.dia
                            const totaDiaNetoConOferta = detalleDelDia.totaDiaNetoConOferta
                            const descuento = detalleDelDia.descuento
                            const bloque = document.createElement("div")
                            bloque.classList.add("resumen_reserva_detalle_oferta_apartamentos_especificos")
                            const tituloUI = document.createElement("div")
                            tituloUI.classList.add("negrita")
                            tituloUI.innerHTML = dia
                            bloque.appendChild(tituloUI)
                            const totalSinOferta = document.createElement("div")
                            totalSinOferta.textContent = "Total día con oferta: " + totaDiaNetoConOferta + "$"
                            bloque.appendChild(totalSinOferta)
                            const totalConOferta = document.createElement("div")
                            totalConOferta.textContent = "Descuento: " + descuento + "$"
                            bloque.appendChild(totalConOferta)
                            contenedorDiasEspecificos.appendChild(bloque)
                        }
                        contenedorIndividualOferta.appendChild(contenedorDiasEspecificos)
                        contenedorOfertaUI.appendChild(contenedorIndividualOferta)
                    }
                    ofertasUI.appendChild(contenedorOfertaUI)
                }
                if (porDiasDeAntelacion?.length) {
                    controlContenido = "desplegar"
                    const contenedorOfertaUI = document.createElement("div")
                    contenedorOfertaUI.classList.add("compomentes_ui_totales_ofertas_contenedorConjuntoOferta")
                    for (const detallesOferta of oferta.porDiasDeAntelacion) {
                        const cantidad = detallesOferta.cantidad
                        const tipoDescuento = detallesOferta.tipoDescuento
                        const definicion = detallesOferta.definicion
                        const nombreOferta = detallesOferta.nombreOferta
                        const descuento = detallesOferta.descuento
                        const contenedorIndividualOferta = document.createElement("div")
                        contenedorIndividualOferta.classList.add("compomentes_ui_totales_ofertas_contenedorOferta")
                        const nombreOfertaUI = document.createElement("div")
                        nombreOfertaUI.classList.add("contenedorTextoOferta")
                        nombreOfertaUI.classList.add("negrita")
                        nombreOfertaUI.textContent = nombreOferta
                        contenedorIndividualOferta.appendChild(nombreOfertaUI)
                        const definicionOfertaUI = document.createElement("div")
                        definicionOfertaUI.classList.add("contenedorTextoOferta")
                        definicionOfertaUI.textContent = definicion
                        contenedorIndividualOferta.appendChild(definicionOfertaUI)
                        if (tipoDescuento === "porcentaje") {
                            const tipoDescuentoUI = document.createElement("div")
                            tipoDescuentoUI.classList.add("contenedorTextoOferta")
                            tipoDescuentoUI.textContent = "Descuento del " + cantidad + "% sobre el neto de la reserva."
                            contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                        }
                        if (tipoDescuento === "cantidadFija") {
                            const tipoDescuentoUI = document.createElement("div")
                            tipoDescuentoUI.classList.add("contenedorTextoOferta")
                            tipoDescuentoUI.textContent = "Descuento de " + cantidad + "$ sobre el neto de la reserva"
                            contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                        }
                        contenedorOfertaUI.appendChild(contenedorIndividualOferta)
                    }
                    ofertasUI.appendChild(contenedorOfertaUI)
                }
            }
            if (controlContenido === "desplegar") {
                contenedorDesgloseTotales.appendChild(ofertasUI)
            }
            const impuestoUI = document.createElement("div")
            impuestoUI.classList.add("reserva_resumen_desglose_pago_bloque")
            const impuestoUITituloBloque = document.createElement("div")
            impuestoUITituloBloque.classList.add("reserva_resumen_desglose_pago_titulo")
            impuestoUITituloBloque.textContent = "Impuestos"
            impuestoUI.appendChild(impuestoUITituloBloque)
            if (desgloseImpuestos.length === 0) {
                const info = document.createElement("div")
                info.classList.add("componentes_ui_totales_mensajeInfoSinInformacion")
                info.textContent = "No hay información financiera sobre impuestos para mostrar"
                impuestoUI.appendChild(info)
            }
            desgloseImpuestos.forEach((impuesto) => {
                const impuestoTitulo = impuesto.nombreImpuesto
                const tipoValor = impuesto.tipoValor
                const tipoImpositivo = impuesto.tipoImpositivo
                const calculoImpuestoPorcentaje = impuesto.calculoImpuestoPorcentaje
                const impuestoUITitulo = document.createElement("div")
                impuestoUITitulo.classList.add("reserva_resumen_desglose_pago_elemento")
                const impuestoUITitulo_ = document.createElement("div")
                impuestoUITitulo_.classList.add("reserva_resumen_apartamentoIUTitulo")
                impuestoUITitulo_.classList.add("negrita")
                impuestoUITitulo_.textContent = impuestoTitulo
                impuestoUITitulo.appendChild(impuestoUITitulo_)
                let simboloTipoImpuesto;
                if (tipoValor === "porcentaje") {
                    simboloTipoImpuesto = "%";
                }
                if (tipoValor === "tasa") {
                    simboloTipoImpuesto = "$";
                }
                const impuestoUITipoImpositivo = document.createElement("div")
                impuestoUITipoImpositivo.classList.add("reserva_resumen_impuestoUITipoImpositivo")
                impuestoUITipoImpositivo.textContent = tipoImpositivo + simboloTipoImpuesto
                impuestoUITitulo.appendChild(impuestoUITipoImpositivo)
                const impuestoUITipoValor = document.createElement("div")
                impuestoUITipoValor.classList.add("resumen_reserva_impuestoUITipoValor")
                impuestoUITipoValor.textContent = tipoValor
                if (calculoImpuestoPorcentaje) {
                    const impuestoUICalculoImpuestoPorcentaje = document.createElement("div")
                    impuestoUICalculoImpuestoPorcentaje.classList.add("resumen_reserva_impuestoUICalculoImpuestoPorcentaje")
                    impuestoUICalculoImpuestoPorcentaje.textContent = calculoImpuestoPorcentaje + "$"
                    impuestoUITitulo.appendChild(impuestoUICalculoImpuestoPorcentaje)
                }
                impuestoUI.appendChild(impuestoUITitulo)
            })
            if (desgloseImpuestos.length > 0) {
                contenedorDesgloseTotales.appendChild(impuestoUI)
            }
            const totalesUI = document.createElement("div")
            totalesUI.classList.add("reserva_resumen_desglose_pago_bloque")
            const totalesUITituloBloque = document.createElement("div")
            totalesUITituloBloque.classList.add("reserva_resumen_desglose_pago_titulo")
            totalesUITituloBloque.textContent = "Totales"
            totalesUI.appendChild(totalesUITituloBloque)
            const totalPromedioNetoPorNoche = totales.promedioNetoPorNoche ?
                totales.promedioNetoPorNoche + "$" :
                "No hay informacion del total promedio neto por noche";
            const totalReservaNeto = totales.totalReservaNeto ? totales.totalReservaNeto + "$" : "No hay información del total neto de la reserva"
            const totalImpuestos = totales.totalImpuestos ? totales.totalImpuestos + "$" : "No hay información del total de los impuestos"
            const totalDescuentos = totales.totalDescuentos ? totales.totalDescuentos + "$" : "No hay infomración del total desconectado"
            const totalReservaNetoSinDescuentos = totales.totalReservaNetoSinOfertas ? totales.totalReservaNetoSinOfertas + "$" : "No hay informacion del total de la reserva sin descuentos"
            if (totales.totalReservaNeto) {
                const totalReservaNetoDiaUI = document.createElement("div")
                totalReservaNetoDiaUI.classList.add("detalleDelTotal")
                totalReservaNetoDiaUI.textContent = "Precio medio neto de la reserva por noche: " + totalPromedioNetoPorNoche
                totalesUI.appendChild(totalReservaNetoDiaUI)
                if (totales.totalDescuentos) {
                    const totalDescuentosAplicadosUI = document.createElement("div")
                    totalDescuentosAplicadosUI.classList.add("detalleDelTotal")
                    totalDescuentosAplicadosUI.textContent = "Descuento total por todas las ofertas aplicadas: " + totalDescuentos
                    totalesUI.appendChild(totalDescuentosAplicadosUI)
                    const totalReservaNetoSinOfertasUI = document.createElement("div")
                    totalReservaNetoSinOfertasUI.classList.add("detalleDelTotal")
                    totalReservaNetoSinOfertasUI.textContent = "Total neto sin ofertas aplicadas: " + totalReservaNetoSinDescuentos
                    totalesUI.appendChild(totalReservaNetoSinOfertasUI)
                }
                const totalReservaNetoUI = document.createElement("div")
                totalReservaNetoUI.classList.add("detalleDelTotal")
                totalReservaNetoUI.textContent = "Total reserva neto: " + totalReservaNeto
                totalesUI.appendChild(totalReservaNetoUI)
                const totalImpuestosUI = document.createElement("div")
                totalImpuestosUI.classList.add("detalleDelTotal")
                totalImpuestosUI.textContent = "Total impuestos aplicados: " + totalImpuestos
                totalesUI.appendChild(totalImpuestosUI)
                const totalConImpuestosUI = document.createElement("div")
                totalConImpuestosUI.classList.add("detalleDelTotal")
                totalConImpuestosUI.classList.add("negrita")
                totalConImpuestosUI.textContent = "Total final: " + totales.totalConImpuestos + "$"
                totalesUI.appendChild(totalConImpuestosUI)
            } else {
                const info = document.createElement("div")
                info.classList.add("componentes_ui_totales_mensajeInfoSinInformacion")
                info.textContent = "No hay información de totales"
                totalesUI.appendChild(info)
            }
            contenedorDesgloseTotales.appendChild(totalesUI)
            selectorDestino.appendChild(contenedorDesgloseTotales)
        },
    },
}