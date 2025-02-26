casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        const instanciaUID = main.getAttribute("instanciaUID")
        main.setAttribute("zonaCSS", "administracion/configuracion")
        const marcoElastico = document.querySelector("[componente=marcoElastico]")


        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "administracion/configuracion/correoCopiaReservaPublica/obtener"
        })
        casaVitini.shell.controladoresUI.ocultarMenusVolatiles()
        const ui_renderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!ui_renderizada) { return }
        if (respuestaServidor?.error) {
            marcoElastico.textContent = respuestaServidor?.error
        }
        if (respuestaServidor?.ok) {
            const correoCopiaReservaPublica = respuestaServidor.ok.correoCopiaReservaPublica

            const informacion = document.createElement("div")
            informacion.classList.add(
                "padding14"
            )
            informacion.textContent = "Determina el correo al que enviar un aviso cuando un cliente realiza una reserva desde la zona pública. Cuando se realiza una reserva desde la zona pública, se envía una copia de la reserva al cliente por correo y si lo necesita también se puede enviar un aviso por mail a la dirección que determine aquí."
            marcoElastico.appendChild(informacion)


            const titulo = document.createElement("div")
            titulo.classList.add(
                "padding14"
            )
            titulo.textContent = "Correo al que enviar un aviso"
            marcoElastico.appendChild(titulo)

            const campoNumero = document.createElement("input")
            campoNumero.classList.add("botonV1BlancoIzquierda_noSeleccionable")
            campoNumero.placeholder = "ejemplo@ejemplo.com"
            campoNumero.value = correoCopiaReservaPublica || ""
            campoNumero.setAttribute("campo", "dato")
            marcoElastico.appendChild(campoNumero)

            const botonGuardar = document.createElement("div")
            botonGuardar.style.width = "fit-content"
            botonGuardar.classList.add(
                "botonV1"
            )
            botonGuardar.textContent = "Actualizar"
            botonGuardar.addEventListener("click", () => {
                this.actualizar(campoNumero.value)
            })
            marcoElastico.appendChild(botonGuardar)

        }
    },
    actualizar: async function(data)  {
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = "Actualizando.."

        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
            instanciaUID: instanciaUID,
            mensaje: mensaje
        })
        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "administracion/configuracion/correoCopiaReservaPublica/actualizar",
            correoCopiaReservaPublica: data
        })

        const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!instanciaRenderizada) { return }

        instanciaRenderizada.remove()
        if (respuestaServidor?.error) {
            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const correoCopiaReservaPublica = respuestaServidor.correoCopiaReservaPublica
            const campo = document.querySelector("[campo=dato]")
            campo.value = correoCopiaReservaPublica || ""
        }
    }
}