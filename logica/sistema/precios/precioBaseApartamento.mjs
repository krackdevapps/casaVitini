import Decimal from 'decimal.js';
import { obtenerNombreApartamentoUI } from '../../repositorio/arquitectura/obtenerNombreApartamentoUI.mjs';
import { obtenerConfiguracionPorApartamentoIDV } from '../../repositorio/arquitectura/obtenerConfiguracionPorApartamentoIDV.mjs';
import { obtenerPerfilPrecioPorApartamentoUID } from '../../repositorio/precios/obtenerPerfilPrecioPorApartamentoUID.mjs';
import { obtenerImpuestosPorAplicacionIDVPorEstado } from '../../repositorio/impuestos/obtenerImpuestosPorAplicacionIDVPorEstado.mjs';
// Los precios de los apartamentos, van asociados a fechas

export const precioBaseApartamento = async (apartamentoIDV) => {
    try {
        await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)
        const apartamentoUI = await obtenerNombreApartamentoUI(apartamentoIDV)
        const perfilPrecio = await obtenerPerfilPrecioPorApartamentoUID(apartamentoIDV)
        const precioNetoNoche = perfilPrecio.precio

        const detallesApartamento = {
            impuestos: [],
            totalImpuestos: "0.00",
            apartamentoUI: apartamentoUI,
            apartamentoIDV: apartamentoIDV,
            precioNetoPorDia: precioNetoNoche,
            totalBrutoPordia: precioNetoNoche
        }
        const impuestos = await obtenerImpuestosPorAplicacionIDVPorEstado({
            estadoIDV: "activado",
            aplicacionSobre_array: ["totalNeto", "totalReservaNeto",]
        })
        if (impuestos.length > 0) {
            const impuestosFinal = {}
            let sumaTotalImpuestos = "0.00"
            impuestos.forEach((impuesto) => {
                const tipoImpositivo = new Decimal(impuesto.tipoImpositivo)
                const nombreImpuesto = impuesto.nombre
                const tipoValor = impuesto.tipoValor

                impuestosFinal.nombreImpuesto = nombreImpuesto
                impuestosFinal.tipoImpositivo = tipoImpositivo
                impuestosFinal.tipoValor = tipoValor

                if (tipoValor === "porcentaje") {
                    const resultadoAplicado = new Decimal(precioNetoApartamentoPorDia).times(tipoImpositivo.dividedBy(100))
                    sumaTotalImpuestos = new Decimal(sumaTotalImpuestos).plus(resultadoAplicado)
                    impuestosFinal.totalImpuesto = resultadoAplicado.toDecimalPlaces(2).toString();
                }
                if (tipoValor === "tasa") {
                    sumaTotalImpuestos = new Decimal(sumaTotalImpuestos).plus(tipoImpositivo)
                    impuestosFinal.totalImpuesto = new Decimal(tipoImpositivo).toDecimalPlaces(2).toString()
                }
                detallesApartamento.impuestos.push(impuestosFinal)
            })
            let totalDiaBruto = new Decimal(sumaTotalImpuestos).plus(precioNetoApartamentoPorDia).toDecimalPlaces(2).toString()
            detallesApartamento.totalImpuestos = new Decimal(sumaTotalImpuestos).toDecimalPlaces(2).toString()
            detallesApartamento.totalBrutoPordia = totalDiaBruto;
        }
        return detallesApartamento
    } catch (error) {
        throw error
    }
}
