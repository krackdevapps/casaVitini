casaVitini.view = {
    start: async function () {
        const reservaConfirmada = JSON.parse(localStorage.getItem("reservaConfirmada"))

        casaVitini.shell.controladoresUI.iconosGlobales.telefonoPublicoWhatsApp({
            zonaIcono: "alojamiento"
        })

        if (reservaConfirmada) {
            const main = document.querySelector("main")

            const pdfCodificado = reservaConfirmada.pdf

            const reservaUID = reservaConfirmada.global.reservaUID
            const fechaEntrada = reservaConfirmada.global.fechaEntrada
            const fechaSalida = reservaConfirmada.global.fechaSalida

            const fechaEntrada_Humana = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaEntrada)
            const fechaSalida_Humana = casaVitini.utilidades.conversor.fecha_ISO_hacia_humana(fechaSalida)

            const estadoReserva = reservaConfirmada.global.estadoReservaIDV
            const estadoPago = reservaConfirmada.global.estadoPagoIDV
            const creacion = reservaConfirmada.global.fechaCreacion_simple

            const titular = reservaConfirmada.titular

            const nombreTitular = titular.nombreTitular
            const pasaporteTitular = titular.pasaporteTitular
            const mailTitular = titular.mailTitular
            const telefonoTitular = titular.telefonoTitular

            const contenedorFinanciero = reservaConfirmada.contenedorFinanciero
            const totalFinal = contenedorFinanciero.desgloseFinanciero.global.totales.totalFinal


            const marcoElasticoRelatico = document.createElement("div")
            marcoElasticoRelatico.classList.add("marcoElasticoRelativo")
            main.appendChild(marcoElasticoRelatico)

            const marcoElastico = document.createElement("div")
            marcoElastico.classList.add("marcoElastico")
            marcoElastico.setAttribute("contenedor", "reservaconfirmada")
            marcoElasticoRelatico.appendChild(marcoElastico)


            const titulo = document.createElement("div")
            titulo.classList.add("tituloGrande", "padding10", "textoCentrado")
            titulo.style.fontSize = "30px"
            titulo.textContent = "Solicitud de reserva recibida"
            marcoElastico.appendChild(titulo)

            const infoGlobal = document.createElement("div")
            infoGlobal.classList.add("flexVertical", "textoCentrado", "padding10")
            infoGlobal.textContent = "Su reserva está confirmada y le estamos esperando. Aquí tiene los detalles de su reserva. Puede descargar un resumen de su reserva en formato de documento PDF. Su reserva se ha registrado junto a su correo electrónico. Si desea ver con más detalle su reserva puede crear una cuenta en MiCasa para poder ver todos los detalles de su reserva. Si necesita contactar con Casa Vitini puede encontrar toda la información de contacto en la sección Contacto. Se ha enviado una copia del resumen de su reserva a su dirección de correo electrónico."

            const infoIngreso = document.createElement("pre")
            infoIngreso.classList.add("flexVertical", "padding10", "textoCentrado", "negrita")
            const spinner = casaVitini.ui.componentes.spinnerSimple()
            infoIngreso.appendChild(spinner)
            const mensajePrincipal = await this.obtenerMensajePrincipal()

            infoIngreso.innerHTML = null
            infoIngreso.textContent = mensajePrincipal
            marcoElastico.appendChild(infoIngreso)

            const contenedor = document.createElement("div")
            contenedor.classList.add("flexVertical")
            marcoElastico.appendChild(contenedor)

            const espacioDatosGlobalesReserva = document.createElement("div")
            espacioDatosGlobalesReserva.classList.add("flexVertical", "gap10")
            espacioDatosGlobalesReserva.setAttribute("contenedor", "espacioDatosGlobalesReserva")
            contenedor.appendChild(espacioDatosGlobalesReserva)

            const reversaUI = document.createElement("div")
            reversaUI.classList.add("flexVertical", "textoCentrado")
            espacioDatosGlobalesReserva.appendChild(reversaUI)

            const nombreReserva = document.createElement("div")
            nombreReserva.textContent = "Reserva"
            reversaUI.appendChild(nombreReserva)

            const numeroReservaUID = document.createElement("div")
            numeroReservaUID.classList.add("negrita", "fuenteAdaptable40-20")
            numeroReservaUID.textContent = reservaUID
            reversaUI.appendChild(numeroReservaUID)

            const botonDescargarPDF = document.createElement("a")
            botonDescargarPDF.classList.add("botonV1")
            botonDescargarPDF.textContent = "Descargar un resumen de la solicitud de la reserva en PDF"
            botonDescargarPDF.download = "Reserva.pdf"
            botonDescargarPDF.href = `data:application/pdf;base64,${pdfCodificado}`
            espacioDatosGlobalesReserva.appendChild(botonDescargarPDF)


            const contenedorFechas = document.createElement("div")
            contenedorFechas.classList.add("flexHorizontal", "gap10", "padding10", "flexJustificacion_spacearound")
            espacioDatosGlobalesReserva.appendChild(contenedorFechas)

            const contenedorFechaEntrada = document.createElement("div")
            contenedorFechaEntrada.classList.add("flexVertical")
            contenedorFechas.appendChild(contenedorFechaEntrada)

            const tituloFechaEntrada = document.createElement("div")
            tituloFechaEntrada.classList.add("textoCentrado")
            tituloFechaEntrada.textContent = "Fecha de entrada"
            contenedorFechaEntrada.appendChild(tituloFechaEntrada)

            const fechaEntradaUI = document.createElement("div")
            fechaEntradaUI.classList.add("negrita", "fuenteAdaptable40-20")
            fechaEntradaUI.textContent = fechaEntrada_Humana
            contenedorFechaEntrada.appendChild(fechaEntradaUI)

            const contenedorFechaSalida = document.createElement("div")
            contenedorFechaSalida.classList.add("flexVertical")
            contenedorFechas.appendChild(contenedorFechaSalida)

            const tituloFechaSalida = document.createElement("div")
            tituloFechaSalida.classList.add("textoCentrado")
            tituloFechaSalida.textContent = "Fecha de salida"
            contenedorFechaSalida.appendChild(tituloFechaSalida)

            const fechaSalidaUI = document.createElement("div")
            fechaSalidaUI.classList.add("negrita", "fuenteAdaptable40-20")
            fechaSalidaUI.textContent = fechaSalida_Humana
            contenedorFechaSalida.appendChild(fechaSalidaUI)

            const contenedorTitular = document.createElement("div")
            contenedorTitular.classList.add("flexVertical", "backgroundWhite3", "padding10", "borderRadius16")
            espacioDatosGlobalesReserva.appendChild(contenedorTitular)

            const contenedorDatosDelTitular = document.createElement("div")
            contenedorDatosDelTitular.classList.add("contenedorTitular")
            contenedorTitular.appendChild(contenedorDatosDelTitular)

            const dataTitularUI = (data) => {
                const titulo = data.titulo
                const valor = data.valor

                const ui = document.createElement("div")
                ui.classList.add("flexVertical")

                const t = document.createElement("div")
                t.classList.add("textoCentrado")
                t.textContent = titulo
                ui.appendChild(t)

                const v = document.createElement("div")
                v.classList.add("negrita", "textoCentrado")
                v.textContent = valor

                t.appendChild(v)
                return t
            }

            contenedorDatosDelTitular.appendChild(dataTitularUI({
                titulo: "Nombre y apelldos",
                valor: nombreTitular
            }))

            contenedorDatosDelTitular.appendChild(dataTitularUI({
                titulo: "Correo electroníco",
                valor: mailTitular
            }))

            contenedorDatosDelTitular.appendChild(dataTitularUI({
                titulo: "Teléfono",
                valor: telefonoTitular
            }))


            const contenedorAlojamiento = document.createElement("div")
            contenedorAlojamiento.classList.add("grid2x1_r_1x1", "gap10")
            espacioDatosGlobalesReserva.appendChild(contenedorAlojamiento)

            this.alojamiento.rednerizar({
                e: contenedorAlojamiento,
                reservaConfirmada
            })

            const contenedorTotal = document.createElement("div")
            contenedorTotal.classList.add("flexVertical", "gap10", "textoCentrado")
            espacioDatosGlobalesReserva.appendChild(contenedorTotal)

            const contenedorInfoTotal = document.createElement("div")
            contenedorInfoTotal.classList.add("flexVertical", "gap10", "textoCentrado", "backgroundGrey1", "padding10", "borderRadius16")
            contenedorTotal.appendChild(contenedorInfoTotal)

            const tituloTotal = document.createElement("p")
            tituloTotal.classList.add("negrita")
            tituloTotal.textContent = "Total de la reserva"
            contenedorInfoTotal.appendChild(tituloTotal)

            const totalReserva = document.createElement("p")
            totalReserva.classList.add("negrita")
            totalReserva.textContent = totalFinal + "$"
            contenedorInfoTotal.appendChild(totalReserva)


            const info1 = document.createElement("div")
            info1.classList.add("flexVertical", "padding10")
            info1.textContent = `En el desglose detallado puede ver precio por día, por alojamiento, por complemento y servicios contratados y ofertas aplicadas`
            contenedorTotal.appendChild(info1)



            const masInfo = document.createElement("p")
            masInfo.classList.add("botonV1")
            masInfo.textContent = "Abrir desglose detallado"
            masInfo.addEventListener("click", () => {
                const ui = casaVitini.ui.componentes.pantallaInmersivaPersonalizada()
                const instanciaUID = ui.getAttribute("instanciaUID")
                const contenedor = ui.querySelector("[componente=contenedor]")
                main.appendChild(ui)

                const titulo = document.createElement("div")
                titulo.classList.add(
                    "tituloGris",
                    "padding10"
                )
                titulo.textContent = "Desglose de la reserva"
                contenedor.appendChild(titulo)

                const testInfo = document.createElement("div")
                testInfo.classList.add(
                    "textoJustificado", "padding10"
                )
                testInfo.textContent = "Aquí tiene desglose del importe de la reserva, detallando los cargos, impuestos y conceptos asociados."
                contenedor.appendChild(testInfo)

                const botonCerrar = document.createElement("div")
                botonCerrar.classList.add("botonV1")
                botonCerrar.textContent = "Cerrar y volver"
                botonCerrar.setAttribute("boton", "cancelar")
                botonCerrar.addEventListener("click", () => {
                    return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                })
                contenedor.appendChild(botonCerrar)

                casaVitini.view.__sharedMethods__.contenedorFinanciero.constructor({
                    destino: `[instanciaUID="${instanciaUID}"] [componente=contenedor]`,
                    contenedorFinanciero: contenedorFinanciero,
                    modoUI: "plaza"
                })
                const contenedorFinancieroUI = ui.querySelector("[contenedor=financiero]")
                contenedorFinancieroUI.classList.add(
                    "borderRadius10"
                )

                const botonCerrarInferior = document.createElement("div")
                botonCerrarInferior.classList.add("botonV1")
                botonCerrarInferior.textContent = "Cerrar y volver"
                botonCerrarInferior.setAttribute("boton", "cancelar")
                botonCerrarInferior.addEventListener("click", () => {
                    return casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
                })
                contenedor.appendChild(botonCerrarInferior)
            })
            contenedorTotal.appendChild(masInfo)

            const infoGlobal2 = document.createElement("div")
            infoGlobal2.classList.add("flexVertical", "padding10")
            infoGlobal2.textContent = `Tu reserva se guarda localmente en tu navegador. Si no borras la caché o eliminas la reserva manualmente, seguirá ahí para tu comodidad. También puedes registrarte y crear una cuenta en MiCasa con el mismo correo para acceder a los detalles de tus reservas desde cualquier lugar. Si usas un dispositivo público, asegúrate de borrar la caché. ¡Crear un VitiniID es gratis!`
            marcoElastico.appendChild(infoGlobal2)

            const botonBorrarReserva = document.createElement("div")
            botonBorrarReserva.classList.add("botonV1")
            botonBorrarReserva.textContent = "Borrar la información de esta solicitud del navegador"
            botonBorrarReserva.addEventListener("click", () => {
                this.borrarReservaLocal()
            })
            marcoElastico.appendChild(botonBorrarReserva)

        } else {
            const marcoElasticoRelatico = document.createElement("div")
            marcoElasticoRelatico.classList.add("marcoElasticoRelativo")
            const marcoElastico = document.createElement("div")
            marcoElastico.classList.add("marcoElastico", "padding16")
            marcoElastico.style.alignItems = "stretch"
            const titulo = document.createElement("div")
            titulo.classList.add("negrita", "textoCentrado")
            titulo.textContent = "Nínguna reserva que mostrar"
            marcoElastico.appendChild(titulo)

            const contenedorBanner = document.createElement("a")
            contenedorBanner.classList.add("padding18")
            contenedorBanner.textContent = "Esta página muestra el resumen de tu reserva confirmada, pero no encuentra ninguna reserva guardada en la caché local de tu navegador. Cuando haces una reserva, los datos de la reserva, luego de guardarse en el servidor de Casa Vitini, se guarda una copia local en tu navegador. Esto se hace para la comodidad del usuario. Para que pueda acceder al resumen de su reserva confirmada cómodamente. Pero si el usuario borra la caché de navegador o esta se borra por la configuración del navegador, ya no se puede acceder a la reserva porque ya no existe en la caché del navegador. Si quieres volver a ver el resumen de tu reserva, tienes varias opciones. La más cómoda e inmediata es registrar una nueva cuenta en Mi Casa para obtener tu VitiniID y poder acceder a tu cuenta de usuario donde podrá ver tus reservas. Otra opción es ponerte en contacto con nosotros. Para ellos ves al apartado Contacto, donde podrás obtener las distintas formas de contacto con nosotros y te responderemos lo antes posible. Ten en cuenta que, debido a las zonas horarias, si cuando nos llamas no estamos disponibles por la diferencia horaria, puedes enviarnos un correo o un mensaje instantáneo. La primera opción, registrar una cuenta, es una opción instantánea y es la que te recomendamos."
            marcoElastico.appendChild(contenedorBanner)
            const botonIniciarReserva = document.createElement("a")
            botonIniciarReserva.classList.add("botonV1BlancoIzquierda")
            botonIniciarReserva.textContent = "Iniciar una nueva reserva"
            botonIniciarReserva.setAttribute("href", "/alojamiento")

            botonIniciarReserva.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            marcoElastico.appendChild(botonIniciarReserva)
            const botonIrARegistrarse = document.createElement("a")
            botonIrARegistrarse.classList.add("botonV1BlancoIzquierda")
            botonIrARegistrarse.textContent = "Ir a crear una cuenta a MiCasa"
            botonIrARegistrarse.setAttribute("href", "/micasa/crear_nueva_cuenta")

            botonIrARegistrarse.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            marcoElastico.appendChild(botonIrARegistrarse)
            const botonInciarSession = document.createElement("a")
            botonInciarSession.classList.add("botonV1BlancoIzquierda")
            botonInciarSession.textContent = "Iniciar session con mi VitiniID en MiCasa"
            botonInciarSession.setAttribute("href", "/micasa")

            botonInciarSession.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            marcoElastico.appendChild(botonInciarSession)
            marcoElasticoRelatico.appendChild(marcoElastico)
            const seccion = document.querySelector("main")
            seccion.innerHTML = null
            seccion.appendChild(marcoElasticoRelatico)
        }

    },
    borrarReservaLocal: function () {
        document.body.style.overflow = 'hidden';

        const pantallaInmersiva = casaVitini.ui.componentes.pantallaInmersivaPersonalizadaMoldeada()
        document.querySelector("main").appendChild(pantallaInmersiva)

        pantallaInmersiva.style.justifyContent = "center"
        const constructor = pantallaInmersiva.querySelector("[componente=constructor]")

        const titulo = constructor.querySelector("[componente=titulo]")
        titulo.textContent = `Borrar esta copia de mi reserva`
        const mensaje = constructor.querySelector("[componente=mensajeUI]")
        mensaje.textContent = `Cuando realizas una reserva y la confirmas. Una copia de la reserva se guarda en tu navegador en el almacén de memoria local que tiene el navegador. Esta copia de la reserva está para su comodidad. Para que pueda regresar a los datos de su reserva, sí visita Casa Vitini desde el mismo navegador y dispositivo donde realizó la reserva. Si desea borrar esta copia almacenada en la memoria local de su navegador, puede hacerlo pulsando el botón de abajo para eliminar o, eliminando la caché de su navegador. Recuerde que si se registra y obtiene su VitiniID puede acceder a una copia de su reserva siempre que quiera. Para ello, debe de registrarse con la misma dirección de correo electrónico con la que confirmó la reserva.`

        const botonAceptar = constructor.querySelector("[boton=aceptar]")
        botonAceptar.textContent = "Eliminar esta copia de la reserva almacenada localmente en mi navegador 11"
        botonAceptar.addEventListener("click", () => {
            localStorage.removeItem("reservaConfirmada")
            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
            const navegacion = {
                vista: "/alojamiento",
                tipoOrigen: "menuNavegador"
            }
            return casaVitini.shell.navegacion.controladorVista(navegacion)
        })
        const botonCancelar = constructor.querySelector("[boton=cancelar]")
        botonCancelar.textContent = "Cancelar, no eliminar y volver atras"

    },
    reservaConfirmadaUI: async function () {
    },
    obtenerMensajePrincipal: async function () {
        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "plaza/reservas/mensajeReservaConfirmada"
        })
        if (respuestaServidor?.error) {
            return respuestaServidor.error
        } else if (respuestaServidor.ok) {
            const mensajePrincipalEnReservaConfirmada = respuestaServidor.ok.mensajePrincipalEnReservaConfirmada
            return mensajePrincipalEnReservaConfirmada
        }
    },
    alojamiento: {
        rednerizar: function (data) {
            const reservaConfirmada = data.reservaConfirmada
            const destino = data.e
            const alojamiento = reservaConfirmada.alojamiento
            const caracteristicasPorApartamento = reservaConfirmada.caracteristicasPorApartamento
            const complementosDeAlojamiento = reservaConfirmada.complementosDeAlojamiento
            const informacionPublicaPorApartamento = reservaConfirmada.informacionPublicaPorApartamento

            Object.entries(alojamiento).forEach(a => {
                const [apartamentoIDV, contenedor] = a

                const apartamentoUI = contenedor.apartamentoUI
                const habitaciones = contenedor.habitaciones

                const aUI = this.alojamientoUI({
                    titulo: apartamentoUI,
                    apartamentoIDV,
                    informacionPublicaDelApartamento: informacionPublicaPorApartamento[apartamentoIDV]
                })
                destino.appendChild(aUI)
                const cHabitaciones = aUI.querySelector("[contenedor=habitaciones]")

                Object.values(habitaciones).forEach(h => {
                    const habitacionUI = h.habitacionUI
                    const habitacionUID = h.habitacionUID
                    const camaCompartida = h.camas.compartida.camaUI
                    const hUI = this.habitacionUI({
                        titulo: habitacionUI,
                        habitacionUID
                    })
                    cHabitaciones.appendChild(hUI)
                    const cCamas = hUI.querySelector("[contenedor=camas]")

                    const cUI = this.camaUI({
                        titulo: camaCompartida
                    })
                    cCamas.appendChild(cUI)
                })

                const cCaracteristicas = aUI.querySelector("[contenedor=caracteristicas]")
                const cDA = caracteristicasPorApartamento[apartamentoIDV]
                cDA.forEach(c => {
                    const caracteristicaUI = c.caracteristicaUI
                    const cUI = this.caracteristicaUI({
                        titulo: caracteristicaUI
                    })
                    cCaracteristicas.appendChild(cUI)
                })
            })

            for (const c of complementosDeAlojamiento) {

                const complementoUI = c.complementoUI
                const tipoUbicacion = c.tipoUbicacion
                const apartamentoIDV = c.apartamentoIDV

                const aUI = destino.querySelector(`[apartamentoIDV="${apartamentoIDV}"]`)
                if (!aUI) {
                    continue
                }

                if (tipoUbicacion === "alojamiento") {
                    const cCom = aUI.querySelector("[contenedor=complementos]")
                    cCom.classList.remove("ocultoInicial")
                    const cComUI = this.complementoUI({
                        titulo: complementoUI
                    })
                    cCom.appendChild(cComUI)
                } else if (tipoUbicacion === "habitacion") {
                    const habitacionUID = c.habitacionUID
                    const cCom = aUI.querySelector(`[habitacionUID="${habitacionUID}"]`).querySelector("[contenedor=complementos]")
                    cCom.classList.remove("ocultoInicial")
                    const cComUI = this.complementoUI({
                        titulo: complementoUI
                    })
                    cCom.appendChild(cComUI)
                }
            }

        },
        alojamientoUI: function (data) {
            const titulo = data.titulo
            const apartamentoIDV = data.apartamentoIDV
            const iPDP = data.informacionPublicaDelApartamento
            const apartamentoUIPublico = iPDP.apartamentoUIPublico
            const definicionPublica = iPDP.definicionPublica

            const ui = document.createElement("div")
            ui.classList.add("flexVertical", "padding16", "borderRadius16", "backgroundWhite3", "gap10")
            ui.setAttribute("apartamentoIDV", apartamentoIDV)

            const nP = document.createElement("div")
            nP.classList.add("negrita", "fontSize20")
            nP.textContent = apartamentoUIPublico
            ui.appendChild(nP)

            const cIP = document.createElement("div")
            cIP.classList.add("flexVertical")
            ui.appendChild(cIP)



            const dP = document.createElement("div")
            dP.classList.add("negrita")
            dP.textContent = definicionPublica
            cIP.appendChild(dP)

            const t = document.createElement("div")
            t.classList.add("negrita", "colorGris")
            t.textContent = titulo
            cIP.appendChild(t)

            const cC = document.createElement("div")
            cC.classList.add()
            cC.setAttribute("contenedor", "caracteristicas")
            ui.appendChild(cC)

            const cCT = document.createElement("div")
            cCT.classList.add("colorAzul", "negrita")
            cCT.textContent = "Características del alojamiento"
            cCT.setAttribute("contenedor", "caracteristicas")
            cC.appendChild(cCT)



            const cCom = document.createElement("div")
            cCom.classList.add("ocultoInicial")
            cCom.setAttribute("contenedor", "complementos")
            ui.appendChild(cCom)

            const cComT = document.createElement("div")
            cComT.classList.add("colorAzul", "negrita")
            cComT.textContent = "Complementos del alojamiento"
            cComT.setAttribute("contenedor", "caracteristicas")
            cCom.appendChild(cComT)

            const cH = document.createElement("div")
            cH.classList.add("flexVertical", "gap10")
            cH.setAttribute("contenedor", "habitaciones")
            ui.appendChild(cH)

            return ui

        },
        habitacionUI: function (data) {
            const titulo = data.titulo
            const habitacionUID = data.habitacionUID

            const ui = document.createElement("div")
            ui.setAttribute("habitacionUID", habitacionUID)
            ui.classList.add("flexVertical", "gap10")

            const t = document.createElement("div")
            t.classList.add("negrita")
            t.textContent = titulo
            ui.appendChild(t)

            const cCom = document.createElement("div")
            cCom.classList.add("ocultoInicial")
            cCom.setAttribute("contenedor", "complementos")
            ui.appendChild(cCom)

            const cComT = document.createElement("div")
            cComT.classList.add("colorAzul", "negrita")
            cComT.textContent = "Complementos del la hahbitación"
            cComT.setAttribute("contenedor", "caracteristicas")
            cCom.appendChild(cComT)

            const c = document.createElement("div")
            c.classList.add()
            c.setAttribute("contenedor", "camas")
            ui.appendChild(c)

            return ui

        },
        camaUI: function (data) {
            const titulo = data.titulo

            const ui = document.createElement("div")
            ui.classList.add("flexVertical")


            const t = document.createElement("div")
            t.classList.add("colorAzul", "negrita")
            t.textContent = "Cama seleccionada"
            t.setAttribute("contenedor", "caracteristicas")
            ui.appendChild(t)

            const c = document.createElement("div")
            c.classList.add()
            c.textContent = titulo
            ui.appendChild(c)

            return ui

        },
        caracteristicaUI: function (data) {
            const titulo = data.titulo

            const ui = document.createElement("div")
            ui.classList.add("flexVertical")

            const t = document.createElement("div")
            t.classList.add()
            t.textContent = titulo
            ui.appendChild(t)

            return ui

        },
        complementoUI: function (data) {
            const titulo = data.titulo

            const ui = document.createElement("div")
            ui.classList.add("flexVertical")

            const t = document.createElement("div")
            t.classList.add()
            t.textContent = titulo
            ui.appendChild(t)

            return ui

        }
    }
}