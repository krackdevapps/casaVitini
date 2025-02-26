import { conexion } from "../globales/db.mjs";

export const eliminarEnlaceDePagoPorEnlaceUID = async (enlaceUID) => {
    try {
        const consulta = `
        DELETE FROM "enlacesDePago"
        WHERE "enlaceUID" = $1
        RETURNING
        *;
        `;
        const resuelve = await conexion.query(consulta, [enlaceUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

