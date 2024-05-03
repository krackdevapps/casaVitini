import { conexion } from "../../../componentes/db.mjs";
import { mutex } from "../../../puerto.mjs";
export const eliminarPerfilImpuesto = async (entrada, salida) => {
    await mutex.acquire();
    try {
        const impuestoUID = entrada.body.impuestoUID;
        if (typeof impuestoUID !== "number" || !Number.isInteger(impuestoUID) || impuestoUID <= 0) {
            const error = "El campo 'impuestoUID' debe ser un tipo numero, entero y positivo";
            throw new Error(error);
        }
        const validarYEliminarImpuesto = `
                                DELETE FROM impuestos
                                WHERE "impuestoUID" = $1;
                                `;
        const resuelveValidarYEliminarImpuesto = await conexion.query(validarYEliminarImpuesto, [impuestoUID]);
        if (resuelveValidarYEliminarImpuesto.rowCount === 0) {
            const error = "No existe el perfil del impuesto que deseas eliminar";
            throw new Error(error);
        }
        const ok = {
            ok: "Perfil del impuesto eliminado"
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
        mutex.release();
    }

}