import { conexion } from "../../../../componentes/db.mjs"
export const obtenerCamaComoEntidadPorCamaIDVPorTipoIDV = async (data) => {
    try {
        const camaIDV = data.camaIDV
        const tipoIDVArray = data.tipoIDVArray
        const errorSi = data.errorSi

        if (!data.hasOwnProperty("camaIDV")) {
            const error = "el adaptador obtenerCamaComoEntidadPorCamaIDVPorTipoIDV no esta recibineod el camaIDV"
            throw new Error(error)
        }
        if (!data.hasOwnProperty("tipoIDVArray")) {
            const error = "el adaptador obtenerCamaComoEntidadPorCamaIDVPorTipoIDV no esta recibineod el tipoIDVArray"
            throw new Error(error)
        }
        const consulta = `
        SELECT *
        FROM camas 
        WHERE
        "camaIDV" = $1
        AND
        "tipoIDV" = ANY($2);`
        const parametros = [
            camaIDV,
            tipoIDVArray
        ]
        const resuelve = await conexion.query(consulta, parametros)
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = "No se encuentra ninguna cama con ese camaIDV y tipoIDVArray"
                throw new Error(error)
            }
            return resuelve.rows[0]
        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe una cama con ese camaIDV y tipoIDVArray"
                throw new Error(error)
            }
            return resuelve.rows[0]
        } else if (errorSi === "desactivado") {
            return resuelve.rows[0]
        } else {
            const error = "El adaptador obtenerCamaComoEntidadPorCamaIDVPorTipoIDV necesita errorSi en existe, noExiste o desactivado"
            throw new Error(error)
        }
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}
