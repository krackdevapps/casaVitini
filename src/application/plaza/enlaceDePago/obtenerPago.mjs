import { obtenerEnlaceDePagoPorCodigoUPID } from "../../../infraestructure/repository/enlacesDePago/obtenerEnlaceDePagoPorCodigoUPID.mjs";
import { obtenerReservaPorReservaUID } from "../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerDesgloseFinancieroPorReservaUID } from "../../../infraestructure/repository/reservas/transacciones/desgloseFinanciero/obtenerDesgloseFinancieroPorReservaUID.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";

export const obtenerPago = async (entrada, salida) => {
    try {
        const error = "Función deshabilitada";
        throw new Error(error);

        const pagoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.pagoUID,
            nombreCampo: "El identificador universal del pago (pagoUID)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const filtroCadena = /^[a-z0-9]+$/;
        if (!pagoUID || !filtroCadena.test(pagoUID)) {
            const error = "El código de un enlace de pago solo puede ser una cadena de minúsculos y números";
            throw new Error(error);
        }
        const enalceDePago = await obtenerEnlaceDePagoPorCodigoUPID({
            codigoUPID: pagoUID,
            errorSi: "noExiste"
        })
        const estadoPago = enalceDePago?.estadoPago;
        if (estadoPago === "pagado") {
            const error = "Este enlace de pago está pagado.";
            throw new Error(error);
        }
        const codigo = enalceDePago.codigo;
        const reservaUID = enalceDePago.reservaUID;
        const cantidadPagoParcial = enalceDePago.cantidad;
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoReservaUID;
        if (estadoReserva === "cancelada") {
            const error = "La reserva esta cancelada";
            throw new Error(error);
        }
        const totalesDeLaReserva = await obtenerDesgloseFinancieroPorReservaUID(reservaUID)
        const sumaImpuestos = new Decimal(totalesDeLaReserva.totalImpuestos);
        const totalNeto = new Decimal(totalesDeLaReserva.totalReservaNeto);
        const proporcion = new Decimal(cantidadPagoParcial).times(100).dividedBy(totalNeto).times(sumaImpuestos.dividedBy(100));
        const calcularProporcionNetoImpuestosPagoParcial = (precioNetoReserva, impuestosReserva, cantidadPago) => {
            const precioNetoDecimal = new Decimal(precioNetoReserva);
            const impuestosDecimal = new Decimal(impuestosReserva);
            const cantidadPagoDecimal = new Decimal(cantidadPago);
            const precioBruto = precioNetoDecimal.plus(impuestosDecimal);
            const proporcionPago = cantidadPagoDecimal.div(precioBruto);
            const precioNetoPago = precioNetoDecimal.times(proporcionPago);

            const impuestosPago = impuestosDecimal.times(proporcionPago);

            const precioNetoRedondeado = precioNetoPago.toDecimalPlaces(2);
            const impuestosRedondeados = impuestosPago.toDecimalPlaces(2);
            return {
                precioNetoPago: precioNetoRedondeado.toString(),
                impuestosPago: impuestosRedondeados.toString(),
            };
        };
        const precioNetoReserva = 122;
        const impuestosReserva = 18;
        const cantidadPago = 50;
        const resultadoCalculado = calcularProporcionNetoImpuestosPagoParcial(totalesDeLaReserva.totalReservaNeto, totalesDeLaReserva.totalImpuestos, cantidadPagoParcial);
        const estructuraEnlace = {
            codigo: codigo,
            reserva: reserva,
            totales: totalesDeLaReserva,
            pagoParcial: {
                netoParcial: resultadoCalculado.precioNetoPago,
                impuestosParciales: resultadoCalculado.impuestosPago,
                cantidadParcial: cantidadPagoParcial,
            }
        };
        const ok = {
            ok: estructuraEnlace
        }
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}