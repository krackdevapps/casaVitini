
export const sharedMethods = {
    detalleUI: function (data) {
        const modoUI = data.modoUI
        const instanciaUID_contenedorFechas = casaVitini.utilidades.codigoFechaInstancia()

        const ui = document.createElement("div");
        ui.setAttribute("componente", "servicioUI");
        ui.classList.add(
            "servicioUI"
        )

        const contenedorNombreEstado = document.createElement("div");

        if (modoUI === "editar") {
            contenedorNombreEstado.classList.add("crearOfertaContenedorHorizontalV2");

            const botonEstadoOferta = document.createElement("div")
            botonEstadoOferta.classList.add("creatOfertaBotonEstado")
            botonEstadoOferta.setAttribute("componente", "estadoServicio")
            botonEstadoOferta.addEventListener("click", (e) => {
                casaVitini.view.detallesServicio.estadoUIControlador(e)
            })
            botonEstadoOferta.textContent = "Servicio desactivado"
            contenedorNombreEstado.appendChild(botonEstadoOferta)

        }
        if (modoUI === "crear") {
            contenedorNombreEstado.classList.add("crearOfertaContenedorHorizontalModoCrear");
        }

        const input = document.createElement("input");
        input.setAttribute("type", "text");
        input.classList.add(
            "padding12",
            "borderRadius10"
        );
        input.setAttribute("campo", "nombreServicio");
        input.setAttribute("placeholder", "Escriba el nombre de nuevo servicio");
        contenedorNombreEstado.appendChild(input)
        ui.appendChild(contenedorNombreEstado)



        const contenedorSelectoresGlobales = document.createElement("div")
        contenedorSelectoresGlobales.classList.add("contenedorSelectoresGlobales")

        const selectorZona = () => {
            const selector = document.createElement("select")
            selector.classList.add(
                "selector",
                "textCentrado"
            )
            selector.setAttribute("campo", "zonaIDV")
            const opcionPredeterminada = document.createElement("option")
            opcionPredeterminada.selected = true
            opcionPredeterminada.disabled = true;
            opcionPredeterminada.value = ""
            opcionPredeterminada.text = "Zona del servicio"
            selector.appendChild(opcionPredeterminada)
            const opciones = [
                { value: "publica", text: "Zona pública" },
                { value: "global", text: "Zona global" },
                { value: "privada", text: "Zona privada" }
            ]
            for (const opcionData of opciones) {
                const opcion = document.createElement("option");
                opcion.value = opcionData.value;
                opcion.text = opcionData.text;
                selector.appendChild(opcion);
            }
            return selector
        }
        contenedorSelectoresGlobales.appendChild(selectorZona())

        const selectorDuracion = () => {
            const selector = document.createElement("select")
            selector.classList.add(
                "selector",
                "textCentrado"
            )
            selector.setAttribute("campo", "duracionIDV")
            selector.addEventListener("change", (e) => {
                const sel = e.target.value
                const selectorFechas = document.querySelector("[contenedor=fechas]")
                if (sel === "permanente") {
                    selectorFechas.style.display = "none"
                } else if (sel === "rango") {
                    selectorFechas.style.display = "flex"
                }
            })
            const opcionPredeterminada = document.createElement("option")
            opcionPredeterminada.selected = true
            opcionPredeterminada.disabled = true;
            opcionPredeterminada.value = ""
            opcionPredeterminada.text = "Duración"
            selector.appendChild(opcionPredeterminada)
            const opciones = [
                { value: "permanente", text: "Permanente" },
                { value: "rango", text: "Solo durante un rango" }
            ]
            for (const opcionData of opciones) {
                const opcion = document.createElement("option");
                opcion.value = opcionData.value;
                opcion.text = opcionData.text;
                selector.appendChild(opcion);
            }
            return selector
        }
        contenedorSelectoresGlobales.appendChild(selectorDuracion())


        const selectorDisponibilidad = () => {
            const selector = document.createElement("select")
            selector.classList.add(
                "selector",
                "textCentrado"
            )
            selector.setAttribute("campo", "disponibilidadIDV")
            const opcionPredeterminada = document.createElement("option")
            opcionPredeterminada.selected = true
            opcionPredeterminada.disabled = true;
            opcionPredeterminada.value = ""
            opcionPredeterminada.text = "Disponibilidad"
            selector.appendChild(opcionPredeterminada)
            const opciones = [
                { value: "constante", text: "Constante" },
                { value: "variable", text: "Variable" }
            ]
            for (const opcionData of opciones) {
                const opcion = document.createElement("option");
                opcion.value = opcionData.value;
                opcion.text = opcionData.text;
                selector.appendChild(opcion);
            }
            return selector
        }
        contenedorSelectoresGlobales.appendChild(selectorDisponibilidad())

        ui.appendChild(contenedorSelectoresGlobales);

        const divContenedor = document.createElement("div");
        divContenedor.classList.add("administracion_ofertas_crearOfertas_contenedorFecha");
        divContenedor.setAttribute("contenedor", "fechas")
        divContenedor.setAttribute("instanciaUID_contenedorFechas", instanciaUID_contenedorFechas)

        const divContenedorHorizontal = document.createElement("div");
        divContenedorHorizontal.classList.add("crearOfertaContenedorHorizontal");

        const divContenedorFechaInicio = document.createElement("div");
        divContenedorFechaInicio.classList.add("contenedorFecha");
        divContenedorFechaInicio.setAttribute("calendario", "entrada");
        divContenedorFechaInicio.setAttribute("componente", "inicioOferta");
        divContenedorFechaInicio.setAttribute("paralizadorEvento", "ocultadorCalendarios");
        divContenedorFechaInicio.addEventListener("click", async () => {
            await casaVitini.ui.componentes.calendario.configurarCalendario({
                perfilMes: "calendario_entrada_perfilSimple",
                contenedorOrigenIDV: "[calendario=entrada]",
                instanciaUID_contenedorFechas,
                rangoIDV: "inicioRango",
                metodoSelectorDia: null,
                tituloCalendario: "Seleciona una fehca de inicio de vigencia del servicio",
                seleccionableDiaLimite: "si"
            })
        })

        const pFechaInicio = document.createElement("p");
        pFechaInicio.classList.add("tituloFecha");
        pFechaInicio.textContent = "Fecha de inicio";

        const pFechaInicioSeleccionada = document.createElement("p");
        pFechaInicioSeleccionada.classList.add("fechaInicio");
        pFechaInicioSeleccionada.setAttribute("fechaUI", "fechaInicio");
        pFechaInicioSeleccionada.textContent = "(Seleccionar)";

        divContenedorFechaInicio.appendChild(pFechaInicio);
        divContenedorFechaInicio.appendChild(pFechaInicioSeleccionada);

        const divContenedorFechaFin = document.createElement("div");
        divContenedorFechaFin.classList.add("contenedorFecha");
        divContenedorFechaFin.setAttribute("calendario", "salida");
        divContenedorFechaFin.setAttribute("paralizadorEvento", "ocultadorCalendarios");
        divContenedorFechaFin.setAttribute("componente", "finOferta");

        divContenedorFechaFin.addEventListener("click", async () => {
            await casaVitini.ui.componentes.calendario.configurarCalendario({
                perfilMes: "calendario_salida_perfilSimple",
                contenedorOrigenIDV: "[calendario=salida]",
                instanciaUID_contenedorFechas,
                rangoIDV: "finalRango",
                metodoSelectorDia: null,
                tituloCalendario: "Seleciona una fehca de fin de vigencia del servicio",
                seleccionableDiaLimite: "si"

            })
        })

        const pFechaFin = document.createElement("p");
        pFechaFin.classList.add("tituloFecha");
        pFechaFin.textContent = "Fecha fin";

        const pFechaFinSeleccionada = document.createElement("p");
        pFechaFinSeleccionada.classList.add("fechaFin");
        pFechaFinSeleccionada.setAttribute("fechaUI", "fechaFin");
        pFechaFinSeleccionada.textContent = "(Seleccionar)";

        divContenedorFechaFin.appendChild(pFechaFin);
        divContenedorFechaFin.appendChild(pFechaFinSeleccionada);

        divContenedorHorizontal.appendChild(divContenedorFechaInicio);
        divContenedorHorizontal.appendChild(divContenedorFechaFin);

        divContenedor.appendChild(divContenedorHorizontal);

        ui.appendChild(divContenedor);


        const contenedorDefinicion = () => {
            const contenedor = document.createElement("div")
            contenedor.setAttribute("contenedor", "definicion")
            contenedor.classList.add(
                "flexVertical",
                "gap6",
                "padding6",
                "backgroundGrey1",
                "borderRadius14"

            )
            const titulo = document.createElement("p")
            titulo.classList.add(
                "padding6"
            )
            titulo.textContent = "Define nombre público para el servicio y una definición."
            contenedor.appendChild(titulo)

            const campo = document.createElement("input")
            campo.setAttribute("campo", "tituloPublico")
            campo.classList.add(
                "padding10",
                "borderRadius10"
            )
            campo.placeholder = "Titulo del servicio"
            contenedor.appendChild(campo)


            const definicion = document.createElement("textarea")
            definicion.setAttribute("campo", "definicion")
            definicion.classList.add(
                "padding10",
                "borderRadius10",
                "resizeOnlyVertical",
                "area300px",

            )
            definicion.placeholder = "Definición del servicio"
            contenedor.appendChild(definicion)

            return contenedor
        }

        ui.appendChild(contenedorDefinicion())





        // const contenedorPrecio = () => {
        //     const contenedor = document.createElement("div")
        //     contenedor.setAttribute("contenedor", "cantidad")
        //     contenedor.classList.add(
        //         "flexVertical",
        //         "gap6",


        //     )
        //     const titulo = document.createElement("p")
        //     titulo.classList.add(
        //         "padding6"
        //     )
        //     titulo.textContent = "Determina el tipo de selecicon del servicios"
        //     contenedor.appendChild(titulo)

        //     const selectorTipoServicio = document.createElement("select")
        //     selectorTipoServicio.setAttribute("campo", "tipoServicio")
        //     selectorTipoServicio.classList.add(
        //         "selectorLista"
        //     )
        //     contenedor.appendChild(selectorTipoServicio)

        //     const tituloSelector = document.createElement("option");
        //     tituloSelector.selected = true;
        //     tituloSelector.disabled = true;
        //     tituloSelector.text = "Seleccionar el tipo de servicio";
        //     selectorTipoServicio.appendChild(tituloSelector);

        //     const opciones = [
        //         { value: "opcionUnica", text: "Servicio de opcion unica" },
        //         { value: "opcionUnicaMultiOpcional", text: "Servicio de opcion unica entre varias opciones" },
        //         { value: "opcionMultiOpcional", text: "Servicio de opcion multiple" },
        //     ]
        //     for (const opcionData of opciones) {

        //         const opcion = document.createElement("option");
        //         opcion.value = opcionData.value;
        //         opcion.text = opcionData.text;
        //         selectorTipoServicio.appendChild(opcion);
        //     }


        //     const opcionUnicaUI = () => {
        //         const c = document.createElement("div")
        //         c.classList.add(
        //             "flexVertical",
        //             "gap6",
        //             "padding6",
        //             "backgroundGrey1",
        //             "borderRadius14"

        //         )

        //         const titulo = document.createElement("p")
        //         titulo.classList.add(
        //             "padding6", "negrita", "textoCentrado"
        //         )
        //         titulo.textContent = "Opción unica"
        //         c.appendChild(titulo)

        //         const o = document.createElement("input")
        //         o.setAttribute("campo", "tituloOpcion")
        //         o.classList.add(
        //             "padding10",
        //             "borderRadius10"
        //         )
        //         o.placeholder = "Escribe el nombre de la opcion"
        //         c.appendChild(o)


        //         const precio = document.createElement("input")
        //         precio.setAttribute("campo", "tituloOpcion")
        //         precio.classList.add(
        //             "padding10",
        //             "borderRadius10"
        //         )
        //         precio.placeholder = "Precio de la opcion, ejemplo 10.00"
        //         c.appendChild(precio)



        //         const infoCan = document.createElement("p")
        //         infoCan.classList.add(
        //             "padding6", "textoCentrado"
        //         )
        //         infoCan.textContent = "Si la cantiad minima y maxima son iguales, entonces la opcion de cantidad desaparecera"
        //         c.appendChild(infoCan)

        //         const contenedorCantidades = document.createElement("div")
        //         contenedorCantidades.classList.add(
        //             "gridHorizontal2C",
        //             "gap6"
        //         )
        //         c.appendChild(contenedorCantidades)


        //         const cMin = document.createElement("input")
        //         cMin.setAttribute("campo", "tituloOpcion")
        //         cMin.classList.add(
        //             "padding10",
        //             "borderRadius10"
        //         )
        //         cMin.placeholder = "Determina la cantidad minina solicitable en numero enteros"
        //         contenedorCantidades.appendChild(cMin)


        //         const cMax = document.createElement("input")
        //         cMin.setAttribute("campo", "tituloOpcion")
        //         cMax.classList.add(
        //             "padding10",
        //             "borderRadius10"
        //         )
        //         cMax.placeholder = "Determina la cantidad MAXIMA solicitable en numero enteros"
        //         contenedorCantidades.appendChild(cMax)

        //         return c
        //     }

        //     contenedor.appendChild(opcionUnicaUI())

        //     return contenedor
        // }

        ui.appendChild(this.grupoDeOpciones.areaConstruccion())

        return ui

    },
    botonesCrearServicio: function () {
        const boton = document.createElement("p");
        boton.classList.add("botonV1");
        boton.textContent = "Crear servicio";
        boton.setAttribute("boton", "crearServucui");
        boton.addEventListener("click", casaVitini.view.crearServicio)
        return boton
    },
    botonesModificar: function () {
        const boton = document.createElement("div")
        boton.classList.add("botonV1");
        boton.setAttribute("componente", "botonEditar");
        boton.setAttribute("contenedor", "botones");

        boton.addEventListener("click", () => {
            this.modosUI("modoEditar")
        })
        boton.textContent = "Modificar servicio";
        return boton
    },
    botonesDuranteModificacion: function () {
        const contenedor = document.createElement("div");
        contenedor.classList.add("contenedorBotones");
        contenedor.setAttribute("contenedor", "botones");

        const botonGuardar = document.createElement("div")
        botonGuardar.classList.add("botonV1");
        botonGuardar.setAttribute("componente", "botonGuardarCambios");
        botonGuardar.setAttribute("tipoOferta", "conXApartamentosEnConcreto");
        botonGuardar.addEventListener("click", () => {
            casaVitini.view.detallesServicio.guardarCambios()

        })
        botonGuardar.textContent = "Actualizar servicio";

        const botonCancelar = document.createElement("p");
        botonCancelar.classList.add("botonV1");
        botonCancelar.setAttribute("componente", "botonCancelarCambios");
        botonCancelar.setAttribute("tipoOferta", "conXApartamentosEnConcreto");
        botonCancelar.addEventListener("click", async () => {
            const selectorInstantena = document.querySelector("[componente=espacio][instantanea]").getAttribute("instantanea")
            const instantanea = JSON.parse(selectorInstantena)
            const instanciaUID_destino = document.querySelector(`main[instanciaUID]`).getAttribute("instanciaUID")
            casaVitini.view.detallesServicio.aplicaData({
                servicio: instantanea,
                instanciaUID_destino: instanciaUID_destino,
            })
        })
        botonCancelar.textContent = "Revertir cambios";

        const botonEliminar = document.createElement("p");
        botonEliminar.classList.add("botonV1");
        botonEliminar.setAttribute("componente", "botonEliminarOferta");
        botonEliminar.addEventListener("click", () => { casaVitini.view.detallesServicio.eliminarServicio.ui() })
        botonEliminar.textContent = "Eliminar servicio";
        contenedor.appendChild(botonGuardar);
        contenedor.appendChild(botonCancelar);
        contenedor.appendChild(botonEliminar);
        return contenedor
    },
    modosUI: async function (modo) {
        const contenedorBotones = document.querySelector("[componente=servicioUI]")
        contenedorBotones.querySelector("[contenedro=botones]")?.remove()
        if (modo === "modoEditar") {
            const botones =this.botonesDuranteModificacion()
            contenedorBotones.appendChild(botones)
            document.querySelector("[componente=soloLecturaInfo]")?.classList.remove("elementoOcultoInicialmente")
        }
        if (modo === "modoCancelar") {
            const botones =this.botonesModificar()
            contenedorBotones.appendChild(botones)
            document.querySelector("[componente=soloLecturaInfo]")?.classList.remove("elementoOcultoInicialmente")
        }
    },
    grupoDeOpciones: {
        areaConstruccion: function () {

            const contenedor = document.createElement("div")
            contenedor.setAttribute("area", "grupoOpciones")
            contenedor.classList.add(
                "flexVertical",
                "gap6",
            )
            const titulo = document.createElement("p")
            titulo.classList.add(
                "padding6",
                "textoCentrado"
            )
            titulo.textContent = "Grupos de opciones seleccionables"
            contenedor.appendChild(titulo)

            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add(
                "flexHorizontal"
            )
            contenedor.appendChild(contenedorBotones)

            const boton = document.createElement("div")
            boton.classList.add("botonV1")
            boton.textContent = "Crear grupo de opciones"
            boton.addEventListener("click", (e) => {
                const area = e.target.closest("[area=grupoOpciones]")
                const destino = area.querySelector("[contenedor=grupos]")
                destino.querySelector(":scope > [componente=sinInfo]")?.remove()
                destino.appendChild(this.grupoUI())
            })
            contenedorBotones.appendChild(boton)

            const contenedorGrupos = document.createElement("div")
            contenedorGrupos.setAttribute("contenedor", "grupos")
            contenedorGrupos.classList.add(
                "flexVertical",
                "gap6",
                "padding6",
                "borderGrey1",
                "borderRadius20"
            )
            contenedor.appendChild(contenedorGrupos)

            const sinInfo = this.infoSinComplemento("No hay ningun grupo de opciones")
            contenedorGrupos.appendChild(sinInfo)


            // const selectorTipoServicio = document.createElement("select")
            // selectorTipoServicio.setAttribute("campo", "tipoServicio")
            // selectorTipoServicio.classList.add(
            //     "selectorLista"
            // )
            // contenedor.appendChild(selectorTipoServicio)

            // const tituloSelector = document.createElement("option");
            // tituloSelector.selected = true;
            // tituloSelector.disabled = true;
            // tituloSelector.text = "Seleccionar el tipo de servicio";
            // selectorTipoServicio.appendChild(tituloSelector);

            // const opciones = [
            //     { value: "opcionUnica", text: "Servicio de opcion unica" },
            //     { value: "opcionUnicaMultiOpcional", text: "Servicio de opcion unica entre varias opciones" },
            //     { value: "opcionMultiOpcional", text: "Servicio de opcion multiple" },
            // ]
            // for (const opcionData of opciones) {

            //     const opcion = document.createElement("option");
            //     opcion.value = opcionData.value;
            //     opcion.text = opcionData.text;
            //     selectorTipoServicio.appendChild(opcion);
            // }


            // const opcionUnicaUI = () => {
            //     const c = document.createElement("div")
            //     c.classList.add(
            //         "flexVertical",
            //         "gap6",
            //         "padding6",
            //         "backgroundGrey1",
            //         "borderRadius14"

            //     )

            //     const titulo = document.createElement("p")
            //     titulo.classList.add(
            //         "padding6", "negrita", "textoCentrado"
            //     )
            //     titulo.textContent = "Opción unica"
            //     c.appendChild(titulo)

            //     const o = document.createElement("input")
            //     o.setAttribute("campo", "tituloOpcion")
            //     o.classList.add(
            //         "padding10",
            //         "borderRadius10"
            //     )
            //     o.placeholder = "Escribe el nombre de la opcion"
            //     c.appendChild(o)


            //     const precio = document.createElement("input")
            //     precio.setAttribute("campo", "tituloOpcion")
            //     precio.classList.add(
            //         "padding10",
            //         "borderRadius10"
            //     )
            //     precio.placeholder = "Precio de la opcion, ejemplo 10.00"
            //     c.appendChild(precio)



            //     const infoCan = document.createElement("p")
            //     infoCan.classList.add(
            //         "padding6", "textoCentrado"
            //     )
            //     infoCan.textContent = "Si la cantiad minima y maxima son iguales, entonces la opcion de cantidad desaparecera"
            //     c.appendChild(infoCan)

            //     const contenedorCantidades = document.createElement("div")
            //     contenedorCantidades.classList.add(
            //         "gridHorizontal2C",
            //         "gap6"
            //     )
            //     c.appendChild(contenedorCantidades)


            //     const cMin = document.createElement("input")
            //     cMin.setAttribute("campo", "tituloOpcion")
            //     cMin.classList.add(
            //         "padding10",
            //         "borderRadius10"
            //     )
            //     cMin.placeholder = "Determina la cantidad minina solicitable en numero enteros"
            //     contenedorCantidades.appendChild(cMin)


            //     const cMax = document.createElement("input")
            //     cMin.setAttribute("campo", "tituloOpcion")
            //     cMax.classList.add(
            //         "padding10",
            //         "borderRadius10"
            //     )
            //     cMax.placeholder = "Determina la cantidad MAXIMA solicitable en numero enteros"
            //     contenedorCantidades.appendChild(cMax)

            //     return c
            // }

            // contenedor.appendChild(opcionUnicaUI())

            return contenedor

        },
        grupoUI: function () {

            const c = document.createElement("div")
            c.setAttribute("componente", "grupo")
            c.classList.add(
                "flexVertical",
                "gap6",
                "padding6",
                "backgroundGrey1",
                "borderRadius14"

            )

            const titulo = document.createElement("p")
            titulo.classList.add(
                "padding6", "negrita", "textoCentrado"
            )
            titulo.textContent = "Titulo o definición del grupo"
            c.appendChild(titulo)


            const tituloC = document.createElement("input")
            tituloC.setAttribute("campo", "nombreGrupo")
            tituloC.classList.add(
                "padding10",
                "borderRadius10"
            )
            tituloC.placeholder = "Titulo o definición del grupo"
            c.appendChild(tituloC)


            const contructorConfGrupo = (conf) => {
                const confIDV = conf.confIDV
                const opciones = conf.opciones


                const opcionesDelContenedor = document.createElement("div")
                opcionesDelContenedor.setAttribute("area", "seleccion")
                opcionesDelContenedor.setAttribute("confIDV", confIDV)
                opcionesDelContenedor.classList.add(
                    "flexVertical",
                    "gap6",
                    "padding6",
                    "borderGrey1",
                    "borderRadius14",
                    "ratonDefault"
                )
                c.appendChild(opcionesDelContenedor)


                opciones.forEach((opcion) => {
                    const opcionUI = opcion.opcionUI
                    const opcionIDV = opcion.opcionIDV

                    const contenedorGlobal = document.createElement("div")
                    contenedorGlobal.classList.add("contenedorGlobal",)
                    contenedorGlobal.setAttribute("selector", "opcion")
                    contenedorGlobal.setAttribute("opcionIDV", opcionIDV)
                    contenedorGlobal.addEventListener("click", (e) => {

                        const botonesGrupo = e.target.closest("[area=seleccion]").querySelectorAll("[selector=opcion]")
                        botonesGrupo.forEach((b) => {
                            b.removeAttribute("estado")
                            const indicadorEsfera = b.querySelector("[componente=indicadorSelecion]")
                            indicadorEsfera.removeAttribute("style")

                        })
                        const contenedorSelecioando = e.target.closest("[selector=opcion]")
                        contenedorSelecioando.setAttribute("estado", "activado")
                        contenedorSelecioando.querySelector("[componente=indicadorSelecion]").style.background = "blue"


                    })
                    opcionesDelContenedor.appendChild(contenedorGlobal)

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
                    tituloConf.setAttribute("data", "servicioUI")
                    tituloConf.classList.add(
                        "padding6",
                    )
                    tituloConf.textContent = opcionUI
                    contenedorGlobal.appendChild(tituloConf)

                    opcionesDelContenedor.appendChild(contenedorGlobal)

                })
                return opcionesDelContenedor
            }



            const dataConfSeleccionObligatoria = {
                confIDV: "confSelObligatoria",
                opciones: [
                    {
                        opcionUI: "El grupo debe tener una opcion seleccionada obligatoriamente",
                        opcionIDV: "unaObligatoria"
                    },
                    {
                        opcionUI: "El grupo puede no tener ninguna opción seleccionada",
                        opcionIDV: "ningunaObligatoria"
                    },

                ]
            }


            c.appendChild(contructorConfGrupo(dataConfSeleccionObligatoria))

            const dataConfSeleccionNumero = {
                confIDV: "confSelNumero",
                opciones: [
                    {
                        opcionUI: "El grupo solo puede tener una opcion seleccionada",
                        opcionIDV: "maximoUnaOpcion"
                    },
                    {
                        opcionUI: "El grupo puede tener varias opciones seleccionadas",
                        opcionIDV: "variasOpcionesAlMismoTiempo"
                    },
                ]
            }

            c.appendChild(contructorConfGrupo(dataConfSeleccionNumero))

            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add(
                "flexHorizontal",
                "gap6"
            )
            c.appendChild(contenedorBotones)

            const boton = document.createElement("div")
            boton.classList.add(
                "botonV1"
            )
            boton.textContent = "Crear opción"
            boton.addEventListener("click", (e) => {
                const destino = c.querySelector("[contenedor=opciones]")
                destino.querySelector("[componente=sinInfo]")?.remove()
                destino.appendChild(this.opcionDelGrupo())

            })
            contenedorBotones.appendChild(boton)

            const botonE = document.createElement("div")
            botonE.classList.add(
                "botonV1"
            )
            botonE.textContent = "Elimintar este grupo"
            botonE.addEventListener("click", (e) => {
                const contenedorGrupos = e.target.closest("[contenedor=grupos]")
                c?.remove()
                const gruposRestantes = contenedorGrupos.querySelectorAll("[componente=grupo]")
                if (gruposRestantes.length === 0) {
                    contenedorGrupos.appendChild(this.infoSinComplemento("No hay ningun grupo de opciones"))
                }
            })
            contenedorBotones.appendChild(botonE)


            const contenedorOpciones = document.createElement("div")
            contenedorOpciones.setAttribute("contenedor", "opciones")
            contenedorOpciones.classList.add(
                "flexVertical",
                "gap6",
                "padding6",
                "borderGrey1",
                "borderRadius14"
            )
            c.appendChild(contenedorOpciones)

            const sinInfo = this.infoSinComplemento("No hay opciones en el grupo")
            contenedorOpciones.appendChild(sinInfo)

            return c
        },
        infoSinComplemento: function (data) {
            const info = document.createElement("p")
            info.classList.add("flexVertical", "textoCentrado", "padding14")
            info.setAttribute("componente", "sinInfo")
            info.textContent = data
            return info
        },
        opcionDelGrupo: function () {
            const contenedor = document.createElement("div")
            contenedor.setAttribute("componente", "opcion")
            contenedor.classList.add(
                "flexVertical",
                "gap6",
                "padding6",
                "backgroundGrey1",
                "borderRadius14"
            )
            const titulo = document.createElement("p")
            titulo.classList.add(
                "padding6",
                "textoCentrado"
            )
            titulo.textContent = "Nombre de la opcion"
            contenedor.appendChild(titulo)


            const tituloC = document.createElement("input")
            tituloC.setAttribute("campo", "nombreOpcion")
            tituloC.classList.add(
                "padding10",
                "borderRadius10"
            )
            tituloC.placeholder = "Nombre de la opcion"
            contenedor.appendChild(tituloC)


            const infoPrecio = document.createElement("p")
            infoPrecio.classList.add(
                "padding6",
            )
            infoPrecio.textContent = "Si esta opcion tiene un precio, escribalo abajo, si la opcion no tiene precio, dejaló en blanco."
            contenedor.appendChild(infoPrecio)

            const precioC = document.createElement("input")
            precioC.setAttribute("campo", "precioOpcion")
            precioC.classList.add(
                "padding10",
                "borderRadius10"
            )
            precioC.placeholder = "Precio de la opcion, ejemplo 00.00"
            contenedor.appendChild(precioC)


            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add(
                "flexHorizontal",
            )
            contenedor.appendChild(contenedorBotones)

            const boton = document.createElement("div")
            boton.style.borderRadius = "10px"
            boton.classList.add(
                "botonV4"
            )
            boton.textContent = "Eliminar opción"
            boton.addEventListener("click", (e) => {
                const contenedorOpciones = e.target.closest("[contenedor=opciones]")
                contenedor.remove()
                const opcionesRestantes = contenedorOpciones.querySelectorAll("[componente=opcion]")
                if (opcionesRestantes.length === 0) {
                    contenedorOpciones.appendChild(this.infoSinComplemento("No hay opciones en el grupo"))
                }

            })
            contenedorBotones.appendChild(boton)

            return contenedor
        }
    },
    constructorObjeto: function () {

        const nombreServicio = document.querySelector("[campo=nombreServicio]").value
        const fechaInicio_ISO = document.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
        const fechaFinal_ISO = document.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")

        const zonaIDV = document.querySelector("[campo=zonaIDV]").value
        const duracionIDV = document.querySelector("[campo=duracionIDV]").value
        const disponibilidadIDV = document.querySelector("[campo=disponibilidadIDV]").value

        const tituloPublico = document.querySelector("[campo=tituloPublico]").value
        const definicion = document.querySelector("[campo=definicion]").value

        const o = {
            nombreServicio,
            zonaIDV,
            contenedor: {
                duracionIDV: duracionIDV,
                disponibilidadIDV: disponibilidadIDV,
                tituloPublico: tituloPublico,
                definicion: definicion,
                gruposDeOpciones: []

            }
        }

        if (duracionIDV === "rango") {
            o.contenedor.fechaInicio = fechaInicio_ISO
            o.contenedor.fechaFinal = fechaFinal_ISO
        }

        const selectorGruposRenderizados = document.querySelector("[contenedor=grupos]").querySelectorAll("[componente=grupo]")

        selectorGruposRenderizados.forEach((g) => {

            const contenedorOpciones = {
                nombreGrupo: g.querySelector("[campo=nombreGrupo]").value,
                configuracionGrupo: [],
                opcionesGrupo: []
            }
            contenedorOpciones.configuracionGrupo = {}
            g.querySelectorAll("[area=seleccion]").forEach((cg) => {
                const confIDV = cg.getAttribute("confIDV")
                const confSeleccionada = []

                cg.querySelectorAll("[opcionIDV][estado=activado]").forEach((ocg) => {
                    const opcionIDV = ocg.getAttribute("opcionIDV")
                    confSeleccionada.push(opcionIDV)
                })
                contenedorOpciones.configuracionGrupo[confIDV] = confSeleccionada
            })
            const opcionesDelGrupo = g.querySelector("[contenedor=opciones]").querySelectorAll("[componente=opcion]")
            opcionesDelGrupo.forEach((og) => {

                const nombreOpcion = og.querySelector("[campo=nombreOpcion]").value
                const precioOpcion = og.querySelector("[campo=precioOpcion]").value
                const opcion = {
                    nombreOpcion,
                    precioOpcion
                }
                contenedorOpciones.opcionesGrupo.push(opcion)
            })
            o.contenedor.gruposDeOpciones.push(contenedorOpciones)
        })
        return o
    },

}