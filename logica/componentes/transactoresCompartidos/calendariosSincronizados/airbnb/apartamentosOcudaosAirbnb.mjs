import { sincronizarCalendariosAirbnbPorIDV } from "./sincronizarCalendariosAirbnbPorIDV.mjs"
import { verificarRangoContenidoAirbnb } from "./verificarRangoContenidoAirbnb.mjs"

const apartamentosOcupadosAirbnb = async (datos) => {
    // Esto se esta usando para ver encontrar eventos dentro de las fecha especificas en base a los apartamentos disponibles que se les pasa. Aunque parezca muy igual a apartamentosOcupadosAirbnbHOY -> NO HACE LO MISMO, no confundir!!! Este script no es reutilizable para eso por que este script tambien recibe los apartamentos disponibles. 
    const fechaEntrada_ISO = datos.fechaEntrada_ISO
    const fechaSalida_ISO = datos.fechaSalida_ISO
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
                const controlOcupacional = verificarRangoContenidoAirbnb(
                    fechaEntrada_ISO,
                    fechaSalida_ISO,
                    fechaInicioComparar,
                    fechaFinalComparar
                )
                if (controlOcupacional === "ocupado") {
                    apartamentosOcupados.push(apartamentoIDV)
                    break
                }
            }
        }
    }

    return apartamentosOcupados
}

export {
    apartamentosOcupadosAirbnb
}