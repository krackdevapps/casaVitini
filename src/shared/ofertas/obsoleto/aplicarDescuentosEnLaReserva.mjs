import Decimal from "decimal.js"

export const aplicarDescuentosEnLaReserva = (ofertasSeleccionadasPorCondiciones) => {
    try {
        ofertasSeleccionadasPorCondiciones.forEach((detalleOferta) => {
            const tipoOferta = detalleOferta.tipoOferta
            if (tipoOferta === "porDiasDeAntelacion") {
                const tipoDescuento = detalleOferta.tipoDescuento
                const cantidad = new Decimal(detalleOferta.cantidad)
                let descuentoRenderizado = 0
                if (tipoDescuento === "cantidadFija") {
                    sumaDescuentos = cantidad.plus(sumaDescuentos)
                    descuentoRenderizado = cantidad
                }
                if (tipoDescuento === "porcentaje") {
                    sumaDescuentos = cantidad.dividedBy(100).times(totalReservaNetoDecimal).plus(sumaDescuentos);
                    descuentoRenderizado = cantidad.dividedBy(100).times(totalReservaNetoDecimal);
                }
                detalleOferta.descuentoRenderizado = descuentoRenderizado.toFixed(2)
            }
            if (tipoOferta === "porDiasDeReserva") {
                const tipoDescuento = detalleOferta.tipoDescuento
                const cantidad = new Decimal(detalleOferta.cantidad)
                let descuentoRenderizado = 0
                if (tipoDescuento === "cantidadFija") {
                    sumaDescuentos = sumaDescuentos + cantidad
                    descuentoRenderizado = cantidad
                }
                if (tipoDescuento === "porcentaje") {
                    sumaDescuentos = cantidad.dividedBy(100).times(totalReservaNetoDecimal).plus(sumaDescuentos);
                    descuentoRenderizado = cantidad.dividedBy(100).times(totalReservaNetoDecimal);
                }
                detalleOferta.descuentoRenderizado = descuentoRenderizado.toFixed(2)
            }
            if (tipoOferta === "porNumeroDeApartamentos") {
                const tipoDescuento = detalleOferta.tipoDescuento
                const cantidad = new Decimal(detalleOferta.cantidad)
                let descuentoRenderizado = 0
                if (tipoDescuento === "cantidadFija") {
                    sumaDescuentos = cantidad.plus(sumaDescuentos)
                    descuentoRenderizado = cantidad
                }
                if (tipoDescuento === "porcentaje") {
                    sumaDescuentos = cantidad.dividedBy(100).times(totalReservaNetoDecimal).plus(sumaDescuentos);
                    descuentoRenderizado = cantidad.dividedBy(100).times(totalReservaNetoDecimal);
                }
                detalleOferta.descuentoRenderizado = descuentoRenderizado.toFixed(2)
            }
            if (tipoOferta === "porRangoDeFechas") {
                const descuentoAplicado = new Decimal(detalleOferta.descuentoAplicado)
                sumaDescuentos = descuentoAplicado.plus(sumaDescuentos)
                detalleOferta.descuentoRenderizado = descuentoAplicado.toFixed(2)
            }
            if (tipoOferta === "porApartamentosEspecificos") {

                const apartamentosEspecificos = detalleOferta.apartamentos ? detalleOferta.apartamentos : []
                let descuentoRenderizado = 0
                const descuentoAplicadoA = detalleOferta.descuentoAplicadoA
                if (descuentoAplicadoA === "totalNetoReserva") {
                    const tipoDescuento = detalleOferta.tipoDescuento
                    const cantidad = new Decimal(detalleOferta.cantidad)
                    if (tipoDescuento === "cantidadFija") {
                        sumaDescuentos = cantidad.plus(sumaDescuentos)
                        descuentoRenderizado = cantidad
                    }
                    if (tipoDescuento === "porcentaje") {
                        sumaDescuentos = cantidad.dividedBy(100).times(totalReservaNetoDecimal).plus(sumaDescuentos);
                        descuentoRenderizado = cantidad.dividedBy(100).times(totalReservaNetoDecimal);
                    }
                    detalleOferta.descuentoRenderizado = descuentoRenderizado.toFixed(2)
                }
                if (descuentoAplicadoA === "totalNetoApartamentoDedicado") {
                    for (const detalleApartamento of apartamentosEspecificos) {
                        const apartamentoIDV = detalleApartamento.apartamentoIDV
                        const tipoDescuento = detalleApartamento.tipoDescuento
                        const cantidad = new Decimal(detalleApartamento.cantidad)
                        reserva.desgloseFinanciero.totalesPorApartamento.forEach((detallesDelApartamento) => {
                            desglosePorApartamento_Objeto[detallesDelApartamento.apartamentoIDV] = detallesDelApartamento

                        })

                        const totalNetoApartamento = new Decimal(desglosePorApartamento_Objeto[apartamentoIDV].totalNetoRango)
                        let descuentoRenderizadoPorApartamento = 0
                        if (tipoDescuento === "cantidadFija") {
                            sumaDescuentos = cantidad.plus(sumaDescuentos)
                            descuentoRenderizadoPorApartamento = cantidad
                        }
                        if (tipoDescuento === "porcentaje") {
                            sumaDescuentos = cantidad.dividedBy(100).times(totalNetoApartamento).plus(sumaDescuentos)
                            descuentoRenderizadoPorApartamento = cantidad.dividedBy(100).times(totalNetoApartamento)
                        }
                        descuentoRenderizadoPorApartamento = new Decimal(descuentoRenderizadoPorApartamento)
                        descuentoRenderizado = descuentoRenderizadoPorApartamento.plus(descuentoRenderizado)
                        detalleApartamento.descuentoRenderizadoPorApartamento = descuentoRenderizadoPorApartamento.toFixed(2)
                    }
                }
                detalleOferta.descuentoRenderizado = descuentoRenderizado.toFixed(2)
            }
        })
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
