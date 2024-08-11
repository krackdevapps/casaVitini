import { conexion } from "../../../../componentes/db.mjs"
export const obtenerCamaComoEntidadPorCamaUI = async (data) => {
    try {
        const errorSi = data.errorSi
        const camaUI = data.camaUI
        const consulta = `
            SELECT
            *
            FROM camas
            WHERE "camaUI" = $1;`;
        const resuelve = await conexion.query(consulta, [camaUI])
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = "No se encuntra ninguna cama con ese camaUI"
                throw new Error(error)
            }
            return resuelve.rows[0]
        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe una cama con ese camaIDV"
                throw new Error(error)
            }
            return resuelve.rows[0]
        } else if (errorSi === "desactivado") {
            return resuelve.rows[0]
        } else {
            const error = "el adaptador obtenerCamaComoEntidadPorCamaUI necesita errorSi en existe, noExiste o desactivado"
            throw new Error(error)
        }
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}