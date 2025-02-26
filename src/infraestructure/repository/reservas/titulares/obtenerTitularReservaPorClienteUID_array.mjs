import { conexion } from "../../globales/db.mjs";
export const obtenerTitularReservaPorClienteUID = async (clienteUID_array) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM 
        "reservaTitulares"
        WHERE 
        "reservaUID" = $1;`;

        const resuelve = await conexion.query(consulta, [clienteUID_array])
        if (resuelve.rowCount === 0) {
            const error = "Esta reserva no tiene ningún titular asignado.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
