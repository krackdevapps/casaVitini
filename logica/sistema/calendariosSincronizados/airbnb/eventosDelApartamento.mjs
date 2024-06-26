import { selectorRangoUniversal } from "../../selectoresCompartidos/selectorRangoUniversal.mjs"
import { sincronizarCalendariosAirbnbPorIDV } from "./sincronizarCalendariosAirbnbPorIDV.mjs"
const eventosDelApartamento = async (datos) => {
    // AL LORO DESCOMENTAR LO DE ABAJO CUANDO SE ACABEN LAS PRUEBAS!!!!!
    const fechaHoy_ISO = datos.fechaHoy_ISO
    const apartamentoIDV = datos.apartamentoIDV
    //const fechaHoy_ISO = "2024-05-05"
    // Sincronizar y obtener los dtos
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
            //

            const controlOcupacional = await selectorRangoUniversal({
                fechaInicio_rango_ISO: fechaHoy_ISO,
                fechaFin_rango_ISO: fechaHoy_ISO,
                fechaInicio_elemento_ISO: fechaInicioComparar,
                fechaFin_elemento_ISO: fechaFinalComparar,
                tipoLimite: "noIncluido"
            })
            if (controlOcupacional === "ocupado") {
                //apartamentosOcupados.push(apartamentoIDV)
                detallesDelApartamento.eventos.push(detallesDelCalendario)
            }
        }
    }
    return detallesDelApartamento
}
export {
    eventosDelApartamento
}