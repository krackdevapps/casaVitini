import { conexion } from "../../componentes/db.mjs";

export const obtenerConfiguracionPorApartamentoIDV = async (apartamentoIDV) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM "configuracionApartamento"
        WHERE "apartamentoIDV" = $1;
        `;
        const resuelve = await conexion.query(consulta, [apartamentoIDV]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún apartamento con el identicador visual apartmentoIDV que has pasado.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}