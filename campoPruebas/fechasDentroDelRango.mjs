import { DateTime } from "luxon";

function controlRango(fechaMMYYYY, rangoInicioISO, rangoFinISO) {
    // Convertir la fecha MM-YYYY a formato ISO
    const fechaISO = DateTime.fromFormat(fechaMMYYYY, 'MM-yyyy').startOf('month');

    // Convertir las fechas de inicio y fin del rango a objetos DateTime
    const rangoInicio = DateTime.fromISO(rangoInicioISO).startOf('month');
    const rangoFin = DateTime.fromISO(rangoFinISO).endOf('month');

    // Verificar si el mes y el año están dentro del rango
    return fechaISO >= rangoInicio && fechaISO <= rangoFin;
}


// Ejemplo de uso
const fechaMMYYYY = '01-2024';
const rangoInicioISO = '2024-01-05';
const rangoFinISO = '2024-02-02';

if (controlRango(fechaMMYYYY, rangoInicioISO, rangoFinISO)) {
    console.log(`${fechaMMYYYY} está dentro del rango.`);
} else {
    console.log(`${fechaMMYYYY} está fuera del rango.`);
}
