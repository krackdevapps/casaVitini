import { conexion } from "../../../../componentes/db.mjs"

export const insertarCaracteristicaArrayEnConfiguracionDeAlojamiento = async (data) => {

    const caracteristicasArray = data.caracteristicasArray
    const apartamentoIDV = data.apartamentoIDV

    try {
        const consulta = `
        INSERT INTO "apartamentosCaracteristicas" ("caracteristicaUI", "apartamentoIDV")
        SELECT unnest($1::text[]), $2;
        `;
        const resuelve = await conexion.query(consulta, [caracteristicasArray, apartamentoIDV]);
        if (resuelve.rowCount === 0) {
            const error = "No se han insertado las caracteristicas como entidad"
            throw error
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}