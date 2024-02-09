import ICAL from 'ical.js';
import axios from 'axios';


const calendarioDatos = `
BEGIN:VCALENDAR
PRODID;X-RICAL-TZSOURCE=TZINFO:-//Airbnb Inc//Hosting Calendar 0.8.8//EN
CALSCALE:GREGORIAN
VERSION:2.0
BEGIN:VEVENT
DTEND;VALUE=DATE:20240117
DTSTART;VALUE=DATE:20240110
UID:1418fb94e984-fd750dae447c27fecc58552675dd2f50@airbnb.com
DESCRIPTION:Reservation URL: https://www.airbnb.com/hosting/reservations/
 details/HMBRPQHZ5C\nPhone Number (Last 4 Digits): 5013
SUMMARY:Reserved
END:VEVENT
BEGIN:VEVENT
DTEND;VALUE=DATE:20240124
DTSTART;VALUE=DATE:20240121
UID:1418fb94e984-98e7871b7cc5a74e5200876260a0bb03@airbnb.com
DESCRIPTION:Reservation URL: https://www.airbnb.com/hosting/reservations/
 details/HMMCSSXQYB\nPhone Number (Last 4 Digits): 1499
SUMMARY:Reserved
END:VEVENT
BEGIN:VEVENT
DTEND;VALUE=DATE:20240202
DTSTART;VALUE=DATE:20240126
UID:1418fb94e984-ac3665116d4ae85d974b2adfc1251433@airbnb.com
DESCRIPTION:Reservation URL: https://www.airbnb.com/hosting/reservations/
 details/HMECSRFED2\nPhone Number (Last 4 Digits): 8314
SUMMARY:Reserved
END:VEVENT
BEGIN:VEVENT
DTEND;VALUE=DATE:20250112
DTSTART;VALUE=DATE:20250101
UID:6fec1092d3fa-90e91084f31dc44707cf607d39e5112d@airbnb.com
SUMMARY:Airbnb (Not available)
END:VEVENT
END:VCALENDAR

`
try {
    // Realiza la solicitud HTTP para obtener el contenido del archivo ical
    const urlCalenario = "https://www.airbnb.com/calendar/ical/995007946836346231.ics?s=0fa56c34dc7f49041f097b2635be11f6&locale=es"
    const response = await axios.get(urlCalenario);

    // Parsea el contenido usando ical.js
    const jcalData = ICAL.parse(response.data);
    const comp = new ICAL.Component(jcalData);

    const eventosCalenario = comp.jCal[2]
    //console.log("eventosCalenario",eventosCalenario)

    // Itera array los eventos en el componente VCALENDAR
    const arrayFinal = []
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
        arrayFinal.push(eventoObjeto)
    });

    console.log(arrayFinal)
} catch (error) {
    console.error('Error al obtener el archivo ical:', error.message);
    throw error; // Re-lanza el error para que el llamador pueda manejarlo si es necesario
}



// test de sincronizacion