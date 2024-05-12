import { conexion } from "../../componentes/db.mjs";

export const insertarCaracteristicaDelApartamento = async (data) => {

    const caracteristicas = data.caracteristicas
    const apartamentoIDV = data.apartamentoIDV
    
    try {
        const consulta =`
        INSERT INTO 
        "apartamentosCaracteristicas" 
        (caracteristica, "apartamentoIDV")
        SELECT 
        unnest($1::text[]), $2
        `;
        const resuelve = await conexion.query(consulta, [caracteristicas, apartamentoIDV]);
        return resuelve
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}