import { DateTime, Interval } from "luxon";
import { obtenerParametroConfiguracion } from "../../shared/configuracion/obtenerParametroConfiguracion.mjs";
import { codigoZonaHoraria } from "../../shared/configuracion/codigoZonaHoraria.mjs";

export const horaLimiteDelMismoDia = async () => {
    try {
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActual = tiempoZH.toISODate()

        const paresConfiguracion = await obtenerParametroConfiguracion([
            "horaLimiteDelMismoDia",
            "diasAntelacionReserva"
        ])
        const diasAntelacionReserva = paresConfiguracion.diasAntelacionReserva

        const mismoDiaAceptable = diasAntelacionReserva === "0" ? "si" : "no"
        const ok = {
            ok: "Aquí tienes la configuración limite para el mismo día.",
            mismoDiaAceptable,
            zonaHoraria,
            fechaActual

        }
        if (mismoDiaAceptable === "si") {
            const horaLimiteDelMismoDia = paresConfiguracion.horaLimiteDelMismoDia
            const horaComparar = DateTime.fromFormat(horaLimiteDelMismoDia, "HH:mm", { zone: zonaHoraria });
            const intervalo = Interval.fromDateTimes(tiempoZH, horaComparar);
            const duracion = intervalo.toDuration(['days', 'hours', 'minutes', 'seconds']);


            ok.horaLimiteDelMismoDia = horaLimiteDelMismoDia
            if (tiempoZH > horaComparar) {
                ok.estadoAceptacion = "no"

            } else {
                ok.estadoAceptacion = "si"
                ok.cuentaAtras = {
                    dias: duracion.days,
                    horas: duracion.hours,
                    minutos: duracion.minutes,
                    segundos: Number(duracion.seconds.toFixed(0))
                }
            }
        }

        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}