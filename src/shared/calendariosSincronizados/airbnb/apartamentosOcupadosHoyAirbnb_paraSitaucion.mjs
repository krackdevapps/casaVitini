import { obtenerCalendariosPorPlataformaIDV } from "../../../infraestructure/repository/calendario/obtenerCalendariosPorPlataformaIDV.mjs"
import { selectorRangoUniversal } from "../../selectoresCompartidos/selectorRangoUniversal.mjs"
import { sincronizarCalendariosAirbnbPorIDV } from "./sincronizarCalendariosAirbnbPorIDV.mjs"
export const apartamentosOcupadosHoy_paraSitaucion = async (fechaHoy_ISO) => {
    const plataformaOrigen = "airbnb"
    const calendariosSincronizados = await obtenerCalendariosPorPlataformaIDV(plataformaOrigen)
    const eventosPorApartamento = []
    for (const apartamentoIDV_porCalendario of calendariosSincronizados) {
        const apartamentoIDV_porComprovar = apartamentoIDV_porCalendario.apartamentoIDV
        const calendarioExterno = await sincronizarCalendariosAirbnbPorIDV(apartamentoIDV_porComprovar)

        const calendariosPorApartamento = calendarioExterno.calendariosPorApartamento

        const apartamentoIDV = calendarioExterno.apartamentoIDV
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
        eventosPorApartamento.push(detallesDelApartamento)
    }
    return eventosPorApartamento
}
