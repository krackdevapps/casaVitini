casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        const instanciaUID = main.getAttribute("instanciaUID")

        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const comandoInicial = granuladoURL.directorios[1]
        const numeroDirectorios = granuladoURL.directorios.length
        const parametroBuscar = granuladoURL.parametros.buscar
        const rawArray = granuladoURL.rawArray

        if (rawArray.length === 2) {
            this.portada.buscadorUI()
        } else if (parametroBuscar?.length > 0) {

            main.setAttribute("zonaCSS", "administracion/usuarios/buscador")
            this.portada.buscadorUI()
            if (!granuladoURL.parametros.buscar) {
                return
            }
            const campoBuscador = document.querySelector("[componente=zonaNavegacionPaginadaUsuarios]")
            campoBuscador.value = decodeURI(parametroBuscar)

            const parametrosFormatoURL = granuladoURL.parametros
            const parametrosFormatoIDV = {}
            Object.entries(parametrosFormatoURL).forEach(([nombreParametroURL, valorParametroURL]) => {
                const nombreParametroIDV = casaVitini.utilidades.cadenas.snakeToCamel(nombreParametroURL)
                let nombreColumnaIDV
                if ((valorParametroURL)?.toLowerCase() === "rol_idv") {
                    nombreColumnaIDV = "rolIDV"
                } else if (valorParametroURL) {
                    nombreColumnaIDV = casaVitini.utilidades.cadenas.snakeToCamel(valorParametroURL)
                } else if ((nombreParametroIDV)?.toLowerCase() === "buscar") {
                    valorParametroURL = decodeURI(valorParametroURL)
                }
                parametrosFormatoIDV[nombreParametroIDV] = nombreColumnaIDV
            })
            parametrosFormatoIDV.buscar = decodeURI(parametrosFormatoIDV.buscar)

            this.portada.mostrarUsuariosResueltos(parametrosFormatoIDV)
        } else if (rawArray.length > 2) {
            this.detallesUsuario.arranque()
        }
    },
    portada: {
        buscadorUI: function () {
            const main = document.querySelector("main")
            main.setAttribute("zonaCSS", "administracion/usuarios/buscador")
            const espacioClientes = document.querySelector("[componente=espacioUsuarios]")
            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add("usuarios_contenedorBotones")
            const botonCrearCuenta = document.createElement("a")
            botonCrearCuenta.classList.add("botonV1")
            botonCrearCuenta.setAttribute("href", "/administracion/usuarios/nuevo")
            botonCrearCuenta.setAttribute("vista", "/administracion/usuarios/nuevo")
            botonCrearCuenta.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            botonCrearCuenta.textContent = "Crear cuenta de usuario"
            contenedorBotones.appendChild(botonCrearCuenta)
            espacioClientes.appendChild(contenedorBotones)
            const campoBuscador = document.createElement("input")
            campoBuscador.classList.add("botonV1BlancoIzquierda_campo")
            campoBuscador.setAttribute("componente", "zonaNavegacionPaginadaUsuarios")
            campoBuscador.setAttribute("componenteCampo", "buscadorUsuarios")
            campoBuscador.setAttribute("placeholder", "Busque un usuario por nombre de usuario, por nombre, por pasaporte, por correo o por teléfono. También puedes hacer búsquedas combinadas.")
            campoBuscador.addEventListener("input", (e) => {
                this.buscadorUsuariosPorCampo(e)
            })
            espacioClientes.appendChild(campoBuscador)

        },
        buscadorUsuariosPorCampo: async function (cliente) {
            const instanciaUID = document.querySelector("main[instanciaUID]").getAttribute("instanciaUID")
            const campo = document.querySelector("[componente=zonaNavegacionPaginadaUsuarios]")

            const gridUsuarios = document.querySelector("[areagrid=gridUsuarios]")
            gridUsuarios?.remove()

            const terminoBusqueda = cliente.target.value
            document.querySelector("[gridUID=gridUsuarios]")?.remove()
            document.querySelector("[componenteID=navegacionPaginacion]")?.remove()
            document.querySelector("[contenedor=filtrosOrden]")?.remove()

            const estadoBusqueda_r = document.querySelector("[componente=estadoBusqueda]")
            if (!estadoBusqueda_r) {
                this.constructorMarcoInfo()
            }
            const estadoBusqueda_s = document.querySelector("[componente=estadoBusqueda]")
            estadoBusqueda_s.textContent = "Buscando usuarios..."

            const campoVacio = cliente.target.value.length
            if (campoVacio === 0) {
                clearTimeout(casaVitini.componentes.temporizador);
                document.querySelector("[componente=estadoBusqueda]")?.remove()
                document.querySelector("[componenteID=gridUsuarios]")?.remove()
                document.querySelector("[componenteID=navegacionPaginacion]")?.remove()
                const vistaActual = document.getElementById("uiNavegacion").getAttribute("vistaActual")
                const resetUrl = "/administracion/usuarios"
                const titulo = "casavitini"
                const estado = {
                    zona: vistaActual,
                    estadoInternoZona: "estado",
                    tipoCambio: "total"
                }
                window.history.replaceState(estado, titulo, resetUrl);
                return;
            }
            clearTimeout(casaVitini.componentes.temporizador);
            casaVitini.componentes.temporizador = setTimeout(async () => {
                const transaccion = {
                    zona: "administracion/usuarios/buscarUsuarios",
                    tipoBusqueda: "rapido",
                    pagina: 1,
                    buscar: terminoBusqueda,
                    origen: "botonMostrarUsuarios",
                    tipoConstruccionGrid: "total",
                    instanciaUID: instanciaUID
                }
                this.mostrarUsuariosResueltos(transaccion)
            }, 1500);
        },
        mostrarUsuariosResueltos: async function (transaccion) {
            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const selectorEspacio = document.querySelector("[componente=espacioComportamiento]")
            if (!selectorEspacio) {
                return
            }
            selectorEspacio.setAttribute("instanciaBusqueda", instanciaUID)
            delete transaccion.instanciaUID
            const origen = transaccion.origen
            delete transaccion.origen
            const granuladoURL = casaVitini.utilidades.granuladorURL()

            const paginaTipo = transaccion.paginaTipo
            delete transaccion.paginaTipo

            const selectorAlmacen = document.querySelector("[areaGrid=gridUsuarios]")?.getAttribute("almacen") || "{}"
            const almacen = JSON.parse(selectorAlmacen)
            const busquedaInicial = transaccion.buscar || almacen?.buscar

            let nombreColumnaURL
            const nombreColumna = transaccion.nombreColumna

            if ((nombreColumna)?.toLowerCase() === "rolidv") {
                nombreColumnaURL = "rol_idv"
            } else if (nombreColumna) {
                nombreColumnaURL = casaVitini.utilidades.cadenas.camelToSnake(nombreColumna)
            }

            const resolverUsuarios = await casaVitini.shell.servidor({
                zona: "administracion/usuarios/buscarUsuarios",
                tipoBusqueda: "rapido",
                buscar: busquedaInicial,
                nombreColumna: transaccion.nombreColumna,
                sentidoColumna: transaccion.sentidoColumna,
                pagina: Number(transaccion?.pagina || 1)

            })
            const instanciaRenderizada = document.querySelector(`[instanciaBusqueda="${instanciaUID}"]`)
            if (!instanciaRenderizada) {
                return
            }

            if (resolverUsuarios?.error) {
                this.constructorMarcoInfo()
                document.querySelector("[componente=estadoBusqueda]").textContent = resolverUsuarios?.error
                return
            }

            if (resolverUsuarios.totalUsuarios === 0) {
                this.constructorMarcoInfo()
                document.querySelector("[componente=estadoBusqueda]").textContent = "No se han encontrado usuarios"
                return
            }
            document.querySelector("[componente=estadoBusqueda]")?.remove()
            const usuarios = resolverUsuarios.usuarios
            const buscar = resolverUsuarios.buscar
            const paginasTotales = resolverUsuarios.paginasTotales
            const pagina = resolverUsuarios.pagina
            const sentidoColumna = resolverUsuarios.sentidoColumna
            const columnasGrid = [
                {
                    columnaUI: "Usuario",
                    columnaIDV: "usuario",
                },
                {
                    columnaUI: "Rol",
                    columnaIDV: "rolIDV",
                },
                {
                    columnaUI: "Correo",
                    columnaIDV: "mail",
                },
                {
                    columnaUI: "Nombre",
                    columnaIDV: "nombre",
                },
                {
                    columnaUI: "Primer apellido",
                    columnaIDV: "primerApellido",
                },
                {
                    columnaUI: "Segundo Apellido",
                    columnaIDV: "segundoApellido",
                },
                {
                    columnaUI: "Pasaporte",
                    columnaIDV: "pasaporte",
                },
                {
                    columnaUI: "Teléfono",
                    columnaIDV: "telefono",
                },
            ]
            const parametrosFinales = {
                buscar: buscar
            }

            if (nombreColumna) {
                parametrosFinales.nombre_columna = nombreColumnaURL
                parametrosFinales.sentido_columna = sentidoColumna
            }
            if (pagina > 1 && paginasTotales > 1) {
                parametrosFinales.pagina = pagina
            }
            const estructuraParametrosFinales = []
            for (const [parametroFinal, valorFinal] of Object.entries(parametrosFinales)) {
                const estructura = `${parametroFinal}:${valorFinal}`
                estructuraParametrosFinales.push(estructura)
            }
            let parametrosURLFInal = ""
            if (estructuraParametrosFinales.length > 0) {
                parametrosURLFInal = "/" + estructuraParametrosFinales.join("/")
            }

            const constructorURLFinal = encodeURI(granuladoURL.directoriosFusion + parametrosURLFInal)

            casaVitini.ui.componentes.componentesComplejos.grid.despliegue({
                metodoSalida: "view.portada.mostrarUsuariosResueltos",
                configuracionGrid: {
                    filas: usuarios,
                    almacen: {
                        buscar: buscar,
                    },
                    sentidoColumna: sentidoColumna,
                    nombreColumna: nombreColumna,
                    pagina: pagina,
                    destino: "[componente=espacioUsuarios]",
                    columnasGrid: columnasGrid,
                    gridUID: "gridUsuarios",
                    mascaraURL: {
                        mascara: "/administracion/usuarios/",
                        parametro: "usuario"
                    },
                },
                configuracionPaginador: {
                    paginasTotales: paginasTotales,
                    granuladoURL: {
                        parametros: parametrosFinales,
                        directoriosFusion: granuladoURL.directoriosFusion
                    },
                }
            })

            const titulo = "ADminstar reservas"
            const estado = {
                zona: constructorURLFinal,
                EstadoInternoZona: "estado",
                tipoCambio: "parcial",
                componenteExistente: "zonaNavegacionPaginadaUsuarios",
                funcionPersonalizada: "view.portada.mostrarUsuariosResueltos",
                args: transaccion
            }
            if (origen === "url" || origen === "botonMostrarUsuarios") {
                window.history.replaceState(estado, titulo, constructorURLFinal);
            }
            if ((origen === "botonNumeroPagina" && paginaTipo === "otra") || origen === "tituloColumna") {
                window.history.pushState(estado, titulo, constructorURLFinal);
            }
            if (origen === "botonNumeroPagina" && paginaTipo === "actual") {
                window.history.replaceState(estado, titulo, constructorURLFinal);
            }
        },
        constructorMarcoInfo: function () {
            const campo = document.querySelector("[componente=zonaNavegacionPaginadaUsuarios]")

            const estadoBusquedaUI = document.createElement("div")
            estadoBusquedaUI.classList.add("botonV1BlancoIzquierda_noSeleccionable")
            estadoBusquedaUI.setAttribute("componente", "estadoBusqueda")
            estadoBusquedaUI.textContent = "Buscando usuarios..."

            const comRenderizado = document.querySelector("[componente=estadoBusqueda]")
            if (!comRenderizado) {
                campo.parentNode.insertBefore(estadoBusquedaUI, campo.nextSibling);
            }
        }
    },
    detallesUsuario: {
        arranque: function () {
            const main = document.querySelector("main")
            main.setAttribute("zonaCSS", "administracion/usuarios/detallesDelUsuario")
            const granuladoURL = casaVitini.utilidades.granuladorURL()
            const comandoInicial = granuladoURL.directorios[granuladoURL.directorios.length - 1]
            if (comandoInicial === "datos_personales") {
                const usuarioUID = granuladoURL.directorios[granuladoURL.directorios.length - 2]
                this.datosUsuario.UI(usuarioUID)
            } else if (comandoInicial === "modificar_idx") {
                const usuarioUID = granuladoURL.directorios[granuladoURL.directorios.length - 2]
                this.modificarIDX.UI(usuarioUID)
            } else if (comandoInicial === "cambiar_clave") {
                const usuarioUID = granuladoURL.directorios[granuladoURL.directorios.length - 2]
                this.cambiarClave.UI(usuarioUID)
            } else if (comandoInicial === "rol") {
                const usuarioUID = granuladoURL.directorios[granuladoURL.directorios.length - 2]
                this.rol.UI(usuarioUID)
            } else {
                this.portada.UI(comandoInicial)
            }

        },
        portada: {
            UI: async function (usuarioIDX) {
                const espacioUsuario = document.querySelector("[componente=espacioUsuarios]")
                const transaccion = {
                    zona: "administracion/usuarios/datosCuentaIDX",
                    usuarioIDX: usuarioIDX
                }
                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                if (respuestaServidor?.error) {

                    casaVitini.ui.componentes.mensajeSimple({
                        titulo: "Alerta",
                        descripcion: respuestaServidor?.error
                    })
                }
                if (respuestaServidor?.ok) {
                    const detallesUsuario = respuestaServidor?.ok
                    const usuarioIDX = detallesUsuario.usuario
                    const rol = detallesUsuario.rol
                    const estadoCuenta = detallesUsuario.estadoCuenta
                    const contenedorDetallesUsuario = document.createElement("div")
                    contenedorDetallesUsuario.classList.add("detallesUsuario_contenedorGlobal")
                    contenedorDetallesUsuario.setAttribute("componente", "contenedorGlobal")
                    const datosBanner = {
                        usuarioIDX: usuarioIDX,
                        rol: rol
                    }
                    const contenedorUsuarioIDX = casaVitini.view.detallesUsuario.componentes.bannerIDX(datosBanner)
                    contenedorDetallesUsuario.appendChild(contenedorUsuarioIDX)
                    espacioUsuario.appendChild(contenedorDetallesUsuario)
                    let estadoCuentaUI
                    if (estadoCuenta === "activado") {
                        estadoCuentaUI = "Desactivar cuenta"
                    }
                    if (estadoCuenta === "desactivado") {
                        estadoCuentaUI = "Activar cuenta"
                    }
                    const contenedorOpciones = document.createElement("div")
                    contenedorOpciones.classList.add("detallesUsuario_contenedorOpciones")
                    const opcionInformacion = document.createElement("a")
                    opcionInformacion.classList.add("detallesUsuario_opcionInformacion")
                    opcionInformacion.textContent = "Sus datos personales"
                    opcionInformacion.setAttribute("href", `/administracion/usuarios/${usuarioIDX}/datos_personales`)
                    opcionInformacion.setAttribute("vista", `/administracion/usuarios/${usuarioIDX}/datos_personales`)
                    opcionInformacion.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                    contenedorOpciones.appendChild(opcionInformacion)
                    const opcionCambiarIDX = document.createElement("a")
                    opcionCambiarIDX.classList.add("detallesUsuario_opcionInformacion")
                    opcionCambiarIDX.setAttribute("href", `/administracion/usuarios/${usuarioIDX}/modificar_idx`)
                    opcionCambiarIDX.setAttribute("vista", `/administracion/usuarios/${usuarioIDX}/modificar_idx`)
                    opcionCambiarIDX.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                    opcionCambiarIDX.textContent = "Modificar su VitiniID"
                    contenedorOpciones.appendChild(opcionCambiarIDX)
                    const opcionCambiarRol = document.createElement("a")
                    opcionCambiarRol.classList.add("detallesUsuario_opcionInformacion")
                    opcionCambiarRol.setAttribute("href", `/administracion/usuarios/${usuarioIDX}/rol`)
                    opcionCambiarRol.setAttribute("vista", `/administracion/usuarios/${usuarioIDX}/rol`)
                    opcionCambiarRol.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                    opcionCambiarRol.textContent = "Cambiar su rol"
                    contenedorOpciones.appendChild(opcionCambiarRol)
                    const opcionClave = document.createElement("a")
                    opcionClave.classList.add("detallesUsuario_opcionInformacion")
                    opcionClave.setAttribute("href", `/administracion/usuarios/${usuarioIDX}/cambiar_clave`)
                    opcionClave.setAttribute("vista", `/administracion/usuarios/${usuarioIDX}/cambiar_clave`)
                    opcionClave.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                    opcionClave.textContent = "Cambiar su contrasena"
                    contenedorOpciones.appendChild(opcionClave)
                    const opcionCambiarEstado = document.createElement("a")
                    opcionCambiarEstado.classList.add("detallesUsuario_opcionInformacion")
                    opcionCambiarEstado.setAttribute("estadoCuenta", estadoCuenta)
                    opcionCambiarEstado.addEventListener("click", () => { this.cambiarEstadoCuenta.UI() })
                    opcionCambiarEstado.textContent = estadoCuentaUI
                    contenedorOpciones.appendChild(opcionCambiarEstado)
                    const opcionEliminarCuenta = document.createElement("a")
                    opcionEliminarCuenta.classList.add("detallesUsuario_opcionInformacion")
                    opcionEliminarCuenta.addEventListener("click", () => { this.eliminarCuenta.UI() })
                    opcionEliminarCuenta.textContent = "Eliminar su cuenta"
                    contenedorOpciones.appendChild(opcionEliminarCuenta)
                    espacioUsuario.appendChild(contenedorOpciones)
                }
            },
        },
        datosUsuario: {
            UI: async function (usuarioIDX) {
                const espacioUsuario = document.querySelector("[componente=espacioUsuarios]")
                const transaccion = {
                    zona: "/administracion/usuarios/detallesUsuario",
                    usuarioIDX: usuarioIDX
                }
                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                if (respuestaServidor?.error) {
                    casaVitini.ui.componentes.mensajeSimple({
                        titulo: "Alerta",
                        descripcion: respuestaServidor?.error
                    })
                }
                if (respuestaServidor?.ok) {
                    const detallesUsuario = respuestaServidor?.ok
                    const usuarioIDX = detallesUsuario.usuarioIDX
                    const rol = detallesUsuario.rol
                    const datosUsuario = detallesUsuario.datosUsuario
                    const nombre = datosUsuario.nombre || ""
                    const primerApellido = datosUsuario.primerApellido || ""
                    const segundoApellido = datosUsuario.segundoApellido || ""
                    const pasaporte = datosUsuario.pasaporte || ""
                    const telefono = datosUsuario.telefono || ""
                    const mail = datosUsuario.mail || ""
                    const contenedorDetallesUsuario = document.createElement("div")
                    contenedorDetallesUsuario.classList.add("detallesUsuario_contenedorGlobal")
                    contenedorDetallesUsuario.setAttribute("componente", "contenedorGlobal")
                    const datosBanner = {
                        usuarioIDX: usuarioIDX,
                        rol: rol
                    }
                    const contenedorUsuarioIDX = this.componentes.bannerIDX(datosBanner)
                    contenedorDetallesUsuario.appendChild(contenedorUsuarioIDX)
                    espacioUsuario.appendChild(contenedorDetallesUsuario)
                    const contenedorDatosUsuario = document.createElement("div")
                    contenedorDatosUsuario.classList.add("detallesUsuario_contenedorDatosUsuario")
                    const nombreUI = document.createElement("a")
                    nombreUI.classList.add("detallesUsuario_contenedorCampoEInfo")
                    let titulo = document.createElement("p")
                    titulo.classList.add("tituloDato")
                    titulo.textContent = "Nombre"
                    nombreUI.appendChild(titulo)
                    const campoNombre = document.createElement("input")
                    campoNombre.classList.add("botonV1BlancoIzquierda_campo")
                    campoNombre.setAttribute("campo", "nombre")
                    campoNombre.value = nombre
                    nombreUI.appendChild(campoNombre)
                    contenedorDatosUsuario.appendChild(nombreUI)
                    const primerApellidoUI = document.createElement("a")
                    primerApellidoUI.classList.add("detallesUsuario_contenedorCampoEInfo")
                    titulo = document.createElement("p")
                    titulo.classList.add("tituloDato")
                    titulo.textContent = "Primero apellido"
                    primerApellidoUI.appendChild(titulo)
                    const campoPrimerApellido = document.createElement("input")
                    campoPrimerApellido.classList.add("botonV1BlancoIzquierda_campo")
                    campoPrimerApellido.setAttribute("campo", "primerApellido")
                    campoPrimerApellido.value = primerApellido
                    primerApellidoUI.appendChild(campoPrimerApellido)
                    contenedorDatosUsuario.appendChild(primerApellidoUI)
                    const segundoApellidoUI = document.createElement("a")
                    segundoApellidoUI.classList.add("detallesUsuario_contenedorCampoEInfo")
                    titulo = document.createElement("p")
                    titulo.classList.add("tituloDato")
                    titulo.textContent = "Segundo apellido"
                    segundoApellidoUI.appendChild(titulo)
                    const campoSegundoApellido = document.createElement("input")
                    campoSegundoApellido.classList.add("botonV1BlancoIzquierda_campo")
                    campoSegundoApellido.setAttribute("campo", "segundoApellido")
                    campoSegundoApellido.value = segundoApellido
                    segundoApellidoUI.appendChild(campoSegundoApellido)
                    contenedorDatosUsuario.appendChild(segundoApellidoUI)
                    const pasaporteUI = document.createElement("a")
                    pasaporteUI.classList.add("detallesUsuario_contenedorCampoEInfo")
                    titulo = document.createElement("p")
                    titulo.classList.add("tituloDato")
                    titulo.textContent = "Pasaporte"
                    pasaporteUI.appendChild(titulo)
                    const campoPasaporte = document.createElement("input")
                    campoPasaporte.classList.add("botonV1BlancoIzquierda_campo")
                    campoPasaporte.setAttribute("campo", "pasaporte")
                    campoPasaporte.value = pasaporte
                    pasaporteUI.appendChild(campoPasaporte)
                    contenedorDatosUsuario.appendChild(pasaporteUI)
                    const telefonoUI = document.createElement("a")
                    telefonoUI.classList.add("detallesUsuario_contenedorCampoEInfo")
                    titulo = document.createElement("p")
                    titulo.classList.add("tituloDato")
                    titulo.textContent = "Teléfono"
                    telefonoUI.appendChild(titulo)
                    const campoTelefono = document.createElement("input")
                    campoTelefono.classList.add("botonV1BlancoIzquierda_campo")
                    campoTelefono.setAttribute("campo", "telefono")
                    campoTelefono.value = telefono
                    telefonoUI.appendChild(campoTelefono)
                    contenedorDatosUsuario.appendChild(telefonoUI)
                    const mailUI = document.createElement("a")
                    mailUI.classList.add("detallesUsuario_contenedorCampoEInfo")
                    titulo = document.createElement("p")
                    titulo.classList.add("tituloDato")
                    titulo.textContent = "Correo electroníco"
                    mailUI.appendChild(titulo)
                    const campomail = document.createElement("input")
                    campomail.classList.add("botonV1BlancoIzquierda_campo")
                    campomail.setAttribute("campo", "mail")
                    campomail.value = mail
                    mailUI.appendChild(campomail)
                    contenedorDatosUsuario.appendChild(mailUI)
                    espacioUsuario.appendChild(contenedorDatosUsuario)
                    const contenedorBotones = document.createElement("div")
                    contenedorBotones.classList.add("detallesUsuario_contenedorBotones")
                    contenedorBotones.setAttribute("componente", "contenedorBotones")
                    const botonGuardarCambios = document.createElement("div")
                    botonGuardarCambios.classList.add("detallesUsuario_botonV1")
                    botonGuardarCambios.addEventListener("click", () => { this.guardarCambios() })
                    botonGuardarCambios.textContent = "Guardar cambios"
                    contenedorBotones.appendChild(botonGuardarCambios)
                    const botonCancelarCambios = document.createElement("div")
                    botonCancelarCambios.classList.add("detallesUsuario_botonV1")
                    botonCancelarCambios.textContent = "Cancelar cambios"
                    botonCancelarCambios.addEventListener("click", () => { this.cancelarCambios() })
                    contenedorBotones.appendChild(botonCancelarCambios)
                    espacioUsuario.appendChild(contenedorBotones)
                    const campos = document.querySelectorAll("[campo]")
                    const controladorCampos = () => {
                        let estadoGlobalCampos = "vacios"
                        campos.forEach((campo) => {
                            if (campo.value.length > 0) {
                                estadoGlobalCampos = "noVacios"
                            }
                        })
                        const selectorContenedorBotones = document.querySelector("[componente=contenedorBotones]")
                        if (estadoGlobalCampos === "vacios") {
                            selectorContenedorBotones.removeAttribute("style")
                        }
                        if (estadoGlobalCampos === "noVacios") {
                            selectorContenedorBotones.style.display = "flex"
                        }
                    }
                    campos.forEach((campo) => {
                        campo.addEventListener("input", controladorCampos)
                    })
                }
            },
            editar: function () {
                let camposLectura = document.querySelectorAll("[componenteDetalle]")
                camposLectura.forEach((campo) => {
                    let datoCampo = campo.textContent
                    let idCampo = campo.getAttribute("componenteDetalle")
                    campo.style.display = "none"
                    let tipoElemento
                    if (idCampo === "notas") {
                        tipoElemento = "textarea"
                    } else {
                        tipoElemento = "input"
                    }
                    let campoEditable = document.createElement(tipoElemento)
                    campoEditable.classList.add("detallesClienteCampoEditable")
                    campoEditable.value = datoCampo
                    campoEditable.setAttribute("componenteEditable", idCampo)
                    let selectorContenedor = campo.parentNode
                    selectorContenedor.appendChild(campoEditable)
                })
                document.querySelector("[boton=editar]").classList.add("estadoInicialInvisible")
                document.querySelector("[boton=dejarDeEditar]").classList.remove("estadoInicialInvisible")
                document.querySelector("[boton=guardarCambios]").classList.remove("estadoInicialInvisible")
            },
            cancelarCambios: function () {
                const campos = document.querySelectorAll("[campo]")
                campos.forEach((campo) => {
                    campo.value = null
                })
                const selectorContenedorBotones = document.querySelector("[componente=contenedorBotones]")
                selectorContenedorBotones.removeAttribute("style")
            },
            guardarCambios: async function () {
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = "Actualizando datos del usuario..."
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const campos = document.querySelectorAll("[campo]")
                const usuarioIDX = document.querySelector("[usuarioIDX]").getAttribute("usuarioIDX")
                const datosParaActualizar = {
                    zona: "administracion/usuarios/actualizarDatosUsuarioDesdeAdministracion",
                    usuarioIDX: usuarioIDX
                }
                campos.forEach((campo) => {
                    const campoID = campo.getAttribute("campo")
                    const campoDato = campo.value
                    datosParaActualizar[campoID] = campoDato
                })

                const respuestaServidor = await casaVitini.shell.servidor(datosParaActualizar)
                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }
                instanciaRenderizada.remove()
                if (respuestaServidor?.error) {
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
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
                    })
                    const selectorContenedorBotones = document.querySelector("[componente=contenedorBotones]")
                    selectorContenedorBotones.removeAttribute("style")
                }
            }
        },
        rol: {
            UI: async function (usuarioIDX) {
                let rol
                const espacioUsuario = document.querySelector("[componente=espacioUsuarios]")
                const transaccion = {
                    zona: "administracion/usuarios/detallesUsuario",
                    usuarioIDX: usuarioIDX
                }
                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                if (respuestaServidor?.error) {
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    rol = respuestaServidor?.ok.rol
                    const usuariosIDX = respuestaServidor?.ok.usuarioIDX
                    const datosBanner = {
                        usuarioIDX: usuarioIDX,
                        rol: rol
                    }
                    const contenedorDetallesUsuario = document.createElement("div")
                    contenedorDetallesUsuario.classList.add("detallesUsuario_contenedorGlobal")
                    contenedorDetallesUsuario.setAttribute("componente", "contenedorGlobal")
                    const contenedorUsuarioIDX = casaVitini.view.detallesUsuario.componentes.bannerIDX(datosBanner)
                    contenedorDetallesUsuario.appendChild(contenedorUsuarioIDX)
                    espacioUsuario.appendChild(contenedorDetallesUsuario)
                }
                const contenedorCampos = document.createElement("div")
                contenedorCampos.classList.add("detallesUsuario_contenedorCampos")
                const infoModificarIDX = document.createElement("div")
                infoModificarIDX.classList.add("detallesUsuario_infoModificarIDX")
                infoModificarIDX.textContent = `Cambia el rol de esta cuenta al rol que quieras. Recuerda que el rol determina el grado de acceso y autoridad dentro del sistema. El rol cliente es el rol que tiene que tener la cuentas de los clientes de casa vitini. Este rolo solo permite acceder a sus datos de usuario. Controlar solo su cuenta y ver sus reservas. El rol empleado permite acceder al panel de administración, pero solo para gestionar reservas y clientes y nada más. No puede, por ejemplo, modificar precios. El rol administrador es el rol de más autoridad y puede hacer cualquier cosa y tener acceso a todo.`
                contenedorCampos.appendChild(infoModificarIDX)
                const selectorRoles = document.createElement("select");
                selectorRoles.classList.add("otonV1BlancoIzquierda_campo")
                selectorRoles.setAttribute("selector", "roles")
                selectorRoles.addEventListener("change", () => { this.guardarCambios() })
                const roles = [
                    {
                        rolUI: "Administrador",
                        rol: "administrador"

                    },
                    {
                        rolUI: "Empleado",
                        rol: "empleado"

                    },
                    {
                        rolUI: "Cliente",
                        rol: "cliente"

                    },
                ]

                for (const detallesRol of roles) {
                    const rolUI = detallesRol.rolUI
                    const rolIDX = detallesRol.rol
                    const opcionRol = document.createElement("option");
                    opcionRol.value = rolIDX;
                    opcionRol.text = rolUI;
                    if (rol === rolIDX) {
                        opcionRol.selected = true;
                    }
                    selectorRoles.appendChild(opcionRol);
                }
                contenedorCampos.appendChild(selectorRoles);
                espacioUsuario.appendChild(contenedorCampos)
                const contenedorBotones = document.createElement("div")
                contenedorBotones.classList.add("detallesUsuario_contenedorBotones")
                contenedorBotones.setAttribute("componente", "contenedorBotones")
                const botonGuardarCambios = document.createElement("div")
                botonGuardarCambios.classList.add("detallesUsuario_botonV1")
                botonGuardarCambios.addEventListener("click", () => { this.guardarCambios() })
                botonGuardarCambios.textContent = "Cambiar rol de la cuenta"
                contenedorBotones.appendChild(botonGuardarCambios)
                espacioUsuario.appendChild(contenedorBotones)

            },
            guardarCambios: async function () {
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = "Actualizando rol del VitiniIDX..."
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const usuarioIDX = document.querySelector("[usuarioIDX]").getAttribute("usuarioIDX")
                const selectorRol = document.querySelector("[selector=roles]").value
                const datosParaActualizar = {
                    zona: "administracion/usuarios/actualizarRolCuenta",
                    usuarioIDX: usuarioIDX,
                    nuevoRol: selectorRol
                }
                const respuestaServidor = await casaVitini.shell.servidor(datosParaActualizar)
                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }
                instanciaRenderizada.remove()
                if (respuestaServidor?.error) {
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    const rolIDV = respuestaServidor?.rolIDV
                    const rolUI = respuestaServidor?.rolUI
                    document.querySelector("[componente=rolUI]").textContent = rolUI
                    document.querySelector("[selector=roles]").value = rolIDV
                }
            },
            cancelarCambios: function () {
                const campos = document.querySelectorAll("[campo]")
                campos.forEach((campo) => {
                    campo.value = null
                })
                const selectorContenedorBotones = document.querySelector("[componente=contenedorBotones]")
                selectorContenedorBotones.removeAttribute("style")
            },
        },
        cambiarEstadoCuenta: {
            UI: async function () {
                const estadoCuentaActual = document.querySelector("[estadoCuenta]").getAttribute("estadoCuenta")
                let tituloBoton
                let valorBoton
                let textoDescriptivo
                let tituloInformativo
                if (estadoCuentaActual === "activado") {
                    tituloBoton = "Desactivar cuenta"
                    tituloInformativo = "Confirma la desactivacion de la cuenta"
                    textoDescriptivo = "¿Quieres Desactivar esta cuenta? El usuario de esta cuenta podra volver a logearse con ella. Sus implicaciones son inmediatas"
                    valorBoton = "desactivado"
                }
                if (estadoCuentaActual === "desactivado") {
                    tituloBoton = "Activar cuenta"
                    tituloInformativo = "Confirma la activacion de la cuenta"
                    textoDescriptivo = "¿Quieres Aactivar esta cuenta? El usuario de esta cuenta no podra volver a logearse con ella. Sus implicaciones son inmediatas"
                    valorBoton = "activado"
                }
                const advertenciaInmersivaIU = document.createElement("div")
                advertenciaInmersivaIU.setAttribute("class", "advertenciaInmersiva")
                advertenciaInmersivaIU.setAttribute("componente", "advertenciaInmersiva")
                const contenedorAdvertenciaInmersiva = document.createElement("div")
                contenedorAdvertenciaInmersiva.classList.add("contenedorAdvertencaiInmersiva")
                const tituloCancelarReserva = document.createElement("p")
                tituloCancelarReserva.classList.add("detallesReservaTituloCancelarReserva")
                tituloCancelarReserva.textContent = tituloInformativo
                contenedorAdvertenciaInmersiva.appendChild(tituloCancelarReserva)
                const bloqueBloqueoApartamentos = document.createElement("div")
                bloqueBloqueoApartamentos.classList.add("detallesReservaCancelarReservaBloqueBloqueoApartamentos")
                const tituloBloquoApartamentos = document.createElement("div")
                tituloBloquoApartamentos.classList.add("detallesReservaCancelarReservaTituloBloquoApartamentos")
                tituloBloquoApartamentos.textContent = textoDescriptivo
                bloqueBloqueoApartamentos.appendChild(tituloBloquoApartamentos)
                contenedorAdvertenciaInmersiva.appendChild(bloqueBloqueoApartamentos)
                const bloqueBotones = document.createElement("div")
                bloqueBotones.classList.add("detallesReservaCancelarReservabloqueBotones")
                const botonCancelar = document.createElement("div")
                botonCancelar.classList.add("detallesReservaCancelarBoton")
                botonCancelar.setAttribute("componente", "botonConfirmarCancelarReserva")
                botonCancelar.textContent = tituloBoton
                botonCancelar.setAttribute("nuevoEstado", valorBoton)
                botonCancelar.addEventListener("click", (e) => { this.transactor(e) })
                bloqueBotones.appendChild(botonCancelar)
                const botonCancelarProcesoCancelacion = document.createElement("div")
                botonCancelarProcesoCancelacion.classList.add("detallesReservaCancelarBoton")
                botonCancelarProcesoCancelacion.textContent = "Cancelar el cambio de estado"
                botonCancelarProcesoCancelacion.addEventListener("click", () => {
                    let selectorAdvertenciaInmersiva = document.querySelectorAll("[componente=advertenciaInmersiva]")
                    selectorAdvertenciaInmersiva.forEach((advertenciaInmersiva) => {
                        advertenciaInmersiva.remove()
                    })
                })
                bloqueBotones.appendChild(botonCancelarProcesoCancelacion)
                contenedorAdvertenciaInmersiva.appendChild(bloqueBotones)
                advertenciaInmersivaIU.appendChild(contenedorAdvertenciaInmersiva)
                document.querySelector("main").appendChild(advertenciaInmersivaIU)
            },
            transactor: async function (nuevoEstado) {
                const nuevoEstado_ = nuevoEstado.target.getAttribute("nuevoEstado")
                const usuarioIDX = document.querySelector("[usuarioIDX]").getAttribute("usuarioIDX")
                const transaccion = {
                    zona: "administracion/usuarios/actualizarEstadoCuentaDesdeAdministracion",
                    "usuarioIDX": usuarioIDX,
                    "nuevoEstado": nuevoEstado_
                }
                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                if (respuestaServidor?.error) {
                    const selectorAdvertenciaInmersiva = document.querySelectorAll("[componente=advertenciaInmersiva]")
                    selectorAdvertenciaInmersiva.forEach((advertenciaInmersiva) => {
                        advertenciaInmersiva.remove()
                    })
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    const estadoActual = respuestaServidor?.estadoCuenta
                    let estadoCuentaUI
                    if (estadoActual === "activado") {
                        estadoCuentaUI = "Desactivar cuenta"
                    }
                    if (estadoActual === "desactivado") {
                        estadoCuentaUI = "Activar cuenta"
                    }
                    const selectorEstadoCuentaUI = document.querySelector("[estadoCuenta]")
                    selectorEstadoCuentaUI.textContent = estadoCuentaUI
                    selectorEstadoCuentaUI.setAttribute("estadoCuenta", estadoActual)
                    const selectorAdvertenciaInmersiva = document.querySelectorAll("[componente=advertenciaInmersiva]")
                    selectorAdvertenciaInmersiva.forEach((advertenciaInmersiva) => {
                        advertenciaInmersiva.remove()
                    })
                }
            }
        },
        cambiarClave: {
            UI: async function (usuarioIDX) {
                const espacioUsuario = document.querySelector("[componente=espacioUsuarios]")
                const transaccion = {
                    zona: "administracion/usuarios/detallesUsuario",
                    usuarioIDX: usuarioIDX
                }
                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                if (respuestaServidor?.error) {
                    casaVitini.ui.componentes.mensajeSimple({
                        titulo: "Alerta",
                        descripcion: respuestaServidor?.error
                    })
                }
                if (respuestaServidor?.ok) {
                    const rol = respuestaServidor?.ok.rol
                    const usuariosIDX = respuestaServidor?.ok.usuarioIDX
                    const datosBanner = {
                        usuarioIDX: usuarioIDX,
                        rol: rol
                    }
                    const contenedorDetallesUsuario = document.createElement("div")
                    contenedorDetallesUsuario.classList.add("detallesUsuario_contenedorGlobal")
                    contenedorDetallesUsuario.setAttribute("componente", "contenedorGlobal")
                    const contenedorUsuarioIDX = casaVitini.view.detallesUsuario.componentes.bannerIDX(datosBanner)
                    contenedorDetallesUsuario.appendChild(contenedorUsuarioIDX)
                    espacioUsuario.appendChild(contenedorDetallesUsuario)
                    const contenedorCampos = document.createElement("div")
                    contenedorCampos.classList.add("detallesUsuario_contenedorCampos")
                    const infoModificarIDX = document.createElement("div")
                    infoModificarIDX.classList.add("padding14")
                    infoModificarIDX.textContent = `Escriba la nueva clave que quiera establecer`
                    contenedorCampos.appendChild(infoModificarIDX)

                    const campoNuevaClave = document.createElement("input")
                    campoNuevaClave.classList.add("botonV1BlancoIzquierda_campo")
                    campoNuevaClave.setAttribute("campo", "claveNueva")
                    campoNuevaClave.setAttribute("componente", "claveNueva")
                    campoNuevaClave.placeholder = "Escriba la nueva contrasena"
                    contenedorCampos.appendChild(campoNuevaClave)
                    const campoVerificaClave = document.createElement("input")
                    campoVerificaClave.classList.add("botonV1BlancoIzquierda_campo")
                    campoVerificaClave.setAttribute("campo", "claveNuevaDos")
                    campoVerificaClave.setAttribute("componente", "claveNuevaDos")
                    campoVerificaClave.placeholder = "Escriba de nueva la nueva contrasena"
                    contenedorCampos.appendChild(campoVerificaClave)
                    espacioUsuario.appendChild(contenedorCampos)
                    const contenedorBotones = document.createElement("div")
                    contenedorBotones.classList.add("detallesUsuario_contenedorBotones")
                    contenedorBotones.setAttribute("componente", "contenedorBotones")
                    const botonGuardarCambios = document.createElement("div")
                    botonGuardarCambios.classList.add("detallesUsuario_botonV1")
                    botonGuardarCambios.addEventListener("click", () => { this.guardarCambios() })
                    botonGuardarCambios.textContent = "Cambiar contrasena"
                    contenedorBotones.appendChild(botonGuardarCambios)
                    const botonCancelarCambios = document.createElement("div")
                    botonCancelarCambios.classList.add("detallesUsuario_botonV1")
                    botonCancelarCambios.textContent = "Cancelar cambio"
                    botonCancelarCambios.addEventListener("click", () => { this.cancelarCambios() })
                    contenedorBotones.appendChild(botonCancelarCambios)
                    espacioUsuario.appendChild(contenedorBotones)
                    const controladorCampos = () => {
                        let estadoGlobalCampos = "vacios"
                        campos.forEach((campo) => {
                            if (campo.value.length > 0) {
                                estadoGlobalCampos = "noVacios"
                            }
                        })
                        const selectorContenedorBotones = document.querySelector("[componente=contenedorBotones]")
                        if (estadoGlobalCampos === "vacios") {
                            selectorContenedorBotones.removeAttribute("style")
                        }
                        if (estadoGlobalCampos === "noVacios") {
                            selectorContenedorBotones.style.display = "flex"
                        }
                    }
                    const campos = document.querySelectorAll("[campo]")
                    campos.forEach((campo) => {
                        campo.addEventListener("input", controladorCampos)
                    })
                }
            },
            guardarCambios: async function () {
                const usuarioIDX = document.querySelector("[usuarioIDX]").getAttribute("usuarioIDX")

                const instanciaUIDPantallaDeCarga = casaVitini.utilidades.codigoFechaInstancia()
                const instanciaUID = document.querySelector("main").getAttribute("instanciaUID")
                const mensaje = `Actualizando contraseña del usuario ${usuarioIDX}...`
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUIDPantallaDeCarga,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const claveNueva = document.querySelector("[componente=claveNueva]")
                const claveNuevaDos = document.querySelector("[componente=claveNuevaDos]")
                const datosParaActualizar = {
                    zona: "administracion/usuarios/actualizarClaveUsuarioAdministracion",
                    usuarioIDX: usuarioIDX,
                    claveNueva: claveNueva.value,
                    claveNuevaDos: claveNuevaDos.value
                }
                const respuestaServidor = await casaVitini.shell.servidor(datosParaActualizar)
                const pantallaDeCargaRenderizada = document.querySelector(`[instanciaUID="${instanciaUIDPantallaDeCarga}"]`)
                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)

                if (!pantallaDeCargaRenderizada) { }
                pantallaDeCargaRenderizada.remove()
                if (respuestaServidor?.error) {
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.error)
                }
                if (respuestaServidor?.ok) {
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.ok)
                    const campos = instanciaRenderizada.querySelectorAll("[campo]")
                    campos.forEach((campo) => {
                        campo.value = ""
                    })

                }
            },
            cancelarCambios: function () {
                const campos = document.querySelectorAll("[campo]")
                campos.forEach((campo) => {
                    campo.value = null
                })
                const selectorContenedorBotones = document.querySelector("[componente=contenedorBotones]")
                selectorContenedorBotones.removeAttribute("style")
            },
        },
        cambiarEstadoCuenta: {
            UI: async function () {
                const estadoCuentaActual = document.querySelector("[estadoCuenta]").getAttribute("estadoCuenta")
                let tituloBoton
                let valorBoton
                let textoDescriptivo
                let tituloInformativo
                if (estadoCuentaActual === "activado") {
                    tituloBoton = "Desactivar cuenta"
                    tituloInformativo = "Confirma la desactivación de la cuenta"
                    textoDescriptivo = "¿Quieres desactivar esta cuenta? El usuario de esta cuenta podría volver a loguearse con ella. Sus implicaciones son inmediatas."
                    valorBoton = "desactivado"
                }
                if (estadoCuentaActual === "desactivado") {
                    tituloBoton = "Activar cuenta"
                    tituloInformativo = "Confirma la activación de la cuenta"
                    textoDescriptivo = "¿Quieres activar esta cuenta? El usuario de esta cuenta no podrá volver a loguearse con ella. Sus implicaciones son inmediatas."
                    valorBoton = "activado"
                }


                const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                pantallaInmersiva.style.justifyContent = "center"

                const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

                const titulo = constructor.querySelector("[componente=titulo]")
                titulo.textContent = tituloInformativo
                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                mensaje.textContent = textoDescriptivo

                const botonAceptar = constructor.querySelector("[boton=aceptar]")
                botonAceptar.textContent = tituloBoton
                botonAceptar.setAttribute("nuevoEstado", valorBoton)
                botonAceptar.addEventListener("click", (e) => { this.transactor(e) })
                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                botonCancelar.textContent = "Cancelar y volver"

                document.querySelector("main").appendChild(pantallaInmersiva)
            },
            transactor: async function (nuevoEstado) {
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = "Actualizando estado del VitiniIDX..."
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const nuevoEstado_ = nuevoEstado.target.getAttribute("nuevoEstado")
                const usuarioIDX = document.querySelector("[usuarioIDX]").getAttribute("usuarioIDX")
                const transaccion = {
                    zona: "administracion/usuarios/actualizarEstadoCuentaDesdeAdministracion",
                    "usuarioIDX": usuarioIDX,
                    "nuevoEstado": nuevoEstado_
                }
                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }
                instanciaRenderizada.remove()
                if (respuestaServidor?.error) {
                    const selectorAdvertenciaInmersiva = document.querySelectorAll("[componente=advertenciaInmersiva]")
                    selectorAdvertenciaInmersiva.forEach((advertenciaInmersiva) => {
                        advertenciaInmersiva.remove()
                    })
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    const estadoActual = respuestaServidor?.estadoCuenta
                    let estadoCuentaUI
                    if (estadoActual === "activado") {
                        estadoCuentaUI = "Desactivar cuenta"
                    }
                    if (estadoActual === "desactivado") {
                        estadoCuentaUI = "Activar cuenta"
                    }
                    const selectorEstadoCuentaUI = document.querySelector("[estadoCuenta]")
                    selectorEstadoCuentaUI.textContent = estadoCuentaUI
                    selectorEstadoCuentaUI.setAttribute("estadoCuenta", estadoActual)
                    const selectorAdvertenciaInmersiva = document.querySelectorAll("[componente=advertenciaInmersiva]")
                    selectorAdvertenciaInmersiva.forEach((advertenciaInmersiva) => {
                        advertenciaInmersiva.remove()
                    })
                }
            }
        },
        eliminarCuenta: {
            UI: async function () {

                const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                pantallaInmersiva.style.justifyContent = "center"
                const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

                const titulo = constructor.querySelector("[componente=titulo]")
                titulo.textContent = "Confirma la eliminación de esta cuenta"
                const mensaje = constructor.querySelector("[componente=mensajeUI]")
                mensaje.textContent = "Si quieres eliminar esta cuenta, confirma su eliminación. Esta operación es inmediata e irreversible. Una vez eliminada la cuenta, sus datos son irrecuperables. Si deseas mantener los datos de esta cuenta, pero a su vez congelar su funcionalidad, es recomendable desactivar la cuenta antes que eliminarla."

                const botonAceptar = constructor.querySelector("[boton=aceptar]")
                botonAceptar.textContent = "Comfirmar la eliminacion de la cuenta"
                botonAceptar.addEventListener("click", () => { this.transactor() })
                const botonCancelar = constructor.querySelector("[boton=cancelar]")
                botonCancelar.textContent = "Cancelar la eliminacion y volver"

                document.querySelector("main").appendChild(pantallaInmersiva)

            },
            transactor: async function () {
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = "Elimiando el VitiniIDX..."
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const usuarioIDX = document.querySelector("[usuarioIDX]").getAttribute("usuarioIDX")
                const transaccion = {
                    zona: "administracion/usuarios/eliminarCuentaDesdeAdministracion",
                    "usuarioIDX": usuarioIDX
                }
                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }
                instanciaRenderizada.remove()
                if (respuestaServidor?.error) {
                    const selectorAdvertenciaInmersiva = document.querySelectorAll("[componente=advertenciaInmersiva]")
                    selectorAdvertenciaInmersiva.forEach((advertenciaInmersiva) => {
                        advertenciaInmersiva.remove()
                    })
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    const selectorAdvertenciaInmersiva = document.querySelectorAll("[componente=advertenciaInmersiva]")
                    selectorAdvertenciaInmersiva.forEach((advertenciaInmersiva) => {
                        advertenciaInmersiva.remove()
                    })
                    const navegacion = {
                        "vista": "/administracion/usuarios",
                        "tipoOrigen": "menuNavegador"
                    }
                    casaVitini.shell.navegacion.controladorVista(navegacion)
                }
            }
        },
        componentes: {
            bannerIDX: function (metadatos) {
                const usuarioIDX = metadatos.usuarioIDX
                const rol = metadatos.rol
                const rolUITexto = rol.substring(0, 1).toUpperCase() + rol.substring(1);
                const contenedorUsuarioIDX = document.createElement("div")
                contenedorUsuarioIDX.classList.add("detallesUsuario_contenedorUsuarioIDX")
                contenedorUsuarioIDX.setAttribute("componente", "contenedorUsuarioUX")
                const esferaUsuario = document.createElement("div")
                esferaUsuario.classList.add("detallesUsuario_esferaUsuario")
                esferaUsuario.setAttribute("componente", "esferaUsuario")
                contenedorUsuarioIDX.appendChild(esferaUsuario)
                const contenedorDatosGlobales = document.createElement("div")
                contenedorDatosGlobales.classList.add("detallesUsuario_contenedorDatosGlobales")
                contenedorDatosGlobales.setAttribute("componente", "contenedorDatosGlobales")
                const usuarioIDXUI = document.createElement("div")
                usuarioIDXUI.classList.add("detallesUsuario_usuarioUI")
                usuarioIDXUI.setAttribute("usuarioIDX", usuarioIDX)
                usuarioIDXUI.textContent = usuarioIDX
                contenedorDatosGlobales.appendChild(usuarioIDXUI)
                const rolUI = document.createElement("div")
                rolUI.classList.add("detallesUsuario_rolUI")
                rolUI.setAttribute("componente", "rolUI")
                rolUI.textContent = rolUITexto
                contenedorDatosGlobales.appendChild(rolUI)
                contenedorUsuarioIDX.appendChild(contenedorDatosGlobales)
                return contenedorUsuarioIDX
            }
        },
        modificarIDX: {
            UI: async function (usuarioIDX) {
                const espacioUsuario = document.querySelector("[componente=espacioUsuarios]")
                const transaccion = {
                    zona: "administracion/usuarios/detallesUsuario",
                    usuarioIDX: usuarioIDX
                }
                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                if (respuestaServidor?.error) {
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    const rol = respuestaServidor?.ok.rol
                    const usuariosIDX = respuestaServidor?.ok.usuarioIDX
                    const datosBanner = {
                        usuarioIDX: usuarioIDX,
                        rol: rol
                    }
                    const contenedorDetallesUsuario = document.createElement("div")
                    contenedorDetallesUsuario.classList.add("detallesUsuario_contenedorGlobal")
                    contenedorDetallesUsuario.setAttribute("componente", "contenedorGlobal")
                    const contenedorUsuarioIDX = casaVitini.view.detallesUsuario.componentes.bannerIDX(datosBanner)
                    contenedorDetallesUsuario.appendChild(contenedorUsuarioIDX)
                    espacioUsuario.appendChild(contenedorDetallesUsuario)
                    const contenedorCampos = document.createElement("div")
                    contenedorCampos.classList.add("detallesUsuario_contenedorCampos")
                    const infoModificarIDX = document.createElement("div")
                    infoModificarIDX.classList.add("padding14")
                    infoModificarIDX.textContent = `Escriba el nuevo VitiniID para este usuario en el campo de abajo. Recuerde que modificar el IDX deja libre el anterior IDX para que otro usuario, si quiere, lo obtenga.`
                    contenedorCampos.appendChild(infoModificarIDX)
                    const campoNuevoIDX = document.createElement("input")
                    campoNuevoIDX.classList.add("botonV1BlancoIzquierda_campo")
                    campoNuevoIDX.setAttribute("campo", "nuevoIDX")
                    campoNuevoIDX.setAttribute("componente", "nuevoIDX")
                    campoNuevoIDX.placeholder = usuariosIDX
                    contenedorCampos.appendChild(campoNuevoIDX)
                    espacioUsuario.appendChild(contenedorCampos)
                    const contenedorBotones = document.createElement("div")
                    contenedorBotones.classList.add("detallesUsuario_contenedorBotones")
                    contenedorBotones.setAttribute("componente", "contenedorBotones")
                    const botonGuardarCambios = document.createElement("div")
                    botonGuardarCambios.classList.add("detallesUsuario_botonV1")
                    botonGuardarCambios.addEventListener("click", () => { this.guardarCambios() })
                    botonGuardarCambios.textContent = "Guardar el nuevo VitiniID"
                    contenedorBotones.appendChild(botonGuardarCambios)
                    const botonCancelarCambios = document.createElement("div")
                    botonCancelarCambios.classList.add("detallesUsuario_botonV1")
                    botonCancelarCambios.textContent = "Cancelar cambios"
                    botonCancelarCambios.addEventListener("click", () => { this.cancelarCambios() })
                    contenedorBotones.appendChild(botonCancelarCambios)
                    espacioUsuario.appendChild(contenedorBotones)
                    const controladorCampos = () => {
                        let estadoGlobalCampos = "vacios"
                        campos.forEach((campo) => {
                            if (campo.value.length > 0) {
                                estadoGlobalCampos = "noVacios"
                            }
                        })
                        const selectorContenedorBotones = document.querySelector("[componente=contenedorBotones]")
                        if (estadoGlobalCampos === "vacios") {
                            selectorContenedorBotones.removeAttribute("style")
                        }
                        if (estadoGlobalCampos === "noVacios") {
                            selectorContenedorBotones.style.display = "flex"
                        }
                    }
                    const campos = document.querySelectorAll("[campo]")
                    campos.forEach((campo) => {
                        campo.addEventListener("input", controladorCampos)
                    })
                }
            },
            guardarCambios: async function () {
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = "Actualizando el VitiniIDX..."
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const usuarioIDX = document.querySelector("[usuarioIDX]")
                const nuevoIDX = document.querySelector("[componente=nuevoIDX]")
                const datosParaActualizar = {
                    zona: "administracion/usuarios/actualizarIDXAdministracion",
                    usuarioIDX: usuarioIDX.getAttribute("usuarioIDX"),
                    nuevoIDX: nuevoIDX.value
                }
                const respuestaServidor = await casaVitini.shell.servidor(datosParaActualizar)

                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }
                instanciaRenderizada.remove()
                if (respuestaServidor?.error) {
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    const IDXEstablecido = respuestaServidor?.usuarioIDX
                    nuevoIDX.value = null
                    nuevoIDX.placeholder = IDXEstablecido
                    usuarioIDX.innerHTML = IDXEstablecido
                    usuarioIDX.setAttribute("usuarioIDX", IDXEstablecido)
                    const selectorContenedorBotones = document.querySelector("[componente=contenedorBotones]")
                    selectorContenedorBotones.removeAttribute("style")
                    const vistaActual = `/administracion/usuarios/${IDXEstablecido}/modificar_idx`
                    const estado = {
                        zona: vistaActual,
                        estadoInternoZona: "estado",
                        tipoCambio: "total"
                    }
                    const titulo = "Casa Vitini"
                    window.history.replaceState(estado, titulo, vistaActual);
                    casaVitini.shell.controladoresUI.controladorEstadoIDX()

                }
            },
            cancelarCambios: function () {
                const campos = document.querySelectorAll("[campo]")
                campos.forEach((campo) => {
                    campo.value = null
                })
                const selectorContenedorBotones = document.querySelector("[componente=contenedorBotones]")
                selectorContenedorBotones.removeAttribute("style")
            },
        },
    },

}