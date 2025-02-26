import { DateTime } from 'luxon';


export const constructorObjetoEstructuraPrecioDia = (fechaEntrada, fechaSalida) => {
    const arregloFechas = [];
    let fechaEntrada_Objeto = DateTime.fromISO(fechaEntrada); // Convertir la fecha de entrada a un objeto DateTime
    const fechaSalida_Objeto = DateTime.fromISO(fechaSalida);
    while (fechaEntrada_Objeto <= fechaSalida_Objeto) {
        arregloFechas.push(fechaEntrada_Objeto.toISODate());
        fechaEntrada_Objeto = fechaEntrada_Objeto.plus({ days: 1 }); // Avanzar al siguiente día
    }
    return arregloFechas;
};
