import { selectorRangoUniversal } from "../../selectoresCompartidos/selectorRangoUniversal.mjs"
import { sincronizarCalendariosAirbnbPorIDV } from "./sincronizarCalendariosAirbnbPorIDV.mjs"
export const eventosDelApartamento = async (datos) => {
    const fechaHoy_ISO = datos.fechaHoy_ISO
    const apartamentoIDV = datos.apartamentoIDV
    const calendarioExterno = await sincronizarCalendariosAirbnbPorIDV(apartamentoIDV)
    const calendariosPorApartamento = calendarioExterno.calendariosPorApartamento
    const detallesDelApartamento = {
        apartamentoIDV: apartamentoIDV,
        eventos: []
    }
    for (const calendarioDelApartamento of calendariosPorApartamento) {
        const calendariosObjetoDelApartamento = calendarioDelApartamento.calendarioObjeto
        for (const detallesDelCalendario of calendariosObjetoDelApartamento) {
            const fechaInicioComparar = detallesDelCalendario.fechaInicio
            const fechaFinalComparar = detallesDelCalendario.fechaFinal
            const controlOcupacional = await selectorRangoUniversal({
                fechaInicio_rango_ISO: fechaHoy_ISO,
                fechaFin_rango_ISO: fechaHoy_ISO,
                fechaInicio_elemento_ISO: fechaInicioComparar,
                fechaFin_elemento_ISO: fechaFinalComparar,
                tipoLimite: "incluido"
            })
            if (controlOcupacional) {
                detallesDelApartamento.eventos.push(detallesDelCalendario)
            }
        }
    }
    return detallesDelApartamento
}
