import { conexion } from "../../../componentes/db.mjs";
import { vitiniCrypto } from "../../../sistema/vitiniCrypto.mjs";


export const actualizarEstadoCuentaDesdeAdministracion = async (entrada, salida) => {
    try {
        const usuarioIDX = entrada.body.usuarioIDX;
        const nuevoEstado = entrada.body.nuevoEstado;
        const filtro_minúsculas_numeros = /^[a-z0-9]+$/;
        if (!usuarioIDX || !filtro_minúsculas_numeros.test(usuarioIDX)) {
            const error = "El campo usuarioIDX solo admite minúsculas y numeros";
            throw new Error(error);
        }
        if (nuevoEstado !== "activado" && nuevoEstado !== "desactivado") {
            const error = "El campo nuevoEstado solo puede ser activado o desactivado";
            throw new Error(error);
        }
        // validar existencia de contrasena
        const validarClave = `
                            SELECT 
                            clave
                            FROM usuarios
                            WHERE usuario = $1;
                            `;
        const resuelveValidarClave = await conexion.query(validarClave, [usuarioIDX]);
        if (!resuelveValidarClave.rows[0].clave) {
            const error = "No se puede activar una cuenta que carece de contrasena, por favor establece una contrasena primero";
            throw new Error(error);
        }
        await conexion.query('BEGIN'); // Inicio de la transacción
        const actualizarEstadoCuenta = `
                            UPDATE usuarios
                            SET 
                                "estadoCuenta" = $1
                            WHERE 
                                usuario = $2
                            `;
        const datos = [
            nuevoEstado,
            usuarioIDX
        ];
        const resuelveEstadoCuenta = await conexion.query(actualizarEstadoCuenta, datos);
        if (resuelveEstadoCuenta.rowCount === 0) {
            const error = "No se encuentra el usuario";
            throw new Error(error);
        }
        if (resuelveEstadoCuenta.rowCount === 1) {
            if (nuevoEstado !== "desactivado") {
                const cerrarSessiones = `
                                    DELETE FROM sessiones
                                    WHERE sess->> 'usuario' = $1;
                                    `;
                await conexion.query(cerrarSessiones, [usuarioIDX]);
            }
            const ok = {
                ok: "Se ha actualizado el estado de la cuenta",
                estadoCuenta: nuevoEstado
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
    }
}