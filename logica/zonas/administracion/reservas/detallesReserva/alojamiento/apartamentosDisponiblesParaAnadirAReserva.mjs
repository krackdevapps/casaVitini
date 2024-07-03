import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { apartamentosPorRango } from "../../../../../sistema/selectoresCompartidos/apartamentosPorRango.mjs";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";

export const apartamentosDisponiblesParaAnadirAReserva = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()


        const fechaEntrada_ISO = entrada.body.fechaEntrada_ISO;
        const fechaSalida_ISO = entrada.body.fechaSalida_ISO;
        await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada_ISO)
        await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida_ISO)
        const rol = entrada.session.rol;
   
        const transactor = await apartamentosPorRango({
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO,
            zonaConfiguracionAlojamientoArray: ["privada", "global"],
            zonaBloqueo_array: ["privado", "global"],
        });
        const apartamentosDisponbilesIDV = transactor.apartamentosDisponibles;
        const apartamentosNoDisponiblesIDV = transactor.apartamentosNoDisponibles;
        const estructuraFinal = {
            apartamentosDisponibles: [],
            apartamentosNoDisponibles: []
        };
        for (const apartamentoIDV of apartamentosDisponbilesIDV) {
            const apartamentoUI = await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV);
            const detalleApartamento = {
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamentoUI
            };
            estructuraFinal.apartamentosDisponibles.push(detalleApartamento);
        }
        for (const apartamentoIDV of apartamentosNoDisponiblesIDV) {
            const apartamentoUI = await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV);
            const detalleApartamento = {
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamentoUI
            };
            estructuraFinal.apartamentosNoDisponibles.push(detalleApartamento);
        }
        if (transactor) {
            const ok = {
                ok: estructuraFinal
            };
            return ok
        }
        salida.end();
    } catch (errorCapturado) {
        throw errorCapturado
    }
}