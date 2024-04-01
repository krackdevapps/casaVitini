import { DateTime } from 'luxon';
// Función para verificar si un rango de fechas está contenido en otro
const verificarRangoContenido = (rangoInicio, rangoFin, rangoInicioComparar, rangoFinComparar) => {
    const formatoFecha = 'yyyy-MM-dd';
    const inicio = DateTime.fromFormat(rangoInicio, formatoFecha);
    const fin = DateTime.fromFormat(rangoFin, formatoFecha);
    const inicioComparar = DateTime.fromFormat(rangoInicioComparar, formatoFecha);
    const finComparar = DateTime.fromFormat(rangoFinComparar, formatoFecha);
    // Verificar si el rango de fechas a comparar está totalmente contenido en el otro rango
    if (inicioComparar >= inicio && finComparar <= fin) {
        return "El rango está totalmente contenido.";
    }
    // Verificar si hay intersección entre los rangos de fechas
    if (inicioComparar <= fin && finComparar >= inicio) {
        return "El rango se superpone parcialmente.";
    }
    // Si no se cumple ninguna de las condiciones anteriores, los rangos no se superponen
    return "Los rangos no se superponen.";
}
// Ejemplo de uso
const fechaInicio = '2024-01-01';
const fechaFin = '2024-01-10';
const fechaInicioComparar = '2024-01-02';
const fechaFinComparar = '2024-01-11';
const resultado = verificarRangoContenido(fechaInicio, fechaFin, fechaInicioComparar, fechaFinComparar);

