import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { obtenerOfertaConApartamentos } from "../../../sistema/ofertas/obsoleto/obtenerOfertaConApartamentos.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";


export const detallesOferta = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const ofertaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.ofertaUID,
            nombreCampo: "El identificador universal de la reserva (ofertaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
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