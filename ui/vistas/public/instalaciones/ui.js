casaVitini.view = {
    start: function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "instalaciones")
        const instanciaUID = main.getAttribute("instanciaUID")

        document.body.style.backgroundColor = "rgb(255 188 0 / 0.14)"
        main.style.paddingTop = "10px"
        main.style.maxWidth = "100%"

        const marcoElasticoRelativo = main.querySelector("[contenedor=marcoElasticoRelativo]")
        main.appendChild(marcoElasticoRelativo)

        const imagenesAmpliablesEstaticas = marcoElasticoRelativo.querySelectorAll("[componente=fotoAmpliable]")
        imagenesAmpliablesEstaticas.forEach(iA =>
            iA.addEventListener("click", (e) => {
                casaVitini.ui.componentes.componentesComplejos.ampliadorDeImagen.ampliarImagen(e)
            })
        )

        return this.obtenerApartmentosIDV({
            instanciaUID
        })
    },
    irAApartamentos: (e) => {
        e.preventDefault()
        e.stopPropagation()
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
            contenedorApartamento.classList.add("flexVertical", "gap20")
            contenedorApartamento.setAttribute("contenedor", "apartamentos")

            if (configuracionDeAlojamientoPublicas.length > 0) {
                this.renderizaTituloPegajoso({ instanciaUID })
                marcoElasticoRelativo.appendChild(contenedorApartamento)
            }

            configuracionDeAlojamientoPublicas.forEach(cA => {

                this.contenedorApartmentoUI({
                    cA,
                    contenedorApartamento
                })
            })
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
        contenedorInfoGlobal.classList.add("flexVertical", "borderRadius14", "backgroundWhite5", "padding18", "contenedorInfoGlobal", "gap6")
        ui.appendChild(contenedorInfoGlobal)

        const infoGlobalAlojamiento = document.createElement("div")
        infoGlobalAlojamiento.classList.add("flexVertical")
        contenedorInfoGlobal.appendChild(infoGlobalAlojamiento)

        const tituloPublico = document.createElement("p")
        tituloPublico.classList.add("negrita")
        tituloPublico.textContent = apartamentoUIPublico
        infoGlobalAlojamiento.appendChild(tituloPublico)

        const definicionPublicaUI = document.createElement("p")
        definicionPublicaUI.textContent = definicionPublica
        infoGlobalAlojamiento.appendChild(definicionPublicaUI)

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
               return this.redenderizaContenedorImagen({
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
                casaVitini.view.obtenerImagen({
                    instanciaUID_destino: contenedor.getAttribute("instanciaUID"),
                    imagenUID,
                    apartamentoIDV
                })
            }
        })
    },
    obtenerImagen: async function (data) {

        const instanciaUID_destino = data.instanciaUID_destino
        const imagenUID = data.imagenUID
        const apartamentoIDV = data.apartamentoIDV
        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "componentes/obtenerImagenPorApartamentoIDVPublico",
            apartamentoIDV,
            imagenUID
        })

        const uiRenderizada = document.querySelector(`[instanciaUID="${instanciaUID_destino}"]`)
        if (uiRenderizada) {
            if (respuestaServidor?.error) {
                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor.error)
            }
            if (respuestaServidor?.ok) {
                const imagenBase64 = respuestaServidor.imagen.imagenBase64
                const tipoDeImagen = casaVitini.utilidades.formatos.imagenes.base64(imagenBase64);
                uiRenderizada.querySelector("[contenedor=imagenBase64]").style.backgroundImage = `url(data:image/${tipoDeImagen.toLowerCase()};base64,${imagenBase64})`;
                uiRenderizada.querySelector("[contenedor=imagenBase64] [contenedor=spinner]")?.remove()
                uiRenderizada.removeAttribute("estadoActual")
                const imagenAmpliadaEnEspera = document.querySelector(`[imagenUID_ampliada="${imagenUID}"]`)

                if (imagenAmpliadaEnEspera) {
                    imagenAmpliadaEnEspera.querySelector("[contenedor=imagenVolatil]").style.backgroundImage = `url(data:image/${tipoDeImagen.toLowerCase()};base64,${imagenBase64})`;
                    imagenAmpliadaEnEspera.querySelector("[contenedor=imagenVolatil] [contenedor=spinner]")?.remove()
                }
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
            casaVitini.ui.componentes.componentesComplejos.ampliadorDeImagen.ampliarImagen(e)
        })

        const cImagen = document.createElement("div")
        cImagen.classList.add("flexVertical", "contenedorImagenFondo")
        cImagen.setAttribute("contenedor", "imagenBase64")
        cImagen.setAttribute("titulo", titulo)
        cImagen.setAttribute("descripcion", descripcion)
        if (imagenBase64.length > 0) {
            const tipoDeImagen = casaVitini.utilidades.formatos.imagenes.base64(imagenBase64);
            cImagen.style.backgroundImage = `url(data:image/${tipoDeImagen.toLowerCase()};base64,${imagenBase64})`;
        }
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

        const titulo = document.createElement("p")
        titulo.classList.add(
            "tituloGris",
            "textoCentrado",
            "paddinVertical10",
            "borderRadius20",
            "paddinHorizontal40",
            "backgroundWhite5",
            "transitionAll500",
            "ratonDefault",
            "noSelecionable"
        )
        titulo.setAttribute("componenete", "tituloTextoApartamentos")
        titulo.textContent = "Apartamentos"
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
                titulo.style.boxShadow = "0px 0px 28px 0px rgba(0, 0, 0, 0.5)"
                titulo.style.backdropFilter = "blur(50px)"
                titulo.style.webkitBackdropFilter = "blur(50px)"
                titulo.style.background = ""
                titulo.style.fontSize = "13px"
                titulo.textContent = "Ver apartamentos"
                titulo.addEventListener("click", this.irAApartamentos)
            } else {
                titulo.style.boxShadow = "0px 0px 0px 0px rgba(0, 0, 0, 0)"
                titulo.style.background = "transparent"
                titulo.style.fontSize = "40px"
                titulo.textContent = "Apartamentos"
                titulo.removeEventListener("click", this.irAApartamentos)

            }
        }
        document.addEventListener("scroll", controladorAlturaTituloDinamico)
        controladorAlturaTituloDinamico()
    }
}