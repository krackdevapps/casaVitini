import axios from 'axios';
import ICAL from 'ical.js';
import { obtenerCalendariosPorPlataformaIDV } from '../../../infraestructure/repository/calendario/obtenerCalendariosPorPlataformaIDV.mjs';
import { DateTime } from 'luxon';
import { constructorObjetoEvento } from './constructorObjetoEvento.mjs';

export const obtenerTodosLosCalendarios = async () => {
    try {
        const plataformaDeOrigen = "airbnb"
        const calendarios = await obtenerCalendariosPorPlataformaIDV(plataformaDeOrigen)
        const ok = {
            calendariosSincronizados: []
        }

        for (const detallesDelCalendario of calendarios) {
            const calendarioUID = detallesDelCalendario.calendarioUID
            const nombre = detallesDelCalendario.nombre
            const url = detallesDelCalendario.url
            let calendarioDatos = detallesDelCalendario.dataIcal
            const apartamentoIDV = detallesDelCalendario.apartamentoIDV

            if (!url || !calendarioDatos) {
                continue
            }
            const estructura = {
                apartamentoIDV: apartamentoIDV,
                nombreCalendario: nombre,
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



            // const jcalData = ICAL.parse(calendarioDatos);
            // const jcal = new ICAL.Component(jcalData);
            // const eventosCalenario = jcal.jCal[2]
            const calendarioObjeto = constructorObjetoEvento(calendarioDatos)
            // eventosCalenario.forEach((event) => {
            //     const detallesEventoSinFormatear = event[1]
            //     // 
            //     const eventoObjeto = {}
            //     detallesEventoSinFormatear.forEach((detallesEvento) => {
            //         const idCajon = detallesEvento[0]
            //         if (idCajon === "categories") {
            //             eventoObjeto.categoriaEvento = detallesEvento[3]
            //         }
            //         if (idCajon === "summary") {
            //             eventoObjeto.nombreEvento = detallesEvento[3]
            //         }
            //         if (idCajon === "dtstart") {
            //             eventoObjeto.fechaInicio = detallesEvento[3]
            //         }
            //         if (idCajon === "dtend") {
            //             const fechaEnDTEND = detallesEvento[3]
            //             const fechaFinalCorregida = DateTime.fromISO(fechaEnDTEND)
            //                 .minus({ days: 1 })
            //                 .toISODate();
            //             eventoObjeto.fechaFinal = fechaFinalCorregida                        }
            //         if (idCajon === "uid") {
            //             eventoObjeto.uid = detallesEvento[3]
            //         }
            //         if (idCajon === "last-modified") {
            //             eventoObjeto.ultimaModificaion = detallesEvento[3]
            //         }
            //         if (idCajon === "dtstamp") {
            //             eventoObjeto.creacionEvento = detallesEvento[3]
            //         }
            //         if (idCajon === "description") {
            //             eventoObjeto.descripcion = detallesEvento[3]
            //         }
            //         if (idCajon === "url") {
            //             eventoObjeto.url = detallesEvento[3]
            //         }
            //     })
            //     calendarioObjeto.push(eventoObjeto)
            // });
            estructura.calendarioObjeto = calendarioObjeto
            ok.calendariosSincronizados.push(estructura)
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
