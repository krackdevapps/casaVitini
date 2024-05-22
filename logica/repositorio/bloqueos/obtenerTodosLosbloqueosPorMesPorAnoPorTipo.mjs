import { conexion } from "../../componentes/db.mjs";

export const obtenerTodosLosbloqueosPorMesPorAnoPorTipo = async (data) => {
    try {

        const mes = data.mes
        const ano = data.ano
        const bloqueoPermanente = data.bloqueoPermanente

        const consulta =  `
        SELECT 
            bA.uid,
            bA."tipoBloqueo",
            bA.apartamento AS "apartamentoIDV",
            to_char(bA.entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
            to_char(bA.salida, 'YYYY-MM-DD') as "fechaSalida_ISO",
            (bA.salida - bA.entrada) as duracion_en_dias,
            a."apartamentoUI"
        FROM "bloqueosApartamentos" bA
        JOIN apartamentos a ON bA.apartamento = a.apartamento
        WHERE 
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
        )
          OR
          bA."tipoBloqueo" = $3;
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