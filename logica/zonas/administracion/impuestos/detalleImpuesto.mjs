import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerImpuestosPorImppuestoUID } from "../../../repositorio/impuestos/obtenerImpuestosPorImpuestoUID.mjs";

export const detalleImpuesto = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const impuestoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.impuestoUID,
            nombreCampo: "El  impuestoUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
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