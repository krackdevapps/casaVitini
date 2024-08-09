import { conexion } from "../../../../componentes/db.mjs"

export const insertarCamaComoEntidad = async (data) => {

    const camaIDV = data.camaIDV
    const camaUI = data.camaUI
    const capacidad = data.capacidad
    const tipoCama = data.tipoCama

    try {
        const consulta = `
        INSERT INTO camas
        (
        "camaIDV",
        "camaUI",
        capacidad,
        "tipoIDV"
        )
        VALUES 
        (
        $1,
        $2,
        $3,
        $4
        )
        RETURNING *
        `;
        const parametros = [
            camaIDV,
            camaUI,
            capacidad,
            tipoCama
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado la cama como entidad."
            throw error
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}