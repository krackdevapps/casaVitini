import { obtenerApartamentosDeLaOfertaPorOfertaUID } from "../../../repositorio/ofertas/obtenerApartamentosDeLaOfertaPorOfertaUID.mjs";
import { obtenerTodasLasOfertas } from "../../../repositorio/ofertas/obtenerTodasLasOfertas.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

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
                apartamentosDeLaOferta.map((apartamento) => {
                    const apartamentoIDV = apartamento.apartamentoIDV;
                    const apartamentoUI = apartamento.apartamentoUI;
                    const tipoDescuentoApartamento = apartamento.tipoDescuento;
                    const cantidadApartamento = apartamento.cantidad;
                    const detallesApartamentoDedicado = {
                        apartamentoIDV: apartamentoIDV,
                        apartamentoUI: apartamentoUI,
                        tipoDescuento: tipoDescuentoApartamento,
                        cantidadApartamento: cantidadApartamento
                    };
                    ofertaDetalles.apartamentosDedicados.push(detallesApartamentoDedicado);
                });

            }
        }


        const ok = {
            ok: ofertas
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}