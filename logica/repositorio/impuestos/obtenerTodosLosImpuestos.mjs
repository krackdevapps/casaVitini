import { conexion } from "../../componentes/db.mjs";

export const obtenerTodosLosImpuestos = async () => {
    try {
        const consulta = `
        SELECT 
        *
        FROM impuestos 
        `
        const resuelve = await conexion.query(consulta);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}