import { conexion } from "../globales/db.mjs"

export const obtenerComportamientosPorDiasTipoIDV = async (metadatos) => {
  try {
    const nombreDiasAgrupados = metadatos.nombreDiasAgrupados
    const arrayApartamentos = metadatos.arrayApartamentos
    const tipoIDV = "porDias"
    const estado = "activado"
    const consulta = `
         SELECT 
         "comportamientoUID",
         "nombreComportamiento",
         "estadoIDV",
         "contenedor"
         FROM "comportamientoPrecios"
         WHERE 
          "contenedor"->>'tipo'= $2
          AND
          EXISTS
          ( SELECT 1
            FROM jsonb_array_elements("contenedor"->'apartamentos') AS apt
            WHERE apt->>'apartamentoIDV' = ANY($3)
            )
          AND
           EXISTS
           ( SELECT 1
            FROM jsonb_array_elements_text("contenedor"->'dias') AS dia
            WHERE dia = ANY($1)
            )
          AND 
          "estadoIDV" = $4
          `
    const parametros = [
      nombreDiasAgrupados,
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
