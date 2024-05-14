import { conexion } from "../../componentes/db.mjs";

export const obtenerImpuestosPorNombreDelImpuesto = async (nombreDelImpuesto) => {
    try {
        const consulta = `
        SELECT 
        nombre
        FROM impuestos
        WHERE LOWER(nombre) = LOWER($1)
        `;
        const resuelve = await conexion.query(consulta, [nombreDelImpuesto]);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}