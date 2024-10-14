import { conexion } from "../../globales/db.mjs"

export const insertarApartamentoEnSimulacion = async (data) => {
    try {
        const simulacionUID = data.simulacionUID
        const apartamentoIDV = data.apartamentoIDV

        const consulta = `
        INSERT INTO "simulacionesDePrecioAlojamiento"
        (
        "simulacionUID",
        "apartamentoIDV"
        )
        VALUES ($1, $2)
        RETURNING *;
        `;
        const parametros = [
            simulacionUID,
            apartamentoIDV
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido insertar el apartamento en la simulacion."
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

