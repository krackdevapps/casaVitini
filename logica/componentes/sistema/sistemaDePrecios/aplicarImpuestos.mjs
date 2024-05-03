import Decimal from 'decimal.js';
import { conexion } from '../../db.mjs';
Decimal.set({ precision: 50 });
const aplicarImpuestos = async (totalNetoEntrada) => {
    try {
        const totalNeto = new Decimal(totalNetoEntrada)
        const cosultaImpuestosReserva = `
        SELECT nombre, "tipoImpositivo", "tipoValor"
        FROM impuestos 
        WHERE ("aplicacionSobre" = $1 OR "aplicacionSobre" = $2) AND estado = $3;`
        const resuelveCosultaImpuestosReserva = await conexion.query(cosultaImpuestosReserva, ["totalReservaNeto", "totalNeto", "activado"])
        const impuestosReserva = resuelveCosultaImpuestosReserva.rows
        const objetoImpuestos = []
        let sumaImpuestos = 0
        for (const impuesto of impuestosReserva) {
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
export {
    aplicarImpuestos
}