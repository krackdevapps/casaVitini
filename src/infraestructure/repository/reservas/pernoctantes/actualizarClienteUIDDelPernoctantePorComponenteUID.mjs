import { conexion } from "../../globales/db.mjs"

export const actualizarClienteUIDDelPernoctantePorComponenteUID = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const pernoctanteUID = data.pernoctanteUID
        const clienteUID = data.clienteUID

        const consulta = `
        UPDATE "reservaPernoctantes"
        SET "clienteUID" = $3
        WHERE
        "reservaUID" = $1
        AND
        "componenteUID" = $2
        RETURNING
        "habitacionUID";
        `;
        const parametros = [
            reservaUID,
            pernoctanteUID,
            clienteUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido actualizar al pernoctante dentro de la reserva.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

