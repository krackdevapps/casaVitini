
import { obtenerOfertaConApartamentos } from "../../../shared/ofertas/obsoleto/obtenerOfertaConApartamentos.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";

export const detallesOferta = async (entrada, salida) => {
    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const ofertaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.ofertaUID,
            nombreCampo: "El identificador universal de la reserva (ofertaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })
        const detallesOferta = await obtenerOfertaConApartamentos(ofertaUID);

        detallesOferta.condicionesArray.forEach((condicion) => {
            const tipoCondicion = condicion.tipoCondicion
            if (tipoCondicion === "porCodigoDescuento") {
                const codigoDescuentoB64 = condicion.codigoDescuento
                condicion.codigoDescuento = Buffer.from(codigoDescuentoB64, 'base64').toString('utf-8');
            }
        })
        const ok = {
            ok: detallesOferta
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}