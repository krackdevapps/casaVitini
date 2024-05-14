import { conexion } from "../../componentes/db.mjs";

export const obtenerImpuestosPorAplicacionSobre = async (data) => {
    try {

        const aplicacionSobre = data.aplicacionSobre
        const estado = data.estado
            
        const consulta =`
        SELECT
        nombre, "tipoImpositivo", "tipoValor"
        FROM
        impuestos
        WHERE
        "aplicacionSobre" = ANY($1)
        AND estado = $3;
        `;
        const parametros = [
            aplicacionSobre,
            estado
        ]
        const resuelve = await conexion.query(consulta, parametros); 
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}