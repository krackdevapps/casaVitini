import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { eliminarConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/eliminarConfiguracionPorApartamentoIDV.mjs";
import { codigoZonaHoraria } from "../../../../sistema/configuracion/codigoZonaHoraria.mjs";
import { DateTime } from "luxon";
import { obtenerReservasPresentesFuturas } from "../../../../repositorio/reservas/selectoresDeReservas/obtenerReservasPresentesFuturas.mjs";
import { reservasPresentesFuturas } from "../../../../sistema/reservas/reservasPresentasFuturas.mjs";
import { obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID } from "../../../../repositorio/reservas/apartamentos/obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID.mjs";
import { obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUIDArray } from "../../../../repositorio/reservas/apartamentos/obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUIDArray.mjs";

export const eliminarConfiguracionDeAlojamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const configuracionApartamento = await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)
        if (configuracionApartamento.length === 0) {
            const error = "No existe el perfil de configuracion del apartamento";
            throw new Error(error);
        }

        const reservasActivas = await reservasPresentesFuturas()
        const reservasUIDArray = reservasActivas.map((reserva) => {
            return reserva.reservaUID
        })
        const apartamentosReserva = await obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUIDArray({
            reservaUIDArray: reservasUIDArray,
            apartamentoIDV
        })
        if (apartamentosReserva.length > 0) {
            const error = {
                error: "No se puede borrar esta configuracion de alojamiento por que esta en reservas activas presentes o futuras.",
                reservasActiva: apartamentosReserva
            }
            throw error
        }

        await eliminarConfiguracionPorApartamentoIDV(apartamentoIDV)
        const ok = {
            ok: "Se ha eliminado correctamente la configuracion de apartamento",
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }

}