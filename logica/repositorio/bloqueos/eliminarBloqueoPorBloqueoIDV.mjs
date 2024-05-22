import { conexion } from "../../componentes/db.mjs";

export const eliminarBloqueoPorBloqueoIDV = async (bloqueoIDV) => {
    try {

        const consulta = `
        DELETE FROM "bloqueosApartamentos"
        WHERE "bloqueoIDV" = $1;
        `;

        const resuelve = await conexion.query(consulta, [bloqueoIDV])
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}