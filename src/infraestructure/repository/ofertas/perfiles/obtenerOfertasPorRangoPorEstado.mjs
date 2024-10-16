import { conexion } from "../../globales/db.mjs";

export const obtenerOfertasPorRangoPorEstado = async (data) => {
    try {
        const fechaEntradaReserva_ISO = data.fechaEntradaReserva_ISO
        const fechaSalidaReserva_ISO = data.fechaSalidaReserva_ISO
        const estadoIDV = data.estadoIDV
        const zonasArray = data.zonasArray
        const entidadIDV = data.entidadIDV
        const consulta = `
        SELECT 
        "ofertaUID",
        "nombreOferta",
        "entidadIDV",
        "estadoIDV",
        to_char("fechaInicio", 'YYYY-MM-DD') as "fechaInicio", 
        to_char("fechaFinal", 'YYYY-MM-DD') as "fechaFinal", 
        "condicionesArray",
        "descuentosJSON"
        FROM
        ofertas 
        WHERE                     
        (
            (
                -- Caso 1: Evento totalmente dentro del rango
                "fechaInicio" >= $1::DATE AND "fechaFinal" <= $2::DATE
            )
            OR
            (
                -- Caso 2: Evento parcialmente dentro del rango
                ("fechaInicio" < $1::DATE AND "fechaFinal" > $1::DATE)
                OR 
                ("fechaInicio" < $2::DATE AND "fechaFinal" > $2::DATE)
            )
            OR
            (
                -- Caso 3: Evento atraviesa el rango
                "fechaInicio" < $1::DATE AND "fechaFinal" > $2::DATE
            )
        )
        AND
        "estadoIDV" = $3::text
        AND
        "entidadIDV" = $4::text
        AND
        "zonaIDV" = ANY($5)
        ;`
        const parametros = [
            fechaSalidaReserva_ISO,
            fechaEntradaReserva_ISO,
            estadoIDV,
            entidadIDV,
            zonasArray
        ]
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
