import { conexion } from "../../componentes/db.mjs";
import { VitiniIDX } from "../../sistema/VitiniIDX/control.mjs";
import { vitiniCrypto } from "../../sistema/VitiniIDX/vitiniCrypto.mjs";
import { filtroError } from "../../sistema/error/filtroError.mjs";

export const eliminarCuentaDesdeMiCasa = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        if (IDX.control()) return  

        const usuarioIDX = entrada.session.usuario;
        const clave = entrada.body.clave;

        if (!clave) {
            const error = "No has escrito tu contrasena. Es necesaria para eliminar tu cuenta";
            throw new Error(error);
        }
        await conexion.query('BEGIN'); // Inicio de la transacción
        const obtenerClaveActualHASH = `
                SELECT 
                clave,
                sal, 
                rol
                FROM usuarios
                WHERE usuario = $1;
                `;
        const resuelveObtenerClaveActualHASH = await conexion.query(obtenerClaveActualHASH, [usuarioIDX]);
        if (resuelveObtenerClaveActualHASH.rowCount === 0) {
            const error = "No existe el usuario";
            throw new Error(error);
        }
        const claveActualHASH = resuelveObtenerClaveActualHASH.rows[0].clave;
        const sal = resuelveObtenerClaveActualHASH.rows[0].sal;
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
        const rol = resuelveObtenerClaveActualHASH.rows[0].rol;
        const rolAdministrador = "administrador";
        if (rol === rolAdministrador) {
            const validarUltimoAdministrador = `
                    SELECT 
                    rol
                    FROM usuarios
                    WHERE rol = $1;
                    `;
            const resuelValidarUltimoAdministrador = await conexion.query(validarUltimoAdministrador, [rolAdministrador]);
            if (resuelValidarUltimoAdministrador.rowCount === 1) {
                const error = "No se puede eliminar esta cuenta por que es la unica cuenta adminsitradora existente. Si quieres eliminar esta cuenta tienes que crear otra cuenta administradora. Por que en el sistema debe de existir al menos una cuenta adminitrador";
                throw new Error(error);
            }
        }
        const eliminarCuenta = `
                DELETE FROM usuarios
                WHERE usuario = $1;
                `;
        const resuelveEliminarCuenta = await conexion.query(eliminarCuenta, [usuarioIDX]);
        if (resuelveEliminarCuenta.rowCount === 1) {
            const cerrarSessiones = `
                    DELETE FROM sessiones
                    WHERE sess->> 'usuario' = $1;
                    `;
            await conexion.query(cerrarSessiones, [usuarioIDX]);
            const ok = {
                ok: "Se ha eliminado correctamente la cuenta"
            };
            salida.json(ok);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }

}