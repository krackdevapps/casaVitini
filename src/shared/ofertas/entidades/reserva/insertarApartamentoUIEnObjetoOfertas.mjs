import { obtenerConfiguracionPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";

export const insertarApartamentoUIEnObjetoOfertas = async (contenedorOferta) => {
    try {
        // Descuentos por apartamentos
        const descuentosPorApartamentos = contenedorOferta?.descuentosJSON?.apartamentos || []

        for (const contenedorApartamento of descuentosPorApartamentos) {
            const apartamentoIDV = contenedorApartamento.apartamentoIDV

            const configuracionAlojamiento = await obtenerConfiguracionPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "desactivado"
            })
            if (configuracionAlojamiento?.apartamentoIDV) {
                contenedorApartamento.apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                    apartamentoIDV,
                    errorSi: "desactivado"
                }))?.apartamentoUI
            } else {
                contenedorApartamento.apartamentoUI = `IDV no reconocido 3(${apartamentoIDV})`
            }
        }
        // Descuentos por dias con apartamentos especificos
        const descuentosPorDiasConApartamentos = contenedorOferta?.descuentosJSON?.descuentoPorDias || []
        for (const contenedorDia of descuentosPorDiasConApartamentos) {

            const contenedorApartametnos = contenedorDia?.apartamentos || []
            for (const contenedorApartamento of contenedorApartametnos) {
                const apartamentoIDV = contenedorApartamento.apartamentoIDV

                const configuracionAlojamiento = await obtenerConfiguracionPorApartamentoIDV({
                    apartamentoIDV,
                    errorSi: "desactivado"
                })
                if (configuracionAlojamiento?.apartamentoIDV) {
                    contenedorApartamento.apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                        apartamentoIDV,
                        errorSi: "desactivado"
                    }))?.apartamentoUI
                } else {
                    contenedorApartamento.apartamentoUI = `IDV no reconocido 2(${apartamentoIDV})`
                }
            }
        }
        const contenedorContediciones = contenedorOferta?.condicionesArray || []
        for (const contenedorCondicion of contenedorContediciones) {

            const tipoCondicion = contenedorCondicion.tipoCondicion
            if (tipoCondicion === "porCodigoDescuento") {
                const codigoDescuento = contenedorCondicion.codigoDescuento
                //contenedorCondicion.codigoDescuento = Buffer.from(codigoDescuento, 'base64').toString('utf-8');
            }

            if (tipoCondicion === "porApartamentosEspecificos") {
                const contenedorApartamentosIDV = contenedorCondicion.apartamentos
                for (const contenedorApartamento of contenedorApartamentosIDV) {
                    const apartamentoIDV = contenedorApartamento.apartamentoIDV
                    const configuracionAlojamiento = await obtenerConfiguracionPorApartamentoIDV({
                        apartamentoIDV,
                        errorSi: "desactivado"
                    })
                    if (configuracionAlojamiento?.apartamentoIDV) {
                        contenedorApartamento.apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                            apartamentoIDV,
                            errorSi: "desactivado"
                        }))?.apartamentoUI
                    } else {
                        contenedorApartamento.apartamentoUI = `IDV no reconocido 1(${apartamentoIDV})`
                    }

                }

            }

        }
        return contenedorOferta
    } catch (errorCapturado) {
        throw errorCapturado
    }
}