import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs"
import { actualizarDesgloseFinacieroPorModoSimplePorReservaUID } from "../../../repositorio/reservas/transacciones/desgloseFinanciero/actualizarDesgloseFinacieroPorModoSimplePorReservaUID.mjs"
import { actualizarDesgloseFinacieroPorReservaUID } from "../../../repositorio/reservas/transacciones/desgloseFinanciero/actualizarDesgloseFinacieroPorReservaUID.mjs"
import { obtenerDesglosesFinancierosPorReservaUIDARRAY } from "../../../repositorio/reservas/transacciones/desgloseFinanciero/obtenerDesglosesFinancierosPorReservaUIDARRAY.mjs"
import { procesador } from "../../contenedorFinanciero/procesador.mjs"
import { actualizaApartamentoIDVEnObjetoOfertas } from "./actualizaApartamentoIDVEnObjetoOfertas.mjs"

export const actualizarIDVenInstantaneasContenedorFinanciero = async (data) => {

    try {
        // Obtener todas lsa ofertas
        const origenIDV = data.origenIDV
        const destinoIDV = data.destinoIDV
        const reservasUIDArray = data.reservasUIDArray

        // Extraer contenedorFinanciero
        const contenedoresFinancieros = await obtenerDesglosesFinancierosPorReservaUIDARRAY(reservasUIDArray)
        // Actualizar los IDV de las instantena
        if (origenIDV === destinoIDV) {
            const m = "No se puede actualizar un orgienIDV y un destinoIDV siendo el mismo podria provocar problema de integridad en el contenedor financiero"
          //  throw new Error(m)
        }
        // Actualizar contenedorFinacniero

        // reconstruir desglose financiero

        // En condiciones hay que actualizar los IDV de la condicon por apartamento especificos
        for (const contenedor of contenedoresFinancieros) {
            const componenteUID = contenedor.componenteUID
            const reservaUID =  Number(contenedor.reservaUID)
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
            // Faltaria recontruir el desglose financiero desde instantaneas una vez estan las instantaneas actualizadas


            const desgloseFinanciero = await procesador({
                entidades: {
                    reserva: {
                        tipoOperacion: "actualizarDesgloseFinancieroDesdeInstantaneas",
                        reservaUID: reservaUID
                    }
                },
            })
            await actualizarDesgloseFinacieroPorReservaUID({
                desgloseFinanciero,
                reservaUID
            })
        }
    } catch (error) {
        throw error
    }

}