import { conexion } from "../../../componentes/db.mjs";

export const obtenerOfertasPorRangoPorEstado = async (data) => {
    try {

        const fechaSalidaReserva_ISO = data.fechaSalidaReserva_ISO
        const fechaEntradaReserva_ISO = data.fechaEntradaReserva_ISO
        const estadoOferta = "activado"

        const consulta = `
        SELECT 
        "ofertaUID",
        "nombreOferta"
        to_char("fechaInicio", 'YYYY-MM-DD') as "fechaInicio_ISO", 
        to_char("fechaFin", 'YYYY-MM-DD') as "fechaFin_ISO", 
        "tipoOferta",
        contenedor
        FROM ofertas 
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
            estadoOferta
        ]
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
