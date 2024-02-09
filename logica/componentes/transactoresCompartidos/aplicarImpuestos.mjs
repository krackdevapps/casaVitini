import Decimal from 'decimal.js';
import { conexion } from '../db.mjs';
Decimal.set({ precision: 50 });

const aplicarImpuestos = async (totalNetoEntrada) => {
    try {

        /* 
        if (typeof totalNetoEntrada !== "number") {
            const error = "El totalNeto que espera el transactor compartido aplicarImpuestos espera un numero"
            throw new Error(error)
        }
        */
        const totalNeto = new Decimal(totalNetoEntrada)
        const cosultaImpuestosReserva = `
        SELECT impuesto, "tipoImpositivo", "tipoValor", moneda
        FROM impuestos 
        WHERE "aplicacionSobre" = $1 OR "aplicacionSobre" = $2;`
        const resuelveCosultaImpuestosReserva = await conexion.query(cosultaImpuestosReserva, ["totalReservaNeto", "totalNeto"])
        const impuestosReserva = resuelveCosultaImpuestosReserva.rows
        const objetoImpuestos = []
        let sumaImpuestos = 0
        for (const impuesto of impuestosReserva) {
            const impuestoNombre = impuesto.impuesto
            const tipoImpositivo = impuesto.tipoImpositivo
            const tipoValor = impuesto.tipoValor
            const moneda = impuesto.moneda
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
                presentacionImpuesto.moneda = moneda
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