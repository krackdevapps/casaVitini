import { conexion } from "../../../globales/db.mjs";

export const obtenerPagoPorPagoUID = async (pagoUID) => {
    try {

        const consulta = `
        SELECT
            "plataformaDePagoIDV",
            "pagoUID",
            "pagoUIDPasarela",
            "tarjetaDigitos",
            to_char("fechaPago", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "fechaPago", 
            tarjeta,
            cantidad,
            "conceptoPago"
        FROM 
            "reservaPagos"
        WHERE 
            "pagoUID" = $1;`;
        const resuelve = await conexion.query(consulta, [pagoUID]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún pago con ese pagoUID";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

