import { DateTime } from "luxon";
import { codigoZonaHoraria } from "./configuracion/codigoZonaHoraria.mjs";

export const obtenerFechaLocal = async (fecha) => {
    const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
    return DateTime.fromISO(fecha, { zone: zonaHoraria });
}