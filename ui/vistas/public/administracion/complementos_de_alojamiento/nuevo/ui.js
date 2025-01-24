casaVitini.view = {
    start: async function (apartamentoIDV) {
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

            const ui = this.__sharedMethods__.complementoUI({
                modoUI: "crear",
                apartamentoIDV
            })
            espacio.appendChild(ui)
            const botonCrearServicio = this.__sharedMethods__.botonesCrear()
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

        const transaccion = this.__sharedMethods__.constructorObjeto()
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
    
}