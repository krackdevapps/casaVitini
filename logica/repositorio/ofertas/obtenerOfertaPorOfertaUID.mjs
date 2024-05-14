import { conexion } from "../../componentes/db.mjs";
export const obtenerOferatPorOfertaUID = async (ofertaUID) => {
    try {
        const consulta =  `
        SELECT
        o.uid,
        to_char(o."fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
        to_char(o."fechaFin", 'DD/MM/YYYY') as "fechaFin", 
        o."numero",
        o."simboloNumero",
        o."descuentoAplicadoA" as "descuentoAplicadoAIDV",
        oa."aplicacionUI" as "descuentoAplicadoAUI",
        o."estadoOferta" as "estadoOfertaIDV",
        oe."estadoUI" as "estadoOfertaUI",
        o."tipoOferta" as "tipoOfertaIDV",
        ot."tipoOfertaUI" as "tipoOfertaUI",
        o."tipoDescuento" as "tipoDescuentoIDV",
        otd."tipoDescuentoUI" as "tipoDescuentoUI",
        o.cantidad AS "cantidad",
        o."nombreOferta"
        FROM
        ofertas o
        LEFT JOIN
        "ofertasAplicacion" oa ON o."descuentoAplicadoA" = oa."aplicacionIDV"
        LEFT JOIN
        "ofertasEstado" oe ON o."estadoOferta" = oe."estadoIDV"
        LEFT JOIN
        "ofertasTipo" ot ON o."tipoOferta" = ot."tipoOfertaIDV"
        LEFT JOIN
        "ofertasTipoDescuento" otd ON o."tipoDescuento" = otd."tipoDescuentoIDV"
        WHERE
        o.uid = $1;
        `
        const resuelve = await conexion.query(consulta, [ofertaUID])
        if (resuelve.rowCount === 0) {
            const error = "No existe al oferta, revisa el UID introducie en el campo ofertaUID, recuerda que debe de ser un number";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}
