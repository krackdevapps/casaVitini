import { conexion } from "../../../componentes/db.mjs";


export const eliminarCuentaDesdeAdministracion = async (entrada, salida) => {
    try {
        const usuarioIDX = entrada.body.usuarioIDX;
        const filtro_minúsculas_numeros = /^[a-z0-9]+$/;
        if (!usuarioIDX || !filtro_minúsculas_numeros.test(usuarioIDX)) {
            const error = "El campo usuarioIDX solo admite minúsculas y numeros";
            throw new Error(error);
        }
        await conexion.query('BEGIN'); // Inicio de la transacción


        // Validar si es un usuario administrador
        const validarTipoCuenta = `
                            SELECT 
                            rol
                            FROM usuarios
                            WHERE usuario = $1;
                            `;
        const resuelveValidarTipoCuenta = await conexion.query(validarTipoCuenta, [usuarioIDX]);
        const rol = resuelveValidarTipoCuenta.rows[0].rol;
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
        const cerrarSessiones = `
                            DELETE FROM sessiones
                            WHERE sess->> 'usuario' = $1;
                            `;
        await conexion.query(cerrarSessiones, [usuarioIDX]);
        const eliminarCuenta = `
                            DELETE FROM usuarios
                            WHERE usuario = $1;
                            `;
        const resuelveEliminarCuenta = await conexion.query(eliminarCuenta, [usuarioIDX]);
        if (resuelveEliminarCuenta.rowCount === 0) {
            const error = "No se encuentra el usuario";
            throw new Error(error);
        }
        if (resuelveEliminarCuenta.rowCount === 1) {
            const ok = {
                ok: "Se ha eliminado correctamente la cuenta de usuario",
            };
            salida.json(ok);
        }
        await conexion.query('COMMIT');
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK');
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
    }
}