import { conexion } from "../globales/db.mjs";

export const obtenerTodasLosControladores = async () => {
    try {
        const consulta = `
        SELECT 
        *
        FROM
        permisos.controladores;
        `;
        const vE = await conexion.query(consulta);
        const vistaExistente = vE.rows

        return vistaExistente
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}