
export const serviciosUI_grupoOpciones = {
    serviciosUI_grupoOpciones: {
        contenedor_gruposDeOpciones: function () {
            const contenedor = document.createElement("div")
            contenedor.setAttribute("area", "grupoOpciones")
            contenedor.classList.add(
                "flexVertical",
                "gap6",
            )
            return contenedor
        },
        grupoDeOpciones: function () {
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

            const contenedorDeOpcionesDelGrupo = document.createElement("div")
            contenedorDeOpcionesDelGrupo.setAttribute("com", "opcionesDelGrupo")
            contenedorDeOpcionesDelGrupo.classList.add(
                "flexVertical",
                "gap6",
                "ratonDefault"
            )
            c.appendChild(contenedorDeOpcionesDelGrupo)
            return c
        },
        opcionUI: function (data) {
            const opcionIDV = data.opcionIDV
            const area = data.area
            const contenedorGlobal = document.createElement("details")
            contenedorGlobal.classList.add("contenedorOpcionServivicio", "padding6", "flexVertical")
            contenedorGlobal.setAttribute("opcionIDV", opcionIDV)


            const filaPrincipal = document.createElement("summary")
            filaPrincipal.classList.add("contenedorGlobal_hover", "filaOpcionServicio")
            filaPrincipal.setAttribute("selector", "opcion")
            contenedorGlobal.appendChild(filaPrincipal)


            const esferaSeleccionable = document.createElement("div")
            esferaSeleccionable.classList.add("esferaSeleccionable")
            filaPrincipal.appendChild(esferaSeleccionable)

            const indicadorDeSeleccion = document.createElement("div")
            indicadorDeSeleccion.setAttribute("componente", "indicadorSelecion")
            indicadorDeSeleccion.classList.add("indicadorDeSeleccion")
            esferaSeleccionable.appendChild(indicadorDeSeleccion)



            const tituloConf = document.createElement("p")
            tituloConf.setAttribute("data", "opcionUI")
            tituloConf.textContent = "Nombre de la opcion"
            filaPrincipal.appendChild(tituloConf)


            const contenedorDetallesOpcion = document.createElement("div")
            contenedorDetallesOpcion.classList.add("flexVertical")
            contenedorDetallesOpcion.style.paddingBottom = "6px"
            contenedorDetallesOpcion.style.paddingLeft = "42px"
            contenedorDetallesOpcion.style.gap = "6px"
            contenedorDetallesOpcion.setAttribute("com", "contenedorDetallesOpcion")

            contenedorGlobal.appendChild(contenedorDetallesOpcion)


            const contenedorPrecio = document.createElement("div")
            contenedorPrecio.classList.add("flexVertical", "gap4")
            contenedorPrecio.setAttribute("com", "contenedorPrecio")
            contenedorDetallesOpcion.appendChild(contenedorPrecio)


            const tituloPrecio = document.createElement("div")
            tituloPrecio.classList.add("negrita")
            tituloPrecio.textContent = "Precio:"
            contenedorPrecio.appendChild(tituloPrecio)


            const precioData = document.createElement("div")
            precioData.classList.add()
            precioData.setAttribute("com", "precioData")
            precioData.textContent = "00.00"
            contenedorPrecio.appendChild(precioData)



            const contenedorCantida = document.createElement("div")
            contenedorCantida.classList.add("flexVertical", "gap4")
            contenedorCantida.setAttribute("com", "contenedorCantidad")
            contenedorDetallesOpcion.appendChild(contenedorCantida)

            const infoCantida = document.createElement("p")
            infoCantida.classList.add("negrita")
            infoCantida.textContent = "Cantidad:"
            contenedorCantida.appendChild(infoCantida)

            const campoCantidad = document.createElement("input")
            campoCantidad.classList.add("borderRadius12", "padding10")
            campoCantidad.style.marginLeft = "-10px"
            campoCantidad.placeholder = "1"
            campoCantidad.style.maxWidth = "100px"

            campoCantidad.setAttribute("campo", "cantidad")
            campoCantidad.addEventListener('keypress', (e) => {
                if (e.key === '.' || e.key === ',' || e.key === '-') {
                    e.preventDefault();
                }
            });
            campoCantidad.addEventListener("input", (e) => {
                const field = e.target
                const value = field.value
                const valueVal = value.replaceAll(".", "1");
                e.target.value = valueVal
                const opcionIDV = field.closest("[opcionIDV]").getAttribute("opcionIDV")

                this.calcularTotalOpcion({
                    opcionIDV,
                    area: area
                })
            })


            campoCantidad.type = "number"
            campoCantidad.min = "1"
            campoCantidad.max = "1000"
            campoCantidad.value = "1"
            contenedorCantida.appendChild(campoCantidad)


            const contenedorDescuentoPorOpcion = document.createElement("div")
            contenedorDescuentoPorOpcion.classList.add("flexVertical")
            contenedorDetallesOpcion.appendChild(contenedorDescuentoPorOpcion)

            const superContenedorDescuento = this.aplicarDescuentoUI({
                nombreArea: "descuentoDeLaOpcion",
                metodoCalculo: "calcularTotalOpcion",
                titulo: "Aplicar descuento a la opción (Opcional)",
                parametrosCalculo: {
                    opcionIDV: opcionIDV,
                    area: area
                }
            })
            contenedorDescuentoPorOpcion.appendChild(superContenedorDescuento)

            const contenedorTotal = document.createElement("div")
            contenedorTotal.classList.add("flexVertical", "gap4")
            contenedorTotal.setAttribute("com", "contenedorTotal")
            contenedorDetallesOpcion.appendChild(contenedorTotal)

            const tituloTotal = document.createElement("div")
            tituloTotal.classList.add("negrita")
            tituloTotal.textContent = "Total:"
            contenedorTotal.appendChild(tituloTotal)


            const totalData = document.createElement("div")
            totalData.setAttribute("com", "total")
            totalData.textContent = "00.00"
            contenedorTotal.appendChild(totalData)

            return contenedorGlobal
        },
        controladorSeleccion: async function (e) {
            const opcion = e.target
            const opcionPulsada = opcion.closest("[selector=opcion]")
            const confGrupo = JSON.parse(opcion.closest("[conf]").getAttribute("conf"))
            const confSelNumero = confGrupo.confSelNumero
            const estadoActual = opcionPulsada.getAttribute("estado")
            const selectorGrupo = opcion.closest("[componente=grupo]")
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
        controladorEstadoGrupos: async function (areaGrupoOpciones) {
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
        controlNumerosNegativos: (numberAsString) => {
            const numberAsNumber = parseFloat(numberAsString)
            if (numberAsNumber < 0) {
                return "0.00"
            } else {
                return numberAsString
            }

        },
        calcularTotalOpcion: async function (data) {

            const semaforoID = "servicio_precioOpcion"
            const semaforo = casaVitini.utilidades.semaforo
            semaforo.crearInstancia(semaforoID)
            await semaforo.bloquear(semaforoID);
            try {
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const opcionIDV = data.opcionIDV
                const area = data.area
                const opcionIDV_sel = area.querySelector(`[opcionIDV="${opcionIDV}"]`)

                const precioOpcion_sel = opcionIDV_sel.querySelector("[com=precioData]")
                const cantidad_sel = opcionIDV_sel.querySelector("[campo=cantidad]")
                const tipoDescuento_sel = opcionIDV_sel.querySelector("[campo=tipoDescuento]")
                const cantidadDescuento_sel = opcionIDV_sel.querySelector("[campo=cantidadDescuento]")
                const total_sel = opcionIDV_sel.querySelector("[com=total]")

                if (!precioOpcion_sel) {

                    return
                }

                const precioOpcion_data = precioOpcion_sel.textContent
                const cantidad_data = cantidad_sel?.value || "1";
                const tipoDescuento_data = tipoDescuento_sel?.value || null
                const cantidadDescuento_data = cantidadDescuento_sel?.value || null
                const total_data = total_sel.textContent

                const resetData = {
                    precioOpcion_data,
                    cantidad_data,
                    tipoDescuento_data,
                    cantidadDescuento_data,
                    total_data,
                }

                const errorUI = "Ha ocurrido un error en los calculos y se han revertido"
                opcionIDV_sel.setAttribute("instanciaUID_calculoPrecioPorOpcion", instanciaUID)


                const resetPorError = () => {
                    if (cantidad_sel) {
                        cantidad_sel.value = resetData.cantidad_data
                    }
                    if (tipoDescuento_sel?.value) {
                        tipoDescuento_sel.value = resetData.tipoDescuento_data

                    }
                    if (cantidadDescuento_sel?.value) {
                        cantidadDescuento_sel.value = resetData.cantidadDescuento_data
                    }

                    total_sel.textContent = resetData.total_data
                }

                const instancia = (instanciaUID) => {
                    return document?.querySelector(`[instanciaUID_calculoPrecioPorOpcion="${instanciaUID}"]`)
                }

                total_sel.textContent = "Calculando..."
                //  await casaVitini.utilidades.ralentizador(2000)
                const tiposDescuentos = [
                    "cantidad",
                    "porcentaje"
                ]
                const dict = {
                    cantidad: "-",
                    porcentaje: "%"
                }

                const formato = /^\d+(\.\d{2})$/;


                numero1: precioOpcion_data,
                    numero2: cantidad_data,
                        operador: "*",
                            redondeo: "2",
                                calculo: "simple"
            })

            const calculadora = await casaVitini.utilidades.calculadora({
                numero1: precioOpcion_data,
                numero2: cantidad_data,
                operador: "*",
                redondeo: "2",
                calculo: "simple"
            })

            if (instancia(instanciaUID)) {
                if (calculadora.error) {
                    resetPorError()
                    return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(errorUI)
                }
                if (!tiposDescuentos.includes(tipoDescuento_data) || !formato.test(cantidadDescuento_data)) {
                    total_sel.textContent = this.controlNumerosNegativos(calculadora.resultado)
                    return this.calcularTotalServicio({ area })
                }
            } else {
                return
            }
            if (tiposDescuentos.includes(tipoDescuento_data) && formato.test(cantidadDescuento_data)) {

                const calculadoraDescuentos = await casaVitini.utilidades.calculadora({
                    numero1: calculadora.resultado,
                    numero2: cantidadDescuento_data,
                    operador: dict[tipoDescuento_data],
                    redondeo: "2",
                    calculo: "simple"
                })

                if (instancia(instanciaUID)) {

                    if (calculadoraDescuentos.error) {
                        return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(errorUI)
                    }

                    if (tipoDescuento_data === "cantidad") {
                        total_sel.textContent = this.controlNumerosNegativos(calculadoraDescuentos.resultado)
                    } else if (tipoDescuento_data === "porcentaje") {
                        total_sel.textContent = this.controlNumerosNegativos(calculadoraDescuentos.diferencia)
                    }
                    this.calcularTotalServicio({ area })
                }
            }
        } catch(error) {
            casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(error)
        } finally {
            semaforo.desbloquear(semaforoID);
        }

    },
    calcularTotalServicio: async function (data) {


        const semaforoID = "servicio_precioOpcion"
        const semaforo = casaVitini.utilidades.semaforo
        semaforo.crearInstancia(semaforoID)
        await semaforo.bloquear(semaforoID);

        try {



            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const area = data.area

            if (!area) { return }
            area.setAttribute("instancaiUID_calculoTotal", instanciaUID)
            const totalServicio = area.querySelector("[data=totalServicio]")
            const totalServicioConDescuentos = area.querySelector("[data=totalServicioConDescuentos]")
            const areaDescuentoTotalServicio = area.querySelector("[com=descuentoTotalServicio]")
            let tipoDescuento_sel
            let cantidadDescuento_sel
            if (areaDescuentoTotalServicio) {
                tipoDescuento_sel = areaDescuentoTotalServicio.querySelector("[campo=tipoDescuento]")
                cantidadDescuento_sel = areaDescuentoTotalServicio.querySelector("[campo=cantidadDescuento]")
            }



            const tipoDescuento_data = tipoDescuento_sel?.value
            const cantidadDescuento_data = cantidadDescuento_sel?.value
            totalServicio.textContent = "Calculando..."
            totalServicioConDescuentos.textContent = "Calculando..."

            const tiposDescuentos = [
                "cantidad",
                "porcentaje"
            ]
            const dict = {
                cantidad: "-",
                porcentaje: "%"
            }
            const formato = /^\d+(\.\d{2})$/;


            const instancia = (instanciaUID) => {
                return document?.querySelector(`[instancaiUID_calculoTotal="${instanciaUID}"]`)
            }

            const gruposDelServicio = area.querySelectorAll(`[grupoIDV]`)
            const totalesPorOpcion = []
            gruposDelServicio.forEach(gDS => {

                const opcionesDelGrupo = gDS.querySelectorAll("[opcionIDV]")
                opcionesDelGrupo.forEach(oDG => {
                    const estadoActivado = oDG.querySelector("[estado=activado]")
                    if (estadoActivado) {
                        const totalDeLaOpcion = oDG.querySelector("[com=total]")
                        if (totalDeLaOpcion) {
                            totalesPorOpcion.push(totalDeLaOpcion.textContent)

                        }
                    }
                })
            })
            if (totalesPorOpcion.length === 0) {
                totalServicio.textContent = "0.00"
                return
            }
            const calculadora = await casaVitini.shell.servidor({
                zona: "componentes/calculadora",
                numeros: totalesPorOpcion,
                calculo: "grupoDeNumeros",
                redondeo: "2"
            })
            if (instancia(instanciaUID)) {

                if (calculadora.error) {
                    totalServicio.textContent = "Error, vuelve a intentarlo"
                    return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(calculadora.error)
                }


                totalServicio.textContent = this.controlNumerosNegativos(calculadora.resultado)
                totalServicioConDescuentos.textContent = this.controlNumerosNegativos(calculadora.resultado)

            } else {
                return
            }

            if (tiposDescuentos.includes(tipoDescuento_data) && formato.test(cantidadDescuento_data)) {

                const calculadoraDescuentos = await casaVitini.utilidades.calculadora({
                    numero1: calculadora.resultado,
                    numero2: cantidadDescuento_data,
                    operador: dict[tipoDescuento_data],
                    redondeo: "2",
                    calculo: "simple"
                })

                if (instancia(instanciaUID)) {

                    if (calculadoraDescuentos.error) {
                        resetPorError()
                        return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(errorUI)
                    }

                    if (tipoDescuento_data === "cantidad") {
                        totalServicioConDescuentos.textContent = this.controlNumerosNegativos(calculadoraDescuentos.resultado)
                    } else if (tipoDescuento_data === "porcentaje") {
                        totalServicioConDescuentos.textContent = this.controlNumerosNegativos(calculadoraDescuentos.diferencia)
                    }


                }
            }

        } catch (error) {
            return casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(error)

        } finally {
            semaforo.desbloquear(semaforoID)
        }

    },
    aplicarDescuentoUI: function (data) {

        const nombreArea = data.nombreArea
        const metodoCalculo = data.metodoCalculo
        const titulo = data.titulo
        const parametrosCalculo = data.parametrosCalculo

        const controladorDescuento = (e) => {

            const elemento = e.target
            const areaDescuento = elemento.closest(`[com=${nombreArea}]`)
            const tipoDescuento = areaDescuento.querySelector("[campo=tipoDescuento]")
            const campoCantidad = areaDescuento.querySelector("[campo=cantidadDescuento]")

            const cantida_data = campoCantidad?.value
            const tipoDescuento_data = tipoDescuento?.value

            const formato = /^\d+(\.\d{2})$/;

            const tiposDescuentos = [
                "cantidad",
                "porcentaje"
            ]


            if (cantida_data.length === 0 || formato.test(cantida_data)) {
                campoCantidad.removeAttribute("style")


                if (tiposDescuentos.includes(tipoDescuento_data)) {
                    tipoDescuento.removeAttribute("style")
                    this[metodoCalculo](parametrosCalculo);
                } else {
                    tipoDescuento.style.background = "red"
                    tipoDescuento.style.color = "white"
                }
            } else {
                campoCantidad.style.background = "red"
                campoCantidad.style.color = "white"
            }

        }

        const superContenedorDescuento = document.createElement("details")
        superContenedorDescuento.classList.add("flexVertical", "padding6")
        superContenedorDescuento.setAttribute("com", nombreArea)
        superContenedorDescuento.setAttribute("area", "decuentoUI")

        superContenedorDescuento.style.marginLeft = "-28px";
        superContenedorDescuento.style.maxWidth = "500px";
        superContenedorDescuento.style.width = "100%";


        const tituloDescuento = document.createElement("summary")
        tituloDescuento.classList.add("negrita", "padding10")
        tituloDescuento.textContent = titulo
        superContenedorDescuento.appendChild(tituloDescuento)

        const contenedorDescuento = document.createElement("div")
        contenedorDescuento.classList.add("flexVertical", "padding6", "gap6")
        contenedorDescuento.style.paddingTop = "0px";
        contenedorDescuento.style.paddingLeft = "13px";
        contenedorDescuento.style.paddingRight = "0px";
        contenedorDescuento.style.paddingBottom = "0px";
        superContenedorDescuento.appendChild(contenedorDescuento)

        const infoDescuento = document.createElement("p")
        infoDescuento.style.paddingLeft = "10px"
        infoDescuento.textContent = "Recuerda que el formato es 0.00. Siempre pon dos decimales separados por punto."
        contenedorDescuento.appendChild(infoDescuento)


        const tipoDescuento = document.createElement("select")
        tipoDescuento.classList.add("campoDescuento")
        tipoDescuento.addEventListener("change", (e) => {
            controladorDescuento(e)
        })
        tipoDescuento.setAttribute("campo", "tipoDescuento")
        contenedorDescuento.appendChild(tipoDescuento)


        const o1 = document.createElement("option");
        o1.disabled = true;
        o1.selected = true
        o1.value = "sinDescuento"
        o1.text = "Seleciona el tipo de descuento";
        tipoDescuento.appendChild(o1)

        const o3 = document.createElement("option");
        o3.value = "cantidad"
        o3.text = "Descuento por cantidad";
        tipoDescuento.appendChild(o3)

        const o4 = document.createElement("option");
        o4.value = "porcentaje"
        o4.text = "Descuento por porcentaje";
        tipoDescuento.appendChild(o4)

        const descuentoData = document.createElement("input")
        descuentoData.classList.add("campoDescuento")
        descuentoData.setAttribute("campo", "cantidadDescuento")
        descuentoData.placeholder = "0.00"
        descuentoData.addEventListener("input", (e) => {
            controladorDescuento(e)
        })
        contenedorDescuento.appendChild(descuentoData)


        const botonNoAplicar = document.createElement("div")
        botonNoAplicar.classList.add("botonReset")
        botonNoAplicar.textContent = "No aplicar descuento y ocultar"
        botonNoAplicar.addEventListener("click", (e) => {

            const areaDescuento = e.target.closest(`[com=${nombreArea}]`)
            const tipoDescuento = areaDescuento.querySelector("[campo=tipoDescuento]")
            const campoCantidad = areaDescuento.querySelector("[campo=cantidadDescuento]")

            tipoDescuento.removeAttribute("style")
            campoCantidad.removeAttribute("style")

            tipoDescuento.value = "sinDescuento"
            campoCantidad.value = ""

            areaDescuento.open = false

            this[metodoCalculo](parametrosCalculo);


        })
        contenedorDescuento.appendChild(botonNoAplicar)

        return superContenedorDescuento

    },
}
}