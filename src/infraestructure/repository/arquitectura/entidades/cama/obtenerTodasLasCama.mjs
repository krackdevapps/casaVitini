import { conexion } from "../../../globales/db.mjs"
export const obtenerTodasLasCamas = async () => {
    try {
        const consulta = `
        SELECT *
        FROM camas;`
        const resolucionNombre = await conexion.query(consulta)
        return resolucionNombre.rows
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}
