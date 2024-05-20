import axios from 'axios';
import ICAL from 'ical.js';
import { obtenerCalendariosPorPlataformaIDVPorCalendarioUID } from '../../../repositorio/calendario/obtenerCalendariosPorPlataformaIDVPorCalendarioUID.mjs';
import { actualizarEventosCalendarioPorCalendarioUID } from '../../../repositorio/calendario/actualizarEventosCalendarioPorCalendarioUID.mjs';
export const eventosCalendarioPorUID = async (calendarioUID) => {
    try {
        const plataformaDeOrigen = "airbnb"
        const calendario = await obtenerCalendariosPorPlataformaIDVPorCalendarioUID({
            calendarioUID: calendarioUID,
            plataformaDeOrigen: plataformaDeOrigen,
        })
        const ok = {
            calendariosPorApartamento: []
        }
        if (calendario.calendarioUID) {
            const errorDeFormato = "En la direccion URL que has introducido no hay un calendario iCal de Airbnb"
            const calendarioUID = calendario.uid
            const url = calendario.url
            const nombre = calendario.nombre
            let calendarioDatos = calendario.dataIcal
            ok.apartamentoIDV = calendario.apartamentoIDV
            const estructura = {
                calendarioRaw: calendarioDatos
            }
            try {
                const calendarioData = await axios.get(url);
                const calendarioRaw = calendarioData.data
                const jcalData = ICAL.parse(calendarioRaw);
                const jcal = new ICAL.Component(jcalData);
                if (jcal?.name.toLowerCase() !== 'vcalendar') {
                    throw new Error(errorDeFormato)
                }

                await actualizarEventosCalendarioPorCalendarioUID({
                    calendarioRaw: calendarioRaw,
                    calendarioUID: calendarioUID
                })

                calendarioDatos = calendarioRaw
                estructura.estadoSincronizacion = "sincronizado"
            } catch (errorCapturado) {

                estructura.estadoSincronizacion = "noSincronizado"
            }
            const jcalData = ICAL.parse(calendarioDatos);
            const jcal = new ICAL.Component(jcalData);
            const eventosCalenario = jcal.jCal[2]
            const calendarioObjeto = []
            eventosCalenario.forEach((event) => {
                const detallesEventoSinFormatear = event[1]
                // 
                const eventoObjeto = {}
                detallesEventoSinFormatear.forEach((detallesEvento) => {
                    const idCajon = detallesEvento[0]
                    if (idCajon === "categories") {
                        eventoObjeto.categoriaEvento = detallesEvento[3]
                    }
                    if (idCajon === "summary") {
                        eventoObjeto.nombreEvento = detallesEvento[3]
                    }
                    if (idCajon === "dtstart") {
                        eventoObjeto.fechaInicio = detallesEvento[3]
                    }
                    if (idCajon === "dtend") {
                        eventoObjeto.fechaFinal = detallesEvento[3]
                    }
                    if (idCajon === "uid") {
                        eventoObjeto.uid = detallesEvento[3]
                    }
                    if (idCajon === "last-modified") {
                        eventoObjeto.ultimaModificaion = detallesEvento[3]
                    }
                    if (idCajon === "dtstamp") {
                        eventoObjeto.creacionEvento = detallesEvento[3]
                    }
                    if (idCajon === "description") {
                        eventoObjeto.descripcion = detallesEvento[3]
                    }
                    if (idCajon === "url") {
                        eventoObjeto.url = detallesEvento[3]
                    }
                })
                calendarioObjeto.push(eventoObjeto)
            });
            estructura.calendarioObjeto = calendarioObjeto
            ok.calendariosPorApartamento.push(estructura)
        }
        return ok
    } catch (error) {
        throw error
    }
}
