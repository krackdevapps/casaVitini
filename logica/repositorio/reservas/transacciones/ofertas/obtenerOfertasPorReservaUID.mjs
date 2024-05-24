import { conexion } from "../../../../componentes/db.mjs";

export const obtenerOfertasPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        SELECT
        "nombreOferta",
        "tipoOfertaIDV",
        definicion,
        descuento,
        "tipoDescuento",
        cantidad,
        "detallesOferta",
        "descuentoAplicadoAIDV"
        FROM 
        "reservaOfertas" 
        WHERE
        "reservaUID" = $1;`
        const resuelve = await conexion.query(consulta, [reservaUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

