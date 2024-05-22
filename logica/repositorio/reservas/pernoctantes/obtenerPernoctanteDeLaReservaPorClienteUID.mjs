import { conexion } from "../../../componentes/db.mjs"

export const obtenerPernoctanteDeLaReservaPorClienteUID = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const clienteUID = data.clienteUID

        const consulta = `
        SELECT 
        *
        FROM "reservaPernoctantes"
        WHERE "clienteUID" = $1 AND "reservaUID" = $2
        `;
        const parametros = [
            reservaUID,
            clienteUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

