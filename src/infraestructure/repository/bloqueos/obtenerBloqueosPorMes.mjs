import { conexion } from "../globales/db.mjs";

export const obtenerBloqueosPorMes = async (data) => {
    try {

        const mes = data.mes
        const ano = data.ano
        const bloqueoPermanente = data.bloqueoPermanente
        const bloqueoTemporal = data.bloqueoTemporal

        const consulta = ` 
        SELECT 
        "apartamentoIDV",
        "tipoBloqueoIDV",
        to_char("fechaInicio", 'YYYY-MM-DD') as "fechaInicio", 
        to_char("fechaFin", 'YYYY-MM-DD') as "fechaFin"
        FROM "bloqueosApartamentos"
        WHERE
        (
            "tipoBloqueoIDV" = $4 AND
            (
            DATE_PART('YEAR', "fechaInicio") < $2
            OR (
                DATE_PART('YEAR', "fechaInicio") = $2
                AND DATE_PART('MONTH', "fechaInicio") <= $1
            )
        )
        AND (
            DATE_PART('YEAR', "fechaFin") > $2
            OR (
                DATE_PART('YEAR', "fechaFin") = $2
                AND DATE_PART('MONTH', "fechaFin") >= $1
            )
        )) 
        OR
        "tipoBloqueoIDV" = $3;
        `;
        const parametros = [
            mes,
            ano,
            bloqueoPermanente,
            bloqueoTemporal
        ]

        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}