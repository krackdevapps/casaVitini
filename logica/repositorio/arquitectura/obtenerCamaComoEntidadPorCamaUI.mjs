import { conexion } from "../../componentes/db.mjs";

export const obtenerCamaComoEntidadPorCamaUI = async (camaUI) => {
    try {

        const consulta = `
            SELECT
            *
            FROM camas
            WHERE "camaUI" = $1;`;
        const resuelve = await conexion.query(consulta, [camaUI])
        return resuelve.rows
    } catch (errorAdaptador) {
        const error = "Error en el adaptador obtenerCamaComoEntidadPorCamaUI"
        throw new Error(error)
    }

}