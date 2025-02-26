import { conexion } from "../globales/db.mjs";
export const obtenerComplementoPorComplementoUID = async (complementoUID) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM 
        "complementosDeAlojamiento" 
        WHERE 
        "complementoUID" = $1`;
        const resuelve = await conexion.query(consulta, [complementoUID])
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún complemento con ese complementoUID";
            throw new Error(error)
        }
        return resuelve.rows[0]

    } catch (errorCapturado) {
        throw errorCapturado
    }
}
