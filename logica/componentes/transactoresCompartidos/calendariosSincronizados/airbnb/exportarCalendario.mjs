import ical from 'ical-generator';

const exportarClendario = async (eventos) => {
    const cal = ical();
    cal.prodId("//Casas Vitini//Calendario v1.0//EN")
    console.log("eventsoREcivio", eventos)
    const eventosEsquema = [
        {
            start: new Date('2024-02-01T08:00:00'),
            end: new Date('2024-02-01T10:00:00'),
            summary: 'Evento 1 test',
            description: 'Descripción del evento 1'
        },
        {
            start: new Date('2024-02-02T09:00:00'),
            end: new Date('2024-02-02T11:00:00'),
            summary: 'Evento 2 test',
            description: 'Descripción del evento 2'
        }
    ];
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

export {
    exportarClendario
}