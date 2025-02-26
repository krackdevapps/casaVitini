import Decimal from "decimal.js";
import { validadoresCompartidos } from "../../validadores/validadoresCompartidos.mjs";
import { obtenerOfertasPorFechaPorEstadoPorTipo } from "../../../infraestructure/repository/ofertas/perfiles/obtenerOfertasPorFechaPorEstadoPorTipo.mjs";
import { obtenerApartamentosDeLaOfertaPorOfertaUID } from "../../../infraestructure/repository/ofertas/obtenerApartamentosDeLaOfertaPorOfertaUID.mjs";
const compararArraysStrings = (array1, array2) => {
    return array2.every(apartamento => array1.includes(apartamento));
};
const fusionaArrayConComaYUltimaConYGriega = (array) => {
    return array.length <= 1 ? array.join("") : `${array.slice(0, -1).join(", ")} y ${array.slice(-1)}`;
}
export const porApartamentosEspecificos = async (reserva) => {
    try {
        const fechaActualTZ = reserva.fechas.fechaActualProcesada_ISO
        const estadoOfertaActivado = "activada"
        const apartamentosReserva = reserva.desgloseFinanciero.totalesPorApartamento
        const apartamentosIDV_reserva = []
        const totalesPorApartamento_Objeto = {}
        for (const detallesPorApartamento of apartamentosReserva) {
            const apartamentoIDV = detallesPorApartamento.apartamentoIDV
            totalesPorApartamento_Objeto[apartamentoIDV] = detallesPorApartamento
        }
        const totalReservaNeto = new Decimal(reserva.desgloseFinanciero.totales.totalReservaNeto)
        for (const detallesPorApartamento of apartamentosReserva) {
            apartamentosIDV_reserva.push(detallesPorApartamento.apartamentoIDV)
        }
        const ofertasSeleccionadas = []
        let descuentoGlobal = new Decimal("0.00")


        const ofertaTipo = "porApartamentosEspecificos";
        const ofertas = await obtenerOfertasPorFechaPorEstadoPorTipo({
            fechaActualTZ: fechaActualTZ,
            estadoOfertaActivado: estadoOfertaActivado,
            ofertaTipo: ofertaTipo
        })

        for (const detallesOferta of ofertas) {
            const ofertaUID = detallesOferta.uid
            const tipoOferta = detallesOferta.tipoOferta
            const simboloNumero = detallesOferta.simboloNumero
            const numero = detallesOferta.numero
            const nombreOferta = detallesOferta.nombreOferta
            const tipoDescuento = detallesOferta.tipoDescuento
            const descuentoAplicadoA = detallesOferta.descuentoAplicadoA
            const cantidad = detallesOferta.cantidad || new Decimal("0.00").toFixed(2)
            const estructuraOferta = {
                ofertaUID: ofertaUID,
                nombreOferta: nombreOferta,
                tipoDescuento: tipoDescuento,
                tipoOferta: tipoOferta,
                cantidad: cantidad,


                descuento: "0.00",
                descuentoAplicadoA: descuentoAplicadoA,
                apartamentosEspecificos: [],
            }
            ofertasSeleccionadas.push(estructuraOferta)
        }
        const ofertasParaCoincidentes = []
        const apartamentosIDV_Oferta = []
        const apartamentosUI_Oferta = []
        for (const detallesOferta of ofertasSeleccionadas) {
            const ofertaUID = detallesOferta.ofertaUID
            delete detallesOferta.ofertaUID
            const apartamentosDeLaOferta = await obtenerApartamentosDeLaOfertaPorOfertaUID(ofertaUID)
            for (const detallesPorApartamento of apartamentosDeLaOferta) {
                const apartamentoIDV = detallesPorApartamento.apartamentoIDV
                const apartamentoUI = await validadoresCompartidos.reservas.resolverNombreApartamento(apartamentoIDV)
                const tipoDescuento = detallesPorApartamento.tipoDescuento
                const cantidad = detallesPorApartamento.cantidad
                const estructuraApartamentoEspecificos = {
                    apartamentoIDV: apartamentoIDV,
                    apartamentoUI: apartamentoUI,
                    tipoDescuento: tipoDescuento,
                    cantidad: cantidad,
                }
                detallesOferta.apartamentosEspecificos.push(estructuraApartamentoEspecificos)
                apartamentosIDV_Oferta.push(apartamentoIDV)
                apartamentosUI_Oferta.push(apartamentoUI)
            }
            const selectorOferta = compararArraysStrings(apartamentosIDV_reserva, apartamentosIDV_Oferta);
            if (selectorOferta) {
                ofertasParaCoincidentes.push(detallesOferta)
            }
        }
        for (const detallesOferta of ofertasParaCoincidentes) {
            const apartamentosEspecificos = detallesOferta.apartamentosEspecificos
            let descuento = new Decimal(detallesOferta.descuento)
            const descuentoAplicadoA = detallesOferta.descuentoAplicadoA
            if (descuentoAplicadoA === "totalNetoReserva") {
                const gruopoApartamentosUI_oferta = []
                const cantidad = new Decimal(detallesOferta.cantidad)
                delete detallesOferta.apartamentosEspecificos
                for (const detallesApartamento of apartamentosEspecificos) {
                    const apartamentoUI = detallesApartamento.apartamentoUI
                    gruopoApartamentosUI_oferta.push(apartamentoUI)
                }
                const formateoApartamentos = fusionaArrayConComaYUltimaConYGriega(gruopoApartamentosUI_oferta);
                if (gruopoApartamentosUI_oferta.length > 1) {
                    detallesOferta.definicion = `Oferta aplicada al neto de la reserva por contener los apartamentos: ${formateoApartamentos}`
                }
                if (gruopoApartamentosUI_oferta.length === 1) {
                    detallesOferta.definicion = `Oferta aplicada al neto de la reserva por contener el apartamento: ${formateoApartamentos}`
                }
                const tipoDescuento = detallesOferta.tipoDescuento
                if (tipoDescuento === "cantidadFija") {
                    descuento = totalReservaNeto.minus(cantidad)
                    detallesOferta.cantidad = cantidad.toFixed(2) + "$"
                    detallesOferta.descuento = descuento.toFixed(2) + "$"
                    descuentoGlobal = descuentoGlobal.plus(descuento)

                }
                if (tipoDescuento === "porcentaje") {
                    descuento = cantidad.dividedBy(100).times(totalReservaNeto)
                    detallesOferta.cantidad = cantidad.toFixed(2)
                    detallesOferta.descuento = descuento.toFixed(2) + ` (${cantidad}%`
                    descuentoGlobal = descuentoGlobal.plus(descuento)

                }
                detallesOferta.descuento = descuento.toFixed(2)
            }
            if (descuentoAplicadoA === "totalNetoApartamentoDedicado") {
                const gruopoApartamentosUI_oferta = []
                delete detallesOferta.descuento
                for (const detallesApartamento of apartamentosEspecificos) {
                    const apartamentoUI = detallesApartamento.apartamentoUI
                    gruopoApartamentosUI_oferta.push(apartamentoUI)
                }
                const formateoApartamentos = fusionaArrayConComaYUltimaConYGriega(gruopoApartamentosUI_oferta);
                if (gruopoApartamentosUI_oferta.length > 1) {
                    detallesOferta.definicion = `Oferta aplicada con descuentos individuales a los apartamentos: ${formateoApartamentos}`
                }
                if (gruopoApartamentosUI_oferta.length === 1) {
                    detallesOferta.definicion = `Oferta aplicada con descuento individual al apartamento: ${formateoApartamentos}`
                }
                let cantidadOferta = new Decimal("0")
                for (const detallesApartamento of apartamentosEspecificos) {
                    const tipoDescuento = detallesApartamento.tipoDescuento
                    const apartamentoIDV = detallesApartamento.apartamentoIDV
                    const cantidad = new Decimal(detallesApartamento.cantidad)
                    const totalApartamentoReserva = totalesPorApartamento_Objeto[apartamentoIDV]?.totalNetoRango
                    if (tipoDescuento === "cantidadFija") {
                        cantidadOferta = cantidadOferta.plus(cantidad)
                        detallesApartamento.descuento = cantidad.toFixed(2)
                        descuentoGlobal = descuentoGlobal.plus(descuento)
                    }
                    if (tipoDescuento === "porcentaje") {
                        let descuento = cantidad.dividedBy(100).times(totalApartamentoReserva)
                        cantidadOferta = cantidadOferta.plus(descuento)
                        detallesApartamento.cantidad = cantidad
                        detallesApartamento.descuento = descuento.toFixed(2)
                        descuentoGlobal = descuentoGlobal.plus(descuento)
                    }
                }
                delete detallesOferta.cantidad
                delete detallesOferta.tipoDescuento
                detallesOferta.descuento = cantidadOferta.toFixed(2)
            }
        }
        const estructuraSaliente = {
            porApartamentosEspecificos: ofertasParaCoincidentes,
            descuentoGlobal: descuentoGlobal
        }
        return estructuraSaliente
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
