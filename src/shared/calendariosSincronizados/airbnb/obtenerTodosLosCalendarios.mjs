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

            const calendarioObjeto = constructorObjetoEvento(calendarioDatos)
            estructura.calendarioObjeto = calendarioObjeto
            ok.calendariosSincronizados.push(estructura)
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
