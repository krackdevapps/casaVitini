import { selectorRangoUniversal } from "../../selectoresCompartidos/selectorRangoUniversal.mjs"
import { sincronizarCalendariosAirbnbPorIDV } from "./sincronizarCalendariosAirbnbPorIDV.mjs"
export const apartamentosOcupadosAirbnb = async (datos) => {

    const fechaEntrada = datos.fechaEntrada
    const fechaSalida = datos.fechaSalida
    const apartamentosDisponibles = datos.apartamentosDisponibles



    const apartamentosOcupados = []
    for (const apartamentoDisponible of apartamentosDisponibles) {
        const calendarioExterno = await sincronizarCalendariosAirbnbPorIDV(apartamentoDisponible)

        const calendariosPorApartamento = calendarioExterno.calendariosPorApartamento
        const apartamentoIDV = calendarioExterno.apartamentoIDV
        for (const calendarioDelApartamento of calendariosPorApartamento) {
            const calendariosObjetoDelApartamento = calendarioDelApartamento.calendarioObjeto
            for (const detallesDelCalendario of calendariosObjetoDelApartamento) {
                const fechaInicioComparar = detallesDelCalendario.fechaInicio
                const fechaFinalComparar = detallesDelCalendario.fechaFinal
                const controlOcupacional = await selectorRangoUniversal({
                    fechaInicio_rango_ISO: fechaEntrada,
                    fechaFin_rango_ISO: fechaSalida,
                    fechaInicio_elemento_ISO: fechaInicioComparar,
                    fechaFin_elemento_ISO: fechaFinalComparar,
                    tipoLimite: "noIncluido"
                })
                if (controlOcupacional) {
                    apartamentosOcupados.push(apartamentoIDV)
                    break
                }
            }
        }
    }
    return apartamentosOcupados
}
