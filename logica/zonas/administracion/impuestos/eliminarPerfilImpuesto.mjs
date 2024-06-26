import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerImpuestosPorImppuestoUID } from "../../../repositorio/impuestos/obtenerImpuestosPorImpuestoUID.mjs";
import { eliminarImpuestoPorImpuestoUID } from "../../../repositorio/impuestos/eliminarImpuestoPorImpuestoUID.mjs";

export const eliminarPerfilImpuesto = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        mutex = new Mutex
        await mutex.acquire();

        const impuestoUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.impuestoUID,
            nombreCampo: "El identificador universal del impuesto (impuestoUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        await obtenerImpuestosPorImppuestoUID(impuestoUID)
        await eliminarImpuestoPorImpuestoUID(impuestoUID)
        const ok = {
            ok: "Perfil del impuesto eliminado"
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}