import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const actualizarRolCuenta = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const usuarioIDX = validadoresCompartidos.tipos.cadena({
            string: entrada.body.usuarioIDX,
            nombreCampo: "El nombre de usuario (VitiniIDX)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const nuevoRol = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nuevoRol,
            nombreCampo: "El nombre del rol",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

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
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
    }
}