import ICAL from 'ical.js';

export const constructorObjetoEvento = (calendarioDatos) => {

    const jcalData = ICAL.parse(calendarioDatos);
    const jcal = new ICAL.Component(jcalData);
    const eventosCalenario = jcal.jCal[2]
    const calendarioObjeto = []
    eventosCalenario.forEach((event) => {
        const detallesEventoSinFormatear = event[1]
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

        const fechaInicioEvento = eventoObjeto.fechaInicio
        const fechaFinalEvento = eventoObjeto.fechaFinal
        calendarioObjeto.push(eventoObjeto)
    });
    return calendarioObjeto

}