import Decimal from "decimal.js";
import { obtenerOfertasPorFechaPorEstadoPorTipo } from "../../../repositorio/ofertas/perfiles/obtenerOfertasPorFechaPorEstadoPorTipo.mjs";
export const porNumeroDeApartamentos = async (reserva) => {
    try {
        const fechaActualTZ = reserva.fechas.fechaActualProcesada_ISO
        const estadoOfertaActivado = "activada"
        const totalReservaNeto = new Decimal(reserva.desgloseFinanciero.totales.totalReservaNeto)
        const numeroApartamentos = Number(reserva.desgloseFinanciero.totalesPorApartamento.length)
        const ofertasSeleccionadas = []
        let descuentoGlobal = 0

        const ofertaTipo = "porNumeroDeApartamentos";
        const ofertasEncontradas = await obtenerOfertasPorFechaPorEstadoPorTipo({
            fechaActualTZ: fechaActualTZ,
            estadoOfertaActivado: estadoOfertaActivado,
            ofertaTipo: ofertaTipo
        })
        // Filtro Ofertas
        for (const detallesOferta of ofertasEncontradas) {
            const tipoOferta = detallesOferta.tipoOferta
            const simboloNumero = detallesOferta.simboloNumero
            const numero = Number(detallesOferta.numero)
            const nombreOferta = detallesOferta.nombreOferta
            const tipoDescuento = detallesOferta.tipoDescuento
            const cantidad = new Decimal(detallesOferta.cantidad)
            const estructuraOferta = {
                nombreOferta: nombreOferta,
                tipoDescuento: tipoDescuento,
                tipoOferta: tipoOferta,
                cantidad: cantidad.toFixed(2)
            }
            if (simboloNumero === "aPartirDe" && numero <= numeroApartamentos) {
                estructuraOferta.definicion = `Oferta aplicada a reserva con ${numero} o mas apartamentos`
                ofertasSeleccionadas.push(estructuraOferta)
            }
            if (simboloNumero === "numeroExacto" && numero === numeroApartamentos) {
                estructuraOferta.definicion = `Oferta aplicada a reserva con ${numero} apartamentos`
                ofertasSeleccionadas.push(estructuraOferta)
            }
        }
        // Calculo ofertas
        for (const detallesOferta of ofertasSeleccionadas) {
            const tipoDescuento = detallesOferta.tipoDescuento
            const cantidad = new Decimal(detallesOferta.cantidad)
            if (tipoDescuento === "cantidadFija") {
                descuentoGlobal = cantidad.plus(descuentoGlobal);
                detallesOferta.descuento = cantidad.toFixed(2) + "$"
            }
            if (tipoDescuento === "porcentaje") {
                descuentoGlobal = cantidad.dividedBy(100).times(totalReservaNeto).plus(descuentoGlobal);
                detallesOferta.descuento = descuentoGlobal.toFixed(2)
            }
        }
        const estructuraSaliente = {
            porNumeroDeApartamentos: ofertasSeleccionadas,
            descuentoGlobal: descuentoGlobal
        }
        return estructuraSaliente
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
