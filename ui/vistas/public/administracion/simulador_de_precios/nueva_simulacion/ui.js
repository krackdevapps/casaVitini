casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/simuladorPrecios/nuevaSimulacion")

        const selectorEspacio = document.querySelector("[componente=espacio]")

        const bloqueBloqueoApartamentos = document.createElement("div")
        bloqueBloqueoApartamentos.classList.add("detallesReservaCancelarReservaBloqueBloqueoApartamentos")
        const tituloBloquoApartamentos = document.createElement("div")
        tituloBloquoApartamentos.classList.add(
            "flexVertical",
            "textoCentrado"
        )
        tituloBloquoApartamentos.textContent = "Cree una simulación de un desglose total. Esto le permite cerciorarse en detalle de cómo se aplican las reservas, los impuestos, los servicios, las ofertas y los comportamientos de precio. Para empezar a crear una simulacion, determina un nombre para esta. Luego tambien podras cambiar el nombre en cualquier momento."
        bloqueBloqueoApartamentos.appendChild(tituloBloquoApartamentos)
        selectorEspacio.appendChild(bloqueBloqueoApartamentos)


        const campoNombre = document.createElement("input")
        campoNombre.setAttribute("campo", "nombre")
        campoNombre.classList.add("botonV1BlancoIzquierda_campo")
        campoNombre.placeholder = "Escribe el nombre de la nueva simulación"
        selectorEspacio.appendChild(campoNombre)


        const botonCrear = document.createElement("div")
        botonCrear.classList.add(
            "botonV1",
            "comportamientoBoton",
            "padding6",
            "textoCentrado",
            "backgroundGrey1",
            "borderRadius8",
            "noSelecionable"
        )
        botonCrear.textContent = "Crear nueva simulación"
        botonCrear.addEventListener("click", () => { this.guardarNuevaSimulacion() })
        selectorEspacio.appendChild(botonCrear)



    },
    guardarNuevaSimulacion: async function () {
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = "Guardando simulacion..."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje,
            identificadorVisual: "pantallaDeCarga"
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)

        const nombre = document.querySelector("[campo=nombre]").value


        const transaccion = {
            zona: "administracion/simuladorDePrecios/guardarSimulacion",
            nombre
        }

        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!instanciaRenderizada) { return }
        instanciaRenderizada.remove()

        if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const simuacionUID = respuestaServidor.simulacionUID
            const entrada = {
                vista: "/administracion/simulador_de_precios/simulacion:" + simuacionUID,
                tipoOrigen: "menuNavegador"
            }
            casaVitini.shell.navegacion.controladorVista(entrada)
        }
    },
}