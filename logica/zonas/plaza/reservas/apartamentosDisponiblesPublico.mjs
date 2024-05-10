import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../sistema/configuracion/codigoZonaHoraria.mjs";
import { configuracionApartamento } from "../../../sistema/configuracionApartamento.mjs";
import { interruptor } from "../../../sistema/configuracion/interruptor.mjs";
import { apartamentosPorRango } from "../../../sistema/selectoresCompartidos/apartamentosPorRango.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/bloqueos/eliminarBloqueoCaducado.mjs";
import { precioRangoApartamento } from "../../../sistema/precios/precioRangoApartamento.mjs";
import { mensajesUI } from "../../../componentes/mensajesUI.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
export const apartamentosDisponiblesPublico = async (entrada, salida) => {
    try {
        if (!await interruptor("aceptarReservasPublicas")) {
            throw new Error(mensajesUI.aceptarReservasPublicas);

        }
        const fechaEntrada = entrada.body.entrada;
        const fechaSalida = entrada.body.salida;
        if (!fechaEntrada) {
            const error = "falta definir el campo 'entrada'";
            throw new Error(error);
        }
        if (!fechaSalida) {
            const error = "falta definir el campo 'salida'";
            throw new Error(error);
        }
        const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada)).fecha_ISO;
        const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida)).fecha_ISO;
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActual_ISO = tiempoZH.toISODate();
        const fechaEntrad_objeto = DateTime.fromISO(fechaEntrada_ISO, { zone: zonaHoraria });
        if (fechaEntrad_objeto < tiempoZH.startOf('day')) {
            const error = "La fecha de entrada no puede ser inferior a la fecha actual. Solo se pueden hacer reservas a partir de hoy";
            throw new Error(error);
        }
        await eliminarBloqueoCaducado();
        const rol = entrada.session.rol;
        const configuracionApartamentosPorRango = {
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO,
            rol: rol,
            origen: "plaza"
        };
        //const resuelveADP = await apartamentosDisponiblesPublico(fecha)
        const resuelveADP = await apartamentosPorRango(configuracionApartamentosPorRango);
        const apartamentosDisponiblesEntcontrados = resuelveADP.apartamentosDisponibles;
        const resuelveCA = await configuracionApartamento(apartamentosDisponiblesEntcontrados);
        const estructuraFinal = {};
        estructuraFinal.apartamentosDisponibles = resuelveCA.configuracionApartamento;
        // Aqui se deberia mostra la media del precio en relacion con las fechas
        const metadatos = {
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO,
            apartamentosIDVArreglo: apartamentosDisponiblesEntcontrados
        };
        const resolverPrecioApartamento = await precioRangoApartamento(metadatos);
        // Aquí se borra metadatos, pero ojo cuidado por que en precioReserva se necesita. Así que solo se borra de aquí
        delete resolverPrecioApartamento.metadatos;
        estructuraFinal.desgloseFinanciero = resolverPrecioApartamento;
        const ok = {
            ok: estructuraFinal
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}