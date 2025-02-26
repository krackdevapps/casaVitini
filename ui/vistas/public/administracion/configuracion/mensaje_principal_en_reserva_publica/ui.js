casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        const instanciaUID = main.getAttribute("instanciaUID")
        main.setAttribute("zonaCSS", "administracion/configuracion")
        const marcoElastico = document.querySelector("[componente=marcoElastico]")


        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "administracion/configuracion/mensajePrincipalEnReservaConfirmada/obtenerMensaje"
        })
        casaVitini.shell.controladoresUI.ocultarMenusVolatiles()
        const ui_renderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!ui_renderizada) { return }
        if (respuestaServidor?.error) {
            marcoElastico.textContent = respuestaServidor?.error
        }
        if (respuestaServidor?.ok) {
            const mensajePrincipalEnReservaConfirmada = respuestaServidor.ok.mensajePrincipalEnReservaConfirmada

            const informacion = document.createElement("div")
            informacion.classList.add(
                "padding14"
            )
            informacion.textContent = "El mensaje principal en la reserva confirmada es el texto que le aparecerá al cliente cuando este realiza una reserva publica por su cuenta desde Casa Vitini. Este mensaje le da la información principal que el cliente necesita tras confirmar su reserva. Como, por ejemplo, como realizar el pago, si debe de hacer alguna operación de más o no. Si lo desea, puede dejar en blanco este campo, aunque es recomendable siempre asistir con información también en la parte final de la reserva."
            marcoElastico.appendChild(informacion)


            const titulo = document.createElement("div")
            titulo.classList.add(
                "padding14"
            )
            titulo.textContent = "Mensaje principal de información para la vista de reserva confirmada"
            marcoElastico.appendChild(titulo)

            const campoNumero = document.createElement("textarea")
            campoNumero.classList.add("areaTexto")
            campoNumero.placeholder = "Escriba un mensaje principal"
            campoNumero.value = mensajePrincipalEnReservaConfirmada || ""
            campoNumero.setAttribute("campo", "mensaje")
            marcoElastico.appendChild(campoNumero)

            const botonGuardar = document.createElement("div")
            botonGuardar.style.width = "fit-content"
            botonGuardar.classList.add(
                "botonV1"
            )
            botonGuardar.textContent = "Actualizar mensaje"
            botonGuardar.addEventListener("click", () => {
                this.actualizarMensaje(campoNumero.value)
            })
            marcoElastico.appendChild(botonGuardar)

        }
    },
    actualizarMensaje: async function (data) {
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = "Actualizando número de telefono público..."

        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
            instanciaUID: instanciaUID,
            mensaje: mensaje
        })
        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "administracion/configuracion/mensajePrincipalEnReservaConfirmada/actualizarMensaje",
            mensajePrincipalEnReservaConfirmada: data
        })
        const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!instanciaRenderizada) { return }
        instanciaRenderizada.remove()
        if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const mensajePrincipalEnReservaConfirmada = respuestaServidor.mensajePrincipalEnReservaConfirmada
            const campo = document.querySelector("[campo=mensaje]")
            campo.value = mensajePrincipalEnReservaConfirmada || ""
        }
    }
}