import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const eliminarPerfilImpuesto = async (entrada, salida) => {
    let mutex
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
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}