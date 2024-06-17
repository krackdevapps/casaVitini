import { DateTime } from 'luxon';

// Pasas una fecha de a un fecha de salida y un apartmaento y te da todos el tema
export const constructorObjetoEstructuraPrecioDia = (fechaEntrada_ISO, fechaSalida_ISO) => {
    const arregloFechas = [];
    let fechaEntrada_Objeto = DateTime.fromISO(fechaEntrada_ISO); // Convertir la fecha de entrada a un objeto DateTime
    const fechaSalida_Objeto = DateTime.fromISO(fechaSalida_ISO);
    while (fechaEntrada_Objeto <= fechaSalida_Objeto) {
        arregloFechas.push(fechaEntrada_Objeto.toISODate());
        fechaEntrada_Objeto = fechaEntrada_Objeto.plus({ days: 1 }); // Avanzar al siguiente día
    }
    return arregloFechas;
};
