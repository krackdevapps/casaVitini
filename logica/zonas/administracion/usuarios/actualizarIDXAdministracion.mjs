import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { eliminarCuentasNoVerificadas } from "../../../sistema/VitiniIDX/eliminarCuentasNoVerificadas.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { actualizarUsuarioSessionActiva } from "../../../repositorio/usuarios/actualizarSessionActiva.mjs";

export const actualizarIDXAdministracion = async (entrada, salida) => {
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

        const nuevoIDX = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nuevoIDX,
            nombreCampo: "El nombre de usuario (VitiniIDX)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        await eliminarCuentasNoVerificadas();
        await campoDeTransaccion("iniciar")
        await actualizarIDX({
            usuarioIDX: usuarioIDX,
            nuevoIDX: nuevoIDX
        })
        const sessionActivaActualizada = await actualizarUsuarioSessionActiva({
            usuarioIDX: usuarioIDX,
            nuevoIDX: nuevoIDX
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado el IDX correctamente",
            usuarioIDX: sessionActivaActualizada.usuario
        };
        salida.json(ok);
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}