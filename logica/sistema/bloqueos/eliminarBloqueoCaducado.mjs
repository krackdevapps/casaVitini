import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../configuracion/codigoZonaHoraria.mjs";

export const eliminarBloqueoCaducado = async (entrada, salida) => {
    try {
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActual_ISO = tiempoZH.toISODate();
        await eliminarBloqueoCaducado(fechaActual_ISO)
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}