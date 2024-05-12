import { conexion } from "../../componentes/db.mjs";

export const obtenerBloqueoPorBloqueoUID = async (bloqueoUID) => {
    try {

        const consulta = `
        SELECT
        uid,
        to_char(entrada, 'YYYY-MM-DD') as "fechaInicioBloqueo_ISO", 
        to_char(salida, 'YYYY-MM-DD') as "fechaFinBloqueo_ISO"
        apartamento,
        "tipoBloqueo",
        motivo,
        zona
        FROM "bloqueosApartamentos"
        WHERE uid = $1;`;
        const resuelve = await conexion.query(consulta, [bloqueoUID])
        if (resuelve.rowCount === 0) {
            const error = "No existe el bloqueo, revisa el bloqueoUID";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}