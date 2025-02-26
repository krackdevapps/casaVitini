import { conexion } from "../globales/db.mjs"

export const obtenerComportamientosDistintosPorRangoPorTipoIDVPorComportamientoUID = async (metadatos) => {
  try {
    const fechaInicio_ISO = metadatos.fechaInicio_ISO
    const fechaFinal_ISO = metadatos.fechaFinal_ISO
    const tipoIDV = metadatos.tipoIDV
    const comportamientoUID = metadatos.comportamientoUID

    const parametrosBusqueda = [
      fechaInicio_ISO,
      fechaFinal_ISO,
      tipoIDV,
      comportamientoUID
    ]

    const consultaBloqueos = `
      SELECT 
      "comportamientoUID",
      "tipoIDV",
      to_char("fechaInicio", 'YYYY-MM-DD') as "fechaInicio", 
      to_char("fechaFinal", 'YYYY-MM-DD') as "fechaFinal"  
      FROM "comportamientoPrecios" 
      WHERE                     
      (
        (
           (   
               (
                 -- Caso 1: Evento totalmente dentro del rango
                 "fechaInicio" >= $1::DATE AND "fechaFinal" <= $2::DATE
               )
               OR
               (
                 -- Caso 2: Evento parcialmente dentro del rango
                 ("fechaInicio" <= $1::DATE AND "fechaFinal" >= $1::DATE)
                 OR ("fechaInicio" <= $2::DATE AND "fechaFinal" >= $2::DATE)
               )
               OR
               (
                 -- Caso 3: Evento que atraviesa el rango
                 ("fechaInicio" < $1::DATE AND "fechaFinal" > $2::DATE)
               )
            )
        )
             OR 
             "tipoIDV" = $3
      )
      AND
      "comportamientoUID" <> $4
        ;`

    const resuelveBloqueos = await conexion.query(consultaBloqueos, parametrosBusqueda)
    return resuelveBloqueos.rows
  } catch (errorCapturado) {
    throw errorCapturado
  }
}
