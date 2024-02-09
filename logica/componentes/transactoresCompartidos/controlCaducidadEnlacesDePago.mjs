import { DateTime } from 'luxon';
import { conexion } from '../db.mjs';
import { codigoZonaHoraria } from './codigoZonaHoraria.mjs';

const controlCaducidadEnlacesDePago = async () => {
    try {
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActual = tiempoZH.toISO();
        const eliminarEnlacesCaducados = `
                    DELETE FROM "enlacesDePago"
                    WHERE caducidad < $1;
                    `
        const resuelveEliminarEnlace = await conexion.query(eliminarEnlacesCaducados, [fechaActual])
        if (resuelveEliminarEnlace.rowCount === 0) {
            const ok = "Ningun enlace ha caducado"
            return ok
        }
        if (resuelveEliminarEnlace.rowCount > 0) {
            const enlacesCaducados = resuelveEliminarEnlace.rows
            return enlacesCaducados
        }
    } catch (error) {
        throw error
    }
}


export {
    controlCaducidadEnlacesDePago
}