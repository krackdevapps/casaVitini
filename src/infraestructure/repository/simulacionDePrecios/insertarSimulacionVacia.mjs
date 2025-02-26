import { conexion } from "../globales/db.mjs";

export const insertarSimulacionVacia = async (data) => {
    try {
        const nombre = data.nombre
        const reservaUID = data.reservaUID
        const testingVI = data.testingVI

        const consulta = `
        INSERT INTO
        "simulacionesDePrecio"
        (
        "nombre",
        "reservaUID",
        "testingVI"
        )
        VALUES ($1,$2,$3)
        RETURNING *
        `
        const parametros = [
            nombre,
            reservaUID,
            testingVI
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido insertar la nueva simulacón vacia en insertarSimulacionVacia.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

