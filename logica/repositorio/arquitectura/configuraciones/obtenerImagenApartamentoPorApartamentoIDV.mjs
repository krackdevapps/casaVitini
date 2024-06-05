import { conexion } from "../../../componentes/db.mjs";
export const obtenerImagenApartamentoPorApartamentoIDV = async (apartamentoIDV) => {
    try {
        const consulta = `
        SELECT 
        imagen
        FROM "configuracionApartamento"
        WHERE 
        "apartamentoIDV" = $1
        AND 
        "estadoConfiguracionIDV" = $2;
        `;
        const parametros = [
            apartamentoIDV,
            "disponible"
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningun apartamento con ese apartamentoIDV";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}