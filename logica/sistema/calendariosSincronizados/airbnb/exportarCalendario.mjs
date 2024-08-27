import ical from 'ical-generator';
export const exportarClendario = async (eventos) => {
    const cal = ical({
        domain: 'casavitini.com',
        name: 'Airbnb Calendar',
        prodId: { company: 'Airbnb Inc', product: 'Hosting Calendar 0.8.8', language: 'EN', tzSource: 'TZINFO' },
        timezone: 'UTC',
        version: "2.0",
        CALSCALE: "GREGORIAN"
    });
    const eventosFormato = [
        {
            start: 'VALUE=DATE:20240824',
            end: 'VALUE=DATE:20240830',
            summary: 'Prueba del foramto',
            //uid: '1418fb94e984-568dff80efad5b02bef48955789d6807@airbnb.com',
            description: 'Reserva de casavitini'
        }
    ]
    eventos.forEach(evento => {
        cal.createEvent({
            start: evento.start,
            end: evento.end,
            summary: evento.summary,
            description: evento.description
        });

    });

    return cal.toString();
}
