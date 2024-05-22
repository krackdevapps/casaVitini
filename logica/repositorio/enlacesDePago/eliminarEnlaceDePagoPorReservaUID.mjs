import { conexion } from "../../componentes/db.mjs";
export const eliminarEnlaceDePagoPorReservaUID = async (reservaUID) => {
    try {
        const consulta =  `
        DELETE FROM "enlacesDePago"
        WHERE reserva = $1;
        `;
        const resuelve = await conexion.query(consulta, [reservaUID]);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

