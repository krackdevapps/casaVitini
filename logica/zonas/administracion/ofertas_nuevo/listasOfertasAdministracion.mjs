import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerApartamentosDeLaOfertaPorOfertaUID } from "../../../repositorio/ofertas/obtenerApartamentosDeLaOfertaPorOfertaUID.mjs";
import { obtenerTodasLasOfertas } from "../../../repositorio/ofertas/obtenerTodasLasOfertas.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

export const listasOfertasAdministracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const listaDeOfertas = await obtenerTodasLasOfertas()
        for (const ofertaDetalles of listaDeOfertas) {
            const uid = ofertaDetalles.uid;
            const tipoOferta = ofertaDetalles.tipoOferta;
            const descuentoAplicadoA = ofertaDetalles.descuentoAplicadoA;
            ofertaDetalles.apartamentosDedicados = [];

            if (tipoOferta === "porApartamentosEspecificos") {
                const apartamentosDeLaOferta = await obtenerApartamentosDeLaOfertaPorOfertaUID(uid)

                for (const apartamento of apartamentosDeLaOferta) {
                    const apartamentoIDV = apartamento.apartamentoIDV;
                    const apartamentoUI = obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV);
                    const tipoDescuentoApartamento = apartamento.tipoDescuento;
                    const cantidadApartamento = apartamento.cantidad;
                    const detallesApartamentoDedicado = {
                        apartamentoIDV: apartamentoIDV,
                        apartamentoUI: apartamentoUI,
                        tipoDescuento: tipoDescuentoApartamento,
                        cantidadApartamento: cantidadApartamento
                    };
                    ofertaDetalles.apartamentosDedicados.push(detallesApartamentoDedicado);
                }
            }
        }
        const ok = {
            ok: ofertas
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}