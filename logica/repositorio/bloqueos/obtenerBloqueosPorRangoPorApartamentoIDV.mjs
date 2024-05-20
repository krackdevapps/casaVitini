import { conexion } from "../../componentes/db.mjs"
export const obtenerBloqueosPorRangoPorApartamentoIDV = async (metadatos) => {
  try {
    const fechaInicio_ISO = metadatos.fechaInicio_ISO
    const fechaFinal_ISO = metadatos.fechaFinal_ISO
    const apartamentosIDV_array = metadatos.apartamentosIDV_array || []
    const zonaBloqueoIDV_array = metadatos.zonaBloqueoIDV_array

    const parametrosBusqueda = [
      fechaInicio_ISO,
      fechaFinal_ISO,
      zonaBloqueoIDV_array
    ]

    const constructorSQL = (apartamentosIDV_array) => {
      if (Array.isArray(apartamentosIDV_array) && apartamentosIDV_array.lengh > 0) {
        const estructuraSQLWhere = `
            "apartamentoIDV" = ANY($4)
            AND
            `
        return estructuraSQLWhere
      }
      return ""
    }

    const consultaBloqueos = `
      SELECT 
      uid,
      "apartamentoIDV",
      "tipoBloqueoIDV",
      "zonaIDV",
      motivo,
      to_char("fechaInicio", 'YYYY-MM-DD') as "fechaInicio", 
      to_char("fechaFin", 'YYYY-MM-DD') as "fechaFin"  
      FROM "bloqueosApartamentos" 
      WHERE                     
      ${constructorSQL(apartamentosIDV_array)}
      (
        (
           (   
               (
                 -- Caso 1: Evento totalmente dentro del rango
                 "fechaInicio" >= $1::DATE AND "fechaFin" <= $2::DATE
               )
               OR
               (
                 -- Caso 2: Evento parcialmente dentro del rango
                 ("fechaInicio" <= $1::DATE AND "fechaFin" >= $1::DATE)
                 OR ("fechaInicio" <= $2::DATE AND "fechaFin" >= $2::DATE)
               )
               OR
               (
                 -- Caso 3: Evento que atraviesa el rango
                 ("fechaInicio" < $1::DATE AND "fechaFin" > $2::DATE)
               )
               AND
               "zonaIDV" = ANY($3)
            )
        )
             OR 
             "tipoBloqueoIDV" = 'permanente'
      )
        ;`

    const resuelveBloqueos = await conexion.query(consultaBloqueos, parametrosBusqueda)
    return resuelveBloqueos.rows
  } catch (errorCapturado) {
    throw errorCapturado
  }
}
