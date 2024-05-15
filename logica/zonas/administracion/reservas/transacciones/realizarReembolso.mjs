import Decimal from "decimal.js";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { DateTime } from "luxon";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";
import { eliminarPagoPorPagoUID } from "../../../../repositorio/reservas/transacciones/eliminarPagoPorPagoUID.mjs";
import { insertarReembolso } from "../../../../repositorio/reservas/transacciones/insertarReembolso.mjs";
import { obtenerReembolsosPorPagoUID } from "../../../../repositorio/reservas/transacciones/obtenerReembolsosPorPagoUID.mjs";

export const realizarReembolso = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        const reservaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reser (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const cantidad = validadoresCompartidos.tipos.cadena({
            string: entrada.body.cantidad,
            nombreCampo: "El campo cantidad",
            filtro: "cadenaConNumerosConDosDecimales",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const pagoUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.pagoUID,
            nombreCampo: "El identificador universal del pago (pagoUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const palabra = validadoresCompartidos.tipos.cadena({
            string: entrada.body.palabra,
            nombreCampo: "El campo de la palabra",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        if (palabra !== "reembolso") {
            const error = "Escriba la palabra reembolso en le campo de confirmacion";
            throw new Error(error);
        }

        const tipoReembolso = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoReembolso,
            nombreCampo: "El tipoReembolso",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        if (tipoReembolso !== "porPorcentaje" && tipoReembolso !== "porCantidad") {
            const error = "el campo 'tipoReembolso' solo puede ser porPorcentaje o porCantidad.";
            throw new Error(error)
        }

        const plataformaDePagoEntrada = validadoresCompartidos.tipos.cadena({
            string: entrada.body.plataformaDePagoEntrada,
            nombreCampo: "El nombre de plataformaDePagoEntrada",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

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

        const detallesDelPago = await eliminarPagoPorPagoUID({
            reservaUID: reservaUID,
            pagoUID: pagoUID
        })
        const plataformaDePago = detallesDelPago.plataformaDePago;
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
        const reembolsoDelPago = await obtenerReembolsosPorPagoUID(pagoUID)
        if (reembolsoDelPago.length > 0) {
            let totalReembolsado = 0;
            reembolsoDelPago.map((detallesDelReembolso) => {
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
        const nuevoReembolso = await insertarReembolso({
            pagoUID: pagoUID,
            cantidad: cantidad,
            plataformaDePagoEntrada: plataformaDePagoEntrada,
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
            ok.ok = "Se ha guardado el reembolso en la base de datos y enviado con exito a la pasarela. El dinero del reembolso se esta reembolsando a traves de la pasarela";
        } else {
            ok.ok = "Se ha guardado el reembolso en la base de datos verifique que el reembolso sea entrago al cliente";
        }
        salida.json(ok);

    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}