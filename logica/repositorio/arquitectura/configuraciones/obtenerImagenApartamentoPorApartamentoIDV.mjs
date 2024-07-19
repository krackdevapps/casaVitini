import { conexion } from "../../../componentes/db.mjs";
export const obtenerImagenApartamentoPorApartamentoIDV = async (data) => {
    try {
        const apartamentoIDV = data.apartamentoIDV
        const estadoConfiguracionIDV_array = data.estadoConfiguracionIDV_array
        const consulta = `
        SELECT 
        imagen
        FROM "configuracionApartamento"
        WHERE 
        "apartamentoIDV" = $1
        AND 
        "estadoConfiguracionIDV" = ANY($2);
        `;
        const parametros = [
            apartamentoIDV,
            estadoConfiguracionIDV_array
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