import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { actualizarUsuarioSessionActiva } from "../../../repositorio/usuarios/actualizarSessionActiva.mjs";
import { eliminarUsuarioPorRolPorEstadoVerificacion } from "../../../repositorio/usuarios/eliminarUsuarioPorRolPorEstadoVerificacion.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";
import { actualizarIDX } from "../../../repositorio/usuarios/actualizarIDX.mjs";
import { usuariosLimite } from "../../../sistema/usuarios/usuariosLimite.mjs";
import { obtenerUsuario } from "../../../repositorio/usuarios/obtenerUsuario.mjs";

export const actualizarIDXAdministracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const usuarioIDX = validadoresCompartidos.tipos.cadena({
            string: entrada.body.usuarioIDX,
            nombreCampo: "El usuarioIDX",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const nuevoIDX = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nuevoIDX,
            nombreCampo: "El nombre nuevoIDX",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        await eliminarUsuarioPorRolPorEstadoVerificacion();
        usuariosLimite(nuevoIDX)
        await obtenerUsuario({
            usuario: nuevoIDX,
            errorSi: "existe"
        })




        await campoDeTransaccion("iniciar")
        await actualizarIDX({
            usuarioIDX: usuarioIDX,
            nuevoIDX: nuevoIDX
        })
        await actualizarUsuarioSessionActiva({
            usuarioIDX: usuarioIDX,
            nuevoIDX: nuevoIDX
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado el IDX correctamente",
            usuarioIDX: nuevoIDX
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}