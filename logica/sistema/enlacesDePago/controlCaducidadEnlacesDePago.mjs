import { DateTime } from 'luxon';
import { codigoZonaHoraria } from '../configuracion/codigoZonaHoraria.mjs';
import { eliminarEnlacesDePagoPorCaducidad } from '../../repositorio/enlacesDePago/eliminarEnlacesDePagoPorCaducidad.mjs';
export const controlCaducidadEnlacesDePago = async () => {
    try {
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActual = tiempoZH.toISO();
        console.log("fechaActual", fechaActual)

        const enlacesDePagoCaducados = await eliminarEnlacesDePagoPorCaducidad(fechaActual)
        console.log("enlacesDePagoCaducados", enlacesDePagoCaducados)

        if (enlacesDePagoCaducados.length === 0) {
            const ok = "Ningún enlace ha caducado."
            return ok
        }
        if (enlacesDePagoCaducados.length > 0) {
            return enlacesDePagoCaducados
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
