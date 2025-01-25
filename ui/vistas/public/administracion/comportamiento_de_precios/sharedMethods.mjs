
export const sharedMethodsPricesBehavior = {
    traductorCambioVista: (oferta) => {
        oferta.preventDefault()
        oferta.stopPropagation()
        let vista = oferta.target.closest("[vista]").getAttribute("vista")
        let entrada = {
            "vista": vista,
            "tipoOrigen": "menuNavegador"
        }
        casaVitini.shell.navegacion.controladorVista(entrada)
    },
    detalleUI: async function (modo) {
        const selector = document.querySelector("[componente=espacioComportamiento]")

        if (modo !== "editarOferta" && modo !== "crearOferta") {
            const error = "¿En qué modo quieres que despliegue la interfaz de oferta en editarOferat o en crearOferta"
            casaVitini.ui.componentes.advertenciaInmersiva(error)
        }

        const divPrincipal = document.createElement("div");
        divPrincipal.setAttribute("componente", "espacioCrearOferta");
        divPrincipal.classList.add("espacioComportamiento");
        selector.appendChild(divPrincipal)

        if (modo === "editarOferta") {
            divPrincipal.classList.add("eventosDesactivadosInicialmente")
        }

        const divContenedorNombreYEstado = document.createElement("div");
        if (modo === "editarOferta") {
            divContenedorNombreYEstado.classList.add("crearOfertaContenedorHorizontalV2");
        }
        if (modo === "crearOferta") {
            divContenedorNombreYEstado.classList.add("crearOfertaContenedorHorizontal_modoCrear");
        }

        if (modo === "editarOferta") {
            const botonEstadoOferta = document.createElement("div")
            botonEstadoOferta.classList.add("creatOfertaBotonEstado")
            botonEstadoOferta.setAttribute("componente", "estadoComportamiento")
            botonEstadoOferta.addEventListener("click", (e) => { casaVitini.view.detallesComportamiento.estadoComportamiento(e) })
            botonEstadoOferta.style.pointerEvents = "all"
            botonEstadoOferta.textContent = "Comportamiento desactivado"
            divContenedorNombreYEstado.appendChild(botonEstadoOferta)
        }


        const input = document.createElement("input");
        input.setAttribute("type", "text");
        input.classList.add("preciosEImpuestosbotonOpcionCrearNuevoImpuesto");
        input.setAttribute("campoOferta", "nombreOferta");
        input.setAttribute("placeholder", "Escribe un nombre para idenfiticar el comportamiento");
        divContenedorNombreYEstado.appendChild(input)
        divPrincipal.appendChild(divContenedorNombreYEstado)


        const selectorTipoComportamiento = this.compomentesUI.barraGlobal()
        divPrincipal.appendChild(selectorTipoComportamiento)

        const contenedorTipoComportamiento = document.createElement("div")
        contenedorTipoComportamiento.setAttribute("contenedor", "tipoComportamientos")
        contenedorTipoComportamiento.classList.add(
            "flexVertical",
            "backgroundGrey1",
            "padding6",
            "borderRadius12",
            "ocultoInicial"
        )
        divPrincipal.appendChild(contenedorTipoComportamiento)



        const contenedorPorRango = this.compomentesUI.perfilesComportamiento.porRango()
        contenedorTipoComportamiento.appendChild(contenedorPorRango)
        const contenedorPorDias = this.compomentesUI.perfilesComportamiento.porDias()
        contenedorTipoComportamiento.appendChild(contenedorPorDias)
        const contenedorPorCreacion = await this.compomentesUI.perfilesComportamiento.porCreacion()
        contenedorTipoComportamiento.appendChild(contenedorPorCreacion)



        const divCrearOfertaEpacioBotones_3 = document.createElement("div");
        divCrearOfertaEpacioBotones_3.classList.add("crearOfertaEpacioBotones");
        divCrearOfertaEpacioBotones_3.style.pointerEvents = "all"
        divPrincipal.appendChild(divCrearOfertaEpacioBotones_3)


        const pbotonV2_negrita_3 = document.createElement("p");
        pbotonV2_negrita_3.classList.add("botonV2_negrita");
        pbotonV2_negrita_3.setAttribute("tipoOferta", "porApartamentoDedicado");
        divPrincipal.appendChild(pbotonV2_negrita_3)


        if (modo === "crearOferta") {
            pbotonV2_negrita_3.setAttribute("componente", "botonCrearOferta");
            pbotonV2_negrita_3.textContent = "Crear comportamiento";
            pbotonV2_negrita_3.addEventListener("click", () => {
                casaVitini.view.crearComortamientoConfirmar()
            })
        }
        if (modo === "editarOferta") {
            pbotonV2_negrita_3.setAttribute("componente", "botonEditarOferta");
            pbotonV2_negrita_3.textContent = "Editar comportamiento";
            pbotonV2_negrita_3.style.pointerEvents = "all"
            pbotonV2_negrita_3.addEventListener("click", casaVitini.view.detallesComportamiento.comportamientoModos)

            const pBotonGuardarOferta_03 = document.createElement("p");
            pBotonGuardarOferta_03.classList.add("botonV2_negrita");
            pBotonGuardarOferta_03.classList.add("elementoOcultoInicialmente");
            pBotonGuardarOferta_03.setAttribute("componente", "botonGuardarCambios");
            pBotonGuardarOferta_03.setAttribute("tipoOferta", "porApartamentoDedicado");
            pBotonGuardarOferta_03.addEventListener("click", casaVitini.view.detallesComportamiento.guardarCambiosComportamiento)
            pBotonGuardarOferta_03.textContent = "Guardar comportamiento";
            divCrearOfertaEpacioBotones_3.appendChild(pBotonGuardarOferta_03);

            const pBotonCancelarCambiosOferta_O3 = document.createElement("p");
            pBotonCancelarCambiosOferta_O3.classList.add("botonV2_negrita");
            pBotonCancelarCambiosOferta_O3.classList.add("elementoOcultoInicialmente");
            pBotonCancelarCambiosOferta_O3.setAttribute("componente", "botonCancelarCambios");
            pBotonCancelarCambiosOferta_O3.setAttribute("tipoOferta", "porApartamentoDedicado");
            pBotonCancelarCambiosOferta_O3.addEventListener("click", casaVitini.view.detallesComportamiento.comportamientoModos)
            pBotonCancelarCambiosOferta_O3.textContent = "Cancelar cambios y dejar de editar";
            divCrearOfertaEpacioBotones_3.appendChild(pBotonCancelarCambiosOferta_O3);

            const pBotonEliminarOferta_O3 = document.createElement("p");
            pBotonEliminarOferta_O3.classList.add("botonV2_negrita");
            pBotonEliminarOferta_O3.classList.add("elementoOcultoInicialmente");
            pBotonEliminarOferta_O3.setAttribute("componente", "botonEliminarOferta");
            pBotonEliminarOferta_O3.addEventListener("click", casaVitini.view.detallesComportamiento.eliminarComportamiento.UI)
            pBotonEliminarOferta_O3.textContent = "Eliminar comportamiento";
            divCrearOfertaEpacioBotones_3.appendChild(pBotonEliminarOferta_O3);
        }

        return divPrincipal


    },
    compomentesUI: {
        contenedorSelectorApartamento: () => {
            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()

            const contenedorApartamentos = document.createElement("div")
            contenedorApartamentos.setAttribute("instanciaUID", instanciaUID)
            contenedorApartamentos.setAttribute("contenedor", "apartamentosDelComportamiento")
            contenedorApartamentos.classList.add(
                "flexVertical",
                "gap6"
            );


            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add("crearComportameintoEspacioBotones")

            const pCrearOFertaBotonAnadirApartamento_31 = document.createElement("p");
            pCrearOFertaBotonAnadirApartamento_31.classList.add("crearOFertaBotonAnadirApartamento");
            pCrearOFertaBotonAnadirApartamento_31.setAttribute("componente", "botonAnadirApartamentoOferta");
            pCrearOFertaBotonAnadirApartamento_31.textContent = "Añadir apartamento";
            pCrearOFertaBotonAnadirApartamento_31.addEventListener("click", (e) => {
                casaVitini.view.apartamentosDisponibles({
                    e: e,
                    destino: `[instanciaUID="${instanciaUID}"] [componente=comportamientoSuperBloque]`
                })
            })
            contenedorBotones.appendChild(pCrearOFertaBotonAnadirApartamento_31);
            contenedorApartamentos.appendChild(contenedorBotones)

            const porApartamentoDedicado = document.createElement("div");
            porApartamentoDedicado.classList.add("espaciadoInterno");
            porApartamentoDedicado.setAttribute("zonaOferta", "porApartamentoDedicado");
            porApartamentoDedicado.setAttribute("contenedor", "apartamentos");

            const divCrearOfertaEspacioOpciones_3 = document.createElement("div");
            divCrearOfertaEspacioOpciones_3.classList.add("administracion_comportamientoPreciso_crearComportameinto_espacioContenedorApartamentos");
            divCrearOfertaEspacioOpciones_3.setAttribute("componente", "comportamientoSuperBloque")
            contenedorApartamentos.appendChild(divCrearOfertaEspacioOpciones_3);


            const pCrearOfertaTituloOpcion5_3 = document.createElement("p");
            pCrearOfertaTituloOpcion5_3.classList.add("crearComportamientoConentenedor");
            pCrearOfertaTituloOpcion5_3.setAttribute("componente", "infoDescuentoDedicados");
            pCrearOfertaTituloOpcion5_3.textContent =
                "Ahora mismo no tienes ningún apartamento seleccionado para poder aplicarle un comportamiento de precio.Pulsa en el botón Añadir apartamento para comenzar.";
            divCrearOfertaEspacioOpciones_3.appendChild(pCrearOfertaTituloOpcion5_3);
            return contenedorApartamentos

        },
        // insertarComportamientoPorAntelacion: function (data) {

        //     const diasAntelacion = data.diasAntelacion
        //     if (!diasAntelacion) {
        //         const error = "Inserta al menos un numero"
        //         return casaVitini.ui.componentes.advertenciaInmersiva(error)
        //     }

        //     const selectorPerfilRepedito = document.querySelector(`[perfil=diasAntelacion][diaAntelacion="${diasAntelacion}"]`)
        //     if (selectorPerfilRepedito) {
        //         const error = `Ya has insertar un perfil para ${diasAntelacion} de antelacion`
        //         return casaVitini.ui.componentes.advertenciaInmersiva(error)
        //     }

        //     const contenedor = document.createElement("div")
        //     contenedor.setAttribute("perfil", "diasAntelacion")
        //     contenedor.classList.add(
        //         "backgroundGrey1",
        //         "padding6"
        //     )
        //     contenedor.setAttribute("diaAntelacion", diasAntelacion)

        //     const botonEliminar = document.createElement("div")
        //     botonEliminar.classList.add("botonV1")
        //     botonEliminar.textContent = "Eliminar comportamiento"
        //     botonEliminar.addEventListener("click", (e) => {
        //         const contenedorUI = e.target.closest("[perfil=diasAntelacion]")
        //         contenedorUI.remove()
        //     })
        //     contenedor.appendChild(botonEliminar)

        //     const titulo = document.createElement("div")
        //     titulo.classList.add(
        //         "padding6"
        //     )
        //     titulo.textContent = `Aplicar comportamiento a los apartamentos cuando se haga una reserva con ${diasAntelacion} o más días de antelación`
        //     contenedor.appendChild(titulo)


        //     const selectorUI = this.contenedorSelectorApartamento()
        //     contenedor.appendChild(selectorUI)

        //     const destino = document.querySelector("[contenedor=comportamientosPorDiasAntelacion]")
        //     destino.appendChild(contenedor)
        // },
        barraGlobal: () => {
            const selectorBoton = (boton) => {
                const botonID = boton.target.getAttribute("botonTipo")
                casaVitini.view.__sharedMethods__.controladoresUI.opcionesTipo(botonID)
            }
            const selectorTipoComportamiento = document.createElement("div")
            selectorTipoComportamiento.classList.add("selectorTipoComportamiento")

            const botonTipoComportamiento_porRango = document.createElement("div")
            botonTipoComportamiento_porRango.classList.add("botonTipoComportamiento")
            botonTipoComportamiento_porRango.setAttribute("botonTipo", "porRango")
            botonTipoComportamiento_porRango.textContent = "Por rango de fechas"
            botonTipoComportamiento_porRango.addEventListener("click", selectorBoton)
            selectorTipoComportamiento.appendChild(botonTipoComportamiento_porRango)

            const botonTipoComportamiento_porCreacion = document.createElement("div")
            botonTipoComportamiento_porCreacion.classList.add("botonTipoComportamiento")
            botonTipoComportamiento_porCreacion.setAttribute("botonTipo", "porCreacion")
            botonTipoComportamiento_porCreacion.textContent = "Por rango de fechas y rango de creación de reserva"
            botonTipoComportamiento_porCreacion.addEventListener("click", selectorBoton)
            selectorTipoComportamiento.appendChild(botonTipoComportamiento_porCreacion)

            const botonTipoComportamiento_porDias = document.createElement("div")
            botonTipoComportamiento_porDias.classList.add("botonTipoComportamiento")
            botonTipoComportamiento_porDias.setAttribute("botonTipo", "porDias")
            botonTipoComportamiento_porDias.textContent = "Por días de la semana"
            botonTipoComportamiento_porDias.addEventListener("click", selectorBoton)
            selectorTipoComportamiento.appendChild(botonTipoComportamiento_porDias)

            const botonTipoComportamiento_porDiasAntelacion = document.createElement("div")
            botonTipoComportamiento_porDiasAntelacion.classList.add("botonTipoComportamiento")
            botonTipoComportamiento_porDiasAntelacion.setAttribute("botonTipo", "porAntelacion")
            botonTipoComportamiento_porDiasAntelacion.textContent = "Por días de antelación"
            botonTipoComportamiento_porDiasAntelacion.addEventListener("click", selectorBoton)

            return selectorTipoComportamiento
        },
        perfilesComportamiento: {

            porRango: () => {

                const instanciaUID_contenedorFechas = casaVitini.utilidades.codigoFechaInstancia()


                const contenedorTipoPorRango = document.createElement("div");
                contenedorTipoPorRango.classList.add("crearComportameintoContendorFechas");
                contenedorTipoPorRango.setAttribute("contenedor_tipoBloqueo", "porRango")
                contenedorTipoPorRango.setAttribute("instanciaUID_contenedorFechas", instanciaUID_contenedorFechas)

                const info = document.createElement("p")
                info.classList.add(
                    "padding6",
                    "textoCentrado"
                )
                info.textContent = "Seleccionar el rango de días en los cuales se aplicará el comportamiento de precio de los apartamentos."
                contenedorTipoPorRango.appendChild(info)
                const fechasRangoAplicacion = casaVitini.ui.componentes.componentesComplejos.contenedorFechasUI({
                    nombreContenedor: "rangoComportamiento",
                    modo: "administracion",
                    sobreControlConfiguracion: {
                        configuracionInicio: {
                            tituloCalendario: "Seleciona una fecha de inicio del comportamiento",
                            seleccionableDiaLimite: "si"
                        },
                        configuracionFin: {
                            tituloCalendario: "Seleciona una fecha de fin del comportamiento",
                            seleccionableDiaLimite: "si"
                        }
                    }
                })
                contenedorTipoPorRango.appendChild(fechasRangoAplicacion);

                const contenedorApartamentos = casaVitini.ui.componentes.componentesComplejos.selectorApartamentosEspecificosUI.despliegue({
                    textoContenedorVacio: "Añade apartamentos para determinar el comportamiento de precio.",
                    sobreControlConfiguracion: {
                        configuracionFin: {
                            tituloCalendario: "Seleciona una fecha de de fin del comportamiento",
                        }
                    },
                    opcionesUI: {
                        ui: casaVitini.view.__sharedMethods__.compomentesUI.opcionesApartamentoUI
                    }
                })

                contenedorTipoPorRango.appendChild(contenedorApartamentos);

                return contenedorTipoPorRango
            },
            porCreacion: async () => {
                const instanciaUID_contenedorFechas = casaVitini.utilidades.codigoFechaInstancia()

                const contenedorTipoPorCreacion = document.createElement("div");
                contenedorTipoPorCreacion.classList.add("crearComportameintoContendorFechas");
                contenedorTipoPorCreacion.setAttribute("contenedor_tipoBloqueo", "porCreacion")
                contenedorTipoPorCreacion.setAttribute("instanciaUID_contenedorFechas", instanciaUID_contenedorFechas)

                const info = document.createElement("p")
                info.classList.add(
                    "padding6",
                    "textoCentrado"
                )
                info.textContent = "Seleccionar el rango de días en los cuales se aplicará el comportamiento de precio de los apartamentos."
                contenedorTipoPorCreacion.appendChild(info)
                const fechasRangoAplicacion = casaVitini.ui.componentes.componentesComplejos.contenedorFechasUI({

                    nombreContenedor: "rangoComportamiento",
                    modo: "administracion",
                    sobreControlConfiguracion: {
                        configuracionInicio: {
                            tituloCalendario: "Seleciona una fecha de inicio del comportamiento",
                            seleccionableDiaLimite: "si"
                        },
                        configuracionFin: {
                            tituloCalendario: "Seleciona una fecha de de fin del comportamiento",
                            seleccionableDiaLimite: "si"
                        }
                    }
                })
                contenedorTipoPorCreacion.appendChild(fechasRangoAplicacion);
                const info1 = document.createElement("p")
                info1.classList.add(
                    "padding6",
                    "textoCentrado"
                )
                info1.textContent = "Selecciona el rango en el cual tiene que estar la fecha de creación de la reserva para aplicarse este comportamiento."
                contenedorTipoPorCreacion.appendChild(info1)
                const fechasRangoCreacion = casaVitini.ui.componentes.componentesComplejos.contenedorFechasUI({

                    nombreContenedor: "rangoReservaCreacion",
                    modo: "administracion",
                    sobreControlConfiguracion: {
                        configuracionInicio: {
                            tituloCalendario: "Seleciona la fecha de inicio del rango donde debe de estar la fecha de creación de la reserva",
                            seleccionableDiaLimite: "si"
                        },
                        configuracionFin: {
                            tituloCalendario: "Seleciona una fecha de de fin del rango donde debe de estar la fecha de creación de la reserva",
                            seleccionableDiaLimite: "si"
                        }
                    }

                })
                contenedorTipoPorCreacion.appendChild(fechasRangoCreacion);


                const contenedorApartamentos = casaVitini.ui.componentes.componentesComplejos.selectorApartamentosEspecificosUI.despliegue({
                    textoContenedorVacio: "Añade apartamentos para determinar el comportamiento de precio.",
                    opcionesUI: {
                        ui: casaVitini.view.__sharedMethods__.compomentesUI.opcionesApartamentoUI
                    }
                })

                contenedorTipoPorCreacion.appendChild(contenedorApartamentos);

                return contenedorTipoPorCreacion
            },
            porDias: () => {


                const selectorDiaSemana = (e) => {
                    const dia = e.target
                    const estadoDia = dia.getAttribute("estado")

                    if (estadoDia === "activado") {
                        dia.removeAttribute("style")
                        dia.removeAttribute("estado")
                    } else {
                        dia.setAttribute("estado", "activado")
                        dia.style.background = "blue"
                        dia.style.color = "white"
                    }
                }

                const comportamientoPorDias = document.createElement("div")
                comportamientoPorDias.classList.add("contenedorOculto");
                comportamientoPorDias.setAttribute("contenedor_tipoBloqueo", "porDias")
                comportamientoPorDias.classList.add(
                    "flexVertical",
                    "gap6"
                )

                const contenedorTipoPorDias = document.createElement("div");
                contenedorTipoPorDias.classList.add("contenedorPorDias");
                const dias = [
                    {
                        nombreIDV: "lunes",
                        nombreUI: "Lunes"
                    },
                    {
                        nombreIDV: "martes",
                        nombreUI: "Martes"
                    },
                    {
                        nombreIDV: "miercoles",
                        nombreUI: "Miércoles"
                    },
                    {
                        nombreIDV: "jueves",
                        nombreUI: "Jueves"
                    },
                    {
                        nombreIDV: "viernes",
                        nombreUI: "Viernes"
                    },
                    {
                        nombreIDV: "sabado",
                        nombreUI: "Sábado"
                    },
                    {
                        nombreIDV: "domingo",
                        nombreUI: "Domingo"
                    }
                ]

                for (const dia of dias) {
                    const nombreUI = dia.nombreUI
                    const nombreIDV = dia.nombreIDV

                    const diaUI = document.createElement("div")
                    diaUI.classList.add("diaUI")
                    diaUI.classList.add("negrita")
                    diaUI.setAttribute("componente", "diaUI")
                    diaUI.setAttribute("diaIDV", nombreIDV)
                    diaUI.textContent = nombreUI
                    diaUI.addEventListener("click", selectorDiaSemana)
                    contenedorTipoPorDias.appendChild(diaUI)
                }
                comportamientoPorDias.appendChild(contenedorTipoPorDias);

                const contenedorApartamentos = casaVitini.ui.componentes.componentesComplejos.selectorApartamentosEspecificosUI.despliegue({
                    textoContenedorVacio: "Añade apartamentos para determinar el comportamiento de precio.",
                    opcionesUI: {
                        ui: casaVitini.view.__sharedMethods__.compomentesUI.opcionesApartamentoUI
                    }
                })
                comportamientoPorDias.appendChild(contenedorApartamentos);
                return comportamientoPorDias

            },
            porDiasDeAntelacion: () => {
                const comportamientoPorAntelacion = document.createElement("div")
                comportamientoPorAntelacion.classList.add("contenedorOculto");
                comportamientoPorAntelacion.setAttribute("contenedor_tipoBloqueo", "porAntelacion")
                comportamientoPorAntelacion.classList.add(
                    "flexVertical",
                    "gap6",
                    "padding6"
                )

                contenedorTipoComportamiento.appendChild(comportamientoPorAntelacion);
                const fechasUI = casaVitini.ui.componentes.componentesComplejos.contenedorFechasUI({
                    modo: "administracion",
                    seleccionableDiaLimite: "si"
                })
                comportamientoPorAntelacion.appendChild(fechasUI)

                const contenedorSelectorAntelacion = document.createElement("div")
                contenedorSelectorAntelacion.classList.add(
                    "flexVertical"
                )
                comportamientoPorAntelacion.appendChild(contenedorSelectorAntelacion)

                const botonAnadirComportamientoPorDiasDeAntecion = document.createElement("div")
                botonAnadirComportamientoPorDiasDeAntecion.classList.add("botonV1")
                botonAnadirComportamientoPorDiasDeAntecion.textContent = "Añadir comportamiento por antelacion"
                botonAnadirComportamientoPorDiasDeAntecion.addEventListener("click", () => {
                    const campoDiasAntelacion = document.querySelector("[campo=diasAntelacion]").value
                    this.compomentesUI.insertarComportamientoPorAntelacion({
                        diasAntelacion: campoDiasAntelacion
                    })
                })
                comportamientoPorAntelacion.appendChild(botonAnadirComportamientoPorDiasDeAntecion)

                const entradDias = document.createElement("input")
                entradDias.setAttribute("campo", "diasAntelacion")
                entradDias.type = "number"
                entradDias.classList.add(
                    "padding6",
                    "borderRadius6"
                )
                entradDias.placeholder = "Inserta el numero maximo de dias de antelacion"
                comportamientoPorAntelacion.appendChild(entradDias)


                const contenedorPerfilDiasAntelacion = document.createElement("div")
                contenedorPerfilDiasAntelacion.setAttribute("contenedor", "comportamientosPorDiasAntelacion")
                comportamientoPorAntelacion.appendChild(contenedorPerfilDiasAntelacion)
                return comportamientoPorAntelacion
            }
        },
        comportamientosEnClonfictoUI: (data) => {
            const comportamientosEnConflicto = data.comportamientosEnConflicto
            const ui_ = document.createElement("div")
            ui_.classList.add(
                "flexVertical",
                "gap6"
            )
            comportamientosEnConflicto.forEach((comportamiento) => {
                const comportamientoUID = comportamiento.comportamientoUID
                const nombreComportamiento = comportamiento.nombreComportamiento
                const apartamentos = comportamiento.contenedor.apartamentos

                const comportamientoUI = document.createElement("a")
                comportamientoUI.classList.add(
                    "flexVertical",
                    "borderRadius14",
                    "backgroundWhite3",
                    "padding14",
                    "flexApiladoI",
                    "comportamientoBoton",
                    "ratonDefault",
                    "gap6"
                )
                comportamientoUI.setAttribute("href", "/administracion/comportamiento_de_precios/comportamiento:" + comportamientoUID)
                comportamientoUI.setAttribute("vista", "/administracion/comportamiento_de_precios/comportamiento:" + comportamientoUID)
                comportamientoUI.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)

                const tituloComportamiento = document.createElement("p")
                tituloComportamiento.classList.add(
                    "flexAplicadoI"
                )
                tituloComportamiento.textContent = "Nombre del comportamiento en conflicto:"
                comportamientoUI.appendChild(tituloComportamiento)

                const nombreComportamientoUI = document.createElement("p")
                nombreComportamientoUI.classList.add(
                    "negrita"
                )
                nombreComportamientoUI.textContent = nombreComportamiento
                comportamientoUI.appendChild(nombreComportamientoUI)

                const contenedorApartamentosEnConflicto = document.createElement("div")
                contenedorApartamentosEnConflicto.classList.add(
                    "flexVertical",
                    "gap6"
                )

                comportamientoUI.appendChild(contenedorApartamentosEnConflicto)


                const tituloAC = document.createElement("p")
                tituloAC.textContent = "Dentro de este comportamiento de precio, los apartamentos siguientes entran en conflicto con este comportameinto:"
                contenedorApartamentosEnConflicto.appendChild(tituloAC)

                apartamentos.forEach((apartamento) => {
                    const apartamentoIDV = apartamento.apartamentoIDV
                    const apartamentoUI = apartamento.apartamentoUI

                    const apartUI = document.createElement("div")
                    apartUI.classList.add("flexVertical")

                    const nombre = document.createElement("p")
                    nombre.classList.add("negrita")
                    nombre.textContent = apartamentoUI
                    apartUI.appendChild(nombre)

                    contenedorApartamentosEnConflicto.appendChild(apartUI)
                })

                ui_.appendChild(comportamientoUI)
            })
            return ui_
        },
        opcionesApartamentoUI: function (data) {
            const simboloIDV = data?.simboloIDV || ""
            const cantidad = data?.cantidad || ""

            const opcionesUI = document.createElement("div")
            opcionesUI.classList.add("flexVertical", "gap6")
            opcionesUI.setAttribute("contenedor", "apartamentoDedicado")

            const cantidadUI = document.createElement("input")
            cantidadUI.classList.add("botonV1Blanco_izquiera")
            cantidadUI.style.borderRadius = "4px"
            cantidadUI.setAttribute("campo", "cantidad")
            cantidadUI.placeholder = "Inserta la cantidad"
            cantidadUI.value = cantidad
            opcionesUI.appendChild(cantidadUI)
            const tipoDescuento = document.createElement("select")
            tipoDescuento.classList.add("botonV1BlancoIzquierda_campo")
            tipoDescuento.style.borderRadius = "4px"
            tipoDescuento.setAttribute("campo", "simboloIDV")

            const opcionPredeterminada = document.createElement("option")
            if (!simboloIDV) {
                opcionPredeterminada.selected = true;
            }
            opcionPredeterminada.disabled = true;
            opcionPredeterminada.value = ""
            opcionPredeterminada.text = "Selecciona el tipo de comportamiento"
            tipoDescuento.appendChild(opcionPredeterminada)
            const opciones = [
                { value: "aumentoPorcentaje", text: "Aumentar precio por porcentaje" },
                { value: "aumentoCantidad", text: "Aumentar precio por cantidad" },
                { value: "reducirCantidad", text: "Reducir precio por cantidad" },
                { value: "reducirPorcentaje", text: "Reducir precio por porcentaje" },
                { value: "precioEstablecido", text: "Establecer el precio" }
            ];
            for (const opcionData of opciones) {
                const opcion = document.createElement("option");
                if (simboloIDV === opcionData.value) {
                    opcion.selected = true;
                }
                opcion.value = opcionData.value;
                opcion.text = opcionData.text;
                tipoDescuento.appendChild(opcion);
            }
            opcionesUI.appendChild(tipoDescuento)
            return opcionesUI

        },
    },
    constructorObjeto: () => {
        const tipo = document.querySelector("[botonTipo][estado=activado]")?.getAttribute("botonTipo")
        const nombreComportamiento = document.querySelector("[campoOferta=nombreOferta]").value
        const contenedorGlobal = {
            nombreComportamiento: nombreComportamiento,
            contenedor: {
                tipo
            }
        }
        const contenedorComportamiento = contenedorGlobal.contenedor
        if (tipo === "porRango") {
            const area = document.querySelector(`[contenedor_tipobloqueo=porRango]`)
            const fechaInicio_ISO = area.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
            const fechaFinal_ISO = area.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")

            contenedorComportamiento.fechaInicio = fechaInicio_ISO
            contenedorComportamiento.fechaFinal = fechaFinal_ISO
            contenedorComportamiento.apartamentos = []
            const selectoresApartamentos = document.querySelectorAll(`[contenedor_tipobloqueo=porRango] [apartamentoIDV]`)
            selectoresApartamentos.forEach((apartamentos) => {
                const apartamentoIDV = apartamentos.getAttribute("apartamentoIDV")
                const cantidad = apartamentos.querySelector("[campo=cantidad]").value
                const simboloIDV = apartamentos.querySelector("[campo=simboloIDV]").value
                const apartamentoFinal = {
                    apartamentoIDV: apartamentoIDV,
                    cantidad: cantidad,
                    simboloIDV: simboloIDV
                }
                contenedorComportamiento.apartamentos.push(apartamentoFinal)
            })
        } else if (tipo === "porCreacion") {
            const area = document.querySelector(`[contenedor_tipobloqueo=porCreacion]`)
            const contenedorRangoComportamiento = area.querySelector("[nombreContenedor=rangoComportamiento]")
            const contenedorRangoReservaCreacion = area.querySelector("[nombreContenedor=rangoReservaCreacion]")

            const fechaInicioRangoComportamiento_ISO = contenedorRangoComportamiento.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
            const fechaFinalRangoComportamiento_ISO = contenedorRangoComportamiento.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")
            const fechaInicioRangoReservaCreacion_ISO = contenedorRangoReservaCreacion.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
            const fechaFinalRangoReservaCreacion_ISO = contenedorRangoReservaCreacion.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")

            contenedorComportamiento.fechaInicio = fechaInicioRangoComportamiento_ISO
            contenedorComportamiento.fechaFinal = fechaFinalRangoComportamiento_ISO
            contenedorComportamiento.fechaInicio_creacionReserva = fechaInicioRangoReservaCreacion_ISO
            contenedorComportamiento.fechaFinal_creacionReserva = fechaFinalRangoReservaCreacion_ISO
            contenedorComportamiento.apartamentos = []
            const selectoresApartamentos = document.querySelectorAll(`[contenedor_tipobloqueo=porCreacion] [apartamentoIDV]`)
            selectoresApartamentos.forEach((apartamentos) => {
                const apartamentoIDV = apartamentos.getAttribute("apartamentoIDV")
                const cantidad = apartamentos.querySelector("[campo=cantidad]").value
                const simboloIDV = apartamentos.querySelector("[campo=simboloIDV]").value
                const apartamentoFinal = {
                    apartamentoIDV: apartamentoIDV,
                    cantidad: cantidad,
                    simboloIDV: simboloIDV
                }
                contenedorComportamiento.apartamentos.push(apartamentoFinal)
            })
        } else if (tipo === "porDias") {
            const selectorDiasSeleccionados = document.querySelectorAll("[componente=diaUI][estado=activado]")
            const diasSeleccionados = []
            selectorDiasSeleccionados.forEach((diaSeleecionado) => {
                const diaIDV = diaSeleecionado.getAttribute("diaIDV")
                diasSeleccionados.push(diaIDV)
            })

            contenedorComportamiento.dias = diasSeleccionados
            const selectoresApartamentos = document.querySelectorAll(`[contenedor_tipobloqueo=porDias] [apartamentoIDV]`)
            contenedorComportamiento.apartamentos = []

            selectoresApartamentos.forEach((apartamentos) => {
                const apartamentoIDV = apartamentos.getAttribute("apartamentoIDV")
                const cantidad = apartamentos.querySelector("[campo=cantidad]").value
                const simboloIDV = apartamentos.querySelector("[campo=simboloIDV]").value
                const apartamentoFinal = {
                    apartamentoIDV: apartamentoIDV,
                    cantidad: cantidad,
                    simboloIDV: simboloIDV
                }
                contenedorComportamiento.apartamentos.push(apartamentoFinal)
            })
        } else if (tipo === "porAntelacion") {

            const area = document.querySelector(`[contenedor_tipobloqueo=porAntelacion]`)
            const fechaInicio_humana = area.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
            const fechaFinal_humana = area.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")

            const fechaInicio_ISO = casaVitini.utilidades.conversor.fecha_humana_hacia_ISO(fechaInicio_humana)
            const fechaFinal_ISO = casaVitini.utilidades.conversor.fecha_humana_hacia_ISO(fechaFinal_humana)

            contenedorComportamiento.fechaInicio = fechaInicio_ISO
            contenedorComportamiento.fechaFinal = fechaFinal_ISO
            const contenedorAntelaciones = []
            const selectorCotnenedorPorAntelacion = document.querySelectorAll(`[contenedor_tipobloqueo=porAntelacion] [diaAntelacion]`)

            selectorCotnenedorPorAntelacion.forEach((contenedor) => {

                const diasAntelacion = contenedor.getAttribute("diaAntelacion")
                const estructura = {
                    diasAntelacion: diasAntelacion,
                    apartamentos: {}
                }
                const selectorApartamentosPerfil = contenedor.querySelectorAll("[contenedor=apartamentoIDV]")
                selectorApartamentosPerfil.forEach((apartamentoDedicado) => {

                    const apartamentoIDV = apartamentoDedicado.getAttribute("apartamentoIDV")
                    const cantidad = apartamentoDedicado.querySelector("[campo=cantidad]").value
                    const simboloIDV = apartamentoDedicado.querySelector("[campo=simboloIDV]").value

                    const estructuraApartametno = {
                        cantidad,
                        simboloIDV
                    }
                    estructura.apartamentos[apartamentoIDV] = estructuraApartametno
                })
                contenedorAntelaciones.push(estructura)
            })

            contenedorComportamiento.perfilesAntelacion = contenedorAntelaciones
        }
        return contenedorGlobal


    },
    controladoresUI: {
        opcionesTipo: function(tipo)  {
            const selectorBotones = document.querySelectorAll("[botonTipo]")
            selectorBotones.forEach((boton) => {
                boton.removeAttribute("style")
                boton.removeAttribute("estado")

            })
            const botonSeleccionado = document.querySelector(`[botonTipo="${tipo}"]`)
            if (botonSeleccionado) {
                botonSeleccionado.style.background = "blue"
                botonSeleccionado.style.color = "white"
                botonSeleccionado.setAttribute("estado", "activado")

            }

            const selectoresContenedoresTipo = document.querySelectorAll(`[contenedor_tipobloqueo]`)
            selectoresContenedoresTipo.forEach((contenedor) => {
                contenedor.removeAttribute("style")
            })

            const contenedorSeleccionado = document.querySelector(`[contenedor_tipobloqueo="${tipo}"]`)
            if (contenedorSeleccionado) {
                document.querySelector("[contenedor=tipoComportamientos]").classList.remove("ocultoInicial")

                contenedorSeleccionado.style.display = "flex"
            }
        },
        selectorDiasSemana: function (diasArray)  {
            const selectorDias = document.querySelectorAll("[componente=diaUI]")
            selectorDias.forEach((dia) => {
                dia.removeAttribute("style")
                dia.removeAttribute("estado")
            })

            for (const diaIDV of diasArray) {
                const selectorDia = document.querySelector(`[componente=diaUI][diaIDV="${diaIDV}"]`)
                selectorDia.setAttribute("estado", "activado")
                selectorDia.style.background = "blue"
                selectorDia.style.color = "white"
            }
        }
    },
}