import { conexion } from "../../../../componentes/db.mjs"

export const obtenerCamaComoEntidadPorCamaUI = async (camaUI) => {
    try {

        const consulta = `
            SELECT
            *
            FROM camas
            WHERE "camaUI" = $1;`;
        const resuelve = await conexion.query(consulta, [camaUI])
        if (resuelve.rowCount === 0) {
            const error = "No se encuntra ninguna cama con ese camaUI"
            throw error
        }
        return resuelve.rows
    } catch (errorAdaptador) {
        const error = "Error en el adaptador obtenerCamaComoEntidadPorCamaUI"
        throw new Error(error)
    }

}