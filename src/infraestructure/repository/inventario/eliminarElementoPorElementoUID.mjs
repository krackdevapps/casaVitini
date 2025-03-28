import { conexion } from "../globales/db.mjs";

export const eliminarElementoPorElementoUID = async (elementoUID) => {
    try {
        const consulta = `
        DELETE FROM "inventarioGeneral"
        WHERE "UID" = $1;
        `;
        const resuelve = await conexion.query(consulta, [elementoUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }

}