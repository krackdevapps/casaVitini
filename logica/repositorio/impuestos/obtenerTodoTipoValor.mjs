import { conexion } from "../../componentes/db.mjs";

export const obtenerTodoTipoValor = async () => {
    try {
        const consulta = `
        SELECT 
        "tipoValorIDV", "tipoValorUI", simbolo
        FROM "impuestoTipoValor"
        `;
        const resuelve = await conexion.query(consulta);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}