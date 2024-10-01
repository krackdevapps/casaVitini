import { conexion } from "../../globales/db.mjs";

export const obtenerOfertasPorRangoFechaPorEstadoPorTipo = async (data) => {
    try {

        const fechaSalidaReserva_ISO = data.fechaSalidaReserva_ISO
        const fechaEntradaReserva_ISO = data.fechaEntradaReserva_ISO
        const estadoOferta = data.estadoOferta
        const tipoOferta = data.tipoOferta

        const consulta = `
        SELECT 
        uid,
        to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio_Humano", 
        to_char("fechaFin", 'DD/MM/YYYY') as "fechaFin_Humano", 
        to_char("fechaInicio", 'YYYY-MM-DD') as "fechaInicio_ISO", 
        to_char("fechaFin", 'YYYY-MM-DD') as "fechaFin_ISO", 
        "tipoOferta",
        cantidad,
        "tipoDescuento",
        "nombreOferta"
        FROM ofertas 
        WHERE
        WHERE                     
        (
            (
                -- Caso 1: Evento totalmente dentro del rango
                "fechaEntrada" >= $1::DATE AND "fechaSalida" <= $2::DATE
            )
            OR
            (
                -- Caso 2: Evento parcialmente dentro del rango
                ("fechaEntrada" < $1::DATE AND "fechaSalida" > $1::DATE)
                OR ("fechaEntrada" < $2::DATE AND "fechaSalida" > $2::DATE)
            )
            OR
            (
                -- Caso 3: Evento atraviesa el rango
                "fechaEntrada" < $1::DATE AND "fechaSalida" > $2::DATE
            )
        )
                AND "estadoOferta" = $3 
        ;`
        const parametros = [
            fechaSalidaReserva_ISO,
            fechaEntradaReserva_ISO,
            estadoOferta,
            tipoOferta
        ]
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
