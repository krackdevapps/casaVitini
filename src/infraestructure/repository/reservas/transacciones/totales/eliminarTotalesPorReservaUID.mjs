import { conexion } from "../../../globales/db.mjs";

export const eliminarTotalesPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        DELETE FROM "reservaTotales"
        WHERE reserva = $1;
        `
        const resuelve = await conexion.query(consulta, [reservaUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

