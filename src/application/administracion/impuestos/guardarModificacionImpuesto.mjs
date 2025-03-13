import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { actualizarImpuesto } from "../../../infraestructure/repository/impuestos/actualizarImpuesto.mjs";
import { obtenerImpuestosPorNombreDelImpuestoIgnorandoImpuestoUID } from "../../../infraestructure/repository/impuestos/obtenerImpuestosPorNombreDelImpuestoIgnorandoImpuestoUID.mjs";
import { validarImpuesto } from "../../../shared/impuestos/validarImpuesto.mjs";

export const guardarModificacionImpuesto = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        await mutex.acquire();

        const impuestoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.impuestoUID,
            nombreCampo: "El UID del impuesto",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })

        const impuesto = entrada.body
        const impuestoValidado = validarImpuesto(impuesto)
        const nombreImpuesto = impuestoValidado.nombre
        impuestoValidado.impuestoUID = impuestoUID


        const impuestosPorNombre = await obtenerImpuestosPorNombreDelImpuestoIgnorandoImpuestoUID({
            nombre: nombreImpuesto,
            impuestoUID
        })
        if (impuestosPorNombre.length > 0) {
            if (detallesDelImpuesto.impuestoUID !== impuestoUID) {
                const error = "Ya existe un impuesto con ese nombre exacto. Por favor, selecciona otro nombre para este impuesto con el fin de tener nombres únicos en los impuestos y poder distinguirlos correctamente.";
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