import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerImpuestosPorImppuestoUID } from "../../../infraestructure/repository/impuestos/obtenerImpuestosPorImpuestoUID.mjs";
import { eliminarImpuestoPorImpuestoUID } from "../../../infraestructure/repository/impuestos/eliminarImpuestoPorImpuestoUID.mjs";

export const eliminarPerfilImpuesto = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        await mutex.acquire();

        const impuestoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.impuestoUID,
            nombreCampo: "El UID del impuesto",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
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