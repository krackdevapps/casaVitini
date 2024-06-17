import { obtenerEnlaceDePagoPorCodigoUPID } from "../../../repositorio/enlacesDePago/obtenerEnlaceDePagoPorCodigoUPID.mjs";
import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerDesgloseFinancieroPorReservaUID } from "../../../repositorio/reservas/transacciones/desgloseFinanciero/obtenerDesgloseFinancieroPorReservaUID.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

export const obtenerPago = async (entrada, salida) => {
    try {
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
            const error = "el codigo de un enlace de pago solo puede ser una cadena de minuscuals y numeros y ya esta";
            throw new Error(error);
        }
        const enalceDePago = await obtenerEnlaceDePagoPorCodigoUPID(pagoUID)
        const estadoPago = enalceDePago.estadoPago;
        if (estadoPago === "pagado") {
            const error = "Este enlace de pago esta pagado";
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
        // Hay que cambiar esto para hacer un pago en base a la cantidad especifica del enlace de pago y no del total de la reserva
        /*
        promedioNetoPorNoche
        totalReservaNetoSinOfertas
        totalReservaNeto
        totalDescuentosAplicados
        totalImpuestos
        totalConImpuestos
        */

        const totalesDeLaReserva = await obtenerDesgloseFinancieroPorReservaUID(reservaUID)
        const sumaImpuestos = new Decimal(totalesDeLaReserva.totalImpuestos);
        const totalNeto = new Decimal(totalesDeLaReserva.totalReservaNeto);
        const proporcion = new Decimal(cantidadPagoParcial).times(100).dividedBy(totalNeto).times(sumaImpuestos.dividedBy(100));
        const calcularProporcionNetoImpuestosPagoParcial = (precioNetoReserva, impuestosReserva, cantidadPago) => {
            // Convierte los valores a objetos Decimal para mayor precisión
            const precioNetoDecimal = new Decimal(precioNetoReserva);
            const impuestosDecimal = new Decimal(impuestosReserva);
            const cantidadPagoDecimal = new Decimal(cantidadPago);
            // Calcula el precio bruto sumando el precio neto y los impuestos
            const precioBruto = precioNetoDecimal.plus(impuestosDecimal);
            // Calcula la proporción que representa la cantidad del pago con respecto al precio bruto
            const proporcionPago = cantidadPagoDecimal.div(precioBruto);
            // Calcula el precio neto correspondiente a la cantidad del pago
            const precioNetoPago = precioNetoDecimal.times(proporcionPago);
            // Calcula los impuestos correspondientes a la cantidad del pago
            const impuestosPago = impuestosDecimal.times(proporcionPago);
            // Devuelve los resultados como objetos Decimal
            // Redondea los resultados a dos decimales
            const precioNetoRedondeado = precioNetoPago.toDecimalPlaces(2);
            const impuestosRedondeados = impuestosPago.toDecimalPlaces(2);
            // Devuelve los resultados redondeados como strings
            return {
                precioNetoPago: precioNetoRedondeado.toString(),
                impuestosPago: impuestosRedondeados.toString(),
            };
        };
        // Ejemplo de uso
        const precioNetoReserva = 122;
        const impuestosReserva = 18; // Por ejemplo
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