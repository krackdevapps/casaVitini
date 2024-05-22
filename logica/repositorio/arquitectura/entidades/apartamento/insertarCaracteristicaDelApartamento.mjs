import { conexion } from "../../../../componentes/db.mjs"

export const insertarCaracteristicaDelApartamento = async (data) => {

    const caracteristica = data.caracteristica
    const apartamentoIDV = data.apartamentoIDV
    
    try {
        const consulta =`
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
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}