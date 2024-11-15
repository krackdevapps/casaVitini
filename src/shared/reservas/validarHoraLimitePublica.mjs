import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../configuracion/codigoZonaHoraria.mjs";
import { obtenerParametroConfiguracion } from "../configuracion/obtenerParametroConfiguracion.mjs";

export const validarHoraLimitePublica = async (data) => {

    try {
        const paresConfiguracion = await obtenerParametroConfiguracion([
            "horaLimiteDelMismoDia",
            "diasAntelacionReserva"
        ])
        const horaLimiteDelMismoDia = paresConfiguracion.horaLimiteDelMismoDia
        const diasAntelacionReserva = paresConfiguracion.diasAntelacionReserva
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const horaComparar = DateTime.fromFormat(horaLimiteDelMismoDia, "HH:mm", { zone: zonaHoraria });
        const mismoDiaAceptable = diasAntelacionReserva === "0" ? "si" : "no"
        const fechaEntrada = data.fechaEntrada
        const fechaEntradaReserva_Objeto = DateTime.fromISO(fechaEntrada, { zone: zonaHoraria });
        const sonIguales = fechaEntradaReserva_Objeto.hasSame(tiempoZH, "day");

        if (mismoDiaAceptable === "si" && sonIguales) {
            if (tiempoZH > horaComparar) {
                const m = `Sentimos informarle que ya no aceptamos reservas con fecha de entrada para el día de hoy. La hora límite para aceptar reservas con fecha de entrada para el día de hoy es ${horaLimiteDelMismoDia}. Esta hora límite está formato 24H en zona hora local de ${zonaHoraria}`
                throw new Error(m)
            }
        }
    } catch (error) {
        throw error
    }
}