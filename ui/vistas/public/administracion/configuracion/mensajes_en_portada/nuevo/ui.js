casaVitini.view = {
    start: function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/configuracion/mensajesEnPortada/nuevo")
        const marcoElastico = document.querySelector("[componente=marcoElastico]")
        marcoElastico.style.padding = "6px"
        const botonCrearNuevoMensaje = document.querySelector("[boton=crearNuevoMensaje]")
        botonCrearNuevoMensaje.addEventListener("click", () => {
            this.crearMensaje()
        })
    },
    crearMensaje: async function () {
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = document.querySelector("[componente=textoDelMensaje]").value
        const mensajeEsppera = "Creando nuevo mensaje en portada..."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensajeEsppera
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
        const transacccion = {
            zona: "administracion/configuracion/mensajesEnPortada/crearMensaje",
            mensaje: mensaje
        }



        const respuestaServidor = await casaVitini.shell.servidor(transacccion)
        const seccionRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!seccionRenderizada)
            seccionRenderizada.remove()
        if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const vistaFinal = `/administracion/configuracion/mensajes_en_portada`
            const navegacion = {
                vista: vistaFinal,
                tipoOrigen: "menuNavegador"
            }
            casaVitini.shell.navegacion.controladorVista(navegacion)
        }
    }
}