import { obtenerApartamentosDeLaOfertaPorOfertaUID } from "../../repositorio/ofertas/obtenerApartamentosDeLaOfertaPorOfertaUID.mjs"
import { obtenerOferatPorOfertaUID } from "../../repositorio/ofertas/obtenerOfertaPorOfertaUID.mjs"
export const obtenerOfertaConApartamentos = async (ofertaUID) => {
    try {
        const oferta = await obtenerOferatPorOfertaUID(ofertaUID)
        const tipoOferata = oferta.tipoOfertaIDV
        if (tipoOferata === "porApartamentosEspecificos") {
            oferta["apartamentosDedicados"] = []
            const apartamentosDeLaOferta = await obtenerApartamentosDeLaOfertaPorOfertaUID(ofertaUID)
            oferta["apartamentosDedicados"] = []
            apartamentosDeLaOferta.map((apartamento) => {
                const apartamentoIDV = apartamento.apartamentoIDV
                const apartamentoUI = apartamento.apartamentoUI
                const tipoDescuentoApartamento = apartamento.tipoDescuento
                const cantidadApartamento = apartamento.cantidad
                const detallesApartamentoDedicado = {
                    apartamentoIDV: apartamentoIDV,
                    apartamentoUI: apartamentoUI,
                    tipoDescuento: tipoDescuentoApartamento,
                    cantidadApartamento: cantidadApartamento
                }
                oferta["apartamentosDedicados"].push(detallesApartamentoDedicado)
            })
        }
        return oferta
    } catch (error) {
        throw error
    }
}
