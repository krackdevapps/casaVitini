export const sharedMethods = {
    componenteUI: {
        botonesCrearOferta: () => {
            const pBotonCrearOferta_O1 = document.createElement("p");
            pBotonCrearOferta_O1.classList.add("botonV1");
            pBotonCrearOferta_O1.textContent = "Crear oferta";
            pBotonCrearOferta_O1.setAttribute("componente", "botonCrearOferta");
            pBotonCrearOferta_O1.addEventListener("click", casaVitini.view.crearOfertaConfirmar)
            return pBotonCrearOferta_O1
        },
        botonesModificarOferta: () => {
            const botonModificarOferta = document.createElement("div")
            botonModificarOferta.classList.add("botonV1");
            botonModificarOferta.setAttribute("componente", "botonEditarOferta");
            botonModificarOferta.setAttribute("tipoOferta", "conXApartamentosEnConcreto");
            botonModificarOferta.addEventListener("click", () => {
                casaVitini.view.detallesOferta.ofertaModos("modoEditar")
            })
            botonModificarOferta.textContent = "Modificar oferta";
            return botonModificarOferta
        },
        botonesDuranteModificacionOferta: function () {
            const divBotones_O1 = document.createElement("div");
            divBotones_O1.classList.add("crearOfertaEpacioBotones");
            divBotones_O1.setAttribute("componente", "espacioBotones")

            const pBotonGuardarOferta_O1 = document.createElement("div")
            pBotonGuardarOferta_O1.classList.add("botonV1");
            pBotonGuardarOferta_O1.setAttribute("componente", "botonGuardarCambios");
            pBotonGuardarOferta_O1.setAttribute("tipoOferta", "conXApartamentosEnConcreto");
            pBotonGuardarOferta_O1.addEventListener("click", casaVitini.view.detallesOferta.guardarCambiosOferta)
            pBotonGuardarOferta_O1.textContent = "Actualizar oferta";

            const pBotonCancelarCambiosOferta_O1 = document.createElement("p");
            pBotonCancelarCambiosOferta_O1.classList.add("botonV1");
            pBotonCancelarCambiosOferta_O1.setAttribute("componente", "botonCancelarCambios");
            pBotonCancelarCambiosOferta_O1.setAttribute("tipoOferta", "conXApartamentosEnConcreto");
            pBotonCancelarCambiosOferta_O1.addEventListener("click", async () => {
                const selectorInstantena = document.querySelector("[instantanea]").getAttribute("instantanea")
                const instantanea = JSON.parse(selectorInstantena)
                const instanciaUID_destino = document.querySelector(`main[instanciaUID]`).getAttribute("instanciaUID")
                await casaVitini.view.detallesOferta.aplicaData({
                    oferta: instantanea,
                    instanciaUID_destino: instanciaUID_destino,
                    modo: "resversion"
                })
            })
            pBotonCancelarCambiosOferta_O1.textContent = "Revertir cambios";

            const pBotonEliminarOferta_O1 = document.createElement("p");
            pBotonEliminarOferta_O1.classList.add("botonV1");
            pBotonEliminarOferta_O1.setAttribute("componente", "botonEliminarOferta");
            pBotonEliminarOferta_O1.addEventListener("click", () => { casaVitini.view.detallesOferta.eliminarOferta.UI() })
            pBotonEliminarOferta_O1.textContent = "Eliminar oferta";
            divBotones_O1.appendChild(pBotonGuardarOferta_O1);
            divBotones_O1.appendChild(pBotonCancelarCambiosOferta_O1);
            divBotones_O1.appendChild(pBotonEliminarOferta_O1);
            return divBotones_O1
        },
        contenedorDescuento: function (data) {
            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const zonaDespliegue = data?.zonaDespliegue
            const metodoSelectorDia = data?.metodoSelectorDia


            const contenedorDescuentos = document.createElement("div");
            contenedorDescuentos.classList.add("flexVertical");
            contenedorDescuentos.setAttribute("contenedorDescuento", instanciaUID)
            contenedorDescuentos.setAttribute("contenedor", "descuentos")
            contenedorDescuentos.setAttribute("instanciaUID", instanciaUID)





            const titulo = document.createElement("p");
            titulo.classList.add("padding14", "whiteSpace", "flexVerticalk");
            titulo.textContent =
                `Determina dónde se aplica el descuento de esta oferta.
                
Los descuentos se pueden aplicar a:
Toda la reserva.
Apartamentos específicos de la reserva. A diferencia de las condiciones, los descuentos se aplicarán solo a los apartamentos coincidentes.
A cada apartamento en la reserva. Se aplicará el mismo descuento a cada apartamento.

Por rango de fechas:
Esta opción permite aplicar descuentos individuales a los netos de los días seleccionados dentro de un rango o a los apartamentos seleccionados dentro de estos días.`;
            contenedorDescuentos.appendChild(titulo);


            const selectorDescuento = document.createElement("select");
            //selectorDescuento.classList.add("preciosEImpuestosbotonOpcionCrearNuevoImpuesto");
            selectorDescuento.setAttribute("campoOferta", "contextoAplicacion");
            selectorDescuento.setAttribute("componente", "tipoDescuento");
            selectorDescuento.addEventListener("input", (e) => {

                const t = e.target
                const tipoDescuento = t.value
                const contenedorDescuentos = t.closest("[contenedor=descuentos]")

                this.controladorDescuentos({
                    descuentoIDV: tipoDescuento,
                    contenedorDescuentos
                })
            })

            const opcionesSelector = [{
                nombre: "¿Donde se aplica el descuento de esta oferta?",
                inicial: "si",
            },
            {
                nombre: "Aplicación del descuento a cualquier apartamento de la reserva de manera individual.",
                descuentoIDV: "mismoDescuentoParaCadaApartamento",
            },
            {
                nombre: "Aplicación al neto de la reserva.",
                descuentoIDV: "totalNeto",
            },
            {
                nombre: "Aplicación a los días dentro de un rango.",
                descuentoIDV: "porRango",
            },
            {
                nombre: "Aplicación individual por apartamento.",
                descuentoIDV: "individualPorApartamento",
            },]


            for (const opcion of opcionesSelector) {

                const nombre = opcion.nombre
                const inicial = opcion.inicial
                const descuentoIDV = opcion.descuentoIDV

                const opcionUI = document.createElement("option")
                if (inicial === "si") {
                    opcionUI.selected = true;
                    opcionUI.disabled = true;
                } else {
                    opcionUI.value = descuentoIDV
                }
                opcionUI.textContent = nombre

                selectorDescuento.appendChild(opcionUI)
            }
            contenedorDescuentos.appendChild(selectorDescuento)
            const descuentoIndividualPorApartmento = this.descuentosUI.individualPorApartamento()
            contenedorDescuentos.appendChild(descuentoIndividualPorApartmento)
            const descuentoTotalNeto = this.descuentosUI.totalNeto()
            contenedorDescuentos.appendChild(descuentoTotalNeto)
            const mismoDescuentoParaCadaApartamento = this.descuentosUI.mismoDescuentoParaCadaApartamento()
            contenedorDescuentos.appendChild(mismoDescuentoParaCadaApartamento)
            const descuentoPorRango = this.descuentosUI.porRango.arranque({
                zonaDespliegue,
                metodoSelectorDia
            })
            contenedorDescuentos.appendChild(descuentoPorRango)

            return contenedorDescuentos

        },
        contenedorSelectorApartamentosEspecificos: () => {

            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const porApartamentoDedicado = document.createElement("div");
            porApartamentoDedicado.classList.add("contenedorDescuento");
            porApartamentoDedicado.setAttribute("instanciaUID", instanciaUID)

            const divCrearOfertaEspacioOpciones_3 = document.createElement("div");
            divCrearOfertaEspacioOpciones_3.classList.add("crearOfeartaEspacioOpciones");

            const divCrearOfertaConentenedor4_3 = document.createElement("div");
            divCrearOfertaConentenedor4_3.setAttribute("controladorDesliegue", "descuentosDedicados");
            divCrearOfertaConentenedor4_3.setAttribute("parteOferta", "descuentosDedicados");


            const contenedorSelectorApartamentos = document.createElement("div");
            contenedorSelectorApartamentos.classList.add("crearOfertaConentenedor");
            contenedorSelectorApartamentos.setAttribute("parteOferta", "apartamentosDedicados");

            const pCrearOFertaBotonAnadirApartamento_3 = document.createElement("p");
            pCrearOFertaBotonAnadirApartamento_3.classList.add("crearOFertaBotonAnadirApartamento");
            pCrearOFertaBotonAnadirApartamento_3.setAttribute("componente", "botonAnadirApartamentoOferta");
            pCrearOFertaBotonAnadirApartamento_3.textContent = "Añadir apartamento";
            pCrearOFertaBotonAnadirApartamento_3.addEventListener("click", (e) => {
                const data = {
                    e: e,
                    instanciaUID: instanciaUID,
                }
                casaVitini.view.crearOferta.apartamentosDisponibles(data)
            })
            contenedorSelectorApartamentos.appendChild(pCrearOFertaBotonAnadirApartamento_3);



            const divCrearOfertaZonaAnadirApartamento_3 = document.createElement("div");
            divCrearOfertaZonaAnadirApartamento_3.classList.add("crearOfertaZonaAnadirApartamento");
            divCrearOfertaZonaAnadirApartamento_3.setAttribute("componente", "zonaAnadirApartamento");

            const pCrearApartamentoInfoSinApartamento_3 = document.createElement("p");
            pCrearApartamentoInfoSinApartamento_3.classList.add("crearApartamentoInfoSinApartamento");
            pCrearApartamentoInfoSinApartamento_3.setAttribute("componente", "infoSinApartamento");
            pCrearApartamentoInfoSinApartamento_3.textContent =
                "Añade apartamentos a esta condición para determinar que apartamentos en concreto tienen que estar en una reserva para acceder a esta oferta";
            divCrearOfertaZonaAnadirApartamento_3.appendChild(pCrearApartamentoInfoSinApartamento_3);
            contenedorSelectorApartamentos.appendChild(divCrearOfertaZonaAnadirApartamento_3);
            divCrearOfertaConentenedor4_3.appendChild(contenedorSelectorApartamentos);

            divCrearOfertaEspacioOpciones_3.appendChild(divCrearOfertaConentenedor4_3);
            porApartamentoDedicado.appendChild(divCrearOfertaEspacioOpciones_3);

            return porApartamentoDedicado

        },
        selectorTipoOferta: () => {

            const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
            const constructor = pantallaInmersiva.querySelector("[componente=contenedor]")
            const destino = pantallaInmersiva.querySelector("[destino=inyector]")

            const tituloUI = document.createElement("p")
            tituloUI.classList.add("tituloGris", "textoCentrado")
            tituloUI.setAttribute("componente", "titulo")
            tituloUI.textContent = "Añadir condición a la oferta"
            constructor.appendChild(tituloUI)

            const divContenedorHorizontalTipoOfertas = document.createElement("div");
            divContenedorHorizontalTipoOfertas.classList.add("crearOfertaContenedorHorizontalTipoOfertas");


            const infoReservas = document.createElement("p")
            infoReservas.classList.add(
                "negrita",
                "padding10"
            )
            infoReservas.setAttribute("componente", "titulo")
            infoReservas.textContent = "Condiciones para el alojamiento de las reservas"
            constructor.appendChild(infoReservas)



            const divContenedorTipoOfertas = document.createElement("div");
            divContenedorTipoOfertas.classList.add("crearOfertaConentenedor");
            destino.appendChild(divContenedorTipoOfertas);
            divContenedorTipoOfertas.appendChild(divContenedorHorizontalTipoOfertas);


            const opcionesTipoOferta = [
                {
                    tipo: "conFechaEntradaEntreRango",
                    titulo: "Con fecha de entrada entre rango.",
                    descripcion: "Aplicar esta oferta cuando la fecha de entrada de una reserva está dentro de un rango de fechas."
                },
                {
                    tipo: "conFechaSalidaEntreRango",
                    titulo: "Con fecha de salida entre rango.",
                    descripcion: "Aplicar esta oferta cuando la fecha de salida de una reserva está dentro de un rango de fechas."
                },
                {
                    tipo: "conFechaCreacionEntreRango",
                    titulo: "Con fecha de creación entre rango.",
                    descripcion: "Aplicar esta oferta cuando la fecha de creación de una reserva está dentro del rango de vigencia de la oferta."
                },
                {
                    tipo: "porNumeroDeApartamentos",
                    titulo: "Por número de apartamentos ",
                    descripcion: "Aplicar oferta cuando una reserva cumple con el número de apartamentos requeridos por este tipo de condición."
                },
                {
                    tipo: "porApartamentosEspecificos",
                    titulo: "Por apartamentos específicos ",
                    descripcion: "Aplicar oferta cuando una reserva contiene los apartamentos en específico que requiere esta condición."
                },
                {
                    tipo: "porDiasDeAntelacion",
                    titulo: "Por días de antelación ",
                    descripcion: "Aplicar oferta cuando una reserva cumple con el requisito de los días de antelación que requiere la condición."
                },
                {
                    tipo: "porDiasDeReserva",
                    titulo: "Por días de la reserva",
                    descripcion: "Aplicar oferta cuando una reserva cumple con los requisitos de días de duración que requiere la condición."
                },
                {
                    tipo: "porRangoDeFechas",
                    titulo: "Por rango de fechas de la reserva",
                    descripcion: "Aplicar esta oferta cuando se realiza una reserva cuyo rango determinado por la fecha de entrada y la fecha de salida se cruza con el rango de duración determinado en esta condición."
                }, {
                    tipo: "porCodigoDescuento",
                    titulo: "Por código de descuento",
                    descripcion: "Aplicar esta oferta a la reserva que inserte un código de descuento."
                }
            ];

            for (const opcion of opcionesTipoOferta) {
                const tipoOferta = opcion.tipo
                const divOpcionTipoOferta = document.createElement("div");
                divOpcionTipoOferta.classList.add("opcionTipoOFerta");
                divOpcionTipoOferta.setAttribute("tipoOferta", tipoOferta);
                divOpcionTipoOferta.addEventListener("click", () => {
                    const espacioCrearOferta = document.querySelector("[componente=espacioCrearOferta] [contenedor=condiciones]")
                    const ofertaUI = casaVitini.view.__sharedMethods__.ofertas_componentesUI.componenteUI.condicionesUI[tipoOferta]()
                    espacioCrearOferta.appendChild(ofertaUI)
                    casaVitini.view.__sharedMethods__.ofertas_componentesUI.componenteUI.controlDespliegeContenedorDescuento()
                    return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                })
                const pTituloTipoOferta = document.createElement("p");
                pTituloTipoOferta.classList.add("crearOfertaTituloTipoOferta");
                pTituloTipoOferta.textContent = opcion.titulo;
                divContenedorTipoOfertas.appendChild(pTituloTipoOferta);

                const pDescripcionTipoOferta = document.createElement("p");
                pDescripcionTipoOferta.classList.add("crearOfertaDescripcionTipoOferta");
                pDescripcionTipoOferta.textContent = opcion.descripcion;
                divOpcionTipoOferta.appendChild(pTituloTipoOferta);
                divOpcionTipoOferta.appendChild(pDescripcionTipoOferta);
                divContenedorHorizontalTipoOfertas.appendChild(divOpcionTipoOferta);
            }
















            const botonCancelar = document.createElement("div")
            botonCancelar.classList.add("boton")
            botonCancelar.textContent = "Cerrar y volver al a edición de la oferta"
            botonCancelar.setAttribute("boton", "cancelar")
            botonCancelar.addEventListener("click", () => {
                return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
            })
            constructor.appendChild(botonCancelar)
            document.querySelector("main").appendChild(pantallaInmersiva)
        },
        eliminarContenedorCondicion: (tipoCondicion) => {
            tipoCondicion.target.closest("[zonaOferta]").remove()
            return casaVitini.view.__sharedMethods__.ofertas_componentesUI.componenteUI.controlDespliegeContenedorDescuento()
        },
        controlDespliegeContenedorDescuento: () => {
            const contenedorCondiciones = document.querySelector("[componente=espacioCrearOferta] [contenedor=condiciones]")
            const contenedorDescuentos = document.querySelector("[componente=espacioCrearOferta] [contenedor=descuentos]")
            const ofertasRenderizadas = contenedorCondiciones.querySelectorAll("[zonaOferta]")
            const selectorContenedorInfoCondiciones = contenedorCondiciones.querySelector("[info=condiciones]")
            if (ofertasRenderizadas.length > 0) {
                selectorContenedorInfoCondiciones.style.display = "none"
            } else {
                selectorContenedorInfoCondiciones.removeAttribute("style")
            }
        },
        condicionesUI: {
            botonEliminarCondicion: () => {
                const botonBorrarCondicion = document.createElement("p")
                botonBorrarCondicion.classList.add("botonV1")
                botonBorrarCondicion.setAttribute("componente", "titulo")
                botonBorrarCondicion.textContent = "Eliminar condición"
                botonBorrarCondicion.addEventListener("click", casaVitini.view.__sharedMethods__.ofertas_componentesUI.componenteUI.eliminarContenedorCondicion)
                return botonBorrarCondicion
            },
            porNumeroDeApartamentos: function () {
                const contenedor = document.createElement("div");
                contenedor.setAttribute("zonaOferta", "porNumeroDeApartamentos");

                contenedor.classList.add("contenedorCondicion");

                const contenedorBotonesGlobales = document.createElement("div")
                contenedorBotonesGlobales.classList.add("contenedorBotonesGlobal")
                contenedorBotonesGlobales.setAttribute("contenedorEnCondicion", "botones")
                contenedor.appendChild(contenedorBotonesGlobales)

                const botonEliminarCondicion = this.botonEliminarCondicion()
                contenedorBotonesGlobales.appendChild(botonEliminarCondicion)


                const titulo = document.createElement("p");
                titulo.classList.add(
                    "textoCentrado",
                    "negrita"
                );
                titulo.textContent = "Por número de apartamentos";
                contenedor.appendChild(titulo);


                const descripcionCondicion = document.createElement("p");
                descripcionCondicion.classList.add("crearOfertaTituloOpcion");
                descripcionCondicion.textContent = "Aplicar oferta cuando una reserva cumple con el número de apartamentos requeridos por este tipo de condición.";
                contenedor.appendChild(descripcionCondicion);



                const seleccionaTipoNumero = document.createElement("select");
                seleccionaTipoNumero.classList.add("preciosEImpuestosbotonOpcionCrearNuevoImpuesto");
                seleccionaTipoNumero.setAttribute("campoOferta", "tipoConteo");

                const optionO1 = document.createElement("option");
                optionO1.selected = true;
                optionO1.disabled = true;
                optionO1.setAttribute("value", "");
                optionO1.textContent = "Selecciona si a partir de o un número exacto de apartamentos.";
                const optionO2 = document.createElement("option");
                optionO2.value = "numeroExacto";
                optionO2.textContent = "Con un número exacto de apartamentos.";
                const opcion03 = document.createElement("option");
                opcion03.value = "hastaUnNumeroExacto";
                opcion03.textContent = "Hasta un número exacto de apartamentos.";
                const opcion04 = document.createElement("option");
                opcion04.value = "aPartirDe";
                opcion04.textContent = "A partir de un número exacto de apartamentos.";
                seleccionaTipoNumero.appendChild(optionO1);
                seleccionaTipoNumero.appendChild(optionO2);
                seleccionaTipoNumero.appendChild(opcion03)
                seleccionaTipoNumero.appendChild(opcion04)
                contenedor.appendChild(seleccionaTipoNumero);


                const inputNumeroApartamentos_O1 = document.createElement("input");
                inputNumeroApartamentos_O1.setAttribute("type", "text");
                inputNumeroApartamentos_O1.classList.add("preciosEImpuestosbotonOpcionCrearNuevoImpuesto");
                inputNumeroApartamentos_O1.placeholder = "0";
                inputNumeroApartamentos_O1.setAttribute("campoOferta", "numeroDeApartamentos");
                contenedor.appendChild(inputNumeroApartamentos_O1);

                return contenedor
            },
            porCodigoDescuento: function () {

                const contenedor = document.createElement("div");
                contenedor.classList.add("contenedorCondicion");
                contenedor.setAttribute("zonaOferta", "porCodigoDescuento");


                const contenedorBotonesGlobales = document.createElement("div")
                contenedorBotonesGlobales.classList.add("contenedorBotonesGlobal")
                contenedorBotonesGlobales.setAttribute("contenedorEnCondicion", "botones")
                contenedor.appendChild(contenedorBotonesGlobales)


                const botonEliminarCondicion = this.botonEliminarCondicion()
                contenedorBotonesGlobales.appendChild(botonEliminarCondicion)


                const titulo = document.createElement("p");
                titulo.classList.add(
                    "textoCentrado",
                    "negrita"
                );
                titulo.textContent = "Por código de descuento";
                contenedor.appendChild(titulo);


                const descripcionCondicion = document.createElement("p");
                descripcionCondicion.classList.add("crearOfertaTituloOpcion");
                descripcionCondicion.textContent = "Aplicar esta oferta a la reserva que inserte un código de descuento.";
                contenedor.appendChild(descripcionCondicion);


                const campoCodigo = document.createElement("input")
                campoCodigo.setAttribute("campo", "codigoDescuento")
                campoCodigo.classList.add("campoTextoSimple")
                campoCodigo.placeholder = "Escribe el código"
                contenedor.appendChild(campoCodigo)

                return contenedor
            },
            porDiasDeAntelacion: function () {
                const contenedor = document.createElement("div");
                contenedor.setAttribute("zonaOferta", "porDiasDeAntelacion");
                contenedor.classList.add("contenedorCondicion");

                const contenedorBotonesGlobales = document.createElement("div")
                contenedorBotonesGlobales.classList.add("contenedorBotonesGlobal")
                contenedorBotonesGlobales.setAttribute("contenedorEnCondicion", "botones")
                contenedor.appendChild(contenedorBotonesGlobales)


                const botonEliminarCondicion = this.botonEliminarCondicion()
                contenedorBotonesGlobales.appendChild(botonEliminarCondicion)


                const divEspacioOpciones_O1 = document.createElement("div");
                divEspacioOpciones_O1.classList.add("crearOfeartaEspacioOpciones");

                const divContenedor1_O1 = document.createElement("div");
                divContenedor1_O1.classList.add("crearOfertaConentenedor");

                const titulo = document.createElement("p");
                titulo.classList.add(
                    "textoCentrado",
                    "negrita"
                );
                titulo.textContent = "Por días de antelación";
                contenedor.appendChild(titulo);


                const descripcionCondicion = document.createElement("p");
                descripcionCondicion.classList.add("crearOfertaTituloOpcion");
                descripcionCondicion.textContent = "Aplicar oferta cuando una reserva cumple con el requisito de los días de antelación que requiere la condición.";
                contenedor.appendChild(descripcionCondicion);


                const seleccionaTipoNumero = document.createElement("select");
                seleccionaTipoNumero.classList.add("preciosEImpuestosbotonOpcionCrearNuevoImpuesto");
                seleccionaTipoNumero.setAttribute("campoOferta", "tipoConteo");

                const optionO1 = document.createElement("option");
                optionO1.selected = true;
                optionO1.disabled = true;
                optionO1.setAttribute("value", "");
                optionO1.textContent = "Selecciona si a partir de o un número exacto de días.";
                const optionO2 = document.createElement("option");
                optionO2.value = "numeroExacto";
                optionO2.textContent = "Con un número exacto de días de antelación.";
                const opcion03 = document.createElement("option");
                opcion03.value = "aPartirDe";
                opcion03.textContent = "A partir de un número exacto de días de antelación.";
                const opcion04 = document.createElement("option");
                opcion04.value = "hastaUnNumeroExacto";
                opcion04.textContent = "Hasta un número exacto de días de antelación.";
                seleccionaTipoNumero.appendChild(optionO1);
                seleccionaTipoNumero.appendChild(optionO2);
                seleccionaTipoNumero.appendChild(opcion03);
                seleccionaTipoNumero.appendChild(opcion04);
                divContenedor1_O1.appendChild(seleccionaTipoNumero);


                const inputNumeroApartamentos_O1 = document.createElement("input");
                inputNumeroApartamentos_O1.setAttribute("type", "text");
                inputNumeroApartamentos_O1.classList.add("preciosEImpuestosbotonOpcionCrearNuevoImpuesto");
                inputNumeroApartamentos_O1.placeholder = "Determina el número de días de antelación.";
                inputNumeroApartamentos_O1.setAttribute("campoOferta", "numeroDeDias");

                divContenedor1_O1.appendChild(inputNumeroApartamentos_O1);




                divEspacioOpciones_O1.appendChild(divContenedor1_O1);
                contenedor.appendChild(divEspacioOpciones_O1);


                return contenedor
            },
            porDiasDeReserva: function () {
                const contenedor = document.createElement("div");
                contenedor.setAttribute("zonaOferta", "porDiasDeReserva");
                contenedor.classList.add("contenedorCondicion");



                const contenedorBotonesGlobales = document.createElement("div")
                contenedorBotonesGlobales.classList.add("contenedorBotonesGlobal")
                contenedorBotonesGlobales.setAttribute("contenedorEnCondicion", "botones")
                contenedor.appendChild(contenedorBotonesGlobales)



                const botonEliminarCondicion = this.botonEliminarCondicion()
                contenedorBotonesGlobales.appendChild(botonEliminarCondicion)


                const divEspacioOpciones_O1 = document.createElement("div");
                divEspacioOpciones_O1.classList.add("crearOfeartaEspacioOpciones");

                const divContenedor1_O1 = document.createElement("div");
                divContenedor1_O1.classList.add("crearOfertaConentenedor");


                const titulo = document.createElement("p");
                titulo.classList.add(
                    "textoCentrado",
                    "negrita"
                );
                titulo.textContent = "Por días de la reserva";
                contenedor.appendChild(titulo);


                const descripcionCondicion = document.createElement("p");
                descripcionCondicion.classList.add("crearOfertaTituloOpcion");
                descripcionCondicion.textContent = "Aplicar oferta cuando una reserva cumple con los requisitos de días de duración que requiere la condición.";
                contenedor.appendChild(descripcionCondicion);


                const seleccionaTipoNumero = document.createElement("select");
                seleccionaTipoNumero.classList.add("preciosEImpuestosbotonOpcionCrearNuevoImpuesto");
                seleccionaTipoNumero.setAttribute("campoOferta", "tipoConteo");

                const optionO1 = document.createElement("option");
                optionO1.selected = true;
                optionO1.disabled = true;
                optionO1.setAttribute("value", "");
                optionO1.textContent = "Selecciona si a partir de o un número exacto de días con noche.";
                const optionO2 = document.createElement("option");
                optionO2.value = "numeroExacto";
                optionO2.textContent = "Con un número exacto de días con noche de la reserva.";
                const opcion03 = document.createElement("option");
                opcion03.value = "aPartirDe";
                opcion03.textContent = "A partir de un número exacto de días con noche de la reserva.";
                const opcion04 = document.createElement("option");
                opcion04.value = "hastaUnNumeroExacto";
                opcion04.textContent = "Hasta un número exacto de días con noche de la reserva.";
                seleccionaTipoNumero.appendChild(optionO1);
                seleccionaTipoNumero.appendChild(optionO2);
                seleccionaTipoNumero.appendChild(opcion03);
                seleccionaTipoNumero.appendChild(opcion04);
                divEspacioOpciones_O1.appendChild(divContenedor1_O1);


                const inputNumeroApartamentos_O1 = document.createElement("input");
                inputNumeroApartamentos_O1.setAttribute("type", "text");
                inputNumeroApartamentos_O1.classList.add("preciosEImpuestosbotonOpcionCrearNuevoImpuesto");
                inputNumeroApartamentos_O1.placeholder = "Determina el número de días con noche de la reserva.";
                inputNumeroApartamentos_O1.setAttribute("campoOferta", "numeroDeDias");

                divContenedor1_O1.appendChild(seleccionaTipoNumero);
                divContenedor1_O1.appendChild(inputNumeroApartamentos_O1);


                contenedor.appendChild(divEspacioOpciones_O1);

                return contenedor
            },
            conFechaCreacionEntreRango: function () {

                const contenedor = document.createElement("div");
                contenedor.setAttribute("zonaOferta", "conFechaCreacionEntreRango");
                contenedor.classList.add("contenedorCondicion");

                const contenedorBotonesGlobales = document.createElement("div")
                contenedorBotonesGlobales.classList.add("contenedorBotonesGlobal")
                contenedorBotonesGlobales.setAttribute("contenedorEnCondicion", "botones")
                contenedor.appendChild(contenedorBotonesGlobales)

                const botonEliminarCondicion = this.botonEliminarCondicion()
                contenedorBotonesGlobales.appendChild(botonEliminarCondicion)

                const titulo = document.createElement("p");
                titulo.classList.add(
                    "textoCentrado",
                    "negrita"
                );
                titulo.textContent = "Con fecha de creación entre rango.";
                contenedor.appendChild(titulo);


                const descripcionCondicion = document.createElement("p");
                descripcionCondicion.classList.add("crearOfertaTituloOpcion");
                descripcionCondicion.textContent = "Aplicar esta oferta cuando la fecha de creación de una reserva está dentro del rango de vigencia de la oferta.";
                contenedor.appendChild(descripcionCondicion);

                return contenedor
            },
            conFechaEntradaEntreRango: function () {

                const contenedor = document.createElement("div");
                contenedor.setAttribute("zonaOferta", "conFechaEntradaEntreRango");
                contenedor.classList.add("contenedorCondicion");

                const contenedorBotonesGlobales = document.createElement("div")
                contenedorBotonesGlobales.classList.add("contenedorBotonesGlobal")
                contenedorBotonesGlobales.setAttribute("contenedorEnCondicion", "botones")
                contenedor.appendChild(contenedorBotonesGlobales)

                const botonEliminarCondicion = this.botonEliminarCondicion()
                contenedorBotonesGlobales.appendChild(botonEliminarCondicion)

                const titulo = document.createElement("p");
                titulo.classList.add(
                    "textoCentrado",
                    "negrita"
                );
                titulo.textContent = "Con fecha de entrada entre rango";
                contenedor.appendChild(titulo);


                const descripcionCondicion = document.createElement("p");
                descripcionCondicion.classList.add("crearOfertaTituloOpcion");
                descripcionCondicion.textContent = "Aplicar esta oferta cuando la fecha de entrada de una reserva está dentro de un rango de fechas.";
                contenedor.appendChild(descripcionCondicion);

                const contenedorFechasUI = casaVitini.view.__sharedMethods__.contenedorFechasUI({
                    modo: "administracion",
                    sobreControlConfiguracion: {
                        configuracionInicio: {
                            tituloCalendario: "Seleciona una fecha de inicio del rango",
                            seleccionableDiaLimite: "si"
                        },
                        configuracionFin: {
                            tituloCalendario: "Seleciona una fecha de fin del rango",
                            seleccionableDiaLimite: "si"
                        }
                    }

                })
                contenedor.appendChild(contenedorFechasUI)

                return contenedor
            },
            conFechaSalidaEntreRango: function () {

                const contenedor = document.createElement("div");
                contenedor.setAttribute("zonaOferta", "conFechaSalidaEntreRango");
                contenedor.classList.add("contenedorCondicion");

                const contenedorBotonesGlobales = document.createElement("div")
                contenedorBotonesGlobales.classList.add("contenedorBotonesGlobal")
                contenedorBotonesGlobales.setAttribute("contenedorEnCondicion", "botones")
                contenedor.appendChild(contenedorBotonesGlobales)

                const botonEliminarCondicion = this.botonEliminarCondicion()
                contenedorBotonesGlobales.appendChild(botonEliminarCondicion)

                const titulo = document.createElement("p");
                titulo.classList.add(
                    "textoCentrado",
                    "negrita"
                );
                titulo.textContent = "Con fecha de salida entre rango";
                contenedor.appendChild(titulo);


                const descripcionCondicion = document.createElement("p");
                descripcionCondicion.classList.add("crearOfertaTituloOpcion");
                descripcionCondicion.textContent = "Aplicar esta oferta cuando la fecha de salida de una reserva está dentro de un rango de fechas.";
                contenedor.appendChild(descripcionCondicion);

                const contenedorFechasUI = casaVitini.view.__sharedMethods__.contenedorFechasUI({
                    modo: "administracion",
                    sobreControlConfiguracion: {
                        configuracionInicio: {
                            tituloCalendario: "Seleciona una fecha de inicio del rango",
                            seleccionableDiaLimite: "si"
                        },
                        configuracionFin: {
                            tituloCalendario: "Seleciona una fecha de fin del rango",
                            seleccionableDiaLimite: "si"
                        }
                    }

                })
                contenedor.appendChild(contenedorFechasUI)
                return contenedor
            },
            porRangoDeFechas: function () {

                const contenedor = document.createElement("div");
                contenedor.setAttribute("zonaOferta", "porRangoDeFechas");
                contenedor.classList.add("contenedorCondicion");

                const contenedorBotonesGlobales = document.createElement("div")
                contenedorBotonesGlobales.classList.add("contenedorBotonesGlobal")
                contenedorBotonesGlobales.setAttribute("contenedorEnCondicion", "botones")


                const botonEliminarCondicion = this.botonEliminarCondicion()
                contenedorBotonesGlobales.appendChild(botonEliminarCondicion)

                contenedor.appendChild(contenedorBotonesGlobales)
                const titulo = document.createElement("p");
                titulo.classList.add(
                    "textoCentrado",
                    "negrita"
                );
                titulo.textContent = "Por rango de fechas de la reserva";
                contenedor.appendChild(titulo);


                const descripcionCondicion = document.createElement("p");
                descripcionCondicion.classList.add("crearOfertaTituloOpcion");
                descripcionCondicion.textContent = "Aplicar esta oferta cuando se realiza una reserva cuyo rango determinado por la fecha de entrada y la fecha de salida se cruza con el rango de duración determinado en esta condición.";
                contenedor.appendChild(descripcionCondicion);

                const contenedorFechasUI = casaVitini.view.__sharedMethods__.contenedorFechasUI({
                    modo: "administracion",
                    seleccionableDiaLimite: "si"

                })
                contenedor.appendChild(contenedorFechasUI)

                return contenedor
            },
            porApartamentosEspecificos: function () {

                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()

                const contenedor = document.createElement("div");
                contenedor.classList.add("contenedorDescuento");


                contenedor.setAttribute("zonaOferta", "porApartamentosEspecificos");


                const contenedorBotonesGlobales = document.createElement("div")
                contenedorBotonesGlobales.classList.add("contenedorBotonesGlobal")
                contenedorBotonesGlobales.setAttribute("contenedorEnCondicion", "botones")
                contenedor.appendChild(contenedorBotonesGlobales)


                const botonEliminarCondicion = this.botonEliminarCondicion()
                contenedorBotonesGlobales.appendChild(botonEliminarCondicion)

                const titulo = document.createElement("p");
                titulo.classList.add(
                    "textoCentrado",
                    "negrita"
                );
                titulo.textContent = "Por apartamentos específicos ";
                contenedor.appendChild(titulo);


                const descripcionCondicion = document.createElement("p");
                descripcionCondicion.classList.add("crearOfertaTituloOpcion");
                descripcionCondicion.textContent = "Aplicar oferta cuando una reserva contiene los apartamentos en específico que requiere esta condición.";
                contenedor.appendChild(descripcionCondicion);


                const selector = document.createElement("select")
                selector.classList.add(
                    "selectorLista")
                selector.setAttribute("campo", "tipoDeEspecificidad")
                contenedor.appendChild(selector)

                const tituloSelector = document.createElement("option")
                tituloSelector.value = ""
                tituloSelector.selected = true
                tituloSelector.disabled = true
                tituloSelector.text = "Seleccionar el tipo condicional."
                selector.add(tituloSelector)

                const tipoExacto = document.createElement("option")
                tipoExacto.value = "exactamente"
                tipoExacto.text = "La reserva debe contener exactamente estos apartamentos."
                selector.add(tipoExacto)

                const tipoAlguno = document.createElement("option")
                tipoAlguno.value = "alguno"
                tipoAlguno.text = "La reserva debe de contener alguno de estos apartamentos."
                selector.add(tipoAlguno)

                const tipoExactamenteEntreOtros = document.createElement("option")
                tipoExactamenteEntreOtros.value = "exactamenteEntreOtros"
                tipoExactamenteEntreOtros.text = "La reserva debe contener exactamente estos apartamentos y, además, puede contener otros."
                selector.add(tipoExactamenteEntreOtros)

                const tipoNOAlguno = document.createElement("option")
                tipoNOAlguno.value = "noDebeContenedorAlguno"
                tipoNOAlguno.text = "La reserva no debe de contener alguno de estos apartamentos."
                selector.add(tipoNOAlguno)

                const tipoNOAlgunoExacto = document.createElement("option")
                tipoNOAlgunoExacto.value = "noDebeContenedorExactamente"
                tipoNOAlgunoExacto.text = "La reserva no debe de contener exactamente de estos apartamentos."
                selector.add(tipoNOAlgunoExacto)

                const tipoNOAlgunoExactoEntreOtros = document.createElement("option")
                tipoNOAlgunoExactoEntreOtros.value = "noDebeContenedorExactamenteEntreOtros"
                tipoNOAlgunoExactoEntreOtros.text = "La reserva no debe de contener exactamente de estos apartamentos, entre otros."


                const texto = "Añade apartamentos a esta condición para determinar qué apartamentos en concreto tienen que estar en una reserva para acceder a esta oferta."

                const selectorApartamentosEspecificosUI = casaVitini.view.__sharedMethods__.selectorApartamentosEspecificosUI.despliegue({
                    textoContenedorVacio: texto,

                })
                contenedor.appendChild(selectorApartamentosEspecificosUI)
                return contenedor
            }

        },
        descuentosUI: {
            individualPorApartamento: () => {
                const contenedorDescuento = document.createElement("div");
                contenedorDescuento.classList.add("flexVertical", "contenedorOculto", "gap6");
                contenedorDescuento.setAttribute("descuentoIDV", "individualPorApartamento");

                const titulo = document.createElement("p");
                titulo.classList.add("padding16", "textoCentrado");
                titulo.textContent =
                    "Añade qué apartamentos en concreto debe de seleccionar el cliente para que se aplique esta oferta.";
                contenedorDescuento.appendChild(titulo);

                const selectorApartamentosEspecificosUI = casaVitini.view.__sharedMethods__.selectorApartamentosEspecificosUI.despliegue({
                    textoContenedorVacio: "No hay ningún apartamento dentro de esta reserva.Pulse el botón Añadir apartamento para añadir apartamentos en específico.",
                    opcionesUI: {
                        ui: casaVitini.view.__sharedMethods__.ofertas_componentesUI.componenteUI.compartidos.opcionesContenedorApartamentoUI
                    }
                })

                contenedorDescuento.appendChild(selectorApartamentosEspecificosUI);
                return contenedorDescuento

            },
            totalNeto: () => {
                const contenedorDescuento = document.createElement("div");
                contenedorDescuento.classList.add("flexVertical", "contenedorOculto", "gap6");
                contenedorDescuento.setAttribute("descuentoIDV", "totalNeto");

                const titulo = document.createElement("p");
                titulo.classList.add("padding16");
                titulo.textContent =
                    "Determina si esta oferta será un descuento por porcentaje o una rebaja fija del precio y luego determina esa cantidad.";
                contenedorDescuento.appendChild(titulo);

                const selector = document.createElement("select");
                selector.classList.add("preciosEImpuestosbotonOpcionCrearNuevoImpuesto");
                selector.setAttribute("campoOferta", "tipoDescuento");

                const opcionInicial = document.createElement("option");
                opcionInicial.selected = true;
                opcionInicial.disabled = true;
                opcionInicial.setAttribute("value", "");
                opcionInicial.textContent = "Selecciona el tipo de descuento";

                const opcionPorcentaje = document.createElement("option");
                opcionPorcentaje.value = "porcentaje";
                opcionPorcentaje.textContent = "Descuento por porcentaje";

                const opcionCantidad = document.createElement("option");
                opcionCantidad.value = "cantidadFija";
                opcionCantidad.textContent = "Descuento por cantidad fija";

                selector.appendChild(opcionInicial);
                selector.appendChild(opcionPorcentaje);
                selector.appendChild(opcionCantidad);
                contenedorDescuento.appendChild(selector);

                const campo = document.createElement("input");
                campo.setAttribute("type", "text");
                campo.classList.add("preciosEImpuestosbotonOpcionCrearNuevoImpuesto");
                campo.setAttribute("placeholder", "00.00");
                campo.setAttribute("campoOferta", "descuentoGlobal");
                contenedorDescuento.appendChild(campo);

                return contenedorDescuento
            },
            mismoDescuentoParaCadaApartamento: () => {
                const contenedorDescuento = document.createElement("div");
                contenedorDescuento.classList.add("flexVertical", "contenedorOculto", "gap6");
                contenedorDescuento.setAttribute("descuentoIDV", "mismoDescuentoParaCadaApartamento");

                const titulo = document.createElement("p");
                titulo.classList.add("padding16");
                titulo.textContent =
                    "Determina si esta oferta será un descuento para cada apartamento por porcentaje o una rebaja fija del precio y luego determina esa cantidad.";
                contenedorDescuento.appendChild(titulo);

                const selector = document.createElement("select");
                selector.classList.add("preciosEImpuestosbotonOpcionCrearNuevoImpuesto");
                selector.setAttribute("campoOferta", "tipoDescuento");

                const opcionInicial = document.createElement("option");
                opcionInicial.selected = true;
                opcionInicial.disabled = true;
                opcionInicial.setAttribute("value", "");
                opcionInicial.textContent = "Selecciona el tipo de descuento.";

                const opcionPorcentaje = document.createElement("option");
                opcionPorcentaje.value = "porcentaje";
                opcionPorcentaje.textContent = "Descuento por porcentaje";

                const opcionCantidad = document.createElement("option");
                opcionCantidad.value = "cantidadFija";
                opcionCantidad.textContent = "Descuento por cantidad fija";

                selector.appendChild(opcionInicial);
                selector.appendChild(opcionPorcentaje);
                selector.appendChild(opcionCantidad);
                contenedorDescuento.appendChild(selector);

                const campo = document.createElement("input");
                campo.setAttribute("type", "text");
                campo.classList.add("preciosEImpuestosbotonOpcionCrearNuevoImpuesto");
                campo.setAttribute("placeholder", "00.00");
                campo.setAttribute("campoOferta", "descuentoGlobal");
                contenedorDescuento.appendChild(campo);

                return contenedorDescuento
            },
            porRango: {
                arranque: (data) => {
                    const zonaDespliegue = data?.zonaDespliegue
                    const metodoSelectorDia = data?.metodoSelectorDia ?? "view.__sharedMethods__.componenteUI.descuentosUI.porRango.componentes.pasarelaSelectorDia"

                    const contenedorDescuento = document.createElement("div");
                    contenedorDescuento.classList.add("flexVertical", "contenedorOculto", "gap6");
                    contenedorDescuento.setAttribute("descuentoIDV", "porRango");
                    contenedorDescuento.setAttribute("area", "descuentosPorRango")

                    const titulo = document.createElement("p");
                    titulo.classList.add("padding16");
                    titulo.textContent =
                        "Determina el rango de aplicación del descuento.Una vez selecciones el rango.Podrás determinar si aplicar un descuento al neto total de la reserva que esté dentro de ese rango.Es decir, los días de la reserva con noche que estén dentro de ese rango.También puedes aplicar un descuento personalizado dentro de cada día con noche.Determinando si el descuento se aplica al neto de un día o a apartamentos específicos dentro de un día.";
                    contenedorDescuento.appendChild(titulo);


                    const contenedorFechasUI = casaVitini.view.__sharedMethods__.contenedorFechasUI({
                        metodoSelectorDia: metodoSelectorDia,
                        nombreContenedor: "totalNetoPorRango",
                        modo: "administracion",
                        seleccionableDiaLimite: "si",
                        zonaDespliegue: zonaDespliegue

                    })
                    contenedorDescuento.appendChild(contenedorFechasUI)

                    const selectorTipoDescuento = document.createElement("select");
                    selectorTipoDescuento.classList.add("preciosEImpuestosbotonOpcionCrearNuevoImpuesto");
                    selectorTipoDescuento.setAttribute("campoOferta", "contextoAplicacion");
                    selectorTipoDescuento.setAttribute("componente", "subTipoDescuento");
                    selectorTipoDescuento.addEventListener("change", (e) => {
                        casaVitini.view.__sharedMethods__.ofertas_componentesUI.componenteUI.descuentosUI.porRango.componentes.controladorUI({
                            contenedorIDV: e.target.value
                        })
                    })
                    const opcionesSelector = [{
                        nombre: "Determina, dentro del rango seleccionado, cómo se aplica el descuento.",
                        inicial: "si",
                    }, {
                        nombre: "Aplicar descuento al total neto de la suma de los días de la reserva dentro del rango.",
                        descuentoIDV: "totalNetoPorRango",
                    }, {
                        nombre: "Aplicar descuentos individuales a los días de la reserva dentro del rango.",
                        descuentoIDV: "porDiasDelRango",
                    }]

                    for (const opcion of opcionesSelector) {
                        const nombre = opcion.nombre
                        const inicial = opcion.inicial
                        const descuentoIDV = opcion.descuentoIDV
                        const opcionUI = document.createElement("option")
                        if (inicial === "si") {
                            opcionUI.selected = true;
                            opcionUI.disabled = true;
                        } else {
                            opcionUI.value = descuentoIDV
                        }
                        opcionUI.textContent = nombre
                        selectorTipoDescuento.appendChild(opcionUI)
                    }
                    contenedorDescuento.appendChild(selectorTipoDescuento)

                    const totalNetoPorRango = casaVitini.view.__sharedMethods__.ofertas_componentesUI.componenteUI.descuentosUI.porRango.totalNetoPorRango()
                    contenedorDescuento.appendChild(totalNetoPorRango)

                    const porDiasDelRango = casaVitini.view.__sharedMethods__.ofertas_componentesUI.componenteUI.descuentosUI.porRango.porDiasDelRango.arranque()
                    contenedorDescuento.appendChild(porDiasDelRango)

                    return contenedorDescuento
                },
                infoInicialSinApartametno: () => {
                    const info = document.createElement("p")
                    info.classList.add(
                        "texto",
                        "textoCentrado",
                        "padding6"
                    )
                    info.textContent = "Selecciona un rango de fecha para determinar en qué rango de la reserva se aplicarán los descuentos y poder personalizar los días."
                    return info
                },
                totalNetoPorRango: () => {
                    const contenedor = document.createElement("div")
                    contenedor.classList.add("contenedorOculto", "flexVertical", "gap6")
                    contenedor.setAttribute("contenedorPorRango", "totalNetoPorRango")

                    const selector = document.createElement("select");
                    selector.classList.add("preciosEImpuestosbotonOpcionCrearNuevoImpuesto",);
                    selector.setAttribute("campoOferta", "tipoDescuento");

                    const opcionInicial = document.createElement("option");
                    opcionInicial.selected = true;
                    opcionInicial.disabled = true;
                    opcionInicial.setAttribute("value", "");
                    opcionInicial.textContent = "Selecciona el tipo de descuento al total neto de los días de la reserva dentro del rango.";

                    const opcionPorcentaje = document.createElement("option");
                    opcionPorcentaje.value = "porcentaje";
                    opcionPorcentaje.textContent = "Descuento por porcentaje";

                    const opcionCantidad = document.createElement("option");
                    opcionCantidad.value = "cantidadFija";
                    opcionCantidad.textContent = "Descuento por cantidad fija";

                    selector.appendChild(opcionInicial);
                    selector.appendChild(opcionPorcentaje);
                    selector.appendChild(opcionCantidad);
                    contenedor.appendChild(selector);

                    const campo = document.createElement("input");
                    campo.setAttribute("type", "text");
                    campo.classList.add("preciosEImpuestosbotonOpcionCrearNuevoImpuesto");
                    campo.setAttribute("placeholder", "00.00");
                    campo.setAttribute("campoOferta", "descuentoGlobal");
                    contenedor.appendChild(campo);

                    return contenedor

                },
                porDiasDelRango: {
                    arranque: () => {
                        const contenedor = document.createElement("div")
                        contenedor.setAttribute("contenedor", "porDiasDentroDelRango")
                        contenedor.setAttribute("contenedorPorRango", "porDiasDelRango")
                        contenedor.classList.add("contenedorOculto", "flexVertical", "gap6")
                        const info = casaVitini.view.__sharedMethods__.ofertas_componentesUI.componenteUI.descuentosUI.porRango.infoInicialSinApartametno()
                        contenedor.appendChild(info)
                        return contenedor
                    },
                    totalNetoPorDiaUI: (data) => {
                        const instanciaUID = data.instanciaUID
                        const contenedorOpcionNetoDia = document.createElement("div")
                        contenedorOpcionNetoDia.classList.add(
                            "contenedorOculto",
                            "flexVertical",
                            "gap6"
                        )
                        contenedorOpcionNetoDia.setAttribute("contenedorDelDia", "netoPorDia")
                        contenedorOpcionNetoDia.setAttribute("instanciaUID", instanciaUID)
                        const selector = document.createElement("select");
                        selector.classList.add("preciosEImpuestosbotonOpcionCrearNuevoImpuesto");
                        selector.setAttribute("campoOferta", "tipoDescuento");

                        const opcionInicial = document.createElement("option");
                        opcionInicial.selected = true;
                        opcionInicial.disabled = true;
                        opcionInicial.setAttribute("value", "");
                        opcionInicial.textContent = "Selecciona el tipo de descuento al total neto de los días de la reserva dentro del rango.";

                        const opcionPorcentaje = document.createElement("option");
                        opcionPorcentaje.value = "porcentaje";
                        opcionPorcentaje.textContent = "Descuento por porcentaje";

                        const opcionCantidad = document.createElement("option");
                        opcionCantidad.value = "cantidadFija";
                        opcionCantidad.textContent = "Descuento por cantidad fija";

                        selector.appendChild(opcionInicial);
                        selector.appendChild(opcionPorcentaje);
                        selector.appendChild(opcionCantidad);
                        contenedorOpcionNetoDia.appendChild(selector);

                        const campo = document.createElement("input");
                        campo.setAttribute("type", "text");
                        campo.classList.add("preciosEImpuestosbotonOpcionCrearNuevoImpuesto");
                        campo.setAttribute("placeholder", "00.00");
                        campo.setAttribute("campoOferta", "descuentoGlobal");
                        contenedorOpcionNetoDia.appendChild(campo);

                        return contenedorOpcionNetoDia
                    },
                    totalNetoPorApartamentosDelDiaUI: (data) => {
                        const instanciaUID = data.instanciaUID

                        const contenedorPorApartamento = document.createElement("div")
                        contenedorPorApartamento.classList.add(
                            "contenedorOculto",
                            "flexVertical",
                            "gap6"
                        )
                        contenedorPorApartamento.setAttribute("contenedorDelDia", "netoPorApartamentoDelDia")
                        contenedorPorApartamento.setAttribute("instanciaUID", instanciaUID)

                        const titulo = document.createElement("p");
                        titulo.classList.add("padding16", "textoCentrado");
                        titulo.textContent =
                            "Añade qué apartamentos en concreto debe de seleccionar el cliente para que se aplique esta oferta.";
                        contenedorPorApartamento.appendChild(titulo);
                        // const selectorApartamentosEspecificosUI = casaVitini.view.__sharedMethods__.selectorApartamentosEspecificosUI.despliegue({
                        //     textoContenedorVacio: "Añade apartamentos a esta condición para determinar qué apartamentos en concreto tienen que estar en una reserva para acceder a esta oferta.",
                        //     tipoDespliegue: "total"
                        // })

                        const selectorApartamentosEspecificosUI = casaVitini.view.__sharedMethods__.selectorApartamentosEspecificosUI.despliegue({
                            textoContenedorVacio: "Añade apartamentos a esta condición para determinar qué apartamentos en concreto tienen que estar en una reserva para acceder a esta oferta.",
                            opcionesUI: {
                                ui: casaVitini.view.__sharedMethods__.ofertas_componentesUI.componenteUI.compartidos.opcionesContenedorApartamentoUI
                            }
                        })



                        contenedorPorApartamento.appendChild(selectorApartamentosEspecificosUI);
                        return contenedorPorApartamento
                    },
                },
                infoSinApartamentos: () => {
                    const info = document.createElement("P")
                    info.textContent = "Añade algún apartamento."
                },
                componentes: {
                    pasarelaSelectorDia: function (e) {
                        casaVitini.ui.componentes.calendario.calendarioCompartido.seleccionarDia(e)
                        const area = document.querySelector("[contenedor=descuentos] [area=descuentosPorRango]")
                        const contenedorPorDiasDentro = area.querySelector("[contenedorPorRango=porDiasDelRango]")
                        const fechaInicioRango = area.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
                        const fechaFinalRango = area.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")

                        contenedorPorDiasDentro.innerHTML = null
                        if (fechaInicioRango && fechaFinalRango) {



                            const fechas = casaVitini.utilidades.conversor.extraerFechasInternas(fechaInicioRango, fechaFinalRango)

                            for (const fecha of fechas) {
                                const selectorDiaRenderizado = contenedorPorDiasDentro.querySelector(`[instanciaUID="${fecha}"]`)
                                if (!selectorDiaRenderizado) {
                                    const contenedorDia = casaVitini.view.__sharedMethods__.ofertas_componentesUI.componenteUI.descuentosUI.porRango.componentes.constructorDiaUI({
                                        fecha: fecha
                                    })
                                    contenedorPorDiasDentro.appendChild(contenedorDia)
                                }
                            }
                        } else {
                            const info = casaVitini.view.__sharedMethods__.ofertas_componentesUI.componenteUI.descuentosUI.porRango.infoInicialSinApartametno()
                            contenedorPorDiasDentro.appendChild(info)
                        }

                    },
                    controladorUI: (data) => {
                        const contenedorIDV = data.contenedorIDV
                        const areaDescuentosPorRano = document.querySelector("[contenedor=descuentos]").querySelector("[area=descuentosPorRango]")
                        const selectorContenedores = areaDescuentosPorRano.querySelectorAll("[contenedorPorRango]")

                        selectorContenedores.forEach((contenedor) => {
                            contenedor.classList.add("contenedorOculto")
                        })
                        areaDescuentosPorRano.querySelector(`[contenedorPorRango=${contenedorIDV}]`).classList.remove("contenedorOculto")
                    },
                    constructorDiaUI: (data) => {

                        const fecha = data.fecha
                        const tipoDescuento = data.tipoDescuento
                        const fechaDia_humana = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fecha)

                        const contenedorDia = document.createElement("div")
                        contenedorDia.classList.add("flexVertical", "gap6", "padding6", "backgroundGrey1", "borderRadius16")
                        contenedorDia.setAttribute("fechaDelDia", fecha)
                        contenedorDia.setAttribute("contenedor", "dia")
                        contenedorDia.setAttribute("instanciaUID", fecha)

                        const fechaDelDiaUI = document.createElement("p")
                        fechaDelDiaUI.classList.add("texto", "textoCentrado", "negrita", "padding6")
                        fechaDelDiaUI.innerHTML = fechaDia_humana
                        contenedorDia.appendChild(fechaDelDiaUI)

                        const selectorEnDia = document.createElement("select");
                        selectorEnDia.classList.add("botonV1BlancoIzquierda_campo")
                        selectorEnDia.setAttribute("campoOferta", "contextoAplicacion");
                        selectorEnDia.addEventListener("change", (e) => {
                            const areaDia = e.target.closest("[contenedor=dia]")
                            const conteneodrIDV = e.target.value
                            const selectoresContenedor = areaDia.querySelectorAll("[contenedorDelDia")
                            for (const contenedor of selectoresContenedor) {
                                contenedor.classList.add("contenedorOculto")
                            }
                            areaDia.querySelector(`[contenedorDelDia="${conteneodrIDV}"]`).classList.remove("contenedorOculto")
                        })
                        const opcionesSelector = [{
                            nombre: "Determina, dentro de este día, cómo se aplica un descuento al neto del día o por apartamentos del día.",
                            inicial: "si",
                        }, {
                            nombre: "Aplicar descuento al total neto del día.",
                            descuentoIDV: "netoPorDia",
                        }, {
                            nombre: "Aplicar descuentos individuales a los apartamientos del día.",
                            descuentoIDV: "netoPorApartamentoDelDia",
                        }]

                        for (const opcion of opcionesSelector) {
                            const nombre = opcion.nombre
                            const inicial = opcion.inicial
                            const descuentoIDV = opcion.descuentoIDV
                            const opcionUI = document.createElement("option")
                            if (inicial === "si") {
                                opcionUI.selected = true;
                                opcionUI.disabled = true;
                            } else {
                                opcionUI.value = descuentoIDV
                            }
                            opcionUI.textContent = nombre
                            selectorEnDia.appendChild(opcionUI)
                            contenedorDia.appendChild(selectorEnDia)
                        }
                        if (tipoDescuento) {
                            selectorEnDia.value = tipoDescuento
                        }
                        const totalNetoPorDiaUI = casaVitini.view.__sharedMethods__.ofertas_componentesUI.componenteUI.descuentosUI.porRango.porDiasDelRango.totalNetoPorDiaUI({
                            instanciaUID: fecha
                        })
                        contenedorDia.appendChild(totalNetoPorDiaUI)

                        const totalNetoPorApartametnosDelDiaUI = casaVitini.view.__sharedMethods__.ofertas_componentesUI.componenteUI.descuentosUI.porRango.porDiasDelRango.totalNetoPorApartamentosDelDiaUI({
                            instanciaUID: fecha
                        })
                        contenedorDia.appendChild(totalNetoPorApartametnosDelDiaUI)
                        return contenedorDia
                    }
                }
            }
        },
        controladorDescuentos: (data) => {

            const descuentoIDV = data.descuentoIDV

            const areaDescuentosUI = data.contenedorDescuentos
            const selectorDescuentosUI = areaDescuentosUI.querySelectorAll("[descuentoIDV]")
            selectorDescuentosUI.forEach((descuentoUI) => {
                descuentoUI.classList.add("contenedorOculto")
            })

            areaDescuentosUI.querySelector(`[descuentoIDV="${descuentoIDV}"]`)?.classList.remove("contenedorOculto")
        },
        compartidos: {
            opcionesContenedorApartamentoUI: (data) => {

                const descuentoTotal = data?.descuentoTotal || ""
                const seleccionadoInicial = data?.seleccionadoInicial || ""

                const ui = document.createElement("div")
                ui.classList.add("flexVertical", "gap6")

                const cantidadUI = document.createElement("input")
                cantidadUI.classList.add("botonV1BlancoIzquierda_campo")
                cantidadUI.style.borderRadius = "4px"
                cantidadUI.setAttribute("campoApartamentoSeleccionado", "descuentoTotal")
                cantidadUI.placeholder = "Inserta la cantidad"
                cantidadUI.value = descuentoTotal
                ui.appendChild(cantidadUI)

                const tipoDescuento = document.createElement("select")
                tipoDescuento.classList.add("botonV1BlancoIzquierda_campo")
                tipoDescuento.style.borderRadius = "4px"
                tipoDescuento.setAttribute("campoApartamentoSeleccionado", "tipoDescuento")
                const opcionPredeterminada = document.createElement("option")

                opcionPredeterminada.disabled = true;
                opcionPredeterminada.selected = true;
                opcionPredeterminada.text = "Selecciona el tipo de descuento"
                tipoDescuento.appendChild(opcionPredeterminada)
                const tipoDescuentoOpciones = [
                    {
                        nombreUI: "Selecciona el tipo de descuento",
                    },
                    {
                        nombreUI: "Porcentaje",
                        valorIDV: "porcentaje",
                    },
                    {
                        nombreUI: "Cantidad fija",
                        valorIDV: "cantidadFija",
                    }
                ]
                tipoDescuentoOpciones.forEach((tipoDescuentoOpcion) => {
                    const valorIDV = tipoDescuentoOpcion?.valorIDV || null
                    const nombreUI = tipoDescuentoOpcion.nombreUI

                    const opcion = document.createElement("option");
                    if (seleccionadoInicial === valorIDV) {
                        opcion.selected = true;
                    } else {

                    }
                    opcion.value = valorIDV;
                    opcion.text = nombreUI;
                    opcion.setAttribute("tipoDescuentoIDV", valorIDV)
                    tipoDescuento.appendChild(opcion);
                })
                ui.appendChild(tipoDescuento)
                return ui
            }
        },
        infoCodigosRepeditos: (data) => {
            const ofertasConElMismoCodigo = data.ofertasConElMismoCodigo
            const main = document.querySelector("main")

            const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
            pantallaInmersiva.style.justifyContent = "center"
            main.appendChild(pantallaInmersiva)
            const constructor = pantallaInmersiva.querySelector("[componente=constructor]")
            const contenedor = constructor.querySelector("[componente=contenedor]")

            const titulo = constructor.querySelector("[componente=titulo]")
            titulo.textContent = `La oferta no se ha actualizado `
            const mensaje = constructor.querySelector("[componente=mensajeUI]")
            mensaje.textContent = data?.error


            const botonAceptar = constructor.querySelector("[boton=aceptar]")
            botonAceptar.remove()
            const botonCancelar = constructor.querySelector("[boton=cancelar]")
            botonCancelar.textContent = "Volver a la oferta"

            const contenedorLista = document.createElement("div")
            contenedorLista.classList.add(
                "flexVertical",
                "gap10",
                "ratonDefault"
            )
            contenedor.appendChild(contenedorLista)


            ofertasConElMismoCodigo.forEach(oferta => {
                const ofertaUID = oferta.ofertaUID
                const nombreOferta = oferta.nombreOferta

                const ofertaUI = document.createElement("a")
                ofertaUI.classList.add(
                    "borderRadius10",
                    "areaSinDecoracionPredeterminada",
                    "backgroundGrey1",
                    "padding12",
                    "comportamientoBoton",
                    "ratonDefault"
                )
                ofertaUI.setAttribute("href", `/administracion/gestion_de_ofertas/oferta:${ofertaUID}`)
                ofertaUI.setAttribute("vista", `/administracion/gestion_de_ofertas/oferta:${ofertaUID}`)
                ofertaUI.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                contenedorLista.appendChild(ofertaUI)

                const titulo = document.createElement("div")
                titulo.textContent = "Oferta"
                ofertaUI.appendChild(titulo)

                const reservaIdentificador = document.createElement("div")
                reservaIdentificador.classList.add(
                    "negrita"
                )
                reservaIdentificador.textContent = nombreOferta
                ofertaUI.appendChild(reservaIdentificador)
            })
        },
        detalleUI: function (modoUI) {
            const instanciaUID_contenedorFechas = casaVitini.utilidades.codigoFechaInstancia()
            const divPrincipal = document.createElement("div");
            divPrincipal.setAttribute("componente", "espacioCrearOferta");
            divPrincipal.classList.add("espacioClientes");

            const divContenedorNombreYEstado = document.createElement("div");

            if (modoUI === "editarOferta") {
                divContenedorNombreYEstado.classList.add("crearOfertaContenedorHorizontalV2");

                const botonEstadoOferta = document.createElement("div")
                botonEstadoOferta.classList.add("creatOfertaBotonEstado")
                botonEstadoOferta.setAttribute("componente", "estadoOferta")
                botonEstadoOferta.addEventListener("click", (e) => { casaVitini.view.detallesOferta.estadoOferta(e) })
                botonEstadoOferta.textContent = "Oferta desactivada"
                divContenedorNombreYEstado.appendChild(botonEstadoOferta)

            }
            if (modoUI === "crearOferta") {
                divContenedorNombreYEstado.classList.add("crearOfertaContenedorHorizontalModoCrear");
            }

            const input = document.createElement("input");
            input.setAttribute("type", "text");
            input.setAttribute("campoOferta", "nombreOferta");
            input.setAttribute("placeholder", "Escriba un nombre a esta oferta, el nombre sera publico");
            divContenedorNombreYEstado.appendChild(input)
            divPrincipal.appendChild(divContenedorNombreYEstado)


            const titulo = document.createElement("p");
            titulo.classList.add("crearOfertaTituloOpcion");
            titulo.textContent = "Selecciona el rango de fechas de vigencia de la oferta.Este rango determina el inicio y el final de la vigencia de la oferta.Cuando se realiza una reserva, se determina si, en el momento de hacer una reserva, con la fecha de creación, esta, la reserva, puede acceder a la oferta.";
            divPrincipal.appendChild(titulo);

            const divContenedor = document.createElement("div");
            divContenedor.classList.add("administracion_ofertas_crearOfertas_contenedorFecha");
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
                    tituloCalendario: "Selecciona la fecha de inicio del rango de vigencia de la oferta",
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
                    tituloCalendario: "Selecciona la fecha del fin del rango de vigencia de la oferta",
                    seleccionableDiaLimite: "si"

                })
            })
            const contenedorZonaOferta = document.createElement("div")
            contenedorZonaOferta.classList.add("contenedorZonaOferta")

            const selectorZonaOferta = document.createElement("select")
            selectorZonaOferta.classList.add(
                "selector",
                "textCentrado"
            )
            selectorZonaOferta.setAttribute("campo", "zonaIDV")
            const opcionPredeterminada = document.createElement("option")
            opcionPredeterminada.selected = true
            opcionPredeterminada.disabled = true;
            opcionPredeterminada.value = "no"
            opcionPredeterminada.text = "Zona de la oferta"
            selectorZonaOferta.appendChild(opcionPredeterminada)
            const opciones = [
                { value: "publica", text: "Zona publica" },
                { value: "global", text: "Zona global" },
                { value: "privada", text: "Zona privada" }
            ]
            for (const opcionData of opciones) {
                const opcion = document.createElement("option");
                opcion.value = opcionData.value;
                opcion.text = opcionData.text;
                selectorZonaOferta.appendChild(opcion);
            }
            contenedorZonaOferta.appendChild(selectorZonaOferta)

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
            divContenedorHorizontal.appendChild(contenedorZonaOferta);
            divContenedorHorizontal.appendChild(divContenedorFechaFin);
            divContenedor.appendChild(divContenedorHorizontal);

            divPrincipal.appendChild(divContenedor);

            const botonAnadirCondicion = document.createElement("div")
            botonAnadirCondicion.classList.add("botonV1")
            botonAnadirCondicion.setAttribute("boton", "anadirCondicion")
            if (modoUI === "editarOferta") {
                botonAnadirCondicion.style.display = "none"
            }
            botonAnadirCondicion.textContent = "Añadir condición"
            botonAnadirCondicion.addEventListener("click", casaVitini.view.__sharedMethods__.ofertas_componentesUI.componenteUI.selectorTipoOferta)
            divPrincipal.appendChild(botonAnadirCondicion)

            const contonenedorPropiedades = document.createElement("div")
            contonenedorPropiedades.setAttribute("contenedor", "superBloque")
            contonenedorPropiedades.classList.add(
                "flexVertical",
                "gap6"
            )
            divPrincipal.appendChild(contonenedorPropiedades)

            const contenedorCondiciones = document.createElement("div")
            contenedorCondiciones.setAttribute("contenedor", "condiciones")
            contenedorCondiciones.classList.add("contenedorCondiciones")
            contonenedorPropiedades.appendChild(contenedorCondiciones)

            const infoCondiciones = document.createElement("div")
            infoCondiciones.setAttribute("info", "condiciones")
            infoCondiciones.classList.add(
                "textoCentrado",
                "padding10"
            )
            infoCondiciones.textContent = "Inserta condiciones a esta oferta."
            contenedorCondiciones.appendChild(infoCondiciones)

            const descuentosUI = casaVitini.view.__sharedMethods__.ofertas_componentesUI.componenteUI.contenedorDescuento()
            contonenedorPropiedades.appendChild(descuentosUI)

            return divPrincipal
        }
    },
    utilidades: {
        constructorObjeto: () => {
            const nombreOferta = document.querySelector("[campoOferta=nombreOferta]").value
            const fechaInicio_ISO = document.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
            const fechaFinal_ISO = document.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")
            const zonaIDV = document.querySelector("[campo=zonaIDV]").value
            const contenedorCondiciones = document.querySelector("[contenedor=condiciones]")

            const oferta = {
                nombreOferta,
                zonaIDV,
                entidadIDV: "reserva",
                fechaInicio: fechaInicio_ISO,
                fechaFinal: fechaFinal_ISO,
                condicionesArray: [],
                descuentosJSON: {}
            }

            const condiciones = contenedorCondiciones.querySelectorAll(`[zonaOferta]`)
            condiciones.forEach((espacioCondicion) => {
                const tipoCondicion = espacioCondicion.getAttribute("zonaOferta")
                const estructuraConficion = {}
                if (tipoCondicion === "porNumeroDeApartamentos") {
                    const tipoConteo = espacioCondicion.querySelector("[campoOferta=tipoConteo]").value
                    const numeroDeApartamentos = espacioCondicion.querySelector("[campoOferta=numeroDeApartamentos]").value

                    estructuraConficion.tipoCondicion = tipoCondicion
                    estructuraConficion.tipoConteo = tipoConteo
                    estructuraConficion.numeroDeApartamentos = numeroDeApartamentos

                    oferta.condicionesArray.push(estructuraConficion)
                } else if (tipoCondicion === "porApartamentosEspecificos") {
                    estructuraConficion.tipoCondicion = tipoCondicion
                    const tipoDeEspecificidad = espacioCondicion.querySelector("[campo=tipoDeEspecificidad]").value
                    estructuraConficion.tipoDeEspecificidad = tipoDeEspecificidad
                    estructuraConficion.apartamentos = []

                    const apartamentosSeleccionados = espacioCondicion.querySelectorAll("[apartamentoIDV]")
                    apartamentosSeleccionados.forEach((apartamento) => {
                        const apartamentoIDV = apartamento.getAttribute("apartamentoIDV")
                        estructuraConficion.apartamentos.push({
                            apartamentoIDV: apartamentoIDV
                        })
                    })
                    oferta.condicionesArray.push(estructuraConficion)

                } else if (tipoCondicion === "porDiasDeAntelacion") {
                    const tipoConteo = espacioCondicion.querySelector("[campoOferta=tipoConteo]").value
                    const numeroDeDias = espacioCondicion.querySelector("[campoOferta=numeroDeDias]").value

                    estructuraConficion.tipoCondicion = tipoCondicion
                    estructuraConficion.tipoConteo = tipoConteo
                    estructuraConficion.numeroDeDias = numeroDeDias

                    oferta.condicionesArray.push(estructuraConficion)
                } else if (tipoCondicion === "porDiasDeReserva") {
                    const tipoConteo = espacioCondicion.querySelector("[campoOferta=tipoConteo]").value
                    const numeroDeDias = espacioCondicion.querySelector("[campoOferta=numeroDeDias]").value

                    estructuraConficion.tipoCondicion = tipoCondicion
                    estructuraConficion.tipoConteo = tipoConteo
                    estructuraConficion.numeroDeDias = numeroDeDias
                    oferta.condicionesArray.push(estructuraConficion)

                } else if (tipoCondicion === "conFechaCreacionEntreRango") {
                    estructuraConficion.tipoCondicion = tipoCondicion
                    oferta.condicionesArray.push(estructuraConficion)
                } else if (tipoCondicion === "conFechaEntradaEntreRango") {
                    estructuraConficion.tipoCondicion = tipoCondicion

                    const fechaInicioRango_ISO = espacioCondicion.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
                    const fechaFinalRango_ISO = espacioCondicion.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")

                    estructuraConficion.fechaInicioRango_ISO = fechaInicioRango_ISO
                    estructuraConficion.fechaFinalRango_ISO = fechaFinalRango_ISO


                    oferta.condicionesArray.push(estructuraConficion)

                } else if (tipoCondicion === "conFechaSalidaEntreRango") {
                    estructuraConficion.tipoCondicion = tipoCondicion

                    const fechaInicioRango_ISO = espacioCondicion.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
                    const fechaFinalRango_ISO = espacioCondicion.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")
                    estructuraConficion.fechaInicioRango_ISO = fechaInicioRango_ISO
                    estructuraConficion.fechaFinalRango_ISO = fechaFinalRango_ISO

                    oferta.condicionesArray.push(estructuraConficion)

                } else if (tipoCondicion === "porRangoDeFechas") {
                    estructuraConficion.tipoCondicion = tipoCondicion

                    const fechaInicioRango_ISO = espacioCondicion.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
                    const fechaFinalRango_ISO = espacioCondicion.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")

                    estructuraConficion.fechaInicioRango_ISO = fechaInicioRango_ISO
                    estructuraConficion.fechaFinalRango_ISO = fechaFinalRango_ISO
                    oferta.condicionesArray.push(estructuraConficion)

                } else if (tipoCondicion === "porCodigoDescuento") {
                    estructuraConficion.tipoCondicion = tipoCondicion
                    const codigoDescuento = espacioCondicion.querySelector("[campo=codigoDescuento]").value
                    estructuraConficion.codigoDescuento = codigoDescuento
                    oferta.condicionesArray.push(estructuraConficion)

                } else {
                    const error = "No se reconoce el tipo de oferta"
                    return casaVitini.ui.vistas.advertenciaInmersiva(error)
                }
            })

            const contenedorDescuentos = document.querySelector("[contenedor=descuentos]")
            const tipoDescuento = contenedorDescuentos.querySelector("[componente=tipoDescuento]")?.value
            if (tipoDescuento === "totalNeto") {
                const descuentoTotal = contenedorDescuentos.querySelector(`[descuentoIDV="${tipoDescuento}"] [campoOferta=descuentoGlobal]`).value
                const tipoAplicacion = contenedorDescuentos.querySelector(`[descuentoIDV="${tipoDescuento}"] [campoOferta=tipoDescuento]`).value

                const estructuraDescuento = {
                    tipoDescuento: tipoDescuento,
                    tipoAplicacion: tipoAplicacion,
                    descuentoTotal: descuentoTotal
                }
                oferta.descuentosJSON = estructuraDescuento
            } else if (tipoDescuento === "mismoDescuentoParaCadaApartamento") {
                const descuentoTotal = contenedorDescuentos.querySelector(`[descuentoIDV="${tipoDescuento}"] [campoOferta=descuentoGlobal]`).value
                const tipoAplicacion = contenedorDescuentos.querySelector(`[descuentoIDV="${tipoDescuento}"] [campoOferta=tipoDescuento]`).value

                const estructuraDescuento = {
                    tipoDescuento: tipoDescuento,
                    tipoAplicacion: tipoAplicacion,
                    descuentoTotal: descuentoTotal
                }
                oferta.descuentosJSON = estructuraDescuento
            } else if (tipoDescuento === "individualPorApartamento") {
                const apartamentos = []

                const apartamentosSeleccionados = contenedorDescuentos.querySelector("[descuentoidv=individualPorApartamento]").querySelectorAll("[apartamentoIDV]")
                apartamentosSeleccionados.forEach((apartamento) => {
                    const apartamentoIDV = apartamento.getAttribute("apartamentoIDV")
                    const descuentoTotal = apartamento.querySelector("[campoapartamentoseleccionado=descuentoTotal]").value
                    const tipoDescuento = apartamento.querySelector("[campoapartamentoseleccionado=tipoDescuento]").value

                    const estructuraApartamento = {
                        apartamentoIDV,
                        descuentoTotal,
                        tipoAplicacion: tipoDescuento
                    }
                    apartamentos.push(estructuraApartamento)

                })
                const estructuraDescuento = {
                    tipoDescuento: tipoDescuento,
                    apartamentos: apartamentos
                }
                oferta.descuentosJSON = estructuraDescuento

            } else if (tipoDescuento === "porRango") {
                const area = contenedorDescuentos.querySelector("[area=descuentosPorRango]")
                const fechaInicioRango_ISO = area.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
                const fechaFinalRango_ISO = area.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")
                const subTipoDescuento = area.querySelector("[componente=subTipoDescuento]").value


                const estructuraDescuento = {
                    tipoDescuento: tipoDescuento,
                    fechaInicioRango_ISO: fechaInicioRango_ISO,
                    fechaFinalRango_ISO: fechaFinalRango_ISO,
                    subTipoDescuento: subTipoDescuento,
                }
                oferta.descuentosJSON = estructuraDescuento

                if (subTipoDescuento === "totalNetoPorRango") {
                    const descuentoTotal = area.querySelector("[campoOferta=descuentoGlobal]").value
                    const tipoAplicacion = area.querySelector("[campoOferta=tipoDescuento]").value
                    estructuraDescuento.tipoAplicacion = tipoAplicacion
                    estructuraDescuento.descuentoTotal = descuentoTotal
                }

                if (subTipoDescuento === "porDiasDelRango") {
                    estructuraDescuento.descuentoPorDias = []

                    const contenedorPorDiasPorRango = area.querySelectorAll("[contenedor=dia]")
                    contenedorPorDiasPorRango.forEach((dia) => {

                        const fechaDelDia = dia.getAttribute("fechaDelDia")

                        const estructuraDescuentoPorDia = {
                            fecha: fechaDelDia
                        }
                        const tipoDescuentoEnElDia = dia.querySelector("[campoOferta=contextoAplicacion]").value
                        estructuraDescuentoPorDia.tipoDescuento = tipoDescuentoEnElDia


                        if (tipoDescuentoEnElDia === "netoPorDia") {
                            const descuentoTotal = dia.querySelector("[campoOferta=descuentoGlobal]").value
                            const tipoAplicacion = dia.querySelector("[campoOferta=tipoDescuento]").value

                            estructuraDescuentoPorDia.tipoAplicacion = tipoAplicacion
                            estructuraDescuentoPorDia.descuentoTotal = descuentoTotal

                            estructuraDescuento.descuentoPorDias.push(estructuraDescuentoPorDia)

                        } else if (tipoDescuentoEnElDia === "netoPorApartamentoDelDia") {
                            const contenedorApartamentos = dia.querySelectorAll("[apartamentoIDV]")
                            estructuraDescuentoPorDia.apartamentos = []

                            contenedorApartamentos.forEach((apartamento) => {
                                const aparatmentoIDV = apartamento.getAttribute("apartamentoIDV")
                                const tipoAplicacion = apartamento.querySelector("[campoApartamentoSeleccionado=tipoDescuento]").value
                                const descuentoTotal = apartamento.querySelector("[campoApartamentoSeleccionado=descuentoTotal]").value

                                const descuentoPorApartamento = {
                                    apartamentoIDV: aparatmentoIDV,
                                    tipoAplicacion: tipoAplicacion,
                                    descuentoTotal: descuentoTotal,
                                }
                                estructuraDescuentoPorDia.apartamentos.push(descuentoPorApartamento)

                            })
                            estructuraDescuento.descuentoPorDias.push(estructuraDescuentoPorDia)
                        }
                    })
                }
            }
            return oferta
        },

    }
}