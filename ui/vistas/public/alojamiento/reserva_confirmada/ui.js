casaVitini.view = {
    start: async function () {
        const reservaConfirmada = JSON.parse(localStorage.getItem("reservaConfirmada"))
        if (reservaConfirmada) {
            const main = document.querySelector("main")
            main.setAttribute("zonaCSS", "/alojamiento/reserva_confirmada")

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

            const marcoElastico = document.createElement("div")
            marcoElastico.classList.add("marcoElastico")
            marcoElastico.setAttribute("contenedor", "reservaconfirmada")

            const titulo = document.createElement("div")
            titulo.classList.add("tituloGrande", "padding10", "textoCentrado")
            titulo.style.fontSize = "30px"
            titulo.textContent = "Solicitud de reserva recibida"
            marcoElastico.appendChild(titulo)


            const infoGlobal = document.createElement("div")
            infoGlobal.classList.add("plaza_reservas_reservaConfirmada_infoGlobal")
            infoGlobal.textContent = "Su reserva está confirmada y le estamos esperando. Aquí tiene los detalles de su reserva. Puede descargar un resumen de su reserva en formato de documento PDF. Su reserva se ha registrado junto a su correo electrónico. Si desea ver con más detalle su reserva puede crear una cuenta en MiCasa para poder ver todos los detalles de su reserva. Si necesita contactar con Casa Vitini puede encontrar toda la información de contacto en la sección Contacto. Se ha enviado una copia del resumen de su reserva a su dirección de correo electrónico."


            const infoIngreso = document.createElement("pre")
            infoIngreso.classList.add("plaza_reservas_reservaConfirmada_infoIngreso")

            const spinner = casaVitini.ui.componentes.spinnerSimple()
            infoIngreso.appendChild(spinner)

            const mensajePrincipal = await this.obtenerMensajePrincipal()
            infoIngreso.innerHTML = null
            infoIngreso.textContent = mensajePrincipal

            marcoElastico.appendChild(infoIngreso)
            const contenedor = document.createElement("div")
            contenedor.classList.add("plaza_reservas_reservaConfirmada_contenedor")
            const espacioDatosGlobalesReserva = document.createElement("div")
            espacioDatosGlobalesReserva.classList.add("administracion_reservas_detallesReservas_contenedorTotales")
            espacioDatosGlobalesReserva.setAttribute("contenedor", "espacioDatosGlobalesReserva")
            const reversaUI = document.createElement("div")
            reversaUI.classList.add("administracion_reservas_detallesReservas_contenedorReservaUID")
            const nombreReserva = document.createElement("div")
            nombreReserva.textContent = "Reserva"
            reversaUI.appendChild(nombreReserva)
            const numeroReservaUID = document.createElement("div")
            numeroReservaUID.classList.add("administracion_reservas_detallesReservas_contenedorResevaUID_UID")
            numeroReservaUID.classList.add("negrita")
            numeroReservaUID.textContent = reservaUID
            reversaUI.appendChild(numeroReservaUID)
            espacioDatosGlobalesReserva.appendChild(reversaUI)
            const botonDescargarPDF = document.createElement("a")
            botonDescargarPDF.classList.add("botonV1")
            botonDescargarPDF.textContent = "Descargar un resumen de la solicitud de la reserva en PDF"
            botonDescargarPDF.download = "Reserva.pdf"
            botonDescargarPDF.href = `data:application/pdf;base64,${pdfCodificado}`

            espacioDatosGlobalesReserva.appendChild(botonDescargarPDF)

            const contenedorTitular = document.createElement("div")
            contenedorTitular.classList.add("plaza_reservas_reservaConfirmada_contenedorTitular")
            const infoTitular = document.createElement("div")
            infoTitular.classList.add("plaza_reservas_reservaConfirmada_infoTitular")
            infoTitular.textContent = "Datos del titular de la reserva"

            const contenedorDatosDelTitular = document.createElement("div")
            contenedorDatosDelTitular.classList.add("plaza_reservas_reservaConfirmada_contenedorTitular_contenedorDatosDelTitular")
            let bloqueDatoTitular = document.createElement("div")
            bloqueDatoTitular.classList.add("plaza_reservas_reservaConfirmada_contenedorTitular_contenedorDatosDelTitular_bloque")
            let bloqueTituloTitular = document.createElement("div")
            bloqueTituloTitular.classList.add("plaza_reservas_reservaConfirmada_contenedorTitular_contenedorDatosDelTitular_bloqueTitulo")
            bloqueTituloTitular.textContent = "Nombre y apellidos"
            bloqueDatoTitular.appendChild(bloqueTituloTitular)
            const nombreTitularUI = document.createElement("div")
            nombreTitularUI.classList.add("negrita")
            nombreTitularUI.textContent = nombreTitular
            bloqueDatoTitular.appendChild(nombreTitularUI)
            contenedorDatosDelTitular.appendChild(bloqueDatoTitular)
            bloqueDatoTitular = document.createElement("div")
            bloqueDatoTitular.classList.add("plaza_reservas_reservaConfirmada_contenedorTitular_contenedorDatosDelTitular_bloque")
            bloqueTituloTitular = document.createElement("div")
            bloqueTituloTitular.classList.add("plaza_reservas_reservaConfirmada_contenedorTitular_contenedorDatosDelTitular_bloqueTitulo")
            bloqueTituloTitular.textContent = "Pasaporte"
            bloqueDatoTitular.appendChild(bloqueTituloTitular)
            const pasaporteTitularUI = document.createElement("div")
            pasaporteTitularUI.classList.add("negrita")
            pasaporteTitularUI.textContent = pasaporteTitular
            bloqueDatoTitular.appendChild(pasaporteTitularUI)
            //  contenedorDatosDelTitular.appendChild(bloqueDatoTitular)
            bloqueDatoTitular = document.createElement("div")
            bloqueDatoTitular.classList.add("plaza_reservas_reservaConfirmada_contenedorTitular_contenedorDatosDelTitular_bloque")
            bloqueTituloTitular = document.createElement("div")
            bloqueTituloTitular.classList.add("plaza_reservas_reservaConfirmada_contenedorTitular_contenedorDatosDelTitular_bloqueTitulo")
            bloqueTituloTitular.textContent = "Correo electroníco"
            bloqueDatoTitular.appendChild(bloqueTituloTitular)
            const mailTitularUI = document.createElement("div")
            mailTitularUI.classList.add("negrita")
            mailTitularUI.textContent = mailTitular
            bloqueDatoTitular.appendChild(mailTitularUI)
            contenedorDatosDelTitular.appendChild(bloqueDatoTitular)
            bloqueDatoTitular = document.createElement("div")
            bloqueDatoTitular.classList.add("plaza_reservas_reservaConfirmada_contenedorTitular_contenedorDatosDelTitular_bloque")
            bloqueTituloTitular = document.createElement("div")
            bloqueTituloTitular.classList.add("plaza_reservas_reservaConfirmada_contenedorTitular_contenedorDatosDelTitular_bloqueTitulo")
            bloqueTituloTitular.textContent = "Teléfono"
            bloqueDatoTitular.appendChild(bloqueTituloTitular)
            const telefonoTitularUI = document.createElement("div")
            telefonoTitularUI.classList.add("negrita")
            telefonoTitularUI.textContent = telefonoTitular
            bloqueDatoTitular.appendChild(telefonoTitularUI)
            contenedorDatosDelTitular.appendChild(bloqueDatoTitular)
            contenedorTitular.appendChild(contenedorDatosDelTitular)
            espacioDatosGlobalesReserva.appendChild(contenedorTitular)

            const contenedorFechas = document.createElement("div")
            contenedorFechas.classList.add("plaza_reservas_reservaConfirmada_contenedorFechas")

            const contenedorFechaEntrada = document.createElement("div")
            contenedorFechaEntrada.classList.add("plaza_reservas_reservaConfirmada_contenedorFechas_contenedorFecha")
            const tituloFechaEntrada = document.createElement("div")
            tituloFechaEntrada.classList.add("plaza_reservas_reservaConfirmada_contenedorFechas_contenedorFecha_titulo")
            tituloFechaEntrada.textContent = "Fecha de entrada"
            contenedorFechaEntrada.appendChild(tituloFechaEntrada)
            const fechaEntradaUI = document.createElement("div")
            fechaEntradaUI.classList.add("plaza_reservas_reservaConfirmada_contenedorFechas_contenedorFecha_fecha")
            fechaEntradaUI.classList.add("negrita")
            fechaEntradaUI.textContent = fechaEntrada_Humana
            contenedorFechaEntrada.appendChild(fechaEntradaUI)
            contenedorFechas.appendChild(contenedorFechaEntrada)

            const contenedorFechaSalida = document.createElement("div")
            contenedorFechaSalida.classList.add("plaza_reservas_reservaConfirmada_contenedorFechas_contenedorFecha")
            const tituloFechaSalida = document.createElement("div")
            tituloFechaSalida.classList.add("plaza_reservas_reservaConfirmada_contenedorFechas_contenedorFecha_titulo")
            tituloFechaSalida.textContent = "Fecha de salida"
            contenedorFechaSalida.appendChild(tituloFechaSalida)
            const fechaSalidaUI = document.createElement("div")
            fechaSalidaUI.classList.add("plaza_reservas_reservaConfirmada_contenedorFechas_contenedorFecha_fecha")
            fechaSalidaUI.classList.add("negrita")
            fechaSalidaUI.textContent = fechaSalida_Humana
            contenedorFechaSalida.appendChild(fechaSalidaUI)
            contenedorFechas.appendChild(contenedorFechaSalida)
            espacioDatosGlobalesReserva.appendChild(contenedorFechas)

            contenedor.appendChild(espacioDatosGlobalesReserva)
            marcoElastico.appendChild(contenedor)
            const infoGlobal2 = document.createElement("div")
            infoGlobal2.classList.add("plaza_reservas_reservaConfirmada_infoGlobal")
            infoGlobal2.textContent = `Tu reserva se guarda localmente en tu navegador. Si no borras la caché o eliminas la reserva manualmente, seguirá ahí para tu comodidad. También puedes registrarte y crear una cuenta en MiCasa con el mismo correo para acceder a los detalles de tus reservas desde cualquier lugar. Si usas un dispositivo público, asegúrate de borrar la caché. ¡Crear un VitiniID es gratis!`
            marcoElastico.appendChild(infoGlobal2)
            const infoGlobal3 = document.createElement("div")
            infoGlobal3.classList.add("plaza_reservas_reservaConfirmada_infoGlobal")
            infoGlobal3.textContent = "Cree su propio VitiniID y acceda a los detalles de su reserva de manera persistente y desde cualquier lugar. Recuerde registrarse con la misma cuenta de correo electrónico con la que realizó la reserva. Puedes cambiar su cuenta de correo electrónico en cualquier momento desde su cuenta con su VitiniID. Registrar su propio VitiniID es gratuito."

            const botonBorrarReserva = document.createElement("div")
            botonBorrarReserva.classList.add("plaza_reservas_reservaConfirmada_botonV1")
            botonBorrarReserva.textContent = "Borrar la información de esta solicitud navegador"
            botonBorrarReserva.addEventListener("click", () => {
                this.borrarReservaLocal()
            })
            marcoElastico.appendChild(botonBorrarReserva)
            marcoElasticoRelatico.appendChild(marcoElastico)
            const seccion = document.querySelector("main")
            //seccion.innerHTML = null
            seccion.appendChild(marcoElasticoRelatico)

            const contenedorTotal = document.createElement("div")
            contenedorTotal.classList.add("contenedorTotal")
            const tituloTotal = document.createElement("p")
            tituloTotal.classList.add("tituloContenedor")
            tituloTotal.textContent = "Total de la reserva"
            contenedorTotal.appendChild(tituloTotal)
            const totalReserva = document.createElement("p")
            totalReserva.classList.add("totalReserva")
            totalReserva.textContent = totalFinal + "$"
            contenedorTotal.appendChild(totalReserva)
            const masInfo = document.createElement("p")
            masInfo.classList.add("botonV1")
            masInfo.textContent = "Abrir desglose del total (Si desea ver el detalle del total pulse aquí)"
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
            espacioDatosGlobalesReserva.appendChild(contenedorTotal)
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
            botonIniciarReserva.setAttribute("vista", "/alojamiento")
            botonIniciarReserva.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            marcoElastico.appendChild(botonIniciarReserva)
            const botonIrARegistrarse = document.createElement("a")
            botonIrARegistrarse.classList.add("botonV1BlancoIzquierda")
            botonIrARegistrarse.textContent = "Ir a crear una cuenta a MiCasa"
            botonIrARegistrarse.setAttribute("href", "/micasa/crear_nueva_cuenta")
            botonIrARegistrarse.setAttribute("vista", "/micasa/crear_nueva_cuenta")
            botonIrARegistrarse.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            marcoElastico.appendChild(botonIrARegistrarse)
            const botonInciarSession = document.createElement("a")
            botonInciarSession.classList.add("botonV1BlancoIzquierda")
            botonInciarSession.textContent = "Iniciar session con mi VitiniID en MiCasa"
            botonInciarSession.setAttribute("href", "/micasa")
            botonInciarSession.setAttribute("vista", "/micasa")
            botonInciarSession.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
            marcoElastico.appendChild(botonInciarSession)
            marcoElasticoRelatico.appendChild(marcoElastico)
            const seccion = document.querySelector("main")
            seccion.innerHTML = null
            seccion.appendChild(marcoElasticoRelatico)
        }

    },
    borrarReservaLocal: () => {
        document.body.style.overflow = 'hidden';
        const advertenciaInmersivaIU = document.createElement("div")
        advertenciaInmersivaIU.setAttribute("class", "advertenciaInmersiva")
        advertenciaInmersivaIU.setAttribute("componente", "advertenciaInmersiva")
        advertenciaInmersivaIU.setAttribute("contenedor", "opcionesCancelacion")
        const contenedorAdvertenciaInmersiva = document.createElement("div")
        contenedorAdvertenciaInmersiva.classList.add("contenedorAdvertencaiInmersiva")
        const contenidoAdvertenciaInmersiva = document.createElement("div")
        contenidoAdvertenciaInmersiva.classList.add("contenidoAdvertenciaInmersiva")
        contenidoAdvertenciaInmersiva.setAttribute("contenedor", "contenidoAdvertenciaInmersiva")
        const contenedorCancelacion = document.createElement("div")
        contenedorCancelacion.classList.add("administracion_reservas_detallesReservas_cancelarReserva_contenedorCancelacion")
        const tituloCancelarReserva = document.createElement("p")
        tituloCancelarReserva.classList.add("tituloGris")
        tituloCancelarReserva.textContent = "Borrar esta copia de mi reserva"
        contenedorCancelacion.appendChild(tituloCancelarReserva)
        const infoEliminarReserva = document.createElement("div")
        infoEliminarReserva.classList.add("detallesReservaCancelarReservaTituloBloquoApartamentos")
        infoEliminarReserva.style.marginTop = "0px"
        infoEliminarReserva.textContent = "Cuando realizas una reserva y la confirmas. Una copia de la reserva se guarda en tu navegador en el almacén de memoria local que tiene el navegador. Esta copia de la reserva está para su comodidad. Para que pueda regresar a los datos de su reserva, sí visita Casa Vitini desde el mismo navegador donde realizó la reserva. Si desea borrar esta copia almacenada en la memoria local de su navegador, puede hacerlo pulsando el botón de abajo para eliminar o eliminando la cache de su navegador. Recuerde que si se registra y obtiene su VitiniID puede acceder a una copia de su reserva siempre que quiera. Para ello, debe de registrarse con la misma dirección de correo electrónico con la que confirmó la reserva."
        contenedorCancelacion.appendChild(infoEliminarReserva)
        const botonEliminarReserva = document.createElement("div")
        botonEliminarReserva.classList.add("botonV1")
        botonEliminarReserva.setAttribute("componente", "botonConfirmarCancelarReserva")
        botonEliminarReserva.textContent = "Eliminar esta copia de la reserva almacenada localmente en mi navegador"
        botonEliminarReserva.addEventListener("click", () => {
            localStorage.removeItem("reservaConfirmada")
            casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()
            const navegacion = {
                vista: "/alojamiento",
                tipoOrigen: "menuNavegador"
            }
            return casaVitini.shell.navegacion.controladorVista(navegacion)
        }
        )
        contenedorCancelacion.appendChild(botonEliminarReserva)
        const botonCancelarProcesoCancelacion = document.createElement("div")
        botonCancelarProcesoCancelacion.classList.add("botonV1")
        botonCancelarProcesoCancelacion.textContent = "Cancelar, no eliminar y volver atras"
        botonCancelarProcesoCancelacion.addEventListener("click", casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas)
        contenedorCancelacion.appendChild(botonCancelarProcesoCancelacion)
        contenidoAdvertenciaInmersiva.appendChild(contenedorCancelacion)
        contenedorAdvertenciaInmersiva.appendChild(contenidoAdvertenciaInmersiva)
        advertenciaInmersivaIU.appendChild(contenedorAdvertenciaInmersiva)
        document.querySelector("main").appendChild(advertenciaInmersivaIU)
    },
    reservaConfirmadaUI: async () => {
    },
    obtenerMensajePrincipal: async () => {
        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "plaza/reservas/mensajeReservaConfirmada"
        })
        if (respuestaServidor?.error) {
            return respuestaServidor.error
        } else if (respuestaServidor.ok) {
            const mensajePrincipalEnReservaConfirmada = respuestaServidor.ok.mensajePrincipalEnReservaConfirmada
            return mensajePrincipalEnReservaConfirmada
        }
    }
}