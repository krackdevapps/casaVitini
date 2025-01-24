casaVitini.view = {
    arranque: async () => {
        const granuladoURL = casaVitini.utilidades.granuladorURL()
        const comandoInicial = granuladoURL.directorios[granuladoURL.directorios.length - 1]
        const instanciaUID = document.querySelector("main").getAttribute("instanciaUID")
        if (comandoInicial === "pagos") {
            return casaVitini.ui.vistas.pagos.pantallaInicial()
        }
        const contenedorEnlaceDePago = document.querySelector("main")
        const transaccion = {
            zona: "plaza/enlaceDePago/obtenerPago",
            pagoUID: comandoInicial
        }
        const respuestaServidor = await casaVitini.shell.servidor(transaccion)
        if (respuestaServidor?.error) {
            const tituloGlobal = document.createElement("div")
            tituloGlobal.classList.add("tituloGris")
            tituloGlobal.textContent = "Enlace de pago"
            contenedorEnlaceDePago.appendChild(tituloGlobal)
            const info = {
                titulo: "Información acerca de este enlace de pago",
                descripcion: respuestaServidor?.error
            }
            return casaVitini.ui.componentes.mensajeSimple(info)
        }
        if (respuestaServidor?.ok) {
            const detallesDelPago = respuestaServidor?.ok
            const pagoUID = detallesDelPago.codigo
            const reservaUID = detallesDelPago.reserva
            const totales = detallesDelPago.totales
            const detallesPagoParcial = detallesDelPago.pagoParcial




            const tituloGlobal = document.createElement("div")
            tituloGlobal.classList.add("tituloGris")
            tituloGlobal.textContent = "Realizar un pago"
            contenedorEnlaceDePago.appendChild(tituloGlobal)
            const marcoElasticoRelativo = document.createElement("div")
            marcoElasticoRelativo.classList.add("marcoElasticoRelativo")
            const marcoElastico = document.createElement("div")
            marcoElastico.classList.add("marcoElastico")
            const marcoPago = document.createElement("div")
            marcoPago.classList.add("plaza_enlacesDePago_marcoPago")
            marcoPago.setAttribute("espacio", "marcoPago")
            marcoPago.setAttribute("componente", "espacioPago")
            const info = document.createElement("p")
            info.classList.add("pagoPorEnlace_info")
            info.textContent = "Este enlace es un enlace para realizar un pago en Casa Vitini. El pago puede ser un pago completo de una reserva o un pago parcial si la reserva se paga a partes entre los pernoctantes. Por favor, revisa que los datos sean correctos y procede al pago. En esta página tienes dos secciones. La sección Detalles del pago, donde puedes ver el total bruto junto con el desglose de la cantidad que corresponde al neto como a la suma de impuestos aplicados. También tienes los detalles del total de la reserva a modo informativo para que tenga la visión global."
            marcoPago.appendChild(info)
            const contenedorReservaUID = document.createElement("div")
            contenedorReservaUID.classList.add("enlaceDePago_contendorReservaUID")
            const tituloReserva = document.createElement("div")
            tituloReserva.classList.add("enlaceDePago_tituloReserva")
            tituloReserva.classList.add("negrita")
            tituloReserva.textContent = "Identificador de la reserva"
            contenedorReservaUID.appendChild(tituloReserva)
            const identificadorReserva = document.createElement("div")
            identificadorReserva.classList.add("enlaceDePago_identificadorReserva")
            identificadorReserva.textContent = reservaUID
            contenedorReservaUID.appendChild(identificadorReserva)
            marcoPago.appendChild(contenedorReservaUID)
            const resolutorNombresTotales = {
                promedioNetoPorNoche: "Promedio neto por noche",
                totalReservaNetoSinOfertas: "Total neto de la reserva sin ofertas",
                totalReservaNeto: "Total reserva neto",
                totalDescuentos: "Total descuentos aplicados",
                totalImpuestos: "Total de la suma de los impuestos aplicados",
                totalConImpuestos: "Total bruto definitivo a pagar",
            }
            const resolutorNombresTotalesParciales = {
                netoParcial: "Total neto",
                impuestosParciales: "Impuestos",
                cantidadParcial: "Total bruto a pagar",
            }
            const contenedorPagoGlobal = document.createElement("div")
            contenedorPagoGlobal.classList.add("plaza_enlacesDePago_obtenerPago_contenedorPagoGlobal")
            contenedorPagoGlobal.setAttribute("pasarelaZonaDePago", "enlaceDePago")
            const contenedorPago = document.createElement("div")
            contenedorPago.classList.add("plaza_enlacesDePago_obtenerPago_contenedor")
            const tituloPago = document.createElement("div")
            tituloPago.classList.add("plaza_enlacesDePago_obtenerPago_informacionPago")
            tituloPago.classList.add("negrita")
            tituloPago.textContent = "Detalles del pago"
            contenedorPago.appendChild(tituloPago)
            const informacionPago = document.createElement("div")
            informacionPago.classList.add("plaza_enlacesDePago_obtenerPago_informacionPago")
            informacionPago.textContent = `Aquí tienes los detalles del pago. En total, el pago tiene una suma total de ${detallesPagoParcial.cantidadParcial}$. De este total, ${detallesPagoParcial.impuestosParciales}$ son impuestos y ${detallesPagoParcial.netoParcial}$ es el neto de este pago.`
            contenedorPago.appendChild(informacionPago)
            for (const [totalIDV, valorTotal] of Object.entries(detallesPagoParcial)) {
                const totalUI = resolutorNombresTotalesParciales[totalIDV]
                const contenedorTotal = document.createElement("div")
                contenedorTotal.classList.add("enlaceDePAgo_contenedorTotal")
                const tituloTotal = document.createElement("div")
                tituloTotal.classList.add("enlaceDePago_tituloTotal")
                tituloTotal.classList.add("negrita")
                tituloTotal.textContent = totalUI
                contenedorTotal.appendChild(tituloTotal)
                const valorTotalUI = document.createElement("div")
                valorTotalUI.classList.add("enlaceDePago_valorTotal")
                valorTotalUI.textContent = valorTotal + "$"
                contenedorTotal.appendChild(valorTotalUI)
                contenedorPago.appendChild(contenedorTotal)
            }
            contenedorPagoGlobal.appendChild(contenedorPago)
            const contenedorTotales = document.createElement("div")
            contenedorTotales.classList.add("plaza_enlacesDePago_obtenerPago_contenedor")
            contenedorTotales.setAttribute("pagoUID", pagoUID)
            const tituloPagoReserva = document.createElement("div")
            tituloPagoReserva.classList.add("plaza_enlacesDePago_obtenerPago_informacionPago")
            tituloPagoReserva.classList.add("negrita")
            tituloPagoReserva.textContent = "Detalles del total de la reserva"
            contenedorTotales.appendChild(tituloPagoReserva)
            const informacionPagoReserva = document.createElement("div")
            informacionPagoReserva.classList.add("plaza_enlacesDePago_obtenerPago_informacionPago")
            informacionPagoReserva.textContent = `Este apartado muestra el total de reserva a modo de información. Este apartado está a modo de recordatorio. El detalle del pago está en Detalles del pago en el apartado contiguo a este.`
            contenedorTotales.appendChild(informacionPagoReserva)
            for (const [totalIDV, valorTotal] of Object.entries(totales)) {
                const totalUI = resolutorNombresTotales[totalIDV]
                const contenedorTotal = document.createElement("div")
                contenedorTotal.classList.add("enlaceDePAgo_contenedorTotal")
                const tituloTotal = document.createElement("div")
                tituloTotal.classList.add("enlaceDePago_tituloTotal")
                tituloTotal.classList.add("negrita")
                tituloTotal.textContent = totalUI
                contenedorTotal.appendChild(tituloTotal)
                const valorTotalUI = document.createElement("div")
                valorTotalUI.classList.add("enlaceDePago_tituloTotal")
                valorTotalUI.textContent = valorTotal + "$"
                contenedorTotal.appendChild(valorTotalUI)
                if (valorTotal > 0) {
                    contenedorTotales.appendChild(contenedorTotal)
                }
            }
            contenedorPagoGlobal.appendChild(contenedorTotales)
            marcoPago.appendChild(contenedorPagoGlobal)
            marcoElastico.appendChild(marcoPago)
            marcoElasticoRelativo.appendChild(marcoElastico)
            contenedorEnlaceDePago.appendChild(marcoElasticoRelativo)
            const destino = "section [componente=espacioPago]"
            casaVitini.componentes.square.uiForm(destino)
            try {
                await casaVitini.componentes.square.crearSesionPago(instanciaUID);
                await casaVitini.componentes.square.inyectorSquareJS(instanciaUID);
                await casaVitini.componentes.square.inyectorMetodosPago(instanciaUID);
                await casaVitini.componentes.square.inyectorFlujoPago(instanciaUID);
            } catch (errorCapturado) {
                return casaVitini.ui.componentes.advertenciaInmersiva(errorCapturado.message)
            }
        }
    },
    pagoConfirmado: (detalles) => {
        const pagoUID = detalles?.pagoUID
        const contenedorEnlaceDePago = document.querySelector("section")
        contenedorEnlaceDePago.innerHTML = null
        const tituloGlobal = document.createElement("div")
        tituloGlobal.classList.add("tituloGris")
        tituloGlobal.textContent = "Pago realizado correctamente"
        contenedorEnlaceDePago.appendChild(tituloGlobal)
        const marcoElasticoRelativo = document.createElement("div")
        marcoElasticoRelativo.classList.add("marcoElasticoRelativo")
        const marcoElastico = document.createElement("div")
        marcoElastico.classList.add("marcoElastico")
        marcoElastico.style.gap = "6px"



        const marcoPago = document.createElement("div")
        marcoPago.classList.add("plaza_enlacesDePago_marcoPago")
        marcoPago.setAttribute("espacio", "marcoPago")
        marcoPago.setAttribute("componente", "espacioPago")
        const info = document.createElement("p")
        info.classList.add("pagoPorEnlace_info")
        info.textContent = "Gracias por finalizar el proceso de pago. Si lo necesita, puede ver en la parte inmediatamente inferior a este párrafo el código del pago por si lo necesita. El pago se ha asociado a su reserva."
        marcoPago.appendChild(info)
        const mensajeUI = document.createElement("p")
        mensajeUI.classList.add("pagoPorEnlace_info")
        mensajeUI.classList.add("negrita")
        mensajeUI.setAttribute("componente", "mensajeError")
        mensajeUI.textContent = "Identificador del pago: " + pagoUID
        marcoPago.appendChild(mensajeUI)
        marcoElastico.appendChild(marcoPago)
        marcoElasticoRelativo.appendChild(marcoElastico)
        contenedorEnlaceDePago.appendChild(marcoElasticoRelativo)
    },
    pantallaInicial: (metadatos) => {
        const error = metadatos?.error
        const codigo = metadatos?.codigo ? metadatos.codigo : ""
        const contenedorEnlaceDePago = document.querySelector("section")
        const tituloGlobal = document.createElement("div")
        tituloGlobal.classList.add("tituloGris")
        tituloGlobal.textContent = "Enlaces y codigos para realizar un pago"
        contenedorEnlaceDePago.appendChild(tituloGlobal)
        const marcoElasticoRelativo = document.createElement("div")
        marcoElasticoRelativo.classList.add("marcoElasticoRelativo")
        const marcoElastico = document.createElement("div")
        marcoElastico.classList.add("marcoElastico")
        marcoElastico.style.gap = "6px"
        marcoElastico.style.alignItems = "flex-start"


        const marcoPago = document.createElement("div")
        marcoPago.classList.add("plaza_enlacesDePago_marcoPago")
        marcoPago.setAttribute("espacio", "marcoPago")
        marcoPago.setAttribute("componente", "espacioPago")
        const info = document.createElement("p")
        info.classList.add("pagoPorEnlace_info")
        info.textContent = "En esta página puede realizar un pago con un código temporal asociado a su reserva. Si Casa Vitini le ha pasado un código temporal aleatorio para realizar un pago, insértelo en el formulario de abajo para iniciar el proceso de pago. Los enlaces caducan al cabo de un tiempo. Si tiene un enlace de pago y tras revisar que lo ha escrito correctamente, el sistema no encuentra los enlaces, puede que haya caducado."
        marcoPago.appendChild(info)
        if (error) {
            const mensajeUI = document.createElement("p")
            mensajeUI.classList.add("pagoPorEnlace_info")
            mensajeUI.classList.add("negrita")
            mensajeUI.setAttribute("componente", "mensajeError")
            mensajeUI.textContent = error
            marcoPago.appendChild(mensajeUI)
        }
        const campo = document.createElement("input")
        campo.classList.add("plaza_enlacesDePago_campo")
        campo.setAttribute("campo", "codigo")
        campo.placeholder = "Inserte su codigo temporal"
        campo.addEventListener("input", () => {
            document.querySelector("[componente=mensajeError]")?.remove()
        })
        campo.value = codigo
        marcoPago.appendChild(campo)
        marcoElastico.appendChild(marcoPago)
        const botonBuscar = document.createElement("div")
        botonBuscar.classList.add("plaza_enlacesDePago_botonV1")
        botonBuscar.textContent = "Comprobar codigo"
        botonBuscar.addEventListener("click", async () => {
            const selectorCampoCodigo = document.querySelector("[campo=codigo]")
            const codigoEnviar = selectorCampoCodigo.value
            if (codigoEnviar.length === 0) {
                const error = "Escribe un código para empezar. No has escrito ningún código para comprobar."
                return casaVitini.ui.componentes.advertenciaInmersiva(error)
            }
            const vista = "/pagos/" + codigoEnviar
            const navegacion = {
                vista: vista,
                tipoOrigen: "menuNavegador"
            }
            return casaVitini.shell.navegacion.controladorVista(navegacion)
        })
        marcoElastico.appendChild(botonBuscar)
        marcoElasticoRelativo.appendChild(marcoElastico)
        contenedorEnlaceDePago.appendChild(marcoElasticoRelativo)
    }
}