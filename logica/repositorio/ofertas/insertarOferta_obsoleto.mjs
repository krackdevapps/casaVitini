import { conexion } from "../../componentes/db.mjs";
export const insertarOferta = async (data) => {
    try {
        const nombreOferta = data.nombreOferta;
        const fechaInicio_ISO = data.fechaInicio_ISO;
        const fechaFin_ISO = data.fechaFin_ISO;
        const simboloNumero = data.simboloNumero;
        const numero = data.numero;
        const descuentoAplicadoA = data.descuentoAplicadoA;
        const estadoInicalDesactivado = "desactivada";
        const tipoOferta = data.tipoOferta;
        const cantidad = data.cantidad;
        const tipoDescuento = data.tipoDescuento;

        const consulta = `
            INSERT INTO ofertas
            (
                "nombreOferta",
                "fechaInicio",
                "fechaFin",
                "simboloNumeroIDV",
                "numero",
                "descuentoAplicadoAIDV",
                "estadoOfertaIDV",
                "tipoOfertaIDV",
                cantidad,
                "tipoDescuentoIDV"
            )
            VALUES
            (
                COALESCE($1, NULL),
                COALESCE($2::date, NULL),
                COALESCE($3::date, NULL),
                NULLIF($4, NULL),
                NULLIF($5::numeric, NULL),
                COALESCE($6, NULL),
                COALESCE($7, NULL),
                COALESCE($8, NULL),
                NULLIF($9::numeric, NULL),
                NULLIF($10, NULL)
            )
            RETURNING *;
            `;

            const parametros = [
                nombreOferta,
                fechaInicio_ISO,
                fechaFin_ISO,
                simboloNumero,
                numero,
                descuentoAplicadoA,
                estadoInicalDesactivado,
                tipoOferta,
                cantidad,
                tipoDescuento
            ];
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "Ha ocurrido un error y no se ha insertado la nueva oferta";
            throw new Error(error);
        }
        return resuelve.rows[0].uid
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
