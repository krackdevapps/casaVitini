
import { aplicarImpuestos } from './aplicarImpuestos.mjs';
import Decimal from 'decimal.js';
import { sistemaDeOfertas } from '../../sistema/ofertas/sistemaDeOfertas.mjs';
import { obtenerTotalesReservaPorReservaUID } from '../../repositorio/reservas/reserva/obtenerTotalesReservaPorReservaUID.mjs';
import { obtenerApartamentosDeLaReservaPorReservaUID } from '../../repositorio/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs';
import { calcularPrecioPorObjeto } from './calcularPrecioPorObjeto.mjs';
Decimal.set({ precision: 100 });

export const precioReserva = async (metadatos) => {
    try {
        const tipoProcesadorPrecio = metadatos.tipoProcesadorPrecio
        const reservaUID = metadatos.reservaUID
        if (tipoProcesadorPrecio !== "objeto" && tipoProcesadorPrecio !== "uid") {
            const error = "El campo 'tipoProcesadorPrecio1' solo puede ser objeto o uid"
            throw new Error(error)
        }
        let reservaParaCalcular
        if (tipoProcesadorPrecio === "objeto") {
            reservaParaCalcular = metadatos.reservaUID
        }
        if (tipoProcesadorPrecio === "uid") {

            const reserva = await obtenerTotalesReservaPorReservaUID(reservaUID)
            const fechaEntrada_ISO = reserva.fechaEntrada
            const fechaSalida_ISO = reserva.fechaSalida
            // Extrae apartamentos
            const apartamentosDeLaReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)

            apartamentosDeLaReserva.forEach(apartamento => {
                return apartamento.apartamento
            })
            const moldeReserva = {
                fechaEntrada_ISO: fechaEntrada_ISO,
                fechaSalida_ISO: fechaSalida_ISO,
                fechaCreacion_ISO: reserva.fechaCreacion,
                alojamiento: {}
            }
            apartamentosDeLaReserva.forEach(apartamento => {
                moldeReserva.alojamiento[apartamento] = {}
            })
            reservaParaCalcular = moldeReserva
        }
        const resuelvePrecioReserva = await calcularPrecioPorObjeto(reservaParaCalcular)
        const totalReservaNeto = new Decimal(resuelvePrecioReserva.desgloseFinanciero.totales.totalReservaNeto)
        
        const resuelveOfertas = await sistemaDeOfertas(resuelvePrecioReserva)
        resuelvePrecioReserva.desgloseFinanciero.ofertas = resuelveOfertas.ofertas

        const descuentoFinal = new Decimal(resuelveOfertas.descuentoFinal)
        if (descuentoFinal > 0) {
            const totalDescuentos = totalReservaNeto.minus(descuentoFinal)
            resuelvePrecioReserva.desgloseFinanciero.totales.totalReservaNeto = totalReservaNeto.isNegative() ? "0.00" : totalReservaNeto.toFixed(2)
            resuelvePrecioReserva.desgloseFinanciero.totales.totalDescuentos = totalDescuentos.toFixed(2)
        }

        const impuestosAplicados = await aplicarImpuestos(totalReservaNeto)
        const totalImpuestos = impuestosAplicados.sumaImpuestos.toFixed(2)

        resuelvePrecioReserva.desgloseFinanciero.impuestos = impuestosAplicados.impuestos
        resuelvePrecioReserva.desgloseFinanciero.totales.totalImpuestos = totalImpuestos

        const totalConImpuestos = totalReservaNeto.plus(impuestosAplicados.sumaImpuestos)
        const totalBrutoFinal = new Decimal(totalConImpuestos)
        resuelvePrecioReserva.desgloseFinanciero.totales.totalConImpuestos = totalBrutoFinal.isNegative() ? "0.00" : totalBrutoFinal.toFixed(2);
        const ok = {
            ok: resuelvePrecioReserva
        }
        return ok
    } catch (error) {
        throw error;
    }
}
