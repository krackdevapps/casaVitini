import { conexion } from "../../componentes/db.mjs";

export const obtenerTipoValorPorTipoValorIDV = async (tipoValor) => {
    try {
        const consulta = `
        SELECT 
        nombre
        FROM impuestos
        WHERE LOWER(nombre) = LOWER($1)
        `;
        const resuelve = await conexion.query(consulta, [tipoValor]);
        if (resuelve.rowCount === 0) {
            const error = "No existe el tipo valor verifica el campor tipoValor";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}