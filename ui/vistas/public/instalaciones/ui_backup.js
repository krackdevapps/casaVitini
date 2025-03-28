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
            contenedorApartamento.classList.add("flexVertical", "gap20", "paddingLateral20")
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
    contenedorApartmentoUI: async function (data) {
        const cA = data.cA
        const contenedorApartamento = data.contenedorApartamento
        const apartamentoIDV = cA.apartamentoIDV
        const apartamentoUI = cA.aparatmentoUI
        const apartamentoUIPublico = cA.apartamentoUIPublico
        const definicionPublica = cA.definicionPublica
        const caracteristicas = cA.caracteristicas
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()

        const ui = document.createElement("div")
        ui.classList.add("gridHorizontal2C_auto_1fr_resp", "borderRadius20", "backgroundWhite3", "padding10", "gap10")
        ui.setAttribute("instanciaUID", instanciaUID)
        ui.setAttribute("grupoIDV", apartamentoIDV)
        ui.style.alignItems = "start"
        ui.style.background = "#f6e1af"

        contenedorApartamento.appendChild(ui)

        const contenedorInfoGlobal = document.createElement("div")
        contenedorInfoGlobal.classList.add("flexVertical", "borderRadius14", "backgroundWhite5", "padding18", "contenedorInfoGlobal", "gap6", "fontForImg")
        ui.appendChild(contenedorInfoGlobal)

        const infoGlobalAlojamiento = document.createElement("div")
        infoGlobalAlojamiento.classList.add("flexVertical")
        contenedorInfoGlobal.appendChild(infoGlobalAlojamiento)

        const tituloPublico = document.createElement("p")
        tituloPublico.classList.add("negrita")
        tituloPublico.textContent = apartamentoUIPublico
        infoGlobalAlojamiento.appendChild(tituloPublico)

        const definicionPublicaUI = document.createElement("p")
        definicionPublicaUI.style.fontWeight = "normal"
        definicionPublicaUI.textContent = definicionPublica
        infoGlobalAlojamiento.appendChild(definicionPublicaUI)


        const precioUIDesde = document.createElement("p")
        precioUIDesde.style.fontWeight = "normal"
        precioUIDesde.setAttribute("campo", "precio")
        precioUIDesde.textContent = "Obteniendo precio..."
        infoGlobalAlojamiento.appendChild(precioUIDesde)

        this.obtenerPrecioApartamentos({
            apartamentoIDV,
            destino: precioUIDesde
        })


        const contenedorCaracteristicas = document.createElement("div")
        contenedorCaracteristicas.classList.add("flexVertical")
        contenedorInfoGlobal.appendChild(contenedorCaracteristicas)

        const gridImagenes = document.createElement("div")
        gridImagenes.classList.add("gridImagenesApartamento")
        gridImagenes.setAttribute("contenedor", "gridImagenes")
        ui.appendChild(gridImagenes)

        caracteristicas.forEach(c => {
            const caracteristicaUI = c.caracteristicaUI
            const cUI = document.createElement("p")
            cUI.style.fontWeight = "normal"
            cUI.textContent = caracteristicaUI
            contenedorCaracteristicas.appendChild(cUI)

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
        }

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
        contenedor.classList.add("flexVertical", "contenedorImagen")
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

            const horizontalPhoyo = photoGrid.querySelector("[origenImagen]")
            const elementWidth = horizontalPhoyo.getBoundingClientRect().width;
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
    __observers__: {}
}