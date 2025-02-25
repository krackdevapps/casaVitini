import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { obtenerImpuestosPorNombreDelImpuesto } from "../../../infraestructure/repository/impuestos/obtenerImpuestosPorNombreDelImpuesto.mjs";
import { insertarImpuesto } from "../../../infraestructure/repository/impuestos/insertarImpuesto.mjs";
import { validarImpuesto } from "../../../shared/impuestos/validarImpuesto.mjs";

export const crearNuevoImpuesto = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        await mutex.acquire();

        const impuesto = entrada.body
        const impuestoValidado = validarImpuesto(impuesto)
        const nombreImpuesto = impuestoValidado.nombre

        const impuestosPorNombre = await obtenerImpuestosPorNombreDelImpuesto(nombreImpuesto)
        if (impuestosPorNombre.length > 0) {
            const error = "YYa existe un impuesto con ese nombre exacto. Por favor, selecciona otro nombre para este impuesto con el fin de tener nombres únicos en los impuestos y poder distinguirlos correctamente.";
            throw new Error(error);
        }
        impuestoValidado.estadoIDV = "desactivado"
        const nuevoImpuesto = await insertarImpuesto(impuestoValidado)
        const ok = {
            ok: "Se ha creado el nuevo impuesto",
            nuevoImpuestoUID: nuevoImpuesto.impuestoUID
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}