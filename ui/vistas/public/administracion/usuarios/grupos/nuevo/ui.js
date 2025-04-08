casaVitini.view = {
    start: function () {

        const main = document.querySelector("main")
        const botonCrear = main.querySelector("[boton=crearGrupo]")
        botonCrear.addEventListener("click", () => {
            this.crearGrupo.confirmar()
        })

    },
    crearGrupo: {
        confirmar: async function (data) {
            const main = document.querySelector("main")
            const campoGrupoUI = main.querySelector("[campo=grupoUI]")

            const grupoUI = campoGrupoUI.value
            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const mensaje = `Creando grupo ${grupoUI}...`
            const datosPantallaSuperpuesta = {
                instanciaUID: instanciaUID,
                mensaje: mensaje
            }
            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/usuarios/grupos/crearNuevoGrupo",
                grupoUI
            })
            const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
            if (!instanciaRenderizada) { return }

            if (respuestaServidor?.error) {
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                const grupoUID = respuestaServidor.grupoUID
                await casaVitini.shell.navegacion.controladorVista({
                    vista: `/administracion/usuarios/grupos/grupo:${grupoUID}`,
                    tipoOrigen: "menuNavegador"
                })
            }
        },
    },
}