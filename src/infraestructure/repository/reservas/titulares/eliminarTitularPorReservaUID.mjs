import { conexion } from "../../globales/db.mjs";
export const eliminarTitularPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        DELETE FROM 
        "reservaTitulares"
        WHERE
        "reservaUID" = $1;
        `;
        const resuelve = await conexion.query(consulta, [reservaUID])
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
