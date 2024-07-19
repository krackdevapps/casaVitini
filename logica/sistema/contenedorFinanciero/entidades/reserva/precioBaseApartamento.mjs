import Decimal from 'decimal.js';
import { obtenerConfiguracionPorApartamentoIDV } from '../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs';
import { obtenerPerfilPrecioPorApartamentoUID } from '../../../../repositorio/precios/obtenerPerfilPrecioPorApartamentoUID.mjs';
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from '../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs';
import { obtenerImpuestosPorEntidadIDV } from '../../../../repositorio/impuestos/obtenerImpuestosPorEntidadIDV.mjs';
// Los precios de los apartamentos, van asociados a fechas

export const precioBaseApartamento = async (apartamentoIDV) => {
    try {
        await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        const apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })).apartamentoUI
        const perfilPrecio = await obtenerPerfilPrecioPorApartamentoUID(apartamentoIDV)
        const precioNetoNoche = perfilPrecio.precio

        const detallesApartamento = {
            impuestos: [],
            totalImpuestos: "0.00",
            apartamentoUI: apartamentoUI,
            apartamentoIDV,
            precioNetoPorNoche: precioNetoNoche,
            totalBrutoPorNoche: precioNetoNoche
        }
        const impuestos = await obtenerImpuestosPorEntidadIDV({
            entidadIDV: "reserva",
            estadoIDV: "activado"
        })
        if (impuestos.length > 0) {
            let sumaTotalImpuestos = "0.00"
            impuestos.forEach((impuesto) => {
                const tipoImpositivo = new Decimal(impuesto.tipoImpositivo)
                const nombreImpuesto = impuesto.nombre
                const tipoValorIDV = impuesto.tipoValorIDV
                const impuestoUID = impuesto.impuestoUID
                const impuestosFinal = {}

                impuestosFinal.nombreImpuesto = nombreImpuesto
                impuestosFinal.impuestoUID = impuestoUID
                impuestosFinal.tipoImpositivo = tipoImpositivo
                impuestosFinal.tipoValorIDV = tipoValorIDV

                if (tipoValorIDV === "porcentaje") {
                    const resultadoAplicado = new Decimal(precioNetoNoche).times(tipoImpositivo.dividedBy(100))
                    sumaTotalImpuestos = new Decimal(sumaTotalImpuestos).plus(resultadoAplicado)
                    impuestosFinal.totalImpuesto = resultadoAplicado.toDecimalPlaces(2).toString();
                }
                if (tipoValorIDV === "tasa") {
                    sumaTotalImpuestos = new Decimal(sumaTotalImpuestos).plus(tipoImpositivo)
                    impuestosFinal.totalImpuesto = new Decimal(tipoImpositivo).toDecimalPlaces(2).toString()
                }
                detallesApartamento.impuestos.push(impuestosFinal)
            })
            let totalNocheBruto = new Decimal(sumaTotalImpuestos).plus(precioNetoNoche).toDecimalPlaces(2).toString()
            detallesApartamento.totalImpuestos = new Decimal(sumaTotalImpuestos).toDecimalPlaces(2).toString()
            detallesApartamento.totalBrutoPorNoche = totalNocheBruto;
        }
        return detallesApartamento
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
