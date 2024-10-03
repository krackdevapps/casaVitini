import { DateTime } from "luxon";
import Decimal from "decimal.js";
import { validadoresCompartidos } from "../../validadores/validadoresCompartidos.mjs";
export const porDiasDeReserva = async (reserva) => {
    try {
        const fechaEntradaReserva_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(reserva.fechas.entrada)).fecha_ISO
        const fechaSalidaReserva_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(reserva.fechas.salida)).fecha_ISO
        const totalReservaNeto = new Decimal(reserva.desgloseFinanciero.totales.totalReservaNeto)
        const fechaActualTZ = reserva.fechas.fechaActualProcesada_ISO
        const estadoOfertaActivado = "activada"



        const ofertasTipo = "porDiasDeReserva";
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
                cantidad: cantidad,
                numero: numero,
                simboloNumero: simboloNumero,
                tipoOferta: tipoOferta
            }
            const fechaEntradaReservaObjeto = DateTime.fromISO(fechaEntradaReserva_ISO);
            const fechaSalidaReservaObjeto = DateTime.fromISO(fechaSalidaReserva_ISO);
            const diasDeLaReserva = Math.floor(fechaSalidaReservaObjeto.diff(fechaEntradaReservaObjeto, 'days').days);
            let descuentoUI
            if (tipoDescuento === "porcentaje") {
                descuentoUI = `del ${cantidad}%`
            }
            if (tipoDescuento === "cantidadFija") {
                descuentoUI = `de ${cantidad}$`
            }
            if (simboloNumero === "aPartirDe" && numero <= diasDeLaReserva) {
                ofertaEstructuraFinal.definicion = `Oferta aplicada a reserva con ${numero} dias de duración o más.`
                ofertasSeleccionadas.push(ofertaEstructuraFinal)
            }
            if (simboloNumero === "numeroExacto" && numero === diasDeLaReserva) {
                ofertaEstructuraFinal.definicion = `Oferta aplicada a reserva con ${numero} días de duración concretamente.`
                ofertasSeleccionadas.push(ofertaEstructuraFinal)
            }
        }
        let descuentoGlobal = new Decimal("0.00")
        for (const detallesOferta of ofertasSeleccionadas) {
            const tipoDescuento = detallesOferta.tipoDescuento
            const cantidad = new Decimal(detallesOferta.cantidad)
            if (tipoDescuento === "cantidadFija") {
                descuentoGlobal = descuentoGlobal.plus(cantidad)
                detallesOferta.descuento = `${descuentoGlobal}`
            }
            if (tipoDescuento === "porcentaje") {
                descuentoGlobal = cantidad.dividedBy(100).times(totalReservaNeto)
                detallesOferta.descuento = `${descuentoGlobal}`
            }
        }
        const estructuraSaliente = {
            porDiasDeReserva: ofertasSeleccionadas,
            descuentoGlobal: descuentoGlobal
        }
        return estructuraSaliente
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
