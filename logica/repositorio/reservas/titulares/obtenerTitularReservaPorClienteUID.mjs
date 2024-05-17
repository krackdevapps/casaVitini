import { conexion } from "../../../componentes/db.mjs";
export const obtenerTitularReservaPorClienteUID_array = async (clienteUID_array) => {
    try {
        const consulta = `                       
        SELECT 
            "reservaUID"
        FROM
            "reservaTitulares"
        WHERE
            "clienteUID" = ANY($1::int[])`;

        const resuelve = await conexion.query(consulta, [clienteUID_array])
        return resuelve.rows
    } catch (error) {
        throw error
    }
}
