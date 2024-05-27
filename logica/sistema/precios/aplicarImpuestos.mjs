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
        let sumaImpuestos = new Decimal("0")
        for (const impuesto of impuestos) {
            const impuestoNombre = impuesto.nombre
            const tipoImpositivo = impuesto.tipoImpositivo
            const tipoValorIDV = impuesto.tipoValorIDV
            const presentacionImpuesto = {
                nombreImpuesto: impuestoNombre,
                tipoImpositivo: tipoImpositivo,
                tipoValor: tipoValorIDV,
            }
            if (tipoValorIDV === "porcentaje") {
                const calculoImpuestoPorcentaje = totalNeto.times(tipoImpositivo).dividedBy(100);
                sumaImpuestos = sumaImpuestos.plus(calculoImpuestoPorcentaje)
            }
            if (tipoValorIDV === "tasa") {
                const tipoImpositivoConst = new Decimal(tipoImpositivo)
                sumaImpuestos = sumaImpuestos.plus(tipoImpositivoConst)
            }
            objetoImpuestos.push(presentacionImpuesto)
        }
        const estructoraFinal = {
            impuestos: objetoImpuestos,
            sumaImpuestos: sumaImpuestos
        }
        return estructoraFinal
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
