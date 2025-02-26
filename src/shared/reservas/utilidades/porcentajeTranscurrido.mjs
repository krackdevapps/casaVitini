import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../shared/configuracion/codigoZonaHoraria.mjs";
import { utilidades } from "../../../shared/utilidades.mjs";
import { horasSalidaEntrada as horasSalidaEntrada_ } from "../../../shared/configuracion/horasSalidaEntrada.mjs";
import { obtenerReservaPorReservaUID } from "../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";

export const porcentajeTranscurrido = async (reservaUID) => {
    try {
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActualCompletaTZ = tiempoZH.toISO();

        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const fechaEntradaReservaISO = reserva.fechaEntrada;
        const fechaSalidaReservaISO = reserva.fechaSalida;
        const horasSalidaEntrada = await horasSalidaEntrada_();
        const horaEntradaTZ = horasSalidaEntrada.horaEntradaTZ;
        const horaSalidaTZ = horasSalidaEntrada.horaSalidaTZ;
        const fechaConHoraEntradaFormato_ISO_ZH = DateTime.fromISO(`${fechaEntradaReservaISO}T${horaEntradaTZ}`, { zone: zonaHoraria }).toISO();
        const fechaConHoraSalidaFormato_ISO_ZH = DateTime.fromISO(`${fechaSalidaReservaISO}T${horaSalidaTZ}`, { zone: zonaHoraria }).toISO();
        const porcentajeTranscurrido = utilidades.calcularPorcentajeTranscurridoUTC(fechaConHoraEntradaFormato_ISO_ZH, fechaConHoraSalidaFormato_ISO_ZH, fechaActualCompletaTZ);

        let porcentajeFinal = porcentajeTranscurrido;
        if (porcentajeTranscurrido >= 100) {
            porcentajeFinal = "100";
        }
        if (porcentajeTranscurrido <= 0) {
            porcentajeFinal = "0";
        }


        return porcentajeFinal
    } catch (errorCapturado) {
        throw errorCapturado
    }
}