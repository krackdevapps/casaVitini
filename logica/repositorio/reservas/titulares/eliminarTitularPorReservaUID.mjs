import { conexion } from "../../../componentes/db.mjs";
export const eliminarTitularPorReservaUID = async (reservaUID) => {
    try {
        const consulta =`
        DELETE FROM 
        "reservaTitulares"
        WHERE
        "reservaUID" = $1;
        `;
        const resuelve = await conexion.query(consulta, reservaUID)
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}
