import { conexion } from "../../componentes/db.mjs";

export const obtenerCalendarioPorCalendarioUIDPublico = async (data) => {
    try {
        const publicoUID = data.publicoUID
        const errorSi = data.errorSi

        const consulta = `
        SELECT *
        FROM "calendariosSincronizados"
        WHERE "publicoUID" = $1
        `;
        const resuelve = await conexion.query(consulta, [publicoUID])
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                error: "22 No existe el calendarioUID, revisa el nombre identificador"
                throw new Error(error)
            }
            return resuelve.rows[0]
        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe una calendario con ese identificador.";
                throw new Error(error)
            }
            return resuelve.rows[0]
        } else if (errorSi === "desactivado") {
            return resuelve.rows
        } else {
            const error = "el adaptador obtenerHabitacionComoEntidadPorHabitacionIDV necesita errorSi en existe, noExiste o desactivado"
            throw new Error(error)
        }
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}