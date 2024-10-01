import { conexion } from "../../../globales/db.mjs";


export const eliminarTotalesPorNochePorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        DELETE FROM "reservaTotalesPorNoche"
        WHERE reserva = $1;
        `;
        const resuelve = await conexion.query(consulta, [reservaUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

