import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../configuracion/codigoZonaHoraria.mjs";
import { obtenerReservasPresentesFuturas } from "../../infraestructure/repository/reservas/selectoresDeReservas/obtenerReservasPresentesFuturas.mjs";

export const reservasPresentesFuturas = async () => {
    const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
    const tiempoZH = DateTime.now().setZone(zonaHoraria);
    const fechaActual = tiempoZH.toISODate();

    const reservasActivas = await obtenerReservasPresentesFuturas({
        fechaActual: fechaActual,
    })
    return reservasActivas
}