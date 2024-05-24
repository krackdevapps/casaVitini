
import { conexion } from "../../../componentes/db.mjs";

export const obtenerImagenApartamentoPorApartamentoIDV = async (apartamentoIDV) => {
    try {
        const consulta = `
        SELECT 
        imagen
        FROM "configuracionApartamento"
        WHERE "apartamentoIDV" = $1;
        `;
        const resuelve = await conexion.query(consulta, [apartamentoIDV]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningun apartamento con ese apartamentoIDV";
            throw error;
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}