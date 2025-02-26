import { conexion } from "../globales/db.mjs";
export const eliminarComplementoPorComplementoUID = async (complementoUID) => {
    try {
        const consulta = `
        DELETE FROM "complementosDeAlojamiento"
        WHERE "complementoUID" = $1;
        `;
        const resuelve = await conexion.query(consulta, [complementoUID])
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
