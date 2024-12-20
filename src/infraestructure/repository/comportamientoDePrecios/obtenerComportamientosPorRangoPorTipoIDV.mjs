import { conexion } from "../globales/db.mjs"

export const obtenerComportamientosPorRangoPorTipoIDV = async (metadatos) => {
  try {
    const fechaInicio = metadatos.fechaInicio
    const fechaFinal = metadatos.fechaFinal
    const arrayApartamentos = metadatos.arrayApartamentos
    const tipoIDV = metadatos.tipoIDV
    const estadoArray = metadatos.estadoArray
   
    const consulta = `
         SELECT "comportamientoUID",
          "nombreComportamiento",
          "estadoIDV",
          "contenedor",
          to_char(("contenedor"->>'fechaInicio')::DATE, 'YYYY-MM-DD') as "fechaInicio",
          to_char(("contenedor"->>'fechaFinal')::DATE, 'YYYY-MM-DD') as "fechaFinal",
          ("contenedor"->>'fechaFinal')::DATE - ("contenedor"->>'fechaInicio')::DATE as duracion_en_dias

         FROM "comportamientoPrecios"
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
              "contenedor"->>'tipo'= $3
              AND EXISTS
              ( SELECT 1
               FROM jsonb_array_elements("contenedor"->'apartamentos') AS apt
               WHERE apt->>'apartamentoIDV' = ANY($4)
               )
            AND 
            "estadoIDV" = ANY($5)
              `
    const parametros = [
      fechaInicio,
      fechaFinal,
      tipoIDV,
      arrayApartamentos,
      estadoArray
    ]
    const resuelve = await conexion.query(consulta, parametros)
    return resuelve.rows
  } catch (errorCapturado) {
    throw errorCapturado
  }
}
