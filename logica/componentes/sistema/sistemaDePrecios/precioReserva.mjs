
import { validarObjetoReservaSoloFormato } from '../validarObjetoReservaSoloFormato.mjs';
import { precioRangoApartamento } from './precioRangoApartamento.mjs';
import { aplicarImpuestos } from '../aplicarImpuestos.mjs';
import Decimal from 'decimal.js';
import { validadoresCompartidos } from '../../validadoresCompartidos.mjs';
import { sistemaDeOfertas } from '../../sistema/sistemaDeOfertas/sistemaDeOfertas.mjs';
import { conexion } from '../../db.mjs';
Decimal.set({ precision: 100 });
const calcularPrecioPorObjeto = async (reserva) => {
    await validarObjetoReservaSoloFormato(reserva);
    const alojamiento = reserva.alojamiento
    const fechaEntrada_Humano = reserva.entrada
    const fechaSalida_Humano = reserva.salida
    const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada_Humano)).fecha_ISO
    const fechaSalida_IDO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida_Humano)).fecha_ISO
    const alojamientoArreglo = Object.keys(alojamiento)
    const metadatosPrecioRangoApartamento = {
        fechaEntrada_ISO: fechaEntrada_ISO,
        fechaSalida_ISO: fechaSalida_IDO,
        apartamentosIDVArreglo: alojamientoArreglo
    }
    const desglosePrecioApartamentos = await precioRangoApartamento(metadatosPrecioRangoApartamento)
    const numeroNoches = desglosePrecioApartamentos.metadatos.numeroNoches
    const totalNeto = desglosePrecioApartamentos.metadatos.totalNeto
    const totalNetoDecimal = new Decimal(totalNeto)
    const precioFinal = {}
    precioFinal.fechas = {}
    precioFinal.fechas.entrada = fechaEntrada_Humano
    precioFinal.fechas.salida = fechaSalida_Humano
    precioFinal.fechas.creacion_ISO_UTC = reserva.creacion_ISO_UTC
    precioFinal.fechas.numeroDeDiasConNoche = numeroNoches
    delete desglosePrecioApartamentos.metadatos
    precioFinal.desgloseFinanciero = desglosePrecioApartamentos
    precioFinal.desgloseFinanciero.totales = {}
    precioFinal.desgloseFinanciero.totales.promedioNetoPorNoche = totalNetoDecimal.dividedBy(numeroNoches).toFixed(2)
    precioFinal.desgloseFinanciero.totales.totalReservaNetoSinOfertas = new Decimal(totalNeto).toString()
    precioFinal.desgloseFinanciero.totales.totalReservaNeto = new Decimal(totalNeto).toString()
    return precioFinal
}
const precioReserva = async (metadatos) => {
    try {
        const tipoProcesadorPrecio = metadatos.tipoProcesadorPrecio
        const reserva = metadatos.reserva
        if (tipoProcesadorPrecio !== "objeto" && tipoProcesadorPrecio !== "uid") {
            const error = "El campo 'tipoProcesadorPrecio1' solo puede ser objeto o uid"
            throw new Error(error)
        }
        let reservaParaCalcular
        if (tipoProcesadorPrecio === "objeto") {
            reservaParaCalcular = metadatos.reserva
        }
        if (tipoProcesadorPrecio === "uid") {
            if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo"
                throw new Error(error)
            }
            const validarReserva = `
            SELECT
            reserva,
            to_char(entrada, 'DD/MM/YYYY') as entrada, 
            to_char(salida, 'DD/MM/YYYY') as salida,
            to_char(creacion, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "creacion_ISO_UTC"
            FROM reservas
            WHERE reserva = $1`
            const resuelveValidarReserva = await conexion.query(validarReserva, [reserva])
            if (resuelveValidarReserva.rowCount === 0) {
                const error = "No existe la reserva"
                throw new Error(error)
            }
            const fechaEntrada_Humano = resuelveValidarReserva.rows[0].entrada
            const fechaSalida_Humano = resuelveValidarReserva.rows[0].salida
            // Extrae apartamentos
            const apartamentosReservas = `
            SELECT apartamento 
            FROM "reservaApartamentos" 
            WHERE reserva = $1;`
            let resuelveapartamentosReservas = await conexion.query(apartamentosReservas, [reserva])
            if (resuelveapartamentosReservas.rowCount === 0) {
                const error = "Esta reserva no tiene apartamentos"
                throw new Error(error)
            }
            const apartamentosReserva1 = [];
            (resuelveapartamentosReservas.rows).map(apartamento => {
                apartamentosReserva1.push(apartamento.apartamento)
            })
            const moldeReserva = {}
            moldeReserva.entrada = fechaEntrada_Humano
            moldeReserva.salida = fechaSalida_Humano
            moldeReserva.creacion_ISO_UTC = resuelveValidarReserva.rows[0].creacion_ISO_UTC
            moldeReserva.alojamiento = {}
            apartamentosReserva1.map(apartamento => {
                moldeReserva.alojamiento[apartamento] = {}
            })
            reservaParaCalcular = moldeReserva
        }
        const resuelvePrecioReserva = await calcularPrecioPorObjeto(reservaParaCalcular)
        let totalNeto = new Decimal(resuelvePrecioReserva.desgloseFinanciero.totales.totalReservaNeto)
        const resuelveOfertas = await sistemaDeOfertas(resuelvePrecioReserva)
        resuelvePrecioReserva.desgloseFinanciero.ofertas = resuelveOfertas.ofertas
        const descuentoFinal = new Decimal(resuelveOfertas.descuentoFinal)
        if (descuentoFinal > 0) {
            totalNeto = totalNeto.minus(descuentoFinal)
            resuelvePrecioReserva.desgloseFinanciero.totales.totalReservaNeto = totalNeto.isNegative() ? "0.00" : totalNeto.toFixed(2)
            resuelvePrecioReserva.desgloseFinanciero.totales.totalDescuentos = descuentoFinal.toFixed(2)
        }
        const impuestos = await aplicarImpuestos(totalNeto)
        const totalImpuestos = impuestos.sumaImpuestos.toFixed(2)

        resuelvePrecioReserva.desgloseFinanciero.impuestos = impuestos.impuestos
        resuelvePrecioReserva.desgloseFinanciero.totales.totalImpuestos = totalImpuestos
        const totalConImpuestos = totalNeto.plus(impuestos.sumaImpuestos)
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
export {
    precioReserva
}