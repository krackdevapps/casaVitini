import axios from 'axios';
import ICAL from 'ical.js';
import { actualizarEventosCalendarioPorCalendarioUID } from '../../../infraestructure/repository/calendario/actualizarEventosCalendarioPorCalendarioUID.mjs';
import { obtenerCalendariosPorPlataformaIDVPorApartamentoIDV } from '../../../infraestructure/repository/calendario/obtenerCalendariosPorPlataformaIDVPorApartamentoIDV.mjs';
import { constructorObjetoEvento } from './constructorObjetoEvento.mjs';

export const sincronizarCalendariosAirbnbPorIDV = async (apartamentoIDV) => {
    try {

        const filtroCadena = /^[a-z0-9]+$/;
        if (!apartamentoIDV || !filtroCadena.test(apartamentoIDV)) {
            const error = "Hay que definir el apartamentoIDV, solo se admiten minusculas y numeros sin espacios.";
            throw new Error(error);
        }
        const plataformaDeOrigen = "airbnb"
        const calendarios = await obtenerCalendariosPorPlataformaIDVPorApartamentoIDV({
            apartamentoIDV: apartamentoIDV,
            plataformaIDV: plataformaDeOrigen
        })
        const ok = {
            apartamentoIDV: apartamentoIDV,
            calendariosPorApartamento: []
        }
        if (calendarios.length > 0) {

            const errorDeFormato = "En la dirección URL que has introducido no hay un calendario iCal de Airbnb."
            for (const detallesDelCalendario of calendarios) {

                const calendarioUID = detallesDelCalendario.calendarioUID
                const url = detallesDelCalendario.url
                let calendarioDatos = detallesDelCalendario.dataIcal
                if (!url || !calendarioDatos) {
                    continue
                }
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
                const calendarioObjeto = constructorObjetoEvento(calendarioDatos)
                estructura.calendarioObjeto = calendarioObjeto
                ok.calendariosPorApartamento.push(estructura)
            }
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
