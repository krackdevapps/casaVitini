import { conexion } from "../../../../componentes/db.mjs"

export const actualizarCamaComoEntidadPorCamaIDV = async (data) => {
    try {

        const camaIDVNuevo = data.camaIDVNuevo
        const camaUI = data.camaUI
        const capacidad = data.capacidad
        const camaIDV = data.camaIDV

        const consulta = `
        UPDATE camas
        SET 
        "camaIDV" = COALESCE($1, "camaIDV"),
        "camaUI" = COALESCE($2, "camaUI"),
        capacidad = COALESCE($3, "capacidad")
        WHERE 
        "camaIDV" = $4
        RETURNING
        *
        `;
        const parametros = [
            camaIDVNuevo,
            camaUI,
            capacidad,
            camaIDV
        ]
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "No se encuntra ninguna cama con ese camaIDV para actualizar"
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}