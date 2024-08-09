import { validarObjetoReservaSoloFormato } from '../reservas/validarObjetoReservaSoloFormato.mjs';
import { totalesBasePorRango } from './totalesBasePorRango.mjs';
import Decimal from 'decimal.js';
import { validadoresCompartidos } from '../validadores/validadoresCompartidos.mjs';

export const calcularPrecioPorObjeto = async (reserva) => {
    try {
        await validarObjetoReservaSoloFormato(reserva);
        const alojamiento = reserva.alojamiento;
        const fechaEntrada_Humano = reserva.entrada;
        const fechaSalida_Humano = reserva.salida;

        const fechaEntrada = (await validadoresCompartidos.fechas.validarFecha_Humana({
            fecha_ISO: fechaEntrada_Humano,
            nombreCampo: "La fecha de entrada"
        })).fecha_ISO;
        const fechaSalida = (await validadoresCompartidos.fechas.validarFecha_Humana({
            fecha_ISO: fechaSalida_Humano,
            nombreCampo: "La fecha de salida"
        })).fecha_ISO;

        const alojamientoArreglo = Object.keys(alojamiento);

        const desglosePrecioApartamentos = await totalesBasePorRango({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            apartamentosIDVArreglo: alojamientoArreglo
        })

        const numeroNoches = desglosePrecioApartamentos.metadatos.numeroNoches;
        const totalNeto = desglosePrecioApartamentos.metadatos.totalNeto;
        const totalNetoDecimal = new Decimal(totalNeto);

        const precioFinal = {
            fechas: {
                entrada: fechaEntrada_Humano,
                salida: fechaSalida_Humano,
                creacion_ISO_UTC: reserva.creacion_ISO_UTC,
                numeroDeDiasConNoche: numeroNoches,
            },

            desgloseFinanciero: {
                ...desglosePrecioApartamentos,
                totales: {
                    promedioNetoPorNoche: totalNetoDecimal.dividedBy(numeroNoches).toFixed(2),
                    totalReservaNetoSinOfertas: new Decimal(totalNeto).toString(),
                    totalReservaNeto: new Decimal(totalNeto).toString(),
                },
            }
        };

        delete desglosePrecioApartamentos.metadatos;
        return precioFinal;
    } catch (errorCapturado) {
        throw errorCapturado
    }

};
