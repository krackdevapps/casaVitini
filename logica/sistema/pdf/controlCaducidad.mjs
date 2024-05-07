import { DateTime } from "luxon";
import { conexion } from "../../componentes/db.mjs";
export const controlCaducidad = async () => {
    try {
        const fechaActual = DateTime.utc().toISO();
        const consultaCaducidadEnlaces = `
        DELETE FROM "enlacesPdf"
        WHERE caducidad < $1;`;
        await conexion.query(consultaCaducidadEnlaces, [fechaActual]);
    } catch (error) {
        throw error;
    }
}