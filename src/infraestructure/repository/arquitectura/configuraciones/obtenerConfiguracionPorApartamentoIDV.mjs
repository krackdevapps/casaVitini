import { conexion } from "../../globales/db.mjs";

export const obtenerConfiguracionPorApartamentoIDV = async (data) => {
    try {
        const apartamentoIDV = data.apartamentoIDV
        const errorSi = data.errorSi
        const consulta = `
        SELECT 
        "configuracionUID",
        "apartamentoIDV",
        "estadoConfiguracionIDV",
        "zonaIDV"
        FROM "configuracionApartamento"
        WHERE "apartamentoIDV" = $1
        `;
        const resuelve = await conexion.query(consulta, [apartamentoIDV]);
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = "No existe ninguna configuración de alojamiento con el identificador visual apartmentoIDV que has pasado.";
                throw new Error(error)
            }
            return resuelve.rows[0]

        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe una configuración de alojamiento con el identificador visual apartmentoIDV que has pasado.";
                throw new Error(error)
            }
            return resuelve.rows[0]

        } else if (errorSi === "desactivado") {
            return resuelve.rows[0]
        } else {
            const error = "el adaptador obtenerHabitacionComoEntidadPorHabitacionIDV necesita errorSi en existe, noExiste o desactivado"
            throw new Error(error)
        }
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}