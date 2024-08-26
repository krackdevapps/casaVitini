import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../configuracion/codigoZonaHoraria.mjs";
import { obtenerParametroConfiguracion } from "../configuracion/obtenerParametroConfiguracion.mjs";

export const validarHoraLimitePublica = async () => {

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

        if (mismoDiaAceptable === "si") {
            if (tiempoZH > horaComparar) {
                const m = `Sentimos informarle que ya no aceptamos reservas con fecha de entrada para el día de hoy. La hora límite para aceptar reservas con fecha de entrada para el día de hoy es ${horaLimiteDelMismoDia}. Esta hora límite está formato 24H en zona hora local de ${zonaHoraria}`
                throw new Error(m)
            }
        }
    } catch (error) {
        throw error
    }


}