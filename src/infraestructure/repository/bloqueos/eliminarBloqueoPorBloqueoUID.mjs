import { conexion } from "../globales/db.mjs";

export const eliminarBloqueoPorBloqueoUID = async (bloqueoUID) => {
    try {

        const consulta = `
        DELETE FROM "bloqueosApartamentos"
        WHERE "bloqueoUID" = $1
        RETURNING
        *;
        `;

        const resuelve = await conexion.query(consulta, [bloqueoUID])
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}