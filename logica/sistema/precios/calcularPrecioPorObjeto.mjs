import { validarObjetoReservaSoloFormato } from '../reservas/validarObjetoReservaSoloFormato.mjs';
import { precioRangoApartamento } from './precioRangoApartamento.mjs';
import Decimal from 'decimal.js';
import { validadoresCompartidos } from '../validadores/validadoresCompartidos.mjs';

export const calcularPrecioPorObjeto = async (reserva) => {
    try {
        await validarObjetoReservaSoloFormato(reserva);
        const alojamiento = reserva.alojamiento;
        const fechaEntrada_Humano = reserva.entrada;
        const fechaSalida_Humano = reserva.salida;

        const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada_Humano)).fecha_ISO;
        const fechaSalida_IDO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida_Humano)).fecha_ISO;

        const alojamientoArreglo = Object.keys(alojamiento);

        const desglosePrecioApartamentos = await precioRangoApartamento({
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_IDO,
            apartamentosIDVArreglo: alojamientoArreglo
        })

        const numeroNoches = desglosePrecioApartamentos.metadatos.numeroNoches;
        const totalNeto = desglosePrecioApartamentos.metadatos.totalNeto;
        const totalNetoDecimal = new Decimal(totalNeto);

        const precioFinal = {};
        precioFinal.fechas = {};
        precioFinal.fechas.entrada = fechaEntrada_Humano;
        precioFinal.fechas.salida = fechaSalida_Humano;
        precioFinal.fechas.creacion_ISO_UTC = reserva.creacion_ISO_UTC;
        precioFinal.fechas.numeroDeDiasConNoche = numeroNoches;
        delete desglosePrecioApartamentos.metadatos;
        precioFinal.desgloseFinanciero = desglosePrecioApartamentos;
        precioFinal.desgloseFinanciero.totales = {};
        precioFinal.desgloseFinanciero.totales.promedioNetoPorNoche = totalNetoDecimal.dividedBy(numeroNoches).toFixed(2);
        precioFinal.desgloseFinanciero.totales.totalReservaNetoSinOfertas = new Decimal(totalNeto).toString();
        precioFinal.desgloseFinanciero.totales.totalReservaNeto = new Decimal(totalNeto).toString();

        return precioFinal;
    } catch (error) {
        throw error
    }

};
