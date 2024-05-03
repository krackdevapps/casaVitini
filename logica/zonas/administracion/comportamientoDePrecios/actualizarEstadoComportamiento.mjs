import { conexion } from "../../../componentes/db.mjs";
import { mutex } from "../../../puerto.mjs";


export const actualizarEstadoComportamiento = async (entrada, salida) => {
    await mutex.acquire();
    try {
        const comportamientoUID = entrada.body.comportamientoUID;
        const estadoPropuesto = entrada.body.estadoPropuesto;
        const filtroCadena = /^[a-z]+$/;
        if (!comportamientoUID || !Number.isInteger(comportamientoUID) || comportamientoUID <= 0) {
            const error = "El campo comportamientoUID tiene que ser un numero, positivo y entero";
            throw new Error(error);
        }
        if (!estadoPropuesto || !filtroCadena.test(estadoPropuesto) || (estadoPropuesto !== "activado" && estadoPropuesto !== "desactivado")) {
            const error = "El campo estadoPropuesto solo admite minúsculas y nada mas, debe de ser un estado activado o desactivado";
            throw new Error(error);
        }
        // Validar nombre unico oferta
        const validarOferta = `
                            SELECT uid
                            FROM "comportamientoPrecios"
                            WHERE uid = $1;
                            `;
        const resuelveValidarOferta = await conexion.query(validarOferta, [comportamientoUID]);
        if (resuelveValidarOferta.rowCount === 0) {
            const error = "No existe al oferta, revisa el UID introducie en el campo comportamientoUID, recuerda que debe de ser un number";
            throw new Error(error);
        }
        await conexion.query('BEGIN'); // Inicio de la transacción
        const actualizarEstadoOferta = `
                            UPDATE "comportamientoPrecios"
                            SET estado = $1
                            WHERE uid = $2
                            RETURNING estado;
                            `;
        const datos = [
            estadoPropuesto,
            comportamientoUID
        ];
        const resuelveEstadoOferta = await conexion.query(actualizarEstadoOferta, datos);
        const ok = {
            ok: "El estado del comportamiento se ha actualziado correctamente",
            estadoComportamiento: resuelveEstadoOferta.rows[0].estado
        };
        salida.json(ok);
        await conexion.query('COMMIT'); // Confirmar la transacción
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
        mutex.release();
    }
}