casaVitini.view = {
    start: () => {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/ofertas/ofertaUI")
        const selector = document.querySelector("[componente=espacioOfertas]")
        const ofertaUI = casaVitini.view.__sharedMethods__.componenteUI.detalleUI("crearOferta")
        selector.appendChild(ofertaUI)
        selector.setAttribute("modo", "crearOferta")
        const botonesCrearOferta = casaVitini.view.__sharedMethods__.componenteUI.botonesCrearOferta()
        main.appendChild(botonesCrearOferta)
    },
    crearOfertaConfirmar: async () => {

        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
            mensaje: "Creando oferta...",
            instanciaUID: instanciaUID,
        })
        const transaccion = casaVitini.view.__sharedMethods__.utilidades.constructorObjeto()
        transaccion.zona = "administracion/ofertas/crearOferta"
        transaccion.entidadIDV = "reserva"


        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        const pantallaDeCargaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)

        if (!pantallaDeCargaRenderizada) {
            return
        }
        pantallaDeCargaRenderizada?.remove()
        if (respuestaServidor.ofertasConElMismoCodigo) {
            return casaVitini.view.__sharedMethods__.componenteUI.infoCodigosRepeditos(respuestaServidor)
        } else if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {

            const nuevaOferta = respuestaServidor?.oferta.ofertaUID
            const vista = `/administracion/gestion_de_ofertas/oferta:${nuevaOferta}`
            const navegacion = {
                vista: vista,
                tipoOrigen: "menuNavegador"
            }
            casaVitini.shell.navegacion.controladorVista(navegacion)
        }
    },

}