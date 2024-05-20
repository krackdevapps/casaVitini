import Decimal from 'decimal.js';
import { obtenerImpuestosPorAplicacionIDVPorEstado } from '../../repositorio/impuestos/obtenerImpuestosPorAplicacionIDVPorEstado.mjs';
Decimal.set({ precision: 50 });
export const aplicarImpuestos = async (totalNetoEntrada) => {
    try {
        const totalNeto = new Decimal(totalNetoEntrada)
        const impuestos = await obtenerImpuestosPorAplicacionIDVPorEstado({
            estadoIDV: "activado",
            aplicacionSobre_array: [
                "totalReservaNeto",
                "totalNeto",
            ]
        })
        const objetoImpuestos = []
        let sumaImpuestos = 0
        for (const impuesto of impuestos) {
            const impuestoNombre = impuesto.nombre
            const tipoImpositivo = impuesto.tipoImpositivo
            const tipoValor = impuesto.tipoValor
            let calculoImpuestoPorcentaje
            const presentacionImpuesto = {
                nombreImpuesto: impuestoNombre,
                tipoImpositivo: tipoImpositivo,
                tipoValor: tipoValor,
            }
            if (tipoValor === "porcentaje") {
                calculoImpuestoPorcentaje = totalNeto.times(tipoImpositivo).dividedBy(100);
                presentacionImpuesto.calculoImpuestoPorcentaje = calculoImpuestoPorcentaje.toFixed(2).toString()
                calculoImpuestoPorcentaje = new Decimal(calculoImpuestoPorcentaje)
                sumaImpuestos = calculoImpuestoPorcentaje.plus(sumaImpuestos)
            }
            if (tipoValor === "tasa") {
                const tipoImpositivoConst = new Decimal(tipoImpositivo)
                sumaImpuestos = tipoImpositivoConst.plus(sumaImpuestos)
            }

            // let objetoImpuesto = {}
            // objetoImpuesto[impuestoNombre] = presentacionImpuesto
            objetoImpuestos.push(presentacionImpuesto)
        }
        const estructoraFinal = {
            impuestos: objetoImpuestos,
            sumaImpuestos: sumaImpuestos
        }
        return estructoraFinal
    } catch (error) {
        throw error
    }
}
