import { conexion } from "../../componentes/db.mjs";

export const eliminarBloqueoPorBloqueoUID = async (bloqueoUID) => {
    try {

        const consulta = `
        DELETE FROM "bloqueosApartamentos"
        WHERE uid = $1;
        `;
 
        const resuelve = await conexion.query(consulta, [bloqueoUID])
        return resuelve
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}