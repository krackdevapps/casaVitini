import axios from 'axios';
import ICAL from 'ical.js';
import { obtenerCalendariosPorPlataformaIDVPorCalendarioUID } from '../../../infraestructure/repository/calendario/obtenerCalendariosPorPlataformaIDVPorCalendarioUID.mjs';
import { actualizarEventosCalendarioPorCalendarioUID } from '../../../infraestructure/repository/calendario/actualizarEventosCalendarioPorCalendarioUID.mjs';
import { constructorObjetoEvento } from './constructorObjetoEvento.mjs';
export const eventosCalendarioPorUID = async (calendarioUID) => {
    try {
        const plataformaDeOrigen = "airbnb"
        const calendario = await obtenerCalendariosPorPlataformaIDVPorCalendarioUID({
            calendarioUID: calendarioUID,
            plataformaDeOrigen: plataformaDeOrigen,
        })
        const nombre = calendario.nombre
        const url = calendario?.url
        let calendarioDatos = calendario.dataIcal

        const ok = {
            apartamentoIDV: calendario.apartamentoIDV,
            calendarioDelApartamento: {
                calendarioRaw: calendarioDatos,
                calendarioObjeto: []
            }
        }
        // Si no toene url, devuelve un array vacio
        // Si tiene url pero no hay datos Ical devuelve un array vacio
        if (url) {
            const errorDeFormato = "En la dirección URL que has introducido no hay un calendario iCal de Airbnb."
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
                ok.calendarioDelApartamento.calendarioRaw = calendarioRaw
                ok.calendarioDelApartamento.estadoSincronizacion = "sincronizado"
            } catch (errorCapturado) {
                ok.calendarioDelApartamento.estadoSincronizacion = "noSincronizado"
            }
            const calendarioObjeto = constructorObjetoEvento(calendarioDatos)
            ok.calendarioDelApartamento.calendarioObjeto = calendarioObjeto
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}