import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerUsuario } from "../../../repositorio/usuarios/obtenerUsuario.mjs";
import { obtenerRol } from "../../../repositorio/usuarios/obtenerRol.mjs";
import { actualizarRol } from "../../../repositorio/usuarios/actualizarRol.mjs";
import { actualizarRolSessionActiva } from "../../../repositorio/usuarios/actualizarRolSessionActiva.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";

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
        await campoDeTransaccion("iniciar")
        // Validas usaurios
        await obtenerUsuario(usuarioIDX)
        // Validar rol
        const rolValidado = await obtenerRol(usuarioIDX)
        const rolUI = rolValidado.rolUI;
        const rolIDV = rolValidado.rolIDV;
        // Validar que el usuario que hace el cambio sea administrador
        if (IDX.rol() !== "administrador") {
            const error = "No estas autorizado a realizar un cambio de rol. Solo los Administradores pueden realizar cambios de rol";
            throw new Error(error);
        }
        await actualizarRol({
            usuarioIDX: usuarioIDX,
            nuevoRol: nuevoRol
        })
        await actualizarRolSessionActiva({
            usuarioIDX: usuarioIDX,
            nuevoRol: nuevoRol
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado el rol en esta cuenta",
            rolIDV: rolIDV,
            rolUI: rolUI
        };
        salida.json(ok);
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}