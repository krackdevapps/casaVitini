import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";

import { eliminarUsuarioPorRolPorEstadoVerificacion } from "../../repositorio/usuarios/eliminarUsuarioPorRolPorEstadoVerificacion.mjs";
import { obtenerUsuario } from "../../repositorio/usuarios/obtenerUsuario.mjs";
import { campoDeTransaccion } from "../../repositorio/globales/campoDeTransaccion.mjs";
import { actualizarIDX as actualizarIDV_} from "../../repositorio/usuarios/actualizarIDX.mjs";
import { usuariosLimite } from "../../sistema/usuarios/usuariosLimite.mjs";
import { actualizarUsuarioSessionActiva } from "../../repositorio/usuarios/actualizarSessionActiva.mjs";

export const actualizarIDX = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        mutex.acquire()
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.control()

        const actualIDX = entrada.session.usuario;
        const nuevoIDX = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nuevoIDX,
            nombreCampo: "El nombre de usuario (VitiniIDX)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        if (actualIDX === nuevoIDX) {
            const error = "El nuevo VitiniID que has elegido es igual al que ya tienes."
            throw new Error(error)

        }
        console.log("usuari", actualIDX)
        await obtenerUsuario({
            usuario: actualIDX,
            errorSi: "noExiste"
        })
        
        usuariosLimite(nuevoIDX)
        await eliminarUsuarioPorRolPorEstadoVerificacion();
        await campoDeTransaccion("iniciar")

        await obtenerUsuario({
            usuario: nuevoIDX,
            errorSi: "existe"
        })
        await actualizarIDV_({
            usuarioIDX: actualIDX,
            nuevoIDX: nuevoIDX
        })
        await actualizarUsuarioSessionActiva({
            usuarioIDX: actualIDX,
            nuevoIDX: nuevoIDX
        })
        // No ha actualizado la session
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado el IDX correctamente",
            usuarioIDX: nuevoIDX
        };
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
