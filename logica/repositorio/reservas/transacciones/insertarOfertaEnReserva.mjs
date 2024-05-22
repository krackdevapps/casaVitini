import { conexion } from "../../../componentes/db.mjs"

export const insertarOfertaEnReserva = async (data) => {
    try {

        const reservaUID = data.reservaUID
        const nombreOferta = data.nombreOferta
        const tipoOfertaIDV = data.tipoOfertaIDV
        const definicion = data.definicion
        const descuento = data.descuento
        const detallesOferta = data.detallesOferta
        const tipoDescuentoIDV = data.tipoDescuentoIDV
        const cantidad = data.cantidad
        const descuentoAplicadoA = data.descuentoAplicadoA

        const consulta = `
        INSERT INTO "reservaOfertas"
        (
          reserva,
          "nombreOferta",
          "tipoOferta",
          "definicion",
          descuento,
          "detallesOferta",
          "tipoDescuento",
          cantidad,
          "descuentoAplicadoA"
        )
        VALUES (
          $1,
          NULLIF($2, ''),
          NULLIF($3, ''),
          NULLIF($4, ''),
         $5,
          NULLIF(CAST($6 AS jsonb), '{}'::jsonb),
          NULLIF($7, ''),
         $8,
          NULLIF($9, '')
        );`
        const parametros = [
            reservaUID,
            nombreOferta,
            tipoOfertaIDV,
            definicion,
            descuento,
            detallesOferta,
            tipoDescuentoIDV,
            cantidad,
            descuentoAplicadoA
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido insertar el reembolso.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

