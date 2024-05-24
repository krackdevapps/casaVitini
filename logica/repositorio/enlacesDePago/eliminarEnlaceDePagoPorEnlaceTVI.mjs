import { conexion } from "../../componentes/db.mjs";

export const eliminarEnlaceDePagoPorEnlaceTVI = async (EnlaceTVI) => {
    try {
        const consulta = `
        DELETE FROM "enlacesDePago"
        WHERE "enlaceTVI" = $1;
        `;
        const resuelve = await conexion.query(consulta, [EnlaceTVI]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

