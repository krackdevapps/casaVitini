import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerImpuestosPorImppuestoUID } from "../../../infraestructure/repository/impuestos/obtenerImpuestosPorImpuestoUID.mjs";

export const detalleImpuesto = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
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
            devuelveUnTipoBigInt: "si"
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