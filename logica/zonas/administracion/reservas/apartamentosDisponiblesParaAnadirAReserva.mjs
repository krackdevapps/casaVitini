import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { apartamentosPorRango } from "../../../sistema/selectoresCompartidos/apartamentosPorRango.mjs";
import { resolverApartamentoUI } from "../../../sistema/sistemaDeResolucion/resolverApartamentoUI.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";


export const apartamentosDisponiblesParaAnadirAReserva = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return


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
        const filtroFecha = /^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/)(?:0?[1,3-9]|1[0-2]))\2|(?:(?:0?[1-9])|(?:1[0-9])|(?:2[0-8]))(\/)(?:0?[1-9]|1[0-2]))\3(?:(?:19|20)[0-9]{2})$/;
        if (!filtroFecha.test(fechaEntrada)) {
            const error = "el formato fecha de entrada no esta correctametne formateado";
            throw new Error(error);
        }
        if (!filtroFecha.test(fechaSalida)) {
            const error = "el formato fecha de salida no esta correctametne formateado";
            throw new Error(error);
        }
        const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada)).fecha_ISO;
        const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida)).fecha_ISO;
        const rol = entrada.session.rol;
        const configuracionApartamentosPorRango = {
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO,
            rol: rol,
            origen: "administracion"
        };
        const transactor = await apartamentosPorRango(configuracionApartamentosPorRango);
        const apartamentosDisponbilesIDV = transactor.apartamentosDisponibles;
        const apartamentosNoDisponiblesIDV = transactor.apartamentosNoDisponibles;
        const estructuraFinal = {
            apartamentosDisponibles: [],
            apartamentosNoDisponibles: []
        };
        for (const apartamentoIDV of apartamentosDisponbilesIDV) {
            const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
            const detalleApartamento = {
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamentoUI
            };
            estructuraFinal.apartamentosDisponibles.push(detalleApartamento);
        }
        for (const apartamentoIDV of apartamentosNoDisponiblesIDV) {
            const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
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
            salida.json(ok);
        }
        salida.end();
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } 
}