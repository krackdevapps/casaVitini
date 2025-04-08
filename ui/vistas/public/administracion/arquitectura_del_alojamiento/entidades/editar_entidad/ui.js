casaVitini.view = {
    start: function () {
        const main = document.querySelector("main")

        main.setAttribute("zonaCSS", "administracion/arquitecturaDelAlojamiento/entidades/entidadUI")
        const granuladorURL = casaVitini.utilidades.granuladorURL()
        const parametros = granuladorURL.parametros
        this.portadaUI(Object.entries(parametros)[0])
    },
    portadaUI: async function (entidadMatriz) {
        const main = document.querySelector("main")
        const instanciaUID = main.getAttribute("instanciaUID")
        const espacioBotonesGlobales = document.querySelector("[componente=espacioBotonesGlobales]")
        const espacioConfiguracionDelAlojamiento = document.querySelector("[componente=configuracionDelAlojamiento]")
        const selectorTitulo = document.querySelector("[componente=titulo]")
        const tipoEntidad = entidadMatriz[0]
        const entidadIDV = entidadMatriz[1]
        if (tipoEntidad === "apartamento") {
            if (!entidadIDV) {

            }
            const transaccion = {
                zona: "administracion/arquitectura/entidades/detallesDeEntidadDeAlojamiento",
                tipoEntidad: "apartamento",
                entidadIDV: entidadIDV
            }
            const respuestaServidor = await casaVitini.shell.servidor(transaccion)

            const seccionRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)

            if (!seccionRenderizada) { return }
            if (respuestaServidor?.error) {
                const info = {
                    titulo: "No existe ningún apartamento como entidad con ese identificadorIDV",
                    descripcion: "No existe la entidad que buscas. Por favor, revisa el identificadorIDV que solicitaste porque este no existe. Quizás este identificador fue de una entidad de alojamiento que tuviste en el pasado y que borraste."
                }
                casaVitini.ui.componentes.mensajeSimple(info)
            }
            if (respuestaServidor?.ok) {

                const apartamentoIDV = respuestaServidor?.ok.apartamentoIDV
                const apartamentoUI = respuestaServidor?.ok.apartamentoUI
                const apartamentoUIPublico = respuestaServidor?.ok.apartamentoUIPublico
                const definicionPublica = respuestaServidor?.ok.definicionPublica
                const numeroHuespedes = respuestaServidor?.ok.numeroHuespedes
                const descripcionbB4 = respuestaServidor?.ok.descripcion

                const descripcion = casaVitini.utilidades.conversor.base64HaciaConTextDecoder(descripcionbB4)




                const caracteristicas = respuestaServidor.caracteristicas
                selectorTitulo.textContent = "Editar apartamento como entidad"
                const contenedorEntidad = document.createElement("div")
                contenedorEntidad.classList.add("flexVertical", "gap6")
                contenedorEntidad.setAttribute("tipoEntidad", "apartamento")
                contenedorEntidad.setAttribute("entidadIDV", apartamentoIDV)

                const contenedorEntidadDatos = document.createElement("div")
                contenedorEntidadDatos.classList.add("flexVertical", "gap6")
                contenedorEntidadDatos.setAttribute("componente", "contenedorEntidadDatos")
                const bloqueTituloApartamento = document.createElement("div")
                bloqueTituloApartamento.classList.add("flexVertical", "gap6")
                contenedorEntidadDatos.appendChild(bloqueTituloApartamento)

                const infoTituloApartamento = document.createElement("div")
                infoTituloApartamento.classList.add("padding14")
                infoTituloApartamento.textContent = "Nombre del apartamento"
                bloqueTituloApartamento.appendChild(infoTituloApartamento)
                const campoTituloApartamento = document.createElement("input")
                campoTituloApartamento.classList.add("botonV1BlancoIzquierda_campo")
                campoTituloApartamento.placeholder = "Escriba un nombre para el apartamento"
                campoTituloApartamento.setAttribute("valorInicial", apartamentoUI)
                campoTituloApartamento.setAttribute("campo", "apartamentoUI")
                campoTituloApartamento.value = apartamentoUI
                bloqueTituloApartamento.appendChild(campoTituloApartamento)




                const infoTituloPulicoApartamento = document.createElement("div")
                infoTituloPulicoApartamento.classList.add("padding14")
                infoTituloPulicoApartamento.textContent = "Escriba el nombre del apartamento publico. Este nombre sera mostrado publicmente para identificar y describir el parlamento"
                bloqueTituloApartamento.appendChild(infoTituloPulicoApartamento)



                const campoTituloPublicoApartamento = document.createElement("input")
                campoTituloPublicoApartamento.classList.add("botonV1BlancoIzquierda_campo")
                campoTituloPublicoApartamento.setAttribute("campo", "apartamentoUIPublico")
                campoTituloPublicoApartamento.setAttribute("valorInicial", apartamentoUIPublico)
                campoTituloPublicoApartamento.placeholder = "Nombre publico del apartamento"
                campoTituloPublicoApartamento.value = apartamentoUIPublico
                bloqueTituloApartamento.appendChild(campoTituloPublicoApartamento)
                contenedorEntidad.appendChild(bloqueTituloApartamento)


                const infoDefTituloPulicoApartamento = document.createElement("div")
                infoDefTituloPulicoApartamento.classList.add("padding14")
                infoDefTituloPulicoApartamento.textContent = "Escriba una descripcion bajo el titulo publico del apartamento, esta descripcion se mostrara bajo el titulo público del apartamento"
                bloqueTituloApartamento.appendChild(infoDefTituloPulicoApartamento)

                const campoDefTituloPublicoApartamento = document.createElement("input")
                campoDefTituloPublicoApartamento.classList.add("botonV1BlancoIzquierda_campo")
                campoDefTituloPublicoApartamento.setAttribute("campo", "definicionPublica")
                campoDefTituloPublicoApartamento.setAttribute("valorInicial", definicionPublica)
                campoDefTituloPublicoApartamento.placeholder = "Definicion publica bajo el titulo publico del apartamento"
                campoDefTituloPublicoApartamento.value = definicionPublica
                bloqueTituloApartamento.appendChild(campoDefTituloPublicoApartamento)
                contenedorEntidad.appendChild(bloqueTituloApartamento)


                const bloqueApartamentoIDV = document.createElement("div")
                bloqueApartamentoIDV.classList.add("flexVertical", "gap6")
                const infoApartamentoIDV = document.createElement("div")
                infoApartamentoIDV.classList.add("padding14")
                infoApartamentoIDV.textContent = "Identificador visual del apartamento"
                bloqueApartamentoIDV.appendChild(infoApartamentoIDV)



                const campoApartamentoIDV = document.createElement("input")
                campoApartamentoIDV.classList.add("botonV1BlancoIzquierda_campo")
                campoApartamentoIDV.placeholder = "Identificador visual del apartamento(apartamentoIDV)"
                campoApartamentoIDV.setAttribute("valorInicial", apartamentoIDV)
                campoApartamentoIDV.setAttribute("componente", "entidadIDV")
                campoApartamentoIDV.setAttribute("campo", "apartamentoIDV")
                campoApartamentoIDV.value = apartamentoIDV
                bloqueApartamentoIDV.appendChild(campoApartamentoIDV)
                contenedorEntidadDatos.appendChild(bloqueApartamentoIDV)



                const contenedorH = document.createElement("div")
                contenedorH.classList.add("flexVertical", "gap6")
                contenedorEntidadDatos.appendChild(contenedorH)

                const tituloH = document.createElement("div")
                tituloH.classList.add("padding14")
                tituloH.textContent = "Numero de huespedes"
                contenedorH.appendChild(tituloH)

                const campoHuespedes = document.createElement("input")
                campoHuespedes.classList.add("botonV1BlancoIzquierda_campo")
                campoHuespedes.placeholder = "Escribe el numero de huespedes"
                campoHuespedes.setAttribute("valorInicial", numeroHuespedes)
                campoHuespedes.setAttribute("componente", "entidadIDV")
                campoHuespedes.setAttribute("campo", "numeroHuespedes")
                campoHuespedes.value = numeroHuespedes || ""
                contenedorH.appendChild(campoHuespedes)


                const descripcionCampo = document.createElement("textarea")
                descripcionCampo.classList.add("botonV1BlancoIzquierda_campo", "textAreaRedimenzionHorizontal")
                descripcionCampo.placeholder = "Descripción del alojamiento"
                descripcionCampo.setAttribute("valorInicial", descripcion)
                descripcionCampo.setAttribute("componente", "entidadIDV")
                descripcionCampo.setAttribute("campo", "descripcion")
                descripcionCampo.value = descripcion
                contenedorH.appendChild(descripcionCampo)


                const superBloqueCaracteristicas = document.createElement("div")
                superBloqueCaracteristicas.classList.add("contenedorCaracteristicas")

                const infoSuperficie = document.createElement("div")
                infoSuperficie.classList.add("padding14")
                infoSuperficie.textContent = "Características del apartamento"
                superBloqueCaracteristicas.appendChild(infoSuperficie)

                const contenedorCaracteristicas = document.createElement("div")
                contenedorCaracteristicas.classList.add("flexVertical", "gap6")
                contenedorCaracteristicas.setAttribute("contenedor", "caracteristicas")
                contenedorCaracteristicas.setAttribute("caracteristicasIniciales", JSON.stringify(caracteristicas))
                for (const caracteristica of caracteristicas) {
                    const filaCaracteristicaUI = this.caracteristicasUI(caracteristica)
                    contenedorCaracteristicas.appendChild(filaCaracteristicaUI)
                }
                superBloqueCaracteristicas.appendChild(contenedorCaracteristicas)
                const botonAnadirCaracteristica = document.createElement("div")
                botonAnadirCaracteristica.classList.add("botonV1BlancoIzquierda")
                botonAnadirCaracteristica.textContent = "Añadir caracteristica"
                botonAnadirCaracteristica.addEventListener("click", () => {
                    const selectorContenedorCaracteristicas = document.querySelector("[contenedor=caracteristicas]")
                    const filaCaracteristicaUI = this.caracteristicasUI()
                    selectorContenedorCaracteristicas.appendChild(filaCaracteristicaUI)
                })
                superBloqueCaracteristicas.appendChild(botonAnadirCaracteristica)
                contenedorEntidadDatos.appendChild(superBloqueCaracteristicas)
                contenedorEntidad.appendChild(contenedorEntidadDatos)
                const contenedorBotones = document.createElement("div")
                contenedorBotones.classList.add("confAlojamiento_entidades_crearEntidad_contenedorBotones")
                contenedorBotones.setAttribute("componente", "contenedorBotonEditar")
                const botonCrearEntidad = document.createElement("div")
                botonCrearEntidad.classList.add("botonV1BlancoIzquierda_campo")
                botonCrearEntidad.textContent = "Editar apartamento como entidad"
                botonCrearEntidad.addEventListener("click", () => {
                    this.controladorModoEditar("editar")
                })
                contenedorBotones.appendChild(botonCrearEntidad)
                contenedorEntidad.appendChild(contenedorBotones)
                const botonesOpcionesEdicion = this.botonesEdicion()
                contenedorEntidad.appendChild(botonesOpcionesEdicion)
                espacioConfiguracionDelAlojamiento.appendChild(contenedorEntidad)
            }

        } else if (tipoEntidad === "habitacion") {
            if (!entidadIDV) {

            }
            const transaccion = {
                zona: "administracion/arquitectura/entidades/detallesDeEntidadDeAlojamiento",
                tipoEntidad: "habitacion",
                entidadIDV: entidadIDV
            }

            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            const seccionRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
            if (!seccionRenderizada) { return }
            if (respuestaServidor?.error) {
                const info = {
                    titulo: "No existe ninguna habitación como entidad con ese identificador",
                    descripcion: "No existe la entidad que buscas. Por favor, revisa el identificador que solicitaste porque este no existe. Quizás este identificador fue de una entidad de alojamiento que tuviste en el pasado y que borraste."
                }
                casaVitini.ui.componentes.mensajeSimple(info)
            }
            if (respuestaServidor?.ok) {
                const habitacionIDV = respuestaServidor?.ok.habitacionIDV
                const habitacionUI = respuestaServidor?.ok.habitacionUI
                selectorTitulo.textContent = "Editar habitación como entidad"
                const contenedorEntidad = document.createElement("div")
                contenedorEntidad.classList.add("flexVertical", "gap6")
                contenedorEntidad.setAttribute("tipoEntidad", "habitacion")
                contenedorEntidad.setAttribute("entidadIDV", habitacionIDV)
                const contenedorEntidadDatos = document.createElement("div")
                contenedorEntidadDatos.classList.add("flexVertical", "gap6")
                contenedorEntidadDatos.setAttribute("componente", "contenedorEntidadDatos")
                const bloqueTituloHabitacion = document.createElement("div")
                bloqueTituloHabitacion.classList.add("flexVertical", "gap6")
                const infoTituloHabitacion = document.createElement("div")
                infoTituloHabitacion.classList.add("padding14")
                infoTituloHabitacion.textContent = "Nombre de la habitación"
                bloqueTituloHabitacion.appendChild(infoTituloHabitacion)
                const campoTituloHabitacion = document.createElement("input")
                campoTituloHabitacion.classList.add("botonV1BlancoIzquierda_campo")
                campoTituloHabitacion.placeholder = "Escriba un nombre para la habitación"
                campoTituloHabitacion.setAttribute("valorInicial", habitacionUI)
                campoTituloHabitacion.setAttribute("campo", "habitacionUI")
                campoTituloHabitacion.value = habitacionUI
                bloqueTituloHabitacion.appendChild(campoTituloHabitacion)
                contenedorEntidadDatos.appendChild(bloqueTituloHabitacion)
                const bloqueHabitacionIDV = document.createElement("div")
                bloqueHabitacionIDV.classList.add("flexVertical", "gap6")
                const infoHabitacionIDV = document.createElement("div")
                infoHabitacionIDV.classList.add("padding14")
                infoHabitacionIDV.textContent = "Identificador visual de la nueva habitación"
                bloqueHabitacionIDV.appendChild(infoHabitacionIDV)
                const campoHabitacionIDV = document.createElement("input")
                campoHabitacionIDV.classList.add("botonV1BlancoIzquierda_campo")
                campoHabitacionIDV.placeholder = "Identificador visual de la habitación(HabitacionIDV)"
                campoHabitacionIDV.setAttribute("valorInicial", habitacionIDV)
                campoHabitacionIDV.setAttribute("componente", "entidadIDV")
                campoHabitacionIDV.setAttribute("campo", "habitacionIDV")
                campoHabitacionIDV.value = habitacionIDV
                bloqueHabitacionIDV.appendChild(campoHabitacionIDV)
                contenedorEntidadDatos.appendChild(bloqueHabitacionIDV)
                contenedorEntidad.appendChild(contenedorEntidadDatos)
                const contenedorBotones = document.createElement("div")
                contenedorBotones.classList.add("confAlojamiento_entidades_crearEntidad_contenedorBotones")
                contenedorBotones.setAttribute("componente", "contenedorBotonEditar")
                const botonCrearEntidad = document.createElement("div")
                botonCrearEntidad.classList.add("botonV1BlancoIzquierda")
                botonCrearEntidad.textContent = "Editar habitación como entidad"
                botonCrearEntidad.addEventListener("click", () => {
                    this.controladorModoEditar("editar")
                })
                contenedorBotones.appendChild(botonCrearEntidad)
                contenedorEntidad.appendChild(contenedorBotones)
                const botonesOpcionesEdicion = this.botonesEdicion()
                contenedorEntidad.appendChild(botonesOpcionesEdicion)
                espacioConfiguracionDelAlojamiento.appendChild(contenedorEntidad)
            }

        } else if (tipoEntidad === "cama") {
            if (!entidadIDV) {

            }
            const transaccion = {
                zona: "administracion/arquitectura/entidades/detallesDeEntidadDeAlojamiento",
                tipoEntidad: "cama",
                entidadIDV: entidadIDV
            }
            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            const seccionRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
            if (!seccionRenderizada) { return }
            if (respuestaServidor?.error) {
                const info = {
                    titulo: "No existe ninguna cama como entidad con ese identificador",
                    descripcion: "No existe la entidad que buscas. Por favor, revisa el identificador que solicitaste porque este no existe. Quizás este identificador fue de una entidad de alojamiento que tuviste en el pasado y que borraste."
                }
                casaVitini.ui.componentes.mensajeSimple(info)
            }
            if (respuestaServidor?.ok) {
                const camaIDV = respuestaServidor?.ok.camaIDV
                const tipoIDV = respuestaServidor?.ok.tipoIDV
                const camaUI = respuestaServidor?.ok.camaUI
                const capacidad = respuestaServidor?.ok.capacidad



                const tipoCamaUI = (tipoIDV) => {
                    if (tipoIDV === "compartida") {
                        return "Compartida"
                    } else if (tipoIDV === "fisica") {
                        return "Física"
                    }
                }



                selectorTitulo.textContent = "Editar cama como entidad"
                const contenedorEntidad = document.createElement("div")
                contenedorEntidad.classList.add("flexVertical", "gap6")
                contenedorEntidad.setAttribute("tipoEntidad", "cama")
                contenedorEntidad.setAttribute("entidadIDV", camaIDV)
                const contenedorEntidadDatos = document.createElement("div")
                contenedorEntidadDatos.classList.add("flexVertical", "gap6")
                contenedorEntidadDatos.setAttribute("componente", "contenedorEntidadDatos")
                const bloqueTituloCama = document.createElement("div")
                bloqueTituloCama.classList.add("flexVertical", "gap6")


                const infoDescription = document.createElement("div")
                infoDescription.classList.add("padding14")
                infoDescription.textContent = "Editar una cama como entidad creada, actualizará el nombre de la cama y su identificador visual si se cambian en las reservas activas presentes y futuras para preservas la integridad de los datos."
                bloqueTituloCama.appendChild(infoDescription)

                const infoTituloCama = document.createElement("div")
                infoTituloCama.classList.add("padding14")
                infoTituloCama.textContent = "Nombre de la cama"
                bloqueTituloCama.appendChild(infoTituloCama)

                const campoTituloCama = document.createElement("input")
                campoTituloCama.classList.add("botonV1BlancoIzquierda_campo")
                campoTituloCama.placeholder = "Escriba un nombre para la cama"
                campoTituloCama.setAttribute("valorInicial", camaUI)
                campoTituloCama.setAttribute("campo", "camaUI")
                campoTituloCama.value = camaUI
                bloqueTituloCama.appendChild(campoTituloCama)
                contenedorEntidadDatos.appendChild(bloqueTituloCama)
                const bloqueCamaIDV = document.createElement("div")
                bloqueCamaIDV.classList.add("flexVertical", "gap6")
                const infoCamaIDV = document.createElement("div")
                infoCamaIDV.classList.add("padding14")
                infoCamaIDV.textContent = "Identificador visual de la nueva cama"
                bloqueCamaIDV.appendChild(infoCamaIDV)
                const campoCamaIDV = document.createElement("input")
                campoCamaIDV.classList.add("botonV1BlancoIzquierda_campo")
                campoCamaIDV.placeholder = "Identificador visual de la cama(camaIDV)"
                campoCamaIDV.setAttribute("valorInicial", camaIDV)
                campoCamaIDV.setAttribute("componente", "entidadIDV")
                campoCamaIDV.setAttribute("campo", "camaIDV")
                campoCamaIDV.value = camaIDV
                bloqueCamaIDV.appendChild(campoCamaIDV)
                contenedorEntidadDatos.appendChild(bloqueCamaIDV)
                contenedorEntidad.appendChild(contenedorEntidadDatos)
                const bloqueCapacidadPernoctativa = document.createElement("div")
                bloqueCapacidadPernoctativa.classList.add("flexVertical", "gap6")
                const infoCapacidadPernoctativa = document.createElement("div")
                infoCapacidadPernoctativa.classList.add("padding14")
                infoCapacidadPernoctativa.textContent = "Capacidad pernoctativa de la cama"
                bloqueCapacidadPernoctativa.appendChild(infoCapacidadPernoctativa)
                const campoCapacidadPernoctativa = document.createElement("input")
                campoCapacidadPernoctativa.classList.add("botonV1BlancoIzquierda_campo")
                campoCapacidadPernoctativa.placeholder = "Escriba la capaciad pernoctativa de la cama por ejemplo 2"
                campoCapacidadPernoctativa.setAttribute("valorInicial", capacidad)
                campoCapacidadPernoctativa.setAttribute("campo", "capacidad")
                campoCapacidadPernoctativa.value = capacidad
                bloqueCapacidadPernoctativa.appendChild(campoCapacidadPernoctativa)
                contenedorEntidadDatos.appendChild(bloqueCapacidadPernoctativa)

                const contenedorTipoInfoCama = document.createElement("div")
                contenedorTipoInfoCama.classList.add(
                    "flexVertical",
                    "padding6",
                )
                contenedorEntidadDatos.appendChild(contenedorTipoInfoCama)

                const tituloTipoCama = document.createElement("div")
                tituloTipoCama.classList.add(
                    "negrita",
                    "padding6"
                )
                tituloTipoCama.textContent = "Tipo cama"

                contenedorTipoInfoCama.appendChild(tituloTipoCama)

                const infoSelector = document.createElement("div")
                infoSelector.classList.add(
                    "padding6"
                )
                infoSelector.textContent = tipoCamaUI(tipoIDV)
                infoSelector.setAttribute("tipoIDV", tipoIDV)

                contenedorTipoInfoCama.appendChild(infoSelector)

                contenedorEntidad.appendChild(contenedorEntidadDatos)
                const contenedorBotones = document.createElement("div")
                contenedorBotones.classList.add("confAlojamiento_entidades_crearEntidad_contenedorBotones")
                contenedorBotones.setAttribute("componente", "contenedorBotonEditar")
                const botonCrearEntidad = document.createElement("div")
                botonCrearEntidad.classList.add("botonV1BlancoIzquierda_campo")
                botonCrearEntidad.textContent = "Editar cama como entidad"
                botonCrearEntidad.addEventListener("click", () => {
                    this.controladorModoEditar("editar")
                })
                contenedorBotones.appendChild(botonCrearEntidad)
                contenedorEntidad.appendChild(contenedorBotones)
                const botonesOpcionesEdicion = this.botonesEdicion()
                contenedorEntidad.appendChild(botonesOpcionesEdicion)
                espacioConfiguracionDelAlojamiento.appendChild(contenedorEntidad)
            }

        } else {
            const info = {
                titulo: "No existe ninguna entidad con ese identificador",
                descripcion: "No existe la entidad que buscas. Por favor, revisa el identificador que solicitaste porque este no existe. Quizás este identificador fue de una entidad de alojamiento que tuviste en el pasado y que borraste."
            }
            casaVitini.ui.componentes.mensajeSimple(info)
        }
    },
    botonesEdicion: function () {
        const contenedorBotones = document.createElement("div")
        contenedorBotones.classList.add("confAlojamiento_entidades_crearEntidad_contenedorBotones")
        contenedorBotones.setAttribute("componente", "contenedorOpcionesDeEdicion")
        contenedorBotones.style.display = "none"
        const botonGuardarCambios = document.createElement("div")
        botonGuardarCambios.classList.add("botonV1BlancoIzquierda")
        botonGuardarCambios.textContent = "Guardar cambios"
        botonGuardarCambios.addEventListener("click", () => {
            this.guardarCambios()
        })
        contenedorBotones.appendChild(botonGuardarCambios)

        const botonCancelarCambios = document.createElement("div")
        botonCancelarCambios.classList.add("botonV1BlancoIzquierda")
        botonCancelarCambios.textContent = "Cancelar cambios"
        botonCancelarCambios.addEventListener("click", () => {
            this.controladorModoEditar("cancelar")
        })
        contenedorBotones.appendChild(botonCancelarCambios)

        const botonEliminarEntidad = document.createElement("div")
        botonEliminarEntidad.classList.add("botonV1BlancoIzquierda")
        botonEliminarEntidad.textContent = "Eliminar entidad"
        botonEliminarEntidad.addEventListener("click", () => {
            this.eliminarEntidad.UI()
        })
        contenedorBotones.appendChild(botonEliminarEntidad)

        return contenedorBotones
    },
    controladorModoEditar: function (modo) {
        if (modo !== "editar" && modo !== "cancelar" && modo !== "guardado") {
            const error = "El componente controladorModoEditar no comprende el parámetro"
            casaVitini.ui.componentes.advertenciaInmersiva(error)
        }
        const selectorContenedorBotonEditar = document.querySelector("[componente=contenedorBotonEditar]")
        const selectorContenedorOpcionesEdicion = document.querySelector("[componente=contenedorOpcionesDeEdicion]")
        const selectorContenedorEntidadDatos = document.querySelector("[componente=contenedorEntidadDatos]")
        if (modo === "editar") {
            selectorContenedorBotonEditar.style.display = "none"
            selectorContenedorOpcionesEdicion.style.display = "flex"
            selectorContenedorEntidadDatos.style.pointerEvents = "all"
        }
        if (modo === "guardado") {
            selectorContenedorBotonEditar.style.display = "flex"
            selectorContenedorOpcionesEdicion.style.display = "none"
            selectorContenedorEntidadDatos.style.pointerEvents = "none"
        }
        if (modo === "cancelar") {
            selectorContenedorBotonEditar.style.display = "flex"
            selectorContenedorOpcionesEdicion.style.display = "none"
            selectorContenedorEntidadDatos.removeAttribute("style")
            const selectorCampos = document.querySelectorAll("[campo]")
            selectorCampos.forEach((campo) => {
                const valorInicial = campo.getAttribute("valorInicial")
                campo.value = valorInicial || ""

            })

            const contenedorCaracteristicas = document.querySelector("[contenedor=caracteristicas]")

            if (contenedorCaracteristicas) {

                const caracteristicasObsoletas = contenedorCaracteristicas.querySelectorAll("[contenedor=caracteristica]")
                caracteristicasObsoletas.forEach(c => c?.remove())

                const caracteristicasApartamento = contenedorCaracteristicas.getAttribute("caracteristicasIniciales")
                const caracteristicasParseadas = caracteristicasApartamento ? JSON.parse(caracteristicasApartamento) : []
                contenedorCaracteristicas.innerHTML = null
                for (const caracteristica of caracteristicasParseadas) {
                    const filaCaracteristicaUI = this.caracteristicasUI(caracteristica)
                    contenedorCaracteristicas.appendChild(filaCaracteristicaUI)
                }
            }
        }
    },
    guardarCambios: async function () {

        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = "Actualizando entidad..."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)

        const selectorTipoEntidada = document.querySelector("[tipoEntidad]").getAttribute("tipoEntidad")
        const entidadIDV = document.querySelector("[entidadIDV]").getAttribute("entidadIDV")
        const metadatos = {
            zona: "administracion/arquitectura/entidades/modificarEntidadAlojamiento",
            tipoEntidad: selectorTipoEntidada,
            entidadIDV
        }

        const selectorCampos = document.querySelectorAll("[campo]")
        selectorCampos.forEach((campo) => {
            const nombreCampo = campo.getAttribute("campo")

            if (nombreCampo !== "caracteristica") {
                if (nombreCampo === "descripcion") {
                    const descripcion = campo.value
                    const descripcionB64 = casaVitini.utilidades.conversor.cadenaHaciaBase64ConTextDecoder(descripcion)
                    metadatos["descripcion"] = descripcionB64
                } else {
                    const datoCampo = campo.value
                    metadatos[nombreCampo] = datoCampo

                }
            }
        })
        if (selectorTipoEntidada === "apartamento") {
            metadatos.caracteristicas = []
            const selectorCaracteristicas = document.querySelectorAll("[campo=caracteristica]")
            selectorCaracteristicas.forEach((caracteristica) => {
                const valorActual = caracteristica.value.trim()
                if (valorActual) {
                    metadatos.caracteristicas.push(valorActual)
                }

            })
        }


        const respuestaServidor = await casaVitini.shell.servidor(metadatos)
        const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!instanciaRenderizada) { return }
        instanciaRenderizada.remove()
        if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const selectorComponenteEntidadIDV = document.querySelector("[componente=entidadIDV]").value
            document.querySelector("[entidadIDV]").setAttribute("entidadIDV", selectorComponenteEntidadIDV)
            const selectorCampos = document.querySelectorAll("[campo]")
            selectorCampos.forEach((campo) => {
                const datoCampo = campo.value
                campo.setAttribute("valorInicial", datoCampo)
            })
            const listaCaracteristicas = respuestaServidor.apartamentoComoEntidadActualziado?.caracteristicas

            if (selectorTipoEntidada === "apartamento" && listaCaracteristicas) {
                const contenedorCaracteristicas = document.querySelector("[contenedor=caracteristicas]")
                contenedorCaracteristicas.setAttribute("caracteristicasIniciales", JSON.stringify(listaCaracteristicas))
            }

            const entidadIDV = document.querySelector("[entidadIDV]").getAttribute("entidadIDV")
            const urlVista = "/administracion/arquitectura_del_alojamiento/entidades/editar_entidad/" + selectorTipoEntidada + ":" + entidadIDV;
            const navegacion = {
                vista: urlVista,
            }
            casaVitini.shell.navegacion.controladorVista(navegacion)
            this.controladorModoEditar("guardado")
        }
    },
    eliminarEntidad: {
        UI: async function () {
            const tipoEntidad = document.querySelector("[tipoEntidad]").getAttribute("tipoEntidad")
            let entidadUI
            let textoDescriptivo
            let tituloAdvertencia
            if (tipoEntidad === "apartamento") {
                entidadUI = document.querySelector("[campo=apartamentoUI]").getAttribute("valorInicial")
                tituloAdvertencia = "Confirmar eliminar el apartamento como entidad"
                textoDescriptivo = "Vas a eliminar este apartamento como entidad. Esto implica eliminar el apartamento como entidad, el perfil de precio del apartamento, los comportamientos de precios y los bloqueos asociados a este apartamento. Sus implicaciones son inmediatas. ¿Quieres confirmar la eliminación de este apartamento como entidad? "
            }
            if (tipoEntidad === "habitacion") {
                entidadUI = document.querySelector("[campo=habitacionUI]").getAttribute("valorInicial")
                tituloAdvertencia = "Confirmar eliminar la habitación como entidad"
                textoDescriptivo = "Vas a eliminar esta habitación como entidad. Esto implica eliminar la habitación como entidad y su existencia en las configuraciones de alojamiento. Esto implica que el apartamento que contenía esta habitación dejará de mostrarla por su inexistencia. Sus implicaciones son inmediatas. ¿Quieres confirmar la eliminación de esta habitación como entidad ?"
            }
            if (tipoEntidad === "cama") {
                entidadUI = document.querySelector("[campo=camaUI]").getAttribute("valorInicial")
                tituloAdvertencia = "Confirmar eliminar la cama como entidad"
                textoDescriptivo = "Vas a eliminar esta cama como entidad. Esto implica eliminar la cama como entidad y su existencia en las configuraciones de alojamiento. Esto implica que las habitaciones que contenían esta cama dejarán de mostrarla por su inexistencia. Sus implicaciones son inmediatas. ¿Quieres confirmar la eliminación de esta cama como entidad? "
            }

            const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
            pantallaInmersiva.style.justifyContent = "center"

            const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

            const titulo = constructor.querySelector("[componente=titulo]")
            titulo.textContent = tituloAdvertencia
            const mensaje = constructor.querySelector("[componente=mensajeUI]")
            mensaje.textContent = textoDescriptivo

            const botonAceptar = constructor.querySelector("[boton=aceptar]")
            botonAceptar.textContent = "Comfirmar la eliminacion"
            botonAceptar.addEventListener("click", () => { this.confirmar() })
            const botonCancelar = constructor.querySelector("[boton=cancelar]")
            botonCancelar.textContent = "Cancelar la eliminacion"

            document.querySelector("main").appendChild(pantallaInmersiva)
        },
        confirmar: async function () {


            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const mensaje = "Eliminado..."
            const datosPantallaSuperpuesta = {
                instanciaUID: instanciaUID,
                mensaje: mensaje
            }
            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)

            const tipoEntidad = document.querySelector("[tipoEntidad]").getAttribute("tipoEntidad")
            const entidadIDV = document.querySelector("[entidadIDV]").getAttribute("entidadIDV")
            const transaccion = {
                zona: "administracion/arquitectura/entidades/eliminarEntidadAlojamiento",
                tipoEntidad: tipoEntidad,
                entidadIDV: entidadIDV
            }

            if (tipoEntidad === "cama") {
                const tipoIDV = document.querySelector("[tipoIDV]").getAttribute("tipoIDV")
                transaccion.tipoIDV = tipoIDV

            }
            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
            if (!instanciaRenderizada) { return }
            instanciaRenderizada.remove()

            if (respuestaServidor?.error) {
                let selectorAdvertenciaInmersiva = document.querySelectorAll("[componente=advertenciaInmersiva]")
                selectorAdvertenciaInmersiva.forEach((advertenciaInmersiva) => {
                    advertenciaInmersiva.remove()
                })
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                const vista = `/administracion/arquitectura_del_alojamiento/entidades`
                const navegacion = {
                    vista: vista,

                }
                casaVitini.shell.navegacion.controladorVista(navegacion)
            }
        }
    },
    caracteristicasUI: (data) => {
        const caracteristicaUI = data?.caracteristicaUI || ""
        const caracteristicaFila = document.createElement("div")
        caracteristicaFila.classList.add("administracion_arquitectura_entidades_detallesEntidad_filaCaracteristica")
        caracteristicaFila.setAttribute("contenedor", "caracteristica")
        const campoCaracteristica = document.createElement("input")
        campoCaracteristica.classList.add("botonV1BlancoIzquierda_campo")
        campoCaracteristica.placeholder = "Escriba la superficie del apartamento"
        campoCaracteristica.setAttribute("valorInicial", caracteristicaUI)
        campoCaracteristica.placeholder = "Escriba la característica"
        campoCaracteristica.setAttribute("campo", "caracteristica")
        campoCaracteristica.value = caracteristicaUI || ""
        caracteristicaFila.appendChild(campoCaracteristica)
        const botonBorrar = document.createElement("div")
        botonBorrar.classList.add("botonV1BlancoIzquierda")
        botonBorrar.textContent = "Borrar"
        botonBorrar.addEventListener("click", (e) => {
            e.target.closest("[contenedor=caracteristica]").remove()
        })
        caracteristicaFila.appendChild(botonBorrar)
        return caracteristicaFila
    }
}