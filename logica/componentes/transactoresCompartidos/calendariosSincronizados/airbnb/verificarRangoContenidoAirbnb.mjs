import { DateTime } from "luxon";

const verificarRangoContenidoAirbnb = (rangoInicio, rangoFin, rangoInicioComparar, rangoFinComparar) => {
    const formatoFecha = 'yyyy-MM-dd';

    const inicio = DateTime.fromFormat(rangoInicio, formatoFecha);
    const fin = DateTime.fromFormat(rangoFin, formatoFecha);
    const inicioComparar = DateTime.fromFormat(rangoInicioComparar, formatoFecha);
    const finComparar = DateTime.fromFormat(rangoFinComparar, formatoFecha);

    // Verificar si el rango de fechas a comparar está totalmente contenido en el otro rango
    if (inicioComparar > inicio && finComparar < fin) {
        //"El rango está totalmente contenido."
        return "ocupado";
    }
    // Verificar si hay intersección entre los rangos de fechas
    if (inicioComparar < fin && finComparar > inicio) {
        //"El rango se superpone parcialmente."
        return "ocupado";
    }
    // Si no se cumple ninguna de las condiciones anteriores, los rangos no se superponen
    return "libre";
}

export {
    verificarRangoContenidoAirbnb
}