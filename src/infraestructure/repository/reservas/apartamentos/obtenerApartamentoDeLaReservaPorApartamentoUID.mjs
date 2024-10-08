import { conexion } from "../../globales/db.mjs"

export const obtenerApartamentoDeLaReservaPorApartamentoUID = async (data) => {
    try {

        const reservaUID = data.reservaUID
        const apartamentoUID = data.apartamentoUID

        const consulta = `
        SELECT 
        *
        FROM "reservaApartamentos"
        WHERE 
        "reservaUID" = $1
        AND 
        "componenteUID" = $2
        `;
        const parametros = [
            reservaUID,
            apartamentoUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

