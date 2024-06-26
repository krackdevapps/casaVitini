import { conexion } from "../../../componentes/db.mjs"

export const eliminarReservaIrreversiblemente = async (reservaUID) => {
    try {
          const consulta = `
        DELETE FROM
        reservas
        WHERE 
        "reservaUID" = $1;
        `;
        const resuelve = await conexion.query(consulta, reservaUID);
        if (resuelve.rowCount === 0) {
            const error = "No existe la reservas que quieres eliminar";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

