import { conexion } from "../../globales/db.mjs"

export const obtenerPernoctanteDeLaReservaPorClienteUID = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const clienteUID = data.clienteUID

        const consulta = `
        SELECT 
        *
        FROM "reservaPernoctantes"
        WHERE
        "clienteUID" = $2
        AND
        "reservaUID" = $1
        `;
        const parametros = [
            reservaUID,
            clienteUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

