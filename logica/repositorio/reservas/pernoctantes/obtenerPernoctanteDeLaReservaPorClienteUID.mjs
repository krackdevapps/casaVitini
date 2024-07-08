import { conexion } from "../../../componentes/db.mjs"

export const obtenerPernoctanteDeLaReservaPorClienteUID = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const clienteUID = data.clienteUID
        console.log("data", data)
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

