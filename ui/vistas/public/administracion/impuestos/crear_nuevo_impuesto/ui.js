casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/impuestos/nuevo")

        const opcionesTipoValor = [
            {
                tipoValorIDV: "porcentaje",
                tipoValorUI: "Porcentaje"
            },
            {
                tipoValorIDV: "tasa",
                tipoValorUI: "Tasa"
            }
        ]

        const opcionesEntidad = [
            {
                entidadIDV: "reserva",
                entidadUI: "Reserva"
            },
            {
                entidadIDV: "servicio",
                entidadUI: "Servicios"
            },
            {
                entidadIDV: "global",
                entidadUI: "Global"
            },

        ]

        const selectorEspacioImpuestos = document.querySelector("[componente=espacioImpuestos]")
        const contenedorNuevoImpuesto = document.createElement("div")
        contenedorNuevoImpuesto.classList.add("flexVertical", "gap10")
        const bloqueBloqueoApartamentos = document.createElement("div")
        bloqueBloqueoApartamentos.classList.add("flexVertical", "gap10")
        const tituloBloquoApartamentos = document.createElement("div")
        tituloBloquoApartamentos.classList.add("textoCentrado", "padding10")
        tituloBloquoApartamentos.textContent = "Para crear un nuevo impuesto, rellene los datos de este, establece un nombre, una cantidad y seleccione las opciones restantes."
        bloqueBloqueoApartamentos.appendChild(tituloBloquoApartamentos)
        let campoCraerNuevoImpuesto = document.createElement("input")
        campoCraerNuevoImpuesto.classList.add("botonV1BlancoIzquierda_campo")
        campoCraerNuevoImpuesto.setAttribute("comNuevoImpuesto", "nombre")
        campoCraerNuevoImpuesto.placeholder = "Escribo el nombre del nuevo impuesto"
        bloqueBloqueoApartamentos.appendChild(campoCraerNuevoImpuesto)
        campoCraerNuevoImpuesto = document.createElement("input")
        campoCraerNuevoImpuesto.classList.add("botonV1BlancoIzquierda_campo")
        campoCraerNuevoImpuesto.setAttribute("comNuevoImpuesto", "tipoImpositivo")
        campoCraerNuevoImpuesto.placeholder = "0.00"
        bloqueBloqueoApartamentos.appendChild(campoCraerNuevoImpuesto)
        let contenedorOpciones = document.createElement("select")
        contenedorOpciones.classList.add("botonV1BlancoIzquierda_campo")
        contenedorOpciones.setAttribute("comNuevoImpuesto", "tipoValorIDV")

        const opTipoValor = document.createElement("option")
        opTipoValor.selected = "true"
        opTipoValor.disabled = "true"
        opTipoValor.value = ""
        opTipoValor.text = "Selecciona el tipo de valor del impuesto"
        contenedorOpciones.appendChild(opTipoValor)

        opcionesTipoValor.forEach((opcionTipoValor) => {
            const tipoValorIDV = opcionTipoValor.tipoValorIDV
            const tipoValorUI = opcionTipoValor.tipoValorUI
            const opcion = document.createElement("option");
            opcion.value = tipoValorIDV;
            opcion.text = tipoValorUI;
            opcion.setAttribute("opcion", tipoValorIDV)
            contenedorOpciones.add(opcion);
        })
        bloqueBloqueoApartamentos.appendChild(contenedorOpciones)
        contenedorOpciones = document.createElement("select")
        contenedorOpciones.classList.add("botonV1BlancoIzquierda_campo")
        contenedorOpciones.setAttribute("comNuevoImpuesto", "entidadIDV")


        const opEntidades = document.createElement("option")
        opEntidades.selected = "true"
        opEntidades.disabled = "true"
        opEntidades.value = ""
        opEntidades.text = "Selecciona el tipo de entidad"
        contenedorOpciones.appendChild(opEntidades)

        opcionesEntidad.forEach((entidad) => {
            const entidadIDV = entidad.entidadIDV
            const entidadUI = entidad.entidadUI
            const opcion = document.createElement("option");
            opcion.value = entidadIDV;
            opcion.text = entidadUI;
            opcion.setAttribute("opcion", entidadIDV)
            contenedorOpciones.add(opcion);
        })
        bloqueBloqueoApartamentos.appendChild(contenedorOpciones)

        contenedorNuevoImpuesto.appendChild(bloqueBloqueoApartamentos)
        const bloqueBotones = document.createElement("div")
        bloqueBotones.classList.add("flexVertical")
        const botonCancelar = document.createElement("div")
        botonCancelar.classList.add("botonV1")
        botonCancelar.setAttribute("componente", "botonConfirmarCancelarReserva")
        botonCancelar.textContent = "Crear nuevo impuesto"
        botonCancelar.addEventListener("click", () => { this.confirmarCrearImpuesto() })
        bloqueBotones.appendChild(botonCancelar)

        contenedorNuevoImpuesto.appendChild(bloqueBotones)
        selectorEspacioImpuestos.appendChild(contenedorNuevoImpuesto)

    },
    confirmarCrearImpuesto: async function () {
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = "Creando nuevo impuesto..."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje,
            identificadorVisual: "pantallaDeCarga"
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
        const transaccion = {
            zona: "administracion/impuestos/crearNuevoImpuesto"
        }

        let selectorCampos = document.querySelectorAll("[comNuevoImpuesto]")
        selectorCampos.forEach((campoNuevoImpuesto) => {
            const nombreCampo = campoNuevoImpuesto.getAttribute("comNuevoImpuesto")
            const datoCampo = campoNuevoImpuesto.value
            transaccion[nombreCampo] = datoCampo
        })

        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!instanciaRenderizada) { return }
        instanciaRenderizada.remove()


        if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const nuevoUIDIMpuesto = respuestaServidor?.nuevoImpuestoUID
            const entrada = {
                vista: "/administracion/impuestos/" + nuevoUIDIMpuesto,
                tipoOrigen: "menuNavegador"
            }
            casaVitini.shell.navegacion.controladorVista(entrada)
        }
    }
}