import { conexion } from "../../../componentes/db.mjs";


export const obtenerDesgloseFinancieroPorReservaUID = async (reservaUID) => {
    try {

        const consulta = `
        SELECT
            *
        FROM 
            "reservaFinanciero"
        WHERE 
            "reservaUID" = $1;`;
        const resuelve = await conexion.query(consulta, [reservaUID]);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

