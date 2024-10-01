import Decimal from "decimal.js";
import { validadoresCompartidos } from "../../validadores/validadoresCompartidos.mjs";
import { obtenerOfertasPorRangoFechaPorEstadoPorTipo } from "../../../infraestructure/repository/ofertas/perfiles/obtenerOfertasPorRangoDeFechaPorEstadoPorTipo.mjs";
const comprobarFechaEnRango = (fechaAComprobar_ISO, fechaInicio_ISO, fechaFin_ISO) => {
    const fechaObjetoAComprobar = new Date(fechaAComprobar_ISO);
    const fechaObjetoInicio = new Date(fechaInicio_ISO);
    const fechaObjetoFin = new Date(fechaFin_ISO);
    return fechaObjetoAComprobar >= fechaObjetoInicio && fechaObjetoAComprobar <= fechaObjetoFin;
}
export const porRangoDeFechas = async (reserva) => {

    const fechaEntradaReserva_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(reserva.fechas.entrada)).fecha_ISO
    const fechaSalidaReserva_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(reserva.fechas.salida)).fecha_ISO

    const fechaActualTZ = reserva.fechas.fechaActualProcesada_ISO
    const totalesPorNoche = reserva.desgloseFinanciero.totalesPorNoche
    const totalReservaNeto = new Decimal(reserva.desgloseFinanciero.totales.totalReservaNeto)
    const estadoOferta = "activado"
    const tipoOferta = "porRangoDeFechas"

    const ofertasEncontradas = await obtenerOfertasPorRangoFechaPorEstadoPorTipo({
        fechaSalidaReserva_ISO: fechaSalidaReserva_ISO,
        fechaEntradaReserva_ISO: fechaEntradaReserva_ISO,
        estadoOferta: estadoOferta,
        arrayDeTiposDeOferta: [tipoOferta],
    })

    // Creamos un array con los dias de la reserva y los apartamentos
    const ofertasSeleccionadas = ofertasEncontradas.rows
    let descuentoGlobal = new Decimal("0.00")
    for (const detallesOferta of ofertasEncontradas.rows) {
        delete detallesOferta.uid
        const fechaInicio = detallesOferta.fechaInicio_Humano
        const fechaFin = detallesOferta.fechaFin_Humano
        const fechaInicio_ISO = detallesOferta.fechaInicio_ISO
        const fechaFin_ISO = detallesOferta.fechaFin_ISO
        delete detallesOferta.fechaInicio_ISO
        delete detallesOferta.fechaFin_ISO
        const tipoOferta = detallesOferta.tipoOferta
        const cantidad = new Decimal(detallesOferta.cantidad)
        const tipoDescuento = detallesOferta.tipoDescuento
        const nombreOferta = detallesOferta.nombreOferta
        detallesOferta.diasAfectados = []
        let descuentoUI
        if (tipoDescuento === "porcentaje") {
            descuentoUI = `del ${cantidad}%`
        }
        if (tipoDescuento === "cantidadFija") {
            descuentoUI = `de ${cantidad}$`
        }
        detallesOferta.definicion = `Oferta aplicada a los días que están dentro del rango de la oferta. El rango de esta oferta empieza el ${fechaInicio} y acaba ${fechaFin}. Los días de las reservas que estén dentro del rango recibirán un descuento ${descuentoUI} sobre el total neto del día.`
        let descuento = new Decimal("0")
        for (const detalleNoche of totalesPorNoche) {
            const fechaDiaConNoche_Humana = detalleNoche.fechaDiaConNoche
            const fechaDiaConNoche_array = fechaDiaConNoche_Humana.split("/")
            const dia = fechaDiaConNoche_array[0].padStart(2, "0")
            const mes = fechaDiaConNoche_array[1].padStart(2, "0")
            const ano = fechaDiaConNoche_array[2]
            const fechaDiaConNoche_HumanaFormateada = `${dia}/${mes}/${ano}`
            const fechaDiaConNoche_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaDiaConNoche_HumanaFormateada)).fecha_ISO
            const apartamentosEnDiaConNoche = detalleNoche.apartamentos
            if (comprobarFechaEnRango(fechaDiaConNoche_ISO, fechaInicio_ISO, fechaFin_ISO)) {
                const detalleDiaPorProcesar = {
                    dia: fechaDiaConNoche_Humana
                }
                let totalNetoNoche = new Decimal("0")
                for (const apartamentoEnDiaConNoche of apartamentosEnDiaConNoche) {
                    const precioNetoNoche = apartamentoEnDiaConNoche.precioNetoNoche
                    totalNetoNoche = totalNetoNoche.plus(precioNetoNoche)
                }
                if (tipoDescuento === "cantidadFija") {
                    detalleDiaPorProcesar.descuento = cantidad
                    descuento = descuento.plus(cantidad)
                    detalleDiaPorProcesar.totaDiaNetoConOferta = totalNetoNoche.minus(cantidad).toFixed(2)

                }
                if (tipoDescuento === "porcentaje") {
                    const decuentoPorcentaje = cantidad.dividedBy(100).times(totalNetoNoche)
                    detalleDiaPorProcesar.descuento = decuentoPorcentaje.toFixed(2)
                    descuento = totalNetoNoche.plus(decuentoPorcentaje)
                    detalleDiaPorProcesar.totaDiaNetoConOferta = totalNetoNoche.minus(detalleDiaPorProcesar.descuento).toFixed(2)
                }
                detallesOferta.diasAfectados.push(detalleDiaPorProcesar)
            }
        }
        detallesOferta.descuento = descuento.toFixed(2)
        descuentoGlobal = descuentoGlobal.plus(descuento)
    }
    const estructuraSaliente = {
        porRangoDeFechas: ofertasSeleccionadas,
        descuentoGlobal: descuentoGlobal
    }
    return estructuraSaliente
}
