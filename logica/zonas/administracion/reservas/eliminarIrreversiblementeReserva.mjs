import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { vitiniCrypto } from "../../../sistema/vitiniCrypto.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

export const eliminarIrreversiblementeReserva = async (entrada, salida) => {
    let mutex

    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        mutex = new Mutex();
        await mutex.acquire();

        const reserva = entrada.body.reserva;
        const clave = entrada.body.clave;
        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
            throw new Error(error);
        }
        if (!clave) {
            const error = "No has enviado la clave de tu usuario para confirmar la operacion";
            throw new Error(error);
        }
        const usuarioIDX = entrada.session.usuario;
        await conexion.query('BEGIN'); // Inicio de la transacción
        const obtenerClaveActualHASH = `
                        SELECT 
                        clave,
                        sal, 
                        rol
                        FROM usuarios
                        WHERE usuario = $1;
                        `;
        const resuelveVitniID = await conexion.query(obtenerClaveActualHASH, [usuarioIDX]);
        if (resuelveVitniID.rowCount === 0) {
            const error = "No existe el usuario";
            throw new Error(error);
        }
        const claveActualHASH = resuelveVitniID.rows[0].clave;
        const sal = resuelveVitniID.rows[0].sal;
        const metadatos = {
            sentido: "comparar",
            clavePlana: clave,
            sal: sal,
            claveHash: claveActualHASH
        };
        const controlClave = vitiniCrypto(metadatos);
        if (!controlClave) {
            const error = "Revisa la contrasena actual que has escrito por que no es correcta por lo tanto no se puede eliminar tu cuenta";
            throw new Error(error);
        }
        // Validar si es un usuario administrador
        const rol = resuelveVitniID.rows[0].rol;
        const rolAdministrador = "administrador";
        if (rol !== rolAdministrador) {
            const error = "Tu cuenta no esta autorizada para eliminar reservas. Puedes cancelar reservas pero no eliminarlas.";
            throw new Error(error);
        }
        const validacionReserva = `
                        SELECT 
                        reserva
                        FROM reservas
                        WHERE reserva = $1
                        `;
        const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
        if (resuelveValidacionReserva.rowCount === 0) {
            const error = "No existe la reserva, revisa el identificador de la reserva por que el que has enviado no existe";
            throw new Error(error);
        }
        const consultaElimianrReserva = `
                        DELETE FROM reservas
                        WHERE reserva = $1;
                        `;
        const resuelveEliminarReserva = await conexion.query(consultaElimianrReserva, [reserva]);
        if (resuelveEliminarReserva.rowCount === 0) {
            const error = "No se encuentra la reserva";
            throw new Error(error);
        }
        if (resuelveEliminarReserva.rowCount === 1) {
            const ok = {
                ok: "Se ha eliminado la reserva y su informacion asociada de forma irreversible"
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