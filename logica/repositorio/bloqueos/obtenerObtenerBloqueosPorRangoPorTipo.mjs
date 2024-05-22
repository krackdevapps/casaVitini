import { conexion } from "../../componentes/db.mjs"
export const obtenerObtenerBloqueosPorRangoPorTipo = async (metadatos) => {
  try {
    const fechaInicio_ISO = metadatos.fechaInicio_ISO
    const fechaFinal_ISO = metadatos.fechaFinal_ISO
    const tipoBloqueoIDV = metadatos.tipoBloqueoIDV

    const parametrosBusqueda = [
      fechaInicio_ISO,
      fechaFinal_ISO,
      tipoBloqueoIDV
    ]

    const consultaBloqueos = `
      SELECT 
      "bloqueoUID",
      "apartamentoIDV",
      "tipoBloqueoIDV",
      "zonaIDV",
      motivo,
      to_char("fechaInicio", 'YYYY-MM-DD') as "fechaInicio", 
      to_char("fechaFin", 'YYYY-MM-DD') as "fechaFin"  
      FROM "bloqueosApartamentos" 
      WHERE                     
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
            )
        )
             OR 
             "tipoBloqueoIDV" = $3
      )
        ;`

    const resuelveBloqueos = await conexion.query(consultaBloqueos, parametrosBusqueda)
    return resuelveBloqueos.rows
  } catch (errorCapturado) {
    throw errorCapturado
  }
}
