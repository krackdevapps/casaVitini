import { conexion } from "../../../componentes/db.mjs"

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

        const consulta = `
        INSERT INTO
        "reservaPagos"
        (
        "plataformaDePago",
        tarjeta,
        "tarjetaDigitos",
        "pagoUIDPasarela",
        reserva,
        cantidad,
        "fechaPago",
        "chequeUID",
        "transferenciaUID"
        )
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING
        "pagoUID",
        "plataformaDePago",
        "tarjetaDigitos",
        "pagoUIDPasarela",
        cantidad,
        to_char("fechaPago", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "fechaPagoUTC_ISO", 
        "chequeUID",
        "transferenciaUID"
        RETURNING
        *
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
            transferenciaUID
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

