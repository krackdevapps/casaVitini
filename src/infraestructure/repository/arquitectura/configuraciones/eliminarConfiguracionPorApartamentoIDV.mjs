import { conexion } from "../../globales/db.mjs";

export const eliminarConfiguracionPorApartamentoIDV = async (apartamentoIDV) => {
    try {
        const consulta = `
        DELETE FROM 
        "configuracionApartamento"
        WHERE
         "apartamentoIDV" = $1
         RETURNING 
         *
        `;
        const resuelve = await conexion.query(consulta, [apartamentoIDV]);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}