
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { eliminarConfiguracionPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/eliminarConfiguracionPorApartamentoIDV.mjs";
import { reservasPresentesFuturas } from "../../../../shared/reservas/reservasPresentasFuturas.mjs";
import { obtenerApartamentoDeLaReservasPorApartamentoIDVPorReservaUIDArray } from "../../../../infraestructure/repository/reservas/apartamentos/obtenerApartamentoDeLaReservasPorApartamentoIDVPorReservaUIDArray.mjs";
import { obtenerOfertaPorApartamentoIDVArray } from "../../../../infraestructure/repository/ofertas/obtenerOfertaPorApartamentoIDVArray.mjs";

export const eliminarConfiguracionDeAlojamiento = async (entrada) => {
    try {

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
        const apartamentosEnOfertas = await obtenerOfertaPorApartamentoIDVArray({
            apartamentosIDVArray: [apartamentoIDV]
        })


        if (apartamentosReserva.length > 0 || apartamentosEnOfertas.length > 0) {

            const infoReservas = "No se puede borrar esta configuración de alojamiento porque está en reservas activas presentes o futuras. Puedes modificar completamente esta configuración de alojamiento pero no borrarla por temas de integridad. Si esta configuración de alojamiento no estuviera en ninguna reserva activa, sí se podría borrar."
            const infoOfertas = "No se puede borrar esta configuracion de alojamiento por que esta en ofertas. Por favor borre la configuracion de alojamiento de las ofertas donde esta presente primero o borreo las ofertas donde esta presente la configuracion de alojamiento que quiere borrara"
            const infoReservaOfertas = "No se puede borrar esta configuracion de alojamiento por que esta en reservas activas y ofertas. Saque la configuracion de alojamiento de las reservas activas y sque esta configuracion de alojamiento de las ofertas activas primero."

            const selInfo = () => {
                if (apartamentosReserva.length > 0 && apartamentosEnOfertas.length > 0) {
                    return infoReservaOfertas
                } else if (apartamentosReserva.length > 0) {
                    return infoReservas
                } else if (apartamentosEnOfertas.length > 0) {
                    return infoOfertas
                }
            }
            throw {
                error: selInfo(),
                reservasActivas: apartamentosReserva,
                ofertas: apartamentosEnOfertas
            }

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