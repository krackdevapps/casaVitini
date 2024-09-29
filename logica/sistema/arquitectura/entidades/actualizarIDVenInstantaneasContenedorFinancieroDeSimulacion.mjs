import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs"
import { actualizarDesgloseFinacieroPorModoSimplePorSimulacionUID } from "../../../repositorio/simulacionDePrecios/actualizarDesgloseFinacieroPorModoSimplePorSimulacionUID.mjs"
import { actualizarDesgloseFinacieroPorSimulacionUID } from "../../../repositorio/simulacionDePrecios/desgloseFinanciero/actualizarDesgloseFinacieroPorSimulacionUID.mjs"
import { obtenerTodasLasSimulaciones } from "../../../repositorio/simulacionDePrecios/obtenerTodasLasSimulaciones.mjs"
import { procesador } from "../../contenedorFinanciero/procesador.mjs"
import { generarDesgloseSimpleGuardarlo } from "../../simuladorDePrecios/generarDesgloseSimpleGuardarlo.mjs"
import { actualizaApartamentoIDVEnObjetoOfertas } from "./actualizaApartamentoIDVEnObjetoOfertas.mjs"

export const actualizarIDVenInstantaneasContenedorFinancieroDeSimulacion = async (data) => {
    try {
        const origenIDV = data.origenIDV
        const destinoIDV = data.destinoIDV
        const contenedoresFinancierosSimulaciones = await obtenerTodasLasSimulaciones()
        if (origenIDV === destinoIDV) {
            const m = "No se puede actualizar un orgienIDV y un destinoIDV siendo el mismo podría provocar problema de integridad en el contenedor financiero."
            //  throw new Error(m)
        }
        for (const contenedor of contenedoresFinancierosSimulaciones) {
            const simulacionUID = contenedor.simulacionUID
            const instantaneaNoches = contenedor.instantaneaNoches || {}
            const instantaneaSobreControlPrecios = contenedor.instantaneaSobreControlPrecios || {}
            const instantaneaOfertasPorCondicion = contenedor.instantaneaOfertasPorCondicion || []
            const instantaneaOfertasPorAdministrador = contenedor.instantaneaOfertasPorAdministrador || []
            const apartamentosIDVARRAY = contenedor.apartamentosIDVARRAY || []

            apartamentosIDVARRAY.forEach((apartamentoIDV, posicion) => {
                if (apartamentoIDV === origenIDV) {
                    apartamentosIDVARRAY[posicion] = destinoIDV;
                }
            })

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

            await actualizarDesgloseFinacieroPorModoSimplePorSimulacionUID({
                simulacionUID,
                instantaneaNoches,
                instantaneaOfertasPorCondicion,
                instantaneaSobreControlPrecios,
                instantaneaOfertasPorAdministrador,
                apartamentosIDVARRAY
            })
            await generarDesgloseSimpleGuardarlo(simulacionUID)
        }
    } catch (error) {
        throw error
    }

}