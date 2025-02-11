casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "/micasa")
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const comandoInicial = granuladoURL.directorios[granuladoURL.directorios.length - 1]
        if (comandoInicial === "verificar_cuenta") {
            return this.ui.portadaUI()
        }
        const comandoSecundario = granuladoURL.directorios[granuladoURL.directorios.length - 2]
        if (comandoSecundario === "verificar_cuenta") {
            const transacccion = {
                zona: "miCasa/verificarCuenta",
                codigo: comandoInicial
            }
            const respuestaServidor = await casaVitini.shell.servidor(transacccion)
            if (respuestaServidor?.error) {
                return this.ui.codigoErroneo()
            }
            if (respuestaServidor?.ok) {
                return this.ui.cuentaVerificada()
            }
        }
    },
    ui: {
        portadaUI: function () {
            const titulo = document.createElement('p');
            titulo.className = 'titulo';
            titulo.textContent = 'Verifica tu cuenta con tu dirección de correo electrónico';
            const marcoElasticoRelativo = document.createElement('div');
            marcoElasticoRelativo.className = 'marcoElasticoRelativo';
            const marcoElastico = document.createElement('div');
            marcoElastico.className = 'marcoElastico';
            marcoElastico.style.alignItems = "stretch"
            marcoElastico.style.gap = "4px"
            const botonRecuperarCuenta = document.createElement("a")
            botonRecuperarCuenta.classList.add("botonV1BlancoIzquierda")
            botonRecuperarCuenta.textContent = "Ir a recuperar mi cuenta para mandar un enlace de verificación a mi correo"
            botonRecuperarCuenta.setAttribute("href", "/micasa/recuperar_cuenta")
            botonRecuperarCuenta.setAttribute("vista", "/micasa/recuperar_cuenta")
            botonRecuperarCuenta.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            const contenedorCrearCuenta = document.createElement('div');
            contenedorCrearCuenta.classList.add('flexVertical', "gap6")
            const texto = document.createElement('p');
            texto.className = 'padding14';
            texto.textContent = 'Cuando creas una cuenta en Casa Vitini, debes verificar tu VitiniID. Para ello, debes acceder desde el enlace que se te envió al buzón de correo electrónico. Si ya no dispones de este enlace, puedes solicitar otro enlace de verificación. Para hacerlo, ve al portal de inicio de sesión y haz clic en "Recuperar tu cuenta". Si tu cuenta no está verificada, se te enviará un correo electrónico de verificación. Cuando recibas el mensaje con los enlaces de verificación, puedes hacer clic en los enlaces o escribir aquí el código de verificación.';
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'botonV1BlancoIzquierda_campo';
            input.setAttribute('campo', 'codigoVerificacion');
            input.placeholder = 'Escribo aquí tu código de verificación';
            const contenedorBotones = document.createElement('div');
            contenedorBotones.className = 'miCuenta_cambioClave_contenedorBotones';
            const botonEnviar = document.createElement('div');
            botonEnviar.className = 'botonV1BlancoIzquierda';
            botonEnviar.setAttribute('componente', 'botonVerificarCodigo');
            botonEnviar.addEventListener("click", () => {
                casaVitini.view.transactores.verificarCodigo()
            })
            botonEnviar.textContent = 'Verificar código';

            const secction = document.querySelector("main")
            secction.appendChild(titulo);
            marcoElastico.appendChild(botonRecuperarCuenta);
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
            marcoElastico.classList.add("marcoElastico", "gap6")
            marcoElastico.style.alignItems = "stretch"
            marcoElasticoRelatico.appendChild(marcoElastico)

            const titulo = document.createElement("div")
            titulo.classList.add("tituloGris", "textoCentrado")
            titulo.textContent = "El código de verificación es erróneo"
            marcoElastico.appendChild(titulo)

            const contenedorBanner = document.createElement("a")
            contenedorBanner.classList.add("padding12")
            contenedorBanner.textContent = "El código de la URL es erróneo porque no está asociado a ninguna cuenta pendiente de verificación. Si estás intentando verificar tu cuenta, recuerda que los códigos de verificación caducan pasado un tiempo. Si necesitas enviar otro código de verificación, pulsa en el botón de abajo para volver a generar un código de verificación"
            marcoElastico.appendChild(contenedorBanner)
            const botonIniciarReserva = document.createElement("a")
            botonIniciarReserva.classList.add("botonV1BlancoIzquierda")
            botonIniciarReserva.textContent = "Ir a generar un nuevo código de verificación"
            botonIniciarReserva.setAttribute("href", "/micasa/recuperar_cuenta")
            botonIniciarReserva.setAttribute("vista", "/micasa/recuperar_cuenta")
            botonIniciarReserva.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            marcoElastico.appendChild(botonIniciarReserva)
        
            const irALogin = document.createElement("a")
            irALogin.classList.add("botonV1BlancoIzquierda")
            irALogin.textContent = "Ir a la pantalla de login"
            irALogin.setAttribute("href", "/micasa")
            irALogin.setAttribute("vista", "/micasa")
            irALogin.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            marcoElastico.appendChild(irALogin)

            const seccion = document.querySelector("main")
            seccion.innerHTML = null
            seccion.appendChild(marcoElasticoRelatico)
        },
        cuentaVerificada: function () {
            const marcoElasticoRelatico = document.createElement("div")
            marcoElasticoRelatico.classList.add("marcoElasticoRelativo")
            const marcoElastico = document.createElement("div")
            marcoElastico.classList.add("marcoElastico")
            marcoElastico.style.alignItems = "stretch"
            marcoElastico.style.gap = "6px"
            const titulo = document.createElement("div")
            titulo.classList.add("tituloGris", "textoCentrado")
            titulo.textContent = "Cuenta verificada"
            marcoElastico.appendChild(titulo)

            const contenedorBanner = document.createElement("a")
            contenedorBanner.classList.add("textoCentrado", "padding14")
            contenedorBanner.textContent = "Se ha verificado la cuenta correctamente, ya puedes usar tu cuenta para ver las reservas hechas."
            marcoElastico.appendChild(contenedorBanner)

            const botonIrARegistrarse = document.createElement("a")
            botonIrARegistrarse.classList.add("botonV1BlancoIzquierda")
            botonIrARegistrarse.textContent = "Ir al portal de MiCasa"
            botonIrARegistrarse.setAttribute("href", "/micasa")
            botonIrARegistrarse.setAttribute("vista", "/micasa")
            botonIrARegistrarse.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            marcoElastico.appendChild(botonIrARegistrarse)
            const botonInciarSession = document.createElement("a")
            botonInciarSession.classList.add("botonV1BlancoIzquierda")
            botonInciarSession.textContent = "Ir a la página principal"
            botonInciarSession.setAttribute("href", "/")
            botonInciarSession.setAttribute("vista", "/")
            botonInciarSession.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            marcoElastico.appendChild(botonInciarSession)
            marcoElasticoRelatico.appendChild(marcoElastico)
            const seccion = document.querySelector("main")
            seccion.innerHTML = null
            seccion.appendChild(marcoElasticoRelatico)
        },
    },
    transactores: {
        verificarCodigo: async function () {
            const codigo = document.querySelector("[campo=codigoVerificacion]").value
            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const mensaje = "Comprobando código de verificación..."

            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta({
                instanciaUID: instanciaUID,
                mensaje: mensaje
            })
            const pantallaDeCargaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
            
            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "miCasa/verificarCuenta",
                codigo: codigo.trim()
            })
            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()

            if (respuestaServidor?.error && pantallaDeCargaRenderizada) {
                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            } else if (respuestaServidor?.ok && pantallaDeCargaRenderizada) {
                return casaVitini.view.ui.cuentaVerificada()
            }

        }
    }
}