import { conexion } from "../../../globales/db.mjs"

export const insertarApartamentoComoEntidad = async (data) => {
    try {

        const apartamentoIDV = data.apartamentoIDV
        const apartamentoUI = data.apartamentoUI
        const apartamentoUIPublico = data.apartamentoUIPublico
        const desfinicionPublica = data.desfinicionPublica

        const consulta = `
        INSERT INTO 
        apartamentos
        (
       "apartamentoIDV",
        "apartamentoUI",
        "apartamentoUIPublico",
        "desfinicionPublica"
        )
        VALUES 
        ( $1, $2, $3, $4 )
        RETURNING 
        "apartamentoIDV"
        `;
        const parametros = [
            apartamentoIDV,
            apartamentoUI,
            apartamentoUIPublico,
            desfinicionPublica
        ]
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado el apartamento como entidad"
            throw error
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}