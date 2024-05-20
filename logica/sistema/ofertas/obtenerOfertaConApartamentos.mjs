import { obtenerNombreApartamentoUI } from "../../repositorio/arquitectura/obtenerNombreApartamentoUI.mjs"
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
            for (const apartamento of apartamentosDeLaOferta) {
                const apartamentoIDV = apartamento.apartamentoIDV
                const apartamentoUI = await obtenerNombreApartamentoUI(apartamentoIDV)
                const tipoDescuentoApartamento = apartamento.tipoDescuento
                const cantidadApartamento = apartamento.cantidad
                const detallesApartamentoDedicado = {
                    apartamentoIDV: apartamentoIDV,
                    apartamentoUI: apartamentoUI,
                    tipoDescuento: tipoDescuentoApartamento,
                    cantidadApartamento: cantidadApartamento
                }
                oferta["apartamentosDedicados"].push(detallesApartamentoDedicado)
            }


        }
        return oferta
    } catch (error) {
        throw error
    }
}
