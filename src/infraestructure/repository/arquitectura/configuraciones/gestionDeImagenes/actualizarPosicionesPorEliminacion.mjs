import { conexion } from "../../../globales/db.mjs"

export const actualizarPosicionesPorEliminacion = async (data) => {
    try {
        const apartamentoIDV = data.apartamentoIDV
        const posicionInicial = data.posicionInicial
    
        const consulta = `
        UPDATE
        "configuracionAlojamientoImagenes"
        SET
        posicion = posicion - 1
        WHERE
            "apartamentoIDV" = $1
            AND
            posicion >= $2
        ;
        `;
        const parametros = [
            apartamentoIDV,
            posicionInicial,
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}