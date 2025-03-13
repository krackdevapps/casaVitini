import { conexion } from "../../../globales/db.mjs";

export const insertarPago = async (data) => {
    try {

        const plataformaDePago = data.plataformaDePago
        const tarjeta = data.tarjeta
        const tarjetaDigitos = data.tarjetaDigitos
        const pagoUIDPasarela = data.pagoUIDPasarela
        const reservaUID = data.reservaUID
        const cantidadConPunto = data.cantidadConPunto
        const fechaPago = data.fechaPago
        const chequeUID = data.chequeUID
        const transferenciaUID = data.transferenciaUID
        const conceptoPago = data.conceptoPago

        const consulta = `
        INSERT INTO
        "reservaPagos"
        (
        "plataformaDePagoIDV",
        tarjeta,
        "tarjetaDigitos",
        "pagoUIDPasarela",
        "reservaUID",
        cantidad,
        "fechaPago",
        "chequeUID",
        "transferenciaUID",
        "conceptoPago"
        )
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING
        "pagoUID",
        "plataformaDePagoIDV",
        "tarjetaDigitos",
        "pagoUIDPasarela",
        cantidad,
        to_char("fechaPago", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "fechaPago", 
        "chequeUID",
        "transferenciaUID",
        "conceptoPago"
        `;
        const parametros = [
            plataformaDePago,
            tarjeta,
            tarjetaDigitos,
            pagoUIDPasarela,
            reservaUID,
            cantidadConPunto,
            fechaPago,
            chequeUID,
            transferenciaUID,
            conceptoPago
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe la reserva donde insertar el pago";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

