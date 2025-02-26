casaVitini.view = {
    start: function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/usuarios/nuevo")
        const espacioUsuario = document.querySelector("[componente=espacioUsuarios]")
        const contenedorGlobal = document.createElement("div")
        contenedorGlobal.classList.add("flexVertical", "gap10")
        const informacionCuenta = document.createElement("div")
        informacionCuenta.classList.add("padding14")
        informacionCuenta.textContent = `Escriba el nombre de usuario de la nueva cuenta, este será el VitiniID de la nueva cuenta. Luego pulse en el botón crear cuenta y, tras crearse la cuenta, irá al panel de la cuenta creada donde podrá seguir con las modificaciones pertinentes. Una vez establezca la contraseña, deberá activar la cuenta.`
        contenedorGlobal.appendChild(informacionCuenta)
        const campoNuevoUsuario = document.createElement("input")
        campoNuevoUsuario.classList.add("botonV1BlancoIzquierda_campo")
        campoNuevoUsuario.setAttribute("campo", "usuarioIDX")
        campoNuevoUsuario.placeholder = "Escriba el nuevo VitiniID"
        contenedorGlobal.appendChild(campoNuevoUsuario)
        const infoPass = document.createElement("div")
        infoPass.classList.add("padding14")
        infoPass.textContent = `Escribe la contraseña de esta cuenta. Una vez creada la cuenta, siempre puedes cambiar la contraseña desde el panel del usuario. Es recomendable escribir una contraseña compleja creada con un generador de contraseñas para que sea irrecordable y usar un gestor de contraseñas para gestionar las contraseñas.  `
        contenedorGlobal.appendChild(infoPass)
        const campoClave = document.createElement("input")
        campoClave.classList.add("botonV1BlancoIzquierda_campo")
        campoClave.setAttribute("campo", "clave")
        campoClave.placeholder = "Escriba una contraseña para este nuevo usuario"
        campoClave.type = "password"
        contenedorGlobal.appendChild(campoClave)
        const informacionRol = document.createElement("div")
        informacionRol.classList.add("padding14")
        informacionRol.textContent = `Selecciona el rol de la nueva cuenta. Si es una cuenta para un cliente de Casa Vitini escoge el rol Cliente. Si es una cuenta para un Empleado de Casa Vitini escoge el rol Empleado y, si es para un administrador de Casa Vitini escoge el rol Administrador. Cada rol otorga un acceso y autoridad distintos. Por ejemplo, el rol Cliente solo permite administrar la propia cuenta, no da acceso al panel de control de administración. El rol empleado sí da acceso al panel de administración, pero hay ciertas operaciones que no puede hacer, como por ejemplo alterar precios, ofertas o configuraciones de alojamiento. Si puede realizar reservas, modificar reservas, cancelar reservas, pero no eliminarlas. El rol de Administrador puede hacer cualquier cosa.`
        contenedorGlobal.appendChild(informacionRol)
        const selectorRol = document.createElement("select")
        selectorRol.classList.add("botonV1BlancoIzquierda_campo")
        selectorRol.setAttribute("campo", "selectorRol")
        const opcionInical = document.createElement("option");
        opcionInical.value = "";
        opcionInical.selected = "true"
        opcionInical.disabled = "true"
        opcionInical.text = "Selecciona el rol de la nueva cuenta";
        selectorRol.add(opcionInical);
        const rolAdministrador = document.createElement("option");
        rolAdministrador.value = "administrador";
        rolAdministrador.text = "Administrador";
        selectorRol.add(rolAdministrador);
        const rolEmpleado = document.createElement("option");
        rolEmpleado.value = "empleado";
        rolEmpleado.text = "Empleado";
        selectorRol.add(rolEmpleado);
        const rolCliente = document.createElement("option");
        rolCliente.value = "cliente";
        rolCliente.text = "Cliente";
        selectorRol.add(rolCliente);
        contenedorGlobal.appendChild(selectorRol)
        espacioUsuario.appendChild(contenedorGlobal)
        const contenedorBotones = document.createElement("div")
        contenedorBotones.classList.add("flexVertical")
        const botonCrearUsuario = document.createElement("div")
        botonCrearUsuario.classList.add("botonV1BlancoIzquierda")
        botonCrearUsuario.textContent = "Crear nueva cuenta de usuario"
        botonCrearUsuario.addEventListener("click", this.transactor)
        contenedorBotones.appendChild(botonCrearUsuario)
        espacioUsuario.appendChild(contenedorBotones)
    },
    transactor: async () => {
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = "Creando usuarios..."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
        const nuevoUsuarioIDX = document.querySelector("[campo=usuarioIDX]").value
        const clave = document.querySelector("[campo=clave]").value
        const rol = document.querySelector("[campo=selectorRol]").value
        const metadatos = {
            zona: "administracion/usuarios/crearCuentaDesdeAdministracion",
            usuarioIDX: nuevoUsuarioIDX,
            clave: clave,
            rolIDV: rol
        }
        const respuestaServidor = await casaVitini.shell.servidor(metadatos)
        const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!instanciaRenderizada) { return }
        instanciaRenderizada.remove()
        if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const usuarioIDX = respuestaServidor?.usuarioIDX
            const navegacion = {
                "vista": "/administracion/usuarios/" + usuarioIDX,
                "tipoOrigen": "menuNavegador"
            }
            casaVitini.shell.navegacion.controladorVista(navegacion)
        }
    }
}