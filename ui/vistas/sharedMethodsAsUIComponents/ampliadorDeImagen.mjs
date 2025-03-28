
export const ampliadorDeImagen = {
    ampliadorDeImagen: {
        cerrarImagen: function (e) {
            const contenedorImagenAmpliada = e.target.closest("[componente=contenedorImagenAmpliada]")
            const grupoActual = contenedorImagenAmpliada.getAttribute("grupoActualIDV")
            const numeroImagen = contenedorImagenAmpliada.getAttribute("numeroImagen")
            const imagenElemento = document.querySelector(`main [grupoIDV="${grupoActual}"] [numeroImagen="${numeroImagen}"]`)
            const posicionImagen = imagenElemento.getBoundingClientRect();
            const contenedorImagen = contenedorImagenAmpliada.querySelector("[contenedor=imagenVolatil]")
            contenedorImagen.addEventListener("transitionend", () => {
                contenedorImagenAmpliada.remove()
            })
            const galeriaFlotante = imagenElemento.closest("[contenedor=galeriaFlotante]")
            if (!galeriaFlotante) {
                document.body.style.removeProperty("overflow")
            }
            contenedorImagenAmpliada.removeAttribute("style")
            contenedorImagenAmpliada.style.pointerEvents = "none"
            contenedorImagen.style.top = posicionImagen.y + "px"
            contenedorImagen.style.left = posicionImagen.x + "px"
            contenedorImagen.style.width = posicionImagen.width + "px"
            contenedorImagen.style.height = posicionImagen.height + "px"
            contenedorImagenAmpliada.style.opacity = "0"
        },
        cambiarImagen: function (data) {
            const sentido = data.sentido

            const contenedorImagenAmpliada = data.e.target.closest("[componente=contenedorImagenAmpliada]")
            const grupoActual = contenedorImagenAmpliada.getAttribute("grupoActualIDV")
            const imagenActual = contenedorImagenAmpliada.getAttribute("numeroImagen")
            const numerosTotales = contenedorImagenAmpliada.getAttribute("numerosTotales")
            let imagenDestino
            if (sentido === "imagenSiguiente") {
                const imagenSiguiente = Number(imagenActual) + 1
                imagenDestino = imagenSiguiente > numerosTotales ? 0 : imagenSiguiente
            } else if (sentido === "imagenAnterior") {
                const imagenAnterior = Number(imagenActual) - 1
                imagenDestino = imagenAnterior < 0 ? numerosTotales : imagenAnterior
            }
            contenedorImagenAmpliada.setAttribute("numeroImagen", imagenDestino)
            const contenedorImagen = document
                .querySelector(`[grupoIDV="${grupoActual}"] [numeroImagen="${imagenDestino}"]`)
            const imagenUID = contenedorImagen.getAttribute("imagenUID")
            contenedorImagenAmpliada.setAttribute("imagenUID_ampliada", imagenUID)
            const imagen = contenedorImagen.querySelector("[origenImagen]")
            const origenImagen = imagen.getAttribute("origenImagen")
            const tipoImagen = imagen.getAttribute("tipoImagen")

            if (origenImagen === "clase") {
                fondoClaseCSS = imagen.style.backgroundImage
            } else if (origenImagen === "linea") {
                const estilo = getComputedStyle(imagen);
                fondoClaseCSS = estilo.backgroundImage;
            } else if (origenImagen === "atributo") {
                fondoClaseCSS = imagen.getAttribute("urlImagen")
            } else {
                //casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                this.cerrarImagen(data.e)
                casaVitini.ui.componentes.advertenciaInmersiva("No se ha especificado el origen")
                return
            }
            let imagenValor
            if (tipoImagen === "url") {
                imagenValor = `url(${fondoClaseCSS})`
            } else if (tipoImagen === "base64") {
                imagenValor = fondoClaseCSS;
            } else {
                // casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                this.cerrarImagen(data.e)

                return casaVitini.ui.componentes.advertenciaInmersiva("tipoImagen debe de esepcificarse en url o base64")
            }


            //  const imagenBase64 = imagen.style.backgroundImage
            const imagenVolatil = contenedorImagenAmpliada.querySelector(`[contenedor=imagenVolatil]`)
            imagenVolatil.style.backgroundImage = imagenValor
            const titulo = imagen.getAttribute("titulo")
            const descripcion = imagen.getAttribute("descripcion")
            this.uiInfoImagen({
                titulo,
                descripcion
            })
        },
        uiInfoImagen: function (data) {
            const titulo = data.titulo || ""
            const descripcion = data.descripcion || ""
            const contenedorImagenAmpliada = document.querySelector(`[componente=contenedorImagenAmpliada]`)
            if (titulo.length > 0 || descripcion.length > 0) {
                const uiRenderizada = contenedorImagenAmpliada.querySelector("[contenedor=infoImagen]")
                if (!uiRenderizada) {
                    const uiInfo = document.createElement("div")
                    uiInfo.setAttribute("contenedor", "infoImagen")
                    uiInfo.classList.add("flexVertical", "borderRadius20", "padding18", "backgroundWhite3", "blur50")
                    uiInfo.style.bottom = "0px"
                    uiInfo.style.position = "absolute"
                    uiInfo.style.margin = "20px"
                    uiInfo.style.wordBreak = "break-all"
                    const tituloUI = document.createElement("p")
                    tituloUI.setAttribute("data", "titulo")
                    tituloUI.classList.add("negrita")
                    tituloUI.textContent = titulo
                    uiInfo.appendChild(tituloUI)
                    const descripcionUI = document.createElement("p")
                    descripcionUI.setAttribute("data", "descripcion")
                    descripcionUI.textContent = descripcion
                    uiInfo.appendChild(descripcionUI)
                    contenedorImagenAmpliada.appendChild(uiInfo)
                } else {
                    uiRenderizada.querySelector("[data=titulo]").textContent = titulo
                    uiRenderizada.querySelector("[data=descripcion]").textContent = descripcion
                }
            } else {
                contenedorImagenAmpliada.querySelector("[contenedor=infoImagen]")?.remove()
            }
        },
        ampliarImagen: function (imagen) {
            const imagenesAmpliadasObsoletas = document.querySelectorAll("[componente=contenedorImagenAmpliada]")
            imagenesAmpliadasObsoletas.forEach(iA => iA?.remove())
            document.body.style.overflow = 'hidden';
            const imagenElemento = imagen.target.closest("[componente=fotoAmpliable]")
            const contenedorImagen = imagenElemento.querySelector("[origenImagen]")

            if (!contenedorImagen) {
                return casaVitini.ui.componentes.advertenciaInmersiva("No se ha especificado el origen")
            }


            const origenImagen = contenedorImagen?.getAttribute("origenImagen")
            const tipoImagen = contenedorImagen?.getAttribute("tipoImagen")

            let fondoClaseCSS

            if (origenImagen === "clase") {
                fondoClaseCSS = contenedorImagen.style.backgroundImage
            } else if (origenImagen === "linea") {
                const estilo = getComputedStyle(contenedorImagen);
                fondoClaseCSS = estilo.backgroundImage;
            } else if (origenImagen === "atributo") {
                fondoClaseCSS = contenedorImagen.getAttribute("urlImagen")
            } else {
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                casaVitini.ui.componentes.advertenciaInmersiva("No se ha especificado el origen")
                return
            }

            let imagenValor

            if (tipoImagen === "url") {
                imagenValor = `url(${fondoClaseCSS})`
            } else if (tipoImagen === "base64") {
                // const tipoDeImagen = casaVitini.utilidades.formatos.imagenes.base64(urlFondo);

                imagenValor = fondoClaseCSS;
            } else {
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                return casaVitini.ui.componentes.advertenciaInmersiva("tipoImagen debe de esepcificarse en url o base64")
            }

            const areaGaleria = imagen.target.closest("[grupoIDV]")
            const grupoIDV = areaGaleria.getAttribute("grupoIDV")
            const imagenesAmpliables = areaGaleria.querySelectorAll("[componente=fotoAmpliable]")
            const titulo = contenedorImagen.getAttribute("titulo") || ""
            const descripcion = contenedorImagen.getAttribute("descripcion") || ""
            const imagenUID = imagenElemento.getAttribute("imagenUID")
            const estadoActual = imagenElemento.getAttribute("estadoActual")
            let numerosTotales = 0
            imagenesAmpliables.forEach((imagenDelGrupo, numero) => {
                numerosTotales = numero
                // revisar para que esta eso
               // imagenDelGrupo.removeAttribute("style")
                imagenDelGrupo.removeAttribute("numeroImagen")
                imagenDelGrupo.setAttribute("numeroImagen", numero)
            })
            const numeroImagen = imagenElemento.getAttribute("numeroImagen")
            const posicionImagen = imagenElemento.getBoundingClientRect();
            const contenedorImagenAmpliada = document.createElement("div")
            contenedorImagenAmpliada.classList.add("contenedorImagenAmpliada", "sobreControlAnimacionGlobal")
            contenedorImagenAmpliada.setAttribute("componente", "contenedorImagenAmpliada")
            contenedorImagenAmpliada.setAttribute("grupoActualIDV", grupoIDV)
            contenedorImagenAmpliada.setAttribute("numeroImagen", numeroImagen)
            contenedorImagenAmpliada.setAttribute("numerosTotales", numerosTotales)
            contenedorImagenAmpliada.setAttribute("imagenUID_ampliada", imagenUID)
            document.querySelector("main").appendChild(contenedorImagenAmpliada)
            const contenedorBotones = document.createElement("div")
            contenedorBotones.setAttribute("componente", "contenedorBotones")
            const botonAtras = document.createElement("div")
            botonAtras.classList.add("botonV1Blanco", "blur50")
            botonAtras.textContent = "Atrás"
            botonAtras.addEventListener("click", (e) => {
                this.cambiarImagen({
                    sentido: "imagenAnterior",
                    e,
                    origenImagen,
                    tipoImagen
                })
            })
            const botonCerrar = document.createElement("div")
            botonCerrar.classList.add("botonV1Blanco", "blur50")
            botonCerrar.textContent = "Cerrar"
            botonCerrar.addEventListener("click", (e) => {
                this.cerrarImagen(e)
            })
            const botonSiguiente = document.createElement("div")
            botonSiguiente.classList.add("botonV1Blanco", "blur50")
            botonSiguiente.textContent = "Siguiente"
            botonSiguiente.addEventListener("click", (e) => {
                this.cambiarImagen({
                    sentido: "imagenSiguiente",
                    e,
                    origenImagen,
                    tipoImagen
                })
            })
            const marcoEspaciadorContenedorBotones = document.createElement("div")
            marcoEspaciadorContenedorBotones.classList.add("marcoEspaciadoContenedorBotones")
            marcoEspaciadorContenedorBotones.appendChild(contenedorBotones)
            contenedorImagenAmpliada.appendChild(marcoEspaciadorContenedorBotones)
            if (numerosTotales === 0) {
                contenedorBotones.classList.add("flexVertical", "gap10", "padding10")
                contenedorBotones.appendChild(botonCerrar)
            } else {
                contenedorBotones.classList.add("gridHorizotnal3C", "gap10", "padding10")
                contenedorBotones.appendChild(botonAtras)
                contenedorBotones.appendChild(botonCerrar)
                contenedorBotones.appendChild(botonSiguiente)
            }
            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const contenedorImagenVolatil = document.createElement("div")
            contenedorImagenVolatil.classList.add("contenedorImagenVolatil", `calendarioFlotante_${instanciaUID}`)
            contenedorImagenVolatil.style.backgroundImage = imagenValor
            contenedorImagenVolatil.setAttribute("contenedor", "imagenVolatil")
            const claseDinamica = document.createElement('style');
            claseDinamica.innerHTML = `
                .calendarioFlotante_${instanciaUID} {
                    transition: all 250ms linear;
                    top: 0px;
                    left: 0;
                    height: 100vh;
                    width: 100vw;
                    @starting-style {
                        top: ${posicionImagen.y}px;
                        left: ${posicionImagen.x}px;
                        width: ${posicionImagen.width}px;
                        height: ${posicionImagen.height}px;
                        border-radius: 20px;
                        }
                    }
            `;
            contenedorImagenVolatil.appendChild(claseDinamica);
            contenedorImagenAmpliada.appendChild(contenedorImagenVolatil)
            const spinner = casaVitini.ui.componentes.spinnerSimple()
            spinner.classList.add("blur50", "backgroundWhite3")
            if (estadoActual === "cargando") {
                contenedorImagenVolatil.appendChild(spinner)
            }
            contenedorImagenVolatil.addEventListener("transitionend", (e) => {
                e.target.closest("[componente=contenedorImagenAmpliada]").style.transition = "all 0ms"
            })
            this.uiInfoImagen({
                titulo,
                descripcion
            })
        }
    },
}