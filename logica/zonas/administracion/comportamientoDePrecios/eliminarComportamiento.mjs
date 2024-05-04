import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

export const eliminarComportamiento = async (entrada, salida) => {
    let mutex
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        mutex = new Mutex()
        await mutex.acquire();

        const comportamientoUID = entrada.body.comportamientoUID;
        if (!comportamientoUID || !Number.isInteger(comportamientoUID) || comportamientoUID <= 0) {
            const error = "El campo ofertaUID tiene que ser un numero, positivo y entero";
            throw new Error(error);
        }
        // Validar nombre unico oferta
        const validarComportamiento = `
                            SELECT uid
                            FROM "comportamientoPrecios"
                            WHERE uid = $1;
                            `;
        const resuelveValidarComportamiento = await conexion.query(validarComportamiento, [comportamientoUID]);
        if (resuelveValidarComportamiento.rowCount === 0) {
            const error = "No existe el comportamiento, revisa el UID introducie en el campo comportamientoUID, recuerda que debe de ser un numero";
            throw new Error(error);
        }
        await conexion.query('BEGIN'); // Inicio de la transacción
        const eliminarComportamiento = `
                            DELETE FROM "comportamientoPrecios"
                            WHERE uid = $1;
                            `;
        const resuelveEliminarComportamiento = await conexion.query(eliminarComportamiento, [comportamientoUID]);
        if (resuelveEliminarComportamiento.rowCount === 1) {
            const ok = {
                ok: "Se ha eliminado el comportamiento correctamente",
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
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}