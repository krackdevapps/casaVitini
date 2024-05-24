import { conexion } from "../../../../componentes/db.mjs";

export const eliminarImpuestosReservaUID = async (reservaUID) => {
    try {
        const consulta =  `
        DELETE FROM "reservaImpuestos"
        WHERE reserva = $1;
        `
        const resuelve = await conexion.query(consulta, [reservaUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

