import { conexion } from "../../../componentes/db.mjs"

export const eliminarReservaPorReservaTVI = async (reservaTVI) => {
    try {
          const consulta = `
        DELETE FROM
        reservas
        WHERE 
        "reservaTVI" = $1;
        `;
        const resuelve = await conexion.query(consulta, [reservaTVI]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

