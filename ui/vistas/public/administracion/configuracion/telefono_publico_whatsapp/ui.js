casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        const instanciaUID = main.getAttribute("instanciaUID")
        main.setAttribute("zonaCSS", "administracion/configuracion")
        const marcoElastico = document.querySelector("[componente=marcoElastico]")


        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "administracion/configuracion/telefonoPublicoWhatsApp/obtenerTelefono"
        })
        casaVitini.shell.controladoresUI.ocultarMenusVolatiles()
        const ui_renderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!ui_renderizada) { return }
        if (respuestaServidor?.error) {
            marcoElastico.textContent = respuestaServidor?.error
        }
        if (respuestaServidor?.ok) {
            const telefonoPublicoWhatsApp = respuestaServidor.ok.telefonoPublicoWhatsApp

            const informacion = document.createElement("div")
            informacion.classList.add(
                "padding14"
            )
            informacion.textContent = "El número de teléfono público permite otorgar al cliente un icono de WhatsApp durante el proceso de reserva que le permite abrir en su teléfono un chat directo con CasaVitini. Sí se establece un teléfono público, aparecer un icono de WhatsApp al cliente durante el proceso de reserva. Si elimina el número de teléfono, el icono desaparecerá. Ingresa el número con el código internacional. Cuando escriba el código internacional, escribe solo los numero. Por ejemplo, Si el código es +505 escribe los números sin el signo más. Si el código es 00505 escríbelo sin los dos ceros de delante."
            marcoElastico.appendChild(informacion)


            const titulo = document.createElement("div")
            titulo.classList.add(
                "padding14"
            )
            titulo.textContent = "Número de telefono público WhatsApp"
            marcoElastico.appendChild(titulo)

            const campoNumero = document.createElement("input")
            campoNumero.classList.add("botonV1BlancoIzquierda_noSeleccionable")
            campoNumero.placeholder = "Número de ejemplo 0000 000 00 00 00"
            campoNumero.value = telefonoPublicoWhatsApp || ""
            campoNumero.setAttribute("campo", "numero")
            marcoElastico.appendChild(campoNumero)

            const botonGuardar = document.createElement("div")
            botonGuardar.style.width = "fit-content"
            botonGuardar.classList.add(
                "botonV1"
            )
            botonGuardar.textContent = "Actualizar numero de telefono público"
            botonGuardar.addEventListener("click", () => {
                this.actualizarTelefono(campoNumero.value)
            })
            marcoElastico.appendChild(botonGuardar)

        }
    },
    actualizarTelefono: async function (data) {
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = "Actualizando número de telefono público..."

        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
            instanciaUID: instanciaUID,
            mensaje: mensaje
        })
        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "administracion/configuracion/telefonoPublicoWhatsApp/actualizarNumero",
            telefonoPublicoWhatsApp: data
        })
        const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!instanciaRenderizada) { return }
        instanciaRenderizada.remove()
        if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const telefonoPublicoWhatsApp = respuestaServidor.telefonoPublicoWhatsApp
            const campo = document.querySelector("[campo=numero]")
            campo.value = telefonoPublicoWhatsApp || ""
        }
    }
}