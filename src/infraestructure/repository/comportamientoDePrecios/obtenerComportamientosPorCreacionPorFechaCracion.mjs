import { conexion } from "../globales/db.mjs"

export const obtenerComportamientosPorCreacionPorFechaCracion = async (metadatos) => {
    try {
        const fechaInicio = metadatos.fechaInicio
        const fechaFinal = metadatos.fechaFinal
        const fechaCreacionReserva = metadatos.fechaCreacionReserva
        const arrayApartamentos = metadatos.arrayApartamentos
        const tipoIDV = metadatos.tipoIDV
        const estado = metadatos.estado

        const consulta = `
             SELECT
             "comportamientoUID",
               "nombreComportamiento",
               "estadoIDV",
               "contenedor",
               to_char(("contenedor"->>'fechaInicio')::DATE, 'YYYY-MM-DD') as "fechaInicio",
               to_char(("contenedor"->>'fechaFinal')::DATE, 'YYYY-MM-DD') as "fechaFinal"
        FROM
            "comportamientoPrecios"
        WHERE 
            (
                -- Caso 1: Evento total o parcialmente dentro del rango - verificado
                (
                    (
                        ("contenedor"->>'fechaInicio')::DATE <=$1::DATE
                        AND
                        ("contenedor"->>'fechaFinal')::DATE >=$1::DATE
                    )
                        OR
                    (
                        ("contenedor"->>'fechaInicio')::DATE <= $2::DATE
                        AND
                        ("contenedor"->>'fechaFinal')::DATE >= $2::DATE
                    )
                )
                OR 
                -- Caso 2: Evento totalmente fuera del rango - verificado
                (
                ("contenedor"->>'fechaInicio')::DATE > $1::DATE AND $2::DATE > ("contenedor"->>'fechaFinal')::DATE
                )
            )
            AND 
            (
                $3::DATE BETWEEN ("contenedor"->>'fechaInicio_creacionReserva')::DATE AND ("contenedor"->>'fechaFinal_creacionReserva')::DATE
            )
            AND 
                "contenedor"->>'tipo'= $4
            AND
                EXISTS
                (
                    SELECT 1
                    FROM jsonb_array_elements("contenedor"->'apartamentos') AS apt
                    WHERE apt->>'apartamentoIDV' = ANY($5)
                )
            AND 
                "estadoIDV" = $6
     
          ;`
        const parametros = [
            fechaInicio,
            fechaFinal,
            fechaCreacionReserva,
            tipoIDV,
            arrayApartamentos,
            estado
        ]

        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}


/*

                -- Caso 1: Evento totalmente dentro del rango
                --(
                --    ("contenedor"->>'fechaInicio')::DATE >=$1::DATE AND 
                --    ("contenedor"->>'fechaFinal')::DATE <= $2::DATE
                --)
                --OR 
                -- Caso 2: Evento parcialmente dentro del rango
                (
                    ("contenedor"->>'fechaInicio')::DATE <=$1::DATE
                    AND
                    ("contenedor"->>'fechaFinal')::DATE >=$1::DATE
                )
                OR
                (
                    ("contenedor"->>'fechaInicio')::DATE <= $2::DATE
                    AND
                    ("contenedor"->>'fechaFinal')::DATE >= $2::DATE
                )
                --OR 
                -- Caso 3: Evento que atraviesa el rango -- REVISTAR ESTO
                --(
                --("contenedor"->>'fechaInicio')::DATE <$1::DATE AND
                --("contenedor"->>'fechaFinal')::DATE >= $2::DATE
                --)

*/