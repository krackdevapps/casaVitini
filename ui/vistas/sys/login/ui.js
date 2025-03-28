casaVitini.view = {
    start: function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "/micasa")
        this.gestionIdioma()
        document.querySelector("[boton=iniciarSession]").addEventListener("click", () => {
            this.botonIniciarSession("iniciarSession")
        })
        document.querySelector("[IDX=usuario]").focus();
        const campos = document.querySelectorAll("[componente=campoID]")
        campos.forEach((campo) => {
            campo.addEventListener("input", () => {
                this.controladorCampos()
            })
            campo.addEventListener("input", () => {
                this.reseteaBloqueRespuesta()
            })
            campo.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    this.botonIniciarSession("iniciarSession")
                }
            });
        })
        const opciones = document.querySelectorAll("[opcion]")
        opciones.forEach((opcion) => {
            opcion.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
        })

        const video = document.querySelector("[componente=video]")
        if (video) {
            video.addEventListener('loadedmetadata', () => {
                const duration = video.duration;
                const randomTime = Math.random() * duration;
                video.currentTime = randomTime;
                video.play();
            });
        }
    },
    controladorCampos: function () {
        const campoUsuario = document.querySelector("[componente=campoID][IDX=usuario]")
        const campoClave = document.querySelector("[componente=campoID][IDX=clave]")
        const contenedorBotones = document.querySelector("[componente=contenedorBotones]")
        if (campoUsuario.value.length === 0 || campoClave.value.length === 0) {
            contenedorBotones.removeAttribute("style")
        } else {
            contenedorBotones.style.pointerEvents = "all"
            contenedorBotones.style.visibility = "visible"
        }
    },
    botonIniciarSession: function (boton) {
        const bloqueRespuesta = document.querySelector("[componente=bloqueRespuesta")
        bloqueRespuesta.textContent = null
        bloqueRespuesta.removeAttribute("style")
        if (boton === "iniciarSession") {
            const usuario = document.querySelector("[IDX=usuario]")
            const clave = document.querySelector("[IDX=clave]")
            if (usuario.value.length === 0) {
                const mensaje = "Por favor escribe tu usuario"
                bloqueRespuesta.textContent = mensaje
                bloqueRespuesta.style.display = "block"
                return
            }
            if (clave.value.length === 0) {
                const mensaje = "Por favor escribe tu contraseña"
                bloqueRespuesta.textContent = mensaje
                bloqueRespuesta.style.display = "block"
                return
            }
            const transaccion = {
                usuario: usuario.value,
                clave: clave.value
            }
            return casaVitini.shell.IDX.iniciarSession(transaccion)
        }
    },
    reseteaBloqueRespuesta: function () {
        const bloqueRespuesta = document.querySelector("[componente=bloqueRespuesta]")
        bloqueRespuesta.removeAttribute("style")
        bloqueRespuesta.textContent = "-"
        bloqueRespuesta.style.opacity = "0"
        document.querySelectorAll("[componente=campoID]").forEach(campo => {
            campo.removeAttribute("style")
        });
    },
    gestionIdioma: function () {

        const idiomaNavegador = navigator.language || navigator.languages[0];
        if (idiomaNavegador.startsWith('en')) {
            const main = document.querySelector("main")


            const clave = main.querySelector("[IDX=clave]")
            clave.placeholder = "Password"


            const iniciarSession = main.querySelector("[boton=iniciarSession]")
            iniciarSession.textContent = "Login"

            const registraCuentaNueva = main.querySelector("[opcion=registraCuentaNueva]")
            registraCuentaNueva.textContent = "Register a new account"
        }


    }
}