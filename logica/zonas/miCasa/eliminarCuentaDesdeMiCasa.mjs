import { Mutex } from "async-mutex";
import { obtenerUsuario } from "../../repositorio/usuarios/obtenerUsuario.mjs";
import { VitiniIDX } from "../../sistema/VitiniIDX/control.mjs";
import { vitiniCrypto } from "../../sistema/VitiniIDX/vitiniCrypto.mjs";
import { filtroError } from "../../sistema/error/filtroError.mjs";
import { obtenerAdministradores } from "../../repositorio/usuarios/obtenerAdministradores.mjs";
import { eliminarUsuario } from "../../repositorio/usuarios/eliminarUsuario.mjs";
import { eliminarSessionPorUsuario } from "../../repositorio/sessiones/eliminarSessionPorUsuario.mjs";

export const eliminarCuentaDesdeMiCasa = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.control()

        const usuarioIDX = entrada.session.usuario;
        const clave = entrada.body.clave;

        if (!clave) {
            const error = "No has escrito tu contrasena. Es necesaria para eliminar tu cuenta";
            throw new Error(error);
        }
        mutex.acquire()
        await campoDeTransaccion("iniciar")

        const cuentaDeUsuario = await obtenerUsuario(usuarioIDX)
        const claveActualHASH = cuentaDeUsuario.clave;
        const sal = cuentaDeUsuario.sal;
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
        const rol = cuentaDeUsuario.rolIDV;
        const rolAdministrador = "administrador";
        if (rol === rolAdministrador) {
            const adminsitradores = await obtenerAdministradores(rolAdministrador)
            if (adminsitradores.length === 1) {
                const error = "No se puede eliminar esta cuenta por que es la unica cuenta adminsitradora existente. Si quieres eliminar esta cuenta tienes que crear otra cuenta administradora. Por que en el sistema debe de existir al menos una cuenta adminitrador";
                throw new Error(error);
            }
        }
        await eliminarUsuario(usuarioIDX)
        await eliminarSessionPorUsuario(usuarioIDX)
        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "Se ha eliminado correctamente la cuenta"
        };
        salida.json(ok);

    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
        if (mutex) {
            mutex.release()
        }
    }

}