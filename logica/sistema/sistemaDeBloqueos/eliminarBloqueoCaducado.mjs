import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../codigoZonaHoraria.mjs";
import { conexion } from "../../componentes/db.mjs";

export const eliminarBloqueoCaducado = async (entrada, salida) => {
    try {
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActual_ISO = tiempoZH.toISODate();
        const eliminarBloqueo = `
                            DELETE FROM "bloqueosApartamentos"
                            WHERE salida < $1;
                            `;
        await conexion.query(eliminarBloqueo, [fechaActual_ISO]);
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}