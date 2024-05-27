import Decimal from "decimal.js"
import { selectorRangoUniversal } from "../../selectoresCompartidos/selectorRangoUniversal.mjs"
import { aplicarComportamiento } from "./aplicarComportamiento.mjs"

export const aplicarCalculoDelComportamientoPorDias = async (data) => {
    try {
        const comportamientosPorDiasFormateados = data.comportamientosPorDiasFormateados
        const apartamentoIDV = data.apartamentoIDV
        const fechaDiaConNoche = data.fechaDiaConNoche
        const precioNetoApartamento = data.precioNetoApartamento
        let comportamientoAplicado = precioNetoApartamento

        if (comportamientosPorDiasFormateados.hasOwnProperty(apartamentoIDV)) {

            const comportamientosDelApartamento = comportamientosPorDiasFormateados[apartamentoIDV]
            for (const comportamiento of comportamientosDelApartamento) {

                const dias = comportamiento.dias
                const simboloIDV = comportamiento.simboloIDV
                const cantidad = comportamiento.cantidad
                const nombreDeDia = data.indiceDias.nombresConFechas[fechaDiaConNoche]
                if (dias.includes(nombreDeDia)) {

                    const precioNetoFinal = aplicarComportamiento({
                        precioBase: precioNetoApartamento,
                        simboloIDV: simboloIDV,
                        cantidad: cantidad
                    })
                    comportamientoAplicado = precioNetoFinal.toFixed(2)
                }
            }
        }

        return comportamientoAplicado
    } catch (error) {
        throw error
    }
}

