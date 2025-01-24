casaVitini.view = {
    start: async function () {
        const main = document.querySelector("main")
        main.setAttribute("zonaCSS", "administracion/configuracion/mensajesEnPortada")
        const instanciaUID = main.getAttribute("instanciaUID")
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const comandoInicial = granuladoURL.directorios[granuladoURL.directorios.length - 1]
        const soloDigitos = /^\d+$/;

        if (comandoInicial === "mensajes_en_portada") {
            this.portadaUI()
        } else if (soloDigitos.test(comandoInicial)) {
            const transaccion = {
                zona: "administracion/configuracion/mensajesEnPortada/detallesDelMensaje",
                mensajeUID: comandoInicial
            }
            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            const seccionRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)

            if (!seccionRenderizada) { return }
            if (respuestaServidor.error) {
                const titulo = document.querySelector(".tituloGris")
                titulo.textContent = "No existe ningún mensaje de portada con el identificador: " + comandoInicial
                return
            }
            main.setAttribute("zonaCSS", "administracion/configuracion/mensajesEnPortada/detallesDelMensaje")
            this.detallesDelMensaje.mensajeUI(respuestaServidor.ok)
        } else {
            const info = {
                titulo: "Impuesto inexistente",
                descripcion: "El impuesto al que hace referencia la URL no existe.Revisa el identificador.Quizás fue un impuesto que tuviste hace un tiempo y que borraste"
            }
            casaVitini.ui.componentes.mensajeSimple(info)
        }

    },
    portadaUI: async function () {
        const marcoElastico = document.querySelector("[componente=marcoElastico]")
        marcoElastico.innerHTML = null
        const titulo = document.querySelector(".tituloGris")
        titulo.textContent = "Mensajes en portada"

        const transaccion = {
            zona: "administracion/configuracion/mensajesEnPortada/obtenerMensajes"
        }

        const respuestaServidor = await casaVitini.shell.servidor(transaccion)


        if (respuestaServidor?.error) {
            casaVitini.shell.controladoresUI.ocultarMenusVolatiles()
            titulo.textContent = respuestaServidor?.error
        }
        if (respuestaServidor?.ok) {
            const mensajesEnPortada = respuestaServidor.ok

            const contenedorConfiguracionGlobal = document.createElement("div")
            contenedorConfiguracionGlobal.classList.add("administracion_configuracion_contenedorConfiguracion")
            const informacion = document.createElement("div")
            informacion.classList.add("administracion_configuracion_informacion")
            informacion.textContent = "Los mensajes en portada son textos que aparecen en portada."
            contenedorConfiguracionGlobal.appendChild(informacion)

            const contenedor = document.createElement("div")
            contenedor.classList.add("contenedor")

            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add("contenedorBotones")

            const botonNuevoMensaje = document.createElement("a")
            botonNuevoMensaje.classList.add("botonV1")
            botonNuevoMensaje.textContent = "Nuevo mensaje en portada"
            botonNuevoMensaje.setAttribute("href", "/administracion/configuracion/mensajes_en_portada/nuevo")
            botonNuevoMensaje.setAttribute("vista", "/administracion/configuracion/mensajes_en_portada/nuevo")
            botonNuevoMensaje.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            contenedorBotones.appendChild(botonNuevoMensaje)

            contenedorBotones.appendChild(botonNuevoMensaje)

            contenedor.appendChild(contenedorBotones)

            const contenedorListaMensajes = document.createElement("div")
            contenedorListaMensajes.classList.add("contenedorListaMensajes")

            mensajesEnPortada.sort((a, b) => a.posicion - b.posicion);
            const numeroTotalMensajes = mensajesEnPortada.length


            let posicionContenedor = 0
            for (const detallesDelMensaje of mensajesEnPortada) {

                const mensajeUID = detallesDelMensaje.mensajeUID
                const mensaje = detallesDelMensaje.mensaje
                const estadoIDV = detallesDelMensaje.estadoIDV
                const posicion = detallesDelMensaje.posicion

                const configuracionMensaje = {
                    mensajeUID: mensajeUID,
                    mensaje: mensaje,
                    estadoIDV: estadoIDV,
                    posicion: posicion,
                    numeroTotalMensajes: numeroTotalMensajes
                }
                const mensajeUI = this.mensajeUI(configuracionMensaje)
                posicionContenedor = posicionContenedor + 1

                const contenedorDePosicion = document.createElement("div")
                contenedorDePosicion.classList.add("contenedorDePosicion")
                contenedorDePosicion.setAttribute("posicion", posicionContenedor)

                contenedorDePosicion.appendChild(mensajeUI)
                contenedorListaMensajes.appendChild(contenedorDePosicion)

            }
            contenedor.appendChild(contenedorListaMensajes)
            marcoElastico.appendChild(contenedor)
        }
    },
    mensajeUI: function (detallesDelMensaje) {
        const estados = {
            activado: "Activado",
            desactivado: "Desactivado"
        }

        const mensajeUID = detallesDelMensaje.mensajeUID
        const mensaje = detallesDelMensaje.mensaje
        const estadoIDV = detallesDelMensaje.estadoIDV
        const posicion = Number(detallesDelMensaje.posicion)
        const numeroTotalMensajes = detallesDelMensaje.numeroTotalMensajes


        const contenedorMensaje = document.createElement("div")
        contenedorMensaje.classList.add("contenedorMensaje")
        contenedorMensaje.setAttribute("mensajeUID", mensajeUID)

        const textoDelMensaje = document.createElement("div")
        textoDelMensaje.classList.add("textoDelMensaje")
        textoDelMensaje.textContent = mensaje
        contenedorMensaje.appendChild(textoDelMensaje)

        const contenedorBotonesMensaje = document.createElement("div")
        contenedorBotonesMensaje.classList.add("contenedorBotonesMensaje")

        const selectorEstado = document.createElement("select")
        selectorEstado.setAttribute("componente", "selectorEstado")
        selectorEstado.setAttribute("valorInicial", estadoIDV)
        selectorEstado.classList.add("selector")
        selectorEstado.addEventListener("change", (e) => {
            const metadatos = {
                estadoSeleccionado: e.target.value,
                mensajeUID: mensajeUID
            }
            this.actualizarEstado(metadatos)
        })

        const opcion = document.createElement("option");
        opcion.text = "Seleccionar el estado del mensaje"
        opcion.disabled = "true"
        selectorEstado.add(opcion);

        for (const [estadoIDV_, estadoUI] of Object.entries(estados)) {
            const opcion = document.createElement("option");
            opcion.value = estadoIDV_;
            opcion.text = estadoUI
            if (estadoIDV_ === estadoIDV) {
                opcion.selected = "true"
            }
            selectorEstado.add(opcion);
        }

        contenedorBotonesMensaje.appendChild(selectorEstado)

        const selectorPosicion = document.createElement("select")
        selectorPosicion.classList.add("selector")
        selectorPosicion.setAttribute("componente", "selectorPosicion")
        selectorPosicion.addEventListener("change", (e) => {
            const metadatos = {
                nuevaPosicion: e.target.value,
                mensajeUIDActual: mensajeUID
            }
            this.moverPosicion(metadatos)
        })

        for (let index = 0; index < numeroTotalMensajes; index++) {
            const posicionLoop = index + 1
            const opcion = document.createElement("option");
            opcion.value = posicionLoop;
            if (posicion === posicionLoop) {
                opcion.text = "Posicion " + posicionLoop;
                opcion.disabled = "true"
                opcion.selected = "true"
            } else {
                opcion.text = "Mover a la posicion " + posicionLoop;
            }
            selectorPosicion.add(opcion);
        }
        contenedorBotonesMensaje.appendChild(selectorPosicion)

        const botonModificar = document.createElement("div")
        botonModificar.classList.add("boton")
        botonModificar.textContent = "Modificar mensaje"
        botonModificar.setAttribute("href", "/administracion/configuracion/mensajes_en_portada/" + mensajeUID)
        botonModificar.setAttribute("vista", "/administracion/configuracion/mensajes_en_portada/" + mensajeUID)
        botonModificar.addEventListener("click", casaVitini.administracion.gestionDeOfertas.traductorCambioVista)
        contenedorBotonesMensaje.appendChild(botonModificar)

        const botonEliminar = document.createElement("div")
        botonEliminar.classList.add("boton")
        botonEliminar.textContent = "Eliminar mensaje"
        botonEliminar.addEventListener("click", () => {
            this.eliminarMensaje.UI({ mensajeUID })
        })
        contenedorBotonesMensaje.appendChild(botonModificar)

        contenedorBotonesMensaje.appendChild(botonEliminar)

        contenedorMensaje.appendChild(contenedorBotonesMensaje)
        return contenedorMensaje


    },
    cancelarCambios: function () {
        const campos = document.querySelectorAll("[campo]")
        campos.forEach((campo) => {
            campo.value = campo.getAttribute("valorInicial")
        })
        const contenedorBotones = document.querySelector("[contenedor=botones]")
        contenedorBotones.removeAttribute("style")
    },
    controlCampo: function () {
        const campos = document.querySelectorAll("[campo]")
        let estadoFinal = null
        campos.forEach((campo) => {
            if (campo.value !== campo.getAttribute("valorInicial")) {
                estadoFinal = "visible"
            }
        })
        const contenedorBotones = document.querySelector("[contenedor=botones]")
        if (estadoFinal === "visible") {
            contenedorBotones.style.display = "flex"
        } else {
            contenedorBotones.removeAttribute("style")
        }
    },
    detallesDelMensaje: {
        mensajeUI: function (detallesDelMensaje) {


            const titulo = document.querySelector("main .tituloGris")
            titulo.textContent = "Detalles del mensaje"

            const mensajeUID = detallesDelMensaje.mensajeUID
            const mensaje = detallesDelMensaje.mensaje

            const estado = detallesDelMensaje.estado
            const posicion = detallesDelMensaje.posicion

            const marcoElastico = document.querySelector("[componente=marcoElastico]")

            const contenedorMensaje = document.createElement("div")
            contenedorMensaje.classList.add("contenedorDelMensaje")
            contenedorMensaje.setAttribute("mensajeUID", mensajeUID)

            const textoDelMensaje = document.createElement("textarea")
            textoDelMensaje.classList.add("textoDelMensaje")
            textoDelMensaje.setAttribute("componente", "textoDelMensaje")
            textoDelMensaje.value = mensaje
            textoDelMensaje.placeholder = "Escribe el mensaje en portada aquí"
            contenedorMensaje.appendChild(textoDelMensaje)

            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add("contenedorBotones")
            const botonGuardar = document.createElement("div")
            botonGuardar.classList.add("boton")
            botonGuardar.addEventListener("click", () => {
                casaVitini.view.detallesDelMensaje.guardarMensaje()
            })
            botonGuardar.textContent = "Guardar mensaje"

            contenedorBotones.appendChild(botonGuardar)
            contenedorMensaje.appendChild(contenedorBotones)
            marcoElastico.appendChild(contenedorMensaje)



        },
        guardarMensaje: async function () {
            const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
            const mensajeUID = document.querySelector("[mensajeUID]").getAttribute("mensajeUID")
            const mensaje = document.querySelector("[componente=textoDelMensaje]").value
            const mensajeCarga = "Guardando mensaje..."
            const datosPantallaSuperpuesta = {
                instanciaUID: instanciaUID,
                mensaje: mensajeCarga
            }
            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
            const transacccion = {
                zona: "administracion/configuracion/mensajesEnPortada/actualizarMensaje",
                mensaje: mensaje,
                mensajeUID: mensajeUID
            }
            const respuestaServidor = await casaVitini.shell.servidor(transacccion)
            const seccionRenderizada = document.querySelector(`main [instanciaUID="${instanciaUID}"]`)
            if (!seccionRenderizada)
                seccionRenderizada.remove()
            if (respuestaServidor?.error) {
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                const vistaFinal = `/administracion/configuracion/mensajes_en_portada`
                const navegacion = {
                    vista: vistaFinal,
                    tipoOrigen: "menuNavegador"
                }
                casaVitini.shell.navegacion.controladorVista(navegacion)
            }
        }
    },
    eliminarMensaje: {
        UI: function (data) {
            const mensajeUID = data.mensajeUID

            const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
            const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

            const titulo = constructor.querySelector("[componente=titulo]")
            titulo.textContent = "Confirmas la eliminación del mensaje de la portada"
            const mensaje = constructor.querySelector("[componente=mensajeUI]")
            mensaje.textContent = "Vas a eliminar este mensaje, no solo se borrará de la portada inmediatamente, sino que también se eliminará de Casa Vitini de manera irreversible.Si solo deseas que no aparezca, puedes desactivarlo.Sí, por el contrario, quieres eliminarlo, entonces está en el lugar correcto."

            const botonAceptar = constructor.querySelector("[boton=aceptar]")
            botonAceptar.textContent = "Comfirmar la eliminacion del mensaje"
            botonAceptar.addEventListener("click", () => {
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                this.eliminarMensaje.confirmar(mensajeUID)
            })
            const botonCancelar = constructor.querySelector("[boton=cancelar]")
            botonCancelar.textContent = "Cancelar la eliminación"
            document.querySelector("main").appendChild(pantallaInmersiva)
        },
        confirmar: async function (mensajeUID) {

            const instanciaUID_pantalaDeCarga = casaVitini.utilidades.codigoFechaInstancia()
            const instanciaUID = document.querySelector("main").getAttribute("instanciaUID")
            const mensaje = "Eliminando el mensaje..."
            const datosPantallaSuperpuesta = {
                instanciaUID: instanciaUID_pantalaDeCarga,
                mensaje: mensaje
            }
            casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
            const transaccion = {
                zona: "administracion/configuracion/mensajesEnPortada/eliminarMensaje",
                mensajeUID: String(mensajeUID)
            }

            const respuestaServidor = await casaVitini.shell.servidor(transaccion)


            const instanciaRenderizada = document.querySelector(`[pantallaSuperpuesta=pantallaCargaSuperpuesta][instanciaUID="${instanciaUID_pantalaDeCarga}"]`)
            instanciaRenderizada?.remove()
            if (respuestaServidor?.error) {
                if (!instanciaRenderizada) { return }
                casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                const instanciaMainRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
                if (!instanciaMainRenderizada) { }
                const mensajeUID = respuestaServidor.mensajeUID
                instanciaMainRenderizada.querySelector(`[mensajeUID="${mensajeUID}"]`)?.remove()
                this.portadaUI()
            }
        }
    },
    moverPosicion: async function (o) {
        const nuevaPosicion = o.nuevaPosicion
        const mensajeUIDActual = o.mensajeUIDActual
        const posicionDelMensajeActual = document.querySelector(`[mensajeUID="${mensajeUIDActual}"]`)
            .closest("[posicion]").getAttribute("posicion")

        const instanciaUID_pantalaDeCarga = casaVitini.utilidades.codigoFechaInstancia()
        const instanciaUID = document.querySelector("main").getAttribute("instanciaUID")
        const mensaje = "Cambiando de posición..."
        const datosPantallaSuperpuesta = {
            instanciaUID: instanciaUID_pantalaDeCarga,
            mensaje: mensaje
        }
        casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
        const transaccion = {
            zona: "administracion/configuracion/mensajesEnPortada/moverPosicion",
            mensajeUID: String(mensajeUIDActual),
            nuevaPosicion: String(nuevaPosicion)
        }

        const respuestaServidor = await casaVitini.shell.servidor(transaccion)

        const instanciaRenderizada = document.querySelector(`[pantallaSuperpuesta=pantallaCargaSuperpuesta][instanciaUID="${instanciaUID_pantalaDeCarga}"]`)
        instanciaRenderizada?.remove()
        if (respuestaServidor?.error) {
            if (!instanciaRenderizada) { return }
            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {

            const instanciaMainRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
            if (!instanciaMainRenderizada) { }
            const mensajeSeleccionado = respuestaServidor.mensajeSeleccionado
            const mensajeAfectado = respuestaServidor.mensajeAfectado














            const numeroTotalMensajes = document.querySelectorAll("[posicion]").length

            const contenedorSeleccionado = document.querySelector(`[posicion="${nuevaPosicion}"]`)
            contenedorSeleccionado.innerHTML = null

            const configuracionMensaje = {
                mensajeUID: mensajeSeleccionado.mensajeUID,
                mensaje: mensajeSeleccionado.mensaje,
                estadoIDV: mensajeSeleccionado.estadoIDV,
                posicion: nuevaPosicion,
                numeroTotalMensajes: numeroTotalMensajes
            }
            const mensajeUI_seleccionado = this.mensajeUI(configuracionMensaje)
            contenedorSeleccionado.appendChild(mensajeUI_seleccionado)

            const contenedorAfectado = document.querySelector(`[posicion="${posicionDelMensajeActual}"]`)
            contenedorAfectado.innerHTML = null
            const configuracionMensajeAfectado = {
                mensajeUID: mensajeAfectado.mensajeUID,
                mensaje: mensajeAfectado.mensaje,
                estadoIDV: mensajeAfectado.estadoIDV,
                posicion: posicionDelMensajeActual,
                numeroTotalMensajes: numeroTotalMensajes
            }
            const mensajeUI_afectado = this.mensajeUI(configuracionMensajeAfectado)
            contenedorAfectado.appendChild(mensajeUI_afectado)
        }

    },
    actualizarEstado: async function (interruptor) {
        const main = document.querySelector("main")
        const seccionUID = main.getAttribute("instanciaUID")
        const mensajeUID = interruptor.mensajeUID
        const estadoIDV = interruptor.estadoSeleccionado
        const selectorListaEstadosInterruptor = main.querySelector(`[mensajeUID="${mensajeUID}"] [componente=selectorEstado]`)
        const valorInicial = selectorListaEstadosInterruptor.getAttribute("valorInicial")
        const estadoSoliciado = selectorListaEstadosInterruptor.querySelector(`option[value=${estadoIDV}]`)
        let procesandoEstadoUI
        if (estadoIDV === "activado") {
            procesandoEstadoUI = "Activando..."
        }
        if (estadoIDV === "desactivado") {
            procesandoEstadoUI = "Desactivando..."
        }
        estadoSoliciado.text = procesandoEstadoUI
        const transacccion = {
            zona: "administracion/configuracion/mensajesEnPortada/actualizarEstado",
            mensajeUID: mensajeUID,
            estadoIDV: estadoIDV
        }
        const respuestaServidor = await casaVitini.shell.servidor(transacccion)
        const seccionRenderizada = document.querySelector(`main[instanciaUID="${seccionUID}"]`)

        if (!seccionRenderizada) { return }
        selectorListaEstadosInterruptor.removeAttribute("style")
        if (respuestaServidor?.error) {
            let estadoInicialUI
            if (estadoIDV === "activado") {
                estadoInicialUI = "Activado"
            }
            if (estadoIDV === "desactivado") {
                estadoInicialUI = "Desactivado"
            }
            estadoSoliciado.text = estadoInicialUI
            selectorListaEstadosInterruptor.value = valorInicial
            casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
        }
        if (respuestaServidor?.ok) {
            let estadoFinalUI
            if (estadoIDV === "activado") {

                estadoFinalUI = "Activado"
            }
            if (estadoIDV === "desactivado") {
                estadoFinalUI = "Desactivado"
            }
            estadoSoliciado.text = estadoFinalUI
            selectorListaEstadosInterruptor.setAttribute("valorInicial", estadoIDV)
        }
    }

}