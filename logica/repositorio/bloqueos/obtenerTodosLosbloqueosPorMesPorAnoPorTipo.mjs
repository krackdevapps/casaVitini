import { conexion } from "../../componentes/db.mjs";

export const obtenerTodosLosbloqueosPorMesPorAnoPorTipo = async (data) => {
    try {

        const mes = data.mes
        const ano = data.ano
        const bloqueoPermanente = "permanente"

        const consulta =  `
        SELECT 
            "bloqueoUID",
            "tipoBloqueoIDV",
            "apartamentoIDV",
            to_char("fechaInicio", 'YYYY-MM-DD') as "fechaEntradaa", 
            to_char("fechaFin", 'YYYY-MM-DD') as "fechaFin",
            ("fechaFin" - "fechaInicio") as duracion_en_dias
        FROM "bloqueosApartamentos"
        WHERE 
        (
            DATE_PART('YEAR', "fechaInicio") < $2
            OR (
                DATE_PART('YEAR', "fechaInicio") = $2
                AND DATE_PART('MONTH', "fechaInicio") <= $1
            )
        )
        AND (
            DATE_PART('YEAR',  "fechaFin") > $2
            OR (
                DATE_PART('YEAR',  "fechaFin") = $2
                AND DATE_PART('MONTH',  "fechaFin") >= $1
            )
        )
        OR
        "tipoBloqueoIDV" = $3;
        `
        const parametros = [
            mes,
            ano,
            bloqueoPermanente
        ]
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}