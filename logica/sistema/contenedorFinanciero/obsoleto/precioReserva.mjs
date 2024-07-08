
//import { aplicarImpuestos } from './aplicarImpuestos.mjs';
import Decimal from 'decimal.js';
//import { sistemaDeOfertas } from '../../sistema/ofertas/sistemaDeOfertas.mjs';
// import { obtenerApartamentosDeLaReservaPorReservaUID } from '../../repositorio/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs';
// import { calcularPrecioPorObjeto } from './calcularPrecioPorObjeto.mjs';
// import { obtenerDesgloseFinancieroReservaPorReservaUID } from '../../repositorio/reservas/reserva/obtenerDesgloseFinancieroReservaPorReservaUID.mjs';
const precisionDecimal = Number(process.env.PRECISION_DECIMAL)
Decimal.set({ precision: precisionDecimal });

export const precioReserva = async (metadatos) => {
    try {
        //     const tipoProcesadorPrecio = metadatos.tipoProcesadorPrecio
        //     const reservaUID = metadatos.reservaUID
        //     if (tipoProcesadorPrecio !== "objeto" && tipoProcesadorPrecio !== "uid") {
        //         const error = "El campo 'tipoProcesadorPrecio1' solo puede ser objeto o uid"
        //         throw new Error(error)
        //     }
        //     let reservaParaCalcular
        //     if (tipoProcesadorPrecio === "objeto") {
        //         reservaParaCalcular = metadatos.reservaUID
        //     }
        //     if (tipoProcesadorPrecio === "uid") {

        //         const reserva = await obtenerDesgloseFinancieroReservaPorReservaUID(reservaUID)
        //         const fechaEntrada = reserva.fechaEntrada
        //         const fechaSalida = reserva.fechaSalida
        //         // Extrae apartamentos
        //         const apartamentosDeLaReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)

        //         apartamentosDeLaReserva.forEach(apartamento => {
        //             return apartamento.apartamento
        //         })
        //         const moldeReserva = {
        //             fechaEntrada: fechaEntrada,
        //             fechaSalida: fechaSalida,
        //             fechaCreacion_ISO: reserva.fechaCreacion,
        //             alojamiento: {}
        //         }
        //         apartamentosDeLaReserva.forEach(apartamento => {
        //             moldeReserva.alojamiento[apartamento] = {}
        //         })
        //         reservaParaCalcular = moldeReserva
        //     }
        //     const resuelvePrecioReserva = await calcularPrecioPorObjeto(reservaParaCalcular)
        //     const totalReservaNeto = new Decimal(resuelvePrecioReserva.desgloseFinanciero.totales.totalReservaNeto)

        //     //const resuelveOfertas = await sistemaDeOfertas(resuelvePrecioReserva)
        //     resuelvePrecioReserva.desgloseFinanciero.ofertas = resuelveOfertas.ofertas

        //     const descuentoFinal = new Decimal(resuelveOfertas.descuentoFinal)
        //     if (descuentoFinal > 0) {
        //         const totalDescuentos = totalReservaNeto.minus(descuentoFinal)
        //         resuelvePrecioReserva.desgloseFinanciero.totales.totalReservaNeto = totalReservaNeto.isNegative() ? "0.00" : totalReservaNeto.toFixed(2)
        //         resuelvePrecioReserva.desgloseFinanciero.totales.totalDescuentos = totalDescuentos.toFixed(2)
        //     }

        //     //const impuestosAplicados = await aplicarImpuestos(totalReservaNeto)
        //     const totalImpuestos = impuestosAplicados.sumaImpuestos.toFixed(2)

        //     resuelvePrecioReserva.desgloseFinanciero.impuestos = impuestosAplicados.impuestos
        //     resuelvePrecioReserva.desgloseFinanciero.totales.totalImpuestos = totalImpuestos

        //     const totalConImpuestos = totalReservaNeto.plus(impuestosAplicados.sumaImpuestos)
        //     const totalBrutoFinal = new Decimal(totalConImpuestos)
        //     resuelvePrecioReserva.desgloseFinanciero.totales.totalConImpuestos = totalBrutoFinal.isNegative() ? "0.00" : totalBrutoFinal.toFixed(2);
        //     const ok = {
        //         ok: resuelvePrecioReserva
        //     }
        //     return ok

    } catch (errorCapturado) {
        throw error;
    }
}
