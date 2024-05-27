import Decimal from 'decimal.js';
import { aplicarImpuestos } from './aplicarImpuestos.mjs';

Decimal.set({ precision: 1000 });
export const constructorTotalesPorApartamento = async (data) => {
    try {
        const totalesPorApartamento = data.totalesPorApartamento
        const diasArray = data.diasArray
        const estructuraTotales = []
        for (const [apartamentoIDV, totalPorApartamento] of Object.entries(totalesPorApartamento)) {

            const impuestosAplicadosTotalesPorApartamento = (await aplicarImpuestos(totalPorApartamento)).sumaImpuestos
            const totalBrutoRango = new Decimal(totalPorApartamento).plus(impuestosAplicadosTotalesPorApartamento)
            const precioMedioNetoNocheRango = new Decimal(totalPorApartamento).dividedBy(diasArray.length)
            const precioMedioBrutoNocheRango = new Decimal(totalBrutoRango).dividedBy(diasArray.length)

            const estructura = {
                apartamentoIDV: apartamentoIDV,
                totalNeto: totalPorApartamento.toFixed(2),
               // impuestosAplicados: impuestosAplicadosTotalesPorApartamento.toFixed(2),
               // totalBruto: totalBrutoRango.toFixed(2),
                precioMedioNetoNoche: precioMedioNetoNocheRango.toFixed(2),
               // precioMedioBrutoNoche: precioMedioBrutoNocheRango.toFixed(2)
            }
            estructuraTotales.push(estructura)
        }

        return estructuraTotales
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
