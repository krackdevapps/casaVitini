import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerImpuestosPorImppuestoUID } from "../../../repositorio/impuestos/obtenerImpuestosPorImpuestoUID.mjs";

export const detalleImpuesto = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const impuestoUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.impuestoUID,
            nombreCampo: "El identificador universal del impuesto (impuestoUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
       
        const perfilImpuesto = obtenerImpuestosPorImppuestoUID(impuestoUID)
        const ok = {
            ok: perfilImpuesto
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}