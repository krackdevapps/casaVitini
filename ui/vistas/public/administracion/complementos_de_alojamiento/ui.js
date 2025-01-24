casaVitini.view = {
    start: function () {
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const comandoInicial = granuladoURL.directorios[granuladoURL.directorios.length - 1]
        const main = document.querySelector("main")

        if (granuladoURL.parametros.alojamiento) {
            return this.complementosPorAlojamiento.arranque()
        } else if (granuladoURL.parametros.complemento) {
            return this.complementosPorAlojamiento.detallesComplemento.arranque(granuladoURL.parametros.complemento)
        } else if (comandoInicial === "complementos_de_alojamiento") {
            return this.portada.arranque()
        } else {
            return casaVitini.ui.componentes.urlDesconocida()
        }
    },
    portada: {
        arranque: async function () {
            const main = document.querySelector("main")
            const instanciaUID = main.getAttribute("instanciaUID")
            const espacio = main.querySelector("[componente=espacio]")
            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/arquitectura/configuraciones/listarConfiguracionApartamentos"
            })
            if (respuestaServidor?.error) {
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {

                const configuracionesAlojamiento = respuestaServidor.ok
                configuracionesAlojamiento.forEach((conf) => {
                    const apartamentoIDV = conf.apartamentoIDV
                    const zonaIDV = conf.zonaIDV
                    const apartamentoUI = conf.apartamentoUI
                    const estadoConfiguracion = conf.estadoConfiguracion
                    const tarjeta = this.tarjetaAlojamientoUI({
                        apartamentoIDV,
                        apartamentoUI
                    })
                    espacio.appendChild(tarjeta)

                })

            }

        },
        tarjetaAlojamientoUI: (data) => {

            const { apartamentoIDV, apartamentoUI } = data
            const contenedor = document.createElement("a")
            contenedor.setAttribute("apartamentoIDV", apartamentoIDV)
            contenedor.href = "/administracion/complementos_de_alojamiento/alojamiento:" + apartamentoIDV
            contenedor.setAttribute("vista", "/administracion/complementos_de_alojamiento/alojamiento:" + apartamentoIDV)
            contenedor.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            contenedor.classList.add("flexVertical", "gap6", "backgroundGrey1", "borderRadius14", "padding14", "ratonDefault", "comportamientoBoton")

            const tituloUI = document.createElement("p")
            tituloUI.classList.add("negrita")
            tituloUI.textContent = apartamentoUI
            contenedor.appendChild(tituloUI)

            const descripcionComplementos = document.createElement("p")
            descripcionComplementos.textContent = "Ver complementos de alojamiento"
            contenedor.appendChild(descripcionComplementos)

            return contenedor

        }

    },
    complementosPorAlojamiento: {
        arranque: function () {
            const granuladoURL = casaVitini.utilidades.granuladorURL()
            const comandoInicial = granuladoURL.directorios[granuladoURL.directorios.length - 1]
            const main = document.querySelector("main")
            if (comandoInicial === "nuevo") {
                return casaVitini.view.__sharedMethods__.nuevo.arranque(granuladoURL.parametros.alojamiento)
            } else if (granuladoURL.parametros.alojamiento) {
                return this.portada.arranque(granuladoURL.parametros.alojamiento)
            } else {
                return casaVitini.ui.componentes.urlDesconocida()
            }
        },
        portada: {
            arranque: async function (apartamentoIDV) {
                const main = document.querySelector("main")
                const instanciaUID = main.getAttribute("instanciaUID")
                const espacio = main.querySelector("[componente=espacio]")

                const contenedorBotones = document.createElement("div")
                contenedorBotones.classList.add("flexHorizontal")
                const botonCrearCuenta = document.createElement("a")
                botonCrearCuenta.classList.add("botonV1")
                botonCrearCuenta.setAttribute("href", `/administracion/complementos_de_alojamiento/alojamiento:${apartamentoIDV}/nuevo`)
                botonCrearCuenta.setAttribute("vista", `/administracion/complementos_de_alojamiento/alojamiento:${apartamentoIDV}/nuevo`)
                botonCrearCuenta.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                botonCrearCuenta.textContent = "Crear complemento"
                contenedorBotones.appendChild(botonCrearCuenta)
                espacio.appendChild(contenedorBotones)

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/complementosDeAlojamiento/obtenerComplementosPorAlojamiento",
                    apartamentoIDV,
                    filtro: "todos"
                })
                const ui_enEspera = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!ui_enEspera) {
                    return
                }
                if (respuestaServidor?.error) {
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {

                    const complementos = respuestaServidor.complementosPorApartamentoIDV
                    const apartamentoUI = respuestaServidor.apartamentoUI

                    main.querySelector("[data=titulo]").textContent = `Complementos de alojamiento de ${apartamentoUI}`
                    complementos.forEach((com) => {
                        const tarjetaUI = this.tarjetaComplementoUI(com)
                        espacio.appendChild(tarjetaUI)
                    })
                }
            },
            tarjetaComplementoUI: (data) => {

                const { complementoUI, definicion, tipoPrecio, precio, estadoIDV, complementoUID } = data

                const contenedor = document.createElement("a")
                contenedor.setAttribute("href", `/administracion/complementos_de_alojamiento/complemento:${complementoUID}`)
                contenedor.setAttribute("vista", `/administracion/complementos_de_alojamiento/complemento:${complementoUID}`)
                contenedor.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                contenedor.classList.add(
                    "flexVertical",
                    "gap6",
                    "backgroundGrey1",
                    "padding14",
                    "borderRadius14",
                    "comportamientoBoton",
                    "ratonDefault"
                )

                const dict = {
                    porNoche: "(Por noche de la reserva)",
                    fijoPorReserva: "(Precio final)",
                    activado: "Activado",
                    desactivado: "Desactivado"
                }

                const titulo = document.createElement("p")
                titulo.classList.add("negrita")
                titulo.textContent = complementoUI
                contenedor.appendChild(titulo)

                const estadoUI = document.createElement("p")
                estadoUI.textContent = dict[estadoIDV]
                contenedor.appendChild(estadoUI)

                const definicionUI = document.createElement("p")
                definicionUI.textContent = definicion || "Sin definción"
                contenedor.appendChild(definicionUI)

                const tipoPrecioUI = document.createElement("p")
                tipoPrecioUI.classList.add("negrita")
                tipoPrecioUI.textContent = "Precio y tipo de aplicación"
                contenedor.appendChild(tipoPrecioUI)

                const precioUI = document.createElement("p")
                precioUI.textContent = `${precio}$ ${dict[tipoPrecio]}`
                contenedor.appendChild(precioUI)
                return contenedor
            }
        },
        detallesComplemento: {
            arranque: async function (complementoUID) {
                const main = document.querySelector("main")
                const espacio = main.querySelector("[componente=espacio]")
                const instanciaUID = main.getAttribute("instanciaUID")
                main.setAttribute("zonaCSS", "/administracion/complementoDeAlojamineto/complementoUI")

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/complementosDeAlojamiento/detallesComplemento",
                    complementoUID: String(complementoUID)
                })
                const seccionRenderizada = document.querySelector(`main[instanciaUID="${instanciaUID}"]`)
                if (!seccionRenderizada) { return }
                if (respuestaServidor?.error) {
                    const info = {
                        titulo: "No existe ningúna servicio con ese identificador",
                        descripcion: "Revisa el identificador porque este servicio que buscas no existe. Quizás este identificador existió y borraste esta servicio.."
                    }
                    casaVitini.ui.componentes.mensajeSimple(info)
                } else if (respuestaServidor?.ok) {

                    const complemento = respuestaServidor.ok
                    const apartamentoIDV = complemento.apartamentoIDV
                    const apartamentoUI = respuestaServidor.apartamentoUI

                    main.querySelector("[data=titulo]").textContent = `Detalles del complementos de alojamiento de ${apartamentoUI}`

                    espacio.setAttribute("instantanea", JSON.stringify(complemento))
                    espacio.innerHTML = null

                    const ui = casaVitini.view.__sharedMethods__.complementoUI({
                        modoUI: "editar",
                        apartamentoIDV,
                        complementoUID
                    })
                    espacio.appendChild(ui)
                    this.aplicaData({
                        complemento,
                        instanciaUID_destino: instanciaUID
                    })
                    const botonCrearServicio = this.botonesDuranteModificacion()
                    ui.appendChild(botonCrearServicio)
                }
            },
            botonesDuranteModificacion: function () {
                const contenedor = document.createElement("div");
                contenedor.classList.add("contenedorBotones");
                contenedor.setAttribute("contenedor", "botones");

                const botonGuardar = document.createElement("div")
                botonGuardar.classList.add("botonV1");
                botonGuardar.setAttribute("componente", "botonGuardarCambios");
                botonGuardar.setAttribute("tipoOferta", "conXApartamentosEnConcreto");
                botonGuardar.addEventListener("click", () => { this.guardarCambios() })
                botonGuardar.textContent = "Actualizar complemento";

                const botonCancelar = document.createElement("p");
                botonCancelar.classList.add("botonV1");
                botonCancelar.setAttribute("componente", "botonCancelarCambios");
                botonCancelar.setAttribute("tipoOferta", "conXApartamentosEnConcreto");
                botonCancelar.addEventListener("click", async () => {
                    const selectorInstantena = document.querySelector("[instantanea]").getAttribute("instantanea")
                    const instantanea = JSON.parse(selectorInstantena)
                    const instanciaUID_destino = document.querySelector(`main[instanciaUID]`).getAttribute("instanciaUID")
                    casaVitini.administracion.complementosDeAlojamiento.complementosPorAlojamiento.detallesComplemento.aplicaData({
                        complemento: instantanea,
                        instanciaUID_destino: instanciaUID_destino,
                    })
                })
                botonCancelar.textContent = "Revertir cambios";

                const botonEliminar = document.createElement("p");
                botonEliminar.classList.add("botonV1");
                botonEliminar.setAttribute("componente", "botonEliminarOferta");
                botonEliminar.addEventListener("click", () => {
                    casaVitini.administracion.complementosDeAlojamiento.complementosPorAlojamiento.detallesComplemento.eliminar.ui()
                })
                botonEliminar.textContent = "Eliminar complemento";
                contenedor.appendChild(botonGuardar);
                contenedor.appendChild(botonCancelar);
                contenedor.appendChild(botonEliminar);
                return contenedor
            },
            aplicaData: function (data) {

                const complemento = data.complemento
                const complementoUI = complemento.complementoUI
                const instanciaUID_destino = data.instanciaUID_destino
                const complementoUID = complemento.complementoUID
                const tipoPrecio = complemento.tipoPrecio
                const precio = complemento.precio
                const definicion = complemento.definicion
                const estadoIDV = complemento.estadoIDV

                const complementoUI_ = document.querySelector(`[instanciaUID="${instanciaUID_destino}"]`)
                if (!complementoUI_) { return }

                complementoUI_.querySelector("[componente=complementoUI]").setAttribute("complementoUID", complementoUID)

                if (estadoIDV === "desactivado") {
                    complementoUI_.querySelector("[componente=estado]").setAttribute("estado", estadoIDV)
                    complementoUI_.querySelector("[componente=estado]").style.background = "#ff000091"
                    complementoUI_.querySelector("[componente=estado]").innerHTML = "Componente desactivado"
                }
                if (estadoIDV === "activado") {
                    complementoUI_.querySelector("[componente=estado]").setAttribute("estado", estadoIDV)
                    complementoUI_.querySelector("[componente=estado]").style.background = "#00ff006e"
                    complementoUI_.querySelector("[componente=estado]").innerHTML = "Componente activado"
                }

                const nombreUI = complementoUI_.querySelector("[campo=complementoUI]")
                nombreUI.value = complementoUI

                const definicionCampo = complementoUI_.querySelector("[campo=definicion]")
                definicionCampo.value = definicion

                const tipoPrecioUI = complementoUI_.querySelector("[campo=tipoPrecio]")
                tipoPrecioUI.value = tipoPrecio

                const precioCampo = complementoUI_.querySelector("[campo=precio]")
                precioCampo.value = precio
            },
            guardarCambios: async function () {
                const instanciaUID_pantallaEspera = casaVitini.utilidades.codigoFechaInstancia()
                const main = document.querySelector("main")
                const instanciaUID = main.getAttribute("instanciaUID")
                const complementoUID = main.querySelector("[componente=complementoUI]").getAttribute("complementoUID")

                const mensaje = "Actualizando comportamiento..."
                const datosPantallaSuperpuesta = {
                    instanciaUID: instanciaUID_pantallaEspera,
                    mensaje: mensaje
                }
                casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                const complementoObjeto = casaVitini.administracion.complementosDeAlojamiento.complementosPorAlojamiento.utilidades.constructorObjeto()

                const respuestaServidor = await casaVitini.shell.servidor({
                    zona: "administracion/complementosDeAlojamiento/actualizarComplemento",
                    complementoUID: String(complementoUID),
                    ...complementoObjeto
                })
                document.querySelector(`[instanciaUID="${instanciaUID_pantallaEspera}"]`)?.remove()
                const complementoUI = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                if (!complementoUI) { return }
                if (respuestaServidor?.error) {
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    const complementoActualizado = respuestaServidor.complementoActualizado

                    const complementoUID = document.querySelector("[componente=complementoUI]")
                    complementoUID.setAttribute("instantanea", JSON.stringify(complementoActualizado))
                    casaVitini.administracion.complementosDeAlojamiento.complementosPorAlojamiento.detallesComplemento.aplicaData({
                        complemento: complementoActualizado,
                        instanciaUID_destino: instanciaUID
                    })
                }
            },
            eliminar: {
                ui: function () {

                    const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
                    const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

                    const titulo = constructor.querySelector("[componente=titulo]")
                    titulo.textContent = "Confirmar eliminar el complemento"
                    const mensaje = constructor.querySelector("[componente=mensajeUI]")
                    mensaje.textContent = "Var a eliminar el complemento y su aplicacion sera inmediata, ¿Estas de acuerdo?"

                    const botonAceptar = constructor.querySelector("[boton=aceptar]")
                    botonAceptar.textContent = "Comfirmar la eliminación 1"
                    botonAceptar.addEventListener("click", () => {



                        return this.confirmar()
                    })
                    const botonCancelar = constructor.querySelector("[boton=cancelar]")
                    botonCancelar.textContent = "Cancelar la eliminación"

                    document.querySelector("main").appendChild(pantallaInmersiva)

                },
                confirmar: async () => {

                    const instanciaUID = casaVitini.utilidades.codigoFechaInstancia()
                    const mensaje = "Eliminado el complemento..."
                    const datosPantallaSuperpuesta = {
                        instanciaUID: instanciaUID,
                        mensaje: mensaje
                    }
                    casaVitini.ui.componentes.pantallaDeCargaSuperPuesta(datosPantallaSuperpuesta)
                    const complementoUID = document.querySelector("[complementoUID]").getAttribute("complementoUID")
                    const transaccion = {
                        zona: "administracion/complementosDeAlojamiento/eliminarComplemento",
                        complementoUID: String(complementoUID)
                    }
                    const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                    const instanciaRenderizada = document.querySelector(`[instanciaUID="${instanciaUID}"]`)
                    if (!instanciaRenderizada) { return }
                    instanciaRenderizada.remove()
                    if (respuestaServidor?.error) {
                        casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                    }
                    if (respuestaServidor?.ok) {
                        const apartamentoIDV = respuestaServidor.apartamentoIDV
                        const vista = `/administracion/complementos_de_alojamiento/alojamiento:${apartamentoIDV}`
                        const navegacion = {
                            vista: vista,
                        }
                        casaVitini.shell.navegacion.controladorVista(navegacion)
                    }
                }
            },
            estadoUIControlador: async (estado) => {
                const complementoUID = document.querySelector("[complementoUID]")?.getAttribute("complementoUID")
                if (!complementoUID) {
                    const error = "No se puede cambiar el estado del complemento porque no tiene un identificador único de servicio (complementoUID).Esto puede deberse a que aún no has creado el complemento o que lo has borrado. Si estás creando una complemento, por favor asegúrate de crearlo pulsando el botón 'Crear complemento' antes de activarla."
                    casaVitini.ui.componentes.advertenciaInmersiva(error)
                }
                const selectorEstado = document.querySelector("[componente=estado]")

                const estadoActualMemoriaVolatil = selectorEstado.textContent
                selectorEstado.textContent = "Esperando al servidor...."
                const estadoActual = estado.target.getAttribute("estado")
                let estadoPropuesto
                if (estadoActual === "desactivado") {
                    estadoPropuesto = "activado"
                }
                if (estadoActual === "activado") {
                    estadoPropuesto = "desactivado"
                }
                const transaccion = {
                    zona: "administracion/complementosDeAlojamiento/actualizarEstado",
                    complementoUID: String(complementoUID),
                    estadoIDV: estadoPropuesto
                }

                const respuestaServidor = await casaVitini.shell.servidor(transaccion)
                if (!respuestaServidor) {
                    selectorEstado.textContent = estadoActualMemoriaVolatil
                    selectorEstado.setAttribute("estado", estadoActual)
                } else if (respuestaServidor?.error) {
                    selectorEstado.textContent = estadoActualMemoriaVolatil
                    selectorEstado.setAttribute("estado", estadoActual)
                    casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
                }
                if (respuestaServidor?.ok) {
                    const estadoIDV = respuestaServidor?.estadoIDV
                    selectorEstado.setAttribute("estado", estadoIDV)
                    let estadoUI
                    if (estadoIDV === "activado") {
                        selectorEstado.style.background = "#00ff006e"
                        estadoUI = "Complemento activado"
                    }
                    if (estadoIDV === "desactivado") {
                        selectorEstado.style.background = "#ff000091"
                        estadoUI = "Complemento desactivado"
                    }
                    selectorEstado.textContent = estadoUI
                }
            },
        },
     


    }

}