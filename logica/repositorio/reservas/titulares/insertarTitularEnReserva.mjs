import { conexion } from "../../componentes/db.mjs";
export const insertarTitularEnReserva = async (data) => {
    try {
        const clienteUID = data.clienteUID
        const reservaUID = data.reservaUID
        const consulta = `
        INSERT INTO "reservaTitulares"
        (
        "titularUID",
        "reservaUID"
        )
        VALUES ($1, $2);`;
        const parametros = {
            clienteUID,
            reservaUID
        }
        const resuelve = await conexion.query(consulta, [parametros])
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido actualizar el titular de la reserva";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}
