import { conexion } from "../../../componentes/db.mjs";

export const obtenerOfertasPorFechaPorEstadoPorTipo = async (data) => {
    try {

        const fechaActualTZ = data.fechaActualTZ
        const estadoOfertaActivado = data.estadoOfertaActivado
        const arrayDeTiposDeOferta = data.arrayDeTiposDeOferta

        const consulta = `
        SELECT 
        uid,
        to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
        to_char("fechaFin", 'DD/MM/YYYY') as "fechaFin",
        "simboloNumero",
        "descuentoAplicadoA",
        "estadoOferta",
        "tipoOferta",
        "cantidad",
        numero,
        "tipoDescuento",
        "nombreOferta"
        FROM ofertas
        WHERE 
        ($1 BETWEEN "fechaInicio" AND "fechaFin")
        AND "estadoOferta" = $2
        AND "tipoOferta" = ANY($2::text[]);`;
        const parametros = [
            fechaActualTZ,
            estadoOfertaActivado,
            arrayDeTiposDeOferta
        ]
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
