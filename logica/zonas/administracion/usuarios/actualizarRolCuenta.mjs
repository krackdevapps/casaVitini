import { conexion } from "../../../componentes/db.mjs";


export const actualizarRolCuenta = async (entrada, salida) => {
    try {
        const usuarioIDX = entrada.body.usuarioIDX;
        const nuevoRol = entrada.body.nuevoRol;
        const filtro_minúsculas_numeros = /^[a-z0-9]+$/;
        if (!usuarioIDX || !filtro_minúsculas_numeros.test(usuarioIDX)) {
            const error = "El campo usuarioIDX solo admite minúsculas y numeros";
            throw new Error(error);
        }
        if (!nuevoRol || !filtro_minúsculas_numeros.test(nuevoRol)) {
            const error = "El rolIDX solo admine minúsculas y numeros y nada mas";
            throw new Error(error);
        }
        await conexion.query('BEGIN'); // Inicio de la transacción


        // Validas usaurios
        const validarUsuario = `
                            SELECT 
                            usuario
                            FROM usuarios
                            WHERE usuario = $1;
                            `;
        const resuelveValidarUsuario = await conexion.query(validarUsuario, [usuarioIDX]);
        if (resuelveValidarUsuario.rowCount === 0) {
            const error = "No existe el usuarios";
            throw new Error(error);
        }
        // Validar rol
        const validarRol = `
                            SELECT 
                            "rolUI",
                            rol
                            FROM "usuariosRoles"
                            WHERE rol = $1;
                            `;
        const resuelveValidarRol = await conexion.query(validarRol, [nuevoRol]);
        if (resuelveValidarRol.rowCount === 0) {
            const error = "No existe el rol";
            throw new Error(error);
        }
        const rolUI = resuelveValidarRol.rows[0].rolUI;
        const rolIDV = resuelveValidarRol.rows[0].rol;
        // Validar que el usuario que hace el cambio sea administrador
        const IDXActor = entrada.session.usuario;
        const validarIDXActor = `
                            SELECT 
                            rol
                            FROM usuarios
                            WHERE usuario = $1;
                            `;
        const resuelveValidarIDXActor = await conexion.query(validarIDXActor, [IDXActor]);
        if (resuelveValidarIDXActor.rowCount === 0) {
            const error = "No existe el usuario de origen que intenta realizar esta operacion.";
            throw new Error(error);
        }
        const rolActor = resuelveValidarIDXActor.rows[0].rol;
        if (rolActor !== "administrador") {
            const error = "No estas autorizado a realizar un cambio de rol. Solo los Administradores pueden realizar cambios de rol";
            throw new Error(error);
        }
        const actualizarRol = `
                            UPDATE
                            usuarios
                            SET
                            rol = $1
                            WHERE
                            usuario = $2;
                            `;
        const resuelveActualizarRol = await conexion.query(actualizarRol, [nuevoRol, usuarioIDX]);
        if (resuelveActualizarRol.rowCount === 0) {
            const error = "No se ha podido actualizar el rol de este usuario";
            throw new Error(error);
        }
        // Actualizar la fila sessiones
        const consultaActualizarSessionesActuales = `
                            UPDATE sessiones
                            SET sess = jsonb_set(sess::jsonb, '{rol}', to_jsonb($2::text))
                            WHERE sess->>'usuario' = $1;`;
        await conexion.query(consultaActualizarSessionesActuales, [usuarioIDX, nuevoRol]);
        const ok = {
            ok: "Se ha actualizado el rol en esta cuenta",
            rolIDV: rolIDV,
            rolUI: rolUI
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
    }
}