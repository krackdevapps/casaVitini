import { DateTime } from "luxon";
import Decimal from "decimal.js";
import { codigoZonaHoraria } from "../../configuracion/codigoZonaHoraria.mjs"
import { validadoresCompartidos } from "../../validadores/validadoresCompartidos.mjs";
export const porDiasDeAntelacion = async (reserva) => {
    try {
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
        const fechaEntradaReserva_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: reserva.fechas.fechaEntrada,
            nombreCampo: "La fecha de entrada de la reserva"
        })
        const fechaSalidaReserva_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: reserva.fechas.fechaSalida,
            nombreCampo: "La fecha de salida de la reserva"
        })
        const totalReservaNeto = new Decimal(reserva.desgloseFinanciero.totales.totalReservaNeto)
        const fechaActualTZ = reserva.fechas.fechaActualProcesada_ISO
        const fechaActual_objeto = DateTime.fromISO(fechaActualTZ).setZone(zonaHoraria);
        const estadoOfertaActivado = "activada"

        // Mucho ojo en las ofertas de tipo1 por que se activan revisando la fecha actual, es decir la fecha de cuando se realiza la reserva y no las fechas de inicio y fin de la reserva, eso se revisa mas adelante
        // Acuerdate por que esta parte es un poco contraintuitiva.
        const ofertasTipo = "porDiasDeAntelacion";
        const ofertasEncontradas = await obtenerOfertasPorFechaPorEstadoPorTipo({
            fechaActualTZ: fechaActualTZ,
            estadoOfertaActivado: estadoOfertaActivado,
            ofertaTipo: ofertasTipo
        })
        const ofertasSeleccionadas = []

        for (const detallesOferta of ofertasEncontradas) {
            const simboloNumero = detallesOferta.simboloNumero
            const numero = Number(detallesOferta.numero)
            const nombreOferta = detallesOferta.nombreOferta
            const tipoDescuento = detallesOferta.tipoDescuento
            const cantidad = detallesOferta.cantidad
            const tipoOferta = detallesOferta.tipoOferta
            const ofertaEstructuraFinal = {
                nombreOferta: nombreOferta,
                tipoDescuento: tipoDescuento,
                tipoOferta: tipoOferta,
                cantidad: cantidad
            }
            const fechaEntrada_Objeto = DateTime.fromISO(fechaEntradaReserva_ISO, { zone: codigoZonaHoraria.zonaHoraria });

            const diasAntelacion = Math.floor(fechaEntrada_Objeto.diff(fechaActual_objeto, 'days').days);
            if (simboloNumero === "aPartirDe" && numero <= diasAntelacion) {
                ofertaEstructuraFinal.definicion = `Oferta aplicada a reserva con ${numero} dias de antelacion o mas `
                ofertasSeleccionadas.push(ofertaEstructuraFinal)
            }
            if (simboloNumero === "numeroExacto" && numero === diasAntelacion) {
                ofertaEstructuraFinal.definicion = `Oferta aplicada a reserva con ${numero} dias de antelacion concretamente`
                ofertasSeleccionadas.push(ofertaEstructuraFinal)
            }
        }
        let descuentoGlobal = new Decimal("0.00")
        for (const detallesOferta of ofertasSeleccionadas) {
            const tipoDescuento = detallesOferta.tipoDescuento
            const cantidad = new Decimal(detallesOferta.cantidad)
            if (tipoDescuento === "cantidadFija") {
                descuentoGlobal = cantidad.plus(descuentoGlobal);
                detallesOferta.descuento = `${descuentoGlobal.toFixed(2)}`
            }
            if (tipoDescuento === "porcentaje") {
                descuentoGlobal = cantidad.dividedBy(100).times(totalReservaNeto)
                detallesOferta.descuento = `${descuentoGlobal.toFixed(2)}`
            }
        }
        const estructuraSaliente = {
            porDiasDeAntelacion: ofertasSeleccionadas,
            descuentoGlobal: descuentoGlobal
        }
        return estructuraSaliente
    } catch (errorCapturado) {
        throw errorCapturado
    }
}