casaVitini.view = {
    start: async function () {
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const parametros = granuladoURL.parametros

        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "instalaciones")
        const instanciaUID = main.getAttribute("instanciaUID")

        const marcoElasticoRelativo = main.querySelector("[contenedor=marcoElasticoRelativo]")
        main.appendChild(marcoElasticoRelativo)

        const imagenesAmpliablesEstaticas = marcoElasticoRelativo.querySelectorAll("[componente=fotoAmpliable]")
        imagenesAmpliablesEstaticas.forEach(iA =>
            iA.addEventListener("click", (e) => {
                casaVitini.view.__sharedMethods__.ampliadorDeImagen.ampliarImagen(e)
            })
        )

        this.photoGrid.start()
        await this.obtenerApartmentosIDV({
            instanciaUID
        })

        this.__observers__.controlImagen = () => {
            const elementos = document.querySelectorAll('[urlImagen]');
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.intersectionRatio >= 0.1) {
                        const div = entry.target;
                        const bgUrl = div.getAttribute('urlImagen');
                        div.style.backgroundImage = `url(${bgUrl})`;
                        observer.unobserve(div);
                    }
                });
            }, {
                threshold: 0.1
            });
            elementos.forEach(el => observer.observe(el));
            return observer;
        };
        this.__observers__.controlImagen();

        if (parametros?.zona === "alojamientos") {
            this.irAApartamentos({})
        }
    },
    irAApartamentos: (e) => {
        if (e.hasOwnProperty("preventDefault")) {
            e?.preventDefault()
            e?.stopPropagation()
        }
        const destino = document.querySelector("[componente=destinoScroll]")
        destino.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    },
    obtenerApartmentosIDV: async function (data) {
        const instanciaUID = data.instanciaUID
        const mainSel = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!mainSel) { return }
        const spinner = casaVitini.ui.componentes.spinnerSimple()
        mainSel.appendChild(spinner)

        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "componentes/obtenerTodoApartamentoIDVPublico"
        })
        spinner?.remove()

        if (respuestaServidor?.error) {
            contenedorApartamento.textContent(respuestaServidor.error)
        }
        if (respuestaServidor?.ok) {
            const configuracionDeAlojamientoPublicas = respuestaServidor.configuracionDeAlojamientoPublicas

            const marcoElasticoRelativo = mainSel.querySelector("[contenedor=marcoElasticoRelativo]")

            const contenedorApartamento = document.createElement("div")
            contenedorApartamento.classList.add("flexVertical", "gap20", "paddingLateral80")
            contenedorApartamento.style.gap = "40px"
            contenedorApartamento.setAttribute("contenedor", "apartamentos")

            if (configuracionDeAlojamientoPublicas.length > 0) {
                this.renderizaTituloPegajoso({ instanciaUID })
                marcoElasticoRelativo.appendChild(contenedorApartamento)
            }
            for (const cA of configuracionDeAlojamientoPublicas) {
                await this.contenedorApartmentoUI({
                    cA,
                    contenedorApartamento
                })
            }
        }
    },
    moverFotoEnContenedor: async function (data) {
        const sentido = data.sentido
        const gridImagenes = data.gridImagenes
        const contenedorVisile = gridImagenes.querySelector("[estado=visible]")
        const contenedoresImagenVisible = gridImagenes.querySelectorAll("[imagenUID][estado=visible]")
        const contenedoresImagen = gridImagenes.querySelectorAll("[imagenUID]")
        const contenedoresDuranteMovimiento = gridImagenes.querySelectorAll("[imagenUID][durante=movimiento]")

        if (contenedoresDuranteMovimiento.length >= 2) {

            contenedoresImagen.forEach(c => {

                c.classList.remove("contenedorImagenMovimientoNormal")
                c.style.width = getComputedStyle(c).width;
                c.offsetWidth;
                c.classList.add("contenedorImangeControMovimiento")
                c.style.width = "0%"
            })
        } else {
            contenedoresImagen.forEach(c => {

                c.classList.remove("contenedorImangeControMovimiento")
                c.classList.add("contenedorImagenMovimientoNormal")
                c.style.width = "0%"
            })
        }

        const finTransicion = (e) => {
            e.target.removeAttribute("durante")
        }


        contenedorVisile.removeAttribute("estado")
        contenedorVisile.setAttribute("durante", "movimiento")
        contenedorVisile.addEventListener("transitionend", (e) => {
            finTransicion(e)
        }, { once: true })

        if (sentido === "adelante") {


            const siguienteElemento = contenedorVisile.nextElementSibling
            if (siguienteElemento) {
                siguienteElemento.setAttribute("estado", "visible")
                siguienteElemento.style.width = "100%"
                siguienteElemento.setAttribute("durante", "movimiento")

                siguienteElemento.addEventListener("transitionend", (e) => {
                    finTransicion(e)
                }, { once: true })

            } else {
                const primerElemento = gridImagenes.firstElementChild;
                // primerElemento.style.width = "0%"
                primerElemento.setAttribute("durante", "movimiento")

                gridImagenes.appendChild(primerElemento)

                primerElemento.addEventListener("transitionend", (e) => {
                    finTransicion(e)
                }, { once: true })
                requestAnimationFrame(() => {
                    primerElemento.setAttribute("estado", "visible")
                    primerElemento.style.width = "100%"
                });
            }
        } else if (sentido === "atras") {
            const anteriorElemento = contenedorVisile.previousElementSibling
            if (anteriorElemento) {
                anteriorElemento.setAttribute("estado", "visible")
                anteriorElemento.style.width = "100%"
                anteriorElemento.setAttribute("durante", "movimiento")

                anteriorElemento.addEventListener("transitionend", (e) => {
                    finTransicion(e)
                }, { once: true })

            } else {
                const ultimoElemento = gridImagenes.lastElementChild;
                // primerElemento.style.width = "0%"
                ultimoElemento.setAttribute("durante", "movimiento")

                gridImagenes.insertBefore(ultimoElemento, gridImagenes.firstChild);

                ultimoElemento.addEventListener("transitionend", (e) => {
                    finTransicion(e)
                }, { once: true })
                requestAnimationFrame(() => {
                    ultimoElemento.setAttribute("estado", "visible")
                    ultimoElemento.style.width = "100%"
                });
            }
        }
    },


    contenedorApartmentoUI: async function (data) {

        const cA = data.cA
        const contenedorApartamento = data.contenedorApartamento
        const apartamentoIDV = cA.apartamentoIDV
        const apartamentoUI = cA.aparatmentoUI
        const apartamentoUIPublico = cA.apartamentoUIPublico
        const definicionPublica = cA.definicionPublica
        const caracteristicas = cA.caracteristicas
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const numeroHuespedes = cA.numeroHuespedes || 0
        const habitaciones = cA.habitaciones || []
        const descripcionB64 = cA.descripcion
        const descripcion = casaVitini.utilidades.conversor.base64HaciaConTextDecoder(descripcionB64)

        const ui = document.createElement("div")
        ui.classList.add("grid_contenedorApartamentos", "borderRadius20", "padding10", "gap10", "contenedorApartamento")
        ui.setAttribute("instanciaUID", instanciaUID)
        ui.setAttribute("grupoIDV", apartamentoIDV)
        ui.style.alignItems = "start"
        ui.style.background = "#f6e1af"
        contenedorApartamento.appendChild(ui)


        const cInfoResponsive = document.createElement("div")
        cInfoResponsive.classList.add("flexVertical", "gap10", "paddingLateral20", "tituloApartmentoResponsivo")
        ui.appendChild(cInfoResponsive)

        const tituloPublicoRes = document.createElement("p")
        tituloPublicoRes.classList.add("negrita", "nombreApartmento")
        tituloPublicoRes.textContent = apartamentoUIPublico
        cInfoResponsive.appendChild(tituloPublicoRes)

        if (definicionPublica.length > 0) {
            const definicionPublicaUIRes = document.createElement("p")
            definicionPublicaUIRes.classList.add("subtituloApartramento")
            definicionPublicaUIRes.textContent = definicionPublica
            cInfoResponsive.appendChild(definicionPublicaUIRes)
        }




        const superContenedorImagenes = document.createElement("div")
        superContenedorImagenes.classList.add("grid3x3_0_fr_0", "flextJustificacion_center", "flexAHCentrad")
        superContenedorImagenes.setAttribute("superContenedor", "imagenes")
        ui.appendChild(superContenedorImagenes)



        const contenedorBotonAtras = document.createElement("div")
        contenedorBotonAtras.classList.add("botonAtras", "button")
        contenedorBotonAtras.addEventListener("click", () => {
            this.moverFotoEnContenedor({
                sentido: "atras",
                gridImagenes
            })
        })
        superContenedorImagenes.appendChild(contenedorBotonAtras)

        const iconoAtras = document.createElement("div")
        iconoAtras.classList.add("triangleL")
        contenedorBotonAtras.appendChild(iconoAtras)


        const gridImagenes = document.createElement("div")
        gridImagenes.classList.add("gridImagenesApartamento")
        gridImagenes.setAttribute("contenedor", "gridImagenes")
        superContenedorImagenes.appendChild(gridImagenes)


        const contenedorBotonAdelante = document.createElement("div")
        contenedorBotonAdelante.classList.add("botonAdelante", "button")
        contenedorBotonAdelante.addEventListener("click", () => {
            this.moverFotoEnContenedor({
                sentido: "adelante",
                gridImagenes
            })
        })
        superContenedorImagenes.appendChild(contenedorBotonAdelante)

        const iconoAdelante = document.createElement("div")
        iconoAdelante.classList.add("triangleR")
        contenedorBotonAdelante.appendChild(iconoAdelante)



        const contenedorInfoGlobal = document.createElement("div")
        contenedorInfoGlobal.classList.add("flexVertical", "borderRadius14", "paddingLateral18", "paddinVertical10", "contenedorInfoGlobal", "gap12", "fontForImg")
        ui.appendChild(contenedorInfoGlobal)


        const cInfoNORes = document.createElement("div")
        cInfoNORes.classList.add("flexVertical", "gap10", "tituloApartmentoNOResponsivo")
        contenedorInfoGlobal.appendChild(cInfoNORes)

        const tituloPublico = document.createElement("p")
        tituloPublico.classList.add("negrita", "nombreApartmento")
        tituloPublico.textContent = apartamentoUIPublico
        cInfoNORes.appendChild(tituloPublico)

        if (definicionPublica.length > 0) {
            const definicionPublicaUI = document.createElement("p")
            definicionPublicaUI.classList.add("subtituloApartramento")
            definicionPublicaUI.textContent = definicionPublica
            cInfoNORes.appendChild(definicionPublicaUI)
        }


        // const infoGlobalAlojamiento = document.createElement("div")
        // infoGlobalAlojamiento.classList.add("flexVertical", "gap10")
        // contenedorInfoGlobal.appendChild(infoGlobalAlojamiento)

        const contendorDetallesInfo = document.createElement("div")
        contendorDetallesInfo.setAttribute("aqui", "este")
        contendorDetallesInfo.classList.add("flexVertical", "elementosExpandidos", "flex1", "gap10")
        contenedorInfoGlobal.appendChild(contendorDetallesInfo)

        const cSuperior = document.createElement("div")
        cSuperior.classList.add("flexVertical", "gap10")
        contendorDetallesInfo.appendChild(cSuperior)

        const cInferior = document.createElement("div")
        cInferior.classList.add("flexVertical", "gap10")
        contendorDetallesInfo.appendChild(cInferior)



        // const infoDown = document.createElement("div")
        // infoDown.classList.add("flexVertical", "gap10")
        // infoDown.setAttribute("informacion", "detalles")
        // contendorDetallesInfo.appendChild(infoDown)




        // const contenedorCGlobales = document.createElement("div")
        // contenedorCGlobales.classList.add("flexVertical")
        // //   contenedorCGlobales.style.gridTemplateColumns = "min-content min-content"
        // infoGlobalAlojamiento.appendChild(contenedorCGlobales)

        const cHuespuedes = document.createElement("div")
        cHuespuedes.classList.add("flexHorizontal", "whiteSpaceNoWrap", "gap6")
        cSuperior.appendChild(cHuespuedes)

        const cHuespedesIcono = document.createElement("div")
        cHuespedesIcono.classList.add("flexHorizontal", "contenedorIconoCompatido")
        cHuespuedes.appendChild(cHuespedesIcono)

        for (let index = 0; index < Number(numeroHuespedes); index++) {
            const icono1 = document.createElement("img")
            icono1.src = "/activos/iconos/guest.svg"
            icono1.classList.add("iconoH")
            cHuespedesIcono.appendChild(icono1)
        }



        const habitacionesCadena = (data) => {
            const habitaciones = data.habitaciones
            if (habitaciones.length === 1) {
                return `${habitaciones.length} Habitación`
            } else {
                return `${habitaciones.length} Habitaciónes`
            }


        }
        const cHuespedesTitulo = document.createElement("div")
        cHuespedesTitulo.classList.add("flexVertical", "whiteSpaceNoWrap", "flextJustificacion_center")
        cHuespedesTitulo.textContent = "Huespedes"
        cHuespuedes.appendChild(cHuespedesTitulo)

        // const cH = document.createElement("div")
        // cH.classList.add("flexHorizontal", "gap6")
        // contendorDetallesInfo.appendChild(cH)

        // const cHI = document.createElement("div")
        // cHI.classList.add("flexVertical", "contenedorIconoCompatido", "flextJustificacion_center", "flexAHCentrad")
        // cHI.textContent = habitacionesCadena({
        //     habitaciones
        // })
        // cH.appendChild(cHI)

        // const cHT = document.createElement("div")
        // cHT.classList.add("flexVertical", "whiteSpaceNoWrap", "flextJustificacion_center")
        // cHT.textContent = "Habitaciones"
        // cH.appendChild(cHT)


        const contenedorCaracteristicas = document.createElement("div")
        contenedorCaracteristicas.classList.add("flexVertical")
        cSuperior.appendChild(contenedorCaracteristicas)


        caracteristicas.forEach(c => {
            const caracteristicaUI = c.caracteristicaUI
            const cUI = document.createElement("p")
            cUI.style.fontWeight = "normal"
            cUI.textContent = caracteristicaUI
            contenedorCaracteristicas.appendChild(cUI)

        })


        const contenedorResto = document.createElement("div")
        contenedorResto.classList.add("grid")
        contenedorResto.style.gridTemplateColumns = "auto 1fr"
        cInferior.appendChild(contenedorResto)

        const cMasInfo = document.createElement("div")

        if (descripcion.length > 0) {
            cMasInfo.classList.add("flexVertical", "botonMasInfo", "ratonDefault")

            cMasInfo.textContent = "Mas información"
            cMasInfo.addEventListener("click", () => {
                this.masInfoAlojamiento({
                    apartamentoIDV,
                    descripcion
                })
            })
        }
        contenedorResto.appendChild(cMasInfo)

        const cPrecio = document.createElement("div")
        cPrecio.classList.add("flexVertical", "flexAlineacionDerecha", "flextJustificacion_center")
        contenedorResto.appendChild(cPrecio)


        const precioUIDesde = document.createElement("p")
        precioUIDesde.style.fontWeight = "normal"
        precioUIDesde.setAttribute("campo", "precio")
        precioUIDesde.textContent = "Obteniendo precio..."
        cPrecio.appendChild(precioUIDesde)

        this.obtenerPrecioApartamentos({
            apartamentoIDV,
            destino: precioUIDesde
        })



        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "componentes/obtenerTodoImagenUIDPorApartamentoIDVPublico",
            apartamentoIDV
        })
        if (respuestaServidor?.error) {
            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            await this.redenderizaContenedorImagen({
                respuestaServidor,
                gridImagenes,
                instanciaUID
            })
        }

    },
    redenderizaContenedorImagen: async function (data) {
        const instanciaUID = data.instanciaUID
        const rS = data.respuestaServidor
        const apartamentoIDV = rS.apartamentoIDV
        const imagenes = rS.imagenes
        imagenes.sort((a, b) => a.posicion - b.posicion);

        if (imagenes.length === 0) {
            document.querySelector(`[instanciaUID="${instanciaUID}"] [contenedor=gridImagenes]`)?.remove()
            return
        }

        let primera = true
        imagenes.forEach(imagen => {
            const imagenUID = imagen?.imagenUID
            const posicion = imagen?.posicion
            const titulo = imagen.titulo
            const descripcion = imagen.descripcion
            const contenedor = this.contenedorImagen({
                imagenBase64: "",
                apartamentoIDV,
                imagenUID,
                posicion,
                titulo,
                descripcion,
                estadoInicial: "cargando"
            })
            if (primera) {
                contenedor.setAttribute("estado", "visible")
                contenedor.style.width = "100%"
                primera = false
            } else {
                contenedor.style.width = "0%"
            }

            const destino = document.querySelector(`[instanciaUID="${instanciaUID}"] [contenedor=gridImagenes]`)


            if (destino) {
                destino.appendChild(contenedor)
                casaVitini.view.obtenerImagenNuevo({
                    instanciaUID_destino: contenedor.getAttribute("instanciaUID"),
                    imagenUID,
                    apartamentoIDV
                })
            }
        })
    },
    // obtenerImagen: async function (data) {

    //     const instanciaUID_destino = data.instanciaUID_destino
    //     const imagenUID = data.imagenUID
    //     const apartamentoIDV = data.apartamentoIDV
    //     const respuestaServidor = await casaVitini.shell.servidor({
    //         zona: "componentes/obtenerImagenPorApartamentoIDVPublico",
    //         apartamentoIDV,
    //         imagenUID
    //     })

    //     const uiRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_destino}"]`)
    //     if (uiRenderizada) {
    //         if (respuestaServidor?.error) {
    //             return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.error)
    //         }
    //         if (respuestaServidor?.ok) {
    //             const imagenBase64 = respuestaServidor.imagen.imagenBase64
    //             const tipoDeImagen = casaVitini.utilidades.formatos.imagenes.base64(imagenBase64);
    //             uiRenderizada.querySelector("[contenedor=imagenBase64]").style.backgroundImage = `url(data:image/${tipoDeImagen.toLowerCase()};base64,${imagenBase64})`;
    //             uiRenderizada.querySelector("[contenedor=imagenBase64] [contenedor=spinner]")?.remove()
    //             uiRenderizada.removeAttribute("estadoActual")
    //             const imagenAmpliadaEnEspera = document.querySelector(`[imagenUID_ampliada="${imagenUID}"]`)

    //             if (imagenAmpliadaEnEspera) {
    //                 imagenAmpliadaEnEspera.querySelector("[contenedor=imagenVolatil]").style.backgroundImage = `url(data:image/${tipoDeImagen.toLowerCase()};base64,${imagenBase64})`;
    //                 imagenAmpliadaEnEspera.querySelector("[contenedor=imagenVolatil] [contenedor=spinner]")?.remove()
    //             }
    //         }
    //     }

    // },
    obtenerImagenNuevo: function (data) {

        const instanciaUID_destino = data.instanciaUID_destino
        const imagenUID = data.imagenUID
        const uiRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_destino}"]`)
        if (uiRenderizada) {
            uiRenderizada.querySelector("[contenedor=imagenBase64]").setAttribute("urlImagen", `/com/imagenes/${imagenUID}`)
            uiRenderizada.querySelector("[contenedor=imagenBase64] [contenedor=spinner]")?.remove()
            uiRenderizada.removeAttribute("estadoActual")
            const imagenAmpliadaEnEspera = document.querySelector(`[imagenUID_ampliada="${imagenUID}"]`)

            if (imagenAmpliadaEnEspera) {
                imagenAmpliadaEnEspera.querySelector("[contenedor=imagenVolatil]").setAttribute("urlImagen", `/com/imagenes/${imagenUID}`)
                imagenAmpliadaEnEspera.querySelector("[contenedor=imagenVolatil] [contenedor=spinner]")?.remove()
            }
        }

    },
    contenedorImagen: function (data) {
        const imagenBase64 = data.imagenBase64
        const apartamentoIDV = data.apartamentoIDV
        const imagenUID = data.imagenUID
        const posicion = data?.posicion
        const estadoInicial = data.estadoInicial
        const titulo = data.titulo || ""
        const descripcion = data.descripcion || ""
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const imagenResponsiva = `${apartamentoIDV}_imagen${posicion}`
        const contenedor = document.createElement("div")
        contenedor.classList.add("flexVertical", "contenedorImagen", "sobreControlAnimacionGlobal")
        contenedor.setAttribute("instanciauID", instanciaUID)
        contenedor.setAttribute("imagenUID", imagenUID)
        contenedor.setAttribute("imagenResponsiva", imagenResponsiva)
        contenedor.setAttribute("componente", "fotoAmpliable")
        contenedor.setAttribute("apartamentoIDV", apartamentoIDV)
        contenedor.addEventListener("click", (e) => {
            casaVitini.view.__sharedMethods__.ampliadorDeImagen.ampliarImagen(e)
        })

        const cImagen = document.createElement("div")
        cImagen.classList.add("flexVertical", "contenedorImagenFondo")
        cImagen.setAttribute("contenedor", "imagenBase64")
        cImagen.setAttribute("titulo", titulo)
        cImagen.setAttribute("descripcion", descripcion)
        cImagen.setAttribute("origenImagen", "atributo")
        cImagen.setAttribute("tipoImagen", "url")
        // if (imagenBase64.length > 0) {
        //     const tipoDeImagen = casaVitini.utilidades.formatos.imagenes.base64(imagenBase64);
        //     cImagen.style.backgroundImage = `url(data:image/${tipoDeImagen.toLowerCase()};base64,${imagenBase64})`;
        // }
        contenedor.appendChild(cImagen)

        const spinner = casaVitini.ui.componentes.spinnerSimple()
        spinner.classList.add("blur50")

        if (estadoInicial === "cargando") {
            cImagen.appendChild(spinner)
            contenedor.setAttribute("estadoActual", "cargando")

        }
        return contenedor
    },
    renderizaTituloPegajoso: function (data) {
        const instanciaUID = data.instanciaUID

        const mainSel = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!mainSel) { return }

        const z = mainSel.querySelector("[z=instalaciones]")
        const destinoScroll = document.createElement("div")
        destinoScroll.setAttribute("componente", "destinoScroll")
        z.appendChild(destinoScroll)

        const tituloPegajoso = document.createElement("div")
        tituloPegajoso.setAttribute("componente", "tituloPegajoso")
        tituloPegajoso.classList.add(
            "flexVertical",
            "flexAHCentrad"
        )
        z.appendChild(tituloPegajoso)

        const titulo = document.createElement("h1")
        titulo.classList.add(
            "tituloGris",
            "textoCentrado",
            "paddinVertical10",
            "borderRadius20",
            "paddinHorizontal40",
            "backgroundWhite5",
            "transitionAll500",
            "ratonDefault",
            "noSelecionable",
            "fontForImg"

        )
        titulo.style.color = "#2f2622"
        titulo.setAttribute("componenete", "tituloTextoApartamentos")
        titulo.classList.add("botonDinamico")
        titulo.textContent = "APARTAMENTOS"
        tituloPegajoso.appendChild(titulo)

        const controladorAlturaTituloDinamico = () => {
            const selectorInstanciaActual = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
            if (!selectorInstanciaActual) {
                document.removeEventListener("scroll", controladorAlturaTituloDinamico)
            }
            const boundingRect1 = destinoScroll.getBoundingClientRect();
            const boundingRect = tituloPegajoso.getBoundingClientRect();
            const stickyTop = 80;
            tituloPegajoso.style.position = "sticky"
            tituloPegajoso.style.bottom = "20px"
            tituloPegajoso.style.zIndex = "2"

            if (boundingRect1.bottom >= (window.innerHeight - stickyTop)) {
                titulo.classList.add("plegado")
                titulo.classList.remove("desplegado")
                titulo.textContent = "VER APARTAMENTOS"
                titulo.addEventListener("click", this.irAApartamentos)
            } else {
                titulo.classList.add("desplegado")
                titulo.classList.remove("plegado")
                titulo.textContent = "APARTAMENTOS"
                titulo.removeEventListener("click", this.irAApartamentos)

            }
        }
        document.addEventListener("scroll", controladorAlturaTituloDinamico)
        controladorAlturaTituloDinamico()
    },
    photoGrid: {
        start: function () {
            const main = document.querySelector("main")
            const photoGrid = main.querySelector("[com=photoGrid]")
            const botonAtras = photoGrid.querySelector("[com=atras]")
            botonAtras.addEventListener("click", (e) => {
                this.moverFotos(e)
            })
            const botonAdelante = photoGrid.querySelector("[com=adelante]")
            botonAdelante.addEventListener("click", (e) => {
                this.moverFotos(e)
            })

        },
        moverFotos: function (e) {
            const main = document.querySelector("main")
            const photoGrid = main.querySelector("[com=photoGrid]")
            const botonSel = e.target.getAttribute("com")

            const horizontalPhoto = photoGrid.querySelector("[origenImagen]")
            const elementWidth = horizontalPhoto.getBoundingClientRect().width;
            if (botonSel === "adelante") {
                photoGrid.scrollTo({
                    left: photoGrid.scrollLeft + elementWidth,
                    behavior: 'smooth'
                });
            } else if (botonSel === "atras") {
                photoGrid.scrollTo({
                    left: photoGrid.scrollLeft - elementWidth,
                    behavior: 'smooth'
                });
            }
        }
    },
    obtenerPrecioApartamentos: async function (data) {

        const apartamentoIDV = data.apartamentoIDV
        const destino = data.destino
        const apartamentosIDVARRAY = []
        apartamentosIDVARRAY.push(apartamentoIDV)
        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "plaza/reservas/preciosPorSeleccion",
            tipoRango: "presente",
            apartamentosIDVARRAY
        })
        if (respuestaServidor.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.error)

        } else if (respuestaServidor.ok) {
            const preciosPorSeleccion = respuestaServidor.preciosPorSeleccion[apartamentoIDV].precioEnBaseASeleccion
            destino.textContent = `Desde ${preciosPorSeleccion}$ Noche`
        }

    },
    masInfoAlojamiento: function (data) {
        const main = document.querySelector("main")
        const apartmentoIDV = data.aparatmentoIDV
        const descripcion = data.descripcion
        const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
        const contenedor = ui.querySelector("[componente=contenedor]")
        contenedor.style.gap = "20px"
        main.appendChild(ui)

        const texto = document.createElement("pre")
        texto.classList.add("whiteSpace")
        texto.style.background = "white"
        texto.style.borderRadius = "14px"
        texto.style.padding = "20px"
        texto.textContent = descripcion
        contenedor.append(texto)

        const botonCancelar = document.createElement("div")
        botonCancelar.classList.add("botonV1")
        botonCancelar.setAttribute("boton", "cancelar")
        botonCancelar.textContent = "Cerra y volver"
        botonCancelar.addEventListener("click", () => {
            return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
        })
        contenedor.appendChild(botonCancelar)



    },
    __observers__: {}
}