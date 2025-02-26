import { conexion } from "../../../globales/db.mjs"

export const eliminarCamaComoEntidad = async (camaIDV) => {

    try {
        const consulta = `
        DELETE FROM "camas"
        WHERE "camaIDV" = $1;
        `;
        const resuelve = await conexion.query(consulta, [camaIDV]);
        return resuelve
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}