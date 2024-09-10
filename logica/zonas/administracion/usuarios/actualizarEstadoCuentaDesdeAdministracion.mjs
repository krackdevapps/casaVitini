import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerUsuario } from "../../../repositorio/usuarios/obtenerUsuario.mjs";
import { eliminarSessionUsuario } from "../../../repositorio/usuarios/eliminarSessionUsuario.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";
import { actualizarEstadoCuenta } from "../../../repositorio/usuarios/actualizarEstadoCuenta.mjs";

export const actualizarEstadoCuentaDesdeAdministracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })

        const usuarioIDX = validadoresCompartidos.tipos.cadena({
            string: entrada.body.usuarioIDX,
            nombreCampo: "El nombre de usuario (VitiniIDX)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        const nuevoEstado = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nuevoEstado,
            nombreCampo: "El campo de nuevo estado",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        if (nuevoEstado !== "activado" && nuevoEstado !== "desactivado") {
            const error = "El campo nuevoEstado solo puede ser activado o desactivado";
            throw new Error(error);
        }
        const cuentaIDX = await obtenerUsuario({
            usuario: usuarioIDX,
            errorSi: "noExiste"
        })

        if (!cuentaIDX.clave) {
            const error = "No se puede activar una cuenta que carece de contraseña. Por favor, establece una contraseña primero.";
            throw new Error(error);
        }
        await campoDeTransaccion("iniciar")
        await actualizarEstadoCuenta({
            usuario: usuarioIDX,
            estadoCuentaIDV: nuevoEstado,
        })
        if (nuevoEstado !== "desactivado") {
            await eliminarSessionUsuario(usuarioIDX)
        }
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado el estado de la cuenta",
            estadoCuenta: nuevoEstado
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}