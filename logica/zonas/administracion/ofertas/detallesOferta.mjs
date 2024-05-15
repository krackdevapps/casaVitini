import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { obtenerOfertaConApartamentos } from "../../../sistema/ofertas/obtenerOfertaConApartamentos.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const detallesOferta = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const ofertaUID = validadoresCompartidos.tipos.numero({
            string: entrada.body.ofertaUID,
            nombreCampo: "El identificador universal de la oferta (ofertaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const detallesOferta = await obtenerOfertaConApartamentos(ofertaUID);
        const ok = {
            ok: detallesOferta
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}