import { conexion } from "../../../componentes/db.mjs"

export const eliminarTotalesPorApartamentoPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        DELETE FROM "reservaTotalesPorApartamento"
        WHERE reserva = $1;
        `
        const resuelve = await conexion.query(consulta, [reservaUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

