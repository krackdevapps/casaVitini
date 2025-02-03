casaVitini.view = {
    start: function () {
        this.UI()
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/gestion_de_bloqueos/bloqueoUI")
    },
    UI: async function () {
        casaVitini.view.__sharedMethods__.bloqueoUI({
            modoUI: "crear"
        })
    },
    transactor: async function () {
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = "Creando bloqueo..."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)


        const bloqueNuevo = casaVitini.view.__sharedMethods__.contructorObjeto()
        bloqueNuevo.zona = "administracion/bloqueos/crearNuevoBloqueo"

        console.log("bloqueNuevo", bloqueNuevo)
        const respuestaServidor = await casaVitini.shell.servidor(bloqueNuevo)
        const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!instanciaRenderizada) { return }
        instanciaRenderizada.remove()
        if (respuestaServidor?.error) {
            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {

            const nuevoUID = respuestaServidor?.nuevoBloqueoUID
            const apartamentoIDV = respuestaServidor.apartamentoIDV
            const vistaFinal = `/administracion/gestion_de_bloqueos_temporales/` + apartamentoIDV + "/" + nuevoUID
            const navegacion = {
                vista: vistaFinal,
                tipoOrigen: "menuNavegador"
            }
            casaVitini.shell.navegacion.controladorVista(navegacion)
        }
    },
    obtenerApartamentos: async function () {
        const transaccion = {
            zona: "administracion/componentes/apartamentosDisponiblesConfigurados"
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        if (respuestaServidor?.error) {
            return respuestaServidor.error
        }
        if (respuestaServidor?.ok) {
            return respuestaServidor?.ok
        }
    }
}