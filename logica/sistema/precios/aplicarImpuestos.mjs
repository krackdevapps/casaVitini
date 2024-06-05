import Decimal from 'decimal.js';
import { obtenerImpuestosPorAplicacionIDVPorEstado } from '../../repositorio/impuestos/obtenerImpuestosPorAplicacionIDVPorEstado.mjs';
Decimal.set({ precision: 50 });
export const aplicarImpuestos = async (estructura) => {
    try {
        const totalFinal = new Decimal(estructura.global.totales.totalFinal)
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
                tipoValor: tipoValorIDV,
            }
            if (tipoValorIDV === "porcentaje") {
                const calculoImpuestoPorcentaje = totalFinal.times(tipoImpositivo).dividedBy(100);
                presentacionImpuesto.porcentaje = tipoImpositivo
                presentacionImpuesto.tipoImpositivo = calculoImpuestoPorcentaje,
                sumaImpuestos = sumaImpuestos.plus(calculoImpuestoPorcentaje)
            }
            if (tipoValorIDV === "tasa") {
                const tipoImpositivoConst = new Decimal(tipoImpositivo)
                presentacionImpuesto.tipoImpositivo = tipoImpositivo,
                sumaImpuestos = sumaImpuestos.plus(tipoImpositivoConst)
            }
            objetoImpuestos.push(presentacionImpuesto)
        }

        estructura.impuestos = objetoImpuestos
        estructura.global.totales.impuestosAplicados = sumaImpuestos.toFixed(2)
        estructura.global.totales.totalFinal = totalFinal.plus(sumaImpuestos).toFixed(2)
        // const estructoraFinal = {
        //     impuestos: objetoImpuestos,
        //     sumaImpuestos: sumaImpuestos
        // }
        // return estructoraFinal
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
