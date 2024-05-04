import { componentes } from "../../../componentes.mjs";
import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { vitiniCrypto } from "../../../sistema/vitiniCrypto.mjs";


export const crearCuentaDesdeAdministracion = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return  

        const usuarioIDX = entrada.body.usuarioIDX;
        const clave = entrada.body.clave;
        const rol = entrada.body.rol;
        const filtro_minúsculas_numeros = /^[a-z0-9]+$/;
        if (!usuarioIDX || !filtro_minúsculas_numeros.test(usuarioIDX)) {
            const error = "El campo usuarioIDX solo admite minúsculas y numeros y nada mas";
            throw new Error(error);
        }
        if (usuarioIDX === "crear" || usuarioIDX === "buscador") {
            const error = "El nombre de usuario no esta disponbile, escoge otro";
            throw new Error(error);
        }
        if (!rol) {
            const error = "Selecciona un rol para la nueva cuenta de usuario";
            throw new Error(error);
        }
        if (!filtro_minúsculas_numeros.test(rol)) {
            const error = "El campo rol solo admite minúsculas y numeros y nada mas";
            throw new Error(error);
        }
        // validar rol
        const validarRol = `
                            SELECT 
                            rol
                            FROM "usuariosRoles"
                            WHERE rol = $1
                            `;
        const resuelveValidarRol = await conexion.query(validarRol, [rol]);
        if (resuelveValidarRol.rowCount === 0) {
            const error = "No existe el rol, revisa el rol introducido";
            throw new Error(error);
        }
        // comporbar que no exista la el usuario
        const validarNuevoUsuario = `
                            SELECT 
                            usuario
                            FROM usuarios
                            WHERE usuario = $1
                            `;
        const resuelveValidarNuevoUsaurio = await conexion.query(validarNuevoUsuario, [usuarioIDX]);
        if (resuelveValidarNuevoUsaurio.rowCount > 0) {
            const error = "El nombre de usuario no esta disponbile, escoge otro";
            throw new Error(error);
        }
        await componentes.eliminarCuentasNoVerificadas();
        const estadoCuenta = "desactivado";
        await conexion.query('BEGIN'); // Inicio de la transacción
        const cryptoData = {
            sentido: "cifrar",
            clavePlana: clave
        };
        const retorno = vitiniCrypto(cryptoData);
        const nuevaSal = retorno.nuevaSal;
        const hashCreado = retorno.hashCreado;
        const cuentaVerificada = "no";
        const crearNuevoUsuario = `
                            INSERT INTO usuarios
                            (
                            usuario,
                            rol,
                            "estadoCuenta",
                            sal,
                            clave,
                            "cuentaVerificada"
                            )
                            VALUES 
                            ($1, $2, $3, $4, $5, $6)
                            RETURNING
                            usuario
                            `;
        const datosNuevoUsuario = [
            usuarioIDX,
            rol,
            estadoCuenta,
            nuevaSal,
            hashCreado,
            cuentaVerificada
        ];
        const resuelveCrearNuevoUsuario = await conexion.query(crearNuevoUsuario, datosNuevoUsuario);
        if (resuelveCrearNuevoUsuario.rowCount === 0) {
            const error = "No se ha insertado el nuevo usuario en la base de datos";
            throw new Error(error);
        }
        const crearNuevosDatosUsuario = `
                            INSERT INTO "datosDeUsuario"
                            (
                            "usuarioIDX"
                            )
                            VALUES 
                            ($1)
                            `;
        const resuelveCrearNuevosDatosUsuario = await conexion.query(crearNuevosDatosUsuario, [usuarioIDX]);
        if (resuelveCrearNuevosDatosUsuario.rowCount === 0) {
            const error = "No se ha insertado los datos del nuevo usuario";
            throw new Error(error);
        }
        const ok = {
            ok: "Se ha creado el nuevo usuario",
            usuarioIDX: resuelveCrearNuevoUsuario.rows[0].usuario
        };
        salida.json(ok);
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