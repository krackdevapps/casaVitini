import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../sistema/configuracion/codigoZonaHoraria.mjs";
export const fechaLocal = async (entrada, salida) => {
    try {
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActualTZ = tiempoZH.toISODate();
        const dia = tiempoZH.day;
        const mes = tiempoZH.month;
        const ano = tiempoZH.year;
        const hora = tiempoZH.hour;
        const minuto = tiempoZH.minute;
        const estructura = {
            zonaHoraria: zonaHoraria,
            dia: dia,
            mes: mes,
            ano: ano,
            hora: hora,
            minuto: minuto,
            fechaISO: fechaActualTZ
        };
        salida.json(estructura);
    } catch (errorCapturado) {
        throw errorCapturado
    }
}