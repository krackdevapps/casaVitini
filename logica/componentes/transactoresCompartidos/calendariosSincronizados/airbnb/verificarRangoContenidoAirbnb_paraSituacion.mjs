import { DateTime } from "luxon";
// MUY IMPORTANTE -> Este script existe por que verificarRangoContenidoAirbnb necesita validar las reservas estando dentro del rango para permitir compartir dias de entrada y salida con reservas de casa vitini, mientras que este es para sitaucion donde se tiene que mostrar las reservas desde el dia de inicio hasta el dia final
const verificarRangoContenidoAirbnb_paraSituacion = (rangoInicio, rangoFin, rangoInicioComparar, rangoFinComparar) => {
    const formatoFecha = 'yyyy-MM-dd';

    const inicio = DateTime.fromFormat(rangoInicio, formatoFecha);
    const fin = DateTime.fromFormat(rangoFin, formatoFecha);
    const inicioComparar = DateTime.fromFormat(rangoInicioComparar, formatoFecha);
    const finComparar = DateTime.fromFormat(rangoFinComparar, formatoFecha);

    // Verificar si el rango de fechas a comparar está totalmente contenido en el otro rango
    if (inicioComparar >= inicio && finComparar <= fin) {
        //"El rango está totalmente contenido."
        return "ocupado";
    }
    // Verificar si hay intersección entre los rangos de fechas
    if (inicioComparar <= fin && finComparar >= inicio) {
        //"El rango se superpone parcialmente."
        return "ocupado";
    }
    // Si no se cumple ninguna de las condiciones anteriores, los rangos no se superponen
    return "libre";
}

export {
    verificarRangoContenidoAirbnb_paraSituacion
}