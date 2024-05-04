import Decimal from "decimal.js";
import { conexion } from "../../../../componentes/db.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { DateTime } from "luxon";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";

export const realizarReembolso = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return
        const reservaUID = entrada.body.reservaUID;
        let cantidad = entrada.body.cantidad;
        const pagoUID = entrada.body.pagoUID;
        const palabra = entrada.body.palabra;
        let tipoReembolso = entrada.body.tipoReembolso;
        let plataformaDePagoEntrada = entrada.body.plataformaDePagoEntrada;
        plataformaDePagoEntrada.toLowerCase();
        if (palabra !== "reembolso") {
            const error = "Escriba la palabra reembolso en le campo de confirmacion";
            throw new Error(error);
        }
        const filtroTotal = /^\d+\.\d{2}$/;
        const filtroNumerosEnteros = /^[0-9]+$/;
        const filtroDecimales = /^\d+\.\d{2}$/;
        if (!reservaUID || !filtroNumerosEnteros.test(reservaUID)) {
            const error = "el campo 'reservaUID' solo puede ser una cadena de letras minúsculas y numeros sin espacios.";
            throw new Error(error);
        }
        if (!pagoUID || !filtroNumerosEnteros.test(pagoUID)) {
            const error = "el campo 'pagoUID' solo puede ser una cadena de numeros.";
            throw new Error(error);
        }
        if (tipoReembolso !== "porPorcentaje" && tipoReembolso !== "porCantidad") {
            const error = "el campo 'tipoReembolso' solo puede ser porPorcentaje o porCantidad.";
            // throw new Error(error)
        }
        if (!cantidad || !filtroDecimales.test(cantidad)) {
            const error = "LA cantida del reembolso solo puede ser una cadena con un numero don dos decimales separados por punto";
            throw new Error(error);
        }
        const tipoDeReembolso = ["efectivo", "cheque", "pasarela", "tarjeta"];
        if (!tipoDeReembolso.some(palabra => plataformaDePagoEntrada.includes(palabra))) {
            const error = "Selecciona eltipo de plataforma en la que se va ha hacer el reembolso, por ejemplo, pasarela, tarjeta, efectivo o cheque";
            throw new Error(error);
        }
        const detallesReserva = await validadoresCompartidos.reservas.validarReserva(reservaUID);
        const estadoReserva = detallesReserva.estadoReserva;
        const estadoPago = detallesReserva.estadoPago;
        if (estadoPago === "noPagado") {
            // const error = "No se puede hacer un reembolso de un pago asociado a una resera no pagada"
            // throw new Error(error)
        }
        const validarPago = `
                            SELECT
                            "pagoUID",
                            "plataformaDePago",
                            cantidad,
                            "pagoUIDPasarela"
                            FROM "reservaPagos"
                            WHERE reserva = $1 AND "pagoUID" = $2`;
        const resuelveValidarPago = await conexion.query(validarPago, [reservaUID, pagoUID]);
        if (resuelveValidarPago.rowCount === 0) {
            const error = "No existe el pago dentro de la reserva";
            throw new Error(error);
        }
        if (resuelveValidarPago.rowCount === 1) {
            const detallesDelPago = resuelveValidarPago.rows[0];
            const plataformaDePago = detallesDelPago.plataformaDePago;
            const pagoUID = detallesDelPago.pagoUID;
            const pagoUIDPasarela = detallesDelPago.pagoUIDPasarela;
            const controlTotalPago = detallesDelPago.cantidad;
            let reembolsoUIPasarela;
            let estadoReembolso;
            let fechaCreacion;
            let fechaActualizacion;
            const moneda = "USD";
            if (Number(controlTotalPago) < Number(cantidad)) {
                const error = `El valor del reembolso ${cantidad} supera el valor total del pago ${controlTotalPago} que se quiere reembolsar.`;
                throw new Error(error);
            }
            // controlar que el reembolso no sea superior al maximo  reembolsable teniendo en cuenta todos los reembolsos ya realizados de cualquuier tipo
            const consultaReembolsosDelPago = `
                                SELECT
                                cantidad
                                FROM "reservaReembolsos"
                                WHERE "pagoUID" = $1`;
            const reembolsosDelPago = await conexion.query(consultaReembolsosDelPago, [pagoUID]);
            if (reembolsosDelPago.rowCount > 0) {
                let totalReembolsado = 0;
                const reembolsos = reembolsosDelPago.rows;
                reembolsos.map((detallesDelReembolso) => {
                    const cantidadDelReembolso = detallesDelReembolso.cantidad;
                    totalReembolsado = new Decimal(totalReembolsado).plus(cantidadDelReembolso);
                });
                const totalReembolsable = new Decimal(controlTotalPago).minus(totalReembolsado);
                if (Number(cantidad) >= Number(totalReembolsable)) {
                    const error = `El valor del reembolso ${cantidad} supera el valor total reembolsable de este pago (${totalReembolsable}). Recuerda que no puedes realizar un reembolso que supere la cantidad reembolsable del pago. Ten encuenta el resto de reembolsos a la hora de hacer un reembolso mas de este pago`;
                    throw new Error(error);
                }
            }
            if (plataformaDePagoEntrada === "pasarela" && plataformaDePago !== "pasarela") {
                const error = `No se puede enviar este reembolso a la pasarela por que este pago no se hizo por la pasarela. Para realizar un reembolso a atraves de la pasarela, el pago del cual forma parte el reembolso tiene que haberse producido por la pasarela.`;
                throw new Error(error);
            }
            if (plataformaDePago === "pasarela" && plataformaDePagoEntrada === "pasarela") {
                const error = `La opcionn de enviar un reembolso a la pasarela esta deshabilitada.`;
                throw new Error(error);

                const totalFormatoSquare = Number(cantidad.replace(".", ""));
                const reembolsoDetalles = {
                    idempotencyKey: uuidv4(),
                    amountMoney: {
                        amount: totalFormatoSquare,
                        currency: moneda
                    },
                    paymentId: pagoUIDPasarela
                };
                const procesadorReembolso = await componentes.pasarela.crearReenbolso(reembolsoDetalles);
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
                reembolsoUIPasarela = procesadorReembolso.id;
                cantidad = utilidades.deFormatoSquareAFormatoSQL(procesadorReembolso.amountMoney.amount);
                estadoReembolso = procesadorReembolso.status;
                fechaCreacion = procesadorReembolso.createdAt;
                fechaActualizacion = procesadorReembolso.updatedAt;
            }
            if (plataformaDePagoEntrada !== "pasarela") {
                fechaCreacion = DateTime.utc().toISO();
            }
            // Si es pago es de pasarela, enviar el reembolso a la pasarelaa y luego proseguir norma
            const insertarReembolso = `
                                INSERT INTO
                                    "reservaReembolsos"
                                    (
                                    "pagoUID",
                                    cantidad,
                                    "plataformaDePago",
                                    "reembolsoUIDPasarela",
                                    estado,
                                    "fechaCreacion",
                                    "fechaActualizacion"
                                    )
                                VALUES 
                                    ($1,$2,$3,$4,$5,$6,$7)
                                RETURNING
                                    "reembolsoUID"
                                `;
            const datosNuevoReembolso = [
                pagoUID,
                cantidad,
                plataformaDePagoEntrada,
                reembolsoUIPasarela,
                estadoReembolso,
                fechaCreacion,
                fechaActualizacion,
            ];
            const resuelveInsertarReembolso = await conexion.query(insertarReembolso, datosNuevoReembolso);
            const reembolsoUID = resuelveInsertarReembolso.rows[0].reembolsoUID;
            const ok = {
                reembolsoUID: reembolsoUID
            };
            if (plataformaDePagoEntrada === "pasarela") {
                ok.ok = "Se ha guardado el reembolso en la base de datos y enviado con exito a la pasarela. El dinero del reembolso se esta reembolsando a traves de la pasarela";
            } else {
                ok.ok = "Se ha guardado el reembolso en la base de datos verifique que el reembolso sea entrago al cliente";
            }
            salida.json(ok);
        }
    } catch (errorCapturado) {
        let errorFinal;
        if (errorCapturado?.result?.errors[0]?.code) {
            errorFinal = errorCapturado.result.errors[0].code;
        } else {
            errorFinal = errorCapturado.message;
        }
        const error = {
            error: errorFinal
        };
        salida.json(error);
    }
}