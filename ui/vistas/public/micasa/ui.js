casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "/micasa")
        const marcoCuenta = document.querySelector("[componente=marcoCuenta]")
        const metadatos = {
            zona: "IDX/estado"
        }
        const respuestaServidor = await casaVitini.shell.servidor(metadatos)
        if (respuestaServidor?.error) {
            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.usuario) {

            const usuarioIDX = respuestaServidor?.usuario
            const rolIDV = respuestaServidor?.rolIDV
            const cuentaVerificadaIDV = respuestaServidor?.cuentaVerificadaIDV
            const metadatosBanner = {
                usuarioIDX: usuarioIDX,
                rolIDV: rolIDV
            }
            let rolUI
            if (rolIDV === "empleado") {
                rolUI = "empleado"
            }
            if (rolIDV === "cliente") {
                rolUI = "usuario"
            }
            if (cuentaVerificadaIDV === "no" && rolIDV !== "administrador") {
                const infoCuentaNoVerificada = document.createElement("p")
                infoCuentaNoVerificada.classList.add("infoCuenta")
                infoCuentaNoVerificada.innerHTML = `Tu cuenta de ${rolUI} no está verificada. Para verificar tu cuenta, valida tu correo electrónico. Si no verificas tu cuenta de ${rolUI}, no podrás acceder a tus reservas, no podras recuperar tu cuenta en caso de olvido de la contraseña y la cuenta se eliminará pasadas 24h. Si necesitas que te reenviemos otra vez el mail de verificación, entra en la sección de recuperación de cuentas yendo a Mi Casa > <a href="/micasa/recuperar_cuenta" class="enlace">Recuperar mi cuenta</a>`
                marcoCuenta.appendChild(infoCuentaNoVerificada)
            }
            if (cuentaVerificadaIDV === "no" && rolIDV === "administrador") {
                const infoCuentaNoVerificada = document.createElement("p")
                infoCuentaNoVerificada.classList.add("infoCuenta")
                infoCuentaNoVerificada.innerHTML = `Tu cuenta administrativa no está verificada. Para verificar tu cuenta, valida tu correo electrónico. Si no verificas tu cuenta administrativa, aunque podrás usar el panel de administración, no podrás acceder a tus reservas personales y si olvidas tu contraseña, no podrás recuperar tu cuenta a menos que te pongas en contacto con otro administrador. Las cuentas administrativas no verificadas no caducan con el tiempo. Si necesitas que te reenviemos otra vez el mail de verificación, entra en la sección de recuperación de cuentas yendo a Mi Casa > <a href="/micasa/recuperar_cuenta" class="enlace">Recuperar mi cuenta</a>`
                marcoCuenta.appendChild(infoCuentaNoVerificada)
            }
            const contenedorBanner = document.createElement("div")
            contenedorBanner.classList.add("miCasa_marcoIDX_contenedor")
            const bannerIDX = this.__sharedMethods__.bannerIDX(metadatosBanner)
            contenedorBanner.appendChild(bannerIDX)
            marcoCuenta.appendChild(contenedorBanner)
            const botonReservas = document.createElement("a")
            botonReservas.setAttribute("class", "botonUsuario")
            botonReservas.setAttribute("href", "/micasa/reservas")
            botonReservas.setAttribute("vista", "/micasa/reservas")
            botonReservas.classList.add("miCasa_marcoUsuario_opcion")
            botonReservas.textContent = "Mis Reservas"
            botonReservas.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            const botonModificarIDX = document.createElement("a")
            botonModificarIDX.setAttribute("class", "botonUsuario")
            botonModificarIDX.setAttribute("href", "/micasa/modificar_nombre_de_usuario")
            botonModificarIDX.setAttribute("vista", "/micasa/modificar_nombre_de_usuario")
            botonModificarIDX.classList.add("miCasa_marcoUsuario_opcion")
            botonModificarIDX.textContent = "Modificar nombre de usuario"
            botonModificarIDX.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            const botonDatosPersonales = document.createElement("a")
            botonDatosPersonales.setAttribute("class", "botonUsuario")
            botonDatosPersonales.setAttribute("href", "/micasa/mis_datos_personales")
            botonDatosPersonales.setAttribute("vista", "/micasa/mis_datos_personales")
            botonDatosPersonales.classList.add("miCasa_marcoUsuario_opcion")
            botonDatosPersonales.textContent = "Mis datos personales"
            botonDatosPersonales.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            const botonCambiarContrasena = document.createElement("a")
            botonCambiarContrasena.setAttribute("class", "botonUsuario")
            botonCambiarContrasena.setAttribute("href", "/micasa/cambiar_clave")
            botonCambiarContrasena.setAttribute("vista", "/micasa/cambiar_clave")
            botonCambiarContrasena.classList.add("miCasa_marcoUsuario_opcion")
            botonCambiarContrasena.textContent = "Cambiar contrasena"
            botonCambiarContrasena.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            const botonSessionesActivas = document.createElement("a")
            botonSessionesActivas.setAttribute("class", "botonUsuario")
            botonSessionesActivas.setAttribute("href", "/micasa/sessiones")
            botonSessionesActivas.setAttribute("vista", "/micasa/sessiones")
            botonSessionesActivas.classList.add("miCasa_marcoUsuario_opcion")
            botonSessionesActivas.textContent = "Sessiones activas"
            botonSessionesActivas.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            const botonZonaHoraria = document.createElement("a")
            botonZonaHoraria.setAttribute("class", "botonUsuario")
            botonZonaHoraria.setAttribute("href", "/micasa/zona_horaria")
            botonZonaHoraria.setAttribute("vista", "/micasa/zona_horaria")
            botonZonaHoraria.classList.add("miCasa_marcoUsuario_opcion")
            botonZonaHoraria.textContent = "Configuración de la zona horaria"
            botonZonaHoraria.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            const botonCerrarSession = document.createElement("a")
            botonCerrarSession.setAttribute("class", "botonUsuario")
            botonCerrarSession.setAttribute("componente", "botonCerrarSession")
            botonCerrarSession.classList.add("miCasa_marcoUsuario_opcion")
            botonCerrarSession.textContent = "Cerrar session"
            botonCerrarSession.addEventListener("click", () => { this.cerrarSession() })
            const botonEliminarCuenta = document.createElement("a")
            botonEliminarCuenta.setAttribute("class", "botonUsuario")
            botonEliminarCuenta.setAttribute("href", "/micasa/eliminar_cuenta")
            botonEliminarCuenta.setAttribute("vista", "/micasa/eliminar_cuenta")
            botonEliminarCuenta.setAttribute("componente", "botonEliminarCuenta")
            botonEliminarCuenta.classList.add("miCasa_marcoUsuario_opcion")
            botonEliminarCuenta.textContent = "Eliminar cuenta"
            botonEliminarCuenta.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)

            const marcoUsuario = document.createElement("div")
            marcoUsuario.classList.add("miCasa_marcoUsuario")
            marcoUsuario.setAttribute("componente", "marcoUsuario")
            if (rolIDV === "cliente") {
                marcoUsuario.appendChild(botonReservas)
                marcoUsuario.appendChild(botonModificarIDX)
                marcoUsuario.appendChild(botonDatosPersonales)
                marcoUsuario.appendChild(botonSessionesActivas)
                marcoUsuario.appendChild(botonCambiarContrasena)
                marcoUsuario.appendChild(botonEliminarCuenta)
                marcoUsuario.appendChild(botonCerrarSession)
            }
            if (rolIDV === "administrador" || rolIDV === "empleado") {
                marcoUsuario.appendChild(botonReservas)
                marcoUsuario.appendChild(botonModificarIDX)
                marcoUsuario.appendChild(botonDatosPersonales)
                marcoUsuario.appendChild(botonSessionesActivas)

                marcoUsuario.appendChild(botonCambiarContrasena)
                marcoUsuario.appendChild(botonEliminarCuenta)
                marcoUsuario.appendChild(botonCerrarSession)
            }
            marcoCuenta.appendChild(marcoUsuario)
        }
    },
    cerrarSession: async () => {
        const selectorBotonCerrarSession = document.querySelector("[componente=botonCerrarSession]")
        selectorBotonCerrarSession.textContent = "Cerrando session..."

        const IDX = await casaVitini.shell.IDX.cerrarSession()
        if (!IDX) {
            selectorBotonCerrarSession.textContent = "Cerrar session"
        } else if (IDX?.estadoIDV === "desconectado") {

            casaVitini.shell.navegacion.controladorVista({
                vista: "/micasa",
                tipoOrigen: "menuNavegador"
            })
        }
    },
}