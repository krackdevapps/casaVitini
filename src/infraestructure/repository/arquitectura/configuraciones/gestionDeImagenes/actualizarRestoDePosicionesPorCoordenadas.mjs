import { conexion } from "../../../globales/db.mjs"

export const actualizarRestoDePosicionesPorCoordenadas = async (data) => {
    try {
        const apartamentoIDV = data.apartamentoIDV
        const imagenUID_enMovimiento = data.imagenUID_enMovimiento
        const posicionInicial = data.posicionInicial
        const posicionFinal = data.posicionFinal
        const operacion = data.operacion

        if (operacion !== "+" && operacion!== "-") {
            const m = "operacion solo espera + o -"
            throw new Error(m)
        }

        const consulta = `
        UPDATE
        "configuracionAlojamientoImagenes"
        SET
        posicion = posicion ${operacion} 1
        WHERE
            "apartamentoIDV" = $2
            AND
            "imagenUID" <> $1
            AND
            posicion >= $3
            AND
            posicion <= $4;
        ;
        `;
        const parametros = [
            imagenUID_enMovimiento,
            apartamentoIDV,
            posicionInicial,
            posicionFinal,
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}