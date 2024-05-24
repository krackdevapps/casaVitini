import { conexion } from "../../componentes/db.mjs";
export const eliminarEnlaceDePagoPorReservaUID = async (reservaUID) => {
    try {
        const consulta =  `
        DELETE FROM "enlacesDePago"
        WHERE "reservaUID" = $1
        RETURNING *;
        `;
        const resuelve = await conexion.query(consulta, [reservaUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

