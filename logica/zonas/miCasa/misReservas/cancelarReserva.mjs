import { conexion } from "../../../componentes/db.mjs";
import { crearReenbolso } from "../../../componentes/pasarelas/square/crearReenbolso.mjs";
import { detallesDelPago as detallesDelPago_ } from "../../../componentes/pasarelas/square/detallesDelPago.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";


export const cancelarReserva = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        if (IDX.control()) return

        const usuario = entrada.session.usuario;
        const reservaUID = validadoresCompartidos.tipos.numero({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reser (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        await conexion.query('BEGIN'); // Inicio de la transacción
        const obtenerDatosUsuario = `
            SELECT 
                email
            FROM 
                "datosDeUsuario" 
            WHERE 
                "usuarioIDX" = $1`;
        const resolverObtenerDatosUsuario = await conexion.query(obtenerDatosUsuario, [usuario]);
        const email = resolverObtenerDatosUsuario.rows[0].email;
        const validarExistenciaReserva = `
            SELECT
            reserva
            "estadoReserva"
            FROM 
            reservas
            WHERE
            reserva = $1 AND email =$2`;
        const resuelveValidarExistenciaReserva = await conexion.query(validarExistenciaReserva, [reservaUID, email]);
        if (resuelveValidarExistenciaReserva.rowCount === 0) {
            const error = "No existe la reserva que quieres cancelar";
            throw new Error(error);
        }
        if (resuelveValidarExistenciaReserva.rowCount === 1) {
            const detallesReserva = resuelveValidarExistenciaReserva.rows[0];
            const estadoReserva = detallesReserva.estadoReserva;
            if (estadoReserva === "cancelada") {
                const error = "Esta reserva ya esta cancelada";
                throw new Error(error);
            }
            const estadoCancelada = "cancelada";
            const cancelarReserva = `
                UPDATE 
                    reservas
                SET 
                    "estadoReserva" = $1
                WHERE
                    reserva = $2 AND email = $3
                `;
            await conexion.query(cancelarReserva, [estadoCancelada, reservaUID, email]);
            const plataformaDePagoPasarela = "pasarela";
            const obtenerPagosSinPasarela = `
                SELECT
                    "pagoUID",
                    "plataformaDePago"
                FROM 
                    "reservaPagos"
                WHERE
                    reserva = $1 AND "plataformaDePago" != $2;
                `;
            const resuelveObtenerPagosSinPasarela = await conexion.query(obtenerPagosSinPasarela, [reservaUID, plataformaDePagoPasarela]);
            const ok = {
                ok: "Se ha cancelado la reserva correctamente"
            };
            if (resuelveObtenerPagosSinPasarela.rowCount > 0) {
                const pagosAReembolsar = resuelveObtenerPagosSinPasarela.rows;
                for (const detallesReembolso of pagosAReembolsar) {
                    const pagoUID = detallesReembolso.pagoUID;
                    const plataformaDePago = detallesReembolso.plataformaDePago;
                    const notificacionIDV = `pagoPendienteDeReembolsoPorCancelacion`;
                    const objetoNotificacion = {
                        reservaUID: reservaUID,
                        pagoUID: pagoUID,
                        plataformaDePago: plataformaDePago
                    };
                    const creaNotificacionDeReembolso = `
                        INSERT INTO notificaciones
                        (
                        "notificacionIDV",
                        objeto,
                        "IDX"
                        )
                        VALUES ($1, $2::jsonb, $3) 
                        `;
                    const datosNotificacion = [
                        notificacionIDV,
                        objetoNotificacion,
                        usuario
                    ];
                    await conexion.query(creaNotificacionDeReembolso, datosNotificacion);
                }
                ok.reembolsoManual = "Se ha notificado de los reembolso de esta reserva para que se procesa con ellos";
            }
            const obtenerPagosPasarelaReserva = `
                SELECT
                    "pagoUIDPasarela",
                    cantidad
                FROM 
                    "reservaPagos"
                WHERE
                    reserva = $1 AND "plataformaDePago" = $2;
                `;
            const resuelveObtenerPagosPasarelaReserva = await conexion.query(obtenerPagosPasarelaReserva, [reservaUID, plataformaDePagoPasarela]);
            if (resuelveObtenerPagosPasarelaReserva.rowCount > 0) {
                // Obtener pagos de pasalera y procesar reembolsos
                const pagosAReembolsar = resuelveObtenerPagosPasarelaReserva.rows;
                const infoReembolsosPasarela = null;
                for (const detallesReembolso of pagosAReembolsar) {
                    const pagoUIDPasarela = detallesReembolso.pagoUIDPasarela;
                    let cantidad = detallesReembolso.cantidad;
                    const moneda = "USD";
                    const detallesDelPago = await detallesDelPago_(pagoUIDPasarela);
                    if (detallesDelPago.error) {
                        const errorUID = detallesDelPago.error.errors[0].code;
                        let error;
                        switch (errorUID) {
                            case "NOT_FOUND":
                                error = "La pasarela informa de que el idenficador de pago que tratas de asocias con Casa Vitini no existe, por favor revisa el identificador de pago";
                                throw new Error(error);
                            default:
                                error = "La pasarela informa de un error generico";
                                throw new Error(error);
                        }
                    }
                    const cantidadPagoPasarela = detallesDelPago.amountMoney.amount;
                    const reembolsadoYa = detallesDelPago?.refundedMoney?.amount;
                    let totalAReembolsar = cantidadPagoPasarela;
                    if (reembolsadoYa) {
                        const restantePorReesmbolar = cantidadPagoPasarela - reembolsadoYa;
                        if (restantePorReesmbolar > 0) {
                            const reembolsoDetalles = {
                                idempotencyKey: uuidv4(),
                                amountMoney: {
                                    amount: totalAReembolsar,
                                    currency: moneda
                                },
                                paymentId: pagoUIDPasarela
                            };
                            const procesadorReembolso = await crearReenbolso(reembolsoDetalles);
                            if (procesadorReembolso.error) {
                                const errorUID = procesadorReembolso.error?.errors[0]?.code;
                                let error;
                                switch (errorUID) {
                                    case "REFUND_AMOUNT_INVALID":
                                        error = "La pasarela informa que el reembolso es superior a la cantidad del pago que se quiere reembolsar";
                                        throw new Error(error);
                                    case "CURRENCY_MISMATCH":
                                        error = "Revisa el codigo de la moneda introducido. Solo se aceptan dolares. Coodigo: USD";
                                        throw new Error(error);
                                    case "NOT_FOUND":
                                        error = "La pasarela informa de que el idenficador del reembolso no existe en la pasarela";
                                        throw new Error(error);
                                    default:
                                        error = "La pasarela informa de un error generico";
                                        throw new Error(error);
                                }
                            }
                            infoReembolsosPasarela = "rembolsado";
                        }
                        totalAReembolsar = restantePorReesmbolar;
                    }
                }
                if (infoReembolsosPasarela === "reembolsado") {
                    ok.reembolsoPasarela = "Se ha reembolsado todos los pagos asociados a esta reserva hechos desde la pasarela";
                }
            }
            salida.json(ok);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}