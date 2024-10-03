import Decimal from "decimal.js";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { DateTime } from "luxon";
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { insertarReembolso } from "../../../../../infraestructure/repository/reservas/transacciones/reembolsos/insertarReembolso.mjs";
import { obtenerReembolsosPorPagoUID_ordenados } from "../../../../../infraestructure/repository/reservas/transacciones/reembolsos/obtenerReembolsosPorPagoUID_ordenados.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerPagoPorPagoUIDYReservaUID } from "../../../../../infraestructure/repository/reservas/transacciones/pagos/obtenerPagoPorPagoUIDYReservaUID.mjs";
import { controlEstructuraPorJoi } from "../../../../../shared/validadores/controlEstructuraPorJoi.mjs";
import Joi from "joi";

export const realizarReembolso = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()

        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const cantidad = validadoresCompartidos.tipos.cadena({
            string: entrada.body.cantidad,
            nombreCampo: "El campo cantidad",
            filtro: "cadenaConNumerosConDosDecimales",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no"
        })
        const pagoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.pagoUID,
            nombreCampo: "El identificador universal del pago (pagoUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"

        })

        const tipoReembolso = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoReembolso,
            nombreCampo: "El tipoReembolso",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const schema = Joi.object({
            reservaUID: Joi.required(),
            cantidad: Joi.string(),
            pagoUID: Joi.string(),
            plataformaDePagoEntrada: Joi.string(),
            palabra: Joi.string().optional(),
            tipoReembolso: Joi.string()
        }).required().messages({
            'any.required': '{{#label}} es una llave obligatoria',
            'string.base': '{{#label}} debe de ser una cadena'

        })

        controlEstructuraPorJoi({
            schema: schema,
            objeto: entrada.body
        })

        if (tipoReembolso !== "porPorcentaje" && tipoReembolso !== "porCantidad") {
            const error = "El campo 'tipoReembolso' solo puede ser porPorcentaje o porCantidad.";
            throw new Error(error)
        }

        const plataformaDePagoEntrada = validadoresCompartidos.tipos.cadena({
            string: entrada.body.plataformaDePagoEntrada,
            nombreCampo: "El nombre de plataformaDePagoEntrada",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const tipoDeReembolso = ["efectivo", "cheque", "pasarela", "tarjeta"];
        if (!tipoDeReembolso.some(palabra => plataformaDePagoEntrada.includes(palabra))) {
            const error = "Selecciona el tipo de plataforma en la que se va a hacer el reembolso, por ejemplo, pasarela, tarjeta, efectivo o cheque";
            throw new Error(error);
        }
        const detallesReserva = await obtenerReservaPorReservaUID(reservaUID);
        const estadoReserva = detallesReserva.estadoReserva;
        const estadoPago = detallesReserva.estadoPago;
        if (estadoPago === "noPagado") {


        }

        const detallesDelPago = await obtenerPagoPorPagoUIDYReservaUID({
            reservaUID: reservaUID,
            pagoUID: pagoUID
        })
        const plataformaDePago = detallesDelPago.plataformaDePagoIDV;
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

        const reembolsoDelPago = await obtenerReembolsosPorPagoUID_ordenados(pagoUID)
        if (reembolsoDelPago.length > 0) {
            let totalReembolsado = 0;
            reembolsoDelPago.forEach((detallesDelReembolso) => {
                const cantidadDelReembolso = detallesDelReembolso.cantidad;
                totalReembolsado = new Decimal(totalReembolsado).plus(cantidadDelReembolso);
            });
            const totalReembolsable = new Decimal(controlTotalPago).minus(totalReembolsado);
            if (Number(cantidad) >= Number(totalReembolsable)) {
                const error = `El valor del reembolso ${cantidad} supera el valor total reembolsable de este pago (${totalReembolsable}). Recuerda que no puedes realizar un reembolso que supere la cantidad reembolsable del pago. Ten en cuenta el resto de reembolsos a la hora de hacer un reembolso más de este pago.`;
                throw new Error(error);
            }
        }
        if (plataformaDePagoEntrada === "pasarela" && plataformaDePago !== "pasarela") {
            const error = `No se puede enviar este reembolso a la pasarela porque este pago no se hizo por la pasarela. Para realizar un reembolso a través de la pasarela, el pago del cual forma parte del reembolso tiene que haberse producido por la pasarela.`;
            throw new Error(error);
        }
        if (plataformaDePago === "pasarela" && plataformaDePagoEntrada === "pasarela") {
            const error = `La opción de enviar un reembolso a la pasarela está deshabilitada.`;
            throw new Error(error);

            const palabra = validadoresCompartidos.tipos.cadena({
                string: entrada.body.palabra,
                nombreCampo: "El campo de la palabra",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                soloMinusculas: "si"
            })


            if (palabra !== "reembolso") {
                const error = "Escriba la palabra reembolso en el campo de confirmación";
                throw new Error(error);
            }

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
                        error = "Revisa el código de la moneda introducido. Solo se aceptan dólares. Código: USD";
                        throw new Error(error);
                    case "NOT_FOUND":
                        error = "La pasarela informa de que el idenficador del reembolso no existe en la pasarela";
                        throw new Error(error);
                    default:
                        error = "La pasarela informa de un error genérico";
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
        const nuevoReembolso = await insertarReembolso({
            pagoUID: pagoUID,
            cantidad: cantidad,
            plataformaDePagoIDV: plataformaDePagoEntrada,
            reembolsoUIPasarela: reembolsoUIPasarela,
            estadoReembolso: estadoReembolso,
            fechaCreacion: fechaCreacion,
            fechaActualizacion: fechaActualizacion,
        })
        const reembolsoUID = nuevoReembolso.reembolsoUID;
        const ok = {
            reembolsoUID: reembolsoUID
        };
        if (plataformaDePagoEntrada === "pasarela") {
            ok.ok = "Se ha guardado el reembolso en la base de datos y enviado con éxito a la pasarela. El dinero del reembolso se está reembolsando a través de la pasarela.";
        } else {
            ok.ok = "Se ha guardado el reembolso en la base de datos. Verifique que el reembolso sea entregado al cliente.";
        }
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}