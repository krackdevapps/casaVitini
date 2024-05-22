import { conexion } from "../../componentes/db.mjs";
export const actualizarOferta = async (data) => {
    try {

        const nombreOferta = data.nombreOferta
        const fechaInicio_ISO = data.fechaInicio_ISO
        const fechaFin_ISO = data.fechaFin_ISO
        const numero = data.numero
        const simboloNumero = data.simboloNumero
        const contextoAplicacion = data.contextoAplicacion
        const tipoOferta = data.tipoOferta
        const cantidad = data.cantidad
        const tipoDescuento = data.tipoDescuento
        const ofertaUID = data.ofertaUID

        const consulta = `
        UPDATE ofertas
        SET
        "nombreOferta" = COALESCE($1, NULL),
        "fechaInicio" = COALESCE($2::date, NULL),
        "fechaFin" = COALESCE($3::date, NULL),
        "numero" = COALESCE($4::numeric, NULL),
        "simboloNumero" = COALESCE($5, NULL),
        "descuentoAplicadoA" = COALESCE($6, NULL),
        "tipoOferta" = COALESCE($7, NULL),
        cantidad = COALESCE($8::numeric, NULL),
        "tipoDescuento" = COALESCE($9, NULL)
        WHERE uid = $10;`;
        const datos = [
            nombreOferta,
            fechaInicio_ISO,
            fechaFin_ISO,
            numero,
            simboloNumero,
            contextoAplicacion,
            tipoOferta,
            cantidad,
            tipoDescuento,
            ofertaUID
        ];
        const resuelve = await conexion.query(consulta, datos);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido actualziar la oferta";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
