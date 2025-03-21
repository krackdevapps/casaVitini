casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "/micasa")
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const comandoInicial = granuladoURL.directorios[granuladoURL.directorios.length - 1]
        if (comandoInicial === "recuperar_cuenta") {
            return this.ui.formularioEnviarmail()
        }
        const comandoSecundario = granuladoURL.directorios[granuladoURL.directorios.length - 2]
        if (comandoSecundario === "recuperar_cuenta") {
            const transaccion = {
                zona: "miCasa/recuperarCuenta/validarCodigo",
                codigo: comandoInicial
            }
            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            if (respuestaServidor?.error) {
                return this.ui.codigoErroneo()
            }
            if (respuestaServidor?.ok) {
                return this.ui.restablecerClave(comandoInicial)
            }
        }
    },
    ui: {
        formularioEnviarmail: function () {

            const titulo = document.createElement('p');
            titulo.className = 'titulo';
            titulo.textContent = 'Recuperar mi cuenta de Casa Vitini';
            const marcoElasticoRelativo = document.createElement('div');
            marcoElasticoRelativo.className = 'marcoElasticoRelativo';
            const marcoElastico = document.createElement('div');
            marcoElastico.className = 'marcoElastico';
            const contenedorCrearCuenta = document.createElement('form');
            contenedorCrearCuenta.className = 'miCasa_crearCuenta_contenedorCrearCuenta';
            const texto = document.createElement('p');
            texto.className = 'padding14';
            texto.textContent = 'Si has olvidado tu contraseña o si creaste tu VitiniID pero aún no lo verificaste con tu cuenta de correo electrónico, por favor, proporciona la dirección de correo electrónico con la que registraste tu VitiniID. Te enviaremos un mensaje a tu bandeja de entrada con un enlace temporal para restablecer tu contraseña o un enlace de verificación para completar la activación de tu cuenta.';
            const input = document.createElement('input');
            input.type = 'text'
            input.autocomplete = "mail"
            input.className = 'botonV1BlancoIzquierda_noSeleccionable';
            input.setAttribute('campo', 'mail');
            input.placeholder = 'Escribe tu direción de correo electroníco';
            const contenedorBotones = document.createElement('div');
            contenedorBotones.className = 'miCuenta_cambioClave_contenedorBotones';
            const botonEnviar = document.createElement('div');
            botonEnviar.className = 'botonV1BlancoIzquierda';
            botonEnviar.setAttribute('componente', 'botonCrearNuevaCuenta');
            botonEnviar.addEventListener("click", () => {
                casaVitini.view.transactores.enviarEnlaceRecuperacion()
            })
            botonEnviar.textContent = 'Enviar mensaje de recuperación o verificación';

            const secction = document.querySelector("main")
            secction.appendChild(titulo);
            contenedorCrearCuenta.appendChild(texto);
            contenedorCrearCuenta.appendChild(input);
            contenedorBotones.appendChild(botonEnviar);
            contenedorCrearCuenta.appendChild(contenedorBotones);
            marcoElastico.appendChild(contenedorCrearCuenta);
            marcoElasticoRelativo.appendChild(marcoElastico);
            secction.appendChild(marcoElasticoRelativo);
        },
        codigoErroneo: function () {
            const marcoElasticoRelatico = document.createElement("div")
            marcoElasticoRelatico.classList.add("marcoElasticoRelativo")
            const marcoElastico = document.createElement("div")
            marcoElastico.classList.add("marcoElastico")
            marcoElastico.style.alignItems = "stretch"
            marcoElastico.style.gap = "4px"
            const titulo = document.createElement("div")
            titulo.classList.add("tituloGris", "textoCentrado")
            titulo.textContent = "El código de recuperación es erróneo"
            marcoElastico.appendChild(titulo)

            const contenedorBanner = document.createElement("a")
            contenedorBanner.classList.add("padding14")
            contenedorBanner.textContent = "El código de recuperación es erróneo. Revisa el código introducido. Recuerda que los códigos de recuperación tienen una validez de una hora desde que se generan, se usen o no. También recuerda que los códigos de recuperación son de un solo uso. Si has generado varios códigos de recuperación, recuerda que también solo es válido un código a la vez. Eso quiere decir que si generaste varios códigos, el válido solo es el último código generado, el más nuevo."
            marcoElastico.appendChild(contenedorBanner)
            const botonIniciarReserva = document.createElement("a")
            botonIniciarReserva.classList.add("botonV1BlancoIzquierda")
            botonIniciarReserva.textContent = "Ir a generar un nuevo código"
            botonIniciarReserva.setAttribute("href", "/micasa/recuperar_cuenta")
            botonIniciarReserva.setAttribute("vista", "/micasa/recuperar_cuenta")
            botonIniciarReserva.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            marcoElastico.appendChild(botonIniciarReserva)
            const botonIrARegistrarse = document.createElement("a")
            botonIrARegistrarse.classList.add("botonV1BlancoIzquierda")
            botonIrARegistrarse.textContent = "Ir al portal de MiCasa"
            botonIrARegistrarse.setAttribute("href", "/micasa")
            botonIrARegistrarse.setAttribute("vista", "/micasa")
            botonIrARegistrarse.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            marcoElastico.appendChild(botonIrARegistrarse)

            marcoElasticoRelatico.appendChild(marcoElastico)
            const seccion = document.querySelector("main")
            seccion.innerHTML = null
            seccion.appendChild(marcoElasticoRelatico)
        },
        mensajeEnviado: function () {
            const marcoElasticoRelatico = document.createElement("div")
            marcoElasticoRelatico.classList.add("marcoElasticoRelativo")
            const marcoElastico = document.createElement("div")
            marcoElastico.classList.add("marcoElastico")
            marcoElastico.style.alignItems = "stretch"
            marcoElastico.style.gap = "4px"
            const titulo = document.createElement("div")
            titulo.classList.add("tituloGris", "textoCentrado")
            titulo.textContent = "Mensaje enviado"
            marcoElastico.appendChild(titulo)

            const contenedorBanner = document.createElement("a")
            contenedorBanner.classList.add("padding14", "textoCentrado")
            contenedorBanner.textContent = "Se ha enviado un mensaje a tu buzón con un enlace temporal de una hora de duración para que puedas restablecer tu contraseña y recuperar el acceso a tu VitiniID."
            marcoElastico.appendChild(contenedorBanner)
            const botonIniciarReserva = document.createElement("a")
            botonIniciarReserva.classList.add("botonV1BlancoIzquierda")
            botonIniciarReserva.textContent = "Volver a generar otro código (Acabo de olvidar la nueva clave)"
            botonIniciarReserva.setAttribute("href", "/micasa/recuperar_cuenta")
            botonIniciarReserva.setAttribute("vista", "/micasa/recuperar_cuenta")
            botonIniciarReserva.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)

            const botonIrARegistrarse = document.createElement("a")
            botonIrARegistrarse.classList.add("botonV1BlancoIzquierda")
            botonIrARegistrarse.textContent = "Ir al portal de MiCasa"
            botonIrARegistrarse.setAttribute("href", "/micasa")
            botonIrARegistrarse.setAttribute("vista", "/micasa")
            botonIrARegistrarse.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)

            const botonInciarSession = document.createElement("a")
            botonInciarSession.classList.add("botonV1BlancoIzquierda")
            botonInciarSession.textContent = "Ir a la página principal"
            botonInciarSession.setAttribute("href", "/")
            botonInciarSession.setAttribute("vista", "/")
            botonInciarSession.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)

            marcoElasticoRelatico.appendChild(marcoElastico)
            const seccion = document.querySelector("main")
            seccion.innerHTML = null
            seccion.appendChild(marcoElasticoRelatico)
        },
        claveRestablecida: function () {
            const marcoElasticoRelatico = document.createElement("div")
            marcoElasticoRelatico.classList.add("marcoElasticoRelativo")
            const marcoElastico = document.createElement("div")
            marcoElastico.classList.add("marcoElastico")
            marcoElastico.style.alignItems = "stretch"
            marcoElastico.style.gap = "4px"
            const titulo = document.createElement("div")
            titulo.classList.add("tituloGris", "textoCentrado")
            titulo.textContent = "Cuenta reestablecida"
            marcoElastico.appendChild(titulo)

            const contenedorBanner = document.createElement("a")
            contenedorBanner.classList.add("plaza_miCasa_recuperarCuenta_contenedorInfo")
            contenedorBanner.textContent = "Se ha restablecido tu contraseña. Ya puedes empezar a usarla."
            marcoElastico.appendChild(contenedorBanner)
            const botonIniciarReserva = document.createElement("a")
            botonIniciarReserva.classList.add("plaza_reservas_reservaConfirmada_banner")
            botonIniciarReserva.textContent = "Volver a generar otro código (acabo de olvidar la nueva clave)"
            botonIniciarReserva.setAttribute("href", "/micasa/recuperar_cuenta")
            botonIniciarReserva.setAttribute("vista", "/micasa/recuperar_cuenta")
            botonIniciarReserva.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)

            const botonIrARegistrarse = document.createElement("a")
            botonIrARegistrarse.classList.add("plaza_reservas_reservaConfirmada_banner")
            botonIrARegistrarse.textContent = "Ir al portal de MiCasa"
            botonIrARegistrarse.setAttribute("href", "/micasa")
            botonIrARegistrarse.setAttribute("vista", "/micasa")
            botonIrARegistrarse.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)

            const botonInciarSession = document.createElement("a")
            botonInciarSession.classList.add("plaza_reservas_reservaConfirmada_banner")
            botonInciarSession.textContent = "Ir a la página principal"
            botonInciarSession.setAttribute("href", "/")
            botonInciarSession.setAttribute("vista", "/")
            botonInciarSession.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)

            marcoElasticoRelatico.appendChild(marcoElastico)
            const seccion = document.querySelector("main")
            seccion.innerHTML = null
            seccion.appendChild(marcoElasticoRelatico)
        },
        restablecerClave: function (codigo) {

            const titulo = document.createElement('p');
            titulo.classList.add("tituloGris", "textoCentrado")
            titulo.textContent = 'Restablecer contaseña';
            const marcoElasticoRelativo = document.createElement('div');
            marcoElasticoRelativo.className = 'marcoElasticoRelativo';
            const marcoElastico = document.createElement('div');
            marcoElastico.className = 'marcoElastico';
            const contenedorCrearCuenta = document.createElement('form');
            contenedorCrearCuenta.className = 'miCasa_crearCuenta_contenedorCrearCuenta';
            const texto = document.createElement('p');
            texto.className = 'texto padding14';
            texto.textContent = 'Restablece la contraseña de tu VitiniID. Una vez la restablezcas, este enlace dejará de tener valides. Escoge una contraseña robusta y segura. Es recomendable usar un llavero de contraseñas tanto para generarlas como para gestionarlas. Este enlace te otorga una hora para restablecer tu contraseña.';
            const clave = document.createElement('input');
            clave.type = 'password';
            clave.className = 'botonV1BlancoIzquierda_campo';
            clave.autocomplete = "new-password"
            clave.setAttribute('campo', 'clave');
            clave.placeholder = 'Escribe tu nueva contraseña';
            const claveConfirmada = document.createElement('input');
            claveConfirmada.type = 'password';
            claveConfirmada.className = 'botonV1BlancoIzquierda_campo';
            claveConfirmada.autocomplete = "new-password"
            claveConfirmada.setAttribute('campo', 'claveConfirmada');
            claveConfirmada.placeholder = 'Escribe de nuevo tu contraseña';
            const contenedorBotones = document.createElement('div');
            contenedorBotones.className = 'miCuenta_cambioClave_contenedorBotones';
            const botonEnviar = document.createElement('div');
            botonEnviar.className = 'botonV1BlancoIzquierda';
            botonEnviar.setAttribute('componente', 'botonCrearNuevaCuenta');
            botonEnviar.addEventListener("click", () => {
                casaVitini.view.transactores.restablecerClave(codigo)
            })
            botonEnviar.textContent = 'Reestablecer contraseña';

            const secction = document.querySelector("main")
            secction.appendChild(titulo);
            contenedorCrearCuenta.appendChild(texto);
            contenedorCrearCuenta.appendChild(clave);
            contenedorCrearCuenta.appendChild(claveConfirmada);
            contenedorBotones.appendChild(botonEnviar);
            contenedorCrearCuenta.appendChild(contenedorBotones);
            marcoElastico.appendChild(contenedorCrearCuenta);
            marcoElasticoRelativo.appendChild(marcoElastico);
            secction.appendChild(marcoElasticoRelativo);
        },
    },
    transactores: {
        enviarEnlaceRecuperacion: async function () {
            const mail = document.querySelector("[campo=mail]").value
            const main = document.querySelector("main")

            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
            const contenedor = ui.querySelector("[componente=contenedor]")
            main.appendChild(ui)

            const spinner = casaVitini.ui.componentes.spinnerSimple()
            contenedor.appendChild(spinner)


            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "miCasa/recuperarCuenta/enviarCorreo",
                mail: mail.trim()
            })
            if (!ui) { return }

            if (respuestaServidor?.error) {
                contenedor.innerHTML = null
                const errorUI = casaVitini.ui.componentes.errorUI_respuestaInmersiva({
                    errorUI: respuestaServidor.error
                })
                contenedor.appendChild(errorUI)
            } else if (respuestaServidor?.ok) {
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                return casaVitini.view.ui.mensajeEnviado()
            }
        },
        restablecerClave: async function (codigo) {
            const main = document.querySelector("main")

            const clave = document.querySelector("[campo=clave]").value
            const claveConfirmada = document.querySelector("[campo=claveConfirmada]").value

            const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
            const contenedor = ui.querySelector("[componente=contenedor]")
            main.appendChild(ui)
            const spinner = casaVitini.ui.componentes.spinnerSimple()
            contenedor.appendChild(spinner)

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "miCasa/recuperarCuenta/restablecerClave",
                codigo: codigo,
                clave: clave,
                claveConfirmada: claveConfirmada
            })
            if (respuestaServidor?.error) {
                contenedor.innerHTML = null
                const errorUI = casaVitini.ui.componentes.errorUI_respuestaInmersiva({
                    errorUI: respuestaServidor.error
                })
                contenedor.appendChild(errorUI)
            } else if (respuestaServidor?.ok) {
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                return casaVitini.view.ui.claveRestablecida()
            }
        },
    }
}