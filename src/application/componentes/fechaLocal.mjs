import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../shared/configuracion/codigoZonaHoraria.mjs";
export const fechaLocal = async () => {
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
            ok: "Fecha local",
            zonaHoraria: zonaHoraria,
            dia: dia,
            mes: mes,
            ano: ano,
            hora: hora,
            minuto: minuto,
            fechaISO: fechaActualTZ
        };
        return estructura
    } catch (errorCapturado) {
        throw errorCapturado
    }
}