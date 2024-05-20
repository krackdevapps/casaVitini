import { conexion } from "../../componentes/db.mjs"

export const obtenerComportamientosPorRangoPorTipoIDV = async (metadatos) => {
    try {
        const fechaInicio_ISO = metadatos.fechaInicio_ISO
        const fechaFinal_ISO = metadatos.fechaFinal_ISO
        const tipoIDV = metadatos.tipoIDV

        const parametrosBusqueda = [
            fechaInicio_ISO,
            fechaFinal_ISO,
            tipoIDV
        ]

        const consultaBloqueos = `
      SELECT 
      "comportamientoUID",
      "apartamentoIDV",
      "tipoIDV",
      to_char("fechaInicio", 'YYYY-MM-DD') as "fechaInicio", 
      to_char("fechaFin", 'YYYY-MM-DD') as "fechaFin"  
      FROM "comportamientoPrecios" 
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
             "tipoIDV" = $3
      )
        ;`

        const resuelveBloqueos = await conexion.query(consultaBloqueos, parametrosBusqueda)
        return resuelveBloqueos.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
