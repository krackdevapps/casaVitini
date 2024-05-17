import { conexion } from "../../componentes/db.mjs";

export const obtenerBloqueosPorMes = async (data) => {
    try {

        const mes = data.mes
        const ano = data.ano
        const bloqueoPermanente = data.bloqueoPermanente
        const bloqueoTemporal = data.bloqueoTemporal

        const consulta = ` 
        SELECT 
        apartamento,
        "tipoBloqueo",
        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO"
        FROM "bloqueosApartamentos"
        WHERE
        (
            "tipoBloqueo" = $4 AND
            (
            DATE_PART('YEAR', entrada) < $2
            OR (
                DATE_PART('YEAR', entrada) = $2
                AND DATE_PART('MONTH', entrada) <= $1
            )
        )
        AND (
            DATE_PART('YEAR', salida) > $2
            OR (
                DATE_PART('YEAR', salida) = $2
                AND DATE_PART('MONTH', salida) >= $1
            )
        )) 
        OR
        "tipoBloqueo" = $3;
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