import { conexion } from "../../componentes/db.mjs";
export const obtenerOfertasPorNombreUI = async (nombreUI) => {
    try {
        const consulta = `
        SELECT "nombreOferta"
        FROM ofertas
        WHERE lower("nombreOferta") = lower($1);
        `
        const resuelve = await conexion.query(consulta, [nombreUI])
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
