import Decimal from "decimal.js";
import { conexion } from "../../db.mjs";
const porNumeroDeApartamentos = async (reserva) => {
    try {
        const fechaActualTZ = reserva.fechas.fechaActualProcesada_ISO
        const estadoOfertaActivado = "activada"
        const totalReservaNeto = new Decimal(reserva.desgloseFinanciero.totales.totalReservaNeto)
        const numeroApartamentos = reserva.desgloseFinanciero.totalesPorApartamento.length
        const ofertasSeleccionadas = []
        let descuentoGlobal = 0
        const consultaOfertas = `
        SELECT 
        uid,
        to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
        to_char("fechaFin", 'DD/MM/YYYY') as "fechaFin",
        "simboloNumero",
        "descuentoAplicadoA",
        "estadoOferta",
        "tipoOferta",
        cantidad,
        numero,
        "tipoDescuento",
        "nombreOferta"
        FROM ofertas
        WHERE $1 BETWEEN "fechaInicio" AND "fechaFin"
        AND "estadoOferta" = $2
        AND "tipoOferta" = $3`;
        const ofertaTipo = "porNumeroDeApartamentos";
        const ofertasEncontradas = await conexion.query(consultaOfertas, [fechaActualTZ, estadoOfertaActivado, ofertaTipo]);
        // 
        // Filtro Ofertas
        for (const detallesOferta of ofertasEncontradas.rows) {
            const tipoOferta = detallesOferta.tipoOferta
            const simboloNumero = detallesOferta.simboloNumero
            const numero = detallesOferta.numero
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
    } catch (error) {
        throw error
    }
}
export {
    porNumeroDeApartamentos
}