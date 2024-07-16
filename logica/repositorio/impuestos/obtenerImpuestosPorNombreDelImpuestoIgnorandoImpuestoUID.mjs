import { conexion } from "../../componentes/db.mjs";

export const obtenerImpuestosPorNombreDelImpuestoIgnorandoImpuestoUID = async (data) => {
    try {
        const impuesto = data.impuestoUID
        const nombre = data.nombre
        const consulta = `
        SELECT 
        nombre
        FROM impuestos
        WHERE
        LOWER(nombre) = LOWER($1)
        AND
        "impuestoUID" <> $2
        `;
        const parametros = [
            nombre,
            impuesto
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}