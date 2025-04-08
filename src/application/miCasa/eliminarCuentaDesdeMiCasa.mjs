import { Mutex } from "async-mutex";
import { obtenerUsuario } from "../../infraestructure/repository/usuarios/obtenerUsuario.mjs";
;
import { vitiniCrypto } from "../../shared/VitiniIDX/vitiniCrypto.mjs";
import { obtenerAdministradores } from "../../infraestructure/repository/usuarios/obtenerAdministradores.mjs";
import { eliminarUsuario } from "../../infraestructure/repository/usuarios/eliminarUsuario.mjs";
import { eliminarSessionPorUsuario } from "../../infraestructure/repository/sessiones/eliminarSessionPorUsuario.mjs";
import { campoDeTransaccion } from "../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { validadoresCompartidos } from "../../shared/validadores/validadoresCompartidos.mjs";
import { adminControlIntegrity } from "../../shared/secOps/adminControlIntegrity.mjs";

export const eliminarCuentaDesdeMiCasa = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })

        const usuarioIDX = entrada.session.usuario;
        const clave = entrada.body.clave;

        if (!clave) {
            const error = "No has escrito tu contraseña. Es necesaria para eliminar tu cuenta.";
            throw new Error(error);
        }
        mutex.acquire()
        await campoDeTransaccion("iniciar")

        const cuentaDeUsuario = await obtenerUsuario({
            usuario: usuarioIDX,
            errorSi: "noExiste"
        })
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
            const error = "Revisa la contraseña actual que has escrito porque no es correcta, por lo tanto, no se puede eliminar tu cuenta";
            throw new Error(error);
        }

        await adminControlIntegrity({
            usuario: usuarioIDX,
            contexto: "cuentas"
        })


        await eliminarUsuario(usuarioIDX)
        await eliminarSessionPorUsuario(usuarioIDX)
        await campoDeTransaccion("confirmar")
        entrada.session.destroy();
        salida.clearCookie("VitiniID");
        const ok = {
            ok: "Se ha eliminado correctamente la cuenta"
        }
        return ok

    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }

}