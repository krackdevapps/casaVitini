import Decimal from "decimal.js"
import { selectorRangoUniversal } from "../../selectoresCompartidos/selectorRangoUniversal.mjs"
import { aplicarComportamiento } from "./aplicarComportamiento.mjs"

export const aplicarCalculoDelComportamientoPorRango = async (data) => {
    try {
        const comportamientosPorRangoFormateados = data.comportamientosPorRangoFormateados
        const apartamentoIDV = data.apartamentoIDV
        const fechaDiaConNoche = data.fechaDiaConNoche
        const precioNetoApartamento = data.precioNetoApartamento
        let comportamientoAplicado = precioNetoApartamento

        if (comportamientosPorRangoFormateados.hasOwnProperty(apartamentoIDV)) {
            const comportamientosDelApartamento = comportamientosPorRangoFormateados[apartamentoIDV]
            for (const comportamiento of comportamientosDelApartamento) {

                const fechaInicioComportamiento = comportamiento.fechaInicio
                const fechaFinalComportamiento = comportamiento.fechaInicio
                const simboloIDV = comportamiento.simboloIDV
                const cantidad = comportamiento.cantidad

                const controlRangoInterno = await selectorRangoUniversal({
                    fechaInicio_rango_ISO: fechaInicioComportamiento,
                    fechaFin_rango_ISO: fechaFinalComportamiento,
                    fechaInicio_elemento_ISO: fechaDiaConNoche,
                    fechaFin_elemento_ISO: fechaDiaConNoche,
                    tipoLimite: "incluido"
                })
                if (controlRangoInterno) {
                    const precioNetoFinal = aplicarComportamiento({
                        precioBase: precioNetoApartamento,
                        simboloIDV: simboloIDV,
                        cantidad: cantidad
                    })
                    comportamientoAplicado = precioNetoFinal

                    
                }
            }
        }
        return comportamientoAplicado
    } catch (error) {
        throw error
    }
}