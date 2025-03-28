import { conexion } from "../globales/db.mjs";

export const eliminarFilaRegistroPorUID = async (elementoUID) => {
    try {
        const consulta = `
        DELETE FROM "inventarioGeneralRegistro"
        WHERE uid = $1
        RETURNING *;
        `;
        const resuelve = await conexion.query(consulta, [elementoUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }

}