import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { eliminarConfiguracionPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/eliminarConfiguracionPorApartamentoIDV.mjs";
import { reservasPresentesFuturas } from "../../../../shared/reservas/reservasPresentasFuturas.mjs";
import { obtenerApartamentoDeLaReservasPorApartamentoIDVPorReservaUIDArray } from "../../../../infraestructure/repository/reservas/apartamentos/obtenerApartamentoDeLaReservasPorApartamentoIDVPorReservaUIDArray.mjs";

export const eliminarConfiguracionDeAlojamiento = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })

        const reservasActivas = await reservasPresentesFuturas()
        const reservasUIDArray = reservasActivas.map((reserva) => {
            return reserva.reservaUID
        })
        const apartamentosReserva = await obtenerApartamentoDeLaReservasPorApartamentoIDVPorReservaUIDArray({
            reservaUIDArray: reservasUIDArray,
            apartamentoIDV
        })
        if (apartamentosReserva.length > 0) {
            const error = {
                error: "No se puede borrar esta configuración de alojamiento porque está en reservas activas presentes o futuras. Puedes modificar completamente esta configuración de alojamiento pero no borrarla por temas de integridad. Si esta configuración de alojamiento no estuviera en ninguna reserva activa, sí se podría borrar.",
                reservasActivas: apartamentosReserva
            }
            throw error
        }

        await eliminarConfiguracionPorApartamentoIDV(apartamentoIDV)
        const ok = {
            ok: "Se ha eliminado correctamente la configuración de apartamento",
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }

}