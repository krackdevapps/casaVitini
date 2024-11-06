import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs"
import { actualizarDesgloseFinacieroPorModoSimplePorSimulacionUID } from "../../../infraestructure/repository/simulacionDePrecios/actualizarDesgloseFinacieroPorModoSimplePorSimulacionUID.mjs"
import { obtenerTodasLasSimulaciones } from "../../../infraestructure/repository/simulacionDePrecios/obtenerTodasLasSimulaciones.mjs"
import { generarDesgloseSimpleGuardarlo } from "../../simuladorDePrecios/generarDesgloseSimpleGuardarlo.mjs"
import { actualizaApartamentoIDVEnObjetoOfertas } from "./actualizaApartamentoIDVEnObjetoOfertas.mjs"

export const actualizarIDVenInstantaneasContenedorFinancieroDeSimulacion = async (data) => {
    try {
        const origenIDV = data.origenIDV
        const destinoIDV = data.destinoIDV
        const contenedoresFinancierosSimulaciones = await obtenerTodasLasSimulaciones()

        for (const contenedor of contenedoresFinancierosSimulaciones) {
            const simulacionUID = contenedor.simulacionUID
            const fechaCreacion = contenedor.fechaCreacion
            const fechaEntrada = contenedor.fechaEntrada
            const fechaSalida = contenedor.fechaSalida

            if (!fechaCreacion || !fechaEntrada || fechaSalida) {
                continue
            }

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

            await actualizarDesgloseFinacieroPorModoSimplePorSimulacionUID({
                simulacionUID,
                instantaneaNoches,
                instantaneaOfertasPorCondicion,
                instantaneaSobreControlPrecios,
                instantaneaOfertasPorAdministrador,
            })
            await generarDesgloseSimpleGuardarlo(simulacionUID)
        }
    } catch (error) {
        throw error
    }

}