casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "/micasa")
        const contenedorDatosPersonales = document.querySelector("[componente=marcoCuenta]")
        const transaccion = {
            zona: "/miCasa/datosPersonalesDesdeMiCasa"
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        if (respuestaServidor?.error) {
            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {

            const detallesUsuario = respuestaServidor?.ok
            const usuarioIDX = detallesUsuario.usuarioIDX
            const rolIDV = detallesUsuario.rolIDV
            const nombre = detallesUsuario.nombre || ""
            const primerApellido = detallesUsuario.primerApellido || ""
            const segundoApellido = detallesUsuario.segundoApellido || ""
            const pasaporte = detallesUsuario.pasaporte || ""
            const telefono = detallesUsuario.telefono || ""
            const mail = detallesUsuario.mail || ""
            const datosBanner = {
                usuarioIDX: usuarioIDX,
                rolIDV: rolIDV
            }

            const contenedorBanner = document.createElement("div")
            contenedorBanner.classList.add("miCasa_marcoIDX_contenedor")
            const contenedorUsuarioIDX = this.__sharedMethods__.bannerIDX(datosBanner)
            contenedorBanner.appendChild(contenedorUsuarioIDX)
            contenedorDatosPersonales.appendChild(contenedorBanner)
            const contenedorDatosUsuario = document.createElement("div")
            contenedorDatosUsuario.classList.add("detallesUsuario_contenedorDatosUsuario")
            const nombreUI = document.createElement("a")
            nombreUI.classList.add("detallesUsuario_contenedorCampoEInfo")
            let titulo = document.createElement("p")
            titulo.classList.add("textoNegita", "padding14")
            titulo.textContent = "Nombre"
            nombreUI.appendChild(titulo)
            const campoNombre = document.createElement("input")
            campoNombre.classList.add("botonV1BlancoIzquierda_campo")
            campoNombre.setAttribute("campo", "nombre")
            campoNombre.setAttribute("valorInicial", nombre)
            campoNombre.value = nombre
            nombreUI.appendChild(campoNombre)
            contenedorDatosUsuario.appendChild(nombreUI)
            const primerApellidoUI = document.createElement("a")
            primerApellidoUI.classList.add("detallesUsuario_contenedorCampoEInfo")
            titulo = document.createElement("p")
            titulo.classList.add("textoNegita", "padding14")
            titulo.textContent = "Primero apellido"
            primerApellidoUI.appendChild(titulo)
            const campoPrimerApellido = document.createElement("input")
            campoPrimerApellido.classList.add("botonV1BlancoIzquierda_campo")
            campoPrimerApellido.setAttribute("campo", "primerApellido")
            campoPrimerApellido.setAttribute("valorInicial", primerApellido)
            campoPrimerApellido.value = primerApellido
            primerApellidoUI.appendChild(campoPrimerApellido)
            contenedorDatosUsuario.appendChild(primerApellidoUI)
            const segundoApellidoUI = document.createElement("a")
            segundoApellidoUI.classList.add("detallesUsuario_contenedorCampoEInfo")
            titulo = document.createElement("p")
            titulo.classList.add("textoNegita", "padding14")
            titulo.textContent = "Segundo apellido"
            segundoApellidoUI.appendChild(titulo)
            const campoSegundoApellido = document.createElement("input")
            campoSegundoApellido.classList.add("botonV1BlancoIzquierda_campo")
            campoSegundoApellido.setAttribute("campo", "segundoApellido")
            campoSegundoApellido.setAttribute("valorInicial", segundoApellido)
            campoSegundoApellido.value = segundoApellido
            segundoApellidoUI.appendChild(campoSegundoApellido)
            contenedorDatosUsuario.appendChild(segundoApellidoUI)
            const pasaporteUI = document.createElement("a")
            pasaporteUI.classList.add("detallesUsuario_contenedorCampoEInfo")
            titulo = document.createElement("p")
            titulo.classList.add("textoNegita", "padding14")

            titulo.textContent = "Pasaporte"
            pasaporteUI.appendChild(titulo)
            const campoPasaporte = document.createElement("input")
            campoPasaporte.classList.add("botonV1BlancoIzquierda_campo")
            campoPasaporte.setAttribute("campo", "pasaporte")
            campoPasaporte.setAttribute("valorInicial", pasaporte)
            campoPasaporte.value = pasaporte
            pasaporteUI.appendChild(campoPasaporte)
            contenedorDatosUsuario.appendChild(pasaporteUI)
            const telefonoUI = document.createElement("a")
            telefonoUI.classList.add("detallesUsuario_contenedorCampoEInfo")
            titulo = document.createElement("p")
            titulo.classList.add("textoNegita", "padding14")
            titulo.textContent = "Teléfono"
            telefonoUI.appendChild(titulo)
            const campoTelefono = document.createElement("input")
            campoTelefono.classList.add("botonV1BlancoIzquierda_campo")
            campoTelefono.setAttribute("campo", "telefono")
            campoTelefono.setAttribute("valorInicial", telefono)
            campoTelefono.value = telefono
            telefonoUI.appendChild(campoTelefono)
            contenedorDatosUsuario.appendChild(telefonoUI)
            const mailUI = document.createElement("a")
            mailUI.classList.add("detallesUsuario_contenedorCampoEInfo")
            titulo = document.createElement("p")
            titulo.classList.add("textoNegita", "padding14")
            titulo.textContent = "Correo electroníco"
            mailUI.appendChild(titulo)
            const campomail = document.createElement("input")
            campomail.classList.add("botonV1BlancoIzquierda_campo")
            campomail.setAttribute("campo", "mail")
            campomail.setAttribute("valorInicial", mail)
            campomail.value = mail
            mailUI.appendChild(campomail)
            contenedorDatosUsuario.appendChild(mailUI)
            contenedorDatosPersonales.appendChild(contenedorDatosUsuario)
            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add("detallesUsuario_contenedorBotones")
            contenedorBotones.setAttribute("componente", "contenedorBotones")
            const botonGuardarCambios = document.createElement("div")
            botonGuardarCambios.classList.add("botonV1BlancoIzquierda")
            botonGuardarCambios.addEventListener("click", () => {
              this.guardarCambios()
            })
            botonGuardarCambios.textContent = "Guardar cambios"
            contenedorBotones.appendChild(botonGuardarCambios)
            const botonCancelarCambios = document.createElement("div")
            botonCancelarCambios.classList.add("botonV1BlancoIzquierda")
            botonCancelarCambios.textContent = "Cancelar cambios"
            botonCancelarCambios.addEventListener("click", () => {
                this.cancelarCambios()
            })
            contenedorBotones.appendChild(botonCancelarCambios)
            contenedorDatosPersonales.appendChild(contenedorBotones)
            const campos = document.querySelectorAll("[campo]")
            const selectorContenedorBotones = document.querySelector("[componente=contenedorBotones]")

            const controladorCampos = () => {
                let estadoUI = "ocultar"
                campos.forEach((campo) => {
                    const campoValor = campo.value
                    const valorInicial = campo.getAttribute("valorInicial")

                    if (campoValor !== valorInicial) {
                        selectorContenedorBotones.style.display = "flex"
                        estadoUI = "activado"
                    }
                    if (estadoUI === "ocultar") {
                        selectorContenedorBotones.removeAttribute("style")
                    }

                })
            }
            campos.forEach((campo) => {
                campo.addEventListener("input", controladorCampos)
            })
        }
    },
    cancelarCambios: function () {
        const campos = document.querySelectorAll("[campo]")
        campos.forEach((campo) => {
            const valorInicial = campo.getAttribute("valorInicial")
            campo.value = valorInicial
        })
        const selectorContenedorBotones = document.querySelector("[componente=contenedorBotones]")
        selectorContenedorBotones.removeAttribute("style")
    },
    guardarCambios: async function () {
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = "Actualizando tu datos..."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje,
            botonCancelar: "ocultar"
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
        const campos = document.querySelectorAll("[campo]")
        const datosParaActualizar = {
            zona: "miCasa/actualizarDatosUsuarioDesdeMiCasa",
        }
        campos.forEach((campo) => {
            const campoID = campo.getAttribute("campo")
            const campoDato = campo.value
            datosParaActualizar[campoID] = campoDato
        })
        const respuestaServidor = await casaVitini.shell.servidor(datosParaActualizar)

        const pantallaDeCargaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!pantallaDeCargaRenderizada) { return }
        pantallaDeCargaRenderizada.remove()
        if (respuestaServidor?.error) {
            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const detallesUsuario = respuestaServidor?.datosActualizados
            const nombre = detallesUsuario.nombre
            const primerApellido = detallesUsuario.primerApellido
            const segundoApellido = detallesUsuario.segundoApellido
            const pasaporte = detallesUsuario.pasaporte
            const telefono = detallesUsuario.telefono
            const mail = detallesUsuario.mail
            campos.forEach((campo) => {
                const campoID = campo.getAttribute("campo")
                campo.value = detallesUsuario[campoID]
                campo.setAttribute("valorInicial", detallesUsuario[campoID])
            })
            const selectorContenedorBotones = document.querySelector("[componente=contenedorBotones]")
            selectorContenedorBotones.removeAttribute("style")
        }
    }
}