export const actualizaApartamentoIDVEnObjetoOfertas = (data) => {
    try {

        const contenedorOferta = data.contenedorOferta
        const origenIDV = data.origenIDV
        const destinoIDV = data.destinoIDV

        const contenedorDescuentos = contenedorOferta?.descuentosJSON || {}
        const tipoDescuento = contenedorDescuentos.tipoDescuento
        if (tipoDescuento === "individualPorApartamento") {
            const contenedorApartamentos = contenedorDescuentos.apartamentos
            for (const apartamento of contenedorApartamentos) {
                const apartamentoIDV = apartamento.apartamentoIDV
                if (apartamentoIDV === origenIDV) {
                    apartamento.apartamentoIDV = destinoIDV
                }
            }
        }

        if (tipoDescuento === "porRango") {
            const subTipoDescuento = contenedorDescuentos.subTipoDescuento
            if (subTipoDescuento === "porDiasDelRango") {
                const contenedorDias = contenedorDescuentos.descuentoPorDias
                for (const dia of contenedorDias) {
                    const apartamentos = dia.apartamentos || []
                    for (const apartamento of apartamentos) {
                        const apartamentoIDV = apartamento.apartamentoIDV
                        if (apartamentoIDV === origenIDV) {
                            apartamento.apartamentoIDV = destinoIDV
                        }
                    }
                }
            }
        }

        const contenedorContediciones = contenedorOferta?.condicionesArray || []
        for (const contenedorCondicion of contenedorContediciones) {
            const tipoCondicion = contenedorCondicion.tipoCondicion
            if (tipoCondicion === "porApartamentosEspecificos") {
                const contenedorApartamentosIDV = contenedorCondicion.apartamentos
                for (const contenedorApartamento of contenedorApartamentosIDV) {
                    const apartamentoIDV = contenedorApartamento.apartamentoIDV
                    if (apartamentoIDV === origenIDV) {
                        contenedorApartamento.apartamentoIDV = destinoIDV
                    }
                }
            }
        }

    } catch (errorCapturado) {
        throw errorCapturado
    }
}