import axios from 'axios';
import ICAL from 'ical.js';
import { conexion } from '../../../db.mjs';

const eventosCalendarioPorUID = async (calendarioUID) => {
    try {
        const filtroCadena = /^[0-9]+$/;
        if (!calendarioUID || !filtroCadena.test(calendarioUID)) {
            const error = "Hay que definir la calendarioUID, solo se admiten numeros sin espacios.";
            throw new Error(error);
        }

        const consultaSelecionaCalendario = `
        SELECT 
        uid,
        nombre,
        url,
        "dataIcal",
        "apartamentoIDV"
        FROM 
        "calendariosSincronizados" 
        WHERE 
        uid = $1 AND "plataformaOrigen" = $2`
        const plataformaDeOrigen = "airbnb"
        const resuelveSelecionarCalendario = await conexion.query(consultaSelecionaCalendario, [calendarioUID, plataformaDeOrigen])
        const ok = {
            calendariosPorApartamento: []
        }

        if (resuelveSelecionarCalendario.rowCount > 0) {
            const errorDeFormato = "En la direccion URL que has introducido no hay un calendario iCal de Airbnb"
            const calendariosDelApartamento = resuelveSelecionarCalendario.rows[0]
            const calendarioUID = calendariosDelApartamento.uid
            const url = calendariosDelApartamento.url

            const nombre = calendariosDelApartamento.nombre
            let calendarioDatos = calendariosDelApartamento.dataIcal
            ok.apartamentoIDV = calendariosDelApartamento.apartamentoIDV

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
                const actualizarCalendario = `
                    UPDATE "calendariosSincronizados"
                    SET 
                    "dataIcal" = COALESCE($1, "dataIcal")
                    WHERE uid = $2;
                    `;
                const datosParaActualizar = [
                    calendarioRaw,
                    calendarioUID
                ];
                const resuelveActualizarCalendario = await conexion.query(actualizarCalendario, datosParaActualizar);
                if (resuelveActualizarCalendario.rowCount === 0) {
                    const error = "Los datos actualizados tras la sincronizacion se han enviado a la base de datos pero el servidor de base de datos informa que no se ha actualizado el calendario. Vuelve a intentarlo mas tarde.";
                    throw new Error(error);
                }
                calendarioDatos = calendarioRaw
                estructura.estadoSincronizacion = "sincronizado"
            } catch (errorCapturado) {
                console.log("errorCapturado", errorCapturado.message)
                estructura.estadoSincronizacion = "noSincronizado"
            }
            const jcalData = ICAL.parse(calendarioDatos);
            const jcal = new ICAL.Component(jcalData);
            const eventosCalenario = jcal.jCal[2]

            const calendarioObjeto = []
            eventosCalenario.forEach((event) => {
                const detallesEventoSinFormatear = event[1]
                // console.log("detallesEventoSinFormatear", detallesEventoSinFormatear)

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

export {
    eventosCalendarioPorUID
}