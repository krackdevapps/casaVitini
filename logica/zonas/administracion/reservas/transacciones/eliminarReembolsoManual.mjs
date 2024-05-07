import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

export const eliminarReembolsoManual = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const palabra = validadoresCompartidos.tipos.cadena({
            string: entrada.body.palabra,
            nombreCampo: "El campo de la palabra",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        if (palabra !== "eliminar") {
            const error = "Necesario escribir la la palabra eliminar para confirmar la eliminación y evitar falsos clicks";
            throw new Error(error);
        }
        const reembolsoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reembolsoUID,
            nombreCampo: "El campo reembolsoUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        await conexion.query('BEGIN'); // Inicio de la transacción
        const consultaEliminarReembolso = `
                            DELETE FROM "reservaReembolsos"
                            WHERE "reembolsoUID" = $1;
                            `;
        const resuelveEliminarReembolso = await conexion.query(consultaEliminarReembolso, [reembolsoUID]);
        if (resuelveEliminarReembolso.rowCount === 0) {
            const error = "No se encuentra el reembolso con ese identificador, revisa el reembolsoUID";
            throw new Error(error);
        }
        if (resuelveEliminarReembolso.rowCount === 1) {
            const ok = {
                ok: "Se ha eliminado irreversiblemente el el reembolso",
                reembolsoUID: reembolsoUID
            };
            salida.json(ok);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}