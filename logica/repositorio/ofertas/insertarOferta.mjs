import { conexion } from "../../componentes/db.mjs";
export const insertarOferta = async (data) => {
    try {

        const nombreOferta = metadatos.nombreOferta;
        const fechaInicio_ISO = metadatos.fechaInicio_ISO;
        const fechaFin_ISO = metadatos.fechaFin_ISO;
        const simboloNumero = metadatos.simboloNumero;
        const numero = metadatos.numero;
        const contextoAplicacion = metadatos.contextoAplicacion;
        const estadoInicalDesactivado = "desactivada";
        const tipoOferta = metadatos.tipoOferta;
        const cantidad = metadatos.cantidad;
        const tipoDescuento = metadatos.tipoDescuento;

        const consulta = `
            INSERT INTO ofertas
            (
                "nombreOferta",
                "fechaInicio",
                "fechaFin",
                "simboloNumero",
                "numero",
                "descuentoAplicadoA",
                "estadoOferta",
                "tipoOferta",
                cantidad,
                "tipoDescuento"
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
            RETURNING uid;
            `;

            const parametros = [
                nombreOferta,
                fechaInicio_ISO,
                fechaFin_ISO,
                simboloNumero,
                numero,
                contextoAplicacion,
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
    } catch (error) {
        throw error
    }
}
