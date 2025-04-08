casaVitini.view = {
    start: function () {
        const granuladorURL = casaVitini.utilidades.granuladorURL()
        const parametros = granuladorURL.parametros

        if (parametros?.grupo) {

            if (parametros.zona === "usuarios") {
                this.detallesDelGrupo.usuariosDelGrupo.arranque({
                    grupoUID: parametros.grupo
                })
            } else if (parametros.zona === "permisos") {
                this.detallesDelGrupo.permisosDelGrupo.arranque({
                    grupoUID: parametros.grupo
                })
            } else if (parametros.zona === "editar") {
                this.detallesDelGrupo.editarGrupo.arranque({
                    grupoUID: parametros.grupo
                })
            } else {
                this.detallesDelGrupo.portada.arranque({
                    grupoUID: parametros.grupo
                })
            }



        } else {

            this.mostrarGrupos()
        }
    },
    mostrarGrupos: async function () {

        const main = document.querySelector("main")
        main.classList.add("flextJustificacion_center")
        const spinner = casaVitini.ui.componentes.spinnerSimple()
        main.appendChild(spinner)

        const marcoElasticoRelativo = document.createElement("div")
        marcoElasticoRelativo.classList.add("marcoElasticoRelativo")
        marcoElasticoRelativo.setAttribute("contenedor", "marcoElasticoRelativo")
        main.appendChild(marcoElasticoRelativo)

        const titulo = document.createElement("p")
        titulo.classList.add("tituloGris", "padding16", "textoCentrado")
        titulo.textContent = "Grupos de usuarios"
        marcoElasticoRelativo.appendChild(titulo)


        const botonConf = document.createElement("a")
        botonConf.classList.add("botonV1BlancoIzquierda")
        botonConf.textContent = "Crear nuevo grupo"
        botonConf.href = "/administracion/usuarios/grupos/nuevo"
        botonConf.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
        marcoElasticoRelativo.appendChild(botonConf)

        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "administracion/usuarios/grupos/obtenerTodosLosGrupos"
        })

        spinner.remove()
        main.classList.remove("flextJustificacion_center")


        if (respuestaServidor?.error) {
            const infoUI = document.createElement("p")
            infoUI.classList.add("flexVertical", "padding6")
            infoUI.textContent = respuestaServidor.error
            marcoElasticoRelativo.appendChild(infoUI)
            return
        }
        if (respuestaServidor.ok) {

            const grupos = respuestaServidor.grupos
            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add("contenedorBotones")
            marcoElasticoRelativo.appendChild(contenedorBotones)

            grupos.forEach(g => {
                const grupoUI = g.grupoUI
                const grupoUID = g.grupoUID

                const ui = document.createElement("a")
                ui.classList.add("textoBoton")
                ui.href = `/administracion/usuarios/grupos/grupo:${grupoUID}`

                ui.textContent = grupoUI
                contenedorBotones.appendChild(ui)
            });

        }

    },
    detallesDelGrupo: {
        portada: {
            arranque: async function (data) {
                const grupoUID = data.grupoUID

                const main = document.querySelector("main")
                main.classList.add("flextJustificacion_center")
                const spinner = casaVitini.ui.componentes.spinnerSimple()
                main.appendChild(spinner)

                const marcoElasticoRelativo = document.createElement("div")
                marcoElasticoRelativo.classList.add("marcoElasticoRelativo")
                marcoElasticoRelativo.setAttribute("contenedor", "marcoElasticoRelativo")
                main.appendChild(marcoElasticoRelativo)

                const titulo = document.createElement("p")
                titulo.classList.add("tituloGris", "padding16", "textoCentrado")
                titulo.textContent = "Grupos de usuarios"
                marcoElasticoRelativo.appendChild(titulo)

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/usuarios/grupos/obtenerDetallesDelGrupo",
                    grupoUID,
                    contenedores: [
                        "grupo",
                    ]
                })

                spinner.remove()
                main.classList.remove("flextJustificacion_center")


                if (respuestaServidor?.error) {
                    const infoUI = document.createElement("p")
                    infoUI.classList.add("flexVertical", "padding6")
                    infoUI.textContent = respuestaServidor.error
                    marcoElasticoRelativo.appendChild(infoUI)
                    return
                }
                if (respuestaServidor.ok) {


                    const grupo = respuestaServidor.grupo
                    const grupoUI = grupo.grupoUI
                    const grupoUID = grupo.grupoUID


                    const botonConf = document.createElement("a")
                    botonConf.classList.add("botonV1BlancoIzquierda")
                    botonConf.textContent = "Editar grupo"
                    botonConf.href = `/administracion/usuarios/grupos/grupo:${grupoUID}/zona:editar`
                    botonConf.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                    marcoElasticoRelativo.appendChild(botonConf)

                    const contenedorBotones = document.createElement("div")
                    contenedorBotones.classList.add("contenedorBotones")
                    marcoElasticoRelativo.appendChild(contenedorBotones)

                    titulo.textContent = `Editar grupo ${grupoUI}`


                    const botonUsuarios = document.createElement("a")
                    botonUsuarios.classList.add("textoBoton")
                    botonUsuarios.href = `/administracion/usuarios/grupos/grupo:${grupoUID}/zona:usuarios`
                    botonUsuarios.textContent = "Usuarios del grupo"
                    contenedorBotones.appendChild(botonUsuarios)


                    const botonPermisos = document.createElement("a")
                    botonPermisos.classList.add("textoBoton")
                    botonPermisos.href = `/administracion/usuarios/grupos/grupo:${grupoUID}/zona:permisos`
                    botonPermisos.textContent = "Permisos del grupo"
                    contenedorBotones.appendChild(botonPermisos)




                }


            },
            confirmar: async function () {
                const main = document.querySelector("main")
                const campoGrupoUI = main.querySelector("[campo=grupoUI]")


                const grupoUI = campoGrupoUI.value
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = `Creando grupo ${grupoUI}...`
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/usuarios/grupos/crearNuevoGrupo",
                    grupoUI
                })
                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }

                if (respuestaServidor?.error) {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    const grupoUID = respuestaServidor.grupoUID
                    await casaVitini.shell.navegacion.controladorVista({
                        vista: `/administracion/usuarios/grupos/grupo:${grupoUID}`,
                        tipoOrigen: "menuNavegador"
                    })
                }
            },
        },
        usuariosDelGrupo: {
            arranque: async function (data) {
                const grupoUID = data.grupoUID

                const main = document.querySelector("main")
                main.classList.add("flextJustificacion_center")
                const spinner = casaVitini.ui.componentes.spinnerSimple()
                main.appendChild(spinner)

                const marcoElasticoRelativo = document.createElement("div")
                marcoElasticoRelativo.classList.add("marcoElasticoRelativo")
                marcoElasticoRelativo.setAttribute("contenedor", "marcoElasticoRelativo")
                main.appendChild(marcoElasticoRelativo)

                const titulo = document.createElement("p")
                titulo.classList.add("tituloGris", "padding16", "textoCentrado")
                titulo.textContent = "Obteniendo usuarios del grupo"
                marcoElasticoRelativo.appendChild(titulo)


                const botonConf = document.createElement("div")
                botonConf.classList.add("botonV1BlancoIzquierda")
                botonConf.textContent = "Añadir usuario al grupo"

                marcoElasticoRelativo.appendChild(botonConf)

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/usuarios/grupos/obtenerDetallesDelGrupo",
                    grupoUID,
                    contenedores: [
                        "grupo",
                        "usuarios"
                    ]

                })

                spinner.remove()
                main.classList.remove("flextJustificacion_center")


                if (respuestaServidor?.error) {
                    const infoUI = document.createElement("p")
                    infoUI.classList.add("flexVertical", "padding6")
                    infoUI.textContent = respuestaServidor.error
                    marcoElasticoRelativo.appendChild(infoUI)
                    return
                }
                if (respuestaServidor.ok) {

                    const usuariosDelGrupo = respuestaServidor.usuariosDelGrupo
                    const grupo = respuestaServidor.grupo
                    const grupoUI = grupo.grupoUI
                    titulo.textContent = `Usuarios del grupo ${grupoUI}`

                    botonConf.addEventListener("click", () => {
                        this.insertarUsuarioAlGrupo.ui({
                            grupoUID,
                            grupoUI
                        })
                    })

                    const contenedorBotones = document.createElement("div")
                    contenedorBotones.classList.add("contenedorBotones")
                    contenedorBotones.setAttribute("contenedor", "botones")
                    marcoElasticoRelativo.appendChild(contenedorBotones)

                    usuariosDelGrupo.forEach(g => {
                        const usuario = g.usuario
                        const uid = g.uid

                        contenedorBotones.appendChild(this.insertarUsuarioAlGrupo.usuarioUI({
                            grupoUID,
                            usuario,
                            uid,
                            grupoUI
                        }))

                    });

                }


            },
            insertarUsuarioAlGrupo: {
                ui: function (data) {
                    const grupoUID = data.grupoUID
                    const grupoUI = data.grupoUI
                    const main = document.querySelector("main")
                    const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada({
                        alineacion: "arriba"
                    })
                    const instanciaUID = ui.getAttribute("instanciaUID")
                    const contenedor = ui.querySelector("[componente=contenedor]")
                    main.appendChild(ui)



                    const botonCerrar = document.createElement("div")
                    botonCerrar.classList.add("botonV1BlancoIzquierda")
                    botonCerrar.textContent = "Cerrar y volver"
                    botonCerrar.addEventListener("click", () => {
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    })
                    contenedor.appendChild(botonCerrar)

                    const titulo = document.createElement("p")
                    titulo.classList.add("colorGrisV1", "negrita", "padding10")
                    titulo.textContent = `Buscar usuario para insertarlo en el grupo ${grupoUI}`
                    contenedor.appendChild(titulo)

                    const contenedorBuscador = document.createElement("div")
                    contenedorBuscador.setAttribute("area", "buscador")
                    contenedorBuscador.classList.add("flexVertical", "gap6")
                    contenedor.appendChild(contenedorBuscador)

                    const buscadorUI = document.createElement("input")
                    buscadorUI.placeholder = "Buscar usuarios"
                    buscadorUI.addEventListener("input", (e) => {
                        this.buscadorPorCampo({
                            e,
                            grupoUID,
                            grupoUI
                        })
                    })
                    contenedorBuscador.appendChild(buscadorUI)

                    const estadoBusqueda = document.createElement("p")
                    estadoBusqueda.classList.add("padding16", "ocultoInicial")
                    estadoBusqueda.textContent = "Buscando..."
                    estadoBusqueda.setAttribute("contenedor", "estadoBusqueda")
                    contenedorBuscador.appendChild(estadoBusqueda)


                    const contenedorResultados = document.createElement("div")
                    contenedorResultados.classList.add("flexVertical", "gap6")
                    contenedorResultados.setAttribute("contenedor", "resultados")
                    contenedorResultados.textContent = "contenedor"
                    contenedorBuscador.appendChild(contenedorResultados)


                },
                usuarioUI: function (data) {
                    const grupoUID = data.grupoUID
                    const grupoUI = data.grupoUI
                    const usuario = data.usuario
                    const uid = data.uid


                    const ui = document.createElement("div")
                    ui.classList.add("botonContenedor")
                    ui.setAttribute("uid", uid)
                    ui.setAttribute("usuario", usuario)

                    const u = document.createElement("p")
                    u.classList.add("negrita", "padding6")
                    u.textContent = usuario
                    ui.appendChild(u)

                    const b = document.createElement("p")
                    b.classList.add("padding6", "borderRadius8", "backgroundGrey1", "comportamientoBoton")
                    b.textContent = "Eliminar del grupo"
                    b.addEventListener("click", () => {
                        this.eliminarUsuarioDelGrupo.ui({
                            grupoUID,
                            grupoUI,
                            usuario,
                            uid
                        })
                    })
                    ui.appendChild(b)

                    return ui
                },
                eliminarUsuarioDelGrupo: {
                    ui: async function (data) {

                        const grupoUID = data.grupoUID
                        const grupoUI = data.grupoUI
                        const usuario = data.usuario
                        const uid = data.uid

                        const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                        const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

                        const titulo = constructor.querySelector("[componente=titulo]")
                        titulo.textContent = `Eliminar ${usuario} del grupo ${grupoUI}`
                        const mensaje = constructor.querySelector("[componente=mensajeUI]")
                        mensaje.textContent = `Confirmas eliminar ${usuario} con identificador universal ${grupoUI}`

                        const botonAceptar = constructor.querySelector("[boton=aceptar]")
                        botonAceptar.textContent = `Comfirmar y eliminar ${usuario} del grupo ${grupoUI}`
                        botonAceptar.addEventListener("click", () => {
                            this.confirmar({
                                grupoUID,
                                grupoUI,
                                usuario,
                                uid
                            })
                        })
                        const botonCancelar = constructor.querySelector("[boton=cancelar]")
                        botonCancelar.textContent = "Cancelar y volver"
                        document.querySelector("main").appendChild(pantallaInmersiva)
                    },
                    confirmar: async function (data) {
                        const grupoUID = data.grupoUID
                        const grupoUI = data.grupoUI
                        const usuario = data.usuario
                        const uid = data.uid
                        const main = document.querySelector("main")


                        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                        const mensaje = `Eliminado ${usuario} del grupo ${grupoUI}...`
                        const datosPantallaSuperpuesta = {
                            instanciaUID: instanciaUID,
                            mensaje: mensaje
                        }
                        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                        const transaccion = {
                            zona: "administracion/usuarios/grupos/eliminarUsuarioDelGrupo",
                            usuario,
                            grupoUID
                        }

                        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                        const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                        if (!instanciaRenderizada) { return }
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()

                        if (respuestaServidor?.error) {
                            casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                        }
                        if (respuestaServidor?.ok) {
                            main.querySelector(`[usuario="${usuario}"][uid="${uid}"]`)?.remove()
                        }

                    },
                },
                buscadorPorCampo: async function (data) {
                    const buscadorCampo = data.e.target
                    const grupoUID = data.grupoUID
                    const grupoUI = data.grupoUI
                    const terminoBusqueda = buscadorCampo.value
                    const areaBuscador = buscadorCampo.closest("[area=buscador")

                    areaBuscador.querySelector("[contenedor=estadoBusqueda]").classList.remove("ocultoInicial")
                    areaBuscador.querySelector("[contenedor=resultados]").textContent = ""
                    clearTimeout(casaVitini.componentes.temporizador);
                    const campoVacio = terminoBusqueda.length
                    if (campoVacio === 0) {
                        areaBuscador.querySelector("[contenedor=estadoBusqueda]").classList.remove("ocultoInicial")
                        areaBuscador.querySelector("[contenedor=resultados]").textContent = ""
                        //crearTimeout(casaVitini.componentes.temporizador)
                        return
                    }
                    casaVitini.componentes.temporizador = setTimeout(async () => {
                        this.iniciarBusqueda({
                            terminoBusqueda,
                            areaBuscador,
                            grupoUID,
                            grupoUI
                        })
                    }, 1500);
                },
                iniciarBusqueda: async function (data) {


                    const terminoBusqueda = data.terminoBusqueda
                    const areaBuscador = data.areaBuscador
                    const grupoUID = data.grupoUID
                    const grupoUI = data.grupoUI

                    const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                    areaBuscador.setAttribute("instanciaUID", instanciaUID)
                    const contenedorResultados = areaBuscador.querySelector("[contenedor=resultados]")

                    const respuestaServidor = await casaVitini.shell.servidor({
                        zona: "administracion/usuarios/buscarUsuarios",
                        buscar: terminoBusqueda,
                        // nombreColumna: transaccion.nombreColumna,
                        // sentidoColumna: transaccion.sentidoColumna,
                        pagina: Number(1)
                    })
                    const instanciaRenderizada = areaBuscador.getAttribute(`instanciaUID`)
                    if (instanciaRenderizada !== instanciaUID) { return }
                    areaBuscador.querySelector("[contenedor=estadoBusqueda]").classList.add("ocultoInicial")

                    if (respuestaServidor?.error) {
                        contenedorResultados.textContent = null
                        casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor.error)
                        return
                    }

                    if (respuestaServidor.totalElementos === 0) {
                        contenedorResultados.textContent = "No se ha encontrado resultados"
                        return
                    }

                    if (respuestaServidor.ok) {

                        const usuarios = respuestaServidor.usuarios
                        usuarios.forEach(u => {

                            const uid = u.uid
                            const usuario = u.usuario

                            const resultadoUI = this.resultadoUI({
                                uid,
                                nombre: usuario,
                            })

                            resultadoUI.addEventListener("click", () => {
                                this.insertarUsuarioAlGrupo({
                                    uid,
                                    usuario,
                                    grupoUI,
                                    grupoUID
                                })
                            })

                            contenedorResultados.appendChild(resultadoUI)
                        })
                    }
                },
                resultadoUI: function (data) {
                    const UID = data.UID
                    const nombre = data.nombre

                    const ui = document.createElement("div")
                    ui.classList.add("flexVertical", "padding10", "backgroundGrey1", "borderRadius16", "gap6", "comportamientoBoton")
                    ui.setAttribute("elementoUID", UID)

                    const nombreUI = document.createElement("p")
                    nombreUI.classList.add("negrita", "padding6")
                    nombreUI.textContent = nombre
                    ui.appendChild(nombreUI)

                    return ui
                },
                insertarUsuarioAlGrupo: async function (data) {
                    const uid = data.uid
                    const grupoUID = data.grupoUID
                    const grupoUI = data.grupoUI
                    const usuario = data.usuario

                    const main = document.querySelector("main")
                    const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                    const contenedor = ui.querySelector("[componente=contenedor]")
                    main.appendChild(ui)

                    const spinner = casaVitini.ui.componentes.spinnerSimple()
                    contenedor.appendChild(spinner)

                    const respuestaServidor = await casaVitini.shell.servidor({
                        zona: "administracion/usuarios/grupos/insertarUsuarioEnGrupo",
                        grupoUID,
                        usuario
                    })

                    spinner?.remove()
                    if (respuestaServidor.error) {

                        const titulo = document.createElement("p")
                        titulo.classList.add("padding10", "textoCentrado")
                        titulo.textContent = respuestaServidor.error
                        contenedor.appendChild(titulo)

                        const botonCerrar = document.createElement("div")
                        botonCerrar.classList.add("botonV1BlancoIzquierda")
                        botonCerrar.textContent = "Cerrar y volver"
                        botonCerrar.addEventListener("click", () => {
                            ui?.remove()
                        })
                        contenedor.appendChild(botonCerrar)

                    }

                    if (respuestaServidor.ok) {
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        const contenedorBotones = main.querySelector("[contenedor=botones]")
                        contenedorBotones.appendChild(this.usuarioUI({
                            grupoUID,
                            usuario,
                            grupoUI,
                            uid
                        }))
                    }
                },
            },
        },
        permisosDelGrupo: {
            arranque: async function (data) {
                const grupoUID = data.grupoUID

                const main = document.querySelector("main")
                main.classList.add("flextJustificacion_center")
                const spinner = casaVitini.ui.componentes.spinnerSimple()
                main.appendChild(spinner)

                const marcoElasticoRelativo = document.createElement("div")
                marcoElasticoRelativo.classList.add("marcoElasticoRelativo")
                marcoElasticoRelativo.setAttribute("contenedor", "marcoElasticoRelativo")
                main.appendChild(marcoElasticoRelativo)

                const titulo = document.createElement("p")
                titulo.classList.add("tituloGris", "padding16", "textoCentrado")
                titulo.textContent = "Obteniendo permisos del grupo"
                marcoElasticoRelativo.appendChild(titulo)

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/usuarios/grupos/obtenerDetallesDelGrupo",
                    grupoUID,
                    contenedores: [
                        "grupo",
                        "permisos"
                    ]
                })

                spinner.remove()
                main.classList.remove("flextJustificacion_center")


                if (respuestaServidor?.error) {
                    const infoUI = document.createElement("p")
                    infoUI.classList.add("flexVertical", "padding6")
                    infoUI.textContent = respuestaServidor.error
                    marcoElasticoRelativo.appendChild(infoUI)
                    return
                }
                if (respuestaServidor.ok) {

                    const vistas = respuestaServidor.vistas
                    const controladores = respuestaServidor.controladores
                    const grupo = respuestaServidor.grupo
                    const permisosDeLasVistasDelGrupo = respuestaServidor.permisosDeLasVistasDelGrupo
                    const permisosDeLosControladoresDelGrupo = respuestaServidor.permisosDeLosControladoresDelGrupo

                    const grupoUI = grupo.grupoUI
                    titulo.textContent = `Permisos del grupo ${grupoUI}`


                    const infoVista = document.createElement("p")
                    infoVista.classList.add("padding16")
                    infoVista.textContent = "Permisos de la UI"
                    marcoElasticoRelativo.appendChild(infoVista)

                    this.arbolUI({
                        selectorUID: "vistaUID",
                        selectorIDV: "vistaIDV",
                        destino: marcoElasticoRelativo,
                        permisosDelGrupo: permisosDeLasVistasDelGrupo,
                        rutas: vistas,
                        metodoActualizador: "actualizarPermisoVista"
                    })


                    const infoControlador = document.createElement("p")
                    infoControlador.classList.add("padding16")
                    infoControlador.textContent = "Permisos del controlador"
                    marcoElasticoRelativo.appendChild(infoControlador)

                    this.arbolUI({
                        selectorUID: "controladorUID",
                        selectorIDV: "controladorIDV",
                        destino: marcoElasticoRelativo,
                        permisosDelGrupo: permisosDeLosControladoresDelGrupo,
                        rutas: controladores,
                        metodoActualizador: "actualizarPermisoControlador"

                    })
                }
            },
            ramaUI: function (data) {
                const titulo = data.titulo

                const uiRama = document.createElement("details")
                uiRama.classList.add("backgroundGrey1", "padding6")

                const uiTitulo = document.createElement("summary")
                uiTitulo.classList.add("padding10")
                uiTitulo.textContent = titulo
                uiRama.appendChild(uiTitulo)

                const c = document.createElement("div")
                c.classList.add("flexVertical", "padding6", "gap6")
                c.setAttribute("contenedor", "rama")
                uiRama.appendChild(c)

                const contenedorPermiso = document.createElement("div")
                contenedorPermiso.classList.add("flexVertical", "gap6")
                c.appendChild(contenedorPermiso)

                const eP = document.createElement("p")
                eP.classList.add("paddingLateral16")
                eP.textContent = "Estado actual del permiso"
                contenedorPermiso.appendChild(eP)

                const selectorPermiso = document.createElement("select")
                selectorPermiso.setAttribute("selector", "permiso")
                contenedorPermiso.appendChild(selectorPermiso)

                const o1 = document.createElement("option")
                o1.value = ""
                o1.disabled = true
                o1.text = "Estado del permmiso"
                selectorPermiso.appendChild(o1)

                const o2 = document.createElement("option")
                o2.value = "permitido"
                o2.text = "Permitir"
                selectorPermiso.appendChild(o2)

                const o3 = document.createElement("option")
                o3.value = "noPermitido"
                o3.text = "No Permitir"
                selectorPermiso.appendChild(o3)

                const contenedorTronco = document.createElement("div")
                contenedorTronco.classList.add("flexVertical", "gap6", "ocultoInicial")
                contenedorTronco.setAttribute("contenedor", "tronco")
                c.appendChild(contenedorTronco)

                return uiRama
            },
            arbolUI: function (data) {

                const selectorUID = data.selectorUID
                const selectorIDV = data.selectorIDV
                const destino = data.destino
                const permisosDelGrupo = data.permisosDelGrupo
                const rutas = data.rutas
                const metodoActualizador = data.metodoActualizador
                const permisosObjetoPorUID = {}

                permisosDelGrupo.forEach(p => {
                    const sUID = p[selectorUID]
                    permisosObjetoPorUID[sUID] = p
                })

                const arbolRegado = {};

                for (const r of rutas) {
                    const sUID = r[selectorUID]
                    const sIDV = r[selectorIDV]

                    const sIDV_granulada = sIDV.split("/").filter(s => s)
                    let arbol = arbolRegado;

                    sIDV_granulada.forEach((key, index) => {
                        if (!arbol[key]) {
                            arbol[key] = {
                                ramas: {},
                                permisoDeLaRama: null
                            };
                        }
                        if (sIDV_granulada.length === index + 1) {
                            arbol[key].permisoDeLaRama = permisosObjetoPorUID[sUID]
                        }
                        arbol = arbol[key].ramas
                    });
                }

                const arbolUI = document.createElement("div")
                arbolUI.classList.add("flexVertical", "gap6")
                destino.appendChild(arbolUI)

                let contenedorDestino = arbolUI

                const limpiezaNombre = (data) => {
                    const selectorIDV = data.selectorIDV
                    const nombreRama = data.nombreRama
                    const pM = nombreRama.charAt(0).toUpperCase() + nombreRama.slice(1)

                    if (selectorIDV === "vistaIDV") {
                        return pM.replaceAll("_", " ")
                    } else if (selectorIDV === "controladorIDV") {
                        const camelToHuman = nombreRama.replace(/([A-Z])/g, ' $1').toLowerCase();
                        return camelToHuman.charAt(0).toUpperCase() + camelToHuman.slice(1)
                    }
                }

                const recorrerObjeto = (arbol, contenedorDestino) => {
                    for (let [nombreRama, c] of Object.entries(arbol)) {
                        const ramas = c.ramas

                        const rUI = this.ramaUI({
                            titulo: limpiezaNombre({
                                selectorIDV,
                                nombreRama
                            })
                        });

                        const permiso = c.permisoDeLaRama?.permiso
                        const permisoUID = c.permisoDeLaRama?.uid
                        const selector = rUI.querySelector("[contenedor=rama]").querySelector("[selector=permiso]")
                        if (permiso) {

                            selector.value = permiso

                            selector.setAttribute("permisoUID", permisoUID)
                            selector.addEventListener("click", (e) => {
                                this[metodoActualizador](e)
                            })
                        } else {
                            selector.classList.add("ocultoInicial")
                        }
                        contenedorDestino.appendChild(rUI);

                        const nuevoContenedor = document.createElement('div');
                        nuevoContenedor.classList.add("flexVertical", "gap6")

                        const tronco = rUI.querySelector("[contenedor=tronco]")
                        tronco.appendChild(nuevoContenedor);

                        recorrerObjeto(arbol[nombreRama].ramas, nuevoContenedor);

                        if (Object.keys(ramas).length > 0) {
                            tronco.classList.remove("ocultoInicial")
                        }
                    }
                }
                recorrerObjeto(arbolRegado, contenedorDestino)
            },
            actualizarPermisoVista: async function (e) {
                const selector = e.target
                const permisoUID = selector.closest("[permisoUID]").getAttribute("permisoUID")
                const permisoIDV = selector.value

                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = `Actualizano permiso de la ui...`
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/usuarios/grupos/actualizarPermisoVistaDelGrupo",
                    permisoUID,
                    permisoIDV
                })
                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()

                if (respuestaServidor?.error) {
                    casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    const permisoActualizado = respuestaServidor.permisoActualizado
                    const permisoIDV = permisoActualizado.permiso
                    selector.value = permisoIDV
                }
            },
            actualizarPermisoControlador: async function (e) {
                const selector = e.target
                const permisoUID = selector.closest("[permisoUID]").getAttribute("permisoUID")
                const permisoIDV = selector.value

                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = `Actualizano permiso del controlador...`
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/usuarios/grupos/actualizarPermisoControladorDelGrupo",
                    permisoUID,
                    permisoIDV
                })
                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()

                if (respuestaServidor?.error) {
                    casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    const permisoActualizado = respuestaServidor.permisoActualizado
                    const permisoIDV = permisoActualizado.permiso
                    selector.value = permisoIDV
                }
            }
        },
        editarGrupo: {
            arranque: async function (data) {
                const grupoUID = data.grupoUID

                const main = document.querySelector("main")
                main.classList.add("flextJustificacion_center")
                const spinner = casaVitini.ui.componentes.spinnerSimple()
                main.appendChild(spinner)

                const marcoElasticoRelativo = document.createElement("div")
                marcoElasticoRelativo.classList.add("marcoElasticoRelativo")
                marcoElasticoRelativo.setAttribute("contenedor", "marcoElasticoRelativo")
                main.appendChild(marcoElasticoRelativo)

                const titulo = document.createElement("p")
                titulo.classList.add("tituloGris", "padding16", "textoCentrado")
                titulo.textContent = "Grupos de usuarios"
                marcoElasticoRelativo.appendChild(titulo)


                const botonConf = document.createElement("a")
                botonConf.classList.add("botonV1BlancoIzquierda")
                botonConf.textContent = "Volver a la portada del grupo de usuarios"
                botonConf.href = `/administracion/usuarios/grupos/grupo:${grupoUID}`
                botonConf.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                marcoElasticoRelativo.appendChild(botonConf)

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/usuarios/grupos/obtenerDetallesDelGrupo",
                    grupoUID,
                    contenedores: [
                        "grupo",
                    ]
                })

                spinner.remove()
                main.classList.remove("flextJustificacion_center")


                if (respuestaServidor?.error) {
                    const infoUI = document.createElement("p")
                    infoUI.classList.add("flexVertical", "padding6")
                    infoUI.textContent = respuestaServidor.error
                    marcoElasticoRelativo.appendChild(infoUI)
                    return
                }
                if (respuestaServidor.ok) {
                    const grupo = respuestaServidor.grupo
                    const grupoUI = grupo.grupoUI
                    titulo.textContent = `Editar grupo ${grupoUI}`

                    const info = document.createElement("p")
                    info.classList.add("padding16")
                    info.textContent = "Edita el nombre del grupo. Los permisos y los usuarios se mantendrán intactos."
                    marcoElasticoRelativo.appendChild(info)

                    const campoNombre = document.createElement("input")
                    campoNombre.classList.add("botonV1BlancoIzquierda_campo")
                    campoNombre.setAttribute("campo", "grupoUI")
                    campoNombre.value = grupoUI
                    campoNombre.placeholder = "Escribe el nuevo nombre del grupo"
                    marcoElasticoRelativo.appendChild(campoNombre)

                    const botonActualizar = document.createElement("div")
                    botonActualizar.classList.add("botonV1BlancoIzquierda")
                    botonActualizar.textContent = "Editar grupo"
                    botonActualizar.addEventListener("click", () => {
                        this.actualiarNombreGrupo({
                            grupoUID,
                            grupoUI: campoNombre.value
                        })
                    })
                    marcoElasticoRelativo.appendChild(botonActualizar)


                    const botonEliminar = document.createElement("div")
                    botonEliminar.classList.add("botonV1BlancoIzquierda")
                    botonEliminar.textContent = "Eliminar grupo"
                    botonEliminar.addEventListener("click", () => {
                        this.eliminarGrupo.ui({
                            grupoUID,
                            grupoUI

                        })
                    })
                    marcoElasticoRelativo.appendChild(botonEliminar)
                }


            },
            actualiarNombreGrupo: async function (data) {
                const main = document.querySelector("main")

                const grupoUI = data.grupoUI
                const grupoUID = data.grupoUID

                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = `Actualizando el nombre a ${grupoUI}...`
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/usuarios/grupos/actualizarNombreGrupo",
                    grupoUI,
                    grupoUID
                })
                const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!instanciaRenderizada) { return }

                if (respuestaServidor?.error) {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    const grupoUID = respuestaServidor.grupoUID
                    await casaVitini.shell.navegacion.controladorVista({
                        vista: `/administracion/usuarios/grupos/grupo:${grupoUID}`,
                        tipoOrigen: "menuNavegador"
                    })
                }
            },
            eliminarGrupo: {
                ui: async function (data) {

                    const grupoUID = data.grupoUID
                    const grupoUI = data.grupoUI

                    const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                    const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

                    const titulo = constructor.querySelector("[componente=titulo]")
                    titulo.textContent = `Eliminar ${grupoUI} irreversiblemente`
                    const mensaje = constructor.querySelector("[componente=mensajeUI]")
                    mensaje.textContent = `Confirmas eliminar ${grupoUI} con identificador universal ${grupoUID}`

                    const botonAceptar = constructor.querySelector("[boton=aceptar]")
                    botonAceptar.textContent = `Comfirmar y eliminar ${grupoUI}`
                    botonAceptar.addEventListener("click", () => {
                        this.confirmar({
                            grupoUID,
                            grupoUI
                        })
                    })
                    const botonCancelar = constructor.querySelector("[boton=cancelar]")
                    botonCancelar.textContent = "Cancelar y volver"
                    document.querySelector("main").appendChild(pantallaInmersiva)
                },
                confirmar: async function (data) {

                    const grupoUID = data.grupoUID
                    const grupoUI = data.grupoUI
                    const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                    const mensaje = `Eliminado ${grupoUI}...`
                    const datosPantallaSuperpuesta = {
                        instanciaUID: instanciaUID,
                        mensaje: mensaje
                    }
                    casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                    const transaccion = {
                        zona: "administracion/usuarios/grupos/eliminarGrupo",
                        grupoUID
                    }

                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                    if (!instanciaRenderizada) { return }

                    if (respuestaServidor?.error) {
                        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                        casaVitini.ui.componentes.advertenciaInmersivaSuperPuesta(respuestaServidor?.error)
                    }
                    if (respuestaServidor?.ok) {
                        await casaVitini.shell.navegacion.controladorVista({
                            vista: `/administracion/usuarios/grupos`,
                            tipoOrigen: "menuNavegador"
                        })
                    }
                },
            },
        }
    }
}