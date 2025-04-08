import { conexion } from "../globales/db.mjs";

export const obtenerTodasLasVistas = async () => {
    try {
        const consulta = `
        SELECT 
        *
        FROM
        permisos.vistas;
        `;
        const vE = await conexion.query(consulta);
        const vistaExistente = vE.rows

        return vistaExistente
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}