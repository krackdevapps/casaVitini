casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        const instanciaUID = main.getAttribute("instanciaUID")
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const comandoInicial = granuladoURL.directorios[granuladoURL.directorios.length - 1]
        const soloDigitos = /^\d+$/;

        if (comandoInicial === "impuestos") {
            this.contenedorBotones()

            const parametrosFormatoURL = granuladoURL.parametros
            const parametrosFormatoIDV = {}
            Object.entries(parametrosFormatoURL).forEach(([nombreParametroURL, valorParametroURL]) => {
                const nombreParametroIDV = casaVitini.utilidades.cadenas.snakeToCamel(nombreParametroURL)
                let nombreColumnaIDV
                if ((valorParametroURL)?.toLowerCase() === "impuesto_uid") {
                    nombreColumnaIDV = "impuestoUID"
                } else if ((valorParametroURL)?.toLowerCase() === "tipo_valor") {
                    nombreColumnaIDV = "tipoValorIDV"
                } else if ((valorParametroURL)?.toLowerCase() === "entidad") {
                    nombreColumnaIDV = "entidadIDV"
                } else if ((valorParametroURL)?.toLowerCase() === "estado") {
                    nombreColumnaIDV = "estadoIDV"
                } else if (valorParametroURL) {
                    nombreColumnaIDV = casaVitini.utilidades.cadenas.snakeToCamel(valorParametroURL)
                }
                parametrosFormatoIDV[nombreParametroIDV] = nombreColumnaIDV
            })

            this.mostrarImpuestosResueltos(parametrosFormatoIDV)
        } else if (soloDigitos.test(comandoInicial)) {
            main.setAttribute("zonaCSS", "administracion/impuestos/detalles")
            const transaccion = {
                zona: "administracion/impuestos/detalleImpuesto",
                impuestoUID: String(comandoInicial)
            }
            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            const seccionRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
            if (!seccionRenderizada) { return }
            if (respuestaServidor.error) {
                const titulo = document.querySelector(".tituloGris")
                titulo.textContent = "No existe ningún impuesto con el identificador: " + comandoInicial
                main.innerHTML = null
                main.appendChild(titulo)
                return
            }
            this.detalleImpuesto(respuestaServidor)
        }
        else {
            casaVitini.ui.componentes.urlDesconocida()

        }

    },
    mostrarImpuestosResueltos: async function (listasImpuestos) {
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const selectorEspacio = document.querySelector("[componente=espacioImpuestos]")
        selectorEspacio.setAttribute("instanciaBusqueda", instanciaUID)

        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/impuestos")
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const transaccion = {
            origen: "url",
            tipoConstruccionGrid: "total",
            ...listasImpuestos
        }
        const paginaTipo = transaccion.paginaTipo
        let nombreColumnaURL
        const nombreColumna = transaccion.nombreColumna
        transaccion.pagina = transaccion.pagina ? Number(transaccion.pagina) : 1
        if ((nombreColumna)?.toLowerCase() === "impuestouid") {
            nombreColumnaURL = "impuesto_uid"
        } else if ((nombreColumna)?.toLowerCase() === "tipovaloridv") {
            nombreColumnaURL = "tipo_valor"
        } else if ((nombreColumna)?.toLowerCase() === "entidadidv") {
            nombreColumnaURL = "entidad"
        } else if ((nombreColumna)?.toLowerCase() === "estadoidv") {
            nombreColumnaURL = "estado"
        } else if (nombreColumna) {
            nombreColumnaURL = casaVitini.utilidades.cadenas.camelToSnake(nombreColumna)
        }

        const origen = transaccion.origen
        delete transaccion.origen
        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "administracion/impuestos/listaImpuestosPaginados",
            pagina: transaccion.pagina,
            nombreColumna: nombreColumna,
            sentidoColumna: transaccion.sentidoColumna
        })

        const instanciaRenderizada = document.querySelector(`[instanciaBusqueda="${instanciaUID}"]`)
        if (!instanciaRenderizada) {
            return
        }

        if (respuestaServidor?.error) {
            return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }

        if (respuestaServidor?.totalImpuestos === 0) {
            const espacioClientes = document.querySelector("[componente=espacioImpuestos]")
            document.querySelector("[gridUID=gridImpuestos]")?.remove()
            document.querySelector("[componente=estadoBusqueda]")?.remove()
            const estadoBusquedaUI = document.createElement("div")
            estadoBusquedaUI.classList.add("buscadorClientesEstadoBusqueda")
            estadoBusquedaUI.setAttribute("componente", "estadoBusqueda")
            estadoBusquedaUI.textContent = "No hay impuestos configurados"
            espacioClientes.appendChild(estadoBusquedaUI)
            return

        }
        const impuestos = respuestaServidor.impuestos

        const dicccionario = {
            estados: {
                activado: "Activado",
                desactivado: "Desactivado"
            },
            tiposValores: {
                porcentaje: "Porcentaje",
                tasa: "Tasa"
            },
            entidades: {
                reserva: "Reserva",
                servicio: "Servicio",
                global: "Global"
            },
        }

        for (const detallesDelImpuesto of impuestos) {
            const tipoValorIDV = detallesDelImpuesto.tipoValorIDV
            const entidadIDV = detallesDelImpuesto.entidadIDV
            const estadoIDV = detallesDelImpuesto.estadoIDV
            detallesDelImpuesto.tipoValorIDV = dicccionario.tiposValores[tipoValorIDV]
            detallesDelImpuesto.estadoIDV = dicccionario.estados[estadoIDV]
            detallesDelImpuesto.entidadIDV = dicccionario.entidades[entidadIDV]
        }
        const sentidoColumna = respuestaServidor.sentidoColumna

        const pagina = respuestaServidor.pagina
        const paginasTotales = respuestaServidor.paginasTotales
        const columnasGrid = [
            {
                columnaUI: "UID",
                columnaIDV: "impuestoUID",
            },
            {
                columnaUI: "Impuesto",
                columnaIDV: "nombre",
            },
            {
                columnaUI: "Tipo Impositivo",
                columnaIDV: "tipoImpositivo",
            },
            {
                columnaUI: "Tipo Valor",
                columnaIDV: "tipoValorIDV",
            },
            {
                columnaUI: "Entidad",
                columnaIDV: "entidadIDV",
            },
            {
                columnaUI: "Estado",
                columnaIDV: "estadoIDV",
            }
        ]
        const parametrosFinales = {}

        if (transaccion.nombreColumna) {
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

        const constructorURLFinal = granuladoURL.directoriosFusion + parametrosURLFInal

        casaVitini.view.__sharedMethods__.grid.despliegue({
            metodoSalida: "view.mostrarImpuestosResueltos",
            configuracionGrid: {
                filas: impuestos,
                sentidoColumna: sentidoColumna,
                nombreColumna: nombreColumna,
                pagina: pagina,
                destino: "[componente=espacioImpuestos]",
                columnasGrid: columnasGrid,
                gridUID: "gridImpuestos",
                mascaraURL: {
                    mascara: "/administracion/impuestos/",
                    parametro: "impuestoUID"
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

        const titulo = "Casa Vitini"
        const estado = {
            zona: constructorURLFinal,
            EstadoInternoZona: "estado",
            tipoCambio: "parcial",
            componenteExistente: "contenedorBotonesImpuestos",
            funcionPersonalizada: "view.mostrarImpuestosResueltos",
            args: transaccion
        }







        if (origen === "url" || origen === "botonMostrarClientes") {
            window.history.replaceState(estado, titulo, constructorURLFinal);
        } else if ((origen === "botonNumeroPagina" && paginaTipo === "otra") || origen === "tituloColumna") {
            window.history.pushState(estado, titulo, constructorURLFinal);
        } else if (origen === "botonNumeroPagina" && paginaTipo === "actual") {
            window.history.replaceState(estado, titulo, constructorURLFinal);
        }
    },
    detalleImpuesto: async function (respuestaServidor) {
        if (respuestaServidor?.error) {
            const info = {
                titulo: "Impuesto inexistente",
                descripcion: "El impuesto al que hace referencia la URL no existe.Revisa el identificador.Quizás fue un impuesto que tuviste hace un tiempo y que borraste."
            }
            casaVitini.ui.componentes.mensajeSimple(info)
        }
        if (respuestaServidor?.ok) {
            const detallesImpuesto = respuestaServidor?.ok
            const impuestoUID = detallesImpuesto.impuestoUID
            const nombre = detallesImpuesto.nombre
            const tipoValorIDV = detallesImpuesto.tipoValorIDV
            const tipoImpositivo = detallesImpuesto.tipoImpositivo
            const entidadIDV = detallesImpuesto.entidadIDV
            const estadoIDV = detallesImpuesto.estadoIDV


            const dicccionario = {
                estados: {
                    activado: "Activado",
                    desactivado: "Desactivado"
                },
                tiposValores: {
                    porcentaje: "Porcentaje",
                    tasa: "Tasa"
                },
                entidades: {
                    reserva: "Reserva",
                    servicio: "Servicio",
                    global: "Global"
                },
            }


            let selectorEspacioPreciosEImpuestos = document.querySelector("[componente=impuestos]")
            let bloqueDetallesImpuesto = document.createElement("div")
            bloqueDetallesImpuesto.classList.add("detalleImpuestoBloque")
            bloqueDetallesImpuesto.setAttribute("impuestoUID", impuestoUID)
            bloqueDetallesImpuesto.setAttribute("componente", "bloqueDetalles")
            let nombreImpuestoUI = document.createElement("p")
            nombreImpuestoUI.classList.add("detalleImpuestoNombre")
            nombreImpuestoUI.setAttribute("detalleImpuesto", "nombre")
            nombreImpuestoUI.textContent = nombre
            bloqueDetallesImpuesto.appendChild(nombreImpuestoUI)
            let bloqueDato = document.createElement("div")
            bloqueDato.classList.add("detalleImpuestoBloqueDato")
            bloqueDato.setAttribute("bloqueDato", "tipoImpositivo")
            let tituloDato = document.createElement("p")
            tituloDato.classList.add("detalleImpuestoTituloDato")
            tituloDato.textContent = "Tipo impositivo"
            bloqueDato.appendChild(tituloDato)
            let datoLectura = document.createElement("p")
            datoLectura.classList.add("detalleImpuestoDatoLectura")
            datoLectura.setAttribute("detalleImpuesto", "tipoImpositivo")
            datoLectura.textContent = tipoImpositivo
            bloqueDato.appendChild(datoLectura)
            bloqueDetallesImpuesto.appendChild(bloqueDato)
            bloqueDato = document.createElement("div")
            bloqueDato.classList.add("detalleImpuestoBloqueDato")
            bloqueDato.setAttribute("bloqueDato", "tipoValorIDV")
            tituloDato = document.createElement("p")
            tituloDato.classList.add("detalleImpuestoTituloDato")
            tituloDato.textContent = "Tipo valor"
            bloqueDato.appendChild(tituloDato)
            datoLectura = document.createElement("p")
            datoLectura.classList.add("detalleImpuestoDatoLectura")
            datoLectura.setAttribute("detalleImpuesto", "tipoValorIDV")
            datoLectura.setAttribute("tipoValorIDV", tipoValorIDV)
            datoLectura.textContent = dicccionario.tiposValores[tipoValorIDV]
            bloqueDato.appendChild(datoLectura)
            bloqueDetallesImpuesto.appendChild(bloqueDato)
            bloqueDato = document.createElement("div")
            bloqueDato.classList.add("detalleImpuestoBloqueDato")
            bloqueDato.setAttribute("bloqueDato", "entidadIDV")
            tituloDato = document.createElement("p")
            tituloDato.classList.add("detalleImpuestoTituloDato")
            tituloDato.textContent = "Entidad"
            bloqueDato.appendChild(tituloDato)
            datoLectura = document.createElement("p")
            datoLectura.classList.add("detalleImpuestoDatoLectura")
            datoLectura.setAttribute("detalleImpuesto", "entidadIDV")
            datoLectura.setAttribute("entidadIDV", entidadIDV)
            datoLectura.textContent = dicccionario.entidades[entidadIDV]
            bloqueDato.appendChild(datoLectura)
            bloqueDetallesImpuesto.appendChild(bloqueDato)
            bloqueDato = document.createElement("div")
            bloqueDato.classList.add("detalleImpuestoBloqueDato")
            bloqueDato.setAttribute("bloqueDato", "estadoIDV")
            tituloDato = document.createElement("p")
            tituloDato.classList.add("detalleImpuestoTituloDato")
            tituloDato.textContent = "Estado del impuesto"
            bloqueDato.appendChild(tituloDato)
            datoLectura = document.createElement("p")
            datoLectura.classList.add("detalleImpuestoDatoLectura")
            datoLectura.setAttribute("detalleImpuesto", "estadoIDV")
            datoLectura.setAttribute("estadoIDV", estadoIDV)
            datoLectura.textContent = dicccionario.estados[estadoIDV]
            bloqueDato.appendChild(datoLectura)
            bloqueDetallesImpuesto.appendChild(bloqueDato)
            bloqueDato = document.createElement("div")
            bloqueDato.classList.add("detalleImpuestoBloqueDato")
            bloqueDato.setAttribute("bloqueDato", "moneda")











            selectorEspacioPreciosEImpuestos.appendChild(bloqueDetallesImpuesto)
            let bloqueBotones = document.createElement("div")
            bloqueBotones.classList.add("detalleImpuestoBloqueBotones")
            let boton = document.createElement("p")
            boton.classList.add("detalleImpuestoBoton")
            boton.setAttribute("boton", "editarImpuesto")
            boton.textContent = "Editar impuesto"
            boton.addEventListener("click", () => { this.editarImpuesto() })
            bloqueBotones.appendChild(boton)
            boton = document.createElement("p")
            boton.classList.add("detalleImpuestoBoton")
            boton.classList.add("elementoOcultoInicialmente")
            boton.setAttribute("boton", "guardarCambios")
            boton.addEventListener("click", () => { this.guardarModificacionesImpuesto() })
            boton.textContent = "Guardar cambios"
            bloqueBotones.appendChild(boton)
            boton = document.createElement("p")
            boton.classList.add("detalleImpuestoBoton")
            boton.classList.add("elementoOcultoInicialmente")
            boton.setAttribute("boton", "cancelarCambios")
            boton.addEventListener("click", () => { this.cancelarCambiosImpuesto() })
            boton.textContent = "Cancelar cambios"
            bloqueBotones.appendChild(boton)
            boton = document.createElement("p")
            boton.classList.add("detalleImpuestoBoton")
            boton.classList.add("elementoOcultoInicialmente")
            boton.setAttribute("boton", "eliminarImpuesto")
            boton.addEventListener("click", () => { this.eliminarPerfilImpuestos.UI() })
            boton.textContent = "Eliminar impuesto"
            bloqueBotones.appendChild(boton)
            selectorEspacioPreciosEImpuestos.appendChild(bloqueBotones)
        }
    },
    editarImpuesto: async function () {
        document.querySelector("[boton=editarImpuesto]").classList.add("elementoOcultoInicialmente")
        document.querySelector("[boton=guardarCambios]").classList.remove("elementoOcultoInicialmente")
        document.querySelector("[boton=cancelarCambios]").classList.remove("elementoOcultoInicialmente")
        document.querySelector("[boton=eliminarImpuesto]").classList.remove("elementoOcultoInicialmente")
        const opcionesTipoValor = [
            {
                tipoValorIDV: "tasa",
                tipoValorUI: "Tasa"
            }, {
                tipoValorIDV: "porcentaje",
                tipoValorUI: "Porcentaje"
            }
        ]
        const opcionesEntidad = [
            {
                entidadIDV: "reserva",
                entidadUI: "Reserva"
            },
            {
                entidadIDV: "servicio",
                entidadUI: "Servicio"
            },
            {
                entidadIDV: "global",
                entidadUI: "Global"
            }
        ]
        const listaEstados = [
            {
                estadoIDV: "activado",
                estadoUI: "Activado"
            }, {
                estadoIDV: "desactivado",
                estadoUI: "Desactivado"
            }
        ]
        const selectorDatoLectura = document.querySelectorAll("[detalleImpuesto]")
        selectorDatoLectura.forEach((detalleImpuesto) => {
            detalleImpuesto.style.display = "none"
            const nombreDetalles = detalleImpuesto.getAttribute("detalleImpuesto")
            const datoDetalle = detalleImpuesto.textContent
            const campoEditable = document.createElement("input")
            campoEditable.classList.add("detalleImpuestoCampoEditable")
            campoEditable.setAttribute("componente", "campoEditable")
            campoEditable.setAttribute("campoEditable", nombreDetalles)
            campoEditable.setAttribute("datoActual", datoDetalle)
            campoEditable.value = datoDetalle
            if (nombreDetalles === "nombre") {
                const selectorBloqueDetalles = document.querySelector("[componente=bloqueDetalles")
                const selectorPrimerBloqueDAtos = document.querySelector("[bloqueDato=tipoImpositivo]")
                campoEditable.placeholder = "Escribe un nombre para el impuesto"
                campoEditable.classList.add("nombreImpuestoCampo")
                selectorBloqueDetalles.insertBefore(campoEditable, selectorPrimerBloqueDAtos);
            }
            if (nombreDetalles === "tipoValorIDV") {
                const tipoValorIDV_actual = detalleImpuesto.getAttribute("tipoValorIDV")
                const contenedorOpciones = document.createElement("select")
                contenedorOpciones.classList.add("detalleImpuestoSelectorLista")
                contenedorOpciones.setAttribute("componente", "campoEditable")
                contenedorOpciones.setAttribute("campoEditable", nombreDetalles)
                contenedorOpciones.setAttribute("datoActual", tipoValorIDV_actual)
                opcionesTipoValor.forEach((opcionTipoValor) => {
                    const tipoValorIDV = opcionTipoValor.tipoValorIDV
                    const tipoValorUI = opcionTipoValor.tipoValorUI
                    const opcion = document.createElement("option");
                    opcion.value = tipoValorIDV;
                    opcion.text = tipoValorUI;
                    opcion.setAttribute("opcion", tipoValorIDV)
                    contenedorOpciones.add(opcion);
                })
                contenedorOpciones.value = tipoValorIDV_actual;
                const selectorBloqueDato = document.querySelector(`[bloqueDato="${nombreDetalles}"]`)
                selectorBloqueDato.appendChild(contenedorOpciones)
                if (nombreDetalles === "tipoImpositivo") {
                    const selectorBloqueDato = document.querySelector(`[bloqueDato="${nombreDetalles}"]`)
                    selectorBloqueDato.appendChild(campoEditable)
                }
            }
            if (nombreDetalles === "entidadIDV") {
                const aplicacionSobreIDV_actual = detalleImpuesto.getAttribute("entidadIDV")
                const contenedorOpciones = document.createElement("select")
                contenedorOpciones.classList.add("detalleImpuestoSelectorLista")
                contenedorOpciones.setAttribute("componente", "campoEditable")
                contenedorOpciones.setAttribute("campoEditable", nombreDetalles)
                contenedorOpciones.setAttribute("datoActual", aplicacionSobreIDV_actual)
                opcionesEntidad.forEach((e) => {
                    const entidadIDV = e.entidadIDV
                    const entidadUI = e.entidadUI
                    const opcion = document.createElement("option");
                    opcion.value = entidadIDV;
                    opcion.text = entidadUI;
                    opcion.setAttribute("opcion", entidadIDV)
                    contenedorOpciones.add(opcion);
                })
                contenedorOpciones.value = aplicacionSobreIDV_actual;
                const selectorBloqueDato = document.querySelector(`[bloqueDato="${nombreDetalles}"]`)
                selectorBloqueDato.appendChild(contenedorOpciones)
                if (nombreDetalles === "tipoImpositivo") {
                    const selectorBloqueDato = document.querySelector(`[bloqueDato="${nombreDetalles}"]`)
                    selectorBloqueDato.appendChild(campoEditable)
                }
            }
            if (nombreDetalles === "estadoIDV") {
                const estadoIDV_Actual = detalleImpuesto.getAttribute("estadoIDV")
                const contenedorOpciones = document.createElement("select")
                contenedorOpciones.classList.add("detalleImpuestoSelectorLista")
                contenedorOpciones.setAttribute("componente", "campoEditable")
                contenedorOpciones.setAttribute("campoEditable", nombreDetalles)
                contenedorOpciones.setAttribute("datoActual", estadoIDV_Actual)
                listaEstados.forEach((estado) => {
                    const estadoIDV = estado.estadoIDV
                    const estadoUI = estado.estadoUI
                    const opcion = document.createElement("option");
                    opcion.value = estadoIDV;
                    opcion.text = `${estadoUI}`;
                    opcion.setAttribute("opcion", estadoIDV)
                    contenedorOpciones.add(opcion);
                })
                contenedorOpciones.value = estadoIDV_Actual;
                const selectorBloqueDato = document.querySelector(`[bloqueDato="${nombreDetalles}"]`)
                selectorBloqueDato.appendChild(contenedorOpciones)
                if (nombreDetalles === "tipoImpositivo") {
                    const selectorBloqueDato = document.querySelector(`[bloqueDato="${nombreDetalles}"]`)
                    selectorBloqueDato.appendChild(campoEditable)
                }
            }
            if (nombreDetalles === "tipoImpositivo") {
                const selectorBloqueDato = document.querySelector(`[bloqueDato="${nombreDetalles}"]`)
                campoEditable.placeholder = "Escribe un tipo impositivo(00.00)"

                selectorBloqueDato.appendChild(campoEditable)
            }
        })
    },
    cancelarCambiosImpuesto: function () {
        document.querySelector("[boton=editarImpuesto]").classList.remove("elementoOcultoInicialmente")
        document.querySelector("[boton=guardarCambios]").classList.add("elementoOcultoInicialmente")
        document.querySelector("[boton=cancelarCambios]").classList.add("elementoOcultoInicialmente")
        document.querySelector("[boton=eliminarImpuesto]").classList.add("elementoOcultoInicialmente")
        const selectorCamposEditables = document.querySelectorAll("[componente=campoEditable]")
        selectorCamposEditables.forEach((campoEditable) => {
            campoEditable.remove()
        })
        const selectorDatoLectura = document.querySelectorAll("[detalleImpuesto]")
        selectorDatoLectura.forEach((detalleImpuesto) => {
            detalleImpuesto.removeAttribute("style")
        })
    },
    guardarModificacionesImpuesto: async function () {
        const impuestoUID = document.querySelector("[impuestoUID]").getAttribute("impuestoUID")
        const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
        const mensaje = "Guardando impuesto..."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID,
            mensaje: mensaje
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
        const transaccion = {
            zona: "administracion/impuestos/guardarModificacionImpuesto",
            impuestoUID: String(impuestoUID)
        }
        const selectorCamposEditables = document.querySelectorAll("[componente=campoEditable]")
        selectorCamposEditables.forEach(campoEditable => {
            const nombreCampoEditable = campoEditable.getAttribute("campoEditable")
            const datoCampoEditable = campoEditable.value
            transaccion[nombreCampoEditable] = datoCampoEditable
        })

        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
        if (!instanciaRenderizada) { return }
        instanciaRenderizada.remove()
        if (respuestaServidor?.error) {
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            const detalleImpuestoActualizado = respuestaServidor?.detallesImpuesto
            const nombre = detalleImpuestoActualizado.nombre
            const impuestoUID = detalleImpuestoActualizado.impuestoUID
            const tipoImpositivo = detalleImpuestoActualizado.tipoImpositivo
            const tipoValorIDV = detalleImpuestoActualizado.tipoValorIDV
            const estadoIDV = detalleImpuestoActualizado.estadoIDV
            const entidadIDV = detalleImpuestoActualizado.entidadIDV

            const dicccionario = {
                estados: {
                    activado: "Activado",
                    desactivado: "Desactivado"
                },
                tiposValores: {
                    porcentaje: "Porcentaje",
                    tasa: "Tasa"
                },
                entidades: {
                    reserva: "Reserva",
                    servicio: "Servicios",
                    global: "Global"
                },
            }

            const selectorCamposEditables = document.querySelectorAll("[componente=campoEditable]")
            selectorCamposEditables.forEach(campoEditable => campoEditable.remove())
            const selectorNombreImpuesto = document.querySelector("[detalleImpuesto=nombre]")

            selectorNombreImpuesto.textContent = nombre
            const selectotipoImpositivo = document.querySelector("[detalleImpuesto=tipoImpositivo]")
            selectotipoImpositivo.textContent = tipoImpositivo

            const selectorTipoValor = document.querySelector("[detalleImpuesto=tipoValorIDV]")
            selectorTipoValor.setAttribute("tipoValor", tipoValorIDV)
            selectorTipoValor.textContent = dicccionario.tiposValores[tipoValorIDV]

            const selectorEntidad = document.querySelector("[detalleImpuesto=entidadIDV]")
            selectorEntidad.setAttribute("entidadIDV", entidadIDV)
            selectorEntidad.textContent = dicccionario.entidades[entidadIDV]

            const selectorMoneda = document.querySelector("[detalleImpuesto=estadoIDV]")
            selectorMoneda.setAttribute("estadoIDV", estadoIDV)
            selectorMoneda.textContent = dicccionario.estados[estadoIDV]

            const selectorDatoLectura = document.querySelectorAll("[detalleImpuesto]")
            selectorDatoLectura.forEach((detalleImpuesto) => {
                detalleImpuesto.removeAttribute("style")
            })
            document.querySelector("[boton=editarImpuesto]").classList.remove("elementoOcultoInicialmente")
            document.querySelector("[boton=guardarCambios]").classList.add("elementoOcultoInicialmente")
            document.querySelector("[boton=cancelarCambios]").classList.add("elementoOcultoInicialmente")
            document.querySelector("[boton=eliminarImpuesto]").classList.add("elementoOcultoInicialmente")
        }
    },
    eliminarPerfilImpuestos: {
        UI: function () {
            const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
            const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

            const titulo = constructor.querySelector("[componente=titulo]")
            titulo.textContent = "Confirmar la eliminación del perfil del impuesto"
            const mensaje = constructor.querySelector("[componente=mensajeUI]")
            mensaje.textContent = "Vas a eliminar un impuesto y su aplicación será inmediata en los precios de las reservas."

            const botonAceptar = constructor.querySelector("[boton=aceptar]")
            botonAceptar.textContent = "Comfirmar la eliminacion del impuesto"
            botonAceptar.addEventListener("click", () => { this.confirmarEliminacion() })
            const botonCancelar = constructor.querySelector("[boton=cancelar]")
            botonCancelar.textContent = "Cancelar la eliminacion"

            document.querySelector("main").appendChild(pantallaInmersiva)
        },
        confirmarEliminacion: async function () {
            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const mensaje = "Eliminado impuesto..."
            const datosPantallaSuperpuesta = {
                instanciaUID: instanciaUID,
                mensaje: mensaje
            }
            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
            const impuestoUID = document.querySelector("[impuestoUID]").getAttribute("impuestoUID")
            const transaccion = {
                zona: "administracion/impuestos/eliminarPerfilImpuesto",
                impuestoUID: String(impuestoUID)
            }
            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
            if (!instanciaRenderizada) { return }
            instanciaRenderizada.remove()
            if (respuestaServidor?.error) {
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                const selectorAdvertenciaInmersiva = document.querySelectorAll("[componente=advertenciaInmersiva]")
                selectorAdvertenciaInmersiva.forEach((advertenciaInmersiva) => {
                    advertenciaInmersiva.remove()
                })
                const entrada = {
                    vista: "/administracion/impuestos",
                    tipoOrigen: "menuNavegador"
                }
                casaVitini.shell.navegacion.controladorVista(entrada)
            }
        }
    },
    contenedorBotones: () => {
        const espacioImpuestos = document.querySelector("[componente=impuestos]")
        const contenedorBotones = document.createElement("div")
        contenedorBotones.classList.add("administracion_impuestos_contenedorBotones")
        contenedorBotones.setAttribute("componente", "contenedorBotonesImpuestos")
        const botonCrearImpuesto = document.createElement("a")
        botonCrearImpuesto.classList.add("administracion_impuestos_botonV1")
        botonCrearImpuesto.textContent = "Crear impuesto"
        botonCrearImpuesto.setAttribute("href", "/administracion/impuestos/crear_nuevo_impuesto")
        botonCrearImpuesto.setAttribute("vista", "/administracion/impuestos/crear_nuevo_impuesto")
        botonCrearImpuesto.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
        contenedorBotones.appendChild(botonCrearImpuesto)
        espacioImpuestos.appendChild(contenedorBotones)
    },
}