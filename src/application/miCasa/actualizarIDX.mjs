import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../shared/validadores/validadoresCompartidos.mjs";
import { eliminarUsuarioPorRolPorEstadoVerificacion } from "../../infraestructure/repository/usuarios/eliminarUsuarioPorRolPorEstadoVerificacion.mjs";
import { obtenerUsuario } from "../../infraestructure/repository/usuarios/obtenerUsuario.mjs";
import { campoDeTransaccion } from "../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { actualizarIDX as actualizarIDV_ } from "../../infraestructure/repository/usuarios/actualizarIDX.mjs";
import { usuariosLimite } from "../../shared/usuarios/usuariosLimite.mjs";
import { actualizarUsuarioSessionActiva } from "../../infraestructure/repository/usuarios/actualizarSessionActiva.mjs";
import { validadorIDX } from "../../shared/VitiniIDX/validadorIDX.mjs";

export const actualizarIDX = async (entrada) => {
    const mutex = new Mutex()
    try {
        mutex.acquire()
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.control()

        const actualIDX = entrada.session.usuario;

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })

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
        await validadorIDX(nuevoIDX)
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
