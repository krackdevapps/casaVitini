import { conexion } from "../../componentes/db.mjs";

export const obtenerBloqueoPorBloqueoUID = async (bloqueoUID) => {
    try {

        const consulta = `
        SELECT
        to_char("fechaInicio", 'YYYY-MM-DD') as "fechaInicio", 
        to_char("fechaFin", 'YYYY-MM-DD') as "fechaFin",
        "apartamentoIDV",
        "tipoBloqueoIDV",
        motivo,
        "zonaIDV"
        FROM "bloqueosApartamentos"
        WHERE "bloqueoUID" = $1;`;
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