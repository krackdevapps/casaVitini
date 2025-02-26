const casaVitini = {
    shell: {
        navegacion: {
            navegacionInversa: async (e) => {
                const zona = (history.state)?.zona || "portada"
                const tipoCambio = (history.state)?.tipoCambio || "parcial"
                const componenteExistente = history.state?.componenteExistente
                const componente = document.querySelector(`[componente="${componenteExistente}"]`)

                if (tipoCambio === "parcial") {
                    const funcionPersonalizada = history.state?.funcionPersonalizada
                    const args = history.state?.args || null
                    if (componente) {
                        if (args) {
                            const instanciaUID = document.querySelector("main").getAttribute("instanciaUID")
                            args.instanciaUID = instanciaUID
                        }

                        return casaVitini.utilidades.ejecutarFuncionPorNombreDinamicoConContexto({
                            ruta: funcionPersonalizada,
                            args: args
                        })
                    }
                } if (tipoCambio === "total" || !componente) {
                    return casaVitini.shell.navegacion.controladorVista({
                        vista: zona,
                    })
                }
            },
            cambiarVista: (vistaMenu) => {
                if (vistaMenu.button === 0) { // 0 es el botón izquierdo, 1 es el botón central
                    vistaMenu.preventDefault()
                    vistaMenu.stopPropagation()
                    const vista = vistaMenu.target.closest("[vista]").getAttribute("vista")
                    return casaVitini.shell.navegacion.controladorVista({
                        vista: vista,
                        tipoOrigen: "menuNavegador",
                        objetoOrigen: vistaMenu
                    })
                }
            },
            controladorVista: async (data) => {
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const objetoOrigen = data.objetoOrigen?.target
                const selectorMenuRenderizado = document.querySelector("header [estructura=menu]")
                const tipoOrigen = data.tipoOrigen
                const vista = data.vista || "portada"
                const main = document.querySelector("main")
                main.setAttribute("instanciaUID", instanciaUID)
                if (objetoOrigen?.getAttribute("tipoMenu") === "volatil") {
                    const zonaUI = objetoOrigen.getAttribute("zona")
                    selectorMenuRenderizado.querySelectorAll("[tipoMenu=volatil]").forEach((menu) => {
                        menu.removeAttribute("style")
                    })
                    selectorMenuRenderizado
                        .querySelector(`[zona="${zonaUI}"]`)
                        .style.background = "rgba(0, 0, 0, 0.2)"
                    const selectorMenuGlobalFlotanteRenderizado = document.querySelector("[componente=menuGlobalFlotante]")
                    if (selectorMenuGlobalFlotanteRenderizado) {
                        selectorMenuGlobalFlotanteRenderizado.remove()
                    }
                }
                casaVitini.shell.controladoresUI.ocultaMenuGlobalFlotante(data)
                main.style.transition = "opacity 0s linear"
                main.style.opacity = "0"
                main.style.pointerEvents = "none"
                const selectorPantallaCargaRenderizda = document.querySelector("[ui=pantallaDeCarga]")
                if (!selectorPantallaCargaRenderizda) {
                    const pantallaCarga = document.createElement("div")
                    pantallaCarga.setAttribute("ui", "pantallaDeCarga")
                    const spinnerSimple = casaVitini.ui.componentes.spinnerSimple()
                    pantallaCarga.appendChild(spinnerSimple)
                    document.body.appendChild(pantallaCarga)
                }
                const selectorAdvertenciasInmersivas = document.querySelectorAll("[componente=errorUI], [componente=menuVolatil]")
                selectorAdvertenciasInmersivas.forEach((advertenciaInmersivaRenderizada) => {
                    advertenciaInmersivaRenderizada.remove()
                })
                const selectorCalendarioRenderizados = document.querySelectorAll("[contenedor=calendario]")
                selectorCalendarioRenderizados.forEach((calendarioRenderizado) => {
                    calendarioRenderizado.remove()
                })
                const vistaActual = selectorMenuRenderizado?.getAttribute("vistaActual")
                let url = window.location.pathname.split("/");
                delete url[0]
                delete url[1]
                delete url[2]
                url = url.filter((url) => url)
                if (vista === "portada") {
                    selectorMenuRenderizado.querySelectorAll("[componente=contenedorMenu] [zona]").forEach(zona => {
                        zona.removeAttribute("style")
                    });
                }
                const transaccion = {
                    zona: "componentes/cambiarVista",
                    vista: vista
                }
                const privacidad = casaVitini.componentes.privacidad.arranque(vista)
                if (privacidad) {
                    transaccion.vista = "politicas/privacidad"
                }
                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                const contenedorVista = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
                if (contenedorVista) {
                    const selectorPantallaCargaRenderizdaPostPeticion = document.querySelector("[ui=pantallaDeCarga]")
                    main.removeAttribute("rama")
                    if (respuestaServidor?.error) {
                        casaVitini.shell.controladoresUI.limpiarMain()
                        contenedorVista.removeAttribute("rama")
                        await casaVitini.shell.controladoresUI.controladorEstadoIDX()
                        contenedorVista.innerHTML = null
                        casaVitini.shell.controladoresUI.eliminarTodasLasPropiedadesCSSMenosUna(["opacity", "transition"])
                        casaVitini.shell.controladoresUI.limpiezaUI()
                        casaVitini.view = {}
                        const marcoError = document.createElement("div")
                        marcoError.classList.add("plaza_marcoError_seccion")
                        marcoError.setAttribute("ui", "global")
                        marcoError.textContent = respuestaServidor.error
                        contenedorVista.appendChild(marcoError)
                        main.removeAttribute("style")
                    } else if (respuestaServidor?.ok) {
                        const zona = respuestaServidor?.zona
                        document.documentElement.scrollTop = 0;
                        const html = respuestaServidor.html
                        const css = respuestaServidor.css
                        const js = respuestaServidor.js
                        const sharedMethods = respuestaServidor.sharedMethods
                        const urlWithoutParams = respuestaServidor.urlWithoutParams
                        const params = respuestaServidor.params
                        casaVitini.shell.controladoresUI.limpiezaUI({ zonaDestino: zona })
                        contenedorVista.innerHTML = null
                        casaVitini.view = {}
                        const cssContainer = document.createElement("style")
                        cssContainer.textContent = css
                        contenedorVista.appendChild(cssContainer)
                        contenedorVista.innerHTML += html
                        const jsContainer = document.createElement("script")
                        jsContainer.defer = true;
                        jsContainer.textContent = js
                        contenedorVista.appendChild(jsContainer)
                        const sharedMethodsContainer = document.createElement("script")
                        sharedMethodsContainer.defer = true;
                        sharedMethodsContainer.textContent = sharedMethods
                        contenedorVista.appendChild(sharedMethodsContainer)
                        contenedorVista.setAttribute("rama", zona)
                        const menu_renderizado = document.querySelector("[componente=contenedorMenu]")
                        menu_renderizado.querySelectorAll("[tipoMenu=volatil]").forEach((menu) => {
                            menu.removeAttribute("style")
                        })
                        if (menu_renderizado.querySelector(`[zona="${zona}"]`)) {
                            menu_renderizado.querySelector(`[zona="${zona}"]`).style.background = "rgba(0, 0, 0, 0.6)"
                            menu_renderizado.querySelector(`[zona="${zona}"]`).style.color = "white"
                        }
                        await casaVitini.shell.controladoresUI.controladorEstadoIDX()
                        casaVitini.shell.controladoresUI.eliminarTodasLasPropiedadesCSSMenosUna(["opacity", "transition"])
                        let urlVista = respuestaServidor.url
                        if (privacidad) {
                            urlVista = vista === "portada" ? "/" : vista;
                        }
                        urlVista = urlVista === "/portada" ? "/" : urlVista;
                        urlVista = decodeURIComponent(urlVista);
                        let controladorUrl;
                        if (vistaActual?.toLowerCase() === vista?.toLowerCase()) {
                            controladorUrl = "soloActualiza"
                        }
                        selectorMenuRenderizado.setAttribute("vistaActual", vista)
                        const titulo = 'Casa Vitini';
                        const estado = {}

                        const estadoInicial = casaVitini?.view?.navegacion?.estadoInicial
                        if (estadoInicial) {

                            Object.assign(estado, estadoInicial);
                        } else {
                            estado.zona = vista === "portada" ? "" : vista
                            estado.tipoCambio = "total"
                        }


                        if (tipoOrigen === "menuNavegador" && !controladorUrl) {

                            window.history.pushState(estado, titulo, urlVista);
                        } else if (controladorUrl === "soloActualiza") {

                            window.history.replaceState(estado, titulo, urlVista);
                        } else if (!tipoOrigen && !controladorUrl) {

                            window.history.replaceState(estado, titulo, urlVista);
                        }

                        const granuladorURL = casaVitini.utilidades.granuladorURL()
                        const directoriosFusion = granuladorURL.directoriosFusion
                        contenedorVista.setAttribute("zonaCSS", directoriosFusion)
                        const viewStart = casaVitini?.view?.start
                        if (typeof viewStart === "function") {
                            casaVitini?.view?.start({
                                url: urlWithoutParams,
                                params: params
                            })
                        }
                        // const arranqueVistaPublica = contenedorVista?.querySelector("arranque")?.getAttribute("publico")
                        // const arranqueVistaAdministrativa = contenedorVista?.querySelector("arranque")?.getAttribute("administracion")
                        // if (arranqueVistaPublica) {
                        //     const ruta = "ui.vistas." + arranqueVistaPublica
                        //     casaVitini.utilidades.ejecutarFuncionPorNombreDinamicoConContexto({
                        //         ruta: ruta,
                        //         args: null
                        //     })
                        // } else if (arranqueVistaAdministrativa) {
                        //     const ruta = "administracion." + arranqueVistaAdministrativa
                        //     casaVitini.utilidades.ejecutarFuncionPorNombreDinamicoConContexto({
                        //         ruta: ruta,
                        //         args: null
                        //     })
                        // }
                        selectorPantallaCargaRenderizdaPostPeticion?.remove()
                        main.style.transition = "opacity 250ms linear"
                        main.style.opacity = "1"
                    }
                }
            },
            sobreControlMenuGlobal: (e) => {
                const menu_renderizado = document.querySelector("[componente=contenedorMenu]")
                const usuarioActual = menu_renderizado.querySelector("[data=vitiniIDX]").textContent
                const menuActual = menu_renderizado.getAttribute("menuID")
                const menuFinal = (menuID) => {
                    if (menuID === "panelControl") {
                        menu_renderizado.setAttribute("sobreControl", "activo")
                        return "publica"
                    } else if (menuID === "publica") {
                        menu_renderizado.removeAttribute("sobreControl")
                        return "panelControl"
                    }
                }
                casaVitini.shell.navegacion.constructorMenuUI({
                    tipoMenu: menuFinal(menuActual),
                    destino: "header [contenedor=intermedio]",
                    usuario: usuarioActual,
                    origen: "sobreControl"
                })
                const zonaActual = document.querySelector("main").getAttribute("rama")
                menu_renderizado.querySelectorAll("[zona]").forEach(zonaObsoleta => {
                    zonaObsoleta.removeAttribute("style")
                })
                if (menu_renderizado.querySelector("[zona=" + zonaActual + "]")) {
                    menu_renderizado.querySelector("[zona=" + zonaActual + "]").style.background = "rgba(0, 0, 0, 0.6)"
                    menu_renderizado.querySelector("[zona=" + zonaActual + "]").style.color = "white"
                }
                const menuResponsivoRenderizado = document.querySelector("[componente=menuGlobalFlotante]")
                if (menuResponsivoRenderizado) {
                    casaVitini.shell.controladoresUI.menuResponsivo.renderizaMenuResponsivo()
                }
            },
            controladorNavegacion: async function (navegacion) {
                const estadoIDV = navegacion.estadoIDV
                const usuario = navegacion.usuario
                const tipoBarraNavegacion = navegacion.tipo
                const origen = navegacion.origen
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const panelNavegacion = document.querySelector("header [componente=contenedorMenu]")
                const menuRenderizado = panelNavegacion.getAttribute("menuID")
                const zonaActual = document.querySelector("main").getAttribute("rama")
                const estadoSobreControl = panelNavegacion.getAttribute("sobreControl")
                if (estadoIDV === "conectado" && estadoSobreControl === "activo") {
                    return
                }
                if (tipoBarraNavegacion === "panelControl" && menuRenderizado !== tipoBarraNavegacion) {
                    panelNavegacion.setAttribute("menuID", tipoBarraNavegacion)
                    casaVitini.shell.navegacion.constructorMenuUI({
                        tipoMenu: "panelControl",
                        destino: "header [contenedor=intermedio]",
                        usuario: usuario
                    })
                } else if (tipoBarraNavegacion === "publica" && menuRenderizado !== tipoBarraNavegacion) {
                    panelNavegacion.setAttribute("menuID", tipoBarraNavegacion)
                    casaVitini.shell.navegacion.constructorMenuUI({
                        tipoMenu: "publica",
                        destino: "header [contenedor=intermedio]",
                        usuario: usuario
                    })
                }
                const selectorMenuRenderizado = document.querySelector("header [estructura=menu]")
                const menuID = selectorMenuRenderizado.querySelector("[data=vitiniIDX]")
                if (estadoIDV === "conectado") {
                    menuID.textContent = usuario
                }
                if (estadoIDV === "desconectado") {
                    menuID.textContent = "Mi Casa"
                    panelNavegacion.removeAttribute("sobreControl")
                    panelNavegacion.querySelector("[elemento=esfera]")?.remove()
                }
                selectorMenuRenderizado.querySelectorAll("[zona]").forEach(zonaObsoleta => {
                    zonaObsoleta.removeAttribute("style")
                })
                if (zonaActual && selectorMenuRenderizado.querySelector(`[zona="${zonaActual}"]`)) {
                    selectorMenuRenderizado.querySelector(`[zona="${zonaActual}"]`).style.background = "rgba(0, 0, 0, 0.6)"
                    selectorMenuRenderizado.querySelector(`[zona="${zonaActual}"]`).style.color = "white"
                }
            },
            constructorMenuUI: (data) => {
                const tipoMenu = data.tipoMenu
                const destino = data.destino
                const usuario = data.usuario
                const origen = data.origen
                const menuAdminData = [{
                    href: "/administracion",
                    nombre: "Administración",
                    zona: "administracion"
                }, {
                    href: "/administracion/situacion",
                    nombre: "Situación",
                    zona: "situacion"
                }, {
                    href: "/administracion/calendario",
                    nombre: "Calendario",
                    zona: "calendario"
                }, {
                    href: "/administracion/reservas",
                    nombre: "Reservas",
                    zona: "reservas"
                }, {
                    href: "/administracion/clientes",
                    nombre: "Clientes",
                    zona: "clientes"
                }, {
                    tipo: "sobreControlMenu"
                }]
                const menuPublicoData = [{
                    href: "/alojamiento",
                    nombre: "Alojamiento",
                    zona: "alojamiento"
                },
                {
                    href: "/conozcanos",
                    nombre: "Conózcanos",
                    zona: "conozcanos"
                }, {
                    href: "/instalaciones",
                    nombre: "Instalaciones",
                    zona: "instalaciones"
                },                 {
                    href: "/productos_y_servicios",
                    nombre: "Productos y servicios",
                    zona: "productos_y_servicios"
                }, {
                    href: "/contacto",
                    nombre: "Contacto",
                    zona: "contacto"
                }, {
                    tipo: "sobreControlMenu"
                }]
                document.querySelector("[componente=contenedorMenu]").setAttribute("menuID", tipoMenu)
                const selectorDestino = document.querySelector(destino)
                const estructura_selector = selectorDestino.querySelector("[estructura=menu]")
                if (!estructura_selector) {
                    const estructuraMenu = document.createElement("div")
                    estructuraMenu.setAttribute("estructura", "menu")
                    estructuraMenu.classList.add(
                        "estructura"
                    )
                    selectorDestino.appendChild(estructuraMenu)
                    const contenedorZonas = document.createElement("div")
                    contenedorZonas.setAttribute("contenedor", "zonas")
                    contenedorZonas.classList.add(
                        "zonas"
                    )
                    const contenedorIDX = document.createElement("a")
                    contenedorIDX.setAttribute("href", "/micasa")
                    contenedorIDX.setAttribute("class", "uiCategoria")
                    contenedorIDX.setAttribute("tipoMenu", "volatil")
                    contenedorIDX.setAttribute("vista", "/micasa")
                    contenedorIDX.setAttribute("zona", "micasa")
                    contenedorIDX.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                    estructuraMenu.appendChild(contenedorIDX)
                    const textoIDV = document.createElement("div")
                    textoIDV.classList.add("elipsisIDX")
                    textoIDV.setAttribute("data", "vitiniIDX")
                    textoIDV.textContent = !usuario ? "Mi Casa" : usuario
                    contenedorIDX.appendChild(textoIDV)
                }
                const estructura_renderizada = selectorDestino.querySelector("[estructura=menu]")
                estructura_renderizada.querySelectorAll("[tipoMenu=volatil]").forEach((zonaObsoleta) => {
                    const zona = zonaObsoleta.getAttribute("zona")
                    if (zona !== "micasa") {
                        zonaObsoleta?.remove()
                    }
                })
                const zonaMiCasaRenderizada = estructura_renderizada.querySelector("[zona=micasa]")
                const zonaUI = (data) => {
                    const href = data.href
                    const nombre = data.nombre
                    const zonaIDV = data.zonaIDV
                    const zona = document.createElement("a")
                    zona.setAttribute("href", href)
                    zona.setAttribute("class", "uiCategoria")
                    zona.setAttribute("tipoMenu", "volatil")
                    zona.setAttribute("vista", href)
                    zona.setAttribute("zona", zonaIDV)
                    zona.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                    zona.textContent = nombre
                    return zona
                }
                const sobreControlUI = () => {
                    const sobreControl = document.createElement("a")
                    sobreControl.setAttribute("class", "esferaUI_flotante")
                    sobreControl.setAttribute("title", "Cambiar menú")
                    sobreControl.setAttribute("tipoMenu", "volatil")
                    sobreControl.setAttribute("elemento", "esfera")
                    sobreControl.setAttribute("controlFlotante", "cancelar")
                    sobreControl.addEventListener("click", casaVitini.shell.navegacion.sobreControlMenuGlobal)
                    return sobreControl
                }
                if (tipoMenu === "publica") {
                    menuPublicoData.forEach((menu) => {
                        const href = menu.href
                        const nombre = menu.nombre
                        const zonaIDV = menu.zona
                        const tipo = menu?.tipo
                        if (!tipo) {
                            const zona = zonaUI({
                                href,
                                nombre,
                                zonaIDV,
                            })
                            estructura_renderizada.insertBefore(zona, zonaMiCasaRenderizada);
                        } else if (tipo === "sobreControlMenu" && origen === "sobreControl") {
                            const sobreControl = sobreControlUI()
                            estructura_renderizada.insertBefore(sobreControl, zonaMiCasaRenderizada);
                        }
                    })
                } else if (tipoMenu === "panelControl") {
                    menuAdminData.forEach((menu) => {
                        const href = menu.href
                        const nombre = menu.nombre
                        const tipo = menu?.tipo
                        const zonaIDV = menu.zona
                        if (!tipo) {
                            const zona = zonaUI({
                                href,
                                nombre,
                                zonaIDV,
                            })
                            estructura_renderizada.insertBefore(zona, zonaMiCasaRenderizada);
                        } else if (tipo === "sobreControlMenu") {
                            const sobreControl = sobreControlUI()
                            estructura_renderizada.insertBefore(sobreControl, zonaMiCasaRenderizada);
                        }
                    })
                }
            },
        },
        arranque: async () => {
            window.addEventListener("popstate", casaVitini.shell.navegacion.navegacionInversa)
            await casaVitini.shell.controladoresUI.controladorEstadoIDX()
            document.querySelector("[componente=botonMenuResponsivo]").addEventListener("click", () => {
                casaVitini.shell.controladoresUI.menuResponsivo.despliege()
            })
            const vistas = document.querySelectorAll("[vista]")
            for (const vistaMenu of vistas) {
                vistaMenu.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            }
            const url = window.location.pathname;
            if (url === "/") {
                return casaVitini.shell.navegacion.controladorVista({
                    vista: "portada"
                })
            } else {
                return casaVitini.shell.navegacion.controladorVista({
                    vista: url
                })
            }
        },
        IDX: {
            iniciarSession: async (IDX) => {
                const usuario = IDX.usuario
                const clave = IDX.clave
                const contenedorBotones = document.querySelector("[componente=contenedorBotones]")
                const bloqueRespuesta = document.querySelector("[componente=bloqueRespuesta")
                bloqueRespuesta.style.color = "white"
                const campos = document.querySelectorAll("[componente=campoID]")
                campos.forEach((campo) => {
                    campo.removeAttribute("style")
                })
                const circuloAnimado = document.createElement("span")
                circuloAnimado.classList.add("circuloAnimado")
                const mensajeIniciando = document.createElement("div")
                mensajeIniciando.classList.add("flexVertical")
                mensajeIniciando.textContent = "Comprobando tu Vitini ID..."
                bloqueRespuesta.appendChild(circuloAnimado)
                bloqueRespuesta.appendChild(mensajeIniciando)
                bloqueRespuesta.style.opacity = "1"
                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "IDX/conectar",
                    usuario: usuario,
                    clave: clave
                })
                if (respuestaServidor?.error) {
                    bloqueRespuesta.textContent = respuestaServidor?.error
                    campos.forEach(campo => {
                        campo.style.background = "rgba(255, 0, 0, 0.5)"
                    });
                }
                if (respuestaServidor?.ok) {
                    let tipo;
                    const rolIDV = respuestaServidor?.rolIDV;
                    if (rolIDV === "cliente") {
                        tipo = "publica"
                    }
                    if (rolIDV === "administrador" ||
                        rolIDV === "empleado") {
                        tipo = "panelControl"
                    }
                    const zonaActual = document.querySelector("header [estructura=menu]").getAttribute("vistaActual")
                    return casaVitini.shell.navegacion.controladorVista({
                        vista: zonaActual,
                        tipoOrigen: "menuNavegador"
                    })
                }
            },
            cerrarSession: async () => {
                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "IDX/desconectar"
                })
                if (respuestaServidor?.error) {
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                    return false
                }
                if (respuestaServidor?.estadoIDV === "desconectado") {
                    return respuestaServidor
                }
            },
            estadoSession: async () => {
                const transaccion = {
                    zona: "IDX/estado",
                }
                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                return respuestaServidor
            },
        },
        controladoresUI: {
            interrumpirTransicionVistas: () => {
                const main = document.querySelector("main")
                const pantallaCarga = document.querySelector("[ui=pantallaDeCarga]")
                main.removeAttribute("style")
                pantallaCarga?.remove()
            },
            eliminarTodasLasPropiedadesCSSMenosUna: (propiedadesArray) => {
                const elemento = document.querySelector("main");
                const propiedadesInline = elemento.style.cssText;
                const propiedadesFiltradas = propiedadesInline
                    .split(";")
                    .filter(propiedad => {
                        const [nombre] = propiedad.split(":");
                        return propiedadesArray.includes(nombre.trim());
                    })
                    .join(";");
                elemento.style.cssText = propiedadesFiltradas;
            },
            controlHorizontalVentana: () => {
                const currentWidth = window.innerWidth;
                const previousWidth = casaVitini.componentes.controladores.anchoActualVentanad
                if (currentWidth !== previousWidth) {
                    casaVitini.shell.controladoresUI.ocultarMenusVolatiles()
                } else {
                }
            },
            menuResponsivo: {
                despliege: function () {
                    selectorMenuFlotanteRenderizado = document.querySelector("[componente=menuGlobalFlotante]")
                    if (selectorMenuFlotanteRenderizado) {
                        selectorMenuFlotanteRenderizado.remove()
                    } else {
                        this.tranformaMenuARespontivo()
                        window.addEventListener("click", casaVitini.shell.controladoresUI.ocultaMenuGlobalFlotante)
                        window.addEventListener("resize", casaVitini.shell.controladoresUI.ocultaMenuGlobalFlotante)
                        window.addEventListener("scroll", casaVitini.shell.controladoresUI.ocultaMenuGlobalFlotante)
                    }
                },
                tranformaMenuARespontivo: function () {
                    const menu_selector = document.querySelector("[componente=menuGlobalFlotante]")
                    if (menu_selector) {
                        menu_selector.innerHTML = null
                    } else {
                        const menuFlotante = document.createElement("div")
                        menuFlotante.setAttribute("componente", "menuGlobalFlotante")
                        menuFlotante.classList.add("uiMenuGlobalResponsivo")
                        document.body.appendChild(menuFlotante)
                    }
                    this.renderizaMenuResponsivo()
                },
                renderizaMenuResponsivo: () => {
                    const menu_renderizado = document.querySelector("[componente=menuGlobalFlotante]")
                    const contenedorMenu = document.querySelector("[componente=contenedorMenu]")
                    const menuID = contenedorMenu.getAttribute("menuID")
                    const usuario = contenedorMenu.querySelector("[data=vitiniIDX]").textContent
                    const sobreControl = contenedorMenu?.getAttribute("sobreControl") === "activo" ? "sobreControl" : null
                    casaVitini.shell.navegacion.constructorMenuUI({
                        tipoMenu: menuID,
                        destino: "body [componente=menuGlobalFlotante]",
                        usuario: usuario,
                        origen: sobreControl
                    })
                    const menuRenderizado = menu_renderizado.querySelector("[estructura=menu]")
                    menuRenderizado.classList.add("estructuraVertical")
                    const zonasRenderizadas = menuRenderizado.querySelectorAll("[zona]")
                    zonasRenderizadas.forEach((zona) => zona.style.borderRadius = "12px")
                    const selectorEsfera = menu_renderizado.querySelector("[elemento=esfera]")
                    if (selectorEsfera) {
                        selectorEsfera.classList.remove("esferaUI_flotante")
                        selectorEsfera.classList.add("esferaUI_flotante_responsiva")
                    }
                    const zonaActual = document.querySelector("main").getAttribute("rama")
                    if (menu_renderizado.querySelector("[zona=" + zonaActual + "]")) {
                        menu_renderizado.querySelector("[zona=" + zonaActual + "]").style.background = "rgba(0, 0, 0, 0.6)"
                        menu_renderizado.querySelector("[zona=" + zonaActual + "]").style.color = "white"
                    }
                }
            },
            controladorEstadoIDX: async () => {
                const IDX = await casaVitini.shell.IDX.estadoSession()
                const estadoIDV = IDX?.estadoIDV || null
                const rolIDV = IDX?.rolIDV
                if (estadoIDV === "desconectado" || !estadoIDV) {
                    const navegacion = {
                        tipo: "publica",
                        estadoIDV: "desconectado",
                        origen: "controlador",
                        estadoIDV: estadoIDV
                    }
                    casaVitini.shell.navegacion.controladorNavegacion(navegacion)
                } else if (estadoIDV === "conectado" && (rolIDV === "administrador" || rolIDV === "empleado")) {
                    const navegacion = {
                        tipo: "panelControl",
                        usuario: IDX.usuario,
                        rolIDV: rolIDV,
                        estadoIDV: estadoIDV,
                        origen: "controlador"
                    }
                    casaVitini.shell.navegacion.controladorNavegacion(navegacion)
                } else if (estadoIDV === "conectado" && rolIDV === "cliente") {
                    const navegacion = {
                        tipo: "publica",
                        usuario: IDX.usuario,
                        rolIDV: rolIDV,
                        estadoIDV: estadoIDV,
                        origen: "controlador"
                    }
                    casaVitini.shell.navegacion.controladorNavegacion(navegacion)
                }
            },
            controlLogoScroll: (metadatos) => {
                const sectionUID = metadatos.sectionUID
                const elementoScroll = metadatos.elementoScroll
                if (!sectionUID) {
                    const mensaje = "Falta el sectionUID para determinar si el evento debe de crearse o eliminarse"
                    return casaVitini.ui.componentes.advertenciaInmersiva(mensaje)
                }
                const elemento = document.querySelector(`[instanciaUID="${sectionUID}"] ${elementoScroll}`)
                if (!elemento) {
                    document.querySelector(`[instanciaUID="${sectionUID}"] ${elementoScroll}`).removeEventListener("scroll", controladorEvento)
                    return
                }
                const logo = document.querySelector("[componente=logoCasaVitini]")
                const controladorEvento = (e) => {
                    e.stopPropagation()
                    const alturaScroll = e.target.scrollTop
                    if (alturaScroll > 10) {
                        logo.style.opacity = "0"
                        logo.style.pointerEvents = "none"
                    } else {
                        logo.style.opacity = "1"
                        logo.style.pointerEvents = "all"
                    }
                }
                elemento.addEventListener("scroll", controladorEvento)
            },
            restaurarMenu: (componente) => {
                componente.stopPropagation()
                let componenteID = componente.target
                if (componenteID.id !== "navegadorResponsivo" && componenteID.id !== "botonMenuResponsivo" && !componenteID.getAttribute("vista") && componenteID?.getAttribute("class") !== "contenedorMenu") {
                    casaVitini.shell.controladoresUI.menuResponsivo()
                }
            },
            ocultarMenusVolatiles: (menuVolatil) => {
                window.removeEventListener("resize", casaVitini.shell.controladoresUI.controlHorizontalVentana)
                window.removeEventListener("resize", casaVitini.shell.controladoresUI.ocultarMenusVolatiles)
                screen.orientation?.removeEventListener("change", casaVitini.shell.controladoresUI.ocultarMenusVolatiles);
                const componente = menuVolatil?.target?.getAttribute("componente") || null
                if (componente === "menuDesplegable") {
                    return
                }
                window.removeEventListener("click", casaVitini.shell.controladoresUI.ocultarMenusVolatiles)
                if (componente !== "menuVolatil") {
                    window.removeEventListener("click", casaVitini.shell.controladoresUI.ocultarMenusVolatiles)
                    const selectorMenusVolatiles = document.querySelectorAll("[componente=menuVolatil]")
                    selectorMenusVolatiles.forEach(menuVolatil => {
                        menuVolatil.remove()
                    })
                }
                const selectoresErrorUI = document.querySelectorAll("[componente=errorUI]")
                selectoresErrorUI.forEach((errorUI) => {
                    errorUI.remove()
                })
            },
            ocultarMenusVolatilesSimple: () => {
                window.removeEventListener("click", casaVitini.shell.controladoresUI.ocultarMenusVolatiles)
                window.removeEventListener("click", casaVitini.shell.controladoresUI.ocultarMenusVolatilesSimple)
                window.removeEventListener("resize", casaVitini.shell.controladoresUI.ocultarMenusVolatilesSimple)
                const selectorMenusVolatiles = document.querySelectorAll("[componente=menuVolatil]")
                selectorMenusVolatiles.forEach(menuVolatil => {
                    menuVolatil.remove()
                })
            },
            limpiarAdvertenciasInmersivas: () => {
                document.body.style.removeProperty("overflow")
                document.querySelectorAll("[componente=bloqueCalendario]").forEach((calendarioRenderizado) => {
                    calendarioRenderizado.remove()
                })
                document.querySelectorAll("[componente=advertenciaInmersiva]").forEach((advertenciaInmersiva) => {
                    advertenciaInmersiva.remove()
                })
            },
            limpiarTodoElementoFlotante: () => {
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                document.querySelectorAll("[componente=menuVolatil]").forEach((menuVolatil) => {
                    menuVolatil.remove()
                })
                document.querySelectorAll("[componente=advertenciaIntegrada]").forEach((menuVolatil) => {
                    menuVolatil.remove()
                })
                window.removeEventListener("click", casaVitini.shell.controladoresUI.ocultarMenusVolatiles)
                window.removeEventListener("click", casaVitini.shell.controladoresUI.ocultarMenusVolatilesSimple)
                window.removeEventListener("resize", casaVitini.shell.controladoresUI.controlHorizontalVentana)
                window.removeEventListener("resize", casaVitini.shell.controladoresUI.ocultarMenusVolatiles)
                document.removeEventListener("click", casaVitini.shell.controladoresUI.ocultarMenusVolatiles)
            },
            ocultarElementos: (e) => {
                if (e?.target) {
                    const botonDesplegarCalendario = e.target.closest("[boton=desplegarCalendario]")
                    if (botonDesplegarCalendario) {
                        return
                    }
                    const selectorFlotante = e.target.closest("[elemento]")?.getAttribute("elemento")
                    if (selectorFlotante === "flotante") {
                        return
                    }
                    const selectorParalizador = e.target.closest("[paralizadorEvento]")?.getAttribute("paralizadorEvento")
                    if (selectorParalizador === "ocultadorCalendarios") {
                        return
                    }
                }
                const bloqueCalendario = document.querySelectorAll("[componente=bloqueCalendario]")
                bloqueCalendario.forEach(calendarioRenderizado => {
                    calendarioRenderizado.remove()
                });
                document.removeEventListener("click", casaVitini.shell.controladoresUI.ocultarElementos)
            },
            controlGlobalScroll: () => {
                const selectorBloqueMenusGlobales = document.querySelector("[componente=marcoNavegacion]")
                const selectorLogo = document.querySelector("[componente=logoCasaVitini]")
                document.addEventListener('scroll', () => {
                    const selectorStyle = selectorLogo.style.filter
                    const mediaQuery = window.matchMedia('(max-width: 850px)');
                    document.querySelector("#navegadorResponsivo").style.removeProperty("display")
                    if (window.scrollY === 0) {
                        selectorBloqueMenusGlobales.classList.remove('globa_marcoNavegacion_desenfoque');
                        if (mediaQuery.matches && selectorStyle === "invert(0)") {
                            selectorLogo.style.filter = "invert(1)"
                        }
                    } else {
                        if (mediaQuery.matches && selectorStyle === "invert(1)") {
                            selectorLogo.style.filter = "invert(0)"
                        }
                        selectorBloqueMenusGlobales.classList.add('globa_marcoNavegacion_desenfoque');
                    }
                })
            },
            ocultaMenuGlobalFlotante: (e) => {
                const controlFlotante = e.type === "click" ?
                    e?.target?.getAttribute("controlFlotante") : null
                if (controlFlotante !== "cancelar") {
                    const selectorMenuFlotanteRenderizado = document.querySelector("[componente=menuGlobalFlotante]")
                    selectorMenuFlotanteRenderizado?.remove()
                    window.removeEventListener("click", casaVitini.shell.controladoresUI.ocultaMenuGlobalFlotante)
                    window.removeEventListener("resize", casaVitini.shell.controladoresUI.ocultaMenuGlobalFlotante)
                    window.removeEventListener("scroll", casaVitini.shell.controladoresUI.ocultaMenuGlobalFlotante)
                }
            },
            limpiarMain: () => {
                const selectorPantallaCargaRenderizdaPostPeticion = document.querySelector("[ui=pantallaDeCarga]")
                selectorPantallaCargaRenderizdaPostPeticion?.remove()
                const main = document.querySelector("main")
                document.querySelectorAll("html, #uiLogo, body, header, [componente=contenedorMenu], #botonMenuResponsivo")
                    .forEach((elementoReseteo) => {
                        elementoReseteo.removeAttribute("style")
                    })
                main.innerHTML = null
                main.removeAttribute("rama")
                main.removeAttribute("zonaCSS")
                main.removeAttribute("ui")
                casaVitini.shell.controladoresUI.eliminarTodasLasPropiedadesCSSMenosUna("opacity")
                main.style.transition = "opacity 250ms linear"
                main.style.opacity = "1"
            },
            iconosGlobales: {
                telefonoPublicoWhatsApp: async (data = {}) => {
                    const zonaIcono = data.zonaIcono
                    const respuestaServidor = await casaVitini.shell.servidor({
                        zona: "plaza/reservas/telefonoPublicoWhatsApp"
                    })
                    if (respuestaServidor?.error) {
                    } else if (respuestaServidor.ok) {
                        const telefonoPublicoWhatsApp = respuestaServidor.ok.telefonoPublicoWhatsApp
                        const selectorIconosGlobales = document.querySelector("header [componente=iconos]")
                        const seletorIconosRenderizado = selectorIconosGlobales.querySelector("[iconoGlobal=whatsApp]")
                        if (!seletorIconosRenderizado && telefonoPublicoWhatsApp.length > 0) {
                            const whatsAppIcono = "/activos/iconos/whatsapp-icono.svg"
                            const contenedor = document.createElement("a")
                            contenedor.setAttribute("iconoGlobal", "whatsApp")
                            contenedor.setAttribute("zona", zonaIcono)
                            contenedor.classList.add("efectoAparicion")
                            contenedor.style.backgroundImage = `url('${whatsAppIcono}')`;
                            contenedor.style.backgroundSize = `cover`;
                            contenedor.style.height = `30px`;
                            contenedor.style.width = `30px`;
                            contenedor.target = "_blank"
                            contenedor.href = `https://wa.me/${telefonoPublicoWhatsApp}`
                            selectorIconosGlobales.appendChild(contenedor)
                        }
                    }
                }
            },
            limpiezaUI: (data = {}) => {
                const main = document.querySelector("main")
                const zonaDestino = data?.zonaDestino
                casaVitini.view?.volatilObservers?.parallaxControlador?.destroy()
                const observersObserving = casaVitini?.view?.__observers__ || {};
                Object.keys(observersObserving).forEach(o => {
                    casaVitini.view.__observers__[o].disconnect()
                })
                window.removeEventListener("resize", casaVitini.view?.volatilObservers?.parallaxControlador?.resizeIsDone);
                window.removeEventListener('scroll', casaVitini.view?.scrollHandler);
                window.removeEventListener('scroll', casaVitini.view?.controladorIconoMouse);
                window.removeEventListener("resize", casaVitini.shell.controladoresUI.controlHorizontalVentana)
                screen.orientation?.removeEventListener("change", casaVitini.shell.controladoresUI.ocultarMenusVolatiles);
                document.querySelectorAll("html, #uiLogo, body, header, [componente=contenedorMenu], [componente=botonMenuResponsivo]")
                    .forEach((e) => {
                        e.removeAttribute("style")
                    })
                main.removeAttribute("zonaCSS")
                main.removeAttribute("ui")
                const iconosGlobalesRenderizados = document.querySelectorAll("header [componente=iconos] [iconoGlobal]")
                iconosGlobalesRenderizados.forEach((icono) => {
                    const zonaDelIcono = icono.getAttribute("zona")
                    if (zonaDelIcono !== zonaDestino) {
                        icono?.remove()
                    }
                })
                const menu_renderizado = document.querySelector("[componente=contenedorMenu]")
                menu_renderizado.querySelectorAll("[tipoMenu=volatil]").forEach((menu) => {
                    menu.removeAttribute("style")
                })
            }
        },
        servidor: async function (transaccion) {
            const puerto = '/puerto';
            const peticion = {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(transaccion)
            };
            try {
                const servidor = await fetch(puerto, peticion);
                const respuestaServidor = await servidor.json();
                if (!respuestaServidor) {
                    this.controladoresUI.interrumpirTransicionVistas()
                    return casaVitini.ui.componentes.errorUI()
                } else if (respuestaServidor.tipo === "IDX") {
                    casaVitini.componentes.loginUI()
                    return respuestaServidor
                } else if (respuestaServidor.tipo === "ROL") {
                    this.controladoresUI.interrumpirTransicionVistas()
                    const mensaje = "Tu VitiniID no esta autorizado a realizar esta operación."
                    casaVitini.ui.componentes.advertenciaInmersiva(mensaje)
                    return respuestaServidor
                } else if (respuestaServidor.codigo === "mantenimiento") {
                    casaVitini.shell.controladoresUI.limpiarMain()
                    this.controladoresUI.interrumpirTransicionVistas()
                    const mensaje = respuestaServidor.error
                    return casaVitini.ui.componentes.mensajeSimple({
                        titulo: "Casa Vitini ahora mismo no esta disponible",
                        descripcion: mensaje,
                        mensajeUID: "temporalyNotAvaible"
                    })
                } else if (respuestaServidor?.error === "noExisteLaVista") {
                    casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                    casaVitini.shell.controladoresUI.limpiarMain()
                    return casaVitini.ui.componentes.urlDesconocida()
                } else {
                    return respuestaServidor
                }
            } catch (errorCapturado) {
                this.controladoresUI.interrumpirTransicionVistas()
                if (errorCapturado.name === 'AbortError') {
                }
                if (errorCapturado instanceof TypeError) {
                    return casaVitini.ui.componentes.errorUI()
                }
            }
        },
    },
    ui: {
        componentes: {
            errorUI: () => {
                const selectorContenedorError = document.querySelector(`[identificadorVisual=errorConexion]`)
                if (selectorContenedorError) {
                    return
                }
                document.querySelectorAll("[tipoMenu=volatil]").forEach((menu) => {
                    menu.removeAttribute("style")
                })
                casaVitini.shell.controladoresUI.limpiarTodoElementoFlotante()
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const mensaje = "Se ha producido un error en la red y no se ha podido comunicar con el servidor. Si es por una causa circunstancial de la red, reinténtalo y debería funcionar. Comprueba que tienes acceso a la red. El estado de la experiencia se ha detenido, pero no se ha perdido. Los datos que tengas escritos en algún campo de texto o contenido pendiente de envío sigue tras esta pantalla de información."
                const advertenciaInmersivaUI = document.createElement("div")
                advertenciaInmersivaUI.setAttribute("class", "advertenciaInmersivaSuperpuesta")
                advertenciaInmersivaUI.setAttribute("identificadorVisual", "errorConexion")
                advertenciaInmersivaUI.setAttribute("pantallaSuperpuesta", "pantallaCargaSuperpuesta")
                advertenciaInmersivaUI.setAttribute("componente", "advertenciaInmersiva")
                advertenciaInmersivaUI.setAttribute("instanciaUID", instanciaUID)
                const marcoElastico = document.createElement("div")
                marcoElastico.classList.add("marcoElasticoError")
                const info = document.createElement("div")
                info.classList.add("advertenciaInfoFlujoPago")
                info.setAttribute("componente", "mensajeFlujoPasarela")
                info.textContent = mensaje
                marcoElastico.appendChild(info)
                const boton = document.createElement("div")
                boton.classList.add("botonV1")
                boton.setAttribute("componente", "botonV1")
                boton.textContent = "Cerrar y volver"
                boton.addEventListener("click", (e) => {
                    const rama = document.querySelector("main").getAttribute("rama")
                    const controladorZona = {
                        zona: rama
                    }
                    casaVitini.shell.navegacion.controladorNavegacion(controladorZona)
                    document.body.style.removeProperty("overflow");
                    e.target.parentNode.parentNode.remove()
                })
                marcoElastico.appendChild(boton)
                advertenciaInmersivaUI.appendChild(marcoElastico)
                document.querySelector("main").appendChild(advertenciaInmersivaUI)
            },
            urlDesconocida: function () {
                const main = document.querySelector("main")
                main.innerHTML = null
                const info = document.createElement("div")
                info.classList.add(
                    "textoCentrado",
                    "negrita",
                    "padding12"
                )
                info.textContent = "No existe nada en esta dirección :)"
                main.appendChild(info)
                const boton = document.createElement("a")
                boton.classList.add(
                    "botonV1",
                    "comportamientoBoton",
                    "areaSinDecoracionPredeterminada",
                    "margin10"
                )
                boton.textContent = "Ir a Administración"
                boton.setAttribute("href", "/administracion")
                boton.setAttribute("vista", "/administracion")
                boton.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                main.appendChild(boton)
            },
            errorRenderizacionVista: function () {
                casaVitini.shell.controladoresUI.limpiarMain()
                const main = document.querySelector("main")
                main.innerHTML = null
                const info = document.createElement("div")
                info.classList.add(
                    "textoCentrado",
                    "negrita",
                    "padding12"
                )
                info.textContent = "Se ha producido un error al renderizar la vista :)"
                main.appendChild(info)
            },
            errorVista: () => {
                let selectoresVistas = document.querySelectorAll("[vista")
                for (const vista of selectoresVistas) {
                    vista.style.backgroundColor = ""
                    vista.style.color = ""
                }
                let constructorSeccion = document.createElement("section")
                constructorSeccion.style.scale = "1";
                let vistaError = document.createElement("p")
                vistaError.setAttribute("id", "errorVista")
                vistaError.textContent = "Error, no se ha podido comunicar con el servidor. Reintentalo"
                vistaError.style.position = "relative"
                constructorSeccion.appendChild(vistaError);
                document.body.appendChild(constructorSeccion)
                document.getElementById("uiNavegacion").setAttribute("vistaActual", "error")
                document.getElementById("uiNavegacion").removeAttribute("arranqueVolatil")
                let espacio = document.body;
                espacio.style.background = ""
                espacio.style.backgroundSize = "cover"
                espacio.style.backgroundColor = "grey"
                let estado = {
                    zona: "Error",
                    "EstadoInternoZona": "estado"
                }
                let titulo = "Error"
            },
            advertenciaInmersiva: (advertencia) => {
                document.body.style.overflow = 'hidden';
                const advertenciaInmersivaUI = document.createElement("dialog")
                advertenciaInmersivaUI.setAttribute("class", "errorUI")
                advertenciaInmersivaUI.setAttribute("componente", "advertenciaInmersiva")
                const contenedorAdvertenciaInmersiva = document.createElement("div")
                contenedorAdvertenciaInmersiva.classList.add("contenedorAdvertencaiInmersiva")
                advertenciaInmersivaUI.appendChild(contenedorAdvertenciaInmersiva)
                const contenidoAdvertenciaInmersiva = document.createElement("div")
                contenidoAdvertenciaInmersiva.classList.add("contenidoAdvertenciaInmersiva")
                contenidoAdvertenciaInmersiva.setAttribute("contenedor", "contenidoAdvertenciaInmersiva")
                contenidoAdvertenciaInmersiva.setAttribute("destino", "inyector")
                contenidoAdvertenciaInmersiva.setAttribute("componente", "contenedor")
                contenedorAdvertenciaInmersiva.appendChild(contenidoAdvertenciaInmersiva)
                const info = document.createElement("div")
                info.classList.add(
                    "textoCentrado"
                )
                info.textContent = advertencia
                contenidoAdvertenciaInmersiva.appendChild(info)
                const boton = document.createElement("div")
                boton.setAttribute("class", "botonV1")
                boton.textContent = "Aceptar"
                boton.addEventListener("click", casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas)
                contenidoAdvertenciaInmersiva.appendChild(boton)
                document.querySelector("main").appendChild(advertenciaInmersivaUI)
            },
            advertenciaInmersivaSuperPuesta: (advertencia) => {
                const advertenciaInmersivaUI = document.createElement("div")
                advertenciaInmersivaUI.setAttribute("class", "advertenciaInmersivaSuperpuesta")
                advertenciaInmersivaUI.setAttribute("componente", "advertenciaInmersiva")
                const contenedorAdvertenciaInmersiva = document.createElement("div")
                contenedorAdvertenciaInmersiva.classList.add("contenedorAdvertencaiInmersiva")
                advertenciaInmersivaUI.appendChild(contenedorAdvertenciaInmersiva)
                const contenidoAdvertenciaInmersiva = document.createElement("div")
                contenidoAdvertenciaInmersiva.classList.add("contenidoAdvertenciaInmersiva")
                contenidoAdvertenciaInmersiva.setAttribute("contenedor", "contenidoAdvertenciaInmersiva")
                contenidoAdvertenciaInmersiva.setAttribute("destino", "inyector")
                contenidoAdvertenciaInmersiva.setAttribute("componente", "contenedor")
                contenedorAdvertenciaInmersiva.appendChild(contenidoAdvertenciaInmersiva)
                const info = document.createElement("div")
                info.classList.add(
                    "textoCentrado"
                )
                info.textContent = advertencia
                contenidoAdvertenciaInmersiva.appendChild(info)
                const boton = document.createElement("div")
                boton.setAttribute("class", "botonV1")
                boton.textContent = "Aceptar"
                boton.addEventListener("click", (e) => {
                    e.target.closest("[componente=advertenciaInmersiva]")?.remove()
                })
                contenidoAdvertenciaInmersiva.appendChild(boton)
                document.body.appendChild(advertenciaInmersivaUI)
            },
            pantallaDeCargaSuperPuesta: (metadatos) => {
                try {
                    const instanciaUID = metadatos.instanciaUID
                    const mensaje = metadatos.mensaje ? metadatos.mensaje : "Espere..."
                    const botonCancelar = metadatos.botonCancelar ? metadatos.botoCancelar : "mostrar"
                    const identificadorVisual = metadatos.identificadorVisual
                    const iconoSpinner = metadatos.iconoSpinner ? metadatos.iconoSpinner : "si"
                    const textoBoton = metadatos.textoBoton ? metadatos.textoBoton : "Cancelar"
                    const advertenciaInmersivaUI = document.createElement("div")
                    advertenciaInmersivaUI.setAttribute("class", "advertenciaInmersivaSuperpuesta")
                    advertenciaInmersivaUI.setAttribute("identificadorVisual", identificadorVisual)
                    advertenciaInmersivaUI.setAttribute("pantallaSuperpuesta", "pantallaCargaSuperpuesta")
                    advertenciaInmersivaUI.setAttribute("componente", "advertenciaInmersiva")
                    advertenciaInmersivaUI.setAttribute("instanciaUID", instanciaUID)
                    const marcoElastico = document.createElement("div")
                    marcoElastico.classList.add("marcoElasticoCarga")
                    if (iconoSpinner === "si") {
                        const spinnerContainer = document.createElement('div');
                        spinnerContainer.setAttribute("componente", "iconoCargaEnlace");
                        spinnerContainer.classList.add("lds-spinner");
                        for (let i = 0; i < 12; i++) {
                            const div = document.createElement('div');
                            spinnerContainer.appendChild(div);
                        }
                        marcoElastico.appendChild(spinnerContainer)
                    }
                    const info = document.createElement("div")
                    info.setAttribute("class", "advertenciaInfoFlujoPago")
                    info.setAttribute("componente", "mensajeFlujoPasarela")
                    info.textContent = mensaje
                    marcoElastico.appendChild(info)
                    const boton = document.createElement("div")
                    boton.setAttribute("class", "botonV1")
                    boton.setAttribute("componente", "botonV1")
                    boton.textContent = textoBoton
                    boton.addEventListener("click", (e) => {
                        document.body.style.removeProperty("overflow");
                        e.target.parentNode.parentNode.remove()
                    })
                    if (botonCancelar === "mostrar") {
                        marcoElastico.appendChild(boton)
                    }
                    advertenciaInmersivaUI.appendChild(marcoElastico)
                    document.querySelector("main").appendChild(advertenciaInmersivaUI)
                } catch (errorCapturado) {
                    casaVitini.ui.componentes.advertenciaInmersiva(errorCapturado.message)
                }
            },
            totales: (desgloseFinanciero) => {
                const totalesPorApartamento = desgloseFinanciero.totalesPorApartamento
                const totalesPorNoche = desgloseFinanciero.totalesPorNoche
                const totales = desgloseFinanciero.totales
                const desgloseImpuestos = desgloseFinanciero.impuestos
                const ofertas = desgloseFinanciero.ofertas
                const destino = desgloseFinanciero.destino
                const selectorDestino = document.querySelector(destino)
                if (!selectorDestino) {
                    const error = "Totales, no encuentra el elemento de destino. Revisa el identificador del elemento."
                    return casaVitini.ui.componentes.advertenciaInmersiva(error)
                }
                const simboloDescuento = {
                    porcentaje: "%",
                    cantidadFija: "$"
                }
                const contenedorDesgloseTotales = document.createElement("div")
                contenedorDesgloseTotales.classList.add(
                    "flexVertical",
                    "gap6"
                )
                const detallePorDiaUI = document.createElement("div")
                detallePorDiaUI.classList.add("reserva_resumen_desglose_pago_bloque")
                const detalleDiaUITitulo = document.createElement("div")
                detalleDiaUITitulo.classList.add("reserva_resumen_desglose_pago_titulo")
                detalleDiaUITitulo.textContent = "Detalle por noche"
                detallePorDiaUI.appendChild(detalleDiaUITitulo)
                const contenedorDesglosePorNoche = document.createElement("div")
                contenedorDesglosePorNoche.classList.add("reserva_resumen_desglose_porNoche")
                if (totalesPorNoche.length === 0) {
                    const info = document.createElement("div")
                    info.classList.add("componentes_ui_totales_mensajeInfoSinInformacion")
                    info.textContent = "No hay información financiera para desglosar por noche"
                    contenedorDesglosePorNoche.appendChild(info)
                }
                for (const detallePorNoche of totalesPorNoche) {
                    const fechaNoche = detallePorNoche.fechaDiaConNoche
                    const precioNetoNoche = detallePorNoche.precioNetoNoche
                    const apartamentosDetallesPorNoche = detallePorNoche.apartamentos
                    const apartamentoUI_ = document.createElement("div")
                    apartamentoUI_.classList.add("contenedorDiaConNoche")
                    const apartamentoUITitulo = document.createElement("div")
                    apartamentoUITitulo.classList.add("reserva_resumen_apartamentoIUTitulo")
                    apartamentoUITitulo.classList.add("negrita")
                    apartamentoUITitulo.textContent = fechaNoche
                    apartamentoUI_.appendChild(apartamentoUITitulo)
                    const totalNetoNocheUI = document.createElement("div")
                    totalNetoNocheUI.classList.add("reserva_resumen_apartamentoIUTitulo")
                    totalNetoNocheUI.classList.add("negrita")
                    totalNetoNocheUI.textContent = precioNetoNoche + "$ Total neto noche"
                    apartamentoUI_.appendChild(totalNetoNocheUI)
                    for (const detalleApartmentoPorNoche of apartamentosDetallesPorNoche) {
                        const apartamentoUI = detalleApartmentoPorNoche.apartamentoUI
                        const precioNetoPorNoche = detalleApartmentoPorNoche.precioNetoNoche
                        const detalleApartamentosUITitulo = document.createElement("div")
                        detalleApartamentosUITitulo.classList.add("reserva_resumen_apartamentoUIPrecio")
                        detalleApartamentosUITitulo.classList.add("negrita")
                        detalleApartamentosUITitulo.classList.add("colorGris")
                        detalleApartamentosUITitulo.textContent = apartamentoUI
                        apartamentoUI_.appendChild(detalleApartamentosUITitulo)
                        const detalleApartamentosUIPreciNetoNoche = document.createElement("div")
                        detalleApartamentosUIPreciNetoNoche.classList.add("reserva_resumen_apartamentoUIPrecio")
                        detalleApartamentosUIPreciNetoNoche.textContent = precioNetoPorNoche + "$ / Neto por noche"
                        apartamentoUI_.appendChild(detalleApartamentosUIPreciNetoNoche)
                    }
                    contenedorDesglosePorNoche.appendChild(apartamentoUI_)
                }
                detallePorDiaUI.appendChild(contenedorDesglosePorNoche)
                contenedorDesgloseTotales.appendChild(detallePorDiaUI)
                const contenedorTotalesPorApartamento = document.createElement("div")
                contenedorTotalesPorApartamento.classList.add("reserva_resumen_desglose_porNoche")
                const alojamientoUI = document.createElement("div")
                alojamientoUI.classList.add("reserva_resumen_desglose_pago_bloque")
                const alojamientoUITitulo = document.createElement("div")
                alojamientoUITitulo.classList.add("reserva_resumen_desglose_pago_titulo")
                alojamientoUITitulo.textContent = "Precio total neto por apartamento"
                alojamientoUI.appendChild(alojamientoUITitulo)
                if (totalesPorApartamento.length === 0) {
                    const info = document.createElement("div")
                    info.classList.add("componentes_ui_totales_mensajeInfoSinInformacion")
                    info.textContent = "No hay información financiera para desglosar por apartamento"
                    alojamientoUI.appendChild(info)
                }
                for (const detalleDesglosePorApartamento of totalesPorApartamento) {
                    const apartamentoUI_ = detalleDesglosePorApartamento.apartamentoUI
                    const totalNetoApartamento = detalleDesglosePorApartamento.totalNetoRango
                    const precioNetoMedioPorNoche = detalleDesglosePorApartamento.precioMedioNocheRango
                    const apartamentoUI = document.createElement("div")
                    apartamentoUI.classList.add("contenedorApartamento")
                    const apartamentoUITitulo = document.createElement("div")
                    apartamentoUITitulo.classList.add("contenedorTextoOferta")
                    apartamentoUITitulo.classList.add("negrita")
                    apartamentoUITitulo.textContent = apartamentoUI_
                    apartamentoUI.appendChild(apartamentoUITitulo)
                    const apartamentoUIPrecioNetoTotal = document.createElement("div")
                    apartamentoUIPrecioNetoTotal.classList.add("textoDetallesPorApartamento")
                    apartamentoUIPrecioNetoTotal.textContent = "Total neto: " + totalNetoApartamento + "$"
                    apartamentoUI.appendChild(apartamentoUIPrecioNetoTotal)
                    const apartamentoUIPrecioPromedioPorNoche = document.createElement("div")
                    apartamentoUIPrecioPromedioPorNoche.classList.add("textoDetallesPorApartamento")
                    apartamentoUIPrecioPromedioPorNoche.textContent = "Precio medio neto por noche: " + precioNetoMedioPorNoche + "$"
                    apartamentoUI.appendChild(apartamentoUIPrecioPromedioPorNoche)
                    alojamientoUI.appendChild(apartamentoUI)
                }
                contenedorTotalesPorApartamento.appendChild(alojamientoUI)
                contenedorDesgloseTotales.appendChild(contenedorTotalesPorApartamento)
                let controlContenido = "noDesplegar"
                const ofertasUI = document.createElement("div")
                ofertasUI.classList.add("reserva_resumen_desglose_pago_bloque")
                const ofertasUITitulo = document.createElement("div")
                ofertasUITitulo.classList.add("reserva_resumen_desglose_pago_titulo")
                ofertasUITitulo.textContent = "Ofertas aplicadas"
                ofertasUI.appendChild(ofertasUITitulo)
                for (const oferta of ofertas) {
                    const porNumeroDeApartamentos = oferta.porNumeroDeApartamentos
                    const porApartamentosEspecificos = oferta.porApartamentosEspecificos
                    const porDiasDeReserva = oferta.porDiasDeReserva
                    const porRangoDeFechas = oferta.porRangoDeFechas
                    const porDiasDeAntelacion = oferta.porDiasDeAntelacion
                    if (porNumeroDeApartamentos?.length) {
                        controlContenido = "desplegar"
                        const contenedorOfertaUI = document.createElement("div")
                        contenedorOfertaUI.classList.add("compomentes_ui_totales_ofertas_contenedorConjuntoOferta")
                        for (const detallesReserva of oferta.porNumeroDeApartamentos) {
                            const contenedorIndividualOferta = document.createElement("div")
                            contenedorIndividualOferta.classList.add("compomentes_ui_totales_ofertas_contenedorOferta")
                            const cantidad = detallesReserva.cantidad
                            const tipoDescuento = detallesReserva.tipoDescuento
                            const definicion = detallesReserva.definicion
                            const nombreOferta = detallesReserva.nombreOferta
                            const descuento = detallesReserva.descuento
                            let nombreOfertaUI = document.createElement("div")
                            nombreOfertaUI.classList.add("contenedorTextoOferta")
                            nombreOfertaUI.classList.add("negrita")
                            nombreOfertaUI.textContent = nombreOferta
                            contenedorIndividualOferta.appendChild(nombreOfertaUI)
                            const definicionOfertaUI = document.createElement("div")
                            definicionOfertaUI.classList.add("contenedorTextoOferta")
                            definicionOfertaUI.textContent = definicion
                            contenedorIndividualOferta.appendChild(definicionOfertaUI)
                            if (tipoDescuento === "porcentaje") {
                                const tipoDescuentoUI = document.createElement("div")
                                tipoDescuentoUI.classList.add("contenedorTextoOferta")
                                tipoDescuentoUI.textContent = "Descuento del " + cantidad + simboloDescuento[tipoDescuento] + " rebajando el neto de la reserva en " + descuento + "$"
                                contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                            }
                            if (tipoDescuento === "cantidadFija") {
                                const tipoDescuentoUI = document.createElement("div")
                                tipoDescuentoUI.classList.add("contenedorTextoOferta")
                                tipoDescuentoUI.textContent = "Descuento del " + cantidad + simboloDescuento[tipoDescuento] + " sobre el neto de la reserva"
                                contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                            }
                            contenedorOfertaUI.appendChild(contenedorIndividualOferta)
                        }
                        ofertasUI.appendChild(contenedorOfertaUI)
                    }
                    if (porApartamentosEspecificos?.length) {
                        controlContenido = "desplegar"
                        const contenedorOfertaUI = document.createElement("div")
                        contenedorOfertaUI.classList.add("compomentes_ui_totales_ofertas_contenedorConjuntoOferta")
                        for (const detallesOferta of oferta.porApartamentosEspecificos) {
                            const nombreOferta = detallesOferta.nombreOferta
                            const cantidad = detallesOferta.cantidad
                            const tipoDescuento = detallesOferta.tipoDescuento
                            const definicion = detallesOferta.definicion
                            const descuentoOferta = detallesOferta.descuentoOferta
                            const descuentoAplicadoA = detallesOferta.descuentoAplicadoA
                            const contenedorIndividualOferta = document.createElement("div")
                            contenedorIndividualOferta.classList.add("compomentes_ui_totales_ofertas_contenedorOferta")
                            const nombreOfertaUI = document.createElement("div")
                            nombreOfertaUI.classList.add("contenedorTextoOferta")
                            nombreOfertaUI.classList.add("negrita")
                            nombreOfertaUI.textContent = nombreOferta
                            contenedorIndividualOferta.appendChild(nombreOfertaUI)
                            const definicionOfertaUI = document.createElement("div")
                            definicionOfertaUI.classList.add("contenedorTextoOferta")
                            definicionOfertaUI.textContent = definicion
                            contenedorIndividualOferta.appendChild(definicionOfertaUI)
                            if (descuentoAplicadoA === "totalNetoApartamentoDedicado") {
                                const apartamentosEspecificos = detallesOferta.apartamentosEspecificos
                                const contenedorApartamentosEspecificos = document.createElement("div")
                                contenedorApartamentosEspecificos.classList.add("componentes_ui_totales_ofertas_apartamentosEspecificos_contenedor")
                                for (const detallesApartamento of apartamentosEspecificos) {
                                    const apartamentoIDV = detallesApartamento.apartamentoIDV
                                    const apartamentoUI = detallesApartamento.apartamentoUI
                                    const tipoDescuento = detallesApartamento.tipoDescuento
                                    const cantidad = detallesApartamento.cantidad
                                    const descuento = detallesApartamento.descuento
                                    const bloqueDetalleOferta = document.createElement("div")
                                    bloqueDetalleOferta.classList.add("resumen_reserva_detalle_oferta_apartamentos_especificos")
                                    const tituloApartamentoUI = document.createElement("div")
                                    tituloApartamentoUI.classList.add("negrita")
                                    tituloApartamentoUI.innerHTML = apartamentoUI
                                    bloqueDetalleOferta.appendChild(tituloApartamentoUI)
                                    const tipoDescuentoApartamentoUI = document.createElement("div")
                                    tipoDescuentoApartamentoUI.textContent = tipoDescuento
                                    const cantidadPorApartmento = document.createElement("div")
                                    cantidadPorApartmento.textContent = "Descuento: " + cantidad + simboloDescuento[tipoDescuento]
                                    bloqueDetalleOferta.appendChild(cantidadPorApartmento)
                                    contenedorApartamentosEspecificos.appendChild(bloqueDetalleOferta)
                                }
                                contenedorIndividualOferta.appendChild(contenedorApartamentosEspecificos)
                            }
                            if (descuentoAplicadoA === "totalNetoReserva") {
                                const descuentoOfertaUI = document.createElement("div")
                                descuentoOfertaUI.classList.add("contenedorTextoOferta")
                                descuentoOfertaUI.textContent = descuentoOferta
                                contenedorIndividualOferta.appendChild(descuentoOfertaUI)
                                if (tipoDescuento === "porcentaje") {
                                    const tipoDescuentoUI = document.createElement("div")
                                    tipoDescuentoUI.classList.add("contenedorTextoOferta")
                                    tipoDescuentoUI.textContent = "Descuento: " + cantidad + simboloDescuento[tipoDescuento]
                                    contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                                }
                                if (tipoDescuento === "cantidadFija") {
                                    const tipoDescuentoUI = document.createElement("div")
                                    tipoDescuentoUI.classList.add("contenedorTextoOferta")
                                    tipoDescuentoUI.textContent = "Descuento: " + cantidad + simboloDescuento[tipoDescuento]
                                    contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                                }
                            }
                            contenedorOfertaUI.appendChild(contenedorIndividualOferta)
                        }
                        ofertasUI.appendChild(contenedorOfertaUI)
                    }
                    if (porDiasDeReserva?.length) {
                        controlContenido = "desplegar"
                        const contenedorOfertaUI = document.createElement("div")
                        contenedorOfertaUI.classList.add("compomentes_ui_totales_ofertas_contenedorConjuntoOferta")
                        for (const detatllesReserva of oferta.porDiasDeReserva) {
                            const cantidad = detatllesReserva.cantidad
                            const tipoDescuento = detatllesReserva.tipoDescuento
                            const nombreOferta = detatllesReserva.nombreOferta
                            const numero = detatllesReserva.numero
                            const simboloNumero = detatllesReserva.simboloNumero
                            const definicion = detatllesReserva.definicion
                            const descuento = detatllesReserva.descuento
                            const contenedorIndividualOferta = document.createElement("div")
                            contenedorIndividualOferta.classList.add("compomentes_ui_totales_ofertas_contenedorOferta")
                            const nombreOfertaUI = document.createElement("div")
                            nombreOfertaUI.classList.add("contenedorTextoOferta")
                            nombreOfertaUI.classList.add("negrita")
                            nombreOfertaUI.textContent = nombreOferta
                            contenedorIndividualOferta.appendChild(nombreOfertaUI)
                            const definicionUI = document.createElement("div")
                            definicionUI.classList.add("contenedorTextoOferta")
                            definicionUI.textContent = definicion
                            contenedorIndividualOferta.appendChild(definicionUI)
                            if (tipoDescuento === "porcentaje") {
                                const tipoDescuentoUI = document.createElement("div")
                                tipoDescuentoUI.classList.add("contenedorTextoOferta")
                                tipoDescuentoUI.textContent = "Descuento: " + cantidad + simboloDescuento[tipoDescuento] + " rebajando el neto de la reserva en " + descuento + "$"
                                contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                            }
                            if (tipoDescuento === "cantidadFija") {
                                const tipoDescuentoUI = document.createElement("div")
                                tipoDescuentoUI.classList.add("contenedorTextoOferta")
                                tipoDescuentoUI.textContent = "Descuento: " + cantidad + simboloDescuento[tipoDescuento]
                                contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                            }
                            const definicionOfertaUI = document.createElement("div")
                            definicionOfertaUI.classList.add("contenedorTextoOferta")
                            definicionOfertaUI.textContent = definicion
                            contenedorOfertaUI.appendChild(contenedorIndividualOferta)
                        }
                        ofertasUI.appendChild(contenedorOfertaUI)
                    }
                    if (porRangoDeFechas?.length) {
                        controlContenido = "desplegar"
                        const contenedorOfertaUI = document.createElement("div")
                        contenedorOfertaUI.classList.add("compomentes_ui_totales_ofertas_contenedorConjuntoOferta")
                        for (const detallesOferta of oferta.porRangoDeFechas) {
                            const cantidad = detallesOferta.cantidad
                            const tipoDescuento = detallesOferta.tipoDescuento
                            const definicion = detallesOferta.definicion
                            const nombreOferta = detallesOferta.nombreOferta
                            const diasAfectados = detallesOferta.diasAfectados
                            const descuento = detallesOferta.descuento
                            const contenedorIndividualOferta = document.createElement("div")
                            contenedorIndividualOferta.classList.add("compomentes_ui_totales_ofertas_contenedorOferta")
                            const nombreOfertaUI = document.createElement("div")
                            nombreOfertaUI.classList.add("contenedorTextoOferta")
                            nombreOfertaUI.classList.add("negrita")
                            nombreOfertaUI.textContent = nombreOferta
                            contenedorIndividualOferta.appendChild(nombreOfertaUI)
                            const definicionOfertaUI = document.createElement("div")
                            definicionOfertaUI.classList.add("contenedorTextoOferta")
                            definicionOfertaUI.textContent = definicion
                            contenedorIndividualOferta.appendChild(definicionOfertaUI)
                            const tipoDescuentoUI = document.createElement("div")
                            tipoDescuentoUI.classList.add("contenedorTextoOferta")
                            tipoDescuentoUI.textContent = "Descuento total de la oferta: " + descuento + "$"
                            contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                            const contenedorDiasEspecificos = document.createElement("div")
                            contenedorDiasEspecificos.classList.add("componentes_ui_totales_ofertas_diasEspecificos_contenedor")
                            for (const detalleDelDia of diasAfectados) {
                                const dia = detalleDelDia.dia
                                const totaDiaNetoConOferta = detalleDelDia.totaDiaNetoConOferta
                                const descuento = detalleDelDia.descuento
                                const bloque = document.createElement("div")
                                bloque.classList.add("resumen_reserva_detalle_oferta_apartamentos_especificos")
                                const tituloUI = document.createElement("div")
                                tituloUI.classList.add("negrita")
                                tituloUI.innerHTML = dia
                                bloque.appendChild(tituloUI)
                                const totalSinOferta = document.createElement("div")
                                totalSinOferta.textContent = "Total día con oferta: " + totaDiaNetoConOferta + "$"
                                bloque.appendChild(totalSinOferta)
                                const totalConOferta = document.createElement("div")
                                totalConOferta.textContent = "Descuento: " + descuento + "$"
                                bloque.appendChild(totalConOferta)
                                contenedorDiasEspecificos.appendChild(bloque)
                            }
                            contenedorIndividualOferta.appendChild(contenedorDiasEspecificos)
                            contenedorOfertaUI.appendChild(contenedorIndividualOferta)
                        }
                        ofertasUI.appendChild(contenedorOfertaUI)
                    }
                    if (porDiasDeAntelacion?.length) {
                        controlContenido = "desplegar"
                        const contenedorOfertaUI = document.createElement("div")
                        contenedorOfertaUI.classList.add("compomentes_ui_totales_ofertas_contenedorConjuntoOferta")
                        for (const detallesOferta of oferta.porDiasDeAntelacion) {
                            const cantidad = detallesOferta.cantidad
                            const tipoDescuento = detallesOferta.tipoDescuento
                            const definicion = detallesOferta.definicion
                            const nombreOferta = detallesOferta.nombreOferta
                            const descuento = detallesOferta.descuento
                            const contenedorIndividualOferta = document.createElement("div")
                            contenedorIndividualOferta.classList.add("compomentes_ui_totales_ofertas_contenedorOferta")
                            const nombreOfertaUI = document.createElement("div")
                            nombreOfertaUI.classList.add("contenedorTextoOferta")
                            nombreOfertaUI.classList.add("negrita")
                            nombreOfertaUI.textContent = nombreOferta
                            contenedorIndividualOferta.appendChild(nombreOfertaUI)
                            const definicionOfertaUI = document.createElement("div")
                            definicionOfertaUI.classList.add("contenedorTextoOferta")
                            definicionOfertaUI.textContent = definicion
                            contenedorIndividualOferta.appendChild(definicionOfertaUI)
                            if (tipoDescuento === "porcentaje") {
                                const tipoDescuentoUI = document.createElement("div")
                                tipoDescuentoUI.classList.add("contenedorTextoOferta")
                                tipoDescuentoUI.textContent = "Descuento del " + cantidad + "% sobre el neto de la reserva."
                                contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                            }
                            if (tipoDescuento === "cantidadFija") {
                                const tipoDescuentoUI = document.createElement("div")
                                tipoDescuentoUI.classList.add("contenedorTextoOferta")
                                tipoDescuentoUI.textContent = "Descuento de " + cantidad + "$ sobre el neto de la reserva"
                                contenedorIndividualOferta.appendChild(tipoDescuentoUI)
                            }
                            contenedorOfertaUI.appendChild(contenedorIndividualOferta)
                        }
                        ofertasUI.appendChild(contenedorOfertaUI)
                    }
                }
                if (controlContenido === "desplegar") {
                    contenedorDesgloseTotales.appendChild(ofertasUI)
                }
                const impuestoUI = document.createElement("div")
                impuestoUI.classList.add("reserva_resumen_desglose_pago_bloque")
                const impuestoUITituloBloque = document.createElement("div")
                impuestoUITituloBloque.classList.add("reserva_resumen_desglose_pago_titulo")
                impuestoUITituloBloque.textContent = "Impuestos"
                impuestoUI.appendChild(impuestoUITituloBloque)
                if (desgloseImpuestos.length === 0) {
                    const info = document.createElement("div")
                    info.classList.add("componentes_ui_totales_mensajeInfoSinInformacion")
                    info.textContent = "No hay información financiera sobre impuestos para mostrar"
                    impuestoUI.appendChild(info)
                }
                desgloseImpuestos.forEach((impuesto) => {
                    const impuestoTitulo = impuesto.nombreImpuesto
                    const tipoValor = impuesto.tipoValor
                    const tipoImpositivo = impuesto.tipoImpositivo
                    const calculoImpuestoPorcentaje = impuesto.calculoImpuestoPorcentaje
                    const impuestoUITitulo = document.createElement("div")
                    impuestoUITitulo.classList.add("reserva_resumen_desglose_pago_elemento")
                    const impuestoUITitulo_ = document.createElement("div")
                    impuestoUITitulo_.classList.add("reserva_resumen_apartamentoIUTitulo")
                    impuestoUITitulo_.classList.add("negrita")
                    impuestoUITitulo_.textContent = impuestoTitulo
                    impuestoUITitulo.appendChild(impuestoUITitulo_)
                    let simboloTipoImpuesto;
                    if (tipoValor === "porcentaje") {
                        simboloTipoImpuesto = "%";
                    }
                    if (tipoValor === "tasa") {
                        simboloTipoImpuesto = "$";
                    }
                    const impuestoUITipoImpositivo = document.createElement("div")
                    impuestoUITipoImpositivo.classList.add("reserva_resumen_impuestoUITipoImpositivo")
                    impuestoUITipoImpositivo.textContent = tipoImpositivo + simboloTipoImpuesto
                    impuestoUITitulo.appendChild(impuestoUITipoImpositivo)
                    const impuestoUITipoValor = document.createElement("div")
                    impuestoUITipoValor.classList.add("resumen_reserva_impuestoUITipoValor")
                    impuestoUITipoValor.textContent = tipoValor
                    if (calculoImpuestoPorcentaje) {
                        const impuestoUICalculoImpuestoPorcentaje = document.createElement("div")
                        impuestoUICalculoImpuestoPorcentaje.classList.add("resumen_reserva_impuestoUICalculoImpuestoPorcentaje")
                        impuestoUICalculoImpuestoPorcentaje.textContent = calculoImpuestoPorcentaje + "$"
                        impuestoUITitulo.appendChild(impuestoUICalculoImpuestoPorcentaje)
                    }
                    impuestoUI.appendChild(impuestoUITitulo)
                })
                if (desgloseImpuestos.length > 0) {
                    contenedorDesgloseTotales.appendChild(impuestoUI)
                }
                const totalesUI = document.createElement("div")
                totalesUI.classList.add("reserva_resumen_desglose_pago_bloque")
                const totalesUITituloBloque = document.createElement("div")
                totalesUITituloBloque.classList.add("reserva_resumen_desglose_pago_titulo")
                totalesUITituloBloque.textContent = "Totales"
                totalesUI.appendChild(totalesUITituloBloque)
                const totalPromedioNetoPorNoche = totales.promedioNetoPorNoche ?
                    totales.promedioNetoPorNoche + "$" :
                    "No hay información del total promedio neto por noche";
                const totalReservaNeto = totales.totalReservaNeto ? totales.totalReservaNeto + "$" : "No hay información del total neto de la reserva"
                const totalImpuestos = totales.totalImpuestos ? totales.totalImpuestos + "$" : "No hay información del total de los impuestos"
                const totalDescuentos = totales.totalDescuentos ? totales.totalDescuentos + "$" : "No hay información del total desconectado."
                const totalReservaNetoSinDescuentos = totales.totalReservaNetoSinOfertas ? totales.totalReservaNetoSinOfertas + "$" : "No hay información del total de la reserva sin descuentos."
                if (totales.totalReservaNeto) {
                    const totalReservaNetoDiaUI = document.createElement("div")
                    totalReservaNetoDiaUI.classList.add("detalleDelTotal")
                    totalReservaNetoDiaUI.textContent = "Precio medio neto de la reserva por noche: " + totalPromedioNetoPorNoche
                    if (totales.totalDescuentos) {
                        const totalDescuentosAplicadosUI = document.createElement("div")
                        totalDescuentosAplicadosUI.classList.add("detalleDelTotal")
                        totalDescuentosAplicadosUI.textContent = "Descuento total por todas las ofertas aplicadas: " + totalDescuentos
                        totalesUI.appendChild(totalDescuentosAplicadosUI)
                        const totalReservaNetoSinOfertasUI = document.createElement("div")
                        totalReservaNetoSinOfertasUI.classList.add("detalleDelTotal")
                        totalReservaNetoSinOfertasUI.textContent = "Total neto sin ofertas aplicadas: " + totalReservaNetoSinDescuentos
                        totalesUI.appendChild(totalReservaNetoSinOfertasUI)
                    }
                    const totalReservaNetoUI = document.createElement("div")
                    totalReservaNetoUI.classList.add("detalleDelTotal")
                    totalReservaNetoUI.textContent = "Total reserva neto: " + totalReservaNeto
                    totalesUI.appendChild(totalReservaNetoUI)
                    const totalImpuestosUI = document.createElement("div")
                    totalImpuestosUI.classList.add("detalleDelTotal")
                    totalImpuestosUI.textContent = "Total impuestos aplicados: " + totalImpuestos
                    totalesUI.appendChild(totalImpuestosUI)
                    const totalConImpuestosUI = document.createElement("div")
                    totalConImpuestosUI.classList.add("detalleDelTotal")
                    totalConImpuestosUI.classList.add("negrita")
                    totalConImpuestosUI.textContent = "Total final: " + totales.totalConImpuestos + "$"
                    totalesUI.appendChild(totalConImpuestosUI)
                } else {
                    const info = document.createElement("div")
                    info.classList.add("componentes_ui_totales_mensajeInfoSinInformacion")
                    info.textContent = "No hay información de totales"
                    totalesUI.appendChild(info)
                }
                contenedorDesgloseTotales.appendChild(totalesUI)
                selectorDestino.appendChild(contenedorDesgloseTotales)
            },
            pantallaInmersivaPersonalizada: (data) => {
                const alineacion = data?.alineacion
                document.body.style.overflow = 'hidden';
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const pantallaInmersivaPersonalizadaUI = document.createElement("div")
                pantallaInmersivaPersonalizadaUI.setAttribute("class", "advertenciaInmersiva")
                pantallaInmersivaPersonalizadaUI.setAttribute("componente", "advertenciaInmersiva")
                if (alineacion === "arriba") {
                    pantallaInmersivaPersonalizadaUI.classList.add("flextJustificacion_arriba")
                } else {
                    pantallaInmersivaPersonalizadaUI.classList.add("flextJustificacion_center")
                }
                pantallaInmersivaPersonalizadaUI.setAttribute("instanciaUID", instanciaUID)
                const contenedorAdvertenciaInmersiva = document.createElement("div")
                contenedorAdvertenciaInmersiva.classList.add("contenedorAdvertencaiInmersiva")
                pantallaInmersivaPersonalizadaUI.appendChild(contenedorAdvertenciaInmersiva)
                const contenidoAdvertenciaInmersiva = document.createElement("div")
                contenidoAdvertenciaInmersiva.classList.add("contenidoAdvertenciaInmersiva")
                contenidoAdvertenciaInmersiva.setAttribute("contenedor", "contenidoAdvertenciaInmersiva")
                contenidoAdvertenciaInmersiva.setAttribute("destino", "inyector")
                contenidoAdvertenciaInmersiva.setAttribute("componente", "contenedor")
                contenedorAdvertenciaInmersiva.appendChild(contenidoAdvertenciaInmersiva)
                return pantallaInmersivaPersonalizadaUI
            },
            pantallaInmersivaPersonalizadaMoldeada: () => {
                document.body.style.overflow = 'hidden';
                const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                const pantallaInmersivaPersonalizadaUI = document.createElement("div")
                pantallaInmersivaPersonalizadaUI.setAttribute("class", "advertenciaInmersiva")
                pantallaInmersivaPersonalizadaUI.setAttribute("componente", "advertenciaInmersiva")
                pantallaInmersivaPersonalizadaUI.setAttribute("instanciaUID", instanciaUID)
                const contenedorAdvertenciaInmersiva = document.createElement("div")
                contenedorAdvertenciaInmersiva.classList.add("contenedorAdvertencaiInmersiva")
                const contenidoAdvertenciaInmersiva = document.createElement("div")
                contenidoAdvertenciaInmersiva.classList.add("contenidoAdvertenciaInmersiva")
                contenidoAdvertenciaInmersiva.setAttribute("contenedor", "contenidoAdvertenciaInmersiva")
                contenidoAdvertenciaInmersiva.setAttribute("destino", "inyector")
                contenidoAdvertenciaInmersiva.setAttribute("componente", "constructor")
                const tituloUI = document.createElement("p")
                tituloUI.classList.add(
                    "tituloGris",
                    "textoCentrado"
                )
                tituloUI.setAttribute("componente", "titulo")
                contenidoAdvertenciaInmersiva.appendChild(tituloUI)
                const mensajeUI = document.createElement("div")
                mensajeUI.classList.add("mensajeUI")
                mensajeUI.setAttribute("componente", "mensajeUI")
                contenidoAdvertenciaInmersiva.appendChild(mensajeUI)
                const contenedorEspacio = document.createElement("div")
                contenedorEspacio.setAttribute("componente", "contenedor")
                contenidoAdvertenciaInmersiva.appendChild(contenedorEspacio)
                const botonAceptar = document.createElement("div")
                botonAceptar.classList.add("botonV1")
                botonAceptar.setAttribute("boton", "aceptar")
                contenidoAdvertenciaInmersiva.appendChild(botonAceptar)
                const botonCancelar = document.createElement("div")
                botonCancelar.classList.add("botonV1")
                botonCancelar.setAttribute("boton", "cancelar")
                botonCancelar.addEventListener("click", () => {
                    return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                })
                contenidoAdvertenciaInmersiva.appendChild(botonCancelar)
                contenedorAdvertenciaInmersiva.appendChild(contenidoAdvertenciaInmersiva)
                pantallaInmersivaPersonalizadaUI.appendChild(contenedorAdvertenciaInmersiva)
                return pantallaInmersivaPersonalizadaUI
            },
            spinner: (data) => {
                const mensaje = data?.mensaje || ""
                const textoBoton = data?.textoBoton || "Ocultar"
                const visibilidadBoton = data?.visibilidadBoton || "si"
                const contenedorSpinner = document.createElement("div")
                contenedorSpinner.classList.add("contenedorSpinner")
                contenedorSpinner.setAttribute("componente", "spinnerListaDeEnlaces")
                contenedorSpinner.setAttribute("contenedor", "spinner")
                const spinnerContainer = document.createElement('div');
                spinnerContainer.setAttribute("componente", "iconoCargaEnlace");
                spinnerContainer.classList.add("lds-spinner");
                for (let i = 0; i < 12; i++) {
                    const div = document.createElement('div');
                    spinnerContainer.appendChild(div);
                }
                const info = document.createElement("div")
                info.setAttribute("class", "advertenciaInfoFlujoPago")
                info.setAttribute("componente", "mensajeFlujoPasarela")
                info.textContent = mensaje
                contenedorSpinner.appendChild(spinnerContainer)
                contenedorSpinner.appendChild(info)
                if (visibilidadBoton === "si") {
                    const botoCancelar = document.createElement("div")
                    botoCancelar.setAttribute("class", "botonV1AdvertenciaInmersiva")
                    botoCancelar.setAttribute("boton", "cancelar")
                    botoCancelar.textContent = textoBoton
                    botoCancelar.addEventListener("click", casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas)
                    contenedorSpinner.appendChild(botoCancelar)
                }
                return contenedorSpinner
            },
            spinnerSimple: () => {
                const contenedorSpinner = document.createElement("div")
                contenedorSpinner.classList.add("contenedorSpinner")
                contenedorSpinner.setAttribute("componente", "spinnerSimple")
                contenedorSpinner.setAttribute("contenedor", "spinner")
                const spinnerContainer = document.createElement('div');
                spinnerContainer.setAttribute("componente", "iconoCargaEnlace");
                spinnerContainer.classList.add("lds-spinner");
                for (let i = 0; i < 12; i++) {
                    const div = document.createElement('div');
                    spinnerContainer.appendChild(div);
                }
                contenedorSpinner.appendChild(spinnerContainer)
                return contenedorSpinner
            },
            mensajeSimple: (data) => {
                const titulo = data?.titulo
                const descripcion = data?.descripcion
                const mensajeUID = data?.mensajeUID || ""
                const mensajeUI_rendered = document.querySelector(`main [mensajeUID="${mensajeUID}]`)
                if (mensajeUI_rendered) {
                    return
                }
                const main = document.querySelector("main")
                main.removeAttribute("instanciaUID")
                main.innerHTML = null
                const contenedor = document.createElement("div")
                contenedor.classList.add("componentes_contenedor_mensajeSimple")
                contenedor.setAttribute("mensajeUID", mensajeUID)
                main.appendChild(contenedor)
                const contenedorIntermedio = document.createElement("div")
                contenedorIntermedio.classList.add("componentes_contenedor_contenedorIntermedio")
                contenedorIntermedio.setAttribute("espacio", "formularioCrearEnlaceDePago")
                const contenedorBloque = document.createElement("div")
                contenedorBloque.classList.add("componentes_contenedor_contenido")
                if (titulo) {
                    const tituloUI = document.createElement("div")
                    tituloUI.classList.add("componentes_contenedor_mensajeSimple_titulo")
                    tituloUI.classList.add("negrita")
                    tituloUI.textContent = titulo
                    contenedorBloque.appendChild(tituloUI)
                }
                if (descripcion) {
                    const descripcionUI = document.createElement("div")
                    descripcionUI.classList.add("mensajeDelError")
                    descripcionUI.textContent = descripcion
                    contenedorBloque.appendChild(descripcionUI)
                }
                contenedorIntermedio.appendChild(contenedorBloque)
                contenedor.appendChild(contenedorIntermedio)
            },
            iconoProceso: () => {
                const iconoProcesoDiv = document.createElement('div');
                iconoProcesoDiv.className = 'iconoProceso';
                iconoProcesoDiv.setAttribute("componente", "iconoProceso")
                for (let i = 0; i < 12; i++) {
                    const divInterno = document.createElement('div');
                    iconoProcesoDiv.appendChild(divInterno);
                }
                return iconoProcesoDiv;
            },
            calendario: {
                constructorCalendarioNuevo: (metadatos) => {
                    try {
                        const almacenamientoVolatilUID = metadatos.almacenamientoCalendarioID
                        if (!almacenamientoVolatilUID) {
                            const error = "El constructor del calendario, necesita un nombre para el almacenamiento volátil"
                            throw new Error(error)
                        }
                        const tipoFecha = metadatos.tipoFecha
                        if (!tipoFecha) {
                            const error = "El constructor del calendario, necesita un tipoFecha, ya sea entrada o salida"
                            throw new Error(error)
                        }
                        const calendarioIO = metadatos.calendarioIO
                        if (!calendarioIO) {
                            const error = "El constructor del calendario, necesita un calendarioIO, ya sea entrada o salida"
                            throw new Error(error)
                        }
                        const perfilMes = metadatos.perfilMes
                        if (!perfilMes) {
                            const error = "El constructor del calendario, necesita un perfilMes, consulte los perfiles en constructorMes"
                            throw new Error(error)
                        }
                        const mensajeInfo = metadatos.mensajeInfo
                        if (!mensajeInfo) {
                            const error = "El constructor del calendario, necesita un mensajeInfo, para informar de para que es este calendario"
                            throw new Error(error)
                        }
                        const alturaDinamica = metadatos.alturaDinamica
                        if (!alturaDinamica) {
                            const error = "El constructor del calendario necesita una altura dinámica para colorar el contenedor del calendario."
                            throw new Error(error)
                        }
                        const instanciaUID = metadatos.instanciaUID
                        if (!instanciaUID) {
                            const error = "El constructor del calendario necesita una instanciaUID para el contenedor del calendario"
                            throw new Error(error)
                        }
                        const instanciaUID_contenedorFechas = metadatos.instanciaUID_contenedorFechas
                        if (!instanciaUID_contenedorFechas) {
                            const error = "El constructor del calendario necesita una instanciaUID_contenedorFechas para calendario"
                            throw new Error(error)
                        }
                        const metodoSelectorDia = metadatos.metodoSelectorDia
                        if (!metodoSelectorDia) {
                            const error = "El constructor del calendario necesita un metodoSelectorDia para el contenedor del calendario"
                            throw new Error(error)
                        }
                        const seleccionableDiaLimite = metadatos.seleccionableDiaLimite || "si"
                        const calendario = document.createElement("div")
                        calendario.classList.add("calendarioNuevo")
                        calendario.setAttribute("campo", "calendario")
                        calendario.setAttribute("contenedor", "calendario")
                        calendario.setAttribute("componente", "marcoCalendario")
                        calendario.setAttribute("almacenamientoCalendarioID", almacenamientoVolatilUID)
                        calendario.setAttribute("tipoCalendario", tipoFecha)
                        calendario.setAttribute("calendarioIO", calendarioIO)
                        calendario.setAttribute("metodoSelectorDia", metodoSelectorDia)
                        calendario.setAttribute("seleccionableDiaLimite", seleccionableDiaLimite)
                        calendario.setAttribute("elemento", "flotante")
                        calendario.setAttribute("perfilMes", perfilMes)
                        calendario.setAttribute("IO", calendarioIO)
                        const botonCerrarCalResponsivo = document.createElement("div")
                        botonCerrarCalResponsivo.classList.add(
                            "padding10",
                            "borderRadius10",
                            "selectorRojo",
                            "flextJustificacion_center",
                            // "mostrarSoloEnResponsivo"
                        )
                        botonCerrarCalResponsivo.textContent = "Cerrar calendario"
                        botonCerrarCalResponsivo.setAttribute("elemento", "noFlotante")
                        botonCerrarCalResponsivo.addEventListener("click", casaVitini.shell.controladoresUI.ocultarElementos)
                        calendario.appendChild(botonCerrarCalResponsivo)
                        const navegacionMes = document.createElement("nav")
                        navegacionMes.setAttribute("class", "navegacionMes")
                        calendario.appendChild(navegacionMes)
                        const botonNavegacionMesAtras = document.createElement("div")
                        botonNavegacionMesAtras.setAttribute("class", "botonNavegacionMes")
                        botonNavegacionMesAtras.setAttribute("id", "botonAtras")
                        botonNavegacionMesAtras.setAttribute("sentido", "atras")
                        botonNavegacionMesAtras.textContent = "Atrás"
                        botonNavegacionMesAtras.addEventListener("click", casaVitini.ui.componentes.calendario.navegacionCalendarioNuevo)
                        navegacionMes.appendChild(botonNavegacionMesAtras)
                        const navegacionMesReferencia = document.createElement("div")
                        navegacionMesReferencia.setAttribute("id", "navegacionMesReferencia")
                        navegacionMesReferencia.setAttribute("class", "navegacionMesReferencia")
                        navegacionMesReferencia.setAttribute("componente", "mesReferencia")
                        navegacionMes.appendChild(navegacionMesReferencia)
                        const botonNavegacionMesAdelante = document.createElement("div")
                        botonNavegacionMesAdelante.setAttribute("class", "botonNavegacionMes")
                        botonNavegacionMesAdelante.setAttribute("id", "botonAdelante")
                        botonNavegacionMesAdelante.textContent = "Adelante"
                        botonNavegacionMesAdelante.setAttribute("sentido", "adelante")
                        botonNavegacionMesAdelante.addEventListener("click", casaVitini.ui.componentes.calendario.navegacionCalendarioNuevo)
                        navegacionMes.appendChild(botonNavegacionMesAdelante)
                        const cartelInfoCalendarioEstado = document.createElement("div")
                        cartelInfoCalendarioEstado.setAttribute("class", "cartelInfoCalendarioEstado")
                        cartelInfoCalendarioEstado.setAttribute("componente", "infoCalendario")
                        cartelInfoCalendarioEstado.setAttribute("campo", "calendario")
                        cartelInfoCalendarioEstado.textContent = mensajeInfo
                        calendario.appendChild(cartelInfoCalendarioEstado)
                        const marcoMes = document.createElement("ol")
                        marcoMes.setAttribute("id", "marcoMes")
                        marcoMes.setAttribute("class", "marcoMes")
                        marcoMes.setAttribute("componente", "marcoMes")
                        marcoMes.style.gridTemplateRows = "min-content min-content"
                        marcoMes.style.flex = "0"
                        calendario.appendChild(marcoMes)
                        const pilaDias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
                        for (const nombreDia of pilaDias) {
                            let diaSemana = document.createElement("li")
                            diaSemana.setAttribute("class", "nombreDia")
                            diaSemana.setAttribute("tipoNombreDia", "extendido")
                            diaSemana.textContent = nombreDia
                            marcoMes.appendChild(diaSemana)
                        }
                        const pilaDiasAbreviados = ["L", "M", "X", "J", "V", "S", "D"]
                        for (const nombreDia of pilaDiasAbreviados) {
                            let diaSemana = document.createElement("li")
                            diaSemana.setAttribute("class", "nombreDia")
                            diaSemana.setAttribute("tipoNombreDia", "abreviado")
                            diaSemana.textContent = nombreDia
                            marcoMes.appendChild(diaSemana)
                        }
                        const bloqueCalendario = document.createElement("div")
                        bloqueCalendario.classList.add(
                            "bloqueCalendarioNuevo",
                            "calendarioFlotante",
                            "sobreControlAnimacionGlobal"
                        )
                        const claseDinamica = document.createElement('style');
                        claseDinamica.innerHTML = `
                            .calendarioFlotante {
                                top: ${alturaDinamica - 40}px
                                }
                        `;
                        bloqueCalendario.appendChild(claseDinamica);
                        bloqueCalendario.setAttribute("instanciaUID", instanciaUID)
                        bloqueCalendario.setAttribute("instanciaUID_contenedorFechas", instanciaUID_contenedorFechas)
                        bloqueCalendario.setAttribute("componente", "bloqueCalendario")
                        const spinner = casaVitini.ui.componentes.spinnerSimple()
                        const contenedorCarga = document.createElement("div")
                        contenedorCarga.classList.add("componente_calendario_contenedoCarga_Mes")
                        contenedorCarga.setAttribute("contenedor", "construyendoCalendario")
                        contenedorCarga.setAttribute("elemento", "flotante")
                        contenedorCarga.appendChild(spinner)
                        calendario.appendChild(contenedorCarga)
                        bloqueCalendario.appendChild(calendario)
                        //document.querySelector("main").appendChild(bloqueCalendario)
                        return bloqueCalendario
                    } catch (errorCapturado) {
                        throw errorCapturado
                    }
                },
                configurarCalendario: async (data) => {
                    const metodoAlternativo = data.metodoAlternativo
                    const instanciaUID_contenedorFechas = data.instanciaUID_contenedorFechas
                    const contenedorOrigenIDV = data.contenedorOrigenIDV
                    const perfilMes = data.perfilMes
                    const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                    const metodoSelectorDia = data?.metodoSelectorDia || "ui.componentes.calendario.calendarioCompartido.seleccionarDia"
                    const areaContenedorFechas = document.querySelector(`[instanciaUID_contenedorFechas="${instanciaUID_contenedorFechas}"]`)
                    const rangoIDV = data.rangoIDV
                    const seleccionableDiaLimite = data.seleccionableDiaLimite
                    if (seleccionableDiaLimite !== "si" && seleccionableDiaLimite !== "no" && rangoIDV !== "unico") {
                        const m = "configurarCalendario necesita selecioanbleDiaLimite en si o no"
                        return casaVitini.ui.componentes.advertenciaInmersiva(m)
                    }
                    const contenedorOrigen = areaContenedorFechas.querySelector(contenedorOrigenIDV)
                    const alturaDinamicaArriba = casaVitini.utilidades.observador.medirPorJerarquiaDom.vertical.desdeAbajoDelElemento(contenedorOrigen) + 16
                    const selectorCalendario = document.querySelector("[contenedor=calendario]")
                    const calendarioObsoleto = selectorCalendario?.getAttribute("calendarioIO")
                    const dictConfIDV = {
                        inicioRango: "entrada",
                        finalRango: "salida",
                        unico: "unico"
                    }
                    const bloqueCalendario = document.querySelectorAll("[componente=bloqueCalendario]")
                    bloqueCalendario.forEach((calendarioObsoelto) => {
                        calendarioObsoelto.remove()
                    })
                    if (calendarioObsoleto === dictConfIDV[rangoIDV]) {
                        return
                    }
                    const calendarioUI = casaVitini.ui.componentes.calendario.constructorCalendarioNuevo({
                        almacenamientoCalendarioID: "almacenamientoCalendario",
                        perfilMes,
                        alturaDinamica: alturaDinamicaArriba,
                        instanciaUID,
                        instanciaUID_contenedorFechas,
                        metodoAlternativo,
                        metodoSelectorDia,
                        seleccionableDiaLimite,
                        mensajeInfo: "Cargando...",
                        tipoFecha: "enEspera",
                        calendarioIO: "enEspera"
                    })
                    document.querySelector("main").appendChild(calendarioUI)
                    document.addEventListener("click", casaVitini.shell.controladoresUI.ocultarElementos)
                    const configGlobal = calendarioUI.querySelector("[contenedor=calendario]")
                    const fechasSeleccionadas = () => {
                        const fechaEntradaVolatil = areaContenedorFechas.querySelector("[calendario=entrada]").
                            getAttribute("memoriaVolatil")
                        const fechaEntradaAarray = fechaEntradaVolatil?.split("-") ? fechaEntradaVolatil?.split("-") : []
                        const diaSeleccionadoEntrada = Number(fechaEntradaAarray[2])
                        const mesSeleccionadoEntrada = Number(fechaEntradaAarray[1])
                        const anoSeleccionadoEntrada = Number(fechaEntradaAarray[0])
                        const fechaSalidaVolatil = areaContenedorFechas.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")
                        const fechaSaliraArray = fechaSalidaVolatil?.split("-") ? fechaSalidaVolatil?.split("-") : []
                        const diaSeleccionadoSalida = Number(fechaSaliraArray[2])
                        const mesSeleccionadoSalida = Number(fechaSaliraArray[1])
                        const anoSeleccionadoSalida = Number(fechaSaliraArray[0])
                        const contenedorFechas = {
                            fechaEntrada: {
                                volatil: fechaEntradaVolatil,
                                dia: diaSeleccionadoEntrada,
                                mes: mesSeleccionadoEntrada,
                                ano: anoSeleccionadoEntrada
                            },
                            fechaSalida: {
                                volatil: fechaSalidaVolatil,
                                dia: diaSeleccionadoSalida,
                                mes: mesSeleccionadoSalida,
                                ano: anoSeleccionadoSalida
                            }
                        }
                        return contenedorFechas
                    }
                    const resolverCalendario = {}
                    if (rangoIDV === "inicioRango") {
                        const tituloCalendario = data?.tituloCalendario || "Selecciona una fecha"
                        if (fechasSeleccionadas().fechaEntrada?.volatil) {
                            resolverCalendario.tipo = "personalizado"
                            resolverCalendario.mes = Number(fechasSeleccionadas().fechaEntrada.mes)
                            resolverCalendario.ano = Number(fechasSeleccionadas().fechaEntrada.ano)
                            configGlobal.setAttribute("tipoFecha", "entrada")
                            configGlobal.setAttribute("calendarioIO", "entrada")
                            configGlobal.querySelector("[componente=infoCalendario]").textContent = tituloCalendario
                        } else if (fechasSeleccionadas().fechaSalida?.volatil) {
                            if (seleccionableDiaLimite === "no") {
                                const diaSel = Number(fechasSeleccionadas().fechaSalida.dia)
                                if (1 === diaSel) {
                                    const mesSel = Number(fechasSeleccionadas().fechaSalida.mes)
                                    const anoSel = Number(fechasSeleccionadas().fechaSalida.ano)
                                    const mesFinal = mesSel === 1 ? 12 : mesSel - 1
                                    const anoFinal = mesFinal === 12 ? anoSel - 1 : anoSel
                                    resolverCalendario.mes = Number(mesFinal)
                                    resolverCalendario.ano = Number(anoFinal)
                                } else {
                                    resolverCalendario.mes = Number(fechasSeleccionadas().fechaSalida.mes)
                                    resolverCalendario.ano = Number(fechasSeleccionadas().fechaSalida.ano)
                                }
                            } else {
                                resolverCalendario.mes = Number(fechasSeleccionadas().fechaSalida.mes)
                                resolverCalendario.ano = Number(fechasSeleccionadas().fechaSalida.ano)
                            }
                            resolverCalendario.tipo = "personalizado"
                            configGlobal.setAttribute("tipoFecha", "entrada")
                            configGlobal.setAttribute("calendarioIO", "entrada")
                            configGlobal.querySelector("[componente=infoCalendario]").textContent = tituloCalendario
                        } else {
                            resolverCalendario.tipo = "actual"
                            configGlobal.setAttribute("tipoFecha", "entrada")
                            configGlobal.setAttribute("calendarioIO", "entrada")
                            configGlobal.querySelector("[componente=infoCalendario]").textContent = tituloCalendario
                        }
                    } else if (rangoIDV === "finalRango") {
                        const tituloCalendario = data?.tituloCalendario || "Selecciona una fecha"
                        if (fechasSeleccionadas().fechaSalida?.volatil) {
                            resolverCalendario.tipo = "personalizado"
                            resolverCalendario.mes = Number(fechasSeleccionadas().fechaSalida.mes)
                            resolverCalendario.ano = Number(fechasSeleccionadas().fechaSalida.ano)
                            configGlobal.setAttribute("tipoFecha", "salida")
                            configGlobal.setAttribute("calendarioIO", "salida")
                            configGlobal.querySelector("[componente=infoCalendario]").textContent = tituloCalendario
                        } else if (fechasSeleccionadas().fechaEntrada?.volatil) {
                            if (seleccionableDiaLimite === "no") {
                                const mesInicial = Number(fechasSeleccionadas().fechaEntrada.mes)
                                const anoInicial = Number(fechasSeleccionadas().fechaEntrada.ano)
                                const calendarioResuelto = await casaVitini.ui.componentes.calendario.resolverCalendarioNuevo({
                                    tipo: "personalizado",
                                    mes: mesInicial,
                                    ano: anoInicial
                                })
                                const numeroDiasPorMes = calendarioResuelto.numeroDiasPorMes
                                if (numeroDiasPorMes === Number(fechasSeleccionadas().fechaEntrada.dia)) {
                                    const mesFinal = mesInicial < 12 ? mesInicial + 1 : 1
                                    const anoFinal = mesFinal === 1 ? anoInicial + 1 : anoInicial
                                    resolverCalendario.mes = mesFinal
                                    resolverCalendario.ano = anoFinal
                                } else {
                                    resolverCalendario.mes = Number(fechasSeleccionadas().fechaEntrada.mes)
                                    resolverCalendario.ano = Number(fechasSeleccionadas().fechaEntrada.ano)
                                }
                            } else {
                                resolverCalendario.mes = Number(fechasSeleccionadas().fechaEntrada.mes)
                                resolverCalendario.ano = Number(fechasSeleccionadas().fechaEntrada.ano)
                            }
                            resolverCalendario.tipo = "personalizado"
                            configGlobal.setAttribute("tipoFecha", "salida")
                            configGlobal.setAttribute("calendarioIO", "salida")
                            configGlobal.querySelector("[componente=infoCalendario]").textContent = tituloCalendario
                        } else {
                            resolverCalendario.tipo = "actual"
                            configGlobal.setAttribute("tipoFecha", "salida")
                            configGlobal.setAttribute("calendarioIO", "salida")
                            configGlobal.querySelector("[componente=infoCalendario]").textContent = tituloCalendario
                        }
                    } else if (rangoIDV === "unico") {
                        const tituloCalendario = data?.tituloCalendario || "Selecciona una fecha"
                        const fechaUnica = areaContenedorFechas.querySelector("[calendario=unico]").getAttribute("memoriaVolatil") | []
                        const diaSeleccionado = Number(fechaUnica[2])
                        const mesSeleccionado = Number(fechaUnica[1])
                        const anoSeleccionado = Number(fechaUnica[0])
                        if (fechaUnica) {
                            resolverCalendario.tipo = "personalizado"
                            resolverCalendario.mes = Number(mesSeleccionado)
                            resolverCalendario.ano = Number(anoSeleccionado)
                            configGlobal.setAttribute("tipoFecha", "unico")
                            configGlobal.setAttribute("calendarioIO", "unico")
                            configGlobal.querySelector("[componente=infoCalendario]").textContent = tituloCalendario
                        } else {
                            resolverCalendario.tipo = "actual"
                            configGlobal.setAttribute("tipoFecha", "unico")
                            configGlobal.setAttribute("calendarioIO", "unico")
                            configGlobal.querySelector("[componente=infoCalendario]").textContent = tituloCalendario
                        }
                    } else {
                        const m = "configurarCalendario no reconoce el rango, puede ser inicioRango, finalRango o unico"
                        return casaVitini.ui.componentes.advertenciaInmersiva(m)
                    }
                    const calendarioResuelto = await casaVitini.ui.componentes.calendario.resolverCalendarioNuevo(resolverCalendario)
                    calendarioResuelto.origen = "configuracionCalendario"
                    calendarioResuelto.instanciaUID = instanciaUID
                    calendarioResuelto.instanciaUID_contenedorFechas = instanciaUID_contenedorFechas
                    await casaVitini.ui.componentes.calendario.constructorMesNuevo(calendarioResuelto)
                },
                constructorCalendarioIncrustado: (metadatos) => {
                    try {
                        const almacenamientoVolatilUID = metadatos.almacenamientoCalendarioID
                        if (!almacenamientoVolatilUID) {
                            const error = "El constructor del calendario, necesita un nombre para el almacenamiento volatil"
                            throw new Error(error)
                        }
                        const tipoFecha = metadatos.tipoFecha
                        if (!tipoFecha) {
                            const error = "El constructor del calendario, necesita un tipoFecha, ya sea entrada o salida"
                            throw new Error(error)
                        }
                        const calendarioIO = metadatos.calendarioIO
                        if (!calendarioIO) {
                            const error = "El constructor del calendario, necesita un calendarioIO, ya sea entrada o salida"
                            throw new Error(error)
                        }
                        const perfilMes = metadatos.perfilMes
                        if (!perfilMes) {
                            const error = "El constructor del calendario, necesita un perfilMes, consulte los perfiles en constructorMes"
                            throw new Error(error)
                        }
                        const mensajeInfo = metadatos.mensajeInfo
                        if (!mensajeInfo) {
                            const error = "El constructor del calendario, necesita un mensajeInfo, para informar de para que es este calendario"
                            throw new Error(error)
                        }
                        const alturaDinamica = metadatos.alturaDinamica
                        if (!alturaDinamica) {
                            const error = "EEl constructor del calendario necesita una altura dinamica para colora el contenedor del calendario"
                            throw new Error(error)
                        }
                        const instanciaUID = metadatos.instanciaUID
                        if (!instanciaUID) {
                            const error = "El constructor del calendario necesita una instanciaUID para el contenedor del calendario"
                            throw new Error(error)
                        }
                        const metodoSelectorDia = metadatos.metodoSelectorDia
                        if (!metodoSelectorDia) {
                            const error = "El constructor del calendario necesita un metodoSelectorDia para el contenedor del calendario"
                            throw new Error(error)
                        }
                        const calendario = document.createElement("div")
                        calendario.setAttribute("class", "calendarioIncrustado")
                        calendario.setAttribute("campo", "calendario")
                        calendario.setAttribute("contenedor", "calendario")
                        calendario.setAttribute("componente", "marcoCalendario")
                        calendario.setAttribute("almacenamientoCalendarioID", almacenamientoVolatilUID)
                        calendario.setAttribute("tipoCalendario", tipoFecha)
                        calendario.setAttribute("calendarioIO", calendarioIO)
                        calendario.setAttribute("metodoSelectorDia", metodoSelectorDia)
                        calendario.setAttribute("elemento", "flotante")
                        calendario.setAttribute("perfilMes", perfilMes)
                        calendario.setAttribute("IO", calendarioIO)
                        calendario.style.display = "none"
                        const cartelInfoCalendarioEstado = document.createElement("div")
                        cartelInfoCalendarioEstado.setAttribute("class", "cartelInfoCalendarioEstado")
                        cartelInfoCalendarioEstado.setAttribute("componente", "infoCalendario")
                        cartelInfoCalendarioEstado.setAttribute("campo", "calendario")
                        cartelInfoCalendarioEstado.textContent = mensajeInfo
                        const navegacionMes = document.createElement("nav")
                        navegacionMes.setAttribute("class", "navegacionMes")
                        calendario.appendChild(navegacionMes)
                        calendario.appendChild(cartelInfoCalendarioEstado)
                        const botonNavegacionMesAtras = document.createElement("div")
                        botonNavegacionMesAtras.setAttribute("class", "botonNavegacionMes")
                        botonNavegacionMesAtras.setAttribute("id", "botonAtras")
                        botonNavegacionMesAtras.setAttribute("sentido", "atras")
                        botonNavegacionMesAtras.textContent = "Atrás"
                        botonNavegacionMesAtras.addEventListener("click", casaVitini.ui.componentes.calendario.navegacionCalendarioNuevo)
                        navegacionMes.appendChild(botonNavegacionMesAtras)
                        const navegacionMesReferencia = document.createElement("div")
                        navegacionMesReferencia.setAttribute("id", "navegacionMesReferencia")
                        navegacionMesReferencia.setAttribute("class", "navegacionMesReferencia")
                        navegacionMesReferencia.setAttribute("componente", "mesReferencia")
                        navegacionMes.appendChild(navegacionMesReferencia)
                        const botonNavegacionMesAdelante = document.createElement("div")
                        botonNavegacionMesAdelante.setAttribute("class", "botonNavegacionMes")
                        botonNavegacionMesAdelante.setAttribute("id", "botonAdelante")
                        botonNavegacionMesAdelante.textContent = "Adelante"
                        botonNavegacionMesAdelante.setAttribute("sentido", "adelante")
                        botonNavegacionMesAdelante.addEventListener("click", casaVitini.ui.componentes.calendario.navegacionCalendarioNuevo)
                        navegacionMes.appendChild(botonNavegacionMesAdelante)
                        const marcoMes = document.createElement("ol")
                        marcoMes.setAttribute("id", "marcoMes")
                        marcoMes.setAttribute("class", "marcoMes")
                        marcoMes.setAttribute("componente", "marcoMes")
                        calendario.appendChild(marcoMes)
                        const pilaDias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
                        for (const nombreDia of pilaDias) {
                            let diaSemana = document.createElement("li")
                            diaSemana.classList.add("nombreDia")
                            diaSemana.setAttribute("tipoNombreDia", "extendido")
                            diaSemana.textContent = nombreDia
                            marcoMes.appendChild(diaSemana)
                        }
                        const pilaDiasAbreviados = ["L", "M", "X", "J", "V", "S", "D"]
                        for (const nombreDia of pilaDiasAbreviados) {
                            let diaSemana = document.createElement("li")
                            diaSemana.classList.add("class", "nombreDia")
                            diaSemana.setAttribute("tipoNombreDia", "abreviado")
                            diaSemana.textContent = nombreDia
                            marcoMes.appendChild(diaSemana)
                        }
                        const seccion = document.querySelector("section:not([estado=obsoleto])")
                        const bloqueCalendario = document.createElement("div")
                        bloqueCalendario.setAttribute("class", "bloqueCalendarioNuevo")
                        bloqueCalendario.setAttribute("componente", "bloqueCalendario")
                        bloqueCalendario.style.top = alturaDinamica + "px"
                        const contenedoCalendarioIntermedio = document.createElement("div")
                        contenedoCalendarioIntermedio.setAttribute("instanciaUID", instanciaUID)
                        const spinner = casaVitini.ui.componentes.spinnerSimple()
                        const contenedorCarga = document.createElement("div")
                        contenedorCarga.classList.add("componente_calendario_contenedoCarga_calendarioIncrustado")
                        contenedorCarga.setAttribute("contenedor", "construyendoCalendario")
                        contenedorCarga.setAttribute("elemento", "flotante")
                        contenedorCarga.appendChild(spinner)
                        contenedoCalendarioIntermedio.appendChild(calendario)
                        contenedoCalendarioIntermedio.appendChild(contenedorCarga)
                        return contenedoCalendarioIntermedio
                    } catch (errorCapturado) {
                        throw errorCapturado
                    }
                },
                constructorMesNuevo: async (calendario) => {
                    try {
                        const instanciaUID = calendario.instanciaUID
                        const instanciaUID_contenedorFechas = calendario.instanciaUID_contenedorFechas
                        const origen = calendario.origen
                        const selectorCalendarioRenderizado = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                        const instanciaUID_procesoCambioMes = calendario.instanciaUID_procesoCambioMes
                        if (!selectorCalendarioRenderizado) {
                            return
                        }
                        const metodoSelectorDia = selectorCalendarioRenderizado.querySelector("[metodoSelectorDia]").getAttribute("metodoSelectorDia")
                        if (instanciaUID_procesoCambioMes) {
                            const selectorMarcoMesRenderizadoEnEspera = selectorCalendarioRenderizado
                                .querySelector(`[inctanciaUID_procesoCambioMes="${instanciaUID_procesoCambioMes}"]`)
                            if (!selectorMarcoMesRenderizadoEnEspera) {
                                return
                            }
                        }
                        const pasarelaX = (e) => {
                            return casaVitini.utilidades.ejecutarFuncionPorNombreDinamicoConContexto({
                                ruta: metodoSelectorDia,
                                args: e
                            })
                        }
                        const nombreMes = [
                            "Enero",
                            "Febrero",
                            "Marzo",
                            "Abrir",
                            "Mayo",
                            "Junio",
                            "Julio",
                            "Agost",
                            "Septiembre",
                            "Octubre",
                            "Noviembre",
                            "Diciembre"
                        ]
                        const nombreMesFinal = nombreMes[calendario.mes - 1]
                        const indicadorMesAno = nombreMesFinal + " " + calendario.ano
                        const navegacionMesReferencia = selectorCalendarioRenderizado.querySelector("[componente=mesReferencia]")
                        navegacionMesReferencia.textContent = indicadorMesAno
                        navegacionMesReferencia.setAttribute("ano", calendario.ano)
                        navegacionMesReferencia.setAttribute("mes", calendario.mes)
                        const infoCalendario = selectorCalendarioRenderizado.querySelector("[componente=infoCalendario]")
                        const posicionDia1 = calendario.posicionDia1
                        const numeroDiasPorMes = calendario.numeroDiasPorMes;
                        const diaActual_decimal = parseInt(calendario.dia, 10)
                        const marcoCalendario = selectorCalendarioRenderizado.querySelector("[componente=marcoCalendario]")
                        const tipoCalendario = marcoCalendario?.getAttribute("IO")
                        selectorCalendarioRenderizado.querySelectorAll("[dia]").forEach(diaObsoleto => {
                            diaObsoleto.remove()
                        });
                        const perfilMes = marcoCalendario?.getAttribute("perfilMes")
                        const controlDiasCompletos = {
                            zona: "componentes/diasOcupadosTotalmentePorMes",
                            mes: Number(calendario.mes),
                            ano: Number(calendario.ano)
                        }
                        const detallesDiasOcupacion = {}
                        if (instanciaUID_procesoCambioMes) {
                            const marcoMes = selectorCalendarioRenderizado.querySelector(`[componente=marcoCalendario] [componente=marcoMes][inctanciaUID_procesoCambioMes="${instanciaUID_procesoCambioMes}"]`)
                            if (!marcoMes) {
                                return
                            }
                        }
                        const marcoMes = selectorCalendarioRenderizado.querySelector(`[componente=marcoCalendario] [componente=marcoMes]`)
                        marcoMes.removeAttribute("style")
                        const valorDinamico = (data) => {
                            const numeroDiasPorMes = data.numeroDiasPorMes
                            const posicionDia1 = data.posicionDia1
                            const filasFuturoGrid = casaVitini.utilidades.calendarios.calcularNumeroSemanasDelMes({
                                posicionPrimerDiaSemana: posicionDia1,
                                numeroDiasPorMes: numeroDiasPorMes
                            })
                            const final = []
                            for (let index = 0; index < filasFuturoGrid + 1; index++) {
                                if (index === 0) {
                                    final.push("auto")
                                } else {
                                    final.push("1fr")
                                }
                            }
                            return final.join(" ")
                        }
                        marcoMes.style.gridTemplateRows = valorDinamico({
                            numeroDiasPorMes,
                            posicionDia1
                        })
                        if (perfilMes === "calendario_entrada_publico_sinPasado") {
                            let posicionDia1
                            let numeroDiasPorMes
                            let mesActual_decimal
                            let anoActual_decimal
                            let diaActual_decimal
                            let tiempo
                            const fechaEntradaVolatil_Humana = document.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
                            const fechaEntradaSeleccionada = {}
                            if (fechaEntradaVolatil_Humana) {
                                const fechaEntradaAarray = fechaEntradaVolatil_Humana.split("-")
                                fechaEntradaSeleccionada.dia = parseInt(fechaEntradaAarray[2], 10)
                                fechaEntradaSeleccionada.mes = parseInt(fechaEntradaAarray[1], 10)
                                fechaEntradaSeleccionada.ano = parseInt(fechaEntradaAarray[0], 10)
                            }
                            const fechaSalidaVolatil_Humana = document.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")
                            const fechaSalidaSeleccionada = {}
                            if (fechaSalidaVolatil_Humana) {
                                const fechaSaliraArray = fechaSalidaVolatil_Humana.split("-")
                                fechaSalidaSeleccionada.dia = parseInt(fechaSaliraArray[2], 10)
                                fechaSalidaSeleccionada.mes = parseInt(fechaSaliraArray[1], 10)
                                fechaSalidaSeleccionada.ano = parseInt(fechaSaliraArray[0], 10)
                            }
                            if (Object.keys(fechaEntradaSeleccionada).length === 0 && Object.keys(fechaSalidaSeleccionada).length === 0 && origen === "configuracionCalendario") {
                                const primeraFechaDisponible = calendario.limites.primeraFechaDisponible
                                const dia = primeraFechaDisponible.dia
                                const mes = primeraFechaDisponible.mes
                                const ano = primeraFechaDisponible.ano
                                const numeroDiasPorMes_disponible = primeraFechaDisponible.numeroDiasPorMes
                                const posicionDia1_disponible = primeraFechaDisponible.posicionDia1
                                posicionDia1 = posicionDia1_disponible
                                numeroDiasPorMes = numeroDiasPorMes_disponible;
                                diaActual_decimal = parseInt(calendario.dia, 10)
                                mesActual_decimal = mes
                                anoActual_decimal = ano
                                tiempo = primeraFechaDisponible.tiempo
                                marcoCalendario.setAttribute("primeraFechaDisponible", `${mes}-${ano}`)
                            } else {
                                posicionDia1 = calendario.posicionDia1
                                numeroDiasPorMes = calendario.numeroDiasPorMes;
                                diaActual_decimal = parseInt(calendario.dia, 10)
                                mesActual_decimal = parseInt(calendario.mes, 10)
                                anoActual_decimal = parseInt(calendario.ano, 10)
                                tiempo = calendario.tiempo
                            }
                            marcoMes.style.gridTemplateRows = valorDinamico({
                                numeroDiasPorMes,
                                posicionDia1
                            })
                            const nombreMesFinal = nombreMes[mesActual_decimal - 1]
                            const indicadorMesAno = nombreMesFinal + " " + anoActual_decimal
                            navegacionMesReferencia.textContent = indicadorMesAno
                            navegacionMesReferencia.setAttribute("ano", anoActual_decimal)
                            navegacionMesReferencia.setAttribute("mes", mesActual_decimal)
                            const limitesPublicos = calendario.limites
                            const diasAntelacion = limitesPublicos.diasAntelacion
                            const limiteFuturo = limitesPublicos.limiteFuturo
                            const diasMaximoReserva = limitesPublicos.diasMaximoReserva
                            marcoCalendario?.setAttribute("perfilMes", perfilMes)
                            const verificaRangoInternamente = (
                                mesActual,
                                anoActual,
                                fechaInicio,
                                fechaSalida
                            ) => {
                                const inicio = new Date(fechaInicio);
                                const fin = new Date(fechaSalida);
                                const inicioMesAno = new Date(inicio.getFullYear(), inicio.getMonth());
                                const finMesAno = new Date(fin.getFullYear(), fin.getMonth());
                                const fechaMesAno = new Date(anoActual, mesActual - 1);
                                return fechaMesAno >= inicioMesAno && fechaMesAno <= finMesAno;
                            };
                            const fechaEntrada = `${fechaEntradaSeleccionada.ano}-${String(fechaEntradaSeleccionada.mes).padStart(2, "0")}-${String(fechaEntradaSeleccionada.dia).padStart(2, "0")}`
                            const fechaSalida = `${fechaSalidaSeleccionada.ano}-${String(fechaSalidaSeleccionada.mes).padStart(2, "0")}-${String(fechaSalidaSeleccionada.dia).padStart(2, "0")}`
                            const fechaLimitePorDiasDeDuracion = (fechaSeleccionada_ISO, diasMaximos) => {
                                const ok = {
                                    arbol: {},
                                    fecha: {}
                                }
                                if (fechaSeleccionada_ISO) {
                                    const fechaLimitePorSeleccion = new Date(fechaSeleccionada_ISO); // Asegúrate de que el formato de la fecha sea 'YYYY-MM-DD'
                                    const numeroDeDiasASumar = Number(diasMaximos);
                                    fechaLimitePorSeleccion.setDate(fechaLimitePorSeleccion.getDate() - numeroDeDiasASumar);
                                    const fechaAdelantada = fechaLimitePorSeleccion
                                    const dia = fechaLimitePorSeleccion.getDate();
                                    const mes = fechaLimitePorSeleccion.getMonth() + 1; // Los meses se indexan desde 0 (enero) a 11 (diciembre)
                                    const ano = fechaLimitePorSeleccion.getFullYear();
                                    ok.fecha.ano = ano
                                    ok.fecha.mes = mes
                                    ok.fecha.dia = dia
                                    ok.arbol[ano] = {
                                        [mes]: {
                                            [dia]: true
                                        }
                                    }
                                }
                                return ok
                            }
                            const objetoFechaLimitePorDias = fechaLimitePorDiasDeDuracion(fechaSalida, diasMaximoReserva)
                            for (let numeroDia = 0; numeroDia < numeroDiasPorMes; numeroDia++) {
                                const diaFinal_decimal = parseInt(numeroDia + 1, 10);
                                const bloqueDia = document.createElement("li")
                                bloqueDia.setAttribute("class", "dia")
                                if (diaFinal_decimal === 1) {
                                    bloqueDia.style.gridColumnStart = posicionDia1
                                }
                                bloqueDia.setAttribute("dia", diaFinal_decimal)
                                bloqueDia.addEventListener("click", pasarelaX)
                                if (tiempo === "presente") {
                                    if (diaFinal_decimal < diaActual_decimal) {
                                        bloqueDia.classList.add("calendarioDiaNoDisponible")
                                        bloqueDia.setAttribute("estadoDia", "noDisponible")
                                    }
                                }
                                if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaParcial") {
                                    bloqueDia.classList.add("calendarioDiaParcial")
                                }
                                if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaCompleto") {
                                    bloqueDia.classList.add("calendarioDiaCompleto")
                                }
                                if (diasAntelacion[anoActual_decimal] &&
                                    diasAntelacion[anoActual_decimal][mesActual_decimal] &&
                                    diasAntelacion[anoActual_decimal][mesActual_decimal][diaFinal_decimal]) {
                                    bloqueDia.classList.add("calendarioDiaNoDisponiblePorAntelacion")
                                    bloqueDia.setAttribute("estadoDia", "noDisponible")
                                }
                                if (anoActual_decimal === limiteFuturo.ano && mesActual_decimal === limiteFuturo.mes) {
                                    if (diaFinal_decimal > limiteFuturo.dia) {
                                        bloqueDia.classList.add("calendarioDiaNoDisponible")
                                        bloqueDia.setAttribute("estadoDia", "noDisponible")
                                    }
                                }
                                if (!Object.keys(fechaEntradaSeleccionada).length && !Object.keys(fechaSalidaSeleccionada).length) {
                                    if (tiempo === "presente") {
                                        if (diaActual_decimal <= diaFinal_decimal) {
                                            if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                                bloqueDia.setAttribute("estadoDia", "disponible")
                                                bloqueDia.classList.add("calendarioDiaDisponible")
                                            }
                                        }
                                    }
                                    if (tiempo === "futuro") {
                                        if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                        }
                                    }
                                }
                                else if (Object.keys(fechaEntradaSeleccionada).length && Object.keys(fechaSalidaSeleccionada).length) {
                                    if (
                                        (mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano)
                                        &&
                                        (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano)
                                    ) {
                                        if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaReservaLimite")
                                            bloqueDia.setAttribute("estadoDia", "noDisponible")
                                        }
                                        if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                        if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaSeleccionado")
                                            bloqueDia.setAttribute("estadoDia", "seleccionado")
                                        }
                                        if (diaFinal_decimal > fechaEntradaSeleccionada.dia && diaFinal_decimal < fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaReserva")
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                        if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaNoDisponible")
                                            bloqueDia.setAttribute("estadoDia", "noDisponible")
                                        }
                                    } else if ((mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano)) {
                                        if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaSeleccionado")
                                            bloqueDia.setAttribute("estadoDia", "seleccionado")
                                        }
                                        if (diaFinal_decimal > fechaEntradaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaReserva")
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                        //if (calendario.tiempo === "futuro") {
                                        if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                        // }
                                    } else if (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano) {
                                        if (diaFinal_decimal < fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaReserva")
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                        if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaNoDisponible")
                                            bloqueDia.setAttribute("estadoDia", "noDisponible")
                                        }
                                        if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaReservaLimite")
                                            bloqueDia.setAttribute("estadoDia", "noDisponible")
                                        }
                                    } else {
                                        if (verificaRangoInternamente(mesActual_decimal, anoActual_decimal, fechaEntrada, fechaSalida)) {
                                            bloqueDia.classList.add("calendarioDiaReserva")
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        } else {
                                            if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                                bloqueDia.classList.add("calendarioDiaDisponible")
                                                bloqueDia.setAttribute("estadoDia", "disponible")
                                            }
                                        }
                                    }
                                }
                                else if (Object.keys(fechaEntradaSeleccionada).length) {
                                    if (mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano) {
                                        if (
                                            (
                                                diaFinal_decimal < fechaEntradaSeleccionada.dia
                                                ||
                                                diaFinal_decimal > fechaEntradaSeleccionada.dia
                                            ) &&
                                            bloqueDia.getAttribute("estadoDia") !== "noDisponible"
                                        ) {
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                            bloqueDia.removeAttribute("estadoDia", "disponible")
                                        }
                                        if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaSeleccionado")
                                            bloqueDia.setAttribute("estadoDia", "seleccionado")
                                        }
                                    } else {
                                        if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                            bloqueDia.removeAttribute("estadoDia", "disponible")
                                        }
                                    }
                                }
                                else if (Object.keys(fechaSalidaSeleccionada).length) {
                                    if (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano) {
                                        if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaReservaLimite")
                                            bloqueDia.setAttribute("estadoDia", "noDisponible")
                                        } else if (
                                            diaFinal_decimal < fechaSalidaSeleccionada.dia
                                            //&&
                                            //bloqueDia.getAttribute("estadoDia") !== "noDisponible"
                                        ) {
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        } else if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaNoDisponible")
                                            bloqueDia.setAttribute("estadoDia", "noDisponible")
                                        }
                                    } else {
                                        if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                    }
                                }
                                if (Object.keys(fechaSalidaSeleccionada).length > 0) {
                                    if (objetoFechaLimitePorDias.arbol[anoActual_decimal] &&
                                        objetoFechaLimitePorDias.arbol[anoActual_decimal][mesActual_decimal]) {
                                        const diaEntradaLimiteReserva = objetoFechaLimitePorDias.fecha.dia
                                        if (diaFinal_decimal < diaEntradaLimiteReserva) {
                                            bloqueDia.classList.add("calendarioDiaNoDisponible")
                                            bloqueDia.setAttribute("estadoDia", "noDisponible")
                                        }
                                    }
                                }
                                if (tiempo === "presente" && diaActual_decimal === diaFinal_decimal) {
                                    bloqueDia.style.border = "3px solid white";
                                    bloqueDia.setAttribute("tipoDia", "hoy")
                                }
                                bloqueDia.textContent = diaFinal_decimal
                                marcoMes.appendChild(bloqueDia)
                            }
                            if (mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano) {
                                let patronConsulta = `[dia='${fechaEntradaSeleccionada.dia}']`
                            }
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"
                            const primeraFechaDisponible = marcoCalendario.getAttribute("primeraFechaDisponible")
                            const fechaActual = `${mesActual_decimal}-${anoActual_decimal}`
                            if (tiempo === "presente" || (fechaActual === primeraFechaDisponible)) {
                                selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 0
                                selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"
                                if ((mesActual_decimal >= limiteFuturo.mes) && (anoActual_decimal >= limiteFuturo.ano)) {
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 0
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"
                                } else if (anoActual_decimal >= fechaSalidaSeleccionada.ano && mesActual_decimal >= fechaSalidaSeleccionada.mes) {
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 0
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"
                                } else {
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                                }
                            } else if (tiempo === "futuro") {
                                selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                                selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
                                if (Object.keys(fechaSalidaSeleccionada).length > 0) {
                                    if (objetoFechaLimitePorDias.arbol[anoActual_decimal] &&
                                        objetoFechaLimitePorDias.arbol[anoActual_decimal][mesActual_decimal]) {
                                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 0
                                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"
                                        selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                                        selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                                    }
                                } if ((mesActual_decimal >= limiteFuturo.mes) && (anoActual_decimal >= limiteFuturo.ano)) {
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 0
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"
                                } else if (anoActual_decimal >= fechaSalidaSeleccionada.ano && mesActual_decimal >= fechaSalidaSeleccionada.mes) {
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 0
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"
                                } else {
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                                }
                            }
                        } else if (perfilMes === "calendario_salida_publico_sinPasado") {
                            let posicionDia1
                            let numeroDiasPorMes
                            let mesActual_decimal
                            let anoActual_decimal
                            let diaActual_decimal
                            let tiempo
                            const limitesPublicos = calendario.limites
                            const diasAntelacion = limitesPublicos.diasAntelacion
                            marcoCalendario.setAttribute("perfilMes", perfilMes)
                            const fechaEntradaVolatil_Humana = document.querySelector("[calendario=entrada]").getAttribute("memoriaVolatil")
                            const fechaEntradaSeleccionada = {}
                            if (fechaEntradaVolatil_Humana) {
                                const fechaEntradaAarray = fechaEntradaVolatil_Humana.split("-")
                                fechaEntradaSeleccionada.dia = parseInt(fechaEntradaAarray[2], 10)
                                fechaEntradaSeleccionada.mes = parseInt(fechaEntradaAarray[1], 10)
                                fechaEntradaSeleccionada.ano = parseInt(fechaEntradaAarray[0], 10)
                            }
                            const fechaSalidaVolatil_Humana = document.querySelector("[calendario=salida]").getAttribute("memoriaVolatil")
                            const fechaSalidaSeleccionada = {}
                            if (fechaSalidaVolatil_Humana) {
                                const fechaSaliraArray = fechaSalidaVolatil_Humana.split("-")
                                fechaSalidaSeleccionada.dia = parseInt(fechaSaliraArray[2], 10)
                                fechaSalidaSeleccionada.mes = parseInt(fechaSaliraArray[1], 10)
                                fechaSalidaSeleccionada.ano = parseInt(fechaSaliraArray[0], 10)
                            }
                            const primeraFechaDisponible = calendario.limites.primeraFechaDisponible
                            const dia_dePrimeraFechaDisponible = primeraFechaDisponible.dia
                            const mes_dePrimeraFechaDisponible = primeraFechaDisponible.mes
                            const ano_dePrimeraFechaDisponible = primeraFechaDisponible.ano
                            const numeroDiasPorMes_dePrimeraFechaDisponible = primeraFechaDisponible.numeroDiasPorMes
                            const posicionDia1_dePrimeraFechaDisponible = primeraFechaDisponible.posicionDia1
                            if (Object.keys(fechaEntradaSeleccionada).length === 0 && Object.keys(fechaSalidaSeleccionada).length === 0 && origen === "configuracionCalendario") {
                                posicionDia1 = posicionDia1_dePrimeraFechaDisponible
                                numeroDiasPorMes = numeroDiasPorMes_dePrimeraFechaDisponible
                                diaActual_decimal = parseInt(calendario.dia, 10)
                                mesActual_decimal = mes_dePrimeraFechaDisponible
                                anoActual_decimal = ano_dePrimeraFechaDisponible
                                tiempo = primeraFechaDisponible.tiempo
                                const diaAdelantado = dia_dePrimeraFechaDisponible === numeroDiasPorMes ? 1 : dia_dePrimeraFechaDisponible + 1
                                const mesPasarela = diaAdelantado === 1 ? mesActual_decimal + 1 : mesActual_decimal
                                const mesAdelantado = mesPasarela === 13 ? 1 : mesPasarela
                                const anoAdelantado = mesAdelantado === 1 ? anoActual_decimal + 1 : anoActual_decimal
                                const estadoResolucion = mesAdelantado !== mesActual_decimal ? "resolver" : "noResolver"
                                if (estadoResolucion === "resolver") {
                                    const calendarioResuelto = await casaVitini.ui.componentes.calendario.resolverCalendarioNuevo({
                                        tipo: "personalizado",
                                        mes: mesAdelantado,
                                        ano: anoAdelantado
                                    })
                                    tiempo = calendarioResuelto.tiempo
                                    diaActual_decimal = diaAdelantado
                                    mesActual_decimal = calendarioResuelto.mes
                                    anoActual_decimal = calendarioResuelto.ano
                                    numeroDiasPorMes = calendarioResuelto.numeroDiasPorMes
                                    posicionDia1 = calendarioResuelto.posicionDia1
                                }
                                marcoCalendario.setAttribute("primeraFechaDisponible", `${mesActual_decimal}-${anoActual_decimal}`)
                            } else {
                                posicionDia1 = calendario.posicionDia1
                                numeroDiasPorMes = calendario.numeroDiasPorMes;
                                diaActual_decimal = parseInt(calendario.dia, 10)
                                mesActual_decimal = parseInt(calendario.mes, 10)
                                anoActual_decimal = parseInt(calendario.ano, 10)
                                tiempo = calendario.tiempo
                            }
                            marcoMes.style.gridTemplateRows = valorDinamico({
                                numeroDiasPorMes,
                                posicionDia1
                            })
                            if (!diasAntelacion.hasOwnProperty(ano_dePrimeraFechaDisponible)) {
                                diasAntelacion[ano_dePrimeraFechaDisponible] = {}
                            }
                            if (!diasAntelacion[ano_dePrimeraFechaDisponible].hasOwnProperty(mes_dePrimeraFechaDisponible)) {
                                diasAntelacion[ano_dePrimeraFechaDisponible][mes_dePrimeraFechaDisponible] = {}
                            }
                            diasAntelacion[ano_dePrimeraFechaDisponible][mes_dePrimeraFechaDisponible][dia_dePrimeraFechaDisponible] = true
                            const nombreMesFinal = nombreMes[mesActual_decimal - 1]
                            const indicadorMesAno = nombreMesFinal + " " + anoActual_decimal
                            navegacionMesReferencia.textContent = indicadorMesAno
                            navegacionMesReferencia.setAttribute("ano", anoActual_decimal)
                            navegacionMesReferencia.setAttribute("mes", mesActual_decimal)
                            const verificaRangoInternamente = (
                                mesActual,
                                anoActual,
                                fechaInicio,
                                fechaSalida
                            ) => {
                                const inicio = new Date(fechaInicio);
                                const fin = new Date(fechaSalida);
                                const inicioMesAno = new Date(inicio.getFullYear(), inicio.getMonth());
                                const finMesAno = new Date(fin.getFullYear(), fin.getMonth());
                                const fechaMesAno = new Date(anoActual, mesActual - 1);
                                return fechaMesAno >= inicioMesAno && fechaMesAno <= finMesAno;
                            };
                            const fechaEntrada = `${fechaEntradaSeleccionada.ano}-${String(fechaEntradaSeleccionada.mes).padStart(2, "0")}-${String(fechaEntradaSeleccionada.dia).padStart(2, "0")}`
                            const fechaSalida = `${fechaSalidaSeleccionada.ano}-${String(fechaSalidaSeleccionada.mes).padStart(2, "0")}-${String(fechaSalidaSeleccionada.dia).padStart(2, "0")}`
                            const limiteFuturo = limitesPublicos.limiteFuturo
                            const diasMaximoReserva = limitesPublicos.diasMaximoReserva
                            const fechaActualPublica = calendario.fechaActualPublica
                            const fechaLimitePorDiasDeDuracion = (fechaSeleccionada_ISO, diasMaximos) => {
                                const ok = {
                                    arbol: {},
                                    fecha: {}
                                }
                                if (fechaSeleccionada_ISO) {
                                    const fechaLimitePorSeleccion = new Date(fechaSeleccionada_ISO); // Asegúrate de que el formato de la fecha sea 'YYYY-MM-DD'
                                    const numeroDeDiasASumar = Number(diasMaximos);
                                    fechaLimitePorSeleccion.setDate(fechaLimitePorSeleccion.getDate() + numeroDeDiasASumar);
                                    const fechaAdelantada = fechaLimitePorSeleccion
                                    const dia = fechaLimitePorSeleccion.getDate();
                                    const mes = fechaLimitePorSeleccion.getMonth() + 1; // Los meses se indexan desde 0 (enero) a 11 (diciembre)
                                    const ano = fechaLimitePorSeleccion.getFullYear();
                                    ok.fecha.ano = ano
                                    ok.fecha.mes = mes
                                    ok.fecha.dia = dia
                                    ok.arbol[ano] = {
                                        [mes]: {
                                            [dia]: true
                                        }
                                    }
                                }
                                return ok
                            }
                            const objetoFechaLimitePorDias = fechaLimitePorDiasDeDuracion(fechaEntrada, diasMaximoReserva)
                            for (let numeroDia = 0; numeroDia < numeroDiasPorMes; numeroDia++) {
                                const diaFinal_decimal = parseInt(numeroDia + 1, 10);
                                const bloqueDia = document.createElement("li")
                                bloqueDia.classList.add("dia")
                                if (diaFinal_decimal === 1) {
                                    bloqueDia.style.gridColumnStart = posicionDia1
                                }
                                bloqueDia.setAttribute("dia", diaFinal_decimal)
                                bloqueDia.addEventListener("click", pasarelaX)
                                if (tiempo === "presente") {
                                    if (diaFinal_decimal < diaActual_decimal) {
                                        bloqueDia.classList.add("calendarioDiaNoDisponible")
                                        bloqueDia.setAttribute("estadoDia", "noDisponible")
                                    }
                                }
                                if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaParcial") {
                                    bloqueDia.classList.add("calendarioDiaParcial")
                                }
                                if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaCompleto") {
                                    bloqueDia.classList.add("calendarioDiaCompleto")
                                }
                                if (diasAntelacion[anoActual_decimal] &&
                                    diasAntelacion[anoActual_decimal][mesActual_decimal] &&
                                    diasAntelacion[anoActual_decimal][mesActual_decimal][diaFinal_decimal]) {
                                    bloqueDia.classList.add("calendarioDiaNoDisponible")
                                    bloqueDia.setAttribute("estadoDia", "noDisponible")
                                }
                                if (objetoFechaLimitePorDias.arbol[anoActual_decimal] &&
                                    objetoFechaLimitePorDias.arbol[anoActual_decimal][mesActual_decimal]) {
                                    const diaSalidaLimiteReserva = objetoFechaLimitePorDias.fecha.dia
                                    if (diaFinal_decimal > diaSalidaLimiteReserva) {
                                        bloqueDia.classList.add("calendarioDiaNoDisponible")
                                        bloqueDia.setAttribute("estadoDia", "noDisponible")
                                    }
                                }
                                if (anoActual_decimal === limiteFuturo.ano && mesActual_decimal === limiteFuturo.mes) {
                                    if (diaFinal_decimal > limiteFuturo.dia) {
                                        bloqueDia.classList.add("calendarioDiaNoDisponible")
                                        bloqueDia.setAttribute("estadoDia", "noDisponible")
                                    }
                                }
                                if (!Object.keys(fechaEntradaSeleccionada).length && !Object.keys(fechaSalidaSeleccionada).length) {
                                    if (tiempo === "presente") {
                                        if (diaActual_decimal <= diaFinal_decimal) {
                                            if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                                bloqueDia.setAttribute("estadoDia", "disponible")
                                                bloqueDia.classList.add("calendarioDiaDisponible")
                                            }
                                        }
                                    } else if (tiempo === "futuro") {
                                        if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                        }
                                    }
                                } else if (Object.keys(fechaEntradaSeleccionada).length && Object.keys(fechaSalidaSeleccionada).length) {
                                    if (
                                        (mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano)
                                        &&
                                        (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano)
                                    ) {
                                        if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaSeleccionado")
                                            bloqueDia.setAttribute("estadoDia", "seleccionado")
                                        }
                                        if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaNoDisponible")
                                            bloqueDia.setAttribute("estadoDia", "noDisponible")
                                        }
                                        if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaReservaLimite")
                                            bloqueDia.classList.remove("calendarioDiaNoDisponiblePorAntelacion")
                                            bloqueDia.classList.remove("calendarioDiaNoDisponible")
                                            bloqueDia.setAttribute("estadoDia", "noDisponible")
                                        }
                                        if (diaFinal_decimal > fechaEntradaSeleccionada.dia && diaFinal_decimal < fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaReserva")
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                        if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                            bloqueDia.setAttribute("destino", "1")
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                    } else if ((mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano)) {
                                        if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaReservaLimite")
                                            bloqueDia.setAttribute("estadoDia", "noDisponible")
                                        }
                                        if (diaFinal_decimal > fechaEntradaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaReserva")
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                        if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                            if (bloqueDia.getAttribute("estadoDia") === "noDisponible") {
                                            }
                                            bloqueDia.classList.add("calendarioDiaNoDisponible")
                                            bloqueDia.setAttribute("estadoDia", "noDisponible")
                                        }
                                        if (tiempo === "futuro") {
                                            if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                            }
                                        }
                                    } else if (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano) {
                                        if (diaFinal_decimal < fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaReserva")
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                        if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                        if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaSeleccionado")
                                            bloqueDia.setAttribute("estadoDia", "seleccionado")
                                        }
                                    } else {
                                        if (verificaRangoInternamente(mesActual_decimal, anoActual_decimal, fechaEntrada, fechaSalida)) {
                                            bloqueDia.classList.add("calendarioDiaReserva")
                                        } else {
                                            if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                                bloqueDia.classList.add("calendarioDiaDisponible")
                                                bloqueDia.setAttribute("estadoDia", "disponible")
                                            }
                                        }
                                    }
                                }
                                else if (Object.keys(fechaEntradaSeleccionada).length) {
                                    if (mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano) {
                                        if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaReservaLimite")
                                            bloqueDia.classList.remove("calendarioDiaNoDisponible")
                                            bloqueDia.setAttribute("estadoDia", "noDisponible")
                                        } else
                                            if (diaFinal_decimal > fechaEntradaSeleccionada.dia &&
                                                bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                                bloqueDia.classList.add("calendarioDiaDisponible")
                                                bloqueDia.setAttribute("estadoDia", "disponible")
                                            } else
                                                if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                                    bloqueDia.classList.add("calendarioDiaNoDisponible")
                                                    bloqueDia.setAttribute("estadoDia", "noDisponible")
                                                }
                                    } else {
                                        if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                    }
                                }
                                else if (Object.keys(fechaSalidaSeleccionada).length) {
                                    if (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano) {
                                        if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaSeleccionado")
                                            bloqueDia.setAttribute("estadoDia", "seleccionado")
                                        }
                                        if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                        if (diaFinal_decimal < fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                    } else {
                                        if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                    }
                                }
                                if (tiempo === "presente" && diaActual_decimal === diaFinal_decimal) {
                                    bloqueDia.style.border = "3px solid white";
                                    bloqueDia.setAttribute("tipoDia", "hoy")
                                }
                                bloqueDia.textContent = diaFinal_decimal
                                marcoMes.appendChild(bloqueDia)
                            }
                            const primeraFechaDisponible_selector = marcoCalendario.getAttribute("primeraFechaDisponible")
                            const fechaActual = `${mesActual_decimal}-${anoActual_decimal}`
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"
                            if (Object.keys(fechaEntradaSeleccionada).length) {
                                if (anoActual_decimal > fechaEntradaSeleccionada.ano) {
                                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
                                } else if (anoActual_decimal === fechaEntradaSeleccionada.ano && mesActual_decimal > fechaEntradaSeleccionada.mes) {
                                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
                                } else {
                                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 0
                                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"
                                }
                            } else if (tiempo === "presente" || (fechaActual === primeraFechaDisponible_selector)) {
                                selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 0
                                selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"
                            } else if (tiempo === "futuro") {
                                selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                                selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
                            }
                            if (objetoFechaLimitePorDias.arbol[anoActual_decimal]
                                &&
                                (Object.keys(fechaEntradaSeleccionada).length)
                                &&
                                (objetoFechaLimitePorDias.arbol[anoActual_decimal][mesActual_decimal])
                            ) {
                                selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 0
                                selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"
                            } else if (tiempo === "presente" || tiempo === "futuro") {
                                if (anoActual_decimal < limiteFuturo.ano) {
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                                } else if (anoActual_decimal === limiteFuturo.ano && mesActual_decimal < limiteFuturo.mes) {
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                                } else {
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 0
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"
                                }
                            }
                        } else if (perfilMes === "calendario_entrada_asistido_detallesReserva_conPasado") {
                            const mesActual_string = String(calendario.mes).padStart(2, '0');
                            const anoActual_string = String(calendario.ano).padStart(4, '0');
                            const mesActual_decimal = parseInt(calendario.mes, 10)
                            const anoActual_decimal = parseInt(calendario.ano, 10)
                            const reservaUID = document.querySelector("[reservaUID]")?.getAttribute("reservaUID")
                            const fechaSalidaReservaArray = document.querySelector("[calendario=salida]")?.getAttribute("memoriaVolatil").split("-")
                            const diaSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[2], 10)
                            const mesSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[1], 10)
                            const anoSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[0], 10)
                            const fechaEntradaReserva = document.querySelector("[calendario=entrada]")?.getAttribute("memoriaVolatil").split("-")
                            const diaEntradaReserva_decimal = parseInt(fechaEntradaReserva[2], 10)
                            const mesEntradaReserva_decimal = parseInt(fechaEntradaReserva[1], 10)
                            const anoEntradaReserva_decimal = parseInt(fechaEntradaReserva[0], 10)
                            const fechaEntrada = `${anoEntradaReserva_decimal}-${String(mesEntradaReserva_decimal).padStart(2, "0")}-${String(diaEntradaReserva_decimal).padStart(2, "0")}`
                            const fechaSalida = `${anoSalidaReserva_decimal}-${String(mesSalidaReserva_decimal).padStart(2, "0")}-${String(diaSalidaReserva_decimal).padStart(2, "0")}`
                            const verificaRangoInternamente = (
                                mesActual,
                                anoActual,
                                fechaInicio,
                                fechaSalida
                            ) => {
                                const inicio = new Date(fechaInicio);
                                const fin = new Date(fechaSalida);
                                const inicioMesAno = new Date(inicio.getFullYear(), inicio.getMonth());
                                const finMesAno = new Date(fin.getFullYear(), fin.getMonth());
                                const fechaMesAno = new Date(anoActual, mesActual - 1);
                                return fechaMesAno >= inicioMesAno && fechaMesAno <= finMesAno;
                            };
                            const infoCalendario = selectorCalendarioRenderizado.querySelector("[componente=infoCalendario]")
                            const controlLimitePasado = {
                                zona: "administracion/reservas/detallesReserva/global/obtenerElasticidadDelRango",
                                reservaUID: String(reservaUID),
                                mesCalendario: mesActual_string,
                                anoCalendario: anoActual_string,
                                sentidoRango: "pasado"
                            }
                            const resolverLimitePasado = await casaVitini.shell.servidor(controlLimitePasado)
                            const fechaLimitePasado = {}
                            if (resolverLimitePasado.error) {
                                casaVitini.shell.controladoresUI.limpiarTodoElementoFlotante()
                                const selectorCalendarioRenderizados = document.querySelectorAll("[componente=bloqueCalendario]")
                                selectorCalendarioRenderizados.forEach((calendario) => {
                                    calendario.remove()
                                })
                                return casaVitini.ui.componentes.advertenciaInmersiva(resolverLimitePasado.error)
                            } else if (resolverLimitePasado.ok === "rangoPasadoLibre") {
                                infoCalendario.textContent = "Todo el mes disponible para seleccionar la nueva fecha de entrada de esta reserva"
                            } else if (resolverLimitePasado.limitePasado) {
                                const fechaLimitePasado_Array = resolverLimitePasado.limitePasado.split("-")
                                if (resolverLimitePasado.ok === "noHayRangoPasado") {
                                    infoCalendario.textContent = "La fecha de entrada de esta reserva no puede ser inferior a la actual porque no hay rango disponible."
                                    fechaLimitePasado.dia = parseInt(fechaLimitePasado_Array[2], 10)
                                    fechaLimitePasado.mes = parseInt(fechaLimitePasado_Array[1], 10)
                                    fechaLimitePasado.ano = parseInt(fechaLimitePasado_Array[0], 10)
                                }
                                if (resolverLimitePasado.ok === "rangoPasadoLimitado") {
                                    infoCalendario.textContent = "Una parte de este mes está disponible para seleccionar la nueva fecha de entrada para esta reserva."
                                    fechaLimitePasado.dia = parseInt(fechaLimitePasado_Array[2], 10)
                                    fechaLimitePasado.mes = parseInt(fechaLimitePasado_Array[1], 10)
                                    fechaLimitePasado.ano = parseInt(fechaLimitePasado_Array[0], 10)
                                }
                            } else if (resolverLimitePasado.tipo === "ROL") {
                                const selectorCalendarioRenderizados = document.querySelectorAll("[componente=bloqueCalendario]")
                                selectorCalendarioRenderizados.forEach((calendario) => {
                                    calendario?.remove()
                                })
                                return
                            }
                            marcoCalendario.setAttribute("perfilMes", perfilMes)
                            for (let numeroDia = 0; numeroDia < numeroDiasPorMes; numeroDia++) {
                                const diaFinal_decimal = parseInt(numeroDia + 1, 10);
                                const bloqueDia = document.createElement("li")
                                bloqueDia.setAttribute("class", "dia")
                                bloqueDia.textContent = diaFinal_decimal
                                if (diaFinal_decimal === 1) {
                                    bloqueDia.style.gridColumnStart = posicionDia1
                                }
                                bloqueDia.setAttribute("dia", diaFinal_decimal)
                                if (resolverLimitePasado.limitePasado) {
                                    if (mesActual_decimal === fechaLimitePasado.mes && anoActual_decimal === fechaLimitePasado.ano) {
                                        if (fechaLimitePasado.dia === diaFinal_decimal) {
                                            bloqueDia.classList.remove("calendarioDiaDisponible")
                                            bloqueDia.classList.remove("calendarioDiaReserva")
                                            bloqueDia.classList.add("calendarioDiaNoDisponible")
                                            bloqueDia.style.pointerEvents = "none"
                                            bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                            bloqueDia.removeEventListener("click", pasarelaX)
                                        } else if (fechaLimitePasado.dia > diaFinal_decimal) {
                                            bloqueDia.classList.remove("calendarioDiaDisponible")
                                            bloqueDia.classList.remove("calendarioDiaReserva")
                                            bloqueDia.classList.add("calendarioDiaNoDisponible")
                                            bloqueDia.style.pointerEvents = "none"
                                            bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                            bloqueDia.removeEventListener("click", pasarelaX)
                                        }
                                    }
                                }
                                if (calendario.tiempo === "presente") {
                                    if (diaFinal_decimal === diaActual_decimal) {
                                        bloqueDia.style.border = "3px solid ghostwhite"
                                    }
                                }
                                if (
                                    (mesActual_decimal === mesEntradaReserva_decimal && anoActual_decimal === anoEntradaReserva_decimal)
                                    &&
                                    (mesActual_decimal === mesSalidaReserva_decimal && anoActual_decimal === anoSalidaReserva_decimal)
                                ) {
                                    if (diaFinal_decimal === diaSalidaReserva_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReservaLimite")
                                        bloqueDia.classList.remove("calendarioDiaNoDisponible")
                                        bloqueDia.style.pointerEvents = "none"
                                        bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                        bloqueDia.textContent = "S " + diaFinal_decimal
                                    } else if (diaFinal_decimal < diaEntradaReserva_decimal) {
                                        bloqueDia.classList.add("calendarioDiaDisponible")
                                        bloqueDia.addEventListener("click", pasarelaX)
                                    } else if (diaFinal_decimal === diaEntradaReserva_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReservaLimite")
                                        bloqueDia.classList.remove("calendarioDiaNoDisponible")
                                        bloqueDia.style.pointerEvents = "none"
                                        bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                        bloqueDia.textContent = "E " + diaFinal_decimal
                                    } else if (diaFinal_decimal > diaEntradaReserva_decimal && diaFinal_decimal < diaSalidaReserva_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReserva")
                                        bloqueDia.addEventListener("click", pasarelaX)
                                    } else if (diaFinal_decimal > diaSalidaReserva_decimal) {
                                        bloqueDia.classList.add("calendarioDiaNoDisponible")
                                    }
                                } else if ((mesActual_decimal === mesEntradaReserva_decimal && anoActual_decimal === anoEntradaReserva_decimal)) {
                                    if (diaFinal_decimal === diaEntradaReserva_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReservaLimite")
                                        bloqueDia.classList.remove("calendarioDiaNoDisponible")
                                        bloqueDia.style.pointerEvents = "none"
                                        bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                        bloqueDia.textContent = "E " + diaFinal_decimal
                                    }
                                    if (diaFinal_decimal > diaEntradaReserva_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReserva")
                                        bloqueDia.addEventListener("click", pasarelaX)
                                    }
                                    if (diaFinal_decimal < diaEntradaReserva_decimal) {
                                        bloqueDia.classList.add("calendarioDiaDisponible")
                                        bloqueDia.addEventListener("click", pasarelaX)
                                    }
                                } else if (mesActual_decimal === mesSalidaReserva_decimal && anoActual_decimal === anoSalidaReserva_decimal) {
                                    if (diaFinal_decimal < diaSalidaReserva_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReserva")
                                        bloqueDia.addEventListener("click", pasarelaX)
                                    }
                                    if (diaFinal_decimal > diaSalidaReserva_decimal) {
                                        bloqueDia.classList.add("calendarioDiaNoDisponible")
                                    }
                                    if (diaFinal_decimal === diaSalidaReserva_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReservaLimite")
                                        bloqueDia.classList.remove("calendarioDiaNoDisponible")
                                        bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                        bloqueDia.style.pointerEvents = "none"
                                        bloqueDia.textContent = "S " + diaFinal_decimal
                                    }
                                } else {
                                    if (verificaRangoInternamente(mesActual_decimal, anoActual_decimal, fechaEntrada, fechaSalida)) {
                                        bloqueDia.classList.add("calendarioDiaReserva")
                                        bloqueDia.addEventListener("click", pasarelaX)
                                    } else {
                                        bloqueDia.classList.add("calendarioDiaDisponible")
                                        bloqueDia.addEventListener("click", pasarelaX)
                                    }
                                }
                                marcoMes.appendChild(bloqueDia)
                            }
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
                            if (mesActual_decimal === mesSalidaReserva_decimal && anoActual_decimal === anoSalidaReserva_decimal) {
                                selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 0
                                selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"
                            }
                            if (mesActual_decimal === fechaLimitePasado.mes && anoActual_decimal === fechaLimitePasado.ano) {
                                selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 0
                                selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"
                            }
                        } else if (perfilMes === "calendario_salida_asistido_detallesReserva_conPasado") {
                            const mesActual_string = String(calendario.mes).padStart(2, '0');
                            const anoActual_string = String(calendario.ano).padStart(4, '0');
                            const mesActual_decimal = parseInt(calendario.mes, 10)
                            const anoActual_decimal = parseInt(calendario.ano, 10)
                            const reservaUID = document.querySelector("[reservaUID]")?.getAttribute("reservaUID")
                            const fechaSalidaReservaArray = document.querySelector("[calendario=salida]")?.getAttribute("memoriaVolatil").split("-")
                            const diaSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[2], 10)
                            const mesSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[1], 10)
                            const anoSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[0], 10)
                            const fechaEntradaReserva = document.querySelector("[calendario=entrada]")?.getAttribute("memoriaVolatil").split("-")
                            const diaEntradaReserva_decimal = parseInt(fechaEntradaReserva[2], 10)
                            const mesEntradaReserva_decimal = parseInt(fechaEntradaReserva[1], 10)
                            const anoEntradaReserva_decimal = parseInt(fechaEntradaReserva[0], 10)
                            const fechaEntrada = `${anoEntradaReserva_decimal}-${String(mesEntradaReserva_decimal).padStart(2, "0")}-${String(diaEntradaReserva_decimal).padStart(2, "0")}`
                            const fechaSalida = `${anoSalidaReserva_decimal}-${String(mesSalidaReserva_decimal).padStart(2, "0")}-${String(diaSalidaReserva_decimal).padStart(2, "0")}`
                            const verificaRangoInternamente = (
                                mesActual,
                                anoActual,
                                fechaInicio,
                                fechaSalida
                            ) => {
                                const inicio = new Date(fechaInicio);
                                const fin = new Date(fechaSalida);
                                const inicioMesAno = new Date(inicio.getFullYear(), inicio.getMonth());
                                const finMesAno = new Date(fin.getFullYear(), fin.getMonth());
                                const fechaMesAno = new Date(anoActual, mesActual - 1);
                                return fechaMesAno >= inicioMesAno && fechaMesAno <= finMesAno;
                            };
                            const controlLimiteFuturo = {
                                zona: "administracion/reservas/detallesReserva/global/obtenerElasticidadDelRango",
                                reservaUID: String(reservaUID),
                                mesCalendario: mesActual_string,
                                anoCalendario: anoActual_string,
                                sentidoRango: "futuro"
                            }
                            const resolverLimiteFuturo = await casaVitini.shell.servidor(controlLimiteFuturo)
                            if (resolverLimiteFuturo.error) {
                                const selectorCalendarioRenderizados = document.querySelectorAll("[componente=bloqueCalendario]")
                                selectorCalendarioRenderizados.forEach((calendario) => {
                                    calendario?.remove()
                                })
                                return casaVitini.ui.componentes.advertenciaInmersiva(resolverLimiteFuturo.error)
                            }
                            const fechaLimiteFuturo = {}
                            if (resolverLimiteFuturo.ok === "rangoFuturoLibre") {
                                infoCalendario.textContent = "Todo el mes disponible para seleccionar la nueva fecha de salida de esta reserva"
                            } else if (resolverLimiteFuturo.limiteFuturo) {
                                const fechaLimiteFuturo_Array = resolverLimiteFuturo.limiteFuturo.split("-")
                                if (resolverLimiteFuturo.ok === "noHayRangoFuturo") {
                                    infoCalendario.textContent = "La fecha de salida de esta reserva no puede ser superior a la actual por que no hay rango disponible"
                                    fechaLimiteFuturo.dia = parseInt(fechaLimiteFuturo_Array[2], 10)
                                    fechaLimiteFuturo.mes = parseInt(fechaLimiteFuturo_Array[1], 10)
                                    fechaLimiteFuturo.ano = parseInt(fechaLimiteFuturo_Array[0], 10)
                                }
                                if (resolverLimiteFuturo.ok === "rangoFuturoLimitado") {
                                    infoCalendario.textContent = "Una parte de este mes está disponible para seleccionar la nueva fecha de salida para esta reserva"
                                    fechaLimiteFuturo.dia = parseInt(fechaLimiteFuturo_Array[2], 10)
                                    fechaLimiteFuturo.mes = parseInt(fechaLimiteFuturo_Array[1], 10)
                                    fechaLimiteFuturo.ano = parseInt(fechaLimiteFuturo_Array[0], 10)
                                }
                            } else if (resolverLimiteFuturo.tipo === "ROL") {
                                const selectorCalendarioRenderizados = document.querySelectorAll("[componente=bloqueCalendario]")
                                selectorCalendarioRenderizados.forEach((calendario) => {
                                    calendario?.remove()
                                })
                                return
                            }
                            marcoCalendario?.setAttribute("perfilMes", perfilMes)
                            for (let numeroDia = 0; numeroDia < numeroDiasPorMes; numeroDia++) {
                                const diaFinal_decimal = parseInt(numeroDia + 1, 10);
                                const bloqueDia = document.createElement("li")
                                bloqueDia.setAttribute("class", "dia")
                                bloqueDia.textContent = diaFinal_decimal
                                if (diaFinal_decimal === 1) {
                                    bloqueDia.style.gridColumnStart = posicionDia1
                                }
                                bloqueDia.setAttribute("dia", diaFinal_decimal)
                                if (calendario.tiempo === "presente") {
                                    if (diaFinal_decimal === diaActual_decimal) {
                                        bloqueDia.style.border = "3px solid ghostwhite"
                                    }
                                }
                                if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaParcial") {
                                    bloqueDia.classList.add("calendarioDiaParcial")
                                }
                                if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaCompleto") {
                                    bloqueDia.classList.add("calendarioDiaCompleto")
                                }
                                if (resolverLimiteFuturo.limiteFuturo) {
                                    if (mesActual_decimal === fechaLimiteFuturo.mes && anoActual_decimal === fechaLimiteFuturo.ano) {
                                        if (fechaLimiteFuturo.dia === diaFinal_decimal) {
                                            bloqueDia.classList.remove("calendarioDiaDisponible")
                                            bloqueDia.classList.add("calendarioDiaNoDisponible")
                                            bloqueDia.style.pointerEvents = "none"
                                            bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                            bloqueDia.removeEventListener("click", pasarelaX)
                                        } else
                                            if (fechaLimiteFuturo.dia < diaFinal_decimal) {
                                                bloqueDia.classList.remove("calendarioDiaDisponible")
                                                bloqueDia.classList.add("calendarioDiaNoDisponible")
                                                bloqueDia.style.pointerEvents = "none"
                                                bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                                bloqueDia.removeEventListener("click", pasarelaX)
                                            }
                                    }
                                }
                                if (
                                    (mesActual_decimal === mesEntradaReserva_decimal && anoActual_decimal === anoEntradaReserva_decimal)
                                    &&
                                    (mesActual_decimal === mesSalidaReserva_decimal && anoActual_decimal === anoSalidaReserva_decimal)
                                ) {
                                    if (diaFinal_decimal === diaSalidaReserva_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReservaLimite")
                                        bloqueDia.classList.remove("calendarioDiaNoDisponible")
                                        bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                        bloqueDia.textContent = "S1 " + diaFinal_decimal
                                        bloqueDia.style.pointerEvents = "none"
                                    } else if (diaFinal_decimal < diaEntradaReserva_decimal) {
                                        bloqueDia.classList.add("calendarioDiaNoDisponible")
                                        bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                    } else if (diaFinal_decimal === diaEntradaReserva_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReservaLimite")
                                        bloqueDia.textContent = "E " + diaFinal_decimal
                                        bloqueDia.style.pointerEvents = "none"
                                    } else if (diaFinal_decimal > diaEntradaReserva_decimal && diaFinal_decimal < diaSalidaReserva_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReserva")
                                        bloqueDia.addEventListener("click", pasarelaX)
                                    } else if (diaFinal_decimal > diaSalidaReserva_decimal) {
                                        bloqueDia.classList.add("calendarioDiaDisponible")
                                        bloqueDia.addEventListener("click", pasarelaX)
                                    }
                                } else if ((mesActual_decimal === mesEntradaReserva_decimal && anoActual_decimal === anoEntradaReserva_decimal)) {
                                    if (diaFinal_decimal === diaEntradaReserva_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReservaLimite")
                                        bloqueDia.classList.remove("calendarioDiaNoDisponible")
                                        bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                        bloqueDia.textContent = "E " + diaFinal_decimal
                                        bloqueDia.style.pointerEvents = "none"
                                    }
                                    if (diaFinal_decimal > diaEntradaReserva_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReserva")
                                        bloqueDia.addEventListener("click", pasarelaX)
                                    }
                                    if (diaFinal_decimal < diaEntradaReserva_decimal) {
                                        if (bloqueDia.getAttribute("estadoDia") === "noDisponible") {
                                        }
                                        bloqueDia.classList.add("calendarioDiaNoDisponible")
                                        bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                    }
                                    if (calendario.tiempo === "futuro") {
                                        if (diaFinal_decimal < diaEntradaReserva_decimal) {
                                        }
                                    }
                                } else if (mesActual_decimal === mesSalidaReserva_decimal && anoActual_decimal === anoSalidaReserva_decimal) {
                                    if (diaFinal_decimal < diaSalidaReserva_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReserva")
                                        bloqueDia.addEventListener("click", pasarelaX)
                                    }
                                    if (diaFinal_decimal > diaSalidaReserva_decimal) {
                                        bloqueDia.classList.add("calendarioDiaDisponible")
                                        bloqueDia.addEventListener("click", pasarelaX)
                                    }
                                    if (diaFinal_decimal === diaSalidaReserva_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReservaLimite")
                                        bloqueDia.classList.remove("calendarioDiaNoDisponible")
                                        bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                        bloqueDia.textContent = "S " + diaFinal_decimal
                                        bloqueDia.style.pointerEvents = "none"
                                    }
                                } else {
                                    if (verificaRangoInternamente(mesActual_decimal, anoActual_decimal, fechaEntrada, fechaSalida)) {
                                        bloqueDia.classList.add("calendarioDiaReserva")
                                        bloqueDia.addEventListener("click", pasarelaX)
                                    } else {
                                        bloqueDia.classList.add("calendarioDiaDisponible")
                                        bloqueDia.addEventListener("click", pasarelaX)
                                    }
                                }
                                // if (resolverLimiteFuturo.limiteFuturo) {
                                //     if (mesActual_decimal === fechaLimiteFuturo.mes && anoActual_decimal === fechaLimiteFuturo.ano) {
                                //         if (fechaLimiteFuturo.dia === diaFinal_decimal) {
                                //             bloqueDia.classList.remove("calendarioDiaDisponible")
                                //              bloqueDia.classList.add("calendarioDiaNoDisponible")
                                //             bloqueDia.style.pointerEvents = "none"
                                //             bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                //             bloqueDia.removeEventListener("click", pasarelaX)
                                //         } else
                                //             if (fechaLimiteFuturo.dia <= diaFinal_decimal) {
                                //             bloqueDia.classList.remove("calendarioDiaDisponible")
                                //             bloqueDia.classList.add("calendarioDiaNoDisponible")
                                //             bloqueDia.style.pointerEvents = "none"
                                //             bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                //             bloqueDia.removeEventListener("click", pasarelaX)
                                //         }
                                //     }
                                // }
                                marcoMes?.appendChild(bloqueDia)
                            }
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"

                            if (mesActual_decimal === mesEntradaReserva_decimal && anoActual_decimal === anoEntradaReserva_decimal) {
                                selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 0
                                selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"
                            }
                            if (mesActual_decimal === fechaLimiteFuturo.mes && anoActual_decimal === fechaLimiteFuturo.ano) {
                                selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 0
                                selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"
                            }
                        } else if (perfilMes === "calendario_entrada_asistido_detallesReserva_checkIn_conPasado") {
                            const mesActual_decimal = parseInt(calendario.mes, 10)
                            const anoActual_decimal = parseInt(calendario.ano, 10)
                            const fechaCheckIN = document
                                .querySelector(`[instanciaUID="${instanciaUID}"]`)
                                .closest("[fechaCheckIn]")
                                ?.getAttribute("fechaCheckIn")
                            const fechaCheckOutAdelantado = document
                                .querySelector(`[instanciaUID="${instanciaUID}"]`)
                                .closest("[fechaCheckOut]")
                                ?.getAttribute("fechaCheckOut")
                            const fechaSalidaReservaArray = document.querySelector("[calendario=salida]")?.getAttribute("memoriaVolatil").split("-")
                            const diaSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[2], 10)
                            const mesSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[1], 10)
                            const anoSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[0], 10)
                            const fechaEntradaReserva = document.querySelector("[calendario=entrada]")?.getAttribute("memoriaVolatil").split("-")
                            const diaEntradaReserva_decimal = parseInt(fechaEntradaReserva[2], 10)
                            const mesEntradaReserva_decimal = parseInt(fechaEntradaReserva[1], 10)
                            const anoEntradaReserva_decimal = parseInt(fechaEntradaReserva[0], 10)
                            const fechaEntrada = `${anoEntradaReserva_decimal}-${String(mesEntradaReserva_decimal).padStart(2, "0")}-${String(diaEntradaReserva_decimal).padStart(2, "0")}`
                            const fechaSalida = `${anoSalidaReserva_decimal}-${String(mesSalidaReserva_decimal).padStart(2, "0")}-${String(diaSalidaReserva_decimal).padStart(2, "0")}`
                            const verificaRangoInternamente = (
                                mesActual,
                                anoActual,
                                fechaInicio,
                                fechaSalida
                            ) => {
                                const inicio = new Date(fechaInicio);
                                const fin = new Date(fechaSalida);
                                const inicioMesAno = new Date(inicio.getFullYear(), inicio.getMonth());
                                const finMesAno = new Date(fin.getFullYear(), fin.getMonth());
                                const fechaMesAno = new Date(anoActual, mesActual - 1);
                                return fechaMesAno >= inicioMesAno && fechaMesAno <= finMesAno;
                            };
                            marcoCalendario.setAttribute("perfilMes", perfilMes)
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
                            if (mesActual_decimal === mesSalidaReserva_decimal && anoActual_decimal === anoSalidaReserva_decimal) {
                                selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 0
                                selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"
                            }
                            if (mesActual_decimal === mesEntradaReserva_decimal && anoActual_decimal === anoEntradaReserva_decimal) {
                                selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 0
                                selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"
                            }
                            for (let numeroDia = 0; numeroDia < numeroDiasPorMes; numeroDia++) {
                                const diaFinal_decimal = Number(numeroDia + 1);
                                const bloqueDia = document.createElement("li")
                                bloqueDia.setAttribute("class", "dia")
                                bloqueDia.textContent = diaFinal_decimal
                                if (diaFinal_decimal === 1) {
                                    bloqueDia.style.gridColumnStart = posicionDia1
                                }
                                bloqueDia.setAttribute("dia", diaFinal_decimal)
                                bloqueDia.style.pointerEvents = "none"
                                if (calendario.tiempo === "presente") {
                                    if (diaFinal_decimal === diaActual_decimal) {
                                        bloqueDia.style.border = "3px solid ghostwhite"
                                    }
                                }
                                const mesEntradaRenderizado = (mesActual_decimal === mesEntradaReserva_decimal && anoActual_decimal === anoEntradaReserva_decimal)
                                const mesSalidaRenderzado = (mesActual_decimal === mesSalidaReserva_decimal && anoActual_decimal === anoSalidaReserva_decimal)
                                const mesInternoRango = verificaRangoInternamente(mesActual_decimal, anoActual_decimal, fechaEntrada, fechaSalida)
                                const mesEntradaSalidaRenderizado = (
                                    (mesActual_decimal === mesEntradaReserva_decimal && anoActual_decimal === anoEntradaReserva_decimal) &&
                                    (mesActual_decimal === mesSalidaReserva_decimal && anoActual_decimal === anoSalidaReserva_decimal)
                                )
                                if (mesEntradaSalidaRenderizado) {
                                    if (diaEntradaReserva_decimal > diaFinal_decimal) {
                                        bloqueDia.style.pointerEvents = "none"
                                        bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                    }
                                    if (diaEntradaReserva_decimal === diaFinal_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReserva")
                                        bloqueDia.style.pointerEvents = "all"
                                        bloqueDia.textContent = "E " + diaFinal_decimal
                                        bloqueDia.addEventListener("click", pasarelaX)
                                    }
                                    if (diaEntradaReserva_decimal < diaFinal_decimal && diaSalidaReserva_decimal > diaFinal_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReserva")
                                        bloqueDia.style.pointerEvents = "all"
                                        bloqueDia.addEventListener("click", pasarelaX)
                                    }
                                    if (diaSalidaReserva_decimal === diaFinal_decimal) {
                                        bloqueDia.style.pointerEvents = "none"
                                        bloqueDia.textContent = "S " + diaFinal_decimal
                                        bloqueDia.classList.add("calendarioDiaReservaLimite")
                                    }
                                    if (diaSalidaReserva_decimal < diaFinal_decimal) {
                                        bloqueDia.style.pointerEvents = "none"
                                        bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                    }
                                }
                                else if (mesEntradaRenderizado) {
                                    if (diaEntradaReserva_decimal > diaFinal_decimal) {
                                        bloqueDia.style.pointerEvents = "none"
                                        bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                    }
                                    if (diaEntradaReserva_decimal === diaFinal_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReserva")
                                        bloqueDia.textContent = "E " + diaFinal_decimal
                                        bloqueDia.style.pointerEvents = "all"
                                        bloqueDia.addEventListener("click", pasarelaX)
                                    }
                                    if (diaEntradaReserva_decimal < diaFinal_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReserva")
                                        bloqueDia.style.pointerEvents = "all"
                                        bloqueDia.addEventListener("click", pasarelaX)
                                    }
                                }
                                else if (mesSalidaRenderzado) {
                                    if (diaSalidaReserva_decimal > diaFinal_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReserva")
                                        bloqueDia.style.pointerEvents = "all"
                                        bloqueDia.addEventListener("click", pasarelaX)
                                    }
                                    if (diaSalidaReserva_decimal === diaFinal_decimal) {
                                        bloqueDia.style.pointerEvents = "none"
                                        bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                        bloqueDia.textContent = "S " + diaFinal_decimal
                                        bloqueDia.classList.add("calendarioDiaReservaLimite")
                                    }
                                    if (diaSalidaReserva_decimal < diaFinal_decimal) {
                                        bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                    }
                                }
                                else if (mesInternoRango) {
                                    bloqueDia.classList.add("calendarioDiaReserva")
                                    bloqueDia.style.pointerEvents = "all"
                                    bloqueDia.addEventListener("click", pasarelaX)
                                }
                                if (fechaCheckIN) {
                                    const fechaCheckIN_array = fechaCheckIN.split("-")
                                    const diaCheckIn = Number(fechaCheckIN_array[2])
                                    const mesCheckIn = Number(fechaCheckIN_array[1])
                                    const anoCheckIn = Number(fechaCheckIN_array[0])
                                    if (mesActual_decimal === mesCheckIn && anoActual_decimal === anoCheckIn) {
                                        if (diaCheckIn === diaFinal_decimal) {
                                            bloqueDia.classList.remove("calendarioDiaReserva")
                                            bloqueDia.classList.remove("calendarioDiaDisponible")
                                            bloqueDia.classList.add("calendarioDiaSeleccionado")
                                            bloqueDia.style.pointerEvents = "none"
                                            bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                        }
                                    }
                                }
                                if (fechaCheckOutAdelantado) {
                                    const fechaCheckOutAdelantado_array = fechaCheckOutAdelantado.split("-")
                                    const diaCheckOut = Number(fechaCheckOutAdelantado_array[2])
                                    const mesCheckOut = Number(fechaCheckOutAdelantado_array[1])
                                    const anoCheckOut = Number(fechaCheckOutAdelantado_array[0])
                                    if (mesActual_decimal === mesCheckOut && anoActual_decimal === anoCheckOut) {
                                        if (diaCheckOut === diaFinal_decimal) {
                                            bloqueDia.classList.remove("calendarioDiaReserva")
                                            bloqueDia.classList.remove("calendarioDiaDisponible")
                                            bloqueDia.style.pointerEvents = "none"
                                            bloqueDia.classList.add("calendarioDiaReservaLimite")
                                            bloqueDia.textContent = "COa " + diaFinal_decimal
                                            bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                        }
                                        if (diaCheckOut < diaFinal_decimal && diaSalidaReserva_decimal > diaFinal_decimal) {
                                            bloqueDia.classList.remove("calendarioDiaReserva")
                                            bloqueDia.classList.remove("calendarioDiaDisponible")
                                            bloqueDia.classList.add("calendarioDiaNoDisponible")
                                            bloqueDia.style.pointerEvents = "none"
                                            bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                        } else if (diaCheckOut < diaFinal_decimal) {
                                            bloqueDia.classList.remove("calendarioDiaReserva")
                                            bloqueDia.classList.remove("calendarioDiaDisponible")
                                            bloqueDia.classList.add("calendarioDiaNoDisponible")
                                            bloqueDia.style.pointerEvents = "none"
                                            bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                        }
                                        selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 0
                                        selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"
                                    }
                                }
                                marcoMes.appendChild(bloqueDia)
                            }
                        } else if (perfilMes === "calendario_salida_asistido_detallesReserva_checkOut_conPasado") {
                            const mesActual_string = String(calendario.mes).padStart(2, '0');
                            const anoActual_string = String(calendario.ano).padStart(4, '0');
                            const mesActual_decimal = parseInt(calendario.mes, 10)
                            const anoActual_decimal = parseInt(calendario.ano, 10)
                            const fechaCheckOut = document
                                .querySelector(`[instanciaUID="${instanciaUID}"]`)
                                .closest("[fechaCheckOut]")
                                ?.getAttribute("fechaCheckOut")
                            const fechaCheckIN = document
                                .querySelector(`[instanciaUID="${instanciaUID}"]`)
                                .closest("[fechaCheckIn]")
                                ?.getAttribute("fechaCheckIn")
                            const fechaSalidaReservaArray = document.querySelector("[calendario=salida]")?.getAttribute("memoriaVolatil").split("-")
                            const diaSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[2], 10)
                            const mesSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[1], 10)
                            const anoSalidaReserva_decimal = parseInt(fechaSalidaReservaArray[0], 10)
                            const fechaEntradaReserva = document.querySelector("[calendario=entrada]")?.getAttribute("memoriaVolatil").split("-")
                            const diaEntradaReserva_decimal = parseInt(fechaEntradaReserva[2], 10)
                            const mesEntradaReserva_decimal = parseInt(fechaEntradaReserva[1], 10)
                            const anoEntradaReserva_decimal = parseInt(fechaEntradaReserva[0], 10)
                            const fechaEntrada = `${anoEntradaReserva_decimal}-${String(mesEntradaReserva_decimal).padStart(2, "0")}-${String(diaEntradaReserva_decimal).padStart(2, "0")}`
                            const fechaSalida = `${anoSalidaReserva_decimal}-${String(mesSalidaReserva_decimal).padStart(2, "0")}-${String(diaSalidaReserva_decimal).padStart(2, "0")}`
                            const verificaRangoInternamente = (
                                mesActual,
                                anoActual,
                                fechaInicio,
                                fechaSalida
                            ) => {
                                const inicio = new Date(fechaInicio);
                                const fin = new Date(fechaSalida);
                                const inicioMesAno = new Date(inicio.getFullYear(), inicio.getMonth());
                                const finMesAno = new Date(fin.getFullYear(), fin.getMonth());
                                const fechaMesAno = new Date(anoActual, mesActual - 1);
                                return fechaMesAno >= inicioMesAno && fechaMesAno <= finMesAno;
                            };
                            marcoCalendario.setAttribute("perfilMes", perfilMes)
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
                            if (mesActual_decimal === mesSalidaReserva_decimal && anoActual_decimal === anoSalidaReserva_decimal) {
                                selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 0
                                selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"
                            }
                            if (mesActual_decimal === mesEntradaReserva_decimal && anoActual_decimal === anoEntradaReserva_decimal) {
                                selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 0
                                selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"
                            }
                            for (let numeroDia = 0; numeroDia < numeroDiasPorMes; numeroDia++) {
                                const diaFinal_decimal = Number(numeroDia + 1);
                                const bloqueDia = document.createElement("li")
                                bloqueDia.setAttribute("class", "dia")
                                bloqueDia.textContent = diaFinal_decimal
                                if (diaFinal_decimal === 1) {
                                    bloqueDia.style.gridColumnStart = posicionDia1
                                }
                                bloqueDia.setAttribute("dia", diaFinal_decimal)
                                bloqueDia.style.pointerEvents = "none"
                                if (calendario.tiempo === "presente") {
                                    if (diaFinal_decimal === diaActual_decimal) {
                                        bloqueDia.style.border = "3px solid ghostwhite"
                                    }
                                }
                                const mesEntradaRenderizado = (mesActual_decimal === mesEntradaReserva_decimal && anoActual_decimal === anoEntradaReserva_decimal)
                                const mesSalidaRenderzado = (mesActual_decimal === mesSalidaReserva_decimal && anoActual_decimal === anoSalidaReserva_decimal)
                                const mesInternoRango = verificaRangoInternamente(mesActual_decimal, anoActual_decimal, fechaEntrada, fechaSalida)
                                const mesEntradaSalidaRenderizado = (
                                    (mesActual_decimal === mesEntradaReserva_decimal && anoActual_decimal === anoEntradaReserva_decimal) &&
                                    (mesActual_decimal === mesSalidaReserva_decimal && anoActual_decimal === anoSalidaReserva_decimal)
                                )
                                if (mesEntradaSalidaRenderizado) {
                                    if (diaEntradaReserva_decimal > diaFinal_decimal) {
                                        bloqueDia.style.pointerEvents = "none"
                                        bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                    }
                                    if (diaEntradaReserva_decimal === diaFinal_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReservaLimite")
                                        bloqueDia.textContent = "E " + diaFinal_decimal
                                    }
                                    if (diaEntradaReserva_decimal < diaFinal_decimal && diaSalidaReserva_decimal > diaFinal_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReserva")
                                        bloqueDia.style.pointerEvents = "all"
                                        bloqueDia.addEventListener("click", pasarelaX)
                                    }
                                    if (diaSalidaReserva_decimal === diaFinal_decimal) {
                                        bloqueDia.style.pointerEvents = "none"
                                        bloqueDia.textContent = "S " + diaFinal_decimal
                                        bloqueDia.classList.add("calendarioDiaReservaLimite")
                                    }
                                    if (diaSalidaReserva_decimal < diaFinal_decimal) {
                                        bloqueDia.style.pointerEvents = "none"
                                        bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                    }
                                }
                                else if (mesEntradaRenderizado) {
                                    if (diaEntradaReserva_decimal > diaFinal_decimal) {
                                        bloqueDia.style.pointerEvents = "none"
                                        bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                    }
                                    if (diaEntradaReserva_decimal === diaFinal_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReservaLimite")
                                        bloqueDia.textContent = "E " + diaFinal_decimal
                                        bloqueDia.style.pointerEvents = "all"
                                    }
                                    if (diaEntradaReserva_decimal < diaFinal_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReserva")
                                        bloqueDia.style.pointerEvents = "all"
                                        bloqueDia.addEventListener("click", pasarelaX)
                                    }
                                }
                                else if (mesSalidaRenderzado) {
                                    if (diaSalidaReserva_decimal > diaFinal_decimal) {
                                        bloqueDia.classList.add("calendarioDiaReserva")
                                        bloqueDia.style.pointerEvents = "all"
                                        bloqueDia.addEventListener("click", pasarelaX)
                                    }
                                    if (diaSalidaReserva_decimal === diaFinal_decimal) {
                                        bloqueDia.style.pointerEvents = "none"
                                        bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                        bloqueDia.textContent = "S " + diaFinal_decimal
                                        bloqueDia.classList.add("calendarioDiaReservaLimite")
                                    }
                                    if (diaSalidaReserva_decimal < diaFinal_decimal) {
                                        bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                    }
                                }
                                else if (mesInternoRango) {
                                    bloqueDia.classList.add("calendarioDiaReserva")
                                    bloqueDia.style.pointerEvents = "all"
                                    bloqueDia.addEventListener("click", pasarelaX)
                                }
                                if (fechaCheckIN) {
                                    const fechaCheckIN_Array = fechaCheckIN.split("-")
                                    const diaCheckIn = Number(fechaCheckIN_Array[2])
                                    const mesCheckIn = Number(fechaCheckIN_Array[1])
                                    const anoCheckIn = Number(fechaCheckIN_Array[0])
                                    if (mesActual_decimal === mesCheckIn && anoActual_decimal === anoCheckIn) {
                                        if (diaCheckIn === diaFinal_decimal) {
                                            bloqueDia.classList.remove("calendarioDiaReserva")
                                            bloqueDia.classList.remove("calendarioDiaDisponible")
                                            bloqueDia.style.pointerEvents = "none"
                                            bloqueDia.classList.add("calendarioDiaReservaLimite")
                                            bloqueDia.textContent = "CI " + diaFinal_decimal
                                            bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                        }
                                        if (diaCheckIn > diaFinal_decimal && diaEntradaReserva_decimal < diaFinal_decimal) {
                                            bloqueDia.classList.remove("calendarioDiaReserva")
                                            bloqueDia.classList.remove("calendarioDiaDisponible")
                                            bloqueDia.classList.add("calendarioDiaNoDisponible")
                                            bloqueDia.style.pointerEvents = "none"
                                            bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                        } else if (diaCheckIn > diaFinal_decimal) {
                                            bloqueDia.classList.remove("calendarioDiaReserva")
                                            bloqueDia.classList.remove("calendarioDiaDisponible")
                                            bloqueDia.style.pointerEvents = "none"
                                            bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                        }
                                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 0
                                        selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"
                                    }
                                }
                                if (fechaCheckOut) {
                                    const fechaCheckOut_array = fechaCheckOut.split("-")
                                    const diaCheckOut = Number(fechaCheckOut_array[2])
                                    const mesCheckOut = Number(fechaCheckOut_array[1])
                                    const anoCheckOut = Number(fechaCheckOut_array[0])
                                    if (mesActual_decimal === mesCheckOut && anoActual_decimal === anoCheckOut) {
                                        if (diaCheckOut === diaFinal_decimal) {
                                            bloqueDia.classList.remove("calendarioDiaDisponible")
                                            bloqueDia.classList.add("calendarioDiaSeleccionado")
                                            bloqueDia.style.pointerEvents = "none"
                                            bloqueDia.setAttribute("estadoDia", "deshabilitado")
                                        }
                                    }
                                }
                                marcoMes.appendChild(bloqueDia)
                            }
                        } else if (perfilMes === "calendario_entrada_perfilSimple") {
                            const contenedorFechas = document.querySelector(`[instanciaUID_contenedorFechas="${instanciaUID_contenedorFechas}"]`)
                            if (!contenedorFechas) {
                                const error = "El perfil de calendario_entrada_perfilSimple no encuentra el contenedor de fechas de destino"
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                casaVitini.ui.componentes.advertenciaInmersiva(error)
                            }
                            const seleccionableDiaLimite = marcoCalendario?.getAttribute("seleccionableDiaLimite")
                            const mesActual_string = String(calendario.mes).padStart(2, '0')
                            const anoActual_string = String(calendario.ano).padStart(4, '0')
                            const mesActual_decimal = parseInt(calendario.mes, 10)
                            const anoActual_decimal = parseInt(calendario.ano, 10)
                            const fechaEntradaSelecionda = contenedorFechas.querySelector("[calendario=entrada]")?.getAttribute("memoriaVolatil")
                            const fechaEntradaSeleccionada = {}
                            if (fechaEntradaSelecionda) {
                                fechaEntradaSeleccionada.dia = parseInt(fechaEntradaSelecionda.split("-")[2], 10)
                                fechaEntradaSeleccionada.mes = parseInt(fechaEntradaSelecionda.split("-")[1], 10)
                                fechaEntradaSeleccionada.ano = parseInt(fechaEntradaSelecionda.split("-")[0], 10)
                            }
                            const fechaSalidaSelecionda = contenedorFechas.querySelector("[calendario=salida]")?.getAttribute("memoriaVolatil")
                            const fechaSalidaSeleccionada = {}
                            if (fechaSalidaSelecionda) {
                                fechaSalidaSeleccionada.dia = parseInt(fechaSalidaSelecionda.split("-")[2], 10)
                                fechaSalidaSeleccionada.mes = parseInt(fechaSalidaSelecionda.split("-")[1], 10)
                                fechaSalidaSeleccionada.ano = parseInt(fechaSalidaSelecionda.split("-")[0], 10)
                            }
                            marcoCalendario?.setAttribute("perfilMes", perfilMes)
                            const verificaRangoInternamente = (
                                mesActual,
                                anoActual,
                                fechaInicio,
                                fechaSalida
                            ) => {
                                const inicio = new Date(fechaInicio);
                                const fin = new Date(fechaSalida);
                                const inicioMesAno = new Date(inicio.getFullYear(), inicio.getMonth());
                                const finMesAno = new Date(fin.getFullYear(), fin.getMonth());
                                const fechaMesAno = new Date(anoActual, mesActual - 1);
                                return fechaMesAno >= inicioMesAno && fechaMesAno <= finMesAno;
                            };
                            const fechaEntrada = `${fechaEntradaSeleccionada.ano}-${String(fechaEntradaSeleccionada.mes).padStart(2, "0")}-${String(fechaEntradaSeleccionada.dia).padStart(2, "0")}`
                            const fechaSalida = `${fechaSalidaSeleccionada.ano}-${String(fechaSalidaSeleccionada.mes).padStart(2, "0")}-${String(fechaSalidaSeleccionada.dia).padStart(2, "0")}`
                            for (let numeroDia = 0; numeroDia < numeroDiasPorMes; numeroDia++) {
                                const diaFinal_decimal = parseInt(numeroDia + 1, 10);
                                const bloqueDia = document.createElement("li")
                                bloqueDia.setAttribute("class", "dia")
                                bloqueDia.textContent = diaFinal_decimal
                                if (diaFinal_decimal === 1) {
                                    bloqueDia.style.gridColumnStart = posicionDia1
                                }
                                bloqueDia.setAttribute("dia", diaFinal_decimal)
                                if (calendario.tiempo === "presente") {
                                    if (diaFinal_decimal === diaActual_decimal) {
                                        bloqueDia.style.border = "3px solid ghostwhite"
                                    }
                                }
                                if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaParcial") {
                                    bloqueDia.classList.add("calendarioDiaParcial")
                                }
                                if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaCompleto") {
                                    bloqueDia.classList.add("calendarioDiaCompleto")
                                }
                                if (Object.keys(fechaEntradaSeleccionada).length && Object.keys(fechaSalidaSeleccionada).length) {
                                    if (
                                        (mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano)
                                        &&
                                        (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano)
                                    ) {
                                        if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                            if (seleccionableDiaLimite === "si") {
                                                bloqueDia.classList.add("calendarioDiaReserva")
                                                bloqueDia.addEventListener("click", pasarelaX)
                                                bloqueDia.setAttribute("estadoDia", "seleccionado")
                                            } else {
                                                bloqueDia.classList.add("calendarioDiaReservaLimite")
                                                bloqueDia.setAttribute("estadoDia", "noDisponible")
                                            }
                                        } else if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        } else if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaSeleccionado")
                                            bloqueDia.setAttribute("estadoDia", "seleccionado")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                        } else if (diaFinal_decimal > fechaEntradaSeleccionada.dia && diaFinal_decimal < fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaReserva")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        } else if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaNoDisponible")
                                            bloqueDia.setAttribute("estadoDia", "noDisponible")
                                        }
                                    } else if ((mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano)) {
                                        if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaSeleccionado")
                                            bloqueDia.setAttribute("estadoDia", "seleccionado")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                        }
                                        if (diaFinal_decimal > fechaEntradaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaReserva")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                        if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                    } else if (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano) {
                                        if (diaFinal_decimal < fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaReserva")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        } else if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaNoDisponible")
                                            bloqueDia.setAttribute("estadoDia", "noDisponible")
                                        } else if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                            if (seleccionableDiaLimite === "si") {
                                                bloqueDia.classList.add("calendarioDiaReserva")
                                                bloqueDia.addEventListener("click", pasarelaX)
                                                bloqueDia.setAttribute("estadoDia", "disponible")
                                            } else {
                                                bloqueDia.classList.add("calendarioDiaReservaLimite")
                                                bloqueDia.setAttribute("estadoDia", "noDisponible")
                                            }
                                        }
                                    } else {
                                        if (verificaRangoInternamente(mesActual_decimal, anoActual_decimal, fechaEntrada, fechaSalida)) {
                                            bloqueDia.classList.add("calendarioDiaReserva")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        } else {
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                    }
                                }
                                else if (Object.keys(fechaEntradaSeleccionada).length) {
                                    if (mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano) {
                                        if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaSeleccionado")
                                            bloqueDia.setAttribute("estadoDia", "seleccionado")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                        } else {
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                    } else {
                                        bloqueDia.classList.add("calendarioDiaDisponible")
                                        bloqueDia.addEventListener("click", pasarelaX)
                                        bloqueDia.setAttribute("estadoDia", "disponible")
                                    }
                                }
                                else if (Object.keys(fechaSalidaSeleccionada).length) {
                                    if (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano) {
                                        if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                            if (seleccionableDiaLimite === "si") {
                                                bloqueDia.classList.add("calendarioDiaDisponible")
                                                bloqueDia.addEventListener("click", pasarelaX)
                                                bloqueDia.setAttribute("estadoDia", "disponible")
                                            } else {
                                                bloqueDia.classList.add("calendarioDiaReservaLimite")
                                                bloqueDia.setAttribute("estadoDia", "noDisponible")
                                            }
                                        } else if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaNoDisponible")
                                            bloqueDia.setAttribute("estadoDia", "noDisponible")
                                        } else if (diaFinal_decimal < fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                    } else {
                                        bloqueDia.classList.add("calendarioDiaDisponible")
                                        bloqueDia.addEventListener("click", pasarelaX)
                                        bloqueDia.setAttribute("estadoDia", "disponible")
                                    }
                                } else if (!Object.keys(fechaSalidaSeleccionada).length && !Object.keys(fechaEntradaSeleccionada).length) {
                                    if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                        bloqueDia.classList.add("calendarioDiaDisponible")
                                        bloqueDia.addEventListener("click", pasarelaX)
                                        bloqueDia.setAttribute("estadoDia", "disponible")
                                    }
                                }
                                marcoMes?.appendChild(bloqueDia)
                            }
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
                            if (Object.keys(fechaSalidaSeleccionada).length) {
                                if (anoActual_decimal < fechaSalidaSeleccionada.ano) {
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                                } else if (anoActual_decimal === fechaSalidaSeleccionada.ano && mesActual_decimal < fechaSalidaSeleccionada.mes) {
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                                } else {
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 0
                                    selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "none"
                                }
                            } else {
                                selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                                selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                            }
                        } else if (perfilMes === "calendario_salida_perfilSimple") {
                            const contenedorFechas = document.querySelector(`[instanciaUID_contenedorFechas="${instanciaUID_contenedorFechas}"]`)
                            if (!contenedorFechas) {
                                const error = "El perfil de calendario_salida_perfilSimple no encuentra el contenedor de fechas de destino"
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                casaVitini.ui.componentes.advertenciaInmersiva(error)
                            }
                            const seleccionableDiaLimite = marcoCalendario?.getAttribute("seleccionableDiaLimite")
                            const mesActual_string = String(calendario.mes).padStart(2, '0')
                            const anoActual_string = String(calendario.ano).padStart(4, '0')
                            const mesActual_decimal = parseInt(calendario.mes, 10)
                            const anoActual_decimal = parseInt(calendario.ano, 10)
                            const fechaEntradaSelecionda = contenedorFechas.querySelector("[calendario=entrada]")?.getAttribute("memoriaVolatil")
                            const fechaEntradaSeleccionada = {}
                            if (fechaEntradaSelecionda) {
                                fechaEntradaSeleccionada.dia = parseInt(fechaEntradaSelecionda.split("-")[2], 10)
                                fechaEntradaSeleccionada.mes = parseInt(fechaEntradaSelecionda.split("-")[1], 10)
                                fechaEntradaSeleccionada.ano = parseInt(fechaEntradaSelecionda.split("-")[0], 10)
                            }
                            const fechaSalidaSelecionda = contenedorFechas.querySelector("[calendario=salida]")?.getAttribute("memoriaVolatil")
                            const fechaSalidaSeleccionada = {}
                            if (fechaSalidaSelecionda) {
                                fechaSalidaSeleccionada.dia = parseInt(fechaSalidaSelecionda.split("-")[2], 10)
                                fechaSalidaSeleccionada.mes = parseInt(fechaSalidaSelecionda.split("-")[1], 10)
                                fechaSalidaSeleccionada.ano = parseInt(fechaSalidaSelecionda.split("-")[0], 10)
                            }
                            marcoCalendario.setAttribute("perfilMes", perfilMes)
                            const verificaRangoInternamente = (
                                mesActual,
                                anoActual,
                                fechaInicio,
                                fechaSalida
                            ) => {
                                const inicio = new Date(fechaInicio);
                                const fin = new Date(fechaSalida);
                                const inicioMesAno = new Date(inicio.getFullYear(), inicio.getMonth());
                                const finMesAno = new Date(fin.getFullYear(), fin.getMonth());
                                const fechaMesAno = new Date(anoActual, mesActual - 1);
                                return fechaMesAno >= inicioMesAno && fechaMesAno <= finMesAno;
                            };
                            const fechaEntrada = `${fechaEntradaSeleccionada.ano}-${String(fechaEntradaSeleccionada.mes).padStart(2, "0")}-${String(fechaEntradaSeleccionada.dia).padStart(2, "0")}`
                            const fechaSalida = `${fechaSalidaSeleccionada.ano}-${String(fechaSalidaSeleccionada.mes).padStart(2, "0")}-${String(fechaSalidaSeleccionada.dia).padStart(2, "0")}`
                            for (let numeroDia = 0; numeroDia < numeroDiasPorMes; numeroDia++) {
                                const diaFinal_decimal = parseInt(numeroDia + 1, 10);
                                const bloqueDia = document.createElement("li")
                                bloqueDia.setAttribute("class", "dia")
                                bloqueDia.textContent = diaFinal_decimal
                                if (diaFinal_decimal === 1) {
                                    bloqueDia.style.gridColumnStart = posicionDia1
                                }
                                bloqueDia.setAttribute("dia", diaFinal_decimal)
                                if (calendario.tiempo === "presente") {
                                    if (diaFinal_decimal === diaActual_decimal) {
                                        bloqueDia.style.border = "3px solid ghostwhite"
                                    }
                                }
                                if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaParcial") {
                                    bloqueDia.classList.add("calendarioDiaParcial")
                                }
                                if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaCompleto") {
                                    bloqueDia.classList.add("calendarioDiaCompleto")
                                }
                                if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaCompleto") {
                                    bloqueDia.classList.add("calendarioDiaCompleto")
                                }
                                if (Object.keys(fechaEntradaSeleccionada).length && Object.keys(fechaSalidaSeleccionada).length) {
                                    if ((mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano)
                                        &&
                                        (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano)) {
                                        if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaSeleccionado")
                                            bloqueDia.setAttribute("estadoDia", "seleccionado")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                        } else if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaNoDisponible")
                                            bloqueDia.setAttribute("estadoDia", "noDisponible")
                                        } else if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                            if (seleccionableDiaLimite === "si") {
                                                bloqueDia.classList.add("calendarioDiaReserva")
                                                bloqueDia.addEventListener("click", pasarelaX)
                                                bloqueDia.setAttribute("estadoDia", "disponible")
                                            } else {
                                                bloqueDia.classList.add("calendarioDiaReservaLimite")
                                            }
                                        } else if (diaFinal_decimal > fechaEntradaSeleccionada.dia && diaFinal_decimal < fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaReserva")
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                        } else if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                    } else if ((mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano)) {
                                        if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                            if (seleccionableDiaLimite === "si") {
                                                bloqueDia.classList.add("calendarioDiaDisponible")
                                                bloqueDia.addEventListener("click", pasarelaX)
                                                bloqueDia.setAttribute("estadoDia", "disponible")
                                            } else {
                                                bloqueDia.classList.add("calendarioDiaReservaLimite")
                                                bloqueDia.setAttribute("estadoDia", "noDisponible")
                                            }
                                        }
                                        if (diaFinal_decimal > fechaEntradaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaReserva")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                        if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                            if (bloqueDia.getAttribute("estadoDia") === "noDisponible") {
                                            }
                                            bloqueDia.classList.add("calendarioDiaNoDisponible")
                                        }
                                        if (calendario.tiempo === "futuro") {
                                            if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                            }
                                        }
                                    } else if (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano) {
                                        if (diaFinal_decimal < fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaReserva")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                        if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                        if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaSeleccionado")
                                            bloqueDia.setAttribute("estadoDia", "seleccionado")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                        }
                                    } else {
                                        if (verificaRangoInternamente(mesActual_decimal, anoActual_decimal, fechaEntrada, fechaSalida)) {
                                            bloqueDia.classList.add("calendarioDiaReserva")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        } else {
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                    }
                                } else if (Object.keys(fechaEntradaSeleccionada).length && !Object.keys(fechaSalidaSeleccionada).length) {
                                    if (mesActual_decimal === fechaEntradaSeleccionada.mes && anoActual_decimal === fechaEntradaSeleccionada.ano) {
                                        if (diaFinal_decimal === fechaEntradaSeleccionada.dia) {
                                            if (seleccionableDiaLimite === "si") {
                                                bloqueDia.classList.add("calendarioDiaDisponible")
                                                bloqueDia.addEventListener("click", pasarelaX)
                                                bloqueDia.setAttribute("estadoDia", "disponible")
                                            } else {
                                                bloqueDia.classList.add("calendarioDiaReservaLimite")
                                                bloqueDia.setAttribute("estadoDia", "noDisponible")
                                            }
                                        }
                                        if (diaFinal_decimal > fechaEntradaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                        if (diaFinal_decimal < fechaEntradaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaNoDisponible")
                                            bloqueDia.setAttribute("estadoDia", "noDisponible")
                                        }
                                    } else {
                                        bloqueDia.classList.add("calendarioDiaDisponible")
                                        bloqueDia.addEventListener("click", pasarelaX)
                                        bloqueDia.setAttribute("estadoDia", "disponible")
                                    }
                                }
                                else if (Object.keys(fechaSalidaSeleccionada).length && !Object.keys(fechaEntradaSeleccionada).length) {
                                    if (mesActual_decimal === fechaSalidaSeleccionada.mes && anoActual_decimal === fechaSalidaSeleccionada.ano) {
                                        if (diaFinal_decimal === fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaSeleccionado")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                            bloqueDia.setAttribute("estadoDia", "seleccionado")
                                        }
                                        if (diaFinal_decimal > fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                        if (diaFinal_decimal < fechaSalidaSeleccionada.dia) {
                                            bloqueDia.classList.add("calendarioDiaDisponible")
                                            bloqueDia.addEventListener("click", pasarelaX)
                                            bloqueDia.setAttribute("estadoDia", "disponible")
                                        }
                                    } else {
                                        bloqueDia.classList.add("calendarioDiaDisponible")
                                        bloqueDia.addEventListener("click", pasarelaX)
                                        bloqueDia.setAttribute("estadoDia", "disponible")
                                    }
                                } else if (!Object.keys(fechaSalidaSeleccionada).length && !Object.keys(fechaEntradaSeleccionada).length) {
                                    if (bloqueDia.getAttribute("estadoDia") !== "noDisponible") {
                                        bloqueDia.classList.add("calendarioDiaDisponible")
                                        bloqueDia.addEventListener("click", pasarelaX)
                                        bloqueDia.setAttribute("estadoDia", "disponible")
                                    }
                                }
                                marcoMes.appendChild(bloqueDia)
                            }
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                            if (Object.keys(fechaEntradaSeleccionada).length) {
                                if (anoActual_decimal > fechaEntradaSeleccionada.ano) {
                                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
                                } else if (anoActual_decimal === fechaEntradaSeleccionada.ano && mesActual_decimal > fechaEntradaSeleccionada.mes) {
                                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
                                } else {
                                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 0
                                    selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "none"
                                }
                            } else {
                                selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                                selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
                            }
                        } else if (perfilMes === "calendario_unico_perfilSimple") {
                            const contenedorFechas = document.querySelector(`[instanciaUID_contenedorFechas="${instanciaUID_contenedorFechas}"]`)
                            if (!contenedorFechas) {
                                const error = "El perfil de calendario_unico_perfilSimple no encuentra el contenedor de fechas de destino"
                                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                                casaVitini.ui.componentes.advertenciaInmersiva(error)
                            }
                            const mesActual_decimal = parseInt(calendario.mes, 10)
                            const anoActual_decimal = parseInt(calendario.ano, 10)
                            const selectorFechaUnica = contenedorFechas.querySelector("[calendario=unico]")?.getAttribute("memoriaVolatil")
                            const fechaUnicaSeleccionada = {}
                            if (selectorFechaUnica) {
                                fechaUnicaSeleccionada.dia = parseInt(selectorFechaUnica.split("-")[2], 10)
                                fechaUnicaSeleccionada.mes = parseInt(selectorFechaUnica.split("-")[1], 10)
                                fechaUnicaSeleccionada.ano = parseInt(selectorFechaUnica.split("-")[0], 10)
                            }
                            marcoCalendario?.setAttribute("perfilMes", perfilMes)
                            for (let numeroDia = 0; numeroDia < numeroDiasPorMes; numeroDia++) {
                                const diaFinal_decimal = parseInt(numeroDia + 1, 10);
                                const bloqueDia = document.createElement("li")
                                bloqueDia.setAttribute("class", "dia")
                                bloqueDia.textContent = diaFinal_decimal
                                bloqueDia.classList.add("calendarioDiaDisponible")
                                bloqueDia.addEventListener("click", pasarelaX)
                                if (diaFinal_decimal === 1) {
                                    bloqueDia.style.gridColumnStart = posicionDia1
                                }
                                bloqueDia.setAttribute("dia", diaFinal_decimal)
                                if (calendario.tiempo === "presente") {
                                    if (diaFinal_decimal === diaActual_decimal) {
                                        bloqueDia.style.border = "3px solid ghostwhite"
                                    }
                                }
                                if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaParcial") {
                                    bloqueDia.classList.add("calendarioDiaParcial")
                                }
                                if (detallesDiasOcupacion[diaFinal_decimal]?.estadoDia === "diaCompleto") {
                                    bloqueDia.classList.add("calendarioDiaCompleto")
                                }
                                if (Object.keys(fechaUnicaSeleccionada).length) {
                                    if (mesActual_decimal === fechaUnicaSeleccionada.mes && anoActual_decimal === fechaUnicaSeleccionada.ano) {
                                        if (diaFinal_decimal === fechaUnicaSeleccionada.dia) {
                                            bloqueDia.classList.remove("calendarioDiaDisponible")
                                            bloqueDia.classList.add("calendarioDiaSeleccionado")
                                            bloqueDia.setAttribute("estadoDia", "seleccionado")
                                        }
                                    }
                                }
                                marcoMes?.appendChild(bloqueDia)
                            }
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAtras").style.pointerEvents = "all"
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.opacity = 1
                            selectorCalendarioRenderizado.querySelector("#botonAdelante").style.pointerEvents = "all"
                        }
                        if (instanciaUID_procesoCambioMes) {
                            const selectorMarcoMesRenderizadoEnEspera = selectorCalendarioRenderizado
                                .querySelector(`[inctanciaUID_procesoCambioMes="${instanciaUID_procesoCambioMes}"]`)
                            if (!selectorMarcoMesRenderizadoEnEspera) {
                                return
                            }
                        }
                        if (selectorCalendarioRenderizado) {
                            selectorCalendarioRenderizado.querySelector("[contenedor=construyendoCalendario]")?.remove()
                            selectorCalendarioRenderizado.querySelector("[contenedor=calendario]").removeAttribute("style")
                        }
                    } catch (errorCapturado) {
                        throw errorCapturado
                    }
                },
                resolverCalendarioNuevo: async (data) => {
                    const respuestaServidor = await casaVitini.shell.servidor({
                        zona: "componentes/calendario",
                        ...data
                    })
                    if (respuestaServidor?.error) {
                        const selectorContenedorCalendario = document.querySelectorAll("[componente=bloqueCalendario]")
                        selectorContenedorCalendario.forEach((bloqueCalendario) => {
                            bloqueCalendario.remove()
                        })
                        return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                    }
                    if (respuestaServidor?.calendario) {
                        return respuestaServidor;
                    }
                },
                navegacionCalendarioNuevo: async (calendario) => {
                    const boton = calendario.target.getAttribute("sentido")
                    const selectorBotones = calendario.target.closest("[contenedor=calendario]").querySelectorAll("[sentido]")
                    selectorBotones.forEach((botonRenderizado) => {
                        botonRenderizado.style.pointerEvents = "none"
                        botonRenderizado.style.opacity = "0"
                    })
                    const instanciaUID = calendario.target.closest("[instanciaUID]").getAttribute("instanciaUID")
                    const instanciaUID_contenedorFechas = calendario.target.closest("[instanciaUID]").getAttribute("instanciaUID_contenedorFechas")
                    const mesReferencia = document.querySelector("[componente=mesReferencia]")
                    let mesActual = Number(mesReferencia.getAttribute("mes"))
                    let anoActual = Number(mesReferencia.getAttribute("ano"))
                    mesReferencia.innerHTML = null
                    const instanciaUID_procesoCambioMes = casaVitini.utilidades.codigoFechaInstancia()
                    if (boton === "adelante") {
                        if (mesActual + 1 < 13) {
                            mesActual = mesActual + 1
                        } else {
                            mesActual = 1
                            anoActual = anoActual + 1
                        }
                    }
                    if (boton === "atras") {
                        if (mesActual - 1 > 0) {
                            mesActual = mesActual - 1
                        } else {
                            mesActual = 12
                            anoActual = anoActual - 1
                        }
                    }
                    const calendarioconstruir = {
                        tipo: "personalizado",
                        ano: anoActual,
                        mes: mesActual
                    }
                    const calendarioRenderizado = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                    const contenedorCalendario = calendarioRenderizado.querySelector(`[contenedor=calendario]`)
                    const selectorMarcoMesRenderizado = calendarioRenderizado.querySelector(`[componente=marcoMes]`)
                    selectorMarcoMesRenderizado.removeAttribute("style")
                    selectorMarcoMesRenderizado.style.gridTemplateRows = "min-content min-content"
                    selectorMarcoMesRenderizado.style.flex = "0"
                    const selectorDiasRenderizados = calendarioRenderizado.querySelectorAll("[dia]")
                    selectorDiasRenderizados.forEach((diaRenderizado) => {
                        diaRenderizado.remove()
                    })
                    const contenedorconstruyendoCalendarioRenderizado = calendarioRenderizado.querySelectorAll("[contenedor=construyendoCalendario]")
                    contenedorconstruyendoCalendarioRenderizado.forEach((contenedorRenderizado) => {
                        contenedorRenderizado.remove()
                    })
                    const spinner = casaVitini.ui.componentes.spinnerSimple()
                    const contenedorCarga = document.createElement("div")
                    contenedorCarga.classList.add("componente_calendario_contenedoCarga_Mes")
                    contenedorCarga.setAttribute("contenedor", "construyendoCalendario")
                    contenedorCarga.setAttribute("elemento", "flotante")
                    contenedorCarga.appendChild(spinner)
                    contenedorCalendario.appendChild(contenedorCarga)
                    const calendarioResuelto = await casaVitini.ui.componentes.calendario.resolverCalendarioNuevo(calendarioconstruir)
                    calendarioResuelto.instanciaUID = instanciaUID
                    calendarioResuelto.instanciaUID_contenedorFechas = instanciaUID_contenedorFechas
                    calendarioResuelto.instanciaUID_procesoCambioMes = instanciaUID_procesoCambioMes
                    selectorMarcoMesRenderizado.setAttribute("inctanciaUID_procesoCambioMes", instanciaUID_procesoCambioMes)
                    casaVitini.ui.componentes.calendario.constructorMesNuevo(calendarioResuelto)
                },
                seleccionarDiaProcesadoNuevo: (metadatosDia) => {
                    let dia;
                    let estadoDia;
                    let diaSeleccionadoComoElemento;
                    if (metadatosDia.tipo === "desdeClick") {
                        dia = metadatosDia.diaSeleccionado
                        estadoDia = metadatosDia.estadoDia
                        diaSeleccionadoComoElemento = document.querySelector("li[dia='" + dia + "']")
                    }
                    if (typeof metadatosDia === "number") {
                        dia = metadatosDia;
                        diaSeleccionadoComoElemento = document.querySelector("li[dia='" + dia + "']")
                    }
                    let calendario = document.querySelector("[componente=bloqueCalendario] [componente=marcoCalendario]")
                    let calendarioIO = calendario.getAttribute("calendarioIO")
                    let botonAtras = document.querySelector("#botonAtras")
                    let botonAdelante = document.getElementById("botonAdelante")
                    let fechaEntrada = document.getElementById("fechaEntrada")
                    let fechaSalida = document.getElementById("fechaSalida")
                    let almacenamientoLocalID = calendario.getAttribute("almacenamientoCalendarioID")
                    let perfilMes = calendario.getAttribute("perfilMes")
                    let tiempo = document.querySelector("[componente=mesReferencia]").getAttribute("tiempo")
                    let reserva = localStorage.getItem(almacenamientoLocalID) ? JSON.parse(localStorage.getItem(almacenamientoLocalID)) : {};
                    if (diaSeleccionadoComoElemento.getAttribute("estadoDia") === "seleccionado") {
                        if (diaSeleccionadoComoElemento.getAttribute("tipoDia") === "hoy") {
                            diaSeleccionadoComoElemento.style.background = "red"
                            diaSeleccionadoComoElemento.style.color = ""
                        } else {
                            diaSeleccionadoComoElemento.style.background = ""
                            diaSeleccionadoComoElemento.style.color = ""
                        }
                        if (calendarioIO === "entrada") {
                            fechaEntrada.textContent = 'Seleccionar dia de entrada'
                            delete reserva.entrada
                            document.querySelector("[calendario=entrada]").removeAttribute("memoriaVolatil")
                        }
                        if (calendarioIO === "salida") {
                            fechaSalida.textContent = 'Seleccionar dia de salida2'
                            delete reserva.salida
                            document.querySelector("[calendario=salida]").removeAttribute("memoriaVolatil")
                        }
                        diaSeleccionadoComoElemento.removeAttribute("estadoDia")
                        document.getElementById("botonSiguientePaso")?.remove()
                        localStorage.setItem(almacenamientoLocalID, JSON.stringify(reserva))
                        return
                    }
                    let diasDisponibles = document.querySelectorAll("[estado=disponible]")
                    for (const diaDisponible of diasDisponibles) {
                        if (diaDisponible.getAttribute("estado") !== "deshabilitado") {
                            diaDisponible.style.background = ""
                            diaDisponible.style.color = ""
                            diaDisponible.removeAttribute("estadoDia")
                            diaDisponible.style.pointerEvents = "all"
                        }
                        if (diaDisponible.getAttribute("tipoDia") === "hoy") {
                            diaDisponible.removeAttribute("estadoDia")
                            diaDisponible.style.pointerEvents = "all"
                        }
                    }
                    diaSeleccionadoComoElemento.style.background = "black"
                    diaSeleccionadoComoElemento.style.color = "white"
                    diaSeleccionadoComoElemento.setAttribute("estadoDia", "seleccionado")
                    let anoSeleccionado = document.querySelector("[componente=mesReferencia]").getAttribute("ano")
                    let mesSeleccionado = document.querySelector("[componente=mesReferencia]").getAttribute("mes")
                    let diaSeleccionado = dia
                    let botonSiguientePaso = document.createElement("p")
                    botonSiguientePaso.setAttribute("id", "botonSiguientePaso")
                    botonSiguientePaso.setAttribute("class", "reservaInformacion")
                    botonSiguientePaso.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                    let constructorInformacion;
                    let diaIO;
                    let reserva_
                    if (calendarioIO === "entrada") {
                        const fechaEntrada_Humano = `${diaSeleccionado}/${mesSeleccionado}/${anoSeleccionado}`
                        fechaEntrada.textContent = fechaEntrada_Humano
                        constructorInformacion = "Entrada el " + diaSeleccionado + " del " + mesSeleccionado + " del " + anoSeleccionado
                        botonSiguientePaso.setAttribute("vista", "/reservas/salida")
                        botonSiguientePaso.textContent = "Ir a seleccionar el día de salida44"
                        document.querySelector("[calendario=entrada]").setAttribute("memoriaVolatil", fechaEntrada_Humano)
                    }
                    if (calendarioIO === "salida") {
                        const fechaSalida_humano = `${diaSeleccionado}/${mesSeleccionado}/${anoSeleccionado}`
                        fechaSalida.textContent = fechaSalida_humano
                        constructorInformacion = "Salida el " + diaSeleccionado + " del " + mesSeleccionado + " del " + anoSeleccionado
                        botonSiguientePaso.setAttribute("vista", "/reservas/alojamiento")
                        botonSiguientePaso.textContent = "Ir a seleccionar el alojamiento"
                        document.querySelector("[calendario=salida]").setAttribute("memoriaVolatil", fechaSalida_humano)
                    }
                },
                seleccionarDiaNuevo: (dia) => {
                    let diaSeleccionado
                    if (typeof dia === "number") {
                        metadatosDia = dia
                        casaVitini.componentes.seleccionarDiaProcesadoNuevo(metadatosDia)
                    }
                    if (dia?.target?.getAttribute("dia")) {
                        diaSeleccionado = dia.target.getAttribute("dia")
                        let estadoDia = dia.target.getAttribute("estadoDia")
                        let metadatosDia = {
                            "diaSeleccionado": diaSeleccionado,
                            "estadoDia": estadoDia,
                            "tipo": "desdeClick"
                        }
                        casaVitini.componentes.seleccionarDiaProcesadoNuevo(metadatosDia)
                    }
                },
                calendarioCompartido: {
                    seleccionarDia: (dia) => {
                        const diaSeleccionadoComoElemento = dia.target;
                        const contenedorCalendario = diaSeleccionadoComoElemento.closest("[componente=bloqueCalendario]")
                        const instanciaUID_contenedorFechas = contenedorCalendario.getAttribute("instanciaUID_contenedorFechas")
                        const calendario = contenedorCalendario.querySelector("[componente=marcoCalendario]")
                        const numeroDia = dia.target.getAttribute("dia")
                        const contendorDestino = document.querySelector(`[instanciaUID_contenedorFechas="${instanciaUID_contenedorFechas}"]`)
                        const calendarioIO = calendario.getAttribute("calendarioIO")
                        const marcoMes = dia.target.closest("[componente=marcoMes]")
                        const numeroDiaDelMes = marcoMes.querySelectorAll("[dia]").length
                        const diaSeleccionado = numeroDia.padStart(2, "0")
                        const anoSeleccionado = contenedorCalendario.querySelector("[componente=mesReferencia]").getAttribute("ano").padStart(2, "0")
                        const mesSeleccionado = contenedorCalendario.querySelector("[componente=mesReferencia]").getAttribute("mes").padStart(2, "0")
                        const fechaSeleccionada_humana = `${diaSeleccionado}/${mesSeleccionado}/${anoSeleccionado}`
                        const fechaSeleccionada_ISO = `${anoSeleccionado}-${mesSeleccionado}-${diaSeleccionado}`
                        const diasDelCalendario = marcoMes.querySelectorAll("[dia]")
                        const selectorDias = document.querySelectorAll("[calendarioIO] [dia]")
                        selectorDias.forEach((dia) => {
                            dia.classList.remove("calendarioDiaReserva")
                            dia.classList.remove("calendarioDiaSeleccionado")
                        })
                        if (diaSeleccionadoComoElemento.getAttribute("estadoDia") === "seleccionado") {
                            diaSeleccionadoComoElemento.setAttribute("estadoDia", "disponible")
                            if (calendarioIO === "entrada") {
                                contendorDestino.querySelector("[calendario=entrada]").removeAttribute("memoriaVolatil")
                                contendorDestino.querySelector("[fechaUI=fechaInicio]").textContent = "(Seleccionar)"
                                contendorDestino.querySelector("[calendario=entrada]").removeAttribute("posicionDia")
                            }
                            if (calendarioIO === "salida") {
                                contendorDestino.querySelector("[calendario=salida]").removeAttribute("memoriaVolatil")
                                contendorDestino.querySelector("[fechaUI=fechaFin]").textContent = "(Seleccionar)"
                                contendorDestino.querySelector("[calendario=salida]").removeAttribute("posicionDia")
                            }
                            diasDelCalendario.forEach(dia => {
                                if (dia.getAttribute("estadoDia") === "disponible" ||
                                    dia.getAttribute("estadoDia") === "seleccionado") {
                                    dia.classList.remove("calendarioDiaSeleccionado")
                                    dia.classList.remove("calendarioDiaReserva")
                                    dia.classList.add("calendarioDiaDisponible")
                                    dia.setAttribute("estadoDia", "disponible")
                                }
                            });
                            return
                        }
                        diasDelCalendario.forEach(dia => {
                            if (dia.getAttribute("estadoDia") === "seleccionado") {
                                dia.setAttribute("estadoDia", "disponible")
                            }
                            if (dia.getAttribute("estadoDia") === "disponible") {
                                dia.classList.remove("calendarioDiaSeleccionado")
                                dia.classList.remove("calendarioDiaReserva")
                                dia.classList.add("calendarioDiaDisponible")
                            }
                        });
                        diaSeleccionadoComoElemento.setAttribute("estadoDia", "seleccionado")
                        diaSeleccionadoComoElemento.classList.add("calendarioDiaSeleccionado")
                        const fechasSeleccionadas = () => {
                            const fechaEntradaVolatil = contendorDestino.querySelector("[calendario=entrada]")?.getAttribute("memoriaVolatil")
                            const fechaEntradaAarray = fechaEntradaVolatil?.split("-") ? fechaEntradaVolatil?.split("-") : []
                            const diaSeleccionadoEntrada = Number(fechaEntradaAarray[2])
                            const mesSeleccionadoEntrada = Number(fechaEntradaAarray[1])
                            const anoSeleccionadoEntrada = Number(fechaEntradaAarray[0])
                            const fechaSalidaVolatil = contendorDestino.querySelector("[calendario=salida]")?.getAttribute("memoriaVolatil")
                            const fechaSaliraArray = fechaSalidaVolatil?.split("-") ? fechaSalidaVolatil?.split("-") : []
                            const diaSeleccionadoSalida = Number(fechaSaliraArray[2])
                            const mesSeleccionadoSalida = Number(fechaSaliraArray[1])
                            const anoSeleccionadoSalida = Number(fechaSaliraArray[0])
                            const fechaUnicoVolatil = contendorDestino.querySelector("[calendario=unico]")?.getAttribute("memoriaVolatil")
                            const fechaUnicoAarray = fechaUnicoVolatil?.split("-") ? fechaUnicoVolatil?.split("-") : []
                            const diaSeleccionadoUnico = Number(fechaUnicoAarray[2])
                            const mesSeleccionadoUnico = Number(fechaUnicoAarray[1])
                            const anoSeleccionadoUnico = Number(fechaUnicoAarray[0])
                            const contenedorFechas = {
                                fechaEntrada: {
                                    volatil: fechaEntradaVolatil,
                                    dia: diaSeleccionadoEntrada,
                                    mes: mesSeleccionadoEntrada,
                                    ano: anoSeleccionadoEntrada
                                },
                                fechaSalida: {
                                    volatil: fechaSalidaVolatil,
                                    dia: diaSeleccionadoSalida,
                                    mes: mesSeleccionadoSalida,
                                    ano: anoSeleccionadoSalida
                                },
                                fechaUnico: {
                                    volatil: fechaUnicoVolatil,
                                    dia: diaSeleccionadoUnico,
                                    mes: mesSeleccionadoUnico,
                                    ano: anoSeleccionadoUnico
                                }
                            }
                            return contenedorFechas
                        }
                        if (calendarioIO === "entrada") {
                            contendorDestino.querySelector("[calendario=entrada]").setAttribute("memoriaVolatil", fechaSeleccionada_ISO)
                            contendorDestino.querySelector("[fechaUI=fechaInicio]").textContent = fechaSeleccionada_humana
                            if (fechasSeleccionadas().fechaSalida?.volatil) {
                                diasDelCalendario.forEach((dia) => {
                                    if (dia.getAttribute("estadoDia") === "disponible") {
                                        if (fechasSeleccionadas().fechaSalida.mes === Number(mesSeleccionado) && Number(anoSeleccionado) === fechasSeleccionadas().fechaSalida.ano) {
                                            if ((Number(dia.getAttribute("dia")) > diaSeleccionado &&
                                                Number(dia.getAttribute("dia")) <= fechasSeleccionadas().fechaSalida.dia)) {
                                                dia.classList.remove("calendarioDiaDisponible")
                                                dia.classList.add("calendarioDiaReserva")
                                            }
                                        } else {
                                            if (Number(dia.getAttribute("dia")) > diaSeleccionado) {
                                                dia.classList.remove("calendarioDiaDisponible")
                                                dia.classList.add("calendarioDiaReserva")
                                            }
                                        }
                                    }
                                })
                            } else if (fechasSeleccionadas().fechaSalida?.volatil) {
                                if (fechasSeleccionadas().fechaSalida.mes === Number(mesSeleccionado) && Number(anoSeleccionado) === fechasSeleccionadas().fechaSalida.ano) {
                                    selectorDias.forEach((dia) => {
                                        if ((Number(dia.getAttribute("dia")) > diaSeleccionado)
                                            &&
                                            (Number(dia.getAttribute("dia")) < fechasSeleccionadas().fechaSalida.dia)) {
                                            dia.classList.add("calendarioDiaReserva")
                                            dia.classList.remove("calendarioDiaDisponible")
                                        }
                                    })
                                } else {
                                    selectorDias.forEach((dia) => {
                                        if (Number(dia.getAttribute("dia")) >= diaSeleccionado) {
                                            dia.classList.add("calendarioDiaReserva")
                                            dia.classList.remove("calendarioDiaDisponible")
                                        }
                                    })
                                }
                            }
                        } else if (calendarioIO === "salida") {
                            contendorDestino.querySelector("[calendario=salida]").setAttribute("memoriaVolatil", fechaSeleccionada_ISO)
                            contendorDestino.querySelector("[fechaUI=fechaFin]").textContent = fechaSeleccionada_humana
                            if (fechasSeleccionadas().fechaEntrada?.volatil) {
                                diasDelCalendario.forEach((dia) => {
                                    if (dia.getAttribute("estadoDia") === "disponible") {
                                        if (fechasSeleccionadas().fechaEntrada.mes === Number(mesSeleccionado) && Number(anoSeleccionado) === fechasSeleccionadas().fechaEntrada.ano) {
                                            if (Number(dia.getAttribute("dia")) < Number(diaSeleccionado) &&
                                                Number(dia.getAttribute("dia")) >= fechasSeleccionadas().fechaEntrada.dia) {
                                                dia.classList.remove("calendarioDiaDisponible")
                                                dia.classList.add("calendarioDiaReserva")
                                            }
                                        } else {
                                            if (Number(dia.getAttribute("dia")) < Number(diaSeleccionado)) {
                                                dia.classList.remove("calendarioDiaDisponible")
                                                dia.classList.add("calendarioDiaReserva")
                                            }
                                        }
                                    }
                                })
                            } else if (fechasSeleccionadas().fechaEntrada?.volatil) {
                                if (fechasSeleccionadas().fechaEntrada.mes === Number(mesSeleccionado) && Number(anoSeleccionado) === fechasSeleccionadas().fechaEntrada.ano) {
                                    selectorDias.forEach((dia) => {
                                        if ((Number(dia.getAttribute("dia")) > fechasSeleccionadas().fechaEntrada.dia)
                                            &&
                                            (Number(dia.getAttribute("dia")) < Number(diaSeleccionado))) {
                                            dia.classList.add("calendarioDiaReserva")
                                            dia.classList.remove("calendarioDiaDisponible")
                                        }
                                    })
                                } else {
                                    selectorDias.forEach((dia) => {
                                        if (Number(dia.getAttribute("dia")) <= Number(diaSeleccionado)) {
                                            dia.classList.add("calendarioDiaReserva")
                                            dia.classList.remove("calendarioDiaDisponible")
                                        }
                                    })
                                }
                            }
                        } else if (calendarioIO === "unico") {
                            contendorDestino.querySelector("[calendario=unico]").setAttribute("memoriaVolatil", fechaSeleccionada_ISO)
                            contendorDestino.querySelector("[fechaUI=unico]").textContent = fechaSeleccionada_humana
                            if (fechasSeleccionadas().fechaUnico?.volatil) {
                                diasDelCalendario.forEach((dia) => {
                                    if (dia.getAttribute("estadoDia") === "disponible") {
                                        if (fechasSeleccionadas().fechaUnico.mes === Number(mesSeleccionado) && Number(anoSeleccionado) === fechasSeleccionadas().fechaUnico.ano) {
                                            if (Number(dia.getAttribute("dia")) < Number(diaSeleccionado) &&
                                                Number(dia.getAttribute("dia")) >= fechasSeleccionadas().fechaUnico.dia) {
                                                dia.classList.remove("calendarioDiaDisponible")
                                                dia.classList.add("calendarioDiaReserva")
                                            }
                                        } else {
                                            if (Number(dia.getAttribute("dia")) < Number(diaSeleccionado)) {
                                                dia.classList.remove("calendarioDiaDisponible")
                                                dia.classList.add("calendarioDiaReserva")
                                            }
                                        }
                                    }
                                })
                            }
                        }
                    },
                },
                diasOcupadosTotalmentePorMes: async (metadatos) => {
                    const mes = metadatos.mes
                    const ano = metadatos.ano
                    const instanciaUID_mes = metadatos.instanciaUID_mes
                    const controlDiasCompletos = {
                        zona: "componentes/diasOcupadosTotalmentePorMes",
                        mes: Number(mes),
                        ano: Number(ano)
                    }
                    const respuestaServidor = await casaVitini.shell.servidor(controlDiasCompletos)
                    if (respuestaServidor?.error) {
                        return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                    }
                    if (respuestaServidor.ok) {
                        const dias = respuestaServidor.ok.dias
                        const selectorMarcoMesRenderizadoEnEspera = document
                            .querySelector(`[inctanciaUID_procesoCambioMes="${instanciaUID_mes}"]`)
                        if (!selectorMarcoMesRenderizadoEnEspera) {
                            return
                        }
                        for (const detallesDia of Object.entries(dias)) {
                            const dia = detallesDia[0]
                            const estadoDia = detallesDia[1].estadoDia
                            const selectorDia = selectorMarcoMesRenderizadoEnEspera.querySelector(`[dia="${dia}"]`)
                            if (estadoDia === "diaCompleto") {
                                selectorDia.classList.add("calendarioDiaCompleto")
                            }
                            if (estadoDia === "diaParcial") {
                                selectorDia.classList.add("calendarioDiaParcial")
                            }
                        }
                    }
                },
            },
            widgetsUI: {
                contenedorTituloDescripcionSimple: (data) => {
                    const titulo = data.titulo
                    const dato = data.dato
                    const contenedor = document.createElement("div")
                    contenedor.classList.add(
                        "flexVertical"
                    )
                    const tituloUI = document.createElement("p")
                    tituloUI.setAttribute("data", "tituloUI")
                    tituloUI.textContent = titulo
                    contenedor.appendChild(tituloUI)
                    const dataUI = document.createElement("p")
                    dataUI.setAttribute("data", "dataUI")
                    dataUI.textContent = dato
                    contenedor.appendChild(dataUI)
                    return contenedor
                },
                textoSimple: (texto) => {
                    const contenedor = document.createElement("div")
                    contenedor.textContent = texto
                    return contenedor
                }
            },
            errorUI_respuestaInmersiva: (data) => {

                const errorUI = data.errorUI

                const ui = document.createElement("div")
                ui.classList.add("flexVertical", "gap10")

                const errorInfo = document.createElement("p")
                errorInfo.classList.add("textoCentrado")
                errorInfo.textContent = errorUI
                ui.appendChild(errorInfo)

                const botonAceptar = document.createElement("div")
                botonAceptar.classList.add("botonV1Blanco")
                botonAceptar.textContent = "Aceptar y volver"
                botonAceptar.addEventListener("click", casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas)
                ui.appendChild(botonAceptar)

                return ui
            }
        }
    },
    componentes: {
        temporizador: null,
        pasarelas: {
            square: {
                crearSesionPago: async (instanciaUID) => {
                    const transaccion = {
                        zona: "componentes/pasarela/squareConstruyeCliente"
                    };
                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    if (respuestaServidor?.error) {
                        return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                    }
                    const selectorSesionesPago = document.querySelectorAll("#sessionPagoSquare")
                    selectorSesionesPago.forEach(session => {
                        session.remove()
                    })
                    const metadataClienteSquare = document.createElement("script")
                    metadataClienteSquare.setAttribute("id", "sessionPagoSquare")
                    metadataClienteSquare.setAttribute("type", "text/javascript")
                    metadataClienteSquare.innerHTML = `
                window.applicationId="${respuestaServidor?.squareApplicationId}";
                window.locationId="${respuestaServidor?.squareLocationId}";
                window.currency="${respuestaServidor?.squareAccountCurrency}";
                window.country="${respuestaServidor?.squareAccountCountry}";
                window.idempotencyKey="${respuestaServidor?.idempotencyKey}"
                `
                    const selectorSquareJS = document.querySelector("section:not([estado=obsoleto])")
                    const instanciaUIDRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                    if (instanciaUIDRenderizada) {
                        selectorSquareJS.insertAdjacentElement("afterend", metadataClienteSquare);
                    }
                },
                inyectorSquareJS: async (instanciaUID) => {
                    return new Promise((resolve, reject) => {
                        const selectorMotorarranque = document.querySelector("[square=motorarranque]")
                        const squareJS = document.createElement("script");
                        squareJS.setAttribute("type", "text/javascript");
                        squareJS.setAttribute("src", "https://sandbox.web.squarecdn.com/v1/square.js");
                        squareJS.setAttribute("id", "squareJS")
                        squareJS.onload = resolve;
                        squareJS.onerror = () => {
                            reject(new Error("Error al cargar el archivo square.js"))
                        }
                        const instanciaUIDRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                        if (instanciaUIDRenderizada) {
                            selectorMotorarranque.insertAdjacentElement("afterend", squareJS);
                        }
                    })
                },
                inyectorMetodosPago: async (instanciaUID) => {
                    return new Promise((resolve, reject) => {
                        const seccion = document.querySelector("section:not([estado=obsoleto])")
                        let metodoPagoCargadoCorrectamente = 0;
                        const totalMetodosPago = 4;
                        const metodosPago = [
                            "activos/javascript/square/sq-ach.js",
                            "activos/javascript/square/sq-apple-pay.js",
                            "activos/javascript/square/sq-google-pay.js",
                            "activos/javascript/square/sq-card-pay.js"
                        ];
                        metodosPago.forEach(metodoPago => {
                            const metodoPagoElemento = document.createElement('script');
                            metodoPagoElemento.setAttribute("type", "text/javascript")
                            metodoPagoElemento.src = metodoPago;
                            metodoPagoElemento.onload = () => {
                                metodoPagoCargadoCorrectamente++;
                                if (metodoPagoCargadoCorrectamente === totalMetodosPago) {
                                    resolve();
                                }
                            };
                            metodoPagoElemento.onerror = () => {
                                reject(new Error(`Error al cargar el metodo de pago: ${metodoPago}`));
                            };
                            const instanciaUIDRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                            if (instanciaUIDRenderizada) {
                                seccion.appendChild(metodoPagoElemento);
                            }
                        });
                    });
                },
                inyectorFlujoPago: async (instanciaUID) => {
                    return new Promise((resolve, reject) => {
                        const seccion = document.querySelector("section:not([estado=obsoleto])")
                        const flujoPago = document.createElement("script");
                        flujoPago.setAttribute("type", "text/javascript");
                        flujoPago.setAttribute("src", "/activos/javascript/square/sq-payment-flow.js");
                        flujoPago.onload = resolve;
                        flujoPago.onerror = () => {
                            reject(new Error("Error al cargar el archivo sq-payment-flow.js"))
                        }
                        const instanciaUIDRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                        if (instanciaUIDRenderizada) {
                            seccion.appendChild(flujoPago)
                        }
                    })
                },
                uiForm: (destino) => {
                    const selectorDestino = document.querySelector(destino);
                    if (selectorDestino === null) {
                        const error = "casaVitini.componentes.square.intectorFlujoPago no encuentra el elemento de destino"
                        return casaVitini.ui.componentes.advertenciaInmersiva(error)
                    }
                    const paymentForm = document.createElement("form");
                    paymentForm.className = "payment-form";
                    paymentForm.id = "fast-checkout";
                    const wrapperDiv = document.createElement("div");
                    wrapperDiv.className = "wrapper";
                    paymentForm.appendChild(wrapperDiv);
                    const applePayButton = document.createElement("div");
                    applePayButton.id = "apple-pay-button";
                    applePayButton.alt = "apple-pay";
                    applePayButton.type = "button";
                    wrapperDiv.appendChild(applePayButton);
                    const googlePayButton = document.createElement("div");
                    googlePayButton.id = "google-pay-button";
                    googlePayButton.alt = "google-pay";
                    googlePayButton.type = "button";
                    wrapperDiv.appendChild(googlePayButton);
                    let borderDiv = document.createElement("div");
                    borderDiv.className = "border";
                    wrapperDiv.appendChild(borderDiv);
                    const numberSpan = document.createElement("span");
                    numberSpan.textContent = "O";
                    borderDiv.appendChild(numberSpan);
                    const achWrapperDiv = document.createElement("div");
                    achWrapperDiv.id = "ach-wrapper";
                    wrapperDiv.appendChild(achWrapperDiv);
                    const achLabel = document.createElement("label");
                    achLabel.htmlFor = "ach-account-holder-name";
                    achLabel.textContent = "Full Name";
                    achWrapperDiv.appendChild(achLabel);
                    const achInput = document.createElement("input");
                    achInput.id = "ach-account-holder-name";
                    achInput.type = "text";
                    achInput.placeholder = "Jane Doe";
                    achInput.name = "ach-account-holder-name";
                    achInput.autocomplete = "name";
                    achWrapperDiv.appendChild(achInput);
                    const achMessageSpan = document.createElement("span");
                    achMessageSpan.id = "ach-message";
                    achWrapperDiv.appendChild(achMessageSpan);
                    const achButton = document.createElement("button");
                    achButton.id = "ach-button";
                    achButton.type = "button";
                    achButton.textContent = "Pay with Bank Account";
                    achWrapperDiv.appendChild(achButton);
                    borderDiv = document.createElement("div");
                    borderDiv.className = "border";
                    const orSpan = document.createElement("span");
                    orSpan.textContent = "OR";
                    const cardContainerDiv = document.createElement("div");
                    cardContainerDiv.id = "card-container";
                    wrapperDiv.appendChild(cardContainerDiv);
                    const cardButton = document.createElement("button");
                    cardButton.id = "card-button";
                    cardButton.type = "button";
                    cardButton.textContent = "Pagar reserva y confirmarla";
                    wrapperDiv.appendChild(cardButton);
                    const paymentFlowMessageSpan = document.createElement("span");
                    paymentFlowMessageSpan.id = "payment-flow-message";
                    wrapperDiv.appendChild(paymentFlowMessageSpan);
                    selectorDestino.appendChild(paymentForm);
                },
                flujoPagoUI: {
                    desplegarUI: (mensaje) => {
                        document.body.style.overflow = 'hidden';
                        const advertenciaInmersivaUI = document.createElement("section")
                        advertenciaInmersivaUI.setAttribute("class", "advertenciaInmersiva")
                        advertenciaInmersivaUI.setAttribute("componente", "advertenciaInmersiva")
                        const spinnerContainer = document.createElement('div');
                        spinnerContainer.setAttribute("componente", "iconoFlujoPago");
                        spinnerContainer.classList.add("lds-spinner");
                        for (let i = 0; i < 12; i++) {
                            const div = document.createElement('div');
                            spinnerContainer.appendChild(div);
                        }
                        advertenciaInmersivaUI.appendChild(spinnerContainer)
                        const info = document.createElement("div")
                        info.setAttribute("class", "advertenciaInfoFlujoPago")
                        info.setAttribute("componente", "mensajeFlujoPasarela")
                        info.textContent = mensaje
                        advertenciaInmersivaUI.appendChild(info)
                        document.body.appendChild(advertenciaInmersivaUI)
                    },
                    botonAcetpar: () => {
                        const boton = document.createElement("div")
                        boton.setAttribute("class", "botonV1")
                        boton.textContent = "Aceptar"
                        boton.addEventListener("click", casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas)
                        return boton
                    },
                    infoDuranteFlujo: (mensaje) => {
                        const contenedorMensaje = document.querySelector("[componente=mensajeFlujoPasarela]")
                        contenedorMensaje.textContent = "Comprodando datos para realizar el pago..."
                    },
                    errorInfo: (mensaje) => {
                        document.querySelector("[componente=iconoFlujoPago]")?.remove()
                        const contenedorMensaje = document.querySelector("[componente=mensajeFlujoPasarela]")
                        contenedorMensaje.textContent = mensaje
                        const advertenciaInmersivaUI = document.querySelector("[componente=advertenciaInmersiva]")
                        const botonAceptar = casaVitini.componentes.flujoPagoUI.botonAcetpar()
                        advertenciaInmersivaUI.appendChild(botonAceptar)
                    }
                },
            },
        },
        loginUI: async () => {
            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
            const url = window.location.pathname;
            const zona = {
                vista: url,
                tipoOrigen: "historial",
            }
            await casaVitini.shell.navegacion.controladorVista(zona)
        },
        privacidad: {
            arranque: (vista) => {
                const filtro = /privacidad(\/.*)?$/
                const resultadoFiltro = filtro.test(vista)
                if (vista && resultadoFiltro) {
                    return false
                }
                const cookies = casaVitini.componentes.privacidad.obtenerCookies()
                if (cookies.privacidad !== "consentimientoAceptado") {
                    return true
                }
            },
            obtenerCookies: () => {
                const cookiesArray = document.cookie.split("; ")
                const cookiesObjeto = {}
                for (const cadenaDeLaCookie of cookiesArray) {
                    const arrayPorCookie = cadenaDeLaCookie.split("=")
                    const nombre = arrayPorCookie[0]
                    const valor = arrayPorCookie[1]
                    cookiesObjeto[nombre] = valor
                }
                return cookiesObjeto
            },
            borrarCookies: () => {
                localStorage.clear()
                const cookies = casaVitini.componentes.privacidad.obtenerCookies()
                for (const [nombreCookies, valorCookie] of Object.entries(cookies)) {
                    if ('cookieStore' in window) {
                        cookieStore?.delete(nombreCookies)
                    } else {
                        document.cookie = nombreCookies + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    }
                }
            },
            crearCookieConsentimiento: () => {
                const fecha = new Date();
                fecha.setTime(fecha.getTime() + (365 * 24 * 60 * 60 * 1000));  // 24 horas desde ahora
                const expira = "expires=" + fecha.toUTCString();
                document.cookie = "privacidad=consentimientoAceptado; " + expira + "; SameSite=Strict; path=/; Secure";
            },
            advertenciaPrivacidadInicial: () => {
                const main = document.querySelector("main")
                main.setAttribute("zonaCSS", "privacidad")
                const titulo = document.createElement("p")
                titulo.textContent = "Advertencia de privacidad y uso de cookies "
                titulo.classList.add("tituloGris")
                main.appendChild(titulo)
                const resumenInicial = document.createElement("p")
                resumenInicial.style.marginTop = "10px"
                resumenInicial.textContent = `Este sitio web usa cookies propias y de terceros para soportar la navegación, mejorar la experiencia de usuario, personalizar el contenido y realizar análisis estadísticos sobre los hábitos de navegación.`
                main.appendChild(resumenInicial)
                const contenedorBotones = casaVitini.componentes.privacidad.ui.contenedorSecciones()
                main.appendChild(contenedorBotones)
                const contenedorDecision = casaVitini.componentes.privacidad.ui.contenedorDecision()
                main.appendChild(contenedorDecision)
            },
            ui: {
                contenedorSecciones: () => {
                    const marcoElastico = document.createElement("div")
                    marcoElastico.classList.add("marcoElasticoRelativo")
                    marcoElastico.style.maxWidth = "720px"
                    marcoElastico.style.gap = "10px"
                    marcoElastico.setAttribute("espacio", "politicas")
                    const contenedorBotones = document.createElement("div")
                    contenedorBotones.classList.add("flexVertical", "gap10")
                    marcoElastico.appendChild(contenedorBotones)
                    const botonPoliticaCookies = document.createElement("a")
                    botonPoliticaCookies.classList.add("botonV1")
                    botonPoliticaCookies.textContent = "Política de cookies"
                    botonPoliticaCookies.setAttribute("href", "/politicas/privacidad/cookies")
                    botonPoliticaCookies.setAttribute("vista", "/politicas/privacidad/cookies")
                    botonPoliticaCookies.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                    contenedorBotones.appendChild(botonPoliticaCookies)
                    const botonPoliticaPrivacidad = document.createElement("a")
                    botonPoliticaPrivacidad.classList.add("botonV1")
                    botonPoliticaPrivacidad.textContent = "Política de privacidad"
                    botonPoliticaPrivacidad.setAttribute("href", "/politicas/privacidad/politica_de_privacidad")
                    botonPoliticaPrivacidad.setAttribute("vista", "/politicas/privacidad/politica_de_privacidad")
                    botonPoliticaPrivacidad.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                    contenedorBotones.appendChild(botonPoliticaPrivacidad)
                    const botonCondicionesDeUso = document.createElement("a")
                    botonCondicionesDeUso.classList.add("botonV1")
                    botonCondicionesDeUso.setAttribute("href", "/politicas/privacidad/condiciones_de_uso")
                    botonCondicionesDeUso.setAttribute("vista", "/politicas/privacidad/condiciones_de_uso")
                    botonCondicionesDeUso.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                    botonCondicionesDeUso.textContent = "Condiciones de uso"
                    contenedorBotones.appendChild(botonCondicionesDeUso)
                    return marcoElastico
                },
                contenedorDecision: () => {
                    const contenedorDecision = document.createElement("div")
                    contenedorDecision.classList.add("contenedorDecision")
                    contenedorDecision.setAttribute("contenedor", "botones")
                    const botonRechazar = document.createElement("a")
                    botonRechazar.classList.add("botonPrivacidad")
                    botonRechazar.textContent = "Rechazar todo"
                    botonRechazar.addEventListener("click", () => {
                        casaVitini.componentes.privacidad.borrarCookies()
                        window.location.href = "about:blank"
                    })
                    contenedorDecision.appendChild(botonRechazar)
                    const botonAceptar = document.createElement("a")
                    botonAceptar.classList.add("botonPrivacidad")
                    botonAceptar.textContent = "Aceptar todo"
                    botonAceptar.addEventListener("click", () => {
                        casaVitini.componentes.privacidad.crearCookieConsentimiento()
                        const url = window.location.pathname;
                        if (url === "/") {
                            return casaVitini.shell.navegacion.controladorVista("portada")
                        } else if (url === "/politicas/privacidad") {
                            const main = document.querySelector("main")
                            main.querySelector("[contenedor=botones]")?.remove()
                            const contenedorDecision = casaVitini.componentes.privacidad.ui.revocarDecision()
                            main.querySelector("[espacio=politicas]").appendChild(contenedorDecision)
                        } else {
                            return casaVitini.shell.navegacion.controladorVista(url)
                        }
                    })
                    contenedorDecision.appendChild(botonAceptar)
                    return contenedorDecision
                },
                revocarDecision: () => {
                    const contenedorDecision = document.createElement("div")
                    contenedorDecision.classList.add("flexVertical", "gap10")
                    contenedorDecision.setAttribute("contenedor", "botones")
                    const textoInfo = document.createElement("div")
                    textoInfo.classList.add("padding14", "textoCentrado")
                    textoInfo.textContent = "Ha aceptado las políticas de privacidad y condiciones de uso de Casa Vitini, si quiere, puede revocarlas en cualquier momento borrando la cache de su navegador o pulsando en el botón de revocar de abajo."
                    contenedorDecision.appendChild(textoInfo)
                    const botonRechazar = document.createElement("a")
                    botonRechazar.classList.add("botonV1")
                    botonRechazar.textContent = "Revocar decisión y borrar cookies"
                    botonRechazar.addEventListener("click", () => {
                        casaVitini.componentes.privacidad.borrarCookies()
                        document.querySelector("[contenedor=botones]")?.remove()
                        const main = document.querySelector("main")
                        const contenedorDecision = casaVitini.componentes.privacidad.ui.contenedorDecision()
                        main.querySelector("[espacio=politicas]").appendChild(contenedorDecision)
                    })
                    contenedorDecision.appendChild(botonRechazar)
                    return contenedorDecision
                }
            }
        },
        diccionarios: {
            reserva: {
                estadoPagoUI: "Estado del pago",
                estadoReservaIDV: (data) => {
                    if (data === "pendiente") {
                        return "Pendiente"
                    }
                    if (data === "confirmada") {
                        return "Confirmada"
                    }
                    if (data === "cancelada") {
                        return "Cancelada"
                    }
                },
                origenIDV: (data) => {
                    if (data === "cliente") {
                        return "Cliente"
                    }
                    if (data === "administracion") {
                        return "Adminitración"
                    }
                },
                estadoPagoIDV: (data) => {
                    if (data === "noPagado") {
                        return "No pagado"
                    }
                    if (data === "pagadoParcialmente") {
                        return "Pagado parcialmente"
                    }
                    if (data === "pagadoSuperadamente") {
                        return "Pagado superadament"
                    }
                }
            }
        }
    },
    utilidades: {
        cadenas: {
            snakeToCamel: (snake) => {
                return snake.replace(/_([a-z])/g, (match, group) => {
                    return group.toUpperCase();
                });
            },
            camelToSnake: (camel) => {
                return camel.replace(/[A-Z]/g, (match) => {
                    return '_' + match.toLowerCase();
                });
            },
            constructorComasEY: (data) => {
                const array = data.array
                const articulo = data.articulo || ""
                if (array.length === 1) {
                    return array[0];
                } else {
                    const formattedString = array.slice(0, -1).join(', ' + articulo + " ") + ' y ' + articulo + " " + array.slice(-1);
                    return formattedString;
                }
            },
        },
        conversor: {
            fecha_humana_hacia_ISO: (fecha) => {
                const filtroFechaHumana = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/;
                if (filtroFechaHumana.test(fecha)) {
                    const fechaArray = fecha.split("/")
                    const dia = fechaArray[0]
                    const mes = fechaArray[1]
                    const ano = fechaArray[2]
                    const fechaISO = `${ano}-${mes}-${dia}`
                    return fechaISO
                } else {
                    const m = "En fecha_humana_hacia_ISO no se reconoce el formato humano"
                    return casaVitini.ui.componentes.advertenciaInmersiva(m)
                }
            },
            fecha_ISO_hacia_humana: (fecha) => {
                const filtroFechaISO = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
                if (filtroFechaISO.test(fecha)) {
                    const fechaArray = fecha.split("-")
                    const dia = fechaArray[2]
                    const mes = fechaArray[1]
                    const ano = fechaArray[0]
                    const fechaHumana = `${dia}/${mes}/${ano}`
                    return fechaHumana
                } else {
                    const m = "En fecha_ISO_hacia_humana no se reconoce el formato ISO"
                    return casaVitini.ui.componentes.advertenciaInmersiva(m)
                }
            },
            extraerFechasInternas: (inicio, fin) => {
                const fechas = [];
                const inicio_objeto = new Date(inicio);
                const fin_objeto = new Date(fin);
                fin_objeto.setDate(fin_objeto.getDate() + 1);
                while (inicio_objeto < fin_objeto) {
                    fechas.push(inicio_objeto.toISOString().split("T")[0]);
                    inicio_objeto.setDate(inicio_objeto.getDate() + 1);
                }
                return fechas;
            },
            base64HaciaCadena: (base64) => {
                const binaryString = atob(base64);
                const asciiString = Array.from(binaryString, char => char).join('');
                return asciiString
            }
        },
        observador: {
            medirPorJerarquiaDom: {
                horizontal: (elemento) => {
                    let distancia = 0;
                    while (elemento) {
                        distancia += elemento.offsetLeft;
                        elemento = elemento.offsetParent;
                    }
                    return distancia;
                },
                vertical: {
                    desdeArribaDelElemento: (elemento) => {
                        let distancia = 0;
                        while (elemento) {
                            distancia += elemento.offsetTop;
                            elemento = elemento.offsetParent;
                        }
                        return distancia;
                    },
                    desdeAbajoDelElemento: (elemento) => {
                        let distancia = elemento.clientHeight;
                        while (elemento) {
                            distancia += (elemento.offsetTop);
                            elemento = elemento.offsetParent;
                        }
                        return distancia;
                    }
                }
            },
            anchoActualVentanad: window.innerWidth,
            menusFlotanes: (configuracion) => {
                const elementoParaObservar = configuracion.elementoParaObservar
                const elementoDestino = configuracion.elementoDestino
                const borrarInstancia = () => {
                    if (instanciaDelObservador) {
                        instanciaDelObservador.disconnect(); // Deja de observar el elemento
                        instanciaDelObservador = null; // Limpia la referencia a la instancia del observador
                    }
                };
                const selectorElementoOrigen = document.querySelector(elementoParaObservar);
                let instanciaDelObservador; // Declara la variable fuera del alcance de la función observador
                if (!selectorElementoOrigen) {
                    const mensaje = "No se encuentra el elemento a observar";
                    return casaVitini.ui.componentes.advertenciaInmersiva(mensaje);
                }
                const selectorElementoDestino = document.querySelector(elementoParaObservar);
                if (!selectorElementoDestino) {
                    const mensaje = "No se encuentra el elemento de destino";
                    borrarInstancia()
                    return casaVitini.ui.componentes.advertenciaInmersiva(mensaje);
                }
                instanciaDelObservador = new ResizeObserver(entries => {
                    for (let entry of entries) {
                        const { width, height, x, y } = entry.contentRect;
                        const contenedorRetorno = {
                            width: width,
                            height: height,
                            x: x,
                            y: y
                        }
                        const altoMenuFlotante = y + height
                        const ladoMenuFlotante = x
                    }
                });
                instanciaDelObservador.observe(selectorElementoOrigen);
            }
        },
        granuladorURL: () => {
            const urlActual = window.location.pathname
            const directoriosURL = []
            const parametrosURL = {}
            const parametrosArray = []
            let arrayURL = urlActual.split("/")
            arrayURL = arrayURL.filter((url) => url)
            arrayURL.forEach((bloque) => {
                if (bloque.includes(":")) {
                    const desgloseParametro = bloque.split(":")
                    parametrosURL[desgloseParametro[0]] = desgloseParametro[1]
                    const par = {
                        parametro: desgloseParametro[0],
                        valor: desgloseParametro[1]
                    }
                    parametrosArray.push(par)
                } else {
                    directoriosURL.push(bloque)
                }
            })
            const contenedorSeguroParaParametros = []
            for (const par of parametrosArray) {
                const parametro = par.parametro
                const valor = par.valor
                const estructura = parametro + ":" + valor
                contenedorSeguroParaParametros.push(estructura)
            }
            const contenedorParametrosParaFusion = []
            for (const [parametro, valor] of Object.entries(parametrosURL)) {
                const estructura = parametro + ":" + valor
                contenedorParametrosParaFusion.push(estructura)
            }
            const estructuraFinal = {
                rawArray: arrayURL,
                raw: urlActual,
                directorios: directoriosURL,
                parametros: parametrosURL,
                directoriosFusion: "/" + directoriosURL.join("/"),
                parametrosFusion: "/" + contenedorParametrosParaFusion.join("/"),
                contenedorSeguroParaParametros: contenedorSeguroParaParametros
            }
            return estructuraFinal
        },
        codigoFechaInstancia: function () {
            const generarUID = (() => {
                let ultimoUID = null;
                return () => {
                    let uid;
                    let fecha;
                    let año, mes, dia, horas, minutos, segundos, milisegundos;
                    do {
                        fecha = new Date();
                        año = fecha.getFullYear();
                        mes = String(fecha.getMonth() + 1).padStart(2, "0");
                        dia = String(fecha.getDate()).padStart(2, "0");
                        horas = String(fecha.getHours()).padStart(2, "0");
                        minutos = String(fecha.getMinutes()).padStart(2, "0");
                        segundos = String(fecha.getSeconds()).padStart(2, "0");
                        milisegundos = String(fecha.getMilliseconds()).padStart(3, "0");
                        uid = `${año}${mes}${dia}${horas}${minutos}${segundos}${milisegundos}`;
                    } while (uid === ultimoUID)
                    ultimoUID = uid;
                    return uid;
                };
            })();
            const contenedorVolatil = casaVitini.utilidades.contenedorVolatil || {};
            let uid = generarUID();
            while (contenedorVolatil[uid]) {
                uid = generarUID();
            }
            Object.keys(contenedorVolatil).forEach((contenedorUID) => {
                delete contenedorVolatil[contenedorUID];
            });
            contenedorVolatil[uid] = true;
            casaVitini.utilidades.contenedorVolatil = contenedorVolatil;
            return uid;
        },
        contenedorVolatil: null,
        ralentizador: async (milisegundos) => {
            await new Promise(resolve => setTimeout(resolve, Number(milisegundos)));
        },
        fechas: {
            constructorObjetoEstructuraPrecioDia: (fechaEntrada, fechaSalida) => {
                const arregloFechas = []
                let fechaEntrada_Objeto = new Date(fechaEntrada)
                const fechaSalida_Objeto = new Date(fechaSalida)
                fechaEntrada_Objeto.setHours(0, 0, 0, 0)
                fechaSalida_Objeto.setHours(0, 0, 0, 0)
                while (fechaEntrada_Objeto <= fechaSalida_Objeto) {
                    arregloFechas.push(fechaEntrada_Objeto.toISOString().split('T')[0])
                    fechaEntrada_Objeto.setDate(fechaEntrada_Objeto.getDate() + 1)
                }
                return arregloFechas
            }
        },
        borrarPosicionDeArrayPorCandena: (data) => {
            const array = data.array
            const cadenaParaBorrar = data.cadenaParaBorrar
            const indice = array.indexOf(cadenaParaBorrar);
            if (indice !== -1) {
                array.splice(indice, 1);
            }
            return array
        },
        validarRutaAFuncion: (ruta) => {
            const partes = ruta.split('.');
            let actual = casaVitini;
            for (let parte of partes) {
                if (!actual[parte]) {
                    return false;
                }
                actual = actual[parte];
            }
            return typeof actual === 'function';
        },
        ejecutarFuncionPorNomreDinamicoSinContexto: function (data) {
            const ruta = data.ruta
            const args = data.args
            const metodo = ruta.split('.').reduce((acc, parte) => acc[parte], casaVitini);
            if (typeof metodo === 'function') {
                return metodo(args);
            } else {
                throw new Error(`La ruta ${ruta} no corresponde a una función`);
            }
        },
        ejecutarFuncionPorNombreDinamicoConContexto: async function (data) {
            try {
                const ruta = data.ruta;

                const args = data.args;
                const partes = ruta.split('.');
                const contexto = partes.slice(0, -1).reduce((acc, parte) => acc[parte], casaVitini);
                const metodo = contexto[partes[partes.length - 1]];
                if (typeof metodo === 'function') {
                    return await metodo.call(contexto, args);
                } else {
                    throw new Error(`La ruta ${ruta} no corresponde a una función`);
                }
            } catch (error) {
                console.error(error)
            }
        },
        calendarios: {
            calcularNumeroSemanasDelMes: (data) => {
                const diasAnterioresAlPrimerDia = data.posicionPrimerDiaSemana - 1
                const numeroDiasPorMes = data.numeroDiasPorMes
                const totalDias = numeroDiasPorMes + diasAnterioresAlPrimerDia;
                const incertidumbre = totalDias / 7;
                const semanas = Number.isInteger(incertidumbre) ? incertidumbre : Math.ceil(totalDias / 7);
                return semanas;
            },
            tiempoDeLaFechas: (data) => {
                const fechaPresenteISO = data.fechaPresenteISO
                const fechaCompararISO = data.fechaCompararISO
                const fechaPresente = new Date(fechaPresenteISO);
                const fechaComparar = new Date(fechaCompararISO);
                const tiempoPresente = fechaPresente.getTime();
                const tiempoComparar = fechaComparar.getTime();
                // Comparamos las fechas
                if (tiempoComparar < tiempoPresente) {
                    return "pasado";
                } else if (tiempoComparar > tiempoPresente) {
                    return "futuro";
                } else {
                    return "presente";
                }
            }
        },
        formatos: {
            imagenes: {
                base64: (base64String) => {
                    const binarioMagicoPNG = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
                    const binarioMagicoJPEG = new Uint8Array([255, 216, 255]);
                    const binarioMagicoTIFF = new Uint8Array([73, 73, 42, 0]); // Ajustado a 4 bytes
                    const arrayBuffer = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
                    const buffer = new Uint8Array(arrayBuffer);
                    const compareBytes = (buffer, magicBytes) => magicBytes.every((byte, index) => buffer[index] === byte);
                    if (compareBytes(buffer.subarray(0, 8), binarioMagicoPNG)) {
                        return "PNG";
                    } else if (compareBytes(buffer.subarray(0, 3), binarioMagicoJPEG)) {
                        return "JPEG"; // Verifica TIFF 
                    } else if (compareBytes(buffer.subarray(0, 4), binarioMagicoTIFF)) {
                        return "TIFF";
                    } else {
                        const m = "Tipo de imagen desconocido";
                        return casaVitini.ui.componentes.advertenciaInmersiva(m);
                    }
                }
            }
        },
    },
    view: {}
}
casaVitini.shell.arranque()