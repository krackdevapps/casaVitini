
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerImpuestosPorImppuestoUID } from "../../../infraestructure/repository/impuestos/obtenerImpuestosPorImpuestoUID.mjs";

export const detalleImpuesto = async (entrada) => {
    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const impuestoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.impuestoUID,
            nombreCampo: "El  impuestoUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })

        const perfilImpuesto = await obtenerImpuestosPorImppuestoUID(impuestoUID)
        const ok = {
            ok: perfilImpuesto
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}