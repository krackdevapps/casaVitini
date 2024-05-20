import { DateTime } from 'luxon';
import { validadoresCompartidos } from '../validadores/validadoresCompartidos.mjs';
import { codigoZonaHoraria } from '../configuracion/codigoZonaHoraria.mjs';
import { obtenerParametroConfiguracion } from '../configuracion/obtenerParametroConfiguracion.mjs';
export const limitesReservaPublica = async (fechas) => {
    try {
        const fechaEntrada_ISO = fechas.fechaEntrada_ISO
        const fechaSalida_ISO = fechas.fechaSalida_ISO
        await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: fechaEntrada_ISO,
            nombreCampo: "La fecha de entrada de la reserva"
        })
        await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: fechaSalida_ISO,
            nombreCampo: "La fecha de salida de la reserva"
        })

        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActualTZ = tiempoZH.toISODate()

        const fechaEntradaReserva_ISO = DateTime.fromISO(fechaEntrada_ISO, { zone: zonaHoraria });
        const fechaSalidaReserva_ISO = DateTime.fromISO(fechaSalida_ISO, { zone: zonaHoraria });
        if (fechaEntradaReserva_ISO < fechaActualTZ) {
            const error = "La fecha de entrada no puede ser anterior a la fecha actual"
            throw new Error(error)
        }
        // validacion: la fecha de entrada no puede ser superior a la fecha de salida y al mimso tiempo la fecha de salida no puede ser inferior a la fecha de entrada
        if (fechaEntradaReserva_ISO >= fechaSalidaReserva_ISO) {
            const error = "La fecha de entrada no puede ser igual o superior que la fecha de salida"
            throw new Error(error)
        }
        const limiteFuturoReserva = await obtenerParametroConfiguracion("limiteFuturoReserva")
        const diasAntelacionReserva = await obtenerParametroConfiguracion("diasAntelacionReserva")
        const diasMaximosReserva = await obtenerParametroConfiguracion("diasMaximosReserva")
        const fechaLimite_Objeto = tiempoZH.plus({ days: limiteFuturoReserva })
        const diasDeAntelacion = fechaEntradaReserva_ISO.diff(tiempoZH, 'days').toObject().days < 0
            ? 0 :
            Math.ceil(diasDeAntelacion)
        if (diasDeAntelacion < diasAntelacionReserva) {
            const error = `Casa Vitini solo acepta reservas con un minimo de ${diasAntelacionReserva} dias de antelacion. Gracias.`
            throw new Error(error)
        }
        const diferenciaEnDiasLimiteFuturo = fechaLimite_Objeto.diff(fechaSalidaReserva_ISO, 'days').toObject().days;
        if (diferenciaEnDiasLimiteFuturo <= 0) {
            const error = `Como maximo las reservas no pueden superar ${limiteFuturoReserva} dias a partir de hoy. Gracias.`
            throw new Error(error)
        }
        const nochesDeLaReserva = fechaSalidaReserva_ISO.diff(fechaEntradaReserva_ISO, 'days').toObject().days;
        if (nochesDeLaReserva > diasMaximosReserva) {
            const error = `Como maximo las reservas no pueden tener mas de ${diasMaximosReserva} dias con noche. Gracias.`
            throw new Error(error)
        }
        return true
    } catch (error) {
        throw error;
    }
}
