import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs"
import { actualizarDesgloseFinacieroPorModoSimplePorReservaUID } from "../../../infraestructure/repository/reservas/transacciones/desgloseFinanciero/actualizarDesgloseFinacieroPorModoSimplePorReservaUID.mjs"
import { obtenerDesglosesFinancierosPorReservaUIDARRAY } from "../../../infraestructure/repository/reservas/transacciones/desgloseFinanciero/obtenerDesglosesFinancierosPorReservaUIDARRAY.mjs"
import { actualizadorIntegradoDesdeInstantaneas } from "../../contenedorFinanciero/entidades/reserva/actualizadorIntegradoDesdeInstantaneas.mjs"
import { actualizaApartamentoIDVEnObjetoOfertas } from "./actualizaApartamentoIDVEnObjetoOfertas.mjs"

export const actualizarIDVenInstantaneasContenedorFinanciero = async (data) => {
    try {

        const origenIDV = data.origenIDV
        const destinoIDV = data.destinoIDV
        const reservasUIDArray = data.reservasUIDArray

        const contenedoresFinancieros = await obtenerDesglosesFinancierosPorReservaUIDARRAY(reservasUIDArray)



        if (origenIDV === destinoIDV) {
            const m = "No se puede actualizar un orgienIDV y un destinoIDV siendo el mismo, podría provocar problema de integridad en el contenedor financiero."

        }
        for (const contenedor of contenedoresFinancieros) {
            const componenteUID = contenedor.componenteUID
            const reservaUID = Number(contenedor.reservaUID)
            const instantaneaNoches = contenedor.instantaneaNoches || {}
            const instantaneaSobreControlPrecios = contenedor.instantaneaSobreControlPrecios || {}
            const instantaneaOfertasPorCondicion = contenedor.instantaneaOfertasPorCondicion || []
            const instantaneaOfertasPorAdministrador = contenedor.instantaneaOfertasPorAdministrador || []
            for (const contenedorOferta of instantaneaOfertasPorAdministrador) {
                const oferta = contenedorOferta.oferta
                actualizaApartamentoIDVEnObjetoOfertas({
                    contenedorOferta: oferta,
                    origenIDV,
                    destinoIDV
                })
            }

            for (const contenedorOferta of instantaneaOfertasPorCondicion) {
                const oferta = contenedorOferta.oferta
                actualizaApartamentoIDVEnObjetoOfertas({
                    contenedorOferta: oferta,
                    origenIDV,
                    destinoIDV
                })
            }

            for (const sobreControl of Object.values(instantaneaSobreControlPrecios)) {
                Object.keys(sobreControl).forEach((apartamentoIDV) => {
                    if (apartamentoIDV === origenIDV) {
                        const contenedor = sobreControl[apartamentoIDV]
                        delete sobreControl[apartamentoIDV]
                        sobreControl[destinoIDV] = contenedor
                    }
                })
            }

            for (const contenedorNoche of Object.values(instantaneaNoches)) {
                const apartamentosPorNoche = contenedorNoche.apartamentosPorNoche;
                for (const [apartamentoIDV, contenedorApartamento] of Object.entries(apartamentosPorNoche)) {
                    const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                        apartamentoIDV: destinoIDV,
                        errorSi: "noExiste"
                    });
                    contenedorApartamento.apartamentoUI = apartamento.apartamentoUI
                    apartamentosPorNoche[destinoIDV] = contenedorApartamento
                    delete apartamentosPorNoche[apartamentoIDV]
                }
            }
            await actualizarDesgloseFinacieroPorModoSimplePorReservaUID({
                componenteUID,
                instantaneaNoches,
                instantaneaOfertasPorCondicion,
                instantaneaSobreControlPrecios,
                instantaneaOfertasPorAdministrador,
            })
            await actualizadorIntegradoDesdeInstantaneas(reservaUID)
        }
    } catch (error) {
        throw error
    }

}