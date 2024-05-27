import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../configuracion/codigoZonaHoraria.mjs";
import { eliminarBloqueoPorFechaActual } from "../../repositorio/bloqueos/eliminarBloqueoPorFechaActual.mjs";

export const eliminarBloqueoCaducado = async () => {
    try {
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActual_ISO = tiempoZH.toISODate();
        await eliminarBloqueoPorFechaActual(fechaActual_ISO)
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}