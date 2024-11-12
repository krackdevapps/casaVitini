import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerUsuario } from "../../../infraestructure/repository/usuarios/obtenerUsuario.mjs";
import { actualizarRol } from "../../../infraestructure/repository/usuarios/actualizarRol.mjs";
import { actualizarRolSessionActiva } from "../../../infraestructure/repository/usuarios/actualizarRolSessionActiva.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { controlRol } from "../../../shared/usuarios/controlRol.mjs";
import { rolesIDV } from "../../../shared/usuarios/rolesIDV.mjs";

export const actualizarRolCuenta = async (entrada, salida) => {
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
        const nuevoRol = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nuevoRol,
            nombreCampo: "El nombre del nuevoRol",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        await campoDeTransaccion("iniciar")

        await obtenerUsuario({
            usuario: usuarioIDX,
            errorSi: "noExiste"
        })
        await controlRol({
            usuarioOperacion: IDX.vitiniIDX(),
            usuarioDestino: usuarioIDX
        })

        const rolValidado = rolesIDV({
            operacion: "validar",
            rolIDV: nuevoRol
        })
        const rolUI = rolValidado.rolUI;
        const rolIDV = rolValidado.rolIDV;

        if (IDX.rol() !== "administrador") {
            const error = "No estás autorizado a realizar un cambio de rol. Solo los administradores pueden realizar cambios de rol.";
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
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}