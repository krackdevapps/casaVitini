import { conexion } from "../../../../componentes/db.mjs";
export const eliminarReembolsoManual = async (entrada, salida) => {
    try {
        const palabra = entrada.body.palabra;
        const reembolsoUID = entrada.body.reembolsoUID;
        if (palabra !== "eliminar") {
            const error = "Necesario escribir la la palabra eliminar para confirmar el reembolso y evitar falsos clicks.";
            throw new Error(error);
        }
        const filtroPagoUID = /^\d+$/;
        if (!filtroPagoUID.test(reembolsoUID)) {
            const error = "El reembolsoUID debe de ser una cadena con numeros";
            throw new Error(error);
        }
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