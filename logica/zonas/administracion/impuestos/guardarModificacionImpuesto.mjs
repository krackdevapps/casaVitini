import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerImpuestosPorNombreDelImpuesto } from "../../../repositorio/impuestos/obtenerImpuestosPorNombreDelImpuesto.mjs";
import { actualizarImpuesto } from "../../../repositorio/impuestos/actualizarImpuesto.mjs";
import { obtenerImpuestosPorImppuestoUID } from "../../../repositorio/impuestos/obtenerImpuestosPorImpuestoUID.mjs";
import { validarImpuesto } from "./validarImpuesto.mjs";

export const guardarModificacionImpuesto = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        await mutex.acquire();

        const impuestoUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.impuestoUID,
            nombreCampo: "El UID del impuesto",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const impuesto = entrada.body
        const impuestoValidado = validarImpuesto(impuesto)
        const nombreImpuesto = impuestoValidado.nombre
        impuestoValidado.impuestoUID = impuestoUID

        const impuestosPorNombre = await obtenerImpuestosPorNombreDelImpuesto(nombreImpuesto)
        for (const detallesDelImpuesto of impuestosPorNombre) {
            if (detallesDelImpuesto.impuestoUID !== impuestoUID) {
                const error = "Ya existe un impuesto con ese nombre exacto. Por favor selecciona otro nombre para este impuesto con el fin de tener nombres unicos en los impuestos y poder distingirlos correctamente.";
                throw new Error(error);
            }
        }
        const impuestoActualizado = await actualizarImpuesto(impuestoValidado)

        const ok = {
            ok: "El impuesto se ha actualizado correctamente",
            detallesImpuesto: impuestoActualizado
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