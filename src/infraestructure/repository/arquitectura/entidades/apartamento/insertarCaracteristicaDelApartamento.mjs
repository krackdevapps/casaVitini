import { conexion } from "../../../globales/db.mjs"

export const insertarCaracteristicaDelApartamento = async (data) => {

    const caracteristica = data.caracteristica
    const apartamentoIDV = data.apartamentoIDV

    try {
        const consulta = `
        INSERT INTO 
        "apartamentosCaracteristicas" 
        (
        "caracteristicaUI",
        "apartamentoIDV"
        )
        VALUES
        (
        $1, 
        $2
        )
        RETURNING
        *
        `;
        const resuelve = await conexion.query(consulta, [caracteristica, apartamentoIDV]);
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado la característica como entidad."
            throw error
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}