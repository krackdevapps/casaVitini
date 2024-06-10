import { conexion } from "../../componentes/db.mjs";

export const obtenerImpuestosPorAplicacionIDVPorEstado = async (data) => {
    try {
        const aplicacionSobre_array = data.aplicacionSobre_array
        const estadoIDV = data.estadoIDV
        const consulta = `
        SELECT 
        *
        FROM impuestos 
        WHERE 
        "aplicacionSobreIDV" = ANY($1)
        AND 
        "estadoIDV" = $2`
        const parametros = [
            aplicacionSobre_array,
            estadoIDV
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}