casaVitini.view = {
    start: function () {

        const granuladorURL = casaVitini.utilidades.granuladorURL()
        const parametros = granuladorURL.parametros

        if (parametros?.deposito) {
            const zona = parametros?.zona
            if (!zona) {
                this.detallesDelDeposito.arranque({
                    deposito: parametros.deposito
                })
            }
        } else {
            this.portada.arranque()
        }


    },
    portada: {
        arranque: function () {
            const main = document.querySelector("main")
            const botonCrear = main.querySelector("[boton=crear]")
            botonCrear.addEventListener("click", (e) => {
                this.crearNuevoDeposito(e)
            })
        },
        crearNuevoDeposito: async function (e) {

            const form = e.target.closest("[ui=nuevoDeposito]")

            const nombre = form.querySelector("[campo=nombre]").value
            const plataforma = form.querySelector("[campo=plataforma]").value

            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const mensaje = `Creando ${nombre}...`
            const datosPantallaSuperpuesta = {
                instanciaUID: instanciaUID,
                mensaje: mensaje
            }
            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/finanzas/depositos/crearNuevoDeposito",
                nombre,
                plataforma
            })

            const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
            if (!instanciaRenderizada) { return }
            instanciaRenderizada.remove()
            if (respuestaServidor?.error) {
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                const depositoUID = respuestaServidor.depositoUID
                casaVitini.shell.navegacion.controladorVista({
                    vista: `/administracion/finanzas/depositos/deposito:${depositoUID}`,
                    tipoOrigen: "menuNavegador"
                })   
            }
        },
    }


}