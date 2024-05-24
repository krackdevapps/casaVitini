import { conexion } from "../../../../componentes/db.mjs"

export const insertarCamaComoEntidad = async (data) => {

    const camaIDV = data.camaIDV
    const camaUI = data.camaUI
    const capacidad = data.capacidad

    try {
        const consulta = `
        INSERT INTO camas
        (
        "camaIDV",
        "camaUI",
        capacidad
        )
        VALUES 
        (
        $1,
        $2,
        $3
        )
        RETURNING *
        `;
        const resuelve = await conexion.query(consulta, [camaIDV, camaUI, capacidad]);
        if (resuelve.rowCount === 0) {
            const error = "No seha insertado la cama como entidad"
            throw error
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}