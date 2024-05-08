import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { eliminarCuentasNoVerificadas } from "../../../sistema/VitiniIDX/eliminarCuentasNoVerificadas.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { vitiniCrypto } from "../../../sistema/VitiniIDX/vitiniCrypto.mjs";


export const crearCuentaDesdeAdministracion = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return  

        const clave = entrada.body.clave;
   
        const usuarioIDX = validadoresCompartidos.tipos.cadena({
            string: entrada.body.usuarioIDX,
            nombreCampo: "El nombre de usuario (VitiniIDX)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        if (usuarioIDX === "crear" || usuarioIDX === "buscador") {
            const error = "El nombre de usuario no esta disponbile, escoge otro";
            throw new Error(error);
        }
        const rol = validadoresCompartidos.tipos.cadena({
            string: entrada.body.rol,
            nombreCampo: "El nombre del rol",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
 
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
        await eliminarCuentasNoVerificadas();
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