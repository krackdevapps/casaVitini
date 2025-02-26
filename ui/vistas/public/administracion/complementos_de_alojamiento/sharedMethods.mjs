export const sharedMethods = {
    complementoUI: (data) => {
        const modoUI = data.modoUI
        const apartamentoIDV = data.apartamentoIDV
        const complementoUID = data.complementoUID
        const ui = document.createElement("div");
        ui.setAttribute("componente", "complementoUI");
        ui.setAttribute("apartamentoIDV", apartamentoIDV)
        ui.setAttribute("complementoUID", complementoUID)
        ui.classList.add(
            "flexVertical",
            "gap6",
            "padding14"
        )

        const contenedorNombreEstado = document.createElement("div");

        if (modoUI === "editar") {
            contenedorNombreEstado.classList.add("crearOfertaContenedorHorizontalV2");

            const botonEstadoOferta = document.createElement("div")
            botonEstadoOferta.classList.add("creatOfertaBotonEstado")
            botonEstadoOferta.setAttribute("componente", "estado")
            botonEstadoOferta.addEventListener("click", (e) => { casaVitini.view.complementosPorAlojamiento.detallesComplemento.estadoUIControlador(e) })
            botonEstadoOferta.textContent = "Servicio desactivado"
            contenedorNombreEstado.appendChild(botonEstadoOferta)

        }
        if (modoUI === "crear") {
            contenedorNombreEstado.classList.add("flexVertical");
        }
        const input = document.createElement("input");
        input.setAttribute("type", "text");
        input.classList.add(
            "padding12",
            "borderRadius10"
        );
        input.setAttribute("campo", "complementoUI");
        input.setAttribute("placeholder", "Escriba el nombre del nuevo complemento");
        contenedorNombreEstado.appendChild(input)
        ui.appendChild(contenedorNombreEstado)

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
            titulo.textContent = "Añade una descripción si el complemento necesita de esta."
            contenedor.appendChild(titulo)

            const campo = document.createElement("input")
            campo.setAttribute("campo", "tituloPublico")
            campo.classList.add(
                "padding10",
                "borderRadius10"
            )
            campo.placeholder = "Titulo del servicio"
            //contenedor.appendChild(campo)


            const definicion = document.createElement("textarea")
            definicion.setAttribute("campo", "definicion")
            definicion.classList.add(
                "padding10",
                "borderRadius10",
                "resizeOnlyVertical",
                "area300px",

            )
            definicion.placeholder = "Definición del complemento"
            contenedor.appendChild(definicion)
            return contenedor
        }

        ui.appendChild(contenedorDefinicion())

        const contenedorPrecio = () => {
            const contenedor = document.createElement("div")
            contenedor.setAttribute("contenedor", "cantidad")
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
            titulo.textContent = "Precio del servicio, determina el valor de este servicio. El precio del servicio tiene que estar en formato número con dos decimales separados por punto."
            contenedor.appendChild(titulo)

            const selector = document.createElement("select")
            selector.classList.add(
                "selector",
            )
            selector.setAttribute("campo", "tipoPrecio")
            const opcionPredeterminada = document.createElement("option")
            opcionPredeterminada.selected = true
            opcionPredeterminada.disabled = true;
            opcionPredeterminada.value = ""
            opcionPredeterminada.text = "Seleciona el tipo de precio"
            selector.appendChild(opcionPredeterminada)
            const opciones = [
                { value: "fijoPorReserva", text: "Precio fijo por reserva" },
                { value: "porNoche", text: "Precio por noche" },

            ]
            for (const opcionData of opciones) {
                const opcion = document.createElement("option");
                opcion.value = opcionData.value;
                opcion.text = opcionData.text;
                selector.appendChild(opcion);
            }
            contenedor.appendChild(selector)

            const campo = document.createElement("input")
            campo.setAttribute("campo", "precio")
            campo.classList.add(
                "padding10",
                "borderRadius10"
            )
            campo.placeholder = "00.00"
            contenedor.appendChild(campo)


            return contenedor
        }

        ui.appendChild(contenedorPrecio())

        return ui


    },
    constructorObjeto: () => {
        const apartamentoIDV = document.querySelector("[apartamentoIDV]").getAttribute("apartamentoIDV")
        const complementoUI = document.querySelector("[campo=complementoUI]").value
        const definicion = document.querySelector("[campo=definicion]").value
        const tipoPrecio = document.querySelector("[campo=tipoPrecio]").value
        const precio = document.querySelector("[campo=precio]").value
        return {
            apartamentoIDV,
            complementoUI,
            definicion,
            tipoPrecio,
            precio
        }
    },
    nuevo: {
        arranque: async function (apartamentoIDV) {


            const main = document.querySelector("main")
            const instanciaUID = main.getAttribute("instanciaUID")
            const espacio = main.querySelector("[componente=espacio]")

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/arquitectura/configuraciones/detalleConfiguracionAlojamiento",
                apartamentoIDV: apartamentoIDV
            })
            const seccionRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
            if (!seccionRenderizada) { return }
            if (respuestaServidor?.error) {
                casaVitini.ui.componentes.mensajeSimple({
                    titulo: "No existe la configuración de alojamiento",
                    descripcion: respuestaServidor.error
                })
            }
            if (respuestaServidor?.ok) {

                const apartamentoUI = respuestaServidor.apartamentoUI
                main.querySelector("[data=titulo]").textContent = `Nuevo complemento de alojamiento de ${apartamentoUI}`

                const ui = casaVitini.view.__sharedMethods__.complementoUI({
                    modoUI: "crear",
                    apartamentoIDV
                })
                espacio.appendChild(ui)
                const botonCrearServicio = casaVitini.view.__sharedMethods__.botonesCrear()
                ui.appendChild(botonCrearServicio)
            }



        },
        crear: async function () {

            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()

            const metadatosPantallaCarga = {
                mensaje: "Creando complemento...",
                instanciaUID: instanciaUID,
            }

            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(metadatosPantallaCarga)

            const transaccion = casaVitini.view.__sharedMethods__.constructorObjeto()
            transaccion.zona = "administracion/complementosDeAlojamiento/crearComplementoDeAlojamiento"

            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            const pantallaDeCargaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
            if (!pantallaDeCargaRenderizada) {
                return
            }
            if (respuestaServidor?.error) {
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                const complementoUID = respuestaServidor?.nuevoComplementoUID
                const apartamentoIDV = respuestaServidor?.apartamentoIDV
                casaVitini.shell.navegacion.controladorVista({
                    vista: `administracion/complementos_de_alojamiento/alojamiento:${apartamentoIDV}`,
                    tipoOrigen: "menuNavegador"
                })
            }
        },
    },
    botonesCrear: function () {
        const boton = document.createElement("p");
        boton.classList.add("botonV1");
        boton.textContent = "Crear complemento";
        boton.setAttribute("boton", "crear");
        boton.addEventListener("click", () => { casaVitini.view.__sharedMethods__.nuevo.crear() })
        return boton
    },

}