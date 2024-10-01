import { conexion } from "../../globales/db.mjs"

export const insertarServicioPorReservaUID = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const nombre = data.nombre
        const contenedor = data.contenedor

        const consulta = `
        INSERT INTO "reservaServicios"
        (
        "reservaUID",
        "nombre",
        "contenedor"
        )
        VALUES ($1, $2, $3)
        RETURNING *
        `;
        const parametros = [
            reservaUID,
            nombre,
            contenedor
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const m = "No se ha insertado el servicio en la reserva."
            throw new Error(m)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

