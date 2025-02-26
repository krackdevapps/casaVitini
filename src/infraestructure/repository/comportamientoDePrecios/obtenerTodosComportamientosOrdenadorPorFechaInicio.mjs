import { conexion } from "../globales/db.mjs";
export const obtenerComportamientosOrdenadorPorFechaInicio = async () => {
    try {

        const consulta = `
        SELECT
        *
        FROM 
        "comportamientoPrecios"
        `;

        const resuelve = await conexion.query(consulta);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
