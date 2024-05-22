import { DateTime } from "luxon";
import { eliminarEnlacesDePagoPorCaducidad } from "../../repositorio/enlacesDePago/eliminarEnlacesDePagoPorCaducidad.mjs";
export const controlCaducidad = async () => {
    try {
        const fechaActual = DateTime.utc().toISO();
        await eliminarEnlacesDePagoPorCaducidad(fechaActual)
    } catch (errorCapturado) {
        throw error;
    }
}