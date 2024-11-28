import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { apartamentosPorRango } from "../../../../../shared/selectoresCompartidos/apartamentosPorRango.mjs";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { eliminarBloqueoCaducado } from "../../../../../shared/bloqueos/eliminarBloqueoCaducado.mjs";

export const apartamentosDisponiblesParaAnadirAReserva = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })

        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reservaUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const detallesReserva = await obtenerReservaPorReservaUID(reservaUID)
        if (detallesReserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar porque está cancelada.";
            throw new Error(error);
        }
        await eliminarBloqueoCaducado();
        const fechaEntrada = detallesReserva.fechaEntrada
        const fechaSalida = detallesReserva.fechaSalida
        const configuracionesAlojamiento = await obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV({
            estadoIDV: "activado",
            zonaArray: ["global", "privada"]
        })
        const apartamentosIDV = configuracionesAlojamiento.map(c => c.apartamentoIDV)

        const transactor = await apartamentosPorRango({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            apartamentosIDV: apartamentosIDV,
            zonaConfiguracionAlojamientoArray: ["privada", "global"],
            zonaBloqueo_array: ["privada", "global"],
        });
        const apartamentosDisponiblesIDV = transactor.apartamentosDisponibles;
        const apartamentosNoDisponiblesIDV = transactor.apartamentosNoDisponibles;
        const estructuraFinal = {
            apartamentosDisponibles: [],
            apartamentosNoDisponibles: []
        };
        for (const apartamentoIDV of apartamentosDisponiblesIDV) {
            const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "noExiste"
            });
            const detalleApartamento = {
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamento.apartamentoUI
            };
            estructuraFinal.apartamentosDisponibles.push(detalleApartamento);
        }

        for (const apartamentoIDV of apartamentosNoDisponiblesIDV) {
            const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "noExiste"
            });
            const detalleApartamento = {
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamento.apartamentoUI
            };
            estructuraFinal.apartamentosNoDisponibles.push(detalleApartamento);
        }
        const ok = {
            ok: estructuraFinal
        }
        return ok


    } catch (errorCapturado) {
        throw errorCapturado
    }
}